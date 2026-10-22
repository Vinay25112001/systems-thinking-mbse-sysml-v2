// Accounts and teams (SECURITY_ARCHITECTURE.md §4.5, §5.2; PROJECT_DATA_SCHEMA.md §3). Accounts are created by an
// instructor (students) or an admin (any role) with a one-time temporary password; there is no self-registration.
// Teams are instructor-assigned; a student may also join with an instructor-issued code (hashed, expiring, use-limited).
// Membership history is kept (left_at), and every change re-projects Team.members into the project.
import { sha256, badRequest, HttpError, isObj, str, type Deps, type Principal } from '../http/core'
import { hashPassword, randomBase32, temporaryPassword } from '../identity/passwords'
import type { InstructorContext } from '../authz/policy'
import { isAdmin } from '../authz/policy'
import type { Repos, Role, TeamRow, UserRow } from '../repo/types'
import { normLogin } from './auth'
import { syncMembers } from './projects'

const LOGIN_RE = /^[a-z0-9][a-z0-9._-]{2,63}$/
const INITIALS_RE = /^[A-Za-z]{2,4}$/
const isUnique = (e: unknown) => e instanceof Error && /UNIQUE constraint failed/.test(e.message)

export type NewUser = { displayName: string; login: string; initials: string; role: Role; email: string | null; demo?: boolean }
export function parseNewUser(body: unknown): NewUser {
  if (!isObj(body)) throw badRequest('Send { displayName, login, initials, role }.')
  const login = normLogin(str(body.login, 'login', 64, { min: 3 }))
  if (!LOGIN_RE.test(login)) throw badRequest('login: 3–64 lower-case letters, digits, dot, dash or underscore.')
  const initials = str(body.initials, 'initials', 4, { min: 2 })
  if (!INITIALS_RE.test(initials)) throw badRequest('initials: 2–4 letters.')
  const role = (body.role ?? 'student') as Role
  if (!['student', 'instructor', 'admin'].includes(role)) throw badRequest('role must be student, instructor or admin.')
  const email = str(body.email, 'email', 254, { optional: true }) || null
  return { displayName: str(body.displayName, 'displayName', 120, { min: 1 }), login, initials: initials.toUpperCase(), role, email }
}

/** Creates an account; returns its temporary password ONCE (only the hash is stored). */
export async function createUser(deps: Deps, by: Principal | null, u: NewUser, opts: { password?: string; mustChange?: boolean; extraRoles?: Role[] } = {}) {
  if (by && u.role !== 'student' && !isAdmin(by)) throw new HttpError(403, 'forbidden', 'Only an administrator creates instructor or admin accounts.')
  const password = opts.password ?? temporaryPassword()
  const hash = await hashPassword(password, deps.config.scryptN)
  const at = deps.clock().toISOString()
  const row: UserRow = { id: crypto.randomUUID(), displayName: u.displayName, email: u.email, initials: u.initials, status: 'active', mustChangePassword: opts.mustChange ?? true, demo: !!u.demo, createdAt: at, createdBy: by?.userId ?? null }
  try {
    await deps.store.tx(async (r) => {
      await r.identity.createUser(row, u.login, hash, [...new Set([u.role, ...(opts.extraRoles ?? [])])], by?.userId ?? null)
      await r.audit.append({ at, actorUserId: by?.userId ?? null, actorRole: by ? [...by.roles].join(',') : 'cli', action: 'user.create', targetType: 'user', targetId: row.id, outcome: 'ok', detail: { role: u.role, demo: !!u.demo } })
    })
  } catch (e) {
    if (isUnique(e)) throw new HttpError(409, 'conflict', 'That login or email is already used.')
    throw e
  }
  return { user: { id: row.id, displayName: row.displayName, initials: row.initials, login: u.login, roles: [u.role] }, temporaryPassword: password }
}

export async function resetPassword(deps: Deps, by: Principal, userId: string) {
  const target = await deps.store.read(async (r) => ({ user: await r.identity.userById(userId), roles: await r.identity.roles(userId) }))
  if (!target.user) throw new HttpError(404, 'not-found', 'Not found.')
  if (!isAdmin(by) && target.roles.some((x) => x !== 'student')) throw new HttpError(403, 'forbidden', 'Only an administrator resets staff passwords.')
  const password = temporaryPassword()
  const hash = await hashPassword(password, deps.config.scryptN)
  const at = deps.clock().toISOString()
  await deps.store.tx(async (r) => {
    await r.identity.setPassword(userId, hash, true, at)
    await r.identity.deleteSessionsOf(userId)
    await r.audit.append({ at, actorUserId: by.userId, actorRole: [...by.roles].join(','), action: 'user.password.reset', targetType: 'user', targetId: userId, outcome: 'ok' })
  })
  return { temporaryPassword: password }
}

export async function unlockUser(deps: Deps, by: Principal, userId: string) {
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    if (!(await r.identity.userById(userId))) throw new HttpError(404, 'not-found', 'Not found.')
    await r.identity.setLoginFailures(userId, 0, null)
    await r.audit.append({ at, actorUserId: by.userId, actorRole: 'admin', action: 'auth.account.unlock', targetType: 'user', targetId: userId, outcome: 'ok' })
    return { ok: true }
  })
}

/** Accounts for staff: no hashes, no sessions, no failure counters. */
export async function listUsers(r: Repos) {
  const users = await r.identity.listUsers()
  const out = []
  for (const u of users) {
    const team = await r.teams.activeTeamOf(u.id)
    out.push({ id: u.id, displayName: u.displayName, initials: u.initials, login: u.login, roles: u.roles, status: u.status, demo: u.demo, team: team ? { id: team.id, label: team.label } : null })
  }
  return out
}

// ------------------------------------------------------------------------------------------- teams
export async function teamView(r: Repos, t: TeamRow) {
  const project = await r.projects.byTeam(t.id)
  return { id: t.id, label: t.label, maxMembers: t.maxMembers, status: t.status, members: (await r.teams.members(t.id)).map((m) => ({ userId: m.userId, displayName: m.displayName, initials: m.initials })), projectId: project?.id ?? null }
}

export async function createTeam(deps: Deps, ic: InstructorContext, body: unknown) {
  if (!isObj(body)) throw badRequest('Send { label }.')
  const label = str(body.label, 'label', 60, { min: 1 })
  const max = body.maxMembers === undefined ? 5 : Number(body.maxMembers)
  if (!Number.isInteger(max) || max < 1 || max > 8) throw badRequest('maxMembers must be 1–8.')
  const t: TeamRow = { id: crypto.randomUUID(), label, maxMembers: max, status: 'active', createdBy: ic.userId, createdAt: deps.clock().toISOString() }
  try {
    return await deps.store.tx(async (r) => {
      await r.teams.create(t)
      await r.audit.append({ at: t.createdAt, actorUserId: ic.userId, actorRole: 'instructor', action: 'team.create', targetType: 'team', targetId: t.id, outcome: 'ok' })
      return teamView(r, t)
    })
  } catch (e) {
    if (isUnique(e)) throw new HttpError(409, 'conflict', 'A team with that label exists.')
    throw e
  }
}

async function addMemberTx(r: Repos, team: TeamRow, userId: string, actor: Principal, at: string) {
  const user = await r.identity.userById(userId)
  if (!user || user.status !== 'active') throw new HttpError(404, 'not-found', 'No such account.')
  if (!(await r.identity.roles(userId)).includes('student')) throw badRequest('Only student accounts join teams.')
  if (team.status !== 'active') throw badRequest('That team is archived.')
  if ((await r.teams.members(team.id)).length >= team.maxMembers) throw new HttpError(409, 'conflict', `That team is full (${team.maxMembers}).`)
  if (await r.teams.activeTeamOf(userId)) throw new HttpError(409, 'conflict', 'That student is already in a team.')
  await r.teams.addMember(team.id, userId, actor.userId, at)
  await r.audit.append({ at, actorUserId: actor.userId, actorRole: [...actor.roles].join(','), action: 'team.member.add', targetType: 'team', targetId: team.id, outcome: 'ok', detail: { user: userId } })
  await syncMembers(r, team.id, actor, at)
}
export async function addMember(deps: Deps, ic: InstructorContext, team: TeamRow, body: unknown) {
  if (!isObj(body)) throw badRequest('Send { userId }.')
  const userId = str(body.userId, 'userId', 64, { min: 1 })
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    await addMemberTx(r, team, userId, ic, at)
    return teamView(r, team)
  })
}
export async function removeMember(deps: Deps, ic: InstructorContext, team: TeamRow, userId: string) {
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    if (!(await r.teams.removeMember(team.id, userId, ic.userId, at))) throw new HttpError(404, 'not-found', 'Not a member of that team.')
    await r.audit.append({ at, actorUserId: ic.userId, actorRole: 'instructor', action: 'team.member.remove', targetType: 'team', targetId: team.id, outcome: 'ok', detail: { user: userId } })
    await syncMembers(r, team.id, ic, at)
    return teamView(r, team)
  })
}
export async function createInvite(deps: Deps, ic: InstructorContext, team: TeamRow) {
  const code = randomBase32(5) // 8 characters, shown once
  const now = deps.clock()
  const expiresAt = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString()
  await deps.store.tx(async (r) => {
    await r.teams.createInvite(sha256(`join:${code}`), team.id, ic.userId, expiresAt, 5)
    await r.audit.append({ at: now.toISOString(), actorUserId: ic.userId, actorRole: 'instructor', action: 'team.invite.create', targetType: 'team', targetId: team.id, outcome: 'ok' })
  })
  return { code, expiresAt, maxUses: 5 }
}
export async function joinTeam(deps: Deps, p: Principal, body: unknown) {
  if (!isObj(body)) throw badRequest('Send { code }.')
  const code = str(body.code, 'code', 20, { min: 4 }).toUpperCase().replace(/[^A-Z2-7]/g, '')
  const now = deps.clock()
  return deps.store.tx(async (r) => {
    const h = sha256(`join:${code}`)
    const inv = await r.teams.invite(h)
    // one answer for unknown, expired and used-up codes (no oracle on valid codes)
    if (!inv || Date.parse(inv.expiresAt) <= now.getTime() || inv.uses >= inv.maxUses) throw new HttpError(404, 'not-found', 'That join code is not valid. Ask your instructor for a new one.')
    const team = await r.teams.get(inv.teamId)
    if (!team) throw new HttpError(404, 'not-found', 'That join code is not valid. Ask your instructor for a new one.')
    await addMemberTx(r, team, p.userId, p, now.toISOString())
    await r.teams.useInvite(h)
    return teamView(r, team)
  })
}
