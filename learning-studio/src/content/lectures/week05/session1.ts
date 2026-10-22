// Week 5, Session 1 lecture: Components / Interfaces — the component breakdown, what an interface is and how to type it,
// external and hidden external interfaces, the N² chart built and read in full on AeroLink, the crossing-flow check, and
// interface definitions with interface requirements. 75-minute session: 69 minutes of planned content on 21 slides plus
// the generated "References and credits" slide, and a 6-minute buffer (bufferMinutes). Single source for the slide
// viewer, the faculty notes, the .pptx and the student lesson (docs/lectures/PIPELINE.md). Governing direction:
// DECISION_LOG A20 (teach first, explain in depth, demonstrate, then assign) and A21 (the Week 1 architecture is the
// template; security and resilience are integrated into Weeks 3, 5 and 6: Session 2 carries the interface security part).
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week05/WEEK05_LECTURE_OUTLINE.md §2, with the
// outline's driving question replaced by the gap Week 4 actually handed over (the pad incident records of INFO-006), and
// the answers of every student exercise moved to the slide after the exercise (Week 4 review: no answers before students
// supply them).
//
// Accuracy rules followed:
//   - Every citation is a verified register entry (readings.generated.json) at a page whose extracted text
//     (_source_cache/*.txt) supports the claim beside it. R100–R104 (SEBoK glossary: interface, component, system element,
//     system breakdown structure; the DoD work breakdown structure subsection) were added to the register for this
//     lecture, pending faculty confirmation.
//   - Course conventions are labeled as such: the interface typing, the N² conventions (diagonal, symmetric form, row
//     produces and column consumes), the responsibility card, the interface-table columns and the coverage rule. Source
//     gaps are named where they bite (no source in the collection states the N² row/column convention; no interface
//     control document template is held).
//   - AeroLink Urban Mobility is FICTIONAL. Week 1–4 data are imported read-only; Week 5 data come from ./aerolinkCase.ts.
//     Numbers on the slides and in the notes are computed there, not typed here.
//   - Timing: spoken notes (teach, worked solution, figure walk) stay at or below 130 words per minute (./timing.test.ts).
//   - Faculty notes and purposes are stripped from the student build (student-edition.ts).
import type { Lecture, LessonSection } from '../types'
import { info } from '../week04/aerolinkCase'
import {
  COMPONENTS, COUNTS, DIAGONAL, RECEIVED, SHORT, n2Cell, DRIVING_QUESTION, HIDDEN_EXTERNAL, INTERFACE_DECISION, INTERFACE_REQUIREMENTS, RADIO_INTERFACES, componentsOf, crossingFlows, directionOf, elementName, functionsAt, iface, ownerOf,
} from './aerolinkCase'
import { INTERFACE_KINDS, TABLE_COLUMNS } from './labBrief'

export const WEEK5_S1_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const c14 = COUNTS.received
const if7 = iface('IF-007')
const if15 = iface('IF-015')
const rq13 = INTERFACE_REQUIREMENTS.find((q) => q.id === 'REQ-SYS-013')!
const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`)
const deg = (id: string) => c14.degrees[id]
const phy3Functions = functionsAt('PHY-003')
const flows = crossingFlows()
const ops = elementName('PHY-004').toLowerCase()

const N2_ROWS = DIAGONAL.map((a) => [
  `${a} ${SHORT[a]}`,
  DIAGONAL.filter((b) => b !== a && n2Cell(a, b, RECEIVED).length).map((b) => `${SHORT[b]}: ${n2Cell(a, b, RECEIVED).map((id) => `${id} ${iface(id).kind[0].toUpperCase()}`).join(', ')}`).join('; ') || 'none',
  String(c14.degrees[a]),
])

const LESSON: LessonSection[] = [
  {
    id: 'w5-lesson-why',
    title: 'Why this week: what passes between the parts',
    sources: [R('R47', '140'), R('R57', '410')],
    blocks: [
      { kind: 'para', text: 'Week 4 gave your team a physical view, the concrete elements that implement its functions, and an information view, the route of every item from the element that produces it to the decision it supports. Week 5 asks two questions of that architecture. What is each element made of, and who answers for it? And, above all, what exactly passes between the elements, and between them and the world outside? The first question gives a **component breakdown**; the second gives an **N² chart** and an **interface table**.' },
      { kind: 'para', text: 'Interfaces deserve most of the week because that is where systems break. Two teams build their sides to different assumptions; an owner changes its side without telling the other; data arrive late, altered or not at all; an attacker reaches a safety function through a link nobody thought of as a boundary. Interface management, in MITRE’s words, is the work of defining, controlling and communicating the information that lets unrelated objects co-function, and it starts at design and runs through operations (R57 p.410). The DoD guidebook lists what documented interface requirements serve: the functional and physical architectures, integration, maintenance and future upgrades, and continuous risk management (R47 p.140).' },
      { kind: 'figure', slide: 'w5s1-where' },
      { kind: 'para', text: 'Week 4 also handed this week an open question. The evidence log at AeroLink’s operations center must keep an auditable record of every flight, pad incidents included, for the insurers; the pad incident records are produced by the fire detection system; and no interface joined the two. The alarm itself already went to the emergency services, which tempts a reader to think the data were “out”. They were out of AeroLink, not into its log. Hold that case in mind: the method below is the one that finds such gaps, and the end of the N² section closes this one.' },
      { kind: 'figure', slide: 'w5s1-driving-question' },
    ],
  },
  {
    id: 'w5-lesson-elements',
    title: 'Components: system elements at the level you choose',
    sources: [R('R102', '1643'), R('R101', '1467'), R('R20c', '597'), R('R103', '1640'), R('R104', '104'), R('R19', '571')],
    blocks: [
      { kind: 'para', text: 'The standard term is **system element**. The SEBoK glossary, quoting ISO/IEC/IEEE 15288, defines it as a member of the set of elements that constitutes a system: a discrete part that can be implemented to fulfill specified requirements, which can be hardware, software, data, humans, processes, procedures, facilities, materials and naturally occurring entities, or any combination (R102 p.1643). The everyday word the schedule uses, **component**, has three glossary definitions; the plain one is “one of the parts that make up a system”, and the glossary’s discussion adds that systems engineers use component for the level of decomposition at which elements are no longer considered complex and specialist disciplines take over (R101 p.1467). In this course a component is a system element at the level your team chooses.' },
      { kind: 'figure', slide: 'w5s1-system-element' },
      { kind: 'para', text: 'Read the list of kinds slowly, because enterprise teams forget most of it. If your breakdown contains only hardware and software, half of your enterprise’s functions have nowhere to live, and the organizational interfaces between its people and its partners disappear with them.' },
      { kind: 'heading', text: 'Layers, span and depth' },
      { kind: 'para', text: 'SEBoK describes a complex system as structured in layers of systems and system elements, with only a few elements in each level so that the definition stays manageable; a common guideline is five plus or minus two (R20c p.597). Two decisions shape a breakdown. How wide: about five elements per level, so one reviewer can hold the level and its interfaces in mind. How deep: stop each branch when the element is no longer complex. The guideline is a guideline, and the course treats it as one: a level of eight is a prompt to look for elements that belong together, not an error, and a justified exception is better than an unnatural grouping. A branch with a single child is a rename, not a breakdown.' },
      { kind: 'figure', slide: 'w5s1-layers' },
    ],
  },
  {
    id: 'w5-lesson-breakdown',
    title: 'The system breakdown, the work breakdown, and which elements we break down',
    sources: [R('R103', '1640'), R('R104', '104'), R('R19', '571'), R('R20c', '597')],
    blocks: [
      { kind: 'para', text: 'A **system breakdown structure**, in the glossary’s IEEE 1220 wording, is a hierarchy of elements, related life-cycle processes and personnel used to assign development teams, conduct technical reviews and partition the work (R103 p.1640). A **work breakdown structure**, in the DoD guidebook, decomposes the scope of work into product-oriented elements for authorizing, tracking and reporting; its elements do not overlap, a WBS dictionary defines them, and they are defined in terms of outcomes, not actions (R104 p.104). The first describes the system; the second, the work that delivers it. Work done on the app belongs in a WBS, named as its outcome (“the app design”, “integration test results”), never in your component breakdown.' },
      { kind: 'figure', slide: 'w5s1-breakdown-wbs' },
      { kind: 'para', text: 'Week 4 kept two kinds of element. Logical configuration items carry allocated functions, interfaces and performance requirements without a specific implementation; physical configuration items provide a specific implementation of each logical element (R19 p.571). Components refine the **physical** elements, because those have owners, locations and suppliers, and because the interfaces you are about to define join physical things. SEBoK’s description of a physical architecture is the plan of this week in one sentence: system elements, the physical interfaces between them, and the external elements around the system of interest (R20c p.597).' },
      { kind: 'figure', slide: 'w5s1-logical-physical' },
    ],
  },
  {
    id: 'w5-lesson-aerolink-breakdown',
    title: 'Worked example: AeroLink’s breakdown and its responsibility cards',
    sources: [R('R20c', '597'), R('R47', '139')],
    blocks: [
      { kind: 'para', text: `AeroLink (fictional) starts from its ${COUNTS.level1} Week 4 physical elements, in the configuration the Week 3 trade chose: ${COUNTS.aircraft} aircraft, ${COUNTS.vertiports} vertiports of which ${COUNTS.hubs} are hubs, and ${COUNTS.chargers} chargers. That is above the guideline; the reference keeps all ${COUNTS.level1} because merging the booking platform into the operations center would hide a public-facing element and a trust boundary that matter in Session 2. That is the kind of written reason the guideline asks for.` },
      { kind: 'para', text: `${COUNTS.brokenDown.length} of the ${COUNTS.level1} are still complex and are broken down one level; the communications network, a medium with no function of its own, and the two single-purpose elements are not. Every component must carry some of its parent’s Week 4 functions, and every function of the parent must land on some component: the reference was checked for both, so the breakdown cannot contradict the allocation. The level-2 components are proposed for the reference.` },
      { kind: 'table', header: ['Component', 'Under', 'Kind', 'Responsibility', 'Functions'], rows: COMPONENTS.map((c) => [`${c.id} ${c.name}`, `${c.parent} ${SHORT[c.parent]}`, c.kind, c.responsibility, c.functions.join(', ')]), caption: 'AeroLink’s level-2 components (FICTIONAL; proposed). Each refines its parent’s Week 4 allocation.' },
      { kind: 'figure', slide: 'w5s1-worked-breakdown' },
      { kind: 'para', text: `Each element then gets a **responsibility card**, a course convention with five fields: the responsibility in one sentence, the functions allocated to it, the requirements those functions carry, the owning organization, and its interfaces. The charging systems’ card reads: functions ${list(phy3Functions)}; requirements REQ-SYS-001 and REQ-SYS-010; owner ${ownerOf('PHY-003').toLowerCase()}; interfaces IF-005, IF-006 and IF-010. The owner field is there because each side of an interface is managed by the owner of the element on that side: the DoD guidebook asks interface management to consider roles and responsibilities, funding and scheduling as well as the technical work (R47 p.139). The interfaces field stays empty until the N² chart is built.` },
      { kind: 'figure', slide: 'w5s1-cards' },
    ],
  },
  {
    id: 'w5-lesson-typing',
    title: 'Interfaces: definition and kinds',
    sources: [R('R100', '1541'), R('R20c', '597'), R('R57', '411')],
    blocks: [
      { kind: 'para', text: 'The SEBoK glossary’s first definition of **interface**, from ISO/IEC 2382-1, is a shared boundary between two functional units, defined by characteristics of the functions, the physical signal exchanges and others (R100 p.1541). Shared: there are always two sides, and each has an owner. Boundary: it sits between elements, not inside one. SEBoK’s physical architecture article says a physical interface binds two system elements, like a link or a connector, and lists protocols, procedures and documents as interfaces in service and enterprise systems (R20c p.597). MITRE describes interfaces as the functional and physical connections at system boundaries and names many types, from communications and data to hardware and software interfaces (R57 p.411).' },
      { kind: 'figure', slide: 'w5s1-interface' },
      { kind: 'para', text: 'The course types interfaces into three kinds. This typing is a course convention, not a SEBoK or MITRE taxonomy; in SEBoK’s binding sense all three are physical interfaces (R20c p.597). The course uses it because each kind is verified and managed differently.' },
      { kind: 'table', header: ['Kind', 'What crosses', 'Example'], rows: INTERFACE_KINDS.map((k) => [k.label, k.crosses, k.example]), caption: 'The course interface typing (course convention).' },
      { kind: 'para', text: 'The kind and the flag are separate: external is a flag, not a fourth kind: an interface with one end outside the system of interest. AeroLink’s grid connection is physical and external; its link to the weather service is information and external. External interfaces change only with the other party’s agreement. The organizational kind carries no flow by definition: if data travel between two parties who also have an agreement, you need an information interface beside the agreement. AeroLink’s work-order procedure between operations and maintenance sits next to the information interface that carries the go or no-go status.' },
      { kind: 'figure', slide: 'w5s1-typing' },
    ],
  },
  {
    id: 'w5-lesson-external',
    title: 'External and hidden external interfaces',
    sources: [R('R54', '331'), R('R55', '369')],
    blocks: [
      { kind: 'para', text: 'MITRE asks that requirements capture all interactions with external systems and the environment so that the boundaries are clear, and warns that hidden external interfaces appear when internal communications use an external medium such as radio, a satellite relay or an outside network (R54 p.331). Its checklist for system-level requirements says all external interfaces are included, with the major internal ones that matter for modularity or growth, and that an internal interface over a transport that is not part of the system is a hidden external interface: the exchanged data are internal, the network and its protocols are external (R55 p.369).' },
      { kind: 'para', text: `The only way to find a hidden external interface is to name the medium of every interface. AeroLink’s communications network carries ${HIDDEN_EXTERNAL.length} of its information interfaces; Week 4 left open whether every segment is AeroLink’s own. If any is leased, those interfaces have an external part that another organization operates and can change. Radio is the case MITRE names first: ${list(RADIO_INTERFACES)} use the air-ground radio datalink, and anyone with a transmitter can reach the airwaves, so they have a hidden external part whoever owns the radios (R54 p.331).` },
      { kind: 'figure', slide: 'w5s1-external-hidden' },
    ],
  },
  {
    id: 'w5-lesson-n2',
    title: 'The N² chart: built, read and checked',
    sources: [R('R22', '630'), R('R22', '631'), R('R55', '369'), R('R20c', '599'), R('R20c', '603')],
    blocks: [
      { kind: 'para', text: 'SEBoK’s integration article names the N-squared diagram, after Grady, as one of the most basic methods for defining integration aggregates and their order (R22 p.630); the coupling matrix is reorganized to group elements into aggregates so that the interfaces to be verified between aggregates are minimized, and it then helps locate faults (R22 p.631). The way the chart is drawn is a course convention, since the collection does not state it and Grady’s book is not held. Every element goes on the diagonal, your own and the external ones. In the **interface N²**, each cell above the diagonal lists the interfaces joining that pair, once, because an interface is shared; the lower triangle mirrors it. In the **directed N²**, used for information, the row element produces and the column element consumes.' },
      { kind: 'figure', slide: 'w5s1-n2' },
      { kind: 'para', text: 'One arithmetic check catches most errors. The **degree** of an element is the number of interfaces that touch it. Each interface has two ends, so the degrees sum to exactly twice the number of interfaces. A sum that is not twice the count means a one-ended interface or a miscount.' },
      { kind: 'heading', text: 'Worked example: AeroLink’s N² from the fourteen interfaces' },
      { kind: 'para', text: `The diagonal holds the ${COUNTS.level1} physical elements and the ${DIAGONAL.length - COUNTS.level1} external elements of the Week 4 view. Placing the ${c14.total} received interfaces gives ${c14.physical} physical, ${c14.information} information and ${c14.organizational} organizational; ${c14.external.length} are external (${list(c14.external)}). The table lists each element’s neighbours with the interfaces between them; P, I and O mark the kind.` },
      { kind: 'table', header: ['Element', 'Interfaces with its neighbours', 'Degree'], rows: N2_ROWS, caption: `AeroLink’s interface N² as a list, from the ${c14.total} interfaces received from Week 4 (FICTIONAL). Degrees sum to ${c14.degreeSum} = 2 × ${c14.total}.` },
      { kind: 'figure', slide: 'w5s1-worked-n2' },
      { kind: 'para', text: `Read the chart for three things. The **hub**: the operations center touches ${c14.degrees['PHY-004']} of the ${c14.total} interfaces, a consequence of the Week 4 decision to run the whole network from one platform; it is where failure and attack concentrate, and SEBoK’s advice to focus on interfaces at abstract levels (R20c p.603) points there first. The **empty rows**: ${c14.isolated.length} elements have no interface. The communications network is correct at zero, because it is the medium, not an end. Weather is a natural system, whose information arrives through the weather service. The aircraft and spares supply and the public transport network are different: Week 2’s maintenance scenario orders parts from the first, and a Week 2 assumption relies on the second during disruptions. MITRE’s rule that all external interfaces are included (R55 p.369) means each needs an interface or a recorded reason. The **sum**: ${c14.degreeSum} = 2 × ${c14.total}, so the list is internally consistent.` },
      { kind: 'figure', slide: 'w5s1-reading-n2' },
      { kind: 'heading', text: 'Checking the list against the functional flows' },
      { kind: 'para', text: `A full-looking chart can still miss an interface, because the chart is built from the list. The check that can find a missing one starts from the functions. Overlay the Week 4 allocation: a flow from one function to another whose two functions sit on different physical elements is a **crossing flow**, and it must ride an information interface, directly or by a recorded relay. This is the course coverage rule from Week 4; SEBoK’s integration checklist, that every interface and interaction between implemented elements is verified (R22 p.630), is the reason it matters. AeroLink has ${flows.length} crossing flows, computed from the functions’ inputs and outputs; all are carried now. In Week 4 one was not: the pad incident records feeding the evidence log.` },
      { kind: 'figure', slide: 'w5s1-crossing' },
      { kind: 'para', text: `Three answers were possible: a new interface from the fire detection system to the operations center, a relay through the vertiport systems, or staff re-entering each incident. The reference chooses the first, recorded as an interface decision: ${INTERFACE_DECISION.rationale} Counting does not decide it: the direct path and the relay each add one interface, so the N² has ${RECEIVED.length + 1} interfaces either way. What differs is the path: the relay puts a second system and a second owner’s availability between the record and the log. The decision would change if the vertiport operators already ran a site system that collected every pad event for their own audit. Keep the three roles apart: the data are produced by the fire detection system; the decision they serve, which incident causes to correct first and what the insurers’ report shows, is made at the operations center; the deciders are its managers, reading the log. The answer “nothing new, the alarm already carries them” is the misconception: the alarm leaves AeroLink for the emergency services and never reaches the log.` },
      { kind: 'figure', slide: 'w5s1-answer' },
    ],
  },
  {
    id: 'w5-lesson-table',
    title: 'Interface definitions',
    sources: [R('R57', '413'), R('R57', '411'), R('R22', '630')],
    blocks: [
      { kind: 'para', text: 'MITRE’s advice is to describe interfaces with one well-defined framework, one consistent set of attributes: different attribute sets for different interfaces raise the cost of interoperability, so every interface under your control is described in the same way, including how it is used, such as the data flow and the service level, and not only its technical form; and the framework is set up early, during design (R57 p.413). The outputs MITRE names for interface management are interface specifications and interface control documents (R57 p.411). The collection holds no interface control document template, so the course defines its own columns, a course convention:' },
      { kind: 'bullets', items: TABLE_COLUMNS.map((c) => c) },
      { kind: 'para', text: 'Protection and degraded mode are taught in Session 2. Two rules make the rest exact. Direction is read per item from the information view, not guessed from the name: many interfaces carry flows both ways. And no cell stays blank: where no verification case exists yet, the row names the planned method, because every interface is verified during integration (R22 p.630).' },
      { kind: 'figure', slide: 'w5s1-table' },
      { kind: 'table', header: ['Column', 'IF-007 fire alarm to emergency response', 'IF-015 fire detection to operations center'], rows: [
        ['Kind', 'information, external', 'information'],
        ['What crosses', info('INFO-010').name, info('INFO-006').name],
        ['Direction', directionOf(if7), directionOf(if15)],
        ['Medium', if7.medium, if15.medium],
        ['Constraint', if7.constraint, if15.constraint],
        ['Requirements', if7.requirements.join(', '), if15.requirements.join(', ')],
        ['Owners', `${ownerOf('PHY-008')}; ${ownerOf('EXT-006')}`, `${ownerOf('PHY-008')}; ${ownerOf('PHY-004')}`],
        ['Verification', if7.verification.join(', '), `planned: ${if15.verificationPlan}`],
      ], caption: 'Two interface definitions (FICTIONAL; attribute values proposed). Direction is computed from the Week 4 routes.' },
      { kind: 'figure', slide: 'w5s1-worked-definitions' },
      { kind: 'para', text: 'The fire alarm interface crosses the system boundary, so its far side belongs to a public agency AeroLink cannot instruct, only agree with. The incident-record interface crosses an owner boundary inside the enterprise: the vertiport operators own the detectors, AeroLink owns the log. Both need an owner named on each side.' },
    ],
  },
  {
    id: 'w5-lesson-requirements',
    title: 'Interface requirements, and modularity',
    sources: [R('R13', '563'), R('R20c', '599'), R('R20c', '603')],
    blocks: [
      { kind: 'para', text: 'SEBoK, after the INCOSE needs and requirements manual, calls an interface requirement the form of functional requirement that deals with an interaction across an interface boundary with another system, and gives three steps: identify the interface boundaries and the interactions across them; define those interactions, the characteristics of what crosses and the media. Write the interface requirements last. Its example points at the definition: “The System shall send telemetry to the Ground System as defined in ICD 123, Table X” (R13 p.563). The first two steps are your N² cell and your definition row.' },
      { kind: 'table', header: ['Requirement', 'Interface', 'Statement', 'Criterion', 'Parent'], rows: INTERFACE_REQUIREMENTS.map((q) => [`${q.id} ${q.name}`, q.interface, q.statement, q.criterion, q.parents.join(', ')]), caption: 'AeroLink’s interface requirements written this week (FICTIONAL; values proposed). Each passes the Week 2 requirement gates.' },
      { kind: 'figure', slide: 'w5s1-interface-reqs' },
      { kind: 'para', text: `Among the aims of a candidate physical architecture, SEBoK lists a reduction in the number of physical interfaces, elements that can be tested separately, modularity (low interdependence between elements) and resilience (R20c p.599). Its practices table puts modularity as maximum consistency inside an element and a minimum of physical interfaces with the outside, and recommends focusing on interfaces rather than elements at abstract levels (R20c p.603). The N² is the instrument: group elements so that most interfaces fall inside the groups. But fewer interfaces per element elsewhere can mean one element with many: AeroLink’s operations center touches ${c14.degrees['PHY-004']} of the ${c14.total} received interfaces. Modularity and resilience are separate aims, and Session 2 shows them pulling apart.` },
      { kind: 'figure', slide: 'w5s1-modularity' },
    ],
  },
]

export const WEEK5_SESSION1: Lecture = {
  week: 5,
  session: 1,
  title: 'Components / Interfaces',
  subtitle: 'Session 1: Breaking the system down, and the N² chart',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. framing (6 min)
    {
      id: 'w5s1-framing',
      title: 'Framing: what passes between the parts',
      slides: [
        {
          id: 'w5s1-title',
          title: 'Components / Interfaces',
          subtitle: 'Session 1: Breaking the system down, and the N² chart',
          purpose: 'Orient students to the scheduled subject, the two sessions and the four parts the week adds to the Team Record.',
          minutes: 1,
          layout: 'title',
          body: [
            {
              kind: 'bullets',
              items: [
                'Today: components, interfaces, the N² chart, interface definitions',
                'Session 2: managing interfaces, their security and resilience, and the Lab L5 launch',
                'Your Team Record grows: breakdown, N² and interface table, interface requirements, management notes',
              ],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the subject exactly as the schedule gives it: Components, Interfaces. Make the promise: by the end of today you can break your Week 4 physical view into components with stated responsibilities, find every interface between them and with the outside world using an N² chart, read that chart for the hub and the gaps, and write an interface definition another engineer could build to.',
              'Say where the work lands: each team extends its Week 4 Team Record for its own approved enterprise. AeroLink is the worked example; no team models AeroLink.',
            ],
            why: 'Students who see the shape of the week can file each idea as it arrives, and naming the four record parts tells them what they must produce within seven days.',
            examples: [
              'Instructor preparation (not for students): decide before class the open items flagged in the notes of the worked breakdown, the answer to the driving question and the worked definitions (the level-2 components, the interface decision for the incident records, the proposed attribute values). Print the blank N² grid of the worked N² slide as a one-page handout: students fill it there and check it on the next slide.',
              'Timing plan: 69 minutes of content and a 6-minute buffer. If the session runs long, shorten the breakdown-and-WBS slide or the modularity slide; never shorten the worked N², its reading, or the worked definitions.',
            ],
            misconceptions: [{ claim: 'This week is about drawing boxes in more detail.', correction: 'The boxes came in Week 4. This week is mostly about what passes between them: interfaces are where systems fail, where organizations meet and where attackers enter.' }],
            transition: 'First, a gap Week 4 handed over and could not close.',
            timing: '1 min: 30 s subject and promise, 30 s the record parts.',
          },
        },
        {
          id: 'w5s1-driving-question',
          title: 'The driving question: how do the pad incident records reach the evidence log?',
          purpose: 'Create a need to know with the real gap Week 4 handed over, and surface the belief that one alarm path serves every purpose.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-driving-question',
            caption: 'The fire detection system already sends its alarm to the emergency services. The evidence log at the operations center also needs its incident records, and no interface joins the two. (FICTIONAL)',
            alt: 'Left, a box labeled Fire alarm (PHY-008) with a stack of pad incident records beside it. Upper right, a box labeled Emergency response service joined to the fire alarm by a solid line labeled IF-007 alarm. Lower right, a box labeled Ops center holding a document labeled evidence log. Between the fire alarm and the ops center there is no line, only a large question mark.',
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Week 4 finding (FICTIONAL)', text: 'The evidence log must hold every pad incident. The incident records have no route from the fire alarm system.' },
            { kind: 'bullets', items: ['**A** · A new interface, fire alarm to operations center', '**B** · Relay them through the vertiport systems', '**C** · Staff re-enter each incident', '**D** · Nothing new: the alarm interface already carries them'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the finding. Last week the information view traced every item from its producer to the decision it supports. One route had no interface: the pad incident records the fire detection system produces, which the evidence log needs for the auditable record of every flight that the insurers rely on.',
              'Give thirty seconds of silent thought, then take a show of hands for A to D and write the distribution on the board without comment. Ask one student who chose D for a reason: expect “the alarm already leaves the system, so the data are out”. Ask one who chose B.',
              'Do not resolve it. Say: we answer this at the end of today, after we have a method that would have found the gap in the first place, and a way to choose among the answers.',
            ],
            why: 'A prediction made before instruction creates a need to know. Answer D exposes a common misconception: that because data leave a component on one interface, every consumer of those data is served. The withheld answer gives the session one arc.',
            figure: 'Point at the solid line to the emergency services: that interface exists and works. Then at the evidence log inside the operations center, and at the empty space with the question mark. The data exist; the path does not.',
            examples: ['An analogue: a hospital lab sends a critical result to the ward by phone, and the result never reaches the patient’s record, because the phone call was the only interface anyone defined.'],
            misconceptions: [{ claim: 'If data leave a component through one interface, every consumer can get them.', correction: 'Each consumer needs its own path. The alarm goes to the emergency services, outside AeroLink; the evidence log is inside AeroLink and needs a route of its own.' }],
            transition: 'Before we choose, where does this week sit?',
            timing: '3 min: 30 s read, 30 s think, 1 min vote, 1 min two reasons.',
          },
        },
        {
          id: 'w5s1-where',
          title: 'Where Week 5 sits: from the physical view to parts and connections',
          purpose: 'Show what the week takes in from Weeks 2–4 and what it feeds in Weeks 6, 11 and 12.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-where',
            caption: 'Week 5 takes the Week 4 physical view and information routes, and the Week 2 and Week 3 requirements and risks. Its components and interfaces feed the Week 6 roadmap, the Week 11 physical model and the Week 12 verification.',
            alt: 'A flow diagram. On the left, three input boxes: Week 4 physical view and routes, Week 2 requirements, Week 3 risks. Arrows lead to a central highlighted box: Week 5 components and interfaces. From it, a solid arrow to Week 6 evolution roadmap, and dashed arrows to Week 11 physical model and interfaces, and Week 12 verification.',
          },
          body: [
            { kind: 'bullets', items: ['**In**: Week 4 physical view, allocation and information routes', '**In**: Week 2 requirements; Week 3 risks', '**Out**: Week 6 roadmap (what new technology must plug into)', '**Out**: Week 11 parts, ports and connections; Week 12 verification'] },
          ],
          sources: [R('R47', '140')],
          notes: {
            teach: [
              'Week 4 gave you a physical view: which concrete elements implement the functions, and an information view: which item travels from which producer to which consumer. Every route you recorded, and every one you could not, is where this week starts. Week 2 gave the requirements, several of them about exchanges with the outside world; Week 3 gave the risks, and several of them sit on interfaces.',
              'Now the outputs. The DoD guidebook lists what documented interface requirements are for: developing the functional and physical architectures, enabling the integration of systems and lower-level elements, supporting maintenance, future enhancements and upgrades, and providing input to continuous risk management (R47 p.140). That list is this course in miniature: Week 6 plans the upgrades, Week 11 models the physical architecture in SysML v2, Week 12 verifies.',
            ],
            why: 'Students who see the inputs know what to open before they start, and students who see the outputs understand why the interface table must be exact: three later weeks consume it.',
            figure: 'Left to right: the three inputs, the highlighted week, then the solid arrow to Week 6 and the dashed arrows to Phase II. Dashed means a later modeling step, not a dependency inside Phase I.',
            misconceptions: [{ claim: 'Interfaces are a detail to settle during integration.', correction: 'Interface requirements shape the architecture itself and every later upgrade (R47 p.140); left to integration, they become the expensive surprises.' }],
            transition: 'First the parts: what exactly is a component?',
            timing: '2 min: 1 min inputs, 1 min outputs and the DoD list.',
          },
        },
      ],
    },
    // ============================================================================================ B. components (17 min)
    {
      id: 'w5s1-components',
      title: 'Components: the system broken down',
      slides: [
        {
          id: 'w5s1-system-element',
          title: 'System element and component',
          purpose: 'Exact vocabulary: a system element per ISO/IEC/IEEE 15288 and the plain sense of component the schedule uses.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-system-element',
            caption: 'A system element is any discrete part that can be implemented to meet requirements, and it need not be hardware. A component is a system element at the level where it is no longer treated as complex.',
            alt: 'A card titled System element, with a row of eight labeled icons beneath: hardware, software, data, humans, processes, procedures, facilities, materials and naturally occurring entities. Below the card a smaller card titled Component, with an arrow from the system element card labeled at the chosen level of decomposition.',
          },
          body: [
            { kind: 'definition', term: 'System element', text: 'A discrete part of a system that can be implemented to fulfill specified requirements', source: R('R102', '1643') },
            { kind: 'bullets', items: ['Hardware, software, data, humans, processes, procedures, facilities, materials', 'Component: “one of the parts that make up a system”'] },
          ],
          sources: [R('R102', '1643'), R('R101', '1467'), R('R20c', '597')],
          notes: {
            teach: [
              'Start with the standard term. The SEBoK glossary, quoting ISO/IEC/IEEE 15288, defines a system element as a member of a set of elements that constitutes a system: a discrete part that can be implemented to fulfill specified requirements. It can be hardware, software, data, humans, processes, procedures, facilities, materials and naturally occurring entities, or any combination (R102 p.1643). SEBoK’s physical architecture article repeats the same list (R20c p.597).',
              'Then the word the schedule uses. The glossary records three definitions of component; the plain one, from IEEE 829, is “one of the parts that make up a system”. Its discussion adds the systems sense: component is the generic term for the level of decomposition at which system elements are no longer considered complex, and specialist design disciplines take over (R101 p.1467). This week a component is a system element at the level your team chooses: course convention.',
              'Stress the list. Teams of service enterprises often break down only the hardware and forget that their people, their procedures and their data are system elements too.',
            ],
            why: 'Students who think “component” means “hardware part” will omit the people and procedures that carry half of an enterprise’s functions, and with them the organizational interfaces Session 2 manages.',
            figure: 'Read the icon row left to right; pause on humans, procedures and data. Then the arrow down to Component, labeled at the chosen level: the same thing, named for the level at which you stop decomposing.',
            misconceptions: [{ claim: 'A component is a piece of hardware.', correction: 'A component can be software, data, people, a procedure or a facility (R102 p.1643). AeroLink’s certifying technicians are a component.' }],
            transition: 'How far down do we break it, and how wide at each level?',
            timing: '3 min: 1 min system element, 1 min component, 1 min the forgotten kinds.',
          },
        },
        {
          id: 'w5s1-layers',
          title: 'Layers, and five plus or minus two per level',
          purpose: 'Teach the layered structure and the span guideline, with the caution that it is a guideline.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-layers',
            caption: 'A system structured in layers of systems and system elements, a few elements per level. Five plus or minus two is a common guideline, not a rule.',
            alt: 'A three-level tree. At the top, one box labeled system of interest. Level 1 has five boxes; one of them has four children at level 2. A bracket beside level 1 reads 5 ± 2. A note at the side reads a guideline, not a rule.',
          },
          body: [
            { kind: 'bullets', items: ['A complex system is structured in layers of systems and system elements', 'Keep each level to a few elements: about five plus or minus two', 'Stop where an element is no longer complex', 'A guideline: justify a level that breaks it'] },
          ],
          sources: [R('R20c', '597'), R('R101', '1467')],
          notes: {
            teach: [
              'SEBoK: a complex system composed of thousands of physical and intangible parts may be structured in several layers of systems and system elements. The number of elements in one level of the structure is limited to a few, to keep the system definition manageable; a common guideline is five plus or minus two elements (R20c p.597).',
              'Two questions decide the shape. How wide: about five per level, so that one person can hold the level in mind and review its interfaces. How deep: stop when an element is no longer complex, which is the glossary’s own sense of component (R101 p.1467); below that, a discipline designs it.',
              'The caution matters. Five plus or minus two is a guideline, and SEBoK calls it that. A level of eight is not wrong; it is a prompt to ask whether two elements belong together. Your lab tool shows it as an advisory, never as an error.',
            ],
            why: 'Without a span guideline teams produce flat lists of twenty components or one-child chains; with it treated as a rule they force unnatural groupings. Knowing both the guideline and its status produces breakdowns a reviewer can read.',
            figure: 'Count level 1 aloud: five. Point at the one box with children: only elements that are still complex are broken down. Then the note: a guideline, not a rule.',
            misconceptions: [{ claim: 'Every element must be decomposed to the same depth.', correction: 'Decompose an element only while it is still complex. A purchased booking app may stop at level 1 while the aircraft goes two levels down.' }],
            transition: 'A breakdown of the system is not the same as a breakdown of the work.',
            timing: '3 min: 1 min layers and span, 1 min depth, 1 min the caution.',
          },
        },
        {
          id: 'w5s1-breakdown-wbs',
          title: 'System breakdown structure and work breakdown structure',
          purpose: 'Distinguish the component breakdown (what the system is) from the work breakdown (the work to build it).',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-breakdown-wbs',
            caption: 'The system breakdown says what the system is made of; the work breakdown says what work delivers it. Each work element produces one or more system elements.',
            alt: 'Two trees side by side. Left tree titled system breakdown: service, with children aircraft, vertiports and operations center. Right tree titled work breakdown: program, with children aircraft acquisition, vertiport construction and operations software development. Dotted lines join aircraft to aircraft acquisition, vertiports to vertiport construction and operations center to operations software development.',
          },
          body: [
            { kind: 'bullets', items: ['**System breakdown**: a hierarchy of elements used to assign teams, conduct reviews and partition work', '**Work breakdown**: a product-oriented decomposition of the work and deliverables', 'Work elements are outcomes, not actions; they do not overlap'] },
          ],
          sources: [R('R103', '1640'), R('R104', '104')],
          notes: {
            teach: [
              'The SEBoK glossary, after IEEE 1220, defines a system breakdown structure as a hierarchy of elements, related life-cycle processes and personnel, used to assign development teams, conduct technical reviews and partition the work and its resources (R103 p.1640). That is the component breakdown you build this week, plus the teams that own each part.',
              'The DoD guidebook defines the work breakdown structure: the decomposition of the scope of work into product-oriented elements needed to develop the deliverables, for authorizing, tracking and reporting. Its elements should not overlap, a WBS dictionary clarifies them, and they are defined in terms of outcomes, not actions (R104 p.104).',
              'The distinction to draw on the board: the system breakdown describes the system; the work breakdown describes the work to build it. They map onto each other, often one to one at the top, but they are different documents with different owners: engineering and program management.',
            ],
            why: 'Teams that mix the two write components like “design the app” or “testing”: work, not parts of the system. Naming the difference prevents that error in the lab.',
            figure: 'Left tree, then right tree, then the dotted lines. Ask: where is “integration testing” in the left tree? Nowhere: it is work, so it belongs only on the right.',
            examples: ['Source gap: MIL-STD-881, which the guidebook names for WBS requirements, is not in the course collection; the guidebook page is the course definition.'],
            misconceptions: [{ claim: 'The component breakdown and the work breakdown are the same tree.', correction: 'One describes the system, the other the work to deliver it. “Software testing” is a work element; it is not a component.' }],
            transition: 'Week 4 had two kinds of element, logical and physical. Which one do we break down?',
            timing: '3 min: 1 min system breakdown, 1 min work breakdown, 1 min the contrast.',
          },
        },
        {
          id: 'w5s1-logical-physical',
          title: 'Logical and physical: which elements we break down',
          purpose: 'Locate components in the physical architecture and connect them to the Week 4 allocation.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-logical-physical',
            caption: 'One logical element, Fleet Management, is implemented by two physical elements, the chargers and the operations center. Components refine the physical elements. (FICTIONAL)',
            alt: 'Two horizontal planes. Upper plane labeled logical holds one box, LOG-002 Fleet Management. Lower plane labeled physical holds two boxes, PHY-003 Charging Systems and PHY-004 Operations Center, each joined to LOG-002 by a downward arrow labeled allocated to. Under PHY-003 three small boxes hang: turnaround chargers, standard chargers and power controller.',
          },
          body: [
            { kind: 'bullets', items: ['Logical items: allocated functions and interfaces, no specific implementation', 'Physical items: a specific implementation of each logical element', 'Components refine the **physical** elements', 'Interfaces join physical elements, components and external elements'] },
          ],
          sources: [R('R19', '571'), R('R20c', '597')],
          notes: {
            teach: [
              'SEBoK’s architecture article: logical configuration items carry allocated functions, interfaces and performance requirements without a specific design implementation; physical configuration items provide a specific implementation for each logical element. It adds that system element interactions define how the functions operate together through interfaces (R19 p.571).',
              'A physical architecture is built from system elements, the physical interfaces between them, and external elements, the neighboring and enabling systems around the system of interest (R20c p.597). That sentence is the plan of today: elements, interfaces between them, and interfaces to the outside.',
            ],
            why: 'Students who break down logical elements produce a second functional view; breaking down the physical elements keeps the work connected to the Week 4 allocation and to real owners.',
            figure: 'Top plane, one logical element; bottom plane, the two physical elements it is allocated to, exactly as in Week 4. Then the three small boxes under the chargers: the components this week adds.',
            misconceptions: [{ claim: 'Components are a third architecture beside logical and physical.', correction: 'Components are the physical elements broken down one level further. The allocation from Week 4 still holds; each component carries part of its parent’s functions.' }],
            transition: 'Here is AeroLink’s breakdown.',
            timing: '2 min: 1 min logical and physical, 1 min what a physical architecture holds.',
          },
        },
        {
          id: 'w5s1-worked-breakdown',
          title: 'Worked example I: AeroLink’s component breakdown',
          purpose: 'Apply the breakdown once: eight physical elements at level 1, components only where an element is still complex, each refining its parent’s allocation.',
          minutes: 4,
          layout: 'worked-example',
          figure: {
            id: 'w5s1-worked-breakdown',
            caption: `AeroLink’s breakdown: ${COUNTS.level1} physical elements at level 1; ${COUNTS.level2} level-2 components under the ${COUNTS.brokenDown.length} elements that are still complex. Counts from the Week 3 decision. (FICTIONAL; level 2 proposed)`,
            alt: `A two-level tree under AeroLink service. Level 1: ${COUNTS.level1} boxes from PHY-001 eVTOL Aircraft (${COUNTS.aircraft} aircraft) to PHY-008 Pad fire detection, with counts: vertiports ${COUNTS.vertiports} including ${COUNTS.hubs} hubs, chargers ${COUNTS.chargers}. Level 2 boxes hang under aircraft, vertiports, chargers, operations center and maintenance: ${COMPONENTS.map((c) => c.name).join('; ')}. The communications network, the booking platform and the fire detection system have no children.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Start', text: 'from the Week 4 physical elements: level 1' },
                { label: 'Ask', text: 'is this element still complex? If not, stop' },
                { label: 'Split', text: 'into a few components of any kind' },
                { label: 'Check', text: 'each component carries some of its parent’s functions' },
              ],
            },
          ],
          sources: [R('R20c', '597'), R('R101', '1467')],
          notes: {
            teach: [
              `Before you advance to this slide, write the ${COUNTS.level1} Week 4 physical elements on the board and ask pairs, in one minute: which of these would you break down, and which not? Take two answers, then advance: the slide is the reveal.`,
              `Read the counts the configuration carries, all computed from the Week 3 decision: ${COUNTS.aircraft} aircraft, ${COUNTS.vertiports} vertiports of which ${COUNTS.hubs} are hubs, ${COUNTS.chargers} chargers.`,
              'Then the check that makes a breakdown engineering rather than drawing: every component must carry some of its parent’s allocated functions, and every function of the parent must land on some component.',
            ],
            workedSolution: [
              `Step 1, start. Level 1 is the Week 4 physical view, ${COUNTS.level1} elements, above five plus or minus two; we keep it, because grouping the booking platform with the operations center would hide an owner and a trust boundary we need in Session 2. That is the kind of justification the guideline asks for.`,
              `Step 2, ask. ${COUNTS.brokenDown.length} elements are still complex: ${list(COUNTS.brokenDown.map((id) => elementName(id).toLowerCase()))}. The communications network is a medium with no function of its own; the booking platform and the fire detection system each do one thing, and breaking them into a single child would only rename them.`,
              `Step 3, split. For example, the chargers become ${list(componentsOf('PHY-003').map((c) => c.name.toLowerCase()))}. Notice the kinds across the tree: hardware, software, a facility, and people, such as the certifying technicians and the duty managers.`,
              `Step 4, check. The chargers’ functions in Week 4 are ${list(phy3Functions)}; the turnaround and standard chargers carry ${componentsOf('PHY-003')[0].functions.join(', ')}, the power controller carries ${componentsOf('PHY-003')[2].functions.join(', ')}. The case test checks this for every component, so the breakdown can never contradict the allocation.`,
            ],
            why: 'Students see that the decision is where to stop and why, and that a breakdown is checked against the allocation, not drawn freehand.',
            figure: 'Walk level 1 left to right with the counts, then the five subtrees. Point at the three leaves with no children and say why each stops.',
            examples: ['Instructor decision: the level-2 components are proposed for the reference; confirm or adjust them before the lab opens.'],
            misconceptions: [{ claim: 'A good breakdown breaks every element down.', correction: 'A good breakdown stops each branch where the element is no longer complex. A single-child split is a rename, not a breakdown.' }],
            transition: 'Each element and component then gets a card that says what it is responsible for.',
            timing: '4 min: 1 min pairs, 1 min reveal and counts, 1 min the stopping rule, 1 min the check.',
          },
        },
        {
          id: 'w5s1-cards',
          title: 'Responsibility cards: one per element',
          purpose: 'State the course card and fill it once, so every component is checkable against functions, requirements, owner and interfaces.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-cards',
            caption: 'The responsibility card for the charging systems: what it is responsible for, the functions and requirements it carries, who owns it and which interfaces it has. (FICTIONAL)',
            alt: `A filled card titled PHY-003 Charging Systems. Responsibility: charge aircraft within the turnaround and keep each vertiport within its power limit. Functions: ${list(phy3Functions)}. Requirements: REQ-SYS-001, REQ-SYS-010. Owner: ${ownerOf('PHY-003')}. Interfaces: IF-005, IF-006, IF-010.`,
          },
          body: [
            { kind: 'callout', tone: 'key', title: 'Course card', text: 'Responsibility · functions · requirements · owner · interfaces' },
            { kind: 'bullets', items: ['The owner manages the element’s side of every interface', 'An element with no responsibility is a candidate for deletion'] },
          ],
          sources: [R('R47', '139')],
          notes: {
            teach: [
              'The card is a course convention. It states the element’s responsibility in a sentence, the functions allocated to it in Week 4, the requirements those functions carry, the organization that owns it, and the interfaces it has. The last field is empty until the N² chart, which is the point: the card is finished only when the interfaces are known.',
              `Fill it once for the charging systems: functions ${list(phy3Functions)}; requirements REQ-SYS-001 and REQ-SYS-010; owner ${ownerOf('PHY-003').toLowerCase()}; interfaces IF-005 to the aircraft, IF-006 to the grid, IF-010 to the operations center.`,
              'Why the owner: the DoD guidebook says interface management must consider roles and responsibilities, funding and scheduling as well as the technical side (R47 p.139). Each side of an interface is managed by the owner of the element on that side.',
            ],
            why: 'The card forces the team to say what each component is for and who answers for it. Without an owner per element, nobody manages its side of each interface.',
            figure: 'Read the card top to bottom; stop at the owner field and at the interfaces field, which we fill from the N² chart in a moment.',
            misconceptions: [{ claim: 'The owner of an element is whoever built it.', correction: 'The owner is the organization that operates and answers for it now: the vertiport operators own the chargers even if a supplier built them.' }],
            transition: 'Now the subject of most of the week: the interfaces themselves.',
            timing: '2 min: 1 min the fields, 1 min the owner.',
          },
        },
      ],
    },
    // ============================================================================================ C. interfaces and the N² (28 min)
    {
      id: 'w5s1-interfaces',
      title: 'Interfaces and the N² chart',
      slides: [
        {
          id: 'w5s1-interface',
          title: 'What an interface is',
          purpose: 'Define interface from the glossary, SEBoK and MITRE, including procedures and documents.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-interface',
            caption: 'Three interfaces: a plug and an outlet, a procedure document, a data message. Each is a shared boundary between two units.',
            alt: 'Three panels, each with two boxes and something between them. Left: a plug meeting an outlet. Middle: a document labeled procedure between two people icons. Right: an envelope labeled message between two computer icons. A caption bar across all three reads interface: a shared boundary between two units.',
          },
          body: [
            { kind: 'definition', term: 'Interface', text: 'A shared boundary between two functional units, defined by various characteristics pertaining to the functions, physical signal exchanges, and other characteristics', source: R('R100', '1541') },
            { kind: 'bullets', items: ['Binds two system elements, like a link or a connector', 'In services and enterprises: protocols, procedures, documents'] },
          ],
          sources: [R('R100', '1541'), R('R20c', '597'), R('R57', '410'), R('R57', '411')],
          notes: {
            teach: [
              'The SEBoK glossary’s first definition, from ISO/IEC 2382-1: a shared boundary between two functional units, defined by various characteristics pertaining to the functions, physical signal exchanges and other characteristics (R100 p.1541). Two words carry it: shared, so there are always two sides; boundary, so it sits between elements, not inside one.',
              'SEBoK’s physical architecture article: a physical interface binds two system elements together, similar to a link or a connector; its table gives hardware parts, protocols, procedures and documents as interfaces for product, service and enterprise systems (R20c p.597). For an enterprise, a procedure is an interface.',
              'MITRE frames the management side: interface management includes defining, controlling and communicating the information needed for unrelated objects to co-function, and it begins at design and continues through operations (R57 p.410). Interfaces are the functional and physical connections at system boundaries, and there are many types (R57 p.411). MITRE’s own example of an interface is a plug and an outlet.',
            ],
            why: 'An exact definition gives the lab its first gate: an interface has two ends. It also licenses the enterprise case, where many interfaces are agreements and procedures rather than wires.',
            figure: 'Left to right: the plug and outlet, MITRE’s example; the procedure between two people; the message between two machines. The bar underneath is the one definition that covers all three.',
            misconceptions: [{ claim: 'An interface is a cable or a connector.', correction: 'It is any shared boundary between two units. In an enterprise, a procedure or an agreement between two organizations is an interface (R20c p.597).' }],
            transition: 'Interfaces are not all alike. The course types them so each kind is verified and managed properly.',
            timing: '3 min: 1 min glossary, 1 min SEBoK, 1 min MITRE.',
          },
        },
        {
          id: 'w5s1-typing',
          title: 'Typing interfaces: physical, information, organizational; external flagged',
          purpose: 'State the course typing honestly as a convention and give one AeroLink example of each kind.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-typing',
            caption: 'The course’s three kinds, each with one AeroLink interface. External is a flag on any kind: the grid connection is physical and external. (FICTIONAL)',
            alt: 'Three columns. Physical: energy, material or load, example IF-005 charger power to the aircraft. Information: data over a named medium, example IF-008 booking messages. Organizational: an agreement that carries no flow, example IF-009 pad-slot agreement. Beneath, a band labeled external flag with IF-006 grid connection, drawn crossing a dashed system boundary.',
          },
          body: [
            { kind: 'table', header: ['Kind', 'What crosses'], rows: INTERFACE_KINDS.map((k) => [k.label, k.crosses]) },
            { kind: 'bullets', items: ['**External**: one end outside the system of interest (a flag, any kind)'] },
          ],
          sources: [R('R20c', '597')],
          notes: {
            teach: [
              'The typing is a course convention, and say so plainly: SEBoK and MITRE do not use these three kinds; in SEBoK’s binding sense all of them are physical interfaces (R20c p.597). The course types them because each kind is verified and managed differently.',
              'Physical: energy, material or mechanical load crosses; you verify it by measurement or test, the charging power from charger to aircraft. Information: data cross, over a named medium; you verify content, timing and protection, the booking messages between the booking platform and the operations center. Organizational: an agreement, procedure or responsibility between owners; nothing flows across it, and you verify it by inspection and audit, the pad-slot agreement between the vertiport operators and AeroLink.',
              'External is not a fourth kind but a flag: an interface with one end outside the system of interest. The grid connection is physical and external. External interfaces need the other party’s agreement to change, which is why the next slide treats them on their own.',
            ],
            why: 'Typing tells the team how each interface will be verified and who must agree to change it. An untyped list of connections cannot be planned for integration.',
            figure: 'Three columns, one example each; then the band underneath, where the grid connection crosses the dashed system boundary: physical, and external.',
            misconceptions: [{ claim: 'An organizational agreement can carry the data between two parties.', correction: 'An agreement records duties; the data need an information interface of their own. The course coverage rule from Week 4: an organizational interface carries no flow.' }],
            transition: 'External interfaces have a trap: some of them hide inside the system.',
            timing: '3 min: 30 s the honesty note, 2 min the three kinds, 30 s the external flag.',
          },
        },
        {
          id: 'w5s1-external-hidden',
          title: 'External and hidden external interfaces',
          purpose: 'Require every external interface and teach the hidden external interface over a medium the system does not own.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-external-hidden',
            caption: 'Two internal elements that talk over a network the system does not own have an internal interface (the data) and a hidden external one (the network).',
            alt: 'Two boxes inside a dashed system boundary, labeled element A and element B. A line from each runs out through the boundary into a cloud outside labeled leased network, not ours. A red tag on the cloud reads hidden external interface. Inside the boundary, a dotted line between A and B is labeled internal interface: the data.',
          },
          body: [
            { kind: 'bullets', items: ['Include every external interface; major internal ones too', 'Internal elements talking over a medium you do not own, or over radio: a hidden external interface', 'The medium column is how you find them'] },
          ],
          sources: [R('R54', '331'), R('R55', '369')],
          notes: {
            teach: [
              'MITRE’s requirements article: requirements must capture all interactions with external systems and the external environment so that boundaries are clear. Hidden external interfaces arise when internal subsystem-to-subsystem communications use an external medium, such as radio, a satellite relay or an external network (R54 p.331).',
              'Its checklist for system-level requirements: all external interfaces are included, and major internal interfaces too if they matter for modularity or growth. An internal interface between two subsystems over a transport that is not part of the system is a hidden external interface: the data exchanged are the internal interface, the network and its protocols are an external one (R55 p.369).',
              `AeroLink has a live case. ${HIDDEN_EXTERNAL.length} of its information interfaces run over the communications network; Week 4 left open whether every segment is AeroLink’s own. If any segment is leased, those interfaces have a hidden external part, with an owner outside AeroLink who can change it. Two of them, ${list(RADIO_INTERFACES)}, run over the air-ground radio datalink: MITRE’s own example is radios connecting subsystems over the airwaves (R54 p.331), so they are hidden external interfaces whatever the leasing decision.`,
            ],
            why: 'Hidden external interfaces are where performance and security assumptions break: the team believes it controls a path that someone else operates. Naming the medium of every interface is the only way to find them.',
            figure: 'Inside the boundary, the dotted internal interface; then follow both lines out through the boundary into the cloud. The red tag is MITRE’s term. Ask: who can change the cloud?',
            misconceptions: [{ claim: 'If both ends are ours, the interface is internal.', correction: 'If the medium between them is someone else’s, part of the interface is external and someone else can change or break it (R55 p.369).' }],
            transition: 'How do we find all the interfaces, internal and external, without missing any? The N² chart.',
            timing: '3 min: 1 min external, 1 min hidden, 1 min AeroLink.',
          },
        },
        {
          id: 'w5s1-n2',
          title: 'The N² chart: how it is built',
          purpose: 'State the source and the course conventions of the N² chart and the arithmetic check.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-n2',
            caption: 'A five-element teaching N²: elements on the diagonal, each interface written once above it. An inset shows the directed form, where the row produces and the column consumes.',
            alt: 'A five-by-five grid with elements A to E on the diagonal. One upper-triangle cell, in row A and column C, holds the label IF-1. The cells below the diagonal are shaded and marked mirror. An inset at the right shows a two-by-two directed grid with an arrow from row to column labeled row produces, column consumes.',
          },
          body: [
            { kind: 'bullets', items: ['Elements on the diagonal: yours and the external ones', 'Each cell: the interfaces joining that pair, written once above the diagonal (course convention)', 'Directed form: the row produces, the column consumes (course convention)', '**Check**: the degrees sum to twice the number of interfaces'] },
          ],
          sources: [R('R22', '630'), R('R22', '631')],
          notes: {
            teach: [
              'Source first. SEBoK’s system integration article names the N-squared diagram, after Grady, as one of the most basic methods for defining the integration aggregates and their order (R22 p.630). The integration strategy is optimized by reorganizing the coupling matrix to group elements into aggregates so that the interfaces to verify between aggregates are minimized, and the matrix helps locate faults (R22 p.631).',
              'Now the conventions, which are the course’s: the collection does not state them, and Grady’s book is not in it. Put every element on the diagonal, your own and the external ones. In the interface N², each off-diagonal cell lists the interfaces joining that pair, written once above the diagonal, because an interface is shared; the lower triangle is its mirror. In the directed N², used for information, the row element produces and the column element consumes, so a cell says what flows from the row to the column.',
              'Then the check. Each interface has two ends, so if you count, for every element, how many interfaces touch it, its degree, the degrees sum to exactly twice the number of interfaces. If they do not, you have a one-ended interface or a miscount.',
            ],
            why: 'A systematic grid makes omission visible: every pair of elements gets a cell, so an empty row is a question you must answer, not an oversight nobody sees.',
            figure: 'Trace the diagonal, then the one filled cell above it, then the shaded mirror below. Point at the inset: in the directed form direction matters, row to column.',
            misconceptions: [{ claim: 'The N² chart is a diagram of the architecture.', correction: 'It is a matrix that forces the question “does anything pass between these two?” for every pair. Its value is the empty cells you must justify.' }],
            transition: 'Now AeroLink, worked in full: the fourteen interfaces Week 4 handed over.',
            timing: '4 min: 1 min source, 2 min conventions, 1 min the check.',
          },
        },
        {
          id: 'w5s1-worked-n2',
          title: 'Worked example II: AeroLink’s N² from the fourteen interfaces',
          purpose: 'Build the N² of the received interface set in full; students count the degrees before the next slide reveals them.',
          minutes: 6,
          layout: 'worked-example',
          figure: {
            id: 'w5s1-worked-n2',
            caption: `The N² of the ${c14.total} interfaces received from Week 4 over ${DIAGONAL.length} elements, each cell colored by kind. The degree column is left for you to fill. (FICTIONAL)`,
            alt: `An upper-triangle matrix with fifteen elements on the diagonal: PHY-001 to PHY-008 and EXT-001 to EXT-007, each with a short name. Filled cells: ${c14.total} interface labels colored physical, information or organizational. The ops center row holds the most labels. A degree column at the right is empty, with a question mark in each row.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Diagonal', text: 'the 8 physical and 7 external elements' },
                { label: 'Place', text: 'each interface in the cell of its two ends' },
                { label: 'Type', text: 'color each cell by kind; mark external' },
                { label: 'Count', text: 'each element’s degree; check the sum' },
              ],
            },
          ],
          sources: [R('R22', '630'), R('R22', '631')],
          notes: {
            teach: [
              'Before you advance to this slide, hand out the printed blank grid with the Week 4 interface list. Fill the first three cells with the class: IF-001 aircraft and pad in the PHY-001, PHY-002 cell; IF-002 aircraft and operations center; IF-005 aircraft and chargers. Pairs place the rest in three minutes; then advance, and they check their placements against the slide.',
              'After the pairs have placed the interfaces and checked them against this slide, ask each pair to count the degree of every element and add them up. Do not show the degrees on this slide; the next slide reveals them.',
            ],
            workedSolution: [
              `Step 1, diagonal. The ${COUNTS.level1} physical elements, then the external elements of the Week 4 view: Week 1’s six and the weather information service Week 4 added. ${c14.isolated.length} of the ${Object.keys(c14.degrees).length} elements will turn out to have no interface at all; keeping them on the diagonal is what lets the chart show it.`,
              `Step 2, place. Each interface goes in the cell of its two ends, above the diagonal. The operations center row and column are the busiest: IF-002, IF-003, IF-004, IF-008, IF-009, IF-010, IF-011, IF-012 and IF-014. Two cells hold two interfaces each: vertiports and operations center (IF-009 and IF-014), and operations center and maintenance (IF-004 and IF-012): an agreement and a data path between the same pair.`,
              `Step 3, type. ${c14.physical} physical, ${c14.information} information, ${c14.organizational} organizational; ${c14.external.length} external: ${list(c14.external)}.`,
              `Step 4, count. The degrees sum to ${c14.degreeSum}, which is twice ${c14.total}: the check passes. ${c14.pairs} of the ${c14.possiblePairs} possible pairs are joined.`,
            ],
            why: 'Building the chart once by hand, from a list, teaches the mechanics and shows why the paired cells and the empty rows matter. The degrees are left for the students so the next slide is their check, not a lecture.',
            figure: 'Walk the diagonal, then the operations center row and column, then the two double cells. Point at the empty degree column: that is the class’s job.',
            misconceptions: [{ claim: 'Two interfaces between the same pair is a duplicate.', correction: 'An agreement and a data path between the same two elements are different interfaces, of different kinds, verified differently. IF-004 records the work-order procedure; IF-012 carries the status.' }],
            transition: 'What did you get? And what does the chart tell us?',
            timing: '6 min: 1 min the first three cells, 3 min pairs place (slide not yet shown), 1 min check against the slide and count, 1 min walk the result.',
          },
        },
        {
          id: 'w5s1-reading-n2',
          title: 'Reading the N²: the hub, the empty rows, the sum',
          purpose: 'Reveal the degrees and read the chart for concentration and for gaps.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-reading-n2',
            caption: `Degrees revealed: the operations center touches ${deg('PHY-004')} of the ${c14.total} interfaces. ${c14.isolated.length} rows are empty: the network (it is the medium), weather, the spares supply and public transport. Sum ${c14.degreeSum} = 2 × ${c14.total}. (FICTIONAL)`,
            alt: `The AeroLink N² from the previous slide with a filled degree column: ${Object.entries(c14.degrees).map(([k, v]) => `${k} ${v}`).join(', ')}. The PHY-004 row is highlighted as the hub. The rows of ${list(c14.isolated)} are outlined in red as empty. A total at the foot reads ${c14.degreeSum} = 2 × ${c14.total}.`,
          },
          body: [
            { kind: 'bullets', items: [`**Hub**: the operations center, degree ${deg('PHY-004')}`, '**Empty rows**: each needs an interface or a recorded reason', `**Sum**: ${c14.degreeSum} = 2 × ${c14.total}`] },
          ],
          sources: [R('R55', '369'), R('R20c', '603')],
          notes: {
            teach: [
              `Reveal the degrees and ask who matched. The hub: the operations center touches ${deg('PHY-004')} of the ${c14.total} interfaces. That concentration is a design choice from Week 4, one platform for the whole network; Session 2 asks what it costs in resilience. SEBoK’s good practice is to focus on interfaces rather than elements at abstract levels (R20c p.603): the hub is where to focus first.`,
              `The empty rows. The communications network has degree zero because it is the medium of ${HIDDEN_EXTERNAL.length} interfaces, not an end of any; that is correct. Weather has none because it is a natural system: its information comes from the weather service. That leaves two empty rows that need an answer: the aircraft and spares supply, from which the Week 2 maintenance scenario orders parts, and the public transport network, on which a Week 2 assumption relies during disruptions.`,
              'MITRE’s rule is that all external interfaces are included (R55 p.369). So every empty external row needs an interface, or a recorded reason why none exists. We close those two at the end of the week’s audit; note them now.',
            ],
            why: 'Reading the chart is the skill, not drawing it. The hub tells you where failure and attack concentrate; the empty rows tell you what was forgotten.',
            figure: 'Point at the degree column and the total first, then the highlighted hub row, then the four outlined empty rows one at a time, with the reason for each.',
            misconceptions: [{ claim: 'An element with no interfaces is simply outside the design.', correction: 'If it is on the diagonal, something brought it there. Either it exchanges something, and the interface is missing, or you record why it does not.' }],
            transition: 'The chart is only as good as the list behind it. How do we know the list is complete?',
            timing: '3 min: 1 min hub, 1.5 min empty rows, 30 s the rule.',
          },
        },
        {
          id: 'w5s1-crossing',
          title: 'Functional flows across the physical boundary',
          purpose: 'Apply the Week 4 coverage rule: every function flow between elements must ride an information interface.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-crossing',
            caption: 'Overlay the allocation on the N²: a flow between functions on two different elements needs an interface of the matching kind. The go / no-go status rides IF-012; the incident records had nothing to ride. (FICTIONAL)',
            alt: 'Three element boxes: maintenance with FN-008 inside, operations center with FN-011 and FN-016 inside, and fire alarm with FN-010 inside. A solid arrow from FN-008 to FN-011 is labeled go / no-go status over IF-012. A dashed red arrow from FN-010 to FN-016 is labeled incident records, no interface in Week 4.',
          },
          body: [
            { kind: 'bullets', items: ['A flow whose two functions sit on different elements is a **crossing flow**', 'Each crossing flow rides an information interface, or a recorded relay', `AeroLink: ${flows.length} crossing flows, computed from the Week 4 functions`] },
          ],
          sources: [R('R22', '630')],
          notes: {
            teach: [
              'The N² lists interfaces; it cannot tell you that one is missing. For that you overlay the Week 4 allocation. A flow from one function to another whose two functions sit on different physical elements is a crossing flow, and it needs an interface of the matching kind: information on an information interface, energy on a physical one. That is the course coverage rule you met in Week 4.',
              `AeroLink has ${flows.length} crossing flows, computed from the functions’ inputs and outputs, not from the interface list. One of them is the go / no-go status: produced by the aircraft health function at maintenance, consumed by dispatch at the operations center; it rides IF-012. In Week 4’s first reference version it had only the work-order procedure, an organizational interface, which carries no flow; that gap was found exactly this way.`,
              'SEBoK’s integration checklist says every interface and interaction between implemented elements is verified (R22 p.630). A flow with no interface has nothing to verify, so it would pass integration unnoticed and fail in service.',
            ],
            why: 'This check is what makes the interface list complete rather than plausible. It ties the N² to the functions, so a missing interface shows up as an uncovered flow.',
            figure: 'Solid arrow first: function to function across a boundary, riding IF-012. Then the dashed red arrow from the fire alarm’s function to the evidence log: the same check finds today’s driving question.',
            misconceptions: [{ claim: 'If the N² looks full, the interface list is complete.', correction: 'Only the crossing-flow check can show a missing interface: it starts from the functions, not from the interfaces you already listed.' }],
            transition: 'So: the driving question. Which answer?',
            timing: '3 min: 1 min the rule, 1.5 min the AeroLink flow, 30 s the source.',
          },
        },
        {
          id: 'w5s1-answer',
          title: 'Answering the driving question: a new interface, chosen with reasons',
          purpose: 'Resolve the driving question with an interface decision record: alternatives, choice, rationale, what would change it.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-answer',
            caption: 'The decision: a one-way information interface from the fire detection system to the operations center (IF-015). A relay also adds one new interface, but its path has two hops and depends on another system; re-entry loses records. (FICTIONAL; proposed)',
            alt: 'The scene from the driving question, now with a solid arrow from Fire alarm (PHY-008) to Ops center labeled IF-015 incident records, one way. Below, three small option cards: direct, one new interface, chosen; relay through vertiport systems, one new interface and a path of two; staff re-entry, no interface but records lost, struck through.',
          },
          body: [
            { kind: 'bullets', items: ['**A** chosen: one new interface, one way, over the ground network', '**B** relay: one new interface too, but a path of two and a second system', '**C** re-entry: a manual procedure that loses records', '**D** wrong: the alarm goes outside AeroLink'] },
          ],
          sources: [R('R20c', '599')],
          notes: {
            teach: [
              `Answer D first, because it is the misconception: the alarm interface ends at the emergency services, outside AeroLink; the evidence log is inside the operations center. ${info(DRIVING_QUESTION.info).name}, the item Week 4 created for the auditable record, needs its own route.`,
              `Then the decision, recorded as Week 4 taught: ${INTERFACE_DECISION.rationale}`,
              'Count before you argue: the direct path and the relay each add one new interface, so the N² ends the same size either way and the count does not decide. The relay’s cost is its path: two hops, a second system and a second owner’s availability between the record and the log, INFO-006 added to IF-014, and store-and-forward duty for the vertiport systems. What would change the decision: the vertiport operators already running a site system that collects every pad event for their own audit; then the relay reuses an interface they must keep anyway.',
              `Keep data, decision and decider apart: the data are produced at the fire detection system; the decision they support is made at the ${ops}; the decider is its management, reading the log.`,
            ],
            why: 'The class sees a gap closed the way an architect closes it: with alternatives, a reason grounded in a stated aim, and the condition that would reverse it.',
            figure: 'Point at the new arrow and its label: one way. Then the three cards: chosen, costed, struck through. Ask why one way matters; answer in Session 2.',
            examples: ['Instructor decision: IF-015 is proposed for the reference; confirm the choice or the relay before the lab opens.'],
            misconceptions: [{ claim: 'Adding an interface is always the safe fix.', correction: 'Every interface must be defined, verified, protected and kept up. Choose the path with the fewest interfaces that meets the need, and record why.' }],
            transition: 'We have the interfaces. Now we must say exactly what each one is.',
            timing: '3 min: 30 s answer D, 1.5 min the decision, 1 min aims and what would change it.',
          },
        },
      ],
    },
    // ============================================================================================ D. definitions (18 min)
    {
      id: 'w5s1-definitions',
      title: 'Interface definitions and requirements',
      slides: [
        {
          id: 'w5s1-table',
          title: 'The interface definition table',
          purpose: 'Give the course columns, grounded in MITRE’s consistent attribute set, and launch a paired exercise on one row.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-table',
            caption: 'The course interface table, one row per interface. For the exercise, only the identity and ends of the fire alarm interface are filled in.',
            alt: `A header strip with ${TABLE_COLUMNS.length} columns: ${TABLE_COLUMNS.join(', ')}. One row below it: IF-007, fire alarm to emergency response service, information, external, ends PHY-008 and EXT-006. Every other cell of the row is blank.`,
          },
          body: [
            { kind: 'bullets', items: ['Describe every interface with the **same** attributes', 'Include how it is used, not only its technical form', 'Course columns: what crosses, direction, medium, constraint, owners, verification', 'Pairs: complete the fire alarm row'] },
          ],
          sources: [R('R57', '413'), R('R57', '411')],
          notes: {
            teach: [
              'MITRE: use a well-defined framework to describe the interfaces. Different attribute sets for different interfaces raise the cost of interoperability; describe every interface under your control in a consistent way, and include the attributes of using it, such as the business process or data flow and the service level, not only its technical aspects. Establish the framework early, during design (R57 p.413). MITRE also names the outputs of interface management: interface specifications and interface control documents (R57 p.411).',
              `The course columns are a course convention, because no interface control document template is held in the collection: ${TABLE_COLUMNS.join(', ')}. The last two, protection and degraded mode, are taught in Session 2; today we fill the first nine.`,
              'Exercise, three minutes in pairs: complete the fire alarm row from what you know. What crosses, which way, over what, under which constraint and which requirement, who owns each side, and how it is verified. The next slide shows the reference row.',
            ],
            why: 'One attribute set for every interface is what lets a reviewer, a supplier and a tester read the table the same way. Filling one row before seeing the answer makes the columns concrete.',
            figure: 'Read the header strip left to right. Then the single row: only the ID, name, kind and ends are given. Everything else is the pairs’ job.',
            misconceptions: [{ claim: 'An interface is defined once its two ends are named.', correction: 'The ends say where it is, not what it is. Without what crosses, the direction, the medium, the constraint and the owners, nobody can build or verify either side.' }],
            transition: 'Here is the reference row, and the new interface beside it.',
            timing: '4 min: 1 min MITRE, 30 s the columns, 2.5 min pairs fill the row.',
          },
        },
        {
          id: 'w5s1-worked-definitions',
          title: 'Worked example III: defining the fire alarm and incident-record interfaces',
          purpose: 'Reveal two complete definitions, one received and external, one new and internal, with every attribute justified.',
          minutes: 5,
          layout: 'worked-example',
          figure: {
            id: 'w5s1-worked-definitions',
            caption: 'Two completed rows: the external fire alarm interface and the new incident-record interface. Direction is computed from the Week 4 routes. (FICTIONAL; attribute values proposed)',
            alt: `Two filled definition cards side by side. IF-007: information, external; ${directionOf(if7)}; medium: ${if7.medium}; constraint: ${if7.constraint}; requirement ${if7.requirements.join(', ')}; owners ${ownerOf('PHY-008')} and ${ownerOf('EXT-006')}; verification ${if7.verification.join(', ')}. IF-015: information; ${directionOf(if15)}; medium: ${if15.medium}; constraint: ${if15.constraint}; requirements ${if15.requirements.join(', ')}; owners ${ownerOf('PHY-008')} and ${ownerOf('PHY-004')}; verification planned: ${if15.verificationPlan}.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Crosses', text: 'the item, from the Week 4 information view' },
                { label: 'Direction', text: 'from producer to consumer, per item' },
                { label: 'Constraint', text: 'the requirement that bounds it' },
                { label: 'Owners', text: 'one per side; then verification' },
              ],
            },
          ],
          sources: [R('R57', '413'), R('R22', '630')],
          notes: {
            teach: [
              'Ask two pairs to read their fire alarm row, then reveal. Compare cell by cell; most pairs miss the owner of the far side and the medium.',
              'Then the new interface beside it, defined with the same columns: the evidence log’s path from the fire detection system.',
            ],
            workedSolution: [
              `IF-007, fire alarm to emergency response service. Crosses: ${info('INFO-010').name.toLowerCase()}, the alarm with the pad location. Direction: ${directionOf(if7)}; one way. Medium: ${if7.medium}. Constraint: ${if7.constraint}, which is REQ-SYS-009, half of the 60 s alert budget of REQ-STK-008. Owners: ${ownerOf('PHY-008').toLowerCase()} on the alarm side, ${ownerOf('EXT-006').toLowerCase()} on the receiving side. Verification: ${if7.verification.join(', ')}, the fire alarm transmission test.`,
              `IF-015, fire detection to operations center. Crosses: ${info('INFO-006').name.toLowerCase()}, the pad incident records. Direction: ${directionOf(if15)}; one way. Medium: ${if15.medium}. Constraint: ${if15.constraint}, written as the new requirement REQ-SYS-015. Owners: ${ownerOf('PHY-008').toLowerCase()} and ${ownerOf('PHY-004')}. Verification: no case exists yet, so the row names a plan: ${if15.verificationPlan}.`,
              'Notice the difference. IF-007 crosses the system boundary, so the other side belongs to a public agency we cannot instruct; IF-015 crosses an owner boundary inside the enterprise. Both need an owner per side. And every interface and interaction is verified during integration (R22 p.630), so an empty verification cell becomes a plan, never a blank.',
            ],
            why: 'Two complete rows, one external and one internal, show every column used for a reason. Seeing that direction comes from the information view, not from guesswork, keeps the table consistent with Week 4.',
            figure: 'Left card, then right card, column by column. Point at the verification cells: a case on the left, a plan on the right.',
            misconceptions: [{ claim: 'Direction is obvious from the interface name.', correction: 'Many interfaces carry flows both ways. AeroLink’s maintenance link carries status to dispatch and relays charge records back; read direction per item from the information view.' }],
            transition: 'A definition says what the interface is. A requirement says what it must do. SEBoK gives a three-step method.',
            timing: '5 min: 1 min two pairs read, 1.5 min IF-007, 1.5 min IF-015, 1 min the contrast.',
          },
        },
        {
          id: 'w5s1-interface-reqs',
          title: 'Interface requirements in three steps',
          purpose: 'Teach SEBoK’s three-step method and work it once on the flight-intent interface.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-interface-reqs',
            caption: 'The three steps worked on the flight-intent interface to the air traffic service. The requirement names the interface it governs. (FICTIONAL; value proposed)',
            alt: `Three numbered boxes left to right. 1 Identify: ${rq13.steps.boundary}. 2 Define: ${rq13.steps.interaction}. 3 Write: ${rq13.statement}`,
          },
          body: [
            { kind: 'bullets', items: ['**1** Identify the boundaries and the interactions across them', '**2** Define each interaction: what crosses, and the media', '**3** Write the interface requirement', 'Name the definition it points to'] },
          ],
          sources: [R('R13', '563')],
          notes: {
            teach: [
              'SEBoK, after the INCOSE needs and requirements manual: an interface requirement is the form of a functional requirement that deals with an interaction across an interface boundary with another system. Writing one is a three-step process: identify the interface boundaries and the interactions across them; define the interactions, the characteristics of what crosses and the media involved; write the interface requirements. Its example: “The System shall send telemetry to the Ground System as defined in ICD 123, Table X” (R13 p.563).',
              `Worked on AeroLink. Identify: ${rq13.steps.boundary}. Define: ${rq13.steps.interaction}. Write: ${rq13.statement} It refines the Week 2 stakeholder requirement REQ-STK-009, which said only that intent is provided before take-off.`,
              'Notice what steps one and two are: the N² cell and the definition row. The method is the reason we build the table first.',
            ],
            why: 'Students write interface requirements that name no interface and no medium. Following the three steps makes each requirement point at a definition that can be verified.',
            figure: 'Box one is the N² cell; box two is the definition row; box three is the sentence. Read the sentence and point at IF-003 inside it.',
            misconceptions: [{ claim: 'An interface requirement just says the two systems shall be compatible.', correction: 'It states one interaction across a named boundary, with a measurable criterion, and points at the definition (SEBoK’s example names the ICD and the table).' }],
            transition: 'Last idea of the day: why fewer interfaces is usually better, and when it is not.',
            timing: '3 min: 1 min the method, 1.5 min worked, 30 s the link to the table.',
          },
        },
        {
          id: 'w5s1-modularity',
          title: 'Modularity: maximum consistency inside, minimum interfaces outside',
          purpose: 'Connect the N² to the architecture aims of fewer interfaces and modularity, and preview the resilience tension.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w5s1-modularity',
            caption: 'Six elements joined by eleven links, drawn two ways: scattered, with no grouping; grouped into two modules, five links cross the module boundary.',
            alt: 'Two panels with the same six elements and the same eleven links. Left panel, scattered: no grouping. Right panel: the elements are in two rounded modules of three; six links lie inside the modules and five cross between them, those five drawn heavier and counted.',
          },
          body: [
            { kind: 'bullets', items: ['Aim: fewer physical interfaces; modularity (low interdependence)', 'Maximum consistency inside an element, minimum interfaces outside', 'Focus on interfaces at abstract levels', 'But concentration can cost resilience: Session 2'] },
          ],
          sources: [R('R20c', '599'), R('R20c', '603')],
          notes: {
            teach: [
              'SEBoK lists what a candidate physical architecture may aim at: among them a reduction in the number of physical interfaces, elements that can be tested separately, modularity, meaning elements with low interdependence, and resilience (R20c p.599). Its proven practices table says it plainly: restrict the number of interactions between elements and apply the modularity principle, maximum consistency inside an element and a minimum of physical interfaces with the outside; and focus on interfaces rather than elements at abstract levels (R20c p.603).',
              'The N² is the instrument for both. Grouping elements so that most interfaces fall inside groups is modularity; it is also what SEBoK’s integration article does with the coupling matrix when it groups elements into aggregates.',
              `Preview the tension. AeroLink’s operations center touches ${deg('PHY-004')} of the ${c14.total} received interfaces: a design with few external connections per element elsewhere, but one hub. SEBoK lists modularity and resilience as separate aims, and they can pull apart; Session 2 measures that with a coupling count.`,
            ],
            why: 'Modularity gives students a reason to prefer one breakdown over another that they can measure on their own N², and the preview prevents them from treating “fewest interfaces” as the only aim.',
            figure: 'Left: eleven links, no structure. Right: the same eleven; count the five heavy ones crossing the module boundary aloud. Same system, easier to integrate and to change.',
            misconceptions: [{ claim: 'The architecture with the fewest interfaces is always best.', correction: 'Fewer interfaces is one aim among several (R20c p.599). Concentrating them on one element can create a single point of failure.' }],
            transition: 'Close with one minute of writing.',
            timing: '3 min: 1 min aims and practices, 1 min the N² link, 1 min the tension.',
          },
        },
        {
          id: 'w5s1-exit',
          title: 'Exit: one interface of your enterprise',
          purpose: 'Retrieval of the typing and ownership ideas, and the Session 2 pre-work.',
          minutes: 3,
          layout: 'two-column',
          body: [
            { kind: 'callout', tone: 'key', title: 'One-minute paper', text: 'Name one organizational interface of your enterprise, the agreement it records, and who owns each side.' },
          ],
          aside: [
            { kind: 'bullets', items: ['Before Session 2 (about 15 min): list your Week 4 physical elements and externals', 'Mark every pair that exchanges something, and what', 'Bring it: you draft your N² in class'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Run the one-minute paper. Collect a few and read two aloud without names. A good answer names an agreement, such as a delivery partner’s service contract, and two owners. A weak answer names a data link, which is an information interface, or names one side only.',
              'Set the pre-work, about fifteen minutes per student: list your Week 4 physical elements and external elements, and mark every pair that exchanges something, with what it is. Bring it to Session 2; the team drafts its first N² from it in class.',
            ],
            why: 'Retrieval at the end of a session consolidates the typing and the owner-per-side rule, and the pre-work lets the Session 2 lab start from each member’s own list rather than a blank grid.',
            transition: 'Session 2 opens with three retrieval questions, then interface management, security and resilience.',
            timing: '3 min: 1 min paper, 1 min read two, 1 min pre-work and questions.',
          },
        },
        {
          id: 'w5s1-references',
          title: 'References and credits',
          purpose: 'The generated list of every source cited in this session, with license credits.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Point students to the full references; every slide footer cites a register entry and page.'],
            why: 'Every claim in the session is traceable to a verified source page.',
            transition: 'End of Session 1.',
            timing: '0 min (reference slide).',
          },
        },
      ],
    },
  ],
  studentLesson: LESSON,
}
