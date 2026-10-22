// Quiz explanations show slide numbers and titles to students, not raw slide IDs (review Week 6 n8); every Week 6 and
// Week 5 explanation that names a slide resolves; an unknown ID is left as written.
import { describe, expect, it } from 'vitest'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import { WEEK5_QUIZ } from '../content/quizWeek5'
import { WEEK6_QUIZ } from '../content/quizWeek6'
import { readableSlideRefs } from './quizText'

describe('readable slide references in quiz explanations', () => {
  it('a Week 6 slide id becomes its number and title', () => {
    const slides = allSlides(getLecture(6, 2)!)
    const i = slides.findIndex((s) => s.id === 'w6s2-anatomy')
    expect(readableSlideRefs('See Session 2, slide w6s2-anatomy; R105 p.530.')).toBe(`See Session 2, slide ${i + 1} “${slides[i].title}”; R105 p.530.`)
  })
  it('every Week 5 and Week 6 explanation shows no raw slide id to students', () => {
    for (const q of [...WEEK5_QUIZ, ...WEEK6_QUIZ]) for (const o of q.options) expect(readableSlideRefs(o.explanation), `${q.id}/${o.id}`).not.toMatch(/slide w\d+s[12]-/)
  })
  it('negative direction: an id that does not resolve is left as written', () => {
    expect(readableSlideRefs('slide w6s1-no-such-slide')).toBe('slide w6s1-no-such-slide')
  })
})
