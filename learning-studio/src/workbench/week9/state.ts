// Week 9 lab tool state (pure): what the team imported (its Week 8 model text and the Phase I parts of its Week 1 and
// Week 2 model inputs), the team's modeling decisions for each requirement and need, the dispositions of the trace
// findings, the AI review log, and when each export was last made. Saved in the browser under 'w9.requirements' and
// normalized on load (never throws); shared between teammates as a workspace file (format "week9-requirements",
// version 1). Exports: team-NN-model-v02.sysml and team-NN-trace-matrix.md. The checks here are course acceptance
// checks; validity is decided by the course-designated checker, and a checker PASS does not show that a requirement is
// the right one or that a design meets it.
// Review status: new-pending-review.
import { AI_CATEGORIES, LAB9_MINIMUMS, OPS, QUANTITIES, W9_FINDING_CLASSES, W9_MAPPING } from '../../content/lectures/week09/labBrief'
import { saidSomething } from '../emptyAnswer'
import {
  EMPTY_CHOICE, dispositionProblem, findingKey, generateModel, needsDisposition, parseModel, traceGrid, traceRows,
  type Choice, type Generated, type NeedChoice, type W8Model, type W9Finding, type W9Need, type W9Objective, type W9Phase1, type W9Req,
} from './requirements'

export const W9_KEY = 'w9.requirements'
export const WORKSPACE_FORMAT = 'week9-requirements'
export const WORKSPACE_VERSION = 1

/** A need the team records as only partly covered by its derived stakeholder requirements: the missing part, the owner
 *  and the week it is planned for (carried from the Week 2 audit, which the Week 2 export does not contain). */
export type PartialItem = { missing: string; owner: string; week: string }
export type AiFinding = { id: string; requirement: string; category: string; quote: string; decision: '' | 'accept' | 'reject'; reason: string; change: string }
export type W1Part = Pick<W9Phase1, 'team' | 'enterprise' | 'objectives' | 'needs' | 'stakeholderNames' | 'threePersonTeam'> & { origin: string }
export type W2Part = { team: string; enterprise: string; requirements: W9Req[]; needsAdded: W9Need[]; dispositions: Record<string, string>; origin: string }
export type W9State = {
  w8: { text: string; origin: string } | null
  w1: W1Part | null
  w2: W2Part | null
  choices: Record<string, Choice>
  needChoices: Record<string, NeedChoice>
  /** Disposition per finding (findingKey). */
  dispositions: Record<string, string>
  ai: AiFinding[]
  /** The highest AI finding number ever issued (AIF-nnn are never reused). */
  aiIssued: number
  /** Why no requirement definition is shared, when none is (the lab minimum's alternative). */
  sharedReason: string
  /** Needs recorded as partly covered, by need ID. */
  partials: Record<string, PartialItem>
  /** The trace-audit note: assumption justifications and anything else the audit must say. */
  auditNote: string
  updatedAt?: number
  exportedSysmlAt?: number
  exportedMdAt?: number
}
export const EMPTY_STATE: W9State = { w8: null, w1: null, w2: null, choices: {}, needChoices: {}, dispositions: {}, ai: [], aiIssued: 0, sharedReason: '', partials: {}, auditNote: '' }

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const objs = (x: unknown): Record<string, unknown>[] => (Array.isArray(x) ? x.filter(isObj) : [])
const str = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x))
const strs = (x: unknown) => (Array.isArray(x) ? x.map(str).filter(Boolean) : [])
const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null)
const strMap = (x: unknown): Record<string, string> => (isObj(x) ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, str(v)])) : {})
const oneOf = <T extends string>(x: unknown, vals: readonly T[], dflt: T): T => (vals.includes(x as T) ? (x as T) : dflt)

const normObjective = (o: Record<string, unknown>): W9Objective => ({ id: str(o.id), name: str(o.name), text: str(o.text), level: oneOf(o.level, ['mission', 'goal', 'objective'] as const, 'objective'), ...(o.parent ? { parent: str(o.parent) } : {}) })
const normNeed = (n: Record<string, unknown>): W9Need => ({ id: str(n.id), name: str(n.name), statement: str(n.statement), condition: str(n.condition), rationale: str(n.rationale), priority: str(n.priority), stakeholders: strs(n.stakeholders), concerns: strs(n.concerns), objective: str(n.objective), origin: n.origin === 'Week 2' ? 'Week 2' : 'Week 1' })
const normReq = (r: Record<string, unknown>): W9Req => ({ id: str(r.id), level: r.level === 'stakeholder' ? 'stakeholder' : 'system', name: str(r.name), statement: str(r.statement), type: str(r.type), method: str(r.method), criterion: str(r.criterion), rationale: str(r.rationale), parents: strs(r.parents), tokens: strs(r.tokens), tbdOwner: str(r.tbdOwner), origin: str(r.origin) || 'Week 2' })
export function normalizeChoice(x: unknown): Choice {
  const c = isObj(x) ? x : {}
  const subject = str(c.subject)
  return {
    subject: (['', 'enterprise', 'soi', 'new'].includes(subject) || subject.startsWith('def:') ? subject : '') as Choice['subject'],
    newName: str(c.newName),
    newPkg: c.newPkg === 'Logical' ? 'Logical' : 'Physical',
    feature: str(c.feature),
    quantity: oneOf(c.quantity, ['', ...QUANTITIES.map((q) => q.id)] as const, ''),
    unit: str(c.unit),
    op: oneOf(c.op, OPS.map((o) => o.id), '<='),
    value: str(c.value),
    form: c.form === 'shared' ? 'shared' : 'direct',
    assume: str(c.assume),
    owner: str(c.owner),
  }
}

/** Fills missing fields of a stored or shared state. Never throws. */
export function normalizeState(v: unknown): W9State {
  const r = isObj(v) ? v : {}
  const w8 = isObj(r.w8) && typeof r.w8.text === 'string' ? { text: r.w8.text, origin: str(r.w8.origin) } : null
  const w1 = isObj(r.w1)
    ? { team: str(r.w1.team), enterprise: str(r.w1.enterprise), objectives: objs(r.w1.objectives).map(normObjective).filter((o) => o.id), needs: objs(r.w1.needs).map(normNeed).filter((n) => n.id), stakeholderNames: strMap(r.w1.stakeholderNames), threePersonTeam: r.w1.threePersonTeam === true, origin: str(r.w1.origin) }
    : null
  const w2 = isObj(r.w2) ? { team: str(r.w2.team), enterprise: str(r.w2.enterprise), requirements: objs(r.w2.requirements).map(normReq).filter((q) => q.id), needsAdded: objs(r.w2.needsAdded).map(normNeed).filter((n) => n.id), dispositions: strMap(r.w2.dispositions), origin: str(r.w2.origin) } : null
  const ai = objs(r.ai).map((a) => ({ id: str(a.id), requirement: str(a.requirement), category: str(a.category), quote: str(a.quote), decision: oneOf(a.decision, ['', 'accept', 'reject'] as const, ''), reason: str(a.reason), change: str(a.change) })).filter((a) => /^AIF-\d{3}$/.test(a.id))
  const issued = Math.max(num(r.aiIssued) ?? 0, ...ai.map((a) => Number(a.id.slice(4))))
  return {
    w8,
    w1,
    w2,
    choices: isObj(r.choices) ? Object.fromEntries(Object.entries(r.choices).map(([k, c]) => [k, normalizeChoice(c)])) : {},
    needChoices: isObj(r.needChoices) ? Object.fromEntries(Object.entries(r.needChoices).map(([k, c]) => [k, { stakeholders: str(isObj(c) ? c.stakeholders : ''), concerns: str(isObj(c) ? c.concerns : '') }])) : {},
    dispositions: strMap(r.dispositions),
    ai,
    aiIssued: issued,
    sharedReason: str(r.sharedReason),
    partials: isObj(r.partials) ? Object.fromEntries(Object.entries(r.partials).filter(([k]) => /^NEED-\d{3}$/.test(k)).map(([k, p]) => [k, { missing: str(isObj(p) ? p.missing : ''), owner: str(isObj(p) ? p.owner : ''), week: str(isObj(p) ? p.week : '') }])) : {},
    auditNote: str(r.auditNote),
    updatedAt: num(r.updatedAt) ?? undefined,
    exportedSysmlAt: num(r.exportedSysmlAt) ?? undefined,
    exportedMdAt: num(r.exportedMdAt) ?? undefined,
  }
}

/** The Phase I source the generator reads: the Week 1 part, the needs Week 2 added, and the Week 2 requirements. */
export function phase1Of(s: W9State): W9Phase1 | null {
  if (!s.w1 || !s.w2) return null
  const known = new Set(s.w1.needs.map((n) => n.id))
  return {
    team: s.w1.team,
    enterprise: s.w1.enterprise,
    objectives: s.w1.objectives,
    needs: [...s.w1.needs, ...s.w2.needsAdded.filter((n) => !known.has(n.id))],
    requirements: s.w2.requirements,
    stakeholderNames: s.w1.stakeholderNames,
    dispositions: s.w2.dispositions,
    threePersonTeam: s.w1.threePersonTeam,
  }
}

export type Derived = { w8: W8Model; p1: W9Phase1; model: Generated; findings: W9Finding[]; rows: ReturnType<typeof traceRows>; grid: ReturnType<typeof traceGrid> }
export function derive(s: W9State, date?: string): Derived | null {
  const p1 = phase1Of(s)
  if (!s.w8 || !p1) return null
  const w8 = parseModel(s.w8.text)
  if ('error' in w8) return null
  const model = generateModel(w8.model, p1, s.choices, s.needChoices, { date })
  return { w8: w8.model, p1, model, findings: model.findings, rows: traceRows(p1, model, s.needChoices, Object.keys(s.partials)), grid: traceGrid(p1, model) }
}

/** The disposition of a finding: the team's, or the one carried from the Week 2 record for a childless item. */
export const dispositionOf = (s: W9State, f: W9Finding): string => s.dispositions[findingKey(f)] ?? (f.cls === 'trace' ? (s.w2?.dispositions[f.id] ?? '') : '')

/** Normalized team names for the cross-file check ("07", "Team 7" and "team-07" are one team). */
const teamKey = (t: string) => t.toLowerCase().replace(/team|[^a-z0-9]/g, '').replace(/^0+/, '')
const nameKey = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '')
/** Why the three files do not belong to one team, or null. */
export function mismatch(s: W9State): string | null {
  if (s.w1 && s.w2 && s.w2.team && s.w1.team && teamKey(s.w1.team) !== teamKey(s.w2.team)) return `The Week 1 file is from team ${s.w1.team} and the Week 2 file from team ${s.w2.team}: import one team’s files.`
  if (s.w1 && s.w2 && s.w2.enterprise && nameKey(s.w1.enterprise) !== nameKey(s.w2.enterprise)) return `The Week 1 file is about “${s.w1.enterprise}” and the Week 2 file about “${s.w2.enterprise}”: import one team’s files.`
  if (s.w1 && s.w8) {
    const m = parseModel(s.w8.text)
    if (!('error' in m) && m.model.enterpriseName && nameKey(m.model.enterpriseName) !== nameKey(s.w1.enterprise)) return `The Week 8 model is of “${m.model.enterpriseName}” and the Week 1 file of “${s.w1.enterprise}”: import your own team’s model, or rename the enterprise consistently and export again.`
  }
  return null
}

/** Problem of one partly-covered record (shown to the student), or null when it is complete. */
export function partialProblem(p: PartialItem): string | null {
  if (!saidSomething(p.missing)) return 'Say which part of the need is not yet covered.'
  if (!saidSomething(p.owner)) return 'Name the owner of this open item (a role or initials).'
  if (!saidSomething(p.week)) return 'Give the week (or review) by which it is planned.'
  return null
}

export const words = (t: string) => t.split(/\s+/).filter(Boolean).length

/** Problem of one AI review entry (shown to the student), or null when it counts. */
export function aiProblem(a: AiFinding): string | null {
  if (!a.requirement.trim()) return 'Name the requirement (or need) the finding is about.'
  if (!AI_CATEGORIES.includes(a.category as (typeof AI_CATEGORIES)[number])) return 'Choose one of the four categories.'
  if (!saidSomething(a.quote)) return 'Quote the phrase the finding is about, so it can be checked against the text.'
  if (!a.decision) return 'Decide: accept or reject.'
  if (!saidSomething(a.reason)) return 'Give the reason for the decision (“none” or “n/a” is not a reason).'
  if (a.decision === 'accept' && !saidSomething(a.change)) return 'Say what you changed, and where (for example the requirement and the record).'
  return null
}

export type ReadinessItem = { id: string; label: string; ok: boolean; detail: string }
export function readiness(s: W9State): { ready: boolean; items: ReadinessItem[] } {
  const item = (id: string, label: string, ok: boolean, detail: string): ReadinessItem => ({ id, label, ok, detail })
  const files = [
    item('week8', 'Week 8 model imported', !!s.w8, s.w8 ? `Imported: ${s.w8.origin}.` : 'Import the model v0.1 file (.sysml) your team exported from the Week 8 lab tool.'),
    item('week1', 'Week 1 model inputs imported', !!s.w1, s.w1 ? `Imported: ${s.w1.origin}.` : 'Import your team’s Week 1 model-inputs file (.json).'),
    item('week2', 'Week 2 model inputs imported', !!s.w2, s.w2 ? `Imported: ${s.w2.origin}.` : 'Import your team’s Week 2 model-inputs file (.json).'),
  ]
  const mm = mismatch(s)
  files.push(item('match', 'The three files are one team’s', !mm && !!(s.w8 && s.w1 && s.w2), mm ?? (s.w8 && s.w1 && s.w2 ? 'Team and enterprise agree across the files.' : 'Import all three files.')))
  const d = derive(s)
  if (!d) return { ready: false, items: files }
  const f = d.findings
  const defects = f.filter((x) => x.cls === 'defect')
  const sysGaps = f.filter((x) => ['sys-no-subject', 'sys-enterprise-subject', 'subject-missing'].includes(x.code))
  const docOnly = f.filter((x) => x.code === 'sys-doc-only')
  const owners = f.filter((x) => x.code === 'tbd-owner')
  const toDispose = f.filter(needsDisposition)
  const badDisp = toDispose.filter((x) => dispositionProblem(dispositionOf(s, x)) !== null)
  const minAi = d.p1.threePersonTeam ? LAB9_MINIMUMS.aiFindingsThree : LAB9_MINIMUMS.aiFindings
  const aiOk = s.ai.filter((a) => aiProblem(a) === null).length
  const sharedOk = d.model.sharedDefs.some((x) => x.members.length >= LAB9_MINIMUMS.sharedUsages) || saidSomething(s.sharedReason)
  const partialsBad = Object.entries(s.partials).filter(([, p]) => partialProblem(p) !== null).map(([k]) => k)
  const assumed = d.p1.requirements.filter((q) => (s.choices[q.id]?.assume ?? '').trim()).map((q) => q.id)
  const noteOk = !assumed.length || saidSomething(s.auditNote)
  const exported = !!s.updatedAt && (s.exportedSysmlAt ?? 0) >= s.updatedAt && (s.exportedMdAt ?? 0) >= s.updatedAt
  const items = [
    ...files,
    item('defects', 'Nothing left out of the model', defects.length === 0, defects.length ? `${defects.length} item(s) left out because they would not resolve: ${[...new Set(defects.map((x) => x.id))].join(', ')}. Correct the file named in each finding and import it again.` : `${d.p1.needs.length} needs and ${d.p1.requirements.length} requirements in the model, with ${d.model.derivations.length} derivations.`),
    item('subjects', 'Every system requirement has an element as its subject', sysGaps.length === 0, sysGaps.length ? `Choose the subject of ${[...new Set(sysGaps.map((x) => x.id))].join(', ')} (an existing part definition, or a named placeholder).` : 'Every system requirement names the element its shall is about.'),
    item('constraints', 'Every system requirement has a required constraint or a recorded TBD', docOnly.length === 0, docOnly.length ? `Formalize ${docOnly.map((x) => x.id).join(', ')}: a measured feature, a comparison and a limit (or leave the limit empty when the statement carries a TBD).` : 'Every system requirement can be evaluated.'),
    item('owners', 'Every TBD or TBR has an owner', owners.length === 0, owners.length ? `Enter the owner for ${owners.map((x) => x.id).join(', ')}.` : 'Every open value has an owner.'),
    item('dispositions', 'Every trace finding and open gap has a valid disposition', badDisp.length === 0, badDisp.length ? `${badDisp.length} without a valid disposition: ${badDisp.slice(0, 6).map((x) => x.id).join(', ')}${badDisp.length > 6 ? ' …' : ''}.` : 'All findings dispositioned.'),
    item('partials', 'Every need marked partly covered names the missing part, an owner and a week', partialsBad.length === 0, partialsBad.length ? `Complete the open item of ${partialsBad.join(', ')}.` : Object.keys(s.partials).length ? `${Object.keys(s.partials).length} partly covered need(s) carried as open items.` : 'No need marked partly covered (mark any your Week 2 audit recorded as only partly covered).'),
    item('note', 'Every assumption is justified in the trace-audit note', noteOk, !assumed.length ? 'No assumptions written, so the note is optional.' : noteOk ? 'Trace-audit note written.' : `You wrote an assumption for ${assumed.join(', ')}. In the trace-audit note, justify each assumption in one sentence.`),
    item('shared', `A shared requirement definition used by at least ${LAB9_MINIMUMS.sharedUsages} requirements, or the reason none is shared`, sharedOk, sharedOk ? (d.model.sharedDefs.length ? `Shared: ${d.model.sharedDefs.map((x) => `${x.name} (${x.members.length})`).join(', ')}.` : 'Reason recorded.') : 'Mark two requirements of the same quantity and comparison “shared”, or write why none of your requirements share a form.'),
    item('ai', `AI review log: at least ${minAi} findings decided with a reason`, aiOk >= minAi, `${aiOk} of ${minAi} complete.`),
    item('exports', 'Both exports made after the last change', exported, exported ? 'The .sysml and .md files are current.' : 'Export the model (.sysml) and the trace matrix (.md) after your last change.'),
  ]
  return { ready: items.every((x) => x.ok), items }
}

/** "team-07" (or "team-NN" when no team number is known). */
export function fileStem(s: W9State): string {
  const t = (s.w1?.team || s.w2?.team || '').trim().replace(/[^A-Za-z0-9-]/g, '')
  return t ? `team-${/^\d$/.test(t) ? `0${t}` : t}` : 'team-NN'
}
export const sysmlFileName = (s: W9State) => `${fileStem(s)}-model-v02.sysml`
export const matrixFileName = (s: W9State) => `${fileStem(s)}-trace-matrix.md`
export const workspaceFileName = (s: W9State) => `${fileStem(s)}-week9-workspace.json`

const cell = (x: string) => x.replace(/\|/g, '\\|').replace(/\n/g, ' ')

/** team-NN-trace-matrix.md: the trace matrix, the requirements mapping table, the trace audit and the AI review log. */
export function matrixMarkdown(s: W9State, date = new Date().toISOString().slice(0, 10)): string {
  const d = derive(s, date)
  if (!d) return '# Week 9 trace matrix\n\nNot ready: import the Week 8 model and the Week 1 and Week 2 model inputs in the lab tool.\n'
  const L: string[] = []
  L.push(`# ${fileStem(s)}: needs-to-requirements trace matrix and trace audit (Week 9)`, '')
  L.push(`- Enterprise: ${d.p1.enterprise || '(no name)'}`, `- Model file: ${sysmlFileName(s)}`, `- Sources: ${[s.w8?.origin, s.w1?.origin, s.w2?.origin].filter(Boolean).join('; ')}`, `- Date: ${date}`, '')
  L.push('Course acceptance checks only. Validity is decided by the course-designated checker; a checker PASS does not show that a requirement is the right one, that its subject is the right element, or that any design meets it.', '')
  L.push('## Needs to requirements', '')
  L.push('| Need | Name | Stakeholders | Frames | Stakeholder requirements | System requirements | Coverage |', '|---|---|---|---|---|---|---|')
  for (const r of d.rows) L.push(`| ${r.need} | ${cell(r.name)} | ${r.stakeholders.join(', ') || '—'} | ${r.concerns.join(', ') || '—'} | ${r.stkReqs.join(', ') || '—'} | ${r.sysReqs.join(', ') || '—'} | ${r.status === 'covered' ? 'covered' : r.status === 'partial' ? 'partial' : 'no stakeholder requirement'} |`)
  L.push('', '### Grid (needs × stakeholder requirements; X = derivation in the model)', '')
  if (d.grid.cols.length) {
    L.push(`| Need | ${d.grid.cols.join(' | ')} |`, `|---|${d.grid.cols.map(() => ':-:').join('|')}|`)
    for (const r of d.grid.rows) L.push(`| ${r.need} | ${r.cells.map((c) => (c ? 'X' : '')).join(' | ')} |`)
  } else L.push('No stakeholder requirements.')
  L.push('', '## Requirements mapping table', '')
  L.push('| Requirement | Level | Subject | Constraint | Form | Parents in the model | Parents waiting for Week 10 | Status |', '|---|---|---|---|---|---|---|---|')
  for (const q of d.p1.requirements) {
    const fm = d.model.formal.get(q.id)
    const parents = d.model.derivations.filter((x) => x.derived === q.id).map((x) => x.original)
    const caps = d.model.pendingCaps.filter((x) => x.derived === q.id).map((x) => x.original)
    const shared = d.model.sharedDefs.find((x) => x.members.includes(q.id))
    const c = { ...EMPTY_CHOICE, ...(s.choices[q.id] ?? {}) }
    const subject = c.subject === 'new' ? `${c.newName || '(unnamed)'} (placeholder, ${c.newPkg})` : c.subject.startsWith('def:') ? c.subject.slice(4) : c.subject === 'soi' ? 'System of interest' : c.subject === 'enterprise' || (!c.subject && q.level === 'stakeholder') ? 'enterprise' : '(not chosen)'
    L.push(`| ${q.id} | ${q.level} | ${cell(subject)} | ${fm?.ok ? `${fm.feature} ${fm.op} ${fm.value ?? '(open value)'}` : 'none (doc only)'} | ${shared ? shared.name : 'direct'} | ${parents.join(', ') || '—'} | ${caps.join(', ') || '—'} | ${q.tokens.length ? q.tokens.join(', ') : '—'} |`)
  }
  L.push('', '## Trace audit: findings and dispositions', '')
  for (const c of W9_FINDING_CLASSES) {
    const fs = d.findings.filter((x) => x.cls === c.id)
    L.push(`### ${c.label} (${fs.length})`, '')
    if (!fs.length) L.push('None.', '')
    for (const x of fs) L.push(`- **${x.id}** ${x.text}${needsDisposition(x) ? ` Disposition: ${dispositionOf(s, x).trim() || '(none yet)'}` : ''}`)
    if (fs.length) L.push('')
  }
  L.push('### Partly covered needs (open items carried from the Week 2 audit)', '')
  const parts = Object.entries(s.partials).sort(([a], [b]) => a.localeCompare(b))
  if (!parts.length) L.push('None recorded.', '')
  else {
    L.push('| Need | Missing part | Owner | Week |', '|---|---|---|---|')
    for (const [k, p] of parts) L.push(`| ${k} | ${cell(p.missing) || '(not written yet)'} | ${cell(p.owner) || '(none yet)'} | ${cell(p.week) || '(none yet)'} |`)
    L.push('')
  }
  L.push('### Trace-audit note', '', s.auditNote.trim() || '(not written yet)', '')
  if (!d.model.sharedDefs.length) L.push(`Shared requirement definition: none. Reason: ${s.sharedReason.trim() || '(not written yet)'}`, '')
  L.push('## AI review log', '')
  if (!s.ai.length) L.push('No findings recorded yet.', '')
  else {
    L.push('| ID | Requirement | Category | Quoted phrase | Decision | Reason | Change |', '|---|---|---|---|---|---|---|')
    for (const a of s.ai) L.push(`| ${a.id} | ${cell(a.requirement)} | ${a.category} | ${cell(a.quote)} | ${a.decision || '—'} | ${cell(a.reason)} | ${cell(a.change)} |`)
    L.push('')
  }
  L.push('## The course mapping used (course convention)', '')
  L.push('| Artifact | From | Becomes | Where |', '|---|---|---|---|')
  for (const m of W9_MAPPING) L.push(`| ${cell(m.artifact)} | ${cell(m.from)} | ${cell(m.becomes)} | ${m.where} |`)
  L.push('')
  return L.join('\n')
}

// ---------------------------------------------------------------------------------------------- workspace share
export function workspaceJson(s: W9State): string {
  return JSON.stringify({ format: WORKSPACE_FORMAT, version: WORKSPACE_VERSION, state: s }, null, 2)
}
/** A teammate's workspace file. Clear messages; never throws. */
export function importWorkspace(text: string): W9State | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }
  if (!isObj(d) || d.format !== WORKSPACE_FORMAT) return { error: 'This is not a Week 9 workspace file (format “week9-requirements”). To start from your files, use the three imports above.' }
  if (d.version !== WORKSPACE_VERSION) return { error: `This Week 9 workspace file has version ${JSON.stringify(d.version)}; this tool reads version ${WORKSPACE_VERSION}.` }
  if (!isObj(d.state)) return { error: '“state” must be an object.' }
  const s = normalizeState(d.state)
  if (s.w8 && 'error' in parseModel(s.w8.text)) return { error: 'The model in this workspace cannot be read: ask your teammate to export the workspace again.' }
  return s
}
/** The next AI finding ID: never reused, even after a deletion or a workspace round trip. */
export const nextAiId = (s: W9State) => `AIF-${String(s.aiIssued + 1).padStart(3, '0')}`
