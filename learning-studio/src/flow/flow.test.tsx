import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { LEARN_SECTIONS } from '../content/learn/week01'
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
  it('is stored under mission w1-m1-try, step input "prediction", and locks after the first answer', () => {
    expect(readPrediction()).toBeUndefined()
    recordPrediction('partly', 1000)
    recordPrediction('yes', 2000)
    const store = loadJSON<Record<string, { answers: Record<string, { value: string; at: number }> }>>('mission-progress', {})
    expect(store['w1-m1-try'].answers.prediction).toEqual({ value: 'partly', at: 1000 })
  })
})

describe('Learn gating', () => {
  it('a section can be marked read only after its check is answered; Practice stays locked until all are read', async () => {
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
    expect(loadJSON<{ read: Record<string, boolean> }>('w1-flow', { read: {} }).read.l1).toBe(true)
    unmount()

    render(
      <Providers>
        <WeekFlow stage="practice" />
      </Providers>,
    )
    expect(screen.getByTestId('practice-locked')).toHaveTextContent('1 so far')
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
    const rec = loadJSON<{ checks: Record<string, { attempts: number; firstCorrect: boolean }> }>('w1-flow', { checks: {} }).checks.l1
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
