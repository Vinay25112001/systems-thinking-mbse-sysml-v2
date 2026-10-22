// Composition root for the course server (M2; docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md §4). Decides the
// mode once per page load:
//   - offline: no server (the static student edition, VITE_BACKEND=none, has no server code path at all), or the server
//     is not reachable. My Project stays in IndexedDB, labelled "Saved in this browser only".
//   - signed-out: the server answers but nobody is signed in. Still offline storage, with a "Sign in" link.
//   - signed-in: the HTTP persistence adapter; the server holds the team's project.
// Signing in or out reloads the page, so the project store is chosen afresh (no silent switch between storages, and
// browser data is never uploaded automatically).
import { useSyncExternalStore } from 'react'

export type Role = 'student' | 'instructor' | 'admin'
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
export type BackendState = { status: 'probing' | 'offline' | 'signed-out' | 'signed-in'; session: SessionInfo | null; reason?: string }
export type ApiError = { status: number; code: string; message: string; data: Record<string, unknown> }

/** 'none' compiles the server paths out (static student edition; the app's unit tests unless VITE_BACKEND=auto);
 *  'auto' probes /api on start. */
export const BACKEND: 'none' | 'auto' = import.meta.env.VITE_BACKEND === 'none' ? 'none' : import.meta.env.VITE_BACKEND === 'auto' ? 'auto' : import.meta.env.MODE === 'test' ? 'none' : 'auto'
// written against the env value directly, so the static student build folds it away and carries no API path at all
const API = import.meta.env.VITE_BACKEND === 'none' ? '' : '/api/v1'

let state: BackendState = { status: BACKEND === 'none' ? 'offline' : 'probing', session: null, ...(BACKEND === 'none' ? { reason: 'This edition has no course server.' } : {}) }
const listeners = new Set<() => void>()
/** The account signed in last on this page (kept after the session ends), so a sign-in in place can check that the
 *  same person saves the kept edits (M2 review M4). */
let lastUser: SessionInfo['user'] | null = null
function set(next: BackendState) {
  state = next
  if (next.session) lastUser = next.session.user
  for (const l of listeners) l()
}
export const getLastUser = () => lastUser
export const getBackend = () => state
export const subscribeBackend = (fn: () => void) => {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}
export const useBackend = () => useSyncExternalStore(subscribeBackend, getBackend, getBackend)
export const hasRole = (s: SessionInfo | null, r: Role) => !!s && s.roles.includes(r)

let probing: Promise<BackendState> | null = null
/** Asks the server who is signed in (once per page; later calls share the answer). */
export function probeBackend(): Promise<BackendState> {
  if (BACKEND === 'none') return Promise.resolve(state)
  probing ??= (async () => {
    try {
      const r = await fetch(`${API}/auth/session`, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      const type = r.headers.get('content-type') ?? ''
      if (r.status === 200 && type.includes('application/json')) set({ status: 'signed-in', session: (await r.json()) as SessionInfo })
      else if (r.status === 401 && type.includes('application/json')) set({ status: 'signed-out', session: null })
      else set({ status: 'offline', session: null, reason: 'The course server is not running.' })
    } catch {
      set({ status: 'offline', session: null, reason: 'The course server cannot be reached.' })
    }
    return state
  })()
  return probing
}

const asError = async (r: Response): Promise<ApiError> => {
  let body: Record<string, unknown> = {}
  try {
    body = (await r.json()) as Record<string, unknown>
  } catch {
    /* not JSON */
  }
  return { status: r.status, code: String(body.code ?? (r.status >= 500 ? 'server' : 'error')), message: String(body.message ?? `The course server answered ${r.status}.`), data: body }
}
export class ApiFailure extends Error {
  readonly error: ApiError
  constructor(e: ApiError) {
    super(e.message)
    this.error = e
    this.name = 'ApiFailure'
  }
}

/** One JSON call to the course server, with the CSRF header on state-changing requests. Throws ApiFailure on a non-2xx
 *  answer and on a network failure (status 0, code 'network'). */
export async function api<T>(method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown, headers: Record<string, string> = {}): Promise<{ status: number; data: T; etag: string | null }> {
  if (BACKEND === 'none') throw new ApiFailure({ status: 0, code: 'network', message: 'This edition has no course server.', data: {} })
  let r: Response
  try {
    r = await fetch(`${API}${path}`, {
      method,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(method !== 'GET' ? { 'Content-Type': 'application/json', 'X-SLS-CSRF': state.session?.csrfToken ?? '' } : {}), ...headers },
      body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
    })
  } catch {
    throw new ApiFailure({ status: 0, code: 'network', message: 'The course server cannot be reached.', data: {} })
  }
  if (r.status === 304) return { status: 304, data: undefined as T, etag: r.headers.get('etag') }
  if (!r.ok) {
    const e = await asError(r)
    if (e.code === 'session-expired' || e.code === 'unauthenticated') set({ status: 'signed-out', session: null, reason: 'Signed out: sign in to save your changes.' })
    throw new ApiFailure(e)
  }
  return { status: r.status, data: (await r.json()) as T, etag: r.headers.get('etag') }
}

export async function signIn(login: string, password: string): Promise<SessionInfo> {
  const r = await api<SessionInfo>('POST', '/auth/login', { login, password })
  set({ status: 'signed-in', session: r.data })
  return r.data
}
/** The outbox keys of an account in this tab (httpProjectAdapter.ts keeps unsaved change sets there). */
export const OUTBOX_PREFIX = 'sls-outbox:v1:'
export function outboxKeys(userId: string): string[] {
  try {
    const out: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k && k.startsWith(`${OUTBOX_PREFIX}${userId}:`)) out.push(k)
    }
    return out
  } catch {
    return []
  }
}
/** An explicit sign-out removes the account's unsaved project copies from this tab (confirmation review N4; the page
 *  asks first when there are any). */
export function clearOutbox(userId: string) {
  for (const k of outboxKeys(userId)) {
    try {
      sessionStorage.removeItem(k)
    } catch {
      /* storage unavailable */
    }
  }
}
export async function signOut(): Promise<void> {
  const leaving = state.session?.user.id
  if (leaving) clearOutbox(leaving)
  try {
    await api('POST', '/auth/logout', {})
  } finally {
    set({ status: 'signed-out', session: null })
  }
}
export async function changePassword(current: string, next: string): Promise<SessionInfo> {
  const r = await api<SessionInfo>('POST', '/auth/password', { current, next })
  set({ status: 'signed-in', session: r.data })
  return r.data
}
export async function refreshSession(): Promise<BackendState> {
  probing = null
  return probeBackend()
}
