// Server-held canonical projects (PROJECT_DATA_SCHEMA.md §5.1, §6, §7). The document is the existing ProjectDoc, stored
// unchanged; operations are replayed through the same pure model (applyOps → checkOp) the browser uses; imports and
// creations run through the existing import pipeline (analyzeImport) on the server. Every write is one transaction with
// an optimistic version check: a stale baseVersion is a 409 carrying the changes since, for the client's rebase or its
// "Conflict requires review" state.
//
// Member change sets (PROJECT_DATA_SCHEMA.md §6.2 step 3; M2 review M1, M2): nothing the browser says about the current
// state is trusted. For every change set the server
//   1. recomputes every `before` value from the stored document (no forged history; undo stays truthful);
//   2. derives the side-effect operations itself (deriveOps: retirement → relationships suspect, material change →
//      dependents flagged) and appends the ones the browser did not send (the browser's own derived operations are kept,
//      so nothing is recorded twice);
//   3. applies everything through applyOps (checkOp: I1–I7, I9, I13);
// and after the whole request it runs validateProject on the result and refuses (422, with the problems) any write that
// leaves a NEW integrity error or a new I8 problem (an active relationship touching a retired artifact).
// Server-written change sets (approval, member list) use commitOps.
import { commitOps } from '../../src/project/model/commit'
import { changeId, newUid, snapshotId } from '../../src/project/model/ids'
import { validateProject } from '../../src/project/model/integrity'
import { applyOps } from '../../src/project/model/ops'
import { APPROVAL_REFUSAL, approvalFingerprint, docApproval, keepServerOwned, MEMBER_SOURCES, screenMemberOps } from '../../src/project/model/serverRules'
import { NO_REVIEW, type ChangeSet, type ChangeSource, type Operation, type ProjectDoc, type Snapshot, type SnapshotKind, type Stamp } from '../../src/project/model/types'
import { prunable } from '../../src/project/store/revisions'
import { approvalOps, approvalTransition } from './approvalBinding'
import { newProblems, normElement, normMapping, serverBefores, serverDerive, upsertProblem } from './memberOps'
import { buildExport, PROJECT_FORMAT } from '../../src/project/transfer/exportProject'
import { analyzeImport, normArtifact, normRelationship, type ImportIssue } from '../../src/project/transfer/importProject'
import { badRequest, HttpError, isObj, str, type Deps, type Principal } from '../http/core'
import type { ChangeRow, ProjectRow, Repos, TeamRow } from '../repo/types'

const integrity = (message: string, data?: Record<string, unknown>) => new HttpError(422, 'integrity', message, data)
const CLIENT_CHANGE_ID = /^[A-Za-z0-9:_-]{8,100}$/
/** Kinds a member's browser may ask for (the browser store writes all of them). Only `manual`, `pre-restore` and `auto`
 *  are stored as asked; `milestone` and `pre-import` are labels only the server gives (M2 review M3), so a browser-sent
 *  one is stored as `manual`. `proposal` and `submission` are never accepted from a browser. */
export const CLIENT_SNAPSHOT_KINDS: SnapshotKind[] = ['manual', 'milestone', 'pre-import', 'pre-restore', 'auto']
const CLIENT_STORED_KINDS: SnapshotKind[] = ['manual', 'pre-restore', 'auto']
const KEPT_SNAPSHOT_KINDS: SnapshotKind[] = ['proposal', 'submission']
/** m6 (confirmation N-1): versions the server labels itself cannot be deleted by a member: proposal and submission
 *  (kept forever), and pre-import and milestone (an import record or an export points at them). Snapshot numbers are
 *  never reused either (repo/sqlite.ts maxSnapshotNo + the submissions track's snapshot counter). */
const NOT_DELETABLE_KINDS: SnapshotKind[] = ['proposal', 'submission', 'pre-import', 'milestone']

// ------------------------------------------------------------------------------------------- views
export type ChangeView = ChangeSet & { version: number; authenticated: boolean }
export const changeView = (c: ChangeRow, names: Map<string, string>): ChangeView => ({
  id: c.id, at: c.at, by: c.by, source: c.source, summary: c.summary, ...(c.rationale ? { rationale: c.rationale } : {}), ops: c.ops, rev: c.rev,
  ...(c.actorUserId ? { actor: { userId: c.actorUserId, name: names.get(c.actorUserId) ?? c.by } } : {}),
  version: c.version, authenticated: !!c.actorUserId,
})
export async function nameMap(r: Repos, ids: (string | null)[]): Promise<Map<string, string>> {
  const m = new Map<string, string>()
  for (const id of new Set(ids.filter((x): x is string => !!x))) {
    const u = await r.identity.userById(id)
    if (u) m.set(id, u.displayName)
  }
  return m
}
export const projectView = (p: ProjectRow) => ({ id: p.id, teamId: p.teamId, version: p.version, updatedAt: p.updatedAt, doc: p.doc })

// ------------------------------------------------------------------------------------------- untrusted operations
const uid = (x: unknown, f: string) => str(x, f, 100, { min: 1 })
function fields(x: unknown, f: string) {
  if (!Array.isArray(x) || x.length > 500) throw badRequest(`${f} must be a list of field changes.`)
  return x.map((y, i) => {
    if (!isObj(y)) throw badRequest(`${f}[${i}] must be an object.`)
    const path = str(y.path, `${f}[${i}].path`, 200, { min: 1 })
    if (!/^[A-Za-z0-9_.-]+$/.test(path) || path.split('.').some((k) => !k || k === '__proto__' || k === 'constructor' || k === 'prototype')) throw badRequest(`${f}[${i}].path is not a field path.`)
    return { path, before: y.before as never, after: y.after as never }
  })
}
const REVIEW_STATES = ['none', 'needs-review', 'reviewed']
const reviewState = (x: unknown, f: string) => {
  if (!isObj(x) || !REVIEW_STATES.includes(String(x.state))) throw badRequest(`${f} is not a review state.`)
  return x as never
}

/** Shape-checks and normalises one operation from a request body (allow-listed fields only; the stamps of created
 *  items are set later by the server). Integrity is checkOp's job, inside applyOps. */
export function normOp(x: unknown, i: number): Operation {
  const f = `ops[${i}]`
  if (!isObj(x)) throw badRequest(`${f} must be an object.`)
  const issues: ImportIssue[] = []
  switch (x.op) {
    case 'create-artifact': {
      const a = isObj(x.artifact) ? normArtifact(x.artifact, f, issues) : null
      if (!a) throw integrity(issues[0]?.message ?? `${f}: not an artifact.`)
      return { op: 'create-artifact', artifact: { ...a, status: 'active', review: NO_REVIEW, revision: 1 } }
    }
    case 'create-relationship': {
      const r = isObj(x.relationship) ? normRelationship(x.relationship, f, issues) : null
      if (!r) throw integrity(issues[0]?.message ?? `${f}: not a relationship.`)
      return { op: 'create-relationship', relationship: { ...r, status: r.status === 'retired' ? 'active' : r.status } }
    }
    case 'update-artifact':
    case 'update-relationship':
      return { op: x.op, uid: uid(x.uid, `${f}.uid`), fields: fields(x.fields, `${f}.fields`) }
    case 'retire-artifact':
    case 'retire-relationship':
      return { op: x.op, uid: uid(x.uid, `${f}.uid`), reason: str(x.reason, `${f}.reason`, 4000) }
    case 'restore-artifact':
      return { op: 'restore-artifact', uid: uid(x.uid, `${f}.uid`) }
    case 'renumber-artifact':
      return { op: 'renumber-artifact', uid: uid(x.uid, `${f}.uid`), from: str(x.from, `${f}.from`, 20), to: str(x.to, `${f}.to`, 20) }
    case 'set-review':
      if (x.kind !== 'artifact' && x.kind !== 'relationship') throw badRequest(`${f}.kind must be artifact or relationship.`)
      return { op: 'set-review', uid: uid(x.uid, `${f}.uid`), kind: x.kind, before: reviewState(x.before, `${f}.before`), after: reviewState(x.after, `${f}.after`) }
    case 'update-team':
    case 'update-project':
      return { op: x.op, fields: fields(x.fields, `${f}.fields`) }
    case 'update-milestone': {
      const week = Number(x.week)
      if (!Number.isInteger(week) || week < 1 || week > 14) throw badRequest(`${f}.week must be 1–14.`)
      return { op: 'update-milestone', week, fields: fields(x.fields, `${f}.fields`) }
    }
    case 'upsert-mapping':
      return { op: 'upsert-mapping', mapping: normMapping(x.mapping, `${f}.mapping`) }
    case 'upsert-model-element':
      return { op: 'upsert-model-element', element: normElement(x.element, `${f}.element`) }
    default:
      throw badRequest(`${f}: unknown operation “${String(x.op)}”.`)
  }
}
/** Created items carry the server's stamp, never the browser's (self-declared initials, client clock). M7: so does a
 *  Week 8 mapping confirmation (`confirmedBy` = the signed-in member, the server's time and this change set's CHG; the
 *  `source.projectRev` it was read at = the stored revision the change applies to). */
const stampCreates = (ops: Operation[], s: Stamp, rev: number): Operation[] =>
  ops.map((o) =>
    o.op === 'create-artifact'
      ? { ...o, artifact: { ...o.artifact, created: s, revised: s } }
      : o.op === 'create-relationship'
        ? { ...o, relationship: { ...o.relationship, created: s, revised: s } }
        : o.op === 'upsert-mapping' && (o.mapping.confirmedBy || o.mapping.source)
          ? { ...o, mapping: { ...o.mapping, ...(o.mapping.confirmedBy ? { confirmedBy: s } : {}), ...(o.mapping.source ? { source: { ...o.mapping.source, projectRev: rev } } : {}) } }
          : o,
  )

// ------------------------------------------------------------------------------------------- import pipeline
/** Builds an export envelope around an untrusted document so the existing import pipeline normalises it. */
function envelope(doc: Record<string, unknown>, changes: unknown[] = []): string {
  const vals = (x: unknown) => (isObj(x) ? Object.values(x) : Array.isArray(x) ? x : [])
  return JSON.stringify({ format: PROJECT_FORMAT, schemaVersion: doc.schemaVersion ?? 1, project: doc.project, team: doc.team, artifacts: vals(doc.artifacts), relationships: vals(doc.relationships), milestones: doc.milestones, modelElements: vals(doc.modelElements), mappings: vals(doc.mappings), findings: Array.isArray(doc.findings) ? doc.findings : [], issued: doc.issued, rev: doc.rev, changes })
}
export type Analyzed = { doc: ProjectDoc; changes: ChangeSet[]; issues: ImportIssue[]; format: string; fileName: string; sha256: string | null; checksum: string }
/** Runs the shared import pipeline (parse, identify, normalise, integrity, checksum) on untrusted input. */
export async function analyze(input: { file?: unknown; doc?: unknown; changes?: unknown; fileName?: string }): Promise<Analyzed> {
  let text: string
  if (input.file !== undefined) text = JSON.stringify(input.file)
  else if (isObj(input.doc)) text = envelope(input.doc, Array.isArray(input.changes) ? input.changes : [])
  else throw badRequest('Send a project file or a project document.')
  let a
  try {
    a = await analyzeImport(text, input.fileName ?? '')
  } catch {
    throw integrity('The project could not be read.')
  }
  if (!a.ok) throw integrity(a.error, { issues: a.issues.slice(0, 20) })
  const errors = validateProject(a.incoming).filter((i) => i.severity === 'error')
  if (errors.length) throw integrity(`The project breaks an integrity rule: ${errors[0].message}`)
  return { doc: a.incoming, changes: a.changes, issues: a.issues, format: a.format, fileName: input.fileName ?? '', sha256: a.sha256, checksum: a.checksum }
}

/** Approval never arrives as authority: it is reset, and what the file said is kept in the rationale (§7). */
function withoutApproval(doc: ProjectDoc): { doc: ProjectDoc; note: string } {
  const was = docApproval(doc)
  const m1 = doc.milestones.find((m) => m.week === 1)?.approval
  const notes: string[] = []
  if (was.decision) notes.push(`self-declared “${was.decision}”${was.decidedOn ? ` on ${was.decidedOn}` : ''}`)
  else if (m1?.decision) notes.push(`self-declared “${m1.decision}” on the Week 1 milestone`)
  const artifacts = { ...doc.artifacts }
  for (const a of Object.values(artifacts)) if (a.type === 'ENT') artifacts[a.uid] = { ...a, attributes: { ...a.attributes, approval: { decision: '', decidedOn: '' } } }
  const milestones = doc.milestones.map((m) => {
    const { approval: _a, ...rest } = m
    void _a
    return rest
  })
  return { doc: { ...doc, artifacts, milestones }, note: notes.length ? `The incoming enterprise approval was ${notes.join('; ')}; it requires an instructor decision on the course server.` : '' }
}

const projectedMembers = async (r: Repos, teamId: string, prev: ProjectDoc['team']['members'] = []) => {
  const now = await r.teams.members(teamId)
  const active = now.map((m) => ({ initials: m.initials, displayName: m.displayName, active: true }))
  const left = prev.filter((m) => !now.some((x) => x.initials === m.initials)).map((m) => ({ ...m, active: false }))
  return [...active, ...left]
}

// ------------------------------------------------------------------------------------------- create / import
export type CreateInput = { mode: 'doc' | 'import'; analyzed: Analyzed; clientChangeId: string | null }
export async function createProject(deps: Deps, p: Principal, team: TeamRow, input: CreateInput) {
  const { store, clock } = deps
  const now = clock().toISOString()
  const { doc: clean, note } = withoutApproval(input.analyzed.doc)
  return store.tx(async (r) => {
    if (await r.projects.byTeam(team.id)) throw new HttpError(409, 'conflict', 'Your team already has a project on the course server. Open it from My Project; to bring a file in, use Import Project there.')
    let uidV = clean.project.uid
    if (!uidV || (await r.projects.get(uidV))) uidV = newUid()
    const history = input.analyzed.changes.filter((c) => typeof c.id === 'string' && /^CHG-\d+$/.test(c.id))
    const maxHist = Math.max(0, ...history.map((c) => Number(c.id.slice(4)) || 0))
    const n = Math.max(clean.issued.CHG ?? 0, maxHist) + 1
    const members = await projectedMembers(r, team.id)
    const doc: ProjectDoc = {
      ...clean,
      project: { ...clean.project, uid: uidV, updatedAt: now, createdAt: clean.project.createdAt || now, course: { ...clean.project.course, teamLabel: team.label } },
      team: { ...clean.team, label: team.label, members },
      issued: { ...clean.issued, CHG: n },
      rev: clean.rev + 1,
    }
    const imported = input.mode === 'import'
    const change: ChangeSet = { id: changeId(n), at: now, by: p.user.initials, source: imported ? 'import' : 'system', summary: imported ? `Imported ${input.analyzed.fileName || 'a project file'} into the course server` : 'Created the project on the course server', ...(note ? { rationale: note } : {}), ops: [], rev: doc.rev }
    await r.projects.create({ id: uidV, teamId: team.id, doc, version: 1, createdAt: now, createdBy: p.userId, updatedAt: now, updatedBy: p.userId })
    let seq = 1
    const seen = new Set<string>()
    for (const c of history) {
      if (seen.has(c.id)) continue
      seen.add(c.id)
      // migrated history keeps its self-declared initials; actor_user_id stays NULL (never relabelled as authenticated)
      const source: ChangeSource = ['editor', 'import', 'practice-copy', 'migration', 'restore', 'review', 'system'].includes(c.source) ? c.source : 'migration'
      await r.projects.appendChange(uidV, { id: c.id, at: String(c.at ?? ''), by: String(c.by ?? ''), source, summary: String(c.summary ?? '').slice(0, 300), ...(typeof c.rationale === 'string' ? { rationale: c.rationale } : {}), ops: Array.isArray(c.ops) ? c.ops : [], rev: Number(c.rev) || 0, seq: seq++, version: 0, actorUserId: null, clientChangeId: null })
    }
    await r.projects.appendChange(uidV, { ...change, seq: seq++, version: 1, actorUserId: p.userId, clientChangeId: input.clientChangeId })
    const snp: Snapshot = { id: snapshotId(1), at: now, kind: imported ? 'pre-import' : 'manual', label: imported ? `As imported from ${input.analyzed.fileName || 'a file'}` : 'Created on the course server', rev: doc.rev, doc }
    await r.projects.putSnapshot(uidV, { id: snp.id, at: snp.at, kind: snp.kind, label: snp.label, rev: snp.rev, createdBy: p.userId }, doc)
    if (imported) await r.projects.putImportRecord({ id: newUid(), projectId: uidV, userId: p.userId, at: now, format: input.analyzed.format, fileName: input.analyzed.fileName || null, fileSha256: input.analyzed.sha256, fileSize: null, warnings: JSON.stringify(input.analyzed.issues.slice(0, 50)), createdIds: Object.values(doc.artifacts).map((a) => a.id), chgId: change.id, preImportSnapshot: snp.id })
    await r.audit.append({ at: now, actorUserId: p.userId, actorRole: 'student', action: imported ? 'project.import' : 'project.create', targetType: 'project', targetId: uidV, outcome: 'ok', detail: { team: team.id, checksum: input.analyzed.checksum } })
    const names = await nameMap(r, [p.userId])
    return { version: 1, doc, changes: (await r.projects.changes(uidV)).map((c) => changeView(c, names)) }
  })
}

// ------------------------------------------------------------------------------------------- changes
export type ChangeIn = { clientChangeId: string; source: ChangeSource; summary: string; rationale?: string; ops?: Operation[]; replace?: Analyzed }
export async function parseChanges(body: unknown): Promise<{ baseVersion: number; changes: ChangeIn[] }> {
  if (!isObj(body)) throw badRequest('Send { baseVersion, changes }.')
  const baseVersion = Number(body.baseVersion)
  if (!Number.isInteger(baseVersion) || baseVersion < 0) throw badRequest('baseVersion must be the version you last loaded.')
  if (!Array.isArray(body.changes) || !body.changes.length || body.changes.length > 50) throw badRequest('changes must hold 1–50 change sets.')
  const out: ChangeIn[] = []
  const ids = new Set<string>()
  for (const [i, c] of body.changes.entries()) {
    if (!isObj(c)) throw badRequest(`changes[${i}] must be an object.`)
    const clientChangeId = str(c.clientChangeId, `changes[${i}].clientChangeId`, 100)
    if (!CLIENT_CHANGE_ID.test(clientChangeId) || ids.has(clientChangeId)) throw badRequest(`changes[${i}].clientChangeId is missing, malformed or repeated.`)
    ids.add(clientChangeId)
    const source = c.source as ChangeSource
    if (!MEMBER_SOURCES.includes(source)) throw new HttpError(403, 'forbidden', `Change source “${String(c.source)}” is written by the server only.`)
    const summary = str(c.summary, `changes[${i}].summary`, 300, { optional: true }) || 'Change'
    const rationale = str(c.rationale, `changes[${i}].rationale`, 4000, { optional: true })
    if (c.replace !== undefined) {
      if (source !== 'restore' && source !== 'import') throw badRequest('Only a restore or an import replaces the whole content.')
      if (c.ops !== undefined && (!Array.isArray(c.ops) || c.ops.length)) throw badRequest('A replacement carries no operations.')
      out.push({ clientChangeId, source, summary, ...(rationale ? { rationale } : {}), replace: await analyze({ doc: c.replace, fileName: source === 'restore' ? 'restored version' : 'imported file' }) })
    } else {
      if (source === 'restore') throw badRequest('A restore replaces the whole content.')
      if (!Array.isArray(c.ops)) throw badRequest(`changes[${i}].ops must be a list.`)
      out.push({ clientChangeId, source, summary, ...(rationale ? { rationale } : {}), ops: c.ops.map(normOp) })
    }
  }
  return { baseVersion, changes: out }
}

/** The whole content of `incoming` becomes a new revision of `cur` (restore / replace-import): identity, history and
 *  counters stay (no ID is reused, I3); server-owned fields are kept from `cur`. */
function replaceContent(cur: ProjectDoc, incoming: ProjectDoc, at: string, n: number): ProjectDoc {
  const kept = keepServerOwned(cur, incoming)
  const issued: Record<string, number> = { ...kept.issued }
  for (const [k, v] of Object.entries(cur.issued)) issued[k] = Math.max(issued[k] ?? 0, v)
  issued.CHG = n
  return { ...kept, project: { ...kept.project, uid: cur.project.uid, createdAt: cur.project.createdAt, updatedAt: at, course: { ...kept.project.course, teamLabel: cur.team.label } }, team: { ...kept.team, label: cur.team.label }, issued, rev: cur.rev + 1 }
}

export async function submitChanges(deps: Deps, p: Principal, projectId: string, input: { baseVersion: number; changes: ChangeIn[] }) {
  const { store, clock } = deps
  return store.tx(async (r) => {
    const cur = await r.projects.get(projectId)
    if (!cur) throw new HttpError(404, 'not-found', 'Not found.')
    // idempotency: a retried request (network timeout) gets the original result, never a duplicate change
    const existing = await r.projects.changesByClientIds(projectId, input.changes.map((c) => c.clientChangeId))
    let resumed: ChangeRow[] = []
    if (existing.length) {
      const names = await nameMap(r, existing.map((c) => c.actorUserId))
      if (existing.length === input.changes.length) return { version: cur.version, doc: cur.doc, changes: existing.map((c) => changeView(c, names)), replayed: true }
      // a partly received request (an outbox replayed after a lost response; confirmation review N5): when the received
      // sets are its first ones and nothing was saved after them, the rest continues from there; otherwise it is a
      // conflict, so the browser keeps its edits as a version and reloads (never a save that fails forever)
      const k = existing.length
      const ids = new Set(existing.map((c) => c.clientChangeId))
      const prefix = input.changes.slice(0, k).every((c) => ids.has(c.clientChangeId))
      if (!prefix || existing.some((c) => c.version !== cur.version)) {
        const since = await r.projects.changes(projectId, input.baseVersion)
        const sinceNames = await nameMap(r, since.map((c) => c.actorUserId))
        throw new HttpError(409, 'conflict', 'Conflict requires review: part of this save was stored before and the project changed since.', { version: cur.version, baseVersion: input.baseVersion, changes: since.map((c) => changeView(c, sinceNames)) })
      }
      resumed = existing
      input = { baseVersion: cur.version, changes: input.changes.slice(k) }
    }
    if (cur.version !== input.baseVersion) {
      const since = await r.projects.changes(projectId, input.baseVersion)
      const names = await nameMap(r, since.map((c) => c.actorUserId))
      throw new HttpError(409, 'conflict', 'Conflict requires review: a teammate saved changes after you loaded the project.', { version: cur.version, baseVersion: input.baseVersion, changes: since.map((c) => changeView(c, names)) })
    }
    const at = clock().toISOString()
    let doc = cur.doc
    const out: (ChangeSet & { clientChangeId: string | null })[] = []
    for (const c of input.changes) {
      const n = (doc.issued.CHG ?? 0) + 1
      const ctx = { at, by: p.user.initials, change: changeId(n) }
      let next: ProjectDoc
      let ops: Operation[] = []
      // --- m6 (review H-1) --- an import (merge or replace) gets a pre-import version written by the SERVER, labelled
      // kind `pre-import` and bound to this change set by an import record; "Undo this import" restores exactly it
      const pre = c.source === 'import' ? await preImport(r, p, projectId, doc, ctx.change, at, c) : null
      // --- end m6 ---
      if (c.replace) next = replaceContent(doc, c.replace.doc, at, n)
      else {
        const screened = screenMemberOps(doc, c.ops ?? [])
        if (!screened.ok) throw integrity(screened.error, { clientChangeId: c.clientChangeId })
        // M2: before values come from the stored document, never from the request
        const own = stampCreates(serverBefores(doc, screened.ops), ctx, doc.rev)
        const upsert = upsertProblem(doc, own)
        if (upsert) throw integrity(upsert, { clientChangeId: c.clientChangeId })
        // M1: the side effects the browser should have derived are derived here too
        ops = serverDerive(doc, own, ctx, c.summary)
        let res
        try {
          res = applyOps(doc, ops, ctx)
        } catch {
          throw integrity('An operation in this change could not be applied.', { clientChangeId: c.clientChangeId })
        }
        if (!res.ok) throw integrity(res.error, { clientChangeId: c.clientChangeId })
        // the approval is the instructor's: whatever the order of operations (an enterprise created and then "approved"
        // in the same change set, confirmation review N1), a member change set never alters it
        if (approvalFingerprint(res.doc) !== approvalFingerprint(doc)) throw integrity(APPROVAL_REFUSAL, { clientChangeId: c.clientChangeId })
        next = { ...res.doc, issued: { ...res.doc.issued, CHG: n }, rev: doc.rev + 1 }
      }
      if (pre) await pre.record(ops) // m6: the import record lists the IDs this change created
      out.push({ id: ctx.change, at, by: ctx.by, source: c.source, summary: c.summary, ...(c.rationale ? { rationale: c.rationale } : {}), ops, rev: next.rev, actor: { userId: p.userId, name: p.user.displayName }, clientChangeId: c.clientChangeId })
      doc = next
    }
    // M1: the stored document never gains an integrity problem it did not have
    const problems = newProblems(cur.doc, doc, { i8: !input.changes.some((c) => c.replace) })
    if (problems.length) throw integrity(`This change would leave the project inconsistent: ${problems[0].message} Reload the project and try again.`, { issues: problems.slice(0, 20).map((i) => ({ code: i.code, message: i.message, ids: i.ids })) })
    // H1: an approved proposal whose material content changed needs re-review (and is approved again once it is back)
    const tr = await approvalTransition(r, projectId, doc)
    if (tr) {
      const n = (doc.issued.CHG ?? 0) + 1
      const ctx = { at, by: p.user.initials, change: changeId(n) }
      const res = commitOps(doc, approvalOps(doc, tr.mirror), ctx, tr.summary)
      if (!res.ok) throw new HttpError(500, 'server', `A server change was refused: ${res.error}`)
      doc = { ...res.doc, issued: { ...res.doc.issued, CHG: n }, rev: doc.rev + 1 }
      out.push({ id: ctx.change, at, by: ctx.by, source: 'system', summary: tr.summary, ops: res.ops, rev: doc.rev, actor: { userId: p.userId, name: p.user.displayName }, clientChangeId: null })
      if (!(await r.approvals.setState(tr.approval.id, tr.from, tr.to, tr.to === 'approved-changes-pending' ? at : null))) throw new HttpError(409, 'conflict', 'The approval changed while saving; try again.')
      await r.audit.append({ at, actorUserId: p.userId, actorRole: 'student', action: tr.to === 'approved-changes-pending' ? 'approval.changed-after-approval' : 'approval.back-to-approved', targetType: 'approval', targetId: tr.approval.id, outcome: 'ok' })
    }
    if (!(await r.projects.update(projectId, doc, cur.version, p.userId, at))) throw new HttpError(409, 'conflict', 'Conflict requires review: the project changed while saving.', { version: cur.version + 1 })
    const version = cur.version + 1
    let seq = await r.projects.nextSeq(projectId)
    for (const c of out) {
      const { actor: _a, clientChangeId, ...plain } = c
      void _a
      await r.projects.appendChange(projectId, { ...plain, seq: seq++, version, actorUserId: p.userId, clientChangeId })
    }
    for (const c of out) if (c.source === 'restore' || c.source === 'import') await r.audit.append({ at, actorUserId: p.userId, actorRole: 'student', action: c.source === 'restore' ? 'project.restore' : 'project.replace-import', targetType: 'project', targetId: projectId, outcome: 'ok', detail: { change: c.id } })
    const resumedNames = await nameMap(r, resumed.map((c) => c.actorUserId))
    return {
      version,
      doc,
      changes: [...resumed.map((c) => changeView(c, resumedNames)), ...out.map((c) => {
        const { clientChangeId: _c, ...cs } = c
        void _c
        return { ...cs, version, authenticated: true }
      })],
    }
  })
}

// --- m6 (review H-1) ---
const IMPORT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
/** Writes the pre-import version of `doc` (kind `pre-import`, server-labelled; members cannot delete it, its number is
 *  never reused; like any pre-import version it counts toward the version quota and the oldest beyond ten can be pruned
 *  when the quota is full, after which "Undo this import" says the version is gone: confirmation N-6) and returns the
 *  writer of the import record that binds it to the change. The import's id is the one the browser put on the created
 *  or merged artifacts (`attributes.import.importId`, or the last `attributes.importMerges` entry: N-3), so the browser
 *  can find exactly this restore point. An id already used anywhere on the server (for example in a file exported by
 *  another team and merged here) is replaced by a fresh one, never a failed save (N-2). */
async function preImport(r: Repos, p: Principal, projectId: string, doc: ProjectDoc, chgId: string, at: string, c: ChangeIn) {
  const creates = (c.ops ?? []).filter((o): o is Extract<Operation, { op: 'create-artifact' }> => !!o && (o as Operation).op === 'create-artifact')
  const merges = (c.ops ?? []).flatMap((o) => (o && (o as Operation).op === 'update-artifact' ? ((o as Extract<Operation, { op: 'update-artifact' }>).fields ?? []) : [])).filter((f) => f?.path === 'attributes.importMerges' && Array.isArray(f.after)).map((f) => (f.after as unknown[])[(f.after as unknown[]).length - 1])
  const meta = [...creates.map((o) => o.artifact?.attributes?.import), ...merges].find((x) => !!x && typeof x === 'object') as Record<string, unknown> | undefined
  const asked = typeof meta?.importId === 'string' && IMPORT_ID.test(meta.importId) ? meta.importId : null
  const id = asked && !(await r.projects.importRecordAnywhere(asked)) ? asked : newUid()
  const snp = snapshotId((await r.projects.maxSnapshotNo(projectId)) + 1)
  await r.projects.putSnapshot(projectId, { id: snp, at, kind: 'pre-import', label: `Before import ${chgId}`, rev: doc.rev, createdBy: p.userId }, doc)
  const prov = creates.map((o) => o.artifact?.provenance).find((x) => x?.kind === 'imported') as { from?: { format?: unknown; file?: unknown; sha256?: unknown } } | undefined
  return {
    id,
    snapshot: snp,
    record: (applied: Operation[]) =>
      r.projects.putImportRecord({
        id, projectId, userId: p.userId, at,
        format: typeof prov?.from?.format === 'string' ? prov.from.format.slice(0, 40) : c.replace ? 'project (replace)' : 'project',
        fileName: typeof meta?.file === 'string' ? meta.file.slice(0, 200) : typeof prov?.from?.file === 'string' ? prov.from.file.slice(0, 200) : null,
        fileSha256: typeof meta?.sha256 === 'string' && /^[0-9a-f]{64}$/.test(meta.sha256) ? meta.sha256 : null,
        fileSize: null, warnings: '[]',
        createdIds: applied.filter((o): o is Extract<Operation, { op: 'create-artifact' }> => o.op === 'create-artifact').map((o) => o.artifact.id),
        chgId, preImportSnapshot: snp,
      }),
  }
}
// --- end m6 ---

/** A change set written by the server itself (approval decisions, member list), through commitOps. */
export async function systemChange(r: Repos, projectId: string, build: (doc: ProjectDoc) => Operation[], meta: { source: ChangeSource; summary: string; rationale?: string; actorUserId: string | null; initials: string; actorName: string; at: string }) {
  const cur = await r.projects.get(projectId)
  if (!cur) throw new HttpError(404, 'not-found', 'Not found.')
  const ops = build(cur.doc)
  if (!ops.length) return { version: cur.version, doc: cur.doc, change: null }
  const n = (cur.doc.issued.CHG ?? 0) + 1
  const ctx = { at: meta.at, by: meta.initials, change: changeId(n) }
  const res = commitOps(cur.doc, ops, ctx, meta.summary)
  if (!res.ok) throw new HttpError(500, 'server', `A server change was refused: ${res.error}`)
  const doc: ProjectDoc = { ...res.doc, issued: { ...res.doc.issued, CHG: n }, rev: cur.doc.rev + 1 }
  if (!(await r.projects.update(projectId, doc, cur.version, meta.actorUserId ?? 'system', meta.at))) throw new HttpError(409, 'conflict', 'The project changed meanwhile; try again.')
  const change: ChangeSet = { id: ctx.change, at: meta.at, by: meta.initials, source: meta.source, summary: meta.summary, ...(meta.rationale ? { rationale: meta.rationale } : {}), ops: res.ops, rev: doc.rev }
  await r.projects.appendChange(projectId, { ...change, seq: await r.projects.nextSeq(projectId), version: cur.version + 1, actorUserId: meta.actorUserId, clientChangeId: null })
  return { version: cur.version + 1, doc, change }
}

/** Projects Team.members from the memberships (a `system` change set) after a membership change. */
export async function syncMembers(r: Repos, teamId: string, actor: Principal, at: string) {
  const project = await r.projects.byTeam(teamId)
  if (!project) return
  const members = await projectedMembers(r, teamId, project.doc.team.members)
  await systemChange(r, project.id, (doc) => (JSON.stringify(doc.team.members) === JSON.stringify(members) ? [] : [{ op: 'update-team', fields: [{ path: 'members', before: doc.team.members as never, after: members as never }] }]), { source: 'system', summary: 'Team membership updated on the course server', actorUserId: actor.userId, initials: actor.user.initials, actorName: actor.user.displayName, at })
}

// ------------------------------------------------------------------------------------------- snapshots, export
/** A version stored on a member's request (M2 review M3). A supplied document (this browser's unsaved edits, kept before
 *  a conflict is resolved) goes through the import pipeline (shape, normalisation, integrity), keeps the server-owned
 *  fields of the stored project and is size-checked; `rev` comes from the server; the kind is limited (milestone and
 *  pre-import are server labels); the per-project quota prunes automatic versions first and then refuses. */
/** A member's version label (confirmation review N3): one line, at most 120 characters of letters, digits, spaces and
 *  common punctuation; a label that reads like a server label (approval, submission, milestone, instructor) is marked as
 *  the student's own, so it cannot pass for evidence. */
export const SNAPSHOT_LABEL_MAX = 120
const SERVER_SOUNDING = /\b(approv\w*|submi\w*|milestone|instructor|graded|official)\b/i
export function snapshotLabel(x: unknown): string {
  const raw = str(x, 'label', 300, { optional: true })
  const clean = raw.replace(/[^\p{L}\p{N} .,:;!?()'"&/+#_\u2013\u2014-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, SNAPSHOT_LABEL_MAX).trim()
  if (!clean) return 'Saved version'
  return SERVER_SOUNDING.test(clean) ? `Student-saved version: ${clean}`.slice(0, SNAPSHOT_LABEL_MAX + 23) : clean
}

export async function putSnapshot(deps: Deps, p: Principal, project: ProjectRow, body: unknown) {
  if (!isObj(body)) throw badRequest('Send { kind, label, doc? }.')
  const asked = body.kind as SnapshotKind
  if (!CLIENT_SNAPSHOT_KINDS.includes(asked)) throw badRequest(`kind must be one of ${CLIENT_SNAPSHOT_KINDS.join(', ')}.`)
  const kind: SnapshotKind = CLIENT_STORED_KINDS.includes(asked) ? asked : 'manual'
  const label = snapshotLabel(body.label)
  if (body.doc !== undefined && !isObj(body.doc)) throw badRequest('doc must be a project document.')
  const supplied = body.doc === undefined ? null : (await analyze({ doc: body.doc, fileName: 'saved version' })).doc
  const quota = deps.config.snapshotQuota
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    const cur = await r.projects.get(project.id)
    if (!cur) throw new HttpError(404, 'not-found', 'Not found.')
    let d = cur.doc
    if (supplied) {
      const kept = keepServerOwned(cur.doc, supplied)
      d = { ...kept, project: { ...kept.project, uid: cur.doc.project.uid, course: cur.doc.project.course }, team: { ...kept.team, label: cur.doc.team.label }, rev: cur.doc.rev }
    }
    const bytes = Buffer.byteLength(JSON.stringify(d))
    if (bytes > quota.perSnapshot) throw new HttpError(413, 'too-large', `A saved version may hold at most ${Math.round(quota.perSnapshot / 1024)} KB.`)
    // quota: versions beyond their kind's retention go first, then the oldest automatic and pre-restore ones
    let usage = await r.projects.snapshotUsage(project.id)
    const fits = () => usage.count + 1 <= quota.count && usage.bytes + bytes <= quota.bytes
    if (!fits()) {
      const metas = await r.projects.snapshots(project.id)
      const candidates = [...prunable(metas), ...metas.filter((m) => m.kind === 'auto' || m.kind === 'pre-restore').sort((x, y) => x.at.localeCompare(y.at))]
      const removed: string[] = []
      for (const m of candidates) {
        if (fits()) break
        if (removed.includes(m.id)) continue
        removed.push(m.id)
        await r.projects.deleteSnapshot(project.id, m.id)
        usage = await r.projects.snapshotUsage(project.id)
      }
      if (removed.length) await r.audit.append({ at, actorUserId: p.userId, actorRole: 'student', action: 'project.snapshot.prune', targetType: 'project', targetId: project.id, outcome: 'ok', detail: { removed } })
      if (!fits()) throw new HttpError(413, 'too-large', `This project has reached its limit of saved versions (${quota.count} versions, ${Math.round(quota.bytes / 1024 / 1024)} MB). Delete old versions in History, then try again.`)
    }
    const id = snapshotId((await r.projects.maxSnapshotNo(project.id)) + 1)
    const meta = { id, at, kind, label, rev: cur.doc.rev, createdBy: p.userId }
    await r.projects.putSnapshot(project.id, meta, d)
    return { id, at, kind, label, rev: meta.rev, createdBy: p.user.initials }
  })
}
export async function deleteSnapshot(deps: Deps, p: Principal, project: ProjectRow, snpId: string) {
  return deps.store.tx(async (r) => {
    const s = await r.projects.snapshot(project.id, snpId)
    if (!s) throw new HttpError(404, 'not-found', 'Not found.')
    if (KEPT_SNAPSHOT_KINDS.includes(s.kind)) throw new HttpError(403, 'forbidden', 'Proposal and submission versions are kept permanently.')
    if (NOT_DELETABLE_KINDS.includes(s.kind)) throw new HttpError(403, 'forbidden', 'Versions the course server saved before an import or for an export are kept: “Undo this import” and the export record rely on them.')
    await r.projects.deleteSnapshot(project.id, snpId)
    await r.audit.append({ at: deps.clock().toISOString(), actorUserId: p.userId, actorRole: 'student', action: 'project.snapshot.delete', targetType: 'project', targetId: project.id, outcome: 'ok', detail: { snapshot: snpId, kind: s.kind } })
    return { ok: true }
  })
}

export async function exportFile(r: Repos, project: ProjectRow, exportedBy: string, at: string) {
  const rows = await r.projects.changes(project.id)
  const names = await nameMap(r, rows.map((c) => c.actorUserId))
  const changes: ChangeSet[] = rows.map((c) => {
    const v = changeView(c, names)
    const { version: _v, authenticated: _a, ...cs } = v
    void _v
    void _a
    return cs
  })
  return buildExport(project.doc, { exportedBy, changes, at, edition: 'server' })
}
