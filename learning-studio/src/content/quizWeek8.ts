// Week 8 readiness quiz Q8 (individual, formative), kept separate from the lecture (DECISION_LOG A20). Every item is
// answerable from the Week 8 lectures and the detailed lesson: `lecture` names the slide that teaches it and the lesson
// section that explains it, and the item cites the register page its key rests on (or, for the course's import rule,
// names the course convention instead of borrowing a citation). Contexts are unseen and never AeroLink (outline §6.1).
// Keys are authored across a–d, three each, and the key's length rank among the four options (1 = longest … 4 =
// shortest) varies so that each rank occurs exactly three times with no run of three, so no "pick the n-th longest"
// rule scores above 25 % (quizWeek8.test.ts asserts it). New items, pending independent review.
import type { QuizQuestion } from './schema'

const PENDING = 'new-pending-review' as const

export const WEEK8_QUIZ: QuizQuestion[] = [
  {
    id: 'w8q-1', bloom: 'Understand', objective: 'W8.1', review: PENDING,
    prompt: 'A water utility keeps one model of its pipe network for leak detection and a different model of the same network for billing. Using the OMG definition that SEBoK lists, why can both be legitimate models of one network?',
    options: [
      { id: 'a', text: 'Each represents the network selectively, with form and content chosen for its own concerns', correct: true, explanation: 'Correct. The OMG definition calls a model a selective representation whose form and content are chosen for a specific set of concerns, so several models of one system are expected.' },
      { id: 'b', text: 'Only one of them can be the model; the other is a view of it', correct: false, explanation: 'Two models built for different concerns are both models. A view is a rendering of one model’s content, not a second model.' },
      { id: 'c', text: 'Both count as models only if they contain the same elements, since a model should capture the whole system', correct: false, explanation: 'A model is selective: it holds what its concerns need, so two models of one system usually differ.' },
      { id: 'd', text: 'They are legitimate only if each is written in its own modeling language', correct: false, explanation: 'Nothing in the definition ties a model to a language: the two models differ because their concerns differ, and both may use the same language.' },
    ],
    cite: { reading: 'R33a', pages: '290' },
    lecture: { week: 8, session: 1, slide: 'w8s1-what-model', section: 'w8s1-l-why-model' },
  },
  {
    id: 'w8q-2', bloom: 'Evaluate', objective: 'W8.1', review: PENDING,
    prompt: 'A clinic team’s model of its patient-intake service is consistent, complete for its stated purpose and accepted by every tool check. A reviewer then finds that the intake design it describes cannot handle walk-in patients. Which statement is best supported?',
    options: [
      { id: 'a', text: 'The model must be wrong, because a model of good quality always guarantees a design of good quality', correct: false, explanation: 'A precise model of a flawed design is still a good model; it may even be what reveals the flaw.' },
      { id: 'b', text: 'The language tool checks should have detected the missing walk-in path before review', correct: false, explanation: 'Tool checks judge conformance to the language rules, not whether the design meets its needs.' },
      { id: 'c', text: 'Model quality and design quality are separate questions', correct: true, explanation: 'Correct. SEBoK warns that the quality of a model should not be confused with the quality of the design it represents; here the model may be good while the design is not.' },
      { id: 'd', text: 'The design is probably adequate, since a complete, tool-checked model describes it', correct: false, explanation: 'Completeness and tool checks say something about the model, not about the design: a precise model can describe a design that fails a need.' },
    ],
    cite: { reading: 'R33b', pages: '296' },
    lecture: { week: 8, session: 1, slide: 'w8s1-model-quality', section: 'w8s1-l-why-model' },
  },
  {
    id: 'w8q-3', bloom: 'Understand', objective: 'W8.2', review: PENDING,
    prompt: 'In the four-layer architecture of SysML v2, which layer contains only syntactic elements, without model-level semantics?',
    options: [
      { id: 'a', text: 'Systems: parts, ports, actions, requirements', correct: false, explanation: 'The Systems layer is SysML proper: definitions and usages of parts, actions, requirements and the rest.' },
      { id: 'b', text: 'Kernel: classes, behaviors, packages', correct: false, explanation: 'The Kernel layer, where the package construct is defined, is the foundation for building modeling languages, with its semantic library; it is not syntax only.' },
      { id: 'c', text: 'Core: types, classifiers, features, multiplicity', correct: false, explanation: 'The Core layer has a direct semantic mapping to formal logic: types, classifiers, features, multiplicity.' },
      { id: 'd', text: 'Root: elements, relationships, namespaces, imports', correct: true, explanation: 'Correct. The Root layer holds the syntactic elements without model-level semantics: element, comment, namespace, relationship, membership, import, dependency. The package construct is listed one layer up, in Kernel, though it adds no meaning about the system either.' },
    ],
    cite: { reading: 'R70', pages: '4' },
    lecture: { week: 8, session: 1, slide: 'w8s1-four-layers', section: 'w8s1-l-language-architecture' },
  },
  {
    id: 'w8q-4', bloom: 'Apply', objective: 'W8.2', review: PENDING,
    prompt: 'A hospital model declares part def Ward and, inside part def Hospital, part icu : Ward and part maternity : Ward. Which reading is correct?',
    options: [
      { id: 'a', text: 'Ward is a definition; icu and maternity are two usages of it in the hospital', correct: true, explanation: 'Correct. A definition classifies a kind of element, and the same definition can be used several times in one context; each usage is defined by it.' },
      { id: 'b', text: 'icu and maternity are two instances of Ward, each written into the model text as an object', correct: false, explanation: 'A usage is not an instance: it is a feature, a role that instances play in a context.' },
      { id: 'c', text: 'The model is invalid, because one definition may be used only once in any single context', correct: false, explanation: 'The definition–usage pattern explicitly allows several usages of one definition in the same context.' },
      { id: 'd', text: 'icu and maternity are specializations of Ward', correct: false, explanation: 'Specialization relates definitions and is written :> after a definition; here a colon types two usages by the definition Ward.' },
    ],
    cite: { reading: 'R80', pages: '63' },
    lecture: { week: 8, session: 1, slide: 'w8s1-def-usage', section: 'w8s1-l-definition-usage' },
  },
  {
    id: 'w8q-5', bloom: 'Analyse', objective: 'W8.5', review: PENDING,
    prompt: 'A bus fleet model contains the two declarations part def ElectricBus :> Bus; and, inside part def Depot, part reserveBuses :> buses;. What does the :> symbol assert in each?',
    options: [
      { id: 'a', text: 'Redefinition in both declarations: each one replaces the element named after the symbol in its context', correct: false, explanation: 'Redefinition is written :>> (or redefines); a single :> is not redefinition.' },
      { id: 'b', text: 'Specialization after the definition; subsetting after the usage, so buses must be a feature', correct: true, explanation: 'Correct. After a definition’s name :> means specializes; after a usage’s name it means subsets, so what follows must be a feature.' },
      { id: 'c', text: 'Typing in both: each declares the element’s type', correct: false, explanation: 'Typing is written with a colon :, not :>.' },
      { id: 'd', text: 'Specialization in both, so Bus and buses are definitions', correct: false, explanation: 'The second declaration is a usage, so its :> is subsetting and buses is a usage, not a definition.' },
    ],
    cite: { reading: 'R80', pages: '72' },
    lecture: { week: 8, session: 1, slide: 'w8s1-one-symbol', section: 'w8s1-l-specialization-subsetting-redefinition' },
  },
  {
    id: 'w8q-6', bloom: 'Apply', objective: 'W8.5', review: PENDING,
    prompt: 'A ward is modeled as part def Ward { part beds : Bed[20]; part isolationBeds : Bed[4] subsets beds; }. How many beds does every ward have in all?',
    options: [
      { id: 'a', text: '24: four isolation beds added to twenty beds', correct: false, explanation: 'Subsetting does not add beds: the isolation beds are values of beds.' },
      { id: 'b', text: 'It cannot be known without a redefinition', correct: false, explanation: 'No redefinition is needed: the multiplicities already fix the counts.' },
      { id: 'c', text: '16: the isolation beds are taken out of the twenty', correct: false, explanation: 'The isolation beds are not removed from beds; they are among them.' },
      { id: 'd', text: '20, of which four are isolation beds', correct: true, explanation: 'Correct. Subsetting asserts that the values of isolationBeds are a subset of the values of beds in any common context.' },
    ],
    cite: { reading: 'R70', pages: '11' },
    lecture: { week: 8, session: 1, slide: 'w8s1-subsetting', section: 'w8s1-l-specialization-subsetting-redefinition' },
  },
  {
    id: 'w8q-7', bloom: 'Analyse', objective: 'W8.5', review: PENDING,
    prompt: 'part def Vehicle { part wheels : Wheel[4..6]; } and part def Minibus :> Vehicle { part redefines wheels[6]; }. What does the second declaration guarantee for every Minibus?',
    options: [
      { id: 'a', text: 'Its wheels feature is replaced in Minibus by one with exactly six wheels', correct: true, explanation: 'Correct. A redefining usage replaces the redefined one in its context; the shorthand keeps the name and constrains the multiplicity.' },
      { id: 'b', text: 'It has the four to six inherited wheels plus six more', correct: false, explanation: 'That would be an added feature; a redefinition replaces the inherited one.' },
      { id: 'c', text: 'Every Vehicle now has six wheels', correct: false, explanation: 'Vehicle itself is unchanged: the redefinition applies in Minibus only, so other vehicles keep four to six wheels.' },
      { id: 'd', text: 'Nothing, because a multiplicity cannot be changed once it is declared', correct: false, explanation: 'Redefinition can be used to constrain the multiplicity of a feature.' },
    ],
    cite: { reading: 'R80', pages: '65' },
    lecture: { week: 8, session: 1, slide: 'w8s1-redefinition', section: 'w8s1-l-specialization-subsetting-redefinition' },
  },
  {
    id: 'w8q-8', bloom: 'Evaluate', objective: 'W8.6', review: PENDING,
    prompt: 'A school-transport team runs the course checker on its model and gets PASS with no message. Which conclusion is justified?',
    options: [
      { id: 'a', text: 'The model correctly represents everything the team recorded in its Phase I register', correct: false, explanation: 'The checker cannot compare the model with the register; that is the import audit’s job.' },
      { id: 'b', text: 'Every stakeholder concern in the model has been addressed by the system design', correct: false, explanation: 'Whether concerns are addressed is an engineering judgment the checker never makes.' },
      { id: 'c', text: 'It parsed, names resolved and no rule fired; meaning is still open', correct: true, explanation: 'Correct. A modeling tool checks conformance to the language rules; meaning and fidelity remain the team’s responsibility.' },
      { id: 'd', text: 'The model is ready to submit', correct: false, explanation: 'Validity is one rubric criterion; structure, completeness and fidelity are judged separately, after the import audit.' },
    ],
    cite: { reading: 'R33a', pages: '291–292' },
    lecture: { week: 8, session: 1, slide: 'w8s1-predict-checker', section: 'w8s1-l-checker-calibration' },
  },
  {
    id: 'w8q-9', bloom: 'Apply', objective: 'W8.4', review: PENDING,
    prompt: 'A freight team must carry its Phase I ID TRK-07 into the model as the short name of the truck-depot part definition. Which declaration does that correctly?',
    options: [
      { id: 'a', text: "part def <TRK_07> 'Truck depot' :> Depot;", correct: false, explanation: 'This writes a different ID, TRK_07: the Phase I ID is TRK-07, and a hyphen is allowed only in a quoted (unrestricted) name.' },
      { id: 'b', text: "part def 'TRK-07' <TruckDepot>;", correct: false, explanation: 'The short name comes first, in angle brackets; this swaps the name and the short name.' },
      { id: 'c', text: "part def TruckDepot <'TRK-07'>;", correct: false, explanation: 'The short name is written before the name, not after it.' },
      { id: 'd', text: "part def <'TRK-07'> 'Truck depot';", correct: true, explanation: 'Correct. The short name is given first in angle brackets, and an ID with a hyphen must be an unrestricted (quoted) name.' },
    ],
    cite: { reading: 'R80', pages: '49–50' },
    lecture: { week: 8, session: 2, slide: 'w8s2-names', section: 'w8s2-l-packages-names' },
  },
  {
    id: 'w8q-10', bloom: 'Apply', objective: 'W8.4', review: PENDING,
    prompt: 'Package Fleet contains public import Units::*; package Depot contains private import Units::*. A third package imports Fleet::* and Depot::*. Through which package are the unit members visible to it?',
    options: [
      { id: 'a', text: 'Through Depot only, because its import is the private one', correct: false, explanation: 'Depot’s import is private, so it does not pass the unit members on.' },
      { id: 'b', text: 'Through Fleet only, since its import is public', correct: true, explanation: 'Correct. All members from a public import are re-exported by the importing package; members from a private import are not.' },
      { id: 'c', text: 'Through both packages, since imports are public by default', correct: false, explanation: 'Members are public by default, but an import’s visibility is stated explicitly, and Depot’s is private.' },
      { id: 'd', text: 'Through neither package, as imported members are not passed on', correct: false, explanation: 'Fleet’s public import does pass the members on.' },
    ],
    cite: { reading: 'R70', pages: '6' },
    lecture: { week: 8, session: 2, slide: 'w8s2-imports', section: 'w8s2-l-imports' },
  },
  {
    id: 'w8q-11', bloom: 'Apply', objective: 'W8.4', review: PENDING,
    prompt: 'A campus-transit team models a concern of its riders. Which declaration is well formed?',
    options: [
      { id: 'a', text: "concern <'CON-004'> { stakeholder riders : 'STK-002'; subject : 'ENT-001'; }", correct: false, explanation: 'The subject must be declared first, before any stakeholder.' },
      { id: 'b', text: "concern <'CON-004'> { subject service : 'ENT-001'; stakeholder riders : 'STK-002'; }", correct: true, explanation: 'Correct. The subject comes first; the stakeholder parameter is a part usage typed by the stakeholder’s part definition.' },
      { id: 'c', text: "concern <'CON-004'> { subject service : 'ENT-001'; attribute riders : 'STK-002'; }", correct: false, explanation: 'Stakeholders are declared with the keyword stakeholder; an attribute is not a stakeholder parameter, and stakeholder parameters are part usages.' },
      { id: 'd', text: "concern <CON-004> { subject service : 'ENT-001'; stakeholder riders : 'STK-002'; }", correct: false, explanation: 'The short name contains a hyphen, so it must be quoted.' },
    ],
    cite: { reading: 'R83', pages: '166' },
    lecture: { week: 8, session: 2, slide: 'w8s2-stakeholder-concern', section: 'w8s2-l-stakeholders-concerns' },
  },
  {
    id: 'w8q-12', bloom: 'Apply', objective: 'W8.3', review: PENDING,
    prompt: 'A port-logistics team’s Phase I package includes a trade-study decision record, DEC-002. Week 8 does not model decisions. What does the import require for DEC-002 now?',
    options: [
      { id: 'a', text: 'Leave it out of the mapping entirely until the week that teaches its construct arrives', correct: false, explanation: 'An artifact left out of the mapping is a silent gap; the import maps everything now.' },
      { id: 'b', text: 'Paste the full text of the decision record into the documentation of the root package', correct: false, explanation: 'The root documentation states the model’s purpose; pasting text there does not map the artifact to its home.' },
      { id: 'c', text: 'Give it a package, a construct and the week that models it, or record why it waits', correct: true, explanation: 'Correct. The course import rule: every artifact gets a home in the model or a recorded reason to wait.' },
      { id: 'd', text: 'Model it now as a part definition in Analysis', correct: false, explanation: 'Week 8 models the context and stakeholders; the decision is mapped now and modeled in the week that teaches its construct, as an analysis result rather than a part.' },
    ],
    courseSource: 'The course import rule taught in Session 2 (the import is a mapping, not a copy): every Phase I artifact is mapped by ID to a package and a construct, with the week that models it, or a recorded reason',
    lecture: { week: 8, session: 2, slide: 'w8s2-import-mapping', section: 'w8s2-l-import-method' },
  },
]
