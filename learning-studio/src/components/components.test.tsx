import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppStateProvider } from '../state/AppState'
import { Quiz } from './Quiz'
import { BoundaryExercise } from './Week1Exercises'
import { DynamicsExplorer } from './DynamicsExplorer'
import { WEEK1_QUIZ } from '../content/quizWeek1'
import { BOUNDARY_ITEMS } from '../content/week1'
import { InstructorReview } from '../pages/InstructorReview'

beforeEach(() => window.localStorage.clear())

describe('knowledge check', () => {
  it('reveals the explanation, records the score, and allows a retry', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><Quiz questions={WEEK1_QUIZ.slice(0, 2)} /></AppStateProvider>)
    const q = screen.getByTestId('quiz-q1-1')
    const correct = WEEK1_QUIZ[0].options.find((o) => o.correct)!
    await user.click(within(q).getByLabelText(correct.text))
    await user.click(within(q).getByRole('button', { name: 'Check answer' }))
    expect(within(q).getByRole('status')).toHaveTextContent('Correct')
    expect(within(q).getByText(correct.explanation)).toBeInTheDocument()
    expect(screen.getByTestId('quiz-score')).toHaveTextContent('Score: 1 correct of 2')

    const q2 = screen.getByTestId('quiz-q1-2')
    const wrong = WEEK1_QUIZ[1].options.find((o) => !o.correct)!
    await user.click(within(q2).getByLabelText(wrong.text))
    await user.click(within(q2).getByRole('button', { name: 'Check answer' }))
    expect(within(q2).getByRole('status')).toHaveTextContent('Not quite')
    await user.click(within(q2).getByRole('button', { name: 'Try again' }))
    expect(within(q2).getByRole('button', { name: 'Check answer' })).toBeDisabled()
  })
})

describe('boundary exercise', () => {
  it('scores classifications against the instructor key', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><BoundaryExercise /></AppStateProvider>)
    for (const item of BOUNDARY_ITEMS) {
      await user.selectOptions(screen.getByLabelText(`Classify ${item.name}`), item.answer)
    }
    await user.click(screen.getByRole('button', { name: 'Check classification' }))
    expect(screen.getByTestId('boundary-score')).toHaveTextContent(`${BOUNDARY_ITEMS.length} of ${BOUNDARY_ITEMS.length}`)
  })
})

describe('dynamics explorer', () => {
  it('hides the archetype label until a choice is committed, and offers a data table equivalent', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><DynamicsExplorer /></AppStateProvider>)
    expect(screen.queryByTestId('scenario-reveal')).toBeNull()
    expect(screen.queryByText(/Limits to Growth: the charging limit/)).toBeNull()
    const reveal = screen.getByRole('button', { name: 'Reveal the instructor’s label' })
    expect(reveal).toBeDisabled()
    await user.selectOptions(screen.getByLabelText(/Which archetype does this run show/), 'Fixes that Fail')
    await user.click(reveal)
    expect(screen.getByTestId('scenario-reveal')).toHaveTextContent('does not match the model structure')
    expect(screen.getByTestId('scenario-reveal')).toHaveTextContent('Limits to Growth: the charging limit')
    // text equivalent: months 0, 6, …, 60 plus the header row; binding constraint reported per month
    const table = within(screen.getByTestId('sim-table')).getByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(12)
    expect(screen.getByTestId('sim-observations')).toHaveTextContent('charging capacity (waits above tolerance)')
    // both cost measures are shown: idle aircraft (aircraft only) and charger-months (review W1-R02)
    expect(screen.getByTestId('sim-observations')).toHaveTextContent('1,135 surplus aircraft-months (counts aircraft only)')
    expect(screen.getByTestId('sim-observations')).toHaveTextContent('366 charger-months (6 chargers now)')
    // the supply-line policy is a labelled control
    expect(screen.getByLabelText('Orders count aircraft already on order (supply line)')).not.toBeChecked()
  })

  it('archetype feedback agrees with R05 and the quiz key: Limits to Growth matches the market-limited run (review W1-R01)', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><DynamicsExplorer /></AppStateProvider>)
    const choices = within(screen.getByLabelText(/Which archetype does this run show/)).getAllByRole('option').map((o) => o.textContent)
    expect(choices).not.toContain('Reinforcing growth limited by the market')
    const commit = async (scenario: string, choice: string) => {
      await user.click(screen.getByRole('button', { name: scenario }))
      await user.selectOptions(screen.getByLabelText(/Which archetype does this run show/), choice)
      await user.click(screen.getByRole('button', { name: 'Reveal the instructor’s label' }))
      return screen.getByTestId('scenario-reveal')
    }
    const balanced = await commit('Chargers scale, 3-month delivery', 'Limits to Growth')
    expect(balanced).toHaveTextContent('matches the model structure')
    expect(balanced).toHaveTextContent('Limits to Growth: the market limit')
    expect(screen.getByTestId('sim-observations')).toHaveTextContent('Binding constraint: demand (waits within tolerance)')
    expect(screen.getByTestId('sim-observations')).not.toHaveTextContent('spare capacity')
    const delay = await commit('Long procurement delay', 'Limits to Growth')
    expect(delay).toHaveTextContent('partly fits')
    const under = await commit('Fleet grows, charging does not', 'Balancing Process with Delay')
    expect(under).toHaveTextContent('partly fits')
    expect(under).not.toHaveTextContent('matches the model structure')
  })
})

describe('instructor review', () => {
  it('records decisions and updates the counts', async () => {
    const user = userEvent.setup()
    render(<AppStateProvider><InstructorReview /></AppStateProvider>)
    const before = Number(screen.getByTestId('count-approved').textContent)
    expect(before).toBe(0)
    const selects = screen.getAllByRole('combobox', { name: /Decision for/ })
    await user.selectOptions(selects[0], 'approved')
    await user.selectOptions(selects[1], 'changes-requested')
    expect(screen.getByTestId('count-approved')).toHaveTextContent('1')
    expect(screen.getByTestId('count-changes')).toHaveTextContent('1')
  })
})
