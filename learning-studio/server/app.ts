// The request pipeline (SECURITY_ARCHITECTURE.md §4.3, §7, §9, §11): security headers → Host allow-list (DNS
// rebinding) → route match → for state-changing requests JSON-only + Origin check → body size limit → JSON boundary
// check → session (idle and absolute expiry) → 401 / per-session rate limit → CSRF token → password-change gate → resource
// load + authorize() (the single choke point) → handler. Errors are always {code, message}; no stack traces, SQL or
// paths. The log line holds the route pattern, status, duration and an anonymised user id: never bodies, tokens or
// cookies.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { authorize } from './authz/policy'
import type { Config } from './config'
import { cookieValues, HttpError, jsonProblem, readBody, safeEqualHex, sha256, type Ctx, type Deps, type Reply } from './http/core'
import { RateLimiter } from './http/rateLimit'
import { ScryptBusy } from './identity/passwords'
import type { Store } from './repo/types'
import { matchPath, ROUTES, type Route } from './routes'
import { principalOf, sessionState } from './services/auth'

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const DEFAULT_LIMIT = 256 * 1024

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cache-Control': 'no-store',
}

export type App = { handle: (req: IncomingMessage, res: ServerResponse) => Promise<void>; deps: Deps }

export function createApp(o: { config: Config; store: Store; clock?: () => Date; limiter?: RateLimiter }): App {
  const clock = o.clock ?? (() => new Date())
  const deps: Deps = { config: o.config, store: o.store, clock, limiter: o.limiter ?? new RateLimiter(() => clock().getTime()) }

  function send(res: ServerResponse, r: Reply, cookies: string[]) {
    const status = r.status ?? 200
    const headers: Record<string, string | string[]> = { ...SECURITY_HEADERS, ...(r.headers ?? {}) }
    if (cookies.length) headers['Set-Cookie'] = cookies
    if (status === 304 || r.body === undefined) {
      res.writeHead(status, headers)
      res.end()
      return
    }
    const text = JSON.stringify(r.body)
    headers['Content-Type'] = 'application/json; charset=utf-8'
    headers['Content-Length'] = String(Buffer.byteLength(text))
    res.writeHead(status, headers)
    res.end(text)
  }
  const fail = (e: HttpError): Reply => ({ status: e.status, body: { code: e.code, message: e.message, ...(e.data ?? {}) }, ...(e.code === 'rate-limited' || e.code === 'locked' ? { headers: { 'Retry-After': String(e.data?.retryAfterSeconds ?? 60) } } : {}) })

  async function handle(req: IncomingMessage, res: ServerResponse) {
    const started = Date.now()
    const cookies: string[] = []
    let pattern = '-'
    let user = '-'
    let status = 500
    try {
      const host = String(req.headers.host ?? '')
      if (!o.config.hosts.includes(host)) throw new HttpError(400, 'bad-host', 'Unknown host.')
      const url = new URL(req.url ?? '/', `http://${host}`)
      const method = (req.method ?? 'GET').toUpperCase()
      if (!url.pathname.startsWith('/api/')) throw new HttpError(404, 'not-found', 'Not found.')
      let route: Route | undefined
      let params: Record<string, string> = {}
      let pathMatched = false
      for (const r of ROUTES) {
        const m = matchPath(r.path, url.pathname)
        if (!m) continue
        pathMatched = true
        if (r.method === method) {
          route = r
          params = m
          break
        }
      }
      if (!route) throw pathMatched ? new HttpError(405, 'method', 'Method not allowed.') : new HttpError(404, 'not-found', 'Not found.')
      pattern = `${method} ${route.path}`

      // CSRF layer 3 and form-post refusal: a cross-site HTML form can send neither JSON nor our Origin
      const mutating = MUTATING.has(method)
      if (mutating) {
        const ct = String(req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase()
        if (ct !== 'application/json') throw new HttpError(415, 'media-type', 'Send JSON (Content-Type: application/json).')
        const origin = req.headers.origin ?? (req.headers.referer ? safeOrigin(String(req.headers.referer)) : undefined)
        if (!origin || !o.config.origins.includes(String(origin))) throw new HttpError(403, 'origin', 'This request did not come from the course app.')
      }
      let body: unknown = undefined
      if (mutating) {
        const text = await readBody(req, route.limit ?? DEFAULT_LIMIT)
        if (text.trim()) {
          try {
            body = JSON.parse(text)
          } catch {
            throw new HttpError(400, 'bad-request', 'The request body is not valid JSON.')
          }
          const problem = jsonProblem(body)
          if (problem) throw new HttpError(400, 'bad-request', `Refused: ${problem}.`)
        }
      }

      // session
      const now = clock()
      // two session cookies (one shadowing the other, e.g. planted from another localhost port with a longer Path) are
      // refused rather than resolved by order (M2 review L4)
      const sessionCookies = (cookieValues(req.headers.cookie).get(o.config.cookieName) ?? []).filter(Boolean)
      const duplicate = sessionCookies.length > 1
      const token = duplicate ? null : (sessionCookies[0] ?? null)
      const ctx: Ctx = { req, method, url, params, body, ip: req.socket.remoteAddress ?? '?', now, principal: null, session: null, token: null, cookies, deps }
      let expired = false
      if (token && /^[A-Za-z0-9_-]{20,100}$/.test(token)) {
        const th = sha256(token)
        const s = await o.store.read((r) => r.identity.session(th))
        if (s) {
          if (sessionState(s, now) !== 'live') {
            expired = true
            await o.store.tx((r) => r.identity.deleteSession(th))
            cookies.push(`${o.config.cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${o.config.cookieSecure ? '; Secure' : ''}`)
          } else {
            const u = await o.store.read((r) => r.identity.userById(s.userId))
            if (u && u.status === 'active') {
              ctx.session = s
              ctx.token = token
              ctx.principal = await o.store.read((r) => principalOf(r, u))
              user = sha256(`user:${u.id}`).slice(0, 10)
            }
          }
        } else expired = true
      }
      if (route.action !== 'public') {
        if (duplicate) throw new HttpError(401, 'unauthenticated', 'The browser sent two session cookies; sign out, close other local pages and sign in again.')
        if (!ctx.principal || !ctx.session) throw new HttpError(401, expired ? 'session-expired' : 'unauthenticated', expired ? 'Signed out: sign in to save your changes.' : 'Sign in first.')
        const hit = deps.limiter.hitSession(ctx.session.tokenHash)
        if (!hit.ok) throw new HttpError(429, 'rate-limited', 'Too many requests; slow down for a minute.', { retryAfterSeconds: hit.retryAfterSeconds })
        if (mutating) {
          const header = String(req.headers['x-sls-csrf'] ?? '')
          if (!header || !safeEqualHex(sha256(header), ctx.session.csrfHash)) throw new HttpError(403, 'csrf', 'The security token is missing or out of date. Reload the page.')
        }
        if (ctx.principal.user.mustChangePassword && !route.passwordChange) throw new HttpError(403, 'password-change-required', 'Change your temporary password first.')
      }

      // the single authorization choke point
      let resource = { kind: 'none' } as Parameters<Route['handle']>[1]
      if (route.action !== 'public') {
        if (route.load) {
          const loaded = await route.load(ctx)
          if (!loaded) throw new HttpError(404, 'not-found', 'Not found.')
          resource = loaded
        }
        const d = authorize(ctx.principal, route.action, resource)
        if (d === 'not-found') throw new HttpError(404, 'not-found', 'Not found.')
        if (d === 'forbidden') throw new HttpError(403, 'forbidden', 'Instructors can read student projects but never change them.')
      }
      const reply = await route.handle(ctx, resource)
      // idle expiry: last_seen_at is written at most once a minute per session
      if (ctx.session && ctx.token && route.path !== '/api/v1/auth/logout' && now.getTime() - Date.parse(ctx.session.lastSeenAt) > 60_000) {
        const th = ctx.session.tokenHash
        await o.store.tx((r) => r.identity.touchSession(th, now.toISOString())).catch(() => undefined)
      }
      status = reply.status ?? 200
      send(res, reply, cookies)
    } catch (e) {
      const err = e instanceof HttpError ? e : e instanceof ScryptBusy ? new HttpError(503, 'busy', e.message) : null
      if (!err && o.config.log) console.error(JSON.stringify({ at: new Date().toISOString(), level: 'error', route: pattern, error: e instanceof Error ? e.message : String(e) }))
      const reply = err ? fail(err) : { status: 500, body: { code: 'server', message: 'Something went wrong on the course server. Your changes were not saved; try again.' } }
      status = reply.status ?? 500
      if (!res.headersSent) send(res, reply, cookies)
    } finally {
      if (o.config.log) console.log(JSON.stringify({ at: new Date().toISOString(), method: req.method, route: pattern, status, ms: Date.now() - started, user }))
    }
  }
  return { handle, deps }
}

function safeOrigin(referer: string): string | undefined {
  try {
    return new URL(referer).origin
  } catch {
    return undefined
  }
}
