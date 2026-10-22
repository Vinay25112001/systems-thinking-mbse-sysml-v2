// Week 10 timing, pacing and student-facing hygiene (the Week 1 template's rules, DECISION_LOG A21). Each session plans
// 68–70 minutes of content and keeps a 5–7 minute buffer; spoken notes (teach, worked solution, figure walk) stay at or
// below 130 words per minute on every slide and give lecture slides at least 40; the two worked examples of Session 1
// get at least 4 and 6 minutes, the worked states at least 4; Session 2 has 22 min of lab launch and 47 of lecture; the
// week's workload is at most the 8.0 h budget for a team of four, and a team of three carries the same load per person
// (A21 item 4). Slide faces and the lesson carry no internal IDs, and every Week 10 lecture citation is in the verified
// register. Each rule is also shown able to fail.
import { describe, expect, it } from 'vitest'
import { citationInRange, getReading } from '../../readings'
import { lectureCitations } from '../references'
import { allSlides, blockText, lectureMinutes, wordCount } from '../text'
import type { Lecture, Slide } from '../types'
import { validateLecture } from '../validate'
import { WEEK10_SESSION1 } from './session1'
import { WEEK10_SESSION2 } from './session2'
import { THREE_PERSON, WEEK10_BUDGET_HOURS, WORKLOAD_ROWS, WORKLOAD_TOTAL, lessonWords, LESSON_WPM } from '../../week10Path'

const MAX_WPM = 130
const MIN_WPM = 40
const spokenWords = (s: Slide) => [...s.notes.teach, ...(s.notes.workedSolution ?? []), s.notes.figure ?? ''].reduce((n, t) => n + wordCount(t), 0)
const tooDense = (l: Lecture) => allSlides(l).filter((s) => s.minutes > 0 && spokenWords(s) / s.minutes > MAX_WPM).map((s) => s.id)
const tooThin = (l: Lecture) => allSlides(l).filter((s) => s.layout !== 'references' && !s.id.includes('-lab-') && spokenWords(s) / s.minutes < MIN_WPM).map((s) => s.id)
const LECTURES = [WEEK10_SESSION1, WEEK10_SESSION2]

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
const INTERNAL = /\b(RB-\d|FD-\d|DECISION_LOG|S0\d\b|S1[0-3]\b|W10\.\d|B10\.\d|P10\.\d|PX\d|R\d{2,3}[a-z]?\b|sl\.\d|outline §|new-pending-review|old Week)/

describe('Week 10 lectures: valid, paced and clean', () => {
  for (const l of LECTURES) {
    it(`session ${l.session}: validates clean`, () => {
      expect(validateLecture(l)).toEqual([])
    })
    it(`session ${l.session}: 68–70 min of content, a 5–7 min buffer, 75 in all`, () => {
      expect(lectureMinutes(l)).toBeGreaterThanOrEqual(68)
      expect(lectureMinutes(l)).toBeLessThanOrEqual(70)
      expect(l.bufferMinutes).toBeGreaterThanOrEqual(5)
      expect(l.bufferMinutes).toBeLessThanOrEqual(7)
      expect(lectureMinutes(l) + (l.bufferMinutes ?? 0)).toBe(75)
    })
    it(`session ${l.session}: spoken notes between ${MIN_WPM} and ${MAX_WPM} words per minute (lab-launch slides: at most ${MAX_WPM})`, () => {
      expect(tooDense(l)).toEqual([])
      expect(tooThin(l)).toEqual([])
    })
    it(`session ${l.session}: ends with the generated references-and-credits slide`, () => {
      const last = allSlides(l).at(-1)!
      expect(last.layout).toBe('references')
      expect(allSlides(l).filter((s) => s.layout === 'references')).toHaveLength(1)
    })
    it(`session ${l.session}: no internal IDs on slide faces or in the lesson`, () => {
      for (const t of studentText(l)) expect(t, t.slice(0, 80)).not.toMatch(INTERNAL)
    })
    it(`session ${l.session}: every citation is a verified register entry at pages inside its range`, () => {
      for (const c of lectureCitations(l)) {
        expect(() => getReading(c.reading), c.reading).not.toThrow()
        expect(citationInRange(c), `${c.reading} ${c.pages}`).toBe(true)
      }
    })
  }
  it('the worked examples keep their minutes; Session 2 has 22 min of lab launch and 47 of lecture', () => {
    const m = (l: Lecture, id: string) => allSlides(l).find((x) => x.id === id)!.minutes
    expect(m(WEEK10_SESSION1, 'w10s1-worked-logical')).toBeGreaterThanOrEqual(4)
    expect(m(WEEK10_SESSION1, 'w10s1-worked-scn002')).toBeGreaterThanOrEqual(6)
    expect(m(WEEK10_SESSION1, 'w10s1-decide-merge')).toBeGreaterThanOrEqual(4)
    expect(m(WEEK10_SESSION2, 'w10s2-worked-states')).toBeGreaterThanOrEqual(4)
    expect(WEEK10_SESSION2.sections.find((s) => s.id === 'w10s2-lab')!.slides.reduce((n, s) => n + s.minutes, 0)).toBe(22)
    expect(lectureMinutes(WEEK10_SESSION2) - 22).toBe(47)
  })
  it('negative direction: a slide over the density limit, a thin slide and an internal ID are caught', () => {
    const l = structuredClone(WEEK10_SESSION1)
    allSlides(l).find((x) => x.id === 'w10s1-worked-scn002')!.minutes = 1
    expect(tooDense(l)).toContain('w10s1-worked-scn002')
    const t = structuredClone(WEEK10_SESSION1)
    allSlides(t).find((x) => x.id === 'w10s1-action-def')!.notes.teach = ['Read the slide.']
    expect(tooThin(t)).toContain('w10s1-action-def')
    expect('see RB-8.1 for scoring').toMatch(INTERNAL)
    expect('as S10 slide 9 says').toMatch(INTERNAL)
    expect('objective W10.3').toMatch(INTERNAL)
    expect('as R72 says').toMatch(INTERNAL)
    expect('REQ-SYS-005, FN-002, LOG-005 and model v0.3').not.toMatch(INTERNAL)
  })
})

describe('Week 10 workload (8.0 h budget, proportional to team size)', () => {
  it('the stated rows sum to the total, and the total is within the budget', () => {
    const sum = Math.round(WORKLOAD_ROWS.reduce((a, r) => a + r.hours, 0) * 10) / 10
    expect(sum).toBe(WORKLOAD_TOTAL)
    expect(WORKLOAD_TOTAL).toBeLessThanOrEqual(WEEK10_BUDGET_HOURS)
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
})
