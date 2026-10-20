// React binding of the project store. Chooses the adapter: IndexedDB when the browser offers it, otherwise the memory
// adapter with a persistent banner ("This browser is not saving your project. Export before you close the tab.").
// `?storage=memory` forces the fallback and `?storage=fail` a failing disk (manual and end-to-end tests of P1-T13).
// Writes are flushed when the tab is hidden, the page is left and the route changes.
import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import type { ProjectDoc } from '../model/types'
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

/** The store to use: synchronous for the memory fallback (no asynchronous start-up in tests), asynchronous for IndexedDB. */
export function chooseStore(): ProjectStore | (() => Promise<ProjectStore>) {
  const param = typeof window !== 'undefined' ? storageParam() : null
  if (param === 'memory' || param === 'fail')
    return new ProjectStore(new MemoryAdapter({ failWrites: param === 'fail' ? 'write' : false }), { memoryReason: param === 'fail' ? 'Saving is switched off for a test (?storage=fail).' : 'Saving to the browser is switched off (?storage=memory).', retryMs: 300, startEmpty: true })
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
    const run = async () => {
      made = choice instanceof ProjectStore ? choice : await choice()
      await made.init()
      if (alive) setStore(made)
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
    const onVis = () => document.visibilityState === 'hidden' && flush()
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', leave)
    window.addEventListener('hashchange', flush)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', leave)
      window.removeEventListener('hashchange', flush)
    }
  }, [store])
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

const NO_STORE_STATE: StoreState = { ready: false, storage: 'memory', projects: [], doc: null, changes: [], snapshots: [], save: { kind: 'idle' }, readOnly: false, editor: '', quota: null, persisted: 'unknown' }
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
