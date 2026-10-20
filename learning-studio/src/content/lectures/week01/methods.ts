// Why each Week 1 method is done, and what it feeds downstream (faculty final review, DECISION_LOG A21 item 4). One
// source for the Session 2 summary slide (s2-why-methods), its figure (LectureWeek1S2.tsx MethodsWhyFigure), the
// "say why" line in the faculty notes of each method's slide, and the lesson table. The "why" column paraphrases the
// cited source; the "feeds" column is course design (what Week 2 and the Week 8 model import read from the Team Record:
// src/content/learn/week01.ts MODEL_INPUTS; docs/lectures/week02/WEEK02_LECTURE_OUTLINE.md). Pure data.
import type { Citation } from '../../readings'

export type Week1Method = {
  id: string
  /** The method, as the slides name it. */
  method: string
  /** The slide that teaches it (session 1 or 2). */
  slide: string
  /** Short forms for the figure (a few words each). */
  whyShort: string
  feedsShort: string
  /** One sentence a professor can say aloud: why we do it, and what it feeds. */
  say: string
  cite?: Citation
}

export const WEEK1_METHODS: Week1Method[] = [
  {
    id: 'proposal',
    method: 'Enterprise proposal',
    slide: 's1-course-architecture',
    whyShort: 'fixes the scope for all 14 weeks',
    feedsShort: 'W2 ConOps boundary; W8 ENT and PRT parts',
    say: 'We propose the enterprise and its system of interest first because every later artifact describes that one system: Week 2 writes its ConOps inside this boundary, and in Week 8 the enterprise and the elements inside the boundary become part definitions and parts of the model.',
  },
  {
    id: 'mission',
    method: 'Problem, mission, goals',
    slide: 's1-bma-feeds-snd',
    whyShort: 'every need traces to a purpose',
    feedsShort: 'W2 ConOps and requirement rationale; W8 model',
    say: 'We state the problem, the mission and the goals because SEBoK expects the set of needs to reflect them, so every need can be traced to a purpose; Week 2 builds its ConOps and requirement rationales on them, and Week 8 records them in the model.',
    cite: { reading: 'R11', pages: '554' },
  },
  {
    id: 'charter',
    method: 'Team charter',
    slide: 's1-team-charter',
    whyShort: 'decide without deadlock; one owner per ID',
    feedsShort: 'stable IDs for every later trace',
    say: 'We write a charter because SEBoK says the team should have one, and because a tie-break rule and one owner per ID prefix keep the identifiers stable: every Week 2 trace and every Week 8 model element points back to them.',
    cite: { reading: 'R96', pages: '986' },
  },
  {
    id: 'identification',
    method: 'Stakeholder identification',
    slide: 's1-lifecycle-sweep',
    whyShort: 'a missed stakeholder means missed needs',
    feedsShort: 'W2 scenario actors; W8 stakeholder parts',
    say: 'We identify stakeholders by three methods because leaving one out often means missing needs and failing validation; the register becomes the actors of the Week 2 scenarios and the stakeholder parts of the Week 8 model.',
    cite: { reading: 'R11', pages: '552' },
  },
  {
    id: 'classification',
    method: 'Classification and salience',
    slide: 's1-classifying',
    whyShort: 'engage first those who can stop the system',
    feedsShort: 'elicitation order; W8 model inputs',
    say: 'We classify stakeholders, with a reason for every rating, so that we engage first the approving authorities and high influencers who can stop or reshape the system; the ratings set the elicitation order and are carried with each stakeholder in the model inputs that Week 8 imports.',
    cite: { reading: 'R63', pages: '236–237' },
  },
  {
    id: 'elicitation',
    method: 'Needs elicitation',
    slide: 's2-elicitation',
    whyShort: 'find the real need behind a stated solution',
    feedsShort: 'rationale and priority for W2 requirements',
    say: 'We elicit with a chosen technique and ask why, because rationale often reveals the real need behind a stated solution; the rationale and the priority recorded now become attributes of the Week 2 requirements.',
    cite: { reading: 'R11', pages: '553' },
  },
  {
    id: 'statements',
    method: 'Need statements',
    slide: 's2-well-formed',
    whyShort: 'the reference the system is validated against',
    feedsShort: 'W2 requirements by NEED ID; W8 requirement defs',
    say: 'We write each need as a well-formed statement because the set of needs is what the requirements, the design and the system are validated against; Week 2 transforms each need into requirements traced by its NEED ID, and Week 8 models it as a requirement definition.',
    cite: { reading: 'R11', pages: '555' },
  },
]

export const week1Method = (id: string): Week1Method => {
  const m = WEEK1_METHODS.find((x) => x.id === id)
  if (!m) throw new Error(`unknown Week 1 method ${id}`)
  return m
}
/** The line the faculty notes of a method's slide open their "say why" with. */
export const sayWhy = (id: string) => `Say why, and what it feeds: ${week1Method(id).say}`
