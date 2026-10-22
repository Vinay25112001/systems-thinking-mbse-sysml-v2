// Authentication: local password sign-in, server-side sessions, CSRF tokens (SECURITY_ARCHITECTURE.md §4.2–§4.4).
//   - The cookie carries an opaque 256-bit token; the database stores only SHA-256(token).
//   - The CSRF token is derived one-way from the session token (SHA-256 with a domain label), so GET auth/session can
//     return it at any time while the database stores only its hash.
//   - A new session is issued on every sign-in (rotation; the presented old session is deleted) and on password change,
//     which also revokes every other session of the user.
import { createHash, randomBytes } from 'node:crypto'
import type { Config } from '../config'
import { HttpError, sha256, type Deps, type Principal } from '../http/core'
import { burnDummy, hashPassword, passwordProblem, verifyPassword } from '../identity/passwords'
import { ACCOUNT_LOCK_MS } from '../http/rateLimit'
import type { Repos, Role, SessionRow, Store, UserRow } from '../repo/types'

export const normLogin = (s: string) => s.normalize('NFC').trim().toLowerCase()
export const csrfFor = (token: string) => createHash('sha256').update(`sls-csrf\u0000${token}`).digest('base64url')
const isStaff = (roles: Iterable<Role>) => [...roles].some((r) => r === 'instructor' || r === 'admin')

export type SessionInfo = {
  user: { id: string; displayName: string; initials: string; login: string | null }
  roles: Role[]
  team: { id: string; label: string; projectId: string | null } | null
  csrfToken: string
  expiresAt: string
  idleExpiresAt: string
  mustChangePassword: boolean
  mode: string
}

export async function principalOf(r: Repos, user: UserRow): Promise<Principal> {
  const roles = await r.identity.roles(user.id)
  const team = roles.includes('student') ? await r.teams.activeTeamOf(user.id) : null
  return { userId: user.id, user, roles: new Set(roles), teamId: team?.id ?? null, teamLabel: team?.label ?? null }
}

export async function sessionInfo(r: Repos, cfg: Config, p: Principal, s: SessionRow, token: string): Promise<SessionInfo> {
  const project = p.teamId ? await r.projects.byTeam(p.teamId) : null
  const idleUntil = new Date(Date.parse(s.lastSeenAt) + s.idleSeconds * 1000).toISOString()
  return {
    user: { id: p.user.id, displayName: p.user.displayName, initials: p.user.initials, login: await r.identity.loginOf(p.user.id) },
    roles: [...p.roles],
    team: p.teamId ? { id: p.teamId, label: p.teamLabel ?? '', projectId: project?.id ?? null } : null,
    csrfToken: csrfFor(token),
    expiresAt: s.expiresAt,
    idleExpiresAt: idleUntil < s.expiresAt ? idleUntil : s.expiresAt,
    mustChangePassword: p.user.mustChangePassword,
    mode: cfg.mode,
  }
}

export async function createSession(r: Repos, cfg: Config, userId: string, roles: Role[], now: Date): Promise<{ token: string; row: SessionRow }> {
  const token = randomBytes(32).toString('base64url')
  const staff = isStaff(roles)
  const row: SessionRow = {
    tokenHash: sha256(token),
    userId,
    csrfHash: sha256(csrfFor(token)),
    createdAt: now.toISOString(),
    lastSeenAt: now.toISOString(),
    idleSeconds: staff ? cfg.idle.staff : cfg.idle.student,
    expiresAt: new Date(now.getTime() + (staff ? cfg.absolute.staff : cfg.absolute.student) * 1000).toISOString(),
  }
  await r.identity.createSession(row)
  return { token, row }
}

/** 'live' or why the session ended. */
export function sessionState(s: SessionRow, now: Date): 'live' | 'idle' | 'expired' {
  if (Date.parse(s.expiresAt) <= now.getTime()) return 'expired'
  if (Date.parse(s.lastSeenAt) + s.idleSeconds * 1000 <= now.getTime()) return 'idle'
  return 'live'
}

const INVALID = () => new HttpError(401, 'invalid-credentials', 'The login or password is not correct.')
/** The one 429 answer of sign-in (§4.4): the same text whether the pair, the IP or the account is locked, so a locked
 *  account is not revealed as existing (M2 review L5). */
const tooMany = (sec: number) => new HttpError(429, 'locked', `Too many attempts; try again in ${Math.max(1, Math.ceil(sec / 60))} minute${sec > 60 ? 's' : ''}.`, { retryAfterSeconds: sec })

/** Verifies a login. Throws 401 with one generic message for an unknown login and a wrong password alike. */
export async function signIn(deps: Deps, loginIn: string, password: string, ip: string, oldToken: string | null): Promise<{ token: string; row: SessionRow; principal: Principal }> {
  const { store, config, limiter, clock } = deps
  const login = normLogin(loginIn)
  const gate = limiter.checkLogin(login, ip)
  if (!gate.ok) {
    await store.tx((r) => r.audit.append({ at: clock().toISOString(), actorUserId: null, actorRole: null, action: 'auth.login.throttled', outcome: 'denied', detail: { reason: gate.reason } }))
    throw tooMany(gate.retryAfterSeconds)
  }
  const found = await store.read((r) => r.identity.byLogin(login))
  // the password check happens outside any transaction (scrypt is slow and asynchronous)
  const ok = found ? await verifyPassword(password, found.cred.hash) : (await burnDummy(password, config.scryptN), false)
  const now = clock()
  const locked = !!found && !!found.cred.lockedUntil && Date.parse(found.cred.lockedUntil) > now.getTime()
  if (!found || !ok || locked || found.user.status !== 'active') {
    const pair = limiter.loginFailed(login, ip)
    await store.tx(async (r) => {
      if (found) {
        const count = limiter.accountFailed(found.user.id)
        const lockNow = count >= 50 && !locked
        await r.identity.setLoginFailures(found.user.id, found.cred.failedCount + 1, lockNow ? new Date(now.getTime() + ACCOUNT_LOCK_MS).toISOString() : found.cred.lockedUntil)
        if (lockNow) await r.audit.append({ at: now.toISOString(), actorUserId: found.user.id, actorRole: null, action: 'auth.account.locked', targetType: 'user', targetId: found.user.id, outcome: 'denied' })
      }
      await r.audit.append({ at: now.toISOString(), actorUserId: found?.user.id ?? null, actorRole: null, action: 'auth.login.fail', outcome: 'denied', detail: { pairLocked: pair.pairLocked } })
    })
    // the same answer whether or not the password was right (no password oracle on a locked account), and the same text
    // as any other throttle (no account oracle)
    if (locked) throw tooMany(Math.max(60, Math.ceil((Date.parse(found.cred.lockedUntil!) - now.getTime()) / 1000)))
    throw INVALID()
  }
  limiter.loginSucceeded(login, ip)
  return store.tx(async (r) => {
    if (oldToken) await r.identity.deleteSession(sha256(oldToken)) // rotation: the presented session ends
    await r.identity.setLoginFailures(found.user.id, 0, null)
    const principal = await principalOf(r, found.user)
    const s = await createSession(r, config, found.user.id, [...principal.roles], now)
    await r.audit.append({ at: now.toISOString(), actorUserId: found.user.id, actorRole: [...principal.roles].join(','), action: 'auth.login', outcome: 'ok' })
    return { ...s, principal }
  })
}

/** Password change: rate-limited per session and per account (M2 review M6); the current password is re-checked; every
 *  other session ends and this one is replaced. */
export async function changePassword(deps: Deps, p: Principal, current: string, next: string, sessionKey: string, sessionCreatedAt = ''): Promise<{ token: string; row: SessionRow }> {
  const { store, config, clock, limiter } = deps
  const gate = limiter.checkPasswordChange(p.userId, sessionKey, Date.parse(sessionCreatedAt) || 0)
  if (!gate.ok) {
    await store.tx((r) => r.audit.append({ at: clock().toISOString(), actorUserId: p.userId, actorRole: [...p.roles].join(','), action: 'auth.password.throttled', outcome: 'denied', detail: { reason: gate.reason } }))
    throw tooMany(gate.retryAfterSeconds)
  }
  const login = (await store.read((r) => r.identity.loginOf(p.userId))) ?? ''
  const found = await store.read((r) => r.identity.byLogin(login))
  if (!found || !(await verifyPassword(current, found.cred.hash, 'low'))) {
    limiter.passwordChangeFailed(p.userId)
    await store.tx((r) => r.audit.append({ at: clock().toISOString(), actorUserId: p.userId, actorRole: [...p.roles].join(','), action: 'auth.password.fail', outcome: 'denied' }))
    throw new HttpError(400, 'invalid-credentials', 'The current password is not correct.')
  }
  const problem = passwordProblem(next, { login, displayName: p.user.displayName })
  if (problem) throw new HttpError(400, 'bad-request', problem)
  if (next === current) throw new HttpError(400, 'bad-request', 'Choose a password different from the current one.')
  const hash = await hashPassword(next, config.scryptN, 'low')
  const now = clock()
  return store.tx(async (r) => {
    await r.identity.setPassword(p.userId, hash, false, now.toISOString())
    await r.identity.deleteSessionsOf(p.userId)
    await r.audit.append({ at: now.toISOString(), actorUserId: p.userId, actorRole: [...p.roles].join(','), action: 'auth.password.change', outcome: 'ok' })
    return createSession(r, config, p.userId, [...p.roles], now)
  })
}

export async function signOut(store: Store, tokenHash: string, userId: string, now: Date) {
  await store.tx(async (r) => {
    await r.identity.deleteSession(tokenHash)
    await r.audit.append({ at: now.toISOString(), actorUserId: userId, actorRole: null, action: 'auth.logout', outcome: 'ok' })
  })
}
