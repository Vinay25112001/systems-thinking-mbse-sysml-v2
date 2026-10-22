// Fixes of the M2 security/data-integrity review besides H1/M1/M2: validated, quota-bound snapshots (M3), the faculty
// note in its own store (M5), password-change throttling and bounded scrypt work (M6), malformed and duplicate cookies
// (L4), the periodic sweep (L6) and the guarded restore (L7).
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, describe, expect, it } from 'vitest'
import type { ProjectDoc } from '../../src/project/model/types'
import { backup, restore } from '../backup'
import { testConfig, type Config } from '../config'
import { RateLimiter } from '../http/rateLimit'
import { hashPassword, scryptGate, Semaphore, ScryptBusy, verifyPassword } from '../identity/passwords'
import { openStore, sweep } from '../main'
import { migrate, MIGRATIONS } from '../repo/migrations'
import { createTeamProject, startTest, type T } from './helpers'

let t: T | null = null
const dirs: string[] = []
afterEach(async () => {
  await t?.close()
  t = null
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})
const tmp = () => {
  const d = mkdtempSync(join(tmpdir(), 'sls-m2fix-'))
  dirs.push(d)
  return d
}
const ent = (d: ProjectDoc) => Object.values(d.artifacts).find((x) => x.type === 'ENT')!

describe('M3: snapshots are validated, labelled by the server and bounded by a quota', () => {
  async function setup(quota?: Partial<Config['snapshotQuota']>) {
    t = await startTest()
    if (quota) Object.assign(t.config.snapshotQuota, quota)
    const a = await t.signedIn(await t.user('student', 'Team 1', { initials: 'AA' }))
    const ins = await t.signedIn(await t.user('instructor'))
    const r = await createTeamProject(a, await t.team('Team 1'))
    return { a, ins, pid: r.body.doc.project.uid as string, doc: r.body.doc as ProjectDoc }
  }
  it('refuses a document that is not a project (the reviewer’s spoof) and stores nothing', async () => {
    const { a, pid } = await setup()
    const before = (await a.get(`/api/v1/projects/${pid}/snapshots`)).body.snapshots.length
    const r = await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'milestone', label: 'Milestone 1 submission (instructor-approved)', doc: { totally: 'not a project', rev: 999 } })
    expect(r.status).toBe(422)
    expect((await a.get(`/api/v1/projects/${pid}/snapshots`)).body.snapshots.length).toBe(before)
  })
  it('a browser cannot label a version milestone or pre-import: it is stored as manual; rev comes from the server; the list shows who stored it', async () => {
    const { a, ins, pid, doc } = await setup()
    const forged = structuredClone(doc)
    forged.rev = 999
    ent(forged).attributes.approval = { decision: 'approved', decidedOn: '2026-10-01' }
    const r = await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'milestone', label: 'Milestone 1 submission', doc: forged })
    expect(r.status, JSON.stringify(r.body)).toBe(201)
    expect(r.body.kind).toBe('manual')
    expect(r.body.rev).toBe(doc.rev)
    expect((await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'pre-import', label: 'x' })).body.kind).toBe('manual')
    expect((await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'proposal', label: 'x' })).status).toBe(400)
    const list = (await ins.get(`/api/v1/projects/${pid}/snapshots`)).body.snapshots
    expect(list.find((s: { id: string }) => s.id === r.body.id).createdBy).toBe('AA')
    // server-owned fields of the stored version come from the server, not from the supplied document
    const full = (await ins.get(`/api/v1/projects/${pid}/snapshots/${r.body.id}`)).body
    expect(ent(full.doc).attributes.approval).toEqual(ent(doc).attributes.approval)
  })
  it('enforces the per-project count quota: automatic versions are pruned first, then a new version is refused', async () => {
    const { a, pid } = await setup({ count: 4 })
    // the creation snapshot is SNP-001 (manual); add two automatic ones and one manual
    for (const kind of ['auto', 'auto', 'manual']) expect((await a.post(`/api/v1/projects/${pid}/snapshots`, { kind, label: kind })).status).toBe(201)
    const r = await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'manual', label: 'fifth' })
    expect(r.status).toBe(201)
    const kinds = (await a.get(`/api/v1/projects/${pid}/snapshots`)).body.snapshots.map((s: { kind: string }) => s.kind)
    expect(kinds).toHaveLength(4)
    expect(kinds.filter((k: string) => k === 'auto')).toHaveLength(1) // the oldest automatic one went
    await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'manual', label: 'sixth' }) // prunes the last auto
    const full = await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'manual', label: 'seventh' })
    expect(full.status).toBe(413)
    expect(full.body.message).toMatch(/limit of saved versions/)
  })
  it('enforces the byte quota and the per-version size', async () => {
    const { a, pid } = await setup({ perSnapshot: 2000 })
    const big = await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'manual', label: 'too big' })
    expect(big.status).toBe(413)
    t!.config.snapshotQuota.perSnapshot = 1024 * 1024
    const used = (t!.store.db.prepare('SELECT SUM(length(doc)) AS b FROM project_snapshots WHERE project_id = ?').get(pid) as { b: number }).b
    t!.config.snapshotQuota.bytes = used + 100
    expect((await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'manual', label: 'over bytes' })).status).toBe(413)
  })
})

describe('M5: the faculty note lives in its own store', () => {
  it('approval_requests has no note column; the note is in approval_faculty_notes and only the instructor view reads it', async () => {
    t = await startTest()
    const cols = (t.store.db.prepare("SELECT name FROM pragma_table_info('approval_requests')").all() as { name: string }[]).map((c) => c.name)
    expect(cols).not.toContain('private_note')
    const a = await t.signedIn(await t.user('student', 'Team 1'))
    const ins = await t.signedIn(await t.user('instructor'))
    const pid = (await createTeamProject(a, await t.team('Team 1'))).body.doc.project.uid
    const req = await a.post(`/api/v1/projects/${pid}/approval-requests`)
    await ins.post(`/api/v1/approvals/${req.body.approval.id}/decision`, { decision: 'revision-requested', comment: 'c', privateNote: 'NOTE-IN-FACULTY-STORE' })
    const row = t.store.db.prepare('SELECT note FROM approval_faculty_notes WHERE approval_id = ?').get(req.body.approval.id) as { note: string }
    expect(row.note).toBe('NOTE-IN-FACULTY-STORE')
    expect((await ins.get(`/api/v1/projects/${pid}/approval`)).body.approval.privateNote).toBe('NOTE-IN-FACULTY-STORE')
    expect(JSON.stringify((await a.get(`/api/v1/projects/${pid}/approval`)).body)).not.toContain('NOTE-IN-FACULTY-STORE')
  })
  it('migration 2 moves an existing private note out of approval_requests into the faculty table', () => {
    const db = new DatabaseSync(':memory:')
    migrate(db, MIGRATIONS.slice(0, 1))
    db.exec("INSERT INTO teams (id, course_id, label, status, created_by, created_at) VALUES ('t1','default','Team 1','active','x','2026')")
    db.exec("INSERT INTO projects (id, team_id, course_id, doc, doc_rev, version, schema_version, created_at, created_by, updated_at, updated_by) VALUES ('p1','t1','default','{}',1,1,1,'2026','x','2026','x')")
    db.exec("INSERT INTO approval_requests (id, project_id, kind, state, requested_by, requested_at, proposal_snapshot, decided_by, decided_at, decision_comment, private_note) VALUES ('a1','p1','enterprise-proposal','approved','u1','2026-10-01','SNP-002','i1','2026-10-02','ok','OLD-NOTE')")
    db.exec("INSERT INTO approval_requests (id, project_id, kind, state, requested_by, requested_at, proposal_snapshot, supersedes) VALUES ('a2','p1','enterprise-proposal','pending','u1','2026-10-03','SNP-003','a1')")
    expect(migrate(db)).toEqual([2])
    expect(db.prepare('SELECT approval_id, note, author_user_id FROM approval_faculty_notes').all()).toEqual([{ approval_id: 'a1', note: 'OLD-NOTE', author_user_id: 'i1' }])
    expect((db.prepare('SELECT id, state, supersedes FROM approval_requests ORDER BY rowid').all() as { id: string }[]).map((r) => r.id)).toEqual(['a1', 'a2'])
    expect(() => db.exec("UPDATE approval_requests SET state = 'approved-changes-pending' WHERE id = 'a1'")).not.toThrow()
    expect(() => db.exec("UPDATE approval_requests SET state = 'bogus' WHERE id = 'a1'")).toThrow(/CHECK/)
  })
})

describe('M6: password change is throttled and scrypt work is bounded', () => {
  it('limits password-change attempts per session (5 per 15 min) without touching sign-in', async () => {
    t = await startTest()
    const u = await t.user('student')
    const c = await t.signedIn(u)
    const codes: number[] = []
    for (let i = 0; i < 6; i++) codes.push((await c.post('/api/v1/auth/password', { current: `wrong-current-${i}`, next: 'a-long-new-passphrase-ok' })).status)
    expect(codes.slice(0, 5)).toEqual([400, 400, 400, 400, 400])
    expect(codes[5]).toBe(429)
    // even the right current password waits now (the session is throttled, not the guess)
    expect((await c.post('/api/v1/auth/password', { current: u.password, next: 'a-long-new-passphrase-ok' })).status).toBe(429)
    expect((await t.client().login(u.login, u.password)).status).toBe(200) // sign-in is unaffected
    t.advance(15 * 60_000 + 1000)
    expect((await c.post('/api/v1/auth/password', { current: u.password, next: 'a-long-new-passphrase-ok' })).status).toBe(200)
    const audit = (t.store.db.prepare("SELECT action FROM audit_log WHERE action LIKE 'auth.password%'").all() as { action: string }[]).map((r) => r.action)
    expect(audit).toContain('auth.password.throttled')
    expect(audit).toContain('auth.password.fail')
  })
  it('limits wrong current passwords per account across sessions (10 per hour)', async () => {
    t = await startTest()
    const u = await t.user('student')
    const sessions = [await t.signedIn(u), await t.signedIn(u), await t.signedIn(u)]
    const codes: number[] = []
    for (let i = 0; i < 11; i++) codes.push((await sessions[i % 3].post('/api/v1/auth/password', { current: `wrong-${i}`, next: 'a-long-new-passphrase-ok' })).status)
    expect(codes.slice(0, 10).every((s) => s === 400)).toBe(true)
    expect(codes[10]).toBe(429)
  })
  it('runs at most two scrypt computations at once, and a sign-in overtakes queued password changes', async () => {
    const before = scryptGate.peak
    scryptGate.peak = 0
    const stored = await hashPassword('correct horse battery', 2 ** 12)
    await Promise.all(Array.from({ length: 10 }, (_, i) => verifyPassword(i % 2 ? 'correct horse battery' : 'wrong', stored)))
    expect(scryptGate.peak).toBeLessThanOrEqual(2)
    expect(scryptGate.peak).toBeGreaterThan(0)
    scryptGate.peak = Math.max(before, scryptGate.peak)
    // priority: with both slots busy, a 'high' task queued after 'low' ones runs first
    const s = new Semaphore(1, 10)
    const order: string[] = []
    let release!: () => void
    const blocker = s.run('low', () => new Promise<void>((r) => (release = r)))
    const lows = [1, 2].map((i) => s.run('low', async () => void order.push(`low${i}`)))
    const high = s.run('high', async () => void order.push('high'))
    release()
    await Promise.all([blocker, ...lows, high])
    expect(order).toEqual(['high', 'low1', 'low2'])
  })
  it('a full queue answers busy instead of growing without bound', async () => {
    const s = new Semaphore(1, 1)
    let release!: () => void
    const p1 = s.run('low', () => new Promise<void>((r) => (release = r)))
    const p2 = s.run('low', async () => undefined)
    await expect(s.run('low', async () => undefined)).rejects.toBeInstanceOf(ScryptBusy)
    release()
    await Promise.all([p1, p2])
  })
})

describe('L4: malformed and duplicate cookies', () => {
  it('a malformed cookie is skipped (no 500) and two session cookies are refused (401)', async () => {
    t = await startTest()
    const c = await t.signedIn(await t.user('student'))
    expect((await c.get('/api/v1/auth/session', { Cookie: `foo=%E0%A4%A; ${c.cookie}` })).status).toBe(200)
    expect((await c.get('/api/v1/health', { Cookie: 'foo=%E0%A4%A' })).status).toBe(200)
    const dup = await c.get('/api/v1/auth/session', { Cookie: `sls_session=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA; ${c.cookie}` })
    expect(dup.status).toBe(401)
    expect(dup.body.message).toMatch(/two session cookies/)
  })
})

describe('L6: the periodic sweep', () => {
  it('deletes idle-expired, absolutely-expired sessions and prunes the rate limiter maps', async () => {
    t = await startTest()
    const u = await t.user('student')
    await t.signedIn(u)
    await t.client().login('nobody.here', 'wrong-password-123')
    t.advance(3 * 3600 * 1000) // past the 2 h idle limit
    const res = await sweep(t.app)
    expect(res.sessions).toBe(1)
    expect((t.store.db.prepare('SELECT COUNT(*) AS n FROM sessions').get() as { n: number }).n).toBe(0)
    expect(res.limiterKeys).toBe(0)
    const l = new RateLimiter(() => 0)
    l.checkLogin('x', '1.2.3.4')
    expect(l.prune()).toBe(1)
  })
})

describe('L7: restore guards', () => {
  const fileConfig = (dir: string): Config => testConfig({ dataDir: dir, dbFile: join(dir, 'sls.db') })
  it('refuses the live database as its own source and a folder without a manifest, leaving the live database intact', async () => {
    const dir = tmp()
    const cfg = fileConfig(dir)
    const s = openStore(cfg)
    await s.tx((r) => r.meta.set('marker', 'live'))
    const b = await backup(cfg, s)
    s.close()
    await expect(restore(cfg, cfg.dbFile)).rejects.toThrow(/live database itself/)
    rmSync(join(b.dir, 'manifest.json'))
    await expect(restore(cfg, b.dir)).rejects.toThrow(/no manifest/)
    const again = openStore(cfg)
    expect(await again.read((r) => r.meta.get('marker'))).toBe('live')
    again.close()
  })
  it('refuses a backup from a newer server BEFORE replacing anything', async () => {
    const src = tmp()
    const future = new DatabaseSync(join(src, 'future.db'))
    migrate(future)
    future.prepare('INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)').run(99, 'future', 'x')
    future.close()
    const dir = tmp()
    const cfg = fileConfig(dir)
    const s = openStore(cfg)
    await s.tx((r) => r.meta.set('marker', 'still here'))
    s.close()
    await expect(restore(cfg, join(src, 'future.db'))).rejects.toThrow(/newer than this server/)
    const again = openStore(cfg)
    expect(await again.read((r) => r.meta.get('marker'))).toBe('still here')
    again.close()
  })
})


describe('confirmation review minors', () => {
  it('N2: a stolen session that burns the account limit cannot lock the owner out of a password change from a fresh sign-in', async () => {
    t = await startTest()
    const u = await t.user('student')
    const thief = [await t.signedIn(u), await t.signedIn(u)]
    for (let i = 0; i < 10; i++) await thief[i % 2].post('/api/v1/auth/password', { current: `wrong-${i}`, next: 'a-long-new-passphrase-ok' })
    expect((await thief[0].post('/api/v1/auth/password', { current: u.password, next: 'a-long-new-passphrase-ok' })).status).toBe(429)
    t.advance(1000)
    const owner = await t.signedIn(u)
    expect((await owner.post('/api/v1/auth/password', { current: u.password, next: 'a-long-new-passphrase-ok' })).status).toBe(200)
  })
  it('N3: labels are one sanitised line of at most 120 characters; server-sounding labels are marked as the student’s; inner rev is the server’s', async () => {
    t = await startTest()
    const a = await t.signedIn(await t.user('student', 'Team 1'))
    const r0 = await createTeamProject(a, await t.team('Team 1'))
    const pid = r0.body.doc.project.uid
    const doc = structuredClone(r0.body.doc) as ProjectDoc
    doc.rev = 999
    const r = await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'manual', label: 'Milestone 1 submission (instructor-approved) <b>✓</b>', doc })
    expect(r.status).toBe(201)
    expect(r.body.label).toBe('Student-saved version: Milestone 1 submission (instructor-approved) b /b')
    expect((await a.get(`/api/v1/projects/${pid}/snapshots/${r.body.id}`)).body.doc.rev).toBe(r0.body.doc.rev)
    const long = await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'manual', label: 'Before rewrite '.repeat(15) })
    expect(long.body.label.length).toBeLessThanOrEqual(120)
    expect((await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'manual', label: 'Before rewrite' })).body.label).toBe('Before rewrite')
  })
  it('N5: a partly received request continues after the received sets; a mix that is not a clean continuation is a conflict, not a 400', async () => {
    t = await startTest()
    const a = await t.signedIn(await t.user('student', 'Team 1'))
    const r0 = await createTeamProject(a, await t.team('Team 1'))
    const pid = r0.body.doc.project.uid
    const e = ent(r0.body.doc)
    const set = (id: string, v: string) => ({ clientChangeId: id, source: 'editor', summary: v, ops: [{ op: 'update-artifact', uid: e.uid, fields: [{ path: 'attributes.problem', before: null, after: v }] }] })
    const [c1, c2, c3] = ['outbox-aaaa-1', 'outbox-aaaa-2', 'outbox-aaaa-3']
    const first = await a.post(`/api/v1/projects/${pid}/changes`, { baseVersion: r0.body.version, changes: [set(c1, 'one')] })
    expect(first.status).toBe(200)
    // the response of `first` was "lost": the outbox replays c1 together with c2 on the old base version
    const replay = await a.post(`/api/v1/projects/${pid}/changes`, { baseVersion: r0.body.version, changes: [set(c1, 'one'), set(c2, 'two')] })
    expect(replay.status, JSON.stringify(replay.body)).toBe(200)
    expect(replay.body.version).toBe(first.body.version + 1)
    expect(ent(replay.body.doc).attributes.problem).toBe('two')
    expect(replay.body.changes).toHaveLength(2)
    expect((t.store.db.prepare('SELECT COUNT(*) AS n FROM project_changes WHERE project_id = ? AND client_change_id = ?').get(pid, c1) as { n: number }).n).toBe(1)
    // c1 was not saved last any more (c2 came after it): replaying c1 + c3 is a conflict for review
    const mixed = await a.post(`/api/v1/projects/${pid}/changes`, { baseVersion: r0.body.version, changes: [set(c1, 'one'), set(c3, 'three')] })
    expect(mixed.status).toBe(409)
    expect(mixed.body.code).toBe('conflict')
  })
})
