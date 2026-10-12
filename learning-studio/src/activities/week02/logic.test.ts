import { describe, expect, it } from 'vitest'
import { citationInRange } from '../../content/readings'
import { referenceUpTo } from '../../model/reference'
import { INSTRUCTOR_EXAMPLE } from '../../model/airtaxi'
import { validateStakeholderMap } from '../../model/stakeholderValidation'
import { checkEntry, isGenericConcern, l2Coverage, riskFormIssues, type Entry } from './register'
import { CHARACTERISTICS, SOS_CASES, evaluateCase, maierVerdict, sosType, verdictFollows, type Ratings } from './sos'
import { DECISIONS, GATE_SCENARIOS, REVIEW_ITEMS, REVIEW_TYPES, STAGE_ITEMS, STAGES, scoreKeyed, type DecisionId, type StageId } from './lifecycle'
import {
  EXCLUDED_STAKEHOLDERS,
  MATRIX_STAKEHOLDERS,
  VARIABLES,
  compareWithKey,
  conflictsByPair,
  findConflicts,
  keyMatrix,
  refStakeholder,
  requiredSupport,
  supportGaps,
  type Matrix,
} from './conflicts'

describe('Maier verdict (R08 p.832–833, R09 p.866)', () => {
  it('needs both principal characteristics', () => {
    expect(maierVerdict({ operational: 'yes', managerial: 'yes' })).toBe('sos')
    expect(maierVerdict({ operational: 'yes', managerial: 'no' })).toBe('not-sos')
    expect(maierVerdict({ operational: 'no', managerial: 'yes' })).toBe('not-sos')
    expect(maierVerdict({ operational: 'partly', managerial: 'yes' })).toBe('borderline')
    expect(maierVerdict({ operational: 'yes' })).toBeUndefined()
  })

  it('is not decided by geographic distribution, emergence or evolution (mutation: all three present, no managerial independence)', () => {
    const r: Ratings = { operational: 'yes', managerial: 'no', geographic: 'yes', emergent: 'yes', evolutionary: 'yes' }
    expect(maierVerdict(r)).toBe('not-sos')
    const f = evaluateCase(SOS_CASES[0], { ratings: r, verdict: 'sos', governance: {} })
    expect(f.consistent).toBe(false)
    expect(f.decidedByNonPrincipal).toBe(true)
  })

  it('every case key is self-consistent with the rule, and every SoS case has a type consistent with its governance', () => {
    for (const c of SOS_CASES) {
      expect(maierVerdict(c.key), c.id).toBe(c.verdict)
      if (c.verdict === 'sos') {
        expect(c.governance && sosType(c.governance), c.id).toBe(c.type)
      } else {
        expect(c.type, c.id).toBeUndefined()
      }
    }
  })

  it('the case set contains SoS and non-SoS cases, and at least one non-SoS case that is distributed and emergent', () => {
    expect(SOS_CASES.some((c) => c.verdict === 'sos')).toBe(true)
    expect(SOS_CASES.some((c) => c.verdict === 'not-sos' && c.key.geographic === 'yes' && c.key.emergent === 'yes')).toBe(true)
  })

  it('a fully correct answer scores 5 of 5 and is consistent', () => {
    const c = SOS_CASES.find((x) => x.id === 'regional-uam')!
    const f = evaluateCase(c, { ratings: c.key, verdict: c.verdict, governance: c.governance!, type: c.type })
    expect(f).toMatchObject({ ratingMatches: 5, ratingsAnswered: 5, consistent: true, verdictMatchesKey: true, typeConsistent: true, typeMatchesKey: true, decidedByNonPrincipal: false })
  })

  it('a "partly" rating argued down to "not an SoS" is consistent but flagged as needing the argument (R09 p.866); "SoS" is not', () => {
    const partly: Ratings = { operational: 'partly', managerial: 'yes' }
    expect(verdictFollows('not-sos', 'borderline')).toBe(true)
    expect(verdictFollows('borderline', 'borderline')).toBe(true)
    expect(verdictFollows('sos', 'borderline')).toBe(false)
    expect(verdictFollows('borderline', 'not-sos')).toBe(false)
    const ent = SOS_CASES.find((c) => c.id === 'ent-001')!
    const f = evaluateCase(ent, { ratings: partly, verdict: 'not-sos', governance: {} })
    expect(f).toMatchObject({ impliedVerdict: 'borderline', consistent: true, needsArgument: true, verdictMatchesKey: true })
    expect(evaluateCase(ent, { ratings: partly, verdict: 'sos', governance: {} })).toMatchObject({ consistent: false, verdictMatchesKey: false })
  })

  it('distinguishes boundary A from Week 1’s ENT-001 (same name, different boundary, different verdict)', () => {
    const a = SOS_CASES.find((c) => c.id === 'aerolink-owned')!
    const ent = SOS_CASES.find((c) => c.id === 'ent-001')!
    expect(a.name).not.toContain('(ENT-001)')
    expect(a.verdict).toBe('not-sos')
    expect(ent.verdict).toBe('borderline')
    expect(ent.description).toContain('vertiports and chargers')
  })

  it('every SoS case argues operational independence for every constituent, AeroLink included (R08 p.832)', () => {
    const uam = SOS_CASES.find((c) => c.id === 'regional-uam')!
    expect(uam.why.operational).toMatch(/AeroLink is useful without/)
    expect(uam.description).toMatch(/FICTIONAL premises/)
    const eco = SOS_CASES.find((c) => c.id === 'multimodal-ecosystem')!
    expect(eco.why.operational).toMatch(/map apps are useful/)
  })

  it('characteristic citations are inside verified ranges', () => {
    for (const x of CHARACTERISTICS) expect(citationInRange(x.cite), x.id).toBe(true)
    expect(CHARACTERISTICS.filter((x) => x.principal).map((x) => x.id)).toEqual(['operational', 'managerial'])
  })
})

describe('SoS type rule (R09 p.868–869)', () => {
  it('maps governance answers to the four types', () => {
    expect(sosType({ agreedPurpose: false })).toBe('virtual')
    expect(sosType({ agreedPurpose: true, designatedManager: true, subordinated: true })).toBe('directed')
    expect(sosType({ agreedPurpose: true, designatedManager: true, subordinated: false })).toBe('acknowledged')
    expect(sosType({ agreedPurpose: true, designatedManager: false, subordinated: false })).toBe('collaborative')
    expect(sosType({ agreedPurpose: true })).toBeUndefined()
    expect(sosType({})).toBeUndefined()
  })
})

describe('life-cycle explorer', () => {
  it('covers every stage and every decision option, each with an explanation', () => {
    expect(new Set(STAGE_ITEMS.map((i) => i.answer))).toEqual(new Set(STAGES.map((s) => s.id)))
    expect(new Set(GATE_SCENARIOS.map((g) => g.answer))).toEqual(new Set(DECISIONS.map((d) => d.id)))
    expect(new Set(REVIEW_ITEMS.map((i) => i.answer))).toEqual(new Set(REVIEW_TYPES.map((t) => t.id)))
    for (const i of [...STAGE_ITEMS, ...GATE_SCENARIOS, ...REVIEW_ITEMS]) expect(i.why.length).toBeGreaterThan(20)
  })

  it('scores against the key and can fail (mutation: one wrong answer)', () => {
    const right = Object.fromEntries(STAGE_ITEMS.map((i) => [i.id, i.answer])) as Record<string, StageId>
    expect(scoreKeyed(STAGE_ITEMS, right)).toEqual({ correct: 9, answered: 9, total: 9, wrong: [] })
    const mutated = { ...right, s9: 'utilization' as StageId }
    expect(scoreKeyed(STAGE_ITEMS, mutated)).toEqual({ correct: 8, answered: 9, total: 9, wrong: ['s9'] })
    expect(scoreKeyed(STAGE_ITEMS, {})).toEqual({ correct: 0, answered: 0, total: 9, wrong: [] })
  })

  it('g3 accepts "restart" (preferred) and "begin" (R06b p.385), and still rejects "continue" (mutation)', () => {
    const right = Object.fromEntries(GATE_SCENARIOS.map((g) => [g.id, g.answer])) as Record<string, DecisionId>
    expect(scoreKeyed(GATE_SCENARIOS, { ...right, g3: 'begin' }).correct).toBe(5)
    expect(scoreKeyed(GATE_SCENARIOS, { ...right, g3: 'continue' })).toMatchObject({ correct: 4, wrong: ['g3'] })
    expect(scoreKeyed(GATE_SCENARIOS, { ...right, g1: 'begin' })).toMatchObject({ correct: 4, wrong: ['g1'] })
  })
})

describe('stakeholder-conflict matrix', () => {
  it('uses only reference stakeholders STK-001..014', () => {
    for (const id of MATRIX_STAKEHOLDERS) expect(refStakeholder(id).id).toBe(id)
    expect(() => refStakeholder('STK-099')).toThrow()
  })

  it('derives the reference conflicts: 28, two tied at weight 25, and Investors ↔ Communities as the structural pair', () => {
    const cs = findConflicts(keyMatrix())
    expect(cs).toHaveLength(28)
    expect(cs.slice(0, 2)).toEqual([
      { variable: 'V2', up: 'STK-003', down: 'STK-007', weight: 25 },
      { variable: 'V5', up: 'STK-003', down: 'STK-013', weight: 25 },
    ])
    expect(cs.filter((c) => c.weight === 20)).toHaveLength(6)
    const perVariable = Object.fromEntries(VARIABLES.map((v) => [v.id, cs.filter((c) => c.variable === v.id).length]))
    expect(perVariable).toEqual({ V1: 6, V2: 12, V3: 2, V4: 2, V5: 6 })
    const pairs = conflictsByPair(cs)
    expect(pairs[0]).toEqual({ a: 'STK-003', b: 'STK-004', variables: ['V1', 'V2', 'V4', 'V5'], totalWeight: 80 })
    expect(pairs.slice(1, 4).map((p) => [p.a, p.b, p.totalWeight])).toEqual([
      ['STK-004', 'STK-005', 48],
      ['STK-001', 'STK-004', 36],
      ['STK-003', 'STK-008', 30],
    ])
  })

  it('sensitivity: with Communities at influence 3 the structural pair still leads (60), next pair 36', () => {
    const inf = (id: string) => (id === 'STK-004' ? 3 : refStakeholder(id).influence)
    const pairs = conflictsByPair(findConflicts(keyMatrix(), inf))
    expect(pairs.slice(0, 2).map((p) => [p.a, p.b, p.totalWeight])).toEqual([
      ['STK-003', 'STK-004', 60],
      ['STK-004', 'STK-005', 36],
    ])
  })

  it('compares a student matrix with the key; a single flipped cell is detected (mutation)', () => {
    const key = keyMatrix()
    const same = compareWithKey(key)
    expect(same).toMatchObject({ agree: 45, answered: 45, total: MATRIX_STAKEHOLDERS.length * VARIABLES.length, missed: [], extra: [] })
    const flipped: Matrix = { ...key, 'STK-013': { ...key['STK-013'], V5: 'up' } }
    const r = compareWithKey(flipped)
    expect(r.agree).toBe(44)
    expect(r.missed.map((c) => `${c.up}>${c.down}`)).toEqual(['STK-003>STK-013', 'STK-005>STK-013', 'STK-001>STK-013'])
    expect(r.extra.map((c) => `${c.up}>${c.down}`)).toEqual(['STK-013>STK-004'])
  })

  it('an empty matrix has no conflicts and misses all 28', () => {
    expect(findConflicts({})).toEqual([])
    expect(compareWithKey({}).missed).toHaveLength(28)
  })

  it('states its scope: nine stakeholders including the ANSP, and every excluded reference stakeholder is named', () => {
    expect(MATRIX_STAKEHOLDERS).toHaveLength(9)
    expect(MATRIX_STAKEHOLDERS).toContain('STK-007')
    const all = Array.from({ length: 14 }, (_, i) => `STK-${String(i + 1).padStart(3, '0')}`)
    expect([...MATRIX_STAKEHOLDERS, ...EXCLUDED_STAKEHOLDERS.map((x) => x.id)].sort()).toEqual(all)
  })
})

describe('support gap (R63 p.236–237, course convention for required level)', () => {
  it('requires commitment from high influencers', () => {
    expect(requiredSupport(5)).toBe(4)
    expect(requiredSupport(4)).toBe(4)
    expect(requiredSupport(3)).toBe(3)
    expect(requiredSupport(2)).toBe(2)
  })
  it('ranks a high-influence stakeholder at awareness above a low-influence one, and never reports negative gaps', () => {
    const g = supportGaps({ 'STK-013': 1, 'STK-001': 1, 'STK-003': 4 })
    expect(g.map((x) => [x.id, x.gap, x.priority])).toEqual([
      ['STK-013', 3, 15],
      ['STK-001', 2, 6],
      ['STK-003', 0, 0],
    ])
  })
})

describe('concern and AROU recorder rules', () => {
  const GENERIC_MSG = 'This concern is generic'
  const LENGTH_MSG = 'too short'
  const con = (text: string): Entry => ({ kind: 'CON', name: 'Concern', text, target: 'STK-004', owner: 'JS', provenance: 'team-derived' })

  it('rejects generic concerns of five or more words for being generic, not for being short', () => {
    for (const text of [
      'The community is concerned about noise.',
      'Passengers want the service to be safe.',
      'Stakeholders want safety and reliability always',
      'They want low cost and good quality',
    ]) {
      const issues = checkEntry(con(text))
      expect(issues.some((i) => i.includes(GENERIC_MSG)), text).toBe(true)
      expect(issues.some((i) => i.includes(LENGTH_MSG)), text).toBe(false)
      expect(isGenericConcern(text), text).toBe(true)
    }
  })

  it('accepts specific concerns, including every reference concern (CON-001..016)', () => {
    expect(checkEntry(con('Departures after 22:00 wake residents within 300 m of the pad'))).toEqual([])
    expect(checkEntry(con('Late-evening departures wake residents living next to the Riverside pad'))).toEqual([])
    const refCons = referenceUpTo(2).elements.filter((e) => e.kind === 'CON')
    expect(refCons.length).toBeGreaterThanOrEqual(16)
    for (const c of refCons) expect(isGenericConcern(c.text ?? ''), c.id).toBe(false)
  })

  it('rejects a risk with no condition and a risk with no if–then, each for its own reason', () => {
    const risk = (text: string): Entry => ({ kind: 'R', name: 'Siting', text, target: 'STK-013', owner: 'JS', provenance: 'team-derived' })
    const noCondition = checkEntry(risk('If the planning authority refuses residential sites, then demand catchment shrinks'))
    expect(noCondition.some((i) => i.startsWith('State the condition first'))).toBe(true)
    expect(noCondition.some((i) => i.includes('“if …, then …”'))).toBe(false)
    const noIfThen = checkEntry(risk('Given current zoning, the planning authority may refuse residential vertiport sites in 2027'))
    expect(noIfThen.some((i) => i.includes('“if …, then …”'))).toBe(true)
    expect(noIfThen.some((i) => i.startsWith('State the condition first'))).toBe(true)
    expect(checkEntry(risk('Given current zoning, if the planning authority refuses residential sites, then demand catchment shrinks'))).toEqual([])
    const ref = referenceUpTo(2).elements.find((e) => e.id === 'R-001')!
    expect(riskFormIssues(ref.text ?? '')).toEqual([])
  })

  it('requires valid owner initials, and accepts an AI-suggested-reviewed entry with an owner', () => {
    const e = { ...con('Departures after 22:00 wake residents near the pad'), provenance: 'AI-suggested-reviewed' as const }
    expect(checkEntry(e)).toEqual([])
    expect(checkEntry({ ...e, owner: '' }).some((i) => i.includes('initials'))).toBe(true)
    expect(checkEntry({ ...e, owner: 'J5' }).some((i) => i.includes('initials'))).toBe(true)
  })

  it('reports missing name, target, length and owner together', () => {
    expect(checkEntry({ kind: 'A', name: '', text: 'x', target: '', owner: '', provenance: 'team-derived' })).toHaveLength(4)
  })

  it('computes L2 coverage; AROU counts as linked only via affects to an STK or CON (mutations: remove link, retarget)', () => {
    const m = {
      elements: [
        { id: 'STK-001', kind: 'STK' as const, name: 'Passengers', provenance: 'official-S04' as const, status: 'active' as const },
        { id: 'STK-004', kind: 'STK' as const, name: 'Communities', provenance: 'official-S04' as const, status: 'active' as const },
        { id: 'CON-001', kind: 'CON' as const, name: 'Night noise', provenance: 'team-derived' as const, status: 'active' as const },
        { id: 'R-001', kind: 'R' as const, name: 'Siting', provenance: 'team-derived' as const, status: 'active' as const },
        { id: 'A-001', kind: 'A' as const, name: 'Pad slots', provenance: 'team-derived' as const, status: 'active' as const },
        { id: 'ENT-001', kind: 'ENT' as const, name: 'AeroLink', provenance: 'official-S04' as const, status: 'active' as const },
      ],
      links: [
        { id: 'LNK-001', source: 'CON-001', type: 'derives-from' as const, target: 'STK-004' },
        { id: 'LNK-002', source: 'R-001', type: 'affects' as const, target: 'STK-004' },
        { id: 'LNK-003', source: 'A-001', type: 'affects' as const, target: 'CON-001' },
      ],
    }
    expect(l2Coverage(m)).toEqual({ stakeholders: 2, withConcern: 1, missingConcern: ['STK-001'], arou: 2, arouLinked: 2 })
    expect(l2Coverage({ ...m, links: [] })).toMatchObject({ withConcern: 0, arouLinked: 0 })
    const retargeted = { ...m, links: m.links.map((l) => (l.id === 'LNK-003' ? { ...l, target: 'ENT-001' } : l)) }
    expect(l2Coverage(retargeted).arouLinked).toBe(1)
  })

  it('the reference baseline (Week 2) is reported truthfully: every stakeholder has a concern of its own (W2-F04)', () => {
    // The Week 2 answer key states this. If a reference concern is removed or shared again, this test fails: update
    // answerKey in src/content/weeks/week02.ts at the same time.
    const ref = referenceUpTo(2)
    const cov = l2Coverage(ref)
    expect(cov.missingConcern).toEqual([])
    expect(cov).toMatchObject({ stakeholders: 14, withConcern: 14, arou: 6, arouLinked: 6 })
    const stkOf = (con: string) => ref.links.filter((l) => l.source === con && l.type === 'derives-from').map((l) => l.target)
    expect(stkOf('CON-012')).toEqual(['STK-004'])
    expect(stkOf('CON-015')).toEqual(['STK-011'])
    expect(stkOf('CON-016')).toEqual(['STK-013'])
    // no concern is shared between stakeholders
    for (const c of ref.elements.filter((e) => e.kind === 'CON')) expect(stkOf(c.id), c.id).toHaveLength(1)
    // mutation: dropping the OEM concern brings the gap back
    const noOem = { ...ref, links: ref.links.filter((l) => l.source !== 'CON-015') }
    expect(l2Coverage(noOem).missingConcern).toEqual(['STK-011'])
  })

  it('the reference stakeholder map passes every editor acceptance check and covers the six S04 classes (answer-key claim)', () => {
    const checks = validateStakeholderMap(INSTRUCTOR_EXAMPLE.stakeholders, INSTRUCTOR_EXAMPLE.relationships)
    expect(checks.filter((c) => !c.passed).map((c) => c.id)).toEqual([])
    const s04 = ['customers', 'regulators', 'investors', 'community', 'infrastructure', 'safety']
    const cats = new Set(INSTRUCTOR_EXAMPLE.stakeholders.map((s) => s.category))
    expect(s04.every((c) => cats.has(c as never))).toBe(true)
    expect(cats.size).toBe(8)
  })
})

describe('Week 2 content agrees with the activity logic', async () => {
  const { default: week02 } = await import('../../content/weeks/week02')
  it('the conflict numbers quoted in the lesson and answer key are the computed ones', () => {
    const cs = findConflicts(keyMatrix())
    const pairs = conflictsByPair(cs)
    const key = week02.instructorNotes.answerKey.find((k) => k.startsWith('Conflict-matrix key'))!
    expect(key).toContain(`${cs.length} conflicts`)
    expect(key).toContain(`(total ${pairs[0].totalWeight})`)
    const block = week02.blocks.find((b) => b.id === 'w2-worked-conflicts')!
    expect(block.paragraphs[1]).toContain(`yields ${cs.length} conflicts`)
    expect(block.table!.rows.slice(0, 2).map((r) => r[4])).toEqual(cs.slice(0, 2).map((c) => String(c.weight)))
  })
  it('the SoS key in the answer key names every classifier case verdict', () => {
    expect(SOS_CASES.map((c) => c.id)).toEqual(['aerolink-owned', 'ent-001', 'regional-uam', 'metro-line', 'multimodal-ecosystem'])
    const key = week02.instructorNotes.answerKey[0]
    expect(key).toContain('ENT-001 (Week 1 boundary) — OI partly, MI partly')
  })
})
