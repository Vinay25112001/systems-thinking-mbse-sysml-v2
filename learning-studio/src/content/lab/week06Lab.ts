// Lab L6, the Week 6 Team Record: the full laboratory instructions, single source for the Week 6 Laboratory page and
// docs/lectures/week06/WEEK6_LAB_INSTRUCTIONS.md (labMarkdown(), written by `node scripts/build-lab-md.mjs 6`;
// week06Lab.test.ts fails when the file and this module differ). Mirrors src/content/lab/week05Lab.ts.
//
// Single sources: the minimums, the horizons, the technology statuses, the development approaches, the hard gates and
// advisories with their basis and the student-visible phrase each rests on, the part rules and the person-hours come from
// src/content/lectures/week06/labBrief.ts (the same module the lab tool, src/workbench/week6/record.ts, checks against);
// the gate-justification table (GATE_TABLE) is generated from those rows for the lab page and the milestone report, and
// names, for every hard gate, the slide (number and title, computed from the registered lecture) where a student can read
// the sentence that makes a failure a real defect; the in-class minutes are read from the Session 2 slides; the rubric
// rows from the rubric register (getRubric), with the register's internal source codes removed for students.
// Review status: new-pending-review. AeroLink is FICTIONAL and is the instructor's worked example; the record is always
// about the team's own enterprise.
import { WEEKS } from '../course'
import { formatCitation, type Citation } from '../readings'
import { getRubric } from '../rubrics'
import { getLecture } from '../lectures'
import { allSlides } from '../lectures/text'
import { PENDING, type NewText } from '../learn/types'
import {
  APPROACHES, AROU_ADVISORIES, AROU_GATES, BASELINE_GATES, GAP_GATES, HORIZONS, IMPACT_GATES, INCREMENT_ADVISORIES, INCREMENT_GATES, LAB6_MINIMUMS as MIN, LAB6_MINIMUMS_THREE as MIN3, LAB6_PERSON_HOURS, LAB6_TEAM_HOURS, LANES, MATURE_TRL,
  PART_RULES, REVIEW_GATES, TECH_ADVISORIES, TECH_GATES, TECH_STATUSES, UNKNOWN_ADVISORIES, UNKNOWN_GATES, WEEK6_PARTS, WEEK6_PREFIXES, EMPTY_ANSWER_RULE, type Taught,
} from '../lectures/week06/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
const W6 = WEEKS[5]
const round1 = (x: number) => Math.round(x * 10) / 10

export const LAB_REVIEW = PENDING
export const LAB_TITLE = 'Lab L6: the enterprise evolution roadmap for your enterprise'

// ------------------------------------------------------------------------------------------- taught in
/** “Session N, slide M ‘title’”, read from the registered lecture by slide id (the Week 6 lectures are registered). */
export function taughtIn(session: 1 | 2, slideId: string): string {
  const l = getLecture(6, session)
  const slides = l ? allSlides(l) : []
  const i = slides.findIndex((s) => s.id === slideId)
  return i >= 0 ? `Session ${session}, slide ${i + 1} ‘${slides[i].title}’` : `Session ${session}, slide ${slideId}`
}
const t = (session: 1 | 2, ...ids: string[]) => ids.map((id) => taughtIn(session, id)).join('; ')
/** Where a student reads a gate's basis: the slide and the exact phrase. */
export const taughtText = (x: Taught) => `${taughtIn(x.session, x.slide)}: “${x.phrase}”`

// ------------------------------------------------------------------------------------------- in-class minutes, readings
const labSection = getLecture(6, 2)?.sections.find((s) => s.id === 'w6s2-lab')
const labMin = (id: string, fallback: number) => labSection?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: labSection ? labSection.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w6s2-lab-brief', 3),
  baseline: labMin('w6s2-lab-baseline', 10),
  check: labMin('w6s2-lab-check', 7),
  close: labMin('w6s2-lab-close', 2),
  checkTeams: 5,
}

/** Essential readings for the week, narrowed to the pages the lecture teaches from (17 pages). */
export const LAB6_REQUIRED_READINGS: Citation[] = [
  { reading: 'R12', pages: '860–863' },
  { reading: 'R105', pages: '528–531' },
  { reading: 'R106', pages: '582–584' },
  { reading: 'R107', pages: '447–449' },
  { reading: 'R26', pages: '682–684' },
]
/** Further reading (not required; the basis of the graduate memo and the security and resilience part). */
export const LAB6_EXTENSION_READINGS: Citation[] = [
  { reading: 'R108', pages: '391–393' },
  { reading: 'R106', pages: '585' },
  { reading: 'R60', pages: '523–526' },
  { reading: 'R46', pages: '126' },
  { reading: 'R13', pages: '565' },
  { reading: 'R24', pages: '1203–1210' },
  { reading: 'R25', pages: '1231–1234' },
]
export const LAB6_DUE = 'Before Week 7, Session 1'
export const LAB6_WHERE = 'LMS assignment “Week 6 Team Record”'

// ------------------------------------------------------------------------------------------- workload
/** A three-person team at the reduced minimums (pending faculty confirmation): per-item work scales with its minimum
 *  (increments with the non-baseline ones), fixed work does not. */
export const LAB6_THREE_PERSON = (() => {
  const ratio: Record<(typeof LAB6_PERSON_HOURS)[number]['scales'], number> = {
    gaps: MIN3.gaps / MIN.gaps,
    technologies: MIN3.technologies / MIN.technologies,
    increments: (MIN3.increments - 1) / (MIN.increments - 1),
    unknowns: MIN3.unknowns / MIN.unknowns,
    fixed: 1,
  }
  const teamHours = round1(LAB6_PERSON_HOURS.reduce((a, x) => a + x.hours * ratio[x.scales], 0))
  return { teamHours, each: round1(teamHours / 3) }
})()
export const LAB6_EACH = round1(LAB6_TEAM_HOURS / 4)

// ------------------------------------------------------------------------------------------- the lab at a glance
export const LAB_PURPOSE = n(
  'Apply the Week 6 method to your team’s own enterprise, never to AeroLink: write the as-is from your Week 4 and Week 5 views; find the capability gaps and excesses over near-, mid- and far-term horizons whose lengths you justify; build a technology plan from your Week 3 readiness assessment, with an insertion point or a reason for every technology; plan increments with their content, the gap each serves, an observable entry trigger, dependencies, an off-ramp wherever an immature technology is inserted, the development and transition approaches, and the security and resilience change each makes; record the known unknowns that gate them; trace one increment’s impact across your Weeks 1–5 IDs; and review the Phase I baseline week by week for Week 7. The result extends your Week 5 Team Record with Parts 23–27. Week 7 puts the roadmap into the Systems Thinking Engineering Package, Week 13 may reuse your triggers as analysis cases, and Week 14 models one increment as a change to your SysML v2 model.',
)

export const LAB_AT_A_GLANCE: { label: string; value: string }[] = [
  { label: 'Setting', value: 'Team (3 or 4 members); launched in class, completed out of class' },
  { label: 'In class', value: `Session 2, ${S2_LAB.total} min: the brief (${S2_LAB.brief} min), the team’s as-is and top three gaps (${S2_LAB.baseline} min), the instructor check of each team’s first increment and trigger (${S2_LAB.check} min, up to ${S2_LAB.checkTeams} teams; the others post their three lines on the LMS and are answered within 48 hours) and the close (${S2_LAB.close} min)` },
  { label: 'Out of class', value: 'Seven days, by the procedure below' },
  { label: 'Due', value: `${LAB6_DUE}; one team member uploads the files` },
  { label: 'Grading', value: 'Formative: written feedback against the rubric rows below, returned before Week 7, Session 2' },
]

export const LAB_INPUTS: { text: NewText; cites?: Citation[]; to?: string }[] = [
  { text: n('Your Week 5 Team Record as returned with feedback, and its model-inputs file: it carries your needs, capabilities, requirements, risks and TPMs, your physical elements, functions, information items, AI cards and decisions, your components and interfaces with their standards, and your change request. Correct it first where the feedback asks.') },
  { text: n('Optional but advised: your Week 3 model-inputs file, so that the tool can compare each TRL with your readiness assessment and continue your TECH and U numbering (the Week 5 file does not carry the technology table).') },
  { text: n('The Session 1 and Session 2 lectures, the detailed lesson and the worked examples: the AeroLink gaps, technology plan, increments, transition order, security and resilience changes, known unknowns, impact list and baseline review.'), to: '/week/6/examples' },
  { text: n('The required readings for the week.'), cites: LAB6_REQUIRED_READINGS },
  { text: n('Further reading on development approaches, technical maturity, off-ramps, known unknowns, resilience and security (not required; the basis of the graduate memo).'), cites: LAB6_EXTENSION_READINGS },
  { text: n('The lab tool, which imports your Week 5 record, checks every part as you go, draws the roadmap grid and its text equivalent, lists the candidates an increment’s links reach for the impact list, shares the record between teammates and exports it.'), to: '/week/6/lab/tool' },
]

/** Objectives this lab practices (course.ts IDs; W6.4–W6.6 are proposed, pending faculty approval). */
export const PROPOSED_OBJECTIVES: { id: string; text: string }[] = [
  { id: 'W6.4', text: 'Distinguish an enterprise evolution roadmap from a development approach, and justify the development approach chosen for each increment' },
  { id: 'W6.5', text: 'Record known unknowns with impact, information need, mitigation and owner, and connect each to the increment it gates' },
  { id: 'W6.6', text: 'Plan the security and resilience change of each increment, including the risks that exist only during its transition' },
]
export const LAB_OBJECTIVES = [
  ...['W6.1', 'W6.2', 'W6.3'].map((id) => ({ id, text: W6.objectives.find((x) => x.id === id)!.text, proposed: false })),
  ...PROPOSED_OBJECTIVES.map((o) => ({ id: o.id, text: o.text, proposed: true })),
]

const gatesOf = (g: readonly { short: string }[]) => g.map((x) => x.short).join('; ')
const rule = (id: (typeof PART_RULES)[number]['id']) => PART_RULES.find((p) => p.id === id)!.short
const statuses = TECH_STATUSES.map((s) => s.label.toLowerCase()).join(', ')
const approaches = APPROACHES.map((a) => `${a.label.toLowerCase()} (${a.when})`).join('; ')

/** The engineering method (eight steps), with the lecture slides that teach each step. */
export const LAB_METHOD: { title: string; text: NewText; taught: string }[] = [
  {
    title: 'The as-is and the horizons',
    text: n(`Write the baseline (increment 0) from your Week 4 and Week 5 views: what exists when the enterprise enters service, with the limit that binds it where you can compute one, plus any change already decided and committed, which belongs to the baseline trajectory and is not planned again as an increment. Choose your three horizons, ${HORIZONS.map((h) => h.label.toLowerCase()).join(', ')}, and state the length of each with a reason: long buckets for long-lived capabilities, short ones for fast-changing ones. Rules: ${rule('baseline')}; ${rule('horizons')}.`),
    taught: t(1, 'w6s1-capability-trajectory', 'w6s1-gaps') + '; ' + t(2, 'w6s2-baseline'),
  },
  {
    title: 'Capability gaps and excesses',
    text: n(`For each need and objective, compare the desired capability with the baseline trajectory and record what is short (a gap: the baseline below the desired level) or in excess (the baseline above it; slack on a limit that does not bind is not an excess), with both levels, the horizon and the ID it comes from. Hard gates for every entry: ${gatesOf(GAP_GATES)}. Advisory: ${rule('no-excess')}.`),
    taught: t(1, 'w6s1-gaps', 'w6s1-gaps-to-changes', 'w6s1-improvement-plan'),
  },
  {
    title: 'The technology plan',
    text: n(`From your Week 3 readiness assessment, list every technology the roadmap brings to bear: its status (${statuses}), its TRL with the evidence or labeled assumption behind it, and its insertion point (the increment that brings it in) or the reason it is not inserted. Insert a technology only where maturity, the ability to insert it and the operational timing all hold. Hard gates: ${gatesOf(TECH_GATES)}. Advisories: ${gatesOf(TECH_ADVISORIES)}. Rule: ${rule('insertion')}.`),
    taught: t(1, 'w6s1-technology-planning', 'w6s1-plan-contents', 'w6s1-practice-steps', 'w6s1-maturity-limits', 'w6s1-technology-table') + '; ' + t(2, 'w6s2-insertion-rule'),
  },
  {
    title: 'Increments',
    text: n(`Lay out the increments on the grid of horizons and lanes (${LANES.join(', ').toLowerCase()}). For each after the baseline give its name, horizon and content; the gap, need or objective it serves; an entry trigger a reviewer could observe; its dependencies; its development approach, one of ${approaches}; its transition approach; its security and resilience change; and an off-ramp wherever it inserts a technology below TRL ${MATURE_TRL}, in development or not yet existing. Hard gates: ${gatesOf(INCREMENT_GATES)}. For the baseline: ${gatesOf(BASELINE_GATES)}. Advisories: ${gatesOf(INCREMENT_ADVISORIES)}. Rules: ${rule('beyond-near')}; advisory, ${rule('horizon-empty')}.`),
    taught: t(1, 'w6s1-development-approaches', 'w6s1-evolutionary-acquisition', 'w6s1-increment-lessons', 'w6s1-off-ramps') + '; ' + t(2, 'w6s2-anatomy', 'w6s2-increment-1', 'w6s2-increments-2-3', 'w6s2-triggers-answer'),
  },
  {
    title: 'Transition while the service operates',
    text: n('For each increment, plan how the enterprise keeps operating while it changes: simultaneous operation, cutover or retirement; phases by site or area; which limit binds in between; what stays backward compatible; where the change enters the Vee and which unmodified parts are regression tested.'),
    taught: t(2, 'w6s2-transition-process', 'w6s2-operating-change', 'w6s2-change-without-breaking'),
  },
  {
    title: 'Security and resilience, and the known unknowns',
    text: n(`State each increment’s security and resilience change; link each new risk to the increment that creates it, including at least one transition risk and at least one security or resilience risk. Record each known unknown with what is unknown, its impact, the information needed, the mitigation, its owner and the increment it gates. Hard gates for each unknown: ${gatesOf(UNKNOWN_GATES)}; for each AROU item: ${gatesOf(AROU_GATES)}. Advisories: ${gatesOf(UNKNOWN_ADVISORIES)}; ${gatesOf(AROU_ADVISORIES)}. Rules: ${rule('security-link')}; ${rule('transition-risk')}.`),
    taught: t(2, 'w6s2-security-resilience') + '; ' + t(1, 'w6s1-known-unknowns'),
  },
  {
    title: 'The impact of one increment',
    text: n(`Choose one increment after the baseline. Follow your record’s links one step from what it inserts or changes (a technology, a stakeholder’s role, an element) and judge each candidate: reached, with how, or not reached, with why. Hard gates: ${gatesOf(IMPACT_GATES)}.`),
    taught: t(2, 'w6s2-impact'),
  },
  {
    title: 'The Phase I baseline review',
    text: n(`For each of Weeks 1 to 5, state ready, or name each open item and who closes it, so that Week 7 starts from known open items. Hard gates per week: ${gatesOf(REVIEW_GATES)}. Rule: ${rule('unique-ids')}. Then draw the roadmap graphic from the grid the tool shows, with its text equivalent.`),
    taught: t(2, 'w6s2-limits', 'w6s2-baseline-review'),
  },
]

/** The procedure, step by step: when, who (lead role) and the output. */
export const LAB_PROCEDURE: { step: string; when: string; who: string; output: string; detail: NewText }[] = [
  { step: 'As-is and top three gaps', when: `In class, Session 2 (${S2_LAB.baseline} min)`, who: 'Whole team', output: 'Part 23 draft', detail: n('The as-is in five lines from your Week 4 and Week 5 views; the top three gaps, each with a horizon and the need behind it; your bucket lengths with a reason.') },
  { step: 'First increment and trigger checked', when: `In class, Session 2 (${S2_LAB.check} min, up to ${S2_LAB.checkTeams} teams)`, who: 'Architecture lead presents', output: 'Feedback', detail: n('State the first increment, its entry trigger and the unknown that gates it; the instructor asks for an observable trigger where it is a date or a wish. Teams not heard post their three lines on the LMS and are answered within 48 hours.') },
  { step: 'Gaps on three horizons', when: 'Days 1–2', who: 'Requirements & Compliance', output: 'Part 23', detail: n(`At least ${MIN.gaps} gaps or excesses (a three-person team: ${MIN3.gaps}), each with both levels, a horizon and its source ID.`) },
  { step: 'Technology plan', when: 'Days 2–3', who: 'AI & Data Management (Architecture in a team of three)', output: 'Part 24', detail: n(`At least ${MIN.technologies} technologies (a three-person team: ${MIN3.technologies}) from the Week 3 assessment, each with status, TRL and basis, and an insertion point or a reason; at least one inserted by an increment.`) },
  { step: 'Increments', when: 'Days 3–4', who: 'Architecture', output: 'Part 25', detail: n(`At least ${MIN.increments} increments counting the baseline (a three-person team: ${MIN3.increments}), at least one beyond the near term, every field of the increment filled.`) },
  { step: 'Known unknowns and the AROU update', when: 'Days 4–5', who: 'Verification & Validation', output: 'Part 26', detail: n(`At least ${MIN.unknowns} known unknowns (a three-person team: ${MIN3.unknowns}), each gating an increment; at least ${MIN.arou} new or changed AROU item; at least one transition risk and one security or resilience risk linked to increments.`) },
  { step: 'Impact list of one increment', when: 'Day 5', who: 'Each member traces the IDs they own', output: 'Part 27 (impact)', detail: n('Every candidate the links reach judged reached or not reached, with a reason.') },
  { step: 'Phase I baseline review and roadmap graphic', when: 'Day 6', who: 'Verification & Validation; Architecture (graphic)', output: 'Part 27 (review), graphic', detail: n('One row per week with its status and open items; the roadmap graphic drawn from the tool’s grid, with its text equivalent.') },
  { step: 'AI usage statement, integration, export and upload', when: 'Day 7', who: 'Verification & Validation', output: 'Submission', detail: n('Read every advisory and fix or answer it; write the AI usage statement, tagging every AI-suggested entry; export the Markdown record and the JSON model inputs after the last change, and upload them with the graphic.') },
]

export const LAB_OUTPUT_FILES = [
  { name: 'team-NN-week6-record.md', what: 'Parts 23–27 and the updated Part 6 as headed Markdown, with the roadmap grid as a table (the text equivalent of the graphic)' },
  { name: 'team-NN-week6-model-inputs.json', what: 'The same data with IDs, links and check results, and the canonical artifact type and relationship each item maps to (INC, TECH, U, R; delivers, precedes, affects)' },
  { name: 'team-NN-week6-roadmap.png (or .pdf)', what: 'The roadmap graphic drawn from the grid, whose text equivalent is in the record' },
]

const both = (four: string, three: string) => `team of 4: ${four}; team of 3: ${three}`
const part = (id: (typeof WEEK6_PARTS)[number]['id']) => {
  const p = WEEK6_PARTS.find((x) => x.id === id)!
  return `${p.n}. ${p.title}`
}
/** The parts the Week 6 work adds to the Team Record, with the evidence, the minimum and how each is judged. */
export const LAB_PARTS: { heading: string; evidence: NewText; minimum: string; judged: string }[] = [
  { heading: '6. AI usage statement (updated)', evidence: n('Tool, purpose, prompts, what was accepted or rejected and why, with AI-suggested gaps, technologies, increments and unknowns tagged.'), minimum: 'At least 12 words; present even if no AI tool was used', judged: 'RB-12.1–12.3' },
  { heading: part('gaps'), evidence: n('The baseline (increment 0), the three horizons with their lengths, and the gaps and excesses with both levels, horizon and source.'), minimum: both(`${MIN.gaps} entries`, `${MIN3.gaps} entries`) + '; only entries that pass every hard gate count', judged: 'RB-15.4 (near/mid/long states, capability evolution)' },
  { heading: part('technology'), evidence: n('Every technology with status, TRL and basis, insertion point or reason, and a risk or mitigation where immature.'), minimum: both(`${MIN.technologies} technologies`, `${MIN3.technologies} technologies`) + '; at least one inserted by an increment', judged: 'RB-15.4 (technology insertions with maturity rationale)' },
  { heading: part('increments'), evidence: n('Every increment with content, serves, trigger, dependencies, approach, transition, security and resilience change, and off-ramp where needed; the roadmap grid.'), minimum: both(`${MIN.increments} increments`, `${MIN3.increments} increments`) + ' counting the baseline; at least one beyond the near term', judged: 'RB-15.4; proposed RB-15.5' },
  { heading: part('unknowns'), evidence: n('Known unknowns with impact, information needed, mitigation, owner and the increment each gates; new or changed AROU items linked to increments.'), minimum: both(`${MIN.unknowns} unknowns`, `${MIN3.unknowns} unknowns`) + `; ${MIN.arou} AROU item; one transition risk; one security or resilience risk linked`, judged: 'RB-15.3, RB-5.4, RB-5.5, RB-15.1, RB-15.2' },
  { heading: part('review'), evidence: n('The impact list of one increment with every candidate judged; the baseline review, one row per week.'), minimum: 'One impact list; five review rows (Weeks 1–5); the same for a team of 3', judged: 'proposed RB-15.6' },
]

/** Rubric rows applied this week with four level columns, read from the register, never retyped. */
export const LAB_RUBRIC_ROWS: [string, string][] = [['RB-15', '15.4'], ['RB-15', '15.3'], ['RB-15', '15.1'], ['RB-15', '15.2'], ['RB-5', '5.4'], ['RB-5', '5.5'], ['RB-12', '12.1'], ['RB-12', '12.2'], ['RB-12', '12.3']]
export const LAB_RUBRIC_NOTE = n(
  'The rows of the course rubric this record is judged against, quoted from the register. The roadmap row and the known-unknowns row are the register’s resilience, security and evolution rows, applied here in Week 6 (a re-mapping pending faculty confirmation, since the register lists them for a later week). The resilience and security rows are applied to the security and resilience change of each increment and to the linked risks, which is how this week integrates them. The AROU rows apply to the new or changed AROU items and their links to increments. The AI rows apply to the AI-suggested entries; the SysML part of the last applies from Week 8. Two rows are proposed, pending faculty approval, and are not yet in the register: Increments and transition, and Impact and baseline review.',
)
export const RUBRIC_LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']
/** Proposed rubric rows (not register rows; pending faculty approval), with their four level descriptors. */
export const PROPOSED_RUBRIC: { id: string; criterion: string; levels: [string, string, string, string] }[] = [
  { id: 'RB-15.5 (proposed)', criterion: 'Increments and transition', levels: ['Every increment serves a named gap, starts at an observable trigger, names its dependencies, development approach, transition approach and security and resilience change, with an off-ramp wherever it inserts immature technology; transition keeps the service operating', 'All fields present; one trigger not observable or one transition thin', 'Increments as dated feature lists; triggers or transitions missing', 'A timeline without increments'] },
  { id: 'RB-15.6 (proposed)', criterion: 'Impact and baseline review', levels: ['Impact candidates found by the record’s links and each judged with a reason; every week reviewed, each open item named with its owner', 'Impact judged but a few candidates missed; review complete', 'Impact listed from memory; review partial', 'None'] },
]

/** Removes the register's internal source codes (for example “[S03 D15]”, “S11 p.”, “(in the model for A2/B)”) from
 *  rubric text shown to students; the register itself keeps them for faculty. */
export const studentRubricText = (s: string) =>
  s
    .replace(/\s*\[S\d{2}[^\]]*\]/g, '')
    .replace(/\s*\(in the model for A2\/B\)/g, '')
    .replace(/\bS11 (pp?\.)/g, 'SEBoK $1')
    .replace(/\s+/g, ' ')
    .trim()

export function rubricRow(id: string, criterion: string): string[] {
  const p = getRubric(id).parts.find((x) => x.type === 'table')
  const r = p && p.type === 'table' ? p.rows.find((x) => x[0] === criterion) : undefined
  if (!r) throw new Error(`${id} has no criterion ${criterion}`)
  return r.map(studentRubricText)
}

/** Level descriptors for every lab criterion and the graduate criteria (course convention, pending faculty approval). The
 *  graduate memo has four criteria on four levels (16 points), the applied exercise's scale. */
export const LAB_LEVELS: { criterion: string; graduate: boolean; levels: [string, string, string, string] }[] = [
  { criterion: 'Baseline and gaps', graduate: false, levels: ['An honest as-is with its binding limit; every gap and excess traced to a need or objective, with both levels and a horizon; bucket lengths justified by how fast the enterprise changes', 'Complete, with one gap untraced or one level missing', 'Gaps as feature wishes, or horizons without lengths', 'No gap analysis'] },
  { criterion: 'Technology plan', graduate: false, levels: ['Every technology classified with TRL and basis from Week 3; each has an insertion point or a reason; immature ones carry a risk and a mitigation; insertions respect maturity, insertability and timing', 'Complete; one basis or one reason thin', 'TRLs asserted without basis, or technologies with no insertion decision', 'A list of technologies'] },
  { criterion: 'Increments and transition', graduate: false, levels: ['Every field of every increment filled, triggers observable, off-ramps for immature technology, a transition that keeps the service operating', 'One trigger or one transition thin', 'Dates instead of triggers; transitions missing', 'No increments'] },
  { criterion: 'Known unknowns, AROU, security and resilience', graduate: false, levels: ['Each unknown with impact, information needed, mitigation, owner and gated increment; new risks linked to increments, a transition risk and a security or resilience risk among them; each increment’s security and resilience change stated', 'All present, one element thin', 'Unknowns listed without impact or owner; security as a generic remark', 'None'] },
  { criterion: 'Impact and baseline review', graduate: false, levels: ['Candidates found by the links and each judged; every week reviewed with owned open items', 'Impact judged with a few gaps; review complete', 'Impact from memory; review partial', 'None'] },
  { criterion: 'Sensitivity: the trigger that moves an increment (graduate)', graduate: true, levels: ['Names the trigger or unknown that would move an increment by a full horizon, with the threshold computed or sourced from the team’s own data', 'Names the trigger with a threshold that is asserted, not derived', 'Names a trigger without saying how far it moves the increment', 'No trigger identified'] },
  { criterion: 'Impact set traced (graduate)', graduate: true, levels: ['The moved increment’s impact set traced across the Weeks 1–5 IDs by links, every candidate judged', 'Traced, with a few candidates unjudged', 'IDs listed without the links that reach them', 'No impact set'] },
  { criterion: 'Earlier decision to re-run (graduate)', graduate: true, levels: ['Names the earlier decision (for example the Week 3 trade) that would have to be re-run, and the criterion or screen that would change', 'Names the decision without the criterion', 'A generic “revisit the plan”', 'None'] },
  { criterion: 'Limits stated (graduate)', graduate: true, levels: ['States which assumption or data limit could change the memo’s conclusion, and what evidence would settle it', 'A limit named but not tied to the conclusion', 'Generic limits only', 'None'] },
]

export const LAB_SUBMISSION = {
  format: n('Export two files from the lab tool after the last change: team-NN-week6-record.md (Parts 23–27 and the updated Part 6 as headed Markdown, with the roadmap grid as its text equivalent) and team-NN-week6-model-inputs.json (the same data with IDs, links and check results). Add the roadmap graphic as an image or PDF. Both files state the record’s status.'),
  where: n(`One member uploads the files to the ${LAB6_WHERE} before Week 7, Session 1.`),
  grading: n('Formative: written feedback against the rubric rows above, returned before Week 7, Session 2.'),
  aiUse: 'AI tools may help find candidate gaps from your needs, check the technology table for missing fields and draft trigger wording; tag each AI-suggested entry AI-suggested-reviewed and say in the AI usage statement what the tool suggested and what you changed or rejected. The team owns every gap, insertion decision, trigger and transition.',
  graduate: n('Graduate students also write a roadmap sensitivity memo (one page, about 40 minutes, replacing the applied exercise; four criteria on four levels, 16 points, the applied exercise’s scale): for the team’s own roadmap, identify the trigger or unknown that would move an increment by a full horizon, with its threshold; trace the impact set of that increment across the Weeks 1–5 IDs; name the earlier decision, for example the Week 3 trade study, that would need to be re-run and the criterion or screen that would change; and state the limit that could change the memo’s conclusion.'),
}

export const LAB_TOOL = n(
  'The lab tool imports your team’s Week 5 model-inputs file, and optionally your Week 3 file, and adds Parts 23–27. It carries your needs, capabilities, requirements, risks, TPMs, physical elements, functions, components, interfaces and decisions so that every link can be checked; draws the roadmap grid of horizons and increments with its text equivalent; lists, for the increment you choose, the candidates its links reach, so that the impact list starts from the record and not from memory; and seeds the baseline review with one row per week. Each gap, technology, increment, unknown and AROU item lists its hard gates, each marked pass or fails, and its advisories, labeled advisory, which never stop an entry counting; only entries that pass every hard gate count toward the minimums. One-word answers are accepted wherever the lecture calls a word complete (“Cutover”, “None”, “A-003”); an answer that says nothing (“n/a”, “?”, “later”) is not. One member can enter the record and export the JSON file; teammates import it to continue the same record, and the tool asks before replacing work. Everything is saved in your browser only, so export after every working session.',
)

/** Workload: the lab's share of the week. */
export const LAB_WORKLOAD: { activity: string; hours: number }[] = [
  { activity: `Lab launch in class (Session 2, ${S2_LAB.total} min; inside the class hours)`, hours: 0 },
  { activity: `Lab L6 out of class: your share of about ${LAB6_TEAM_HOURS.toFixed(1)} person-hours (team of four)`, hours: LAB6_EACH },
]
export const LAB_WORKLOAD_NOTE = n(
  `About ${LAB6_TEAM_HOURS.toFixed(1)} person-hours of out-of-class work for a team of four (${LAB6_PERSON_HOURS.map((x) => `${x.task} ${x.hours.toFixed(1)}`).join('; ')}), so about ${LAB6_EACH.toFixed(1)} h each. A team of three works to the reduced minimums (${MIN3.gaps} gaps, ${MIN3.technologies} technologies, ${MIN3.increments} increments, ${MIN3.unknowns} unknowns): about ${LAB6_THREE_PERSON.teamHours.toFixed(1)} person-hours, about ${LAB6_THREE_PERSON.each.toFixed(1)} h each. Workload proportional to team size is pending faculty confirmation. See the workload table on the week page.`,
)

/** The ID prefixes the record adds, with the canonical artifact type each maps to (for the My Project adapters). */
export const LAB_PREFIXES = WEEK6_PREFIXES
/** The empty-answer rule, shown with the gate table (labBrief.ts single source). */
export const LAB_EMPTY_ANSWER_RULE = EMPTY_ANSWER_RULE

// ------------------------------------------------------------------------------------------- gate justification
/** The gate-justification table, generated from the labBrief rows: every hard gate with what it checks, the basis, and
 *  where a student reads the sentence that makes a failure a real defect; every advisory with the reason it is only an
 *  advisory. */
export type GateTableRow = { group: string; kind: 'gate' | 'advisory'; id: string; checks: string; basis: string; taught: string }
const gateRows = (group: string, rows: readonly { id: string; short: string; basis: string; taught?: Taught }[], kind: 'gate' | 'advisory'): GateTableRow[] =>
  rows.map((g) => ({ group, kind, id: g.id, checks: g.short, basis: g.basis, taught: g.taught ? taughtText(g.taught) : 'advisory: never blocks' }))
export const GATE_TABLE: GateTableRow[] = [
  ...gateRows('Gap or excess', GAP_GATES, 'gate'),
  ...gateRows('Technology', TECH_GATES, 'gate'),
  ...gateRows('Technology', TECH_ADVISORIES, 'advisory'),
  ...gateRows('Baseline increment', BASELINE_GATES, 'gate'),
  ...gateRows('Increment', INCREMENT_GATES, 'gate'),
  ...gateRows('Increment', INCREMENT_ADVISORIES, 'advisory'),
  ...gateRows('Known unknown', UNKNOWN_GATES, 'gate'),
  ...gateRows('Known unknown', UNKNOWN_ADVISORIES, 'advisory'),
  ...gateRows('AROU item', AROU_GATES, 'gate'),
  ...gateRows('AROU item', AROU_ADVISORIES, 'advisory'),
  ...gateRows('Impact list', IMPACT_GATES, 'gate'),
  ...gateRows('Baseline review row', REVIEW_GATES, 'gate'),
  ...PART_RULES.map((g) => ({ group: 'Part rule', kind: g.kind === 'gate' ? ('gate' as const) : ('advisory' as const), id: g.id, checks: g.short, basis: g.basis, taught: 'taught' in g && g.taught ? taughtText(g.taught) : 'advisory: never blocks' })),
]

// ------------------------------------------------------------------------------------------- Markdown
const cite = (c: Citation) => formatCitation(c)
const md = (s: string) => s.replace(/\|/g, '\\|')

/** The same instructions as the Laboratory page, as Markdown (docs/lectures/week06/WEEK6_LAB_INSTRUCTIONS.md). */
export function labMarkdown(): string {
  const L: string[] = []
  const table = (head: string[], rows: string[][]) => {
    L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`)
    for (const r of rows) L.push(`| ${r.map((c) => md(c).replace(/\n/g, ' ')).join(' | ')} |`)
    L.push('')
  }
  L.push(`# Week 6 ${LAB_TITLE}`, '')
  L.push('> Generated from `learning-studio/src/content/lab/week06Lab.ts` by `node scripts/build-lab-md.mjs 6`; the Laboratory page (`#/week/6/lab`) renders the same source. Do not edit this file by hand. Review status: new-pending-review.', '')
  L.push(`Week 6 — ${W6.title}. AeroLink is the instructor’s FICTIONAL worked example; this record is about your team’s own enterprise.`, '')
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
  L.push('## Expected outputs', '', 'Files, exported from the lab tool after the last change, and the graphic:', '')
  for (const f of LAB_OUTPUT_FILES) L.push(`- \`${f.name}\`: ${f.what}.`)
  L.push('', 'The Week 6 work adds five parts to the Team Record and updates one. The minimum is the completeness check the lab tool and the instructor apply first.', '')
  table(['Part', 'Evidence required', 'Minimum (completeness check)', 'Judged by'], LAB_PARTS.map((p) => [p.heading, p.evidence.text, p.minimum, p.judged]))
  L.push('### IDs this week adds, and the artifact type each maps to', '')
  table(['Prefix', 'Canonical artifact type and relationships', 'Owner (lead role)'], LAB_PREFIXES.map((p) => [p.prefix, p.type, p.owner]))
  L.push('## Why each check blocks, or only advises', '', 'A hard gate stops an entry counting only where a sentence you can read in the lecture or the lesson says the failure is a real defect; the last column names that slide and quotes the sentence. Anything that can occur in good work is an advisory, shown and never blocking. No check tests the form or length of a name.', '', EMPTY_ANSWER_RULE, '')
  table(['Where', 'Check', 'Hard gate or advisory', 'What it checks', 'Basis', 'Where you read it'], GATE_TABLE.map((g) => [g.group, g.id, g.kind === 'gate' ? 'hard gate' : 'advisory', g.checks, g.basis, g.taught]))
  L.push('## Grading rubric rows', '', LAB_RUBRIC_NOTE.text, '')
  const label = (rb: string, r: string[]) => `${rb}.${r[0].split('.')[1]} ${r[1]}`
  table(['Criterion', ...RUBRIC_LEVELS], [
    ...LAB_RUBRIC_ROWS.map(([rb, c]) => {
      const r = rubricRow(rb, c)
      return [label(rb, r), ...r.slice(2, 6)]
    }),
    ...PROPOSED_RUBRIC.map((p) => [`${p.id} ${p.criterion}`, ...p.levels]),
  ])
  L.push('### Level descriptors for the lab criteria', '')
  table(['Criterion', ...RUBRIC_LEVELS], LAB_LEVELS.map((x) => [x.criterion, ...x.levels]))
  L.push('## Submission', '')
  L.push(`- **Format.** ${LAB_SUBMISSION.format.text}`, `- **Where and when.** ${LAB_SUBMISSION.where.text}`, `- **How it is graded.** ${LAB_SUBMISSION.grading.text}`, `- **AI use.** ${LAB_SUBMISSION.aiUse}`, `- **Graduate task.** ${LAB_SUBMISSION.graduate.text}`, '')
  L.push('## The lab tool', '', LAB_TOOL.text, '')
  L.push('## Workload', '')
  table(['Activity', 'Hours per student'], LAB_WORKLOAD.map((w) => [w.activity, w.hours ? w.hours.toFixed(1) : 'in class']))
  L.push(LAB_WORKLOAD_NOTE.text, '')
  return L.join('\n')
}
