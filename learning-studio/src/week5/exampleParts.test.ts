// Every slide and lesson section the Week 5 worked-examples page shows must exist in the registered lectures, so a
// renamed slide or section fails here rather than silently dropping out of the page.
import { describe, expect, it } from 'vitest'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import { EXAMPLE_PARTS } from './exampleParts'
import { week5Route, WEEK5_PATHS } from './route'

describe('Week 5 worked-example parts', () => {
  it('both Week 5 sessions are registered', () => {
    expect(getLecture(5, 1)).toBeDefined()
    expect(getLecture(5, 2)).toBeDefined()
  })

  it('has six parts with unique ids, each with at least one slide and one lesson section', () => {
    expect(EXAMPLE_PARTS.map((p) => p.id)).toEqual(['breakdown', 'n2', 'definitions', 'management', 'security', 'audit'])
    for (const p of EXAMPLE_PARTS) {
      expect(p.slides.length, p.id).toBeGreaterThan(0)
      expect(p.lessons.length, p.id).toBeGreaterThan(0)
    }
  })

  it('every slide id resolves in its session', () => {
    const missing: string[] = []
    for (const p of EXAMPLE_PARTS)
      for (const s of p.slides) {
        const l = getLecture(5, s.session)
        if (!l || !allSlides(l).some((x) => x.id === s.id)) missing.push(`${p.id}: session ${s.session} slide ${s.id}`)
      }
    expect(missing).toEqual([])
  })

  it('every lesson id resolves in its session', () => {
    const missing: string[] = []
    for (const p of EXAMPLE_PARTS)
      for (const s of p.lessons) {
        const l = getLecture(5, s.session)
        if (!l || !l.studentLesson.some((x) => x.id === s.id)) missing.push(`${p.id}: session ${s.session} lesson ${s.id}`)
      }
    expect(missing).toEqual([])
  })
})

describe('Week 5 routes', () => {
  it('routes every page and the aliases', () => {
    for (const [page, path] of Object.entries(WEEK5_PATHS)) {
      expect(week5Route(path)).toEqual({ page })
      expect(week5Route(`${path}/`)).toEqual({ page })
    }
    expect(week5Route('/week/5/classic')).toEqual({ redirect: '/week/5' })
    expect(week5Route('/week/5/overview')).toEqual({ redirect: '/week/5' })
    expect(week5Route('/week/5/practice')).toEqual({ redirect: '/week/5/lab' })
    expect(week5Route('/week/5/check')).toEqual({ redirect: '/week/5/assessment' })
    expect(week5Route('/week/5/lecture/1')).toBeNull()
    expect(week5Route('/week/4')).toBeNull()
    expect(week5Route('/archive/week/5')).toBeNull()
  })
})
