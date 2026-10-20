// Week 4 readiness quiz Q4: balanced keys, no length cue, every item answerable from the lecture slide and lesson section
// it names, every citation in the verified register, unseen non-AeroLink contexts, and no key copied from the lesson.
// Each cue rule is also shown able to fail on a mutated copy.
import { describe, expect, it } from 'vitest'
import { getLecture } from './lectures'
import { allSlides, blockText } from './lectures/text'
import { citationInRange, getReading } from './readings'
import { WEEK4_QUIZ } from './quizWeek4'
import type { QuizQuestion } from './schema'

const keyOf = (q: QuizQuestion) => q.options.find((o) => o.correct)!
const ranks = (qs: QuizQuestion[]) =>
  qs.map((q) => {
    const k = keyOf(q).text.length
    const others = q.options.filter((o) => !o.correct).map((o) => o.text.length)
    return { id: q.id, rank: 1 + others.filter((x) => x > k).length, tie: others.includes(k) }
  })
/** The option that stands out by length, if any: the unique longest at 1.4 × or more the next longest, or the unique
 *  shortest at 0.7 × or less the next shortest (the rule used for Week 3, quizWeek3.test.ts). */
const outlierOf = (q: QuizQuestion): string | null => {
  const o = [...q.options].sort((a, b) => b.text.length - a.text.length)
  if (o[0].text.length >= 1.4 * o[1].text.length) return o[0].id
  if (o[3].text.length <= 0.7 * o[2].text.length) return o[3].id
  return null
}
/** Expected score of the strategy "pick the length outlier if there is one, otherwise guess". */
const oddOneOutScore = (qs: QuizQuestion[]) => qs.reduce((n, q) => { const o = outlierOf(q); return n + (o ? (o === keyOf(q).id ? 1 : 0) : 0.25) }, 0) / qs.length
/** The option farthest in length from the mean of the other three (the Week 4 reviewer's measure, review Mo6). */
const farthestOf = (q: QuizQuestion) =>
  [...q.options].map((o) => ({ id: o.id, d: Math.abs(o.text.length - q.options.filter((p) => p !== o).reduce((a, p) => a + p.text.length, 0) / 3) })).sort((a, b) => b.d - a.d)[0].id
const words = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
const sharesRun = (a: string, b: string, n = 8) => {
  const wa = words(a)
  const wb = ` ${words(b).join(' ')} `
  for (let i = 0; i + n <= wa.length; i++) if (wb.includes(` ${wa.slice(i, i + n).join(' ')} `)) return true
  return false
}

/** The deciding phrase of each item, as the detailed lesson states it. */
const DECIDING: Record<string, string> = {
  'w4q-1': 'is conceptual and is realized through an architectural description',
  'w4q-2': 'a viewpoint is a specification of the conventions and rules',
  'w4q-3': 'conclude that their objectives will be met',
  'w4q-4': 'Name each function as an action, verb and object, never as an element',
  'w4q-5': 'decomposing too deeply',
  'w4q-6': 'exchange of the same type of flow',
  'w4q-7': 'allocating high-level functions straight onto technologies',
  'w4q-8': 'information is structured data in context that has been analyzed and interpreted',
  'w4q-9': 'If no decision can be named',
  'w4q-10': 'an organizational agreement records duties and carries no flow',
  'w4q-11': 'a human is in the loop to validate the intelligence',
  'w4q-12': 'Architecture decisions are engineering records',
}

describe('Week 4 quiz Q4: structure', () => {
  it('twelve items, one key each, an explanation for every option, unique ids, several Bloom levels', () => {
    expect(WEEK4_QUIZ).toHaveLength(12)
    expect(new Set(WEEK4_QUIZ.map((q) => q.id)).size).toBe(12)
    for (const q of WEEK4_QUIZ) {
      expect(q.options.filter((o) => o.correct), q.id).toHaveLength(1)
      for (const o of q.options) expect(o.explanation.length, `${q.id}/${o.id}`).toBeGreaterThan(20)
      expect(q.review).toBe('new-pending-review')
    }
    expect(new Set(WEEK4_QUIZ.map((q) => q.bloom)).size).toBeGreaterThanOrEqual(4)
  })
  it('covers every Week 4 objective W4.1–W4.6', () => {
    for (const o of ['W4.1', 'W4.2', 'W4.3', 'W4.4', 'W4.5', 'W4.6']) expect(WEEK4_QUIZ.some((q) => q.objective === o), o).toBe(true)
  })
  it('every item cites a verified register page inside its range', () => {
    for (const q of WEEK4_QUIZ) {
      expect(q.cite, q.id).toBeDefined()
      expect(() => getReading(q.cite!.reading)).not.toThrow()
      expect(citationInRange(q.cite!), q.id).toBe(true)
    }
  })
  it('contexts are unseen: no item is about AeroLink', () => {
    for (const q of WEEK4_QUIZ) expect(JSON.stringify([q.prompt, ...q.options.map((o) => o.text)]), q.id).not.toMatch(/aero\s*-?link|vertiport|eVTOL/i)
  })
})

describe('Week 4 quiz Q4: no cues', () => {
  it('keys are spread evenly across a–d (exactly three each)', () => {
    const count: Record<string, number> = {}
    for (const q of WEEK4_QUIZ) count[keyOf(q).id] = (count[keyOf(q).id] ?? 0) + 1
    expect(count).toEqual({ a: 3, b: 3, c: 3, d: 3 })
  })
  it('the key’s length rank varies with no usable pattern: each rank 1–4 exactly three times, no ties with the key, no run of three', () => {
    const r = ranks(WEEK4_QUIZ)
    for (const x of r) expect(x.tie, `${x.id}: a distractor has the key’s length`).toBe(false)
    for (const k of [1, 2, 3, 4]) expect(r.filter((x) => x.rank === k).length, `rank ${k}: ${r.map((x) => x.rank).join(', ')}`).toBe(3)
    for (let i = 2; i < r.length; i++) expect(r[i].rank === r[i - 1].rank && r[i].rank === r[i - 2].rank).toBe(false)
  })
  it('review Mo6: no key is a length outlier (1.4 × / 0.7 ×), and “pick the odd one out by length, else guess” scores no better than chance', () => {
    for (const q of WEEK4_QUIZ) expect(outlierOf(q), `${q.id}: the key stands out by length`).not.toBe(keyOf(q).id)
    expect(oddOneOutScore(WEEK4_QUIZ)).toBeLessThanOrEqual(0.25 + 1e-9)
  })
  it('review Mo6: the option farthest in length from the other three is the key in at most 3 of 12 items (chance level)', () => {
    const hits = WEEK4_QUIZ.filter((q) => farthestOf(q) === keyOf(q).id).map((q) => q.id)
    expect(hits.length, hits.join(', ')).toBeLessThanOrEqual(3)
  })
  it('review Mo6: no throwaway options and no grammar cue in the item the review named (Q4: four noun phrases)', () => {
    const q4 = WEEK4_QUIZ.find((q) => q.id === 'w4q-4')!
    for (const o of q4.options) expect(/^(treat|measure|store|raise|pump|monitor)\b/i.test(o.text), `${o.id}: a verb phrase among noun phrases`).toBe(false)
    const throwaways = ['It uses verbs', 'The cost of the model', 'Wrong: central servers always fail', 'Navigation is not a function because it has no output']
    for (const q of WEEK4_QUIZ) for (const o of q.options) expect(throwaways, `${q.id}/${o.id}`).not.toContain(o.text)
  })
  it('review Mo6: no grammar cue from “and” (the key is never the only option with, or without, it) and no absolute qualifiers in any option', () => {
    const hasAnd = (t: string) => /\band\b/i.test(t)
    for (const q of WEEK4_QUIZ) {
      const k = hasAnd(keyOf(q).text)
      expect(q.options.filter((o) => !o.correct).every((o) => hasAnd(o.text) !== k), `${q.id}: “and” singles out the key`).toBe(false)
      for (const o of q.options) expect(o.text, `${q.id}/${o.id}`).not.toMatch(/\b(always|never|only|none|cannot)\b/i)
    }
  })
  it('negative direction: the pre-review lengths (five keys the farthest by length, the Q6 and Q9 keys clear outliers) are caught', () => {
    const bad = structuredClone(WEEK4_QUIZ)
    const setText = (id: string, opt: string, text: string) => (bad.find((q) => q.id === id)!.options.find((o) => o.id === opt)!.text = text)
    setText('w4q-6', 'a', 'Environment resistance level')
    setText('w4q-6', 'b', 'Ease of handling: the gates are light')
    setText('w4q-6', 'd', 'Execution at a close frequency level')
    setText('w4q-6', 'c', 'Exchange of the same type of flow, here the tag data both functions read and write')
    setText('w4q-9', 'a', 'Bus positions every ten seconds')
    setText('w4q-9', 'c', 'Stored for a year, then deleted')
    setText('w4q-9', 'd', 'Shown on a map')
    setText('w4q-4', 'a', 'Treat raw water to the drinking standard')
    setText('w4q-4', 'b', 'Measure chlorine residual at each outlet')
    setText('w4q-4', 'c', 'Store treated water for peak demand in the evening')
    setText('w4q-4', 'd', 'Pumping station')
    setText('w4q-1', 'b', 'The block diagram on page 12 of the design report')
    setText('w4q-1', 'c', 'The slide deck shown to the board')
    setText('w4q-10', 'a', 'The flow has no carrier yet: an agreement carries no data')
    expect(bad.filter((q) => outlierOf(q) === keyOf(q).id).map((q) => q.id).sort()).toEqual(['w4q-4', 'w4q-6', 'w4q-9'])
    expect(oddOneOutScore(bad)).toBeGreaterThan(0.25 + 1e-9)
    expect(bad.filter((q) => farthestOf(q) === keyOf(q).id).length).toBeGreaterThan(3)
  })
  it('negative direction: a quiz whose keys are all the longest option fails the rank rule', () => {
    const bad = structuredClone(WEEK4_QUIZ)
    for (const q of bad) keyOf(q).text = `${'x'.repeat(200)}`
    expect(ranks(bad).every((x) => x.rank === 1)).toBe(true)
    expect(ranks(bad).filter((x) => x.rank === 1).length).not.toBe(3)
  })
})

describe('Week 4 quiz Q4: answerable from the lecture', () => {
  it('every item names an existing slide and lesson section, the deciding idea is in that section, and any “Session N, slide M” it quotes is that slide', () => {
    expect(Object.keys(DECIDING).sort()).toEqual(WEEK4_QUIZ.map((q) => q.id).sort())
    for (const q of WEEK4_QUIZ) {
      const t = q.lecture!
      expect(t, q.id).toBeDefined()
      expect(t.week).toBe(4)
      const lecture = getLecture(4, t.session)!
      const slides = allSlides(lecture)
      const idx = slides.findIndex((s) => s.id === t.slide)
      expect(idx, `${q.id}: slide ${t.slide}`).toBeGreaterThanOrEqual(0)
      const sec = lecture.studentLesson.find((s) => s.id === t.section)
      expect(sec, `${q.id}: section ${t.section}`).toBeDefined()
      const text = sec!.blocks.flatMap((b) => (b.kind === 'para' || b.kind === 'heading' ? [b.text] : b.kind === 'figure' || b.kind === 'slide-ref' ? [] : blockText(b))).join(' ')
      expect(text, `${q.id}: “${DECIDING[q.id]}” in ${t.section}`).toContain(DECIDING[q.id])
      for (const m of [q.courseSource ?? '', ...q.options.map((o) => o.explanation)].join(' ').matchAll(/Session (\d), slide (\d+)/g))
        if (Number(m[1]) === t.session) expect(Number(m[2]), `${q.id} quotes ${m[0]}; ${t.slide} is slide ${idx + 1}`).toBe(idx + 1)
    }
  })
  it('no key is copied from the lesson (no run of 8 words shared with its section): the student has to apply the idea', () => {
    for (const q of WEEK4_QUIZ) {
      const sec = getLecture(4, q.lecture!.session)!.studentLesson.find((s) => s.id === q.lecture!.section)!
      const text = sec.blocks.flatMap((b) => (b.kind === 'para' || b.kind === 'heading' ? [b.text] : b.kind === 'figure' || b.kind === 'slide-ref' ? [] : blockText(b))).join(' ')
      expect(sharesRun(keyOf(q).text, text), q.id).toBe(false)
    }
  })
  it('no quiz prompt reuses the wording of an in-class question or slide (8-word runs)', () => {
    const slideText = [1, 2].flatMap((s) => allSlides(getLecture(4, s)!).flatMap((x) => [x.title, ...x.body.flatMap(blockText)]))
    for (const q of WEEK4_QUIZ) for (const t of slideText) expect(sharesRun(q.prompt, t), `${q.id} ↔ ${t.slice(0, 40)}`).toBe(false)
  })
})

describe('Week 4 quiz Q4: the other checks can fail (negative direction)', () => {
  it('an unbalanced key set, a copied key, a missing deciding phrase and an AeroLink context are each detected', () => {
    const bad = structuredClone(WEEK4_QUIZ)
    for (const q of bad) for (const o of q.options) o.correct = o.id === 'a'
    const count: Record<string, number> = {}
    for (const q of bad) count[keyOf(q).id] = (count[keyOf(q).id] ?? 0) + 1
    expect(count).not.toEqual({ a: 3, b: 3, c: 3, d: 3 })
    expect(sharesRun('the architecture of a system of interest is conceptual and realized', 'The architecture of a system of interest is conceptual and realized through a description')).toBe(true)
    const sec = getLecture(4, 1)!.studentLesson.find((s) => s.id === 'w4-lesson-why')!
    const text = sec.blocks.flatMap((b) => (b.kind === 'para' || b.kind === 'heading' ? [b.text] : [])).join(' ')
    expect(text).not.toContain('viewpoints are normalized by the median')
    expect('A vertiport operator asks').toMatch(/aero\s*-?link|vertiport|eVTOL/i)
  })
})
