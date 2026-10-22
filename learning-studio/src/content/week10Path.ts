// Week 10 on the lecture-first path (DECISION_LOG A20, A21, A24): the week page's text (subject, how the week runs,
// readings, deliverables, entry cards) and the workload. Everything here is new and flagged for review (PENDING).
// AeroLink is the instructor's worked example; each team models its own logical architecture and behavior (A21 item 9),
// in the model it built in Weeks 8 and 9 (A22/A23: one continuous engineering journey): model v0.2 becomes v0.3.
//
// Workload (A21 item 4, budget 8.0 h): computed, never typed. The in-class lab minutes are read from the Session 2 slides;
// the lesson hours from the lesson's word count; the lab hours from the person-hours in labBrief.ts.
import { WEEKS } from './course'
import { lecturesOfWeek, weekLesson } from './lectures'
import { allSlides, blockText, lectureMinutes, wordCount } from './lectures/text'
import { getReading, type Citation } from './readings'
import { PENDING, type NewText } from './learn/types'
import { EXERCISE_MINUTES, LAB10_PERSON_HOURS, LAB10_PERSON_HOURS_THREE, LAB10_TEAM_HOURS, LAB10_TEAM_HOURS_THREE } from './lectures/week10/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
export const W10 = WEEKS[9]
export const WEEK10_BUDGET_HOURS = 8.0

/** The Week 10 subject as scheduled (COURSE_SCHEDULE.md, exact: “Logical / Behavioral Modeling”) and the topics as taught. */
export const WEEK10_TOPICS = ['Logical architecture versus physical architecture: functions, items and logical elements', 'Logical decomposition with part definitions and usages; functions allocated to logical elements; requirements allocated to functions', 'Your Week 2 scenarios and Week 4 architecture in the model, with stable IDs', 'Action flows: successions, decisions, merges, forks and item flows', 'Operating states, use cases, and checking behavior against the ConOps']

export const WEEK10_LEDE = n(
  'This week your team’s Week 4 architecture and Week 2 ConOps become the logical architecture and the behavior of the SysML v2 model it has built since Week 8. The instructor first separates the logical architecture, what the system must do and which logical element does it, from the physical architecture of Week 11. Then the constructs: capabilities and functions as actions with the items they consume and produce, logical elements as parts that perform them, requirements allocated to functions, a scenario as an action flow with decisions, merges and item flows, operating states with their transitions, and every scenario as a use case. Each idea is shown on the AeroLink model, generated from the AeroLink Phase I package. In Lab L10 your team generates model v0.3 of its own enterprise with the Week 10 lab tool, maps one scenario step by step, defines one set of operating states and reviews the behavior against its ConOps.',
)
export const WEEK10_WHY = n(
  'Week 11 gives every logical element a physical home and every item a port and an interface, and Week 12 verifies the requirements your functions now realize. A function without its inputs and outputs, a scenario whose decisions leave a case uncovered, or a state no transition reaches is a defect the checker accepts silently and every later week inherits.',
)

/** Proposed objectives (outline §1), pending faculty approval; W10.1–W10.3 come from course.ts. */
export const PROPOSED_OBJECTIVES: { id: string; text: string; bloom: string }[] = [
  { id: 'W10.4', text: 'Model an operating-state definition with an initial state, triggered and guarded transitions and entry or do functions, exhibited by a part, and distinguish a function from an operational mode', bloom: 'Apply' },
  { id: 'W10.5', text: 'Model the ConOps scenarios as use cases with a subject, actors and an objective, and use include correctly', bloom: 'Apply' },
  { id: 'W10.6', text: 'Graduate: cross-check an action flow against a state definition and state which disagreements a reviewer must resolve that no checker reports', bloom: 'Evaluate' },
]

const sessions = lecturesOfWeek(10)
const s1 = sessions.find((l) => l.session === 1)
const s2 = sessions.find((l) => l.session === 2)
const s2Lab = s2?.sections.find((s) => s.id === 'w10s2-lab')
const labMin = (id: string, fallback: number) => s2Lab?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: s2Lab ? s2Lab.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w10s2-lab-brief', 3),
  map: labMin('w10s2-lab-map', 12),
  checkpoint: labMin('w10s2-lab-checkpoint', 5),
  close: labMin('w10s2-lab-close', 2),
}
const s2LectureMinutes = s2 ? lectureMinutes(s2) - S2_LAB.total : 47

export const TIMELINE: { id: string; when: string; what: string; detail: NewText }[] = [
  { id: 'session1', when: 'Session 1 · 75 min', what: 'Lecture: logical architecture and action flows', detail: n(`${s1 ? allSlides(s1).length : 24} slides: logical versus physical architecture, the three views of a logical architecture, functions with their inputs and outputs, logical parts as definitions and usages, capabilities, requirements allocated to functions, actions with parameters, perform and allocate, successions and flows, decisions, merges and forks, item flows, and SCN-002 of AeroLink worked as an action flow. Ends with an exit card: one of your scenario steps and one alternate mapped to the flow.`) },
  { id: 'session2', when: 'Session 2 · 75 min', what: 'Lecture, then the Lab L10 launch', detail: n(`About ${s2LectureMinutes} min of lecture on operating states, transitions and exhibit, use cases and include, cross-checking flow against states, common errors and the behavior review checklist, then about ${S2_LAB.total} min of laboratory launch: your team imports its files into the lab tool and maps its chosen scenario step by step, with an instructor checkpoint.`) },
  { id: 'lab', when: 'Out of class · 7 days', what: 'Lab L10: model v0.3', detail: n('Your team completes model v0.3 of its own enterprise: every function with its items and performer, one scenario as an action flow with its decisions, merges and item flows, one state definition exhibited by a part, a use case for every scenario, the behavior review with a disposition for every finding, and a checker log ending in a run with zero errors.') },
  { id: 'assessment', when: 'Before Week 11, Session 1', what: 'Assessment and submission', detail: n('Take readiness quiz Q10 (individual, formative) and the individual applied exercise on an unseen case (graduate students answer the graduate version of its fifth task), and upload model v0.3 with its behavior review and checker log.') },
]

// ------------------------------------------------------------------------------------------- readings
export const READING_RATE_PAGES_PER_HOUR = 15
export const READING_RATE_SLIDES_PER_HOUR = 30
/** Essential readings: the pages and training-deck slides the lecture teaches from (outline §10). */
export const REQUIRED_READINGS_CITES: Citation[] = [
  { reading: 'R20b', pages: '587–589' },
  { reading: 'R20b', pages: '594' },
  { reading: 'R82', pages: '117–118' },
  { reading: 'R72', pages: '30–41' },
  { reading: 'R73', pages: '48–56' },
  { reading: 'R76', pages: '100–101' },
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
  { reading: 'R20c', pages: '596' },
  { reading: 'R81', pages: '110–111' },
  { reading: 'R82', pages: '145–146' },
  { reading: 'R116', pages: '177' },
  { reading: 'R76', pages: '106–107' },
]
export const READINGS_NOTE = n('Read the SEBoK pages and the action slides before Session 1, and the state and use-case slides before Session 2. The extension pages give the physical-architecture contrast, the specification’s allocation and state semantics, and its definition of a use case.')

// ------------------------------------------------------------------------------------------- deliverables
export const DELIVERABLES: { id: string; what: string; who: string; due: string; where: string }[] = [
  { id: 'exit', what: 'Exit card: one step and one alternate of your team’s chosen scenario mapped to flow nodes', who: 'Each member', due: 'Start of Session 2', where: 'Brought to class; used at the lab checkpoint' },
  { id: 'map', what: 'The chosen scenario mapped step by step in the lab tool', who: 'Team', due: 'End of Session 2', where: 'The lab tool (shown at the checkpoint)' },
  { id: 'model', what: 'Model v0.3 (.sysml), the behavior review with the audit, the review checklist and the AI usage statement (.md), and the checker log (.txt)', who: 'Team, one upload', due: 'Before Week 11, Session 1', where: 'LMS assignment “Week 10 model v0.3”' },
  { id: 'quiz', what: 'Readiness quiz Q10', who: 'Individual', due: 'Before Week 11, Session 1', where: 'Assessment page (formative)' },
  { id: 'exercise', what: `Individual applied exercise (about ${EXERCISE_MINUTES} min, unseen case; graduate students answer the graduate version of task 5)`, who: 'Individual', due: 'Before Week 11, Session 1', where: 'LMS assignment “Week 10 applied exercise”' },
]

export const ENTRY_TEXT = {
  lecture: n('The two 75-minute lectures as the instructor presents them: the slide viewer with keyboard navigation and a print handout. Download the PowerPoint deck to annotate offline.'),
  lesson: n('The long-form lesson: the explanation behind every slide, with the figures, the listings, the definitions and their sources, and the AeroLink worked model in full.'),
  examples: n('The AeroLink logical architecture and behavior worked step by step: the logical parts and the requirements allocated to their functions, a scenario as an action flow, the aircraft’s operating states and the five scenarios as use cases, with the generated model v0.3 file the checker accepted.'),
  lab: n('Full instructions for Lab L10: purpose, inputs, method, procedure, outputs, rubric rows and submission, with the lab tool that reads your Week 9 model and your Week 2 and Week 4 exports and generates model v0.3.'),
  assessment: n('Readiness quiz Q10, kept separate from the lecture, the individual applied exercise with its rubric, and the submission readiness.'),
}

// ------------------------------------------------------------------------------------------- workload
export const LESSON_WPM = 150
export function lessonWords(): number {
  let words = 0
  for (const { section } of weekLesson(10))
    for (const b of section.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') words += wordCount(b.text)
      else if (b.kind !== 'figure' && b.kind !== 'slide-ref') words += blockText(b).reduce((a, t) => a + wordCount(t), 0)
    }
  return words
}
const round1 = (x: number) => Math.round(x * 10) / 10

export const LAB_PERSON_HOURS = LAB10_PERSON_HOURS
export const LAB_TEAM_HOURS = LAB10_TEAM_HOURS
/** A three-person team at the reduced scope (labBrief.ts; A21 item 4, pending confirmation). */
export const THREE_PERSON = { teamHours: LAB10_TEAM_HOURS_THREE, each: round1(LAB10_TEAM_HOURS_THREE / 3), tasks: LAB10_PERSON_HOURS_THREE }
export const EXERCISE_HOURS = round1(EXERCISE_MINUTES / 60)

export const WORKLOAD_ROWS: { id: string; activity: string; hours: number }[] = (() => {
  const words = lessonWords()
  return [
    { id: 'class', activity: 'Class sessions (2 × 75 min)', hours: 2.5 },
    { id: 'readings', activity: `Readings: ${REQUIRED_PAGES} pages at about ${READING_RATE_PAGES_PER_HOUR} pages an hour`, hours: round1(REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR) },
    { id: 'slides', activity: `Training-deck slides: ${REQUIRED_SLIDES} slides at about ${READING_RATE_SLIDES_PER_HOUR} slides an hour`, hours: round1(REQUIRED_SLIDES / READING_RATE_SLIDES_PER_HOUR) },
    { id: 'lesson', activity: `Detailed lesson and worked examples (${words.toLocaleString('en-US')} words at about ${LESSON_WPM} words a minute)`, hours: Math.max(0.1, round1(words / LESSON_WPM / 60)) },
    { id: 'lab', activity: `Lab L10 out of class: your share of about ${LAB_TEAM_HOURS} person-hours (team of four)`, hours: round1(LAB_TEAM_HOURS / 4) },
    { id: 'quiz', activity: 'Readiness quiz Q10', hours: 0.3 },
    { id: 'exercise', activity: `Individual applied exercise, about ${EXERCISE_MINUTES} min (graduate students answer the graduate version of task 5 within the same time)`, hours: EXERCISE_HOURS },
    { id: 'log', activity: 'Time log', hours: 0.1 },
  ]
})()
export const WORKLOAD_TOTAL = round1(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0))
export const WORKLOAD_SUMMARY = n(
  `Hours per student for a team of four: ${WORKLOAD_TOTAL.toFixed(1)} h against the ${WEEK10_BUDGET_HOURS.toFixed(1)} h budget, graduate students included (they answer the graduate version of task 5 of the applied exercise in the same time). A team of three works to a reduced scope (the scenario with the fewest alternates that still has one, a smaller state definition; pending faculty approval): about ${THREE_PERSON.teamHours.toFixed(1)} person-hours, ${THREE_PERSON.each.toFixed(1)} h each. Log your actual hours so the estimate can be tested.`,
)
