import { describe, expect, it } from 'vitest'
import { INSTRUCTOR_EXAMPLE, SEED_STAKEHOLDERS } from './airtaxi'
import { quadrant, validateStakeholderMap } from './stakeholderValidation'

const pass = (id: string, s = SEED_STAKEHOLDERS, r = [] as typeof INSTRUCTOR_EXAMPLE.relationships) =>
  validateStakeholderMap(s, r).find((c) => c.id === id)!.passed

describe('stakeholder map acceptance checks', () => {
  it('the lab starting point (six lab-sheet entities) does not yet pass CP1', () => {
    const checks = validateStakeholderMap(SEED_STAKEHOLDERS, [])
    expect(checks.find((c) => c.id === 'official')!.passed).toBe(true)
    expect(checks.find((c) => c.id === 'count')!.passed).toBe(false)
    expect(checks.find((c) => c.id === 'characterised')!.passed).toBe(false)
    expect(checks.find((c) => c.id === 'relationships')!.passed).toBe(false)
  })

  it('the instructor example passes every check', () => {
    const checks = validateStakeholderMap(INSTRUCTOR_EXAMPLE.stakeholders, INSTRUCTOR_EXAMPLE.relationships)
    expect(checks.filter((c) => !c.passed)).toEqual([])
  })

  it('detects a missing lab-sheet entity, bad ratings and dangling relationships', () => {
    const s = INSTRUCTOR_EXAMPLE.stakeholders.filter((x) => x.id !== 'STK-002')
    expect(pass('official', s)).toBe(false)
    const bad = INSTRUCTOR_EXAMPLE.stakeholders.map((x) => (x.id === 'STK-001' ? { ...x, interest: 7 } : x))
    expect(pass('ratings', bad)).toBe(false)
    const rels = [...INSTRUCTOR_EXAMPLE.relationships, { id: 'REL-099', source: 'STK-999', target: 'STK-001', type: 'funds' as const, note: '' }]
    expect(pass('integrity', INSTRUCTOR_EXAMPLE.stakeholders, rels)).toBe(false)
  })

  it('places stakeholders in power–interest quadrants', () => {
    expect(quadrant({ interest: 5, influence: 5 })).toBe('Manage closely')
    expect(quadrant({ interest: 1, influence: 5 })).toBe('Keep satisfied')
    expect(quadrant({ interest: 5, influence: 1 })).toBe('Keep informed')
    expect(quadrant({ interest: 1, influence: 1 })).toBe('Monitor')
  })
})
