// Week 5 lab brief: the single source of the Lab L5 minimums, the interface kinds, the component kinds, the hard gates and
// advisories, the security vocabulary and the person-hours. Read by the Week 5 lectures (session1.ts, session2.ts), the
// AeroLink case (aerolinkCase.ts), the lab instructions (src/content/lab/week05Lab.ts), the lab tool (src/workbench/week5/*)
// and their tests. Pure data, no imports, so both the content and the workbench layers may depend on it.
//
// Review status: new-pending-review. Minimums, the interface typing, the interface-table columns, the trust-boundary rule
// and the person-hours are course conventions, pending faculty approval; the three-person minimums follow DECISION_LOG A21
// provisional decision 4 (workload proportional to team size).
//
// Every HARD GATE below names, in `basis`, the lecture sentence that makes a failure a real defect (the gate-justification
// table of docs/lectures/week05/WEEK5_MILESTONE_REPORT.md is generated from the same rows). Anything that is a sign of a
// likely defect but can occur in good work is an ADVISORY: shown, never blocking. The recurring defect of Weeks 1, 2 and 4
// (tools rejecting valid input for its form) was NOT prevented by construction in the first version: names were safe, but
// unstated word minimums on free text rejected answers the lecture calls complete ("Fail safe", "Power only",
// "Approved"; review 2026-10-19 M2). Since that review every free-text threshold is the shortest answer the lecture
// accepts, and it is stated in the gate's own text: one word where a word is an answer, two where the lecture asks for an
// action (verb and object), and a criterion counts with one token when it carries a number or an owned TBD. No gate
// tests a name's form, its capitalization or its vocabulary; one-word names, proper nouns, IDs, people and external AI
// services are valid ends and names. src/workbench/shortAnswers.test.ts asserts short valid answers in every week's tool.
//
// Sources checked for this file (page text in _source_cache/*.txt):
//   - Interface: a shared boundary between two functional units (SEBoK glossary, p.1541); a physical interface binds two
//     system elements, like a link or a connector, and in service and enterprise systems may be a protocol, a procedure or
//     a document (R20c p.597).
//   - Five plus or minus two elements per level: a common guideline (R20c p.597): advisory only.
//   - All external interfaces are included; an internal interface over a transport the system does not own is a hidden
//     external interface (R55 p.369; R54 p.331).
//   - Interface requirements in three steps; the example names the ICD (R13 p.563).
//   - Every interface and interaction between implemented elements is verified (R22 p.630).
//   - Describe every interface with one consistent set of attributes, including use (MITRE R57 p.413).
//   - Adversity often comes through or from connected systems (R25 p.1234); data protected from unauthorized alteration
//     (R25 p.1231); boundary enforcement, domain separation, least privilege, loose coupling, degrade gracefully, preserve
//     integrity (R24 pp.1205–1207).

// ---------------------------------------------------------------------------------------------------- minimums
/** Lab L5 minimums for a team of four (course convention, Session 2 lab brief). */
export const LAB5_MINIMUMS = {
  /** Components in the breakdown, counting the Week 4 physical elements (level 1) and any level-2 components. */
  components: 5,
  interfaces: 8,
  /** Interface requirements written by the three-step method, at least one per external interface where possible. */
  requirements: 3,
  /** Interfaces linked to a risk in the register, at least one of them a security or resilience risk. */
  riskLinks: 2,
  changeRequests: 1,
} as const

/** A three-person team: per-item minimums reduced in proportion (A21 provisional decision 4, pending confirmation). The
 *  management part and the change request do not shrink; interfaces and requirements do, so the out-of-class load per
 *  person stays within 0.1 h of a team of four (week5Path.ts THREE_PERSON computes it; tested). */
export const LAB5_MINIMUMS_THREE = {
  components: 4,
  interfaces: 6,
  requirements: 2,
  riskLinks: 2,
  changeRequests: 1,
} as const
export type Lab5Minimums = { [K in keyof typeof LAB5_MINIMUMS]: number }

/** Lab L5 out of class in person-hours for a team of four (course estimate, outline §5.7, to be checked against logged
 *  hours). `scales` says which minimum the task grows with. Every method step has a row. */
export const LAB5_PERSON_HOURS: { id: string; task: string; hours: number; scales: 'components' | 'interfaces' | 'requirements' | 'fixed' }[] = [
  { id: 'breakdown', task: 'component breakdown and responsibility cards', hours: 1.5, scales: 'components' },
  { id: 'n2', task: 'N² chart, typing, degree check and the crossing-flow check', hours: 2.0, scales: 'interfaces' },
  { id: 'table', task: 'interface table: what crosses, direction, medium, owners, constraints, verification', hours: 2.5, scales: 'interfaces' },
  { id: 'security', task: 'trust boundaries, protection and degraded mode of each interface', hours: 1.0, scales: 'interfaces' },
  { id: 'requirements', task: 'interface requirements by the three steps', hours: 1.5, scales: 'requirements' },
  { id: 'management', task: 'interface management: ICWG, standards, agreements and one change request', hours: 1.0, scales: 'fixed' },
  { id: 'integration', task: 'audit, AI usage statement and integration', hours: 1.5, scales: 'fixed' },
]
export const LAB5_TEAM_HOURS = Math.round(LAB5_PERSON_HOURS.reduce((a, t) => a + t.hours, 0) * 10) / 10

// ---------------------------------------------------------------------------------------------------- kinds
export type InterfaceKind = 'physical' | 'information' | 'organizational'
/** The course's interface typing (course convention, not a SEBoK or MITRE taxonomy: in SEBoK all of these are physical
 *  interfaces in the binding sense, R20c p.597). "External" is a flag on any kind, computed from the ends. */
export const INTERFACE_KINDS: { id: InterfaceKind; label: string; crosses: string; example: string }[] = [
  { id: 'physical', label: 'Physical', crosses: 'energy, material, mechanical load (things that move or bind)', example: 'a charging connector' },
  { id: 'information', label: 'Information', crosses: 'data, over a named medium', example: 'booking messages over the ground network' },
  { id: 'organizational', label: 'Organizational', crosses: 'nothing: it records an agreement, a procedure or a responsibility between owners', example: 'a pad-slot agreement' },
]
export const interfaceKindLabel = (k: string) => INTERFACE_KINDS.find((x) => x.id === k)?.label ?? k

export type ComponentKind = 'hardware' | 'software' | 'data' | 'people' | 'procedure' | 'facility' | 'mixed'
/** System element types (SEBoK glossary p.1643, from ISO/IEC/IEEE 15288; also R20c p.597): a component may be any of them. */
export const COMPONENT_KINDS: { id: ComponentKind; label: string }[] = [
  { id: 'hardware', label: 'Hardware' },
  { id: 'software', label: 'Software' },
  { id: 'data', label: 'Data' },
  { id: 'people', label: 'People (a role or team)' },
  { id: 'procedure', label: 'Procedure or process' },
  { id: 'facility', label: 'Facility' },
  { id: 'mixed', label: 'A combination' },
]
export const componentKindLabel = (k: string) => COMPONENT_KINDS.find((x) => x.id === k)?.label ?? k

/** The guideline of five plus or minus two elements in one level (R20c p.597): an advisory, never a gate. */
export const SPAN = { low: 3, high: 7 } as const

/** Protection measures an interface definition may name (SEBoK resilience techniques and security loss criteria; R24
 *  pp.1205–1207, R25 p.1231). The team may write its own; the list is a prompt, not a vocabulary check. */
export const PROTECTION_PROMPTS = [
  'authenticate the sender',
  'integrity-check every message (detect alteration)',
  'encrypt personal or commercial data in transit',
  'domain separation: no direct path from a public front end to a safety function',
  'least privilege: the sender may write only what it owns',
  'boundary enforcement: reject messages outside the agreed format or rate',
  'a local interlock that acts without the interface',
] as const
/** Degraded-mode prompts (R24 p.1205: degrade gracefully, continue, fail-safe; p.1207 fail soft). */
export const DEGRADED_PROMPTS = [
  'fail safe: treat a missing status as the unsafe value (for example no-go)',
  'continue on the last valid value for a stated time, then stop',
  'switch to a backup path or a manual procedure',
  'stop the dependent function and tell its users',
] as const

// ---------------------------------------------------------------------------------------------------- gates
/** A gate or advisory row. `basis` is the lecture sentence (with its source) that makes a gate failure a real defect, or
 *  the reason an advisory is only an advisory. The gate-justification table is generated from these rows. */
export type GateRow = { id: string; short: string; basis: string }

export const COMPONENT_GATES = [
  { id: 'name', short: 'a name (one word is enough)', basis: 'A component is one of the parts that make up a system (SEBoK glossary p.1643, after ISO/IEC/IEEE 15288); an element with no name cannot be traced. Session 1, “System element and component”.' },
  { id: 'parent', short: 'placed under a Week 4 physical element that exists', basis: 'The breakdown is a hierarchy (SEBoK glossary p.1640; R20c p.597 layers); a component with no parent is outside the structure. Session 1, “Layers, and five plus or minus two per level”.' },
  { id: 'kind', short: 'its kind: hardware, software, data, people, procedure, facility or a combination', basis: 'Elements can be hardware, software, data, humans, processes, procedures, facilities (SEBoK glossary p.1643); the kind decides how it is verified. Session 1, “System element and component”.' },
  { id: 'responsibility', short: 'its responsibility: an action and what it acts on, at least two words (“Charges aircraft”)', basis: 'Course convention taught on the responsibility card (“the responsibility in one sentence”): a component exists to carry allocated functions; a component with no stated responsibility cannot be checked against them. A sentence needs at least a verb and its object. Session 1, “Responsibility cards: one per element”.' },
] as const satisfies readonly GateRow[]

export const CARD_GATES = [
  { id: 'responsibility', short: 'the responsibility of the physical element: an action and what it acts on, at least two words (“Raises alarms”)', basis: 'Course convention (responsibility card, “the responsibility in one sentence”), Session 1 “Responsibility cards: one per element”: every level-1 element states what it is responsible for; a verb and its object is the shortest such sentence.' },
  { id: 'owner', short: 'the organization that owns it (one word is enough)', basis: 'Each side of an interface is managed by its owner (DoD p.139: roles and responsibilities; MITRE p.414 ICWG of the interfacing activities); an element with no owner leaves its interfaces unmanaged. Session 2, “Governance”.' },
] as const satisfies readonly GateRow[]

export const INTERFACE_GATES = [
  { id: 'ends', short: 'two different ends, each a physical element, a component or an external element in the record', basis: 'An interface is a shared boundary between two units (SEBoK glossary p.1541) and binds two system elements (R20c p.597): a one-ended interface is not an interface. Session 1, “What an interface is”.' },
  { id: 'kind', short: 'its kind: physical, information or organizational', basis: 'Course typing, Session 1 “Typing interfaces”: each kind is verified and managed differently, so an untyped interface cannot be verified.' },
  { id: 'crosses', short: 'what crosses it, in words or as information item IDs', basis: 'Interface requirements start by defining what crosses the boundary and the media (R13 p.563). Session 1, “Interface requirements in three steps”.' },
  { id: 'direction', short: 'the direction: from which end to which, for what flows (an organizational interface needs none)', basis: 'Defining the interaction includes which way it goes; a physical or information interface without a direction cannot be verified at either end. Session 1, “The interface definition table” (course convention, after R13 p.563 and R57 p.413).' },
  { id: 'medium', short: 'the medium or carrier: connector, network, document or agreement', basis: 'A physical interface is like a link or a connector, and in enterprise systems a protocol, procedure or document (R20c p.597); without the medium a hidden external interface cannot be found (R55 p.369). Session 1, “External and hidden external interfaces”.' },
  { id: 'owners', short: 'the owner of each side', basis: 'Interface management needs the roles and responsibilities of each side (DoD p.139) and an ICWG of the interfacing activities (DoD p.140). Session 2, “Governance and the interface control working group”.' },
  { id: 'protection', short: 'if it crosses a trust boundary: its protection, or the reason it needs none (one word is enough: “TLS”, “Power only”)', basis: 'Adversity often comes through or from connected systems (R25 p.1234), and data must be protected from unauthorized alteration (R25 p.1231). Session 2, “Interface security: trust boundaries”: “a power cable carries no data, and saying so is a complete answer”.' },
  { id: 'degraded', short: 'its degraded mode: what each side does when the interface fails, at least two words (“Fail safe”)', basis: 'Resilience asks how the system withstands and degrades gracefully when an element fails (R24 p.1205). Session 2, “Degraded modes at interfaces”, whose slide gives “Fail safe” as a complete degraded mode.' },
] as const satisfies readonly GateRow[]

export const INTERFACE_ADVISORIES = [
  { id: 'org-carries-data', short: 'an organizational interface lists information items: an agreement carries no data, so add an information interface for the flow (course coverage rule)', basis: 'Advisory: the reference itself describes the work-order procedure by what it covers, so the words alone do not prove a defect.' },
  { id: 'no-constraint', short: 'no constraint or requirement yet: write one when the interface carries something a requirement depends on', basis: 'Advisory: some interfaces have no constraint at concept level (a pad-slot agreement), so a missing constraint is not always a defect.' },
  { id: 'no-verification', short: 'no verification named: every interface is verified during integration', basis: 'Advisory at concept level: verification cases are written in Week 12; R22 p.630 says every interface is verified, so plan it.' },
  { id: 'hidden-external', short: 'the medium names radio, Wi-Fi, cellular, satellite, a VPN, the internet or another network, link or service outsiders can reach or you may not own: tick “An end accepts input from the public, or the medium is radio or a network we may not own” (it then crosses a trust boundary) and record the hidden external interface', basis: 'Advisory: radio is a hidden external interface whoever owns the radios (R54 p.331), and a leased or public network is one when the enterprise does not own it (R55 p.369); whether the words describe the medium truly is a fact only the team knows, so the tool asks instead of deciding.' },
  { id: 'owner-spelling', short: 'an owner differs from the owner on that end’s responsibility card: if it is the same organization spelled differently (“Ops” and “Operations”), use one spelling, or the tool sees a false trust-boundary crossing', basis: 'Advisory: an end may genuinely be owned by someone other than its parent element’s owner, so the tool cannot decide.' },
  { id: 'no-internal-end', short: 'both ends are external elements: an interface between two outsiders is outside your system of interest; check that it belongs in your set', basis: 'Advisory: a hidden external path between two outside parties can matter to the audit, so it is shown, not blocked.' },
  { id: 'same-owner-external', short: 'an external end with the same owner as the internal end: check the boundary', basis: 'Advisory: an external element is outside the system of interest, which usually means another owner, but not always.' },
] as const satisfies readonly GateRow[]

export const REQUIREMENT_GATES = [
  { id: 'one-shall', short: 'exactly one “shall” (one requirement per statement)', basis: 'The Week 2 rule, kept: one requirement per statement, so that each can be verified on its own (taught in Week 2; in Week 5 Session 1, “Interface requirements in three steps”, every worked statement carries one “shall”).' },
  { id: 'interface', short: 'names the interface it governs, an interface in the record', basis: 'An interface requirement deals with an interaction across an interface boundary (R13 p.563); one that names no interface cannot be traced to it.' },
  { id: 'criterion', short: 'a verification criterion: a value with its unit (“2 min”) or a TBD with an owner (“TBD (Ops)”); one token counts when it holds a number or a TBD, otherwise two words', basis: 'Each requirement has a measurable criterion or a tracked TBD (Week 2 rule; R13 p.565).' },
  { id: 'method', short: 'a verification method: inspection, analysis, demonstration or test', basis: 'The Week 2 rule: a requirement without a verification method is not verifiable.' },
  { id: 'parent', short: 'a parent need, capability or requirement that exists in the record', basis: 'The Week 2 trace rule: every requirement traces up.' },
] as const satisfies readonly GateRow[]

export const CHANGE_GATES = [
  { id: 'interface', short: 'the interface it changes, an interface in the record', basis: 'Interface changes are managed under configuration management (DoD p.138); a change request must name what it changes. Session 2, “Change control”.' },
  { id: 'change', short: 'the change: an action and what it acts on, at least two words (“Add encryption”)', basis: 'Session 2, “Worked example I: one interface change, traced through the N²”, step Request: “state the change to one interface” before its impact can be assessed.' },
  { id: 'impact', short: 'at least one affected interface or element found from the N² row and column, existing in the record', basis: 'Course method, Session 2 “Worked example I: one interface change, traced through the N²”: the rows and columns of the changed interface’s two ends list every candidate neighbor, and judgment narrows them to the ones the change reaches; a change request that names none has not been assessed.' },
  { id: 'decision', short: 'the decision (one word is enough: “Approved”) and who made it', basis: 'An ICWG or the owners decide interface issues (DoD p.140; MITRE p.414): a change with no decider is not controlled.' },
] as const satisfies readonly GateRow[]

export type ComponentGateId = (typeof COMPONENT_GATES)[number]['id']
export type CardGateId = (typeof CARD_GATES)[number]['id']
export type InterfaceGateId = (typeof INTERFACE_GATES)[number]['id']
export type InterfaceAdvisoryId = (typeof INTERFACE_ADVISORIES)[number]['id']
export type RequirementGateId = (typeof REQUIREMENT_GATES)[number]['id']
export type ChangeGateId = (typeof CHANGE_GATES)[number]['id']

/** Part-level checks that make a part incomplete (each a real defect, with its basis) and part-level advisories. */
export const PART_RULES = [
  { id: 'externals', kind: 'gate', short: 'every external element in the record has at least one interface or a recorded reason for having none (a short reason such as “No exchange yet” is enough)', basis: 'All external interfaces for the system are included (R55 p.369); requirements capture all interactions with external systems so that boundaries are clear (R54 p.331). Session 1, “External and hidden external interfaces”.' },
  { id: 'crossing', kind: 'gate', short: 'every Week 4 information route between two different elements rides an information interface, directly or by a recorded relay', basis: 'Every interface and interaction between implemented elements is verified (R22 p.630); a flow with no interface has nothing to verify. Session 1, “Functional flows across the physical boundary” (the coverage rule from Week 4).' },
  { id: 'security-link', kind: 'gate', short: 'at least one interface linked to a security or resilience risk in the register', basis: 'Security and resilience are integrated into Week 5 (interface security); adversity comes through connected systems (R25 p.1234). Session 2.' },
  { id: 'icwg', kind: 'gate', short: 'the interface control working group names at least two organizations, one per line', basis: 'An ICWG is made of technical representatives of the interfacing activities (MITRE R57 p.414; DoD R47 p.140): a group of one organization has no other side to agree with. Session 2, “Governance and the interface control working group”.' },
  { id: 'standards', kind: 'gate', short: 'the interface standards that apply, or “none” (one word is enough; a reason is advised)', basis: 'The interface management plan documents the preferred standards (DoD R47 p.140). Session 2, “Standards and service-level agreements”.' },
  { id: 'unique-ids', kind: 'gate', short: 'every ID once, and no imported requirement ID reused', basis: 'IDs are the import keys of Weeks 7, 11 and 12 (Session 2 lesson, “Limits of the method, and what Week 5 feeds”: “Keep your IDs stable: they are the import keys”); a duplicated or reused ID breaks every trace that uses it.' },
  { id: 'span', kind: 'advisory', short: 'five plus or minus two components per level is the usual guideline', basis: 'Advisory: R20c p.597 calls it a common guideline.' },
  { id: 'kinds', kind: 'advisory', short: 'no interface of one kind: fine if your enterprise has none (a software-only service may have no physical interface), otherwise check', basis: 'Advisory: an enterprise with no physical exchange is valid.' },
  { id: 'single-child', kind: 'advisory', short: 'a physical element broken into a single component: one child is a rename, not a breakdown', basis: 'Advisory: sometimes a team records one component to name its supplier.' },
] as const

// ---------------------------------------------------------------------------------------------------- parts
/** The parts the Week 5 work adds to the Team Record (outline §5.5; Week 4 added Parts 15–18). */
export const WEEK5_PARTS = [
  { n: 19, id: 'breakdown', title: 'Component breakdown and responsibility cards' },
  { n: 20, id: 'interfaces', title: 'N² chart and interface definitions' },
  { n: 21, id: 'requirements', title: 'Interface requirements' },
  { n: 22, id: 'management', title: 'Interface management, security and resilience' },
] as const

/** The ID prefixes Week 5 adds to the record, and the lead role that owns each (course convention). */
export const WEEK5_PREFIXES = [
  { prefix: 'CMP', owner: 'Architecture' },
  { prefix: 'IF', owner: 'Architecture with AI & Data Management; each member owns at least two rows' },
  { prefix: 'REQ-SYS (interface requirements)', owner: 'Requirements & Compliance' },
  { prefix: 'ICR', owner: 'Verification & Validation' },
] as const

/** The four columns groups of the course interface table (course convention; MITRE asks for one consistent attribute set
 *  covering use as well as technical aspects, R57 p.413, but gives no column list; no interface control document
 *  template is held in the collection). */
export const TABLE_COLUMNS = ['ID and name', 'kind (external flagged)', 'ends', 'what crosses', 'direction', 'medium', 'constraint and requirement', 'owner of each side', 'verification', 'protection', 'degraded mode'] as const
