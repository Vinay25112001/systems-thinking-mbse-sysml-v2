// Week 3 AeroLink case: every trace resolves; every number is recomputed here from first principles (capacities, waits,
// costs, values, weights, totals, reversal points, margins, the fade model, the risk arithmetic) and checked against the
// instructor reference where the reference states it; the register is well formed (condition–if–then, ratings on the
// scale, owners, triggers, security and resilience present); the event-cap correction is the same text in the case and in
// the reference baseline. Each check is also shown able to fail on a mutated copy, so a clean run is not a vacuous pass.
import { describe, expect, it } from 'vitest'
import { referenceUpTo } from '../../../model/reference'
import {
  ALTERNATIVES, ASSUMPTIONS, CHAIN, CRITERIA, DECISION, EVENT_CAP, FADE15, FEASIBLE, ISSUES, KNOWN_IDS, MINMAX_DEMO, MONTH6, MORPH_PATHS, OPPORTUNITIES, ORDINAL_DEMO, R004_EXPECTED,
  RANKING, REFERENCE_ALTERNATIVES, RISKS, SCREENED_OUT, W2_DISPOSITIONS, W3_REQUIREMENTS, W3_UNKNOWNS, SCORES, SCREENS, SENSITIVITY, TECHNOLOGIES, TOTALS, TPMS, UNKNOWNS,
  UNSCREENED_SENSITIVITY, VALUES, WEIGHTS, capacityOfAlt, lowestCritical, marginOf, passesScreens, plannedProfile, rankedRisks, referenceMarginOf, riskLevel, riskStatement, walkAwayFailures, wceOf,
} from './aerolinkCase'
import { NEEDS } from '../week01/aerolinkCase'
import { CAPABILITIES, DELIBERATE_REQ_GAP, REQUIREMENTS, SCENARIO_SOI, UNCERTAINTIES, needsOfRequirement } from '../week02/aerolinkCase'
import { EMPTY_RECORD, assessRequirement, normalizeRecord, type Week2Record } from '../../../workbench/week2/record'
import { CONSEQUENCE, LAB3_MINIMUMS, MATURE_TRL, TRL_SCALE, cellLevel, reversalPoints, reweight } from './labBrief'

const ref = referenceUpTo(14)
const refEl = (id: string) => ref.elements.find((e) => e.id === id)
const near = (a: number, b: number, tol = 0.0005) => Math.abs(a - b) <= tol

describe('Week 3 case: traces resolve', () => {
  it('every technology, risk and TPM link points at an id that exists (Week 2 requirement, capability, scenario, or a Week 3 entry)', () => {
    for (const t of TECHNOLOGIES) for (const id of [...t.affects, t.basis.ref, t.maturityRisk ?? 'R-001']) expect(KNOWN_IDS.has(id), `${t.id} → ${id}`).toBe(true)
    for (const r of RISKS) for (const id of r.affects) expect(KNOWN_IDS.has(id), `${r.id} → ${id}`).toBe(true)
    for (const t of TPMS) for (const id of [t.measures, t.derivesFrom, t.relatedRisk]) expect(KNOWN_IDS.has(id), `${t.id} → ${id}`).toBe(true)
    for (const c of CRITERIA) expect(KNOWN_IDS.has(c.moe), `${c.id} → ${c.moe}`).toBe(true)
    for (const id of CHAIN) expect(KNOWN_IDS.has(id), id).toBe(true)
  })
  it('the chain is a real chain: the technology’s maturity risk, the risk’s TPM, the TPM’s requirement, the requirement’s need', () => {
    const [tech, r, t, req, nd] = CHAIN
    expect(TECHNOLOGIES.find((x) => x.id === tech)!.maturityRisk).toBe(r)
    expect(RISKS.find((x) => x.id === r)!.affects).toContain(t)
    expect(TPMS.find((x) => x.id === t)!.measures).toBe(req)
    expect(needsOfRequirement(req)).toContain(nd)
  })
  it('the negative direction: an unknown id is not known', () => {
    expect(KNOWN_IDS.has('REQ-SYS-099')).toBe(false)
    expect(KNOWN_IDS.has('TECH-009')).toBe(false)
  })
})

describe('Week 3 case: technology readiness', () => {
  it('matches the reference TRLs and rests every TRL on a labeled assumption', () => {
    for (const t of TECHNOLOGIES) {
      expect(refEl(t.id)?.attributes?.trl, t.id).toBe(t.trl)
      expect(t.basis.kind).toBe('assumption')
      expect(ASSUMPTIONS.some((a) => a.id === t.basis.ref), t.id).toBe(true)
    }
  })
  it('every TRL basis describes the environment its level names (SEBoK Table 1): relevant for 5 and 6, laboratory for 4; an operational site is only claimed with its reason for being "not operational"', () => {
    const envOk = (t: { trl: number; basis: { text: string } }) => {
      const env = TRL_SCALE.find((x) => x.level === t.trl)!.environment
      const text = t.basis.text.toLowerCase()
      const operationalClaim = /operating vertiport|operational environment|at an aerolink hub/.test(text) && !/not operational|not the operational|would be trl 7/.test(text)
      return text.includes(env) && !operationalClaim
    }
    for (const t of TECHNOLOGIES) expect(envOk(t), `${t.id}: ${t.basis.text}`).toBe(true)
    // the assumption behind TECH-001 says the same as its basis
    expect(ASSUMPTIONS.find((a) => a.id === 'A-003')!.text).toMatch(/relevant, not operational/)
    // negative direction: the pre-review wording (a prototype at an operating vertiport) is caught
    expect(envOk({ trl: 6, basis: { text: 'The supplier has demonstrated a prototype at an operating vertiport (a relevant environment).' } })).toBe(false)
  })
  it('the lowest critical TRL is TECH-002 at 5, and every critical technology below TRL 6 has a maturity risk', () => {
    expect(lowestCritical().id).toBe('TECH-002')
    expect(lowestCritical().trl).toBe(5)
    for (const t of TECHNOLOGIES.filter((x) => x.critical && x.trl < MATURE_TRL)) expect(t.maturityRisk, t.id).toBeTruthy()
  })
})

describe('Week 3 case: the register', () => {
  it('meets the lab minimums the lecture asks of teams (it is the worked example)', () => {
    expect(TECHNOLOGIES.length).toBeGreaterThanOrEqual(LAB3_MINIMUMS.technologies)
    expect(RISKS.length).toBeGreaterThanOrEqual(LAB3_MINIMUMS.risks)
    expect(RISKS.filter((r) => r.category === 'security').length).toBeGreaterThanOrEqual(LAB3_MINIMUMS.securityRisks)
    expect(RISKS.filter((r) => r.category === 'resilience').length).toBeGreaterThanOrEqual(LAB3_MINIMUMS.resilienceRisks)
    expect(OPPORTUNITIES.length).toBeGreaterThanOrEqual(LAB3_MINIMUMS.opportunities)
    expect(TPMS.length).toBeGreaterThanOrEqual(LAB3_MINIMUMS.tpms)
  })
  it('every risk is condition–if–then, rated on the scale with reasons, owned, triggered, and has no mitigation in the statement', () => {
    for (const r of RISKS) {
      const s = riskStatement(r)
      expect(s, r.id).toMatch(/^Condition: .+\. If .+, then .+\.$/)
      expect(s, r.id).not.toMatch(/\b(we will|to mitigate|will be mitigated)\b/i)
      for (const v of [r.likelihood, r.consequence]) expect(Number.isInteger(v) && v >= 1 && v <= 5, r.id).toBe(true)
      expect(r.likelihoodWhy.length + r.consequenceWhy.length, r.id).toBeGreaterThan(40)
      expect(r.owner && r.trigger && r.treatment, r.id).toBeTruthy()
      expect(r.affects.length, r.id).toBeGreaterThan(0)
    }
  })
  it('every consequence rating names its anchor: the reason ends in its level and uses a phrase of that level’s anchor (C4 recoverable, C5 permanent or injury)', () => {
    const names = (why: string, level: number) => {
      const stated = /: C(\d)\b/.exec(why)
      const keys = CONSEQUENCE.find((c) => c.level === level)!.keys
      return !!stated && Number(stated[1]) === level && keys.some((k) => why.toLowerCase().includes(k))
    }
    for (const r of RISKS) expect(names(r.consequenceWhy, r.consequence), `${r.id}: ${r.consequenceWhy}`).toBe(true)
    // the grid outage stays C4 because the service is suspended but recoverable, so it stays in a Low cell
    expect(RISKS.find((r) => r.id === 'R-011')!.consequenceWhy).toMatch(/recoverable/)
    // negative direction: the pre-review R-011 reason (C4 for "no safety consequence") names no C4 anchor phrase
    expect(names('Service suspended, no safety consequence: C4.', 4)).toBe(true)
    expect(names('No safety consequence (every trip lands with its reserve): C4.', 4)).toBe(false)
    expect(names('A stakeholder requirement is missed: C5.', 4)).toBe(false)
  })
  it('the reference risks keep their reference ratings and handling', () => {
    for (const r of RISKS.filter((x) => x.provenance === 'reference')) {
      const e = refEl(r.id)!
      expect(e.attributes?.likelihood, r.id).toBe(r.likelihood)
      expect(e.attributes?.consequence, r.id).toBe(r.consequence)
      expect(e.attributes?.handling, r.id).toBe(r.handling)
    }
  })
  it('security risks name the assets at stake; resilience entries name avoid, withstand or recover', () => {
    for (const r of RISKS.filter((x) => x.category === 'security')) expect(r.security?.assets.length, r.id).toBeGreaterThan(0)
    for (const r of RISKS.filter((x) => x.category === 'resilience')) expect(r.resilience?.objectives.length, r.id).toBeGreaterThan(0)
  })
  it('ranking: cell level first, then consequence; the ordinal product would rank them differently', () => {
    const ranked = rankedRisks().map((r) => r.id)
    expect(ranked.indexOf('R-008')).toBeLessThan(ranked.indexOf('R-002'))
    expect(ORDINAL_DEMO.r002.product).toBeGreaterThan(ORDINAL_DEMO.r008.product)
    expect(ORDINAL_DEMO.r002.level).toBe(ORDINAL_DEMO.r008.level)
    expect(ORDINAL_DEMO.sameProduct[0].product).toBe(ORDINAL_DEMO.sameProduct[1].product)
    expect(ORDINAL_DEMO.sameProduct[0].level).not.toBe(ORDINAL_DEMO.sameProduct[1].level)
    expect(riskLevel(RISKS.find((r) => r.id === 'R-011')!)).toBe('Low')
  })
  it('the cardinal check is arithmetic: 300 × (8 % − 5 %) = 9 trips/day, expected 3.6–5.4', () => {
    expect(R004_EXPECTED.lost).toBe(9)
    expect([R004_EXPECTED.expectedLo, R004_EXPECTED.expectedMid, R004_EXPECTED.expectedHi]).toEqual([3.6, 4.5, 5.4])
  })
  it('the unknowns are imported from Week 2 (TBD-01..04, TBR-01..02), and the issue is kept apart from the risks', () => {
    expect(UNKNOWNS.map((u) => u.tbx)).toEqual(['TBD-01', 'TBD-02', 'TBD-03', 'TBD-04', 'TBR-01', 'TBR-02'])
    expect(ISSUES.map((i) => i.id)).toEqual(['I-001'])
    // the Week 2 gap is closed by two Week 3 requirements, the notice time an owned TBD (the Week 2 disposition)
    expect(W3_REQUIREMENTS.map((q) => q.id)).toEqual(['REQ-STK-018', 'REQ-STK-019'])
    for (const q of W3_REQUIREMENTS) expect(q.parents, q.id).toEqual([DELIBERATE_REQ_GAP.need, 'CAP-015'])
    expect(CAPABILITIES.find((c) => c.id === 'CAP-015')!.needs).toContain(DELIBERATE_REQ_GAP.need)
    expect(W3_UNKNOWNS.find((u) => u.tbx === W3_REQUIREMENTS[0].tbx)!.owner).toBeTruthy()
    expect(W3_REQUIREMENTS[0].statement).toContain(W3_REQUIREMENTS[0].tbx)
    expect(ISSUES[0].status).toBe('closed')
    for (const q of W3_REQUIREMENTS) expect(ISSUES[0].action, q.id).toContain(q.id)
    expect(RISKS.some((r) => r.id.startsWith('I-'))).toBe(false)
  })
  it('every Week 2 unknown has a Week 3 disposition; each one Week 2 promised to the Week 3 trade is re-dated or closed, never left with a Week 3 close-by', () => {
    for (const u of UNKNOWNS) {
      const d = W2_DISPOSITIONS[u.id]
      expect(d, u.id).toBeDefined()
      const promised = /Week 3/.test(u.closeBy)
      expect(d.promisedWeek3, u.id).toBe(promised)
      if (promised) {
        expect(d.status, u.id).not.toBe('open')
        expect(d.closeBy, u.id).not.toMatch(/Week 3/)
        expect(d.disposition.split(/\s+/).length, u.id).toBeGreaterThan(15)
      }
    }
    // REQ-STK-011's rationale promised the event cap as a number before the trade; that promise has its disposition too
    expect(REQUIREMENTS.find((q) => q.id === 'REQ-STK-011')!.rationale).toMatch(/Week 3 trade/)
    expect(W2_DISPOSITIONS['REQ-STK-011'].status).not.toBe('open')
    expect(UNKNOWNS.filter((u) => /Week 3/.test(u.closeBy)).map((u) => u.id)).toEqual(['U-002', 'U-003', 'U-004', 'U-006'])
  })
})

describe('Week 3 case: the new requirements pass Week 2’s own requirement gates', () => {
  // The Week 2 standard record (needs, capabilities, register, requirements) plus the Week 3 unknown and requirements,
  // assessed with the Week 2 lab tool's gates (src/workbench/week2/record.ts), exactly as a team's record would be.
  const record = (reqs: typeof W3_REQUIREMENTS): Week2Record =>
    normalizeRecord({
      ...EMPTY_RECORD,
      week1: { team: '00', enterprise: 'standard', needs: NEEDS.map((n) => ({ id: n.id, name: n.name, statement: n.statement })), goals: [], stakeholders: [] },
      conops: { soiName: SCENARIO_SOI.name, soi: SCENARIO_SOI.name },
      capabilities: CAPABILITIES.map((c) => ({ id: c.id, name: c.name, statement: c.text, needs: c.needs })),
      uncertainties: [...UNCERTAINTIES, ...W3_UNKNOWNS].map((u) => ({ id: u.id, name: u.name, tbx: u.tbx ?? '', owner: u.owner, closeBy: u.closeBy, validation: u.closeBy })),
      requirements: [...REQUIREMENTS, ...reqs].map((q) => ({ id: q.id, name: q.name, statement: q.statement, type: q.type, method: q.method, criterion: q.criterion, rationale: q.rationale, parents: q.parents.join(', '), owner: 'JS' })),
    })
  const failures = (reqs: typeof W3_REQUIREMENTS) => {
    const r = record(reqs)
    return Object.fromEntries(reqs.map((q) => [q.id, assessRequirement(r.requirements.find((x) => x.id === q.id)!, r).gates.filter((g) => !g.ok).map((g) => g.id)]))
  }
  it('every Week 3 requirement passes every Week 2 hard gate (one “shall”, subject, parents, method, criterion, TBD owned …)', () => {
    expect(failures(W3_REQUIREMENTS)).toEqual(Object.fromEntries(W3_REQUIREMENTS.map((q) => [q.id, []])))
  })
  it('negative direction: the pre-review compound REQ-STK-018 (two “shall”s) fails the one-shall gate, and an untracked TBD fails the ownership gate', () => {
    const compound = { ...W3_REQUIREMENTS[0], statement: 'The AeroLink service shall notify each passenger whose confirmed trip is held, diverted or cancelled within TBD-05 min of the disruption decision, and shall offer that passenger a way onward to the destination.' }
    expect(failures([compound])['REQ-STK-018']).toContain('one-shall')
    const untracked = { ...W3_REQUIREMENTS[0], statement: W3_REQUIREMENTS[0].statement.replace('TBD-05', 'TBD-09'), tbx: 'TBD-09' }
    expect(failures([untracked])['REQ-STK-018'].length).toBeGreaterThan(0)
  })
})

describe('Week 3 case: TPMs (margin = threshold − worst case; R44 p.117)', () => {
  it('reference values are kept, and the reference margin is threshold minus the current estimate (zero contingency)', () => {
    for (const t of TPMS) {
      const a = refEl(t.id)!.attributes!
      expect([a.threshold, a.objective, a.currentEstimate, a.margin], t.id).toEqual([t.threshold, t.objective, t.cbe, referenceMarginOf(t)])
    }
  })
  it('worst case and margin recomputed by hand: 18 + 1 = 19 → 1.0 min; 63.5 + 1 = 64.5 → 0.5 dBA; 23 − 1.5 = 21.5 → 1.5 points', () => {
    expect(TPMS.map((t) => [wceOf(t), marginOf(t)])).toEqual([[19, 1], [64.5, 0.5], [21.5, 1.5]])
  })
  it('every profile point stays inside the threshold, and contingency never grows as the design matures', () => {
    for (const t of TPMS) {
      const p = plannedProfile(t)
      for (const x of p) expect(x.margin, `${t.id} ${x.label}`).toBeGreaterThan(0)
      for (let i = 1; i < p.length; i++) expect(p[i].contingency, t.id).toBeLessThanOrEqual(p[i - 1].contingency)
    }
  })
  it('the fade model: T = 0.9 × 0.77 = 0.693; 12 % fade gives 21.25 % (rounded once; margin 0.25, below the 1-point trigger); 15 % fade breaks the 20 % threshold', () => {
    expect(MONTH6.cbe).toBe(21.25)
    expect(MONTH6.wce).toBe(20.25)
    expect(MONTH6.margin).toBe(0.25)
    expect(MONTH6.margin).toBeLessThan(MONTH6.trigger)
    expect(FADE15).toBeLessThan(20)
    expect(FADE15).toBeCloseTo(18.47, 2)
  })
})

describe('Week 3 case: the trade study, recomputed', () => {
  it('capacities min(aircraft × 20, chargers × 48): 240, 288, 240, 320, 320, 360; ALT-004, ALT-005 and ALT-006 meet 300', () => {
    expect(ALTERNATIVES.map(capacityOfAlt)).toEqual([240, 288, 240, 320, 320, 360])
    expect(ALTERNATIVES.filter((a) => capacityOfAlt(a) >= 300).map((a) => a.id)).toEqual(['ALT-004', 'ALT-005', 'ALT-006'])
  })
  it('the screens: capacity and the walk-away points eliminate the baseline, aircraft only and vertiport only before any weight; the security screens pass everything else', () => {
    const fails = (id: string) => SCREENS.filter((s) => !s.results[id].pass).map((s) => s.id)
    expect(fails('ALT-001')).toEqual(['SCREEN-3', 'SCREEN-4'])
    expect(fails('ALT-002')).toEqual(['SCREEN-3'])
    expect(fails('ALT-003')).toEqual(['SCREEN-3', 'SCREEN-4'])
    expect(walkAwayFailures(SCORES['ALT-001'])).toEqual(['CRIT-001'])
    expect(SCORES['ALT-001'][0].toFixed(1)).toBe('66.7')
    expect(FEASIBLE).toEqual(['ALT-004', 'ALT-005', 'ALT-006'])
    expect(SCREENED_OUT).toEqual(['ALT-001', 'ALT-002', 'ALT-003'])
    for (const s of SCREENS) for (const a of ALTERNATIVES) expect(s.results[a.id], `${s.id} ${a.id}`).toBeDefined()
  })
  it('every path through the morphological box is a listed alternative or fails a screen: 6 listed, 3 screened from the box (240/day, 288/day, USD 24 M past the 20 M walk-away)', () => {
    expect(MORPH_PATHS).toHaveLength(9)
    expect(MORPH_PATHS.filter((p) => p.alt).map((p) => p.alt).sort()).toEqual(ALTERNATIVES.map((a) => a.id).sort())
    const unlisted = MORPH_PATHS.filter((p) => !p.alt)
    expect(unlisted.map((p) => [p.capacity, p.cost, p.fails])).toEqual([[240, 0.8, ['capacity', 'CRIT-001']], [288, 12, ['capacity']], [360, 24, ['CRIT-002']]])
    // each listed path is feasible exactly when its alternative passes the frame screens
    for (const p of MORPH_PATHS.filter((x) => x.alt)) expect(p.fails.length === 0, p.alt!).toBe(FEASIBLE.includes(p.alt!))
  })
  it('scores of the reference alternatives match the reference score matrix (to one decimal)', () => {
    for (const id of REFERENCE_ALTERNATIVES) {
      const e = refEl(id)!.attributes!
      CRITERIA.forEach((c, i) => expect(near(SCORES[id][i], Number(e[c.id]), 0.05), `${id} ${c.id}`).toBe(true))
    }
  })
  it('the added alternatives by hand: ALT-005 cost 4 × 3.0 + 6.0 = 18, ALT-006 cost 6 × 3.0 + 2 × 0.4 = 18.8; retained 288/320 = 90 % and 288/360 = 80 %', () => {
    expect(SCORES['ALT-005'].map((x) => +x.toFixed(3))).toEqual([8, 18, 90, 6.857])
    expect(SCORES['ALT-006'].map((x) => +x.toFixed(3))).toEqual([6, 18.8, 80, 8])
    const hand5 = 0.4 * (52 / 55) + 0.3 * (2 / 20) + 0.16 * (40 / 50) + 0.14 * ((10 - (240 * 2) / 16 / 7 * 1.6) / 5)
    expect(near(TOTALS['ALT-005'], hand5, 1e-9)).toBe(true)
    const hand6 = 0.4 * (54 / 55) + 0.3 * (1.2 / 20) + 0.16 * (30 / 50) + 0.14 * (2 / 5)
    expect(near(TOTALS['ALT-006'], hand6, 1e-9)).toBe(true)
  })
  it('weights are swing points normalized: 100/250, 75/250, 40/250, 35/250', () => {
    expect(WEIGHTS.map((w) => Math.round(w * 100) / 100)).toEqual([0.4, 0.3, 0.16, 0.14])
    for (const c of CRITERIA) expect(refEl(c.id)!.attributes!.weight, c.id).toBe(Math.round((c.swingPoints / 250) * 100) / 100)
  })
  it('ALT-004 by hand: 0.40 × 52/55 + 0.30 × 7.2/20 + 0.16 × 40/50 + 0.14 × 2/5 = 0.670', () => {
    const hand = 0.4 * (52 / 55) + 0.3 * (7.2 / 20) + 0.16 * (40 / 50) + 0.14 * (2 / 5)
    expect(near(TOTALS['ALT-004'], hand, 1e-9)).toBe(true)
    expect(VALUES['ALT-001'][0]).toBe(0)
  })
  it('totals: the reference four keep their reference values (0.670, 0.488, 0.458, 0.452); among the feasible, 0.670 > 0.624 > 0.563', () => {
    expect([TOTALS['ALT-004'], TOTALS['ALT-002'], TOTALS['ALT-003'], TOTALS['ALT-001']].map((x) => x.toFixed(3))).toEqual(['0.670', '0.488', '0.458', '0.452'])
    expect(RANKING).toEqual(['ALT-004', 'ALT-005', 'ALT-006'])
    expect(RANKING.map((id) => TOTALS[id].toFixed(3))).toEqual(['0.670', '0.624', '0.563'])
  })
  it('reversal points among the feasible alternatives: cost down 0.150 → ALT-005; noise up 0.284 → ALT-005; wait up 0.848 → ALT-006; resilience none; each a real crossing', () => {
    const s = (id: string) => SENSITIVITY.find((x) => x.criterion === id)!
    expect([s('CRIT-002').down!.w.toFixed(3), s('CRIT-002').down!.to, s('CRIT-002').up]).toEqual(['0.150', 'ALT-005', null])
    expect([s('CRIT-004').up!.w.toFixed(3), s('CRIT-004').up!.to, s('CRIT-004').down]).toEqual(['0.284', 'ALT-005', null])
    expect([s('CRIT-001').up!.w.toFixed(3), s('CRIT-001').up!.to, s('CRIT-001').down]).toEqual(['0.848', 'ALT-006', null])
    expect([s('CRIT-003').up, s('CRIT-003').down]).toEqual([null, null])
    // a crossing: just either side of each point the leader differs
    const top = (k: number, w: number) => {
      const ws = reweight(WEIGHTS, k, w)
      const t = FEASIBLE.map((a) => VALUES[a].reduce((acc, x, i) => acc + x * ws[i], 0))
      return FEASIBLE[t.indexOf(Math.max(...t))]
    }
    expect([top(1, 0.151), top(1, 0.149)]).toEqual(['ALT-004', 'ALT-005'])
    expect([top(3, 0.283), top(3, 0.285)]).toEqual(['ALT-004', 'ALT-005'])
    expect([top(0, 0.847), top(0, 0.849)]).toEqual(['ALT-004', 'ALT-006'])
    expect(top(2, 0.999)).toBe('ALT-004')
  })
  it('every reversal target passes every screen (a reversal to a screened-out alternative is no reversal)', () => {
    const targets = SENSITIVITY.flatMap((x) => [x.up?.to, x.down?.to]).filter((x): x is string => !!x)
    expect(targets.length).toBeGreaterThan(0)
    for (const t of targets) expect(passesScreens(t), t).toBe(true)
  })
  it('the reference record’s reversal point (0.478 → the baseline) is the UNSCREENED analysis, and it points at a screened-out alternative: the check above can fail', () => {
    const u = UNSCREENED_SENSITIVITY.find((x) => x.criterion === 'CRIT-002')!.up!
    expect(u.w.toFixed(3)).toBe('0.478')
    expect(Number(refEl('DEC-001')!.attributes!.reversalPoint)).toBe(0.478)
    expect(u.to).toBe('ALT-001')
    expect(passesScreens(u.to)).toBe(false)
    const unscreenedTargets = UNSCREENED_SENSITIVITY.flatMap((x) => [x.up?.to, x.down?.to]).filter((x) => !!x) as string[]
    expect(unscreenedTargets.every((t) => passesScreens(t))).toBe(false)
  })
  it('min–max normalization among the feasible: dropping ALT-004 reverses ALT-005 and ALT-006; fixed anchors keep ALT-005 first in both sets', () => {
    expect(MINMAX_DEMO.pair).toEqual(['ALT-005', 'ALT-006'])
    expect(MINMAX_DEMO.all['ALT-006']).toBeGreaterThan(MINMAX_DEMO.all['ALT-005'])
    expect(MINMAX_DEMO.without['ALT-005']).toBeGreaterThan(MINMAX_DEMO.without['ALT-006'])
    expect(TOTALS['ALT-005']).toBeGreaterThan(TOTALS['ALT-006'])
    expect([MINMAX_DEMO.all['ALT-006'], MINMAX_DEMO.all['ALT-005'], MINMAX_DEMO.without['ALT-005'], MINMAX_DEMO.without['ALT-006']].map((x) => x.toFixed(3))).toEqual(['0.400', '0.340', '0.600', '0.400'])
  })
  it('the decision record: the recommendation ranks first among the feasible and passes every screen; its conditions are the real reversal points and name no screened-out alternative', () => {
    expect(DECISION.recommended).toBe(RANKING[0])
    expect(passesScreens(DECISION.recommended)).toBe(true)
    expect(DECISION.conditions.length).toBeGreaterThanOrEqual(3)
    expect(DECISION.wouldChangeIf.length).toBeGreaterThanOrEqual(3)
    expect(DECISION.conditions[0]).toMatch(/0\.15\b.*0\.28\b/)
    expect(DECISION.wouldChangeIf.join(' ')).toMatch(/0\.150.*0\.284.*0\.848/)
    const text = [...DECISION.conditions, ...DECISION.wouldChangeIf].join(' ')
    for (const id of SCREENED_OUT) expect(text, id).not.toContain(id)
    expect(text).not.toMatch(/0\.478|0\.48\b/)
  })
  it('negative direction: a weight change past the reversal point changes the leader; a bad matrix is caught', () => {
    const r = reversalPoints([0.6, 0.4], [[1, 0], [0, 1]], 0)
    expect(r.base).toBe(0)
    expect(r.down?.w).toBeCloseTo(0.5, 9)
    expect(r.down?.to).toBe(1)
    expect(() => cellLevel(0, 3)).toThrow()
  })
  it('a tie at the end of the weight range (w = 1) is not a reversal: two alternatives equal on the varied criterion only meet there', () => {
    // equal values on criterion 0, different elsewhere: the lines meet only at w = 1
    const r = reversalPoints([0.5, 0.5], [[0.8, 0.6], [0.8, 0.2]], 0)
    expect(r.up).toBeNull()
    expect(r.down).toBeNull()
  })
})

describe('Week 3 case: the event-cap correction reaches the reference baseline', () => {
  it('MGO-006, MOE-003 and TPM-002 carry the event-cap text as an eventCap attribute, equal to the case text', () => {
    for (const id of ['MGO-006', 'MOE-003', 'TPM-002'] as const) {
      expect(refEl(id)?.attributes?.eventCap, id).toBe(EVENT_CAP[id])
      expect(EVENT_CAP[id], id).toMatch(/evening and early-morning[^.]*event cap/)
    }
  })
})
