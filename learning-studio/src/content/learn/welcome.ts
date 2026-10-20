// Course welcome ("where this subject starts"; docs/redesign/WEEK1_LEARNING_DESIGN.md §3). Every text item is NEW and
// carries `review: 'new-pending-review'`. Claims are limited to: the reviewed SE quotation (w1-se, R01 p.52); SEBoK's
// MBSE description, paraphrased with a register citation (R28 p.370, read 2026-10-12); the course's own framing from
// the syllabus (§1 academic purpose, §2 population and prerequisites, §9 sessions) and the authoritative schedule
// (COURSE_SCHEDULE.md, DECISION_LOG A19), labeled as course framing; and course.ts data.

import type { Citation } from '../readings'
import { PENDING, type NewReview } from './types'

export type WelcomeBlock = { id: string; title: string; paras: { text: string; label?: 'course framing'; cite?: Citation }[]; review: NewReview }

export const WELCOME: WelcomeBlock[] = [
  {
    id: 'what',
    title: 'What this subject is',
    review: PENDING,
    paras: [
      { text: 'Systems thinking, as this course uses the term, is the habit of seeing a problem as interacting parts, boundaries and feedback rather than as a list of components.', label: 'course framing' },
      { text: 'Systems engineering is the discipline that puts that habit to work on engineered systems. The definition SEBoK quotes is below.', label: 'course framing' },
      { text: 'SEBoK describes model-based systems engineering (MBSE) as a paradigm that uses formalized representations of systems, called models, to support systems-engineering tasks throughout a system’s life cycle, in contrast with approaches that keep system information in many separate documents. The system model can serve as a “single source of truth” about the system of interest.', cite: { reading: 'R28', pages: '370' } },
    ],
  },
  {
    id: 'start',
    title: 'Where it starts, and what you need',
    review: PENDING,
    paras: [
      { text: 'The course starts from systems thinking, not from notation: a SysML v2 model is only as good as the boundary, structure and reasoning behind it. MBSE and SysML v2 are introduced in Week 8, when Phase II begins and your team starts modeling its own enterprise.', label: 'course framing' },
      { text: 'No prior systems-engineering, SysML or MBSE coursework and no programming are assumed. You need college algebra, introductory probability and spreadsheet use.', label: 'course framing' },
    ],
  },
  {
    id: 'why',
    title: 'Why engineers need it',
    review: PENDING,
    paras: [
      { text: 'The course aims at engineering judgment more than tool skill. You should be able to explain why a model is structured as it is, what evidence supports each decision, and what would change if an assumption failed.', label: 'course framing' },
    ],
  },
  {
    id: 'case',
    title: 'The AeroLink case',
    review: PENDING,
    paras: [
      { text: 'AeroLink Urban Mobility, a FICTIONAL urban air-taxi operator, is the instructor’s reference case. It is the worked example throughout the course: every lecture demonstrates its method on AeroLink, and each week’s worked examples set that demonstration out step by step, with optional exercises to rehearse it.', label: 'course framing' },
      { text: 'Each team develops and models its own enterprise, in any domain. Your team proposes it in Week 1 and the instructor approves it; from then on your team carries that enterprise through the whole term: from an ambiguous problem, through stakeholders, needs, requirements, risks and trade studies, to a SysML v2 model you use to trace, verify and analyze change.', label: 'course framing' },
    ],
  },
  {
    id: 'map',
    title: 'The 14-week map',
    review: PENDING,
    paras: [
      { text: 'Phase I, Systems Thinking (Weeks 1–7), builds your team’s Systems Thinking Engineering Package, presented in Week 7. Phase II, MBSE with SysML v2 (Weeks 8–14), turns that package into a coherent SysML v2 enterprise model, presented in Week 14. Each Phase II week models an artifact you produced in Phase I.', label: 'course framing' },
    ],
  },
  {
    id: 'week',
    title: 'How to use this site',
    review: PENDING,
    paras: [
      { text: 'This is a lecture-first course: each week has two 75-minute sessions taught by the instructor, and this site follows the same order. Open the week page from the dashboard, then work through its sections with the week bar at the top of every page: the lecture slides, the detailed lesson, the worked examples, the engineering laboratory, and the assessment and submission. Week 1 is built this way; later weeks will follow it as they are rebuilt. Your work is saved in this browser.', label: 'course framing' },
      { text: 'The lesson’s “check your understanding” questions and the worked examples’ “try it yourself” exercises are optional and ungraded. The laboratory record and the readiness quiz are where you receive feedback on your work; nothing on the site locks the laboratory behind a quiz.', label: 'course framing' },
    ],
  },
]

/** The sections of a week on the lecture-first path (one line each), with the mini-figure that illustrates each. */
export const WEEK_STAGES = [
  { id: 'overview', figure: 'overview', label: 'Week overview', line: 'Start here each week: the subject, the objectives, how the two sessions and the lab run, the required readings, what is due when, and the workload.' },
  { id: 'lecture', figure: 'lecture', label: 'Lecture slides', line: 'The instructor’s slides for both sessions, to follow in class and review after it, with a printable handout and the PowerPoint deck.' },
  { id: 'lesson', figure: 'learn', label: 'Detailed lesson', line: 'The full explanation behind every slide, with figures, definitions and their sources; optional self-checks close the main sections.' },
  { id: 'examples', figure: 'examples', label: 'Worked examples', line: 'The method worked step by step on AeroLink, the instructor’s case, with optional “try it yourself” exercises.' },
  { id: 'lab', figure: 'practice', label: 'Engineering laboratory', line: 'Your team applies the method to its own enterprise: full instructions, the rubric, and the lab tool that checks and exports your record.' },
  { id: 'assessment', figure: 'check', label: 'Assessment and submission', line: 'The readiness quiz, where you stand on each objective, and whether your team’s record is ready to submit.' },
] as const
export const WEEK_STAGES_REVIEW: NewReview = PENDING

export const WELCOME_LEDE = { text: 'One semester, one reference case worked by the instructor, and one enterprise your team models from start to finish. This page says what the subject is, why it matters, how the course is organized and how to use this site. Read it top to bottom; it takes about five minutes.', review: PENDING }

/** Figure on the welcome page; the week list itself comes from course.ts. */
export const TIMELINE_FIGURE = {
  id: 'course-timeline',
  title: 'The 14-week map',
  caption: { text: 'Phase I, Weeks 1–7, then Phase II, Weeks 8–14. The two team outputs are marked: the Systems Thinking Engineering Package in Week 7 and the SysML v2 enterprise model in Week 14. Week 1 is highlighted.', review: PENDING },
  alt: 'Two rows of week cards: Phase I, weeks 1 to 7, and Phase II, weeks 8 to 14, each card naming its subject; weeks 7 and 14 are marked with their team outputs.',
  review: PENDING,
}

/** Practice-plan lede (Practice stage, first visit). */
export const PRACTICE_LEDE = { text: 'Six missions: four short AeroLink rehearsals (who is missing, a boundary, stakeholder classification, needs), then your team’s own Week 1 Team Record, then the knowledge check. The mission brief on the left guides each step; the center shows the view the step needs.', review: PENDING }
