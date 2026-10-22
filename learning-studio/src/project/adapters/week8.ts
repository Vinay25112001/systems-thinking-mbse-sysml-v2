// Week 8 preview adapter (roadmap §2.2, trace plan §4): the project's Week 1 artifacts as the ImportSource the existing
// Week 8 pipeline consumes (src/workbench/week8/skeleton.ts), so the generator, the audit and the mapping rules run
// unchanged; and a per-artifact mapping status from the five statuses. A mapping becomes Mapped only when a person
// confirms it in the Week 8 lab tool (M7), which stores it in the project as a ModelMapping (upsert-mapping) with its
// provenance: who confirmed it and when, the Week 1 ID and name at that moment, the item's revision and the project
// revision read. IDs are never renumbered; a later change, rename or removal is reported, never dropped.
import { auditFindings, generateSysml, sourceFromTeam, type Finding, type ImportSource } from '../../workbench/week8/skeleton'
import { MAPPING_KINDS, mappingOf, type MappingKind } from '../../content/lectures/week08/labBrief'
import { MODEL_INPUTS_VERSION } from '../../workbench/week1/team'
import { toTeamRecord } from './week1'
import { projectTitle } from '../model/create'
import { formatId, newUid, numOf } from '../model/ids'
import { cleanMapping } from '../model/mappingShape'
import { WEEK8_PACKAGES } from '../model/week8Packages'
import type { MappingStatus, ModelMapping, Operation, ProjectDoc, Stamp } from '../model/types'

export const PREVIEW_ORIGIN = 'My Project (Week 1 artifacts)'
/** The kinds the preview shows on the left, in MAPPING_KINDS order (Week 1 rows). */
export const PREVIEW_PREFIXES = ['ENT', 'PRT', 'EXT', 'STK', 'CON', 'REL', 'MGO', 'NEED'] as const

/** The ImportSource the Week 8 generator expects, built from the project (T-C1: equal to sourceFromTeam on the record).
 *  AeroLink practice copies not yet adapted are left out (they must not enter the team model, trace plan §4.3). */
export function sourceFromProject(doc: ProjectDoc): ImportSource {
  return sourceFromTeam(toTeamRecord(doc, { excludeUnadapted: true }), PREVIEW_ORIGIN)
}

export type PreviewRow = { uid: string; id: string; title: string; prefix: string; status: MappingStatus; reason: string; findings: Finding[] }
export type PreviewGroup = { kind: MappingKind; rows: PreviewRow[] }
export type Preview = { source: ImportSource; findings: Finding[]; groups: PreviewGroup[]; text: string; counts: Record<MappingStatus, number>; unadapted: string[]; skipped: string[]; partial: string[] }

const BLOCKING = new Set(['defect', 'gap'])

/** Status per artifact (trace plan §4.4): Invalid or incomplete when a defect or an undispositioned gap of the audit
 *  names it; Mapped when the team confirmed it in the Week 8 lab tool and it has not changed since (M7); Needs review
 *  when it changed since that confirmation, carries a review flag or a suspect relationship; Mapping proposed when a
 *  course rule exists; Not mapped when none does. This page never marks anything Mapped itself. */
export function buildPreview(doc: ProjectDoc, date = new Date().toISOString().slice(0, 10)): Preview {
  const source = sourceFromProject(doc)
  const findings = auditFindings(source)
  const text = generateSysml(source, { purpose: doc.project.model.purpose || 'Model purpose not written yet: who uses this model, for which decisions (Week 8 lab, Session 1).', date }).text
  const active = Object.values(doc.artifacts).filter((a) => a.status === 'active')
  const suspect = new Set(Object.values(doc.relationships).filter((r) => r.status === 'suspect').flatMap((r) => [r.from, r.to]))
  const unadapted = active.filter((a) => a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted)
  const rows: PreviewRow[] = []
  const mv = mappingViews(doc)
  const views = new Map(mv.rows.filter((v) => v.entry).map((v) => [v.entry!.uid, v]))
  const statusOf = (uid: string, id: string, prefix: string, review: boolean, practice: boolean): { status: MappingStatus; reason: string; findings: Finding[] } => {
    const f = findings.filter((x) => x.id === id)
    const rule = mappingOf(prefix)
    if (practice) return { status: 'invalid-or-incomplete', reason: 'Copied from the AeroLink practice and not adapted yet: practice content must not enter your model.', findings: f }
    const block = f.find((x) => BLOCKING.has(x.cls))
    if (block) return { status: 'invalid-or-incomplete', reason: block.text, findings: f }
    // M7: the team's own confirmation in the Week 8 lab tool, stored in the project (never inferred here)
    const v = views.get(uid)
    if (v?.state === 'mapped') return { status: 'mapped', reason: mappedReason(v.mapping!, prefix), findings: f }
    if (v && (v.state === 'changed' || v.state === 'renamed')) return { status: 'needs-review', reason: `Changed since your team mapped it in the Week 8 lab tool (${v.mapping!.id}): confirm the mapping again there.`, findings: f }
    if (review) return { status: 'needs-review', reason: 'Changed upstream since it was written: review it in My Project, then the mapping can be confirmed.', findings: f }
    if (!rule) return { status: 'not-mapped', reason: 'The course mapping has no rule for this kind yet.', findings: f }
    return { status: 'mapping-proposed', reason: `Proposed: ${rule.construct} in package ${rule.pkg}${rule.modeledIn > 8 ? `, modeled in Week ${rule.modeledIn}` : ''}. You confirm it in Week 8.`, findings: f }
  }
  for (const a of active) {
    if (!PREVIEW_PREFIXES.includes(a.type as (typeof PREVIEW_PREFIXES)[number])) continue
    const practice = a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted
    rows.push({ uid: a.uid, id: a.id, title: a.title || a.description, prefix: a.type, ...statusOf(a.uid, a.id, a.type, a.review.state === 'needs-review' || suspect.has(a.uid), practice) })
  }
  for (const r of Object.values(doc.relationships).filter((x) => x.category === 'stakeholder' && x.status !== 'retired')) {
    const from = doc.artifacts[r.from]?.id ?? String(r.attributes?.fromText ?? '')
    const to = doc.artifacts[r.to]?.id ?? String(r.attributes?.toText ?? '')
    rows.push({ uid: r.uid, id: r.id, title: `${from || '?'} ${r.type || '(type not chosen)'} ${to || '?'}`, prefix: 'REL', ...statusOf(r.uid, r.id, 'REL', r.status === 'suspect', false) })
  }
  const groups = MAPPING_KINDS.filter((k) => PREVIEW_PREFIXES.includes(k.prefix as (typeof PREVIEW_PREFIXES)[number])).map((kind) => ({ kind, rows: rows.filter((r) => r.prefix === kind.prefix).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })) }))
  const counts = { 'not-mapped': 0, 'mapping-proposed': 0, mapped: 0, 'needs-review': 0, 'invalid-or-incomplete': 0 } as Record<MappingStatus, number>
  for (const r of rows) counts[r.status]++
  return { source, findings, groups, text, counts, unadapted: unadapted.map((a) => a.id), skipped: mv.skipped, partial: mv.partial }
}

// ---------------------------------------------------------------------------------------------- M7: the Week 8 tool
/** The origin the Week 8 lab tool records when it reads My Project: the same words as a file import of the equivalent
 *  Week 1 model inputs, so the generated skeleton is byte-identical either way (golden test in week8.test.ts). The
 *  tool shows which source is in use (project name, revision, time) beside it, outside the SysML text. */
export const WEEK8_PROJECT_ORIGIN = `Week 1 model inputs, version ${MODEL_INPUTS_VERSION}`

/** The ImportSource the Week 8 lab tool generates from when the team chooses My Project. Same projection as the Week 1
 *  model-inputs export (toTeamRecord), AeroLink practice copies not yet adapted left out. */
export function week8SourceFromProject(doc: ProjectDoc): ImportSource {
  return sourceFromTeam(toTeamRecord(doc, { excludeUnadapted: true }), WEEK8_PROJECT_ORIGIN)
}

/** Which project the Week 8 tool read, and when (shown to the student, kept in the tool's saved state). */
export type ProjectRef = { uid: string; title: string; team: string; rev: number; savedAt: string; readAt: string; storage: 'http' | 'indexeddb' | 'memory' }
export function projectRefOf(doc: ProjectDoc, storage: ProjectRef['storage'], readAt: string): ProjectRef {
  return { uid: doc.project.uid, title: projectTitle(doc), team: doc.team.label, rev: doc.rev, savedAt: doc.project.updatedAt, readAt, storage }
}

/** One Week 1 item the team can map in Week 8: an active artifact of a Week 1 kind (not an unadapted practice copy)
 *  or a live stakeholder relationship. */
export type Week1Entry = { uid: string; id: string; prefix: string; title: string; revision: number; createdAt: string }
const clip = (s: string) => s.normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 300)
export function week1Entries(doc: ProjectDoc): Week1Entry[] {
  const out: Week1Entry[] = []
  for (const a of Object.values(doc.artifacts)) {
    if (a.status !== 'active' || !PREVIEW_PREFIXES.includes(a.type as (typeof PREVIEW_PREFIXES)[number])) continue
    if (a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted) continue
    out.push({ uid: a.uid, id: a.id, prefix: a.type, title: clip(a.title || a.description), revision: a.revision, createdAt: a.created.at })
  }
  for (const r of Object.values(doc.relationships)) {
    if (r.category !== 'stakeholder' || r.status === 'retired') continue
    const from = doc.artifacts[r.from]?.id ?? String(r.attributes?.fromText ?? '')
    const to = doc.artifacts[r.to]?.id ?? String(r.attributes?.toText ?? '')
    out.push({ uid: r.uid, id: r.id, prefix: 'REL', title: clip(`${from || '?'} ${r.type || '(type not chosen)'} ${to || '?'}`), revision: 0, createdAt: r.created.at })
  }
  const order = (p: string) => PREVIEW_PREFIXES.indexOf(p as (typeof PREVIEW_PREFIXES)[number])
  return out.sort((a, b) => order(a.prefix) - order(b.prefix) || a.id.localeCompare(b.id, undefined, { numeric: true }))
}

/** The packages a team may choose for an ID (the package names of the course working mapping). */
export { WEEK8_PACKAGES }

/** The Week 8 mapping records of the project (made by the lab tool: they carry `source`), each read field by field
 *  (mappingShape.ts), and a plain message for every record that could not be read (left out, never a crash). */
export function week8Mappings(doc: ProjectDoc): { list: ModelMapping[]; skipped: string[]; partial: string[] } {
  const list: ModelMapping[] = []
  /** records that are NOT shown (no usable ID, or the Week 1 item they were made for cannot be read) */
  const skipped: string[] = []
  /** records that ARE shown, with the parts that could not be read left out */
  const partial: string[] = []
  for (const raw of Object.values(doc.mappings ?? {}) as unknown[]) {
    const looksWeek8 = !!raw && typeof raw === 'object' && 'source' in raw
    const { mapping, problems } = cleanMapping(raw)
    if (mapping?.source) {
      list.push(mapping)
      partial.push(...problems)
    } else if (looksWeek8) skipped.push(mapping ? `${mapping.id}: the Week 1 item it was made for could not be read` : problems[0] ?? 'a mapping record could not be read')
  }
  return { list, skipped, partial }
}

/** A Week 8 mapping record of the project (made by the lab tool: it carries `source`). The latest one per item. */
export function week8MappingOf(doc: ProjectDoc, itemUid: string): ModelMapping | undefined {
  return week8Mappings(doc)
    .list.filter((m) => m.artifact === itemUid)
    .sort((a, b) => numOf(b.id) - numOf(a.id))[0]
}

/** The preview's reason for a team-confirmed mapping: the course working mapping when the team kept its package, or
 *  the team's own choice (with the course package and the team's reason) when it chose another one. */
export function mappedReason(m: ModelMapping, prefix: string): string {
  const rule = mappingOf(prefix)
  const pkg = m.pkg || rule?.pkg || '?'
  if (rule && pkg === rule.pkg && m.rule !== 'custom') return `Mapped by your team in the Week 8 lab tool (${m.id}): package ${pkg}, the course working mapping.`
  return `Mapped by your team in the Week 8 lab tool (${m.id}): package ${pkg}, chosen by your team instead of the course working mapping${rule ? ` (${rule.pkg})` : ''}${m.statusReason ? `. Reason: ${m.statusReason}` : ''}.`
}

/** mapped: confirmed and unchanged; changed: the item was edited since (newer revision); renamed: its ID or name differs
 *  from the one confirmed; removed: the item is retired or gone and the mapping is still standing; withdrawn: the team
 *  withdrew the mapping (kept as a record); not-mapped: no mapping yet. */
export type MappingState = 'not-mapped' | 'mapped' | 'changed' | 'renamed' | 'removed' | 'withdrawn'
export type MappingView = { entry?: Week1Entry; mapping?: ModelMapping; state: MappingState }
export type MappingDrift = { added: Week1Entry[]; removed: MappingView[]; renamed: MappingView[]; changed: MappingView[] }

/** Every Week 1 item with its Week 8 mapping (if any), plus every mapping whose item is gone; and what changed in the
 *  project since the team made its mappings. Pure; nothing is written and no mapping is ever dropped. */
export function mappingViews(doc: ProjectDoc): { rows: MappingView[]; drift: MappingDrift; skipped: string[]; partial: string[] } {
  const entries = week1Entries(doc)
  const live = new Set(entries.map((e) => e.uid))
  const rows: MappingView[] = []
  const { list: all, skipped, partial } = week8Mappings(doc)
  for (const entry of entries) {
    const mapping = week8MappingOf(doc, entry.uid)
    let state: MappingState = 'not-mapped'
    if (mapping && mapping.status === 'not-mapped') state = 'withdrawn'
    else if (mapping) state = mapping.source!.id !== entry.id || clip(mapping.source!.title) !== entry.title ? 'renamed' : entry.revision > mapping.sourceRevision ? 'changed' : 'mapped'
    rows.push({ entry, mapping, state })
  }
  const gone = new Map<string, ModelMapping>()
  for (const m of all) if (!live.has(m.artifact) && (!gone.has(m.artifact) || numOf(m.id) > numOf(gone.get(m.artifact)!.id))) gone.set(m.artifact, m)
  for (const m of [...gone.values()].sort((a, b) => numOf(a.id) - numOf(b.id))) rows.push({ mapping: m, state: m.status === 'not-mapped' ? 'withdrawn' : 'removed' })
  const first = all.map((m) => m.confirmedBy?.at ?? '').filter(Boolean).sort()[0]
  const drift: MappingDrift = {
    added: first ? rows.filter((r) => r.entry && !r.mapping && r.entry.createdAt > first).map((r) => r.entry!) : [],
    removed: rows.filter((r) => r.state === 'removed'),
    renamed: rows.filter((r) => r.state === 'renamed'),
    changed: rows.filter((r) => r.state === 'changed'),
  }
  return { rows, drift, skipped, partial }
}

export type MappingChoice = { pkg: string; reason: string }
/** The upsert-mapping operations for the team's confirmations. An item already mapped keeps its MAP uid and ID (never
 *  renumbered); a new one takes the next never-issued MAP number. Provenance: confirmedBy (who, when, which change),
 *  the item's ID, name and revision, and the project revision read. */
export function confirmMappingOps(doc: ProjectDoc, items: { entry: Week1Entry; choice: MappingChoice }[], stamp: Stamp): Operation[] {
  let n = Math.max(doc.issued.MAP ?? 0, ...Object.values(doc.mappings).map((m) => (typeof m?.id === 'string' ? numOf(m.id) : 0)))
  return items.map(({ entry, choice }): Operation => {
    const before = week8MappingOf(doc, entry.uid)
    const rule = mappingOf(entry.prefix)
    const pkg = choice.pkg || rule?.pkg || ''
    const custom = !rule || pkg !== rule.pkg
    const reason = choice.reason.trim()
    const mapping: ModelMapping = {
      uid: before?.uid ?? newUid(),
      id: before?.id ?? formatId('MAP', ++n),
      artifact: entry.uid,
      elements: before?.elements ?? [],
      rule: custom ? 'custom' : entry.prefix,
      status: 'mapped',
      statusReason: reason || (rule ? `Course working mapping: ${rule.construct} in package ${rule.pkg}.` : 'Mapped by the team.'),
      findings: before?.findings ?? [],
      confirmedBy: stamp,
      sourceRevision: entry.revision,
      week: rule?.modeledIn ?? 8,
      pkg,
      source: { id: entry.id, title: entry.title, projectRev: doc.rev },
    }
    return before ? { op: 'upsert-mapping', mapping, before } : { op: 'upsert-mapping', mapping }
  })
}

/** Withdraws a mapping whose item was removed (or that the team no longer wants): the record stays, with its ID, as
 *  "not mapped" and the reason; nothing is deleted. */
export function withdrawMappingOp(mapping: ModelMapping, reason: string, stamp: Stamp): Operation {
  return { op: 'upsert-mapping', mapping: { ...mapping, status: 'not-mapped', statusReason: reason.trim(), confirmedBy: stamp }, before: mapping }
}
