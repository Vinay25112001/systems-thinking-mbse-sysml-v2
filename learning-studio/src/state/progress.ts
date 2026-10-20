// Progress is computed from recorded activity, never estimated. Weeks without authored content have no trackable
// activities; they report 0 of 0 and are excluded from percentages. Weeks being rebuilt under the authoritative schedule
// (DECISION_LOG A19) have no live module, so their earlier draft material never counts toward a current week.
import { BOUNDARY_ITEMS } from '../content/week1'
import { weekContent } from '../content/weeks'
import type { QuizRecord } from './AppState'

export type WeekProgress = { week: number; done: number; total: number; parts: { label: string; done: number; total: number }[] }

export function weekProgress(n: number, completed: Record<string, boolean>, quiz: Record<string, QuizRecord>, boundary: Record<string, string>): WeekProgress {
  const c = weekContent(n)
  if (!c) return { week: n, done: 0, total: 0, parts: [] }
  const parts = [
    { label: 'Lesson sections completed', done: c.blocks.filter((b) => completed[b.id]).length, total: c.blocks.length },
    { label: 'Knowledge-check questions answered correctly', done: c.quiz.filter((q) => quiz[q.id]?.correct).length, total: c.quiz.length },
  ]
  if (n === 1) parts.push({ label: 'Boundary exercise items classified correctly', done: BOUNDARY_ITEMS.filter((i) => boundary[i.id] === i.answer).length, total: BOUNDARY_ITEMS.length })
  return { week: n, done: parts.reduce((a, p) => a + p.done, 0), total: parts.reduce((a, p) => a + p.total, 0), parts }
}

/** Kept for milestone-1 callers. */
export function week1Progress(completed: Record<string, boolean>, quiz: Record<string, QuizRecord>, boundary: Record<string, string>): WeekProgress {
  return weekProgress(1, completed, quiz, boundary)
}

export function fraction(p: { done: number; total: number }): number {
  return p.total === 0 ? 0 : p.done / p.total
}
