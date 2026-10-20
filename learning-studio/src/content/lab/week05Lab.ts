// Lab L5, the Week 5 Team Record: the full laboratory instructions, single source for the Week 5 Laboratory page and
// docs/lectures/week05/WEEK5_LAB_INSTRUCTIONS.md (labMarkdown(), written by `npm run lab:md`; week05Lab.test.ts fails
// when the file and this module differ). Mirrors src/content/lab/week04Lab.ts and week03Lab.ts.
//
// Single sources: the minimums, the interface and component kinds, the hard gates and advisories with their basis, the
// part rules and the person-hours come from src/content/lectures/week05/labBrief.ts (the same module the lab tool,
// src/workbench/week5/record.ts, checks against); the gate-justification table (GATE_TABLE) is generated from those rows
// for the lab page and the milestone report; the in-class minutes are read from the Session 2 slides; the rubric rows from
// the rubric register (getRubric). "Taught in" references are computed from the registered lectures by slide id, with a
// fallback while the Week 5 lectures are being written (week05Lab.test.ts asserts every id once a lecture is registered).
// Review status: new-pending-review. AeroLink is FICTIONAL and is the instructor's worked example; the record is always
// about the team's own enterprise.
import { WEEKS } from '../course'
import { formatCitation, type Citation } from '../readings'
import { getRubric } from '../rubrics'
import { getLecture } from '../lectures'
import { allSlides } from '../lectures/text'
import { PENDING, type NewText } from '../learn/types'
import {
  CARD_GATES, CHANGE_GATES, COMPONENT_GATES, COMPONENT_KINDS, DEGRADED_PROMPTS, INTERFACE_ADVISORIES, INTERFACE_GATES, INTERFACE_KINDS, LAB5_MINIMUMS as MIN, LAB5_MINIMUMS_THREE as MIN3, LAB5_PERSON_HOURS,
  LAB5_TEAM_HOURS, PART_RULES, PROTECTION_PROMPTS, REQUIREMENT_GATES, TABLE_COLUMNS, WEEK5_PARTS,
} from '../lectures/week05/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
const W5 = WEEKS[4]
const round1 = (x: number) => Math.round(x * 10) / 10

export const LAB_REVIEW = PENDING
export const LAB_TITLE = 'Lab L5: component breakdown, N² chart and interface definitions for your enterprise'

// ------------------------------------------------------------------------------------------- taught in
/** Every slide id the method cites, by session, with the fallback slide number and title used only while the lecture is
 *  not registered (or the id is missing). week05Lab.test.ts asserts each id resolves once a session is registered. */
export const TAUGHT_SLIDES: Record<1 | 2, Record<string, { slide: number; title: string }>> = {
  1: {
    'w5s1-system-element': { slide: 4, title: 'System element and component' },
    'w5s1-layers': { slide: 5, title: 'Layers, and five plus or minus two per level' },
    'w5s1-breakdown-wbs': { slide: 6, title: 'System breakdown structure and work breakdown structure' },
    'w5s1-logical-physical': { slide: 7, title: 'Logical and physical: which elements we break down' },
    'w5s1-worked-breakdown': { slide: 8, title: 'Worked example I: AeroLink’s component breakdown' },
    'w5s1-cards': { slide: 9, title: 'Responsibility cards: one per element' },
    'w5s1-interface': { slide: 10, title: 'What an interface is' },
    'w5s1-typing': { slide: 11, title: 'Typing interfaces: physical, information, organizational; external flagged' },
    'w5s1-external-hidden': { slide: 12, title: 'External and hidden external interfaces' },
    'w5s1-n2': { slide: 13, title: 'The N² chart: how it is built' },
    'w5s1-worked-n2': { slide: 14, title: 'Worked example II: AeroLink’s N² from the fourteen interfaces' },
    'w5s1-reading-n2': { slide: 15, title: 'Reading the N²: the hub, the empty rows, the sum' },
    'w5s1-crossing': { slide: 16, title: 'Functional flows across the physical boundary' },
    'w5s1-answer': { slide: 17, title: 'Answering the driving question: a new interface, chosen with reasons' },
    'w5s1-table': { slide: 18, title: 'The interface definition table' },
    'w5s1-interface-reqs': { slide: 20, title: 'Interface requirements in three steps' },
    'w5s1-worked-definitions': { slide: 19, title: 'Worked example III: defining the fire alarm and incident-record interfaces' },
    'w5s1-modularity': { slide: 21, title: 'Modularity: maximum consistency inside, minimum interfaces outside' },
  },
  2: {
    'w5s2-why-manage': { slide: 2, title: 'Why interfaces are managed, not just defined' },
    'w5s2-governance': { slide: 3, title: 'Governance and the interface control working group' },
    'w5s2-standards': { slide: 4, title: 'Standards and service-level agreements' },
    'w5s2-change-control': { slide: 5, title: 'Worked example I: one interface change, traced through the N²' },
    'w5s2-trust-boundaries': { slide: 6, title: 'Interface security: trust boundaries' },
    'w5s2-protection': { slide: 7, title: 'Protection at the interface: integrity, authentication, separation' },
    'w5s2-degraded': { slide: 8, title: 'Degraded modes at interfaces: what each side does when it fails' },
    'w5s2-worked-security': { slide: 9, title: 'Worked example II: trust boundaries, protection and degraded modes on AeroLink' },
    'w5s2-audit': { slide: 10, title: 'Auditing the interface set: four lenses' },
    'w5s2-integration': { slide: 11, title: 'Integration: aggregates from the N²' },
    'w5s2-coupling': { slide: 12, title: 'Worked example III: the coupling count Week 4 deferred' },
    'w5s2-limits': { slide: 13, title: 'What the method cannot tell you' },
  },
}
/** “Session N, slide M ‘title’”, read from the registered lecture by slide id; the fallback is used only while the
 *  lecture is not registered or the slide id is missing. */
export function taughtIn(session: 1 | 2, slideId: string, fallback?: { slide: number; title: string }): string {
  const l = getLecture(5, session)
  if (l) {
    const slides = allSlides(l)
    const i = slides.findIndex((s) => s.id === slideId)
    if (i >= 0) return `Session ${session}, slide ${i + 1} ‘${slides[i].title}’`
  }
  const f = fallback ?? TAUGHT_SLIDES[session][slideId] ?? { slide: 0, title: slideId }
  return `Session ${session}, slide ${f.slide} ‘${f.title}’`
}
const t = (session: 1 | 2, ...ids: string[]) => ids.map((id) => taughtIn(session, id)).join('; ')

// ------------------------------------------------------------------------------------------- in-class minutes, readings
const labSection = getLecture(5, 2)?.sections.find((s) => s.id === 'w5s2-lab')
const labMin = (id: string, fallback: number) => labSection?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: labSection ? labSection.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w5s2-lab-brief', 3),
  n2: labMin('w5s2-lab-n2', 12),
  check: labMin('w5s2-lab-check', 5),
  close: labMin('w5s2-lab-close', 2),
  checkTeams: 4,
}

/** Essential readings for the week, narrowed to the pages the lecture teaches from (12 pages). */
export const LAB5_REQUIRED_READINGS: Citation[] = [
  { reading: 'R57', pages: '410–414' },
  { reading: 'R47', pages: '138–140' },
  { reading: 'R22', pages: '630–631' },
  { reading: 'R20c', pages: '597' },
  { reading: 'R13', pages: '563' },
]
/** Further reading (not required; the basis of the graduate task and the security part). */
export const LAB5_EXTENSION_READINGS: Citation[] = [
  { reading: 'R20c', pages: '596–603' },
  { reading: 'R55', pages: '369' },
  { reading: 'R54', pages: '331' },
  { reading: 'R46', pages: '127' },
  { reading: 'R24', pages: '1205–1207' },
  { reading: 'R25', pages: '1231–1234' },
  { reading: 'R36', pages: '498–499' },
]
export const LAB5_DUE = 'Before Week 6, Session 1'
export const LAB5_WHERE = 'LMS assignment “Week 5 Team Record”'

// ------------------------------------------------------------------------------------------- workload
/** A three-person team at the reduced minimums (pending faculty confirmation): per-item work scales with its minimum,
 *  fixed work does not. */
export const LAB5_THREE_PERSON = (() => {
  const ratio: Record<(typeof LAB5_PERSON_HOURS)[number]['scales'], number> = {
    components: MIN3.components / MIN.components,
    interfaces: MIN3.interfaces / MIN.interfaces,
    requirements: MIN3.requirements / MIN.requirements,
    fixed: 1,
  }
  const teamHours = round1(LAB5_PERSON_HOURS.reduce((a, x) => a + x.hours * ratio[x.scales], 0))
  return { teamHours, each: round1(teamHours / 3) }
})()
/** The four-person share of the lab, per student. */
export const LAB5_EACH = round1(LAB5_TEAM_HOURS / 4)

// ------------------------------------------------------------------------------------------- the lab at a glance
export const LAB_PURPOSE = n(
  'Apply the Week 5 method to your team’s own enterprise, never to AeroLink: break your Week 4 physical elements down into components with a responsibility card each, find every interface with an N² chart (external and hidden external ones included), check that every information route of your Week 4 information view rides an interface, define each interface in one consistent table (what crosses it, which way, over which medium, under which constraint, owned by whom, verified how, protected how and what happens when it fails), write interface requirements by the three steps, and set up the management of the interfaces: who decides, which standards apply, how a change is controlled, and which risks the interfaces carry. The result extends your Week 4 Team Record with Parts 19–22. Week 6 uses the interface standards for the evolution roadmap, Week 7 puts the components and interfaces in the final presentation, and in Phase II the components become parts and the interfaces become interface definitions and connections (Week 11), with their verification in Week 12.',
)

export const LAB_AT_A_GLANCE: { label: string; value: string }[] = [
  { label: 'Setting', value: 'Team (3 or 4 members); launched in class, completed out of class' },
  { label: 'In class', value: `Session 2, ${S2_LAB.total} min: the brief (${S2_LAB.brief} min), the team’s first N² chart from the Week 4 physical view (${S2_LAB.n2} min), the instructor check of the charts (${S2_LAB.check} min, up to ${S2_LAB.checkTeams} teams; the others post their chart on the LMS and are answered within 48 hours) and the close (${S2_LAB.close} min)` },
  { label: 'Out of class', value: 'Seven days, by the procedure below' },
  { label: 'Due', value: `${LAB5_DUE}; one team member uploads both files` },
  { label: 'Grading', value: 'Formative: written feedback against the rubric rows below, returned before Week 6, Session 2' },
]

export const LAB_INPUTS: { text: NewText; cites?: Citation[]; to?: string }[] = [
  { text: n('Your Week 4 Team Record as returned with feedback, and its model-inputs file: it carries your physical elements, external elements, functions and their allocation, information items with their producers, consumers and routes, AI capability cards and decisions, and the needs, requirements and risks of Weeks 2–3. Correct it first where the feedback asks.') },
  { text: n('The Session 1 and Session 2 lectures, the detailed lesson and the worked examples: the AeroLink breakdown and responsibility cards, the N² chart, the interface table, the interface requirements, the trust boundaries and degraded modes, the change request and the audit.'), to: '/week/5/examples' },
  { text: n('The required readings for the week.'), cites: LAB5_REQUIRED_READINGS },
  { text: n('Further reading on the physical architecture, hidden external interfaces, interface risks, resilience, security and configuration baselines (not required; the basis of the graduate task).'), cites: LAB5_EXTENSION_READINGS },
  { text: n('The lab tool, which imports your Week 4 record, checks every part as you go, computes the N² chart, the degrees, the trust boundaries and the crossing-flow check, suggests the N² neighbors of a changed interface, shares the record between teammates and exports it.'), to: '/week/5/lab/tool' },
]

/** Objectives this lab practices (course.ts IDs; W5.4 and W5.5 are proposed, pending faculty approval). */
export const PROPOSED_OBJECTIVES: { id: string; text: string }[] = [
  { id: 'W5.4', text: 'Write interface requirements by the three-step method and identify hidden external interfaces' },
  { id: 'W5.5', text: 'Evaluate an interface set for coverage, coupling, security and degraded modes, and recommend interface-management actions' },
]
export const LAB_OBJECTIVES = [
  ...['W5.1', 'W5.2', 'W5.3'].map((id) => ({ id, text: W5.objectives.find((x) => x.id === id)!.text, proposed: false })),
  ...PROPOSED_OBJECTIVES.map((o) => ({ id: o.id, text: o.text, proposed: true })),
]

const gatesOf = (g: readonly { short: string }[]) => g.map((x) => x.short).join('; ')
const rule = (id: (typeof PART_RULES)[number]['id']) => PART_RULES.find((p) => p.id === id)!.short
const kinds = INTERFACE_KINDS.map((k) => `${k.label.toLowerCase()} (${k.crosses})`).join('; ')
const componentKinds = COMPONENT_KINDS.map((k) => k.label.toLowerCase()).join(', ')

/** The engineering method (nine steps), with the lecture slides that teach each step. */
export const LAB_METHOD: { title: string; text: NewText; taught: string }[] = [
  {
    title: 'Component breakdown and responsibility cards',
    text: n(`Take each Week 4 physical element as level 1 and write its responsibility card: what it is responsible for, the organization that owns it, and the functions your Week 4 allocation already places on it. Break an element down into level-2 components where that helps define its interfaces; a component may be ${componentKinds}, and one word is enough for its name. Each component refines its parent’s allocation and never contradicts it. Hard gates for every component: ${gatesOf(COMPONENT_GATES)}. For every card: ${gatesOf(CARD_GATES)}. Advisories: ${rule('span')}; ${rule('single-child')}.`),
    taught: t(1, 'w5s1-system-element', 'w5s1-layers', 'w5s1-breakdown-wbs', 'w5s1-logical-physical', 'w5s1-worked-breakdown', 'w5s1-cards'),
  },
  {
    title: 'Identify and type the interfaces',
    text: n(`For every pair of elements ask whether anything crosses between them. Type each interface: ${kinds}. An interface with an external end is external; an internal interface carried over a network, link or service your enterprise may not own is a hidden external interface, so record it. Include every external element: give it an interface, or record the reason it has none.`),
    taught: t(1, 'w5s1-interface', 'w5s1-typing', 'w5s1-external-hidden'),
  },
  {
    title: 'The N² chart',
    text: n('Put the physical elements and the external elements on the diagonal; each cell lists the interfaces joining its row and column elements (the chart is symmetric). Read the degree of each element (its interface count): the degree sum is twice the number of interfaces, a high degree marks a hub to protect and integrate early, and an empty row or column is an isolated element to explain.'),
    taught: t(1, 'w5s1-n2', 'w5s1-worked-n2', 'w5s1-reading-n2'),
  },
  {
    title: 'The crossing-flow check',
    text: n(`For every Week 4 information item, take every producer and consumer pair on different elements (an AI capability stands at its host element) and find the information interface it rides, directly or by a relay of interfaces you record in order. A flow with no interface has nothing to verify: add the interface, or record the relay. Rule: ${rule('crossing')}.`),
    taught: t(1, 'w5s1-crossing', 'w5s1-answer'),
  },
  {
    title: 'The interface definition table',
    text: n(`Describe every interface with the same attributes: ${TABLE_COLUMNS.join('; ')}. Hard gates: ${gatesOf(INTERFACE_GATES)}. Advisories: ${gatesOf(INTERFACE_ADVISORIES)}. ${rule('kinds')[0].toUpperCase()}${rule('kinds').slice(1)}.`),
    taught: t(1, 'w5s1-table', 'w5s1-worked-definitions', 'w5s1-modularity'),
  },
  {
    title: 'Interface requirements in three steps',
    text: n(`First define the boundary (the two elements and the interface between them), then the interaction (what crosses, in which direction, over which medium), then write the requirement on it, one per external interface where you can. Each takes the next free system-requirement ID and keeps the Week 2 rules. Hard gates: ${gatesOf(REQUIREMENT_GATES)}.`),
    taught: t(1, 'w5s1-interface-reqs', 'w5s1-worked-definitions'),
  },
  {
    title: 'Trust boundaries, protection and degraded modes',
    text: n(`An interface crosses a trust boundary when one end is external, when its two sides have different owners, or when an end accepts input from the public or the medium is radio (including Wi-Fi and cellular) or a network you may not own (radio is a hidden external interface whoever owns the radios, R54 p.331). For each such interface state its protection, for example: ${PROTECTION_PROMPTS.join('; ')}; or the reason it needs none. For every interface state the degraded mode, what each side does when it fails, for example: ${DEGRADED_PROMPTS.join('; ')}. Link the interfaces to the risks in your register; ${rule('security-link')}.`),
    taught: t(2, 'w5s2-trust-boundaries', 'w5s2-protection', 'w5s2-degraded', 'w5s2-worked-security'),
  },
  {
    title: 'Interface management',
    text: n(`Name the interface control working group (the organizations that own interfacing elements), the standards that apply or “none” with the reason, and the agreements between owners. Write at least one interface change request: the interface, the change, its impact found from the N² row and column of the interface’s ends, and the decision with the decider. Hard gates: ${gatesOf(CHANGE_GATES)}.`),
    taught: t(2, 'w5s2-why-manage', 'w5s2-governance', 'w5s2-standards', 'w5s2-change-control'),
  },
  {
    title: 'Audit, integration and coupling',
    text: n('Audit the set: externals without an interface, information routes without an interface, interfaces without verification, constraint or protection, hidden external interfaces. Group the elements into integration aggregates that keep the interfaces between aggregates few, and read what the N² cannot tell you (how critical an interface is, or how much crosses it). List what is still open for Week 6.'),
    taught: t(2, 'w5s2-audit', 'w5s2-integration', 'w5s2-coupling', 'w5s2-limits'),
  },
]

/** The procedure, step by step: when, who (lead role) and the output. Each member owns at least two interface rows. */
export const LAB_PROCEDURE: { step: string; when: string; who: string; output: string; detail: NewText }[] = [
  { step: 'First N² chart', when: `In class, Session 2 (${S2_LAB.n2} min)`, who: 'Whole team; Architecture lead records', output: 'Part 20 draft', detail: n('Put the Week 4 physical and external elements on the diagonal and mark every pair that exchanges something, with its kind; note the externals with no mark and the information routes with no interface.') },
  { step: 'Instructor check of the chart', when: `In class, Session 2 (${S2_LAB.check} min, up to ${S2_LAB.checkTeams} teams)`, who: 'Architecture lead presents', output: 'Feedback', detail: n('Show the chart; the instructor checks the diagonal, the typing, the external elements and one information route. Teams not seen post the chart on the LMS and are answered within 48 hours.') },
  { step: 'Breakdown and responsibility cards', when: 'Days 1–2', who: 'Architecture', output: 'Part 19', detail: n(`A card for every physical element and the level-2 components that help define interfaces: at least ${MIN.components} components in all (a three-person team: ${MIN3.components}).`) },
  { step: 'Interface set and crossing-flow check', when: 'Days 2–3', who: 'Architecture with AI & Data Management', output: 'Part 20 (N², coverage)', detail: n(`At least ${MIN.interfaces} interfaces (a three-person team: ${MIN3.interfaces}); every external element with an interface or a reason; every information route covered directly or by a relay. Split the interface rows so that each member owns at least two.`) },
  { step: 'Interface table', when: 'Days 3–4', who: 'Each member, for the rows they own', output: 'Part 20 (definitions)', detail: n('Every attribute of the table for your rows, with the owners of both sides confirmed with the owning organization where you can.') },
  { step: 'Trust boundaries, protection and degraded modes', when: 'Day 4', who: 'AI & Data Management', output: 'Part 20 (security), Part 22 (risk links)', detail: n(`Protection or its reason for every interface that crosses a trust boundary; a degraded mode for every interface; at least ${MIN.riskLinks} interfaces linked to risks, one of them a security or resilience risk.`) },
  { step: 'Interface requirements', when: 'Day 5', who: 'Requirements & Compliance', output: 'Part 21', detail: n(`At least ${MIN.requirements} interface requirements (a three-person team: ${MIN3.requirements}) by the three steps, one per external interface where you can.`) },
  { step: 'Interface management and change request', when: 'Day 5', who: 'Verification & Validation', output: 'Part 22', detail: n(`The interface control working group, the standards, and at least ${MIN.changeRequests} change request with its impact read from the N².`) },
  { step: 'Audit and AI usage statement', when: 'Day 6', who: 'Verification & Validation; AI & Data Management (statement)', output: 'Audit, Part 6 updated', detail: n('Read every advisory and the open items in the tool and list what is open for Week 6; the AI usage statement, with every AI-suggested component, interface or requirement tagged AI-suggested-reviewed. The statement is required even if no AI tool was used.') },
  { step: 'Integration, export and upload', when: 'Day 7', who: 'Verification & Validation', output: 'Submission', detail: n('Review the record for consistency, export the Markdown record and the JSON model inputs from the lab tool after the last change, and upload both files.') },
]

export const LAB_OUTPUT_FILES = [
  { name: 'team-NN-week5-record.md', what: 'Parts 19–22 and the updated Part 6 as headed Markdown, ready to read, with the N² chart, the degrees, the interface table and the crossing-flow results' },
  { name: 'team-NN-week5-model-inputs.json', what: 'The same data with IDs, links, the computed N² and check results, and the SysML v2 element each item will seed (Phase II)' },
]

const both = (four: string, three: string) => `team of 4: ${four}; team of 3: ${three}`
const part = (id: (typeof WEEK5_PARTS)[number]['id']) => {
  const p = WEEK5_PARTS.find((x) => x.id === id)!
  return `${p.n}. ${p.title}`
}
/** The parts the Week 5 work adds to the Team Record, with the evidence, the minimum and how each is judged. */
export const LAB_PARTS: { heading: string; evidence: NewText; minimum: string; judged: string }[] = [
  { heading: '6. AI usage statement (updated)', evidence: n('Tool, purpose, prompts, what was accepted or rejected and why, with AI-suggested components, interfaces and requirements tagged.'), minimum: 'At least 12 words; present even if no AI tool was used', judged: 'RB-12.1–12.3' },
  { heading: part('breakdown'), evidence: n('A responsibility card for every physical element (responsibility, owner, allocated functions) and the level-2 components with parent, kind and responsibility.'), minimum: both(`${MIN.components} components`, `${MIN3.components} components`) + ', counting the physical elements with a complete card; only components that pass every hard gate count', judged: 'RB-7.3 (breakdown); proposed RB-7.7' },
  { heading: part('interfaces'), evidence: n('The N² chart with degrees; every interface defined with every column of the table; every external element with an interface or a reason; every information route covered.'), minimum: both(`${MIN.interfaces} interfaces`, `${MIN3.interfaces} interfaces`) + '; only interfaces that pass every hard gate count; the externals and crossing-flow rules met', judged: 'RB-7.3 (N² and typed interfaces), RB-7.5; proposed RB-7.7' },
  { heading: part('requirements'), evidence: n('Interface requirements with statement, interface, criterion, method, parents and rationale.'), minimum: both(`${MIN.requirements} requirements`, `${MIN3.requirements} requirements`) + '; only requirements that pass every hard gate count', judged: 'RB-3.2; proposed RB-7.7' },
  { heading: part('management'), evidence: n('The interface control working group, the standards, the change requests with impact and decision, and the interfaces linked to risks.'), minimum: `${MIN.changeRequests} change request; ${MIN.riskLinks} interfaces linked to risks, one of them a security or resilience risk; the same for a team of 3`, judged: 'proposed RB-7.8' },
]

/** Rubric rows applied this week with four level columns, read from the register, never retyped. */
export const LAB_RUBRIC_ROWS: [string, string][] = [['RB-7', '7.3'], ['RB-7', '7.5'], ['RB-12', '12.1'], ['RB-12', '12.2'], ['RB-12', '12.3']]
/** Rubric rows applied as a per-requirement condition (the register gives a condition, not four levels). */
export const LAB_RUBRIC_CONDITION_ROWS: [string, string][] = [['RB-3', '3.2']]
export const LAB_RUBRIC_NOTE = n(
  'The rows of the course rubric this record is judged against, quoted from the register. RB-7.3 is scored in full this week: the allocation part was judged in Week 4, and the N² chart with typed interfaces and both ends is judged now. RB-7.5 applies to the crossing-flow check (every information flow has an interface). RB-3.2 is applied to each interface requirement as a condition. RB-12.3 applies to the AI-suggested components, interfaces and requirements; its SysML part applies from Week 8. Two rows are proposed, pending faculty approval, and are not yet in the register: RB-7.7 Interface definitions and RB-7.8 Interface management and risk.',
)
export const RUBRIC_LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']
/** Proposed rubric rows (not register rows; pending faculty approval), with their four level descriptors. */
export const PROPOSED_RUBRIC: { id: string; criterion: string; levels: [string, string, string, string] }[] = [
  { id: 'RB-7.7 (proposed)', criterion: 'Interface definitions', levels: ['Every interface defined with every table column, both owners, verification, protection where a trust boundary is crossed and a degraded mode; interface requirements by the three steps on the external interfaces', 'Most interfaces fully defined; a few verification or constraint entries missing', 'Interfaces named and typed but several attributes missing; requirements not tied to interfaces', 'A list of connections without definitions'] },
  { id: 'RB-7.8 (proposed)', criterion: 'Interface management and risk', levels: ['Working group of the interfacing owners, standards stated, a change request traced through the N² with a decider, interfaces linked to security and resilience risks', 'All present, one element thin', 'Management named but no change control or no risk link', 'None'] },
]

export function rubricRow(id: string, criterion: string): string[] {
  const p = getRubric(id).parts.find((x) => x.type === 'table')
  const r = p && p.type === 'table' ? p.rows.find((x) => x[0] === criterion) : undefined
  if (!r) throw new Error(`${id} has no criterion ${criterion}`)
  return r
}

/** Level descriptors for every lab criterion and the graduate criteria (course convention, pending faculty approval). */
export const LAB_LEVELS: { criterion: string; graduate: boolean; levels: [string, string, string, string] }[] = [
  { criterion: 'Component breakdown and responsibility cards', graduate: false, levels: ['Every physical element has a complete card; level-2 components refine the Week 4 allocation, each with kind and responsibility; the breakdown stops where interfaces are clear', 'Complete cards; a component or two without a clear responsibility', 'Cards incomplete or components that contradict the allocation', 'No breakdown, or a renamed list of the Week 4 elements'] },
  { criterion: 'N² chart and coverage', graduate: false, levels: ['Every pair examined; external and hidden external interfaces found; degrees read; every external element and every information route accounted for', 'One external or one route missed, the rest covered', 'Several pairs or routes unexamined; externals missing', 'No chart, or a chart with no typing'] },
  { criterion: 'Interface definitions', graduate: false, levels: ['Every column filled for every interface, with direction, medium, both owners, verification, protection where needed and a degraded mode', 'Most columns filled; a few verification or constraint entries missing', 'Interfaces typed but key columns missing', 'Names only'] },
  { criterion: 'Interface requirements', graduate: false, levels: ['Three steps visible; one shall, a measurable criterion or tracked TBD, a fitting method and a real parent for each; one per external interface', 'Well formed, one external interface without a requirement', 'Requirements that are not about an interface, or without criterion or method', 'None'] },
  { criterion: 'Interface management, security and resilience', graduate: false, levels: ['The interfacing owners decide; standards stated; a change request traced through the N² with its decider; protection and degraded modes tied to security and resilience risks', 'All present, one element thin', 'Management named but no change control or no risk link', 'None'] },
  { criterion: 'Alternatives and flow set (graduate)', graduate: true, levels: ['Two allocations of the same functions, each placing every function; the flow set is the team’s own Week 4 function-to-function flows, written before either alternative is scored', 'Both alternatives defined; a few functions unplaced or a flow missing', 'One alternative vague, or flows written for one alternative only', 'No alternatives defined'] },
  { criterion: 'Coupling metric stated and computed (graduate)', graduate: true, levels: ['Metric defined before any number; E, X, κ, P and D_max computed correctly for both alternatives from the team’s own flows', 'Metric stated and computed with a minor slip', 'Numbers without the metric defined first, or for one alternative only', 'No computation'] },
  { criterion: 'Crossings checked against the interfaces (graduate)', graduate: true, levels: ['Every crossing pair of both alternatives checked against the team’s information interfaces, the pairs with no interface listed and what each alternative would need', 'Checked for one alternative, or one pair missed', 'Pairs listed without the check', 'No check'] },
  { criterion: 'Comparison and limitation (graduate)', graduate: true, levels: ['The comparison names which limitation could change the conclusion and why, and what evidence would settle it', 'A limitation named but not tied to the conclusion', 'Generic limitations only', 'None'] },
]

export const LAB_SUBMISSION = {
  format: n('Export two files from the lab tool after the last change: team-NN-week5-record.md (Parts 19–22 and the updated Part 6 as headed Markdown) and team-NN-week5-model-inputs.json (the same data with IDs, links, the computed N² and check results, and the SysML v2 element each item will seed). Both state the record’s status.'),
  where: n(`One member uploads both files to the ${LAB5_WHERE} before Week 6, Session 1.`),
  grading: n('Formative: written feedback against the rubric rows above, returned before Week 6, Session 2.'),
  aiUse: 'AI tools may help list candidate interfaces from the N² chart, check the table for missing attributes and draft requirement wording; tag each AI-suggested component, interface or requirement AI-suggested-reviewed and say in the AI usage statement what the tool suggested and what you changed or rejected. The team owns every interface definition, every protection and every decision.',
  graduate: n('Graduate students also compare two allocation alternatives for the team’s enterprise with the course coupling metric (instructor-defined; no source defines a numerical coupling measure). State the metric before any number: over the function-to-function information flows of the Week 4 functions, E is the number of flows, X the flows whose two functions sit on different physical elements, κ = X / E, P the element pairs joined by at least one crossing flow, and D_max the most partners of one element. Compute it for the Week 4 allocation and one alternative, compare, and say which limitation could change the conclusion: criticality (every flow weighs the same), aggregation (one number hides where the coupling sits), concentration (D_max on one element), crossings without a matching interface, or a flow set written for one alternative (individual, about 40 minutes, replacing the applied exercise; scored on four criteria × four levels, 16 points, the same scale as the applied exercise).'),
}

export const LAB_TOOL = n(
  'The lab tool imports your team’s Week 4 model-inputs file and adds Parts 19–22. It carries your physical elements, external elements, allocation, information routes, AI capabilities, requirements and risks so that every link can be checked; computes the N² chart with the degree of every element, the trust boundary of every interface and the crossing-flow check (with a relay field for any route that rides more than one interface); and suggests the N² neighbors of a changed interface. Each card, component, interface, requirement and change request lists its hard gates, each marked pass or fails, and its advisories, labeled advisory, which never stop an entry counting; only entries that pass every hard gate count toward the minimums. One-word names, proper nouns, person groups and outside AI services are all valid. One member can enter the record and export the JSON file; teammates import it to continue the same record. Everything is saved in your browser only, so export after every working session.',
)

/** Workload: the lab's share of the week. */
export const LAB_WORKLOAD: { activity: string; hours: number }[] = [
  { activity: `Lab launch in class (Session 2, ${S2_LAB.total} min; inside the class hours)`, hours: 0 },
  { activity: `Lab L5 out of class: your share of about ${LAB5_TEAM_HOURS.toFixed(1)} person-hours (team of four)`, hours: LAB5_EACH },
]
export const LAB_WORKLOAD_NOTE = n(
  `About ${LAB5_TEAM_HOURS.toFixed(1)} person-hours of out-of-class work for a team of four (${LAB5_PERSON_HOURS.map((x) => `${x.task} ${x.hours.toFixed(1)}`).join('; ')}), so about ${LAB5_EACH.toFixed(1)} h each. A team of three works to the reduced minimums (${MIN3.components} components, ${MIN3.interfaces} interfaces, ${MIN3.requirements} interface requirements): about ${LAB5_THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${LAB5_THREE_PERSON.each.toFixed(1)} h each. Workload proportional to team size is pending faculty confirmation. See the workload table on the week page.`,
)

// ------------------------------------------------------------------------------------------- gate justification
/** The gate-justification table, generated from the labBrief rows: every hard gate with what it checks and the lecture
 *  sentence that makes a failure a real defect, every advisory with the reason it is only an advisory. */
export type GateTableRow = { group: string; kind: 'gate' | 'advisory'; id: string; checks: string; basis: string }
export const GATE_TABLE: GateTableRow[] = [
  ...COMPONENT_GATES.map((g) => ({ group: 'Component', kind: 'gate' as const, id: g.id, checks: g.short, basis: g.basis })),
  ...CARD_GATES.map((g) => ({ group: 'Responsibility card', kind: 'gate' as const, id: g.id, checks: g.short, basis: g.basis })),
  ...INTERFACE_GATES.map((g) => ({ group: 'Interface', kind: 'gate' as const, id: g.id, checks: g.short, basis: g.basis })),
  ...INTERFACE_ADVISORIES.map((g) => ({ group: 'Interface', kind: 'advisory' as const, id: g.id, checks: g.short, basis: g.basis })),
  ...REQUIREMENT_GATES.map((g) => ({ group: 'Interface requirement', kind: 'gate' as const, id: g.id, checks: g.short, basis: g.basis })),
  ...CHANGE_GATES.map((g) => ({ group: 'Change request', kind: 'gate' as const, id: g.id, checks: g.short, basis: g.basis })),
  ...PART_RULES.map((g) => ({ group: 'Part rule', kind: g.kind === 'gate' ? ('gate' as const) : ('advisory' as const), id: g.id, checks: g.short, basis: g.basis })),
]

// ------------------------------------------------------------------------------------------- Markdown
const cite = (c: Citation) => formatCitation(c)
const md = (s: string) => s.replace(/\|/g, '\\|')

/** The same instructions as the Laboratory page, as Markdown (docs/lectures/week05/WEEK5_LAB_INSTRUCTIONS.md). */
export function labMarkdown(): string {
  const L: string[] = []
  const table = (head: string[], rows: string[][]) => {
    L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`)
    for (const r of rows) L.push(`| ${r.map((c) => md(c).replace(/\n/g, ' ')).join(' | ')} |`)
    L.push('')
  }
  L.push(`# Week 5 ${LAB_TITLE}`, '')
  L.push('> Generated from `learning-studio/src/content/lab/week05Lab.ts` by `npm run lab:md`; the Laboratory page (`#/week/5/lab`) renders the same source. Do not edit this file by hand. Review status: new-pending-review.', '')
  L.push(`Week 5 — ${W5.title}. AeroLink is the instructor’s FICTIONAL worked example; this record is about your team’s own enterprise.`, '')
  L.push('## Purpose', '', LAB_PURPOSE.text, '')
  table(['', ''], LAB_AT_A_GLANCE.map((x) => [`**${x.label}**`, x.value]))
  L.push('## Inputs', '')
  for (const i of LAB_INPUTS) L.push(`- ${i.text.text}${i.cites ? ` ${i.cites.map(cite).join('; ')}.` : ''}`)
  L.push('', '## Objectives', '')
  for (const o of LAB_OBJECTIVES) L.push(`- **${o.id}** ${o.text}${o.proposed ? ' *(proposed, pending faculty approval)*' : ''}`)
  L.push('', '## Engineering method', '')
  LAB_METHOD.forEach((m, i) => L.push(`${i + 1}. **${m.title}.** ${m.text.text} *(Taught in: ${m.taught}.)*`))
  L.push('', '## Procedure', '')
  table(['Step', 'When', 'Who (lead role)', 'Output', 'What to do'], LAB_PROCEDURE.map((p, i) => [`${i + 1}. ${p.step}`, p.when, p.who, p.output, p.detail.text]))
  L.push('## Expected outputs', '', 'Two files, exported from the lab tool after the last change:', '')
  for (const f of LAB_OUTPUT_FILES) L.push(`- \`${f.name}\`: ${f.what}.`)
  L.push('', 'The Week 5 work adds four parts to the Team Record and updates one. The minimum is the completeness check the lab tool and the instructor apply first.', '')
  table(['Part', 'Evidence required', 'Minimum (completeness check)', 'Judged by'], LAB_PARTS.map((p) => [p.heading, p.evidence.text, p.minimum, p.judged]))
  L.push('## Why each check blocks, or only advises', '', 'A hard gate stops an entry counting only where the lecture says the failure is a real defect; anything that can occur in good work is an advisory, shown and never blocking. No check tests the form of a name.', '')
  table(['Where', 'Check', 'Hard gate or advisory', 'What it checks', 'Basis'], GATE_TABLE.map((g) => [g.group, g.id, g.kind === 'gate' ? 'hard gate' : 'advisory', g.checks, g.basis]))
  L.push('## Grading rubric rows', '', LAB_RUBRIC_NOTE.text, '')
  const label = (rb: string, r: string[]) => `${rb}.${r[0].split('.')[1]} ${r[1]}`
  table(['Criterion', ...RUBRIC_LEVELS], [
    ...LAB_RUBRIC_ROWS.map(([rb, c]) => {
      const r = rubricRow(rb, c)
      return [label(rb, r), ...r.slice(2, 6)]
    }),
    ...PROPOSED_RUBRIC.map((p) => [`${p.id} ${p.criterion}`, ...p.levels]),
  ])
  table(['Criterion', 'Condition checked per interface requirement'], LAB_RUBRIC_CONDITION_ROWS.map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [label(rb, r), r[2]]
  }))
  L.push('### Level descriptors for the lab criteria', '')
  table(['Criterion', ...RUBRIC_LEVELS], LAB_LEVELS.map((x) => [x.criterion, ...x.levels]))
  L.push('## Submission', '')
  L.push(`- **Format.** ${LAB_SUBMISSION.format.text}`, `- **Where and when.** ${LAB_SUBMISSION.where.text}`, `- **How it is graded.** ${LAB_SUBMISSION.grading.text}`, `- **AI use.** ${LAB_SUBMISSION.aiUse}`, `- **Graduate task.** ${LAB_SUBMISSION.graduate.text}`, '')
  L.push('## The lab tool', '', LAB_TOOL.text, '')
  L.push('## Workload', '')
  table(['Activity', 'Hours per student'], LAB_WORKLOAD.map((w) => [w.activity, w.hours ? w.hours.toFixed(1) : 'in class']))
  L.push(LAB_WORKLOAD_NOTE.text, '')
  return L.join('\n')
}
