// Every slide and lesson section the Week 7 worked-examples page shows must exist in the registered lectures, so a
// renamed slide or section fails here rather than silently dropping out of the page; the Week 7 routes and aliases resolve.
import { describe, expect, it } from 'vitest'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import { EXAMPLE_PARTS } from './exampleParts'
import { week7Route, WEEK7_PATHS } from './route'

describe('Week 7 worked-example parts', () => {
  it('both Week 7 sessions are registered', () => {
    expect(getLecture(7, 1)).toBeDefined()
    expect(getLecture(7, 2)).toBeDefined()
  })
  it('has four parts with unique ids, each with at least one slide and one lesson section', () => {
    expect(EXAMPLE_PARTS.map((p) => p.id)).toEqual(['package', 'audit', 'defend', 'rids'])
    for (const p of EXAMPLE_PARTS) {
      expect(p.slides.length, p.id).toBeGreaterThan(0)
      expect(p.lessons.length, p.id).toBeGreaterThan(0)
    }
  })
  it('every slide id and lesson id resolves in its session', () => {
    const missing: string[] = []
    for (const p of EXAMPLE_PARTS) {
      for (const s of p.slides) if (!allSlides(getLecture(7, s.session)!).some((x) => x.id === s.id)) missing.push(`${p.id}: slide ${s.id}`)
      for (const s of p.lessons) if (!getLecture(7, s.session)!.studentLesson.some((x) => x.id === s.id)) missing.push(`${p.id}: lesson ${s.id}`)
    }
    expect(missing).toEqual([])
  })
})

describe('Week 7 routes', () => {
  it('routes every page and the aliases', () => {
    for (const [page, path] of Object.entries(WEEK7_PATHS)) {
      expect(week7Route(path)).toEqual({ page })
      expect(week7Route(`${path}/`)).toEqual({ page })
    }
    expect(week7Route('/week/7/classic')).toEqual({ redirect: '/week/7' })
    expect(week7Route('/week/7/overview')).toEqual({ redirect: '/week/7' })
    expect(week7Route('/week/7/practice')).toEqual({ redirect: '/week/7/lab' })
    expect(week7Route('/week/7/check')).toEqual({ redirect: '/week/7/assessment' })
    expect(week7Route('/week/7/lecture/1')).toBeNull()
    expect(week7Route('/week/6')).toBeNull()
    expect(week7Route('/archive/week/7')).toBeNull()
  })
})
