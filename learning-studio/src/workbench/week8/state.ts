// Week 8 lab tool state (pure): what the team imported (the Week 1 model inputs and, optionally, the Week 2 model inputs),
// the purpose statement, the counts and reasons for the kinds that come from the Week 7 package by hand, the
// dispositions of the audit findings, the reduced-scope options, and when each export was last made. Saved in the
// browser under 'w8.import' and normalized on load (never throws); shared between teammates as a workspace JSON file
// (format "week8-import", version 1). The mapping matrix and audit are exported as Markdown (team-NN-mapping-matrix.md),
// the model as SysML (team-NN-model-v01.sysml). The checks here are course acceptance checks; validity is decided by the
// course-designated checker, and a checker PASS does not show the model says what the register says.
// Review status: new-pending-review.
import { AUDIT_QUESTIONS, FINDING_CLASSES, LAB8_MINIMUMS, MAPPING_KINDS } from '../../content/lectures/week08/labBrief'
import { auditFindings, auditSummary, generateSysml, mappingMatrix, type Finding, type Generated, type ImportSource, type ManualRow, type MappingRow, type Week2Part } from './skeleton'
import type { ProjectRef } from '../../project/adapters/week8'

export const W8_KEY = 'w8.import'
export const WORKSPACE_FORMAT = 'week8-import'
export const WORKSPACE_VERSION = 1

export type W8State = {
  /** Where the Week 1 input comes from, chosen by the student (M7): a model-inputs file (the default, as before) or the
   *  team's My Project. */
  source: 'file' | 'project'
  /** Which project was read for `week1`, and when (only when `source` is 'project'). */
  projectRef: ProjectRef | null
  /** The source read from the Week 1 model inputs (full register). */
  week1: ImportSource | null
  week1Origin: string
  /** The Week 2 IDs (scenarios, capabilities, requirements, measures, assumptions and unknowns). */
  week2: Week2Part | null
  /** When only a Week 2 file was imported: its embedded Week 1 snapshot (stakeholder IDs and names only). */
  snapshot: ImportSource | null
  purpose: string
  manual: ManualRow[]
  /** Disposition per finding (findingKey). */
  dispositions: Record<string, string>
  /** The team's answers to the fidelity and gaps audit questions. */
  notes: Record<string, string>
  assessment: boolean
  relationships: 'all' | 'conflicts'
  /** A one-time explanation shown when the saved state had to be repaired on load (not saved back as such). */
  notice?: string
  updatedAt?: number
  exportedSysmlAt?: number
  exportedMdAt?: number
}

export const EMPTY_STATE: W8State = { source: 'file', projectRef: null, week1: null, week1Origin: '', week2: null, snapshot: null, purpose: '', manual: [], dispositions: {}, notes: {}, assessment: true, relationships: 'all' }

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const objs = (x: unknown): Record<string, unknown>[] => (Array.isArray(x) ? x.filter(isObj) : [])
const str = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x))
const strs = (x: unknown) => (Array.isArray(x) ? x.map(str).filter(Boolean) : [])
const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null)
const items = (x: unknown) => objs(x).map((o) => ({ id: str(o.id), name: str(o.name) })).filter((o) => o.id)
const strMap = (x: unknown): Record<string, string> => (isObj(x) ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, str(v)])) : {})

export function normalizeWeek2(x: unknown): Week2Part | null {
  if (!isObj(x)) return null
  return { scenarios: items(x.scenarios), capabilities: items(x.capabilities), requirements: items(x.requirements), moes: items(x.moes), mops: items(x.mops), uncertainties: items(x.uncertainties), needsAdded: items(x.needsAdded) }
}

/** A stored or shared import source, field by field; null when it is not one. */
export function normalizeSource(x: unknown): ImportSource | null {
  if (!isObj(x)) return null
  const e = isObj(x.enterprise) ? x.enterprise : {}
  return {
    team: str(x.team),
    origin: str(x.origin),
    enterprise: { id: str(e.id) || 'ENT-001', name: str(e.name), domain: str(e.domain), problem: str(e.problem), mission: str(e.mission) },
    soi: str(x.soi),
    inside: items(x.inside),
    context: objs(x.context).map((c) => ({ id: str(c.id), name: str(c.name), kind: str(c.kind), crosses: str(c.crosses), direction: str(c.direction) })).filter((c) => c.id),
    stakeholders: objs(x.stakeholders)
      .map((s) => ({ id: str(s.id), name: str(s.name), role: str(s.role), stage: str(s.stage), side: str(s.side), approving: typeof s.approving === 'boolean' ? s.approving : null, influence: num(s.influence), influenceReason: str(s.influenceReason) }))
      .filter((s) => s.id),
    concerns: objs(x.concerns).map((c) => ({ id: str(c.id), ...(c.name ? { name: str(c.name) } : {}), text: str(c.text), stakeholders: strs(c.stakeholders) })).filter((c) => c.id),
    relationships: objs(x.relationships).map((r) => ({ id: str(r.id), from: str(r.from), to: str(r.to), type: str(r.type), note: str(r.note) })).filter((r) => r.id),
    missionGoals: items(x.missionGoals),
    needs: objs(x.needs).map((n) => ({ id: str(n.id), name: str(n.name), concerns: strs(n.concerns), sources: strs(n.sources) })).filter((n) => n.id),
    charterPrefixes: strs(x.charterPrefixes),
    week2: null,
  }
}

/** Fills missing fields of a stored or shared state. Never throws. */
export function normalizeState(v: unknown): W8State {
  const r = isObj(v) ? v : {}
  const p = isObj(r.projectRef) ? r.projectRef : null
  const storage = p && (p.storage === 'http' || p.storage === 'indexeddb' || p.storage === 'memory') ? p.storage : 'indexeddb'
  const ref = p && str(p.uid) ? p : null
  // a project source without a readable project reference (damaged saved state) falls back to the file import, with
  // what came from the project cleared, so the radio, the summary and the source never disagree (M7 review M7-10)
  const lost = r.source === 'project' && !ref
  return {
    source: r.source === 'project' && ref ? 'project' : 'file',
    projectRef: ref ? { uid: str(ref.uid), title: str(ref.title), team: str(ref.team), rev: num(ref.rev) ?? 0, savedAt: str(ref.savedAt), readAt: str(ref.readAt), storage } : null,
    week1: lost ? null : normalizeSource(r.week1),
    week1Origin: lost ? '' : str(r.week1Origin),
    ...(lost ? { notice: 'The saved Week 8 work no longer says which project it was read from, so the tool is back on the file import. Choose My Project again to read it.' } : {}),
    week2: normalizeWeek2(r.week2),
    snapshot: normalizeSource(r.snapshot),
    purpose: str(r.purpose),
    manual: objs(r.manual).map((m) => ({ prefix: str(m.prefix), count: str(m.count), reason: str(m.reason) })).filter((m) => m.prefix),
    dispositions: strMap(r.dispositions),
    notes: strMap(r.notes),
    assessment: r.assessment !== false,
    relationships: r.relationships === 'conflicts' ? 'conflicts' : 'all',
    updatedAt: num(r.updatedAt) ?? undefined,
    exportedSysmlAt: num(r.exportedSysmlAt) ?? undefined,
    exportedMdAt: num(r.exportedMdAt) ?? undefined,
  }
}

/** The source the model is generated from: the Week 1 register (or, failing it, the Week 2 file's snapshot), with the
 *  Week 2 IDs added. Null before anything is imported. */
export function combinedSource(s: W8State): ImportSource | null {
  const base = s.week1 ?? s.snapshot
  if (!base) return null
  return { ...base, week2: s.week2, week2Origin: s.week2 ? 'the Week 2 model inputs' : '' }
}

export const findingKey = (f: Finding) => `${f.cls}:${f.code}:${f.id}`
/** Findings that need a disposition in the audit note (information about later weeks does not). */
export const needsDisposition = (f: Finding) => f.cls !== 'info'

export type Derived = { source: ImportSource; findings: Finding[]; matrix: MappingRow[]; model: Generated; summary: ReturnType<typeof auditSummary> }
export function derive(s: W8State, date?: string): Derived | null {
  const source = combinedSource(s)
  if (!source) return null
  const model = generateSysml(source, { purpose: s.purpose, assessment: s.assessment, relationships: s.relationships, date })
  return { source, findings: auditFindings(source), matrix: mappingMatrix(source, s.manual), model, summary: auditSummary(source, model) }
}

export const words = (t: string) => t.split(/\s+/).filter(Boolean).length

export type ReadinessItem = { id: string; label: string; ok: boolean; detail: string }
export function readiness(s: W8State): { ready: boolean; items: ReadinessItem[] } {
  const d = derive(s)
  const item = (id: string, label: string, ok: boolean, detail: string): ReadinessItem => ({ id, label, ok, detail })
  if (!d) return { ready: false, items: [item('week1', 'Week 1 model inputs imported', false, 'Import your team’s Week 1 model-inputs file.')] }
  const defects = d.findings.filter((f) => f.cls === 'defect')
  const undisposed = d.findings.filter((f) => needsDisposition(f) && !(s.dispositions[findingKey(f)] ?? '').trim())
  const missingCounts = d.matrix.filter((r) => r.status === 'not in the imported files')
  const reduced = s.relationships === 'conflicts'
  const relOk = d.summary.conflicts >= LAB8_MINIMUMS.conflicts && (reduced || d.summary.relationships >= LAB8_MINIMUMS.relationships)
  const exported = !!s.updatedAt && (s.exportedSysmlAt ?? 0) >= s.updatedAt && (s.exportedMdAt ?? 0) >= s.updatedAt
  const items = [
    item('week1', s.source === 'project' ? 'Week 1 work read from My Project' : 'Week 1 model inputs imported', !!s.week1, s.week1 ? `Imported from ${s.week1Origin || s.week1.origin}.` : 'Only a Week 2 file is imported: import the Week 1 model inputs to model the concerns, context and relationships.'),
    item('purpose', `Purpose statement (at least ${LAB8_MINIMUMS.purposeWords} words)`, words(s.purpose) >= LAB8_MINIMUMS.purposeWords, `${words(s.purpose)} words: who uses the model, and for which decisions.`),
    item('coverage', 'Register coverage: no defects', defects.length === 0, defects.length ? `${defects.length} item(s) left out: ${defects.map((f) => f.id).join(', ')}.` : `${d.summary.stakeholders.model} stakeholders, ${d.summary.concerns.model} concerns and ${d.summary.externals.model} external systems in the model.`),
    item('relationships', reduced ? 'At least one conflict relationship modeled (reduced scope)' : `At least ${LAB8_MINIMUMS.relationships} relationships, ${LAB8_MINIMUMS.conflicts} of them a conflict`, relOk, `${d.summary.relationships} modeled, ${d.summary.conflicts} conflict(s).`),
    item('dispositions', 'Every gap, unmapped kind and defect has a disposition', undisposed.length === 0, undisposed.length ? `${undisposed.length} finding(s) without a disposition.` : 'All findings dispositioned.'),
    item('counts', 'Every kind not in the imported files has a count from the Week 7 package', missingCounts.length === 0, missingCounts.length ? `Still to count: ${missingCounts.map((r) => r.prefix).join(', ')} (enter 0 if the package has none).` : 'Every kind counted.'),
    item('exports', 'Both exports made after the last change', exported, exported ? 'The .sysml and .md files are current.' : 'Export the model (.sysml) and the mapping matrix (.md) after your last change.'),
  ]
  return { ready: items.every((x) => x.ok), items }
}

/** "team-07" (or "team-NN" when the record has no team number). */
export function fileStem(s: W8State): string {
  const t = (s.week1?.team || s.snapshot?.team || '').trim().replace(/[^A-Za-z0-9-]/g, '')
  return t ? `team-${/^\d$/.test(t) ? `0${t}` : t}` : 'team-NN'
}
export const sysmlFileName = (s: W8State) => `${fileStem(s)}-model-v01.sysml`
export const matrixFileName = (s: W8State) => `${fileStem(s)}-mapping-matrix.md`
export const workspaceFileName = (s: W8State) => `${fileStem(s)}-week8-workspace.json`

const cell = (x: string) => x.replace(/\|/g, '\\|').replace(/\n/g, ' ')

/** The mechanical answer of an audit question (completeness and structure), or the team's note (fidelity, gaps). */
export function auditAnswer(id: string, d: Derived, notes: Record<string, string>): string {
  const s = d.summary
  if (id === 'completeness') return `${s.stakeholders.model} of ${s.stakeholders.record} stakeholders, ${s.concerns.model} of ${s.concerns.record} concerns and ${s.externals.model} of ${s.externals.record} external systems are in the model${d.model.excluded.length ? `; left out as defects: ${d.model.excluded.join(', ')}` : ''}.`
  if (id === 'structure') return `${s.concernsWithSubjectAndStakeholder} of ${s.concerns.record} concerns have the enterprise as subject and at least one stakeholder; ${s.stakeholdersWithConcern} of ${s.stakeholders.record} stakeholders hold a concern; ${s.relationships} relationships modeled, ${s.conflicts} conflict(s).`
  return (notes[id] ?? '').trim() || '(not written yet)'
}

/** team-NN-mapping-matrix.md: the mapping matrix and the import audit with dispositions. */
export function matrixMarkdown(s: W8State, date = new Date().toISOString().slice(0, 10)): string {
  const d = derive(s, date)
  const L: string[] = []
  if (!d) return '# Week 8 mapping matrix\n\nNothing imported yet: import the Week 1 model inputs in the lab tool.\n'
  const src = d.source
  L.push(`# ${fileStem(s)}: artifact-to-model mapping matrix and import audit (Week 8)`, '')
  L.push(`- Enterprise: ${src.enterprise.name || '(no name)'}`, `- Source: ${(s.source === 'project' && s.week1Origin) || src.origin}${src.week2 ? ' and the Week 2 model inputs' : ''}`, `- Model file: ${sysmlFileName(s)}`, `- Date: ${date}`, '')
  L.push('Course acceptance checks only. Validity is decided by the course-designated checker; a checker PASS does not show the model says what the register says.', '')
  L.push('## Mapping matrix', '')
  L.push('| Prefix | Artifact | Phase I week | Package | Construct | Modeled in | Count / IDs | Status | Team reason |', '|---|---|---|---|---|---|---|---|---|')
  for (const r of d.matrix) {
    const ids = r.ids.length ? `${r.count}: ${r.ids.join(', ')}` : r.manual?.count.trim() ? `${r.count} (from the Week 7 package)` : '—'
    L.push(`| ${r.prefix} | ${cell(r.artifact)} | ${r.phaseWeek} | ${cell(r.pkg)} | ${cell(r.construct)} | Week ${r.modeledIn} | ${cell(ids)} | ${r.status} | ${cell(r.manual?.reason ?? '')} |`)
  }
  L.push('', '## Import audit', '')
  for (const q of AUDIT_QUESTIONS) L.push(`### ${q.label}`, '', `*${q.question}*`, '', auditAnswer(q.id, d, s.notes), '')
  L.push('## Findings and dispositions', '')
  for (const c of FINDING_CLASSES) {
    const fs = d.findings.filter((f) => f.cls === c.id)
    L.push(`### ${c.label} (${fs.length})`, '')
    if (!fs.length) L.push('None.', '')
    for (const f of fs) L.push(`- **${f.id}** ${f.text}${needsDisposition(f) ? ` Disposition: ${(s.dispositions[findingKey(f)] ?? '').trim() || '(none yet)'}` : ''}`)
    if (fs.length) L.push('')
  }
  L.push(`Mapping kinds in the course convention: ${MAPPING_KINDS.length}.`, '')
  return L.join('\n')
}

// ---------------------------------------------------------------------------------------------- workspace share
export function workspaceJson(s: W8State): string {
  return JSON.stringify({ format: WORKSPACE_FORMAT, version: WORKSPACE_VERSION, state: s }, null, 2)
}
/** A teammate's workspace file. Clear messages; never throws. */
export function importWorkspace(text: string): W8State | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }
  if (!isObj(d) || d.format !== WORKSPACE_FORMAT) return { error: 'This is not a Week 8 workspace file (format “week8-import”). To start from your Phase I record, use the Week 1 import instead.' }
  if (d.version !== WORKSPACE_VERSION) return { error: `This Week 8 workspace file has version ${JSON.stringify(d.version)}; this tool reads version ${WORKSPACE_VERSION}.` }
  if (!isObj(d.state)) return { error: '“state” must be an object.' }
  return normalizeState(d.state)
}
