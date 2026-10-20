// Week 8 readiness quiz Q8: balanced keys, no length cue, every item answerable from the lecture slide and lesson section
// it names, every citation in the verified register, unseen non-AeroLink contexts, and no key copied from the lesson.
// Each cue rule is also shown able to fail on a mutated copy.
import { describe, expect, it } from 'vitest'
import { getLecture } from './lectures'
import { allSlides, blockText } from './lectures/text'
import { citationInRange, getReading } from './readings'
import { WEEK8_QUIZ } from './quizWeek8'
import type { QuizQuestion } from './schema'

const keyOf = (q: QuizQuestion) => q.options.find((o) => o.correct)!
const ranks = (qs: QuizQuestion[]) =>
  qs.map((q) => {
    const k = keyOf(q).text.length
    const others = q.options.filter((o) => !o.correct).map((o) => o.text.length)
    return { id: q.id, rank: 1 + others.filter((x) => x > k).length, tie: others.includes(k) }
  })
const words = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
const sharesRun = (a: string, b: string, n = 8) => {
  const wa = words(a)
  const wb = ` ${words(b).join(' ')} `
  for (let i = 0; i + n <= wa.length; i++) if (wb.includes(` ${wa.slice(i, i + n).join(' ')} `)) return true
  return false
}

/** The deciding phrase of each item, as the detailed lesson states it. */
const DECIDING: Record<string, string> = {
  'w8q-1': 'a selective representation',
  'w8q-2': 'the quality of a model is not the quality of the design',
  'w8q-3': 'Root layer has no model-level semantics',
  'w8q-4': 'a usage is always defined by at least one definition',
  'w8q-5': 'after a usage, :> means subsetting',
  'w8q-6': 'a subsetting usage is an additional feature',
  'w8q-7': 'a redefining usage replaces',
  'w8q-8': 'a PASS shows that the file parsed',
  'w8q-9': 'a name that contains a hyphen must be quoted',
  'w8q-10': 'members of a private import are not re-exported',
  'w8q-11': 'the subject must be declared before any stakeholder',
  'w8q-12': 'every artifact gets a home in the model or a recorded reason to wait',
}

describe('Week 8 quiz Q8: structure', () => {
  it('twelve items, one key each, an explanation for every option, unique ids, several Bloom levels', () => {
    expect(WEEK8_QUIZ).toHaveLength(12)
    expect(new Set(WEEK8_QUIZ.map((q) => q.id)).size).toBe(12)
    for (const q of WEEK8_QUIZ) {
      expect(q.options.filter((o) => o.correct), q.id).toHaveLength(1)
      for (const o of q.options) expect(o.explanation.length, `${q.id}/${o.id}`).toBeGreaterThan(20)
      expect(q.review).toBe('new-pending-review')
    }
    expect(new Set(WEEK8_QUIZ.map((q) => q.bloom)).size).toBeGreaterThanOrEqual(4)
  })
  it('covers every Week 8 objective W8.1–W8.6', () => {
    for (const o of ['W8.1', 'W8.2', 'W8.3', 'W8.4', 'W8.5', 'W8.6']) expect(WEEK8_QUIZ.some((q) => q.objective === o), o).toBe(true)
  })
  it('every item cites a verified register page inside its range, or names the course convention it tests (never both missing)', () => {
    for (const q of WEEK8_QUIZ) {
      expect(!!q.cite || !!q.courseSource, q.id).toBe(true)
      if (!q.cite) continue
      expect(() => getReading(q.cite!.reading)).not.toThrow()
      expect(citationInRange(q.cite!), q.id).toBe(true)
    }
    expect(WEEK8_QUIZ.filter((q) => q.cite).length).toBeGreaterThanOrEqual(10)
  })
  it('contexts are unseen: no item is about AeroLink', () => {
    for (const q of WEEK8_QUIZ) expect(JSON.stringify([q.prompt, ...q.options.map((o) => o.text)]), q.id).not.toMatch(/aero\s*-?link|vertiport|eVTOL/i)
  })
})

describe('Week 8 quiz Q8: no cues', () => {
  it('keys are spread evenly across a–d (exactly three each)', () => {
    const count: Record<string, number> = {}
    for (const q of WEEK8_QUIZ) count[keyOf(q).id] = (count[keyOf(q).id] ?? 0) + 1
    expect(count).toEqual({ a: 3, b: 3, c: 3, d: 3 })
  })
  it('the key’s length rank varies with no usable pattern: each rank 1–4 exactly three times, no ties with the key, no run of three', () => {
    const r = ranks(WEEK8_QUIZ)
    for (const x of r) expect(x.tie, `${x.id}: a distractor has the key’s length`).toBe(false)
    for (const k of [1, 2, 3, 4]) expect(r.filter((x) => x.rank === k).length, `rank ${k}: ${r.map((x) => x.rank).join(', ')}`).toBe(3)
    for (let i = 2; i < r.length; i++) expect(r[i].rank === r[i - 1].rank && r[i].rank === r[i - 2].rank).toBe(false)
  })
  it('negative direction: a quiz whose keys are all the longest option fails the rank rule', () => {
    const bad = structuredClone(WEEK8_QUIZ)
    for (const q of bad) keyOf(q).text = `${'x'.repeat(200)}`
    expect(ranks(bad).every((x) => x.rank === 1)).toBe(true)
    expect(ranks(bad).filter((x) => x.rank === 1).length).not.toBe(3)
  })
})

describe('Week 8 quiz Q8: answerable from the lecture', () => {
  it('every item names an existing slide and lesson section, the deciding idea is in that section, and any “Session N, slide M” it quotes is that slide', () => {
    expect(Object.keys(DECIDING).sort()).toEqual(WEEK8_QUIZ.map((q) => q.id).sort())
    for (const q of WEEK8_QUIZ) {
      const t = q.lecture!
      expect(t, q.id).toBeDefined()
      expect(t.week).toBe(8)
      const lecture = getLecture(8, t.session)!
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
    for (const q of WEEK8_QUIZ) {
      const sec = getLecture(8, q.lecture!.session)!.studentLesson.find((s) => s.id === q.lecture!.section)!
      const text = sec.blocks.flatMap((b) => (b.kind === 'para' || b.kind === 'heading' ? [b.text] : b.kind === 'figure' || b.kind === 'slide-ref' ? [] : blockText(b))).join(' ')
      expect(sharesRun(keyOf(q).text, text), q.id).toBe(false)
    }
  })
  it('no quiz prompt reuses the wording of an in-class question or slide (8-word runs)', () => {
    const slideText = [1, 2].flatMap((s) => allSlides(getLecture(8, s)!).flatMap((x) => [x.title, ...x.body.flatMap(blockText)]))
    for (const q of WEEK8_QUIZ) for (const t of slideText) expect(sharesRun(q.prompt, t), `${q.id} ↔ ${t.slice(0, 40)}`).toBe(false)
  })
})
