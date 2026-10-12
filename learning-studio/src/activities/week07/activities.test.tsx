import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Providers } from '../../state/Providers'
import { useWorkspace } from '../../state/Workspace'
import { ACTIVITIES } from '../week07.activity'
import { MonteCarloPanel } from './MonteCarloPanel'
import { SwingWeightWalkthrough } from './SwingWeightWalkthrough'
import { TradeStudySimulator } from './TradeStudySimulator'
import { resetW07Store } from './store'

afterEach(cleanup)

/** Loads the reference baseline up to Week 6 (MGO, REQ, MOE-001..006, AROU) so that CRIT can be traced to MOEs. */
function LoadCp2() {
  const { loadReference, model } = useWorkspace()
  return (
    <>
      <button onClick={() => loadReference(6)}>load CP2 reference</button>
      <output data-testid="ws-dump">{JSON.stringify(model.elements.filter((e) => ['CRIT', 'ALT', 'DEC'].includes(e.kind)).map((e) => ({ id: e.id, owner: e.owner, provenance: e.provenance, baseline: e.attributes?.baseline })))}</output>
    </>
  )
}
beforeEach(() => {
  window.localStorage.clear()
  resetW07Store()
})

// The simulator re-renders all tables on every keystroke; under a full parallel run this needs more than the 5 s default.
describe('Week 7 activities', { timeout: 30000 }, () => {
  it('registers three w07- keys', () => {
    expect(Object.keys(ACTIVITIES).sort()).toEqual(['w07-monte-carlo', 'w07-swing-elicitation', 'w07-trade-simulator'])
  })

  it('simulator: reference totals, the 0.478 reversal, a checked hand calculation, and a mutation that moves the reversal', async () => {
    const user = userEvent.setup()
    render(<Providers><TradeStudySimulator /></Providers>)
    expect(screen.getByTestId('w07-total-ALT-004')).toHaveTextContent('0.670')
    expect(screen.getByTestId('w07-total-ALT-001')).toHaveTextContent('0.452')
    expect(screen.getByTestId('w07-weight-CRIT-002')).toHaveTextContent('0.300')
    expect(screen.getByTestId('w07-reversal-summary')).toHaveTextContent('above 0.478')
    expect(screen.getByTestId('w07-reversal-summary')).toHaveTextContent('ALT-001 rank first')
    await user.type(screen.getByLabelText('Your hand-calculated reversal weight'), '0.40')
    await user.click(screen.getByRole('button', { name: 'Check my reversal point' }))
    expect(screen.getByTestId('w07-guess-feedback')).toHaveTextContent('✗ Not yet')
    await user.clear(screen.getByLabelText('Your hand-calculated reversal weight'))
    await user.type(screen.getByLabelText('Your hand-calculated reversal weight'), '0.478')
    await user.click(screen.getByRole('button', { name: 'Check my reversal point' }))
    expect(screen.getByTestId('w07-guess-feedback')).toHaveTextContent('✓ Correct')
    // mutation: the baseline now needs USD 10 M of capital → it no longer wins at 0.478
    const cell = screen.getByLabelText('ALT-001 score on CRIT-002')
    await user.clear(cell)
    await user.type(cell, '10')
    expect(screen.getByTestId('w07-reversal-summary')).not.toHaveTextContent('above 0.478')
  })

  it('simulator: the line-diagram table and the tornado table are rendered as text equivalents', () => {
    render(<Providers><TradeStudySimulator /></Providers>)
    const t = screen.getByTestId('w07-sens-table')
    expect(within(t).getByText(/0\.478 \(reversal ↑\)/)).toBeInTheDocument()
    expect(within(t).getByText(/0\.300 \(base\)/)).toBeInTheDocument()
    expect(screen.getByTestId('w07-tornado-table')).toHaveTextContent('CRIT-002')
  })

  it('simulator: refuses to save without owner initials or MOEs in the workspace, then saves with owner and provenance and reads it back', async () => {
    const user = userEvent.setup()
    render(<Providers><LoadCp2 /><TradeStudySimulator /></Providers>)
    await user.click(screen.getByRole('button', { name: 'Save this study to my workspace' }))
    expect(screen.getByTestId('w07-sim-message')).toHaveTextContent('Not saved (L7 acceptance)')
    expect(screen.getByTestId('w07-sim-message')).toHaveTextContent('MOE-001 is not an active MOE in your workspace')
    expect(screen.getByTestId('w07-sim-message')).toHaveTextContent('owner')
    await user.click(screen.getByRole('button', { name: 'load CP2 reference' }))
    await user.type(screen.getByLabelText('Owner (initials)'), 'jk')
    await user.selectOptions(screen.getByLabelText('Provenance'), 'AI-suggested-reviewed')
    await user.click(screen.getByRole('button', { name: 'Save this study to my workspace' }))
    expect(screen.getByTestId('w07-sim-message')).toHaveTextContent('Saved to your workspace')
    const saved = JSON.parse(screen.getByTestId('ws-dump').textContent!) as { id: string; owner: string; provenance: string; baseline?: boolean }[]
    expect(saved).toHaveLength(8)
    expect(saved.every((e) => e.owner === 'JK' && e.provenance === 'AI-suggested-reviewed')).toBe(true)
    expect(saved.filter((e) => e.baseline === true)).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Load ALT/CRIT from my workspace' }))
    expect(screen.getByTestId('w07-sim-message')).toHaveTextContent('Loaded 4 CRIT and 4 ALT from your workspace')
    expect(screen.getByTestId('w07-total-ALT-004')).toHaveTextContent('0.670')
  })

  it('simulator: a study with fewer than three alternatives is rejected with a specific error', async () => {
    const user = userEvent.setup()
    render(<Providers><TradeStudySimulator /></Providers>)
    await user.click(screen.getByRole('button', { name: 'Remove ALT-001' }))
    await user.click(screen.getByRole('button', { name: 'Remove ALT-002' }))
    expect(screen.getByTestId('w07-issues')).toHaveTextContent('at least 3 alternatives')
    expect(screen.queryByTestId('w07-value-table')).toBeNull()
  })

  it('Monte Carlo: reproducible for a seed; ALT-004 ranks first in most trials', async () => {
    const user = userEvent.setup()
    render(<Providers><MonteCarloPanel /></Providers>)
    await user.clear(screen.getByLabelText('Number of trials'))
    await user.type(screen.getByLabelText('Number of trials'), '2000')
    await user.click(screen.getByRole('button', { name: 'Run Monte Carlo' }))
    const first = screen.getByTestId('w07-pfirst-ALT-004').textContent
    expect(Number(first!.split(' ')[0])).toBeGreaterThan(0.9)
    await user.click(screen.getByRole('button', { name: 'Run Monte Carlo' }))
    expect(screen.getByTestId('w07-pfirst-ALT-004').textContent).toBe(first)
    await user.click(screen.getByRole('button', { name: 'Run and compare with independent draws' }))
    expect(screen.getByTestId('w07-mc-table')).toHaveTextContent('P(first), independent draws')
  })

  it('Monte Carlo: reference scores are derived from shared drivers, and the 10,000-trial headline matches the lesson', async () => {
    const user = userEvent.setup()
    render(<Providers><MonteCarloPanel /></Providers>)
    expect(screen.getByTestId('w07-mc-formula-ALT-004-CRIT-002')).toHaveTextContent('4 × Aircraft unit price + 2 × High-power charger upgrade')
    expect(screen.getByTestId('w07-mc-formula-ALT-001-CRIT-001')).toHaveTextContent('Year-2 demand ÷ 240')
    await user.clear(screen.getByLabelText('Number of trials'))
    await user.type(screen.getByLabelText('Number of trials'), '10000')
    await user.click(screen.getByRole('button', { name: 'Run Monte Carlo' }))
    expect(screen.getByTestId('w07-pfirst-ALT-004')).toHaveTextContent('0.938 ± 0.002')
  })

  it('simulator: the DEC is refused without owner initials and records them when given', async () => {
    const user = userEvent.setup()
    render(<Providers><LoadCp2 /><TradeStudySimulator /></Providers>)
    await user.click(screen.getByRole('button', { name: 'load CP2 reference' }))
    await user.type(screen.getByLabelText('Owner (initials)'), 'AB')
    await user.click(screen.getByRole('button', { name: 'Save this study to my workspace' }))
    expect(screen.getByTestId('w07-sim-message')).toHaveTextContent('Saved to your workspace')
    await user.selectOptions(screen.getByLabelText('Recommended alternative'), 'ALT-004')
    await user.type(screen.getByLabelText('Conditions under which it holds'), 'Holds while the capital weight stays below the reversal point and demand stays near plan.')
    await user.type(screen.getByLabelText('Residual risk'), 'R-001 reduced, R-005 now at the converted hub.')
    await user.type(screen.getByLabelText('What would change it (use the reversal points)'), 'Capital weight above 0.478 or a connection limit that rules out a hub.')
    await user.clear(screen.getByLabelText('Owner (initials)'))
    await user.click(screen.getByRole('button', { name: 'Record DEC' }))
    expect(screen.getByTestId('w07-dec-feedback')).toHaveTextContent('Enter the owner')
    await user.type(screen.getByLabelText('Owner (initials)'), 'AB')
    await user.click(screen.getByRole('button', { name: 'Record DEC' }))
    expect(screen.getByTestId('w07-dec-feedback')).toHaveTextContent('recorded in your workspace')
    const saved = JSON.parse(screen.getByTestId('ws-dump').textContent!) as { id: string; owner: string }[]
    expect(saved.find((e) => e.id.startsWith('DEC-'))?.owner).toBe('AB')
  })

  it('Monte Carlo: an inconsistent triangular distribution blocks the run', async () => {
    const user = userEvent.setup()
    render(<Providers><MonteCarloPanel /></Providers>)
    const low = screen.getByLabelText('Driver AC low')
    await user.clear(low)
    await user.type(low, '20')
    await user.click(screen.getByRole('button', { name: 'Run Monte Carlo' }))
    expect(screen.getByRole('alert')).toHaveTextContent('driver AC')
  })

  it('swing walkthrough: flags points that rise down the ranking, then feeds consistent points to the simulator', async () => {
    const user = userEvent.setup()
    render(
      <Providers>
        <SwingWeightWalkthrough />
        <TradeStudySimulator />
      </Providers>,
    )
    const ranks = { 'CRIT-001': '1', 'CRIT-002': '2', 'CRIT-003': '3', 'CRIT-004': '4' }
    for (const [c, r] of Object.entries(ranks)) await user.selectOptions(screen.getByLabelText(`Rank of the ${c} swing`), r)
    const pts = { 'CRIT-001': '100', 'CRIT-002': '50', 'CRIT-003': '60', 'CRIT-004': '40' }
    for (const [c, p] of Object.entries(pts)) await user.type(screen.getByLabelText(`Points for the ${c} swing`), p)
    await user.click(screen.getByRole('button', { name: 'Check my elicitation' }))
    expect(screen.getByTestId('w07-swing-feedback')).toHaveTextContent('CRIT-003 is ranked below CRIT-002 but has more points')
    await user.clear(screen.getByLabelText('Points for the CRIT-003 swing'))
    await user.type(screen.getByLabelText('Points for the CRIT-003 swing'), '50')
    await user.click(screen.getByRole('button', { name: 'Check my elicitation' }))
    expect(screen.getByTestId('w07-swing-feedback')).toHaveTextContent('✓ Consistent')
    await user.click(screen.getByRole('button', { name: 'Use my swing points in the simulator' }))
    // 100 / 50 / 50 / 40 → CRIT-001 weight 100/240
    expect(screen.getByTestId('w07-weight-CRIT-001')).toHaveTextContent((100 / 240).toFixed(3))
  })

  it('swing walkthrough: range probes explain a wrong answer', async () => {
    const user = userEvent.setup()
    render(<Providers><SwingWeightWalkthrough /></Providers>)
    await user.click(screen.getAllByLabelText('stay the same')[0])
    await user.click(screen.getByRole('button', { name: 'Check my answers' }))
    expect(screen.getByTestId('w07-probe-p1')).toHaveTextContent('should rise')
  })
})
