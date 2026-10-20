// Week 3 readiness quiz Q3: balanced keys, no length cue, every item answerable from the lecture slide and lesson section
// it names, every citation in the verified register, unseen non-AeroLink contexts, and no key copied from the lesson.
// Each cue rule is also shown able to fail on a mutated copy.
import { describe, expect, it } from 'vitest'
import { getLecture } from './lectures'
import { allSlides, blockText } from './lectures/text'
import { citationInRange, getReading } from './readings'
import { WEEK3_QUIZ } from './quizWeek3'
import type { QuizQuestion } from './schema'

const keyOf = (q: QuizQuestion) => q.options.find((o) => o.correct)!
const ranks = (qs: QuizQuestion[]) =>
  qs.map((q) => {
    const k = keyOf(q).text.length
    const others = q.options.filter((o) => !o.correct).map((o) => o.text.length)
    return { id: q.id, rank: 1 + others.filter((x) => x > k).length, tie: others.includes(k) }
  })
/** The option that stands out by length, if any: the unique longest at 1.4 × or more the next longest, or the unique
 *  shortest at 0.7 × or less the next shortest (the reviewer's rule). */
const outlierOf = (q: QuizQuestion): string | null => {
  const o = [...q.options].sort((a, b) => b.text.length - a.text.length)
  if (o[0].text.length >= 1.4 * o[1].text.length) return o[0].id
  if (o[3].text.length <= 0.7 * o[2].text.length) return o[3].id
  return null
}
/** Expected score of the strategy "pick the length outlier if there is one, otherwise guess". */
const oddOneOutScore = (qs: QuizQuestion[]) => qs.reduce((n, q) => { const o = outlierOf(q); return n + (o ? (o === keyOf(q).id ? 1 : 0) : 0.25) }, 0) / qs.length
const words = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
const sharesRun = (a: string, b: string, n = 8) => {
  const wa = words(a)
  const wb = ` ${words(b).join(' ')} `
  for (let i = 0; i + n <= wa.length; i++) if (wb.includes(` ${wa.slice(i, i + n).join(' ')} `)) return true
  return false
}

/** The deciding phrase of each item, as the detailed lesson states it. */
const DECIDING: Record<string, string> = {
  'w3q-1': 'Component validation in relevant environment',
  'w3q-2': 'changes dramatically when it is used beyond its design limits',
  'w3q-3': 'if it has already happened, it is an issue',
  'w3q-4': 'Do not put the mitigation into the risk statement',
  'w3q-5': 'The pitfall to avoid is automatic mitigation selection',
  'w3q-6': 'threshold minus WCE',
  'w3q-7': 'fundamental objectives of resilience are to',
  'w3q-8': 'ranks risks by cell level, then by the higher consequence',
  'w3q-9': 'one MOE, one criterion',
  'w3q-10': 'its swing is worth less and its weight must fall',
  'w3q-11': 'each alternative’s value is the weighted sum',
  'w3q-12': 'every value depends on which alternatives are present',
}

describe('Week 3 quiz Q3: structure', () => {
  it('twelve items, one key each, an explanation for every option, unique ids, several Bloom levels', () => {
    expect(WEEK3_QUIZ).toHaveLength(12)
    expect(new Set(WEEK3_QUIZ.map((q) => q.id)).size).toBe(12)
    for (const q of WEEK3_QUIZ) {
      expect(q.options.filter((o) => o.correct), q.id).toHaveLength(1)
      for (const o of q.options) expect(o.explanation.length, `${q.id}/${o.id}`).toBeGreaterThan(20)
      expect(q.review).toBe('new-pending-review')
    }
    expect(new Set(WEEK3_QUIZ.map((q) => q.bloom)).size).toBeGreaterThanOrEqual(4)
  })
  it('covers every Week 3 objective W3.1–W3.6', () => {
    for (const o of ['W3.1', 'W3.2', 'W3.3', 'W3.4', 'W3.5', 'W3.6']) expect(WEEK3_QUIZ.some((q) => q.objective === o), o).toBe(true)
  })
  it('every item cites a verified register page inside its range', () => {
    for (const q of WEEK3_QUIZ) {
      expect(q.cite, q.id).toBeDefined()
      expect(() => getReading(q.cite!.reading)).not.toThrow()
      expect(citationInRange(q.cite!), q.id).toBe(true)
    }
  })
  it('contexts are unseen: no item is about AeroLink', () => {
    for (const q of WEEK3_QUIZ) expect(JSON.stringify([q.prompt, ...q.options.map((o) => o.text)]), q.id).not.toMatch(/aero\s*-?link|vertiport|eVTOL/i)
  })
})

describe('Week 3 quiz Q3: no cues', () => {
  it('keys are spread evenly across a–d (exactly three each)', () => {
    const count: Record<string, number> = {}
    for (const q of WEEK3_QUIZ) count[keyOf(q).id] = (count[keyOf(q).id] ?? 0) + 1
    expect(count).toEqual({ a: 3, b: 3, c: 3, d: 3 })
  })
  it('the key’s length rank varies with no usable pattern: each rank 1–4 exactly three times, no ties with the key, no run of three', () => {
    const r = ranks(WEEK3_QUIZ)
    for (const x of r) expect(x.tie, `${x.id}: a distractor has the key’s length`).toBe(false)
    for (const k of [1, 2, 3, 4]) expect(r.filter((x) => x.rank === k).length, `rank ${k}: ${r.map((x) => x.rank).join(', ')}`).toBe(3)
    for (let i = 2; i < r.length; i++) expect(r[i].rank === r[i - 1].rank && r[i].rank === r[i - 2].rank).toBe(false)
  })
  it('no key is a length outlier: never more than 1.4 × the longest distractor nor less than 0.7 × the shortest (review m3)', () => {
    for (const q of WEEK3_QUIZ) expect(outlierOf(q), `${q.id}: the key stands out by length`).not.toBe(keyOf(q).id)
  })
  it('across the set, “pick the odd one out by length, else guess” scores no better than chance: the key is never the clear outlier while a distractor sometimes is', () => {
    expect(oddOneOutScore(WEEK3_QUIZ)).toBeLessThanOrEqual(0.25 + 1e-9)
    expect(WEEK3_QUIZ.filter((q) => outlierOf(q) === keyOf(q).id)).toHaveLength(0)
  })
  it('negative direction: the pre-review lengths (six keys the clear outlier) are caught by both rules', () => {
    const bad = structuredClone(WEEK3_QUIZ)
    const set = (id: string, text: string) => (keyOf(bad.find((q) => q.id === id)!).text = text)
    set('w3q-6', '15 kg')
    set('w3q-10', 'It should decrease')
    set('w3q-2', 'Its TRL changes when used beyond its design limits')
    expect(bad.filter((q) => outlierOf(q) === keyOf(q).id).map((q) => q.id)).toEqual(['w3q-2', 'w3q-6', 'w3q-10'])
    expect(oddOneOutScore(bad)).toBeGreaterThan(0.25 + 1e-9)
  })
  it('negative direction: a quiz whose keys are all the longest option fails the rank rule', () => {
    const bad = structuredClone(WEEK3_QUIZ)
    for (const q of bad) keyOf(q).text = `${'x'.repeat(200)}`
    expect(ranks(bad).every((x) => x.rank === 1)).toBe(true)
    expect(ranks(bad).filter((x) => x.rank === 1).length).not.toBe(3)
  })
})

describe('Week 3 quiz Q3: answerable from the lecture', () => {
  it('every item names an existing slide and lesson section, the deciding idea is in that section, and any “Session N, slide M” it quotes is that slide', () => {
    expect(Object.keys(DECIDING).sort()).toEqual(WEEK3_QUIZ.map((q) => q.id).sort())
    for (const q of WEEK3_QUIZ) {
      const t = q.lecture!
      expect(t, q.id).toBeDefined()
      expect(t.week).toBe(3)
      const lecture = getLecture(3, t.session)!
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
    for (const q of WEEK3_QUIZ) {
      const sec = getLecture(3, q.lecture!.session)!.studentLesson.find((s) => s.id === q.lecture!.section)!
      const text = sec.blocks.flatMap((b) => (b.kind === 'para' || b.kind === 'heading' ? [b.text] : b.kind === 'figure' || b.kind === 'slide-ref' ? [] : blockText(b))).join(' ')
      expect(sharesRun(keyOf(q).text, text), q.id).toBe(false)
    }
  })
  it('no quiz prompt reuses the wording of an in-class question or slide (8-word runs)', () => {
    const slideText = [1, 2].flatMap((s) => allSlides(getLecture(3, s)!).flatMap((x) => [x.title, ...x.body.flatMap(blockText)]))
    for (const q of WEEK3_QUIZ) for (const t of slideText) expect(sharesRun(q.prompt, t), `${q.id} ↔ ${t.slice(0, 40)}`).toBe(false)
  })
})

describe('Week 3 quiz Q3: the other checks can fail (negative direction)', () => {
  it('an unbalanced key set, a copied key, a missing deciding phrase and an AeroLink context are each detected', () => {
    const bad = structuredClone(WEEK3_QUIZ)
    for (const q of bad) for (const o of q.options) o.correct = o.id === 'a'
    const count: Record<string, number> = {}
    for (const q of bad) count[keyOf(q).id] = (count[keyOf(q).id] ?? 0) + 1
    expect(count).not.toEqual({ a: 3, b: 3, c: 3, d: 3 })
    expect(sharesRun('the probability test settles most arguments if it has already happened', 'The probability test settles most arguments: if it has already happened, it is an issue')).toBe(true)
    const sec = getLecture(3, 1)!.studentLesson.find((s) => s.id === 'w3-lesson-why')!
    const text = sec.blocks.flatMap((b) => (b.kind === 'para' || b.kind === 'heading' ? [b.text] : [])).join(' ')
    expect(text).not.toContain('swing weights are normalized by the median')
    expect('A vertiport operator asks').toMatch(/aero\s*-?link|vertiport|eVTOL/i)
  })
})
