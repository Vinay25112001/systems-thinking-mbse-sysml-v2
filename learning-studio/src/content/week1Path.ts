// Week 1 on the lecture-first path (DECISION_LOG A20, faculty direction 2026-10-19): the week page's text (subject,
// how the week runs, readings, deliverables, entry cards) and the workload computed from the new path. Everything
// written here is new and flagged for review (PENDING). AeroLink is the instructor's worked example; each team's lab
// and Team Record are about its own enterprise (DECISION_LOG A16).
import { PRACTICE_MINUTES_TOTAL } from '../week1/practice/minutes'
import { WEEKS } from './course'
import { lecturesOfWeek, weekLesson } from './lectures'
import { blockText, lectureMinutes, allSlides, wordCount } from './lectures/text'
import week1Missions from './missions/week01'
import { getReading, type Citation } from './readings'
import { workloadTotal, WORKLOAD_TARGET } from './schema'
import week01 from './weeks/week01'
import { PENDING, type NewText } from './learn/types'

const n = (text: string): NewText => ({ text, review: PENDING })
const W1 = WEEKS[0]

// ------------------------------------------------------------------------------------------- the week page
export const WEEK1_LEDE = n(
  'This week your team forms, proposes the enterprise it will model all term, and finds the people that enterprise must satisfy: its stakeholders, their concerns and their first needs. The instructor teaches the method in two lectures and works it once, end to end, on AeroLink, the course’s fictional reference case. Your team then applies it to its own enterprise in Lab L1 and hands in the Week 1 Team Record.',
)

export const WEEK1_WHY = n(
  'Stakeholders and their needs come first because every later artifact traces back to them: the Week 2 requirements are transformed from these needs, the Week 3 trade study weighs them, and in Week 8 the same IDs become elements of your SysML v2 model. A stakeholder missed now is a need missed later.',
)

/** Proposed objectives from the lecture outline (§1), pending faculty approval (outline open item 3). */
export const PROPOSED_OBJECTIVES: { id: string; text: string; bloom: string }[] = [
  { id: 'B1.6', text: 'Place stakeholder needs work in the life cycle and in the ISO/IEC/IEEE 15288 technical processes, and explain why the integrated set of needs is the validation reference that requirements are transformed from', bloom: 'Understand / Analyze' },
  { id: 'B1.7', text: 'Select elicitation techniques for a stakeholder, and evaluate a set of needs for coverage, conflict and priority', bloom: 'Evaluate' },
]

const sessions = lecturesOfWeek(1)
const s1 = sessions.find((l) => l.session === 1)
const s2 = sessions.find((l) => l.session === 2)
const s2Lab = s2?.sections.find((s) => s.id === 's2-lab')
const s2LabMinutes = s2Lab ? s2Lab.slides.reduce((a, s) => a + s.minutes, 0) : 22
const labSlideMinutes = (id: string, fallback: number) => s2Lab?.slides.find((s) => s.id === id)?.minutes ?? fallback
/** The in-class lab minutes, read from the Session 2 slides (sign-off M4): the lab page and its Markdown use these. */
export const S2_LAB = {
  total: s2LabMinutes,
  brief: labSlideMinutes('s2-lab-brief', 2),
  charter: labSlideMinutes('s2-lab-charter', 8),
  pitch: labSlideMinutes('s2-lab-pitch', 10),
  close: labSlideMinutes('s2-lab-close', 2),
  /** Teams pitched in class; the rest submit the pitch card on the LMS and are decided within 48 hours (S2-20). */
  pitchTeams: 5,
}
const s2LectureMinutes = s2 ? lectureMinutes(s2) - s2LabMinutes : 47

/** "How this week runs": the four phases, in order. */
export const TIMELINE: { id: string; when: string; what: string; detail: NewText }[] = [
  {
    id: 'session1',
    when: 'Session 1 · 75 min',
    what: 'Lecture: systems, teams and stakeholders',
    detail: n(`${s1 ? allSlides(s1).length : 28} slides, all lecture: what a system, a system of interest, an enterprise and a context are; the life cycle and the 15288 process frame; how an engineering team is organized; and three methods for finding every stakeholder. Ends with the preparation for Session 2: each member brings one candidate enterprise.`),
  },
  {
    id: 'session2',
    when: 'Session 2 · 75 min',
    what: 'Lecture, then the Lab L1 launch',
    detail: n(`About ${s2LectureMinutes} min of lecture on concerns, needs and the AeroLink worked example, then about ${s2LabMinutes} min of laboratory launch in class: the team forms and writes its charter, and pitches its enterprise to the instructor for approval.`),
  },
  {
    id: 'lab',
    when: 'Out of class · 7 days',
    what: 'Lab L1: the Week 1 Team Record',
    detail: n('Your team completes the record for its own enterprise: proposal, context, stakeholder register and relationships, at least eight needs, the coverage audit and the AI usage statement. Read the detailed lesson and the required pages alongside, and work through the worked examples before you write your own needs.'),
  },
  {
    id: 'assessment',
    when: 'Before Week 2, Session 1',
    what: 'Assessment and submission',
    detail: n('Take readiness quiz Q1 (individual, formative), check that the Team Record is ready, and upload it with the model-inputs file. Graduate students also hand in the individual needs review.'),
  },
]

/** Required readings: the Week 1 register pages (course.ts), with page counts. */
export const READING_RATE_PAGES_PER_HOUR = 15
export const pageCount = (c: Citation): number => {
  const r = getReading(c.reading)
  if (!c.pages) return r.lastPage - r.firstPage + 1
  const [a, b] = c.pages.split(/[–-]/).map((x) => parseInt(x.trim(), 10))
  return Number.isNaN(b) || b === undefined ? 1 : b - a + 1
}
export const REQUIRED_READINGS = W1.readings.map((c) => ({ citation: c, reading: getReading(c.reading), pages: pageCount(c) }))
export const REQUIRED_PAGES = REQUIRED_READINGS.reduce((a, r) => a + r.pages, 0)
export const READINGS_NOTE = n('Read them after Session 1 and before you write needs. The lesson and the slides cite further pages; those are optional unless the lesson says otherwise.')

/** Deliverables with their due points (the record's contents are on the Laboratory page). */
export const DELIVERABLES: { id: string; what: string; who: string; due: string; where: string }[] = [
  { id: 'candidate', what: 'One candidate enterprise for the Session 2 pitch', who: 'Each member', due: 'Start of Session 2', where: 'Brought to class (not uploaded)' },
  { id: 'charter', what: 'Team charter and the enterprise pitch decision', who: 'Team', due: 'End of Session 2', where: 'Recorded in the lab tool; the decision is the instructor’s' },
  { id: 'record', what: 'Week 1 Team Record (.md) and model inputs (.json)', who: 'Team, one upload', due: week01.assignment.due, where: 'LMS assignment “Week 1 Team Record”' },
  { id: 'quiz', what: 'Readiness quiz Q1', who: 'Individual', due: week01.assignment.due, where: 'Assessment page (formative)' },
  { id: 'grad', what: 'Graduate needs review (at most 250 words)', who: 'Individual', due: week01.assignment.due, where: 'LMS assignment “Week 1 graduate needs review”' },
]

/** The entry cards of the week page, in path order. */
export const ENTRY_TEXT = {
  lecture: n('The two 75-minute lectures as the instructor presents them: the slide viewer with keyboard navigation and a print handout. Download the PowerPoint deck to annotate offline.'),
  lesson: n('The long-form lesson: every slide’s explanation in full, with the figures, the definitions and their sources. Optional “check your understanding” questions close the main sections.'),
  examples: n('The AeroLink case worked step by step: the register, concern to need in six steps, the corrected reference needs and the coverage audit. The interactive AeroLink exercises are here as optional practice.'),
  lab: n('Full instructions for Lab L1: purpose, inputs, method, procedure, expected outputs, rubric rows and submission, with the Team enterprise view as the lab tool.'),
  assessment: n('Readiness quiz Q1, kept separate from the lecture, and the Team Record submission readiness: not ready, submitted for approval, or ready.'),
}

// ------------------------------------------------------------------------------------------- workload
/** Study pace for the detailed lesson: careful reading of technical prose, after the lecture has introduced it. */
export const LESSON_WPM = 150
/** Words a student reads in the detailed lesson (paragraphs, lists, tables, steps, callouts; not figure captions). */
export function lessonWords(): number {
  let words = 0
  for (const { section } of weekLesson(1))
    for (const b of section.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') words += wordCount(b.text)
      else if (b.kind !== 'figure' && b.kind !== 'slide-ref') words += blockText(b).reduce((a, t) => a + wordCount(t), 0)
    }
  return words
}
const missionMinutes = (id: string) => week1Missions.missions.find((m) => m.id === id)!.minutes
const row = (prefix: string) => {
  const r = week01.workload.find((w) => w.activity.startsWith(prefix))
  if (!r) throw new Error(`Week 1 workload has no row starting “${prefix}”`)
  return r
}
const round1 = (x: number) => Math.round(x * 10) / 10

/** The computed values each stated workload row must match (learn/week01.test.ts asserts it). */
export const WORKLOAD = (() => {
  const words = lessonWords()
  return {
    classHours: (2 * 75) / 60,
    lessonWords: words,
    lessonHours: round1(words / LESSON_WPM / 60),
    readingPages: REQUIRED_PAGES,
    readingHours: round1(REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR),
    teamHours: missionMinutes('w1-m5-team') / 60,
    quizHours: round1(missionMinutes('w1-m6-recall') / 60),
    // week1-m5 (review M5-15): Guided Practice's six tasks (optional, not counted in the total, A26)
    practiceHours: round1(PRACTICE_MINUTES_TOTAL / 60),
    total: workloadTotal(week01.workload),
    budget: WORKLOAD_TARGET[1],
  }
})()

/** The Team Record out of class in person-hours for a team of four (sign-off Mo4: one story for §10, the S2-18 notes and
 *  the lab). The sum divided by four is the stated Team Record row (WORKLOAD.teamHours); learn/week01.test.ts checks it. */
export const TEAM_RECORD_PERSON_HOURS: { task: string; hours: number }[] = [
  { task: 'proposal (problem statement, mission and goals, system of interest, parts inside the boundary)', hours: 0.5 },
  { task: 'context', hours: 1.0 },
  { task: 'stakeholder sweep and merge', hours: 2.0 },
  { task: 'register and relationships', hours: 2.5 },
  { task: 'needs', hours: 2.5 },
  { task: 'self-check, coverage audit and AI statement', hours: 1.0 },
  { task: 'integration review and export', hours: 0.5 },
]
export const TEAM_RECORD_TEAM_HOURS = round1(TEAM_RECORD_PERSON_HOURS.reduce((a, t) => a + t.hours, 0))
/** A three-person team: the same work, with the reduced needs minimum (labBrief.ts LAB_MINIMUMS_THREE: six needs instead
 *  of eight, pending faculty approval) shrinking the needs task in proportion; shared by three. Over the budget: flagged. */
export const THREE_PERSON = (() => {
  const needs = TEAM_RECORD_PERSON_HOURS.find((t) => t.task === 'needs')!.hours
  const teamHours = round1(TEAM_RECORD_TEAM_HOURS - needs * (1 - 6 / 8))
  const each = round1(teamHours / 3)
  const week = round1(workloadTotal(week01.workload) - TEAM_RECORD_TEAM_HOURS / 4 + each)
  return { teamHours, each, week, over: round1(week - WORKLOAD_TARGET[1]) }
})()

/** The stated rows, by role, so the page and the test read the same rows. */
export const WORKLOAD_ROWS = {
  class: row('In-class sessions'),
  lesson: row('Detailed lesson'),
  readings: row('Readings'),
  candidate: row('Candidate enterprise'),
  team: row('Team Record out of class'),
  quiz: row('Readiness quiz Q1'),
  grad: row('Graduate needs review'),
  log: row('Time log'),
  practice: row('Optional practice'),
}

export const WORKLOAD_SUMMARY = n(
  `Hours per student, from the lecture-first path: the two class sessions, the detailed lesson (${WORKLOAD.lessonWords.toLocaleString('en-US')} words at about ${LESSON_WPM} words a minute), the ${WORKLOAD.readingPages} required pages, your share of the Team Record, the quiz, the graduate review and the time log. Total ${WORKLOAD.total.toFixed(1)} h against the ${WORKLOAD.budget} h budget${WORKLOAD.total <= WORKLOAD.budget ? `, ${(WORKLOAD.budget - WORKLOAD.total).toFixed(1)} h under` : `, ${(WORKLOAD.total - WORKLOAD.budget).toFixed(1)} h over`}. Guided Practice on AeroLink (about ${WORKLOAD.practiceHours.toFixed(1)} h) is optional and not counted. Log your actual hours so the estimate can be tested.`,
)
