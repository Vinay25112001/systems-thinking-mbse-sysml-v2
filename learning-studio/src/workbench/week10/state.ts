// Week 10 lab tool state (pure): what the team imported (its Week 9 model text and the parts of its Week 4 and Week 2
// model inputs the generator reads), the team's modeling decisions (function items and performers, new functions and
// items, placeholder links, the scenario mapping, the actor types, the operating states), the dispositions of the
// behavior findings, the review checklist, the AI usage statement, the highest function and item numbers ever issued,
// and when each export was last made. Saved in the browser under 'w10.behavior' and normalized on load (never throws);
// shared between teammates as a workspace file (format "week10-behavior", version 1). Exports: team-NN-model-v03.sysml
// and team-NN-behavior-review.md. The checks here are course acceptance checks; validity is decided by the
// course-designated checker, and a checker PASS does not show that a flow follows the ConOps or that a state
// definition is complete.
// Review status: new-pending-review.
import { LAB10_MINIMUMS, REVIEW_CHECKS, W10_FINDING_CLASSES, W10_MAPPING } from '../../content/lectures/week10/labBrief'
import { saidSomething } from '../emptyAnswer'
import {
  EMPTY_CHOICES, EMPTY_MACHINE, allocationGrid, crossCheck, dispositionProblem, findingKey, generateModel, needsDisposition, nextId, parseModel,
  type Generated, type Machine, type NewItem, type W10Arch, type W10Choices, type W10Finding, type W10Ops, type W9Model,
} from './behavior'

export const W10_KEY = 'w10.behavior'
export const WORKSPACE_FORMAT = 'week10-behavior'
export const WORKSPACE_VERSION = 1

export type W4Part = W10Arch & { origin: string }
export type W2Part = W10Ops & { origin: string }
export type ReviewEntry = { result: '' | 'meets' | 'finding'; note: string }
export type W10State = {
  w9: { text: string; origin: string } | null
  w4: W4Part | null
  w2: W2Part | null
  choices: W10Choices
  /** Disposition per finding (findingKey). */
  dispositions: Record<string, string>
  /** The review checklist: one entry per REVIEW_CHECKS id. */
  review: Record<string, ReviewEntry>
  aiStatement: string
  /** The highest FN and INFO numbers ever issued in this tool (an ID removed here is never issued again). */
  issued: { FN: number; INFO: number }
  updatedAt?: number
  exportedSysmlAt?: number
  exportedMdAt?: number
}
export const EMPTY_STATE: W10State = { w9: null, w4: null, w2: null, choices: EMPTY_CHOICES, dispositions: {}, review: {}, aiStatement: '', issued: { FN: 0, INFO: 0 } }

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x)
const objs = (x: unknown): Record<string, unknown>[] => (Array.isArray(x) ? x.filter(isObj) : [])
const str = (x: unknown) => (typeof x === 'string' ? x : x === undefined || x === null ? '' : String(x))
const strs = (x: unknown) => (Array.isArray(x) ? x.map(str).filter(Boolean) : [])
const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null)
const int = (x: unknown) => Math.max(0, Math.floor(num(x) ?? 0))
const strMap = (x: unknown): Record<string, string> => (isObj(x) ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, str(v)])) : {})
const idNum = (id: string) => Number(id.replace(/^\D+/, '').split('-').pop()) || 0

function normArch(r: Record<string, unknown>): W4Part {
  return {
    team: str(r.team),
    enterprise: str(r.enterprise),
    functions: objs(r.functions).map((f) => ({ id: str(f.id), name: str(f.name), text: str(f.text), inputs: strs(f.inputs), outputs: strs(f.outputs), capabilities: strs(f.capabilities), scenarios: strs(f.scenarios), requirements: strs(f.requirements), log: str(f.log), planning: str(f.planning) })).filter((f) => f.id),
    logical: objs(r.logical).map((l) => ({ id: str(l.id), name: str(l.name), text: str(l.text) })).filter((l) => l.id),
    information: objs(r.information).map((x) => ({ id: str(x.id), name: str(x.name), content: str(x.content), producers: strs(x.producers), consumers: strs(x.consumers), decisionRefs: strs(x.decisionRefs) })).filter((x) => x.id),
    issuedFn: int(r.issuedFn),
    issuedInfo: int(r.issuedInfo),
    threePersonTeam: r.threePersonTeam === true,
    origin: str(r.origin),
  }
}
function normOps(r: Record<string, unknown>): W2Part {
  return {
    team: str(r.team),
    enterprise: str(r.enterprise),
    scenarios: objs(r.scenarios)
      .map((s) => ({
        id: str(s.id),
        name: str(s.name),
        kind: str(s.kind),
        summary: str(s.summary),
        actors: objs(s.actors).map((a) => ({ id: str(a.id), name: str(a.name) })),
        trigger: str(s.trigger),
        preconditions: str(s.preconditions),
        steps: objs(s.steps).map((x, i) => ({ n: int(x.n) || i + 1, actor: str(x.actor), text: str(x.text) })),
        alternates: objs(s.alternates).map((a) => ({ id: str(a.id), fromStep: int(a.fromStep), condition: str(a.condition), response: str(a.response), outcome: isObj(a.outcome) && int(a.outcome.rejoin) > 0 ? { rejoin: int(a.outcome.rejoin) } : ('ends' as const) })),
        success: str(s.success),
        failure: str(s.failure),
      }))
      .filter((s) => s.id),
    capabilities: objs(r.capabilities).map((c) => ({ id: str(c.id), name: str(c.name), statement: str(c.statement) })).filter((c) => c.id),
    requirements: objs(r.requirements).map((q) => ({ id: str(q.id), parents: strs(q.parents) })).filter((q) => q.id),
    origin: str(r.origin),
  }
}
const KINDS = ['information', 'energy', 'material'] as const
function normMachine(x: unknown): Machine {
  const m = isObj(x) ? x : {}
  return {
    ...EMPTY_MACHINE,
    name: str(m.name),
    usage: str(m.usage),
    doc: str(m.doc),
    exhibitor: str(m.exhibitor),
    initial: str(m.initial),
    states: objs(m.states).map((s) => ({ name: str(s.name), entry: str(s.entry), do: str(s.do), doc: str(s.doc) })),
    transitions: objs(m.transitions).map((t) => ({ from: str(t.from), trigger: str(t.trigger), guard: str(t.guard), to: str(t.to) })),
  }
}
export function normalizeChoices(x: unknown): W10Choices {
  const c = isObj(x) ? x : {}
  const rec = <T>(v: unknown, f: (o: Record<string, unknown>) => T): Record<string, T> => (isObj(v) ? Object.fromEntries(Object.entries(v).map(([k, o]) => [k, f(isObj(o) ? o : {})])) : {})
  return {
    fn: rec(c.fn, (o) => ({ inputs: str(o.inputs), outputs: str(o.outputs), performer: str(o.performer) })),
    newFns: objs(c.newFns).map((f) => ({ id: str(f.id), name: str(f.name), text: str(f.text), performer: str(f.performer), capability: str(f.capability) })).filter((f) => /^FN-\d{3}$/.test(f.id)),
    newItems: objs(c.newItems).map((i) => ({ id: /^INFO-\d{3}$/.test(str(i.id)) ? str(i.id) : '', name: str(i.name), kind: (KINDS as readonly string[]).includes(str(i.kind)) ? (str(i.kind) as NewItem['kind']) : 'information' })),
    placeholders: strMap(c.placeholders),
    scenario: str(c.scenario),
    steps: rec(c.steps, (o) => ({ name: str(o.name), fn: str(o.fn) })),
    alts: rec(c.alts, (o) => ({ name: str(o.name), guard: str(o.guard), ...(o.at === 'before' ? { at: 'before' as const } : {}) })),
    actors: strMap(c.actors),
    machine: normMachine(c.machine),
  }
}

/** Fills missing fields of a stored or shared state. Never throws. */
export function normalizeState(v: unknown): W10State {
  const r = isObj(v) ? v : {}
  const w9 = isObj(r.w9) && typeof r.w9.text === 'string' ? { text: r.w9.text, origin: str(r.w9.origin) } : null
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
    w9,
    w4: isObj(r.w4) ? normArch(r.w4) : null,
    w2: isObj(r.w2) ? normOps(r.w2) : null,
    choices,
    dispositions: strMap(r.dispositions),
    review,
    aiStatement: str(r.aiStatement),
    issued: {
      FN: Math.max(int(iss.FN), ...choices.newFns.map((f) => idNum(f.id))),
      INFO: Math.max(int(iss.INFO), ...choices.newItems.filter((i) => i.id).map((i) => idNum(i.id))),
    },
    updatedAt: num(r.updatedAt) ?? undefined,
    exportedSysmlAt: num(r.exportedSysmlAt) ?? undefined,
    exportedMdAt: num(r.exportedMdAt) ?? undefined,
  }
}

const modelOf = (s: W10State): W9Model | null => {
  if (!s.w9) return null
  const m = parseModel(s.w9.text)
  return 'error' in m ? null : m.model
}

export type Derived = { w9: W9Model; arch: W10Arch; ops: W10Ops; model: Generated; findings: W10Finding[] }
export function derive(s: W10State, date?: string): Derived | null {
  if (!s.w4 || !s.w2) return null
  const w9 = modelOf(s)
  if (!w9) return null
  const model = generateModel(w9, s.w4, s.w2, s.choices, { date })
  return { w9, arch: s.w4, ops: s.w2, model, findings: model.findings }
}

// ---------------------------------------------------------------------------------------------- new IDs
/** The next function ID: after the highest the Week 4 file, its issued counter, the model and this tool have used. */
export const nextFnId = (s: W10State) => nextId('FN', s.w4, modelOf(s), s.issued.FN, s.choices.newFns.map((f) => f.id))
export const nextInfoId = (s: W10State) => nextId('INFO', s.w4, modelOf(s), s.issued.INFO, s.choices.newItems.filter((i) => i.id).map((i) => i.id))
/** Adds a function with the next ID; the ID is issued for good. */
export function withNewFn(s: W10State): W10State {
  const id = nextFnId(s)
  return { ...s, choices: { ...s.choices, newFns: [...s.choices.newFns, { id, name: '', text: '', performer: '', capability: '' }] }, issued: { ...s.issued, FN: idNum(id) } }
}
/** Adds an item; an information item takes the next INFO ID (issued for good), energy and material items are named. */
export function withNewItem(s: W10State, kind: NewItem['kind']): W10State {
  if (kind !== 'information') return { ...s, choices: { ...s.choices, newItems: [...s.choices.newItems, { id: '', name: '', kind }] } }
  const id = nextInfoId(s)
  return { ...s, choices: { ...s.choices, newItems: [...s.choices.newItems, { id, name: '', kind }] }, issued: { ...s.issued, INFO: idNum(id) } }
}

// ---------------------------------------------------------------------------------------------- checks
export const dispositionOf = (s: W10State, f: W10Finding): string => s.dispositions[findingKey(f)] ?? ''

const teamKey = (t: string) => t.toLowerCase().replace(/team|[^a-z0-9]/g, '').replace(/^0+/, '')
const nameKey = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '')
/** Why the three files do not belong to one team, or null. */
export function mismatch(s: W10State): string | null {
  if (s.w4 && s.w2 && s.w4.team && s.w2.team && teamKey(s.w4.team) !== teamKey(s.w2.team)) return `The Week 4 file is from team ${s.w4.team} and the Week 2 file from team ${s.w2.team}: import one team’s files.`
  if (s.w4 && s.w2 && s.w4.enterprise && s.w2.enterprise && nameKey(s.w4.enterprise) !== nameKey(s.w2.enterprise)) return `The Week 4 file is about “${s.w4.enterprise}” and the Week 2 file about “${s.w2.enterprise}”: import one team’s files.`
  const m = modelOf(s)
  const ent = s.w2?.enterprise || s.w4?.enterprise || ''
  if (m && m.enterpriseName && ent && nameKey(m.enterpriseName) !== nameKey(ent)) return `The Week 9 model is of “${m.enterpriseName}” and the ${s.w2?.enterprise ? 'Week 2' : 'Week 4'} file of “${ent}”: import your own team’s model, or rename the enterprise consistently and export again.`
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
export function readiness(s: W10State): { ready: boolean; items: ReadinessItem[] } {
  const item = (id: string, label: string, ok: boolean, detail: string): ReadinessItem => ({ id, label, ok, detail })
  const files = [
    item('week9', 'Week 9 model imported', !!s.w9, s.w9 ? `Imported: ${s.w9.origin}.` : 'Import the model v0.2 file (.sysml) your team exported from the Week 9 lab tool.'),
    item('week4', 'Week 4 model inputs imported', !!s.w4, s.w4 ? `Imported: ${s.w4.origin}.` : 'Import your team’s Week 4 model-inputs file (.json).'),
    item('week2', 'Week 2 model inputs imported', !!s.w2, s.w2 ? `Imported: ${s.w2.origin}.` : 'Import your team’s Week 2 model-inputs file (.json).'),
  ]
  const mm = mismatch(s)
  files.push(item('match', 'The three files are one team’s', !mm && !!(s.w9 && s.w4 && s.w2), mm ?? (s.w9 && s.w4 && s.w2 ? 'Team and enterprise agree across the files.' : 'Import all three files.')))
  const d = derive(s)
  if (!d) return { ready: false, items: files }
  const f = d.findings
  const code = (c: string) => f.filter((x) => x.code === c)
  const valid = (x: W10Finding) => dispositionProblem(dispositionOf(s, x)) === null
  const defects = f.filter((x) => x.cls === 'defect')
  const noPerf = code('fn-no-performer')
  const noItems = code('fn-no-items').filter((x) => !valid(x))
  const g = d.model
  const flowOk = !!g.flow && g.flow.decisions >= LAB10_MINIMUMS.decisions && (g.flow.itemFlows.length >= LAB10_MINIMUMS.itemFlows || code('no-item-flow').every(valid))
  const flowDetail = !s.choices.scenario ? (d.arch.threePersonTeam ? 'A team of three chooses any scenario with at least one alternate from its Week 2 ConOps.' : 'A team of four chooses the scenario with the most alternates from its Week 2 ConOps.') : !g.flow ? 'The chosen scenario is not in your Week 2 file: choose again.' : g.flow.decisions < LAB10_MINIMUMS.decisions ? `${g.flow.scenario} has no alternate, so its flow has no decision: choose a scenario with at least one alternate.` : g.flow.itemFlows.length < LAB10_MINIMUMS.itemFlows && !code('no-item-flow').every(valid) ? `${g.flow.scenario} has no item flow: give the functions of two steps a shared item, or record why the scenario carries none.` : `${g.flow.scenario}: ${g.flow.decisions} decision(s), ${g.flow.itemFlows.length} item flow(s).`
  const m = g.machine
  const min = d.arch.threePersonTeam ? { s: LAB10_MINIMUMS.statesThree, t: LAB10_MINIMUMS.transitionsThree } : { s: LAB10_MINIMUMS.states, t: LAB10_MINIMUMS.transitions }
  const statesMin = !!m && m.states.length >= min.s && m.transitions.length >= min.t && m.guards >= LAB10_MINIMUMS.guards
  const toDispose = f.filter(needsDisposition)
  const badDisp = toDispose.filter((x) => !valid(x))
  const reviewBad = REVIEW_CHECKS.filter((c) => reviewProblem(s.review[c.id]) !== null)
  const exported = !!s.updatedAt && (s.exportedSysmlAt ?? 0) >= s.updatedAt && (s.exportedMdAt ?? 0) >= s.updatedAt
  const items = [
    ...files,
    item('defects', 'Nothing left out of the model', defects.length === 0, defects.length ? `${defects.length} item(s) left out because they would not resolve: ${[...new Set(defects.map((x) => x.id))].join(', ')}. Correct the choice or the file named in each finding.` : `${g.functions.length} functions, ${g.logical.length} logical elements, ${g.allocations.length} allocations and ${g.useCases.length} use cases in the model.`),
    item('performers', 'Every function has a performer', noPerf.length === 0, noPerf.length ? `Choose the logical element that performs ${noPerf.map((x) => x.id).join(', ')}.` : 'Every function is allocated to a logical element.'),
    item('items', 'Every function has its inputs and outputs, or a disposition', noItems.length === 0, noItems.length ? `Give ${noItems.map((x) => x.id).join(', ')} the items they consume and produce, or record why none.` : 'Every function has at least one item, or a recorded reason.'),
    item('flow', `One scenario as an action flow with at least ${LAB10_MINIMUMS.decisions} decision and ${LAB10_MINIMUMS.itemFlows} item flow`, flowOk, flowDetail),
    item('states', `One state definition with at least ${min.s} states, ${min.t} transitions and ${LAB10_MINIMUMS.guards} guard`, statesMin, !m ? 'Name the operating states of your principal element, with their transitions.' : statesMin ? `${m.name}: ${m.states.length} states, ${m.transitions.length} transitions, ${m.guards} guard(s).` : `${m.name} has ${m.states.length} state(s), ${m.transitions.length} transition(s) and ${m.guards} guard(s).`),
    item('reachable', 'Every state is reachable from the initial state', !!m && m.unreachable.length === 0 && code('no-initial').length === 0, !m ? 'No state definition yet.' : code('no-initial').length ? 'Choose the initial state.' : m.unreachable.length ? `No transition chain enters ${m.unreachable.join(', ')}: add the transition, or remove the state.` : 'Every state can be reached.'),
    item('exhibited', 'A part exhibits the state definition', !!m && !!m.exhibitedBy, !m ? 'No state definition yet.' : m.exhibitedBy ? `Exhibited by ${m.exhibitedBy}.` : 'Choose the part whose operating states these are.'),
    item('dispositions', 'Every behavior finding that needs one has a valid disposition', badDisp.length === 0, badDisp.length ? `${badDisp.length} without a valid disposition: ${badDisp.slice(0, 6).map((x) => x.id).join(', ')}${badDisp.length > 6 ? ' …' : ''}.` : 'All findings dispositioned.'),
    item('review', 'The review checklist is complete', reviewBad.length === 0, reviewBad.length ? `${REVIEW_CHECKS.length - reviewBad.length} of ${REVIEW_CHECKS.length} checks recorded with a note.` : `${REVIEW_CHECKS.length} of ${REVIEW_CHECKS.length} checks recorded.`),
    item('ai', 'AI usage statement written', aiStatementProblem(s.aiStatement) === null, aiStatementProblem(s.aiStatement) ?? 'Statement written.'),
    item('exports', 'Both exports made after the last change', exported, exported ? 'The .sysml and .md files are current.' : 'Export the model (.sysml) and the behavior review (.md) after your last change.'),
  ]
  return { ready: items.every((x) => x.ok), items }
}

/** "team-07" (or "team-NN" when no team number is known). */
export function fileStem(s: W10State): string {
  const t = (s.w4?.team || s.w2?.team || '').trim().replace(/[^A-Za-z0-9-]/g, '')
  return t ? `team-${/^\d$/.test(t) ? `0${t}` : t}` : 'team-NN'
}
export const sysmlFileName = (s: W10State) => `${fileStem(s)}-model-v03.sysml`
export const reviewFileName = (s: W10State) => `${fileStem(s)}-behavior-review.md`
export const workspaceFileName = (s: W10State) => `${fileStem(s)}-week10-workspace.json`

const cell = (x: string) => x.replace(/\|/g, '\\|').replace(/\n/g, ' ')

/** team-NN-behavior-review.md: the mapping table, the function table, the allocation matrix, the transition table, the
 *  cross-check, the audit, the review checklist and the AI usage statement. */
export function reviewMarkdown(s: W10State, date = new Date().toISOString().slice(0, 10)): string {
  const d = derive(s, date)
  if (!d) return '# Week 10 behavior review\n\nNot ready: import the Week 9 model and the Week 2 and Week 4 model inputs in the lab tool.\n'
  const g = d.model
  const L: string[] = []
  L.push(`# ${fileStem(s)}: logical architecture and behavior review (Week 10)`, '')
  L.push(`- Enterprise: ${d.w9.enterpriseName || d.ops.enterprise || '(no name)'}`, `- Model file: ${sysmlFileName(s)}`, `- Sources: ${[s.w9?.origin, s.w4?.origin, s.w2?.origin].filter(Boolean).join('; ')}`, `- Date: ${date}`, '')
  L.push('Course acceptance checks only. Validity is decided by the course-designated checker; a checker PASS does not show that a flow follows the ConOps, that a guard means its condition, or that the states are complete.', '')
  L.push('## Scenario mapping table', '')
  if (!g.flow) L.push('No scenario mapped yet.', '')
  else {
    L.push(`Scenario: ${g.flow.scenario} (${g.flow.decisions} decision(s), ${g.flow.itemFlows.length} item flow(s)).`, '')
    L.push('| ConOps item | Flow node | Construct |', '|---|---|---|')
    for (const n of g.flow.nodes) L.push(`| ${cell(n.conops)} | ${n.name} | ${cell(n.construct)} |`)
    L.push('', '### Item flows', '')
    if (!g.flow.itemFlows.length) L.push('None.', '')
    else {
      L.push('| From step | To step | Item |', '|---|---|---|')
      for (const x of g.flow.itemFlows) L.push(`| ${x.from} | ${x.to} | ${cell(x.item)} |`)
      L.push('')
    }
  }
  L.push('## Functions', '')
  L.push('| Function | Name | Performer | Inputs | Outputs | Capabilities |', '|---|---|---|---|---|---|')
  for (const f of g.functions) L.push(`| ${f.id} | ${cell(f.name)} | ${f.performer || '—'} | ${cell(f.inputs.join(', ')) || '—'} | ${cell(f.outputs.join(', ')) || '—'} | ${f.capabilities.join(', ') || '—'} |`)
  L.push('', '## Logical elements', '')
  L.push('| Element | Part usage | Definition | Performs |', '|---|---|---|---|')
  for (const l of g.logical) L.push(`| ${l.id} | ${l.usage} | ${cell(l.def)}${l.specializes ? ` (specializes ${cell(l.specializes)})` : ''} | ${l.performs.join(', ') || '—'} |`)
  L.push('', '## Allocation matrix (requirements × functions; X = allocate in the model)', '')
  const grid = allocationGrid(g)
  if (grid.cols.length) {
    L.push(`| Requirement | ${grid.cols.join(' | ')} |`, `|---|${grid.cols.map(() => ':-:').join('|')}|`)
    for (const r of grid.rows) L.push(`| ${r.req} | ${r.cells.map((c) => (c ? 'X' : '')).join(' | ')} |`)
  } else L.push('No requirement is allocated to a function.')
  L.push('', '## State transition table', '')
  if (!g.machine) L.push('No state definition yet.', '')
  else {
    L.push(`State definition ${g.machine.name}; states: ${g.machine.states.join(', ')}; exhibited by ${g.machine.exhibitedBy || '(no part yet)'}.`, '')
    L.push('| Transition | From | Trigger | Guard | To |', '|---|---|---|---|---|')
    for (const t of g.machine.transitions) L.push(`| ${t.name} | ${t.from} | ${t.trigger} | ${t.guard || '—'} | ${t.to} |`)
    L.push('', '### Cross-check: transitions and the steps that perform the target state’s function', '')
    const cc = crossCheck(g, s.choices.machine)
    if (!cc.length) L.push('No flow or no transitions to pair.', '')
    else {
      L.push('| Transition | To state | Steps of the flow | Paired |', '|---|---|---|---|')
      for (const c of cc) L.push(`| ${c.transition} | ${c.to} | ${c.steps.join(', ') || '—'} | ${c.steps.length ? 'yes' : 'no step found: judge it'} |`)
      L.push('')
    }
  }
  L.push('## Behavior audit: findings and dispositions', '')
  for (const c of W10_FINDING_CLASSES) {
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
  for (const m of W10_MAPPING) L.push(`| ${cell(m.artifact)} | ${cell(m.from)} | ${cell(m.becomes)} | ${m.where} |`)
  L.push('')
  return L.join('\n')
}

// ---------------------------------------------------------------------------------------------- workspace share
export function workspaceJson(s: W10State): string {
  return JSON.stringify({ format: WORKSPACE_FORMAT, version: WORKSPACE_VERSION, state: s }, null, 2)
}
/** A teammate's workspace file. Clear messages; never throws. */
export function importWorkspace(text: string): W10State | { error: string } {
  let d: unknown
  try {
    d = JSON.parse(text)
  } catch {
    return { error: 'This file is not valid JSON.' }
  }
  if (!isObj(d) || d.format !== WORKSPACE_FORMAT) return { error: 'This is not a Week 10 workspace file (format “week10-behavior”). To start from your files, use the three imports above.' }
  if (d.version !== WORKSPACE_VERSION) return { error: `This Week 10 workspace file has version ${JSON.stringify(d.version)}; this tool reads version ${WORKSPACE_VERSION}.` }
  if (!isObj(d.state)) return { error: '“state” must be an object.' }
  const s = normalizeState(d.state)
  if (s.w9 && 'error' in parseModel(s.w9.text)) return { error: 'The model in this workspace cannot be read: ask your teammate to export the workspace again.' }
  return s
}
