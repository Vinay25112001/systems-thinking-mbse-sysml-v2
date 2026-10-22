// Course homepage content (spec §a, content items `course.intro.*`, M4 part A). ADAPTED from the course welcome
// (learn/welcome.ts) per the spec's source line; every claim is either cited (footnote: author/source, title, page) or
// labeled course framing (HP-01). Stale text removed (HP-02): no "lecture-first course", no lecture-slide stage, no
// "Week 1 is built this way". Grading weights are not stated (FD-04 open). New text: review 'new-pending-review'.
import { MISSION_GOALS } from './lectures/week01/aerolinkCase'
import { PENDING, type NewReview } from './learn/types'
import type { Citation } from './readings'
import { WELCOME } from './learn/welcome'
import { WEEK1_BLOCKS } from './week1'

export type IntroPara = { text: string; label?: 'course framing'; cite?: Citation; quote?: { text: string; cite: Citation; attribution: string } }

const welcome = (block: string, i: number) => {
  const b = WELCOME.find((w) => w.id === block)
  if (!b || !b.paras[i]) throw new Error(`welcome.ts has no ${block} ¶${i}`)
  return b.paras[i]
}
const seQuote = WEEK1_BLOCKS.find((b) => b.id === 'w1-se')!.quote!

export const HOMEPAGE = {
  review: PENDING as NewReview,
  university: 'Wright State University',
  title: 'Systems Thinking and MBSE with SysML v2',
  lede: 'One semester, one reference case worked by the instructor, and one enterprise your team develops from start to finish. Read this page top to bottom; it takes about five minutes.',
  what: [
    { text: welcome('what', 0).text, label: 'course framing' },
    { text: 'Systems engineering puts that habit to work on engineered systems. The definition of the INCOSE Fellows, as SEBoK quotes it:', quote: { text: seQuote.text, cite: seQuote.cite, attribution: 'INCOSE Fellows definition, as quoted in' } },
    { text: welcome('what', 2).text, cite: welcome('what', 2).cite },
  ] as IntroPara[],
  phases: [
    { text: 'In Weeks 1–7 your team builds a Systems Thinking Engineering Package for its enterprise: stakeholders and needs, a concept of operations and requirements, risks and trade studies, architecture, interfaces and a roadmap. In Weeks 8–14 the same team rebuilds that package as a SysML v2 model; each Phase II week models an artifact you produced in Phase I.', label: 'course framing' },
    { text: 'The course starts from systems thinking, not from notation: a model is only as good as the boundary and reasoning behind it.', label: 'course framing' },
  ] as IntroPara[],
  aerolink: [
    'AeroLink Urban Mobility is a fictional urban air-taxi operator, used as the instructor’s worked example.',
    `Its mission (MGO-001): ${MISSION_GOALS[0].name.charAt(0).toLowerCase()}${MISSION_GOALS[0].name.slice(1)}.`,
    'Every method is shown on AeroLink first, so that you see the method worked before you apply it.',
  ],
  enterprise: [
    'Each team proposes its own enterprise in Week 1, the instructor approves it, and the team carries it through all 14 weeks.',
    'Applying a method to a case you chose, where nobody has written the answer, is the skill being taught, so AeroLink, or a near copy of it, is not available as a team enterprise.',
  ],
  submit: [
    { what: 'Week 1 Team Record', detail: 'charter, approved enterprise proposal, context, stakeholder register, initial needs' },
    { what: 'Weekly milestone packages', detail: 'Weeks 2–6' },
    { what: 'Systems Thinking Engineering Package', detail: 'Week 7' },
    { what: 'SysML v2 enterprise model', detail: 'Week 14' },
  ],
  submitNote: 'Each submission is a snapshot of your team’s single project, reviewed by the instructor. Automated checks help you find gaps; the instructor decides.',
  stages: [
    { id: 'overview', label: 'Overview', identity: 'course', line: 'What the week covers, what you will create, time and readings.' },
    { id: 'learn', label: 'Learn', identity: 'course', line: 'The textbook for the week: definitions, sources, methods and AeroLink worked examples.' },
    { id: 'practice', label: 'Guided Practice', identity: 'example', line: 'Apply the method to AeroLink, the instructor’s example, with explained feedback.' },
    { id: 'project', label: 'My Project / Lab', identity: 'project', line: 'Apply it to your team’s own enterprise.' },
    { id: 'review', label: 'Review & Submit', identity: 'course', line: 'Check your work against the criteria and submit it.' },
  ] as { id: string; label: string; identity: 'course' | 'example' | 'project'; line: string }[],
  savedStatic: 'In this edition your work is saved in this browser only: it is not shared with your team and not submitted.',
  start: 'Start Week 1: Team formation, needs and stakeholders',
}
