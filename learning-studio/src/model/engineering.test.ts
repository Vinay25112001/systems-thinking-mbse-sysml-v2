import { describe, expect, it } from 'vitest'
import { completeThreads, impactSet, isWellFormedId, nextId, orphansAndChildless, requirementCoverage, threadsFrom, validateModel, type EngineeringModel, type Element, type Link } from './engineering'

const el = (id: string, name = id): Element => ({ id, kind: id.split('-')[0] as Element['kind'], name, provenance: 'instructor-reference', status: 'active' })
let n = 0
const ln = (source: string, type: Link['type'], target: string): Link => ({ id: `LNK-${++n}`, source, type, target })

/** One complete 11-link thread, built link by link in the order of THREAD_STEPS. */
function threadModel(): EngineeringModel {
  n = 0
  return {
    elements: ['STK-001', 'NEED-001', 'CAP-001', 'REQ-STK-001', 'REQ-SYS-001', 'FN-001', 'LOG-001', 'PHY-001', 'INFO-001', 'VER-001', 'MOP-001', 'R-001', 'NEED-002'].map((id) => el(id)),
    links: [
      ln('NEED-001', 'derives-from', 'STK-001'),
      ln('CAP-001', 'derives-from', 'NEED-001'),
      ln('REQ-STK-001', 'derives-from', 'CAP-001'),
      ln('REQ-SYS-001', 'derives-from', 'REQ-STK-001'),
      ln('REQ-SYS-001', 'allocated-to', 'FN-001'),
      ln('LOG-001', 'performs', 'FN-001'),
      ln('LOG-001', 'allocated-to', 'PHY-001'),
      ln('PHY-001', 'flows-to', 'INFO-001'),
      ln('VER-001', 'verifies', 'REQ-SYS-001'),
      ln('MOP-001', 'measures', 'REQ-SYS-001'),
      ln('R-001', 'affects', 'PHY-001'),
      ln('PHY-001', 'satisfies', 'REQ-SYS-001'),
    ],
  }
}

describe('engineering model', () => {
  it('accepts a well-formed model', () => {
    expect(validateModel(threadModel())).toEqual([])
  })

  it('enforces the ID scheme, including REQ-STK / REQ-SYS', () => {
    expect(isWellFormedId('REQ-SYS-014', 'REQ')).toBe(true)
    expect(isWellFormedId('REQ-014', 'REQ')).toBe(false)
    expect(isWellFormedId('STK-7', 'STK')).toBe(false)
  })

  it('never reuses an issued ID, even after the element is deleted', () => {
    const m = threadModel()
    expect(nextId('STK', m)).toBe('STK-002')
    expect(nextId('STK', { elements: [], links: [] }, { STK: 9 })).toBe('STK-010')
    expect(nextId('REQ', m, {}, 'STK')).toBe('REQ-STK-002')
  })

  it('rejects dangling links, duplicates and disallowed relationships', () => {
    const m = threadModel()
    m.links.push(ln('STK-001', 'verifies', 'REQ-SYS-001')) // a stakeholder cannot verify
    m.links.push(ln('NEED-001', 'derives-from', 'STK-999'))
    m.elements.push(el('CAP-001'))
    const codes = validateModel(m).map((i) => i.code).sort()
    expect(codes).toEqual(['dangling-link', 'duplicate-id', 'link-not-allowed'])
  })

  it('finds one complete thread and reports every step', () => {
    const threads = completeThreads(threadModel())
    expect(threads).toHaveLength(1)
    expect(threads[0].ids).toEqual(['STK-001', 'NEED-001', 'CAP-001', 'REQ-SYS-001', 'FN-001', 'LOG-001', 'PHY-001', 'INFO-001', 'VER-001', 'MOP-001', 'R-001'])
  })

  it('mutation: removing any one thread link breaks completeness at the right step', () => {
    const steps: [string, number][] = [
      ['NEED-001>STK-001', 1], ['CAP-001>NEED-001', 2], ['REQ-STK-001>CAP-001', 3], ['REQ-SYS-001>FN-001', 4], ['LOG-001>FN-001', 5],
      ['LOG-001>PHY-001', 6], ['PHY-001>INFO-001', 7], ['VER-001>REQ-SYS-001', 8], ['MOP-001>REQ-SYS-001', 9], ['R-001>PHY-001', 10],
    ]
    for (const [key, step] of steps) {
      const m = threadModel()
      m.links = m.links.filter((l) => `${l.source}>${l.target}` !== key)
      expect(completeThreads(m), key).toHaveLength(0)
      const best = Math.max(...threadsFrom(m, 'STK-001').map((t) => t.reachedStep))
      expect(best, key).toBe(step)
    }
  })

  it('retired elements break threads and drop out of coverage', () => {
    const m = threadModel()
    m.elements = m.elements.map((e) => (e.id === 'VER-001' ? { ...e, status: 'retired', retiredReason: 'superseded' } : e))
    expect(completeThreads(m)).toHaveLength(0)
    expect(requirementCoverage(m).find((c) => c.id === 'REQ-SYS-001')?.verified).toBe(false)
  })

  it('computes coverage, orphans and childless parents', () => {
    const m = threadModel()
    m.elements.push(el('REQ-SYS-002'))
    const cov = Object.fromEntries(requirementCoverage(m).map((c) => [c.id, c]))
    expect(cov['REQ-SYS-001']).toMatchObject({ hasParent: true, satisfied: true, verified: true })
    expect(cov['REQ-SYS-002']).toMatchObject({ hasParent: false, satisfied: false, verified: false })
    const { orphans, childless } = orphansAndChildless(m)
    expect(orphans).toEqual(['REQ-SYS-002'])
    expect(childless).toEqual(['NEED-001', 'NEED-002']) // NEED-001's only child is a capability, not a requirement
  })

  it('a thread uses the information item related to its own function or logical element', () => {
    const m = threadModel()
    m.elements.push(el('INFO-002'))
    // PHY-001 produces INFO-002 first (so it is the first-linked item) but INFO-002 touches nothing else in the
    // thread; INFO-001 also flows to LOG-001
    m.links.unshift(ln('PHY-001', 'flows-to', 'INFO-002'))
    m.links.push(ln('INFO-001', 'flows-to', 'LOG-001'))
    expect(completeThreads(m)[0].ids[7]).toBe('INFO-001')
    // mutation: without the LOG link the first-linked item (INFO-002) is chosen
    m.links = m.links.filter((l) => !(l.source === 'INFO-001' && l.target === 'LOG-001'))
    expect(completeThreads(m)[0].ids[7]).toBe('INFO-002')
  })

  it('impact analysis returns distances and the link path used', () => {
    const imp = impactSet(threadModel(), 'PHY-001', 1)
    expect(imp.map((x) => x.id).sort()).toEqual(['INFO-001', 'LOG-001', 'R-001', 'REQ-SYS-001'])
    expect(imp.every((x) => x.distance === 1 && x.via.length === 1)).toBe(true)
    const two = impactSet(threadModel(), 'PHY-001', 2)
    expect(two.find((x) => x.id === 'VER-001')).toMatchObject({ distance: 2 })
  })
})
