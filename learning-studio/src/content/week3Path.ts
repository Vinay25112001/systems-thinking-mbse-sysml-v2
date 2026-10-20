// Week 3 on the lecture-first path (DECISION_LOG A20, A21): the week page's text (subject, how the week runs, readings,
// deliverables, entry cards) and the workload. Everything here is new and flagged for review (PENDING). AeroLink is the
// instructor's worked example; each team's lab and record are about its own enterprise (DECISION_LOG A21 item 9).
//
// Workload (outline §5.7; A21 item 4): 8.0 h per student for a team of four, the lab proportional to team size. The
// in-class lab minutes are read from the Session 2 slides; the lesson hours from the lesson's word count; the lab
// person-hours from labBrief.ts (single source).
import { WEEKS } from './course'
import { lecturesOfWeek, weekLesson } from './lectures'
import { blockText, lectureMinutes, allSlides, wordCount } from './lectures/text'
import { getReading, type Citation } from './readings'
import { PENDING, type NewText } from './learn/types'
import { LAB3_MINIMUMS as MIN, LAB3_MINIMUMS_THREE as MIN3, LAB3_PERSON_HOURS } from './lectures/week03/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
export const W3 = WEEKS[2]
export const WEEK3_BUDGET_HOURS = 8.0

/** The Week 3 subject as scheduled (COURSE_SCHEDULE.md), and the topics as this week teaches them (TPMs moved here from
 *  Week 2, A21 item 5; security and resilience integrated, A21 item 6). */
export const WEEK3_TOPICS = [
  'Technology readiness assessment with evidence or labeled assumptions, and the limits of TRLs',
  'Risk statements, rating on defined scales, the limits of risk matrices, and handling',
  'Security and resilience risks in the same register',
  'Technical performance measures: estimate, contingency, worst case, margin and planned profile',
  'Trade study: criteria traced to MOEs, value functions, swing weights, sensitivity and a justified decision',
]

export const WEEK3_LEDE = n(
  'This week makes your team’s uncertainty explicit and then decides with it in view. The instructor teaches how to assess the readiness of the technologies your requirements depend on, how to write, rate and handle risks (including the security and resilience risks teams usually forget), how to track a risky number with a technical performance measure, and how to run a trade study whose weights and sensitivity a reviewer can check; the whole method is worked once on AeroLink. Your team then applies it to its own enterprise in Lab L3, extending its Week 2 Team Record.',
)
export const WEEK3_WHY = n(
  'Each method feeds something later. The decision your trade study recommends is the starting configuration of the Week 4 architecture and creates derived requirements that Week 5 writes into interfaces; the security and resilience risks return in Week 5 (interfaces that need authentication) and Week 6 (the evolution roadmap). In Phase II, Week 12 models your register as risk metadata on the digital thread and uses your TPMs as verification evidence, and Week 13 redoes this trade study as SysML v2 analysis cases with your TPM thresholds as constraints.',
)

/** Proposed objectives from the outline (§1), pending faculty approval; W3.1–W3.4 come from course.ts. */
export const PROPOSED_OBJECTIVES: { id: string; text: string; bloom: string }[] = [
  { id: 'W3.5', text: 'Distinguish assumptions, risks, opportunities, unknowns and issues, and link each register entry to the requirements, capabilities and scenarios it affects', bloom: 'Analyze' },
  { id: 'W3.6', text: 'Define a technical performance measure for a risky requirement with threshold, objective, current estimate, contingency and margin, and interpret its trend', bloom: 'Apply' },
]

const sessions = lecturesOfWeek(3)
const s1 = sessions.find((l) => l.session === 1)
const s2 = sessions.find((l) => l.session === 2)
const s2Lab = s2?.sections.find((s) => s.id === 'w3s2-lab')
const labMin = (id: string, fallback: number) => s2Lab?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: s2Lab ? s2Lab.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w3s2-lab-brief', 3),
  plan: labMin('w3s2-lab-plan', 8),
  checkpoint: labMin('w3s2-lab-checkpoint', 9),
  close: labMin('w3s2-lab-close', 2),
  checkpointTeams: 5,
}
const s2LectureMinutes = s2 ? lectureMinutes(s2) - S2_LAB.total : 47

export const TIMELINE: { id: string; when: string; what: string; detail: NewText }[] = [
  { id: 'session1', when: 'Session 1 · 75 min', what: 'Lecture: readiness, risk and the measures that track it', detail: n(`${s1 ? allSlides(s1).length : 25} slides, all lecture: what a readiness assessment is for and what a TRL does not tell you, writing and rating risks and the limits of the risk matrix, security and resilience risks, and technical performance measures with honest margins, each worked on AeroLink. Ends with the preparation for Session 2: each member lists two technologies and one decision.`) },
  { id: 'session2', when: 'Session 2 · 75 min', what: 'Lecture, then the Lab L3 launch', detail: n(`About ${s2LectureMinutes} min of lecture on decision management and the trade study, worked in full on AeroLink (criteria, weights, scores, sensitivity, the weighted-sum pitfalls and the decision record), then about ${S2_LAB.total} min of laboratory launch: the team chooses its decision and technologies, and the instructor checks each team’s decision and alternatives.`) },
  { id: 'lab', when: 'Out of class · 7 days', what: 'Lab L3: readiness, risk, TPMs and a trade study', detail: n(`Your team extends its Week 2 Team Record: a readiness assessment of at least ${MIN.technologies} technologies, a register with at least ${MIN.risks} risks (one security and one resilience risk among them), at least ${MIN.tpms} TPMs, and a trade study of at least ${MIN.alternatives} alternatives against ${MIN.criteria} criteria with a sensitivity analysis and a recommendation.`) },
  { id: 'assessment', when: 'Before Week 4, Session 1', what: 'Assessment and submission', detail: n('Take readiness quiz Q3 (individual, formative) and the individual applied exercise (graduate students: the Monte Carlo memo instead), and upload the Week 3 record with its model-inputs file.') },
]

// ------------------------------------------------------------------------------------------- readings
export const READING_RATE_PAGES_PER_HOUR = 15
/** Essential readings, narrowed to the pages the lecture teaches from (12 pages, so the detailed lesson carries the
 *  explanation within the 8 h budget, as in Weeks 1 and 2). */
export const REQUIRED_READINGS_CITES: Citation[] = [
  { reading: 'R16', pages: '766–767' },
  { reading: 'R17', pages: '481–484' },
  { reading: 'R18', pages: '465–466' },
  { reading: 'R18', pages: '469' },
  { reading: 'R44', pages: '117' },
  { reading: 'R24', pages: '1208' },
  { reading: 'R25', pages: '1232' },
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
  { reading: 'R60', pages: '524–526' },
  { reading: 'R61a', pages: '630–633' },
  { reading: 'R46', pages: '124–127' },
  { reading: 'R44', pages: '113–116' },
  { reading: 'R43', pages: '109–110' },
  { reading: 'R18', pages: '471–474' },
  { reading: 'R24', pages: '1203–1206' },
  { reading: 'R25', pages: '1229–1233' },
]
export const READINGS_NOTE = n('Read R16 and R17 before Session 1 if you can, and the R18 pages before Session 2; the rest after the lectures. The extension pages deepen the risk-writing, TPM and decision-analysis rules and are the basis of the graduate memo (R18 pp.471–472 on Monte Carlo).')

// ------------------------------------------------------------------------------------------- deliverables
export const DELIVERABLES: { id: string; what: string; who: string; due: string; where: string }[] = [
  { id: 'prework', what: 'Two technologies the enterprise depends on (first TRL and basis) and one decision the team will soon face', who: 'Each member', due: 'Start of Session 2', where: 'Brought to class (not uploaded)' },
  { id: 'checkpoint', what: 'Decision statement, alternatives and the checkpoint decision', who: 'Team', due: 'End of Session 2 (or on the LMS within 48 h)', where: 'Recorded in the lab tool; the decision is the instructor’s' },
  { id: 'record', what: 'Week 3 record (.md) and model inputs (.json)', who: 'Team, one upload', due: 'Before Week 4, Session 1', where: 'LMS assignment “Week 3 Team Record”' },
  { id: 'quiz', what: 'Readiness quiz Q3', who: 'Individual', due: 'Before Week 4, Session 1', where: 'Assessment page (formative)' },
  { id: 'exercise', what: 'Individual applied exercise (about 35 min, unseen case)', who: 'Individual', due: 'Before Week 4, Session 1', where: 'LMS assignment “Week 3 applied exercise”' },
  { id: 'grad', what: 'Graduate memo: Monte Carlo on the team’s uncertain scores (one page)', who: 'Graduate students, individual', due: 'Before Week 4, Session 1', where: 'LMS assignment “Week 3 graduate memo” (replaces the applied exercise)' },
]

export const ENTRY_TEXT = {
  lecture: n('The two 75-minute lectures as the instructor presents them: the slide viewer with keyboard navigation and a print handout. Download the PowerPoint deck to annotate offline.'),
  lesson: n('The long-form lesson: the explanation behind every slide, with the figures, the definitions and their sources, and the AeroLink case in full.'),
  examples: n('The AeroLink case worked step by step: the readiness assessment, the register with its security and resilience risks, the TPM margins and planned profile, and the Year-2 capacity trade with its sensitivity analysis and decision record.'),
  lab: n('Full instructions for Lab L3: purpose, inputs, method, procedure, outputs, rubric rows and submission, with the lab tool that imports your Week 2 record.'),
  assessment: n('Readiness quiz Q3, kept separate from the lecture, and the Week 3 record’s submission readiness.'),
}

// ------------------------------------------------------------------------------------------- workload
export const LESSON_WPM = 150
export function lessonWords(): number {
  let words = 0
  for (const { section } of weekLesson(3))
    for (const b of section.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') words += wordCount(b.text)
      else if (b.kind !== 'figure' && b.kind !== 'slide-ref') words += blockText(b).reduce((a, t) => a + wordCount(t), 0)
    }
  return words
}
const round1 = (x: number) => Math.round(x * 10) / 10

/** Lab L3 out of class in person-hours for a team of four (labBrief.ts is the single source). */
export const LAB_PERSON_HOURS = LAB3_PERSON_HOURS
export const LAB_TEAM_HOURS = round1(LAB_PERSON_HOURS.reduce((a, t) => a + t.hours, 0))

/** A three-person team at the reduced minimums (labBrief.ts LAB3_MINIMUMS_THREE; A21 item 4, pending confirmation):
 *  each task scales with the minimum it depends on (`scales`): technologies, risks, TPMs and criteria by their ratio;
 *  scoring by the ratio of alternative × criterion cells; the register links, the recommendation and integration fixed. */
export const THREE_PERSON = (() => {
  const ratio = (k: 'technologies' | 'risks' | 'tpms' | 'criteria') => MIN3[k] / MIN[k]
  const teamHours = round1(
    LAB_PERSON_HOURS.reduce((a, t) => {
      if (t.scales === 'fixed') return a + t.hours
      if (t.scales === 'scores') return a + t.hours * ((MIN3.alternatives * MIN3.criteria) / (MIN.alternatives * MIN.criteria))
      return a + t.hours * ratio(t.scales)
    }, 0),
  )
  const each = round1(teamHours / 3)
  return { teamHours, each }
})()

export const WORKLOAD_ROWS: { id: string; activity: string; hours: number; optional?: boolean }[] = (() => {
  const words = lessonWords()
  return [
    { id: 'class', activity: 'Class sessions (2 × 75 min)', hours: 2.5 },
    { id: 'readings', activity: `Readings: ${REQUIRED_PAGES} pages at about ${READING_RATE_PAGES_PER_HOUR} pages an hour`, hours: round1(REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR) },
    { id: 'lesson', activity: `Detailed lesson and worked examples (${words.toLocaleString('en-US')} words at about ${LESSON_WPM} words a minute)`, hours: Math.max(0.1, round1(words / LESSON_WPM / 60)) },
    { id: 'prework', activity: 'Pre-work before Session 2 (two technologies with a first TRL, one decision)', hours: 0.3 },
    { id: 'lab', activity: `Lab L3 out of class: your share of about ${LAB_TEAM_HOURS} person-hours (team of four)`, hours: round1(LAB_TEAM_HOURS / 4) },
    { id: 'quiz', activity: 'Readiness quiz Q3', hours: 0.3 },
    { id: 'exercise', activity: 'Individual applied exercise (graduate students: the Monte Carlo memo, 0.8 h)', hours: 0.6 },
    { id: 'log', activity: 'Time log', hours: 0.1 },
  ]
})()
export const WORKLOAD_TOTAL = round1(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0))
export const WORKLOAD_SUMMARY = n(
  `Hours per student for a team of four: ${WORKLOAD_TOTAL.toFixed(1)} h against the ${WEEK3_BUDGET_HOURS.toFixed(1)} h budget (graduate students ${(WORKLOAD_TOTAL + 0.2).toFixed(1)} h, the memo replacing the applied exercise). A team of three works to minimums reduced in proportion (${MIN3.technologies} technologies, ${MIN3.risks} risks, ${MIN3.tpms} TPM, ${MIN3.alternatives} alternatives, ${MIN3.criteria} criteria; pending faculty approval): about ${THREE_PERSON.teamHours} person-hours, ${THREE_PERSON.each.toFixed(1)} h each. Log your actual hours so the estimate can be tested.`,
)
