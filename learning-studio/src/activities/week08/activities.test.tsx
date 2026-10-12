import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { REFERENCE_BY_WEEK, referenceUpTo } from '../../model/reference'
import { Providers } from '../../state/Providers'
import { ACTIVITIES } from '../week08.activity'
import { ArchitectureEditor } from './ArchitectureEditor'
import { InfoTracer } from './InfoTracer'
import { N2Coupling } from './N2Coupling'
import { SatisfyReading } from './SatisfyReading'
import { FN_FLOWS } from './n2'

/** Seeds the workspace with the reference up to Week 7 (CAP and EXT exist) plus the eight reference PHY elements. */
function seedWeek7() {
  const r = referenceUpTo(7)
  const phy = REFERENCE_BY_WEEK[8].elements.filter((e) => e.kind === 'PHY')
  window.localStorage.setItem('sysml-studio:v1:workspace-model', JSON.stringify({ elements: [...r.elements.filter((e) => e.kind !== 'STK'), ...phy], links: r.links, issued: {} }))
}

/** Seeds the workspace with the full Week 8 reference plus the 19 teaching flows recorded as FN → FN links (as the editor records them). */
function seedWeek8WithFlows() {
  const r = referenceUpTo(8)
  const flows = FN_FLOWS.map((f, k) => ({ id: `LNK-T${String(k + 1).padStart(2, '0')}`, source: f.from, type: 'flows-to', target: f.to, rationale: `${f.kind}: ${f.item} [AB · team-derived]` }))
  window.localStorage.setItem('sysml-studio:v1:workspace-model', JSON.stringify({ elements: r.elements.filter((e) => e.kind !== 'STK'), links: [...r.links, ...flows], issued: {} }))
}

beforeEach(() => window.localStorage.clear())
afterEach(() => cleanup())

describe('Week 8 activities', { timeout: 30000 }, () => {
  it('registers four w08- keys', () => {
    expect(Object.keys(ACTIVITIES)).toHaveLength(4)
    expect(Object.keys(ACTIVITIES).every((k) => k.startsWith('w08-'))).toBe(true)
  })

  it('architecture editor rejects a solution-named function and a criterion-less justification, then records FN with owner and AI provenance', async () => {
    seedWeek7()
    const user = userEvent.setup()
    render(<Providers><ArchitectureEditor /></Providers>)
    await user.type(screen.getByLabelText('Function name (verb + object)'), 'Operations centre charging scheduling')
    await user.selectOptions(screen.getByLabelText('Derived from capability'), 'CAP-003')
    await user.selectOptions(screen.getByLabelText('Allocated to physical element'), 'PHY-003')
    await user.type(screen.getByLabelText(/Allocation justification/), 'This function goes here because it seems like the most sensible place for it overall.')
    await user.type(screen.getByLabelText('Owner (initials)'), 'JS')
    await user.click(screen.getByRole('button', { name: 'Check and record' }))
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('names a solution element')
    expect(alert).toHaveTextContent('names no allocation criterion')
    await user.clear(screen.getByLabelText('Function name (verb + object)'))
    await user.type(screen.getByLabelText('Function name (verb + object)'), 'Charge aircraft')
    await user.clear(screen.getByLabelText(/Allocation justification/))
    await user.type(screen.getByLabelText(/Allocation justification/), 'Charging power and the battery handshake are energy and data flows at the pad, so it sits with the chargers (REQ-SYS-001).')
    await user.selectOptions(screen.getByLabelText(/Exercised in scenario/), 'SCN-003')
    await user.selectOptions(screen.getByLabelText('Provenance'), 'AI-suggested-reviewed')
    await user.click(screen.getByRole('button', { name: 'Check and record' }))
    expect(screen.getByTestId('w08-editor-message')).toHaveTextContent('FN-001 recorded (3 links), owner JS, tagged AI-suggested-reviewed')
    const checks = screen.getByTestId('w08-arch-checks')
    expect(within(checks).getByText('Every function is allocated to a physical element').closest('tr')).toHaveTextContent('✓ Pass')
    expect(within(screen.getByTestId('w08-alloc-matrix')).getByText('FN-001 Charge aircraft').closest('tr')).toHaveTextContent('X')
  })

  it('architecture editor records a typed interface with both ends, and refuses one without an owner', async () => {
    seedWeek7()
    const user = userEvent.setup()
    render(<Providers><ArchitectureEditor /></Providers>)
    await user.click(screen.getByLabelText('New interface (typed, both ends)'))
    await user.type(screen.getByLabelText('Interface name'), 'Aircraft to charger power')
    await user.selectOptions(screen.getByLabelText('Interface type'), 'physical')
    await user.selectOptions(screen.getByLabelText('End A'), 'PHY-001')
    await user.selectOptions(screen.getByLabelText('End B'), 'PHY-003')
    await user.type(screen.getByLabelText('Carries'), 'DC energy, charge state')
    await user.click(screen.getByRole('button', { name: 'Check and record' }))
    expect(screen.getByRole('alert')).toHaveTextContent('owner’s initials')
    await user.type(screen.getByLabelText('Owner (initials)'), 'AB')
    await user.click(screen.getByRole('button', { name: 'Check and record' }))
    expect(screen.getByTestId('w08-editor-message')).toHaveTextContent('IF-001 recorded (0 links), owner AB, tagged team-derived')
  })

  it('architecture editor records PHY and refuses an AI capability without oversight and failure considerations', async () => {
    const user = userEvent.setup()
    render(<Providers><ArchitectureEditor /></Providers>)
    expect(screen.getByTestId('w08-architecture-editor')).toHaveTextContent('No physical elements yet')
    await user.click(screen.getByLabelText('New physical element'))
    await user.type(screen.getByLabelText('Physical element name'), 'eVTOL Aircraft')
    await user.type(screen.getByLabelText('Description'), 'Four-seat electric vertical take-off and landing aircraft.')
    await user.type(screen.getByLabelText('Owner (initials)'), 'CD')
    await user.click(screen.getByRole('button', { name: 'Check and record' }))
    expect(screen.getByTestId('w08-editor-message')).toHaveTextContent('PHY-001 recorded')
    await user.click(screen.getByLabelText('New AI-enabled capability'))
    await user.type(screen.getByLabelText('AI capability name'), 'Predictive maintenance')
    await user.type(screen.getByLabelText('Description'), 'Predicts battery degradation from charge-session data.')
    await user.type(screen.getByLabelText('Inputs'), 'Charge-session data')
    await user.type(screen.getByLabelText('Outputs'), 'Ranked at-risk packs')
    await user.click(screen.getByRole('button', { name: 'Check and record' }))
    expect(screen.getByRole('alert')).toHaveTextContent('human oversight, failure considerations (RB-7.6)')
  })

  it('architecture editor shows the reference passing every required check', async () => {
    const user = userEvent.setup()
    render(<Providers><ArchitectureEditor /></Providers>)
    await user.click(screen.getByLabelText('Instructor reference (read-only)'))
    const rows = within(screen.getByTestId('w08-arch-checks')).getAllByRole('row')
    expect(rows.filter((r) => r.textContent?.includes('✗ Fail'))).toHaveLength(0)
    expect(rows.find((r) => r.textContent?.includes('at least one interface'))).toHaveTextContent('PHY-006')
  })

  it('N² tool counts reference interfaces and compares the two allocation alternatives', async () => {
    const user = userEvent.setup()
    render(<Providers><N2Coupling /></Providers>)
    expect(screen.getByTestId('w08-if-counts')).toHaveTextContent('14 interfaces: 3 physical, 9 information, 2 organisational')
    expect(screen.getByTestId('w08-if-counts')).toHaveTextContent('Elements with no interface: PHY-006')
    await user.click(screen.getByLabelText('Alternative B'))
    await user.click(screen.getByRole('button', { name: 'Compute coupling' }))
    const res = screen.getByTestId('w08-coupling-result')
    expect(res).toHaveTextContent('0.526')
    expect(res).toHaveTextContent('0.842')
    expect(screen.getByTestId('w08-coupling-verdict')).toHaveTextContent('Alternative A has the lower coupling. Your prediction was not right')
    // The reference interfaces (IF-001..014, corrected after the Week 8 review) carry every crossing flow of A; B keeps four gaps.
    expect(screen.getByTestId('w08-gaps')).toHaveTextContent(/organisational interface carries no flow\): none\.$/)
    await user.click(screen.getAllByLabelText('Alternative B').at(-1)!)
    expect(screen.getByTestId('w08-gaps')).toHaveTextContent('PHY-001–PHY-002 (F12; only IF-001 physical); PHY-002–PHY-003 (F11; no interface); PHY-002–PHY-005 (F10; no interface); PHY-002–PHY-007 (F01, F02; no interface)')
    await user.click(screen.getAllByLabelText('Alternative A').at(-1)!)
    await user.selectOptions(screen.getByLabelText('Alternative B: FN-011'), 'PHY-004')
    await user.click(screen.getByRole('button', { name: 'Compute coupling' }))
    expect(screen.getByTestId('w08-coupling-result')).toHaveTextContent('0.737')
  })

  it('N² tool computes the graduate comparison from the workspace: recorded flows, recorded allocation as A, B set by the student', async () => {
    seedWeek8WithFlows()
    const user = userEvent.setup()
    render(<Providers><N2Coupling /></Providers>)
    await user.click(screen.getByLabelText(/My workspace/))
    expect(screen.getByTestId('w08-n2-coupling')).toHaveTextContent('Your workspace: 19 function-to-function flows')
    await user.click(screen.getByRole('button', { name: 'Compute coupling' }))
    // A = B = the recorded allocation until the student changes B.
    expect(screen.getByTestId('w08-coupling-verdict')).toHaveTextContent('Both alternatives have the same coupling')
    expect(screen.getByTestId('w08-coupling-result')).toHaveTextContent('0.526')
    await user.selectOptions(screen.getByLabelText(/Alternative B: FN-002/), 'PHY-002')
    await user.selectOptions(screen.getByLabelText(/Alternative B: FN-011/), 'PHY-002')
    await user.click(screen.getByRole('button', { name: 'Compute coupling' }))
    expect(screen.getByTestId('w08-coupling-result')).toHaveTextContent('0.842')
    expect(screen.getByTestId('w08-coupling-verdict')).toHaveTextContent('Alternative A has the lower coupling')
  })

  it('N² tool in workspace mode with no recorded flows says there is nothing to compute', async () => {
    seedWeek7()
    const user = userEvent.setup()
    render(<Providers><N2Coupling /></Providers>)
    await user.click(screen.getByLabelText(/My workspace/))
    expect(screen.getByRole('note')).toHaveTextContent('no function-to-function flows yet')
    expect(screen.getByRole('button', { name: 'Compute coupling' })).toBeDisabled()
  })

  it('architecture editor records a function-to-function flow with kind, item, owner and provenance in the link', async () => {
    seedWeek8WithFlows()
    const user = userEvent.setup()
    render(<Providers><ArchitectureEditor /></Providers>)
    await user.click(screen.getByLabelText('New function-to-function flow (for the N² coupling)'))
    await user.type(screen.getByLabelText('Item that flows'), 'Pad availability')
    await user.selectOptions(screen.getByLabelText('From function (producer)'), 'FN-014')
    await user.selectOptions(screen.getByLabelText('To function (consumer)'), 'FN-002')
    await user.type(screen.getByLabelText('Owner (initials)'), 'EF')
    await user.click(screen.getByRole('button', { name: 'Check and record' }))
    expect(screen.getByRole('alert')).toHaveTextContent('information, energy or material')
    await user.selectOptions(screen.getByLabelText('Kind of flow'), 'information')
    await user.click(screen.getByRole('button', { name: 'Check and record' }))
    expect(screen.getByTestId('w08-editor-message')).toHaveTextContent('Flow FN-014 → FN-002 recorded (1 link), owner EF')
    const stored = JSON.parse(window.localStorage.getItem('sysml-studio:v1:workspace-model') ?? '{}') as { links: { source: string; target: string; rationale?: string }[] }
    expect(stored.links.find((l) => l.source === 'FN-014' && l.target === 'FN-002')?.rationale).toBe('information: Pad availability [EF · team-derived]')
  })

  it('information tracer scores a prediction on the peer sample and the data-or-information set', async () => {
    const user = userEvent.setup()
    render(<Providers><InfoTracer /></Providers>)
    await user.click(screen.getByLabelText(/INFO-101 Charger telemetry/))
    await user.click(screen.getByLabelText(/INFO-103 Wind observations/))
    await user.click(screen.getByRole('button', { name: 'Trace and check my prediction' }))
    const r = screen.getByTestId('w08-info-result')
    expect(r).toHaveTextContent('4 of 5 items fail a required rule')
    expect(r).toHaveTextContent('missed: INFO-102, INFO-104, INFO-105')
    expect(r).toHaveTextContent('flagged but passing: INFO-103')
    const d1 = screen.getByRole('group', { name: /Cell temperatures of pack 7/ })
    await user.click(within(d1).getByLabelText('data'))
    const d2 = screen.getByRole('group', { name: /capacity-fade limit/ })
    await user.click(within(d2).getByLabelText('data'))
    await user.click(screen.getByRole('button', { name: 'Check classifications' }))
    expect(screen.getByTestId('w08-di-score')).toHaveTextContent('1 of 6 correct')
  })

  it('SysML reading classifies the satisfy keyword and checks the assertion question', async () => {
    const user = userEvent.setup()
    render(<Providers><SatisfyReading /></Providers>)
    await user.click(screen.getByRole('button', { name: /Element 7: satisfy on line 28/ }))
    await user.click(screen.getByLabelText('Satisfy relationship'))
    await user.click(screen.getByRole('button', { name: 'Check my classifications' }))
    expect(screen.getByTestId('w08-role-score')).toHaveTextContent('1 of 9 correct (1 answered)')
    expect(screen.getByTestId('w08-role-feedback')).toHaveTextContent('assert constraint usage')
    await user.click(screen.getByLabelText(/That PHY-003 has passed/))
    await user.click(screen.getByRole('button', { name: 'Check my answer' }))
    expect(screen.getByTestId('w08-assertion-feedback')).toHaveTextContent('✗ Not this one')
  })
})
