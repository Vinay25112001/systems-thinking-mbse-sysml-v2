// Week 4 on the lecture-first path (DECISION_LOG A20, A21): the week page's text (subject, how the week runs, readings,
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
import { LAB4_MINIMUMS as MIN, LAB4_MINIMUMS_THREE as MIN3, LAB4_PERSON_HOURS } from './lectures/week04/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
export const W4 = WEEKS[3]
export const WEEK4_BUDGET_HOURS = 8.0

/** The Week 4 subject as scheduled (COURSE_SCHEDULE.md), and the topics as this week teaches them. */
export const WEEK4_TOPICS = [
  'Architecture and its description: stakeholders, concerns, viewpoints and views',
  'Functional decomposition from scenarios and capabilities, with inputs and outputs',
  'Logical and physical elements, and allocation with a stated criterion',
  'The information view: data versus information, producer to consumer to decision, AI capabilities with oversight',
  'Evaluating the architecture against requirements and technical performance measures',
]

export const WEEK4_LEDE = n(
  'This week your team describes, for the first time, how its enterprise will work. The instructor teaches what an architecture is and how to choose the views that answer your stakeholders’ concerns, how to find functions by walking your scenarios, how to allocate them to logical and physical elements with a reason a reviewer can check, and how to build an information view that traces each item from its producer to the decision it supports; the whole method is worked once on AeroLink. Your team then applies it to its own enterprise in Lab L4, extending its Week 3 Team Record.',
)
export const WEEK4_WHY = n(
  'Each part feeds something later. Your physical view and information routes become the components and interfaces of Week 5; the enterprise view and your architecture decision become the as-is and to-be views of the Week 6 roadmap; the whole description is the architecture section of the Week 7 package. In Phase II, Week 10 models your functions and logical elements with your Week 2 scenarios, Week 11 models the physical elements and allocations, and Week 12 builds the digital thread on your information items.',
)

/** Proposed objectives from the outline (§1), pending faculty approval; W4.1–W4.3 come from course.ts. */
export const PROPOSED_OBJECTIVES: { id: string; text: string; bloom: string }[] = [
  { id: 'W4.4', text: 'Distinguish data from information and an architecture from its description, citing the source of each distinction', bloom: 'Understand' },
  { id: 'W4.5', text: 'Record an architecture decision with the alternatives considered and the rationale, and test it against the needs and risks it touches', bloom: 'Evaluate' },
  { id: 'W4.6', text: 'Specify an AI-enabled capability with its inputs, outputs, human oversight and failure modes, and place it in the information view', bloom: 'Analyze' },
]

const sessions = lecturesOfWeek(4)
const s1 = sessions.find((l) => l.session === 1)
const s2 = sessions.find((l) => l.session === 2)
const s2Lab = s2?.sections.find((s) => s.id === 'w4s2-lab')
const labMin = (id: string, fallback: number) => s2Lab?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: s2Lab ? s2Lab.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w4s2-lab-brief', 3),
  views: labMin('w4s2-lab-views', 10),
  check: labMin('w4s2-lab-check', 7),
  close: labMin('w4s2-lab-close', 2),
  checkTeams: 4,
}
const s2LectureMinutes = s2 ? lectureMinutes(s2) - S2_LAB.total : 47

export const TIMELINE: { id: string; when: string; what: string; detail: NewText }[] = [
  { id: 'session1', when: 'Session 1 · 75 min', what: 'Lecture: views, functions and allocation', detail: n(`${s1 ? allSlides(s1).length : 22} slides, all lecture: what an architecture is and how its description is organized, choosing viewpoints from concerns, functions and decomposition found by walking scenarios, logical and physical elements, allocation with a criterion, an architecture decision and the enterprise view, each worked on AeroLink. Ends with the preparation for Session 2: each member lists three decisions the enterprise makes daily and the information each needs.`) },
  { id: 'session2', when: 'Session 2 · 75 min', what: 'Lecture, then the Lab L4 launch', detail: n(`About ${s2LectureMinutes} min of lecture on the information view (data and information, producer to consumer to decision, flows checked against the physical view, AI capabilities), the AeroLink view worked in full with an audit, and the evaluation of the architecture; then about ${S2_LAB.total} min of laboratory launch: the team writes its view purposes and walks its first scenario, and the instructor checks the walks.`) },
  { id: 'lab', when: 'Out of class · 7 days', what: 'Lab L4: the architecture description', detail: n(`Your team extends its Week 3 Team Record: ${MIN.viewpoints} viewpoints with purposes, at least ${MIN.functions} functions under at least ${MIN.groups} first-level functions, at least ${MIN.logical} logical and ${MIN.physical} physical elements with every function allocated by a stated criterion, an architecture decision, at least ${MIN.information} information items and an AI capability card.`) },
  { id: 'assessment', when: 'Before Week 5, Session 1', what: 'Assessment and submission', detail: n('Take readiness quiz Q4 (individual, formative) and the individual applied exercise (graduate students: the viewpoint-coverage task instead), and upload the Week 4 record with its model-inputs file.') },
]

// ------------------------------------------------------------------------------------------- readings
export const READING_RATE_PAGES_PER_HOUR = 15
/** Essential readings, narrowed to the pages the lecture teaches from (16 pages). */
export const REQUIRED_READINGS_CITES: Citation[] = [
  { reading: 'R19', pages: '569–571' },
  { reading: 'R19', pages: '573' },
  { reading: 'R62', pages: '341–345' },
  { reading: 'R20b', pages: '587' },
  { reading: 'R20b', pages: '594' },
  { reading: 'R20c', pages: '598–599' },
  { reading: 'R21', pages: '510–512' },
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
  { reading: 'R20a', pages: '580–582' },
  { reading: 'R48c', pages: '144–146' },
  { reading: 'R66', pages: '111–113' },
  { reading: 'R31', pages: '1370–1371' },
  { reading: 'R56', pages: '384–388' },
  { reading: 'R39t', pages: '1445' },
  { reading: 'R39w', pages: '1678' },
]
export const READINGS_NOTE = n('Read R19 and R62 before Session 1 if you can, and the R21 pages before Session 2; the rest after the lectures. The extension pages deepen the functional view, the DoD process, data management, AI oversight and design assessment, and are the basis of the graduate task.')

// ------------------------------------------------------------------------------------------- deliverables
export const DELIVERABLES: { id: string; what: string; who: string; due: string; where: string }[] = [
  { id: 'prework', what: 'Three decisions the enterprise makes every day, with the information each needs and where it comes from', who: 'Each member', due: 'Start of Session 2', where: 'Brought to class (not uploaded)' },
  { id: 'walk', what: 'View purposes and one scenario walked into functions', who: 'Team', due: 'End of Session 2 (or on the LMS within 48 h)', where: 'Recorded in the lab tool; checked by the instructor' },
  { id: 'record', what: 'Week 4 record (.md) and model inputs (.json)', who: 'Team, one upload', due: 'Before Week 5, Session 1', where: 'LMS assignment “Week 4 Team Record”' },
  { id: 'quiz', what: 'Readiness quiz Q4', who: 'Individual', due: 'Before Week 5, Session 1', where: 'Assessment page (formative)' },
  { id: 'exercise', what: 'Individual applied exercise (about 35 min, unseen case)', who: 'Individual', due: 'Before Week 5, Session 1', where: 'LMS assignment “Week 4 applied exercise”' },
  { id: 'grad', what: 'Graduate task: concern × view coverage and one decision defended (about 40 min)', who: 'Graduate students, individual', due: 'Before Week 5, Session 1', where: 'LMS assignment “Week 4 graduate task” (replaces the applied exercise)' },
]

export const ENTRY_TEXT = {
  lecture: n('The two 75-minute lectures as the instructor presents them: the slide viewer with keyboard navigation and a print handout. Download the PowerPoint deck to annotate offline.'),
  lesson: n('The long-form lesson: the explanation behind every slide, with the figures, the definitions and their sources, and the AeroLink case in full.'),
  examples: n('The AeroLink case worked step by step: the view set chosen from concerns, the scenario walks, the function and allocation tables, the decision record, the information view with its route check and audit, and the evaluation against requirements and TPMs.'),
  lab: n('Full instructions for Lab L4: purpose, inputs, method, procedure, outputs, rubric rows and submission, with the lab tool that imports your Week 3 record.'),
  assessment: n('Readiness quiz Q4, kept separate from the lecture, and the Week 4 record’s submission readiness.'),
}

// ------------------------------------------------------------------------------------------- workload
export const LESSON_WPM = 150
export function lessonWords(): number {
  let words = 0
  for (const { section } of weekLesson(4))
    for (const b of section.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') words += wordCount(b.text)
      else if (b.kind !== 'figure' && b.kind !== 'slide-ref') words += blockText(b).reduce((a, t) => a + wordCount(t), 0)
    }
  return words
}
const round1 = (x: number) => Math.round(x * 10) / 10

/** Lab L4 out of class in person-hours for a team of four (labBrief.ts is the single source). */
export const LAB_PERSON_HOURS = LAB4_PERSON_HOURS
export const LAB_TEAM_HOURS = round1(LAB_PERSON_HOURS.reduce((a, t) => a + t.hours, 0))

/** A three-person team at the reduced minimums (labBrief.ts LAB4_MINIMUMS_THREE; A21 item 4, pending confirmation):
 *  tasks that scale with functions or information items shrink by the ratio of the minimums; fixed tasks do not. */
export const THREE_PERSON = (() => {
  const ratio = { functions: MIN3.functions / MIN.functions, information: MIN3.information / MIN.information, fixed: 1 }
  const teamHours = round1(LAB_PERSON_HOURS.reduce((a, t) => a + t.hours * ratio[t.scales], 0))
  return { teamHours, each: round1(teamHours / 3) }
})()

export const WORKLOAD_ROWS: { id: string; activity: string; hours: number; optional?: boolean }[] = (() => {
  const words = lessonWords()
  return [
    { id: 'class', activity: 'Class sessions (2 × 75 min)', hours: 2.5 },
    { id: 'readings', activity: `Readings: ${REQUIRED_PAGES} pages at about ${READING_RATE_PAGES_PER_HOUR} pages an hour`, hours: round1(REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR) },
    { id: 'lesson', activity: `Detailed lesson and worked examples (${words.toLocaleString('en-US')} words at about ${LESSON_WPM} words a minute)`, hours: Math.max(0.1, round1(words / LESSON_WPM / 60)) },
    { id: 'prework', activity: 'Pre-work before Session 2 (three decisions and the information each needs)', hours: 0.2 },
    { id: 'lab', activity: `Lab L4 out of class: your share of about ${LAB_TEAM_HOURS} person-hours (team of four)`, hours: round1(LAB_TEAM_HOURS / 4) },
    { id: 'quiz', activity: 'Readiness quiz Q4', hours: 0.3 },
    { id: 'exercise', activity: 'Individual applied exercise (graduate students: the coverage task, 0.7 h)', hours: 0.6 },
    { id: 'log', activity: 'Time log', hours: 0.1 },
  ]
})()
export const WORKLOAD_TOTAL = round1(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0))
export const WORKLOAD_SUMMARY = n(
  `Hours per student for a team of four: ${WORKLOAD_TOTAL.toFixed(1)} h against the ${WEEK4_BUDGET_HOURS.toFixed(1)} h budget (graduate students ${(WORKLOAD_TOTAL + 0.1).toFixed(1)} h, the coverage task replacing the applied exercise${WORKLOAD_TOTAL + 0.1 > WEEK4_BUDGET_HOURS + 1e-9 ? `, ${(WORKLOAD_TOTAL + 0.1 - WEEK4_BUDGET_HOURS).toFixed(1)} h over the budget, stated rather than hidden (pending faculty review)` : ''}). A team of three works to minimums reduced in proportion (${MIN3.functions} functions, ${MIN3.logical} logical and ${MIN3.physical} physical elements, ${MIN3.information} information items; pending faculty approval): about ${THREE_PERSON.teamHours} person-hours, ${THREE_PERSON.each.toFixed(1)} h each. Log your actual hours so the estimate can be tested.`,
)
