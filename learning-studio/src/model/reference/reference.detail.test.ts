// Detailed checks on the instructor reference baseline: Pathway-B minimums (lab plan C.5), trace rules, requirement
// quality, risk ratings, measures, architecture allocation, cross-file consistency with the Data Sheet and the
// dynamics model, and an independent recomputation of the Week 7 trade study and its rank-reversal point.
import { describe, expect, it } from 'vitest'
import { completeThreads, kindOfId, orphansAndChildless, requirementCoverage, type Element, type EngineeringModel } from '../engineering'
import { DATA_SHEET } from '../airtaxi'
import { DEFAULT_PARAMS } from '../../sim/aerolink'
import { referenceUpTo } from '.'

const m = referenceUpTo(14)
const byId = new Map(m.elements.map((e) => [e.id, e]))
const ofKind = (k: string, model: EngineeringModel = m) => model.elements.filter((e) => e.kind === k)
const linksFrom = (id: string, type: string) => m.links.filter((l) => l.source === id && l.type === type)
const linksTo = (id: string, type: string) => m.links.filter((l) => l.target === id && l.type === type)
const attr = (e: Element, k: string) => e.attributes?.[k]
const ds = (key: string) => DATA_SHEET.find((p) => p.key === key)!.value

// ------------------------------------------------------------------------------------------------
// Additive value model and one-weight sensitivity (S11 p.467-469), written independently of the reference data.
type Crit = { id: string; weight: number; worst: number; best: number }
type Alt = { id: string; raw: Record<string, number> }
const value = (x: number, c: Crit) => Math.min(1, Math.max(0, (x - c.worst) / (c.best - c.worst)))
function scores(alts: Alt[], crits: Crit[], weights: Record<string, number>): Record<string, number> {
  return Object.fromEntries(alts.map((a) => [a.id, crits.reduce((s, c) => s + weights[c.id] * value(a.raw[c.id], c), 0)]))
}
const top = (s: Record<string, number>) => Object.entries(s).sort((a, b) => b[1] - a[1])[0][0]
/** Weights with criterion `k` set to `w` and the others rescaled in proportion, so the weights still sum to 1. */
function reweight(crits: Crit[], k: string, w: number): Record<string, number> {
  const base = crits.find((c) => c.id === k)!.weight
  return Object.fromEntries(crits.map((c) => [c.id, c.id === k ? w : (c.weight * (1 - w)) / (1 - base)]))
}
/** First weight of `k`, moving from its base value in `direction`, at which the top-ranked alternative changes. */
function reversalPoint(alts: Alt[], crits: Crit[], k: string, direction: 1 | -1): { at: number; to: string } | null {
  const base = crits.find((c) => c.id === k)!.weight
  const first = top(scores(alts, crits, reweight(crits, k, base)))
  const step = 0.001
  for (let w = base; w >= 0 && w <= 1; w += direction * step) {
    const t = top(scores(alts, crits, reweight(crits, k, w)))
    if (t !== first) {
      let lo = w - direction * step
      let hi = w
      for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2
        if (top(scores(alts, crits, reweight(crits, k, mid))) === first) lo = mid
        else hi = mid
      }
      return { at: (lo + hi) / 2, to: t }
    }
  }
  return null
}
const crits: Crit[] = ofKind('CRIT').map((c) => ({ id: c.id, weight: Number(attr(c, 'weight')), worst: Number(attr(c, 'worst')), best: Number(attr(c, 'best')) }))
const alts: Alt[] = ofKind('ALT').map((a) => ({ id: a.id, raw: Object.fromEntries(crits.map((c) => [c.id, Number(attr(a, c.id))])) }))
const baseWeights = Object.fromEntries(crits.map((c) => [c.id, c.weight]))

describe('reference baseline: Pathway-B minimums (lab plan C.5) and checkpoint scope (syllabus section 11)', () => {
  it('meets the minimum count of every element kind', () => {
    const count = (k: string) => ofKind(k).length
    expect(count('STK')).toBeGreaterThanOrEqual(12)
    expect(count('CON')).toBeGreaterThanOrEqual(10)
    expect(count('NEED')).toBeGreaterThanOrEqual(8)
    expect(count('CAP')).toBeGreaterThanOrEqual(5)
    expect(count('SCN')).toBeGreaterThanOrEqual(3)
    expect(count('REQ')).toBeGreaterThanOrEqual(15)
    expect(count('REQ')).toBeLessThanOrEqual(20)
    expect(count('MOE')).toBeGreaterThanOrEqual(3)
    expect(count('MOP')).toBeGreaterThanOrEqual(5)
    expect(count('TPM')).toBeGreaterThanOrEqual(2)
    expect(count('TECH')).toBe(3)
    expect(count('ALT')).toBeGreaterThanOrEqual(3)
    expect(count('CRIT')).toBeGreaterThanOrEqual(4)
    expect(count('FN')).toBeGreaterThanOrEqual(6)
    expect(count('LOG')).toBeGreaterThanOrEqual(6)
    expect(count('PHY')).toBeGreaterThanOrEqual(6)
    expect(count('IF')).toBeGreaterThanOrEqual(6)
    expect(count('INFO')).toBeGreaterThanOrEqual(5)
    expect(count('AI')).toBeGreaterThanOrEqual(2)
    expect(count('VER')).toBeGreaterThanOrEqual(5)
    expect(count('R')).toBeGreaterThanOrEqual(4)
    expect(count('A') + count('R') + count('O') + count('U')).toBeGreaterThanOrEqual(8)
    for (const k of ['A', 'O', 'U']) expect(count(k), k).toBeGreaterThanOrEqual(1)
  })

  it('AROU v0 at Week 2 already has >= 4 entries with one each of A, R, O, U', () => {
    const w2 = referenceUpTo(2)
    for (const k of ['A', 'R', 'O', 'U']) expect(ofKind(k, w2).length, k).toBeGreaterThanOrEqual(1)
  })

  it('has >= 5 complete 11-link threads from >= 3 different stakeholders', () => {
    const threads = completeThreads(m)
    expect(threads.length).toBeGreaterThanOrEqual(5)
    expect(new Set(threads.map((t) => t.ids[0])).size).toBeGreaterThanOrEqual(3)
  })

  it('contains the five demonstration threads listed in docs/authoring/reference_model_notes.md', () => {
    const keys = new Set(completeThreads(m).map((t) => t.ids.join('>')))
    const demo = [
      'STK-005>NEED-004>CAP-003>REQ-SYS-001>FN-006>LOG-002>PHY-003>INFO-003>VER-001>MOP-002>R-001',
      'STK-004>NEED-003>CAP-007>REQ-SYS-002>FN-005>LOG-001>PHY-001>INFO-002>VER-002>MOP-004>R-003',
      'STK-002>NEED-002>CAP-004>REQ-SYS-003>FN-003>LOG-001>PHY-001>INFO-002>VER-003>MOP-005>R-002',
      'STK-009>NEED-007>CAP-006>REQ-SYS-008>FN-008>LOG-003>PHY-005>INFO-003>VER-008>MOP-007>R-002',
      'STK-001>NEED-001>CAP-002>REQ-SYS-005>FN-002>LOG-005>PHY-004>INFO-001>VER-005>MOP-001>R-007',
    ]
    for (const d of demo) expect(keys.has(d), d).toBe(true)
  })
})

describe('reference baseline: provenance and status', () => {
  it('every element is active and carries a reference, official or fictional provenance', () => {
    for (const e of m.elements) {
      expect(e.status, e.id).toBe('active')
      expect(['instructor-reference', 'official-S04', 'instructor-fictional'], e.id).toContain(e.provenance)
      expect(e.name.length, e.id).toBeGreaterThan(0)
      expect(e.name.length, e.id).toBeLessThanOrEqual(60)
    }
  })

  it('uses the official S04 names for the official logical, physical, scenario and information elements', () => {
    expect(byId.get('LOG-005')!.name).toBe('Scheduling')
    expect(byId.get('PHY-003')!.name).toBe('Charging Systems')
    expect(byId.get('SCN-005')!.name).toBe('Weather Disruption')
    expect(byId.get('INFO-004')!.name).toBe('Weather Data')
    for (const id of ['LOG-001', 'PHY-001', 'SCN-001', 'INFO-001']) expect(byId.get(id)!.provenance, id).toBe('official-S04')
  })
})

describe('reference baseline: needs, capabilities and scenarios (RB-2)', () => {
  it('every concern derives from a stakeholder', () => {
    for (const c of ofKind('CON')) expect(linksFrom(c.id, 'derives-from').some((l) => kindOfId(l.target) === 'STK'), c.id).toBe(true)
  })
  it('every NEED has a STK or CON parent, and a STK parent so threads can start from it; no need contains "shall"', () => {
    for (const nd of ofKind('NEED')) {
      const parents = linksFrom(nd.id, 'derives-from').map((l) => kindOfId(l.target))
      expect(parents.some((k) => k === 'STK' || k === 'CON'), nd.id).toBe(true)
      expect(parents, nd.id).toContain('STK')
      expect(/\bshall\b/i.test(nd.text ?? ''), nd.id).toBe(false)
    }
  })
  it('every CAP derives from a NEED and at least 2 capabilities are decompositions (refines)', () => {
    for (const c of ofKind('CAP')) expect(linksFrom(c.id, 'derives-from').some((l) => kindOfId(l.target) === 'NEED'), c.id).toBe(true)
    expect(m.links.filter((l) => l.type === 'refines' && kindOfId(l.source) === 'CAP' && kindOfId(l.target) === 'CAP').length).toBeGreaterThanOrEqual(2)
  })
  it('MGO has a mission, >= 2 goals and measurable objectives', () => {
    const lv = (x: string) => ofKind('MGO').filter((g) => attr(g, 'level') === x)
    expect(lv('mission')).toHaveLength(1)
    expect(lv('goal').length).toBeGreaterThanOrEqual(2)
    for (const o of lv('objective')) expect(attr(o, 'target'), o.id).toBeDefined()
  })
  it('every scenario has actors, preconditions, main flow, >= 1 alternate flow and an end state', () => {
    for (const s of ofKind('SCN')) {
      for (const k of ['actors', 'preconditions', 'mainFlow', 'alternateFlows', 'endState']) expect(String(attr(s, k) ?? '').length, `${s.id}.${k}`).toBeGreaterThan(10)
      expect(String(attr(s, 'alternateFlows')), s.id).toMatch(/A1/)
    }
  })
})

describe('reference baseline: requirements (RB-3)', () => {
  const reqs = ofKind('REQ')
  it('has both stakeholder and system requirements', () => {
    expect(reqs.filter((r) => r.id.startsWith('REQ-STK')).length).toBeGreaterThanOrEqual(5)
    expect(reqs.filter((r) => r.id.startsWith('REQ-SYS')).length).toBeGreaterThanOrEqual(5)
  })
  it('every requirement contains exactly one "shall", a criterion, a type, a method and a rationale that is not the text', () => {
    for (const r of reqs) {
      expect((r.text ?? '').match(/\bshall\b/gi)?.length ?? 0, r.id).toBe(1)
      expect(['test', 'analysis', 'inspection', 'demonstration'], r.id).toContain(attr(r, 'method'))
      expect(['functional', 'performance', 'interface', 'constraint'], r.id).toContain(attr(r, 'type'))
      expect(String(attr(r, 'criterion') ?? '').length, r.id).toBeGreaterThan(5)
      const rationale = String(attr(r, 'rationale') ?? '')
      expect(rationale.length, r.id).toBeGreaterThan(30)
      expect(rationale, r.id).not.toBe(r.text)
      expect(attr(r, 'level'), r.id).toBe(r.id.startsWith('REQ-STK') ? 'stakeholder' : 'system')
    }
  })
  it('types are balanced: every type is used at least twice', () => {
    for (const t of ['functional', 'performance', 'interface', 'constraint']) expect(reqs.filter((r) => attr(r, 'type') === t).length, t).toBeGreaterThanOrEqual(2)
  })
  it('REQ-STK derives from NEED or CAP; REQ-SYS derives from REQ-STK or CAP', () => {
    for (const r of reqs) {
      const parents = linksFrom(r.id, 'derives-from').map((l) => l.target)
      expect(parents.length, r.id).toBeGreaterThan(0)
      for (const p of parents) {
        if (r.id.startsWith('REQ-STK')) expect(['NEED', 'CAP'], `${r.id}->${p}`).toContain(kindOfId(p))
        else expect(p.startsWith('REQ-STK') || kindOfId(p) === 'CAP', `${r.id}->${p}`).toBe(true)
      }
    }
  })
  it('every TBD names an Unknown/Assumption that affects the requirement', () => {
    for (const r of reqs.filter((x) => /TBD/.test(x.text ?? ''))) {
      const item = String(attr(r, 'tbdItem'))
      expect(['U', 'A'], r.id).toContain(kindOfId(item))
      expect(linksTo(r.id, 'affects').some((l) => l.source === item), r.id).toBe(true)
      expect(r.text, r.id).toContain(String(attr(r, 'tbd')))
    }
  })
  it('has no orphan requirements and no childless capabilities; the only childless need is NEED-011 (open item)', () => {
    // NEED-011 was discovered by writing SCN-005 (Week 3, W3-F18). No requirement of the 20-requirement set derives
    // from it yet; adding one is a lead decision recorded in docs/authoring/reference_model_notes.md.
    expect(orphansAndChildless(m)).toEqual({ orphans: [], childless: ['NEED-011'] })
  })
  it('every REQ-SYS is satisfied by a design element and allocated to a function', () => {
    const cov = requirementCoverage(m)
    for (const c of cov.filter((x) => x.id.startsWith('REQ-SYS'))) {
      expect(c.satisfied, c.id).toBe(true)
      expect(linksFrom(c.id, 'allocated-to').some((l) => kindOfId(l.target) === 'FN'), c.id).toBe(true)
    }
  })
  it('>= 3 requirements are verified, and each VER uses the method recorded on its requirement', () => {
    expect(requirementCoverage(m).filter((c) => c.verified).length).toBeGreaterThanOrEqual(3)
    for (const v of ofKind('VER')) {
      const targets = linksFrom(v.id, 'verifies').map((l) => byId.get(l.target)!)
      expect(targets.length, v.id).toBe(1)
      expect(attr(v, 'method'), v.id).toBe(attr(targets[0], 'method'))
      for (const k of ['objective', 'subject', 'successCriterion', 'verdictLogic']) expect(String(attr(v, k) ?? '').length, `${v.id}.${k}`).toBeGreaterThan(5)
      expect(String(attr(v, 'verdictLogic')), v.id).toMatch(/pass:.*fail:.*inconclusive:.*error:/)
    }
  })
})

describe('reference baseline: measures (RB-4)', () => {
  it('every MOE measures a NEED; every MOP measures an MOE and >= 1 REQ', () => {
    for (const e of ofKind('MOE')) expect(linksFrom(e.id, 'measures').some((l) => kindOfId(l.target) === 'NEED'), e.id).toBe(true)
    for (const p of ofKind('MOP')) {
      const t = linksFrom(p.id, 'measures').map((l) => kindOfId(l.target))
      expect(t, p.id).toContain('MOE')
      expect(t, p.id).toContain('REQ')
    }
  })
  it('every TPM derives from an MOP and its margin equals the distance from estimate to threshold', () => {
    for (const t of ofKind('TPM')) {
      expect(linksFrom(t.id, 'derives-from').some((l) => kindOfId(l.target) === 'MOP'), t.id).toBe(true)
      const [th, est, mg] = ['threshold', 'currentEstimate', 'margin'].map((k) => Number(attr(t, k)))
      const expected = attr(t, 'sense') === 'lower-is-better' ? th - est : est - th
      expect(mg, t.id).toBeCloseTo(expected, 6)
      expect(mg, t.id).toBeGreaterThan(0)
      expect(attr(t, 'objective'), t.id).toBeDefined()
      expect(attr(t, 'unit'), t.id).toBeDefined()
    }
  })
})

describe('reference baseline: technology and risk (RB-5)', () => {
  it('each TECH has a TRL 1-9 backed by an assumption that affects it', () => {
    for (const t of ofKind('TECH')) {
      const trl = Number(attr(t, 'trl'))
      expect(Number.isInteger(trl) && trl >= 1 && trl <= 9, t.id).toBe(true)
      const a = String(attr(t, 'assumptionId'))
      expect(kindOfId(a), t.id).toBe('A')
      expect(linksTo(t.id, 'affects').some((l) => l.source === a), t.id).toBe(true)
    }
  })
  it('risks are condition-if-then, rated 1-5 x 1-5, owned, handled and treated, and affect >= 1 element', () => {
    const risks = ofKind('R')
    expect(risks.filter((r) => /Condition:.*\bIf\b.*\bthen\b/s.test(r.text ?? '')).length).toBe(risks.length)
    for (const r of risks) {
      for (const k of ['likelihood', 'consequence']) {
        const v = Number(attr(r, k))
        expect(Number.isInteger(v) && v >= 1 && v <= 5, `${r.id}.${k}`).toBe(true)
      }
      expect(['avoid', 'mitigate', 'transfer', 'accept'], r.id).toContain(attr(r, 'handling'))
      expect(String(attr(r, 'owner') ?? '').length, r.id).toBeGreaterThan(3)
      expect(String(attr(r, 'treatment') ?? '').length, r.id).toBeGreaterThan(10)
      expect(linksFrom(r.id, 'affects').length, r.id).toBeGreaterThan(0)
    }
    expect(new Set(risks.map((r) => attr(r, 'handling'))).size).toBe(4)
  })
  it('requirements, physical elements and decisions all mitigate some risk', () => {
    const mitigators = new Set(m.links.filter((l) => l.type === 'mitigates').map((l) => kindOfId(l.source)))
    for (const k of ['REQ', 'PHY', 'DEC']) expect(mitigators, k).toContain(k)
  })
})

describe('reference baseline: trade study (RB-6) recomputed from the additive value model', () => {
  const dec = byId.get('DEC-001')!
  it('criteria derive from MOEs, weights sum to 1 and follow the swing points', () => {
    for (const c of ofKind('CRIT')) expect(linksFrom(c.id, 'derives-from').some((l) => kindOfId(l.target) === 'MOE'), c.id).toBe(true)
    expect(crits.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1, 9)
    const pts = ofKind('CRIT').map((c) => Number(attr(c, 'swingPoints')))
    const total = pts.reduce((a, b) => a + b, 0)
    crits.forEach((c, i) => expect(c.weight, c.id).toBeCloseTo(pts[i] / total, 9))
  })
  it('every alternative has a raw score for every criterion; there is a baseline', () => {
    for (const a of alts) for (const c of crits) expect(Number.isFinite(a.raw[c.id]), `${a.id}.${c.id}`).toBe(true)
    expect(byId.get('ALT-001')!.name).toMatch(/Baseline/)
  })
  it('the recommended alternative wins clearly at the base weights, with the scores stated in DEC-001', () => {
    const s = scores(alts, crits, baseWeights)
    expect(top(s)).toBe(attr(dec, 'recommended'))
    const sorted = Object.values(s).sort((a, b) => b - a)
    expect(sorted[0] - sorted[1]).toBeGreaterThan(0.1)
    for (const [id, v] of Object.entries(s)) expect(String(attr(dec, 'scores')), id).toContain(`${id} ${v.toFixed(3)}`)
  })
  it('reproduces the stated rank-reversal point on a top-2 weight', () => {
    const k = String(attr(dec, 'sensitivityCriterion'))
    const top2 = [...crits].sort((a, b) => b.weight - a.weight).slice(0, 2).map((c) => c.id)
    expect(top2).toContain(k)
    const r = reversalPoint(alts, crits, k, 1)
    expect(r).not.toBeNull()
    expect(r!.at).toBeCloseTo(Number(attr(dec, 'reversalPoint')), 3)
    expect(r!.to).toBe(attr(dec, 'reversalTo'))
    // the point lies in a plausible range: above the base weight, below 0.6
    expect(r!.at).toBeGreaterThan(crits.find((c) => c.id === k)!.weight)
    expect(r!.at).toBeLessThan(0.6)
  })
  it('reproduces the second reversal stated in DEC-001 (wait weight below 0.226 -> ALT-003)', () => {
    const r = reversalPoint(alts, crits, 'CRIT-001', -1)
    expect(r!.at).toBeCloseTo(0.226, 3)
    expect(r!.to).toBe('ALT-003')
    expect(String(attr(dec, 'reversalNote'))).toContain('0.226')
  })
  it('mutation: the reversal check fails when a raw score changes', () => {
    const mutated = alts.map((a) => (a.id === 'ALT-001' ? { ...a, raw: { ...a.raw, 'CRIT-002': 10 } } : a))
    const r = reversalPoint(mutated, crits, 'CRIT-002', 1)
    expect(r === null || Math.abs(r.at - Number(attr(dec, 'reversalPoint'))) > 0.005 || r.to !== attr(dec, 'reversalTo')).toBe(true)
  })
  it('alternative capacities follow min(aircraft x 20, turnaround chargers x 48) and the wait follows the dynamics approximation', () => {
    const perAircraft = DEFAULT_PARAMS.tripsPerAircraftPerDay
    const perCharger = (DEFAULT_PARAMS.operatingHoursPerDay * 60) / DEFAULT_PARAMS.chargeMinutesPerTrip
    const demand = Number(attr(byId.get('A-006')!, 'value'))
    for (const a of ofKind('ALT')) {
      const cap = Math.min(Number(attr(a, 'aircraft')) * perAircraft, Number(attr(a, 'turnaroundChargers')) * perCharger)
      expect(attr(a, 'capacityTripsPerDay'), a.id).toBe(cap)
      const u = demand / cap
      const wait = 2 / Math.max(0.03, 1 - Math.min(u, 0.97)) + Math.max(0, u - 1) * 120
      expect(Number(attr(a, 'CRIT-001')), a.id).toBeCloseTo(wait, 1)
    }
    // only the recommended alternative meets REQ-STK-004 (>= 300 trips/day)
    expect(ofKind('ALT').filter((a) => Number(attr(a, 'capacityTripsPerDay')) >= 300).map((a) => a.id)).toEqual([attr(dec, 'recommended')])
  })
})

describe('reference baseline: architecture (RB-7)', () => {
  it('every FN derives from a CAP, is performed by a LOG and is allocated to a PHY of that LOG', () => {
    for (const f of ofKind('FN')) {
      expect(linksFrom(f.id, 'derives-from').some((l) => kindOfId(l.target) === 'CAP'), f.id).toBe(true)
      const logs = linksTo(f.id, 'performs').filter((l) => kindOfId(l.source) === 'LOG').map((l) => l.source)
      expect(logs.length, f.id).toBeGreaterThan(0)
      const phys = linksFrom(f.id, 'allocated-to').filter((l) => kindOfId(l.target) === 'PHY').map((l) => l.target)
      expect(phys.length, f.id).toBeGreaterThan(0)
      const logPhys = new Set(logs.flatMap((lg) => linksFrom(lg, 'allocated-to').map((l) => l.target)))
      for (const p of phys) expect(logPhys.has(p), `${f.id}->${p}`).toBe(true)
    }
  })
  it('every official LOG performs a function and is allocated to a PHY', () => {
    for (const lg of ofKind('LOG')) {
      expect(linksFrom(lg.id, 'performs').length, lg.id).toBeGreaterThan(0)
      expect(linksFrom(lg.id, 'allocated-to').some((l) => kindOfId(l.target) === 'PHY'), lg.id).toBe(true)
    }
  })
  it('every IF has a type and two existing ends; all three interface types are used', () => {
    for (const i of ofKind('IF')) {
      expect(['physical', 'information', 'organisational'], i.id).toContain(attr(i, 'type'))
      const ends = String(attr(i, 'ends')).split('<->').map((s) => s.trim())
      expect(ends, i.id).toHaveLength(2)
      for (const e of ends) expect(byId.has(e), `${i.id} end ${e}`).toBe(true)
    }
    expect(new Set(ofKind('IF').map((i) => attr(i, 'type'))).size).toBe(3)
  })
  it('every INFO names producer, consumer and the decision it supports, and flows from and to elements', () => {
    for (const i of ofKind('INFO')) {
      for (const k of ['producer', 'consumer', 'decisionSupported']) expect(String(attr(i, k) ?? '').length, `${i.id}.${k}`).toBeGreaterThan(5)
      expect(linksTo(i.id, 'flows-to').length, i.id).toBeGreaterThan(0)
      expect(linksFrom(i.id, 'flows-to').length, i.id).toBeGreaterThan(0)
    }
  })
  // Course coverage rule (Week 8, review W8-F04/F07; second structural batch of 2026-10-11).
  const ifEnds = (i: Element) => String(attr(i, 'ends')).split('<->').map((s) => s.trim())
  const joining = (a: string, b: string, model: EngineeringModel = m) =>
    ofKind('IF', model).filter((i) => { const [x, y] = ifEnds(i); return (x === a && y === b) || (x === b && y === a) })
  const infoJoined = (a: string, b: string, model: EngineeringModel = m) => joining(a, b, model).some((i) => attr(i, 'type') === 'information')
  /** Where an element sits physically: PHY and EXT are themselves; an AI is the PHY it is allocated to; others are not placed. */
  const placeOf = (id: string, model: EngineeringModel = m): string[] => {
    const k = kindOfId(id)
    if (k === 'PHY' || k === 'EXT') return [id]
    if (k === 'AI') return model.links.filter((l) => l.source === id && l.type === 'allocated-to' && kindOfId(l.target) === 'PHY').map((l) => l.target)
    return []
  }
  /** Recorded relays of an INFO: "PHY-a > PHY-b > PHY-c over …" (the path is the IDs before "over"). */
  const relaysOf = (info: Element): string[][] =>
    String(attr(info, 'relay') ?? '').split(';').map((r) => r.split(/\bover\b/)[0].match(/\b(?:PHY|EXT)-\d{3}\b/g) ?? []).filter((p) => p.length >= 3)
  /** Every producer -> consumer crossing of each INFO (placed by placeOf) that no information IF or recorded relay carries. */
  const uncoveredCrossings = (model: EngineeringModel = m): string[] =>
    ofKind('INFO', model).flatMap((info) => {
      const flows = model.links.filter((l) => l.type === 'flows-to')
      const from = [...new Set(flows.filter((l) => l.target === info.id).flatMap((l) => placeOf(l.source, model)))]
      const to = [...new Set(flows.filter((l) => l.source === info.id).flatMap((l) => placeOf(l.target, model)))]
      const relays = relaysOf(info)
      const relayed = (a: string, b: string) => relays.some((p) => p[0] === a && p[p.length - 1] === b && p.every((x, k) => k === 0 || infoJoined(p[k - 1], x, model)))
      return from.flatMap((a) => to.filter((b) => b !== a && !infoJoined(a, b, model) && !relayed(a, b)).map((b) => `${info.id} ${a}->${b}`))
    })

  it('every information flow between placed elements crosses an information interface or a recorded relay (AI at its host PHY)', () => {
    expect(uncoveredCrossings()).toEqual([])
    // The one recorded relay: charge-session records reach AI-001 (hosted at the maintenance facility) through the operations centre.
    expect(relaysOf(byId.get('INFO-003')!)).toEqual([['PHY-003', 'PHY-004', 'PHY-005']])
  })
  it('the coverage check can fail: removing an interface, retyping it, or breaking a relay hop is each detected (mutation)', () => {
    const without = (id: string): EngineeringModel => ({ ...m, elements: m.elements.filter((e) => e.id !== id) })
    const retyped = (id: string, type: string): EngineeringModel => ({ ...m, elements: m.elements.map((e) => (e.id === id ? { ...e, attributes: { ...e.attributes, type } } : e)) })
    expect(uncoveredCrossings(without('IF-013'))).toEqual(['INFO-002 PHY-001->PHY-005'])
    expect(uncoveredCrossings(retyped('IF-014', 'organisational'))).toEqual(['INFO-001 PHY-002->PHY-004'])
    expect(uncoveredCrossings(without('IF-011'))).toEqual(['INFO-004 EXT-003->PHY-004'])
    // IF-012 is both a direct carrier (PHY-005 -> PHY-004) and the second hop of the INFO-003 relay to AI-001.
    expect(uncoveredCrossings(without('IF-012'))).toEqual(['INFO-003 PHY-005->PHY-004', 'INFO-003 PHY-003->PHY-005'])
    expect(uncoveredCrossings(without('IF-010'))).toEqual(['INFO-003 PHY-003->PHY-004', 'INFO-003 PHY-003->PHY-005'])
    // With AI-001 back on the operations centre (the pre-2026-10-11 allocation), IF-010 alone carries its input: no relay is needed.
    const back: EngineeringModel = { ...m, links: m.links.map((l) => (l.source === 'AI-001' && l.type === 'allocated-to' ? { ...l, target: 'PHY-004' } : l)) }
    expect(uncoveredCrossings(back)).toEqual([])
  })
  it('the five interfaces added on 2026-10-11 are information interfaces with the stated ends; IF-004 and IF-009 stay organisational', () => {
    const want: Record<string, string> = { 'IF-010': 'PHY-003 <-> PHY-004', 'IF-011': 'EXT-003 <-> PHY-004', 'IF-012': 'PHY-005 <-> PHY-004', 'IF-013': 'PHY-001 <-> PHY-005', 'IF-014': 'PHY-002 <-> PHY-004' }
    for (const [id, ends] of Object.entries(want)) {
      expect(attr(byId.get(id)!, 'type'), id).toBe('information')
      expect(attr(byId.get(id)!, 'ends'), id).toBe(ends)
    }
    expect(ofKind('IF')).toHaveLength(14)
    for (const id of ['IF-004', 'IF-009']) expect(attr(byId.get(id)!, 'type'), id).toBe('organisational')
  })
  it('no organisational interface carries information or energy; every INFO an IF says it carries flows between its ends', () => {
    for (const i of ofKind('IF').filter((x) => attr(x, 'type') === 'organisational'))
      expect(String(attr(i, 'carries')), i.id).not.toMatch(/\bINFO-\d{3}\b|\benerg|\bpower\b|\bdata\b/i)
    for (const i of ofKind('IF')) {
      const [a, b] = ifEnds(i)
      for (const info of String(attr(i, 'carries')).match(/\bINFO-\d{3}\b/g) ?? []) {
        const from = linksTo(info, 'flows-to').flatMap((l) => placeOf(l.source))
        const to = linksFrom(info, 'flows-to').flatMap((l) => placeOf(l.target))
        // A relay hop counts: the INFO enters at one end and leaves at the other through a recorded relay.
        const hop = relaysOf(byId.get(info)!).some((p) => p.some((x, k) => k > 0 && ((p[k - 1] === a && x === b) || (p[k - 1] === b && x === a))))
        expect((from.includes(a) && to.includes(b)) || (from.includes(b) && to.includes(a)) || hop, `${i.id} carries ${info}`).toBe(true)
      }
    }
    // Fixed on 2026-10-11: IF-002 used to list INFO-003 although no PHY-001 -> INFO-003 flow exists.
    expect(attr(byId.get('IF-002')!, 'carries')).toBe('INFO-002')
  })
  it('every performer of a function (LOG or AI) is allocated to the PHY the function sits on (AI-001 with FN-008 on PHY-005)', () => {
    for (const f of ofKind('FN')) {
      const phys = linksFrom(f.id, 'allocated-to').map((l) => l.target)
      for (const p of linksTo(f.id, 'performs').map((l) => l.source))
        expect(linksFrom(p, 'allocated-to').some((l) => phys.includes(l.target)), `${p} performs ${f.id}`).toBe(true)
    }
    expect(linksFrom('AI-001', 'allocated-to').map((l) => l.target)).toEqual(['PHY-005'])
  })
  it('every FN except the planning function FN-013 derives from the scenario it is exercised in; DEC-002 does not claim booking', () => {
    const scn = (f: string) => linksFrom(f, 'derives-from').filter((l) => kindOfId(l.target) === 'SCN').map((l) => l.target)
    expect(ofKind('FN').filter((f) => scn(f.id).length === 0).map((f) => f.id)).toEqual(['FN-013'])
    expect(Object.fromEntries(ofKind('FN').map((f) => [f.id, scn(f.id).join(',')]))).toEqual({
      'FN-001': 'SCN-001', 'FN-002': 'SCN-001', 'FN-003': 'SCN-002', 'FN-004': 'SCN-005', 'FN-005': 'SCN-002', 'FN-006': 'SCN-003', 'FN-007': 'SCN-003',
      'FN-008': 'SCN-004', 'FN-009': 'SCN-004', 'FN-010': 'SCN-003', 'FN-011': 'SCN-002', 'FN-012': 'SCN-002', 'FN-013': '', 'FN-014': 'SCN-002',
    })
    expect(byId.get('DEC-002')!.text).not.toMatch(/booking/i)
    expect(linksFrom('FN-001', 'allocated-to').map((l) => l.target)).toEqual(['PHY-007'])
  })
  it('PHY-006 has no interface of its own and records why: it is the medium of the information interfaces it names', () => {
    expect(ofKind('IF').filter((i) => ifEnds(i).includes('PHY-006'))).toEqual([])
    const named = byId.get('PHY-006')!.text?.match(/\bIF-\d{3}\b/g) ?? []
    expect(named.length).toBeGreaterThan(0)
    for (const id of named) expect(attr(byId.get(id)!, 'type'), id).toBe('information')
    for (const id of named) expect(byId.get(id)!.text, id).toContain('PHY-006')
  })
  it('every AI capability states inputs, outputs, human oversight and failure behaviour', () => {
    for (const a of ofKind('AI')) for (const k of ['inputs', 'outputs', 'humanOversight', 'failureMode']) expect(String(attr(a, k) ?? '').length, `${a.id}.${k}`).toBeGreaterThan(10)
  })
})

describe('reference baseline: numbers agree with the Data Sheet and the dynamics model', () => {
  const text = (id: string) => byId.get(id)!.text ?? ''
  it('Data Sheet values appear unchanged where requirements use them', () => {
    expect(text('REQ-STK-002')).toContain(`${ds('noiseLimit')} dBA`)
    expect(text('REQ-SYS-002')).toContain(`${ds('noiseLimit')} dBA`)
    expect(text('REQ-SYS-003')).toContain(`${ds('reservePct')} %`)
    expect(text('REQ-SYS-001')).toContain(`${ds('chargeMin')} min`)
    expect(text('REQ-SYS-007')).toContain(`${ds('tripKm')} km`)
    expect(text('REQ-STK-004')).toContain(`${ds('opHours')} h`)
    // block time: cruise at the Data Sheet speed plus 6 min of terminal phases
    expect((ds('tripKm') / ds('cruiseKmh')) * 60 + 6).toBe(16)
  })
  it('fleet, vertiports and chargers match the Data Sheet; the turnaround pool matches the dynamics model (A-002)', () => {
    expect(attr(byId.get('PHY-001')!, 'baselineCount')).toBe(ds('fleet'))
    expect(attr(byId.get('PHY-001')!, 'seats')).toBe(ds('seats'))
    expect(attr(byId.get('PHY-002')!, 'sites')).toBe(ds('vertiports'))
    expect(attr(byId.get('PHY-003')!, 'installed')).toBe(ds('vertiports') * ds('chargersPerVertiport'))
    expect(attr(byId.get('A-002')!, 'turnaroundChargers')).toBe(DEFAULT_PARAMS.chargers)
    expect(attr(byId.get('PHY-003')!, 'highPowerAtHubs')).toBe(DEFAULT_PARAMS.chargers)
    expect(attr(byId.get('ALT-001')!, 'aircraft')).toBe(DEFAULT_PARAMS.initialFleet)
    expect(attr(byId.get('ALT-001')!, 'turnaroundChargers')).toBe(DEFAULT_PARAMS.chargers)
  })
  it('the wait threshold equals the dynamics wait tolerance, and capacity follows 240 / 0.8', () => {
    expect(attr(byId.get('A-001')!, 'value')).toBe(DEFAULT_PARAMS.waitToleranceMin)
    expect(text('REQ-STK-001')).toContain(`${DEFAULT_PARAMS.waitToleranceMin} min`)
    const mgo7 = byId.get('MGO-007')!
    expect(Number(attr(mgo7, 'demand')) / Number(attr(mgo7, 'maxUtilisation'))).toBe(Number(attr(mgo7, 'target')))
    expect(text('REQ-STK-004')).toContain(`${attr(mgo7, 'target')} trips per day`)
  })
  it('20 trips per aircraft per day = 16 h / 43 min cycle x 90 % availability (rounded)', () => {
    const cycle = 16 + 25 + 2 // block + hub turnaround + positioning (REQ-SYS-007, REQ-STK-005)
    expect(text('REQ-STK-005')).toContain('25 min')
    expect(Math.round(((DEFAULT_PARAMS.operatingHoursPerDay * 60) / cycle) * 0.9)).toBe(DEFAULT_PARAMS.tripsPerAircraftPerDay)
    expect(text('REQ-SYS-006')).toContain('90 %')
  })
})
