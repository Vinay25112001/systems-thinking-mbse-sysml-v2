// Authorization matrix (SECURITY_ARCHITECTURE.md §5.2), table-driven: every endpoint class × {anonymous, member,
// other-team student, team-less student, instructor, admin} → expected status. Hidden resources are 404 (no
// enumeration); instructors read student work and decide approvals but never write a project (403).
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { cid, Client, createTeamProject, startTest, type T } from './helpers'

let t: T
let ids: { team1: string; team2: string; project1: string; approval1: string; studentC: string }
const who: Record<string, Client> = {}

beforeAll(async () => {
  t = await startTest()
  const a = await t.user('student', 'Team 1')
  const c = await t.user('student', 'Team 2')
  const lone = await t.user('student')
  const inst = await t.user('instructor')
  const admin = await t.user('admin')
  who.anon = t.client()
  who.member = await t.signedIn(a)
  who.other = await t.signedIn(c)
  who.lone = await t.signedIn(lone)
  who.instructor = await t.signedIn(inst)
  who.admin = await t.signedIn(admin)
  const team1 = await t.team('Team 1')
  const team2 = await t.team('Team 2')
  const p = await createTeamProject(who.member, team1)
  expect(p.status).toBe(201)
  const req = await who.member.post(`/api/v1/projects/${p.body.doc.project.uid}/approval-requests`)
  expect(req.status).toBe(201)
  ids = { team1, team2, project1: p.body.doc.project.uid, approval1: req.body.approval.id, studentC: c.id }
})
afterAll(async () => t.close())

type Row = [string, string, () => unknown, Record<string, number>]
const P = () => `/api/v1/projects/${ids.project1}`
const change = () => ({ baseVersion: 999, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'x', ops: [] }] })
// expected status per principal; a 409 for the member on POST changes means "authorized, then the version check ran"
const MATRIX: Row[] = [
  ['GET', '/api/v1/health', () => undefined, { anon: 200, member: 200, other: 200, lone: 200, instructor: 200, admin: 200 }],
  ['GET', '/api/v1/auth/session', () => undefined, { anon: 401, member: 200, other: 200, lone: 200, instructor: 200, admin: 200 }],
  ['GET', '/api/v1/users', () => undefined, { anon: 401, member: 404, other: 404, lone: 404, instructor: 200, admin: 200 }],
  ['GET', '/api/v1/audit', () => undefined, { anon: 401, member: 404, other: 404, lone: 404, instructor: 404, admin: 200 }],
  ['GET', '/api/v1/teams', () => undefined, { anon: 401, member: 200, other: 200, lone: 200, instructor: 200, admin: 200 }],
  ['POST', '/api/v1/teams', () => ({ label: `X ${Math.random()}` }), { anon: 401, member: 404, other: 404, lone: 404, instructor: 201, admin: 404 }],
  ['GET', 'TEAM1', () => undefined, { anon: 401, member: 200, other: 404, lone: 404, instructor: 200, admin: 404 }],
  ['POST', 'TEAM1/members', () => ({ userId: 'nobody' }), { anon: 401, member: 404, other: 404, lone: 404, instructor: 404, admin: 404 }],
  ['POST', 'TEAM1/invites', () => ({}), { anon: 401, member: 404, other: 404, lone: 404, instructor: 201, admin: 404 }],
  ['POST', 'TEAM1/project', () => ({ mode: 'doc', doc: {} }), { anon: 401, member: 422, other: 404, lone: 404, instructor: 403, admin: 404 }],
  ['GET', 'P', () => undefined, { anon: 401, member: 200, other: 404, lone: 404, instructor: 200, admin: 404 }],
  ['GET', 'P/changes', () => undefined, { anon: 401, member: 200, other: 404, lone: 404, instructor: 200, admin: 404 }],
  ['POST', 'P/changes', change, { anon: 401, member: 409, other: 404, lone: 404, instructor: 403, admin: 404 }],
  ['GET', 'P/snapshots', () => undefined, { anon: 401, member: 200, other: 404, lone: 404, instructor: 200, admin: 404 }],
  ['GET', 'P/snapshots/SNP-001', () => undefined, { anon: 401, member: 200, other: 404, lone: 404, instructor: 200, admin: 404 }],
  ['POST', 'P/snapshots', () => ({ kind: 'manual', label: 'v' }), { anon: 401, member: 201, other: 404, lone: 404, instructor: 403, admin: 404 }],
  ['DELETE', 'P/snapshots/SNP-002', () => ({}), { anon: 401, member: 403, other: 404, lone: 404, instructor: 403, admin: 404 }],
  ['GET', 'P/export', () => undefined, { anon: 401, member: 200, other: 404, lone: 404, instructor: 200, admin: 404 }],
  ['GET', 'P/approval', () => undefined, { anon: 401, member: 200, other: 404, lone: 404, instructor: 200, admin: 404 }],
  ['POST', 'P/approval-requests', () => ({}), { anon: 401, member: 409, other: 404, lone: 404, instructor: 403, admin: 404 }],
  ['GET', '/api/v1/approvals', () => undefined, { anon: 401, member: 404, other: 404, lone: 404, instructor: 200, admin: 404 }],
  ['POST', 'A/decision', () => ({ decision: 'bogus' }), { anon: 401, member: 404, other: 404, lone: 404, instructor: 400, admin: 404 }],
  ['GET', '/api/v1/projects/does-not-exist', () => undefined, { anon: 401, member: 404, other: 404, lone: 404, instructor: 404, admin: 404 }],
]
const resolve = (p: string) => p.replace(/^TEAM1/, `/api/v1/teams/${ids.team1}`).replace(/^P(?=\/|$)/, P()).replace(/^A\//, `/api/v1/approvals/${ids.approval1}/`)

describe('authorization matrix', () => {
  for (const [method, path, body, expected] of MATRIX)
    for (const [k, status] of Object.entries(expected))
      it(`${method} ${path} as ${k} → ${status}`, async () => {
        const r = await who[k].req(method, resolve(path), body())
        expect(r.status, JSON.stringify(r.body)).toBe(status)
      })

  it('a member of another team cannot tell an existing project from a missing one', async () => {
    const a = await who.other.get(P())
    const b = await who.other.get('/api/v1/projects/00000000-0000-4000-8000-000000000000')
    expect(a.status).toBe(404)
    expect(a.body).toEqual(b.body)
  })
  it('a student sees only their own team in the team list, never other teams', async () => {
    const r = await who.member.get('/api/v1/teams')
    expect(r.body.teams.map((x: { id: string }) => x.id)).toEqual([ids.team1])
    expect((await who.lone.get('/api/v1/teams')).body.teams).toEqual([])
  })
  it('the instructor reads the project but a write is refused and nothing changes', async () => {
    const before = (await who.instructor.get(P())).body.version
    const r = await who.instructor.post(`${P()}/changes`, { baseVersion: before, changes: [{ clientChangeId: cid(), source: 'editor', summary: 'x', ops: [{ op: 'update-project', fields: [{ path: 'title', before: '', after: 'Instructor edit' }] }] }] })
    expect(r.status).toBe(403)
    expect((await who.instructor.get(P())).body.version).toBe(before)
  })
  it('a staff list never carries hashes, sessions or failure counters', async () => {
    const r = await who.instructor.get('/api/v1/users')
    expect(JSON.stringify(r.body)).not.toMatch(/scrypt|token|hash|failed|locked/i)
  })
  it('an instructor creates student accounts only; an admin may create an instructor', async () => {
    expect((await who.instructor.post('/api/v1/users', { displayName: 'New Student', login: 'new.student', initials: 'NS', role: 'student' })).status).toBe(201)
    expect((await who.instructor.post('/api/v1/users', { displayName: 'New Staff', login: 'new.staff', initials: 'NF', role: 'instructor' })).status).toBe(403)
    const r = await who.admin.post('/api/v1/users', { displayName: 'New Staff', login: 'new.staff2', initials: 'NG', role: 'instructor' })
    expect(r.status).toBe(201)
    expect(r.body.temporaryPassword).toMatch(/^[A-Z2-7]{6}(-[A-Z2-7]{6}){3}$/)
  })
  it('a student cannot assign themself to a team; only an instructor-issued code lets them join', async () => {
    expect((await who.lone.post(`/api/v1/teams/${ids.team2}/members`, { userId: 'me' })).status).toBe(404)
    const inv = await who.instructor.post(`/api/v1/teams/${ids.team2}/invites`)
    expect((await who.lone.post('/api/v1/teams/join', { code: 'WRONGCODE' })).status).toBe(404)
    const j = await who.lone.post('/api/v1/teams/join', { code: inv.body.code })
    expect(j.status).toBe(200)
    expect(j.body.label).toBe('Team 2')
    expect((await who.lone.get('/api/v1/auth/session')).body.team.label).toBe('Team 2')
    // and now the project of Team 1 is still hidden from them
    expect((await who.lone.get(P())).status).toBe(404)
  })
})
