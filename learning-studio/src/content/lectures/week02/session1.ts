// Week 2, Session 1 lecture: ConOps / Requirements — from needs to operations: the concept of operations, scenarios and
// capabilities, and the two levels of requirement. 75-minute session: 69 minutes of planned content on 23 slides plus the
// generated "References and credits" slide, and a 6-minute buffer (bufferMinutes). Single source for the slide viewer,
// the faculty notes, the .pptx and the student lesson (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG
// A20 (teach first, explain in depth, demonstrate, then assign) and A21 (the Week 1 architecture is the template).
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week02/WEEK02_LECTURE_OUTLINE.md §2.
//
// Accuracy rules followed:
//   - Every citation is a verified register entry (readings.generated.json) at a page whose extracted text
//     (_source_cache/*.txt) supports the claim beside it. Definitions are quoted verbatim and briefly; everything else is
//     original explanation. R39m–R39p (SEBoK glossary: ConOps, operational scenario, use case, capability) were added to
//     the register for this lecture, pending faculty confirmation.
//   - Course conventions are labeled as such (the scenario template, the course minimum of three scenario kinds, the
//     ConOps deliverable contents, the REQ-STK/REQ-SYS subject rule, the coverage matrix). Where no source in the
//     collection supplies a thing (IEEE Std 1362-1998, a scenario field set) the notes say so.
//   - AeroLink Urban Mobility is FICTIONAL. Week 1 data come from ../week01/aerolinkCase.ts (read-only); Week 2 data from
//     ./aerolinkCase.ts. Nothing is retyped.
//   - Timing: spoken notes (teach, worked solution, figure walk) stay at or below 130 words per minute (./timing.test.ts).
//   - Faculty notes and purposes are stripped from the student build (student-edition.ts); no note sentence is repeated in
//     the public text, so scripts/check-student-build.mjs can prove the stripping.
import type { Lecture } from '../types'
import { NEEDS, need } from '../week01/aerolinkCase'
import { CAP007_REFERENCE_TEXT, CANDIDATE_SCENARIOS, CAPABILITIES, CONOPS, CONOPS_ENVIRONMENT, DISCOVERIES, NEED_COVERAGE, SCENARIOS, SCENARIO_SOI, TURNAROUND_BUDGET, capability, requirement, scenario, scenariosOfCapability } from './aerolinkCase'
import { SCENARIO_FIELDS } from './labBrief'

export const WEEK2_S1_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const scn5 = scenario('SCN-005')
const scn1 = scenario('SCN-001')
const N_NEEDS = NEEDS.length
const proposedCaps = CAPABILITIES.filter((c) => c.provenance === 'proposed')
/** The proposed capabilities for the needs added in the Week 1 review (NEED-012..017); CAP-015 (NEED-011) is the M2 move. */
const addedNeedCaps = proposedCaps.filter((c) => c.needs.every((n) => Number(n.slice(5)) >= 12))
const movedCap = proposedCaps.find((c) => c.needs.includes('NEED-011'))!
/** Review M3: these claims are derived from the case data, not typed. */
const refCaps = CAPABILITIES.filter((c) => Number(c.id.slice(4)) <= 10)
const unbadged = refCaps.filter((c) => scenariosOfCapability(c.id).length === 0).map((c) => c.id)
const needsPerScenario = SCENARIOS.map((x) => ({ id: x.id, n: NEED_COVERAGE.filter((r) => r.where.some((w) => w.scenario === x.id)).length }))
const mostNeeds = needsPerScenario.reduce((a, b) => (b.n > a.n ? b : a))
const badgeText = SCENARIOS.map((x) => `${x.id} on ${x.capabilities.filter((c) => Number(c.slice(4)) <= 10).join(' and ')}`).join('; ')
const NUM_WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const idList = (ids: string[]) => (ids.length < 2 ? ids.join('') : `${ids.slice(0, -1).join(', ')} and ${ids.at(-1)}`)
const step = (s: typeof scn5, n: number) => s.steps.find((x) => x.n === n)!
const env = (label: string) => CONOPS_ENVIRONMENT.find((e) => e.label === label)!.value
const notExercised = NEED_COVERAGE.filter((r) => r.where.length === 0).map((r) => r.need)
const fieldList = SCENARIO_FIELDS.map((f) => f.label.toLowerCase()).join(', ')

export const WEEK2_SESSION1: Lecture = {
  week: 2,
  session: 1,
  title: 'ConOps / Requirements',
  subtitle: 'Session 1: From needs to operations: ConOps, scenarios and capabilities',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. framing (8 min)
    {
      id: 'w2s1-framing',
      title: 'Framing: from needs to requirements',
      slides: [
        {
          id: 'w2s1-title',
          title: 'ConOps / Requirements',
          subtitle: 'Session 1: From needs to operations: ConOps, scenarios and capabilities',
          purpose: 'Orient students to the scheduled subject, the two sessions and the additions the week makes to the Team Record.',
          minutes: 1,
          layout: 'title',
          body: [
            {
              kind: 'bullets',
              items: [
                'Today: the concept of operations, scenarios and capabilities, then the two levels of requirement',
                'Session 2: writing, checking and tracing requirements; measures; the Lab L2 launch',
                'Your Team Record grows: ConOps, scenarios, capabilities, requirements, measures',
              ],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the subject exactly as the schedule gives it: ConOps / Requirements. Make the promise: by the end of today you can write a concept of operations and its scenarios for your own enterprise, review a scenario, derive capabilities from needs, and say what separates a need, a stakeholder requirement and a system requirement.',
              'Say where the work lands: every team extends the Week 1 Team Record it handed in, for its instructor-approved enterprise. AeroLink stays the instructor’s worked example; no team models it.',
            ],
            why: 'Students who know the shape of the week can file each idea as it arrives, and naming the record parts tells them which ideas they must use within seven days.',
            examples: [
              'Instructor preparation (not for students): confirm before class that every team’s enterprise proposal has been approved, since Week 2 work starts from it. Decide the open items flagged in the notes of slides 9, 14 and 19 (the clock times of the operating day, the scenario boundary choice, the proposed capabilities).',
              'Timing plan: 69 minutes of content and a 6-minute buffer. If the session runs long, shorten slide 8 or slide 12; never shorten the worked scenario (slide 14) or the coverage check (slide 16).',
            ],
            misconceptions: [{ claim: 'Week 2 is about wording: turning needs into “shall” sentences.', correction: 'Week 2 is analysis. Scenarios and capabilities come first because they expose what the needs did not say; the wording follows.' }],
            transition: 'First, a question about AeroLink. We answer it at the end of the session.',
            timing: '1 min: 30 s subject and promise, 30 s the record.',
          },
        },
        {
          id: 'w2s1-driving-question',
          title: 'The driving question: can we write requirements now?',
          purpose: 'Create a need to know before any explanation, and surface the belief that well-formed needs are enough to write requirements from.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-driving-question',
            caption: `AeroLink ends Week 1 with ${N_NEEDS} needs in the recommended form. Can the team go straight to “shall”? (FICTIONAL)`,
            alt: 'A stack of need cards on the left labeled 17 needs, recommended form (Week 1), the top card reading NEED-004 Pads not limited by turnaround. On the right an empty requirements table with columns ID, Statement and Parent. A solid arrow labeled shall? jumps from the stack to the table. Below it a dashed detour passes through a small three-panel storyboard frame marked with a large question mark.',
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Scenario (FICTIONAL)', text: `AeroLink has ${N_NEEDS} well-formed needs. A team member proposes to write the “shall” statements now.` },
            { kind: 'bullets', items: ['**A** · Yes: the needs are complete', '**B** · First describe how the service will be operated', '**C** · First choose the technology', '**D** · Cannot tell yet'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the scenario. Allow thirty seconds of silent thought, then take a show of hands for A to D and write the distribution on the board without comment.',
              'Ask one student who chose A and one who chose B for a reason each. Expect A to be defended with Week 1’s own standard: the needs passed the six checks, so they are complete. Expect C from students with design experience: you cannot say how fast a charger is until you choose one.',
              'Do not resolve it. Say that the answer comes on slide 22, after we have written one scenario in full and seen what it finds. Point out that the dashed detour in the figure is the question: does the route from needs to requirements have to pass through a description of operation?',
            ],
            why: 'A prediction made before instruction creates a need to know, and the A answer exposes a real misconception: that the quality of individual needs guarantees the completeness of the set. The withheld answer gives the session an arc that closes on slide 22.',
            figure: 'Point at the stack of seventeen needs, then at the empty table: the solid arrow is the shortcut the team member proposes. The dashed detour through the storyboard is the alternative; do not name it yet.',
            examples: [
              'Typical reasoning for C: “the charge-time requirement depends on the charger, so pick the charger first.” Note it on the board; slide 21 shows the opposite order, a time budget first and the charger rating derived later.',
              'An analogue from another domain: a hospital writes requirements for a new patient-transfer service straight from interviews and discovers in the first night shift that nobody owned the hand-over between wards. The interviews were sound; nobody had walked through a night.',
            ],
            misconceptions: [{ claim: 'If every need passes the quality checks, the set is complete.', correction: 'The checks judge each statement; completeness of the set is a different question, and operational scenarios are one way to test it.' }],
            transition: 'To answer it, we first locate this week in the process frame you met in Week 1.',
            timing: '3 min: 30 s read, 30 s think, 1 min vote, 1 min two reasons.',
          },
        },
        {
          id: 'w2s1-process-frame',
          title: 'Where Week 2 sits in the process frame',
          purpose: 'Locate the week: System Requirements Definition, the third technical process, and its two inputs, the integrated set of needs and the life-cycle concepts that include the operational concept.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-process-inputs',
            caption: 'The ISO/IEC/IEEE 15288:2015 technical processes as SEBoK lists them. Week 2 works in the third, System Requirements Definition, which takes two inputs.',
            alt: 'Fourteen process cells in two rows of seven: Business or Mission Analysis; Stakeholder Needs and Requirements Definition; System Requirements Definition; Architecture Definition; Design Definition; System Analysis; Implementation; Integration; Verification; Transition; Validation; Operation; Maintenance; Disposal. The first two cells are tagged Week 1 and the third, highlighted, Week 2. Two arrows enter the third cell: integrated set of needs (Week 1), and life-cycle concepts, including the operational concept (this week).',
          },
          body: [
            {
              kind: 'bullets',
              items: ['System Requirements Definition: the third technical process', 'It turns the stakeholder view into a technical, developer view', 'Inputs: life-cycle concepts and the integrated set of needs', 'The operational concept is one of those life-cycle concepts'],
            },
          ],
          sources: [R('R98', '1001'), R('R13', '557'), R('R13', '561'), R('R10', '546')],
          notes: {
            teach: [
              'Recall the strip from Week 1. SEBoK’s table of the 15288:2015 technical processes lists Business or Mission Analysis first, Stakeholder Needs and Requirements Definition second and System Requirements Definition third (R98 p.1001). If students open that page, warn them: the table sits in SEBoK’s diversity, equity and inclusion article, which sets the 15288 technical processes against inclusion considerations; the process order is what we use from it. Week 1 worked in the first two; this week works in the third.',
              'Read SEBoK’s description: the process “transforms the stakeholder view of desired capabilities into a technical, developer view”, and its inputs are “the life cycle concepts and integrated set of needs” (R13 p.557). The second input is your Week 1 output. The first is new: SEBoK names the operational concept as one of the life-cycle concepts, and says operational concepts include modes, scenarios, use cases, misuse cases and loss scenarios (R10 p.546).',
              'So the source itself puts an operational description on the path to requirements. That is a strong hint for the driving question, but do not say so yet.',
            ],
            why: 'Students need to see that the operational concept is a named input of the requirements process, not a course whim; it justifies the time spent on ConOps before any “shall”.',
            figure: 'Point at cells 1 and 2 (Week 1), then cell 3. Trace the two arrows into it: the needs from last week and the life-cycle concepts from this week. The other eleven processes return in later weeks.',
            misconceptions: [{ claim: 'The processes run in strict order: first all needs, then all requirements.', correction: 'They are iterative and recursive; SEBoK describes requirements definition as performed concurrently with architecture definition (R13 p.561). The order shows dependence, not a waterfall.' }],
            transition: 'One retrieval question before we go on, because the whole week rests on it.',
            timing: '2 min: 1 min the strip, 1 min the two inputs.',
          },
        },
        {
          id: 'w2s1-retrieval',
          title: 'Retrieval: needs are the black box, requirements the white box',
          purpose: 'Spaced retrieval of the central Week 1 distinction, applied to a sentence that mixes a need’s subject with a requirement’s wording.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-mirror',
            caption: 'The same concern from two sides: the residents’ need (Week 1) and the requirement this week will write.',
            alt: 'Two panels. On the left, Need: stakeholder’s view, black box, outside, containing NEED-003: Communities near vertiports need the air-taxi service to keep take-off and landing noise exposure at nearby homes within the agreed limits on the loudness of each event and on the number of events in the evening and early morning. On the right, Requirement: developer’s view, white box, inside, a dashed empty card reading written this week: The AeroLink service shall … An arrow between them is labeled transformation = analysis.',
          },
          body: [
            { kind: 'bullets', items: ['Needs: what stakeholders expect, from the outside (black box)', 'Requirements: what the system must do, from the inside (white box)'] },
            { kind: 'callout', tone: 'key', title: 'Card question', text: '“The air-taxi service shall keep pad-edge noise at or below 65 dBA.” Need or requirement? Who is speaking?' },
          ],
          sources: [R('R13', '558')],
          notes: {
            teach: [
              'Ask everyone to write an answer on a card in thirty seconds, then take three answers.',
              'Model answer: it is written as a requirement, with “shall” and a measurable value, and nobody in it is speaking for a stakeholder. It has dropped the residents, who were the subject of NEED-003, and it has dropped half of their need: the number of evening and early-morning events. SEBoK’s distinction is in the perspective: needs communicate the stakeholder’s expectations from an external, black-box view; requirements communicate what the system must do from an internal, white-box view (R13 p.558).',
              'Add the consequence for this week: a requirement is not a need with a new subject. SEBoK says generating a requirement statement is more than changing the subject of the need statement; it is an analysis of what the system must do (R13 p.558). We will see that analysis on slide 21 and, for the noise need, in Session 2.',
            ],
            why: 'Retrieval strengthens the Week 1 distinction just before it is used, and the deliberately half-complete sentence previews the noise correction that the requirements must carry.',
            figure: 'Left panel: the residents speak, about the effect on their homes. Right panel: empty; the service will speak, in “shall” terms. The arrow says what fills it: analysis, not rewording.',
            misconceptions: [{ claim: 'Replacing “need” with “shall” turns a need into a requirement.', correction: 'That changes the wording but not the content; SEBoK calls the transformation an analysis, and one need can yield several requirements.' }],
            transition: 'Before we say what the system shall do, we describe how it will be used, by whom, and what happens when things go wrong.',
            timing: '2 min: 30 s write, 1 min answers and model answer, 30 s consequence.',
          },
        },
      ],
    },
    // ============================================================================================ B. the concept of operations (15 min)
    {
      id: 'w2s1-conops',
      title: 'The concept of operations',
      slides: [
        {
          id: 'w2s1-conops-what',
          title: 'What a ConOps is, and why it comes before requirements',
          purpose: 'Define the artifact from MITRE and give its purposes: the user’s operational needs without the technical solution, a first step toward requirements, a living document.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-conops-timeline',
            caption: 'The ConOps is drafted at concept and revised after developmental and operational testing; it feeds the requirements and the test planning.',
            alt: 'A life-cycle line from Concept through Development, developmental testing and operational testing to Operation. Document icons mark ConOps v1 at Concept, v2 after developmental testing and v3 after operational testing, with the words a living document along the line. Two arrows lead down from v1 to boxes labeled requirements and test planning.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'A user-oriented document: the proposed system from the user’s perspective',
                'Operational needs, desires and expectations, without the technical solution',
                'Often a first step toward system requirements',
                'States critical top-level performance objectives, with rationale',
                'Updated after developmental and operational testing',
              ],
            },
          ],
          sources: [R('R52', '298–299')],
          notes: {
            teach: [
              'Give MITRE’s definition, which quotes its source: a CONOPS is a user-oriented document that “describes systems characteristics for a proposed system from a user’s perspective”, and also describes the user organization, mission and objectives (R52 p.298).',
              'Give the purpose in MITRE’s words: to describe the operational needs, desires, visions and expectations of the user without being overly technical or formal, and without addressing the technical solution or implementation; it is often a first step for developing system requirements (R52 p.299).',
              'Two further points from the same page. A CONOPS should define any critical, top-level performance requirements or objectives, with their rationale. And the original should be updated after developmental and operational testing, because fielded systems gain capabilities nobody planned and lose some that trade-offs removed (R52 p.299).',
              'Draw the conclusion for the driving question: the ConOps sits between the needs and the requirements, in the user’s language, so that both sides agree what operation will look like before anyone commits to “shall”.',
            ],
            why: 'Students should know what the artifact is for before they learn its parts; the purpose explains every later rule (user language, no solution, scenarios).',
            figure: 'Follow the line left to right: v1 at concept, then a revision after each test phase. The two downward arrows are why it comes first: requirements and test planning both start from it.',
            examples: ['MITRE also quotes the Office of Management and Budget: a CONOPS describes the proposed system in terms of the user needs it will fulfill, its relationship to existing systems or procedures, and the ways it will be used (R52 p.299). Useful for students from government programs.'],
            misconceptions: [
              { claim: 'A ConOps is a design overview written for engineers.', correction: 'It is written for and from the user, deliberately without the technical solution; design comes later.' },
              { claim: 'Once requirements exist, the ConOps is obsolete.', correction: 'MITRE expects it to be updated after testing to show how the system will actually be used.' },
            ],
            transition: 'Three similar names float around this artifact. Sorting them out lets you read the sources without confusion.',
            timing: '3 min: 1 min definition, 1 min purpose, 1 min objectives, updates and the conclusion.',
          },
        },
        {
          id: 'w2s1-three-names',
          title: 'Three names: concept of operations, operational concept, CONOPS',
          purpose: 'Give honest terminology from the SEBoK glossary and MITRE, and state the course convention for the team deliverable.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-conops-levels',
            caption: 'Two levels of statement in the SEBoK glossary, and where MITRE’s CONOPS and the team’s Week 2 ConOps sit.',
            alt: 'A wide upper band labeled Concept of operations: an organization’s assumptions or intent for an operation or series of operations (enterprise level). Inside it a box labeled Operational concept: the operation of a system or related set of systems, from the users’ and operators’ view (system level). The lower box carries a tag MITRE’s CONOPS sits here and a star badge Your Week 2 ConOps (course convention). A note at the bottom reads SEBoK: the two are slightly different.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Concept of operations: an organization’s intent for an operation or series of operations',
                'Operational concept: the same, for a system or related set of systems',
                'MITRE’s CONOPS: user-oriented, about a proposed system',
                '**Course convention:** your ConOps is the operational concept of your system of interest',
              ],
            },
          ],
          sources: [R('R39m', '1469'), R('R39g', '1579'), R('R52', '298')],
          notes: {
            teach: [
              'Read the SEBoK glossary entry for Concept of Operations, taken from ISO/IEC 29148: a “verbal and graphic statement, in broad outline, of an organization’s assumptions or intent in regard to an operation or series of operations” (R39m p.1469). The discussion adds that it is frequently embodied in long-range strategic plans and annual operational plans, and that it provides the basis for bounding the operating space, system capabilities, interfaces and operating environment.',
              'Then the Operational Concept entry: the same form of words, but for an operation or series of operations “of a system or a related set of systems” (R39g p.1579). SEBoK itself says the two are slightly different (R39m p.1469). One is about an organization’s operations; the other about how a particular system is operated.',
              'MITRE’s CONOPS, from the previous slide, is a user-oriented document about a proposed system (R52 p.298): in SEBoK’s terms it is close to an operational concept.',
              'State the course convention plainly: the team’s Week 2 ConOps is the operational concept of the system of interest inside the team’s enterprise, written from the users’ and operators’ perspective. We keep the familiar name ConOps for it.',
            ],
            why: 'Students will meet all three terms in their readings and in industry; an honest map prevents the confusion of treating them as synonyms, and the convention fixes what the team must write.',
            figure: 'Upper band: the organization’s intent, the enterprise level. Lower box: one system’s operation. Point at the two tags on the lower box: MITRE’s usage and the team deliverable both live there.',
            examples: ['In AeroLink terms: the enterprise’s concept of operations would be its plan for running urban air mobility across the region over several years; the Week 2 ConOps is how the air-taxi service is operated day to day.'],
            misconceptions: [{ claim: 'ConOps, operational concept and CONOPS are interchangeable.', correction: 'SEBoK separates the organization-level concept of operations from the system-level operational concept; MITRE’s CONOPS is close to the second.' }],
            transition: 'Whatever the name, what must the document contain?',
            timing: '3 min: 1 min each glossary entry with its discussion, 1 min MITRE and the convention.',
          },
        },
        {
          id: 'w2s1-conops-contents',
          title: 'What every ConOps must contain',
          purpose: 'Give MITRE’s critical components and further objectives, and the course deliverable contents, so that each section of the team’s ConOps has a reason.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-conops-toc',
            caption: 'A ConOps table of contents. Each part serves an objective MITRE names; parts 4–5 are the course’s additions to the critical components.',
            alt: 'A document card titled ConOps: contents, with six items: 1 Existing situation; 2 Justification and restrictions; 3 Proposed system; 4 Operational environment and constraints; 5 User interactions; 6 Operational scenarios. A bracket marks items 1, 2, 3 and 6 as critical components (MITRE, from IEEE 1362) and items 4 and 5 as course deliverable contents. Tags on the right are linked to the document: traceability, needs to source requirements; basis for requirements; basis for test planning; system capacity; discover implicit requirements.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                { text: 'Critical components (MITRE, from IEEE 1362):', sub: ['the existing system; the justification and restrictions', 'the proposed system; scenarios in the user’s environment'] },
                'Objectives: traceability, a basis for requirements and test planning, system capacity, implicit requirements',
                '**Course deliverable:** mission, environment, scenarios, user interactions, constraints',
              ],
            },
          ],
          sources: [R('R52', '300–301')],
          notes: {
            teach: [
              'MITRE presents IEEE Std 1362-1998 as a well-developed and commonly used ConOps guideline (R52 p.300). When it is tailored, noncritical parts may be cut, but four critical components stay: the existing system the user wants to replace; the justification for a new or modified system, including restrictions on it; a description of the proposed system; and scenarios highlighting use of the system in the user’s environment, including internal and external factors (R52 p.301).',
              'Then MITRE’s additional objectives on the same page: end-to-end traceability between operational needs and captured source requirements; a high-level basis for requirements and for test planning; support for operational analysis models such as use cases; a basis for computing system capacity; and validating and discovering implicit requirements (R52 p.301). The last one is the reason this week starts here.',
              'Give the course deliverable: mission, operational environment, operational scenarios, user interactions and operational constraints. These are a course convention from the deliverable specification; they overlap MITRE’s components and add the environment and the interactions explicitly.',
              'Be honest about a gap: IEEE 1362 itself is not in our collection, so we teach its components only as MITRE summarizes them.',
            ],
            why: 'A list of sections with no reasons produces form-filling; tying each section to an objective tells students what a weak section will cost later (no capacity basis, no test basis).',
            figure: 'Read the six items, then the bracket: four are MITRE’s critical components, two are course additions. Follow the tags: each section earns its place by an objective.',
            examples: ['For a food-bank distribution service: existing situation, volunteers phoning pantries; justification, food reaches pantries unevenly; restriction, refrigerated storage at only two sites; proposed system, scheduled routes with demand forecasts; scenarios, a normal delivery day, a refrigeration failure, a donation surge.'],
            misconceptions: [{ claim: 'The scenarios are an appendix to the ConOps.', correction: 'They are one of the four critical components, and the part that exposes implicit requirements.' }],
            transition: 'Contents are half the job. MITRE is just as specific about how a ConOps should be written.',
            timing: '3 min: 1 min critical components, 1 min objectives, 1 min course contents and the source gap.',
          },
        },
        {
          id: 'w2s1-writing-well',
          title: 'Writing it well: the user’s language, environment, constraints',
          purpose: 'Teach the craft of the document from MITRE’s best practices, including why an untestable user phrase is acceptable in a ConOps.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-before-after',
            caption: 'The same dispatch step in an engineer’s jargon and in the passenger’s and operator’s words, with a glossary entry (instructor-written, FICTIONAL).',
            alt: 'Two cards. Before, engineer’s jargon: On REQ trigger the dispatcher service runs the assignment heuristic over the SOC-qualified pool and pushes a slot to the client. After, the passenger’s and operator’s words: When you confirm a ride, we assign an aircraft with enough charge and send you your pad and boarding time within a minute. A glossary call-out: dispatch-ready means charged to the dispatch threshold, with no open no-go fault. Both cards are labeled instructor-written example (FICTIONAL).',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'The user’s perspective and language; a glossary for jargon',
                'Simple, clear and graphic: use cases, storyboards, sequence charts',
                'The operational environment in detail: assumptions, constraints, numbers, capacity',
                'Physical environment, safety, security and privacy',
                '“Highly reliable” is acceptable here; quantifying it comes later',
              ],
            },
          ],
          sources: [R('R52', '302')],
          notes: {
            teach: [
              'Walk MITRE’s best practices (R52 p.302): describe the system from the users’ perspective; simply and clearly; in the user’s language, avoiding technical jargon and adding a glossary when user jargon is needed; with graphics, because different kinds of stakeholders must understand it, MITRE’s list including use cases, sequence or activity charts and storyboards.',
              'Two practices matter most for later weeks. Describe the operational environment in detail, its assumptions, constraints, numbers, versions and capacity; and describe the physical environment, safety, security and privacy aspects that influence operation. Those numbers become requirement values; those aspects become the security and resilience threads of Weeks 3, 5 and 6.',
              'Then a subtle point on the same page: the ConOps is a place where users can state a need such as a “highly reliable” system, with their reasons, without producing a testable requirement. Quantifying it is the job of the buyer or the developer, during requirements analysis (R52 p.302). So a vague phrase is a defect in a requirement but legitimate in a ConOps, as long as someone owns turning it into a number.',
            ],
            why: 'Teams write ConOps in engineer’s language by default; the before-and-after makes the cost visible, and the reliability point prevents the opposite error of forcing numbers too early.',
            figure: 'Read the jargon version aloud and ask who could check it: only the developers. Read the second version: a passenger and an operator can both say whether it is true. Point at the glossary entry: jargon kept, but translated.',
            examples: ['Ask the class what is lost in translation: “SOC-qualified pool” carried a precise rule. The glossary entry keeps the rule without forcing it on the passenger.'],
            misconceptions: [{ claim: 'A ConOps must be quantified throughout, like a specification.', correction: 'It records the environment’s numbers in detail, but users may state qualitative needs; quantifying them is later analysis.' }],
            transition: 'Here is the AeroLink ConOps as one picture, before we take it apart into scenarios.',
            timing: '3 min: 1 min the practices, 1 min environment and safety, 1 min the reliability point with the figure.',
          },
        },
        {
          id: 'w2s1-aerolink-conops',
          title: 'The AeroLink ConOps at a glance',
          purpose: 'Show the whole worked artifact before its parts: environment, external systems and where each of the five scenarios occurs.',
          minutes: 3,
          layout: 'figure',
          figure: {
            id: 'w2s1-ov1-storyboard',
            caption: 'The AeroLink operational concept as one picture: the network, the operations center, the external systems and where each scenario occurs. Original drawing in the style of an OV-1 overview; all values FICTIONAL.',
            alt: 'An original overview picture in the style of an OV-1. Under a dashed dome labeled Controlled airspace, six vertiports V1 to V6 are joined by thin lines; V1, V3 and V5 are boxes marked hub, the others circles. A highlighted V1–V2 leg carries an aircraft and the label 25 km, about 10 min. Around the network: a Weather cloud near V3; an Electric grid power line along the bottom with drops to the three hubs; a Public transport network rail track at lower left; an Operations center building; an Emergency response service building; a Maintenance hangar fed by a box Aircraft and spares supply. Numbered badges: SCN-001 at a passenger with a phone near V1; SCN-002 on the V1–V2 leg; SCN-003 at a charger under the V3 hub; SCN-004 at the maintenance hangar; SCN-005 at the weather cloud near V3. A corner panel reads 12 aircraft × 4 seats, 16 h day, 20 % energy reserve, 65 dBA per event (FICTIONAL).',
          },
          body: [],
          sources: [R('R54', '331')],
          notes: {
            teach: [
              `Walk the picture as a ConOps reader would. The existing situation and justification come from Week 1: ${CONOPS.existing} The proposed system, in the users’ words: ${CONOPS.proposed}`,
              `Read the environment panel: ${env('Network')}; ${env('Fleet')}; ${env('Operating day')}; ${env('Turnaround')}; ${env('Energy policy')}; ${env('Noise')}.`,
              'Name the external systems by system, as corrected in Week 1: controlled airspace, the electric grid, weather, aircraft and spares supply, the public transport network and the emergency response service. MITRE names the OV-1 overview view as one tool for recognizing external interfaces (R54 p.331); this drawing is original, in that style.',
              'Finish with the badges: five scenarios, each placed where it happens. The next section shows how to write one.',
            ],
            why: 'Seeing the whole artifact first gives students a frame for the parts; the badges connect the picture to the scenarios they will analyze for the rest of the session.',
            figure: 'Start at the operations center, go out along the flight leg, then round the external systems clockwise; finish with the five badges in number order.',
            examples: ['Instructor decision (not for students): the 06:00–22:00 clock times and the evening and early-morning event cap are proposed values; confirm or change them before class.'],
            misconceptions: [{ claim: 'The overview picture is the ConOps.', correction: 'It is one graphic inside it; the narrative, the environment table and the scenarios carry the content.' }],
            transition: 'A ConOps becomes something we can analyze when it is broken into scenarios. First, the vocabulary.',
            timing: '3 min: 1 min situation and proposal, 1 min environment, 1 min external systems and badges.',
          },
        },
      ],
    },
    // ============================================================================================ C. scenarios (12 min)
    {
      id: 'w2s1-scenarios',
      title: 'Use cases, scenarios and mission threads',
      slides: [
        {
          id: 'w2s1-use-cases',
          title: 'Use cases, actors and threads',
          purpose: 'Define use case, actor (primary and secondary), thread and operational scenario from MITRE and the SEBoK glossary.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-actors-threads',
            caption: 'A use case inside the system boundary, its actors outside, and three threads through it.',
            alt: 'A boundary rectangle labeled system of interest. Outside on the left a stick figure labeled primary actor (has a goal that needs the system’s help). Outside on the right a box labeled secondary actor (the system needs its help). Inside, one use-case oval. Three thread lines run through the oval from a trigger marker: main thread to goal, alternate thread to goal, failure thread falls short.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Use case: goal-oriented interactions between actors and the system',
                'Actors are outside the system: users, roles, other systems',
                'Primary: has a goal; secondary: the system needs its help',
                'Thread: one path through a use case',
              ],
            },
            { kind: 'definition', term: 'Operational scenario (SEBoK glossary)', text: '“Description of an imagined sequence of events that includes the interaction of the product or service with its environment and users …”', source: R('R39n', '1581') },
          ],
          sources: [R('R59', '452–453'), R('R39o', '1669')],
          notes: {
            teach: [
              'MITRE: a use case defines a goal-oriented set of interactions between external actors and the system under consideration. Actors are parties outside the system that interact with it; an actor may be a class of users, a role, or another system. A primary actor has a goal requiring the system’s assistance; a secondary actor is one from which the system needs assistance (R59 p.453).',
              'A mission scenario or thread is one path through a use case: one thread for the main flow, others for variations such as options, errors and breaches (R59 p.452). Mission threads drive the architecture and are the basis of test cases (R59 p.453), which is why Week 10 will model them and Week 12 will verify against them.',
              'Read the SEBoK glossary definition of operational scenario on the slide; the full entry continues “as well as interaction among its product or service components”, and its discussion says scenarios are used to evaluate requirements and design and to verify and validate the system (R39n p.1581). The glossary’s use-case entry calls a use case a description of the behavioral requirements of a system and its interaction with a user (R39o p.1669).',
              'In this course we use scenario and thread interchangeably for one path, and use case for the goal they serve.',
            ],
            why: 'Students need exact vocabulary before the template, and the actor rule (outside the system) is the single most common error in student scenarios.',
            figure: 'The rectangle is the boundary; both actors sit outside it. The primary actor wants something; the secondary actor helps the system. Trace the three threads: two reach the goal, one falls short.',
            misconceptions: [
              { claim: 'Our own software, inside the system, is an actor in our scenario.', correction: 'Actors are parties outside the system; a part of the system of interest performs steps, but it is not an actor.' },
              { claim: 'A use case and a scenario are the same thing.', correction: 'A use case is the goal and its set of paths; a scenario or thread is one path through it.' },
            ],
            transition: 'With the vocabulary in place, here is the template you will fill for your own enterprise.',
            timing: '3 min: 1 min actors, 1 min threads and why they matter later, 1 min the SEBoK definitions.',
          },
        },
        {
          id: 'w2s1-scenario-anatomy',
          title: 'Anatomy of a scenario: the course template',
          purpose: 'Give the seven-field course template, its basis in MITRE, and the rule that the scenario system of interest decides who is an actor.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-scenario-card',
            caption: 'The course scenario template: seven fields under a stated scenario system of interest (course convention, built on MITRE’s description of use cases).',
            alt: 'An annotated blank scenario card. A header line reads Scenario system of interest. Fields in order: Actors, with markers for the primary actor and for an environmental factor; Trigger; Preconditions; Main flow, five numbered lines of the form actor: action; Alternate flows, A1 from step 3 rejoining at step 5 and A2 from step 2 that ends; Success end state; Failure end state. Margin arrows point to branch from step 3, rejoin at step 5, and to separate success and failure end states.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Paths run from a trigger to the goal, or fall short of it',
                'Simple steps in the user’s language: intent, not screens or implementation',
                `**Course template:** ${fieldList}`,
                'State the scenario system of interest: it decides who is an actor',
              ],
            },
          ],
          sources: [R('R59', '453–454')],
          notes: {
            teach: [
              'Start from MITRE. Use cases record paths that take an actor from a trigger event to the goal (success scenarios), and paths that start from a trigger but fall short of the goal (failure scenarios). The interaction is a sequence of simple steps, in the language of the end user. Use cases specify intent, not user-interface design, and not implementation detail unless the actor needs it for assurance (R59 pp.453–454).',
              'Then the course template, which is a course convention: no source in our collection gives one field set. Actors, with the primary actor marked and environmental factors marked as environment; trigger; preconditions; a main flow with an actor on every step; alternate flows, each branching from a step and either rejoining a later step or ending; and separate success and failure end states.',
              'Stress the header line. Because actors are outside the system, the boundary you draw decides who counts as an actor. If the system of interest is the whole service including its staff, a dispatcher is inside and performs steps; if it is the operational system of aircraft and software, the dispatcher is an actor. Write the boundary on every scenario.',
            ],
            why: 'A shared template makes scenarios comparable and checkable; tying it to MITRE shows which fields are sourced and which are course choices, and the boundary rule prevents the actor error before it happens.',
            figure: 'Read the fields top to bottom. Point at the alternate-flow annotations: every alternate says where it branches and where it goes. Point at the two end states: failure is an outcome to design, not an absence of success.',
            misconceptions: [{ claim: 'A failure end state means the scenario failed to be written.', correction: 'It is the observable state when the actor’s goal is not met, and the system should leave things safe there; it is part of the design.' }],
            transition: 'A template tells you how to write one scenario. Which scenarios should you write?',
            timing: '3 min: 1 min MITRE, 1 min the template, 1 min the boundary rule.',
          },
        },
        {
          id: 'w2s1-scenario-coverage',
          title: 'Which scenarios? Coverage and the off-nominal case',
          purpose: 'Prevent the “sunny-day only” ConOps: sourced guidance on off-nominal, misuse and support scenarios, a completeness aid and a stopping rule, plus the course minimum.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-coverage-grid',
            caption: 'A coverage grid for the AeroLink scenarios: kind by part of the life cycle. Dashed cards are candidate scenarios not yet written (instructor synthesis).',
            alt: 'A three-by-three grid with rows Nominal, Off-nominal and Support and columns Operation, Logistics and maintenance, and Exceptional. SCN-001 and SCN-002 sit in Nominal, Operation. SCN-003 and SCN-004 sit in Support, Logistics and maintenance. SCN-005 sits in Off-nominal, Exceptional, beside a dashed candidate card Region-wide power cut. A dashed candidate card A passenger who books and cancels repeatedly sits in Off-nominal, Operation. The other cells show a dash.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Include off-nominal use cases, misuse cases and loss scenarios',
                'Threads cover support, maintenance, training and test, not only operations',
                'Vary the actors, inputs and modes; good actors doing bad things',
                'Enough when stakeholders can think of no more',
                '**Course minimum:** one nominal, one off-nominal, one support',
              ],
            },
          ],
          sources: [R('R10', '546'), R('R11', '553'), R('R59', '453'), R('R59', '455–456')],
          notes: {
            teach: [
              'SEBoK on both sides of the week: operational concepts include high-level modes or states, operational scenarios, potential use cases, misuse cases and loss scenarios (R10 p.546); and when eliciting from stakeholders, for each life-cycle stage, obtain expected and off-nominal use cases, scenarios, misuse cases and loss scenarios (R11 p.553).',
              'MITRE widens the life cycle: mission threads can describe tactical, logistical and support operations, and maintenance, training, test and development operations (R59 p.453).',
              'A completeness aid from MITRE: keep a list of ways the system may be parameterized, varying the importance of actors, the types of input, future modes of operation, situations when good actors do bad things, and exceptional circumstances, then iterate through your use cases to see if they cover them (R59 p.456). And a stopping rule: you have them all when the users, sponsor and other stakeholders cannot think of any more (R59 p.455).',
              'State the course minimum, a course convention: at least one nominal, one off-nominal (a disruption or failure) and one support scenario such as charging, maintenance or training.',
            ],
            why: 'Teams overwhelmingly write the happy path; the sources give them permission and method to go further, and the grid makes empty regions visible.',
            figure: 'Read the occupied cells: two nominal operations, two support activities, one off-nominal exception. Then the dashed candidates: a power cut, and a passenger who books and cancels repeatedly, a good actor doing a bad thing. Ask which empty cell worries them most.',
            examples: CANDIDATE_SCENARIOS.map((c) => `${c.name}: ${c.why}`),
            misconceptions: [{ claim: 'More scenarios are always better.', correction: 'MITRE warns against use cases that become wishful thinking beyond the operational user’s needs; coverage of situations matters, not volume.' }],
            transition: 'Writing scenarios is half the skill. The other half is reviewing them.',
            timing: '3 min: 1 min SEBoK, 1 min MITRE’s aid and stopping rule, 1 min the minimum and the grid.',
          },
        },
        {
          id: 'w2s1-scenario-review',
          title: 'Reviewing a scenario',
          purpose: 'Teach evaluation as well as authoring: MITRE’s review questions and pitfalls, applied by pairs to two steps of SCN-001, one a false alarm and one a valid finding.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-review-scn001',
            caption: 'SCN-001 under review: MITRE’s questions beside the main flow, and two margin comments, one valid and one a false alarm (FICTIONAL case).',
            alt: `On the left the main flow of SCN-001: ${scn1.steps.map((s) => `${s.n} ${s.actor}: ${s.text}`).join(' ')} On the right a checklist headed Review questions (MITRE): complete?; actor’s goal met?; simpler by a procedure or requirement change?; missing goals?; missing actors? Two margin comments with leader lines: on step 3, interface detail? No: it states what the passenger learns, not a screen, tagged false alarm; on step 5, within 60 s is a performance value: it belongs in a requirement, tagged valid.`,
          },
          body: [
            { kind: 'bullets', items: ['Complete? Will the actor’s goal be met?', 'Could a procedure or requirement change simplify it?', 'Missing goals? Missing actors?', 'Pitfalls: vague goals, ambiguous scope, interface detail, wishful thinking', '**Pairs:** SCN-001 steps 3 and 5'] },
          ],
          sources: [R('R59', '455–456')],
          notes: {
            teach: [
              'MITRE’s review questions: is the use case complete; am I confident the actor’s goal will be met; could a procedural or requirement change simplify the process; are any goals of the actors unaddressed; are any actors missing (R59 p.455).',
              'Then the pitfalls MITRE quotes from Gottesdiener: vague goals, ambiguous scope, nonfunctional requirements and user-interface detail in the use case text, too few use cases, and use cases that are wishful thinking well outside the operational user’s needs (R59 pp.455–456). And: do not describe the internal workings of the system (R59 p.456).',
              `Pair task, one minute. Step 3 says the system “${step(scn1, 3).text.replace(/\.$/, '')}”; step 5 says it “${step(scn1, 5).text.replace(/\.$/, '')}”. Is either a defect by MITRE’s rules?`,
              'Model answer. Step 3 is intent: it says what the passenger learns, not how a screen shows it; flagging it is a false alarm. Step 5 carries a nonfunctional requirement, the 60-second value, inside the scenario text: a valid finding. Keep the step as intent (“assigns a dispatch-ready aircraft”) and move the value to a requirement; Session 2 shows it as a system requirement.',
            ],
            why: 'Evaluation is a higher-order skill than authoring and is what the scenario clinic and the graduate memo assess; the false alarm teaches that a review comment needs a rule behind it.',
            figure: 'Left: the six steps. Right: the five questions. Follow the two leader lines: one comment is struck through as a false alarm, the other kept as valid, each with its reason.',
            misconceptions: [{ claim: 'Any number in a scenario is a defect.', correction: 'Numbers that describe the environment (25 km, 16 h) belong in the ConOps; a performance value the system must meet belongs in a requirement.' }],
            transition: 'Now one complete scenario, the hardest one: a bad-weather afternoon.',
            timing: '3 min: 1 min questions and pitfalls, 1 min pairs, 1 min model answer.',
          },
        },
      ],
    },
    // ============================================================================================ D. the AeroLink worked example (13 min)
    {
      id: 'w2s1-worked',
      title: 'The AeroLink worked example',
      slides: [
        {
          id: 'w2s1-worked-scn005',
          title: 'Worked example I: SCN-005 Weather Disruption, step by step',
          subtitle: 'Students propose four fields; the rest is revealed (FICTIONAL)',
          purpose: 'Model the full scenario method on the off-nominal case, with students proposing the four fields that carry the method (the boundary, the primary actor, the trigger and one alternate) and the rest revealed, including the explicit scoping of the scenario system of interest.',
          minutes: 6,
          layout: 'figure',
          figure: {
            id: 'w2s1-scn005-swimlane',
            caption: 'SCN-005 Weather Disruption as a swimlane: five lanes, weather as the environment, seven steps and three alternate flows (FICTIONAL).',
            alt: 'A swimlane headed Scenario system of interest: AeroLink operational system, and SCN-005 Weather Disruption. A shaded top band, Weather (environment), holds the trigger: forecast crosses a limit within 30 min (TBD-01), with an arrow into step 1. Five lanes from top to bottom: Duty manager, System, Pilot, Air traffic service, Passenger. Seven numbered boxes run left to right in their lanes: 1 flag V3 (System); 2 declare hold (Duty manager); 3 divert to alternate (Pilot); 4 accept revised intents (Air traffic service); 5 notify passengers (System); 6 accept new time or refund (Passenger); 7 lift hold after 30 min inside limits (Duty manager), then a success end state tag. A dashed alternates strip below holds A2 from step 2, region-wide: suspend, offer public transport, ending at an end marker; A1 from step 3, alternate degrading, nearest open vertiport or priority landing, with a dashed arrow up to step 5 labeled rejoin 5; and A3 from step 7, hold over 2 h: cancel and refund, ending at a failure end state tag.',
          },
          body: [],
          sources: [R('R59', '453–454')],
          notes: {
            teach: [
              'Run this as a guided construction on four fields only: the boundary, the primary actor, the trigger and one alternate. For each, ask the class for a proposal, take two, then reveal the reference and say why it reads as it does. Reveal the other fields yourself; proposals on all eight fields would take ten to twelve minutes.',
              `Boundary first, and say it is a choice: the scenario system of interest is the ${SCENARIO_SOI.name} (${SCENARIO_SOI.includes.join('; ')}); ${SCENARIO_SOI.outside} are outside it. That is narrower than Week 1’s system of interest, the air-taxi service including its people. We narrow it here so that the people who operate the system stay visible as actors.`,
              'Then actors and the trigger: ask “whose goal is this?” The duty manager’s: keep every flight inside limits and recover the schedule. Ask whether the weather is an actor; it has no goal and cannot be asked for help, so it is marked as environment.',
              'Then reveal the main flow, using the worked solution below. Ask for one alternate: which step can go wrong? Take two proposals, then reveal A1 to A3. Reveal the end states. Pause on alternate A2 and on step 5; the next slide returns to both.',
            ],
            why: 'A complete worked scenario before teams write their own is the core of teaching first (A20); building it from student proposals makes the method something they can repeat, and the off-nominal case is the one teams most often skip.',
            figure: 'Point at the header (the boundary), the weather band (environment, not a lane), then follow the numbered steps across the lanes. Show each alternate’s branch point and its marker: rejoin or end.',
            workedSolution: [
              `Actors: ${scn5.actors.map((a) => a.label).join('; ')}.`,
              `Trigger: ${scn5.trigger} The limit values are unknown, so the trigger carries TBD-01 rather than an invented number.`,
              `Preconditions: ${scn5.preconditions}`,
              ...scn5.steps.map((s) => `Step ${s.n} (${s.actor}): ${s.text}`),
              ...scn5.alternates.map((a) => `${a.id}, from step ${a.fromStep}: ${a.condition}. ${a.response} ${a.outcome === 'ends' ? 'The scenario ends.' : `Rejoin at step ${a.outcome.rejoin}.`}`),
              `Success end state: ${scn5.success} Failure end state: ${scn5.failure}`,
              'Check against the review questions: the duty manager’s goal is met in the main flow and in A1; A2 and A3 fall short but leave everyone safe and informed. The actor most often missed in student versions is the air traffic service, which must accept every revised intent in step 4.',
            ],
            examples: ['Instructor decision (not for students): faculty may prefer to align the scenario boundary with Week 1’s system of interest. If so, the duty manager becomes a performer inside the system and the primary actor becomes the affected passenger; the steps stay the same.'],
            misconceptions: [
              { claim: 'Weather is an actor because it starts the scenario.', correction: 'It triggers the scenario but has no goal and cannot be asked for anything; mark it as environment.' },
              { claim: 'An off-nominal scenario is the main flow with an error message added.', correction: 'It has its own trigger, primary actor, flow and end states; here the whole scenario is the disruption.' },
            ],
            transition: 'Writing the scenario did more than describe operation. It found things.',
            timing: '6 min: 1.5 min boundary, 1.5 min primary actor and trigger, 1 min main flow revealed, 1.5 min one alternate proposed and the rest revealed, 30 s end states and check.',
          },
        },
        {
          id: 'w2s1-worked-discoveries',
          title: 'Worked example II: what writing the scenario exposed',
          purpose: 'Show that scenarios discover needs, assumptions and unknowns, and that each discovery must be recorded in the needs set or the uncertainty register.',
          minutes: 3,
          layout: 'figure',
          figure: {
            id: 'w2s1-discoveries',
            caption: 'Three discoveries from writing SCN-005: a need, an assumption and an unknown, each sent to where it is tracked (FICTIONAL).',
            alt: 'Titled SCN-005 Weather Disruption (simplified): a strip from a trigger diamond through seven numbered step dots, step 5 highlighted, with a dashed branch from step 2 ending at A2. Three arrows pull out to cards: from the trigger, U-001, carried as TBD-01 (unknown), to the uncertainty register; from alternate A2, A-008 (assumption), to the uncertainty register; from step 5, NEED-011 (need), to the needs set. Footer: a scenario is an analysis instrument.',
          },
          body: [{ kind: 'callout', tone: 'key', text: 'A scenario is an analysis instrument: every discovery goes into the needs set or the uncertainty register.' }],
          sources: [R('R52', '301')],
          notes: {
            teach: [
              `Step 5 makes the system notify affected passengers. Ask: which need does that step serve? In the original reference set, none did. Writing the step exposed ${need('NEED-011').id}: “${need('NEED-011').statement}” Week 1’s corrected case already includes it, with its source recorded as this scenario.`,
              `Alternate A2 offers stranded passengers public transport. That only works if the transport network can carry them, and nobody has agreed that: it is assumption A-008. ${DISCOVERIES.find((d) => d.id === 'A-008')!.goesTo}.`,
              'The trigger needs the aircraft weather limits, which the manufacturer has not published. That is unknown U-001, carried into requirements as TBD-01 with an owner and a date to close it.',
              'Tie it to MITRE: one stated objective of a ConOps is to validate and discover implicit requirements (R52 p.301). This is what that looks like in practice: three items that requirements written straight from the needs would have missed.',
            ],
            why: 'The discovery loop is the main reason scenarios come before requirements; recording each discovery teaches traceability from the first day.',
            figure: 'Follow each call-out from its place in the scenario to its card and then to its destination: needs set, or uncertainty register.',
            misconceptions: [{ claim: 'An assumption in a scenario is fine as long as it is plausible.', correction: 'Plausible or not, it must be recorded with an owner and a way to validate it, or the requirements built on it inherit a hidden risk.' }],
            transition: 'One scenario found three things. Do the five scenarios together exercise all seventeen needs?',
            timing: '3 min: 1 min each discovery, with the MITRE objective at the end.',
          },
        },
        {
          id: 'w2s1-worked-coverage',
          title: 'Worked example III: do the scenarios exercise the needs?',
          purpose: 'Run the needs-by-scenarios coverage check students will repeat, distinguishing a reasoned gap (a constraint, a planning need) from a finding.',
          minutes: 4,
          layout: 'figure',
          figure: {
            id: 'w2s1-needs-scenarios-matrix',
            caption: 'Needs by scenarios, from the instructor’s reading of the reference flows. Filled: exercised; outlined: weakly exercised; shaded rows: not exercised, with a recorded reason; amber: a finding. FICTIONAL.',
            alt: `A matrix of the seventeen needs, NEED-001 to NEED-017 with short names, against SCN-001 to SCN-005. Filled squares mark the scenarios that exercise each need and outlined squares mark weak coverage. ${NEED_COVERAGE.map((r) => `${r.need}: ${r.where.length ? r.where.map((w) => w.scenario).join(' and ') : 'none'}${r.status === 'weak' ? ' (weak)' : ''}${r.status === 'finding' ? ' (finding)' : ''}`).join('; ')}. Shaded rows NEED-005, NEED-012 and NEED-016 carry their reasons; the NEED-013 row is outlined amber as a finding. A legend explains the marks.`,
          },
          body: [],
          sources: [],
          notes: {
            teach: [
              'Explain the instrument, a course convention: one row per need, one column per scenario; mark a cell when a step of that scenario exercises the need.',
              'Ask pairs, for ninety seconds, to find one need that no scenario exercises and say whether that is a defect.',
              `Take answers, then give the reading. Not exercised: ${notExercised.join(', ')}. NEED-012 and NEED-016 are siting constraints, met before operation starts, so no daily scenario should exercise them: that is a reason, recorded, not a defect. NEED-005, capacity that grows with demand, is a planning need; it points to a planning scenario or to the Week 3 trade study.`,
              'Then the finding: NEED-013, manageable operator workload. SCN-005 loads the operators heavily, yet no step says how workload is limited. That is a gap in the scenarios and, as we will see, in the requirements.',
              'Point out the weak rows: NEED-003 is exercised only for the loudness of each event, not for the number of evening events; NEED-006 shows the warning but not the responders’ access.',
            ],
            why: 'The coverage check turns the needs set into a test of the scenarios and the scenarios into a test of the needs; it is the evaluation skill of objective W2.7 and the first audit students run on their own work.',
            figure: `Scan down each column first: ${mostNeeds.id} touches the most needs (${mostNeeds.n}). Then read across the three shaded rows and their notes, and finish on the amber row.`,
            misconceptions: [{ claim: 'Every need must appear in some scenario.', correction: 'Coverage is a question, not a quota: a need not exercised needs either a new scenario or a recorded reason, as with the siting constraints.' }],
            transition: 'Scenarios show how the service is used. Capabilities say what the enterprise must be able to do to meet the needs.',
            timing: '4 min: 30 s the instrument, 1.5 min pairs, 1.5 min the reading and the finding, 30 s weak rows.',
          },
        },
      ],
    },
    // ============================================================================================ E. capabilities (9 min)
    {
      id: 'w2s1-capabilities',
      title: 'Capabilities',
      slides: [
        {
          id: 'w2s1-capability-def',
          title: 'What a capability is',
          purpose: 'Define capability from the SEBoK glossary, separate it from feature and benefit, and connect it to enterprise capability management and gaps.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-feature-capability-benefit',
            caption: 'Feature, capability, benefit: SEBoK’s illustration and an AeroLink reading.',
            alt: 'A three-rung ladder: Feature, Capability, Benefit. Left column, SEBoK’s example: fingerprint scanner, storing passwords, saving time and adding security. Right column, AeroLink: high-power hub chargers, return arriving aircraft to dispatch-ready within the turnaround (CAP-003), short and predictable waits (MGO-002).',
          },
          body: [
            { kind: 'definition', term: 'Capability (SEBoK glossary)', text: '“An outcome or effect which can be achieved through use of features of a system of interest and which contributes to a desired benefit or goal”', source: R('R39p', '1457') },
            { kind: 'bullets', items: ['Feature → capability → benefit', 'Enterprise capabilities exist to meet mission and enterprise needs', 'Desired minus baseline capability: the capability gap'] },
          ],
          sources: [R('R39p', '1457–1458'), R('R12', '862')],
          notes: {
            teach: [
              'The SEBoK glossary gives four definitions of capability, from DoD and UK defense sources and one written for SEBoK. Read the SEBoK one on the slide (R39p p.1457). Its discussion separates the three words with an example: a fingerprint scanner on a computer is the feature, storing passwords is the capability, and saving time and adding security is the benefit (R39p p.1458).',
              'SEBoK’s enterprise view: the capabilities of an enterprise should exist for the sole purpose of meeting mission and enterprise needs. Its example of an operational capability is “Transport 150,000 passengers per hour among 27 nodes in the network.” The desired levels of capability are compared with the baseline to find capability gaps, and excess capability (R12 p.862).',
              'Why capabilities sit between needs and requirements: they name what the enterprise must be able to do, without choosing how. Several needs can share one capability, and one capability can be exercised by several scenarios; requirements are then written against capabilities as well as needs. In Week 6 the gaps over time come back in the evolution roadmap.',
            ],
            why: 'Capabilities are the bridge students most often skip, going straight from a need to a feature; the ladder makes the level visible.',
            figure: 'Read each column bottom to top: the feature enables the capability, which delivers the benefit. On the AeroLink side, the charger is a feature someone might choose; the capability is what any choice must achieve.',
            misconceptions: [{ claim: 'A capability is a function of the software.', correction: 'It is an outcome the enterprise can achieve using its systems, people and procedures; a function is one way to provide it.' }],
            transition: 'Here are AeroLink’s capabilities, derived from the needs and exercised by the scenarios.',
            timing: '3 min: 1 min definition and ladder, 1 min enterprise view and gaps, 1 min why capabilities sit here.',
          },
        },
        {
          id: 'w2s1-capability-tree',
          title: 'The AeroLink capability tree',
          purpose: 'Show derivation from needs and decomposition by refinement, with the scenarios that exercise each capability.',
          minutes: 3,
          layout: 'figure',
          figure: {
            id: 'w2s1-capability-tree',
            caption: 'The ten reference capabilities: each traces to needs; three refine a parent; scenario badges show every scenario that exercises each capability (FICTIONAL).',
            alt: `A tree under a root AeroLink enterprise capabilities. ${CAPABILITIES.filter((c) => c.provenance !== 'proposed').map((c) => `${c.id} ${c.name}${c.refines ? `, under ${c.refines}` : ''}, needs ${c.needs.join(' and ')}`).join('; ')}. Scenario badges: ${badgeText}. ${idList(unbadged)} ${unbadged.length === 1 ? 'has' : 'have'} no badge.`,
          },
          body: [],
          sources: [],
          notes: {
            teach: [
              `Walk the tree from the root. Ten capabilities in the reference set; three are refinements of a parent: ${CAPABILITIES.filter((c) => c.refines).map((c) => `${c.id} ${c.name} refines ${c.refines}`).join('; ')}.`,
              'Read the need tags on two nodes: CAP-004, flight operations within safety limits, traces to NEED-002 (the regulator’s assurance) and NEED-009 (flight intent known to the air navigation service provider); CAP-010, charging power control, traces to NEED-010 and NEED-004, so it serves the utility and the vertiport operators at once.',
              `Then the scenario badges. A badge means “exercised by”: the scenario has a step that uses the capability, read the same way as the coverage matrix. SCN-003, charging, exercises CAP-003, and also CAP-010 in step 2 and CAP-009 in alternate A3. Ask: which capabilities have no badge? ${idList(unbadged)}, ${unbadged.map((id) => capability(id).name.toLowerCase()).join(', ')}: the planning capability, matching the planning need NEED-005 that no daily scenario exercises. That is the coverage question at the capability level: a capability no scenario exercises needs a scenario or a reason.`,
            ],
            why: 'The tree shows the three relations students must record (traces to need, refines, exercised by) on a complete, credible example before they build their own.',
            figure: `Root, then the seven top-level nodes left to right, then the three children. Finish on the badges and the ${NUM_WORD[unbadged.length]} ${unbadged.length === 1 ? 'node' : 'nodes'} without one.`,
            misconceptions: [{ claim: 'Each need gets exactly one capability.', correction: 'The mapping is many to many: CAP-004 serves two needs, and NEED-004 is served by two capabilities.' }],
            transition: 'The tree is the reference. It is not yet complete for the corrected Week 1 needs.',
            timing: '3 min: 1 min structure, 1 min need tags, 1 min badges and the question.',
          },
        },
        {
          id: 'w2s1-capability-gaps',
          title: 'What the tree does not yet cover',
          purpose: 'Carry the Week 1 corrections forward honestly: capabilities for the needs added in the review, the correction to CAP-007, and the level at which a capability is named.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-capability-gaps',
            caption: `The capability tree after the corrections: CAP-007 corrected to both noise limits; NEED-011 moved from CAP-005 to a proposed ${movedCap.id}; and ${NUM_WORD[addedNeedCaps.length]} proposed capabilities for the needs added in Week 1 (proposed, instructor to confirm).`,
            alt: `A compact tree of the ten reference capabilities by ID and short name. CAP-007 is outlined amber and labeled corrected: both agreed limits; CAP-005 is outlined amber and labeled corrected: NEED-011 to ${movedCap.id}. ${proposedCaps.length} dashed proposed nodes: ${proposedCaps.map((c) => `${c.id} ${c.name}, needs ${c.needs.join(' and ')}`).join('; ')}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [
                `The reference capabilities trace to NEED-001 … NEED-010; NEED-011 gets its own: ${movedCap.id}`,
                `NEED-012 … NEED-017 need capabilities: ${addedNeedCaps.length} proposed`,
                'CAP-007 covered loudness only; corrected to both agreed limits',
                'Name an ability, not an implementation',
              ],
            },
          ],
          sources: [],
          notes: {
            teach: [
              `The reference tree was built before the Week 1 review added NEED-012 to NEED-017. None of them had a capability. The case proposes ${addedNeedCaps.length}: ${addedNeedCaps.map((c) => `${c.id} ${c.name} (${c.needs.join(', ')})`).join('; ')}. All are proposed, for the instructor to confirm. One more move: the reference hung NEED-011, notice to passengers, on CAP-005, weather-aware operations, which obliges nobody to tell passengers anything. The case gives it its own capability, ${movedCap.id} ${movedCap.name}; Session 2 shows why that matters for the audit.`,
              `The correction to CAP-007 is the one to dwell on. The reference text read: “${CAP007_REFERENCE_TEXT}” But the corrected NEED-003 bounds two things: how loud each event is, and how many events happen in the evening and early morning. A capability that covers only loudness would let the requirements cover only loudness. The corrected text: “${capability('CAP-007').text}”`,
              'Finally, the level. A capability names an ability, not an implementation. Charging power control is acceptable at enterprise level; “smart charger controller” would not be, because it names a solution. Ask students to name one capability of their own enterprise at the right level before Session 2.',
            ],
            why: 'Showing the instructor’s own reference being corrected teaches that the package is one connected body of work, and the CAP-007 correction sets up the noise requirements in Session 2.',
            figure: `Point at the amber CAP-007 first and read its label, then the amber CAP-005. Then the dashed nodes and the needs they cover: together they give every need a capability.`,
            examples: ['Instructor decision (not for students): confirm or revise the proposed capabilities, including the move of NEED-011 from CAP-005 to CAP-015. If faculty prefer fewer, CAP-011 can be dropped by recording siting as an enterprise constraint outside the service; the coverage note must then say so.'],
            misconceptions: [{ claim: 'Correcting the reference means the earlier work was wasted.', correction: 'Correction is the normal state of an engineering baseline; what matters is that the change is traced from the need to everything that depends on it.' }],
            transition: 'With needs, scenarios and capabilities, we can now say what the service and its elements shall do, at two levels.',
            timing: '3 min: 1 min proposed capabilities, 1.5 min CAP-007, 30 s level.',
          },
        },
      ],
    },
    // ============================================================================================ F. toward requirements (12 min)
    {
      id: 'w2s1-requirements',
      title: 'Toward requirements',
      slides: [
        {
          id: 'w2s1-two-levels',
          title: 'Two levels: stakeholder and system requirements',
          purpose: 'Define the two requirement levels from the SEBoK glossary and the DoD guidebook, state the level rule, and give the course convention for subjects and ID prefixes.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-staircase',
            caption: 'Three tiers: the stakeholder’s words, the service’s obligation, an element’s obligation, each step labeled with its source.',
            alt: 'A staircase of three steps rising left to right. Step 1, NEED: stakeholder’s words, Vertiport operators need the air-taxi service to … Step 2, REQ-STK: service level, The AeroLink service shall … Step 3, REQ-SYS: element level, The charging system shall … Between steps 1 and 2: transformed from needs into more formal statements (ISO/IEC/IEEE 29148, via SEBoK). Between steps 2 and 3: a technical view of a solution (ISO/IEC/IEEE 15288, via SEBoK).',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Stakeholder requirements: needs transformed into more formal statements',
                'System requirements: a technical view of a solution',
                'At the level of the system of interest: what, not how',
                '**Course convention:** REQ-STK names the service; REQ-SYS names an element or function',
              ],
            },
          ],
          sources: [R('R39a', '1632'), R('R39l', '1652'), R('R48a', '141'), R('R48b', '142'), R('R13', '558')],
          notes: {
            teach: [
              'The SEBoK glossary, from ISO/IEC/IEEE 29148: stakeholder requirements “are transformed from the stakeholder needs to objectively adequate, structured and more formal statements” (R39a p.1632). And from 15288:2015: a system requirement is a statement that transforms the stakeholder, user-oriented view of desired capabilities into a technical view of a solution that meets the operational needs of the user (R39l p.1652).',
              'The DoD guidebook names the processes: Stakeholder Requirements Definition translates stakeholder capability needs into a set of technical requirements (R48a p.141); Requirements Analysis decomposes end-user needs into clear, achievable and verifiable requirements and supports their allocation and derivation down to the system elements (R48b p.142).',
              'The level rule from SEBoK: requirements must be appropriate to the level at which the system of interest exists in the architecture and communicate what it must do, avoiding requirements that state how (R13 p.558).',
              'The course convention that makes the two levels easy to see: a stakeholder requirement, REQ-STK, has the whole service as its subject, “The AeroLink service shall …”; a system requirement, REQ-SYS, has a named element or function as its subject, “The charging system shall …”. The prefixes are course conventions; the levels are not.',
            ],
            why: 'Students conflate the levels, writing element-level design into stakeholder requirements or service-level outcomes into system requirements; the definitions plus a visible subject rule give them a test they can apply alone.',
            figure: 'Climb the stairs: the stakeholder speaks, then the service, then an element. Read the source label on each riser: each step is a transformation with a name, not a rewording.',
            misconceptions: [
              { claim: 'Stakeholder requirements are written by stakeholders.', correction: 'They are written by engineers, with stakeholders, from the needs; they are the service’s obligations expressed formally.' },
              { claim: 'System requirements must name a hardware box.', correction: 'They name an element or a function of the system; “the scheduling function shall …” is a system requirement whatever later implements it.' },
            ],
            transition: 'Here is one chain from a need to a system requirement, with the numbers that make it analysis.',
            timing: '4 min: 1 min glossary, 1 min DoD, 1 min level rule, 1 min course convention.',
          },
        },
        {
          id: 'w2s1-one-chain',
          title: 'One chain, end to end: NEED-004 to REQ-SYS-001',
          purpose: 'Show the transformation as analysis, with a time budget that produces a dependent pair of requirements.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-chain-budget',
            caption: 'From the vertiport operators’ need to a charging-system requirement, with the 25-minute budget that links the two requirement values (FICTIONAL).',
            alt: 'Linked cards: NEED-004, then CAP-003 with an SCN-003 badge, then REQ-STK-005 dispatch-ready within 25 min, then REQ-SYS-001 charge 20 % to threshold within 20 min. Below, a stacked bar reads 25 min = 5 min pad work + 20 min charge; the charge segment is shaded and labeled REQ-SYS-001, with the note deplaning and boarding overlap the charge. Small text: a budget: change one value and the other must change.',
          },
          body: [
            { kind: 'bullets', items: ['NEED-004 + CAP-003 + SCN-003 → REQ-STK-005 → REQ-SYS-001', `${TURNAROUND_BUDGET.total} min = ${TURNAROUND_BUDGET.padWork} min pad work + ${TURNAROUND_BUDGET.charge} min charge`, 'A budget: change one value and the other must change', 'The transformation is analysis, not rewording'] },
          ],
          sources: [R('R13', '558–559'), R('R13', '562')],
          notes: {
            teach: [
              `Start from the need: “${need('NEED-004').statement}” Nothing in it is a number. The capability, CAP-003, says what the enterprise must do: return arriving aircraft to a dispatch-ready energy state within the turnaround time at the hubs. The scenario, SCN-003, shows how it happens: connect, charge, record, disconnect, release.`,
              `Now the analysis. How long may a turnaround take before pads, not demand, limit departures? The reference sets 25 minutes, so REQ-STK-005 reads: “${requirement('REQ-STK-005').statement}” Where does 25 come from? Five minutes of pad work (rotor stop, safety check, connecting and disconnecting) plus a twenty-minute charge, with deplaning and boarding overlapping the charge.`,
              `That split produces the system requirement: “${requirement('REQ-SYS-001').statement}” SEBoK calls this budgeting: a system-level value decomposed so lower-level elements contribute their portion, which creates requirements with a dependency, so a change in one forces a change in another (R13 p.562).`,
              'Close with SEBoK’s two lines: one need can yield several requirements, and generating them is analysis of what the system must do (R13 pp.558–559). Nothing in this chain was a rewording.',
            ],
            why: 'One fully worked chain with numbers makes “transformation is analysis” concrete, and the budget teaches why requirement values are coupled before students meet change impact in Session 2.',
            figure: 'Follow the cards left to right, then drop to the bar: the 25 is the stakeholder requirement; the shaded 20 is the system requirement; the 5 is what is left for the people on the pad.',
            examples: ['Ask: if the pad work grows to 8 minutes because of a new safety check, what changes? Either the charge must finish in 17 minutes, or the turnaround grows to 28 and NEED-004 is put at risk. That is the dependency.'],
            misconceptions: [{ claim: 'REQ-SYS-001 should name the charger power, since that sets the charge time.', correction: 'The power rating is a design choice made after the Week 3 trade; the requirement states the time the turnaround needs.' }],
            transition: 'We can now answer the question from the start of the session.',
            timing: '3 min: 45 s need, capability and scenario; 1 min the budget; 45 s budgeting; 30 s the close.',
          },
        },
        {
          id: 'w2s1-answer',
          title: 'Answering the driving question',
          purpose: 'Close the loop from slide 2 with evidence from the worked example.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w2s1-answer',
            caption: 'The driving question answered: the route from needs to requirements passes through the description of operation, and three discoveries drop out on the way (FICTIONAL).',
            alt: 'A banner reads Answer: B — first describe how the service will be operated. The driving-question drawing completed: the needs stack, top card NEED-004, leads by a solid arrow through the highlighted storyboard frame to a requirements table with columns ID, Statement and Parent and three rows: REQ-STK-001 under NEED-001, REQ-STK-002 under NEED-003, REQ-STK-003 under NEED-002, the statements drawn as sketch lines. Three cards drop from the storyboard: NEED-011, with an arrow back into the needs stack, and A-008 and U-001 / TBD-01, each with an arrow into a box labeled uncertainty register.',
          },
          body: [{ kind: 'bullets', items: ['**Answer: B**', 'SCN-005 exposed a need, an assumption and an unknown', 'The ConOps fixed the environment the values depend on', 'The coverage check separated operations from constraints'] }],
          sources: [R('R52', '301')],
          notes: {
            teach: [
              'Return to the vote on the board. The answer is B: first describe how the service will be operated.',
              'Give the evidence in three parts. Writing SCN-005 exposed a need (NEED-011), an assumption (A-008) and an unknown (U-001). The ConOps fixed the operational environment the requirement values depend on: the 16-hour day, the 20 % reserve, the noise limits. And the coverage check showed which needs are operations and which are constraints. Requirements written straight from the needs would have missed all of these; MITRE lists discovering implicit requirements as a ConOps objective for exactly this reason (R52 p.301).',
              'Answer C briefly: technology comes later, after the Week 3 trade study; choosing it now would have turned REQ-SYS-001 into a charger specification. Thank the A voters: their standard for individual needs was right, and it is still needed.',
            ],
            why: 'Closing the loop consolidates the session’s argument and rewards prediction, whatever the vote.',
            figure: 'Compare with slide 2: the detour is now solid and the table has rows. Point at the three dropping cards and where each lands.',
            misconceptions: [{ claim: 'Once the ConOps is written, the needs are frozen.', correction: 'The ConOps is how the needs set gets corrected; NEED-011 entered the set this way.' }],
            transition: 'Before you leave, one minute on your own enterprise.',
            timing: '2 min: 30 s answer, 1 min evidence, 30 s answers C and A.',
          },
        },
        {
          id: 'w2s1-exit',
          title: 'Exit: retrieval and preparation for Session 2',
          purpose: 'Retrieval on the team’s own enterprise, and the pre-work that feeds the in-class scenario selection and clinic in Session 2.',
          minutes: 3,
          layout: 'bullets',
          body: [
            {
              kind: 'bullets',
              items: [
                '**One-minute paper:** one off-nominal scenario for your enterprise, and one need it might expose',
                { text: 'Before Session 2, each member drafts one candidate scenario:', sub: ['trigger, primary actor, failure end state', 'its scenario system of interest, in one sentence'] },
                'Read R13 pp.557–559 and 565–566',
              ],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Run the one-minute paper on cards: one off-nominal scenario for the team’s own enterprise and one need it might expose. Collect the cards; skim them before Session 2 for actors placed inside the boundary.',
              'Set the pre-work: each member drafts one candidate scenario skeleton, about twenty minutes: the scenario system of interest in one sentence, the trigger, the primary actor and the failure end state. Teams merge them in Session 2 and choose at least three.',
              'Set the reading: R13 pp.557–559 and 565–566, the SEBoK pages on writing and assessing requirements, which Session 2 builds on.',
            ],
            why: 'Retrieval on the team’s own case transfers the method immediately, and the skeletons make the Session 2 planning and clinic possible in the time available.',
            examples: ['A good one-minute paper from a food-bank team: “The refrigerated van breaks down mid-route; it might expose a need of the pantries to be told how long perishable deliveries can be delayed.”'],
            misconceptions: [{ claim: 'The candidate scenario has to be complete.', correction: 'Only the skeleton is asked for; the team writes the full scenarios after the clinic.' }],
            transition: 'End of Session 1. Session 2 opens with three questions on today.',
            timing: '3 min: 1.5 min one-minute paper, 1 min pre-work, 30 s reading.',
          },
        },
        {
          id: 'w2s1-references',
          title: 'References and credits',
          purpose: 'List every source the session cites, with the license statements the sources require.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while students write the one-minute paper. The list is generated from every citation in the session; the credits include the attribution SEBoK requires for its text.'],
            why: 'Students should be able to find every source the session relied on, and SEBoK’s license requires the attribution wherever its text is used.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the exit activity.',
          },
        },
      ],
    },
  ],

  // ============================================================================================== student lesson
  studentLesson: [
    {
      id: 'w2s1-l-why',
      title: 'Why Week 2 starts with operations',
      blocks: [
        {
          kind: 'para',
          text: 'Week 2 carries the scheduled subject *ConOps / Requirements*. Your team arrives with the Week 1 Team Record for its approved enterprise: a context, a stakeholder register and an integrated set of needs in the recommended form. The tempting next step is to rewrite each need as a “shall” statement. This week explains why that shortcut fails, and what to do instead: describe how the system of interest will be operated, in scenarios that include what goes wrong, derive the capabilities the enterprise needs, and only then write stakeholder and system requirements, each traced back to a need.',
        },
        { kind: 'figure', figure: { id: 'w2s1-week-band', caption: 'Week 2 extends the Week 1 Team Record with three additions that feed the Phase II model.', alt: 'Five dimmed boxes under the bracket Week 1 Team Record: team charter, enterprise proposal, boundary and context, stakeholder register, initial needs. Three accent boxes follow with arrows: ConOps and scenarios, Capabilities, Requirements and measures, under the bracket Week 2 additions to your Team Record. Two faint dashed boxes to the right: Week 9, requirements in SysML v2; Week 10, scenarios as behavior.' } },
        {
          kind: 'para',
          text: 'The argument of the week is that well-formed needs are necessary but not sufficient. Each need can pass every quality check and the set can still be incomplete, because some needs only become visible when someone walks through an operation step by step, including the bad afternoon when the weather closes a vertiport.',
        },
        { kind: 'figure', slide: 'w2s1-driving-question' },
      ],
      sources: [],
    },
    {
      id: 'w2s1-l-process',
      title: 'Where the week sits: System Requirements Definition',
      blocks: [
        {
          kind: 'para',
          text: 'In the ISO/IEC/IEEE 15288:2015 technical processes, as SEBoK tabulates them, System Requirements Definition follows Business or Mission Analysis and Stakeholder Needs and Requirements Definition. SEBoK describes it as the process that turns the stakeholder view of desired capabilities into a technical, developer view of how the system can achieve them. Its inputs are the integrated set of needs, which you produced in Week 1, and the life-cycle concepts, among them the operational concept that this week adds.',
        },
        { kind: 'figure', slide: 'w2s1-process-frame' },
        {
          kind: 'para',
          text: 'SEBoK lists what operational concepts include: high-level operational modes or states, operational scenarios, potential use cases, misuse cases, loss scenarios, or usage within a proposed business strategy. That list is your checklist for the ConOps, and it already tells you that a ConOps describing only normal use is incomplete.',
        },
        {
          kind: 'para',
          text: 'Keep the Week 1 distinction in view, because the whole week rests on it. Needs express what stakeholders expect from the system, seen from outside as a black box; requirements express what the system must do, seen from inside as a white box. SEBoK is explicit that generating a requirement is more than changing the subject of the need statement: it is an analysis of what the system must do to achieve what is needed. A sentence such as “The air-taxi service shall keep pad-edge noise at or below 65 dBA” has the form of a requirement but has dropped the residents who hold the need, and half of what they need.',
        },
        { kind: 'figure', slide: 'w2s1-retrieval' },
      ],
      sources: [R('R98', '1001'), R('R13', '557–558'), R('R10', '546')],
    },
    {
      id: 'w2s1-l-conops',
      title: 'The concept of operations: what it is and what it is called',
      blocks: [
        { kind: 'definition', term: 'CONOPS (MITRE, quoting its source)', text: '“describes systems characteristics for a proposed system from a user’s perspective”', source: R('R52', '298') },
        {
          kind: 'para',
          text: 'MITRE treats the CONOPS as a user-oriented document that also describes the user organization, mission and objectives. Its purpose is to describe the user’s operational needs, desires, visions and expectations without being overly technical or formal, and without addressing the technical solution or implementation; MITRE notes that it is often a first step for developing system requirements. Two further expectations matter. A CONOPS should define any critical top-level performance requirements or objectives, with the rationale for them. And it is a living document: the original should be updated after developmental and operational testing, because fielded systems gain capabilities nobody envisioned and lose others that trade-offs removed.',
        },
        { kind: 'figure', slide: 'w2s1-conops-what' },
        {
          kind: 'para',
          text: 'You will meet three names for related things, and they are not synonyms. The SEBoK glossary, citing ISO/IEC 29148, defines the concept of operations at the level of an organization:',
        },
        { kind: 'definition', term: 'Concept of operations (SEBoK glossary)', text: '“Verbal and graphic statement, in broad outline, of an organization’s assumptions or intent in regard to an operation or series of operations.”', source: R('R39m', '1469') },
        {
          kind: 'para',
          text: 'Its discussion adds that such a concept is often embodied in long-range strategic plans and annual operational plans, and that it bounds the operating space, system capabilities, interfaces and operating environment. The glossary’s operational concept uses the same form of words for the operation “of a system or a related set of systems”, and SEBoK says the two are slightly different. MITRE’s CONOPS, about a proposed system and written from the user’s side, is close to the operational concept.',
        },
        { kind: 'callout', tone: 'note', title: 'Course convention', text: 'Your team’s Week 2 ConOps is the operational concept of the system of interest inside your enterprise, written from the users’ and operators’ perspective. The course keeps the familiar name ConOps for it.' },
        { kind: 'figure', slide: 'w2s1-three-names' },
      ],
      sources: [R('R52', '298–299'), R('R39g', '1579')],
    },
    {
      id: 'w2s1-l-conops-content',
      title: 'What a ConOps contains, and how to write it',
      blocks: [
        {
          kind: 'para',
          text: 'MITRE presents IEEE Std 1362-1998 as a widely used ConOps guideline and lists the components any tailored ConOps must keep: the existing system, manual or automated, that the user wants to replace; the justification for a new or modified system, including the restrictions on it; a description of the proposed system; and scenarios highlighting use of the system in the user’s environment, including internal and external factors. The standard itself is not in the course collection, so these components are taught as MITRE summarizes them.',
        },
        {
          kind: 'para',
          text: 'Each part earns its place by an objective MITRE names: end-to-end traceability between operational needs and captured source requirements; a high-level basis for the requirements and for test planning; support for operational analysis models such as use cases; a basis for computing system capacity; and validating and discovering implicit requirements. A ConOps without numbers for the environment cannot support a capacity calculation; a ConOps without scenarios cannot discover anything.',
        },
        { kind: 'figure', slide: 'w2s1-conops-contents' },
        { kind: 'callout', tone: 'note', title: 'Course deliverable contents', text: 'The team’s ConOps states the enterprise mission, the operational environment, the operational scenarios, the user interactions and the operational constraints, alongside MITRE’s critical components.' },
        { kind: 'heading', text: 'Writing it well' },
        {
          kind: 'para',
          text: 'MITRE’s best practices for the craft: describe the system from the users’ perspective, simply and clearly, in the users’ language, with a glossary where user jargon is unavoidable; use graphics, because the document must be understood by very different readers, and MITRE’s list of useful graphics includes use cases, sequence and activity charts and storyboards; describe the operational environment in detail, with its assumptions, constraints, numbers and capacity; and describe the physical environment, safety, security and privacy aspects that influence operation.',
        },
        {
          kind: 'para',
          text: 'One practice runs against instinct. A ConOps is a place where users may state qualitative needs, such as a “highly reliable” system, with their reasons, without producing a testable requirement. MITRE assigns the job of quantifying such a need to the buyer or the developer during requirements analysis. A vague phrase is therefore acceptable in the ConOps, provided someone owns turning it into a number, and unacceptable in a requirement.',
        },
        { kind: 'figure', slide: 'w2s1-writing-well' },
      ],
      sources: [R('R52', '300–302')],
    },
    {
      id: 'w2s1-l-aerolink-conops',
      title: 'The AeroLink ConOps (worked example)',
      blocks: [
        { kind: 'para', text: `The worked example applies every part to AeroLink, the course’s fictional reference case. **Existing situation:** ${CONOPS.existing} **Justification:** ${CONOPS.justification} **Restrictions:** ${CONOPS.restrictions.join('; ')}.` },
        { kind: 'para', text: `**Proposed system, in the users’ words:** ${CONOPS.proposed}` },
        {
          kind: 'table',
          caption: 'The AeroLink operational environment as the ConOps records it (FICTIONAL; values marked proposed await instructor confirmation).',
          header: ['Aspect', 'Value'],
          rows: CONOPS_ENVIRONMENT.map((e) => [e.label, e.value]),
        },
        { kind: 'bullets', items: CONOPS.userInteractions },
        { kind: 'figure', slide: 'w2s1-aerolink-conops' },
      ],
      sources: [R('R54', '331')],
    },
    {
      id: 'w2s1-l-scenarios',
      title: 'Use cases, actors, threads and the scenario template',
      blocks: [
        {
          kind: 'para',
          text: 'MITRE defines a use case as a goal-oriented set of interactions between external actors and the system under consideration. Actors are parties outside the system that interact with it: classes of users, roles users can play, or other systems. A primary actor has a goal that requires the system’s assistance; a secondary actor is one from which the system needs assistance. A mission scenario or thread is one path through a use case, so one use case yields a main thread and threads for its variations. Mission threads drive the architecture and serve as the basis for test cases, which is why they reappear in Weeks 10 and 12.',
        },
        { kind: 'definition', term: 'Operational scenario (SEBoK glossary)', text: '“Description of an imagined sequence of events that includes the interaction of the product or service with its environment and users, as well as interaction among its product or service components.”', source: R('R39n', '1581') },
        { kind: 'para', text: 'The same glossary entry notes that operational scenarios are used to evaluate the requirements and design and to verify and validate the system. The glossary’s use-case entry describes a use case as the behavioral requirements of a system and its interaction with a user.' },
        { kind: 'figure', slide: 'w2s1-use-cases' },
        {
          kind: 'para',
          text: 'MITRE also says what a use case records and what it leaves out. It records paths that take an actor from a trigger event to the goal, the success scenarios, and paths that start from a trigger but fall short, the failure scenarios. Steps are simple and in the user’s language. A use case specifies intent, not the design of the user interface, and not implementation detail unless the actor needs it for assurance.',
        },
        {
          kind: 'callout',
          tone: 'note',
          title: 'Course convention: the scenario template',
          text: 'Seven fields under a stated scenario system of interest: actors (primary marked; environmental factors marked “environment”); trigger; preconditions; main flow (an actor on every step); alternate flows (each branches from a step and rejoins a later step or ends); success end state; failure end state. No source in the collection gives one field set; the template is the course’s.',
        },
        { kind: 'figure', slide: 'w2s1-scenario-anatomy' },
        {
          kind: 'para',
          text: 'The header line matters more than it looks. Because actors are outside the system, the boundary decides who counts as an actor. Draw the scenario boundary around the whole service including its staff and a dispatcher performs steps inside it; draw it around the aircraft and software and the dispatcher becomes an actor. Neither is wrong; leaving it unstated is.',
        },
      ],
      sources: [R('R59', '452–454'), R('R39o', '1669')],
    },
    {
      id: 'w2s1-l-scenario-coverage',
      title: 'Choosing scenarios and reviewing them',
      blocks: [
        {
          kind: 'para',
          text: 'SEBoK expects off-nominal material on both sides of this week: operational concepts include misuse cases and loss scenarios, and elicitation should obtain, for each life-cycle stage, the expected and off-nominal use cases, scenarios, misuse cases and loss scenarios. MITRE widens the life cycle further: threads can describe logistical and support operations and maintenance, training, test and development operations, not only the mission itself.',
        },
        {
          kind: 'para',
          text: 'Two tools help decide when a set is complete. MITRE suggests keeping a list of ways the system may be parameterized (the importance of actors, the types of input, future modes of operation, good actors doing bad things, exceptional circumstances) and iterating the use cases against it. Its stopping rule is social rather than numeric: you have enough when the users, the sponsor and the other stakeholders cannot think of any more.',
        },
        { kind: 'callout', tone: 'note', title: 'Course minimum', text: 'At least one nominal scenario, one off-nominal scenario (a disruption or failure) and one support scenario (for example charging, maintenance, training or supply).' },
        { kind: 'figure', slide: 'w2s1-scenario-coverage' },
        { kind: 'heading', text: 'Reviewing a scenario' },
        {
          kind: 'para',
          text: 'MITRE’s review questions are short: Is the use case complete? Will the actor’s goal be met? Could a procedural or requirement change simplify it? Are there goals of the actors, or actors, that are missing? Its list of common pitfalls, quoted from Gottesdiener, names vague goals, ambiguous scope, nonfunctional requirements and user-interface detail in the text, too few use cases, and use cases that are wishful thinking beyond the operational user’s needs. MITRE adds: do not describe the internal workings of the system.',
        },
        {
          kind: 'para',
          text: 'Apply the questions with judgment. In SCN-001, step 3 (“Quotes the fare and an estimated boarding time”) states what the passenger learns, which is intent; calling it interface detail would be a false alarm. Step 5 (“Assigns a dispatch-ready aircraft within 60 s of confirmation”) carries a performance value inside the scenario text, which MITRE lists as a pitfall: keep the step’s intent and move the value to a requirement.',
        },
        { kind: 'figure', slide: 'w2s1-scenario-review' },
      ],
      sources: [R('R10', '546'), R('R11', '553'), R('R59', '453'), R('R59', '455–456')],
    },
    {
      id: 'w2s1-l-case-scn005',
      title: 'Worked example: SCN-005 Weather Disruption and what it exposed',
      blocks: [
        { kind: 'para', text: `The worked scenario is the off-nominal one. Its scenario system of interest is the ${SCENARIO_SOI.name}: ${SCENARIO_SOI.includes.join(', ')}. ${SCENARIO_SOI.why}` },
        {
          kind: 'table',
          caption: 'SCN-005 Weather Disruption on the course template (FICTIONAL). TBD-01 stands for the aircraft weather limits, not yet published (unknown U-001).',
          header: ['Field', 'Content'],
          rows: [
            ['Actors', scn5.actors.map((a) => a.label).join('; ')],
            ['Trigger', scn5.trigger],
            ['Preconditions', scn5.preconditions],
            ...scn5.steps.map((s) => [`Step ${s.n}`, `${s.actor}: ${s.text}`]),
            ...scn5.alternates.map((a) => [`${a.id} (from step ${a.fromStep})`, `${a.condition}. ${a.response} ${a.outcome === 'ends' ? 'Ends.' : `Rejoins at step ${a.outcome.rejoin}.`}`]),
            ['Success end state', scn5.success],
            ['Failure end state', scn5.failure],
          ],
        },
        { kind: 'figure', slide: 'w2s1-worked-scn005' },
        {
          kind: 'para',
          text: 'Notice three choices. The weather triggers the scenario but is marked as environment: it has no goal and cannot be asked for help, so it is not an actor. The air traffic service is an actor because the system needs its acceptance of every revised flight intent. And both end states leave everyone safe: the failure end state is a designed outcome, not a missing success.',
        },
        { kind: 'heading', text: 'What writing it exposed' },
        { kind: 'bullets', items: DISCOVERIES.map((d) => `**${d.id}** (${d.kind}, from ${d.where}): ${d.text} It goes to ${d.goesTo}.`) },
        { kind: 'figure', slide: 'w2s1-worked-discoveries' },
        { kind: 'para', text: 'This is the behavior MITRE has in mind when it lists “validate and discover implicit requirements” among the objectives of a ConOps. A scenario is an analysis instrument, and its findings are only useful if they are recorded where the rest of the package will see them.' },
      ],
      sources: [R('R59', '453–454'), R('R52', '301')],
    },
    {
      id: 'w2s1-l-case-coverage',
      title: 'Worked example: do the scenarios exercise the needs?',
      blocks: [
        { kind: 'para', text: 'The coverage check is a course convention: a matrix with one row per need and one column per scenario, with a mark where a step of the scenario exercises the need. It tests the scenarios against the needs and, in the other direction, makes each need show where it is used.' },
        { kind: 'figure', slide: 'w2s1-worked-coverage' },
        {
          kind: 'table',
          caption: 'The instructor’s reading of the reference flows (FICTIONAL). A need with no scenario carries a recorded reason.',
          header: ['Need', 'Exercised in', 'Note'],
          rows: NEED_COVERAGE.map((r) => [`${r.need} ${need(r.need).name}`, r.where.length ? r.where.map((w) => `${w.scenario} (${w.steps})`).join('; ') : 'none', r.note || '—']),
        },
        {
          kind: 'para',
          text: 'Read the result as an engineer, not as a scorekeeper. NEED-012 and NEED-016 are siting constraints, satisfied before the first flight, so no daily scenario should exercise them; recording that reason closes the question. NEED-005 is a planning need that points to a planning scenario or to the Week 3 trade study. NEED-013 is different: the weather scenario loads the operators heavily, yet no step limits their workload. That is a finding, and it carries into the requirements.',
        },
      ],
      sources: [],
    },
    {
      id: 'w2s1-l-capabilities',
      title: 'Capabilities: what the enterprise must be able to do',
      blocks: [
        { kind: 'definition', term: 'Capability (SEBoK glossary, definition created for SEBoK)', text: '“An outcome or effect which can be achieved through use of features of a system of interest and which contributes to a desired benefit or goal”', source: R('R39p', '1457') },
        {
          kind: 'para',
          text: 'The glossary records three further definitions, from DoD and UK defense sources, and illustrates the distinction with a fingerprint scanner: the scanner is the feature, storing passwords is the capability, and saving time and adding security is the benefit. In the enterprise view, SEBoK says an enterprise’s capabilities should exist only to meet mission and enterprise needs; it gives “Transport 150,000 passengers per hour among 27 nodes in the network” as an example of an operational capability, and compares the desired capability with the baseline to find capability gaps and excesses.',
        },
        { kind: 'figure', slide: 'w2s1-capability-def' },
        {
          kind: 'para',
          text: 'Capabilities sit between needs and requirements because they name what the enterprise must be able to do without choosing how. The relation is many to many: one capability can serve several needs, one need can require several capabilities, and each capability should be exercised by at least one scenario or carry a reason. A capability names an ability, not an implementation: “charging power control” is a capability; “smart charger controller” is a design.',
        },
      ],
      sources: [R('R39p', '1458'), R('R12', '862')],
    },
    {
      id: 'w2s1-l-case-capabilities',
      title: 'Worked example: the AeroLink capabilities and their corrections',
      blocks: [
        { kind: 'figure', slide: 'w2s1-capability-tree' },
        { kind: 'para', text: `The reference set has ten capabilities. Each traces to the needs it serves, three refine a parent, and a scenario badge marks every capability a scenario exercises; the capabilities no scenario exercises (${CAPABILITIES.filter((c) => c.provenance !== 'proposed' && !SCENARIOS.some((x) => x.capabilities.includes(c.id))).map((c) => c.id).join(', ')}) each need a scenario or a reason. The full list, with the proposed capabilities, is in the catalogue on the worked-examples page.` },
        {
          kind: 'para',
          text: 'Two corrections carry the Week 1 review forward. The reference capabilities were derived before the needs NEED-012 to NEED-017 were added, so four capabilities are proposed to cover them; a fifth, CAP-015, takes NEED-011 from CAP-005. And CAP-007 originally covered only the loudness of each event, while the corrected NEED-003 also bounds the number of evening and early-morning events; a capability limited to loudness would have let the requirements cover only loudness.',
        },
        { kind: 'figure', slide: 'w2s1-capability-gaps' },
      ],
      sources: [],
    },
    {
      id: 'w2s1-l-levels',
      title: 'Two levels of requirement, and one chain worked end to end',
      blocks: [
        { kind: 'definition', term: 'Stakeholder requirements (SEBoK glossary, from ISO/IEC/IEEE 29148)', text: '“Stakeholder requirements are transformed from the stakeholder needs to objectively adequate, structured and more formal statements.”', source: R('R39a', '1632') },
        { kind: 'definition', term: 'System requirement (SEBoK glossary, from ISO/IEC/IEEE 15288)', text: '“A statement that transforms the stakeholder, user-oriented view of desired capabilities into a technical view, of a solution that meets the operational needs of the user.”', source: R('R39l', '1652') },
        {
          kind: 'para',
          text: 'The DoD guidebook names the processes behind the two levels. Stakeholder Requirements Definition translates stakeholder capability needs into a set of technical requirements; Requirements Analysis decomposes end-user needs into clear, achievable and verifiable requirements and supports their allocation and derivation down to the system elements. SEBoK adds the level rule: requirements must suit the level at which the system of interest sits in the architecture and say what it must do, not how.',
        },
        { kind: 'callout', tone: 'note', title: 'Course convention', text: 'A stakeholder requirement (REQ-STK) has the whole service as its subject: “The AeroLink service shall …”. A system requirement (REQ-SYS) has a named element or function as its subject: “The charging system shall …”, “The scheduling function shall …”.' },
        { kind: 'figure', slide: 'w2s1-two-levels' },
        { kind: 'heading', text: 'One chain: from NEED-004 to REQ-SYS-001' },
        { kind: 'para', text: `The vertiport operators’ need contains no number: “${need('NEED-004').statement}” The capability CAP-003 states what the enterprise must achieve, and the scenario SCN-003 shows how a turnaround runs. Analysis then asks how long a turnaround may take before pads, not demand, limit departures, and sets a budget of ${TURNAROUND_BUDGET.total} minutes: ${TURNAROUND_BUDGET.padWork} minutes of pad work plus a ${TURNAROUND_BUDGET.charge}-minute charge, ${TURNAROUND_BUDGET.note}.` },
        { kind: 'bullets', items: [`**REQ-STK-005:** ${requirement('REQ-STK-005').statement}`, `**REQ-SYS-001:** ${requirement('REQ-SYS-001').statement}`] },
        { kind: 'figure', slide: 'w2s1-one-chain' },
        {
          kind: 'para',
          text: 'SEBoK calls this budgeting: a system-level value is decomposed so that lower-level elements contribute their portion, and the resulting requirements depend on each other, so that a change in one forces a change in another. If a new safety check added three minutes of pad work, either the charge would have to finish in seventeen minutes or the turnaround would grow and the operators’ need would be at risk. Nothing in the chain is a rewording: each step is an engineering decision.',
        },
        { kind: 'heading', text: 'The driving question, answered' },
        {
          kind: 'para',
          text: 'The team member who wanted to write “shall” statements straight from the needs would have missed the notification need that SCN-005 exposed, the unagreed public-transport assumption, the unknown weather limits, and the difference between the needs that are operations and the needs that are siting constraints. The route from needs to requirements runs through the description of operation.',
        },
        { kind: 'figure', slide: 'w2s1-answer' },
        { kind: 'callout', tone: 'key', title: 'Before Session 2', text: 'Each member drafts one candidate scenario skeleton for the team’s enterprise: its scenario system of interest in one sentence, the trigger, the primary actor and the failure end state. Read SEBoK’s System Requirements Definition, pages 557–559 and 565–566.' },
      ],
      sources: [R('R48a', '141'), R('R48b', '142'), R('R13', '558–559'), R('R13', '562')],
    },
  ],
}
