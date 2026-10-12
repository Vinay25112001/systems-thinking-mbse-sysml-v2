import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { Providers } from '../../state/Providers'
import { ACTIVITIES } from '../week02.activity'
import { ConflictMatrix } from './ConflictMatrix'
import { LifecycleExplorer } from './LifecycleExplorer'
import { SosClassifier } from './SosClassifier'
import { GATE_SCENARIOS } from './lifecycle'

beforeEach(() => window.localStorage.clear())

describe('Week 2 activities', () => {
  it('registers four w02- keys', () => {
    expect(Object.keys(ACTIVITIES).every((k) => k.startsWith('w02-'))).toBe(true)
    expect(Object.keys(ACTIVITIES)).toHaveLength(4)
  })

  it('SoS classifier flags a verdict that does not follow from the student’s own ratings', async () => {
    const user = userEvent.setup()
    render(<Providers><SosClassifier /></Providers>)
    await user.selectOptions(screen.getByLabelText('Rate Operational independence'), 'yes')
    await user.selectOptions(screen.getByLabelText('Rate Managerial independence'), 'no')
    await user.selectOptions(screen.getByLabelText('Rate Geographic distribution'), 'yes')
    await user.click(screen.getByLabelText('A system of systems'))
    await user.click(screen.getByRole('button', { name: 'Check my classification' }))
    const fb = screen.getByTestId('w02-sos-feedback')
    expect(fb).toHaveTextContent('does not follow from your ratings')
    expect(fb).toHaveTextContent('not taxonomic classifiers')
    expect(fb).toHaveTextContent('✗ Does not follow')
    expect(fb).toHaveTextContent('✗ Differs from the key. Instructor verdict: Not an SoS')
  })

  it('life-cycle explorer scores a gate decision', async () => {
    const user = userEvent.setup()
    render(<Providers><LifecycleExplorer /></Providers>)
    const part = screen.getByTestId('w02-part-gates')
    const g1 = GATE_SCENARIOS[0]
    await user.selectOptions(within(part).getByLabelText(`Answer for: ${g1.text}`), 'begin')
    await user.click(within(part).getByRole('button', { name: 'Check' }))
    expect(within(part).getByTestId('w02-score-gates')).toHaveTextContent('0 of 5')
    await user.selectOptions(within(part).getByLabelText(`Answer for: ${g1.text}`), 'continue')
    await user.click(within(part).getByRole('button', { name: 'Check' }))
    expect(within(part).getByTestId('w02-score-gates')).toHaveTextContent('1 of 5')
  })

  it('conflict matrix computes a conflict from two opposite cells and compares with the key', async () => {
    const user = userEvent.setup()
    render(<Providers><ConflictMatrix /></Providers>)
    await user.selectOptions(screen.getByLabelText('STK-003 Investors on Vertiport sites in residential districts'), 'up')
    await user.selectOptions(screen.getByLabelText('STK-013 City planning authority on Vertiport sites in residential districts'), 'down')
    expect(screen.getByText('Computed conflicts (1)')).toBeInTheDocument()
    expect(screen.getByTestId('w02-conflict-pairs')).toHaveTextContent('25')
    await user.click(screen.getByRole('button', { name: 'Compare with the instructor key' }))
    expect(screen.getByTestId('w02-conflict-compare')).toHaveTextContent('2 of 2 answered cells agree')
    expect(screen.getByTestId('w02-conflict-compare')).toHaveTextContent('Conflicts you missed: 27')
    expect(screen.getByTestId('w02-matrix-scope')).toHaveTextContent('9 of the 14 reference stakeholders')
  })
})

describe('concern and AROU recorder', () => {
  it('records a CON in the workspace and links it to its stakeholder; rejects a generic concern', async () => {
    const { ConcernArouRecorder } = await import('./ConcernArouRecorder')
    const user = userEvent.setup()
    render(<Providers><ConcernArouRecorder /></Providers>)
    await user.selectOptions(screen.getByLabelText('Derived from stakeholder'), 'STK-004')
    await user.type(screen.getByLabelText('Owner (initials)'), 'JS')
    await user.type(screen.getByLabelText('Short name'), 'Safety')
    await user.type(screen.getByLabelText('Statement'), 'The community is concerned about noise.')
    await user.click(screen.getByRole('button', { name: 'Record entry' }))
    expect(screen.getByRole('alert')).toHaveTextContent('generic')
    expect(screen.getByRole('alert')).not.toHaveTextContent('too short')
    await user.clear(screen.getByLabelText('Statement'))
    await user.type(screen.getByLabelText('Statement'), 'Departures after 22:00 wake residents near the pad')
    await user.click(screen.getByRole('button', { name: 'Record entry' }))
    expect(await screen.findByText(/CON-001 recorded and linked \(derives-from STK-004\), tagged team-derived/)).toBeInTheDocument()
    expect(screen.getByTestId('w02-l2-coverage')).toHaveTextContent('1 of 6 stakeholders have at least one concern')
  })

  it('records an AI-suggested AROU entry against a concern, atomically, with its provenance tag', async () => {
    const { ConcernArouRecorder } = await import('./ConcernArouRecorder')
    const user = userEvent.setup()
    render(<Providers><ConcernArouRecorder /></Providers>)
    await user.selectOptions(screen.getByLabelText('Derived from stakeholder'), 'STK-004')
    await user.type(screen.getByLabelText('Owner (initials)'), 'JS')
    await user.type(screen.getByLabelText('Short name'), 'Night noise')
    await user.type(screen.getByLabelText('Statement'), 'Departures after 22:00 wake residents near the pad')
    await user.click(screen.getByRole('button', { name: 'Record entry' }))
    await screen.findByText(/CON-001 recorded and linked/)
    await user.selectOptions(screen.getByLabelText('Kind'), 'A')
    await user.selectOptions(screen.getByLabelText('Affects stakeholder or concern'), 'CON-001')
    await user.selectOptions(screen.getByLabelText('Provenance'), 'AI-suggested-reviewed')
    await user.type(screen.getByLabelText('Short name'), 'Curfew accepted')
    await user.type(screen.getByLabelText('Statement'), 'Residents accept a 22:00 curfew in exchange for a third residential site')
    await user.click(screen.getByRole('button', { name: 'Record entry' }))
    expect(await screen.findByText(/A-001 recorded and linked \(affects CON-001\), tagged AI-suggested-reviewed/)).toBeInTheDocument()
    expect(screen.getByTestId('w02-l2-coverage')).toHaveTextContent('1 AROU entries (L2 minimum 4), 1 linked')
    expect(screen.getByText('JS · AI-suggested-reviewed')).toBeInTheDocument()
  })
})
