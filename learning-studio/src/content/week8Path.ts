// Week 8 on the lecture-first path (DECISION_LOG A20, A21): the week page's text (subject, how the week runs, readings,
// deliverables, entry cards) and the workload. Everything here is new and flagged for review (PENDING). AeroLink is the
// instructor's worked example; each team imports and models its own Systems Thinking package (A21 item 9).
//
// Workload (A21 item 4): 8.0 h per student for a team of four; the lab is proportional to team size (labBrief.ts
// LAB8_PERSON_HOURS and LAB8_PERSON_HOURS_THREE). The in-class lab minutes are read from the Session 2 slides; the lesson
// hours from the lesson's word count.
import { WEEKS } from './course'
import { lecturesOfWeek, weekLesson } from './lectures'
import { blockText, lectureMinutes, allSlides, wordCount } from './lectures/text'
import { getReading, type Citation } from './readings'
import { PENDING, type NewText } from './learn/types'
import { EXERCISE_MINUTES, LAB8_PERSON_HOURS, LAB8_PERSON_HOURS_THREE, LAB8_TEAM_HOURS, LAB8_TEAM_HOURS_THREE } from './lectures/week08/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
export const W8 = WEEKS[7]
export const WEEK8_BUDGET_HOURS = 8.0

/** The Week 8 subject as scheduled (COURSE_SCHEDULE.md, exact) and the topics as this week teaches them. */
export const WEEK8_TOPICS = ['Why model-based systems engineering: a model versus a set of documents', 'SysML v2 foundations: the language layers, definition and usage, packages, parts and attributes', 'Textual and graphical notation, and the course toolchain', 'Importing the Systems Thinking package: the artifact-to-model mapping', 'Stakeholders and concerns as model elements']

export const WEEK8_LEDE = n(
  'Phase II begins. This week the instructor explains what changes when a team keeps one model instead of a set of documents, teaches the foundations of the SysML v2 language that the next six weeks rely on, and shows how the course toolchain decides whether a model is valid. Then the whole import is worked once on AeroLink: every artifact of the Phase I package is mapped to a place in the model, and the stakeholders and concerns are modeled. Your team does the same for its own enterprise in Lab L8, starting from the Team Record it built in Phase I.',
)
export const WEEK8_WHY = n(
  'Every later week of Phase II fills a package that this week creates: the needs and requirements in Week 9, behavior in Week 10, the physical architecture in Week 11, verification in Week 12 and analysis in Week 13. The concerns you model now are what those later elements will be traced back to, so an import that loses or renames them breaks the thread before it starts.',
)

/** Proposed objectives from the outline (§1, B8.3 and B8.7), pending faculty approval; W8.1–W8.4 come from course.ts. */
export const PROPOSED_OBJECTIVES: { id: string; text: string; bloom: string }[] = [
  { id: 'W8.5', text: 'Read specialization, subsetting, redefinition and multiplicity correctly in a SysML v2 listing', bloom: 'Analyze' },
  { id: 'W8.6', text: 'Separate what the course-designated checker decides from what the language semantics and the model’s purpose require, and act on the difference', bloom: 'Evaluate' },
]

const sessions = lecturesOfWeek(8)
const s1 = sessions.find((l) => l.session === 1)
const s2 = sessions.find((l) => l.session === 2)
const s2Lab = s2?.sections.find((s) => s.id === 'w8s2-lab')
const labMin = (id: string, fallback: number) => s2Lab?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: s2Lab ? s2Lab.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w8s2-lab-brief', 3),
  matrix: labMin('w8s2-lab-matrix', 12),
  proof: labMin('w8s2-lab-proof', 5),
  close: labMin('w8s2-lab-close', 2),
}
const s2LectureMinutes = s2 ? lectureMinutes(s2) - S2_LAB.total : 47

export const TIMELINE: { id: string; when: string; what: string; detail: NewText }[] = [
  { id: 'session1', when: 'Session 1 · 75 min', what: 'Lecture: from documents to a model; the language', detail: n(`${s1 ? allSlides(s1).length : 27} slides: what a model is and what MBSE changes, model and view, the SysML v2 language architecture, definition and usage with specialization, subsetting and redefinition, attributes with units, a two-minute writing check, a calibration of what the checker can and cannot tell you, and a live demonstration of running it. Ends with the checker installation (one per team) and the tool proof to run before Session 2.`) },
  { id: 'session2', when: 'Session 2 · 75 min', what: 'Lecture, then the Lab L8 launch', detail: n(`About ${s2LectureMinutes} min of lecture on packages, names and imports, the toolchain, the import mapping, and stakeholders and concerns as model elements, worked on AeroLink, then about ${S2_LAB.total} min of laboratory launch: the team drafts its mapping matrix and every member shows the tool proof.`) },
  { id: 'lab', when: 'Out of class · 7 days', what: 'Lab L8: model v0.1', detail: n('Your team imports its own Systems Thinking package: the mapping matrix for every artifact, the model skeleton with its purpose, the Context and Stakeholders packages modeled from the Week 1 register, the import audit, and a checker log ending in a run with zero errors.') },
  { id: 'assessment', when: 'Before Week 9, Session 1', what: 'Assessment and submission', detail: n('Take readiness quiz Q8 (individual, formative) and the individual applied exercise (graduate students: the KerML semantics memo instead), and upload model v0.1 with its mapping matrix and checker log.') },
]

// ------------------------------------------------------------------------------------------- readings
export const READING_RATE_PAGES_PER_HOUR = 15
export const READING_RATE_SLIDES_PER_HOUR = 30
/** Essential readings, narrowed to the pages the lecture teaches from (outline §10, trimmed so the detailed lesson
 *  carries the explanation within the 8 h budget). */
export const REQUIRED_READINGS_CITES: Citation[] = [
  { reading: 'R33a', pages: '290–292' },
  { reading: 'R28', pages: '370–374' },
  { reading: 'R80', pages: '47–49' },
  { reading: 'R80', pages: '63–64' },
  { reading: 'R70', pages: '3–12' },
  { reading: 'R77', pages: '115–116' },
]
export const pageCount = (c: Citation): number => {
  const r = getReading(c.reading)
  if (!c.pages) return r.lastPage - r.firstPage + 1
  const [a, b] = c.pages.split(/[–-]/).map((x) => parseInt(x.trim(), 10))
  return Number.isNaN(b) || b === undefined ? 1 : b - a + 1
}
export const REQUIRED_READINGS = REQUIRED_READINGS_CITES.map((c) => ({ citation: c, reading: getReading(c.reading), pages: pageCount(c), unit: getReading(c.reading).unit === 'slide' ? 'slides' : 'pp' }))
export const REQUIRED_PAGES = REQUIRED_READINGS.filter((r) => r.unit === 'pp').reduce((a, r) => a + r.pages, 0)
export const REQUIRED_SLIDES = REQUIRED_READINGS.filter((r) => r.unit === 'slides').reduce((a, r) => a + r.pages, 0)
export const EXTENSION_READINGS: Citation[] = [
  { reading: 'R33b', pages: '295–296' },
  { reading: 'R33c', pages: '298–302' },
  { reading: 'R80', pages: '72–73' },
  { reading: 'R80', pages: '77' },
  { reading: 'R83', pages: '166–167' },
  { reading: 'R90', pages: '7–12' },
  { reading: 'R87', pages: '51–53' },
]
export const READINGS_NOTE = n('Read the SEBoK pages and the language overview (pp.47–49) before Session 1, the rest before Session 2. The extension pages deepen the definition–usage rules and the concern construct; KerML 7.3 is the basis of the graduate memo.')

// ------------------------------------------------------------------------------------------- deliverables
export const DELIVERABLES: { id: string; what: string; who: string; due: string; where: string }[] = [
  { id: 'install', what: 'One working course-checker installation for the team (the install guide on the Laboratory page)', who: 'The team’s checker owner', due: 'Start of Session 2', where: 'Shown at the Session 2 checkpoint; a lab machine is the fallback' },
  { id: 'proof', what: 'Tool proof: the checker run on the pass file and on the fail file, on any working installation', who: 'Each member', due: 'Start of Session 2', where: 'Shown at the Session 2 checkpoint; the output goes into the checker log' },
  { id: 'matrix', what: 'Mapping matrix draft for every ID kind in the package', who: 'Team', due: 'End of Session 2', where: 'The lab tool (draft); finished in the lab' },
  { id: 'model', what: 'Model v0.1 (.sysml), the mapping matrix with the import audit (.md), and the checker log (.txt)', who: 'Team, one upload', due: 'Before Week 9, Session 1', where: 'LMS assignment “Week 8 model v0.1”' },
  { id: 'quiz', what: 'Readiness quiz Q8', who: 'Individual', due: 'Before Week 9, Session 1', where: 'Assessment page (formative)' },
  { id: 'exercise', what: `Individual applied exercise (about ${EXERCISE_MINUTES} min, unseen case)`, who: 'Individual', due: 'Before Week 9, Session 1', where: 'LMS assignment “Week 8 applied exercise”' },
  { id: 'grad', what: 'Graduate memo: subsetting and redefinition as statements about values (one page)', who: 'Graduate students, individual', due: 'Before Week 9, Session 1', where: 'LMS assignment “Week 8 graduate memo” (replaces the applied exercise)' },
]

export const ENTRY_TEXT = {
  lecture: n('The two 75-minute lectures as the instructor presents them: the slide viewer with keyboard navigation and a print handout. Download the PowerPoint deck to annotate offline.'),
  lesson: n('The long-form lesson: the explanation behind every slide, with the figures, the listings, the definitions and their sources, and the AeroLink import in full.'),
  examples: n('The AeroLink import worked step by step: the mapping matrix, the model skeleton, the context, the stakeholders and concerns with their assessment and relationships, and the import audit, with the generated model file the checker accepted.'),
  lab: n('Full instructions for Lab L8: purpose, inputs, method, procedure, outputs, rubric rows and submission, with the lab tool that imports your Team Record and generates your model skeleton.'),
  assessment: n('Readiness quiz Q8, kept separate from the lecture, and the individual applied exercise.'),
}

// ------------------------------------------------------------------------------------------- workload
export const LESSON_WPM = 150
export function lessonWords(): number {
  let words = 0
  for (const { section } of weekLesson(8))
    for (const b of section.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') words += wordCount(b.text)
      else if (b.kind !== 'figure' && b.kind !== 'slide-ref') words += blockText(b).reduce((a, t) => a + wordCount(t), 0)
    }
  return words
}
const round1 = (x: number) => Math.round(x * 10) / 10

export const LAB_PERSON_HOURS = LAB8_PERSON_HOURS
export const LAB_TEAM_HOURS = LAB8_TEAM_HOURS
/** A three-person team at the reduced scope (labBrief.ts; A21 item 4, pending confirmation). */
export const THREE_PERSON = { teamHours: LAB8_TEAM_HOURS_THREE, each: round1(LAB8_TEAM_HOURS_THREE / 3), tasks: LAB8_PERSON_HOURS_THREE }

/** The applied exercise (tasks 1–5, about 45 minutes) and the graduate memo that replaces it. */
export const EXERCISE_HOURS = Math.round((EXERCISE_MINUTES / 60) * 10) / 10
export const GRAD_MEMO_HOURS = 0.8
export const WORKLOAD_ROWS: { id: string; activity: string; hours: number }[] = (() => {
  const words = lessonWords()
  return [
    { id: 'class', activity: 'Class sessions (2 × 75 min)', hours: 2.5 },
    { id: 'readings', activity: `Readings: ${REQUIRED_PAGES} pages at about ${READING_RATE_PAGES_PER_HOUR} pages an hour`, hours: round1(REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR) },
    { id: 'slides', activity: `Training-deck slides: ${REQUIRED_SLIDES} slides at about ${READING_RATE_SLIDES_PER_HOUR} slides an hour`, hours: round1(REQUIRED_SLIDES / READING_RATE_SLIDES_PER_HOUR) },
    { id: 'lesson', activity: `Detailed lesson and worked examples (${words.toLocaleString('en-US')} words at about ${LESSON_WPM} words a minute)`, hours: Math.max(0.1, round1(words / LESSON_WPM / 60)) },
    { id: 'proof', activity: 'Tool proof before Session 2: run the pass file and the fail file on any working installation (your team’s, a lab machine, or your own; installing the checker on your own computer is optional, about 1 h, and not counted here)', hours: 0.2 },
    { id: 'lab', activity: `Lab L8 out of class: your share of about ${LAB_TEAM_HOURS} person-hours (team of four)`, hours: round1(LAB_TEAM_HOURS / 4) },
    { id: 'quiz', activity: 'Readiness quiz Q8', hours: 0.3 },
    { id: 'exercise', activity: `Individual applied exercise, about ${EXERCISE_MINUTES} min (graduate students: the memo instead, ${GRAD_MEMO_HOURS.toFixed(1)} h)`, hours: EXERCISE_HOURS },
    { id: 'log', activity: 'Time log', hours: 0.1 },
  ]
})()
export const WORKLOAD_TOTAL = round1(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0))
export const WORKLOAD_SUMMARY = n(
  `Hours per student for a team of four: ${WORKLOAD_TOTAL.toFixed(1)} h against the ${WEEK8_BUDGET_HOURS.toFixed(1)} h budget (graduate students ${(WORKLOAD_TOTAL - EXERCISE_HOURS + GRAD_MEMO_HOURS).toFixed(1)} h, the memo replacing the applied exercise). The course checker is installed once per team, by its checker owner, inside the lab hours (about ${LAB8_PERSON_HOURS.find((t) => t.task.startsWith('course checker installation'))!.hours.toFixed(1)} h); installing it on your own computer as well is optional and not counted. A team of three works to a reduced scope (ratings kept in documentation, conflict relationships only, the Weeks 3–6 kinds counted, fidelity audited on a sample; pending faculty approval): about ${THREE_PERSON.teamHours.toFixed(1)} person-hours, ${THREE_PERSON.each.toFixed(1)} h each. Log your actual hours so the estimate can be tested.`,
)
