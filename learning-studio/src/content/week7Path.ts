// Week 7 on the lecture-first path (DECISION_LOG A20, A21 decision 7, A24): the week page's text (subject, how the week
// runs, readings, deliverables, entry cards) and the workload. Everything here is new and flagged for review (PENDING).
// AeroLink is the instructor's worked example; each team's package and review are about its own enterprise (A21 item 9).
// Week 7 is a review week: no readiness quiz (A21; course.ts FACULTY_DECISIONS), and the old Exam 1 placement is an open
// faculty decision that this module does not resolve.
//
// Workload (A21 item 4): at most 8.0 h per student for a team of four. The class minutes are read from the slides; the lesson
// hours from the lesson's word count; the lab person-hours from labBrief.ts (single source).
import { WEEKS } from './course'
import { lecturesOfWeek, weekLesson } from './lectures'
import { allSlides, blockText, lectureMinutes, wordCount } from './lectures/text'
import { getReading, type Citation } from './readings'
import { PENDING, type NewText } from './learn/types'
import { LAB7_PERSON_HOURS, LAB7_TEAM_HOURS, THREE_PERSON_ITEM_RATIO, reviewPlan } from './lectures/week07/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
export const W7 = WEEKS[6]
export const WEEK7_BUDGET_HOURS = 8.0

/** The Week 7 subject as scheduled (COURSE_SCHEDULE.md: Final Presentation), and the topics as this week teaches them. */
export const WEEK7_TOPICS = [
  'The Phase I package as a baseline: what it contains, what it records as open, and the executive summary',
  'Consistency across the weeks: one enterprise, one ID, one meaning',
  'Bidirectional traceability across the package: coverage, findings and dispositions',
  'The design review: purpose, preparation, entry and exit criteria, roles; the SRR as an analogy',
  'Presenting and defending engineering decisions: argument structure; trade, risk and roadmap rationale',
  'Review findings (RIDs) and their dispositions; readiness for the Week 8 model',
]

export const WEEK7_LEDE = n(
  'This week your team turns six weeks of records into one Systems Thinking Engineering Package and takes it through a design review. The instructor teaches what a Phase I package is for and what it contains, how to check it for consistency and traceability across the weeks and disposition every gap, how a technical review is prepared, conducted and completed, and how to present and defend engineering decisions and answer review findings; the whole method is worked once on the instructor’s own AeroLink package. Your team then assembles its package from its six weekly exports with the package tool, presents it in the Phase I design review, and reviews another team’s package.',
)
export const WEEK7_WHY = n(
  'In Week 8 the package becomes model v0.1 of your enterprise: every ID becomes a model element and every link a relationship. A package that agrees with itself, records what is open and names who closes it is a model that starts clean; every inconsistency left now becomes a modeling defect later. The review is where an independent eye finds what your own checks could not.',
)

/** Proposed objective (outline §1, W7.4), pending faculty approval; W7.1–W7.3 come from course.ts. */
export const PROPOSED_OBJECTIVES: { id: string; text: string; bloom: string }[] = [
  { id: 'W7.4', text: 'Explain the purpose, preparation, entry and exit criteria and roles of a technical review, and relate the Phase I review to the System Requirements Review', bloom: 'Understand / Analyze' },
  { id: 'W7.5', text: 'Answer review findings with dispositions (accept, defer, reject) backed by evidence, and carry the open ones forward with owners', bloom: 'Evaluate' },
]

const sessions = lecturesOfWeek(7)
const s1 = sessions.find((l) => l.session === 1)
const s2 = sessions.find((l) => l.session === 2)
const s1Studio = s1?.sections.find((s) => s.id === 'w7s1-studio')
const s2Review = s2?.sections.find((s) => s.id === 'w7s2-review')
/** In-class minutes of the studio (Session 1) and of the review (Session 2), read from the slides. */
export const STUDIO_MINUTES = s1Studio ? s1Studio.slides.reduce((a, s) => a + s.minutes, 0) : 13
export const REVIEW_MINUTES = s2Review ? s2Review.slides.reduce((a, s) => a + s.minutes, 0) : 44
const s1Lecture = s1 ? lectureMinutes(s1) - STUDIO_MINUTES : 56
const s2Lecture = s2 ? lectureMinutes(s2) - REVIEW_MINUTES : 25
export const PLAN_FIVE = reviewPlan(5)
export const PLAN_FOUR = reviewPlan(4)

export const TIMELINE: { id: string; when: string; what: string; detail: NewText }[] = [
  { id: 'session1', when: 'Session 1 · 75 min', what: 'Lecture: the Phase I package and its design review, then the integration studio', detail: n(`About ${s1Lecture} min of lecture (${s1 ? allSlides(s1).length : 21} slides): the package as a baseline, its contents and executive summary, consistency across the weeks, bidirectional traceability, the audit and its dispositions worked on AeroLink, and the design review with its entry and exit criteria and roles; then ${STUDIO_MINUTES} min of studio: your team loads its six exports into the package tool, reads its audit and dispositions its first findings.`) },
  { id: 'entry', when: 'Between the sessions', what: 'Package submitted; peer review written', detail: n('Your team submits its package index and readiness report with the JSON package at least 24 h before Session 2 (the entry criterion). Each member reads the sections of the assigned peer package that match their own role and writes at least two review findings (RIDs) on the form on the Assessment page.') },
  { id: 'session2', when: 'Session 2 · 75 min', what: 'Lecture: presenting and defending decisions; then the Phase I design review', detail: n(`About ${s2Lecture} min of lecture on defending engineering decisions and answering review findings, worked on AeroLink; then ${REVIEW_MINUTES} min of review: each team briefs its package, defends one decision, walks one thread and answers its reviewers’ RIDs (five teams: ${PLAN_FIVE.slot}-min slots; four teams: ${PLAN_FOUR.slot}-min slots).`) },
  { id: 'exit', when: 'Within 3 days of Session 2', what: 'Review closed', detail: n('Your team dispositions every RID it received (accept, defer or reject, each with a response; accepted and deferred ones owned), enters them in the package tool and uploads the closed package. Peer evaluation and the graduate task are due at the same time.') },
]

// ------------------------------------------------------------------------------------------- readings
export const READING_RATE_PAGES_PER_HOUR = 15
/** Essential readings, narrowed to the pages the lecture teaches from (10 pages). */
export const REQUIRED_READINGS_CITES: Citation[] = [
  { reading: 'R06c', pages: '386–388' },
  { reading: 'R40', pages: '69–70' },
  { reading: 'R45', pages: '118–119' },
  { reading: 'R56', pages: '387–389' },
]
export const pageCount = (c: Citation): number => {
  const r = getReading(c.reading)
  if (!c.pages) return r.lastPage - r.firstPage + 1
  const [a, b] = c.pages.split(/[–-]/).map((x) => parseInt(x.trim(), 10))
  return Number.isNaN(b) || b === undefined ? 1 : b - a + 1
}
export const REQUIRED_READINGS = REQUIRED_READINGS_CITES.map((c) => ({ citation: c, reading: getReading(c.reading), pages: pageCount(c) }))
export const REQUIRED_PAGES = REQUIRED_READINGS.reduce((a, r) => a + r.pages, 0)
export const EXTENSION_READINGS: Citation[] = [
  { reading: 'R36', pages: '498–499' },
  { reading: 'R43', pages: '109–110' },
  { reading: 'R44', pages: '111–112' },
  { reading: 'R13', pages: '565–566' },
  { reading: 'R18', pages: '473–474' },
  { reading: 'R105', pages: '531' },
]
export const READINGS_NOTE = n('Read SEBoK’s technical reviews article and the DoD requirements management pages before Session 1, and MITRE’s design assessment pages before Session 2. The extension pages cover configuration baselines, decision analysis, technical assessment, requirement verification and validation, cognitive bias in decisions, and communicating a plan; they are the basis of the graduate task.')

// ------------------------------------------------------------------------------------------- deliverables
export const DELIVERABLES: { id: string; what: string; who: string; due: string; where: string }[] = [
  { id: 'package', what: 'Package index and readiness report (.md) and the package (.json), ready for review', who: 'Team, one upload', due: '24 h before Session 2 (entry criterion)', where: 'LMS assignment “Week 7 Phase I package”' },
  { id: 'rids', what: 'At least two review findings (RIDs) on the assigned peer package', who: 'Each member', due: 'Before Session 2', where: 'LMS assignment “Week 7 peer review”, on the RID form' },
  { id: 'briefing', what: 'Design review briefing: summary, one decision defended, one thread walked', who: 'Team; every member presents and answers', due: 'Session 2', where: 'In class (slides uploaded with the package)' },
  { id: 'closed', what: 'Closed package: every RID dispositioned, exported again', who: 'Team, one upload', due: 'Within 3 days of Session 2 (exit criterion)', where: 'LMS assignment “Week 7 Phase I package” (resubmission)' },
  { id: 'peer', what: 'Peer evaluation of your teammates', who: 'Individual', due: 'Within 3 days of Session 2', where: 'LMS form' },
  { id: 'grad', what: 'Graduate task: the package trace-audit memo (one page, about 40 min)', who: 'Graduate students, individual', due: 'Within 3 days of Session 2', where: 'LMS assignment “Week 7 graduate task”' },
]

export const ENTRY_TEXT = {
  lecture: n('The two 75-minute sessions as the instructor presents them: the slide viewer with keyboard navigation and a print handout. Download the PowerPoint deck to annotate offline.'),
  lesson: n('The long-form lesson: the explanation behind every slide, with the figures, the definitions and their sources, and the AeroLink package and review in full.'),
  examples: n('The instructor’s own Phase I package worked step by step: the package index, the coverage and every audit finding with its disposition, one thread from a need to the roadmap, the executive summary, and four review findings with their dispositions.'),
  lab: n('Full instructions for Lab L7: purpose, inputs, method, procedure, outputs, the gate-justification table, the presentation and review instructions and submission, with the package tool that imports your six weekly exports.'),
  assessment: n('The design-review presentation rubric (team and individual) with level descriptors, the peer-review RID form, the graduate task, and your package’s readiness. No quiz this week: the review is the assessment.'),
}

// ------------------------------------------------------------------------------------------- workload
/** Reading rate for the lesson (the rate earlier weeks used; reviews flagged it as optimistic for tables). */
export const LESSON_WPM = 150
export function lessonWords(): number {
  let words = 0
  for (const { section } of weekLesson(7))
    for (const b of section.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') words += wordCount(b.text)
      else if (b.kind !== 'figure' && b.kind !== 'slide-ref') words += blockText(b).reduce((a, t) => a + wordCount(t), 0)
    }
  return words
}
const round1 = (x: number) => Math.round(x * 10) / 10

/** Lab L7 out of class in person-hours for a team of four (labBrief.ts is the single source). */
export const LAB_PERSON_HOURS = LAB7_PERSON_HOURS
export const LAB_TEAM_HOURS = LAB7_TEAM_HOURS
/** Per-student rows other than class, readings, lesson and the team lab. */
export const PEER_REVIEW_HOURS = 1.0
export const GRADUATE_TASK_HOURS = 0.7

export const WORKLOAD_ROWS: { id: string; activity: string; hours: number }[] = (() => {
  const words = lessonWords()
  return [
    { id: 'class', activity: 'Class sessions (2 × 75 min), the review included', hours: 2.5 },
    { id: 'readings', activity: `Readings: ${REQUIRED_PAGES} pages at about ${READING_RATE_PAGES_PER_HOUR} pages an hour`, hours: round1(REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR) },
    { id: 'lesson', activity: `Detailed lesson and worked examples (${words.toLocaleString('en-US')} words at about ${LESSON_WPM} words a minute)`, hours: Math.max(0.1, round1(words / LESSON_WPM / 60)) },
    { id: 'lab', activity: `Lab L7 out of class: your share of about ${LAB_TEAM_HOURS} person-hours (team of four)`, hours: round1(LAB_TEAM_HOURS / 4) },
    { id: 'peer', activity: 'Peer review: read your sections of the assigned package and write at least two RIDs', hours: PEER_REVIEW_HOURS },
    { id: 'owner', activity: 'Prepare to answer for the elements you own (individual questions in the review)', hours: 0.3 },
    { id: 'evaluation', activity: 'Peer evaluation', hours: 0.2 },
    { id: 'log', activity: 'Time log', hours: 0.1 },
  ]
})()
export const WORKLOAD_TOTAL = round1(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0))
/** Graduate students add the trace-audit memo (no exercise or quiz to replace this week). */
export const GRADUATE_HOURS = round1(WORKLOAD_TOTAL + GRADUATE_TASK_HOURS)

/** A three-person team: tasks that scale with the size of the record shrink by the item ratio; fixed tasks do not (A21
 *  item 4, pending confirmation). The per-person lab load is HIGHER than for a team of four, because the briefing and the
 *  package front matter are the same size for every team: reported as a faculty item, never hidden. */
export const THREE_PERSON = (() => {
  const teamHours = round1(LAB_PERSON_HOURS.reduce((a, t) => a + t.hours * (t.scales === 'items' ? THREE_PERSON_ITEM_RATIO : 1), 0))
  const each = round1(teamHours / 3)
  const four = WORKLOAD_ROWS.find((r) => r.id === 'lab')!.hours
  return { teamHours, each, total: round1(WORKLOAD_TOTAL - four + each) }
})()

/** A graduate student on a team of three (review m6): reported as a faculty item, never hidden. */
export const GRADUATE_THREE_PERSON = round1(THREE_PERSON.total + GRADUATE_TASK_HOURS)

export const WORKLOAD_SUMMARY = n(
  `Hours per student for a team of four: ${WORKLOAD_TOTAL.toFixed(1)} h against the ${WEEK7_BUDGET_HOURS.toFixed(1)} h budget; graduate students ${GRADUATE_HOURS.toFixed(1)} h with the trace-audit memo. No readiness quiz this week: the review is the assessment. A team of three shares a package about three quarters the size but the same briefing: about ${THREE_PERSON.teamHours} person-hours, ${THREE_PERSON.each.toFixed(1)} h each, ${THREE_PERSON.total.toFixed(1)} h for the week (pending faculty approval); a graduate student on a team of three reaches ${GRADUATE_THREE_PERSON.toFixed(1)} h${GRADUATE_THREE_PERSON > WEEK7_BUDGET_HOURS ? ', above the budget: a faculty decision' : ''}. The lesson estimate assumes about ${LESSON_WPM} words a minute; log your actual hours so the estimate can be tested.`,
)
