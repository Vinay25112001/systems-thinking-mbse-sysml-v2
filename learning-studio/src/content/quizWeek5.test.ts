// Week 5 readiness quiz Q5: balanced keys, no length cue (first- or second-order), no stem-word, count or grammar cue,
// every item answerable from the lecture slide and lesson section it names, every citation in the register, unseen
// non-AeroLink contexts, and no key copied from the lesson. Each cue rule is also shown able to fail on a mutated copy.
// The Week 5 lectures are being written alongside this quiz: the slide checks run once both Week 5 sessions are
// registered in lectures/index.ts, the lesson-section checks once both detailed lessons exist; until then they are
// skipped (visibly in the test report).
import { describe, expect, it } from 'vitest'
import { getLecture } from './lectures'
import { allSlides, blockText } from './lectures/text'
import { citationInRange, getReading, READINGS } from './readings'
import { WEEK5_QUIZ } from './quizWeek5'
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

/** The deciding phrase of each item, as the detailed lesson is expected to state it (checked once the lecture exists). */
const DECIDING: Record<string, string> = {
  'w5q-1': 'naturally occurring entities',
  'w5q-2': 'five plus or minus two',
  'w5q-3': 'outcomes, not actions',
  'w5q-4': 'external is a flag',
  'w5q-5': 'twice the number of interfaces',
  'w5q-6': 'hidden external interface',
  'w5q-7': 'engineer-to-engineer',
  'w5q-8': 'Write the interface requirements',
  'w5q-9': 'one consistent set of attributes',
  'w5q-10': 'accepts public input',
  'w5q-11': 'missing status as the unsafe value',
  'w5q-12': 'concentration risk',
}

/** Register ids this quiz may cite. R100–R104 (the glossary and DoD WBS entries) are being added to the register; until
 *  the register export includes them they are accepted only at the page the lecture brief fixes. */
const PENDING_REGISTER: Record<string, number> = { R100: 1541, R101: 1467, R102: 1643, R103: 1640, R104: 104 }
const ALLOWED = new Set(['R13', 'R20c', 'R22', 'R24', 'R25', 'R36', 'R46', 'R47', 'R54', 'R55', 'R57', ...Object.keys(PENDING_REGISTER)])
const inRegister = (id: string) => READINGS.some((r) => r.id === id)
const citeOk = (id: string, pages: string) => {
  if (!ALLOWED.has(id)) return false
  if (inRegister(id)) return citationInRange({ reading: id, pages })
  const nums = pages.split(/[–,-]/).map((s) => parseInt(s.trim(), 10))
  return id in PENDING_REGISTER && nums.every((n) => n === PENDING_REGISTER[id])
}
/** Citations written into an explanation, in the form “R57 p.413” or “R22 pp.630–631”. */
const citesIn = (s: string) => [...s.matchAll(/\b(R\d+[a-z]?) pp?\.(\d+(?:–\d+)?)/g)].map((m) => ({ id: m[1], pages: m[2] }))
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
/** Both Week 5 sessions are registered (their slides can be checked). */
const SLIDES_READY = Boolean(getLecture(5, 1) && getLecture(5, 2))
/** …and both detailed lessons have been written (their sections can be checked). */
const LESSON_READY = SLIDES_READY && [1, 2].every((s) => getLecture(5, s)!.studentLesson.length > 0)

describe('Week 5 quiz Q5: structure', () => {
  it('twelve items, one key each, an explanation for every option, unique ids, four or more Bloom levels', () => {
    expect(WEEK5_QUIZ).toHaveLength(12)
    expect(new Set(WEEK5_QUIZ.map((q) => q.id)).size).toBe(12)
    for (const q of WEEK5_QUIZ) {
      expect(q.options.map((o) => o.id), q.id).toEqual(['a', 'b', 'c', 'd'])
      expect(q.options.filter((o) => o.correct), q.id).toHaveLength(1)
      for (const o of q.options) expect(o.explanation.length, `${q.id}/${o.id}`).toBeGreaterThan(20)
      expect(q.review).toBe('new-pending-review')
    }
    expect(new Set(WEEK5_QUIZ.map((q) => q.bloom)).size).toBeGreaterThanOrEqual(4)
  })
  it('covers every Week 5 objective W5.1–W5.5 and uses no other objective id', () => {
    const objs = ['W5.1', 'W5.2', 'W5.3', 'W5.4', 'W5.5']
    for (const o of objs) expect(WEEK5_QUIZ.some((q) => q.objective === o), o).toBe(true)
    for (const q of WEEK5_QUIZ) expect(objs, q.id).toContain(q.objective)
  })
  it('every item cites an allowed register page inside its range (R100–R104 at their fixed page until registered)', () => {
    for (const q of WEEK5_QUIZ) {
      expect(q.cite, q.id).toBeDefined()
      expect(citeOk(q.cite!.reading, q.cite!.pages ?? ''), `${q.id}: ${q.cite!.reading} p.${q.cite!.pages}`).toBe(true)
      if (inRegister(q.cite!.reading)) {
        expect(() => getReading(q.cite!.reading)).not.toThrow()
        expect(citationInRange(q.cite!), q.id).toBe(true)
      }
    }
  })
  it('every option’s explanation names the item’s slide by id and cites an allowed register page', () => {
    expect(WEEK5_QUIZ.flatMap(explanationProblems)).toEqual([])
  })
  it('items resting on a course convention label it as one, in courseSource and in the key’s explanation', () => {
    const conv = WEEK5_QUIZ.filter((q) => q.courseSource)
    expect(conv.map((q) => q.id).sort()).toEqual(['w5q-10', 'w5q-11', 'w5q-12', 'w5q-4', 'w5q-5', 'w5q-9'])
    for (const q of conv) {
      expect(q.courseSource, q.id).toMatch(/course convention/)
      expect(keyOf(q).explanation, q.id).toMatch(/course convention/)
      expect(q.courseSource, q.id).toContain(q.lecture!.slide)
    }
  })
  it('contexts are unseen: no item is about AeroLink or reuses its element, interface or function ids', () => {
    for (const q of WEEK5_QUIZ) {
      const all = JSON.stringify([q.prompt, q.courseSource ?? '', ...q.options.flatMap((o) => [o.text, o.explanation])])
      expect(all, q.id).not.toMatch(/aero\s*-?link|vertiport|eVTOL|air taxi/i)
      expect(all, q.id).not.toMatch(/\b(PHY|IF|EXT|CMP|FN|INFO|ICR|DEC|AG|REQ)-\d/)
    }
  })
  it('the N² item’s arithmetic holds: the degrees sum to twice the keyed count', () => {
    const q = WEEK5_QUIZ.find((x) => x.id === 'w5q-5')!
    const degrees = [4, 3, 3, 2]
    expect(q.prompt).toContain(degrees.join(', ').replace(/, (\d)$/, ' and $1'))
    expect(degrees.reduce((a, b) => a + b, 0) / 2).toBe(6)
    expect(keyOf(q).text).toMatch(/^Six\b/)
  })
})

describe('Week 5 quiz Q5: no length cues', () => {
  it('keys are spread evenly across a–d (exactly three each) with no run of three identical keys', () => {
    const count: Record<string, number> = {}
    for (const q of WEEK5_QUIZ) count[keyOf(q).id] = (count[keyOf(q).id] ?? 0) + 1
    expect(count).toEqual({ a: 3, b: 3, c: 3, d: 3 })
    const k = WEEK5_QUIZ.map((q) => keyOf(q).id)
    for (let i = 2; i < k.length; i++) expect(k[i] === k[i - 1] && k[i] === k[i - 2], k.join('')).toBe(false)
  })
  it('the key’s length rank varies with no usable pattern: each rank 1–4 exactly three times, no ties with the key, no run of three', () => {
    const r = ranks(WEEK5_QUIZ)
    for (const x of r) expect(x.tie, `${x.id}: a distractor has the key’s length`).toBe(false)
    for (const k of [1, 2, 3, 4]) expect(r.filter((x) => x.rank === k).length, `rank ${k}: ${r.map((x) => x.rank).join(', ')}`).toBe(3)
    for (let i = 2; i < r.length; i++) expect(r[i].rank === r[i - 1].rank && r[i].rank === r[i - 2].rank).toBe(false)
  })
  it('no key is a length outlier (1.4 × / 0.7 ×), and “pick the odd one out by length, else guess” scores no better than chance', () => {
    for (const q of WEEK5_QUIZ) expect(outlierOf(q), `${q.id}: the key stands out by length`).not.toBe(keyOf(q).id)
    expect(oddOneOutScore(WEEK5_QUIZ)).toBeLessThanOrEqual(0.25 + 1e-9)
  })
  it('the option farthest in length from the other three is the key in at most 3 of 12 items (chance level)', () => {
    const hits = WEEK5_QUIZ.filter((q) => farthestOf(q) === keyOf(q).id).map((q) => q.id)
    expect(hits.length, hits.join(', ')).toBeLessThanOrEqual(3)
  })
  it('second-order cue (Week 3 N3): no key is a middle-length option standing ≥ 20 characters apart from a near-equal distractor pair', () => {
    expect(WEEK5_QUIZ.filter(secondOrderCue).map((q) => q.id)).toEqual([])
  })
  it('negative direction: shortened keys and a planted near-equal pair are caught by the outlier, farthest and second-order rules', () => {
    const bad = structuredClone(WEEK5_QUIZ)
    const opt = (id: string, o: string) => bad.find((q) => q.id === id)!.options.find((x) => x.id === o)!
    opt('w5q-2', 'c').text = 'Group them'
    opt('w5q-9', 'b').text = 'No owner'
    opt('w5q-11', 'd').text = 'Keep it locked'
    expect(bad.filter((q) => outlierOf(q) === keyOf(q).id).map((q) => q.id)).toEqual(['w5q-2', 'w5q-9', 'w5q-11'])
    expect(oddOneOutScore(bad)).toBeGreaterThan(0.25 + 1e-9)
    opt('w5q-1', 'a').text = 'Nurses and rooms'
    expect(bad.filter((q) => farthestOf(q) === keyOf(q).id).length).toBeGreaterThan(3)
    const q = structuredClone(WEEK5_QUIZ.find((x) => x.id === 'w5q-8')!)
    const len = keyOf(q).text.length
    const [d1, d2, d3] = distractorsOf(q)
    d1.text = 'x'.repeat(len + 30)
    d2.text = 'y'.repeat(len - 25)
    d3.text = 'z'.repeat(len - 22)
    expect(secondOrderCue(q)).toBe(true)
  })
  it('negative direction: a quiz whose keys are all the longest option fails the rank rule', () => {
    const bad = structuredClone(WEEK5_QUIZ)
    for (const q of bad) keyOf(q).text = `${'x'.repeat(200)}`
    expect(ranks(bad).every((x) => x.rank === 1)).toBe(true)
    expect(ranks(bad).filter((x) => x.rank === 1).length).not.toBe(3)
  })
})

describe('Week 5 quiz Q5: no wording or grammar cues', () => {
  it('no key repeats a distinctive stem word that every distractor lacks', () => {
    expect(WEEK5_QUIZ.map((q) => [q.id, stemEcho(q)] as const).filter(([, w]) => w.length > 0)).toEqual([])
  })
  it('no key repeats a count stated in the stem', () => {
    expect(WEEK5_QUIZ.map((q) => [q.id, countEcho(q)] as const).filter(([, w]) => w.length > 0)).toEqual([])
  })
  it('no grammar cue: the key is never the only option with or without “and”, nor the only multi-item option', () => {
    expect(WEEK5_QUIZ.filter(andCue).map((q) => q.id)).toEqual([])
    expect(WEEK5_QUIZ.filter(multiItemCue).map((q) => q.id)).toEqual([])
  })
  it('no absolute qualifiers (always, never, only, none, cannot) in any option, so none can cluster in distractors', () => {
    for (const q of WEEK5_QUIZ) for (const o of q.options) expect(o.text, `${q.id}/${o.id}`).not.toMatch(ABSOLUTE)
  })
  it('every distractor is a named misreading: its explanation is not the key’s and does not call it correct', () => {
    for (const q of WEEK5_QUIZ)
      for (const o of distractorsOf(q)) {
        expect(o.explanation, `${q.id}/${o.id}`).not.toMatch(/^Correct\b/)
        expect(o.explanation, `${q.id}/${o.id}`).not.toBe(keyOf(q).explanation)
      }
    for (const q of WEEK5_QUIZ) expect(keyOf(q).explanation, q.id).toMatch(/^Correct\./)
  })
  it('negative direction: an echoed stem word, an echoed count, an “and” cue, a list cue and an absolute are each detected', () => {
    const bad = structuredClone(WEEK5_QUIZ)
    const q6 = bad.find((q) => q.id === 'w5q-6')!
    keyOf(q6).text = 'As an internal exchange carried over the telecom network'
    expect(stemEcho(q6)).toContain('telecom')
    const q2 = bad.find((q) => q.id === 'w5q-2')!
    keyOf(q2).text = 'Group the eleven into a few subsystems'
    expect(countEcho(q2)).toEqual(['eleven'])
    const q7 = structuredClone(WEEK5_QUIZ.find((q) => q.id === 'w5q-7')!)
    for (const o of distractorsOf(q7)) o.text = o.text.replace(/\band\b/g, 'or')
    keyOf(q7).text = 'Engineers from three operators and the authority disagree'
    expect(andCue(q7)).toBe(true)
    const q1 = structuredClone(WEEK5_QUIZ.find((q) => q.id === 'w5q-1')!)
    for (const o of distractorsOf(q1)) o.text = 'Hardware alone'
    keyOf(q1).text = 'Nurses, procedures, records and rooms'
    expect(multiItemCue(q1)).toBe(true)
    expect('Interfaces never need an owner').toMatch(ABSOLUTE)
  })
})

describe('Week 5 quiz Q5: citations and labels can fail (negative direction)', () => {
  it('an unknown reading, a page out of range, a missing slide id and an AeroLink id are each detected', () => {
    expect(citeOk('R99', '1')).toBe(false)
    expect(citeOk('R57', '999')).toBe(false)
    expect(citeOk('R104', '105')).toBe(false)
    const bad = structuredClone(WEEK5_QUIZ.find((q) => q.id === 'w5q-6')!)
    bad.options[0].explanation = 'Wrong: the medium matters (R55 p.369).'
    expect(explanationProblems(bad)).toHaveLength(1)
    bad.options[1].explanation = 'Correct, see slide w5s1-external-hidden.'
    expect(explanationProblems(bad)).toHaveLength(2)
    expect('the link reuses IF-003').toMatch(/\b(PHY|IF|EXT|CMP|FN|INFO|ICR|DEC|AG|REQ)-\d/)
    expect('A vertiport operator asks').toMatch(/aero\s*-?link|vertiport|eVTOL|air taxi/i)
  })
})

describe('Week 5 quiz Q5: answerable from the lecture', () => {
  it.skipIf(!SLIDES_READY)('every item names an existing slide of its session', () => {
    for (const q of WEEK5_QUIZ) expect(allSlides(getLecture(5, q.lecture!.session)!).some((s) => s.id === q.lecture!.slide), `${q.id}: slide ${q.lecture!.slide}`).toBe(true)
  })
  it.skipIf(!LESSON_READY)('every item names an existing lesson section, and the deciding idea is in that section', () => {
    expect(Object.keys(DECIDING).sort()).toEqual(WEEK5_QUIZ.map((q) => q.id).sort())
    for (const q of WEEK5_QUIZ) {
      const t = q.lecture!
      const lecture = getLecture(5, t.session)!
      expect(lecture.studentLesson.some((s) => s.id === t.section), `${q.id}: section ${t.section}`).toBe(true)
      expect(sectionText(5, t.session, t.section), `${q.id}: “${DECIDING[q.id]}” in ${t.section}`).toContain(DECIDING[q.id])
    }
  })
  it.skipIf(!LESSON_READY)('no key is copied from the lesson (no run of 8 words shared with its section)', () => {
    for (const q of WEEK5_QUIZ) expect(sharesRun(keyOf(q).text, sectionText(5, q.lecture!.session, q.lecture!.section)), q.id).toBe(false)
  })
  it.skipIf(!SLIDES_READY)('no quiz prompt reuses the wording of an in-class question or slide (8-word runs)', () => {
    const slideText = [1, 2].flatMap((s) => allSlides(getLecture(5, s)!).flatMap((x) => [x.title, ...x.body.flatMap(blockText)]))
    for (const q of WEEK5_QUIZ) for (const t of slideText) expect(sharesRun(q.prompt, t), `${q.id} ↔ ${t.slice(0, 40)}`).toBe(false)
  })
  it('every item points at a Week 5 slide id of its own session and a Week 5 lesson section id', () => {
    for (const q of WEEK5_QUIZ) {
      expect(q.lecture!.week, q.id).toBe(5)
      expect(q.lecture!.slide, q.id).toMatch(new RegExp(`^w5s${q.lecture!.session}-`))
      expect(q.lecture!.section, q.id).toMatch(/^w5-lesson-/)
    }
    expect(sharesRun('the system shall send telemetry to the ground system as defined', 'The System shall send telemetry to the Ground System as defined in ICD 123')).toBe(true)
  })
})
