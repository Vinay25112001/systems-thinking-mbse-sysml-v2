// The project store (architecture §5.3–§5.7), independent of React so it can be tested directly: operations through
// apply(), debounced autosave (600 ms) with one transaction per save, coalescing of keystroke edits, snapshots
// (manual, milestone, pre-import, pre-restore, daily auto) with retention, undo by inverse operations, save-failure and
// quota reporting, and a single writer per project across tabs (Web Locks; other tabs open read-only).
//
// Writer lock (P0 save defect, docs/project/P0_SAVE_DEFECT_REPORT.md): on load the lock request WAITS (no fixed retry
// count), so a reloaded page gets the lock as soon as the previous page lets go; only a lock still held after a grace
// period means another tab, and then "Take over editing" is offered. A read-only tab that is shown again takes the lock
// if the writing tab has gone. Each request carries a generation number (and an abort signal): a superseded or disposed
// request releases the lock at once instead of holding it for the life of the page. Until the lock is granted edits are
// refused, never silently: `refused` records the reason for the UI.
import { commitOps } from '../model/commit'
import { emptyProject, type NewProjectOptions } from '../model/create'
import { changeId, newUid, snapshotId } from '../model/ids'
import { invertOps, summarize } from '../model/ops'
import type { ChangeSet, ChangeSource, Operation, ProjectDoc, Snapshot, SnapshotKind, SnapshotMeta, Stamp, SubmissionExport } from '../model/types'
import { StorageError, type ProjectSummary, type SaveResult, type StorageAdapter } from './adapter'
import { AUTOSAVE_MS, canCoalesce, mergeOps, needsDailySnapshot, prunable } from './revisions'

/** What the persistence layer can truthfully report. `saved` only after the storage transaction completed; `pending` =
 *  edits applied in this tab and not yet written (Unsaved changes); `conflict` = another tab wrote first (review). */
export type SaveState = { kind: 'idle' | 'pending' | 'saving' | 'saved' | 'error' | 'conflict'; at?: string; reason?: string; signin?: boolean }
/** The writer lock: `off` = no lock in use (memory storage, no Web Locks); `acquiring` = waiting for a page that is being
 *  reloaded to let go (short, no banner); `held` = this tab is the writer; `other-tab` = another tab is the writer;
 *  `taken-over` = another tab took editing over; `released` = let go on page hide. */
export type LockState = 'off' | 'acquiring' | 'held' | 'other-tab' | 'taken-over' | 'released'
/** Whether to show the read-only state: not during the short wait for a reloaded page to let go of the lock. */
export const showReadOnly = (st: Pick<StoreState, 'readOnly' | 'lock'>) => st.readOnly && st.lock !== 'acquiring' && st.lock !== 'released'
export type StoreState = {
  ready: boolean
  /** 'http' = the course server holds the project (M2); 'indexeddb' = this browser only; 'memory' = not saving. */
  storage: StorageAdapter['kind']
  memoryReason?: string
  projects: ProjectSummary[]
  doc: ProjectDoc | null
  changes: ChangeSet[]
  snapshots: SnapshotMeta[]
  save: SaveState
  readOnly: boolean
  readOnlyReason?: string
  lock: LockState
  /** The last edit this tab refused (read-only, integrity rule): shown to the student, never dropped silently. */
  refused?: { at: string; reason: string }
  editor: string
  quota: { usage: number; quota: number } | null
  persisted: 'granted' | 'denied' | 'unknown'
  notice?: string
}
export type ApplyMeta = { source?: ChangeSource; summary?: string; rationale?: string; noCoalesce?: boolean }
export type ApplyOutcome = { ok: true; change: ChangeSet | null } | { ok: false; error: string }
export type OpsBuilder = Operation[] | ((doc: ProjectDoc, stamp: Stamp) => Operation[])
/** `coalesce`: merge keystroke edits into the previous change set. Off for the HTTP adapter (PROJECT_DATA_SCHEMA.md §6.1):
 *  a change set the server already accepted must never be re-sent with more operations. */
type Options = { memoryReason?: string; startEmpty?: boolean; autosaveMs?: number; retryMs?: number; now?: () => Date; locks?: boolean; channel?: boolean; lockManager?: LockManager | null; lockGraceMs?: number; coalesce?: boolean }

const ACTIVE_KEY = 'activeProjectId'
const EDITOR_KEY = 'editor'

export class ProjectStore {
  private adapter: StorageAdapter
  private state: StoreState
  private listeners = new Set<() => void>()
  private timer: ReturnType<typeof setTimeout> | null = null
  private dirty = new Set<string>()
  private docDirty = false
  private storedRev: number | undefined
  private saving: Promise<void> | null = null
  private opts: Required<Omit<Options, 'memoryReason' | 'startEmpty' | 'lockManager'>>
  private lockManager: LockManager | null
  private releaseLock: (() => void) | null = null
  private lockGen = 0
  private lockAbort: AbortController | null = null
  private lockTimer: ReturnType<typeof setTimeout> | null = null
  private bc: BroadcastChannel | null = null
  private disposed = false
  // server mode: local change sets the server accepted while newer local edits were pending (their server-stamped
  // versions wait in acceptedRemote until the store is quiet and adopts the server's document)
  private sentLocal = new Set<ChangeSet>()
  private acceptedRemote: ChangeSet[] = []

  constructor(adapter: StorageAdapter, opts: Options = {}) {
    this.adapter = adapter
    this.opts = { autosaveMs: opts.autosaveMs ?? AUTOSAVE_MS, retryMs: opts.retryMs ?? 1000, now: opts.now ?? (() => new Date()), locks: opts.locks ?? adapter.kind === 'indexeddb', channel: opts.channel ?? adapter.kind === 'indexeddb', lockGraceMs: opts.lockGraceMs ?? 2000, coalesce: opts.coalesce ?? adapter.kind !== 'http' }
    const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & { locks?: LockManager }).locks : undefined
    this.lockManager = opts.lockManager !== undefined ? opts.lockManager : (nav ?? null)
    this.state = { ready: !!opts.startEmpty, storage: adapter.kind, memoryReason: opts.memoryReason, projects: [], doc: null, changes: [], snapshots: [], save: { kind: 'idle' }, readOnly: false, lock: 'off', editor: '', quota: null, persisted: 'unknown' }
  }

  // ---------------------------------------------------------------------------------------------- subscription
  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => void this.listeners.delete(fn)
  }
  getState = () => this.state
  private set(p: Partial<StoreState>) {
    if (this.disposed) return
    this.state = { ...this.state, ...p }
    for (const l of this.listeners) l()
  }
  private nowIso = () => this.opts.now().toISOString()

  // ---------------------------------------------------------------------------------------------- load
  async init(): Promise<void> {
    if (this.state.ready) return // a fresh memory store starts empty and ready (no asynchronous start-up)
    const projects = await this.adapter.listProjects()
    const editor = ((await this.adapter.getMeta<{ initials: string }>(EDITOR_KEY)) ?? { initials: '' }).initials
    const activeId = await this.adapter.getMeta<string>(ACTIVE_KEY)
    const pick = projects.find((p) => p.uid === activeId) ?? [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
    this.set({ projects, editor })
    if (pick) await this.open(pick.uid)
    this.set({ ready: true })
    if (this.opts.channel && typeof BroadcastChannel !== 'undefined') {
      this.bc = new BroadcastChannel('sysml-studio-project')
      this.bc.onmessage = (e: MessageEvent<{ uid: string; rev: number }>) => {
        if (this.state.readOnly && e.data?.uid === this.state.doc?.project.uid) void this.reload()
      }
    }
    void this.estimate()
  }
  private async open(uid: string) {
    const doc = await this.adapter.getProject(uid)
    if (!doc) return
    this.storedRev = doc.rev
    // server mode (M2 review M4): change sets this tab had not saved when it reloaded (an expired session, a closed
    // laptop) come back from the outbox and are saved again with the version check (merge or "Conflict requires review")
    const rec = this.adapter.recover?.(uid) ?? null
    const changes = await this.adapter.listChanges(uid)
    if (rec && rec.changes.length) {
      for (const c of rec.changes) this.dirty.add(c.id)
      this.docDirty = true
      const mine = new Set(rec.changes.map((c) => c.id))
      this.set({ doc: rec.doc, changes: [...changes.filter((c) => !mine.has(c.id)), ...rec.changes], snapshots: await this.adapter.listSnapshots(uid), refused: undefined, save: { kind: 'pending' }, notice: `Recovered ${rec.changes.length} unsaved change${rec.changes.length > 1 ? 's' : ''} from before the page was reloaded; saving ${rec.changes.length > 1 ? 'them' : 'it'} now.` })
    } else this.set({ doc, changes, snapshots: await this.adapter.listSnapshots(uid), refused: undefined })
    if (this.disposed) return
    this.lock(uid)
    if (this.docDirty) this.schedule()
  }
  /** Re-reads the stored project (another tab wrote). Edits not yet written in this tab are dropped from memory, so
   *  callers that may hold some keep a copy first (takeOver). */
  private async reload() {
    const uid = this.state.doc?.project.uid
    if (!uid) return
    const doc = await this.adapter.getProject(uid)
    if (doc) {
      this.storedRev = doc.rev
      this.dirty.clear()
      this.docDirty = false
      this.sentLocal.clear()
      this.acceptedRemote = []
      if (this.timer) clearTimeout(this.timer)
      this.timer = null
      // a failed save is over once the saved project is loaded again (m6, confirmation N-2: recovery without a page reload)
      this.set({ doc, changes: await this.adapter.listChanges(uid), snapshots: await this.adapter.listSnapshots(uid), ...(this.state.save.kind === 'error' ? { save: { kind: 'saved' as const, at: this.nowIso() } } : {}) })
      this.stash()
    }
  }

  // ---------------------------------------------------------------------------------------------- tabs
  private static readonly OTHER_TAB = 'This project is open for editing in another tab.'
  private static readonly TAKEN = 'Editing was taken over in another tab. This tab is read-only now.'
  private static readonly WAITING = 'Getting ready to edit (the page that was open before is still closing). Try again in a moment.'

  /** Cancels this store's current lock request (pending or held). A grant that arrives later is released at once. */
  private dropLock() {
    this.lockGen++
    if (this.lockTimer) clearTimeout(this.lockTimer)
    this.lockTimer = null
    this.lockAbort?.abort()
    this.lockAbort = null
    this.releaseLock?.()
    this.releaseLock = null
  }
  /** Requests the writer lock for `uid`.
   *  - `wait` (page load, project switch): the request waits in the browser's queue, so a reloaded page gets the lock
   *    as soon as the previous page lets go (no fixed number of retries). If it is still not granted after
   *    `lockGraceMs`, another tab is the writer: the request is withdrawn (a read-only tab must not sit in the queue,
   *    or a reload of the writing tab would hand editing to it) and this tab shows read-only with "Take over editing".
   *  - `try` (a read-only tab is shown again): takes the lock only if it is free, e.g. the writing tab was closed.
   *  - `steal` ("Take over editing"). */
  private lock(uid: string, mode: 'wait' | 'try' | 'steal' = 'wait') {
    const before = this.state.lock
    this.dropLock()
    const locks = this.lockManager
    if (this.disposed) return
    if (!this.opts.locks || !locks) {
      // no tab lock (memory, or the course server, whose version check replaces it): a conflict is cleared once the
      // stored project has been read again (takeOver)
      if (before !== 'off' || this.state.readOnly) this.set({ lock: 'off', readOnly: false, readOnlyReason: undefined, ...(this.state.save.kind === 'conflict' ? { save: { kind: 'idle' as const } } : {}) })
      return
    }
    const gen = this.lockGen
    const current = () => !this.disposed && gen === this.lockGen && this.state.doc?.project.uid === uid
    let opts: LockOptions
    if (mode === 'wait') {
      const abort = new AbortController()
      this.lockAbort = abort
      opts = { signal: abort.signal }
      this.set({ lock: 'acquiring', readOnly: true, readOnlyReason: ProjectStore.WAITING })
      this.lockTimer = setTimeout(() => {
        this.lockTimer = null
        if (!current() || this.state.lock !== 'acquiring') return
        this.lockGen++ // the withdrawn request's rejection and any late grant are ignored
        abort.abort()
        this.lockAbort = null
        this.set({ lock: 'other-tab', readOnlyReason: ProjectStore.OTHER_TAB })
      }, this.opts.lockGraceMs)
    } else opts = mode === 'try' ? { ifAvailable: true } : { steal: true }
    const name = `sysml-studio-project:${uid}`
    locks
      .request(name, opts, async (lock) => {
        if (!lock || !current()) return undefined // not free (try), or superseded / disposed: let go at once
        if (this.lockTimer) clearTimeout(this.lockTimer)
        this.lockTimer = null
        const held = new Promise<void>((resolve) => (this.releaseLock = resolve))
        // another tab may have written while this tab was read-only: read the stored project before editing
        if (this.state.lock === 'other-tab' || this.state.lock === 'taken-over') await this.reload()
        if (!current()) {
          this.releaseLock?.()
          return undefined
        }
        this.set({ lock: 'held', readOnly: false, readOnlyReason: undefined, refused: undefined, ...(this.state.save.kind === 'conflict' ? { save: { kind: 'idle' as const } } : {}) })
        return held
      })
      .catch((e: unknown) => {
        if (!current()) return // withdrawn, superseded or disposed
        this.releaseLock = null
        if (e instanceof DOMException && e.name === 'AbortError') this.set({ lock: 'taken-over', readOnly: true, readOnlyReason: ProjectStore.TAKEN })
        else this.set({ lock: 'other-tab', readOnly: true, readOnlyReason: `Editing is not available in this tab (${e instanceof Error ? e.message : String(e)}).` })
      })
  }
  /** A read-only tab is shown again (focus, visible): becomes the writer if the writing tab has gone. Never steals. */
  retryEditLock() {
    const uid = this.state.doc?.project.uid
    if (uid && (this.state.lock === 'other-tab' || this.state.lock === 'taken-over') && this.state.save.kind !== 'conflict') this.lock(uid, 'try')
  }
  /** Lets the next page take the writer lock at once (page hide). Edits are refused until `resumeEditLock`. */
  releaseEditLock() {
    if (this.state.lock === 'off') return
    this.dropLock()
    this.set({ lock: 'released', readOnly: true, readOnlyReason: ProjectStore.WAITING })
  }
  /** The page came back (back/forward cache) after `releaseEditLock`: ask for the writer lock again. */
  resumeEditLock() {
    const uid = this.state.doc?.project.uid
    if (uid && this.state.lock === 'released') this.lock(uid)
  }
  /** "Take over editing": this tab becomes the writer; the other tab turns read-only. Edits this tab could not write
   *  (a save conflict) are kept first as a version in History, then the stored project is read. */
  async takeOver() {
    const uid = this.state.doc?.project.uid
    if (!uid) return
    if (this.docDirty && this.state.doc) await this.snapshot('pre-restore', 'Unsaved edits from this tab, kept before taking over editing', this.state.doc).catch(() => undefined)
    await this.reload()
    this.lock(uid, 'steal')
  }
  /** Records an edit the caller could not apply, so the UI can say so (never a silent drop). */
  reportRefused(reason: string) {
    this.set({ refused: { at: this.nowIso(), reason } })
  }
  dismissRefused() {
    this.set({ refused: undefined })
  }

  // ---------------------------------------------------------------------------------------------- editor
  async setEditor(initials: string) {
    const v = initials.trim().toUpperCase()
    this.set({ editor: v })
    await this.adapter.setMeta(EDITOR_KEY, { initials: v }).catch(() => undefined)
  }

  // ---------------------------------------------------------------------------------------------- create / switch
  async create(o: NewProjectOptions | { doc: ProjectDoc; changes?: ChangeSet[] }): Promise<ProjectDoc> {
    const doc = 'doc' in o ? o.doc : emptyProject({ ...o, initials: o.initials ?? this.state.editor, at: this.nowIso() })
    if ('initials' in o && o.initials) await this.setEditor(o.initials)
    await this.flush()
    const changes = 'changes' in o ? (o.changes ?? []) : []
    try {
      // server mode returns the stored document (server-stamped, members and approval projected): adopt it
      const res = await this.adapter.saveProject(doc, changes, undefined)
      const stored = res ? res.doc : doc
      await this.adapter.setMeta(ACTIVE_KEY, stored.project.uid).catch(() => undefined)
      this.storedRev = stored.rev
      this.set({ projects: await this.adapter.listProjects(), doc: stored, changes: await this.adapter.listChanges(stored.project.uid), snapshots: await this.adapter.listSnapshots(stored.project.uid), save: { kind: 'saved', at: this.nowIso() } })
      if (!this.disposed) this.lock(stored.project.uid)
      const storage = typeof navigator !== 'undefined' ? navigator.storage : undefined
      if (storage?.persist && this.adapter.kind !== 'http') storage.persist().then((g) => this.set({ persisted: g ? 'granted' : 'denied' }), () => undefined)
      return stored
    } catch (e) {
      // the project still opens, in memory, with "Not saved" showing (export works)
      this.storedRev = undefined
      this.docDirty = true
      for (const c of changes) this.dirty.add(c.id)
      this.set({ doc, changes, snapshots: [], save: { kind: 'error', reason: e instanceof StorageError && e.kind === 'quota' ? 'the browser’s storage for this site is full' : e instanceof Error ? e.message : String(e) } })
      return doc
    }
  }
  async switchProject(uid: string) {
    await this.flush()
    await this.adapter.setMeta(ACTIVE_KEY, uid).catch(() => undefined)
    await this.open(uid)
  }

  // ---------------------------------------------------------------------------------------------- apply
  private stampFor(n: number): Stamp {
    return { at: this.nowIso(), by: this.state.editor, change: changeId(n) }
  }
  /** Applies operations as one change set. Refused (nothing changes) when read-only or when an operation breaks an
   *  integrity rule. Keystroke edits to the same fields coalesce into the previous change set. */
  apply = (build: OpsBuilder, meta: ApplyMeta = {}): ApplyOutcome => {
    const doc = this.state.doc
    if (!doc) return this.refuse('No project is open.')
    if (this.state.readOnly) return this.refuse(this.state.readOnlyReason ?? 'This project is read-only in this tab.')
    const source = meta.source ?? 'editor'
    const last = this.state.changes[this.state.changes.length - 1]
    const at = this.nowIso()
    const peekStamp = this.stampFor((doc.issued.CHG ?? 0) + 1)
    let ops = typeof build === 'function' ? build(doc, peekStamp) : build
    if (!ops.length) return { ok: true, change: null }
    if (this.adapter.vetOps) {
      // server mode: server-owned fields are refused (approval) or dropped (member list) here, visibly, instead of
      // failing later on the server and blocking the save queue
      const v = this.adapter.vetOps(doc, ops)
      if (!v.ok) return this.refuse(v.error)
      ops = v.ops
      if (!ops.length) return { ok: true, change: null }
    }
    const coalesce = this.opts.coalesce && !meta.noCoalesce && canCoalesce(last, ops, this.state.editor, at, source)
    const id = coalesce ? last.id : peekStamp.change
    const ctx = { at, by: this.state.editor, change: id }
    const summary = meta.summary ?? summarize(doc, ops)
    const res = commitOps(doc, ops, ctx, summary, coalesce ? last.ops : [])
    if (!res.ok) return this.refuse(res.error)
    const next = res.doc
    let change: ChangeSet
    if (coalesce) {
      const merged = mergeOps(last.ops, res.ops)
      change = { ...last, at, ops: merged, summary: meta.summary ?? summarize(next, merged) }
      next.rev = doc.rev
      this.set({ doc: next, changes: [...this.state.changes.slice(0, -1), change] })
    } else {
      next.issued = { ...next.issued, CHG: (doc.issued.CHG ?? 0) + 1 }
      next.rev = doc.rev + 1
      change = { id, at, by: this.state.editor, source, summary, ...(meta.rationale ? { rationale: meta.rationale } : {}), ops: res.ops, rev: next.rev }
      this.set({ doc: next, changes: [...this.state.changes, change] })
    }
    this.dirty.add(change.id)
    this.docDirty = true
    this.markPending()
    this.stash()
    this.schedule()
    return { ok: true, change }
  }
  /** Server mode: hands the unsaved change sets to the adapter's outbox (cleared when nothing is pending). */
  private stash() {
    if (!this.adapter.stash || !this.state.doc) return
    try {
      this.adapter.stash(this.state.doc, this.state.changes.filter((c) => this.dirty.has(c.id)))
    } catch {
      // the outbox is a safety net; the in-memory edits and the unload warning remain
    }
  }
  /** Edits not yet confirmed by storage (the page warns before it is closed or reloaded). */
  hasUnsaved(): boolean {
    return this.docDirty || !!this.saving
  }
  private refuse(error: string): ApplyOutcome {
    this.set({ refused: { at: this.nowIso(), reason: error } })
    return { ok: false, error }
  }
  /** Unsaved changes: shown until the write transaction completes (a save already running keeps "Saving…"). */
  private markPending() {
    const k = this.state.save.kind
    this.set({ ...(k !== 'saving' && k !== 'error' && k !== 'conflict' ? { save: { kind: 'pending' as const } } : {}), refused: undefined })
  }
  /** One change set back: applies the inverse operations of the latest change set as a new change set. */
  undo(): ApplyOutcome {
    const last = this.state.changes[this.state.changes.length - 1]
    const doc = this.state.doc
    if (!last || !doc) return { ok: false, error: 'Nothing to undo.' }
    const inv = invertOps(doc, last.ops, `Undo of ${last.id}`)
    if (!inv.length) return { ok: false, error: 'That change cannot be undone here; restore an earlier version from History.' }
    return this.apply(inv, { source: 'editor', summary: `Undo: ${last.summary}`, noCoalesce: true })
  }

  // ---------------------------------------------------------------------------------------------- save
  private schedule() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => void this.flush(), this.opts.autosaveMs)
  }
  /** Writes pending changes now (also called on tab hide, page hide and route change). */
  flush = async (): Promise<void> => {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    if (this.saving) await this.saving
    if (!this.docDirty || !this.state.doc) return
    this.saving = this.write(false).finally(() => (this.saving = null))
    await this.saving
  }
  private async write(retry: boolean): Promise<void> {
    const doc = this.state.doc!
    const changes = this.state.changes.filter((c) => this.dirty.has(c.id))
    this.set({ save: { kind: 'saving' } })
    try {
      const res = await this.adapter.saveProject(doc, changes, this.storedRev)
      this.storedRev = res ? res.doc.rev : doc.rev
      for (const c of changes) if (this.state.changes.find((x) => x.id === c.id) === c) this.dirty.delete(c.id)
      this.docDirty = this.state.doc !== doc
      if (res) this.adopt(res, changes)
      this.stash()
      // "Saved" only when everything shown is in storage; edits made while the write ran are still unsaved
      this.set({ save: this.docDirty ? { kind: 'pending' } : { kind: 'saved', at: this.nowIso() }, projects: await this.adapter.listProjects() })
      this.bc?.postMessage({ uid: doc.project.uid, rev: doc.rev })
      if (needsDailySnapshot(this.state.snapshots, this.nowIso())) await this.snapshot('auto', 'Automatic daily version').catch(() => undefined)
      if (this.docDirty) this.schedule()
    } catch (e) {
      const err = e instanceof StorageError ? e : new StorageError('write', e instanceof Error ? e.message : String(e))
      if (err.kind === 'conflict') {
        this.set({ save: { kind: 'conflict', reason: err.message }, readOnly: true, readOnlyReason: err.message })
        return
      }
      if (err.kind === 'auth') {
        // signed out (idle or expired session): nothing is retried with a dead session; the edits stay in memory and in
        // the outbox, and the page offers to sign in again in place, then saves them (flush)
        this.set({ save: { kind: 'error', reason: err.message, signin: true } })
        return
      }
      if (!retry) {
        await new Promise((r) => setTimeout(r, this.opts.retryMs))
        return this.write(true)
      }
      this.set({ save: { kind: 'error', reason: err.kind === 'quota' ? 'the browser’s storage for this site is full' : err.message } })
    }
  }
  /** Server mode: the server accepted `sent`. When no newer local edit is pending, its document (server-stamped
   *  attribution, CHG numbers, teammates' merged changes) replaces the local one; otherwise it is adopted after the next
   *  quiet save, and the local change sets stay shown until then. */
  private adopt(res: SaveResult, sent: ChangeSet[]) {
    for (const c of sent) this.sentLocal.add(c)
    this.acceptedRemote.push(...res.changes)
    if (this.docDirty) return
    const keep = this.state.changes.filter((c) => !this.sentLocal.has(c))
    const known = new Set(keep.map((c) => c.id))
    const changes = [...keep, ...this.acceptedRemote.filter((c) => !known.has(c.id))].sort((a, b) => a.rev - b.rev || a.id.localeCompare(b.id))
    this.sentLocal.clear()
    this.acceptedRemote = []
    this.set({ doc: res.doc, changes, ...(res.notice ? { notice: res.notice } : {}) })
  }
  /** Server mode: picks up a teammate's newer version when nothing is pending here (polled every 15 s and when the tab
   *  is shown again; never "live"). With edits pending, the next save merges or reports the conflict. */
  async pollRemote(): Promise<boolean> {
    const uid = this.state.doc?.project.uid
    if (!uid || !this.adapter.poll || this.docDirty || this.saving || this.state.readOnly) return false
    const res = await this.adapter.poll(uid).catch(() => null)
    if (!res || this.docDirty || this.saving || this.state.doc?.project.uid !== uid) return false
    const known = new Set(this.state.changes.map((c) => c.id))
    this.storedRev = res.doc.rev
    this.set({ doc: res.doc, changes: [...this.state.changes, ...res.changes.filter((c) => !known.has(c.id))], snapshots: await this.adapter.listSnapshots(uid), ...(res.notice ? { notice: res.notice } : {}) })
    return true
  }

  // ---------------------------------------------------------------------------------------------- snapshots
  private async snapshot(kind: SnapshotKind, label: string, doc = this.state.doc): Promise<Snapshot> {
    if (!doc) throw new Error('No project is open.')
    const n = Math.max(0, ...this.state.snapshots.map((s) => Number(s.id.slice(4)) || 0)) + 1
    const snap: Snapshot = { id: snapshotId(n), at: this.nowIso(), kind, label, rev: doc.rev, doc: JSON.parse(JSON.stringify(doc)) as ProjectDoc }
    await this.adapter.putSnapshot(doc.project.uid, snap)
    let snaps = await this.adapter.listSnapshots(doc.project.uid)
    const prune = prunable(snaps)
    for (const p of prune) await this.adapter.deleteSnapshot(doc.project.uid, p.id)
    if (prune.length) snaps = await this.adapter.listSnapshots(doc.project.uid)
    this.set({ snapshots: snaps, ...(prune.some((p) => p.kind !== 'auto') ? { notice: `Removed ${prune.length} oldest automatic version${prune.length > 1 ? 's' : ''} (retention: last 10 pre-import and pre-restore, last 14 daily).` } : {}) })
    void this.estimate()
    return snap
  }
  async saveVersion(label: string, kind: SnapshotKind = 'manual') {
    await this.flush()
    return this.snapshot(kind, label.trim() || 'Saved version')
  }
  getSnapshot(id: string) {
    const uid = this.state.doc?.project.uid
    return uid ? this.adapter.getSnapshot(uid, id) : Promise.resolve(undefined)
  }
  async deleteSnapshot(id: string) {
    const uid = this.state.doc?.project.uid
    if (!uid) return
    await this.adapter.deleteSnapshot(uid, id)
    this.set({ snapshots: await this.adapter.listSnapshots(uid) })
  }
  /** Restore as current: a pre-restore snapshot first, then the old content becomes a NEW revision (history kept). */
  async restore(id: string, rationale: string): Promise<ApplyOutcome> {
    const cur = this.state.doc
    const snap = await this.getSnapshot(id)
    if (!cur || !snap) return { ok: false, error: 'That version is not stored.' }
    if (this.state.readOnly) return { ok: false, error: this.state.readOnlyReason ?? 'Read-only.' }
    await this.flush()
    await this.snapshot('pre-restore', `Before restoring ${snap.id} (${snap.label})`)
    const r = this.replaceContent(snap.doc, 'restore', `Restored ${snap.id} (${snap.label}) as the current version`, rationale)
    // written at once: a whole-content replacement is sent alone (the course server replays it as one change set)
    await this.flush()
    return r
  }
  /** Replaces the content of the current project (restore or replace-import) as one recorded change set. The project's
   *  identity and history stay; counters never go down, so no ID is reused (I3). */
  private replaceContent(incoming: ProjectDoc, source: ChangeSource, summary: string, rationale: string): ApplyOutcome {
    const cur = this.state.doc!
    const n = (cur.issued.CHG ?? 0) + 1
    const at = this.nowIso()
    const issued: Record<string, number> = { ...incoming.issued }
    for (const [k, v] of Object.entries(cur.issued)) issued[k] = Math.max(issued[k] ?? 0, v)
    issued.CHG = n
    const next: ProjectDoc = { ...incoming, project: { ...incoming.project, uid: cur.project.uid, createdAt: cur.project.createdAt, updatedAt: at }, issued, rev: cur.rev + 1 }
    const change: ChangeSet = { id: changeId(n), at, by: this.state.editor, source, summary, rationale, ops: [], rev: next.rev }
    this.set({ doc: next, changes: [...this.state.changes, change] })
    this.dirty.add(change.id)
    this.docDirty = true
    this.markPending()
    this.stash()
    this.schedule()
    return { ok: true, change }
  }

  // ---------------------------------------------------------------------------------------------- import
  /** Merge: a pre-import snapshot, then the plan's operations as one `import` change set. `preImport` is the id of the
   *  restore point THIS import wrote (browser storage). On the course server the server writes the pre-import version
   *  itself, bound to the import's change set (M6 review H-1), so no client version is stored there (a client snapshot
   *  would be filed as a manual one and could never be told apart). */
  async importMerge(ops: OpsBuilder, summary: string, rationale?: string): Promise<ApplyOutcome & { preImport?: string }> {
    if (this.state.readOnly) return { ok: false, error: this.state.readOnlyReason ?? 'Read-only.' }
    await this.flush()
    const snap = this.adapter.kind === 'http' ? null : await this.snapshot('pre-import', 'Before merging an imported file')
    const r = this.apply(ops, { source: 'import', summary, rationale, noCoalesce: true })
    return r.ok && snap ? { ...r, preImport: snap.id } : r
  }
  /** Replace: a pre-import snapshot, then the incoming content replaces the current content (restorable). */
  async importReplace(incoming: ProjectDoc, summary: string, rationale: string): Promise<ApplyOutcome> {
    if (this.state.readOnly) return { ok: false, error: this.state.readOnlyReason ?? 'Read-only.' }
    await this.flush()
    if (this.adapter.kind !== 'http') await this.snapshot('pre-import', 'Before replacing the project with an imported file') // the course server writes its own (H-1)
    const r = this.replaceContent(incoming, 'import', summary, rationale)
    await this.flush()
    return r
  }
  /** Open as a separate project: stored next to the current one, nothing in the current project changes. A project
   *  whose uid is already in this browser gets a new uid (it is a copy). */
  async importSeparate(doc: ProjectDoc, changes: ChangeSet[] = []): Promise<ProjectDoc> {
    await this.flush()
    const exists = this.state.projects.some((p) => p.uid === doc.project.uid)
    const copy: ProjectDoc = exists ? { ...doc, project: { ...doc.project, uid: newUid() } } : doc
    await this.adapter.saveProject(copy, changes, undefined)
    this.set({ projects: await this.adapter.listProjects() })
    return copy
  }

  // ---------------------------------------------------------------------------------------------- exports
  /** Records an export for submission on the week's milestone and writes a `milestone` snapshot. */
  async recordExport(week: number, files: SubmissionExport['files'], contentState: SubmissionExport['contentState']): Promise<ApplyOutcome> {
    const doc = this.state.doc
    if (!doc) return { ok: false, error: 'No project is open.' }
    if (this.state.readOnly) return { ok: false, error: this.state.readOnlyReason ?? 'Read-only.' }
    const snap = await this.snapshot('milestone', `Week ${week} export: ${files.map((f) => f.name).join(', ')}`).catch(() => null)
    const m = this.state.doc!.milestones.find((x) => x.week === week)
    if (!m) return { ok: false, error: `No milestone for week ${week}.` }
    const entry: SubmissionExport = { at: this.nowIso(), by: this.state.editor, files, rev: this.state.doc!.rev, snapshot: snap?.id ?? '', contentState }
    return this.apply([{ op: 'update-milestone', week, fields: [{ path: 'exports', before: m.exports as never, after: [...m.exports, entry] as never }] }], { source: 'system', summary: `Exported for Week ${week}: ${files.map((f) => f.name).join(', ')}`, noCoalesce: true })
  }

  // ---------------------------------------------------------------------------------------------- quota
  async estimate() {
    const storage = typeof navigator !== 'undefined' ? navigator.storage : undefined
    if (!storage?.estimate) return
    try {
      const e = await storage.estimate()
      if (e.quota) this.set({ quota: { usage: e.usage ?? 0, quota: e.quota } })
      if (storage.persisted) this.set({ persisted: (await storage.persisted()) ? 'granted' : this.state.persisted })
    } catch {
      // estimates are advisory
    }
  }
  dismissNotice() {
    this.set({ notice: undefined })
  }
  dispose() {
    this.disposed = true
    if (this.timer) clearTimeout(this.timer)
    this.dropLock()
    this.bc?.close()
  }
}
