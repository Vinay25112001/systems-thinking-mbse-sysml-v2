// Knowledge checks placed in Learn (spec LRN-03): the reviewed Week 1 items, reused as they are. A Learn check (c1…c7,
// learn/week01.ts) or a quiz item (w1q-n, quizWeek1.ts) is normalized to one shape. Optional and never graded; the slide
// pointers inside quiz explanations are replaced by the textbook's own section (C27).
import { LEARN_SECTIONS } from '../../content/learn/week01'
import { WEEK1_QUIZ } from '../../content/quizWeek1'
import type { Citation } from '../../content/readings'
import { stripSlideRefs, studentText } from './studentText'

export type KCheck = { id: string; prompt: string; options: { id: string; text: string; correct: boolean; feedback: string }[]; cite?: Citation }

/** The student wording of a check (review M4A F1, F3: objectives, no slide pointers or rubric codes). */
export function knowledgeCheck(id: string): KCheck {
  const c = rawCheck(id)
  return { ...c, prompt: studentText(c.prompt), options: c.options.map((o) => ({ ...o, text: studentText(o.text), feedback: studentText(o.feedback) })) }
}

function rawCheck(id: string): KCheck {
  const c = LEARN_SECTIONS.find((s) => s.check.id === id)?.check
  if (c) return { id, prompt: c.prompt, options: c.options, cite: c.cite }
  const q = WEEK1_QUIZ.find((x) => x.id === id)
  if (!q) throw new Error(`Unknown Week 1 check ${id}`)
  return { id, prompt: q.prompt, options: q.options.map((o) => ({ id: o.id, text: o.text, correct: o.correct, feedback: stripSlideRefs(o.explanation) })), cite: q.cite }
}

/** The checks Learn places (12, at most two per chapter); every other item stays in the Review & Submit readiness quiz. */
export const LEARN_CHECK_IDS = ['w1q-3', 'c2', 'w1q-2', 'c3', 'c4', 'w1q-6', 'c5', 'w1q-9', 'c6', 'c7', 'c1', 'w1q-5'] as const
