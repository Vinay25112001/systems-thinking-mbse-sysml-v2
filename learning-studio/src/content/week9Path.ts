// Week 9 on the lecture-first path (DECISION_LOG A20, A21, A24): the week page's text (subject, how the week runs,
// readings, deliverables, entry cards) and the workload. Everything here is new and flagged for review (PENDING).
// AeroLink is the instructor's worked example; each team models its own needs and requirements (A21 item 9), in the
// model it built in Week 8 (A22/A23: one continuous engineering journey).
//
// Workload (A21 item 4, budget 8.0 h): computed, never typed. The in-class lab minutes are read from the Session 2 slides;
// the lesson hours from the lesson's word count; the lab hours from the person-hours in labBrief.ts.
import { WEEKS } from './course'
import { lecturesOfWeek, weekLesson } from './lectures'
import { allSlides, blockText, lectureMinutes, wordCount } from './lectures/text'
import { getReading, type Citation } from './readings'
import { PENDING, type NewText } from './learn/types'
import { EXERCISE_MINUTES, LAB9_PERSON_HOURS, LAB9_PERSON_HOURS_THREE, LAB9_TEAM_HOURS, LAB9_TEAM_HOURS_THREE } from './lectures/week09/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
export const W9 = WEEKS[8]
export const WEEK9_BUDGET_HOURS = 8.0

/** The Week 9 subject as scheduled (COURSE_SCHEDULE.md, exact: “Needs / Requirements”) and the topics as taught. */
export const WEEK9_TOPICS = ['Requirements as SysML v2 model elements: constraint, definition and usage, subject, ID and text', 'Assumptions, actor and stakeholder parameters, concerns and framing', 'Your Week 1 needs and Week 2 requirements in the model, with stable IDs', 'Derivation, dependencies and a first look at satisfy', 'Requirement quality, the trace matrix and AI-assisted review']

export const WEEK9_LEDE = n(
  'This week your team’s Phase I needs and requirements become elements of the SysML v2 model it built in Week 8. The instructor teaches the requirement construct of SysML v2 from the specification upward: a requirement is a constraint, it has a subject, its ID is its short name, its text is its documentation, and what it requires can be written as a constraint over the subject’s features. Then the relationships around requirements: framing, derivation, dependencies, and a first careful look at satisfy. Each idea is shown on the AeroLink model, generated from the AeroLink Phase I package. In Lab L9 your team generates model v0.2 of its own enterprise with the Week 9 lab tool, decides the subject and the constraint of every requirement, and audits the trace from needs to requirements.',
)
export const WEEK9_WHY = n(
  'Every later week of Phase II reads what you model now: functions are allocated to requirements in Week 10, design elements claim to satisfy them in Week 11, verification cases verify them in Week 12 and analyses evaluate them in Week 13. A requirement without a subject or a constraint is one that nothing can later satisfy or verify, and a need that frames no concern breaks the trace back to the stakeholder.',
)

/** Proposed objectives (outline §1), pending faculty approval; W9.1–W9.3 come from course.ts. */
export const PROPOSED_OBJECTIVES: { id: string; text: string; bloom: string }[] = [
  { id: 'W9.4', text: 'Model stakeholder needs and mission objectives as requirement usages with a subject, stakeholder parameters and framed concerns, continuing the Week 8 stakeholder model', bloom: 'Apply' },
  { id: 'W9.5', text: 'Evaluate modeled requirements for well-formedness and intent, treating AI-generated findings as candidates the team accepts or rejects with reasons', bloom: 'Evaluate' },
  { id: 'W9.6', text: 'Graduate: critique the assume/require form of a requirement and state what a later satisfy claim would then assert', bloom: 'Evaluate' },
]

const sessions = lecturesOfWeek(9)
const s1 = sessions.find((l) => l.session === 1)
const s2 = sessions.find((l) => l.session === 2)
const s2Lab = s2?.sections.find((s) => s.id === 'w9s2-lab')
const labMin = (id: string, fallback: number) => s2Lab?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: s2Lab ? s2Lab.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w9s2-lab-brief', 3),
  chain: labMin('w9s2-lab-chain', 12),
  checkpoint: labMin('w9s2-lab-checkpoint', 5),
  close: labMin('w9s2-lab-close', 2),
}
const s2LectureMinutes = s2 ? lectureMinutes(s2) - S2_LAB.total : 47

export const TIMELINE: { id: string; when: string; what: string; detail: NewText }[] = [
  { id: 'session1', when: 'Session 1 · 75 min', what: 'Lecture: requirements as model elements', detail: n(`${s1 ? allSlides(s1).length : 24} slides: needs versus requirements, the requirement as a constraint, definition and usage, the subject, the ID and the text, the required constraint, assumptions, actor and stakeholder parameters, concerns and framing, the AeroLink Needs package, groups and a shared definition, metadata, derivation and dependencies, the course trace pattern, a first look at satisfy, and what the checker can and cannot tell you. Ends with an exit card: one of your system requirements as a usage.`) },
  { id: 'session2', when: 'Session 2 · 75 min', what: 'Lecture, then the Lab L9 launch', detail: n(`About ${s2LectureMinutes} min of lecture on requirement quality, four AeroLink worked examples, the trace matrix, common errors, predicting the checker and AI-assisted review, then about ${S2_LAB.total} min of laboratory launch: your team imports its files into the lab tool and models one need-to-system-requirement chain, with an instructor checkpoint.`) },
  { id: 'lab', when: 'Out of class · 7 days', what: 'Lab L9: model v0.2', detail: n('Your team completes model v0.2 of its own enterprise: every need and requirement modeled with a subject and, for every system requirement, a required constraint or a recorded TBD; the derivations; the trace audit with a disposition for every finding; the AI review log; and a checker log ending in a run with zero errors.') },
  { id: 'assessment', when: 'Before Week 10, Session 1', what: 'Assessment and submission', detail: n('Take readiness quiz Q9 (individual, formative) and the individual applied exercise on an unseen case (graduate students also answer its fifth task), and upload model v0.2 with its trace matrix and checker log.') },
]

// ------------------------------------------------------------------------------------------- readings
export const READING_RATE_PAGES_PER_HOUR = 15
export const READING_RATE_SLIDES_PER_HOUR = 30
/** Essential readings: the pages the lecture teaches from (outline §10). */
export const REQUIRED_READINGS_CITES: Citation[] = [
  { reading: 'R83', pages: '161–168' },
  { reading: 'R13', pages: '557–558' },
  { reading: 'R13', pages: '564' },
  { reading: 'R13', pages: '566' },
  { reading: 'R74', pages: '86–91' },
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
  { reading: 'R115', pages: '580–581' },
  { reading: 'R114', pages: '555–557' },
  { reading: 'R48b', pages: '144' },
  { reading: 'R77', pages: '108–109' },
  { reading: 'R84', pages: '175–176' },
]
export const READINGS_NOTE = n('Read the specification pages before Session 1 and the SEBoK pages before Session 2. The extension pages give the library definitions the model uses: the derivation connection, the modeling metadata and the verification methods.')

// ------------------------------------------------------------------------------------------- deliverables
export const DELIVERABLES: { id: string; what: string; who: string; due: string; where: string }[] = [
  { id: 'exit', what: 'Exit card: one of your team’s system requirements as a usage, with three answers', who: 'Each member', due: 'Start of Session 2', where: 'Brought to class; used at the lab checkpoint' },
  { id: 'chain', what: 'One need-to-system-requirement chain modeled in the lab tool', who: 'Team', due: 'End of Session 2', where: 'The lab tool (shown at the checkpoint)' },
  { id: 'model', what: 'Model v0.2 (.sysml), the trace matrix with the trace audit and the AI review log (.md), and the checker log (.txt)', who: 'Team, one upload', due: 'Before Week 10, Session 1', where: 'LMS assignment “Week 9 model v0.2”' },
  { id: 'quiz', what: 'Readiness quiz Q9', who: 'Individual', due: 'Before Week 10, Session 1', where: 'Assessment page (formative)' },
  { id: 'exercise', what: `Individual applied exercise (about ${EXERCISE_MINUTES} min, unseen case; graduate students answer task 5)`, who: 'Individual', due: 'Before Week 10, Session 1', where: 'LMS assignment “Week 9 applied exercise”' },
]

export const ENTRY_TEXT = {
  lecture: n('The two 75-minute lectures as the instructor presents them: the slide viewer with keyboard navigation and a print handout. Download the PowerPoint deck to annotate offline.'),
  lesson: n('The long-form lesson: the explanation behind every slide, with the figures, the listings, the definitions and their sources, and the AeroLink worked model in full.'),
  examples: n('The AeroLink needs and requirements worked step by step: a need, a stakeholder requirement, a shared definition, a TBD, a derivation chain and the trace matrix, with the generated model v0.2 file the checker accepted and the AI review demonstration.'),
  lab: n('Full instructions for Lab L9: purpose, inputs, method, procedure, outputs, rubric rows and submission, with the lab tool that reads your Week 8 model and your Week 1 and Week 2 exports and generates model v0.2.'),
  assessment: n('Readiness quiz Q9, kept separate from the lecture, the individual applied exercise with its rubric, and the submission readiness.'),
}

// ------------------------------------------------------------------------------------------- workload
export const LESSON_WPM = 150
export function lessonWords(): number {
  let words = 0
  for (const { section } of weekLesson(9))
    for (const b of section.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') words += wordCount(b.text)
      else if (b.kind !== 'figure' && b.kind !== 'slide-ref') words += blockText(b).reduce((a, t) => a + wordCount(t), 0)
    }
  return words
}
const round1 = (x: number) => Math.round(x * 10) / 10

export const LAB_PERSON_HOURS = LAB9_PERSON_HOURS
export const LAB_TEAM_HOURS = LAB9_TEAM_HOURS
/** A three-person team at the reduced scope (labBrief.ts; A21 item 4, pending confirmation). */
export const THREE_PERSON = { teamHours: LAB9_TEAM_HOURS_THREE, each: round1(LAB9_TEAM_HOURS_THREE / 3), tasks: LAB9_PERSON_HOURS_THREE }
export const EXERCISE_HOURS = round1(EXERCISE_MINUTES / 60)

export const WORKLOAD_ROWS: { id: string; activity: string; hours: number }[] = (() => {
  const words = lessonWords()
  return [
    { id: 'class', activity: 'Class sessions (2 × 75 min)', hours: 2.5 },
    { id: 'readings', activity: `Readings: ${REQUIRED_PAGES} pages at about ${READING_RATE_PAGES_PER_HOUR} pages an hour`, hours: round1(REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR) },
    { id: 'slides', activity: `Training-deck slides: ${REQUIRED_SLIDES} slides at about ${READING_RATE_SLIDES_PER_HOUR} slides an hour`, hours: round1(REQUIRED_SLIDES / READING_RATE_SLIDES_PER_HOUR) },
    { id: 'lesson', activity: `Detailed lesson and worked examples (${words.toLocaleString('en-US')} words at about ${LESSON_WPM} words a minute)`, hours: Math.max(0.1, round1(words / LESSON_WPM / 60)) },
    { id: 'lab', activity: `Lab L9 out of class: your share of about ${LAB_TEAM_HOURS} person-hours (team of four)`, hours: round1(LAB_TEAM_HOURS / 4) },
    { id: 'quiz', activity: 'Readiness quiz Q9', hours: 0.3 },
    { id: 'exercise', activity: `Individual applied exercise, about ${EXERCISE_MINUTES} min (graduate students answer task 5 within the same time)`, hours: EXERCISE_HOURS },
    { id: 'log', activity: 'Time log', hours: 0.1 },
  ]
})()
export const WORKLOAD_TOTAL = round1(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0))
export const WORKLOAD_SUMMARY = n(
  `Hours per student for a team of four: ${WORKLOAD_TOTAL.toFixed(1)} h against the ${WEEK9_BUDGET_HOURS.toFixed(1)} h budget, graduate students included (they answer the graduate version of task 5 of the applied exercise in the same time). A team of three works to a reduced scope (contributing stakeholders kept in documentation, the shared definition optional with a reason, at least six AI findings; pending faculty approval): about ${THREE_PERSON.teamHours.toFixed(1)} person-hours, ${THREE_PERSON.each.toFixed(1)} h each. Log your actual hours so the estimate can be tested.`,
)
