// Week 10 individual applied exercise (Assessment page), kept separate from the lecture (DECISION_LOG A20): an unseen,
// FICTIONAL case (a city bike-share service) that no slide, worked example or quiz item uses; five tasks; and the
// rubric, five criteria with four level descriptors each (20 points). The instructor key is
// sysml/instructor/week10/exercise_bike_share_key.sysml (checked by the course checker; never bundled for students).
// Review status: new-pending-review (outline §6.2).
import { EXERCISE_MINUTES } from './lectures/week10/labBrief'

export const EXERCISE = {
  minutes: EXERCISE_MINUTES,
  title: 'Applied exercise: a city bike-share service (FICTIONAL)',
  brief:
    'A city runs a bike-share service. Riders rent a bike at a docking station, ride it, and return it at any station; a payment provider charges each ride. Each dock holds one bike, charges its battery, and can be taken out of service when a fault is reported. The service’s Week 2 ConOps gives the rental scenario below, and its Week 4 description names three operating modes of a dock: a bike available, charging, and out of service. You may run the course checker, but a PASS earns no points by itself: the exercise is graded on meaning.',
  scenario: {
    name: 'Rent a bike',
    actors: 'Rider (primary); payment provider',
    trigger: 'A rider asks for a bike at a station.',
    steps: ['The rider asks for a bike at the station.', 'The service unlocks a bike for the rider.', 'The rider rides.', 'The rider docks the bike; the service closes the ride and charges it.'],
    alternates: ['A1, at step 1: no bike is available. The service shows the nearest station with a bike; the scenario ends.', 'A2, at step 4: the dock is full. The service gives the rider 15 free minutes to reach the next station; the rider then docks there (rejoin at step 4).'],
    success: 'The rider rode and returned the bike, and the ride was charged.',
  },
  /** The draft for task 5: written with constructs the course checker accepts, and defective in meaning. */
  fragment: [
    'action def ReturnRide {',
    '    attribute dockFull : Boolean;',
    '    first start;',
    '    then action arriveAtStation;',
    '    then fork;',
    '        then dockBike;',
    '        then findNextStation;',
    '    action dockBike;',
    '    then done;',
    '    action findNextStation;',
    '    then done;',
    '}',
    'attribute def BikeDocked;',
    'attribute def BikeRemoved;',
    'state def DockStates {',
    '    first start then empty;',
    '    state empty;',
    '    accept BikeDocked then available;',
    '    state available;',
    '    accept BikeRemoved then empty;',
    '    state outOfService;',
    '}',
  ],
  tasks: [
    'Write the mapping table for the rental scenario: each step and each alternate, the flow node it becomes, and the construct (action, decide, merge, done).',
    'Write the rental scenario as an action flow in SysML v2 text, with one decision for each alternate, placed where its condition becomes known (before or after the step it branches from), a merge where the alternate rejoins, the ending alternate going to done, and at least one item flow between two steps.',
    'Write a state definition for a dock with at least three states, at least four transitions each with a trigger, and at least one guard; name the initial state, and say which part exhibits it.',
    'Write the use case header for the rental scenario: its subject, its actors and its objective.',
    'The draft above passes the checker. Graduate students: cross-check the draft flow against the draft states (which step should cause each transition, and which transition each condition-changing step needs) and report three findings from that cross-check. Other students: report three findings on the draft. For every finding give its location, the criterion it breaks and an actionable fix.',
  ],
}

/** The exercise rubric: five criteria, four level descriptors each (4 = exemplary … 1 = beginning), 4 points each. */
export const EXERCISE_RUBRIC: { criterion: string; levels: [string, string, string, string] }[] = [
  {
    criterion: 'Mapping table (task 1)',
    levels: [
      'Every step and both alternates have a row, in ConOps order, each with the node it becomes and the construct; each alternate row says where it branches (before or after its step) and whether it ends or rejoins.',
      'Every step and both alternates are mapped; one construct or one branch point is unclear.',
      'An alternate is missing, or steps are mapped without their constructs.',
      'The table is absent or lists the steps only.',
    ],
  },
  {
    criterion: 'Flow semantics (task 2)',
    levels: [
      'Successions follow the ConOps order; each alternate leaves a guarded decision with an else on the main path, placed where its condition becomes known (before the step when it is known first); the rejoining alternate enters a merge before its step and the ending one goes to done; an item flow joins a producing step to a later consuming one.',
      'The flow is right with one slip: a missing else, or the item flow between the wrong steps.',
      'A choice is modeled with a fork, or an alternate ends where the ConOps rejoins (or the reverse), or a branch declares its target in place.',
      'No decision, or the steps are listed without successions.',
    ],
  },
  {
    criterion: 'State semantics (task 3)',
    levels: [
      'At least three states and four transitions; one initial state; every transition has a trigger and its target; at least one guard; every state reachable from the initial state; the exhibiting part is named.',
      'The definition meets the counts with one slip: a state not reachable, or the exhibitor missing.',
      'Fewer states or transitions than asked, or no guard, or two initial states.',
      'States without transitions, or no state definition.',
    ],
  },
  {
    criterion: 'Use case header (task 4)',
    levels: [
      'The subject is declared first, each actor is typed by a part definition, and the objective states the result of value to the actors.',
      'Subject, actors and objective are present; one actor is untyped or the objective restates the trigger.',
      'The subject is missing or declared after the actors, or an actor is the subject itself.',
      'The header is absent or is a plain action.',
    ],
  },
  {
    criterion: 'Findings on the draft (task 5)',
    levels: [
      'Three real defects of meaning, each with its location, the criterion it breaks and a fix that removes it; graduate students derive each from a step–transition pairing.',
      'Three findings with two complete; or three complete findings of which one is not a defect.',
      'One complete finding, or findings without fixes.',
      'No finding, or the answer treats the checker’s PASS as proof that the draft is right.',
    ],
  },
]
export const EXERCISE_POINTS = EXERCISE_RUBRIC.length * 4
