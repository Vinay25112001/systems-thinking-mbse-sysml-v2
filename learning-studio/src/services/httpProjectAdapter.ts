// HTTP persistence adapter (PROJECT_DATA_SCHEMA.md §6.2–§6.3): the existing StorageAdapter contract over the course
// server. The server holds the canonical document; a save sends the pending change sets with the version this browser
// last saw, and "Saved" is shown only after the server confirmed (ProjectStore sets it when saveProject resolves).
//   - 409 (a teammate saved first): the changes since are fetched with the conflict. If they touch none of the fields
//     this save touches, the same operations are re-sent on the new version (the server replays and re-checks them):
//     "Saved. Merged with a teammate's changes". If they overlap, the save fails as a conflict, the store shows
//     "Conflict requires review", and nothing is overwritten.
//   - 422 (an integrity rule or a server-owned field): reported as a conflict with the server's message, so the student
//     keeps their edits as a version and reloads, instead of a save that fails forever.
//   - network / 5xx: StorageError('write') → the store retries once, then "Save failed" (Export stays available).
//   - 401 (session ended): StorageError('auth') → no retry with a dead session; the store keeps the edits and the page
//     offers to sign in again in place, then saves them (M2 review M4).
// Outbox (M2 review M4; PROJECT_DATA_SCHEMA.md §6.4): the unsaved change sets, their client change ids, the version they
// were based on and the document they produce are kept in this tab's sessionStorage, per account and project, so a
// reload (or a sign-in page that reloads) loses nothing; on open they are saved again with the version check.
// Approved proposal (M2 review H1): an edit of a material field while the proposal is approved asks first, because the
// server will move the approval to "changed since approval" for instructor re-review.
import { APPROVED_CHANGE_WARNING, touchesMaterial } from '../project/model/approvalBinding'
import { docApproval, screenMemberOps } from '../project/model/serverRules'
import type { ChangeSet, Operation, ProjectDoc, Snapshot, SnapshotMeta } from '../project/model/types'
import { StorageError, summaryOf, type ProjectSummary, type SaveResult, type StorageAdapter, type VetResult } from '../project/store/adapter'
import { api, ApiFailure, type SessionInfo } from './backend'

type ServerChange = ChangeSet & { version: number; authenticated: boolean }
type ProjectReply = { id: string; teamId: string; version: number; doc: ProjectDoc }
type SaveReply = { version: number; doc: ProjectDoc; changes: ServerChange[] }
const strip = (c: ServerChange): ChangeSet => {
  const { version: _v, authenticated: _a, ...cs } = c
  void _v
  void _a
  return cs
}

/** The fields an operation list touches, as keys; a key ending in '*' covers the whole item (retire, renumber, create). */
export function touched(ops: Operation[]): Set<string> {
  const k = new Set<string>()
  for (const o of ops) {
    switch (o.op) {
      case 'update-artifact':
      case 'update-relationship':
        for (const f of o.fields) k.add(`${o.uid} ${f.path}`)
        break
      case 'update-team':
        for (const f of o.fields) k.add(`team ${f.path}`)
        break
      case 'update-project':
        for (const f of o.fields) k.add(`project ${f.path}`)
        break
      case 'update-milestone':
        for (const f of o.fields) k.add(`m${o.week} ${f.path}`)
        break
      case 'create-artifact':
        k.add(`${o.artifact.uid} *`)
        k.add(`id ${o.artifact.id}`)
        break
      case 'create-relationship':
        k.add(`${o.relationship.uid} *`)
        k.add(`id ${o.relationship.id}`)
        break
      case 'set-review':
        k.add(`${o.uid} review`)
        break
      case 'upsert-mapping':
        k.add(`${o.mapping.uid} *`)
        break
      case 'upsert-model-element':
        k.add(`${o.element.uid} *`)
        break
      default:
        k.add(`${o.uid} *`)
    }
  }
  return k
}
export function overlaps(a: Set<string>, b: Set<string>): boolean {
  const whole = (s: Set<string>) => new Set([...s].filter((x) => x.endsWith(' *')).map((x) => x.slice(0, -2)))
  const wa = whole(a)
  const wb = whole(b)
  for (const x of a) if (b.has(x) || wb.has(x.split(' ')[0])) return true
  for (const x of b) if (wa.has(x.split(' ')[0])) return true
  return false
}

type Outbox = { v: 1; baseVersion: number; doc: ProjectDoc; changes: { change: ChangeSet; clientChangeId: string }[]; at: string }
export type HttpAdapterOptions = {
  /** Asks the student before an edit changes an approved proposal (default: window.confirm). */
  confirm?: (message: string) => boolean
  /** Where the outbox lives (default: window.sessionStorage; null switches it off). */
  outbox?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null
}
const defaultOutbox = () => {
  try {
    return typeof sessionStorage !== 'undefined' ? sessionStorage : null
  } catch {
    return null
  }
}

export class HttpProjectAdapter implements StorageAdapter {
  readonly kind = 'http' as const
  private session: SessionInfo
  private version = new Map<string, number>()
  private meta = new Map<string, unknown>()
  private clientIds = new WeakMap<ChangeSet, string>()
  private projectId: string | null
  private confirmFn: (message: string) => boolean
  private outbox: HttpAdapterOptions['outbox']
  /** Projects whose approved-proposal warning the student already accepted (until the approval state changes). */
  private acknowledged = new Set<string>()

  constructor(session: SessionInfo, opts: HttpAdapterOptions = {}) {
    this.session = session
    this.confirmFn = opts.confirm ?? ((m) => (typeof window !== 'undefined' && typeof window.confirm === 'function' ? window.confirm(m) : true))
    this.outbox = opts.outbox === undefined ? defaultOutbox() : opts.outbox
    this.projectId = session.team?.projectId ?? null
    this.meta.set('editor', { initials: session.user.initials })
    if (this.projectId) this.meta.set('activeProjectId', this.projectId)
  }
  private fail(e: unknown): never {
    if (e instanceof StorageError) throw e
    if (e instanceof ApiFailure) {
      const { status, message, code } = e.error
      if (status === 409 || status === 422) throw new StorageError('conflict', status === 422 ? `The course server refused this change: ${message}` : message)
      if (code === 'session-expired' || code === 'unauthenticated') throw new StorageError('auth', 'Signed out: sign in again to save your changes')
      if (status === 0) throw new StorageError('unavailable', 'the course server cannot be reached')
      // M7 (second confirmation): a content refusal is reported in plain words and NOTHING is discarded; the edits stay
      // in this tab and in the outbox, and the student recovers with "Keep my edits as a version and load the saved
      // project" (EditAccess). Every other status keeps its existing handling.
      if (status === 400 && (code === 'bad-request' || code === 'integrity')) throw new StorageError('write', `the course server refused this change, so it was not saved (${message}). Your edits are still here: use “Keep my edits as a version and load the saved project” to continue`)
      throw new StorageError('write', message)
    }
    throw new StorageError('write', e instanceof Error ? e.message : String(e))
  }

  async getMeta<T>(key: string) {
    return this.meta.get(key) as T | undefined
  }
  async setMeta(key: string, value: unknown) {
    this.meta.set(key, value)
  }
  async listProjects(): Promise<ProjectSummary[]> {
    if (!this.projectId) return []
    const d = await this.getProject(this.projectId)
    return d ? [summaryOf(d)] : []
  }
  async getProject(uid: string) {
    try {
      const r = await api<ProjectReply>('GET', `/projects/${encodeURIComponent(uid)}`)
      this.version.set(uid, r.data.version)
      return r.data.doc
    } catch (e) {
      if (e instanceof ApiFailure && e.error.status === 404) return undefined
      this.fail(e)
    }
  }
  vetOps(doc: ProjectDoc, ops: Operation[]): VetResult {
    const s = screenMemberOps(doc, ops)
    if (!s.ok) return s
    const uid = doc.project.uid
    if (docApproval(doc).decision !== 'approved') this.acknowledged.delete(uid)
    else if (!this.acknowledged.has(uid) && touchesMaterial(doc, s.ops)) {
      if (!this.confirmFn(APPROVED_CHANGE_WARNING)) return { ok: false, error: 'Not changed: your approved proposal stays as the instructor approved it.' }
      this.acknowledged.add(uid)
    }
    return { ok: true, ops: s.ops }
  }

  // ------------------------------------------------------------------------------------------- outbox (M4)
  private outboxKey(uid: string) {
    return `sls-outbox:v1:${this.session.user.id}:${uid}`
  }
  stash(doc: ProjectDoc, pending: ChangeSet[]) {
    const box = this.outbox
    if (!box) return
    const uid = doc.project.uid
    if (!pending.length) return box.removeItem(this.outboxKey(uid))
    const entry: Outbox = { v: 1, baseVersion: this.version.get(uid) ?? 0, doc, changes: pending.map((c) => ({ change: c, clientChangeId: this.clientId(c) })), at: new Date().toISOString() }
    box.setItem(this.outboxKey(uid), JSON.stringify(entry))
  }
  recover(uid: string): { doc: ProjectDoc; changes: ChangeSet[] } | null {
    const box = this.outbox
    if (!box) return null
    let entry: Outbox | null = null
    try {
      entry = JSON.parse(box.getItem(this.outboxKey(uid)) ?? 'null') as Outbox | null
    } catch {
      entry = null
    }
    if (!entry || entry.v !== 1 || !Array.isArray(entry.changes) || !entry.changes.length || entry.doc?.project?.uid !== uid) return null
    // the same client change ids: a change set the server did receive before the page went away is not saved twice
    for (const x of entry.changes) this.clientIds.set(x.change, x.clientChangeId)
    this.version.set(uid, entry.baseVersion)
    return { doc: entry.doc, changes: entry.changes.map((x) => x.change) }
  }
  private clientId(c: ChangeSet) {
    let id = this.clientIds.get(c)
    if (!id) {
      id = `web-${crypto.randomUUID()}`
      this.clientIds.set(c, id)
    }
    return id
  }

  async saveProject(doc: ProjectDoc, changes: ChangeSet[], expectedRev: number | undefined): Promise<SaveResult> {
    const uid = doc.project.uid
    if (expectedRev === undefined && !this.version.has(uid)) return this.createProject(doc, changes)
    if (!changes.length) return { doc, changes: [] }
    const body = (base: number) => ({
      baseVersion: base,
      changes: changes.map((c, i) => {
        const replace = c.ops.length === 0 && (c.source === 'restore' || c.source === 'import')
        if (replace && i !== changes.length - 1) throw new StorageError('write', 'A restore must be saved on its own; try again.')
        return { clientChangeId: this.clientId(c), source: c.source, summary: c.summary, ...(c.rationale ? { rationale: c.rationale } : {}), ...(replace ? { replace: doc } : { ops: c.ops }) }
      }),
    })
    const base = this.version.get(uid) ?? 0
    try {
      const r = await api<SaveReply>('POST', `/projects/${encodeURIComponent(uid)}/changes`, body(base))
      this.version.set(uid, r.data.version)
      return { doc: r.data.doc, changes: r.data.changes.map(strip) }
    } catch (e) {
      if (!(e instanceof ApiFailure) || e.error.status !== 409 || !Array.isArray(e.error.data.changes)) this.fail(e)
      // automatic rebase when the teammate's changes touch other fields (§6.3 step 3)
      const remote = e.error.data.changes as ServerChange[]
      const mine = touched(changes.flatMap((c) => c.ops))
      const theirs = touched(remote.flatMap((c) => c.ops))
      const replaces = changes.some((c) => c.ops.length === 0) || remote.some((c) => c.ops.length === 0)
      const by = [...new Set(remote.map((c) => c.by).filter(Boolean))].join(', ') || 'a teammate'
      if (replaces || overlaps(mine, theirs)) {
        const when = remote.length ? new Date(remote[remote.length - 1].at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        throw new StorageError('conflict', `${by} saved a change to the same item${when ? ` at ${when}` : ''} (${remote.map((c) => c.summary).slice(0, 2).join('; ')}). Your edits were not saved.`)
      }
      try {
        const r = await api<SaveReply>('POST', `/projects/${encodeURIComponent(uid)}/changes`, body(Number(e.error.data.version)))
        this.version.set(uid, r.data.version)
        return { doc: r.data.doc, changes: [...remote.map(strip), ...r.data.changes.map(strip)], notice: `Saved. Merged with ${by}'s changes (${remote.length} change set${remote.length > 1 ? 's' : ''}).` }
      } catch (e2) {
        this.fail(e2)
      }
    }
  }
  private async createProject(doc: ProjectDoc, changes: ChangeSet[]): Promise<SaveResult> {
    const team = this.session.team
    if (!team) throw new StorageError('write', 'You are not in a team yet. Ask your instructor to add you, or join with a code.')
    try {
      const r = await api<SaveReply>('POST', `/teams/${encodeURIComponent(team.id)}/project`, { mode: 'doc', doc, changes, clientChangeId: `web-create-${crypto.randomUUID()}` })
      const uid = r.data.doc.project.uid
      this.version.set(uid, r.data.version)
      this.projectId = uid
      this.meta.set('activeProjectId', uid)
      return { doc: r.data.doc, changes: r.data.changes.map(strip) }
    } catch (e) {
      this.fail(e)
    }
  }
  async poll(uid: string): Promise<SaveResult | null> {
    const v = this.version.get(uid)
    try {
      const r = await api<ProjectReply>('GET', `/projects/${encodeURIComponent(uid)}`, undefined, v !== undefined ? { 'If-None-Match': `"v${v}"` } : {})
      if (r.status === 304 || r.data.version === v) return null
      const since = await api<{ changes: ServerChange[] }>('GET', `/projects/${encodeURIComponent(uid)}/changes?since=${v ?? -1}`)
      this.version.set(uid, r.data.version)
      const by = [...new Set(since.data.changes.map((c) => c.by).filter((x) => x && x !== this.session.user.initials))].join(', ')
      return { doc: r.data.doc, changes: since.data.changes.map(strip), ...(by ? { notice: `Updated with ${by}'s changes.` } : {}) }
    } catch {
      return null
    }
  }
  async listChanges(uid: string) {
    try {
      const r = await api<{ changes: ServerChange[] }>('GET', `/projects/${encodeURIComponent(uid)}/changes`)
      return r.data.changes.map(strip)
    } catch (e) {
      this.fail(e)
    }
  }
  async putSnapshot(uid: string, snap: Snapshot) {
    try {
      await api('POST', `/projects/${encodeURIComponent(uid)}/snapshots`, { kind: snap.kind, label: snap.label, doc: snap.doc })
    } catch (e) {
      this.fail(e)
    }
  }
  async listSnapshots(uid: string): Promise<SnapshotMeta[]> {
    try {
      return (await api<{ snapshots: SnapshotMeta[] }>('GET', `/projects/${encodeURIComponent(uid)}/snapshots`)).data.snapshots
    } catch {
      return []
    }
  }
  async getSnapshot(uid: string, id: string) {
    try {
      return (await api<Snapshot>('GET', `/projects/${encodeURIComponent(uid)}/snapshots/${encodeURIComponent(id)}`)).data
    } catch {
      return undefined
    }
  }
  async deleteSnapshot(uid: string, id: string) {
    try {
      await api('DELETE', `/projects/${encodeURIComponent(uid)}/snapshots/${encodeURIComponent(id)}`, {})
    } catch {
      // proposal and submission versions are kept by the server; retention pruning of them is simply skipped
    }
  }
}
