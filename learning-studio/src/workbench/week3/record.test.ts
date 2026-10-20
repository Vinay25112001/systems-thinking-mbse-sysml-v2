// Week 3 Team Record logic, tested in BOTH directions: the realistic fixture (the fictional food bank network continuing
// its Week 2 record) passes every check, and each hard gate is shown failing ALONE on an otherwise good entry (so no gate
// passes for the wrong reason). Good entries that raise an advisory still count, including the known false positives
// (a past fact in a risk's condition; a consequence with no number that names the asset). The arithmetic (worst case,
// margin, values, weights, totals, reversal points) is checked against the AeroLink worked example computed by the same
// labBrief functions, and the import/export paths refuse wrong files with a message.
import { describe, expect, it } from 'vitest'
import { LAB3_MINIMUMS, LAB3_MINIMUMS_THREE, RISK_GATES, TECH_GATES, TPM_GATES, TRADE_GATES } from '../../content/lectures/week03/labBrief'
import { ALTERNATIVES, CRITERIA, SCORES, SCREENS, SENSITIVITY, TOTALS, TPMS, marginOf, wceOf } from '../../content/lectures/week03/aerolinkCase'
import { WEEK1_JSON } from '../week2/fixture'
import { WEEK2_JSON, week3Fixture } from './fixture'
import {
  EMPTY_RECORD, allChecks, assessRisk, assessTechnology, assessTpm, assessTrade, checkImport, checkReadinessPart, checkRegisterPart, checkTpmPart, checkTradePart, computeTrade, fileStem, importWeek2File, importWeek3,
  modelInputs, nextId, normalizeRecord, parseNum, recordMarkdown, recordState, riskStatement, tpmNumbers, tpmProfile, withIssued, withWeek2,
  type Risk, type Technology, type Tpm, type Week3Record,
} from './record'

const F = week3Fixture
const tech = (r: Week3Record, id: string) => r.technologies.find((t) => t.id === id)!
const rsk = (r: Week3Record, id: string) => r.risks.find((t) => t.id === id)!
const tp = (r: Week3Record, id: string) => r.tpms.find((t) => t.id === id)!
const withTech = (id: string, patch: Partial<Technology>, base = F()): Week3Record => ({ ...base, technologies: base.technologies.map((t) => (t.id === id ? { ...t, ...patch } : t)) })
const withRisk = (id: string, patch: Partial<Risk>, base = F()): Week3Record => ({ ...base, risks: base.risks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })
const withTpm = (id: string, patch: Partial<Tpm>, base = F()): Week3Record => ({ ...base, tpms: base.tpms.map((t) => (t.id === id ? { ...t, ...patch } : t)) })
const withTrade = (patch: Partial<Week3Record['trade']>, base = F()): Week3Record => ({ ...base, trade: { ...base.trade, ...patch } })
const techFailed = (r: Week3Record, id: string) => assessTechnology(tech(r, id), r).gates.filter((g) => !g.ok).map((g) => g.id)
const riskFailed = (r: Week3Record, id: string) => assessRisk(rsk(r, id), r).gates.filter((g) => !g.ok).map((g) => g.id)
const riskAdv = (r: Week3Record, id: string) => assessRisk(rsk(r, id), r).advisories.map((a) => a.id)
const tpmFailed = (r: Week3Record, id: string) => assessTpm(tp(r, id), r).gates.filter((g) => !g.ok).map((g) => g.id)
const tpmAdv = (r: Week3Record, id: string) => assessTpm(tp(r, id), r).advisories.map((a) => a.id)
const tradeFailed = (r: Week3Record) => assessTrade(r).gates.filter((g) => !g.ok).map((g) => g.id)
const tradeAdv = (r: Week3Record) => assessTrade(r).advisories.map((a) => a.id)

describe('the fixture (a fictional food bank network) passes every check', () => {
  it('every part is complete and the record is ready', () => {
    const r = F()
    for (const [k, c] of Object.entries(allChecks(r))) expect(c.issues, k).toEqual([])
    expect(recordState(r)).toBe('ready')
  })
  it('it is never AeroLink, and it extends the Week 2 record', () => {
    const r = F()
    expect(r.week2?.enterprise).toBe('Riverside Food Bank Network')
    expect(JSON.stringify(r)).not.toMatch(/aero\s*-?\s*link/i)
    expect(r.week2?.requirements.map((q) => q.id)).toContain('REQ-SYS-003')
    expect(r.week2?.objectives.map((o) => o.id)).toEqual(['MGO-001', 'MGO-002', 'MGO-003', 'MGO-004', 'MGO-005'])
  })
  it('the Week 2 unknown and assumption are carried into the register with their token and owner', () => {
    const r = F()
    expect(r.unknowns.find((u) => u.id === 'U-001')).toMatchObject({ tbx: 'TBD-01', fromWeek2: true })
    expect(r.assumptions.find((a) => a.id === 'A-001')?.fromWeek2).toBe(true)
  })
  it('meets the team-of-four minimums, with a security and a resilience risk', () => {
    const r = F()
    expect(r.technologies.filter((t) => assessTechnology(t, r).counts).length).toBeGreaterThanOrEqual(LAB3_MINIMUMS.technologies)
    const counting = r.risks.filter((k) => assessRisk(k, r).counts)
    expect(counting.length).toBeGreaterThanOrEqual(LAB3_MINIMUMS.risks)
    expect(counting.some((k) => k.category === 'security')).toBe(true)
    expect(counting.some((k) => k.category === 'resilience')).toBe(true)
    expect(r.tpms.filter((t) => assessTpm(t, r).counts).length).toBeGreaterThanOrEqual(LAB3_MINIMUMS.tpms)
  })
})

describe('technology gates: each fails alone, and good entries count', () => {
  const cases: [string, Partial<Technology>, string][] = [
    ['name', { does: '' }, 'name'],
    ['trl', { trl: 0 }, 'trl'],
    ['basis (none)', { basisKind: '' }, 'basis'],
    ['basis (evidence empty)', { basisKind: 'evidence', evidence: 'n/a' }, 'basis'],
    ['basis (assumption not in register)', { basisKind: 'assumption', assumption: 'A-099' }, 'basis'],
    ['affects (none)', { affects: '' }, 'affects'],
    ['affects (not in record)', { affects: 'REQ-SYS-099' }, 'affects'],
    ['affects (typo)', { affects: 'REQ-SYS-001, req 4' }, 'affects'],
  ]
  for (const [label, patch, gate] of cases)
    it(`${label} → fails ${gate} only`, () => {
      expect(techFailed(withTech('TECH-001', patch), 'TECH-001')).toEqual([gate])
    })
  it('maturity risk: critical below TRL 6 without a risk fails; not critical, or at TRL 6, needs none', () => {
    expect(techFailed(withTech('TECH-003', { maturityRisk: '' }), 'TECH-003')).toEqual(['maturity-risk'])
    expect(techFailed(withTech('TECH-003', { maturityRisk: '', critical: false }), 'TECH-003')).toEqual([])
    expect(techFailed(withTech('TECH-003', { maturityRisk: '', trl: 6 }), 'TECH-003')).toEqual([])
  })
  it('the gate list is labBrief’s', () => {
    expect(assessTechnology(tech(F(), 'TECH-001'), F()).gates.map((g) => g.id)).toEqual(TECH_GATES.map((g) => g.id))
  })
  it('an assumption that is in the register but has no validation action fails basis', () => {
    const base = F()
    const r = { ...base, assumptions: base.assumptions.map((a) => (a.id === 'A-003' ? { ...a, validation: '' } : a)) }
    expect(techFailed(r, 'TECH-003')).toEqual(['basis'])
  })
  it('advisories never block: TRL 7 on an assumption and a missing limitation still count', () => {
    const r = withTech('TECH-002', { limitations: '' })
    expect(assessTechnology(tech(r, 'TECH-002'), r).advisories.map((a) => a.id)).toEqual(['assumed-high', 'no-limitations'])
    expect(assessTechnology(tech(r, 'TECH-002'), r).counts).toBe(true)
  })
})

describe('risk gates: each fails alone, and good entries count', () => {
  const cases: [string, Partial<Risk>, string][] = [
    ['form (no condition)', { condition: '' }, 'form'],
    ['form (no then)', { then: 'none' }, 'form'],
    ['not-issue (past time)', { ifEvent: 'the alarm limit was changed yesterday by a stranger' }, 'not-issue'],
    ['not-issue (completed event)', { ifEvent: 'someone has already silenced the alarms on the account' }, 'not-issue'],
    ['no-mitigation (we will)', { then: 'a freezer failure goes unnoticed, so we will add two-factor sign-in' }, 'no-mitigation'],
    ['no-mitigation (absence of treatment)', { ifEvent: 'we do not use two-factor sign-in for the account' }, 'no-mitigation'],
    ['ratings (no likelihood)', { likelihood: 0 }, 'ratings'],
    ['ratings (no reason)', { consequenceWhy: '' }, 'ratings'],
    ['handling (no option)', { handling: '' }, 'handling'],
    ['handling (no owner)', { owner: '' }, 'handling'],
    ['handling (no treatment when mitigating)', { treatment: '' }, 'handling'],
    ['affects (none)', { affects: '' }, 'affects'],
    ['affects (not in record)', { affects: 'CAP-099' }, 'affects'],
  ]
  for (const [label, patch, gate] of cases)
    it(`${label} → fails ${gate} only`, () => {
      expect(riskFailed(withRisk('R-002', patch), 'R-002')).toEqual([gate])
    })
  it('the gate list is labBrief’s', () => {
    expect(assessRisk(rsk(F(), 'R-002'), F()).gates.map((g) => g.id)).toEqual(RISK_GATES.map((g) => g.id))
  })
  it('known false positive accepted: a past fact in the CONDITION is what is known today, not an issue', () => {
    const r = F()
    expect(rsk(r, 'R-004').condition).toMatch(/last July/)
    expect(riskFailed(r, 'R-004')).toEqual([])
  })
  it('known false positive accepted: a consequence with no number that names the asset is not vague', () => {
    const r = withRisk('R-002', { then: 'stored meat spoils before Monday' })
    expect(riskFailed(r, 'R-002')).toEqual([])
    expect(riskAdv(r, 'R-002')).not.toContain('vague-consequence')
  })
  it('advisories never block: a vague event, a vague consequence, no category, transfer', () => {
    const r = withRisk('R-002', { ifEvent: 'something goes wrong with the account', then: 'the project suffers', category: '', handling: 'transfer' })
    expect(riskAdv(r, 'R-002')).toEqual(['vague-event', 'vague-consequence', 'no-category', 'transfer'])
    expect(riskFailed(r, 'R-002')).toEqual([])
  })
  it('accept or watch needs no treatment; a High risk accepted raises an advisory but counts', () => {
    const r = withRisk('R-002', { handling: 'accept', treatment: '', likelihood: 5, consequence: 4 })
    expect(riskFailed(r, 'R-002')).toEqual([])
    expect(riskAdv(r, 'R-002')).toContain('accept-high')
  })
  it('the statement is assembled in the course form', () => {
    expect(riskStatement(rsk(F(), 'R-001'))).toMatch(/^Condition: .+\. If .+, then .+\.$/)
  })
  it('the register needs a security and a resilience risk among those that COUNT', () => {
    const noSec = withRisk('R-002', { category: 'technology' })
    expect(checkRegisterPart(noSec).issues.join(' ')).toMatch(/security risk/)
    const brokenSec = withRisk('R-002', { affects: '' })
    expect(checkRegisterPart(brokenSec).issues.join(' ')).toMatch(/security risk among those that count/)
    const noRes = withRisk('R-003', { category: 'external' })
    expect(checkRegisterPart(noRes).issues.join(' ')).toMatch(/resilience risk/)
  })
  it('a Week 2 unknown removed from the register is reported; an issue without an action is reported', () => {
    const base = F()
    expect(checkRegisterPart({ ...base, unknowns: [] }).issues.join(' ')).toMatch(/U-001 is missing/)
    expect(checkRegisterPart({ ...base, issues: base.issues.map((i) => ({ ...i, action: '' })) }).issues.join(' ')).toMatch(/I-001: add the action/)
    expect(checkRegisterPart({ ...base, opportunities: [] }).issues.join(' ')).toMatch(/opportunity/)
  })
})

describe('TPM gates and arithmetic (margin = threshold − worst case, R44 p.117)', () => {
  it('worst case and margin: higher-is-better 3.4 − 0.3 = 3.1 → 0.1 h; lower-is-better 100 + 6 = 106 → 4 min', () => {
    const r = F()
    expect(tpmNumbers(tp(r, 'TPM-001'))).toMatchObject({ wce: 3.1, margin: 0.1 })
    expect(tpmNumbers(tp(r, 'TPM-002'))).toMatchObject({ wce: 106, margin: 4 })
    expect(tpmProfile(tp(r, 'TPM-002')).map((p) => p.margin)).toEqual([6, 10])
  })
  it('the tool computes the AeroLink TPMs exactly as the worked example does', () => {
    for (const t of TPMS) {
      const n = tpmNumbers({ id: t.id, name: t.name, measures: t.measures, derivesFrom: t.derivesFrom, unit: t.unit, sense: t.sense, threshold: String(t.threshold), objective: String(t.objective), cbe: String(t.cbe), contingency: String(t.contingency), basis: t.basis, relatedRisk: t.relatedRisk, profile: [] })
      expect([n?.wce, n?.margin], t.id).toEqual([wceOf(t), marginOf(t)])
    }
  })
  const cases: [string, Partial<Tpm>, string][] = [
    ['parent (requirement not in record)', { measures: 'REQ-SYS-099' }, 'parent'],
    ['parent (MOP missing)', { derivesFrom: '' }, 'parent'],
    ['numbers (estimate not a number)', { cbe: 'about 100' }, 'numbers'],
    ['numbers (negative contingency)', { contingency: '-1' }, 'numbers'],
    ['numbers (no unit)', { unit: '' }, 'numbers'],
    ['objective-side', { objective: '115' }, 'objective-side'],
    ['basis', { basis: '' }, 'basis'],
    ['profile (one future point)', { profile: [{ label: 'Next', month: '1', cbe: '100', contingency: '4' }] }, 'profile'],
    ['profile (months not increasing)', { profile: [{ label: 'a', month: '2', cbe: '100', contingency: '4' }, { label: 'b', month: '1', cbe: '98', contingency: '2' }] }, 'profile'],
    ['profile (a row without numbers)', { profile: [{ label: 'a', month: '1', cbe: '100', contingency: '4' }, { label: 'b', month: '2', cbe: '', contingency: '2' }] }, 'profile'],
  ]
  for (const [label, patch, gate] of cases)
    it(`${label} → fails ${gate} only`, () => {
      expect(tpmFailed(withTpm('TPM-002', patch), 'TPM-002')).toEqual([gate])
    })
  it('the gate list is labBrief’s', () => {
    expect(assessTpm(tp(F(), 'TPM-002'), F()).gates.map((g) => g.id)).toEqual(TPM_GATES.map((g) => g.id))
  })
  it('a negative margin WITH a linked risk counts: the breach is visible as an advisory', () => {
    const r = withTpm('TPM-002', { cbe: '108' })
    expect(tpmNumbers(tp(r, 'TPM-002'))?.margin).toBe(-4)
    expect(r.risks.some((k) => k.id === tp(r, 'TPM-002').relatedRisk)).toBe(true)
    expect(tpmFailed(r, 'TPM-002')).toEqual([])
    expect(tpmAdv(r, 'TPM-002')).toContain('breach')
  })
  it('a negative margin with NO linked risk fails breach-risk only (the lab: a TPM breach is a risk); an issue link also satisfies it', () => {
    expect(tpmFailed(withTpm('TPM-002', { cbe: '108', relatedRisk: '' }), 'TPM-002')).toEqual(['breach-risk'])
    expect(tpmFailed(withTpm('TPM-002', { cbe: '108', relatedRisk: 'R-099' }), 'TPM-002')).toEqual(['breach-risk'])
    expect(tpmFailed(withTpm('TPM-002', { cbe: '108', relatedRisk: 'I-001' }), 'TPM-002')).toEqual([])
    // the same missing link without a breach is only the no-risk advisory
    expect(tpmFailed(withTpm('TPM-002', { relatedRisk: '' }), 'TPM-002')).toEqual([])
    expect(tpmAdv(withTpm('TPM-002', { relatedRisk: '' }), 'TPM-002')).toContain('no-risk')
  })
  it('zero contingency, growing contingency and no related risk are advisories that do not block', () => {
    const r = withTpm('TPM-002', { contingency: '0', relatedRisk: '', profile: [{ label: 'a', month: '1', cbe: '100', contingency: '1' }, { label: 'b', month: '2', cbe: '98', contingency: '3' }] })
    expect(tpmAdv(r, 'TPM-002')).toEqual(['zero-contingency', 'contingency-grows', 'no-risk'])
    expect(tpmFailed(r, 'TPM-002')).toEqual([])
  })
  it('parseNum reads numbers and refuses words', () => {
    expect([parseNum('63.5'), parseNum('-2'), parseNum('1,000'), parseNum('.5')]).toEqual([63.5, -2, 1000, 0.5])
    expect([parseNum(''), parseNum('about 3'), parseNum('3 h')]).toEqual([null, null, null])
  })
})

describe('trade study: gates fail alone, the arithmetic is the lecture’s', () => {
  it('the gate list is labBrief’s and the fixture passes every gate', () => {
    expect(assessTrade(F()).gates.map((g) => g.id)).toEqual(TRADE_GATES.map((g) => g.id))
    expect(tradeFailed(F())).toEqual([])
  })
  it('the fixture by hand: ALT-004 = 0.40×(88−60)/40 + 0.28×(60−30)/60 + 0.18×4/4 + 0.14×(90−80)/20 = 0.670', () => {
    const c = computeTrade(F())
    expect(c.weights.map((w) => Math.round(w * 100) / 100)).toEqual([0.4, 0.28, 0.18, 0.14])
    expect(c.totals['ALT-004']).toBeCloseTo(0.4 * 0.7 + 0.28 * 0.5 + 0.18 * 1 + 0.14 * 0.5, 10)
    expect(c.ranking[0]).toBe('ALT-004')
  })
  it('the tool reproduces the AeroLink trade (scores in, totals out) and its reversal points', () => {
    const r: Week3Record = {
      ...F(),
      trade: {
        ...F().trade,
        alternatives: ALTERNATIVES.map((a) => ({ id: a.id, name: a.name, description: a.text, baseline: !!a.baseline })),
        criteria: CRITERIA.map((c) => ({ id: c.id, name: c.name, moe: 'MOE-001', unit: c.unit, walkAway: String(c.walkAway), stretch: String(c.stretch), swingPoints: String(c.swingPoints), rationale: c.swingRationale })),
        scores: Object.fromEntries(ALTERNATIVES.map((a) => [a.id, Object.fromEntries(CRITERIA.map((c, i) => [c.id, String(SCORES[a.id][i])]))])),
        screens: SCREENS.filter((s) => s.id === 'SCREEN-3').map((s) => ({ id: 'SCREEN-001', name: s.name, test: s.test, results: Object.fromEntries(ALTERNATIVES.map((a) => [a.id, s.results[a.id].pass ? ('pass' as const) : ('fail' as const)])) })),
      },
    }
    const c = computeTrade(r)
    // the capacity screen removes ALT-001..003; the remaining totals and the reversal points are the lecture’s
    expect(c.screenedOut).toEqual(['ALT-001', 'ALT-002', 'ALT-003'])
    for (const a of c.scored) expect(c.totals[a], a).toBeCloseTo(TOTALS[a], 10)
    expect(c.sensitivity.map((x) => [x.criterion, x.up && [x.up.w.toFixed(4), x.up.to], x.down && [x.down.w.toFixed(4), x.down.to]])).toEqual(
      SENSITIVITY.map((x) => [x.criterion, x.up && [x.up.w.toFixed(4), x.up.to], x.down && [x.down.w.toFixed(4), x.down.to]]),
    )
  })
  it('without any screen, the walk-away points still keep walked-away alternatives out of the sensitivity: ALT-001 and ALT-003 are flagged, and no reversal leads to them', () => {
    const r: Week3Record = {
      ...F(),
      trade: {
        ...F().trade,
        alternatives: ALTERNATIVES.map((a) => ({ id: a.id, name: a.name, description: a.text, baseline: !!a.baseline })),
        criteria: CRITERIA.map((c) => ({ id: c.id, name: c.name, moe: 'MOE-001', unit: c.unit, walkAway: String(c.walkAway), stretch: String(c.stretch), swingPoints: String(c.swingPoints), rationale: c.swingRationale })),
        scores: Object.fromEntries(ALTERNATIVES.map((a) => [a.id, Object.fromEntries(CRITERIA.map((c, i) => [c.id, String(SCORES[a.id][i])]))])),
        screens: [],
      },
    }
    const c = computeTrade(r)
    expect(c.beyondWalkAway).toEqual([{ id: 'ALT-001', criteria: ['CRIT-001'] }, { id: 'ALT-003', criteria: ['CRIT-001'] }])
    const targets = c.sensitivity.flatMap((x) => [x.up?.to, x.down?.to]).filter(Boolean)
    expect(targets).not.toContain('ALT-001')
    expect(targets).not.toContain('ALT-003')
    expect(tradeAdv(r)).toContain('walk-away')
  })
  const cases: [string, Partial<Week3Record['trade']>, string][] = [
    ['decision (empty)', { decision: '' }, 'decision'],
    ['decision (traces to nothing)', { trace: 'REQ-STK-099' }, 'decision'],
    ['recommendation (no conditions)', { conditions: '' }, 'recommendation'],
    ['recommendation (not an alternative)', { recommended: 'ALT-009' }, 'recommendation'],
    ['sensitivity (not interpreted)', { sensitivityNote: '' }, 'sensitivity'],
    ['sensitivity (no reversal point stated although the tool computed one)', { sensitivityNote: 'see table' }, 'sensitivity'],
  ]
  for (const [label, patch, gate] of cases)
    it(`${label} → fails ${gate} only`, () => {
      expect(tradeFailed(withTrade(patch))).toEqual([gate])
    })
  it('recommending an alternative beyond a walk-away point fails the recommendation gate only, and the walk-away advisory names it', () => {
    const t = F().trade
    // ALT-001 at 55 % produce availability is below the 60 % walk-away
    const bad = withTrade({ recommended: 'ALT-001', scores: { ...t.scores, 'ALT-001': { ...t.scores['ALT-001'], 'CRIT-001': '55' } } })
    expect(tradeFailed(bad)).toEqual(['recommendation'])
    expect(assessTrade(bad).gates.find((g) => g.id === 'recommendation')!.message).toMatch(/walk-away/)
    expect(tradeAdv(bad)).toContain('walk-away')
    // the same score on an alternative that is not recommended is an advisory only
    const flagged = withTrade({ scores: { ...t.scores, 'ALT-001': { ...t.scores['ALT-001'], 'CRIT-001': '55' } } })
    expect(tradeFailed(flagged)).toEqual([])
    expect(tradeAdv(flagged)).toContain('walk-away')
    expect(tradeAdv(F())).not.toContain('walk-away')
  })
  it('recommending an alternative that is not top-ranked raises not-top (give the reason); the fixture’s top-ranked recommendation does not', () => {
    expect(tradeAdv(withTrade({ recommended: 'ALT-002' }))).toContain('not-top')
    expect(tradeFailed(withTrade({ recommended: 'ALT-002' }))).toEqual([])
    expect(tradeAdv(F())).not.toContain('not-top')
  })
  it('a sensitivity note whose reversal number matches no computed point raises reversal-number; the fixture’s 0.47 (computed 0.467) does not', () => {
    expect(tradeAdv(F())).not.toContain('reversal-number')
    const wrong = withTrade({ sensitivityNote: 'Pantry refrigerators rank first until the cost weight rises above 0.90 (base 0.28), so the result is robust.' })
    expect(tradeAdv(wrong)).toContain('reversal-number')
    expect(tradeFailed(wrong)).toEqual([])
    const close = withTrade({ sensitivityNote: 'Pantry refrigerators rank first until the cost weight rises above 0.48 (base 0.28), so the result is robust.' })
    expect(tradeAdv(close)).not.toContain('reversal-number')
  })
  it('baseline, distinct, criteria-trace, anchors, weights and scores each fail alone', () => {
    const t = F().trade
    expect(tradeFailed(withTrade({ alternatives: t.alternatives.map((a) => ({ ...a, baseline: false })) }))).toEqual(['baseline'])
    expect(tradeFailed(withTrade({ scores: { ...t.scores, 'ALT-003': { ...t.scores['ALT-001'] } } }))).toEqual(['distinct'])
    expect(tradeFailed(withTrade({ criteria: t.criteria.map((c) => (c.id === 'CRIT-004' ? { ...c, moe: 'MOE-099' } : c)) }))).toEqual(['criteria-trace'])
    expect(tradeFailed(withTrade({ criteria: t.criteria.map((c) => (c.id === 'CRIT-004' ? { ...c, stretch: '80' } : c)) }))).toEqual(['anchors'])
    expect(tradeFailed(withTrade({ criteria: t.criteria.map((c) => (c.id === 'CRIT-004' ? { ...c, rationale: '' } : c)) }))).toEqual(['weights'])

    expect(tradeFailed(withTrade({ scores: { ...t.scores, 'ALT-002': { ...t.scores['ALT-002'], 'CRIT-003': '' } } }))).toEqual(['scores'])
  })
  it('a screened-out alternative is not scored and cannot be recommended', () => {
    const t = F().trade
    const r = withTrade({ screens: t.screens.map((s) => ({ ...s, results: { ...s.results, 'ALT-004': 'fail' } })) })
    const c = computeTrade(r)
    expect(c.screenedOut).toEqual(['ALT-004'])
    expect(c.ranking).not.toContain('ALT-004')
    expect(tradeFailed(r)).toEqual(['recommendation'])
    const ok = withTrade({ screens: r.trade.screens, recommended: 'ALT-002' })
    expect(tradeFailed(ok)).toEqual([])
  })
  it('advisories: no cost criterion, a dominant weight, double counting, no resilience or security, a fragile rank', () => {
    const t = F().trade
    const noCost = withTrade({ criteria: t.criteria.map((c) => (c.id === 'CRIT-002' ? { ...c, name: 'Effort', unit: 'hours' } : c)) })
    expect(tradeAdv(noCost)).toContain('no-cost')
    const dom = withTrade({ criteria: t.criteria.map((c) => (c.id === 'CRIT-001' ? { ...c, swingPoints: '500' } : c)) })
    expect(tradeAdv(dom)).toContain('dominant-weight')
    const dbl = withTrade({ criteria: t.criteria.map((c) => (c.id === 'CRIT-004' ? { ...c, moe: 'MOE-001' } : c)) })
    expect(tradeAdv(dbl)).toContain('double-count')
    const noRes = withTrade({ screens: [], criteria: t.criteria.map((c) => (c.id === 'CRIT-003' ? { ...c, name: 'Pantry hours', rationale: 'How many extra hours the pantries can open each week.' } : c)) })
    expect(tradeAdv(noRes)).toContain('resilience')
    expect(tradeFailed(noRes)).toEqual([])
    expect(tradeAdv(F())).toEqual([])
  })
  it('checkTradePart: fewer alternatives or criteria than the minimum is reported', () => {
    const t = F().trade
    expect(checkTradePart(withTrade({ alternatives: t.alternatives.slice(0, 2) })).issues.join(' ')).toMatch(/At least 3 genuinely different alternatives/)
    expect(checkTradePart(withTrade({ criteria: t.criteria.slice(0, 3) })).issues.join(' ')).toMatch(/At least 4 criteria/)
  })
})

describe('three-person team minimums', () => {
  it('a team of three needs 2 technologies, 4 risks, 1 TPM and 3 criteria', () => {
    const base = F()
    const r: Week3Record = { ...base, threePersonTeam: true, technologies: base.technologies.slice(0, 2), risks: base.risks.filter((k) => ['R-002', 'R-003', 'R-004', 'R-005'].includes(k.id)), tpms: base.tpms.slice(1) }
    // TECH-003 is gone, so R-001's TECH and TPM-001 links point at nothing; keep only the risks that do not need them
    expect(checkReadinessPart(r).issues).toEqual([])
    expect(checkRegisterPart(r).issues).toEqual([])
    expect(checkTpmPart(r).issues).toEqual([])
    expect(checkTradePart({ ...r, trade: { ...r.trade, criteria: r.trade.criteria.filter((c) => c.id !== 'CRIT-004') } }).issues).toEqual([])
    expect(LAB3_MINIMUMS_THREE).toMatchObject({ technologies: 2, risks: 4, tpms: 1, criteria: 3 })
    expect(checkRegisterPart({ ...r, threePersonTeam: false }).issues.join(' ')).toMatch(/At least 6 risks/)
  })
})

describe('import, IDs and export', () => {
  it('imports the team’s Week 2 JSON and refuses a Week 1 file, a Week 3 file, broken JSON and AeroLink', () => {
    expect('snapshot' in importWeek2File(WEEK2_JSON)).toBe(true)
    expect(importWeek2File(WEEK1_JSON)).toEqual({ error: expect.stringMatching(/Week 1 model-inputs file/) })
    expect(importWeek2File(JSON.stringify(modelInputs(F())))).toEqual({ error: expect.stringMatching(/Week 3 model-inputs file/) })
    expect(importWeek2File('{not json')).toEqual({ error: 'This file is not valid JSON.' })
    const aero = JSON.parse(WEEK2_JSON)
    aero.week1.enterprise = 'AeroLink Urban Mobility'
    expect(importWeek2File(JSON.stringify(aero))).toEqual({ error: expect.stringMatching(/AeroLink/) })
    const noReq = JSON.parse(WEEK2_JSON)
    noReq.requirements = []
    expect(importWeek2File(JSON.stringify(noReq))).toEqual({ error: expect.stringMatching(/no requirements/) })
  })
  it('re-importing Week 2 keeps the Week 3 work and does not duplicate the carried register', () => {
    const r = F()
    const again = importWeek2File(WEEK2_JSON)
    if ('error' in again) throw new Error(again.error)
    const r2 = withWeek2(r, again.snapshot)
    expect(r2.risks).toHaveLength(r.risks.length)
    expect(r2.unknowns.filter((u) => u.id === 'U-001')).toHaveLength(1)
  })
  it('the import check: nothing imported, or no MOEs, is reported', () => {
    expect(checkImport(EMPTY_RECORD).ok).toBe(false)
    const r = F()
    expect(checkImport({ ...r, week2: { ...r.week2!, moes: [] } }).issues.join(' ')).toMatch(/no MOEs/)
  })
  it('IDs are never reused after deletion, and a new assumption does not collide with a carried Week 2 one', () => {
    const r = F()
    expect(nextId(r, 'A')).toBe('A-004')
    const id = nextId(r, 'R')
    const later = { ...r, risks: r.risks.filter((k) => k.id !== 'R-006'), issued: withIssued(r, 'R', id) }
    expect(nextId(later, 'R')).toBe('R-008')
  })
  it('JSON export is versioned, carries computed values and round-trips through the teammate import', () => {
    const j = modelInputs(F())
    expect(j.format).toBe('week3-model-inputs')
    expect(j.version).toBe(1)
    expect(j.status).toBe('ready')
    expect(j.tpms[0]).toMatchObject({ worstCase: 3.1, margin: 0.1 })
    expect(j.risks.find((k) => k.id === 'R-002')).toMatchObject({ level: 'Moderate', counts: true, gatesFailed: [] })
    expect(j.trade.computed.ranking[0]).toBe('ALT-004')
    const back = importWeek3(JSON.stringify(j))
    if ('error' in back) throw new Error(back.error)
    expect(recordState(back)).toBe('ready')
    expect(back.risks.map((k) => k.id)).toEqual(F().risks.map((k) => k.id))
  })
  it('teammate import refuses wrong files with a message', () => {
    expect(importWeek3(WEEK2_JSON)).toEqual({ error: expect.stringMatching(/Week 2 model-inputs file/) })
    expect(importWeek3(WEEK1_JSON)).toEqual({ error: expect.stringMatching(/Week 1 model-inputs file/) })
    expect(importWeek3('{"format":"other"}')).toEqual({ error: expect.stringMatching(/not a Week 3 model-inputs file/) })
    const j = modelInputs(F())
    expect(importWeek3(JSON.stringify({ ...j, version: 2 }))).toEqual({ error: expect.stringMatching(/version 2/) })
    expect(importWeek3(JSON.stringify({ ...j, risks: 'none' }))).toEqual({ error: expect.stringMatching(/“risks” must be a list/) })
    expect(importWeek3(JSON.stringify({ ...j, week2: { ...j.week2, enterprise: 'AeroLink' } }))).toEqual({ error: expect.stringMatching(/AeroLink/) })
    expect(importWeek3(JSON.stringify({ ...j, risks: [...j.risks, j.risks[0]] }))).toEqual({ error: expect.stringMatching(/Duplicate ID R-001/) })
    expect(importWeek3(JSON.stringify({ ...j, tpms: [{ ...j.tpms[0], id: 'TPM-1' }] }))).toEqual({ error: expect.stringMatching(/Unexpected TPM IDs/) })
  })
  it('normalize never throws and fills an empty record', () => {
    for (const v of [null, 42, 'x', [], { trade: 'no' }, { risks: [1, null] }]) expect(() => normalizeRecord(v)).not.toThrow()
    expect(normalizeRecord(null).trade.alternatives).toEqual([])
  })
  it('Markdown has every part, the computed values and the file stem', () => {
    const md = recordMarkdown(F(), '2026-10-26')
    for (const h of ['## 11. Measures: technical performance measures', '## 12. Technology readiness assessment', '## 13. Risk and uncertainty register', '### Issue log', '## 14. Trade study and decision record']) expect(md).toContain(h)
    expect(md).toContain('| TPM-001 |')
    expect(md).toMatch(/Ranking: ALT-004 0\.670/)
    expect(md).toContain('Condition: the alarm gateway is managed')
    expect(fileStem(F())).toBe('team-07-week3')
  })
})
