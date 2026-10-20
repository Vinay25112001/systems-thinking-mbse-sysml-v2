// Cross-week sweep (2026-10-19) of the recurring defect "the lab tool rejects valid short answers" (Week 2 M1, Week 4 M2
// and N3, Week 5 M2). One table-driven helper: for every team lab tool, a short but valid answer to a free-text field is
// ACCEPTED ("Fail safe", "Approved", "2 min", "Feed families", "Hub", proper nouns, IDs), and a real defect in the same
// field (empty, an empty answer such as "n/a", an unknown ID, a restatement) is still REJECTED. Every gate changed by the
// sweep is listed, with its before and after, in docs/lectures/GATE_SWEEP_2026-10-19.md.
//
// Each case sets ONE field on a passing fixture entry and asks the real record API whether the entry still counts, so a
// case can only pass when the field it names decides the outcome (the fixture passes as given: asserted per week).
import { describe, expect, it } from 'vitest'
import { TEAM_FIXTURE } from './week1/teamFixture'
import { checkCharterPart, checkProposal, concernIssue, relRowIssues, stakeholderRowIssues } from './week1/team'
import { assessNeed, notCountingReasons } from './week1/needQuality'
import { registerRowIssues } from './week1/stakeholders'
import { week2Fixture } from './week2/fixture'
import { assessRequirement, assessScenario, capabilityIssues, checkAuditPart, checkConopsPart, discoveryIssues, measureIssues, uncertaintyIssues, type Week2Record } from './week2/record'
import { week3Fixture } from './week3/fixture'
import { assessRisk, assessTechnology, assessTpm, assessTrade, assumptionIssues, issueIssues, opportunityIssues, unknownIssues, type Week3Record } from './week3/record'
import { week4Fixture } from './week4/fixture'
import { allChecks as w4Checks, assessAi, assessAllocation, assessDecision, assessFunction, assessInfo, assessViewpoint, lines, type Week4Record } from './week4/record'
import { countOf } from './week8/skeleton'
import { week5Fixture } from './week5/fixture'
import { allChecks as w5Checks, assessCard as w5Card, assessChange as w5Change, assessComponent as w5Component, assessInterface as w5Interface, assessRequirement as w5Requirement, type Week5Record } from './week5/record'

/** One field, one value, and whether the tool accepts the entry with that value. */
export type ShortCase = { field: string; value: string; accepted: (value: string) => boolean }
/** Asserts every `accept` case is accepted and every `reject` case is rejected, naming the field and value on failure. */
export function sweep(accept: ShortCase[], reject: ShortCase[]) {
  for (const c of accept) it(`accepts ${c.field} = ${JSON.stringify(c.value)}`, () => expect(c.accepted(c.value), `${c.field}: ${JSON.stringify(c.value)}`).toBe(true))
  for (const c of reject) it(`rejects ${c.field} = ${JSON.stringify(c.value)}`, () => expect(c.accepted(c.value), `${c.field}: ${JSON.stringify(c.value)}`).toBe(false))
}
/** Builds accept and reject cases for one field from value lists. */
const field = (name: string, accepted: (v: string) => boolean, good: string[], bad: string[]) => ({
  accept: good.map((value) => ({ field: name, value, accepted })),
  reject: bad.map((value) => ({ field: name, value, accepted })),
})
const run = (...fields: { accept: ShortCase[]; reject: ShortCase[] }[]) => sweep(fields.flatMap((f) => f.accept), fields.flatMap((f) => f.reject))

// ------------------------------------------------------------------------------------------------------------- week 1
describe('Week 1 team lab tool: short valid answers are accepted, real defects still fail', () => {
  const F = TEAM_FIXTURE
  const TODAY = '2026-10-18'
  const stk = F.stakeholders[0]
  const ids = new Set(F.stakeholders.map((s) => s.id))
  const rel = F.relationships[0]
  it('the fixture passes as given', () => {
    expect(checkCharterPart(F.charter).ok).toBe(true)
    expect(checkProposal(F.proposal, TODAY).ok).toBe(true)
    expect(stakeholderRowIssues(stk)).toEqual([])
  })
  const REG = { stakeholders: [{ id: 'STK-001', name: 'Families' }, { id: 'STK-002', name: 'Drivers' }], soiNames: ['Pantry'], systemNames: ['Pantry'] }
  const needOk = (text: string, conditions = '') => assessNeed({ name: 'n', text, conditions, rationale: 'Asked at intake', sources: [text.startsWith('F') ? 'STK-001' : 'STK-002'] }, REG).gates.every((g) => g.ok)
  run(
    field('charter decision rules', (v) => checkCharterPart({ ...F.charter, decisionRules: v }).ok, ['Majority vote', 'Consensus'], ['', 'n/a']),
    field('charter norms', (v) => checkCharterPart({ ...F.charter, norms: v }).ok, ['Discord daily', 'Slack'], ['', '-']),
    field('mission (one sentence)', (v) => checkProposal({ ...F.proposal, purpose: v }, TODAY).ok, ['Feed every family weekly.', 'Get donated food to families.'], ['', 'Feed families.', 'We feed families. We also store food.']),
    field('goal', (v) => checkProposal({ ...F.proposal, goals: [{ id: 'MGO-002', text: v }] }, TODAY).ok, ['Cut food waste', 'Zero spoilage'], ['']),
    field('stakeholder concern', (v) => concernIssue({ id: 'CON-001', text: v }, 'Residents') === '', ['Noise after 10 pm', 'Vans block Elm Street at 7 am'], ['', 'Noise', 'They care about safety.']),
    field('rating reason', (v) => stakeholderRowIssues({ ...stk, reason: v }).length === 0, ['Certifies vans', 'Regulator'], ['', 'n/a']),
    field('relationship note', (v) => relRowIssues({ ...rel, note: v }, ids).length === 0, ['Noise vs. schedule', 'Funds it'], ['', 'none']),
    field('in-class register concern', (v) => registerRowIssues({ stk: 'STK-012', concern: v, influence: '4', reason: 'Sets premiums' }).length === 0, ['Claims after 10 pm'], ['', 'They want safety.']),
    field('in-class register reason', (v) => registerRowIssues({ stk: 'STK-012', concern: 'Claims after 10 pm', influence: '4', reason: v }).length === 0, ['Sets premiums', 'Insurer'], ['']),
    field('need statement', (v) => needOk(v, 'before each shift'), ['Families need food.', 'Drivers need routes before shifts.', 'Families need the Pantry to feed them.'], ['', 'Families need.', 'The Pantry needs vans.', 'Drivers shall get routes.']),
    field('need rationale', (v) => assessNeed({ name: 'n', text: 'Families need food weekly.', conditions: '', rationale: v, sources: ['STK-001'] }, REG).completeness.every((c) => c.ok), ['Legal requirement', 'Interview'], ['']),
    field('warning justification', (v) => notCountingReasons({ gates: [], completeness: [], warnings: [{ id: 'vague', message: 'x' }] } as never, { form: true, 'solution-free': true, attributed: true, traced: true, condition: true, rationale: true }, v).length === 0, ['Regulator’s own term', 'Contract wording'], ['', 'ok', 'n/a']),
  )
})

// ------------------------------------------------------------------------------------------------------------- week 2
describe('Week 2 team lab tool: short valid answers are accepted, real defects still fail', () => {
  const F = week2Fixture
  const q0 = (r: Week2Record) => r.requirements.find((q) => q.id === 'REQ-STK-002')!
  const reqOk = (patch: object) => {
    const r = F()
    return assessRequirement({ ...q0(r), ...patch }, r).gates.every((g) => g.ok)
  }
  const scnOk = (patch: object) => {
    const r = F()
    return assessScenario({ ...r.scenarios[0], ...patch }, r).ok
  }
  it('the fixture passes as given', () => {
    const r = F()
    expect(assessRequirement(q0(r), r).gates.every((g) => g.ok)).toBe(true)
    expect(assessScenario(r.scenarios[0], r).ok).toBe(true)
    expect(checkConopsPart(r).ok).toBe(true)
  })
  run(
    field('requirement rationale', (v) => reqOk({ rationale: v }), ['Food must be kept cold.', 'Health code (A-002)'], ['', 'n/a']),
    field('requirement criterion', (v) => reqOk({ criterion: v }), ['2 min', 'Every delivery', '≤ 4 °C'], ['', 'works', 'quickly']),
    field('scenario name', (v) => scnOk({ name: v }), ['Blackout', 'Hub'], ['']),
    field('scenario trigger', (v) => scnOk({ trigger: v }), ['Power fails', 'Order arrives'], ['', 'none']),
    field('scenario preconditions', (v) => scnOk({ preconditions: v }), ['Shop open', 'None'], ['']),
    field('scenario success end state', (v) => scnOk({ success: v }), ['Order delivered', 'Approved'], ['', 'n/a']),
    field('scenario failure end state', (v) => scnOk({ failure: v }), ['Fail safe', 'Order cancelled'], ['', 'None']),
    field('scenario system of interest (sentence)', (v) => checkConopsPart({ ...F(), conops: { ...F().conops, soi: v } }).ok, ['Vans and drivers deliver.'], ['', 'Vans.']),
    field('discovery text', (v) => {
      const r = F()
      return !r.discoveries.length || discoveryIssues({ ...r.discoveries[0], text: v }, r).length === 0
    }, ['Missing cold chain'], []),
    field('unknown closed by', (v) => {
      const u = F().uncertainties.find((x) => x.id.startsWith('U-'))
      return !u || uncertaintyIssues({ ...u, closeBy: v }).length === 0
    }, ['Week 6', 'Survey'], []),
    field('capability statement', (v) => {
      const r = F()
      return capabilityIssues({ ...r.capabilities[0], statement: v }, r).length === 0
    }, ['Deliver meals', 'Store food cold'], ['']),
    field('MOE definition and source', (v) => {
      const r = F()
      return measureIssues({ ...r.moes[0], definition: v, source: v }, 'MOE', r).length === 0
    }, ['Delivery time', 'Logs'], ['']),
    field('audit disposition', (v) => {
      const r = F()
      const key = Object.keys(r.dispositions)[0]
      return !key || checkAuditPart({ ...r, dispositions: { ...r.dispositions, [key]: v } }).ok
    }, ['Open: AB, Week 6', 'Verified at service level'], []),
  )
  it('an empty or "later" audit disposition still fails', () => {
    const r = F()
    const key = Object.keys(r.dispositions)[0]
    expect(key).toBeTruthy()
    expect(checkAuditPart({ ...r, dispositions: { ...r.dispositions, [key]: '' } }).ok).toBe(false)
    expect(checkAuditPart({ ...r, dispositions: { ...r.dispositions, [key]: 'later' } }).ok).toBe(false)
  })
})

// ------------------------------------------------------------------------------------------------------------- week 3
describe('Week 3 team lab tool: short valid answers are accepted, real defects still fail', () => {
  const F = week3Fixture
  const techOk = (patch: object) => {
    const r = F()
    return assessTechnology({ ...r.technologies[0], ...patch }, r).counts
  }
  const riskOk = (patch: object) => {
    const r = F()
    return assessRisk({ ...r.risks[0], ...patch }, r).counts
  }
  const tpmOk = (patch: object) => {
    const r = F()
    return assessTpm({ ...r.tpms[0], ...patch }, r).counts
  }
  const tradeOk = (patch: Partial<Week3Record['trade']>) => {
    const r = F()
    return assessTrade({ ...r, trade: { ...r.trade, ...patch } }).counts
  }
  it('the fixture passes as given', () => {
    const r = F()
    expect(assessTechnology(r.technologies[0], r).counts).toBe(true)
    expect(assessRisk(r.risks[0], r).counts).toBe(true)
    expect(assessTpm(r.tpms[0], r).counts).toBe(true)
    expect(assessTrade(r).counts).toBe(true)
  })
  run(
    field('technology does', (v) => techOk({ does: v }), ['Keeps food cold', 'Tracking'], ['']),
    field('risk condition', (v) => riskOk({ condition: v }), ['Old freezer', 'Single van'], ['', 'none']),
    field('risk if', (v) => riskOk({ ifEvent: v }), ['power fails', 'Van breaks down'], ['', 'n/a']),
    field('risk then', (v) => riskOk({ then: v }), ['food spoils', 'Deliveries stop (REQ-SYS-001)'], ['', 'none']),
    field('risk likelihood reason', (v) => riskOk({ likelihoodWhy: v }), ['Happened twice', 'Vendor data'], ['']),
    field('risk trigger', (v) => riskOk({ trigger: v }), ['Alarm', 'Temp > 5 °C'], ['', 'n/a']),
    field('TPM basis', (v) => tpmOk({ basis: v }), ['Vendor test', 'Model'], ['', 'none']),
    field('trade decision statement', (v) => tradeOk({ decision: v }), ['Which cold store?', 'How should Pantry keep food cold given budget?'], ['']),
    field('trade residual risk', (v) => tradeOk({ residualRisk: v }), ['Power cuts', 'Vendor lock-in'], ['', 'none']),
    field('assumption validation', (v) => assumptionIssues({ ...F().assumptions[0], validation: v }).length === 0, ['Ask clinic', 'Site visit'], ['', 'later']),
    field('unknown closed by', (v) => unknownIssues({ ...F().unknowns[0], closeBy: v }, F()).length === 0, ['Week 6'], ['']),
  )
  it('opportunities and issues: a short text and action count; empty ones fail', () => {
    const r = F()
    for (const [list, fn] of [[r.opportunities, opportunityIssues], [r.issues, issueIssues]] as const) {
      if (!list.length) continue
      const x = list[0] as never as { name: string; text: string; owner: string; action: string }
      expect((fn as (y: typeof x) => string[])({ ...x, name: 'Grant', text: 'New grant', action: 'Apply' })).toEqual([])
      expect((fn as (y: typeof x) => string[])({ ...x, text: '', action: '' }).length).toBe(2)
    }
  })
  it('sensitivity: a note with the reversal number counts in a few words; one without a number fails when the tool computed a point', () => {
    const r = F()
    const points = assessTrade(r).computation.sensitivity.flatMap((x) => [x.up?.w, x.down?.w]).filter((w): w is number => typeof w === 'number')
    expect(points.length).toBeGreaterThan(0)
    expect(tradeOk({ sensitivityNote: `Robust above ${points[0].toFixed(2)}` })).toBe(true)
    expect(tradeOk({ sensitivityNote: 'see table' })).toBe(false)
  })
})

// ------------------------------------------------------------------------------------------------------------- week 4
describe('Week 4 team lab tool: short valid answers are accepted, real defects still fail', () => {
  const F = week4Fixture
  const at = <T,>(r: Week4Record, pick: (r: Week4Record) => T) => pick(r)
  it('the fixture passes as given', () => {
    const r = F()
    expect(Object.values(w4Checks(r)).every((c) => c.ok)).toBe(true)
  })
  run(
    field('mission function', (v) => w4Checks({ ...F(), mission: v }).functions.ok, ['Feed families', 'Feed', 'Deliver food'], ['', '   ']),
    field('viewpoint purpose', (v) => assessViewpoint({ ...F().viewpoints[0], purpose: v }, F()).counts, ['Who decides?', 'Ownership'], ['']),
    field('viewpoint form', (v) => assessViewpoint({ ...F().viewpoints[0], form: v }, F()).counts, ['Table', 'Swimlane of functions'], ['']),
    field('viewpoint concern', (v) => assessViewpoint({ ...F().viewpoints[0], concerns: v }, F()).counts, ['Noise', 'CON-003'], ['']),
    field('planning reason', (v) => assessFunction({ ...F().functions[0], scenarios: '', planning: v }, F()).counts, ['Runs nightly', 'Quarterly'], ['', 'planning', 'Planning function']),
    field('allocation sentence', (v) => assessAllocation({ ...F().functions[0], why: v }, F()).counts, ['Same voltage.', 'Shares hardware'], ['', 'flow']),
    field('decision question', (v) => assessDecision({ ...F().decisions[0], question: v }, F()).counts, ['Fridges?', 'Where to cool?'], ['']),
    field('decision rationale', (v) => assessDecision({ ...F().decisions[0], rationale: v }, F()).counts, ['Cheaper.', 'No extra van runs'], ['']),
    field('chosen alternative', (v) => {
      const d = F().decisions[0]
      return assessDecision({ ...d, alternatives: lines(d.alternatives).map((a, i) => `${i + 1}. ${a}`).join('\n'), chosen: v }, F()).counts
    }, [`${lines(F().decisions[0].alternatives)[1]}?`, lines(F().decisions[0].alternatives)[1].toUpperCase()], ['', 'Something else entirely']),
    field('information decision', (v) => assessInfo({ ...F().information[0], decision: v }, F()).counts, ['Restock', 'Send van'], ['']),
    field('information producer (ID)', (v) => assessInfo({ ...F().information[0], producers: v }, F()).counts, ['PHY-001', 'phy-001', 'EXT-001'], ['', 'PHY-099', 'the warehouse']),
    field('AI oversight', (v) => assessAi({ ...F().ai[0], oversight: v }, F()).counts, ['Manager approves', 'Hub lead decides'], ['', 'none', 'N/A']),
    field('AI failure mode', (v) => assessAi({ ...F().ai[0], failure: v }, F()).counts, ['False alarms', 'Drift'], ['', 'none']),
    field('AI supported function (ID)', (v) => assessAi({ ...at(F(), (r) => r.ai[0]), supports: v }, F()).counts, [F().ai[0].supports], ['', 'FN-099']),
  )
})

// --- week5 (added by parent) ---
describe('Week 5 team lab tool: short valid answers are accepted, real defects still fail', () => {
  const F = () => week5Fixture()
  const with5 = (fn: (r: Week5Record) => void) => {
    const r = F()
    fn(r)
    return r
  }
  // IF-007 crosses a trust boundary in the fixture (external end), so its protection gate is live
  const ifc = (r: Week5Record, id: string) => r.interfaces.find((x) => x.id === id)!
  it('the fixture passes as given', () => {
    const r = F()
    expect(Object.values(w5Checks(r)).every((c) => c.ok)).toBe(true)
    expect(w5Interface(ifc(r, 'IF-007'), r).gates.find((g) => g.id === 'protection')!.message).toMatch(/crosses a trust boundary/)
  })
  run(
    field('card responsibility', (v) => w5Card({ ...F().cards[0], responsibility: v }).counts, ['Charges aircraft', 'Raises alarms', 'Feed families'], ['', 'Freezers']),
    field('card owner', (v) => w5Card({ ...F().cards[0], owner: v }).counts, ['Stripe', 'Ops', 'Riverside Food Bank'], ['', '  ']),
    field('component name', (v) => { const r = F(); return w5Component({ ...r.components[0], name: v }, r).counts }, ['Hub', 'Stripe', 'GPT-4o service', 'CMP'], ['']),
    field('component responsibility', (v) => { const r = F(); return w5Component({ ...r.components[0], responsibility: v }, r).counts }, ['Measure freezers', 'Charges aircraft'], ['', 'Freezers']),
    field('interface protection', (v) => { const r = F(); return w5Interface({ ...ifc(r, 'IF-007'), protection: v, noProtectionReason: '' }, r).counts }, ['TLS', 'Mutual TLS', 'Power only'], ['', ' ']),
    field('interface reason for no protection', (v) => { const r = F(); return w5Interface({ ...ifc(r, 'IF-007'), protection: '', noProtectionReason: v }, r).counts }, ['Power only', 'No data'], ['']),
    field('interface degraded mode', (v) => { const r = F(); return w5Interface({ ...ifc(r, 'IF-007'), degraded: v }, r).counts }, ['Fail safe', 'Hold all departures', 'Fall back to radio'], ['', 'Stop']),
    field('interface medium', (v) => { const r = F(); return w5Interface({ ...ifc(r, 'IF-007'), medium: v }, r).counts }, ['Wi-Fi', 'SFTP', 'Stripe API'], ['']),
    field('interface owner', (v) => { const r = F(); return w5Interface({ ...ifc(r, 'IF-007'), ownerB: v }, r).counts }, ['Stripe', 'Ops'], ['']),
    field('requirement criterion', (v) => { const r = F(); return w5Requirement({ ...r.requirements[0], criterion: v }, r).counts }, ['2 min', '≤2min', 'TBD (Ops)', '100%'], ['', 'Fast']),
    field('requirement parent (ID)', (v) => { const r = F(); return w5Requirement({ ...r.requirements[0], parents: v }, r).counts }, [F().requirements[0].parents, F().requirements[0].parents.toLowerCase()], ['', 'REQ-STK-099']),
    field('change request change', (v) => { const r = F(); return w5Change({ ...r.changes[0], change: v }, r).counts }, ['Add encryption', 'Add encryption to IF-006'], ['', 'Encrypt']),
    field('change request decision', (v) => { const r = F(); return w5Change({ ...r.changes[0], decision: v, decider: 'ICWG' }, r).counts }, ['Approved', 'Rejected', 'Deferred to Q3'], ['', ' ']),
    field('external reason for no interface', (v) => w5Checks(with5((r) => { r.externalReasons = Object.fromEntries(Object.keys(r.externalReasons).map((k) => [k, v])) })).interfaces.ok, ['No arrangement yet', 'No exchange yet', 'None'], ['', '  ']),
    field('interface standards', (v) => w5Checks(with5((r) => { r.standards = v })).management.ok, ['None apply', 'None', 'ISO 15118'], ['', ' ']),
  )
})

// ------------------------------------------------------------------------------------------------------------- week 8
describe('Week 8 team lab tool: short valid counts are accepted, non-counts still fail', () => {
  run(
    field('package count', (v) => countOf(v) !== null, ['0', '12', '12 items', '3 (SCN-001 to SCN-003)', 'none', 'Zero'], ['', 'some', 'TBD', '12.5', 'about a dozen']),
  )
  it('the count read is the number written', () => {
    expect(countOf('12 items')).toBe(12)
    expect(countOf('none')).toBe(0)
    expect(countOf(' 7 ')).toBe(7)
  })
})
