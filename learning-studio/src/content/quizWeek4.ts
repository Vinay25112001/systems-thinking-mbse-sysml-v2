// Week 4 readiness quiz Q4 (individual, formative), kept separate from the lecture (DECISION_LOG A20). Every item is
// answerable from the Week 4 lectures and the detailed lesson: `lecture` names the slide that teaches it and the lesson
// section that explains it, and the item cites the register page its key rests on. Contexts are unseen and never AeroLink.
// Keys are authored across a–d, three each, and the key's length rank among the four options (1 = longest … 4 = shortest)
// occurs exactly three times per rank with no run of three, so no "pick the n-th longest" rule scores above 25 %
// (quizWeek4.test.ts asserts it). Review Mo6 (2026-10-19): no key is the length outlier or the option farthest in length
// from the other three more often than chance, the throwaway options are replaced, Q4 is four noun phrases (no grammar
// cue) and the Q5/Q6 keys no longer echo the prompt's wording. New items, pending independent review.
import type { QuizQuestion } from './schema'

const PENDING = 'new-pending-review' as const

export const WEEK4_QUIZ: QuizQuestion[] = [
  {
    id: 'w4q-1', bloom: 'Understand', objective: 'W4.4', review: PENDING,
    prompt: 'A hospital team produces four things while designing its patient-records system. Which one is part of the architecture itself rather than of its description?',
    options: [
      { id: 'a', text: 'The decision that every ward sends its records through one central hub', correct: true, explanation: 'Correct. A decision about elements and their relationships is part of the architecture, which SEBoK calls conceptual and realized through a description (Session 1, slide 4).' },
      { id: 'b', text: 'The block diagram on page 12 of the design report, showing every ward', correct: false, explanation: 'A diagram is a view in the description; it depicts the architecture but is not the architecture.' },
      { id: 'c', text: 'The slide deck the chief engineer showed to the hospital board', correct: false, explanation: 'A presentation communicates the architecture to one audience; it is part of the description.' },
      { id: 'd', text: 'A table of each ward’s software version and update date', correct: false, explanation: 'A table of facts is an artifact of the description; on its own it records no architectural concept or principle.' },
    ],
    cite: { reading: 'R39t', pages: '1445' },
    lecture: { week: 4, session: 1, slide: 'w4s1-architecture', section: 'w4-lesson-description' },
  },
  {
    id: 'w4q-2', bloom: 'Understand', objective: 'W4.1', review: PENDING,
    prompt: 'A water-treatment team writes: “For the maintenance staff, show every pump with its service interval and last inspection, as one table per plant.” In the SEBoK wording, what has the team written?',
    options: [
      { id: 'a', text: 'A view: the table of pumps itself', correct: false, explanation: 'The view is the table produced for a particular plant; the sentence is the rule that says how to build it.' },
      { id: 'b', text: 'A model of the pumps and their maintenance behavior over the life of each plant', correct: false, explanation: 'A model represents how objects fit and behave; the sentence describes what to show and for whom.' },
      { id: 'c', text: 'A viewpoint: conventions for building a view for a stakeholder’s concern', correct: true, explanation: 'Correct. SEBoK’s glossary defines a viewpoint as a specification of the conventions and rules for constructing and using a view to address stakeholder concerns (Session 1, slide 6).' },
      { id: 'd', text: 'An architecture framework', correct: false, explanation: 'A framework sets conventions for describing architectures across a domain or community, not one rule for one stakeholder.' },
    ],
    cite: { reading: 'R39w', pages: '1678' },
    lecture: { week: 4, session: 1, slide: 'w4s1-vocabulary', section: 'w4-lesson-description' },
  },
  {
    id: 'w4q-3', bloom: 'Apply', objective: 'W4.1', review: PENDING,
    prompt: 'A regional transit agency wants one more view for its finance board. Which purpose statement best follows the advice that purpose is paramount?',
    options: [
      { id: 'a', text: 'Show all the agency’s systems on one diagram', correct: false, explanation: 'A view for its own sake answers no stakeholder question; MITRE warns against producing views beyond the purpose.' },
      { id: 'b', text: 'Will the new fare system recover its cost within five years, and which elements drive the cost?', correct: true, explanation: 'Correct. The purpose is a question that lets the board reason about whether its objective will be met (Session 1, slide 7).' },
      { id: 'c', text: 'Use the framework’s standard financial view template, so the view looks like every other agency’s finance view', correct: false, explanation: 'A template is a starting point; the purpose still has to say what the board needs to conclude.' },
      { id: 'd', text: 'Describe the network in as much detail as the engineers can provide, and leave nothing important out', correct: false, explanation: 'Maximum detail is not a purpose; it buries the board’s question.' },
    ],
    cite: { reading: 'R62', pages: '344' },
    lecture: { week: 4, session: 1, slide: 'w4s1-choosing-views', section: 'w4-lesson-choosing-views' },
  },
  {
    id: 'w4q-4', bloom: 'Apply', objective: 'W4.2', review: PENDING,
    prompt: 'A water utility’s draft functional view has four boxes, all written as nouns. Which box names a physical element rather than a transformation?',
    options: [
      { id: 'a', text: 'Raw water treatment', correct: false, explanation: 'A transformation written as a noun (raw water in, treated water out). It should be renamed “Treat raw water”, but it is a function, not an element.' },
      { id: 'b', text: 'Chlorine residual monitoring', correct: false, explanation: 'A transformation written as a noun: readings in, a residual level out. Rename it “Monitor chlorine residual”; it is still a function.' },
      { id: 'c', text: 'Treated water storage for peak demand', correct: false, explanation: 'A transformation in time written as a noun: water in now, water out at the peak. Rename it “Store treated water”.' },
      { id: 'd', text: 'Booster pumping station at the reservoir', correct: true, explanation: 'Correct. A pumping station is an element that may perform a function such as “Raise water pressure”; functions are named as actions, verb and object, never as an element (Session 1, slide 9).' },
    ],
    cite: { reading: 'R20b', pages: '587' },
    lecture: { week: 4, session: 1, slide: 'w4s1-function', section: 'w4-lesson-functions' },
  },
  {
    id: 'w4q-5', bloom: 'Analyse', objective: 'W4.2', review: PENDING,
    prompt: 'A team’s function tree for a drone delivery service has six levels, down to “press the launch button”, and was built from the capability list without walking any scenario. Which two pitfalls has it hit?',
    options: [
      { id: 'a', text: 'Too deep a decomposition, and not related back to the operating scenarios', correct: true, explanation: 'Correct. SEBoK lists decomposing too deeply and not relating the architecture back to the operational scenarios among its pitfalls (Session 1, slide 11).' },
      { id: 'b', text: 'Too few first-level functions under the mission, and too few physical elements', correct: false, explanation: 'The tree is functional, and nothing in the case says the first level is too narrow; element counts are not the problem described.' },
      { id: 'c', text: 'Functions named with verbs, and inputs listed before outputs', correct: false, explanation: 'Verb names are the rule, not a pitfall, and the order in which inputs and outputs are listed does not matter.' },
      { id: 'd', text: 'A black-box mission function at the top, and leaves at uneven depths', correct: false, explanation: 'Starting from the mission as a black box is SEBoK’s recommended start, and leaves may stop at different depths where a solution becomes imaginable.' },
    ],
    cite: { reading: 'R20b', pages: '594' },
    lecture: { week: 4, session: 1, slide: 'w4s1-decomposition', section: 'w4-lesson-functions' },
  },
  {
    id: 'w4q-6', bloom: 'Analyse', objective: 'W4.2', review: PENDING,
    prompt: 'A library allocates both “Check out a book” and “Count the inventory” to its RFID gate system, because both read and write the same tag data. Which SEBoK affinity criterion justifies the allocation?',
    options: [
      { id: 'a', text: 'Environment resistance level: both run at the library entrance', correct: false, explanation: 'Standing at the entrance is a location, not an environment the element must withstand; the stated reason is the data.' },
      { id: 'b', text: 'Ease of handling: the gate hardware is light and easy to move', correct: false, explanation: 'Ease of handling is an aim of a candidate physical architecture, and the justification is about data, not weight.' },
      { id: 'c', text: 'Exchange of the same type of flow: one information flow for both', correct: true, explanation: 'Correct. Both functions exchange the same information flow, the tag data, which is one of SEBoK’s affinity criteria (Session 1, slide 15).' },
      { id: 'd', text: 'Execution at a close frequency level: both run as each book passes', correct: false, explanation: 'Check-out runs as each book passes, but inventory counts run rarely; the stated reason is the shared data.' },
    ],
    cite: { reading: 'R20c', pages: '598' },
    lecture: { week: 4, session: 1, slide: 'w4s1-criteria', section: 'w4-lesson-allocation' },
  },
  {
    id: 'w4q-7', bloom: 'Analyse', objective: 'W4.2', review: PENDING,
    prompt: 'At the first design review of a farm-robot system, an engineer allocates the function “Navigate the field” directly to “GPS receiver firmware module v2”. What is the problem?',
    options: [
      { id: 'a', text: 'Navigation should be allocated to the farmer, a human operation', correct: false, explanation: 'Human operations can be allocation targets, but nothing says a person navigates; the problem is the skipped levels, not the kind of element.' },
      { id: 'b', text: 'A high-level function went straight to a technology', correct: true, explanation: 'Correct. SEBoK’s pitfall: allocating high-level functions directly to the lowest technology level instead of alternating logical and physical levels (Session 1, slide 16).' },
      { id: 'c', text: 'The firmware should have been given its own scenario before any allocation, as every element needs one', correct: false, explanation: 'Scenarios exercise functions, not elements; the issue is the skipped levels.' },
      { id: 'd', text: 'GPS belongs to an external system, so the function is allocated elsewhere', correct: false, explanation: 'The receiver is part of the robot; the problem is the level of the allocation, not ownership.' },
    ],
    cite: { reading: 'R20c', pages: '602' },
    lecture: { week: 4, session: 1, slide: 'w4s1-pitfalls', section: 'w4-lesson-allocation' },
  },
  {
    id: 'w4q-8', bloom: 'Analyse', objective: 'W4.4', review: PENDING,
    prompt: 'A rail operator’s control room receives four items. Which one is information rather than data, in SEBoK’s sense?',
    options: [
      { id: 'a', text: 'Axle-counter readings', correct: false, explanation: 'Raw values from a sensor: data.' },
      { id: 'b', text: 'A list of train positions, one per second, as received from the signaling system', correct: false, explanation: 'Positions as received are values without analysis or context: data.' },
      { id: 'c', text: 'The timetable file with every planned arrival and departure time for the day', correct: false, explanation: 'A record of planned times; it becomes information when compared with what is happening.' },
      { id: 'd', text: 'Train 14 will miss its connection at the junction by four minutes', correct: true, explanation: 'Correct. Positions and timetable have been structured, put in context and analyzed into a statement someone can act on (Session 2, slide 3).' },
    ],
    cite: { reading: 'R21', pages: '512' },
    lecture: { week: 4, session: 2, slide: 'w4s2-data-information', section: 'w4-lesson-information' },
  },
  {
    id: 'w4q-9', bloom: 'Apply', objective: 'W4.3', review: PENDING,
    prompt: 'A campus shuttle service records an item: producer, the bus GPS units; consumer, the duty dispatcher’s console. What should the third field, the decision supported, say?',
    options: [
      { id: 'a', text: 'Bus positions every ten seconds, with a time stamp for each', correct: false, explanation: 'That is the content of the item, not a decision.' },
      { id: 'b', text: 'Whether to send a spare bus to a stop where riders are waiting', correct: true, explanation: 'Correct. The field names a decision the consumer makes with the item; if none can be named, the item is not information yet (Session 2, slide 4).' },
      { id: 'c', text: 'Kept for a year, then deleted', correct: false, explanation: 'Retention is metadata, not the decision supported.' },
      { id: 'd', text: 'Shown as moving dots on a live map at the console', correct: false, explanation: 'A presentation format is not a decision.' },
    ],
    cite: { reading: 'R21', pages: '515' },
    lecture: { week: 4, session: 2, slide: 'w4s2-producer-consumer', section: 'w4-lesson-info-view' },
  },
  {
    id: 'w4q-10', bloom: 'Analyse', objective: 'W4.3', review: PENDING,
    prompt: 'A clinic and a testing laboratory have signed a service agreement. The clinic’s information view shows lab results flowing from the laboratory to the clinic, along the agreement line. What does the course rule say?',
    options: [
      { id: 'a', text: 'The flow has no carrier yet: an agreement records duties but carries no data', correct: true, explanation: 'Correct. An organizational agreement records duties; the flow needs an information interface or a recorded relay (Session 2, slide 5).' },
      { id: 'b', text: 'It is covered, because the agreement obliges the laboratory to send the results to the clinic', correct: false, explanation: 'An obligation to send is not a means of sending.' },
      { id: 'c', text: 'Results are just data, so the rule does not apply and no route is needed at all', correct: false, explanation: 'Every flow between two elements needs a route, whatever it carries.' },
      { id: 'd', text: 'It is covered if the laboratory is inside the enterprise boundary of the clinic', correct: false, explanation: 'Ownership changes how the interface is governed, not whether one is needed.' },
    ],
    cite: { reading: 'R62', pages: '345' },
    lecture: { week: 4, session: 2, slide: 'w4s2-flows-check', section: 'w4-lesson-info-view' },
  },
  {
    id: 'w4q-11', bloom: 'Analyse', objective: 'W4.6', review: PENDING,
    prompt: 'An emergency department’s AI triage card lists inputs (vital signs), outputs (a priority score) and a failure mode (under-scoring a rare condition). Which field is missing?',
    options: [
      { id: 'a', text: 'Its accuracy on last year’s test data, broken down by patient age group', correct: false, explanation: 'Useful evidence, but the card can be complete without it; a missing oversight field is a defect.' },
      { id: 'b', text: 'The vendor that supplied the model and the version number of the software release', correct: false, explanation: 'Provenance is metadata; it does not say who decides.' },
      { id: 'c', text: 'The ward that owns the triage screen', correct: false, explanation: 'Ownership is metadata about the element; it does not say who decides each case or what the AI may not do.' },
      { id: 'd', text: 'Who decides each case, and what the AI may not do alone', correct: true, explanation: 'Correct. The card needs human oversight; SEBoK keeps a human in the loop to validate what an intelligent system has learned (Session 2, slide 7).' },
    ],
    cite: { reading: 'R31', pages: '1370' },
    lecture: { week: 4, session: 2, slide: 'w4s2-ai', section: 'w4-lesson-ai' },
  },
  {
    id: 'w4q-12', bloom: 'Evaluate', objective: 'W4.5', review: PENDING,
    prompt: 'A port authority’s decision record reads: “Decision: one central crane-scheduling server. Rationale: it is the standard choice.” How should a reviewer judge it?',
    options: [
      { id: 'a', text: 'Acceptable, since the choice is stated clearly and the rationale is short enough to read quickly', correct: false, explanation: 'Clarity of the choice is not enough; nothing shows it was weighed against anything.' },
      { id: 'b', text: 'Acceptable if the server meets its availability requirement', correct: false, explanation: 'Meeting a requirement does not show the choice was better than the alternatives.' },
      { id: 'c', text: 'Not reviewable: no alternatives, no tested rationale', correct: true, explanation: 'Correct. A decision record lists the alternatives considered and a rationale tested against needs and risks; derived requirements trace to it (Session 1, slide 18).' },
      { id: 'd', text: 'Wrong: a central server is a single point of failure, so reverse it', correct: false, explanation: 'A central server with a standby can be the right choice; the record is not wrong but unreviewable, because it does not show the reasoning.' },
    ],
    cite: { reading: 'R48c', pages: '146' },
    lecture: { week: 4, session: 1, slide: 'w4s1-decision', section: 'w4-lesson-allocation' },
  },
]
