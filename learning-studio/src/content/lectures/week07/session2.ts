// Week 7, Session 2 lecture: Final Presentation — presenting and defending engineering decisions, then the Phase I design
// review. A defendable decision (traceable, with its limits stated); the structure of an engineering argument; defending a
// trade, a risk position and a roadmap; briefing a non-technical reviewer; review item discrepancies (RIDs) and their
// dispositions, worked on four RIDs raised against the AeroLink package; then the review meeting itself (opening, team
// slots computed from the class size, close). 75-minute session: 25 minutes of lecture and 44 minutes of review, 69 in
// all on 12 slides plus the generated "References and credits" slide, and a 6-minute buffer (bufferMinutes). Single source
// for the slide viewer, the faculty notes, the .pptx and the student lesson (docs/lectures/PIPELINE.md). Governing
// direction: DECISION_LOG A20, A21 (decision 7: Weeks 7 and 14 are engineering reviews and presentations), A22, A24.
//
// Review status: new-pending-review. Written 2026-10-21 from the integrator's Week 7 brief (Session 2: how to present and
// defend engineering decisions; argument structure; trade, risk and roadmap rationale; review findings and dispositions)
// and docs/lectures/week07/WEEK07_LECTURE_OUTLINE.md §3.
//
// Accuracy rules followed:
//   - Every citation is a verified register entry at a page whose extracted text supports the claim beside it.
//   - Source gaps are named where they bite: no held source covers briefing technique or argument structure beyond
//     SEBoK R18 p.473, DoD R43 pp.109–110, MITRE R56 p.387 and R105 p.531; the argument skeleton, the RID fields, the
//     severity and disposition vocabularies and the review timing are course conventions, and the slides say so.
//   - AeroLink Urban Mobility is FICTIONAL. The decision, the RIDs and their evidence are computed in ./aerolinkCase.ts
//     from the Weeks 1–6 cases.
//   - Timing: spoken notes stay between 40 and 130 words per minute on lecture slides (./timing.test.ts).
//   - Faculty notes and purposes are stripped from the student build (student-edition.ts).
import type { Lecture } from '../types'
import { DECISION, FEASIBLE, RANKING, SCREENS, TOTALS, alternative } from '../week03/aerolinkCase'
import { YEAR2 } from '../week06/aerolinkCase'
import { RIDS, RID_COUNTS, REVIEW_PLAN_FIVE, REVIEW_PLAN_FOUR, plural } from './aerolinkCase'
import { EXIT_CRITERIA, MIN_SLOT, REVIEW_TEAM_MINUTES, RID_DISPOSITIONS, SEVERITIES, ridDispositionLabel } from './labBrief'

export const WEEK7_S2_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const rec = alternative(DECISION.recommended)
const runnerUp = RANKING[1]
const P5 = REVIEW_PLAN_FIVE
const P4 = REVIEW_PLAN_FOUR

export const WEEK7_SESSION2: Lecture = {
  week: 7,
  session: 2,
  title: 'Final Presentation',
  subtitle: 'Session 2: Presenting and defending engineering decisions; the Phase I design review',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. defending decisions (25 min)
    {
      id: 'w7s2-defend',
      title: 'Presenting and defending engineering decisions',
      slides: [
        {
          id: 'w7s2-title',
          title: 'Final Presentation',
          subtitle: 'Session 2: Presenting and defending engineering decisions; the Phase I design review',
          purpose: 'Orient: 25 minutes on how to defend, then the review.',
          minutes: 1,
          layout: 'title',
          body: [{ kind: 'bullets', items: ['First: how to present and defend a decision, and how to answer a finding', 'Then: the Phase I design review, team by team', 'Your reviewers have read your package and written their findings'] }],
          sources: [],
          notes: {
            teach: [
              'Two parts today. For 25 minutes: how to present and defend an engineering decision, and how to answer review findings with a disposition. Then the review itself. Your reviewers have read your package, which you sent yesterday, and have written their findings on the form; you will answer some of them in the room.',
            ],
            why: 'Stating the split protects the review time, which is the assessed part of the session.',
            misconceptions: [{ claim: 'Defending a decision means not giving ground.', correction: 'Defending means showing the evidence and limits; accepting a correct finding is part of a good defense.' }],
            transition: 'What makes a decision defendable?',
            timing: '1 min.',
          },
        },
        {
          id: 'w7s2-defendable',
          title: 'A defendable decision is traceable, and states its limits',
          purpose: 'Define what reviewers test in a decision briefing, from the sources.',
          minutes: 3,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['Traceable: every claim leads to an ID or an analysis', 'Defendable: the criteria, weights and sensitivity are shown', 'Actionable: it ends in a decision and an action plan', 'The decision maker decides; you make it decidable'] },
            { kind: 'callout', tone: 'key', text: 'Reviewers judge how well you show the link from your design to its requirements.' },
          ],
          sources: [R('R43', '109'), R('R43', '110'), R('R56', '387')],
          notes: {
            teach: [
              'The DoD guidebook says the decision analysis process transforms a broadly stated decision opportunity into a traceable, defendable and actionable plan, aggregated into a view relevant to the decision maker (R43 p.109). It also says a robust process acknowledges that the decision maker has full responsibility, authority and accountability for the decision (R43 p.110). Your job is not to decide for the reviewer; it is to make the decision decidable.',
              'MITRE’s guide on assessing designs says what a review looks at: the assessment of a design should consider how well the design team presents the linkage of its design to the system requirements, through documentation, presentations or design reviews, and a traceability matrix can be an important device in communicating that (R56 p.387).',
              'So three tests. Traceable: can every claim be followed to an ID or an analysis? Defendable: are the criteria, the weights and the sensitivity shown, so the reviewer can see when the answer would change? Actionable: does it end in a decision and an action plan?',
            ],
            why: 'Students otherwise present what they did, in the order they did it; the three tests reorganize the briefing around what the reviewer must judge.',
            misconceptions: [{ claim: 'A confident presentation is a defendable one.', correction: 'Confidence is not evidence. A decision is defendable when its evidence, criteria and limits are on the table.' }],
            transition: 'The shape of an engineering argument.',
            timing: '3 min: 1 min DoD, 1 min MITRE, 1 min the three tests.',
          },
        },
        {
          id: 'w7s2-argument',
          title: 'The structure of an engineering argument',
          purpose: 'Give a reusable argument skeleton for any decision the team defends.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s2-argument',
            caption: 'An engineering argument in six links: the claim, its evidence, the criteria, the conditions, the residual risk and what would change it.',
            alt: 'Six boxes in reading order, two rows of three joined by arrows: claim, evidence by ID, criteria and weights; then conditions, residual risk, what would change it. Under the evidence box a small tag reads ID; from the last box a dashed arrow loops back to the claim.',
          },
          body: [{ kind: 'bullets', items: ['Claim: the recommendation, in one sentence', 'Evidence: analysis and IDs, not adjectives', 'Criteria: what “better” meant, with weights', 'Conditions and residual risk: the limits', 'What would change it: the honest exit'] }],
          sources: [R('R43', '110'), R('R18', '473')],
          notes: {
            teach: [
              'A course convention, built on the DoD decision analysis steps. Those steps run: identify the problem; review requirements and assumptions; frame the decision; develop decision criteria with weights and their rationale; identify, record and track assumptions; define alternatives; assess them against the criteria; synthesize; analyze sensitivities; develop a decision briefing with an action plan; recommend (R43 p.110). A briefing that skips the middle steps asks the reviewer to trust the end.',
              'So every argument you present has six links. The claim: your recommendation in one sentence. The evidence: the analysis behind it, cited by ID. The criteria: what better meant, with the weights and why. The conditions: what must stay true, which is what your sensitivity analysis found. The residual risk: what remains after the decision. And what would change it: the evidence that would make you decide differently.',
              'SEBoK adds the form: the recommendation as a clearly worded, actionable task list, with a full report kept for traceability (R18 p.473). The task list is the claim and its action plan; the package is the report.',
            ],
            why: 'A fixed skeleton makes the gaps in an argument visible to the team before a reviewer finds them.',
            figure: 'Read the six boxes left to right; then the dashed arrow from the last box back to the claim: stating what would change the decision is what keeps it honest.',
            misconceptions: [{ claim: 'Saying what would change the decision weakens it.', correction: 'It strengthens it: it shows the decision was tested, and it tells the decision maker what to watch.' }],
            transition: 'Applied to the decision AeroLink defends: the Year-2 trade.',
            timing: '4 min: 1.5 min the DoD steps, 2 min the six links, 30 s the task list.',
          },
        },
        {
          id: 'w7s2-trade',
          title: 'Defending the trade: AeroLink’s Year-2 decision',
          purpose: 'Model the argument on a real trade from the package.',
          minutes: 3,
          layout: 'two-column',
          body: [{ kind: 'bullets', items: [`Claim: ${DECISION.recommended}, ${rec.addedAircraft} aircraft and a fourth hub`, `Evidence: ${YEAR2.capacity} trips/day by month ${YEAR2.month}; passes every screen`, `Criteria: ${TOTALS[DECISION.recommended].toFixed(3)} against ${TOTALS[runnerUp].toFixed(3)} for ${runnerUp}`, `${plural(FEASIBLE.length, 'alternative')} survive the screens`] }],
          aside: [{ kind: 'bullets', items: [`${plural(DECISION.conditions.length, 'condition')}, from the sensitivity`, `${plural(DECISION.residualRisk.length, 'residual risk')}, each with its R ID`, `${plural(DECISION.wouldChangeIf.length, 'stated exit')}: what would change it`] }],
          sources: [R('R43', '110')],
          notes: {
            teach: [
              `The claim: ${DECISION.recommended}, ${rec.text.charAt(0).toLowerCase()}${rec.text.slice(1)} The evidence: it gives ${YEAR2.capacity} trips a day by month ${YEAR2.month}, and it is one of ${plural(FEASIBLE.length, 'alternative')} that pass every screen: ${SCREENS.map((s) => s.name.toLowerCase()).join('; ')}. The criteria: it scores ${TOTALS[DECISION.recommended].toFixed(3)} against ${TOTALS[runnerUp].toFixed(3)} for ${runnerUp}, the next best.`,
              `The limits, from the decision record. Conditions: ${DECISION.conditions.join('; ')}. Residual risk: ${DECISION.residualRisk.join('; ')}.`,
              `What would change it: ${DECISION.wouldChangeIf[0]}; and ${DECISION.wouldChangeIf[3]}. When a reviewer asks “why not the new hub?”, the answer is a weight and a threshold, not a preference.`,
            ],
            why: 'Seeing the instructor’s own trade defended link by link shows students that the decision record they wrote in Week 3 already holds their defense.',
            misconceptions: [{ claim: 'The best defense of a trade is the total score.', correction: 'The total depends on the weights. The defense is the screens, the margin and the sensitivity: where the ranking would flip.' }],
            transition: 'Risk positions and the roadmap are defended the same way.',
            timing: '3 min: 1 min claim and evidence, 1 min limits, 1 min the exit.',
          },
        },
        {
          id: 'w7s2-risk-roadmap',
          title: 'Defending a risk position and a roadmap',
          purpose: 'Extend the argument skeleton to risk acceptance and to the order of change.',
          minutes: 3,
          layout: 'two-column',
          body: [{ kind: 'bullets', items: ['Risk: the handling chosen, its owner and its trigger', 'Accepting a risk is a decision: say why and who watches', 'Show the residual level, not only the treatment'] }],
          aside: [{ kind: 'bullets', items: ['Roadmap: each increment serves a named gap', 'Order by evidence: maturity, triggers, dependencies', 'Defend the timing with what starts it, not a date'] }],
          sources: [R('R06c', '387'), R('R105', '531')],
          notes: {
            teach: [
              'SEBoK notes that a decision to proceed is sometimes made under great uncertainty, so a review should document the assumptions made and the risks identified (R06c p.387). A risk position is defended like a trade: the claim is the handling you chose; the evidence is the likelihood and consequence with their reasons from Week 3; the condition is the trigger you watch; and the owner is who watches it. Accepting a risk is a decision, so say why it is acceptable and who will notice if it changes.',
              'A roadmap is defended by its order. Each increment serves a named gap; its timing comes from maturity, triggers and dependencies, as Week 6 taught, not from a date or a wish. When a reviewer asks “why not autonomy now?”, AeroLink answers with the maturity evidence and the unknown that gates it.',
              'MITRE’s technology planning article gives the audience rule: communicate the plan with stakeholders and users in their operational terminology and non-technical language, because users won’t support what they can’t understand and can’t link to their mission (R105 p.531).',
            ],
            why: 'Students tend to defend risks by listing treatments; the skeleton makes them defend the residual position and its owner.',
            misconceptions: [{ claim: 'An accepted risk needs no defense, because nothing is being done about it.', correction: 'Acceptance is the decision that most needs defending: the reviewer must see why the residual level is tolerable and who watches its trigger.' }],
            transition: 'Who you are talking to.',
            timing: '3 min: 1.5 min risk, 1 min roadmap, 30 s MITRE.',
          },
        },
        {
          id: 'w7s2-audience',
          title: 'Briefing a mixed audience',
          purpose: 'Adapt the message for non-technical reviewers without losing the evidence.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s2-exec-brief',
            caption: 'One briefing, two depths: the decision on top, the evidence one step below, reachable when asked.',
            alt: 'A slide outline with a large top band labeled decision and conditions, in plain words. Below it three smaller panels labeled trade, risk and roadmap, each with an ID tag. A dashed arrow from a question mark at the side points down into the panels.',
          },
          body: [{ kind: 'bullets', items: ['Lead with the decision, in operational terms', 'One message per slide; IDs on the slide, jargon off it', 'Drill down on request, from summary to analysis'] }],
          sources: [R('R105', '531'), R('R43', '110')],
          notes: {
            teach: [
              'Lead with the decision and its conditions in the reviewer’s operational terms: trips a day, wait at the vertiport, what fails during a grid outage, not TRL and weights. MITRE’s rule from the last slide applies (R105 p.531).',
              'Keep the evidence one step away. The DoD guidebook notes that the ability to drill down quickly from overall trade-space views to the detailed analyses behind them is particularly useful to decision makers (R43 p.110). On your slides: one message each, the IDs visible, the jargon removed, and the package ready to open when a reviewer asks.',
            ],
            why: 'Reviewers in this course include non-specialists; a briefing pitched only at engineers fails the audience criterion of the rubric.',
            figure: 'Point at the top band, the decision in plain words, then at the panels below with their IDs, and at the dashed arrow: a question takes you down a level, never into a different story.',
            misconceptions: [{ claim: 'A non-technical audience needs less evidence.', correction: 'It needs the same evidence one step away and a plainer message on top.' }],
            transition: 'Now the other half of a review: the findings you receive.',
            timing: '2 min: 1 min lead with the decision, 1 min drill down.',
          },
        },
        {
          id: 'w7s2-rids',
          title: 'Review findings: the review item discrepancy (RID)',
          purpose: 'Teach the anatomy of a finding, which reviewers write and owners answer.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s2-rid-form',
            caption: 'The RID form: where, what and against which criterion, severity, and the proposed fix.',
            alt: 'A blank form card with labeled fields, top to bottom: RID number and reviewer; where, the ID or section; what is wrong; the criterion or source; severity, with two boxes, major and minor; proposed fix. Every field is empty.',
          },
          body: [{ kind: 'bullets', items: ['Where: the ID or section it concerns', 'What: what is wrong, against which criterion', 'Severity: major or minor', 'A proposed fix: what would close it', 'Course convention: the form on the Assessment page'] }],
          sources: [R('R06c', '388')],
          notes: {
            teach: [
              'A review item discrepancy, a RID, is one finding written by one reviewer. The fields are a course convention. Where: the ID or package section it concerns, so the owner can find it. What: what is wrong, against which criterion or source, because SEBoK’s reviewers analyze against pre-established criteria (R06c p.388). Severity: major if it would carry a defect into the Week 8 model or changes a decision, a requirement or a trace; minor if it is wording or a local inconsistency. And a proposed fix.',
              'SEBoK notes that participants usually analyze from different perspectives, consistent with their expertise (R06c p.388). So each reviewer reads the sections that match their own role: your Requirements & Compliance lead reads the other team’s requirements, your Architecture lead its architecture and interfaces.',
              'A good RID can be checked. “The requirements are vague” cannot. “REQ-SYS-004 has no verification criterion, against the rule that every system requirement names its method and criterion” can.',
            ],
            why: 'Students write findings that are opinions; the fields force a location, a criterion and a fix, which is what makes a finding actionable.',
            figure: 'Read the empty fields top to bottom; note that severity is a choice of two and that the criterion field is what turns an opinion into a finding.',
            misconceptions: [{ claim: 'A RID that only says something is unclear is still useful.', correction: 'Without a location and a criterion the owner cannot check it or fix it; it is a comment, not a finding.' }],
            transition: 'And how an owner answers one.',
            timing: '3 min: 1.5 min the fields, 1 min perspectives, 30 s a good and a bad example.',
          },
        },
        {
          id: 'w7s2-dispositions',
          title: 'Answering findings: accept, defer or reject',
          purpose: 'Teach the dispositions and the exit criteria the tool enforces.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s2-disposition-flow',
            caption: 'Every RID gets one of three dispositions, each with a response; accepted and deferred ones also get an owner.',
            alt: 'A box labeled RID on the left with three arrows. Accept leads to a box: response says what changes; owner. Defer leads to a box: response says when; owner; carried as an open item. Reject leads to a box: response gives the evidence. All three arrows end at a bar labeled exit criteria met.',
          },
          body: [{ kind: 'bullets', items: ['Accept, defer or reject, each with a response', 'An accepted or deferred RID has an owner', 'Reject only with evidence: an ID, a decision, a computation', 'Exit when every RID is dispositioned'] }],
          sources: [R('R06c', '388')],
          notes: {
            teach: [
              `Every RID gets one of three dispositions, a course convention. ${RID_DISPOSITIONS.map((d) => `${d.label}: ${d.means}`).join('. ')}.`,
              'Two rules make dispositions checkable. An accepted or deferred RID has an owner, because SEBoK’s completion stage implements the identified actions (R06c p.388), and an action with no owner is not implemented. And a rejection carries evidence: the record, the decision or the computation that answers the finding. A rejection without evidence is a refusal, and reviewers escalate refusals.',
              `The review closes when the exit criteria are met: ${EXIT_CRITERIA.join('; ').toLowerCase()}. Deferred RIDs go into Week 8 as open items, beside your deferred audit findings.`,
            ],
            why: 'Students either accept everything to please the reviewer or reject everything to protect the grade; the three dispositions with their evidence rules make both visible.',
            figure: 'Follow each arrow: accept and defer both end with an owner; reject ends with evidence; all three reach the exit bar.',
            misconceptions: [{ claim: 'Rejecting a reviewer’s finding loses marks.', correction: 'A rejection backed by evidence shows command of the package. A rejection with no evidence, or an acceptance of a wrong finding, is what loses marks.' }],
            transition: 'Watch me answer four RIDs raised against my own package.',
            timing: '3 min: 1 min the three dispositions, 1.5 min owner and evidence, 30 s exit.',
          },
        },
        {
          id: 'w7s2-defend-example',
          title: 'Worked example: four RIDs against the AeroLink package',
          purpose: 'Model dispositions of every kind on real findings, including a deferral the reviewer refuses to let slip again.',
          minutes: 3,
          layout: 'worked-example',
          figure: {
            id: 'w7s2-defend',
            caption: `${plural(RID_COUNTS.total, 'RID')} raised against AeroLink’s package and their dispositions: ${RID_COUNTS.accept} accepted, ${RID_COUNTS.defer} deferred, ${RID_COUNTS.reject} rejected. (FICTIONAL)`,
            alt: `A table of ${RID_COUNTS.total} rows with columns RID, where, severity and disposition: ${RIDS.map((r) => `${r.id}, ${r.location}, ${r.severity}, ${r.disposition}`).join('; ')}.`,
          },
          body: [{ kind: 'steps', items: RIDS.map((r) => ({ label: `${r.id} ${ridDispositionLabel(r.disposition)}`, text: `${r.location}: ${r.severity}` })) }],
          sources: [R('R13', '566'), R('R13', '565')],
          notes: {
            teach: [
              `Four RIDs from the peer team and the chair. ${RIDS[0].id}, on ${RIDS[0].location}, challenges one of my own deferrals: the parent link exists, so the tool counts the need as covered, but the requirement carries only part of it. That is requirement validation, the right requirements (R13 p.566), and it is accepted with an owner.`,
              `${RIDS[1].id}, on ${RIDS[1].location}, names a decision that was due before this review and was not made: deferred, re-dated in the open, with its owner. ${RIDS[2].id}, on ${RIDS[2].location}, asks me to divest the capacity excess: rejected, with the computation. ${RIDS[3]?.id ?? ''} catches open items whose owner is a week; TBX management names an owner of the work (R13 p.565), so it is accepted.`,
            ],
            why: 'Seeing all three dispositions on the instructor’s own package, including an accepted major finding, shows that a good review improves the package and that saying “you are right” is part of defending it.',
            figure: 'Read each row: where, severity, disposition. Point at the major finding that was accepted and the minor one that was rejected: severity does not decide the disposition, the evidence does.',
            workedSolution: RIDS.map((r) => `${r.id} (${r.severity}) at ${r.location}: ${ridDispositionLabel(r.disposition).toLowerCase()}${r.owner ? `, owner ${r.owner}` : ', with the evidence'}.`),
            examples: RIDS.map((r) => `Full text, ${r.id} (${r.from}): ${r.finding} Criterion: ${r.criterion}. ${ridDispositionLabel(r.disposition)}: ${r.response}`),
            misconceptions: [{ claim: 'The audit tool would have found every real defect.', correction: 'It found every structural gap. The partial requirement is a meaning gap, found only by a reviewer reading the need.' }],
            transition: 'Now the review. Here is how the next 44 minutes run.',
            timing: '3 min: 1 min the accepted major finding, 2 min the other three.',
          },
        },
      ],
    },
    // ============================================================================================ B. the review (44 min)
    {
      id: 'w7s2-review',
      title: 'The Phase I design review',
      slides: [
        {
          id: 'w7s2-lab-open',
          title: 'Opening the review: criteria, roles and timing',
          purpose: 'Confirm entry, roles and the timing plan before the first team.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s2-review-timeline',
            caption: `The review block for five teams: ${P5.slot}-minute slots of ${P5.briefing} minutes of briefing and ${P5.questions} of questions on the RIDs.`,
            alt: `A horizontal time bar of ${REVIEW_TEAM_MINUTES + 4} minutes: a 2-minute opening, five team slots of ${P5.slot} minutes, each split into briefing and questions, and a 2-minute close.`,
          },
          body: [{ kind: 'bullets', items: ['Criteria: the presentation rubric, known in advance', 'Owners present and answer for their sections', `Five teams: ${P5.briefing} min briefing, ${P5.questions} min questions`, `Four teams: ${P4.briefing} min briefing, ${P4.questions} min questions`] }],
          sources: [R('R06c', '387')],
          notes: {
            teach: [
              `Confirm entry: every team’s package arrived 24 hours ago and every reviewer has written findings. Read the criteria, the presentation rubric on the Assessment page, and the roles: owners present and answer; the peer team asks its RIDs; I chair; a recorder and a timekeeper from the peer team.`,
              `Timing is computed from the class size: ${REVIEW_TEAM_MINUTES} minutes shared by the teams. With five teams, ${P5.slot}-minute slots: ${P5.briefing} minutes of briefing and ${P5.questions} of questions. With four, ${P4.slot}-minute slots. A slot shorter than ${MIN_SLOT} minutes is a faculty decision: split the reviews across the Session 1 studio time, or have teams record their briefings in advance and keep the live time for the RIDs.`,
            ],
            why: 'Stating the criteria and the clock before the first team protects fairness: every team plays by the same rules.',
            figure: 'Point at the opening, the five slots with their split, and the close.',
            misconceptions: [{ claim: 'The questions are a courtesy after the presentation.', correction: 'The questions are where the RIDs are answered and where individual answers are scored; they are half of the slot by design.' }],
            transition: 'First team.',
            timing: '2 min.',
          },
        },
        {
          id: 'w7s2-lab-reviews',
          title: 'Team design reviews',
          purpose: 'Each team presents its package, defends one decision, walks one thread and answers its RIDs.',
          minutes: 40,
          layout: 'bullets',
          body: [{ kind: 'bullets', items: ['Briefing: summary, one decision defended, one thread walked', 'Questions: the reviewers’ RIDs, answered by their owners', 'Recorder: each RID raised and the first answer', 'Next team ready while the questions run'] }],
          sources: [],
          notes: {
            teach: [
              'Run the slots strictly. In each briefing the team gives its executive summary, defends its key decision with the argument skeleton and walks its thread through the package. In the questions the peer team raises its RIDs, starting with the major ones; the member who owns the section answers. Score the team criteria during the briefing and each member’s answers during the questions.',
              'The recorder writes each RID raised and the owner’s first answer; that sheet goes to the owning team, which dispositions every RID within three days.',
            ],
            why: 'A strict clock and owner-answered questions are what make the individual score fair and the review a review.',
            misconceptions: [{ claim: 'The team lead should answer every question.', correction: 'The owner of the section answers; the rubric scores each member on their own elements.' }],
            transition: 'Close the review.',
            timing: `40 min: the team slots (five teams × ${P5.slot} min, or four × ${P4.slot}).`,
          },
        },
        {
          id: 'w7s2-lab-close',
          title: 'Closing the review: what happens next',
          purpose: 'State the exit criteria and the hand-on to Week 8.',
          minutes: 2,
          layout: 'bullets',
          body: [{ kind: 'bullets', items: ['Dispositions of every RID: within 3 days', 'Accepted and deferred RIDs: owned', 'Close the package in the tool and export it again', 'Week 8 starts from the closed package'] }],
          sources: [R('R06c', '388')],
          notes: {
            teach: [
              'Read the exit criteria. Every RID gets a disposition with a response within three days; accepted and deferred ones get an owner; you enter them in the package tool, which then shows the review as closed, and you export and upload the closed package. Results are communicated to everyone who took part, as SEBoK’s completion stage requires (R06c p.388).',
              'Week 8 starts from the closed package (its import of the package file is still being built): your deferred findings and deferred RIDs are its first modeling tasks. Peer evaluation opens today.',
            ],
            why: 'A review is complete only when its actions are owned; stating the exit criteria closes the loop.',
            misconceptions: [{ claim: 'The review ends when the last team sits down.', correction: 'It ends when every finding is dispositioned and its actions owned: the exit criteria.' }],
            transition: 'End of the session and of Phase I.',
            timing: '2 min.',
          },
        },
        {
          id: 'w7s2-references',
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
      id: 'w7-lesson-defend',
      title: 'Presenting and defending an engineering decision',
      sources: [R('R43', '109'), R('R43', '110'), R('R56', '387'), R('R18', '473'), R('R06c', '387'), R('R105', '531')],
      blocks: [
        { kind: 'para', text: 'The DoD guidebook describes decision analysis as transforming a broadly stated decision opportunity into a traceable, defendable and actionable plan (R43 p.109), and reminds the analyst that the decision maker has full responsibility, authority and accountability for the decision (R43 p.110). MITRE’s guide adds what a design review looks at: how well the design team presents the linkage of its design to the system requirements, in documents, presentations and reviews, with the traceability matrix as an important device for communicating it (R56 p.387). A review therefore tests three things in a briefing: can every claim be traced, is the decision defended with its criteria and limits, and does it end in something the reviewer can decide and act on?' },
        { kind: 'heading', text: 'The structure of an engineering argument' },
        { kind: 'para', text: 'The DoD decision analysis steps run from identifying the problem and reviewing requirements and assumptions, through criteria with weights and rationale, tracked assumptions, alternatives assessed against the criteria, synthesis and sensitivity analysis, to a decision briefing with an action plan and a recommendation (R43 p.110). SEBoK recommends stating the recommendation as a clearly worded, actionable task list and keeping a comprehensive report for traceability (R18 p.473). From these the course takes a six-link argument skeleton, a course convention: the **claim**, the recommendation in one sentence; the **evidence**, cited by ID; the **criteria**, what better meant, with weights; the **conditions**, what must stay true; the **residual risk**; and **what would change it**.' },
        { kind: 'figure', slide: 'w7s2-argument' },
        { kind: 'table', header: ['Link', 'AeroLink’s Year-2 decision (FICTIONAL)'], rows: [['Claim', `${DECISION.recommended}: ${rec.text}`], ['Evidence', `${YEAR2.capacity} trips/day by month ${YEAR2.month}; one of ${plural(FEASIBLE.length, 'alternative')} passing every screen (${SCREENS.map((s) => s.name.toLowerCase()).join('; ')})`], ['Criteria', `${TOTALS[DECISION.recommended].toFixed(3)} against ${TOTALS[runnerUp].toFixed(3)} for ${runnerUp}, the next best`], ['Conditions', DECISION.conditions.join('; ')], ['Residual risk', DECISION.residualRisk.join('; ')], ['What would change it', DECISION.wouldChangeIf.join('; ')]], caption: 'AeroLink’s Year-2 decision as a six-link argument, from the Week 3 decision record.' },
        { kind: 'heading', text: 'Risk positions and the roadmap' },
        { kind: 'para', text: 'A decision to proceed is sometimes made under great uncertainty, so a review documents the assumptions made and the risks identified (R06c p.387). A risk position is defended like a trade: the claim is the handling chosen; the evidence is the likelihood and consequence with their reasons; the condition is the trigger watched; and the owner is who watches it. Accepting a risk is a decision and needs the most defense. A roadmap is defended by its order: each increment serves a named gap, and its timing comes from maturity, triggers and dependencies, never from a date alone.' },
        { kind: 'para', text: 'For a mixed audience, lead with the decision in operational terms: MITRE advises communicating with stakeholders and users in their operational terminology and non-technical language, because users won’t support what they can’t understand and can’t link to their mission (R105 p.531). Keep the evidence one step away: the DoD guidebook notes that the ability to drill down quickly from overall views to the detailed analyses behind them is particularly useful to decision makers (R43 p.110).' },
        { kind: 'figure', slide: 'w7s2-audience' },
      ],
    },
    {
      id: 'w7-lesson-rids',
      title: 'Review findings and their dispositions',
      sources: [R('R06c', '388'), R('R13', '565'), R('R13', '566')],
      blocks: [
        { kind: 'para', text: 'In the conduct of a review, participants analyze the information against pre-established criteria, usually from different perspectives consistent with their expertise, then meet to discuss the results and identify actions; once the exit criteria are met, results are communicated and actions implemented (R06c p.388). The course records each finding as a **review item discrepancy (RID)**, a course convention with five fields: where (the ID or package section it concerns), what is wrong and against which criterion, the severity, and a proposed fix, with the reviewer’s name.' },
        { kind: 'table', header: ['Severity', 'Means'], rows: SEVERITIES.map((s) => [s.label, s.means]), caption: 'RID severities (course convention).' },
        { kind: 'figure', slide: 'w7s2-rids' },
        { kind: 'para', text: 'Each reviewer reads the sections of the assigned package that match their own role, as SEBoK’s participants bring different perspectives: a requirements lead reads requirements, an architecture lead the architecture and interfaces. A good RID can be checked: it names an ID and the rule it breaks. A comment that something is unclear, with no location and no criterion, cannot be checked or fixed.' },
        { kind: 'table', header: ['Disposition', 'Means'], rows: RID_DISPOSITIONS.map((d) => [d.label, d.means]), caption: 'RID dispositions (course convention). Accepted and deferred RIDs need an owner; a rejection needs evidence.' },
        { kind: 'figure', slide: 'w7s2-dispositions' },
        { kind: 'para', text: `AeroLink’s package received ${plural(RID_COUNTS.total, 'RID')} (FICTIONAL; the RIDs and their dispositions are proposed instructor examples). The first challenges a deferral in the package: a Week 2 open item, a need its requirement carries only in part, was due in Week 5, slipped, and was dropped by Week 6; the audit carries it again, and the reviewer asks for the requirement now rather than a second deferral. The coverage layer counts the need as covered because the parent link exists: whether a requirement carries the whole need is requirement validation, the right requirements (R13 p.566). The last catches open items owned by a week instead of a person or role; TBX management identifies the owner of the work (R13 p.565).` },
        { kind: 'table', header: ['RID', 'Where', 'Finding and criterion', 'Severity', 'Disposition and response'], rows: RIDS.map((r) => [`${r.id} (${r.from})`, r.location, `${r.finding} Criterion: ${r.criterion}.`, r.severity, `${ridDispositionLabel(r.disposition)}: ${r.response}${r.owner ? ` Owner: ${r.owner}.` : ''}`]), caption: 'The RIDs raised against the AeroLink package and their dispositions, computed from the case data.' },
      ],
    },
    {
      id: 'w7-lesson-review-day',
      title: 'The review day, and what comes after',
      sources: [R('R06c', '387'), R('R06c', '388')],
      blocks: [
        { kind: 'para', text: `Session 2 holds the review meeting after 25 minutes of lecture. Roles are coordinated beforehand (R06c p.387): the owning team presents, every member answering for the sections they own; the peer team asks its RIDs; the instructor chairs; a recorder and a timekeeper come from the peer team. The ${REVIEW_TEAM_MINUTES} minutes of team time are shared equally, a course convention: with five teams, ${P5.slot}-minute slots of ${P5.briefing} minutes of briefing and ${P5.questions} of questions; with four, ${P4.slot}-minute slots of ${P4.briefing} and ${P4.questions}.` },
        { kind: 'figure', slide: 'w7s2-lab-open' },
        { kind: 'para', text: 'In the briefing the team gives its executive summary, defends its key decision with the argument skeleton and walks one thread through the package. In the questions the reviewers raise their RIDs, the major ones first, and the owner of each section answers. Rehearse both: time the briefing, and have each member answer one question on an element they own.' },
        { kind: 'para', text: `After the meeting the review is completed, not over: once the exit criteria are met, results are communicated and the actions implemented (R06c p.388). The exit criteria: ${EXIT_CRITERIA.join('; ').toLowerCase()}. Week 8 starts from the closed package, and the deferred findings and RIDs, each with its owner, become the first modeling tasks of Phase II.` },
      ],
    },
  ],
}
