// React binding of the project store. Chooses the adapter: IndexedDB when the browser offers it, otherwise the memory
// adapter with a persistent banner ("This browser is not saving your project. Export before you close the tab.").
// `?storage=memory` forces the fallback and `?storage=fail` a failing disk (manual and end-to-end tests of P1-T13).
// Writes are flushed when the tab is hidden, the page is left and the route changes.
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import type { ProjectDoc } from '../model/types'
import { BACKEND, probeBackend } from '../../services/backend'
import { HttpProjectAdapter } from '../../services/httpProjectAdapter'
import { IndexedDbAdapter } from './indexedDb'
import { MemoryAdapter } from './memory'
import { ProjectStore, type ApplyMeta, type ApplyOutcome, type OpsBuilder, type StoreState } from './ProjectStore'

export type ProjectApi = StoreState & { store: ProjectStore }
export type ProjectHandle = { doc: ProjectDoc; apply: (b: OpsBuilder, meta?: ApplyMeta) => ApplyOutcome; readOnly: boolean; store: ProjectStore; state: StoreState }

const Ctx = createContext<ProjectStore | null>(null)

function storageParam(): string | null {
  try {
    return new URLSearchParams(window.location.search).get('storage')
  } catch {
    return null
  }
}

function pollParam(): string | null {
  try {
    return new URLSearchParams(window.location.search).get('poll')
  } catch {
    return null
  }
}

/** The store to use: synchronous for the memory fallback (no asynchronous start-up in tests), asynchronous for IndexedDB. */
export function chooseStore(): ProjectStore | (() => Promise<ProjectStore>) {
  const param = typeof window !== 'undefined' ? storageParam() : null
  if (param === 'memory' || param === 'fail')
    return new ProjectStore(new MemoryAdapter({ failWrites: param === 'fail' ? 'write' : false }), { memoryReason: param === 'fail' ? 'Saving is switched off for a test (?storage=fail).' : 'Saving to the browser is switched off (?storage=memory).', retryMs: 300, startEmpty: true })
  // --- course server (M2): signed in → the server holds the team's project (HTTP adapter); otherwise this browser ---
  if (BACKEND !== 'none')
    return async () => {
      const b = await probeBackend()
      if (b.status === 'signed-in' && b.session) return new ProjectStore(new HttpProjectAdapter(b.session))
      if (typeof indexedDB === 'undefined') return new ProjectStore(new MemoryAdapter(), { memoryReason: 'This browser does not offer IndexedDB storage.', startEmpty: true })
      try {
        return new ProjectStore(await IndexedDbAdapter.open())
      } catch (e) {
        return new ProjectStore(new MemoryAdapter(), { memoryReason: `The browser refused its project storage (${e instanceof Error ? e.message : String(e)}).` })
      }
    }
  // --- end course server ---
  if (typeof indexedDB === 'undefined') return new ProjectStore(new MemoryAdapter(), { memoryReason: 'This browser does not offer IndexedDB storage.', startEmpty: true })
  return async () => {
    try {
      return new ProjectStore(await IndexedDbAdapter.open())
    } catch (e) {
      return new ProjectStore(new MemoryAdapter(), { memoryReason: `The browser refused its project storage (${e instanceof Error ? e.message : String(e)}).` })
    }
  }
}

export function ProjectProvider({ children, store: given }: { children: ReactNode; store?: ProjectStore }) {
  const [choice] = useState(() => given ?? chooseStore())
  const [store, setStore] = useState<ProjectStore | null>(() => (choice instanceof ProjectStore ? choice : null))
  useEffect(() => {
    let alive = true
    let made: ProjectStore | null = null
    // P0 save defect: the cleanup can run before the asynchronous store exists (React StrictMode runs this effect twice
    // in development; an unmount during start-up does the same). A store created after its effect was cleaned up is
    // disposed here, so it never takes, and then holds for the life of the page, the writer lock of the store in use.
    const run = async () => {
      const s = choice instanceof ProjectStore ? choice : await choice()
      if (!alive && s !== choice) return s.dispose()
      made = s
      await s.init()
      if (alive) setStore(s)
      else if (s !== choice) s.dispose()
    }
    void run()
    return () => {
      alive = false
      if (made && !(choice instanceof ProjectStore)) made.dispose()
    }
  }, [choice])
  useEffect(() => {
    if (!store) return
    const flush = () => void store.flush()
    const leave = () => void store.flush().finally(() => store.releaseEditLock())
    const back = (e: PageTransitionEvent) => e.persisted && store.resumeEditLock()
    // a read-only tab that is shown again becomes the writer if the writing tab has gone (it never steals)
    const retry = () => store.retryEditLock()
    // course server: a teammate's newer version is picked up every 15 s and when the tab is shown again (polling, never
    // "live"; with edits pending, the next save merges or reports the conflict)
    // (`?poll=off` switches polling off for the two-session end-to-end test, like the `?storage=` test switches)
    const server = store.getState().storage === 'http' && pollParam() !== 'off'
    const poll = () => void store.pollRemote()
    const timer = server ? setInterval(() => document.visibilityState === 'visible' && poll(), 15_000) : null
    const onVis = () => (document.visibilityState === 'hidden' ? flush() : (retry(), server && poll()))
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', leave)
    window.addEventListener('pageshow', back)
    window.addEventListener('focus', retry)
    window.addEventListener('hashchange', flush)
    // never close or reload silently over unsaved edits (M2 review M4); the browser shows its own confirmation. In
    // browser storage a pending autosave is written on pagehide, so only a failed or conflicting save warns there.
    const guard = (e: BeforeUnloadEvent) => {
      if (!store.hasUnsaved()) return
      const st = store.getState()
      if (st.storage !== 'http' && st.save.kind !== 'error' && st.save.kind !== 'conflict') return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', guard)
    return () => {
      window.removeEventListener('beforeunload', guard)
      if (timer) clearInterval(timer)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', leave)
      window.removeEventListener('pageshow', back)
      window.removeEventListener('focus', retry)
      window.removeEventListener('hashchange', flush)
    }
  }, [store])
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

const NO_STORE_STATE: StoreState = { ready: false, storage: 'memory', projects: [], doc: null, changes: [], snapshots: [], save: { kind: 'idle' }, readOnly: false, lock: 'off', editor: '', quota: null, persisted: 'unknown' }
const noop = () => () => undefined

/** The whole store state (no store yet, or outside a provider: an empty state, not ready). */
export function useProjectState(): StoreState {
  const store = useContext(Ctx)
  return useSyncExternalStore(store ? store.subscribe : noop, store ? store.getState : () => NO_STORE_STATE)
}
export function useProjectStore(): ProjectStore | null {
  return useContext(Ctx)
}
/** The open project, or null when no project exists or the provider is absent. */
export function useProjectOptional(): ProjectHandle | null {
  const store = useContext(Ctx)
  const state = useProjectState()
  if (!store || !state.doc) return null
  return { doc: state.doc, apply: store.apply, readOnly: state.readOnly, store, state }
}
