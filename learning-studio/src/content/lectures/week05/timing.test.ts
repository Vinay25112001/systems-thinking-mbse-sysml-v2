// Week 5 timing, pacing and student-facing hygiene (the Week 1 template's rules, DECISION_LOG A21). Each session plans
// 68–70 minutes of content and keeps a 5–7 minute buffer; spoken notes (teach, worked solution, figure walk) stay at or
// below 130 words per minute on every slide and at or above 40 on every lecture slide; the worked examples get their
// minimum minutes; the week's workload is the 8.0 h budget for a team of four, and a team of three carries the same load
// per person (A21 item 4). Slide faces and the lesson carry no internal IDs. Each rule is also shown able to fail.
import { describe, expect, it } from 'vitest'
import { allSlides, blockText, lectureMinutes, wordCount } from '../text'
import type { Lecture, Slide } from '../types'
import { WEEK5_SESSION1 } from './session1'
import { WEEK5_SESSION2 } from './session2'
import { THREE_PERSON, WEEK5_BUDGET_HOURS, WORKLOAD_ROWS, WORKLOAD_TOTAL, lessonWords, LESSON_WPM } from '../../week5Path'
import { LAB5_PERSON_HOURS } from './labBrief'

const MAX_WPM = 130
const spokenWords = (s: Slide) => [...s.notes.teach, ...(s.notes.workedSolution ?? []), s.notes.figure ?? ''].reduce((n, t) => n + wordCount(t), 0)
const tooDense = (l: Lecture) => allSlides(l).filter((s) => s.minutes > 0 && spokenWords(s) / s.minutes > MAX_WPM).map((s) => s.id)
const LECTURES = [WEEK5_SESSION1, WEEK5_SESSION2]
const slide = (l: Lecture, id: string) => allSlides(l).find((x) => x.id === id)!
const isActivity = (s: Slide) => s.layout === 'references' || s.id.includes('-lab-') || s.id.includes('warmup') || s.id.endsWith('-exit')

/** Text a student sees: slide faces (titles, subtitles, bodies, asides, captions, alt text) and the whole lesson. */
function studentText(l: Lecture): string[] {
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
const INTERNAL = /\b(RB-\d|FD-\d|DECISION_LOG|A2[01]\b|S\d{1,2} p\.|S0\d\b|S1[0-3]\b|W5\.\d|P5-\d|P4-\d|outline §|new-pending-review|TODO|_source_cache)/
/** Stale schedule references (A19): the requirements baseline is Week 2, the trade study Week 3, interfaces Week 5. */
const STALE = /\b(trade study in Week [^3]|requirements baseline in Week [^2]|interfaces (in|are defined in) Week [^5]|roadmap in Week [^6]|Week (?!6\b)\d+ (evolution )?roadmap|Week (?!11\b)\d+ physical model|Week (?!12\b)\d+ verification cases|Week (?!7\b)\d+ (engineering )?package)/i

describe('Week 5 pacing', () => {
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
    it(`session ${l.session}: every lecture slide has substantial notes (at least 40 spoken words per planned minute)`, () => {
      expect(allSlides(l).filter((s) => !isActivity(s) && spokenWords(s) / s.minutes < 40).map((s) => s.id)).toEqual([])
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
  it('the worked breakdown and N² get their minutes (4 and 6), the worked definitions 5; Session 2 has 22 min of lab launch', () => {
    expect(slide(WEEK5_SESSION1, 'w5s1-worked-breakdown').minutes).toBeGreaterThanOrEqual(4)
    expect(slide(WEEK5_SESSION1, 'w5s1-worked-n2').minutes).toBeGreaterThanOrEqual(6)
    expect(slide(WEEK5_SESSION1, 'w5s1-worked-definitions').minutes).toBeGreaterThanOrEqual(5)
    expect(WEEK5_SESSION2.sections.find((s) => s.id === 'w5s2-lab')!.slides.reduce((n, s) => n + s.minutes, 0)).toBe(22)
  })
  it('answers are not shown before students supply them: the exercise slides precede their reveals, and the exercise figures say so', () => {
    const order = allSlides(WEEK5_SESSION1).map((s) => s.id)
    expect(order.indexOf('w5s1-worked-n2')).toBe(order.indexOf('w5s1-reading-n2') - 1)
    expect(order.indexOf('w5s1-table')).toBe(order.indexOf('w5s1-worked-definitions') - 1)
    expect(order.indexOf('w5s1-driving-question')).toBeLessThan(order.indexOf('w5s1-answer'))
    expect(slide(WEEK5_SESSION1, 'w5s1-worked-n2').figure!.alt).toMatch(/degree column .* empty/i)
    expect(slide(WEEK5_SESSION1, 'w5s1-table').figure!.alt).toMatch(/every other cell of the row is blank/i)
    expect(slide(WEEK5_SESSION2, 'w5s2-audit').figure!.alt).toMatch(/no findings are marked/i)
  })
  it('negative direction: a slide over the density limit, an internal ID and a stale week number are caught', () => {
    const l = structuredClone(WEEK5_SESSION1)
    allSlides(l).find((x) => x.id === 'w5s1-worked-n2')!.minutes = 1
    expect(tooDense(l)).toContain('w5s1-worked-n2')
    expect('see RB-7.3 for scoring').toMatch(INTERNAL)
    expect('objective W5.2').toMatch(INTERNAL)
    expect('register addition P5-1').toMatch(INTERNAL)
    expect('decided under A21').toMatch(INTERNAL)
    expect('S12 p.144').toMatch(INTERNAL)
    expect('the trade study in Week 7').toMatch(STALE)
    expect('the Week 7 evolution roadmap').toMatch(STALE)
    expect('the Week 10 physical model').toMatch(STALE)
    expect('the Week 6 evolution roadmap').not.toMatch(STALE)
  })
})

describe('Week 5 workload (8.0 h budget, proportional to team size)', () => {
  it('the stated rows sum to the total, and the total is within 0.3 h of the budget and never over it', () => {
    const sum = Math.round(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0) * 10) / 10
    expect(sum).toBe(WORKLOAD_TOTAL)
    expect(WORKLOAD_TOTAL).toBeLessThanOrEqual(WEEK5_BUDGET_HOURS)
    expect(WORKLOAD_TOTAL).toBeGreaterThanOrEqual(WEEK5_BUDGET_HOURS - 0.3)
  })
  it('the lesson row is computed from the lesson’s own word count', () => {
    const row = WORKLOAD_ROWS.find((r) => r.id === 'lesson')!
    expect(row.hours).toBe(Math.round((lessonWords() / LESSON_WPM / 60) * 10) / 10)
    expect(lessonWords()).toBeGreaterThan(4000)
  })
  it('a team of three carries the same out-of-class load per person as a team of four (within 0.1 h)', () => {
    const four = WORKLOAD_ROWS.find((r) => r.id === 'lab')!.hours
    expect(Math.abs(THREE_PERSON.each - four)).toBeLessThanOrEqual(0.1 + 1e-9)
  })
  it('every method step of the lab has an hours row (Week 4 review Mo7), the security columns included', () => {
    for (const id of ['breakdown', 'n2', 'table', 'security', 'requirements', 'management', 'integration']) expect(LAB5_PERSON_HOURS.some((t) => t.id === id && t.hours > 0), id).toBe(true)
  })
  it('negative direction: a budget overrun is caught', () => {
    const over = [...WORKLOAD_ROWS, { id: 'extra', activity: 'extra', hours: 1 }]
    expect(Math.round(over.reduce((a, r) => a + r.hours, 0) * 10) / 10).toBeGreaterThan(WEEK5_BUDGET_HOURS)
  })
})
