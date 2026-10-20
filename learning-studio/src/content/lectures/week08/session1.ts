// Week 8, Session 1 lecture: Import Systems Thinking Artifacts / Stakeholders — from documents to a model: what MBSE
// changes, model and view, the SysML v2 language architecture, definition and usage with specialization, subsetting and
// redefinition, attributes with units, and a calibration of what the course-designated checker can and cannot decide.
// 75-minute session: 70 minutes of planned content on 26 slides plus the generated "References and credits" slide, and
// a 5-minute buffer (bufferMinutes). Revised 2026-10-19 after the independent review (WEEK8_REVIEW_DISPOSITIONS.md):
// writing check and live checker demonstration added; four slides shortened; redefinition and the worked network
// marked as previews practised in Week 9. Single source for the slide viewer, the faculty notes, the .pptx and the student
// lesson (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20 (teach first, explain in depth, demonstrate,
// then assign), A21 (the Week 1 architecture is the template; decision 8: SysML v2 foundations and tool navigation in
// Week 8; decision 9: AeroLink is the instructor reference only).
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week08/WEEK08_LECTURE_OUTLINE.md §2.
//
// Accuracy rules followed:
//   - Every citation is a verified register entry (readings.generated.json) at a page whose extracted text
//     (_source_cache/*.txt) supports the claim beside it. The SysML v2 specification is cited as the SysML v2.1 Beta 2
//     text (R80–R85), never as "the standard". Definitions are quoted briefly; the rest is original explanation.
//   - SysML rules are stated only with a specification or training-deck citation; course conventions (textual
//     notation first, the ID rule, "kind values in definitions, configuration values in usages") are labeled as such;
//     toolchain facts come from docs/SYSML_TOOLCHAIN.md and the recorded checker runs, never from the specification.
//   - A checker PASS is never presented as semantic correctness (slides on the checker; the predict-the-checker slide).
//   - Every listing is an excerpt of a checker-validated file (./listings.ts); AeroLink values are FICTIONAL and come from
//     ./aerolinkCase.ts, ../week01/aerolinkCase.ts (read-only) and the course SysML files. Nothing is retyped.
//   - Timing: spoken notes (teach, worked solution, figure walk) stay between 40 and 130 words per minute.
//   - Faculty notes and purposes are stripped from the student build (student-edition.ts).
import type { Lecture } from '../types'
import { numberWord } from '../week01/aerolinkCase'
import { NINE_PLACES } from './aerolinkCase'
import { MODEL_PACKAGES } from './labBrief'
import { listing, listingText } from './listings'
import { PROOF_OUTPUT } from '../../lab/week08Checker'

export const WEEK8_S1_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
/** Alt text of a listing figure: the file it comes from, the recorded checker status and the full listing text. */
const listingAlt = (key: string) => {
  const l = listing(key)
  return `Listing (course file sysml/${l.file}, checked: ${l.status}): ${listingText(key)}`
}
const N_PLACES = NINE_PLACES.length
const placeIds = NINE_PLACES.map((p) => p.id).join(', ')
const filledNow = MODEL_PACKAGES.filter((p) => p.filledIn === 8).map((p) => p.name)
const laterPkgs = MODEL_PACKAGES.filter((p) => p.filledIn > 8)
const LANES: [string, string][] = [
  ['Week 1', 'Week 8'],
  ['Week 2', 'Week 9'],
  ['Weeks 2 and 4', 'Week 10'],
  ['Week 5', 'Week 11'],
  ['Weeks 2 and 3', 'Week 12'],
  ['Week 3', 'Week 13'],
  ['Weeks 6 and 7', 'Week 14'],
]
const predictBlock = listing('predict-block')
const predictDup = listing('predict-duplicate')
const predictAttr = listing('predict-attribute-part')

export const WEEK8_SESSION1: Lecture = {
  week: 8,
  session: 1,
  title: 'Import Systems Thinking Artifacts / Stakeholders',
  subtitle: 'Session 1: From documents to a model: MBSE and the SysML v2 language',
  bufferMinutes: 5,
  sections: [
    // ============================================================================================ A. framing (8 min)
    {
      id: 'w8s1-framing',
      title: 'Framing: Phase II begins',
      slides: [
        {
          id: 'w8s1-title',
          title: 'Import Systems Thinking Artifacts / Stakeholders',
          subtitle: 'Session 1: From documents to a model: MBSE and the SysML v2 language',
          purpose: 'Orient students to the scheduled subject, the two halves of the week and what the week adds: the model skeleton, the mapping of the whole package, and the stakeholders and concerns modeled.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-week-band',
            caption: `Week 8 turns the Systems Thinking package into model v0.1: ${filledNow.join(', ')} are filled now; the other packages wait, each labeled with the week that fills it.`,
            alt: `A horizontal band in three parts. On the left, a stack of document icons labeled Week 7 Systems Thinking package. A thick arrow labeled import by ID points right to a package tree labeled Model v0.1. In the tree, ${filledNow.length} packages are drawn solid and filled: ${filledNow.join(', ')}. The other ${laterPkgs.length} packages are drawn dashed and dimmed, each with a small tag giving the week that fills it: ${laterPkgs.map((p) => `${p.name} (Week ${p.filledIn})`).join(', ')}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Today: what a model changes, and the core of SysML v2', 'Session 2: packages and names, the toolchain, the import, stakeholders and concerns, the Lab L8 launch', 'Your output: model v0.1 of your own enterprise'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the subject exactly as the schedule gives it: Import Systems Thinking Artifacts / Stakeholders. Say that this is the first week of Phase II and that it does two jobs: it introduces model-based systems engineering and the SysML v2 language, and it imports the package each team finished in Week 7, starting with the stakeholders and concerns.',
              'Point at the band. On the left is what you delivered: a set of documents. On the right is what you will have in seven days: a model with a place for every artifact. Three packages are filled this week; the rest are empty but present, and each says which week will fill it. Nothing from Phase I is thrown away.',
              'Say how today works: we read listings together, and near the end each pair writes one definition on paper. Session 2 is where the team writes the first lines of its own model.',
            ],
            why: 'Students who see the whole week and the deliverable can file each idea as it arrives, and seeing the empty packages labeled by week tells them the model grows, it is not built in one sitting.',
            figure: 'Walk left to right: the document stack, the import arrow labeled by ID, the package tree. Point at the solid packages, then trace the dashed ones and read two of the week tags aloud.',
            examples: [
              'Instructor preparation (not for students): students install the course checker after this session, from the install guide on the Week 8 Laboratory page; one working installation per team is required by Session 2, a personal one is optional. Before class, run the two tool-proof files once on the lecture laptop for the live demonstration near the end, and confirm that the lab machines (the fallback) run them too.',
              'Timing plan: 70 minutes of content and a 5-minute buffer. If the session runs long, shorten the ownership slide or the continuity slide; never shorten the worked network example, the predict-the-checker slide or the live checker demonstration.',
            ],
            misconceptions: [{ claim: 'Phase II starts over with a new project in a modeling tool.', correction: 'Phase II models the same enterprise; every Phase I artifact keeps its ID and gets a place in the model.' }],
            transition: 'First, a question about AeroLink that a document set answers badly.',
            timing: '2 min: 1 min subject and the two halves, 1 min the band.',
          },
        },
        {
          id: 'w8s1-driving-question',
          title: `The driving question: one number, ${numberWord(N_PLACES)} places`,
          purpose: 'Create the need for a single source before defining MBSE: one value repeated across the Phase I package, and a change to it.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-nine-places',
            caption: `AeroLink’s 20-minute charge to the dispatch threshold appears in ${numberWord(N_PLACES)} artifacts of its Phase I package: stated, computed from, or relied on. (FICTIONAL)`,
            alt: `A grid of ${N_PLACES} document tiles in three rows of three. Each tile has its ID as a heading, the kind of artifact under it and one short line with the value highlighted: ${NINE_PLACES.map((p) => `${p.id} (${p.artifact}): ${p.detail}, tagged ${p.how}`).join('; ')}. One extra tile, drawn half hidden under a fold at the bottom right, is labeled the one you miss and carries a question mark.`,
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'What if (FICTIONAL)', text: 'The charger supplier now says 24 minutes, not 20.' },
            { kind: 'bullets', items: ['Which artifacts must change?', 'How would you be sure you found them all?'] },
          ],
          sources: [],
          notes: {
            teach: [
              `Read the tiles. The 20-minute charge is stated in the Data Sheet, in the system requirement REQ-SYS-001, in the charging scenario SCN-003 and in the measure MOP-002. It is computed from in REQ-STK-005, whose 25-minute turnaround is the charge plus five minutes of pad work, in A-007, which turns it into 48 charges per charger per day, and in TPM-001, which tracks the estimate against it. And two conclusions rest on it: the technology assessment TECH-001 and the trade-study decision DEC-001, whose capacity figure counts chargers times 48.`,
              'Give the what-if: the supplier now says 24 minutes. Ask pairs for thirty seconds: which artifacts change, and how would you know you found every one? Take two answers.',
              'Expect “search the documents for 20”. Ask what that search misses: the 25 in REQ-STK-005 and the 48 in A-007 do not contain the number 20, and DEC-001 contains neither. Withhold the answer; slides 6 and 7 come back to it.',
            ],
            why: 'A prediction before instruction creates a need to know, and this example shows concretely why a set of documents cannot keep one value consistent: the dependents do not mention the value they depend on.',
            figure: 'Point at the three tags, states, computes and rests on, and show that only the first kind contains the number 20. End on the half-hidden tile: in a real package there is always one more.',
            misconceptions: [{ claim: 'A text search finds every place a value is used.', correction: 'Values derived from it (25, 48) and conclusions that rest on it do not contain it; only relationships between elements find those.' }],
            transition: 'Before we answer it, see how this week connects Phase I to Phase II.',
            timing: '3 min: 1 min the tiles, 1 min the pair question, 1 min two answers and the search trap.',
          },
        },
        {
          id: 'w8s1-continuity',
          title: 'Phase II: your package becomes one model',
          purpose: 'Make the continuity explicit: every Phase II week models a named Phase I artifact, and the IDs are the thread.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-two-lanes',
            caption: 'Every Phase II week models a Phase I artifact by ID; Week 14 presents one coherent SysML v2 model of your enterprise.',
            alt: `Two horizontal lanes. The upper lane is labeled Phase I: documents, with week boxes Week 1 to Week 7. The lower lane is labeled Phase II: one model, with week boxes Week 8 to Week 14. Dashed vertical arrows run from the upper lane down to the lower lane: ${LANES.map(([a, b]) => `${a} to ${b}`).join('; ')}. A thin thread labeled stable IDs (ENT, EXT, STK, CON, NEED, REQ …) runs along all the arrows. The Week 1 to Week 8 arrow is drawn solid and highlighted.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Phase I: a document-based Systems Thinking package', 'Phase II: the same enterprise as one SysML v2 model', 'Each week models a named Phase I artifact', 'Stable IDs are the thread: the same ID in document and model', 'AeroLink first, then your own enterprise'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Phase I gave you a document-based package. Phase II rebuilds the same enterprise as one model, and Week 14 presents it. Read the arrows: this week models the Week 1 register, the stakeholders and concerns and the context. Week 9 models the Week 2 needs and requirements; Week 10 the scenarios and the Week 4 architecture; Week 11 the Week 5 components and interfaces; Week 12 verification with the Week 2 and Week 3 measures; Week 13 the Week 3 trade study; Week 14 the roadmap and the review.',
              'The thread is the ID. The STK-005 in your register is the STK-005 in the model. If an ID changes on the way in, every later week loses its trace back to the stakeholder, so this week is careful about IDs.',
              'As in Phase I, each idea is shown on AeroLink first; then each team applies it to its own instructor-approved enterprise. No team models AeroLink.',
            ],
            why: 'Students need to see that nothing from Phase I is discarded and that the import is the first link of a seven-week chain; it explains why the week insists on IDs and completeness.',
            figure: 'Trace three arrows with your finger: Week 1 to Week 8 (highlighted), Week 2 to Week 9, Weeks 6 and 7 to Week 14. Then point at the ID thread under them.',
            misconceptions: [{ claim: 'The model replaces the Phase I documents, so they no longer matter.', correction: 'The documents are the source of the import; later, documents are generated from the model as views for reviews.' }],
            transition: 'To keep the 20 minutes in one place we need something that is not a document. What is a model, exactly?',
            timing: '3 min: 2 min the lanes, 1 min the ID thread.',
          },
        },
      ],
    },
    // ============================================================================================ B. what MBSE changes (14 min)
    {
      id: 'w8s1-mbse',
      title: 'What model-based systems engineering changes',
      slides: [
        {
          id: 'w8s1-what-model',
          title: 'What a model is',
          purpose: 'A precise, sourced definition of a model that later slides can test against: selective, chosen for concerns, related to the system by a mapping.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-three-models',
            caption: 'Three models of one aircraft, each selective: a physical mockup, a mathematical model and a logical model, chosen for different concerns. (AeroLink, FICTIONAL)',
            alt: 'In the center, a simple outline of an AeroLink air taxi. Around it, three panels joined to it by thin lines labeled mapping. Upper left: a small scale mockup on a stand, labeled physical model, with the concern: does the cabin fit four seats? Upper right: a short equation, range = speed × flight time, labeled mathematical model, with the concern: can it reach the next vertiport? Bottom: a box-and-line sketch, battery to motors to rotors, labeled logical model, with the concern: what fails if the battery fails? Each panel shows only part of the aircraft.',
          },
          body: [
            { kind: 'definition', term: 'Model (OMG, as listed by SEBoK)', text: '“a selective representation of some system whose form and content are chosen based on a specific set of concerns”', source: R('R33a', '290') },
            { kind: 'bullets', items: ['Related to the system by a mapping', 'Physical, mathematical or logical', 'One system usually needs many models'] },
          ],
          sources: [R('R33a', '290')],
          notes: {
            teach: [
              'SEBoK collects several definitions of a model; all of them call it a representation of selected aspects of something (R33a p.290). Read the one the course uses, from the OMG: a selective representation of some system whose form and content are chosen based on a specific set of concerns. SEBoK adds that the model is related to the system by an explicit or implicit mapping.',
              'Unpack two words. Selective: a model leaves things out on purpose. Concerns: what it keeps is decided by the questions someone needs answered. That is why SEBoK says many different models may be required to represent one system of interest.',
              'SEBoK also names three forms: physical, like a model airplane; mathematical, like flight trajectories; logical, like the chain from an engine failure to a loss of altitude. This course builds the third kind in SysML v2, and it will be selective too.',
            ],
            why: 'The definition is the test the rest of the week applies: if a model is chosen for concerns, a team must say which concerns its model serves, and the stakeholder concerns modeled this week are exactly those.',
            figure: 'Point at the aircraft, then at each panel in turn, reading the concern under it. Ask which panel would answer “can it reach the next vertiport”. Stress that no panel shows the whole aircraft, and none needs to.',
            misconceptions: [{ claim: 'A good model represents everything about the system.', correction: 'A model is selective by definition; a model that tries to show everything serves no concern well.' }],
            transition: 'An abstract model needs a language to be written in. What does a language give it?',
            timing: '3 min: 1 min the definition, 1 min the two words, 1 min the three forms and the figure.',
          },
        },
        {
          id: 'w8s1-language-tools',
          title: 'Modeling languages and tools',
          purpose: 'Separate the three parts of a modeling language and set up what a tool can and cannot check.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-syntax-semantics',
            caption: 'A modeling language has an abstract syntax, a concrete syntax and semantics. A tool checks conformance to the rules; whether the model means what you intend is a separate question.',
            alt: 'Three horizontal layers stacked on top of each other. Bottom layer: Abstract syntax, what may exist: constructs and the rules for combining them. Middle layer: Concrete syntax, how it is written: text, diagrams, tables. Top layer: Semantics, what it means. On the right, a tool icon labeled modeling tool with two solid check-mark arrows pointing at the bottom and middle layers, labeled conforms to the rules. A dashed arrow from the tool toward the top layer ends in a question mark, labeled means what you intend?',
          },
          body: [
            {
              kind: 'bullets',
              items: ['**Abstract syntax:** the constructs and the rules for building a model', '**Concrete syntax:** the symbols or text that express them', '**Semantics:** what the constructs mean', 'Tools check that a model conforms to the language’s rules'],
            },
          ],
          sources: [R('R33a', '291–292')],
          notes: {
            teach: [
              'SEBoK says abstract models rely on a modeling language, specified by syntax and semantics (R33a p.291). The abstract syntax gives the constructs and the rules for building a model; a well-formed model obeys those rules the way a well-formed sentence obeys grammar. The concrete syntax gives the symbols: a language can be written in graphical symbols, in text, or both. The semantics define what the constructs mean.',
              'Then the tool. SEBoK says a modeling tool typically checks whether the model conforms to the rules of the language, the way a word processor checks grammar (R33a pp.291–292).',
              'Draw the line the whole week depends on: a grammar checker accepts a sentence that is grammatical and false. A model can conform to every rule and still say something the team did not intend. Conformance is about syntax and rules; meaning is an engineering question.',
            ],
            why: 'The distinction between conformance and meaning is the basis for how the course grades models: validity is checked by a tool, structure and fidelity by people.',
            figure: 'Build the stack bottom up, then point at the two solid arrows from the tool and the dashed one ending in a question mark.',
            misconceptions: [{ claim: 'If the tool accepts the model, the model is right.', correction: 'The tool checks conformance to the language’s rules; it cannot check that the model says what the team means.' }],
            transition: 'Now the approach that puts such models at the center: MBSE.',
            timing: '3 min: 2 min the three parts, 1 min the tool and its limit.',
          },
        },
        {
          id: 'w8s1-mbse-vs-docs',
          title: 'MBSE versus a document-centric package',
          purpose: 'Define MBSE and contrast it with what the team delivered in Week 7; answer the first half of the driving question.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-docs-vs-model',
            caption: `Left: ${numberWord(N_PLACES)} documents kept in step by hand. Right: one model element that the dependent elements are related to. (AeroLink, FICTIONAL)`,
            alt: `Two panels. Left panel, titled document-centric: ${N_PLACES} document icons scattered, labeled ${placeIds}, joined by hand-drawn dashed double arrows labeled keep in step. Right panel, titled model-based: one central rounded node labeled chargeTimeToDispatch = 20 min, with ${N_PLACES - 1} solid lines radiating to small element nodes carrying the same IDs except the Data Sheet; each line is labeled with its relationship kind: states, computes or rests on.`,
          },
          body: [
            { kind: 'definition', term: 'MBSE (INCOSE, quoted by SEBoK)', text: '“the formalized application of modeling to support system requirements, design, analysis, verification, and validation activities”', source: R('R33a', '292') },
            { kind: 'bullets', items: ['Models are the primary, controlled artifacts', 'One repository as the single source of truth'] },
          ],
          sources: [R('R33a', '292'), R('R28', '370'), R('R27', '56')],
          notes: {
            teach: [
              'Read INCOSE’s definition as SEBoK quotes it: the formalized application of modeling to support requirements, design, analysis, verification and validation, from conceptual design onward (R33a p.292). SEBoK draws the contrast: in MBSE the models are primary artifacts, managed and controlled; in the traditional document-centric approach the documents are managed and controlled.',
              'SEBoK’s MBSE article adds that the model can serve as a single source of truth and technical baseline (R28 p.370), and the digital-engineering article speaks of authoritative sources of system data and models used across disciplines (R27 p.56).',
              'Answer the first half of the driving question. In a model the 20 minutes is one attribute, and the artifacts that depend on it are related to it. Finding them all becomes following relationships, not searching text: the 48 in A-007 is found because A-007 is related to the charge time, not because it contains the number.',
            ],
            why: 'Students need the definition and the contrast in their own Phase I terms, and the driving question shows the practical gain in one example.',
            figure: 'Left panel first: count the keep-in-step arrows with the class and ask who maintains them. Right panel: point at the central node and trace two lines, one labeled computes, one labeled rests on.',
            misconceptions: [{ claim: 'MBSE means drawing diagrams instead of writing documents.', correction: 'MBSE makes the model the controlled artifact; diagrams and documents become views of it.' }],
            transition: 'That sounds like pure gain. What does it cost?',
            timing: '3 min: 1 min definition, 1 min single source, 1 min the driving-question answer.',
          },
        },
        {
          id: 'w8s1-benefits-costs',
          title: 'What MBSE buys, and what it costs',
          purpose: 'Calibrated expectations: the benefits SEBoK names, the upkeep it requires, and the hybrid approach; the second half of the driving question.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-balance',
            caption: 'The benefits SEBoK names, weighed against the upkeep they depend on.',
            alt: 'A balance scale. The left pan holds three weights labeled inconsistencies surface while modeling, one source reduces miscommunication, easier to search and extract. The right pan holds three weights labeled regular model updates, learning the language and tool, model drift if neglected. Under the scale a caption reads benefits shrink when the model falls out of date. At the bottom right, a small document icon generated from a model icon by an arrow labeled hybrid: documents generated for milestones.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Inconsistencies surface while the model is built', 'One source: fewer miscommunications', 'Easier to search and extract', '**Cost:** an out-of-date model loses its benefits', 'Hybrid: documents generated from the model'],
            },
          ],
          sources: [R('R28', '373–374')],
          notes: {
            teach: [
              'SEBoK names three benefits. Because building a system model means reconciling information from many domains, inconsistencies and defects are readily identifiable during modeling. Because everyone uses the same source, miscommunications are reduced. And standardized formats make information easier to search for and extract than documents in different formats (R28 p.373).',
              'Now the cost, in SEBoK’s own words: the benefits are limited when the model falls out of date or becomes inaccurate, so regular updates are a minimum requirement (R28 p.373). Where stakeholders expect documents, a hybrid approach generates documents from the model for milestones (R28 p.374).',
              'Second half of the driving question. Following relationships tells you which artifacts depend on the 20 minutes. It does not recompute the 25, the 48 or DEC-001 for you. Recomputing needs the dependencies written as calculations or an analysis in the model, which is Week 13. Today’s model finds; it does not yet compute.',
            ],
            why: 'Students should leave with calibrated expectations, not advocacy: the model pays only if it is kept current, and a traced dependency is not an automatic recalculation.',
            figure: 'Read the left pan, then the right; point at the caption under the scale, then at the small hybrid arrow in the corner.',
            misconceptions: [{ claim: 'Once the model exists, a change propagates by itself.', correction: 'Relationships show what depends on a value; recomputing consequences needs calculations or analyses that the team builds.' }],
            transition: 'One more caution before we look at the language: a valid model is not a good design.',
            timing: '2 min: 1 min benefits, 1 min cost, hybrid and the driving question.',
          },
        },
        {
          id: 'w8s1-model-quality',
          title: 'Model quality is not design quality',
          purpose: 'Inoculate against “the model is valid, so the design is good”, and ask for the model’s purpose first.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-chair',
            caption: 'A precise, well-made model of a poor design is still a poor design.',
            alt: 'A clean technical drawing of a chair with dimension lines on every leg and on the seat, all neatly labeled, and a tick mark labeled model: precise. One leg is visibly shorter than the other three; a callout on it reads design: wobbles. Below the drawing, a box labeled root package doc: purpose, who uses the model and for which decisions.',
          },
          body: [
            { kind: 'callout', tone: 'key', text: '“The quality of a model should not be confused with the quality of the design that the model represents.”' },
            { kind: 'bullets', items: ['Define the model’s purpose first', 'Judge the model by how well it serves that purpose', 'Your root package states the purpose'] },
          ],
          sources: [R('R33b', '295–296')],
          notes: {
            teach: [
              'Read SEBoK’s sentence: the quality of a model should not be confused with the quality of the design it represents. SEBoK’s own example is a high-quality computer-aided design model of a chair that is a poor design (R33b p.296).',
              'SEBoK says one of the first principles of modeling is to define the purpose of the model, and that a model’s value is assessed by how effectively it supports that purpose (R33b pp.295–296). Course convention: your model’s root package begins with a documentation comment that states the purpose: who uses the model, and for which decisions.',
            ],
            why: 'Students will soon see a checker accept their file; this slide prevents them from reading that as approval of their engineering, and gives them the purpose statement the lab asks for.',
            figure: 'Point at the dimension lines, then at the short leg: precise drawing, poor chair. Then at the box below: the purpose statement in your own model.',
            transition: 'If one model holds the 20 minutes, where do the tables and diagrams you hand to reviewers come from?',
            timing: '2 min: 1 min the sentence and the chair, 1 min purpose first.',
          },
        },
      ],
    },
    // ============================================================================================ C. model and view (7 min)
    {
      id: 'w8s1-views',
      title: 'Model and view',
      slides: [
        {
          id: 'w8s1-model-view',
          title: 'Model versus view',
          purpose: 'The central idea of the week: diagrams, tables and text are renderings of one model, chosen for stakeholders’ concerns.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-model-views',
            caption: 'One model, several views: each view queries the model and renders the result for a stakeholder’s concern. (AeroLink, FICTIONAL)',
            alt: 'In the center, a cylinder labeled AeroLink model. Three arrows leave it, each labeled query + rendering. The first ends at a small table labeled stakeholder table view; the second at a box-and-line diagram labeled context diagram view; the third at a block of text lines labeled textual view. Beside each view stands a stakeholder figure with a speech label: beside the table, the review board: who holds which concern?; beside the diagram, the architect: what crosses the boundary?; beside the text, the modeler: what exactly is declared? A dashed outline around each stakeholder and its view is labeled viewpoint.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['A system model can have many views', '**Viewpoint:** the information a set of stakeholders needs', '**View:** a query of the model and a rendering of its results', 'Your context diagram and register become views, not separate files'],
            },
          ],
          sources: [R('R33c', '300'), R('R80', '48'), R('R85', '181')],
          notes: {
            teach: [
              'SEBoK says a system model may comprise multiple views, to support planning, requirements, design, analysis and verification (R33c p.300). The SysML v2.1 Beta 2 specification makes that precise: viewpoints specify information of interest to a set of stakeholders, and views specify a query of the model and a rendering of the query results, intended to satisfy a viewpoint (R80 p.48).',
              'Two more facts from the specification that matter later. A viewpoint definition is a kind of requirement definition that frames the concerns of stakeholders, and a view definition is a kind of part definition (R85 p.181). So the stakeholder concerns you model this week are what Week 14’s views will be built to address.',
              'Apply it to your package. Your Phase I context diagram, your stakeholder register table and your trace matrix were separate files that you kept in step by hand. In the model they become views: queries of one set of elements, rendered as a diagram, a table or text. Change the element and every view that shows it changes.',
              'Ask: if the review board wants a table of every stakeholder with influence 4 or higher, is that a new document or a view? It is a view, provided the model holds the ratings as data; Session 2 shows how.',
            ],
            why: 'Model versus view is the idea that dissolves the nine-places problem: there is one element and many renderings. It also explains why concerns, which viewpoints frame, are modeled first.',
            figure: 'Start at the cylinder, follow each query + rendering arrow to its view, then read the stakeholder’s question beside it. End on the dashed outline: a viewpoint pairs a stakeholder’s concern with what the view must show.',
            misconceptions: [
              { claim: 'Each diagram is its own model, kept beside the others.', correction: 'In SysML v2 a diagram is a rendering of a query of one model; editing the model changes every view that shows the element.' },
              { claim: 'A view is just a picture with no link to stakeholders.', correction: 'A view is intended to satisfy a viewpoint, which frames stakeholders’ concerns.' },
            ],
            transition: 'What is new in SysML v2 compared with the SysML you may have met?',
            timing: '4 min: 1 min SEBoK, 1 min the specification, 1 min your package as views, 1 min the board question.',
          },
        },
        {
          id: 'w8s1-notation',
          title: 'SysML v2: one model, textual and graphical notation',
          purpose: 'What is new relative to SysML v1, so students read older literature critically; one element in both notations; the course’s notation choice.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-two-notations',
            caption: 'The same part definition in the graphical and the textual notation, as the specification’s representative-notation table shows it.',
            alt: 'Two panels joined by a double arrow labeled same element. Left panel, titled graphical notation: a rectangle with the keyword «part def» in guillemets on the first line and PartDef1 on the second; below it a second rectangle with «part def» and <PD2> PartDef2. Right panel, titled textual notation: two code lines, part def PartDef1; and part def <PD2> PartDef2;. Under both panels, a strip of four short contrasts labeled SysML v1 to SysML v2: UML profile to own metamodel; nine diagram types to views and viewpoints; diagrams as the model to text, diagrams and tables as renderings; tool files to a standard API.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['A new metamodel, not constrained by UML', 'Grounded in formal semantics', 'Views: graphical, tabular, textual', 'A standard API for other tools', 'Course convention: write text; diagrams are views'],
            },
          ],
          sources: [R('R90', '7, 9'), R('R80', '66'), R('R28', '372')],
          notes: {
            teach: [
              'The graphical-notation deck lists the key elements of SysML v2: a new metamodel not constrained by UML; grounding in formal semantics; visualizations based on view and viewpoint specifications, graphical, tabular and textual; and a standardized API to access the model (R90 sl.7). The API lets other tools create, update, delete, query and navigate model elements (R90 sl.9).',
              'Show one element both ways. The specification’s representative-notation table gives the graphical symbol, a box with the keyword «part def» and the name, and the textual form, part def PartDef1 with a semicolon (R80 p.66). They are two notations for the same element.',
              'A caution for your reading: SEBoK’s MBSE article describes SysML as a graphical language with nine diagram types (R28 p.372). That describes SysML v1, not v2. Course convention: this course writes models in the textual notation, because a text file can be checked, compared and graded line by line, and treats diagrams as views of it.',
            ],
            why: 'Students will meet SysML v1 material everywhere; knowing what changed prevents them from importing v1 habits, and the notation choice explains why the lab produces text.',
            figure: 'Point at the box, then at the text line beside it: one element, two notations. Then read the four contrasts in the strip from left to right.',
            misconceptions: [{ claim: 'SysML v2 is SysML v1 with a text syntax added.', correction: 'It has its own metamodel, built on KerML rather than UML; the textual and graphical notations both express it.' }],
            transition: 'To write the model we need the language’s building blocks. Start with how the language itself is built.',
            timing: '2 min: 1 min key elements and the two notations, 1 min the v1 caution and the course choice.',
          },
        },
      ],
    },
    // ============================================================================================ D. language architecture (8 min)
    {
      id: 'w8s1-architecture',
      title: 'The language architecture',
      slides: [
        {
          id: 'w8s1-four-layers',
          title: 'Four layers: KerML under SysML',
          purpose: 'A map of the language students will use for seven weeks: Root, Core, Kernel and Systems, and which belong to KerML.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-four-layers',
            caption: 'The four-layer language architecture: KerML provides Root, Core and Kernel; SysML adds the Systems layer.',
            alt: 'A stack of four horizontal layers, bottom to top. Root: syntactic elements without model-level semantics, with example words element, comment, namespace, relationship, import, dependency. Core: fundamental semantic concepts with a direct mapping to formal logic, with example words type, classifier, feature, multiplicity, specialization. Kernel: the foundation for building modeling languages, with example words class, data type, behavior, function, metadata, package. Systems: the modeling language for systems engineering, with example words part, attribute, port, action, state, requirement, concern, view. A bracket on the right spans Root, Core and Kernel and is labeled KerML; a second bracket spans Systems and is labeled SysML.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['**Root:** syntax without model-level semantics: elements, namespaces, imports', '**Core:** type, feature, multiplicity; formal semantics', '**Kernel:** foundation for modeling languages; the package lives here', '**Systems:** SysML: parts, attributes, requirements, concerns …', 'Most SysML elements specialize KerML elements'],
            },
          ],
          sources: [R('R70', '3–4'), R('R90', '8'), R('R80', '47')],
          notes: {
            teach: [
              'The specification says SysML extends the Kernel Modeling Language, KerML; SysML directly uses some KerML elements, but most SysML elements are specializations of KerML elements (R80 p.47).',
              'Walk the four layers from the training deck (R70 sl.3–4; R90 sl.8). Root holds syntactic elements without model-level semantics: element, comment, documentation, namespace, relationship, membership, import, dependency. Core holds the fundamental semantic concepts, type, classifier, feature and multiplicity, with a direct semantic mapping to formal logic. Kernel is the foundation for building modeling languages, with class, data type, behavior, function, metadata, connector, the package, and a semantic library. Systems is SysML proper: the definition and usage of attributes, items, parts, ports, actions, states, constraints, requirements, concerns, cases and views, with domain libraries.',
              'Why you care. Namespaces and imports, which you write on Monday, are Root: they organize, they do not mean anything about the system. The package itself is listed under Kernel on the deck’s detailed layer slide (R70 sl.4), and KerML defines it in its Kernel clause, 7.4.14, as a namespace that groups elements without instance-level semantics; so it, too, says nothing about the system. If a student quotes the deck’s first architecture slide, which gives packaging as a Root example: the detailed slide and KerML place the package construct in Kernel, and that is the reading the course uses. Parts, attributes and concerns are Systems: they carry meaning. When Session 2 says a dependency between stakeholders is “just a relationship”, Root is the layer it lives in.',
              'The specification lists what SysML takes directly from KerML: elements and relationships, dependencies, annotations, namespaces and packages, and specialization (R80 p.47).',
            ],
            why: 'A map of the layers lets students place every construct they meet, and tells them which constructs organize the model and which describe the system.',
            figure: 'Build the stack from the bottom, reading the example words of each layer; finish on the two brackets: three layers of KerML, one of SysML.',
            misconceptions: [{ claim: 'KerML is a separate language you must learn before SysML.', correction: 'SysML is built on KerML; you use KerML’s constructs, such as packages and specialization, directly inside SysML.' }],
            transition: 'Every layer rests on one structure: elements, relationships and ownership.',
            timing: '4 min: 1 min KerML and SysML, 2 min the layers, 1 min why it matters.',
          },
        },
        {
          id: 'w8s1-ownership',
          title: 'Elements, relationships, ownership',
          purpose: 'The graph underneath every listing: ownership forms a tree, deleting cascades, and the tool’s element ID is not the name.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-ownership-tree',
            caption: 'Ownership forms a tree: deleting an element deletes its whole subtree. A relationship can also link elements in different branches.',
            alt: 'A small ownership tree drawn top down: a package node labeled package Stakeholders at the top, owning two nodes, part def STK-005 and concern CON-006; the part def owns a node labeled metadata annotation. A dashed line crosses between the branches from CON-006 to STK-005, labeled relationship: stakeholder typed by STK-005. A delete mark (an X in a circle) sits on the concern node, and its subtree is greyed and hatched, labeled deleted with it. A small tag at the corner reads element ID: managed by the tool; name and short name: written in the text.',
          },
          body: [
            { kind: 'bullets', items: ['Elements; some elements are relationships', 'Ownership is a tree: delete an element, delete its subtree', 'The tool manages the element ID; you write a name and a short name'] },
          ],
          sources: [R('R80', '48–49')],
          notes: {
            teach: [
              'The specification describes a model as elements, some of which are relationships between other elements (R80 pp.48–49). Ownership forms a tree: if an element is deleted, its owned relationships and owned elements are deleted too, and the deletion cascades through the whole subtree (R80 p.49).',
              'Every element also has an element ID that the tool manages and that never changes, but the textual notation cannot write it. In the text you give an element a name, a short name, or both (R80 p.49). Session 2 uses that short name to carry your Phase I IDs.',
            ],
            why: 'Students who see the tree understand why deleting a package deletes its contents, and why the course needs a written ID of its own.',
            figure: 'Trace the tree from the package down, then the dashed relationship across. Point at the delete mark and the hatched subtree, then at the tag about IDs.',
            transition: 'What kinds of element will your enterprise become? One answer surprises most students.',
            timing: '2 min: 1 min tree and cascade, 1 min element ID versus name.',
          },
        },
        {
          id: 'w8s1-everything-part',
          title: 'No “system” keyword: everything with structure and behavior is a part',
          purpose: 'Prevent the most common translation error from Phase I vocabulary.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-all-parts',
            caption: 'Phase I words for things with structure and behavior all become parts in SysML v2, at different places in a decomposition.',
            alt: 'On the left, a column of Phase I words in rounded labels: enterprise, system of interest, subsystem, component, external system. Each has an arrow to a single box on the right labeled part (part def and part usage). Beside each arrow, a small note gives where it sits: enterprise: a part definition in Context; system of interest: the part the context refers to; subsystem and component: parts inside it (Week 11); external system: a part usage in the context part.',
          },
          body: [
            { kind: 'bullets', items: ['No constructs called system, subsystem, assembly or component', 'An entity with structure and behavior is a **part**', 'Enterprise, service, vertiport, charger, external system: all parts'] },
          ],
          sources: [R('R80', '48')],
          notes: {
            teach: [
              'The specification says plainly that SysML does not contain language constructs called system, subsystem, assembly or component; an entity with structure and behavior is represented simply as a part (R80 p.48).',
              'So your Phase I words map to one construct. The enterprise is a part definition; the system of interest is a part; a vertiport and a charger are parts inside it; an external system in the context is a part too. What distinguishes them is where they sit, not a keyword. Course convention, previewed for Session 2: the enterprise becomes a part definition in the Context package and each external system a part usage inside the context part.',
            ],
            why: 'Students coming from SysML v1 or block diagrams look for a system keyword; telling them now prevents a whole class of syntax errors and keeps their decomposition in one construct.',
            figure: 'Read the left column top to bottom and follow every arrow to the one box, then read the placement notes.',
            misconceptions: [{ claim: 'External systems are a different kind of element from the system of interest.', correction: 'Both are parts; the context part owns the external systems and refers to the system of interest.' }],
            transition: 'One pattern runs through the whole Systems layer: definition and usage. Get it right now and every later week is easier.',
            timing: '2 min: 1 min the rule, 1 min the mapping.',
          },
        },
      ],
    },
    // ============================================================================================ E. definition and usage (20 min)
    {
      id: 'w8s1-definitions',
      title: 'Definition and usage',
      slides: [
        {
          id: 'w8s1-def-usage',
          title: 'The definition–usage pattern',
          purpose: 'The single most important SysML v2 concept: definitions classify, usages use a definition in a context; a usage is not an instance.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-def-usage-charger',
            caption: 'One definition, used in two contexts. The usages are roles in a context; the physical chargers are instances, which the model text does not list. (AeroLink, FICTIONAL)',
            alt: 'Three horizontal bands. Top band, labeled definition: one card reading part def Charger. Middle band, labeled usages: two context boxes side by side, hub vertiport and spoke vertiport, each containing a small card reading part chargers : Charger; solid arrows labeled defined by run from each card up to the definition card. Bottom band, labeled instances (not in the model text): several small charger icons under each context box, joined by thin dotted lines to the usage above, labeled plays the role.',
          },
          body: [
            { kind: 'bullets', items: ['A **definition** classifies a kind of element', 'A **usage** is a usage of a definition in a context', 'Every usage is defined by at least one definition', 'Parts, attributes, ports, actions, requirements, concerns …', 'A usage is a role, not an instance'] },
          ],
          sources: [R('R80', '63'), R('R90', '12')],
          notes: {
            teach: [
              'The specification: a definition element classifies a certain kind of element; a usage element is a usage of a definition element in a certain context. A usage must always be defined by at least one definition of its kind; if none is given, it is defined implicitly by the most general definition from the library, for a part usage the definition Part (R80 p.63).',
              'The pattern applies to attributes, items, parts, ports, connections, interfaces, allocations, actions, states, calculations, constraints, requirements, concerns, cases, views and more (R80 p.63). Learn it once and you have learned the shape of most of the language. The deck adds that one definition can be used in different contexts or several times in the same context (R90 sl.12).',
              'One warning that saves weeks of confusion: a usage is not an instance. The part usage chargers inside a hub is a role that real chargers play in that context. The model text never lists the physical chargers.',
            ],
            why: 'Definition and usage is the backbone of every later construct, including the concerns and requirements of Weeks 8 and 9; students who confuse usages with instances misread multiplicities and configurations.',
            figure: 'Top to bottom: the one definition, the two usages in their contexts with defined-by arrows up, the instances below joined by dotted lines labeled plays the role.',
            misconceptions: [{ claim: 'A part usage is one specific object, like serial number 0042.', correction: 'A usage is a feature: a role in a context that any number of instances, within its multiplicity, can play.' }],
            transition: 'The two definition kinds you write first are part definitions and attribute definitions.',
            timing: '3 min: 1 min definition and usage, 1 min the range of the pattern, 1 min usage is not an instance.',
          },
        },
        {
          id: 'w8s1-part-attribute',
          title: 'Part and attribute definitions; composite and referential',
          purpose: 'The two definition kinds the team uses first, and the composite/referential distinction.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-listing-vehicle-def',
            caption: 'Part and attribute definitions, quoted from the textual-notation training deck (slide 9).',
            alt: listingAlt('vehicle-def'),
          },
          body: [
            { kind: 'bullets', items: ['**Part definition:** systems or parts of systems, existing in space and time', '**Attribute definition:** data that describes them', 'part: composite; ref part: referential', 'Attributes are always referential'] },
          ],
          sources: [R('R70', '9'), R('R80', '64')],
          notes: {
            teach: [
              'Read the listing line by line. The deck says a part definition is a definition of a class of systems or parts of systems, which are mutable and exist in space and time; an attribute definition is a definition of attributive data used to describe systems or parts (R70 sl.9).',
              'Inside Vehicle: mass is an attribute usage; eng is a part usage, which the deck calls a composite feature; driver is a ref part, a referential feature. The deck adds that an attribute definition may not have composite features and that attribute usages are always referential (R70 sl.9).',
              'What composite means comes from the specification: a composite usage is integral to the structure of its container, so if the containing instance is destroyed, its composite parts are destroyed too; a referential usage is a simple reference. The example: a vehicle has a composite usage of its wheels but only a referential usage of the road it drives on (R80 p.64). Ask: is the driver destroyed with the vehicle? No, hence ref.',
            ],
            why: 'Part and attribute definitions are what the team writes first, and composite versus referential decides how the context part refers to the system of interest in Session 2.',
            figure: 'Point at each marked line in turn: mass, eng, driver, then the attribute definition below. Let students read the keyword before you name the kind.',
            misconceptions: [{ claim: 'An attribute definition can contain a part, like a status record holding a battery.', correction: 'An attribute definition may not have composite features; data describes parts, it does not contain them.' }],
            transition: 'Usages nested in a definition become its features, and features have multiplicities.',
            timing: '3 min: 1 min the two kinds, 1 min the three features, 1 min composite versus referential.',
          },
        },
        {
          id: 'w8s1-features-multiplicity',
          title: 'Features and multiplicity',
          purpose: 'How usages nested in a definition become features, and how to read multiplicity.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-listing-aircraft-usage',
            caption: 'The AeroLink configuration as usages: twelve aircraft, values bound with their units. (AeroLink, FICTIONAL; course SysML file)',
            alt: listingAlt('aircraft-usage'),
          },
          body: [
            { kind: 'bullets', items: ['Usages nested in a definition are its **features**', '[12]: exactly twelve; [4..8]: four to eight; [1..*]: one or more', 'Owned part usage without subsetting or redefinition: 1..1 by default', 'A package-level usage can be specialized in context'] },
          ],
          sources: [R('R80', '63–64, 73'), R('R70', '12')],
          notes: {
            teach: [
              'The specification: a definition may have owned usages nested in it, called its features; a feature relates each instance of its featuring definition to values, as a mass feature relates each vehicle to its mass (R80 p.63). A usage can also sit directly in a package; then it is a generic feature that can be specialized in specific contexts (R80 p.64).',
              'Multiplicity gives lower and upper bounds. A single bound means exactly that number, so 12 means twelve; 4..8 means four to eight; a star as upper bound means no upper limit; a lone star means zero or more (R80 pp.64, 73). The deck states that the default multiplicity for parts is 1..1 (R70 sl.12); the specification gives the precise rule: one-to-one is the default for an owned part usage without explicit subsetting or redefinition (R80 p.73).',
              'Read the AeroLink line: part, short name PHY-001, name aircraft, defined by EVTOLAircraft, multiplicity 12, the fleet size from the Data Sheet. Inside it, the seats and the cruise speed are bound for this configuration. Short names are Session 2’s topic; for now notice where the ID sits.',
            ],
            why: 'Students must read a multiplicity correctly before they can read subsetting and redefinition, and the AeroLink line previews the ID convention they will use.',
            figure: 'Point at the usage of the enterprise definition on line 1, the two bound attributes, then the aircraft line, reading it left to right: keyword, short name, name, definition, multiplicity.',
            misconceptions: [{ claim: 'A part with no multiplicity can have any number of values.', correction: 'An owned part usage without subsetting or redefinition defaults to exactly one.' }],
            transition: 'Definitions can be organized into taxonomies: specialization.',
            timing: '3 min: 1 min features, 1 min multiplicity, 1 min the AeroLink line.',
          },
        },
        {
          id: 'w8s1-specialization',
          title: 'Specialization',
          purpose: 'Taxonomies of definitions: :> after a definition, inheritance, abstract definitions.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-listing-charger-specialization',
            caption: 'An abstract charger and two specializations. (AeroLink, FICTIONAL; ratings are instructor values for this listing)',
            alt: listingAlt('charger-specialization'),
          },
          body: [
            { kind: 'bullets', items: ['A specialized definition classifies a subset of its general definition', 'It inherits the features and can add its own', ':> is the same as specializes', 'Abstract: every instance belongs to some specialization'] },
          ],
          sources: [R('R70', '10'), R('R80', '64, 72')],
          notes: {
            teach: [
              'The deck: a specialized definition defines a subset of the classification of its generalization; the symbol :> is equivalent to the keyword specializes; a definition can have several generalizations and inherits the features of all of them (R70 sl.10). The specification adds that the specialized definition inherits the features of the general one and can add its own (R80 p.64).',
              'An abstract definition is one whose instances must also be instances of some concrete specialization (R80 p.72). So abstract Charger says every AeroLink charger is a high-power or a standard charger. Each specialization redefines the inherited rated power and binds a value.',
            ],
            why: 'Specialization organizes stakeholder kinds and component kinds later in the course, and the :> symbol is about to reappear with a second meaning.',
            figure: 'Line 1: abstract. Lines 4 and 7: the :> after a definition name. Line 5: the inherited rating redefined with a value.',
            transition: 'Features can also be “among” other features: subsetting.',
            timing: '2 min: 1 min specialization and inheritance, 1 min abstract.',
          },
        },
        {
          id: 'w8s1-subsetting',
          title: 'Subsetting',
          purpose: 'Features whose values are among another feature’s values; the subsetting feature is additional.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-listing-vertiport-subsetting',
            caption: 'At a hub, two of the chargers are turnaround chargers; at a spoke, every charger is standard. (AeroLink, FICTIONAL)',
            alt: listingAlt('vertiport-subsetting'),
          },
          body: [
            { kind: 'bullets', items: ['Subsetting: the values of one feature are a subset of another’s', 'The subsetting feature may narrow type and multiplicity', 'It is an additional feature; the subsetted one remains'] },
            { kind: 'callout', tone: 'note', title: 'Think–pair (30 s)', text: 'A hub with chargers[4] and turnaroundChargers[2] subsets chargers: four chargers, or six?' },
          ],
          sources: [R('R70', '11'), R('R80', '64–65')],
          notes: {
            teach: [
              'The deck: subsetting asserts that, in any common context, the values of one feature are a subset of the values of another feature (R70 sl.11). The specification adds that the subsetting usage may further constrain its definition and multiplicity (R80 p.64), and that in general a subsetting usage is an additional feature to the subsetted usage (R80 p.65).',
              'Read line 6: in a hub vertiport, turnaroundChargers are HighPowerChargers, exactly two of them, and they are among the hub’s chargers.',
              'Run the think-pair: thirty seconds, then hands. The answer is four. The two turnaround chargers are two of the four chargers, not two more. Subsetting names a subset of values that already exist; it never adds instances.',
            ],
            why: 'Subsetting is how a model says “these are some of those” without duplicating them; the think-pair exposes the most common misreading before students write their own.',
            figure: 'Point at line 3, the chargers, one or more; then line 6, the subset of two. Leave line 9 for the next slide.',
            misconceptions: [{ claim: 'A subsetting feature adds values to the container.', correction: 'Its values are among the subsetted feature’s values; the hub still has four chargers in all.' }],
            transition: 'Line 9 does something stronger than subsetting. It replaces the feature.',
            timing: '3 min: 1 min the rule, 1 min line 6, 1 min think-pair.',
          },
        },
        {
          id: 'w8s1-redefinition',
          title: 'Redefinition',
          purpose: 'Replacing an inherited feature in context: name, type, multiplicity; :>> and the same-name shorthand. A preview: Week 9 practises it.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-listing-engine-redefinition',
            caption: 'Redefinition in the textual-notation training deck (slide 12): a new name and type, and a narrower multiplicity under the same name.',
            alt: listingAlt('engine-redefinition'),
          },
          body: [
            { kind: 'bullets', items: ['Redefinition is a kind of subsetting that **replaces** the redefined feature', 'Can change the name, specialize the type, constrain the multiplicity', ':>> is the same as redefines', 'Preview: you write redefinitions from Week 9'] },
          ],
          sources: [R('R80', '65'), R('R70', '12, 15')],
          notes: {
            teach: [
              'The specification: redefinition is a kind of subsetting, but where a subsetting usage is an additional feature, a redefining usage replaces the redefined usage in its context (R80 p.65). Its example is a truck that redefines fuel to be diesel fuel; the truck’s fuel must then be diesel.',
              'The deck shows the forms (R70 sl.12). Line 5: SmallVehicle redefines eng as smallEng, a new name and a more specific type. Line 8: the symbol :>> is the same as redefines. Line 14: the shorthand part redefines cyl with multiplicity 4 keeps the name and narrows four-to-six to exactly four. The deck notes that usages inherit from their definitions and can redefine to any level of nesting (R70 sl.15).',
              'Back to AeroLink, line 9 of the previous listing: at a spoke, chargers is redefined with type StandardCharger, so every charger at a spoke is standard. That is replacement, not a subset.',
            ],
            why: 'Redefinition is how configurations and specializations narrow inherited features; students who confuse it with subsetting double-count features. Today is a reading preview: Lab L8 does not use it, Week 9 practises it.',
            figure: 'Point at line 5, line 8, then line 14, naming the three forms; compare 4..6 on line 11 with 4 on line 14.',
            misconceptions: [{ claim: 'Redefining a feature keeps the original alongside the new one.', correction: 'The redefining feature replaces the redefined one in that context; there is one feature, not two.' }],
            transition: 'You have now seen :> twice with two meanings. That is the reading error students make most often.',
            timing: '2 min: 1 min the rule and the three forms, 1 min the AeroLink spoke.',
          },
        },
        {
          id: 'w8s1-one-symbol',
          title: 'One symbol, two meanings',
          purpose: 'After a definition, :> is specialization; after a usage, :> is subsetting and must name a feature.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-symbol-tree',
            caption: 'Read :> by asking what stands on its left: a definition or a usage.',
            alt: 'A decision tree. The root box asks: is the element on the left of :> a definition or a usage? Left branch, labeled definition (part def, attribute def …): a box reading specialization (specializes), with a second box below: on the right must stand a definition. Right branch, labeled usage (part, attribute …): a box reading subsetting (subsets), with a second box below: on the right must stand a usage (a feature). Under the right branch, a small card shows part hubs : HubVertiport[3] :> Vertiport; with a cross mark and the recorded checker message: Couldn’t resolve reference to Feature Vertiport. At the bottom, a strip shows the three usage forms side by side: : defined by, :> subsets, :>> redefines.',
          },
          body: [
            { kind: 'bullets', items: ['After a **definition**: :> means specializes', 'After a **usage**: :> means subsets: the right side must be a feature', 'A usage has three forms: : typing, :> subsetting, :>> redefinition'] },
            { kind: 'callout', tone: 'note', title: 'Predict (1 min)', text: 'part hubs : HubVertiport[3] :> Vertiport; — Vertiport is a part definition. Does the checker accept it?' },
          ],
          sources: [R('R80', '72')],
          notes: {
            teach: [
              'The specification declares definitions and usages differently. In a definition, owned subclassifications follow the keyword specializes or the symbol :>. In a usage there are three kinds of owned specialization: feature typing after defined by or the colon, subsetting after subsets or :>, and redefinition after redefines or :>> (R80 p.72). Its example: item x : A, B :> f :>> g is the same as item x defined by A defined by B subsets f redefines g.',
              'So the rule: look left. If a definition stands left of :>, it is specialization and a definition must stand on the right. If a usage stands left, it is subsetting and a usage must stand on the right.',
              'Run the prediction for one minute: hubs is a usage, Vertiport is a definition. Then reveal the recorded result from the course checker: FAIL, “Couldn’t resolve reference to Feature Vertiport”. The checker looked for a feature called Vertiport and found only a definition. The fix is a colon: hubs is defined by HubVertiport, or subsets an existing usage such as sites.',
            ],
            why: 'This is the reading error most students make in their first model, and the recorded checker result shows that the rule is enforced, not a style preference.',
            figure: 'Ask the root question aloud, take each branch, then point at the failed card and its message. End on the three forms in the strip.',
            misconceptions: [{ claim: ':> always means “is a kind of”.', correction: 'Only after a definition. After a usage it means subsets, and the right-hand side must be a feature.' }],
            transition: 'Before we go on, write one definition yourself.',
            timing: '3 min: 1 min the rule, 1 min the tree, 1 min the prediction and reveal.',
          },
        },
        {
          id: 'w8s1-write-check',
          title: 'Writing check: your first part definition',
          purpose: 'Turn the session’s reading skills into one written definition, in pairs, before the calibration: part and attribute usages, composite versus referential, multiplicity.',
          minutes: 2,
          layout: 'bullets',
          body: [
            { kind: 'callout', tone: 'note', title: 'Pairs, 2 minutes, on paper', text: 'A bakery owns two to four ovens and works with one flour supplier that it does not own. Each oven has a capacity, a whole number. Write the part definitions.' },
            { kind: 'bullets', items: ['Which keyword for the ovens, which for the supplier?', 'Where does the multiplicity go?', 'What type does the capacity have?'] },
          ],
          sources: [R('R70', '9'), R('R80', '64')],
          notes: {
            teach: [
              'Pairs write on paper for ninety seconds; no laptops. Walk the room and look for two errors: the supplier written as a composite part, and the multiplicity written on the definition instead of on the usage.',
              'Then give the model answer, from a course file the checker accepted: part def Oven with attribute capacity typed Natural; part def Supplier; part def Bakery owning part ovens of type Oven with multiplicity two to four, and ref part supplier of type Supplier. Ask one pair why the supplier is ref: the bakery does not own its supplier, and if the bakery closes the supplier goes on, the composite-versus-referential rule of slide 15. The file also imports ScalarValues privately, because Natural comes from that library.',
              'Say that this is the only SysML they write today; Session 2 writes the first lines of their own model.',
            ],
            why: 'A short production task exposes misreadings that silent reading hides, and it rehearses exactly the constructs Lab L8 uses first: part definitions, composite and referential parts, multiplicity.',
            examples: ['Model answer (checked: PASS, no message): sysml/lectures/week08/writing_check_bakery.sysml.'],
            misconceptions: [{ claim: 'The supplier works with the bakery, so it is a part of the bakery.', correction: 'A part usage is composite: destroyed with its container. The supplier is only referred to, so it is a ref part.' }],
            transition: 'Parts carry quantities: speeds, powers, durations. SysML v2 treats units more carefully than a spreadsheet does.',
            timing: '2 min: 1.5 min pairs write, 30 s the model answer.',
          },
        },
      ],
    },
    // ============================================================================================ F. attributes and a worked configuration (7 min)
    {
      id: 'w8s1-attributes',
      title: 'Attributes, units and a worked configuration',
      slides: [
        {
          id: 'w8s1-units',
          title: 'Attributes and quantities with units',
          purpose: 'Typed quantities, the basis for every later analysis: the kind of unit belongs to the definition, the unit to the value.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-listing-aircraft-def',
            caption: 'The aircraft definition declares quantity kinds; the usage on the earlier slide gave the values with their units. (AeroLink, FICTIONAL; course SysML file)',
            alt: listingAlt('aircraft-def'),
          },
          body: [
            { kind: 'bullets', items: ['An attribute definition defines a set of data values', 'Quantities use the Quantities and Units library', 'The definition fixes the **kind** of unit', 'The specific unit comes with the value: 150 [km/h]'] },
          ],
          sources: [R('R80', '77'), R('R79', '164, 167')],
          notes: {
            teach: [
              'The specification: an attribute definition defines a set of data values, such as numbers, quantities with units, text strings, or structures of them (R80 p.77). Quantities with units are defined with the Quantities and Units domain library, and the principle is that only the kind of unit is associated with the attribute definition, while a specific unit is given only with an actual value. That allows conversion between units of the same kind (R80 p.77).',
              'The deck shows the library: a quantity is a usage of a quantity value representing a feature of something (R79 sl.164), and the ISQ package gives the standard quantity kinds, such as length (R79 sl.167).',
              'Read the listing: cruiseSpeed is a SpeedValue, which fixes the kind, speed, and no unit. The usage two slides back bound it to 150 with the unit kilometers per hour. Twelve aircraft is a count, so the seats are a Natural, not a quantity.',
            ],
            why: 'Every analysis in Week 13 depends on quantities whose units are explicit; a model that stores bare numbers cannot be checked for unit errors.',
            figure: 'Point at line 3, SpeedValue, and say: no unit here. Then recall the usage slide where the value came with km/h.',
            misconceptions: [{ claim: 'The attribute definition must say the unit, such as minutes.', correction: 'It fixes the kind (a duration); 20 [min] and 1200 [s] are both acceptable values of the same attribute.' }],
            transition: 'Now all of Section E in one AeroLink listing, with the Phase I trade decision expressed as a configuration.',
            timing: '2 min: 1 min attribute definitions and kind versus unit, 1 min the listing.',
          },
        },
        {
          id: 'w8s1-worked-network',
          title: 'Worked example: definitions describe kinds; usages describe configurations',
          purpose: 'Apply definition, usage, specialization, subsetting and redefinition to one AeroLink fragment, and express the Phase I trade decision as a configuration.',
          minutes: 4,
          layout: 'worked-example',
          figure: {
            id: 'w8s1-listing-network-configurations',
            caption: 'The vertiport network as definitions and two sibling configurations: the baseline and the recommended alternative. (AeroLink, FICTIONAL; course SysML file)',
            alt: listingAlt('network-configurations'),
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Kinds', text: 'Which lines define kinds of thing?' },
                { label: 'Among', text: 'Which features are among other features?' },
                { label: 'Configurations', text: 'How do the baseline and the alternative differ, and what do they share?' },
                { label: 'Classify', text: 'Two tokens: is :> on line 9 subsetting or specialization? What does part redefines sites[6] do?' },
              ],
            },
          ],
          sources: [R('R80', '65'), R('R70', '15–16')],
          notes: {
            teach: [
              'Give the class one minute to read the listing silently. Then work the four steps aloud, asking for each answer before giving it. Say that this is a preview: the goal today is to read it; Week 9 is where you write configurations yourself.',
              'Close with the course rule of thumb, labeled as a course convention: a value that defines a kind goes in the definition, like the charger ratings; a value that describes one configuration goes in a usage, like how many hubs a network has.',
            ],
            workedSolution: [
              'Kinds: lines 1 to 5 define VertiportNetwork, a kind of network with sites, hubs and spokes, together with the vertiport and charger definitions you saw earlier.',
              'Among: hubs and spokes subset sites (lines 3 and 4): every hub is a site, every spoke is a site.',
              'Configurations: vertiportNetwork on line 7 is a package-level usage. baselineNetwork and alt004Network both subset it and redefine the multiplicities: six sites, three hubs and three spokes in the baseline; six, four and two in the alternative the trade study recommended. They are siblings. Neither edits the definitions, which is the specification’s point: subsetting a usage is like specializing a definition, and the original stays unchanged while each subsetting usage is a design configuration (R80 p.65; R70 sl.16).',
              'Classify, whole class, two tokens only: :> on line 9 stands after a usage, baselineNetwork, so it is subsetting, not specialization; part redefines sites[6] on line 11 replaces the inherited sites with exactly six. The lesson lists the other marked tokens for self-study.',
            ],
            why: 'A worked example that puts every relationship of the section into one familiar decision consolidates the reading skills before students write their own, and shows a Phase I trade decision becoming a model element.',
            figure: 'Point at the definitions block, then the package-level usage on line 7, then the two configurations, reading their counts side by side.',
            misconceptions: [{ claim: 'To model the alternative, edit the network definition.', correction: 'Each alternative is a usage that subsets the same base usage and redefines its counts; the definition stays shared.' }],
            transition: 'You have read many listings today. Before you write your own, calibrate what the checker will and will not tell you.',
            timing: '4 min: 1 min silent reading, 2 min steps 1 to 3, 1 min the two tokens.',
          },
        },
      ],
    },
    // ============================================================================================ G. calibration and exit (5 min)
    {
      id: 'w8s1-calibration',
      title: 'Calibration and exit',
      slides: [
        {
          id: 'w8s1-predict-checker',
          title: 'Predict the checker',
          purpose: 'Separate validity from correctness before students rely on a tool: three listings, vote PASS or FAIL, reveal the recorded result.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-predict-cards',
            caption: 'Three listings and the results the course checker recorded for them. The third passed with a real modeling error.',
            alt: `Three cards side by side, each with a listing and a stamp that is revealed in sequence. Card 1: ${listingText('predict-block')} Stamp: ${predictBlock.recorded} Card 2: ${listingText('predict-duplicate')} Stamp: ${predictDup.recorded} Card 3: ${listingText('predict-attribute-part')} Stamp: ${predictAttr.recorded} Card 3 carries an extra label: PASS, but wrong.`,
          },
          body: [
            { kind: 'bullets', items: ['1 · block EVTOLAircraft { … }', '2 · two parts with the same short name', '3 · an attribute definition that owns a part'] },
            { kind: 'callout', tone: 'key', text: 'A PASS means the file parsed and no rule fired. Meaning is your responsibility.' },
          ],
          sources: [R('R70', '9'), R('R80', '77')],
          notes: {
            teach: [
              'Show one card at a time. For each, students vote PASS or FAIL by hand; then reveal the result the course checker recorded.',
              'Card 1, the SysML v1 keyword block: FAIL, a syntax error at the name, because block is not a SysML v2 keyword. Card 2, two parts given the same short name: PASS, with two warnings, “Duplicate of other owned member name”. A warning does not fail the file, but it is telling you something.',
              'Card 3, an attribute definition that owns a part: PASS, with no message at all. Yet the deck says an attribute definition may not have composite features (R70 sl.9), and the specification says nested features of an attribute definition must be referential (R80 p.77). The file is valid in the checker’s terms and wrong in the language’s.',
              'The teaching point, stated as plainly as possible: a PASS shows that the file parsed, every name resolved and no validation rule fired. It does not show that the model is correct, or that it says what your register says. That judgment is yours, and the rubric scores it separately.',
            ],
            why: 'Students are about to depend on a tool; calibrating it with recorded results prevents them from equating validity with correctness, and card 3 makes the point unforgettable.',
            figure: 'Reveal the stamps in order; pause on card 3 and read its extra label aloud.',
            misconceptions: [{ claim: 'Zero errors means the model is right.', correction: 'Zero errors means the file conforms to what the checker checks; card 3 passed with a modeling error.' }],
            transition: 'Now see the checker run for real.',
            timing: '3 min: 1 min per card, the teaching point on card 3.',
          },
        },
        {
          id: 'w8s1-checker-demo',
          title: 'Live demonstration: running the course checker',
          purpose: 'Tool navigation, shown rather than told: the command, the pass file, the fail file and one diagnostic read aloud, so that every team can install and run the checker before Session 2.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-checker-run',
            caption: 'The tool proof as the course checker prints it: the command, a PASS with no message, a FAIL with its diagnostics, and the summary (recorded course run).',
            alt: `A terminal window. The first line is the command: python -I scripts/check_sysml.py models/tool_proof_pass.sysml models/invalid_tool_proof_unquoted_id.sysml --report models/proof-report.json. The output follows, line by line: ${PROOF_OUTPUT.filter(Boolean).map((l) => l.trim()).join(' / ')}. Numbered callouts mark the tool line (release and kernel), the PASS line with no message under it, the ERROR line with its line and column, and the summary line.`,
          },
          body: [
            { kind: 'bullets', items: ['Command: python -I scripts/check_sysml.py, then your files', 'PASS: parsed, every name resolved, no rule fired', 'ERROR line:column message: go to that place; fix the first error first', 'Install guide: Laboratory page; one installation per team'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Switch to the terminal on the lecture laptop, where the checker is installed in the folder layout of the install guide. Type the command from the guide: python, the course script, then the two tool-proof files from the models folder. While it runs, say what it does: it starts one Java process, loads the SysML v2 standard library, about ten seconds, then parses and validates each file on its own.',
              'Read the first line: the tool, release 2026-08, kernel 0.62.0, the Java version. Then the pass file: PASS, expected PASS, OK, and no message under it. Then the fail file: FAIL, with ERROR at 9:12, mismatched input minus, expecting a closing angle bracket. Open the file at line 9, column 12 and point at the hyphen in the unquoted EXT-001: the checker read EXT as a name and stopped at the hyphen. The second error on the same line is a consequence of the first; fix the first and run again.',
              'Finish on the summary line, then open the install guide on the Laboratory page: one working installation per team by Session 2, normally the checker owner’s; a personal one is optional; the lab machines are the fallback. If the laptop cannot run it, walk the recorded output on the slide instead: it is the same text.',
            ],
            why: 'Tool navigation is part of this week’s brief; seeing the command run and one diagnostic read aloud is what lets students install and use the tool on their own before Session 2, instead of discovering it at the checkpoint.',
            figure: 'If you demonstrate live, show the slide only for the summary; otherwise walk the figure top to bottom: the command, the tool line, the PASS line, the FAIL line with its two errors, the summary.',
            misconceptions: [{ claim: 'The checker runs inside the course website.', correction: 'It runs on a computer with Java and Python; the lab tool in the app writes the model, and the checker decides whether the file is valid.' }],
            transition: 'Two quick questions to close, and what to do before Session 2.',
            timing: '3 min: 1 min the command and the run, 1 min the PASS and FAIL lines, 1 min the install guide.',
          },
        },
        {
          id: 'w8s1-exit',
          title: 'Exit and preparation for Session 2',
          purpose: 'Retrieval of the two central ideas and readiness for Session 2: the tool proof.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s1-exit-ticket',
            caption: 'The exit ticket, and what to do before Session 2: one checker installation per team, and the tool proof every member runs.',
            alt: 'On the left, a ticket card with two numbered lines to complete: 1, one place your Week 7 package repeats a value; 2, in part x : A :> y;, what is y? On the right, a checklist titled before Session 2 with three items, each with an empty check box: install the checker from the guide on the Laboratory page, one per team, your own optional; run both tool-proof files, PASS then FAIL at line 9; bring your Week 7 package’s list of ID kinds.',
          },
          body: [
            { kind: 'bullets', items: ['Ticket 1: one place your Week 7 package repeats a value', 'Ticket 2: in part x : A :> y; what is y?', 'Before Session 2: one checker installation per team (install guide, Laboratory page)', 'Each member: run the two tool-proof files', 'Bring the list of ID kinds in your package'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Ask everyone to write the two lines on a card. Model answers. Question 1: any value stated in one artifact and used in another, as the charge time was for AeroLink. Question 2: y is a usage, a feature, because :> after the usage x means subsetting; if y were a definition the checker would fail to resolve it, as on slide 20.',
              'Then the preparation, which is not optional. Before Session 2, each team gets one working installation of the course checker by following the install guide on the Week 8 Laboratory page: the checker owner installs it, in about an hour; anyone else may install it too, but need not. Then each member runs the two tool-proof files from the guide on any working installation: the pass file should report PASS with no message, and the fail file should fail at line 9, at the unquoted short name. Keep both outputs; they open your team’s checker log. A team that cannot get it working tells the instructor before class so that a lab machine can be arranged.',
              'Finally, bring a list of every ID kind in your Week 7 package. Session 2 maps each kind to the model.',
            ],
            why: 'Retrieval at the end of the session strengthens the two ideas Session 2 builds on, and one installation per team plus the tool proof ensure that no team loses lab time to installation problems.',
            figure: 'Point at the two ticket lines, then at each box of the checklist.',
            transition: 'End of Session 1. Session 2 starts by reading a listing you have never seen.',
            timing: '2 min: 1 min ticket, 1 min preparation.',
          },
        },
        {
          id: 'w8s1-references',
          title: 'References and credits',
          purpose: 'List every source the session cites, with the license statements the sources require.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while students write the exit ticket. The list is generated from every citation in the session; the credits include the attribution the training deck’s license and SEBoK require.'],
            why: 'Students should be able to find every source the session relied on, and the sources’ licenses require the attribution wherever their text is used.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the exit activity.',
          },
        },
      ],
    },
  ],
  studentLesson: [
    {
      id: 'w8s1-l-why-model',
      title: 'Why Phase II builds a model',
      sources: [R('R33a', '290–292'), R('R28', '370, 373–374'), R('R27', '56'), R('R33b', '295–296')],
      blocks: [
        { kind: 'para', text: 'Phase I ended with a Systems Thinking Engineering Package: a set of documents, tables and diagrams that together describe your enterprise, its stakeholders, its needs and requirements, its architecture and its roadmap. Phase II rebuilds the same enterprise as one SysML v2 model, one week of the package at a time, and Week 14 presents that model. This week does two things: it introduces model-based systems engineering and the language, and it imports the package, starting with the Week 1 register of stakeholders and concerns.' },
        { kind: 'figure', slide: 'w8s1-title' },
        { kind: 'heading', text: 'The problem a document set cannot solve' },
        { kind: 'para', text: `Take one number from AeroLink, the instructor’s fictional case: the 20-minute charge to the dispatch threshold. It appears in ${numberWord(N_PLACES)} artifacts of the Phase I package. Some state it (the Data Sheet, the system requirement REQ-SYS-001, the charging scenario, the measure of performance). Some compute from it: the 25-minute turnaround in REQ-STK-005 is the charge plus five minutes of pad work, and the assumption A-007 turns it into 48 charges per charger per day. Some rest a conclusion on it: the technology assessment and the trade-study decision DEC-001, whose capacity figure counts chargers times 48. Suppose the supplier now says 24 minutes. A text search for “20” finds the first group and misses the rest, because 25, 48 and a recommendation do not contain the number they depend on.` },
        { kind: 'figure', slide: 'w8s1-driving-question' },
        { kind: 'heading', text: 'What a model is' },
        { kind: 'para', text: 'SEBoK collects several definitions of a model. The one this course uses comes from the OMG: a model is a selective representation of some system whose form and content are chosen based on a specific set of concerns, related to the system by an explicit or implicit mapping. Two words carry the weight. A model is selective: it leaves things out on purpose. And what it keeps is chosen for concerns: the questions some stakeholder needs answered. That is why SEBoK says that many different models may be required for one system of interest, in physical, mathematical or logical form.' },
        { kind: 'para', text: 'Abstract models rely on a modeling language. SEBoK separates three parts of such a language: the abstract syntax (the constructs and the rules for combining them), the concrete syntax (the symbols or text that express them) and the semantics (what they mean). A modeling tool typically checks that a model conforms to the language’s rules, the way a word processor checks grammar. Keep the analogy: a grammatical sentence can still be false.' },
        { kind: 'figure', slide: 'w8s1-language-tools' },
        { kind: 'heading', text: 'What MBSE changes' },
        { kind: 'para', text: 'SEBoK quotes INCOSE’s definition of model-based systems engineering: the formalized application of modeling to support system requirements, design, analysis, verification and validation, from conceptual design onward. In MBSE the models are the primary artifacts, managed and controlled; in the traditional document-centric approach, the documents are. SEBoK describes the model as a centralized repository that can serve as a single source of truth, and digital engineering speaks of authoritative sources of system data and models used across disciplines.' },
        { kind: 'para', text: 'Back to the 20 minutes. In a model the charge time is one attribute, and every artifact that depends on it is related to it. Finding the dependents is no longer a text search; it is following relationships. That is the first half of the answer. The second half is a caution: following relationships tells you what depends on the value; it does not recompute 25, 48 or the trade decision. Recomputing needs the dependencies written as calculations or analyses, which the course builds in Week 13.' },
        { kind: 'figure', slide: 'w8s1-mbse-vs-docs' },
        { kind: 'para', text: 'SEBoK names the benefits: inconsistencies and defects surface while the model is built, because building it forces information from many sources to be reconciled; everyone uses the same source, so miscommunications are reduced; and standardized information is easier to search and extract. It also names the cost: the benefits are limited when the model falls out of date, so regular updates are a minimum requirement. Where stakeholders expect documents, a hybrid approach generates them from the model for milestones.' },
        { kind: 'para', text: 'The hybrid approach is the one this course follows. Your Phase I documents are the source of the import; from Week 8 on, the model is the controlled artifact; and for each review, the documents and tables a reviewer needs are produced from the model rather than maintained beside it.' },
        { kind: 'heading', text: 'A valid model is not a good design' },
        { kind: 'para', text: 'SEBoK warns that the quality of a model should not be confused with the quality of the design it represents: a precise, well-made model of a chair can describe a chair that wobbles. In this course’s words, the quality of a model is not the quality of the design. A model is judged by how well it serves its purpose, so the purpose comes first. Course convention: your model’s root package begins with a documentation comment that states who uses the model and for which decisions.' },
        { kind: 'slide-ref', slide: 'w8s1-model-quality', text: 'See the slide on model quality.' },
        { kind: 'heading', text: 'What this means for your team' },
        { kind: 'para', text: 'Three consequences follow for the work of the next seven weeks. First, your model is selective too: it is built for the concerns of your stakeholders, which is why the first content you model is the Week 1 register of stakeholders and concerns. Second, your IDs are the thread between the documents you delivered and the model you are building: an artifact that changes its ID on the way in loses its trace back to the stakeholder who motivated it. Third, the model is worth keeping only if it is kept current; a model that disagrees with the package is worse than no model, because reviewers will trust it. Weeks 9 to 13 each add one layer of the package to the model, and every layer is traced back to the concerns modeled now.' },
      ],
    },
    {
      id: 'w8s1-l-model-view',
      title: 'Model and view; the notations',
      sources: [R('R33c', '300'), R('R80', '48, 66'), R('R85', '181'), R('R90', '7, 9'), R('R28', '372')],
      blocks: [
        { kind: 'para', text: 'If one model holds the information, where do the tables and diagrams reviewers read come from? They are views. SEBoK says a system model may comprise multiple views. The SysML v2.1 Beta 2 specification makes the idea precise: a viewpoint specifies information of interest to a set of stakeholders, and a view specifies a query of the model and a rendering of the query results, intended to satisfy a viewpoint. A viewpoint definition is a kind of requirement definition that frames the concerns of stakeholders. So a view is not a separate document kept beside the model; it is a question asked of the model, answered as a table, a diagram or text.' },
        { kind: 'figure', slide: 'w8s1-model-view' },
        { kind: 'para', text: 'This has a direct consequence for your package. Your context diagram, stakeholder register and trace matrix were separate files that you kept consistent by hand. In the model they become views of one set of elements. And because viewpoints frame stakeholders’ concerns, the concerns you model this week are what the stakeholder views of Week 14 will be built to address.' },
        { kind: 'heading', text: 'What is new in SysML v2' },
        { kind: 'para', text: 'The graphical-notation training deck lists the key elements of SysML v2: a new metamodel that is not constrained by UML; grounding in formal semantics; visualizations based on view and viewpoint specifications, in graphical, tabular and textual form; and a standardized API through which other tools can create, update, delete, query and navigate model elements. The specification’s representative-notation table shows one element in both notations: a box with the keyword «part def» and a name, and the text part def PartDef1 with a semicolon. They express the same element.' },
        { kind: 'figure', slide: 'w8s1-notation' },
        { kind: 'para', text: 'Views also explain how the course will review your model. In Week 14 the review board does not read your SysML text line by line; it reads views produced from it: a stakeholder table, a context diagram, a trace from each concern to the requirements and verification that answer it. If an element is missing from the model, it is missing from every view at once. That is a strength, because one correction fixes every rendering, and a discipline, because nothing outside the model will be shown.' },
        { kind: 'para', text: 'Read older sources with care. SEBoK’s MBSE article describes SysML as a graphical language with nine diagram types; that is SysML version 1. Course convention: this course writes models in the textual notation, because a text file can be checked, compared and graded line by line, and treats diagrams as views of the model.' },
      ],
    },
    {
      id: 'w8s1-l-language-architecture',
      title: 'How the language is built',
      sources: [R('R80', '47–49'), R('R70', '3–4'), R('R90', '8')],
      blocks: [
        { kind: 'para', text: 'SysML extends the Kernel Modeling Language, KerML. The specification says SysML uses some KerML elements directly, among them elements and relationships, dependencies, annotations, namespaces and packages, and specialization, while most SysML elements are specializations of KerML elements. The training deck draws four layers. The Root layer has no model-level semantics: it holds syntactic elements such as element, comment, namespace, relationship, import and dependency. The Core layer holds type, classifier, feature and multiplicity, with a direct semantic mapping to formal logic. The Kernel layer is the foundation for building modeling languages: class, data type, behavior, function, connector, the package and a semantic library. The Systems layer is SysML proper: definitions and usages of attributes, items, parts, ports, actions, states, constraints, requirements, concerns, cases and views, with domain libraries.' },
        { kind: 'figure', slide: 'w8s1-four-layers' },
        { kind: 'para', text: 'Why this matters to you: namespaces and imports, which you write first, are Root constructs; the package, which the deck’s detailed slide places in Kernel, adds no meaning either. All three organize the model and say nothing about the system; parts, attributes and concerns carry meaning. When a later slide calls a stakeholder relationship “a dependency”, it lives in the Root layer, which is why the course adds its own keyword to say what kind of relationship it is.' },
        { kind: 'para', text: 'Two of these constructs appear in every file you write. A namespace (Root) contains elements and names them, so that one element can refer to another by name. A package (Kernel) is a namespace used only to organize the model; it holds the definitions and usages, and it can import the members of other namespaces, such as the quantity libraries. Session 2 covers packages, imports and names in detail, because the way a model is divided into packages is how the Phase I package finds a home: one model package for each group of artifacts.' },
        { kind: 'heading', text: 'Elements, ownership and identity' },
        { kind: 'para', text: 'A model consists of elements, some of which are relationships between other elements. Ownership forms a tree: if an element is deleted, everything it owns is deleted too, and the deletion cascades through the subtree. Every element also has an element ID that the tool manages and that never changes, but the textual notation cannot write it; in the text an element gets a name, a short name, or both. Session 2 uses the short name to carry your Phase I IDs into the model.' },
        { kind: 'figure', slide: 'w8s1-ownership' },
        { kind: 'para', text: 'Finally, a fact that saves many first models: SysML has no constructs called system, subsystem, assembly or component. An entity with structure and behavior is simply a part. Your enterprise, your system of interest, the elements inside it and the external systems around it are all parts; what distinguishes them is where they sit in the model.' },
        { kind: 'slide-ref', slide: 'w8s1-everything-part', text: 'See the slide on parts.' },
        { kind: 'para', text: 'So do not look for a keyword for your enterprise or your external systems: each is a part definition, a part usage, or both. Session 2 shows the context pattern on AeroLink, and the lab tool generates it from your record.' },
      ],
    },
    {
      id: 'w8s1-l-definition-usage',
      title: 'Definition and usage',
      sources: [R('R80', '63–64, 73'), R('R70', '9, 12'), R('R90', '12')],
      blocks: [
        { kind: 'para', text: 'One pattern runs through the Systems layer. A definition classifies a kind of element; a usage is a usage of a definition in a context. The specification states the rule exactly: a usage is always defined by at least one definition of its kind, and if no definition is written, the usage is implicitly defined by the most general definition in the library, for a part usage the definition Part. The pattern applies to attributes, items, parts, ports, connections, interfaces, actions, states, calculations, constraints, requirements, concerns, cases and views. One definition can be used in several contexts, or several times in one context.' },
        { kind: 'figure', slide: 'w8s1-def-usage' },
        { kind: 'para', text: 'A usage is not an instance. The usage chargers inside a hub vertiport is a role that real chargers play in that context; the physical chargers are not listed anywhere in the model text. Reading usages as objects is the source of most multiplicity mistakes.' },
        { kind: 'heading', text: 'Part and attribute definitions' },
        { kind: 'para', text: 'The two definition kinds you write first are part definitions, for systems or parts of systems that exist in space and time, and attribute definitions, for data that describes them. Inside a part definition, a part usage is a composite feature: it is integral to the container, so destroying the container destroys it, as a vehicle’s wheels. A ref part is a referential feature, a simple reference, as the road a vehicle drives on. Attribute usages are always referential, and an attribute definition may not have composite features: data describes parts; it does not contain them.' },
        { kind: 'figure', slide: 'w8s1-part-attribute' },
        { kind: 'heading', text: 'Features and multiplicity' },
        { kind: 'para', text: 'Usages nested in a definition are its features; a feature relates each instance of the definition to values, as each aircraft to its cruise speed. A usage placed directly in a package is a generic feature that can be specialized in context. A multiplicity bounds the number of values: a single bound means exactly that many, a range gives a lower and an upper bound, and a star as upper bound means no limit. An owned part usage without subsetting or redefinition defaults to exactly one. In the AeroLink line part <\'PHY-001\'> aircraft : EVTOLAircraft[12], read from left to right: the keyword, the short name carrying the ID, the name, the definition and the multiplicity.' },
        { kind: 'figure', slide: 'w8s1-features-multiplicity' },
        { kind: 'heading', text: 'Why the pattern matters in Weeks 8 to 11' },
        { kind: 'para', text: 'You will use definition and usage every week of Phase II. This week, each stakeholder becomes a part definition, and each concern declares stakeholder parameters, which are part usages typed by those definitions. In Week 9, needs and requirements are requirement definitions and usages. In Week 10, actions and states follow the same pattern, and in Week 11 parts, ports and interfaces do. A team that keeps kinds in definitions and roles in usages can reuse one definition in many places, and can say exactly where a value belongs; a team that mixes them ends up copying definitions to change one number.' },
        { kind: 'para', text: 'In the training deck’s Vehicle listing, mass is an attribute usage, eng a composite part usage defined by Engine and driver a referential part usage defined by Person; VehicleStatus is an attribute definition holding only data.' },
      ],
    },
    {
      id: 'w8s1-l-specialization-subsetting-redefinition',
      title: 'Specialization, subsetting and redefinition',
      sources: [R('R70', '10–12, 15–16'), R('R80', '64–65, 72')],
      blocks: [
        { kind: 'para', text: 'Three relationships let a model reuse what it has already said. Specialization relates definitions: a specialized definition classifies a subset of what its general definition classifies, inherits its features and may add its own. The symbol :> is the same as the keyword specializes, and a definition may specialize several others. An abstract definition is one whose instances must also be instances of some concrete specialization: abstract Charger says that every AeroLink charger is a high-power or a standard one.' },
        { kind: 'figure', slide: 'w8s1-specialization' },
        { kind: 'para', text: 'Subsetting relates features: in any common context, the values of the subsetting feature are among the values of the subsetted one, and the subsetting feature may narrow the type and the multiplicity. In the specification’s words, a subsetting usage is an additional feature: the subsetted feature remains. A hub with four chargers, two of which are turnaround chargers, has four chargers, not six.' },
        { kind: 'figure', slide: 'w8s1-subsetting' },
        { kind: 'para', text: 'Redefinition is a kind of subsetting with one difference: a redefining usage replaces the redefined usage in its context. It can change the name, specialize the type and narrow the multiplicity; :>> is the same as redefines, and part redefines cyl[4] keeps the name. At an AeroLink spoke vertiport, chargers is redefined with the type StandardCharger, so every charger at a spoke is standard. Usages can redefine inherited features at any depth of nesting.' },
        { kind: 'figure', slide: 'w8s1-redefinition' },
        { kind: 'heading', text: 'One symbol, two meanings' },
        { kind: 'para', text: 'The symbol :> means different things depending on what stands on its left. After a definition it means specializes, and a definition must stand on its right. But after a usage, :> means subsetting, and a usage, a feature, must stand on its right. A usage has three forms of specialization: the colon for feature typing, :> for subsetting and :>> for redefinition. The course checker’s recorded result for part hubs : HubVertiport[3] :> Vertiport, where Vertiport is a definition, is a failure: it could not resolve a feature called Vertiport.' },
        { kind: 'figure', slide: 'w8s1-one-symbol' },
        { kind: 'para', text: 'A reliable reading habit avoids most of these errors. For every declaration, first ask whether it is a definition (its keyword ends in def) or a usage. Then read each symbol after the name in that light: a colon names the definitions of a usage; :> names a general definition when it follows a definition, and a feature among whose values these are when it follows a usage; :>> names the feature being replaced. Finally read the multiplicity, remembering that a subset never adds values and a redefinition never keeps the old feature beside the new one.' },
      ],
    },
    {
      id: 'w8s1-l-attributes-units',
      title: 'Attributes and units',
      sources: [R('R80', '77'), R('R79', '164, 167')],
      blocks: [
        { kind: 'para', text: 'An attribute definition defines a set of data values: numbers, quantities with units, text, or structures of them. Quantities with units come from the Quantities and Units domain library, whose ISQ package gives standard quantity kinds such as length, duration and speed. The principle that matters: only the kind of unit belongs to the attribute definition, and the specific unit is given with each value. An attribute typed DurationValue accepts 20 [min] and 1200 [s] alike, and a tool can convert between them.' },
        { kind: 'figure', slide: 'w8s1-units' },
        { kind: 'para', text: 'Definitions and usages divide the work again. The aircraft definition declares that every aircraft has a seat count, a cruise speed and a pad-edge noise level, and fixes only their kinds. The AeroLink configuration, a usage, binds the values: four seats, 150 [km/h], and a current noise estimate. Another configuration could bind different values without touching the definition. This is the same rule of thumb as in the worked example: kinds in definitions, configuration values in usages.' },
        { kind: 'para', text: 'Why this matters later: the analyses of Week 13 compute with these quantities, and a model that stores bare numbers cannot catch a unit error. A count, such as the number of seats or vertiports, is a natural number, not a quantity.' },
      ],
    },
    {
      id: 'w8s1-l-worked-network',
      title: 'Worked example: kinds and configurations',
      sources: [R('R80', '65'), R('R70', '15–16')],
      blocks: [
        { kind: 'para', text: 'The AeroLink vertiport network uses every relationship of this session in one listing. The definitions describe kinds: an abstract charger with two specializations whose ratings are bound in the definitions, a hub vertiport whose two turnaround chargers subset its chargers, a spoke vertiport that redefines its chargers as standard, and a network whose hubs and spokes subset its sites.' },
        { kind: 'figure', slide: 'w8s1-worked-network' },
        { kind: 'para', text: 'Read the definitions once more with the session’s vocabulary. Charger is abstract and specialized twice, so every charger is one of two kinds. Vertiport is abstract too; HubVertiport and SpokeVertiport specialize it and inherit its chargers. The hub adds a subset of its chargers; the spoke replaces its chargers with standard ones. Nothing in these definitions says how many vertiports AeroLink has: that is a fact about one network, not about vertiports in general.' },
        { kind: 'para', text: 'Then come the configurations. vertiportNetwork is a package-level usage. baselineNetwork and alt004Network both subset it and redefine its multiplicities: six sites, three hubs and three spokes in the baseline; six sites, four hubs and two spokes in the alternative the Phase I trade study recommended. They are siblings, and neither edits the definitions. The specification describes exactly this: subsetting a usage is analogous to specializing a definition, the original stays unchanged, and each subsetting usage is a distinct design configuration. Course convention, as a rule of thumb: a value that defines a kind goes in the definition; a value that describes one configuration goes in a usage.' },
        { kind: 'para', text: 'Why siblings rather than edits? Because the trade study of Phase I compared alternatives against the same definitions. If the alternative were modeled by editing the network definition, the baseline would disappear and the comparison with it. As sibling usages, both configurations stay in the model, both can be checked, and in Week 13 an analysis can evaluate each one against the same criteria. The Phase I decision record becomes a model fact: the recommended configuration is a named usage, not a sentence in a document.' },
        { kind: 'para', text: 'Classify the marked tokens yourself before checking: the colon in part vertiportNetwork : VertiportNetwork is feature typing; :> after baselineNetwork, a usage, is subsetting; part redefines sites[6] is redefinition; subsets in the hubs line is subsetting; :> after the definition HighPowerCharger is specialization.' },
      ],
    },
    {
      id: 'w8s1-l-checker-calibration',
      title: 'What the checker tells you, and what it cannot',
      sources: [R('R70', '9'), R('R80', '77'), R('R33a', '291–292')],
      blocks: [
        { kind: 'para', text: 'The course-designated checker parses each file, resolves every name against the file and the standard library, and runs its validation rules; an error fails the file, a warning does not. Three recorded results calibrate what that means. A listing that uses the SysML v1 keyword block fails with a syntax error. Two parts given the same short name pass with two warnings about duplicate names. And an attribute definition that owns a part passes with no message at all, although an attribute definition may not have composite features.' },
        { kind: 'figure', slide: 'w8s1-predict-checker' },
        { kind: 'para', text: 'So a PASS shows that the file parsed, every name resolved and no rule fired. It does not show that the model is right, or that it says what your register says. That is a semantic and engineering judgment, and the course scores it separately from validity. The same point appeared earlier in SEBoK’s terms: a tool checks conformance to the language’s rules, not the meaning you intend.' },
        { kind: 'para', text: 'Read every message the checker gives you, including warnings. A warning about duplicate names usually means two elements have been given the same ID or name by mistake. A syntax error often appears one or two tokens after the real mistake, so look at the start of the reported line and at the line before it. And when a file passes, ask the questions the checker cannot: is every definition used where a usage is needed, is every attribute data rather than a part, and does every element say what the register says? The course rubric scores validity and these structural questions as separate criteria.' },
        { kind: 'heading', text: 'Before Session 2' },
        { kind: 'para', text: 'Your team installs the course checker once, by the install guide on the Week 8 Laboratory page (a personal installation is optional), and each member runs the two tool-proof files from the guide: the pass file should report PASS with no message, and the fail file should fail at its unquoted short name. Keep both outputs for your team’s checker log, and bring the list of ID kinds in your Week 7 package. Session 2 organizes the model into packages, carries your IDs as short names, maps every artifact of your package to the model, and models your stakeholders and concerns.' },
        { kind: 'slide-ref', slide: 'w8s1-exit', text: 'See the exit and preparation slide.' },
      ],
    },
  ],
}
