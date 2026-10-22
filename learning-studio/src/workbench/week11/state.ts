// Week 11 lab tool state (pure): what the team imported (its Week 10 model text and the parts of its Week 5 model inputs
// the generator reads), the team's modeling decisions (placeholder links, function placements, the crossings of each
// interface, new items, the functions of each interface requirement, requirement allocations to physical elements, the
// satisfy claims), the dispositions of the findings, the review checklist, the AI usage statement, the highest item number
// ever issued, and when each export was last made. Saved in the browser under 'w11.physical' and normalized on load
// (never throws); shared between teammates as a workspace file (format "week11-physical", version 1). Exports:
// team-NN-model-v04.sysml and team-NN-interface-review.md. The checks here are course acceptance checks; validity is
// decided by the course-designated checker, and a checker PASS does not show that connected ports match, that a flow runs
// the right way or that a satisfy claim is true.
// Review status: new-pending-review.
import { LAB11_MINIMUMS, REVIEW_CHECKS, W11_FINDING_CLASSES, W11_MAPPING } from '../../content/lectures/week11/labBrief'
import { saidSomething } from '../emptyAnswer'
import {
  EMPTY_CHOICES, allocationGrid, defaultFlows, dispositionProblem, findingKey, generateModel, needsDisposition, nextInfoId, parseModel,
  type FlowRow, type Generated, type NewItem, type SatisfyClaim, type W10Model, type W11Choices, type W11Finding, type W11Phys,
} from './physical'

export const W11_KEY = 'w11.physical'
export const WORKSPACE_FORMAT = 'week11-physical'
export const WORKSPACE_VERSION = 1

export type W5Part = W11Phys & { origin: string }
export type ReviewEntry = { result: '' | 'meets' | 'finding'; note: string }
export type W11State = {
  w10: { text: string; origin: string } | null
  w5: W5Part | null
  choices: W11Choices
  /** Disposition per finding (findingKey). */
  dispositions: Record<string, string>
  /** The review checklist: one entry per REVIEW_CHECKS id. */
  review: Record<string, ReviewEntry>
  aiStatement: string
  /** The highest INFO number ever issued in this tool (an ID removed here is never issued again). */
  issued: { INFO: number }
  updatedAt?: number
  exportedSysmlAt?: number
  exportedMdAt?: number
}
export const EMPTY_STATE: W11State = { w10: null, w5: null, choices: EMPTY_CHOICES, dispositions: {}, review: {}, aiStatement: '', issued: { INFO: 0 } }

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const objs = (x: unknown): Record<string, unknown>[] => (Array.isArray(x) ? x.filter(isObj) : [])
const str = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x))
const strs = (x: unknown) => (Array.isArray(x) ? x.map(str).filter(Boolean) : [])
const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null)
const int = (x: unknown) => Math.max(0, Math.floor(num(x) ?? 0))
const strMap = (x: unknown): Record<string, string> => (isObj(x) ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, str(v)])) : {})
const idNum = (id: string) => Number(id.replace(/^\D+/, '').split('-').pop()) || 0

function normPhys(r: Record<string, unknown>): W5Part {
  return {
    team: str(r.team),
    enterprise: str(r.enterprise),
    threePersonTeam: r.threePersonTeam === true,
    physical: objs(r.physical).map((p) => ({ id: str(p.id), name: str(p.name), text: str(p.text) })).filter((p) => p.id),
    components: objs(r.components).map((c) => ({ id: str(c.id), name: str(c.name), parent: str(c.parent), kind: str(c.kind), responsibility: str(c.responsibility), functions: strs(c.functions) })).filter((c) => c.id),
    externals: objs(r.externals).map((x) => ({ id: str(x.id), name: str(x.name), origin: str(x.origin) })).filter((x) => x.id),
    externalReasons: strMap(r.externalReasons),
    interfaces: objs(r.interfaces)
      .map((x) => ({ id: str(x.id), name: str(x.name), kind: str(x.kind), endA: str(x.endA), endB: str(x.endB), crosses: str(x.crosses), direction: str(x.direction), medium: str(x.medium), constraint: str(x.constraint), requirements: strs(x.requirements), protection: str(x.protection), degraded: str(x.degraded), standard: str(x.standard) }))
      .filter((x) => x.id),
    requirements: objs(r.requirements).map((q) => ({ id: str(q.id), name: str(q.name), statement: str(q.statement), interface: str(q.interface), criterion: str(q.criterion), method: str(q.method), parents: strs(q.parents), rationale: str(q.rationale) })).filter((q) => q.id),
    functions: objs(r.functions).map((f) => ({ id: str(f.id), name: str(f.name), phy: str(f.phy), log: str(f.log) })).filter((f) => f.id),
    information: objs(r.information).map((x) => ({ id: str(x.id), name: str(x.name), producers: strs(x.producers), consumers: strs(x.consumers) })).filter((x) => x.id),
    ai: objs(r.ai).map((a) => ({ id: str(a.id), name: str(a.name), host: str(a.host) })).filter((a) => a.id),
    origin: str(r.origin),
  }
}
const KINDS = ['information', 'energy', 'material', 'load'] as const
export function normalizeChoices(x: unknown): W11Choices {
  const c = isObj(x) ? x : {}
  const flows: Record<string, FlowRow[]> = isObj(c.flows)
    ? Object.fromEntries(Object.entries(c.flows).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, objs(v).map((r) => ({ item: str(r.item), dir: r.dir === 'BtoA' ? ('BtoA' as const) : ('AtoB' as const) }))]))
    : {}
  return {
    placeholders: strMap(c.placeholders),
    fnPhy: strMap(c.fnPhy),
    flows,
    newItems: objs(c.newItems).map((i) => ({ id: /^INFO-\d{3}$/.test(str(i.id)) ? str(i.id) : '', name: str(i.name), kind: (KINDS as readonly string[]).includes(str(i.kind)) ? (str(i.kind) as NewItem['kind']) : 'information' })),
    reqFns: strMap(c.reqFns),
    // rows with a stable row number; a stored record of the earlier form (requirement → IDs) becomes rows in order
    reqParts: (Array.isArray(c.reqParts) ? objs(c.reqParts).map((r) => ({ req: str(r.req), els: str(r.els) })) : Object.entries(strMap(c.reqParts)).map(([req, els]) => ({ req, els }))).map((r, i) => ({ row: i + 1, ...r })),
    satisfy: objs(c.satisfy).map((s): SatisfyClaim => ({ req: str(s.req), by: str(s.by), attribute: str(s.attribute), value: str(s.value), basis: str(s.basis) })),
  }
}

/** Fills missing fields of a stored or shared state. Never throws. */
export function normalizeState(v: unknown): W11State {
  const r = isObj(v) ? v : {}
  const w10 = isObj(r.w10) && typeof r.w10.text === 'string' ? { text: r.w10.text, origin: str(r.w10.origin) } : null
  const choices = normalizeChoices(r.choices)
  const iss = isObj(r.issued) ? r.issued : {}
  const review = isObj(r.review)
    ? Object.fromEntries(
        Object.entries(r.review)
          .filter(([k]) => REVIEW_CHECKS.some((c) => c.id === k))
          .map(([k, e]) => {
            const o = isObj(e) ? e : {}
            const res = o.result === 'meets' || o.result === 'finding' ? o.result : ''
            return [k, { result: res, note: str(o.note) } as ReviewEntry]
          }),
      )
    : {}
  return {
    w10,
    w5: isObj(r.w5) ? normPhys(r.w5) : null,
    choices,
    dispositions: strMap(r.dispositions),
    review,
    aiStatement: str(r.aiStatement),
    issued: { INFO: Math.max(int(iss.INFO), ...choices.newItems.filter((i) => i.id).map((i) => idNum(i.id))) },
    updatedAt: num(r.updatedAt) ?? undefined,
    exportedSysmlAt: num(r.exportedSysmlAt) ?? undefined,
    exportedMdAt: num(r.exportedMdAt) ?? undefined,
  }
}

const modelOf = (s: W11State): W10Model | null => {
  if (!s.w10) return null
  const m = parseModel(s.w10.text)
  return 'error' in m ? null : m.model
}

export type Derived = { w10: W10Model; phys: W11Phys; model: Generated; findings: W11Finding[] }
export function derive(s: W11State, date?: string): Derived | null {
  if (!s.w5) return null
  const w10 = modelOf(s)
  if (!w10) return null
  const model = generateModel(w10, s.w5, s.choices, { date })
  return { w10, phys: s.w5, model, findings: model.findings }
}

/** The crossings of an interface as the tool will write them: the team's rows once set, else the computed ones. */
export function flowsOf(s: W11State, ifId: string): { rows: FlowRow[]; assumed: boolean; set: boolean } {
  const x = s.w5?.interfaces.find((y) => y.id === ifId)
  if (!x) return { rows: [], assumed: false, set: false }
  const set = s.choices.flows[ifId]
  if (set) return { rows: set, assumed: false, set: true }
  return { ...defaultFlows(x, s.w5!), set: false }
}

// ---------------------------------------------------------------------------------------------- new IDs
/** The next information-item ID: after the highest the Week 5 file, the model and this tool have used. */
export const nextItemId = (s: W11State) => nextInfoId(s.w5, modelOf(s), s.issued.INFO, s.choices.newItems.filter((i) => i.id).map((i) => i.id))
/** Adds an item; an information item takes the next INFO ID (issued for good), energy and material items are named. */
export function withNewItem(s: W11State, kind: NewItem['kind']): W11State {
  if (kind !== 'information') return { ...s, choices: { ...s.choices, newItems: [...s.choices.newItems, { id: '', name: '', kind }] } }
  const id = nextItemId(s)
  return { ...s, choices: { ...s.choices, newItems: [...s.choices.newItems, { id, name: '', kind }] }, issued: { INFO: idNum(id) } }
}

// ---------------------------------------------------------------------------------------------- checks
export const dispositionOf = (s: W11State, f: W11Finding): string => s.dispositions[findingKey(f)] ?? ''

const nameKey = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '')
/** Why the two files do not belong to one team, or null. */
export function mismatch(s: W11State): string | null {
  const m = modelOf(s)
  const ent = s.w5?.enterprise ?? ''
  if (m && m.enterpriseName && ent && nameKey(m.enterpriseName) !== nameKey(ent)) return `The Week 10 model is of “${m.enterpriseName}” and the Week 5 file of “${ent}”: import your own team’s files, or rename the enterprise consistently and export again.`
  return null
}

/** Problem of one review checklist entry (shown to the student), or null when it is complete. */
export function reviewProblem(e: ReviewEntry | undefined): string | null {
  if (!e || !e.result) return 'Record whether the model meets this, or what the finding is.'
  if (!saidSomething(e.note)) return e.result === 'meets' ? 'Say in a few words how you checked it (“none” or “n/a” is not a check).' : 'Describe the finding and what the team will do about it (“none” or “n/a” is not a finding).'
  return null
}
export function aiStatementProblem(t: string): string | null {
  return saidSomething(t) ? null : 'Write the AI usage statement: the tool, what it suggested, what you kept or rejected and why. If no AI tool was used, say so in a sentence.'
}

export type ReadinessItem = { id: string; label: string; ok: boolean; detail: string }
export function readiness(s: W11State): { ready: boolean; items: ReadinessItem[] } {
  const item = (id: string, label: string, ok: boolean, detail: string): ReadinessItem => ({ id, label, ok, detail })
  const files = [
    item('week10', 'Week 10 model imported', !!s.w10, s.w10 ? `Imported: ${s.w10.origin}.` : 'Import the model v0.3 file (.sysml) your team exported from the Week 10 lab tool.'),
    item('week5', 'Week 5 model inputs imported', !!s.w5, s.w5 ? `Imported: ${s.w5.origin}.` : 'Import your team’s Week 5 model-inputs file (.json).'),
  ]
  const mm = mismatch(s)
  files.push(item('match', 'The two files are one team’s', !mm && !!(s.w10 && s.w5), mm ?? (s.w10 && s.w5 ? 'The enterprise agrees across the files.' : 'Import both files.')))
  const d = derive(s)
  if (!d) return { ready: false, items: files }
  const f = d.findings
  const code = (c: string) => f.filter((x) => x.code === c)
  const valid = (x: W11Finding) => dispositionProblem(dispositionOf(s, x)) === null
  const defects = f.filter((x) => x.cls === 'defect')
  const g = d.model
  const assumed = code('flow-direction-assumed')
  const reqAssumed = code('req-fn-assumed')
  const withFlow = g.interfaces.filter((x) => x.flows.length).length
  const satGaps = f.filter((x) => ['satisfy-nonconforming', 'satisfy-no-basis', 'satisfy-attr-missing', 'satisfy-value-unreadable', 'satisfy-value-conflict', 'satisfy-minimum'].includes(x.code))
  const min = d.phys.threePersonTeam ? LAB11_MINIMUMS.satisfyThree : LAB11_MINIMUMS.satisfy
  const toDispose = f.filter(needsDisposition)
  const badDisp = toDispose.filter((x) => !valid(x))
  const reviewBad = REVIEW_CHECKS.filter((c) => reviewProblem(s.review[c.id]) !== null)
  const exported = !!s.updatedAt && (s.exportedSysmlAt ?? 0) >= s.updatedAt && (s.exportedMdAt ?? 0) >= s.updatedAt
  const items = [
    ...files,
    item('defects', 'Nothing left out of the model', defects.length === 0, defects.length ? `${defects.length} item(s) left out because they would not resolve or their ID names another element: ${[...new Set(defects.map((x) => x.id))].slice(0, 8).join(', ')}. Correct the choice or the file named in each finding.` : `${g.parts.length} physical elements, ${g.interfaces.length} interfaces and ${g.allocations.length} logical-to-physical allocations in the model.`),
    item('directions', 'Every crossing has a direction the team confirmed', assumed.length === 0, assumed.length ? `Confirm the crossings of ${assumed.map((x) => x.id).join(', ')}: the tool had to assume end A to end B.` : 'Every crossing’s direction is read from the record or set by the team.'),
    item('flows', `At least ${LAB11_MINIMUMS.interfacesWithFlow} interface carries an item flow`, withFlow >= LAB11_MINIMUMS.interfacesWithFlow, `${withFlow} of ${g.interfaces.filter((x) => x.kind !== 'organizational').length} physical or information interfaces carry at least one item.`),
    item('reqfns', 'Every interface requirement is allocated to functions the team confirmed', reqAssumed.length === 0, reqAssumed.length ? `Confirm the functions of ${reqAssumed.map((x) => x.id).join(', ')}.` : 'Every interface requirement’s functions are the team’s choice.'),
    item('satisfy', `At least ${min} satisfy claim${min > 1 ? 's' : ''}, each conforming and with its basis`, satGaps.length === 0, satGaps.length ? satGaps.map((x) => x.text).slice(0, 2).join(' ') : `${g.satisfied.length} satisfy claim(s).`),
    item('dispositions', 'Every finding that needs one has a valid disposition', badDisp.length === 0, badDisp.length ? `${badDisp.length} without a valid disposition: ${badDisp.slice(0, 6).map((x) => x.id).join(', ')}${badDisp.length > 6 ? ' …' : ''}.` : 'All findings dispositioned.'),
    item('review', 'The review checklist is complete', reviewBad.length === 0, reviewBad.length ? `${REVIEW_CHECKS.length - reviewBad.length} of ${REVIEW_CHECKS.length} checks recorded with a note.` : `${REVIEW_CHECKS.length} of ${REVIEW_CHECKS.length} checks recorded.`),
    item('ai', 'AI usage statement written', aiStatementProblem(s.aiStatement) === null, aiStatementProblem(s.aiStatement) ?? 'Statement written.'),
    item('exports', 'Both exports made after the last change', exported, exported ? 'The .sysml and .md files are current.' : 'Export the model (.sysml) and the interface review (.md) after your last change.'),
  ]
  return { ready: items.every((x) => x.ok), items }
}

/** "team-07" (or "team-NN" when no team number is known). */
export function fileStem(s: W11State): string {
  const t = (s.w5?.team ?? '').trim().replace(/[^A-Za-z0-9-]/g, '')
  return t ? `team-${/^\d$/.test(t) ? `0${t}` : t}` : 'team-NN'
}
export const sysmlFileName = (s: W11State) => `${fileStem(s)}-model-v04.sysml`
export const reviewFileName = (s: W11State) => `${fileStem(s)}-interface-review.md`
export const workspaceFileName = (s: W11State) => `${fileStem(s)}-week11-workspace.json`

const cell = (x: string) => x.replace(/\|/g, '\\|').replace(/\n/g, ' ')

/** team-NN-interface-review.md: the parts table, the allocation matrix, the interface table, the interface requirements,
 *  the requirement allocations, the satisfy claims, the audit, the review checklist and the AI usage statement. */
export function reviewMarkdown(s: W11State, date = new Date().toISOString().slice(0, 10)): string {
  const d = derive(s, date)
  if (!d) return '# Week 11 interface review\n\nNot ready: import the Week 10 model and the Week 5 model inputs in the lab tool.\n'
  const g = d.model
  const L: string[] = []
  L.push(`# ${fileStem(s)}: physical architecture and interface review (Week 11)`, '')
  L.push(`- Enterprise: ${d.w10.enterpriseName || d.phys.enterprise || '(no name)'}`, `- Model file: ${sysmlFileName(s)}`, `- Sources: ${[s.w10?.origin, s.w5?.origin].filter(Boolean).join('; ')}`, `- Date: ${date}`, '')
  L.push('Course acceptance checks only. Validity is decided by the course-designated checker; a checker PASS does not show that connected ports match, that a flow runs the right way, or that a satisfy claim is true.', '')
  L.push('## Physical elements', '')
  L.push('| Element | Part usage | Definition | Components | Performs |', '|---|---|---|---|---|')
  for (const p of g.parts) L.push(`| ${p.id} | ${p.usage} | ${cell(p.def)}${p.specializes.length ? ` (specializes ${cell(p.specializes.join(', '))})` : ''} | ${p.components.map((c) => c.id).join(', ') || '—'} | ${p.performs.join(', ') || '—'} |`)
  L.push('', '## Allocation matrix (logical elements × physical elements; X = allocate in the model)', '')
  const grid = allocationGrid(g)
  if (grid.cols.length) {
    L.push(`| Logical element | ${grid.cols.join(' | ')} |`, `|---|${grid.cols.map(() => ':-:').join('|')}|`)
    for (const r of grid.rows) L.push(`| ${r.log} | ${r.cells.map((c) => (c ? 'X' : '')).join(' | ')} |`)
    L.push('', 'Nested allocations (function by function):', '')
    for (const a of g.allocations) L.push(`- ${a.log} → ${a.phy}: ${a.fns.join(', ')}`)
  } else L.push('No logical element is allocated to a physical element.')
  L.push('', '## Interfaces', '')
  L.push('| Interface | Kind | Construct | End A | End B | Crossings | Requirements named in Week 5 |', '|---|---|---|---|---|---|---|')
  for (const x of g.interfaces) L.push(`| ${x.id} ${cell(x.name)} | ${x.kind} | ${x.kind === 'organizational' ? 'connection' : `interface ${cell(x.def)}`} | ${x.pathA} | ${x.pathB} | ${cell(x.flows.map((f) => `${f.item}: ${f.from} → ${f.to}`).join('; ')) || '—'} | ${x.requirements.join(', ') || '—'} |`)
  L.push('', '## Requirement allocations written this week', '')
  if (!g.reqAllocations.length) L.push('None.', '')
  else {
    L.push('| Requirement | Allocated to | Written this week |', '|---|---|---|')
    for (const r of [...new Set(g.reqAllocations.map((a) => a.req))]) L.push(`| ${r} | ${g.reqAllocations.filter((a) => a.req === r).map((a) => a.to).join(', ')} | ${g.addedReqs.includes(r) ? 'requirement added from Week 5' : 'already in model v0.3'} |`)
    L.push('')
  }
  L.push('## Satisfy claims', '')
  if (!g.satisfied.length) L.push('None.', '')
  else {
    L.push('| Requirement | Satisfied by | Design value | Basis |', '|---|---|---|---|')
    for (const c of g.satisfied) L.push(`| ${c.req} | ${c.by} | ${c.attribute ? `${c.attribute} = ${cell(c.value)}` : '—'} | ${cell(s.choices.satisfy.find((x) => x.req.trim().toUpperCase() === c.req && x.by.trim().toUpperCase() === c.by)?.basis ?? '')} |`)
    L.push('')
  }
  L.push('## Audit: findings and dispositions', '')
  for (const c of W11_FINDING_CLASSES) {
    const fs = d.findings.filter((x) => x.cls === c.id)
    L.push(`### ${c.label} (${fs.length})`, '')
    if (!fs.length) L.push('None.', '')
    for (const x of fs) L.push(`- **${x.id}** ${x.text}${needsDisposition(x) ? ` Disposition: ${dispositionOf(s, x).trim() || '(none yet)'}` : ''}`)
    if (fs.length) L.push('')
  }
  L.push('## Review checklist', '')
  L.push('| Check | Result | Note |', '|---|---|---|')
  for (const c of REVIEW_CHECKS) {
    const e = s.review[c.id]
    L.push(`| ${cell(c.text)} | ${e?.result || '(not recorded)'} | ${cell(e?.note ?? '') || '—'} |`)
  }
  L.push('', '## AI usage statement', '', s.aiStatement.trim() || '(not written yet)', '')
  L.push('## The course mapping used (course convention)', '')
  L.push('| Artifact | From | Becomes | Where |', '|---|---|---|---|')
  for (const m of W11_MAPPING) L.push(`| ${cell(m.artifact)} | ${cell(m.from)} | ${cell(m.becomes)} | ${m.where} |`)
  L.push('')
  return L.join('\n')
}

// ---------------------------------------------------------------------------------------------- workspace share
export function workspaceJson(s: W11State): string {
  return JSON.stringify({ format: WORKSPACE_FORMAT, version: WORKSPACE_VERSION, state: s }, null, 2)
}
/** A teammate's workspace file. Clear messages; never throws. */
export function importWorkspace(text: string): W11State | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }
  if (!isObj(d) || d.format !== WORKSPACE_FORMAT) return { error: 'This is not a Week 11 workspace file (format “week11-physical”). To start from your files, use the two imports above.' }
  if (d.version !== WORKSPACE_VERSION) return { error: `This Week 11 workspace file has version ${JSON.stringify(d.version)}; this tool reads version ${WORKSPACE_VERSION}.` }
  if (!isObj(d.state)) return { error: '“state” must be an object.' }
  const s = normalizeState(d.state)
  if (s.w10 && 'error' in parseModel(s.w10.text)) return { error: 'The model in this workspace cannot be read: ask your teammate to export the workspace again.' }
  return s
}
