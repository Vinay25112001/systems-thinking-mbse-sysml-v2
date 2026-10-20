// Week 1 on the lecture-first path (DECISION_LOG A20, 2026-10-19): routes and redirects, the week navigation, the week
// page (entries in path order, workload), the worked examples (slides and lesson sections resolve), the laboratory
// (single source with WEEK1_LAB_INSTRUCTIONS.md), the assessment (record readiness) and the lesson self-checks.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import labMdFile from '../../docs/lectures/week01/WEEK1_LAB_INSTRUCTIONS.md?raw'
import { labMarkdown, LAB_PROCEDURE, LAB_RUBRIC_ROWS, rubricRow } from '../content/lab/week01Lab'
import { getLecture, weekLesson } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import { LEARN_SECTIONS } from '../content/learn/week01'
import { WEEK1_QUIZ } from '../content/quizWeek1'
import { WORKLOAD } from '../content/week1Path'
import week01 from '../content/weeks/week01'
import LessonReader from '../lectures/LessonReader'
import { loadJSON, saveJSON } from '../lib/storage'
import { Providers } from '../state/Providers'
import { TEAM_KEY } from '../workbench/week1/team'
import { TEAM_FIXTURE } from '../workbench/week1/teamFixture'
import { TRY_CONCERN, TRY_NEED } from './Examples'
import { EXAMPLE_PARTS } from './exampleParts'
import { LEARN_TO_LESSON, WEEK1_NAV, WEEK1_PATHS, week1Route } from './route'
import Week1App from './Week1App'

beforeEach(() => window.localStorage.clear())

const page = (p: Parameters<typeof Week1App>[0]['page']) =>
  render(
    <Providers>
      <Week1App page={p} path={WEEK1_PATHS[p]} />
    </Providers>,
  )

describe('Week 1 routes', () => {
  it('maps the lecture-first pages and leaves the viewer and reader to the lecture router', () => {
    expect(week1Route('/week/1')).toEqual({ page: 'home' })
    expect(week1Route('/week/1/')).toEqual({ page: 'home' })
    expect(week1Route('/week/1/examples')).toEqual({ page: 'examples' })
    expect(week1Route('/week/1/examples/practice')).toEqual({ page: 'practice' })
    expect(week1Route('/week/1/lab')).toEqual({ page: 'lab' })
    expect(week1Route('/week/1/lab/tool')).toEqual({ page: 'lab-tool' })
    expect(week1Route('/week/1/assessment')).toEqual({ page: 'assessment' })
    expect(week1Route('/week/1/lecture/1')).toBeNull()
    expect(week1Route('/week/1/lesson')).toBeNull()
    expect(week1Route('/week/2')).toBeNull()
  })

  it('redirects every self-study route to its new equivalent', () => {
    expect(week1Route('/week/1/overview')).toEqual({ redirect: '/week/1' })
    expect(week1Route('/week/1/classic')).toEqual({ redirect: '/week/1' })
    expect(week1Route('/week/1/learn')).toEqual({ redirect: '/week/1/lesson' })
    expect(week1Route('/week/1/learn/summary')).toEqual({ redirect: '/week/1/lesson' })
    expect(week1Route('/week/1/learn/l3')).toEqual({ redirect: `/week/1/lesson/${LEARN_TO_LESSON.l3}` })
    expect(week1Route('/week/1/practice')).toEqual({ redirect: '/week/1/lab' })
    expect(week1Route('/week/1/check')).toEqual({ redirect: '/week/1/assessment' })
  })

  it('every Learn section maps to a lesson section that exists, so its check has a home in the reader', () => {
    const ids = new Set(weekLesson(1).map((p) => p.section.id))
    for (const s of LEARN_SECTIONS) expect(ids.has(LEARN_TO_LESSON[s.id]), `${s.id} → ${LEARN_TO_LESSON[s.id]}`).toBe(true)
  })

  it('the week navigation has the six sections in path order and marks exactly one current', () => {
    expect(WEEK1_NAV.map((n) => n.label)).toEqual(['Overview', 'Lecture', 'Lesson', 'Worked examples', 'Laboratory', 'Assessment'])
    for (const [p, id] of [['/week/1', 'overview'], ['/week/1/lecture/2/5', 'lecture'], ['/week/1/lesson/s1-lesson-why', 'lesson'], ['/week/1/examples/practice', 'examples'], ['/week/1/lab/tool', 'lab'], ['/week/1/assessment', 'assessment']])
      expect(WEEK1_NAV.filter((n) => n.match(p)).map((n) => n.id), p).toEqual([id])
  })
})

describe('Week 1 week page', () => {
  it('shows title, subject, objectives, timeline, readings, deliverables and workload, with the entry cards in path order', () => {
    page('home')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Week 1 — Team Formation / Needs / Identifying Stakeholders')
    expect(screen.getByTestId('week1-subject')).toHaveTextContent('Team formation and the team charter')
    const entries = within(screen.getByTestId('week1-entries')).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(entries).toEqual(['Lecture slides', 'Detailed lesson', 'Worked examples', 'Engineering laboratory', 'Assessment and submission'])
    const lecture = screen.getByTestId('entry-lecture')
    expect(within(lecture).getByRole('link', { name: 'Session 1 slides' })).toHaveAttribute('href', '#/week/1/lecture/1')
    expect(within(lecture).getByRole('link', { name: 'Session 2 slides' })).toHaveAttribute('href', '#/week/1/lecture/2')
    expect(within(lecture).getByRole('link', { name: /Session 1 deck/ })).toHaveAttribute('href', './lectures/week01-session1.pptx')
    expect(screen.getAllByTestId(/^timeline-/).map((x) => x.dataset.testid)).toEqual(['timeline-session1', 'timeline-session2', 'timeline-lab', 'timeline-assessment'])
    expect(screen.getByTestId('week1-readings')).toHaveTextContent('R11')
    expect(screen.getByTestId('week1-deliverables')).toHaveTextContent('Week 1 Team Record')
    expect(screen.getByTestId('workload-total')).toHaveTextContent(WORKLOAD.total.toFixed(1))
    const table = screen.getByTestId('workload-table')
    for (const w of week01.workload) expect(table).toHaveTextContent(w.activity)
    expect(within(table).getByText(/Optional practice.*\(not counted\)/)).toBeInTheDocument()
    expect(screen.getByTestId('week-nav-overview')).toHaveAttribute('aria-current', 'page')
  })
})

describe('Worked examples', () => {
  it('every part’s slides and lesson section exist in Session 2, and the try-it-yourself data resolve', () => {
    const s2 = getLecture(1, 2)!
    const slides = new Set(allSlides(s2).map((s) => s.id))
    const lessons = new Set(s2.studentLesson.map((s) => s.id))
    for (const p of EXAMPLE_PARTS) {
      for (const id of p.slides) expect(slides.has(id), id).toBe(true)
      expect(lessons.has(p.lesson), p.lesson).toBe(true)
    }
    page('examples')
    for (const p of EXAMPLE_PARTS) {
      expect(screen.getByTestId(`example-${p.id}`)).toBeInTheDocument()
      for (const id of p.slides) expect(screen.getByTestId(`example-slide-${id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`example-lesson-${p.lesson}`)).toBeInTheDocument()
    }
    expect(screen.getByTestId('try-paper')).toHaveTextContent(TRY_CONCERN)
    expect(screen.getByTestId('try-paper-solution')).toHaveTextContent(TRY_NEED)
    expect(screen.getByTestId('example-try')).toHaveTextContent('optional, not counted')
    expect(screen.getByTestId('open-practice')).toHaveAttribute('href', '#/week/1/examples/practice')
    // student page: no faculty notes on the worked-example slides
    expect(screen.queryByTestId('faculty-notes')).toBeNull()
  })
})

describe('Laboratory', () => {
  it('the page and WEEK1_LAB_INSTRUCTIONS.md come from one source (run `npm run lab:md` after changing week01Lab.ts)', () => {
    expect(labMdFile.replace(/\r\n/g, '\n')).toBe(labMarkdown())
  })

  it('shows purpose, inputs, objectives, method, every procedure step, outputs, the rubric rows, submission and workload', () => {
    page('lab')
    for (const id of ['lab-inputs', 'lab-objectives', 'lab-method', 'lab-procedure', 'lab-outputs', 'lab-rubric', 'lab-submission', 'lab-tool', 'lab-workload']) expect(screen.getByTestId(id)).toBeInTheDocument()
    for (const p of LAB_PROCEDURE) expect(screen.getByTestId('lab-procedure')).toHaveTextContent(p.step)
    const rubric = screen.getByTestId('record-rubric')
    for (const [rb, c] of LAB_RUBRIC_ROWS) expect(rubric).toHaveTextContent(`${rb}.${c.split('.')[1]} ${rubricRow(rb, c)[1]}`)
    expect(screen.getByTestId('open-lab-tool')).toHaveAttribute('href', '#/week/1/lab/tool')
    expect(screen.getByTestId('model-inputs-map')).toHaveTextContent('concern')
    expect(screen.getByTestId('record-readiness')).toHaveAttribute('data-state', 'not-ready')
  })
})

describe('Assessment and submission', () => {
  it('holds the readiness quiz and the record readiness: not ready when empty, ready for a complete, exported, approved record', () => {
    const { unmount } = page('assessment')
    expect(screen.getByTestId('assessment-quiz')).toHaveTextContent(`${WEEK1_QUIZ.length} questions`)
    expect(screen.getByTestId(`quiz-${WEEK1_QUIZ[0].id}`)).toBeInTheDocument()
    expect(screen.getByTestId('record-readiness')).toHaveTextContent('not ready yet')
    unmount()
    saveJSON('wb-artefacts', { [TEAM_KEY]: { ...TEAM_FIXTURE, exportedMdAt: 20, exportedJsonAt: 21, updatedAt: 10 } })
    page('assessment')
    expect(screen.getByTestId('record-readiness')).toHaveTextContent('ready to submit: Riverside Food Bank Network')
    // the objective table links back to the lesson, not to the retired Learn sections
    for (const a of within(screen.getByTestId('objective-status')).queryAllByRole('link')) expect(a.getAttribute('href')).toMatch(/^#\/week\/1\/lesson\//)
  })
})

describe('Lesson self-checks (the earlier Learn checks, optional and ungraded)', () => {
  it('each sits at the end of its lesson section, closed by default, and records the answer without gating anything', async () => {
    const user = userEvent.setup()
    render(
      <Providers>
        <LessonReader week={1} />
      </Providers>,
    )
    for (const s of LEARN_SECTIONS) expect(screen.getByTestId(`selfcheck-${LEARN_TO_LESSON[s.id]}`)).toBeInTheDocument()
    const box = screen.getByTestId(`selfcheck-${LEARN_TO_LESSON.l1}`)
    expect(box).not.toHaveAttribute('open')
    await user.click(within(box).getByText(/Check your understanding/))
    const c1 = LEARN_SECTIONS[0].check
    await user.click(within(box).getByLabelText(c1.options.find((o) => o.correct)!.text))
    await user.click(within(box).getByRole('button', { name: 'Check my answer' }))
    expect(within(box).getByRole('status')).toHaveTextContent('Correct.')
    expect(loadJSON<{ checks: Record<string, { correct: boolean }> }>('w1-flow-v2', { checks: {} }).checks.l1.correct).toBe(true)
    expect(screen.getByTestId('week-nav-lesson')).toHaveAttribute('aria-current', 'page')
  })
})
