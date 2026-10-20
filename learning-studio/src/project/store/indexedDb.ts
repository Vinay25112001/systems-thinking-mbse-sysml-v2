// IndexedDB adapter (architecture §5.2), in-house, no runtime dependency. Database `sysml-studio-projects` v1:
//   meta       key: string            activeProjectId, editor, schemaVersion, persistGranted
//   projects   key: project uid       ProjectDoc
//   changes    key: [projectUid, id]  ChangeSet
//   snapshots  key: [projectUid, id]  Snapshot
// A save is one readwrite transaction over `projects` and `changes`, with the rev check inside it.
import { isQuotaError, StorageError, summaryOf, type ProjectSummary, type StorageAdapter } from './adapter'
import type { ChangeSet, ProjectDoc, Snapshot, SnapshotMeta } from '../model/types'

export const DB_NAME = 'sysml-studio-projects'
const DB_VERSION = 1

const req = <T,>(r: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
const done = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error ?? new DOMException('Transaction aborted', 'AbortError'))
  })
const wrap = (e: unknown): StorageError => (e instanceof StorageError ? e : isQuotaError(e) ? new StorageError('quota', 'The browser’s storage for this site is full.') : new StorageError('write', e instanceof Error ? e.message : String(e)))

export function openDb(factory: IDBFactory = indexedDB, name = DB_NAME): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = factory.open(name, DB_VERSION)
    r.onupgradeneeded = () => {
      const db = r.result
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta')
      if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects')
      if (!db.objectStoreNames.contains('changes')) db.createObjectStore('changes')
      if (!db.objectStoreNames.contains('snapshots')) db.createObjectStore('snapshots')
    }
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
    r.onblocked = () => reject(new StorageError('unavailable', 'The project database is blocked by another tab.'))
  })
}

export class IndexedDbAdapter implements StorageAdapter {
  readonly kind = 'indexeddb' as const
  private db: IDBDatabase
  constructor(db: IDBDatabase) {
    this.db = db
  }
  static async open(factory: IDBFactory = indexedDB, name = DB_NAME) {
    return new IndexedDbAdapter(await openDb(factory, name))
  }
  private store(name: string, mode: IDBTransactionMode = 'readonly') {
    return this.db.transaction(name, mode).objectStore(name)
  }
  private range(projectUid: string) {
    return IDBKeyRange.bound([projectUid, ''], [projectUid, '￿'])
  }
  async getMeta<T>(key: string) {
    return (await req(this.store('meta').get(key))) as T | undefined
  }
  async setMeta(key: string, value: unknown) {
    try {
      const tx = this.db.transaction('meta', 'readwrite')
      tx.objectStore('meta').put(value, key)
      await done(tx)
    } catch (e) {
      throw wrap(e)
    }
  }
  async listProjects(): Promise<ProjectSummary[]> {
    return ((await req(this.store('projects').getAll())) as ProjectDoc[]).map(summaryOf)
  }
  async getProject(uid: string) {
    return (await req(this.store('projects').get(uid))) as ProjectDoc | undefined
  }
  async saveProject(doc: ProjectDoc, changes: ChangeSet[], expectedRev: number | undefined) {
    try {
      const tx = this.db.transaction(['projects', 'changes'], 'readwrite')
      const projects = tx.objectStore('projects')
      const finished = done(tx)
      const stored = (await req(projects.get(doc.project.uid))) as ProjectDoc | undefined
      if (stored && expectedRev !== undefined && stored.rev !== expectedRev) {
        tx.abort()
        await finished.catch(() => undefined)
        throw new StorageError('conflict', 'Changed in another tab: reload the page.')
      }
      projects.put(doc, doc.project.uid)
      const cs = tx.objectStore('changes')
      for (const c of changes) cs.put(c, [doc.project.uid, c.id])
      await finished
    } catch (e) {
      throw wrap(e)
    }
  }
  async listChanges(uid: string) {
    return ((await req(this.store('changes').getAll(this.range(uid)))) as ChangeSet[]).sort((a, b) => a.id.localeCompare(b.id))
  }
  async putSnapshot(uid: string, snap: Snapshot) {
    try {
      const tx = this.db.transaction('snapshots', 'readwrite')
      tx.objectStore('snapshots').put(snap, [uid, snap.id])
      await done(tx)
    } catch (e) {
      throw wrap(e)
    }
  }
  async listSnapshots(uid: string): Promise<SnapshotMeta[]> {
    const all = (await req(this.store('snapshots').getAll(this.range(uid)))) as Snapshot[]
    return all.map(({ doc: _d, ...m }) => (void _d, m)).sort((a, b) => a.id.localeCompare(b.id))
  }
  async getSnapshot(uid: string, id: string) {
    return (await req(this.store('snapshots').get([uid, id]))) as Snapshot | undefined
  }
  async deleteSnapshot(uid: string, id: string) {
    const tx = this.db.transaction('snapshots', 'readwrite')
    tx.objectStore('snapshots').delete([uid, id])
    await done(tx)
  }
}
