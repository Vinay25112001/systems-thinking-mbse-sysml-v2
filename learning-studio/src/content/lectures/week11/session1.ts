// Week 11, Session 1 lecture: Physical / Interfaces — the physical architecture and ports: what a physical architecture
// is (SEBoK), system elements and physical interfaces, layers and components, the allocation of logical to physical
// elements and its criteria, the pitfalls, physical elements and components as parts, functions performed by physical
// parts, the logical-to-physical allocation with nested allocations, the AeroLink allocation, design properties, port
// definitions and port usages, directed features and matching, conjugation, the driving question answered, what crosses
// an interface, the AeroLink charging interface's ports, externals, a predict item and a calibration of what the checker
// can and cannot decide about ports and interfaces.
// 75-minute session: 69 minutes of planned content on 23 slides plus the generated "References and credits" slide, and
// a 6-minute buffer. Single source for the slide viewer, the faculty notes, the .pptx and the student lesson
// (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20 (teach first), A21 (the Week 1 architecture is the
// template; decision 9: AeroLink is the instructor reference only), A22/A23 (one continuous journey: Week 11 models the
// SAME enterprise's Week 4 physical view and Week 5 components and interfaces in the Week 10 model).
//
// Review status: new-pending-review. Written 2026-10-22 on the Week 10 template; the AeroLink model is generated from the
// closed Phase I package (Weeks 3, 4 and 5 cases) on top of model v0.3; the driving question shows a drawn card, so no
// checker result is visible before the vote; the predict item's result is revealed on the calibration slide.
//
// Accuracy rules followed:
//   - Every citation is a verified register entry at a page whose extracted text supports the claim beside it: R20c is
//     SEBoK Physical Architecture, R70, R71, R72 and R76 the textual-notation training deck, R81 and R82 the SysML v2.1
//     Beta 2 Part 1 clauses 7.11-7.16 and 7.17. The specification is never called "the standard".
//   - Course conventions (one port definition per interface with the conjugate on end B, functions performed at level 1,
//     the allocation read from the functions each element performs, PHY and CMP IDs on usages) are labeled as such.
//   - A checker PASS is never presented as correctness; recorded checker behavior is release 2026-08 only, and each
//     recorded error is described by what it is about, not by a broader rule it does not test.
//   - Every listing is an excerpt of a checker-validated file (./listings.ts); AeroLink values are FICTIONAL and come from
//     ./aerolinkCase.ts (which reads the Week 3, 4, 5 and 10 cases). Counts on slides are computed, never typed.
//   - Timing: spoken notes (teach, worked solution, figure walk) stay between 40 and 130 words per minute.
import type { Lecture } from '../types'
import { numberWord } from '../week01/aerolinkCase'
import { ALLOCATION_GRID, AEROLINK_W10, AEROLINK_W11_MODEL, COUNTS, DESIGN_VALUES, FIRST_NEW_INFO, W4_ALLOCATION_DIFFS, W11_NEW_ITEMS, ifOf, partOf, physicalName, shortName } from './aerolinkCase'
import { CALIBRATION, CONJUGATE_NAME_PASS, listing, listingText } from './listings'

export const WEEK11_S1_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
/** Alt text of a listing figure: the file it comes from, the recorded checker status and the full listing text. */
const listingAlt = (key: string) => {
  const l = listing(key)
  return `Listing (course file sysml/${l.file}, checked: ${l.status}): ${listingText(key)}`
}
/** Alt text of a drawn code card: the lines, with no checker result. */
const cardAlt = (key: string, from = 0, to?: number) =>
  listing(key)
    .lines.slice(from, to)
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' / ')
const s1Rows = CALIBRATION.filter((c) => c.session === 1)
const rejected = s1Rows.filter((c) => c.result === 'FAIL')
const accepted = s1Rows.filter((c) => c.result !== 'FAIL')
const predictRow = CALIBRATION.find((c) => c.file.endsWith('invalid_port_undirected_item.sysml'))!
const OPS = partOf('PHY-004')
const SPLIT = COUNTS.splitLogical
const FLIGHT = AEROLINK_W10.logical.find((l) => l.id === 'LOG-001')!
const flightHomes = [...new Set(FLIGHT.performs.map((fn) => partOf('PHY-001').performs.includes(fn) ? 'PHY-001' : partOf('PHY-004').performs.includes(fn) ? 'PHY-004' : ''))].filter(Boolean)
const IF5 = ifOf('IF-005')
const dirWord = (f: (typeof IF5.flows)[number]) => `${shortName(f.from)} to ${shortName(f.to)}`
const newInfo = W11_NEW_ITEMS.filter((x) => x.id)
const diff = W4_ALLOCATION_DIFFS[0]
const DV = DESIGN_VALUES[0]

export const WEEK11_SESSION1: Lecture = {
  week: 11,
  session: 1,
  title: 'Physical / Interfaces',
  subtitle: 'Session 1: Physical architecture, allocation and ports',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. framing (7 min)
    {
      id: 'w11s1-framing',
      title: 'Framing: the physical view and the interfaces enter the model',
      slides: [
        {
          id: 'w11s1-title',
          title: 'Physical / Interfaces',
          subtitle: 'Session 1: Physical architecture, allocation and ports',
          purpose: 'Orient students to the scheduled subject, the two sessions and the week’s output: the Physical package of model v0.4, built on the Week 10 model.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-week-band',
            caption: 'Week 11 fills the Physical package of your model from the Week 4 physical view and the Week 5 components and interfaces; Logical and Behavior were filled in Week 10. Course illustration, not SysML v2 graphical notation.',
            alt: 'Two document cards at the top: Week 4 physical view and Week 5 interfaces. Thick arrows run down from both to one package box drawn strong, Physical; beside it two faint boxes, Logical and Behavior, labeled Week 10. Below, a row labeled Phase II with the week numbers 8 to 14, number 11 highlighted, and the line: model v0.4 of your enterprise.',
          },
          body: [{ kind: 'bullets', items: ['Today: the physical architecture, its allocation and ports', 'Session 2: interfaces, connections, flows, interface requirements, satisfy claims, the Lab L11 launch', 'Your output: model v0.4 of your own enterprise'] }],
          sources: [],
          notes: {
            teach: [
              'Read the subject exactly as the schedule gives it: Physical / Interfaces. As in Weeks 9 and 10, nothing is invented this week. Your team wrote its physical elements and the allocation of functions to them in Week 4, and its components, interfaces and interface requirements in Week 5; this week those same elements become part of the model your team extended last week.',
              'Point at the strip. Week 8 built the skeleton, Week 9 the requirements, Week 10 the logical architecture and the behavior. The package still nearly empty is Physical, and it is this week’s work. Week 12 then verifies the requirements against this design, so what you model now is what Week 12 checks.',
              'Say how the week runs. Today: what a physical architecture is, how physical elements and components become parts, how the logical architecture is allocated to them, and how ports define what an element can exchange. Session 2: interfaces and connections, the flows that cross them, interface requirements and the first satisfy claims, and the lab launch, where your team generates model v0.4 with the Week 11 lab tool.',
            ],
            why: 'Students who see where the week’s output sits in the Phase II chain can place each construct as it arrives, and hearing that nothing is invented keeps them anchored to their own Week 4 and Week 5 work.',
            figure: 'Trace the two arrows from the Phase I cards into Physical, then point at Logical and Behavior, filled last week, and at week 11 in the strip.',
            examples: ['Instructor preparation (not for students): open AeroLink model v0.4 and the two-ports file in the course checker before class, in case a student asks to see a run; the live run is not on the plan today.', 'Timing plan: 69 minutes of content and a 6-minute buffer. If the session runs long, shorten the pitfalls slide or the externals slide; never shorten the conjugation slide, the reveal or the two worked examples.'],
            misconceptions: [{ claim: 'Week 11 starts a new physical design.', correction: 'Week 11 models the Week 4 physical elements and the Week 5 components and interfaces the team already wrote, with the same IDs.' }],
            transition: 'First, a question about two ports written in the textual notation.',
            timing: '2 min: 1 min subject and output, 1 min the strip.',
          },
        },
        {
          id: 'w11s1-driving-question',
          title: 'Driving question: the interface connects two typed ports. Does the oxygen arrive?',
          purpose: 'Create a need to know: two connected ports can both offer an item and neither take it. The vote is answered on the reveal slide.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-two-ports-card',
            caption: 'A hospital oxygen supply: a port definition, an interface definition and the interface that connects a manifold to a ward outlet. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `A code card with these lines: ${cardAlt('two-ports-card')}.`,
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Vote', text: 'The manifold sends oxygen. Which is true?' },
            { kind: 'bullets', items: ['A · The oxygen reaches the ward outlet', 'B · No port here can receive the oxygen', 'C · The checker rejects this file', 'D · It cannot be told from the text'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the card aloud. A hospital oxygen supply has a manifold and a ward outlet. One port definition, OxygenPort, offers oxygen out. The interface definition has two ends, both typed by OxygenPort, and a flow from the supply’s oxygen to the outlet’s oxygen. Both parts carry a port of that type, and the interface connects them. It is deliberately not AeroLink, so nobody answers from memory of the case.',
              'Give the class thirty seconds, then take a show of hands for A, B, C and D. Do not reveal the answer. Write the counts on the board; we return to them after the slides on directed features and conjugation, when we have the words to say what each port can do.',
              'If someone argues for C, ask them to hold the thought: the last slide but one is about what the checker can and cannot see.',
            ],
            why: 'A prediction before instruction gives students a reason to attend to the directions of port features, and options A and C plant the two misconceptions the session dismantles: that a connection makes an exchange work, and that the checker would catch it if it did not.',
            figure: 'Point at the port definition’s one line, then at the two ends of the interface; do not point at any word in particular.',
            misconceptions: [{ claim: 'If two ports are connected, whatever one sends the other receives.', correction: 'A transfer goes from an out feature to a matching in feature; two ports that both offer an item out have nothing to receive it with.' }],
            transition: 'Before we answer it, see what this week takes from Phase I.',
            timing: '3 min: 1 min the card, 30 s to think, 1.5 min vote and the hold.',
          },
        },
        {
          id: 'w11s1-continuity',
          title: 'What Week 11 imports from Phase I',
          purpose: 'Make the continuity explicit: the Week 4 physical elements and the placement of functions, and the Week 5 components, interfaces and interface requirements enter model v0.3, whose logical architecture and Week 9 placeholders they complete.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-import-lanes',
            caption: 'The sources of this week and the model packages they enter, with the ID prefixes that cross: PHY from the physical view, CMP, IF and EXT from the components and interfaces, and the logical parts and placeholders of model v0.3. Course illustration, not SysML v2 graphical notation.',
            alt: 'Top row, titled What enters the model: three cards, Physical view, Interfaces, Model v0.3. Bottom row, titled Model packages: one wide Physical box, and a narrower Requirements box. Arrows run down labeled PHY, placements from Physical view; CMP, IF, EXT from Interfaces into Physical, and interface requirements into Requirements; and LOG, FN, items, dashed and grey, from Model v0.3 into Physical.',
          },
          body: [{ kind: 'bullets', items: ['Week 4: physical elements; each function placed on one; information items with producers and consumers', 'Week 5: components, interfaces with their ends and crossings, interface requirements, externals', 'Week 10: logical parts, functions, items; Week 9 placeholders in Physical', 'Same IDs throughout'] }],
          sources: [],
          notes: {
            teach: [
              'Recall what each team has. Week 4 gave you a physical view: the physical elements, the physical element each function is placed on, and an information view with the producer and consumers of each item. Week 5 broke the physical elements into components and defined the interfaces between them, with their ends, what crosses, the medium, protection and degraded mode, and the interface requirements.',
              `Model v0.3 brings two things into this week. The logical parts and the functions they perform, which are now allocated to physical homes. And the placeholder subjects Week 9 put into Physical, part definitions named for the element a system requirement is about; in AeroLink there are ${numberWord(COUNTS.placeholders)} of them. Week 11 links each to the physical element it stood for.`,
              'Nothing is retyped: the lab tool reads your Week 10 model file and your Week 5 export, which carries the Week 4 physical view inside it. The IDs stay the same: PHY-003 in the model is PHY-003 in your Week 4 table, IF-005 is IF-005 in your Week 5 interface table.',
            ],
            why: 'Seeing the lanes join tells students that the physical model is their Phase I work in another form, and that the placeholders Week 9 created are completed now, not replaced.',
            figure: 'Follow each arrow down and read its label; the dashed one is last week’s model handing over its logical parts and placeholders.',
            misconceptions: [{ claim: 'The interfaces are redesigned in the model.', correction: 'They are the Week 5 interfaces, with their ends and crossings, written in the textual notation; a new interface is a Week 5 change first.' }],
            transition: 'Before modeling anything, agree what a physical architecture is.',
            timing: '2 min: 1 min the lanes, 1 min what model v0.3 brings.',
          },
        },
      ],
    },
    // ============================================================================================ B. the physical architecture (27 min)
    {
      id: 'w11s1-physical',
      title: 'The physical architecture and its allocation',
      slides: [
        {
          id: 'w11s1-physical-arch',
          title: 'Physical architecture: elements and physical interfaces',
          purpose: 'Define the physical architecture as SEBoK does: an arrangement of system elements and the physical interfaces that bind them, satisfying and trading off the system requirements.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-elements-interfaces',
            caption: 'Four AeroLink physical elements, one external, and the interfaces that bind them, read from the Week 5 interfaces of model v0.4. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `Four element cards: ${['PHY-001', 'PHY-003', 'PHY-004', 'PHY-007'].map(shortName).join(', ')}, and a dashed external card, ${shortName('EXT-002')}. Lines labeled with interface IDs join them: ${['IF-005', 'IF-002', 'IF-010', 'IF-008', 'IF-006'].map((id) => `${id} between ${shortName(ifOf(id).endA)} and ${shortName(ifOf(id).endB)}`).join('; ')}.`,
          },
          body: [
            { kind: 'definition', term: 'Physical architecture model (SEBoK)', text: '“an arrangement of physical elements, (system elements and physical interfaces) that provides the solution for a product, service, or enterprise”', source: R('R20c', '596') },
            { kind: 'bullets', items: ['A physical interface binds two system elements together', 'It accommodates the logical architecture and trades off the system requirements', 'System requirements are allocated to both architectures'] },
          ],
          sources: [R('R20c', '596'), R('R20c', '597')],
          notes: {
            teach: [
              'SEBoK gives physical architecture model development its purpose: to elaborate models and views of a physical, concrete solution that accommodates the logical architecture model and satisfies and trades off the system requirements. Read the definition: an arrangement of physical elements, system elements and physical interfaces, that provides the solution for a product, service or enterprise (R20c p.596). It adds that system requirements are allocated to both the logical and the physical architectures.',
              'Two terms on the next page. A system element is a discrete part of a system that can be implemented to fulfill design properties: hardware, software, data, humans, processes, procedures, facilities, materials, or any combination. A physical interface binds two system elements together, like a link or a connector (R20c p.597). For an enterprise, SEBoK’s table lists protocols, procedures and documents as physical interfaces too: the reason your Week 5 organizational interfaces belong in this model.',
              `Point at the AeroLink drawing: the aircraft, the chargers, the operations center and the booking platform, and the electric grid outside. Every line is a Week 5 interface. AeroLink has ${COUNTS.interfaces} of them: ${COUNTS.physicalIfs} physical, ${COUNTS.informationIfs} information and ${COUNTS.organizationalIfs} organizational.`,
            ],
            why: 'Students who see interfaces as half of the physical architecture, not an afterthought, model them as first-class elements; the SEBoK definition says exactly that.',
            figure: 'Name each element, then follow each line and read its interface ID; point out the one that leaves the enterprise.',
            misconceptions: [{ claim: 'The physical architecture is the list of hardware.', correction: 'It is the arrangement of system elements, which may be people, software, facilities or procedures, and of the physical interfaces between them.' }],
            transition: 'A physical architecture has levels, and SEBoK says how many elements one level should hold.',
            timing: '3 min: 1 min the definition, 1 min system element and interface, 1 min the figure.',
          },
        },
        {
          id: 'w11s1-layers',
          title: 'Layers: elements and their components',
          purpose: 'Place the Week 5 components: a system element can be a system of its own, one level down, and SEBoK’s span guideline keeps each level readable.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-layers',
            caption: `The AeroLink operations center and its ${numberWord(OPS.components.length)} Week 5 components, one level down. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `A wide card labeled ${OPS.id} ${shortName(OPS.id)}. Below it, joined by lines, ${OPS.components.length} smaller cards: ${OPS.components.map((c) => `${c.id} ${physicalName(c.id)}`).join(', ')}. A note at the bottom: one level at a time, five plus or minus two.`,
          },
          body: [{ kind: 'bullets', items: ['A system element may itself be a system: layers', 'Guideline: five plus or minus two elements in one level', 'Week 5 components sit one level below their element', `AeroLink: ${COUNTS.physical} physical elements, ${COUNTS.components} components`] }],
          sources: [R('R20c', '597'), R('R81', '90')],
          notes: {
            teach: [
              'SEBoK: a complex system may be structured in several layers of systems and system elements, and the number of elements in one level of the structure is limited to a few to keep the definition manageable; a common guideline is five plus or minus two (R20c p.597). Your Week 5 component breakdown applied that guideline.',
              `In the model, a component is a part one level below its element: a part usage nested in the element’s usage. The specification says a part can represent any level of abstraction (R81 p.90), so the same construct serves both levels. AeroLink has ${COUNTS.physical} physical elements and ${COUNTS.components} components; the operations center has ${numberWord(OPS.components.length)}.`,
            ],
            why: 'Seeing components as the next level down, not as separate elements, keeps the model’s structure the shape of the Week 5 breakdown.',
            figure: 'Point at the wide card, then at each component under it; read the guideline line.',
            misconceptions: [{ claim: 'Every component is a separate element of the top level.', correction: 'A component belongs to its element, one level down; the top level keeps five plus or minus two elements.' }],
            transition: 'The heart of the physical architecture is deciding which element realizes which part of the logical one.',
            timing: '3 min: 1.5 min layers, 1.5 min the figure and the counts.',
          },
        },
        {
          id: 'w11s1-allocation-criteria',
          title: 'Allocating logical elements to physical elements',
          purpose: 'Give the SEBoK method: find the system elements that can perform the functions and the interfaces that can carry the flows, partitioning with explicit criteria.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-split-allocation',
            caption: `${FLIGHT.id} ${FLIGHT.def} in AeroLink: the functions it performs land on ${numberWord(flightHomes.length)} physical elements, so the logical element has ${numberWord(flightHomes.length)} physical homes. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `A logical card at the top, ${FLIGHT.def}, listing ${FLIGHT.performs.join(', ')}. Arrows run down to ${flightHomes.length} physical cards: ${flightHomes.map((p) => `${shortName(p)} with ${partOf(p).performs.filter((fn) => FLIGHT.performs.includes(fn)).join(', ')}`).join('; and ')}.`,
          },
          body: [{ kind: 'bullets', items: ['Find elements that can perform the functions, and interfaces that can carry the flows', 'Criteria: same kind of flow (information, energy, material), central or distributed control, environment, dependability', 'A logical element may land on several physical ones'] }],
          sources: [R('R20c', '598'), R('R20c', '599')],
          notes: {
            teach: [
              'SEBoK: developing a candidate physical architecture model consists of first identifying the system elements that can perform the functions of the logical architecture model, and the interfaces capable of carrying out the input-output flows and control flows. Partitioning and allocation decompose, gather or separate functions to find feasible system elements (R20c p.598).',
              'The criteria SEBoK lists for those affinities include similar transformations within the same technology, exchange of the same type of input-output flows, information, energy and materials, centralized or distributed controls, dependability conditions and environment resistance (R20c pp.598–599). Your Week 4 placement recorded a criterion for every function: the same idea.',
              `In AeroLink, ${FLIGHT.def} performs ${FLIGHT.performs.join(', ')}. Planning and filing intent run at the operations center; flying runs in the aircraft. So the one logical element has ${numberWord(flightHomes.length)} physical homes. ${numberWord(SPLIT.length).replace(/^./, (c) => c.toUpperCase())} of the ${COUNTS.logical} AeroLink logical elements are split this way.`,
            ],
            why: 'A method with named criteria turns allocation from a matching game into a decision students can defend, and seeing a split element prepares them for the nested allocations of the model.',
            figure: 'Read the logical card, then follow each arrow to its physical home and read the functions it carries.',
            misconceptions: [{ claim: 'Each logical element maps to exactly one physical element.', correction: 'Its home follows its functions: where they are performed decides it, and SEBoK expects partitioning to separate or gather them.' }],
            transition: 'SEBoK also says how physical architectures go wrong.',
            timing: '3 min: 1 min the method, 1 min the criteria, 1 min the AeroLink split.',
          },
        },
        {
          id: 'w11s1-pitfalls',
          title: 'Pitfalls, proven practices and the outputs',
          purpose: 'Give the review criteria students are graded against before they model: SEBoK’s physical-architecture pitfalls and practices, and the two matrices the process outputs.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-pitfall-card',
            caption: 'SEBoK’s three pitfalls and two proven practices for physical architecture, in short form, and the two matrices the process outputs. Course illustration, not SysML v2 graphical notation.',
            alt: 'Two columns. Left, headed Pitfalls: too many levels; no logical model; straight to technology. Right, headed Practices: modularity; focus on interfaces. Across the bottom: outputs, function to element matrix and requirement trace.',
          },
          body: [{ kind: 'bullets', items: ['Pitfalls: too many levels in one block; no logical architecture; allocating straight onto technologies', 'Practices: modularity; focus on interfaces', 'Outputs: an allocation matrix of functions to elements; a trace to the system requirements'] }],
          sources: [R('R20c', '600'), R('R20c', '602'), R('R20c', '603')],
          notes: {
            teach: [
              'SEBoK’s pitfalls table (R20c p.602): too many levels of decomposition in a single system block, where the physical architecture of a block should be one level; a direct passage from system requirements to a physical architecture with no logical architecture; and, at a high level of abstraction, allocating functions directly onto the lowest technologies, hardware or software, instead of alternating logical and physical levels.',
              'The proven practices (R20c p.603): modularity, restrict the interactions between system elements, maximum consistency inside an element and minimum physical interfaces outside; and focus on interfaces rather than on system elements. And the outputs of the process include an allocation matrix of functional elements to physical elements and a traceability matrix with the system requirements (R20c p.600).',
              'Those are the two tables your lab tool computes from the model this week, and the review checklist uses the pitfalls as criteria.',
            ],
            why: 'Students model better when they know the criteria in advance; the two matrices are exactly what the lab produces, so they see why.',
            figure: 'Read each pitfall, then each practice, then the outputs line.',
            misconceptions: [{ claim: 'A deeper component tree is a more complete physical architecture.', correction: 'SEBoK names too many levels in one block as a pitfall; one level at a time.' }],
            transition: 'Now the notation: physical elements and components as parts.',
            timing: '3 min: 1 min pitfalls, 1 min practices, 1 min the outputs.',
          },
        },
        {
          id: 'w11s1-parts-physical',
          title: 'Physical elements and components as parts',
          purpose: 'Apply definition and usage to the physical view: a part definition per element and component, the element usages inside one part physicalArchitecture with their PHY IDs, components nested, and the Week 9 placeholders specialized.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-listing-physical-parts',
            caption: 'The aircraft in AeroLink model v0.4: a part definition that specializes the Week 9 placeholder, a component definition, and the element’s usage with its components nested (excerpt). Checked: PASS. (FICTIONAL)',
            alt: listingAlt('physical-parts'),
          },
          body: [{ kind: 'bullets', items: ['Part definition: the kind of element; part usage: the element in this architecture', 'Course convention: PHY and CMP IDs on usages, inside one part physicalArchitecture', 'A Week 9 placeholder linked to an element is specialized: its requirements still conform'] }],
          sources: [R('R70', '15–16'), R('R81', '90')],
          notes: {
            teach: [
              'The same pattern as the logical parts last week. Usages inherit from their definitions and composite structure can be specified on part usages (R70 sl.15–16); a part can be at any level of abstraction (R81 p.90).',
              `Read the listing. Week 9 created a placeholder named Aircraft as the subject of two system requirements. The Week 4 element is the eVTOL Aircraft, so its part definition specializes the placeholder: the requirement whose subject is Aircraft still conforms to anything typed by eVTOL Aircraft. A Week 5 component gets its own part definition. In physicalArchitecture, the element is a part usage with its PHY ID as a quoted short name, and its components are part usages nested inside it, each with its CMP ID.`,
              `Course convention for the placeholders: a placeholder with the same name as a Week 4 element is reused as its definition; any other is linked by the team and specialized. AeroLink links all ${numberWord(COUNTS.placeholders)}.`,
            ],
            why: 'Specializing the Week 9 placeholders keeps every requirement subject valid while the physical architecture is completed, which is what makes Session 2’s satisfy claims possible.',
            figure: 'Follow the callouts: the specialization, the component definition, the element usage with its ID, the nested components.',
            misconceptions: [{ claim: 'The placeholder should be deleted once the real element exists.', correction: 'It stays: the requirements name it as their subject. The element’s definition specializes it, so they conform.' }],
            transition: 'Physical parts perform functions, as logical parts did.',
            timing: '3 min: 1 min the pattern, 1.5 min the listing, 30 s the placeholder rule.',
          },
        },
        {
          id: 'w11s1-perform-physical',
          title: 'Functions performed by physical parts',
          purpose: 'Place each function on the physical element Week 4 chose, with perform, and state the course convention: level 1, components keep their functions in their documentation.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-listing-perform-physical',
            caption: 'The charging systems in AeroLink model v0.4 perform the two functions Week 4 placed on them (excerpt). Checked: PASS. (FICTIONAL)',
            alt: listingAlt('perform-physical'),
          },
          body: [{ kind: 'bullets', items: ['perform in a part: that part is the performer', 'The Week 4 placement says which element performs each function', 'Course convention: performed at level 1; a component’s Week 5 functions are noted in its doc'] }],
          sources: [R('R72', '41'), R('R82', '136')],
          notes: {
            teach: [
              'Perform identifies the owner as the performer of an action defined elsewhere (R72 sl.41); a perform action usage in the body of a part makes the part the performer of the performed action (R82 p.136). Last week the logical parts performed the functions; this week the physical parts perform the same functions, as Week 4 placed them.',
              `The course convention: a function is performed by the level-1 physical element Week 4 placed it on. Your Week 5 components list functions too; those are written into each component’s documentation, not as a second perform. AeroLink’s physical parts perform ${COUNTS.performs} functions; one element, the communications network, performs none, because Week 4 made it the medium of the interfaces.`,
            ],
            why: 'One perform per function per level keeps the allocation unambiguous; students who perform a function at every level cannot tell which element is responsible.',
            figure: 'Point at the part usage, then at the two perform lines; name the functions they refer to.',
            misconceptions: [{ claim: 'A physical part needs its own copy of the function.', correction: 'It performs the same function the logical part performs; the action is defined once, in Logical.' }],
            transition: 'Now the link between the two architectures: the allocation.',
            timing: '3 min: 1.5 min perform, 1.5 min the convention.',
          },
        },
        {
          id: 'w11s1-allocate-l2p',
          title: 'The logical-to-physical allocation, with nested allocations',
          purpose: 'Teach the allocation the training deck shows: a logical part allocated to the physical part that realizes it, refined by nested allocations of the actions both perform.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-listing-allocate-l2p',
            caption: 'Flight Operations allocated to both its physical homes in AeroLink model v0.4, each allocation refined by the functions performed there. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('allocate-l2p'),
          },
          body: [
            { kind: 'definition', term: 'Allocation (SysML v2.1 Beta 2)', text: '“a target element is responsible for realizing some or all of the intent of the source element”', source: R('R81', '110') },
            { kind: 'bullets', items: ['allocate the logical part to the physical part', 'Nested allocations: function to function', 'Course convention: read from the functions each element performs'] },
          ],
          sources: [R('R76', '106'), R('R81', '110'), R('R81', '111'), R('R81', '112')],
          notes: {
            teach: [
              'The training deck’s allocation slide is this week in one picture: in the logical model a part performs an action; in the physical model a part performs the same action; an allocate maps the logical part to the physical part, refined by a nested allocate of the action (R76 sl.106). The specification: an allocation definition or usage can be refined by nested allocation usages that give a finer-grained decomposition (R81 p.110), and its table shows the same allocation with sub-allocation of performed actions (p.111).',
              'Read the listing. Flight Operations is allocated to the operations center, refined by the two functions performed there, and to the aircraft, refined by the flight. The nested lines name the performed function on each side by its ID.',
              `Course convention: the tool computes the allocation from the functions each element performs, so it cannot disagree with the placements. AeroLink has ${COUNTS.allocations} allocations refined by ${COUNTS.nestedAllocations} nested ones.`,
            ],
            why: 'The nested allocations are what make the allocation checkable: each one pairs a function with the element that performs it, so a reviewer can trace any function from logical to physical.',
            figure: 'Read the first allocation and its nested lines, then the second; ask which element carries the flight.',
            misconceptions: [{ claim: 'An allocation proves the physical element can do the job.', correction: 'It assigns responsibility; whether the design meets the requirements is a satisfy claim, and later evidence.' }],
            transition: 'All of it on AeroLink: the allocation matrix.',
            timing: '4 min: 1.5 min the deck’s pattern, 1.5 min the listing, 1 min the convention.',
          },
        },
        {
          id: 'w11s1-worked-allocation',
          title: 'AeroLink worked example I: the allocation matrix',
          purpose: 'See the whole logical-to-physical allocation of AeroLink as the matrix SEBoK asks for, read from model v0.4, with one think-pair-share.',
          minutes: 5,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-alloc-matrix',
            caption: 'AeroLink logical elements by physical elements: an X where model v0.4 allocates one to the other. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `A matrix with the logical elements ${ALLOCATION_GRID.rows.map((r) => r.log).join(', ')} as rows and the physical elements ${ALLOCATION_GRID.cols.join(', ')} as columns; an X marks each allocation: ${ALLOCATION_GRID.rows.map((r) => `${r.log} to ${ALLOCATION_GRID.cols.filter((_, j) => r.cells[j]).join(' and ')}`).join('; ')}.`,
          },
          body: [
            { kind: 'bullets', items: [`${COUNTS.logical} logical elements, ${ALLOCATION_GRID.cols.length} physical homes, ${COUNTS.allocations} allocations`, 'Every function performed by one physical element', 'Generated from the Week 4 placements; nothing retyped'] },
            { kind: 'callout', tone: 'note', title: 'Pair, 1 min', text: 'Which column has the most X, and what does that tell an interface designer?' },
          ],
          sources: [R('R20c', '600'), R('R76', '106')],
          notes: {
            teach: [
              `Read the matrix. ${COUNTS.logical} logical elements across ${ALLOCATION_GRID.cols.length} physical elements, ${COUNTS.allocations} X in all. Rows with two X are the split elements: ${SPLIT.join(', ')}.`,
              `Run the pair question for one minute. Expected answer: the operations center, PHY-004, carries the most logical elements; every split element that lands there must exchange items with its other home, so most interfaces meet at the operations center. That is the hub the Week 5 N² chart showed.`,
              diff
                ? `One honest difference to show: Week 4 also allocated ${diff.log} ${diff.name} to ${diff.onlyW4.join(', ')}, but none of its functions is performed there, so the model, which reads the functions, does not allocate it there. A reviewer records that as a finding about the Week 4 table, not a model error.`
                : 'The matrix agrees row by row with the Week 4 allocation table.',
            ],
            workedSolution: ['Step 1, the placements: for each function, the physical element Week 4 placed it on.', 'Step 2, the homes: for each logical element, the physical elements that perform one of its functions.', 'Step 3, the allocations: one allocate per logical element and home, with a nested allocate per function performed there.', 'Step 4, check: every logical element has a home; compare the homes with the Week 4 allocation table and record any difference.'],
            why: 'The matrix is how a reviewer checks the allocation at a glance; computing it from the model removes a whole class of table errors and makes differences with Week 4 visible.',
            figure: 'Read one row across, then the busiest column down; point at a row with two X.',
            misconceptions: [{ claim: 'A logical element with two homes is a modeling error.', correction: 'It is a partitioning decision; it means the two homes need an interface for what the element’s functions exchange.' }],
            transition: 'Before ports, one more thing a physical element carries: its design properties.',
            timing: '5 min: 1.5 min the matrix, 1.5 min pair question and debrief, 1 min the Week 4 difference, 1 min the worked steps.',
          },
        },
        {
          id: 'w11s1-design-properties',
          title: 'Design properties: what the physical element will be',
          purpose: 'Introduce design properties as SEBoK defines them and as attribute values on physical parts, so that Session 2’s satisfy claims have something to rest on.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-design-property',
            caption: 'A requirement constrains an attribute; the physical element gives it a design value; the two are compared. AeroLink charging, from the Week 3 performance measure. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `Three cards in a row: required, at most ${DV.threshold} ${DV.unit} to the dispatch threshold; design value, the ${DV.tpm} current estimate of ${DV.cbe} ${DV.unit}; compared, ${DV.cbe} ${DV.unit} at most ${DV.threshold} ${DV.unit}. Arrows join them.`,
          },
          body: [{ kind: 'bullets', items: ['A design property: assigned from requirements, estimates, analyses', 'In the model: an attribute value on the physical part', 'Compared with the requirement: a claim to verify later'] }],
          sources: [R('R20c', '598')],
          notes: {
            teach: [
              'SEBoK: a design property is obtained during system architecture through the assignment of non-functional requirements, estimates, analyses, calculations or simulations, or through the definition of an existing element. If the defined element complies with a requirement, the design property relates to, or may equal, the requirement; otherwise one has to identify the discrepancy (R20c p.598).',
              'In the model, a design property is an attribute value on the physical part. The Week 9 placeholders already declare the attributes your requirements constrain, the charge time of the chargers for example; a physical part that specializes the placeholder inherits the attribute and can redefine it with a value.',
              'Where does the value come from? Not from wishful thinking. In AeroLink it is the current best estimate of the technical performance measure Week 3 set up for that requirement. Session 2 turns that comparison into a satisfy claim.',
            ],
            why: 'Students who tie each design value to its source write satisfy claims that can be defended; without the source a claim is only an assertion.',
            figure: 'Read the three cards left to right: what is required, what the design is estimated to be, how the two compare.',
            misconceptions: [{ claim: 'A design value is a target to put in the model so that the requirement passes.', correction: 'It is what the design is, or is estimated to be, from an analysis or a measurement; it must come with its basis.' }],
            transition: 'Elements exchange items through interfaces. The connection points are ports.',
            timing: '3 min: 1 min SEBoK, 1 min the attribute, 1 min the source.',
          },
        },
      ],
    },
    // ============================================================================================ C. ports (27 min)
    {
      id: 'w11s1-ports',
      title: 'Ports: what an element can exchange',
      slides: [
        {
          id: 'w11s1-port-def',
          title: 'Port definitions and port usages',
          purpose: 'The core notation: a port definition defines a connection point and what can be exchanged through it; a port usage puts it on a part.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-port-anatomy',
            caption: 'A port definition with its directed items, and a part that carries a port of it. Course illustration, not SysML v2 graphical notation.',
            alt: 'Left, a card headed port def with two lines: out item, in item. Right, a part card with a small square on its edge labeled port, and an arrow from the square to the port def card labeled typed by.',
          },
          body: [
            { kind: 'definition', term: 'Port definition (SysML v2.1 Beta 2)', text: '“a kind of occurrence definition … that defines a connection point to enable interactions between occurrences (most commonly parts)”', source: R('R81', '93') },
            { kind: 'bullets', items: ['A port usage puts the connection point on a part', 'Its features say what can be exchanged'] },
          ],
          sources: [R('R81', '93'), R('R71', '20')],
          notes: {
            teach: [
              'Read the definition: a port definition is a kind of occurrence definition that defines a connection point to enable interactions between occurrences, most commonly parts; a port usage is a usage of a port definition (R81 p.93). The features of the port specify what can be exchanged in such interactions.',
              'The training deck: a port definition defines features that can be made available via ports, replacing interface blocks in SysML v1; a port is a connection point through which a part definition makes some of its features available in a limited way, like a proxy port in SysML v1 (R71 sl.20).',
              'In the drawing: the port definition holds the items, the part carries a port typed by it. Every Week 5 interface end becomes one such port on the element at that end.',
            ],
            why: 'Ports make an element’s exchanges explicit and checkable; without them an interface is a line between boxes that says nothing about what crosses.',
            figure: 'Point at the port definition’s two lines, then at the square on the part and the typed-by arrow.',
            misconceptions: [{ claim: 'A port is the interface.', correction: 'A port is one end: a connection point on one part. The interface connects two ports.' }],
            transition: 'The features of a port have directions, and directions decide what can be exchanged.',
            timing: '3 min: 1 min the definition, 1 min the deck, 1 min the figure.',
          },
        },
        {
          id: 'w11s1-directed-features',
          title: 'Directed features, and when two ports match',
          purpose: 'Teach the matching rule: a transfer goes from an out feature to a matching in feature; two ports conform when each feature of one matches a feature of the other.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-matching',
            caption: 'Two ports face each other: the top pair both offer oxygen out and nothing matches; the bottom pair offer out and in, and they match. Course illustration, not SysML v2 graphical notation.',
            alt: 'Top row: two port cards facing each other, both reading out oxygen, with a red cross between them labeled no match. Bottom row: the left card reads out oxygen, the right card reads in oxygen, with a solid arrow between them labeled match: out to in.',
          },
          body: [{ kind: 'bullets', items: ['Directions: in, out, inout; directed features are referential', 'Two features match: conforming types and conjugate directions', 'A transfer: from an out feature to the matching in feature'] }],
          sources: [R('R81', '93'), R('R81', '95'), R('R71', '20')],
          notes: {
            teach: [
              'A feature of a port may be directed: in, out or inout. Two features match if they have conforming definitions and either both have no direction or they have conjugate directions; the conjugate of in is out and vice versa, and inout is its own conjugate. A transfer can occur from the out features of one port usage to the matching in features of connected port usages, and two ports conform if each feature of one has a matching feature on the other (R81 p.93).',
              'The training deck says it shorter: two ports are compatible for connection if they have directed features that match with inverse directions, and directed features are always referential (R71 sl.20). The specification adds that all features of a port definition other than nested ports must be referential (R81 p.95). Hold that last point: it is the predict item at the end.',
              'In the drawing: out facing out matches nothing; out facing in matches.',
            ],
            why: 'The matching rule is the semantics behind every interface the students will write; it is also what the checker does not test, as the driving question shows.',
            figure: 'Point at the top pair and read both lines; then at the bottom pair and trace the arrow from out to in.',
            misconceptions: [{ claim: 'Direction is decoration; the connection decides what moves.', correction: 'A transfer goes only from an out feature to a matching in feature; the directions decide what can move.' }],
            transition: 'Writing a second port definition with every direction reversed would be tedious. SysML v2 gives it for free.',
            timing: '3 min: 1.5 min the rule, 1 min the deck and referential, 30 s the figure.',
          },
        },
        {
          id: 'w11s1-conjugation',
          title: 'Conjugation: one port definition, both ends',
          purpose: 'Teach the conjugated port definition and the ~ shorthand, and the course convention: one port definition per interface, end A typed by it, end B by its conjugate.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-conjugate',
            caption: 'A port definition and its conjugate: the same features, every in and out reversed. Course illustration, not SysML v2 graphical notation.',
            alt: 'Two cards side by side. Left, OxygenPort: out item oxygen; in item pressureAlarm. Right, ~OxygenPort: in item oxygen; out item pressureAlarm. A double arrow between them labeled reversed.',
          },
          body: [{ kind: 'bullets', items: ['Every port definition has a conjugate: directions reversed', 'port p : ~P; uses it without writing it', 'A conjugated port conforms to the original', 'Course convention: one port definition per interface; end B uses ~'] }],
          sources: [R('R81', '93'), R('R81', '95'), R('R71', '21')],
          notes: {
            teach: [
              `Every port definition implicitly declares a nested conjugated port definition with the same features, except that in and out are reversed and inout stays. Its actual name is the original’s with a tilde in front, declared in the original’s namespace: P::'~P', and quotes are needed to write that name (R81 p.95; the deck’s example is '~FuelPort', R71 sl.21). The shorthand port p : ~P; is equivalent to typing the port by P::'~P'; for a quoted name the shorthand puts the tilde outside the quotes, ~'P-1', and the full form qualifies the actual name, 'P-1'::'~P-1'. Recorded: ${CONJUGATE_NAME_PASS.shorthand} and ${CONJUGATE_NAME_PASS.qualified} both pass with no message. A conjugated port usage automatically conforms to a usage of the original port definition (R81 p.93).`,
              'The training deck: using a tilde on the port type is a shorthand for the conjugate port definition (R71 sl.21).',
              'Course convention: one port definition per interface, written from end A’s point of view; the port at end A is typed by it, the port at end B by its conjugate. Then every out item at one end meets an in item at the other, by construction.',
            ],
            why: 'Conjugation removes the most common port error, two definitions that drift apart, and the convention makes every team’s interfaces read the same way.',
            figure: 'Read the left card line by line, then the right card, pointing out each reversed direction.',
            misconceptions: [{ claim: "Writing '~Oxygen port' is the same as writing ~'Oxygen port'.", correction: "Inside quotes, '~Oxygen port' is the conjugate’s actual name, declared inside 'Oxygen port': unqualified it does not resolve. Write the shorthand ~'Oxygen port' or the qualified 'Oxygen port'::'~Oxygen port'." }],
            transition: 'Now we can answer the driving question.',
            timing: '3 min: 1.5 min the conjugate and the shorthand, 30 s the deck, 1 min the convention.',
          },
        },
        {
          id: 'w11s1-reveal',
          title: 'Reveal: both ports offer the oxygen, neither takes it',
          purpose: 'Answer the driving question with the matching rule, show the corrected file, and state that the checker accepts both.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-listing-two-ports-conjugated',
            caption: 'The corrected oxygen supply: the outlet end of the interface and the outlet’s port use the conjugate. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('two-ports-conjugated'),
          },
          body: [
            { kind: 'bullets', items: ['Answer B: both ends offer oxygen out; nothing can receive it', 'The fix: end B and the outlet’s port typed by ~OxygenPort', 'The checker accepts both versions: matching is yours to check'] },
            { kind: 'callout', tone: 'key', text: 'For every interface: one end typed by the port definition, the other by its conjugate.' },
          ],
          sources: [R('R81', '93'), R('R71', '20'), R('R71', '21')],
          notes: {
            teach: [
              'Return to the vote. Both ends of the interface are typed by OxygenPort, so both have an out item oxygen and neither has an in item. A transfer goes from an out feature to a matching in feature, and out does not match out (R81 p.93). Nothing at the outlet can receive the oxygen: the answer is B. A is wrong for that reason; D is wrong because the text tells us; C we settle now.',
              'The corrected file types the outlet end of the interface, and the outlet’s port, by ~OxygenPort. Now the outlet has in item oxygen, which matches the manifold’s out item, and the flow runs from out to in.',
              'And C: both files pass the course checker with no message. The checker does not test that two connected ports match. That is reviewer work, and the review checklist has a line for it.',
            ],
            why: 'Resolving the prediction turns the matching rule into a review habit: for every interface, check that each out meets an in.',
            figure: 'Follow the two callouts: the conjugated end, then the conjugated port on the outlet.',
            misconceptions: [{ claim: 'If the checker accepts an interface, its ports match.', correction: 'The checker accepted two ports that both offer the item out; matching is a review check.' }],
            transition: 'Ports carry items. Which items, and of what kind?',
            timing: '3 min: 1.5 min the answer, 1 min the fix, 30 s the checker.',
          },
        },
        {
          id: 'w11s1-crossings',
          title: 'What crosses an interface: information, energy, material',
          purpose: 'Map each Week 5 crossing to an item: reuse the information items and the Week 10 items, add an item where none exists with the next ID, and decide its direction.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-crossings-table',
            caption: `What crosses the AeroLink charging interface (IF-005): each Week 5 crossing, the item it becomes in model v0.4 and its direction. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `A table with three rows: ${IF5.flows.map((f) => `${f.itemName} (${f.item === f.itemName ? 'an item of the model' : f.item}), from ${dirWord(f)}`).join('; ')}.`,
          },
          body: [{ kind: 'bullets', items: ['Items: anything that exists in space and time and may flow', 'Reuse the Week 4 information items and the Week 10 items', `A crossing with no item: add one; an information item takes the next ID (${FIRST_NEW_INFO} here)`, 'Each crossing gets a direction from end A or to end A'] }],
          sources: [R('R70', '17'), R('R20c', '598')],
          notes: {
            teach: [
              'An item definition defines things that exist in space and time but are not necessarily parts; items may flow between parts (R70 sl.17). SEBoK names the input-output flows as information, energy and materials (R20c p.598); your Week 5 physical interfaces also carry mechanical loads.',
              `Course mapping: each Week 5 crossing becomes a directed item feature of the interface’s port definition. An information item crossing reuses its Week 4 INFO item; an energy or material item reuses one Week 10 added. A crossing that no item names gets an item this week; an information item takes the next free ID, after the highest your model holds. AeroLink adds ${numberWord(W11_NEW_ITEMS.length)}: ${W11_NEW_ITEMS.map((x) => x.name.toLowerCase()).join(', ')}; the two information items take ${newInfo.map((x) => x.id).join(' and ')}.`,
              `Read the IF-005 table: ${IF5.flows.map((f) => `${f.itemName.toLowerCase()} from ${dirWord(f)}`).join('; ')}. The direction is relative to the interface’s ends; the tool computes it for information items from the Week 4 producers and consumers, and asks you where it cannot.`,
            ],
            why: 'Naming every crossing as an item with a direction is what lets the ports and flows be written; a crossing left as prose stays invisible to the model.',
            figure: 'Read each row: the Week 5 words, the item, the direction.',
            misconceptions: [{ claim: 'Only information crosses an interface in a model.', correction: 'Energy, material and mechanical load cross physical interfaces; they are items too.' }],
            transition: 'Put it together on the AeroLink charging interface.',
            timing: '4 min: 1 min items, 1.5 min the mapping and the IDs, 1.5 min the table.',
          },
        },
        {
          id: 'w11s1-worked-ports',
          title: 'AeroLink worked example II: the charging interface’s ports',
          purpose: 'The whole port method once, end to end, on one interface: the port definition from end A’s view, end A’s port typed by it, end B’s by its conjugate.',
          minutes: 5,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-listing-port-def',
            caption: 'The port definition of IF-005 in AeroLink model v0.4, written from the aircraft’s side: energy in, the battery state out, the charger’s readiness in. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('port-def'),
          },
          body: [
            { kind: 'bullets', items: ['Course convention: written from end A (the aircraft)', 'Aircraft port: the definition; charger port: its conjugate', `AeroLink: ${COUNTS.portDefs} port definitions, ${COUNTS.ports} ports`] },
            { kind: 'callout', tone: 'note', title: 'Pair, 1 min', text: 'At the charger’s port, which of the three items are out?' },
          ],
          sources: [R('R71', '20'), R('R71', '21'), R('R81', '95')],
          notes: {
            teach: [
              `IF-005 joins the eVTOL Aircraft, end A, and the Charging Systems, end B. Its port definition is written from the aircraft’s side: ${IF5.flows.map((f) => `${f.dir === 'AtoB' ? 'out' : 'in'} ${f.feature}`).join(', ')}.`,
              'In the model, the aircraft’s port toChargingSystems is typed by the port definition; the charger’s port toEVTOLAircraft by its conjugate, so every direction is reversed at the charger. The lesson shows both port lines.',
              `Run the pair question. Expected answer: at the charger, the conjugate reverses everything, so ${IF5.flows.filter((f) => f.dir === 'BtoA').map((f) => f.feature).join(' and ')} are out and ${IF5.flows.filter((f) => f.dir === 'AtoB').map((f) => f.feature).join(' and ')} is in. Ask one pair what Session 2 adds: the interface definition that connects the two ports and the flows inside it.`,
              `The whole of AeroLink: ${COUNTS.portDefs} physical and information interfaces, so ${COUNTS.portDefs} port definitions and ${COUNTS.ports} ports; the ${numberWord(COUNTS.organizationalIfs)} organizational interfaces have no ports, as Session 2 explains.`,
            ],
            workedSolution: ['Step 1, the ends: end A and end B as Week 5 records them, each resolved to its part (a component end to the component).', 'Step 2, the crossings: each Week 5 crossing as an item and a direction, A to B or B to A.', 'Step 3, the port definition: one directed item per crossing, out for A to B and in for B to A.', 'Step 4, the ports: end A’s part gets a port typed by the definition, end B’s part a port typed by its conjugate.', 'Step 5, check: every crossing has an item; at each end every out has an in on the other side.'],
            why: 'One complete interface, written construct by construct, is the method students reproduce in the lab on every one of their own.',
            figure: 'Follow the callouts down the port definition; then show the two port lines in the lesson.',
            misconceptions: [{ claim: 'Each end needs its own port definition.', correction: 'One definition per interface is enough; the other end uses its conjugate (course convention).' }],
            transition: 'Some interface ends are outside the enterprise.',
            timing: '5 min: 1 min the ends, 1.5 min the listing, 1.5 min pair question and debrief, 1 min the whole model.',
          },
        },
        {
          id: 'w11s1-externals',
          title: 'Externals: ports on the systems outside',
          purpose: 'Show where an external end’s port goes: a reference part in physicalArchitecture that subsets the external in the context, and how an external Week 5 added enters the context.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-listing-externals',
            caption: 'The weather information service in AeroLink model v0.4: added to the context from the Week 4 record, and referenced in physicalArchitecture with the port of its interface. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('externals'),
          },
          body: [{ kind: 'bullets', items: ['An external is in the Week 8 context; it is not part of your system', 'In physicalArchitecture: a ref part that subsets it, carrying the port', `An external added in Weeks 4 or 5 joins the context first (AeroLink: ${numberWord(COUNTS.addedExternals)})`] }],
          sources: [R('R81', '90'), R('R70', '15–16')],
          notes: {
            teach: [
              'The externals were modeled in Week 8, as part usages of the context with their EXT IDs. They are not owned by your physical architecture, so it refers to them: a reference part that subsets the external’s usage in the context, written with dot notation, carries the port of the interface.',
              `An external your Week 4 or Week 5 record added, which the Week 8 context does not have, is first added to the context with its own ID, after the model’s existing externals. AeroLink’s weather information service is one: ${numberWord(COUNTS.addedExternals)} external added this week. An external with no interface at all is a trace finding: record why it has none.`,
            ],
            why: 'Students who put externals inside their own system blur the boundary Week 1 drew; a reference keeps the boundary and still gives the external a port.',
            figure: 'Point at the context line first, then the ref part and its port.',
            misconceptions: [{ claim: 'An external system becomes part of the physical architecture once it has an interface.', correction: 'It stays outside, in the context; the physical architecture refers to it.' }],
            transition: 'Before you write your own ports, predict one checker result.',
            timing: '3 min: 1.5 min the reference, 1.5 min the added external.',
          },
        },
        {
          id: 'w11s1-predict',
          title: 'Predict: accepted or rejected?',
          purpose: 'Practice the most common port-definition error before meeting it in the lab: an item written without a direction. The result is revealed on the next slide.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-predict-card',
            caption: 'A port definition from the oxygen supply, shown without its checker result. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `A code card titled Accepted or rejected? Why? with these lines: ${cardAlt('predict-undirected')}.`,
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Predict, 1 min', text: 'Will the checker accept this file?' },
            { kind: 'bullets', items: ['Write: accepted or rejected', 'If rejected: the line, and the reason'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Give pairs one minute. Ask each pair to write accepted or rejected, and if rejected, the line and the reason. Do not confirm or deny anything; the result is on the next slide, with the other recorded checker results.',
              'If a pair asks whether the item’s name matters, say no: look at what the line in the port definition does not say.',
              'While pairs write, listen for the two typical answers: “accepted, it is a port with an item” and “rejected, something about the item”. Note how many pairs give each, without comment; the pairs who said accepted have just met the port error the lab sees most.',
            ],
            why: 'Predicting before seeing the result makes the rule stick, and keeping the result off this slide keeps the prediction honest.',
            figure: 'Read the lines aloud, slowly, without emphasis on any of them.',
            transition: 'Here is what the checker said, and what it says about the rest of today’s constructs.',
            timing: '2 min: 1 min pairs predict, 1 min collect answers.',
          },
        },
      ],
    },
    // ============================================================================================ D. close (6 min)
    {
      id: 'w11s1-close',
      title: 'Calibration and exit',
      slides: [
        {
          id: 'w11s1-checker',
          title: 'What the checker checks about ports, and what it cannot',
          purpose: 'Reveal the predict item and calibrate trust in tool output on ports and interfaces: recorded results of release 2026-08, each described by what the error is about.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-checker-table',
            caption: `Recorded results of the course checker (release 2026-08) on ${s1Rows.length} course files about ports and interfaces: what it rejects, and what it accepts without complaint. Course illustration, not SysML v2 graphical notation.`,
            alt: `Two columns. Left, headed checker rejects: ${rejected.map((c) => c.label).join('; ')}. Right, headed checker accepts: ${accepted.map((c) => c.label).join('; ')}. The messages the checker recorded are in the notes and the lesson.`,
          },
          body: [{ kind: 'bullets', items: ['The predict card: rejected; a port’s features must be referential, and an undirected item is not', 'Rejected: names that do not resolve, ends that are not ports', 'Accepted silently: ports that cannot match, flows the wrong way', 'Zero errors is necessary, never sufficient'] }],
          sources: [R('R81', '95'), R('R71', '20'), R('R81', '106')],
          notes: {
            teach: [
              `Reveal the predict item: rejected, with “${predictRow.recorded}” at the item. A port definition’s features other than nested ports must be referential (R81 p.95), and a directed feature always is (R71 sl.20); an item with no direction and no ref is composite. Precision matters: the rule is about being referential, so the fix is a direction, which the interface needs anyway.`,
              `Read the left column, each with its recorded message: ${rejected.map((c) => `${c.what.toLowerCase()}: “${c.recorded}”`).join('; ')}. The second is the specification’s rule that an interface definition’s ends are ports (R81 p.106).`,
              `Then the right column, both passing with no message: ${accepted.map((c) => c.what.toLowerCase()).join('; ')}. The first is the driving question.`,
              'The rule for the course: zero errors is necessary and never sufficient. These behaviors are recorded for the course release of the checker; a new release may report more, or less.',
            ],
            why: 'Students about to generate dozens of ports and interfaces need to know which mistakes the tool will catch and which only their own review will.',
            figure: 'Read the two columns row by row; pause on the driving question’s file, now on the right.',
            misconceptions: [{ claim: 'A warning-free PASS means the interfaces are modeled correctly.', correction: 'Two of the recorded passes contain interface errors the checker does not report.' }],
            transition: 'Now one of your own interfaces, before Session 2.',
            timing: '3 min: 1 min the reveal, 1 min the rejects, 45 s the silent passes, 15 s the rule.',
          },
        },
        {
          id: 'w11s1-exit',
          title: 'Exit: one interface from your Week 5 table',
          purpose: 'Retrieval and preparation for Session 2: each student writes the port definition of one of the team’s interfaces; it is the first item of the lab.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s1-exit-card',
            caption: 'The exit card: four fields to fill for one interface of your team’s Week 5 table, and two questions. Course illustration, not SysML v2 graphical notation.',
            alt: 'A card with four labeled boxes: ends A and B, crossings, port definition, conjugate end. Below them a tag: and two questions (the questions are listed on the slide).',
          },
          body: [{ kind: 'bullets', items: ['Pick a physical or information interface from your Week 5 table', 'Write: its two ends, each crossing as an item and a direction, the port definition from end A', 'Which crossing has no item in your model yet?', 'Which end takes the conjugate?'] }],
          sources: [],
          notes: {
            teach: [
              'Each student takes one physical or information interface from the team’s Week 5 table and writes four things: the two ends, A and B; each crossing as an item and a direction; the port definition written from end A, with an out for each crossing from A and an in for each crossing into A; and which end is typed by the conjugate.',
              'Then one line for each question. Which crossing has no item in your model yet, so the team must add one, and what kind is it? Which end takes the conjugate, and what does the port definition look like from there?',
              'Collect nothing today. Students bring the card to Session 2: the lab begins with the crossings of every interface, and the checkpoint looks at them.',
            ],
            why: 'Writing one port definition immediately consolidates directions and conjugation, and the two questions rehearse the decisions the lab asks for.',
            figure: 'Read the four fields, then the two questions; point at “which crossing has no item” and say that is where most first drafts stall.',
            misconceptions: [{ claim: 'Every crossing already has an item from Week 4.', correction: 'Week 4 listed information items; energy, material and load crossings usually need an item added now.' }],
            transition: 'Session 2 starts with three drafts of one connection to judge, then interfaces, flows and interface requirements.',
            timing: '3 min: 2 min writing, 1 min the questions and what to bring.',
          },
        },
        {
          id: 'w11s1-references',
          title: 'References and credits',
          purpose: 'List every source the session cites, with the license statements the sources require.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while students finish the exit card; no commentary is needed. The list is generated from every citation in the session, with the training deck’s license statement and SEBoK’s required attribution.'],
            why: 'Students should be able to find every source the session relied on, and the sources’ licenses require the attribution.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the exit card.',
          },
        },
      ],
    },
  ],
  // ============================================================================================ student lesson
  studentLesson: [
    {
      id: 'w11s1-l-continuity',
      title: 'From the Phase I package to the physical architecture',
      blocks: [
        { kind: 'para', text: 'In Week 4 your team decided on which physical element each function runs, and in Week 5 it broke those elements into components and defined the interfaces between them, with what crosses each one, its medium and its interface requirements. In Week 10 it put the logical architecture and the behavior into its SysML v2 model. This week the physical elements, components and interfaces enter the Physical package. Nothing is invented and nothing is retyped: the IDs, names, ends and crossings come from your Week 5 export, which carries the Week 4 physical view inside it, and the Week 11 lab tool reads it for you.' },
        { kind: 'figure', slide: 'w11s1-title' },
        { kind: 'para', text: `The model brings two things into this week. The logical parts and their functions, which now need physical homes. And the part definitions Week 9 placed in Physical as subjects of system requirements, named after the element each requirement is about; AeroLink has ${numberWord(COUNTS.placeholders)}. Each is linked to the physical element it stands for, so the requirement keeps a valid subject.` },
        { kind: 'figure', slide: 'w11s1-continuity' },
      ],
      sources: [],
    },
    {
      id: 'w11s1-l-physical',
      title: 'Physical architecture, layers, allocation and pitfalls',
      blocks: [
        { kind: 'para', text: 'SEBoK describes a physical architecture model as an arrangement of system elements and physical interfaces that provides the solution for a product, service or enterprise, accommodating the logical architecture and satisfying and trading off the system requirements. A system element can be hardware, software, data, people, processes, procedures, facilities or materials; a physical interface binds two system elements, much like a link or a connector, and in an enterprise it can be a protocol, a procedure or a document. System requirements are allocated to the logical and to the physical architecture.' },
        { kind: 'figure', slide: 'w11s1-physical-arch' },
        { kind: 'para', text: `A system element may itself be a system, so physical architectures have layers; SEBoK’s guideline is to keep one level to five plus or minus two elements. In the model a component is a part usage nested inside the usage of its element. AeroLink has ${COUNTS.physical} physical elements and ${COUNTS.components} components.` },
        { kind: 'figure', slide: 'w11s1-layers' },
        { kind: 'para', text: `Allocation starts by finding the system elements that can perform the logical functions and the interfaces that can carry the flows between them. Partitioning uses explicit criteria: the same technology, the same kind of flow (information, energy, material), central or distributed control, dependability, environment. A logical element lands wherever its functions are performed, so it can have more than one physical home; ${SPLIT.length} of AeroLink’s ${COUNTS.logical} logical elements do.` },
        { kind: 'figure', slide: 'w11s1-allocation-criteria' },
        { kind: 'para', text: 'SEBoK collects three pitfalls: too many levels of decomposition inside one block, going from requirements straight to a physical design without a logical architecture, and allocating functions directly onto the lowest technologies at a high level of abstraction. Its practices are modularity, few interfaces outside an element and much consistency inside it, and a focus on interfaces rather than elements. The process outputs an allocation matrix from functions to physical elements and a traceability matrix to the system requirements; the lab tool computes both from your model.' },
      ],
      sources: [R('R20c', '596–600'), R('R20c', '602–603'), R('R81', '90')],
    },
    {
      id: 'w11s1-l-structure',
      title: 'Parts, performers and the logical-to-physical allocation',
      blocks: [
        { kind: 'para', text: 'Each physical element is modeled with the definition and usage pattern of Weeks 8 and 10: a part definition gives the kind, a part usage is the element in this architecture. The course puts one part, physicalArchitecture, in the Physical package, with one part usage per element carrying its PHY ID as a quoted short name, and each component as a part usage inside its element with its CMP ID. When a Week 9 placeholder has the same name as an element, it becomes that element’s definition; otherwise the team links it, and the element’s new definition specializes it. Either way, a requirement whose subject is the placeholder still conforms.' },
        { kind: 'figure', slide: 'w11s1-parts-physical' },
        { kind: 'para', text: 'A physical part performs the functions Week 4 placed on it, with perform, which makes the part the performer of the action defined in Logical. The course performs each function at level 1, on the element; the functions a Week 5 component lists are written into that component’s documentation instead of a second perform, so responsibility is never stated twice.' },
        { kind: 'figure', slide: 'w11s1-perform-physical' },
        { kind: 'para', text: `The two architectures are joined by allocation: a target element is made responsible for realizing some or all of the intent of the source. Each logical part is allocated to every physical part that performs one of its functions, and each such allocation is refined by nested allocations, one for each function the two perform. The tool reads the allocation from the placements, so it cannot contradict them. AeroLink has ${COUNTS.allocations} allocations and ${COUNTS.nestedAllocations} nested ones.` },
        { kind: 'figure', slide: 'w11s1-allocate-l2p' },
        { kind: 'figure', slide: 'w11s1-worked-allocation' },
        { kind: 'para', text: 'The table below gives every AeroLink physical element as model v0.4 writes it: its definition, the Week 9 placeholder that definition specializes where there is one, its components and the functions it performs. It is the allocation matrix of functional to physical elements SEBoK lists among the outputs of the process, read from the model rather than typed. Notice the element that performs nothing: the communications infrastructure, which Week 4 made the medium of the information interfaces.' },
        { kind: 'table', header: ['Element', 'Definition', 'Components', 'Performs'], rows: AEROLINK_W11_MODEL.parts.map((p) => [`${p.id} ${physicalName(p.id)}`, p.specializes.length ? `${p.def}, specializing ${p.specializes.join(', ')}` : p.def, p.components.map((c) => c.id).join(', ') || 'none', p.performs.join(', ') || 'none']), caption: 'The AeroLink physical elements in model v0.4, read from the generated model (FICTIONAL)' },
        { kind: 'para', text: `The nested allocations pair each function with both of its performers. ${AEROLINK_W11_MODEL.allocations.map((a) => `${a.log} goes to ${a.phy} with ${a.fns.join(', ')}`).join('; ')}.` },
        diff
          ? { kind: 'para', text: `Comparing the matrix with the Week 4 allocation table finds one difference: Week 4 also lists ${diff.onlyW4.map(physicalName).join(', ')} for ${diff.name}, yet no ${diff.name} function is performed there. The model allocates only where a function is performed, so the difference is shown as a question for the Week 4 table rather than hidden.` }
          : { kind: 'para', text: 'The matrix agrees row by row with the Week 4 allocation table.' },
        { kind: 'para', text: 'A physical element also carries design properties: values assigned from requirements, estimates, analyses or simulations. In the model a design value is an attribute redefinition on the physical part, inherited from the placeholder that declared the attribute the requirement constrains. Every design value needs its source, an analysis, an estimate or a measurement; Session 2 uses it in a satisfy claim.' },
        { kind: 'figure', slide: 'w11s1-design-properties' },
      ],
      sources: [R('R70', '15–16'), R('R81', '90'), R('R72', '41'), R('R82', '136'), R('R76', '106'), R('R81', '110–112'), R('R20c', '598'), R('R20c', '600')],
    },
    {
      id: 'w11s1-l-ports',
      title: 'Ports, directed features and conjugation',
      blocks: [
        { kind: 'para', text: 'A port definition defines a connection point that enables interactions between occurrences, most often parts, and its features say what can be exchanged; a port usage puts that connection point on a part. A feature of a port may be directed in, out or inout. Two features match when their types conform and their directions are conjugate, and a transfer goes from an out feature to the matching in feature of a connected port; two ports conform when every feature of one has a match on the other. Every feature of a port definition other than a nested port must be referential, which a directed feature always is.' },
        { kind: 'figure', slide: 'w11s1-port-def' },
        { kind: 'figure', slide: 'w11s1-directed-features' },
        { kind: 'para', text: `Every port definition carries a conjugated port definition, with the same features and every in and out reversed. Its actual name is P::'~P', declared inside P. The shorthand port p : ~P; types a port by it; with a quoted name the tilde goes outside the quotes, ~'P-1', or the actual name is qualified, 'P-1'::'~P-1'. Written alone, '~P-1' does not resolve. A conjugated port conforms to the original, so a port typed by P connects cleanly to a port typed by ~P. The course writes one port definition per interface, from the point of view of the first end, and types the second end by its conjugate.` },
        { kind: 'figure', slide: 'w11s1-conjugation' },
        { kind: 'para', text: 'The driving question connected two ports that were both typed by the same definition, so both offered the oxygen out and neither could take it in. Typing the outlet’s end and port by the conjugate fixes it. The checker accepted both files with no message: it does not test that connected ports match.' },
        { kind: 'figure', figure: { id: 'w11s1-listing-two-ports', caption: 'The driving question as a checked file: both ends typed by the same port definition. Checked: PASS. (FICTIONAL)', alt: listingAlt('two-ports') } },
        { kind: 'figure', slide: 'w11s1-reveal' },
      ],
      sources: [R('R81', '93'), R('R81', '95'), R('R71', '20–21')],
    },
    {
      id: 'w11s1-l-worked',
      title: 'Worked example: the ports of the charging interface',
      blocks: [
        { kind: 'para', text: `Each Week 5 crossing becomes a directed item feature of the interface’s port definition. An information item crossing reuses its Week 4 item; an energy or material crossing reuses an item Week 10 added where one fits; any other crossing gets an item now, and an information item takes the next free ID. AeroLink adds ${numberWord(W11_NEW_ITEMS.length)}: ${W11_NEW_ITEMS.map((x) => (x.id ? `${x.name.toLowerCase()} (${x.id})` : x.name.toLowerCase())).join(', ')}.` },
        { kind: 'figure', slide: 'w11s1-crossings' },
        { kind: 'para', text: `The charging interface joins the aircraft, its first end, and the charging systems. Written from the aircraft’s side, its port definition has ${IF5.flows.map((f) => `${f.dir === 'AtoB' ? 'an out' : 'an in'} item for ${f.itemName.toLowerCase()}`).join(', ')}. The aircraft’s port is typed by the definition and the charger’s by its conjugate, where every direction is reversed.` },
        { kind: 'figure', slide: 'w11s1-worked-ports' },
        { kind: 'figure', figure: { id: 'w11s1-listing-worked-ports', caption: 'The two ports of IF-005 in AeroLink model v0.4: the aircraft’s typed by the port definition, the charger’s by its conjugate (excerpt). Checked: PASS. (FICTIONAL)', alt: listingAlt('worked-ports') } },
        { kind: 'para', text: 'An end outside the enterprise has its port on a reference part in physicalArchitecture that subsets the external’s usage in the Week 8 context; an external that only your Week 4 or Week 5 record names is added to the context first, with its own ID. An external with no interface at all needs a recorded reason.' },
        { kind: 'figure', slide: 'w11s1-externals' },
        { kind: 'para', text: 'Doing this for one of your own interfaces takes five moves, the same each time. Resolve the two ends: a physical element, a component nested in one, an AI capability placed on its host, or an external. List what crosses, one item and one direction per crossing; an item that crosses both ways is two crossings. Write the port definition from the first end’s point of view, out for what leaves it and in for what reaches it. Give the first end a port typed by the definition and the second end a port typed by its conjugate. Then check, before anything else, that every out at one end has an in at the other and that the item really is produced where it leaves, according to your information view. The lab tool performs the first four moves from your Week 5 record; the fifth is yours.' },
      ],
      sources: [R('R70', '17'), R('R20c', '598'), R('R71', '20–21'), R('R81', '95')],
    },
    {
      id: 'w11s1-l-checker',
      title: 'What the checker can and cannot tell you about ports',
      blocks: [
        { kind: 'para', text: `The course checker decides whether a file parses, whether every name resolves and whether any validation rule fires. On ports and interfaces it rejects ${rejected.map((c) => c.what.toLowerCase()).join('; ')}. It accepts, without any message, ${accepted.map((c) => c.what.toLowerCase()).join('; ')}. The predict card was rejected because a port’s features must be referential and an item with no direction and no ref is not. Those results are recorded for the course release; a new release may report more or less.` },
        { kind: 'figure', slide: 'w11s1-checker' },
        { kind: 'para', text: 'So zero errors is necessary and never sufficient. For every interface you model, check that each end is a port on the element your Week 5 table names, that the second end uses the conjugate, that every crossing is an item with a direction, and that the item is produced at the end it leaves. Before Session 2, write the port definition of one of your team’s interfaces.' },
        { kind: 'slide-ref', slide: 'w11s1-exit', text: 'See the exit card.' },
      ],
      sources: [R('R81', '95'), R('R71', '20'), R('R81', '106')],
    },
  ],
}
