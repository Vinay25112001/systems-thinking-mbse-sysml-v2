import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { referenceUpTo } from '../../model/reference'
import { Providers } from '../../state/Providers'
import { ACTIVITIES } from '../week12.activity'
import { MODEL_DISPOSITIONS } from './dispositions'
import { planFromElement } from './planner'
import { RidDispositionLog } from './RidDispositionLog'
import { ThreadExplorer } from './ThreadExplorer'
import { TraceAudit } from './TraceAudit'
import { VerPlanner } from './VerPlanner'

const ref = referenceUpTo(12)
const KEY = 'sysml-studio:v1:workspace-model'
const stored = () => JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as { elements: { id: string; kind: string; owner?: string; provenance: string }[]; links: { source: string; type: string; target: string }[] }
const type = (label: RegExp | string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

beforeEach(() => window.localStorage.clear())
afterEach(() => cleanup())

describe('Week 12 activities', { timeout: 30000 }, () => {
  it('registers four w12- keys', () => {
    expect(Object.keys(ACTIVITIES)).toEqual(['w12-thread-explorer', 'w12-trace-audit', 'w12-ver-planner', 'w12-rid-dispositions'])
  })

  it('thread explorer: lists STK-005’s threads with the missing link and walks a complete one hop by hop', () => {
    render(<Providers><ThreadExplorer /></Providers>)
    fireEvent.change(screen.getByLabelText('Stakeholder'), { target: { value: 'STK-005' } })
    expect(screen.getByTestId('w12-thread-count').textContent).toBe('4 complete of 6 thread(s) from STK-005.')
    expect(screen.getByTestId('w12-thread-rows').textContent).toMatch(/REQ-STK-005.*step 5 \(Behavior \(function\)\): The requirement is not allocated to a function/)
    fireEvent.click(screen.getAllByRole('button', { name: /Walk thread/ })[0])
    expect(screen.getByTestId('w12-thread-walk').textContent).toMatch(/VER-001 verifies REQ-SYS-001/)
    expect(screen.getByTestId('w12-thread-walk').textContent).toMatch(/Reached through 1 intermediate requirement\(s\): REQ-STK-005/)
  })

  it('trace audit: computes the reference numbers after a prediction and exports them with the rules', () => {
    render(<Providers><TraceAudit /></Providers>)
    // Predict first: Compute stays disabled until both predictions are percentages.
    expect(screen.getByRole('button', { name: 'Compute the audit' })).toBeDisabled()
    type('% satisfied', '100')
    type('% verified', 'about half')
    expect(screen.getByRole('button', { name: 'Compute the audit' })).toBeDisabled()
    type('% verified', '55')
    fireEvent.click(screen.getByRole('button', { name: 'Compute the audit' }))
    expect(screen.getByTestId('w12-audit-table').textContent).toMatch(/Satisfied12 of 20 \(60 %\)2 of 10 \(20 %\)10 of 10 \(100 %\)/)
    expect(screen.getByTestId('w12-audit-metrics').textContent).toMatch(/your prediction 100 %, off by 40\.0 points.*your prediction 55 %, off by 0\.0 points/)
    expect(screen.getByTestId('w12-audit-gaps').textContent).toMatch(/NEED-011.*No disposition yet/)
    expect(screen.getByTestId('w12-audit-export').textContent).toMatch(/Counting rules/)
    expect(screen.getByTestId('w12-audit-export').textContent).toMatch(/digest [0-9a-f]{8} .*; generated \d{4}-\d{2}-\d{2}T/)
  })

  it('verification planner: blocks a datasheet "inspection" and saves a sound plan with owner and provenance via apply', () => {
    window.localStorage.setItem(KEY, JSON.stringify({ elements: ref.elements.filter((e) => e.kind !== 'STK' && e.kind !== 'VER'), links: ref.links.filter((l) => !l.source.startsWith('VER-')), issued: {} }))
    render(<Providers><VerPlanner /></Providers>)
    const p = planFromElement(ref.elements.find((e) => e.id === 'VER-001')!)
    fireEvent.change(screen.getByLabelText('Verifies (requirement)'), { target: { value: 'REQ-SYS-001' } })
    fireEvent.change(screen.getByLabelText('Method'), { target: { value: 'inspection' } })
    fireEvent.change(screen.getByLabelText('Level'), { target: { value: 'system' } })
    type('Name', 'Hub charge-time test')
    type(/^Objective/, p.objective)
    type(/^Subject/, p.subject)
    type(/^Environment/, p.environment)
    type(/^Success criterion/, 'Supplier datasheet gives a rated charge time from 20 % of <= 20 min')
    type('Verdict: pass when', p.pass)
    type('Verdict: fail when', p.fail)
    type('Verdict: inconclusive when', p.inconclusive)
    type(/Owner/, 'jd')
    expect(screen.getByTestId('w12-ver-checks').textContent).toMatch(/Inspection checks properties determined by observation/)
    expect(screen.getByRole('button', { name: 'Save to workspace' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Method'), { target: { value: 'test' } })
    type(/^Success criterion/, p.successCriterion)
    fireEvent.change(screen.getByLabelText('Provenance'), { target: { value: 'AI-suggested-reviewed' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save to workspace' }))
    expect(screen.getByTestId('w12-ver-status').textContent).toMatch(/Saved VER-001 verifies REQ-SYS-001 \(JD, AI-suggested-reviewed\)/)
    const s = stored()
    expect(s.elements.find((e) => e.kind === 'VER')).toMatchObject({ owner: 'JD', provenance: 'AI-suggested-reviewed' })
    expect(s.links.some((l) => l.type === 'verifies' && l.target === 'REQ-SYS-001')).toBe(true)
  })

  it('RID disposition log: needs the owner, then records the disposition with owner and provenance', () => {
    render(<Providers><RidDispositionLog /></Providers>)
    const d = MODEL_DISPOSITIONS[0]
    type('RID ID', d.rid)
    fireEvent.change(screen.getByLabelText('Severity received'), { target: { value: d.severity } })
    fireEvent.change(screen.getByLabelText('Disposition'), { target: { value: d.decision } })
    type('RID summary (as received)', d.summary)
    type('Reason', d.reason)
    type(/^Change made/, 'Fixed as suggested by the reviewing team.')
    type(/^Closure evidence/, d.evidence)
    expect(screen.getByTestId('w12-disp-screens').textContent).toMatch(/change: Name the element changed/)
    type(/^Change made/, d.change)
    expect(screen.getByRole('button', { name: 'Add to log' })).toBeDisabled()
    type(/Owner/, 'mk')
    fireEvent.click(screen.getByRole('button', { name: 'Add to log' }))
    expect(screen.getByTestId('w12-disp-list').textContent).toMatch(/RID-T4-01 \[major\] accept:.*\(MK, team-derived\)/)
    expect(screen.getByTestId('w12-disp-set').textContent).toMatch(/Enter how many RIDs your team received/)
  })
})
