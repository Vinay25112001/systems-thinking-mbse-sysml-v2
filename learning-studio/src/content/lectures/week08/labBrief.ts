// Week 8 lab brief: the single source of the Lab L8 import rules: how every Phase I ID kind maps to a model package
// and a SysML v2 construct (and in which Phase II week it is modeled), the finding classes of the import audit (which
// findings are real defects that keep an item out of the generated model, and which are gaps the team dispositions),
// the deliverables and the out-of-class workload. Read by the Session 2 lecture, the lab instructions
// (src/content/lab/week08Lab.ts), the lab tool (src/workbench/week8/*) and their consistency tests. Pure data, no
// imports, so both the content and the workbench layers may depend on it.
//
// Review status: new-pending-review. The mapping is a COURSE CONVENTION (the sources give the SysML v2 constructs, not
// a method for migrating a document package into a model; outline §9 gap 1). Week numbers follow COURSE_SCHEDULE.md
// rule 6. The three-person scope follows DECISION_LOG A21 provisional decision 4 (workload proportional to team size).

/** Where a Phase I artifact's IDs come from in the lab tool: the Week 1 export, the Week 2 export, or entered by hand
 *  from the Week 7 package (Weeks 3–6 have no app export yet). */
export type MappingSource = 'week1' | 'week2' | 'manual'

/** One row of the course's artifact-to-model mapping (course convention). `modeledIn` is the Phase II week that
 *  models the kind; 8 means it is modeled this week, any later week means it is mapped now and modeled then. */
export type MappingKind = {
  prefix: string
  /** What the prefix names, in the team's Phase I package. */
  artifact: string
  /** The Phase I week that produced it. */
  phaseWeek: number
  /** The model package that will hold it (the course package structure). */
  pkg: string
  /** The SysML v2 construct it becomes. */
  construct: string
  modeledIn: number
  source: MappingSource
}

export const MAPPING_KINDS: MappingKind[] = [
  { prefix: 'ENT', artifact: 'Enterprise', phaseWeek: 1, pkg: 'Context', construct: 'part def (the enterprise)', modeledIn: 8, source: 'week1' },
  { prefix: 'PRT', artifact: 'Element inside the boundary of the system of interest', phaseWeek: 1, pkg: 'Physical', construct: 'part usage owned by the system-of-interest part', modeledIn: 8, source: 'week1' },
  { prefix: 'EXT', artifact: 'External system in the context', phaseWeek: 1, pkg: 'Context', construct: 'part usage in the context part', modeledIn: 8, source: 'week1' },
  { prefix: 'STK', artifact: 'Stakeholder', phaseWeek: 1, pkg: 'Stakeholders', construct: 'part def (the type of stakeholder parameters)', modeledIn: 8, source: 'week1' },
  { prefix: 'CON', artifact: 'Stakeholder concern', phaseWeek: 1, pkg: 'Stakeholders', construct: 'concern with a subject and stakeholder parameters', modeledIn: 8, source: 'week1' },
  { prefix: 'REL', artifact: 'Stakeholder relationship', phaseWeek: 1, pkg: 'Stakeholders', construct: 'dependency tagged with a relationship keyword', modeledIn: 8, source: 'week1' },
  { prefix: 'MGO', artifact: 'Mission and goals', phaseWeek: 1, pkg: 'Needs', construct: 'requirement with a subject', modeledIn: 9, source: 'week1' },
  { prefix: 'NEED', artifact: 'Stakeholder need', phaseWeek: 1, pkg: 'Needs', construct: 'requirement with stakeholder parameters, framing its concerns', modeledIn: 9, source: 'week1' },
  { prefix: 'SCN', artifact: 'Operational scenario', phaseWeek: 2, pkg: 'Behavior', construct: 'use case with actors', modeledIn: 10, source: 'week2' },
  { prefix: 'CAP', artifact: 'Capability', phaseWeek: 2, pkg: 'Needs', construct: 'action def (named; refined in Week 10)', modeledIn: 10, source: 'week2' },
  { prefix: 'REQ-STK', artifact: 'Stakeholder requirement', phaseWeek: 2, pkg: 'Requirements', construct: 'requirement with a subject, derived from needs', modeledIn: 9, source: 'week2' },
  { prefix: 'REQ-SYS', artifact: 'System requirement', phaseWeek: 2, pkg: 'Requirements', construct: 'requirement with a subject, derived from stakeholder requirements', modeledIn: 9, source: 'week2' },
  { prefix: 'MOE', artifact: 'Measure of effectiveness', phaseWeek: 2, pkg: 'owned by what it measures', construct: 'attribute', modeledIn: 12, source: 'week2' },
  { prefix: 'MOP', artifact: 'Measure of performance', phaseWeek: 2, pkg: 'owned by what it measures', construct: 'attribute', modeledIn: 12, source: 'week2' },
  { prefix: 'VER', artifact: 'Verification method or case', phaseWeek: 2, pkg: 'Verification', construct: 'verification case', modeledIn: 12, source: 'manual' },
  { prefix: 'TPM', artifact: 'Technical performance measure', phaseWeek: 3, pkg: 'owned by what it measures', construct: 'attribute with estimates over time', modeledIn: 12, source: 'manual' },
  { prefix: 'TECH', artifact: 'Technology and its readiness', phaseWeek: 3, pkg: 'Analysis', construct: 'part def with a readiness attribute', modeledIn: 13, source: 'manual' },
  { prefix: 'A', artifact: 'Assumption', phaseWeek: 2, pkg: 'AROU', construct: 'metadata annotation', modeledIn: 13, source: 'week2' },
  { prefix: 'U', artifact: 'Unknown (TBD/TBR)', phaseWeek: 2, pkg: 'AROU', construct: 'metadata annotation', modeledIn: 13, source: 'week2' },
  { prefix: 'R', artifact: 'Risk', phaseWeek: 3, pkg: 'AROU', construct: 'metadata annotation', modeledIn: 13, source: 'manual' },
  { prefix: 'O', artifact: 'Opportunity', phaseWeek: 3, pkg: 'AROU', construct: 'metadata annotation', modeledIn: 13, source: 'manual' },
  { prefix: 'ALT', artifact: 'Trade-study alternative', phaseWeek: 3, pkg: 'Analysis', construct: 'part usage (a configuration)', modeledIn: 13, source: 'manual' },
  { prefix: 'CRIT', artifact: 'Trade-study criterion', phaseWeek: 3, pkg: 'Analysis', construct: 'calculation or attribute of the trade study', modeledIn: 13, source: 'manual' },
  { prefix: 'DEC', artifact: 'Decision record', phaseWeek: 3, pkg: 'Analysis', construct: 'analysis case result, with its rationale in doc', modeledIn: 13, source: 'manual' },
  { prefix: 'FN', artifact: 'Function', phaseWeek: 4, pkg: 'Logical', construct: 'action usage', modeledIn: 10, source: 'manual' },
  { prefix: 'LOG', artifact: 'Logical element', phaseWeek: 4, pkg: 'Logical', construct: 'part def and part usage', modeledIn: 10, source: 'manual' },
  { prefix: 'INFO', artifact: 'Information element', phaseWeek: 4, pkg: 'Physical', construct: 'item def', modeledIn: 11, source: 'manual' },
  { prefix: 'PHY', artifact: 'Component', phaseWeek: 5, pkg: 'Physical', construct: 'part def and part usage', modeledIn: 11, source: 'manual' },
  { prefix: 'IF', artifact: 'Interface', phaseWeek: 5, pkg: 'Physical (external interfaces in Context)', construct: 'interface usage connecting ports', modeledIn: 11, source: 'manual' },
  { prefix: 'INC', artifact: 'Roadmap increment', phaseWeek: 6, pkg: 'Evolution', construct: 'to be decided with the instructor (a configuration per increment is one option)', modeledIn: 14, source: 'manual' },
]

export const mappingOf = (prefix: string): MappingKind | undefined => MAPPING_KINDS.find((k) => k.prefix === prefix)
/** The prefix of a course ID: "REQ-STK-004" → "REQ-STK", "STK-004" → "STK", "A-002" → "A". */
export const prefixOfId = (id: string): string => (/^REQ-(STK|SYS)-/.test(id) ? id.slice(0, 7) : id.replace(/-\d+$/, ''))

/** The course package structure of model v0.1 (the AeroLink reference layout, sysml/reference/README.md §2, plus the
 *  Evolution package that the INC row of the mapping names, filled in Week 14), in order, with the week that fills each
 *  package. Context, Stakeholders and the system-of-interest part of Physical are modeled this week. */
export const MODEL_PACKAGES: { name: string; holds: string; filledIn: number }[] = [
  { name: 'Context', holds: 'the enterprise, the external systems and the context part', filledIn: 8 },
  { name: 'Stakeholders', holds: 'stakeholders, concerns and stakeholder relationships', filledIn: 8 },
  { name: 'Needs', holds: 'the mission, goals and needs; capabilities', filledIn: 9 },
  { name: 'Requirements', holds: 'stakeholder and system requirements', filledIn: 9 },
  { name: 'Behavior', holds: 'use cases for the scenarios; actions and states', filledIn: 10 },
  { name: 'Logical', holds: 'functions and logical elements', filledIn: 10 },
  { name: 'Physical', holds: 'the system of interest and its parts; components, ports and interfaces', filledIn: 8 },
  { name: 'Verification', holds: 'verification cases', filledIn: 12 },
  { name: 'Analysis', holds: 'technologies, the trade study and its decision', filledIn: 13 },
  { name: 'AROU', holds: 'assumptions, risks, opportunities and unknowns', filledIn: 13 },
  { name: 'Evolution', holds: 'the roadmap increments', filledIn: 14 },
]

/** How a Week 1 relationship type becomes a SysML v2 dependency (course convention, one direction rule for the whole
 *  course): `dependency from A to B` means A, the client, depends on B, the supplier: "a change to a supplier element
 *  may result in a change to a client element" (SysML v2.1 Beta 2, Part 1, 7.3, R80 pp.50–51; its example is
 *  `dependency Use from 'Application Layer' to 'Service Layer'`). So every keyword names the CLIENT's relation to the
 *  supplier and reads "from-element keyword to-element".
 *   - `reversed`: the register's verb is active voice from the supplier's side ("FAA regulates the OEM"); the model
 *     writes it from the dependent (the OEM is regulatedBy the FAA): from = the register's target, to = its source.
 *   - `register`: the register already names the dependent first ("the planning authority is affected by the communities", REL-007):
 *     from = the register's source.
 *   - `symmetric`: each end depends on the other; the model records it once, in the register's order, and the
 *     direction carries no meaning.
 *  Each keyword is a basic name, used as the short name of its metadata definition. */
export type RelDirection = 'reversed' | 'register' | 'symmetric'
export const REL_KEYWORDS: Record<string, { keyword: string; def: string; verb: string; reads: string; direction: RelDirection }> = {
  regulates: { keyword: 'regulatedBy', def: 'RegulatedByLink', verb: 'regulates', reads: 'is regulated by', direction: 'reversed' },
  funds: { keyword: 'fundedBy', def: 'FundedByLink', verb: 'funds', reads: 'is funded by', direction: 'reversed' },
  supplies: { keyword: 'suppliedBy', def: 'SuppliedByLink', verb: 'supplies', reads: 'is supplied by', direction: 'reversed' },
  'affected-by': { keyword: 'affectedBy', def: 'AffectedByLink', verb: 'is affected by', reads: 'is affected by', direction: 'register' },
  'partners-with': { keyword: 'partnersWith', def: 'PartnersWithLink', verb: 'partners with', reads: 'partners with', direction: 'symmetric' },
  'coordinates-with': { keyword: 'coordinatesWith', def: 'CoordinatesWithLink', verb: 'coordinates with', reads: 'coordinates with', direction: 'symmetric' },
  'conflicts-with': { keyword: 'conflictsWith', def: 'ConflictsWithLink', verb: 'conflicts with', reads: 'conflicts with', direction: 'symmetric' },
}
/** The client (from) and supplier (to) of a register relationship under the course direction rule. An untyped
 *  relationship keeps the register's order (a plain dependency: the team states the direction in its audit note). */
export function dependencyEnds(r: { from: string; to: string; type: string }): { client: string; supplier: string } {
  return REL_KEYWORDS[r.type]?.direction === 'reversed' ? { client: r.to, supplier: r.from } : { client: r.from, supplier: r.to }
}

// ------------------------------------------------------------------------------------------- import audit findings
/** Finding classes of the import audit (course convention). Only a `defect` keeps an item out of the generated model,
 *  and only where including it would make the file fail the checker or misstate the record; everything else is a
 *  gap the team records with a disposition, or information. */
export type FindingClass = 'defect' | 'gap' | 'unmapped' | 'info'
export const FINDING_CLASSES: { id: FindingClass; label: string; meaning: string }[] = [
  { id: 'defect', label: 'Defect (not imported)', meaning: 'The item cannot be written as valid SysML v2 from the record as it stands (for example, a relationship whose end is not a registered stakeholder). It is left out of the generated file; fix the record and import again.' },
  { id: 'gap', label: 'Gap (needs a disposition)', meaning: 'The item is imported, but the record is incomplete in a way the model will expose (for example, a stakeholder with no concern). Record what the team will do and why in the audit note.' },
  { id: 'unmapped', label: 'Unmapped kind', meaning: 'The package uses an ID kind the course mapping does not cover. Choose a package and a construct and record the reason.' },
  { id: 'info', label: 'Mapped for a later week', meaning: 'The item is mapped now and modeled in the week shown. No action this week.' },
]

/** The four audit questions (Session 2, worked example III), course convention. The lab tool answers the first two
 *  mechanically from the record; the team answers fidelity and gaps. */
export const AUDIT_QUESTIONS = [
  { id: 'completeness', label: 'Completeness', question: 'Does every stakeholder, concern and external system of the Phase I register appear once in the model, with the same ID and name?' },
  { id: 'structure', label: 'Structure', question: 'Does every concern have a subject and at least one stakeholder typed by a stakeholder part definition, and does every stakeholder hold at least one concern?' },
  { id: 'fidelity', label: 'Fidelity', question: 'Does each concern’s documentation say what the register says? Differences are logged, not fixed silently.' },
  { id: 'gaps', label: 'Gaps', question: 'What does the package hold that the model does not yet hold, and what is the disposition of each?' },
] as const

// ------------------------------------------------------------------------------------------- deliverables and minimums
/** What the team submits for Lab L8 (course convention). */
export const LAB8_OUTPUTS = [
  { file: 'team-NN-model-v01.sysml', what: 'model v0.1: the package skeleton with the purpose statement, the Context and Stakeholders packages fully modeled, every later package present with a note of the week that fills it' },
  { file: 'team-NN-mapping-matrix.md', what: 'the artifact-to-model mapping matrix for the whole Systems Thinking package, with a reason for every non-obvious choice, and the import audit with a disposition for every gap' },
  { file: 'team-NN-checker-log.txt', what: 'the checker output: the tool proof (the pass file and the fail file) and the final run of model v0.1 with zero errors, every warning explained' },
] as const

/** Completeness minimums for model v0.1 (course convention): what the instructor checks first. They are read from the
 *  team's own record, so they scale with it; there is no fixed count of stakeholders this week. */
export const LAB8_MINIMUMS = {
  /** Every STK, CON and EXT of the record appears in the model (none left out except as a recorded defect). */
  registerCoverage: 1.0,
  /** At least this many relationships modeled, at least one of them a conflict (as in Week 1). */
  relationships: 3,
  conflicts: 1,
  /** The purpose statement: who uses the model and for which decisions. */
  purposeWords: 15,
} as const

/** Lab L8 out of class in person-hours for a team of four (course estimate; the lab tool generates the first draft of
 *  the skeleton, so the work is reviewing, correcting and completing it, not typing it). One member, the team's checker
 *  owner, installs the course checker from the Week 8 guide (#/week/8/lab/checker, src/content/lab/week08Checker.ts);
 *  that hour is a team task, so a personal installation stays optional (course decision, recorded for faculty
 *  confirmation in docs/lectures/week08/WEEK8_REVIEW_DISPOSITIONS.md). */
export const LAB8_PERSON_HOURS: { task: string; hours: number }[] = [
  { task: 'mapping matrix for the whole package', hours: 1.2 },
  { task: 'purpose statement and package skeleton', hours: 0.7 },
  { task: 'Context package (enterprise, system of interest, external systems)', hours: 0.6 },
  { task: 'Stakeholders package (stakeholders, concerns, assessment)', hours: 1.9 },
  { task: 'stakeholder relationships', hours: 0.5 },
  { task: 'import audit note with dispositions (all four questions)', hours: 1.0 },
  { task: 'course checker installation by the checker owner (install guide)', hours: 0.9 },
  { task: 'checker runs to zero errors, warnings explained', hours: 0.7 },
  { task: 'integration review and AI usage statement', hours: 0.5 },
]

/** A three-person team: the same tasks at a reduced scope (DECISION_LOG A21 provisional decision 4, pending faculty
 *  confirmation), so the out-of-class load per person stays that of a team of four. The audit keeps the fidelity
 *  question, on a sample, because judging meaning is what the checker cannot do. Tasks "as for a team of four" carry
 *  the same hours as for a team of four. */
export const LAB8_PERSON_HOURS_THREE: { task: string; hours: number; scope: string }[] = [
  { task: 'mapping matrix for the whole package', hours: 0.8, scope: 'Weeks 3–6 kinds by count, a reason only for non-obvious choices' },
  { task: 'purpose statement and package skeleton', hours: 0.5, scope: 'later packages as generated, with their week notes' },
  { task: 'Context package (enterprise, system of interest, external systems)', hours: 0.6, scope: 'as for a team of four' },
  { task: 'Stakeholders package (stakeholders, concerns, assessment)', hours: 1.1, scope: 'ratings and reasons kept in documentation, no assessment metadata' },
  { task: 'stakeholder relationships', hours: 0.3, scope: 'conflict relationships only' },
  { task: 'import audit note with dispositions (all four questions)', hours: 0.7, scope: 'fidelity checked on a sample: every stakeholder and five concerns; every gap dispositioned' },
  { task: 'course checker installation by the checker owner (install guide)', hours: 0.9, scope: 'as for a team of four' },
  { task: 'checker runs to zero errors, warnings explained', hours: 0.7, scope: 'as for a team of four' },
  { task: 'integration review and AI usage statement', hours: 0.4, scope: 'one review pass by the whole team' },
]
/** The individual applied exercise (Assessment page, tasks 1–5): about 45 minutes, revised from 35 after the independent
 *  review (task 3 no longer asks for a metadata definition; task 5 gives both recorded checker outputs). */
export const EXERCISE_MINUTES = 45
const round1 = (x: number) => Math.round(x * 10) / 10
export const LAB8_TEAM_HOURS = round1(LAB8_PERSON_HOURS.reduce((a, t) => a + t.hours, 0))
export const LAB8_TEAM_HOURS_THREE = round1(LAB8_PERSON_HOURS_THREE.reduce((a, t) => a + t.hours, 0))
