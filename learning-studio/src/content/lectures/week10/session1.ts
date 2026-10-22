// Week 10, Session 1 lecture: Logical / Behavioral Modeling — the logical architecture and action flows: logical versus
// physical architecture, the three views of a logical architecture, functions with their inputs and outputs, the SEBoK
// pitfalls, logical decomposition with part definitions and usages, capabilities, requirements allocated to functions,
// functions as action definitions and usages, perform and allocate, the AeroLink logical architecture, successions and
// flows, the then shorthand, decisions and merges, the semantics of guards, fork and join, item flows, the SCN-002 flow
// worked end to end, a predict item and a calibration of what the course checker can and cannot decide.
// 75-minute session: 69 minutes of planned content on 23 slides plus the generated "References and credits" slide, and
// a 6-minute buffer. Single source for the slide viewer, the faculty notes, the .pptx and the student lesson
// (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20 (teach first), A21 (the Week 1 architecture is the
// template; decision 9: AeroLink is the instructor reference only), A22/A23 (one continuous journey: Week 10 models the
// SAME enterprise's Week 2 ConOps and Week 4 architecture in the Week 9 model).
//
// Review status: new-pending-review. Written 2026-10-22 from docs/lectures/week10/WEEK10_LECTURE_OUTLINE.md §2, with the
// changes recorded in the milestone report: logical versus physical architecture and requirement allocation get their
// own slides; the AeroLink model is generated from the closed Phase I package (Week 2 and Week 4 cases) on top of model
// v0.2, not copied from the earlier reference files; the driving question shows the decision as a drawn card, so no
// checker result is visible before the vote; the predict item's result is revealed on the calibration slide.
//
// Accuracy rules followed:
//   - Every citation is a verified register entry at a page whose extracted text supports the claim beside it: R20b and
//     R20c are SEBoK Logical and Physical Architecture, R70-R73 and R76 the textual-notation training deck, R80-R82 the
//     SysML v2.1 Beta 2 Part 1 clauses 7.1, 7.11-7.16 and 7.17-7.18, R115 the Requirement Derivation library. The
//     specification is never called "the standard".
//   - Course conventions (capability as action definition, #derivedFrom, LOG IDs on part usages, step subsetting, the
//     item mapping) are labeled as such on the slide face.
//   - A checker PASS is never presented as correctness; recorded checker behavior is release 2026-08 only.
//   - Every listing is an excerpt of a checker-validated file (./listings.ts); AeroLink values are FICTIONAL and come from
//     ./aerolinkCase.ts (which reads the Week 2, 4 and 9 cases). Counts on slides are computed, never typed.
//   - Timing: spoken notes (teach, worked solution, figure walk) stay between 40 and 130 words per minute.
import type { Lecture } from '../types'
import { numberWord } from '../week01/aerolinkCase'
import { AEROLINK_W10_MODEL, AEROLINK_W9, COUNTS, FLOW_NODES, ITEM_FLOWS, UNALLOCATED, W10_NEW_ITEMS, fnOf, logicalOf, performerOf, scenarioOf } from './aerolinkCase'
import { CALIBRATION, listing, listingText } from './listings'

export const WEEK10_S1_REVIEW = 'new-pending-review' as const

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
const rejected = CALIBRATION.filter((c) => c.result === 'FAIL')
const accepted = CALIBRATION.filter((c) => c.result !== 'FAIL')
const SCN2 = scenarioOf('SCN-002')
const steps = FLOW_NODES.filter((n) => n.kind === 'step')
const decides = FLOW_NODES.filter((n) => n.kind === 'decide')
const alts = FLOW_NODES.filter((n) => n.kind === 'alt')
const merges = FLOW_NODES.filter((n) => n.kind === 'merge')
const F1 = fnOf('FN-001')
const F2 = fnOf('FN-002')
const F11 = fnOf('FN-011')
const F3 = fnOf('FN-003')
const L5 = logicalOf('LOG-005')
const itemName = (id: string) => AEROLINK_W10_MODEL.items.find((x) => x.id === id)?.name ?? id
const shared = (a: typeof F1, b: typeof F1) => a.outputs.filter((x) => b.inputs.includes(x)).map(itemName)
const predictRow = CALIBRATION.find((c) => c.file.endsWith('invalid_decide_target_declared.sysml'))!
const newInfo = W10_NEW_ITEMS.filter((x) => x.id)

export const WEEK10_SESSION1: Lecture = {
  week: 10,
  session: 1,
  title: 'Logical / Behavioral Modeling',
  subtitle: 'Session 1: Logical architecture and action flows',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. framing (7 min)
    {
      id: 'w10s1-framing',
      title: 'Framing: the ConOps and the architecture enter the model',
      slides: [
        {
          id: 'w10s1-title',
          title: 'Logical / Behavioral Modeling',
          subtitle: 'Session 1: Logical architecture and action flows',
          purpose: 'Orient students to the scheduled subject, the two sessions and the week’s output: the Logical and Behavior packages of model v0.3, built on the Week 9 model.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-week-band',
            caption: 'Week 10 fills two packages of your model: the Week 2 ConOps goes into Behavior, the Week 4 architecture into Logical; Requirements was filled in Week 9. Course illustration, not SysML v2 graphical notation.',
            alt: 'Two document cards at the top: Week 2 ConOps and Week 4 architecture. Thick arrows run down from them to two package boxes drawn strong, Behavior and Logical; beside them a faint box, Requirements, labeled Week 9. Below, a row labeled Phase II with the week numbers 8 to 14, number 10 highlighted, and the line: model v0.3 of your enterprise.',
          },
          body: [{ kind: 'bullets', items: ['Today: the logical architecture and action flows', 'Session 2: operating states, use cases, consistency checks, the Lab L10 launch', 'Your output: model v0.3 of your own enterprise'] }],
          sources: [],
          notes: {
            teach: [
              'Read the subject exactly as the schedule gives it: Logical / Behavioral Modeling. As in Week 9, nothing is invented this week. Your team wrote its ConOps scenarios in Week 2 and its functions, logical elements and information items in Week 4; this week those same elements become part of the model your team extended last week.',
              'Point at the strip. Week 8 built the skeleton and the stakeholders, Week 9 filled Needs and Requirements. The two packages still nearly empty are Logical and Behavior, and they are this week’s work. Week 11 then gives the logical elements physical homes, so what you model now is what Week 11 allocates.',
              'Say how the week runs. Today is all lecture: what a logical architecture is, how functions and logical elements become model elements, and how a ConOps scenario becomes an action flow. Session 2 adds operating states, use cases and the checks that tie them together, and launches the lab, where your team generates model v0.3 with the Week 10 lab tool.',
            ],
            why: 'Students who see where the week’s output sits in the Phase II chain can place each construct as it arrives, and hearing that nothing is invented keeps them anchored to their own Week 2 and Week 4 work.',
            figure: 'Trace the two arrows from the Phase I cards into Behavior and Logical, then point at Requirements, filled last week, and at week 10 in the strip.',
            examples: ['Instructor preparation (not for students): open AeroLink model v0.3 and the guard-gap listing in the course checker before class, in case a student asks to see a run; the live run is not on the plan today.', 'Timing plan: 69 minutes of content and a 6-minute buffer. If the session runs long, shorten the pitfalls slide or the then shorthand; never shorten the decide-and-merge slide, the guard reveal or the SCN-002 worked example.'],
            misconceptions: [{ claim: 'Week 10 starts a new behavior exercise in a modeling tool.', correction: 'Week 10 models the Week 2 scenarios and the Week 4 architecture the team already wrote, with the same IDs.' }],
            transition: 'First, a question about one decision written in the textual notation.',
            timing: '2 min: 1 min subject and output, 1 min the strip.',
          },
        },
        {
          id: 'w10s1-driving-question',
          title: 'Driving question: the flow is well formed. Does it always continue?',
          purpose: 'Create a need to know: a well-formed decision can still leave a case with no possible successor. The vote is answered on the guard reveal slide.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-gap-card',
            caption: 'A dispatch decision for a hospital patient-transfer service: three guarded branches on a triage score (lines wrapped for display). Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `A code card with these lines: ${cardAlt('guard-gap', 1, 8)}.`,
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Vote', text: 'A whole-number triage score arrives. Which is true?' },
            { kind: 'bullets', items: ['A · The flow always continues to one of the three actions', 'B · For some scores no successor is possible', 'C · The checker rejects this file', 'D · It cannot be told from the text'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the card aloud. A patient-transfer service receives a request and decides on a triage score, a whole number from 0 to 10: critical from 8 up, urgent from 4 up to but not including 8, routine below 3. It is deliberately not AeroLink, so nobody answers from memory of the case.',
              'Give the class thirty seconds, then take a show of hands for A, B, C and D. Do not reveal the answer. Write the counts on the board; we return to them after the slides on decisions and merges, when we have the vocabulary to say exactly what a decision promises.',
              'If someone argues for C, ask them to hold the thought: what the checker can and cannot see is the subject of the last slide but one today.',
            ],
            why: 'A prediction before instruction gives students a reason to attend to the semantics of guards, and options A and C plant the two misconceptions the session dismantles: that a decision always continues, and that the checker would catch it if it did not.',
            figure: 'Point at the three guards in turn and read their ranges; do not point at any number in particular.',
            misconceptions: [{ claim: 'A decision with three branches always takes one of them.', correction: 'A branch is possible only when its guard is true; if no guard holds and there is no else, no successor is possible.' }],
            transition: 'Before we answer it, see what this week takes from Phase I.',
            timing: '3 min: 1 min the card, 30 s to think, 1.5 min vote and the hold.',
          },
        },
        {
          id: 'w10s1-continuity',
          title: 'What Week 10 imports from Phase I',
          purpose: 'Make the continuity explicit: the Week 2 scenarios and capabilities and the Week 4 functions, logical elements and information items enter model v0.2, whose placeholders and waiting capability links they complete.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-import-lanes',
            caption: 'The sources of this week and the model packages they enter, with the ID prefixes that cross: SCN and CAP from the ConOps, FN, LOG and INFO from the architecture, and the placeholders of model v0.2. Course illustration, not SysML v2 graphical notation.',
            alt: 'Top row, titled What enters the model: three cards, ConOps, Architecture, Model v0.2. Bottom row, titled Model packages: Behavior under the first card and a wide Logical box under the other two. Arrows run down labeled SCN, CAP from ConOps; FN, LOG, INFO from Architecture; and placeholders, dashed and grey, from Model v0.2 into Logical.',
          },
          body: [{ kind: 'bullets', items: ['Week 2: scenarios with steps and alternates; capabilities', 'Week 4: functions with their items, logical elements, information items, allocations', 'Week 9: placeholder subjects in Logical; capability links still waiting', 'Same IDs throughout'] }],
          sources: [],
          notes: {
            teach: [
              'Recall what each team has. Week 2 gave you a ConOps with operational scenarios, each with steps, actors, alternates and end states, and the capabilities your requirements trace to. Week 4 gave you a functional decomposition with inputs and outputs, logical elements with the functions allocated to them, and an information view.',
              `Week 9 left two things for this week. Some system requirements got a placeholder subject in the Logical package, a part definition named for the element the shall is about; in AeroLink there are ${numberWord(AEROLINK_W9.logicalDefs.length)} of them. And every requirement whose parent is a capability waited, because capabilities were not yet in the model. Both are finished this week.`,
              'Nothing is retyped: the lab tool reads your Week 9 model file and your Week 2 and Week 4 exports. The IDs stay the same: FN-003 in the model is FN-003 in your Week 4 table.',
            ],
            why: 'Seeing the lanes join tells students that the logical and behavioral models are their Phase I work in another form, and that the open items Week 9 left are closed now, not forgotten.',
            figure: 'Follow each arrow down and read its label; the dashed one is last week’s model handing over its placeholders.',
            misconceptions: [{ claim: 'The logical architecture is designed again from scratch in the model.', correction: 'It is the Week 4 logical architecture, with its functions, elements and allocations, written in the textual notation.' }],
            transition: 'Before modeling anything, agree what a logical architecture is, and how it differs from a physical one.',
            timing: '2 min: 1 min the lanes, 1 min what Week 9 left open.',
          },
        },
      ],
    },
    // ============================================================================================ B. the logical architecture (20 min)
    {
      id: 'w10s1-logical',
      title: 'The logical architecture',
      slides: [
        {
          id: 'w10s1-logical-vs-physical',
          title: 'Logical versus physical architecture',
          purpose: 'Separate the two architecture views SEBoK distinguishes, and show that SysML v2 uses one construct, the part, for both levels of abstraction.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-two-views',
            caption: `Two AeroLink logical elements, each with the principal physical element that will realize it (Flight Operations is also realized at the ops center): the logical view says what must be done, the physical view gives a concrete solution, allocated in Week 11. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `Top row, labeled Logical view: what it must do: two strong cards, ${L5.def} and ${logicalOf('LOG-001').def}. Dashed arrows run down from each, labeled Week 11, to two faint cards in a row labeled Physical view: a concrete solution: Ops center and Aircraft. At the bottom: both are parts, at two levels.`,
          },
          body: [
            { kind: 'definition', term: 'Purpose of logical architecture (SEBoK)', text: '“models and views of the functionality and behavior of the future engineered system as it should operate while in service”', source: R('R20b', '587') },
            { kind: 'bullets', items: ['Physical architecture: a concrete solution that accommodates the logical one', 'In SysML v2 both are parts: purely logical, or physical', 'Week 10 models the logical view; Week 11 the physical'] },
          ],
          sources: [R('R20b', '587'), R('R20c', '596'), R('R81', '90')],
          notes: {
            teach: [
              'SEBoK gives logical architecture model development a purpose: to elaborate models and views of the functionality and behavior of the future system as it should operate while in service (R20b p.587). It adds that the term is a contraction of “logical view of the system architecture”.',
              'Physical architecture has the other job: models and views of a physical, concrete solution that accommodates the logical architecture and satisfies and trades off the system requirements; the physical model is an arrangement of system elements and physical interfaces, and system requirements are allocated to both architectures (R20c p.596).',
              'SysML v2 does not have two constructs for this. The specification says a part can represent any level of abstraction, such as a purely logical component without implementation constraints, or a physical component with a part number (R81 p.90). So a logical element is a part, and so is a physical one; what differs is what you say about it and where it sits in the model: the Logical package this week, the Physical package in Week 11.',
              'A test for students: a logical element’s name says what it does, Scheduling, not which box does it, a dispatch server.',
            ],
            why: 'Students who confuse the two views put product names in the logical architecture and lose the freedom to compare physical solutions; knowing that both are parts prevents a search for a “logical” keyword that does not exist.',
            figure: `Read the two top cards as responsibilities, then the bottom cards as the things that will carry them; point at the dashed arrows and say Week 11 draws them as allocations.`,
            misconceptions: [{ claim: 'SysML v2 has a special construct for logical components.', correction: 'A part can represent any level of abstraction; the logical view is a matter of what the parts stand for and where they are modeled.' }],
            transition: 'SEBoK splits the logical architecture into three views.',
            timing: '3 min: 1 min logical, 1 min physical, 1 min one construct for both.',
          },
        },
        {
          id: 'w10s1-three-views',
          title: 'Three views of a logical architecture',
          purpose: 'Give the SEBoK frame at graduate depth: functional, behavioral and temporal views, and the trace to system requirements as an output.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-three-panels',
            caption: 'The three views SEBoK names for a logical architecture: what is transformed, in what order and on what condition, and how often each function runs. Course illustration, not SysML v2 graphical notation.',
            alt: 'Three tall panels side by side. Left, functional: what it transforms, with a box labeled function and an arrow down to the word item. Middle, behavioral: in what order, when, with box F1 above box F2 joined by an arrow. Right, temporal: how often each runs, with the lines every 1 s and on an event.',
          },
          body: [{ kind: 'bullets', items: ['Functional: functions and sub-functions, with their inputs and outputs', 'Behavioral: scenarios of functions and operational modes', 'Temporal: functions classed by how often they run', 'An output: a trace between logical elements and system requirements'] }],
          sources: [R('R20b', '587–588'), R('R20b', '590–591')],
          notes: {
            teach: [
              'SEBoK says a logical architecture may include a functional, a behavioral and a temporal architecture view (R20b p.587). The functional view is a set of functions and sub-functions that defines the transformations the system performs to complete its mission.',
              'The behavioral view arranges functions and their inputs and outputs to define the execution sequencing, the conditions for control or data flow, and the performance needed; it can be described as a set of inter-related scenarios of functions and operational modes (R20b p.588). That is today’s action flows and Session 2’s states.',
              'The temporal view classifies functions by how often they execute: some run cyclically, some on an event (R20b p.590). The course mentions it but does not model it; the training deck has time triggers, which Session 2 shows briefly.',
              'And one output we model this week: SEBoK lists a traceability matrix between the logical architecture model elements and the system requirements among the outputs of the process (R20b p.591).',
            ],
            why: 'The three views explain why one week holds both structure and behavior, and the named output justifies the requirement allocations students will generate.',
            figure: 'Walk the panels left to right and give each its question: what, in what order, how often.',
            misconceptions: [{ claim: 'The logical architecture is the function tree.', correction: 'The tree is the functional view only; SEBoK adds behavioral and temporal views and a trace to the requirements.' }],
            transition: 'The functional view starts with one idea: a function and its items.',
            timing: '3 min: 1 min functional, 1 min behavioral, 1 min temporal and the trace.',
          },
        },
        {
          id: 'w10s1-functions-io',
          title: 'Functions and the items they exchange',
          purpose: 'Make “function” precise before modeling it, and show on AeroLink that a chain of functions is only connected where an item is modeled.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-function-chain',
            caption: `Three AeroLink functions in the order a booking is served, with the item each passes to the next where one is modeled. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `Three wide cards stacked: ${F1.id} ${F1.name}, ${F2.id} ${F2.name}, ${F11.id} ${F11.name}. The arrow from the first to the second is labeled ${shared(F1, F2)[0] ?? 'no shared item'}; the arrow from the second to the third is ${shared(F2, F11)[0] ? `labeled ${shared(F2, F11)[0]}` : 'dashed and grey, labeled no shared item'}.`,
          },
          body: [
            { kind: 'definition', term: 'Function (SEBoK)', text: '“an action that transforms inputs and generates outputs, involving data, materials, and/or energies”', source: R('R20b', '587') },
            { kind: 'bullets', items: ['Inputs and outputs: the items functions exchange', 'Deduced from requirements, or derived from a design choice', 'A static tree alone does not show the flows'] },
          ],
          sources: [R('R20b', '587')],
          notes: {
            teach: [
              'Read the definition: a function is an action that transforms inputs and generates outputs, involving data, materials and/or energies; those inputs and outputs are the flow items exchanged between functions (R20b p.587).',
              'SEBoK names two kinds of function: those deduced directly from functional and interface requirements, the services the system must provide, and those derived from the alternatives of the physical architecture, which depend on the design (R20b p.587). Your Week 4 functions are mostly of the first kind.',
              `Walk the AeroLink chain. ${F1.id}, ${F1.name.toLowerCase()}, produces passenger information; ${F2.id}, ${F2.name.toLowerCase()}, consumes it. ${F2.id} hands an aircraft assignment to ${F11.id}, ${F11.name.toLowerCase()}, but no information item in the Week 4 view carried that assignment, so a model built from Week 4 alone shows no item between them. That was a finding, not a drawing error: the logical architecture is only as connected as its items. Model v0.3 closes it with a new information item, ${shared(F2, F11)[0] ?? 'the assignment'}, which takes the next free item ID.`,
              'SEBoK also warns that a static functional hierarchy on its own does not show how the inputs and outputs are exchanged (R20b p.587).',
            ],
            why: 'Defining function as transformation of items makes inputs and outputs part of the function, which is exactly what the model will require of each action.',
            figure: 'Point at each arrow and its item; ask which of them the Week 4 information view did not have.',
            misconceptions: [{ claim: 'A function is a task name; inputs and outputs can be added later.', correction: 'Inputs and outputs are part of a function; SEBoK lists forgetting them as a pitfall.' }],
            transition: 'That warning is one of several SEBoK collects for logical architectures.',
            timing: '3 min: 1 min definition, 30 s two kinds, 1.5 min the chain.',
          },
        },
        {
          id: 'w10s1-pitfalls',
          title: 'Pitfalls and proven practices',
          purpose: 'Give the review criteria students will be graded against before they model: SEBoK’s pitfalls and proven practices for logical architecture.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-pitfall-card',
            caption: 'Three pitfalls and three proven practices from SEBoK’s tables for logical architecture, in short form. Course illustration, not SysML v2 graphical notation.',
            alt: 'Two columns. Left, headed Pitfalls: too deep; no inputs, outputs; a static tree only. Right, headed Practices: scenarios first; to move ↔ moving; control, I/O, trigger.',
          },
          body: [{ kind: 'bullets', items: ['Pitfalls: decomposing too deep; functions without inputs and outputs; a static tree only', 'Practices: scenarios of functions before the tree; a function “to move” and its mode “moving”', 'Build a scenario: control flow, then items, then triggers'] }],
          sources: [R('R20b', '594')],
          notes: {
            teach: [
              'SEBoK’s pitfalls table (R20b p.594): the logical architecture should relate back to the operational scenarios; beginners decompose functions too deeply; a common mistake is to consider only the actions and forget the inputs and outputs, which are integral parts of a function; and a static decomposition should be established only once scenarios exist.',
              'The proven practices on the same page: constitute scenarios of functions before a decomposition tree; work in small cycles of analysis and synthesis; alternate functional and behavioral views, since a function, “to move”, and its operational mode, “moving”, are complementary; and build a scenario in the order control flow, then input and output flows, then triggers.',
              'Those last two shape the week. Today we build the control flow and the item flows of one scenario; Session 2 turns the modes into states. The lab’s review checklist uses these pitfalls as criteria.',
            ],
            why: 'Students model better when they know the criteria in advance; SEBoK’s pitfalls name exactly the defects teams make in their first logical architecture.',
            figure: 'Read each pitfall and point at the practice beside it that prevents it.',
            misconceptions: [{ claim: 'A deeper function tree is a more complete architecture.', correction: 'SEBoK names decomposition that is too deep as a beginner’s pitfall; scenarios come first.' }],
            transition: 'Now the structural side: how logical elements become model elements.',
            timing: '3 min: 1 min pitfalls, 1.5 min practices, 30 s how the week uses them.',
          },
        },
        {
          id: 'w10s1-parts-logical',
          title: 'Logical decomposition: part definitions and part usages',
          purpose: 'Apply definition and usage to logical elements: a part definition per kind of element, a part usage per element inside the logical architecture, and the course rule for the Week 9 placeholders.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-listing-logical-parts',
            caption: 'Logical parts in AeroLink model v0.3: a Week 9 placeholder reused as a part definition, a new part definition, and the logical architecture as part usages (excerpt). Checked: PASS. (FICTIONAL)',
            alt: listingAlt('logical-parts'),
          },
          body: [{ kind: 'bullets', items: ['Part definition: the kind of element; part usage: the element in this architecture', 'Course convention: the LOG ID on the usage, inside one part logicalArchitecture', 'A Week 9 placeholder with the same name becomes the definition; another name is specialized'] }],
          sources: [R('R70', '15–16'), R('R81', '90')],
          notes: {
            teach: [
              'Week 8 taught definition and usage for parts. The training deck shows both patterns: usages inherit from their definitions and can redefine what they inherit, and composite structure can be specified entirely on part usages (R70 sl.15–16). A part definition is a modular unit of structure, such as a system, a component or an external entity (R81 p.90).',
              `Read the listing. ${L5.def} is a part definition Week 9 wrote as the placeholder subject of two system requirements; this week it becomes the definition of the logical element of the same name. Decision Support had no placeholder, so it gets a new part definition. Below them, the part logicalArchitecture holds one part usage per logical element: its LOG ID as a quoted short name, a basic name, and its definition.`,
              `Course convention for a placeholder whose name differs from every Week 4 element: the team links it to the element it stood for, and the new definition specializes it. Then the requirement whose subject is the placeholder still conforms, because a specialization conforms to its general definition. AeroLink reuses ${numberWord(COUNTS.placeholdersReused)} placeholders and writes ${numberWord(COUNTS.newLogicalDefs)} new definitions.`,
            ],
            why: 'Putting the IDs on usages and reusing the Week 9 definitions keeps every requirement subject valid while the architecture is completed.',
            figure: 'Follow the callouts: reused placeholder, new definition, the architecture part, one usage with its ID.',
            misconceptions: [{ claim: 'The logical element is the part definition, so its ID goes on the definition.', correction: 'Course convention: the element in the architecture is the usage, which carries the LOG ID; the definition is its kind.' }],
            transition: 'Functions come from capabilities. Those enter the model as well.',
            timing: '3 min: 1 min definition and usage, 1 min the listing, 1 min the placeholder rule.',
          },
        },
        {
          id: 'w10s1-capabilities',
          title: 'Capabilities, functions and the links Week 9 left waiting',
          purpose: 'Place the Phase I capabilities in the model and close the capability links Week 9 could not draw, with the course keyword and the dependency direction rule.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-listing-capability',
            caption: 'A capability, a function derived from it and two #derivedFrom dependencies in AeroLink model v0.3: one from a function, one from a requirement. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('capability'),
          },
          body: [{ kind: 'bullets', items: ['Course convention: a capability is an action definition, a function an action usage', 'A function depends on its capability: a #derivedFrom dependency', 'A requirement traced to a capability links the same way: a derivation must end on requirements'] }],
          sources: [R('R72', '30'), R('R115', '580'), R('R80', '50–51')],
          notes: {
            teach: [
              'Course convention, labeled as such: a Week 2 capability, an ability to perform, becomes an action definition; a Week 4 function becomes an action usage in the Logical package. The training deck distinguishes an action definition, the definition of some action to be performed, from an action, a usage of a definition in a context (R72 sl.30).',
              `Each function records the capability it was derived from with a dependency tagged #derivedFrom, a course keyword. The direction rule is Week 8’s and Week 9’s: from names the dependent element, the function, and to names what it depends on, the capability (R80 pp.50–51). AeroLink writes ${COUNTS.fnCapLinks} such links from functions.`,
              `Week 9 left every requirement whose parent is a capability waiting. Why not a derivation? The library’s Derivation connection requires every end to be a requirement usage (R115 p.580), and a capability is an action definition. So those ${COUNTS.reqCapLinks} links are dependencies too: “this requirement was written from that capability”.`,
            ],
            why: 'Capabilities give every function a reason to exist, and closing the Week 9 links completes the trace from need to function.',
            figure: 'Point at the action definition, the action usage, then the two dependency lines; read the second aloud as a sentence.',
            misconceptions: [{ claim: 'A requirement derived from a capability should use a derivation connection.', correction: 'A derivation’s ends must be requirements; a capability is an action definition, so the link is a dependency.' }],
            transition: 'The other trace SEBoK asks for runs from requirements to functions.',
            timing: '2 min: 45 s convention, 45 s the keyword and direction, 30 s the Week 9 links.',
          },
        },
        {
          id: 'w10s1-req-allocation',
          title: 'Requirements allocated to functions',
          purpose: 'Model the trace SEBoK lists as a logical-architecture output: each Week 4 allocation of a requirement to a function becomes an allocate, and the matrix is read from the model.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-alloc-matrix',
            caption: 'Four AeroLink system requirements and the functions they are allocated to in model v0.3, a fragment of the matrix read from the model. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: 'A small matrix with system requirement IDs as rows and function IDs as columns; an X marks each allocation, one per row. Under it, the count of system requirements allocated out of all system requirements.',
          },
          body: [{ kind: 'bullets', items: ['SEBoK: assign system requirements to functional elements, and trace them', 'Each Week 4 allocation: allocate from the requirement to the function', `AeroLink: ${COUNTS.allocations} allocations; ${numberWord(UNALLOCATED.length)} system requirements not yet allocated`] }],
          sources: [R('R20b', '591–592'), R('R81', '110')],
          notes: {
            teach: [
              'Among the activities of logical architecture development SEBoK lists: assign system requirements to functional and behavioral elements, and establish traceability between the system requirements and those elements (R20b p.592); among the outputs, the traceability matrix (R20b p.591).',
              'The specification defines an allocation as saying that a target element is responsible for realizing some or all of the intent of the source element (R81 p.110). So each row of your Week 4 allocation table, a requirement allocated to a function, becomes one allocate line from the requirement to the function. The lab tool writes them from your Week 4 export, and it computes the matrix from the model rather than asking you to type it.',
              `AeroLink has ${COUNTS.allocations} allocations. ${UNALLOCATED.join(', ')} are allocated to no function: they are interface requirements Week 5 wrote, and the instructor’s disposition defers them to Week 11, when the interfaces are modeled. A gap with a disposition is honest; a gap hidden by an invented allocation is not.`,
            ],
            why: 'The allocation matrix is how a reviewer checks that every system requirement has a function responsible for it; generating it from the model removes a whole class of table errors.',
            figure: 'Read one row across: the requirement, the X, the function. Then read the count line and ask where the missing requirements went.',
            misconceptions: [{ claim: 'Allocating a requirement to a function shows the function meets it.', correction: 'An allocation assigns responsibility; whether a design meets the requirement is a satisfy claim and later evidence.' }],
            transition: 'Now the functions themselves, as actions with parameters.',
            timing: '3 min: 1 min SEBoK, 1 min allocate, 1 min the AeroLink gaps.',
          },
        },
      ],
    },
    // ============================================================================================ C. actions and flows (36 min)
    {
      id: 'w10s1-actions',
      title: 'Behavior: functions as actions, and action flows',
      slides: [
        {
          id: 'w10s1-action-def',
          title: 'Functions as actions: parameters and items',
          purpose: 'The core notation: action definitions and usages, directed parameters, and the information items as item definitions that type them.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-listing-function-io',
            caption: `An information item as an item definition and ${F3.id} as an action usage with its in and out items, in AeroLink model v0.3. Checked: PASS. (FICTIONAL)`,
            alt: listingAlt('function-io'),
          },
          body: [
            { kind: 'definition', term: 'Action definition (SysML v2.1 Beta 2)', text: '“a kind of occurrence definition … that classifies action performances”', source: R('R82', '117') },
            { kind: 'bullets', items: ['Its in and out features are its parameters', 'Item definition: things that exist in time and space and may flow', 'Course convention: a function’s in and out items come from your information view'] },
          ],
          sources: [R('R82', '117'), R('R72', '30'), R('R70', '17')],
          notes: {
            teach: [
              'Read the definition: an action definition is a kind of occurrence definition that classifies action performances; an action usage is a usage of one or more action definitions. Features with direction in, out or inout are its parameters (R82 p.117). The training deck says it the same way: directed features of an action definition are its parameters, and an action is a usage performed in a specific context (R72 sl.30).',
              'What types the parameters? An item definition defines things that exist in space and time but are not necessarily parts; items may flow between parts, and all parts can be treated as items (R70 sl.17). Each Week 4 information item becomes an item definition with its INFO ID.',
              `Read ${F3.id}, plan flight: in flight data and weather data, out the flight release and plan. Course convention: the items of a function are decided by the team from its Week 4 inputs and outputs; where the information view has no item for a flow, add one. AeroLink adds ${numberWord(W10_NEW_ITEMS.length)}: ${W10_NEW_ITEMS.map((x) => x.name.toLowerCase()).join(', ')}; the information item gets the next ID, ${newInfo.map((x) => x.id).join(', ')}, because IDs are never reused.`,
            ],
            why: 'Typing every parameter by an item makes the inputs and outputs of each function explicit, which is what lets the model connect functions with flows.',
            figure: 'Point at the item definition, then at the action usage and its in and out lines; ask which function consumes the flight release and plan.',
            misconceptions: [{ claim: 'An item is a physical thing only.', correction: 'An item is anything that exists in space and time and may flow: information, energy or material.' }],
            transition: 'A function needs a performer. SysML v2 has two ways to say who is responsible.',
            timing: '3 min: 1 min definition, 1 min items, 1 min the listing and new items.',
          },
        },
        {
          id: 'w10s1-perform-allocate',
          title: 'Allocating functions to logical elements: perform and allocate',
          purpose: 'Teach the two SysML v2 constructs for responsibility and the course choice: perform for function to logical element, allocate for requirement to function and, in Week 11, logical to physical.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-listing-allocate-perform',
            caption: 'A neutral example: a logical part performs a function, and an allocation states the same responsibility as a mapping. Checked: PASS.',
            alt: listingAlt('allocate-perform'),
          },
          body: [
            { kind: 'definition', term: 'Allocation (SysML v2.1 Beta 2)', text: '“a target element is responsible for realizing some or all of the intent of the source element”', source: R('R81', '110') },
            { kind: 'bullets', items: ['perform in a part: that part is the performer', 'allocate: a mapping across structures, often made early', 'Course convention: perform for functions; allocate for requirements now, logical to physical in Week 11'] },
          ],
          sources: [R('R72', '41'), R('R82', '136'), R('R81', '110–111'), R('R76', '106–107')],
          notes: {
            teach: [
              'First construct: perform. Perform identifies the owner as the performer of an action defined elsewhere, and the shorthand names the performed action without renaming it (R72 sl.41). The specification states it for parts: a perform action usage in the body of a part makes the part the performer of the performed action (R82 p.136).',
              'Second construct: allocation, defined on the slide (R81 p.110). Allocations are a mapping across the structures and hierarchies of a model, usable early as a precursor to more rigorous specifications, and they can be semantically related to performing actions and satisfying requirements (R81 pp.110–111). The training deck adds that, unlike SysML v1, an allocation is not a dependency but an instantiable connection across model features (R76 sl.107).',
              'The deck’s own allocation example shows how they combine: in the logical model a part performs an action; in the physical model a part performs the same action; an allocate then maps the logical part to the physical one, with a nested allocation of the action (R76 sl.106). That is exactly Week 11.',
              'So the course convention: in the logical architecture, a function is allocated to a logical element by perform inside that element’s part usage. Requirements are allocated to functions with allocate. Both lines in the listing pass the checker; the course uses one form for each purpose so that every team’s model reads the same way.',
            ],
            why: 'Students meet “allocation” in SEBoK, in Week 4 and in SysML v2; one clear convention per purpose prevents models that say the same thing three ways.',
            figure: 'Point at the perform line inside the part, then at the allocate line outside it; say what each one asserts.',
            misconceptions: [{ claim: 'In SysML v2 an allocation is a kind of dependency, as in SysML v1.', correction: 'The training deck says an allocation in SysML v2 is not a dependency but an instantiable connection across model features.' }],
            transition: 'Put both on AeroLink: the logical architecture of model v0.3.',
            timing: '4 min: 1 min perform, 1 min allocation, 1 min the deck’s example, 1 min the course choice.',
          },
        },
        {
          id: 'w10s1-worked-logical',
          title: 'AeroLink worked example I: the logical architecture',
          purpose: 'See part usage, perform and allocate together on AeroLink: one logical element with the functions it performs and the requirements allocated to them; one think-pair-share.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-listing-worked-logical',
            caption: `${L5.id} in AeroLink model v0.3, typed by the Week 9 placeholder, performing the functions allocated to it, and three requirement allocations. Checked: PASS. (FICTIONAL)`,
            alt: listingAlt('worked-logical'),
          },
          body: [
            { kind: 'bullets', items: [`${COUNTS.logical} logical parts perform ${COUNTS.performs} functions`, `${COUNTS.allocations} requirement allocations, all from Week 4`, 'Generated from the Week 4 case; nothing retyped'] },
            { kind: 'callout', tone: 'note', title: 'Pair, 1 min', text: 'Who performs dispatch, and which requirement makes that a safety question?' },
          ],
          sources: [R('R72', '41'), R('R81', '110')],
          notes: {
            teach: [
              `Read the listing. ${L5.id}, ${L5.def}, is a part usage typed by the definition Week 9 created as a placeholder. It performs ${L5.performs.join(', ')}: ${L5.performs.map((x) => fnOf(x).name.toLowerCase()).join(', ')}. Below it, three allocations: two system requirements to the matching function, and the no-dispatch-with-an-open-fault stakeholder requirement to the dispatch function.`,
              `The whole AeroLink logical architecture is generated the same way from the Week 4 case: ${COUNTS.logical} logical parts performing ${COUNTS.performs} functions, ${COUNTS.capabilities} capabilities and ${COUNTS.items} items. The generator is the lab tool’s; what the instructor decided is which items each function takes and gives.`,
              `Run the pair question for one minute. Expected answer: ${performerOf('FN-011')}, ${logicalOf(performerOf('FN-011')).def}, performs ${F11.id}, ${F11.name.toLowerCase()}, and REQ-STK-006, no dispatch with an open no-go fault, is allocated to it; a wrong release is a safety event, so the function’s performer carries a safety requirement. Ask one pair what Session 2 will add: a guard on the release transition.`,
            ],
            workedSolution: ['Step 1, the element: a part usage with its LOG ID, typed by its definition (a reused placeholder here).', 'Step 2, its functions: one perform line for each function the Week 4 table allocates to it.', 'Step 3, the requirements: one allocate line for each requirement the Week 4 table allocates to a function.', 'Step 4, check: every function performed by at least one element; every system requirement allocated or dispositioned.'],
            why: 'One complete logical element in real model text lets students see usage, perform and allocate together before they generate their own.',
            figure: 'Follow the callouts: the usage and its type, the performs, the allocations. Read one allocation as a sentence.',
            misconceptions: [{ claim: 'Each function should get its own logical element.', correction: 'A logical element groups the functions allocated to it; one element usually performs several.' }],
            transition: 'Structure is done. Now the order in which functions happen: successions.',
            timing: '4 min: 1.5 min the listing, 1 min the whole model, 1.5 min pair question and debrief.',
          },
        },
        {
          id: 'w10s1-successions',
          title: 'Ordering and transfer: successions and flows',
          purpose: 'Separate ordering from transfer: a succession orders two actions, a flow transfers an item, and a succession flow does both.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-three-links',
            caption: 'Three links between the same two AeroLink steps: a flow transfers the plan, a succession orders the steps, a succession flow does both. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: 'Three rows, each with a box planFlight on the left and a box fileFlightIntent on the right. Row flow: a dashed grey arrow with a chip labeled plan. Row succession: a solid arrow, no chip. Row succession flow: a solid arrow with a chip labeled plan.',
          },
          body: [{ kind: 'bullets', items: ['Succession: the first completes before the second begins', 'Flow: transfers an item from an output to an input', 'Succession flow: the output is produced before the next begins consuming it'] }],
          sources: [R('R72', '30–32'), R('R82', '118')],
          notes: {
            teach: [
              'Three statements the training deck makes on three slides. A flow can transfer items between actions, from an output of one to an input of another (R72 sl.30). A succession asserts that the first action must complete before the second can begin (R72 sl.31). A succession flow requires the first action to finish producing its output before the second can begin consuming it (R72 sl.32).',
              'The specification explains why the distinction matters. A flow models an actual transfer of items between actions that may itself take time; a streaming flow can go on while both actions are being performed; only a succession flow adds the constraint that the transfer cannot begin until the source completes and the target cannot start until the transfer has completed (R82 p.118).',
              'So a plain flow says what moves, not in what order. In the AeroLink flow, the order of the steps comes from successions, and the item flows are written separately.',
            ],
            why: 'Students who think a flow orders actions write scenarios whose sequence the model never asserts; separating the two now prevents it.',
            figure: 'Compare the three rows: what each arrow asserts about order, and whether an item moves.',
            misconceptions: [{ claim: 'A flow from A to B means B happens after A.', correction: 'Only a succession or a succession flow asserts the order; a streaming flow can run while both act.' }],
            transition: 'Writing a succession for every pair would be tedious. Two shorthands make flows readable.',
            timing: '3 min: 1.5 min the three statements, 1 min the specification, 30 s the consequence.',
          },
        },
        {
          id: 'w10s1-then-decomposition',
          title: 'Shorthands: then, and decomposition',
          purpose: 'Read real listings fluently: then is a succession from the lexically previous action; an action can be decomposed directly; text order alone orders nothing.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-then-shorthand',
            caption: 'Two equivalent ways to write that a precedes b, and two reading rules. Course illustration, not SysML v2 graphical notation.',
            alt: 'Two code cards joined by an equals sign: first a; then action b; equals first a then b; action b;. Below, a card: then: from the action just before. At the bottom, a card: text order alone orders nothing.',
          },
          body: [{ kind: 'bullets', items: ['then: a succession from the lexically previous action', 'An action can be decomposed directly into actions', 'Course reading: text order alone orders nothing; successions do'] }],
          sources: [R('R72', '33–34'), R('R82', '134–135')],
          notes: {
            teach: [
              'The training deck: then after an action is shorthand for a succession from the lexically previous action to this one, and an action usage can be decomposed directly into other actions (R72 sl.33–34). The specification gives the equivalence on the card: first a; then action b; is the same as first a then b; with action b declared (R82 p.134).',
              'One precision from the specification: the source of a then is the nearest lexically previous occurrence, skipping intervening declarations that are not occurrences (R82 p.135). That is why alternates and decisions can be written in between.',
              'The course reading: if two actions are declared with no succession between them, the model says nothing about their order, however they are laid out in the text.',
            ],
            why: 'Every listing that follows uses then; students who read it as a succession, and lexical order as nothing, can read flows they have never seen.',
            figure: 'Read the two cards as equivalent, then read the two rules underneath.',
            misconceptions: [{ claim: 'Actions written one after another happen in that order.', correction: 'Only successions, including then, order actions; lexical order alone asserts nothing.' }],
            transition: 'Scenarios have alternates. For those we need decisions.',
            timing: '2 min: 1 min then and decomposition, 1 min the reading rule.',
          },
        },
        {
          id: 'w10s1-decide-merge',
          title: 'Choices: conditional successions, decide and merge',
          purpose: 'The constructs every ConOps alternate needs: conditional successions, decision nodes with else, merge nodes, and the rule that a branch target is named.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-decide-merge',
            caption: 'SCN-002 step 4 in AeroLink model v0.3: a decision with one guarded branch and else, and a merge where the alternate rejoins. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `A box ${decides[1] ? FLOW_NODES[FLOW_NODES.indexOf(decides[1]) - 1].name : ''} at the top, an arrow down to a diamond labeled decide. One branch runs right, labeled with the guard in brackets, to a box ${alts[1]?.name ?? ''}; the other runs down, labeled [else], to a second diamond labeled merge. An arrow from the alternate’s box also reaches the merge, and from the merge an arrow runs down to a box ${steps[4]?.name ?? ''}.`,
          },
          body: [{ kind: 'bullets', items: ['Conditional succession: taken only if its guard is true', 'decide: exactly one successor; else when every guard is false', 'merge: waits for any one predecessor', 'A branch target is named, never declared in place'] }],
          sources: [R('R72', '35–38'), R('R82', '118'), R('R82', '135–136')],
          notes: {
            teach: [
              'A conditional succession asserts that the second action follows the first only if a guard condition is true; if the guard is false, the succession is not possible (R72 sl.35). Written after the lexically previous action, it is the if … then shorthand (R72 sl.36).',
              'A decision node, the keyword decide, chooses exactly one successor and is typically followed by conditional successions; the last if … then can be replaced by else (R72 sl.38). The specification: else marks the succession taken if the guards evaluate to false on all of an immediately preceding set of conditional successions (R82 p.136). A merge node waits for exactly one predecessor to happen before continuing (R72 sl.37; R82 p.118). Start and done refer to the start and the end of the containing action.',
              'One syntax rule students hit at once: the target of a conditional succession must be a qualified name or a feature chain, not a full action declaration (R82 p.136; R72 sl.35). Declare the target on its own line, and name it in the branch.',
              'In the figure, from AeroLink: after boarding, a passenger who does not show takes the guarded branch, departing with the rest of the party; else the main path continues; both meet at the merge before take-off.',
            ],
            why: 'Decide, else and merge are the constructs for every alternate in every ConOps; knowing the naming rule avoids the most common syntax error of the lab.',
            figure: 'Trace both paths from the decision to the merge; point at the guard, then at else.',
            misconceptions: [{ claim: 'A merge waits until all incoming paths arrive.', correction: 'A merge waits for any one predecessor; waiting for all is a join.' }],
            transition: 'Now we can answer the driving question.',
            timing: '4 min: 1 min conditional succession, 1.5 min decide, else and merge, 1 min the naming rule, 30 s the figure.',
          },
        },
        {
          id: 'w10s1-gap-reveal',
          title: 'The semantics of choice: gaps and overlaps',
          purpose: 'Answer the driving question and teach the reviewer’s reasoning about guards: a gap leaves no possible successor, an overlap leaves a choice the model does not settle, and the checker evaluates neither.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-guard-number-line',
            caption: 'The driving question’s guards on a number line, with the uncovered score marked, and a second pair of guards that can both be true. Course illustration, not SysML v2 graphical notation.',
            alt: 'A number line from 0 to 10 with ticks at 0, 3, 4, 8 and 10. Bars above it: routine below 3, urgent from 4 to 8, critical from 8 to 10; the bar between 3 and 4 is marked red, labeled gap: no successor. Below, a second example headed overlap: two guards true: bar B from 3 to 10 and bar A from 5 to 10, labeled both true: one is chosen.',
          },
          body: [
            { kind: 'bullets', items: ['Answer B: a score of 3 has no possible successor', 'Overlapping guards: only one successor is chosen; the model does not say which', 'The checker evaluates no guard: both files pass'] },
            { kind: 'callout', tone: 'key', text: 'Cover every case: write else, and check each guard against its ConOps condition.' },
          ],
          sources: [R('R72', '35'), R('R72', '38'), R('R82', '118'), R('R82', '134')],
          notes: {
            teach: [
              'Return to the vote. For a score of 3, no guard holds: 3 is not at least 8, not between 4 and 8, and not below 3. There is no else. A conditional succession whose guard is false is not possible (R72 sl.35), so after the decision no successor is possible. The answer is B. A is wrong for exactly that score; D is wrong because the text tells us; C we settle in a moment.',
              'The other failure is an overlap. A decision chooses exactly one successor (R72 sl.38; R82 p.118). If two guards can both be true, the model says only that one of the possible successors is chosen; the specification’s own example notes that unguarded successions out of a decision are chosen non-deterministically (R82 p.134). Which one happens is then not modeled. This consequence is course reasoning from those statements.',
              'And C: both the gap file and its corrected version pass the course checker with no message. The checker does not evaluate guards. The corrected version in the lesson simply ends with else.',
            ],
            why: 'Resolving the prediction turns the guard semantics into a review habit: for every decision, look for the uncovered case and the double-true case.',
            figure: 'Point at the red interval and read “no successor”; then at the overlapping bars and read “one is chosen”.',
            misconceptions: [{ claim: 'If a flow passes the checker, every branch is reachable and complete.', correction: 'The checker evaluates no guard; gaps and overlaps pass silently.' }],
            transition: 'Choices pick one path. When the ConOps says two things happen at once, we need concurrency.',
            timing: '3 min: 1.5 min the gap and the answer, 1 min the overlap, 30 s the checker.',
          },
        },
        {
          id: 'w10s1-fork-join',
          title: 'Concurrency: fork and join',
          purpose: 'Model “at the same time” honestly, and only where the ConOps says it.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-listing-fork-join',
            caption: 'The AeroLink turnaround: after the charger is connected, charging and boarding run concurrently, and the aircraft is released when both are done (course example). Checked: PASS. (FICTIONAL)',
            alt: listingAlt('fork-join'),
          },
          body: [{ kind: 'bullets', items: ['fork: all its successors may start', 'join: waits for all its predecessors', 'Use a fork only where the ConOps says “at the same time”'] }],
          sources: [R('R72', '40'), R('R82', '118')],
          notes: {
            teach: [
              'A fork node enables all its successors to happen after it; a join node waits for all its predecessors before continuing (R72 sl.40). The specification: the actions after a fork cannot start until the action before it completes, and the action after a join cannot start until all the actions before it have completed (R82 p.118).',
              'The AeroLink case: the Week 2 ConOps says the battery is charged to the dispatch threshold while passengers deplane and board. So after the charger is connected, the flow forks into charging and boarding the next party, and joins before the charger is disconnected and the aircraft is released. This is a course example built from that step.',
              'The rule: a fork where the ConOps has a choice is a semantic error the checker will not report. If the ConOps says “either … or”, it is a decision; if it says “while” or “at the same time”, it may be a fork.',
            ],
            why: 'Concurrency is common in operations; drawing it only where the ConOps states it keeps the flow faithful.',
            figure: 'Point at the fork and its two successors, then at the join that waits for both.',
            misconceptions: [{ claim: 'A fork is a decision with two branches.', correction: 'A fork starts all its successors; a decision starts exactly one.' }],
            transition: 'Now the items that move between steps.',
            timing: '2 min: 1 min fork and join, 1 min the case and the rule.',
          },
        },
        {
          id: 'w10s1-item-flows',
          title: 'Item flows between steps, and messages at the boundary',
          purpose: 'Show item flows in a scenario computed from the functions’ items, and where send and accept fit: transfers across an organizational boundary, completed with ports in Week 11.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-listing-item-flows',
            caption: 'Four of the item flows of SCN-002 in AeroLink model v0.3: the plan, and the passenger party through the flight. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('item-flows'),
          },
          body: [{ kind: 'bullets', items: ['Item flow: from an out parameter of one step to an in parameter of a later step', `AeroLink SCN-002: ${COUNTS.itemFlows} item flows, computed from the functions’ items`, 'Across an organizational boundary: send and accept; ports follow in Week 11'] }],
          sources: [R('R72', '30'), R('R72', '45–46'), R('R82', '118')],
          notes: {
            teach: [
              `A flow transfers items from an output parameter of one action to an input parameter of another (R72 sl.30). In AeroLink model v0.3 each step subsets its function, so it has that function’s parameters, and the tool writes a flow wherever an earlier step’s function produces an item that a later step’s function consumes. SCN-002 gets ${COUNTS.itemFlows}. Read the first: the plan from planning the flight to filing the intent.`,
              'Transfers can also be asynchronous. An accept action receives an incoming transfer and a send action sends one to a target; sent via a port, the transfer goes to whatever the port is connected to (R72 sl.45–46). The specification places send and accept next to flows as the way to transfer without an explicit connection (R82 p.118).',
              'The course uses send and accept only at organizational boundaries, such as the flight intent filed with the air traffic service, and leaves them to Week 11, which supplies the ports and interfaces. This week, item flows between steps are enough.',
            ],
            why: 'Item flows make the scenario’s inputs and outputs visible, which is the second step of SEBoK’s order for building a scenario.',
            figure: 'Read each flow as a sentence: this item, from this step, to that step.',
            misconceptions: [{ claim: 'An item flow needs a port.', correction: 'A flow between actions connects their parameters; ports are for parts and arrive in Week 11.' }],
            transition: 'All the pieces together: SCN-002 from ConOps table to action flow.',
            timing: '3 min: 1.5 min item flows, 1 min send and accept, 30 s the course rule.',
          },
        },
        {
          id: 'w10s1-worked-scn002',
          title: 'Worked example II: SCN-002 from ConOps table to action flow',
          purpose: 'The whole method once, end to end, on the scenario the class knows: each step, alternate, rejoin and ending mapped to a node and a construct.',
          minutes: 6,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-listing-scn002-a',
            caption: 'The first part of the SCN-002 flow inside its use case in AeroLink model v0.3: guards, steps subsetting their functions, two decisions and an ending alternate. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('scn002-a'),
          },
          body: [{ kind: 'bullets', items: ['Course convention: each step an action subsetting its function', 'Each alternate: a guarded branch where its condition becomes known, before or after its step', 'A rejoin: a merge before the step; an ending: done', `SCN-002: ${COUNTS.flowSteps} steps, ${COUNTS.decisions} decisions, ${COUNTS.merges} merges`] }],
          sources: [R('R72', '30–38'), R('R76', '101')],
          notes: {
            teach: [
              `${SCN2.id}, ${SCN2.name}, has ${SCN2.steps.length} steps and ${SCN2.alternates.length} alternates in the Week 2 ConOps. A use case’s required behavior can be specified as for an action (R76 sl.101), so the flow sits inside the scenario’s use case.`,
              'Walk the mapping with the class predicting each construct before you reveal it. Steps 1 and 2 are system functions: plan the flight and file the intent, each an action subsetting its function. Step 3, the air traffic service accepts, is an action with no AeroLink function. Alternate A3 is known before that step happens: the decision sits before step 3, so if the intent is not accepted the flow holds and re-files, and the scenario ends; else the acceptance follows. The rule: the decision sits where the condition becomes known.',
              'Step 4 is boarding; alternate A2, a passenger does not show, departs with the rest and rejoins before take-off, so a merge sits before step 5. Steps 5 and 6 both subset the flight function. Alternate A1, the destination pad is occupied, must be known before landing, so its decision sits before step 6: if the pad is occupied, hold or divert and rejoin at step 7 through a second merge; else approach and land. The flow ends with done.',
              'What the listing leaves open: the guards are named conditions, not computed comparisons; step 3 subsets no function; and a decision can sit only before or after a whole step, so a condition that becomes known in the middle of a step needs that step split in the ConOps. Those are modeling choices to state, not errors.',
            ],
            workedSolution: ['Step 1, the mapping table: for each ConOps step a node; for each alternate a guarded branch placed where its condition becomes known (before or after its step) and its rejoin step or “ends”.', 'Step 2, the main path: first start; then one action per step, subsetting its function where one exists.', 'Step 3, the alternates: a decision before the step when the condition is known first (else to the step), or after it (else to the next node); one if per alternate with a named guard.', 'Step 4, rejoins and endings: a merge before each rejoin step; an ending alternate then done.', 'Step 5, items: a flow wherever an earlier step’s function produces what a later one consumes.', 'Step 6, check: every step and alternate has a node, in ConOps order; every decision has else.'],
            why: 'One complete scenario, mapped construct by construct, is the method students reproduce in the lab on their own ConOps.',
            figure: 'Follow the callouts down the listing; then show the second part in the lesson, where both merges sit.',
            misconceptions: [{ claim: 'An external actor’s step is not part of the flow.', correction: 'It is a step of the scenario; it is modeled as an action without a function of the system, often followed by a decision on its outcome.' }],
            transition: 'Before you write your own, predict one checker result.',
            timing: '6 min: 1 min the scenario, 2.5 min the mapping with predictions, 2 min the listing, 30 s what is left open.',
          },
        },
        {
          id: 'w10s1-predict-target',
          title: 'Predict: accepted or rejected?',
          purpose: 'Practice the most common syntax error of action flows before meeting it in the lab: a branch whose target is declared in place. The result is revealed on the next slide.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-predict-card',
            caption: 'A decision adapted from SCN-002 step 3, shown without its checker result. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `A code card titled Accepted or rejected? Why? with these lines: ${cardAlt('predict-target')}.`,
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Predict, 1 min', text: 'Will the checker accept this file?' },
            { kind: 'bullets', items: ['Write: accepted or rejected', 'If rejected: the line, and the reason'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Give pairs one minute. Ask each pair to write accepted or rejected, and if rejected, the line and the reason. Do not confirm or deny anything; the result is on the next slide, with the other recorded checker results.',
              'If a pair asks whether the guard name matters, say no: look at what follows then in the branch.',
              'While pairs write, walk the room and listen for the two typical answers: “accepted, it reads like the SCN-002 flow” and “rejected, something about the branch”. Note how many pairs give each, without comment; the count is useful when the result appears, because the pairs who said accepted have just met the most frequent syntax error of the lab.',
            ],
            why: 'Predicting before seeing the result makes the syntax rule stick, and keeping the result off this slide keeps the prediction honest.',
            figure: 'Read the five lines aloud, slowly, without emphasis on any of them.',
            transition: 'Here is what the checker said, and what it says about the rest of today’s constructs.',
            timing: '2 min: 1 min pairs predict, 1 min collect answers.',
          },
        },
      ],
    },
    // ============================================================================================ D. close (6 min)
    {
      id: 'w10s1-close',
      title: 'Calibration and exit',
      slides: [
        {
          id: 'w10s1-checker',
          title: 'What the checker checks, and what it cannot',
          purpose: 'Reveal the predict item and calibrate trust in tool output on behavior constructs: recorded results of release 2026-08 for files that fail and files that pass silently with a semantic error.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-checker-table',
            caption: `Recorded results of the course checker (release 2026-08) on ${CALIBRATION.length} course files: what it rejects, and what it accepts without complaint. Course illustration, not SysML v2 graphical notation.`,
            alt: `Two columns. Left, headed checker rejects: ${rejected.map((c) => c.label).join('; ')}. Right, headed checker accepts: ${accepted.map((c) => c.label).join('; ')}. The messages the checker recorded are in the notes and the lesson.`,
          },
          body: [{ kind: 'bullets', items: ['The predict card: rejected at the branch; a target is named, not declared', 'Rejected: syntax, unresolved names, a few rules', 'Accepted silently: gaps, forks for choices, missing or extra initial states, unreachable states, crossings written inside a region', 'Zero errors is necessary, never sufficient'] }],
          sources: [R('R72', '35'), R('R82', '136'), R('R82', '146')],
          notes: {
            teach: [
              `Reveal the predict item: rejected. The checker recorded “${predictRow.recorded}” at the branch, because the target of a conditional succession must be named, not declared in place (R72 sl.35; R82 p.136). The fix: declare the action on its own line and name it in the branch.`,
              `Read the left column, each with its recorded message: ${rejected.map((c) => `${c.what.toLowerCase()}: “${c.recorded}”`).join('; ')}. Read the last one carefully: the checker rejects any transition that a parallel state itself owns, even one whose ends are in the same region. It does not test whether a transition crosses regions: the specification forbids transitions between the substates of a parallel state (R82 p.146), but a crossing written inside one region passes with no message, so crossing regions stays a review item; Session 2 meets it.`,
              `Then the right column, all passing with no message: ${accepted.map((c) => c.what.toLowerCase()).join('; ')}. A non-parallel state with substates has exactly one active substate after entry (R82 p.146), yet two initial states pass.`,
              'The rule for the course: zero errors is necessary and never sufficient. These behaviors are recorded for the course release of the checker; a new release may report more, or less. Session 2 gives you the review checklist for what only you can see.',
            ],
            why: 'Students about to generate dozens of actions and transitions need to know which mistakes the tool will catch and which only their own review will.',
            figure: 'Read the two columns row by row; pause on the guard gap from the driving question, now on the right.',
            misconceptions: [{ claim: 'A warning-free PASS means the behavior is modeled correctly.', correction: `All ${accepted.length} recorded passes on the right contain modeling errors the checker does not report.` }],
            transition: 'Now one of your own scenarios, before Session 2.',
            timing: '3 min: 45 s the reveal, 1 min the rejects, 1 min the silent passes, 15 s the rule.',
          },
        },
        {
          id: 'w10s1-exit',
          title: 'Exit: map one step and one alternate',
          purpose: 'Retrieval and preparation for Session 2: each student maps one step and one alternate of the team’s chosen scenario; it is the first item of the lab.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s1-exit-card',
            caption: 'The exit card: four fields to fill for one step and one alternate of your team’s scenario, and two questions. Course illustration, not SysML v2 graphical notation.',
            alt: 'A card with four labeled boxes: ConOps step, flow node, construct, function. Below them a tag: and two questions (the questions are listed on the slide).',
          },
          body: [{ kind: 'bullets', items: ['Pick the scenario with the most alternates from your Week 2 ConOps', 'For one step and one alternate: node, construct, function', 'Is the alternate a choice or something happening at the same time?', 'Does it end the scenario, or rejoin, and where?'] }],
          sources: [],
          notes: {
            teach: [
              'Each student takes the team’s Week 2 scenario with the most alternates and fills the card for one step and one alternate: the ConOps item, the flow node it becomes, the construct, and the function the step subsets, if any.',
              'Then one line for each question. Is the alternate a choice, a decision, or something that happens at the same time as the main path, a fork? Does it end the scenario, done, or rejoin, and before which step does its merge sit?',
              'Collect nothing today. Students bring the card to Session 2: the lab begins by mapping the whole scenario, and the checkpoint looks at the mapping.',
            ],
            why: 'Mapping one step and one alternate immediately consolidates decide, merge and done, and the two questions rehearse the decisions the lab demands.',
            figure: 'Read the four fields, then the two questions; point at “rejoin, and where” and say that is where most first drafts go wrong.',
            misconceptions: [{ claim: 'Every alternate rejoins the main path.', correction: 'Some alternates end the scenario; follow the ConOps, which says rejoin or ends for each.' }],
            transition: 'Session 2 starts with three drafts of one branch to judge, then states and use cases.',
            timing: '3 min: 2 min writing, 1 min the questions and what to bring.',
          },
        },
        {
          id: 'w10s1-references',
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
      id: 'w10s1-l-continuity',
      title: 'From the Phase I package to the logical architecture',
      blocks: [
        { kind: 'para', text: 'Your team wrote its ConOps scenarios in Week 2 and its architecture description in Week 4: a functional decomposition with the inputs and outputs of each function, logical elements with the functions allocated to them, and an information view. In Week 9 it put its needs and requirements into its SysML v2 model. This week the scenarios go into the Behavior package and the architecture into the Logical package. Nothing is invented and nothing is retyped: the IDs, names, steps, alternates and allocations come from your Phase I exports, and the Week 10 lab tool reads them for you.' },
        { kind: 'figure', slide: 'w10s1-title' },
        { kind: 'para', text: `Week 9 left two things for this week. Some system requirements were given a placeholder subject in the Logical package, a part definition named for the element the shall is about; AeroLink has ${numberWord(AEROLINK_W9.logicalDefs.length)}. And every requirement whose parent is a capability had to wait, because capabilities were not yet in the model. Both are completed now: the placeholders become, or are specialized by, the logical part definitions, and the capability links are written.` },
        { kind: 'figure', slide: 'w10s1-continuity' },
      ],
      sources: [],
    },
    {
      id: 'w10s1-l-logical',
      title: 'Logical and physical architecture, functions and pitfalls',
      blocks: [
        { kind: 'para', text: 'SEBoK gives logical architecture model development a purpose: to elaborate models and views of the functionality and behavior of the future engineered system as it should operate while in service. The term is a contraction of “logical view of the system architecture”. Physical architecture has the complementary job: models and views of a physical, concrete solution that accommodates the logical architecture and satisfies and trades off the system requirements, arranged from system elements and physical interfaces. System requirements are allocated to both. SysML v2 uses one construct for both levels: a part can represent any level of abstraction, from a purely logical component without implementation constraints to a physical component with a part number. A logical element’s name says what it does, not which product does it.' },
        { kind: 'figure', slide: 'w10s1-logical-vs-physical' },
        { kind: 'para', text: 'A logical architecture may include three views. The functional view is the set of functions and sub-functions that defines the transformations the system performs. The behavioral view arranges functions and their inputs and outputs into execution sequences with the conditions for control or data flow, as inter-related scenarios of functions and operational modes. The temporal view classes functions by how often they run, cyclically or on an event. Among the outputs of the process SEBoK lists a traceability matrix between the logical architecture elements and the system requirements.' },
        { kind: 'figure', slide: 'w10s1-three-views' },
        { kind: 'para', text: 'A function is an action that transforms inputs and generates outputs, involving data, materials or energies; those inputs and outputs are the flow items functions exchange. Some functions are deduced directly from functional and interface requirements; others are derived from the alternatives of the physical design. A static hierarchy of functions on its own does not show how the items flow. In the AeroLink chain on the slide, the booking function passes passenger information to the matching function, but no item carries the aircraft assignment on to dispatch, so the model shows no item between them: a logical architecture is only as connected as its items.' },
        { kind: 'figure', slide: 'w10s1-functions-io' },
        { kind: 'para', text: 'SEBoK collects the pitfalls: the logical architecture should relate back to the operational scenarios; beginners decompose too deeply; functions are listed without their inputs and outputs; a static decomposition is made before any scenario. And the practices: constitute scenarios of functions before a decomposition tree; alternate the functional and the behavioral view, a function “to move” and its mode “moving”; build a scenario in the order control flow, then input and output flows, then triggers. The lab’s review checklist uses these as criteria.' },
      ],
      sources: [R('R20b', '587–588'), R('R20b', '590–591'), R('R20b', '594'), R('R20c', '596'), R('R81', '90')],
    },
    {
      id: 'w10s1-l-structure',
      title: 'Logical parts, capabilities and requirement allocation',
      blocks: [
        { kind: 'para', text: `Each logical element is modeled with the definition and usage pattern you met in Week 8. A part definition gives the kind of element; a part usage is the element in this architecture, and usages inherit from their definitions. The course places one part, logicalArchitecture, in the Logical package and gives it one part usage per logical element, with the LOG ID as the usage’s quoted short name: a course convention. When a Week 9 placeholder has the same name as a Week 4 element, it becomes that element’s definition, so the requirements whose subject it is stay valid. When the names differ, the team links the placeholder to the element it stood for and the new definition specializes it; a specialization conforms, so those requirements stay valid too. AeroLink reuses ${numberWord(COUNTS.placeholdersReused)} placeholders and writes ${numberWord(COUNTS.newLogicalDefs)} new part definitions.` },
        { kind: 'figure', slide: 'w10s1-parts-logical' },
        { kind: 'para', text: `Capabilities enter as action definitions and functions as action usages, another course convention. Each function depends on the capability it was derived from, through a dependency tagged #derivedFrom, a course keyword; as always, from names the dependent element and to names what it depends on. Requirements whose Week 2 parent is a capability are linked the same way. They cannot use a derivation connection, because the library requires every end of a derivation to be a requirement, and a capability is an action definition. AeroLink model v0.3 writes ${COUNTS.fnCapLinks} such links from functions and ${COUNTS.reqCapLinks} from requirements.` },
        { kind: 'figure', slide: 'w10s1-capabilities' },
        { kind: 'para', text: `SEBoK asks that system requirements be assigned to functional and behavioral elements and traced. In SysML v2 an allocation specifies that the target is responsible for realizing some or all of the intent of the source, so each Week 4 allocation becomes an allocate from the requirement to the function, and the allocation matrix is read from the model. AeroLink has ${COUNTS.allocations} allocations; ${UNALLOCATED.join(', ')} are allocated to no function. They are interface requirements, and their disposition defers them to Week 11, when the interfaces are modeled. A gap with a disposition is honest; an invented allocation hides it.` },
        { kind: 'figure', slide: 'w10s1-req-allocation' },
        { kind: 'figure', slide: 'w10s1-worked-logical' },
      ],
      sources: [R('R70', '15–16'), R('R81', '90'), R('R81', '110'), R('R72', '30'), R('R115', '580'), R('R80', '50–51'), R('R20b', '591–592')],
    },
    {
      id: 'w10s1-l-actions',
      title: 'Functions as actions: parameters, perform and allocate',
      blocks: [
        { kind: 'para', text: 'An action definition is a kind of occurrence definition that classifies action performances, and an action usage is a usage of one or more action definitions. Features with direction in, out or inout are the action’s parameters. The parameters are typed by item definitions: things that exist in space and time but are not necessarily parts, which may flow; information, energy and material are all items. Each Week 4 information item becomes an item definition with its INFO ID, and each function gets an in parameter for every item it consumes and an out parameter for every item it produces. Where the information view has no item for a flow, the team adds one; an information item added this week takes the next INFO ID, because an ID is never reused.' },
        { kind: 'figure', slide: 'w10s1-action-def' },
        { kind: 'para', text: 'SysML v2 has two constructs for responsibility. Perform identifies the owner as the performer of an action defined elsewhere: in the body of a part, the part is the performer. Allocation specifies that a target is responsible for realizing some or all of the intent of a source; it maps across the structures of a model, can be made early, and, unlike in SysML v1, is not a dependency but a connection across model features. The training deck combines them: a logical part and a physical part each perform the same action, and an allocate maps the one to the other. The course convention follows that pattern: in the logical architecture, a function is allocated to a logical element by perform inside the element’s part usage; requirements are allocated to functions with allocate; and Week 11 allocates logical elements to physical ones.' },
        { kind: 'figure', slide: 'w10s1-perform-allocate' },
      ],
      sources: [R('R82', '117'), R('R72', '30'), R('R70', '17'), R('R72', '41'), R('R82', '136'), R('R81', '110–111'), R('R76', '106–107')],
    },
    {
      id: 'w10s1-l-flows',
      title: 'Action flows: successions, decisions, merges, forks and item flows',
      blocks: [
        { kind: 'para', text: 'A succession asserts that the first action must complete before the second can begin. A flow transfers items from an output parameter of one action to an input parameter of another; it models an actual transfer, which may take time, and a streaming flow can go on while both actions are performed. Only a succession flow adds the order: the first must finish producing its output before the second can begin consuming it. Written after an action, then is shorthand for a succession from the lexically previous action, and an action can be decomposed directly into other actions. Two actions with no succession between them have no order in the model, however the text lays them out.' },
        { kind: 'figure', slide: 'w10s1-successions' },
        { kind: 'para', text: 'A conditional succession is taken only if its guard is true; if the guard is false, the succession is not possible. A decision node chooses exactly one successor and is usually followed by conditional successions; else marks the branch taken when every guard of the set is false. A merge node waits for any one predecessor before continuing, and a fork enables all its successors while a join waits for all its predecessors. The target of a conditional succession must be named, not declared in place: declare the action on its own line and name it in the branch. Use a fork only where the ConOps says two things happen at the same time; a fork where the ConOps has a choice is an error no checker reports.' },
        { kind: 'figure', slide: 'w10s1-decide-merge' },
        { kind: 'para', text: 'The driving question had three guards on a whole-number triage score and no else. A score of 3 satisfies none of them, so no successor is possible, and the model gives that case no valid continuation. The opposite defect is an overlap: when two guards can both be true, the model says only that one of the possible successors is chosen, not which. These consequences are the course’s reasoning from the semantics, and the checker evaluates neither: both the gap and its correction pass without a message. The correction covers every case with else.' },
        { kind: 'figure', figure: { id: 'w10s1-listing-guard-gap', caption: 'The driving question’s decision as a checked file: three guards and no else. Checked: PASS. (FICTIONAL)', alt: listingAlt('guard-gap') } },
        { kind: 'figure', figure: { id: 'w10s1-listing-guard-covered', caption: 'The corrected decision: else takes every remaining score. Checked: PASS. (FICTIONAL)', alt: listingAlt('guard-covered') } },
        { kind: 'figure', slide: 'w10s1-gap-reveal' },
        { kind: 'figure', slide: 'w10s1-fork-join' },
        { kind: 'para', text: `Items move between steps through item flows. In AeroLink model v0.3 each step subsets its function and so has that function’s parameters; a flow is written wherever an earlier step’s function produces an item that a later step’s function consumes. SCN-002 has ${COUNTS.itemFlows}. Transfers can also be asynchronous: a send action sends values to a target or through a port, and an accept action receives them. The course keeps send and accept for organizational boundaries, such as the flight intent filed with the air traffic service, and completes them in Week 11 with ports.` },
        { kind: 'figure', slide: 'w10s1-item-flows' },
      ],
      sources: [R('R72', '30–38'), R('R72', '40'), R('R72', '45–46'), R('R82', '118'), R('R82', '134–136')],
    },
    {
      id: 'w10s1-l-worked',
      title: 'Worked example: SCN-002 as an action flow',
      blocks: [
        { kind: 'para', text: `${SCN2.id}, ${SCN2.name}, has ${SCN2.steps.length} steps and ${SCN2.alternates.length} alternates in the Week 2 ConOps. A use case’s required behavior can be specified as for an action, so the flow is written inside the scenario’s use case, which Session 2 explains. The method has five moves: map every step and alternate to a node and a construct; write the main path with then, one action per step, subsetting its function where one exists; write a decision with one guarded branch per alternate and else where each condition becomes known: before the step it branches from, when the condition is known before the step happens (the alternate then replaces the step), or after it; a decision can sit only before or after a whole step, so a condition that becomes known in the middle of a step needs that step split; put a merge before every step an alternate rejoins, and done after an alternate that ends; then add the item flows.` },
        { kind: 'table', header: ['ConOps item', 'Flow node', 'Construct'], rows: FLOW_NODES.map((n) => [n.conops, n.name, n.construct]), caption: `The mapping table of ${SCN2.id}, read from the generated flow (FICTIONAL)` },
        { kind: 'figure', slide: 'w10s1-worked-scn002' },
        { kind: 'figure', figure: { id: 'w10s1-listing-scn002-b', caption: 'The second part of the SCN-002 flow: the merge where A2 rejoins, the decision on the destination pad before step 6, and the merge where A1 rejoins. Checked: PASS. (FICTIONAL)', alt: listingAlt('scn002-b') } },
        { kind: 'para', text: `Read the result. The external actor’s step, the air traffic service accepting the intent, is an action with no function of the system, preceded by the decision on its outcome, because a rejected intent replaces the acceptance; the pad check likewise comes before landing. The ${numberWord(alts.length)} alternates become guarded branches, ${numberWord(merges.length)} of them rejoining through merges and one ending at done. The guards are named conditions, not computed comparisons, and two steps subset the same flight function. Those are modeling choices to state in your review, not errors. The ${numberWord(ITEM_FLOWS.length)} item flows come from the functions’ items: the plan travels from planning to filing the intent and to the flight, and the passenger party travels through boarding, the flight and deplaning.` },
      ],
      sources: [R('R72', '30–38'), R('R76', '101')],
    },
    {
      id: 'w10s1-l-checker',
      title: 'What the checker can and cannot tell you',
      blocks: [
        { kind: 'para', text: `The course checker, the SysML v2 pilot implementation, decides whether a file parses, whether every name resolves and whether any validation rule fires. On behavior constructs it rejects ${rejected.map((c) => c.what.toLowerCase()).join('; ')}. It accepts, without any message, ${accepted.map((c) => c.what.toLowerCase()).join('; ')}. Note what the parallel-state rejection does and does not mean: the checker rejects any transition owned by the parallel state itself, even within one region, and accepts a transition between regions that is written inside a region, so crossing regions is for a reviewer to catch. The predict card was rejected at its branch, because a branch target must be named, not declared. Those results are recorded for the course release; a new release may report more or less.` },
        { kind: 'figure', slide: 'w10s1-checker' },
        { kind: 'para', text: 'So zero errors is necessary and never sufficient. For every flow you model, check that each ConOps step and alternate has a node in order, that each decision has else, that each alternate ends or rejoins where the ConOps says, and that a fork stands only where things happen at the same time. Before Session 2, map one step and one alternate of your team’s scenario with the most alternates.' },
        { kind: 'slide-ref', slide: 'w10s1-exit', text: 'See the exit card.' },
      ],
      sources: [R('R72', '35'), R('R82', '136'), R('R82', '146')],
    },
  ],
}
