// Week 7 timing, pacing and student-facing hygiene (the Week 1 template's rules, DECISION_LOG A21). Each session plans
// 68–70 minutes of content and keeps a 5–7 minute buffer; spoken notes (teach, worked solution, figure walk) stay at or
// below 130 words per minute on every slide and at or above 40 on every lecture slide; every lecture slide names a
// misconception; the worked examples get their minimum minutes; Session 2 holds 25 minutes of lecture and 44 of review;
// the driving question is answered only after the audit is shown; the week's workload is within the 8.0 h budget for a
// team of four, unrounded too, and within it for a team of three and for graduate students. Slide faces and the lesson
// carry no internal IDs and no stale week numbers. Each rule is also shown able to fail.
import { describe, expect, it } from 'vitest'
import { allSlides, blockText, lectureMinutes, wordCount } from '../text'
import type { Lecture, Slide } from '../types'
import { WEEK7_SESSION1 } from './session1'
import { WEEK7_SESSION2 } from './session2'
import { GRADUATE_HOURS, GRADUATE_THREE_PERSON, WORKLOAD_SUMMARY, LAB_TEAM_HOURS, LESSON_WPM, READING_RATE_PAGES_PER_HOUR, REQUIRED_PAGES, THREE_PERSON, WEEK7_BUDGET_HOURS, WORKLOAD_ROWS, WORKLOAD_TOTAL, lessonWords } from '../../week7Path'
import { LAB7_PERSON_HOURS } from './labBrief'

const MAX_WPM = 130
const MIN_WPM = 40
const spokenWords = (s: Slide) => [...s.notes.teach, ...(s.notes.workedSolution ?? []), s.notes.figure ?? ''].reduce((n, t) => n + wordCount(t), 0)
const tooDense = (l: Lecture) => allSlides(l).filter((s) => s.minutes > 0 && spokenWords(s) / s.minutes > MAX_WPM).map((s) => s.id)
const LECTURES = [WEEK7_SESSION1, WEEK7_SESSION2]
const slide = (l: Lecture, id: string) => allSlides(l).find((x) => x.id === id)!
const isActivity = (s: Slide) => s.layout === 'references' || s.id.includes('-lab-')

/** Text a student sees: slide faces (titles, subtitles, bodies, asides, captions, alt text) and the whole lesson. */
export function studentText(l: Lecture): string[] {
  const out: string[] = []
  for (const s of allSlides(l)) {
    out.push(s.title, s.subtitle ?? '', ...[...s.body, ...(s.aside ?? [])].flatMap(blockText))
    if (s.figure) out.push(s.figure.caption, s.figure.alt)
  }
  for (const sec of l.studentLesson) {
    out.push(sec.title)
    for (const b of sec.blocks) {
      if (b.kind === 'para' || b.kind === 'heading') out.push(b.text)
      else if (b.kind === 'figure') out.push('figure' in b ? `${b.figure.caption} ${b.figure.alt}` : '')
      else if (b.kind !== 'slide-ref') out.push(...blockText(b))
    }
  }
  return out
}
export const INTERNAL = /\b(RB-\d|FD-\d|DECISION_LOG|A2[0-6]\b|S\d{1,2} p\.|S0\d\b|S1[0-3]\b|W7\.\d|P7-\d|P6-\d|outline §|new-pending-review|TODO|_source_cache)/
/** Stale schedule references (A19): requirements baseline Week 2, trade study Week 3, interfaces Week 5, roadmap Week 6,
 *  the package Week 7, the import Week 8, the physical model Week 11, verification cases Week 12, analysis Week 13. */
export const STALE = /\b(trade study in Week [^3]|requirements baseline in Week [^2]|interfaces (in|are defined in) Week [^5]|roadmap in Week [^6]|Week (?!6\b)\d+ (evolution )?roadmap|Week (?!11\b)\d+ physical model|Week (?!12\b)\d+ verification cases|Week (?!7\b)\d+ (engineering )?package|Week (?!8\b)\d+ (model|import)\b|Week 14 evolution)/i

describe('Week 7 pacing', () => {
  for (const l of LECTURES) {
    it(`session ${l.session}: 68–70 min of content, a 5–7 min buffer, 75 in all`, () => {
      expect(lectureMinutes(l)).toBeGreaterThanOrEqual(68)
      expect(lectureMinutes(l)).toBeLessThanOrEqual(70)
      expect(l.bufferMinutes).toBeGreaterThanOrEqual(5)
      expect(l.bufferMinutes).toBeLessThanOrEqual(7)
      expect(lectureMinutes(l) + (l.bufferMinutes ?? 0)).toBe(75)
    })
    it(`session ${l.session}: spoken notes at most ${MAX_WPM} words per minute on every slide`, () => {
      expect(tooDense(l)).toEqual([])
    })
    it(`session ${l.session}: every lecture slide has substantial notes (at least ${MIN_WPM} spoken words per planned minute)`, () => {
      expect(allSlides(l).filter((s) => !isActivity(s) && spokenWords(s) / s.minutes < MIN_WPM).map((s) => `${s.id} ${spokenWords(s)}/${s.minutes}`)).toEqual([])
    })
    it(`session ${l.session}: every lecture slide names at least one misconception`, () => {
      expect(allSlides(l).filter((s) => !isActivity(s) && !(s.notes.misconceptions ?? []).length).map((s) => s.id)).toEqual([])
    })
    it(`session ${l.session}: ends with the generated references-and-credits slide`, () => {
      const last = allSlides(l).at(-1)!
      expect(last.layout).toBe('references')
      expect(allSlides(l).filter((s) => s.layout === 'references')).toHaveLength(1)
    })
    it(`session ${l.session}: no internal IDs or stale week numbers on slide faces or in the lesson`, () => {
      for (const t of studentText(l)) {
        expect(t, t.slice(0, 80)).not.toMatch(INTERNAL)
        expect(t, t.slice(0, 80)).not.toMatch(STALE)
      }
    })
  }
  it('the worked examples get their minutes; Session 2 has 25 min of lecture and 44 min of review', () => {
    expect(slide(WEEK7_SESSION1, 'w7s1-thread-example').minutes).toBeGreaterThanOrEqual(4)
    expect(slide(WEEK7_SESSION1, 'w7s1-findings-example').minutes).toBeGreaterThanOrEqual(3)
    expect(slide(WEEK7_SESSION2, 'w7s2-defend-example').minutes).toBeGreaterThanOrEqual(3)
    const review = WEEK7_SESSION2.sections.find((s) => s.id === 'w7s2-review')!.slides.reduce((n, s) => n + s.minutes, 0)
    expect(review).toBe(44)
    expect(lectureMinutes(WEEK7_SESSION2) - review).toBe(25)
  })
  it('the driving question is answered only after the audit: the answer is on the readiness slide, never earlier in Session 1', () => {
    const ids = allSlides(WEEK7_SESSION1).map((s) => s.id)
    const answerAt = ids.indexOf('w7s1-readiness')
    expect(answerAt).toBeGreaterThan(ids.indexOf('w7s1-findings-example'))
    const before = allSlides(WEEK7_SESSION1).slice(0, answerAt)
    // the option itself reads "Ready with conditions, if …"; what must not appear early is the answer ("C: ready with conditions")
    for (const s of before) for (const t of [s.title, ...[...s.body, ...(s.aside ?? [])].flatMap(blockText)]) expect(t, s.id).not.toMatch(/C: ready with conditions|the answer is C/)
    expect(slide(WEEK7_SESSION1, 'w7s1-readiness').body.flatMap(blockText).join(' ')).toMatch(/C: ready with conditions/)
    for (const s of before) expect(s.notes.teach.join(' '), s.id).not.toMatch(/The answer is C/)
  })
  it('negative direction: a slide over the density limit, an internal ID and a stale week number are caught', () => {
    const l = structuredClone(WEEK7_SESSION1)
    allSlides(l).find((x) => x.id === 'w7s1-thread-example')!.minutes = 1
    expect(tooDense(l)).toContain('w7s1-thread-example')
    expect('see RB-11.2 for scoring').toMatch(INTERNAL)
    expect('objective W7.1').toMatch(INTERNAL)
    expect('register addition P7-1').toMatch(INTERNAL)
    expect('decided under A21').toMatch(INTERNAL)
    expect('S12 p.70').toMatch(INTERNAL)
    expect('the Week 6 engineering package').toMatch(STALE)
    expect('the Week 9 model').toMatch(STALE)
    expect('the Week 7 engineering package').not.toMatch(STALE)
    expect('the Week 8 model').not.toMatch(STALE)
  })
})

describe('Week 7 workload (8.0 h budget)', () => {
  it('the stated rows sum to the total, which is within the budget', () => {
    const sum = Math.round(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0) * 10) / 10
    expect(sum).toBe(WORKLOAD_TOTAL)
    expect(WORKLOAD_TOTAL).toBeLessThanOrEqual(WEEK7_BUDGET_HOURS)
  })
  it('the UNROUNDED total is within the budget too (row rounding must not hide an overrun)', () => {
    const fixed = WORKLOAD_ROWS.filter((r) => !['readings', 'lesson', 'lab'].includes(r.id)).reduce((a, r) => a + r.hours, 0)
    const unrounded = fixed + REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR + lessonWords() / LESSON_WPM / 60 + LAB_TEAM_HOURS / 4
    expect(unrounded).toBeLessThanOrEqual(WEEK7_BUDGET_HOURS)
  })
  it('the lesson row is computed from the lesson’s own word count, and the lesson is a real lesson', () => {
    const row = WORKLOAD_ROWS.find((r) => r.id === 'lesson')!
    expect(row.hours).toBe(Math.round((lessonWords() / LESSON_WPM / 60) * 10) / 10)
    expect(lessonWords()).toBeGreaterThan(3000)
  })
  it('graduate students and a team of three stay within the budget (the three-person gap is reported, not hidden)', () => {
    expect(GRADUATE_HOURS).toBeLessThanOrEqual(WEEK7_BUDGET_HOURS)
    expect(THREE_PERSON.total).toBeLessThanOrEqual(WEEK7_BUDGET_HOURS)
    expect(THREE_PERSON.each).toBeGreaterThanOrEqual(WORKLOAD_ROWS.find((r) => r.id === 'lab')!.hours)
    // review m6: a graduate student on a team of three is over the budget; the page says so (faculty decision)
    expect(GRADUATE_THREE_PERSON).toBeGreaterThan(WEEK7_BUDGET_HOURS)
    expect(WORKLOAD_SUMMARY.text).toContain(`${GRADUATE_THREE_PERSON.toFixed(1)} h, above the budget`)
  })
  it('every method step of the lab has an hours row', () => {
    for (const id of ['sources', 'audit', 'summary', 'prep', 'rids', 'integration']) expect(LAB7_PERSON_HOURS.some((t) => t.id === id && t.hours > 0), id).toBe(true)
  })
  it('negative direction: a budget overrun is caught', () => {
    const over = [...WORKLOAD_ROWS, { id: 'extra', activity: 'extra', hours: 1 }]
    expect(Math.round(over.reduce((a, r) => a + r.hours, 0) * 10) / 10).toBeGreaterThan(WEEK7_BUDGET_HOURS)
  })
})
