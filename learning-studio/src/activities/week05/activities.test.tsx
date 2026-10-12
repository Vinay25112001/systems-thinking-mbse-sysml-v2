import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { Providers } from '../../state/Providers'
import { ACTIVITIES } from '../week05.activity'
import { QualityAudit } from './QualityAudit'
import { SysmlReading } from './SysmlReading'
import { TpmTracker } from './TpmTracker'
import { TraceExplorer } from './TraceExplorer'

beforeEach(() => window.localStorage.clear())
afterEach(() => cleanup())

describe('Week 5 activities', { timeout: 20000 }, () => {
  it('registers four w05- keys', () => {
    expect(Object.keys(ACTIVITIES)).toHaveLength(4)
    expect(Object.keys(ACTIVITIES).every((k) => k.startsWith('w05-'))).toBe(true)
  })

  it('trace explorer computes orphans and childless parents for the peer sample and checks a prediction', async () => {
    const user = userEvent.setup()
    render(<Providers><TraceExplorer /></Providers>)
    await user.click(screen.getByLabelText('Orphan REQ-SYS-903'))
    await user.click(screen.getByLabelText('Childless NEED-002'))
    await user.click(screen.getByRole('button', { name: 'Compute the trace and check my prediction' }))
    const r = screen.getByTestId('w05-trace-result')
    expect(r).toHaveTextContent('6 of 8 requirements (75 %)')
    expect(r).toHaveTextContent('missed: REQ-SYS-905')
    expect(r).toHaveTextContent('CAP-002, CAP-004, NEED-002')
    expect(r).toHaveTextContent('missed: CAP-002, CAP-004')
  })

  it('trace explorer on the reference: both childless checks are predicted and checked (REQ-STK-007/009; NEED-011)', async () => {
    const user = userEvent.setup()
    render(<Providers><TraceExplorer /></Providers>)
    await user.click(screen.getByLabelText('Instructor reference (end of Week 5)'))
    await user.click(screen.getByLabelText('Childless stakeholder requirement REQ-STK-007'))
    await user.click(screen.getByRole('button', { name: 'Compute the trace and check my prediction' }))
    const r = screen.getByTestId('w05-trace-result')
    expect(r).toHaveTextContent('REQ-STK-007, REQ-STK-009')
    expect(r).toHaveTextContent('missed: REQ-STK-009')
    expect(r).toHaveTextContent('20 of 20')
    expect(r).toHaveTextContent(/checked: NEED-011./)
  })

  it('TPM tracker flags TPM-002 at risk by the trend rule and a student estimate can breach', async () => {
    const user = userEvent.setup()
    render(<Providers><TpmTracker /></Providers>)
    expect(screen.getByTestId('w05-tpm-status')).toHaveTextContent('Month 9: AT RISK (rule R3)')
    await user.type(screen.getByLabelText('Review month'), '12')
    await user.type(screen.getByLabelText('CBE (dBA)'), '64.4')
    await user.type(screen.getByLabelText('Contingency (dBA)'), '0.8')
    await user.click(screen.getByRole('button', { name: 'Add estimate' }))
    expect(screen.getByTestId('w05-tpm-status')).toHaveTextContent('Month 12: BREACH (rule R1)')
    await user.selectOptions(screen.getByLabelText('TPM'), 'TPM-001')
    expect(screen.getByTestId('w05-tpm-status')).toHaveTextContent('Month 9: On track')
    // contingency and its basis are visible, so the maturing evidence behind the falling contingency can be read
    expect(screen.getByRole('columnheader', { name: 'Basis of the estimate' })).toBeInTheDocument()
    expect(screen.getByText(/production-representative pack \(end item\)/)).toBeInTheDocument()
  })

  it('TPM tracker rejects a review that is not later than the last one', async () => {
    const user = userEvent.setup()
    render(<Providers><TpmTracker /></Providers>)
    await user.type(screen.getByLabelText('Review month'), '6')
    await user.type(screen.getByLabelText('CBE (dBA)'), '63')
    await user.type(screen.getByLabelText('Contingency (dBA)'), '1')
    await user.click(screen.getByRole('button', { name: 'Add estimate' }))
    expect(screen.getByRole('alert')).toHaveTextContent('later than the last one')
  })

  it('SysML reading: select an element, classify it and get feedback', async () => {
    const user = userEvent.setup()
    render(<Providers><SysmlReading /></Providers>)
    await user.click(screen.getByRole('button', { name: /Element 3: EnergyValue on line 13/ }))
    await user.click(screen.getByLabelText('Part usage'))
    await user.click(screen.getByRole('button', { name: 'Check my classifications' }))
    expect(screen.getByTestId('w05-sysml-item-feedback')).toHaveTextContent('Not quite')
    await user.click(screen.getByLabelText('Type (named after the colon)'))
    expect(screen.getByTestId('w05-sysml-item-feedback')).toHaveTextContent('Correct.')
    expect(screen.getByTestId('w05-sysml-score')).toHaveTextContent('1 of 14 correct')
  })

  it('quality audit compares a finding with the key and shows the revision', async () => {
    const user = userEvent.setup()
    render(<Providers><QualityAudit /></Providers>)
    await user.click(screen.getByRole('button', { name: /REQ-SYS-908/ }))
    await user.click(screen.getByLabelText('Complete'))
    await user.click(screen.getByRole('button', { name: 'Check this finding' }))
    const fb = screen.getByTestId('w05-audit-feedback')
    expect(fb).toHaveTextContent('Differs from the key')
    expect(within(fb).getByText(/Not supported by the key: Complete/)).toBeInTheDocument()
  })
})
