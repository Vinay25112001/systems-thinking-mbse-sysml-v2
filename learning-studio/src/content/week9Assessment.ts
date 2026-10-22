// Week 9 individual applied exercise (Assessment page), kept separate from the lecture (DECISION_LOG A20): an unseen,
// FICTIONAL case (a coastal flood-warning service) that no slide, worked example or quiz item uses; five tasks; and the
// rubric, five criteria with four level descriptors each (20 points). The instructor key is
// sysml/instructor/week09/exercise_flood_warning_key.sysml (checked by the course checker; never bundled for students).
// Review status: new-pending-review (outline §6.2, with the case changed from the outline's bicycle-share so that the
// setting is unseen across weeks).
import { EXERCISE_MINUTES } from './lectures/week09/labBrief'

export const EXERCISE = {
  minutes: EXERCISE_MINUTES,
  title: 'Applied exercise: a coastal flood-warning service (FICTIONAL)',
  brief:
    'A county runs a flood-warning service for its coastal towns. River and tide gauge stations report water levels; a duty officer decides to warn; sirens sound and text messages go out. Its Phase I package gives two stakeholders, STK-001 coastal residents and STK-002 county emergency management; two concerns, CON-001 (residents: warning in time to move people and belongings) and CON-002 (emergency management: false alarms erode trust); and the needs and requirements below. Two of the requirements carry a defect. You may run the course checker, but a PASS earns no points by itself.',
  table: [
    ['NEED-001', 'Need', 'Coastal residents need the flood-warning service to warn them early enough to move people and belongings to safety before water reaches their street.', 'STK-001; answers CON-001'],
    ['NEED-002', 'Need', 'County emergency management needs the flood-warning service to keep false warnings rare enough that residents still act on a warning.', 'STK-002; answers CON-002'],
    ['REQ-STK-001', 'Stakeholder requirement', 'The service shall warn at least 95 % of residents in a flood zone at least 60 min before water reaches their street.', 'parent NEED-001'],
    ['REQ-STK-002', 'Stakeholder requirement', 'The service shall issue no more than two false warnings per flood season.', 'parent NEED-002'],
    ['REQ-STK-003', 'Stakeholder requirement', 'The service shall send every warning through the county’s SMS gateway.', 'parent NEED-001'],
    ['REQ-SYS-001', 'System requirement', 'Each gauge station shall report the water level at intervals of no more than 5 min.', 'parent REQ-STK-001'],
    ['REQ-SYS-002', 'System requirement', 'The siren controller shall sound the sirens of a flood zone within 2 min of a warning decision.', 'parent REQ-STK-001'],
    ['REQ-SYS-003', 'System requirement', 'The siren controller shall drive each siren so that it is audible 100 m away. (The engineer’s note: tested on calm days only.)', 'parent REQ-STK-001'],
  ] as [string, string, string, string][],
  tasks: [
    'Model NEED-001 as a need (requirement usage) with its stakeholder and the concern it frames, and REQ-STK-001 as a requirement usage with a subject, a limit and a required constraint.',
    'Model REQ-SYS-001 and REQ-SYS-002 as usages of one requirement definition, each with its own subject and both parameters bound.',
    'Add the derivation of REQ-STK-001 from NEED-001 and of REQ-SYS-002 from REQ-STK-001, and state in one sentence each what the connection asserts.',
    'Find the two defective requirements. For each, say whether it is a finding of requirement verification or of requirement validation, why, and rewrite it.',
    'Graduate students: REQ-SYS-003’s condition is really “in winds up to 10 m/s”. Model it either as an assumption about the weather or as a reference condition kept with the quantity, justify the choice, and state what a later satisfy of REQ-SYS-003 would then claim. Other students: name two errors that the checker would not report in a model of this case, and how you would find each.',
  ],
}

/** The exercise rubric: five criteria, four level descriptors each (4 = exemplary … 1 = beginning), 4 points each. */
export const EXERCISE_RUBRIC: { criterion: string; levels: [string, string, string, string] }[] = [
  {
    criterion: 'Need and framing (task 1)',
    levels: [
      'The need is a requirement usage with the service as subject, a stakeholder parameter typed by the stakeholder’s part definition, a frame of exactly the concern it answers, and the stakeholder’s wording kept in its doc.',
      'All parts are present; one is weak, for example the doc is paraphrased or the stakeholder parameter is untyped.',
      'The frame is missing or frames a concern the need does not answer, or the need is written as an obligation on the system.',
      'The need is absent or modeled as something other than a requirement (a part or a comment).',
    ],
  },
  {
    criterion: 'Requirement form (tasks 1 and 2)',
    levels: [
      'Each requirement has its ID as a quoted short name, its statement as doc and the right subject; both system requirements are usages of one definition that bind the measured feature to a feature of their subject and the limit to a value with its unit.',
      'The form is right with one slip: a unit missing, or one binding of the measured feature missing.',
      'A system requirement has the service as subject, or one requirement is doc only, or the definition is used where a usage was needed.',
      'No required constraint anywhere, or no definition-usage relation.',
    ],
  },
  {
    criterion: 'Derivation semantics (task 3)',
    levels: [
      'Both derivations have the parent as the original end and the child as the derived end, and each sentence states that whatever satisfies the parent should satisfy the child.',
      'Both connections are right; one sentence is imprecise or restates the direction loosely.',
      'One derivation is reversed, or a plain dependency is used without saying what it claims.',
      'No derivation, or satisfy written between two requirements.',
    ],
  },
  {
    criterion: 'Diagnosis and rewrite (task 4)',
    levels: [
      'Both defects are found, and each is classified with a reason that matches the definition used: requirement verification when a characteristic of a good requirement is breached, requirement validation when the requirement does not carry the intent of its need; both rewrites are measurable and free of design.',
      'Both defects are found; one classification or one rewrite is weak.',
      'One defect is found and rewritten, or both are found without a usable rewrite.',
      'No defect is found, or a sound requirement is “corrected” instead.',
    ],
  },
  {
    criterion: 'Condition analysis (graduate) or what the checker cannot see (others) (task 5)',
    levels: [
      'Graduate: the choice follows from whether the audibility depends on the wind and is modeled correctly; the satisfy claim is stated precisely (as a gate: nothing is claimed above 10 m/s; as a reference condition: audibility measured under 10 m/s conditions). Others: two errors the checker passes silently, each with the review step that finds it.',
      'Graduate: the model is right and the claim imprecise. Others: two errors named, one without a way to find it.',
      'Graduate: a valid model with the choice unjustified or the claim wrong. Others: one real error named.',
      'Absent, or the answer treats a checker PASS as proof that the model is right.',
    ],
  },
]
export const EXERCISE_POINTS = EXERCISE_RUBRIC.length * 4
