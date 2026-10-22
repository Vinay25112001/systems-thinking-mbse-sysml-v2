// Week 1 submissions and the canvas's server paths (M6; spec §g, RS-01…RS-30; MP-10…MP-14): who may submit, read,
// queue and decide (table-driven, 404 for other teams); what blocks a submission; the immutable snapshot (unchanged after
// edits, refused by the database for update and delete); supersede on resubmission; instructor decisions with required
// comment and anchors checked against the snapshot; and M6 change sets (conflicting concerns, assumptions, interest)
// accepted by the server's integrity rules while the approval stays server-owned.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { makeArtifact, makeRelationship } from '../../src/project/model/create'
import type { ProjectDoc } from '../../src/project/model/types'
import { cid, Client, createTeamProject, startTest, type T } from './helpers'

let t: T
let a: Client // member of Team 1
let b: Client // member of Team 1
let other: Client // member of Team 2
let inst: Client
let pid: string
let pid2: string
const ent = (d: ProjectDoc) => Object.values(d.artifacts).find((x) => x.type === 'ENT')!
const stamp = { at: '2026-10-21T12:00:00.000Z', by: 'SA', change: 'CHG-000100' }
async function send(c: Client, id: string, ops: unknown[], summary = 'edit') {
  const p = (await c.get(`/api/v1/projects/${id}`)).body
  return c.post(`/api/v1/projects/${id}/changes`, { baseVersion: p.version, changes: [{ clientChangeId: cid(), source: 'editor', summary, ops }] })
}
const SUBMIT = { week: 1, rev: 0, confirm: true, notes: { 's2:At least 8 stakeholders': 'We have six; two more next week.' }, validation: { format: 'week1-validation-report', version: 1, advisory: 'advisory' } }
/** Submits the revision the member just read (M6 review M-4), a minute after any earlier submission (M-3 interval). */
async function submitAs(c: Client, id: string, extra: Record<string, unknown> = {}) {
  t.advance(61_000)
  const rev = ((await c.get(`/api/v1/projects/${id}`)).body.doc as ProjectDoc).rev
  return c.post(`/api/v1/projects/${id}/submissions`, { ...SUBMIT, rev, ...extra })
}
const db = () => (t.store as unknown as { db: { prepare: (s: string) => { run: (...a: unknown[]) => unknown } } }).db

beforeAll(async () => {
  t = await startTest()
  a = await t.signedIn(await t.user('student', 'Team 1', { initials: 'SA' }))
  b = await t.signedIn(await t.user('student', 'Team 1', { initials: 'SB' }))
  other = await t.signedIn(await t.user('student', 'Team 2', { initials: 'OT' }))
  inst = await t.signedIn(await t.user('instructor', undefined, { initials: 'PR' }))
  pid = (await createTeamProject(a, await t.team('Team 1'), 'Riverside Ferry Collective')).body.doc.project.uid
  pid2 = (await createTeamProject(other, await t.team('Team 2'), 'Upland Water Board')).body.doc.project.uid
})
afterAll(async () => t.close())

describe('M6 change sets on the server', () => {
  it('accepts a conflicting-concerns link (CON conflicts-with CON, LNK), an assumption tagged Week 1 and the A25 stakeholder fields', async () => {
    const p = (await a.get(`/api/v1/projects/${pid}`)).body.doc as ProjectDoc
    const stk = makeArtifact({ id: 'STK-001', type: 'STK', title: 'Commuters', attributes: { interest: '4', interestReason: 'daily trips', support: '2' }, stamp })
    const c1 = makeArtifact({ id: 'CON-001', type: 'CON', description: 'Commuters need departures before 7 a.m. on weekdays.', stamp })
    const c2 = makeArtifact({ id: 'CON-002', type: 'CON', description: 'Residents near the pier object to engine noise before 7 a.m.', stamp })
    const au = makeArtifact({ id: 'A-001', type: 'A', title: 'The pier lease is renewed next year.', rationale: 'The port authority said so at the kickoff.', stamp, week: 1 })
    const ops = [
      { op: 'create-artifact', artifact: stk },
      { op: 'create-artifact', artifact: c1 },
      { op: 'create-artifact', artifact: c2 },
      { op: 'create-artifact', artifact: au },
      { op: 'create-relationship', relationship: makeRelationship({ id: 'LNK-001', category: 'trace', type: 'conflicts-with', from: c1.uid, to: c2.uid, rationale: 'Early departures mean early engine noise.', stamp }) },
    ]
    expect(p.rev).toBeGreaterThanOrEqual(0)
    const r = await send(a, pid, ops)
    expect(r.status).toBe(200)
    // the reverse link duplicates the conflict: refused by the shared integrity rule
    const dup = await send(a, pid, [{ op: 'create-relationship', relationship: makeRelationship({ id: 'LNK-002', category: 'trace', type: 'conflicts-with', from: c2.uid, to: c1.uid, stamp }) }])
    expect(dup.status).toBe(422)
    const doc = (await b.get(`/api/v1/projects/${pid}`)).body.doc as ProjectDoc
    expect(Object.values(doc.artifacts).find((x) => x.id === 'A-001')!.milestones).toEqual([1])
    expect(Object.values(doc.artifacts).find((x) => x.id === 'STK-001')!.attributes.interest).toBe('4')
  })
  it('the enterprise description is a member edit; the approval stays server-owned (no self-declared approval)', async () => {
    const doc = (await a.get(`/api/v1/projects/${pid}`)).body.doc as ProjectDoc
    expect((await send(a, pid, [{ op: 'update-artifact', uid: ent(doc).uid, fields: [{ path: 'description', before: '', after: 'A ferry cooperative of three pier owners and the city.' }] }])).status).toBe(200)
    expect((await send(a, pid, [{ op: 'update-artifact', uid: ent(doc).uid, fields: [{ path: 'attributes.approval', before: ent(doc).attributes.approval, after: { decision: 'approved', decidedOn: '2026-10-20' } }] }])).status).toBe(422)
  })
})

describe('submissions: authorization (table-driven)', () => {
  it('blocks a submission until the enterprise proposal was sent for approval (RS-11)', async () => {
    const r = await submitAs(a, pid)
    expect(r.status).toBe(400)
    expect(r.body.message).toMatch(/instructor approval/)
    expect((await a.post(`/api/v1/projects/${pid}/approval-requests`)).status).toBe(201)
  })
  it('refuses a submission without the explicit confirmation, or for another week', async () => {
    expect((await submitAs(a, pid, { confirm: false })).status).toBe(400)
    expect((await submitAs(a, pid, { week: 2 })).status).toBe(400)
    const { rev: _r, ...noRev } = SUBMIT
    void _r
    expect((await a.post(`/api/v1/projects/${pid}/submissions`, noRev)).status).toBe(400)
  })
  const cases: [string, () => Client, () => string, 'GET' | 'POST', string, number][] = [
    ['member reads own team submissions', () => a, () => pid, 'GET', '/submissions', 200],
    ['other team reads them', () => other, () => pid, 'GET', '/submissions', 404],
    ['other team submits for them', () => other, () => pid, 'POST', '/submissions', 404],
    ['instructor submits for a team', () => inst, () => pid, 'POST', '/submissions', 403],
    ['instructor reads a team submissions', () => inst, () => pid, 'GET', '/submissions', 200],
  ]
  it.each(cases)('%s', async (_name, who, id, method, path, status) => {
    const url = `/api/v1/projects/${id()}${path}`
    const r = method === 'GET' ? await who().get(url) : await who().post(url, SUBMIT)
    expect(r.status).toBe(status)
  })
  it('a student cannot see the queue or decide; an anonymous client gets 401', async () => {
    expect((await a.get('/api/v1/submissions')).status).toBe(404)
    expect((await t.client().get(`/api/v1/projects/${pid}/submissions`)).status).toBe(401)
  })
})

describe('submissions: snapshot, supersede, decision, feedback', () => {
  let s1: string
  let snap1: string
  it('a member submits: one immutable submission snapshot with its fingerprint, labelled "submitted for approval" while pending', async () => {
    // M6 review M-4: a revision other than the stored one is refused (a teammate saved meanwhile)
    const stale = await submitAs(a, pid, { rev: 0 })
    expect(stale.status).toBe(409)
    expect(stale.body.message).toMatch(/changed since you reviewed it/)
    // M6 review M-2: the browser claims 7 of 7; the server computes the summary from the frozen snapshot
    const r = await submitAs(a, pid, { validation: { format: 'week1-validation-report', version: 1, headline: { meets: 7, required: 7 } } })
    expect(r.status).toBe(201)
    const s = r.body.submission
    expect(s.validation.headline.required).toBe(7)
    expect(s.validation.headline.meets).toBeLessThan(7)
    expect(s.reportedByBrowser).toEqual({ meets: 7, required: 7 })
    expect(s.validationMismatch).toBe(true)
    const iq = (await inst.get('/api/v1/submissions?state=submitted')).body.submissions[0]
    expect(iq.validation.headline.meets).toBe(s.validation.headline.meets)
    expect(iq.validationMismatch).toBe(true)
    expect(s).toMatchObject({ state: 'submitted', week: 1, proposalState: 'pending', submittedBy: 'SA', notes: SUBMIT.notes })
    expect(s.fingerprint).toMatch(/^[0-9a-f]{64}$/)
    s1 = s.id
    snap1 = s.snapshotId
    const snaps = (await b.get(`/api/v1/projects/${pid}/snapshots`)).body.snapshots
    expect(snaps.find((x: { id: string }) => x.id === snap1)).toMatchObject({ kind: 'submission', label: 'Week 1 submission', createdBy: 'SA' })
  })
  it('the snapshot is preserved after further edits; the API refuses deleting it and the database refuses any change to it', async () => {
    const before = (await b.get(`/api/v1/projects/${pid}/snapshots/${snap1}`)).body.doc as ProjectDoc
    const doc = (await a.get(`/api/v1/projects/${pid}`)).body.doc as ProjectDoc
    expect((await send(a, pid, [{ op: 'update-artifact', uid: ent(doc).uid, fields: [{ path: 'attributes.domain', before: ent(doc).attributes.domain, after: 'Transport' }] }])).status).toBe(200)
    const after = (await b.get(`/api/v1/projects/${pid}/snapshots/${snap1}`)).body.doc as ProjectDoc
    expect(after).toEqual(before)
    expect(ent(after).attributes.domain).not.toBe('Transport')
    expect((await a.del(`/api/v1/projects/${pid}/snapshots/${snap1}`)).status).toBe(403)
    expect(() => (t.store as unknown as { db: { prepare: (s: string) => { run: (...a: unknown[]) => unknown } } }).db.prepare('UPDATE project_snapshots SET doc = ? WHERE snp_id = ?').run('{}', snap1)).toThrow(/immutable/)
    expect(() => (t.store as unknown as { db: { prepare: (s: string) => { run: (...a: unknown[]) => unknown } } }).db.prepare('DELETE FROM project_snapshots WHERE snp_id = ?').run(snap1)).toThrow(/kept/)
    expect(() => (t.store as unknown as { db: { prepare: (s: string) => { run: (...a: unknown[]) => unknown } } }).db.prepare('UPDATE submissions SET doc_sha256 = ? WHERE id = ?').run('x', s1)).toThrow(/immutable/)
    expect(() => (t.store as unknown as { db: { prepare: (s: string) => { run: (...a: unknown[]) => unknown } } }).db.prepare('DELETE FROM submissions WHERE id = ?').run(s1)).toThrow(/kept/)
    // M6 review L-1: a replacing insert cannot slip past the triggers
    expect(() => db().prepare("INSERT OR REPLACE INTO project_snapshots (project_id, snp_id, kind, label, rev, at, created_by, doc) VALUES ((SELECT project_id FROM project_snapshots WHERE snp_id = ? LIMIT 1), ?, 'manual', 'x', 0, 'x', 'x', '{}')").run(snap1, snap1)).toThrow(/immutable/)
    expect(() => db().prepare("INSERT OR REPLACE INTO submissions SELECT id, project_id, week, snapshot_id, 'forged', doc_rev, validation, notes, proposal_state, submitted_by, submitted_at, 'approved', decided_by, decided_at, feedback, anchors, supersedes FROM submissions WHERE id = ?").run(s1)).toThrow(/immutable/)
  })
  it('M6 review M-3: an unchanged project cannot be submitted again; two submissions are a minute apart; kept versions use no member quota', async () => {
    t.advance(61_000)
    const rev = ((await a.get(`/api/v1/projects/${pid}`)).body.doc as ProjectDoc).rev
    // the domain edit above changed the project, so this one is allowed later; first: too soon after a submission
    const first = await a.post(`/api/v1/projects/${pid}/submissions`, { ...SUBMIT, rev })
    expect(first.status).toBe(201)
    const soon = await a.post(`/api/v1/projects/${pid}/submissions`, { ...SUBMIT, rev })
    expect(soon.status).toBe(409) // unchanged project (checked before the interval)
    expect(soon.body.message).toMatch(/Nothing changed/)
    const doc = (await a.get(`/api/v1/projects/${pid}`)).body.doc as ProjectDoc
    expect((await send(a, pid, [{ op: 'update-artifact', uid: ent(doc).uid, fields: [{ path: 'attributes.domain', before: ent(doc).attributes.domain, after: 'Water transport' }] }])).status).toBe(200)
    const rev2 = ((await a.get(`/api/v1/projects/${pid}`)).body.doc as ProjectDoc).rev
    const tooSoon = await a.post(`/api/v1/projects/${pid}/submissions`, { ...SUBMIT, rev: rev2 })
    expect(tooSoon.status).toBe(429)
    const usage = await t.store.read((r) => r.projects.snapshotUsage(pid))
    const kept = (await a.get(`/api/v1/projects/${pid}/snapshots`)).body.snapshots.filter((x: { kind: string }) => x.kind === 'submission' || x.kind === 'proposal').length
    const all = (await a.get(`/api/v1/projects/${pid}/snapshots`)).body.snapshots.length
    expect(kept).toBeGreaterThanOrEqual(3)
    expect(usage.count).toBe(all - kept)
  })
  it('a resubmission supersedes the undecided one (history kept); superseded ones leave the default queue', async () => {
    const r = await submitAs(b, pid)
    expect(r.status).toBe(201)
    const list = (await a.get(`/api/v1/projects/${pid}/submissions`)).body.submissions
    expect(list.map((x: { state: string }) => x.state)).toEqual(['superseded', 'superseded', 'submitted'])
    expect(list[1].supersedes).toBe(s1)
    expect((await inst.get('/api/v1/submissions')).body.submissions.map((x: { state: string }) => x.state)).toEqual(['submitted'])
    expect((await inst.get('/api/v1/submissions?all=1')).body.submissions).toHaveLength(3)
  })
  it('the instructor queue lists it; returning needs a comment; anchors must name artifacts of the snapshot; the team sees the feedback', async () => {
    const q = await inst.get('/api/v1/submissions?state=submitted')
    expect(q.status).toBe(200)
    expect(q.body.submissions).toHaveLength(1)
    const sub = q.body.submissions[0]
    expect(sub).toMatchObject({ teamLabel: 'Team 1', enterprise: 'Riverside Ferry Collective', current: true })
    expect((await a.post(`/api/v1/submissions/${sub.id}/decision`, { decision: 'approved' })).status).toBe(404)
    expect((await other.post(`/api/v1/submissions/${sub.id}/decision`, { decision: 'approved' })).status).toBe(404)
    expect((await inst.post(`/api/v1/submissions/${sub.id}/decision`, { decision: 'returned' })).status).toBe(400)
    expect((await inst.post(`/api/v1/submissions/${sub.id}/decision`, { decision: 'returned', comment: 'Add needs.', anchors: [{ artifactId: 'NEED-099', text: 'missing' }] })).status).toBe(400)
    const d = await inst.post(`/api/v1/submissions/${sub.id}/decision`, { decision: 'returned', comment: 'Add needs for the residents.', anchors: [{ artifactId: 'CON-002', text: 'This concern has no need yet.' }] })
    expect(d.status).toBe(200)
    expect(d.body.submission.state).toBe('returned')
    expect((await inst.post(`/api/v1/submissions/${sub.id}/decision`, { decision: 'approved' })).status).toBe(409)
    const seen = (await b.get(`/api/v1/projects/${pid}/submissions`)).body.submissions.at(-1)
    expect(seen).toMatchObject({ state: 'returned', feedback: 'Add needs for the residents.', decidedBy: 'PR', anchors: [{ artifactId: 'CON-002', text: 'This concern has no need yet.' }] })
  })
  it('after a return the team resubmits; the instructor approves; an approved week cannot be submitted again', async () => {
    expect((await submitAs(a, pid)).status).toBe(409) // nothing changed since the returned version
    const doc = (await a.get(`/api/v1/projects/${pid}`)).body.doc as ProjectDoc
    expect((await send(a, pid, [{ op: 'update-artifact', uid: ent(doc).uid, fields: [{ path: 'attributes.suitability', before: ent(doc).attributes.suitability, after: 'Needs for the residents were added.' }] }])).status).toBe(200)
    const r = await submitAs(a, pid)
    expect(r.status).toBe(201)
    const returned = (await a.get(`/api/v1/projects/${pid}/submissions`)).body.submissions.find((x: { state: string; feedback: string }) => x.state === 'superseded' && x.feedback)
    expect(returned).toBeTruthy() // the returned one is superseded, its feedback kept
    expect(() => db().prepare("UPDATE submissions SET feedback = 'rewritten' WHERE id = ?").run(returned.id)).toThrow(/final/)
    expect((await inst.post(`/api/v1/submissions/${r.body.submission.id}/decision`, { decision: 'approved', comment: 'Good baseline.' })).status).toBe(200)
    expect(() => db().prepare("UPDATE submissions SET state = 'submitted' WHERE id = ?").run(r.body.submission.id)).toThrow(/final/)
    expect((await submitAs(a, pid)).status).toBe(409)
    const audit = (await t.store.read((x) => x.audit.list(50))).map((e) => e.action)
    expect(audit).toEqual(expect.arrayContaining(['submission.create', 'submission.decide']))
  })
  it('another team’s project stays invisible throughout', async () => {
    expect((await other.get(`/api/v1/projects/${pid}/submissions`)).status).toBe(404)
    expect((await other.get(`/api/v1/projects/${pid2}/submissions`)).body.submissions).toEqual([])
  })
})

describe('M6 review M-3: at most a bounded number of submissions per week', () => {
  it('the eleventh submission of a week is refused; each needed a change and a minute', async () => {
    const c = await t.signedIn(await t.user('student', 'Team 3', { initials: 'LM' }))
    const id = (await createTeamProject(c, await t.team('Team 3'), 'Limit Test Cooperative')).body.doc.project.uid
    expect((await c.post(`/api/v1/projects/${id}/approval-requests`)).status).toBe(201)
    for (let k = 0; k < 11; k++) {
      const doc = (await c.get(`/api/v1/projects/${id}`)).body.doc as ProjectDoc
      expect((await send(c, id, [{ op: 'update-artifact', uid: ent(doc).uid, fields: [{ path: 'attributes.domain', before: ent(doc).attributes.domain, after: `Domain ${k}` }] }])).status).toBe(200)
      const r = await submitAs(c, id)
      expect(r.status, `submission ${k + 1}`).toBe(k < 10 ? 201 : 409)
      if (k === 10) expect(r.body.message).toMatch(/limit/)
    }
  })
})

describe('M6 review H-1: the course server writes the pre-import version of every import and binds it to the import', () => {
  it('the restore point of an Excel import is exactly the version before it, also in a project created from an imported file', async () => {
    const c = await t.signedIn(await t.user('student', 'Team 4', { initials: 'IM' }))
    const teamId = await t.team('Team 4')
    const file = { format: 'week1-model-inputs', version: 1, team: '04', enterprise: { name: 'Imported Ferry Cooperative' }, stakeholders: [{ id: 'STK-001', name: 'Commuters' }], concerns: [], needs: [] }
    const made = await c.post(`/api/v1/teams/${teamId}/project`, { mode: 'import', file, fileName: 'week1.json' })
    expect(made.status).toBe(201)
    const id = made.body.doc.project.uid
    const snaps0 = (await c.get(`/api/v1/projects/${id}/snapshots`)).body.snapshots
    expect(snaps0[0]).toMatchObject({ id: 'SNP-001', kind: 'pre-import' }) // from the project creation: never the undo target
    expect((await c.post(`/api/v1/projects/${id}/snapshots`, { kind: 'manual', label: 'my version' })).status).toBe(201)
    const doc = (await c.get(`/api/v1/projects/${id}`)).body.doc as ProjectDoc
    const importId = crypto.randomUUID()
    const stk = makeArtifact({ id: 'STK-002', type: 'STK', title: 'Harbour office', attributes: { import: { importId, file: 'stakeholders.xlsx', sheet: 'Stakeholders', row: 2 } }, provenance: { kind: 'imported', from: { format: 'xlsx', version: 1, file: 'stakeholders.xlsx' }, at: stamp.at }, stamp })
    const r = await c.post(`/api/v1/projects/${id}/changes`, { baseVersion: (await c.get(`/api/v1/projects/${id}`)).body.version, changes: [{ clientChangeId: cid(), source: 'import', summary: 'Imported 1 stakeholder', ops: [{ op: 'create-artifact', artifact: stk }] }] })
    expect(r.status).toBe(200)
    const rec = await c.get(`/api/v1/projects/${id}/imports/${importId}`)
    expect(rec.status).toBe(200)
    expect(rec.body.import).toMatchObject({ id: importId, format: 'xlsx', fileName: 'stakeholders.xlsx', createdIds: ['STK-002'], chgId: r.body.changes[0].id })
    const pre = rec.body.import.preImportSnapshot
    expect(pre).not.toBe('SNP-001')
    const snap = (await c.get(`/api/v1/projects/${id}/snapshots/${pre}`)).body
    expect(snap.kind).toBe('pre-import')
    expect(snap.label).toBe(`Before import ${r.body.changes[0].id}`)
    expect(snap.doc.rev).toBe(doc.rev) // exactly the version before the import
    expect(Object.values(snap.doc.artifacts as ProjectDoc['artifacts']).some((a) => a.id === 'STK-002')).toBe(false)
    // an unknown import has no restore point (the browser explains and restores nothing); another team sees nothing
    expect((await c.get(`/api/v1/projects/${id}/imports/${crypto.randomUUID()}`)).status).toBe(404)
    expect((await other.get(`/api/v1/projects/${id}/imports/${importId}`)).status).toBe(404)
    // a browser cannot file its own version as a pre-import one
    const own = await c.post(`/api/v1/projects/${id}/snapshots`, { kind: 'pre-import', label: 'fake' })
    expect(own.body.kind).not.toBe('pre-import')
  })
})

describe('M6 confirmation N-1 to N-4', () => {
  const importChange = async (c: Client, id: string, art: ReturnType<typeof makeArtifact>, ops?: unknown[]) =>
    c.post(`/api/v1/projects/${id}/changes`, { baseVersion: (await c.get(`/api/v1/projects/${id}`)).body.version, changes: [{ clientChangeId: cid(), source: 'import', summary: 'Imported', ops: ops ?? [{ op: 'create-artifact', artifact: art }] }] })
  const stk = (id: string, importId: string) => makeArtifact({ id, type: 'STK', title: `Imported ${id}`, attributes: { import: { importId, file: 'f.xlsx', sheet: 'S', row: 2 } }, provenance: { kind: 'imported', from: { format: 'xlsx', version: 1, file: 'f.xlsx' }, at: stamp.at }, stamp })
  let c5: Client
  let id5: string
  beforeAll(async () => {
    c5 = await t.signedIn(await t.user('student', 'Team 5', { initials: 'NA' }))
    id5 = (await createTeamProject(c5, await t.team('Team 5'), 'Confirmation Cooperative')).body.doc.project.uid
  })
  it('N-1 (reviewer sequence): a member cannot delete the pre-import version; a pruned one is never renumbered onto later work; undo is refused (410), not misdirected', async () => {
    const U = crypto.randomUUID()
    expect((await importChange(c5, id5, stk('STK-001', U))).status).toBe(200)
    const pre = (await c5.get(`/api/v1/projects/${id5}/imports/${U}`)).body.import.preImportSnapshot
    expect((await c5.del(`/api/v1/projects/${id5}/snapshots/${pre}`)).status).toBe(403)
    // the server's own retention may still remove it (quota pruning): simulate that, then save later work
    await t.store.tx((r) => r.projects.deleteSnapshot(id5, pre))
    const later = await c5.post(`/api/v1/projects/${id5}/snapshots`, { kind: 'manual', label: 'later work' })
    expect(later.status).toBe(201)
    expect(later.body.id).not.toBe(pre) // numbers are never reused
    expect(Number(later.body.id.slice(4))).toBeGreaterThan(Number(pre.slice(4)))
    const r = await c5.get(`/api/v1/projects/${id5}/imports/${U}`)
    expect(r.status).toBe(410)
    expect(r.body.message).toMatch(/no longer stored/)
  })
  it('N-2: an import id already used by another team (a merged file exported elsewhere) is remapped, never a 500', async () => {
    const c6 = await t.signedIn(await t.user('student', 'Team 6', { initials: 'NB' }))
    const id6 = (await createTeamProject(c6, await t.team('Team 6'), 'Other Cooperative')).body.doc.project.uid
    const U = crypto.randomUUID()
    expect((await importChange(c5, id5, stk('STK-002', U))).status).toBe(200)
    const r = await importChange(c6, id6, stk('STK-001', U)) // carries team 5's id
    expect(r.status).toBe(200)
    expect((await c6.get(`/api/v1/projects/${id6}/imports/${U}`)).status).toBe(404) // team 5's record is not team 6's
    expect((await c5.get(`/api/v1/projects/${id5}/imports/${U}`)).status).toBe(200) // and stays intact
    const own = (await t.store.read((x) => x.projects.snapshots(id6))).filter((s) => s.kind === 'pre-import')
    expect(own).toHaveLength(1) // team 6 still got its own restore point, under a fresh import id
  })
  it('N-3: a merge-only import (no new stakeholder) is undoable on the server too', async () => {
    const doc = (await c5.get(`/api/v1/projects/${id5}`)).body.doc as ProjectDoc
    const a = Object.values(doc.artifacts).find((x) => x.id === 'STK-002')!
    const U = crypto.randomUUID()
    const entry = { importId: U, file: 'f.xlsx', sheet: 'S', row: 3 }
    const r = await importChange(c5, id5, stk('STK-099', U), [{ op: 'update-artifact', uid: a.uid, fields: [{ path: 'attributes.importMerges', before: undefined, after: [entry] }] }])
    expect(r.status).toBe(200)
    const rec = await c5.get(`/api/v1/projects/${id5}/imports/${U}`)
    expect(rec.status).toBe(200)
    expect(rec.body.import.createdIds).toEqual([])
  })
  it('N-4: UPDATE OR REPLACE cannot move a row onto a kept version', async () => {
    expect((await c5.post(`/api/v1/projects/${id5}/approval-requests`)).status).toBe(201)
    const proposal = (await c5.get(`/api/v1/projects/${id5}/snapshots`)).body.snapshots.find((x: { kind: string }) => x.kind === 'proposal').id
    const manual = (await c5.post(`/api/v1/projects/${id5}/snapshots`, { kind: 'manual', label: 'x' })).body.id
    expect(() => db().prepare('UPDATE OR REPLACE project_snapshots SET snp_id = ? WHERE snp_id = ? AND project_id = ?').run(proposal, manual, id5)).toThrow(/immutable/)
  })
})

