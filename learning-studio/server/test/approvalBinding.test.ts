// The approval is bound to the approved content (M2 review H1). Approval stores the material-content hash of the frozen
// proposal; a later material edit is accepted but moves the approval to `approved-changes-pending` (history kept, the
// document mirror says "changed since approval"); non-material edits change nothing; the instructor sees a diff against
// the approved snapshot and re-approves the current content or requests a revision; the team may send a new request.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { toTeamRecord } from '../../src/project/adapters/week1'
import { APPROVAL_MATERIAL_FIELDS, CHANGED_SINCE_APPROVAL } from '../../src/project/model/approvalBinding'
import { makeArtifact } from '../../src/project/model/create'
import type { Operation, ProjectDoc } from '../../src/project/model/types'
import { approvalOf } from '../../src/workbench/week1/team'
import { cid, Client, createTeamProject, startTest, type T } from './helpers'

let t: T
let a: Client
let ins: Client
let pid: string
const S = { at: '2026-10-21T12:00:00.000Z', by: 'AA', change: 'CHG-000001' }
const ent = (d: ProjectDoc) => Object.values(d.artifacts).find((x) => x.type === 'ENT')!
const cur = async () => (await a.get(`/api/v1/projects/${pid}`)).body as { version: number; doc: ProjectDoc }
async function edit(ops: (d: ProjectDoc) => Operation[], expectStatus = 200) {
  const p = await cur()
  const r = await a.post(`/api/v1/projects/${pid}/changes`, { baseVersion: p.version, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'Edit', ops: ops(p.doc) }] })
  expect(r.status, JSON.stringify(r.body)).toBe(expectStatus)
  return r
}
const setEnt = (path: string, after: string) => (d: ProjectDoc): Operation[] => [{ op: 'update-artifact', uid: ent(d).uid, fields: [{ path, before: undefined, after }] }]
const state = async () => (await a.get(`/api/v1/projects/${pid}/approval`)).body.approval
const rows = () => t.store.db.prepare('SELECT state, approved_hash, decided_at, supersedes FROM approval_requests WHERE project_id = ? ORDER BY rowid').all(pid) as { state: string; approved_hash: string | null; decided_at: string | null; supersedes: string | null }[]

async function approveNow() {
  const req = await a.post(`/api/v1/projects/${pid}/approval-requests`)
  expect(req.status).toBe(201)
  const d = await ins.post(`/api/v1/approvals/${req.body.approval.id}/decision`, { decision: 'approved', comment: 'Good to go.' })
  expect(d.status).toBe(200)
  return req.body.approval.id as string
}

beforeEach(async () => {
  t = await startTest()
  a = await t.signedIn(await t.user('student', 'Team 1', { initials: 'AA' }))
  ins = await t.signedIn(await t.user('instructor', undefined, { initials: 'PR' }))
  pid = (await createTeamProject(a, await t.team('Team 1'), 'Harbor Shuttle')).body.doc.project.uid
  await edit(setEnt('attributes.problem', 'Islanders cannot reach the mainland clinic after 6 pm.'))
})
afterEach(async () => t.close())

describe('H1: approval bound to the approved content', () => {
  it('the material field list is one constant covering enterprise name/description/problem, mission and objectives, inside and outside parts', () => {
    expect(APPROVAL_MATERIAL_FIELDS.ENT.fields).toEqual(['title', 'description', 'attributes.problem'])
    expect(Object.keys(APPROVAL_MATERIAL_FIELDS)).toEqual(['ENT', 'MGO', 'PRT', 'EXT'])
  })
  it('approval stores the hash of the approved material content', async () => {
    await approveNow()
    expect(rows()[0].state).toBe('approved')
    expect(rows()[0].approved_hash).toMatch(/^[0-9a-f]{64}$/)
  })
  it('non-material edits (stakeholders, domain, needs) leave the approval as it is', async () => {
    await approveNow()
    await edit(() => [{ op: 'create-artifact', artifact: makeArtifact({ id: 'STK-001', type: 'STK', title: 'Night-shift nurses', stamp: S }) }])
    await edit(setEnt('attributes.domain', 'Health-care transport'))
    expect((await state()).state).toBe('approved')
    expect(ent((await cur()).doc).attributes.approval).toMatchObject({ decision: 'approved' })
  })
  it('replacing the approved enterprise (the reviewer’s probe) is accepted but moves the approval to approved-changes-pending, visibly', async () => {
    await approveNow()
    const r = await edit((d) => [{ op: 'update-artifact', uid: ent(d).uid, fields: [{ path: 'title', before: ent(d).title, after: 'A completely different enterprise' }, { path: 'attributes.problem', before: '', after: 'changed after approval' }] }])
    const a1 = await state()
    expect(a1.state).toBe('approved-changes-pending')
    expect(a1.decidedAt).toBeTruthy() // the approval itself stays in the record
    expect(a1.changedAt).toBe('2026-10-21T12:00:00.000Z')
    const d = r.body.doc as ProjectDoc
    expect(ent(d).title).toBe('A completely different enterprise')
    expect(ent(d).attributes.approval).toEqual({ decision: CHANGED_SINCE_APPROVAL, decidedOn: '2026-10-21' })
    expect(d.milestones.find((m) => m.week === 1)!.approval).toEqual({ decision: CHANGED_SINCE_APPROVAL, decidedOn: '2026-10-21' })
    // the Week 1 readers no longer report "approved"
    expect(approvalOf(toTeamRecord(d).proposal, '2026-10-22')).not.toBe('approved')
    // recorded: the member's change and the server's system change in the same write
    expect(r.body.changes.map((c: { source: string }) => c.source)).toEqual(['editor', 'system'])
    expect(r.body.changes[1].summary).toMatch(/needs instructor re-review/)
    const audit = t.store.db.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action = 'approval.changed-after-approval'").get() as { n: number }
    expect(audit.n).toBe(1)
  })
  it('adding an objective or retiring an inside part is material too', async () => {
    await approveNow()
    await edit(() => [{ op: 'create-artifact', artifact: makeArtifact({ id: 'MGO-002', type: 'MGO', description: 'Cut the night wait to 20 minutes', attributes: { level: 'goal' }, stamp: S }) }])
    expect((await state()).state).toBe('approved-changes-pending')
  })
  it('going back to exactly the approved content returns the approval to approved', async () => {
    await approveNow()
    const original = ent((await cur()).doc).title
    await edit(setEnt('title', 'Something else'))
    expect((await state()).state).toBe('approved-changes-pending')
    await edit(setEnt('title', original))
    expect((await state()).state).toBe('approved')
    expect(ent((await cur()).doc).attributes.approval).toMatchObject({ decision: 'approved' })
  })
  it('the instructor sees the changed proposal with a field diff against the approved snapshot, and re-approves the current content', async () => {
    const first = await approveNow()
    await edit(setEnt('title', 'Harbor Shuttle and Freight'))
    const q = (await ins.get('/api/v1/approvals?state=approved-changes-pending')).body.approvals
    expect(q).toHaveLength(1)
    const v = q[0]
    expect(v.current).toBe(true)
    expect(v.diff).toEqual([{ id: 'ENT-001', type: 'ENT', field: 'title', approved: 'Harbor Shuttle', current: 'Harbor Shuttle and Freight', change: 'changed' }])
    expect(v.currentProposal.enterprise).toBe('Harbor Shuttle and Freight')
    expect(v.currentHash).toMatch(/^[0-9a-f]{64}$/)
    // a stale view (the team edited again after the page loaded) is refused
    await edit(setEnt('title', 'Harbor Shuttle, Freight and Mail'))
    expect((await ins.post(`/api/v1/approvals/${first}/decision`, { decision: 'approved', currentHash: v.currentHash })).status).toBe(409)
    expect((await ins.post(`/api/v1/approvals/${first}/decision`, { decision: 'approved' })).status).toBe(409)
    const fresh = (await ins.get('/api/v1/approvals?state=approved-changes-pending')).body.approvals[0]
    const d = await ins.post(`/api/v1/approvals/${first}/decision`, { decision: 'approved', comment: 'Freight and mail are fine.', currentHash: fresh.currentHash })
    expect(d.status).toBe(200)
    expect((await state()).state).toBe('approved')
    expect(ent((await cur()).doc).attributes.approval).toMatchObject({ decision: 'approved' })
    // history: the first approval (changed) and the re-approval that supersedes it
    const h = rows()
    expect(h.map((x) => x.state)).toEqual(['approved-changes-pending', 'approved'])
    expect(h[1].supersedes).toBeTruthy()
    expect(h[1].approved_hash).not.toBe(h[0].approved_hash)
    // and the binding holds again for the re-approved content
    await edit(setEnt('title', 'Yet another name'))
    expect((await state()).state).toBe('approved-changes-pending')
  })
  it('the instructor can request a revision of the changed proposal', async () => {
    const first = await approveNow()
    await edit(setEnt('title', 'Harbor Shuttle and Freight'))
    const v = (await ins.get('/api/v1/approvals?state=approved-changes-pending')).body.approvals[0]
    const d = await ins.post(`/api/v1/approvals/${first}/decision`, { decision: 'revision-requested', comment: 'Freight is out of scope.', currentHash: v.currentHash })
    expect(d.status).toBe(200)
    const s = await state()
    expect(s.state).toBe('revision-requested')
    expect(s.comment).toBe('Freight is out of scope.')
    expect((ent((await cur()).doc).attributes.approval as { decision: string }).decision).toBe('revise')
  })
  it('the team may send a new request in approved-changes-pending; the instructor sees the diff against the last approval', async () => {
    await approveNow()
    await edit(setEnt('title', 'Harbor Shuttle and Freight'))
    const r = await a.post(`/api/v1/projects/${pid}/approval-requests`)
    expect(r.status).toBe(201)
    expect((await state()).state).toBe('pending')
    const v = (await ins.get('/api/v1/approvals?state=pending')).body.approvals[0]
    expect(v.diff.map((x: { field: string; current: string }) => [x.field, x.current])).toEqual([['title', 'Harbor Shuttle and Freight']])
    expect((await ins.post(`/api/v1/approvals/${v.id}/decision`, { decision: 'approved' })).status).toBe(200)
    expect((await state()).state).toBe('approved')
  })
  it('an approval given while the team kept editing is bound to the frozen snapshot: it lands in approved-changes-pending at once', async () => {
    const req = await a.post(`/api/v1/projects/${pid}/approval-requests`)
    await edit(setEnt('title', 'Edited while waiting'))
    const d = await ins.post(`/api/v1/approvals/${req.body.approval.id}/decision`, { decision: 'approved' })
    expect(d.status).toBe(200)
    expect((await state()).state).toBe('approved-changes-pending')
    expect((ent((await cur()).doc).attributes.approval as { decision: string }).decision).toBe(CHANGED_SINCE_APPROVAL)
  })
  it('students cannot decide a changed proposal (404) and still cannot self-approve (422)', async () => {
    const first = await approveNow()
    await edit(setEnt('title', 'Changed'))
    expect((await a.post(`/api/v1/approvals/${first}/decision`, { decision: 'approved' })).status).toBe(404)
    await edit((d) => [{ op: 'update-artifact', uid: ent(d).uid, fields: [{ path: 'attributes.approval', before: undefined, after: { decision: 'approved', decidedOn: '2026-10-21' } }] }], 422)
  })
})

describe('N1 (confirmation review): no self-approval through an enterprise created in the same change set', () => {
  it('reviewer’s sequence: project without ENT, then one change set creating ENT-001 and "approving" it → 422, nothing stored', async () => {
    const { emptyProject } = await import('../../src/project/model/create')
    const t2 = await t.team('Team 2')
    const c = await t.signedIn(await t.user('student', 'Team 2', { initials: 'CC' }))
    const d = emptyProject({ enterpriseName: 'x' })
    for (const x of Object.values(d.artifacts)) if (x.type === 'ENT') delete d.artifacts[x.uid]
    const made = await c.post(`/api/v1/teams/${t2}/project`, { mode: 'doc', doc: d })
    expect(made.status).toBe(201)
    const p2 = made.body.doc.project.uid as string
    const e = makeArtifact({ id: 'ENT-001', type: 'ENT', title: 'Self-Approved Enterprise', stamp: S })
    const send = (ops: Operation[]) => c.post(`/api/v1/projects/${p2}/changes`, { baseVersion: made.body.version, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'x', ops }] })
    const r = await send([{ op: 'create-artifact', artifact: e }, { op: 'update-artifact', uid: e.uid, fields: [{ path: 'attributes.approval', before: undefined, after: { decision: 'approved', decidedOn: '2026-10-21' } }] }])
    expect(r.status).toBe(422)
    expect(r.body.message).toMatch(/decided by your instructor/)
    const stored = (await c.get(`/api/v1/projects/${p2}`)).body
    expect(stored.version).toBe(made.body.version)
    expect(Object.values(stored.doc.artifacts as Record<string, { type: string }>).some((x) => x.type === 'ENT')).toBe(false)
    expect((await c.get(`/api/v1/projects/${p2}/approval`)).body.approval).toBeNull()
    // the same via a nested path, and via the milestone, are refused too
    expect((await send([{ op: 'create-artifact', artifact: e }, { op: 'update-artifact', uid: e.uid, fields: [{ path: 'attributes.approval.decision', before: undefined, after: 'approved' }] }])).status).toBe(422)
    // a new enterprise without a decision is fine and starts with none
    const ok = await send([{ op: 'create-artifact', artifact: e }])
    expect(ok.status).toBe(200)
    const ap = (Object.values(ok.body.doc.artifacts as Record<string, { type: string; attributes: { approval?: { decision?: string } } }>).find((x) => x.type === 'ENT')!.attributes.approval?.decision) ?? ''
    expect(ap).toBe('')
  })
})
