import { describe, expect, it } from 'vitest'
import { referenceUpTo } from '../../model/reference'
import type { EngineeringModel } from '../../model/engineering'
import { assessPoint } from '../week05/measures'
import { depends, directedImpact, impactMarkdown, margin, recommendationProblem, summarise, tpmsMeasuring } from './impact'
import { BASE_ENERGY, ENERGY_SCENARIOS, TPM_SPECS, assess, editProblem, landingFraction, landingPercent, linksOf, minRetainedFor, tripEnergy, usableEnergyEOL, whatIf, whatIfMarkdown } from './margins'
import { CORRECTED_FRAGMENT, SEEDED_FRAGMENT, checkFragment, findingsMarkdown, mentions, normUnit, primaryMention, referenceFragment, toBase, type FragmentRow } from './consistency'
import { RECORD_SEMANTICS, RESOLVED_HISTORY, WORKED_HISTORY, checkHistory, diff, versionedData, type Commit } from './commits'

const ref = referenceUpTo(14)
const ids = (xs: { id: string }[]) => xs.map((x) => x.id)

describe('directed impact (worked example b)', () => {
  it('reproduces the REQ-SYS-001 numbers: naive reach, first order, upstream, and second order from PHY-003', () => {
    const r = directedImpact(ref, 'REQ-SYS-001', ['PHY-003'])
    expect(r.activeElements).toBe(204)
    expect(r.naive).toEqual([{ depth: 1, count: 9 }, { depth: 2, count: 28 }, { depth: 3, count: 63 }])
    expect(ids(r.firstOrder)).toEqual(['FN-006', 'IF-005', 'MOP-002', 'PHY-003', 'R-008', 'TECH-001', 'TPM-001', 'VER-001'])
    expect(ids(r.upstream)).toEqual(['REQ-STK-005'])
    expect(ids(r.secondOrder)).toEqual(['FN-007', 'INFO-003', 'LOG-002', 'R-001', 'R-005', 'REQ-SYS-010'])
    expect(r.secondOrder.find((i) => i.id === 'REQ-SYS-010')!.via).toBe('PHY-003 satisfies REQ-SYS-010 (LNK-08-082)')
    expect(summarise(r)).toMatchObject({ verification: ['VER-001'], measures: ['MOP-002', 'TPM-001'], requirements: ['REQ-SYS-010'] })
  })

  it('a re-check that passes propagates nothing: no must-change element, no second order', () => {
    expect(directedImpact(ref, 'REQ-SYS-001').secondOrder).toEqual([])
    // must-change entries that are not first-order are ignored (they were not reached by a dependency)
    expect(directedImpact(ref, 'REQ-SYS-001', ['REQ-STK-005', 'PHY-001']).secondOrder).toEqual([])
  })

  it('direction matters (mutation): a parent change reaches the child, a child change only reviews the parent', () => {
    expect(ids(directedImpact(ref, 'REQ-STK-005').firstOrder)).toContain('REQ-SYS-001')
    expect(ids(directedImpact(ref, 'REQ-SYS-001').firstOrder)).not.toContain('REQ-STK-005')
    expect(depends('derives-from', 'out', 'REQ')).toBe(false)
    expect(depends('derives-from', 'in', 'REQ')).toBe(true)
    expect(depends('affects', 'in', 'A')).toBe(false) // an assumption about the changed element is reviewed, not re-opened
    expect(depends('affects', 'in', 'R')).toBe(true)
  })

  it('reproduces the TPM-003 and S04 Lab 13 starting points', () => {
    const t = directedImpact(ref, 'TPM-003')
    expect(ids(t.firstOrder)).toEqual(['R-002', 'REQ-SYS-003'])
    expect(ids(t.upstream)).toEqual(['MOP-005'])
    expect(t.naive.map((n) => n.count)).toEqual([3, 13, 40])
    expect(ids(directedImpact(ref, 'TECH-002').firstOrder)).toEqual(['PHY-001', 'R-002', 'REQ-SYS-003', 'REQ-SYS-007'])
    expect(ids(directedImpact(ref, 'A-006').firstOrder)).toEqual(['CRIT-001', 'DEC-001'])
    expect(ids(directedImpact(ref, 'U-001').firstOrder)).toEqual(['CAP-005', 'CON-004', 'REQ-STK-003', 'REQ-SYS-004', 'SCN-005'])
  })

  it('ignores retired elements', () => {
    const m: EngineeringModel = { ...ref, elements: ref.elements.map((e) => (e.id === 'PHY-003' ? { ...e, status: 'retired' as const } : e)) }
    expect(ids(directedImpact(m, 'REQ-SYS-001').firstOrder)).not.toContain('PHY-003')
  })

  it('TPM consequence of 20 → 18 min: TPM-001 margin against the CBE falls from 2 to 0', () => {
    const [t] = tpmsMeasuring(ref, 'REQ-SYS-001')
    expect(t).toMatchObject({ id: 'TPM-001', threshold: 20, currentEstimate: 18, storedMargin: 2, sense: 'lower-is-better' })
    expect(margin(t.sense, 18, t.currentEstimate)).toBe(0)
  })

  it('recommendation screen fails realistic weak recommendations and accepts a conditional one with IDs', () => {
    expect(recommendationProblem('Accept the change to 18 min.')).toMatch(/at least one full sentence/)
    expect(recommendationProblem('We think the change is good for passengers overall and the whole team agrees with it strongly.')).toMatch(/Say what you recommend|Name at least one/)
    expect(recommendationProblem('We recommend that the team accepts the change because it is clearly better for the passengers overall.')).toMatch(/Name at least one affected element/)
    expect(recommendationProblem('Accept the change to REQ-SYS-001 and update TPM-001, VER-001 and the charger design accordingly next week.')).toMatch(/condition or the reason/)
    expect(recommendationProblem('Do not accept REQ-SYS-001 at 18 min now: keep 20 min unless the supplier shows an estimated charge time at or below 17.4 min, because TPM-001 would be in breach and PHY-003 changes reach REQ-SYS-010.')).toBeNull()
  })

  it('exports the method, the must-change decision and the naive comparison', () => {
    const md = impactMarkdown(directedImpact(ref, 'REQ-SYS-001', ['PHY-003']), 'REQ-SYS-001 20 → 18 min', ['PHY-003'], 'Defer.')
    expect(md).toMatch(/Method \(course convention, Week 13\)/)
    expect(md).toMatch(/Must change \(engineer’s decision\).\*\* PHY-003/)
    expect(md).toMatch(/depth 1: 9; depth 2: 28; depth 3: 63 of 203 other active elements/)
    expect(md).toMatch(/\| 2 \| REQ-SYS-010 \|/)
  })
})

describe('margins and what-if (TPM-001..003)', () => {
  it('reference specs match the reference TPM attributes (rule 4)', () => {
    for (const s of TPM_SPECS) {
      const e = ref.elements.find((x) => x.id === s.id)!
      expect([e.attributes?.threshold, e.attributes?.objective, e.attributes?.currentEstimate, e.attributes?.sense, e.attributes?.unit]).toEqual([s.threshold, s.objective, s.cbe, s.sense, s.unit])
    }
  })

  it('baseline statuses agree with the Week 5 tracker logic (R1/R2), and all three are on track', () => {
    for (const s of TPM_SPECS) {
      const mine = assess(s, s.cbe, s.contingency)
      const w5 = assessPoint({ id: s.id, name: s.name, unit: s.unit, sense: s.sense, threshold: s.threshold, objective: s.objective, alertFloor: s.alertFloor, tracks: s.tracks, mop: '' }, { month: 9, cbe: s.cbe, contingency: s.contingency, basis: '' })
      expect([mine.wce, mine.marginCbe, mine.marginWce, mine.status]).toEqual([w5.wce, w5.marginCbe, w5.marginWce, w5.status])
    }
    expect(TPM_SPECS.map((s) => assess(s, s.cbe, s.contingency).marginWce)).toEqual([1.4, 0.5, 1.5])
  })

  it('energy model reproduces the analysis-case listing and the S04 Lab 13 battery scenario', () => {
    expect(tripEnergy(BASE_ENERGY)).toBe(85)
    expect(usableEnergyEOL(BASE_ENERGY)).toBe(110.4)
    expect(landingFraction(BASE_ENERGY)).toBe(0.230072)
    expect(ENERGY_SCENARIOS.map((s) => landingPercent(s.inputs))).toEqual([23, 9.4, 18.9])
    expect(minRetainedFor(BASE_ENERGY, 0.2)).toBe(0.885417)
    expect(minRetainedFor(BASE_ENERGY, 0.215)).toBe(0.902335)
  })

  it('what-if: REQ-SYS-001 at 18 min puts TPM-001 in breach on the worst case; battery −15 % breaches TPM-003 and fires R-002', () => {
    const rows = whatIf(ref, { 'TPM-001': { threshold: 18 }, 'TPM-003': { cbe: 9.4 } })
    const t1 = rows.find((r) => r.spec.id === 'TPM-001')!
    expect([t1.a.marginCbe, t1.a.marginWce, t1.a.status, t1.a.rule]).toEqual([0, -0.6, 'breach', 'R1'])
    expect(t1.links).toMatchObject({ requirement: 'REQ-SYS-001', verifications: ['VER-001'] })
    expect(t1.links.risks.map((k) => k.id)).toEqual(['R-008'])
    const t3 = rows.find((r) => r.spec.id === 'TPM-003')!
    expect([t3.a.marginCbe, t3.a.marginWce, t3.a.status]).toEqual([-10.6, -12.1, 'breach'])
    const r2 = t3.links.risks.find((k) => k.id === 'R-002')!
    expect([r2.floor, r2.firesOnCbe, r2.firesOnWce]).toEqual([1, true, true])
    expect(whatIfMarkdown(rows, 'test')).toMatch(/\| TPM-001 \| 18 min \| 18 \| 0\.6 \| 18\.6 \| 0 \| -0\.6 \| breach \(R1\) \| REQ-SYS-001 \| VER-001 \|/)
  })

  it('R-002 trigger boundary (mutation): margin exactly 1 does not fire, 0.9 does', () => {
    expect(linksOf(ref, 'TPM-003', 1, 1).risks.find((k) => k.id === 'R-002')!.firesOnCbe).toBe(false)
    expect(linksOf(ref, 'TPM-003', 0.9, 0.9).risks.find((k) => k.id === 'R-002')!.firesOnCbe).toBe(true)
  })

  it('at-risk band and input screen', () => {
    expect(assess(TPM_SPECS[0], 18.6, 0.6)).toMatchObject({ marginWce: 0.8, status: 'at-risk', rule: 'R2' })
    expect(editProblem({ contingency: -0.5 })).toMatch(/cannot be negative/)
    expect(editProblem({ cbe: Number.NaN })).toMatch(/must be a number/)
    expect(editProblem({ cbe: 19, contingency: 0 })).toBeNull()
  })
})

describe('consistency checks (worked example c)', () => {
  const checks = (rows: FragmentRow[], known: string[] = []) => checkFragment(rows, known).map((f) => `${f.check}:${f.severity}:${f.rows.join('+')}`)

  it('finds exactly the seeded defects of the listing', () => {
    expect(checks(SEEDED_FRAGMENT).sort()).toEqual([
      'doc-value:error:3', // padWorkTime 5 s, text says 5 min
      'doc-value:error:4', // statement says 20 min
      'doc-value:error:4', // name says 20 min
      'duplicate-id:error:4+5',
      'duplicate-id:warning:1',
      'duplicate-id:warning:6',
      'stale-margin:error:8+7+4',
      'threshold-limit:error:6+4',
      'unit-kind:error:0',
    ].sort())
  })

  it('the corrected fragment passes every check (good input is not rejected)', () => {
    expect(checkFragment(CORRECTED_FRAGMENT)).toEqual([])
  })

  it('reference TPM rows pass their own checks (rule 4)', () => {
    const rows = referenceFragment(ref)
    expect(rows.filter((r) => r.role === 'limit').map((r) => `${r.id}=${r.value} ${r.unit}`)).toEqual(['REQ-SYS-001=20 min', 'REQ-SYS-002=65 dBA', 'REQ-SYS-003=20 %'])
    expect(rows.filter((r) => r.role === 'criterion').map((r) => r.id)).toEqual(['VER-001', 'VER-002', 'VER-003'])
    expect(checkFragment(rows)).toEqual([])
  })

  it('equivalent values in other units are not flagged (no false positives)', () => {
    const lim = (value: string, unit: string, doc: string): FragmentRow => ({ id: 'REQ-SYS-001', name: 'Charge to dispatch threshold', feature: 'maxChargeTime', role: 'limit', kind: 'duration', value, unit, bound: 'max', refersTo: '', doc })
    const tpm = (value: string, unit: string): FragmentRow => ({ id: 'TPM-001', name: 'Charge time', feature: 'threshold', role: 'threshold', kind: 'duration', value, unit, bound: 'max', refersTo: 'REQ-SYS-001', doc: '' })
    expect(checkFragment([lim('1200', 's', 'within 20 min'), tpm('20', 'min')])).toEqual([])
    const f = (value: string, unit: string): FragmentRow => ({ id: 'REQ-SYS-003', name: 'Reserve', feature: 'min', role: 'limit', kind: 'fraction', value, unit, bound: 'min', refersTo: '', doc: 'at least 20 % of usable energy' })
    expect(checkFragment([f('0.20', ''), { ...tpm('20', '%'), id: 'TPM-003', kind: 'fraction', bound: 'min', refersTo: 'REQ-SYS-003' }])).toEqual([])
    expect(checkFragment([{ ...lim('65', 'dB(A)', 'no more than 65 dBA'), kind: 'sound' }])).toEqual([])
    // the fraction comparison is real, not vacuous: 25 % against a 0.20 limit is flagged
    expect(checkFragment([f('0.20', ''), { ...tpm('25', '%'), id: 'TPM-003', kind: 'fraction', bound: 'min', refersTo: 'REQ-SYS-003' }]).map((x) => x.check)).toEqual(['threshold-limit'])
  })

  it('realistic bad inputs are each flagged (rule 5)', () => {
    const base = CORRECTED_FRAGMENT
    const ver: FragmentRow = { id: 'VER-001', name: 'Turnaround charge-time test', feature: 'success criterion', role: 'criterion', kind: 'duration', value: '20.0', unit: 'min', bound: 'max', refersTo: 'REQ-SYS-001', doc: 'All 30 charges from 20 % state of charge reach the dispatch threshold in <= 20.0 min' }
    expect(checks([...base, ver])).toEqual(['criterion-limit:error:9+4'])
    expect(checks(base.map((r, i) => (i === 1 ? { ...r, value: '19' } : r)))).toEqual(['satisfy-violated:error:1+4'])
    expect(checks(base.map((r, i) => (i === 4 ? { ...r, unit: '' } : r)))).toContain('no-unit:error:4')
    expect(checks(base.map((r, i) => (i === 1 ? { ...r, refersTo: 'REQ-SYS-011' } : r)))).toEqual(['dangling:error:1'])
    expect(checks(base.map((r, i) => (i === 1 ? { ...r, refersTo: 'REQ-SYS-011' } : r)), ['REQ-SYS-011'])).toEqual([]) // exists elsewhere in the model
    expect(checks(base.map((r, i) => (i === 0 ? { ...r, unit: 'kWh' } : r)))).toEqual(['unit-kind:error:0'])
    expect(checks(base.map((r, i) => (i === 8 ? { ...r, value: '2' } : r)))).toEqual(['stale-margin:error:8+7+4'])
    const minLim: FragmentRow = { id: 'REQ-SYS-003', name: 'Planned landing energy reserve', feature: 'minLandingEnergyFraction', role: 'limit', kind: 'fraction', value: '20', unit: '%', bound: 'min', refersTo: '', doc: '' }
    expect(checks([minLim, { ...minLim, id: 'LOG-001', name: 'Flight Operations', feature: 'plannedLandingEnergyFraction', role: 'design value', value: '0.18', unit: '', bound: '', refersTo: 'REQ-SYS-003' }])).toEqual(['satisfy-violated:error:1+0'])
  })

  it('parsing helpers', () => {
    expect(normUnit('kW * h')).toBe('kwh')
    expect(normUnit('dB(A)')).toBe('dba')
    expect(toBase('20', 'min')).toBe(1200)
    expect(toBase('twenty', 'min')).toBeNull()
    expect(mentions('a 20 % reserve within 18 min at 400 kW')).toEqual([{ value: 20, unit: '%' }, { value: 18, unit: 'min' }, { value: 400, unit: 'kW' }])
    expect(primaryMention('All 30 charges from 20 % (+0/-1 %) state of charge reach the dispatch threshold in <= 20.0 min', 'duration')).toEqual({ value: 20, unit: 'min' })
    expect(findingsMarkdown(CORRECTED_FRAGMENT, [])).toMatch(/does not prove the fragment is consistent/)
  })
})

describe('commit-based change analysis (R88 p.32–36; graduate example d)', () => {
  it('computes versionedData by the p.34 rule', () => {
    expect(Object.fromEntries(versionedData('C2', WORKED_HISTORY))).toEqual({
      'REQ-SYS-001': 'maxChargeTime = 18 min', 'TPM-001': 'threshold 18 min; estimate 18 min', 'VER-001': 'criterion: all 30 charges <= 20.0 min', 'TPM-003': 'estimate 23 %',
    })
    expect(versionedData('C3', WORKED_HISTORY).get('REQ-SYS-001')).toBe('maxChargeTime = 20 min')
  })

  it('the draft merge violates the merge invariant for every identity whose parents differ; the resolved merge does not', () => {
    expect(checkHistory(WORKED_HISTORY).map((v) => `${v.commit}:${v.rule}:${v.identity}`)).toEqual(['C4:merge-unresolved:REQ-SYS-001', 'C4:merge-unresolved:TPM-003'])
    expect(checkHistory(RESOLVED_HISTORY)).toEqual([])
  })

  it('a diff from the baseline tag gives the seed set, not the impact set: VER-001 is unchanged but affected', () => {
    expect(diff('C1', 'C4', RESOLVED_HISTORY)).toEqual({ added: [], changed: ['REQ-SYS-001', 'TPM-001', 'TPM-003'], deleted: [] })
    expect(ids(directedImpact(ref, 'REQ-SYS-001').firstOrder)).toContain('VER-001')
  })

  it('detects invalid deletions, duplicate identities and time order (mutations)', () => {
    const bad: Commit[] = [
      ...RESOLVED_HISTORY,
      { id: 'C5', created: '2026-11-25T08:00:00Z', previousCommits: ['C4'], change: [{ identity: 'VER-009', payload: null }, { identity: 'TPM-003', payload: 'estimate 21 %' }, { identity: 'TPM-003', payload: 'estimate 22 %' }] },
    ]
    expect(checkHistory(bad).map((v) => v.rule).sort()).toEqual(['duplicate-identity', 'invalid-deletion', 'time-order'])
    const del: Commit[] = [...RESOLVED_HISTORY, { id: 'C5', created: '2026-11-26T08:00:00Z', previousCommits: ['C4'], change: [{ identity: 'TPM-003', payload: null }] }]
    expect(checkHistory(del)).toEqual([])
    expect(versionedData('C5', del).has('TPM-003')).toBe(false)
  })

  it('records the mutability table of p.36', () => {
    expect(RECORD_SEMANTICS.map((r) => `${r.record}:${r.mutable}:${r.destructible}`)).toEqual(['Commit:false:false', 'Branch:true:true', 'Tag:false:true'])
  })
})
