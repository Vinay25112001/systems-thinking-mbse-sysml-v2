// Guided Practice is scanned like Learn (M5; review N6 follow-up): every task and step, before any answer and with every
// feedback block showing, with no ceiling: no register codes, slide or session pointers, rubric codes, stale lesson
// references, pending wording, and no "goal(s)" (students see "objectives", A25).
import { describe, expect, it } from 'vitest'
import { scanStudentText } from '../learn/studentScan'
import { visibleText } from '../learn/studentSurfaces'
import { practiceSurfaces } from './practiceSurfaces'
import { TASKS } from './tasks'

const pages = (await practiceSurfaces()).map((p) => ({ route: p.route, text: visibleText(p.html) }))

describe('Guided Practice student text (strict scan)', () => {
  it('covers every task and step in both states, with the feedback rendered', () => {
    expect(pages).toHaveLength(TASKS.reduce((a, t) => a + t.steps.length, 0) * 2 + 1)
    expect(pages.at(-1)!.text).toContain('objectives MGO-002 onward optional')
    const answered = pages.filter((p) => p.route.endsWith('answered')).map((p) => p.text).join(' ')
    for (const s of ['Compared with the instructor’s reading', 'A well-argued different answer can be defensible', 'Best supported answer', 'Passes the course check', 'Does not pass yet', 'Reasoning', 'Fictional teaching case', 'Now apply this to your own enterprise']) expect(answered, s).toContain(s)
  })

  it('has no banned string on any practice surface (no ceiling)', () => {
    const hits = pages.flatMap((p) => scanStudentText(p.text).map((h) => `${p.route} [${h.rule}] …${h.context}…`))
    expect(hits).toEqual([])
  })

  it('the scan would catch an injected code (mutation proof)', () => {
    expect(scanStudentText(`${pages[0].text} (RB-1.3) goal R11 p.553`).length).toBeGreaterThanOrEqual(3)
  })
})
