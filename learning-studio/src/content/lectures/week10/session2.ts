// Week 10, Session 2 lecture: Logical / Behavioral Modeling — operating states, use cases, consistency and the Lab L10
// launch. Retrieval (three drafts of one ConOps branch), the function and its operational mode, state definitions,
// transitions (trigger, guard, effect, target), entry and do actions, parallel states, exhibit and the four links from
// behavior to structure, worked example III (the AeroLink aircraft's operating states), predict the checker on three state
// listings; use cases, include, worked example IV (the five AeroLink scenarios as use cases); the flow-and-states
// cross-check, common errors, the behavior review checklist, the mapping from the team's package to model v0.3, the bridge
// to Week 11; and 22 minutes of laboratory launch.
// 75-minute session: 69 minutes (47 lecture + 22 lab launch) on 22 slides plus the generated references slide, and a
// 6-minute buffer. Single source for the slide viewer, the faculty notes, the .pptx and the student lesson.
//
// Review status: new-pending-review. Written 2026-10-22 from docs/lectures/week10/WEEK10_LECTURE_OUTLINE.md §3, with
// these changes recorded in the milestone report: the interaction view (outline S2.14) and the SCN-005 flow sketch
// (S2.15) are not taught; their minutes go to a predict-and-reveal pair on states and to the mapping slide; the
// cross-check is computed from the generated model (./aerolinkCase.ts CROSS_CHECK), not drawn by hand.
//
// Accuracy rules: as Session 1. R73 is the textual-notation training deck slides 48-56 (states), R72 slides 30-47
// (actions), R76 slides 100-107 (use cases, allocation), R82 the SysML v2.1 Beta 2 Part 1 clause 7.17-7.18 (actions,
// states), R116 clause 7.25 (use cases), R20b SEBoK Logical Architecture. The review checklist, the cross-check method,
// the enterprise as use-case subject and the step subsetting are course conventions, labeled as such. Every recorded
// checker result is read from ./listings.ts; AeroLink values are FICTIONAL and come from ./aerolinkCase.ts.
import type { Lecture } from '../types'
import { numberWord } from '../week01/aerolinkCase'
import { AEROLINK_W10_MODEL, COUNTS, CROSS_CHECK, MACHINE, THREAD, TRANSITION_SOURCES, W10_DISPOSITIONS, scenarioOf } from './aerolinkCase'
import { EXERCISE_MINUTES, LAB10_MINIMUMS, LAB10_OUTPUTS, LAB10_PERSON_HOURS, LAB10_TEAM_HOURS, LAB10_TEAM_HOURS_THREE, REVIEW_CHECKS, SEVEN_DAY_PLAN, W10_MAPPING } from './labBrief'
import { listing, listingText } from './listings'

export const WEEK10_S2_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const listingAlt = (key: string) => {
  const l = listing(key)
  return `Listing (course file sysml/${l.file}, checked: ${l.status}): ${listingText(key)}`
}
const M = AEROLINK_W10_MODEL.machine!
const UC = AEROLINK_W10_MODEL.useCases
const outputFiles = LAB10_OUTPUTS.map((o) => o.file)
const EACH_FOUR = Math.round((LAB10_TEAM_HOURS / 4) * 10) / 10
const EACH_THREE = Math.round((LAB10_TEAM_HOURS_THREE / 3) * 10) / 10
const pTwo = listing('predict-two-initial')
const pPar = listing('predict-parallel')
const pOwned = listing('parallel-owned')
const pUnr = listing('predict-unreachable')
const guarded = M.transitions.filter((t) => t.guard)
const matched = CROSS_CHECK.filter((r) => r.steps.length)
const unmatched = CROSS_CHECK.filter((r) => !r.steps.length)
const docOnly = UC.filter((u) => u.unmapped.length)
const actorsModeled = UC.reduce((a, u) => a + u.actors.length, 0)
const SCN2 = scenarioOf('SCN-002')
const sourceOf = (t: { from: string; to: string }) => TRANSITION_SOURCES[`${t.from}→${t.to}`] ?? 'course reading'
const listOf = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`)

export const WEEK10_SESSION2: Lecture = {
  week: 10,
  session: 2,
  title: 'Logical / Behavioral Modeling',
  subtitle: 'Session 2: States, use cases, consistency and the lab launch',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ E. operating states (25 min)
    {
      id: 'w10s2-states',
      title: 'Operating states',
      slides: [
        {
          id: 'w10s2-warmup',
          title: 'Warm-up: three drafts of one branch',
          purpose: 'Retrieval of Session 1: three drafts of the SCN-003 branch “both hub chargers are occupied”, all accepted by the checker; pairs decide which one says what the ConOps says.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-listing-warmup',
            caption: 'Three drafts of one branch of the AeroLink charging scenario, shown as the lines that differ: draft A, draft B and draft C, top to bottom. Pairs: which one says what the ConOps says? Checked: PASS. (FICTIONAL)',
            alt: listingAlt('warmup'),
          },
          body: [{ kind: 'bullets', items: ['ConOps: if both hub chargers are occupied, queue the aircraft; otherwise connect', 'Draft A, draft B, draft C (top to bottom)', 'Which one says what the ConOps says?', 'What is wrong with the other two?'] }],
          sources: [],
          notes: {
            teach: [
              'Show the three drafts. They model one branch of SCN-003, Aircraft Charging: when an aircraft arrives and both hub chargers are occupied, it queues; otherwise it is connected. The listing shows only the lines in which the three drafts differ, draft A at the top, draft B in the middle, draft C at the bottom.',
              'Pairs have ninety seconds: which draft says what the ConOps says, and what exactly is wrong with each of the other two? Ask them to name the Session 1 construct each draft uses, in the words of the slides: fork, decide, guard, else, merge.',
              'Do not reveal yet; the next slide does. Walk the room and listen for the words “exactly one”.',
            ],
            why: 'Retrieval at the start of the session consolidates the Session 1 flow constructs, and the three drafts rehearse the reviewer’s question the whole session builds on: does the model say what the ConOps says?',
            figure: 'Point at each of the three blocks in turn without comment: the fork, the two guarded branches, the decide with else after a merge.',
            transition: 'Reveal.',
            timing: '2 min: 30 s read, 90 s pairs.',
          },
        },
        {
          id: 'w10s2-reveal',
          title: 'Reveal: exactly one branch, and every case covered',
          purpose: 'Confirm the rules on the warm-up: a fork starts both branches; two guards with no else can both hold or both fail; only draft C chooses exactly one branch for every case. All three pass the checker.',
          minutes: 1,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['Draft A: a fork starts both: the aircraft queues and is connected', 'Draft B: two guards that can both hold, or both fail; no else', 'Draft C: right. Queue, or connect; the queue loops back to the merge'] },
            { kind: 'callout', tone: 'key', text: 'All three pass the checker.' },
          ],
          sources: [R('R72', '38'), R('R72', '40')],
          notes: {
            teach: [
              'Draft A uses a fork, and a fork enables all its successors (R72 sl.40): the aircraft would queue and be connected at once. Draft B uses a decision, which chooses exactly one successor (R72 sl.38), but its two guards are independent attributes: both can be true, or both false, and with no else nothing follows. Draft C is right: one guard and an else, and the queue path loops back to the merge before the check.',
              'All three pass the checker. The checker evaluates no guard and does not know the ConOps.',
            ],
            why: 'The reveal ties the warm-up to the two choice rules students apply in the lab, fork for concurrency and decide for choice, and repeats that validity is not meaning.',
            transition: 'Flows say in what order functions run. Today starts with the other view of behavior: the condition the system is in.',
            timing: '1 min: about 20 s per draft.',
          },
        },
        {
          id: 'w10s2-function-mode',
          title: 'Function or operational mode?',
          purpose: 'Motivate states from the logical-architecture literature: a scenario of modes is a chain of modes with transitions triggered by events, and a function and its mode are complementary views.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-function-mode',
            caption: `One AeroLink function and its operational mode: ${THREAD.fn} ${THREAD.name}, “to fly”, beside the state ${THREAD.state}, “in flight”. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `A title: two views of one behavior. Left, a card: ${THREAD.fn}, Fly passenger trip, labeled below function: “to fly”. Right, a strong card: state ${THREAD.state}, labeled below mode: “in flight”. A two-way arrow joins them.`,
          },
          body: [
            { kind: 'bullets', items: ['A scenario of modes: a chain of modes, joined by transitions', 'A transition is triggered by an event; an action can run within it', 'A function (“to fly”) and its mode (“in flight”) are two views of one behavior'] },
          ],
          sources: [R('R20b', '589'), R('R20b', '594')],
          notes: {
            teach: [
              'SEBoK describes a second way of viewing a scenario of functions: abstract away the transformation of inputs into outputs and look at which functions are active. That view is a scenario of modes, a chain of modes performed as a sequence of transitions between the modes of the system; a transition is triggered by the arrival of a control flow, an event or a trigger, and an action can be generated within a transition (R20b p.589).',
              `Its proven practices make the link explicit: a function, an action verb such as “to move”, and its operational mode, “moving”, are two similar and complementary views, and switching between them helps (R20b p.594). For AeroLink, ${THREAD.fn} ${THREAD.name} is the function, and ${THREAD.state} is the mode in which it runs.`,
            ],
            why: 'Students who see states as the other view of the functions they modeled in Session 1 model operating modes from the same Phase I material, instead of inventing a second, unrelated behavior.',
            figure: 'Point at the function card, then at the state card, and read the two quoted words aloud.',
            misconceptions: [{ claim: 'A state is a function that takes a long time.', correction: 'A state is a condition the system is in; functions run while it is in that condition, or when it enters it.' }],
            transition: 'SysML v2 writes modes as a state definition.',
            timing: '2 min: 1 min scenario of modes, 1 min the two views.',
          },
        },
        {
          id: 'w10s2-state-def',
          title: 'State definitions and the initial state',
          purpose: 'The notation: a state definition is a kind of action definition, like a state machine; nested states joined by transitions; the initial state in the current form; one active substate.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-state-anatomy',
            caption: 'The parts of a state definition on the AeroLink aircraft: the start and the initial state, two states and a transition between them. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: 'A large frame titled state def AircraftOperatingStates. Inside, a black dot with an arrow to a box onPad, labeled first start then onPad. A highlighted arrow labeled transition runs from onPad to a box charging, labeled state. Below: one state active at a time after entry.',
          },
          body: [
            { kind: 'definition', term: 'State definition (SysML v2.1 Beta 2)', text: '“a kind of action definition … that defines the conditions under which other actions can execute”', source: R('R82', '145') },
            { kind: 'bullets', items: ['Like a state machine; exhibited by a system', 'Nested states, joined by transitions', 'Initial state: first start then the state', 'After entry, exactly one substate is active'] },
          ],
          sources: [R('R73', '48'), R('R82', '145'), R('R82', '146')],
          notes: {
            teach: [
              'Read the definition: a state definition is a kind of action definition that defines the conditions under which other actions can execute (R82 p.145). The training deck adds the familiar picture: a state definition is like a state machine in UML and SysML v1; it defines a behavioral state that can be exhibited by a system, it can specify a set of discrete nested states, and the states are connected by transitions that fire on acceptance of item transfers (R73 sl.48).',
              'The initial state is written first start then the state: here, first start then onPad. The training deck changed to this form in its current release; you may meet an earlier form when reading older material, but write this one.',
              'One structural rule a reviewer applies: in a state that is not parallel and has substates, exactly one substate is active at any point after entry (R82 p.146). We use it twice today: on the parallel slide, and on the predict cards.',
            ],
            why: 'The definition explains why a state can perform functions and be exhibited by a part, and the one-active-substate rule is the reviewer’s first test of any state model.',
            figure: 'Point at the dot and its arrow, read “first start then onPad”, then follow the transition to charging and read the line at the bottom.',
            misconceptions: [{ claim: 'The first state written is the initial state.', correction: 'Only first start then a state makes it initial; the order of declarations asserts nothing.' }],
            transition: 'What makes the model move from one state to another: transitions.',
            timing: '3 min: 1.5 min the definition and the picture, 30 s the initial state, 1 min one active substate.',
          },
        },
        {
          id: 'w10s2-transitions',
          title: 'Transitions: trigger, guard, effect, target',
          purpose: 'Transition anatomy in the order the notation requires: source, trigger, guard, effect, target; the guard must hold for the transition to fire; the effect runs before the target is entered.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-transition-parts',
            caption: 'One AeroLink transition in its five parts, in the order the textual notation requires; the effect is optional and absent here. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: 'Five boxes stacked top to bottom, each with code and a label: first dispatchReady, source; accept DispatchRelease, trigger; if not noGoFaultOpen, guard (highlighted); do …, effect (dashed: optional); then inFlight, target.',
          },
          body: [
            { kind: 'bullets', items: ['first the source, accept the trigger, if the guard, do the effect, then the target', 'The guard must be true for the transition to fire', 'The effect runs when it fires, before the target is entered', 'Shorthand: accept … then … after a state takes that state as source'] },
          ],
          sources: [R('R73', '48–49'), R('R73', '53'), R('R82', '146')],
          notes: {
            teach: [
              'Read the transition from top to bottom. A transition names its source state with first, its trigger with accept, an optional guard with if, an optional effect with do, and its target with then (R73 sl.48, sl.53). The trigger is an accept action usage that accepts an incoming transfer (R82 p.146): here, the signal DispatchRelease.',
              'A guard is a condition that must be true for the transition to fire, and an effect action is performed when the transition fires, before entry to the target state (R73 sl.53). Our guard, not noGoFaultOpen, writes the AeroLink stakeholder requirement that no aircraft is dispatched with an open no-go fault as behavior: the release does not move the aircraft into flight while the fault is open.',
              'There is a shorthand: an accept … then … written right after a state takes that state as its source (R73 sl.49). And the order matters. A transition with the guard written before the trigger is rejected by the course checker, release 2026-08, with a syntax error at the word transition: write accept, then if.',
            ],
            why: 'Most state-model errors students make are in one transition: a missing trigger, a guard that is really a trigger, parts in the wrong order. Naming the five parts gives them a line-by-line check.',
            figure: 'Read each box with its label; stop on the guard and on the dashed effect box, which this transition does not use.',
            misconceptions: [{ claim: 'The guard is what makes the transition happen.', correction: 'The trigger makes it happen; the guard only permits it. Without the accepted signal, a true guard does nothing.' }],
            transition: 'Functions run inside states too.',
            timing: '3 min: 1 min the five parts, 1 min guard and effect on AeroLink, 1 min shorthand and order.',
          },
        },
        {
          id: 'w10s2-entry-do',
          title: 'Entry, do and exit actions',
          purpose: 'Connect states to the Session 1 functions: entry, do and exit actions, each referencing an action defined elsewhere or defined in place.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-entry-do',
            caption: 'Two AeroLink states that run functions: one on entry, one while the aircraft is in the state. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `Two strong cards side by side: ${MACHINE.states.find((s) => s.entry)!.name}, with the line entry ${MACHINE.states.find((s) => s.entry)!.entry}; ${MACHINE.states.find((s) => s.do)!.name}, with the line do ${MACHINE.states.find((s) => s.do)!.do}. Below, three lines: entry: on entry; do: while in the state; exit: on leaving (optional).`,
          },
          body: [
            { kind: 'bullets', items: ['entry: performed on entry to the state', 'do: performed while in the state', 'exit: performed on leaving it', 'Each references a function defined elsewhere, or defines an action in place'] },
          ],
          sources: [R('R73', '52'), R('R82', '145')],
          notes: {
            teach: [
              'An entry action is performed on entry to a state, a do action while in it, and an exit action on exit from it; each can reference an action defined elsewhere or define the action within the state (R73 sl.52). The specification gives the timing: the do action starts after the entry action completes and continues while the state is active, and the state becomes inactive once the exit action completes (R82 p.145).',
              `In the AeroLink model the actions are the Session 1 functions: the aircraft does the charging function while in charging, it does ${THREAD.fn} while in ${THREAD.state}, and on entering outOfService it performs the health-assessment function once. So the states reuse the functions; nothing is written twice.`,
            ],
            why: 'Linking states to existing functions keeps one behavior model instead of two, and it is what makes the cross-check at the end of the session possible.',
            figure: 'Point at the entry line in the left card and the do line in the right card, then read the three lines below.',
            misconceptions: [{ claim: 'A do action runs once when the state is entered.', correction: 'That is an entry action; a do action runs while the element stays in the state.' }],
            transition: 'Some conditions hold at the same time. That needs a parallel state.',
            timing: '2 min: 1 min the three actions, 1 min AeroLink.',
          },
        },
        {
          id: 'w10s2-parallel',
          title: 'Parallel states and the one-active-substate rule',
          purpose: 'The two structural rules reviewers apply: the substates of a parallel state run concurrently with no transitions between them; a non-parallel state has exactly one active substate.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-parallel-regions',
            caption: 'An aircraft with two concurrent regions, operational and health, and a transition between them, struck through. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: 'A frame titled aircraftStates: parallel, split by a dashed line into two regions: operational, with boxes onPad and inFlight; health, with boxes fit and degraded. A dashed arrow from inFlight to degraded crosses the line and is struck through with a cross; below: no transition between regions.',
          },
          body: [
            { kind: 'bullets', items: ['Parallel: the substates run concurrently', 'No transitions between concurrent substates', 'Not parallel: exactly one substate active after entry', 'Need two conditions at once? Two regions, not one tangled machine'] },
          ],
          sources: [R('R73', '51'), R('R82', '146')],
          notes: {
            teach: [
              'A parallel state is one whose nested states are concurrent, and transitions are not allowed between concurrent states (R73 sl.51). The specification states both rules side by side: no transitions are allowed between the substates of a parallel state; and if a state that is not parallel has substates, exactly one of them is active at any time after entry (R82 p.146).',
              'Use it when the element really is in two conditions at once: an aircraft is on its pad or in flight, and at the same time fit or degraded. Drawing those as one machine forces a state for every combination; two regions keep them apart. The crossing arrow on the figure is the error to avoid: a fault in flight cannot move the operational region into the health region. Model the effect in the health region, triggered by the same signal. The course checker does not catch this crossing when it is written inside a region (the predict cards show it), so it is a reviewer’s check.',
            ],
            why: 'These are the two rules a reviewer can check by eye on any state model, and the predict cards test them in a few minutes.',
            figure: 'Point at the dashed divider, then at the struck-through arrow, and read the line under it.',
            misconceptions: [{ claim: 'A parallel state means the element switches quickly between two states.', correction: 'Its regions are active together; each region still has one active substate.' }],
            transition: 'States describe a part. Which part, and how do the states connect to the structure?',
            timing: '2 min: 1 min the two rules, 1 min when to use regions.',
          },
        },
        {
          id: 'w10s2-exhibit',
          title: 'exhibit, and the four links from behavior to structure',
          purpose: 'Make each behavior–structure link’s assertion explicit, on one AeroLink function: a step subsets it, a logical part performs it, a state does it, a part exhibits that state.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-four-links',
            caption: `${THREAD.fn} ${THREAD.name} in AeroLink model v0.3, reached by four links: a scenario step subsets it, ${THREAD.performer} performs it, the state ${THREAD.state} does it, and the part definition ${THREAD.exhibitor} exhibits the states. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `A strong card in the center, ${THREAD.fn}. Four cards around it: top left, step ${THREAD.step}, with an arrow labeled subsets; top right, logical part ${THREAD.performer}, with an arrow labeled perform; bottom left, state ${THREAD.state}, with an arrow labeled do; bottom right, part def ${THREAD.exhibitor}, with an arrow labeled exhibit pointing to the state card.`,
          },
          body: [
            { kind: 'bullets', items: ['Subsets (course convention): this step is an occurrence of the function', 'perform: this logical part is the performer', 'do: performed while in this state', 'exhibit: this part exhibits these states'] },
          ],
          sources: [R('R73', '56'), R('R72', '41'), R('R73', '52'), R('R82', '146')],
          notes: {
            teach: [
              'exhibit identifies the part that is exhibiting states defined elsewhere, and parameters can be bound as for an action (R73 sl.56). An exhibit state usage is referential: typically the exhibited states reflect conditions of the exhibiting part, such as the operating states of a vehicle (R82 p.146).',
              `Now follow ${THREAD.fn} through the four links of model v0.3. The SCN-002 step ${THREAD.step} subsets it, the course convention from Session 1: the step is an occurrence of the function. ${THREAD.performer}, ${THREAD.performerName}, performs it: the part is the performer (R72 sl.41). The state ${THREAD.state} does it: it runs while the aircraft is in flight (R73 sl.52). And the part definition ${THREAD.exhibitor} exhibits the operating states; that definition is the Week 9 placeholder in the Physical package, which Week 11 completes.`,
              'Each link asserts something different. Ask: if the flight function were removed, which links would break, and what would each break tell you?',
            ],
            why: 'Students who can say what each link asserts stop using them interchangeably, and the thread is exactly what the cross-check and the Week 11 allocation read.',
            figure: 'Start at the center card and walk the four arrows clockwise from the top left, reading each label.',
            misconceptions: [{ claim: 'exhibit and perform say the same thing.', correction: 'perform names the performer of an action; exhibit names the part whose conditions the states are.' }],
            transition: 'Put it together: the AeroLink aircraft’s operating states.',
            timing: '3 min: 1 min exhibit, 1.5 min the four links, 30 s the question.',
          },
        },
        {
          id: 'w10s2-worked-states',
          title: 'Worked example III: the aircraft’s operating states',
          purpose: 'Read a complete state definition from AeroLink model v0.3 against the ConOps: states, transitions with their ConOps source, the one guard, the entry and do functions, and what it leaves out.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-listing-state-def',
            caption: `The aircraft’s operating states in AeroLink model v0.3: ${numberWord(COUNTS.states)} states, ${numberWord(COUNTS.transitions)} transitions and ${numberWord(COUNTS.guards)} guard (doc lines omitted on the slide). Checked: PASS. (FICTIONAL)`,
            alt: listingAlt('state-def'),
          },
          body: [
            { kind: 'bullets', items: [`${COUNTS.states} states, ${COUNTS.transitions} transitions, ${COUNTS.guards} guard`, 'Each transition traced to a ConOps step', 'The guard writes “no dispatch with an open no-go fault”', 'Exhibited by the aircraft part definition'] },
            { kind: 'callout', tone: 'note', title: 'Pairs, 1 min', text: 'An aircraft becomes fit to fly while it is out of service. Where does the model send it?' },
          ],
          sources: [R('R73', '48'), R('R73', '52–53'), R('R82', '145–146')],
          notes: {
            teach: [
              `Read the listing. The state definition has ${numberWord(COUNTS.states)} states: ${listOf(M.states)}; ${numberWord(COUNTS.transitions)} transitions, every one with a trigger; and ${numberWord(COUNTS.guards)} guard, on ${guarded.map((t) => `${t.from} to ${t.to}`).join(', ')}. The charging state does the charging function, the in-flight state does the flight function, and out of service performs the health assessment on entry (R73 sl.52).`,
              `Each transition comes from the Week 2 ConOps: ${M.transitions.map((t) => `${t.from} to ${t.to} on ${t.trigger}, ${sourceOf(t)}`).join('; ')}. The lesson lists them in a table.`,
              'Run the pair question for one minute: an aircraft that becomes fit while it is out of service. Expected answer: the only way out of outOfService is ReturnedToService, and it goes to onPad, not to dispatchReady, so the aircraft must charge and be released again. Is that a defect? No: the maintenance scenario restores availability after repair, and a repaired aircraft starts a new turnaround. It is a modeling decision the team should be able to defend from the ConOps.',
            ],
            workedSolution: ['Step 1, states: one per condition the ConOps names for the aircraft: on the pad, charging, ready, in flight, out of service.', 'Step 2, initial state: the condition after entry, here on the pad.', 'Step 3, transitions: one per ConOps step or alternate that changes the condition, each with the signal that causes it.', 'Step 4, guards: only where a requirement or the ConOps makes the change conditional.', 'Step 5, functions: entry or do actions that reference the Session 1 functions; then exhibit by the part whose conditions these are.'],
            why: 'A complete, sourced state definition on the class’s own worked example is the template students check their own state definitions against in the lab.',
            figure: 'Follow the callouts: the guard attribute, the initial state, the do and entry lines, then the guarded transition.',
            misconceptions: [{ claim: 'Every ConOps step needs a transition.', correction: 'Only the steps that change the element’s condition do; booking a ride changes nothing about the aircraft.' }],
            transition: 'Test the state rules once more: predict three checker results.',
            timing: '4 min: 1.5 min the listing, 1 min the sources, 1.5 min pair question and debrief.',
          },
        },
        {
          id: 'w10s2-predict',
          title: 'Predict the checker: three state definitions',
          purpose: 'Practise the PASS-is-not-meaning rule on states: three listings, students predict PASS or FAIL and say whether each says what it means, before the reveal on the next slide.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w10s2-predict-cards',
            caption: 'Three state listings to judge before the reveal: predict PASS or FAIL, and say whether each says what it means. Course illustration, not SysML v2 graphical notation.',
            alt: `Three panels stacked, numbered 1 to 3, each showing code. Panel 1: ${pTwo.lines.map((l) => l.trim()).filter((l) => l.startsWith('first start')).join(' / ')}. Panel 2: ${pPar.lines.map((l) => l.trim()).filter((l) => l.startsWith('state aircraftStates') || l === 'state operational {' || l.startsWith('transition') || l === 'state health {').join(' / ')}. Panel 3: ${pUnr.lines.map((l) => l.trim()).filter((l) => l.startsWith('first start') || l.startsWith('accept') || l === 'state maintenance;').join(' / ')}. Under them: each: PASS or FAIL? and does it say what it means?`,
          },
          body: [],
          sources: [],
          notes: {
            teach: [
              'Show the three cards. Card 1 is a door state definition with two initial states. Card 2 is an aircraft with two concurrent regions and, written inside the operational region, a transition from a state in that region to a state in the other. Card 3 is a pump whose maintenance state no transition enters.',
              'For each card students write a prediction, PASS or FAIL, and a second answer: does the model say what its author meant? Give a minute of silent prediction, then a minute in pairs, and write the counts on the board. Do not reveal: the next slide does.',
            ],
            why: 'Predicting before seeing the result makes the reveal memorable, and asking about meaning separately from validity rehearses the rule students most need in the lab.',
            figure: 'Point at each card and read its one-line description; do not comment on the code.',
            transition: 'Reveal the recorded results.',
            timing: '2 min: 1 min silent prediction, 1 min pairs and counts.',
          },
        },
        {
          id: 'w10s2-predict-reveal',
          title: 'Reveal: all three pass; all three are yours to check',
          purpose: 'Reveal the recorded results of the three predict listings: all three pass without a message, the crossing transition included, because the checker rejects a transition only where a parallel state itself owns it.',
          minutes: 1,
          layout: 'table',
          body: [
            {
              kind: 'table',
              header: ['Listing', 'Recorded result', 'Says what it means?'],
              rows: [
                ['1 · two initial states', pTwo.recorded!, 'No, not caught'],
                ['2 · transition across regions, inside a region', pPar.recorded!, 'No, not caught'],
                ['3 · unreachable state', pUnr.recorded!, 'No, not caught'],
              ],
            },
          ],
          sources: [R('R82', '146'), R('R82', '150'), R('R73', '51')],
          notes: {
            teach: [
              `Card 1: ${pTwo.recorded}; course reasoning from the one-active-substate rule and the initial succession (R82 pp.146, 150): it asks for two active substates. Card 2: ${pPar.recorded}, although transitions between concurrent substates are not allowed (R73 sl.51): the checker rejects only a transition the parallel state itself owns, even within one region (${pOwned.recorded}). Card 3: ${pUnr.recorded}; the maintenance state is never entered.`,
              'All three are wrong and all three pass. The tool computes reachability; the rest is review.',
            ],
            why: 'The reveal confirms with recorded results that the checker enforces some structural rules and not others, which is why the review checklist exists.',
            transition: 'Flows and states describe behavior from inside. A use case frames it from outside.',
            timing: '1 min: 20 s per card.',
          },
        },
      ],
    },
    // ============================================================================================ F. use cases (8 min)
    {
      id: 'w10s2-usecases',
      title: 'Use cases',
      slides: [
        {
          id: 'w10s2-use-cases',
          title: 'Use cases: subject, actors, objective',
          purpose: 'The notation and its meaning: a use case specifies the required behavior of its subject relative to external actors; actors are referential part usages typed by part definitions; the subject comes first.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-listing-use-case',
            caption: 'SCN-001 Passenger Ride Request as a use case in AeroLink model v0.3: subject, actor and objective (the doc is shortened on the slide). Checked: PASS. (FICTIONAL)',
            alt: listingAlt('use-case'),
          },
          body: [
            { kind: 'definition', term: 'Use case definition (SysML v2.1 Beta 2)', text: '“specifies the required behavior of its subject relative to one or more external actors”', source: R('R116', '177') },
            { kind: 'bullets', items: ['Objective: an observable result of value to the actors', 'Actors: roles of external entities, typed by part definitions', 'The subject is declared first, before any actor'] },
          ],
          sources: [R('R116', '177'), R('R76', '100–101')],
          notes: {
            teach: [
              'Read the definition: a use case definition specifies the required behavior of its subject relative to one or more external actors, and its objective is to provide an observable result of value to one or more of its actors (R116 p.177).',
              'The training deck adds the modeling rules. An actor is a parameter of the use case representing a role played by an entity external to the subject; actors are referential part usages and so must have part definitions (R76 sl.100). A subject must be declared first, before any actors (R76 sl.101). And the required behavior of a use case can be specified as for an action (R76 sl.101): that is why the SCN-002 flow of Session 1 sits inside its use case.',
              'Read SCN-001 in the listing: the subject is the enterprise, the actor passengers is typed by the Week 8 stakeholder definition STK-001, and the objective holds the Week 2 success end state. The trigger, preconditions and failure end state are in the doc.',
            ],
            why: 'Use cases are where the Week 2 ConOps enters the model whole, and the subject-first and typed-actor rules are the two the checker and reviewers apply.',
            figure: 'Follow the callouts: subject, actor, objective. Point at the shortened doc and say the full text is in the file.',
            misconceptions: [{ claim: 'An actor is any person in the scenario.', correction: 'An actor is a role external to the subject; a role inside the enterprise is part of the subject, not an actor.' }],
            transition: 'One use case can include another.',
            timing: '3 min: 1 min the definition, 1 min the rules, 1 min the listing.',
          },
        },
        {
          id: 'w10s2-include',
          title: 'include, and what is not supported',
          purpose: 'Use include correctly: the included use case is performed by the containing one, shares its subject, and has its actors bound explicitly; extend is not supported, so model an optional extension as a guarded branch.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-listing-include',
            caption: 'A containing AeroLink use case that includes Aircraft Charging and then the Passenger Transport Mission, with the subject declared first and the actors bound (proposed teaching content). Checked: PASS. (FICTIONAL)',
            alt: listingAlt('include'),
          },
          body: [
            { kind: 'bullets', items: ['include: performs a use case defined elsewhere', 'Same subject; actors bound explicitly', 'extend is not supported yet: use a guarded branch or a separate use case'] },
          ],
          sources: [R('R116', '177'), R('R76', '101')],
          notes: {
            teach: [
              'An include use case usage is a use case usage that is also a kind of perform action usage: the containing use case performs the included one. The subject of the included use case is the same as the subject of the containing use case, and its actor parameters are bound to the corresponding actors as necessary (R116 p.177). The training deck says it the practical way: the subject of a nested use case is implicitly bound, but actors need to be explicitly bound (R76 sl.101).',
              'Read the listing: a turnaround cycle includes Aircraft Charging and then the Passenger Transport Mission. Each include declares the subject first, which the course checker requires once actors are declared, and binds each actor to the containing one.',
              'The traditional extend relationship is not supported yet (R76 sl.101). If your ConOps has an optional extension, model it as a guarded branch of the flow, or as a separate use case.',
            ],
            why: 'Teams with several related scenarios reach for include and extend; knowing what include means, and that extend is not available, prevents a model that does not parse or does not say what was meant.',
            figure: 'Point at the two include lines, then at the subject line and the bound actors inside each.',
            transition: 'All five AeroLink scenarios as use cases.',
            timing: '2 min: 1 min include, 30 s the listing, 30 s extend.',
          },
        },
        {
          id: 'w10s2-worked-usecases',
          title: 'Worked example IV: five scenarios as use cases',
          purpose: 'Show the reference choices and their reasons: every AeroLink scenario is a use case with the enterprise as subject, actors where the model has a part definition, and roles inside the enterprise kept in the doc.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-usecase-map',
            caption: 'The five AeroLink scenarios as use cases in model v0.3: the actors modeled as parts, and the roles named in the doc only. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `A table with columns use case, actors, doc only. ${UC.map((u) => `${u.id}: ${u.actors.length}; ${u.unmapped.length}`).join('. ')}.`,
          },
          body: [
            { kind: 'bullets', items: ['Course convention: the enterprise is the subject', `${actorsModeled} actors typed by Week 8 stakeholder or context definitions`, `${numberWord(docOnly.length)} roles inside the enterprise stay in the doc`, 'One scenario, SCN-002, carries its flow'] },
          ],
          sources: [R('R76', '100'), R('R116', '177')],
          notes: {
            teach: [
              `The lab tool generates a use case for every scenario of the Week 2 ConOps. For AeroLink that is ${numberWord(COUNTS.scenarios)} use cases. Each has the enterprise as subject, the course convention: passengers, operators and the air traffic service interact with the service as a whole. A team may choose a narrower system of interest, and must say so.`,
              `Actors: the generator types an actor by the Week 8 stakeholder or external-system definition the scenario names, ${actorsModeled} actors in all (R76 sl.100). ${numberWord(docOnly.length)} scenarios also name a role that is not an external entity: ${docOnly.map((u) => `${u.id}, ${u.unmapped.join(', ')}`).join('; ')}. Those are roles inside the enterprise, part of the subject, so the instructor keeps them in the doc; the lab tool lists each as a gap needing a disposition, and the instructor’s reads: ${W10_DISPOSITIONS['SCN-003']}`,
              'Only SCN-002 carries its action flow this week. The other four keep their steps in Week 2 and their frame here; a team may model more flows, but the lab asks for one.',
            ],
            why: 'Seeing the reference choices, and the one that is a judgment, lets teams make and defend the same choices for their own scenarios.',
            figure: 'Read the table row by row; point at the rows where the last column is not zero.',
            misconceptions: [{ claim: 'Every person named in a scenario must be an actor.', correction: 'Only roles external to the subject are actors; a role inside the enterprise belongs to the subject.' }],
            transition: 'Three views of one behavior: they must agree.',
            timing: '3 min: 1 min subject, 1.5 min actors and the doc-only roles, 30 s one flow.',
          },
        },
      ],
    },
    // ============================================================================================ G. consistency and review (14 min)
    {
      id: 'w10s2-consistency',
      title: 'Consistency and review',
      slides: [
        {
          id: 'w10s2-cross-check',
          title: 'Cross-checking the flow and the states',
          purpose: 'Use one view to check the other: pair each transition with the steps of the modeled scenario that cause it, computed where a state’s function is a step’s function, and judged by hand where not.',
          minutes: 3,
          layout: 'figure',
          figure: {
            id: 'w10s2-cross-check',
            caption: 'The AeroLink cross-check: for each transition of the operating states, the SCN-002 steps whose function the target state performs. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `A table with two columns, transition (from → to) and SCN-002 steps doing its function. ${CROSS_CHECK.map((r) => `${r.from} → ${r.to}: ${r.steps.length ? r.steps.join(', ') : 'none: check by hand'}`).join('. ')}.`,
          },
          body: [],
          sources: [R('R73', '48')],
          notes: {
            teach: [
              'The course method for checking two views against each other: for every flow step that changes the element’s condition there should be a transition, accepted in the state the element is in at that step; and for every transition there should be a step, in some scenario, that causes its trigger, since transitions fire on accepted transfers (R73 sl.48).',
              `The lab tool computes a first pairing: a transition into a state whose entry or do function is the function of a step. For AeroLink, ${numberWord(matched.length)} transition pairs that way: ${matched.map((r) => `${r.from} to ${r.to} with ${r.steps.join(' and ')}`).join('; ')}. The other ${numberWord(unmatched.length)} have no computed partner, and that is information, not a verdict.`,
              'Judge them by hand. The landing, onPad on LandedOnPad, is caused by the step approachAndLand, even though onPad runs no function: pair it. The charging transitions are caused by SCN-003 steps, a scenario the class did not model as a flow: record that. And the fault transitions belong to SCN-004. A transition caused by no step of any scenario would be a real finding.',
            ],
            why: 'The cross-check is the only place the two behavior views meet; it finds missing transitions and states that no scenario reaches.',
            figure: 'Read the one computed row, then two of the “check by hand” rows and say which scenario causes each.',
            misconceptions: [{ claim: 'An unmatched row in the computed table is a defect.', correction: 'It means the pairing could not be computed; the reviewer pairs it by hand or records the scenario that causes it.' }],
            transition: 'A short catalog of the errors this review finds.',
            timing: '3 min: 1 min the method, 1 min the computed pairing, 1 min by hand.',
          },
        },
        {
          id: 'w10s2-common-errors',
          title: 'Common errors in behavior models',
          purpose: 'A short catalog students can apply to their own model: seven errors, what to write instead, and which the checker catches.',
          minutes: 3,
          layout: 'table',
          body: [
            {
              kind: 'table',
              header: ['Error', 'Instead'],
              rows: [
                ['Fork for a choice', 'decide, guards, else'],
                ['Guard gap, no else', 'Cover every case'],
                ['Rejoins where it should end', 'then done'],
                ['Transition across regions', 'Act within a region'],
                ['Two initial states', 'One first start'],
                ['Function, no performer', 'perform in a part'],
                ['States nobody exhibits', 'exhibit in the part'],
              ],
            },
          ],
          sources: [R('R72', '38'), R('R72', '40'), R('R73', '51'), R('R82', '146'), R('R72', '41'), R('R73', '56')],
          notes: {
            teach: [
              'One: a fork where the ConOps has a choice; a fork enables all its successors (R72 sl.40), a decision chooses exactly one (R72 sl.38). Two: guards that leave a gap and no else; for the uncovered values no successor is possible. Three: an alternate that rejoins the main flow where the ConOps says the scenario ends; write then done.',
              'Four: a transition between concurrent regions (R73 sl.51). Five: two initial states in a state that is not parallel, against the one-active-substate rule (R82 p.146). Six: a function no logical part performs (R72 sl.41). Seven: a state definition no part exhibits (R73 sl.56): the states then describe nothing in the system.',
              'Which does the course checker catch? None reliably, in the recorded results of this release: number four is rejected only when the transition is written directly in the parallel state, and passes when written inside a region; numbers one, two and five pass without a message, and three, six and seven are meaning, not syntax. The lab tool reports six and seven, and unreachable states, in its behavior audit; the rest are yours to find with the checklist on the next slide.',
              'Ask students to run the list over the exit card from Session 1: which of the seven does their mapping risk? Take two answers.',
            ],
            why: 'A short, named catalog turns the session’s rules into a review tool students apply before the instructor does.',
            misconceptions: [{ claim: 'The checker would catch these.', correction: 'None of the seven is reliably rejected in the recorded results: a crossing transition is rejected only where the parallel state itself owns it; the others pass or are questions of meaning.' }],
            transition: 'The self-check the lab uses.',
            timing: '3 min: 1 min errors one to three, 1 min four to seven, 1 min what the checker sees and the exit card.',
          },
        },
        {
          id: 'w10s2-checklist',
          title: 'The behavior review checklist',
          purpose: 'Give the self-check the lab uses: eight checks, each recorded as met or as a finding with a note, with the evidence the lab tool computes.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-checklist-card',
            caption: `The behavior review checklist (course convention): the ${numberWord(REVIEW_CHECKS.length)} checks your team records in the lab, each met or a finding. Course illustration, not SysML v2 graphical notation.`,
            alt: `A card with ${REVIEW_CHECKS.length} lines, each with an empty checkbox: every step and alternate has a node; alternates end or rejoin as written; every branch guarded, else last; flows: producer to later consumer; functions: items and a performer; states reachable, triggers named; flow and states agree; requirements allocated.`,
          },
          body: [
            { kind: 'bullets', items: ['Course convention: eight checks against the ConOps and the model', 'Each: met, or a finding with a note', 'The tool gives evidence; the judgment is yours', 'Every finding gets a disposition'] },
          ],
          sources: [R('R72', '35–38'), R('R82', '146')],
          notes: {
            teach: [
              `The course checklist has ${numberWord(REVIEW_CHECKS.length)} checks: ${REVIEW_CHECKS.map((c) => c.text.charAt(0).toLowerCase() + c.text.slice(1)).join('; ')}.`,
              'For each, the team records in the lab tool whether the model meets it or what the finding is, with a short note on how it checked. The tool shows the evidence it can compute: the mapping table, the item flows, the unreachable states, the unallocated requirements. Whether a guard means its condition, or whether the flow follows the ConOps, is a judgment no tool makes. The guard and decision checks rest on the semantics of conditional successions and decisions (R72 sl.35–38); the state checks on the one-active-substate rule (R82 p.146).',
            ],
            why: 'A checklist with recorded results makes the review visible and gradable, and keeps the tool’s evidence and the team’s judgment apart.',
            figure: 'Read the eight lines; pause on “flow and states agree” and point back to the cross-check.',
            misconceptions: [{ claim: 'A green tool report means every check is met.', correction: 'The tool computes evidence for some checks; the team still records each result and its note.' }],
            transition: 'How your package becomes model v0.3.',
            timing: '3 min: 1.5 min the checks, 1.5 min evidence and judgment.',
          },
        },
        {
          id: 'w10s2-mapping',
          title: 'From your package to model v0.3',
          purpose: 'Prepare the lab: the artifact-to-model mapping for this week, and the decisions the team makes in the lab tool.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-mapping',
            caption: 'The course mapping for Week 10, short form: each Phase I element of the Week 2 and Week 4 package and the model element it becomes. Course illustration, not SysML v2 graphical notation.',
            alt: 'A two-column table, Phase I and model v0.3: CAP, action def; INFO, item def; FN, action, in and out items; LOG, part def and part; FN on LOG, perform; REQ on FN, allocate; to a CAP, #derivedFrom; SCN, use case (one with a flow); modes, state def, exhibit.',
          },
          body: [
            { kind: 'bullets', items: ['Course convention: the mapping is generated from your exports', 'You decide: each function’s items, one scenario’s steps and guards, the states', 'The tool keeps every ID; new ones continue after the highest', 'Nothing from Weeks 8 and 9 is changed'] },
          ],
          sources: [],
          notes: {
            teach: [
              `The mapping for this week is a course convention, in ${numberWord(W10_MAPPING.length)} rows. ${W10_MAPPING.map((m) => `${m.artifact} becomes ${m.becomes}`).slice(0, 6).join('; ')}.`,
              'The tool generates all of it from your Week 9 model and your Week 2 and Week 4 exports. Your decisions are three: the items each function consumes and produces, the steps and guards of one scenario, and the operating states. If a step needs a function the Week 4 decomposition lacks, add it in the tool: its ID continues after the highest function ID your files have used, and no ID is ever reused or renumbered.',
              'The Week 8 and Week 9 parts of the model are kept exactly as they are; the tool adds its own region and can re-import its own file without duplicating anything.',
            ],
            why: 'Knowing which decisions are theirs lets teams spend the lab time on them instead of on what the tool already does.',
            figure: 'Read the left column top to bottom, giving the model element for each.',
            misconceptions: [{ claim: 'The generated model can be submitted as it comes out of the tool.', correction: 'It is a draft built from your decisions; only the team can check the items, the flow and the states against its ConOps.' }],
            transition: 'Where this goes next week.',
            timing: '3 min: 1 min mapping, 1.5 min decisions, 30 s the IDs.',
          },
        },
        {
          id: 'w10s2-bridge',
          title: 'Bridge: Week 11, physical parts and interfaces',
          purpose: 'Show the thread ahead: logical parts allocated to physical parts, items on ports and interfaces, send and accept over connections, the first satisfy claims.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-bridge',
            caption: 'What Week 11 does with the logical architecture and behavior modeled this week. Course illustration, not SysML v2 graphical notation.',
            alt: 'Four bars stacked top to bottom, joined by arrows: logical parts → physical parts; items → ports and interfaces; send and accept → connections; first satisfy claims.',
          },
          body: [{ kind: 'bullets', items: ['Logical parts allocated to physical parts', 'Items carried on ports and interfaces', 'Send and accept over real connections', 'Keep every function and item ID stable'] }],
          sources: [R('R76', '106')],
          notes: {
            teach: [
              'Week 11 gives the logical elements physical homes: an allocation from each logical part to the physical part that realizes it, with nested allocations of the performed functions, the pattern of the training deck’s allocation slide (R76 sl.106). The items your functions consume and produce move onto ports and interfaces; send and accept actions get real connections; and the first satisfy claims can be written, because design elements will have values.',
              'Keep every function and item ID stable: Week 11 reads them, and a renamed function breaks every allocation built on it.',
            ],
            why: 'Seeing the next step explains why items, performers and stable IDs matter now.',
            figure: 'Point at each bar as you name what Week 11 does with it.',
            transition: 'Now your team models its own logical architecture and behavior.',
            timing: '2 min: 1.5 min the four steps, 30 s stable IDs.',
          },
        },
      ],
    },
    // ============================================================================================ H. laboratory launch (22 min)
    {
      id: 'w10s2-lab',
      title: 'Laboratory launch',
      slides: [
        {
          id: 'w10s2-lab-brief',
          title: 'Lab L10: model v0.3 of your enterprise',
          subtitle: 'Due before Week 11, Session 1, on the LMS; your own enterprise, never AeroLink',
          purpose: 'Give unambiguous instructions for model v0.3: the three files, what each contains, the minimums, the deadline, the workload and the AI statement.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-deliverables',
            caption: 'Lab L10 deliverables: three files, one upload (course convention). Course illustration, not SysML v2 graphical notation.',
            alt: `Four bars stacked top to bottom: ${outputFiles.join('; ')}; one upload, before Week 11.`,
          },
          body: [{ kind: 'bullets', items: ['Your own enterprise, never AeroLink', `Three files: ${outputFiles.join(', ')}`, 'Zero checker errors; every warning explained', 'Formative feedback before Week 11, Session 2'] }],
          sources: [],
          notes: {
            teach: [
              `Read the three files. First, ${outputFiles[0]}: your Week 9 model with the Logical and Behavior packages modeled. Second, ${outputFiles[1]}: the scenario mapping table, the function table, the allocation matrix, the transition table, the cross-check, the behavior audit with a disposition for every finding, the review checklist and the AI usage statement. Third, ${outputFiles[2]}: the final checker run of model v0.3, with zero errors and every warning explained.`,
              `Minimums, a course proposal pending faculty approval: every Week 4 function as an action with its items and a performer; one scenario as a flow with at least ${LAB10_MINIMUMS.decisions} decision and ${LAB10_MINIMUMS.itemFlows} item flow; one state definition with at least ${LAB10_MINIMUMS.states} states, ${LAB10_MINIMUMS.transitions} transitions and ${LAB10_MINIMUMS.guards} guard, exhibited by a part; every scenario as a use case; every system requirement allocated to a function or dispositioned.`,
              `Workload: about ${LAB10_TEAM_HOURS} person-hours out of class for a team of four, about ${EACH_FOUR} hours each; a team of three works to a reduced scope, at least ${LAB10_MINIMUMS.statesThree} states and ${LAB10_MINIMUMS.transitionsThree} transitions, about ${LAB10_TEAM_HOURS_THREE} person-hours, the same ${EACH_THREE} hours each, pending faculty approval.`,
              'The AI usage statement goes in the review file. Any AI-suggested SysML must pass the checker and be explained by its owner, and the tool’s generated text counts as a tool output you review, not as your work until you have checked it against your ConOps.',
            ],
            why: 'Unambiguous deliverables and minimums prevent careful work on the wrong thing, and stating the load per person makes the team-size rule visible.',
            figure: 'Read the three file bars, then the last bar with the deadline.',
            examples: [`Person-hours by task (team of four): ${LAB10_PERSON_HOURS.map((t) => `${t.task} ${t.hours}`).join('; ')}.`, 'Grading mode: formative this week; a faculty decision may make the Week 14 model the summative baseline for behavior.'],
            misconceptions: [{ claim: 'One scenario as a flow means the other scenarios can be left out.', correction: 'Every scenario becomes a use case; only one needs its full flow this week.' }],
            transition: 'Start now: one scenario, mapped step by step.',
            timing: '3 min: 1 min the files, 1 min minimums, 1 min workload and AI.',
          },
        },
        {
          id: 'w10s2-lab-map',
          title: 'Team work: map one scenario in the lab tool',
          subtitle: '12 minutes, in teams, in the Week 10 lab tool',
          purpose: 'Run the first lab steps in class with the instructor circulating: import the three files, choose the scenario with the most alternates (a team of three: any with at least one), name each step and its function, give each alternate a guard, and preview the flow.',
          minutes: 12,
          layout: 'figure-bullets',
          figure: {
            id: 'w10s2-lab-map',
            caption: 'In class: import, choose the scenario, map each step and alternate, preview the flow in the lab tool. Course illustration, not SysML v2 graphical notation.',
            alt: 'Four bars stacked top to bottom, joined by arrows: 2 min · import, choose the scenario; 6 min · each step: name, function; 3 min · each alternate: a guard; 1 min · preview the flow.',
          },
          body: [{ kind: 'bullets', items: ['Import your Week 9 model and your Week 2 and Week 4 exports', 'Choose the scenario with the most alternates (team of three: any with one)', 'Each step: a short name and its function (or none)', 'Each alternate: a guard that says its condition; preview'] }],
          sources: [],
          notes: {
            teach: [
              'Set a visible 12-minute timer. One laptop per team drives the lab tool; another member holds the Week 2 ConOps table open to check the tool against it.',
              'Minutes 0 to 2: import and choose. Each team imports its Week 9 model file and its Week 2 and Week 4 model-inputs files, checks that the tool shows its own enterprise, and chooses the scenario with the most alternates (a team of three: any scenario with at least one alternate). If a file is refused, read the message with the team: the usual causes are the AeroLink example, the Markdown trace matrix instead of the model file, or a Week 8 model instead of the Week 9 one.',
              'Minutes 2 to 8: the steps. For each step, a short name that reads as an action, and the function it is an occurrence of, or none where an external actor acts. The most common correction is at those external-actor steps: the step stays, and a decision carries the alternate.',
              'Minutes 8 to 11: the alternates. For each, a guard that says its condition as a Boolean name, and where the decision sits: before the step when the condition is known first, after it otherwise. Ask each table: when does this condition become known, and if this guard and the next one could both be true, what does the model say happens?',
              'Last minute: preview the flow. Find the decision and the merge in the text, and the item flows the tool computed between steps. If there are none, the functions of two consecutive steps do not share an item yet: that is the first fix for day 1.',
            ],
            why: 'Starting the mapping with the instructor in the room prevents a week spent on a flow built on the wrong scenario or with guards that do not say their conditions.',
            figure: 'Point at the four bars in order as the timer passes each phase.',
            examples: ['A typical first mistake: an external-actor step mapped to an internal function, “the air traffic service accepts” as the flight-intent function. Ask who acts in the ConOps step.'],
            misconceptions: [{ claim: 'Every step must subset a function.', correction: 'A step performed by an external actor has no function of the system; it stays a plain action.' }],
            transition: 'Checkpoint: show the instructor your mapping.',
            timing: '12 min: 2 import and choose, 6 steps, 3 alternates, 1 preview.',
          },
        },
        {
          id: 'w10s2-lab-checkpoint',
          title: 'Instructor checkpoint',
          subtitle: 'Per team: the scenario, one decision, one item flow',
          purpose: 'Catch the common errors early: each team shows its chosen scenario, one decision with its guards and else, and one item flow in the preview.',
          minutes: 5,
          layout: 'bullets',
          body: [{ kind: 'bullets', items: ['Show: the scenario and why it was chosen', 'Show: one decision; read its guards and else aloud', 'Show: one item flow, from which step to which', 'Note one fix to make before day 2'] }],
          sources: [],
          notes: {
            teach: [
              'Visit each team for about a minute. Ask to see the chosen scenario and why; one decision, with its guards read aloud as conditions and the else; and one item flow, with the question: which step produces the item, and which consumes it?',
              'Typical findings: an alternate that rejoins where the ConOps says it ends; a guard named after the response instead of the condition; no item flow because the functions’ items were never chosen; an external-actor step mapped to a system function.',
              'Each team leaves with one fix noted for day 2. A team whose import failed books a slot with the teaching assistant before day 2; the Week 9 model must be importable before anything else can proceed.',
            ],
            why: 'A one-minute check per team catches the errors that would otherwise repeat across the whole flow.',
            transition: 'Close with the next seven days.',
            timing: '5 min: about a minute per team, run while teams continue.',
          },
        },
        {
          id: 'w10s2-lab-close',
          title: 'Close: the next seven days',
          subtitle: 'Quiz Q10 and the applied exercise open today. Log your hours.',
          purpose: 'Give the out-of-class plan with lead roles, the assessments and the time log.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w10s2-seven-days',
            caption: 'A suggested seven-day plan for Lab L10, with the lead role for each task (course convention). Course illustration, not SysML v2 graphical notation.',
            alt: `A plan of days 1 to 7, one bar per task across the days it takes: ${SEVEN_DAY_PLAN.map((p) => `${p.task}, day${p.from === p.to ? ` ${p.from}` : `s ${p.from} to ${p.to}`}`).join('; ')}.`,
          },
          body: [],
          sources: [],
          notes: {
            teach: [
              'Walk the plan once; it is a suggestion, and the team charter decides. Functions and items come first, because the flow and the item flows read them; the flow before the states, because the states reuse its functions; the checker runs before the review, because the review often changes the model.',
              `Assessment: readiness quiz Q10, individual, about 15 minutes, and the individual applied exercise on an unseen case, about ${EXERCISE_MINUTES} minutes; graduate students answer its fifth task. Everything is due before Week 11, Session 1. Log your hours: the workload estimate is tested against them.`,
            ],
            why: 'A concrete plan with owners turns the brief into daily actions and makes individual accountability visible.',
            figure: 'Read the bars left to right; point at day 6, the review and audit, after day 5, the checker runs.',
            misconceptions: [{ claim: 'The review checklist can be filled in before the model is finished.', correction: 'The checklist reviews the model you submit; run it after the last change.' }],
            transition: 'End of Week 10. Week 11 gives the logical architecture physical homes.',
            timing: '2 min: 1.5 min plan and assessment, 30 s questions.',
          },
        },
        {
          id: 'w10s2-references',
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
      id: 'w10s2-l-states',
      title: 'Operating states',
      blocks: [
        { kind: 'para', text: 'Session 2 starts with three drafts of one branch of the AeroLink charging scenario: when an aircraft arrives and both hub chargers are occupied, it queues; otherwise it is connected. Draft A uses a fork, which starts both successors, so the aircraft would queue and be connected at once. Draft B uses a decision with two independent guards and no else: both can be true, or both false, and then nothing follows. Draft C is right: one guard and an else, with the queue looping back to a merge before the check. All three pass the checker, which evaluates no guard and does not know the ConOps.' },
        { kind: 'figure', slide: 'w10s2-warmup' },
        { kind: 'para', text: 'Session 1 modeled behavior as functions in sequence. SEBoK describes a second view of the same behavior: abstract the transformation of inputs into outputs away and look only at which functions are active. That view is a scenario of modes, a chain of modes performed as a sequence of transitions; a transition is triggered by the arrival of a control flow, an event or a trigger, and an action can be generated within a transition. Its proven practices call a function, “to move”, and its operational mode, “moving”, two similar and complementary views. For AeroLink, the function Fly passenger trip and the state in flight are such a pair.' },
        { kind: 'figure', slide: 'w10s2-function-mode' },
        { kind: 'para', text: 'SysML v2 writes modes as a state definition, a kind of action definition that defines the conditions under which other actions can execute. It is like a state machine in UML and SysML v1: it defines a behavioral state that a system can exhibit, it specifies a set of nested states, and the states are connected by transitions that fire on acceptance of item transfers. The initial state is written first start then the state. In a state that is not parallel and has substates, exactly one substate is active at any time after entry.' },
        { kind: 'para', text: 'A transition names its source with first, its trigger with accept, an optional guard with if, an optional effect with do and its target with then, in that order. The trigger is an accept action that accepts an incoming transfer; the guard is a condition that must be true for the transition to fire; the effect is performed when the transition fires, before the target is entered. An accept … then … written right after a state takes that state as its source. The course checker rejects a transition whose guard is written before its trigger.' },
        { kind: 'figure', slide: 'w10s2-transitions' },
        { kind: 'para', text: 'States run functions. An entry action is performed on entry to a state, a do action while in it, and an exit action on leaving it; each may reference an action defined elsewhere or define one in place. The do action starts after the entry action completes and continues while the state is active. In the AeroLink model the actions are the Session 1 functions, so nothing is written twice.' },
        { kind: 'para', text: 'Two structural rules complete the notation. A parallel state is one whose substates run concurrently, and no transitions are allowed between them; use regions when the element is in two conditions at once, such as on the pad or in flight, and at the same time fit or degraded. And a part exhibits states with exhibit, which identifies the part exhibiting states defined elsewhere; the exhibited states typically reflect conditions of that part.' },
        { kind: 'figure', slide: 'w10s2-parallel' },
      ],
      sources: [R('R20b', '589'), R('R20b', '594'), R('R82', '145–146'), R('R73', '48–49'), R('R73', '51–53'), R('R73', '56'), R('R72', '38'), R('R72', '40')],
    },
    {
      id: 'w10s2-l-worked-states',
      title: 'Worked example: the aircraft’s operating states',
      blocks: [
        { kind: 'para', text: `AeroLink model v0.3 gives the aircraft a state definition with ${numberWord(COUNTS.states)} states, ${numberWord(COUNTS.transitions)} transitions and ${numberWord(COUNTS.guards)} guard, generated from the instructor’s modeling decisions by the same generator the lab tool uses. The charging state does the charging function, the in-flight state does the flight function, and the out-of-service state performs the health assessment on entry. The part definition Aircraft, the Week 9 placeholder in the Physical package, exhibits the states; Week 11 completes it.` },
        { kind: 'figure', slide: 'w10s2-worked-states' },
        { kind: 'table', header: ['Transition', 'Trigger', 'Guard', 'From the ConOps'], rows: M.transitions.map((t) => [`${t.from} → ${t.to}`, t.trigger, t.guard || '—', sourceOf(t)]), caption: 'The transitions of the aircraft’s operating states and the ConOps step behind each (FICTIONAL)' },
        { kind: 'para', text: 'The one guard, not noGoFaultOpen on the release, writes the stakeholder requirement that no aircraft is dispatched with an open no-go fault as behavior: the release signal does not move the aircraft into flight while the fault is open. Every other transition is unconditional, because the ConOps makes no other change conditional.' },
        { kind: 'para', text: 'Ask what happens to an aircraft that becomes fit while it is out of service. The only way out of that state is the return-to-service signal, and it leads to the pad, not to dispatch-ready, so the aircraft charges and is released again. That is not a defect: the maintenance scenario restores availability after repair, and a repaired aircraft starts a new turnaround. It is a decision the team can defend from the ConOps, which is the test every modeling choice must pass.' },
        { kind: 'para', text: `Follow one function through all four links from behavior to structure. The SCN-002 step ${THREAD.step} subsets ${THREAD.fn} ${THREAD.name}, the course convention that a step is an occurrence of its function; ${THREAD.performer}, ${THREAD.performerName}, performs it; the state ${THREAD.state} does it; and the part definition ${THREAD.exhibitor} exhibits the states. Each link asserts something different: an occurrence, a performer, an activity while in a condition, and whose conditions the states are.` },
        { kind: 'figure', slide: 'w10s2-exhibit' },
      ],
      sources: [R('R73', '48'), R('R73', '52–53'), R('R73', '56'), R('R72', '41'), R('R82', '145–146')],
    },
    {
      id: 'w10s2-l-usecases',
      title: 'Use cases',
      blocks: [
        { kind: 'para', text: 'A use case frames behavior from outside. The SysML v2.1 Beta 2 specification defines a use case definition as one that specifies the required behavior of its subject relative to one or more external actors; its objective is to provide an observable result of value to one or more of its actors. An actor is a parameter representing a role played by an entity external to the subject; actors are referential part usages, so they must have part definitions. The subject must be declared first, before any actor, and the required behavior of a use case can be specified as for an action, which is why a scenario’s flow can sit inside its use case.' },
        { kind: 'figure', slide: 'w10s2-use-cases' },
        { kind: 'para', text: 'An include use case usage is a kind of perform action usage: the containing use case performs the included one. The included use case has the same subject as the containing one; its actors are bound explicitly. The traditional extend relationship is not supported yet, so model an optional extension as a guarded branch of the flow, or as a separate use case.' },
        { kind: 'para', text: `The lab tool writes a use case for every scenario of the Week 2 ConOps; for AeroLink, ${numberWord(COUNTS.scenarios)}. Each has the enterprise as subject, a course convention: the passengers, operators and air traffic service interact with the service as a whole. A team may choose a narrower system of interest, and must say so. Each actor is typed by the Week 8 stakeholder or external-system definition the scenario names, ${actorsModeled} actors in all. ${numberWord(docOnly.length).replace(/^./, (c) => c.toUpperCase())} scenarios also name a role inside the enterprise, a customer services agent, a fleet controller or the operations-center duty manager; those are part of the subject, not external actors, so they stay in the doc, and the audit records why. The objective holds the success end state; the trigger, preconditions and failure end state go in the doc. Only SCN-002, ${SCN2.name}, carries its flow this week.` },
        { kind: 'figure', slide: 'w10s2-worked-usecases' },
      ],
      sources: [R('R116', '177'), R('R76', '100–101')],
    },
    {
      id: 'w10s2-l-consistency',
      title: 'Checking behavior against the ConOps and the structure',
      blocks: [
        { kind: 'para', text: 'Flows, states and use cases are three views of one behavior, and they must agree. The course method for the cross-check: for every flow step that changes the element’s condition there should be a transition, accepted in the state the element is in at that step; for every transition there should be a step, in some scenario, that causes its trigger, since transitions fire on accepted transfers.' },
        { kind: 'figure', slide: 'w10s2-cross-check' },
        { kind: 'para', text: `The lab tool computes a first pairing: a transition into a state whose entry or do function is the function of a step. For AeroLink, ${numberWord(matched.length)} of the ${numberWord(CROSS_CHECK.length)} transitions pair that way: the release into flight, with the two flight steps of SCN-002. The other ${numberWord(unmatched.length)} need a reviewer. The landing is caused by the step approachAndLand, although the pad state runs no function; the charging transitions are caused by steps of the charging scenario, which the class did not model as a flow; the fault transitions belong to the maintenance scenario. A transition caused by no step of any scenario, or a condition-changing step with no transition, would be a real finding.` },
        { kind: 'para', text: 'The model also carries the other trace SEBoK asks of a logical architecture: requirements allocated to functions. The behavior audit lists every system requirement allocated to no function, every function with no performer or no items, every unreachable state and every actor the model cannot type. Each needs a fix in the tool or a disposition: an open item with an owner, or why no change is needed.' },
      ],
      sources: [R('R73', '48'), R('R20b', '591')],
    },
    {
      id: 'w10s2-l-errors',
      title: 'Common errors and the review checklist',
      blocks: [
        { kind: 'para', text: 'Seven errors recur in behavior models. A fork where the ConOps has a choice: a fork starts every successor, a decision exactly one. Guards that leave a gap with no else: for the uncovered values no successor is possible. An alternate that rejoins the main flow where the ConOps says the scenario ends. A transition between concurrent regions. Two initial states in a state that is not parallel. A function no logical part performs. A state definition no part exhibits.' },
        { kind: 'figure', slide: 'w10s2-predict' },
        { kind: 'para', text: `None of the seven is reliably rejected by the course checker in the recorded results of this release. The three predict listings show it: two initial states, ${pTwo.recorded}; a transition across parallel regions written inside a region, ${pPar.recorded}; an unreachable state, ${pUnr.recorded}. The checker does reject any transition that a parallel state itself owns, even one within a single region (${pOwned.recorded}), so the result depends on where the transition is written, not on whether it crosses regions. The other errors pass, or are questions of meaning the checker cannot ask.` },
        { kind: 'para', text: `So the lab uses a checklist, a course convention, with ${numberWord(REVIEW_CHECKS.length)} checks: ${REVIEW_CHECKS.map((c) => c.text.charAt(0).toLowerCase() + c.text.slice(1)).join('; ')}. For each, your team records whether the model meets it or what the finding is, with a short note on how it checked. The tool shows the evidence it can compute; whether a guard means its condition, or whether the flow follows the ConOps, is your judgment.` },
        { kind: 'figure', slide: 'w10s2-checklist' },
      ],
      sources: [R('R72', '35–38'), R('R72', '40'), R('R73', '51'), R('R82', '146'), R('R72', '41'), R('R73', '56')],
    },
    {
      id: 'w10s2-l-lab',
      title: 'From your package to model v0.3',
      blocks: [
        { kind: 'para', text: `The mapping for this week is a course convention. ${W10_MAPPING.map((m) => `${m.artifact}, from ${m.from}, becomes ${m.becomes}`).join('. ')}.` },
        { kind: 'figure', slide: 'w10s2-mapping' },
        { kind: 'para', text: 'The lab tool generates all of it from your Week 9 model and your Week 2 and Week 4 exports, and keeps the Week 8 and Week 9 parts of the model exactly as they are. Your decisions are three: the items each function consumes and produces; the steps, functions and guards of one scenario, the one with the most alternates; and the operating states of your principal element, with the part that exhibits them. If a step needs a function your decomposition lacks, add it in the tool: its ID continues after the highest your files have used, and no ID is ever reused or renumbered.' },
        { kind: 'para', text: 'Next week gives the logical architecture physical homes. Each logical part is allocated to the physical part that realizes it, with nested allocations of the functions it performs; the items move onto ports and interfaces; send and accept actions get real connections; and the first satisfy claims become defensible. Keep every function and item ID stable: Week 11 reads them.' },
        { kind: 'figure', slide: 'w10s2-bridge' },
      ],
      sources: [R('R76', '106')],
    },
  ],
}
