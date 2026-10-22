// Week 11 lab brief: the single source of the Lab L11 rules: how each Phase I element of the Week 4 physical view and the
// Week 5 components and interfaces becomes a SysML v2 element in model v0.4 (the course mapping for this week), the
// finding classes of the physical and interface audit, the review checklist, the deliverables, the minimums and the
// out-of-class workload. Read by the Session 2 lecture, the lab instructions (src/content/lab/week11Lab.ts), the lab tool
// (src/workbench/week11/*) and their consistency tests. Pure data, no imports, so both the content and the workbench layers
// may depend on it.
//
// Review status: new-pending-review. The mapping, the one-port-definition-per-interface rule, the level at which functions
// are performed, the subject of an interface requirement added this week and the audit classes are COURSE CONVENTIONS: the
// SysML v2 texts give the constructs (part, port, conjugated port, interface, connection, binding, flow, allocate,
// satisfy), not a method for moving a document package into a model. The three-person scope follows DECISION_LOG A21
// provisional decision 4 (workload proportional to team size).

/** One row of the Week 11 artifact-to-model mapping (course convention). */
export type W11Mapping = { artifact: string; from: string; becomes: string; where: string }
export const W11_MAPPING: W11Mapping[] = [
  { artifact: 'Physical element (PHY)', from: 'Week 4 physical view', becomes: 'part definition (a Week 8 or Week 9 part definition of the same name is reused, a linked one is specialized) and a part usage with the PHY ID inside the part physicalArchitecture', where: 'Physical' },
  { artifact: 'Component (CMP)', from: 'Week 5 component breakdown', becomes: 'part definition and a part usage with the CMP ID nested in the usage of its parent element', where: 'Physical' },
  { artifact: 'Function placed on a physical element', from: 'Week 4 allocation: function → physical element', becomes: 'perform inside the physical part usage: the part is the performer (level 1; components keep their functions in Week 5)', where: 'Physical' },
  { artifact: 'Logical element realized by physical elements', from: 'Week 4 allocation, read from the functions each element performs', becomes: 'allocate from the logical part usage to the physical part usage, with one nested allocate for each function both of them perform', where: 'Physical' },
  { artifact: 'External system (EXT)', from: 'Week 1 context, Week 4 and Week 5 externals', becomes: 'reference part usage in physicalArchitecture that subsets the external’s usage in the context (an external Week 5 added is first added to the context)', where: 'Physical (Context)' },
  { artifact: 'Interface end', from: 'Week 5 interface: end A, end B', becomes: 'port usage on the part at that end: end A typed by the interface’s port definition, end B by its conjugate (~)', where: 'Physical' },
  { artifact: 'Physical or information interface (IF)', from: 'Week 5 interface definitions', becomes: 'a port definition with one directed item per crossing (out from end A, in to end A), an interface definition whose two ends are typed by it and its conjugate, with a flow for each crossing, and an interface usage with the IF ID connecting the two ports', where: 'Physical' },
  { artifact: 'Organizational interface (IF)', from: 'Week 5 interface definitions', becomes: 'connection usage with the IF ID between the two parts, the agreement in its doc: nothing flows, so no ports', where: 'Physical' },
  { artifact: 'What crosses an interface', from: 'Week 5 “crosses”, and the Week 4 information items', becomes: 'a directed item feature typed by an item definition: a Week 4 or Week 10 item is reused; any other crossing is mapped to an item added this week (an information item takes the next INFO ID)', where: 'Physical' },
  { artifact: 'Interface requirement (REQ-SYS)', from: 'Week 5 interface requirements', becomes: 'the requirement usage (written now, with the interface definition as subject and a derivation from each parent, if Week 9 did not model it); allocate from the requirement to the interface usage and to the function that realizes it', where: 'Requirements, Physical' },
  { artifact: 'Requirement allocated to a physical element', from: 'Open items of Weeks 9 and 10', becomes: 'allocate from the requirement to the physical part usage', where: 'Physical' },
  { artifact: 'Satisfy claim', from: 'A design value or analysis the team can defend', becomes: 'satisfy the requirement by the physical part (or interface) usage whose type conforms to its subject, with the design value as an attribute redefinition on that usage and the basis in the doc', where: 'Physical' },
]

// ------------------------------------------------------------------------------------------- audit findings
/** Finding classes of the Week 11 audit (the Week 9 and 10 classes kept). Only a `defect` keeps something out of the
 *  generated file, and only where writing it would make the file fail the checker (a reference to something that does
 *  not exist in the model or the imports), or where an ID in the Week 5 file names a different element in the model. */
export type W11FindingClass = 'defect' | 'gap' | 'trace' | 'info'
export const W11_FINDING_CLASSES: { id: W11FindingClass; label: string; meaning: string }[] = [
  { id: 'defect', label: 'Defect (left out of the file)', meaning: 'Writing it would refer to something that is not in your model or your Week 5 export, or its ID names a different element in your model, so it is left out of the generated file and listed. Correct the Week 5 file or the choice in the tool, and import again. IDs are never renumbered.' },
  { id: 'gap', label: 'Gap (fix it in the tool, or record why not)', meaning: 'The element is generated, but something the course expects is missing: an item on an interface, a direction the tool had to assume, a linked part definition, a function on a physical element. Fix it here where the tool allows; otherwise write a disposition.' },
  { id: 'trace', label: 'Trace finding (needs a disposition)', meaning: 'A function placed on no physical element, a logical element realized by no physical element, a requirement allocated to nothing, an external system with no interface, or an information flow between two physical elements that no interface carries. Record what the team will do and why: an open item with an owner, or why no change is needed.' },
  { id: 'info', label: 'Information', meaning: 'Recorded for the review (an ID issued this week, a requirement or external added to the model from your Week 5 file). No action.' },
]

/** A disposition that claims the work is complete while the finding is still computed from the imports is refused
 *  (Week 7 review M2; the Week 9 and 10 rule kept). */
export const COMPLETION_CLAIM = /\b(fixed|resolved|done|closed|corrected|completed?|covered now|withdrawn)\b/i

// ------------------------------------------------------------------------------------------- the review checklist
/** The physical and interface review checklist (Session 2, course convention; R20c pp.601–603, R71 sl.20–28, R81 pp.93–
 *  95, 106–116, R83 p.168). The team records, for each item, whether the model meets it or what the finding is; the tool
 *  computes the evidence it can (directions, conformance, allocations). */
export const REVIEW_CHECKS: { id: string; text: string; tool: string }[] = [
  { id: 'elements', text: 'Every Week 4 physical element and Week 5 component is a part in physicalArchitecture, with its Phase I ID, and every Week 8 or 9 part definition is reused, specialized or given a reason', tool: 'The parts table lists each element, its definition and its components.' },
  { id: 'allocation', text: 'Every logical element is allocated to the physical elements that realize it, and every function it performs is allocated, nested, to the physical element that performs it', tool: 'The allocation matrix is computed from the functions each element performs; trace findings list what is missing.' },
  { id: 'ports', text: 'Every interface end is a port on the element Week 5 names, and the second end uses the conjugate, so every out item meets an in item', tool: 'The tool writes one port definition per interface and its conjugate. The checker does not test that two connected ports match: it accepts an interface whose definition has a conjugate end connecting a port typed by the plain definition, and an interface between ports of unrelated definitions. Check each port’s own type.' },
  { id: 'flows', text: 'Every crossing has a flow in the right direction, and the item is produced at the source end and consumed at the target end', tool: 'Directions are computed from the producers and consumers where they can be; an assumed direction is a gap. The checker accepts a flow in the wrong direction, and a flow between two different items: check that both ends of a flow name the same item.' },
  { id: 'interfaces', text: 'Every Week 5 interface is modeled (physical and information as interfaces, organizational as connections), and no interface is invented', tool: 'The interface table lists each Week 5 interface with its usage and ports.' },
  { id: 'requirements', text: 'Every interface requirement is in the model, derived from its parent, and allocated to its interface and to the function that realizes it', tool: 'Trace findings list interface requirements allocated to no function.' },
  { id: 'satisfy', text: 'Every satisfy claim names a part whose type conforms to the requirement’s subject and states its basis, a design value or an analysis, to be verified in Week 12', tool: 'The tool leaves out a claim whose part does not conform, or whose design value misses a limit it can read from the requirement, and asks for the basis. A limit it cannot read is yours to compare.' },
  { id: 'externals', text: 'Every external system the enterprise exchanges with has an interface, or a recorded reason why not', tool: 'Trace findings list the externals with no interface.' },
]

// ------------------------------------------------------------------------------------------- deliverables and minimums
export const LAB11_OUTPUTS = [
  { file: 'team-NN-model-v04.sysml', what: 'model v0.4: model v0.3 with the Physical package modeled (physical elements and components as parts, ports, port and interface definitions with their flows, interfaces and connections, the allocation of the logical architecture, the interface requirements allocated, and the first satisfy claims)' },
  { file: 'team-NN-interface-review.md', what: 'the parts table, the logical-to-physical allocation matrix, the interface table with ports and flows, the interface requirements table, the satisfy claims, the audit with a disposition for every finding, the review checklist results, and the AI usage statement' },
  { file: 'team-NN-checker-log.txt', what: 'the checker output of the final run of model v0.4: zero errors, every warning explained' },
] as const

/** Completeness minimums for model v0.4 (course convention, proposed). */
export const LAB11_MINIMUMS = {
  /** Satisfy claims with a design value or analysis as basis. Team of four. */
  satisfy: 2,
  /** Team of three (reduced scope, pending faculty approval). */
  satisfyThree: 1,
  /** At least one interface with an item flow. */
  interfacesWithFlow: 1,
} as const

/** Lab L11 out of class in person-hours for a team of four (course estimate; the lab tool writes the first draft of every
 *  element from the exports, so the work is mapping what crosses, placing new functions, allocating the interface
 *  requirements, writing the satisfy claims, reviewing and completing). */
export const LAB11_PERSON_HOURS: { task: string; hours: number }[] = [
  { task: 'physical elements and components: part definitions linked, functions added in Week 10 placed on a physical element', hours: 1.0 },
  { task: 'logical-to-physical allocation checked against the Week 4 rationale', hours: 0.6 },
  { task: 'interfaces: what crosses each one, its item and direction, new items where none exists', hours: 2.2 },
  { task: 'interface requirements: allocated to interface and function, derivations checked', hours: 1.0 },
  { task: 'satisfy claims: design values and their basis', hours: 1.0 },
  { task: 'checker runs to zero errors, warnings explained', hours: 0.8 },
  { task: 'review checklist and a disposition for every finding', hours: 1.2 },
  { task: 'integration review and AI usage statement', hours: 0.6 },
]
/** A three-person team: the same tasks, with the one scope the tool really reduces (one satisfy claim instead of two;
 *  physical.ts satisfy-minimum). Every other row is the team-of-four work at the team-of-four hours, so the load per
 *  person is higher than for a team of four; the week stays within the 8.0 h budget (week11Path.ts; Week 10 review N1,
 *  Week 11 review m2: the integration row is not cut, since a team of four also makes one pass). */
export const LAB11_PERSON_HOURS_THREE: { task: string; hours: number; scope: string }[] = [
  { task: 'physical elements and components: part definitions linked, functions added in Week 10 placed on a physical element', hours: 1.0, scope: 'as for a team of four' },
  { task: 'logical-to-physical allocation checked against the Week 4 rationale', hours: 0.6, scope: 'as for a team of four' },
  { task: 'interfaces: what crosses each one, its item and direction, new items where none exists', hours: 2.2, scope: 'as for a team of four' },
  { task: 'interface requirements: allocated to interface and function, derivations checked', hours: 1.0, scope: 'as for a team of four' },
  { task: 'satisfy claims: design values and their basis', hours: 0.5, scope: `at least ${LAB11_MINIMUMS.satisfyThree} claim instead of ${LAB11_MINIMUMS.satisfy}` },
  { task: 'checker runs to zero errors, warnings explained', hours: 0.8, scope: 'as for a team of four' },
  { task: 'review checklist and a disposition for every finding', hours: 1.2, scope: 'as for a team of four' },
  { task: 'integration review and AI usage statement', hours: 0.6, scope: 'as for a team of four' },
]
/** The individual applied exercise (Assessment page, tasks 1–5). */
export const EXERCISE_MINUTES = 50
const round1 = (x: number) => Math.round(x * 10) / 10
export const LAB11_TEAM_HOURS = round1(LAB11_PERSON_HOURS.reduce((a, t) => a + t.hours, 0))
export const LAB11_TEAM_HOURS_THREE = round1(LAB11_PERSON_HOURS_THREE.reduce((a, t) => a + t.hours, 0))

/** The suggested seven-day plan of Lab L11 (Session 2 close; course convention): task, first and last day, lead role. */
export const SEVEN_DAY_PLAN: { task: string; from: number; to: number; lead: string }[] = [
  { task: 'checkpoint fix', from: 1, to: 1, lead: 'Architecture' },
  { task: 'parts and placements', from: 1, to: 2, lead: 'Architecture' },
  { task: 'what crosses, directions', from: 2, to: 3, lead: 'Architecture' },
  { task: 'interface requirements', from: 3, to: 4, lead: 'Requirements & Compliance' },
  { task: 'satisfy claims', from: 4, to: 4, lead: 'Verification & Validation' },
  { task: 'checker runs', from: 5, to: 5, lead: 'AI & Data Management' },
  { task: 'review and audit', from: 6, to: 6, lead: 'Verification & Validation' },
  { task: 'upload', from: 7, to: 7, lead: 'Verification & Validation' },
]
