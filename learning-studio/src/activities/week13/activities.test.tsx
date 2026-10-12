import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { referenceUpTo } from '../../model/reference'
import { Providers } from '../../state/Providers'
import { ACTIVITIES } from '../week13.activity'
import { ConsistencyReview } from './ConsistencyReview'
import { ImpactExplorer } from './ImpactExplorer'
import { MarginWhatIf } from './MarginWhatIf'

const ref = referenceUpTo(14)
const KEY = 'sysml-studio:v1:workspace-model'
const stored = () => JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as { elements: { id: string; kind: string; owner?: string; provenance: string }[]; links: { source: string; type: string; target: string }[] }
const type = (label: RegExp | string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
const GOOD_REC = 'Do not accept REQ-SYS-001 at 18 min now: keep 20 min unless the supplier shows an estimated charge time at or below 17.4 min, because TPM-001 would be in breach and PHY-003 changes reach REQ-SYS-010.'

beforeEach(() => window.localStorage.clear())
afterEach(() => cleanup())

describe('Week 13 activities', { timeout: 30000 }, () => {
  it('registers three w13- keys', () => {
    expect(Object.keys(ACTIVITIES)).toEqual(['w13-impact-explorer', 'w13-margin-whatif', 'w13-consistency-review'])
  })

  it('impact explorer: prediction first, then the reference set, second order from PHY-003, and an export with the method', () => {
    render(<Providers><ImpactExplorer /></Providers>)
    type('Changed element', 'REQ-SYS-001')
    type(/^Change \(what/, 'REQ-SYS-001 limit 20 min → 18 min')
    type(/New limit for TPM-001/, '18')
    expect(screen.getByTestId('w13-impact-tpm').textContent).toMatch(/margin against the estimate 2 → 0 min/)
    expect(screen.getByRole('button', { name: 'Derive the impact set' })).toBeDisabled()
    type(/Your prediction/, 'about ten')
    expect(screen.getByRole('button', { name: 'Derive the impact set' })).toBeDisabled()
    type(/Your prediction/, '12')
    fireEvent.click(screen.getByRole('button', { name: 'Derive the impact set' }))
    expect(screen.getByTestId('w13-impact-count').textContent).toMatch(/Hop 1: 8 dependent element\(s\) to re-examine \(your prediction 12\); 1 upstream for review\. Undirected reach: 9 within 1 hop, 28 within 2 hops, 63 within 3 hops \(of 203\)/)
    expect(screen.queryByTestId('w13-impact-second')).toBeNull()
    fireEvent.click(screen.getByLabelText('PHY-003 must change in response'))
    expect(screen.getByTestId('w13-impact-second').textContent).toMatch(/REQ-SYS-010.*PHY-003 satisfies REQ-SYS-010/)
    expect(screen.getByTestId('w13-impact-rec').textContent).toMatch(/✗ Problem/)
    type(/^Recommendation/, GOOD_REC)
    expect(screen.getByTestId('w13-impact-rec').textContent).toMatch(/✓ OK/)
    expect(screen.getByTestId('w13-impact-export').textContent).toMatch(/Must change \(engineer’s decision\).\*\* PHY-003/)
    expect(screen.queryByRole('button', { name: 'Save the decision to the workspace' })).toBeNull() // practice mode saves nothing
  })

  it('impact explorer: records a DEC with owner and provenance and affects links via apply (workspace mode)', () => {
    window.localStorage.setItem(KEY, JSON.stringify({ elements: ref.elements.filter((e) => e.kind !== 'STK'), links: ref.links, issued: {} }))
    render(<Providers><ImpactExplorer /></Providers>)
    fireEvent.click(screen.getByLabelText(/Practice on the instructor reference/))
    type('Changed element', 'REQ-SYS-001')
    type(/^Change \(what/, 'REQ-SYS-001 limit 20 min → 18 min')
    type(/Your prediction/, '9')
    fireEvent.click(screen.getByRole('button', { name: 'Derive the impact set' }))
    fireEvent.click(screen.getByLabelText('PHY-003 must change in response'))
    type(/^Recommendation/, GOOD_REC)
    type(/Decision name/, 'Keep REQ-SYS-001 at 20 min')
    expect(screen.getByRole('button', { name: 'Save the decision to the workspace' })).toBeDisabled() // no owner yet
    type(/Owner/, 'ab')
    fireEvent.change(screen.getByLabelText('Provenance'), { target: { value: 'AI-suggested-reviewed' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save the decision to the workspace' }))
    expect(screen.getByTestId('w13-impact-status').textContent).toMatch(/Saved DEC-003 affecting 14 element\(s\) \(AB, AI-suggested-reviewed\)/)
    const s = stored()
    expect(s.elements.find((e) => e.id === 'DEC-003')).toMatchObject({ kind: 'DEC', owner: 'AB', provenance: 'AI-suggested-reviewed' })
    expect(s.links.filter((l) => l.source === 'DEC-003' && l.type === 'affects').map((l) => l.target).sort()).toContain('REQ-SYS-010')
  })

  it('margin what-if: REQ-SYS-001 at 18 min breaches TPM-001; the battery scenario breaches TPM-003 and fires R-002', () => {
    render(<Providers><MarginWhatIf /></Providers>)
    expect(screen.getByTestId('w13-whatif-results').textContent).toMatch(/TPM-00118\.6 min21\.4✓ On track/)
    type('TPM-001 threshold', '18')
    expect(screen.getByTestId('w13-whatif-results').textContent).toMatch(/TPM-00118\.6 min0-0\.6✗ BREACH \(R1\)/)
    fireEvent.click(screen.getByRole('button', { name: /battery usable energy 15 % lower/ }))
    expect(screen.getByTestId('w13-whatif-energy').textContent).toMatch(/landing energy 9\.4 % of usable/)
    expect(screen.getByTestId('w13-whatif-results').textContent).toMatch(/TPM-0037\.9 %-10\.6-12\.1✗ BREACH/)
    expect(screen.getByTestId('w13-whatif-results').textContent).toMatch(/R-002 .*FIRES on the CBE margin, FIRES on the WCE margin/)
    type('TPM-002 contingency', '-1')
    expect(screen.getByRole('alert').textContent).toMatch(/cannot be negative/)
  })

  it('consistency review: checks stay hidden until the student counts; seeded fragment gives the findings; repaired gives none', () => {
    render(<Providers><ConsistencyReview /></Providers>)
    expect(screen.queryByTestId('w13-consistency-findings')).toBeNull()
    expect(screen.getByRole('button', { name: 'Run the consistency checks' })).toBeDisabled()
    type(/How many inconsistencies/, '4')
    fireEvent.click(screen.getByRole('button', { name: 'Run the consistency checks' }))
    expect(screen.getByTestId('w13-consistency-count').textContent).toMatch(/^9 finding\(s\) from 5 check\(s\); you counted 4/)
    expect(screen.getByTestId('w13-consistency-findings').textContent).toMatch(/kW \* h.*Silent/)
    // editing a cell hides the old result until the student runs again
    fireEvent.change(screen.getByLabelText('Row 1 Unit'), { target: { value: 'kW' } })
    expect(screen.queryByTestId('w13-consistency-findings')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Load one repaired fragment/ }))
    type(/How many inconsistencies/, '0')
    fireEvent.click(screen.getByRole('button', { name: 'Run the consistency checks' }))
    expect(screen.getByTestId('w13-consistency-count').textContent).toMatch(/No findings/)
  })
})
