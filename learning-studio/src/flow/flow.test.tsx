import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { LEARN_SECTIONS, MEET_AEROLINK, WORKLOAD } from '../content/learn/week01'
import { saveJSON } from '../lib/storage'
import { TEAM_KEY } from '../workbench/week1/team'
import { TEAM_FIXTURE } from '../workbench/week1/teamFixture'
import { loadJSON } from '../lib/storage'
import { Providers } from '../state/Providers'
import { flowRoute } from './route'
import { readPrediction, recordPrediction } from './storage'
import WeekFlow from './WeekFlow'

beforeEach(() => window.localStorage.clear())

describe('flow routes', () => {
  it('maps /week/1 paths to stages and leaves the classic page alone', () => {
    expect(flowRoute('/week/1')).toEqual({ stage: 'overview' })
    expect(flowRoute('/week/1/learn/l3')).toEqual({ stage: 'learn', section: 'l3' })
    expect(flowRoute('/week/1/practice')).toEqual({ stage: 'practice', section: undefined })
    expect(flowRoute('/week/1/classic')).toBeNull()
    expect(flowRoute('/week/2')).toBeNull()
    expect(flowRoute('/week/1/practice/x')).toBeNull()
  })
})

describe('shared prediction (design D3)', () => {
  it('is stored under mission w1-m1-who, step input "prediction", and locks after the first answer', () => {
    expect(readPrediction()).toBeUndefined()
    recordPrediction('missing', 1000)
    recordPrediction('enough', 2000)
    const store = loadJSON<Record<string, { answers: Record<string, { value: string; at: number }> }>>('mission-progress', {})
    expect(store['w1-m1-who'].answers.prediction).toEqual({ value: 'missing', at: 1000 })
  })
})

describe('Learn checks (earlier flow, unregistered since 2026-10-19)', () => {
  it('a section can be marked read only after its check is answered; Practice is never locked (the Learn gate is removed)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <Providers>
        <WeekFlow stage="learn" section="l1" />
      </Providers>,
    )
    const mark = screen.getByTestId('mark-read')
    expect(mark).toBeDisabled()
    const c1 = LEARN_SECTIONS[0].check
    const check = screen.getByTestId('check-c1')
    await user.click(within(check).getByLabelText(c1.options.find((o) => o.correct)!.text))
    await user.click(within(check).getByRole('button', { name: 'Check my answer' }))
    expect(within(check).getByRole('status')).toHaveTextContent('Correct.')
    expect(mark).toBeEnabled()
    await user.click(mark)
    expect(loadJSON<{ read: Record<string, boolean> }>('w1-flow-v2', { read: {} }).read.l1).toBe(true)
    unmount()

    render(
      <Providers>
        <WeekFlow stage="practice" />
      </Providers>,
    )
    expect(screen.queryByTestId('practice-locked')).toBeNull()
    expect(screen.getByTestId('practice-plan')).toBeInTheDocument()
  })
})

describe('section check retry (review W1F-F13)', () => {
  it('a first wrong answer shows only that option’s feedback; the key appears after a second wrong answer; status keeps the first attempt', async () => {
    const user = userEvent.setup()
    const c1 = LEARN_SECTIONS[0].check
    const key = c1.options.find((o) => o.correct)!
    const [w1, w2] = c1.options.filter((o) => !o.correct)
    const { unmount } = render(
      <Providers>
        <WeekFlow stage="learn" section="l1" />
      </Providers>,
    )
    const check = screen.getByTestId('check-c1')
    await user.click(within(check).getByLabelText(w1.text))
    await user.click(within(check).getByRole('button', { name: 'Check my answer' }))
    expect(check).toHaveTextContent(w1.feedback)
    expect(check).not.toHaveTextContent(key.feedback)
    expect(screen.getByTestId('mark-read')).toBeEnabled()
    await user.click(within(check).getByRole('button', { name: 'Try again' }))
    await user.click(within(check).getByLabelText(w2.text))
    await user.click(within(check).getByRole('button', { name: 'Check my answer' }))
    expect(check).toHaveTextContent(key.feedback)
    expect(within(check).queryByRole('button', { name: 'Try again' })).toBeNull()
    const rec = loadJSON<{ checks: Record<string, { attempts: number; firstCorrect: boolean }> }>('w1-flow-v2', { checks: {} }).checks.l1
    expect(rec.attempts).toBe(2)
    expect(rec.firstCorrect).toBe(false)
    unmount()
  })

  it('a correct retry after a wrong first answer does not make the objective "secure" in Check & submit', async () => {
    const user = userEvent.setup()
    const c1 = LEARN_SECTIONS[0].check
    const { unmount } = render(
      <Providers>
        <WeekFlow stage="learn" section="l1" />
      </Providers>,
    )
    const check = screen.getByTestId('check-c1')
    await user.click(within(check).getByLabelText(c1.options.find((o) => !o.correct)!.text))
    await user.click(within(check).getByRole('button', { name: 'Check my answer' }))
    await user.click(within(check).getByRole('button', { name: 'Try again' }))
    await user.click(within(check).getByLabelText(c1.options.find((o) => o.correct)!.text))
    await user.click(within(check).getByRole('button', { name: 'Check my answer' }))
    expect(within(check).getByRole('status')).toHaveTextContent('Correct.')
    unmount()
    render(
      <Providers>
        <WeekFlow stage="check" />
      </Providers>,
    )
    const row = within(screen.getByTestId('objective-status')).getByText('B1.1').closest('tr')!
    expect(row).toHaveTextContent('0/')
    expect(row).toHaveTextContent('review')
  })
})

describe('Overview (review F12): what and why first, AeroLink before the question that names it', () => {
  it('orders what-and-why, Meet AeroLink, then the question and prediction, and states the realistic workload', () => {
    render(
      <Providers>
        <WeekFlow stage="overview" />
      </Providers>,
    )
    const order = ['opener-what-why', 'meet-aerolink', 'opener-question', 'time-plan'].map((id) => screen.getByTestId(id))
    for (let i = 1; i < order.length; i++) expect(order[i - 1].compareDocumentPosition(order[i]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByTestId('meet-aerolink')).toHaveTextContent(MEET_AEROLINK.use.text)
    expect(screen.getByTestId('opener-prediction')).toHaveTextContent('AeroLink')
    expect(screen.getByTestId('workload-note')).toHaveTextContent(`${WORKLOAD.total.toFixed(1)} h`)
  })
})

describe('Learn: every section ends its worked example with the step to the team’s own enterprise', () => {
  it('shows the apply box and, for a course-convention section, the convention instead of sources', () => {
    render(
      <Providers>
        <WeekFlow stage="learn" section="l1" />
      </Providers>,
    )
    expect(screen.getByTestId('apply-l1')).toHaveTextContent('Team enterprise view')
    expect(screen.getByTestId('convention-l1')).toHaveTextContent('Course convention')
  })
})

describe('Check & submit (review F16): the Team Record readiness is computed the way the instructor checks it', () => {
  it('says not ready for an empty record, and ready for a complete, exported one', () => {
    const { unmount } = render(
      <Providers>
        <WeekFlow stage="check" />
      </Providers>,
    )
    expect(screen.getByTestId('record-readiness')).toHaveTextContent('not ready yet')
    unmount()
    saveJSON('wb-artefacts', { [TEAM_KEY]: { ...TEAM_FIXTURE, exportedMdAt: 20, exportedJsonAt: 21, updatedAt: 10 } })
    render(
      <Providers>
        <WeekFlow stage="check" />
      </Providers>,
    )
    expect(screen.getByTestId('record-readiness')).toHaveTextContent('ready to submit: Riverside Food Bank Network')
    expect(screen.getByTestId('record-rubric')).toHaveTextContent('RB-2.2')
    expect(screen.getByTestId('model-inputs-map')).toHaveTextContent('concern')
    expect(screen.queryByText(/leverage/i)).toBeNull()
  })
})
