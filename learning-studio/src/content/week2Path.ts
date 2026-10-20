// Week 2 on the lecture-first path (DECISION_LOG A20, A21): the week page's text (subject, how the week runs, readings,
// deliverables, entry cards) and the workload. Everything here is new and flagged for review (PENDING). AeroLink is the
// instructor's worked example; each team's lab and record are about its own enterprise (DECISION_LOG A21 item 9).
//
// Workload (outline §5.7; A21 item 4): 8.0 h per student for a team of four, the lab proportional to team size. The
// in-class lab minutes are read from the Session 2 slides; the lesson hours from the lesson's word count.
import { WEEKS } from './course'
import { lecturesOfWeek, weekLesson } from './lectures'
import { blockText, lectureMinutes, allSlides, wordCount } from './lectures/text'
import { getReading, type Citation } from './readings'
import { PENDING, type NewText } from './learn/types'
import { LAB2_MINIMUMS as MIN, LAB2_MINIMUMS_THREE as MIN3, LAB2_PERSON_HOURS } from './lectures/week02/labBrief'

const n = (text: string): NewText => ({ text, review: PENDING })
export const W2 = WEEKS[1]
export const WEEK2_BUDGET_HOURS = 8.0

/** The Week 2 subject as scheduled (COURSE_SCHEDULE.md), and the topics as this week teaches them (TPMs in Week 3). */
export const WEEK2_TOPICS = ['Concept of operations and operational scenarios', 'Capabilities derived from needs', 'From needs to stakeholder and system requirements', 'Requirement quality, verification methods and bidirectional traceability', 'Measures of effectiveness and performance (TPMs follow in Week 3)']

export const WEEK2_LEDE = n(
  'This week turns your team’s needs into an operational picture and then into requirements. The instructor teaches how a concept of operations and its scenarios put the needs into operation and expose what was missed, how capabilities are derived, and how stakeholder and system requirements are written, checked and traced; the whole method is worked once on AeroLink. Your team then applies it to its own enterprise in Lab L2, extending the Team Record it handed in for Week 1.',
)
export const WEEK2_WHY = n(
  'Requirements written straight from needs miss what only operation reveals: the off-nominal case, the assumption nobody has agreed, the value nobody knows yet. Scenarios find those first. The requirements, scenarios and measures you record this week are the inputs of the Week 3 trade study and, in Phase II, become requirement definitions, use cases and verification cases in your SysML v2 model.',
)

/** Proposed objectives from the outline (§1), pending faculty approval; W2.1–W2.5 come from course.ts. */
export const PROPOSED_OBJECTIVES: { id: string; text: string; bloom: string }[] = [
  { id: 'W2.6', text: 'Derive capabilities from needs and relate each capability to the scenarios that exercise it', bloom: 'Apply / Analyze' },
  { id: 'W2.7', text: 'Evaluate a scenario set for coverage of the needs and a requirement set against the sourced characteristics, and defend each finding', bloom: 'Evaluate' },
]

const sessions = lecturesOfWeek(2)
const s1 = sessions.find((l) => l.session === 1)
const s2 = sessions.find((l) => l.session === 2)
const s2Lab = s2?.sections.find((s) => s.id === 'w2s2-lab')
const labMin = (id: string, fallback: number) => s2Lab?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides. */
export const S2_LAB = {
  total: s2Lab ? s2Lab.slides.reduce((a, s) => a + s.minutes, 0) : 22,
  brief: labMin('w2s2-lab-brief', 3),
  plan: labMin('w2s2-lab-plan', 8),
  clinic: labMin('w2s2-lab-clinic', 9),
  close: labMin('w2s2-lab-close', 2),
  clinicTeams: 5,
}
const s2LectureMinutes = s2 ? lectureMinutes(s2) - S2_LAB.total : 47

export const TIMELINE: { id: string; when: string; what: string; detail: NewText }[] = [
  { id: 'session1', when: 'Session 1 · 75 min', what: 'Lecture: from needs to operations', detail: n(`${s1 ? allSlides(s1).length : 24} slides, all lecture: what a concept of operations is and contains, how use cases and scenarios are written and reviewed, the AeroLink weather scenario worked in full, capabilities, and the two levels of requirement. Ends with the preparation for Session 2: each member drafts one candidate scenario.`) },
  { id: 'session2', when: 'Session 2 · 75 min', what: 'Lecture, then the Lab L2 launch', detail: n(`About ${s2LectureMinutes} min of lecture on writing, checking and tracing requirements and on measures, worked on AeroLink, then about ${S2_LAB.total} min of laboratory launch: the team chooses its scenarios and owners, and the instructor runs the scenario clinic.`) },
  { id: 'lab', when: 'Out of class · 7 days', what: 'Lab L2: ConOps and requirements', detail: n(`Your team extends its Week 1 Team Record: a ConOps narrative, at least ${MIN.scenarios} scenarios, capabilities with the coverage matrix, at least ${MIN.requirements} requirements traced to your needs, the trace audit and the measures.`) },
  { id: 'assessment', when: 'Before Week 3, Session 1', what: 'Assessment and submission', detail: n('Take readiness quiz Q2 (individual, formative) and the individual applied exercise (graduate students: the requirements-checklist memo instead), and upload the Week 2 record with its model-inputs file.') },
]

// ------------------------------------------------------------------------------------------- readings
export const READING_RATE_PAGES_PER_HOUR = 15
/** Essential readings, narrowed to the pages the lecture teaches from (outline §5.1, trimmed to 12 pages so the detailed
 *  lesson, like Week 1's, carries the explanation within the 8 h budget; R54 and R13 p.560 move to the extension list). */
export const REQUIRED_READINGS_CITES: Citation[] = [
  { reading: 'R52', pages: '299–302' },
  { reading: 'R59', pages: '453–455' },
  { reading: 'R13', pages: '557–559' },
  { reading: 'R13', pages: '565–566' },
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
  { reading: 'R54', pages: '329–331' },
  { reading: 'R13', pages: '560' },
  { reading: 'R55', pages: '365–371' },
  { reading: 'R48a', pages: '141–142' },
  { reading: 'R48b', pages: '142–144' },
  { reading: 'R45', pages: '118–119' },
  { reading: 'R10', pages: '546' },
]
export const READINGS_NOTE = n('Read R13 pp.557–559 and 565–566 before Session 2; the others after Session 1. The extension pages deepen the requirement-writing rules and are the basis of the graduate memo.')

// ------------------------------------------------------------------------------------------- deliverables
export const DELIVERABLES: { id: string; what: string; who: string; due: string; where: string }[] = [
  { id: 'candidate', what: 'One candidate scenario skeleton (trigger, primary actor, failure end state)', who: 'Each member', due: 'Start of Session 2', where: 'Brought to class (not uploaded)' },
  { id: 'clinic', what: 'Scenario list, owners and the clinic decision', who: 'Team', due: 'End of Session 2', where: 'Recorded in the lab tool; the decision is the instructor’s' },
  { id: 'record', what: 'Week 2 record (.md) and model inputs (.json)', who: 'Team, one upload', due: 'Before Week 3, Session 1', where: 'LMS assignment “Week 2 Team Record”' },
  { id: 'quiz', what: 'Readiness quiz Q2', who: 'Individual', due: 'Before Week 3, Session 1', where: 'Assessment page (formative)' },
  { id: 'exercise', what: 'Individual applied exercise (about 35 min, unseen case)', who: 'Individual', due: 'Before Week 3, Session 1', where: 'LMS assignment “Week 2 applied exercise”' },
  { id: 'grad', what: 'Graduate memo: the system-level requirements checklist applied to the team set (one page)', who: 'Graduate students, individual', due: 'Before Week 3, Session 1', where: 'LMS assignment “Week 2 graduate memo” (replaces the applied exercise)' },
]

export const ENTRY_TEXT = {
  lecture: n('The two 75-minute lectures as the instructor presents them: the slide viewer with keyboard navigation and a print handout. Download the PowerPoint deck to annotate offline.'),
  lesson: n('The long-form lesson: the explanation behind every slide, with the figures, the definitions and their sources, and the AeroLink case in full.'),
  examples: n('The AeroLink case worked step by step: the weather scenario and what it exposed, the coverage matrix, the capability tree, the requirement chains, the corrected noise requirements, the critique, the trace audit and the measures.'),
  lab: n('Full instructions for Lab L2: purpose, inputs, method, procedure, outputs, rubric rows and submission, with the lab tool that imports your Week 1 record.'),
  assessment: n('Readiness quiz Q2, kept separate from the lecture, and the Week 2 record’s submission readiness.'),
}

// ------------------------------------------------------------------------------------------- workload
export const LESSON_WPM = 150
export function lessonWords(): number {
  let words = 0
  for (const { section } of weekLesson(2))
    for (const b of section.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') words += wordCount(b.text)
      else if (b.kind !== 'figure' && b.kind !== 'slide-ref') words += blockText(b).reduce((a, t) => a + wordCount(t), 0)
    }
  return words
}
const round1 = (x: number) => Math.round(x * 10) / 10

/** Lab L2 out of class in person-hours for a team of four (outline §5.7); the single source is labBrief.ts. */
export const LAB_PERSON_HOURS = LAB2_PERSON_HOURS
export const LAB_TEAM_HOURS = round1(LAB_PERSON_HOURS.reduce((a, t) => a + t.hours, 0))

/** A three-person team at the reduced minimums (labBrief.ts LAB2_MINIMUMS_THREE; A21 item 4, pending confirmation):
 *  the narrative, discovery log and integration are fixed; scenarios are 1.0 h each; capabilities, requirements and
 *  measures scale with their minimums (the audit half of “trace audit and measures” is fixed, the measures half scales). */
export const THREE_PERSON = (() => {
  const h = (k: string) => LAB_PERSON_HOURS.find((t) => t.task.startsWith(k))!.hours
  const teamHours = round1(
    h('ConOps') + MIN3.scenarios * (h('scenarios') / MIN.scenarios) + h('discovery') + h('capabilities') * (MIN3.capabilities / MIN.capabilities) + h('requirements') * (MIN3.requirements / MIN.requirements) + h('trace audit') * (0.5 + 0.5 * ((MIN3.moes + MIN3.mops) / (MIN.moes + MIN.mops))) + h('integration'),
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
    { id: 'candidate', activity: 'Candidate scenario skeleton before Session 2 (trigger, primary actor, failure end state)', hours: 0.3 },
    { id: 'lab', activity: `Lab L2 out of class: your share of about ${LAB_TEAM_HOURS} person-hours (team of four)`, hours: round1(LAB_TEAM_HOURS / 4) },
    { id: 'quiz', activity: 'Readiness quiz Q2', hours: 0.3 },
    { id: 'exercise', activity: 'Individual applied exercise (graduate students: the memo, 0.8 h)', hours: 0.6 },
    { id: 'log', activity: 'Time log', hours: 0.1 },
  ]
})()
export const WORKLOAD_TOTAL = round1(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0))
export const WORKLOAD_SUMMARY = n(
  `Hours per student for a team of four: ${WORKLOAD_TOTAL.toFixed(1)} h against the ${WEEK2_BUDGET_HOURS.toFixed(1)} h budget (graduate students ${(WORKLOAD_TOTAL + 0.2).toFixed(1)} h, the memo replacing the applied exercise). A team of three works to minimums reduced in proportion (${MIN3.scenarios} scenarios, ${MIN3.capabilities} capabilities, ${MIN3.requirements} requirements, ${MIN3.moes} MOEs and ${MIN3.mops} MOPs; pending faculty approval): about ${THREE_PERSON.teamHours} person-hours, ${THREE_PERSON.each.toFixed(1)} h each. Log your actual hours so the estimate can be tested.`,
)
