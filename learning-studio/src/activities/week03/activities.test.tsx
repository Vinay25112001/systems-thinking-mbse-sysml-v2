import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Button } from '../../components/ui'
import { Providers } from '../../state/Providers'
import { useWorkspace } from '../../state/Workspace'
import { ACTIVITIES } from '../week03.activity'
import { CapabilityBuilder } from './CapabilityBuilder'
import { MgoRecorder } from './MgoRecorder'
import { NeedStudio } from './NeedStudio'
import { ScenarioBuilder } from './ScenarioBuilder'

beforeEach(() => window.localStorage.clear())
afterEach(() => cleanup())

function LoadReference() {
  const { loadReference } = useWorkspace()
  return <Button onClick={() => loadReference(3)}>Load reference</Button>
}

describe('Week 3 activities', () => {
  it('registers four w03- keys', () => {
    expect(Object.keys(ACTIVITIES)).toEqual(['w03-mgo-recorder', 'w03-need-studio', 'w03-capability-tree', 'w03-scenario-builder'])
  })

  it('need studio: Part A scores a diagnosis against the computed key and screens the student’s own rewrite', async () => {
    const user = userEvent.setup()
    render(<Providers><NeedStudio /></Providers>)
    await user.type(screen.getByLabelText('Your rewrite of statement 1 (before checking)'), 'Passengers need a booking app.')
    for (const f of ['Written as a requirement', 'Names a solution', 'No stakeholder', 'No condition']) await user.click(screen.getByLabelText(`Statement 1: ${f}`))
    await user.click(screen.getByLabelText('Statement 3: No condition'))
    await user.click(screen.getByRole('button', { name: 'Check my diagnosis' }))
    expect(screen.getByTestId('w03-critique-c1')).toHaveTextContent('Agrees with the key')
    expect(screen.getByTestId('w03-critique-c1')).toHaveTextContent('Your rewrite screens as: Names a solution, No condition')
    expect(screen.getByTestId('w03-critique-c3')).toHaveTextContent('Not flagged by the key: No condition')
    // c1 right, c6 (flawless, nothing ticked) right, c3 over-ticked, others unticked
    expect(screen.getByTestId('w03-critique-score')).toHaveTextContent('2 of 6')
  }, 30000)

  it('need studio: refuses a solution-laden requirement, then records a good need with its trace link', async () => {
    const user = userEvent.setup()
    render(<Providers><NeedStudio /></Providers>)
    await user.type(screen.getByLabelText('Short name'), 'Quiet operations')
    await user.type(screen.getByLabelText('Need statement'), 'AeroLink shall install noise barriers.')
    await user.click(screen.getByRole('button', { name: 'Record need' }))
    expect(screen.getByTestId('w03-need-message')).toHaveTextContent('Not recorded')
    const crit = screen.getByTestId('w03-need-criteria')
    expect(crit).toHaveTextContent('✗ Fix — Written as a need')
    expect(crit).toHaveTextContent('“noise barriers” (noise-control hardware)')

    await user.clear(screen.getByLabelText('Need statement'))
    await user.type(screen.getByLabelText('Need statement'), 'Communities near vertiports need take-off and landing noise kept within the agreed limit at all operating hours.')
    await user.type(screen.getByLabelText('Rationale (why)'), 'Planning consent for residential sites depends on it.')
    await user.click(screen.getByRole('checkbox', { name: /STK-004/ }))
    expect(within(crit).queryByText(/✗ Fix/)).toBeNull()
    // owner initials are required (lab plan C.2 rule 5)
    await user.click(screen.getByRole('button', { name: 'Record need' }))
    expect(screen.getByTestId('w03-need-message')).toHaveTextContent('Not recorded: Enter the owner’s initials')
    await user.type(screen.getByLabelText('Owner (initials)'), 'jd')
    await user.selectOptions(screen.getByLabelText('Provenance'), 'AI-suggested-reviewed')
    await user.click(screen.getByRole('button', { name: 'Record need' }))
    expect(screen.getByTestId('w03-need-message')).toHaveTextContent('NEED-001 recorded with 1 derives-from link(s) (STK-004)')
    expect(screen.getByRole('table')).toHaveTextContent('JD / AI-suggested-reviewed')
    expect(screen.getByTestId('w03-need-coverage')).toHaveTextContent('1 NEED (L3 minimum 8), 1 traced')
  }, 30000)

  it('capability builder: flags the uncovered need, records a traced capability, and computes a gap', async () => {
    const user = userEvent.setup()
    render(<Providers><NeedStudio /><CapabilityBuilder /></Providers>)
    await user.type(screen.getByLabelText('Short name'), 'Short wait')
    await user.type(screen.getByLabelText('Need statement'), 'Passengers need a short and predictable wait to board, throughout operating hours.')
    await user.type(screen.getByLabelText('Rationale (why)'), 'Wait decides whether riders return.')
    await user.click(screen.getAllByRole('checkbox', { name: /STK-001/ })[0])
    for (const o of screen.getAllByLabelText('Owner (initials)')) await user.type(o, 'AB')
    await user.click(screen.getByRole('button', { name: 'Record need' }))
    expect(screen.getByTestId('w03-cap-gaps')).toHaveTextContent('NEED-001')

    await user.click(screen.getByRole('button', { name: 'Record capability' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Trace the capability to at least one need')
    await user.type(screen.getByLabelText('Capability name'), 'On-demand transport')
    await user.type(screen.getByLabelText('What the enterprise must be able to do'), 'Carry a booked party between any two vertiports on demand.')
    await user.click(screen.getByRole('checkbox', { name: /NEED-001/ }))
    await user.click(screen.getByRole('button', { name: 'Record capability' }))
    expect(screen.getByTestId('w03-cap-message')).toHaveTextContent('CAP-001 recorded, derived from NEED-001')
    expect(screen.queryByTestId('w03-cap-gaps')).toBeNull()
    const checks = screen.getByTestId('w03-cap-checks')
    expect(checks).toHaveTextContent('✓ Pass — Every capability traces to a need')
    expect(checks).toHaveTextContent('✗ Not yet — ≥ 5 capabilities')

    expect(screen.getByText(/owner \/ provenance: AB \/ team-derived/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Load the worked example' }))
    expect(screen.getByTestId('w03-gap-0-mid')).toHaveTextContent('GAP (shortfall) (-60 trips/day; 80 % of desired)')
    expect(screen.getByTestId('w03-gap-1-mid')).toHaveTextContent('PROBABLE GAP')
    expect(screen.getByTestId('w03-gap-2-mid')).toHaveTextContent('GAP (shortfall) (-70 charges/day; 77 % of desired)')
    expect(screen.getByTestId('w03-gap-summary')).toHaveTextContent('CAP-003 Fleet charging management (20 min per charge, A-007): first gap in the mid term (probable: upper-bound baseline)')
    // mutation in the UI: clearing the upper-bound flag turns the probable gap back into "balanced"
    await user.click(screen.getByLabelText('Row 2 baseline is an upper bound'))
    expect(screen.getByTestId('w03-gap-1-mid')).toHaveTextContent('Balanced')
  }, 30000)

  it('scenario builder: the worked example passes and records SCN-006 with capability and actor links', async () => {
    const user = userEvent.setup()
    render(<Providers><LoadReference /><ScenarioBuilder /></Providers>)
    await user.click(screen.getByRole('button', { name: 'Record scenario' }))
    expect(screen.getByRole('alert')).toHaveTextContent('still to fix')
    await user.click(screen.getByRole('button', { name: 'Load the SCN-005 worked example' }))
    expect(within(screen.getByTestId('w03-scn-checks')).queryByText(/✗ Fix/)).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Record scenario' }))
    expect(screen.getByTestId('w03-scn-message')).toHaveTextContent('Not recorded: Enter the owner’s initials')
    await user.type(screen.getByLabelText('Owner (initials)'), 'KM')
    await user.click(screen.getByRole('button', { name: 'Record scenario' }))
    expect(screen.getByTestId('w03-scn-message')).toHaveTextContent('Not recorded: CAP-005 is not in your workspace')

    await user.click(screen.getByRole('button', { name: 'Load reference' }))
    expect(screen.getByTestId('w03-scn-coverage')).toHaveTextContent('5 scenario(s); nominal yes; weather disruption yes; charging or maintenance yes')
    expect(screen.getByTestId('w03-scn-id-note')).toHaveTextContent('recorded as SCN-006, not SCN-005')
    await user.click(screen.getByRole('button', { name: 'Record scenario' }))
    // CAP-005 derives-from + performs for STK-001, STK-008, EXT-001 + affects for EXT-003 (weather does not act)
    expect(screen.getByTestId('w03-scn-message')).toHaveTextContent('SCN-006 recorded with 5 link(s)')
    expect(screen.getByTestId('w03-scn-coverage')).toHaveTextContent('6 scenario(s)')
    expect(screen.getByRole('table')).toHaveTextContent('SCN-006Weather DisruptionKM / team-derived')
  }, 30000)

  it('scenario builder: a step actor outside the actor list is flagged', async () => {
    const user = userEvent.setup()
    render(<Providers><ScenarioBuilder /></Providers>)
    await user.type(screen.getByLabelText('Step 1 action'), 'Requests a ride.')
    expect(screen.getByTestId('w03-scn-checks')).toHaveTextContent('Step(s) 1 have no actor')
    await user.selectOptions(screen.getByLabelText('Step 1 actor'), 'AeroLink (system of interest)')
    expect(screen.getByTestId('w03-scn-checks')).toHaveTextContent('Every step names its actor')
  }, 30000)

  it('MGO recorder: an objective needs a parent goal and a measurable target', async () => {
    const user = userEvent.setup()
    render(<Providers><MgoRecorder /></Providers>)
    const level = screen.getByLabelText('Level')
    await user.selectOptions(level, 'mission')
    await user.type(screen.getByLabelText('MGO name'), 'Mission')
    await user.type(screen.getByLabelText('MGO statement'), 'Provide safe, quiet on-demand air trips between six vertiports.')
    await user.click(screen.getByRole('checkbox', { name: /STK-001/ }))
    await user.click(screen.getByRole('button', { name: 'Record MGO' }))
    expect(screen.getByTestId('w03-mgo-message')).toHaveTextContent('Not recorded: Enter the owner’s initials')
    await user.type(screen.getByLabelText('Owner (initials)'), 'JS')
    await user.click(screen.getByRole('button', { name: 'Record MGO' }))
    expect(screen.getByTestId('w03-mgo-message')).toHaveTextContent('MGO-001 recorded with 1 link(s)')
    await user.selectOptions(level, 'goal')
    await user.selectOptions(screen.getByLabelText('Elaborated from (mission)'), 'MGO-001')
    await user.type(screen.getByLabelText('MGO name'), 'Short waits')
    await user.type(screen.getByLabelText('MGO statement'), 'Passengers board soon after they confirm a ride.')
    await user.click(screen.getByRole('button', { name: 'Record MGO' }))
    expect(screen.getByTestId('w03-mgo-message')).toHaveTextContent('MGO-002 recorded with 1 link(s)')
    await user.selectOptions(level, 'objective')
    await user.type(screen.getByLabelText('MGO name'), 'Wait objective')
    await user.type(screen.getByLabelText('MGO statement'), 'Provide an excellent boarding experience for every passenger.')
    const checks = screen.getByTestId('w03-mgo-checks')
    expect(checks).toHaveTextContent('record the objective with its measure')
    expect(checks).toHaveTextContent('“excellent” cannot be observed')
    expect(checks).toHaveTextContent('choose its parent goal')
    await user.click(screen.getByRole('button', { name: 'Record MGO' }))
    expect(screen.getByTestId('w03-mgo-message')).toHaveTextContent('Not recorded')
    expect(screen.getByTestId('w03-mgo-coverage')).toHaveTextContent('1 mission, 1 goal(s), 0 objective(s)')
  }, 30000)
})
