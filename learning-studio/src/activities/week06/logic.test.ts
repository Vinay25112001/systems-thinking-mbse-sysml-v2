import { describe, expect, it } from 'vitest'
import { referenceUpTo } from '../../model/reference'
import type { EngineeringModel } from '../../model/engineering'
import { TECHNOLOGIES, TRL_KEY, checkTrl, emptyTrl, ladderGaps, ladderLevel, lowestCritical, needsMaturityRisk, type TrlInput } from './trl'
import { CONSEQUENCE, LIKELIHOOD, attributesFor, cellLevel, checkEntry, entryFrom, handlingAdvice, isConditionIfThen, plotRisks, registerCompleteness, type RegisterEntry } from './risk'
import { R008_EXAMPLE, compareWithOrdinal, eventTree, likelihoodBand, pAtLeastOne, pAtLeastOneBinomial, sensitivity } from './quant'
import { SRR_CRITERIA, checkFinding, recommend, reviewRecord, type Review } from './srr'

const yesTo = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, 'yes' as const]))

const goodTrl = (patch: Partial<TrlInput> = {}): TrlInput => ({
  ...emptyTrl('TECH-002'),
  ladder: yesTo(5),
  claimed: 5,
  basis: 'assumption',
  assumptionId: 'A-004',
  assumptionText: 'The cell supplier has validated the cell at pack level under fast-charge cycling; to be confirmed by cycle-test data before the fleet order.',
  relevantEnv: 'pack-level cycling at 20 fast charges per day at hub ambient temperatures',
  critical: true,
  maturityRisk: 'R-002',
  ...patch,
})

describe('TRL assessor (R16 p.767 scale; R60 p.525–526)', () => {
  it('reads the ladder as the last consecutive yes from TRL 1', () => {
    expect(ladderLevel({})).toBe(0)
    expect(ladderLevel(yesTo(4))).toBe(4)
    expect(ladderLevel({ ...yesTo(3), 4: 'unknown', 5: 'yes' })).toBe(3)
    expect(ladderGaps({ ...yesTo(3), 4: 'no', 6: 'yes' })).toEqual([6])
  })

  it('accepts a complete assumption-based assessment', () => {
    expect(checkTrl(goodTrl())).toEqual([])
  })

  it('mutation: a TRL above what the ladder supports is an error', () => {
    const f = checkTrl(goodTrl({ claimed: 6 }))
    expect(f.some((x) => x.severity === 'error' && /support only TRL 5/.test(x.message))).toBe(true)
  })

  it('mutation: no basis, a malformed assumption ID, or a missing relevant-environment definition each fail', () => {
    expect(checkTrl(goodTrl({ basis: undefined })).some((x) => /basis/.test(x.message))).toBe(true)
    expect(checkTrl(goodTrl({ assumptionId: 'assume-4' })).some((x) => /A-nnn/.test(x.message))).toBe(true)
    expect(checkTrl(goodTrl({ relevantEnv: '' })).some((x) => /relevant environment/.test(x.message))).toBe(true)
    expect(checkTrl(goodTrl({ basis: 'evidence', evidence: 'trust me' })).some((x) => /evidence specifically/.test(x.message))).toBe(true)
  })

  it('mutation: a critical technology below TRL 6 without a maturity risk fails; a non-critical one does not', () => {
    expect(checkTrl(goodTrl({ maturityRisk: '' })).some((x) => /maturity risk/.test(x.message))).toBe(true)
    expect(checkTrl(goodTrl({ maturityRisk: '', critical: false })).some((x) => /maturity risk/.test(x.message))).toBe(false)
  })

  it('finds the lowest critical TRL; the key gives TRL 5 (TECH-002) because TECH-003 is not critical', () => {
    const key = TECHNOLOGIES.map((t) => ({ ...emptyTrl(t.id), claimed: TRL_KEY[t.id].trl, critical: TRL_KEY[t.id].critical }))
    expect(lowestCritical(key)).toEqual({ level: 5, techs: ['TECH-002'] })
    // mutation: if TECH-003 were critical, it would set the lowest critical TRL
    expect(lowestCritical(key.map((k) => ({ ...k, critical: true })))).toEqual({ level: 4, techs: ['TECH-003'] })
  })

  it('the key applies the maturity-risk rule exactly: a risk for critical technologies below TRL 6, none otherwise (W6-F09)', () => {
    for (const [id, k] of Object.entries(TRL_KEY)) expect(!!k.maturityRisk, id).toBe(needsMaturityRisk(k.trl, k.critical) || !k.critical)
    expect(TRL_KEY['TECH-001'].maturityRisk).toBe('')
    expect(TRL_KEY['TECH-001'].relatedRisk).toMatch(/R-005.*dependency/)
    expect(needsMaturityRisk(5, true)).toBe(true)
    expect(needsMaturityRisk(6, true)).toBe(false)
    expect(needsMaturityRisk(4, false)).toBe(false)
  })

  it('the instructor key matches the reference baseline TRLs and assumptions', () => {
    for (const t of TECHNOLOGIES) {
      expect(t.attributes?.trl, t.id).toBe(TRL_KEY[t.id].trl)
      expect(t.attributes?.assumptionId, t.id).toBe(TRL_KEY[t.id].assumption)
    }
  })
})

describe('5×5 matrix (R46 p.126 Figure 4-9; R61 p.642 Figure 1)', () => {
  it('reproduces the figure layout row by row', () => {
    const row = (l: number) => [1, 2, 3, 4, 5].map((c) => cellLevel(l, c)[0]).join('')
    expect(row(5)).toBe('LMHHH')
    expect(row(4)).toBe('LMMHH')
    expect(row(3)).toBe('LLMMH')
    expect(row(2)).toBe('LLLMM')
    expect(row(1)).toBe('LLLLM')
  })

  it('rejects ratings off the 1–5 scale', () => {
    expect(() => cellLevel(0, 3)).toThrow()
    expect(() => cellLevel(3, 6)).toThrow()
  })

  it('uses the DoD probability bands and five consequence anchors', () => {
    expect(LIKELIHOOD.map((l) => l.band)).toEqual(['> 1 % to ≤ 20 %', '> 20 % to ≤ 40 %', '> 40 % to ≤ 60 %', '> 60 % to ≤ 80 %', '> 80 % to ≤ 99 %'])
    expect(CONSEQUENCE).toHaveLength(5)
  })

  it('handling advice follows MITRE’s guideline', () => {
    expect(handlingAdvice('Low')).toEqual(['watch', 'accept'])
    expect(handlingAdvice('High')).toEqual(['avoid', 'mitigate', 'transfer'])
  })
})

const risk = (patch: Partial<RegisterEntry> = {}): RegisterEntry => ({
  kind: 'R',
  name: 'Thermal runaway during charging',
  text: 'Condition: batteries are charged at high power on hub pads next to passengers. If a cell enters thermal runaway during charging, then a fire can spread on the pad and close the vertiport.',
  owner: 'Vertiport Safety Manager',
  affects: 'REQ-SYS-001',
  likelihood: 2,
  consequence: 5,
  handling: 'mitigate',
  treatment: 'Cell-temperature monitoring stops charging; pad fire detection alerts responders.',
  trigger: 'Cell over-temperature alarm',
  ...patch,
})

describe('register entries (R61 p.630–633, R17 p.483–484)', () => {
  it('accepts a well-formed, rated, owned and treated risk', () => {
    expect(checkEntry(risk())).toEqual({ errors: [], warnings: [] })
  })

  it('mutation: a bare worry, a missing owner, a missing treatment or an embedded mitigation each fail', () => {
    expect(checkEntry(risk({ text: 'Batteries might catch fire on the pad which is bad.' })).errors.join(' ')).toMatch(/condition–if–then/)
    expect(checkEntry(risk({ owner: '' })).errors.join(' ')).toMatch(/owner/)
    expect(checkEntry(risk({ treatment: '' })).errors.join(' ')).toMatch(/treatment/)
    expect(checkEntry(risk({ text: risk().text + ' We will mitigate this with monitoring.' })).errors.join(' ')).toMatch(/mitigation out/)
    expect(checkEntry(risk({ likelihood: undefined })).errors.join(' ')).toMatch(/1–5/)
  })

  it('warns (does not block) when the handling departs from the guideline', () => {
    const r = checkEntry(risk({ likelihood: 5, consequence: 5, handling: 'accept' }))
    expect(r.errors).toEqual([])
    expect(r.warnings[0]).toMatch(/departs from MITRE/)
  })

  it('checks the condition–if–then order', () => {
    expect(isConditionIfThen('Condition: X is true. If Y happens, then Z follows.')).toBe(true)
    expect(isConditionIfThen('If Y happens, then Z follows.')).toBe(false)
  })

  it('needs a validation for an assumption and a need-by for an unknown', () => {
    const u: RegisterEntry = { kind: 'U', name: 'Weather limits', text: 'The OEM has not published the approved crosswind and gust limits.', owner: 'Director of Flight Operations', affects: 'REQ-SYS-004', action: 'Obtain limits from the flight manual draft', needBy: '' }
    expect(checkEntry(u).errors.join(' ')).toMatch(/need-by/)
    expect(checkEntry({ ...u, needBy: 'Before CP2' }).errors).toEqual([])
  })

  it('round-trips attributes through the workspace element shape', () => {
    const e = risk()
    const back = entryFrom({ id: 'R-009', kind: 'R', name: e.name, text: e.text, attributes: attributesFor(e), provenance: 'team-derived', status: 'active' }, e.affects)
    expect(back).toMatchObject({ likelihood: 2, consequence: 5, handling: 'mitigate', owner: e.owner, treatment: e.treatment, trigger: e.trigger })
  })
})

describe('register completeness (syllabus §11 CP2; RB-5)', () => {
  const ref = referenceUpTo(6)

  it('the instructor reference register up to Week 6 passes every check', () => {
    const failed = registerCompleteness(ref).filter((c) => !c.ok)
    expect(failed).toEqual([])
  })

  it('plots the eight reference risks, highest level first', () => {
    const p = plotRisks(ref.elements)
    expect(p.map((r) => r.id)).toHaveLength(8)
    expect(p[0].level).toBe('Moderate')
    expect(p.find((r) => r.id === 'R-008')).toMatchObject({ likelihood: 2, consequence: 5, level: 'Moderate' })
    expect(p.find((r) => r.id === 'R-006')).toMatchObject({ level: 'Low', handling: 'accept' })
  })

  it('mutation: removing every opportunity, an owner, or a link makes the matching check fail', () => {
    const noO: EngineeringModel = { ...ref, elements: ref.elements.filter((e) => e.kind !== 'O') }
    expect(registerCompleteness(noO).find((c) => c.id === 'aou')!.ok).toBe(false)
    const unowned: EngineeringModel = { ...ref, elements: ref.elements.map((e) => (e.id === 'R-004' ? { ...e, attributes: { ...e.attributes, owner: '' } } : e)) }
    expect(registerCompleteness(unowned).find((c) => c.id === 'owned')!.detail).toContain('R-004')
    const unlinked: EngineeringModel = { ...ref, links: ref.links.filter((l) => l.source !== 'R-007') }
    expect(registerCompleteness(unlinked).find((c) => c.id === 'linked')!.detail).toContain('R-007')
    const fewRisks: EngineeringModel = { ...ref, elements: ref.elements.filter((e) => e.kind !== 'R' || ['R-001', 'R-002', 'R-003'].includes(e.id)) }
    expect(registerCompleteness(fewRisks).find((c) => c.id === 'risks')!.ok).toBe(false)
  })

  it('an empty workspace fails the count checks', () => {
    const c = registerCompleteness({ elements: [], links: [] })
    expect(c.find((x) => x.id === 'entries')!.ok).toBe(false)
  })
})

describe('graduate probability model (R17 p.483–484; R46 p.126; R61 p.637)', () => {
  it('Poisson and binomial agree for small p0', () => {
    expect(pAtLeastOne(0.1728)).toBeCloseTo(0.158694, 5)
    expect(pAtLeastOneBinomial(172800, 1e-6)).toBeCloseTo(0.158694, 5)
  })

  it('reproduces the worked R-008 numbers', () => {
    const t = eventTree(R008_EXAMPLE)
    expect(t.initiations).toBeCloseTo(0.1728, 10)
    expect(t.outcomes.map((o) => o.fraction)).toEqual([0.9, expect.closeTo(0.08, 12), expect.closeTo(0.02, 12)])
    expect(t.outcomes.reduce((a, o) => a + o.fraction, 0)).toBeCloseTo(1, 12)
    expect(t.outcomes[2].pAtLeastOne).toBeCloseTo(0.00345, 5)
    expect(t.outcomes[1].pAtLeastOne).toBeCloseTo(0.01373, 5)
    expect(t.outcomes[0].pAtLeastOne).toBeCloseTo(0.14403, 5)
  })

  it('maps probabilities to the DoD bands, with explicit out-of-scale cases', () => {
    expect(likelihoodBand(0.1587).level).toBe(1)
    expect(likelihoodBand(0.3).level).toBe(2)
    expect(likelihoodBand(0.4).level).toBe(2)
    expect(likelihoodBand(0.41).level).toBe(3)
    expect(likelihoodBand(0.9).level).toBe(5)
    expect(likelihoodBand(0.0035)).toMatchObject({ level: null })
    expect(likelihoodBand(1).label).toMatch(/issue/)
  })

  it('the reference L2 rating for R-008 does not match the model; below the scale even L1 is only the floor (W6-F07)', () => {
    const p = eventTree(R008_EXAMPLE).outcomes[2].pAtLeastOne
    expect(compareWithOrdinal(p, 2).agrees).toBe(false)
    expect(compareWithOrdinal(p, 2).message).toMatch(/L2 overstates it/)
    // 0.345 % is outside the L1 band (> 1 %): L1 is the convention, not a match
    expect(compareWithOrdinal(p, 1)).toMatchObject({ agrees: false, modelBand: { level: null } })
    expect(compareWithOrdinal(p, 1).message).toMatch(/scale floor, not a match/)
    // inside a band, agreement is still reported
    expect(compareWithOrdinal(0.3, 2).agrees).toBe(true)
    expect(compareWithOrdinal(0.015, 1).agrees).toBe(true)
  })

  it('a 10× better first barrier cuts the worst outcome 10× but leaves the cell unchanged', () => {
    const better = { ...R008_EXAMPLE, barriers: [{ ...R008_EXAMPLE.barriers[0], failProb: 0.01 }, R008_EXAMPLE.barriers[1]] }
    const before = eventTree(R008_EXAMPLE).outcomes[2].expected
    const after = eventTree(better).outcomes[2].expected
    expect(before / after).toBeCloseTo(10, 6)
    expect(likelihoodBand(eventTree(better).outcomes[2].pAtLeastOne).level).toBe(likelihoodBand(eventTree(R008_EXAMPLE).outcomes[2].pAtLeastOne).level)
  })

  it('sensitivity: p0 × 10 moves any initiation from L1 to L5 while the worst outcome stays in L1', () => {
    const s = sensitivity(R008_EXAMPLE)
    expect(likelihoodBand(s[1].pInitiation).level).toBe(1)
    expect(likelihoodBand(s[2].pInitiation).level).toBe(5)
    expect(likelihoodBand(s[2].pWorst).level).toBe(1)
  })
})

describe('SRR checklist (R40 p.69–72, adapted)', () => {
  const all = (rating: 'met' | 'partly' | 'not-met', text: string): Review => ({ reviewer: 'Team 2', reviewed: 'Team 3 CP2', findings: Object.fromEntries(SRR_CRITERIA.map((c) => [c.id, { rating, text }])) })

  it('has nine criteria (S9 hazards added after review), each citing R40 inside p.69–72', () => {
    expect(SRR_CRITERIA).toHaveLength(9)
    expect(SRR_CRITERIA[8]).toMatchObject({ id: 'S9', cite: 'R40 p.72' })
    for (const c of SRR_CRITERIA) for (const n of c.cite.match(/\d+/g)!.slice(1).map(Number)) expect(n >= 69 && n <= 72, c.id).toBe(true)
  })

  it('an actionable finding names an ID and asks for a change', () => {
    expect(checkFinding({ rating: 'partly', text: 'REQ-SYS-003 has no verification method; add analysis of the energy budget as the method.' })).toEqual([])
    // mutation: drop the ID, then drop the action
    expect(checkFinding({ rating: 'partly', text: 'One requirement has no verification method and this is a real problem for the team.' })[0]).toMatch(/ID/)
    expect(checkFinding({ rating: 'partly', text: 'REQ-SYS-003 has no verification method, which is a real problem for the reviewers.' })[0]).toMatch(/specific change/)
  })

  it('recommends from the ratings', () => {
    expect(recommend(all('met', 'Checked the methods of REQ-SYS-001..010.')).outcome).toBe('proceed')
    const partly = all('met', 'Checked the methods of REQ-SYS-001..010.')
    partly.findings.S4 = { rating: 'partly', text: 'TECH-002 is at TRL 5 with no maturity risk; add a maturity risk and link it to REQ-SYS-003.' }
    expect(recommend(partly).outcome).toBe('proceed-with-actions')
    partly.findings.S5 = { rating: 'not-met', text: 'R-004 and R-005 have no owner; assign an owner role and a treatment to each risk.' }
    expect(recommend(partly)).toMatchObject({ outcome: 'not-ready' })
    expect(recommend({ reviewer: '', reviewed: '', findings: {} }).outcome).toBe('incomplete')
    expect(reviewRecord(partly)).toContain('S5 Technical risks identified, analysed and treated: Not met')
  })
})
