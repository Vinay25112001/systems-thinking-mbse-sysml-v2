// Every slide and lesson section the Week 6 worked-examples page shows must exist in the registered lectures, so a
// renamed slide or section fails here rather than silently dropping out of the page.
import { describe, expect, it } from 'vitest'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import { EXAMPLE_PARTS } from './exampleParts'
import { week6Route, WEEK6_PATHS } from './route'

describe('Week 6 worked-example parts', () => {
  it('both Week 6 sessions are registered', () => {
    expect(getLecture(6, 1)).toBeDefined()
    expect(getLecture(6, 2)).toBeDefined()
  })

  it('has five parts with unique ids, each with at least one slide and one lesson section', () => {
    expect(EXAMPLE_PARTS.map((p) => p.id)).toEqual(['gaps', 'technology', 'increments', 'security', 'impact'])
    for (const p of EXAMPLE_PARTS) {
      expect(p.slides.length, p.id).toBeGreaterThan(0)
      expect(p.lessons.length, p.id).toBeGreaterThan(0)
    }
  })

  it('every slide id resolves in its session', () => {
    const missing: string[] = []
    for (const p of EXAMPLE_PARTS)
      for (const s of p.slides) {
        const l = getLecture(6, s.session)
        if (!l || !allSlides(l).some((x) => x.id === s.id)) missing.push(`${p.id}: session ${s.session} slide ${s.id}`)
      }
    expect(missing).toEqual([])
  })

  it('every lesson id resolves in its session', () => {
    const missing: string[] = []
    for (const p of EXAMPLE_PARTS)
      for (const s of p.lessons) {
        const l = getLecture(6, s.session)
        if (!l || !l.studentLesson.some((x) => x.id === s.id)) missing.push(`${p.id}: session ${s.session} lesson ${s.id}`)
      }
    expect(missing).toEqual([])
  })
})

describe('Week 6 routes', () => {
  it('routes every page and the aliases', () => {
    for (const [page, path] of Object.entries(WEEK6_PATHS)) {
      expect(week6Route(path)).toEqual({ page })
      expect(week6Route(`${path}/`)).toEqual({ page })
    }
    expect(week6Route('/week/6/classic')).toEqual({ redirect: '/week/6' })
    expect(week6Route('/week/6/overview')).toEqual({ redirect: '/week/6' })
    expect(week6Route('/week/6/practice')).toEqual({ redirect: '/week/6/lab' })
    expect(week6Route('/week/6/check')).toEqual({ redirect: '/week/6/assessment' })
    expect(week6Route('/week/6/lecture/1')).toBeNull()
    expect(week6Route('/week/5')).toBeNull()
    expect(week6Route('/archive/week/6')).toBeNull()
  })
})
