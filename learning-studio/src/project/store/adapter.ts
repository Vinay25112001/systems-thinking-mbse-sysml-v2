// Storage adapter contract (architecture §5.2). Two implementations: IndexedDB (production) and memory (unit tests and
// the storage-unavailable fallback). The same contract suite (adapter.contract.ts) runs against both. M2 adds a third,
// HTTP (src/services/httpProjectAdapter.ts): the course server holds the canonical document and returns it,
// server-stamped, from saveProject.
import type { ChangeSet, Operation, ProjectDoc, Snapshot, SnapshotMeta } from '../model/types'

export type ProjectSummary = { uid: string; title: string; teamLabel: string; updatedAt: string; rev: number }

/** `auth` (server mode): the session ended; the edits are kept and saved after signing in again (M2 review M4). */
export class StorageError extends Error {
  readonly kind: 'quota' | 'conflict' | 'unavailable' | 'write' | 'auth'
  constructor(kind: StorageError['kind'], message: string) {
    super(message)
    this.kind = kind
    this.name = 'StorageError'
  }
}

/** What a server-backed adapter returns from a save: the authoritative document and the server-stamped change sets (the
 *  ones this save sent, plus teammates' change sets merged in). `notice` is a short status line ("Merged with …"). */
export type SaveResult = { doc: ProjectDoc; changes: ChangeSet[]; notice?: string }
export type VetResult = { ok: true; ops: Operation[] } | { ok: false; error: string }

export interface StorageAdapter {
  readonly kind: 'indexeddb' | 'memory' | 'http'
  getMeta<T>(key: string): Promise<T | undefined>
  setMeta(key: string, value: unknown): Promise<void>
  listProjects(): Promise<ProjectSummary[]>
  getProject(uid: string): Promise<ProjectDoc | undefined>
  /** One transaction: the document and the change sets (put by id, so a coalesced change set replaces its earlier
   *  version). `expectedRev` = the rev this writer last saw stored (undefined for a new project); a different stored rev
   *  means another tab wrote meanwhile → StorageError('conflict'). */
  saveProject(doc: ProjectDoc, changes: ChangeSet[], expectedRev: number | undefined): Promise<void | SaveResult>
  /** Server mode: screens operations before they are applied (server-owned fields), so a refusal shows at once. */
  vetOps?(doc: ProjectDoc, ops: Operation[]): VetResult
  /** Server mode: a newer stored version written by a teammate, or null when nothing changed. */
  poll?(uid: string): Promise<SaveResult | null>
  /** Server mode (M2 review M4): keeps the unsaved change sets and the document they produce outside the page (the
   *  tab's session storage), so a reload or a sign-in that reloads loses nothing. An empty list clears the outbox. */
  stash?(doc: ProjectDoc, pending: ChangeSet[]): void
  /** Server mode: the unsaved state kept by `stash` for this project and this account, if any (read once on open). */
  recover?(uid: string): { doc: ProjectDoc; changes: ChangeSet[] } | null
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
