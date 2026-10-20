// Week 4, Session 1 lecture: Architecture / Information View — architecture and its description (views, viewpoints,
// concerns, stakeholders), the functional architecture (functions, inputs and outputs, decomposition from scenarios and
// capabilities), logical and physical elements and allocation with criteria, one architecture decision and the enterprise
// view. 75-minute session: 69 minutes of planned content on 21 slides plus the generated "References and credits" slide,
// and a 6-minute buffer (bufferMinutes). Single source for the slide viewer, the faculty notes, the .pptx and the student
// lesson (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20 (teach first, explain in depth, demonstrate,
// then assign) and A21 (the Week 1 architecture is the template).
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week04/WEEK04_LECTURE_OUTLINE.md §2.
//
// Accuracy rules followed:
//   - Every citation is a verified register entry (readings.generated.json) at a page whose extracted text
//     (_source_cache/*.txt) supports the claim beside it. R39t–R39x (SEBoK glossary: architecture, architecture framework,
//     view, viewpoint, function), R48c (DoD Architecture Design Process) and R66 (MITRE Information and Data Management)
//     were added to the register for this week, pending faculty confirmation.
//   - Source gaps are named where they bite: ISO/IEC/IEEE 42010, the standard behind "concern", "viewpoint" and "view", is
//     cited by SEBoK and MITRE but is not in the collection; the two available wordings of "viewpoint" differ. The required
//     view set, the criterion sentence and the function naming rule are course conventions and are labeled as such.
//   - AeroLink Urban Mobility is FICTIONAL. Week 1, 2 and 3 data are imported read-only; Week 4 data come from
//     ./aerolinkCase.ts. Counts on the slides and in the notes are computed there, not typed here.
//   - Timing: spoken notes (teach, worked solution, figure walk) stay at or below 130 words per minute (./timing.test.ts).
//   - Faculty notes and purposes are stripped from the student build (student-edition.ts).
import type { Lecture } from '../types'
import { capability } from '../week02/aerolinkCase'
import { concern, numberWord, stakeholder } from '../week01/aerolinkCase'
import { ALTERNATIVES, DECISION as TRADE_DECISION } from '../week03/aerolinkCase'
import {
  AGREEMENTS, ARCH_DECISION, CAPABILITY_DISPOSITIONS, CONFIGURATION, COUNTS, FUNCTIONS, GROUPS, MISSION_FUNCTION, PHYSICAL, SCENARIO_WALKS, VIEWPOINTS,
  fn, functionsOfGroup, logical, onlyAnsweredBy, physical,
} from './aerolinkCase'
import { ALLOCATION_CRITERIA, REQUIRED_VIEW_KINDS, criterionLabel, viewKindLabel } from './labBrief'

export const WEEK4_S1_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const C = COUNTS
const Cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const f6 = fn('FN-006')
const f8 = fn('FN-008')
const f2 = fn('FN-002')
const f15 = fn('FN-015')
const f17 = fn('FN-017')
const walk1 = SCENARIO_WALKS[0]
const walk5 = SCENARIO_WALKS[1]
const alt = ALTERNATIVES.find((a) => a.id === TRADE_DECISION.recommended)!
const requiredKinds = REQUIRED_VIEW_KINDS.map((k) => viewKindLabel(k).toLowerCase())
const vp = (k: string) => VIEWPOINTS.find((v) => v.kind === k)!
const owned = (o: string) => PHYSICAL.filter((p) => p.owner === o).map((p) => p.id)
const infoOnly = onlyAnsweredBy(vp('information').id)
const logicalOnly = onlyAnsweredBy(vp('logical').id)
const infoOnlyNames = infoOnly.map((c) => concern(c).name.toLowerCase()).join(' and ')
const nConcerns = (k: number) => (k === 1 ? 'one concern' : `${numberWord(k)} concerns`)
const stepLabel = (x: { step: string }) => (x.step.startsWith('A') ? `alternate ${x.step}` : `step ${x.step}`)
const uniqueSteps = (k: number) => SCENARIO_WALKS[k].steps.filter((x, j, all) => all.findIndex((y) => y.step === x.step) === j).map((x) => `${stepLabel(x)}, ${x.short}`).join('; ')
const humanSteps = SCENARIO_WALKS.flatMap((w) => w.steps.filter((x) => x.human).map((x) => `${w.scenario} ${x.step === 'A3' ? 'alternate A3' : `step ${x.step}`}`))

export const WEEK4_SESSION1: Lecture = {
  week: 4,
  session: 1,
  title: 'Architecture / Information View',
  subtitle: 'Session 1: Views, functions and allocation',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. framing (7 min)
    {
      id: 'w4s1-framing',
      title: 'Framing: the first how',
      slides: [
        {
          id: 'w4s1-title',
          title: 'Architecture / Information View',
          subtitle: 'Session 1: Views, functions and allocation',
          purpose: 'Orient students to the scheduled subject, the two sessions and the four parts the week adds to the Team Record.',
          minutes: 1,
          layout: 'title',
          body: [
            {
              kind: 'bullets',
              items: ['Today: architecture and its description, functions, allocation', 'Session 2: the information view, evaluation and the Lab L4 launch', 'Your Team Record grows: views, functions, allocation, information view'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the subject exactly as the schedule gives it: Architecture and Information View. Make the promise: by the end of today you can say what an architecture is and how it differs from the documents that describe it, choose views from your stakeholders’ concerns rather than from a template, derive functions from your scenarios and capabilities, and allocate each function to an element with a stated reason.',
              'Say where the work lands: each team extends its Week 3 Team Record for its own approved enterprise. AeroLink stays the worked example; no team models AeroLink. Weeks 1 to 3 answered why, what and which option. Week 4 is the first how, kept at concept level.',
            ],
            why: 'Naming the four record parts at the start tells students which ideas they must use within seven days, and the why–what–which–how arc places the week in the course.',
            examples: [
              'Instructor preparation (not for students): decide before class the open items in the notes of slides 7, 12 and 15 (the required view set, the three proposed functions, the criterion sentence). Bring the Week 3 records: teams need their scenarios and requirements in Session 2.',
              'Timing plan: 69 minutes of content and a 6-minute buffer. If the session runs long, shorten slide 6 or slide 20; never shorten the scenario walk (slide 12) or the worked allocation (slide 17).',
            ],
            misconceptions: [{ claim: 'Architecture is the boxes-and-lines diagram the team draws at the end.', correction: 'The diagram is one view in a description. The architecture is the set of concepts, elements, relationships and principles the views describe, and it is decided long before it is drawn well.' }],
            transition: 'First, a question that the whole week answers.',
            timing: '1 min: 30 s subject and promise, 30 s the record parts.',
          },
        },
        {
          id: 'w4s1-driving-question',
          title: 'The driving question: who decides that an aircraft may fly?',
          purpose: 'Create a need to know before any explanation: the dispatch decision depends on information produced in three different places.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-driving-question',
            caption: 'Three pieces of information an AeroLink dispatch decision needs, each produced somewhere else. (FICTIONAL)',
            alt: 'An aircraft on a vertiport pad at the left. Three labels with question marks float from different places toward an operations-center console at the right: fault status, from a maintenance hangar; charge state, from a charger; and the forecast, from a weather source above. The console carries a release button.',
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Scenario (FICTIONAL)', text: 'An AeroLink aircraft is ready on a hub pad. A passenger party is boarding.' },
            { kind: 'bullets', items: ['Who makes the release decision?', 'Where is the fault status, the charge state and the forecast produced?', 'What carries each one to the decision?'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the scenario. Ask students to write, on a card, three things: who decides that this aircraft may fly; where the fault status, the charge state and the weather forecast are produced; and what carries each one to the person or system that decides. Give ninety seconds.',
              'Collect a few answers aloud without judging them. Expect three kinds of answer: “the pilot decides”, “the app decides”, and “the operations center decides”. Expect most students to leave the third question blank: they know the information exists but not how it travels.',
              'Do not resolve it. Say: by the end of Session 2 we will answer all three questions from AeroLink’s architecture description, and the answer will show one way an architecture can fail even when every element works.',
            ],
            why: 'A prediction made before instruction creates a need to know, and the blank third answer exposes the gap the information view fills: students think in elements, not in what passes between them.',
            figure: 'Point at the aircraft, then at each floating question mark in turn: the fault status from the hangar, the charge state from the charger, the forecast from above. All three arrows end at one console. The console is where the decision is made; the arrows are what this week is about.',
            examples: ['A hospital analogue: a surgeon decides to operate, but the blood results, the imaging report and the consent form are produced in three departments. If one does not arrive, the surgery is held, however good the surgeon is.'],
            misconceptions: [{ claim: 'The pilot decides whether the aircraft may fly.', correction: 'The pilot flies it. Release is a separate decision with its own inputs; in AeroLink it is a function with an interlock, and the pilot is one of the people it serves.' }],
            transition: 'Before the answer, where this week sits.',
            timing: '3 min: 30 s scenario, 1.5 min cards, 1 min answers aloud.',
          },
        },
        {
          id: 'w4s1-where',
          title: 'Where Week 4 sits: from requirements to the first how',
          purpose: 'Connect the week to its inputs (Weeks 1–3) and to what consumes it (Weeks 5, 6, 10 and 11).',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-where',
            caption: 'Week 4 takes the needs, requirements, scenarios and the trade decision, and feeds the interfaces, the roadmap and the Phase II models.',
            alt: 'A band of weekly boxes from left to right: Week 1 needs and concerns, Week 2 scenarios, capabilities and requirements, Week 3 decision, risks and TPMs, then a highlighted Week 4 architecture and information view. Arrows leave Week 4 to Week 5 components and interfaces, Week 6 evolution roadmap, Week 10 logical and behavioral model and Week 11 physical model.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['In: concerns, needs, scenarios, capabilities, requirements', 'In: the Week 3 decision, risks and TPMs', 'Requirements form the basis of architecture', 'Out: Week 5 interfaces, Week 6 roadmap, Weeks 10–11 models'],
            },
          ],
          sources: [R('R13', '557'), R('R13', '561')],
          notes: {
            teach: [
              'Start from SEBoK. System requirements form the basis of system architecture and design activities, and they are inputs to the architecture definition process (R13 p.557). But requirements are not finished first and then handed over: requirements definition is iterative and recursive, performed concurrently with architecture definition (R13 p.561). Expect your requirements to change this week; that is the process working, not failing.',
              `List the inputs. From Week 1: the stakeholders, their concerns and the needs. From Week 2: the scenarios, the capabilities and the requirements. From Week 3: the trade decision, the risks and the technical performance measures. For AeroLink the decision is concrete: ${alt.aircraft} aircraft and ${CONFIGURATION.hubs} hubs, so the physical view must hold exactly that.`,
              'Then the outputs. Week 5 breaks the physical view into components and defines every interface. Week 6 uses the enterprise view for the evolution roadmap. In Phase II, Week 10 models today’s functions and logical elements with Week 2’s scenarios, and Week 11 models the physical elements and allocations.',
            ],
            why: 'Students who see that four later weeks consume this week’s IDs keep those IDs stable and traceable, which is most of what makes Phase II possible.',
            figure: 'Walk the band left to right. Stop at the highlighted Week 4 box and trace the four arrows leaving it; each names the week that will read today’s work.',
            misconceptions: [{ claim: 'The requirements must be frozen before architecture starts.', correction: 'SEBoK says the two run concurrently (R13 p.561). Architecture work routinely exposes missing or wrong requirements; record the change and trace it.' }],
            transition: 'So, what exactly is an architecture?',
            timing: '3 min: 1 min SEBoK, 1 min inputs, 1 min outputs.',
          },
        },
      ],
    },
    // ============================================================================================ B. architecture and its description (17 min)
    {
      id: 'w4s1-description',
      title: 'Architecture and its description',
      slides: [
        {
          id: 'w4s1-architecture',
          title: 'What an architecture is',
          purpose: 'Separate the architecture (concepts, elements, relationships, principles) from the description of it.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-iceberg',
            caption: 'The description is what can be seen and reviewed; the architecture is the conception it describes.',
            alt: 'An iceberg. Above the waterline: architecture description, with three small items labeled views, tables, diagrams. Below the waterline, the larger part: architecture, with four labels: concepts, elements, relationships, principles of design and evolution.',
          },
          body: [
            { kind: 'definition', term: 'Architecture', text: 'Fundamental concepts or properties of a system in its environment embodied in its elements, relationships, and in the principles of its design and evolution', source: R('R39t', '1445') },
            { kind: 'bullets', items: ['Conceptual; realized through a description', 'A description justifies what it includes and excludes'] },
          ],
          sources: [R('R39t', '1445'), R('R19', '569')],
          notes: {
            teach: [
              'Read the definition slowly; it is the ISO/IEC/IEEE 15288 definition that SEBoK’s glossary records first (R39t p.1445). Four words carry it: concepts, elements, relationships, and principles of design and evolution. An architecture is not a picture; it is a set of decisions about what the parts are, how they relate, and the rules by which they will be changed.',
              'The same glossary entry adds two points you will use. The architecture of a system of interest is conceptual and is realized through an architectural description. And because “fundamental” has no universal definition, the level of detail depends on the purpose, so a description should justify what it includes and what it excludes (R39t p.1445).',
              'SEBoK’s architecture article gives the purpose in one line: the architecture ensures that the system elements operate together in the operating environment to satisfy stakeholder needs (R19 p.569). Underline “evolution” in the definition: the Week 6 roadmap is part of the architecture, not an appendix to it.',
            ],
            why: 'Students conflate the architecture with its drawings and then argue about notation instead of decisions. The definition gives them a test: does this diagram record a concept, an element, a relationship or a principle?',
            figure: 'Point above the waterline: views, tables and diagrams are what a reviewer sees. Then below: the concepts, elements, relationships and principles. A team can change every diagram without changing the architecture, and change the architecture by deciding something that no diagram shows yet.',
            misconceptions: [{ claim: 'If we have not drawn it, we have no architecture yet.', correction: 'Every system has an architecture, decided or accidental. The description makes it explicit so that it can be reviewed and evolved on purpose.' }],
            transition: 'If the architecture is conceptual, how is the description organized?',
            timing: '3 min: 1.5 min definition, 1 min glossary discussion, 30 s purpose and evolution.',
          },
        },
        {
          id: 'w4s1-description-model',
          title: 'How a description is organized, and why documents drift',
          purpose: 'Give the conceptual model behind views and models, and motivate one source of truth with stable IDs.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-description-model',
            caption: 'A system has an architecture; a description communicates it through views and models; a framework sets requirements for the description.',
            alt: 'Five boxes linked by labeled arrows. System has an architecture. Architecture is communicated by an architecture description. The description consists of views and of models. An architecture framework provides requirements for the description. A side panel shows three documents drawing one shared element three different ways, marked out of sync, beside one model feeding three views.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['A description consists of views and models', 'A framework sets requirements for the description', 'Separate documents need manual synchronization', 'A model can be one authoritative source of truth'],
            },
          ],
          sources: [R('R62', '342'), R('R19', '569'), R('R19', '570'), R('R20a', '582')],
          notes: {
            teach: [
              'MITRE draws the relationship, after IEEE 1471, the predecessor of ISO/IEC/IEEE 42010 (R62 p.342). A system has an architecture. The architecture is communicated by an architecture description. The description consists of views and models, plus non-model artifacts. An architecture framework provides requirements for developing the description. The figure is our own drawing of that relationship.',
              'Why the distinction matters in practice: SEBoK describes document-based practice, where design information is spread over documents with their own notation and no formal semantics, kept consistent by manual updating, with consistency, cost and schedule losses (R19 pp.569–570). A system design model instead provides an authoritative source of truth holding the requirement, functional, logical and physical representations (R19 p.570).',
              'One caution from SEBoK’s functional architecture article: a model of the architecture is not the architecture itself; it is a representation that may be incomplete or imperfect (R20a p.582). This week your description is still tables and diagrams. Organize it by view, with stable IDs, so that Week 10 can import it rather than retype it.',
            ],
            why: 'The conceptual model gives every later term a place, and the drift problem explains why the course insists on IDs and single sources from Week 1 onward.',
            figure: 'Read the chain of boxes: system, architecture, description, views and models, framework. Then the side panel: one element drawn three ways in three documents, one of them out of date, against one model feeding three views.',
            misconceptions: [{ claim: 'More documents mean a more complete architecture.', correction: 'More unsynchronized documents mean more places for the description to contradict itself. Completeness comes from covering the concerns, not from volume.' }],
            transition: 'Now the exact vocabulary: framework, model, view, viewpoint.',
            timing: '3 min: 1 min the relationship, 1 min drift and source of truth, 1 min model vs architecture.',
          },
        },
        {
          id: 'w4s1-vocabulary',
          title: 'Framework, model, view, viewpoint: the words, and a gap',
          purpose: 'Exact vocabulary from the two available sources, with the difference in wording and the missing standard named.',
          minutes: 4,
          layout: 'table',
          body: [
            {
              kind: 'table',
              header: ['Term', 'MITRE', 'SEBoK glossary'],
              rows: [
                ['Framework', 'Minimum practices and requirements for artifacts', 'Conventions and practices for describing architectures'],
                ['View', 'Partial expression from a perspective', 'Representation from a viewpoint’s perspective'],
                ['Viewpoint', 'Representations covering a stakeholder’s issues', 'Rules for constructing a view for stakeholder concerns'],
              ],
              caption: 'Paraphrased; the source wording is in the notes and the lesson.',
            },
          ],
          sources: [R('R62', '341'), R('R39u', '1446'), R('R39v', '1677'), R('R39w', '1678'), R('R20b', '593')],
          notes: {
            teach: [
              'MITRE’s definitions block (R62 p.341): an architecture framework is an encapsulation of a minimum set of practices and requirements for artifacts that describe a system’s architecture; models represent how objects fit structurally in and behave as part of the system; views are a partial expression of the system from a particular perspective; a viewpoint is a set of representations, views and models, of an architecture that covers a stakeholder’s issues.',
              'SEBoK’s glossary: an architecture framework is the conventions, principles and practices for the description of architectures established within a domain or community, after ISO/IEC/IEEE 42010, with DoDAF, MoDAF, TOGAF and Zachman as examples (R39u p.1446). A view is a representation of a system from the perspective of a viewpoint (R39v p.1677). A viewpoint is a specification of the conventions and rules for constructing and using a view for the purpose of addressing a set of stakeholder concerns (R39w p.1678); both entries come from OMG SysML 1.3, derived from IEEE 1471.',
              'Be honest about two things. First, the sources word “viewpoint” differently: MITRE calls it a set of representations, SEBoK calls it a specification of rules. This course uses SEBoK’s: the viewpoint is the rule, the view is what the rule produces for your system. Second, the standard both sources point to, ISO/IEC/IEEE 42010, which also defines “concern”, is not in our collection; SEBoK names it as the source of templates (R20b p.593). We work from the two definitions we hold and name the gap.',
            ],
            why: 'Precise words stop the commonest review argument, “is this a view or a viewpoint?”, and naming the missing standard models honest use of sources.',
            misconceptions: [
              { claim: 'View and viewpoint are synonyms.', correction: 'In the SEBoK wording the viewpoint is the specification (what to show, for whom, how); the view is the instance for one system. Many views can follow one viewpoint.' },
              { claim: 'Using a framework means producing all of its views.', correction: 'MITRE’s framework is a minimum set of practices; the views produced are chosen for a purpose, as the next slide shows.' },
            ],
            transition: 'If viewpoints address concerns, how do you choose them?',
            timing: '4 min: 1.5 min MITRE, 1.5 min SEBoK, 1 min the difference and the gap.',
          },
        },
        {
          id: 'w4s1-choosing-views',
          title: 'Choosing views: purpose is paramount',
          purpose: 'Views are chosen from stakeholder concerns for a stated purpose; the course minimum set acts as a framework.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-concern-chain',
            caption: 'From a stakeholder to the model elements a view shows, with one AeroLink example at every link. (FICTIONAL)',
            alt: 'A chain of five boxes: stakeholder, concern, viewpoint, view, model elements. Under each box an AeroLink example: communities; community noise; physical viewpoint; the vertiport and aircraft view; the pads and aircraft elements.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Views directly relevant to stakeholders’ concerns', 'Generate only the views the purpose needs', 'Each view helps a stakeholder conclude objectives will be met', `Course minimum: ${requiredKinds.join(', ')}`],
            },
          ],
          sources: [R('R62', '342'), R('R62', '344'), R('R04', '275'), R('R19', '573')],
          notes: {
            teach: [
              'MITRE: systems are multidimensional and have numerous stakeholders with different concerns, and architecture frameworks enable the creation of system views that are directly relevant to those concerns (R62 p.342). SEBoK’s View principle says the same at the level of systems thinking: multiple views, each based on a system aspect or concern, are essential to understand a complex system (R04 p.275). And SEBoK’s architecture article: the model includes multiple views with the information necessary to address each stakeholder’s viewpoint and concerns (R19 p.573).',
              'Then MITRE’s first lesson: purpose is paramount. Determine the purpose of the architecting effort and plan to generate only the views and models that meet it. Ultimately each view should help a stakeholder reason about the system so that they can conclude that their objectives will be met (R62 p.344). That last sentence is your test for every view you draw.',
              `MITRE adds that frameworks help by establishing minimum guidelines for each stakeholder’s interest, while stakeholders can have other concerns (R62 p.344). The course acts as that framework. Its minimum set is a course convention: the ${requiredKinds.slice(0, 3).join(', ')} and ${requiredKinds[4]} perspectives from the course document, plus the ${requiredKinds[3]} view the schedule requires. Each view still needs a purpose and the concerns it answers, and you add a view whenever a concern is left without one.`,
            ],
            why: 'Teams that collect views from a template produce diagrams nobody reads; teams that start from concerns produce views that answer a stakeholder’s question, and can say which concern is still unanswered.',
            figure: 'Walk the chain left to right with the AeroLink example: communities hold the concern about noise; the physical viewpoint is the rule that answers it; the AeroLink physical view is the instance; the pads and aircraft are the elements it shows.',
            misconceptions: [{ claim: 'The required set means our work is done once five views exist.', correction: 'The set is a minimum. The check is whether every concern of your Week 1 register is answered by some view, and whether each view states its purpose.' }],
            transition: 'Here is AeroLink’s view set, with the concern coverage computed.',
            timing: '4 min: 1.5 min concerns, 1.5 min purpose is paramount, 1 min the course minimum.',
          },
        },
        {
          id: 'w4s1-aerolink-views',
          title: 'AeroLink’s view set, chosen from concerns',
          purpose: 'Show a complete view set with purposes, and the concern coverage computed from the data.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-aerolink-views',
            caption: `Six viewpoints answer all ${C.concerns} Week 1 concerns; each states its purpose as a question. (FICTIONAL)`,
            alt: `Six cards in two rows, one per AeroLink viewpoint: ${VIEWPOINTS.map((v) => `${v.name}, answering ${v.concerns.join(', ')}`).join('; ')}. A bar at the bottom reads ${C.concernsCovered} of ${C.concerns} concerns answered.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [`${C.viewpoints} viewpoints, each with a question`, `${C.concernsCovered} of ${C.concerns} Week 1 concerns answered`, 'Logical view added: supplier choice stays open', `Drop the information view: ${nConcerns(infoOnly.length)} left without one`],
            },
          ],
          sources: [R('R62', '344')],
          notes: {
            teach: [
              `AeroLink chose ${numberWord(C.viewpoints)} viewpoints: the five of the course minimum and a logical viewpoint. Read two purposes aloud. Operational: “${vp('operational').purpose}” Information: “${vp('information').purpose}” Each purpose is a question a stakeholder would ask, which is MITRE’s test (R62 p.344).`,
              `Now the coverage, computed from the case data: every one of the ${C.concerns} concerns in the Week 1 register is answered by at least one viewpoint. Some are answered by two: ${concern('CON-006').name.toLowerCase()}, the vertiport operators’ concern, appears in both the physical and the enterprise viewpoints, because it is about chargers and about who owns them.`,
              `Two choices to defend. The logical viewpoint is not there for coverage: delete it and ${logicalOnly.length ? nConcerns(logicalOnly.length) : 'no concern'} loses its view, because the investors’ ${concern('CON-005').name.toLowerCase()} is also answered by the enterprise view. It is added for what it keeps open: technology-independent elements leave the make-or-buy and supplier choices undecided until the capital is committed, and the record says so. The information viewpoint is the only one answering ${infoOnlyNames}: remove it and ${nConcerns(infoOnly.length)} is left without a view. Coverage is only as good as its assignments, so a reviewer checks each one: the passengers’ ${concern('CON-003').name.toLowerCase()}, for example, belongs to the functional view, where the fare is quoted.`,
            ],
            why: 'A worked view set shows what “chosen from concerns” looks like, and a computed coverage check gives teams a method they can repeat on their own register.',
            figure: 'Read the six cards, each with its question and the concern IDs it answers; then the coverage bar at the bottom.',
            misconceptions: [{ claim: 'Each concern belongs to exactly one view.', correction: 'A concern can need several views; what matters is that none is left with none.' }],
            transition: 'Now the functional view: what exactly is a function?',
            timing: '3 min: 1 min two purposes, 1 min coverage, 1 min the two choices and the plausibility check.',
          },
        },
      ],
    },
    // ============================================================================================ C. functions and decomposition (17 min)
    {
      id: 'w4s1-functions',
      title: 'Functions and decomposition',
      slides: [
        {
          id: 'w4s1-function',
          title: 'What a function is',
          purpose: 'A function is a transformation of input flows into output flows; name it as an action.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-function-box',
            caption: `${f6.id} ${f6.name}: inputs on the left, outputs on the right, each tagged information, energy or material. (FICTIONAL)`,
            alt: `One box labeled ${f6.id} ${f6.name}. Arrows enter from the left: ${f6.inputs.map((x) => `${x.item} (${x.kind})`).join('; ')}. Arrows leave on the right: ${f6.outputs.map((x) => `${x.item} (${x.kind})`).join('; ')}.`,
          },
          body: [
            { kind: 'definition', term: 'Function', text: 'A function is defined by the transformation of input flows to output flows, with defined performance', source: R('R39x', '1510') },
            { kind: 'bullets', items: ['Flows: data, materials or energy', 'Name: verb + object, never an element'] },
          ],
          sources: [R('R39x', '1510'), R('R20b', '587'), R('R20a', '580')],
          notes: {
            teach: [
              'SEBoK’s glossary records four senses of “function” (R39x p.1510): an outcome that contributes to goals (Ackoff), an action performed to achieve an outcome (Hitchins), the transformation of input flows to output flows with defined performance, created for SEBoK, and a broad work area such as Finance. This week uses the third.',
              'The logical architecture article makes it concrete: a function is an action that transforms inputs and generates outputs, involving data, materials and/or energies; those inputs and outputs are the flow items exchanged between functions (R20b p.587). The functional architecture article notes that this sense is close to the mathematical one, “y is a function of x” (R20a p.580). So a functional view must say what goes in and what comes out.',
              'The course naming rule: verb plus object, and never the name of an element. “Charge aircraft”, not “Charger”. The charger is one way to perform the function; naming the function after it decides the design before the allocation is made.',
            ],
            why: 'A function with a noun name and no inputs or outputs is the commonest defect in student functional views; the definition and the naming rule prevent both.',
            figure: `Read the box ${f6.id} and its arrows: ${f6.inputs.map((x) => x.item).join(' and ')} in; ${f6.outputs.map((x) => x.item).join(' and ')} out. Point at the tags: one input is a material flow, the aircraft, one is energy; the outputs are energy and information.`,
            misconceptions: [{ claim: '“Booking app” is a function.', correction: 'The booking app is a physical element. The functions it may perform are actions such as “Accept ride request”.' }],
            transition: 'What does a functional view need to contain?',
            timing: '3 min: 1 min the four senses, 1 min transformation and flows, 1 min the naming rule.',
          },
        },
        {
          id: 'w4s1-functional-view',
          title: 'What a functional view must contain',
          purpose: 'SEBoK’s minimum contents of a functional view, and the two kinds of function.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-functional-checklist',
            caption: 'SEBoK’s six minimum contents of a functional view, with the AeroLink item that meets each; modes are an open row. (FICTIONAL)',
            alt: 'A six-row checklist. Capabilities that meet objectives: capability to function table, ticked. Inputs and outputs: on every function, ticked. Transformation steps: scenario walks, ticked. Grouping into sub-functions: seven first-level functions, ticked. Variations per mode: open, no modes defined yet. Interfaces carrying the flows: routes checked, defined in Week 5.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Capabilities; inputs and outputs; transformation steps', 'Grouping into sub-functions', 'Variations per mode; interfaces carrying the flows', 'Functional: input–output; behavioral: sequence and control'],
            },
          ],
          sources: [R('R20a', '581'), R('R20b', '587')],
          notes: {
            teach: [
              'SEBoK lists what the functional view of a completed architecture should define at minimum (R20a p.581): the functional capabilities the system uses to meet mission objectives and stakeholder needs; the required inputs and outputs; the steps through which inputs become outputs; the grouping of those steps into sub-functions with their own inputs and outputs; the variations in inputs, outputs and execution for each system mode; and the internal and external interfaces through which the flows pass.',
              'The same page separates functional from behavioral architecture. Functional is about input-output transformation; behavioral is about the sequencing and execution of actions and their control conditions (R20a p.581). This week builds the functional view; the behavioral view, with modes and sequences, is modeled in Week 10.',
              'And there are two kinds of function (R20b p.587): those deduced directly from functional and interface requirements, and those that appear only once a physical solution is chosen. Expect the second kind to arrive in Week 5, when the interfaces are designed.',
            ],
            why: 'A checklist from the source lets teams audit their own functional view, and the open “modes” row teaches that an honest view records what it has not yet done.',
            figure: `Read the six rows with the AeroLink item for each. Stop at the fifth: AeroLink has no modes defined yet. That is recorded as an open finding for Week 10, not hidden.`,
            misconceptions: [{ claim: 'A function list is a functional view.', correction: 'A list has none of the inputs, outputs, grouping or interfaces SEBoK asks for. It is the start of one.' }],
            transition: 'How deep should the functions go, and in which order should you find them?',
            timing: '3 min: 1.5 min the six contents, 1 min functional vs behavioral, 30 s two kinds.',
          },
        },
        {
          id: 'w4s1-decomposition',
          title: 'Decomposition: how deep, and in which order',
          purpose: 'The hierarchy from the mission function down, its stopping rule, and the four pitfalls.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-decomposition-tree',
            caption: `AeroLink’s three-level decomposition: the mission function, ${C.groups} first-level functions, ${C.functions} leaves; a fourth level is marked too deep. (FICTIONAL)`,
            alt: `A tree. At the top, F0: ${MISSION_FUNCTION.name}. Below it ${C.groups} boxes: ${GROUPS.map((g) => `${g.id} ${g.name} with ${functionsOfGroup(g.id).length} functions`).join('; ')}. Under one leaf, a crossed-out fourth level labeled press confirm button, too deep.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['From the mission (one black box) down to leaves', 'Stop where a physical solution is known or imaginable', 'Built over iterations, not one top-down pass', 'Pitfalls: too deep; no scenarios; no inputs and outputs'],
            },
          ],
          sources: [R('R20b', '587'), R('R20b', '594'), R('R20c', '597')],
          notes: {
            teach: [
              'SEBoK: at the top of the hierarchy the system is one central function, its mission, a black box. It is broken into sub-functions, and those again, until the leaf functions are ones for which physical solutions are known, feasible or possible to imagine. The hierarchy is populated over a number of iterations; it is generally not created by a single top-down decomposition (R20b p.587).',
              'Four pitfalls from SEBoK’s table (R20b p.594): not relating the logical architecture back to the operational scenarios; decomposing too deeply, with too many functions and flows; considering the actions and forgetting the inputs and outputs, which are integral parts of a function; and relying on a static decomposition alone. The proven practice: establish scenarios of functions before building the decomposition tree.',
              `For breadth, a common guideline from the physical architecture article is five plus or minus two elements in one level (R20c p.597). AeroLink’s first level has ${C.groups} functions, inside the guideline; the leaves number ${C.functions}. The grouping is an instructor proposal: the reference had leaves only.`,
            ],
            why: 'Without a stopping rule students decompose to button presses; without the scenario-first practice they produce a tidy tree that misses what the system does in its scenarios.',
            figure: `Read the tree: the mission at the top, the ${C.groups} first-level functions, the leaf counts under each. Point at the crossed-out fourth level: a function for which the solution is already obvious needs no further breakdown.`,
            misconceptions: [{ claim: 'A deeper tree is a more thorough analysis.', correction: 'Past the point where a solution is imaginable, depth adds functions nobody allocates and hides the inputs and outputs. SEBoK names it as a beginner’s mistake.' }],
            transition: 'So scenarios first. Here is how, on AeroLink.',
            timing: '3 min: 1 min hierarchy and stopping rule, 1.5 min pitfalls, 30 s breadth.',
          },
        },
        {
          id: 'w4s1-worked-walk',
          title: 'Worked example I: walking two scenarios to find functions',
          purpose: 'Model the scenario-first practice, and show a walk exposing functions the reference lacked.',
          minutes: 5,
          layout: 'worked-example',
          figure: {
            id: 'w4s1-scenario-walk',
            caption: 'The two scenarios as a worksheet: each step with an empty box for the function the class names; a person marks a step where a human decides. The answers are in the notes and the lesson. (FICTIONAL)',
            alt: `Two columns of scenario steps, each step with its short text and an empty function box. Left, ${walk1.scenario}: ${uniqueSteps(0)}. Right, ${walk5.scenario}: ${uniqueSteps(1)}. A person icon marks ${humanSteps.join(', ')}. No function is filled in.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Walk', text: 'Read each step; ask which transformation it needs' },
                { label: 'Name', text: 'Verb + object, with inputs and outputs' },
                { label: 'Reuse', text: 'A step served by an existing function adds no function' },
                { label: 'Expose', text: 'A step no function serves is a new function or a gap' },
              ],
            },
          ],
          sources: [R('R20b', '594'), R('R48c', '145')],
          notes: {
            teach: [
              `Model the practice SEBoK calls constituting scenarios of functions before the tree (R20b p.594). Put ${walk1.scenario}, Passenger Ride Request, on the screen and read it step by step with the class. For each step ask one question: which transformation does this step need?`,
              `Then the second walk, ${walk5.scenario}, Weather Disruption, where the method earns its keep. Students supply the function at each step; the worked solution below gives the answers. Two steps have no function in the instructor reference.`,
              'Close with the human operations. Steps where a person decides, the customer services agent in SCN-001 and the duty manager in SCN-005, still belong to a function; the DoD guidebook lists human operations among the targets functions are allocated to (R48c p.145). Write the person into the function’s record.',
            ],
            workedSolution: [
              `${walk1.scenario}: steps 1 to 4 are one transformation, request in, confirmed booking out: ${fn('FN-001').id} ${fn('FN-001').name}. Step 5, assign a dispatch-ready aircraft within 60 s, is a different transformation with its own requirement (REQ-SYS-005): ${f2.id} ${f2.name}. Step 6, the boarding pass, closes the booking and stays in ${fn('FN-001').id}. Alternate A3, the wheelchair user who asks for help, is a human operation inside ${fn('FN-001').id}, not a new function.`,
              `${walk5.scenario}: steps 1 and 2, flag the vertiport and declare the hold, are ${fn('FN-004').id} ${fn('FN-004').name}, the declaration being the duty manager’s. Step 3, divert each airborne flight, is ${fn('FN-005').id}; but diversions pile work onto the remote operators, and no reference function limits how many flights one operator holds. That exposes ${f17.id} ${f17.name}, serving ${capability(f17.capabilities[0]).name.toLowerCase()} and ${f17.requirements[0]}.`,
              `Step 4, revised flight intents, is ${fn('FN-012').id}. Steps 5 and 6, notify passengers and take their choice, have no reference function at all: that exposes ${f15.id} ${f15.name}, which serves ${f15.requirements.join(' and ')}, written in Week 3 to close the Week 2 audit gap. Step 7, lift the hold and re-time the backlog, returns to ${fn('FN-004').id} and ${f2.id}.`,
              `Result: ${numberWord(C.proposedFunctions)} functions were added to the reference’s ${C.referenceFunctions}, two found by this walk and one, ${fn('FN-016').id} ${fn('FN-016').name}, by the open Week 2 item for ${fn('FN-016').requirements[0]}. All three are marked proposed, for the instructor to confirm.`,
            ],
            figure: 'Point at each step and its empty box as students name the function; write the answers on the board or reveal them from the worked solution. The person icons mark the steps where a human decides.',
            misconceptions: [{ claim: 'Every scenario step is a function.', correction: 'Several steps can be one transformation (SCN-001 steps 1 to 4). A step earns a new function only when no existing transformation serves it.' }],
            why: 'Walking a scenario is the one technique that finds missing functions; a tree drawn from capabilities alone would not have found either of the two this walk exposed.',
            transition: 'The scenarios found the functions; the capabilities check that nothing is left out.',
            timing: '5 min: 1.5 min SCN-001 together, 2.5 min SCN-005 with students supplying answers, 1 min human operations and result.',
          },
        },
        {
          id: 'w4s1-capabilities',
          title: 'Functions from capabilities: the coverage check',
          purpose: 'Every capability has a function or a disposition; every system requirement is allocated to a function.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-capability-map',
            caption: `${C.capabilities} capabilities on the left, ${C.functions} functions on the right; one capability has a disposition instead of a function. (FICTIONAL)`,
            alt: `A two-column graph. Left: CAP-001 to CAP-015. Right: FN-001 to FN-017. Lines join each capability to the functions derived from it. CAP-011 has no line and carries a tag: constraint, no function. A footer reads ${C.systemAllocated} of ${C.systemRequirements} system requirements allocated.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [`${C.capabilitiesServed} of ${C.capabilities} capabilities served by a function`, 'CAP-011 is a constraint: a disposition, not a function', `${C.systemAllocated} of ${C.systemRequirements} system requirements allocated`, 'FN-013 serves planning: no requirement, by reason'],
            },
          ],
          sources: [R('R20b', '592'), R('R20c', '598'), R('R48c', '146')],
          notes: {
            teach: [
              `Now check the other way round: from the capabilities of Week 2 to the functions. Of the ${C.capabilities} capabilities, ${C.capabilitiesServed} are served by at least one function. Several functions serve two capabilities: ${fn('FN-005').id} ${fn('FN-005').name} serves on-demand transport and noise-managed operations; ${fn('FN-001').id} also serves the fare-transparency capability Week 2 added.`,
              `One capability has no function, by design. ${capability('CAP-011').name}: ${CAPABILITY_DISPOSITIONS['CAP-011']} SEBoK’s physical architecture article explains why this is normal: stakeholders’ concerns are often expressed as expected properties, and architects deduce design properties from them (R20c p.598).`,
              `Then the requirements. SEBoK asks the logical architecture to establish traceability between system requirements and functional elements (R20b p.592). All ${C.systemRequirements} AeroLink system requirements are allocated to a function. Of the stakeholder requirements, each is refined by a system requirement, allocated directly, or, for ${numberWord(C.stakeholderNoChild)} of them, recorded in Week 2 as needing no child. ${fn('FN-013').id} ${fn('FN-013').name} has no requirement: it is a planning function, and we record the reason rather than invent a requirement for it. ${Cap(numberWord(C.stakeholderDirect))} stakeholder requirements are allocated straight to a function with no system requirement between: a concept-level shortcut, and Week 5 derives the system requirement each needs (R48c p.146).`,
            ],
            why: 'The scenario walk finds functions the operation needs; the capability and requirement checks find what the walk missed. Together they make the functional view complete enough to allocate.',
            figure: 'Trace two lines from capability to function, then point at CAP-011 with its tag and at the footer count.',
            misconceptions: [{ claim: 'Every capability must become at least one function.', correction: 'A capability that is really a constraint becomes a design property of the physical view. Record the disposition; do not invent a function to fill the cell.' }],
            transition: 'Functions are now complete. Who performs them?',
            timing: '3 min: 1 min capability coverage, 1 min the disposition, 1 min requirement allocation.',
          },
        },
      ],
    },
    // ============================================================================================ D. logical, physical, allocation (19 min)
    {
      id: 'w4s1-allocation',
      title: 'Logical and physical elements, and allocation',
      slides: [
        {
          id: 'w4s1-logical-physical',
          title: 'Logical and physical: two structural views',
          purpose: 'Distinguish technology-independent logical elements from the physical elements that implement them.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-three-planes',
            caption: `Three planes: ${f6.id} is performed by ${f6.log} and allocated to ${f6.phy}; requirements are allocated to both structural planes. (FICTIONAL)`,
            alt: `Three stacked planes labeled functional, logical and physical. In the top plane the box ${f6.id} ${f6.name}; an arrow down to ${f6.log} ${logical(f6.log).name} in the middle plane; another down to ${f6.phy} ${physical(f6.phy).name} in the bottom plane. A side label reads ${f6.requirements[0]} allocated.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Logical: allocated functions, no specific implementation', 'Physical: the specific implementation of each logical element', 'Requirements are allocated to both', 'Elements include people, procedures and facilities'],
            },
          ],
          sources: [R('R19', '571'), R('R20b', '587'), R('R20c', '596'), R('R20c', '597')],
          notes: {
            teach: [
              'SEBoK’s architecture article: logical configuration items have a set of allocated functions, interfaces and performance requirements but no specific design implementation; it calls them the platform-independent model. Physical configuration items are the specific implementation of each logical element, the platform-specific model. Its example: a logical combustion engine with requirements, implemented as a specific V8 engine (R19 p.571).',
              'The logical architecture article adds that a logical architecture is a set of related technical concepts and principles supporting the logical operation of the system, and may include functional, behavioral and temporal views (R20b p.587). The physical architecture article defines the physical architecture as an arrangement of physical elements, system elements and physical interfaces, that provides the solution for a product, service or enterprise, and states that system requirements are allocated to both the logical and the physical architectures (R20c p.596).',
              'Widen the idea of an element. A system element can be hardware, software, data, humans, processes, procedures, facilities and naturally occurring entities (R20c p.597). In AeroLink the certifying technicians and the duty manager are part of the physical view.',
            ],
            why: 'The logical layer keeps make-or-buy decisions open; without it, the first familiar product becomes the architecture.',
            figure: `Follow ${f6.id} down the planes: the function, the logical element that performs it, the physical element it is allocated to, and the requirement allocated beside them.`,
            misconceptions: [{ claim: 'Logical means software and physical means hardware.', correction: 'Both planes contain whatever the system needs. The difference is implementation: logical elements have none yet; physical elements are specific.' }],
            transition: 'Allocation is a choice. On what grounds?',
            timing: '3 min: 1 min logical vs physical, 1 min definitions, 1 min people and procedures.',
          },
        },
        {
          id: 'w4s1-criteria',
          title: 'Allocation needs a reason: SEBoK’s criteria',
          purpose: 'Give the affinity criteria and the aims of a candidate physical architecture; every allocation states one.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-criteria-cards',
            caption: 'Eight affinity criteria for grouping and allocating functions; one card is laid on an AeroLink allocation. (FICTIONAL)',
            alt: `A fan of eight cards: ${ALLOCATION_CRITERIA.map((c) => c.label.toLowerCase()).join('; ')}. The card for the same type of flow lies face up on an arrow from ${f6.id} to ${f6.phy}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Same transformation, efficiency, flow type', 'Central or distributed control; frequency', 'Dependability, environment, enterprise constraints', 'Course rule: one sentence per allocation, resting on an ID'],
            },
          ],
          sources: [R('R20c', '598'), R('R20c', '599'), R('R20c', '600')],
          notes: {
            teach: [
              'SEBoK: developing a candidate physical architecture starts by identifying the system elements that can perform the functions and the interfaces that can carry the input-output and control flows. Partitioning and allocation use criteria to find affinities between functions (R20c p.598). The list is on the slide, word for word in substance: similar transformations within the same technology, similar levels of efficiency, exchange of the same type of flow, information, energy or materials, centralized or distributed controls, execution at a close frequency level, dependability conditions, environment resistance level, and other enterprise constraints (R20c pp.598–599).',
              'A candidate physical architecture may then aim at fewer physical interfaces, elements that can be tested separately, compatible technology, proximity, ease of handling, shared resources, modularity and resilience (R20c p.599). The outputs include an allocation matrix of functional elements to physical elements and a traceability matrix with the system requirements (R20c p.600).',
              'The course rule, a convention: every allocation carries one sentence naming its criterion and the ID it rests on. SEBoK gives criteria but no record format; the sentence is what lets a reviewer, or you in Week 11, check the allocation instead of trusting it. When two elements both meet the criterion, say which aim decides, for example fewer interfaces (R20c p.599).',
            ],
            why: 'An allocation without a reason cannot be reviewed or revisited; the criteria give students a vocabulary for reasons that a reviewer recognizes.',
            figure: 'Name the eight cards. Then point at the one face up: the same type of flow, energy and the charge handshake, laid on the arrow from Charge aircraft to the charging systems.',
            misconceptions: [{ claim: 'Allocation is obvious once the functions are listed.', correction: 'Most functions could go to two or three elements. The criterion is the engineering decision, and it is often where a later problem is caught.' }],
            transition: 'Two ways allocation goes wrong.',
            timing: '4 min: 2 min the criteria, 1 min aims and outputs, 1 min the course rule.',
          },
        },
        {
          id: 'w4s1-pitfalls',
          title: 'Two allocation pitfalls',
          purpose: 'What reviewers catch: skipping the logical plane, and allocating straight onto technologies.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-pitfalls',
            caption: 'Two wrong paths, requirement straight to a product and function straight to a technology, against the right path through a logical plane.',
            alt: 'Left, a red arrow from a requirement box directly to a product box, labeled no logical architecture. Middle, a red arrow from a high-level function directly to a software module box, labeled direct allocation on technologies. Right, a green zig-zag from function to logical element to physical element to technology, labeled alternate logical and physical levels.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Requirements straight to a product: no logical architecture', 'High-level functions straight onto technologies', 'Right: alternate logical and physical levels'],
            },
          ],
          sources: [R('R20c', '602')],
          notes: {
            teach: [
              'Two pitfalls from SEBoK’s table (R20c p.602). First, no logical architecture model: the developers pass directly from system requirements to a physical architecture, common with repeat products because the functions seem known. The problem is that a function is always associated with input-output flows in a specific domain; if the domain changes, the performance of the function can become invalid.',
              'Second, direct allocation on technologies: at a high level of abstraction, allocating functions straight onto hardware or software at the lowest level does not reflect an understanding of the system. The right practice is to decompose into the appropriate number of levels, alternating logical and physical, before reaching the technology level.',
            ],
            why: 'Both pitfalls look efficient and both lock the design early; naming them lets students recognize the shortcut in their own drafts.',
            figure: 'Point at each red arrow and its label, then trace the green zig-zag on the right.',
            misconceptions: [{ claim: 'Our enterprise is small, so a logical layer is overhead.', correction: 'Even a small enterprise has functions that could move between elements, a volunteer or software, a van or a contractor. The logical layer is where that choice stays visible.' }],
            transition: 'Now the full method, once, on AeroLink.',
            timing: '2 min: 1 min each pitfall.',
          },
        },
        {
          id: 'w4s1-worked-allocation',
          title: 'Worked example II: function → logical → physical, with the reason',
          purpose: 'Work four allocations aloud, with students supplying the criterion, and apply the consistency check.',
          minutes: 6,
          layout: 'worked-example',
          figure: {
            id: 'w4s1-allocation-swimlane',
            caption: 'Four AeroLink allocations in three lanes, each arrow labeled with its criterion; the physical lane carries the Week 3 configuration. (FICTIONAL)',
            alt: `Three lanes: function, logical element, physical element. Four rows: ${['FN-006', 'FN-008', 'FN-002', 'FN-015'].map((id) => `${id} ${fn(id).name} to ${fn(id).log} to ${fn(id).phy}, criterion ${criterionLabel(fn(id).criterion).toLowerCase()}`).join('; ')}. Under the physical lane header a line reads ${CONFIGURATION.aircraft} aircraft, ${CONFIGURATION.hubs} hubs, ${CONFIGURATION.turnaroundChargers} turnaround chargers.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Logical', text: 'Which technology-independent element performs it?' },
                { label: 'Physical', text: 'Which element implements that, in the Week 3 configuration?' },
                { label: 'Criterion', text: 'Name the affinity and the ID it rests on' },
                { label: 'Check', text: 'The physical element is one the logical element reaches' },
              ],
            },
          ],
          sources: [R('R20c', '598'), R('R20c', '599'), R('R48c', '145')],
          notes: {
            teach: [
              `Set the physical scene first. The Week 3 decision is in force: ${CONFIGURATION.aircraft} aircraft, ${CONFIGURATION.sites} vertiports of which ${CONFIGURATION.hubs} are hubs, ${CONFIGURATION.turnaroundChargers} high-power turnaround chargers and ${CONFIGURATION.standardChargers} standard ones, so the physical view holds those counts. The capacity check, the smaller of ${CONFIGURATION.fleetLimit} and ${CONFIGURATION.chargerLimit}, gives ${CONFIGURATION.capacity} trips a day.`,
              'Work four rows. For each, ask the class for the logical element, then the physical element, then the criterion from SEBoK’s list (R20c pp.598–599); the worked solution gives the model answers. Then apply the check rule of the reference: a function’s physical element must be one its logical element is allocated to.',
              'Remind students that the criterion sentence is an instructor proposal for AeroLink; the reference stores the allocation but no reason. Their own reasons may differ; what is graded is that a reason is given and rests on something in the record.',
            ],
            workedSolution: [
              `${f6.id} ${f6.name} → ${f6.log} ${logical(f6.log).name} → ${f6.phy} ${physical(f6.phy).name}. Criterion: ${criterionLabel(f6.criterion).toLowerCase()}. ${f6.why} Rests on ${f6.restsOn}.`,
              `${f8.id} ${f8.name} → ${f8.log} ${logical(f8.log).name} → ${f8.phy} ${physical(f8.phy).name}. Criterion: ${criterionLabel(f8.criterion).toLowerCase()}. ${f8.why} The human operation: ${f8.human}. The DoD guidebook names human operations as allocation targets (R48c p.145).`,
              `${f2.id} ${f2.name} → ${f2.log} ${logical(f2.log).name} → ${f2.phy} ${physical(f2.phy).name}. Criterion: ${criterionLabel(f2.criterion).toLowerCase()}. ${f2.why} This allocation depends on the architecture decision on the next slide.`,
              `${f15.id} ${f15.name} → ${f15.log} ${logical(f15.log).name} → ${f15.phy} ${physical(f15.phy).name}. Criterion: ${criterionLabel(f15.criterion).toLowerCase()}. ${f15.why}`,
              `Check: ${f6.log} reaches ${logical(f6.log).phys.join(' and ')}; ${f8.log} reaches ${logical(f8.log).phys.join(', ')}; ${f2.log} reaches ${logical(f2.log).phys.join(', ')}; ${f15.log} reaches ${logical(f15.log).phys.join(' and ')}. All four pass. Across all ${C.functions} functions the case test finds no inconsistent allocation; ${physical('PHY-006').name} is the only physical element with no function, because it is the medium of the information interfaces, not a performer.`,
            ],
            figure: 'Point at each row as it is worked, reading the criterion in the right-hand column. Then at the line under the physical lane header with the Week 3 counts.',
            misconceptions: [{ claim: 'Each logical element maps to exactly one physical element.', correction: `Not in AeroLink: ${logical('LOG-002').name} reaches both ${physical('PHY-003').name} and ${physical('PHY-004').name}. What must hold is that each function lands on one physical element its logical element reaches.` }],
            why: 'Working the reason aloud, with students supplying it, is what turns the criteria list into a habit; the check rule shows the allocation is testable.',
            transition: 'One of those allocations rested on a decision. Here it is, recorded.',
            timing: '6 min: 1 min the configuration, 4 min four rows (one minute each), 1 min the check.',
          },
        },
        {
          id: 'w4s1-decision',
          title: 'Recording an architecture decision',
          purpose: 'An architecture decision is an engineering record: question, alternatives, choice, rationale, and the needs and risks it is tested against.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-decision-card',
            caption: `${ARCH_DECISION.id}: the question, three alternatives with the chosen one ticked, the rationale and the three tests. (FICTIONAL)`,
            alt: `A decision card headed ${ARCH_DECISION.id}. Question: ${ARCH_DECISION.question} Three alternatives: ${ARCH_DECISION.alternatives.join('; ')}, the last ticked. Rationale strip. Three test rows: ${ARCH_DECISION.tests.map((t) => `${t.id}, ${t.verdict}`).join('; ')}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Question, alternatives, choice, rationale', 'Tested against the needs and risks it touches', 'Conditions and what would reverse it', 'Decisions create derived requirements'],
            },
          ],
          sources: [R('R48c', '146'), R('R20b', '591')],
          notes: {
            teach: [
              `Read the card. The question: ${ARCH_DECISION.question} The alternatives considered: ${ARCH_DECISION.alternatives.join('; ')}. The choice: ${ARCH_DECISION.chosen.toLowerCase()}. The rationale: ${ARCH_DECISION.rationale}`,
              `Now test it, with the class. Against ${ARCH_DECISION.tests[0].id}, short predictable waits: ${ARCH_DECISION.tests[0].against}; it ${ARCH_DECISION.tests[0].verdict}. Against ${ARCH_DECISION.tests[1].id}: ${ARCH_DECISION.tests[1].against}; ${ARCH_DECISION.tests[1].verdict}. Against ${ARCH_DECISION.tests[2].id}, the security risk Week 3 added: ${ARCH_DECISION.tests[2].against}; ${ARCH_DECISION.tests[2].verdict}. A decision that passes the first two tests can still create a third risk; say so in the record.`,
              `Why record it: the DoD guidebook says derived requirements come from solution decisions and must be traceable and part of the allocated requirements, and that decision analysis trades requirements against solution alternatives (R48c p.146). SEBoK asks for the selected logical architecture to come with the rationale for its selection (R20b p.591). This decision creates derived requirements: failover within the assignment window, and separation of the booking platform from dispatch. The quantitative comparison, ${ARCH_DECISION.quantitative}.`,
            ],
            why: 'Decisions without alternatives and tests cannot be reviewed or revisited; the record is what lets Week 6 ask “does this still hold?” when the context changes.',
            figure: 'Read the card top to bottom: question, alternatives with the tick, rationale, then the three test rows with their verdicts.',
            misconceptions: [{ claim: 'A decision record lists the option we chose.', correction: 'It lists the options considered and why the others lost. Without them a reviewer cannot tell a decision from a default.' }],
            transition: 'Last perspective: who owns what.',
            timing: '4 min: 1 min the card, 2 min the three tests, 1 min derived requirements.',
          },
        },
      ],
    },
    // ============================================================================================ E. enterprise view, process frame, exit (9 min)
    {
      id: 'w4s1-enterprise',
      title: 'The enterprise view, the process frame and exit',
      slides: [
        {
          id: 'w4s1-enterprise-view',
          title: 'The enterprise view: owners and agreements',
          purpose: 'The fourth perspective: which organization owns which element and agreement; where the enterprise boundary cuts the physical view.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-enterprise-owners',
            caption: 'The physical elements tinted by owner, with the organizational agreements between owners. (FICTIONAL)',
            alt: `Physical element boxes in two tinted panels. AeroLink owns ${owned('AeroLink').join(', ')}. Vertiport operators own ${owned('Vertiport operators').join(', ')}. Three outside parties stand below: electric utility, aircraft manufacturer, insurers. Dashed double lines, each labeled, show the agreements: ${AGREEMENTS.map((a) => `${a.id} ${a.name} between ${a.between.join(' and ')}`).join('; ')}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [`AeroLink owns ${owned('AeroLink').length}; vertiport operators own ${owned('Vertiport operators').length}`, 'Agreements record duties; they carry no data', 'As-is and to-be views show migration paths', 'Enterprise elements: organizations, departments, teams'],
            },
          ],
          sources: [R('R62', '345'), R('R20c', '597')],
          notes: {
            teach: [
              `The enterprise viewpoint asks: ${vp('enterprise').purpose} In AeroLink, ${owned('AeroLink').length} physical elements belong to AeroLink, the fleet, the operations center, the maintenance facility, the communications and the booking platform; ${owned('Vertiport operators').length} belong to the vertiport operators: the vertiports, the chargers and the pad fire detection. That is the Week 1 wider system of interest made visible: the service needs elements AeroLink does not control.`,
              `Then the agreements between owners: ${AGREEMENTS.map((a) => a.name.toLowerCase()).join('; ')}. The first two are in the reference; the last three are proposed. An agreement records who must do what; it carries no data. Session 2 makes that a rule.`,
              'Two sources. SEBoK’s table of system elements lists, for an enterprise system, corporate units, departments, projects, teams and leaders (R20c p.597): organizations are architecture elements. MITRE: views of “as is” and “to be” architectures help stakeholders understand migration paths and transitions (R62 p.345). Week 6 draws AeroLink’s to-be enterprise view.',
            ],
            why: 'Students forget that elements they do not own still constrain them; the enterprise view puts the owners, and the agreements that bind them, on the same page as the elements.',
            figure: 'Read the two tints, then follow each dashed agreement line and name its parties.',
            misconceptions: [{ claim: 'If we do not own an element, it is outside our architecture.', correction: 'It may be inside the wider system of interest, as the chargers are. Ownership changes how you can change it, through an agreement, not whether it is part of the architecture.' }],
            transition: 'How does all of this sit in a professional process?',
            timing: '3 min: 1 min owners, 1 min agreements, 1 min sources and Week 6.',
          },
        },
        {
          id: 'w4s1-process-frame',
          title: 'The process frame: the DoD Architecture Design process',
          purpose: 'Professional context: translating requirements into alternatives, baselines and derived requirements.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s1-process-frame',
            caption: 'Stakeholder requirements and requirements analysis feed architecture design; its output is the allocated baseline, with derived requirements fed back.',
            alt: 'A left-to-right flow: stakeholder requirements definition, requirements analysis, architecture design, allocated baseline. A side arrow from architecture design back to requirements labeled derived requirements. Under architecture design two tags: functional architecture in the functional baseline; physical architecture in the allocated and product baselines.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Translates requirements into alternative design solutions', 'Functions allocated to hardware, software, facilities and people', 'Derived requirements come from solution decisions', 'Output: the allocated baseline'],
            },
          ],
          sources: [R('R48c', '144'), R('R48c', '145'), R('R48c', '146')],
          notes: {
            teach: [
              'The DoD guidebook describes the Architecture Design process as a trade and synthesis method that translates the outputs of stakeholder requirements definition and requirements analysis into alternative design solutions (R48c p.144). It is iterative and seeks a balance among cost, schedule, performance and risk that still meets stakeholder needs (R48c p.145).',
              'The functional architecture is the foundation, through the allocation of functions and sub-functions to hardware, software, databases, facilities and human operations; it belongs to the functional baseline, and the physical architecture to the allocated and product baselines (R48c p.145). Derived requirements come from solution decisions and must stay traceable; the output is the allocated baseline, detailed enough to confirm upward and downward traceability of requirements (R48c p.146).',
              'Map it to the course. Week 2 was requirements; Week 3 traded alternatives; this week synthesizes the architecture and records its derived requirements; Week 5 adds the interfaces that complete an allocated baseline for a concept-level package.',
            ],
            why: 'Seeing the same steps in a defense guidebook shows students that the course method is professional practice, not classroom ritual.',
            figure: 'Read the flow left to right, then the side arrow of derived requirements, then the two baseline tags under architecture design.',
            misconceptions: [{ claim: 'Derived requirements are new stakeholder requests.', correction: 'They come from the team’s own solution decisions, for example failover time from the platform decision, and trace back to that decision.' }],
            transition: 'Before Session 2, one thing to bring.',
            timing: '3 min: 1 min the process, 1 min baselines and derived requirements, 1 min the course map.',
          },
        },
        {
          id: 'w4s1-exit',
          title: 'Exit: one function, one reason; preparation for Session 2',
          purpose: 'Retrieval of the session and preparation for the information view.',
          minutes: 3,
          layout: 'two-column',
          body: [
            { kind: 'callout', tone: 'key', title: 'One-minute paper', text: 'Name one function of your enterprise, verb and object, and the criterion you would use to allocate it.' },
          ],
          aside: [
            {
              kind: 'bullets',
              items: ['Before Session 2 (about 15 min):', 'List three decisions your enterprise makes every day', 'For each: the information it needs, and where it comes from'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Run the one-minute paper: one function of the team’s own enterprise, named verb and object, and the criterion from today’s list that would justify its allocation. Collect the cards or ask for a photo on the LMS; read three aloud at the start of Session 2.',
              'Set the preparation: each member lists three decisions the enterprise makes every day and, for each, the information it needs and where that information comes from. About fifteen minutes. It is the raw material for the in-class lab start in Session 2.',
            ],
            why: 'A one-minute paper shows the instructor which idea did not land, and the decision list prepares the information view students meet next.',
            transition: 'End of Session 1; references follow.',
            timing: '3 min: 2 min the paper, 1 min the preparation.',
          },
        },
        {
          id: 'w4s1-references',
          title: 'References and credits',
          purpose: 'The generated list of every source cited in this session, with license credits.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while students write. The list is generated from every citation in the session and includes SEBoK’s required attribution.'],
            why: 'Students should be able to find every source the session relied on.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the exit.',
          },
        },
      ],
    },
  ],
  studentLesson: [
    {
      id: 'w4-lesson-why',
      title: 'Why this week: the first how',
      sources: [R('R13', '557'), R('R13', '561'), R('R19', '569')],
      blocks: [
        { kind: 'para', text: 'Weeks 1 to 3 answered three questions about your enterprise: why it exists and whom it serves (needs and concerns), what it must do (scenarios, capabilities, requirements), and which option to pursue (the trade study). Week 4 asks the first **how**: which functions does the enterprise perform, which elements perform them, and which information passes between them to support which decisions. It stays at concept level; Week 5 adds the components and interfaces.' },
        { kind: 'para', text: 'SEBoK places this work right after requirements. System requirements form the basis of system architecture and design activities (R13 p.557), but the two are not sequential: requirements definition is iterative and recursive and runs concurrently with architecture definition (R13 p.561). Expect your Week 2 requirements to change as you allocate them; record each change with its reason. The architecture’s job, in SEBoK’s words, is to ensure that the system elements operate together in their operating environment to satisfy stakeholder needs (R19 p.569).' },
        { kind: 'figure', slide: 'w4s1-driving-question' },
        { kind: 'para', text: 'The driving question of the week is simple to state: who decides that an aircraft may fly, and how does the information that decision needs reach them? The answer comes at the end of Session 2. Keep it in mind as you read: every idea below is a step toward being able to answer it for your own enterprise.' },
        { kind: 'figure', slide: 'w4s1-where' },
      ],
    },
    {
      id: 'w4-lesson-description',
      title: 'Architecture, its description, and the vocabulary of views',
      sources: [R('R39t', '1445'), R('R62', '341'), R('R62', '342'), R('R39u', '1446'), R('R39v', '1677'), R('R39w', '1678'), R('R19', '570'), R('R20a', '582'), R('R20b', '593')],
      blocks: [
        { kind: 'para', text: 'SEBoK’s glossary records the ISO/IEC/IEEE 15288 definition of **architecture**: fundamental concepts or properties of a system in its environment embodied in its elements, relationships, and in the principles of its design and evolution (R39t p.1445). The same entry notes that the architecture of a system of interest is conceptual and is realized through an architectural description, and that because “fundamental” has no universal definition, the level of detail depends on purpose, so a description should justify what it includes and excludes (R39t p.1445). The word “evolution” matters: how the system will change is part of its architecture, which is why Week 6 builds an evolution roadmap.' },
        { kind: 'figure', slide: 'w4s1-architecture' },
        { kind: 'para', text: 'MITRE gives the relationship between the terms, after IEEE 1471 (R62 p.342): a system has an architecture; the architecture is communicated by an architecture description; the description consists of views and models (and non-model artifacts); an architecture framework provides requirements for the description. SEBoK warns that document-based descriptions, each document with its own notation, must be synchronized by hand, and argues for a model as an authoritative source of truth holding the requirement, functional, logical and physical representations (R19 p.570). It also warns that a model of an architecture is a representation, which may be incomplete, not the architecture itself (R20a p.582).' },
        { kind: 'figure', slide: 'w4s1-description-model' },
        { kind: 'heading', text: 'Framework, model, view, viewpoint' },
        { kind: 'para', text: 'MITRE’s definitions (R62 p.341): an **architecture framework** is an encapsulation of a minimum set of practices and requirements for artifacts that describe a system’s architecture; **models** are representations of how objects fit structurally in and behave as part of the system; **views** are a partial expression of the system from a particular perspective; a **viewpoint** is a set of representations (views and models) of an architecture that covers a stakeholder’s issues.' },
        { kind: 'para', text: 'SEBoK’s glossary: an architecture framework is the conventions, principles and practices for the description of architectures within a domain or community of stakeholders, with DoDAF, MoDAF, TOGAF and Zachman as examples (R39u p.1446); a view is a representation of a system from the perspective of a viewpoint (R39v p.1677); a viewpoint is a specification of the conventions and rules for constructing and using a view for the purpose of addressing a set of stakeholder concerns (R39w p.1678).' },
        { kind: 'callout', tone: 'caution', title: 'Two honest notes', text: 'The two sources word “viewpoint” differently: a set of representations (MITRE) or a specification of rules (SEBoK). This course uses SEBoK’s: the viewpoint is the rule, the view is what the rule produces for one system. And the standard both point to, ISO/IEC/IEEE 42010, which also defines “concern”, is not in the course collection; SEBoK names it only as a source of templates (R20b p.593).' },
        { kind: 'slide-ref', slide: 'w4s1-vocabulary', text: 'The two sets of definitions side by side' },
      ],
    },
    {
      id: 'w4-lesson-choosing-views',
      title: 'Choosing views from concerns',
      sources: [R('R62', '342'), R('R62', '344'), R('R04', '275'), R('R19', '573')],
      blocks: [
        { kind: 'para', text: 'Systems have many stakeholders with different concerns, and frameworks let teams create views directly relevant to those concerns (R62 p.342). SEBoK’s View principle agrees: multiple views, each based on a system aspect or concern, are essential to understand a complex system (R04 p.275); its architecture article says the model holds multiple views with the information needed to address each stakeholder’s viewpoint and concerns (R19 p.573).' },
        { kind: 'para', text: 'MITRE’s first lesson is **purpose is paramount**: decide the purpose of the architecting effort and generate only the views and models that meet it; each should help a stakeholder reason about the system so that they can conclude that their objectives will be met (R62 p.344). Frameworks help by establishing minimum guidelines for each stakeholder’s interest, but stakeholders can have other concerns (R62 p.344).' },
        { kind: 'para', text: `The course acts as the framework. Its minimum view set, a course convention, is the ${requiredKinds.join(', ')} views: the four perspectives of the course document and the information view of the schedule. For each view, write the purpose as the question it answers, the stakeholders and concerns it serves, and its conventions: the form it takes and the element types it shows. Then check coverage: every concern in your Week 1 register should be answered by at least one view. Add a view when one is not. Coverage is only as good as its assignments, so check that each concern you assign is one the view really answers. Each viewpoint record in the course holds both parts: the viewpoint, the rule (purpose, stakeholders, concerns, form), and the view it produces for your one system (what it shows).` },
        { kind: 'figure', slide: 'w4s1-choosing-views' },
        { kind: 'table', header: ['Viewpoint', 'Purpose (the question it answers)', 'Concerns'], rows: VIEWPOINTS.map((v) => [v.name, v.purpose, v.concerns.join(', ')]), caption: `AeroLink’s ${C.viewpoints} viewpoints; together they answer ${C.concernsCovered} of the ${C.concerns} Week 1 concerns (FICTIONAL).` },
        { kind: 'para', text: `Two choices in AeroLink’s set are worth noticing. A logical viewpoint was added beyond the minimum, though not for coverage: delete it and ${logicalOnly.length ? nConcerns(logicalOnly.length) : 'no concern'} loses its view, since the ${stakeholder('STK-003').name.toLowerCase()}’ ${concern('CON-005').name.toLowerCase()} is also answered by the enterprise view. It is there because technology-independent elements keep the make-or-buy and supplier choices open until capital is committed. The information viewpoint is the only one answering ${infoOnlyNames}: delete it and ${nConcerns(infoOnly.length)} has no view. And the passengers’ ${concern('CON-003').name.toLowerCase()} is answered by the functional view, where the fare is quoted, not by the information view: a plausibility check on every assignment is part of the coverage check.` },
        { kind: 'figure', slide: 'w4s1-aerolink-views' },
      ],
    },
    {
      id: 'w4-lesson-functions',
      title: 'The functional architecture',
      sources: [R('R39x', '1510'), R('R20b', '587'), R('R20a', '580'), R('R20a', '581'), R('R20b', '594'), R('R20c', '597')],
      blocks: [
        { kind: 'para', text: 'SEBoK’s glossary gives four senses of **function** (R39x p.1510); this week uses the one created for SEBoK: a function is defined by the transformation of input flows to output flows, with defined performance. The logical architecture article adds that the flows involve data, materials and/or energies and are the items exchanged between functions (R20b p.587); the functional architecture article notes the sense is close to the mathematical “y is a function of x” (R20a p.580). Name each function as an action, verb and object, never as an element: “Charge aircraft”, not “Charger” (a course convention).' },
        { kind: 'figure', slide: 'w4s1-function' },
        { kind: 'para', text: 'At minimum, a functional view defines the functional capabilities that meet mission objectives and stakeholder needs; the inputs and outputs; the steps that transform them; the grouping into sub-functions with their own inputs and outputs; the variations for each system mode; and the internal and external interfaces carrying the flows (R20a p.581). Functional architecture is about input-output transformation; behavioral architecture, about the sequencing and control of actions (R20a p.581), is modeled in Week 10.' },
        { kind: 'figure', slide: 'w4s1-functional-view' },
        { kind: 'heading', text: 'Decomposition, and its pitfalls' },
        { kind: 'para', text: 'The hierarchy starts from the mission as one black-box function and breaks down until the leaf functions have known, feasible or imaginable physical solutions; it is populated over several iterations, generally not by a single top-down pass (R20b p.587). SEBoK’s pitfalls (R20b p.594): not relating the architecture back to the operational scenarios; decomposing too deeply; forgetting inputs and outputs, which are integral parts of a function; and relying on a static decomposition alone. Its proven practice: establish scenarios of functions before building the tree. For breadth, five plus or minus two elements per level is a common guideline (R20c p.597).' },
        { kind: 'figure', slide: 'w4s1-decomposition' },
        { kind: 'table', header: ['First-level function', 'Leaf functions'], rows: GROUPS.map((g) => [`${g.id} ${g.name}`, functionsOfGroup(g.id).map((f) => `${f.id} ${f.name}`).join('; ')]), caption: `AeroLink: ${MISSION_FUNCTION.name}, decomposed into ${C.groups} first-level functions and ${C.functions} leaves (grouping proposed; FICTIONAL).` },
      ],
    },
    {
      id: 'w4-lesson-walk',
      title: 'Finding functions by walking scenarios',
      sources: [R('R20b', '594'), R('R20b', '592'), R('R48c', '145'), R('R20c', '598')],
      blocks: [
        { kind: 'para', text: 'Read a Week 2 scenario step by step and ask, at each step, which transformation the step needs. Several steps can share one function; a step no existing function serves is a new function, or a gap to record. Steps where a person decides still belong to a function: the DoD guidebook lists human operations among the targets functions are allocated to (R48c p.145).' },
        { kind: 'figure', slide: 'w4s1-worked-walk' },
        { kind: 'para', text: `On AeroLink the Passenger Ride Request scenario needs only two functions: steps 1 to 4 and 6 are one transformation, request in and confirmed booking out (${fn('FN-001').name}), and step 5 is another with its own 60-second requirement (${f2.name}). The Weather Disruption scenario is more revealing. Diversions in step 3 load the remote operators, and no reference function limits their workload: walking the step exposes ${f17.id} ${f17.name}. Steps 5 and 6, notifying passengers and taking their choice, have no reference function at all: walking them exposes ${f15.id} ${f15.name}, which serves the requirements Week 3 wrote to close the Week 2 audit gap. A third function, ${fn('FN-016').id} ${fn('FN-016').name}, closes the Week 2 open item for the insurers’ auditable record.` },
        { kind: 'para', text: `Then check the other direction. Of the ${C.capabilities} capabilities, ${C.capabilitiesServed} are served by a function. ${capability('CAP-011').name} is not, by design: ${CAPABILITY_DISPOSITIONS['CAP-011']} SEBoK explains that stakeholder concerns often arrive as expected properties from which architects deduce design properties (R20c p.598). Every one of the ${C.systemRequirements} system requirements is allocated to a function, which is the traceability SEBoK asks the logical architecture to establish (R20b p.592); the planning function ${fn('FN-013').name} has no requirement, and the record says why.` },
        { kind: 'figure', slide: 'w4s1-capabilities' },
        { kind: 'table', header: ['Function', 'Inputs', 'Outputs', 'From', 'Requirements'], rows: FUNCTIONS.map((f) => [`${f.id} ${f.name}`, f.inputs.map((x) => x.item).join('; '), f.outputs.map((x) => x.item).join('; '), [...f.capabilities, ...f.scenarios].join(', ') || '—', f.requirements.join(', ') || '— (planning)']), caption: 'The AeroLink function table (FICTIONAL; FN-015 to FN-017 proposed).' },
      ],
    },
    {
      id: 'w4-lesson-allocation',
      title: 'Logical and physical elements, allocation and the decision record',
      sources: [R('R19', '571'), R('R20b', '587'), R('R20c', '596'), R('R20c', '597'), R('R20c', '598'), R('R20c', '599'), R('R20c', '600'), R('R20c', '602'), R('R48c', '146')],
      blocks: [
        { kind: 'para', text: 'Logical configuration items have allocated functions, interfaces and performance requirements but no specific implementation; physical configuration items are the specific implementation of each logical element (R19 p.571). A logical architecture is a set of related technical concepts and principles supporting the logical operation of the system (R20b p.587); a physical architecture is an arrangement of physical elements, system elements and physical interfaces, providing the solution for a product, service or enterprise, and system requirements are allocated to both (R20c p.596). System elements include hardware, software, data, humans, processes, procedures and facilities (R20c p.597).' },
        { kind: 'figure', slide: 'w4s1-logical-physical' },
        { kind: 'para', text: 'Partitioning and allocation use criteria to find affinities between functions (R20c pp.598–599): similar transformations within the same technology; similar levels of efficiency; exchange of the same type of flow (information, energy, materials); centralized or distributed control; execution at a close frequency level; dependability conditions; environment resistance level; other enterprise constraints. A candidate physical architecture may aim at fewer interfaces, separately testable elements, compatible technology, proximity, ease of handling, shared resources, modularity and resilience (R20c p.599); the outputs include an allocation matrix and a traceability matrix to the system requirements (R20c p.600). The course adds one rule: every allocation carries a sentence naming its criterion and the ID it rests on.' },
        { kind: 'para', text: 'Two pitfalls (R20c p.602): passing straight from requirements to a physical architecture with no logical model, and allocating high-level functions straight onto technologies instead of alternating logical and physical levels.' },
        { kind: 'figure', slide: 'w4s1-worked-allocation' },
        { kind: 'table', header: ['Function', 'Logical', 'Physical', 'Criterion and reason'], rows: FUNCTIONS.map((f) => [`${f.id} ${f.name}`, `${f.log} ${logical(f.log).name}`, `${f.phy} ${physical(f.phy).name}`, `${Cap(criterionLabel(f.criterion).toLowerCase())}: ${f.why}`]), caption: `The AeroLink allocation (FICTIONAL; the reasons are instructor proposals). Physical view after the Week 3 decision: ${CONFIGURATION.aircraft} aircraft, ${CONFIGURATION.hubs} hubs, ${CONFIGURATION.turnaroundChargers} turnaround chargers.` },
        { kind: 'para', text: `Architecture decisions are engineering records. ${ARCH_DECISION.id} asks: ${ARCH_DECISION.question} The alternatives were ${ARCH_DECISION.alternatives.join('; ').toLowerCase()}. The choice, ${ARCH_DECISION.chosen.toLowerCase()}, rests on this rationale: ${ARCH_DECISION.rationale} It is tested against ${ARCH_DECISION.tests.map((t) => `${t.id} (${t.verdict})`).join(', ')}. Its conditions, ${ARCH_DECISION.conditions.join('; ')}, are derived requirements: the DoD guidebook says derived requirements come from solution decisions and must stay traceable (R48c p.146).` },
        { kind: 'figure', slide: 'w4s1-decision' },
      ],
    },
    {
      id: 'w4-lesson-enterprise',
      title: 'The enterprise view and the process frame',
      sources: [R('R20c', '597'), R('R62', '345'), R('R48c', '144'), R('R48c', '145'), R('R48c', '146')],
      blocks: [
        { kind: 'para', text: `The enterprise view shows who owns each element and which agreements bind the owners. Organizations are architecture elements: SEBoK lists corporate units, departments, projects and teams as the elements of an enterprise system (R20c p.597). In AeroLink, ${owned('AeroLink').length} physical elements belong to AeroLink and ${owned('Vertiport operators').length} to the vertiport operators; agreements such as the ${AGREEMENTS[0].name.toLowerCase()} record duties between them. An agreement carries no data: information needs an information interface, a rule Session 2 makes explicit. Views of the as-is and to-be architectures help stakeholders see migration paths (R62 p.345); Week 6 draws AeroLink’s to-be view.` },
        { kind: 'figure', slide: 'w4s1-enterprise-view' },
        { kind: 'para', text: 'The DoD guidebook frames the week as its Architecture Design process: a trade and synthesis method that translates the outputs of stakeholder requirements definition and requirements analysis into alternative design solutions (R48c p.144), iterating toward a balance of cost, schedule, performance and risk (R48c p.145). Functions are allocated to hardware, software, databases, facilities and human operations; the functional architecture belongs to the functional baseline and the physical architecture to the allocated and product baselines (R48c p.145). Derived requirements come from solution decisions and must be traceable; the output, the allocated baseline, must let the team confirm upward and downward traceability of requirements (R48c p.146).' },
        { kind: 'figure', slide: 'w4s1-process-frame' },
      ],
    },
  ],
}
