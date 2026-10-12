// Course welcome ("where this subject starts"; docs/redesign/WEEK1_LEARNING_DESIGN.md §3). Every text item is NEW and
// carries `review: 'new-pending-review'`. Claims are limited to: the reviewed SE quotation (w1-se, R01 p.52); SEBoK's
// MBSE description, paraphrased with a register citation (R28 p.370, read 2026-10-12); the course's own framing from
// the syllabus (§1 academic purpose, §2 population and prerequisites, §7 schedule, §9 sessions), labelled as course
// framing; and course.ts data.

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
      { text: 'SEBoK describes model-based systems engineering (MBSE) as a paradigm that uses formalised representations of systems, called models, to support systems-engineering tasks throughout a system’s life cycle, in contrast with approaches that keep system information in many separate documents. The system model can serve as a “single source of truth” about the system of interest.', cite: { reading: 'R28', pages: '370' } },
    ],
  },
  {
    id: 'start',
    title: 'Where it starts, and what you need',
    review: PENDING,
    paras: [
      { text: 'The course starts from systems thinking, not from notation: a SysML v2 model is only as good as the boundary, structure and reasoning behind it. You read SysML v2 from Week 5 and model in it from Week 9.', label: 'course framing' },
      { text: 'No prior systems-engineering, SysML or MBSE coursework and no programming are assumed. You need college algebra, introductory probability and spreadsheet use.', label: 'course framing' },
    ],
  },
  {
    id: 'why',
    title: 'Why engineers need it',
    review: PENDING,
    paras: [
      { text: 'The course aims at engineering judgement more than tool skill. You should be able to explain why a model is structured as it is, what evidence supports each decision, and what would change if an assumption failed.', label: 'course framing' },
    ],
  },
  {
    id: 'case',
    title: 'The AeroLink case',
    review: PENDING,
    paras: [
      { text: 'AeroLink Urban Mobility is a FICTIONAL urban air-taxi operator. Working in teams, you carry this one enterprise through the whole term: from an ambiguous problem, through stakeholders, needs, requirements, risks and trade studies, to a SysML v2 model you use to trace, verify and analyse change.', label: 'course framing' },
    ],
  },
  {
    id: 'map',
    title: 'The 14-week map',
    review: PENDING,
    paras: [
      { text: 'Part I builds the reasoning of a systems engineer; Part II turns that work into a SysML v2 model. Five team checkpoints and two exams mark the way.', label: 'course framing' },
    ],
  },
  {
    id: 'week',
    title: 'How a week works',
    review: PENDING,
    paras: [
      { text: 'Each week has two live sessions: a concept studio and a lab, 75 minutes each. Online, you work through four stages. Section checks are ungraded practice; the readiness quiz, the lab record and the written assignment are where you receive feedback on your work.', label: 'course framing' },
    ],
  },
]

/** The four stages of a week (one line each). */
export const WEEK_STAGES = [
  { id: 'overview', label: 'Overview', line: 'The question, a prediction, what you will be able to do and how you will be assessed.' },
  { id: 'learn', label: 'Learn', line: 'Short sections, one idea and one figure each, every one ending in a check.' },
  { id: 'practice', label: 'Practice', line: 'Missions in the AeroLink workbench: try, worked, guided, then your own.' },
  { id: 'check', label: 'Check & submit', line: 'The readiness quiz, the lab record and the written assignment.' },
] as const
export const WEEK_STAGES_REVIEW: NewReview = PENDING

export const WELCOME_LEDE = { text: 'One semester, one continuous engineering case. This page says what the subject is, why it matters, and how the course is organised. It takes about five minutes.', review: PENDING }

/** Figure on the welcome page; the week list itself comes from course.ts. */
export const TIMELINE_FIGURE = {
  id: 'course-timeline',
  title: 'The 14-week map',
  caption: { text: 'Part I, Weeks 1–7, then Part II, Weeks 8–14. Checkpoints CP1–CP5 and the two exams are marked; Week 1 is highlighted.', review: PENDING },
  alt: 'Two rows of week cards: Part I, weeks 1 to 7, and Part II, weeks 8 to 14, with checkpoint and exam markers.',
  review: PENDING,
}

/** Practice-plan lede (Practice stage, first visit). */
export const PRACTICE_LEDE = { text: 'Six missions, from a try-first run of the dynamics explorer to your own L1 lab record. The mission brief on the left guides each step; the centre shows the view the step needs.', review: PENDING }
