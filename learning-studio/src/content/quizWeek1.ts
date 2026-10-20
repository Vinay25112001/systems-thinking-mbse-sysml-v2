// Week 1 readiness quiz Q1 (formative), rebuilt 2026-10-18 for Team Formation / Needs / Identifying Stakeholders and
// re-pointed to the lecture for the sign-off review (2026-10-19, Mo2 and M1). Every item is answerable from the Week 1
// lectures and the detailed lesson: `lecture` names the slide that teaches it and the lesson section that explains it,
// and the item cites a page in the Week 1 register (course.ts readings and extension) or, where it tests a course
// convention, says so (`courseSource`, rebuild review F09). Keys are authored across a–d (2–3 each), and the key's
// length rank among the four options (1 = longest … 4 = shortest) varies: each rank occurs two or three times across
// the ten items, so no "pick the n-th longest" rule scores above 30 % (src/content/learn/week01.test.ts asserts it).
// w1q-10 uses the need form the lecture recommends (S2-09): "The [stakeholders] need the [system] to …". Faculty final
// review (A21): no option is marked wrong for its sentence pattern alone; each distractor has a real defect.
// New items, pending independent review.
import type { QuizQuestion } from './schema'

export type { QuizOption, QuizQuestion } from './schema'

const PENDING = 'new-pending-review' as const

export const WEEK1_QUIZ: QuizQuestion[] = [
  {
    id: 'w1q-1', bloom: 'Understand', objective: 'B1.1', review: PENDING,
    prompt: 'In this course’s team charter, each member owns some ID prefixes (for example STK and NEED). What is that ownership for?',
    options: [
      { id: 'a', text: 'It makes one member answer for those elements: unique IDs and consistency', correct: true, explanation: 'Correct. Owned prefixes are a course convention (Session 1, slide 16): the owner answers for the elements of that kind, their unique IDs, their consistency with the rest of the record, and questions about them at reviews.' },
      { id: 'b', text: 'It reserves those kinds of element so that no other member may add to them, even in reviews', correct: false, explanation: 'Ownership is accountability, not exclusion: everyone still contributes (each member writes at least two needs), and the owner keeps the elements complete and consistent.' },
      { id: 'c', text: 'It sets the order in which the team submits its deliverables', correct: false, explanation: 'Prefixes name kinds of element (ENT, PRT, EXT, STK, CON, NEED, REL); they say nothing about submission order.' },
      { id: 'd', text: 'It lets each member renumber IDs after a deletion', correct: false, explanation: 'The opposite: IDs in the course scheme are stable and never reused, because Week 2 and the Week 8 model refer to them.' },
    ],
    courseSource: 'Session 1, slide 16 “The charter: norms, decision rules and how teams develop”, and the lesson section “Systems engineering teams”: owned ID prefixes are a course convention; no reading is cited for them',
    lecture: { week: 1, session: 1, slide: 's1-team-charter', section: 's1-lesson-teams' },
  },
  {
    // review F17: a transfer item (choosing a system of interest for a question in a new domain) replaces the citation-trivia item
    id: 'w1q-2', bloom: 'Apply', objective: 'B1.2', review: PENDING,
    prompt: 'A hospital team asks: “Why do patients wait more than four hours in the emergency department at night?” Which system of interest can answer that question?',
    options: [
      { id: 'a', text: 'One triage nurse’s workstation and the patient-tracking screen it shows', correct: false, explanation: 'Too small: the waits arise from arrivals, triage, beds and staffing together, and most of that lies outside one workstation, so this boundary cannot answer the question.' },
      { id: 'b', text: 'The whole department: arrivals, triage, beds and the staff on shift', correct: true, explanation: 'Correct. Like the AeroLink boundary that includes passenger demand (Session 1, slide 8; lesson “Boundary, environment and context”), it is large enough to contain what drives the waiting (arrivals, triage, beds, the staff on shift) and small enough to analyze.' },
      { id: 'c', text: 'The national health system, with every hospital, insurer and agency in it', correct: false, explanation: 'Too large: no team could analyze it in a term, and most of it has no causal path to one department’s night-time waits.' },
      { id: 'd', text: 'The hospital’s parking garage and the ambulance bays at its entrance', correct: false, explanation: 'These sit at the edge of the question: they shape how patients arrive, not why they wait inside the department, so they belong in the context at most.' },
    ],
    cite: { reading: 'R02', pages: '264' },
    lecture: { week: 1, session: 1, slide: 's1-three-scopes', section: 's1-lesson-boundary' },
  },
  {
    id: 'w1q-3', bloom: 'Understand', objective: 'B1.2', review: PENDING,
    prompt: 'SEBoK’s glossary gives two definitions of system-of-interest. Which one is the common systems engineering definition?',
    options: [
      { id: 'a', text: 'Whatever system an observer finds of interest', correct: false, explanation: 'That is the systems-science definition (“the system of interest to an observer”), which applies whether or not the system has a purpose or a life cycle.' },
      { id: 'b', text: 'The largest system that contains the problem', correct: false, explanation: 'Neither definition says the largest system; a system of interest is chosen for a question.' },
      { id: 'c', text: 'The system whose life cycle is under consideration', correct: true, explanation: 'Correct. ISO/IEC/IEEE 15288:2015: “the system whose life cycle is under consideration” (Session 1, slide 6; lesson “System of interest, enabling systems and the enterprise”).' },
      { id: 'd', text: 'The system that the paying customer bought', correct: false, explanation: 'Buying is in neither definition; the customer is one stakeholder among many.' },
    ],
    cite: { reading: 'R39b', pages: '1652' },
    lecture: { week: 1, session: 1, slide: 's1-soi-enabling', section: 's1-lesson-soi' },
  },
  {
    id: 'w1q-4', bloom: 'Apply', objective: 'B1.3', review: PENDING,
    prompt: 'A team’s system of interest is a city bike-share service: the bikes, the docking stations, the operations office and its rebalancing crews. Which item belongs in the context, as an external system, rather than inside the boundary?',
    options: [
      { id: 'a', text: 'The docking stations where riders take and return bikes', correct: false, explanation: 'The docks are part of the service the team designs and runs, so they are inside the boundary.' },
      { id: 'b', text: 'The rebalancing crews who move bikes between the docks', correct: false, explanation: 'The crews are part of the service’s operation, so they are inside the boundary.' },
      { id: 'c', text: 'The operations office that schedules the crews', correct: false, explanation: 'The office is one of the elements listed inside the system of interest.' },
      { id: 'd', text: 'The city’s rail network that many riders transfer to', correct: true, explanation: 'Correct. The rail network influences the service and exchanges riders with it, but the team does not design or control it, just as AeroLink depends on but does not control the electric grid (Session 1, slide 9): it is an external system in the context.' },
    ],
    cite: { reading: 'R02', pages: '264' },
    lecture: { week: 1, session: 1, slide: 's1-context-structure', section: 's1-lesson-boundary' },
  },
  {
    id: 'w1q-5', bloom: 'Evaluate', objective: 'B1.3', review: PENDING,
    prompt: 'Four teams propose enterprises for the 14-week project. Which proposal best meets the course’s criteria?',
    options: [
      { id: 'a', text: 'One standard steel bolt used in a pedestrian bridge', correct: false, explanation: 'A single part has no enterprise around it: few interacting elements, no people, almost no stakeholders.' },
      { id: 'b', text: 'AeroLink’s vertiport network, with all its numbers changed', correct: false, explanation: 'AeroLink, or a near copy of it, is not available to teams; each team develops its own enterprise.' },
      { id: 'c', text: 'A regional food bank’s collection, warehousing and delivery network', correct: true, explanation: 'Correct. It has several interacting parts, people as well as technology, exchanges across its boundary (donors, agencies, transport) and stakeholders whose needs differ: enough substance to be modeled in Phase II.' },
      { id: 'd', text: 'The whole of the world’s economy, across every sector', correct: false, explanation: 'Too large: no system of interest can be stated with a boundary a team could analyze in a term.' },
    ],
    courseSource: 'Session 1, slide 3 “One enterprise, two representations; AeroLink is the worked case”, and the lesson section “Why Week 1 matters”: the course criteria for a team enterprise',
    lecture: { week: 1, session: 1, slide: 's1-course-architecture', section: 's1-lesson-why' },
  },
  {
    id: 'w1q-6', bloom: 'Understand', objective: 'B1.4', review: PENDING,
    prompt: 'A team writes that its customer is “the only party who can approve the system for use”. What does SEBoK warn about this assumption?',
    options: [
      { id: 'a', text: 'Other parties, inside and outside the organization, may also approve it', correct: true, explanation: 'Correct. Approving authorities formally sign the system off for use; it cannot be assumed that the customer is the only one, and there can be approving authorities both inside and outside the organization, especially for highly regulated systems (Session 1, slide 21).' },
      { id: 'b', text: 'Approval comes only at the end of the project, so it need not appear in the stakeholder register at all', correct: false, explanation: 'SEBoK calls determining the approving authorities “a key part of stakeholder identification”, from the beginning.' },
      { id: 'c', text: 'The customer approves, but the end users must also vote on that approval', correct: false, explanation: 'SEBoK describes formal certification, qualification and approval, not a vote of users.' },
      { id: 'd', text: 'Nobody approves an engineered system for use; it is simply verified by the team', correct: false, explanation: 'Verification is not approval for use; approving authorities are stakeholders in their own right.' },
    ],
    cite: { reading: 'R11', pages: '553' },
    lecture: { week: 1, session: 1, slide: 's1-approving-authorities', section: 's1-lesson-stakeholders' },
  },
  {
    id: 'w1q-7', bloom: 'Apply', objective: 'B1.4', review: PENDING,
    prompt: 'A team builds its stakeholder list by asking only “who uses the system day to day?”. Using SEBoK’s life-cycle view of stakeholders, which group is that question most likely to miss?',
    options: [
      { id: 'a', text: 'The normal users who rely on the service every single day', correct: false, explanation: 'Day-to-day users are exactly what the question finds (the operation stage).' },
      { id: 'b', text: 'The operators who run the service on each shift', correct: false, explanation: 'Operators are operation-stage stakeholders, found by the same question.' },
      { id: 'c', text: 'Unexpected users who use the service in other ways', correct: false, explanation: 'SEBoK lists unexpected users in the operation stage too; a usage question can still reach them.' },
      { id: 'd', text: 'Waste management and regulators involved in disposal', correct: true, explanation: 'Correct. Disposal-stage stakeholders (operators, waste management, regulators, the public) never use the system day to day, so a usage question misses them; the life-cycle sweep, walking every stage of SEBoK’s Table 1, finds them (Session 1, slide 19).' },
    ],
    cite: { reading: 'R11', pages: '552' },
    lecture: { week: 1, session: 1, slide: 's1-lifecycle-sweep', section: 's1-lesson-stakeholders' },
  },
  {
    id: 'w1q-8', bloom: 'Apply', objective: 'B1.4', review: PENDING,
    prompt: 'At the start of a stakeholder assessment the sponsor hands the team a list of names and organizations. What does MITRE advise the team to do with it?',
    options: [
      { id: 'a', text: 'Accept the list as complete, since the sponsor decides who counts', correct: false, explanation: 'MITRE treats the sponsor’s list as a starting point, not the final list.' },
      { id: 'b', text: 'Ask interviewees for more names, and seek skeptics and rivals', correct: true, explanation: 'Correct. Start from the sponsor’s list, ask interviewees for further names and organizations, and seek out supporters, skeptics and rivals of the initiative: what the course calls snowballing (Session 1, slide 20).' },
      { id: 'c', text: 'Remove any likely critics, so that the work keeps to its agreed scope', correct: false, explanation: 'The opposite: MITRE asks the team to seek out skeptics and rivals.' },
      { id: 'd', text: 'Survey the people on the list once, and close it after that', correct: false, explanation: 'A single survey of the given names cannot find the stakeholders the list left out.' },
    ],
    cite: { reading: 'R63', pages: '235' },
    lecture: { week: 1, session: 1, slide: 's1-context-and-roles', section: 's1-lesson-stakeholders' },
  },
  {
    id: 'w1q-9', bloom: 'Understand', objective: 'B1.5', review: PENDING,
    prompt: 'During elicitation a stakeholder says, “We need a mobile app.” According to SEBoK, what does asking for the rationale behind a request often do?',
    options: [
      { id: 'a', text: 'It can uncover the real need behind a request phrased as an implementation', correct: true, explanation: 'Correct. SEBoK notes that providing rationale often reveals the real need, especially when the stakeholder has expressed it as an implementation (Session 2, slide 12).' },
      { id: 'b', text: 'It turns the request into a requirement, ready to be written with “shall”', correct: false, explanation: 'Rationale is recorded with the need; requirements come later, from the developer’s perspective (Week 2).' },
      { id: 'c', text: 'It shows the request can be dropped, since needs never name products', correct: false, explanation: 'The request is not simply dropped: the real need behind it is found and kept, and the product survives as one option for later trade studies.' },
      { id: 'd', text: 'It ranks stakeholders by how persuasive their stated reasons are', correct: false, explanation: 'Rationale explains a need; it is not a way of ranking stakeholders.' },
    ],
    cite: { reading: 'R11', pages: '553' },
    lecture: { week: 1, session: 2, slide: 's2-real-need', section: 's2-l-elicitation' },
  },
  {
    id: 'w1q-10', bloom: 'Apply', objective: 'B1.5', review: PENDING,
    prompt: 'A hospital team’s system of interest is the ward’s medication service. It drafts: “Night-shift nurses need medication records for each patient.” Which revision is a well-formed need: stated from the nurses’ perspective, with the condition under which the need holds, and naming no solution?',
    options: [
      { id: 'a', text: 'Night-shift nurses need the medication service to provide a tablet app at each bedside that displays each patient’s full medication record', correct: false, explanation: 'Stated as a need, but it names a solution, a tablet app, and that is the flaw. “At each bedside” only says where the app would go; it does not say when or under what conditions the nurses’ need holds.' },
      { id: 'b', text: 'The medication service shall show each patient’s medication record to night-shift nurses', correct: false, explanation: '“Shall” with the system as the subject makes this a requirement, the developer’s view, not a need: the defect is what it says, not its word order.' },
      { id: 'c', text: 'Night-shift nurses need the medication service to show each patient’s current medication record whenever they prepare a dose', correct: true, explanation: 'Correct. Stated from the nurses’ perspective, here in the recommended form “The [stakeholders] need the [system] to …” (Session 2, slide 9): free of any solution, and it states when the need holds, whenever a dose is prepared.' },
      { id: 'd', text: 'Night-shift nurses need the medication service to show medication records as quickly as possible', correct: false, explanation: 'Stated as a need, but “as quickly as possible” is a vague quality, not a condition: it says nothing about when or where the need holds.' },
    ],
    cite: { reading: 'R11', pages: '554–555' },
    lecture: { week: 1, session: 2, slide: 's2-well-formed', section: 's2-l-well-formed' },
  },
]
