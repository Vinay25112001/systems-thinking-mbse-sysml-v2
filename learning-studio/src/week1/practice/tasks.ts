// Guided Practice tasks GP-1…GP-6 on AeroLink (M5, spec §e.2; directive §11). Adapted from the AeroLink missions m1–m4
// (content/missions/week01.ts) and extended with what §11 asks for and the missions lacked: the external systems of the
// boundary (GP-2 step 3), relationships and conflict (GP-4), and needs linked to mission objectives (GP-6).
//
// Every judgment item carries the instructor's reading and its reasoning, and, where the case allows another reading,
// what would make a different answer defensible. The keys are the existing reviewed ones (stakeholders.ts, week1.ts,
// aerolinkCase.ts); the reasoning sentences written for M5 are instructor-authored teaching text for faculty review.
// Instructions point to the Learn section that teaches the method instead of repeating its prose (spec §e, CRM C13).
// Student-visible text uses "objective" for MGO-002… (DECISION_LOG A25) and carries no internal codes (GP-17).
import { BOUNDARY_ITEMS, type BoundaryClass } from '../../content/week1'
import { CONCERNS, CONFLICT, DELIBERATE_GAP, EXTERNAL_SYSTEMS, MISSION_GOALS, NEEDS, RELATIONSHIPS, RELATIONSHIP_VERB, SECOND_TENSION, STAKEHOLDERS, concern, need, needsOf, uncoveredStakeholders, type RelationshipType } from '../../content/lectures/week01/aerolinkCase'
import { LAB_MINIMUMS } from '../../content/lectures/week01/labBrief'
import { CANDIDATES, CLASSIFY_ROWS, CRITIQUE_KEY, ROW_CHOICES, W1_CRITIQUE, W1_FLAWS, isSpecificConcern, CONCERN_HELP, type Classification, type W1Flaw } from '../../workbench/week1/stakeholders'
import { TASK_MINUTES } from './minutes'
import { saidSomething } from '../../workbench/emptyAnswer'
import { compareStep, structural, type CompareItem, type CompareResult, type StructuralResult } from './feedback'
import type { ExchangeDirection, GP1, GP2, GP3, GP4, GP5, GP6, PracticeRow, PracticeTasks, TaskId } from './store'
import { draftBlockers, needPasses } from '../../workbench/week1/stakeholders'

/** Removes register citations ("(R11 p.555)", "R53 p.296") and slide or session pointers from reused checker text:
 *  students follow the Learn link instead (LRN-14, GP-17). */
export function plain(s: string): string {
  return s
    .replace(/\s*\((?:see )?R\d{2,3}[a-z]?(?:\s+pp?\.\s*[\d–,\s-]+)?\)/g, '')
    .replace(/\s*because R\d{2,3}[a-z]? pp?\.\s*[\d–-]+ asks for/g, ' because a need states')
    .replace(/\bR\d{2,3}[a-z]?\s+pp?\.\s*[\d–-]+/g, 'the source')
    .replace(/\s*\((?:L\d|Session \d)\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const stkName = (id: string) => STAKEHOLDERS.find((x) => x.id === id)?.name ?? id
/** Never throws on an unknown ID (review M5-02): stored answers may carry IDs a later case release renamed. */
const con = (id: string | undefined) => CONCERNS.find((c) => c.id === id)
/** Written and not an empty answer, and not a run of empty words ("none none none"; review M5-06). */
export const saidReason = (t: string) => saidSomething(t)
const objLabel = (id: string) => {
  const m = MISSION_GOALS.find((g) => g.id === id)!
  return m.level === 'mission' ? `Mission ${m.id}: ${m.name}` : `Objective ${m.id}: ${m.name}`
}

export type LearnRef = { section: string; why: string }
export type StepDef = { id: string; title: string; kind: string }
export type TaskDef = {
  id: TaskId
  code: string
  title: string
  minutes: number
  /** Learn sections that teach the method (canonical ids; hidden sections are dropped at render). */
  learn: string[]
  learnLine: string
  facts: string
  matters: string
  steps: StepDef[]
}

const M = LAB_MINIMUMS
export const TASKS: TaskDef[] = [
  {
    id: 'gp-1',
    code: 'GP-1',
    title: 'Who is missing?',
    minutes: TASK_MINUTES['gp-1'],
    learn: ['ch06-01', 'ch06-02'],
    learnLine: 'What makes a party a stakeholder, and why the list must be complete early, are explained in Learn',
    facts: 'The vertiport proposal and the fifteen stakeholders of the case register, plus three candidates that are not stakeholders (fictional).',
    matters: `Your register needs at least ${M.stakeholders} stakeholders in at least ${M.roleGroups} role groups; a list of payers, users and builders is not enough.`,
    steps: [
      { id: 'predict', title: 'Predict', kind: 'reveal' },
      { id: 'identify', title: 'Sort the candidates', kind: 'compared' },
      { id: 'compare', title: 'Compare with your prediction', kind: 'reveal' },
    ],
  },
  {
    id: 'gp-2',
    code: 'GP-2',
    title: 'Boundary and external systems',
    minutes: TASK_MINUTES['gp-2'],
    learn: ['ch04-01', 'ch04-02', 'ch04-03', 'ch04-04', 'ch04-05'],
    learnLine: 'Choosing a boundary for a question, the vocabulary and the control criterion are explained in Learn',
    facts: 'The air-taxi service as the system of interest, nine candidate elements, and the external systems EXT-001…003 (fictional).',
    matters: `Your proposal states a system of interest with at least ${M.inside} elements inside its boundary and at least ${M.context} external systems, each with what crosses the boundary.`,
    steps: [
      { id: 'boundary', title: 'Draw the boundary', kind: 'compared' },
      { id: 'criterion', title: 'Name the criterion', kind: 'reveal' },
      { id: 'exchanges', title: 'What crosses the boundary', kind: 'structural' },
    ],
  },
  {
    id: 'gp-3',
    code: 'GP-3',
    title: 'Identify and classify stakeholders',
    minutes: TASK_MINUTES['gp-3'],
    learn: ['ch06-03', 'ch06-04', 'ch06-05', 'ch07-01'],
    learnLine: 'The identification methods, approving authorities and the register’s classifications are explained in Learn',
    facts: 'Six stakeholders of the case register and four candidates for your own register row (fictional).',
    matters: 'Each stakeholder in your register gets the same classification and a concern specific enough for someone else to check.',
    steps: [
      { id: 'classify', title: 'Classify six stakeholders', kind: 'compared' },
      { id: 'row', title: 'Write one register row', kind: 'structural' },
    ],
  },
  {
    id: 'gp-4',
    code: 'GP-4',
    title: 'Concerns, conflicts and relationships',
    minutes: TASK_MINUTES['gp-4'],
    learn: ['ch07-01', 'ch07-02', 'ch07-03'],
    learnLine: 'Concerns, the seven relationship types and how a conflict is recorded are explained in Learn',
    facts: 'Relationships REL-001…008 and concerns CON-001…017 from the instructor’s case (fictional).',
    matters: `Your register needs at least ${M.relationships} relationships, at least ${M.conflicts} of them a conflict. Conflicts feed the Week 3 trade study.`,
    steps: [
      { id: 'rels', title: 'Which relationship links each pair?', kind: 'compared' },
      { id: 'conflict', title: 'Find the conflict', kind: 'compared' },
      { id: 'rewrite', title: 'Make a concern specific', kind: 'structural' },
    ],
  },
  {
    id: 'gp-5',
    code: 'GP-5',
    title: 'Draft needs',
    minutes: TASK_MINUTES['gp-5'],
    learn: ['ch09-01', 'ch09-02', 'ch09-03', 'ch09-04', 'ch09-05'],
    learnLine: 'Needs versus requirements and the six checks of the course gate are explained in Learn',
    facts: 'Six draft needs, the reference needs of the case and its fifteen-stakeholder register (fictional).',
    matters: `Your record needs at least ${M.needs} needs from at least ${M.needSources} stakeholders, checked with the same six checks.`,
    steps: [
      { id: 'diagnose', title: 'Diagnose six drafts', kind: 'compared' },
      { id: 'write', title: 'Write two needs', kind: 'structural' },
    ],
  },
  {
    id: 'gp-6',
    code: 'GP-6',
    title: 'Needs and mission objectives',
    minutes: TASK_MINUTES['gp-6'],
    learn: ['ch05-04', 'ch10-02', 'ch10-03'],
    learnLine: 'How needs serve the mission and its objectives, and how a set is audited for coverage, are explained in Learn',
    facts: 'The mission MGO-001, the objectives MGO-002, -003, -004 and -009, and the needs NEED-001…017 (fictional).',
    matters: 'Every need in your record names the mission or an objective it serves, and every stakeholder without a need carries a recorded reason.',
    steps: [
      { id: 'links', title: 'Link needs to objectives', kind: 'compared' },
      { id: 'gap', title: 'Audit the coverage', kind: 'compared' },
    ],
  },
]
export const taskById = (id: string) => TASKS.find((t) => t.id === id)
export const PRACTICE_MINUTES = TASKS.reduce((a, t) => a + t.minutes, 0)

// ================================================================================================ GP-1
export const PREDICTION_OPTIONS = [
  { id: 'enough', text: 'Yes, the three are enough' },
  { id: 'users', text: 'No: add more users or customers' },
  { id: 'missing', text: 'No: add other kinds of party' },
  { id: 'unsure', text: 'I cannot tell yet' },
]
export const MATCH_OPTIONS = [
  { id: 'matched', text: 'It matched' },
  { id: 'partly', text: 'Partly' },
  { id: 'contradicted', text: 'It contradicted my prediction' },
]
export const GP1_QUESTION = 'AeroLink Urban Mobility plans a new vertiport next to a residential district. Its project team proposes to write the needs for the vertiport from three stakeholders only: passengers, the investors and the aircraft manufacturer. Is that list enough to write the needs from?'
/** A different reading the case allows, for a few candidates. */
const GP1_DEFENSIBLE: Record<string, string> = {
  k8: 'Marking it a stakeholder is defensible only if you meant the organization that runs the grid; that organization is the electric utility, which is on the list separately.',
  k16: 'A register that keeps only parties with a direct role could leave insurers out; the case keeps them because their coverage conditions limit how the vertiport may operate.',
  k17: 'Some registers record advocates only through the passengers they speak for; the case lists both, so that the advocates’ own concern can be traced.',
}
export const GP1_ITEMS: CompareItem[] = CANDIDATES.map((c) => ({ id: c.id, key: c.stakeholder ? 'yes' : 'no' }))
export const gp1Candidate = (id: string) => {
  const c = CANDIDATES.find((x) => x.id === id)!
  return { ...c, why: plain(c.why), defensible: GP1_DEFENSIBLE[id] }
}
export const gp1Identify = (s: GP1): CompareResult => compareStep(GP1_ITEMS, s.identify)
/** The reveal after the comparison: about the student's own sort, not a grade. */
export function gp1Reveal(s: GP1): string {
  const yes = CANDIDATES.filter((c) => s.identify.answers[c.id] === 'yes' && c.stk && !['STK-001', 'STK-003', 'STK-011'].includes(c.stk))
  const authorities = yes.filter((c) => ['STK-002', 'STK-013'].includes(c.stk!)).map((c) => c.name)
  const affected = yes.filter((c) => ['STK-004', 'STK-014', 'STK-015'].includes(c.stk!)).map((c) => c.name)
  const pred = PREDICTION_OPTIONS.find((o) => o.id === s.prediction?.value)?.text
  const parts = [
    `You marked ${yes.length} stakeholder${yes.length === 1 ? '' : 's'} beyond the three on the team’s list.`,
    authorities.length ? `Among them are approving authorities that can stop the vertiport (${authorities.join(', ')}).` : 'The approving authorities (the FAA and the city planning authority) can stop the vertiport; look at them again.',
    affected.length ? `Others are affected without ever riding or paying (${affected.join(', ')}).` : 'Residents near the site are affected without ever riding or paying; look at them again.',
    'A list built from the people who pay, use and build misses these parties, and needs written from it would miss what they need.',
    pred ? `Your prediction was “${pred}”.` : '',
  ]
  return parts.filter(Boolean).join(' ')
}
export const gp1Steps = (s: GP1) => {
  const id = gp1Identify(s)
  return {
    predict: { touched: !!s.prediction, complete: !!s.prediction },
    identify: { touched: id.touched, complete: id.complete },
    compare: { touched: !!s.match, complete: !!s.match && !!s.prediction && id.complete },
  }
}

// ================================================================================================ GP-2
export const BOUNDARY_QUESTION_TEXT = 'Will adding aircraft reduce average passenger waiting time?'
export const BOUNDARY_CLASSES: { id: BoundaryClass; label: string }[] = [
  { id: 'inside', label: 'Inside' },
  { id: 'environment', label: 'Environment' },
  { id: 'irrelevant', label: 'Irrelevant' },
]
const GP2_DEFENSIBLE: Record<string, string> = {
  b2: 'The chargers belong to the vertiport operators, not to AeroLink. They sit inside because the case draws the wider system of interest, which includes elements the service needs but does not own; with the narrower system of interest they would be environment.',
  b4: 'Environment is defensible only if the question held demand fixed, a pure capacity question. This question asks whether waits fall, and demand responds to waits.',
  b9: 'Inside is defensible if the question were about when AeroLink places its orders; the delivery delay itself is set by the manufacturer.',
}
export const GP2_ITEMS: CompareItem[] = BOUNDARY_ITEMS.map((b) => ({ id: b.id, key: b.answer }))
export const gp2Item = (id: string) => {
  const b = BOUNDARY_ITEMS.find((x) => x.id === id)!
  return { ...b, why: plain(b.why), defensible: GP2_DEFENSIBLE[id] }
}
export const gp2Boundary = (s: GP2) => compareStep(GP2_ITEMS, s.boundary)
export const CRITERION_OPTIONS: { id: string; text: string; explanation: string }[] = [
  { id: 'control', text: 'Control: AeroLink controls passenger demand', explanation: 'AeroLink does not control passengers any more than it controls the grid, so a control criterion would put demand outside the boundary, beside the grid.' },
  { id: 'model', text: 'Model boundary: demand is endogenous to the feedback under study', explanation: plain(BOUNDARY_ITEMS.find((b) => b.id === 'b4')!.why) },
  { id: 'relevance', text: 'Relevance: the grid has no causal path to waiting time', explanation: 'The grid does have a causal path to waiting time, through charging capacity. It is environment because AeroLink does not design or control it, not because it is irrelevant.' },
]
export const CRITERION_BEST = 'model'
/** The three external systems of GP-2 step 3, with the instructor's reading of what crosses and in which direction. */
export const GP2_EXTERNALS: { id: string; name: string; reading: string; direction: ExchangeDirection; why: string; defensible?: string }[] = [
  { id: 'EXT-001', name: EXTERNAL_SYSTEMS[0].name, reading: 'Flight intent goes out to the air traffic service; airspace access, clearances and traffic information come back.', direction: 'both', why: 'The service must make each flight known before it enters controlled airspace (NEED-009), and it receives clearances and traffic information in return: an exchange in both directions.', defensible: 'Into the service alone is defensible if you record only what the service receives; then the outgoing flight intent still needs a line of its own.' },
  { id: 'EXT-002', name: EXTERNAL_SYSTEMS[1].name, reading: 'Power flows in to the vertiport chargers, within the agreed connection capacity.', direction: 'in', why: 'Power crosses into the service; the connection capacity limits how much (NEED-010).', defensible: 'Both directions is defensible if the utility receives load forecasts or metering data from the service; the case does not record that exchange.' },
  { id: 'EXT-003', name: EXTERNAL_SYSTEMS[2].name, reading: 'Weather constrains operations: a one-way influence on the service.', direction: 'in', why: 'Nothing the service does changes the weather, so the influence runs one way, into the service. A context records such influences as well as two-way exchanges.' },
]
export const DIRECTION_LABEL: Record<ExchangeDirection, string> = { in: 'Into the service', out: 'Out of the service', both: 'Both directions' }
export function gp2Exchanges(s: GP2): StructuralResult & { touched: boolean } {
  const issues: string[] = []
  for (const e of GP2_EXTERNALS) {
    const x = s.exchanges[e.id]
    if (!x || !saidSomething(x.text)) issues.push(`state what crosses the boundary with ${e.name} (people, materials, energy, information or approvals); “n/a” or “todo” says nothing.`)
    else if (!x.direction) issues.push(`choose the direction of the exchange with ${e.name}.`)
  }
  return { ...structural(issues), touched: GP2_EXTERNALS.some((e) => !!s.exchanges[e.id]?.text || !!s.exchanges[e.id]?.direction) }
}
/** The exchanges changed after the last Check (the reading shown is about the checked ones; review M5-17). */
export const gp2ExchangesStale = (s: GP2) => !!s.exchangesChecked && GP2_EXTERNALS.some((e) => (s.exchanges[e.id]?.text ?? '') !== (s.exchangesChecked![e.id]?.text ?? '') || s.exchanges[e.id]?.direction !== s.exchangesChecked![e.id]?.direction)
/** Checked directions that differ from the instructor's reading and are not yet read. */
export const gp2ExchangeOpen = (s: GP2) => GP2_EXTERNALS.filter((e) => s.exchangesChecked?.[e.id]?.direction && s.exchangesChecked[e.id]!.direction !== e.direction && !s.exchangesAck[e.id]).map((e) => e.id)
/** "Check": snapshots the exchanges; an acknowledgement stays only for a direction that did not change. */
export function gp2CheckExchanges(s: GP2, now = Date.now()): GP2 {
  const ack: Record<string, boolean> = {}
  for (const e of GP2_EXTERNALS) if (s.exchangesAck[e.id] && s.exchangesChecked?.[e.id]?.direction === s.exchanges[e.id]?.direction) ack[e.id] = true
  return { ...s, exchangesChecked: JSON.parse(JSON.stringify(s.exchanges)), exchangesCheckedAt: now, exchangesAck: ack }
}
export const gp2Steps = (s: GP2) => {
  const b = gp2Boundary(s)
  const x = gp2Exchanges(s)
  return {
    boundary: { touched: b.touched, complete: b.complete },
    criterion: { touched: !!s.criterion, complete: !!s.criterion },
    exchanges: { touched: x.touched, complete: x.ok && !!s.exchangesChecked && !gp2ExchangesStale(s) && gp2ExchangeOpen(s).length === 0 },
  }
}

// ================================================================================================ GP-3
export const GP3_ITEMS: CompareItem[] = CLASSIFY_ROWS.map((r) => ({ id: r.stk, key: `${r.key.role}|${r.key.side}|${r.key.approving}` }))
const GP3_DEFENSIBLE: Record<string, string> = {
  'STK-004': 'Some readers mark communities an approving authority because they can block a site. The case reads it differently: they oppose through the planning process, and the approval belongs to the city planning authority.',
  'STK-005': 'Internal is defensible only if “internal” meant the enterprise, where the vertiport operators are partners. The course register uses the organization that runs the system, AeroLink Urban Mobility.',
  'STK-010': 'Internal is defensible on the same enterprise reading as the vertiport operators; the course register reads it against the company.',
}
export const gp3Row = (stk: string) => {
  const r = CLASSIFY_ROWS.find((x) => x.stk === stk)!
  return { ...r, why: plain(r.why), defensible: GP3_DEFENSIBLE[stk] }
}
/** The classification answer of one stakeholder, as one compared item (role|side|approving). */
export const gp3Answer = (c: Classification) => (c.role && c.side && c.approving ? `${c.role}|${c.side}|${c.approving}` : '')
export const gp3Classify = (s: GP3) => compareStep(GP3_ITEMS, s.classes)
export const GP3_ROW_CHOICES = ROW_CHOICES
/** The practice row (A25-3): a specific concern, interest 1–5 with a short reason (required), influence optional. */
export function gp3RowIssues(r: PracticeRow): string[] {
  const out: string[] = []
  if (!ROW_CHOICES.some((c) => c.id === r.stk)) out.push('choose a stakeholder from the list.')
  if (!r.concern.trim()) out.push('write the concern.')
  else if (!isSpecificConcern(r.concern.trim(), ROW_CHOICES.find((c) => c.id === r.stk)?.name)) out.push(`the concern is generic. ${CONCERN_HELP}`)
  if (!/^[1-5]$/.test(r.interest)) out.push('rate the stakeholder’s interest from 1 to 5.')
  if (!saidSomething(r.interestReason)) out.push('give a short reason for the interest rating, so that a reviewer can challenge it.')
  if (r.influence && !/^[1-5]$/.test(r.influence)) out.push('rate influence from 1 to 5, or leave it blank (optional).')
  return out
}
export const gp3RowCheck = (s: GP3): StructuralResult => structural(gp3RowIssues(s.row))
/** The instructor's register entry for the chosen row stakeholder (reasoned comparison, not a key). */
export function gp3RowReading(stk: string) {
  const st = STAKEHOLDERS.find((x) => x.id === stk)
  if (!st) return null
  return { name: st.name, concern: st.concerns.map((c) => con(c)?.text ?? '').join(' '), interest: st.interest, influence: st.influence, reason: st.influenceReason }
}
export const gp3Steps = (s: GP3) => {
  const c = gp3Classify(s)
  const touchedRow = !!(s.row.stk || s.row.concern || s.row.interest || s.row.interestReason || s.row.influence || s.row.reason)
  return {
    classify: { touched: c.touched, complete: c.complete },
    row: { touched: touchedRow, complete: !!s.rowCheckedAt && gp3RowCheck(s).ok },
  }
}

// ================================================================================================ GP-4
export const REL_TYPES = Object.keys(RELATIONSHIP_VERB) as RelationshipType[]
const GP4_REASONING: Record<string, { why: string; defensible?: string }> = {
  'REL-003': { why: 'The utility supplies grid power for the operators’ chargers.', defensible: '“Coordinates with” is defensible for the connection agreement they negotiate, but the flow of power makes “supplies” the closer reading.' },
  'REL-001': { why: 'The FAA certifies the aircraft the manufacturer builds: certification is regulation.' },
  'REL-007': { why: 'The planning authority is affected by the communities through public consultation on siting: residents’ views shape which sites it approves.', defensible: '“Regulates” is defensible only if your reading gives the authority rules that bind residents’ conduct; the case gives it approval of sites, not rules over residents.' },
  'REL-005': { why: 'They agree incident response plans for the vertiports; neither funds, supplies or regulates the other.' },
  'REL-008': { why: 'Insurers set risk transfer conditions on the investors’ financing: they work together on terms.', defensible: '“Funds” is not the reading: insurers do not provide the capital. “Coordinates with” is defensible if you see the conditions as negotiated rather than shared.' },
}
export const GP4_PAIRS = ['REL-003', 'REL-001', 'REL-007', 'REL-005', 'REL-008'].map((id) => {
  const r = RELATIONSHIPS.find((x) => x.id === id)!
  return { ...r, sourceName: stkName(r.source), targetName: stkName(r.target), ...GP4_REASONING[id] }
})
export const GP4_ITEMS: CompareItem[] = GP4_PAIRS.map((p) => ({ id: p.id, key: p.type }))
export const gp4Rels = (s: GP4) => compareStep(GP4_ITEMS, s.rels)
export const CONFLICT_PAIRS: { id: string; a: string; b: string; reading: 'case' | 'defensible' | 'not-conflict'; why: string }[] = [
  { id: 'STK-004|STK-005', a: 'STK-004', b: 'STK-005', reading: 'case', why: CONFLICT.why },
  { id: 'STK-010|STK-003', a: 'STK-010', b: 'STK-003', reading: 'defensible', why: `A defensible second tension: ${SECOND_TENSION.text} The case records it in the audit, not as a relationship; the conflict the register records is between the communities and the vertiport operators.` },
  { id: 'STK-007|STK-008', a: 'STK-007', b: 'STK-008', reading: 'not-conflict', why: 'They coordinate flight clearances; the case records no concern of one that works against a concern of the other.' },
  { id: 'STK-012|STK-003', a: 'STK-012', b: 'STK-003', reading: 'not-conflict', why: 'They work together on the terms of financing; nothing in their concerns pulls in opposite directions.' },
]
export const CONFLICT_CASE = { pair: 'STK-004|STK-005', concerns: ['CON-012', 'CON-006'], variable: CONFLICT.sharedVariable }
export const pairLabel = (id: string) => {
  const p = CONFLICT_PAIRS.find((x) => x.id === id)
  return p ? `${stkName(p.a)} and ${stkName(p.b)}` : ''
}
export function gp4ConflictCheck(s: GP4): StructuralResult {
  const issues: string[] = []
  const p = CONFLICT_PAIRS.find((x) => x.id === s.conflict.pair)
  if (!p) issues.push('choose the pair of stakeholders whose concerns pull against each other.')
  const [c1, c2] = s.conflict.concerns
  if (!c1 || !c2) issues.push('choose the two concerns behind the conflict.')
  else if (c1 === c2) issues.push('choose two different concerns, one on each side.')
  else if (!con(c1) || !con(c2)) issues.push('choose the two concerns again: a saved concern is no longer in the case.')
  else if (p && !(new Set([con(c1)!.stakeholder, con(c2)!.stakeholder]).has(p.a) && new Set([con(c1)!.stakeholder, con(c2)!.stakeholder]).has(p.b))) issues.push('each concern should belong to one of the two stakeholders you chose, one on each side.')
  if (!saidSomething(s.conflict.variable)) issues.push('name the shared variable both concerns pull on.')
  return structural(issues)
}
/** The conflict step compared with the case reading: agrees when the pair and both concerns are the case's. */
export const gp4ConflictAgrees = (s: GP4) => s.conflict.pair === CONFLICT_CASE.pair && [...s.conflict.concerns].sort().join() === [...CONFLICT_CASE.concerns].sort().join()
export const GP4_GENERIC = 'Insurers: safety'
export const gp4GenericCheck = (s: GP4): StructuralResult => {
  const t = s.generic.trim()
  if (!t) return structural(['write the insurers’ concern.'])
  return structural(isSpecificConcern(t, 'Insurers') ? [] : [`the concern is still generic. ${CONCERN_HELP}`])
}
export const GP4_GENERIC_READING = concern('CON-014').text
export const concernOptions = () => CONCERNS.map((c) => ({ id: c.id, label: `${c.id} ${c.name} (${stkName(c.stakeholder)})` }))
export const gp4Steps = (s: GP4) => {
  const r = gp4Rels(s)
  return {
    rels: { touched: r.touched, complete: r.complete },
    conflict: { touched: !!(s.conflict.pair || s.conflict.concerns.length || s.conflict.variable), complete: !!s.conflictCheckedAt && gp4ConflictCheck(s).ok },
    rewrite: { touched: !!s.generic, complete: !!s.genericCheckedAt && gp4GenericCheck(s).ok },
  }
}

// ================================================================================================ GP-5
export const GP5_FLAWS = W1_FLAWS
export const GP5_DRAFTS = W1_CRITIQUE.map((d) => ({ id: d.id, before: d.before, after: d.after, afterCondition: d.afterCondition, note: plain(d.note), key: CRITIQUE_KEY[d.id] ?? [] }))
const flawSet = (a: Partial<Record<W1Flaw, boolean>> | undefined) => GP5_FLAWS.filter((f) => a?.[f.id]).map((f) => f.id).sort().join('|')
/** A draft is judged when the student ticked a flaw or "Acceptable as written" (review M5-05). */
export const gp5Judged = (a: GP5['critique'][string] | undefined) => !!a && (!!a.ok || GP5_FLAWS.some((f) => a[f.id]))
export const gp5AllJudged = (s: GP5) => GP5_DRAFTS.every((d) => gp5Judged(s.critique[d.id]))
const judgment = (a: GP5['critique'][string] | undefined) => `${a?.ok ? 'ok' : ''}:${flawSet(a)}`
export function gp5Diagnose(s: GP5) {
  const checked = !!s.critiqueCheckedAt && !!s.critiqueChecked
  const rows = GP5_DRAFTS.map((d) => {
    const snap = s.critiqueChecked?.[d.id]
    const agrees = checked && flawSet(snap) === [...d.key].sort().join('|')
    const changed = checked && judgment(snap) !== judgment(s.critique[d.id])
    return { id: d.id, agrees, changed, acknowledged: !!s.critiqueAck[d.id], resolved: agrees || !!s.critiqueAck[d.id] }
  })
  const agree = checked ? rows.filter((r) => r.agrees).length : 0
  const open = checked ? rows.filter((r) => !r.resolved).length : 0
  const stale = rows.some((r) => r.changed)
  const touched = GP5_DRAFTS.some((d) => gp5Judged(s.critique[d.id])) || !!s.critiqueCheckedAt
  return { rows, checked: checked && GP5_DRAFTS.every((d) => gp5Judged(s.critiqueChecked?.[d.id])), stale, agree, differ: checked ? rows.length - agree : 0, open, complete: checked && !stale && open === 0, touched }
}
export const gp5DraftBlockers = (s: GP5) => draftBlockers(s.draft).map(plain)
export function gp5Write(s: GP5) {
  const ok = s.needs.filter((n) => needPasses(n))
  const stakeholders = new Set(ok.flatMap((n) => n.traces))
  const issues: string[] = []
  if (ok.length < 2) issues.push(`record ${2 - ok.length === 2 ? 'two needs' : 'one more need'} that pass the course check.`)
  else if (stakeholders.size < 2) issues.push('both needs come from the same stakeholder: write one for a different stakeholder.')
  return { ...structural(issues), recorded: s.needs.length }
}
/** The case need of the stakeholder a student wrote for: the instructor's version, shown for comparison. */
export function gp5Reading(stk: string) {
  const n = needsOf(stk).find((x) => x.subject === stk) ?? needsOf(stk)[0]
  return n ? { id: n.id, statement: n.statement, condition: n.condition, rationale: n.rationale } : null
}
export const REGISTER_OPTIONS = STAKEHOLDERS.map((s) => ({ id: s.id, name: s.name }))
export const gp5Steps = (s: GP5) => {
  const d = gp5Diagnose(s)
  const w = gp5Write(s)
  const draftTouched = !!(s.draft.text || s.draft.name || s.draft.rationale || s.draft.conditions || s.draft.traces.length)
  return {
    diagnose: { touched: d.touched, complete: d.complete },
    write: { touched: draftTouched || s.needs.length > 0, complete: w.ok },
  }
}

// ================================================================================================ GP-6
export const OBJECTIVE_OPTIONS = MISSION_GOALS.map((g) => ({ id: g.id, label: objLabel(g.id) }))
export const objectiveLabel = objLabel
const GP6_REASONING: Record<string, { why: string; defensible?: string }> = {
  'NEED-001': { why: 'The need is the passengers’ side of the objective: a short wait, and one they can predict.' },
  'NEED-003': { why: 'Noise within the agreed limits is what being a good neighbor means to the residents near a vertiport.' },
  'NEED-004': { why: 'Turnaround that never limits the pads keeps departures flowing at peak hours, so waits stay short.', defensible: 'Objective MGO-004 is defensible: pad throughput is also capacity. The case links the need to waits because the operators’ concern is departures at peak hours.' },
  'NEED-007': { why: 'Knowing each aircraft’s condition before release is part of keeping every flight within approved limits.' },
  'NEED-010': { why: 'The grid connection caps how much charging, and so how much capacity, a vertiport can add as demand grows.', defensible: 'The mission is defensible as a broader link, but the specific objective the connection limit constrains is growth in capacity.' },
  'NEED-012': { why: 'Operating only from sites that fit the land-use plan is part of being a good neighbor to the city and its residents.', defensible: 'The mission (MGO-001) is defensible: without approved sites there is no network to run.' },
}
export const GP6_NEEDS = Object.keys(GP6_REASONING).map((id) => ({ ...need(id), ...GP6_REASONING[id] }))
export const GP6_ITEMS: CompareItem[] = GP6_NEEDS.map((n) => ({ id: n.id, key: n.mgo }))
export const gp6Links = (s: GP6) => compareStep(GP6_ITEMS, s.links)
/** Stakeholder × number of needs traced to it (as subject or contributing source): the coverage matrix of the audit. */
export const coverageRows = () => STAKEHOLDERS.map((st) => ({ id: st.id, name: st.name, subject: NEEDS.filter((n) => n.sources.some((x) => x.stakeholder === st.id && x.role === 'subject')).length, contributing: NEEDS.filter((n) => n.sources.some((x) => x.stakeholder === st.id && x.role === 'contributing')).length }))
export const GAP_CASE = DELIBERATE_GAP
export const GAP_STAKEHOLDERS = uncoveredStakeholders()
export function gp6GapCheck(s: GP6): StructuralResult {
  const issues: string[] = []
  if (!s.gap.stakeholder) issues.push('choose the stakeholder the matrix shows with no need.')
  if (!s.gap.decision) issues.push('decide: add a need, or record why not.')
  if (!saidReason(s.gap.reason)) issues.push('write the reason for your decision, so that a reviewer can challenge it; “none” or “n/a” is not a reason.')
  return structural(issues)
}
export const gp6Steps = (s: GP6) => {
  const l = gp6Links(s)
  return {
    links: { touched: l.touched, complete: l.complete },
    gap: { touched: !!(s.gap.stakeholder || s.gap.decision || s.gap.reason), complete: !!s.gapCheckedAt && gp6GapCheck(s).ok },
  }
}

// ================================================================================================ all tasks
export function stepStatus(tasks: PracticeTasks): Record<TaskId, Record<string, { touched: boolean; complete: boolean }>> {
  return { 'gp-1': gp1Steps(tasks['gp-1']), 'gp-2': gp2Steps(tasks['gp-2']), 'gp-3': gp3Steps(tasks['gp-3']), 'gp-4': gp4Steps(tasks['gp-4']), 'gp-5': gp5Steps(tasks['gp-5']), 'gp-6': gp6Steps(tasks['gp-6']) }
}
