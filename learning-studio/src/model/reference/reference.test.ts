import { describe, expect, it } from 'vitest'
import { completeThreads, isWellFormedId, validateModel } from '../engineering'
import { l2Coverage } from '../../activities/week02/register'
import { REFERENCE_BY_WEEK, referenceUpTo } from '.'

describe('instructor reference baseline', () => {
  it('is a valid model at the end of every week (no errors as it grows)', () => {
    for (let w = 1; w <= 14; w++) {
      const errors = validateModel(referenceUpTo(w)).filter((i) => i.severity === 'error')
      expect(errors.map((e) => `wk${w}: ${e.message}`)).toEqual([])
    }
  })

  it('at the end of Week 2 every stakeholder has at least one concern (L2 rule; review W2-F04)', () => {
    expect(l2Coverage(referenceUpTo(2)).missingConcern).toEqual([])
  })

  it('no ID is introduced twice across the week files', () => {
    const ids = Object.values(REFERENCE_BY_WEEK).flatMap((m) => m.elements.map((e) => e.id))
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })

  it('each week file only introduces well-formed IDs', () => {
    for (const m of Object.values(REFERENCE_BY_WEEK)) for (const e of m.elements) expect(isWellFormedId(e.id, e.kind), e.id).toBe(true)
  })

  it('once verification exists (Week 12), at least 3 complete 11-link threads exist (CP5 minimum, lab plan C.5)', () => {
    const m = referenceUpTo(14)
    if (m.elements.some((e) => e.kind === 'VER')) expect(completeThreads(m).length).toBeGreaterThanOrEqual(3)
  })
})
