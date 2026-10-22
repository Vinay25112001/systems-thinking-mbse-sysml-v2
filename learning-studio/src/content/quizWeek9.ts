// Week 9 readiness quiz Q9 (individual, formative), kept separate from the lecture (DECISION_LOG A20). Every item is
// answerable from the Week 9 lectures and the detailed lesson: `lecture` names the slide that teaches it and the lesson
// section that explains it; every option's explanation names that slide and cites the register page the answer rests on
// (or, for a course convention, says so in courseSource and in the key). Contexts are unseen and never AeroLink, and none
// uses the applied exercise's setting. Keys are spread a–d three times each, the key's length rank varies so that each
// rank occurs three times with no run of three, and the cue rules of the Weeks 3–6 quizzes apply (quizWeek9.test.ts).
// New items, pending independent review.
import type { QuizQuestion } from './schema'

const PENDING = 'new-pending-review' as const
type Opt = [id: 'a' | 'b' | 'c' | 'd', text: string, why: string]
/** An item: the key's id, its options with explanations, the citation the key rests on, the slide and lesson section. */
function item(id: string, bloom: QuizQuestion['bloom'], objective: string, prompt: string, key: Opt[0], opts: Opt[], cite: { reading: string; pages: string }, lecture: { session: 1 | 2; slide: string; section: string }, courseSource?: string): QuizQuestion {
  const ref = `slide ${lecture.slide}; ${cite.reading} p${cite.pages.includes('–') ? 'p' : ''}.${cite.pages}`
  return {
    id,
    bloom,
    objective,
    review: PENDING,
    prompt,
    options: opts.map(([oid, text, why]) => ({ id: oid, text, correct: oid === key, explanation: `${oid === key ? 'Correct. ' : ''}${why} (${ref}).` })),
    cite,
    ...(courseSource ? { courseSource } : {}),
    lecture: { week: 9, session: lecture.session, slide: lecture.slide, section: lecture.section },
  }
}

export const WEEK9_QUIZ: QuizQuestion[] = [
  item('w9q-1', 'Understand', 'W9.1', 'In the SysML v2 specification, which kind of language element is a requirement definition said to be?', 'b', [
    ['a', 'A part definition, which owns attributes and ports', 'A requirement is not a part: parts are the entities with structure and behavior, and a requirement constrains them.'],
    ['b', 'A constraint definition, which evaluates to true or false', 'The specification defines a requirement definition as a kind of constraint definition, satisfied when it evaluates to true.'],
    ['c', 'A comment kind, whose text is the documentation for readers', 'The documentation comment is the informal text of a requirement, but the requirement itself is a constraint.'],
    ['d', 'A package kind, used to group requirement elements', 'A requirement can group others, but that is because it is a requirement; it is not a package.'],
  ], { reading: 'R83', pages: '161' }, { session: 1, slide: 'w9s1-constraint', section: 'w9s1-l-construct' }),

  item('w9q-2', 'Understand', 'W9.1', 'A model declares a requirement with the short name <\'R-12\'>. What does the specification consider that short name to be?', 'd', [
    ['a', 'A display label that a modeling tool may regenerate', 'Labels a tool manages are element IDs, which the notation does not write; a short name is written by the modeler.'],
    ['b', 'The name of the entity on which the requirement is specified', 'That entity is the subject, a parameter of the requirement, not its short name.'],
    ['c', 'An alias that holds inside the enclosing package', 'An alias is a different construct; a requirement’s short name has a defined role of its own.'],
    ['d', 'The requirement ID of the element that carries it', 'When a requirement has a short name, the specification considers it the requirement ID.'],
  ], { reading: 'R83', pages: '165' }, { session: 1, slide: 'w9s1-id-doc', section: 'w9s1-l-construct' }),

  item('w9q-3', 'Apply', 'W9.1', 'A hospital infusion service has the system requirement “The pump controller shall raise an occlusion alarm within 15 s.” Following the course convention, which subject should the requirement declare?', 'a', [
    ['a', 'The pump controller, which raises the alarm', 'By course convention, a system requirement’s subject is the element its shall is about, here the pump controller.'],
    ['b', 'The hospital’s infusion service at large', 'A subject that large cannot be shown to satisfy an element-level obligation; the service is the subject of stakeholder requirements.'],
    ['c', 'The nurse who answers the occlusion alarm', 'The nurse is outside the element obliged; a person needed for satisfaction would be an actor, not the subject.'],
    ['d', 'The controller’s alarm limit of 15 s', 'The limit is an attribute of the requirement, compared with a feature of the subject; it is not the subject.'],
  ], { reading: 'R83', pages: '161' }, { session: 1, slide: 'w9s1-subject', section: 'w9s1-l-construct' }, 'course convention: the subject of a system requirement is the element its shall is about (slide w9s1-subject)'),

  item('w9q-4', 'Analyse', 'W9.1', 'A usage of a requirement definition binds the limit attribute to 2 s but never redefines the measured attribute as a feature of its subject. What follows?', 'c', [
    ['a', 'The checker rejects the usage and reports it as an incomplete requirement', 'The checker resolves names; a free attribute resolves, so nothing is reported.'],
    ['b', 'The measured attribute takes the subject’s first duration', 'No such default exists: an attribute that is not bound stays a feature of the requirement.'],
    ['c', 'Its constraint reads no value the design has', 'Without the redefinition, the measured attribute stays a free attribute of the requirement, so a later satisfy cannot connect any design value to the limit.'],
    ['d', 'Each subject of the right type satisfies it by default', 'Satisfaction is not automatic; here the constraint simply does not involve the subject at all.'],
  ], { reading: 'R83', pages: '166' }, { session: 1, slide: 'w9s1-worked-latency', section: 'w9s1-l-groups-forms' }),

  item('w9q-5', 'Analyse', 'W9.1', 'A rail requirement assumes visibility above 200 m and requires the stopping distance to stay within 400 m. On a foggy day visibility is 80 m and a train needs 450 m to stop. What does the requirement say about that day?', 'b', [
    ['a', 'It is violated, because the train needed 450 m to stop', 'The required constraint applies only when the assumption holds; that day it does not.'],
    ['b', 'It is satisfied, since its assumption is false that day', 'The effective constraint is an implication, so where the assumption fails the requirement is satisfied whatever happens.'],
    ['c', 'It is undefined until a separate fog requirement is added', 'An implication with a false condition is true, not undefined; whether another requirement should cover fog is a separate decision.'],
    ['d', 'It is violated, because fog lies outside the subject', 'Fog is part of the environment the assumption describes; that does not violate the requirement.'],
  ], { reading: 'R83', pages: '165' }, { session: 1, slide: 'w9s1-assume', section: 'w9s1-l-assume-params' }),

  item('w9q-6', 'Apply', 'W9.4', 'A museum models the visitors’ need for an unhurried visit. Its model already holds a concern C-3, crowding in the galleries, held by the visitors. Which declaration inside the need states that the need answers that concern?', 'c', [
    ['a', 'satisfy \'C-3\';', 'A satisfy asserts that a requirement holds for a bound design feature; it does not relate a need to a concern.'],
    ['b', 'stakeholder \'C-3\';', 'A stakeholder parameter is typed by a part definition of the stakeholder, not by a concern.'],
    ['c', 'frame \'C-3\';', 'A framed concern is declared with frame, and it becomes a required constraint of the need.'],
    ['d', 'ref \'C-3\';', 'A ref declares a reference usage; it does not say that the need answers the concern, and a frame does.'],
  ], { reading: 'R83', pages: '167' }, { session: 1, slide: 'w9s1-frame', section: 'w9s1-l-assume-params' }),

  item('w9q-7', 'Evaluate', 'W9.3', 'A trace matrix read from a model shows a need with a derivation to one stakeholder requirement. The team’s earlier record notes that this requirement covers part of the need and leaves the other part open. What should the trace audit conclude?', 'd', [
    ['a', 'The need is covered, since the model holds the derivation', 'A derivation shows a link; the recorded open item says part of the need has no requirement.'],
    ['b', 'The earlier note is stale, since the model supersedes the record', 'The model does not record partial coverage, so the note is the evidence; dropping it hides the gap.'],
    ['c', 'Link a second requirement to close the gap', 'Borrowing a link that obliges no one to meet the missing part makes the matrix look complete and hides the gap.'],
    ['d', 'The need stays an open item with an owner: a link is not full coverage', 'By course convention, the audit rule applies: the matrix shows a trace exists, not that the need is fully met, so the open item is carried with an owner.'],
  ], { reading: 'R115', pages: '580' }, { session: 2, slide: 'w9s2-trace-matrix', section: 'w9s2-l-trace' }, 'course convention: the trace audit carries recorded open items the derivations cannot show (slide w9s2-trace-matrix)'),

  item('w9q-8', 'Understand', 'W9.2', 'What does a derivation connection from the specification’s domain library assert about its original and derived requirements?', 'a', [
    ['a', 'Meeting the original should meet each derived one', 'The library says any subject that satisfies the original requirement should satisfy each derived requirement.'],
    ['b', 'Satisfying the derived ones together implies the original', 'That is the common intuition, but the library asserts the opposite direction.'],
    ['c', 'The derived ones were written later than the original', 'A derivation asserts a relation between satisfactions, not an order of writing.'],
    ['d', 'The original and the derived ones share one subject', 'Derived requirements may have their own subjects; the connection does not bind them to one.'],
  ], { reading: 'R115', pages: '580' }, { session: 1, slide: 'w9s1-derivation', section: 'w9s1-l-relationships' }),

  item('w9q-9', 'Analyse', 'W9.2', 'A team relates a system requirement to its parent stakeholder requirement with satisfy, “to show the trace”. Which relationship should replace it?', 'c', [
    ['a', 'A frame, as the parent is a concern it must satisfy', 'A frame relates a requirement to a concern it answers; a stakeholder requirement is not a concern here.'],
    ['b', 'An actor parameter, as the parent lies outside the subject', 'An actor is an entity needed for satisfaction, typed by a part definition; a requirement cannot be one.'],
    ['c', 'A derivation, as satisfy binds a design element', 'Between two requirements the defensible relationship is a derivation; satisfy asserts that a design feature bound to the subject meets the requirement.'],
    ['d', 'A redefinition, as the child replaces it', 'A redefinition replaces a feature in a specialization; the child requirement does not replace its parent.'],
  ], { reading: 'R83', pages: '168' }, { session: 1, slide: 'w9s1-satisfy', section: 'w9s1-l-relationships' }),

  item('w9q-10', 'Apply', 'W9.1', 'A water utility’s requirement holds just one doc comment: “The pressure shall stay at or above 2 bar at each hydrant.” Which addition lets the model evaluate it?', 'a', [
    ['a', 'A subject with a pressure feature, a limit, a required constraint', 'A required constraint over a feature of the subject, with the limit as an attribute, gives the model something to evaluate.'],
    ['b', 'A second doc comment, stating the pressure in numbers', 'More text is still text: the requirement remains informal, with nothing to evaluate.'],
    ['c', 'A rationale annotation explaining why 2 bar matters', 'Rationale explains why; it adds no constraint.'],
    ['d', 'A short name for the checker', 'A short name is the requirement ID; it does not make the requirement evaluable.'],
  ], { reading: 'R83', pages: '161' }, { session: 1, slide: 'w9s1-required-constraint', section: 'w9s1-l-construct' }),

  item('w9q-11', 'Evaluate', 'W9.5', 'An AI tool reviewing a team’s requirements reports that “user-friendly” in one requirement is ambiguous, and that two other requirements duplicate each other because they have the same subject. How should the team dispose of the two findings?', 'b', [
    ['a', 'Accept both findings, since the reviewing tool reported them', 'A finding is a candidate: it is accepted with a reason the team can defend, not because a tool produced it.'],
    ['b', 'Accept the first, reject the second, each with a reason', 'By course convention, each finding is decided with a reason; accept the first with a measurable rewrite, because the vague term is a real defect, and reject the second, because two obligations on one subject are not duplicates.'],
    ['c', 'Reject both findings, since the checker passed the requirements', 'The checker judges syntax and names, not ambiguity or duplication.'],
    ['d', 'Accept the second and merge the two requirements; ignore the first finding', 'Merging two distinct obligations loses one, and ignoring a real ambiguity leaves the defect.'],
  ], { reading: 'R13', pages: '566' }, { session: 2, slide: 'w9s2-ai-method', section: 'w9s2-l-ai' }, 'course convention: the AI-assisted review method, each finding decided with a reason (slide w9s2-ai-method)'),

  item('w9q-12', 'Evaluate', 'W9.2', 'A teammate writes a satisfy for each requirement, each by the system of interest, “to show coverage”. What does each such line assert?', 'd', [
    ['a', 'That the system’s requirement was traced to a parent', 'Tracing to a parent is a derivation or a dependency; satisfy is not a trace link.'],
    ['b', 'That a verification case for the requirement already exists', 'A verification case verifies requirements in its objective; satisfy says nothing about one.'],
    ['c', 'That the requirement was reviewed and approved', 'Review status is recorded as metadata, not asserted by satisfy.'],
    ['d', 'That the system meets it, a claim its values must support', 'A satisfy asserts the requirement evaluates to true with the system bound to its subject, so it should be written only when the model gives grounds for it.'],
  ], { reading: 'R83', pages: '168' }, { session: 1, slide: 'w9s1-satisfy', section: 'w9s1-l-relationships' }),
]
