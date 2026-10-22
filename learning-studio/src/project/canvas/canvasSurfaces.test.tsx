// My Project canvas and Review & Submit student text (M6), strict like Guided Practice: every rule of
// learn/studentScan.ts, "goal" included, no ceiling. scripts/check-student-build.mjs runs the same scan on the student
// edition.
import { describe, expect, it } from 'vitest'
import { scanStudentText } from '../../week1/learn/studentScan'
import { visibleText } from '../../week1/learn/studentSurfaces'
import { canvasSurfaces } from './canvasSurfaces'

const pages = (await canvasSurfaces()).map((p) => ({ route: p.route, text: visibleText(p.html) }))

describe('My Project canvas and Review & Submit: student text (strict scan)', () => {
  it('covers every canvas part, the empty project, Review & Submit and every field guidance record', () => {
    expect(pages.map((p) => p.route)).toEqual(expect.arrayContaining(['/week/1/project', '/week/1/project/stakeholders', '/week/1/project/needs', '/week/1/project/assumptions', '/week/1/project (no project yet)', '/week/1/review', 'my project: field guidance (every field)']))
    expect(pages).toHaveLength(13)
    expect(pages.find((p) => p.route === '/week/1/project/stakeholders')!.text).toContain('STK-008') // input values are properties, not markup: the IDs show the rows rendered
    expect(pages.find((p) => p.route === '/week/1/review')!.text).toContain('Outstanding issues')
    expect(pages.reduce((a, p) => a + p.text.length, 0)).toBeGreaterThan(30000)
  })
  it('no internal code, slide pointer, rubric code, pending wording or "goal" on any of them', () => {
    const hits = pages.flatMap((p) => scanStudentText(p.text).map((h) => `${p.route} [${h.rule}] …${h.context}…`))
    expect(hits).toEqual([])
  })
  it('the scan can fail here too (mutation proof)', () => {
    expect(scanStudentText(`${pages[0].text} traces to the mission or a goal (RB-1.3)`).length).toBeGreaterThan(0)
  })
})
