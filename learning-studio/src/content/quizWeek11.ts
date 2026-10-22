// Week 11 readiness quiz Q11 (individual, formative), kept separate from the lecture (DECISION_LOG A20). Every item is
// answerable from the Week 11 lectures and the detailed lesson: `lecture` names the slide that teaches it and the lesson
// section that explains it; every option's explanation names that slide and cites the register page or training-deck
// slide the answer rests on (or, for a course convention, says so in courseSource and in the key). Contexts are unseen
// and never AeroLink, and none uses the applied exercise's setting (a rural water-kiosk network) or the lecture's own
// examples. Keys are spread a–d three times each, the key's length rank varies so that each rank occurs three times with
// no run of three, and the cue rules of the Weeks 3–10 quizzes apply (quizWeek11.test.ts). New items, pending independent
// review.
import type { QuizQuestion } from './schema'

const PENDING = 'new-pending-review' as const
type Opt = [id: 'a' | 'b' | 'c' | 'd', text: string, why: string]
/** An item: the key's id, its options with explanations, the citation the key rests on, the slide and lesson section.
 *  Training-deck citations (unit slide) are written “sl.”; specification and SEBoK pages “p.”/“pp.”. */
function item(id: string, bloom: QuizQuestion['bloom'], objective: string, prompt: string, key: Opt[0], opts: Opt[], cite: { reading: string; pages: string }, lecture: { session: 1 | 2; slide: string; section: string }, courseSource?: string): QuizQuestion {
  const deck = ['R70', 'R71', 'R72', 'R76'].includes(cite.reading)
  const ref = `slide ${lecture.slide}; ${cite.reading} ${deck ? 'sl' : `p${cite.pages.includes('–') ? 'p' : ''}`}.${cite.pages}`
  return {
    id,
    bloom,
    objective,
    review: PENDING,
    prompt,
    options: opts.map(([oid, text, why]) => ({ id: oid, text, correct: oid === key, explanation: `${oid === key ? 'Correct. ' : ''}${why} (${ref}).` })),
    cite,
    ...(courseSource ? { courseSource } : {}),
    lecture: { week: 11, session: lecture.session, slide: lecture.slide, section: lecture.section },
  }
}

export const WEEK11_QUIZ: QuizQuestion[] = [
  item('w11q-1', 'Understand', 'W11.1', 'A hospital laundry service writes down its physical architecture model. Which description matches the way SEBoK characterizes such a model?', 'c', [
    ['a', 'A list of the functions it performs, ordered by how long each of them usually takes', 'An ordered list of functions is part of the logical, behavioral view, not an arrangement of physical elements.'],
    ['b', 'The organization chart of the departments that run the laundry from day to day', 'An organization chart shows reporting lines; SEBoK’s physical model arranges system elements and the interfaces between them.'],
    ['c', 'System elements arranged with the interfaces that bind them into one solution', 'SEBoK describes a physical architecture model as an arrangement of physical elements, system elements and physical interfaces, that provides the solution (SEBoK p.596).'],
    ['d', 'A table of its requirements, each with the test that will verify it', 'A verification matrix traces requirements to tests; it describes no arrangement of elements.'],
  ], { reading: 'R20c', pages: '596' }, { session: 1, slide: 'w11s1-physical-arch', section: 'w11s1-l-physical' }),

  item('w11q-2', 'Analyse', 'W11.3', 'A ferry operator’s logical element Ticketing performs two functions: one runs on the ticket machines at each pier, the other in the head-office back end. How should Ticketing be allocated?', 'd', [
    ['a', 'To the head office, which holds the budget for the ticketing system', 'Budget ownership is not a criterion of the allocation; the functions decide where the element is realized.'],
    ['b', 'To no element until one element can host both of its functions', 'Partitioning may separate the functions of one logical element; it need not wait for one host.'],
    ['c', 'To the pier machines, because passengers see and use them', 'Visibility to passengers does not move the back-end function onto the machines.'],
    ['d', 'To both elements, each allocation refined by the function done there', 'An allocation can be refined by nested allocations, as the training deck shows for a logical part and the physical part that performs the same action (R76 sl.106).'],
  ], { reading: 'R76', pages: '106' }, { session: 1, slide: 'w11s1-allocate-l2p', section: 'w11s1-l-structure' }),

  item('w11q-3', 'Apply', 'W11.1', 'Last week a team wrote a part definition Scanner as the subject of a scanning-speed requirement. The physical view now names that element Barcode scanning station. What keeps the requirement’s subject valid?', 'a', [
    ['a', 'Make the station’s definition specialize Scanner', 'This is a course convention: the element’s definition specializes the earlier placeholder, so anything typed by it conforms to the requirement’s subject; a part can be at any level of abstraction (R81 p.90).'],
    ['b', 'Delete Scanner and write the requirement again from scratch', 'Deleting the subject breaks the requirement and its trace; the placeholder stays.'],
    ['c', 'Rename the requirement after the new station definition', 'The requirement’s name does not decide its subject’s type; the type relationship does.'],
    ['d', 'Add a comment beside Scanner that names the station', 'A comment carries no type relationship, so nothing typed by the station conforms to Scanner.'],
  ], { reading: 'R81', pages: '90' }, { session: 1, slide: 'w11s1-parts-physical', section: 'w11s1-l-structure' }, 'A course convention (slide w11s1-parts-physical): a Week 9 placeholder linked to an element is specialized by the element’s definition.'),

  item('w11q-4', 'Understand', 'W11.4', 'Two connected ports are both typed by one port definition whose single feature is out item report : Report. What can move between them?', 'b', [
    ['a', 'The report, from the first end of the connection to the second end', 'The order of the ends does not create an in feature; both ports still offer the report out.'],
    ['b', 'The report stays put, with no in feature at either end to take it', 'A transfer goes from an out feature to a matching in feature, and out does not match out (R81 p.93).'],
    ['c', 'The report, both ways, since each feature conforms to the other', 'Ports conform when each feature has a matching feature on the other, which these do not.'],
    ['d', 'The report, in whichever direction a flow is written', 'A flow written between two out features still has no in feature to deliver to.'],
  ], { reading: 'R81', pages: '93' }, { session: 1, slide: 'w11s1-directed-features', section: 'w11s1-l-ports' }),

  item('w11q-5', 'Apply', 'W11.4', 'A port definition MeterPort declares out item reading and in item command. What does a port typed ~MeterPort declare?', 'c', [
    ['a', 'An out reading and an in command, exactly as MeterPort has them', 'That is MeterPort itself; the conjugate reverses each direction.'],
    ['b', 'Two in items, reading and command, for a receiving end of a link', 'Conjugation reverses each direction; it does not make every feature in.'],
    ['c', 'An in reading and an out command, each direction reversed', 'The conjugated port definition has the same features with in and out reversed (R81 p.95).'],
    ['d', 'Two out items, reading and command, for a sending end', 'Conjugation reverses each direction; it does not make every feature out.'],
  ], { reading: 'R81', pages: '95' }, { session: 1, slide: 'w11s1-conjugation', section: 'w11s1-l-ports' }),

  item('w11q-6', 'Understand', 'W11.2', 'In a model of a city tram network, which declaration can be an end of an interface definition?', 'a', [
    ['a', 'A port typed by its port definition', 'An interface definition is a connection definition whose ends are restricted to be port definitions (R81 p.106).'],
    ['b', 'A part typed by a part definition', 'Parts can be connected by a connection, but an interface’s ends must be ports.'],
    ['c', 'An attribute typed by a quantity', 'An attribute is a value, not a connection point; it cannot be an interface end.'],
    ['d', 'An action typed by an action', 'An action is behavior; interface ends are ports.'],
  ], { reading: 'R81', pages: '106' }, { session: 2, slide: 'w11s2-interface-def', section: 'w11s2-l-interfaces' }),

  item('w11q-7', 'Analyse', 'W11.2', 'In a heating loop a team writes bind boiler.hotOut = radiator.hotIn; between the two parts. What does that line state?', 'd', [
    ['a', 'Heat moves from the boiler to the radiator as a flow', 'A transfer is a flow; this line is a binding.'],
    ['b', 'Heat moves in whichever direction the loop needs', 'A binding moves nothing in either direction.'],
    ['c', 'The radiator starts once the boiler has finished', 'Ordering is a succession; a binding asserts equality.'],
    ['d', 'Equal values for both features; nothing moves', 'A binding connection asserts the equivalence of the connected features, equal values in the same context (R71 sl.24).'],
  ], { reading: 'R71', pages: '24' }, { session: 2, slide: 'w11s2-binding', section: 'w11s2-l-flows' }),

  item('w11q-8', 'Apply', 'W11.2', 'Where should the flows of what crosses an interface be written so that each use of that interface carries them?', 'b', [
    ['a', 'In each part definition at the two ends of the interface', 'Flows written in the parts belong to the parts; using the interface does not bring them.'],
    ['b', 'In the interface definition, between its two port ends', 'Flows can be defined within an interface definition and are established when the interface is used (R71 sl.28).'],
    ['c', 'In the requirement that governs the interface', 'A requirement states what must hold; it does not establish a transfer.'],
    ['d', 'In a documentation comment on the interface usage', 'A comment is text; it establishes no flow.'],
  ], { reading: 'R71', pages: '28' }, { session: 2, slide: 'w11s2-flows', section: 'w11s2-l-interfaces' }),

  item('w11q-9', 'Evaluate', 'W11.3', 'A cleaning contractor and a hospital keep a service agreement that their Week 5 table recorded as an organizational interface. Nothing physical or informational crosses it. Which model element fits?', 'c', [
    ['a', 'An interface with two ports whose definition is empty', 'Empty ports would claim connection points for an exchange that does not exist; the course writes a connection instead.'],
    ['b', 'A flow of an item named after the agreement', 'A flow models a transfer, and nothing is transferred across an agreement.'],
    ['c', 'A connection joining both parts, the agreement written in its doc', 'This is a course convention: an organizational interface is a connection between the two parts with the agreement in its documentation; SEBoK counts procedures and documents as physical interfaces of an enterprise (SEBoK p.597).'],
    ['d', 'A binding that makes the two parts’ names equal', 'A binding asserts that two features have equal values; it records no agreement.'],
  ], { reading: 'R20c', pages: '597' }, { session: 2, slide: 'w11s2-organizational', section: 'w11s2-l-interfaces' }, 'A course convention (slide w11s2-organizational): an organizational interface becomes a connection with no ports.'),

  item('w11q-10', 'Understand', 'W11.5', 'Which of these statements is an interface requirement in SEBoK’s sense?', 'a', [
    ['a', 'The billing system shall send each invoice to the bank over the payment link', 'An interface requirement deals with an interaction of a system across an interface boundary with another system (SEBoK p.563).'],
    ['b', 'The billing system shall total each invoice to the nearest cent before it is issued', 'This constrains a function inside the system; nothing crosses a boundary.'],
    ['c', 'The billing team shall review the open invoices on Friday of each week', 'This is a procedure for staff, with no interaction across a system boundary.'],
    ['d', 'The bank shall be selected through a public tender before the system goes live', 'This is a procurement decision, not a requirement on an interaction.'],
  ], { reading: 'R13', pages: '563' }, { session: 2, slide: 'w11s2-interface-req', section: 'w11s2-l-requirements' }),

  item('w11q-11', 'Apply', 'W11.5', 'What does satisfy TankVolume by depot.tank; assert in a model?', 'b', [
    ['a', 'depot.tank has been measured against TankVolume in a recorded test', 'A satisfy asserts; it records no test. Evidence is planned later.'],
    ['b', 'TankVolume holds when depot.tank is bound to its subject', 'A satisfy requirement usage asserts that the requirement is satisfied when the given feature is bound to its subject parameter (R83 p.162).'],
    ['c', 'TankVolume is derived from a parent requirement on storage tanks', 'Derivation relates requirements to requirements; satisfy relates a requirement to a design element.'],
    ['d', 'depot.tank is the element responsible for realizing TankVolume', 'Responsibility is what an allocation states; satisfy asserts that the requirement holds.'],
  ], { reading: 'R83', pages: '162' }, { session: 2, slide: 'w11s2-satisfy', section: 'w11s2-l-satisfy' }),

  item('w11q-12', 'Evaluate', 'W11.4', 'A team’s model passes the course checker with no message. Which defect could it still contain?', 'd', [
    ['a', 'An interface definition whose two ends are part usages instead', 'An interface definition’s ends must be ports; the checker rejects part ends.'],
    ['b', 'A port typed by a port definition nobody declared', 'A name that does not resolve is rejected by the checker.'],
    ['c', 'A connection naming nested ports with :: separators', 'Nested features need dot notation; the checker rejects ::.'],
    ['d', 'A flow written from an in item to the matching out item', 'A flow transfers from an output to an input (R71 sl.27); the checker accepted a flow written the other way with no message, so only a review finds it.'],
  ], { reading: 'R71', pages: '27' }, { session: 1, slide: 'w11s1-checker', section: 'w11s1-l-checker' }),
]
