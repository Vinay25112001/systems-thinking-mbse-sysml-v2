// Test harness: an in-memory database, the real app on an ephemeral loopback port, a controllable clock, and a
// test-only fixture that creates throwaway accounts directly through the repositories (never reachable over HTTP;
// SECURITY_ARCHITECTURE.md §4.7). Clients keep their own cookie jar and CSRF token, like separate browsers.
import { createServer, request as httpRequest } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createApp } from '../app'
import { testConfig } from '../config'
import { SqliteStore } from '../repo/sqlite'
import type { Role } from '../repo/types'
import { createUser } from '../services/teams'

export const ORIGIN = 'http://127.0.0.1:5173'
let seq = 0

export type Res = { status: number; body: any; headers: Headers }
export class Client {
  cookie = ''
  csrf = ''
  readonly base: string
  constructor(base: string) {
    this.base = base
  }
  async req(method: string, path: string, body?: unknown, extra: Record<string, string> = {}): Promise<Res> {
    const headers: Record<string, string> = { Origin: ORIGIN, ...(this.cookie ? { Cookie: this.cookie } : {}), ...(this.csrf ? { 'X-SLS-CSRF': this.csrf } : {}), ...(body !== undefined || method !== 'GET' ? { 'Content-Type': 'application/json' } : {}), ...extra }
    for (const [k, v] of Object.entries(extra)) if (v === '') delete headers[k]
    const r = await fetch(this.base + path, { method, headers, body: body === undefined ? (method === 'GET' ? undefined : '') : typeof body === 'string' ? body : JSON.stringify(body) })
    const set = r.headers.getSetCookie()
    for (const c of set) {
      const [pair] = c.split(';')
      const [k, v] = pair.split('=')
      if (k === 'sls_session') this.cookie = v ? `${k}=${v}` : ''
    }
    const text = await r.text()
    let parsed: unknown = text
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      /* keep text */
    }
    return { status: r.status, body: parsed, headers: r.headers }
  }
  get = (p: string, h?: Record<string, string>) => this.req('GET', p, undefined, h)
  post = (p: string, b: unknown = {}, h?: Record<string, string>) => this.req('POST', p, b, h)
  del = (p: string) => this.req('DELETE', p, {})
  async login(login: string, password: string) {
    const r = await this.post('/api/v1/auth/login', { login, password })
    if (r.status === 200) this.csrf = r.body.csrfToken
    return r
  }
}

export type TestUser = { id: string; login: string; password: string; initials: string }
export async function startTest() {
  const config = testConfig()
  const store = new SqliteStore({ file: ':memory:' })
  let now = new Date('2026-10-21T12:00:00.000Z')
  const clock = () => new Date(now)
  const app = createApp({ config, store, clock })
  const server = createServer((q, s) => void app.handle(q, s))
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()))
  const port = (server.address() as AddressInfo).port
  config.hosts.push(`127.0.0.1:${port}`)
  const base = `http://127.0.0.1:${port}`
  const teams = new Map<string, string>()
  async function team(label: string) {
    if (teams.has(label)) return teams.get(label)!
    const id = crypto.randomUUID()
    await store.tx((r) => r.teams.create({ id, label, maxMembers: 5, status: 'active', createdBy: 'fixture', createdAt: now.toISOString() }))
    teams.set(label, id)
    return id
  }
  async function user(role: Role, teamLabel?: string, o: { mustChange?: boolean; initials?: string } = {}): Promise<TestUser> {
    seq++
    const login = `${role}.${seq}.${Math.random().toString(36).slice(2, 6)}`
    const initials = o.initials ?? `T${'ABCDEFGHJKLMNPQRSTUVWXYZ'[seq % 24]}${'ABCDEFGH'[seq % 8]}`
    const made = await createUser(app.deps, null, { displayName: `Test ${role} ${seq}`, login, initials, role, email: null }, { mustChange: o.mustChange ?? false })
    if (teamLabel) {
      const t = await team(teamLabel)
      await store.tx((r) => r.teams.addMember(t, made.user.id, 'fixture', now.toISOString()))
    }
    return { id: made.user.id, login, password: made.temporaryPassword, initials }
  }
  async function signedIn(u: TestUser) {
    const c = new Client(base)
    const r = await c.login(u.login, u.password)
    if (r.status !== 200) throw new Error(`login failed: ${r.status} ${JSON.stringify(r.body)}`)
    return c
  }
  /** Raw request with an arbitrary Host header (fetch cannot set Host). */
  function raw(method: string, path: string, headers: Record<string, string>, body = ''): Promise<{ status: number; body: string }> {
    return new Promise((resolve, reject) => {
      const q = httpRequest({ host: '127.0.0.1', port, method, path, headers }, (res) => {
        let t = ''
        res.on('data', (c) => (t += c))
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body: t }))
      })
      q.on('error', reject)
      q.end(body)
    })
  }
  return {
    base,
    port,
    store,
    app,
    config,
    team,
    user,
    signedIn,
    raw,
    client: () => new Client(base),
    advance: (ms: number) => (now = new Date(now.getTime() + ms)),
    close: async () => {
      await new Promise<void>((r) => server.close(() => r()))
      store.close()
    },
  }
}
export type T = Awaited<ReturnType<typeof startTest>>

/** A team project created through the API by a member (an empty project built like the browser builds one). */
export async function createTeamProject(c: Client, teamId: string, enterpriseName = 'Harbor Shuttle Cooperative') {
  const { emptyProject } = await import('../../src/project/model/create')
  const doc = emptyProject({ teamLabel: 'ignored', initials: 'ZZ', enterpriseName })
  return c.post(`/api/v1/teams/${teamId}/project`, { mode: 'doc', doc, changes: [], clientChangeId: `create-${crypto.randomUUID()}` })
}
let cc = 0
export const cid = () => `test-${Date.now().toString(36)}-${++cc}-${Math.random().toString(36).slice(2, 8)}`
