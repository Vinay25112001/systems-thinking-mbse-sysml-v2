// Week 1 timing and pacing (review finding F01, F20). Each session plans 68–70 minutes of content and keeps a 5–7 minute
// buffer; spoken notes (teach, worked solution, figure walk) stay at or below 130 words per minute on every slide, pauses
// included; the worked concern-to-need demonstration gets at least 5 minutes; stakeholders get more Session 1 time than
// the life-cycle and process frame. Each rule is also shown able to fail.
import { describe, expect, it } from 'vitest'
import { allSlides, lectureMinutes, wordCount } from '../text'
import type { Lecture, Slide } from '../types'
import { WEEK01_SESSION1 } from './session1'
import { WEEK1_SESSION2 } from './session2'

const MAX_WPM = 130
const spokenWords = (s: Slide) => [...s.notes.teach, ...(s.notes.workedSolution ?? []), s.notes.figure ?? ''].reduce((n, t) => n + wordCount(t), 0)
const tooDense = (l: Lecture) => allSlides(l).filter((s) => s.minutes > 0 && spokenWords(s) / s.minutes > MAX_WPM).map((s) => s.id)
const sectionMinutes = (l: Lecture, id: string) => l.sections.find((s) => s.id === id)!.slides.reduce((n, s) => n + s.minutes, 0)

describe('Week 1 pacing', () => {
  for (const l of [WEEK01_SESSION1, WEEK1_SESSION2]) {
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
    it(`session ${l.session}: ends with the generated references-and-credits slide`, () => {
      const last = allSlides(l).at(-1)!
      expect(last.layout).toBe('references')
      expect(allSlides(l).filter((s) => s.layout === 'references')).toHaveLength(1)
    })
  }
  it('the worked concern-to-need demonstration gets at least 5 minutes, and the audit at least 4', () => {
    const s = allSlides(WEEK1_SESSION2)
    expect(s.find((x) => x.id === 's2-worked-steps')!.minutes).toBeGreaterThanOrEqual(5)
    expect(s.find((x) => x.id === 's2-worked-audit')!.minutes).toBeGreaterThanOrEqual(4)
  })
  it('Session 1 gives stakeholders more time than the life-cycle and process frame, and the sweep at least 5 minutes', () => {
    expect(sectionMinutes(WEEK01_SESSION1, 's1-stakeholders')).toBeGreaterThan(sectionMinutes(WEEK01_SESSION1, 's1-life-cycle') + sectionMinutes(WEEK01_SESSION1, 's1-teams'))
    expect(sectionMinutes(WEEK01_SESSION1, 's1-stakeholders')).toBeGreaterThanOrEqual(22)
    expect(allSlides(WEEK01_SESSION1).find((x) => x.id === 's1-lifecycle-sweep')!.minutes).toBeGreaterThanOrEqual(5)
  })
  it('a slide over the density limit is caught (negative direction)', () => {
    const l = structuredClone(WEEK1_SESSION2)
    const s = allSlides(l).find((x) => x.id === 's2-worked-steps')!
    s.minutes = 2
    expect(tooDense(l)).toContain('s2-worked-steps')
  })
})
