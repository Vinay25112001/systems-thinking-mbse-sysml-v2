import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Providers } from '../../state/Providers'
import { useWorkspace } from '../../state/Workspace'
import { ACTIVITIES } from '../week04.activity'
import { QualityLab } from './QualityLab'
import { TraceChecker } from './TraceChecker'
import { TypeClassifier } from './TypeClassifier'

beforeEach(() => window.localStorage.clear())
afterEach(() => cleanup())

function LoadWeek3() {
  const { loadReference } = useWorkspace()
  return (
    <button type="button" onClick={() => loadReference(3)}>
      load week 3
    </button>
  )
}

/** Paste rather than type long text (typing character by character is slow in jsdom). */
async function fill(user: UserEvent, el: HTMLElement, text: string) {
  await user.click(el)
  await user.paste(text)
}

const statusOf = (id: string) => screen.getByTestId('w04-checks').querySelector(`[data-check="${id}"]`)!.getAttribute('data-status')

describe('Week 4 activities', { timeout: 30000 }, () => {
  it('registers three w04- keys', () => {
    expect(Object.keys(ACTIVITIES).every((k) => k.startsWith('w04-'))).toBe(true)
    expect(Object.keys(ACTIVITIES)).toHaveLength(3)
  })

  it('quality lab: a flawed example fails, and a fixed requirement is recorded with its parent link', async () => {
    const user = userEvent.setup()
    render(
      <Providers>
        <LoadWeek3 />
        <QualityLab />
        <TraceChecker />
      </Providers>,
    )
    await user.click(screen.getByRole('button', { name: 'load week 3' }))
    await user.selectOptions(screen.getByLabelText('Start from a flawed example'), 'F2')
    await user.click(screen.getByRole('button', { name: 'Load into editor' }))
    expect(statusOf('single-shall')).toBe('fail')
    expect(statusOf('vague')).toBe('fail')
    expect(statusOf('binding')).toBe('advisory')
    await user.click(screen.getByRole('button', { name: 'Record in workspace' }))
    expect(screen.getByTestId('w04-quality-message')).toHaveTextContent('Not recorded')

    await user.selectOptions(screen.getByLabelText('Level'), 'STK')
    const stmt = screen.getByLabelText('Requirement statement')
    await user.clear(stmt)
    await fill(user, stmt, 'The AeroLink service shall return an aircraft arriving at a hub vertiport to dispatch-ready status within 25 min of its arrival on the pad.')
    await user.selectOptions(screen.getByLabelText('Verification method'), 'test')
    await fill(user, screen.getByLabelText('Verification success criterion'), 'Pad arrival to dispatch-ready <= 25 min')
    await fill(user, screen.getByLabelText('Rationale'), 'Turnaround time sets how many departures a pad can support; 25 min is the 20 min charge plus 5 min handling.')
    await user.click(screen.getByRole('checkbox', { name: /NEED-004/ }))
    expect(statusOf('single-shall')).toBe('pass')
    expect(statusOf('parent')).toBe('pass')
    await user.click(screen.getByRole('button', { name: 'Record in workspace' }))
    expect(screen.getByTestId('w04-quality-message')).toHaveTextContent('Not recorded: Enter the owner’s initials')
    await user.type(screen.getByLabelText('Owner (initials)'), 'LT')
    await user.selectOptions(screen.getByLabelText('Provenance'), 'AI-suggested-reviewed')
    await user.click(screen.getByRole('button', { name: 'Record in workspace' }))
    expect(screen.getByTestId('w04-quality-message')).toHaveTextContent('REQ-STK-001 recorded, with 1 link(s)')
    expect(screen.getByTestId('w04-trace-REQ-STK-001')).toHaveTextContent('NEED-004')
    expect(screen.getByTestId('w04-trace-REQ-STK-001')).toHaveTextContent('LT / AI-suggested-reviewed')
    expect(screen.getByTestId('w04-set-summary')).toHaveTextContent('Size: 1 requirements (1 REQ-STK, 0 REQ-SYS)')
  })

  it('quality lab: a TBD needs an AROU item; a new Unknown is created with the requirement', async () => {
    const user = userEvent.setup()
    render(
      <Providers>
        <LoadWeek3 />
        <QualityLab />
      </Providers>,
    )
    await user.click(screen.getByRole('button', { name: 'load week 3' }))
    await fill(user, screen.getByLabelText('Requirement statement'), 'The charging system shall limit the combined power of all chargers at a vertiport to at most TBD-02 kW.')
    await user.selectOptions(screen.getByLabelText('Type'), 'constraint')
    await user.selectOptions(screen.getByLabelText('Verification method'), 'test')
    await fill(user, screen.getByLabelText('Rationale'), 'Exceeding the agreed grid connection trips protection and incurs penalty tariffs.')
    await fill(user, screen.getByLabelText('Verification success criterion'), 'Combined charger power <= TBD-02 kW in every tested load case')
    await user.click(screen.getByRole('checkbox', { name: /CAP-010/ }))
    expect(statusOf('tbx')).toBe('fail')
    await fill(user, screen.getByLabelText('Unknown name'), 'Grid connection limit')
    await fill(user, screen.getByLabelText('Unknown owner (role)'), 'Vertiport Infrastructure Manager')
    await fill(user, screen.getByLabelText('What is unknown'), 'The utility has not confirmed the connection capacity at each vertiport')
    // resolution work and need-by date are required (W4-F05)
    expect(statusOf('tbx')).toBe('fail')
    await fill(user, screen.getByLabelText('Resolution work (how it will be closed)'), 'Signed connection agreement for each vertiport')
    await fill(user, screen.getByLabelText('Need-by date or milestone'), 'Before the Week 7 trade study')
    expect(statusOf('tbx')).toBe('pass')
    await user.type(screen.getByLabelText('Owner (initials)'), 'VM')
    await user.click(screen.getByRole('button', { name: 'Record in workspace' }))
    expect(screen.getByTestId('w04-quality-message')).toHaveTextContent('REQ-SYS-001 recorded and U-002 (tracks TBD-02), with 2 link(s)')
  })

  it('type classifier gives correct, defensible and incorrect feedback', async () => {
    const user = userEvent.setup()
    render(<Providers><TypeClassifier /></Providers>)
    await user.selectOptions(screen.getByLabelText('Level of statement 1'), 'need')
    await user.selectOptions(screen.getByLabelText('Type of statement 1'), 'none')
    await user.selectOptions(screen.getByLabelText('Level of statement 7'), 'system')
    await user.selectOptions(screen.getByLabelText('Type of statement 7'), 'performance')
    await user.selectOptions(screen.getByLabelText('Level of statement 3'), 'stakeholder')
    await user.selectOptions(screen.getByLabelText('Type of statement 3'), 'performance')
    await user.click(screen.getByRole('button', { name: 'Check my classification' }))
    expect(screen.getByTestId('w04-class-score')).toHaveTextContent('1 match the key, 1 defensible, 1 do not match, 9 unanswered')
    expect(within(screen.getByTestId('w04-class-fb-REQ-SYS-001')).getByText(/Your level differs/)).toBeInTheDocument()
  })

  it('trace checker audits the reference set and draws an RB-3 sample', async () => {
    const user = userEvent.setup()
    render(<Providers><TraceChecker /></Providers>)
    expect(screen.getByTestId('w04-set-summary')).toHaveTextContent('Size: 0 requirements')
    await user.click(screen.getByLabelText(/Instructor reference/))
    expect(screen.getByTestId('w04-set-summary')).toHaveTextContent('20 requirements (10 REQ-STK, 10 REQ-SYS)')
    expect(screen.getByTestId('w04-set-summary')).toHaveTextContent('20 of 20 requirements have no failing heuristic check')
    await user.click(screen.getByRole('button', { name: 'Draw sample' }))
    expect(screen.getByTestId('w04-rb3')).toHaveTextContent('RB-3.1 Well-formed10 of 10 (100 %)4')
  })
})
