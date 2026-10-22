// The Week 7 assessment notes (#/week/7/assessment), kept apart from the page component (fast refresh). Week 7 is an
// engineering review week (DECISION_LOG A21 decision 7): the design review is the assessment, so there is no readiness quiz
// (the schedule default, course.ts FACULTY_DECISIONS), and the old Exam 1, which the earlier plan placed in Week 7, is an
// open faculty decision this page names and does not resolve. The rubric, the RID form and the graduate criteria are single-
// sourced in src/content/lab/week07Lab.ts. assessmentParts.test.ts checks these notes and the rubric's shape.
import { PRESENTATION_RUBRIC } from '../content/lab/week07Lab'

export const NO_QUIZ_NOTE =
  'No readiness quiz this week. Week 7 is an engineering review: the package, the briefing, your answers in the review and your findings on another team’s package are the assessment, each judged against the rubric below. A quiz added after the review would test what the review already shows.'
export const EXAM_NOTE = 'Where the course’s examinations fall is an open faculty decision: the earlier plan placed the first exam in Week 7, which is now the review week.'
export const RID_FORM_FILE = 'week7-rid-form.md'
export const TEAM_CRITERIA = PRESENTATION_RUBRIC.filter((x) => x.scope === 'team')
export const INDIVIDUAL_CRITERIA = PRESENTATION_RUBRIC.filter((x) => x.scope === 'individual')
export const GRADUATE_CRITERIA = PRESENTATION_RUBRIC.filter((x) => x.scope === 'graduate')
