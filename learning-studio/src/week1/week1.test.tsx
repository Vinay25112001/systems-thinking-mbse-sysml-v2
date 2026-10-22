// Week 1 student path after M4 part A (DECISION_LOG A23–A25; spec §b.2, §c): routes and redirects, the five-stage bar,
// the Overview (approved objectives only, computed time, no internal codes), My Project / Lab (single source with
// WEEK1_LAB_INSTRUCTIONS.md) and Review & Submit (record readiness), plus the interim lecture gate.
import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import labMdFile from '../../docs/lectures/week01/WEEK1_LAB_INSTRUCTIONS.md?raw'
import { labMarkdown, LAB_PROCEDURE, LAB_RUBRIC_ROWS, rubricRow } from '../content/lab/week01Lab'
import { WEEKS } from '../content/course'
import { WEEK1_QUIZ } from '../content/quizWeek1'
import { saveJSON } from '../lib/storage'
import { Providers } from '../state/Providers'
import { WORKLOAD, WORKLOAD_ROWS } from '../content/week1Path'
import week01 from '../content/weeks/week01'
import { overviewTime, WEEK1_WORKLOAD_ACCEPTED } from './Overview'
import { LEARN_TO_LESSON, WEEK1_NAV, WEEK1_PATHS, week1LectureGate, week1Route, type Week1Route } from './route'
import Week1App from './Week1App'

beforeEach(() => window.localStorage.clear())

const page = (path: string) => {
  const r = week1Route(path) as Exclude<Week1Route, { redirect: string }>
  return render(
    <Providers>
      <Week1App route={r} path={path} />
    </Providers>,
  )
}

describe('Week 1 routes (NAV-10, NAV-12)', () => {
  it('maps the five stages and the lab tool', () => {
    expect(week1Route('/week/1')).toEqual({ page: 'overview' })
    expect(week1Route('/week/1/')).toEqual({ page: 'overview' })
    expect(week1Route('/week/1/learn')).toEqual({ page: 'learn' })
    expect(week1Route('/week/1/learn/ch06#ch06-03')).toEqual({ page: 'learn', chapter: 'ch06', section: 'ch06-03' })
    expect(week1Route('/week/1/learn/glossary')).toEqual({ page: 'learn', chapter: 'glossary' })
    expect(week1Route('/week/1/practice')).toEqual({ page: 'practice' })
    expect(week1Route('/week/1/project')).toEqual({ page: 'project' })
    expect(week1Route('/week/1/project/tool')).toEqual({ page: 'project-tool' })
    expect(week1Route('/week/1/review')).toEqual({ page: 'review' })
    expect(week1Route('/week/1/lecture/1')).toBeNull()
    expect(week1Route('/week/2')).toBeNull()
  })

  it('redirects every earlier route to its new stage (no 404)', () => {
    expect(week1Route('/week/1/overview')).toEqual({ redirect: '/week/1' })
    expect(week1Route('/week/1/classic')).toEqual({ redirect: '/week/1' })
    expect(week1Route('/week/1/lesson')).toEqual({ redirect: '/week/1/learn' })
    expect(week1Route('/week/1/lesson/s1-lesson-stakeholders')).toEqual({ redirect: '/week/1/learn/ch06#ch06-01' })
    expect(week1Route('/week/1/lesson/w01.lesson.s2-l-case-needs')).toEqual({ redirect: '/week/1/learn/ch09#ch09-07' })
    expect(week1Route('/week/1/examples')).toEqual({ redirect: '/week/1/learn/ch06#ch06-07' })
    expect(week1Route('/week/1/examples/practice')).toEqual({ redirect: '/week/1/practice' })
    expect(week1Route('/week/1/lab')).toEqual({ redirect: '/week/1/project' })
    expect(week1Route('/week/1/lab/tool')).toEqual({ redirect: '/week/1/project/tool' })
    expect(week1Route('/week/1/assessment')).toEqual({ redirect: '/week/1/review' })
    expect(week1Route('/week/1/check')).toEqual({ redirect: '/week/1/review' })
    expect(week1Route('/week/1/learn/l3')).toEqual({ redirect: `/week/1/learn/ch04#ch04-01` })
    expect(LEARN_TO_LESSON.l3).toBe('s1-lesson-boundary')
    expect(week1Route('/week/1/learn/w1-ch06-03')).toEqual({ redirect: '/week/1/learn/ch06#ch06-03' })
    expect(week1Route('/week/1/learn/w1-ch02')).toEqual({ redirect: '/week/1/learn/ch02' })
    expect(week1Route('/week/1/learn/nonsense')).toEqual({ redirect: '/week/1/learn' })
  })

  it('the lecture viewer, handout and slides open only for the instructor edition with instructor view on (interim gate)', () => {
    expect(week1LectureGate('/week/1/lecture/1/5', false)).toBe('/week/1/learn/from-slide/1/5')
    expect(week1LectureGate('/week/1/lecture/2', false)).toBe('/week/1/learn/from-slide/2')
    expect(week1LectureGate('/week/1/lecture/2/handout', false)).toBe('/week/1/learn/from-slide/2')
    expect(week1LectureGate('/week/1/lecture/1/5', true)).toBeNull()
    expect(week1LectureGate('/week/2/lecture/1', false)).toBeNull()
  })

  it('the stage bar has the five stages in path order and marks exactly one current', () => {
    expect(WEEK1_NAV.map((n) => n.label)).toEqual(['Overview', 'Learn', 'Guided Practice', 'My Project / Lab', 'Review & Submit'])
    for (const [p, id] of [['/week/1', 'overview'], ['/week/1/learn/ch04', 'learn'], ['/week/1/practice', 'practice'], ['/week/1/project/tool', 'project'], ['/week/1/review', 'review']])
      expect(WEEK1_NAV.filter((n) => n.match(p)).map((n) => n.id), p).toEqual([id])
    expect(WEEK1_NAV.some((n) => /lecture|lesson|example/i.test(n.label + n.to))).toBe(false)
  })
})

describe('Week 1 Overview (spec §c, OV-01, OV-02)', () => {
  it('shows the title, approved objectives only, what the team creates, later use, computed time and the reading plan', () => {
    page('/week/1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Week 1 · Team formation, needs and identifying stakeholders')
    const obj = within(screen.getByTestId('ov-objectives')).getAllByRole('listitem')
    expect(obj).toHaveLength(WEEKS[0].objectives.length)
    const ov = screen.getByTestId('week1-overview')
    // OV-02: no internal codes, slide numbers or pending decisions
    expect(ov.textContent).not.toMatch(/\bB1\.\d|\bL\d\b|\bRB-|slide \d|proposed|pending faculty|\bR\d{2}[a-z]? p/i)
    // OV-01: no lecture cards or decks
    expect(ov.querySelector('a[href$=".pptx"]')).toBeNull()
    expect(within(ov).queryByText(/Lecture slides/)).toBeNull()
    expect(screen.getByTestId('ov-create')).toHaveTextContent('at least 8 stakeholders')
    expect(screen.getByTestId('ov-later')).toHaveTextContent('Week 8 imports your stakeholders')
    expect(screen.getByTestId('ov-reading-plan')).toHaveTextContent('chapters 1–6 and 11')
    expect(screen.getByTestId('ov-time-total')).toHaveTextContent(overviewTime().total.toFixed(1))
    expect(screen.getByTestId('ov-start')).toHaveAttribute('href', '#/week/1/learn/ch01')
    expect(screen.getByTestId('week-nav-overview')).toHaveAttribute('aria-current', 'step')
  })

  it('computes the time from the content (Learn words at 150 wpm), never a hard-coded number', () => {
    const t = overviewTime()
    expect(t.words).toBeGreaterThan(9000)
    expect(t.rows.find((r) => r.what.startsWith('Learn'))!.hours).toBeCloseTo(t.words / 150 / 60, 5)
  })

  it('counts every required activity of the stated workload, lists optional practice apart (review F2)', () => {
    const t = overviewTime()
    // one row per required stated row (weeks/week01.ts workload, the canonical model), and none of the optional ones
    const stated = week01.workload.filter((w) => !w.optional)
    expect(t.rows.map((r) => r.id)).toEqual(['class', 'learn', 'readings', 'candidate', 'team', 'quiz', 'grad', 'log'])
    expect(t.rows).toHaveLength(stated.length)
    // every row other than Learn equals its stated (and content-checked) value; Learn is the textbook as shown
    const byId = Object.fromEntries(t.rows.map((r) => [r.id, r.hours]))
    expect(byId.class).toBe(WORKLOAD_ROWS.class.hours)
    expect(byId.readings).toBeCloseTo(WORKLOAD_ROWS.readings.hours, 5)
    expect(byId.candidate).toBe(WORKLOAD_ROWS.candidate.hours)
    expect(byId.team).toBe(WORKLOAD_ROWS.team.hours)
    expect(byId.quiz).toBe(WORKLOAD_ROWS.quiz.hours)
    expect(byId.grad).toBe(WORKLOAD_ROWS.grad.hours)
    expect(byId.log).toBe(WORKLOAD_ROWS.log.hours)
    // the total is the stated model with the Learn row in place of the old lesson row: practice is never added
    expect(t.total).toBeCloseTo(WORKLOAD.total - WORKLOAD_ROWS.lesson.hours + t.words / 150 / 60, 5)
    expect(t.optional.map((r) => r.id)).toEqual(['practice'])
    // week1-m5: the optional row is the six Guided Practice tasks (spec §e.2: 96 min), not the retired missions 1–4
    expect(t.optional[0].hours).toBeCloseTo(96 / 60, 5)
    expect(t.budget).toBe(8)
    // student view: the honest total and the optional row, no budget talk
    page(WEEK1_PATHS.overview)
    expect(screen.getByTestId('ov-time-total')).toHaveTextContent(`${(Math.round(t.total * 10) / 10).toFixed(1)} h`)
    expect(screen.getByTestId('ov-time-optional')).toHaveTextContent('optional, not counted in the total')
  })

  // week1-m4b: A26 accepted 8.1 h (Learn 13,311 words). M4 part B filled the seventeen textbook gaps; faculty then decided
  // (2026-10-21, "mark some sections optional") to label the M4b review's packages A–C as extension reading, optional and
  // not counted. Learn's required words now exclude them, and the COMPUTED total is 8.5 h. It is pinned so that further
  // growth fails again; it remains above A26's 8.1 h and is reported to faculty (M4B_REPORT.md §5). Nothing was deleted.
  // WEEK1_WORKLOAD_ACCEPTED keeps the A26 decision as recorded.
  it('states the computed total honestly (8.5 h after M4b with extension reading not counted; A26 accepted 8.1 h, reopened) and no budget flag renders in any mode', () => {
    const t = overviewTime()
    expect(Math.round(t.total * 10) / 10).toBe(8.5)
    expect(WEEK1_WORKLOAD_ACCEPTED.hours).toBe(8.1)
    expect(WEEK1_WORKLOAD_ACCEPTED.decision).toBe('DECISION_LOG A26')
    saveJSON('instructor', true)
    page(WEEK1_PATHS.overview)
    expect(screen.getByTestId('ov-time-total')).toHaveTextContent('8.5 h')
    expect(screen.getByTestId('week1-overview').textContent).not.toMatch(/over the .*budget|Faculty note|A26/)
  })
})

describe('Lab instructions (M6: their own page; My Project / Lab is the canvas)', () => {
  it('the page and WEEK1_LAB_INSTRUCTIONS.md come from one source (run `npm run lab:md` after changing week01Lab.ts)', () => {
    expect(labMdFile.replace(/\r\n/g, '\n')).toBe(labMarkdown())
  })

  it('shows purpose, inputs, objectives, method, every procedure step, outputs, the rubric rows, submission and workload', () => {
    page(`${WEEK1_PATHS.project}/instructions`)
    expect(screen.getByText('Week 1 · My Project / Lab')).toBeInTheDocument()
    for (const id of ['lab-inputs', 'lab-objectives', 'lab-method', 'lab-procedure', 'lab-outputs', 'lab-rubric', 'lab-submission', 'lab-tool', 'lab-workload']) expect(screen.getByTestId(id)).toBeInTheDocument()
    for (const p of LAB_PROCEDURE) expect(screen.getByTestId('lab-procedure')).toHaveTextContent(p.step)
    const rubric = screen.getByTestId('record-rubric')
    for (const [rb, c] of LAB_RUBRIC_ROWS) expect(rubric).toHaveTextContent(`${rb}.${c.split('.')[1]} ${rubricRow(rb, c)[1]}`)
    expect(screen.getByTestId('open-lab-tool')).toHaveAttribute('href', '#/week/1/project')
    expect(screen.getByTestId('model-inputs-map')).toHaveTextContent('concern')
    expect(screen.getByTestId('record-readiness')).toHaveAttribute('data-state', 'not-ready')
    expect(screen.getByTestId('week-nav-project')).toHaveAttribute('aria-current', 'step')
  })
})

describe('Review & Submit (M6: the package review of the team project)', () => {
  it('without a project it asks for the project first; the package review itself is tested in src/project/canvas/canvas.test.tsx', async () => {
    page(WEEK1_PATHS.review)
    expect(await screen.findByTestId('review-no-project')).toHaveTextContent('Create your team’s project in My Project first')
    expect(screen.getAllByRole('heading', { level: 1 })[0]).toHaveTextContent('Review & Submit')
    expect(WEEK1_QUIZ.length).toBeGreaterThan(0)
  })
})

describe('Student chrome (NAV-02, X14)', () => {
  it('shows no instructor checkbox to students and carries the five stages', () => {
    page('/week/1')
    expect(screen.queryByText(/Instructor mode/)).toBeNull()
    expect(screen.getByTestId('week-nav')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'App menu' })).toBeInTheDocument()
  })
})
