import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_PROVENANCE_OWNER, ownerProblem, ProvenanceOwnerFields, type ProvenanceOwner } from './ProvenanceOwnerFields'

function Harness() {
  const [v, setV] = useState<ProvenanceOwner>(DEFAULT_PROVENANCE_OWNER)
  return (
    <>
      <ProvenanceOwnerFields value={v} onChange={setV} />
      <output data-testid="out">{JSON.stringify(v)}</output>
    </>
  )
}

describe('ProvenanceOwnerFields', () => {
  it('validates owner initials', () => {
    expect(ownerProblem('JS')).toBeNull()
    expect(ownerProblem('ABCD')).toBeNull()
    expect(ownerProblem('J')).not.toBeNull()
    expect(ownerProblem('J.S.')).not.toBeNull()
    expect(ownerProblem('')).not.toBeNull()
  })

  it('lets a student tag an element as AI-suggested and reviewed, and prompts for the AI statement', () => {
    render(<Harness />)
    fireEvent.change(screen.getByLabelText('Owner (initials)'), { target: { value: 'JS' } })
    fireEvent.change(screen.getByLabelText('Provenance'), { target: { value: 'AI-suggested-reviewed' } })
    expect(JSON.parse(screen.getByTestId('out').textContent!)).toEqual({ owner: 'JS', provenance: 'AI-suggested-reviewed' })
    expect(screen.getByText(/AI usage statement/)).toBeInTheDocument()
  })

  it('shows an accessible error for malformed initials', () => {
    render(<Harness />)
    fireEvent.change(screen.getByLabelText('Owner (initials)'), { target: { value: 'J' } })
    expect(screen.getByRole('alert')).toHaveTextContent('initials')
  })
})
