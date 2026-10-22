// Week 10 readiness quiz Q10 (individual, formative), kept separate from the lecture (DECISION_LOG A20). Every item is
// answerable from the Week 10 lectures and the detailed lesson: `lecture` names the slide that teaches it and the lesson
// section that explains it; every option's explanation names that slide and cites the register page or training-deck
// slide the answer rests on (or, for a course convention, says so in courseSource and in the key). Contexts are unseen
// and never AeroLink, and none uses the applied exercise's setting (a bike-share service). Keys are spread a–d three times
// each, the key's length rank varies so that each rank occurs three times with no run of three, and the cue rules of the
// Weeks 3–9 quizzes apply (quizWeek10.test.ts). New items, pending independent review.
import type { QuizQuestion } from './schema'

const PENDING = 'new-pending-review' as const
type Opt = [id: 'a' | 'b' | 'c' | 'd', text: string, why: string]
/** An item: the key's id, its options with explanations, the citation the key rests on, the slide and lesson section.
 *  Training-deck citations (unit slide) are written “sl.”; specification and SEBoK pages “p.”/“pp.”. */
function item(id: string, bloom: QuizQuestion['bloom'], objective: string, prompt: string, key: Opt[0], opts: Opt[], cite: { reading: string; pages: string }, lecture: { session: 1 | 2; slide: string; section: string }, courseSource?: string): QuizQuestion {
  const deck = ['R72', 'R73', 'R76'].includes(cite.reading)
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
    lecture: { week: 10, session: lecture.session, slide: lecture.slide, section: lecture.section },
  }
}

export const WEEK10_QUIZ: QuizQuestion[] = [
  item('w10q-1', 'Understand', 'W10.1', 'A logistics company’s architects describe their warehouse system in two views. Which description belongs to the logical view rather than the physical one?', 'b', [
    ['a', 'The racks, conveyors and scanners bought for each building, each with its part number', 'Purchased elements with part numbers are a concrete solution: the physical architecture accommodates the logical one.'],
    ['b', 'What must be done, and which element does it, kept free of implementation choices', 'The logical architecture describes the functionality and behavior as the system should operate (SEBoK p.587), and the selected one is as far as possible independent of implementation decisions (p.592).'],
    ['c', 'Cable routes and network switches joining the scanners to the servers', 'Cables and switches are physical elements and physical interfaces, the subject of the physical architecture.'],
    ['d', 'The supplier contracts and delivery dates for the conveyor hardware', 'Contracts and delivery dates belong to acquisition planning, not to either architecture view.'],
  ], { reading: 'R20b', pages: '587–592' }, { session: 1, slide: 'w10s1-logical-vs-physical', section: 'w10s1-l-logical' }),

  item('w10q-2', 'Analyse', 'W10.1', 'A library-loan system’s function list names “register loan”, “send reminder” and “record return”, each with a one-line description and nothing else. Which pitfall from the logical-architecture literature does the list show?', 'd', [
    ['a', 'Decomposition too deep: three functions are more than a system this size needs', 'Three leaf functions is a shallow list; too deep means too many levels or too many functions and flows.'],
    ['b', 'Mixing governance and operation, as reminders are a management decision', 'Sending a reminder is an operation of the system; nothing here mixes strategic monitoring into it.'],
    ['c', 'Problem relevance: the list relates to no scenario', 'A loan system has scenarios (borrow, renew, return); the defect in the list is something else.'],
    ['d', 'Functions considered apart from the inputs and outputs they transform', 'SEBoK names forgetting the inputs and outputs of functions as a pitfall: they are integral parts of a function.'],
  ], { reading: 'R20b', pages: '594' }, { session: 1, slide: 'w10s1-pitfalls', section: 'w10s1-l-logical' }),

  item('w10q-3', 'Apply', 'W10.2', 'In a building-permit flow, after “review application” exactly one of “approve” or “reject” must follow. Which fragment says so?', 'a', [
    ['a', 'then decide; if complete then approve; else reject;', 'A decision node chooses exactly one successor; the last conditional succession can be replaced by else.'],
    ['b', 'then fork; then approve; then reject;', 'A fork enables all its successors, so both would happen.'],
    ['c', 'then approve; then reject;', 'Two plain successions order both actions one after the other: both happen.'],
    ['d', 'then merge m; then approve;', 'A merge waits for one of several predecessors; it chooses nothing, and reject never happens here.'],
  ], { reading: 'R72', pages: '38' }, { session: 1, slide: 'w10s1-decide-merge', section: 'w10s1-l-flows' }),

  item('w10q-4', 'Analyse', 'W10.2', 'A warehouse picking action contains, in this order, the lines “action pick; then action pack; action label;” and nothing else relates them. What ordering does the text assert?', 'c', [
    ['a', 'Pick, then pack, then label, since the text lists them in that order', 'Lexical order alone asserts nothing; only successions, then included, order actions.'],
    ['b', 'Label after pack, because a declaration follows the previous one', 'A declaration without then is not a succession, so label is not ordered after pack.'],
    ['c', 'Pack follows pick; label is not ordered by either one', 'Then is shorthand for a succession from the lexically previous action, so pack follows pick and nothing orders label.'],
    ['d', 'No ordering, since then needs a first statement before it', 'Then can follow any action usage; the previous action becomes the source of the succession.'],
  ], { reading: 'R72', pages: '33' }, { session: 1, slide: 'w10s1-then-decomposition', section: 'w10s1-l-flows' }),

  item('w10q-5', 'Evaluate', 'W10.2', 'A sensor-alarm flow decides on a reading r with three branches: if r > 80 then alarm; if r > 50 and r <= 80 then warn; if r < 40 then log. There is no else. What should a reviewer report?', 'a', [
    ['a', 'A band of readings between the guards has no possible successor', 'When a guard is false its succession is not possible, so for readings no guard covers, the flow cannot continue.'],
    ['b', 'The flow is invalid, so the checker rejects the file', 'The checker evaluates no guard; a decision whose guards leave a gap passes with no message.'],
    ['c', 'Readings above 80 sound the alarm and also give the warning together', 'The guards do not overlap above 80, and a decision chooses exactly one successor in any case.'],
    ['d', 'Nothing, because a decision picks some branch for each of the readings', 'A decision chooses one possible successor; where no guard is true there is none to choose.'],
  ], { reading: 'R72', pages: '35' }, { session: 1, slide: 'w10s1-gap-reveal', section: 'w10s1-l-flows' }),

  item('w10q-6', 'Apply', 'W10.2', 'An online shop’s dispatch flow says the customer is notified and the label is printed at the same time, and the parcel leaves when both are done. Which nodes model this?', 'd', [
    ['a', 'A decide before the two actions and a merge after them, in that order', 'A decision chooses one of the two actions, so only one would happen.'],
    ['b', 'A merge first and a decide last', 'A merge chooses nothing and a decision after the actions does not wait for both.'],
    ['c', 'Notify, then print, as two successions', 'Successions order the actions one after the other; nothing then runs at the same time.'],
    ['d', 'A fork before the two actions and a join after them', 'A fork enables all its successors, and a join waits for all its predecessors before the parcel leaves.'],
  ], { reading: 'R72', pages: '40' }, { session: 1, slide: 'w10s1-fork-join', section: 'w10s1-l-flows' }),

  item('w10q-7', 'Apply', 'W10.4', 'An elevator door model needs a transition from closed to opening when a call arrives, provided the car is level, releasing the brake as its effect. In what order does the textual notation write the parts after the source state?', 'b', [
    ['a', 'Guard, trigger, effect, then target state', 'The guard comes after the trigger; written first it is a syntax error.'],
    ['b', 'Trigger, guard, effect, then the target', 'The transition accepts its trigger, then checks the guard, performs the effect when it fires, and enters the target.'],
    ['c', 'Effect first, then trigger and guard, then the target', 'The effect is performed when the transition fires, so it is written after the trigger and guard.'],
    ['d', 'Target state, trigger, guard and the effect last', 'The target closes the transition: then names it at the end.'],
  ], { reading: 'R73', pages: '53' }, { session: 2, slide: 'w10s2-transitions', section: 'w10s2-l-states' }),

  item('w10q-8', 'Analyse', 'W10.4', 'A drone’s state model is a parallel state with two regions, flight and battery, and a transition from “hovering” in flight to “low” in battery. What rule is broken, and what fix keeps the meaning?', 'c', [
    ['a', 'The rule is met; regions may share transitions freely', 'The training deck says the opposite: transitions are not allowed between concurrent states.'],
    ['b', 'Each region needs its own initial state; add one to battery', 'A missing initial state is a different defect; the regions here are not the issue.'],
    ['c', 'No transitions between concurrent regions; keep each in its region', 'The substates of a parallel state are concurrent, so a transition between them is not allowed; each region keeps its own transitions.'],
    ['d', 'A parallel state needs an else; add one to the flight region', 'Else belongs to conditional successions out of a decision, not to parallel states.'],
  ], { reading: 'R73', pages: '51' }, { session: 2, slide: 'w10s2-parallel', section: 'w10s2-l-states' }),

  item('w10q-9', 'Apply', 'W10.3', 'A ferry operator models a state usage vesselStates and a part definition Vessel. Which line inside Vessel makes the vessel the part whose condition those states describe?', 'd', [
    ['a', 'do vesselStates;', 'A do action names an action performed while in a state; it does not make a part exhibit states.'],
    ['b', 'satisfy vesselStates by vessel;', 'Satisfy asserts that a requirement holds for a bound feature; a state usage is not a requirement.'],
    ['c', 'allocate vessel to vesselStates;', 'An allocation maps responsibility for realizing intent; it does not say which part is in the states.'],
    ['d', 'exhibit vesselStates;', 'Exhibit identifies the part that exhibits states defined elsewhere.'],
  ], { reading: 'R73', pages: '56' }, { session: 2, slide: 'w10s2-exhibit', section: 'w10s2-l-states' }),

  item('w10q-10', 'Understand', 'W10.5', 'A city library’s use case “borrow media” includes “check membership”. Which statement about the included use case is true?', 'a', [
    ['a', 'It shares the subject; its actors must be bound explicitly', 'The subject of a nested or included use case is bound to that of its container, but its actors must be bound explicitly.'],
    ['b', 'It must have a different subject from the use case that includes it', 'The included use case has the same subject as the containing one.'],
    ['c', 'It extends the containing use case, as an optional addition', 'Include performs the included use case; the traditional extend relationship is not supported yet.'],
    ['d', 'Its actors are bound to those of the containing one automatically', 'The subject is bound implicitly; the actors are not, and must be bound explicitly.'],
  ], { reading: 'R76', pages: '101' }, { session: 2, slide: 'w10s2-include', section: 'w10s2-l-usecases' }),

  item('w10q-11', 'Apply', 'W10.1', 'In a clinic’s logical architecture, the logical element Triage is responsible for the function assessUrgency. Following the course convention, how is that allocation written?', 'c', [
    ['a', 'action triage :> assessUrgency;', 'Subsetting makes a step an occurrence of a function; it names no performer.'],
    ['b', 'satisfy assessUrgency by triage;', 'Satisfy relates a requirement to a design feature; a function is not a requirement.'],
    ['c', 'part triage : Triage { perform assessUrgency; }', 'By course convention, a function is allocated to a logical element by perform inside the element’s part usage, which makes the part the performer.'],
    ['d', 'item def Triage { attribute assessUrgency : Boolean; }', 'An item definition with an attribute turns the function into a value; it relates no performer to an action.'],
  ], { reading: 'R72', pages: '41' }, { session: 1, slide: 'w10s1-perform-allocate', section: 'w10s1-l-actions' }, 'course convention: a function is allocated to a logical element by perform in its part usage (slide w10s1-perform-allocate)'),

  item('w10q-12', 'Evaluate', 'W10.3', 'A boiler’s state definition declares two initial states, and the course checker reports nothing. What should the reviewer conclude?', 'b', [
    ['a', 'The model is correct, because the checker found no error', 'The checker accepts two initial states silently; a clean log is not correctness.'],
    ['b', 'Defective: one substate is active after entry, so drop one', 'In a non-parallel state with substates exactly one substate is active after entry; course reasoning from that rule and from the initial-state succession: a second initial state asks for a second active substate, which the rule excludes.'],
    ['c', 'The boiler starts in both states, which models redundancy', 'Concurrent substates need a parallel state; two initial states in a non-parallel one do not model redundancy.'],
    ['d', 'A second initial state replaces the first one silently', 'No such rule exists; by the course’s reasoning from the one-active-substate rule, the model asks for two active substates at once.'],
  ], { reading: 'R82', pages: '146' }, { session: 2, slide: 'w10s2-predict-reveal', section: 'w10s2-l-errors' }),
]
