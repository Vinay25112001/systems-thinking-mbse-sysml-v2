// Week 2 lab brief: the single source of the Lab L2 minimums, the scenario and requirement record fields, the
// requirement types and verification methods, and the quality gate (which checks are hard gates and which are advisory
// warnings). Read by the Session 2 lecture (lab-brief slide, figures, notes), the lab instructions
// (src/content/lab/week02Lab.ts), the lab tool (src/workbench/week2/*) and their consistency tests. Pure data, no
// imports, so both the content and the workbench layers may depend on it.
//
// Review status: new-pending-review. Minimums are course conventions (outline §5.5), pending faculty approval; the
// three-person minimums follow DECISION_LOG A21 provisional decision 4 (workload proportional to team size).

/** Lab L2 minimums for a team of four (course convention, S2 lab brief). */
export const LAB2_MINIMUMS = {
  scenarios: 3,
  /** Each scenario has at least this many alternate flows, and both a success and a failure end state. */
  alternatesPerScenario: 1,
  mainSteps: 3,
  capabilities: 5,
  requirements: 10,
  stakeholderRequirements: 6,
  systemRequirements: 4,
  /** Of the four course types (functional, performance, interface, constraint). */
  types: 3,
  moes: 3,
  mops: 3,
} as const

/** A three-person team: minimums reduced in proportion to team size (DECISION_LOG A21 provisional decision 4, pending
 *  faculty confirmation). The fixed work (the ConOps narrative, the coverage check, integration) does not shrink with
 *  the team, so the scenario minimum drops to two (nominal and off-nominal; a support scenario is recommended) and the
 *  capability, requirement and measure minimums drop, keeping the out-of-class load per person close to a team of four's
 *  (week2Path.ts THREE_PERSON computes it). */
export const LAB2_MINIMUMS_THREE = {
  scenarios: 2,
  alternatesPerScenario: 1,
  mainSteps: 3,
  capabilities: 3,
  requirements: 6,
  stakeholderRequirements: 4,
  systemRequirements: 2,
  types: 3,
  moes: 2,
  mops: 2,
} as const

/** The scenario kinds the set must contain at least once (course minimum, S1.12): all three for a team of four;
 *  nominal and off-nominal for a team of three (support recommended). */
export const REQUIRED_KINDS = ['nominal', 'off-nominal', 'support'] as const
export const REQUIRED_KINDS_THREE = ['nominal', 'off-nominal'] as const

/** Lab L2 out of class in person-hours for a team of four (outline §5.7; course estimate, checked against logged hours).
 *  Kept here (pure data) so the Session 2 notes and week2Path.ts read one source. */
export const LAB2_PERSON_HOURS: { task: string; hours: number }[] = [
  { task: 'ConOps narrative and environment', hours: 1.5 },
  { task: 'scenarios (3 × 1.0)', hours: 3.0 },
  { task: 'discovery log and coverage matrix', hours: 1.0 },
  { task: 'capabilities', hours: 1.0 },
  { task: 'requirements', hours: 2.5 },
  { task: 'trace audit and measures', hours: 1.0 },
  { task: 'integration review and AI usage statement', hours: 0.5 },
]
export const LAB2_TEAM_HOURS = Math.round(LAB2_PERSON_HOURS.reduce((a, t) => a + t.hours, 0) * 10) / 10

export type Lab2Minimums = { [K in keyof typeof LAB2_MINIMUMS]: number }

/** The three scenario kinds every set must contain at least once (course minimum, S1.12). */
export const SCENARIO_KINDS = [
  { id: 'nominal', label: 'Nominal', meaning: 'the normal, successful use of the system' },
  { id: 'off-nominal', label: 'Off-nominal', meaning: 'a disruption or failure: the environment or a part does not behave as planned' },
  { id: 'support', label: 'Support', meaning: 'an enabling activity such as charging, maintenance, training or supply' },
] as const
export type ScenarioKindId = (typeof SCENARIO_KINDS)[number]['id']

/** The course scenario template (course convention, built on R59 pp.453–454): the seven fields, in order. */
export const SCENARIO_FIELDS = [
  { id: 'actors', label: 'Actors', help: 'Parties outside the scenario system of interest; mark the primary actor and any environmental factor “(environment)”.' },
  { id: 'trigger', label: 'Trigger', help: 'The event that starts the scenario.' },
  { id: 'preconditions', label: 'Preconditions', help: 'What must already be true when the trigger occurs.' },
  { id: 'main', label: 'Main flow', help: 'Numbered steps, each with the actor who performs it.' },
  { id: 'alternates', label: 'Alternate flows', help: 'Each branches from a step, and rejoins a later step or ends.' },
  { id: 'success', label: 'Success end state', help: 'What is observably true when the actor’s goal is met.' },
  { id: 'failure', label: 'Failure end state', help: 'What is observably true when the goal is not met, and how it is left safe.' },
] as const

/** The course's four requirement types (course convention; SEBoK's five categories, R13 p.560, are the second lens). */
export const REQ_TYPES = [
  { id: 'functional', label: 'Functional' },
  { id: 'performance', label: 'Performance' },
  { id: 'interface', label: 'Interface' },
  { id: 'constraint', label: 'Constraint' },
] as const
export type ReqTypeId = (typeof REQ_TYPES)[number]['id']

/** The course's four verification methods; "inspection" is the DoD's "examination" (R49 p.149; R16 p.769). */
export const VER_METHODS = [
  { id: 'inspection', label: 'Inspection' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'demonstration', label: 'Demonstration' },
  { id: 'test', label: 'Test' },
] as const
export type VerMethodId = (typeof VER_METHODS)[number]['id']

/** The course minimum requirement record (course convention, S2 anatomy slide): every requirement carries these. */
export const REQ_RECORD_FIELDS = ['ID', 'name', 'statement', 'type', 'measurable criterion or a TBD/TBR linked to an unknown', 'rationale', 'parent(s)', 'verification method', 'owner'] as const
export const REQ_RECORD_TEXT = REQ_RECORD_FIELDS.join('; ')

/** The quality gate as the lecture states it. HARD gates are defects any reviewer would reject on sight; the tool
 *  refuses to count a requirement that fails one. ADVISORY warnings are word-level signs of a likely defect that can
 *  also occur in a good requirement (R13 p.566: requirement verification is a review activity); the tool shows them
 *  and never blocks on them. */
export const REQ_HARD_GATES = [
  { id: 'one-shall', short: 'exactly one “shall”', why: 'no “shall” is not binding; two are two obligations (singular)' },
  { id: 'subject', short: 'a subject before “shall”', why: 'the service (stakeholder level) or a named element or function (system level)' },
  { id: 'parent', short: 'a parent that exists in the record', why: 'no orphans; a stakeholder requirement never derives from a system requirement' },
  { id: 'type', short: 'a type', why: 'so the set can be checked for gaps by type' },
  { id: 'method', short: 'a verification method', why: 'every requirement must have a verification method identified' },
  { id: 'criterion', short: 'a verification criterion', why: 'how a verifier decides pass or fail' },
  { id: 'performance-value', short: 'a value or a TBD/TBR on every performance requirement', why: 'performance requirements are quantifiable' },
  { id: 'tbx-owned', short: 'every TBD/TBR linked to an unknown with an owner', why: 'an untracked TBD becomes risk' },
  { id: 'rationale', short: 'a rationale that is not a restatement', why: 'why it is needed, its assumptions and the source of its numbers' },
  { id: 'unmeasurable', short: 'no unmeasurable word (easy to use, quickly, adequate, safe, quiet, maximize …) unless a bounded value or a TBD/TBR defines it', why: 'two readers could disagree about compliance; MITRE names “easy to use”, “maximize” and “minimize” as defects' },
] as const
/** The words the "unmeasurable" hard gate blocks when the statement has no bounded value and no TBD/TBR (review M4).
 *  A narrow list on purpose: words that can never define compliance by themselves. Other vague words stay advisory. */
export const UNMEASURABLE_TERMS = ['easy to use', 'user-friendly', 'user friendly', 'quick', 'quickly', 'fast', 'rapid', 'rapidly', 'adequate', 'adequately', 'as appropriate', 'as possible', 'safe', 'safely', 'unsafe', 'quiet', 'quietly', 'maximize', 'maximise', 'minimize', 'minimise', 'optimize', 'optimise'] as const
export const REQ_ADVISORIES = [
  { id: 'vague', short: 'a vague word (quickly, adequate, user-friendly …)' },
  { id: 'maximize', short: '“maximize” or “minimize”' },
  { id: 'negative', short: '“shall not”' },
  { id: 'single-point', short: 'a single-point value with no bound or range' },
  { id: 'design', short: 'wording that may name a design (using, via, a product or rating)' },
  { id: 'compound', short: '“and” or “or” joining two actions' },
  { id: 'method-fit', short: 'a method that may not fit the type (for example a performance value checked by inspection)' },
] as const
export const REQ_GATE_TEXT = REQ_HARD_GATES.map((g) => g.short).join('; ')
export type ReqGateId = (typeof REQ_HARD_GATES)[number]['id']
export type ReqAdvisoryId = (typeof REQ_ADVISORIES)[number]['id']

/** The trace audit's disposition vocabulary (S2.13; review M7): one set for the lecture, the lab, the tool and the case.
 *  Every finding of the audit (a childless need, a childless stakeholder requirement, a need covered only in part)
 *  receives one of the three. */
export const AUDIT_DISPOSITIONS = [
  { id: 'write', label: 'Write the requirement', meaning: 'the missing child is written now, with a TBD where a value is unknown' },
  { id: 'link', label: 'Link the real parent', meaning: 'the child exists but its link was missing; link it to the parent it really comes from, never to one that only makes the matrix look complete' },
  { id: 'record', label: 'Record why not', meaning: 'no child yet, with the reason written down, in one of two forms' },
] as const
/** The two forms of "record why not" (the S2.13 figure marks them O and R). */
export const RECORD_WHY_NOT_FORMS = [
  { id: 'open', mark: 'O', label: 'open item', meaning: 'what is missing, who closes it and the target week' },
  { id: 'no-child', mark: 'R', label: 'no child needed', meaning: 'why no lower-level requirement will carry it, for example because it is verified at service level' },
] as const
export const AUDIT_DISPOSITION_TEXT = `${AUDIT_DISPOSITIONS.map((d) => d.label.toLowerCase()).join(', ').replace(/, (?=[^,]*$)/, ', or ')} (${RECORD_WHY_NOT_FORMS.map((f) => `${f.label}: ${f.meaning}`).join('; or ')})`

/** The ID prefixes Week 2 adds to the record, and the lead role that owns each (course convention, S2 lab plan). */
export const WEEK2_PREFIXES = [
  { prefix: 'SCN', owner: 'each member owns one scenario; Verification & Validation reviews' },
  { prefix: 'CAP', owner: 'Architecture' },
  { prefix: 'REQ-STK', owner: 'Requirements & Compliance' },
  { prefix: 'REQ-SYS', owner: 'Requirements & Compliance' },
  { prefix: 'MOE', owner: 'AI & Data Management' },
  { prefix: 'MOP', owner: 'AI & Data Management' },
  { prefix: 'U / A', owner: 'Requirements & Compliance (the uncertainty register)' },
] as const

/** The parts the Week 2 work appends to the Week 1 Team Record (outline §5.5). */
export const WEEK2_PARTS = [
  { n: 7, id: 'conops', title: 'ConOps narrative' },
  { n: 8, id: 'scenarios', title: 'Operational scenarios' },
  { n: 9, id: 'capabilities', title: 'Capabilities and the needs × scenarios coverage' },
  { n: 10, id: 'requirements', title: 'Stakeholder and system requirements' },
  { n: 11, id: 'audit', title: 'Trace audit and measures (MOE, MOP)' },
] as const

/** The scenario-clinic criteria the instructor checks in class (S2 clinic slide; R59 pp.453–455). */
export const CLINIC_CRITERIA = ['the named actor is outside the scenario system of interest', 'the trigger is an event', 'the failure end state is observable'] as const
