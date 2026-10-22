// Week 11 on the lecture-first path (DECISION_LOG A20, A21, A24): the week page's text (subject, how the week runs,
// readings, deliverables, entry cards) and the workload. Everything here is new and flagged for review (PENDING).
// AeroLink is the instructor's worked example; each team models its own physical architecture and interfaces (A21 item
// 9), in the model it built in Weeks 8 to 10 (A22/A23: one continuous engineering journey): model v0.3 becomes v0.4.
//
// Workload (A21 item 4, budget 8.0 h): computed, never typed. The in-class lab minutes are read from the Session 2 slides;
// the lesson hours from the lesson's word count; the lab hours from the person-hours in labBrief.ts. A team of three
// carries more per person than a team of four (two tasks shrink, the rest do not); its total is computed and stays within
// the budget (Week 10 review N1: no "same scope, fewer hours" rows).
import { WEEKS } from './course'
import { lecturesOfWeek, weekLesson } from './lectures'
import { allSlides, blockText, lectureMinutes, wordCount } from './lectures/text'
import { getReading, type Citation } from './readings'
import { PENDING, type NewText } from './learn/types'
import { EXERCISE_MINUTES, LAB11_MINIMUMS, LAB11_TEAM_HOURS, LAB11_TEAM_HOURS_THREE } from './lectures/week11/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
export const W11 = WEEKS[10]
export const WEEK11_BUDGET_HOURS = 8.0

/** The Week 11 subject as scheduled (COURSE_SCHEDULE.md, exact: “Physical / Interfaces”) and the topics as taught. */
export const WEEK11_TOPICS = ['The physical architecture: system elements, physical interfaces and components', 'Allocating the logical architecture to physical elements, with nested allocations', 'Ports, directed features and conjugation', 'Interfaces, connections, flows and bindings, from your Week 5 interface table', 'Interface requirements and their allocation; the first satisfy claims']

export const WEEK11_LEDE = n(
  'This week your team’s Week 4 physical view and Week 5 components and interfaces become the physical architecture of the SysML v2 model it has built since Week 8. The instructor first sets out what a physical architecture is: system elements and the physical interfaces that bind them, and the allocation of the logical architecture to them. Then the constructs: physical elements and components as parts that perform the functions placed on them, the allocation from logical to physical parts with nested allocations, ports with directed items and their conjugates, interfaces with the flows of what crosses, connections and bindings, interface requirements allocated to their interfaces and functions, and the first satisfy claims. Each idea is shown on the AeroLink model, generated from the AeroLink Phase I package. In Lab L11 your team generates model v0.4 of its own enterprise with the Week 11 lab tool, sets what crosses each interface, allocates its interface requirements and writes its first satisfy claims.',
)
export const WEEK11_WHY = n(
  'Week 12 verifies the requirements against this design and plans the evidence for every satisfy claim. An interface whose ports cannot match, a flow that runs the wrong way, or a claim about the wrong element is a defect the checker accepts silently and every later week inherits.',
)

/** Proposed objectives, pending faculty approval; W11.1–W11.3 come from course.ts. */
export const PROPOSED_OBJECTIVES: { id: string; text: string; bloom: string }[] = [
  { id: 'W11.4', text: 'Model interface ends as ports with directed items, using a port definition and its conjugate so that every out item meets an in item, and explain why the checker cannot detect two ports that do not match', bloom: 'Apply' },
  { id: 'W11.5', text: 'Allocate each interface requirement to its interface and to the function that realizes it, and write a satisfy claim with a design value and its basis', bloom: 'Apply' },
  { id: 'W11.6', text: 'Graduate: judge whether a satisfy claim can be defended from the design values the model holds, and name the verification evidence it still needs', bloom: 'Evaluate' },
]

const sessions = lecturesOfWeek(11)
const s1 = sessions.find((l) => l.session === 1)
const s2 = sessions.find((l) => l.session === 2)
const s2Lab = s2?.sections.find((s) => s.id === 'w11s2-lab')
const labMin = (id: string, fallback: number) => s2Lab?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: s2Lab ? s2Lab.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w11s2-lab-brief', 3),
  map: labMin('w11s2-lab-map', 12),
  checkpoint: labMin('w11s2-lab-checkpoint', 5),
  close: labMin('w11s2-lab-close', 2),
}
const s2LectureMinutes = s2 ? lectureMinutes(s2) - S2_LAB.total : 47

export const TIMELINE: { id: string; when: string; what: string; detail: NewText }[] = [
  { id: 'session1', when: 'Session 1 · 75 min', what: 'Lecture: physical architecture, allocation and ports', detail: n(`${s1 ? allSlides(s1).length : 23} slides: the physical architecture as SEBoK defines it, layers and components, allocating logical elements to physical ones and the criteria, the pitfalls, physical elements and components as parts, functions performed by physical parts, the logical-to-physical allocation with nested allocations, design properties, port definitions, directed features and matching, conjugation, what crosses an interface, and the AeroLink charging interface worked through. Ends with an exit card: the port definition of one of your interfaces.`) },
  { id: 'session2', when: 'Session 2 · 75 min', what: 'Lecture, then the Lab L11 launch', detail: n(`About ${s2LectureMinutes} min of lecture on connections, interfaces, flows and bindings, organizational interfaces, interface requirements and their allocation, satisfy claims, the checker’s limits and the interface review checklist, then about ${S2_LAB.total} min of laboratory launch: your team imports its files into the lab tool and sets what crosses its interfaces, with an instructor checkpoint.`) },
  { id: 'lab', when: 'Out of class · 7 days', what: 'Lab L11: model v0.4', detail: n(`Your team completes model v0.4 of its own enterprise: every physical element and component as a part, the logical architecture allocated to them, every Week 5 interface with its ports and flows, every interface requirement allocated, at least ${LAB11_MINIMUMS.satisfy} satisfy claims with their basis (a team of three: ${LAB11_MINIMUMS.satisfyThree}), the interface review with a disposition for every finding, and a checker log ending in a run with zero errors.`) },
  { id: 'assessment', when: 'Before Week 12, Session 1', what: 'Assessment and submission', detail: n('Take readiness quiz Q11 (individual, formative) and the individual applied exercise on an unseen case (graduate students answer the graduate version of its fifth task), and upload model v0.4 with its interface review and checker log.') },
]

// ------------------------------------------------------------------------------------------- readings
export const READING_RATE_PAGES_PER_HOUR = 15
export const READING_RATE_SLIDES_PER_HOUR = 30
/** Essential readings: the pages and training-deck slides the lecture teaches from. */
export const REQUIRED_READINGS_CITES: Citation[] = [
  { reading: 'R20c', pages: '596–598' },
  { reading: 'R81', pages: '93' },
  { reading: 'R81', pages: '106' },
  { reading: 'R57', pages: '411–412' },
  { reading: 'R71', pages: '18–29' },
  { reading: 'R76', pages: '106' },
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
  { reading: 'R20c', pages: '599–603' },
  { reading: 'R81', pages: '95' },
  { reading: 'R81', pages: '109–112' },
  { reading: 'R13', pages: '563' },
  { reading: 'R83', pages: '162' },
]
export const READINGS_NOTE = n('Read the SEBoK pages and the port and connection slides before Session 1, and the interface pages, the interface-management pages and the flow slides before Session 2. The extension pages give the rest of SEBoK’s physical architecture with its pitfalls, the specification’s conjugated ports, interface usages and allocations, SEBoK’s definition of an interface requirement, and the semantics of satisfy.')

// ------------------------------------------------------------------------------------------- deliverables
export const DELIVERABLES: { id: string; what: string; who: string; due: string; where: string }[] = [
  { id: 'exit', what: 'Exit card: the port definition of one of your team’s interfaces', who: 'Each member', due: 'Start of Session 2', where: 'Brought to class; used at the lab checkpoint' },
  { id: 'map', what: 'The crossings of your interfaces set in the lab tool', who: 'Team', due: 'End of Session 2', where: 'The lab tool (shown at the checkpoint)' },
  { id: 'model', what: 'Model v0.4 (.sysml), the interface review with the audit, the review checklist and the AI usage statement (.md), and the checker log (.txt)', who: 'Team, one upload', due: 'Before Week 12, Session 1', where: 'LMS assignment “Week 11 model v0.4”' },
  { id: 'quiz', what: 'Readiness quiz Q11', who: 'Individual', due: 'Before Week 12, Session 1', where: 'Assessment page (formative)' },
  { id: 'exercise', what: `Individual applied exercise (about ${EXERCISE_MINUTES} min, unseen case; graduate students answer the graduate version of task 5)`, who: 'Individual', due: 'Before Week 12, Session 1', where: 'LMS assignment “Week 11 applied exercise”' },
]

export const ENTRY_TEXT = {
  lecture: n('The two 75-minute lectures as the instructor presents them: the slide viewer with keyboard navigation and a print handout. Download the PowerPoint deck to annotate offline.'),
  lesson: n('The long-form lesson: the explanation behind every slide, with the figures, the listings, the definitions and their sources, and the AeroLink worked model in full.'),
  examples: n('The AeroLink physical architecture and interfaces worked step by step: the parts and the allocation matrix, the ports of the charging interface, the interface set, the interface requirements and the satisfy claims, with the generated model v0.4 file the checker accepted.'),
  lab: n('Full instructions for Lab L11: purpose, inputs, method, procedure, outputs, rubric rows and submission, with the lab tool that reads your Week 10 model and your Week 5 export and generates model v0.4.'),
  assessment: n('Readiness quiz Q11, kept separate from the lecture, the individual applied exercise with its rubric, and the submission readiness.'),
}

// ------------------------------------------------------------------------------------------- workload
export const LESSON_WPM = 150
export function lessonWords(): number {
  let words = 0
  for (const { section } of weekLesson(11))
    for (const b of section.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') words += wordCount(b.text)
      else if (b.kind !== 'figure' && b.kind !== 'slide-ref') words += blockText(b).reduce((a, t) => a + wordCount(t), 0)
    }
  return words
}
const round1 = (x: number) => Math.round(x * 10) / 10

export const LAB_TEAM_HOURS = LAB11_TEAM_HOURS
export const EXERCISE_HOURS = round1(EXERCISE_MINUTES / 60)

export const WORKLOAD_ROWS: { id: string; activity: string; hours: number }[] = (() => {
  const words = lessonWords()
  return [
    { id: 'class', activity: 'Class sessions (2 × 75 min)', hours: 2.5 },
    { id: 'readings', activity: `Readings: ${REQUIRED_PAGES} pages at about ${READING_RATE_PAGES_PER_HOUR} pages an hour`, hours: round1(REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR) },
    { id: 'slides', activity: `Training-deck slides: ${REQUIRED_SLIDES} slides at about ${READING_RATE_SLIDES_PER_HOUR} slides an hour`, hours: round1(REQUIRED_SLIDES / READING_RATE_SLIDES_PER_HOUR) },
    { id: 'lesson', activity: `Detailed lesson and worked examples (${words.toLocaleString('en-US')} words at about ${LESSON_WPM} words a minute)`, hours: Math.max(0.1, round1(words / LESSON_WPM / 60)) },
    { id: 'lab', activity: `Lab L11 out of class: your share of about ${LAB_TEAM_HOURS} person-hours (team of four)`, hours: round1(LAB_TEAM_HOURS / 4) },
    { id: 'quiz', activity: 'Readiness quiz Q11', hours: 0.3 },
    { id: 'exercise', activity: `Individual applied exercise, about ${EXERCISE_MINUTES} min (graduate students answer the graduate version of task 5 within the same time)`, hours: EXERCISE_HOURS },
    { id: 'log', activity: 'Time log', hours: 0.1 },
  ]
})()
export const WORKLOAD_TOTAL = round1(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0))
/** A three-person team (labBrief.ts LAB11_PERSON_HOURS_THREE; pending faculty approval): its share and its week total. */
export const THREE_PERSON = (() => {
  const each = round1(LAB11_TEAM_HOURS_THREE / 3)
  const total = round1(WORKLOAD_ROWS.reduce((a, r) => a + (r.id === 'lab' ? each : r.hours), 0))
  return { teamHours: LAB11_TEAM_HOURS_THREE, each, total }
})()
export const WORKLOAD_SUMMARY = n(
  `Hours per student for a team of four: ${WORKLOAD_TOTAL.toFixed(1)} h against the ${WEEK11_BUDGET_HOURS.toFixed(1)} h budget, graduate students included (they answer the graduate version of task 5 of the applied exercise in the same time). A team of three makes one satisfy claim instead of two (the lab tool asks for one when the team has three members); every other task is the same work, so its share is higher: about ${THREE_PERSON.teamHours.toFixed(1)} person-hours, ${THREE_PERSON.each.toFixed(1)} h each, a week of ${THREE_PERSON.total.toFixed(1)} h, still within the budget (pending faculty approval). Log your actual hours so the estimate can be tested.`,
)
