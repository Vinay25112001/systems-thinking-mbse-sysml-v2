// Lab L3, the Week 3 Team Record: the full laboratory instructions, single source for the Week 3 Laboratory page and
// docs/lectures/week03/WEEK3_LAB_INSTRUCTIONS.md (labMarkdown(), written by `npm run lab:md`; week03Lab.test.ts fails
// when the file and this module differ). Mirrors src/content/lab/week02Lab.ts.
//
// Single sources: the minimums, the TRL scale, the risk scales, the handling options, the security and resilience
// vocabularies, the hard gates and advisories and the person-hours come from src/content/lectures/week03/labBrief.ts (the
// same module the lab tool, src/workbench/week3/record.ts, checks against); the in-class minutes are read from the
// Session 2 slides; the rubric rows from the rubric register (getRubric). "Taught in" references are computed from the
// registered lectures by slide id, with a fallback string while a lecture is being written. The week page module
// (week3Path.ts) may import the readings, deliverable and workload values exported here.
// Review status: new-pending-review. AeroLink is FICTIONAL and is the instructor's worked example; the record is
// always about the team's own enterprise.
import { WEEKS } from '../course'
import { formatCitation, type Citation } from '../readings'
import { getRubric } from '../rubrics'
import { getLecture } from '../lectures'
import { allSlides } from '../lectures/text'
import { PENDING, type NewText } from '../learn/types'
import {
  HANDLING, LAB3_MINIMUMS as MIN, LAB3_MINIMUMS_THREE as MIN3, LAB3_PERSON_HOURS, LAB3_TEAM_HOURS, RESILIENCE_OBJECTIVES, RISK_GATES, SECURITY_ASSET_CLASSES, TECH_GATES, TPM_GATES, TRADE_ADVISORIES, TRADE_GATES, WEEK3_PARTS,
  CHECKPOINT_CRITERIA,
} from '../lectures/week03/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
const W3 = WEEKS[2]
const round1 = (x: number) => Math.round(x * 10) / 10

export const LAB_REVIEW = PENDING
export const LAB_TITLE = 'Lab L3: technology readiness, risk, TPMs and a trade study for your enterprise'

// ------------------------------------------------------------------------------------------- taught in
/** “Session N, slide M ‘title’”, read from the registered lecture by slide id; the fallback is used only while the
 *  lecture is not registered or the slide id is missing. */
export function taughtIn(session: 1 | 2, slideId: string, fallback: { slide: number; title: string }): string {
  const l = getLecture(3, session)
  if (l) {
    const slides = allSlides(l)
    const i = slides.findIndex((s) => s.id === slideId)
    if (i >= 0) return `Session ${session}, slide ${i + 1} ‘${slides[i].title}’`
  }
  return `Session ${session}, slide ${fallback.slide} ‘${fallback.title}’`
}
const t1 = (id: string, slide: number, title: string) => taughtIn(1, id, { slide, title })
const t2 = (id: string, slide: number, title: string) => taughtIn(2, id, { slide, title })

// ------------------------------------------------------------------------------------------- in-class minutes, readings, deliverables
const labSection = getLecture(3, 2)?.sections.find((s) => s.id === 'w3s2-lab')
const labMin = (id: string, fallback: number) => labSection?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: labSection ? labSection.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w3s2-lab-brief', 3),
  plan: labMin('w3s2-lab-plan', 8),
  checkpoint: labMin('w3s2-lab-checkpoint', 9),
  close: labMin('w3s2-lab-close', 2),
  checkpointTeams: 5,
}

/** Essential readings for the week, narrowed to the pages the lecture teaches from (12 pages). */
export const LAB3_REQUIRED_READINGS: Citation[] = [
  { reading: 'R16', pages: '766–767' },
  { reading: 'R17', pages: '481–484' },
  { reading: 'R18', pages: '465–466' },
  { reading: 'R18', pages: '469' },
  { reading: 'R44', pages: '117' },
  { reading: 'R24', pages: '1208' },
  { reading: 'R25', pages: '1232' },
]
/** Further reading (not required; the basis of the graduate task). */
export const LAB3_EXTENSION_READINGS: Citation[] = [
  { reading: 'R60', pages: '524–526' },
  { reading: 'R61a', pages: '630–633' },
  { reading: 'R46', pages: '124–127' },
  { reading: 'R44', pages: '113–116' },
  { reading: 'R18', pages: '471–473' },
  { reading: 'R43', pages: '109–110' },
  { reading: 'R24', pages: '1203–1205' },
  { reading: 'R25', pages: '1229–1231' },
]
export const LAB3_DUE = 'Before Week 4, Session 1'
export const LAB3_WHERE = 'LMS assignment “Week 3 Team Record”'

// ------------------------------------------------------------------------------------------- workload
/** A three-person team at the reduced minimums (A21 provisional decision 4, pending confirmation): per-item work scales
 *  with its minimum (scores with alternatives × criteria), fixed work does not. */
export const LAB3_THREE_PERSON = (() => {
  const ratio: Record<(typeof LAB3_PERSON_HOURS)[number]['scales'], number> = {
    technologies: MIN3.technologies / MIN.technologies,
    risks: MIN3.risks / MIN.risks,
    tpms: MIN3.tpms / MIN.tpms,
    criteria: MIN3.criteria / MIN.criteria,
    scores: (MIN3.alternatives * MIN3.criteria) / (MIN.alternatives * MIN.criteria),
    fixed: 1,
  }
  const teamHours = round1(LAB3_PERSON_HOURS.reduce((a, t) => a + t.hours * ratio[t.scales], 0))
  return { teamHours, each: round1(teamHours / 3) }
})()
/** The four-person share of the lab, per student. */
export const LAB3_EACH = round1(LAB3_TEAM_HOURS / 4)

// ------------------------------------------------------------------------------------------- the lab at a glance
export const LAB_PURPOSE = n(
  'Apply the Week 3 method to your team’s own enterprise, never to AeroLink: assess the readiness of the technologies your requirements depend on, write and rate the risks (including at least one security risk and one resilience risk), keep the uncertainty register and the issue log, track the riskiest requirements with technical performance measures, and run a trade study on one real decision, with criteria traced to your measures of effectiveness, swing weights, a sensitivity check and a recommendation with its conditions. The result extends your Week 2 Team Record with Parts 12–14 and adds the TPMs to Part 11; the decision becomes the starting point of the Week 4 architecture, and in Phase II the risks become model metadata (Week 12) and the trade study an analysis case (Week 13).',
)

export const LAB_AT_A_GLANCE: { label: string; value: string }[] = [
  { label: 'Setting', value: 'Team (3 or 4 members); launched in class, completed out of class' },
  { label: 'In class', value: `Session 2, ${S2_LAB.total} min: the brief (${S2_LAB.brief} min), team work on the decision and the technologies (${S2_LAB.plan} min), the instructor checkpoint on each team’s decision and alternatives (${S2_LAB.checkpoint} min, up to ${S2_LAB.checkpointTeams} teams; the others post their decision statement and alternatives on the LMS and are answered within 48 hours) and the close (${S2_LAB.close} min)` },
  { label: 'Out of class', value: 'Seven days, by the procedure below' },
  { label: 'Due', value: `${LAB3_DUE}; one team member uploads both files` },
  { label: 'Grading', value: 'Formative: written feedback against the rubric rows below, returned before Week 4, Session 2' },
]

/** Inputs: the Week 2 record as returned, the approved frame, the teaching material, the readings and the tool. */
export const LAB_INPUTS: { text: NewText; cites?: Citation[]; to?: string }[] = [
  { text: n('Your Week 2 Team Record as returned with feedback, and its model-inputs file: the requirements, capabilities, scenarios, objectives, measures of effectiveness and performance, and the TBD/TBR register. Correct it first where the feedback asks.') },
  { text: n('The decision statement and alternatives approved at the Session 2 checkpoint (or answered on the LMS within 48 hours).') },
  { text: n('The Session 1 and Session 2 lectures, the detailed lesson and the worked examples: the readiness table, the risk register with its security and resilience risks, the TPM margins and planned profiles, and the trade study with its sensitivity and decision record.'), to: '/week/3/examples' },
  { text: n('The required readings for the week.'), cites: LAB3_REQUIRED_READINGS },
  { text: n('Further reading on maturity, risk statements, TPMs, decision analysis, resilience and security (not required this week; the basis of the graduate task).'), cites: LAB3_EXTENSION_READINGS },
  { text: n('The lab tool, which imports your Week 2 record, checks every part as you go, computes worst cases, margins, values, totals and reversal points with the lecture’s arithmetic, shares the record between teammates and exports it.'), to: '/week/3/lab/tool' },
]

/** Objectives this lab practices (course.ts IDs; W3.5 and W3.6 are proposed, pending faculty approval). */
export const PROPOSED_OBJECTIVES: { id: string; text: string }[] = [
  { id: 'W3.5', text: 'Distinguish assumptions, risks, opportunities, unknowns and issues, and link each register entry to the requirements, capabilities and scenarios it affects' },
  { id: 'W3.6', text: 'Define a technical performance measure for a risky requirement with threshold, objective, current estimate, contingency and margin, and interpret its trend' },
]
export const LAB_OBJECTIVES = [
  ...['W3.1', 'W3.2', 'W3.3', 'W3.4'].map((id) => ({ id, text: W3.objectives.find((x) => x.id === id)!.text, proposed: false })),
  ...PROPOSED_OBJECTIVES.map((o) => ({ id: o.id, text: o.text, proposed: true })),
]

const gatesOf = (g: readonly { short: string }[]) => g.map((x) => x.short).join('; ')
const handling = HANDLING.map((h) => h.label.toLowerCase()).join(', ')
const resilience = RESILIENCE_OBJECTIVES.map((r) => `${r.label.toLowerCase()} (${r.meaning})`).join(', ')
const assets = SECURITY_ASSET_CLASSES.map((a) => a.toLowerCase()).join('; ')

/** The engineering method (eight steps), with the lecture slides that teach each step. */
export const LAB_METHOD: { title: string; text: NewText; taught: string }[] = [
  {
    title: 'Technology readiness assessment',
    text: n(`Choose the enabling technologies your requirements depend on. For each: what it does for the enterprise, its benefits and limitations, a TRL read against the scale wording (the environment words decide it), and its basis: cited evidence, or a labeled assumption in the register with an owner and a validation action. Mark each critical or not, link the requirements and capabilities it affects, and give every critical technology below TRL 6 a maturity risk. Lead the summary with the lowest critical TRL, and say what the TRL does not tell you (integration, producibility). Hard gates: ${gatesOf(TECH_GATES)}.`),
    taught: [t1('w3s1-tra-purpose', 5, 'What a readiness assessment is for'), t1('w3s1-trl-scale', 6, 'The scale and what it does not tell you'), t1('w3s1-maturity-practice', 7, 'Maturity in practice'), t1('w3s1-evidence-rule', 8, 'Evidence or labeled assumption'), t1('w3s1-worked-trl', 9, 'Worked example I')].join('; '),
  },
  {
    title: 'Risk statements and ratings',
    text: n(`Hold a risk workshop (each member brings two risks). Write each risk as condition (what is known today), “if” (the uncertain event) and “then” (the consequences, naming what is harmed), with no mitigation in the statement. Rate likelihood and consequence on the course scales and write the reason for each rating. Rank by the matrix level and then by consequence; never multiply the two ordinal numbers as if they were quantities. Include at least ${MIN.securityRisks} security risk (an attack, misuse or fault that causes loss of an asset: ${assets}) and at least ${MIN.resilienceRisks} resilience risk (an adversity that degrades the delivered capability).`),
    taught: [t1('w3s1-risk-process', 10, 'The risk process'), t1('w3s1-risk-statement', 11, 'Writing a risk'), t1('w3s1-rating', 12, 'Rating risks'), t1('w3s1-matrix-limits', 13, 'What the matrix cannot say'), t1('w3s1-security-resilience', 15, 'Security and resilience risks')].join('; '),
  },
  {
    title: 'Handling, owner, trigger and monitoring',
    text: n(`Evaluate all the handling options (${handling}) before choosing one; record the owner, the treatment (unless the risk is accepted or watched) and the trigger or watch item that tells the owner to act. For a security or resilience risk, say whether the treatment helps the enterprise ${resilience}. Hard gates for every risk: ${gatesOf(RISK_GATES)}.`),
    taught: [t1('w3s1-handling', 14, 'Handling options'), t1('w3s1-worked-risk', 16, 'Worked example II'), t1('w3s1-monitoring-pitfalls', 17, 'Monitoring, pitfalls and good practice')].join('; '),
  },
  {
    title: 'The register, linked',
    text: n(`Keep the assumptions, risks, opportunities and unknowns distinct and actionable: every assumption with an owner and a validation action, at least ${MIN.opportunities} opportunity with its action, and every Week 2 unknown (TBD/TBR) still in the register until it is closed. Link each entry to the requirements, capabilities, scenarios, technologies or TPMs it affects. Anything that has already happened goes in the issue log, kept apart from the risks.`),
    taught: [t1('w3s1-five-kinds', 4, 'Five kinds of entry'), t1('w3s1-register-linked', 18, 'Worked example III')].join('; '),
  },
  {
    title: 'Technical performance measures',
    text: n(`For the riskiest requirements, define TPMs: the requirement tracked, the measure of performance it derives from, unit and sense, threshold, objective, current best estimate, contingency, and the basis of the estimate. The worst case is the estimate moved by the contingency toward the threshold; the margin is the threshold minus the worst case. Plan a value at two or more future review points and link the risk the TPM watches; a TPM whose worst case is already outside the threshold must link a risk, or an issue if the breach is certain (a TPM breach is a risk). Hard gates: ${gatesOf(TPM_GATES)}.`),
    taught: [t1('w3s1-tpm-hierarchy', 19, 'From MOE and MOP to TPM'), t1('w3s1-tpm-margin', 20, 'Current estimate, contingency, worst case and margin'), t1('w3s1-worked-tpm', 21, 'Worked example IV'), t1('w3s1-chain', 22, 'One chain through all three instruments')].join('; '),
  },
  {
    title: 'Frame the trade study',
    text: n(`Start from the approved decision statement, traced to a requirement or objective in your record. List at least ${MIN.alternatives} genuinely different alternatives including the baseline (status quo). Choose at least ${MIN.criteria} criteria, each traced to a measure of effectiveness (or an objective), non-overlapping, with cost and risk handled explicitly. Treat security as a must-meet screen where a minimum expectation applies, and treat any requirement the decision must meet (such as a capacity requirement) the same way; include resilience as a criterion where the decision changes how the enterprise withstands or recovers from a disruption.`),
    taught: [t2('w3s2-decision-management', 3, 'What decision management is for'), t2('w3s2-framing', 4, 'Framing the decision, objectives and measures'), t2('w3s2-worked-frame', 8, 'Worked example I'), t2('w3s2-worked-criteria', 9, 'Worked example II')].join('; '),
  },
  {
    title: 'Value functions, swing weights, scores and computation',
    text: n('For each criterion set a walk-away point (value 0) and a stretch goal (value 1) and document the value function. Elicit swing weights: rank the swings from walk-away to stretch, give the most valuable swing 100 points and the others points relative to it, write the rationale naming the range, and normalize the points to weights that sum to one. Score every alternative on every criterion with its source, convert scores to values and compute the additive value; keep the calculation reproducible. An alternative that fails a screen, or scores beyond a walk-away point on any criterion, is walked away from: it is not ranked, and the tool leaves it out of the sensitivity.'),
    taught: [t2('w3s2-value-functions', 5, 'Value functions'), t2('w3s2-swing-weights', 6, 'Swing weights'), t2('w3s2-additive-model', 7, 'Alternatives and the additive value model'), t2('w3s2-worked-scores', 10, 'Worked example III')].join('; '),
  },
  {
    title: 'Sensitivity, recommendation and derived requirements',
    text: n(`Vary each weight with the others rescaled in proportion and find where the top rank changes among the alternatives that pass every screen (a reversal to a screened-out alternative is no reversal); state the reversal point of the most heavily weighted criterion, with its number, and what it means. If you recommend an alternative that is not ranked first, give the reason in the conditions. Check the pitfalls: anchors fixed rather than taken from the alternatives, compensation hiding a walk-away score, double counting. Recommend an alternative that passes every screen and lies inside every walk-away point, with its conditions, its residual risk and what would change the decision, and list any derived requirements the decision creates. Hard gates: ${gatesOf(TRADE_GATES)}. Advisories: ${gatesOf(TRADE_ADVISORIES)}.`),
    taught: [t2('w3s2-worked-sensitivity', 11, 'Worked example IV'), t2('w3s2-weighted-sum-pitfalls', 12, 'Weighted-sum pitfalls'), t2('w3s2-worked-decision', 13, 'Worked example V')].join('; '),
  },
]

/** The procedure, step by step: when, who (lead role) and the output. */
export const LAB_PROCEDURE: { step: string; when: string; who: string; output: string; detail: NewText }[] = [
  { step: 'Decision, alternatives and technology list', when: `In class, Session 2 (${S2_LAB.plan} min)`, who: 'Whole team', output: 'Draft frame', detail: n('From the members’ preparation, choose the technologies to assess and one decision that matters to a Week 1 stakeholder and traces to a Week 2 requirement or objective; draft the decision statement (“How should [enterprise] [achieve objective X] given [constraint]?”) and at least three genuinely different alternatives including the baseline.') },
  { step: 'Checkpoint decision', when: `In class, Session 2 (${S2_LAB.checkpoint} min, up to ${S2_LAB.checkpointTeams} teams)`, who: 'Architecture lead presents', output: 'Approved frame', detail: n(`Read the decision statement and the alternatives and name the measure of effectiveness behind the most important criterion. The instructor checks that ${CHECKPOINT_CRITERIA.join('; that ')}, and decides approve, approve with conditions, or revise with a reason. Teams not seen in class post the frame on the LMS and are answered within 48 hours.`) },
  { step: 'Technology readiness assessment', when: 'Days 1–2', who: 'AI & Data Management (one technology per member where possible)', output: 'Part 12', detail: n(`At least ${MIN.technologies} technologies (a three-person team: ${MIN3.technologies}), each with a TRL and its basis; the lowest critical TRL named.`) },
  { step: 'Risk workshop and ratings', when: 'Days 2–3', who: 'Verification & Validation', output: 'Part 13 (risks)', detail: n(`Each member brings two risks; at least ${MIN.risks} that pass every hard gate (a three-person team: ${MIN3.risks}), with at least one security and one resilience risk.`) },
  { step: 'Register and links', when: 'Day 3', who: 'Requirements & Compliance', output: 'Part 13 (register, issue log)', detail: n('Assumptions with validation actions, the opportunity, every Week 2 unknown carried, links to the affected items, issues in the issue log.') },
  { step: 'TPMs', when: 'Days 3–4', who: 'Verification & Validation', output: 'Part 11 updated', detail: n(`At least ${MIN.tpms} TPMs (a three-person team: ${MIN3.tpms}) on the riskiest requirements, with worst case, margin and a planned profile.`) },
  { step: 'Criteria, value functions and swing weights', when: 'Day 4', who: 'Architecture', output: 'Part 14 (frame)', detail: n(`At least ${MIN.criteria} criteria (a three-person team: ${MIN3.criteria}) traced to measures of effectiveness, each with anchors, swing points and a rationale; screens if a minimum expectation applies.`) },
  { step: 'Scores, computation and sensitivity', when: 'Day 5', who: 'AI & Data Management', output: 'Part 14 (computation)', detail: n('Every alternative scored with its source; values, totals and ranking; the reversal point of every criterion among the alternatives that pass the screens, read for the most heavily weighted one.') },
  { step: 'Recommendation, derived requirements and AI usage statement', when: 'Day 6', who: 'Whole team; AI & Data Management (statement)', output: 'Part 14 (decision record), Part 6 updated', detail: n('The recommendation with conditions, residual risk and what would change it; derived requirements; the AI usage statement, with every AI-suggested technology or risk tagged AI-suggested-reviewed. The statement is required even if no AI tool was used.') },
  { step: 'Integration review, export and upload', when: 'Day 7', who: 'Verification & Validation', output: 'Submission', detail: n('Review the whole record for consistency (a TPM breach is a risk, a realized risk is an issue, the decision’s residual risks are in the register), export the Markdown record and the JSON model inputs from the lab tool after the last change, and upload both files.') },
]

export const LAB_OUTPUT_FILES = [
  { name: 'team-NN-week3-record.md', what: 'Parts 11–14 and the updated Part 6 as headed Markdown, ready to read, with the computed worst cases, margins, values, totals and reversal points' },
  { name: 'team-NN-week3-model-inputs.json', what: 'The same data with IDs, links, the computed values, the check results and the SysML v2 element each item will seed (Phase II)' },
]

const both = (four: string, three: string) => `team of 4: ${four}; team of 3: ${three}`
const part = (id: (typeof WEEK3_PARTS)[number]['id']) => {
  const p = WEEK3_PARTS.find((x) => x.id === id)!
  return `${p.n}. ${p.title}`
}
/** The parts the Week 3 work adds to the Team Record, with the evidence, the minimum and how each is judged. */
export const LAB_PARTS: { heading: string; evidence: NewText; minimum: string; judged: string }[] = [
  { heading: '6. AI usage statement (updated)', evidence: n('Tool, purpose, prompts, what was accepted or rejected and why, with AI-suggested technologies and risks tagged.'), minimum: 'At least 12 words; present even if no AI tool was used', judged: 'RB-12.1–12.3' },
  { heading: part('tpm'), evidence: n('TPMs on the riskiest requirements: requirement tracked, measure of performance, unit and sense, threshold, objective, current best estimate, contingency, worst case, margin, basis, related risk and a planned profile.'), minimum: both(`${MIN.tpms} TPMs`, `${MIN3.tpms} TPM`) + '; only TPMs that pass every hard gate count', judged: 'RB-4.1–4.3 (the TPMs)' },
  { heading: part('readiness'), evidence: n('Each technology with what it does, benefits, limitations, a TRL and its basis (evidence or labeled assumption), critical or not, the items it affects and, where needed, its maturity risk; the lowest critical TRL.'), minimum: both(`${MIN.technologies} technologies`, `${MIN3.technologies} technologies`) + '; only technologies that pass every hard gate count', judged: 'RB-5.1, RB-5.2' },
  { heading: part('register'), evidence: n('Risks in condition–if–then form with ratings and reasons, handling, owner, treatment, trigger and links; assumptions with validation actions; opportunities; every Week 2 unknown; the issue log kept apart.'), minimum: both(`${MIN.risks} risks`, `${MIN3.risks} risks`) + `; at least ${MIN.securityRisks} security and ${MIN.resilienceRisks} resilience risk among those that count; at least ${MIN.opportunities} opportunity`, judged: 'RB-5.3–5.5' },
  { heading: part('trade'), evidence: n('Decision statement and trace; alternatives with the baseline; criteria traced to measures of effectiveness with anchors, swing points, weights and rationale; screens; scores, values, totals and ranking; reversal points and their reading; the recommendation with conditions, residual risk, what would change it and derived requirements.'), minimum: both(`${MIN.alternatives} alternatives and ${MIN.criteria} criteria`, `${MIN3.alternatives} alternatives and ${MIN3.criteria} criteria`) + '; every trade-study hard gate passed', judged: 'RB-6.1–6.6' },
]

/** Rubric rows applied this week, read from the rubric register, never retyped. */
export const LAB_RUBRIC_ROWS: [string, string][] = [
  ['RB-4', '4.1'], ['RB-4', '4.2'], ['RB-4', '4.3'],
  ['RB-5', '5.1'], ['RB-5', '5.2'], ['RB-5', '5.3'], ['RB-5', '5.4'], ['RB-5', '5.5'],
  ['RB-6', '6.1'], ['RB-6', '6.2'], ['RB-6', '6.3'], ['RB-6', '6.4'], ['RB-6', '6.5'], ['RB-6', '6.6'],
  ['RB-12', '12.1'], ['RB-12', '12.2'], ['RB-12', '12.3'],
]
export const LAB_RUBRIC_NOTE = n(
  'The rows of the course rubric this record is judged against, quoted from the register. RB-4.1–4.3 apply to the TPMs this week (the MOEs and MOPs were judged in Week 2). RB-5.1 reads “specific to AeroLink” in the register: for your team it means specific to your own enterprise. RB-5.5 applies to links to requirements, capabilities and scenarios; links to the architecture follow in Weeks 4–5. RB-6.4 accepts the lab tool’s exported record as the reproducible workbook. In RB-6.5, “uncertainty in scores considered” is met by the sensitivity reading for undergraduates and by the Monte Carlo task for graduate students. RB-12.3 applies to the AI-suggested technologies and risks; its SysML part applies from Week 8.',
)
export const RUBRIC_LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export function rubricRow(id: string, criterion: string): string[] {
  const p = getRubric(id).parts.find((x) => x.type === 'table')
  const r = p && p.type === 'table' ? p.rows.find((x) => x[0] === criterion) : undefined
  if (!r) throw new Error(`${id} has no criterion ${criterion}`)
  return r
}

export const LAB_SUBMISSION = {
  format: n('Export two files from the lab tool after the last change: team-NN-week3-record.md (Parts 11–14 and the updated Part 6 as headed Markdown) and team-NN-week3-model-inputs.json (the same data with IDs, links, computed values, check results and the SysML v2 element each item will seed). Both state the record’s status.'),
  where: n(`One member uploads both files to the ${LAB3_WHERE} before Week 4, Session 1.`),
  grading: n('Formative: written feedback against the rubric rows above, returned before Week 4, Session 2.'),
  aiUse: 'AI tools may help brainstorm technologies and risks and check the arithmetic; tag each AI-suggested technology or risk AI-suggested-reviewed and say in the AI usage statement what the tool suggested and what you changed or rejected. The team owns every rating and every weight.',
  graduate: n('Graduate students also give lower, nominal and upper scores for the two most uncertain measures of the team’s trade study, run at least 1,000 Monte Carlo trials, report the probability that the recommended alternative ranks first and say whether the recommendation stands (one page, individual).'),
}

export const LAB_TOOL = n(
  'The lab tool imports your team’s Week 2 model-inputs file and adds Parts 11–14. It carries your Week 2 unknowns and assumptions into the register, shows the TRL wording, the likelihood bands and the consequence anchors as you rate, and computes the worst case and margin of every TPM, the weights, values, totals and ranking of the trade study, and the reversal point of every criterion, with the same arithmetic the lecture uses. Each technology, risk, TPM and the trade study lists its hard gates, each marked pass or fails, and its advisories, labeled advisory, which never stop an entry counting; only entries that pass every hard gate count toward the minimums. One member can enter the record and export the JSON file; teammates import it to continue the same record. Everything is saved in your browser only, so export after every working session.',
)

/** Workload: the lab's share of the week. */
export const LAB_WORKLOAD: { activity: string; hours: number }[] = [
  { activity: `Lab launch in class (Session 2, ${S2_LAB.total} min; inside the class hours)`, hours: 0 },
  { activity: `Lab L3 out of class: your share of about ${LAB3_TEAM_HOURS.toFixed(1)} person-hours (team of four)`, hours: LAB3_EACH },
]
export const LAB_WORKLOAD_NOTE = n(
  `About ${LAB3_TEAM_HOURS.toFixed(1)} person-hours of out-of-class work for a team of four (${LAB3_PERSON_HOURS.map((t) => `${t.task} ${t.hours.toFixed(1)}`).join('; ')}), so about ${LAB3_EACH.toFixed(1)} h each. A team of three works to the reduced minimums (${MIN3.technologies} technologies, ${MIN3.risks} risks, ${MIN3.tpms} TPM, ${MIN3.criteria} criteria): about ${LAB3_THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${LAB3_THREE_PERSON.each.toFixed(1)} h each. Workload proportional to team size is pending faculty confirmation. See the workload table on the week page.`,
)

// ------------------------------------------------------------------------------------------- Markdown
const cite = (c: Citation) => formatCitation(c)
const md = (s: string) => s.replace(/\|/g, '\\|')

/** The same instructions as the Laboratory page, as Markdown (docs/lectures/week03/WEEK3_LAB_INSTRUCTIONS.md). */
export function labMarkdown(): string {
  const L: string[] = []
  const table = (head: string[], rows: string[][]) => {
    L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`)
    for (const r of rows) L.push(`| ${r.map((c) => md(c).replace(/\n/g, ' ')).join(' | ')} |`)
    L.push('')
  }
  L.push(`# Week 3 ${LAB_TITLE}`, '')
  L.push('> Generated from `learning-studio/src/content/lab/week03Lab.ts` by `npm run lab:md`; the Laboratory page (`#/week/3/lab`) renders the same source. Do not edit this file by hand. Review status: new-pending-review.', '')
  L.push(`Week 3 — ${W3.title}. AeroLink is the instructor’s FICTIONAL worked example; this record is about your team’s own enterprise.`, '')
  L.push('## Purpose', '', LAB_PURPOSE.text, '')
  table(['', ''], LAB_AT_A_GLANCE.map((x) => [`**${x.label}**`, x.value]))
  L.push('## Inputs', '')
  for (const i of LAB_INPUTS) L.push(`- ${i.text.text}${i.cites ? ` ${i.cites.map(cite).join('; ')}.` : ''}`)
  L.push('', '## Objectives', '')
  for (const o of LAB_OBJECTIVES) L.push(`- **${o.id}** ${o.text}${o.proposed ? ' *(proposed, pending faculty approval)*' : ''}`)
  L.push('', '## Engineering method', '')
  LAB_METHOD.forEach((m, i) => L.push(`${i + 1}. **${m.title}.** ${m.text.text} *(Taught in: ${m.taught}.)*`))
  L.push('', '## Procedure', '')
  table(['Step', 'When', 'Who (lead role)', 'Output', 'What to do'], LAB_PROCEDURE.map((p, i) => [`${i + 1}. ${p.step}`, p.when, p.who, p.output, p.detail.text]))
  L.push('## Expected outputs', '', 'Two files, exported from the lab tool after the last change:', '')
  for (const f of LAB_OUTPUT_FILES) L.push(`- \`${f.name}\`: ${f.what}.`)
  L.push('', 'The Week 3 work adds three parts to the Team Record and updates two. The minimum is the completeness check the lab tool and the instructor apply first.', '')
  table(['Part', 'Evidence required', 'Minimum (completeness check)', 'Judged by'], LAB_PARTS.map((p) => [p.heading, p.evidence.text, p.minimum, p.judged]))
  L.push('## Grading rubric rows', '', LAB_RUBRIC_NOTE.text, '')
  const label = (rb: string, r: string[]) => `${rb}.${r[0].split('.')[1]} ${r[1]}`
  table(['Criterion', ...RUBRIC_LEVELS], LAB_RUBRIC_ROWS.map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [label(rb, r), ...r.slice(2, 6)]
  }))
  L.push('## Submission', '')
  L.push(`- **Format.** ${LAB_SUBMISSION.format.text}`, `- **Where and when.** ${LAB_SUBMISSION.where.text}`, `- **How it is graded.** ${LAB_SUBMISSION.grading.text}`, `- **AI use.** ${LAB_SUBMISSION.aiUse}`, `- **Graduate task.** ${LAB_SUBMISSION.graduate.text}`, '')
  L.push('## The lab tool', '', LAB_TOOL.text, '')
  L.push('## Workload', '')
  table(['Activity', 'Hours per student'], LAB_WORKLOAD.map((w) => [w.activity, w.hours ? w.hours.toFixed(1) : 'in class']))
  L.push(LAB_WORKLOAD_NOTE.text, '')
  return L.join('\n')
}
