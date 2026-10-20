// Week 2 timing, pacing and student-facing hygiene (the Week 1 template's rules, DECISION_LOG A21). Each session plans
// 68–70 minutes of content and keeps a 5–7 minute buffer; spoken notes (teach, worked solution, figure walk) stay at or
// below 130 words per minute on every slide; the worked scenario gets at least 5 minutes and the trace audit at least 4;
// the week's workload is at most the 8.0 h budget for a team of four, and a team of three carries the same load per
// person (A21 item 4). Slide faces and the lesson carry no internal IDs. Each rule is also shown able to fail.
import { describe, expect, it } from 'vitest'
import { allSlides, blockText, lectureMinutes, wordCount } from '../text'
import type { Lecture, Slide } from '../types'
import { WEEK2_SESSION1 } from './session1'
import { WEEK2_SESSION2 } from './session2'
import { THREE_PERSON, WEEK2_BUDGET_HOURS, WORKLOAD_ROWS, WORKLOAD_TOTAL, lessonWords, LESSON_WPM } from '../../week2Path'

const MAX_WPM = 130
const spokenWords = (s: Slide) => [...s.notes.teach, ...(s.notes.workedSolution ?? []), s.notes.figure ?? ''].reduce((n, t) => n + wordCount(t), 0)
const tooDense = (l: Lecture) => allSlides(l).filter((s) => s.minutes > 0 && spokenWords(s) / s.minutes > MAX_WPM).map((s) => s.id)
const LECTURES = [WEEK2_SESSION1, WEEK2_SESSION2]

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
const INTERNAL = /\b(RB-\d|FD-\d|DECISION_LOG|S0[1-4]\b|W2\.\d|P2-\d|outline §|new-pending-review)/

describe('Week 2 pacing', () => {
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
    it(`session ${l.session}: every content slide has substantial notes (at least 40 spoken words per planned minute on lecture slides; activity slides excepted)`, () => {
      const thin = allSlides(l).filter((s) => s.layout !== 'references' && !s.id.includes('-lab-') && !s.id.includes('warmup') && !s.id.endsWith('-exit') && spokenWords(s) / s.minutes < 40).map((s) => s.id)
      expect(thin).toEqual([])
    })
    it(`session ${l.session}: ends with the generated references-and-credits slide`, () => {
      const last = allSlides(l).at(-1)!
      expect(last.layout).toBe('references')
      expect(allSlides(l).filter((s) => s.layout === 'references')).toHaveLength(1)
    })
    it(`session ${l.session}: no internal IDs on slide faces or in the lesson`, () => {
      for (const t of studentText(l)) expect(t, t.slice(0, 80)).not.toMatch(INTERNAL)
    })
  }
  it('the worked scenario gets at least 5 minutes, the critique at least 5 and the trace audit at least 4; Session 2 has 22 min of lab launch', () => {
    expect(allSlides(WEEK2_SESSION1).find((x) => x.id === 'w2s1-worked-scn005')!.minutes).toBeGreaterThanOrEqual(5)
    expect(allSlides(WEEK2_SESSION2).find((x) => x.id === 'w2s2-worked-critique')!.minutes).toBeGreaterThanOrEqual(5)
    expect(allSlides(WEEK2_SESSION2).find((x) => x.id === 'w2s2-worked-audit')!.minutes).toBeGreaterThanOrEqual(4)
    expect(WEEK2_SESSION2.sections.find((s) => s.id === 'w2s2-lab')!.slides.reduce((n, s) => n + s.minutes, 0)).toBe(22)
  })
  it('negative direction: a slide over the density limit and an internal ID are caught', () => {
    const l = structuredClone(WEEK2_SESSION1)
    allSlides(l).find((x) => x.id === 'w2s1-worked-scn005')!.minutes = 2
    expect(tooDense(l)).toContain('w2s1-worked-scn005')
    expect('see RB-3.1 for scoring').toMatch(INTERNAL)
    expect('objective W2.3').toMatch(INTERNAL)
  })
})

describe('Week 2 workload (8.0 h budget, proportional to team size)', () => {
  it('the stated rows sum to the total, and the total is within the budget', () => {
    const sum = Math.round(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0) * 10) / 10
    expect(sum).toBe(WORKLOAD_TOTAL)
    expect(WORKLOAD_TOTAL).toBeLessThanOrEqual(WEEK2_BUDGET_HOURS)
  })
  it('the lesson row is computed from the lesson’s own word count', () => {
    const row = WORKLOAD_ROWS.find((r) => r.id === 'lesson')!
    expect(row.hours).toBe(Math.round((lessonWords() / LESSON_WPM / 60) * 10) / 10)
    expect(lessonWords()).toBeGreaterThan(6000)
  })
  it('a team of three carries the same out-of-class load per person as a team of four (within 0.1 h)', () => {
    const four = WORKLOAD_ROWS.find((r) => r.id === 'lab')!.hours
    expect(Math.abs(THREE_PERSON.each - four)).toBeLessThanOrEqual(0.1)
  })
})
