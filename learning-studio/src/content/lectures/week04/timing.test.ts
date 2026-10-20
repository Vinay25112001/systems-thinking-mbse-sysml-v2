// Week 4 timing, pacing and student-facing hygiene (the Week 1 template's rules, DECISION_LOG A21). Each session plans
// 68–70 minutes of content and keeps a 5–7 minute buffer; spoken notes (teach, worked solution, figure walk) stay at or
// below 130 words per minute on every slide and at or above 40 on every lecture slide; the worked examples get their
// minimum minutes; the week's workload is the 8.0 h budget for a team of four, and a team of three carries the same load
// per person (A21 item 4). Slide faces and the lesson carry no internal IDs. Each rule is also shown able to fail.
import { describe, expect, it } from 'vitest'
import { allSlides, blockText, lectureMinutes, wordCount } from '../text'
import type { Lecture, Slide } from '../types'
import { WEEK4_SESSION1 } from './session1'
import { WEEK4_SESSION2 } from './session2'
import { THREE_PERSON, WEEK4_BUDGET_HOURS, WORKLOAD_ROWS, WORKLOAD_TOTAL, lessonWords, LESSON_WPM } from '../../week4Path'
import { LAB4_PERSON_HOURS } from './labBrief'

const MAX_WPM = 130
const spokenWords = (s: Slide) => [...s.notes.teach, ...(s.notes.workedSolution ?? []), s.notes.figure ?? ''].reduce((n, t) => n + wordCount(t), 0)
const tooDense = (l: Lecture) => allSlides(l).filter((s) => s.minutes > 0 && spokenWords(s) / s.minutes > MAX_WPM).map((s) => s.id)
const LECTURES = [WEEK4_SESSION1, WEEK4_SESSION2]
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
const INTERNAL = /\b(RB-\d|FD-\d|DECISION_LOG|S0[1-4]\b|S1[0-3] p|W4\.\d|P4-\d|outline §|new-pending-review)/
/** Stale schedule references (A19): the requirements baseline is Week 2, the trade study Week 3, interfaces Week 5. */
const STALE = /\b(trade study in Week [^3]|requirements baseline in Week [^2]|interfaces (in|are defined in) Week [^5])/i

describe('Week 4 pacing', () => {
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
  it('the scenario walk and the worked allocation get at least 5 minutes, the worked information view at least 4; Session 2 has 22 min of lab launch', () => {
    expect(slide(WEEK4_SESSION1, 'w4s1-worked-walk').minutes).toBeGreaterThanOrEqual(5)
    expect(slide(WEEK4_SESSION1, 'w4s1-worked-allocation').minutes).toBeGreaterThanOrEqual(5)
    expect(slide(WEEK4_SESSION2, 'w4s2-worked-info').minutes).toBeGreaterThanOrEqual(4)
    expect(WEEK4_SESSION2.sections.find((s) => s.id === 'w4s2-lab')!.slides.reduce((n, s) => n + s.minutes, 0)).toBe(22)
  })
  it('negative direction: a slide over the density limit, an internal ID and a stale week number are caught', () => {
    const l = structuredClone(WEEK4_SESSION1)
    allSlides(l).find((x) => x.id === 'w4s1-worked-walk')!.minutes = 1
    expect(tooDense(l)).toContain('w4s1-worked-walk')
    expect('see RB-7.3 for scoring').toMatch(INTERNAL)
    expect('objective W4.2').toMatch(INTERNAL)
    expect('register addition P4-1').toMatch(INTERNAL)
    expect('S12 p.144').toMatch(INTERNAL)
    expect('the trade study in Week 7').toMatch(STALE)
  })
})

describe('Week 4 workload (8.0 h budget, proportional to team size)', () => {
  it('the stated rows sum to the total, and the total is within 0.3 h of the budget and never over it', () => {
    const sum = Math.round(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0) * 10) / 10
    expect(sum).toBe(WORKLOAD_TOTAL)
    expect(WORKLOAD_TOTAL).toBeLessThanOrEqual(WEEK4_BUDGET_HOURS)
    expect(WORKLOAD_TOTAL).toBeGreaterThanOrEqual(WEEK4_BUDGET_HOURS - 0.3)
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
  it('review Mo7: every part of the record has hours, Part 15 (viewpoints and the concern-coverage check) included', () => {
    expect(LAB4_PERSON_HOURS.find((t) => t.id === 'views')?.hours).toBeGreaterThanOrEqual(1)
    for (const id of ['views', 'walks', 'trace', 'allocation', 'decision', 'information', 'ai', 'integration']) expect(LAB4_PERSON_HOURS.some((t) => t.id === id), id).toBe(true)
  })
  it('negative direction: a budget overrun is caught', () => {
    const over = [...WORKLOAD_ROWS, { id: 'extra', activity: 'extra', hours: 1 }]
    expect(Math.round(over.reduce((a, r) => a + r.hours, 0) * 10) / 10).toBeGreaterThan(WEEK4_BUDGET_HOURS)
  })
})
