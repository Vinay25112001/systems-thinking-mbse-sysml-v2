// Student consumption of published content (M3; CONTENT_PUBLISHING_DESIGN.md §7.1, §7.2). When the course server is
// reachable and someone is signed in, the Learn reader and the homepage show the latest PUBLISHED version; otherwise
// (offline, GitHub Pages, the static student build, signed out) the bundled code content renders unchanged.
//   - First load: the published payload is applied as soon as it arrives (before reading starts).
//   - Afterwards a new release NEVER swaps text under a reader: the release is re-checked on window focus, when the tab
//     becomes visible, on route change and every 5 minutes (`?contentPoll=<ms>` shortens it for tests); a newer release
//     that changes this scope raises the polite "Updated content available" banner, and only the reader's choice
//     applies it. Projects, progress and practice live in other stores and are never touched.
// The static student build (VITE_BACKEND=none) compiles every server path out: OFF is a compile-time constant.
import { api } from '../services/backend'
import { getBackend, probeBackend } from '../services/backend'
import { setLearnOverlay, type LearnOverlay } from '../week1/learn/published'
import { COURSE_INTRO_ID, COURSE_SETTINGS_ID, sectionIdOf, type CourseIntroBody, type CourseSettingsBody, type Scope, type SectionBody, type StudentPayload } from './types'

export const OFF = import.meta.env.VITE_BACKEND === 'none'

export type ScopeState = {
  status: 'bundled' | 'live'
  releaseId: string | null
  applied: StudentPayload | null
  /** A newer publication the reader has not chosen to show yet. */
  pending: { payload: StudentPayload; changed: number } | null
}
const fresh = (): ScopeState => ({ status: 'bundled', releaseId: null, applied: null, pending: null })
let states: Record<Scope, ScopeState> = { course: fresh(), week1: fresh() }
const started = new Set<Scope>()
const listeners = new Set<() => void>()
const notify = () => {
  for (const l of listeners) l()
}
export const getContentState = (scope: Scope) => states[scope]
export function subscribeContent(fn: () => void) {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}
const setState = (scope: Scope, s: ScopeState) => {
  states = { ...states, [scope]: s }
  notify()
}

// ------------------------------------------------------------------------------------------- payload guards
const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
export const isSectionBody = (b: unknown): b is SectionBody => isObj(b) && typeof b.title === 'string' && Array.isArray(b.blocks) && b.blocks.every((x) => isObj(x) && typeof x.id === 'string' && typeof x.kind === 'string')
export const isIntroBody = (b: unknown): b is CourseIntroBody =>
  isObj(b) && typeof b.title === 'string' && typeof b.lede === 'string' && Array.isArray(b.what) && b.what.length >= 3 && Array.isArray(b.phases) && Array.isArray(b.aerolink) && Array.isArray(b.enterprise) && Array.isArray(b.submit) && Array.isArray(b.stages) && typeof b.start === 'string'
export const isSettingsBody = (b: unknown): b is CourseSettingsBody => isObj(b) && typeof b.department_label === 'string' && typeof b.department_label_verified === 'boolean'
const isPayload = (p: unknown): p is StudentPayload => isObj(p) && typeof p.releaseId === 'string' && isObj(p.items) && Array.isArray(p.withdrawn)

/** The Learn overlay of a week payload: valid section bodies by section id, publication meta and withdrawn sections. */
export function toLearnOverlay(p: StudentPayload): LearnOverlay {
  const sections: LearnOverlay['sections'] = {}
  const meta: LearnOverlay['meta'] = {}
  for (const [itemId, it] of Object.entries(p.items)) {
    const sid = sectionIdOf(itemId)
    if (!sid || !isSectionBody(it.body)) continue
    sections[sid] = it.body
    meta[sid] = { seq: it.seq, publishedAt: it.publishedAt }
  }
  return { sections, meta, withdrawn: new Set(p.withdrawn.map((id) => sectionIdOf(id)).filter((x): x is string => !!x)) }
}
export function courseBodies(p: StudentPayload | null): { intro: CourseIntroBody | null; settings: CourseSettingsBody | null } {
  const intro = p?.items[COURSE_INTRO_ID]?.body
  const settings = p?.items[COURSE_SETTINGS_ID]?.body
  return { intro: isIntroBody(intro) ? intro : null, settings: isSettingsBody(settings) ? settings : null }
}
/** How many items of the scope a newer payload changes (revision changed, added, removed or withdrawn). */
export function changedCount(a: StudentPayload | null, b: StudentPayload): number {
  if (!a) return Object.keys(b.items).length
  const ids = new Set([...Object.keys(a.items), ...Object.keys(b.items)])
  let n = 0
  for (const id of ids) if (a.items[id]?.revisionId !== b.items[id]?.revisionId) n++
  return n
}

// ------------------------------------------------------------------------------------------- sync
const PATH: Record<Scope, string> = { course: '/content/course', week1: '/content/weeks/1' }
async function fetchScope(scope: Scope): Promise<StudentPayload | null> {
  if (OFF) return null
  try {
    const r = await api<StudentPayload>('GET', PATH[scope])
    return isPayload(r.data) ? r.data : null
  } catch {
    return null // offline, signed out or refused: keep what is shown
  }
}
function apply(scope: Scope, p: StudentPayload) {
  if (scope === 'week1') setLearnOverlay(toLearnOverlay(p))
  setState(scope, { status: 'live', releaseId: p.releaseId, applied: p, pending: null })
}

/** Starts the sync of a scope (idempotent). Does nothing in the static edition or without a signed-in session. */
export function startContentSync(scope: Scope): void {
  if (OFF || started.has(scope)) return
  started.add(scope)
  void (async () => {
    await probeBackend()
    if (getBackend().status !== 'signed-in') {
      started.delete(scope) // a later sign-in in the same document may start it again
      return
    }
    const p = await fetchScope(scope)
    if (p) apply(scope, p)
    installTriggers()
  })()
}

let checking: Promise<void> | null = null
/** Re-checks the current release; a newer one that changes a started scope becomes `pending` (banner), never applied. */
export function checkForUpdates(): Promise<void> {
  if (OFF) return Promise.resolve()
  checking ??= (async () => {
    try {
      const r = await api<{ releaseId: string }>('GET', '/content/release')
      for (const scope of started) {
        const s = states[scope]
        if (s.status !== 'live' || r.data.releaseId === s.releaseId || r.data.releaseId === s.pending?.payload.releaseId) continue
        const p = await fetchScope(scope)
        if (!p) continue
        const changed = changedCount(s.applied, p)
        // a release that does not touch this scope is adopted silently (nothing changes on screen)
        if (!changed) setState(scope, { ...states[scope], releaseId: p.releaseId, applied: p })
        else setState(scope, { ...states[scope], pending: { payload: p, changed } })
      }
    } catch {
      /* offline or signed out: try again on the next trigger */
    } finally {
      checking = null
    }
  })()
  return checking
}
/** The reader's choice: show the newer publication. Re-fetches nothing else (projects and progress are other stores). */
export function applyPending(scope: Scope) {
  const p = states[scope].pending
  if (p) apply(scope, p.payload)
}

let installed = false
export const DEFAULT_POLL_MS = 5 * 60 * 1000
function pollMs(): number {
  try {
    const q = new URLSearchParams(window.location.search).get('contentPoll')
    const n = q ? Number(q) : NaN
    return Number.isFinite(n) && n >= 1000 ? n : DEFAULT_POLL_MS
  } catch {
    return DEFAULT_POLL_MS
  }
}
function installTriggers() {
  if (installed || typeof window === 'undefined') return
  installed = true
  const check = () => {
    if (typeof document === 'undefined' || document.visibilityState !== 'hidden') void checkForUpdates()
  }
  window.addEventListener('focus', check)
  window.addEventListener('hashchange', check)
  document.addEventListener('visibilitychange', check)
  setInterval(check, pollMs())
}

/** Test hook: forget every scope (unit tests run several scenarios in one module instance). */
export function resetContentSync() {
  states = { course: fresh(), week1: fresh() }
  started.clear()
  checking = null
  setLearnOverlay(null)
  notify()
}
