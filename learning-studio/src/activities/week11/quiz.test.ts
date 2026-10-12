// Drift guards for the Week 11 knowledge check (W11-F01, W11-F08): the key letters stay balanced, the correct option
// is not a length cue, and no correct option repeats an 8-word run of the lesson (AUTHORING_GUIDE §7 rule 6).
import { describe, expect, it } from 'vitest'
import week11 from '../../content/weeks/week11'

const quiz = week11.quiz
const correct = (q: (typeof quiz)[number]) => q.options.find((o) => o.correct)!

describe('Week 11 quiz', () => {
  it('W11-F01: the key letters are spread over a–d (3 or 4 each)', () => {
    const count: Record<string, number> = {}
    for (const q of quiz) count[correct(q).id] = (count[correct(q).id] ?? 0) + 1
    expect(Object.keys(count).sort()).toEqual(['a', 'b', 'c', 'd'])
    for (const n of Object.values(count)) expect(n).toBeGreaterThanOrEqual(3)
    for (const n of Object.values(count)) expect(n).toBeLessThanOrEqual(4)
  })
  it('W11-F01: the correct option is the longest in at most 4 of 15 items and never much longer than the distractors', () => {
    let longest = 0
    for (const q of quiz) {
      const c = correct(q).text.length
      const others = q.options.filter((o) => !o.correct).map((o) => o.text.length)
      if (c > Math.max(...others)) longest++
      expect(c / (others.reduce((a, b) => a + b, 0) / others.length), q.id).toBeLessThan(1.3)
    }
    expect(longest).toBeLessThanOrEqual(4)
  })
  it('W11-F08: no correct option repeats an 8-word run of the lesson text', () => {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9.:'<>=-]+/g, ' ').trim().split(' ')
    const lesson = ` ${week11.blocks.flatMap((b) => [...b.paragraphs, ...(b.bullets ?? [])]).map((p) => norm(p).join(' ')).join(' | ')} `
    for (const q of quiz) {
      const w = norm(correct(q).text)
      for (let i = 0; i + 8 <= w.length; i++) expect(lesson.includes(` ${w.slice(i, i + 8).join(' ')} `), `${q.id}: “${w.slice(i, i + 8).join(' ')}”`).toBe(false)
    }
  })
  it('the Bloom labels are those recorded in the notes (Apply 7, Analyse 3, Evaluate 5)', () => {
    const b: Record<string, number> = {}
    for (const q of quiz) b[q.bloom] = (b[q.bloom] ?? 0) + 1
    expect(b).toEqual({ Apply: 7, Analyse: 3, Evaluate: 5 })
  })
})
