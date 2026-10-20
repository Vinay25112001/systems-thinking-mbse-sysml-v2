// Week 5 on the lecture-first path (DECISION_LOG A20, A21): the week page's text (subject, how the week runs, readings,
// deliverables, entry cards) and the workload. Everything here is new and flagged for review (PENDING). AeroLink is the
// instructor's worked example; each team's lab and record are about its own enterprise (DECISION_LOG A21 item 9).
//
// Workload (outline §5.7; A21 item 4): at most 8.0 h per student for a team of four, the lab proportional to team size.
// The in-class lab minutes are read from the Session 2 slides; the lesson hours from the lesson's word count; the lab
// person-hours from labBrief.ts (single source).
import { WEEKS } from './course'
import { lecturesOfWeek, weekLesson } from './lectures'
import { blockText, lectureMinutes, allSlides, wordCount } from './lectures/text'
import { getReading, type Citation } from './readings'
import { PENDING, type NewText } from './learn/types'
import { LAB5_MINIMUMS as MIN, LAB5_MINIMUMS_THREE as MIN3, LAB5_PERSON_HOURS } from './lectures/week05/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
export const W5 = WEEKS[4]
export const WEEK5_BUDGET_HOURS = 8.0

/** The Week 5 subject as scheduled (COURSE_SCHEDULE.md), and the topics as this week teaches them. */
export const WEEK5_TOPICS = [
  'System elements, components and the component breakdown, with a responsibility card for each',
  'Interfaces: what they are, how they are typed, external and hidden external interfaces',
  'The N² chart: built, read for its hub and its gaps, and checked against the functional flows',
  'Interface definitions and interface requirements by the three-step method',
  'Managing interfaces: governance, standards, service levels and change control',
  'Interface security and resilience: trust boundaries, protection and degraded modes',
]

export const WEEK5_LEDE = n(
  'This week your team breaks its architecture into components and defines what passes between them. The instructor teaches what a system element and an interface are, how to find every interface with an N² chart and check the list against your functional flows, how to write an interface definition and an interface requirement another engineer could build to, and how interfaces are managed, protected and kept working when they fail; the whole method is worked once on AeroLink. Your team then applies it to its own enterprise in Lab L5, extending its Week 4 Team Record.',
)
export const WEEK5_WHY = n(
  'Interfaces are where systems fail, where organizations meet and where attackers enter, so each part of this week feeds something later. Your interface standards and change request become the insertion points of the Week 6 evolution roadmap; the components and interfaces are a section of the Week 7 Systems Thinking Engineering Package. In Phase II, Week 11 models your components as parts and your interfaces as ports and connections in SysML v2, and Week 12 turns your verification column into verification cases.',
)

/** Proposed objectives from the outline (§1), pending faculty approval; W5.1–W5.3 come from course.ts. */
export const PROPOSED_OBJECTIVES: { id: string; text: string; bloom: string }[] = [
  { id: 'W5.4', text: 'Write interface requirements by the three-step method and identify hidden external interfaces', bloom: 'Apply' },
  { id: 'W5.5', text: 'Evaluate an interface set for coverage, coupling, security and degraded modes, and recommend interface-management actions', bloom: 'Evaluate' },
]

const sessions = lecturesOfWeek(5)
const s1 = sessions.find((l) => l.session === 1)
const s2 = sessions.find((l) => l.session === 2)
const s2Lab = s2?.sections.find((s) => s.id === 'w5s2-lab')
const labMin = (id: string, fallback: number) => s2Lab?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: s2Lab ? s2Lab.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w5s2-lab-brief', 3),
  n2: labMin('w5s2-lab-n2', 12),
  check: labMin('w5s2-lab-check', 5),
  close: labMin('w5s2-lab-close', 2),
  checkTeams: 2,
}
const s2LectureMinutes = s2 ? lectureMinutes(s2) - S2_LAB.total : 47

export const TIMELINE: { id: string; when: string; what: string; detail: NewText }[] = [
  { id: 'session1', when: 'Session 1 · 75 min', what: 'Lecture: components, the N² chart and interface definitions', detail: n(`${s1 ? allSlides(s1).length : 23} slides, all lecture: system elements and the component breakdown, what an interface is and how to type it, external and hidden external interfaces, the N² chart built and read in full on AeroLink, the crossing-flow check, and interface definitions and requirements. Ends with the preparation for Session 2: each member lists the team’s Week 4 physical elements and externals and marks every pair that exchanges something.`) },
  { id: 'session2', when: 'Session 2 · 75 min', what: 'Lecture, then the Lab L5 launch', detail: n(`About ${s2LectureMinutes} min of lecture on managing interfaces (governance, standards, change control), interface security and resilience (trust boundaries, protection, degraded modes), the AeroLink audit, integration aggregates and a coupling count; then about ${S2_LAB.total} min of laboratory launch: the team drafts its first N² and the instructor checks two teams’ degree sums.`) },
  { id: 'lab', when: 'Out of class · 7 days', what: 'Lab L5: components and interfaces', detail: n(`Your team extends its Week 4 Team Record: at least ${MIN.components} components with responsibility cards, an N² chart and at least ${MIN.interfaces} interface definitions with every column, including protection and degraded mode, at least ${MIN.requirements} interface requirements, and interface-management notes with one change request.`) },
  { id: 'assessment', when: 'Before Week 6, Session 1', what: 'Assessment and submission', detail: n('Take readiness quiz Q5 (individual, formative) and the individual applied exercise (graduate students: the coupling comparison instead), and upload the Week 5 record with its model-inputs file.') },
]

// ------------------------------------------------------------------------------------------- readings
export const READING_RATE_PAGES_PER_HOUR = 15
/** Essential readings, narrowed to the pages the lecture teaches from (12 pages). */
export const REQUIRED_READINGS_CITES: Citation[] = [
  { reading: 'R57', pages: '410–414' },
  { reading: 'R47', pages: '138–140' },
  { reading: 'R22', pages: '630–631' },
  { reading: 'R20c', pages: '597' },
  { reading: 'R13', pages: '563' },
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
  { reading: 'R20c', pages: '596–603' },
  { reading: 'R55', pages: '369' },
  { reading: 'R54', pages: '331' },
  { reading: 'R46', pages: '127' },
  { reading: 'R24', pages: '1205–1207' },
  { reading: 'R25', pages: '1231–1234' },
  { reading: 'R36', pages: '498–499' },
  { reading: 'R100', pages: '1541' },
]
export const READINGS_NOTE = n('Read MITRE’s interface management article before Session 1 if you can, and the DoD pages before Session 2; the rest after the lectures. The extension pages deepen physical architecture, hidden external interfaces, interface risk, resilience techniques, systems security and configuration baselines, and are the basis of the graduate task.')

// ------------------------------------------------------------------------------------------- deliverables
export const DELIVERABLES: { id: string; what: string; who: string; due: string; where: string }[] = [
  { id: 'prework', what: 'Your Week 4 physical elements and externals, with every pair that exchanges something marked', who: 'Each member', due: 'Start of Session 2', where: 'Brought to class (not uploaded)' },
  { id: 'n2', what: 'First N² of the team’s enterprise, with degrees', who: 'Team', due: 'End of Session 2 (or on the LMS within 48 h)', where: 'Recorded in the lab tool; checked by the instructor' },
  { id: 'record', what: 'Week 5 record (.md) and model inputs (.json)', who: 'Team, one upload', due: 'Before Week 6, Session 1', where: 'LMS assignment “Week 5 Team Record”' },
  { id: 'quiz', what: 'Readiness quiz Q5', who: 'Individual', due: 'Before Week 6, Session 1', where: 'Assessment page (formative)' },
  { id: 'exercise', what: 'Individual applied exercise (about 35 min, unseen case)', who: 'Individual', due: 'Before Week 6, Session 1', where: 'LMS assignment “Week 5 applied exercise”' },
  { id: 'grad', what: 'Graduate task: coupling comparison of two allocation alternatives (about 40 min)', who: 'Graduate students, individual', due: 'Before Week 6, Session 1', where: 'LMS assignment “Week 5 graduate task” (replaces the applied exercise)' },
]

export const ENTRY_TEXT = {
  lecture: n('The two 75-minute lectures as the instructor presents them: the slide viewer with keyboard navigation and a print handout. Download the PowerPoint deck to annotate offline.'),
  lesson: n('The long-form lesson: the explanation behind every slide, with the figures, the definitions and their sources, and the AeroLink case in full.'),
  examples: n('The AeroLink case worked step by step: the component breakdown, the N² built and read, the interface definitions and requirements, the change request, the security and resilience reading, the audit and the coupling count.'),
  lab: n('Full instructions for Lab L5: purpose, inputs, method, procedure, outputs, the gate-justification table, rubric rows and submission, with the lab tool that imports your Week 4 record.'),
  assessment: n('Readiness quiz Q5, kept separate from the lecture, the individual exercise and the Week 5 record’s submission readiness.'),
}

// ------------------------------------------------------------------------------------------- workload
/** Reading rate for the lesson. The Week 3 and Week 4 reviews flagged 150 words a minute as optimistic for a lesson with
 *  many tables; the milestone report says so and asks for logged hours. */
export const LESSON_WPM = 150
export function lessonWords(): number {
  let words = 0
  for (const { section } of weekLesson(5))
    for (const b of section.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') words += wordCount(b.text)
      else if (b.kind !== 'figure' && b.kind !== 'slide-ref') words += blockText(b).reduce((a, t) => a + wordCount(t), 0)
    }
  return words
}
const round1 = (x: number) => Math.round(x * 10) / 10

/** Lab L5 out of class in person-hours for a team of four (labBrief.ts is the single source). */
export const LAB_PERSON_HOURS = LAB5_PERSON_HOURS
export const LAB_TEAM_HOURS = round1(LAB_PERSON_HOURS.reduce((a, t) => a + t.hours, 0))

/** A three-person team at the reduced minimums (labBrief.ts LAB5_MINIMUMS_THREE; A21 item 4, pending confirmation):
 *  tasks that scale with components, interfaces or requirements shrink by the ratio of the minimums; fixed tasks do not. */
export const THREE_PERSON = (() => {
  const ratio = { components: MIN3.components / MIN.components, interfaces: MIN3.interfaces / MIN.interfaces, requirements: MIN3.requirements / MIN.requirements, fixed: 1 }
  const teamHours = round1(LAB_PERSON_HOURS.reduce((a, t) => a + t.hours * ratio[t.scales], 0))
  return { teamHours, each: round1(teamHours / 3) }
})()

export const WORKLOAD_ROWS: { id: string; activity: string; hours: number; optional?: boolean }[] = (() => {
  const words = lessonWords()
  return [
    { id: 'class', activity: 'Class sessions (2 × 75 min)', hours: 2.5 },
    { id: 'readings', activity: `Readings: ${REQUIRED_PAGES} pages at about ${READING_RATE_PAGES_PER_HOUR} pages an hour`, hours: round1(REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR) },
    { id: 'lesson', activity: `Detailed lesson and worked examples (${words.toLocaleString('en-US')} words at about ${LESSON_WPM} words a minute)`, hours: Math.max(0.1, round1(words / LESSON_WPM / 60)) },
    { id: 'prework', activity: 'Pre-work before Session 2 (elements, externals and the pairs that exchange something)', hours: 0.2 },
    { id: 'lab', activity: `Lab L5 out of class: your share of about ${LAB_TEAM_HOURS} person-hours (team of four)`, hours: round1(LAB_TEAM_HOURS / 4) },
    { id: 'quiz', activity: 'Readiness quiz Q5', hours: 0.3 },
    { id: 'exercise', activity: 'Individual applied exercise (graduate students: the coupling comparison, 0.7 h)', hours: 0.6 },
    { id: 'log', activity: 'Time log', hours: 0.1 },
  ]
})()
export const WORKLOAD_TOTAL = round1(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0))
export const WORKLOAD_SUMMARY = n(
  `Hours per student for a team of four: ${WORKLOAD_TOTAL.toFixed(1)} h against the ${WEEK5_BUDGET_HOURS.toFixed(1)} h budget (graduate students ${(WORKLOAD_TOTAL + 0.1).toFixed(1)} h, the coupling comparison replacing the applied exercise). A team of three works to minimums reduced in proportion (${MIN3.components} components, ${MIN3.interfaces} interfaces, ${MIN3.requirements} interface requirements; pending faculty approval): about ${THREE_PERSON.teamHours} person-hours, ${THREE_PERSON.each.toFixed(1)} h each. The lesson estimate assumes about ${LESSON_WPM} words a minute, optimistic for its tables; log your actual hours so the estimate can be tested.`,
)
