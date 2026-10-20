// Week 4, Session 2 lecture: Architecture / Information View — information management and the information view (data
// versus information, producer → consumer → decision, flows checked against the physical view, metadata and sensitivity,
// AI capabilities with human oversight), the AeroLink information view worked in full with the answer to the driving
// question and an audit, the evaluation of the architecture against requirements and TPMs, and the Lab L4 launch.
// 75-minute session: 47 minutes of lecture and 22 minutes of laboratory launch on 18 slides plus the generated "References
// and credits" slide, and a 6-minute buffer. Single source for the slide viewer, the faculty notes, the .pptx and the
// student lesson (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20 and A21.
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week04/WEEK04_LECTURE_OUTLINE.md §3.
//
// Accuracy rules followed: as in session1.ts. Two scope notes are said aloud where they bite: SEBoK's information
// management article is written about information assets in general (its data–information figure includes system
// operation), and no source in the collection gives a method for operational producer → consumer → decision tracing,
// so that method is a course convention. AeroLink is FICTIONAL; every count is computed in ./aerolinkCase.ts.
import type { Lecture } from '../types'
import { numberWord } from '../week01/aerolinkCase'
import { REQUIRED_CAPACITY, tpm } from '../week03/aerolinkCase'
import {
  AI_CAPABILITIES, COUNTS, DISPATCH_ANSWER, EVALUATION, FEEDS_FORWARD, FINDINGS, INFORMATION, W4_EXTERNALS, fn, info, physical, uncoveredRoutes,
} from './aerolinkCase'
import { CONSISTENCY_CHECKS, LAB4_MINIMUMS as MIN, LAB4_MINIMUMS_THREE as MIN3, LAB4_TEAM_HOURS, REQUIRED_VIEW_KINDS } from './labBrief'

export const WEEK4_S2_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const C = COUNTS
const i1 = info('INFO-001')
const i3 = info('INFO-003')
const i4 = info('INFO-004')
const a1 = AI_CAPABILITIES[0]
const a2 = AI_CAPABILITIES[1]
const gap = uncoveredRoutes()[0]
const opens = EVALUATION.filter((r) => r.verdict === 'open')
const ev = (id: string) => EVALUATION.find((r) => r.id === id)!
/** An element's name in running text: lower case, except words with an inner capital (eVTOL). */
const placeName = (id: string) => (physical(id)?.name ?? W4_EXTERNALS.find((x) => x.id === id)?.name ?? id).split(' ').map((w) => (/.[A-Z]/.test(w) ? w : w.toLowerCase())).join(' ')
const DA = DISPATCH_ANSWER
const crossing = DA.inputs.filter((x) => x.crosses)
const inside = DA.inputs.filter((x) => !x.crosses)
const crossText = crossing.map((x) => `the ${x.what}, ${x.by ? `decided by ${x.by} at` : 'from'} the ${placeName(x.at)} in ${x.fn}, travels as part of ${x.crosses!.info} over ${x.crosses!.via}, ${x.bound}`).join('; ')
const insideText = inside.map((x) => `the ${x.what}, ${x.by ? `which ${x.by} decides in` : 'made in'} ${x.fn} ${fn(x.fn).name}${x.madeFrom ? ` from the ${x.madeFrom.what} (${x.madeFrom.info}) that the ${placeName(x.madeFrom.at)} sends over ${x.madeFrom.via}` : ''}, ${x.bound}`).join('; ')
const corrected = INFORMATION.filter((x) => x.provenance === 'corrected').map((x) => x.id)
const proposed = INFORMATION.filter((x) => x.provenance === 'proposed').map((x) => x.id)
const added = INFORMATION.filter((x) => x.provenance === 'proposed' && x.id !== 'INFO-006')

export const WEEK4_SESSION2: Lecture = {
  week: 4,
  session: 2,
  title: 'Architecture / Information View',
  subtitle: 'Session 2: The information view, evaluation and the lab launch',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ F. information view (21 min)
    {
      id: 'w4s2-information',
      title: 'Information management and the information view',
      slides: [
        {
          id: 'w4s2-warmup',
          title: 'Warm-up: three questions from Session 1',
          purpose: 'Retrieval of Session 1 before new material.',
          minutes: 3,
          layout: 'bullets',
          body: [
            {
              kind: 'bullets',
              items: ['1. Is “Charger” a good function name? Why not?', '2. Which allocation pitfall skips a plane?', '3. What does a decision record hold besides the choice?'],
            },
          ],
          sources: [R('R20b', '587'), R('R20c', '602')],
          notes: {
            teach: [
              'Read three one-minute papers from Session 1 aloud, without names; praise one good verb-and-object function and one well-chosen criterion.',
              'Then the three questions; give twenty seconds each and take answers. One: no; a function is a transformation of inputs into outputs (R20b p.587), and a charger is one element that may perform “Charge aircraft”. Two: no logical architecture, passing straight from requirements to a physical design (R20c p.602). Three: the question, the alternatives considered, the rationale, and the needs and risks it was tested against.',
            ],
            why: 'Retrieval at the start strengthens what was learned and shows the instructor what needs a second pass before the information view builds on it.',
            transition: 'Today’s new view is about what passes between those elements: information.',
            timing: '3 min: 1 min one-minute papers, 2 min three questions.',
          },
        },
        {
          id: 'w4s2-info-management',
          title: 'What information management is for',
          purpose: 'Ground the information view in a process and its purpose, with an honest scope note.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-im-ring',
            caption: 'The eight verbs of the 15288 information management purpose, with the AeroLink weather item placed at each stage. (FICTIONAL)',
            alt: 'A ring of eight stages: generate, obtain, confirm, transform, retain, retrieve, disseminate, dispose. Beside each stage a short note about the weather item: the service generates it, the operations center obtains and confirms it, transforms it into a hold decision, retains it, retrieves it for review, disseminates the hold to dispatch, and disposes of the forecast once it is out of date.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Relevant, complete, verified, protected, distributed', 'Generate, obtain, confirm, transform … dispose', 'Supports analytics and decision-making', 'Data becomes useful information for decisions'],
            },
          ],
          sources: [R('R21', '510'), R('R21', '511'), R('R21', '512'), R('R66', '112')],
          notes: {
            teach: [
              'SEBoK: information management helps teams access and manage information over its life cycle, ensuring it is relevant, complete, verified, protected, distributed and managed. It quotes the ISO/IEC/IEEE 15288 purpose: to generate, obtain, confirm, transform, retain, retrieve, disseminate and dispose of information to designated stakeholders (R21 p.510).',
              'Among the business objectives it enables is support for analytics and decision-making (R21 p.511). MITRE makes the same point about data in operation: as data flows between systems, processes and departments, organizations leverage it by transforming it into useful information, and data is essential to well-informed decisions (R66 p.112).',
              'A scope note, said honestly. SEBoK’s article is written about information assets in general: technical, project, organizational and user information. Its data-and-information figure does include system operation (R21 p.512), and we apply the idea to operational information flows. But no source in our collection gives a method for tracing operational information to decisions; the method on the next slides is a course convention built on these purposes.',
            ],
            why: 'Students need a reason to treat information as an architecture element; the 15288 purpose and the decision-making objective give one.',
            figure: 'Walk the ring with the weather item: generated by the weather service, obtained and confirmed at the operations center, transformed into a hold decision, retained, retrieved for review, disseminated to dispatch, and disposed of once out of date.',
            misconceptions: [{ claim: 'Information management is the IT department’s filing system.', correction: 'In SEBoK it is a systems engineering process whose purpose includes getting the right information to designated stakeholders for decisions.' }],
            transition: 'The deliverable asks you to distinguish data from information. What is the difference?',
            timing: '3 min: 1 min purpose, 1 min decision-making, 1 min scope note.',
          },
        },
        {
          id: 'w4s2-data-information',
          title: 'Data versus information',
          purpose: 'The distinction the deliverable asks for, from the source, with an AeroLink example.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-data-information',
            caption: 'From raw readings, to information in context, to a decision. (FICTIONAL)',
            alt: `A three-step strip. Left, data: a column of raw readings, ${i3.data}. Middle, information: ${i3.information}. Right, decision: ${i3.decision.toLowerCase()}. Arrows labeled structure and analyze, then decide.`,
          },
          body: [
            { kind: 'definition', term: 'Data and information', text: 'data are raw unstructured values, and information is structured data in context that has been analyzed and interpreted', source: R('R21', '512') },
            { kind: 'bullets', items: ['Standards draw the line slightly differently', 'Data without context has no value'] },
          ],
          sources: [R('R21', '511'), R('R21', '512'), R('R66', '113')],
          notes: {
            teach: [
              'SEBoK first shows that the standards differ. ISO/IEC/IEEE 15289 treats data as records that are outputs of life cycle processes and parts of information items produced for human use; GEIA-STD-927B defines data as a formalized representation of facts and information as data organized so it can be interpreted, a distinction between uninterpreted measurements and meanings derived by analysis; GEIA-STD-859B even calls data information recorded in a convenient form (R21 p.511).',
              'From these SEBoK synthesizes the definition on the slide: data are raw unstructured values, and information is structured data in context that has been analyzed and interpreted (R21 p.512). MITRE puts it bluntly: data without context has no value, and data that consumers never use is worthless; the value of data is in the information it contains (R66 p.113).',
              `AeroLink example. ${Cap(i3.data)} are data. ${Cap(i3.information)} is information: it has been structured per aircraft, put in context against limits and trends, and analyzed. Only the second can support the decision: ${i3.decision.toLowerCase()}.`,
            ],
            why: 'Teams that list data stores and call them an information view miss the point; the distinction forces them to say what each item means and who uses it.',
            figure: 'Read left to right: raw readings, the structured and analyzed status, the decision. The two arrows are where the work happens.',
            misconceptions: [{ claim: 'Information is just data in a database.', correction: 'Storage does not make data information. Structure, context and analysis do, and a consumer who uses it for something.' }],
            transition: 'If information is data put to use, every item should name its use.',
            timing: '4 min: 1.5 min the standards, 1 min the synthesis, 1.5 min the example.',
          },
        },
        {
          id: 'w4s2-producer-consumer',
          title: 'The course method: producer → consumer → decision',
          purpose: 'Every information item records a producer, a consumer and the decision it supports.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-pcd-template',
            caption: 'The three-box template for every information item; an empty decision box means the item is not information yet.',
            alt: 'Three boxes joined by arrows: producer, information item, consumer. Under the consumer, a fourth box labeled decision supported, highlighted and empty, with the note: if this stays empty, ask who needs it.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Producer: the element that creates it', 'Consumer: the element or AI capability that uses it', 'Decision: what it supports, with the ID it serves', 'No decision? Data not yet information, or not needed'],
            },
          ],
          sources: [R('R21', '515'), R('R62', '345'), R('R62', '346')],
          notes: {
            teach: [
              'The method is a course convention, built on the decision-making purpose of information management. For every information item record four things: the producer, the element that creates it; the consumer, the element or AI capability that uses it; the decision it supports; and the function, requirement or decision record that decision belongs to.',
              'Two sources support the emphasis on decisions. SEBoK lists, among the functions of an information management system, analysis of data to transform it into information and reporting of results in the context appropriate for decisions (R21 p.515). MITRE tells architects to lay out the requirements for an architecture: what decisions it supports and what it will help stakeholders reason about, early and often (R62 pp.345–346).',
              'The test is the empty box. If you cannot name a decision, the item is data that has not yet been turned into information, or nobody needs it. Either finding is useful: the first sends you back to the analysis, the second lets you drop the item.',
            ],
            why: 'Naming the decision is what separates an information view from a data inventory, and it is the part of the rubric teams most often leave empty.',
            figure: 'Read the three boxes, then point at the highlighted decision box. Ask: what goes here for the one-minute paper function you wrote last session?',
            misconceptions: [{ claim: 'Every item a system stores belongs in the information view.', correction: 'Only items that pass between elements and support a decision. Internal working data stays inside the element.' }],
            transition: 'Information flows between elements. Do the elements have a way to pass it?',
            timing: '3 min: 1 min the four fields, 1 min sources, 1 min the empty box.',
          },
        },
        {
          id: 'w4s2-flows-check',
          title: 'Information flows check the physical view',
          purpose: 'Cross-view consistency: every flow between two elements needs an information route; an agreement carries no flow.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-route-rule',
            caption: 'An agreement line between two elements carries no data; a flow needs an information interface, or a recorded relay of them.',
            alt: 'Two element boxes joined only by a dashed double line labeled agreement; a data arrow between them ends in a red question mark. Below, the same two boxes joined by a solid line labeled information interface, with the data arrow riding on it and a green tick. Bottom, a relay: three boxes, two interfaces, one arrow passing through the middle box.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Related views must be consistent', 'A flow between elements crosses an information interface', 'Or a recorded relay of them', 'An organizational agreement carries no flow'],
            },
          ],
          sources: [R('R62', '345')],
          notes: {
            teach: [
              'MITRE: models and views that relate to each other should be consistent and concordant; identify the data or information each view shares and manage it centrally (R62 p.345). The information view and the physical view share the elements, so each can check the other.',
              'The course coverage rule, a convention: an information flow between two different elements must cross an information interface joining them, or a recorded relay of information interfaces through a third element. An organizational agreement, such as a pad-slot agreement, records duties; it carries no flow by itself. An AI capability counts as the element that hosts it.',
              'This week you record, for each producer–consumer pair, how the item travels, in words or as an interface you already know. Week 5 defines the interfaces properly. The check already pays off: AeroLink’s routes, checked against the reference interfaces, find one flow with nowhere to go, as you will see.',
            ],
            why: 'The rule turns the information view into a test of the physical view; missing interfaces are cheapest to find now, before Week 5 designs them.',
            figure: 'Top row: the agreement line and the arrow that has nowhere to travel. Middle row: the information interface that carries it. Bottom row: a relay through a middle element.',
            misconceptions: [{ claim: 'If two organizations have an agreement, their systems can exchange the data.', correction: 'An agreement allows or obliges an exchange; something still has to carry it. Draw the information interface, or record the relay.' }],
            transition: 'Information also has owners and protection needs.',
            timing: '3 min: 1 min consistency, 1 min the rule, 1 min what to record this week.',
          },
        },
        {
          id: 'w4s2-metadata',
          title: 'Metadata and sensitive information',
          purpose: 'Information items carry metadata and may be sensitive; record both.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-metadata-card',
            caption: `${i1.id} ${i1.name} with its metadata strip and a lock for its sensitivity. (FICTIONAL)`,
            alt: `A card for ${i1.id} ${i1.name}. A strip along the top lists metadata: owner, producer, status, provenance. A lock icon carries the label ${i1.sensitivity}.`,
          },
          body: [
            { kind: 'bullets', items: ['Metadata: data about data (title, author, provenance, status)', 'Security starts by defining sensitive information', `${i1.name}: ${i1.sensitivity}`] },
          ],
          sources: [R('R21', '513'), R('R21', '514')],
          notes: {
            teach: [
              'SEBoK: metadata can be thought of as data about data, for example the title, the authors, the provenance or the status of the information; it organizes the information, helps search and navigation, and plays a key role in governance (R21 p.513). The owner and provenance tags on every course element are metadata.',
              `Information security, in SEBoK’s simple approach, starts by defining sensitive information, with examples such as information that identifies an individual and health information (R21 p.514). AeroLink’s ${i1.name.toLowerCase()} is sensitive: ${i1.sensitivity}. Record a sensitivity for every item; the Week 3 security risks get their treatments from it.`,
            ],
            why: 'Recording sensitivity in the information view links Week 3’s security risks to the items they protect, and Week 5’s interfaces to the protection they need.',
            figure: 'Point at the metadata strip, then at the lock and its label.',
            misconceptions: [{ claim: 'Only payment data is sensitive.', correction: 'Anything that identifies a person, or reveals health or accessibility needs, is sensitive too.' }],
            transition: 'Some consumers and producers are AI capabilities. They need a card of their own.',
            timing: '2 min: 1 min metadata, 1 min sensitivity.',
          },
        },
        {
          id: 'w4s2-ai',
          title: 'AI capabilities in the information view',
          purpose: 'An AI capability consumes and produces information; it needs human oversight and named failure modes.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-ai-loop',
            caption: 'An AI capability between information items, with a human decision downstream and the failure modes beside it.',
            alt: 'An input information item flows into an AI capability box; its output flows to a diamond labeled human decision, then on to the action. Beside the AI box, a tag lists failure modes: missed prediction, false alarm, shift in the data. A note under the input reads only as good as the data.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['A human validates what the system learned', 'Only as good as the data it was trained on', 'New failure modes, including distributional shift', 'Course card: inputs, outputs, oversight, failure'],
            },
          ],
          sources: [R('R31', '1370'), R('R31', '1371')],
          notes: {
            teach: [
              'SEBoK’s artificial intelligence article: in both knowledge-based and learning approaches, a human is in the loop to validate the intelligence gained by the system and to make a conscious decision to deploy it (R31 p.1370). It warns that the system’s intelligence is only as good as the data used to train it, and lists trust, explainability, bias and uncertainty among the considerations for safe human interaction with intelligent systems (R31 p.1370).',
              'It also names failure modes not met in conventional engineering: negative side effects, reward hacking, scalable oversight, unsafe exploration and distributional shift (R31 p.1371). Distributional shift is the one teams most often meet: the world the model is used in no longer looks like the data it learned from.',
              'The course AI capability card, a convention: the inputs, as information item IDs; the outputs; the human oversight, who decides and what the AI may not do; the failure modes and their effects; and a note on the quality of the data. Every AI capability in your information view gets one.',
            ],
            why: 'An AI capability without stated oversight and failure modes is the most common defect in student architectures, and the one with the largest safety consequence.',
            figure: 'Follow the input into the AI box, the output into the human decision diamond, and then the action. Point at the failure-mode tag and at the data-quality note.',
            misconceptions: [{ claim: 'A human in the loop makes the AI safe.', correction: 'Only if the human has the information and the time to disagree. The card must say what the human sees and what the AI may not do on its own.' }],
            transition: 'Now the whole AeroLink information view.',
            timing: '3 min: 1 min human in the loop, 1 min failure modes, 1 min the card.',
          },
        },
      ],
    },
    // ============================================================================================ G. worked (16 min)
    {
      id: 'w4s2-worked',
      title: 'AeroLink worked example',
      slides: [
        {
          id: 'w4s2-worked-info',
          title: 'Worked example I: AeroLink’s information items',
          purpose: 'The information view, read across from producer to decision, with every function flow between elements in it.',
          minutes: 5,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-info-graph',
            caption: `${C.information} information items from their producers to their consumers; the class supplies each item’s decision before the instructor reveals it. (FICTIONAL)`,
            alt: `A graph with producers on the left, information items in the middle and consumers on the right. ${INFORMATION.map((x) => `${x.name}: from ${x.producers.join(' and ')} to ${x.consumers.join(' and ')}`).join('. ')}. One producer line, from ${gap.from} to ${info(gap.info).name.toLowerCase()}, is dashed red: it has no interface. The decisions are not drawn.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [`${C.information} items, each with producer, consumer and decision`, `${C.crossFlowsListed} of ${C.crossFlows} function flows between elements carried by an item`, `${C.routesCovered} of ${C.routes} producer–consumer routes covered`, `${Cap(numberWord(C.informationCorrected))} items corrected; ${numberWord(C.informationProposed)} new`],
            },
          ],
          sources: [R('R21', '512')],
          notes: {
            teach: [
              `Read the view across, one row at a time, with the class supplying the decision before you reveal it. ${INFORMATION.slice(0, 3).map((x) => `${x.id} ${x.name}: produced by ${x.producers.map((p) => physical(p)?.name ?? p).join(' and ')}; used by ${x.consumers.join(' and ')}; it supports the decision “${x.decision.toLowerCase()}”`).join('. ')}.`,
              `${INFORMATION.slice(3, 6).map((x) => `${x.id} ${x.name}: produced by ${x.producers.join(' and ')}; used by ${x.consumers.join(' and ')}; decision “${x.decision.toLowerCase()}”`).join('. ')}.`,
              `How do we know nothing is missing? Every function input in the case states where it comes from, so the flows between elements can be listed without looking at the items: ${C.crossFlows} of them, and every one travels in an item. The first run of that flow check found ${numberWord(added.length)} flows with no item, now added: ${added.map((x) => `${x.id} ${x.name.toLowerCase()}, used by ${x.consumers.join(' and ')}`).join('; ')}. Flows inside one element, such as the chargers’ power set-points, and exchanges with passengers at the boundary, are not flows between elements.`,
              `For each, insist on the data-and-information pair (R21 p.512). For ${i4.name.toLowerCase()}, the data are ${i4.data}; the information is ${i4.information}. Point out timeliness: this item ${i4.timeliness}, which is MITRE’s observation that some data lose value quickly once the event has passed; MITRE’s own example is weather data (R66 p.113).`,
              `Then the route check, computed from the case: ${C.routes} producer–consumer pairs between different elements; ${C.routesCovered} cross an information interface or a recorded relay. The one that does not is the subject of slide 11.`,
            ],
            why: 'Seeing every item with all four fields shows what a complete information view looks like, and reading it with the class rehearses the method on familiar data.',
            figure: 'Trace two items end to end: producer on the left, item in the middle, consumer on the right; ask the class for the decision before you reveal it. Then point at the one dashed red route without an interface.',
            misconceptions: [{ claim: 'The consumer is whoever might like to see the data.', correction: 'The consumer is the element or capability that uses it for a named decision. A reader without a decision is not a consumer.' }],
            transition: 'With the view in hand we can answer the driving question.',
            timing: `5 min: 2.5 min the first six items with students supplying decisions, 1 min the flow check and the ${numberWord(added.length)} added items, 0.5 min data and information, 1 min the route count.`,
          },
        },
        {
          id: 'w4s2-answer',
          title: 'Answering the driving question',
          purpose: 'Close the Session 1 question from the architecture description, and show the history of a gap the trace exposed.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-answer',
            caption: 'The Session 1 scene redrawn: what crosses an information interface into the operations center, and what is decided inside it before the release. (FICTIONAL)',
            alt: `Left, the producers outside the operations center, each with the data it sends and the interface: ${[...inside.filter((x) => x.madeFrom).map((x) => `${x.madeFrom!.at} sends the ${x.madeFrom!.what} over ${x.madeFrom!.via}`), ...crossing.map((x) => `${x.at} sends the ${x.what} over ${x.crosses!.via}`)].join('; ')}. Right, a panel for ${DA.decidedAt}, the operations center, holding ${inside.map((x) => `${x.fn} (${x.what}${x.by ? `, decided by ${x.by}` : ''})`).join(', ')}, each with an arrow into ${DA.decision} ${fn(DA.decision).name}. From ${DA.decision} an arrow runs back to the aircraft: ${DA.output.what} over ${DA.output.via}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [`Decides: ${fn(DA.decision).name.toLowerCase()}, at the operations center`, `${Cap(numberWord(crossing.length))} inputs cross an interface; ${numberWord(inside.length)} are made inside`, 'Weather data cross; the hold is a decision made inside', 'History: the trace once found a missing interface'],
            },
          ],
          sources: [R('R62', '345')],
          notes: {
            teach: [
              `Who decides? The release decision is the function ${DISPATCH_ANSWER.decision} ${fn(DISPATCH_ANSWER.decision).name}, performed by ${DISPATCH_ANSWER.performedBy} and allocated to ${DISPATCH_ANSWER.decidedAt}, the ${physical(DISPATCH_ANSWER.decidedAt).name.toLowerCase()}. The pilot flies; the interlock releases.`,
              `What reaches it, and how? ${Cap(numberWord(crossing.length))} inputs cross an information interface: ${crossText}. ${Cap(numberWord(inside.length))} are made inside the operations center: ${insideText}.`,
              `Keep data, decisions and deciders apart. The weather service sends data; the hold is the duty manager’s decision made from them, and it never crosses ${inside.find((x) => x.fn === 'FN-004')!.madeFrom!.via}. The aircraft reports its energy state; the plan is made at the operations center. The release then goes back to the aircraft as ${DA.output.info} over ${DA.output.via}.`,
              `Now the history, which is the lesson. ${DISPATCH_ANSWER.history} Every element worked; the architecture still had a flaw, because what passed between two elements had nothing to travel on. That is why the information view is traced against the physical view, MITRE’s “know the relationships” (R62 p.345).`,
            ],
            why: 'Closing the opening question with the architecture itself shows students that the information view is not paperwork: it found a real defect in the instructor’s own reference.',
            figure: 'Point first at the arrows that cross into the operations-center panel: what each carries, where from, which interface. Then at the boxes inside the panel: the hold and the plan are made there. Last, the release arrow back to the aircraft.',
            misconceptions: [
              { claim: 'If each element meets its requirements, the system meets its requirements.', correction: 'Only if what passes between them arrives, in time. The go / no-go status was produced on time and still rode on a procedure until the trace found it.' },
              { claim: 'The weather service tells dispatch to hold.', correction: 'It sends weather data. The hold is a decision the duty manager makes from those data, inside the operations center.' },
            ],
            transition: 'Two consumers in the view are AI capabilities. Here are their cards.',
            timing: '4 min: 1 min who decides, 2 min the inputs and the data–decision distinction, 1 min the history.',
          },
        },
        {
          id: 'w4s2-worked-ai',
          title: 'Worked example II: two AI capability cards',
          purpose: 'Show complete AI capability cards with oversight, failure modes and data quality.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-ai-cards',
            caption: `${a1.id} ${a1.name} and ${a2.id} ${a2.name}, each with inputs, outputs, oversight and failure modes. (FICTIONAL)`,
            alt: `Two cards side by side. ${AI_CAPABILITIES.map((a) => `${a.id} ${a.name}, hosted on ${a.host}: inputs ${a.inputs.join(', ')}; outputs ${a.outputs.toLowerCase()}; oversight: ${a.oversight.toLowerCase()}; failure: ${a.failure.toLowerCase()}`).join('. ')}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [`${a1.name}: technicians decide every withdrawal`, `${a2.name}: planners review before any capacity decision`, 'Each names what it may not do', 'Each names its data-quality weakness'],
            },
          ],
          sources: [R('R31', '1370'), R('R31', '1371')],
          notes: {
            teach: [
              `${a1.id} ${a1.name}, hosted at the ${physical(a1.host).name.toLowerCase()} and supporting ${a1.supports}. Input ${a1.inputs.join(', ')}; output: ${a1.outputs.toLowerCase()}. Oversight: ${a1.oversight.toLowerCase()}. Failure: ${a1.failure.toLowerCase()}. Data quality: ${a1.dataQuality}. It mitigates ${a1.risk}, the battery-fade risk of Week 3.`,
              `${a2.id} ${a2.name}, at the ${physical(a2.host).name.toLowerCase()}, supporting ${a2.supports}. Input ${a2.inputs.join(', ')}; output: ${a2.outputs.toLowerCase()}. Oversight: ${a2.oversight.toLowerCase()}. Failure: ${a2.failure.toLowerCase()}. The last clause is SEBoK’s distributional shift (R31 p.1371): ${a2.dataQuality}.`,
              'Both cards follow SEBoK’s human in the loop (R31 p.1370): the AI ranks and forecasts; a person decides. Ask the class which card is more dangerous if its oversight lapses, and why. The expected answer is the first: a missed prediction is caught by the reactive path, but a habit of trusting the list could erode the technicians’ own checks.',
            ],
            why: 'Complete cards are the model students copy; the two contrasting failure modes, safety and capital, show that oversight must be designed for the specific consequence.',
            figure: 'Read the two cards field by field, left then right.',
            misconceptions: [{ claim: 'A forecasting model has no safety consequence, so it needs no oversight.', correction: 'Its consequence is financial and service-level, a stranded capital decision or an under-built network; oversight protects that decision.' }],
            transition: 'Now audit the view: what is wrong in it?',
            timing: '3 min: 1 min each card, 1 min the comparison.',
          },
        },
        {
          id: 'w4s2-audit',
          title: 'Auditing the view: two reference defects and one new gap',
          purpose: 'Evaluate, not just read: find the defects in the instructor reference and propose fixes.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-audit',
            caption: 'Three findings, each with its proposed fix: a natural system as producer and a flow from a logical element into a decision record, both in the reference, and a route with no interface in the new evidence item. (FICTIONAL)',
            alt: `Three red boxes on the left, each joined by an arrow to a green box with the proposed fix. ${FINDINGS.slice(0, 3).map((f) => `${f.id} at ${f.where}: ${f.finding} Fix: ${f.proposed}`).join(' ')}`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Reference: weather as a producer, with no owner', 'Reference: a logical element feeding a decision record', 'New item: incident records with no route', 'Each fix proposed; the instructor confirms'],
            },
          ],
          sources: [R('R62', '345'), R('R21', '514')],
          notes: {
            teach: [
              `${FINDINGS[0].id}. ${FINDINGS[0].finding} Week 1’s rule applies: systems have owners; weather has none. Proposed: ${FINDINGS[0].proposed}`,
              `${FINDINGS[1].id}. ${FINDINGS[1].finding} Proposed: ${FINDINGS[1].proposed}`,
              `${FINDINGS[2].id}. ${FINDINGS[2].finding} This is the route the check could not cover: ${gap.info} from ${gap.from} to ${gap.to}. Proposed: ${FINDINGS[2].proposed} It matters because the evidence the insurers need includes incidents, which are exactly the records missing.`,
              'All three fixes are proposals for the instructor to confirm; the reference itself is not changed this week. Be precise about why the first two survived: the reference’s route check is tested, but it asks whether a flow has an interface, not what kind of element may produce or consume an item. That kind check is a separate check, and MITRE’s point that related views must agree covers both (R62 p.345). The third is a gap in this week’s own new item. Auditing someone else’s view is the fastest way to learn to audit your own.',
            ],
            why: 'Evaluating a reference, rather than copying it, builds the habit the lab and the rubric reward, and these three findings are the three most common in student views.',
            figure: 'Point at each red callout in turn and read its one-line finding.',
            misconceptions: [{ claim: 'The instructor’s reference is correct by definition.', correction: 'It is a worked example under review. Finding its defects with a stated rule is exactly the skill being taught.' }],
            transition: 'The view is consistent where it is complete. Does the architecture meet the requirements?',
            timing: '4 min: 1 min each finding, 1 min the point about audits.',
          },
        },
      ],
    },
    // ============================================================================================ H. evaluation and bridge (10 min)
    {
      id: 'w4s2-evaluation',
      title: 'Evaluation, consistency and what comes next',
      slides: [
        {
          id: 'w4s2-evaluation-matrix',
          title: 'Evaluating the architecture against requirements and TPMs',
          purpose: 'Assess the architecture against its requirements, TPMs and risks; name what is still open.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-evaluation',
            caption: `Each requirement, TPM or risk with its verdict; ${numberWord(opens.length)} rows are open. What each row is allocated to, and its evidence, are in the notes and the lesson table. (FICTIONAL)`,
            alt: `A matrix with two columns, item and verdict. Rows: ${EVALUATION.map((r) => `${r.id} ${r.item}, ${r.verdict}`).join('; ')}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Assess candidates against criteria from the requirements', 'Trace each requirement to the elements that meet it', 'TPMs are allocated down the hierarchy', `${Cap(numberWord(opens.length))} rows open, each with an owner week`],
            },
          ],
          sources: [R('R20b', '592'), R('R20c', '599'), R('R56', '386'), R('R56', '387'), R('R44', '115')],
          notes: {
            teach: [
              'How do you know an architecture is any good before anything is built? SEBoK: select the logical architecture by assessing candidates against assessment criteria related to the system requirements, using system analysis and decision management (R20b p.592); a physical architecture is evaluated to balance design properties, cost and risk, and is shaped more by non-functional requirements than by functions (R20c p.599). MITRE: the design should clearly point to the capabilities that meet each system requirement, through a two-way traceability matrix (R56 pp.386–387). And the DoD guidebook: TPMs may be allocated or decomposed to subsystem assemblies (R44 p.115).',
              `AeroLink’s evaluation, every number computed from the case. Capacity: ${ev('REQ-STK-004').evidence}, so the requirement of ${REQUIRED_CAPACITY} is met by the physical view. ${ev('TPM-001').id}: ${ev('TPM-001').allocated}; ${ev('TPM-001').evidence}. ${ev('TPM-003').id}: ${ev('TPM-003').allocated}; ${ev('TPM-003').evidence}. That split allocation is the lesson: the requirement belongs to planning, but the quantity depends on the battery, so the TPM must be tracked in two elements.`,
              `Then the open rows: ${opens.map((r) => `${r.id}, ${r.item}: ${r.evidence}`).join('; ')}. Note ${ev('REQ-SYS-008').id}: an interface exists, but existence is not evidence of time. An evaluation that shows no open rows has usually not looked hard enough.`,
            ],
            why: 'Evaluation turns the description into an argument that the requirements can be met, and shows students where their own architecture is still a promise.',
            figure: 'Read three rows across, one meets, one with a margin, one open, then count the open rows.',
            misconceptions: [{ claim: 'Allocating every requirement proves the architecture meets them.', correction: 'Allocation says who is responsible. Evaluation asks whether the element can actually deliver, with evidence such as a margin or a capacity computation.' }],
            transition: 'Four checks keep the views consistent; and here are the errors to avoid.',
            timing: '4 min: 1.5 min sources, 1.5 min AeroLink rows, 1 min the open rows.',
          },
        },
        {
          id: 'w4s2-consistency',
          title: 'Keeping the views consistent, and common errors',
          purpose: 'Consolidate by contrast: four checks the tool computes, and the errors reviewers see most.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-consistency-hub',
            caption: 'Four views around one register of IDs; each spoke is one of the four consistency checks.',
            alt: `Four view icons, functional, logical and physical, information, operational, around a central box labeled one register of IDs. Each spoke carries a check: ${CONSISTENCY_CHECKS.join('; ')}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Errors: physical names in the functional view', 'Functions without inputs and outputs; too deep', 'Allocation without a criterion; no logical plane', 'Items with no decision; AI with no oversight'],
            },
          ],
          sources: [R('R62', '344'), R('R62', '345'), R('R20b', '594'), R('R20c', '602'), R('R31', '1370')],
          notes: {
            teach: [
              `Four consistency checks, a course convention built on MITRE’s “know the relationships” (R62 p.345). ${CONSISTENCY_CHECKS.map((c, k) => `${k + 1}: ${c}`).join('. ')}. The lab tool computes all four on your record. AeroLink passes all four; the incident route was found by the route check, which is a separate check from these four.`,
              'Then the errors, each with its source. Physical names in the functional view. Functions without inputs and outputs, and decomposition too deep (R20b p.594). Allocation without a criterion, and skipping the logical plane (R20c p.602). Information items with no decision. An organizational agreement drawn as the carrier of a data flow. An AI capability with no human oversight (R31 p.1370). And views produced for their own sake, against purpose is paramount (R62 p.344).',
            ],
            why: 'A short list of named errors, each with the check that catches it, is what students use to review their own draft before submission.',
            figure: 'Point at the central register, then read the check on each spoke.',
            misconceptions: [{ claim: 'Consistency checks are the tool’s job, not ours.', correction: 'The tool checks structure. Whether a criterion is sensible or a decision is real is engineering judgment, judged in review.' }],
            transition: 'Where does all this go next?',
            timing: '3 min: 1.5 min the four checks, 1.5 min the errors.',
          },
        },
        {
          id: 'w4s2-feeds-forward',
          title: 'What this week feeds, and what it does not do',
          purpose: 'Continuity to Weeks 5–14, and the limits of a concept-level architecture description.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-feeds-forward',
            caption: 'Week 4 artifacts and the weeks that consume them.',
            alt: `A set of lanes from the Week 4 box: ${FEEDS_FORWARD.map((f) => `${f.artifact} to ${f.week}`).join('; ')}.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Week 5: components and every interface', 'Week 6: as-is and to-be views; Week 7: the package', 'Weeks 10–12: actions, parts, allocations, the thread', 'Not yet: interfaces, sequences, modes, timing'],
            },
          ],
          sources: [R('R72', '30'), R('R85', '181'), R('R20a', '581')],
          notes: {
            teach: [
              `Each artifact has a consumer. ${FEEDS_FORWARD.map((f) => `${f.artifact}: ${f.week}, ${f.how}`).join('. ')}.`,
              'Two Phase II bridges, named only. In SysML v2 an action definition is a definition of an action to be performed, and its directed features are its parameters (R72 p.30): today’s functions with their inputs and outputs become exactly that in Week 10. And the SysML v2 specification defines a viewpoint as a kind of requirement that frames the concerns of stakeholders, and a view as the artifact that addresses them (R85 p.181): the viewpoints you write today become the stakeholder views of Week 14.',
              'Then the limits, said plainly. A Week 4 description is at concept level. It has no interface definitions yet, no sequences or timing, and no modes, which SEBoK lists among the contents of a functional view (R20a p.581). Its allocation reasons are judgments, checked in review. And the standard behind its vocabulary is not in our collection. Each limit has a week that addresses it.',
            ],
            why: 'Students who know what consumes their work keep it traceable, and an honest list of limits stops them overclaiming in the Week 7 package.',
            figure: 'Follow each lane from the Week 4 box to the week that consumes it.',
            misconceptions: [{ claim: 'The architecture is finished at the end of Week 4.', correction: 'It is a first baseline at concept level. Weeks 5, 6, 10 and 11 extend it, and each change is traced back to this week’s IDs.' }],
            transition: 'Now your team starts its own: the Lab L4 launch.',
            timing: '3 min: 1 min feeds, 1 min the bridges, 1 min the limits.',
          },
        },
      ],
    },
    // ============================================================================================ J. lab launch (22 min)
    {
      id: 'w4s2-lab',
      title: 'Laboratory launch: Lab L4',
      slides: [
        {
          id: 'w4s2-lab-brief',
          title: 'Lab L4 brief: your architecture description',
          purpose: 'Unambiguous instructions: the four record parts, minimums, due date and the tool’s role.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-lab-checklist',
            caption: 'Lab L4 at a glance: the four parts added to the Team Record and their minimums for a team of four.',
            alt: `A checklist with four sections. Views: ${MIN.viewpoints} viewpoints including ${REQUIRED_VIEW_KINDS.join(', ')}, each with a purpose and concerns. Functions: ${MIN.functions} functions with inputs and outputs under at least ${MIN.groups} first-level functions. Allocation: at least ${MIN.logical} logical and ${MIN.physical} physical elements, every function allocated with a criterion, ${MIN.decisions} decision record. Information: ${MIN.information} items with producer, consumer and decision; ${MIN.ai} AI capability card.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [`${MIN.viewpoints} viewpoints; ${MIN.functions} functions; ${MIN.logical} logical, ${MIN.physical} physical`, `${MIN.decisions} decision; ${MIN.information} information items; ${MIN.ai} AI card`, `Team of three: ${MIN3.functions} functions, ${MIN3.information} items`, 'Your enterprise, never AeroLink; due before Week 5'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              `Walk the four parts. Views: ${MIN.viewpoints} viewpoints covering the course minimum, each with its purpose as a question, the stakeholders and concerns it serves, and its form. Functions: at least ${MIN.functions}, each named verb and object, with inputs and outputs, derived from a capability and a scenario, under at least ${MIN.groups} first-level functions.`,
              `Allocation: at least ${MIN.logical} logical and ${MIN.physical} physical elements, every function allocated to both with a criterion and a sentence, every system requirement allocated, and at least ${MIN.decisions} architecture decision record with three alternatives. Information: at least ${MIN.information} items, each with data and information, producer, consumer, decision and route; at least ${MIN.ai} AI capability card.`,
              `A team of three works to reduced minimums, in proportion to team size: ${MIN3.functions} functions, ${MIN3.logical} logical and ${MIN3.physical} physical elements, ${MIN3.information} information items. The lab tool imports your Week 3 export and computes the four consistency checks; its hard gates block only real defects. About ${LAB4_TEAM_HOURS} person-hours for a team of four. Due before Week 5, Session 1, with the AI usage statement.`,
            ],
            why: 'Clear minimums and the tool’s role remove the two commonest questions, “how many?” and “what will be checked?”, and leave the team’s time for judgment.',
            figure: 'Read the four sections of the checklist with their numbers.',
            misconceptions: [{ claim: 'The tool decides whether our architecture is right.', correction: 'The tool catches defects any reviewer would reject and computes the consistency checks. Whether your views, functions and reasons are sound is judged in review.' }],
            transition: 'Now start: view purposes and your first scenario walk.',
            timing: '3 min: 1 min views and functions, 1 min allocation and information, 1 min team of three, tool and due date.',
          },
        },
        {
          id: 'w4s2-lab-views',
          title: 'Team work: view purposes and the first scenario walk',
          purpose: 'In-class start where instructor feedback prevents the commonest error, physical names in the function list.',
          minutes: 10,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-view-template',
            caption: 'The in-class template: one purpose question per view, then one scenario walked into functions.',
            alt: 'A two-part worksheet. Top: five rows, one per required view, with columns purpose question, stakeholders and concerns. Bottom: a scenario strip with steps on the left and a function column on the right, each function written verb and object with an input and an output.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Write one purpose question per required view', 'Name the stakeholders and concerns each serves', 'Walk one Week 2 scenario into functions', 'Verb + object, with an input and an output'],
            },
          ],
          sources: [R('R62', '344'), R('R20b', '594')],
          notes: {
            teach: [
              'Teams work from their Week 3 records and the decision lists members brought. First five minutes: one purpose question per required view, with the stakeholders and concerns it serves; MITRE’s test is whether the view helps a stakeholder conclude their objectives will be met (R62 p.344). Next five minutes: walk one Week 2 scenario step by step into functions, scenario first, as SEBoK’s proven practice says (R20b p.594).',
              'Circulate. Look for two things: function names that are element names (“booking app”, “dispatch system”) and functions with no input or output written. Correct them at the table; they are the commonest defects in this lab.',
            ],
            why: 'The first scenario walk is where teams most need feedback; doing it in the room prevents a week of work on element names dressed as functions.',
            figure: 'Point at the two halves of the worksheet: purposes on top, the scenario walk below.',
            transition: 'Now the check: two or three teams show their walk.',
            timing: '10 min: 5 min view purposes, 5 min scenario walk; circulate and give a two-minute warning.',
          },
        },
        {
          id: 'w4s2-lab-check',
          title: 'Instructor check: one scenario walk per team',
          purpose: 'Public feedback on scenario-to-function mappings.',
          minutes: 7,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-check-card',
            caption: 'The check card: three questions for every scenario walk.',
            alt: 'A card with three check boxes: every function is named as an action, verb and object; every function has an input and an output; every step is served by a function, or a new function or gap is recorded.',
          },
          body: [
            { kind: 'bullets', items: ['Every function an action: verb + object', 'Every function with an input and an output', 'Every step served, or a gap recorded'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Up to four teams, about ninety seconds each, show one scenario and the functions it produced. Apply the three questions aloud so every team learns from each: every function an action; every function with an input and an output; every step served, or a new function or gap recorded. Teams not seen post their walk on the LMS and get the same check in writing within 48 hours.',
            ],
            why: 'Public checking teaches the criteria to every team at once and catches the element-name defect before it spreads through a team’s whole function list.',
            figure: 'Point at the three boxes as you apply them to each team.',
            transition: 'Last, the plan for the next seven days.',
            timing: '7 min: about 90 s per team for up to four teams, 1 min written-route instructions.',
          },
        },
        {
          id: 'w4s2-lab-close',
          title: 'Close: the next seven days',
          purpose: 'Work plan out of class and the assessment.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w4s2-seven-days',
            caption: 'A seven-day plan for Lab L4, with the lead role for each step.',
            alt: 'A timeline of seven days. Days 1 and 2: remaining scenario walks, each member walks one. Day 2: capability trace and decomposition. Days 3 and 4: logical and physical elements and allocation with criteria. Day 4: the decision record. Days 4 and 5: information view. Day 5: AI capability card. Day 6: consistency checks and the AI usage statement. Day 7: integration and upload.',
          },
          body: [
            { kind: 'bullets', items: ['Days 1–2: scenario walks; trace and decomposition', 'Days 3–4: allocation with criteria; the decision', 'Days 4–6: information view, AI card, checks', 'Day 7: integration and upload; quiz Q4 opens'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Walk the seven days. Each member walks one scenario; the Requirements and Compliance lead keeps the capability trace; the Architecture lead runs the allocation and the decision; the AI and Data Management lead owns the information view and the AI card; Verification and Validation runs the consistency checks before upload. Readiness quiz Q4 and the individual applied exercise open now; graduate students do the viewpoint-coverage task instead of the exercise. Log your hours.',
            ],
            why: 'A day-by-day plan with owners prevents the last-day information view, which is where the decisions usually go missing.',
            figure: 'Read the timeline left to right with the owner of each step.',
            transition: 'End of the week’s lectures; references follow.',
            timing: '2 min: the timeline and the assessment.',
          },
        },
        {
          id: 'w4s2-references',
          title: 'References and credits',
          purpose: 'The generated list of every source cited in this session, with license credits.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while teams pack up. The list is generated from every citation in the session and includes SEBoK’s required attribution.'],
            why: 'Students should be able to find every source the session relied on.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the close.',
          },
        },
      ],
    },
  ],
  studentLesson: [
    {
      id: 'w4-lesson-information',
      title: 'Information management, data and information',
      sources: [R('R21', '510'), R('R21', '511'), R('R21', '512'), R('R66', '112'), R('R66', '113')],
      blocks: [
        { kind: 'para', text: 'SEBoK: information management helps teams access and manage information over its life cycle, ensuring that it is relevant, complete, verified, protected, distributed and managed; ISO/IEC/IEEE 15288 states its purpose as generating, obtaining, confirming, transforming, retaining, retrieving, disseminating and disposing of information to designated stakeholders (R21 p.510). One of the business objectives it enables is support for analytics and decision-making (R21 p.511). MITRE adds the operational picture: data flows between systems, processes and departments and is leveraged by transforming it into useful information for decisions (R66 p.112).' },
        { kind: 'figure', slide: 'w4s2-info-management' },
        { kind: 'para', text: 'The standards SEBoK cites draw the line between data and information slightly differently (R21 p.511). Its synthesis is the definition to use: **data are raw unstructured values, and information is structured data in context that has been analyzed and interpreted** (R21 p.512). MITRE: data without context has no value, and data that consumers never use is worthless (R66 p.113).' },
        { kind: 'callout', tone: 'note', title: 'Scope note', text: 'SEBoK’s article covers information assets in general; its data-and-information figure includes system operation (R21 p.512). No source in the course collection gives a method for tracing operational information to decisions, so the producer, consumer and decision method below is a course convention built on the decision-making purpose of information management.' },
        { kind: 'para', text: `An AeroLink example: ${i3.data} are data; ${i3.information} is information, because it has been structured per aircraft, put in context against limits and trends, and analyzed. Only the information supports the decision: ${i3.decision.toLowerCase()}.` },
        { kind: 'figure', slide: 'w4s2-data-information' },
      ],
    },
    {
      id: 'w4-lesson-info-view',
      title: 'Building the information view',
      sources: [R('R21', '513'), R('R21', '514'), R('R21', '515'), R('R62', '345'), R('R62', '346')],
      blocks: [
        { kind: 'para', text: 'For every information item record its **producer** (the element that creates it), its **consumer** (the element or AI capability that uses it), the **decision it supports**, and the function, requirement or decision record that decision belongs to. If no decision can be named, the item is data not yet turned into information, or nobody needs it. SEBoK lists among the functions of an information management system the analysis of data into information and reporting in the context appropriate for decisions (R21 p.515); MITRE tells architects to lay out what decisions an architecture supports (R62 pp.345–346).' },
        { kind: 'figure', slide: 'w4s2-producer-consumer' },
        { kind: 'para', text: 'The information view checks the physical view. Related views should be consistent, with the information they share managed centrally (R62 p.345). The course rule: an information flow between two different elements must cross an information interface joining them, or a recorded relay of information interfaces; an organizational agreement records duties and carries no flow; an AI capability counts as the element that hosts it. This week, record how each item travels; Week 5 defines the interfaces.' },
        { kind: 'figure', slide: 'w4s2-flows-check' },
        { kind: 'para', text: `Each item also carries metadata, data about data such as title, author, provenance and status, which supports governance (R21 p.513), and a sensitivity. Information security starts by defining sensitive information, for example information that identifies an individual or health information (R21 p.514). AeroLink’s ${i1.name.toLowerCase()} is sensitive: ${i1.sensitivity}.` },
        { kind: 'figure', slide: 'w4s2-metadata' },
      ],
    },
    {
      id: 'w4-lesson-ai',
      title: 'AI capabilities with human oversight',
      sources: [R('R31', '1370'), R('R31', '1371')],
      blocks: [
        { kind: 'para', text: 'SEBoK: in both knowledge-based and learning approaches to intelligent systems, a human is in the loop to validate the intelligence gained by the system and to make a conscious decision to deploy it; the system’s intelligence is only as good as the data used to train it; and trust, explainability, bias and uncertainty must be considered for safe human interaction (R31 p.1370). It also lists failure modes new to engineering: negative side effects, reward hacking, scalable oversight, unsafe exploration and distributional shift, the last meaning that the data in use no longer resemble the data the model learned from (R31 p.1371).' },
        { kind: 'para', text: 'The course AI capability card (a convention) records: the element that hosts it and the function it supports; the inputs, as information item IDs; the outputs; the human oversight, naming who decides and what the AI may not do; the failure modes and their effects; and a note on data quality. Every AI capability in the information view gets one.' },
        { kind: 'figure', slide: 'w4s2-ai' },
        { kind: 'table', header: ['Card field', ...AI_CAPABILITIES.map((a) => `${a.id} ${a.name}`)], rows: [['Hosted on', ...AI_CAPABILITIES.map((a) => `${a.host} ${physical(a.host).name}`)], ['Supports', ...AI_CAPABILITIES.map((a) => a.supports)], ['Inputs', ...AI_CAPABILITIES.map((a) => a.inputs.join(', '))], ['Outputs', ...AI_CAPABILITIES.map((a) => a.outputs)], ['Human oversight', ...AI_CAPABILITIES.map((a) => a.oversight)], ['Failure modes', ...AI_CAPABILITIES.map((a) => a.failure)], ['Data quality', ...AI_CAPABILITIES.map((a) => a.dataQuality)], ['Risk it mitigates', ...AI_CAPABILITIES.map((a) => a.risk)]], caption: 'AeroLink’s two AI capability cards (FICTIONAL).' },
        { kind: 'figure', slide: 'w4s2-worked-ai' },
      ],
    },
    {
      id: 'w4-lesson-aerolink-info',
      title: 'The AeroLink information view, worked',
      sources: [R('R21', '512'), R('R66', '113'), R('R62', '345')],
      blocks: [
        { kind: 'para', text: `AeroLink’s information view has ${C.information} items. Each states its data and the information made from them (R21 p.512), its producers and consumers, the decision it supports, its timeliness and its sensitivity. Timeliness matters: the weather item ${i4.timeliness}, an instance of MITRE’s point that some data lose value quickly once the event passes, for which its own example is weather data (R66 p.113).` },
        { kind: 'table', header: ['Item', 'Data → information', 'Producer → consumer', 'Decision supported'], rows: INFORMATION.map((x) => [`${x.id} ${x.name}`, `${x.data} → ${x.information}`, `${x.producers.join(', ')} → ${x.consumers.join(', ')}`, `${x.decision} (${x.decisionRefs.join(', ')})`]), caption: `The AeroLink information view (FICTIONAL; ${corrected.join(' and ')} corrected; ${proposed.join(', ')} new; all proposed for the instructor to confirm).` },
        { kind: 'figure', slide: 'w4s2-worked-info' },
        { kind: 'para', text: `Is anything missing? Every function input in the case states where it comes from, so the flows between elements can be listed from the functions alone, without looking at the items. There are ${C.crossFlows} of them, and each travels in an item; the first run of this flow check found ${numberWord(added.length)} with none, now added: ${added.map((x) => x.name.toLowerCase()).join('; ')}. Flows inside one element, such as the chargers’ power set-points, and exchanges with passengers at the boundary are not flows between elements. Then the routes, checked against the interfaces the reference already has: of ${C.routes} producer–consumer pairs between different elements, ${C.routesCovered} cross an information interface or a recorded relay; the charge-session records, for example, reach the predictive-maintenance capability through the operations center. One route, ${gap.info} from ${gap.from} to ${gap.to}, has no interface at all.` },
        { kind: 'heading', text: 'The driving question, answered' },
        { kind: 'para', text: `The release decision is the function ${fn(DA.decision).name}, performed by ${DA.performedBy} at the ${physical(DA.decidedAt).name.toLowerCase()}. ${Cap(numberWord(crossing.length))} of its inputs cross an information interface: ${crossText}. ${Cap(numberWord(inside.length))} are made inside the operations center: ${insideText}. Keep the three apart: the weather data cross the interface, the hold is a decision made from them, and the duty manager is the one who makes it. The release goes back to the aircraft as ${DA.output.info} over ${DA.output.via}. ${DA.history} Every element worked; what passed between two of them had nothing to travel on. Tracing the information view against the physical view, MITRE’s “know the relationships” (R62 p.345), is how such gaps are found.` },
        { kind: 'figure', slide: 'w4s2-answer' },
        { kind: 'heading', text: 'Auditing the view' },
        { kind: 'para', text: FINDINGS.slice(0, 3).map((f) => `**${f.id}** (${f.where}). ${f.finding} Proposed: ${f.proposed}`).join(' ') },
        { kind: 'figure', slide: 'w4s2-audit' },
      ],
    },
    {
      id: 'w4-lesson-evaluation',
      title: 'Evaluating the architecture',
      sources: [R('R20b', '592'), R('R20c', '599'), R('R56', '386'), R('R56', '387'), R('R44', '115')],
      blocks: [
        { kind: 'para', text: 'SEBoK selects a logical architecture by assessing candidates against criteria related to the system requirements (R20b p.592) and evaluates a physical architecture to balance design properties, costs and risks, noting that non-functional requirements shape it more than functions do (R20c p.599). MITRE’s test is traceability: the design should point to the capabilities that meet each system requirement, recorded in a two-way traceability matrix (R56 pp.386–387). TPMs, the DoD guidebook adds, may be allocated or decomposed to subsystem assemblies (R44 p.115).' },
        { kind: 'table', header: ['Item', 'Allocated to', 'Evidence', 'Verdict'], rows: EVALUATION.map((r) => [`${r.id} ${r.item}`, r.allocated, r.evidence, r.verdict]), caption: 'AeroLink’s architecture evaluated against requirements, TPMs and risks; every number computed (FICTIONAL).' },
        { kind: 'para', text: `Two rows teach most. ${tpm('TPM-003').name} tracks a planning requirement, so it is allocated to the planning function, yet its value depends on the battery in the aircraft: the TPM must be watched in two elements. And ${numberWord(opens.length)} rows are open, each with the week that closes it; ${ev('REQ-SYS-008').id} is one of them because an interface shows a path, not a time. An evaluation with no open rows has usually not looked hard enough.` },
        { kind: 'figure', slide: 'w4s2-evaluation-matrix' },
      ],
    },
    {
      id: 'w4-lesson-forward',
      title: 'Consistency, what this week feeds, and its limits',
      sources: [R('R62', '344'), R('R62', '345'), R('R20b', '594'), R('R20c', '602'), R('R72', '30'), R('R85', '181'), R('R20a', '581')],
      blocks: [
        { kind: 'para', text: `Four consistency checks keep the views one description (a course convention on MITRE’s “know the relationships”, R62 p.345): ${CONSISTENCY_CHECKS.join('; ')}. The errors reviewers see most are physical names in the functional view; functions without inputs and outputs, or decomposed too deep (R20b p.594); allocation without a criterion, or with no logical plane (R20c p.602); information items with no decision; agreements drawn as data carriers; AI capabilities without oversight; and views made for their own sake, against purpose is paramount (R62 p.344).` },
        { kind: 'figure', slide: 'w4s2-consistency' },
        { kind: 'para', text: `${FEEDS_FORWARD.map((f) => `${f.artifact}: ${f.week}, ${f.how}`).join('. ')}. In SysML v2 an action definition defines an action whose directed features are its parameters (R72 p.30), which is what each function with its inputs and outputs becomes; a viewpoint is a kind of requirement that frames stakeholder concerns, addressed by a view (R85 p.181).` },
        { kind: 'para', text: 'The limits of a Week 4 description: it has no interface definitions, no sequences or timing, and no modes, which SEBoK lists among the contents of a functional view (R20a p.581); its allocation reasons are judgments checked in review; and the standard behind its vocabulary is outside the course collection. Each limit has a week that addresses it.' },
        { kind: 'figure', slide: 'w4s2-feeds-forward' },
      ],
    },
    {
      id: 'w4-lesson-apply',
      title: 'Applying the method to your own enterprise',
      sources: [R('R62', '344'), R('R20b', '594'), R('R20c', '598'), R('R21', '512'), R('R31', '1370')],
      blocks: [
        { kind: 'para', text: 'Your team does not model AeroLink; it repeats the method on its own enterprise, starting from the Week 3 record. A practical order, matching the lab tool:' },
        {
          kind: 'steps',
          items: [
            { label: 'Views', text: 'Write one purpose question per required view, with the stakeholders and concerns it serves and its form; check that every concern in your register has a view (R62 p.344).' },
            { label: 'Functions', text: 'Walk each Week 2 scenario step by step; name each function verb and object, with inputs and outputs; trace each to a capability; group them under three to seven first-level functions (R20b p.594).' },
            { label: 'Allocation', text: 'Define logical elements, then physical ones in your Week 3 configuration; allocate every function to both with a criterion and a sentence (R20c p.598); allocate every system requirement.' },
            { label: 'Decision', text: 'Record one architecture decision with three alternatives, the rationale and the needs and risks it touches.' },
            { label: 'Information', text: 'For each item state the data and the information (R21 p.512), producer, consumer, decision and route; write an AI capability card with its oversight (R31 p.1370).' },
            { label: 'Check', text: 'Run the four consistency checks in the tool, read every advisory, and list what is still open for Week 5.' },
          ],
        },
        { kind: 'para', text: 'Three questions before you submit. Could a reviewer tell, from each view’s purpose alone, which stakeholder it serves? Could a teammate reallocate any function and know which reason they are overturning? Does every information item name a decision someone actually makes? If not, the method has been followed in form but not in substance.' },
      ],
    },
  ],
}

function Cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
