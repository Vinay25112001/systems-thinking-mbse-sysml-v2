// New prose of the Week 1 textbook (Milestone M4 part B, DECISION_LOG A23–A26): the seventeen gap sections the IA asked
// for (docs/week1/WEEK1_TEXTBOOK_IA.md §6; spec §d.10). Written in the content store's block format, so it is publishable
// through the same pipeline as the reused lesson text. Review status: new-pending-review (two-reviewer claim check
// outstanding, spec §d.10 rule 4).
//
// Rules followed (directive §5, §20; spec §d.10):
// - every definition is quoted verbatim, inside “…”, from a verified register entry at the cited page; every sourced claim
//   carries an inline register code ("(R13 p.565)") that Learn renders as a numbered footnote (no code reaches students);
// - where no source in the collection defines a term, the text says so and labels the working meaning a course convention;
// - AeroLink facts are READ from the case modules (week01/aerolinkCase.ts and, for the scenarios and the Week 2 discoveries,
//   week02/aerolinkCase.ts), never retyped; counts are computed; fictional values are labelled as such (the case's
//   internal provenance words are turned into student wording at render time, studentText.ts, as for reused text);
// - the §14 typed relations are course conventions for engineering traceability, never SysML semantics;
// - students see "objectives" for MGO-002… (A25); "goal" appears only inside quotations of a source.
// The claim extraction behind each citation is listed in learning-studio/docs/week1/M4B_REPORT.md.
// Content modules never import React.
import { CASE_FACTS, CONFLICT, DELIBERATE_GAP, ENTERPRISE, EXTERNAL_SYSTEMS, MISSION_GOALS, NEEDS, NOISE_AGREEMENT, PROBLEM_STATEMENT, RELATIONSHIPS, RELATIONSHIP_VERB, ROLE_GROUP_LABEL, STAKEHOLDERS, SYSTEM_OF_INTEREST, WIDER_SOI_OWNERS, need, numberWord, stakeholder, type RelationshipType } from '../../content/lectures/week01/aerolinkCase'
import { REL_TYPES } from '../../content/lectures/week01/labBrief'
import { DISCOVERIES, SCENARIOS } from '../../content/lectures/week02/aerolinkCase'
import { MODEL_INPUTS } from '../../content/learn/week01'
import type { LessonBlock } from '../../content/lectures/types'

const para = (text: string): LessonBlock => ({ kind: 'para', text })
const W = (n: number) => numberWord(n)
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const low = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const andList = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`)
const stkName = (id: string) => stakeholder(id).name
const stk = (id: string) => `${stkName(id)} (${id})`
const mission = MISSION_GOALS.find((m) => m.level === 'mission')!
const objectives = MISSION_GOALS.filter((m) => m.level !== 'mission')
const ext = (id: string) => EXTERNAL_SYSTEMS.find((e) => e.id === id)!

/** The FAA realism note (A25) is placed by textbook.ts; this module never states anything about the real FAA. */

// ================================================================================================ chapter 1
/** 1.2 How this textbook and the week fit together (course framing; IA ch01-02). */
export const CH01_02: LessonBlock[] = [
  para('The five stages are one sequence, not five versions of the same page. Each concept of the week appears in every stage, but for a different purpose each time. Learn explains it: the definition, its source, the method and a worked AeroLink example. Guided Practice lets you rehearse the method on AeroLink, where a right answer exists and the feedback explains it; nothing there is graded. My Project / Lab is where the method is applied to your team’s own enterprise and the results are recorded with stable identifiers, which later weeks import. Review & Submit checks that work against stated criteria before it is frozen as a submission.'),
  para('Two habits follow. When a step in My Project is unclear, return to the Learn section that teaches it rather than to the AeroLink example: the example shows one application, the section shows the reasoning you need for yours. And read the chapters before the session that uses them, because the sessions assume the definitions and spend their time on judgment.'),
]

const roleGroupCounts = () => {
  const m = new Map<string, number>()
  for (const s of STAKEHOLDERS) m.set(ROLE_GROUP_LABEL[s.roleGroup], (m.get(ROLE_GROUP_LABEL[s.roleGroup]) ?? 0) + 1)
  return [...m.entries()].map(([g, n]) => `${g.charAt(0).toLowerCase()}${g.slice(1)} (${n})`)
}

/** 1.3 The case in one place (IA §3 "content missing today"): read from aerolinkCase.ts and the Week 2 scenarios. */
export const CH01_03: LessonBlock[] = [
  para('The case in outline, in the order the rest of the textbook uses it. Every value is a fictional teaching value.'),
  {
    kind: 'bullets',
    items: [
      `**Enterprise (${ENTERPRISE.id}).** ${ENTERPRISE.text}`,
      `**Problem.** ${PROBLEM_STATEMENT}`,
      `**Mission (${mission.id}).** ${mission.name}. It is broken into ${W(objectives.length)} objectives: ${objectives.map((o) => `${o.id} ${o.name.charAt(0).toLowerCase()}${o.name.slice(1)}`).join('; ')}.`,
      `**System of interest (${SYSTEM_OF_INTEREST.id}).** ${cap(SYSTEM_OF_INTEREST.name)}: what AeroLink controls (${SYSTEM_OF_INTEREST.controlled.join(', ')}) plus what the service needs but AeroLink does not control (${SYSTEM_OF_INTEREST.wider.join(', ')}). Its boundary in one sentence: the service is drawn at the *wider* system of interest, which includes elements it needs but does not control (section 4.3 defines the term), and everything it exchanges with across that line is its context.`,
      `**Operating concept.** ${cap(W(SCENARIOS.length))} operational scenarios, which return in Week 2 as the backbone of the concept of operations: ${SCENARIOS.map((s) => `${s.id} ${s.name} (${s.summary.charAt(0).toLowerCase()}${s.summary.slice(1).replace(/\.$/, '')})`).join('; ')}.`,
      `**Operational environment.** ${cap(W(EXTERNAL_SYSTEMS.length))} external systems: ${EXTERNAL_SYSTEMS.map((e) => `${e.short.toLowerCase()} (${e.id})`).join(', ')}; section 4.4 sets them out.`,
      `**Stakeholders.** ${cap(W(STAKEHOLDERS.length))} in the register, by role group: ${roleGroupCounts().join(', ')}. Chapter 6 builds the register and section 6.7 shows it in full.`,
    ],
  },
]

const factRows = (): string[][] => [
  ['The class of system: electric air taxis that take off and land vertically, vertiports, urban air mobility', 'Real and emerging', 'The kind of service is real and under development worldwide; it is described generically, and no real program’s data is used.'],
  [`The company ${ENTERPRISE.name}, its partners and its metropolitan region`, 'Fictional', 'Invented for teaching.'],
  ['Fleet, network, operating day, trip and charge', 'Fictional teaching values', CASE_FACTS.slice(0, 5).join('; ') + '.'],
  ['The local noise agreement', 'Fictional; partly a teaching assumption', `${NOISE_AGREEMENT.perEvent.replace(' (Data Sheet)', '')}; the noise-sensitive hours and the event cap are teaching assumptions.`],
  ['The problem statement and its numbers', 'Fictional', PROBLEM_STATEMENT],
  ['The mission and objectives (MGO)', 'Fictional', 'Written to show the form of a mission and its objectives.'],
  [`${stk('STK-002')}`, 'A real regulator, named for realism', 'Its role is simplified; nothing in the case describes actual FAA requirements or processes.'],
  [`${stk('STK-007')}`, 'A real kind of organization, unnamed', 'No real provider is described.'],
  ['Interest, influence and support ratings; need priorities', 'Teaching assumptions', 'The instructor’s judgment, each with a stated reason you may challenge.'],
  ['Stakeholders, concerns, needs and relationships', 'Fictional teaching content', 'Written to be plausible and internally consistent, not as evidence about real air-taxi services.'],
  ['Sourced definitions, methods and quotations', 'Real', 'From the course collection (SEBoK, MITRE, DoD), cited by page in the footnotes. Course conventions are labelled as such where they appear.'],
]

/** 1.4 Real and fictional (G10; IA §3 table), after the A25 FAA note that textbook.ts places first. */
export const CH01_04: LessonBlock[] = [
  para('AeroLink is useful because it is concrete, and dangerous for the same reason: a precise number reads like a fact. The table below states, kind of fact by kind of fact, what is real and what was invented for teaching. A **teaching assumption** is a value the instructor chose so that the methods have something to work on; it is labelled wherever it appears.'),
  { kind: 'table', caption: 'What in the AeroLink case is real, and what is fictional or a teaching assumption.', header: ['Kind of fact', 'Status', 'What that means'], rows: factRows() },
  para('Two rules follow for your own work. Never quote an AeroLink value as evidence about a real air-taxi service, a real regulator or your own enterprise. And hold your own proposal to the same standard the table applies to AeroLink: a number about your enterprise either has a source or is recorded as your team’s assumption (section 5.3).'),
]

/** 1.5 Adapting the methods (IA ch01-05; course framing). */
export const CH01_05: LessonBlock[] = [
  para('Each method transfers as a question, not as an answer. The life-cycle sweep asks who is involved at each stage of *your* system’s life; the context asks who runs each of *your* external systems. Expect different counts, role groups, ratings and needs from AeroLink’s, and do not copy its wording: a register that mirrors the example is a sign that the method was skipped. Rehearse each method on AeroLink in Guided Practice first, then apply it to your enterprise.'),
]

// ================================================================================================ chapter 2
/** 2.4 Elements, interactions, purpose and emergence (G2). */
export const CH02_04: LessonBlock[] = [
  para('The three definitions in section 2.3 combine the same ingredients in different proportions: elements, the interactions among them, and either a purpose or a property the parts do not have alone. This primer takes them one at a time, because every method this week works on one of them.'),
  { kind: 'definition', term: 'System element (SEBoK glossary, after ISO/IEC/IEEE 15288:2015)', text: '“A member of a set of elements that constitutes a system. A system element is a discrete part of a system that can be implemented to fulfill specified requirements.”', source: { reading: 'R102', pages: '1643' } },
  para('**Elements.** The same entry lists hardware, software, data, humans, processes, procedures, facilities, materials and naturally occurring entities as possible elements (R102 p.1643). In the air-taxi service the aircraft are elements, and so are the dispatchers, the dispatch procedure and the booking data.'),
  para('**Interactions.** SEBoK’s systems-thinking concepts call interaction between elements the “key” system concept, after Hitchins, and define an open system by the interactions between elements inside its boundary and those with other systems in its environment (R03 p.268). Much of the engineering lives in interactions: an aircraft is dispatchable only after it has interacted with a charger, and a charger draws power only through the grid connection.'),
  { kind: 'definition', term: 'Purpose (SEBoK glossary, after Blockley and Godfrey)', text: '“What the system is for, and why the different stakeholders are willing to participate in the system lifecycle.”', source: { reading: 'R110', pages: '1599' } },
  para('**Purpose.** Beyond what the system is for (section 2.3), this entry adds why people take part. Its second half is the bridge to chapter 6: a purpose that the stakeholders will not participate in has not yet been found.'),
  { kind: 'definition', term: 'Emergence (SEBoK glossary, after Checkland)', text: '“The principle that whole entities exhibit properties which are meaningful only when attributed to the whole, not to its parts.”', source: { reading: 'R39y', pages: '1491' } },
  para('**Emergence.** Average passenger waiting time is AeroLink’s clearest emergent property: no aircraft, charger or dispatcher has a waiting time, yet the service does, and adding aircraft does not shorten it when the chargers are the limit (section 4.1).'),
  para('**Why this matters for the week.** The boundary (chapter 4) decides which elements and interactions are inside; stakeholders care mostly about emergent properties such as waiting time, noise exposure and safety, which is why needs are written about the whole service rather than about a part (sections 9.4–9.5). In Week 8 the elements inside the boundary become parts of the system in the model.'),
]

/** 2.4 extension reading (optional, not counted; review package A): the two aspects of emergence. */
export const CH02_04_EXT: LessonBlock[] = [
  para('**Two aspects of emergence.** The glossary entry’s discussion separates two aspects: a property can be emergent relative to a description of an object as interacting elements, or it can arise physically when elements are allowed to interact (R39y p.1491). The INCOSE Fellows definition in section 2.3 makes emergence part of what a system is (R38 p.1637), and SEBoK adds that the whole can also be less than the sum of its parts (R03 p.271).'),
]

// ================================================================================================ chapter 3
/** 3.1 What systems thinking is (G1; review F1): the SEBoK glossary entry (p.1660), MITRE pp.45–46, SEBoK pp.264–266. */
export const CH03_01: LessonBlock[] = [
  para('There is no single agreed definition of systems thinking. The course collection records several, and they stress different things. The SEBoK glossary gives three, attributed to Checkland and to Senge; two of them read:'),
  { kind: 'definition', term: 'Systems thinking (SEBoK glossary, after Checkland and Senge)', text: '“An epistemology which, when applied to human activity is based on four basic ideas: emergence, hierarchy, communication, and control as characteristics of systems” (Checkland); “A discipline for examining wholes, interrelationships, and patterns utilizing a specific set of tools and techniques” (Senge).', source: { reading: 'R113', pages: '1660' } },
  para('The entry’s discussion explains the difference: the first is the systems-science view, a theory of knowledge built on seeing the world as systems; the others treat systems thinking as a collection of methods for dealing with system problems, which SEBoK relates directly to its systems approach (R113 p.1660). MITRE gives two definitions of the same two kinds:'),
  { kind: 'definition', term: 'Systems thinking (MITRE, after Senge and Bar-Yam)', text: '“The ability and practice of examining the whole rather than focusing on isolated problems” (after Senge); “the act of taking into account the interactions and relationships of a system with its containing environment” (after Bar-Yam).', source: { reading: 'R50', pages: '45' } },
  para('MITRE’s background adds the premise behind them: systems thinking is “a framework for solving problems based on the premise that a component part of an entity can best be understood in the context of its relationships with other components of the entity, rather than in isolation”, and it is often used where cause and effect are not close in space or time, or where the relationships between components are nonlinear (R50 p.46).'),
]
/** 3.1 extension reading (optional, not counted; review package A): the perspectives of SEBoK's article. */
export const CH03_01_EXT: LessonBlock[] = [
  para('**Perspectives in SEBoK’s article.** Besides the glossary entry, SEBoK’s article “What is Systems Thinking?” collects perspectives rather than one definition, among them Senge’s “a discipline for seeing wholes” and “a framework for seeing interrelationships rather than things”, and Churchman’s view that “the systems approach begins when first you see the world through the eyes of another” (R02 p.265). From these it concludes that systems thinking is both a set of founding ideas for systems theories and practices and a pervasive way of thinking needed by those who develop and apply them (R02 p.266), and it treats the concepts, principles and patterns of systems thinking as the starting point for dealing with real-world situations (R02 p.264).'),
]
export const CH03_01_END: LessonBlock[] = [
  para('This course uses systems thinking in the practical sense: before deciding anything about a part, ask what whole it belongs to, what it interacts with, and how the people outside it see it. On AeroLink, the recorded conflict between the communities and the vertiport operators (section 9.6) is a systems-thinking finding: neither party’s concern is visible as a conflict until both are seen against the same variable, the number of take-offs and landings in the evening and early morning. The rest of the chapter gives the tools: the paradox that limits how far the whole can be seen (3.2), the principles (3.3), and analysis and synthesis (3.4).'),
  { kind: 'callout', tone: 'caution', title: 'Common error', text: 'Treating systems thinking as drawing a bigger diagram. A larger boundary is not more systemic; a boundary is judged by whether it holds the interactions that matter for the question (section 4.1).' },
]

// ================================================================================================ chapter 4
const envRows = (): string[][] => [
  [`${ext('EXT-003').name} (${ext('EXT-003').id})`, 'Natural', `${cap(ext('EXT-003').exchange)}; it has no owner, so no stakeholder stands behind it`, 'NEED-002 (flight within the approved weather limits), NEED-011 (disruption)'],
  [`${ext('EXT-002').name} (${ext('EXT-002').id})`, 'Engineered', `${cap(ext('EXT-002').exchange)}; run by the ${low(stkName(ext('EXT-002').owner!))}`, 'NEED-010 (charging load within the connection)'],
  [`${ext('EXT-001').short} (${ext('EXT-001').id})`, 'Engineered', `${cap(ext('EXT-001').exchange)}; run by the ${low(stkName(ext('EXT-001').owner!))}`, 'NEED-009 (flight intent known before entry)'],
  [`${ext('EXT-005').name} (${ext('EXT-005').id})`, 'Engineered', `${cap(ext('EXT-005').exchange)}; its operator is not in the register (section 6.3)`, 'NEED-016 (sites connected to public transport)'],
  [`${ext('EXT-006').name} (${ext('EXT-006').id})`, 'Engineered and social', `${cap(ext('EXT-006').exchange)}; run by the ${low(stkName(ext('EXT-006').owner!))}`, 'NEED-006 (early warning and access for a fire)'],
  [`${ext('EXT-004').name} (${ext('EXT-004').id})`, 'Engineered', `${cap(ext('EXT-004').exchange)}; run by the ${low(stkName(ext('EXT-004').owner!))}`, 'None: the manufacturer’s concern is a matter of the purchase agreement (section 10.3)'],
  ['The city and the neighborhoods around the vertiports', 'Social', `The local noise agreement (${NOISE_AGREEMENT.perEvent.replace(' (Data Sheet)', '')}; an event cap in the noise-sensitive hours, a teaching assumption)`, 'NEED-003 (noise exposure within the agreement)'],
]

/** The operational environment (G8), canonical id ch04-03, shown after the four context layers (review F3). */
export const CH04_03: LessonBlock[] = [
  { kind: 'definition', term: 'Operational environment (SEBoK glossary)', text: '“The environment in which systems are deployed. The problem or opportunity in response to which the system has been developed, exists in this environment.”', source: { reading: 'R111', pages: '1580' } },
  para('Of the two meanings of *environment* in section 4.2, the second separates environments by life-cycle stage (section 4.2 names AeroLink’s); the operational environment is the one the service meets when it runs. The entry’s discussion says why it deserves its own analysis: it is a significant factor in defining the needed capabilities, the outcomes and benefits stakeholders want, and the constraints (R111 p.1580). Its second sentence matters as much: the problem the system answers lives in the operational environment, so a team that has not described that environment cannot state its problem precisely.'),
  para('AeroLink’s operational environment is the immediate environment of section 4.3 in operation, plus a social setting that sets limits without exchanging material, energy or information: the city and the neighborhoods around the vertiports, through the noise agreement. Describing it is the first check on the needs set: every part of it should constrain at least one need or carry a recorded reason why not. In Week 2 the concept of operations describes the operational environment in detail, with its assumptions, constraints, numbers and capacity, as MITRE recommends (R52 p.302).'),
]
/** Extension reading (optional, not counted; review package B): the environment sorted by kind, with the needs it constrains. */
export const CH04_03_EXT: LessonBlock[] = [
  para('The table sorts AeroLink’s operational environment by kind and shows which need each part constrains; the kind and the need are the instructor’s analysis of the case.'),
  { kind: 'table', caption: 'AeroLink’s operational environment in operation (fictional teaching case).', header: ['Part of the environment', 'Kind', 'What it exchanges or imposes', 'Need it constrains'], rows: envRows() },
]

const ownerLines = () => {
  const owned = [...WIDER_SOI_OWNERS.map((o) => `${stk(o)}: ${SYSTEM_OF_INTEREST.wider[0]}`), ...EXTERNAL_SYSTEMS.filter((e) => e.owner).map((e) => `${stk(e.owner!)}: ${e.short.toLowerCase()}`)]
  return owned.join('; ')
}
/** 4.5 Owners of constraints (IA ch04-05). */
export const CH04_05: LessonBlock[] = [
  para(`An **owner of a constraint** is the stakeholder behind an element the system of interest needs but does not control (course term). For AeroLink: ${ownerLines()}. Recording the owner turns a fixed limit into a party to negotiate with, which is Method 2 of section 6.3 seen from the boundary. The weather has no owner, so its constraint is managed through operating limits, not agreement.`),
]

// ================================================================================================ chapter 5
const disc = (id: string) => DISCOVERIES.find((d) => d.id === id)!
/** 5.3 Assumptions and unknowns (G9; A25 answer 4: optional, recorded with rationale). Extension reading (optional, not
 *  counted; review package A). */
export const CH05_03_EXT: LessonBlock[] = [
  { kind: 'heading', text: 'Assumptions and unknowns' },
  para('Business or Mission Analysis is done with incomplete knowledge, and the gaps should be written down rather than hidden in a mission or a rating. No source in the course collection defines *assumption* or *unknown* for this use, so both working meanings are **course conventions**. An **assumption** is a statement the team treats as true for now without evidence, recorded so that someone can confirm or reject it. An **unknown** is a fact the team needs but does not yet have. SEBoK’s glossary names the condition behind an unknown: uncertainty is “the result of not having accurate or sufficient knowledge of a situation” (R39s p.1668). Its requirements practice marks an unknown value “To Be Determined” (TBD) and a low-confidence value “To Be Resolved” (TBR), notes that tracking them shows how mature a set is, and warns that unresolved ones can lead to risk (R13 p.565).'),
  para(`On AeroLink, the noise-sensitive hours and the event cap are teaching assumptions until they are quantified with the city. Week 2 shows how such items surface: writing scenario SCN-005 exposed assumption ${disc('A-008').id} (“${disc('A-008').text}”) and unknown ${disc('U-001').id} (“${disc('U-001').text}”).`),
  para('In your Week 1 record, assumptions and unknowns are optional (course rule). Record each one that your proposal, register or needs depend on, with its rationale and who could confirm it; Weeks 2 and 3 carry them forward.'),
]

const needsByObjective = () =>
  MISSION_GOALS.map((m) => {
    const ns = NEEDS.filter((n) => n.mgo === m.id)
    const holders = [...new Set(ns.flatMap((n) => n.sources.map((s) => s.stakeholder)))]
    return [`${m.id} ${m.name}`, m.level === 'mission' ? 'Mission' : 'Objective', ns.map((n) => n.id).join(', ') || 'none', holders.map((h) => stkName(h)).join(', ') || 'none']
  })

/** 5.4 Mission ↔ stakeholders ↔ needs (G4/G5). */
export const CH05_04: LessonBlock[] = [
  para('Three terms carry the reasoning from section 5.3 onward, so their status in the sources matters. SEBoK’s glossary defines a mission at the level of a system, not an enterprise:'),
  { kind: 'definition', term: 'Mission (SEBoK glossary)', text: '“The mission of a system is the top-level function of the system; the one that synthesizes all transformation of all inputs and solicitations into outputs and reactions.”', source: { reading: 'R39z', pages: '1565' } },
  para('The Business or Mission Analysis article uses the word in the enterprise sense this week needs, and describes rather than defines the levels below it: the mission statement rests on the analysis of the problem, threat or opportunity and says why the project exists; “Goals are elaborated from the mission statement to communicate what must be achieved to result in a successful mission”; and “Objectives are elaborated from the goals to provide more details concerning what must be done that will result in the goals and mission to be achieved” (R10 p.543). This course records the levels below the mission as objectives (section 5.3). No source in the collection defines a *problem statement*; SEBoK gives a four-step procedure that ends in stakeholder concurrence with the statement, and an example (R10 p.545).'),
  para('The three constrain each other in both directions. **Stakeholders shape the mission:** they are identified in the same process (section 5.3), and the questions that turn a mission into objectives and measures are put to them: how do they define success, and what would they measure (R10 p.545). **The mission shapes the needs:** the integrated set of needs is expected to reflect the mission, objectives and measures (section 5.3). **The needs test the mission:** a need that serves no objective is either outside the scope or evidence of an objective nobody wrote down, and a stakeholder with no need is either a recorded decision or a gap (section 10.3).'),
  { kind: 'table', caption: `AeroLink’s ${W(NEEDS.length)} needs grouped by the mission or objective each serves, with the stakeholders behind them (fictional teaching case).`, header: ['Mission or objective', 'Level', 'Needs', 'Stakeholders behind them'], rows: needsByObjective() },
  para(`Read the table both ways. Down a row, it shows whose needs an objective rests on; across the register, it shows that every stakeholder but one appears somewhere. The exception, ${stk(DELIBERATE_GAP.stakeholder)}, is the deliberate gap examined in section 10.3. The course rule that follows: every need traces to the mission or an objective, and when a stakeholder’s need traces to nothing, ask the instructor whether the mission is too narrow or the need is out of scope, and record the answer.`),
  { kind: 'callout', tone: 'caution', title: 'Common error', text: 'Writing the mission last, to fit the needs. The mission comes from the problem; when the needs do not fit it, that mismatch is a finding to resolve, not a reason to rewrite the mission silently.' },
]

// ================================================================================================ chapter 7
const highInterest = STAKEHOLDERS.filter((s) => s.interest === 5).map((s) => low(s.name))
/** 7.2 Interest as distinct from concern (G7a; review F4: an interest is content; its level is the rating). */
export const CH07_02: LessonBlock[] = [
  para(`The sources use *interest* without defining it, and always as content: ISO/IEC/IEEE 15288:2015 speaks of “a right, share, claim, or interest in a system” (R39a p.1631), the 26702 wording quoted in section 7.1 places interests and concerns side by side, and MITRE’s stakeholder management identifies “the interests they represent” (R63 p.234). No source in the collection separates the terms, so this course does (**course convention**): a stakeholder’s **interest** is what is at stake for it in the system of interest; a **concern** is a specific topic it wants the system of interest to address; and the register’s **level of interest** rates how much is at stake, from 1 to 5, with a reason. One interest can give rise to several concerns. On AeroLink the ${andList(highInterest)} have the highest level of interest, 5; the passengers alone hold ${W(stakeholder('STK-001').concerns.length)} concerns. In your register, the level of interest with a short reason is required; influence and support are optional (course rule). A low level of interest never removes a concern from the record.`),
]

const REL_DEF: Record<RelationshipType, string> = {
  regulates: 'A has the authority to set rules for, approve or certify what B does or supplies.',
  funds: 'A provides money on which B’s part in the enterprise depends.',
  supplies: 'A provides a product, service or resource that B uses.',
  'affected-by': 'B’s decisions or actions influence A.',
  'partners-with': 'A and B cooperate under an agreement toward a shared aim, each keeping its own interests.',
  'coordinates-with': 'A and B must align plans or procedures to operate together, with no authority of one over the other.',
  'conflicts-with': 'A’s and B’s concerns or needs pull against each other on a shared variable, so satisfying one constrains the other.',
}
const relRows = (): string[][] =>
  REL_TYPES.map((t) => {
    const ex = RELATIONSHIPS.filter((r) => r.type === t)
    return [`${cap(RELATIONSHIP_VERB[t])}`, REL_DEF[t], ex.map((r) => r.id).join(', ') || 'none recorded']
  })

/** 7.3 The seven relationship types (G7b), before the IF-6 ecosystem map. */
export const CH07_03: LessonBlock[] = [
  para(`The register records relationships of ${W(REL_TYPES.length)} types. None is defined in the course collection, so each definition below is a **course convention**, written so that two reviewers would classify the same relationship the same way. Read every relationship as “A *type* B”; the direction matters for all but *conflicts with*, *coordinates with* and *partners with*. *Influences* is the umbrella word for all seven. In the map below, an arrow points in the direction of influence (for *is affected by*, from B to A), and a line without an arrowhead is mutual.`),
  { kind: 'table', caption: `The seven relationship types (course convention), with the AeroLink relationships of each type; the table after the map lists all ${W(RELATIONSHIPS.length)} (fictional teaching case).`, header: ['Type', 'Meaning (course convention)', 'AeroLink'], rows: relRows() },
  para('Choose the most specific type that is true, and say in the note what flows or what is at stake. The map below lets you see the same relationships as a network: select a stakeholder to list its concerns and relationships, and filter by type.'),
]

// ================================================================================================ chapter 8
/** 8.4 Introducing the elicitation plan as the instructor’s reasoning (IA ch08-04): two sentences before the plan table. */
export const CH08_04_INTRO: LessonBlock[] = [
  para('The plan below applies the question of section 8.1, what is most needed from each stakeholder, to five AeroLink stakeholders and names the techniques that answer it. It is the instructor’s reasoning, a worked course example rather than a prescription: the techniques are sourced, the choices are judgment you may argue with.'),
]

// ================================================================================================ chapter 10
/** 10.1 Identifiers are engineering data (G6a). */
export const CH10_01: LessonBlock[] = [
  { kind: 'definition', term: 'Traceability (SEBoK glossary, after IEEE 1233)', text: '“The degree to which a relationship can be established between two or more products of the development process, especially products having a predecessor-successor or master-subordinate relationship to one another.”', source: { reading: 'R112', pages: '1666' } },
  para('Traceability is therefore a property of the work products, and SEBoK lists *traceable* among the characteristics of a well-formed requirement (R23a p.635). A relationship can be established only between things that can be named unambiguously, and an identifier is that name. The rules below are **course conventions**: an identifier is a prefix and a number (STK-010, NEED-010); it keeps one meaning for its whole life, even when the name or the wording changes; a retired identifier is never reused; and only the prefix owner named in the charter assigns new ones (section 11.3). When AeroLink’s compound needs were split, each second half took a new identifier (NEED-016, NEED-017) rather than a suffix on the old one, so that every existing trace to the first half stayed true.'),
]

const cOf = (s: string) => STAKEHOLDERS.find((x) => x.id === s)!.concerns[0]
const n10 = need('NEED-010')
const traceRows = (): string[][] => {
  const src = n10.sources.find((s) => s.role === 'subject')!
  const rel = RELATIONSHIPS.find((r) => r.source === src.stakeholder)!
  const obj = MISSION_GOALS.find((m) => m.id === n10.mgo)!
  const [a, b] = CONFLICT.between
  return [
    ['Stakeholder has concern', 'STK → CON', 'The stakeholder named on each concern', `${src.stakeholder} has ${src.concern}`],
    ['Stakeholder expresses need', 'STK → NEED', 'The need’s source stakeholders', `${src.stakeholder} expresses ${n10.id}`],
    ['Concern motivates need', 'CON → NEED', 'The concerns a need answers', `${src.concern} motivates ${n10.id}`],
    ['Need supports mission or objective', 'NEED → MGO', 'The objective a need serves', `${n10.id} supports ${obj.id}`],
    ['Objective elaborates mission (a course addition, after SEBoK’s “elaborated”, section 5.4)', 'MGO → MGO-001', 'The objectives under the mission', `${obj.id} elaborates ${mission.id}`],
    ['Stakeholder influences stakeholder', 'STK → STK', 'A relationship of one of the seven types (section 7.3)', `${rel.id}: ${rel.source} ${RELATIONSHIP_VERB[rel.type]} ${rel.target}`],
    ['Conflicting concerns', 'CON ↔ CON', 'The recorded conflict and the needs it links', `${cOf(a)} and ${cOf(b)} (${CONFLICT.relationship} links their stakeholders)`],
    ['Artifact has documented rationale', 'any artifact', 'A rationale field (an attribute, not a link)', `${n10.id}: “${n10.rationale}”`],
  ]
}

/** 10.2 The Week 1 typed relations (G6b), before the IF-7 progressive trace. */
export const CH10_02: LessonBlock[] = [
  para('SEBoK recommends deciding early which relationships a project will keep: defining a traceability relationship model at the beginning of the project “enables an understanding of which relationships will be established and managed via traceability throughout the development of the SoI”, and traceability then helps ensure that requirements trace to their needs and lets a team assess the impact of a change (R13 p.565). Business or Mission Analysis already expects traceability from the problem and the mission and objectives to the preferred solution classes (R10 p.544).'),
  para('Week 1’s relationship model is the table below. Its relations are **course conventions for engineering traceability**: they are not SysML relationships, they claim no SysML semantics, and how each is modeled is decided in Week 8 (course working mapping). The chain from enterprise to need is not necessarily linear: a stakeholder reaches the mission only through its concerns and needs, and one need may have several sources.'),
  { kind: 'table', caption: 'The Week 1 typed relations (course convention), each with an AeroLink example read from the case (fictional teaching case).', header: ['Relation', 'Between', 'Where it is recorded', 'AeroLink example'], rows: traceRows() },
  para('A trace is read in both directions. Forward, it answers why an artifact exists: NEED-010 exists because the utility holds a concern about peak load. Backward, it answers what a change touches: if an objective is dropped, every need that supports it must be re-traced or retired with a reason. The figure below walks one chain step by step.'),
  { kind: 'callout', tone: 'caution', title: 'Common error', text: 'Recording a trace as a sentence in a description field. A relation that is not recorded against both identifiers cannot be audited, counted or imported in Week 8.' },
]

/** The fields the Week 1 record captures for stakeholders (A25: level of interest required, influence and support optional).
 *  Read from MODEL_INPUTS, corrected to the A25 stakeholder fields (review F6). */
const capturedFor = (r: (typeof MODEL_INPUTS.rows)[number]) => r.captured
/** 10.5 Summary of the model-input rows (course working mapping); My Project's Week 8 preview shows the team's own.
 *  Extension reading (optional, not counted; review package A). */
export const CH10_05_EXT: LessonBlock[] = [
  para('The table summarizes what each Week 1 item later seeds. The targets are a **course working mapping**, not a claim of SysML conformance: Week 8 teaches the elements and settles each mapping. My Project’s Week 8 preview shows the same mapping applied to your own records.'),
  { kind: 'table', caption: 'What each Week 1 item seeds in the Week 8 model (course working mapping).', header: ['Week 1 item', 'What is captured now', 'Week 8 element'], rows: MODEL_INPUTS.rows.map((r) => [r.item, capturedFor(r), r.seeds.map((s) => s.element).join('; ')]) },
  para('Week 2 uses the same records first: the context and the scenarios feed the concept of operations, stakeholders reappear as scenario actors, and any assumptions and unknowns go to the uncertainty register.'),
]

// ================================================================================================ chapter 11
const proposalRows: string[][] = [
  ['Enterprise, not organization', 'A regional hospital network, its courier contractor and a drone-delivery partner that share one mission', '“Our enterprise is a hospital”: one organization, no shared mission across partners'],
  ['System of interest inside it', 'The blood-and-sample delivery service: dispatch, couriers, drones and the handover points at each hospital', 'None stated, or the same as the enterprise'],
  ['Problem, stated without a solution', 'Urgent samples between the hospitals take too long and too unpredictably by road at peak hours', '“We need a drone app”: a solution, not a problem'],
  ['Several interacting parts, people as well as technology', 'Dispatchers, couriers, drones, lab staff and procedures interact', 'A single device with its software'],
  ['Exchanges across the boundary', 'Airspace, road traffic, the hospitals’ lab systems, the power for drone charging', 'Nothing outside the boundary is named'],
  ['Stakeholders whose needs differ', 'Lab staff, clinicians, patients, the courier firm, neighbors of the drone routes, an approving authority', 'Only the users and the company'],
  ['Substance for Phase II', 'Scenarios, interfaces and behavior to model in Weeks 8–14', 'Too small to model past one diagram'],
]

/** 11.4 extension reading (optional, not counted; review package C): a worked good and weak proposal. */
export const CH11_04_EXT: LessonBlock[] = [
  { kind: 'table', caption: 'A good and a weak proposal against the course criteria (both fictional; the criteria are a course convention with no source in the collection).', header: ['Course criterion', 'Good proposal (fictional)', 'Weak proposal (fictional)'], rows: proposalRows },
  para('The weak proposal is not wrong because of its domain; a hospital can anchor an excellent project. It is weak because the instructor cannot tell what will be engineered, for whom, or where its boundary lies.'),
]

/** 11.4 Choosing the enterprise; enterprise vs system of interest; approval and its states (G3). */
export const CH11_04: LessonBlock[] = [
  para('The proposal names two things, in order (section 3.5): the **enterprise**, one or more organizations sharing a mission, and the **system of interest** inside it that your team will engineer. Most weak proposals fail on that distinction. A single product with no enterprise around it is too small: it has few stakeholders and nothing to trade. A whole industry is too large: it shares no single mission, so no system of interest can be stated for it. The suitability criteria are a course convention; no source in the collection prescribes them.'),
  para('**What approval means.** Approval is the instructor’s confirmation that the enterprise and its system of interest are suitable and scoped for a fourteen-week project. It is not a grade and says nothing yet about the quality of your stakeholders or needs. Only the instructor sets it, against the version of the proposal you submitted. A proposal is in one of three states once submitted: **pending instructor review**, during which you keep working on the whole project; **revision requested**, with the instructor’s comment, after which you edit and resubmit; or **approved**. Editing the name, description, problem statement, mission, objectives or boundary after approval marks the proposal “approved — changes pending re-review”, so the instructor sees exactly what changed; stakeholder and need edits do not affect approval. Approval is required before the Week 2 submission.'),
]
