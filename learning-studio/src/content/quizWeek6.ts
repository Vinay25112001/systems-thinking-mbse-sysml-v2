// Week 6 readiness quiz Q6 (individual, formative), kept separate from the lecture (DECISION_LOG A20). Every item is
// answerable from the Week 6 lectures and the detailed lesson: `lecture` names the slide that teaches it and the lesson
// section that explains it, and the item cites the register page its key rests on. Every option's explanation names the
// slide by id and a register page. Contexts are unseen and never AeroLink, and none uses the applied exercise's setting
// (a city bike-share): water utility, hospital network, port, school district, wind farm, rail operator, food-delivery
// cooperative, library network, museum. Keys are authored across a–d, three each, and the key's length rank among the four
// options (1 = longest … 4 = shortest) occurs exactly three times per rank with no run of three; no key is a length
// outlier (1.4 × / 0.7 ×), the farthest-by-length option is the key at most three times, no key is a middle option
// standing apart from a near-equal distractor pair, keys echo no distinctive stem word or count, and no option uses an
// absolute, not even a soft one (any, every, all, whole, whatever, at once, without delay, alone, right away, as soon as, at all,
// completely, a full), and hedges are no commoner in keys
// than in distractors (quizWeek6.test.ts asserts each rule and shows each can fail; review Mo5, 2026-10-21). Items resting on a course convention say so in
// `courseSource` and in the key's explanation. New items, pending independent review.
import type { QuizQuestion } from './schema'

const PENDING = 'new-pending-review' as const

export const WEEK6_QUIZ: QuizQuestion[] = [
  {
    id: 'w6q-1', bloom: 'Understand', objective: 'W6.1', review: PENDING,
    prompt: 'A regional water utility compares the meter-reading capability its customers need with what its crews deliver. In one district the crews read every meter twice as often as billing ever uses. What has the comparison found in that district?',
    options: [
      { id: 'a', text: 'An excess: more than the desired level, a candidate for divestment', correct: true, explanation: 'Correct. Comparing desired with baseline capability finds gaps and points of excess capability; gaps are filled and excesses eliminated (Session 1, slide w6s1-gaps; R12 p.862).' },
      { id: 'b', text: 'A gap, since a difference between the two levels counts as one of those', correct: false, explanation: 'SEBoK separates gaps (baseline below the desired level) from excesses (baseline above it); a reading rate above what billing uses is an excess (Session 1, slide w6s1-gaps; R12 p.862).' },
      { id: 'c', text: 'An unknown, since the desired reading rate was not set as a written requirement', correct: false, explanation: 'The desired level comes from the needs assessment; the comparison has a result here, an excess, not an open value (Session 1, slide w6s1-gaps; R12 p.862).' },
      { id: 'd', text: 'A choice of development approach for the next increment of meters', correct: false, explanation: 'A development approach describes how an increment is developed; the comparison of levels finds a gap or an excess (Session 1, slide w6s1-gaps; R12 p.862).' },
    ],
    cite: { reading: 'R12', pages: '862' },
    lecture: { week: 6, session: 1, slide: 'w6s1-gaps', section: 'w6-lesson-gaps' },
  },
  {
    id: 'w6q-2', bloom: 'Apply', objective: 'W6.1', review: PENDING,
    prompt: 'A hospital network maps its telemedicine gaps onto horizons. Its devices and software are replaced every year or so. Which time buckets fit SEBoK’s guidance?',
    options: [
      { id: 'a', text: 'Long buckets, such as five, ten and twenty years, as for long-lived assets', correct: false, explanation: 'SEBoK gives five, ten and twenty years for long-lasting capabilities; fast-changing ones get shorter buckets (Session 1, slide w6s1-gaps; R12 p.862).' },
      { id: 'b', text: 'Short buckets, such as one, two and three years, for fast change', correct: true, explanation: 'Correct. For fast-changing capabilities SEBoK suggests shorter buckets, for example one, two and three years out (Session 1, slide w6s1-gaps; R12 p.862).' },
      { id: 'c', text: 'One ten-year bucket, as a hospital service lasts for decades', correct: false, explanation: 'One bucket cannot show the timing and intensity of change that the near-, mid- and far-term mapping exists to show (Session 1, slide w6s1-gaps; R12 p.862).' },
      { id: 'd', text: 'Buckets that follow the budget cycle, not the pace of change', correct: false, explanation: 'SEBoK ties the bucket lengths to how fast the capability changes, not to the budget calendar (Session 1, slide w6s1-gaps; R12 p.862).' },
    ],
    cite: { reading: 'R12', pages: '862' },
    lecture: { week: 6, session: 1, slide: 'w6s1-gaps', section: 'w6-lesson-gaps' },
  },
  {
    id: 'w6q-3', bloom: 'Analyse', objective: 'W6.4', review: PENDING,
    prompt: 'A water utility’s plan reads: “Our enterprise will evolve through three increments over ten years, so every increment will be developed evolutionarily.” What is wrong with this reasoning?',
    options: [
      { id: 'a', text: 'Evolutionary development needs a fixed end state', correct: false, explanation: 'Evolutionary approaches start from a limited set of requirements; it is MITRE’s first acquisition approach that defines the end state at the start (Session 1, slide w6s1-development-approaches; R108 p.393).' },
      { id: 'b', text: 'The label belongs to the roadmap, so the increments share one approach', correct: false, explanation: 'SEBoK applies the adjectives to the development stage only, not to the life cycle as a whole; one label for the roadmap does not fix the approach of every increment (Session 1, slide w6s1-development-approaches; R108 p.391).' },
      { id: 'c', text: 'Ten years is too long a horizon, so the plan should hold one increment', correct: false, explanation: 'Long horizons are normal for an enterprise plan; the error is in the development approach, not the horizon (Session 1, slide w6s1-development-approaches; R108 p.391).' },
      { id: 'd', text: 'The label fits development, so each increment needs its own reasoned approach', correct: true, explanation: 'Correct. SEBoK applies “sequential”, “incremental” and “evolutionary” to the development stage only; an evolving enterprise can develop each increment differently (Session 1, slide w6s1-development-approaches; R108 p.391).' },
    ],
    cite: { reading: 'R108', pages: '391' },
    lecture: { week: 6, session: 1, slide: 'w6s1-development-approaches', section: 'w6-lesson-increments' },
  },
  {
    id: 'w6q-4', bloom: 'Analyse', objective: 'W6.4', review: PENDING,
    prompt: 'A port authority plans automated container cranes. Nobody can yet say what the final automated terminal will look like; each step will depend on what crane technology allows and what operators ask for. How should its increments be defined?',
    options: [
      { id: 'a', text: 'Let crane technology set each step and leave operator requests for later', correct: false, explanation: 'Technology alone sets the steps in the first approach, toward an end state defined at the start; when the end state emerges, the steps follow maturing technology and evolving user needs together (Session 1, slide w6s1-evolutionary-acquisition; R106 p.583).' },
      { id: 'b', text: 'Let operator requests set each step, adding cranes once the requests settle', correct: false, explanation: 'User needs alone ignore what the cranes can do yet; MITRE’s second approach matches the needs with maturing technology at each increment (Session 1, slide w6s1-evolutionary-acquisition; R106 p.583).' },
      { id: 'c', text: 'Set each step by maturing technology matched with evolving user needs', correct: true, explanation: 'Correct. When the ultimate functionality cannot be defined at the start, each increment is defined by maturing technologies matched with evolving user needs (Session 1, slide w6s1-evolutionary-acquisition; R106 p.583).' },
      { id: 'd', text: 'Wait to define increments until the final terminal can be described in full', correct: false, explanation: 'Waiting for a defined end state is the first approach; MITRE’s second approach exists for the case where the end state cannot be defined at the start (Session 1, slide w6s1-evolutionary-acquisition; R106 p.583).' },
    ],
    cite: { reading: 'R106', pages: '583' },
    lecture: { week: 6, session: 1, slide: 'w6s1-evolutionary-acquisition', section: 'w6-lesson-increments' },
  },
  {
    id: 'w6q-5', bloom: 'Understand', objective: 'W6.2', review: PENDING,
    prompt: 'A school district is told that the electric bus it wants to buy is at TRL 8. What does that rating leave unassessed?',
    options: [
      { id: 'a', text: 'Whether the bus as a system was qualified through test and demonstration', correct: false, explanation: 'Qualification through test and demonstration is exactly what TRL 8 states (Session 1, slide w6s1-maturity-limits; R60 p.525).' },
      { id: 'b', text: 'How far the bus has moved beyond the laboratory environment', correct: false, explanation: 'Any TRL above 4 says the technology has moved beyond laboratory validation; TRL 8 says much more (Session 1, slide w6s1-maturity-limits; R60 p.525).' },
      { id: 'c', text: 'Whether prototypes were shown in a relevant environment', correct: false, explanation: 'Demonstration in a relevant environment is TRL 6, which TRL 8 has passed (Session 1, slide w6s1-maturity-limits; R60 p.525).' },
      { id: 'd', text: 'How well the bus fits the depots, chargers and routes it would use', correct: true, explanation: 'Correct. The TRL scale does not address how well a technology fits the architecture and system structure absorbing it (Session 1, slide w6s1-maturity-limits; R60 p.525).' },
    ],
    cite: { reading: 'R60', pages: '525' },
    lecture: { week: 6, session: 1, slide: 'w6s1-maturity-limits', section: 'w6-lesson-technology' },
  },
  {
    id: 'w6q-6', bloom: 'Evaluate', objective: 'W6.2', review: PENDING,
    prompt: 'A hospital network can buy a mature remote-monitoring kit today. Its clinics’ network links would need rewiring to take it, and the clinical benefit appears only once a new chronic-care program starts in two years. What should its roadmap do?',
    options: [
      { id: 'a', text: 'Plan the insertion for when the rewiring is done and the program runs', correct: true, explanation: 'Correct. A flexible roadmap balances technology maturity, the ability to insert the technology and when the upgrade is operationally appropriate (Session 2, slide w6s2-insertion-rule; R107 p.449).' },
      { id: 'b', text: 'Insert it now, because a mature technology is ready to go into service', correct: false, explanation: 'Maturity is one of three conditions; the ability to insert and the operational timing are not met yet (Session 2, slide w6s2-insertion-rule; R107 p.449).' },
      { id: 'c', text: 'Drop it, because a rewiring need rules out a plan to insert it', correct: false, explanation: 'Insertability can be created by a planned change; it is a condition to plan for, not a reason to drop the kit (Session 2, slide w6s2-insertion-rule; R107 p.449).' },
      { id: 'd', text: 'Insert it now and start the chronic-care program early to suit the kit', correct: false, explanation: 'Moving the program to suit a purchase reverses the rule: timing follows the operational need (Session 2, slide w6s2-insertion-rule; R107 p.449).' },
    ],
    cite: { reading: 'R107', pages: '449' },
    lecture: { week: 6, session: 2, slide: 'w6s2-insertion-rule', section: 'w6-lesson-transition' },
  },
  {
    id: 'w6q-7', bloom: 'Apply', objective: 'W6.1', review: PENDING,
    prompt: 'A wind-farm operator plans an increment that relies on a blade-inspection drone still in laboratory testing. The increment states its content, a trigger and its transition. What does it most need added?',
    options: [
      { id: 'a', text: 'A shorter transition, so that the drone reaches service before its tests are done', correct: false, explanation: 'Rushing an immature technology into service is the opposite of risk control; the gap is the missing contingency (Session 1, slide w6s1-off-ramps; R46 p.126).' },
      { id: 'b', text: 'An off-ramp to proven methods if the drone does not mature', correct: true, explanation: 'Correct. An off-ramp is a contingency plan to use mature technology if a technology is not developed successfully; an increment inserting an immature technology needs one (Session 1, slide w6s1-off-ramps; R46 p.126).' },
      { id: 'c', text: 'An extra trigger tied to the calendar, so that the planned date holds', correct: false, explanation: 'A calendar trigger does not control the maturity risk; the drone may still not mature (Session 1, slide w6s1-off-ramps; R46 p.126).' },
      { id: 'd', text: 'A larger budget line, as laboratory testing shows the drone is mature', correct: false, explanation: 'Laboratory validation is TRL 4 at most, which is immature; money does not replace a contingency (Session 1, slide w6s1-off-ramps; R46 p.126).' },
    ],
    cite: { reading: 'R46', pages: '126' },
    lecture: { week: 6, session: 1, slide: 'w6s1-off-ramps', section: 'w6-lesson-increments' },
  },
  {
    id: 'w6q-8', bloom: 'Apply', objective: 'W6.3', review: PENDING,
    prompt: 'A regional rail operator is replacing the ticket machines at its eighty stations with a new fare system. What does SEBoK say a service like this needs while the change is under way?',
    options: [
      { id: 'a', text: 'A pause in ticket sales, so that the new system starts clean', correct: false, explanation: 'SEBoK names disruption of ongoing operations as the serious risk; a service stays available while it changes (Session 2, slide w6s2-operating-change; R26 p.683).' },
      { id: 'b', text: 'A new concept of operations, written after the fact', correct: false, explanation: 'The intended usage, documented as a concept of operations, is understood before the change, not after it (Session 2, slide w6s2-operating-change; R26 p.681).' },
      { id: 'c', text: 'Compatibility with the old fares, with the rollout done area by area', correct: true, explanation: 'Correct. Service modernization requires backward compatibility with the service provided during the change, and usually a phase-based strategy over large areas (Session 2, slide w6s2-operating-change; R26 p.682).' },
      { id: 'd', text: 'The stations switched on one night, to avoid two systems running', correct: false, explanation: 'A network-wide overnight switch maximizes the disruption risk SEBoK warns about; a phased change keeps the service running (Session 2, slide w6s2-operating-change; R26 p.682).' },
    ],
    cite: { reading: 'R26', pages: '682' },
    lecture: { week: 6, session: 2, slide: 'w6s2-operating-change', section: 'w6-lesson-transition' },
  },
  {
    id: 'w6q-9', bloom: 'Apply', objective: 'W6.5', review: PENDING,
    prompt: 'A food-delivery cooperative does not yet know the permit fee its city will set for delivery zones, and the fee decides whether its suburban increment pays. Which record of this unknown helps its roadmap most?',
    options: [
      { id: 'a', text: 'Its impact, the information needed, a mitigation, an owner, the gated increment', correct: true, explanation: 'Correct. TBX management names the work and the owner (R13 p.565); the course record, a course convention, adds impact, information needed, mitigation and the increment it gates (Session 1, slide w6s1-known-unknowns).' },
      { id: 'b', text: 'The fee written down as a firm number, so that the plan can move ahead on schedule', correct: false, explanation: 'Inventing a value hides the unknown; SEBoK uses a TBD where a value is not known (Session 1, slide w6s1-known-unknowns; R13 p.565).' },
      { id: 'c', text: 'A note to look at the fee again after the suburban increment has started and its zones are known', correct: false, explanation: 'An unknown that gates an increment must close before it starts; a note with no owner or need closes nothing (Session 1, slide w6s1-known-unknowns; R13 p.565).' },
      { id: 'd', text: 'A score of likelihood three and consequence four, with no owner named', correct: false, explanation: 'TBX management identifies the owner of the work; a score with no owner, no information need and no gated increment is not the record (Session 1, slide w6s1-known-unknowns; R13 p.565).' },
    ],
    cite: { reading: 'R13', pages: '565' },
    courseSource: 'The known-unknowns record fields (impact, information needed, mitigation, owner, the increment it gates) are a course convention taught in Session 1, slide w6s1-known-unknowns, built on SEBoK’s TBX management.',
    lecture: { week: 6, session: 1, slide: 'w6s1-known-unknowns', section: 'w6-lesson-unknowns' },
  },
  {
    id: 'w6q-10', bloom: 'Apply', objective: 'W6.6', review: PENDING,
    prompt: 'A city library network will let readers borrow through a partner app that connects to its catalog. When should the network plan the security of that new connection?',
    options: [
      { id: 'a', text: 'After the partner app goes live, once real attacks have shown what needs protecting', correct: false, explanation: 'Waiting for attacks is the retrofit SEBoK warns against (Session 2, slide w6s2-security-resilience; R25 p.1231).' },
      { id: 'b', text: 'At the next yearly audit, which reviews the interfaces in a single pass', correct: false, explanation: 'An audit after the change is still a retrofit; security is engineered in when the change is planned (Session 2, slide w6s2-security-resilience; R25 p.1231).' },
      { id: 'c', text: 'If the partner asks for it, as the catalog itself holds no payment data', correct: false, explanation: 'Adversity often comes through connected systems, whatever data they hold; a new external connection is a path for it (Session 2, slide w6s2-security-resilience; R25 p.1234).' },
      { id: 'd', text: 'As part of the increment that adds it, since a retrofit comes too late', correct: true, explanation: 'Correct. Unless security is engineered in from inception there is little chance it can be made secure by retrofit (Session 2, slide w6s2-security-resilience; R25 p.1231).' },
    ],
    cite: { reading: 'R25', pages: '1231' },
    lecture: { week: 6, session: 2, slide: 'w6s2-security-resilience', section: 'w6-lesson-security' },
  },
  {
    id: 'w6q-11', bloom: 'Analyse', objective: 'W6.3', review: PENDING,
    prompt: 'A hospital moves its patient records to a new system over one weekend while its emergency department stays open. Which of these is a transition risk in the course’s sense?',
    options: [
      { id: 'a', text: 'A nurse’s login fails on the Saturday because her password expired that day', correct: false, explanation: 'It happens during the weekend, but an expiring password fails on any system on any day; the move does not create it (Session 2, slide w6s2-security-resilience; R26 p.683).' },
      { id: 'b', text: 'Records entered during the move reach neither the old system nor its successor', correct: true, explanation: 'Correct. A transition risk, a course convention, exists only while the change is being made; SEBoK names disruption of operations during the change as a serious risk (Session 2, slide w6s2-security-resilience; R26 p.683).' },
      { id: 'c', text: 'The emergency department is busier on Saturday night, as on most weekends', correct: false, explanation: 'It falls inside the weekend, but a busy Saturday night comes every weekend; it raises the stakes of the move without being a risk the move creates (Session 2, slide w6s2-security-resilience; R26 p.683).' },
      { id: 'd', text: 'The vendor raises the records system’s license fee in its second year', correct: false, explanation: 'A fee rise in year two belongs to normal operation; it does not exist only during the change (Session 2, slide w6s2-security-resilience; R26 p.683).' },
    ],
    cite: { reading: 'R26', pages: '683' },
    courseSource: 'The transition risk, a risk that exists only while a change is being made, is a course convention taught in Session 2, slide w6s2-security-resilience, built on SEBoK’s point that disruption of ongoing operations is a serious risk during enterprise change.',
    lecture: { week: 6, session: 2, slide: 'w6s2-security-resilience', section: 'w6-lesson-security' },
  },
  {
    id: 'w6q-12', bloom: 'Evaluate', objective: 'W6.1', review: PENDING,
    prompt: 'A museum’s plan lists “Increment 2: interactive galleries, early next year” and nothing more. Which revision does most to make it a roadmap increment?',
    options: [
      { id: 'a', text: 'Move the date to late next year, to leave some room for slippage in the build', correct: false, explanation: 'A later date is still a date; the increment still has no trigger and no gap behind it (Session 2, slide w6s2-anatomy; R105 p.530).' },
      { id: 'b', text: 'Add more exhibits to the increment so that its value is larger', correct: false, explanation: 'More content does not say why or when the increment starts (Session 2, slide w6s2-anatomy; R105 p.530).' },
      { id: 'c', text: 'Tie it to the visitor gap it closes, starting it on a stated measure', correct: true, explanation: 'Correct. In the course roadmap, a course convention, each increment serves a named gap and starts at an entry trigger, MITRE’s quantifiable feedback turned into a start condition (Session 2, slide w6s2-anatomy; R105 p.530).' },
      { id: 'd', text: 'Split it into monthly releases with a fixed date for each one', correct: false, explanation: 'Twelve dates instead of one still leave the increment without a gap or a trigger (Session 2, slide w6s2-anatomy; R105 p.530).' },
    ],
    cite: { reading: 'R105', pages: '530' },
    courseSource: 'The roadmap anatomy (each increment serving a gap, need or objective and starting at an entry trigger) is a course convention taught in Session 2, slide w6s2-anatomy, built on MITRE’s quantifiable feedback system.',
    lecture: { week: 6, session: 2, slide: 'w6s2-anatomy', section: 'w6-lesson-limits' },
  },
]
