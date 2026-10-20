// Import pipeline (data model §10.3–§10.4): parse → identify → shape-check and normalise (never throws; every problem a
// message with a path) → integrity of the incoming document alone → checksum → a PLAN against the current project
// (new / identical / changed / conflict / ID collision / broken) → the student chooses: open as a separate project,
// merge (per-item choices), or replace (typed title). Nothing is written without the plan step; never a silent
// overwrite, deletion, renumbering or acceptance of a checksum mismatch.
// Accepted in P1: `sysml-studio-project` v1 and `week1-model-inputs` v1–3 (through Week 1's own importer).
import { importModelInputs } from '../../workbench/week1/team'
import { fromTeamRecord } from '../adapters/week1'
import { displayTitle, makeRelationship } from '../model/create'
import { formatId, newUid, nextNumber, numOf, prefixOf } from '../model/ids'
import { validateProject } from '../model/integrity'
import { fieldDiff, same } from '../model/ops'
import { isArtifactType, NO_REVIEW, OWN, SCHEMA_VERSION, UNCHECKED, type Artifact, type ChangeSet, type Milestone, type Operation, type ProjectDoc, type Provenance, type Relationship, type Stamp } from '../model/types'
import { newMilestones } from '../model/milestones'
import { canonicalJson, PROJECT_FORMAT, sha256Hex } from './exportProject'
import { relPrefix } from '../model/vocabulary'

export type ImportIssue = { severity: 'error' | 'warning'; path: string; message: string }
export type Analysis =
  | { ok: false; error: string; issues: ImportIssue[] }
  | { ok: true; kind: 'project' | 'week1'; format: string; version: number; file: string; incoming: ProjectDoc; changes: ChangeSet[]; issues: ImportIssue[]; checksum: 'ok' | 'mismatch' | 'absent' | 'unavailable' | 'not-applicable'; sha256: string | null }

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const str = (x: unknown) => (typeof x === 'string' ? x : '')
const num = (x: unknown, d = 0) => (typeof x === 'number' && Number.isFinite(x) ? x : d)
const stampOf = (x: unknown): Stamp => (isObj(x) ? { at: str(x.at), by: str(x.by), change: str(x.change) } : { at: '', by: '', change: '' })

function normArtifact(x: Record<string, unknown>, path: string, issues: ImportIssue[]): Artifact | null {
  if (!isArtifactType(x.type)) {
    issues.push({ severity: 'error', path, message: `“${str(x.type) || '(none)'}” is not an artifact type; the item is left out.` })
    return null
  }
  if (!str(x.uid) || !str(x.id)) {
    issues.push({ severity: 'error', path, message: 'An artifact without uid or ID is left out.' })
    return null
  }
  const prov = isObj(x.provenance) && typeof x.provenance.kind === 'string' ? (x.provenance as Provenance) : OWN
  return {
    uid: str(x.uid), id: str(x.id), type: x.type, title: str(x.title), description: str(x.description),
    attributes: isObj(x.attributes) ? (x.attributes as Artifact['attributes']) : {},
    status: x.status === 'retired' ? 'retired' : 'active',
    ...(isObj(x.retired) ? { retired: { at: str(x.retired.at), reason: str(x.retired.reason), by: str(x.retired.by) } } : {}),
    provenance: prov,
    ...(typeof x.rationale === 'string' ? { rationale: x.rationale } : {}),
    ...(typeof x.source === 'string' ? { source: x.source } : {}),
    validation: UNCHECKED, // recomputed; imported values are never trusted
    review: isObj(x.review) && ['none', 'needs-review', 'reviewed'].includes(str(x.review.state)) ? (x.review as Artifact['review']) : NO_REVIEW,
    milestones: Array.isArray(x.milestones) ? x.milestones.filter((n): n is number => typeof n === 'number') : [1],
    ...(typeof x.owner === 'string' ? { owner: x.owner } : {}),
    aiAssisted: x.aiAssisted === true,
    unresolvedRefs: Array.isArray(x.unresolvedRefs) ? x.unresolvedRefs.map(str) : [],
    formerIds: Array.isArray(x.formerIds) ? x.formerIds.map(str) : [],
    created: stampOf(x.created), revised: stampOf(x.revised), revision: num(x.revision, 1),
  }
}
function normRelationship(x: Record<string, unknown>, path: string, issues: ImportIssue[]): Relationship | null {
  const cat = x.category === 'structure' || x.category === 'stakeholder' ? x.category : x.category === 'trace' ? 'trace' : null
  if (!cat || !str(x.uid) || !str(x.id)) {
    issues.push({ severity: 'error', path, message: 'A relationship without uid, ID or category is left out.' })
    return null
  }
  return {
    uid: str(x.uid), id: str(x.id), category: cat, type: str(x.type) as Relationship['type'], from: str(x.from), to: str(x.to),
    ...(x.role === 'endA' || x.role === 'endB' ? { role: x.role } : {}),
    ...(typeof x.rationale === 'string' ? { rationale: x.rationale } : {}),
    ...(typeof x.note === 'string' ? { note: x.note } : {}),
    ...(isObj(x.attributes) ? { attributes: x.attributes as Relationship['attributes'] } : {}),
    status: x.status === 'suspect' || x.status === 'retired' ? x.status : 'active',
    ...(x.draft === true ? { draft: true } : {}),
    ...(isObj(x.retired) ? { retired: { at: str(x.retired.at), reason: str(x.retired.reason), by: str(x.retired.by) } } : {}),
    provenance: isObj(x.provenance) && typeof x.provenance.kind === 'string' ? (x.provenance as Provenance) : OWN,
    created: stampOf(x.created), revised: stampOf(x.revised),
  }
}

/** Parses, identifies, normalises and checks a file. Never throws. */
export async function analyzeImport(text: string, file = ''): Promise<Analysis> {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { ok: false, error: 'This file is not valid JSON.', issues: [] }
  }
  if (!isObj(d)) return { ok: false, error: 'This file holds no JSON object.', issues: [] }
  if (d.format === 'week1-model-inputs') {
    const rec = importModelInputs(text)
    if ('error' in rec) return { ok: false, error: rec.error, issues: [] }
    const version = num(d.version, 0)
    const sha = await sha256Hex(text)
    const { doc, renumbered } = fromTeamRecord(rec, { provenance: { kind: 'imported', from: { format: 'week1-model-inputs', version, file, ...(sha ? { sha256: sha } : {}) }, at: new Date().toISOString() } })
    const issues: ImportIssue[] = renumbered.map((r) => ({ severity: 'warning', path: r.prefix, message: `${r.from || '(empty ID)'} became ${r.to} (the file used it twice or in a wrong form).` }))
    return { ok: true, kind: 'week1', format: 'week1-model-inputs', version, file, incoming: doc, changes: [], issues, checksum: 'not-applicable', sha256: sha }
  }
  if (d.format !== PROJECT_FORMAT) return { ok: false, error: `This app reads a project export (format “${PROJECT_FORMAT}”) or a Week 1 model-inputs file (format “week1-model-inputs”, versions 1–3). This file says “${str(d.format) || 'no format'}”.`, issues: [] }
  const version = num(d.schemaVersion, 0)
  if (version > SCHEMA_VERSION) return { ok: false, error: `This project file uses schema version ${version}; this app reads version ${SCHEMA_VERSION}. Update the app to open it.`, issues: [] }
  if (version < 1) return { ok: false, error: 'This project file has no valid schema version.', issues: [] }
  const issues: ImportIssue[] = []
  if (!isObj(d.project) || !str(d.project.uid)) return { ok: false, error: '“project” is missing or has no uid.', issues }
  const list = (k: string) => {
    if (d[k] === undefined) return []
    if (!Array.isArray(d[k])) {
      issues.push({ severity: 'error', path: k, message: `“${k}” must be a list.` })
      return []
    }
    return (d[k] as unknown[]).flatMap((x, i) => (isObj(x) ? [{ x, path: `${k}[${i}]` }] : (issues.push({ severity: 'error', path: `${k}[${i}]`, message: 'Not an object; left out.' }), [])))
  }
  const artifacts: Record<string, Artifact> = {}
  const seenIds = new Set<string>()
  for (const { x, path } of list('artifacts')) {
    const a = normArtifact(x, path, issues)
    if (!a) continue
    if (artifacts[a.uid] || seenIds.has(a.id)) {
      issues.push({ severity: 'error', path, message: `${a.id} appears twice in the file; the second is left out.` })
      continue
    }
    seenIds.add(a.id)
    artifacts[a.uid] = a
  }
  const relationships: Record<string, Relationship> = {}
  for (const { x, path } of list('relationships')) {
    const r = normRelationship(x, path, issues)
    if (!r) continue
    if (relationships[r.uid] || Object.values(relationships).some((y) => y.id === r.id)) {
      issues.push({ severity: 'error', path, message: `${r.id} appears twice in the file; the second is left out.` })
      continue
    }
    if (typeof x.fromId === 'string' && artifacts[r.from] && artifacts[r.from].id !== x.fromId) issues.push({ severity: 'warning', path, message: `${r.id}: “fromId” says ${x.fromId} but the uid points to ${artifacts[r.from].id}; the uid is used.` })
    relationships[r.uid] = r
  }
  const p = d.project as Record<string, unknown>
  const team = isObj(d.team) ? d.team : {}
  const mIn = list('milestones').map(({ x }) => x)
  const milestones: Milestone[] = newMilestones().map((m) => {
    const x = mIn.find((y) => y.week === m.week)
    return x ? { ...m, state: (str(x.state) || 'not-started') as Milestone['state'], ...(isObj(x.approval) ? { approval: x.approval as Milestone['approval'] } : {}), aiStatement: str(x.aiStatement), notes: isObj(x.notes) ? (x.notes as Record<string, string>) : {}, exports: Array.isArray(x.exports) ? (x.exports as Milestone['exports']) : [], ...(typeof x.markedSubmittedAt === 'string' ? { markedSubmittedAt: x.markedSubmittedAt } : {}), ...(typeof x.contentUpdatedAt === 'string' ? { contentUpdatedAt: x.contentUpdatedAt } : {}) } : m
  })
  const incoming: ProjectDoc = {
    schemaVersion: 1,
    project: {
      uid: str(p.uid), title: str(p.title), createdAt: str(p.createdAt), updatedAt: str(p.updatedAt),
      createdWith: { app: 'sysml-learning-studio', version: isObj(p.createdWith) ? str(p.createdWith.version) : '' },
      course: isObj(p.course) ? (p.course as ProjectDoc['project']['course']) : {},
      model: isObj(p.model) ? (p.model as ProjectDoc['project']['model']) : { purpose: '', options: { assessment: true, relationships: 'all' } },
    },
    team: {
      label: str(team.label), threePersonTeam: team.threePersonTeam === true,
      members: Array.isArray(team.members) ? (team.members as ProjectDoc['team']['members']) : [],
      roles: isObj(team.roles) ? (team.roles as Record<string, string>) : {}, decisionRules: str(team.decisionRules), norms: str(team.norms),
      prefixOwnership: isObj(team.prefixOwnership) ? (team.prefixOwnership as Record<string, string>) : {}, prefixesText: str(team.prefixesText),
      ...(typeof team.charterUpdatedAt === 'string' ? { charterUpdatedAt: team.charterUpdatedAt } : {}),
    },
    artifacts,
    relationships,
    milestones,
    modelElements: Object.fromEntries(list('modelElements').map(({ x }) => [str(x.uid), x as never])),
    mappings: Object.fromEntries(list('mappings').map(({ x }) => { const { artifactId: _a, ...m } = x; void _a; return [str(x.uid), m as never] })),
    findings: list('findings').map(({ x }) => x as never),
    issued: isObj(d.issued) ? Object.fromEntries(Object.entries(d.issued).map(([k, v]) => [k, num(v)])) : {},
    rev: num(d.rev, 0),
  }
  // integrity of the incoming document alone: unusable relationships are left out and listed
  for (const i of validateProject(incoming)) {
    if (i.severity === 'error') {
      const bad = Object.values(incoming.relationships).find((r) => i.ids.includes(r.id))
      if (bad) delete incoming.relationships[bad.uid]
      issues.push({ severity: 'error', path: i.ids.join(', '), message: `${i.message}${bad ? ' Left out.' : ''}` })
    } else issues.push({ severity: 'warning', path: i.ids.join(', '), message: i.message })
  }
  // counters never below what the file holds
  for (const a of Object.values(incoming.artifacts)) incoming.issued[a.type] = Math.max(incoming.issued[a.type] ?? 0, numOf(a.id))
  for (const r of Object.values(incoming.relationships)) incoming.issued[relPrefix(r.category)] = Math.max(incoming.issued[relPrefix(r.category)] ?? 0, numOf(r.id))
  const changes = list('changes').map(({ x }) => x as unknown as ChangeSet).filter((c) => typeof c.id === 'string' && Array.isArray(c.ops))
  // checksum
  let checksum: 'ok' | 'mismatch' | 'absent' | 'unavailable' = 'absent'
  const integ = isObj(d.integrity) ? d.integrity : null
  if (integ && typeof integ.value === 'string') {
    const { integrity: _i, ...body } = d
    void _i
    const v = await sha256Hex(canonicalJson(body))
    checksum = v === null ? 'unavailable' : v === integ.value ? 'ok' : 'mismatch'
  }
  if (checksum === 'mismatch') issues.unshift({ severity: 'warning', path: 'integrity', message: 'The checksum does not match: the file was changed after it was exported (by hand or by damage). Look at the plan carefully before you continue.' })
  if (checksum === 'absent') issues.unshift({ severity: 'warning', path: 'integrity', message: 'The file carries no checksum, so changes after export cannot be detected.' })
  return { ok: true, kind: 'project', format: PROJECT_FORMAT, version, file, incoming, changes, issues, checksum, sha256: await sha256Hex(text) }
}

// ------------------------------------------------------------------------------------------------ plan
export type PlanClass = 'new' | 'identical' | 'changed-theirs' | 'changed-mine' | 'conflict' | 'id-collision' | 'broken'
export type Choice = 'create' | 'skip' | 'mine' | 'theirs' | 'both' | 'same'
export type PlanItem = { key: string; kind: 'artifact' | 'relationship'; id: string; title: string; cls: PlanClass; localUid?: string; localId?: string; detail: string; choices: Choice[]; default: Choice | null }
export type Plan = { items: PlanItem[]; onlyLocal: number; counts: Record<PlanClass, number>; notes: string[] }
export const CLASS_LABEL: Record<PlanClass, string> = { new: 'New', identical: 'Identical', 'changed-theirs': 'Changed in the file', 'changed-mine': 'Changed here only', conflict: 'Conflict', 'id-collision': 'ID collision', broken: 'Broken reference' }
export const CHOICE_LABEL: Record<Choice, string> = { create: 'Add it', skip: 'Leave it out', mine: 'Keep mine', theirs: 'Take theirs', both: 'Keep both (theirs renumbered)', same: 'Treat as the same item' }

const contentOf = (a: Artifact) => ({ title: a.title, description: a.description, rationale: a.rationale ?? '', status: a.status, attributes: Object.fromEntries(Object.entries(a.attributes).filter(([k]) => k !== 'seq')) })
const blankArtifact = (a: Artifact) => !a.description.trim() && (a.id === 'MGO-001' || (!a.title.trim() && (a.revision <= 1 || a.type === 'ENT')))
const relContent = (r: Relationship, map: (u: string) => string) => ({ type: r.type, from: map(r.from), to: map(r.to), note: r.note ?? '', status: r.status === 'retired' ? 'retired' : 'live', draft: !!r.draft, attributes: Object.fromEntries(Object.entries(r.attributes ?? {}).filter(([k]) => k !== 'seq')) })

/** Classifies every incoming item against the current project. Week 1 legacy files carry no uids, so an incoming item
 *  with the same course ID and type is matched to the local item (the team's shared numbering). */
export function buildPlan(current: ProjectDoc, a: Extract<Analysis, { ok: true }>): Plan {
  const items: PlanItem[] = []
  const local = Object.values(current.artifacts)
  const localById = new Map(local.map((x) => [x.id, x]))
  const localChanges = new Set<string>()
  const theirChanges = new Set(a.changes.map((c) => c.id))
  for (const x of local) localChanges.add(x.revised.change)
  const alias = new Map<string, string>() // incoming uid → local uid
  for (const inc of Object.values(a.incoming.artifacts)) {
    const byUid = current.artifacts[inc.uid]
    const byId = localById.get(inc.id)
    const singleton = inc.id === 'ENT-001' || inc.id === 'MGO-001'
    const loc = byUid ?? ((a.kind === 'week1' || singleton) && byId && byId.type === inc.type ? byId : undefined)
    if (loc) {
      alias.set(inc.uid, loc.uid)
      const base = { key: inc.uid, kind: 'artifact' as const, id: inc.id, title: displayTitle(inc), localUid: loc.uid, localId: loc.id }
      if (same(contentOf(loc), contentOf(inc))) items.push({ ...base, cls: 'identical', detail: 'Same content in both.', choices: ['skip'], default: 'skip' })
      else if (blankArtifact(loc)) items.push({ ...base, cls: 'changed-theirs', detail: 'Yours is still blank; the file has content.', choices: ['theirs', 'mine'], default: 'theirs' })
      else if (a.kind === 'project' && loc.revised.change === inc.revised.change) items.push({ ...base, cls: 'identical', detail: 'Same revision in both.', choices: ['skip'], default: 'skip' })
      else if (a.kind === 'project' && theirChanges.has(loc.revised.change)) items.push({ ...base, cls: 'changed-theirs', detail: 'Changed in the file since your last change to it.', choices: ['theirs', 'mine', 'both'], default: 'theirs' })
      else if (a.kind === 'project' && localChanges.has(inc.revised.change) && current.artifacts[inc.uid]) items.push({ ...base, cls: 'changed-mine', detail: 'You changed it after the version in the file.', choices: ['mine', 'theirs', 'both'], default: 'mine' })
      else items.push({ ...base, cls: 'conflict', detail: `Both differ: yours “${displayTitle(loc)}”, the file’s “${displayTitle(inc)}”. Choose.`, choices: singleton ? ['mine', 'theirs'] : ['mine', 'theirs', 'both'], default: null })
      continue
    }
    if (byId) {
      const sameName = displayTitle(byId).toLowerCase() === displayTitle(inc).toLowerCase() && byId.type === inc.type
      items.push({ key: inc.uid, kind: 'artifact', id: inc.id, title: displayTitle(inc), cls: 'id-collision', localUid: byId.uid, localId: byId.id, detail: `${inc.id} is already used here by “${displayTitle(byId)}”${byId.status === 'retired' ? ' (retired)' : ''}. Keeping both gives the file’s item the next free ID.`, choices: sameName ? ['both', 'same', 'skip'] : ['both', 'skip'], default: 'both' })
      continue
    }
    if (inc.type !== 'ENT' && numOf(inc.id) <= (current.issued[inc.type] ?? 0)) {
      items.push({ key: inc.uid, kind: 'artifact', id: inc.id, title: displayTitle(inc), cls: 'id-collision', detail: `${inc.id} was issued before in your project (IDs are never reused); it gets the next free ID.`, choices: ['both', 'skip'], default: 'both' })
      continue
    }
    items.push({ key: inc.uid, kind: 'artifact', id: inc.id, title: displayTitle(inc), cls: 'new', detail: 'Not in your project.', choices: ['create', 'skip'], default: 'create' })
  }
  const mapEnd = (u: string) => alias.get(u) ?? u
  const localRels = Object.values(current.relationships)
  for (const inc of Object.values(a.incoming.relationships)) {
    const fromId = a.incoming.artifacts[inc.from]?.id ?? '?'
    const toId = a.incoming.artifacts[inc.to]?.id ?? '?'
    const title = inc.category === 'stakeholder' ? `${inc.id}: ${inc.attributes?.fromText ?? fromId} ${inc.type || '…'} ${inc.attributes?.toText ?? toId}` : `${fromId} ${inc.type} ${toId}`
    const loc = current.relationships[inc.uid] ?? (a.kind === 'week1' ? localRels.find((r) => r.status !== 'retired' && (inc.category === 'stakeholder' ? r.id === inc.id && r.category === 'stakeholder' : r.type === inc.type && r.from === mapEnd(inc.from) && r.to === mapEnd(inc.to))) : undefined)
    const endsKnown = (!inc.from || a.incoming.artifacts[inc.from] || current.artifacts[inc.from]) && (!inc.to || a.incoming.artifacts[inc.to] || current.artifacts[inc.to])
    if (!endsKnown) {
      items.push({ key: inc.uid, kind: 'relationship', id: inc.id, title, cls: 'broken', detail: 'An end is in neither the file nor your project; it is not created.', choices: ['skip'], default: 'skip' })
      continue
    }
    if (loc) {
      const base = { key: inc.uid, kind: 'relationship' as const, id: inc.id, title, localUid: loc.uid, localId: loc.id }
      if (same(relContent(loc, (u) => u), relContent(inc, mapEnd))) items.push({ ...base, cls: 'identical', detail: 'Same in both.', choices: ['skip'], default: 'skip' })
      else items.push({ ...base, cls: 'conflict', detail: 'Recorded differently in the file. Choose.', choices: ['mine', 'theirs'], default: null })
      continue
    }
    const idTaken = localRels.some((r) => r.id === inc.id) || numOf(inc.id) <= (current.issued[relPrefix(inc.category)] ?? 0)
    items.push({ key: inc.uid, kind: 'relationship', id: inc.id, title, cls: idTaken ? 'id-collision' : 'new', detail: idTaken ? `${inc.id} is taken here; it gets the next free ID.` : 'Not in your project.', choices: ['create', 'skip'], default: 'create' })
  }
  const incomingUids = new Set([...Object.values(a.incoming.artifacts).map((x) => alias.get(x.uid) ?? x.uid)])
  const onlyLocal = local.filter((x) => !incomingUids.has(x.uid)).length
  const counts = Object.fromEntries((['new', 'identical', 'changed-theirs', 'changed-mine', 'conflict', 'id-collision', 'broken'] as PlanClass[]).map((c) => [c, items.filter((i) => i.cls === c).length])) as Record<PlanClass, number>
  const notes: string[] = []
  if (onlyLocal) notes.push(`${onlyLocal} item${onlyLocal > 1 ? 's' : ''} only in your project stay as they are (an import never deletes).`)
  if (!current.team.label.trim() && a.incoming.team.label.trim()) notes.push(`Team label: yours is empty; “${a.incoming.team.label}” is taken from the file.`)
  if (!current.team.decisionRules.trim() && a.incoming.team.decisionRules.trim()) notes.push('Team charter: yours is empty; the file’s charter is taken.')
  return { items, onlyLocal, counts, notes }
}

/** True when every item has a choice (conflicts need the student's decision). */
export const planComplete = (plan: Plan, choices: Record<string, Choice>) => plan.items.every((i) => (choices[i.key] ?? i.default) !== null)

/** The merge as operations for one `import` change set. Items whose ends end up missing are left out and listed. */
export function planToOps(current: ProjectDoc, a: Extract<Analysis, { ok: true }>, plan: Plan, choices: Record<string, Choice>, stamp: Stamp): { ops: Operation[]; lines: string[] } {
  const ops: Operation[] = []
  const lines: string[] = []
  const at = stamp.at
  const prov = (p: Provenance): Provenance => (p.kind === 'copied-from-practice' ? p : { kind: 'imported', from: { format: a.format, version: a.version, ...(a.file ? { file: a.file } : {}), ...(a.sha256 ? { sha256: a.sha256 } : {}) }, at })
  const counters: Record<string, number> = {}
  const nextFree = (prefix: string) => {
    counters[prefix] = Math.max(counters[prefix] ?? 0, nextNumber(current, prefix) - 1, ...Object.values(a.incoming.artifacts).filter((x) => prefixOf(x.id) === prefix).map((x) => numOf(x.id))) + 1
    return formatId(prefix, counters[prefix])
  }
  const reserve = (prefix: string, id: string) => (counters[prefix] = Math.max(counters[prefix] ?? 0, numOf(id)))
  const uidMap = new Map<string, string>()
  const choice = (i: PlanItem) => choices[i.key] ?? i.default
  const usedUids = new Set(Object.keys(current.artifacts))
  for (const i of plan.items.filter((x) => x.kind === 'artifact')) {
    const inc = a.incoming.artifacts[i.key]
    const c = choice(i)
    if (c === 'skip' || c === null) {
      if (i.localUid && i.cls === 'identical') uidMap.set(i.key, i.localUid)
      continue
    }
    if (c === 'mine') {
      uidMap.set(i.key, i.localUid!)
      continue
    }
    if ((c === 'theirs' || c === 'same') && i.localUid) {
      const loc = current.artifacts[i.localUid]
      uidMap.set(i.key, loc.uid)
      const f = fieldDiff(loc, { title: inc.title, description: inc.description, ...(inc.rationale !== undefined ? { rationale: inc.rationale } : {}), ...Object.fromEntries(Object.entries(inc.attributes).filter(([k]) => k !== 'seq').map(([k, v]) => [`attributes.${k}`, v])) })
      if (f.length) ops.push({ op: 'update-artifact', uid: loc.uid, fields: f })
      if (inc.status === 'retired' && loc.status === 'active') ops.push({ op: 'retire-artifact', uid: loc.uid, reason: `Retired in the imported file ${a.file || ''}`.trim() })
      lines.push(`${loc.id}: took the file’s version.`)
      continue
    }
    const renumber = c === 'both' || i.cls === 'id-collision'
    const id = renumber ? nextFree(inc.type) : inc.id
    if (!renumber) reserve(inc.type, id)
    const uid = usedUids.has(inc.uid) ? newUid() : inc.uid
    usedUids.add(uid)
    uidMap.set(i.key, uid)
    ops.push({ op: 'create-artifact', artifact: { ...inc, uid, id, provenance: prov(inc.provenance), formerIds: renumber ? [...inc.formerIds, inc.id] : inc.formerIds, validation: UNCHECKED } })
    lines.push(renumber ? `${inc.id} (“${displayTitle(inc)}”) became ${id}.` : `Added ${id}.`)
  }
  const endOf = (u: string) => (u ? (uidMap.get(u) ?? (current.artifacts[u] ? u : undefined)) : '')
  const relUsed = new Set(Object.keys(current.relationships))
  const relCounters: Record<string, number> = {}
  for (const i of plan.items.filter((x) => x.kind === 'relationship')) {
    const inc = a.incoming.relationships[i.key]
    const c = choice(i)
    if (c === 'skip' || c === null || c === 'mine') continue
    const from = endOf(inc.from)
    const to = endOf(inc.to)
    if (from === undefined || to === undefined) {
      lines.push(`${inc.id} left out: one of its ends was not imported.`)
      continue
    }
    if (c === 'theirs' && i.localUid) {
      const f = fieldDiff(current.relationships[i.localUid], { type: inc.type, from, to, note: inc.note ?? '', ...(inc.draft !== undefined ? { draft: !!inc.draft } : {}), ...Object.fromEntries(Object.entries(inc.attributes ?? {}).filter(([k]) => k !== 'seq').map(([k, v]) => [`attributes.${k}`, v])) })
      if (f.length) ops.push({ op: 'update-relationship', uid: i.localUid, fields: f })
      continue
    }
    const prefix = relPrefix(inc.category)
    let id = inc.id
    if (i.cls === 'id-collision') {
      relCounters[prefix] = Math.max(relCounters[prefix] ?? 0, nextNumber(current, prefix) - 1, ...Object.values(a.incoming.relationships).filter((r) => prefixOf(r.id) === prefix).map((r) => numOf(r.id))) + 1
      id = formatId(prefix, relCounters[prefix])
    } else relCounters[prefix] = Math.max(relCounters[prefix] ?? 0, numOf(id))
    const uid = relUsed.has(inc.uid) ? newUid() : inc.uid
    relUsed.add(uid)
    ops.push({ op: 'create-relationship', relationship: { ...makeRelationship({ id, category: inc.category, type: inc.type, from, to, stamp, note: inc.note, attributes: inc.attributes, draft: inc.draft, uid, rationale: inc.rationale }), status: inc.status === 'retired' ? 'retired' : inc.status, provenance: prov(inc.provenance) } })
  }
  // team fields the project has not filled in yet
  const t = a.incoming.team
  const teamPatch: Record<string, unknown> = {}
  if (!current.team.label.trim() && t.label.trim()) teamPatch.label = t.label
  if (!current.team.decisionRules.trim() && t.decisionRules.trim()) Object.assign(teamPatch, { decisionRules: t.decisionRules, norms: t.norms, roles: t.roles, prefixesText: t.prefixesText, prefixOwnership: t.prefixOwnership, threePersonTeam: t.threePersonTeam })
  const tf = fieldDiff(current.team, teamPatch)
  if (tf.length) ops.push({ op: 'update-team', fields: tf })
  const m1 = current.milestones.find((m) => m.week === 1)
  const im1 = a.incoming.milestones.find((m) => m.week === 1)
  if (m1 && im1 && !m1.aiStatement.trim() && im1.aiStatement.trim()) ops.push({ op: 'update-milestone', week: 1, fields: [{ path: 'aiStatement', before: m1.aiStatement, after: im1.aiStatement }] })
  return { ops, lines }
}
