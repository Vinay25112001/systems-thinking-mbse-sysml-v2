// Enterprise approval flow (PROJECT_DATA_SCHEMA.md §5.2): pending → revision-requested → (resubmit) → approved; the
// instructor decides against a frozen proposal snapshot; the decision is mirrored into the document by a server change
// set that the existing Week 1 readers understand; students can neither decide nor self-approve.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { toTeamRecord } from '../../src/project/adapters/week1'
import type { ProjectDoc } from '../../src/project/model/types'
import { approvalOf } from '../../src/workbench/week1/team'
import { cid, Client, createTeamProject, startTest, type T } from './helpers'

let t: T
let student: Client
let mate: Client
let instructor: Client
let pid: string
const ent = (d: ProjectDoc) => Object.values(d.artifacts).find((x) => x.type === 'ENT')!

beforeAll(async () => {
  t = await startTest()
  student = await t.signedIn(await t.user('student', 'Team 1', { initials: 'SA' }))
  mate = await t.signedIn(await t.user('student', 'Team 1', { initials: 'SB' }))
  instructor = await t.signedIn(await t.user('instructor', undefined, { initials: 'PR' }))
  const r = await createTeamProject(student, await t.team('Team 1'), 'Riverside Ferry Collective')
  pid = r.body.doc.project.uid
})
afterAll(async () => t.close())

describe('enterprise approval', () => {
  let first: string
  it('a member requests approval: pending, a frozen proposal snapshot, and the document says "submitted for approval"', async () => {
    expect((await student.get(`/api/v1/projects/${pid}/approval`)).body.approval).toBeNull()
    const r = await student.post(`/api/v1/projects/${pid}/approval-requests`)
    expect(r.status).toBe(201)
    expect(r.body.approval.state).toBe('pending')
    expect(r.body.approval.requestedBy).toBe('SA')
    first = r.body.approval.id
    const p = (await mate.get(`/api/v1/projects/${pid}`)).body
    expect(ent(p.doc).attributes.approval).toEqual({ decision: 'pending', decidedOn: '' })
    const snaps = (await mate.get(`/api/v1/projects/${pid}/snapshots`)).body.snapshots
    expect(snaps.some((s: { kind: string }) => s.kind === 'proposal')).toBe(true)
    expect((await mate.post(`/api/v1/projects/${pid}/approval-requests`)).status).toBe(409)
  })
  it('students cannot decide (404) and cannot self-approve through an edit (422)', async () => {
    expect((await student.post(`/api/v1/approvals/${first}/decision`, { decision: 'approved' })).status).toBe(404)
    expect((await student.get('/api/v1/approvals')).status).toBe(404)
    const p = (await student.get(`/api/v1/projects/${pid}`)).body
    const r = await student.post(`/api/v1/projects/${pid}/changes`, { baseVersion: p.version, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'self-approve', ops: [{ op: 'update-artifact', uid: ent(p.doc).uid, fields: [{ path: 'attributes.approval.decision', before: 'pending', after: 'approved' }] }] }] })
    expect(r.status).toBe(422)
  })
  it('the instructor sees the queue with the frozen proposal and requests a revision with a comment', async () => {
    const q = await instructor.get('/api/v1/approvals?state=pending')
    expect(q.status).toBe(200)
    expect(q.body.approvals).toHaveLength(1)
    expect(q.body.approvals[0].proposal.enterprise).toBe('Riverside Ferry Collective')
    expect(q.body.approvals[0].teamLabel).toBe('Team 1')
    expect((await instructor.post(`/api/v1/approvals/${first}/decision`, { decision: 'revision-requested' })).status).toBe(400) // a revision needs a comment
    const d = await instructor.post(`/api/v1/approvals/${first}/decision`, { decision: 'revision-requested', comment: 'Name the system of interest.' })
    expect(d.status).toBe(200)
    expect(d.body.approval.state).toBe('revision-requested')
    expect((await instructor.post(`/api/v1/approvals/${first}/decision`, { decision: 'approved' })).status).toBe(409) // decided once
  })
  it('the student sees the decision, the comment and the document mirror ("revise")', async () => {
    const a = (await student.get(`/api/v1/projects/${pid}/approval`)).body.approval
    expect(a.state).toBe('revision-requested')
    expect(a.comment).toBe('Name the system of interest.')
    expect(a.decidedBy).toBe('PR')
    const p = (await student.get(`/api/v1/projects/${pid}`)).body
    expect((ent(p.doc).attributes.approval as { decision: string }).decision).toBe('revise')
    const log = (await student.get(`/api/v1/projects/${pid}/changes`)).body.changes
    const review = log.at(-1)
    expect(review.source).toBe('review')
    expect(review.by).toBe('PR')
    expect(review.authenticated).toBe(true)
  })
  it('a resubmission supersedes the earlier request; approval is mirrored so the Week 1 readers report "approved"', async () => {
    const r = await mate.post(`/api/v1/projects/${pid}/approval-requests`)
    expect(r.status).toBe(201)
    const d = await instructor.post(`/api/v1/approvals/${r.body.approval.id}/decision`, { decision: 'approved', comment: 'Approved for Week 2.' })
    expect(d.status).toBe(200)
    const a = (await student.get(`/api/v1/projects/${pid}/approval`)).body.approval
    expect(a.state).toBe('approved')
    const p: ProjectDoc = (await student.get(`/api/v1/projects/${pid}`)).body.doc
    expect(ent(p).attributes.approval).toEqual({ decision: 'approved', decidedOn: '2026-10-21' })
    expect(p.milestones.find((m) => m.week === 1)!.approval).toEqual({ decision: 'approved', decidedOn: '2026-10-21' })
    expect(approvalOf(toTeamRecord(p).proposal, '2026-10-22')).toBe('approved')
    const audit = (t.store.db.prepare("SELECT COUNT(*) AS n FROM audit_log WHERE action = 'approval.decide'").get() as { n: number }).n
    expect(audit).toBe(2)
    expect((await student.post(`/api/v1/projects/${pid}/approval-requests`)).status).toBe(409) // already approved
  })
})
