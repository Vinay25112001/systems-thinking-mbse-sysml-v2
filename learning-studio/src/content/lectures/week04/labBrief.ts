// Week 4 lab brief: the single source of the Lab L4 minimums, the view kinds, the allocation criteria, the flow kinds, the
// hard gates and advisories and the person-hours. Read by the Week 4 lectures (session1.ts, session2.ts), the AeroLink case
// (aerolinkCase.ts), the lab instructions (src/content/lab/week04Lab.ts), the lab tool (src/workbench/week4/*) and their
// tests. Pure data and pure functions, no imports, so both the content and the workbench layers may depend on it.
//
// Review status: new-pending-review. Minimums, the required view set and person-hours are course conventions, pending
// faculty approval; the three-person minimums follow DECISION_LOG A21 provisional decision 4 (workload proportional to team
// size).
//
// Sources checked for this file (page text in _source_cache/*.txt):
//   - Required view set: the course document (Architecture Concept Description) names the operational, functional,
//     physical and enterprise perspectives; the schedule adds the information view. A framework establishes minimum
//     guidelines for each stakeholder's interest (MITRE, R62 p.344); the course set is that minimum, not a limit.
//   - Allocation criteria (affinity between functions): SEBoK Physical Architecture, R20c pp.598–599, word for word in
//     substance: similar transformations within the same technology, similar levels of efficiency, exchange of the same
//     type of input-output flows (information, energy and materials), centralized or distributed controls, execution with
//     close frequency level, dependability conditions, environment resistance level, other enterprise constraints.
//   - Flow kinds: a function transforms inputs into outputs involving data, materials and/or energies (R20b p.587).
//   - Inputs and outputs are integral parts of a function; relate the logical architecture back to operational scenarios
//     (R20b p.594, Table 1 pitfalls). Functional view minimum contents: R20a p.581.
//   - Five plus or minus two elements per level: a common guideline (R20c p.597), used as an advisory only.
//   - A human is in the loop to validate the intelligence an AI system gains (R31 p.1370).

// ---------------------------------------------------------------------------------------------------- minimums
/** Lab L4 minimums for a team of four (course convention, Session 2 lab brief). */
export const LAB4_MINIMUMS = {
  /** One viewpoint of each required kind (REQUIRED_VIEW_KINDS). */
  viewpoints: 5,
  functions: 10,
  /** First-level functions under the mission function (the decomposition has three levels at most). */
  groups: 3,
  logical: 4,
  physical: 4,
  decisions: 1,
  information: 5,
  ai: 1,
} as const

/** A three-person team: per-item minimums reduced in proportion (A21 provisional decision 4, pending confirmation). The
 *  view set, the decision record, the AI card and integration do not shrink; functions and information items do, so the
 *  out-of-class load per person stays within 0.1 h of a team of four (week4Path.ts THREE_PERSON computes it; tested). */
export const LAB4_MINIMUMS_THREE = {
  viewpoints: 5,
  functions: 7,
  groups: 3,
  logical: 3,
  physical: 3,
  decisions: 1,
  information: 3,
  ai: 1,
} as const
export type Lab4Minimums = { [K in keyof typeof LAB4_MINIMUMS]: number }

/** Lab L4 out of class in person-hours for a team of four (course estimate, outline §5.7, to be checked against logged
 *  hours). `scales` says which minimum the task grows with: functions, information items, or fixed. */
export const LAB4_PERSON_HOURS: { id: string; task: string; hours: number; scales: 'functions' | 'information' | 'fixed' }[] = [
  { id: 'views', task: 'viewpoints: purpose, stakeholders, concerns, form, and the concern-coverage check (Part 15)', hours: 1.0, scales: 'fixed' },
  { id: 'walks', task: 'scenario walks: functions with inputs and outputs', hours: 2.0, scales: 'functions' },
  { id: 'trace', task: 'capability trace and decomposition', hours: 1.0, scales: 'functions' },
  { id: 'allocation', task: 'logical and physical elements, allocation with criteria', hours: 2.0, scales: 'functions' },
  { id: 'decision', task: 'architecture decision record', hours: 1.0, scales: 'fixed' },
  { id: 'information', task: 'information view: producers, consumers and decisions', hours: 1.5, scales: 'information' },
  { id: 'ai', task: 'AI capability card', hours: 0.5, scales: 'fixed' },
  { id: 'integration', task: 'consistency checks, AI usage statement and integration', hours: 1.0, scales: 'fixed' },
]
export const LAB4_TEAM_HOURS = Math.round(LAB4_PERSON_HOURS.reduce((a, t) => a + t.hours, 0) * 10) / 10

// ---------------------------------------------------------------------------------------------------- views
export type ViewKind = 'operational' | 'functional' | 'logical' | 'physical' | 'information' | 'enterprise' | 'other'
/** The view kinds the course recognizes, with the question each answers (course convention; SEBoK treats functional,
 *  logical and physical as complementary views, R20a p.581; MITRE names operational, system and technical views, R62 p.341). */
export const VIEW_KINDS: { id: ViewKind; label: string; question: string }[] = [
  { id: 'operational', label: 'Operational', question: 'Who does what, in which order, in the scenarios the stakeholders recognize?' },
  { id: 'functional', label: 'Functional', question: 'What must the system do: which transformations of which inputs into which outputs?' },
  { id: 'logical', label: 'Logical', question: 'Which technology-independent elements perform the functions?' },
  { id: 'physical', label: 'Physical', question: 'Which concrete elements (hardware, software, facilities, people) implement them?' },
  { id: 'information', label: 'Information', question: 'Which information is produced where, used where, and for which decision?' },
  { id: 'enterprise', label: 'Enterprise', question: 'Which organization owns which elements and agreements?' },
  { id: 'other', label: 'Other (named by the team)', question: 'A further view a stakeholder concern needs.' },
]
/** The course's minimum view set: the four perspectives of the course document plus the scheduled information view. */
export const REQUIRED_VIEW_KINDS: ViewKind[] = ['operational', 'functional', 'physical', 'information', 'enterprise']
export const viewKindLabel = (k: string) => VIEW_KINDS.find((v) => v.id === k)?.label ?? k

// ---------------------------------------------------------------------------------------------------- allocation
export type CriterionId = 'transformation' | 'efficiency' | 'flow' | 'control' | 'frequency' | 'dependability' | 'environment' | 'enterprise'
/** SEBoK's affinity criteria for partitioning and allocating functions to system elements (R20c pp.598–599). */
export const ALLOCATION_CRITERIA: { id: CriterionId; label: string }[] = [
  { id: 'transformation', label: 'Similar transformations within the same technology' },
  { id: 'efficiency', label: 'Similar levels of efficiency' },
  { id: 'flow', label: 'Exchange of the same type of flow (information, energy or materials)' },
  { id: 'control', label: 'Centralized or distributed control' },
  { id: 'frequency', label: 'Execution at a close frequency level' },
  { id: 'dependability', label: 'Dependability conditions' },
  { id: 'environment', label: 'Environment resistance level' },
  { id: 'enterprise', label: 'Other enterprise constraints' },
]
export const criterionLabel = (c: string) => ALLOCATION_CRITERIA.find((x) => x.id === c)?.label ?? c

/** What a candidate physical architecture may aim at (R20c p.599). */
export const PHYSICAL_AIMS = ['fewer physical interfaces', 'elements that can be tested separately', 'compatible technology', 'proximity in space', 'ease of handling', 'shared resources', 'modularity', 'resilience'] as const

export type FlowKind = 'information' | 'energy' | 'material'
/** Flow items between functions: data, materials and/or energies (R20b p.587). People and aircraft moved through the
 *  system count as material flows in the course's tables (course convention). */
export const FLOW_KINDS: { id: FlowKind; label: string }[] = [
  { id: 'information', label: 'Information (data)' },
  { id: 'energy', label: 'Energy' },
  { id: 'material', label: 'Material (including people and vehicles moved)' },
]

/** The guideline of five plus or minus two elements in one level (R20c p.597): an advisory, never a gate. */
export const SPAN = { low: 3, high: 7 } as const

// ---------------------------------------------------------------------------------------------------- gates
/** Hard gates: defects any reviewer would reject on sight. The tool does not count an entry that fails one. Advisories are
 *  signs of a likely defect that can also occur in good work; the tool shows them and never blocks on them. */
// Each hard gate below is justified by a sentence of the Week 4 lecture (the table in
// docs/lectures/week04/WEEK4_REVIEW_DISPOSITIONS.md quotes it). Word minimums are set at the shortest valid entry the
// lecture's own examples allow, so a short but valid entry is never rejected for its form (Week 2 review M1; Week 4 M2).
// Gate sweep 2026-10-19: free-text gates require only that something is written; the one stated word minimum left is the
// allocation sentence (two words). See docs/lectures/GATE_SWEEP_2026-10-19.md.
export const VIEWPOINT_GATES = [
  { id: 'kind', short: 'a view kind chosen' },
  { id: 'purpose', short: 'a purpose: the question the view answers' },
  { id: 'stakeholders', short: 'the stakeholders it serves and their concern, in words or as a concern ID (CON-001)' },
  { id: 'serves', short: 'every need, capability or requirement it names exists in the record' },
  { id: 'form', short: 'its conventions: the form of the view and the element types it shows' },
] as const
export const FUNCTION_GATES = [
  { id: 'name', short: 'a name that is not the name of a logical or physical element' },
  { id: 'io', short: 'at least one input and one output' },
  { id: 'capability', short: 'derived from at least one capability that exists in the record' },
  { id: 'scenario', short: 'exercised in a scenario that exists, or marked as a planning function with the reason' },
  { id: 'group', short: 'placed under a first-level function' },
  { id: 'known', short: 'every requirement allocated to it exists in the record' },
] as const
export const ALLOCATION_GATES = [
  { id: 'logical', short: 'performed by a logical element that exists' },
  { id: 'physical', short: 'allocated to a physical element that exists' },
  { id: 'consistent', short: 'the physical element is one its logical element is allocated to' },
  { id: 'criterion', short: 'an allocation criterion and a one-sentence justification (at least two words)' },
] as const
export const DECISION_GATES = [
  { id: 'question', short: 'the architecture question' },
  { id: 'alternatives', short: 'at least three alternatives considered, one per line' },
  { id: 'chosen', short: 'the chosen alternative, which is one of those listed (case, list markers and final punctuation ignored)' },
  { id: 'rationale', short: 'a rationale' },
  { id: 'links', short: 'at least one need, requirement or risk it affects that exists in the record' },
] as const
export const INFO_GATES = [
  { id: 'name', short: 'a name and its content' },
  { id: 'data-information', short: 'the raw data and the information made from it, each in words, and not the same text' },
  { id: 'producer', short: 'at least one producer that is a physical element, an external element or an AI capability in the record' },
  { id: 'consumer', short: 'at least one consumer that is a physical element, an external element or an AI capability in the record' },
  { id: 'decision', short: 'the decision it supports' },
  { id: 'decision-ref', short: 'the function, requirement or decision that decision belongs to, existing in the record' },
] as const
export const AI_GATES = [
  { id: 'host', short: 'hosted on a physical element that exists' },
  { id: 'function', short: 'supports a function that exists' },
  { id: 'inputs', short: 'at least one input information item that exists' },
  { id: 'outputs', short: 'its outputs, in words' },
  { id: 'oversight', short: 'the human oversight: who decides, and what the AI may not do (“none” is not oversight)' },
  { id: 'failure', short: 'at least one failure mode and its effect' },

] as const
export const VIEWPOINT_ADVISORIES = [
  { id: 'no-serves', short: 'no need, capability or requirement named: the tool cannot show which of your needs this view helps check' },
] as const
export const FUNCTION_ADVISORIES = [
  { id: 'one-word', short: 'a one-word name: add the object the action works on (verb and object)' },
  { id: 'thing-name', short: 'the name looks like a thing (system, platform, app, unit, module …): name the action, verb and object' },
  { id: 'no-requirement', short: 'no requirement is allocated to it: fine for a planning function, otherwise check the trace' },
] as const
export const INFO_ADVISORIES = [
  { id: 'no-route', short: 'say how the item travels from producer to consumer; Week 5 turns that route into an interface' },
  { id: 'ai-producer', short: 'an AI capability produces this item: its card must say who reviews the output before it is used, and what the AI may not decide alone' },
  { id: 'same-element', short: 'producer and consumer are the same element: an internal item, not an information flow between elements' },
  { id: 'personal', short: 'the content looks personal (name, address, health, payment …): record its sensitivity' },
] as const
export type ViewpointGateId = (typeof VIEWPOINT_GATES)[number]['id']
export type ViewpointAdvisoryId = (typeof VIEWPOINT_ADVISORIES)[number]['id']
export type FunctionGateId = (typeof FUNCTION_GATES)[number]['id']
export type AllocationGateId = (typeof ALLOCATION_GATES)[number]['id']
export type DecisionGateId = (typeof DECISION_GATES)[number]['id']
export type InfoGateId = (typeof INFO_GATES)[number]['id']
export type AiGateId = (typeof AI_GATES)[number]['id']
export type FunctionAdvisoryId = (typeof FUNCTION_ADVISORIES)[number]['id']
export type InfoAdvisoryId = (typeof INFO_ADVISORIES)[number]['id']

/** Words that make a function name read as a thing rather than an action (advisory only: "Monitor the system" is fine,
 *  so the advisory fires only when the name ENDS in one of these words or is one of them with a modifier). */
export const THING_WORDS = ['system', 'systems', 'platform', 'app', 'application', 'unit', 'module', 'server', 'database', 'software', 'device', 'station', 'subsystem', 'center', 'facility', 'tool', 'charger', 'sensor', 'controller', 'computer', 'network']

// ---------------------------------------------------------------------------------------------------- parts
/** The ID prefixes Week 4 adds to the record, and the lead role that owns each (course convention). */
export const WEEK4_PREFIXES = [
  { prefix: 'VP', owner: 'Architecture (the view set, with the whole team)' },
  { prefix: 'FG / FN', owner: 'each member walks one scenario; Requirements & Compliance keeps the capability trace' },
  { prefix: 'LOG / PHY / EXT', owner: 'Architecture' },
  { prefix: 'DEC', owner: 'Architecture, with the whole team' },
  { prefix: 'INFO / AI', owner: 'AI & Data Management' },
] as const

/** The parts the Week 4 work adds to the Team Record (outline §5.5). */
export const WEEK4_PARTS = [
  { n: 15, id: 'views', title: 'Architecture viewpoints and views' },
  { n: 16, id: 'functions', title: 'Functional architecture: functions and decomposition' },
  { n: 17, id: 'allocation', title: 'Logical and physical architecture: allocation and decision' },
  { n: 18, id: 'information', title: 'Information view and AI capabilities' },
] as const

/** The four consistency checks of the architecture description (Session 2; course convention built on MITRE's "know the
 *  relationships", R62 p.345). Each is computed by the lab tool and in the AeroLink case. */
export const CONSISTENCY_CHECKS = [
  'every function derives from a capability and, unless it is a planning function, from a scenario',
  'every function is allocated to one physical element that its logical element reaches',
  'every system requirement is allocated to a function or a physical element',
  'every information item has a producer, a consumer and the decision it supports',
] as const
