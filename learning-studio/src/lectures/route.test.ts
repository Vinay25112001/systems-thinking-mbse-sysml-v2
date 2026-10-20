import { describe, expect, it } from 'vitest'
import { flowRoute } from '../flow/route'
import { handoutPath, lectureRoute, lessonPath, viewerPath } from './route'

describe('lecture routes', () => {
  it('parses the viewer, handout, reader and figure canvas routes', () => {
    expect(lectureRoute('/week/1/lecture/1')).toEqual({ kind: 'viewer', week: 1, session: 1, slide: undefined })
    expect(lectureRoute('/week/12/lecture/2/7')).toEqual({ kind: 'viewer', week: 12, session: 2, slide: 7 })
    expect(lectureRoute('/week/1/lecture/1/handout')).toEqual({ kind: 'handout', week: 1, session: 1 })
    expect(lectureRoute('/week/1/lesson')).toEqual({ kind: 'lesson', week: 1, section: undefined })
    expect(lectureRoute('/week/1/lesson/fx-lesson-context/')).toEqual({ kind: 'lesson', week: 1, section: 'fx-lesson-context' })
    expect(lectureRoute('/figure/open-system')).toEqual({ kind: 'figure', id: 'open-system' })
  })
  it('leaves every other route alone, and the Week 1 flow does not claim lecture routes', () => {
    for (const p of ['/', '/week/1', '/week/1/learn/l1', '/week/1/lecture', '/week/1/lecture/x', '/sources/R02/264', '/figure/Bad_Id']) expect(lectureRoute(p)).toBeNull()
    for (const p of ['/week/1/lecture/1', '/week/1/lesson', '/week/1/lecture/1/handout']) expect(flowRoute(p)).toBeNull()
  })
  it('builds paths the parser reads back', () => {
    expect(lectureRoute(viewerPath(3, 2, 4))).toEqual({ kind: 'viewer', week: 3, session: 2, slide: 4 })
    expect(lectureRoute(handoutPath(3, 2))?.kind).toBe('handout')
    expect(lectureRoute(lessonPath(3, 'a-b'))).toEqual({ kind: 'lesson', week: 3, section: 'a-b' })
  })
})
