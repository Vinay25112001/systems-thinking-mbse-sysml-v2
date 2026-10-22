// Every student-visible Week 1 surface (review M4A F1, F3, F7; confirmation N3, N6): each Learn chapter with its checks,
// common errors, reference rail and "Used later", the back matter (references, glossary, Week 1 in one page), the
// Overview, the homepage, the knowledge-check feedback shown after an answer, and the stages M5/M6 rebuild (Guided
// Practice, My Project / Lab and its lab tool, Review & Submit, plus the Week 1 mission texts), each with its alt,
// aria-label and title attributes. Rendered here in the instructor edition with the faculty gap boxes removed;
// scripts/check-student-build.mjs runs the same scan on the student edition.
import { describe, expect, it } from 'vitest'
import missionsSource from '../../content/missions/week01.ts?raw'
import stakeholderChecksSource from '../../workbench/week1/stakeholders.ts?raw'
import { WEEK01_SESSION1 } from '../../content/lectures/week01/session1'
import { WEEK1_SESSION2 } from '../../content/lectures/week01/session2'
import { DEFERRED_STAGE_HITS, GOAL_ALLOWED, scanStudentText, violations } from './studentScan'
import { studentSurfaces, studentWorkbenchSurfaces, visibleText } from './studentSurfaces'
import { studentText, studentWording } from './studentText'

const surfaces = [...studentSurfaces(), ...(await studentWorkbenchSurfaces())].map((s) => ({ route: s.route, text: visibleText(s.html) }))
const deferred = (route: string) => route in DEFERRED_STAGE_HITS

describe('Student-visible Week 1 text (F1, F3, F7, N6)', () => {
  it('covers every Learn route, the back matter, the Overview, the homepage, the other stages and the check feedback', () => {
    const routes = surfaces.map((s) => s.route)
    expect(routes).toEqual(
      expect.arrayContaining(['/', '/week/1', '/week/1/learn/ch01', '/week/1/learn/ch11', '/week/1/learn/refs', '/week/1/learn/glossary', '/week/1/learn/summary', '/week/1/project', '/week/1/project/instructions', '/week/1/review', 'practice and lab tool: Week 1 mission texts', 'learn: knowledge-check feedback']),
    )
    expect(routes).toHaveLength(32) // m6: the Lab brief page, 10 canvas parts, the empty canvas, Review & Submit, field guidance
    const ch06 = surfaces.find((s) => s.route === '/week/1/learn/ch06')!.text
    // the scan reads the whole page: rail, common errors and checks, not only the chapter body, and the attributes
    for (const part of ['AeroLink at a glance', 'Common errors', 'Check your understanding', 'Used later', 'Week 1 chapters']) expect(ch06).toContain(part)
    expect(surfaces.find((s) => s.route === '/week/1/project/instructions')!.text.length).toBeGreaterThan(10000)
    expect(surfaces.find((s) => s.route === '/week/1/review')!.text.length).toBeGreaterThan(5000)
  })

  it('Learn, the Overview and the homepage: no internal codes, slide pointers, rubric codes, stale references, option letters or pending wording', () => {
    const hits = surfaces.filter((s) => !deferred(s.route)).flatMap((s) => scanStudentText(s.text).filter((h) => h.rule !== 'goal-term').map((h) => `${s.route} [${h.rule}] …${h.context}…`))
    expect(hits).toEqual([])
  })

  it('the stages M5/M6 rebuild stay within their recorded ceilings: no new rule, no count above the 2026-10-21 baseline', () => {
    expect(surfaces.filter((s) => deferred(s.route)).flatMap((s) => violations(s.route, s.text))).toEqual([])
    // the checker messages of Guided Practice no longer cite the rubric code (review N6)
    expect(stakeholderChecksSource).not.toMatch(/\(RB-1\.3\)/)
    expect(missionsSource).not.toMatch(/developing level of RB-1\.3/)
    // a ceiling is a ceiling: one more hit fails
    const project = surfaces.find((s) => s.route === '/week/1/project/instructions')!
    expect(violations(project.route, `${project.text} (slide 9)`).length).toBe(1)
  })

  it('says “objectives” for the course’s MGO-002…: no “goal(s)” outside quotations and the listed source passages (A25)', () => {
    const hits = surfaces.filter((s) => !deferred(s.route)).flatMap((s) => scanStudentText(s.text).filter((h) => h.rule === 'goal-term').map((h) => `${s.route}: …${h.context}…`))
    expect(hits).toEqual([])
    // every allowed passage is still in use (a stale allowance would hide nothing, but must not linger)
    const all = surfaces.map((s) => s.text).join(' ')
    for (const a of GOAL_ALLOWED) expect(all, a.text).toContain(a.text)
    // body and rail use the same term (F1: 6.7 said "Goals:" while the rail said "Objective MGO-002")
    expect(surfaces.find((s) => s.route === '/week/1/learn/ch06')!.text).toContain('Objectives: MGO-002')
    expect(surfaces.find((s) => s.route === '/week/1/learn/ch05')!.text).toContain('Objective MGO-002')
  })

  it('the scan can fail: each banned form is caught when injected (mutation proof)', () => {
    for (const bad of ['traces to the mission or a goal', 'Goal MGO-003', '(slide 9)', '(next slide)', '(RB-1.3)', 'in the Session 2 lesson', 'The answer is therefore C', 'the brief below', 'pending faculty approval', 'R11 p.553']) {
      expect(scanStudentText(`Some text ${bad} here.`).length, bad).toBeGreaterThan(0)
    }
    expect(studentText('every need traces to the mission or a goal (slide 9).')).toBe('every need traces to the mission or an objective.')
    expect(studentText('Goal MGO-003; Goals: MGO-002 short waits')).toBe('Objective MGO-003; Objectives: MGO-002 short waits')
    expect(scanStudentText('SEBoK: “a definite mission, goals, and objectives”.')).toEqual([])
  })
})

describe('Student wording never changes a quotation (confirmation N3)', () => {
  it('leaves every “…” span verbatim, by construction', () => {
    // synthetic: course forms inside a quotation stay, the same forms outside are rewritten
    expect(studentWording('SEBoK: “the mission or a goal of the enterprise”; the mission or a goal.')).toBe('SEBoK: “the mission or a goal of the enterprise”; the mission or an objective.')
    expect(studentWording('“Mission and goals” (slide 9) and “Goal MGO-003”')).toBe('“Mission and goals” and “Goal MGO-003”')
    // corpus: every quoted span in every Week 1 lesson string survives unchanged
    const texts = [WEEK01_SESSION1, WEEK1_SESSION2].flatMap((l) =>
      l.studentLesson.flatMap((s) =>
        s.blocks.flatMap((b) => {
          if (b.kind === 'para' || b.kind === 'callout' || b.kind === 'definition') return [b.text]
          if (b.kind === 'bullets') return b.items.flatMap((i) => (typeof i === 'string' ? [i] : [i.text, ...i.sub]))
          if (b.kind === 'table') return [...b.rows.flat(), b.caption ?? '']
          return []
        }),
      ),
    )
    let spans = 0
    for (const t of texts)
      for (const q of t.match(/“[^”]*”/g) ?? []) {
        spans++
        expect(studentWording(t), q).toContain(q)
      }
    expect(spans).toBeGreaterThan(50)
  })

  it('6.5 keeps only the new item of its cut sentence, with no dangling referent (N4)', () => {
    expect(studentWording('The course register combines the two: a role group, the life-cycle stage of main involvement, internal or external, whether it is an approving authority, its concerns, interest and influence each with a reason, and its level of support with a reason.')).toBe(
      'The course register also records each stakeholder’s level of support, with a reason.',
    )
    expect(surfaces.find((s) => s.route === '/week/1/learn/ch06')!.text).toContain('The course register also records each stakeholder’s level of support, with a reason.')
    expect(surfaces.find((s) => s.route === '/week/1/learn/ch06')!.text).not.toContain('combines the two')
  })

  it('the needs-catalog legend and column use the objective short form (N5) and the 10.4 note means the footnotes (N7)', () => {
    const ch09 = surfaces.find((s) => s.route === '/week/1/learn/ch09')!.text
    expect(ch09).toContain('O3 = MGO-003')
    expect(ch09).not.toContain('G3 = MGO-003')
    expect(surfaces.find((s) => s.route === '/week/1/learn/ch10')!.text).toContain('is sourced in the footnotes')
  })
})
