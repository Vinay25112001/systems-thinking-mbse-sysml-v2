// Week 1 Session 2 structure checks (the shared validator in lectures.test.ts covers the pipeline rules).
import { describe, expect, it } from 'vitest'
import { isRegisteredFigure } from '../../../components/figures/registry'
import { allSlides, lectureMinutes, slideBodyWords } from '../text'
import { validateLecture } from '../validate'
import { getLecture } from '../index'
import { WEEK1_SESSION2, SESSION2_REVIEW } from './session2'

const slides = allSlides(WEEK1_SESSION2)

describe('Week 1 Session 2', () => {
  it('is registered as week 1, session 2, is course content and is pending review', () => {
    expect(getLecture(1, 2)).toBe(WEEK1_SESSION2)
    expect(WEEK1_SESSION2.fixture).toBeUndefined()
    expect(SESSION2_REVIEW).toBe('new-pending-review')
  })
  it('validates clean', () => {
    expect(validateLecture(WEEK1_SESSION2)).toEqual([])
  })
  it('has 23 slides: 18 lecture slides (48 min), 4 lab-launch slides (22 min) and the generated references; 5-minute buffer', () => {
    expect(slides).toHaveLength(23)
    expect(lectureMinutes(WEEK1_SESSION2)).toBe(70)
    expect(WEEK1_SESSION2.bufferMinutes).toBe(5)
    const lab = WEEK1_SESSION2.sections.find((s) => s.id === 's2-lab')!
    expect(lab.slides.filter((s) => s.layout !== 'references')).toHaveLength(4)
    expect(lab.slides.reduce((n, s) => n + s.minutes, 0)).toBe(22)
  })
  it('every slide stays in the word budget, and every lecture slide is cited', () => {
    for (const s of slides) {
      expect(slideBodyWords(s), s.id).toBeLessThanOrEqual(60)
      if (!['s2-lab-brief', 's2-lab-close', 's2-references'].includes(s.id)) expect(s.sources.length, s.id).toBeGreaterThan(0)
    }
  })
  it('every figure is registered and every figured slide explains its figure', () => {
    for (const s of slides) {
      if (!s.figure) continue
      expect(isRegisteredFigure(s.figure.id), s.id).toBe(true)
      expect(s.notes.figure, s.id).toBeTruthy()
    }
  })
  it('uses American spelling in slides, notes and lesson', () => {
    expect(JSON.stringify(WEEK1_SESSION2)).not.toMatch(/\b(centre|neighbour|utilis|organis|colour|behaviour|favour|modell|programme|licence|prioritis|analys(e|ing)\b)/i)
  })
})
