// Student-facing text of a quiz explanation (review Week 6 n8, a cross-week fix): explanations are authored with slide IDs
// ("Session 2, slide w6s2-anatomy") so that the quiz tests can check every reference resolves; students read the slide's
// number and title instead ("Session 2, slide 8 “Anatomy of a roadmap”"). An ID that does not resolve is left as written.
// Kept apart from Quiz.tsx so that the component file exports components only (fast refresh).
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'

const SLIDE_REF = /\bslide (w(\d+)s([12])-[a-z0-9-]+)/g

/** Replaces each "slide w6s1-…" reference with the slide's number and title in its lecture. */
export function readableSlideRefs(text: string): string {
  return text.replace(SLIDE_REF, (whole, id: string, week: string, session: string) => {
    const lecture = getLecture(Number(week), Number(session))
    if (!lecture) return whole
    const slides = allSlides(lecture)
    const i = slides.findIndex((s) => s.id === id)
    return i < 0 ? whole : `slide ${i + 1} “${slides[i].title}”`
  })
}
