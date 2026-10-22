// P0 save defect (docs/project/P0_SAVE_DEFECT_REPORT.md): the single-writer tab lock and the save status. A fake Web
// Locks manager stands in for navigator.locks (jsdom has none): one manager per "browser", one view per page/tab, so a
// reload is "close the old page's view, open a new store", and a second tab is a second view.
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { render, waitFor } from '@testing-library/react'
import { StrictMode, useEffect } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { normalizeTeam } from '../../workbench/week1/team'
import { diffTeamRecord, toTeamRecord } from '../adapters/week1'
import { emptyProject } from '../model/create'
import type { ChangeSet, ProjectDoc } from '../model/types'
import type { StorageAdapter } from './adapter'
import { IndexedDbAdapter } from './indexedDb'
import { MemoryAdapter } from './memory'
import { ProjectProvider, useProjectState } from './ProjectProvider'
import { ProjectStore } from './ProjectStore'

// ------------------------------------------------------------------------------------------------ fake Web Locks
type Req = { client: string; name: string; opts: LockOptions; cb: LockGrantedCallback<unknown>; resolve: (v: unknown) => void; reject: (e: unknown) => void; token: number }
class FakeLocks {
  private held = new Map<string, Req>()
  private queue: Req[] = []
  private seq = 0
  view(client: string): LockManager {
    return {
      request: ((name: string, a: LockOptions | LockGrantedCallback<unknown>, b?: LockGrantedCallback<unknown>) => {
        const opts = typeof a === 'function' ? {} : a
        const cb = (typeof a === 'function' ? a : b)!
        return new Promise<unknown>((resolve, reject) => this.enqueue({ client, name, opts, cb, resolve, reject, token: ++this.seq }))
      }) as LockManager['request'],
      query: async () => this.query(),
    } as LockManager
  }
  query(): LockManagerSnapshot {
    return { held: [...this.held.values()].map((r) => ({ name: r.name, clientId: r.client, mode: 'exclusive' as const })), pending: this.queue.map((r) => ({ name: r.name, clientId: r.client, mode: 'exclusive' as const })) }
  }
  heldBy(name?: string) {
    return [...this.held.values()].filter((r) => !name || r.name === name).map((r) => r.client)
  }
  /** The page goes away: the browser releases its locks and drops its pending requests. */
  close(client: string) {
    this.queue = this.queue.filter((r) => r.client !== client)
    for (const [n, r] of [...this.held]) if (r.client === client) this.release(n, r.token)
  }
  private enqueue(r: Req) {
    const abort = (r.opts as { signal?: AbortSignal }).signal
    if (abort?.aborted) return r.reject(new DOMException('aborted', 'AbortError'))
    if (r.opts.steal) {
      const cur = this.held.get(r.name)
      if (cur) {
        this.held.delete(r.name)
        cur.reject(new DOMException('stolen', 'AbortError'))
      }
      return this.grant(r)
    }
    const busy = this.held.has(r.name) || this.queue.some((q) => q.name === r.name)
    if (r.opts.ifAvailable && busy) return void Promise.resolve(r.cb(null)).then(r.resolve, r.reject)
    abort?.addEventListener('abort', () => {
      const i = this.queue.indexOf(r)
      if (i >= 0) {
        this.queue.splice(i, 1)
        r.reject(new DOMException('aborted', 'AbortError'))
      }
    })
    this.queue.push(r)
    this.pump(r.name)
  }
  private pump(name: string) {
    if (this.held.has(name)) return
    const i = this.queue.findIndex((q) => q.name === name)
    if (i < 0) return
    const [r] = this.queue.splice(i, 1)
    this.grant(r)
  }
  private grant(r: Req) {
    this.held.set(r.name, r)
    Promise.resolve()
      .then(() => r.cb({ name: r.name, mode: 'exclusive' } as Lock))
      .then(
        (v) => {
          r.resolve(v)
          this.release(r.name, r.token)
        },
        (e) => {
          r.reject(e)
          this.release(r.name, r.token)
        },
      )
  }
  private release(name: string, token: number) {
    if (this.held.get(name)?.token !== token) return // stolen meanwhile: the new holder keeps it
    this.held.delete(name)
    this.pump(name)
  }
}

// ------------------------------------------------------------------------------------------------ helpers
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms))
const until = async (cond: () => boolean, ms = 2000) => {
  const end = Date.now() + ms
  while (!cond()) {
    if (Date.now() > end) throw new Error('timed out')
    await tick(5)
  }
}
const GRACE = 120
const storeIn = (adapter: StorageAdapter, locks: FakeLocks, client: string) => new ProjectStore(adapter, { autosaveMs: 5, retryMs: 5, locks: true, channel: false, lockManager: locks.view(client), lockGraceMs: GRACE })
const editTeam = (s: ProjectStore, patch: object) => s.apply((doc, stamp) => diffTeamRecord(doc, normalizeTeam({ ...toTeamRecord(doc), ...patch }), stamp))
const lockName = (s: ProjectStore) => `sysml-studio-project:${s.getState().doc!.project.uid}`
async function seeded(locks: FakeLocks) {
  const adapter = new MemoryAdapter()
  const first = storeIn(adapter, locks, 'page-1')
  await first.init()
  await first.create({ teamLabel: '07', initials: 'AB' })
  await until(() => first.getState().lock === 'held')
  return { adapter, first }
}

describe('writer lock (P0 save defect)', () => {
  it('a reload gets the lock as soon as the previous page lets go, without showing read-only', async () => {
    const locks = new FakeLocks()
    const { adapter, first } = await seeded(locks)
    const next = storeIn(adapter, locks, 'page-2') // the reloaded page starts while the old one still holds the lock
    await next.init()
    expect(next.getState().lock).toBe('acquiring')
    expect(next.getState().readOnly).toBe(true) // edits wait for the lock (refused visibly, see below)
    await tick(GRACE / 3)
    locks.close('page-1')
    first.dispose()
    await until(() => next.getState().lock === 'held')
    expect(next.getState().readOnly).toBe(false)
    expect(editTeam(next, { team: 'after reload' }).ok).toBe(true)
  })

  it('not left read-only for good: a lock freed after the grace period is taken when the tab is shown again', async () => {
    const locks = new FakeLocks()
    const { adapter } = await seeded(locks)
    const next = storeIn(adapter, locks, 'page-2')
    await next.init()
    await until(() => next.getState().lock === 'other-tab')
    expect(locks.query().pending!.length).toBe(0) // a read-only tab does not sit in the queue
    next.retryEditLock() // shown again while the other page still writes: stays read-only
    await tick(10)
    expect(next.getState().lock).toBe('other-tab')
    locks.close('page-1')
    next.retryEditLock()
    await until(() => next.getState().lock === 'held')
    expect(next.getState().readOnly).toBe(false)
  })

  it('reloading the writing tab keeps it the writer; a read-only second tab does not take editing over', async () => {
    const locks = new FakeLocks()
    const { adapter, first } = await seeded(locks)
    const tab2 = storeIn(adapter, locks, 'tab-2')
    await tab2.init()
    await until(() => tab2.getState().lock === 'other-tab')
    const reloaded = storeIn(adapter, locks, 'page-1b') // tab 1 reloads: the new page starts before the old one is gone
    await reloaded.init()
    await tick(5)
    locks.close('page-1')
    first.dispose()
    await until(() => reloaded.getState().lock === 'held')
    expect(tab2.getState().lock).toBe('other-tab')
    expect(locks.heldBy()).toEqual(['page-1b'])
  })

  it('a store disposed during start-up (React StrictMode double effect) never takes or keeps the lock', async () => {
    const locks = new FakeLocks()
    const { adapter, first } = await seeded(locks)
    locks.close('page-1')
    first.dispose()
    // same page, two stores: the first is disposed before its init() finishes, as the provider's cleanup does
    const orphan = storeIn(adapter, locks, 'page-2')
    const starting = orphan.init()
    orphan.dispose()
    const used = storeIn(adapter, locks, 'page-2')
    await Promise.all([starting, used.init()])
    await until(() => used.getState().lock === 'held')
    await tick(GRACE * 2)
    expect(used.getState().readOnly).toBe(false)
    expect(locks.query().held!.length).toBe(1)
    expect(locks.query().pending!.length).toBe(0)
  })

  it('a store disposed after it took the lock lets go at once', async () => {
    const locks = new FakeLocks()
    const { adapter, first } = await seeded(locks)
    const name = lockName(first)
    first.dispose()
    await tick()
    expect(locks.heldBy(name)).toEqual([])
    const next = storeIn(adapter, locks, 'page-1')
    await next.init()
    await until(() => next.getState().lock === 'held')
  })

  it('a store disposed while its request is still waiting never holds the lock when it is granted later', async () => {
    const locks = new FakeLocks()
    const { adapter, first } = await seeded(locks)
    const name = lockName(first)
    const waiting = storeIn(adapter, locks, 'page-1') // e.g. the orphan of a StrictMode double effect, already queued
    await waiting.init()
    expect(locks.query().pending!.length).toBe(1)
    waiting.dispose()
    first.dispose() // the writer lets go: the disposed store must not pick the lock up
    await tick(10)
    expect(locks.heldBy(name)).toEqual([])
    expect(locks.query().pending!.length).toBe(0)
  })

  it('asking for the lock again in the same store (open, create, switch) leaves one holder and nothing pending', async () => {
    const locks = new FakeLocks()
    const { first } = await seeded(locks)
    const uid = first.getState().doc!.project.uid
    const other = await first.create({ teamLabel: '08', initials: 'AB' })
    await first.switchProject(uid)
    await first.switchProject(other.project.uid)
    await first.switchProject(uid)
    await until(() => first.getState().lock === 'held')
    expect(locks.query().held!.map((h) => h.name)).toEqual([`sysml-studio-project:${uid}`])
    expect(locks.query().pending!.length).toBe(0)
  })

  it('a genuine second tab is read-only with a reason, refuses edits visibly, and can take over', async () => {
    const locks = new FakeLocks()
    const { adapter, first } = await seeded(locks)
    const tab2 = storeIn(adapter, locks, 'tab-2')
    await tab2.init()
    await until(() => tab2.getState().lock === 'other-tab')
    expect(tab2.getState().readOnlyReason).toMatch(/open for editing in another tab/)
    const r = editTeam(tab2, { team: 'from tab 2' })
    expect(r.ok).toBe(false)
    expect(tab2.getState().refused?.reason).toMatch(/another tab/)
    expect(toTeamRecord(tab2.getState().doc!).team).not.toBe('from tab 2')

    await tab2.takeOver()
    await until(() => tab2.getState().lock === 'held' && first.getState().lock === 'taken-over')
    expect(tab2.getState().readOnly).toBe(false)
    expect(tab2.getState().refused).toBeUndefined()
    expect(first.getState().readOnly).toBe(true)
    expect(first.getState().readOnlyReason).toMatch(/taken over/)
    expect(editTeam(first, { team: 'x' }).ok).toBe(false)
    expect(first.getState().refused).toBeDefined()

    // tab 2 writes and closes; tab 1, shown again, becomes the writer with tab 2's content
    expect(editTeam(tab2, { team: 'written by tab 2' }).ok).toBe(true)
    await tab2.flush()
    locks.close('tab-2')
    tab2.dispose()
    first.retryEditLock()
    await until(() => first.getState().lock === 'held')
    expect(toTeamRecord(first.getState().doc!).team).toBe('written by tab 2')
    expect(editTeam(first, { team: 'back in tab 1' }).ok).toBe(true)
    await first.flush()
    expect(first.getState().save.kind).toBe('saved')
  })

  it('edits made before the lock is granted are refused with a message, not dropped silently', async () => {
    const locks = new FakeLocks()
    const { adapter } = await seeded(locks)
    const next = storeIn(adapter, locks, 'page-2')
    await next.init()
    expect(next.getState().lock).toBe('acquiring')
    const r = editTeam(next, { team: 'too early' })
    expect(r.ok).toBe(false)
    expect(next.getState().refused?.reason).toMatch(/Getting ready to edit/)
  })

  it('page hide lets go of the lock; coming back from the back/forward cache asks again', async () => {
    const locks = new FakeLocks()
    const { first } = await seeded(locks)
    const name = lockName(first)
    first.releaseEditLock()
    await tick()
    expect(locks.heldBy(name)).toEqual([])
    expect(editTeam(first, { team: 'hidden' }).ok).toBe(false)
    first.resumeEditLock()
    await until(() => first.getState().lock === 'held')
    expect(editTeam(first, { team: 'back' }).ok).toBe(true)
  })

  it('a conflict keeps this tab’s unsaved edits as a version before taking over', async () => {
    const adapter = new MemoryAdapter()
    const a = new ProjectStore(adapter, { autosaveMs: 5, retryMs: 5, locks: false, channel: false })
    await a.init()
    await a.create({ initials: 'JS' })
    const b = new ProjectStore(adapter, { autosaveMs: 5, retryMs: 5, locks: false, channel: false })
    await b.init()
    editTeam(a, { team: 'A' })
    await a.flush()
    editTeam(b, { team: 'B' })
    await b.flush()
    expect(b.getState().save.kind).toBe('conflict')
    expect(b.getState().readOnly).toBe(true)
    await b.takeOver()
    expect(toTeamRecord(b.getState().doc!).team).toBe('A')
    const kept = b.getState().snapshots.find((s) => /Unsaved edits/.test(s.label))
    expect(kept).toBeDefined()
    expect(toTeamRecord((await b.getSnapshot(kept!.id))!.doc).team).toBe('B')
    expect(b.getState().readOnly).toBe(false)
  })
})

// ------------------------------------------------------------------------------------------------ save status
class SlowAdapter extends MemoryAdapter {
  gate: Promise<void> | null = null
  open: (() => void) | null = null
  hold() {
    this.gate = new Promise((r) => (this.open = r))
  }
  async saveProject(doc: ProjectDoc, changes: ChangeSet[], rev: number | undefined) {
    if (this.gate) await this.gate
    return super.saveProject(doc, changes, rev)
  }
}

describe('save status is truthful (P0 save defect)', () => {
  it('Unsaved changes after an edit, Saving while the write runs, Saved only after the transaction completed', async () => {
    const adapter = new SlowAdapter()
    const s = new ProjectStore(adapter, { autosaveMs: 5, retryMs: 5, locks: false, channel: false })
    await s.init()
    await s.create({ initials: 'JS' })
    adapter.hold()
    editTeam(s, { team: 'one' })
    expect(s.getState().save.kind).toBe('pending')
    await tick(20)
    expect(s.getState().save.kind).toBe('saving') // the transaction has not completed
    editTeam(s, { team: 'two' }) // an edit while the write runs
    expect(s.getState().save.kind).toBe('saving')
    adapter.open!()
    adapter.gate = null
    await until(() => s.getState().save.kind !== 'saving')
    expect(s.getState().save.kind).toBe('pending') // 'two' is not stored yet
    await s.flush()
    expect(s.getState().save.kind).toBe('saved')
    expect(toTeamRecord((await adapter.getProject(s.getState().doc!.project.uid))!).team).toBe('two')
  })

  it('a failing write reports Save failed, never Saved', async () => {
    const adapter = new MemoryAdapter()
    const s = new ProjectStore(adapter, { autosaveMs: 5, retryMs: 5, locks: false, channel: false })
    await s.init()
    await s.create({ initials: 'JS' })
    adapter.failWrites = 'write'
    editTeam(s, { team: 'lost?' })
    await s.flush()
    expect(s.getState().save.kind).toBe('error')
  })

  it('IndexedDB: Saved means a new connection reads the edit back', async () => {
    const factory = new IDBFactory()
    const name = `p0-${Math.random()}`
    const s = new ProjectStore(await IndexedDbAdapter.open(factory, name), { autosaveMs: 5, retryMs: 5, locks: false, channel: false })
    await s.init()
    await s.create({ initials: 'JS' })
    editTeam(s, { team: 'persisted' })
    await until(() => s.getState().save.kind === 'saved')
    const again = new ProjectStore(await IndexedDbAdapter.open(factory, name), { locks: false, channel: false })
    await again.init()
    expect(toTeamRecord(again.getState().doc!).team).toBe('persisted')
  })
})

// ------------------------------------------------------------------------------------------------ provider
describe('ProjectProvider under React StrictMode (P0 save defect root cause)', () => {
  const nav = navigator as Navigator & { locks?: LockManager }
  afterEach(() => {
    Object.defineProperty(navigator, 'locks', { value: undefined, configurable: true })
  })
  it('the double-run effect leaves exactly one store holding the lock, and the page is editable', async () => {
    const locks = new FakeLocks()
    Object.defineProperty(navigator, 'locks', { value: locks.view('page'), configurable: true })
    expect(nav.locks).toBeDefined()
    // a project already stored in this browser (the default database the provider opens)
    const seed = await IndexedDbAdapter.open()
    const doc = emptyProject({ teamLabel: '07', initials: 'AB' })
    await seed.saveProject(doc, [], undefined)
    await seed.setMeta('activeProjectId', doc.project.uid)
    const seen: { st: ReturnType<typeof useProjectState> | null } = { st: null }
    function Probe() {
      const st = useProjectState()
      useEffect(() => {
        seen.st = st
      })
      return null
    }
    const view = render(
      <StrictMode>
        <ProjectProvider>
          <Probe />
        </ProjectProvider>
      </StrictMode>,
    )
    await waitFor(() => expect(seen.st?.lock).toBe('held'), { timeout: 3000 })
    await tick(1700) // past the read-only grace period
    expect(seen.st!.readOnly).toBe(false)
    expect(locks.query().held!.length).toBe(1)
    expect(locks.query().pending!.length).toBe(0)
    view.unmount()
    await tick(10)
    expect(locks.query().held!.length).toBe(0)
  })
})
