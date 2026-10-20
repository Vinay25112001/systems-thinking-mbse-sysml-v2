// The project store (architecture §5.3–§5.7), independent of React so it can be tested directly: operations through
// apply(), debounced autosave (600 ms) with one transaction per save, coalescing of keystroke edits, snapshots
// (manual, milestone, pre-import, pre-restore, daily auto) with retention, undo by inverse operations, save-failure and
// quota reporting, and a single writer per project across tabs (Web Locks; other tabs open read-only).
import { commitOps } from '../model/commit'
import { emptyProject, type NewProjectOptions } from '../model/create'
import { changeId, newUid, snapshotId } from '../model/ids'
import { invertOps, summarize } from '../model/ops'
import type { ChangeSet, ChangeSource, Operation, ProjectDoc, Snapshot, SnapshotKind, SnapshotMeta, Stamp, SubmissionExport } from '../model/types'
import { StorageError, type ProjectSummary, type StorageAdapter } from './adapter'
import { AUTOSAVE_MS, canCoalesce, mergeOps, needsDailySnapshot, prunable } from './revisions'

export type SaveState = { kind: 'idle' | 'saving' | 'saved' | 'error'; at?: string; reason?: string }
export type StoreState = {
  ready: boolean
  storage: 'indexeddb' | 'memory'
  memoryReason?: string
  projects: ProjectSummary[]
  doc: ProjectDoc | null
  changes: ChangeSet[]
  snapshots: SnapshotMeta[]
  save: SaveState
  readOnly: boolean
  readOnlyReason?: string
  editor: string
  quota: { usage: number; quota: number } | null
  persisted: 'granted' | 'denied' | 'unknown'
  notice?: string
}
export type ApplyMeta = { source?: ChangeSource; summary?: string; rationale?: string; noCoalesce?: boolean }
export type ApplyOutcome = { ok: true; change: ChangeSet | null } | { ok: false; error: string }
export type OpsBuilder = Operation[] | ((doc: ProjectDoc, stamp: Stamp) => Operation[])
type Options = { memoryReason?: string; startEmpty?: boolean; autosaveMs?: number; retryMs?: number; now?: () => Date; locks?: boolean; channel?: boolean }

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
  private opts: Required<Omit<Options, 'memoryReason' | 'startEmpty'>>
  private releaseLock: (() => void) | null = null
  private bc: BroadcastChannel | null = null
  private disposed = false

  constructor(adapter: StorageAdapter, opts: Options = {}) {
    this.adapter = adapter
    this.opts = { autosaveMs: opts.autosaveMs ?? AUTOSAVE_MS, retryMs: opts.retryMs ?? 1000, now: opts.now ?? (() => new Date()), locks: opts.locks ?? adapter.kind === 'indexeddb', channel: opts.channel ?? adapter.kind === 'indexeddb' }
    this.state = { ready: !!opts.startEmpty, storage: adapter.kind, memoryReason: opts.memoryReason, projects: [], doc: null, changes: [], snapshots: [], save: { kind: 'idle' }, readOnly: false, editor: '', quota: null, persisted: 'unknown' }
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
    this.set({ doc, changes: await this.adapter.listChanges(uid), snapshots: await this.adapter.listSnapshots(uid), readOnly: false, readOnlyReason: undefined })
    this.lock(uid)
  }
  private async reload() {
    const uid = this.state.doc?.project.uid
    if (!uid) return
    const doc = await this.adapter.getProject(uid)
    if (doc) {
      this.storedRev = doc.rev
      this.set({ doc, changes: await this.adapter.listChanges(uid), snapshots: await this.adapter.listSnapshots(uid) })
    }
  }

  // ---------------------------------------------------------------------------------------------- tabs
  private lock(uid: string, steal = false, attempt = 0) {
    this.releaseLock?.()
    this.releaseLock = null
    const locks = typeof navigator !== 'undefined' ? (navigator as Navigator & { locks?: LockManager }).locks : undefined
    if (!this.opts.locks || !locks) return
    const name = `sysml-studio-project:${uid}`
    const opts: LockOptions = steal ? { steal: true } : { ifAvailable: true }
    locks
      .request(name, opts, (lock) => {
        if (!lock) {
          // a page being reloaded still holds the lock for a moment: try again before turning read-only
          if (attempt < 4) setTimeout(() => !this.disposed && this.state.doc?.project.uid === uid && this.lock(uid, false, attempt + 1), 250)
          else this.set({ readOnly: true, readOnlyReason: 'This project is open for editing in another tab.' })
          return undefined
        }
        this.set({ readOnly: false, readOnlyReason: undefined })
        return new Promise<void>((resolve) => (this.releaseLock = resolve))
      })
      .catch(() => this.set({ readOnly: true, readOnlyReason: 'Editing was taken over in another tab. This tab is read-only now.' }))
  }
  /** Lets the next page take the writer lock at once (page hide). */
  releaseEditLock() {
    this.releaseLock?.()
    this.releaseLock = null
  }
  /** "Take over editing": this tab becomes the writer; the other tab turns read-only. */
  async takeOver() {
    const uid = this.state.doc?.project.uid
    if (!uid) return
    await this.reload()
    this.lock(uid, true)
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
      await this.adapter.saveProject(doc, changes, undefined)
      await this.adapter.setMeta(ACTIVE_KEY, doc.project.uid).catch(() => undefined)
      this.storedRev = doc.rev
      this.set({ projects: await this.adapter.listProjects(), doc, changes: await this.adapter.listChanges(doc.project.uid), snapshots: [], save: { kind: 'saved', at: this.nowIso() } })
    } catch (e) {
      // the project still opens, in memory, with "Not saved" showing (export works)
      this.storedRev = undefined
      this.docDirty = true
      for (const c of changes) this.dirty.add(c.id)
      this.set({ doc, changes, snapshots: [], save: { kind: 'error', reason: e instanceof StorageError && e.kind === 'quota' ? 'the browser’s storage for this site is full' : e instanceof Error ? e.message : String(e) } })
      return doc
    }
    this.lock(doc.project.uid)
    const storage = typeof navigator !== 'undefined' ? navigator.storage : undefined
    if (storage?.persist) storage.persist().then((g) => this.set({ persisted: g ? 'granted' : 'denied' }), () => undefined)
    return doc
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
    if (!doc) return { ok: false, error: 'No project is open.' }
    if (this.state.readOnly) return { ok: false, error: this.state.readOnlyReason ?? 'This project is read-only in this tab.' }
    const source = meta.source ?? 'editor'
    const last = this.state.changes[this.state.changes.length - 1]
    const at = this.nowIso()
    const peekStamp = this.stampFor((doc.issued.CHG ?? 0) + 1)
    const ops = typeof build === 'function' ? build(doc, peekStamp) : build
    if (!ops.length) return { ok: true, change: null }
    const coalesce = !meta.noCoalesce && canCoalesce(last, ops, this.state.editor, at, source)
    const id = coalesce ? last.id : peekStamp.change
    const ctx = { at, by: this.state.editor, change: id }
    const summary = meta.summary ?? summarize(doc, ops)
    const res = commitOps(doc, ops, ctx, summary, coalesce ? last.ops : [])
    if (!res.ok) return res
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
    this.schedule()
    return { ok: true, change }
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
      await this.adapter.saveProject(doc, changes, this.storedRev)
      this.storedRev = doc.rev
      for (const c of changes) if (this.state.changes.find((x) => x.id === c.id) === c) this.dirty.delete(c.id)
      this.docDirty = this.state.doc !== doc
      this.set({ save: { kind: 'saved', at: this.nowIso() }, projects: await this.adapter.listProjects() })
      this.bc?.postMessage({ uid: doc.project.uid, rev: doc.rev })
      if (needsDailySnapshot(this.state.snapshots, this.nowIso())) await this.snapshot('auto', 'Automatic daily version').catch(() => undefined)
      if (this.docDirty) this.schedule()
    } catch (e) {
      const err = e instanceof StorageError ? e : new StorageError('write', e instanceof Error ? e.message : String(e))
      if (err.kind === 'conflict') {
        this.set({ save: { kind: 'error', reason: err.message }, readOnly: true, readOnlyReason: err.message })
        return
      }
      if (!retry) {
        await new Promise((r) => setTimeout(r, this.opts.retryMs))
        return this.write(true)
      }
      this.set({ save: { kind: 'error', reason: err.kind === 'quota' ? 'the browser’s storage for this site is full' : err.message } })
    }
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
    return this.replaceContent(snap.doc, 'restore', `Restored ${snap.id} (${snap.label}) as the current version`, rationale)
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
    this.schedule()
    return { ok: true, change }
  }

  // ---------------------------------------------------------------------------------------------- import
  /** Merge: a pre-import snapshot, then the plan's operations as one `import` change set. */
  async importMerge(ops: OpsBuilder, summary: string, rationale?: string): Promise<ApplyOutcome> {
    if (this.state.readOnly) return { ok: false, error: this.state.readOnlyReason ?? 'Read-only.' }
    await this.flush()
    await this.snapshot('pre-import', 'Before merging an imported file')
    return this.apply(ops, { source: 'import', summary, rationale, noCoalesce: true })
  }
  /** Replace: a pre-import snapshot, then the incoming content replaces the current content (restorable). */
  async importReplace(incoming: ProjectDoc, summary: string, rationale: string): Promise<ApplyOutcome> {
    if (this.state.readOnly) return { ok: false, error: this.state.readOnlyReason ?? 'Read-only.' }
    await this.flush()
    await this.snapshot('pre-import', 'Before replacing the project with an imported file')
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
    this.releaseLock?.()
    this.bc?.close()
  }
}
