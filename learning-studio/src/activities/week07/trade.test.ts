import { describe, expect, it } from 'vitest'
import { REFERENCE_BY_WEEK } from '../../model/reference'
import { REFERENCE_DRIVERS, REFERENCE_UNCERTAINTY, critAttributes, referenceStudy, studyFromModel } from './reference'
import {
  checkForSave,
  checkStudy,
  derivedScore,
  distIssue,
  margin,
  monteCarlo,
  mulberry32,
  normaliseWeights,
  quantile,
  rank,
  reweight,
  sensitivity,
  sensitivityLines,
  tornado,
  valueOf,
  valueTable,
  valuesAtWeight,
  waitMinutes,
  type Criterion,
  type Derived,
  type TradeStudy,
  type Uncertainty,
} from './trade'

const ref = referenceStudy()
const W = normaliseWeights(ref.criteria)
const totals = () => Object.fromEntries(valueTable(ref).map((r) => [r.id, r.total]))

/** Brute-force reversal search (independent of the algebra): step the weight and bisect where the top changes. */
function bruteReversal(study: TradeStudy, k: string, dir: 1 | -1): number | null {
  const w0 = normaliseWeights(study.criteria)
  const topAt = (w: number) => rank(valueTable(study, reweight(w0, k, w)))[0].id
  const first = topAt(w0[k])
  for (let w = w0[k]; w >= 0 && w <= 1; w += dir * 0.001) {
    if (topAt(w) !== first) {
      let lo = w - dir * 0.001
      let hi = w
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2
        if (topAt(mid) === first) lo = mid
        else hi = mid
      }
      return (lo + hi) / 2
    }
  }
  return null
}

describe('reference trade study (src/model/reference/week07.ts) is reproduced exactly', () => {
  it('reads four criteria and four alternatives with the stated swing weights 0.40 / 0.30 / 0.16 / 0.14', () => {
    expect(ref.criteria.map((c) => c.id)).toEqual(['CRIT-001', 'CRIT-002', 'CRIT-003', 'CRIT-004'])
    expect(ref.alternatives.map((a) => a.id)).toEqual(['ALT-001', 'ALT-002', 'ALT-003', 'ALT-004'])
    expect(Object.values(W)).toEqual([0.4, 0.3, 0.16, 0.14].map((x) => expect.closeTo(x, 12)))
    expect(ref.criteria.map((c) => c.moe)).toEqual(['MOE-001', 'MOE-005', 'MOE-006', 'MOE-003'])
    expect(studyFromModel(REFERENCE_BY_WEEK[7]).issues).toEqual([])
  })

  it('computes the totals stated in DEC-001: ALT-004 0.670, ALT-002 0.489, ALT-003 0.458, ALT-001 0.452', () => {
    const t = totals()
    expect(t['ALT-004'].toFixed(3)).toBe('0.670')
    expect(t['ALT-002'].toFixed(3)).toBe('0.489')
    expect(t['ALT-003'].toFixed(3)).toBe('0.458')
    expect(t['ALT-001'].toFixed(3)).toBe('0.452')
    expect(rank(valueTable(ref)).map((r) => r.id)).toEqual(['ALT-004', 'ALT-002', 'ALT-003', 'ALT-001'])
    const dec = REFERENCE_BY_WEEK[7].elements.find((e) => e.id === 'DEC-001')!
    for (const [id, v] of Object.entries(t)) expect(String(dec.attributes!.scores)).toContain(`${id} ${v.toFixed(3)}`)
  })

  it('shows the step-by-step values used in the worked example', () => {
    const rows = Object.fromEntries(valueTable(ref).map((r) => [r.id, r]))
    expect(rows['ALT-004'].values['CRIT-001']).toBeCloseTo(52 / 55, 12)
    expect(rows['ALT-004'].values['CRIT-002']).toBeCloseTo(0.36, 12)
    expect(rows['ALT-004'].values['CRIT-003']).toBeCloseTo(0.8, 12)
    expect(rows['ALT-004'].values['CRIT-004']).toBeCloseTo(0.4, 12)
    expect(rows['ALT-001'].values['CRIT-001']).toBe(0) // 66.7 min is beyond the 60 min walk-away point
    expect(rows['ALT-003'].values['CRIT-004']).toBeCloseTo(0.628, 12)
    expect(rows['ALT-002'].values['CRIT-003']).toBeCloseTo(0.334, 12)
  })

  it('finds the cost-weight reversal at 0.478 (to ALT-001) and the wait-weight reversal at 0.226 (to ALT-003)', () => {
    const cost = sensitivity(ref, 'CRIT-002')
    expect(cost.up!.at).toBeCloseTo(0.478, 3)
    expect(cost.up!.to).toBe('ALT-001')
    const wait = sensitivity(ref, 'CRIT-001')
    expect(wait.down!.at).toBeCloseTo(0.226, 3)
    expect(wait.down!.to).toBe('ALT-003')
    const dec = REFERENCE_BY_WEEK[7].elements.find((e) => e.id === 'DEC-001')!
    expect(cost.up!.at).toBeCloseTo(Number(dec.attributes!.reversalPoint), 3)
  })

  it('the algebraic reversal agrees with an independent brute-force search to 1e-6', () => {
    for (const c of ref.criteria) {
      const s = sensitivity(ref, c.id)
      const up = bruteReversal(ref, c.id, 1)
      const down = bruteReversal(ref, c.id, -1)
      if (up === null) expect(s.up, c.id).toBeNull()
      else expect(s.up!.at, c.id).toBeCloseTo(up, 6)
      if (down === null) expect(s.down, c.id).toBeNull()
      else expect(s.down!.at, c.id).toBeCloseTo(down, 6)
    }
  })

  it('the closed-form crossing used in the worked example: w* = (S_b − S_a) / ((v_ak − S_a) − (v_bk − S_b))', () => {
    const lines = Object.fromEntries(sensitivityLines(ref, 'CRIT-002').map((l) => [l.id, l]))
    const S4 = lines['ALT-004'].intercept
    const S1 = lines['ALT-001'].intercept
    expect(S4).toBeCloseTo(0.562182 / 0.7, 5)
    expect(S1).toBeCloseTo(0.152 / 0.7, 9)
    const w = (S4 - S1) / ((1 - S1) - (0.36 - S4))
    expect(w).toBeCloseTo(0.47797, 4)
    // at the reversal both alternatives have the same total
    const v = valuesAtWeight(sensitivity(ref, 'CRIT-002'), w)
    expect(v['ALT-004']).toBeCloseTo(v['ALT-001'], 9)
    expect(v['ALT-004']).toBeCloseTo(0.5913, 3)
  })

  it('reproduces DEC-001 "ALT-004 still scores 0.562 with zero cost value"', () => {
    const r = valueTable(ref).find((x) => x.id === 'ALT-004')!
    expect((r.total - r.contributions['CRIT-002']).toFixed(3)).toBe('0.562')
  })
})

describe('mutation tests: the checks can fail', () => {
  it('the reversal point moves when a single raw score changes', () => {
    const mutated: TradeStudy = { ...ref, alternatives: ref.alternatives.map((a) => (a.id === 'ALT-001' ? { ...a, scores: { ...a.scores, 'CRIT-002': 10 } } : a)) }
    const r = sensitivity(mutated, 'CRIT-002').up
    expect(r === null || Math.abs(r.at - 0.478) > 0.005 || r.to !== 'ALT-001').toBe(true)
    // and ALT-004's capital: a cheaper ALT-004 pushes the cost reversal further away
    const cheaper: TradeStudy = { ...ref, alternatives: ref.alternatives.map((a) => (a.id === 'ALT-004' ? { ...a, scores: { ...a.scores, 'CRIT-002': 10 } } : a)) }
    expect(sensitivity(cheaper, 'CRIT-002').up!.at).toBeGreaterThan(0.5)
  })

  it('the totals change when the walk-away point changes (summing raw measures would not detect this)', () => {
    const c2: Criterion[] = ref.criteria.map((c) => (c.id === 'CRIT-002' ? { ...c, worst: 40 } : c))
    const t = valueTable({ ...ref, criteria: c2 }).find((r) => r.id === 'ALT-004')!.total
    expect(t.toFixed(3)).not.toBe('0.670')
  })

  it('a different swing-point set changes the weights and the reversal', () => {
    const eq = { ...ref, criteria: ref.criteria.map((c) => ({ ...c, swingPoints: 50 })) }
    expect(Object.values(normaliseWeights(eq.criteria))).toEqual([0.25, 0.25, 0.25, 0.25])
    expect(sensitivity(eq, 'CRIT-002').up?.at).not.toBeCloseTo(0.478, 3)
  })
})

describe('value functions and weights', () => {
  const lin: Criterion = { id: 'C', name: 'c', unit: 'min', worst: 60, best: 5, swingPoints: 100 }
  it('linear, decreasing; clamps beyond the walk-away point and the stretch goal', () => {
    expect(valueOf(60, lin)).toBe(0)
    expect(valueOf(5, lin)).toBe(1)
    expect(valueOf(32.5, lin)).toBeCloseTo(0.5, 12)
    expect(valueOf(90, lin)).toBe(0)
    expect(valueOf(0, lin)).toBe(1)
  })
  it('piecewise-linear with a mid-value anchor', () => {
    const pw: Criterion = { ...lin, shape: 'piecewise', mid: 20 }
    expect(valueOf(20, pw)).toBeCloseTo(0.5, 12)
    expect(valueOf(40, pw)).toBeCloseTo(0.5 * (20 / 40), 12)
    expect(valueOf(12.5, pw)).toBeCloseTo(0.75, 12)
  })
  it('normalises swing points; reweight keeps the sum at one and the other ratios fixed', () => {
    const w = reweight(W, 'CRIT-002', 0.5)
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
    expect(w['CRIT-001'] / w['CRIT-003']).toBeCloseTo(0.4 / 0.16, 12)
  })
  it('checkStudy accepts the reference and rejects a two-alternative study', () => {
    expect(checkStudy(ref).filter((i) => i.level === 'error')).toEqual([])
    const bad = { ...ref, alternatives: ref.alternatives.slice(2) }
    expect(checkStudy(bad).some((i) => i.level === 'error' && /3 alternatives/.test(i.text))).toBe(true)
    expect(checkStudy({ ...ref, criteria: ref.criteria.map((c) => ({ ...c, moe: undefined })) }).some((i) => /MOE/.test(i.text))).toBe(true)
  })
  it('critAttributes round-trips through studyFromModel', () => {
    const c = ref.criteria[0]
    const m = { elements: [{ id: c.id, kind: 'CRIT' as const, name: c.name, attributes: critAttributes(c, W[c.id]), provenance: 'team-derived' as const, status: 'active' as const }], links: [] }
    const back = studyFromModel(m).study.criteria[0]
    expect(back).toMatchObject({ id: c.id, worst: c.worst, best: c.best, swingPoints: c.swingPoints, unit: c.unit })
  })
})

describe('tornado', () => {
  it('ranks the weights by their effect on the winner’s margin; ±0.1 is safe, ±0.2 on cost flips the decision', () => {
    const t = tornado(ref, 0.1)
    expect(t).toHaveLength(4)
    for (let i = 1; i < t.length; i++) expect(t[i - 1].swing).toBeGreaterThanOrEqual(t[i].swing)
    expect(t.every((b) => !b.flips)).toBe(true)
    // 0.30 + 0.2 = 0.50 lies beyond the 0.478 reversal, so the margin at that endpoint is negative
    const wide = tornado(ref, 0.2)
    expect(wide.find((b) => b.criterion === 'CRIT-002')!.flips).toBe(true)
    expect(margin(sensitivityLines(ref, 'CRIT-002'), 'ALT-004', 0.5)).toBeLessThan(0)
    // 0.40 − 0.2 = 0.20 lies below the 0.226 wait reversal
    expect(wide.find((b) => b.criterion === 'CRIT-001')!.flips).toBe(true)
  })
})

describe('Monte Carlo (R18 p.471–472)', () => {
  it('the PRNG is reproducible for a seed and differs between seeds', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const c = mulberry32(43)
    const xa = [a(), a(), a()]
    expect([b(), b(), b()]).toEqual(xa)
    expect([c(), c(), c()]).not.toEqual(xa)
    expect(xa.every((x) => x >= 0 && x < 1)).toBe(true)
  })
  it('triangular and uniform quantiles hit their bounds and mode', () => {
    const d = { kind: 'triangular' as const, low: 2, mode: 4, high: 10 }
    expect(quantile(d, 0, 0)).toBeCloseTo(2, 12)
    expect(quantile(d, 0, (4 - 2) / (10 - 2))).toBeCloseTo(4, 12)
    expect(quantile(d, 0, 0.999999999)).toBeCloseTo(10, 3)
    expect(quantile({ kind: 'uniform', low: 1, high: 3 }, 0, 0.5)).toBe(2)
    expect(quantile({ kind: 'fixed' }, 7, 0.3)).toBe(7)
    expect(distIssue({ kind: 'triangular', low: 5, mode: 4, high: 6 })).not.toBeNull()
  })
  it('the same seed gives identical results; a different seed gives different counts', () => {
    const r1 = monteCarlo(ref, REFERENCE_UNCERTAINTY, { n: 2000, seed: 7, drivers: REFERENCE_DRIVERS })
    const r2 = monteCarlo(ref, REFERENCE_UNCERTAINTY, { n: 2000, seed: 7, drivers: REFERENCE_DRIVERS })
    const r3 = monteCarlo(ref, REFERENCE_UNCERTAINTY, { n: 2000, seed: 8, drivers: REFERENCE_DRIVERS })
    expect(r2).toEqual(r1)
    expect(r3.firstCounts).not.toEqual(r1.firstCounts)
    expect(Object.values(r1.firstCounts).reduce((a, b) => a + b, 0)).toBe(2000)
  })
  it('with no uncertainty the deterministic winner ranks first in every trial (mutation guard)', () => {
    const r = monteCarlo(ref, {}, { n: 200, seed: 1 })
    expect(r.pFirst['ALT-004']).toBe(1)
    expect(r.mean['ALT-004']).toBeCloseTo(0.670182, 5)
  })
  it('reference uncertainty: ALT-004 is first with high probability; the summary used in the lesson', () => {
    const r = monteCarlo(ref, REFERENCE_UNCERTAINTY, { n: 10000, seed: 2026, drivers: REFERENCE_DRIVERS })
    expect(r.pFirst['ALT-004']).toBeGreaterThan(0.9)
    expect(r.mean['ALT-004']).toBeGreaterThan(r.mean['ALT-002'])
    expect(r.p05['ALT-004']).toBeGreaterThan(r.p95['ALT-001'] - 0.2)
  })
  it('sampling means converge to the analytic means of the distributions', () => {
    const d = { kind: 'triangular' as const, low: 6.15, mode: 8, high: 11.43 }
    const rnd = mulberry32(99)
    let s = 0
    for (let i = 0; i < 20000; i++) s += quantile(d, 0, rnd())
    expect(s / 20000).toBeCloseTo((6.15 + 8 + 11.43) / 3, 1)
  })
})

describe('numbers quoted in the Week 7 lesson', () => {
  it('Monte Carlo, 10,000 trials, seed 2026: shared drivers vs independent draws', () => {
    const s = monteCarlo(ref, REFERENCE_UNCERTAINTY, { n: 10000, seed: 2026, drivers: REFERENCE_DRIVERS })
    expect(s.firstCounts).toEqual({ 'ALT-001': 308, 'ALT-002': 0, 'ALT-003': 311, 'ALT-004': 9381 })
    expect(s.seFirst['ALT-004'].toFixed(4)).toBe('0.0024')
    expect(s.mean['ALT-004'].toFixed(3)).toBe('0.660')
    expect(s.mean['ALT-001'].toFixed(3)).toBe('0.487')
    expect(s.mean['ALT-003'].toFixed(3)).toBe('0.483')
    expect(s.mean['ALT-002'].toFixed(3)).toBe('0.477')
    expect([s.p05['ALT-004'], s.p95['ALT-004']].map((x) => x.toFixed(3))).toEqual(['0.632', '0.687'])
    expect([s.p05['ALT-001'], s.p95['ALT-001']].map((x) => x.toFixed(3))).toEqual(['0.438', '0.679'])
    expect(s.meanRank['ALT-002'].toFixed(2)).toBe('2.72')
    const i = monteCarlo(ref, REFERENCE_UNCERTAINTY, { n: 10000, seed: 2026, drivers: REFERENCE_DRIVERS, independentDrivers: true })
    expect(i.firstCounts).toEqual({ 'ALT-001': 624, 'ALT-002': 0, 'ALT-003': 625, 'ALT-004': 8751 })
  })
  it('derived cells reproduce every nominal score at the most-likely driver values, and the stated ranges at the bounds', () => {
    const nominal = { D: 240, AC: 3.0, HP: 0.4, VP: 6.0, PK: 1.6 }
    for (const a of ref.alternatives)
      for (const [c, d] of Object.entries(REFERENCE_UNCERTAINTY[a.id] ?? {})) expect(derivedScore(d as Derived, nominal), `${a.id}/${c}`).toBeCloseTo(a.scores[c], 1)
    const wait004 = REFERENCE_UNCERTAINTY['ALT-004']['CRIT-001'] as Derived
    expect([216, 264].map((D) => derivedScore(wait004, { D }).toFixed(2))).toEqual(['6.15', '11.43'])
    const wait001 = REFERENCE_UNCERTAINTY['ALT-001']['CRIT-001'] as Derived
    expect([216, 264].map((D) => derivedScore(wait001, { D }).toFixed(1))).toEqual(['20.0', '78.7'])
    // the baseline's wait is under the 60-min walk-away point only when demand < 232/day: P = 16² / (48 × 24) for tri(216, 240, 264)
    expect(waitMinutes(231.9 / 240)).toBeLessThan(60)
    expect(waitMinutes(232.1 / 240)).toBeGreaterThan(60)
    expect((16 ** 2 / (48 * 24)).toFixed(3)).toBe('0.222')
  })
  it('bound argument: without wait value, ALT-001 and ALT-003 cannot beat ALT-004 anywhere in the uncertainty box', () => {
    const v = (_alt: string, c: string, x: number) => valueOf(x, ref.criteria.find((k) => k.id === c)!) * W[c]
    const alt004Min = v('ALT-004', 'CRIT-001', 11.43) + v('ALT-004', 'CRIT-002', 16) + v('ALT-004', 'CRIT-003', 90) + v('ALT-004', 'CRIT-004', 8.8)
    const alt003MaxNoWait = v('ALT-003', 'CRIT-002', 4.8) + v('ALT-003', 'CRIT-003', 100) + v('ALT-003', 'CRIT-004', 6.17)
    const alt001MaxNoWait = v('ALT-001', 'CRIT-002', 0) + v('ALT-001', 'CRIT-003', 80) + v('ALT-001', 'CRIT-004', 7.2)
    expect(alt004Min.toFixed(3)).toBe('0.575')
    expect(alt003MaxNoWait).toBeLessThan(alt004Min)
    expect(alt001MaxNoWait).toBeLessThan(alt004Min)
  })
  it('the other reversal points listed in the lesson', () => {
    expect(sensitivity(ref, 'CRIT-003').up!.at.toFixed(3)).toBe('0.592')
    expect(sensitivity(ref, 'CRIT-004').up!.at.toFixed(3)).toBe('0.555')
    expect(sensitivity(ref, 'CRIT-003').up!.to).toBe('ALT-003')
    const t = Object.fromEntries(tornado(ref, 0.1).map((b) => [b.criterion, b]))
    expect(t['CRIT-002'].marginHigh.toFixed(3)).toBe('0.096')
    expect(t['CRIT-001'].marginLow.toFixed(3)).toBe('0.090')
    expect(t['CRIT-002'].marginBase.toFixed(3)).toBe('0.182')
  })
  it('set-based tradespace: 15 design points, 6 feasible, the stated capital and retained capacity', async () => {
    const { tradespace, nonDominated, designPoint } = await import('./tradespace')
    const ts = tradespace()
    expect(ts).toHaveLength(15)
    expect(ts.filter((p) => p.feasible).map((p) => `${p.aircraft}/${p.hubs}`)).toEqual(['16/4', '18/4', '20/4', '16/5', '18/5', '20/5'])
    expect(designPoint(16, 4)).toMatchObject({ capacity: 320, capital: 12.8, retainedPct: 90 }) // = ALT-004
    expect(designPoint(18, 3)).toMatchObject({ capacity: 288, feasible: false }) // = ALT-002
    expect(designPoint(16, 5)).toMatchObject({ capacity: 320, capital: 13.6, retainedPct: 100 })
    expect(nonDominated(ts)).toHaveLength(6)
  })
})

describe('numbers quoted in the Week 7 lesson (continued)', () => {
  it('numerical check either side of the 0.478 reversal, and the mutation exercise in the answer key', () => {
    const s = sensitivity(ref, 'CRIT-002')
    const at47 = valuesAtWeight(s, 0.47)
    const at49 = valuesAtWeight(s, 0.49)
    expect([at47['ALT-004'], at47['ALT-001']].map((x) => x.toFixed(3))).toEqual(['0.595', '0.585'])
    expect([at49['ALT-001'], at49['ALT-004']].map((x) => x.toFixed(3))).toEqual(['0.601', '0.586'])
    const m: TradeStudy = { ...ref, alternatives: ref.alternatives.map((a) => (a.id === 'ALT-004' ? { ...a, scores: { ...a.scores, 'CRIT-002': 16 } } : a)) }
    expect(valueTable(m).find((r) => r.id === 'ALT-004')!.total.toFixed(3)).toBe('0.622')
    expect(sensitivity(m, 'CRIT-002').up!.at.toFixed(3)).toBe('0.423')
  })
  it('Monte Carlo text: ALT-002 can never rank first; a fitted triangle overstates the baseline’s chance of a sub-60-min wait', () => {
    const v = (c: string, x: number) => valueOf(x, ref.criteria.find((k) => k.id === c)!) * W[c]
    const alt002Max = v('CRIT-001', waitMinutes(216 / 288)) + v('CRIT-002', 6 * 2.7) + v('CRIT-003', 66.7) + v('CRIT-004', 5 * 1.44)
    expect(alt002Max.toFixed(3)).toBe('0.567')
    const alt004Min = v('CRIT-001', waitMinutes(264 / 320)) + v('CRIT-002', 4 * 3.6 + 2 * 0.8) + v('CRIT-003', 90) + v('CRIT-004', 5 * 1.76)
    expect(alt004Min.toFixed(3)).toBe('0.575')
    // CDF of tri(20, 66.7, 78.7) at 60 vs P(demand < 232) for tri(216, 240, 264)
    expect((40 ** 2 / (58.7 * 46.7)).toFixed(2)).toBe('0.58')
    expect((16 ** 2 / (48 * 24)).toFixed(2)).toBe('0.22')
  })
  it('quiz items q7-3, q7-4 and q7-6', () => {
    const availability: Criterion = { id: 'AV', name: 'Charger availability', unit: '%', worst: 85, best: 99, swingPoints: 50 }
    expect(valueOf(95, availability).toFixed(3)).toBe('0.714')
    expect(valueOf(80, availability)).toBe(0)
    expect(((99 - 95) / 14).toFixed(3)).toBe('0.286')
    expect((100 / (100 + 75 + 40 + 60)).toFixed(3)).toBe('0.364')
    const alt5: TradeStudy = { ...ref, alternatives: [...ref.alternatives, { id: 'ALT-005', name: 'x', scores: { 'CRIT-001': 10, 'CRIT-002': 15, 'CRIT-003': 90, 'CRIT-004': 7 } }] }
    const r = rank(valueTable(alt5))
    expect(r.find((x) => x.id === 'ALT-005')!.total.toFixed(3)).toBe('0.651')
    expect(r[1].id).toBe('ALT-005')
  })
})

// ------------------------------------------------------------------------------------------------
// Independent cross-check of the Monte Carlo headline (written separately from trade.ts): a different PRNG
// (xorshift32), a different triangular sampler (the min/max construction X = (1 − c)·min(U, V) + c·max(U, V) on
// [0, 1]) and the reference model coded by hand. Gate: the two estimates agree within 3 combined standard errors.
// The innocent difference has sd ≈ 0.0025, so a correct implementation passes with near certainty, while the
// pre-review method (triangles fitted to each alternative's wait endpoints, drawn at a common quantile) sits about
// 2 percentage points (≈ 8 combined SE) away and must fail: that is the mutation the gate exists to catch.

function xorshift32(seed: number) {
  let x = seed | 0 || 1
  return () => {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return (x >>> 0) / 4294967296
  }
}
function crossCheck(n: number, seed: number) {
  const r = xorshift32(seed)
  const tri = (a: number, c: number, b: number) => {
    const u = r()
    const v = r()
    const f = (c - a) / (b - a)
    return a + (b - a) * ((1 - f) * Math.min(u, v) + f * Math.max(u, v))
  }
  const clamp = (x: number) => Math.min(1, Math.max(0, x))
  const wait = (d: number, cap: number) => {
    const u = d / cap
    return 2 / (1 - Math.min(u, 0.97)) + Math.max(0, u - 1) * 120
  }
  const val = (w: number, cap: number, ret: number, mov: number) => 0.4 * clamp((60 - w) / 55) + 0.3 * clamp((20 - cap) / 20) + 0.16 * clamp((ret - 50) / 50) + 0.14 * clamp((10 - mov) / 5)
  let first = 0
  let lossesAtHighDemand = 0
  let lowDemand = 0
  let lossesAtLowDemand = 0
  for (let t = 0; t < n; t++) {
    const D = tri(216, 240, 264)
    const AC = tri(2.7, 3.0, 3.6)
    const HP = tri(0.3, 0.4, 0.8)
    const VP = tri(4.8, 6.0, 9.0)
    const PK = tri(1.44, 1.6, 1.76)
    const v1 = val(wait(D, 240), 0, 80, 5 * PK)
    const v2 = val(wait(D, 288), 6 * AC, 66.7, 5 * PK)
    const v3 = val(wait(D, 240), VP, 100, (30 / 7) * PK)
    const v4 = val(wait(D, 320), 4 * AC + 2 * HP, 90, 5 * PK)
    const won = v4 > Math.max(v1, v2, v3)
    if (won) first++
    if (D < 232) {
      lowDemand++
      if (!won) lossesAtLowDemand++
    } else if (!won) lossesAtHighDemand++
  }
  return { p: first / n, lossesAtHighDemand, pLowDemand: lowDemand / n, pLossGivenLow: lossesAtLowDemand / lowDemand }
}

describe('Monte Carlo headline: independent cross-check (W7-F02)', () => {
  const se = (p: number, n: number) => Math.sqrt((p * (1 - p)) / n)
  const check = crossCheck(200000, 12345)
  it('P(ALT-004 first) from the course tool agrees with an independent implementation', () => {
    const course = monteCarlo(ref, REFERENCE_UNCERTAINTY, { n: 10000, seed: 2026, drivers: REFERENCE_DRIVERS })
    const p = course.pFirst['ALT-004']
    const z = Math.abs(p - check.p) / Math.sqrt(se(p, 10000) ** 2 + se(check.p, 200000) ** 2)
    expect(z).toBeLessThan(3)
    // and within 2 of the headline's own stated standard errors (±0.0024)
    expect(Math.abs(p - check.p)).toBeLessThan(2 * se(p, 10000))
    // the mechanism the lesson states: ALT-004 loses only when demand is below 232/day (≈ 22 % of trials)
    expect(check.lossesAtHighDemand).toBe(0)
    expect(Math.abs(check.pLowDemand - 16 ** 2 / (48 * 24))).toBeLessThan(0.005)
    expect(check.pLossGivenLow.toFixed(2)).toBe('0.27')
  })
  it('mutation: the pre-review method (fitted triangles at a common quantile) fails the same gate', () => {
    const tri = (low: number, mode: number, high: number) => ({ kind: 'triangular' as const, low, mode, high })
    const OLD: Uncertainty = {
      'ALT-001': { 'CRIT-001': tri(20, 66.7, 78.7), 'CRIT-004': tri(7.2, 8, 8.8) },
      'ALT-002': { 'CRIT-001': tri(8, 12, 24), 'CRIT-002': tri(16.2, 18, 21.6), 'CRIT-004': tri(7.2, 8, 8.8) },
      'ALT-003': { 'CRIT-001': tri(20, 66.7, 78.7), 'CRIT-002': tri(4.8, 6, 9), 'CRIT-004': tri(6.17, 6.86, 7.54) },
      'ALT-004': { 'CRIT-001': tri(6.15, 8, 11.43), 'CRIT-002': tri(11.4, 12.8, 16), 'CRIT-004': tri(7.2, 8, 8.8) },
    }
    const old = monteCarlo(ref, OLD, { n: 10000, seed: 2026, shared: ['CRIT-001', 'CRIT-004'] })
    expect(old.firstCounts['ALT-004']).toBe(9605) // the number the lesson used to quote
    const p = old.pFirst['ALT-004']
    const z = Math.abs(p - check.p) / Math.sqrt(se(p, 10000) ** 2 + se(check.p, 200000) ** 2)
    expect(z).toBeGreaterThan(3)
  })
})

describe('L7 acceptance at save time (W7-F10)', () => {
  const moes = ['MOE-001', 'MOE-003', 'MOE-005', 'MOE-006']
  it('the reference study passes, with ALT-001 as the one baseline', () => {
    expect(ref.alternatives.filter((a) => a.baseline).map((a) => a.id)).toEqual(['ALT-001'])
    expect(checkForSave(ref, moes)).toEqual([])
  })
  it('a realistic study whose description only mentions the baseline, with one untraced criterion, is refused', () => {
    const bad: TradeStudy = {
      ...ref,
      alternatives: ref.alternatives.map((a) => ({ ...a, baseline: false, description: a.id === 'ALT-002' ? 'Six more aircraft, which is much better than the baseline on wait.' : a.description })),
      criteria: ref.criteria.map((c) => (c.id === 'CRIT-004' ? { ...c, moe: undefined } : c)),
    }
    const errs = checkForSave(bad, moes)
    expect(errs.some((e) => /exactly one alternative as the baseline/.test(e))).toBe(true)
    expect(errs.some((e) => /CRIT-004: trace the criterion to an MOE/.test(e))).toBe(true)
    // exploring is still allowed: these are warnings in checkStudy, not errors
    expect(checkStudy(bad).filter((i) => i.level === 'error')).toEqual([])
    // an MOE ID that is not in the workspace cannot be traced
    expect(checkForSave(ref, ['MOE-001'])).toHaveLength(3)
  })
})

describe('save keeps provenance and ownership of unchanged elements (W7-S01)', () => {
  it('a second save tags only the changed items; unchanged items keep the first owner and tag', async () => {
    const { planSave } = await import('./save')
    const { referenceStudy } = await import('./reference')
    const study = referenceStudy()
    const empty = { elements: [], links: [] }
    const first = planSave(study, empty as never, { owner: 'AB', provenance: 'team-derived' })
    // build the model the first save would produce (IDs kept as the study's local IDs for this pure test)
    const model = { elements: first.creates.map(({ key, ...e }) => ({ ...e, id: key, status: 'active' as const })), links: [] }
    expect(model.elements.every((e) => e.owner === 'AB' && e.provenance === 'team-derived')).toBe(true)
    // student edits one alternative's description and re-saves with the AI tag and another owner
    const edited = { ...study, alternatives: study.alternatives.map((a, i) => (i === 0 ? { ...a, description: (a.description ?? '') + ' (AI-suggested option, reviewed)' } : a)) }
    const second = planSave(edited, model as never, { owner: 'CD', provenance: 'AI-suggested-reviewed' })
    expect(second.creates).toEqual([])
    expect(second.updates.map((u) => u.id)).toEqual([study.alternatives[0].id])
    expect(second.updates[0].patch).toMatchObject({ owner: 'CD', provenance: 'AI-suggested-reviewed' })
    // mutation guard: an unchanged re-save produces no updates at all
    expect(planSave(study, model as never, { owner: 'ZZ', provenance: 'AI-suggested-reviewed' }).updates).toEqual([])
  })
})

describe('W7-C01: a weight edit re-tags only the edited criterion; other criteria keep owner and tag but get current weights', () => {
  it('three-save sequence: team save, AI-tagged criterion edit, team weight tweak', async () => {
    const { planSave } = await import('./save')
    const { referenceStudy } = await import('./reference')
    const apply = (model: { elements: Record<string, unknown>[] }, plan: ReturnType<typeof planSave>) => ({
      elements: [
        ...model.elements.map((e) => {
          const u = plan.updates.find((x) => x.id === e.id)
          return u ? { ...e, ...u.patch } : e
        }),
        ...plan.creates.map(({ key, ...e }) => ({ ...e, id: key, status: 'active' })),
      ],
      links: [],
    })
    const s1 = referenceStudy()
    let model = apply({ elements: [] }, planSave(s1, { elements: [], links: [] } as never, { owner: 'AB', provenance: 'team-derived' }))
    // save 2: an AI-suggested change to criterion 0's name only
    const s2 = { ...s1, criteria: s1.criteria.map((c, i) => (i === 0 ? { ...c, name: c.name + ' (AI-suggested wording)' } : c)) }
    const p2 = planSave(s2, model as never, { owner: 'CD', provenance: 'AI-suggested-reviewed' })
    expect(p2.updates.map((u) => u.id)).toEqual([s1.criteria[0].id])
    model = apply(model, p2)
    // save 3: the team changes criterion 1's swing points; all normalised weights move
    const s3 = { ...s2, criteria: s2.criteria.map((c, i) => (i === 1 ? { ...c, swingPoints: c.swingPoints + 25 } : c)) }
    const p3 = planSave(s3, model as never, { owner: 'AB', provenance: 'team-derived' })
    const tagged = p3.updates.filter((u) => 'provenance' in u.patch).map((u) => u.id)
    expect(tagged).toEqual([s1.criteria[1].id])
    model = apply(model, p3)
    const c0 = model.elements.find((e) => e.id === s1.criteria[0].id) as { provenance: string; owner: string; attributes: { weight: number } }
    expect(c0).toMatchObject({ provenance: 'AI-suggested-reviewed', owner: 'CD' })
    // and its stored weight is current (renormalised), not stale
    const total = s3.criteria.reduce((a, c) => a + c.swingPoints, 0)
    expect(c0.attributes.weight).toBeCloseTo(s3.criteria[0].swingPoints / total, 3)
  })

  it('updating a reference alternative keeps its non-score attributes', async () => {
    const { planSave } = await import('./save')
    const { referenceStudy } = await import('./reference')
    const s = referenceStudy()
    const alt = s.alternatives[0]
    const model = { elements: [{ id: alt.id, kind: 'ALT', name: alt.name, text: 'old', attributes: { aircraft: 12, ...alt.scores }, provenance: 'instructor-reference', status: 'active' }], links: [] }
    const p = planSave(s, model as never, { owner: 'AB', provenance: 'team-derived' })
    const u = p.updates.find((x) => x.id === alt.id)!
    expect(u.patch.attributes).toMatchObject({ aircraft: 12 })
  })
})
