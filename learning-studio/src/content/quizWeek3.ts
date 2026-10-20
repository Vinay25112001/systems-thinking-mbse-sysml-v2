// Week 3 readiness quiz Q3 (individual, formative), kept separate from the lecture (DECISION_LOG A20). Every item is
// answerable from the Week 3 lectures and the detailed lesson: `lecture` names the slide that teaches it and the lesson
// section that explains it, and the item cites the register page its key rests on. Contexts are unseen and never AeroLink
// (outline §6.1). Keys are authored across a–d, three each, and the key's length rank among the four options
// (1 = longest … 4 = shortest) varies so that each rank occurs exactly three times with no run of three, so no
// "pick the n-th longest" rule scores above 25 % (quizWeek3.test.ts asserts it). No key is a length outlier either: never
// more than 1.4 × the longest distractor nor less than 0.7 × the shortest, so "pick the odd one out" scores no better than
// chance (review m3; tested). New items, pending independent review.
import type { QuizQuestion } from './schema'

const PENDING = 'new-pending-review' as const

export const WEEK3_QUIZ: QuizQuestion[] = [
  {
    id: 'w3q-1', bloom: 'Understand', objective: 'W3.1', review: PENDING,
    prompt: 'A water utility tests a new purification membrane module in a pilot plant that treats real river water under field conditions. Only the module has been tested, not a full prototype plant. Which readiness level fits?',
    options: [
      { id: 'a', text: 'TRL 5, component validation in a relevant environment', correct: true, explanation: 'Correct. A component (the module) validated in a relevant environment (real river water in a pilot plant) is TRL 5 in SEBoK’s table (Session 1, slide 6).' },
      { id: 'b', text: 'TRL 7, because the pilot plant treats real river water every day of the week', correct: false, explanation: 'TRL 7 needs a prototype demonstrated in the operational environment; here only a component was validated, in a relevant environment.' },
      { id: 'c', text: 'TRL 4, laboratory validation', correct: false, explanation: 'A pilot plant on real river water is more than a laboratory environment.' },
      { id: 'd', text: 'TRL 9, proven in operation', correct: false, explanation: 'TRL 9 means the system is proven through successful mission operations.' },
    ],
    cite: { reading: 'R16', pages: '767' },
    lecture: { week: 3, session: 1, slide: 'w3s1-trl-scale', section: 'w3-lesson-readiness' },
  },
  {
    id: 'w3q-2', bloom: 'Analyse', objective: 'W3.1', review: PENDING,
    prompt: 'A drone maker adopts a navigation sensor rated TRL 9 in consumer phones and flies it in winter at −30 °C, well below the sensor’s rated temperature range. Why might the TRL 9 claim no longer hold?',
    options: [
      { id: 'a', text: 'TRL only measures software maturity, so a hardware sensor cannot be rated on the nine-level scale at all', correct: false, explanation: 'TRLs apply to hardware and software technologies alike.' },
      { id: 'b', text: 'The phone maker’s production volume shows the sensor is mature, so the rating transfers to the drone unchanged', correct: false, explanation: 'Production volume speaks to producibility; it does not carry the readiness level into a harsher environment.' },
      { id: 'c', text: 'Readiness can change sharply once a product is used beyond its design limits', correct: true, explanation: 'Correct. SEBoK warns that the readiness of an off-the-shelf product changes dramatically when it is used beyond its design limits, such as extreme cold (Session 1, slide 6).' },
      { id: 'd', text: 'TRL 9 always applies once any product using the component has entered mission operations', correct: false, explanation: 'Maturity is demonstrated in an environment; a new, harsher environment needs new evidence.' },
    ],
    cite: { reading: 'R16', pages: '768' },
    lecture: { week: 3, session: 1, slide: 'w3s1-trl-scale', section: 'w3-lesson-readiness' },
  },
  {
    id: 'w3q-3', bloom: 'Analyse', objective: 'W3.5', review: PENDING,
    prompt: 'On a hospital imaging project, the vendor confirmed yesterday that the new scanner will arrive three months late. How should the team record this in its register?',
    options: [
      { id: 'a', text: 'A risk at likelihood level 5, near certainty', correct: false, explanation: 'Level 5 still means uncertain (up to 99 %). The delay has been confirmed, so it is not uncertain.' },
      { id: 'b', text: 'An issue: it has happened, so its probability is one', correct: true, explanation: 'Correct. An issue has occurred or is certain to occur (probability one); issue management works on the consequence (Session 1, slide 4).' },
      { id: 'c', text: 'An assumption to validate with the vendor', correct: false, explanation: 'An assumption is something taken as true for planning; this is a confirmed event.' },
      { id: 'd', text: 'An unknown, written as a TBD in the plan', correct: false, explanation: 'An unknown is missing information; the arrival date is now known.' },
    ],
    cite: { reading: 'R46', pages: '127' },
    lecture: { week: 3, session: 1, slide: 'w3s1-five-kinds', section: 'w3-lesson-why' },
  },
  {
    id: 'w3q-4', bloom: 'Apply', objective: 'W3.2', review: PENDING,
    prompt: 'A satellite team drafts four risk statements about a new star tracker. Which one has the condition–if–then form and keeps the treatment out of the statement?',
    options: [
      { id: 'a', text: 'If we do not add a second star tracker for redundancy, then the attitude control subsystem will fail its acceptance review', correct: false, explanation: 'The “if” is the absence of a treatment: a mitigation written into the statement.' },
      { id: 'b', text: 'The star tracker might be a problem for the schedule, so we will run extra thermal tests on the engineering model next month', correct: false, explanation: 'There is no condition–if–then structure, and the sentence ends with a treatment.' },
      { id: 'c', text: 'If anything goes wrong, then the launch slips.', correct: false, explanation: 'No condition is stated and “anything” is not an event that can be given a probability.' },
      { id: 'd', text: 'Condition: the star tracker is new to this bus. If it fails thermal tests, then the launch slips.', correct: true, explanation: 'Correct. A known condition, an uncertain event and a consequence, with no treatment inside (Session 1, slide 11).' },
    ],
    cite: { reading: 'R61a', pages: '633' },
    lecture: { week: 3, session: 1, slide: 'w3s1-risk-statement', section: 'w3-lesson-risk-writing' },
  },
  {
    id: 'w3q-5', bloom: 'Evaluate', objective: 'W3.2', review: PENDING,
    prompt: 'A rail-signaling project team handles every risk in its register by choosing “mitigate”, without discussing other options. Which pitfall is this, and what should the team do?',
    options: [
      { id: 'a', text: 'Sea of green: the plan is on track while the risk is unchanged, so the team should track the plan more often', correct: false, explanation: 'Sea of green is about monitoring a plan instead of the risk, and tracking the plan more often would not help.' },
      { id: 'b', text: 'Automatic mitigation selection: evaluate avoid, transfer and accept too', correct: true, explanation: 'Correct. SEBoK names automatic mitigation selection as a pitfall; all four options should be evaluated for each risk (Session 1, slide 14).' },
      { id: 'c', text: 'Lack of vigilance', correct: false, explanation: 'Lack of vigilance is about risks escaping identification, not about how they are handled.' },
      { id: 'd', text: 'Band-aid treatment', correct: false, explanation: 'Band-aid treatment patches instances instead of root causes; the problem here is never considering other handling options.' },
    ],
    cite: { reading: 'R17', pages: '485' },
    lecture: { week: 3, session: 1, slide: 'w3s1-handling', section: 'w3-lesson-risk-rating' },
  },
  {
    id: 'w3q-6', bloom: 'Apply', objective: 'W3.6', review: PENDING,
    prompt: 'A small satellite tracks its mass as a technical performance measure (lower is better). Threshold 500 kg; current best estimate 460 kg; contingency 25 kg. What is the margin?',
    options: [
      { id: 'a', text: '15 kg, from the worst case', correct: true, explanation: 'Correct. Worst case = 460 + 25 = 485 kg; margin = threshold − worst case = 500 − 485 = 15 kg (Session 1, slide 20).' },
      { id: 'b', text: '40 kg, the threshold minus the current best estimate', correct: false, explanation: 'That treats contingency as zero; margin is measured against the worst-case estimate.' },
      { id: 'c', text: '65 kg, the threshold plus the contingency minus the estimate', correct: false, explanation: 'Contingency reduces the margin; it is never added to it.' },
      { id: 'd', text: '25 kg, equal to the contingency', correct: false, explanation: 'Contingency and margin are different quantities: margin is what remains after the contingency.' },
    ],
    cite: { reading: 'R44', pages: '117' },
    lecture: { week: 3, session: 1, slide: 'w3s1-tpm-margin', section: 'w3-lesson-tpm' },
  },
  {
    id: 'w3q-7', bloom: 'Apply', objective: 'W3.2', review: PENDING,
    prompt: 'A city water utility must keep its pumping-control network supplying water through cyberattacks and power failures. Which treatment plan covers all three of SEBoK’s fundamental resilience objectives?',
    options: [
      { id: 'a', text: 'Buy cyber insurance and add a second firewall at the network edge', correct: false, explanation: 'Insurance transfers cost and a firewall reduces exposure; nothing keeps water flowing during an attack or restores service afterwards.' },
      { id: 'b', text: 'Monitor the network around the clock for intrusions and alerts', correct: false, explanation: 'Monitoring supports detection; on its own it does not avoid, withstand or recover.' },
      { id: 'c', text: 'Segment it from the internet, keep pumps on local control, restore from verified backups', correct: true, explanation: 'Correct. Segmentation avoids exposure, local control withstands the loss of links, and verified backups recover lost capability: avoid, withstand, recover (Session 1, slide 15).' },
      { id: 'd', text: 'Replace every pump controller with a newer, supported model', correct: false, explanation: 'Newer equipment does not by itself address any resilience objective against attack or power failure.' },
    ],
    cite: { reading: 'R24', pages: '1204' },
    lecture: { week: 3, session: 1, slide: 'w3s1-security-resilience', section: 'w3-lesson-security-resilience' },
  },
  {
    id: 'w3q-8', bloom: 'Analyse', objective: 'W3.2', review: PENDING,
    prompt: 'A port authority sorts its register by likelihood × consequence. Crane delay P is rated 3 × 4 = 12; fuel-line rupture Q, which could injure workers, is 2 × 5 = 10. Both sit in the same matrix level. Which ranks first under the course rule?',
    options: [
      { id: 'a', text: 'P ranks first, because 12 is greater than 10 and the product measures expected loss on any rating scale', correct: false, explanation: 'Ordinal levels are ranks, not quantities; their product is not an expected loss.' },
      { id: 'b', text: 'They are equal risks', correct: false, explanation: 'The matrix gives them the same level; the course rule breaks the tie by consequence.' },
      { id: 'c', text: 'P ranks first: likelier', correct: false, explanation: 'Likelihood is the last tie-breaker, after cell level and consequence.' },
      { id: 'd', text: 'Q ranks first: same level, so the higher consequence decides', correct: true, explanation: 'Correct. Rank by cell level, then the higher consequence, then the higher likelihood (Session 1, slide 13).' },
    ],
    courseSource: 'Session 1, slide 13 “What the matrix cannot say”: the ranking rule (cell level, then consequence, then likelihood) is a course convention, consistent with SEBoK’s pair of maximum probability and consequence',
    cite: { reading: 'R17', pages: '483' },
    lecture: { week: 3, session: 1, slide: 'w3s1-matrix-limits', section: 'w3-lesson-risk-rating' },
  },
  {
    id: 'w3q-9', bloom: 'Analyse', objective: 'W3.3', review: PENDING,
    prompt: 'A university choosing a campus shuttle lists four criteria: purchase cost, affordability, ride time and wheelchair accessibility. What is wrong with this set?',
    options: [
      { id: 'a', text: 'Cost is counted twice: purchase cost and affordability measure one concern', correct: true, explanation: 'Correct. The set of objectives must be non-redundant; two criteria on one concern give it two weights (Session 2, slide 12).' },
      { id: 'b', text: 'Ride time and accessibility conflict, so one of them must be removed before any weights are assigned to the set', correct: false, explanation: 'Conflicting objectives are normal in a trade study; that is why weights exist.' },
      { id: 'c', text: 'There are too few criteria: SEBoK requires at least six measures for a study with more than three alternatives', correct: false, explanation: 'No such rule exists; the set must be complete and non-redundant.' },
      { id: 'd', text: 'Nothing is wrong with it', correct: false, explanation: 'Two of the criteria measure the same concern.' },
    ],
    cite: { reading: 'R18', pages: '465' },
    lecture: { week: 3, session: 2, slide: 'w3s2-weighted-sum-pitfalls', section: 'w3-lesson-pitfalls' },
  },
  {
    id: 'w3q-10', bloom: 'Understand', objective: 'W3.4', review: PENDING,
    prompt: 'A hospital trade study narrows the cost range from USD 0–10 M to USD 0–2 M; stakeholders care about cost as much as before. What should happen to the cost swing weight?',
    options: [
      { id: 'a', text: 'It should stay the same, because importance did not change', correct: false, explanation: 'Swing weights depend on importance and on the range; a narrower swing is worth less.' },
      { id: 'b', text: 'It should decrease, as a narrower swing is worth less', correct: true, explanation: 'Correct. A swing of 2 million is worth less than a swing of 10 million, so the weight falls (Session 2, slide 6).' },
      { id: 'c', text: 'It should increase, because the alternatives are now closer together on cost', correct: false, explanation: 'The weight reflects the value of the swing between the anchors, which has shrunk.' },
      { id: 'd', text: 'Nothing, as long as the weights are later normalized to one', correct: false, explanation: 'Normalization rescales the weights; it does not correct a weight that ignores the range.' },
    ],
    cite: { reading: 'R18', pages: '466' },
    lecture: { week: 3, session: 2, slide: 'w3s2-swing-weights', section: 'w3-lesson-value-weights' },
  },
  {
    id: 'w3q-11', bloom: 'Apply', objective: 'W3.4', review: PENDING,
    prompt: 'An electric-bus depot study weights three criteria 0.5, 0.3 and 0.2. One option has single-measure values 0.8, 0.4 and 1.0. What is its additive value?',
    options: [
      { id: 'a', text: '0.73, rounded up', correct: false, explanation: 'Close, but recompute: 0.40 + 0.12 + 0.20 = 0.72.' },
      { id: 'b', text: '2.20, the plain sum', correct: false, explanation: 'That is the unweighted sum of the values.' },
      { id: 'c', text: '0.67, the average', correct: false, explanation: 'That is the unweighted average; the additive model weights each value.' },
      { id: 'd', text: '0.72, the weighted sum', correct: true, explanation: 'Correct. v = Σ wᵢ vᵢ = 0.40 + 0.12 + 0.20 = 0.72 (Session 2, slide 7).' },
    ],
    cite: { reading: 'R18', pages: '469' },
    lecture: { week: 3, session: 2, slide: 'w3s2-additive-model', section: 'w3-lesson-value-weights' },
  },
  {
    id: 'w3q-12', bloom: 'Analyse', objective: 'W3.4', review: PENDING,
    prompt: 'A satellite program scales each criterion from the worst to the best alternative in its study. When one rejected alternative is dropped, two of the remaining alternatives swap places. What explains it, and what prevents it?',
    options: [
      { id: 'a', text: 'The weights were wrong, so the team must redo the swing-weight elicitation with a larger group of stakeholders', correct: false, explanation: 'The weights did not change; the values did, because their scale moved with the set.' },
      { id: 'b', text: 'A computational error: a weighted sum cannot change order when an alternative is removed, so recheck the sheet', correct: false, explanation: 'With set-relative scaling it can, and here it did, with no arithmetic error.' },
      { id: 'c', text: 'Values depend on the set; anchor them to fixed walk-away and stretch points', correct: true, explanation: 'Correct. Scaling to the alternatives present makes every value depend on the set; fixed walk-away and stretch anchors do not move (Session 2, slide 12).' },
      { id: 'd', text: 'Bias in the scoring team', correct: false, explanation: 'Bias can distort scores, but nothing about the scores changed here.' },
    ],
    cite: { reading: 'R18', pages: '465–466' },
    lecture: { week: 3, session: 2, slide: 'w3s2-weighted-sum-pitfalls', section: 'w3-lesson-pitfalls' },
  },
]
