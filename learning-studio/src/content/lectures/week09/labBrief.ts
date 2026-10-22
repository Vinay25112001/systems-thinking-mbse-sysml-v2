// Week 9 lab brief: the single source of the Lab L9 rules: how each Phase I need and requirement becomes a SysML v2
// element (the course mapping for this week), the quantity kinds and comparisons the lab tool can formalize, the finding
// classes of the requirements audit, the deliverables, the minimums and the out-of-class workload. Read by the Session 2
// lecture, the lab instructions (src/content/lab/week09Lab.ts), the lab tool (src/workbench/week9/*) and their
// consistency tests. Pure data, no imports, so both the content and the workbench layers may depend on it.
//
// Review status: new-pending-review. The mapping, the shared-form names and the audit classes are COURSE CONVENTIONS:
// the SysML v2 texts give the constructs (requirement, subject, stakeholder, frame, assume/require, Derivation,
// StatusInfo), not a method for moving a document package into a model (outline §9 gaps 1-2). The three-person scope
// follows DECISION_LOG A21 provisional decision 4 (workload proportional to team size).

/** One row of the Week 9 artifact-to-model mapping (course convention). */
export type W9Mapping = { artifact: string; from: string; becomes: string; where: string }
export const W9_MAPPING: W9Mapping[] = [
  { artifact: 'Mission and objectives (MGO)', from: 'Week 1 proposal', becomes: 'requirement usage with the enterprise as subject; the statement as doc', where: 'Needs' },
  { artifact: 'Stakeholder need (NEED)', from: 'Week 1 needs (and needs added in Week 2)', becomes: 'requirement usage: subject the enterprise, a stakeholder parameter typed by the stakeholder part definition, frame for each concern it answers; statement, condition and rationale as doc', where: 'Needs' },
  { artifact: 'Need serves an objective', from: 'Week 1 need: objective served', becomes: 'dependency tagged #serves, from the need (client) to the mission or objective (supplier)', where: 'Needs' },
  { artifact: 'Stakeholder requirement (REQ-STK)', from: 'Week 2 requirements', becomes: 'requirement usage: subject the enterprise, doc, attribute for the limit, require constraint over a feature of the enterprise', where: 'Requirements' },
  { artifact: 'System requirement (REQ-SYS)', from: 'Week 2 requirements (and later Phase I weeks)', becomes: 'requirement usage: subject the element the “shall” is about (a placeholder part definition until Weeks 10–11), doc, limit, require constraint', where: 'Requirements' },
  { artifact: 'Criterion', from: 'Week 2 criterion', becomes: 'required constraint: measured feature, comparison, limit with unit', where: 'inside the requirement' },
  { artifact: 'Type, method, criterion text', from: 'Week 2 attributes', becomes: '@RequirementAttributes metadata (method as VerificationMethodKind)', where: 'inside the requirement' },
  { artifact: 'Rationale', from: 'Week 2 rationale', becomes: '@Rationale metadata', where: 'inside the requirement' },
  { artifact: 'TBD or TBR value', from: 'Week 2 statement token and unknown (U) owner', becomes: 'the limit left unbound, @StatusInfo with status tbd (TBD) or tbc (TBR) and the owner', where: 'inside the requirement' },
  { artifact: 'Parent link to a need or requirement', from: 'Week 2 parents', becomes: '#derivation connection: #original the parent, #derive the child', where: 'Requirements' },
  { artifact: 'Parent link to a capability (CAP)', from: 'Week 2 parents', becomes: 'recorded as pending: the capability is modeled in Week 10, then linked', where: 'trace matrix' },
  { artifact: 'Requirement group', from: 'course convention', becomes: 'one group per level: a specification group of the stakeholder requirements (they share the enterprise as subject) and an organizing group of the system requirements (they keep their own unbound subjects)', where: 'Requirements' },
]

// ------------------------------------------------------------------------------------------- formalization vocabulary
/** The quantity kinds the lab tool can write as a typed limit (course convention). Each unit symbol was accepted by the
 *  course checker (release 2026-08) in a probe of 2026-10-21; the percent and count kinds have no unit and use Real or
 *  Natural values. */
export type QuantityId = 'duration' | 'length' | 'speed' | 'power' | 'mass' | 'temperature' | 'sound' | 'percent' | 'ratio' | 'count'
export const QUANTITIES: { id: QuantityId; label: string; type: string; units: string[]; defName: string }[] = [
  { id: 'duration', label: 'Duration', type: 'DurationValue', units: ['s', 'min', 'h'], defName: 'Duration' },
  { id: 'length', label: 'Length or distance', type: 'LengthValue', units: ['m', 'km'], defName: 'Length' },
  { id: 'speed', label: 'Speed', type: 'SpeedValue', units: ['m/s', 'km/h'], defName: 'Speed' },
  { id: 'power', label: 'Power', type: 'PowerValue', units: ['W', 'kW'], defName: 'Power' },
  { id: 'mass', label: 'Mass', type: 'MassValue', units: ['kg'], defName: 'Mass' },
  { id: 'temperature', label: 'Temperature', type: 'ThermodynamicTemperatureValue', units: ['°C'], defName: 'Temperature' },
  { id: 'sound', label: 'Sound level', type: 'SoundPressureLevelValue', units: ['dB'], defName: 'SoundLevel' },
  { id: 'percent', label: 'Percentage (0–100, no unit)', type: 'Real', units: [], defName: 'Percentage' },
  { id: 'ratio', label: 'Ratio (no unit)', type: 'Real', units: [], defName: 'Ratio' },
  { id: 'count', label: 'Count of events or items (whole number)', type: 'Natural', units: [], defName: 'Count' },
]
export const quantityOf = (id: string) => QUANTITIES.find((q) => q.id === id)

/** The comparisons a required constraint may use, with the prefix of the generated limit attribute and the name part
 *  of a shared requirement definition. */
export type OpId = '<=' | '<' | '>=' | '>' | '=='
export const OPS: { id: OpId; label: string; limitPrefix: string; defPart: string }[] = [
  { id: '<=', label: 'at most (≤)', limitPrefix: 'max', defPart: 'UpperLimit' },
  { id: '<', label: 'less than (<)', limitPrefix: 'max', defPart: 'StrictUpperLimit' },
  { id: '>=', label: 'at least (≥)', limitPrefix: 'min', defPart: 'LowerLimit' },
  { id: '>', label: 'more than (>)', limitPrefix: 'min', defPart: 'StrictLowerLimit' },
  { id: '==', label: 'exactly (=)', limitPrefix: 'required', defPart: 'RequiredValue' },
]
export const opOf = (id: string) => OPS.find((o) => o.id === id)

/** Week 2 verification methods and the library enumeration literal each becomes (VerificationMethodKind, R84 p.175). */
export const METHOD_KIND: Record<string, string> = { inspection: 'inspect', analysis: 'analyze', demonstration: 'demo', test: 'test' }

// ------------------------------------------------------------------------------------------- audit findings
/** Finding classes of the Week 9 requirements audit (course convention, the Week 8 classes kept). Only a `defect` keeps
 *  something out of the generated file, and only where writing it would make the file fail the checker (a reference to
 *  an element that does not exist). */
export type W9FindingClass = 'defect' | 'gap' | 'trace' | 'info'
export const W9_FINDING_CLASSES: { id: W9FindingClass; label: string; meaning: string }[] = [
  { id: 'defect', label: 'Defect (left out of the file)', meaning: 'Writing it would refer to something that is not in your model, so the checker would fail. It is left out of the generated file and listed; correct the Week 1, Week 2 or Week 8 file and import again.' },
  { id: 'gap', label: 'Gap (fix it in the tool, or record why not)', meaning: 'The element is generated, but something the course expects is missing: a stakeholder, a framed concern, a formal constraint, a subject, an owner. Fix it here where the tool allows; otherwise write a disposition.' },
  { id: 'trace', label: 'Trace finding (needs a disposition)', meaning: 'A need with no stakeholder requirement, a stakeholder requirement with no system requirement, or a requirement with no parent. Record what the team will do and why: an open item with an owner, or no child needed with the reason.' },
  { id: 'info', label: 'Information', meaning: 'Recorded for the trace matrix (for example, a parent capability that Week 10 models). No action this week.' },
]

/** A disposition that claims the work is complete while the finding is still computed from the exports is refused: a
 *  fix is shown by re-exporting the corrected week, not by a sentence (Week 7 review M2). */
export const COMPLETION_CLAIM = /\b(fixed|resolved|done|closed|corrected|completed?|covered now|withdrawn)\b/i

// ------------------------------------------------------------------------------------------- deliverables and minimums
export const LAB9_OUTPUTS = [
  { file: 'team-NN-model-v02.sysml', what: 'model v0.2: model v0.1 with the Needs and Requirements packages modeled, the derivation connections, the placeholder subjects and the requirement metadata' },
  { file: 'team-NN-trace-matrix.md', what: 'the needs-to-requirements trace matrix, the requirements mapping table, the trace audit with a disposition for every finding, the partly covered needs (open items), the trace-audit note, and the AI review log' },
  { file: 'team-NN-checker-log.txt', what: 'the checker output of the final run of model v0.2: zero errors, every warning explained' },
] as const

/** Completeness minimums for model v0.2 (course convention, proposed; outline §5.5). */
export const LAB9_MINIMUMS = {
  /** Every Week 1 need and every Week 2 requirement in the model (none left out except as a recorded defect). */
  coverage: 1.0,
  /** At least one shared requirement definition used by at least this many requirements (or a stated reason). */
  sharedUsages: 2,
  /** AI review findings with a decision and a reason: team of four, team of three. */
  aiFindings: 8,
  aiFindingsThree: 6,
} as const
/** The four categories an AI review finding is filed under (Session 2, AI-assisted quality assessment). */
export const AI_CATEGORIES = ['ambiguity', 'duplication', 'conflict', 'missing information'] as const

/** Lab L9 out of class in person-hours for a team of four (course estimate; the lab tool writes the first draft of
 *  every element from the exports, so the work is choosing subjects and constraints, reviewing and completing). */
export const LAB9_PERSON_HOURS: { task: string; hours: number }[] = [
  { task: 'needs package: stakeholders and framed concerns checked against the Week 1 register', hours: 1.2 },
  { task: 'mission and objectives', hours: 0.3 },
  { task: 'stakeholder requirements: measured feature, comparison and limit for each', hours: 2.0 },
  { task: 'system requirements: subjects and placeholders, constraints, one shared definition', hours: 2.4 },
  { task: 'derivations, groups, metadata and TBD status reviewed', hours: 1.0 },
  { task: 'AI-assisted quality review and its log', hours: 1.4 },
  { task: 'checker runs to zero errors, warnings explained', hours: 0.8 },
  { task: 'trace audit: a disposition for every finding', hours: 0.5 },
  { task: 'integration review and AI usage statement', hours: 0.4 },
]
/** A three-person team: the same tasks at a reduced scope, so the load per person stays that of a team of four. */
export const LAB9_PERSON_HOURS_THREE: { task: string; hours: number; scope: string }[] = [
  { task: 'needs package: stakeholders and framed concerns checked against the Week 1 register', hours: 0.9, scope: 'every need modeled; framing checked on every need, contributing stakeholders recorded in doc only' },
  { task: 'mission and objectives', hours: 0.2, scope: 'as generated, reviewed once' },
  { task: 'stakeholder requirements: measured feature, comparison and limit for each', hours: 1.5, scope: 'as for a team of four' },
  { task: 'system requirements: subjects and placeholders, constraints, one shared definition', hours: 1.8, scope: 'the shared definition optional, with a one-line reason if none is used' },
  { task: 'derivations, groups, metadata and TBD status reviewed', hours: 0.8, scope: 'as for a team of four' },
  { task: 'AI-assisted quality review and its log', hours: 1.0, scope: `at least ${LAB9_MINIMUMS.aiFindingsThree} findings dispositioned` },
  { task: 'checker runs to zero errors, warnings explained', hours: 0.6, scope: 'as for a team of four' },
  { task: 'trace audit: a disposition for every finding', hours: 0.4, scope: 'as for a team of four' },
  { task: 'integration review and AI usage statement', hours: 0.3, scope: 'one review pass by the whole team' },
]
/** The individual applied exercise (Assessment page, tasks 1–5). */
export const EXERCISE_MINUTES = 45
const round1 = (x: number) => Math.round(x * 10) / 10
export const LAB9_TEAM_HOURS = round1(LAB9_PERSON_HOURS.reduce((a, t) => a + t.hours, 0))
export const LAB9_TEAM_HOURS_THREE = round1(LAB9_PERSON_HOURS_THREE.reduce((a, t) => a + t.hours, 0))

/** The suggested seven-day plan of Lab L9 (Session 2 close; course convention): task, first and last day, lead role. */
export const SEVEN_DAY_PLAN: { task: string; from: number; to: number; lead: string }[] = [
  { task: 'checkpoint fix', from: 1, to: 1, lead: 'Requirements & Compliance' },
  { task: 'needs and frames', from: 1, to: 2, lead: 'Requirements & Compliance' },
  { task: 'stakeholder reqs', from: 2, to: 3, lead: 'each member at least three' },
  { task: 'system reqs, subjects', from: 2, to: 4, lead: 'Architecture; each member at least three' },
  { task: 'derivations, metadata', from: 3, to: 4, lead: 'Verification & Validation' },
  { task: 'AI review and log', from: 5, to: 5, lead: 'AI & Data Management' },
  { task: 'checker and audit', from: 6, to: 6, lead: 'Verification & Validation' },
  { task: 'upload', from: 7, to: 7, lead: 'Verification & Validation' },
]
