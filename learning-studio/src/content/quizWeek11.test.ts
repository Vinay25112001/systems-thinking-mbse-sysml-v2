// Week 11 readiness quiz Q11: balanced keys, no length cue (first- or second-order), no stem-word, count or grammar cue,
// every item answerable from the lecture slide and lesson section it names, every citation in the register, unseen
// non-AeroLink contexts that do not reuse the applied exercise's setting, and no key copied from the lesson. Each cue rule
// is also shown able to fail on a mutated copy. Template: quizWeek10.test.ts (the strengthened Weeks 3–10 rules).
import { describe, expect, it } from 'vitest'
import { getLecture } from './lectures'
import { allSlides, blockText } from './lectures/text'
import { citationInRange, getReading, READINGS } from './readings'
import { WEEK11_QUIZ } from './quizWeek11'
import type { QuizQuestion } from './schema'

const keyOf = (q: QuizQuestion) => q.options.find((o) => o.correct)!
const distractorsOf = (q: QuizQuestion) => q.options.filter((o) => !o.correct)
const ranks = (qs: QuizQuestion[]) =>
  qs.map((q) => {
    const k = keyOf(q).text.length
    const others = distractorsOf(q).map((o) => o.text.length)
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
/** Second-order length cue (Week 3 confirmation N3): the key is a middle-length option (rank 2 or 3) that stands at least
 *  20 characters apart from both members of a near-equal distractor pair (within 6 characters of each other). */
const NEAR = 6
const APART = 20
const secondOrderCue = (q: QuizQuestion) => {
  const k = keyOf(q).text.length
  const d = distractorsOf(q).map((o) => o.text.length)
  const rank = 1 + d.filter((x) => x > k).length
  if (rank !== 2 && rank !== 3) return false
  for (let i = 0; i < d.length; i++)
    for (let j = i + 1; j < d.length; j++) if (Math.abs(d[i] - d[j]) <= NEAR && Math.abs(k - d[i]) >= APART && Math.abs(k - d[j]) >= APART) return true
  return false
}
const words = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
const sharesRun = (a: string, b: string, n = 8) => {
  const wa = words(a)
  const wb = ` ${words(b).join(' ')} `
  for (let i = 0; i + n <= wa.length; i++) if (wb.includes(` ${wa.slice(i, i + n).join(' ')} `)) return true
  return false
}
/** Function words and question scaffolding that cannot cue a key. */
const STOP = new Set(['which', 'these', 'their', 'there', 'should', 'would', 'about', 'under', 'other', 'those', 'where', 'being', 'right', 'first', 'second', 'third', 'statement', 'follows', 'between', 'through', 'instead', 'among', 'whose', 'with', 'each', 'what', 'when', 'from', 'into', 'than', 'that', 'this', 'they', 'them', 'does', 'only'])
/** Distinctive stem words (5+ letters, not scaffolding) that the key repeats and no distractor does. */
const stemEcho = (q: QuizQuestion) => {
  const stem = new Set(words(q.prompt).filter((w) => w.length >= 5 && !STOP.has(w)))
  const inDistractors = new Set(distractorsOf(q).flatMap((o) => words(o.text)))
  return [...new Set(words(keyOf(q).text))].filter((w) => stem.has(w) && !inDistractors.has(w))
}
/** Counts stated in the stem (digits or number words) that reappear in the key and in no distractor. */
const NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
const countEcho = (q: QuizQuestion) => {
  const nums = (s: string) => new Set(words(s).filter((w) => /^\d+$/.test(w) || NUMBER_WORDS.includes(w)))
  const stem = nums(q.prompt)
  const inDistractors = new Set(distractorsOf(q).flatMap((o) => [...nums(o.text)]))
  return [...nums(keyOf(q).text)].filter((n) => stem.has(n) && !inDistractors.has(n))
}
const hasAnd = (s: string) => /\band\b/i.test(s)
/** Grammar cue: the key is the only option with (or the only option without) “and”. */
const andCue = (q: QuizQuestion) => {
  const k = hasAnd(keyOf(q).text)
  const d = distractorsOf(q).map((o) => hasAnd(o.text))
  return (k && d.every((x) => !x)) || (!k && d.every((x) => x))
}
/** Grammar cue: the key is the only multi-item option (a list of three or more items, by separators). */
const items = (s: string) => 1 + (s.match(/,|;|\band\b/g) ?? []).length
const multiItemCue = (q: QuizQuestion) => items(keyOf(q).text) >= 3 && distractorsOf(q).every((o) => items(o.text) < 2)
const ABSOLUTE = /\b(always|never|only|none|cannot)\b/i
/** Softer absolutes the Week 6 review (Mo5) found clustered in distractors. */
const SOFT_ABSOLUTE = /\b(any|every|all|whole|whatever|at once|without delay|alone|right away|as soon as|at all|completely|a full)\b/i
/** Hedges the review found only in keys ("such as", "in case", "seldom"). */
const HEDGE = /\b(such as|for example|in case|seldom|usually|often|may|might|perhaps|likely|typically|most|rarely)\b/i
/** Hedges must not cue the key: the share of keys with a hedge is at most the share of distractors with one, plus one item. */
const hedgeCue = (qs: QuizQuestion[]) => {
  const keyRate = qs.filter((q) => HEDGE.test(keyOf(q).text)).length / qs.length
  const dRate = qs.flatMap(distractorsOf).filter((o) => HEDGE.test(o.text)).length / (qs.length * 3)
  return keyRate > dRate + 1 / qs.length
}
/** Form cue (Week 9 review): the three distractors open with the same word and the key alone opens differently. */
const firstWord = (s: string) => words(s)[0] ?? ''
const formCue = (q: QuizQuestion) => {
  const d = distractorsOf(q).map((o) => firstWord(o.text))
  return d.every((w) => w === d[0]) && firstWord(keyOf(q).text) !== d[0]
}
/** AeroLink's own words, its case IDs, and the setting of this week's applied exercise: none may appear in an item. */
const AEROLINK_WORDS = /aero\s*-?link|vertiport|eVTOL|air taxi|aircraft|autonom/i
const CASE_IDS = /\b(PHY|IF|EXT|CMP|FN|INFO|ICR|DEC|AG|REQ|INC|GAP|TECH|U)-\d/
const EXERCISE_SETTING = /kiosk|water|mobile money|solar pump/i

/** The deciding phrase of each item, as the detailed lesson is expected to state it (checked once the lecture exists). */
const DECIDING: Record<string, string> = {
  'w11q-1': 'physical interfaces',
  'w11q-2': 'nested',
  'w11q-3': 'specializ',
  'w11q-4': 'match',
  'w11q-5': 'conjugat',
  'w11q-6': 'whose ends are ports',
  'w11q-7': 'equal values',
  'w11q-8': 'established',
  'w11q-9': 'connection',
  'w11q-10': 'interface boundary',
  'w11q-11': 'asserts',
  'w11q-12': 'accepts',
}

/** Register ids this quiz may cite. */
const ALLOWED = new Set(['R13', 'R20c', 'R57', 'R70', 'R71', 'R76', 'R81', 'R83'])
const inRegister = (id: string) => READINGS.some((r) => r.id === id)
const citeOk = (id: string, pages: string) => ALLOWED.has(id) && inRegister(id) && citationInRange({ reading: id, pages })
/** Citations written into an explanation, in the form “R57 p.413”, “R22 pp.630–631” or “R72 sl.38”. */
const citesIn = (s: string) => [...s.matchAll(/\b(R\d+[a-z]?) (?:pp?|sl)\.(\d+(?:–\d+)?)/g)].map((m) => ({ id: m[1], pages: m[2] }))
/** Every option's explanation names the item's slide by id and cites an allowed register page. */
const explanationProblems = (q: QuizQuestion) =>
  q.options.flatMap((o) => {
    const out: string[] = []
    if (!o.explanation.includes(`slide ${q.lecture!.slide}`)) out.push(`${q.id}/${o.id}: no “slide ${q.lecture!.slide}”`)
    const c = citesIn(o.explanation)
    if (c.length === 0) out.push(`${q.id}/${o.id}: no register citation`)
    for (const x of c) if (!citeOk(x.id, x.pages)) out.push(`${q.id}/${o.id}: ${x.id} p.${x.pages} not allowed or out of range`)
    return out
  })

const sectionText = (week: number, session: number, section: string) => {
  const sec = getLecture(week, session)!.studentLesson.find((s) => s.id === section)!
  return sec.blocks.flatMap((b) => (b.kind === 'para' || b.kind === 'heading' ? [b.text] : b.kind === 'figure' || b.kind === 'slide-ref' ? [] : blockText(b))).join(' ')
}
/** Both Week 11 sessions are registered (their slides can be checked). */
const SLIDES_READY = Boolean(getLecture(11, 1) && getLecture(11, 2))
/** …and both detailed lessons have been written (their sections can be checked). */
const LESSON_READY = SLIDES_READY && [1, 2].every((s) => getLecture(11, s)!.studentLesson.length > 0)

describe('Week 11 quiz Q11: structure', () => {
  it('twelve items, one key each, an explanation for every option, unique ids, four or more Bloom levels', () => {
    expect(WEEK11_QUIZ).toHaveLength(12)
    expect(new Set(WEEK11_QUIZ.map((q) => q.id)).size).toBe(12)
    for (const q of WEEK11_QUIZ) {
      expect(q.options.map((o) => o.id), q.id).toEqual(['a', 'b', 'c', 'd'])
      expect(q.options.filter((o) => o.correct), q.id).toHaveLength(1)
      for (const o of q.options) expect(o.explanation.length, `${q.id}/${o.id}`).toBeGreaterThan(20)
      expect(q.review).toBe('new-pending-review')
    }
    expect(new Set(WEEK11_QUIZ.map((q) => q.bloom)).size).toBeGreaterThanOrEqual(4)
  })
  it('covers the Week 11 objectives W11.1–W11.5 and uses no other objective id', () => {
    const objs = ['W11.1', 'W11.2', 'W11.3', 'W11.4', 'W11.5']
    for (const o of objs) expect(WEEK11_QUIZ.some((q) => q.objective === o), o).toBe(true)
    for (const q of WEEK11_QUIZ) expect(objs, q.id).toContain(q.objective)
  })
  it('every item cites an allowed register page inside its range', () => {
    for (const q of WEEK11_QUIZ) {
      expect(q.cite, q.id).toBeDefined()
      expect(citeOk(q.cite!.reading, q.cite!.pages ?? ''), `${q.id}: ${q.cite!.reading} p.${q.cite!.pages}`).toBe(true)
      if (inRegister(q.cite!.reading)) {
        expect(() => getReading(q.cite!.reading)).not.toThrow()
        expect(citationInRange(q.cite!), q.id).toBe(true)
      }
    }
  })
  it('every option’s explanation names the item’s slide by id and cites an allowed register page', () => {
    expect(WEEK11_QUIZ.flatMap(explanationProblems)).toEqual([])
  })
  it('items resting on a course convention label it as one, in courseSource and in the key’s explanation', () => {
    const conv = WEEK11_QUIZ.filter((q) => q.courseSource)
    expect(conv.map((q) => q.id).sort()).toEqual(['w11q-3', 'w11q-9'])
    for (const q of conv) {
      expect(q.courseSource, q.id).toMatch(/course convention/)
      expect(keyOf(q).explanation, q.id).toMatch(/course convention/)
      expect(q.courseSource, q.id).toContain(q.lecture!.slide)
    }
  })
  it('contexts are unseen: no item is about AeroLink, reuses its ids, or uses the applied exercise’s setting (a water-kiosk network)', () => {
    for (const q of WEEK11_QUIZ) {
      const all = JSON.stringify([q.prompt, q.courseSource ?? '', ...q.options.flatMap((o) => [o.text, o.explanation])])
      expect(all, q.id).not.toMatch(AEROLINK_WORDS)
      expect(all, q.id).not.toMatch(CASE_IDS)
      expect(all, q.id).not.toMatch(EXERCISE_SETTING)
    }
  })
})

describe('Week 11 quiz Q11: no length cues', () => {
  it('keys are spread evenly across a–d (exactly three each) with no run of three identical keys', () => {
    const count: Record<string, number> = {}
    for (const q of WEEK11_QUIZ) count[keyOf(q).id] = (count[keyOf(q).id] ?? 0) + 1
    expect(count).toEqual({ a: 3, b: 3, c: 3, d: 3 })
    const k = WEEK11_QUIZ.map((q) => keyOf(q).id)
    for (let i = 2; i < k.length; i++) expect(k[i] === k[i - 1] && k[i] === k[i - 2], k.join('')).toBe(false)
  })
  it('the key’s length rank varies with no usable pattern: each rank 1–4 exactly three times, no ties with the key, no run of three', () => {
    const r = ranks(WEEK11_QUIZ)
    for (const x of r) expect(x.tie, `${x.id}: a distractor has the key’s length`).toBe(false)
    for (const k of [1, 2, 3, 4]) expect(r.filter((x) => x.rank === k).length, `rank ${k}: ${r.map((x) => x.rank).join(', ')}`).toBe(3)
    for (let i = 2; i < r.length; i++) expect(r[i].rank === r[i - 1].rank && r[i].rank === r[i - 2].rank).toBe(false)
  })
  it('no key is a length outlier (1.4 × / 0.7 ×), and “pick the odd one out by length, else guess” scores no better than chance', () => {
    for (const q of WEEK11_QUIZ) expect(outlierOf(q), `${q.id}: the key stands out by length`).not.toBe(keyOf(q).id)
    expect(oddOneOutScore(WEEK11_QUIZ)).toBeLessThanOrEqual(0.25 + 1e-9)
  })
  it('the option farthest in length from the other three is the key in at most 3 of 12 items (chance level)', () => {
    const hits = WEEK11_QUIZ.filter((q) => farthestOf(q) === keyOf(q).id).map((q) => q.id)
    expect(hits.length, hits.join(', ')).toBeLessThanOrEqual(3)
  })
  it('second-order cue (Week 3 N3): no key is a middle-length option standing ≥ 20 characters apart from a near-equal distractor pair', () => {
    expect(WEEK11_QUIZ.filter(secondOrderCue).map((q) => q.id)).toEqual([])
  })
  it('negative direction: shortened keys and a planted near-equal pair are caught by the outlier, farthest and second-order rules', () => {
    const bad = structuredClone(WEEK11_QUIZ)
    const key = (id: string) => keyOf(bad.find((q) => q.id === id)!)
    key('w11q-1').text = 'A rule'
    key('w11q-2').text = 'Its link'
    key('w11q-10').text = 'Keep both'
    expect(bad.filter((q) => outlierOf(q) === keyOf(q).id).map((q) => q.id)).toEqual(['w11q-1', 'w11q-2', 'w11q-10'])
    expect(oddOneOutScore(bad)).toBeGreaterThan(0.25 + 1e-9)
    key('w11q-7').text = 'Met'
    expect(bad.filter((q) => farthestOf(q) === keyOf(q).id).length).toBeGreaterThan(3)
    const q = structuredClone(WEEK11_QUIZ.find((x) => x.id === 'w11q-1')!)
    const len = keyOf(q).text.length
    const [d1, d2, d3] = distractorsOf(q)
    d1.text = 'x'.repeat(len + 30)
    d2.text = 'y'.repeat(len - 25)
    d3.text = 'z'.repeat(len - 22)
    expect(secondOrderCue(q)).toBe(true)
  })
  it('negative direction: a quiz whose keys are all the longest option fails the rank rule', () => {
    const bad = structuredClone(WEEK11_QUIZ)
    for (const q of bad) keyOf(q).text = `${'x'.repeat(200)}`
    expect(ranks(bad).every((x) => x.rank === 1)).toBe(true)
    expect(ranks(bad).filter((x) => x.rank === 1).length).not.toBe(3)
  })
})

describe('Week 11 quiz Q11: no wording or grammar cues', () => {
  it('no key repeats a distinctive stem word that every distractor lacks', () => {
    expect(WEEK11_QUIZ.map((q) => [q.id, stemEcho(q)] as const).filter(([, w]) => w.length > 0)).toEqual([])
  })
  it('no key repeats a count stated in the stem', () => {
    expect(WEEK11_QUIZ.map((q) => [q.id, countEcho(q)] as const).filter(([, w]) => w.length > 0)).toEqual([])
  })
  it('no grammar cue: the key is never the only option with or without “and”, nor the only multi-item option', () => {
    expect(WEEK11_QUIZ.filter(andCue).map((q) => q.id)).toEqual([])
    expect(WEEK11_QUIZ.filter(multiItemCue).map((q) => q.id)).toEqual([])
  })
  it('no absolute qualifiers (always, never, only, none, cannot) in any option, so none can cluster in distractors', () => {
    for (const q of WEEK11_QUIZ) for (const o of q.options) expect(o.text, `${q.id}/${o.id}`).not.toMatch(ABSOLUTE)
  })
  it('no soft absolutes either (any, every, all, whole, whatever, at once, without delay, alone, right away, as soon as, at all, completely, a full; review Mo5, confirmation N3)', () => {
    for (const q of WEEK11_QUIZ) for (const o of q.options) expect(o.text, `${q.id}/${o.id}`).not.toMatch(SOFT_ABSOLUTE)
  })
  it('hedges (such as, in case, seldom, …) are no commoner in keys than in distractors', () => {
    expect(hedgeCue(WEEK11_QUIZ)).toBe(false)
  })
  it('no form cue: the key is never the one option that opens differently from three distractors sharing a first word', () => {
    expect(WEEK11_QUIZ.filter(formCue).map((q) => q.id)).toEqual([])
  })
  it('negative direction: soft absolutes, hedges only in keys, and a form cue are each detected', () => {
    expect('Insert it at once, without delay').toMatch(SOFT_ABSOLUTE)
    expect('A rule that covers every interface').toMatch(SOFT_ABSOLUTE)
    for (const t of ['Let cranes alone set each step', 'move ahead right away', 'as soon as it can', 'A full stop of sales']) expect(t).toMatch(SOFT_ABSOLUTE)
    const bad = structuredClone(WEEK11_QUIZ)
    for (const q of bad) for (const o of distractorsOf(q)) o.text = o.text.replace(HEDGE, 'x')
    for (const id of ['w11q-2', 'w11q-7', 'w11q-10']) keyOf(bad.find((q) => q.id === id)!).text += ', in case it seldom fits'
    expect(hedgeCue(bad)).toBe(true)
    const q8 = structuredClone(WEEK11_QUIZ.find((q) => q.id === 'w11q-6')!)
    for (const o of distractorsOf(q8)) o.text = `The ${o.text}`
    expect(formCue(q8)).toBe(true)
  })
  it('every distractor is a named misreading: its explanation is not the key’s and does not call it correct', () => {
    for (const q of WEEK11_QUIZ)
      for (const o of distractorsOf(q)) {
        expect(o.explanation, `${q.id}/${o.id}`).not.toMatch(/^Correct\b/)
        expect(o.explanation, `${q.id}/${o.id}`).not.toBe(keyOf(q).explanation)
      }
    for (const q of WEEK11_QUIZ) expect(keyOf(q).explanation, q.id).toMatch(/^Correct\./)
  })
  it('negative direction: an echoed stem word, an echoed count, an “and” cue, a list cue and an absolute are each detected', () => {
    const bad = structuredClone(WEEK11_QUIZ)
    const q3 = bad.find((q) => q.id === 'w11q-6')!
    q3.prompt = `${q3.prompt} The parcel matters.`
    keyOf(q3).text = 'The parcel leaves after a fork'
    expect(stemEcho(q3)).toContain('parcel')
    const q10 = bad.find((q) => q.id === 'w11q-9')!
    keyOf(q10).text = 'Number 12, its ID'
    q10.prompt = 'Twelve requirements carry IDs: what is the twelfth one, 12?'
    expect(countEcho(q10)).toEqual(['12'])
    const q7 = structuredClone(WEEK11_QUIZ.find((q) => q.id === 'w11q-3')!)
    for (const o of distractorsOf(q7)) o.text = o.text.replace(/\band\b/g, 'or')
    keyOf(q7).text = 'Approve and reject both follow'
    expect(andCue(q7)).toBe(true)
    const q5 = structuredClone(WEEK11_QUIZ.find((q) => q.id === 'w11q-9')!)
    for (const o of distractorsOf(q5)) o.text = 'A subject'
    keyOf(q5).text = 'Subject, stakeholder, frame and doc'
    expect(multiItemCue(q5)).toBe(true)
    expect('A requirement is never informal').toMatch(ABSOLUTE)
  })
})

describe('Week 11 quiz Q11: citations and labels can fail (negative direction)', () => {
  it('an unknown reading, a page out of range, a missing slide id and an AeroLink id are each detected', () => {
    expect(citeOk('R99', '1')).toBe(false)
    expect(citeOk('R20b', '999')).toBe(false)
    expect(citeOk('R82', '117')).toBe(false)
    const bad = structuredClone(WEEK11_QUIZ.find((q) => q.id === 'w11q-2')!)
    bad.options[1].explanation = `Wrong (slide ${bad.lecture!.slide}; R20c p.999).`
    expect(explanationProblems(bad)).toHaveLength(1)
    bad.options[2].explanation = `Wrong, see slide ${bad.lecture!.slide}.`
    expect(explanationProblems(bad)).toHaveLength(2)
    expect('the model reuses REQ-001').toMatch(CASE_IDS)
    expect('A vertiport operator asks').toMatch(AEROLINK_WORDS)
    expect('A rural water kiosk').toMatch(EXERCISE_SETTING)
  })
})

describe('Week 11 quiz Q11: answerable from the lecture', () => {
  it.skipIf(!SLIDES_READY)('every item names an existing slide of its session', () => {
    for (const q of WEEK11_QUIZ) expect(allSlides(getLecture(11, q.lecture!.session)!).some((s) => s.id === q.lecture!.slide), `${q.id}: slide ${q.lecture!.slide}`).toBe(true)
  })
  it.skipIf(!LESSON_READY)('every item names an existing lesson section, and the deciding idea is in that section', () => {
    expect(Object.keys(DECIDING).sort()).toEqual(WEEK11_QUIZ.map((q) => q.id).sort())
    for (const q of WEEK11_QUIZ) {
      const t = q.lecture!
      const lecture = getLecture(11, t.session)!
      expect(lecture.studentLesson.some((s) => s.id === t.section), `${q.id}: section ${t.section}`).toBe(true)
      expect(sectionText(11, t.session, t.section).toLowerCase(), `${q.id}: “${DECIDING[q.id]}” in ${t.section}`).toContain(DECIDING[q.id].toLowerCase())
    }
  })
  it.skipIf(!LESSON_READY)('no key is copied from the lesson (no run of 8 words shared with its section)', () => {
    for (const q of WEEK11_QUIZ) expect(sharesRun(keyOf(q).text, sectionText(11, q.lecture!.session, q.lecture!.section)), q.id).toBe(false)
  })
  it.skipIf(!SLIDES_READY)('no quiz prompt reuses the wording of an in-class question or slide (8-word runs)', () => {
    const slideText = [1, 2].flatMap((s) => allSlides(getLecture(11, s)!).flatMap((x) => [x.title, ...x.body.flatMap(blockText)]))
    for (const q of WEEK11_QUIZ) for (const t of slideText) expect(sharesRun(q.prompt, t), `${q.id} ↔ ${t.slice(0, 40)}`).toBe(false)
  })
  it('every item points at a Week 11 slide id of its own session and a Week 11 lesson section id', () => {
    for (const q of WEEK11_QUIZ) {
      expect(q.lecture!.week, q.id).toBe(11)
      expect(q.lecture!.slide, q.id).toMatch(new RegExp(`^w11s${q.lecture!.session}-`))
      expect(q.lecture!.section, q.id).toMatch(new RegExp(`^w11s${q.lecture!.session}-l-`))
    }
    expect(sharesRun('the system shall send telemetry to the ground system as defined', 'The System shall send telemetry to the Ground System as defined in ICD 123')).toBe(true)
  })
})
