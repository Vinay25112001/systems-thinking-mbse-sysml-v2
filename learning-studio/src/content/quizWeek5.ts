// Week 5 readiness quiz Q5 (individual, formative), kept separate from the lecture (DECISION_LOG A20). Every item is
// answerable from the Week 5 lectures and the detailed lesson: `lecture` names the slide that teaches it and the lesson
// section that explains it, and the item cites the register page its key rests on. Every option's explanation names the
// slide by id and a register page. Contexts are unseen and never AeroLink (no AeroLink element, interface or figure ids).
// Keys are authored across a–d, three each, and the key's length rank among the four options (1 = longest … 4 = shortest)
// occurs exactly three times per rank with no run of three, so no "pick the n-th longest" rule scores above 25 %. No key
// is a length outlier (1.4 × / 0.7 ×), the farthest-by-length option is the key at most three times, no key is a middle
// option standing apart from a near-equal distractor pair, and keys echo no distinctive stem word (quizWeek5.test.ts
// asserts each rule and shows each can fail). Items resting on a course convention say so in `courseSource` and in the
// key's explanation. New items, pending independent review.
import type { QuizQuestion } from './schema'

const PENDING = 'new-pending-review' as const

export const WEEK5_QUIZ: QuizQuestion[] = [
  {
    id: 'w5q-1', bloom: 'Understand', objective: 'W5.1', review: PENDING,
    prompt: 'A hospital is defining the system that will run its emergency department. Which statement about what may count as a system element is right?',
    options: [
      { id: 'a', text: 'Triage nurses, the triage procedure, patient records and the waiting room can each be elements', correct: true, explanation: 'Correct. The ISO/IEC/IEEE 15288 list SEBoK quotes includes humans, procedures, data and facilities as well as hardware and software (Session 1, slide w5s1-system-element; R20c p.597).' },
      { id: 'b', text: 'The software and its servers are elements, and the nurses are users outside the system', correct: false, explanation: 'Humans are on the 15288 list of system elements; operator roles appear in SEBoK’s own table of element types (Session 1, slide w5s1-system-element; R20c p.597).' },
      { id: 'c', text: 'Hardware and software are elements, while procedures and rooms belong to the concept of operations', correct: false, explanation: 'Procedures (e.g., operator instructions) and facilities are system elements in the 15288 list (Session 1, slide w5s1-system-element; R20c p.597).' },
      { id: 'd', text: 'A part counts as an element when it is complex enough to be broken down again', correct: false, explanation: 'This inverts the component idea: an element is a discrete part that can be implemented, and SEBoK’s component discussion puts the component level where elements are no longer considered complex (Session 1, slide w5s1-system-element; R101 p.1467).' },
    ],
    cite: { reading: 'R20c', pages: '597' },
    lecture: { week: 5, session: 1, slide: 'w5s1-system-element', section: 'w5-lesson-elements' },
  },
  {
    id: 'w5q-2', bloom: 'Apply', objective: 'W5.1', review: PENDING,
    prompt: 'A campus shuttle team places eleven elements directly under the system at the first level of its breakdown, among them vehicles, drivers, dispatch software and stop signs. What should the reviewer advise?',
    options: [
      { id: 'a', text: 'Reject it: a level may hold seven elements at most, so four must be removed', correct: false, explanation: 'Five plus or minus two is a common guideline for keeping a level manageable, not a hard limit, and the answer to a crowded level is grouping, not deleting elements (Session 1, slide w5s1-layers; R20c p.597).' },
      { id: 'b', text: 'Keep it: the guideline counts the parts of the whole system, not the elements at any one level', correct: false, explanation: 'SEBoK applies the guideline to the number of elements in one level of the structure (Session 1, slide w5s1-layers; R20c p.597).' },
      { id: 'c', text: 'Consider grouping them in a few subsystems; the count is a guideline', correct: true, explanation: 'Correct. Grouping into an intermediate layer keeps each level to a few elements; five plus or minus two is a guideline, so the team may keep a larger level if it is easier to manage (Session 1, slide w5s1-layers; R20c p.597).' },
      { id: 'd', text: 'Perhaps keep it and split the drivers out, as people are usually not counted at a level', correct: false, explanation: 'Humans are system elements and count like any other element at their level (Session 1, slide w5s1-layers; R20c p.597).' },
    ],
    cite: { reading: 'R20c', pages: '597' },
    lecture: { week: 5, session: 1, slide: 'w5s1-layers', section: 'w5-lesson-elements' },
  },
  {
    id: 'w5q-3', bloom: 'Understand', objective: 'W5.1', review: PENDING,
    prompt: 'A ferry operator buying a new vessel keeps two hierarchies. One lists hull, propulsion, navigation suite and ticket kiosks. The other has those four plus program management, crew training and sea trials. Which reading is right?',
    options: [
      { id: 'a', text: 'The first is the WBS, because each product it lists is a package of paid work', correct: false, explanation: 'The first lists only the products; a WBS decomposes the whole scope of work, including management and testing (Session 1, slide w5s1-breakdown-wbs; R104 p.104).' },
      { id: 'b', text: 'The second is the WBS: it decomposes the whole scope of work, products and support', correct: true, explanation: 'Correct. A WBS decomposes the scope of work, the work that delivers the system, into product-oriented elements, so management, training and trials belong in it; the first hierarchy breaks down the system itself (Session 1, slide w5s1-breakdown-wbs; R104 p.104).' },
      { id: 'c', text: 'Neither is a WBS, since a WBS lists activities such as install and test', correct: false, explanation: 'DoD guidance asks for WBS elements defined as outcomes, not actions (Session 1, slide w5s1-breakdown-wbs; R104 p.104).' },
      { id: 'd', text: 'Split the second: products and management may not share a WBS', correct: false, explanation: 'A WBS decomposes the whole scope of work, so the management work sits in it beside the products (Session 1, slide w5s1-breakdown-wbs; R104 p.104).' },
    ],
    cite: { reading: 'R104', pages: '104' },
    lecture: { week: 5, session: 1, slide: 'w5s1-breakdown-wbs', section: 'w5-lesson-breakdown' },
  },
  {
    id: 'w5q-4', bloom: 'Apply', objective: 'W5.3', review: PENDING,
    prompt: 'A food-bank network lists four interfaces: (1) a partner’s refrigerated truck docks at the warehouse bay; (2) the warehouse app sends stock levels to the allocation service; (3) an agreement sets which pantry collects on which day; (4) a public donor portal posts pledges to the network’s database. Which typing follows the course convention?',
    options: [
      { id: 'a', text: '1 physical, 2 information, 3 organizational, 4 external, a fourth type of interface', correct: false, explanation: 'In the course convention external is a flag on an interface, not a type; the portal link is an information interface flagged external (Session 1, slide w5s1-typing; R57 p.411).' },
      { id: 'b', text: '1 organizational, 2 information, 3 organizational, 4 information', correct: false, explanation: 'Who owns the truck does not change what crosses the bay: chilled goods and a mechanical connection make it physical (Session 1, slide w5s1-typing; R57 p.411).' },
      { id: 'c', text: '1 physical, 2 information, 3 information, 4 information, with 4 flagged external', correct: false, explanation: 'In the course convention an agreement that sets duties is organizational and carries no flow, even though it is written down (Session 1, slide w5s1-typing; R57 p.411).' },
      { id: 'd', text: '1 physical, 2 information, 3 organizational, 4 information (external flag)', correct: true, explanation: 'Correct. Under the course convention goods cross a physical interface, data an information one, duties an organizational one with no flow, and external is a flag (Session 1, slide w5s1-typing; R57 p.411).' },
    ],
    courseSource: 'Session 1, slide w5s1-typing: the three interface types (physical, information, organizational) with external as a flag are a course convention, consistent with MITRE’s functional and physical connections at boundaries',
    cite: { reading: 'R57', pages: '411' },
    lecture: { week: 5, session: 1, slide: 'w5s1-typing', section: 'w5-lesson-typing' },
  },
  {
    id: 'w5q-5', bloom: 'Apply', objective: 'W5.2', review: PENDING,
    prompt: 'A library system’s symmetric N² chart has four elements whose interface counts (degrees) are 4, 3, 3 and 2; two of the elements share two separate interfaces. How many interfaces must integration verify?',
    options: [
      { id: 'a', text: 'Six, as each is counted at both of its ends', correct: true, explanation: 'Correct. Under the course convention each interface has two ends, so the degrees sum to twice the count: (4 + 3 + 3 + 2) / 2 = 6, and every one must be verified (Session 1, slide w5s1-n2; R22 p.630).' },
      { id: 'b', text: 'Twelve, the sum of the degrees along the rows', correct: false, explanation: 'Each interface has two ends, so summing the degrees counts every interface twice (Session 1, slide w5s1-n2; R22 p.630).' },
      { id: 'c', text: 'Five, since one pair’s two interfaces count as one', correct: false, explanation: 'Two interfaces between the same pair are two interfaces, each with its own two ends, so the degrees still sum to twice six (Session 1, slide w5s1-n2; R22 p.630).' },
      { id: 'd', text: 'Four, the highest degree in the chart, since the hub caps the total', correct: false, explanation: 'The highest degree marks the hub; it does not cap the number of interfaces, which here is larger (Session 1, slide w5s1-n2; R22 p.630).' },
    ],
    courseSource: 'Session 1, slide w5s1-n2: elements on the diagonal, each symmetric interface written once, degrees summing to twice the number of interfaces are a course convention for the N-squared diagram SEBoK uses in integration',
    cite: { reading: 'R22', pages: '630–631' },
    lecture: { week: 5, session: 1, slide: 'w5s1-n2', section: 'w5-lesson-n2' },
  },
  {
    id: 'w5q-6', bloom: 'Analyse', objective: 'W5.4', review: PENDING,
    prompt: 'A water utility’s two pumping-station controllers exchange tank levels with each other over a cellular network leased from a telecom carrier. Both controllers belong to the utility. How should the requirements treat this link?',
    options: [
      { id: 'a', text: 'As an internal exchange, since both controllers belong to the utility', correct: false, explanation: 'The data exchange is internal, but its transport is not part of the system, so there is also an external interface to define (Session 1, slide w5s1-external-hidden; R55 p.369).' },
      { id: 'b', text: 'As an internal data exchange plus a hidden external interface to the carrier', correct: true, explanation: 'Correct. An internal interface over a transport the system does not own is a hidden external interface, and all external interfaces belong in the requirements (Session 1, slide w5s1-external-hidden; R55 p.369).' },
      { id: 'c', text: 'As an external interface between two stations that are miles apart', correct: false, explanation: 'Distance does not make an interface external; ownership of the ends and of the medium does (Session 1, slide w5s1-external-hidden; R55 p.369).' },
      { id: 'd', text: 'As an organizational interface, since the carrier lease is an agreement with no flow', correct: false, explanation: 'The lease is an agreement, but the tank levels really travel over the carrier’s network, which the requirements must capture (Session 1, slide w5s1-external-hidden; R54 p.331).' },
    ],
    cite: { reading: 'R55', pages: '369' },
    lecture: { week: 5, session: 1, slide: 'w5s1-external-hidden', section: 'w5-lesson-external' },
  },
  {
    id: 'w5q-7', bloom: 'Apply', objective: 'W5.3', review: PENDING,
    prompt: 'A regional transit authority runs a fare system that buses, ferries and a light-rail line depend on. In which situation is an interface control working group (ICWG) the right tool?',
    options: [
      { id: 'a', text: 'One engineer owns both ends of an internal interface and wants a second view of its timing', correct: false, explanation: 'One engineer can settle this, or ask a colleague; an ICWG is for issues engineer-to-engineer interaction cannot resolve (Session 2, slide w5s2-governance; R57 p.414).' },
      { id: 'b', text: 'The team wants a standing group to approve every routine rename of a fare field', correct: false, explanation: 'Most interface issues are settled engineer to engineer; the working group exists for the ones that cannot be, and a routine rename is not one (Session 2, slide w5s2-governance; R57 p.414).' },
      { id: 'c', text: 'The project wants a monthly forum to rank risks and name owners', correct: false, explanation: 'That is a risk board; an ICWG exists to solve interface issues between interfacing activities (Session 2, slide w5s2-governance; R57 p.414).' },
      { id: 'd', text: 'Three operators’ engineers have argued over the fare record format for weeks without resolving it', correct: true, explanation: 'Correct. An ICWG brings technical representatives of the interfacing activities together to solve interface issues that engineer-to-engineer interaction has not resolved (Session 2, slide w5s2-governance; R57 p.414).' },
    ],
    cite: { reading: 'R57', pages: '414' },
    lecture: { week: 5, session: 2, slide: 'w5s2-governance', section: 'w5-lesson-governance' },
  },
  {
    id: 'w5q-8', bloom: 'Understand', objective: 'W5.4', review: PENDING,
    prompt: 'A campus shuttle team writes up the link between each vehicle’s onboard unit and the dispatch office in three steps. Which line is the product of the third step?',
    options: [
      { id: 'a', text: 'The vehicle unit and dispatch interact across the boundary between vehicle and depot networks', correct: false, explanation: 'Naming the boundary and the interactions across it is the first step (Session 1, slide w5s1-interface-reqs; R13 p.563).' },
      { id: 'b', text: 'Position reports: latitude, longitude and time, every 5 s, over the campus LTE network', correct: false, explanation: 'Describing what crosses the boundary and the medium is the second step (Session 1, slide w5s1-interface-reqs; R13 p.563).' },
      { id: 'c', text: 'The vehicle unit shall send its position to dispatch as defined in ICD 7, Table 2', correct: true, explanation: 'Correct. The third step writes the requirement, which points to the definition from step two (Session 1, slide w5s1-interface-reqs; R13 p.563).' },
      { id: 'd', text: 'Dispatch shall be easy to integrate with the vehicles of future vendors', correct: false, explanation: 'A “shall” does not make an interface requirement: this names no interaction or definition and cannot be verified (Session 1, slide w5s1-interface-reqs; R13 p.563).' },
    ],
    cite: { reading: 'R13', pages: '563' },
    lecture: { week: 5, session: 1, slide: 'w5s1-interface-reqs', section: 'w5-lesson-requirements' },
  },
  {
    id: 'w5q-9', bloom: 'Analyse', objective: 'W5.3', review: PENDING,
    prompt: 'A hospital’s interface table has this row: LAB-7 | blood analyzer → results database | carries test results | hospital LAN | owner: (blank) | on failure the analyzer stores 24 h of results. What is wrong with the row?',
    options: [
      { id: 'a', text: 'Recording the medium is a mistake; that detail goes in the ICD alone', correct: false, explanation: 'The medium is part of defining what crosses the boundary and how; the table describes every interface with one consistent set of attributes (Session 1, slide w5s1-table; R57 p.413).' },
      { id: 'b', text: 'Nobody is named as accountable for the interface or its changes', correct: true, explanation: 'Correct. Owner is one of the course’s table columns (a course convention), and MITRE asks that every interface be described with the same set of attributes (Session 1, slide w5s1-table; R57 p.413).' },
      { id: 'c', text: 'The arrow should go, since an N² chart records each interface once, as a symmetric pair', correct: false, explanation: 'A symmetric N² chart is one way to find interfaces; the table still records which way the results flow (Session 1, slide w5s1-table; R57 p.413).' },
      { id: 'd', text: 'Failure behavior belongs in the analyzer’s own specification instead', correct: false, explanation: 'In the course columns, each side’s behavior when the interface fails is part of the interface definition (Session 1, slide w5s1-table; R57 p.413).' },
    ],
    courseSource: 'Session 1, slide w5s1-table: the interface table columns (including owner, direction and failure behavior) are a course convention applying MITRE’s advice to describe every interface with one consistent set of attributes',
    cite: { reading: 'R57', pages: '413' },
    lecture: { week: 5, session: 1, slide: 'w5s1-table', section: 'w5-lesson-table' },
  },
  {
    id: 'w5q-10', bloom: 'Apply', objective: 'W5.5', review: PENDING,
    prompt: 'A city library reviews four interfaces of its lending system. Under the course rule, which of them crosses a trust boundary?',
    options: [
      { id: 'a', text: 'The catalog search service that takes queries typed by members of the public on the website', correct: true, explanation: 'Correct. Under the course convention an interface crosses a trust boundary when an end accepts public input, among other tests; adversity often arrives through connected systems (Session 2, slide w5s2-trust-boundaries; R25 p.1234).' },
      { id: 'b', text: 'The link from the circulation server to its backup disk in the same locked server room', correct: false, explanation: 'Both ends are the library’s, with one owner, no public input and no public medium (Session 2, slide w5s2-trust-boundaries; R25 p.1234).' },
      { id: 'c', text: 'The cable from the staff desk scanner to the circulation server on the library’s wiring', correct: false, explanation: 'Both ends are the library’s and used by its staff, and the cable is the library’s own, so no course test is met (Session 2, slide w5s2-trust-boundaries; R25 p.1234).' },
      { id: 'd', text: 'The nightly job copying loan figures to the reporting database, run by IT', correct: false, explanation: 'Same owner, internal ends and an internal medium: none of the course tests is met (Session 2, slide w5s2-trust-boundaries; R25 p.1234).' },
    ],
    courseSource: 'Session 2, slide w5s2-trust-boundaries: the five tests for a trust-boundary crossing (an external end, different owners, public input, a public network, a radio medium) are a course convention',
    cite: { reading: 'R25', pages: '1234' },
    lecture: { week: 5, session: 2, slide: 'w5s2-trust-boundaries', section: 'w5-lesson-security' },
  },
  {
    id: 'w5q-11', bloom: 'Evaluate', objective: 'W5.5', review: PENDING,
    prompt: 'On a car ferry, the ramp controller unlocks the loading ramp only when the deck sensor unit reports “deck clear”. What should the interface definition say the controller does when those reports stop arriving?',
    options: [
      { id: 'a', text: 'Use the last report received, and assume the deck has not changed in seconds', correct: false, explanation: 'A stale “clear” can hide a vehicle that has just moved onto the deck; the missing report must not be read as the safe value (Session 2, slide w5s2-degraded; R24 p.1205).' },
      { id: 'b', text: 'Read the silence as “deck clear”, so that loading is not held up for passengers waiting ashore', correct: false, explanation: 'This fails unsafe: the missing status is treated as the permissive value (Session 2, slide w5s2-degraded; R24 p.1205).' },
      { id: 'c', text: 'Leave the ramp to the crew, as the interface carries data, not decisions', correct: false, explanation: 'Each interface definition states what each side does when it fails; leaving it out leaves the ramp’s behavior undefined (Session 2, slide w5s2-degraded; R24 p.1205).' },
      { id: 'd', text: 'Treat a missing report as “deck not clear” and keep the ramp locked until the link recovers', correct: true, explanation: 'Correct. Fail safe, as the course convention puts it: treat a missing status as the unsafe value, so the system degrades to a safe state (Session 2, slide w5s2-degraded; R24 p.1205).' },
    ],
    courseSource: 'Session 2, slide w5s2-degraded: stating each side’s failure behavior and treating a missing status as the unsafe value are a course convention applying SEBoK’s fail-safe and degrade-gracefully examples',
    cite: { reading: 'R24', pages: '1205' },
    lecture: { week: 5, session: 2, slide: 'w5s2-degraded', section: 'w5-lesson-degraded' },
  },
  {
    id: 'w5q-12', bloom: 'Evaluate', objective: 'W5.5', review: PENDING,
    prompt: 'A water utility’s eight control elements are joined today by 14 direct links between pairs. It proposes routing them all through a single new integration server, eight links in all. How should the proposal be judged?',
    options: [
      { id: 'a', text: 'Approve it: fewer element pairs means lower coupling, and so the network is more resilient', correct: false, explanation: 'A coupling count cannot see concentration risk; SEBoK lists modularity and resilience as separate aims (Session 2, slide w5s2-coupling; R20c p.599).' },
      { id: 'b', text: 'Reject it: the count of links to verify is unchanged however they are routed', correct: false, explanation: 'Routing through a hub replaces many pairwise interfaces with one per element, so fewer interfaces are defined and verified (Session 2, slide w5s2-coupling; R20c p.599).' },
      { id: 'c', text: 'Weigh fewer links to define and verify against one hub that can fail them all', correct: true, explanation: 'Correct. The hub cuts the interfaces to verify, but it concentrates them in a single point of failure, the concentration risk the lesson names; the coupling metric, a course convention, does not show that risk (Session 2, slide w5s2-coupling; R24 p.1205).' },
      { id: 'd', text: 'Probably reject it: a hub has the highest degree in the chart, which is usually a finding to fix', correct: false, explanation: 'A high-degree hub is worth noting, but the degree alone does not decide; the benefit has to be weighed against the risk (Session 2, slide w5s2-coupling; R24 p.1205).' },
    ],
    courseSource: 'Session 2, slide w5s2-coupling: the coupling metric κ and its blind spots (criticality, aggregation, concentration risk) are a course convention',
    cite: { reading: 'R24', pages: '1205' },
    lecture: { week: 5, session: 2, slide: 'w5s2-coupling', section: 'w5-lesson-coupling' },
  },
]
