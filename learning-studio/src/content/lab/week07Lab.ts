// Lab L7, the Systems Thinking Engineering Package and the Phase I design review: the full laboratory instructions, single
// source for the Week 7 Laboratory page and docs/lectures/week07/WEEK7_LAB_INSTRUCTIONS.md (labMarkdown(), written by
// `node scripts/build-lab-md.mjs 7`; week07Lab.test.ts fails when the file and this module differ). Mirrors
// src/content/lab/week06Lab.ts. Also the single source of the design-review presentation rubric (team and individual
// criteria with level descriptors), the peer-review RID form and the graduate task, which the Assessment page renders.
//
// Single sources: the package sections, the finding kinds, the dispositions, the hard gates and advisories with their basis
// and the student-visible phrase each rests on, the entry and exit criteria, the review plan and the person-hours come from
// src/content/lectures/week07/labBrief.ts (the same module the package tool, src/workbench/week7/record.ts, checks
// against); the gate-justification table (GATE_TABLE) is generated from those rows and names, for every hard gate, the
// slide (number and title, computed from the registered lecture) where a student can read the sentence that makes a failure
// a real defect; the in-class minutes are read from the slides; the register rubric rows from the rubric register
// (getRubric), with the register's internal source codes removed for students.
// Review status: new-pending-review. AeroLink is FICTIONAL and is the instructor's worked example; the package is always
// about the team's own enterprise. The presentation rubric and its descriptors are PROPOSED (no register row scores a
// whole package or a Phase I thread walk); grading weights and policy are not changed here.
import { WEEKS } from '../course'
import { formatCitation, type Citation } from '../readings'
import { getRubric } from '../rubrics'
import { getLecture } from '../lectures'
import { allSlides } from '../lectures/text'
import { PENDING, type NewText } from '../learn/types'
import {
  COVERAGE_LAYERS, DISPOSITIONS, IDENTITY_RULE, EMPTY_ANSWER_RULE, ENTRY_CRITERIA, EXIT_CRITERIA, FINDING_ADVISORIES, FINDING_GATES, FINDING_KINDS, LAB7_PERSON_HOURS, LAB7_TEAM_HOURS, MIN_SLOT, PACKAGE_SECTIONS, PART_RULES, PREP_ADVISORIES, PREP_GATES,
  REVIEW_TEAM_MINUTES, RID_ADVISORIES, RID_DISPOSITIONS, RID_GATES, SEVERITIES, SOURCE_ADVISORIES, SOURCE_GATES, SOURCE_WEEKS, SUMMARY_GATES, THREE_PERSON_ITEM_RATIO, WEEK7_PARTS, WEEK7_PREFIXES, reviewPlan, type Taught,
} from '../lectures/week07/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
const W7 = WEEKS[6]
const round1 = (x: number) => Math.round(x * 10) / 10

export const LAB_REVIEW = PENDING
export const LAB_TITLE = 'Lab L7: the Systems Thinking Engineering Package and the Phase I design review'

// ------------------------------------------------------------------------------------------- taught in
/** “Session N, slide M ‘title’”, read from the registered lecture by slide id. */
export function taughtIn(session: 1 | 2, slideId: string): string {
  const l = getLecture(7, session)
  const slides = l ? allSlides(l) : []
  const i = slides.findIndex((s) => s.id === slideId)
  return i >= 0 ? `Session ${session}, slide ${i + 1} ‘${slides[i].title}’` : `Session ${session}, slide ${slideId}`
}
const t = (session: 1 | 2, ...ids: string[]) => ids.map((id) => taughtIn(session, id)).join('; ')
export const taughtText = (x: Taught) => `${taughtIn(x.session, x.slide)}: “${x.phrase}”`

// ------------------------------------------------------------------------------------------- in-class minutes, readings
const studio = getLecture(7, 1)?.sections.find((s) => s.id === 'w7s1-studio')
const review = getLecture(7, 2)?.sections.find((s) => s.id === 'w7s2-review')
/** The in-class minutes, read from the slides. */
export const IN_CLASS = {
  studio: studio ? studio.slides.reduce((a, s) => a + s.minutes, 0) : 13,
  review: review ? review.slides.reduce((a, s) => a + s.minutes, 0) : 44,
}
export const LAB7_REQUIRED_READINGS: Citation[] = [
  { reading: 'R06c', pages: '386–388' },
  { reading: 'R40', pages: '69–70' },
  { reading: 'R45', pages: '118–119' },
  { reading: 'R56', pages: '387–389' },
]
export const LAB7_EXTENSION_READINGS: Citation[] = [
  { reading: 'R36', pages: '498–499' },
  { reading: 'R43', pages: '109–110' },
  { reading: 'R44', pages: '111–112' },
  { reading: 'R13', pages: '565–566' },
  { reading: 'R18', pages: '473–474' },
  { reading: 'R105', pages: '531' },
]
export const LAB7_WHERE = 'LMS assignment “Week 7 Phase I package”'

// ------------------------------------------------------------------------------------------- workload
export const LAB7_EACH = round1(LAB7_TEAM_HOURS / 4)
export const LAB7_THREE_PERSON = (() => {
  const teamHours = round1(LAB7_PERSON_HOURS.reduce((a, x) => a + x.hours * (x.scales === 'items' ? THREE_PERSON_ITEM_RATIO : 1), 0))
  return { teamHours, each: round1(teamHours / 3) }
})()
const P5 = reviewPlan(5)
const P4 = reviewPlan(4)

// ------------------------------------------------------------------------------------------- the lab at a glance
export const LAB_PURPOSE = n(
  'Integrate your team’s Weeks 1–6 work on its own enterprise, never on AeroLink, into one Systems Thinking Engineering Package and take it through the Phase I design review. Load your six weekly exports into the package tool; read the coverage of every trace layer and every consistency and traceability finding; fix what you can at its source and re-export, and record or defer the rest with a reason and an owner; write the executive summary and the lessons learned; prepare the review (section owners, the key decision you defend, the thread you walk); present and defend the package in Session 2 and answer your reviewers’ findings; review another team’s package; and close the review by dispositioning every finding you received. Week 8 starts from the closed package as the baseline of your SysML v2 model (its import of the package file is still being built).',
)

export const LAB_AT_A_GLANCE: { label: string; value: string }[] = [
  { label: 'Setting', value: 'Team (3 or 4 members); the package and the briefing are team work, the peer findings and the answers in the review are individual' },
  { label: 'In class', value: `Session 1 studio, ${IN_CLASS.studio} min: load your exports, read the audit, first dispositions, owner questions. Session 2 review, ${IN_CLASS.review} min: five teams in ${P5.slot}-min slots (${P5.briefing} min briefing, ${P5.questions} min questions), or four in ${P4.slot}-min slots` },
  { label: 'Out of class', value: 'Between the sessions (the package and the peer findings) and three days after Session 2 (closing the review)' },
  { label: 'Entry (due)', value: 'Package index, readiness report and package file uploaded at least 24 h before Session 2; peer findings before Session 2' },
  { label: 'Exit (due)', value: 'Closed package, every finding received dispositioned, within 3 days of Session 2' },
  { label: 'Grading', value: 'The design-review presentation rubric (team and individual criteria) on the Assessment page; the package itself is judged by its integrity criterion; weights per the course assessment table' },
]

export const LAB_INPUTS: { text: NewText; cites?: Citation[]; to?: string }[] = [
  { text: n(`Your six weekly exports, each corrected after its feedback and exported again from its own lab tool: ${SOURCE_WEEKS.map((w) => `Week ${w.week}, ${w.file}`).join('; ')}. The tool reads each with that week’s own importer, so nothing is retyped.`) },
  { text: n('Your Week 6 baseline review, whose open items enter the package as deferred findings with their owners.') },
  { text: n('The Session 1 and Session 2 lectures, the detailed lesson and the worked examples: the instructor’s own AeroLink package, its audit, one thread, the executive summary and four review findings with their dispositions.'), to: '/week/7/examples' },
  { text: n('The required readings for the week.'), cites: LAB7_REQUIRED_READINGS },
  { text: n('Further reading on configuration baselines, decision analysis, technical assessment, requirement verification and validation, bias in decisions and communicating a plan (not required; the basis of the graduate task).'), cites: LAB7_EXTENSION_READINGS },
  { text: n('The package tool, which imports your exports, computes the coverage and the findings, checks every disposition, the summary, the review preparation and the review findings as you go, and exports the package index with its readiness report and the package file.'), to: '/week/7/lab/tool' },
]

export const PROPOSED_OBJECTIVES: { id: string; text: string }[] = [
  { id: 'W7.4', text: 'Explain the purpose, preparation, entry and exit criteria and roles of a technical review, and relate the Phase I review to the System Requirements Review' },
  { id: 'W7.5', text: 'Answer review findings with dispositions (accept, defer, reject) backed by evidence, and carry the open ones forward with owners' },
]
export const LAB_OBJECTIVES = [
  ...['W7.1', 'W7.2', 'W7.3'].map((id) => ({ id, text: W7.objectives.find((x) => x.id === id)!.text, proposed: false })),
  ...PROPOSED_OBJECTIVES.map((o) => ({ id: o.id, text: o.text, proposed: true })),
]

const gatesOf = (g: readonly { short: string }[]) => g.map((x) => x.short).join('; ')
const rule = (id: (typeof PART_RULES)[number]['id']) => PART_RULES.find((p) => p.id === id)!.short

/** The engineering method (eight steps), with the lecture slides that teach each step. */
export const LAB_METHOD: { title: string; text: NewText; taught: string }[] = [
  { title: 'Assemble the package from its sources', text: n(`Correct each week where its feedback asks, export it again from its own lab tool, and load all six exports into the package tool. Hard gates: ${gatesOf(SOURCE_GATES)}. Advisories: ${gatesOf(SOURCE_ADVISORIES)}.`), taught: t(1, 'w7s1-baseline', 'w7s1-package-contents', 'w7s1-ids') },
  { title: 'Read the coverage and the findings', text: n(`Read the coverage of each trace layer (${COVERAGE_LAYERS.map((l) => l.label.toLowerCase()).join('; ')}) and every finding the audit lists: ${FINDING_KINDS.map((k) => k.label.toLowerCase()).join(', ')}. Then read your needs against their requirements yourself: a link can exist and carry only part of a need, which the coverage count cannot see. The tool reads requirements from your Week 2 and Week 5 records: a requirement written in another week belongs in your Week 2 record, exported again. Identity rule for an ID defined in two weeks: ${IDENTITY_RULE}`), taught: t(1, 'w7s1-bidirectional', 'w7s1-verify-validate', 'w7s1-audit-metrics') },
  { title: 'Fix at the source, or disposition', text: n(`Fix what you can where it was made: correct the week’s record in its own lab tool, export it again and import the new file; a corrected finding disappears, which is the only proof of a correction (a collision is corrected by renumbering in the later week’s tool). Disposition every other finding: ${DISPOSITIONS.map((d) => `${d.label.toLowerCase()}: ${d.means}`).join('; ')}. Hard gates for each finding: ${gatesOf(FINDING_GATES)}. Advisory: ${gatesOf(FINDING_ADVISORIES)}. Rule: ${rule('all-dispositioned')}.`), taught: t(1, 'w7s1-audit-metrics', 'w7s1-findings-example') },
  { title: 'Write the executive summary and the lessons learned', text: n(`Six fields, each a gate: ${gatesOf(SUMMARY_GATES)}. Then at least one lesson learned: what the team would do differently, and why. Rules: ${rule('lessons')}; ${rule('ai')}.`), taught: t(1, 'w7s1-requirements-baseline', 'w7s1-exec-summary') },
  { title: 'Prepare the review', text: n(`Name an owner for every package section, choose the key decision you defend and the thread you walk. Hard gates: ${gatesOf(PREP_GATES)}. Advisories: ${gatesOf(PREP_ADVISORIES)}. Build the briefing on the six-link argument: claim, evidence by ID, criteria and weights, conditions, residual risk, what would change it.`), taught: t(1, 'w7s1-thread-example', 'w7s1-entry-exit', 'w7s1-roles') + '; ' + t(2, 'w7s2-argument', 'w7s2-trade', 'w7s2-risk-roadmap', 'w7s2-audience') },
  { title: 'Review a peer package', text: n('Read the sections of the assigned package that match your own role and write at least two review findings on the RID form: where, what is wrong against which criterion, severity, and a proposed fix. At least one should concern meaning or traceability, not style.'), taught: t(1, 'w7s1-prepare-conduct-complete', 'w7s1-srr') + '; ' + t(2, 'w7s2-rids') },
  { title: 'Present and answer in the review', text: n(`Brief the summary, defend the key decision and walk the thread in the briefing time; in the questions, the owner of each section answers the findings on it. Timing for five teams: ${P5.briefing} min briefing and ${P5.questions} min questions.`), taught: t(2, 'w7s2-defendable', 'w7s2-lab-open') },
  { title: 'Close the review', text: n(`Enter every finding you received in the package tool with its disposition. Hard gates for each: ${gatesOf(RID_GATES)}. Advisory: ${gatesOf(RID_ADVISORIES)}. Rule: ${rule('all-rids')}. Export the closed package and upload it.`), taught: t(2, 'w7s2-dispositions', 'w7s2-defend-example', 'w7s2-lab-close') },
]

/** The procedure, step by step: when, who (lead role) and the output. */
export const LAB_PROCEDURE: { step: string; when: string; who: string; output: string; detail: NewText }[] = [
  { step: 'Load the exports and read the audit', when: `In class, Session 1 studio (${IN_CLASS.studio} min)`, who: 'Whole team', output: 'Part 28; first dispositions', detail: n('Load all six exports; read the coverage and every finding; re-export any stale week you can fix in the room; disposition your first three findings; name the section owners. The instructor asks each team one owner question.') },
  { step: 'Fix stale weeks and disposition every finding', when: 'Day 1 after Session 1', who: 'Verification & Validation; each section owner for its findings', output: 'Part 29', detail: n('Re-export every week that a stale, wording or no-longer-defined finding points at, and renumber every collision in the later week’s own tool; then disposition every remaining finding: accept it with a rationale that cites its evidence, or defer it to a Phase II week with its owner. Read every carried disposition again: a carried reason that names a week that has passed needs to say what happened.') },
  { step: 'Executive summary and lessons learned', when: 'Day 1', who: 'Requirements & Compliance (summary); whole team (lessons)', output: 'Part 30', detail: n('The six fields of the summary, each with its IDs; at least one lesson learned.') },
  { step: 'Review preparation and the package upload', when: 'At least 24 h before Session 2', who: 'Architecture (briefing); Verification & Validation (upload)', output: 'Part 31; package index and file uploaded', detail: n('Section owners, the key decision and the thread in the tool; export the package index with its readiness report and the package file and upload them: this is the entry criterion.') },
  { step: 'Peer review', when: 'Before Session 2', who: 'Each member', output: 'At least two RIDs each', detail: n('Read the sections of the assigned package that match your role; write at least two RIDs on the form and upload them.') },
  { step: 'Rehearsal', when: 'Before Session 2', who: 'Whole team', output: 'Timed briefing', detail: n('Time the briefing to the slot; each member answers one practice question on an element they own.') },
  { step: 'The design review', when: `Session 2 (${IN_CLASS.review} min)`, who: 'Every member presents and answers', output: 'The recorder’s sheet of RIDs raised', detail: n('Brief, defend, walk the thread, answer the RIDs on your own sections.') },
  { step: 'Close the review', when: 'Within 3 days of Session 2', who: 'Each section owner; Verification & Validation (upload)', output: 'Part 32; closed package uploaded', detail: n('Enter every RID received with its disposition and response; owners for accepted and deferred ones; export and upload the closed package with the AI usage summary.') },
]

export const LAB_OUTPUT_FILES = [
  { name: 'team-NN-week7-package.md', what: 'The package index (sections, sources and counts), the coverage table, every finding with its disposition, the executive summary, the lessons learned, the review preparation, the review findings and the readiness report' },
  { name: 'team-NN-week7-package.json', what: 'The package file: the six weekly exports unchanged, the index of every ID, the typed links, the coverage, the findings with their dispositions, this week’s writing and the readiness state, for the Week 8 model (its import of this file is still being built)' },
  { name: 'team-NN-week7-briefing.pdf (or .pptx)', what: 'The design review briefing as presented' },
]

/** The parts the Week 7 work adds to the Team Record, with the evidence, the minimum and how each is judged. */
export const LAB_PARTS: { heading: string; evidence: NewText; minimum: string; judged: string }[] = [
  { heading: '6. AI usage summary (package)', evidence: n('Tool, purpose, prompts, what was accepted or rejected and why, across the package; AI-suggested entries tagged.'), minimum: 'At least 12 words; present even if no AI tool was used', judged: 'RB-12.1–12.3' },
  { heading: `${WEEK7_PARTS[0].n}. ${WEEK7_PARTS[0].title}`, evidence: n('All six exports loaded, one enterprise; the package index with the counts of every section.'), minimum: 'Six exports; the same enterprise in every file', judged: 'Package integrity (proposed)' },
  { heading: `${WEEK7_PARTS[1].n}. ${WEEK7_PARTS[1].title}`, evidence: n('The coverage of each trace layer and every finding with its disposition, reason and, if deferred, its owner.'), minimum: 'Every finding dispositioned (no fixed count: the audit decides how many there are)', judged: 'Package integrity (proposed); RB-9.4' },
  { heading: `${WEEK7_PARTS[2].n}. ${WEEK7_PARTS[2].title}`, evidence: n('The six fields of the executive summary and at least one lesson learned.'), minimum: 'Six fields; one lesson', judged: 'RB-11.1, RB-11.4' },
  { heading: `${WEEK7_PARTS[3].n}. ${WEEK7_PARTS[3].title}`, evidence: n('An owner for every package section, the key decision defended and the thread walked.'), minimum: `${PACKAGE_SECTIONS.length} owners; one decision; one thread reaching the architecture`, judged: 'RB-11.2, RB-11.3 (adapted)' },
  { heading: `${WEEK7_PARTS[4].n}. ${WEEK7_PARTS[4].title}`, evidence: n('Every RID received, with its severity, disposition, response and, if accepted or deferred, its owner.'), minimum: 'Every RID received (after the review)', judged: 'RB-11.6' },
]

export const LAB_PREFIXES = WEEK7_PREFIXES
export const LAB_EMPTY_ANSWER_RULE = EMPTY_ANSWER_RULE

// ------------------------------------------------------------------------------------------- presentation and review instructions
export const PRESENTATION_INSTRUCTIONS: { title: string; text: NewText }[] = [
  { title: 'Length', text: n(`The class review block is ${REVIEW_TEAM_MINUTES} minutes shared equally: with five teams a ${P5.slot}-minute slot, ${P5.briefing} minutes of briefing and ${P5.questions} of questions; with four teams ${P4.slot} minutes, ${P4.briefing} and ${P4.questions}. The timekeeper stops the briefing at its time. A slot below ${MIN_SLOT} minutes is a faculty decision.`) },
  { title: 'Content of the briefing', text: n('The executive summary (recommendation, why, conditions, residual risk, decisions needed, next increment); one key decision defended with the six-link argument (claim, evidence by ID, criteria and weights, conditions, residual risk, what would change it); one thread walked through the package from a need to the architecture and on to an interface and the roadmap where it reaches them, naming each link; the open items that matter most to Week 8.') },
  { title: 'Who speaks', text: n('Every member presents part of the briefing, and the owner of each package section answers the questions on it. Answer with IDs and links, not adjectives; say “I don’t know, it is recorded as an open item owned by…” when that is the truth.') },
  { title: 'Slides', text: n('One message per slide, the IDs visible and the jargon removed; the decision and its conditions first, in operational terms; the evidence one step away, in the package, ready to open when asked. Upload the briefing with the package.') },
]
export const REVIEW_INSTRUCTIONS: { title: string; text: NewText }[] = [
  { title: 'Before the meeting (reviewers)', text: n('Read the assigned package from its index; each member reads the sections matching their own role. Write at least two RIDs each on the form, at least one about meaning or traceability, each with a location, the criterion it breaks, a severity and a proposed fix. Upload them before Session 2.') },
  { title: 'In the meeting', text: n('The peer team raises its RIDs during the questions, major ones first; the recorder writes each RID raised and the owner’s first answer; the instructor chairs and decides. Reviewers ask; they do not argue the answer in the room.') },
  { title: 'After the meeting (owners)', text: n(`Within 3 days the owning team dispositions every RID in the package tool: ${RID_DISPOSITIONS.map((d) => `${d.label.toLowerCase()} (${d.means})`).join('; ')}. Accepted and deferred RIDs get an owner; deferred ones are carried into Week 8 as open items.`) },
]
export const LAB_ENTRY_CRITERIA = ENTRY_CRITERIA
export const LAB_EXIT_CRITERIA = EXIT_CRITERIA

// ------------------------------------------------------------------------------------------- rubric
export const RUBRIC_LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']
/** Register rows applied this week (quoted from the rubric register, never retyped). */
export const LAB_RUBRIC_ROWS: [string, string][] = [['RB-11', '11.1'], ['RB-11', '11.2'], ['RB-11', '11.3'], ['RB-11', '11.4'], ['RB-11', '11.5'], ['RB-11', '11.6'], ['RB-17', '17.1'], ['RB-17', '17.2'], ['RB-17', '17.3'], ['RB-9', '9.4'], ['RB-12', '12.1'], ['RB-12', '12.2'], ['RB-12', '12.3']]
export const LAB_RUBRIC_NOTE = n(
  'The rows of the course rubric register that this week applies, quoted from the register: the technical review and executive presentation rows, the review-findings rows for the RIDs each student writes, the trace-audit row for the package audit, and the AI usage rows. The register’s live model demonstration row is adapted for Phase I to a thread walked through the package, since no model exists yet (pending faculty approval). The register’s level texts are short, so the design-review presentation rubric below gives a full descriptor at every level for every criterion (proposed, pending faculty approval). Peer evaluation counts once, as its own component.',
)

export const studentRubricText = (s: string) =>
  s
    .replace(/\*\*/g, '')
    .replace(/\s*\[[A-Z]{1,4}\d*[^\]]*\]/g, '')
    .replace(/\s*\(B\/A2\)/g, '')
    .replace(/\bS11 (pp?\.)/g, 'SEBoK $1')
    .replace(/\s+/g, ' ')
    .trim()

export function rubricRow(id: string, criterion: string): string[] {
  const p = getRubric(id).parts.find((x) => x.type === 'table')
  const r = p && p.type === 'table' ? p.rows.find((x) => x[0] === criterion) : undefined
  if (!r) throw new Error(`${id} has no criterion ${criterion}`)
  return r.map(studentRubricText)
}

export type Criterion = { id: string; criterion: string; scope: 'team' | 'individual' | 'graduate'; maps: string; levels: [string, string, string, string] }
/** The design-review presentation rubric (proposed): team and individual criteria, a descriptor at every level. */
export const PRESENTATION_RUBRIC: Criterion[] = [
  { id: 'T1', scope: 'team', criterion: 'Package integrity', maps: 'RB-9.4; no register row scores a whole package (proposed)', levels: ['All six exports current (no stale, wording or no-longer-defined finding left that a re-export would fix, every collision renumbered or deferred with an owner); every finding dispositioned with a rationale that holds and cites its evidence; earlier dispositions that later weeks made false accepted with the evidence that superseded them; every open item owned by a person or role, with its week', 'Every finding dispositioned; one reason thin, or one open item owned by a date instead of a person', 'Findings dispositioned in bulk (“defer all”), or a stale export left in the package', 'Findings left undispositioned, or the package built from fewer than six exports'] },
  { id: 'T2', scope: 'team', criterion: 'Technical content and evidence', maps: 'RB-11.1', levels: ['Every claim in the briefing traced to a package ID or analysis; assumptions and open items stated where they bear on a claim', 'Most claims traced; one assumption implicit', 'Claims stated without IDs or analysis', 'Claims contradicted by the package'] },
  { id: 'T3', scope: 'team', criterion: 'Decision justification', maps: 'RB-11.2', levels: ['The key decision defended on all six links: claim, evidence by ID, criteria and weights with their reasons, conditions from the sensitivity, residual risk by R ID, and what would change it', 'All links present; one thin (for example a condition without its threshold)', 'The decision asserted with a total score only, no sensitivity', 'No decision defended'] },
  { id: 'T4', scope: 'team', criterion: 'Thread walk (Phase I adaptation of the live demonstration)', maps: 'RB-11.3, adapted (pending faculty approval)', levels: ['One thread walked from a need through its requirements to the architecture, and on to an interface and the roadmap where it reaches them, naming each link; a reviewer’s trace question answered from the package', 'The thread walked with one link unnamed or a hesitation', 'IDs recited without their links, or the thread stops before the architecture', 'No thread, or a thread with a link that does not exist'] },
  { id: 'T5', scope: 'team', criterion: 'Audience adaptation', maps: 'RB-11.4', levels: ['The decision and its conditions in operational terms first; one message per slide; the evidence one step away and opened when asked; the summary carries all six fields', 'Mostly adapted; one slide technical only', 'Technical throughout; a non-specialist could not say what was asked', 'Unclear what was asked'] },
  { id: 'T6', scope: 'team', criterion: 'Review conduct and dispositions', maps: 'RB-11.6', levels: ['On time; every RID received dispositioned within 3 days with a response; accepted and deferred ones owned; every rejection backed by an ID, a decision or a computation', 'On time; one response thin', 'RIDs accepted wholesale, or rejected without evidence, or late', 'RIDs not dispositioned'] },
  { id: 'I1', scope: 'individual', criterion: 'Answers on own elements', maps: 'RB-11.5 (scored per student)', levels: ['Answers questions on the elements the student owns correctly, with the reasoning and the IDs that support it; names an open item and its owner when that is the answer', 'Correct, with shallow reasoning', 'Partly correct, or answers outside the question', 'Cannot answer'] },
  { id: 'I2', scope: 'individual', criterion: 'Peer review findings (RIDs)', maps: 'RB-17.1–17.3', levels: ['At least two RIDs, each a real defect with its location and the criterion or source it breaks, a sensible severity and a concrete fix; at least one about meaning or traceability', 'Two RIDs; one lacks its criterion or its fix', 'Style-only findings, or findings without locations', 'No valid RID'] },
  { id: 'G1', scope: 'graduate', criterion: 'Coverage reported (graduate)', maps: 'RB-9.4', levels: ['Coverage per layer reported from the tool and reproduced by hand for one layer, with the counting rule stated', 'Coverage reported, counting rule implicit', 'Coverage asserted without the per-layer numbers', 'No coverage reported'] },
  { id: 'G2', scope: 'graduate', criterion: 'Every gap listed with its disposition (graduate)', maps: 'RB-9.4', levels: ['Every orphan and childless parent listed with its disposition, and the dispositions judged: which reasons will still hold in Phase II', 'Listed and dispositioned, not judged', 'Partial list', 'No gaps listed'] },
  { id: 'G3', scope: 'graduate', criterion: 'The gap that most threatens the Week 8 import (graduate)', maps: 'RB-9.5 (impact), adapted', levels: ['Names the gap whose propagation into the model would cost most, traces the model elements and relationships it would corrupt, and says what would close it', 'Names the gap and its effect, without the trace', 'A generic “traceability matters” paragraph', 'No gap named'] },
  { id: 'G4', scope: 'graduate', criterion: 'Limits of the audit (graduate)', maps: 'RB-9.4', levels: ['States what the structural audit cannot see in this package (for example partial coverage) with one example found by reading, and how the review would catch it', 'A limit named without an example', 'Generic limits only', 'No limit stated'] },
]

/** The peer-review RID form (course convention): the fields each reviewer fills in, with what each must hold. */
export const RID_FORM_FIELDS: { field: string; holds: string }[] = [
  { field: 'RID number and reviewer', holds: 'RID-1, RID-2 … and your name and role (the owning team numbers RIDs RID-001, RID-002 … for the whole package when it enters them in its tool)' },
  { field: 'Package reviewed', holds: 'the team and the package file you read' },
  { field: 'Where', holds: 'the ID (for example REQ-SYS-004) or the package section title the finding concerns' },
  { field: 'What is wrong', holds: 'one or two sentences: the defect, not a feeling' },
  { field: 'Criterion or source', holds: 'the rule it breaks: a lecture rule, a review criterion, or a cited source with its page' },
  { field: 'Severity', holds: SEVERITIES.map((s) => `${s.label}: ${s.means}`).join('; ') },
  { field: 'Proposed fix', holds: 'what would close it' },
]
/** The RID form as Markdown, for reviewers to fill in and upload (Assessment page download). */
export function ridFormMarkdown(): string {
  const L = ['# Week 7 peer review: review item discrepancies (RIDs)', '', 'Write at least two RIDs on the package you were assigned. At least one should concern meaning or traceability, not style. A finding with no location or no criterion cannot be checked or fixed.', '']
  for (const k of [1, 2, 3]) {
    L.push(`## RID-${k}`, '')
    for (const f of RID_FORM_FIELDS) L.push(`- **${f.field}** (${f.holds}): `)
    L.push('')
  }
  L.push('## For the owning team (after the review)', '', `- Disposition: ${RID_DISPOSITIONS.map((d) => d.label.toLowerCase()).join(', ')}`, '- Response:', '- Owner (accept or defer):', '')
  return L.join('\n')
}

export const LAB_SUBMISSION = {
  format: n('Export two files from the package tool: team-NN-week7-package.md (the package index with its readiness report) and team-NN-week7-package.json (the package file). Add the briefing as a PDF or deck. Each file states the package’s readiness.'),
  where: n(`One member uploads the files to the ${LAB7_WHERE} at least 24 h before Session 2, and the closed package within 3 days of Session 2. Each member uploads their RIDs to the “Week 7 peer review” assignment before Session 2.`),
  grading: n('The design-review presentation rubric on the Assessment page: six team criteria, two individual criteria, four levels each. Weights follow the course assessment table; the rubric is proposed, pending faculty approval.'),
  aiUse: 'AI tools may help draft the executive summary wording, check the package for missing fields and rehearse questions; tag each AI-suggested entry AI-suggested-reviewed and say in the AI usage summary what the tool suggested and what you changed or rejected. The team owns every disposition, decision and answer.',
  graduate: n('Graduate students also write a package trace-audit memo (one page, about 40 minutes; four criteria on four levels, 16 points): the coverage of each trace layer with the counting rule; every orphan and childless parent with its disposition, judged for whether it will still hold in Phase II; the one gap that most threatens the Week 8 import, traced to the model elements it would corrupt; and what the structural audit cannot see in your package, with one example found by reading.'),
}

export const LAB_TOOL = n(
  'The package tool reads your six weekly exports with each week’s own importer and builds the package: the index of every ID by the week that defines it, the typed links, the coverage of every trace layer and the findings, consistency across the weeks (stale exports, IDs no longer defined, wording drift, collisions where two elements share one ID, dispositions no longer true, open items an earlier week recorded and a later one dropped) and traceability (childless needs, orphan requirements, requirements not flowed down or not allocated, capabilities without a function, elements and externals without an interface, increments serving unknown IDs), with the open items of your Week 6 baseline review. Where an earlier week recorded a reason for a gap, the tool carries it as a starting disposition for you to confirm. Every disposition, summary field, review choice and review finding lists its hard gates, each marked pass or fails, and its advisories, which never block. One-word answers are accepted wherever the lecture calls a word complete; an answer that says nothing is not. The dispositions are three: corrected and re-imported (never typed: the finding disappears), accepted with a rationale that cites its evidence, or deferred to a Phase II week with an owner; a rationale that only claims “fixed”, “resolved” or “withdrawn” is refused while the finding is still found, and a collision can only be deferred. Teammates share the package file, and the tool asks before replacing work. Everything is saved in your browser only, so export after every working session.',
)

export const LAB_WORKLOAD: { activity: string; hours: number }[] = [
  { activity: `Studio and review in class (Session 1, ${IN_CLASS.studio} min; Session 2, ${IN_CLASS.review} min; inside the class hours)`, hours: 0 },
  { activity: `Lab L7 out of class: your share of about ${LAB7_TEAM_HOURS.toFixed(1)} person-hours (team of four)`, hours: LAB7_EACH },
]
export const LAB_WORKLOAD_NOTE = n(
  `About ${LAB7_TEAM_HOURS.toFixed(1)} person-hours of out-of-class team work for a team of four (${LAB7_PERSON_HOURS.map((x) => `${x.task} ${x.hours.toFixed(1)}`).join('; ')}), so about ${LAB7_EACH.toFixed(1)} h each; the peer review (about 1 h) is individual and listed on the week page. A team of three has a package about three quarters the size but the same briefing: about ${LAB7_THREE_PERSON.teamHours.toFixed(1)} person-hours, ${LAB7_THREE_PERSON.each.toFixed(1)} h each (pending faculty confirmation). A graduate student on a team of three reaches about 8.3 h with the trace-audit memo, above the 8.0 h budget: a faculty decision.`,
)

// ------------------------------------------------------------------------------------------- gate justification
export type GateTableRow = { group: string; kind: 'gate' | 'advisory'; id: string; checks: string; basis: string; taught: string }
const gateRows = (group: string, rows: readonly { id: string; short: string; basis: string; taught?: Taught }[], kind: 'gate' | 'advisory'): GateTableRow[] =>
  rows.map((g) => ({ group, kind, id: g.id, checks: g.short, basis: g.basis, taught: g.taught ? taughtText(g.taught) : 'advisory: never blocks' }))
export const GATE_TABLE: GateTableRow[] = [
  ...gateRows('Package sources', SOURCE_GATES, 'gate'),
  ...gateRows('Package sources', SOURCE_ADVISORIES, 'advisory'),
  ...gateRows('Audit finding', FINDING_GATES, 'gate'),
  ...gateRows('Audit finding', FINDING_ADVISORIES, 'advisory'),
  ...gateRows('Executive summary', SUMMARY_GATES, 'gate'),
  ...gateRows('Review preparation', PREP_GATES, 'gate'),
  ...gateRows('Review preparation', PREP_ADVISORIES, 'advisory'),
  ...gateRows('Review finding (RID)', RID_GATES, 'gate'),
  ...gateRows('Review finding (RID)', RID_ADVISORIES, 'advisory'),
  ...PART_RULES.map((g) => ({ group: 'Part rule', kind: g.kind === 'gate' ? ('gate' as const) : ('advisory' as const), id: g.id, checks: g.short, basis: g.basis, taught: 'taught' in g && g.taught ? taughtText(g.taught) : 'advisory: never blocks' })),
]

// ------------------------------------------------------------------------------------------- Markdown
const cite = (c: Citation) => formatCitation(c)
const md = (s: string) => s.replace(/\|/g, '\\|')

/** The same instructions as the Laboratory page, as Markdown (docs/lectures/week07/WEEK7_LAB_INSTRUCTIONS.md). */
export function labMarkdown(): string {
  const L: string[] = []
  const table = (head: string[], rows: string[][]) => {
    L.push(`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`)
    for (const r of rows) L.push(`| ${r.map((c) => md(c).replace(/\n/g, ' ')).join(' | ')} |`)
    L.push('')
  }
  L.push(`# Week 7 ${LAB_TITLE}`, '')
  L.push('> Generated from `learning-studio/src/content/lab/week07Lab.ts` by `node scripts/build-lab-md.mjs 7`; the Laboratory page (`#/week/7/lab`) renders the same source. Do not edit this file by hand. Review status: new-pending-review.', '')
  L.push(`Week 7 — ${W7.title}. AeroLink is the instructor’s FICTIONAL worked example; this package is about your team’s own enterprise.`, '')
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
  L.push('## Entry and exit criteria of the design review', '')
  table(['Criterion', 'What it requires'], [...LAB_ENTRY_CRITERIA.map((c) => ['Entry', c]), ...LAB_EXIT_CRITERIA.map((c) => ['Exit', c])])
  L.push('## Presentation instructions', '')
  for (const x of PRESENTATION_INSTRUCTIONS) L.push(`- **${x.title}.** ${x.text.text}`)
  L.push('', '## Review instructions', '')
  for (const x of REVIEW_INSTRUCTIONS) L.push(`- **${x.title}.** ${x.text.text}`)
  L.push('', '## Expected outputs', '')
  for (const f of LAB_OUTPUT_FILES) L.push(`- \`${f.name}\`: ${f.what}.`)
  L.push('', 'The Week 7 work adds five parts to the Team Record and updates one.', '')
  table(['Part', 'Evidence required', 'Minimum (completeness check)', 'Judged by'], LAB_PARTS.map((p) => [p.heading, p.evidence.text, p.minimum, p.judged]))
  L.push('### IDs this week adds', '')
  table(['Prefix', 'Artifact type', 'Owner (lead role)'], LAB_PREFIXES.map((p) => [p.prefix, p.type, p.owner]))
  L.push('## Why each check blocks, or only advises', '', 'A hard gate stops an entry counting only where a sentence you can read in the lecture says the failure is a real defect; the last column names that slide and quotes the sentence. Anything that can occur in good work is an advisory, shown and never blocking. No check tests the form or length of a name.', '', EMPTY_ANSWER_RULE, '')
  table(['Where', 'Check', 'Hard gate or advisory', 'What it checks', 'Basis', 'Where you read it'], GATE_TABLE.map((g) => [g.group, g.id, g.kind === 'gate' ? 'hard gate' : 'advisory', g.checks, g.basis, g.taught]))
  L.push('## Grading', '', LAB_RUBRIC_NOTE.text, '', '### Register rows applied', '')
  table(['Criterion', ...RUBRIC_LEVELS], LAB_RUBRIC_ROWS.map(([rb, c]) => {
    const r = rubricRow(rb, c)
    return [`${rb}.${r[0].split('.')[1]} ${r[1]}`, ...r.slice(2, 6)]
  }))
  L.push('### Design-review presentation rubric (proposed, pending faculty approval)', '')
  table(['Criterion', 'Scope', 'Register row', ...RUBRIC_LEVELS], PRESENTATION_RUBRIC.map((x) => [`${x.id} ${x.criterion}`, x.scope, x.maps, ...x.levels]))
  L.push('### The peer-review RID form', '')
  table(['Field', 'What it holds'], RID_FORM_FIELDS.map((f) => [f.field, f.holds]))
  L.push('## Submission', '')
  L.push(`- **Format.** ${LAB_SUBMISSION.format.text}`, `- **Where and when.** ${LAB_SUBMISSION.where.text}`, `- **How it is graded.** ${LAB_SUBMISSION.grading.text}`, `- **AI use.** ${LAB_SUBMISSION.aiUse}`, `- **Graduate task.** ${LAB_SUBMISSION.graduate.text}`, '')
  L.push('## The package tool', '', LAB_TOOL.text, '')
  L.push('## Workload', '')
  table(['Activity', 'Hours per student'], LAB_WORKLOAD.map((w) => [w.activity, w.hours ? w.hours.toFixed(1) : 'in class']))
  L.push(LAB_WORKLOAD_NOTE.text, '')
  return L.join('\n')
}
