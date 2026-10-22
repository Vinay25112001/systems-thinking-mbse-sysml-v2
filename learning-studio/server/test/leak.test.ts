// Faculty-only data is never serialised to students (SECURITY_ARCHITECTURE.md §6 item 5, the server-side analogue of
// check-student-build.mjs). M2's faculty-only field is the instructor's private note on an approval decision, kept in
// its own faculty table (M2 review M5); the credential and session secrets are checked alongside. A student crawls every
// GET route of the route table with valid IDs, through every approval state (revision requested, approved, changed
// since approval, re-approved), plus the error bodies of a refused write and a refused re-review; no marker may appear.
// The check is then proven able to fail: the instructor's crawl finds every note.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ROUTES } from '../routes'
import { cid, Client, createTeamProject, startTest, type T } from './helpers'

const NOTE = 'FACULTY-ONLY-MARKER-7f3a9c'
const NOTE2 = 'FACULTY-ONLY-MARKER-approved-41d2'
const NOTE3 = 'FACULTY-ONLY-MARKER-rereview-9b07'
let errorBodies = ''
let t: T
let student: Client
let instructor: Client
let paths: string[] = []
let secrets: string[] = []

beforeAll(async () => {
  t = await startTest()
  const a = await t.user('student', 'Team 1')
  student = await t.signedIn(a)
  instructor = await t.signedIn(await t.user('instructor'))
  const team1 = await t.team('Team 1')
  const p = await createTeamProject(student, team1)
  const pid = p.body.doc.project.uid
  const req = await student.post(`/api/v1/projects/${pid}/approval-requests`)
  const d = await instructor.post(`/api/v1/approvals/${req.body.approval.id}/decision`, { decision: 'revision-requested', comment: 'Narrow the problem statement.', privateNote: NOTE })
  expect(d.status).toBe(200)
  // through the H1 states: approved (note 2) → changed since approval → re-approved (note 3)
  const req2 = await student.post(`/api/v1/projects/${pid}/approval-requests`)
  expect((await instructor.post(`/api/v1/approvals/${req2.body.approval.id}/decision`, { decision: 'approved', privateNote: NOTE2 })).status).toBe(200)
  const p1 = (await student.get(`/api/v1/projects/${pid}`)).body
  const ent = Object.values(p1.doc.artifacts as Record<string, { type: string; uid: string; title: string }>).find((x) => x.type === 'ENT')!
  const w = await student.post(`/api/v1/projects/${pid}/changes`, { baseVersion: p1.version, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'rename', ops: [{ op: 'update-artifact', uid: ent.uid, fields: [{ path: 'title', before: ent.title, after: 'Renamed after approval' }] }] }] })
  expect(w.status).toBe(200)
  const pendingView = (await instructor.get('/api/v1/approvals?state=approved-changes-pending')).body.approvals[0]
  // error bodies a student can provoke: a refused write (422) and a stale write (409)
  errorBodies += JSON.stringify((await student.post(`/api/v1/projects/${pid}/changes`, { baseVersion: w.body.version, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'x', ops: [{ op: 'update-artifact', uid: ent.uid, fields: [{ path: 'attributes.approval', before: null, after: { decision: 'approved' } }] }] }] })).body)
  errorBodies += JSON.stringify((await student.post(`/api/v1/projects/${pid}/changes`, { baseVersion: 1, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'x', ops: [] }] })).body)
  errorBodies += JSON.stringify((await student.post(`/api/v1/approvals/${pendingView.id}/decision`, { decision: 'approved', currentHash: pendingView.currentHash })).body)
  expect((await instructor.post(`/api/v1/approvals/${pendingView.id}/decision`, { decision: 'approved', privateNote: NOTE3, currentHash: pendingView.currentHash })).status).toBe(200)
  const ids: Record<string, string> = { id: pid, snp: 'SNP-002', uid: a.id }
  // every GET route, with the parameter values of the seeded team (team routes take the team id)
  paths = ROUTES.filter((r) => r.method === 'GET').map((r) => r.path.replace(':id', r.path.startsWith('/api/v1/teams/') ? team1 : ids.id).replace(':snp', ids.snp))
  const rows = t.store.db.prepare('SELECT hash FROM password_credentials').all() as { hash: string }[]
  const sess = t.store.db.prepare('SELECT token_hash, csrf_hash FROM sessions').all() as { token_hash: string; csrf_hash: string }[]
  secrets = [...rows.map((r) => r.hash.split('$').pop()!), ...sess.flatMap((s) => [s.token_hash, s.csrf_hash])]
})
afterAll(async () => t.close())

async function crawl(c: Client) {
  const bodies: string[] = []
  for (const p of paths) {
    const r = await c.get(p)
    bodies.push(`${p} ${r.status} ${JSON.stringify(r.body)}`)
  }
  return bodies.join('\n')
}

describe('faculty-only data never reaches a student', () => {
  it('covers every GET route of the route table', () => {
    expect(paths.length).toBe(ROUTES.filter((r) => r.method === 'GET').length)
    expect(paths.length).toBeGreaterThanOrEqual(10)
  })
  it('the student crawl contains neither the private notes nor any credential or session hash', async () => {
    const all = (await crawl(student)) + errorBodies
    expect(all).toContain('Narrow the problem statement.') // the comment IS for the team
    for (const n of [NOTE, NOTE2, NOTE3]) expect(all).not.toContain(n)
    expect(all).not.toMatch(/FACULTY-ONLY/)
    expect(all).not.toMatch(/currentHash|"diff"/) // the instructor's review data stays with the instructor
    for (const s of secrets) expect(all).not.toContain(s)
    expect(all).not.toMatch(/privateNote/)
  })
  it('the check can fail: the instructor crawl finds the private notes', async () => {
    const all = await crawl(instructor)
    expect(all).toContain(NOTE3) // the latest approval (project approval route)
    const queue = JSON.stringify((await instructor.get('/api/v1/approvals')).body)
    for (const n of [NOTE, NOTE2, NOTE3]) expect(queue).toContain(n)
  })
})
