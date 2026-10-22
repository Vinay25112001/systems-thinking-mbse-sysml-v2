// Week 11, Session 2 lecture: Physical / Interfaces — interfaces, connections, interface requirements and the lab launch:
// a warm-up on three drafts of one connection, connections and interface media, interface definitions and usages, flows
// inside interfaces, binding connectors, organizational interfaces, the AeroLink interface set, interface requirements
// and their allocation (closing the open items Weeks 9 and 10 deferred to this week), satisfy claims with their design
// values, a predict item, the week's checker calibration, common errors, the review checklist, the mapping, the Week 12
// bridge; and 22 minutes of laboratory launch.
// 75-minute session: 47 minutes of lecture and 22 of laboratory on 23 slides plus the generated "References and credits"
// slide, and a 6-minute buffer. Same single source and governing direction as Session 1 (session1.ts header).
//
// Review status: new-pending-review. Written 2026-10-22 on the Week 10 template.
//
// Accuracy rules followed (as Session 1): verified register entries at supporting pages (R13 SEBoK System Requirements,
// R20c SEBoK Physical Architecture, R57 MITRE Interface Management, R71 and R76 the training deck, R81 and R83 the
// SysML v2.1 Beta 2 Part 1 clauses 7.11-7.16 and 7.21); course conventions labeled; checker behavior recorded for
// release 2026-08 only and described by what each message is about; listings are checked excerpts; AeroLink values
// computed from ./aerolinkCase.ts; spoken notes between 40 and 130 words per minute.
import type { Lecture } from '../types'
import { numberWord } from '../week01/aerolinkCase'
import { AEROLINK_W11_MODEL, COUNTS, DESIGN_VALUES, INTERFACE_ROWS, OPEN_ITEMS, ifOf, physicalName, shortName } from './aerolinkCase'
import { EXERCISE_MINUTES, LAB11_MINIMUMS, LAB11_OUTPUTS, LAB11_PERSON_HOURS, LAB11_TEAM_HOURS, LAB11_TEAM_HOURS_THREE, REVIEW_CHECKS, SEVEN_DAY_PLAN, W11_MAPPING } from './labBrief'
import { CALIBRATION, listing, listingText } from './listings'

export const WEEK11_S2_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const listingAlt = (key: string) => {
  const l = listing(key)
  return `Listing (course file sysml/${l.file}, checked: ${l.status}): ${listingText(key)}`
}
const cardAlt = (key: string) =>
  listing(key)
    .lines.map((l) => l.trim())
    .filter(Boolean)
    .join(' / ')
const G = AEROLINK_W11_MODEL
const outputFiles = LAB11_OUTPUTS.map((o) => o.file)
const EACH_FOUR = Math.round((LAB11_TEAM_HOURS / 4) * 10) / 10
const EACH_THREE = Math.round((LAB11_TEAM_HOURS_THREE / 3) * 10) / 10
const IF5 = ifOf('IF-005')
const IF3 = ifOf('IF-003')
const hub = (() => {
  const deg = new Map<string, number>()
  for (const x of G.interfaces) for (const e of [x.endA, x.endB]) deg.set(e, (deg.get(e) ?? 0) + 1)
  const [id, n] = [...deg.entries()].sort((a, b) => b[1] - a[1])[0]
  return { id, n }
})()
const closed = OPEN_ITEMS.filter((o) => o.status === 'closed')
const stillOpen = OPEN_ITEMS.filter((o) => o.status === 'open')
const ifReqs = closed.filter((o) => o.from === 'Week 10')
const DV = DESIGN_VALUES
const rejected = CALIBRATION.filter((c) => c.result === 'FAIL')
const accepted = CALIBRATION.filter((c) => c.result !== 'FAIL')
const predictRow = CALIBRATION.find((c) => c.file.endsWith('predict_satisfy_wrong_subject.sysml'))!
const listOf = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`)

export const WEEK11_SESSION2: Lecture = {
  week: 11,
  session: 2,
  title: 'Physical / Interfaces',
  subtitle: 'Session 2: Interfaces, interface requirements and the lab launch',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. warm-up (5 min)
    {
      id: 'w11s2-warmup-section',
      title: 'Warm-up: three drafts of one connection',
      slides: [
        {
          id: 'w11s2-warmup',
          title: 'Warm-up: which draft moves the coolant?',
          purpose: 'Retrieval of Session 1 and a need to know for today: three drafts of the pump-to-engine connection all pass the checker; only one says that coolant moves from the pump to the engine.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-listing-warmup',
            caption: 'Three drafts of the coolant connection between a pump and an engine block, from one checked file. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('warmup'),
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Vote', text: 'Which drafts say that coolant moves from the pump to the engine?' },
            { kind: 'bullets', items: ['A · Draft one only', 'B · Drafts one and two', 'C · Drafts one and three', 'D · All three: the checker accepts them'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the three drafts. Draft one: an interface with the pump’s port typed by CoolantPort, the engine’s by its conjugate, and a flow from the pump side’s coolant to the engine side’s coolant. Draft two: the same interface, with the flow from the engine side to the pump side. Draft three: no interface; the pump’s out item is bound to the engine block’s in item.',
              'Thirty seconds, then a show of hands for A to D. Do not resolve it yet; the next slide does. If someone says D, ask what the checker’s PASS was about last session.',
              'While hands are up, ask one student per option for a one-sentence reason. Listen for two confusions to correct on the next slide: that the order of an interface’s ends decides which way an item moves, and that any line joining two features moves something.',
            ],
            why: 'The warm-up retrieves directions and conjugation from Session 1 and plants today’s distinction between a flow, which moves something, and a binding, which states that two things are equal.',
            figure: 'Point at the last line of each draft in turn; read them without emphasis.',
            misconceptions: [{ claim: 'Any line between two items means the item moves.', correction: 'A flow moves an item from an out to an in; a binding says two features have the same value and moves nothing.' }],
            transition: 'What each draft says.',
            timing: '3 min: 1 min the drafts, 30 s to think, 1.5 min vote.',
          },
        },
        {
          id: 'w11s2-warmup-reveal',
          title: 'Reveal: one moves it, one reverses it, one moves nothing',
          purpose: 'Resolve the warm-up with the semantics of flows and bindings, and note that the checker accepted all three.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-three-meanings',
            caption: 'What each draft says: a flow from the pump to the engine, a flow the other way, and a binding that makes two features equal. Course illustration, not SysML v2 graphical notation.',
            alt: 'Three rows, each with a pump box and an engine box. Row one: an arrow from pump to engine labeled flow: coolant moves. Row two: an arrow from engine to pump labeled flow, the wrong way. Row three: an equals sign between them labeled bind: same value, nothing moves.',
          },
          body: [{ kind: 'bullets', items: ['Answer A: only draft one moves coolant from pump to engine', 'Draft two: a flow from the in item to the out item', 'Draft three: a binding asserts equal values; it is not a transfer', 'All three pass the checker'] }],
          sources: [R('R71', '24'), R('R71', '26'), R('R81', '96')],
          notes: {
            teach: [
              'Draft one: a flow transfers a payload from the source output to the target input (R71 sl.26), and the conjugate puts the coolant out at the pump and in at the engine. Draft two writes the flow from the engine’s in item to the pump’s out item, against both ports’ directions. Draft three uses a binding: a connection that asserts the equivalence of the connected features, equal values in the same context (R71 sl.24); the specification calls it a relationship that must be true at all times, not a part that is created (R81 p.96). It states that two features are the same; nothing is transferred.',
              'All three files pass the checker with no message. That is the theme of today: the constructs that carry meaning across an interface are exactly the ones the checker cannot judge.',
            ],
            why: 'Students who confuse binding and flow model delegation and transfer interchangeably; the reveal separates them before the slides use both.',
            figure: 'Read the three rows top to bottom; point at the equals sign last.',
            misconceptions: [{ claim: 'A binding is a shorter way to write a flow.', correction: 'A binding asserts that two features are equal; a flow models a transfer from an output to an input.' }],
            transition: 'Start with the general construct both interfaces and bindings come from: the connection.',
            timing: '2 min: 1.5 min the three meanings, 30 s the checker.',
          },
        },
      ],
    },
    // ============================================================================================ B. connections and interfaces (18 min)
    {
      id: 'w11s2-interfaces-section',
      title: 'Connections, interfaces, flows and bindings',
      slides: [
        {
          id: 'w11s2-connections',
          title: 'Connections, and the interface medium',
          purpose: 'Define connection definitions and usages, and the specification’s distinction between a logical connection and a connection whose medium is modeled as a part.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-connection-medium',
            caption: 'Two ways to model a pump connected to a tank: a logical connection, and a connection through a medium modeled as a part. Course illustration, not SysML v2 graphical notation.',
            alt: 'Top row: a pump box and a tank box joined by one line labeled logical connection. Bottom row: a pump box, a plumbing box and a tank box, joined by two lines, labeled the medium as a part.',
          },
          body: [
            { kind: 'definition', term: 'Connection definition (training deck)', text: '“a part definition whose usages are connections between its ends”', source: R('R71', '18') },
            { kind: 'bullets', items: ['A connection usage connects two features in context', 'A logical connection abstracts the medium away', 'Or the medium is a part in between'] },
          ],
          sources: [R('R71', '18'), R('R71', '19'), R('R81', '96')],
          notes: {
            teach: [
              'The training deck: a connection definition is a part definition whose usages are connections between its ends; a connection is a usage of a connection definition, which connects two other features; without an explicit definition a generic Connection is used. Dot notation gives the path to a nested feature (R71 sl.18–19).',
              'The specification makes a distinction your Week 5 media need. A connection usage that connects parts is often a logical connection that abstracts away how they are connected, the plumbing between a pump and a tank for example. Alternatively the plumbing can be modeled as a part, an interface medium, where the pump connects to the plumbing and the plumbing to the tank (R81 p.96).',
              'Course choice this week: the Week 5 medium is written into the interface’s documentation, and the interface is a logical connection between the two elements. AeroLink’s communications network, the medium of many interfaces, therefore performs no function and connects nothing directly: a recorded decision, not an omission.',
            ],
            why: 'Students meet media in every Week 5 interface; knowing the two modeling options lets them see the course choice as a choice.',
            figure: 'Compare the two rows: one line, then the medium as its own box.',
            misconceptions: [{ claim: 'A connection must show the cable or network it runs over.', correction: 'A logical connection abstracts the medium; modeling the medium as a part is a further choice.' }],
            transition: 'An interface is a connection with one restriction.',
            timing: '3 min: 1 min the definition, 1.5 min logical versus medium, 30 s the course choice.',
          },
        },
        {
          id: 'w11s2-interface-def',
          title: 'Interface definitions and interface usages',
          purpose: 'Teach interface definitions as connection definitions whose ends are ports, and interface usages that connect two compatible ports, on the AeroLink charging interface.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-listing-interface-def',
            caption: 'The interface definition of IF-005 in AeroLink model v0.4: two port ends, one typed by the port definition and one by its conjugate, and a flow per crossing. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('interface-def'),
          },
          body: [
            { kind: 'definition', term: 'Interface definition (SysML v2.1 Beta 2)', text: '“a kind of connection definition … whose ends are restricted to be port definitions”', source: R('R81', '106') },
            { kind: 'bullets', items: ['An interface usage connects two compatible ports', 'connect a.p to b.q: dot notation to each port'] },
          ],
          sources: [R('R81', '106'), R('R81', '109'), R('R71', '22')],
          notes: {
            teach: [
              'Read the definition: an interface definition is a kind of connection definition whose ends are restricted to be port definitions; an interface usage is a connection usage of an interface definition, and its ends are port usages. An interface is simply a connection all of whose ends are ports, which supports the specification and reuse of compatible connections between parts (R81 p.106).',
              'The training deck shows the textual form: the interface definition with end ports, and in the part that owns both parts, an interface usage that connects one part’s port to the other’s (R71 sl.22). The specification’s shorthand: interface name : Definition connect a.p to b.q (R81 p.109).',
              `Read the AeroLink listing: end eVTOLAircraft typed by the port definition, end chargingSystems by its conjugate, and ${numberWord(IF5.flows.length)} flows, one per crossing, each from the end where the item is out to the end where it is in.`,
            ],
            why: 'The interface definition is where the Week 5 table becomes a model element that can be reused and checked; seeing one real definition makes the pattern concrete.',
            figure: 'Follow the callouts: the two ends, then each flow line from out to in.',
            misconceptions: [{ claim: 'An interface can connect two parts directly.', correction: 'Its ends are ports; connecting two parts is rejected (see the calibration).' }],
            transition: 'Why put the flows inside the definition?',
            timing: '3 min: 1 min the definition, 1 min the textual form, 1 min the listing.',
          },
        },
        {
          id: 'w11s2-flows',
          title: 'Flows across an interface',
          purpose: 'Teach flows as transfers from an out feature of the source port to an in feature of the target port, and flows defined in an interface definition as established when the interface is used.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-flow-established',
            caption: 'Flows written once in the interface definition are established wherever the interface is used: two ports, connected, with the items moving out to in. Course illustration, not SysML v2 graphical notation.',
            alt: 'Left, a card labeled interface definition with two flow lines. An arrow labeled used by runs to the right, where two part boxes each carry a port; between the ports, two arrows in opposite directions labeled with item names.',
          },
          body: [{ kind: 'bullets', items: ['A flow: from an output of the source to an input of the target', 'Streaming: the transfer is ongoing while both act', 'Flows in an interface definition: established when the interface is used', 'Course convention: one flow per Week 5 crossing'] }],
          sources: [R('R71', '26'), R('R71', '27'), R('R71', '28'), R('R81', '112'), R('R81', '116')],
          notes: {
            teach: [
              'A flow transfers a payload from the source output to the target input; it is streaming if the transfer is ongoing between source and target rather than happening once (R71 sl.26). A flow usage between ports goes from an output of a source port to an input of a target port, and naming the payload type is optional (R71 sl.27). Flows can be defined within an interface definition and are established when the interface is used (R71 sl.28).',
              'The specification: a flow usage represents the performance of a transfer between the values of the interacting usages, directed from the first end, the source, to the second, the target (R81 p.112); a streaming flow identifies the output feature of the source and the input feature of the target with feature chains (R81 p.116).',
              'Course convention: one flow per Week 5 crossing, written in the interface definition, so every use of the interface carries them.',
            ],
            why: 'Writing flows in the definition keeps what crosses with the interface that carries it, where a reviewer looks for it.',
            figure: 'Point at the two flow lines in the definition, then at the two arrows they become between the ports.',
            misconceptions: [{ claim: 'The direction of a flow is decided by the order of the interface’s ends.', correction: 'It is decided by the flow’s source and target: from an out feature to an in feature.' }],
            transition: 'Sometimes an element passes a feature of its port to a part inside it. That is a binding.',
            timing: '3 min: 1.5 min flows, 1 min the specification, 30 s the convention.',
          },
        },
        {
          id: 'w11s2-binding',
          title: 'Binding connectors: delegation, not transfer',
          purpose: 'Teach binding connectors as equality assertions, used to delegate an outer port’s feature to the inner part that provides it, and the feature-value shorthand.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-listing-binding',
            caption: 'A manifold’s outer port delegates its oxygen to the regulator inside it with a binding (course example). Checked: PASS. (FICTIONAL)',
            alt: listingAlt('binding'),
          },
          body: [{ kind: 'bullets', items: ['bind a = b: the two features have equal values in the same context', 'Typical use: delegate an outer port’s feature to the inner part', 'A feature value (= expression) is also a binding, not a default'] }],
          sources: [R('R71', '24'), R('R71', '25'), R('R81', '96')],
          notes: {
            teach: [
              'A binding connection asserts the equivalence of the connected features: they have equal values in the same context (R71 sl.24). The deck’s example binds the fuel tank assembly’s port features to the pump and tank inside it: delegation from the outer boundary to the part that does the work. The feature-value notation combines a feature with a binding; it is a binding, not an initial or default value (R71 sl.25).',
              'The specification: bindings and successions are special kinds of connection; they are not part usages, are not created and destroyed, and assert relationships that must be true at all times (R81 p.96).',
              'Read the listing: the manifold’s port toWard offers oxygen out; inside, the regulator produces regulated oxygen; the binding says they are the same. When Week 5 puts an interface end on an element and the work is done by one of its components, a binding like this one shows where.',
            ],
            why: 'Delegation is how an element-level interface reaches the component that does the work; knowing that it is an equality keeps students from using it as a transfer.',
            figure: 'Point at the outer port, the regulator’s out item, then the bind line.',
            misconceptions: [{ claim: 'A feature value like = pump.out sets a starting value that can change.', correction: 'It is a binding: the feature equals the expression at all times.' }],
            transition: 'Some Week 5 interfaces carry nothing at all.',
            timing: '3 min: 1 min binding, 1 min the specification, 1 min the listing.',
          },
        },
        {
          id: 'w11s2-organizational',
          title: 'Information, physical and organizational interfaces in the model',
          purpose: 'Show the three Week 5 interface kinds as model elements: an information or physical interface as an interface with ports, an organizational interface as a connection with no ports (course convention).',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-listing-interface-usage',
            caption: 'Three interface usages in AeroLink model v0.4: an information interface, an organizational one and the charging interface. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('interface-usage'),
          },
          body: [{ kind: 'bullets', items: ['Physical and information: an interface between two ports, with flows', 'Organizational: a connection between the two parts; the agreement in its doc', 'Course convention: nothing flows across an agreement, so no ports'] }],
          sources: [R('R20c', '597'), R('R71', '18')],
          notes: {
            teach: [
              'SEBoK lists, for an enterprise system, protocols, procedures and documents as physical interfaces (R20c p.597). Your Week 5 organizational interfaces are of that kind: an agreement between owners, carrying no flow.',
              `Course convention: a physical or information interface becomes an interface between two ports, with its flows; an organizational interface becomes a plain connection between the two parts, its agreement written in the documentation (R71 sl.18: without a definition, a generic Connection is used). AeroLink has ${numberWord(COUNTS.organizationalIfs)} organizational interfaces, written as connections.`,
            ],
            why: 'One construct per kind keeps every team’s model readable, and a connection without ports says honestly that nothing crosses.',
            figure: 'Read the three lines: two ports in the first and last, two parts in the middle one.',
            misconceptions: [{ claim: 'An organizational interface should get ports and an empty port definition.', correction: 'Nothing crosses an agreement; a connection between the parts says so without empty ports (course convention).' }],
            transition: 'The whole AeroLink interface set.',
            timing: '2 min: 1 min SEBoK, 1 min the convention.',
          },
        },
        {
          id: 'w11s2-worked-interfaces',
          title: 'AeroLink worked example III: the interface set in the model',
          purpose: 'See every Week 5 interface of AeroLink as a model element, with the counts by kind and the hub, read from model v0.4; one think-pair-share.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-interface-set',
            caption: `The AeroLink interfaces in model v0.4 by kind, and the element most of them meet at. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `Three bars: physical ${COUNTS.physicalIfs}, information ${COUNTS.informationIfs}, organizational ${COUNTS.organizationalIfs}. Beside them a card: ${shortName(hub.id)}, an end of ${hub.n} interfaces. Below: ${COUNTS.portDefs} port definitions, ${COUNTS.ports} ports, ${COUNTS.flows} flows.`,
          },
          body: [
            { kind: 'bullets', items: [`${COUNTS.interfaces} interfaces: ${COUNTS.physicalIfs} physical, ${COUNTS.informationIfs} information, ${COUNTS.organizationalIfs} organizational`, `${COUNTS.ports} ports, ${COUNTS.flows} flows`, 'Generated from the Week 5 case; nothing retyped'] },
            { kind: 'callout', tone: 'note', title: 'Pair, 1 min', text: `${physicalName(hub.id)} is an end of ${hub.n} interfaces. What does SEBoK’s modularity practice ask about that?` },
          ],
          sources: [R('R20c', '603')],
          notes: {
            teach: [
              `Read the counts: ${COUNTS.interfaces} Week 5 interfaces, ${COUNTS.physicalIfs} physical, ${COUNTS.informationIfs} information and ${COUNTS.organizationalIfs} organizational; ${COUNTS.portDefs} port definitions and ${COUNTS.ports} ports, ${COUNTS.flows} flows. Every one is generated from the Week 5 case with the lab tool’s generator; the instructor decided only the item for each physical crossing.`,
              `Run the pair question. Expected answer: modularity asks for few physical interfaces outside an element and much consistency inside it (R20c p.603). ${physicalName(hub.id)} with ${hub.n} interfaces is a hub; that was the Week 4 decision for central control, and its price is interface load. A reviewer records it, and asks whether each interface is needed.`,
              `Point at the information interface IF-003: ${IF3.flows.map((f) => `${f.itemName.toLowerCase()} from ${physicalName(f.from)} to ${physicalName(f.to)}`).join(', and ')}: the intent out and the acceptance back, both carried by one item.`,
            ],
            workedSolution: ['Step 1, the kind: physical and information become interfaces; organizational become connections.', 'Step 2, the definition: the port definition from end A, the interface definition with both ends and a flow per crossing.', 'Step 3, the usage: the IF ID on an interface usage that connects end A’s port to end B’s.', 'Step 4, check: every Week 5 interface appears once; every external end is a reference part; the hub is a decision you can name.'],
            why: 'Seeing the whole set in counts and one hub makes the model’s structure reviewable at a glance, which is what SEBoK’s focus on interfaces asks for.',
            figure: 'Read the three bars, then the hub card and its number.',
            misconceptions: [{ claim: 'More interfaces mean a more complete model.', correction: 'The model has exactly the Week 5 interfaces; SEBoK’s modularity asks for as few as the design needs.' }],
            transition: 'Interfaces have requirements of their own.',
            timing: '4 min: 1 min the counts, 1.5 min pair question and debrief, 1.5 min IF-003 and the worked steps.',
          },
        },
      ],
    },
    // ============================================================================================ C. interface requirements and satisfy (13 min)
    {
      id: 'w11s2-requirements-section',
      title: 'Interface requirements and satisfy claims',
      slides: [
        {
          id: 'w11s2-interface-req',
          title: 'Interface requirements in the model',
          purpose: 'Define interface requirements as SEBoK does, place them in interface management, and show how a Week 5 interface requirement the model does not have yet is written.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-listing-interface-requirement',
            caption: 'An interface requirement with the interface definition as subject, allocated to the interface usage and to the function that realizes it (course example). Checked: PASS. (FICTIONAL)',
            alt: listingAlt('interface-requirement'),
          },
          body: [
            { kind: 'definition', term: 'Interface requirement (SEBoK)', text: '“a functional requirement that deals with an interaction of a system across an interface boundary with another system”', source: R('R13', '563') },
            { kind: 'bullets', items: ['Interface management takes them as inputs, gives specifications as outputs', 'Course convention: one Week 9 did not model gets the interface definition as subject'] },
          ],
          sources: [R('R13', '563'), R('R57', '411')],
          notes: {
            teach: [
              'SEBoK: the phrase interface requirement refers to the specific form for a functional requirement that deals with an interaction of a system across an interface boundary with another system, written in three steps: identify the interface boundaries and interactions; define the interactions, what crosses and the media; write the requirement (R13 p.563). Your Week 5 interface requirements followed exactly those steps.',
              'MITRE places them in interface management: its inputs include interface requirements and their changes; its outputs, interface specifications and interface control documents (R57 p.411). This week the model becomes the specification.',
              'Most teams’ Week 9 models do not contain the Week 5 interface requirements, because Week 9 imported only Week 1 and Week 2. The Week 11 tool writes each one into Requirements, derived from its Week 5 parents. Course convention: its subject is the interface definition, the element the requirement is about. Read the listing: the subject, then the two allocations, to the interface usage and to the function.',
            ],
            why: 'Putting the interface requirements into the model, with a subject and allocations, is what lets Week 12 verify them against the interfaces they govern.',
            figure: 'Follow the callouts: subject, allocation to the interface, allocation to the function.',
            misconceptions: [{ claim: 'An interface requirement belongs to one of the two elements.', correction: 'It governs the interaction across the boundary; the course makes the interface its subject when the model does not already have one.' }],
            transition: 'AeroLink’s interface requirements were already in the model. Week 10 left them waiting.',
            timing: '3 min: 1 min SEBoK, 1 min MITRE, 1 min the course convention and listing.',
          },
        },
        {
          id: 'w11s2-req-allocation',
          title: 'Allocating interface requirements: the open items close',
          purpose: 'Allocate each interface requirement to its interface and to the function that realizes it, and close truthfully the open items Weeks 9 and 10 deferred to this week.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-listing-req-allocation',
            caption: 'The three interface requirements Week 10 deferred, allocated in AeroLink model v0.4 to their interfaces and to the functions Week 10 named. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('req-allocation'),
          },
          body: [{ kind: 'bullets', items: ['Each interface requirement: allocate to its interface, and to its function', `AeroLink: ${ifReqs.map((o) => o.item).join(', ')} now allocated`, `Still open: ${stillOpen.map((o) => o.item).join(', ') || 'none'}, with its reason and owner`, 'A gap with a disposition is honest'] }],
          sources: [R('R81', '110'), R('R20c', '601')],
          notes: {
            teach: [
              'An allocation makes the target responsible for realizing some or all of the intent of the source (R81 p.110). SEBoK’s physical-architecture activities include establishing traceability between the system requirements and the physical elements (R20c p.601). So each interface requirement is allocated twice: to the interface usage that carries the interaction, and to the function at one end that realizes it.',
              `Week 10 left three AeroLink interface requirements with a disposition naming this week. Read the listing: ${ifReqs.map((o) => `${o.item}, ${o.now.charAt(0).toLowerCase()}${o.now.slice(1)}`).join(' ')} Each matches the function the Week 10 disposition named.`,
              `Week 9 deferred two stakeholder requirements too. ${closed.filter((o) => o.from === 'Week 9').map((o) => `${o.item}: ${o.now}`).join(' ')} ${stillOpen.map((o) => `${o.item}: ${o.now}`).join(' ')}`,
            ],
            why: 'Closing deferred items in the week they were promised, and saying plainly which one stays open and why, is what makes a disposition worth writing.',
            figure: 'Read the first pair of lines as two sentences, then point at the other two pairs.',
            misconceptions: [{ claim: 'An open item must be closed in the week it names, whatever the facts.', correction: 'It is closed when the facts allow; otherwise it is re-dated with its reason and owner.' }],
            transition: 'With design elements in place, the first satisfy claims can be written.',
            timing: '3 min: 1 min the double allocation, 1 min the Week 10 items, 1 min the Week 9 items.',
          },
        },
        {
          id: 'w11s2-satisfy',
          title: 'Satisfy claims: the design asserts it meets a requirement',
          purpose: 'Teach satisfy as Week 9 previewed it, now with a design element and its design value: an assertion that the requirement evaluates to true with the element bound to its subject, with its basis.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-listing-satisfy',
            caption: 'The charging systems’ design value and the satisfy claim for the charge-time requirement in AeroLink model v0.4, with its basis. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('satisfy'),
          },
          body: [{ kind: 'bullets', items: ['satisfy R by e: R holds with e bound to its subject', 'e must be of the subject’s type', 'The design value is an attribute of e; the basis says where it comes from', 'A claim, verified in Week 12'] }],
          sources: [R('R83', '162'), R('R83', '168')],
          notes: {
            teach: [
              'A satisfy requirement usage is a kind of assert constraint usage that asserts that a requirement is satisfied when a given feature is bound to its subject parameter (R83 p.162). Its subject must be bound to a satisfying feature, given after the keyword by; the short form names the requirement right after satisfy (R83 p.168).',
              `Read the listing. The charging systems’ part usage redefines the attribute its placeholder declared, ${DV[0].attribute}, with ${DV[0].cbe} ${DV[0].unit}: the ${DV[0].tpm} current best estimate from Week 3. The satisfy then binds the charging systems to the subject of the requirement, whose limit is ${DV[0].threshold} ${DV[0].unit}, and its doc states the basis. The second AeroLink claim does the same for the aircraft’s noise, ${DV[1].cbe} against ${DV[1].threshold} ${DV[1].unit}.`,
              'Week 9 previewed this, and the satisfiable group: members whose subjects are bound to features of the group’s subject can be satisfied together. This week we satisfy members one by one; that is enough for the lab.',
            ],
            why: 'A satisfy claim with a design value and a basis is a defensible assertion; without them it only restates the requirement.',
            figure: 'Point at the design value, then at the satisfy line and its basis.',
            misconceptions: [{ claim: 'A satisfy relationship shows that the requirement is met.', correction: 'It asserts it; the model is then consistent only if the design value meets the limit, and Week 12 plans the evidence.' }],
            transition: 'Predict one checker result about satisfy.',
            timing: '4 min: 1.5 min the semantics, 1.5 min the listing, 1 min groups and the claim’s status.',
          },
        },
        {
          id: 'w11s2-predict',
          title: 'Predict: what does the checker say?',
          purpose: 'Practice the satisfy error the lab tool guards against: a claim whose part is not of the requirement’s subject type. The result is revealed on the calibration slide.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-predict-card',
            caption: 'A requirement on a compressor and a satisfy claim in a workshop, shown without its checker result. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `A code card titled Accepted, warned or rejected? with these lines: ${cardAlt('predict-satisfy')}.`,
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Predict, 1 min', text: 'Accepted silently, accepted with a warning, or rejected?' },
            { kind: 'bullets', items: ['Write your choice', 'And: is the claim about the right element?'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Give pairs one minute. Each pair writes accepted silently, accepted with a warning, or rejected, and answers the second question: is the claim about the right element? Do not confirm anything; the result is on the calibration slide.',
              'If a pair asks whether the value 8.0 matters, say that the question is about the line at the bottom: what is bound to what.',
              'Listen for the split between “accepted, it resolves” and “rejected, wrong part”; the recorded answer is neither.',
            ],
            why: 'Predicting the response to a type mismatch prepares students for a checker that only warns about a claim that is wrong in meaning.',
            figure: 'Read the requirement’s subject line, then the two parts, then the satisfy line.',
            transition: 'The week’s calibration, with this result in it.',
            timing: '2 min: 1 min pairs predict, 1 min collect answers.',
          },
        },
      ],
    },
    // ============================================================================================ D. review and bridge (11 min)
    {
      id: 'w11s2-review-section',
      title: 'Calibration, review and the bridge',
      slides: [
        {
          id: 'w11s2-calibration',
          title: 'What the checker checks this week, and what it cannot',
          purpose: 'Reveal the predict item and give the whole week’s calibration: recorded results of release 2026-08, each described by what the message is about.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-checker-table',
            caption: `Recorded results of the course checker (release 2026-08) on the week’s ${CALIBRATION.length} calibration files: rejected, and accepted silently or with only a warning. Course illustration, not SysML v2 graphical notation.`,
            alt: `Two columns. Left, headed checker rejects: ${rejected.map((c) => c.label).join('; ')}. Right, headed checker accepts: ${accepted.map((c) => `${c.label}${c.result === 'PASS with warnings' ? ' (a warning)' : ''}`).join('; ')}.`,
          },
          body: [{ kind: 'bullets', items: ['The predict card: accepted, with a warning only', 'Rejected: ends that are not ports, names that do not resolve', 'Accepted: mismatched ports, reversed flows, bindings for transfers', 'A warning is a finding until explained'] }],
          sources: [R('R83', '162'), R('R81', '106')],
          notes: {
            teach: [
              `Reveal the predict item: accepted, with one warning: “${predictRow.recorded}”. The claim binds the tank to the subject of a requirement about a compressor (R83 p.162). The checker warns about the types; it does not reject, and the claim is about the wrong element. The lab tool leaves such a claim out and tells you why.`,
              `The week’s rejects, each with its message: ${rejected.map((c) => `${c.what.toLowerCase()}: “${c.recorded}”`).join('; ')}.`,
              `The week’s passes: ${accepted.map((c) => `${c.what.toLowerCase()}${c.result === 'PASS with warnings' ? ', with a warning' : ''}`).join('; ')}. Every one carries an interface error in meaning.`,
              'The rule: zero errors is necessary, never sufficient, and a warning is a finding until your log explains it. Recorded for the course release; a new release may report more, or less.',
            ],
            why: 'Students submit a checker log this week; knowing which mistakes the log cannot show sends them to the review checklist.',
            figure: 'Read the columns; pause on the satisfy row and its warning.',
            misconceptions: [{ claim: 'A warning can be ignored if the file passes.', correction: 'This warning marks a claim about the wrong element; every warning is explained in the log or fixed.' }],
            transition: 'The errors the review catches most often.',
            timing: '3 min: 1 min the reveal, 1 min rejects, 1 min passes and the rule.',
          },
        },
        {
          id: 'w11s2-common-errors',
          title: 'Common errors in physical and interface models',
          purpose: 'Name the errors first models make this week, each with the check that catches it.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-common-errors',
            caption: 'Six common errors in first physical and interface models, each with the check that catches it. Course illustration, not SysML v2 graphical notation.',
            alt: 'Six cards in two columns: same port type at both ends; flow the wrong way; binding used as a transfer; interface invented, not in Week 5; allocation with no nested functions; satisfy on the wrong element. Each card has a small tag naming the check.',
          },
          body: [{ kind: 'bullets', items: ['Both ends the same port type; a flow the wrong way', 'A binding where a transfer is meant', 'An interface the Week 5 table does not have', 'An allocation with no nested functions; satisfy on the wrong element'] }],
          sources: [R('R81', '93'), R('R71', '24')],
          notes: {
            teach: [
              'Six errors, each with its check. Both ends typed by the same port definition: the matching rule, one end conjugate (R81 p.93). A flow from an in to an out: read each flow from the end where the item is out. A binding where an item should move: a binding asserts equality, it is not a transfer (R71 sl.24). An interface the Week 5 table does not have: add it to Week 5 first, with its owners, then import again. An allocation with no nested allocations: say which function is realized where. A satisfy on an element of the wrong type: the subject must conform.',
              'The lab tool prevents three of these by construction, the port types, the flow directions it can compute and the nested allocations; the others are yours.',
            ],
            why: 'Naming the frequent errors with their checks turns the review from a hunt into a routine.',
            figure: 'Read each card and its tag.',
            misconceptions: [{ claim: 'Errors the tool prevents do not need reviewing.', correction: 'The tool writes what your choices say; a wrong direction you set yourself is written as you set it.' }],
            transition: 'The checklist the lab records.',
            timing: '2 min: 1.5 min the six, 30 s what the tool prevents.',
          },
        },
        {
          id: 'w11s2-checklist',
          title: 'The interface review checklist',
          purpose: 'Give the self-check the lab uses: eight checks, each recorded as met or as a finding with a note, with the evidence the lab tool computes.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-checklist-card',
            caption: `The interface review checklist (course convention): the ${numberWord(REVIEW_CHECKS.length)} checks your team records in the lab, each met or a finding. Course illustration, not SysML v2 graphical notation.`,
            alt: `A card with ${REVIEW_CHECKS.length} lines, each with an empty checkbox: elements and components as parts; logical to physical allocated, nested; ports, end B conjugate; flows the right way; every Week 5 interface, none invented; interface requirements allocated; satisfy: conforming, with a basis; externals have an interface.`,
          },
          body: [{ kind: 'bullets', items: ['Course convention: eight checks against Week 5 and the model', 'Each: met, or a finding with a note', 'The tool gives evidence; the judgment is yours'] }],
          sources: [R('R20c', '601'), R('R81', '93')],
          notes: {
            teach: [
              `The course checklist has ${numberWord(REVIEW_CHECKS.length)} checks: ${REVIEW_CHECKS.map((c) => c.text.charAt(0).toLowerCase() + c.text.slice(1)).join('; ')}.`,
              'For each, the team records whether the model meets it or what the finding is, with a short note on how it checked. The tool shows the evidence it can compute: the parts table, the allocation matrix, assumed directions, unallocated requirements, non-conforming claims. Whether an item is produced at the end it leaves rests on the Week 4 information view and on your judgment (R81 p.93 for the matching rule; R20c p.601 for the trace).',
            ],
            why: 'A checklist with recorded results makes the review visible and gradable, and keeps the tool’s evidence and the team’s judgment apart.',
            figure: 'Read the eight lines; pause on the flows line and point back to the warm-up.',
            misconceptions: [{ claim: 'A tool report with no gaps means every check is met.', correction: 'The tool computes evidence for some checks; the team still records each result and its note.' }],
            transition: 'How your package becomes model v0.4.',
            timing: '3 min: 1.5 min the checks, 1.5 min evidence and judgment.',
          },
        },
        {
          id: 'w11s2-mapping',
          title: 'From your package to model v0.4',
          purpose: 'Prepare the lab: the artifact-to-model mapping for this week, and the decisions the team makes in the lab tool.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-mapping',
            caption: 'The course mapping for Week 11, short form: each Phase I element of the Week 4 and Week 5 package and the model element it becomes. Course illustration, not SysML v2 graphical notation.',
            alt: 'A two-column table, Phase I and model v0.4: PHY, part def and part; CMP, nested part; FN on PHY, perform; LOG to PHY, allocate, nested; EXT, ref part; IF, port def, interface def, interface; IF organizational, connection; crossing, directed item, flow; interface REQ, allocate twice; claim, satisfy.',
          },
          body: [{ kind: 'bullets', items: ['Course convention: generated from your Week 10 model and Week 5 export', 'You decide: placeholder links, placements of new functions, what crosses and which way, the functions of each interface requirement, the satisfy claims', 'Every ID kept; new ones continue after the highest'] }],
          sources: [],
          notes: {
            teach: [
              `The mapping for this week is a course convention, in ${numberWord(W11_MAPPING.length)} rows. ${W11_MAPPING.slice(0, 5).map((m) => `${m.artifact} becomes ${m.becomes.split(';')[0]}`).join('; ')}.`,
              'The tool generates all of it from your Week 10 model and your Week 5 export. Your decisions: which physical element each Week 8 or 9 part definition stands for, where a function added in Week 10 runs, what crosses each interface and which way, the functions that realize each interface requirement, and the satisfy claims with their basis. An item you add takes the next free ID; no ID is ever reused or renumbered.',
            ],
            why: 'Knowing which decisions are theirs lets teams spend the lab time on them instead of on what the tool already does.',
            figure: 'Read the left column top to bottom, giving the model element for each.',
            misconceptions: [{ claim: 'The generated model can be submitted as it comes out of the tool.', correction: 'It is a draft built from your decisions; only the team can check the crossings, directions and claims against Week 5.' }],
            transition: 'Where this goes next week.',
            timing: '2 min: 1 min mapping, 1 min decisions and IDs.',
          },
        },
        {
          id: 'w11s2-bridge',
          title: 'Bridge: Week 12, digital thread and verification',
          purpose: 'Show what Week 12 does with this week’s model: verification cases that verify the requirements, the satisfy claims checked by evidence, the thread audited end to end.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-bridge',
            caption: 'What Week 12 does with the physical architecture and interfaces modeled this week. Course illustration, not SysML v2 graphical notation.',
            alt: 'Three bars stacked top to bottom, joined by arrows: satisfy claims, to verify; interface requirements, a verification case each; the thread from need to evidence, audited.',
          },
          body: [{ kind: 'bullets', items: ['Each satisfy claim: a verification case plans its evidence', 'Each interface requirement: a method and a case', 'The digital thread: need to requirement to design to verification'] }],
          sources: [],
          notes: {
            teach: [
              'Week 12 models verification cases that verify your requirements, plans the evidence each satisfy claim needs, and audits the digital thread from need to verification. The interface requirements you allocated this week, and the Week 5 verification methods they carry, become its first cases.',
              'Keep every PHY, CMP, IF and item ID stable: Week 12 reads them, and a renamed element breaks every allocation and claim built on it.',
            ],
            why: 'Students who see that their claims will be checked write claims they can defend.',
            figure: 'Point at each bar as you name what Week 12 does with it.',
            misconceptions: [{ claim: 'A satisfy claim is the end of the requirement’s story.', correction: 'It is an assertion; verification provides the evidence, in Week 12.' }],
            transition: 'Now the lab.',
            timing: '2 min: 1.5 min Week 12, 30 s the IDs.',
          },
        },
      ],
    },
    // ============================================================================================ E. laboratory launch (22 min)
    {
      id: 'w11s2-lab',
      title: 'Laboratory launch',
      slides: [
        {
          id: 'w11s2-lab-brief',
          title: 'Lab L11: model v0.4 of your enterprise',
          subtitle: 'Due before Week 12, Session 1, on the LMS; your own enterprise, never AeroLink',
          purpose: 'Give unambiguous instructions for model v0.4: the three files, what each contains, the minimums, the deadline, the workload and the AI statement.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-deliverables',
            caption: 'Lab L11 deliverables: three files, one upload (course convention). Course illustration, not SysML v2 graphical notation.',
            alt: `Four bars stacked top to bottom: ${outputFiles.join('; ')}; one upload, before Week 12.`,
          },
          body: [{ kind: 'bullets', items: ['Your own enterprise, never AeroLink', `Three files: ${outputFiles.join(', ')}`, 'Zero checker errors; every warning explained', 'Formative feedback before Week 12, Session 2'] }],
          sources: [],
          notes: {
            teach: [
              `Read the three files. First, ${outputFiles[0]}: your Week 10 model with the Physical package modeled. Second, ${outputFiles[1]}: the parts table, the allocation matrix, the interface table, the requirement allocations, the satisfy claims, the audit with a disposition for every finding, the review checklist and the AI usage statement. Third, ${outputFiles[2]}: the final checker run of model v0.4, with zero errors and every warning explained.`,
              `Minimums, a course proposal pending faculty approval: every Week 4 physical element and Week 5 component as a part; every Week 5 interface modeled, with every crossing’s direction confirmed; every interface requirement allocated to its interface and a function, or dispositioned; at least ${LAB11_MINIMUMS.satisfy} satisfy claims, each conforming and with its basis.`,
              `Workload: about ${LAB11_TEAM_HOURS} person-hours out of class for a team of four, about ${EACH_FOUR} hours each. A team of three makes ${LAB11_MINIMUMS.satisfyThree} satisfy claim instead of ${LAB11_MINIMUMS.satisfy}, and the tool enforces that minimum; every other task is the same work: about ${LAB11_TEAM_HOURS_THREE} person-hours, ${EACH_THREE} hours each, which keeps the week within the budget; pending faculty approval.`,
              'The AI usage statement goes in the review file. Any AI-suggested SysML must pass the checker and be explained by its owner; the tool’s generated text counts as a tool output you review, not as your work until you have checked it against Week 5.',
            ],
            why: 'Unambiguous deliverables and minimums prevent careful work on the wrong thing, and stating the load per person makes the team-size rule visible.',
            figure: 'Read the three file bars, then the last bar with the deadline.',
            examples: [`Person-hours by task (team of four): ${LAB11_PERSON_HOURS.map((t) => `${t.task} ${t.hours}`).join('; ')}.`, 'Grading mode: formative this week; a faculty decision may make the Week 14 model the summative baseline.'],
            misconceptions: [{ claim: 'Interfaces the tool generated need no review.', correction: 'The tool writes what your Week 5 record and your choices say; the crossings and directions are yours to check.' }],
            transition: 'Start now: the crossings of your interfaces.',
            timing: '3 min: 1 min the files, 1 min minimums, 1 min workload and AI.',
          },
        },
        {
          id: 'w11s2-lab-map',
          title: 'Team work: what crosses your interfaces',
          subtitle: '12 minutes, in teams, in the Week 11 lab tool',
          purpose: 'Run the first lab steps in class with the instructor circulating: import the two files, link the part definitions, place new functions, and set the crossings of the interfaces.',
          minutes: 12,
          layout: 'figure-bullets',
          figure: {
            id: 'w11s2-lab-map',
            caption: 'In class: import, link and place, set the crossings, preview the ports in the lab tool. Course illustration, not SysML v2 graphical notation.',
            alt: 'Four bars stacked top to bottom, joined by arrows: 2 min · import both files; 2 min · link part definitions, place new functions; 7 min · each interface: items and directions; 1 min · preview ports and flows.',
          },
          body: [{ kind: 'bullets', items: ['Import your Week 10 model and your Week 5 export', 'Link each Week 8 or 9 part definition; place Week 10’s new functions', 'Each interface: every crossing as an item, with its direction', 'Preview the ports and flows'] }],
          sources: [],
          notes: {
            teach: [
              'Set a visible 12-minute timer. One laptop per team drives the lab tool; another member holds the Week 5 interface table open to check the tool against it.',
              'Minutes 0 to 2: import. Each team imports its Week 10 model file and its Week 5 model-inputs file and checks that the tool shows its own enterprise. If a file is refused, read the message with the team: the usual causes are the AeroLink example, the Week 10 behavior review instead of the model file, or the Week 4 file instead of the Week 5 one.',
              'Minutes 2 to 4: link and place. Link each Week 8 or 9 part definition in Physical to the element it stands for; give every function added in Week 10 the physical element that performs it.',
              'Minutes 4 to 11: the crossings. For each physical and information interface, check every crossing: is it an item of the model, and is the direction right? Where the tool says a direction was assumed, decide it. Where a crossing has no item, add one. Ask each table: which end produces this item in your Week 4 information view?',
              'Last minute: preview. Find one port definition and its conjugate, and one flow, in the generated text.',
            ],
            why: 'Starting the crossings with the instructor in the room prevents a week spent on interfaces whose items flow the wrong way.',
            figure: 'Point at the four bars in order as the timer passes each phase.',
            examples: ['A typical first mistake: a physical crossing named as prose, “clients and their bags”, left without an item. Ask what kind of thing crosses and add it as a material item.'],
            misconceptions: [{ claim: 'The direction does not matter if the item is right.', correction: 'The direction decides which port has the item out and which in; reversed, the model says the other element produces it.' }],
            transition: 'Checkpoint: show the instructor one interface.',
            timing: '12 min: 2 import, 2 link and place, 7 crossings, 1 preview.',
          },
        },
        {
          id: 'w11s2-lab-checkpoint',
          title: 'Instructor checkpoint',
          subtitle: 'Per team: one interface, its port definition, one direction',
          purpose: 'Catch the common errors early: each team shows one interface with its crossings, its port definition and conjugate, and justifies one direction.',
          minutes: 5,
          layout: 'bullets',
          body: [{ kind: 'bullets', items: ['Show: one interface and its crossings', 'Show: the port definition and which end is conjugate', 'Justify one direction from Week 4', 'Note one fix to make before day 2'] }],
          sources: [],
          notes: {
            teach: [
              'Visit each team for about a minute. Ask to see one physical or information interface and its crossings; the port definition, read from end A, and which end is typed by the conjugate; and one direction justified from the Week 4 information view: which element produces the item?',
              'Typical findings: a crossing left as prose with no item; a direction set against the Week 4 producer; a Week 8 part definition left unlinked without a reason; a function added in Week 10 with no physical element.',
              'Each team leaves with one fix noted for day 2. A team whose import failed books a slot with the teaching assistant before day 2; the Week 10 model must be importable before anything else can proceed.',
            ],
            why: 'A one-minute check per team catches the errors that would otherwise repeat across every interface.',
            transition: 'Close with the next seven days.',
            timing: '5 min: about a minute per team, run while teams continue.',
          },
        },
        {
          id: 'w11s2-lab-close',
          title: 'Close: the next seven days',
          subtitle: 'Quiz Q11 and the applied exercise open today. Log your hours.',
          purpose: 'Give the out-of-class plan with lead roles, the assessments and the time log.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w11s2-seven-days',
            caption: 'A suggested seven-day plan for Lab L11, with the lead role for each task (course convention). Course illustration, not SysML v2 graphical notation.',
            alt: `A plan of days 1 to 7, one bar per task across the days it takes: ${SEVEN_DAY_PLAN.map((p) => `${p.task}, day${p.from === p.to ? ` ${p.from}` : `s ${p.from} to ${p.to}`}`).join('; ')}.`,
          },
          body: [],
          sources: [],
          notes: {
            teach: [
              'Walk the plan once; it is a suggestion, and the team charter decides. Parts and placements first, because the allocation reads them; the crossings before the interface requirements, because the suggested functions read the crossings; the satisfy claims after both; the checker runs before the review, because the review often changes the model.',
              `Assessment: readiness quiz Q11, individual, about 15 minutes, and the individual applied exercise on an unseen case, about ${EXERCISE_MINUTES} minutes; graduate students answer the graduate version of its fifth task. Everything is due before Week 12, Session 1. Log your hours: the workload estimate is tested against them.`,
            ],
            why: 'A concrete plan with owners turns the brief into daily actions and makes individual accountability visible.',
            figure: 'Read the bars left to right; point at day 6, the review and audit, after day 5, the checker runs.',
            misconceptions: [{ claim: 'The satisfy claims can be written first.', correction: 'A claim needs its element modeled and its subject linked; write it after the parts and placeholders.' }],
            transition: 'End of Week 11. Week 12 verifies what this week claims.',
            timing: '2 min: 1.5 min plan and assessment, 30 s questions.',
          },
        },
        {
          id: 'w11s2-references',
          title: 'References and credits',
          purpose: 'List every source the session cites, with the license statements the sources require.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while teams pack up; no commentary is needed. The list is generated from every citation in the session, with the training deck’s license statement and SEBoK’s required attribution.'],
            why: 'Students should be able to find every source the session relied on, and the sources’ licenses require the attribution.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the close.',
          },
        },
      ],
    },
  ],
  // ============================================================================================ student lesson
  studentLesson: [
    {
      id: 'w11s2-l-flows',
      title: 'Flows and bindings: transfer or equality',
      blocks: [
        { kind: 'para', text: 'Three drafts of one coolant connection showed the distinction this session rests on. A flow moves an item from an out feature of one end to an in feature of the other; written the other way round it says the opposite element produces the item. A binding moves nothing: it asserts that the two features it joins have equal values in the same context, at all times. The checker accepted all three drafts, because none breaks a rule of the language; only the first says what the designer meant.' },
        { kind: 'figure', slide: 'w11s2-warmup-reveal' },
      ],
      sources: [R('R71', '24'), R('R71', '26'), R('R81', '96')],
    },
    {
      id: 'w11s2-l-interfaces',
      title: 'Connections, interfaces and interface media',
      blocks: [
        { kind: 'para', text: 'A connection definition is a part definition whose usages connect its ends; a connection usage connects two features in a context, named with dot notation. A connection between two parts is often logical: it abstracts away how they are joined. The alternative models the medium itself, a cable, a pipe, a network, as a part between them. The course writes the Week 5 medium into each interface’s documentation and keeps the connection logical; that is why a network element such as the AeroLink communications infrastructure performs no function and connects nothing directly.' },
        { kind: 'figure', slide: 'w11s2-connections' },
        { kind: 'para', text: `An interface definition is a connection definition whose ends are ports, and an interface usage connects two compatible ports, with the shorthand interface name : Definition connect a.p to b.q. Flows written inside the interface definition are established wherever it is used. Each flow runs from the end where the item is out to the end where it is in; in the AeroLink charging interface there are ${numberWord(IF5.flows.length)}, one per Week 5 crossing.` },
        { kind: 'figure', slide: 'w11s2-interface-def' },
        { kind: 'figure', slide: 'w11s2-flows' },
        { kind: 'para', text: 'A binding is used for delegation: an element’s outer port says the element offers an item, and a binding equates that port feature with the out item of the component inside that produces it. The notation feature = expression is also a binding, not a starting value. Where your Week 5 interface ends on an element whose component does the work, a binding shows which component.' },
        { kind: 'figure', slide: 'w11s2-binding' },
        { kind: 'para', text: `An organizational interface records an agreement between owners; SEBoK counts procedures and documents among an enterprise’s physical interfaces. Since nothing flows across it, the course writes it as a plain connection between the two parts with the agreement in its documentation, and gives it no ports. AeroLink has ${COUNTS.physicalIfs} physical, ${COUNTS.informationIfs} information and ${COUNTS.organizationalIfs} organizational interfaces; ${physicalName(hub.id)} is an end of ${hub.n} of them, the hub its central-control decision created.` },
        { kind: 'figure', slide: 'w11s2-organizational' },
        { kind: 'figure', slide: 'w11s2-worked-interfaces' },
        { kind: 'para', text: 'The table below lists every AeroLink interface as model v0.4 writes it: its kind, the construct it becomes, its two ends and each crossing with its direction. Read it the way a reviewer would. For each information interface, is every item produced at the end it leaves, according to the Week 4 information view? For each physical interface, is every crossing named as an item of the right kind? For each organizational interface, is it true that nothing crosses? Two patterns are worth noticing. An item that crosses both ways, such as the flight intent sent and the acceptance returned over the air traffic interface, appears as two features of the port definition, one out and one in. And the operations center is an end of most interfaces, the hub the Week 4 choice of central control created; SEBoK’s modularity practice asks a reviewer to check that each of those interfaces is needed.' },
        { kind: 'table', header: ['Interface', 'Kind and construct', 'Ends', 'Crossings'], rows: INTERFACE_ROWS.map((r) => [`${r.id} ${r.name}`, `${r.kind}: ${r.construct}`, r.ends, r.flows.join('; ') || 'none: an agreement']), caption: 'The AeroLink interfaces in model v0.4, read from the generated model (FICTIONAL)' },
        { kind: 'para', text: 'Two modeling choices in that table are the course’s, and you may meet others in practice. First, the medium of an interface is written into its documentation, not modeled as a part, so every interface is a logical connection between the two elements that exchange; a team that needs to analyze its network as a shared resource would model the network as a part and connect through it. Second, an organizational interface is a connection with no ports; a team that wants to show the documents an agreement exchanges, contracts, reports, schedules, would treat those documents as information items and the interface as an information interface. Either choice is defensible if it is stated and applied consistently.' },
      ],
      sources: [R('R71', '18–19'), R('R71', '22'), R('R71', '24–28'), R('R81', '96'), R('R81', '106'), R('R81', '109'), R('R81', '112'), R('R81', '116'), R('R20c', '597'), R('R20c', '603')],
    },
    {
      id: 'w11s2-l-requirements',
      title: 'Interface requirements, allocation and the open items',
      blocks: [
        { kind: 'para', text: 'An interface requirement is the form of functional requirement that deals with an interaction of a system across an interface boundary with another system; it is written by identifying the boundary and the interactions, defining what crosses and the media, and then writing the requirement. Interface management takes interface requirements as inputs and produces interface specifications; in this course the model becomes that specification. Because most Week 9 models imported only the Week 1 and Week 2 records, the Week 11 tool writes each Week 5 interface requirement the model lacks into Requirements, derived from its Week 5 parents, with the interface definition as its subject (a course convention).' },
        { kind: 'figure', slide: 'w11s2-interface-req' },
        { kind: 'para', text: `Each interface requirement is allocated twice: to the interface usage that carries the interaction, and to the function at one of its ends that realizes it. For AeroLink this closes the items Week 10 deferred: ${ifReqs.map((o) => `${o.item} (${o.now.replace(/\.$/, '').charAt(0).toLowerCase()}${o.now.replace(/\.$/, '').slice(1)})`).join('; ')}.` },
        { kind: 'figure', slide: 'w11s2-req-allocation' },
        { kind: 'table', header: ['Open item', 'Deferred in', 'What model v0.4 does'], rows: OPEN_ITEMS.map((o) => [o.item, o.from, o.now]), caption: 'The open items earlier weeks deferred to Week 11, and their status in AeroLink model v0.4 (FICTIONAL)' },
        { kind: 'para', text: `${listOf(stillOpen.map((o) => o.item))} stays open: its value is not agreed, so allocating it would claim more than the case knows. An open item is closed when its facts allow; otherwise it is re-dated with its reason and owner.` },
      ],
      sources: [R('R13', '563'), R('R57', '411'), R('R81', '110'), R('R20c', '601')],
    },
    {
      id: 'w11s2-l-satisfy',
      title: 'Satisfy claims and their basis',
      blocks: [
        { kind: 'para', text: `A satisfy requirement usage asserts that a requirement evaluates to true when a given feature is bound to its subject; the satisfying feature follows the keyword by. The feature must be of the subject’s type, which is why Session 1 specialized the Week 9 placeholders. In AeroLink model v0.4 the charging systems redefine their charge time with the Week 3 current best estimate, ${DV[0].cbe} ${DV[0].unit} against a limit of ${DV[0].threshold} ${DV[0].unit}, and a satisfy claim binds them to the requirement, with its basis in the documentation; the aircraft’s noise estimate, ${DV[1].cbe} against ${DV[1].threshold} ${DV[1].unit}, supports a second claim.` },
        { kind: 'figure', slide: 'w11s2-satisfy' },
        { kind: 'para', text: 'Writing a defensible claim takes four decisions. Which requirement: one whose subject is a physical element you have modeled, through the Week 9 placeholder its definition specializes; a requirement whose subject is the enterprise or a logical element is satisfied at that level, not by a physical part. Which element: the part whose type conforms to the subject, so that the binding is about the element the requirement names. Which design value: the attribute the requirement constrains, with the value your design is estimated or measured to have, in the requirement’s unit. Which basis: the analysis, estimate or supplier figure the value comes from, written in the claim’s documentation. A claim that cannot answer the last question is a wish, and the lab tool asks for the basis before it counts the claim.' },
        { kind: 'para', text: 'A claim is an assertion, not evidence: the model is consistent only if the design value really meets the limit, and Week 12 plans the verification that shows it. A requirement group can be satisfied as a whole when each member’s subject is bound to a feature of the group’s subject, the pattern Week 9 previewed; this week each requirement is claimed on its own.' },
        { kind: 'figure', slide: 'w11s2-predict' },
      ],
      sources: [R('R83', '162'), R('R83', '168')],
    },
    {
      id: 'w11s2-l-review',
      title: 'What the checker cannot see, and the review that can',
      blocks: [
        { kind: 'para', text: `Over the week the course checker rejected ${rejected.map((c) => c.what.toLowerCase()).join('; ')}. It accepted ${accepted.map((c) => `${c.what.toLowerCase()}${c.result === 'PASS with warnings' ? ' (with one warning)' : ''}`).join('; ')}. Each accepted file is wrong in meaning; the satisfy predict file drew only a warning about types.` },
        { kind: 'figure', slide: 'w11s2-calibration' },
        { kind: 'figure', slide: 'w11s2-common-errors' },
        { kind: 'para', text: `The interface review checklist turns those limits into ${numberWord(REVIEW_CHECKS.length)} recorded checks, each met or a finding with a note: ${REVIEW_CHECKS.map((c) => c.id).join(', ')}. The lab tool shows the evidence it can compute; the judgment is the team’s.` },
        { kind: 'figure', slide: 'w11s2-checklist' },
        { kind: 'table', header: ['Check', 'What the tool shows'], rows: REVIEW_CHECKS.map((c) => [c.text, c.tool]), caption: 'The interface review checklist (course convention) and the evidence the lab tool computes for each check' },
        { kind: 'figure', slide: 'w11s2-mapping' },
        { kind: 'para', text: 'The full mapping the lab tool applies is below. It is a course convention: the SysML v2 texts give the constructs, not a method for moving a document package into a model. Every row keeps the Phase I ID as a quoted short name, so the element can be found in the model by the ID your Week 4 and Week 5 tables use.' },
        { kind: 'table', header: ['Phase I element', 'From', 'Becomes', 'Where'], rows: W11_MAPPING.map((m) => [m.artifact, m.from, m.becomes, m.where]), caption: 'The Week 11 artifact-to-model mapping (course convention)' },
        { kind: 'para', text: 'Next week verification cases verify your requirements, each satisfy claim gets a plan for its evidence, and the digital thread is audited from need to verification. Keep every physical element, component, interface and item ID stable; Week 12 reads them all.' },
      ],
      sources: [R('R81', '93'), R('R81', '106'), R('R83', '162'), R('R20c', '601')],
    },
  ],
}
