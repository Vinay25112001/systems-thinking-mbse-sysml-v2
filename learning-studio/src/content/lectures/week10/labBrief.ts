// Week 10 lab brief: the single source of the Lab L10 rules: how each Phase I element of the Week 2 ConOps and the Week 4
// architecture description becomes a SysML v2 element (the course mapping for this week), the finding classes of the
// behavior audit, the behavior review checklist, the deliverables, the minimums and the out-of-class workload. Read by
// the Session 2 lecture, the lab instructions (src/content/lab/week10Lab.ts), the lab tool (src/workbench/week10/*) and
// their consistency tests. Pure data, no imports, so both the content and the workbench layers may depend on it.
//
// Review status: new-pending-review. The mapping, the keyword #derivedFrom, the step-to-function subsetting and the audit
// classes are COURSE CONVENTIONS: the SysML v2 texts give the constructs (part, action, item, perform, allocate, decide,
// merge, flow, state, transition, exhibit, use case), not a method for moving a document package into a model (outline
// §9). The three-person scope follows DECISION_LOG A21 provisional decision 4 (workload proportional to team size).

/** One row of the Week 10 artifact-to-model mapping (course convention). */
export type W10Mapping = { artifact: string; from: string; becomes: string; where: string }
export const W10_MAPPING: W10Mapping[] = [
  { artifact: 'Capability (CAP)', from: 'Week 2 capabilities', becomes: 'action definition with the capability ID as short name and its statement as doc', where: 'Logical' },
  { artifact: 'Information item (INFO)', from: 'Week 4 information view', becomes: 'item definition with the item ID as short name', where: 'Logical' },
  { artifact: 'Function (FN)', from: 'Week 4 functional decomposition', becomes: 'action usage with the function ID as short name; an in parameter for each item it consumes and an out parameter for each item it produces', where: 'Logical' },
  { artifact: 'Function serves a capability', from: 'Week 4 function: capabilities', becomes: 'dependency tagged #derivedFrom, from the function (client) to the capability (supplier)', where: 'Logical' },
  { artifact: 'Logical element (LOG)', from: 'Week 4 logical elements', becomes: 'part definition (a Week 9 placeholder of the same name is reused, or specialized) and a part usage with the LOG ID inside the part logicalArchitecture', where: 'Logical' },
  { artifact: 'Function allocated to a logical element', from: 'Week 4 allocation: function → logical element', becomes: 'perform inside the logical part usage: the part is the performer', where: 'Logical' },
  { artifact: 'Requirement allocated to a function', from: 'Week 4 function: requirements', becomes: 'allocate from the requirement to the function', where: 'Logical' },
  { artifact: 'Requirement traced to a capability', from: 'Week 2 parents (waiting since Week 9)', becomes: 'dependency tagged #derivedFrom, from the requirement (client) to the capability (supplier); a derivation connection cannot end on a capability', where: 'Logical' },
  { artifact: 'Operational scenario (SCN)', from: 'Week 2 ConOps', becomes: 'use case usage: subject the enterprise, an actor for each modeled actor, the success end state as objective; trigger, preconditions and failure end state in doc', where: 'Behavior' },
  { artifact: 'Scenario steps and alternates (one scenario)', from: 'Week 2 ConOps', becomes: 'the action flow inside the use case: one action per step (subsetting its function where one exists), then successions, a decide with a guard per alternate and else, a merge where an alternate rejoins, done where it ends, and item flows between steps', where: 'Behavior' },
  { artifact: 'Operating modes', from: 'Week 2 ConOps or Week 4 description', becomes: 'state definition: first start then the initial state, states with entry or do functions, transitions with a trigger and optional guard; a state usage exhibited by a part', where: 'Behavior' },
]

// ------------------------------------------------------------------------------------------- audit findings
/** Finding classes of the Week 10 behavior audit (the Week 9 classes kept). Only a `defect` keeps something out of the
 *  generated file, and only where writing it would make the file fail the checker (a reference to something that does
 *  not exist in the model or the imports). */
export type W10FindingClass = 'defect' | 'gap' | 'trace' | 'info'
export const W10_FINDING_CLASSES: { id: W10FindingClass; label: string; meaning: string }[] = [
  { id: 'defect', label: 'Defect (left out of the file)', meaning: 'Writing it would refer to something that is not in your model or your exports, so the checker would fail. It is left out of the generated file and listed; correct the Week 2, Week 4 or Week 9 file and import again, or correct the choice in the tool.' },
  { id: 'gap', label: 'Gap (fix it in the tool, or record why not)', meaning: 'The element is generated, but something the course expects is missing: an item, a performer, an item flow, a guard, a reachable state, an actor type. Fix it here where the tool allows; otherwise write a disposition.' },
  { id: 'trace', label: 'Trace finding (needs a disposition)', meaning: 'A system requirement allocated to no function, a function derived from no capability, a capability no function serves, or a function no scenario exercises. Record what the team will do and why: an open item with an owner, or why no change is needed.' },
  { id: 'info', label: 'Information', meaning: 'Recorded for the review (for example, an ID issued this week). No action.' },
]

/** A disposition that claims the work is complete while the finding is still computed from the exports is refused
 *  (Week 7 review M2; the Week 9 rule kept). */
// Only claim forms count ("Fixed.", "Done", "Resolved in Week 4", "it is closed", "we corrected it"): the same word used
// in a non-claim sense ("Closed site at night: no function") is accepted (Week 10 review m7, the Week 9 m6 class).
export const COMPLETION_CLAIM = /\b(?:is|are|was|were|been|now|already|has|have|we|i)\s+(?:\w+\s+)?(?:fixed|resolved|done|closed|corrected|completed?|withdrawn)\b|^\s*(?:fixed|resolved|done|closed|corrected|completed?|withdrawn)(?:\s*[.!]?\s*$|\s+(?:in|by|on|with|now|it|this|that|as)\b)|\bcovered now\b/i

// ------------------------------------------------------------------------------------------- the review checklist
/** The behavior review checklist (Session 2, course convention from the earlier flow-coverage rules; R72 sl.35-38,
 *  R82 p.146). The team records, for each item, whether the model meets it or what the finding is. The first five are
 *  read against the ConOps by the team; the tool computes the evidence it can (reachability, guards, performers). */
export const REVIEW_CHECKS: { id: string; text: string; tool: string }[] = [
  { id: 'steps', text: 'Every ConOps step and every alternate of the chosen scenario has a node in the flow, in ConOps order', tool: 'The mapping table lists each step and alternate with its node.' },
  { id: 'alternates', text: 'Each alternate is entered from its ConOps step and either ends or rejoins where the ConOps says', tool: 'The mapping table shows the rejoin step or “ends” for each alternate.' },
  { id: 'guards', text: 'Every decision branch has a guard, an else covers the remaining cases, and the guards say what the ConOps condition says', tool: 'The generator writes a guard per alternate and an else; whether the guard means the condition is yours to judge.' },
  { id: 'flows', text: 'Every item flow joins a step that produces the item to a later step that consumes it', tool: 'Item flows are computed from the functions’ out and in items.' },
  { id: 'functions', text: 'Every function has its inputs and outputs and at least one performer', tool: 'Gaps list functions with no input, no output or no performer.' },
  { id: 'states', text: 'Every state is reachable from the initial state, and every transition has a trigger', tool: 'Gaps list unreachable states; the generator writes a trigger on every transition.' },
  { id: 'cross', text: 'Flow and states agree: each step that changes the element’s condition has a transition, and each transition is caused by a step of some scenario', tool: 'The cross-check table pairs steps and transitions; the pairing is yours to judge.' },
  { id: 'allocation', text: 'Every system requirement is allocated to at least one function, or has a disposition', tool: 'Trace findings list unallocated system requirements.' },
]

// ------------------------------------------------------------------------------------------- deliverables and minimums
export const LAB10_OUTPUTS = [
  { file: 'team-NN-model-v03.sysml', what: 'model v0.3: model v0.2 with the Logical package (capabilities, items, functions, the logical architecture with perform, requirement allocations) and the Behavior package (a use case per scenario, one scenario as an action flow, one state definition) modeled' },
  { file: 'team-NN-behavior-review.md', what: 'the scenario mapping table, the function table, the allocation matrix, the state transition table, the cross-check table, the behavior audit with a disposition for every finding, the review checklist results, and the AI usage statement' },
  { file: 'team-NN-checker-log.txt', what: 'the checker output of the final run of model v0.3: zero errors, every warning explained' },
] as const

/** Completeness minimums for model v0.3 (course convention, proposed; outline §5.3 and S2.19). */
export const LAB10_MINIMUMS = {
  /** States and transitions of the one state definition; at least one guarded transition. Team of four. */
  states: 4,
  transitions: 5,
  guards: 1,
  /** Team of three (reduced scope, pending faculty approval). */
  statesThree: 3,
  transitionsThree: 4,
  /** At least one decision and one item flow in the chosen scenario's flow. */
  decisions: 1,
  itemFlows: 1,
} as const

/** Lab L10 out of class in person-hours for a team of four (course estimate; the lab tool writes the first draft of
 *  every element from the exports, so the work is choosing items, mapping the scenario, defining the states,
 *  reviewing and completing). */
export const LAB10_PERSON_HOURS: { task: string; hours: number }[] = [
  { task: 'functions: inputs and outputs from the information view, new items where a flow has none', hours: 1.6 },
  { task: 'logical architecture: performers, Week 9 placeholders linked, requirement allocations checked', hours: 1.0 },
  { task: 'chosen scenario: mapping table, step names, functions, guards, the item flows checked', hours: 2.4 },
  { task: 'operating states: states, transitions, guards, entry and do functions, the exhibitor', hours: 1.4 },
  { task: 'use cases of every scenario: actors and objectives checked', hours: 0.6 },
  { task: 'checker runs to zero errors, warnings explained', hours: 0.8 },
  { task: 'review checklist, cross-check and a disposition for every finding', hours: 1.2 },
  { task: 'integration review and AI usage statement', hours: 0.6 },
]
/** A three-person team: the same tasks at a reduced scope, so the load per person stays that of a team of four. */
export const LAB10_PERSON_HOURS_THREE: { task: string; hours: number; scope: string }[] = [
  { task: 'functions: inputs and outputs from the information view, new items where a flow has none', hours: 1.0, scope: 'items for the functions the chosen scenario uses; the others may wait for the final model (the tool records them, no disposition needed)' },
  { task: 'logical architecture: performers, Week 9 placeholders linked, requirement allocations checked', hours: 1.0, scope: 'as for a team of four' },
  { task: 'chosen scenario: mapping table, step names, functions, guards, the item flows checked', hours: 1.6, scope: 'any scenario with at least one alternate (the one with the fewest keeps the work smallest)' },
  { task: 'operating states: states, transitions, guards, entry and do functions, the exhibitor', hours: 1.0, scope: `at least ${LAB10_MINIMUMS.statesThree} states and ${LAB10_MINIMUMS.transitionsThree} transitions, one guard` },
  { task: 'use cases of every scenario: actors and objectives checked', hours: 0.6, scope: 'as for a team of four' },
  { task: 'checker runs to zero errors, warnings explained', hours: 0.8, scope: 'as for a team of four' },
  { task: 'review checklist, cross-check and a disposition for every finding', hours: 1.0, scope: 'as for a team of four, with fewer item findings to disposition' },
  { task: 'integration review and AI usage statement', hours: 0.5, scope: 'one review pass by the whole team' },
]
/** The individual applied exercise (Assessment page, tasks 1–5). */
export const EXERCISE_MINUTES = 50
const round1 = (x: number) => Math.round(x * 10) / 10
export const LAB10_TEAM_HOURS = round1(LAB10_PERSON_HOURS.reduce((a, t) => a + t.hours, 0))
export const LAB10_TEAM_HOURS_THREE = round1(LAB10_PERSON_HOURS_THREE.reduce((a, t) => a + t.hours, 0))

/** The suggested seven-day plan of Lab L10 (Session 2 close; course convention): task, first and last day, lead role. */
export const SEVEN_DAY_PLAN: { task: string; from: number; to: number; lead: string }[] = [
  { task: 'checkpoint fix', from: 1, to: 1, lead: 'Architecture' },
  { task: 'functions and items', from: 1, to: 2, lead: 'Architecture' },
  { task: 'performers, allocations', from: 2, to: 2, lead: 'Architecture' },
  { task: 'scenario flow', from: 2, to: 3, lead: 'Requirements & Compliance' },
  { task: 'operating states', from: 3, to: 4, lead: 'Verification & Validation' },
  { task: 'use cases', from: 4, to: 4, lead: 'Requirements & Compliance' },
  { task: 'checker runs', from: 5, to: 5, lead: 'AI & Data Management' },
  { task: 'review and audit', from: 6, to: 6, lead: 'Verification & Validation' },
  { task: 'upload', from: 7, to: 7, lead: 'Verification & Validation' },
]
