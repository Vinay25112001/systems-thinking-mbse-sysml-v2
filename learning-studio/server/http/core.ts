// HTTP building blocks: the error model ({code, message}, never stack traces, SQL or paths), cookies, the body reader
// with a streaming size limit, and the route/context types shared by the route table and the app.
import type { IncomingMessage } from 'node:http'
import { createHash, timingSafeEqual } from 'node:crypto'
import type { Config } from '../config'
import type { Role, SessionRow, Store, UserRow } from '../repo/types'
import type { RateLimiter } from './rateLimit'

export type ErrorCode = 'bad-request' | 'unauthenticated' | 'session-expired' | 'csrf' | 'origin' | 'forbidden' | 'not-found' | 'method' | 'conflict' | 'integrity' | 'too-large' | 'media-type' | 'rate-limited' | 'password-change-required' | 'invalid-credentials' | 'locked' | 'server' | 'bad-host' | 'busy'
export class HttpError extends Error {
  readonly status: number
  readonly code: ErrorCode
  readonly data?: Record<string, unknown>
  constructor(status: number, code: ErrorCode, message: string, data?: Record<string, unknown>) {
    super(message)
    this.status = status
    this.code = code
    this.data = data
  }
}
export const notFound = () => new HttpError(404, 'not-found', 'Not found.')
export const badRequest = (message: string) => new HttpError(400, 'bad-request', message)

export type Principal = { userId: string; user: UserRow; roles: ReadonlySet<Role>; teamId: string | null; teamLabel: string | null }
export type Deps = { config: Config; store: Store; clock: () => Date; limiter: RateLimiter }
export type Ctx = {
  req: IncomingMessage
  method: string
  url: URL
  params: Record<string, string>
  body: unknown
  ip: string
  now: Date
  principal: Principal | null
  session: SessionRow | null
  /** The raw cookie token of this request (never stored; only its hash is). */
  token: string | null
  cookies: string[]
  deps: Deps
}
export type Reply = { status?: number; body?: unknown; headers?: Record<string, string> }

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')
export const safeEqualHex = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/** Every value of every cookie in the header. A malformed percent-encoding skips that pair instead of failing the whole
 *  request (M2 review L4: a cookie planted by another localhost port must not turn every request into a 500). */
export function cookieValues(header: string | undefined): Map<string, string[]> {
  const out = new Map<string, string[]>()
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=')
    if (i <= 0) continue
    const k = part.slice(0, i).trim()
    let v: string
    try {
      v = decodeURIComponent(part.slice(i + 1).trim())
    } catch {
      continue
    }
    out.set(k, [...(out.get(k) ?? []), v])
  }
  return out
}
export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of cookieValues(header)) out[k] = v[0]
  return out
}
export function sessionCookie(cfg: Config, token: string | null, maxAgeSeconds: number): string {
  const attrs = [`${cfg.cookieName}=${token ?? ''}`, 'Path=/', 'HttpOnly', 'SameSite=Strict']
  if (cfg.cookieSecure) attrs.push('Secure')
  attrs.push(token ? `Max-Age=${maxAgeSeconds}` : 'Max-Age=0')
  return attrs.join('; ')
}

/** Reads the body, refusing (413) as soon as it exceeds `limit` bytes, before anything is parsed. */
export function readBody(req: IncomingMessage, limit: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers['content-length'] ?? 0)
    if (declared > limit) {
      req.resume()
      return reject(new HttpError(413, 'too-large', `The request is larger than ${Math.round(limit / 1024)} KB.`))
    }
    let size = 0
    const chunks: Buffer[] = []
    let failed = false
    req.on('data', (c: Buffer) => {
      if (failed) return
      size += c.length
      if (size > limit) {
        failed = true
        req.resume()
        reject(new HttpError(413, 'too-large', `The request is larger than ${Math.round(limit / 1024)} KB.`))
        return
      }
      chunks.push(c)
    })
    req.on('end', () => !failed && resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', (e) => !failed && reject(e))
  })
}

// ------------------------------------------------------------------------------------------- untrusted input
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/
/** Checks a parsed JSON value: depth, string lengths, no control characters other than \n, \r and \t. Returns the path
 *  of the first problem, or null. (Strings are capped at 20,000 characters, the notes limit of §7.) */
export function jsonProblem(v: unknown, path = 'body', depth = 0): string | null {
  if (depth > 24) return `${path}: nested too deeply`
  if (typeof v === 'string') return v.length > 20_000 ? `${path}: text longer than 20,000 characters` : CONTROL.test(v) ? `${path}: control characters are not allowed` : null
  if (v === null || typeof v === 'number' || typeof v === 'boolean') return typeof v === 'number' && !Number.isFinite(v) ? `${path}: not a finite number` : null
  if (Array.isArray(v)) {
    if (v.length > 20_000) return `${path}: list too long`
    for (let i = 0; i < v.length; i++) {
      const p = jsonProblem(v[i], `${path}[${i}]`, depth + 1)
      if (p) return p
    }
    return null
  }
  if (typeof v === 'object') {
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') return `${path}.${k}: reserved key`
      const p = jsonProblem(x, `${path}.${k}`, depth + 1)
      if (p) return p
    }
    return null
  }
  return `${path}: unsupported value`
}
export const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
export function str(x: unknown, field: string, max: number, opts: { min?: number; optional?: boolean } = {}): string {
  if (x === undefined || x === null) {
    if (opts.optional) return ''
    throw badRequest(`${field} is required.`)
  }
  if (typeof x !== 'string') throw badRequest(`${field} must be text.`)
  const v = x.normalize('NFC').trim()
  if (v.length < (opts.min ?? 0)) throw badRequest(`${field} is required.`)
  if (v.length > max) throw badRequest(`${field} is longer than ${max} characters.`)
  if (CONTROL.test(v)) throw badRequest(`${field} contains control characters.`)
  return v
}
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
