// In-memory adapter: unit tests and the fallback when IndexedDB is unavailable (the app then shows "This browser is not
// saving your project. Export before you close the tab."). `failWrites` simulates a failing disk for tests.
import { StorageError, summaryOf, type ProjectSummary, type StorageAdapter } from './adapter'
import type { ChangeSet, ProjectDoc, Snapshot, SnapshotMeta } from '../model/types'

const clone = <T,>(x: T): T => (x === undefined ? x : (JSON.parse(JSON.stringify(x)) as T))

export class MemoryAdapter implements StorageAdapter {
  readonly kind = 'memory' as const
  failWrites: false | 'quota' | 'write' = false
  private meta = new Map<string, unknown>()
  private projects = new Map<string, ProjectDoc>()
  private changes = new Map<string, Map<string, ChangeSet>>()
  private snaps = new Map<string, Map<string, Snapshot>>()

  constructor(opts: { failWrites?: MemoryAdapter['failWrites'] } = {}) {
    this.failWrites = opts.failWrites ?? false
  }
  private guard() {
    if (this.failWrites === 'quota') throw new StorageError('quota', 'The browser’s storage for this site is full.')
    if (this.failWrites) throw new StorageError('write', 'The browser refused to save.')
  }
  async getMeta<T>(key: string) {
    return clone(this.meta.get(key)) as T | undefined
  }
  async setMeta(key: string, value: unknown) {
    this.guard()
    this.meta.set(key, clone(value))
  }
  async listProjects(): Promise<ProjectSummary[]> {
    return [...this.projects.values()].map(summaryOf)
  }
  async getProject(uid: string) {
    const d = this.projects.get(uid)
    return d ? clone(d) : undefined
  }
  async saveProject(doc: ProjectDoc, changes: ChangeSet[], expectedRev: number | undefined) {
    this.guard()
    const stored = this.projects.get(doc.project.uid)
    if (stored && expectedRev !== undefined && stored.rev !== expectedRev) throw new StorageError('conflict', 'Changed in another tab: reload the page.')
    this.projects.set(doc.project.uid, clone(doc))
    const m = this.changes.get(doc.project.uid) ?? new Map<string, ChangeSet>()
    for (const c of changes) m.set(c.id, clone(c))
    this.changes.set(doc.project.uid, m)
  }
  async listChanges(uid: string) {
    return [...(this.changes.get(uid)?.values() ?? [])].map(clone).sort((a, b) => a.id.localeCompare(b.id))
  }
  async putSnapshot(uid: string, snap: Snapshot) {
    this.guard()
    const m = this.snaps.get(uid) ?? new Map<string, Snapshot>()
    m.set(snap.id, clone(snap))
    this.snaps.set(uid, m)
  }
  async listSnapshots(uid: string): Promise<SnapshotMeta[]> {
    return [...(this.snaps.get(uid)?.values() ?? [])].map(({ doc: _d, ...meta }) => (void _d, meta)).sort((a, b) => a.id.localeCompare(b.id))
  }
  async getSnapshot(uid: string, id: string) {
    const s = this.snaps.get(uid)?.get(id)
    return s ? clone(s) : undefined
  }
  async deleteSnapshot(uid: string, id: string) {
    this.snaps.get(uid)?.delete(id)
  }
}
