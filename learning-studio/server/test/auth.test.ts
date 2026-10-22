// Authentication, sessions, CSRF, Origin/Host checks and rate limiting (SECURITY_ARCHITECTURE.md §4, §9).
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { sha256 } from '../http/core'
import { hashPassword, verifyPassword } from '../identity/passwords'
import { Client, ORIGIN, startTest, type T } from './helpers'

let t: T
beforeEach(async () => {
  t = await startTest()
})
afterEach(async () => t.close())

describe('passwords', () => {
  it('stores scrypt hashes in the self-describing format with the production cost by default', async () => {
    const h = await hashPassword('correct horse battery', 2 ** 17)
    expect(h).toMatch(/^scrypt\$v=1\$N=131072,r=8,p=1\$[A-Za-z0-9+/=]{24}\$[A-Za-z0-9+/=]{88}$/)
    expect(await verifyPassword('correct horse battery', h)).toBe(true)
    expect(await verifyPassword('correct horse batterz', h)).toBe(false)
  })
  it('never stores a plaintext password', async () => {
    const u = await t.user('student', 'Team 1')
    const rows = t.store.db.prepare('SELECT hash FROM password_credentials').all() as { hash: string }[]
    expect(rows.some((r) => r.hash.includes(u.password))).toBe(false)
    expect(rows.every((r) => r.hash.startsWith('scrypt$v=1$'))).toBe(true)
  })
})

describe('sign-in and sessions', () => {
  it('sets an HttpOnly, SameSite=Strict, Path=/ cookie without Secure on loopback HTTP, and stores only the token hash', async () => {
    const u = await t.user('student', 'Team 1')
    const c = new Client(t.base)
    const r = await c.post('/api/v1/auth/login', { login: u.login, password: u.password })
    expect(r.status).toBe(200)
    const set = r.headers.getSetCookie()[0]
    expect(set).toMatch(/^sls_session=[A-Za-z0-9_-]{43}; Path=\/; HttpOnly; SameSite=Strict; Max-Age=\d+$/)
    expect(set).not.toMatch(/Secure/)
    const token = set.split(';')[0].split('=')[1]
    const rows = t.store.db.prepare('SELECT token_hash, csrf_hash FROM sessions').all() as { token_hash: string; csrf_hash: string }[]
    expect(rows).toHaveLength(1)
    expect(rows[0].token_hash).toBe(sha256(token))
    expect(JSON.stringify(rows)).not.toContain(token)
    expect(rows[0].csrf_hash).toBe(sha256(r.body.csrfToken))
    expect(r.body.user.initials).toBe(u.initials)
    expect(r.body.roles).toEqual(['student'])
    expect(r.body.team.label).toBe('Team 1')
    expect(JSON.stringify(r.body)).not.toMatch(/scrypt|hash/i)
  })
  it('answers an unknown login and a wrong password with the same generic 401', async () => {
    const u = await t.user('student')
    const a = await t.client().post('/api/v1/auth/login', { login: u.login, password: 'not-the-password' })
    const b = await t.client().post('/api/v1/auth/login', { login: 'nobody.here', password: 'not-the-password' })
    expect(a.status).toBe(401)
    expect(b.status).toBe(401)
    expect(a.body).toEqual(b.body)
    expect(a.body.code).toBe('invalid-credentials')
  })
  it('rotates the session on sign-in: the presented old session stops working', async () => {
    const u = await t.user('student')
    const c = await t.signedIn(u)
    const oldCookie = c.cookie
    expect((await c.login(u.login, u.password)).status).toBe(200)
    expect(c.cookie).not.toBe(oldCookie)
    const stale = new Client(t.base)
    stale.cookie = oldCookie
    expect((await stale.get('/api/v1/auth/session')).status).toBe(401)
    expect((await c.get('/api/v1/auth/session')).status).toBe(200)
  })
  it('logs out: the session row is deleted and the cookie cleared', async () => {
    const c = await t.signedIn(await t.user('student'))
    const r = await c.post('/api/v1/auth/logout')
    expect(r.status).toBe(200)
    expect(r.headers.getSetCookie()[0]).toMatch(/Max-Age=0/)
    expect((t.store.db.prepare('SELECT COUNT(*) AS n FROM sessions').get() as { n: number }).n).toBe(0)
    expect((await c.get('/api/v1/auth/session')).status).toBe(401)
  })
  it('expires an idle student session after 2 h and reports session-expired', async () => {
    const c = await t.signedIn(await t.user('student'))
    t.advance(2 * 3600_000 + 1000)
    const r = await c.get('/api/v1/auth/session')
    expect(r.status).toBe(401)
    expect(r.body.code).toBe('session-expired')
  })
  it('keeps an active session alive but ends it at the absolute lifetime (12 h student)', async () => {
    const c = await t.signedIn(await t.user('student'))
    for (let i = 0; i < 11; i++) {
      t.advance(3600_000)
      expect((await c.get('/api/v1/auth/session')).status).toBe(200)
    }
    t.advance(3600_000 + 1000)
    expect((await c.get('/api/v1/auth/session')).status).toBe(401)
  })
  it('gives instructors the shorter 30-minute idle timeout', async () => {
    const c = await t.signedIn(await t.user('instructor'))
    t.advance(31 * 60_000)
    expect((await c.get('/api/v1/auth/session')).status).toBe(401)
  })
  it('a password change revokes every other session and rotates this one', async () => {
    const u = await t.user('student')
    const a = await t.signedIn(u)
    const b = await t.signedIn(u)
    const r = await a.post('/api/v1/auth/password', { current: u.password, next: 'a-much-longer-passphrase-42' })
    expect(r.status).toBe(200)
    a.csrf = r.body.csrfToken
    expect((await b.get('/api/v1/auth/session')).status).toBe(401)
    expect((await a.get('/api/v1/auth/session')).status).toBe(200)
    expect((await t.client().login(u.login, 'a-much-longer-passphrase-42')).status).toBe(200)
  })
  it('refuses weak new passwords (length, common, own name)', async () => {
    const u = await t.user('student')
    const a = await t.signedIn(u)
    expect((await a.post('/api/v1/auth/password', { current: u.password, next: 'short' })).body.message).toMatch(/12 characters/)
    expect((await a.post('/api/v1/auth/password', { current: u.password, next: 'password1234' })).status).toBe(400)
    expect((await a.post('/api/v1/auth/password', { current: u.password, next: `my-${u.login}-secret` })).body.message).toMatch(/name or login/)
  })
  it('blocks everything but the password change while a temporary password is in force', async () => {
    const u = await t.user('student', 'Team 1', { mustChange: true })
    const c = await t.signedIn(u)
    expect((await c.get('/api/v1/auth/session')).body.mustChangePassword).toBe(true)
    expect((await c.get('/api/v1/teams')).body.code).toBe('password-change-required')
    const r = await c.post('/api/v1/auth/password', { current: u.password, next: 'a-much-longer-passphrase-42' })
    c.csrf = r.body.csrfToken
    expect((await c.get('/api/v1/teams')).status).toBe(200)
  })
})

describe('CSRF, Origin, content type, Host', () => {
  it('refuses a state-changing request without the CSRF header, or with a wrong one', async () => {
    const c = await t.signedIn(await t.user('student'))
    const good = c.csrf
    c.csrf = ''
    expect((await c.post('/api/v1/auth/logout')).body.code).toBe('csrf')
    c.csrf = 'A'.repeat(43)
    expect((await c.post('/api/v1/auth/logout')).body.code).toBe('csrf')
    c.csrf = good
    expect((await c.post('/api/v1/auth/logout')).status).toBe(200)
  })
  it('refuses a foreign or missing Origin (Referer is accepted when Origin is absent)', async () => {
    const c = await t.signedIn(await t.user('student'))
    expect((await c.post('/api/v1/auth/logout', {}, { Origin: 'http://evil.example' })).body.code).toBe('origin')
    expect((await c.post('/api/v1/auth/logout', {}, { Origin: '' })).body.code).toBe('origin')
    expect((await c.post('/api/v1/auth/logout', {}, { Origin: '', Referer: `${ORIGIN}/#/project` })).status).toBe(200)
  })
  it('refuses form-encoded bodies (what a cross-site HTML form can send)', async () => {
    const u = await t.user('student')
    const r = await t.client().req('POST', '/api/v1/auth/login', `login=${u.login}&password=x`, { 'Content-Type': 'application/x-www-form-urlencoded' })
    expect(r.status).toBe(415)
  })
  it('refuses an unknown Host header (DNS rebinding) and answers with security headers', async () => {
    const bad = await t.raw('GET', '/api/v1/health', { Host: 'attacker.example:5174' })
    expect(bad.status).toBe(400)
    const r = await t.client().get('/api/v1/health')
    expect(r.status).toBe(200)
    expect(r.body).toEqual({ ok: true })
    expect(r.headers.get('content-security-policy')).toContain("frame-ancestors 'none'")
    expect(r.headers.get('x-content-type-options')).toBe('nosniff')
    expect(r.headers.get('cache-control')).toBe('no-store')
  })
  it('refuses oversized bodies before parsing (413) and prototype-polluting keys (400)', async () => {
    const c = await t.signedIn(await t.user('student'))
    expect((await c.post('/api/v1/teams/join', { code: 'x'.repeat(9000) })).status).toBe(413)
    expect((await c.req('POST', '/api/v1/teams/join', '{"__proto__":{"admin":true},"code":"ABCD"}')).status).toBe(400)
  })
})

describe('rate limiting and lockout', () => {
  it('delays a (login, IP) pair after 5 failures and locks it after 10; the right password is refused while locked', async () => {
    const u = await t.user('student')
    const c = t.client()
    for (let i = 0; i < 5; i++) expect((await c.post('/api/v1/auth/login', { login: u.login, password: 'wrong-password-x' })).status).toBe(401)
    const delayed = await c.post('/api/v1/auth/login', { login: u.login, password: u.password })
    expect(delayed.status).toBe(429)
    expect(delayed.body.message).toMatch(/Too many attempts/)
    for (let i = 0; i < 5; i++) {
      t.advance(61_000)
      await c.post('/api/v1/auth/login', { login: u.login, password: 'wrong-password-x' })
    }
    t.advance(61_000)
    const locked = await c.post('/api/v1/auth/login', { login: u.login, password: u.password })
    expect(locked.status).toBe(429)
    t.advance(15 * 60_000)
    expect((await c.post('/api/v1/auth/login', { login: u.login, password: u.password })).status).toBe(200)
    const audit = (t.store.db.prepare("SELECT action FROM audit_log WHERE action LIKE 'auth.login%'").all() as { action: string }[]).map((r) => r.action)
    expect(audit).toContain('auth.login.fail')
    expect(audit).toContain('auth.login.throttled')
    expect(audit).toContain('auth.login')
  })
  it('treats an unknown login like a real one (no enumeration through the limiter)', async () => {
    const c = t.client()
    for (let i = 0; i < 5; i++) await c.post('/api/v1/auth/login', { login: 'ghost.user', password: 'wrong-password-x' })
    expect((await c.post('/api/v1/auth/login', { login: 'ghost.user', password: 'wrong-password-x' })).status).toBe(429)
  })
  it('allows at most 30 login attempts per minute from one IP', async () => {
    const c = t.client()
    const codes: number[] = []
    for (let i = 0; i < 31; i++) codes.push((await c.post('/api/v1/auth/login', { login: `someone.${i}`, password: 'x-wrong-password' })).status)
    expect(codes.slice(0, 30).every((s) => s === 401)).toBe(true)
    expect(codes[30]).toBe(429)
  })
  it('locks an account for an hour after 50 failures, with the generic answer (L5); an admin may unlock it sooner', async () => {
    const u = await t.user('student')
    const admin = await t.signedIn(await t.user('admin'))
    // spread over many "IPs" is not possible from one test client, so drive the account counter directly
    for (let i = 0; i < 50; i++) t.app.deps.limiter.accountFailed(u.id)
    const c = t.client()
    expect((await c.post('/api/v1/auth/login', { login: u.login, password: 'wrong-password-x' })).status).toBe(401)
    const r = await c.post('/api/v1/auth/login', { login: u.login, password: u.password })
    expect(r.status).toBe(429)
    // the same text as any other throttle: a locked account is not revealed as existing
    expect(r.body.message).toMatch(/^Too many attempts; try again in \d+ minutes?\.$/)
    expect(r.body.message).not.toMatch(/account|unlock/i)
    expect((await admin.post(`/api/v1/users/${u.id}/unlock`)).status).toBe(200)
    expect((await c.post('/api/v1/auth/login', { login: u.login, password: u.password })).status).toBe(200)
  })
  it('the account lock expires by itself after an hour (L5: no permanent denial of service)', async () => {
    const u = await t.user('student')
    for (let i = 0; i < 50; i++) t.app.deps.limiter.accountFailed(u.id)
    const c = t.client()
    expect((await c.post('/api/v1/auth/login', { login: u.login, password: 'wrong-password-x' })).status).toBe(401)
    expect((await c.post('/api/v1/auth/login', { login: u.login, password: u.password })).status).toBe(429)
    t.advance(61 * 60_000)
    expect((await c.post('/api/v1/auth/login', { login: u.login, password: u.password })).status).toBe(200)
  })
})
