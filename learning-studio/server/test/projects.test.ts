// Server-held projects: server replay of operations, server-owned fields, optimistic concurrency (409), idempotent
// retries, transactional rollback, snapshots, restore, and export → import round trip (PROJECT_DATA_SCHEMA.md §6, §7).
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { makeArtifact } from '../../src/project/model/create'
import { nextId } from '../../src/project/model/ids'
import type { Operation, ProjectDoc } from '../../src/project/model/types'
import { cid, Client, createTeamProject, startTest, type T } from './helpers'

let t: T
let a: Client
let b: Client
let teamId: string
let pid: string
let doc: ProjectDoc
let version: number

beforeEach(async () => {
  t = await startTest()
  a = await t.signedIn(await t.user('student', 'Team 1', { initials: 'AA' }))
  b = await t.signedIn(await t.user('student', 'Team 1', { initials: 'BB' }))
  teamId = await t.team('Team 1')
  const r = await createTeamProject(a, teamId)
  expect(r.status).toBe(201)
  pid = r.body.doc.project.uid
  doc = r.body.doc
  version = r.body.version
})
afterEach(async () => t.close())

const ent = (d: ProjectDoc) => Object.values(d.artifacts).find((x) => x.type === 'ENT')!
const editEnt = (d: ProjectDoc, path: string, after: string): Operation => ({ op: 'update-artifact', uid: ent(d).uid, fields: [{ path, before: (path === 'title' ? ent(d).title : ent(d).attributes[path.slice(11)]) as never, after }] })
const send = (c: Client, baseVersion: number, ops: Operation[], extra: Record<string, unknown> = {}) => c.post(`/api/v1/projects/${pid}/changes`, { baseVersion, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'Edit', ops, ...extra }] })
const countChanges = () => (t.store.db.prepare('SELECT COUNT(*) AS n FROM project_changes WHERE project_id = ?').get(pid) as { n: number }).n

describe('creating the team project', () => {
  it('projects the team label and the real members, stamps the creation, and starts at version 1', () => {
    expect(version).toBe(1)
    expect(doc.team.label).toBe('Team 1')
    expect(doc.team.members.map((m) => m.initials).sort()).toEqual(['AA', 'BB'])
    expect(ent(doc).title).toBe('Harbor Shuttle Cooperative')
  })
  it('allows one project per team', async () => {
    const r = await createTeamProject(b, teamId)
    expect(r.status).toBe(409)
  })
  it('never accepts a self-declared approval from the browser document; the claim is kept in the rationale', async () => {
    const t2 = await t.team('Team 2')
    const c = await t.signedIn(await t.user('student', 'Team 2'))
    const { emptyProject } = await import('../../src/project/model/create')
    const d = emptyProject({ enterpriseName: 'Claimed Approval Inc' })
    const e = Object.values(d.artifacts).find((x) => x.type === 'ENT')!
    e.attributes.approval = { decision: 'approved', decidedOn: '2026-10-01' }
    d.milestones[0].approval = { decision: 'approved', decidedOn: '2026-10-01' }
    const r = await c.post(`/api/v1/teams/${t2}/project`, { mode: 'doc', doc: d })
    expect(r.status).toBe(201)
    expect(ent(r.body.doc).attributes.approval).toEqual({ decision: '', decidedOn: '' })
    expect(r.body.doc.milestones[0].approval).toBeUndefined()
    expect(r.body.changes.at(-1).rationale).toMatch(/self-declared “approved” on 2026-10-01/)
  })
})

describe('changes', () => {
  it('replays operations on the server, stamps them with the authenticated account and server time, and bumps the version', async () => {
    const r = await send(a, version, [editEnt(doc, 'attributes.problem', 'Commuters wait too long')])
    expect(r.status, JSON.stringify(r.body)).toBe(200)
    expect(r.body.version).toBe(2)
    expect(ent(r.body.doc).attributes.problem).toBe('Commuters wait too long')
    const c = r.body.changes[0]
    expect(c.by).toBe('AA')
    expect(c.actor.userId).toBeTruthy()
    expect(c.at).toBe('2026-10-21T12:00:00.000Z')
    expect(c.id).toMatch(/^CHG-\d{6}$/)
    const stored = (await a.get(`/api/v1/projects/${pid}`)).body
    expect(stored.version).toBe(2)
    expect(ent(stored.doc).revised.by).toBe('AA')
  })
  it('stamps created artifacts with the server stamp, not the browser’s self-declared one', async () => {
    const art = makeArtifact({ id: nextId(doc, 'STK'), type: 'STK', title: 'Riders', stamp: { at: '1999-01-01T00:00:00Z', by: 'FAKE', change: 'CHG-999999' } })
    const r = await send(a, version, [{ op: 'create-artifact', artifact: art }])
    expect(r.status).toBe(200)
    const made = r.body.doc.artifacts[art.uid]
    expect(made.created.by).toBe('AA')
    expect(made.created.at).toBe('2026-10-21T12:00:00.000Z')
  })
  it('two teammates on the same base version: the second gets 409 "Conflict requires review" with the changes since — no lost update', async () => {
    const first = await send(a, version, [editEnt(doc, 'title', 'Name by A')])
    expect(first.status).toBe(200)
    const second = await send(b, version, [editEnt(doc, 'title', 'Name by B')])
    expect(second.status).toBe(409)
    expect(second.body.code).toBe('conflict')
    expect(second.body.message).toMatch(/Conflict requires review/)
    expect(second.body.version).toBe(2)
    expect(second.body.changes).toHaveLength(1)
    expect(second.body.changes[0].by).toBe('AA')
    expect(second.body.changes[0].ops[0].fields[0].after).toBe('Name by A')
    const stored = (await b.get(`/api/v1/projects/${pid}`)).body
    expect(ent(stored.doc).title).toBe('Name by A')
  })
  it('a retried request (same clientChangeId) returns the original result instead of a duplicate change', async () => {
    const body = { baseVersion: version, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'Edit', ops: [editEnt(doc, 'attributes.domain', 'Transit')] }] }
    const r1 = await a.post(`/api/v1/projects/${pid}/changes`, body)
    const n = countChanges()
    const r2 = await a.post(`/api/v1/projects/${pid}/changes`, body)
    expect(r2.status).toBe(200)
    expect(r2.body.replayed).toBe(true)
    expect(r2.body.changes[0].id).toBe(r1.body.changes[0].id)
    expect(countChanges()).toBe(n)
  })
  it('answers 304 to a poll when nothing changed', async () => {
    const r = await a.get(`/api/v1/projects/${pid}`, { 'If-None-Match': `"v${version}"` })
    expect(r.status).toBe(304)
  })
  it('refuses a member write to the enterprise approval (422) and drops edits of the member list', async () => {
    const r = await send(a, version, [editEnt(doc, 'attributes.approval', { decision: 'approved', decidedOn: '2026-10-21' } as never)])
    expect(r.status).toBe(422)
    expect(r.body.message).toMatch(/decided by your instructor/)
    const m = await send(a, version, [{ op: 'update-milestone', week: 1, fields: [{ path: 'approval', before: undefined, after: { decision: 'approved', decidedOn: '2026-10-21' } }] }])
    expect(m.status).toBe(422)
    const team = await send(a, version, [{ op: 'update-team', fields: [{ path: 'members', before: doc.team.members as never, after: [{ initials: 'ZZ', active: true }] as never }, { path: 'norms', before: '', after: 'Meet weekly' }] }])
    expect(team.status).toBe(200)
    expect(team.body.doc.team.norms).toBe('Meet weekly')
    expect(team.body.doc.team.members.map((x: { initials: string }) => x.initials).sort()).toEqual(['AA', 'BB'])
  })
  it('refuses server-only change sources', async () => {
    const r = await send(a, version, [], { source: 'system' })
    expect(r.status).toBe(403)
  })
  it('an integrity refusal (checkOp) refuses the whole request and changes nothing', async () => {
    const dup = makeArtifact({ id: 'MGO-001', type: 'MGO', title: 'Duplicate', stamp: { at: '', by: '', change: '' } })
    const r = await a.post(`/api/v1/projects/${pid}/changes`, {
      baseVersion: version,
      changes: [
        { clientChangeId: cid(), source: 'editor', summary: 'ok', ops: [editEnt(doc, 'attributes.domain', 'Applied first?')] },
        { clientChangeId: cid(), source: 'editor', summary: 'bad', ops: [{ op: 'create-artifact', artifact: dup }] },
      ],
    })
    expect(r.status).toBe(422)
    expect(r.body.message).toMatch(/I1/)
    const stored = (await a.get(`/api/v1/projects/${pid}`)).body
    expect(stored.version).toBe(version)
    expect(ent(stored.doc).attributes.domain).toBe('')
  })
  it('a database failure in the middle of the write rolls the whole transaction back', async () => {
    // a test-only trigger makes the change-row insert fail AFTER the project row was updated in the same transaction
    t.store.db.exec("CREATE TRIGGER fail_insert BEFORE INSERT ON project_changes WHEN NEW.summary = 'FAIL' BEGIN SELECT RAISE(ABORT, 'injected failure'); END;")
    const before = (t.store.db.prepare('SELECT doc, version FROM projects WHERE id = ?').get(pid) as { doc: string; version: number })
    const n = countChanges()
    const r = await a.post(`/api/v1/projects/${pid}/changes`, { baseVersion: version, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'FAIL', ops: [editEnt(doc, 'attributes.domain', 'Never stored')] }] })
    expect(r.status).toBe(500)
    expect(r.body.code).toBe('server')
    expect(JSON.stringify(r.body)).not.toMatch(/injected|SQL|trigger/i)
    const after = (t.store.db.prepare('SELECT doc, version FROM projects WHERE id = ?').get(pid) as { doc: string; version: number })
    expect(after).toEqual(before)
    expect(countChanges()).toBe(n)
    t.store.db.exec('DROP TRIGGER fail_insert')
    expect((await send(a, version, [editEnt(doc, 'attributes.domain', 'Stored now')])).status).toBe(200)
  })
  it('refuses malformed operations at the boundary', async () => {
    expect((await send(a, version, [{ op: 'drop-table' } as never])).status).toBe(400)
    expect((await send(a, version, [{ op: 'update-artifact', uid: ent(doc).uid, fields: [{ path: '__proto__.x', before: 1, after: 2 }] } as never])).status).toBe(400)
    expect((await send(a, version, [{ op: 'update-project', fields: [{ path: 'uid', before: pid, after: 'stolen' }] }])).status).toBe(422)
  })
})

describe('snapshots, restore, export and import', () => {
  it('keeps proposal versions permanently and restores a version as a new revision, keeping server-owned fields', async () => {
    const r1 = await send(a, version, [editEnt(doc, 'attributes.problem', 'Version one text')])
    const snap = await a.post(`/api/v1/projects/${pid}/snapshots`, { kind: 'manual', label: 'Before rewrite' })
    expect(snap.status).toBe(201)
    const r2 = await send(a, r1.body.version, [editEnt(r1.body.doc, 'attributes.problem', 'Version two text')])
    const full = (await a.get(`/api/v1/projects/${pid}/snapshots/${snap.body.id}`)).body
    expect(ent(full.doc).attributes.problem).toBe('Version one text')
    // the restored content claims an approval; the server keeps its own (empty) value
    const forged = structuredClone(full.doc) as ProjectDoc
    ent(forged).attributes.approval = { decision: 'approved', decidedOn: '2026-10-20' }
    const restored = await a.post(`/api/v1/projects/${pid}/changes`, { baseVersion: r2.body.version, changes: [{ clientChangeId: cid(), source: 'restore', summary: `Restored ${snap.body.id}`, rationale: 'Back to the first wording', replace: forged }] })
    expect(restored.status, JSON.stringify(restored.body)).toBe(200)
    expect(ent(restored.body.doc).attributes.problem).toBe('Version one text')
    expect(ent(restored.body.doc).attributes.approval).toEqual({ decision: '', decidedOn: '' })
    expect(restored.body.doc.project.uid).toBe(pid)
    expect(restored.body.doc.rev).toBe(r2.body.doc.rev + 1)
    const log = (await a.get(`/api/v1/projects/${pid}/changes`)).body.changes
    expect(log.at(-1).source).toBe('restore')
  })
  it('exports a sysml-studio-project v1 file with a valid checksum and server attribution, which imports into another team intact', async () => {
    const art = makeArtifact({ id: nextId(doc, 'STK'), type: 'STK', title: 'Night-shift riders', stamp: { at: '', by: '', change: '' } })
    expect((await send(a, version, [{ op: 'create-artifact', artifact: art }])).status).toBe(200)
    const ex = await a.get(`/api/v1/projects/${pid}/export`)
    expect(ex.status).toBe(200)
    expect(ex.headers.get('content-disposition')).toMatch(/attachment; filename="team-Team-1-project-/)
    const file = ex.body
    expect(file.format).toBe('sysml-studio-project')
    expect(file.schemaVersion).toBe(1)
    expect(file.app.edition).toBe('server')
    expect(file.integrity.value).toMatch(/^[0-9a-f]{64}$/)
    expect(file.changes.some((c: { actor?: { userId: string } }) => c.actor?.userId)).toBe(true)
    // the same pipeline the browser uses verifies the checksum
    const { analyzeImport } = await import('../../src/project/transfer/importProject')
    const check = await analyzeImport(JSON.stringify(file), 'x.json')
    expect(check.ok && check.checksum).toBe('ok')
    // import into another team's account (student-initiated)
    const t2 = await t.team('Team 2')
    const c = await t.signedIn(await t.user('student', 'Team 2', { initials: 'CC' }))
    const imp = await c.post(`/api/v1/teams/${t2}/project`, { mode: 'import', fileName: 'team-1.json', file })
    expect(imp.status, JSON.stringify(imp.body)).toBe(201)
    const got: ProjectDoc = imp.body.doc
    expect(got.project.uid).not.toBe(pid) // the uid collides on this server, so the copy gets a new one
    expect(Object.values(got.artifacts).map((x) => x.id).sort()).toEqual(Object.values(file.artifacts as { id: string }[]).map((x) => x.id).sort())
    expect(got.team.label).toBe('Team 2')
    expect(got.team.members.map((m) => m.initials)).toEqual(['CC'])
    const hist = (await c.get(`/api/v1/projects/${got.project.uid}/changes`)).body.changes
    expect(hist.filter((h: { authenticated: boolean }) => !h.authenticated).length).toBeGreaterThan(0) // migrated history stays self-declared
    expect(hist.at(-1).source).toBe('import')
    expect((await c.get(`/api/v1/projects/${got.project.uid}/snapshots`)).body.snapshots[0].kind).toBe('pre-import')
    const rec = t.store.db.prepare('SELECT format, file_name FROM import_records').get() as { format: string; file_name: string }
    expect(rec).toEqual({ format: 'sysml-studio-project', file_name: 'team-1.json' })
  })
  it('refuses a malformed import with a message and creates nothing', async () => {
    const t2 = await t.team('Team 2')
    const c = await t.signedIn(await t.user('student', 'Team 2'))
    const r = await c.post(`/api/v1/teams/${t2}/project`, { mode: 'import', fileName: 'bad.json', file: { format: 'something-else' } })
    expect(r.status).toBe(422)
    expect(r.body.message).toMatch(/project export/)
    expect((t.store.db.prepare('SELECT COUNT(*) AS n FROM projects').get() as { n: number }).n).toBe(1)
  })
  it('re-projects the member list into the project when the instructor changes the team', async () => {
    const inst = await t.signedIn(await t.user('instructor'))
    const newbie = await t.user('student', undefined, { initials: 'NN' })
    const r = await inst.post(`/api/v1/teams/${teamId}/members`, { userId: newbie.id })
    expect(r.status).toBe(200)
    const p = (await a.get(`/api/v1/projects/${pid}`)).body
    expect(p.doc.team.members.map((m: { initials: string }) => m.initials).sort()).toEqual(['AA', 'BB', 'NN'])
    expect(p.version).toBe(version + 1)
  })
})
