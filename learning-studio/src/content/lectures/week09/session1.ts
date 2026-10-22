// Week 9, Session 1 lecture: Needs / Requirements — requirements as SysML v2 model elements: the requirement as a
// constraint, definition and usage, the subject, the requirement ID and the informal text, the required constraint,
// assumptions, actor and stakeholder parameters, concerns and framing, the AeroLink Needs package, groups, a shared
// definition, requirement metadata, derivation, dependencies and the direction rule, the course trace pattern, a first
// careful look at satisfy, and a calibration of what the course checker can and cannot decide.
// 75-minute session: 69 minutes of planned content on 23 slides plus the generated "References and credits" slide, and
// a 6-minute buffer. Single source for the slide viewer, the faculty notes, the .pptx and the student lesson
// (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20 (teach first), A21 (the Week 1 architecture is the
// template; decision 8: SysML v2 foundations in Week 8, built on here; decision 9: AeroLink is the instructor reference
// only; decision 10: requirements traceability maintained across the course), A22/A23 (one continuous journey: Week 9
// models the SAME enterprise's Week 1 needs and Week 2 requirements in the Week 8 model).
//
// Review status: new-pending-review. Written 2026-10-21 from docs/lectures/week09/WEEK09_LECTURE_OUTLINE.md §2, with
// two corrections recorded in the milestone report: NEED-011 is no longer childless (Week 3 wrote REQ-STK-018/019 for
// it), so the trace audit case is the partial coverage Week 2 recorded; and the AeroLink model is generated from the
// closed Phase I package (Weeks 1, 2, 3 and 5 cases), not retyped from the v0.2 reference file.
//
// Accuracy rules followed:
//   - Every citation is a verified register entry at a page whose extracted text supports the claim beside it: R83 is
//     the SysML v2.1 Beta 2 Part 1 clause 7.21 (requirements), R74 the textual-notation training deck slides 86-91,
//     R80 pp.49-51 (names, short names, dependencies), R76 sl.105 (dependencies), R77 sl.108 (metadata), R84 pp.175-176
//     (verification methods, verify), R114 (9.3.2 Modeling Metadata) and R115 (9.6 Requirement Derivation library), R13
//     (SEBoK System Requirements Definition). The specification is never called "the standard".
//   - Course conventions (needs as requirement usages, the enterprise as subject of stakeholder requirements, the ID rule,
//     the #serves keyword, RequirementAttributes, the shared-form names) are labeled as such on the slide face.
//   - A checker PASS is never presented as correctness; recorded checker behavior is release 2026-08 only.
//   - Every listing is an excerpt of a checker-validated file (./listings.ts); AeroLink values are FICTIONAL and come from
//     ./aerolinkCase.ts (which reads the Weeks 1-5 cases). Counts on slides are computed, never typed.
//   - Timing: spoken notes (teach, worked solution, figure walk) stay between 40 and 130 words per minute.
import type { Lecture } from '../types'
import { numberWord } from '../week01/aerolinkCase'
import { CHAIN, COUNTS, needOf, reqOf } from './aerolinkCase'
import { CALIBRATION, listing, listingText } from './listings'

export const WEEK9_S1_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
/** Alt text of a listing figure: the file it comes from, the recorded checker status and the full listing text. */
const listingAlt = (key: string) => {
  const l = listing(key)
  return `Listing (course file sysml/${l.file}, checked: ${l.status}): ${listingText(key)}`
}
const NEED = needOf(CHAIN.need)
const STK5 = reqOf(CHAIN.stk)
const SYS1 = reqOf(CHAIN.sys)
const rejected = CALIBRATION.filter((c) => c.result === 'FAIL')
const accepted = CALIBRATION.filter((c) => c.result !== 'FAIL')

export const WEEK9_SESSION1: Lecture = {
  week: 9,
  session: 1,
  title: 'Needs / Requirements',
  subtitle: 'Session 1: Requirements as model elements',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. framing (7 min)
    {
      id: 'w9s1-framing',
      title: 'Framing: Phase I needs and requirements enter the model',
      slides: [
        {
          id: 'w9s1-title',
          title: 'Needs / Requirements',
          subtitle: 'Session 1: Requirements as model elements',
          purpose: 'Orient students to the scheduled subject, the two sessions and the week’s output: the Needs and Requirements packages of model v0.2, built on the Week 8 model.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-week-band',
            caption: 'Week 9 fills two packages of the model your team built in Week 8: the Week 1 needs go into Needs, the Week 2 requirements into Requirements. Course illustration, not SysML v2 graphical notation.',
            alt: 'Two document cards at the top: Week 1 needs and Week 2 requirements. Thick arrows run down from them to three package boxes: Stakeholders (labeled Week 8, drawn faint), Needs and Requirements (drawn strong). Below, a row labeled Phase II with the week numbers 8 to 14, number 9 highlighted, and the line: model v0.2 of your enterprise.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Today: the requirement construct of SysML v2 and the relationships around it', 'Session 2: requirement quality, AeroLink worked examples, AI-assisted review, the Lab L9 launch', 'Your output: model v0.2 of your own enterprise'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the subject exactly as the schedule gives it: Needs / Requirements. Say that this week does not invent new needs or new requirements. Your team wrote its needs in Week 1 and its stakeholder and system requirements in Week 2; this week those same statements become elements of the model your team built last week.',
              'Point at the strip. Week 8 created the package skeleton and filled the Stakeholders package with your stakeholders and concerns. Two of the packages it left empty, Needs and Requirements, are the ones we fill now. Everything later in Phase II traces back to what goes into them: functions in Week 10, design elements in Week 11, verification cases in Week 12.',
              'Say how the week runs. Today is all lecture: the construct, read on listings, most of them from the AeroLink model the instructor generated from the AeroLink Phase I package. Session 2 adds quality, worked examples and AI-assisted review, and launches the lab, where your team generates and completes model v0.2 with the Week 9 lab tool.',
            ],
            why: 'Students who see the week’s output and where it sits in the Phase II chain can file each construct as it arrives, and hearing that nothing is invented keeps them anchored to their own Phase I work.',
            figure: 'Trace the two arrows from the Phase I cards into Week 9, then point at the Stakeholders package filled last week and at the dashed packages still to come.',
            examples: ['Instructor preparation (not for students): open the AeroLink model v0.2 file and the two-team listing in the course checker before class, in case a student asks to see a run; the live run is not on the plan today.', 'Timing plan: 69 minutes of content and a 6-minute buffer. If the session runs long, shorten the model-adds slide or the groups slide; never shorten the subject, the required-constraint answer or the satisfy slide.'],
            misconceptions: [{ claim: 'Week 9 starts a new requirements exercise in a modeling tool.', correction: 'Week 9 models the Week 1 needs and Week 2 requirements the team already wrote, with the same IDs and the same statements.' }],
            transition: 'First, a question about one AeroLink requirement written two ways.',
            timing: '2 min: 1 min subject and output, 1 min the strip.',
          },
        },
        {
          id: 'w9s1-driving-question',
          title: 'Driving question: what can the model know about a requirement?',
          purpose: 'Create a need to know: two models of one requirement, one with only its text and one with a subject, a limit and a constraint. The vote is answered on the required-constraint slide.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-two-cards',
            caption: 'One AeroLink system requirement modeled by two teams: Team A writes the statement only; Team B adds three lines. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `Two cards side by side, each headed ${SYS1.id} with the line doc: the statement (the statement is: ${SYS1.statement}). Card A, labeled Team A, has nothing else. Card B, labeled Team B, has three more boxes, highlighted: subject: chargers; limit: 20 min; charge time ≤ limit.`,
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Vote', text: 'Which is true?' },
            { kind: 'bullets', items: ['A · The two models say the same thing', 'B · Team B’s model says more', 'C · Team B’s model proves the design meets it', 'D · Only Team A’s model is a requirement'] },
          ],
          sources: [],
          notes: {
            teach: [
              `Read the requirement: ${SYS1.statement} It is ${SYS1.id}, from AeroLink’s Week 2 requirements, and it is the requirement behind the 25-minute hub turnaround you met in Week 2 and again in Week 8.`,
              'Two teams model it. Team A writes a requirement element whose only content is that sentence. Team B writes the same sentence and adds three lines: the subject, which is the charging system; a limit of 20 minutes; and a constraint that compares the charging system’s charge time with the limit.',
              'Give the class thirty seconds, then take a show of hands for A, B, C and D. Do not reveal the answer. Write the vote counts on the board; we come back to them on the slide about the required constraint, after we have the vocabulary to say exactly what the three extra lines add, and what they do not add.',
              'If someone argues for D, ask them to hold the thought: whether a sentence alone can be a requirement is exactly what the next slides settle.',
            ],
            why: 'A prediction before instruction gives students a reason to attend to the subject and constraint slides, and option C plants the misconception the week dismantles: a formal constraint is not evidence that a design meets it.',
            figure: 'Point at the shared statement on both cards, then at the three highlighted lines that only card B has.',
            misconceptions: [{ claim: 'A formally written requirement shows that the design satisfies it.', correction: 'A constraint states what must hold; whether a design meets it needs a satisfy claim, consistent values and, later, verification evidence.' }],
            transition: 'Before we answer it, see what this week takes from Phase I.',
            timing: '3 min: 1 min the two cards, 30 s to think, 1.5 min vote and the hold.',
          },
        },
        {
          id: 'w9s1-continuity',
          title: 'What Week 9 imports from Phase I',
          purpose: 'Make the continuity explicit: the Week 1 needs and Week 2 requirements, with their IDs, statements, parents and attributes, enter the model built in Week 8.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-import-lanes',
            caption: 'The Phase I documents and the model packages they enter, with the ID prefixes that cross: STK and CON in Week 8, MGO, NEED, REQ-STK and REQ-SYS this week. Course illustration, not SysML v2 graphical notation.',
            alt: 'Top row, titled Phase I documents: three cards, Register, Needs, Requirements. Bottom row, titled Model packages: three boxes, Stakeholders, Needs, Requirements. An arrow runs down from each card to the box below it, labeled with the ID prefixes that cross: STK, CON (dashed and grey, done in Week 8); MGO, NEED; REQ.',
          },
          body: [
            { kind: 'bullets', items: ['Week 1: register, concerns, mission and objectives, needs', 'Week 2: stakeholder and system requirements, traced to needs', 'Week 8: stakeholders and concerns already in the model', 'Week 9: needs and requirements join them, with the same IDs'] },
          ],
          sources: [R('R83', '165')],
          notes: {
            teach: [
              'Recall what each team has. Week 1 gave you a stakeholder register with concerns, a mission with objectives, and needs, each with a stakeholder, a condition and a rationale. Week 2 gave you stakeholder and system requirements, each with one shall, a criterion, a type, a verification method, a rationale and a parent: a need, a capability or a stakeholder requirement.',
              'Week 8 already put the stakeholders and concerns into the model. This week adds the needs and requirements and connects them to the concerns that are already there. Nothing is retyped: the lab tool reads your Week 1 and Week 2 exports and your Week 8 model file.',
              'The IDs stay the same. The specification says that when a requirement has a short name, that short name is also considered its requirement ID (R83 p.165), so REQ-SYS-001 in the model is the same string as REQ-SYS-001 in your Week 2 table.',
            ],
            why: 'Seeing the three lanes join tells students that the Phase II model is the Phase I package in another form, and that losing an ID on the way breaks every later trace.',
            figure: 'Follow each dashed arrow down and read its label; point out that the first arrow was drawn last week and the other two are this week’s work.',
            misconceptions: [{ claim: 'The model gets new requirement IDs, because the tool assigns element IDs.', correction: 'Tools manage hidden element IDs; the course ID is the short name the team writes, and it does not change.' }],
            transition: 'Before modeling anything, recall what a requirement is, because the language encodes that idea.',
            timing: '2 min: 1 min the lanes, 1 min the IDs.',
          },
        },
      ],
    },
    // ============================================================================================ B. needs and requirements (5 min)
    {
      id: 'w9s1-recall',
      title: 'Needs, requirements and models',
      slides: [
        {
          id: 'w9s1-needs-vs-reqs',
          title: 'Needs are not requirements',
          purpose: 'Recall the Week 1 and Week 2 distinction in one slide and connect it to modeling: a requirement is a transformation of needs into an obligation on an entity, so it has a source and a subject.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-need-to-req',
            caption: `From need to requirement on AeroLink: the stakeholder’s view, the transformation, and the obligation on an entity. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `Three wide boxes stacked top to bottom, joined by arrows. Top: Need: ${NEED.id}, stakeholder’s view, black box. Middle: Analysis and decision, ${CHAIN.budget.total} = ${CHAIN.budget.charge} + ${CHAIN.budget.padWork} min. Bottom, drawn strong: Requirement: ${STK5.id}, an obligation on an entity. The arrow into the bottom box is labeled traceable.`,
          },
          body: [
            { kind: 'definition', term: 'Requirement statement (SEBoK, quoting the INCOSE needs and requirements manual)', text: '“formal transformation of one or more needs or parent requirements into an agreed-to obligation for an entity”', source: R('R13', '558') },
            { kind: 'bullets', items: ['Needs: the stakeholder’s view, a black box', 'Requirements: the developer’s view, an obligation on an entity'] },
          ],
          sources: [R('R13', '557–558')],
          notes: {
            teach: [
              'Recall Week 1 and Week 2. SEBoK describes system requirements as what the system of interest must fulfill to satisfy the stakeholder needs, expressed in a combination of well-formed textual statements and supporting models or diagrams (R13 p.557). It insists that defining requirements is engineering, not only writing: every requirement is an engineering decision about what the system must do (R13 p.557).',
              'Read the definition: a requirement statement is the result of a formal transformation of one or more needs or parent requirements into an agreed-to obligation for an entity to perform some function or possess some quality within specified constraints with acceptable risk (R13 p.558). SEBoK contrasts the two views on the same page: needs speak for the stakeholder from an external, black-box view; requirements speak for the developer, a white-box view of what the system must do.',
              'Two words in that definition become model relationships this week. A requirement comes from needs or parents: that is its source, which becomes a derivation. And it is an obligation for an entity: that is its subject.',
            ],
            why: 'The modeling constructs only make sense if students keep needs and requirements apart; the definition names the two relationships, source and subject, that the rest of the session models.',
            figure: `Walk the three boxes: ${NEED.id} in the stakeholder’s words, the turnaround arithmetic in the middle, ${STK5.id} as an obligation on the service. Ask what would change in box 3 if the budget in box 2 changed.`,
            misconceptions: [{ claim: 'A need and a requirement are the same statement with “shall” added.', correction: 'SEBoK calls generating a requirement more than changing the subject of a need: it is an analysis of what the system must do.' }],
            transition: 'What does putting requirements in a model add to a requirements table?',
            timing: '3 min: 1 min recall, 1 min the definition, 1 min source and subject.',
          },
        },
        {
          id: 'w9s1-model-adds',
          title: 'What a model adds to a requirements table',
          purpose: 'Motivate the requirement construct with SEBoK’s list of what models add, and the statement that in MBSE the text is part of a requirement model element.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-table-vs-model',
            caption: 'A requirements table row and the same requirement as a model element, related to a stakeholder, a concern, a parent and a design element. Course illustration, not SysML v2 graphical notation.',
            alt: `On the left, a card labeled table row, with ${STK5.id} and parent ${NEED.id}. On the right, ${STK5.id} as a strong box with four lines to four boxes around it: ${CHAIN.stakeholder}, ${CHAIN.concern}, ${NEED.id}, and a dashed box labeled design, joined by a dashed line.`,
          },
          body: [
            { kind: 'bullets', items: ['Completeness: functions, inputs, sources, outputs, destinations', 'Communication', 'Interdependencies with the rest of the system data', 'Quantitative analysis and simulation', 'The text stays: part of a requirement model element'] },
          ],
          sources: [R('R13', '564')],
          notes: {
            teach: [
              'SEBoK lists what models give requirements that a document does not (R13 p.564): completeness in terms of functions, their inputs and the sources of those inputs, outputs and their destinations; easier communication; the capture of interdependencies between requirements and the rest of the system data, such as needs, architecture and test cases; and quantitative analyses and simulations.',
              'It also says that in MBSE the requirement keeps its well-formed text, as part of a requirement model element (R13 p.564). So the model does not replace your Week 2 statements; it holds them, and relates them.',
            ],
            why: 'Students should model requirements for the interdependencies and analysis, not to retype a table; the last bullet heads off the worry that the text is lost.',
            figure: 'Point at the table row, then at the model element and its four lines; the dashed line is the design element Week 11 adds.',
            transition: 'SysML v2 makes the requirement a model element by making it a constraint. That one decision explains most of the syntax.',
            timing: '2 min: 1.5 min the list, 30 s the text stays.',
          },
        },
      ],
    },
    // ============================================================================================ C. the requirement construct (37 min)
    {
      id: 'w9s1-construct',
      title: 'The requirement construct',
      slides: [
        {
          id: 'w9s1-constraint',
          title: 'A requirement is a constraint',
          purpose: 'The foundational idea: a requirement definition is a kind of constraint definition, informal or formal, which evaluates to true or false.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-listing-anatomy',
            caption: 'The anatomy of a requirement, on a neutral example: an ID and a name, the informal text, the subject, a parameter and a required constraint; then a usage that binds the limit. Checked: PASS.',
            alt: listingAlt('anatomy'),
          },
          body: [
            { kind: 'definition', term: 'Requirement definition (SysML v2.1 Beta 2)', text: '“a kind of constraint definition … that specifies stakeholder-imposed constraints that a design solution must satisfy to be a valid solution”', source: R('R83', '161') },
            { kind: 'bullets', items: ['Informal “shall” text, or formal constraint expressions', 'True or false: satisfied when it evaluates to true'] },
          ],
          sources: [R('R83', '161–162'), R('R74', '86')],
          notes: {
            teach: [
              'Read the definition: a requirement definition is a kind of constraint definition that specifies stakeholder-imposed constraints that a design solution must satisfy to be a valid solution (R83 p.161). Its required constraints may be informal shall statements or formal constraint expressions, and it may also include assumed constraints, which restrict when the required ones apply (R83 p.161).',
              'Because a requirement is a kind of constraint, it can be evaluated to true or false, and it is satisfied when it evaluates to true (R83 p.162). Hold on to that sentence: it is the reason a requirement in a model can be checked against design values at all.',
              'Walk the listing with the training deck’s words (R74 sl.86): the textual statement is a documentation comment; the requirement is formalized by one or more required constraints; and, like a constraint definition, it can be parameterized by features, here the attribute limit. The usage at the bottom binds that parameter to 2 seconds. We take each part in turn on the next slides.',
            ],
            why: 'Every later construct, from subject to satisfy, follows from “a requirement is a constraint”; students who hold this idea can read listings they have never seen.',
            figure: 'Follow the callouts top to bottom: short name and name, doc, subject, required constraint; then the usage and its binding. Say that the example is neutral on purpose; AeroLink starts on the subject slide.',
            misconceptions: [{ claim: 'A requirement in SysML v2 is a text box with an ID.', correction: 'It is a constraint: its text is documentation, and its required constraints are what can be evaluated.' }],
            transition: 'Week 8 taught definition and usage for parts. The same pattern applies to requirements.',
            timing: '3 min: 1 min the definition, 1 min true or false, 1 min the listing.',
          },
        },
        {
          id: 'w9s1-def-usage',
          title: 'Requirement definitions and requirement usages',
          purpose: 'Apply the Week 8 definition and usage pattern to requirements: a usage in a context, a definition as a reusable template, one definition per usage, and the course rule for when to write a definition.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-def-usages',
            caption: 'One requirement definition used three times: each AeroLink usage binds its own measured feature and limit. Course illustration, not SysML v2 graphical notation. (FICTIONAL)',
            alt: `A card at the top labeled definition, measured ≤ limit. Lines run down to three usage cards: ${['REQ-SYS-005 limit 60 s', 'REQ-SYS-008 limit 2 min', 'REQ-SYS-009 limit 30 s'].join('; ')}. The lines are labeled usages.`,
          },
          body: [
            { kind: 'bullets', items: ['A usage: a definition used in a context (a package, a part, another requirement)', 'A usage may redefine and bind the definition’s features', 'One requirement definition per usage', 'Course convention: write a definition only when several requirements share a form'] },
          ],
          sources: [R('R83', '161'), R('R83', '165'), R('R74', '89')],
          notes: {
            teach: [
              'A requirement usage is a usage of a requirement definition in some context; the context can be a package, a part or another requirement (R83 p.161). The features of a usage can redefine the features of its definition, and then the definition serves as a requirement template that can be reused and tailored to each context of use. The specification’s example is a MaximumMass definition whose usage restricts the subject to a vehicle and binds the required mass to 2000 kilograms (R83 p.161).',
              'Two rules to remember. A requirement usage must be defined by a single requirement definition (R83 p.165). And a usage will often bind the definition’s parameters to specific values (R74 sl.89).',
              'The course convention: write a requirement definition only when several requirements share a form. Most of your requirements are one of a kind, and you write them as usages directly in the Requirements package, as model v0.2 of AeroLink does for most of its requirements. The lab asks for at least one shared definition used by two requirements, so that you practise the pattern on your own data.',
            ],
            why: 'Students know definition and usage from parts; transferring it to requirements, with the one-definition rule and a clear rule for when to bother, prevents both over-engineering and templates written for single use.',
            figure: 'Point at the definition card, then at each usage card and its limit. Ask: what would change if the definition’s limit were fixed at 60 s?',
            misconceptions: [{ claim: 'A requirement definition is the requirement, and the usages are copies.', correction: 'The definition is a template; each usage is a requirement in its own context, with its own ID and bindings.' }],
            transition: 'Every requirement, definition or usage, is about something. That something is its subject.',
            timing: '3 min: 1.5 min usage and template, 30 s the rules, 1 min the course convention.',
          },
        },
        {
          id: 'w9s1-subject',
          title: 'The subject: what the requirement is about',
          purpose: 'The most consequential modeling decision for each requirement: the subject, its conformance rule, its default and its position, and the course convention for choosing it.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-subject',
            caption: `${SYS1.id} has the chargers as its subject: only an entity that conforms to that definition can satisfy it. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `${SYS1.id} at the top. An arrow labeled subject runs down to a box, Chargers. Lines run from it to three cards: chargers, conforms; fast chargers, specializes (both drawn as accepted); aircraft, does not (drawn as rejected, with a dashed line).`,
          },
          body: [
            { kind: 'definition', term: 'Subject (SysML v2.1 Beta 2)', text: '“a distinguished parameter that identifies the entity on which the requirement is being specified”', source: R('R83', '161') },
            { kind: 'bullets', items: ['Only an entity conforming to the subject’s definition can satisfy it', 'Not declared: Anything. Declared: first, before any other parameter', 'Course convention: the enterprise for stakeholder requirements; for system requirements, the element the “shall” is about'] },
          ],
          sources: [R('R83', '161–162'), R('R83', '166'), R('R74', '88')],
          notes: {
            teach: [
              'Read the definition: a requirement definition or usage always has a subject, a distinguished parameter that identifies the entity on which the requirement is being specified (R83 p.161). A requirement usage can only be satisfied by an entity that conforms to the definition of its subject; a specialization of that definition conforms too (R83 p.161).',
              'If no subject is declared, it is implicitly Anything (R83 p.162). When it is declared, the subject is the first parameter and must come before any other parameter (R83 p.166). The subject can have any kind of definition, a port or an action for example, not only a part (R74 sl.88).',
              'Constraining the subject also lets the constraint use the subject’s features: that is how Team B could write the charging system’s charge time into its constraint (R83 p.162).',
              'Course convention: a stakeholder requirement constrains the service as a whole, so its subject is the enterprise; a system requirement’s subject is the element its shall is about, the chargers for REQ-SYS-001. If that element is not yet in your model, the lab tool writes a placeholder part definition that Weeks 10 and 11 complete.',
            ],
            why: 'The subject decides what can ever be claimed to satisfy a requirement; a wrong subject cannot be repaired later by a satisfy claim, so students must choose it deliberately now.',
            figure: 'Read the three candidates: the chargers usage conforms, a specialized charger conforms because it specializes the definition, the aircraft does not. Ask what would happen if the subject were the whole enterprise.',
            misconceptions: [{ claim: 'The subject is just a label for who the requirement concerns.', correction: 'It is a parameter with a type: only conforming entities can satisfy the requirement, and the constraint reads the subject’s features.' }],
            transition: 'Next, how the requirement carries its ID and its text.',
            timing: '3 min: 1 min definition and conformance, 1 min default and position, 1 min course convention.',
          },
        },
        {
          id: 'w9s1-id-doc',
          title: 'The requirement ID and the informal text',
          purpose: 'Keep the Phase I IDs and statements stable in the model: the short name is the requirement ID and the doc comment is the informal text.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-declaration',
            caption: 'One declaration line in four parts: the keyword, the short name that is the requirement ID, the declared name, and the body. Course illustration, not SysML v2 graphical notation.',
            alt: `Four boxes in two rows. Top row: requirement, labeled keyword; <'${SYS1.id}'>, labeled short name = ID. Bottom row: 'Charge to dispatch …', labeled declared name; { body }, labeled doc, subject …. Under them the line: the ID is quoted: it has hyphens.`,
          },
          body: [
            { kind: 'bullets', items: ['The doc comments are the informal text', 'A short name is also the requirement ID', 'Course convention: the Phase I ID as a quoted short name; the doc is the Phase I statement, word for word'] },
          ],
          sources: [R('R83', '165'), R('R80', '49')],
          notes: {
            teach: [
              'The informal text of a requirement is given by the documentation comments in its body; and if the requirement is declared with a short name, that short name is also considered to be its requirement ID (R83 p.165).',
              'A short name is written between angle brackets before the name. The specification intends the name to be fully descriptive and the short name to be an abbreviated name useful for referring to the element (R80 p.49). Our IDs contain hyphens, so the short name is written as a quoted unrestricted name, as in Week 8.',
              'Course convention: the doc carries the Week 2 statement word for word, so the table and the model cannot drift apart, and references use the short name, Requirements::’REQ-SYS-001’.',
            ],
            why: 'Stable IDs and verbatim statements are what make the Phase I package and the model one body of work; drift between them is the commonest trace defect.',
            figure: 'Point at each of the four parts in turn and read its label; stress the quotes around the ID.',
            misconceptions: [{ claim: 'The declared name is the ID.', correction: 'The short name in angle brackets is the requirement ID; the declared name is the descriptive title.' }],
            transition: 'Now we can answer the driving question.',
            timing: '2 min: 1 min ID, 1 min text and the course convention.',
          },
        },
        {
          id: 'w9s1-required-constraint',
          title: 'Doc alone is not enough: the required constraint',
          purpose: 'Answer the driving question: a doc-only requirement is still a constraint but gives the model nothing to evaluate; a required constraint over a feature of the subject says more, and still proves nothing about a design.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-listing-team-a-b',
            caption: 'The two teams’ requirements as checked listings: Team A’s statement only, Team B’s subject, limit and required constraint. Both PASS the checker. (FICTIONAL)',
            alt: listingAlt('team-a-b'),
          },
          body: [
            { kind: 'bullets', items: ['Team A: a requirement with nothing the model can evaluate', 'Team B: names the subject, the quantity and the limit', 'Answer B. Not C: meeting it needs a satisfy claim, consistent values and, later, evidence'] },
            { kind: 'callout', tone: 'key', text: 'Both files pass the checker. Validity is not meaning.' },
          ],
          sources: [R('R83', '161'), R('R83', '165')],
          notes: {
            teach: [
              'Return to the vote. Team A’s requirement is still a constraint, but its only content is a doc comment: there is nothing for the model to evaluate. Team B writes the Week 2 criterion as a required constraint over a feature of the subject: the chargers’ charge time to the dispatch threshold must be at most the limit, which is bound to 20 minutes.',
              'So the answer is B: Team B’s model says more. It names the entity obliged, the quantity and the limit, so a later design value can be compared with it. It does not prove the design meets the requirement, so C is wrong: that needs a satisfy claim between the requirement and a design element, values in the model that are consistent with it, and, in Week 12, verification evidence. D is wrong too: a requirement may be informal (R83 p.161).',
              'Read the callout: both files pass the checker. The checker cannot see that Team A left the constraint out. That is why the course rubric treats requirements written only as comments as the lowest level of requirement semantics, and why the lab tool reports every doc-only requirement for your attention.',
              'A requirement whose limit is still to be decided keeps its constraint and records the open value; Session 2 shows how.',
            ],
            why: 'Resolving the prediction locks in the difference between text, formal constraint and evidence, the distinction every later week depends on.',
            figure: 'Point at Team A’s three lines, then at Team B’s three extra lines: subject, limit, constraint. Read the constraint aloud as a sentence.',
            misconceptions: [{ claim: 'A requirement that passes the checker is complete.', correction: 'Team A’s doc-only requirement passes too; the checker cannot tell that the constraint is missing.' }],
            transition: 'A requirement can also say when it applies. That is the job of assumptions.',
            timing: '3 min: 1 min the two listings, 1 min the answer, 1 min both pass.',
          },
        },
        {
          id: 'w9s1-assume',
          title: 'Assumptions: when a requirement applies',
          purpose: 'Teach assume and require precisely: the effective constraint is an implication, so a requirement demands nothing where an assumption is false.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-truth-table',
            caption: 'The effective constraint of a requirement is an implication: if every assumption holds, every required constraint must hold. Course illustration, not SysML v2 graphical notation.',
            alt: 'A truth table with columns assumes, requires, result. Row 1: yes, yes, satisfied. Row 2: yes, no, violated. Row 3: no, either, satisfied. Under the table: row 3: nothing is demanded.',
          },
          body: [
            { kind: 'bullets', items: ['Effective constraint: if all assumptions are true, all required constraints must be true', 'Declared with the keywords assume and require', 'Where an assumption is false, the requirement demands nothing'] },
            { kind: 'callout', tone: 'caution', title: 'Course reasoning', text: 'Every assumption marks a region the requirement leaves uncovered. Someone must decide whether another requirement covers it.' },
          ],
          sources: [R('R83', '165'), R('R74', '87'), R('R74', '91')],
          notes: {
            teach: [
              'A requirement is built from two sets of constraints, the assumed and the required ones, and its effective constraint is a logical implication: if all the assumption constraints are true, all the required constraints must be true (R83 p.165). They are declared by prefixing a constraint with the keyword assume or require (R83 p.165), and a requirement definition may specify one or more assumptions (R74 sl.87).',
              'The training deck says the same formally: a requirement is satisfied for a subject if, when all its assumed constraints are true, all its required constraints are true (R74 sl.91).',
              'Now the consequence, which is course reasoning from that semantics, not a sentence in the source. “If A then R” is true whenever A is false. So in the region where an assumption fails, the requirement asks nothing at all. Every assumption you write marks a region your requirement deliberately does not cover, and someone must decide whether another requirement covers it. Session 2 works one AeroLink case, “in still air”, where that matters.',
            ],
            why: 'Students tend to write conditions as assumptions without seeing that each one switches the requirement off somewhere; the truth table makes the cost visible before they model their own.',
            figure: 'Read the three rows; dwell on row 3 and ask who is responsible for the conditions in which the requirement says nothing.',
            misconceptions: [{ claim: 'An assumption is a note about the environment and changes nothing.', correction: 'An assumption is part of the requirement’s logic: where it is false, the requirement is satisfied whatever the design does.' }],
            transition: 'Assumptions are often about things outside the subject. The language gives those things a name.',
            timing: '3 min: 1 min the implication, 30 s the deck, 1.5 min the consequence.',
          },
        },
        {
          id: 'w9s1-parameters',
          title: 'Actors and stakeholders as requirement parameters',
          purpose: 'Connect requirements to the Week 8 stakeholder model: actor and stakeholder parameters are part usages typed by part definitions, with distinct roles.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-param-slots',
            caption: 'A requirement has three kinds of distinguished parameter: the subject, actors and stakeholders. Course illustration, not SysML v2 graphical notation.',
            alt: 'A large card titled requirement with three slots, each a label and a description: subject, the entity obliged; actor, external, needed; stakeholder, has concerns.',
          },
          body: [
            { kind: 'bullets', items: ['Actors and stakeholders: further distinguished parameters, written as part usages', 'Actor: external to the subject, necessary for satisfaction', 'Stakeholder: has concerns related to the requirement', 'Week 8 made every stakeholder a part definition: now it types these parameters'] },
          ],
          sources: [R('R83', '162'), R('R83', '166')],
          notes: {
            teach: [
              'Besides the subject, a requirement may have actor and stakeholder parameters. They are part usages, so they must be defined by part definitions, and they are declared with the keywords actor and stakeholder (R83 pp.162, 166).',
              'An actor represents a role played by an entity external to the subject of the requirement but necessary for its satisfaction; the specification’s example is a vehicle requirement whose actor is the driving environment, whose features can be used in the assumed constraints (R83 p.162). A stakeholder parameter represents a role played by an entity, usually a person or organization, that has concerns related to the requirement (R83 p.162).',
              'This is why Week 8 modeled each stakeholder as a part definition. In the Needs package each need names its stakeholder as a parameter typed by that definition, for example stakeholder vertiportOperators typed by STK-005.',
            ],
            why: 'Students see that the Week 8 modeling choice was made for this week, and they learn to keep the subject, the environment and the interested parties in separate roles.',
            figure: 'Point at each slot and give one AeroLink example: the chargers as subject, the weather as actor, the vertiport operators as stakeholder.',
            misconceptions: [{ claim: 'The stakeholder of a requirement is its subject.', correction: 'The subject is the entity obliged; a stakeholder is an entity with concerns about the requirement.' }],
            transition: 'Stakeholders hold concerns, and Week 8 put the concerns in the model. A requirement can frame them.',
            timing: '3 min: 1 min the parameters, 1.5 min actor and stakeholder, 30 s the Week 8 link.',
          },
        },
        {
          id: 'w9s1-frame',
          title: 'Concerns and framing',
          purpose: 'Show how a need addresses a concern already in the model, and why framing is a strong statement.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-frame',
            caption: `${NEED.id} frames the concern it answers, ${CHAIN.concern}, from the Week 8 model; a frame to a concern it does not answer is crossed out. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `${NEED.id} on the left, drawn strong. A thick arrow labeled frame runs to ${CHAIN.concern}, upper right. A dashed grey arrow runs to CON-012, lower right, crossed out with a ✕; under CON-012 the words not answered.`,
          },
          body: [
            { kind: 'bullets', items: ['A concern is a kind of requirement; its stakeholders are parameters', 'A requirement can frame concerns: each must then be addressed for it to be satisfied', 'A framed concern is a subrequirement, so a required constraint', 'Frame only the concerns the need answers'] },
          ],
          sources: [R('R83', '162'), R('R83', '167')],
          notes: {
            teach: [
              'A concern definition is a kind of requirement definition that represents a stakeholder concern, and its stakeholder parameters delineate the stakeholders who have it (R83 p.162). Your Week 8 concerns are concern usages of exactly this kind, each with the enterprise as subject and its stakeholder.',
              'A requirement can be specified as framing concerns, and then all the framed concerns must be addressed for the requirement to be satisfied (R83 p.162). The keyword is frame; a framed concern is a subrequirement and so automatically a required constraint of the requirement that frames it (R83 p.167).',
              'Teaching point: framing is a strong statement. A need that frames a concern claims that meeting the need addresses that concern. If NEED-004 framed the community noise concern as well, satisfying it would require the noise concern to be addressed too, which nothing about pad turnaround does. Frame only the concerns the need actually answers.',
            ],
            why: 'Framing is where needs meet the Week 8 model; knowing that a frame becomes a required constraint stops students framing every concern of a stakeholder “to be safe”.',
            figure: `Point at the solid frame from ${NEED.id} to ${CHAIN.concern}, then at the crossed-out arrow, and ask what the extra frame would oblige.`,
            misconceptions: [{ claim: 'Framing more concerns makes a need more complete.', correction: 'Each framed concern becomes a required constraint of the need; framing one it does not answer makes the need also require that concern to be addressed, which nothing in it does.' }],
            transition: 'Put the pieces together on AeroLink: the Needs package.',
            timing: '3 min: 1 min concerns, 1 min frame, 1 min the strong statement.',
          },
        },
        {
          id: 'w9s1-worked-needs',
          title: 'AeroLink worked example I: the Needs package',
          purpose: 'The first half of the AeroLink worked example: a need as a requirement usage with the enterprise as subject, a stakeholder parameter and a frame, from the generated model v0.2; one think-pair-share.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-listing-need-004',
            caption: `${NEED.id} in AeroLink model v0.2, generated from the Week 1 case: subject, stakeholder and frame (the doc is shortened on the slide). Checked: PASS. (FICTIONAL)`,
            alt: listingAlt('need-004'),
          },
          body: [
            { kind: 'bullets', items: ['Course convention: a need is a requirement usage whose subject is the enterprise', 'stakeholder: typed by the Week 8 part definition', 'frame: each concern the need answers', 'The doc keeps the stakeholder’s words, condition and rationale'] },
            { kind: 'callout', tone: 'note', title: 'Pair, 1 min', text: 'NEED-010: who is its stakeholder, and which concern should it frame?' },
          ],
          sources: [R('R83', '162'), R('R83', '167')],
          notes: {
            teach: [
              `Read the listing. ${NEED.id}, pads not limited by turnaround, is a requirement usage with its Week 1 ID as short name. Its doc is the Week 1 need statement with its condition and rationale. Its subject is the enterprise, its stakeholder parameter is typed by ${CHAIN.stakeholder}, the vertiport operators part definition from Week 8, and it frames ${CHAIN.concern}, their concern about pad throughput and charging capacity.`,
              `Label the convention honestly. SysML v2 has requirements and concerns but no separate need construct. The course models a need as a requirement usage with an informal doc and framed concerns, because that is the closest construct and it keeps the stakeholder’s words; this is a course modeling choice, not a rule of the language. The whole AeroLink Needs package holds ${numberWord(COUNTS.objectives)} mission and objective elements and ${COUNTS.needs} needs, with ${COUNTS.stakeholderParams} stakeholder parameters and ${COUNTS.frames} frames, all generated from the Week 1 case.`,
              'A need is still not a requirement on the system. It frames concerns and names stakeholders; it constrains nothing the design has. The obligation comes from the stakeholder requirement derived from it, which the next section shows.',
              'Run the pair question for one minute: NEED-010, charging load within the grid connection. Expected answer: its stakeholder is the electric utility, STK-010, and it frames CON-011, peak grid load. Ask one pair to justify why it should not frame the vertiport operators’ concern as well.',
            ],
            why: 'One complete AeroLink need in real model text lets students see subject, stakeholder and frame together before they write their own, and the convention label keeps the needs-versus-requirements distinction intact.',
            figure: 'Follow the callouts: subject, stakeholder, frame. Point at the shortened doc and say the full statement is in the file and the lesson.',
            misconceptions: [{ claim: 'Modeling a need as a requirement turns it into a system requirement.', correction: 'It stays the stakeholder’s statement with the enterprise as subject; the obligation on the system comes from the derived requirements.' }],
            transition: 'Requirements are many. Groups organize them without changing their meaning by accident.',
            timing: '4 min: 1.5 min the listing, 1 min the convention, 1.5 min pair question and debrief.',
          },
        },
        {
          id: 'w9s1-groups',
          title: 'Requirement groups',
          purpose: 'Organize requirements without changing their meaning by accident: groups by reference or composition, subject inheritance and explicit subject binding, and the organizing group whose unbound members cannot be satisfied as a whole.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-groups',
            caption: 'Two kinds of group: a specification group whose members share its subject or bind theirs to a feature of it, and an organizing group whose members keep independent, unbound subjects. Course illustration, not SysML v2 graphical notation.',
            alt: 'Two large cards side by side. Left: specification group; one group subject; members share or bind to it; under it a tag, satisfiable. Right: organizing group; no group subject; members unbound; under it a tag, satisfy members.',
          },
          body: [
            { kind: 'bullets', items: ['A requirement can group others: by reference (require) or by composition', 'Members take the group’s subject or bind theirs to a feature of it: subject engine = vehicle.engine;', 'Members with independent, unbound subjects: an organizing group, not satisfiable as a whole; satisfy its members'] },
          ],
          sources: [R('R74', '90'), R('R83', '161'), R('R83', '167')],
          notes: {
            teach: [
              'A requirement may also be used to group other requirements, by reference with require or by composition with nested requirement usages. By default the grouped requirements take the group’s subject; a grouped requirement’s subject can also be bound explicitly; and grouped requirements are treated as required constraints of the group (R74 sl.90; R83 p.167).',
              'So a group is itself a requirement: a design solution must satisfy a requirement and all of its member requirements to be valid (R83 p.161), on the one subject a satisfy claim binds.',
              `Members may have different subjects and the group still be satisfiable, when each member’s subject is bound to a feature of the group’s subject. The specification’s example groups engine requirements inside a vehicle group with subject engine = vehicle.engine (R83 p.167), and the training deck groups requirements whose subjects are bound to engine.clutchPort and engine.generateTorque (R74 sl.90). One design then satisfies the group through its parts; that is the Week 11 pattern.`,
              `Consequence, course reasoning: a group whose members keep independently typed subjects, bound neither to a group subject nor to its features, cannot be satisfied as a whole, because no single satisfy binding reaches all of them. It is still useful for organization; satisfy its members instead. AeroLink model v0.2 has one group of each kind: stakeholderRequirements, whose ${COUNTS.stk} members share the enterprise as subject, and systemRequirements, whose ${COUNTS.sys} members keep their own unbound subjects until the Week 11 architecture gives them features to bind to.`,
            ],
            why: 'Groups look like folders, but they carry meaning; students who know the two kinds avoid writing a satisfy against a group that no element can satisfy.',
            figure: 'Contrast the two shapes: one group subject on the left, which members share or bind to; unbound member subjects on the right; read each label.',
            misconceptions: [{ claim: 'A requirement group is just a folder of requirements.', correction: 'A group is a requirement; its members are its required constraints, so it is satisfied only when they all are, through one satisfy binding of the group’s subject and the member subjects bound to it.' }],
            transition: 'Now a group of three requirements that share a form, written with one definition.',
            timing: '3 min: 1 min grouping, 1 min group as requirement, 1 min the two kinds.',
          },
        },
        {
          id: 'w9s1-worked-latency',
          title: 'Worked example II: three latency requirements, one definition',
          purpose: 'See definition, usage, subject, binding, ID and doc together on AeroLink: the shared latency form and one of its three usages in model v0.2.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-listing-latency',
            caption: 'The shared duration form and REQ-SYS-005, one of its three usages in AeroLink model v0.2 (metadata lines omitted on the slide). Checked: PASS. (FICTIONAL)',
            alt: listingAlt('latency'),
          },
          body: [
            { kind: 'bullets', items: ['Three system requirements, one form: a measured latency at most a limit', 'One definition; each usage has its own ID, doc, subject and two bindings', 'Unbound measured feature: the constraint reads nothing the design has'] },
          ],
          sources: [R('R74', '86–89'), R('R83', '161'), R('R83', '166')],
          notes: {
            teach: [
              'Three AeroLink system requirements share one form: REQ-SYS-005, assignment within 60 seconds; REQ-SYS-008, the no-go fault flag within 2 minutes; and REQ-SYS-009, the fire alarm transmitted within 30 seconds. In each, a measured latency shall not exceed a limit.',
              'The definition, DurationUpperLimit, has two attributes, measured and limit, and one required constraint, measured at most limit. It has no subject of its own, so its subject is Anything until a usage restricts it.',
              'Each usage declares its ID as short name, its Week 2 statement as doc and its own subject: for REQ-SYS-005 the scheduling function, a placeholder in the Logical package that Week 10 completes. Then it binds both parameters: measured to scheduling.assignmentLatencyP99, a feature of the subject, and limit to 60 seconds. This is the specification’s MaximumMass pattern on AeroLink (R83 pp.161, 166).',
              'Why bind the measured feature? Without it, measured is a free attribute of the requirement: the constraint would read nothing the design has, and a later satisfy could not connect it to any design value. The organizing group of system requirements lists all three; no single element can satisfy them together.',
            ],
            workedSolution: ['Step 1, the form: three statements say “X within L”, so one definition with measured and limit, constraint measured ≤ limit.', 'Step 2, each usage: ID as short name, statement as doc, subject the element the shall is about.', 'Step 3, bindings: measured to the subject’s feature, limit to the Week 2 value with its unit.', 'Step 4, check: the subject owns the feature; the unit matches the quantity kind; the group is organizing, not a specification.'],
            why: 'Seeing the template pattern on three real requirements shows when a definition earns its place and why binding to a feature of the subject is what makes the requirement connect to a design.',
            figure: 'Follow the callouts: the shared definition, the usage line with its type, the subject, the two bindings. Read the binding of measured aloud as a sentence.',
            misconceptions: [{ claim: 'Binding the limit is enough; the measured value can be filled in later.', correction: 'An unbound measured feature belongs to the requirement, not the design, so nothing in the design can ever be compared with the limit.' }],
            transition: 'Requirements also carry the attributes your Week 2 table had: type, method, rationale and status.',
            timing: '4 min: 1 min the three statements, 1 min the definition, 1.5 min the usage, 30 s why bind.',
          },
        },
        {
          id: 'w9s1-metadata',
          title: 'Requirement attributes as metadata: rationale, method, status',
          purpose: 'Carry the Week 2 requirement attributes into the model with metadata: library Rationale and StatusInfo, the verification method kinds, and the course RequirementAttributes definition.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-listing-metadata',
            caption: 'REQ-STK-003 in AeroLink model v0.2: its attributes, rationale and TBD status as three annotations. Checked: PASS. (FICTIONAL)',
            alt: listingAlt('metadata'),
          },
          body: [
            { kind: 'bullets', items: ['Metadata: defined by a metadata definition, applied as an annotation', 'Library: Rationale (text), StatusInfo (status, owner), StatusKind (tbd, tbc, open, done …)', 'Verification methods: inspect, analyze, demo, test', 'Course convention: RequirementAttributes for type, method and criterion'] },
          ],
          sources: [R('R77', '108'), R('R114', '555–557'), R('R84', '175')],
          notes: {
            teach: [
              'Metadata is defined using a metadata definition, and a specific type of metadata can then be applied as an annotation to model elements (R77 sl.108).',
              'The Modeling Metadata library provides what requirements need (R114 pp.555–557): Rationale, with a required text, to explain a choice or decision; StatusInfo, with a required status and an optional owner; and the enumeration StatusKind, whose values include open, tbd, tbc, done and closed. The verification library gives the four method kinds, inspect, analyze, demo and test (R84 p.175).',
              'Course convention: a local metadata definition, RequirementAttributes, carries the Week 2 type, the method as a verification method kind and the criterion text. Read REQ-STK-003 in the listing: its attributes, its rationale, and a StatusInfo with status tbd and an owner, because its weather limits are TBD-01, owned by the Director of Flight Operations. Rationale explains why the requirement exists; it does not restate it, as in Week 2.',
            ],
            why: 'The Week 2 table had columns for type, method, rationale and TBDs; metadata keeps all of them in the model, so the requirements view in Week 14 can be generated rather than retyped.',
            figure: 'Point at the three annotation lines and name the Week 2 column each replaces: type, method and criterion; rationale; the TBD and its owner.',
            misconceptions: [{ claim: 'Metadata changes what the requirement requires.', correction: 'An annotation adds data about the element; the requirement’s meaning is in its subject and constraints.' }],
            transition: 'A requirement alone is half the story. The other half is where it came from and what is claimed about it.',
            timing: '3 min: 30 s metadata, 1.5 min the library, 1 min the listing.',
          },
        },
      ],
    },
    // ============================================================================================ D. relationships (14 min)
    {
      id: 'w9s1-relationships',
      title: 'Relationships around requirements',
      slides: [
        {
          id: 'w9s1-derivation',
          title: 'Derivation: the library connection',
          purpose: 'Model “derives from” with its defined semantics: the Derivation connection, its ends and its constraint, and which way it reads.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-listing-derivation',
            caption: `The derivation of ${SYS1.id} from ${STK5.id} in AeroLink model v0.2: the parent is the #original end, the child the #derive end. Checked: PASS. (FICTIONAL)`,
            alt: listingAlt('derivation'),
          },
          body: [
            { kind: 'definition', term: 'Derivation (SysML v2.1 Beta 2 domain library)', text: '“asserts that one or more derivedRequirements are derived from a single originalRequirement”', source: R('R115', '580') },
            { kind: 'bullets', items: ['Any subject satisfying the original should satisfy each derived one', 'Ends: #original (the parent), #derive (the child)', 'Reads: parent satisfied implies child satisfied'] },
          ],
          sources: [R('R115', '580–583')],
          notes: {
            teach: [
              'The Requirement Derivation library defines a Derivation connection. It asserts that one or more derived requirements are derived from a single original requirement, which means that any subject that satisfies the original requirement should, in itself or through other things related to it, satisfy each of the derived requirements (R115 p.580).',
              'All its ends must be requirement usages: one end is the original, the rest are derived (R115 p.580). Its constraint says that whenever the original requirement is satisfied, all of the derived requirements must also be satisfied, and the original must not also be a derived one (R115 p.581). The library’s metadata gives the short names we write: #derivation for the connection, #original and #derive for its ends (R115 pp.582–583).',
              'Teaching point: the direction reads “the parent’s satisfaction implies the child’s”. That is the reverse of the common intuition “satisfy the children and the parent follows”. Before drawing a derivation, ask what you mean: “this was written from that”, or “meeting that implies meeting this”? The lab tool writes one derivation for each parent link in your Week 2 record, the parent as #original.',
            ],
            why: 'Derivation is the backbone of the Phase II trace; students who read its semantics correctly will not draw it backwards or use it where only a weaker link is meant.',
            figure: `Read the three lines: the connection’s name, the #original end on ${STK5.id}, the #derive end on ${SYS1.id}. Ask which requirement a subject satisfies first.`,
            misconceptions: [{ claim: 'A derivation means the child requirements add up to the parent.', correction: 'The library asserts the other direction: whatever satisfies the parent should satisfy each child.' }],
            transition: 'Not every link is a derivation. The language also has weaker relationships, and one rule for their direction.',
            timing: '3 min: 1 min definition and ends, 1 min the constraint and short names, 1 min direction.',
          },
        },
        {
          id: 'w9s1-dependency',
          title: 'Dependencies, refinement and the direction rule',
          purpose: 'Know the weaker relationships and when they are the honest choice, and state the course’s one dependency direction rule: from is the dependent element.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-ladder',
            caption: 'Relationships ordered by how much they claim: a dependency, a refinement-tagged dependency, a derivation, a satisfy assertion. Course illustration, not SysML v2 graphical notation.',
            alt: 'Four bars stacked top to bottom, with an arrow beside them pointing up: satisfy: an assertion (drawn strong, at the top); derivation: parent ⇒ child; refinement: more precise; dependency: model level only (at the bottom).',
          },
          body: [
            { kind: 'bullets', items: ['Dependency: clients need suppliers for their complete specification; model level only', 'Direction: from = the dependent element (client), to = what it depends on (supplier)', 'Refinement metadata tags a dependency as a refinement', 'Use the strongest relationship you can defend'] },
          ],
          sources: [R('R76', '105'), R('R80', '50–51'), R('R114', '556')],
          notes: {
            teach: [
              'A dependency indicates that one or more client elements require one or more supplier elements for their complete specification; a dependency is entirely a model-level relationship, without instance-level semantics (R76 sl.105). The specification states its direction: a change to a supplier element may result in a change to a client element, and the clients are written after from, the suppliers after to (R80 pp.50–51).',
              'That gives the course its one direction rule, the same as in Week 8: from names the dependent element, to names the element it depends on. In model v0.2 each need has a #serves dependency, a course keyword, from the need to the mission or objective it serves, because a change to the objective may require a change to the need.',
              'The Modeling Metadata library also provides Refinement, which identifies a dependency as a refinement: the source elements give a more precise or accurate representation than the targets (R114 p.556).',
              'Rule of thumb, a course convention: use the strongest relationship whose semantics you can defend. Use derivation when meeting the parent implies meeting the child; use a dependency when you only claim that this was written from that.',
            ],
            why: 'A shared direction rule makes every team’s trace readable the same way, and the ladder gives students a defensible way to choose between relationships instead of using one for everything.',
            figure: 'Climb the ladder from the bottom, reading each rung’s claim; stop at satisfy and say it is the subject of the next slide but one.',
            misconceptions: [{ claim: 'The arrow of a dependency points from the important element to the less important one.', correction: 'It points from the dependent element (from, the client) to what it depends on (to, the supplier).' }],
            transition: 'Put the relationships together into one picture: the course trace pattern.',
            timing: '3 min: 1 min dependency and direction, 1 min #serves and refinement, 1 min the rule of thumb.',
          },
        },
        {
          id: 'w9s1-trace-pattern',
          title: 'The course trace pattern: stakeholder to system requirement',
          purpose: 'Give students one picture of the Phase II requirement thread, on AeroLink, with the model element behind each arrow, and separate the conceptual drawing from SysML v2 notation.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-thread',
            caption: `The AeroLink thread from ${CHAIN.stakeholder} to ${SYS1.id}, with the model element behind each arrow; satisfy and verify follow in Weeks 11 and 12. Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `Five boxes in a column, joined by arrows labeled with the model element they stand for: ${CHAIN.stakeholder}; stakeholder; ${CHAIN.concern}; frame; ${NEED.id}; derivation; ${STK5.id}; derivation; ${SYS1.id}. From the last box two dashed arrows run to dashed boxes: satisfy · Week 11, and verify · Week 12.`,
          },
          body: [
            { kind: 'bullets', items: ['Stakeholder → concern → need → stakeholder requirement → system requirement', 'Every arrow is an element you write in the model', 'Later: satisfied by a design element (Week 11), verified by a verification case (Week 12)'] },
            { kind: 'callout', tone: 'caution', text: 'The drawing is a course illustration. The model is the text the checker reads.' },
          ],
          sources: [R('R83', '162'), R('R115', '580')],
          notes: {
            teach: [
              `Walk the AeroLink thread left to right. ${CHAIN.stakeholder}, the vertiport operators, holds ${CHAIN.concern}, the concern about pad throughput; in the model that is the concern’s stakeholder parameter, written in Week 8. ${NEED.id} frames ${CHAIN.concern} and names ${CHAIN.stakeholder} as its stakeholder. ${STK5.id}, the 25-minute hub turnaround, is derived from ${NEED.id}; and ${SYS1.id}, the 20-minute charge, is derived from ${STK5.id}. Each of those arrows is a model element: a stakeholder parameter, a frame, two derivation connections.`,
              'The course convention for the thread: every requirement traces upward to a need or a parent requirement, and every need to a stakeholder. The lab tool reports every requirement without a parent and every need without a stakeholder requirement, and you give each one a disposition.',
              'Then the dashed arrows: a satisfy from a design element, which Week 11 writes, and a verify from a verification case, which Week 12 writes. Neither is drawn this week.',
              'Read the caution. This drawing is a course illustration, made to show the idea; it is not the SysML v2 graphical notation, and no SysML v2 tool drew it. The model is the textual notation that the checker reads; the course tools and figures help you write and read it, and the pilot implementation is what checks it.',
            ],
            why: 'One concrete thread fixes the pattern every team reproduces, and naming the drawing as an illustration keeps students from mistaking a teaching diagram for standard notation or for tool output.',
            figure: 'Follow the arrows with a finger, naming the model element for each; stop at the dashed arrows and give their weeks.',
            misconceptions: [{ claim: 'The thread diagram is what the model looks like in a SysML v2 tool.', correction: 'It is a course illustration; the SysML v2 model is the text, and graphical notation has its own rules.' }],
            transition: 'The last arrow of the thread, satisfy, is the one most often misused. Look at it now, before you meet design elements.',
            timing: '4 min: 2 min the thread, 1 min the convention, 1 min dashed arrows and the caution.',
          },
        },
        {
          id: 'w9s1-satisfy',
          title: 'A first look at satisfy: an assertion, not a trace link',
          purpose: 'Prevent the most damaging misconception before students meet design elements: satisfy asserts that a requirement holds when its subject is bound to a feature; verify is previewed for Week 12.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-satisfy-preview',
            caption: `Three relationships of ${SYS1.id}: derived from its parent, claimed satisfied by a design element (an assertion), and checked by a verification case (Week 12). Course illustration, not SysML v2 graphical notation. (FICTIONAL)`,
            alt: `${SYS1.id} in the center, drawn strong. Above it ${STK5.id}, joined by an arrow labeled derivation. Lower left, Chargers, joined to the center by a heavy arrow labeled satisfy. Lower right, a dashed box, verification case, joined by a dashed arrow labeled verify.`,
          },
          body: [
            { kind: 'definition', term: 'Satisfy requirement usage (SysML v2.1 Beta 2)', text: '“asserts that a requirement is satisfied when a given feature is bound to the subject parameter of the requirement”', source: R('R83', '162') },
            { kind: 'bullets', items: ['An assertion about a design, not a trace link', 'Course rule: not between two requirements; use a derivation', 'Preview: verify, in a verification case’s objective (Week 12)'] },
          ],
          sources: [R('R83', '162'), R('R83', '168'), R('R84', '176')],
          notes: {
            teach: [
              'Read the definition: a satisfy requirement usage is a kind of assert constraint usage that asserts that a requirement is satisfied when a given feature is bound to the subject parameter of the requirement (R83 p.162). In the declaration, the satisfying feature follows the keyword by; the subject is bound to it, and the satisfy asserts that the requirement always evaluates to true (R83 p.168). A negated satisfy, not satisfy, asserts the opposite, and is just as strong a claim (R83 p.168).',
              'So satisfy belongs between a requirement and a design element, never between two requirements; between requirements the honest relationship is a derivation. And write it only when the model gives you grounds: a model whose values contradict a satisfy is inconsistent. Weeks 11 and 12 write satisfy claims properly, against design elements with values.',
              'Preview of verify: in a verification case, the objective may contain requirement verification usages, declared with the keyword verify, which indicate the requirements to be verified by that case (R84 p.176). A verify checks; a satisfy claims. Week 12 builds verification cases on the requirements you model now.',
              'For this week: do not write satisfy in your model. The lab tool does not generate it, and the rubric scores satisfy from Week 11.',
            ],
            why: 'Students who learn satisfy as a trace link spend Weeks 11 and 12 asserting things their model contradicts; meeting its semantics now, before any design element exists, prevents the habit.',
            figure: 'Point at the three arrows in order: comes from, is claimed met by, is checked by. Stress the heavy border on satisfy: an assertion.',
            misconceptions: [{ claim: 'Satisfy shows that a requirement is covered by something.', correction: 'Satisfy asserts that the requirement evaluates to true for the bound feature; it is a claim about the design that the model’s values must support.' }],
            transition: 'Last, calibrate your trust in the checker before you model your own requirements.',
            timing: '4 min: 1.5 min the definition, 1 min where it belongs, 1 min verify, 30 s this week.',
          },
        },
      ],
    },
    // ============================================================================================ E. calibration and exit (6 min)
    {
      id: 'w9s1-calibration',
      title: 'Calibration and exit',
      slides: [
        {
          id: 'w9s1-checker',
          title: 'What the checker checks, and what it cannot',
          purpose: 'Calibrate trust in tool output on requirement constructs: recorded results of release 2026-08 for files that fail and files that pass silently with a semantic error.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-checker-table',
            caption: 'Recorded results of the course checker (release 2026-08) on six course files: what it rejects, and what it accepts without complaint. Course illustration, not SysML v2 graphical notation.',
            alt: `Two columns. Left, headed checker rejects: ${rejected.map((c) => c.label).join('; ')}. Right, headed checker accepts: ${accepted.map((c) => c.label).join('; ')}. The messages the checker recorded are in the notes and the lesson.`,
          },
          body: [
            { kind: 'bullets', items: ['Zero errors is necessary, never sufficient', 'Read every requirement for subject, constraint and intent', 'Recorded for one release; a new release may differ'] },
          ],
          sources: [R('R83', '165–166')],
          notes: {
            teach: [
              `Read the left column, the files the checker rejects, each with the message it recorded: ${rejected.map((c) => `${c.what.toLowerCase()}: “${c.recorded}”`).join('; ')}. The first two are rules of the specification: one requirement definition per usage, and the subject first (R83 pp.165–166). The third is the Week 8 ID rule.`,
              `Then the right column, the files it accepts: ${accepted.map((c) => `${c.what.toLowerCase()}: ${c.result}${c.recorded === 'no message' ? ', no message' : `, “${c.recorded}”`}`).join('; ')}. A requirement with nothing to evaluate, a constraint over the wrong element, a derivation drawn backwards: none of them is reported. A satisfy between two requirements only draws a warning about types.`,
              'The rule for the course: zero errors is necessary and never sufficient. Read every requirement you model for its subject, its constraint and its intent; Session 2 gives you a checklist. These behaviors are recorded for the course release of the checker; a new release may report more, or less.',
            ],
            why: 'Students about to write dozens of requirements need to know exactly which mistakes the tool will catch for them and which ones only their own review will catch.',
            figure: 'Read the two columns row by row; pause on the reversed derivation, which the tool cannot judge because direction is meaning.',
            misconceptions: [{ claim: 'A warning-free PASS means the requirements are modeled correctly.', correction: 'Three of the recorded passes contain modeling errors the checker does not report.' }],
            transition: 'Now one of your own requirements, before Session 2.',
            timing: '3 min: 1 min the rejects, 1.5 min the silent passes, 30 s the rule.',
          },
        },
        {
          id: 'w9s1-exit',
          title: 'Exit: one requirement, three questions',
          purpose: 'Retrieval and preparation for Session 2: each student writes one team system requirement as a usage and answers three questions; it is the first item of the lab.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w9s1-exit-card',
            caption: 'The exit card: four fields to write and three questions to answer, for one of your team’s Week 2 system requirements. Course illustration, not SysML v2 graphical notation.',
            alt: 'A card with four labeled boxes: ID, doc, subject, constraint. Below them a tag: and three questions (the questions are listed on the slide).',
          },
          body: [
            { kind: 'bullets', items: ['Write one team system requirement as a usage: ID, doc, subject, required constraint', 'What is its subject, and why that element?', 'Is any condition in its text an assumption, or part of the quantity?', 'Which need or parent does it derive from?'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Each student picks one of the team’s Week 2 system requirements and writes it on paper as a requirement usage: the ID as a quoted short name, the Week 2 statement as doc, a subject with its type, and a required constraint over a feature of the subject, with a limit and a unit.',
              'Then one line for each question. What is its subject, and why that element rather than the enterprise or the system as a whole? Does its text contain a condition, “in still air”, “during peak hours”, and is that condition a gate on when it applies or part of the quantity itself? Which need or parent requirement does it derive from?',
              'Collect nothing today. Students bring the card to Session 2: it is the first requirement of the lab, and the checkpoint looks at it.',
            ],
            why: 'Writing one requirement immediately consolidates subject, doc and constraint, and the three questions rehearse the decisions Session 2 deepens and the lab demands.',
            figure: 'Read the four fields, then the three questions; point at the second question and say Session 2 opens it properly.',
            misconceptions: [{ claim: 'The subject of a system requirement can be the system as a whole for now.', correction: 'Choose the element the shall is about; a placeholder is fine, a subject too large to satisfy is not.' }],
            transition: 'Session 2 starts with three declarations to judge, then quality and worked examples.',
            timing: '3 min: 2 min writing, 1 min the questions and what to bring.',
          },
        },
        {
          id: 'w9s1-references',
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
      id: 'w9s1-l-why',
      title: 'From Phase I documents to model elements',
      blocks: [
        { kind: 'para', text: 'Your team wrote its needs in Week 1 and its stakeholder and system requirements in Week 2. In Week 8 it built a SysML v2 model of the enterprise and filled the Stakeholders package with the stakeholders and concerns from the register. This week the needs and requirements join them, in the Needs and Requirements packages the Week 8 skeleton left empty. Nothing is invented and nothing is retyped: the IDs, the statements, the criteria, the methods, the rationale and the parent links all come from your Phase I exports, and the Week 9 lab tool reads them for you.' },
        { kind: 'figure', slide: 'w9s1-title' },
        { kind: 'para', text: 'Before modeling anything, recall what the two kinds of statement are. SEBoK describes system requirements as what the system of interest must fulfill to satisfy the stakeholder needs, expressed as an appropriate combination of well-formed textual statements and supporting models or diagrams, and it insists that defining requirements is an exercise in engineering, not only in writing: every requirement represents an engineering decision about what the system must do. It quotes the INCOSE needs and requirements manual for the definition the course uses: a requirement statement is the result of a formal transformation of one or more needs or parent requirements into an agreed-to obligation for an entity to perform some function or possess some quality within specified constraints with acceptable risk.' },
        { kind: 'para', text: 'Needs and requirements speak from different sides. Needs communicate the stakeholder’s perspective on what they need the system of interest to do, from an external, black-box view; requirements communicate the developer’s perspective on what the system must do to meet those needs, from an internal, white-box view. SEBoK adds that generating a requirement is more than changing the subject of the need statement: it is an analysis of what the system must do. Week 1 and Week 2 taught this distinction; this week it decides how each kind of statement is modeled.' },
        { kind: 'figure', slide: 'w9s1-needs-vs-reqs' },
        { kind: 'para', text: `Two words in the definition matter most for modeling. A requirement comes from needs or parent requirements: that is its source, and in the model it becomes a derivation connection. And it is an obligation for an entity: that is its subject. On AeroLink, ${NEED.id}, in which the vertiport operators need the service to turn aircraft around quickly enough that pad occupancy does not limit departures, is transformed through a turnaround budget of ${CHAIN.budget.total} minutes, ${CHAIN.budget.charge} for the charge and ${CHAIN.budget.padWork} for the work on the pad, into ${STK5.id}: ${STK5.statement}` },
        { kind: 'para', text: 'Why put requirements in a model at all? SEBoK lists what models add: completeness in terms of functions, their inputs and the sources of those inputs, outputs and their destinations; easier communication; the capture of interdependencies between requirements and the rest of the system data, such as needs, architecture and test cases; and quantitative analysis and simulation. In MBSE, it says, the requirement keeps its well-formed text as part of a requirement model element. The model holds your Week 2 statements and relates them; it does not replace them.' },
      ],
      sources: [R('R13', '557–558'), R('R13', '564')],
    },
    {
      id: 'w9s1-l-construct',
      title: 'The requirement construct: constraint, usage, subject, ID, text',
      blocks: [
        { kind: 'para', text: 'SysML v2 makes a requirement a model element by making it a constraint. The SysML v2.1 Beta 2 specification defines a requirement definition as a kind of constraint definition that specifies stakeholder-imposed constraints that a design solution must satisfy to be a valid solution. Its required constraints may be informal shall statements or formal constraint expressions, and it may also have assumed constraints, which restrict when the required constraints apply. Because a requirement is a kind of constraint, it can be evaluated to true or false, and it is satisfied when it evaluates to true. That sentence is the reason a requirement in a model can be compared with design values at all.' },
        { kind: 'figure', slide: 'w9s1-constraint' },
        { kind: 'para', text: 'The training deck shows the parts in one listing: the textual statement is given as a documentation comment; the requirement is formalized by one or more required constraints; and, like a constraint definition, a requirement definition can be parameterized by features, here the attribute limit. A requirement usage is a usage of a requirement definition in some context: a package, a part or another requirement. A usage can redefine and bind the features of its definition, so a definition serves as a template that is reused and tailored to each context of use. A requirement usage must be defined by a single requirement definition.' },
        { kind: 'para', text: 'The course writes a requirement definition only when several requirements share a form; otherwise each requirement is a usage written directly in the Requirements package. This is a course convention. The lab asks for at least one shared definition used by two of your requirements, so that you practise the template pattern on your own data.' },
        { kind: 'heading', text: 'The subject' },
        { kind: 'para', text: 'Every requirement has a subject: a distinguished parameter that identifies the entity on which the requirement is being specified. A requirement can only be satisfied by an entity that conforms to the definition of its subject, so a specialization of that definition conforms too. If no subject is declared, the subject is implicitly Anything; when it is declared, it is the first parameter and must come before any other. The subject can have any kind of definition, a port or an action as well as a part. Declaring the subject also lets the constraints use the subject’s features, which is how a requirement can talk about the charge time of the charging system.' },
        { kind: 'figure', slide: 'w9s1-subject' },
        { kind: 'para', text: 'Choosing the subject is the most consequential decision you make for each requirement, because it decides what can ever be claimed to satisfy it. The course convention: a stakeholder requirement constrains the service as a whole, so its subject is the enterprise; a system requirement’s subject is the element its shall is about. When that element is not yet in your model, the lab tool writes a placeholder part definition in the Physical or Logical package, which Weeks 10 and 11 complete. A system requirement with the enterprise as its subject is a common error: no element of the design can be shown to satisfy a requirement on the whole enterprise.' },
        { kind: 'heading', text: 'The ID and the informal text' },
        { kind: 'para', text: 'The informal text of a requirement is given by the documentation comments in its body, and if the requirement has a short name, that short name is also considered its requirement ID. A short name is written between angle brackets before the name; the specification intends the name to be fully descriptive and the short name an abbreviated name for referring to the element. Course IDs contain hyphens, so the short name is a quoted unrestricted name, exactly as in Week 8. The doc carries the Week 2 statement word for word, so the table and the model cannot drift apart.' },
        { kind: 'figure', slide: 'w9s1-id-doc' },
        { kind: 'heading', text: 'Doc alone is not enough' },
        { kind: 'para', text: 'A requirement whose only content is a doc comment is still a constraint, but it gives the model nothing to evaluate. Write the Week 2 criterion as a required constraint over a feature of the subject, with the limit as an attribute that carries its unit. The two teams of the driving question show the difference: Team B’s model names the subject, the quantity and the limit, so a design value can later be compared with it; Team A’s does not. Team B’s model still proves nothing about a design: that needs a satisfy claim, values in the model that are consistent with it, and, later, verification evidence. And both files pass the checker, which cannot see that Team A left the constraint out.' },
        { kind: 'figure', slide: 'w9s1-required-constraint' },
      ],
      sources: [R('R83', '161–162'), R('R83', '165–166'), R('R74', '86–89'), R('R80', '49')],
    },
    {
      id: 'w9s1-l-assume-params',
      title: 'Assumptions, actors, stakeholders and concerns',
      blocks: [
        { kind: 'para', text: 'A requirement is built from two sets of constraints, the assumed and the required ones. Its effective constraint is a logical implication: if all the assumption constraints are true, all the required constraints must be true. The keywords are assume and require. The training deck says it formally: a requirement is satisfied for a subject if, when all its assumed constraints are true, all its required constraints are true.' },
        { kind: 'figure', slide: 'w9s1-assume' },
        { kind: 'para', text: 'The consequence follows from logic, and the course states it as its own reasoning rather than as a sentence of the specification: an implication is true whenever its condition is false, so where an assumption fails, the requirement demands nothing. Every assumption marks a region the requirement deliberately leaves uncovered. Before writing one, decide whether the condition really bounds where the requirement applies, and whether some other requirement covers the rest. Session 2 works an AeroLink case where the honest answer is not to use an assumption at all.' },
        { kind: 'para', text: 'Besides the subject, a requirement may have actor and stakeholder parameters, declared with the keywords actor and stakeholder. Both are part usages, so they must be defined by part definitions. An actor represents a role played by an entity external to the subject but necessary for the requirement to be satisfied; its features may be used in the assumed constraints, for example to describe the environment in which the required constraints apply. A stakeholder parameter represents a role played by an entity, usually a person, organization or group, that has concerns related to the requirement. This is why Week 8 modeled every stakeholder as a part definition: it can now type a stakeholder parameter.' },
        { kind: 'figure', slide: 'w9s1-parameters' },
        { kind: 'para', text: 'Concerns are themselves a kind of requirement. A concern definition is a kind of requirement definition that represents a stakeholder concern, and its stakeholder parameters delineate the stakeholders who have it; your Week 8 concerns are concern usages of exactly this kind. A requirement can frame concerns, and then all its framed concerns must be addressed for the requirement to be satisfied. The keyword is frame, and a framed concern is a subrequirement, so it is automatically a required constraint of the requirement that frames it.' },
        { kind: 'figure', slide: 'w9s1-frame' },
        { kind: 'para', text: 'Framing is therefore a strong statement. A need that frames a concern claims that meeting the need addresses the concern. Frame only the concerns the need actually answers: framing every concern of a stakeholder, to look thorough, writes requirements into the need that it does not meet.' },
      ],
      sources: [R('R83', '162'), R('R83', '165–167'), R('R74', '87'), R('R74', '91')],
    },
    {
      id: 'w9s1-l-needs',
      title: 'Modeling needs, the mission and the objectives',
      blocks: [
        { kind: 'para', text: `The AeroLink Needs package in model v0.2 is generated from the corrected Week 1 case by the same generator the lab tool uses. It holds ${numberWord(COUNTS.objectives)} elements for the mission and the objectives and ${COUNTS.needs} needs. Each need is a requirement usage with its Week 1 ID as short name; its doc is the need statement with its condition, its rationale and its priority; its subject is the enterprise; it has a stakeholder parameter for each stakeholder who holds the need, typed by the Week 8 part definition; and it frames each concern it answers. Across the package there are ${COUNTS.stakeholderParams} stakeholder parameters and ${COUNTS.frames} frames.` },
        { kind: 'figure', slide: 'w9s1-worked-needs' },
        { kind: 'para', text: 'This is a course modeling choice, and it should be labeled as one. SysML v2 has requirements and concerns but no separate need construct. A requirement usage with an informal doc and framed concerns is the closest construct, and the doc keeps the stakeholder’s words. A need modeled this way is still not a requirement on the system: it names stakeholders and frames concerns, and it constrains nothing the design has. The obligation on the system comes from the stakeholder requirements derived from it.' },
        { kind: 'para', text: 'Each need also serves a mission or objective, the link Week 1 recorded. The model writes it as a dependency tagged with a course keyword, #serves, from the need to the objective, following the course’s direction rule: the need depends on the objective, because a change to the objective may require a change to the need. The mission and each objective are requirement usages with the enterprise as subject and their statement as doc; an objective that sits under a goal is derived from it.' },
        { kind: 'para', text: 'Try the pair question from the slide on your own: NEED-010 asks the service to keep the power drawn at each vertiport within the agreed connection capacity. Its stakeholder is the electric utility, and the concern it answers is the utility’s concern about peak grid load. It should not frame the vertiport operators’ throughput concern: keeping within the grid connection does not address pad throughput, and in the Week 1 case the two needs are in tension.' },
      ],
      sources: [R('R83', '162'), R('R83', '167'), R('R80', '50–51')],
    },
    {
      id: 'w9s1-l-groups-forms',
      title: 'Groups and a shared requirement definition',
      blocks: [
        { kind: 'para', text: 'A requirement may group other requirements, by reference with require or by composition with nested requirement usages. By default, grouped requirements take the group’s subject; a grouped requirement’s subject can also be bound explicitly; and grouped requirements are treated as required constraints of the group. A group is itself a requirement: a design solution must satisfy a requirement and all its member requirements to be valid, on the one subject a satisfy claim binds.' },
        { kind: 'figure', slide: 'w9s1-groups' },
        { kind: 'para', text: `Members may keep different subjects and the group still be satisfiable, provided each member’s subject is bound to a feature of the group’s subject. The specification groups engine requirements inside a vehicle group with subject engine = vehicle.engine; (R83 p.167), and the training deck binds member subjects to engine.clutchPort and engine.generateTorque (R74 sl.90). One design then satisfies the whole group through its parts, the pattern Week 11 uses. What cannot be satisfied as a whole is a group whose members keep independently typed subjects, bound neither to a group subject nor to its features: no single satisfy binding reaches them all. This is course reasoning from the semantics; such an organizing group is still useful, and you satisfy its members instead. AeroLink model v0.2 has one group of each kind: the ${COUNTS.stk} stakeholder requirements share the enterprise as subject, so their specification group declares it; the ${COUNTS.sys} system requirements keep their own unbound subjects, so their organizing group declares none until the Week 11 architecture gives them features to bind to.` },
        { kind: 'para', text: 'Three AeroLink system requirements share one form: the scheduling function shall assign an aircraft within 60 seconds, the maintenance management function shall flag a no-go fault within 2 minutes, and the vertiport fire detection system shall transmit a battery-fire alarm within 30 seconds. In each, a measured duration shall not exceed a limit. Model v0.2 writes one requirement definition for that form, with two attributes, measured and limit, and one required constraint, measured at most limit. Each of the three requirements is a usage of it: its own ID as short name, its own Week 2 statement as doc, its own subject, and two bindings, measured to a feature of the subject and limit to the Week 2 value with its unit.' },
        { kind: 'figure', slide: 'w9s1-worked-latency' },
        { kind: 'para', text: 'Binding the measured feature is what makes the requirement connect to a design. Without it, measured is a free attribute of the requirement: the constraint reads nothing the design has, and no later satisfy claim can compare a design value with the limit. This is the pattern of the specification’s MaximumMass example, where a usage restricts the subject to a vehicle and binds the actual mass to the vehicle’s total mass.' },
      ],
      sources: [R('R74', '86–90'), R('R83', '161'), R('R83', '166–167')],
    },
    {
      id: 'w9s1-l-metadata',
      title: 'Requirement attributes, rationale and status as metadata',
      blocks: [
        { kind: 'para', text: 'Your Week 2 table had columns the requirement element does not hold by itself: the type, the verification method, the criterion text, the rationale and the status of any TBD. SysML v2 carries them as metadata. Metadata is defined by a metadata definition, and a specific type of metadata can then be applied as an annotation to model elements.' },
        { kind: 'para', text: 'The Modeling Metadata library of the specification provides three things requirements need. Rationale explains a choice or other decision made about the annotated element, and its text is required. StatusInfo annotates an element with status information: a required status and an optional owner. StatusKind enumerates the statuses, among them open, tbd, tbc, done and closed. The verification library enumerates the standard verification methods: inspect, analyze, demo and test.' },
        { kind: 'figure', slide: 'w9s1-metadata' },
        { kind: 'para', text: 'Model v0.2 adds a course metadata definition, RequirementAttributes, for the level, the Week 2 type, the method as a verification method kind and the criterion text; a Rationale annotation for the Week 2 rationale; and, when the statement carries a TBD or TBR token, a StatusInfo annotation with status tbd for a value to be determined, or tbc for a value to be confirmed, and the owner of the unknown from the Week 2 register. Rationale explains why the requirement exists; as in Week 2, it does not restate the requirement.' },
      ],
      sources: [R('R77', '108'), R('R114', '555–557'), R('R84', '175')],
    },
    {
      id: 'w9s1-l-relationships',
      title: 'Derivation, dependencies and a first look at satisfy',
      blocks: [
        { kind: 'para', text: 'The Requirement Derivation library of the specification defines a Derivation connection. It asserts that one or more derived requirements are derived from a single original requirement: any subject that satisfies the original requirement should, in itself or through other things related to it, satisfy each of the derived requirements. All its ends must be requirement usages, its constraint says that whenever the original is satisfied all the derived requirements must also be satisfied, and the original must not also be a derived one. The library’s metadata gives the short names: #derivation for the connection, #original and #derive for its ends.' },
        { kind: 'figure', slide: 'w9s1-derivation' },
        { kind: 'para', text: 'Read the direction carefully: the parent’s satisfaction implies the child’s. Many engineers think the other way, that satisfying the children adds up to the parent. Before drawing a derivation, decide what you mean. The lab tool writes one derivation for each parent link in your Week 2 record, with the parent as the original end.' },
        { kind: 'para', text: 'A dependency is weaker. It indicates that client elements require supplier elements for their complete specification, and it is entirely a model-level relationship, without instance-level semantics. The specification states its direction: a change to a supplier may result in a change to a client, and the clients are written after from, the suppliers after to. The course keeps one direction rule for every dependency: from names the dependent element, to names the element it depends on. A dependency can be tagged as a refinement with the library’s Refinement metadata, which says that its source elements are a more precise or accurate representation than its targets. The course rule of thumb is to use the strongest relationship whose semantics you can defend.' },
        { kind: 'figure', slide: 'w9s1-dependency' },
        { kind: 'para', text: 'Together, these relationships make the course trace pattern: a stakeholder holds a concern, a need frames the concern and names the stakeholder, a stakeholder requirement is derived from the need, and a system requirement is derived from the stakeholder requirement. Every requirement traces upward to a need or a parent requirement, and every need to a stakeholder. The thread figure is a course illustration drawn to show the idea; it is not SysML v2 graphical notation, and no SysML v2 tool drew it. The model is the textual notation the checker reads.' },
        { kind: 'figure', slide: 'w9s1-trace-pattern' },
        { kind: 'para', text: 'The last arrow of the thread is satisfy, and it is the relationship most often misused. A satisfy requirement usage is a kind of assert constraint usage that asserts that a requirement is satisfied when a given feature is bound to its subject parameter: the satisfying feature follows the keyword by, and the satisfy asserts that the requirement always evaluates to true. A negated satisfy asserts the opposite and is just as strong. So satisfy belongs between a requirement and a design element, never between two requirements, and it should be written only when the model gives grounds for it. A verification case is different again: its objective may contain verify usages that indicate the requirements the case verifies. Week 11 writes satisfy claims and Week 12 writes verification cases; this week, model no satisfy at all.' },
        { kind: 'figure', slide: 'w9s1-satisfy' },
      ],
      sources: [R('R115', '580–583'), R('R76', '105'), R('R80', '50–51'), R('R114', '556'), R('R83', '162'), R('R83', '168'), R('R84', '176')],
    },
    {
      id: 'w9s1-l-checker',
      title: 'What the checker can and cannot tell you',
      blocks: [
        { kind: 'para', text: 'The course checker, the SysML v2 pilot implementation, decides whether a file parses, whether every name resolves and whether any validation rule fires. On requirement constructs it rejects a requirement usage typed by two requirement definitions, a parameter declared before the subject, and a hyphenated ID written without quotes. It accepts, without any message, a requirement with only a doc comment, a constraint over a feature of the wrong element, and a derivation whose parent and child are swapped; a satisfy between two requirements draws only a warning about types. Those results are recorded for the course release; a new release may report more or less.' },
        { kind: 'figure', slide: 'w9s1-checker' },
        { kind: 'para', text: 'So zero errors is necessary and never sufficient. For every requirement you model, read its subject, its constraint and its intent against your Week 2 statement. Before Session 2, write one of your team’s system requirements as a usage on paper, with its ID, doc, subject and required constraint, and answer three questions: why that subject, whether any condition in its text is a gate or part of the quantity, and which need or parent it derives from.' },
        { kind: 'slide-ref', slide: 'w9s1-exit', text: 'See the exit card.' },
      ],
      sources: [R('R83', '165–166')],
    },
  ],
}
