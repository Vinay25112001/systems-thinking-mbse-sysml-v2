// Storage adapter contract (architecture §5.2). Two implementations: IndexedDB (production) and memory (unit tests and
// the storage-unavailable fallback). The same contract suite (adapter.contract.ts) runs against both.
import type { ChangeSet, ProjectDoc, Snapshot, SnapshotMeta } from '../model/types'

export type ProjectSummary = { uid: string; title: string; teamLabel: string; updatedAt: string; rev: number }

export class StorageError extends Error {
  readonly kind: 'quota' | 'conflict' | 'unavailable' | 'write'
  constructor(kind: StorageError['kind'], message: string) {
    super(message)
    this.kind = kind
    this.name = 'StorageError'
  }
}

export interface StorageAdapter {
  readonly kind: 'indexeddb' | 'memory'
  getMeta<T>(key: string): Promise<T | undefined>
  setMeta(key: string, value: unknown): Promise<void>
  listProjects(): Promise<ProjectSummary[]>
  getProject(uid: string): Promise<ProjectDoc | undefined>
  /** One transaction: the document and the change sets (put by id, so a coalesced change set replaces its earlier
   *  version). `expectedRev` = the rev this writer last saw stored (undefined for a new project); a different stored rev
   *  means another tab wrote meanwhile → StorageError('conflict'). */
  saveProject(doc: ProjectDoc, changes: ChangeSet[], expectedRev: number | undefined): Promise<void>
  listChanges(projectUid: string): Promise<ChangeSet[]>
  putSnapshot(projectUid: string, snap: Snapshot): Promise<void>
  listSnapshots(projectUid: string): Promise<SnapshotMeta[]>
  getSnapshot(projectUid: string, id: string): Promise<Snapshot | undefined>
  deleteSnapshot(projectUid: string, id: string): Promise<void>
}

export const summaryOf = (doc: ProjectDoc): ProjectSummary => {
  const ent = Object.values(doc.artifacts).find((a) => a.type === 'ENT')
  return { uid: doc.project.uid, title: doc.project.title || ent?.title || '', teamLabel: doc.team.label, updatedAt: doc.project.updatedAt, rev: doc.rev }
}
export const isQuotaError = (e: unknown) => e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
