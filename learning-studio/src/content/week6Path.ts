// Week 6 on the lecture-first path (DECISION_LOG A20, A21): the week page's text (subject, how the week runs, readings,
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
import { LAB6_MINIMUMS as MIN, LAB6_MINIMUMS_THREE as MIN3, LAB6_PERSON_HOURS } from './lectures/week06/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
export const W6 = WEEKS[5]
export const WEEK6_BUDGET_HOURS = 8.0

/** The Week 6 subject as scheduled (COURSE_SCHEDULE.md), and the topics as this week teaches them. */
export const WEEK6_TOPICS = [
  'Capability gaps and excesses over near-, mid- and far-term horizons, from the needs',
  'Increments: development approaches, evolutionary acquisition, deferral and off-ramps',
  'The technology plan from the Week 3 readiness assessment, and what a TRL cannot tell',
  'Transition while the service operates: insertion timing, compatibility and phasing',
  'Security and resilience as the enterprise evolves, with transition risks',
  'The roadmap as a decision instrument, an increment’s impact, and the Phase I baseline review',
]

export const WEEK6_LEDE = n(
  'This week your team plans how its enterprise changes after it enters service. The instructor teaches how to find capability gaps over three horizons from your needs, how change is delivered in increments without stopping the service, how to build a technology plan from your Week 3 readiness assessment and decide when a technology may be inserted, how to plan the transition and the security and resilience change of each increment, and how to record what you do not yet know; the whole method is worked once on AeroLink. Your team then applies it to its own enterprise in Lab L6, extending its Week 5 Team Record, and reviews the Phase I baseline ready for Week 7.',
)
export const WEEK6_WHY = n(
  'A roadmap is how an operating enterprise decides what to change next, in what order and on what evidence, so it reads every earlier artifact. Your roadmap, known unknowns and baseline review become the evolution section of the Week 7 Systems Thinking Engineering Package; Week 13 may reuse your triggers as analysis cases; and in Week 14 one of your increments becomes a change to your SysML v2 model, with your impact list as its checklist.',
)

/** Proposed objectives (outline §1), pending faculty approval; W6.1–W6.3 come from course.ts. W6.6 makes the security
 *  and resilience integration of DECISION_LOG A21 item 6 an explicit objective. */
export const PROPOSED_OBJECTIVES: { id: string; text: string; bloom: string }[] = [
  { id: 'W6.4', text: 'Distinguish an enterprise evolution roadmap from a development approach, and justify the development approach chosen for each increment', bloom: 'Analyze' },
  { id: 'W6.5', text: 'Record known unknowns with impact, information need, mitigation and owner, and connect each to the increment it gates', bloom: 'Apply' },
  { id: 'W6.6', text: 'Plan the security and resilience change of each increment, including the risks that exist only during its transition', bloom: 'Apply' },
]

const sessions = lecturesOfWeek(6)
const s1 = sessions.find((l) => l.session === 1)
const s2 = sessions.find((l) => l.session === 2)
const s2Lab = s2?.sections.find((s) => s.id === 'w6s2-lab')
const labMin = (id: string, fallback: number) => s2Lab?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: s2Lab ? s2Lab.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w6s2-lab-brief', 3),
  baseline: labMin('w6s2-lab-baseline', 10),
  check: labMin('w6s2-lab-check', 7),
  close: labMin('w6s2-lab-close', 2),
}
const s2LectureMinutes = s2 ? lectureMinutes(s2) - S2_LAB.total : 47

export const TIMELINE: { id: string; when: string; what: string; detail: NewText }[] = [
  { id: 'session1', when: 'Session 1 · 75 min', what: 'Lecture: from capability gaps to a technology plan', detail: n(`${s1 ? allSlides(s1).length : 23} slides, all lecture: architecture and evolution, capability gaps and excesses over three horizons, from gaps to a plan of changes, development approaches and evolutionary acquisition, off-ramps, the technology plan and the limits of TRL, AeroLink’s technology table (you classify it first), and known unknowns. Ends with the preparation for Session 2: each member brings one candidate change with its gap and the maturity or unknown that times it.`) },
  { id: 'session2', when: 'Session 2 · 75 min', what: 'Lecture, then the Lab L6 launch', detail: n(`About ${s2LectureMinutes} min of lecture on transition while the service operates, security and resilience across increments, and the AeroLink roadmap worked in full with the answer to the driving question; then about ${S2_LAB.total} min of laboratory launch: your team writes its as-is and its top three gaps, and the instructor checks each team’s first increment and trigger.`) },
  { id: 'lab', when: 'Out of class · 7 days', what: 'Lab L6: your enterprise evolution roadmap', detail: n(`Your team extends its Week 5 Team Record: at least ${MIN.gaps} gaps or excesses on three horizons, a technology plan of at least ${MIN.technologies} technologies with insertion points, at least ${MIN.increments} increments counting the baseline, at least ${MIN.unknowns} known unknowns with the AROU update, the impact list of one increment, and the Phase I baseline review for Week 7.`) },
  { id: 'assessment', when: 'Before Week 7, Session 1', what: 'Assessment and submission', detail: n('Take readiness quiz Q6 (individual, formative) and the individual applied exercise (graduate students: the roadmap sensitivity memo instead), and upload the Week 6 record with its model-inputs file and the roadmap graphic.') },
]

// ------------------------------------------------------------------------------------------- readings
export const READING_RATE_PAGES_PER_HOUR = 15
/** Essential readings, narrowed to the pages the lecture teaches from (17 pages). */
export const REQUIRED_READINGS_CITES: Citation[] = [
  { reading: 'R12', pages: '860–863' },
  { reading: 'R105', pages: '528–531' },
  { reading: 'R106', pages: '582–584' },
  { reading: 'R107', pages: '447–449' },
  { reading: 'R26', pages: '682–684' },
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
  { reading: 'R108', pages: '391–393' },
  { reading: 'R106', pages: '585' },
  { reading: 'R60', pages: '523–526' },
  { reading: 'R109', pages: '131–132' },
  { reading: 'R62', pages: '345' },
  { reading: 'R46', pages: '126' },
  { reading: 'R13', pages: '565' },
  { reading: 'R24', pages: '1203–1210' },
  { reading: 'R25', pages: '1231–1234' },
]
export const READINGS_NOTE = n('Read SEBoK’s capability management article and MITRE’s technology planning article before Session 1 if you can, and the transition and modernization pages before Session 2; the rest after the lectures. The extension pages deepen development approaches, technical maturity, enterprise architecture, off-ramps, known unknowns, resilience and security, and are the basis of the graduate memo.')

// ------------------------------------------------------------------------------------------- deliverables
export const DELIVERABLES: { id: string; what: string; who: string; due: string; where: string }[] = [
  { id: 'prework', what: 'One candidate change for your enterprise, with its gap and the maturity or unknown that times it', who: 'Each member', due: 'Start of Session 2', where: 'Brought to class (not uploaded)' },
  { id: 'baseline', what: 'The team’s as-is in five lines and its top three gaps; the first increment and its trigger stated', who: 'Team', due: 'End of Session 2 (or on the LMS within 48 h)', where: 'Recorded in the lab tool; checked by the instructor' },
  { id: 'record', what: 'Week 6 record (.md), model inputs (.json) and the roadmap graphic with its text equivalent', who: 'Team, one upload', due: 'Before Week 7, Session 1', where: 'LMS assignment “Week 6 Team Record”' },
  { id: 'quiz', what: 'Readiness quiz Q6', who: 'Individual', due: 'Before Week 7, Session 1', where: 'Assessment page (formative)' },
  { id: 'exercise', what: 'Individual applied exercise (about 36 min with reading time, unseen case)', who: 'Individual', due: 'Before Week 7, Session 1', where: 'LMS assignment “Week 6 applied exercise”' },
  { id: 'grad', what: 'Graduate task: roadmap sensitivity memo (one page, about 40 min)', who: 'Graduate students, individual', due: 'Before Week 7, Session 1', where: 'LMS assignment “Week 6 graduate task” (replaces the applied exercise)' },
]

export const ENTRY_TEXT = {
  lecture: n('The two 75-minute lectures as the instructor presents them: the slide viewer with keyboard navigation and a print handout. Download the PowerPoint deck to annotate offline.'),
  lesson: n('The long-form lesson: the explanation behind every slide, with the figures, the definitions and their sources, and the AeroLink roadmap in full.'),
  examples: n('The AeroLink case worked step by step: the gaps and excesses, the technology plan, the baseline trajectory and three increments with their transition orders, the security and resilience change of each, the known unknowns, the impact of the autonomy increment and the Phase I baseline review.'),
  lab: n('Full instructions for Lab L6: purpose, inputs, method, procedure, outputs, the gate-justification table, rubric rows and submission, with the lab tool that imports your Week 5 record.'),
  assessment: n('Readiness quiz Q6, kept separate from the lecture, the individual exercise and the Week 6 record’s submission readiness.'),
}

// ------------------------------------------------------------------------------------------- workload
/** Reading rate for the lesson. Earlier reviews flagged 150 words a minute as optimistic for a lesson with many tables;
 *  the milestone report says so and asks for logged hours. */
export const LESSON_WPM = 150
export function lessonWords(): number {
  let words = 0
  for (const { section } of weekLesson(6))
    for (const b of section.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') words += wordCount(b.text)
      else if (b.kind !== 'figure' && b.kind !== 'slide-ref') words += blockText(b).reduce((a, t) => a + wordCount(t), 0)
    }
  return words
}
const round1 = (x: number) => Math.round(x * 10) / 10

/** Lab L6 out of class in person-hours for a team of four (labBrief.ts is the single source). */
export const LAB_PERSON_HOURS = LAB6_PERSON_HOURS
export const LAB_TEAM_HOURS = round1(LAB_PERSON_HOURS.reduce((a, t) => a + t.hours, 0))

/** A three-person team at the reduced minimums (labBrief.ts LAB6_MINIMUMS_THREE; A21 item 4, pending confirmation):
 *  tasks that scale with gaps, technologies, non-baseline increments or unknowns shrink by the ratio of the minimums;
 *  fixed tasks do not. */
export const THREE_PERSON = (() => {
  const ratio = { gaps: MIN3.gaps / MIN.gaps, technologies: MIN3.technologies / MIN.technologies, increments: (MIN3.increments - 1) / (MIN.increments - 1), unknowns: MIN3.unknowns / MIN.unknowns, fixed: 1 }
  const teamHours = round1(LAB_PERSON_HOURS.reduce((a, t) => a + t.hours * ratio[t.scales], 0))
  return { teamHours, each: round1(teamHours / 3) }
})()

export const WORKLOAD_ROWS: { id: string; activity: string; hours: number; optional?: boolean }[] = (() => {
  const words = lessonWords()
  return [
    { id: 'class', activity: 'Class sessions (2 × 75 min)', hours: 2.5 },
    { id: 'readings', activity: `Readings: ${REQUIRED_PAGES} pages at about ${READING_RATE_PAGES_PER_HOUR} pages an hour`, hours: round1(REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR) },
    { id: 'lesson', activity: `Detailed lesson and worked examples (${words.toLocaleString('en-US')} words at about ${LESSON_WPM} words a minute)`, hours: Math.max(0.1, round1(words / LESSON_WPM / 60)) },
    { id: 'prework', activity: 'Pre-work before Session 2 (one candidate change with its gap and timing)', hours: 0.3 },
    { id: 'lab', activity: `Lab L6 out of class: your share of about ${LAB_TEAM_HOURS} person-hours (team of four)`, hours: round1(LAB_TEAM_HOURS / 4) },
    { id: 'quiz', activity: 'Readiness quiz Q6', hours: 0.3 },
    { id: 'exercise', activity: 'Individual applied exercise: 36 min, 5 of them to read the brief (graduate students: the sensitivity memo, 0.7 h)', hours: 0.6 },
    { id: 'log', activity: 'Time log', hours: 0.1 },
  ]
})()
export const WORKLOAD_TOTAL = round1(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0))
export const WORKLOAD_SUMMARY = n(
  `Hours per student for a team of four: ${WORKLOAD_TOTAL.toFixed(1)} h against the ${WEEK6_BUDGET_HOURS.toFixed(1)} h budget (graduate students ${(WORKLOAD_TOTAL + 0.1).toFixed(1)} h, the sensitivity memo replacing the applied exercise). A team of three works to minimums reduced in proportion (${MIN3.gaps} gaps, ${MIN3.technologies} technologies, ${MIN3.increments} increments, ${MIN3.unknowns} known unknowns; pending faculty approval): about ${THREE_PERSON.teamHours} person-hours, ${THREE_PERSON.each.toFixed(1)} h each. The lesson estimate assumes about ${LESSON_WPM} words a minute, optimistic for its tables; log your actual hours so the estimate can be tested.`,
)
