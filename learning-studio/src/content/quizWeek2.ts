// Week 2 readiness quiz Q2 (individual, formative), kept separate from the lecture (DECISION_LOG A20). Every item is
// answerable from the Week 2 lectures and the detailed lesson: `lecture` names the slide that teaches it and the lesson
// section that explains it, and the item cites the register page its key rests on. Contexts are unseen and never AeroLink
// (outline §6.1). Keys are authored across a–d, three each, and the key's length rank among the four options
// (1 = longest … 4 = shortest) varies so that each rank occurs exactly three times with no run of three, so no
// "pick the n-th longest" rule scores above 25 % (quizWeek2.test.ts asserts it). New items, pending independent review.
import type { QuizQuestion } from './schema'

const PENDING = 'new-pending-review' as const

export const WEEK2_QUIZ: QuizQuestion[] = [
  {
    id: 'w2q-1', bloom: 'Understand', objective: 'W2.1', review: PENDING,
    prompt: 'A team tailors a ConOps template to keep it short. According to MITRE, which part must it keep as a critical component?',
    options: [
      { id: 'a', text: 'A description of the existing system the users want to replace', correct: true, explanation: 'Correct. MITRE lists four critical components from IEEE Std 1362-1998: the existing system, the justification with its restrictions, the proposed system, and scenarios of use in the user’s environment (Session 1, slide 7).' },
      { id: 'b', text: 'A ranked list of candidate technologies with their costs and risks', correct: false, explanation: 'A ConOps deliberately avoids the technical solution; choosing technology comes after the trade study.' },
      { id: 'c', text: 'The verification method chosen for each system requirement', correct: false, explanation: 'Verification methods belong to the requirement records, not to the ConOps components MITRE names.' },
      { id: 'd', text: 'The organization chart of the development contractor', correct: false, explanation: 'The ConOps describes the user organization and its operations, not the developer’s structure.' },
    ],
    cite: { reading: 'R52', pages: '301' },
    lecture: { week: 2, session: 1, slide: 'w2s1-conops-contents', section: 'w2s1-l-conops-content' },
  },
  {
    id: 'w2q-2', bloom: 'Analyse', objective: 'W2.1', review: PENDING,
    prompt: 'A water utility team writes a scenario whose system of interest is its SCADA control system. The scenario’s actor list includes “the SCADA server”. What is wrong?',
    options: [
      { id: 'a', text: 'Nothing: every element that performs a step should be listed as an actor', correct: false, explanation: 'Elements of the system of interest perform steps, but they are not actors; actors interact with the system from outside.' },
      { id: 'b', text: 'The server is part of the system of interest, and actors are parties outside the system', correct: true, explanation: 'Correct. MITRE: actors are parties outside the system that interact with it (Session 1, slide 10). Stating the scenario system of interest is what exposes the error.' },
      { id: 'c', text: 'Only people can be actors, so no server can ever appear as one', correct: false, explanation: 'MITRE allows other systems as actors; an external server could be one. This server is wrong because it is inside the boundary.' },
      { id: 'd', text: 'The server should be marked as an environmental factor', correct: false, explanation: 'Environmental factors, such as weather, are outside the system and have no goal; the server is inside the system.' },
    ],
    cite: { reading: 'R59', pages: '453' },
    lecture: { week: 2, session: 1, slide: 'w2s1-use-cases', section: 'w2s1-l-scenarios' },
  },
  {
    id: 'w2q-3', bloom: 'Apply', objective: 'W2.1', review: PENDING,
    prompt: 'A team of four models a hospital’s patient-transfer service. Which scenario set meets the course minimum for scenario kinds?',
    options: [
      { id: 'a', text: 'A routine transfer, an urgent transfer and a night-time transfer on weekends', correct: false, explanation: 'All three are variations of normal use; there is no disruption and no support activity.' },
      { id: 'b', text: 'Stretcher cleaning, porter training and an equipment audit', correct: false, explanation: 'Three support activities and no nominal transfer at all.' },
      { id: 'c', text: 'A routine transfer, a lift failure mid-transfer and stretcher cleaning', correct: true, explanation: 'Correct. One nominal, one off-nominal (a failure) and one support scenario, as the course minimum requires (Session 1, slide 12).' },
      { id: 'd', text: 'A routine transfer, a lift failure mid-transfer and a porter calling in sick', correct: false, explanation: 'Nominal and off-nominal are covered, but there is no support scenario such as cleaning, maintenance or training.' },
    ],
    courseSource: 'Session 1, slide 12 “Which scenarios? Coverage and the off-nominal case”: the minimum of one nominal, one off-nominal and one support scenario is a course convention built on SEBoK’s call for off-nominal use cases',
    cite: { reading: 'R11', pages: '553' },
    lecture: { week: 2, session: 1, slide: 'w2s1-scenario-coverage', section: 'w2s1-l-scenario-coverage' },
  },
  {
    id: 'w2q-4', bloom: 'Understand', objective: 'W2.6', review: PENDING,
    prompt: 'A public library installs self-checkout kiosks with a built-in tag reader. In SEBoK’s terms, which of these is the capability?',
    options: [
      { id: 'a', text: 'Shorter queues at the front desk at busy times', correct: false, explanation: 'That is the benefit the capability contributes to.' },
      { id: 'b', text: 'The tag reader built into each kiosk', correct: false, explanation: 'That is a feature of the kiosk.' },
      { id: 'c', text: 'The kiosk’s touch-screen menu software', correct: false, explanation: 'Also a feature: one way of providing the capability.' },
      { id: 'd', text: 'Lending items without staff help', correct: true, explanation: 'Correct. SEBoK’s illustration: the scanner is the feature, storing passwords the capability, saving time the benefit (Session 1, slide 17). Here, lending without staff is the outcome the features achieve.' },
    ],
    cite: { reading: 'R39p', pages: '1458' },
    lecture: { week: 2, session: 1, slide: 'w2s1-capability-def', section: 'w2s1-l-capabilities' },
  },
  {
    id: 'w2q-5', bloom: 'Analyse', objective: 'W2.2', review: PENDING,
    prompt: 'A campus team turns “Riders need the shuttle service to get them to class on time” into “The shuttle service shall get riders to class on time.” Which principle from the lecture does this violate?',
    options: [
      { id: 'a', text: 'Requirements must use “will” rather than “shall”', correct: false, explanation: 'The reverse: “shall” is the binding word; “will” declares purpose.' },
      { id: 'b', text: 'A requirement comes from analyzing what the system must do, not from changing the subject of the need', correct: true, explanation: 'Correct. SEBoK: generating a requirement is more than changing the subject of the need statement; it is an analysis of what the system must do (Session 1, slide 4). Here nothing was analyzed and nothing can be verified.' },
      { id: 'c', text: 'Needs must be written by the developer, not the stakeholder', correct: false, explanation: 'Needs express the stakeholders’ expectations; engineers help write them, but the view is the stakeholder’s.' },
      { id: 'd', text: 'Every stakeholder requirement must name a hardware element', correct: false, explanation: 'A stakeholder requirement names the whole service; system requirements name an element or function, which need not be hardware.' },
    ],
    cite: { reading: 'R13', pages: '558' },
    lecture: { week: 2, session: 1, slide: 'w2s1-retrieval', section: 'w2s1-l-process' },
  },
  {
    id: 'w2q-6', bloom: 'Apply', objective: 'W2.3', review: PENDING,
    prompt: 'What is the main defect in “The app shall minimize response time”?',
    options: [
      { id: 'a', text: 'It has no subject before “shall”', correct: false, explanation: '“The app” is the subject, though naming an app may also be design-laden.' },
      { id: 'b', text: 'It uses “shall” for a nonbinding provision', correct: false, explanation: '“Shall” is the right binding word; the problem is what follows it.' },
      { id: 'c', text: '“Minimize” sets no threshold, so no one can say when the design is done', correct: true, explanation: 'Correct. MITRE: avoid “maximize” and “minimize”; they force an engineer to judge when the design is good enough (Session 2, slide 7). A bounded value with a start event fixes it.' },
      { id: 'd', text: 'Response time can only be verified by inspection, which gives too little assurance', correct: false, explanation: 'A response time would be tested; the method is not the defect.' },
    ],
    cite: { reading: 'R55', pages: '370' },
    lecture: { week: 2, session: 2, slide: 'w2s2-negatives-tbd', section: 'w2s2-l-wording' },
  },
  {
    id: 'w2q-7', bloom: 'Apply', objective: 'W2.3', review: PENDING,
    prompt: 'Which of these system requirements for a transit ticketing function is design-laden?',
    options: [
      { id: 'a', text: 'The ticketing function shall issue a receipt within 5 s of each completed payment', correct: false, explanation: 'A bounded performance requirement on a function: it says what, not how.' },
      { id: 'b', text: 'The ticketing function shall accept all fare-policy payment methods', correct: false, explanation: 'This states what the function must accept and leaves the means to the designers, the white space MITRE asks for (R55 p.367).' },
      { id: 'c', text: 'The ticketing function shall record every completed sale for the annual audit trail', correct: false, explanation: 'A functional requirement with no implementation in it.' },
      { id: 'd', text: 'The ticketing function shall store fares in a two-replica cloud database', correct: true, explanation: 'Correct. It names how (the database type and replication), removing the white space MITRE asks to leave for designers (Session 2, slide 6).' },
    ],
    cite: { reading: 'R55', pages: '367' },
    lecture: { week: 2, session: 2, slide: 'w2s2-level', section: 'w2s2-l-categories-level' },
  },
  {
    id: 'w2q-8', bloom: 'Understand', objective: 'W2.3', review: PENDING,
    prompt: 'A building requirement says each floor shall have a labeled emergency exit. Which verification method fits it best?',
    options: [
      { id: 'a', text: 'Inspection', correct: true, explanation: 'Correct. Looking at the building confirms it: the DoD’s examination, visual inspection of equipment and product marking (Session 2, slide 8).' },
      { id: 'b', text: 'Analysis with a computer model of the building', correct: false, explanation: 'Analysis interprets behavior or performance; a label’s presence is simply seen.' },
      { id: 'c', text: 'Demonstration of an evacuation drill on every floor', correct: false, explanation: 'A drill demonstrates an operation, more than the requirement asks; the requirement is about a physical feature.' },
      { id: 'd', text: 'Test under controlled, instrumented conditions', correct: false, explanation: 'Test produces quantitative data; nothing here needs measuring.' },
    ],
    cite: { reading: 'R49', pages: '149' },
    lecture: { week: 2, session: 2, slide: 'w2s2-verification-method', section: 'w2s2-l-verification' },
  },
  {
    id: 'w2q-9', bloom: 'Analyse', objective: 'W2.4', review: PENDING,
    prompt: 'A library’s trace table reads: need A → R1; need B has no child; need C → R2; R1 → D1; R2 → D2; D3 has no parent. Which pair names the orphan and the childless parent?',
    options: [
      { id: 'a', text: 'Orphan need B and the childless parent D3', correct: false, explanation: 'Reversed: an orphan is a lower-level requirement with no source, and a childless parent is a higher-level item with nothing beneath it.' },
      { id: 'b', text: 'Orphan R2; childless need C', correct: false, explanation: 'R2 has a parent (need C) and need C has a child (R2).' },
      { id: 'c', text: 'Orphan D1; childless R1', correct: false, explanation: 'D1 traces to R1, and R1 has D1 beneath it.' },
      { id: 'd', text: 'Orphan D3; childless parent need B', correct: true, explanation: 'Correct. D3 traces to no source (an orphan) and need B is addressed by nothing beneath it (a childless parent), the two defects bidirectional traceability is meant to prevent (Session 2, slide 12).' },
    ],
    cite: { reading: 'R45', pages: '118' },
    lecture: { week: 2, session: 2, slide: 'w2s2-traceability', section: 'w2s2-l-traceability' },
  },
  {
    id: 'w2q-10', bloom: 'Apply', objective: 'W2.3', review: PENDING,
    prompt: 'A campus-shuttle draft reads “The shuttle shall arrive in 10 minutes.” Which rewrite fixes its single-point value and its missing start event without adding a new defect?',
    options: [
      { id: 'a', text: 'The shuttle should arrive quickly after a rider requests a pickup', correct: false, explanation: '“Should” is not binding and “quickly” is vague: two new defects.' },
      { id: 'b', text: 'The shuttle shall arrive within 10 min of a ride request for at least 95 % of requests in each term', correct: true, explanation: 'Correct. A bound (“within”), a start event (the request) and a measurable criterion; compare the critique of the single-point draft in Session 2, slide 11.' },
      { id: 'c', text: 'The shuttle shall arrive in exactly 10 min, every time', correct: false, explanation: 'Still a single point, and still no start event.' },
      { id: 'd', text: 'The shuttle shall minimize each rider’s wait after a request', correct: false, explanation: '“Minimize” gives no threshold anyone could test.' },
    ],
    cite: { reading: 'R55', pages: '370' },
    lecture: { week: 2, session: 2, slide: 'w2s2-worked-critique', section: 'w2s2-l-case-critique' },
  },
  {
    id: 'w2q-11', bloom: 'Apply', objective: 'W2.5', review: PENDING,
    prompt: 'A food bank’s objective is that every registered family receives a full weekly parcel. Which pair correctly gives an MOE and an MOP?',
    options: [
      { id: 'a', text: 'MOE: share of registered families who received a full parcel that week; MOP: minutes to pack one parcel', correct: true, explanation: 'Correct. The MOE is mission success from the users’ viewpoint; the MOP is a characteristic of the system’s operation measured under stated conditions (Session 2, slide 15).' },
      { id: 'b', text: 'MOE: minutes to pack one parcel at the warehouse; MOP: share of registered families who received a full parcel', correct: false, explanation: 'Swapped: packing time is a system characteristic, and families served is the mission outcome.' },
      { id: 'c', text: 'MOE and MOP: both the number of volunteers on shift each week, because staffing drives every other result', correct: false, explanation: 'Staffing is an input, not a measure of mission success or of system performance.' },
      { id: 'd', text: 'MOE: the warehouse temperature; MOP: donor satisfaction', correct: false, explanation: 'Neither measures whether families received their food, and donors are not the users here.' },
    ],
    cite: { reading: 'R54', pages: '330–331' },
    lecture: { week: 2, session: 2, slide: 'w2s2-moe-mop', section: 'w2s2-l-measures' },
  },
  {
    id: 'w2q-12', bloom: 'Evaluate', objective: 'W2.7', review: PENDING,
    prompt: 'A team’s requirement carries “TBD” for its key value, with no owner recorded. Four teammates propose what to do. Which proposal is best, judged by the lecture’s TBX rules?',
    options: [
      { id: 'a', text: 'Nothing is at risk: a TBD simply marks the requirement as a draft until someone revisits it', correct: false, explanation: 'SEBoK says unresolved TBXs can lead to risk; leaving one unowned is exactly the problem.' },
      { id: 'b', text: 'Replace the TBD with the team’s best guess, so the requirement is testable today', correct: false, explanation: 'A guess presented as a value hides the uncertainty; a known value with low confidence is marked TBR instead.' },
      { id: 'c', text: 'It can turn into risk; give it an owner and a plan to resolve it', correct: true, explanation: 'Correct. TBX management means identifying each TBX, the work needed to close it and its owner (Session 2, slide 7).' },
      { id: 'd', text: 'Delete the requirement until the value is finally known and agreed', correct: false, explanation: 'That loses the obligation; the requirement stays, with a tracked TBD.' },
    ],
    cite: { reading: 'R13', pages: '565' },
    lecture: { week: 2, session: 2, slide: 'w2s2-negatives-tbd', section: 'w2s2-l-wording' },
  },
]
