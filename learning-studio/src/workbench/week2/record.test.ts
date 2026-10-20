// Week 2 Team Record logic, tested in BOTH directions: the realistic fixture (a fictional food bank network) passes every
// check, and each check is shown able to fail by a mutation that breaks only that check (so no check passes for the
// wrong reason). Every hard gate fails on bad input; a good requirement that merely raises an advisory still counts.
import { describe, expect, it } from 'vitest'
import { LAB2_MINIMUMS, LAB2_MINIMUMS_THREE, REQ_ADVISORIES, REQ_HARD_GATES } from '../../content/lectures/week02/labBrief'
import { CAPABILITIES, NEEDS, REQUIREMENTS, SCENARIOS, SCENARIO_SOI, UNCERTAINTIES } from '../../content/lectures/week02/aerolinkCase'
import { TEAM_FIXTURE } from '../week1/teamFixture'
import { teamModelInputs } from '../week1/team'
import { WEEK1_JSON, week2Fixture } from './fixture'
import {
  EMPTY_RECORD, allChecks, assessRequirement, assessScenario, auditOf, checkAiStatement, checkAuditPart, checkCapabilitiesPart, checkConopsPart, checkImport, checkRequirementsPart, checkScenariosPart,
  fileStem, importWeek1, importWeek2, modelInputs, nextId, normalizeRecord, recordMarkdown, recordState, requirementCount, subjectAccepted, unmeasurableTermsIn, valueIn, withIssued,
  type Requirement, type Scenario, type Week2Record,
} from './record'

const F = week2Fixture
const req = (r: Week2Record, id: string) => r.requirements.find((q) => q.id === id)!
const scn = (r: Week2Record, id: string) => r.scenarios.find((s) => s.id === id)!
/** The fixture with one requirement replaced by a patched copy. */
function withReq(id: string, patch: Partial<Requirement>, base = F()): Week2Record {
  return { ...base, requirements: base.requirements.map((q) => (q.id === id ? { ...q, ...patch } : q)) }
}
const failed = (r: Week2Record, id: string) => assessRequirement(req(r, id), r).gates.filter((g) => !g.ok).map((g) => g.id)
const advisories = (r: Week2Record, id: string) => assessRequirement(req(r, id), r).advisories.map((a) => a.id)
function withScn(id: string, patch: Partial<Scenario>, base = F()): Week2Record {
  return { ...base, scenarios: base.scenarios.map((s) => (s.id === id ? { ...s, ...patch } : s)) }
}
const scnFailed = (r: Week2Record, id: string) => assessScenario(scn(r, id), r).gates.filter((g) => !g.ok).map((g) => g.id)
const scnAdv = (r: Week2Record, id: string) => assessScenario(scn(r, id), r).advisories.map((a) => a.id)

describe('the fixture (a fictional food bank network) passes every check', () => {
  it('every part is complete and the record is ready', () => {
    const r = F()
    for (const [k, c] of Object.entries(allChecks(r))) expect(c.issues, k).toEqual([])
    expect(recordState(r)).toBe('ready')
  })
  it('it is never AeroLink, and it extends the Week 1 record', () => {
    const r = F()
    expect(r.week1?.enterprise).toBe('Riverside Food Bank Network')
    expect(JSON.stringify(r)).not.toMatch(/aero\s*-?\s*link/i)
    expect(r.week1?.needs).toHaveLength(8)
    expect(r.week1?.members).toEqual(['JS', 'AK', 'RM', 'TL'])
  })
  it('every requirement passes every hard gate; counts meet the team-of-four minimums', () => {
    const r = F()
    for (const q of r.requirements) expect(failed(r, q.id), q.id).toEqual([])
    const c = requirementCount(r)
    expect(c.total).toBeGreaterThanOrEqual(LAB2_MINIMUMS.requirements)
    expect(c.stk).toBeGreaterThanOrEqual(LAB2_MINIMUMS.stakeholderRequirements)
    expect(c.sys).toBeGreaterThanOrEqual(LAB2_MINIMUMS.systemRequirements)
    expect(c.types.length).toBeGreaterThanOrEqual(LAB2_MINIMUMS.types)
  })
})

describe('Week 1 import', () => {
  it('reads the Week 1 model-inputs file with Week 1’s importer', () => {
    const x = importWeek1(WEEK1_JSON)
    expect('snapshot' in x && x.snapshot.needs.map((n) => n.id)).toEqual(['NEED-001', 'NEED-002', 'NEED-003', 'NEED-004', 'NEED-005', 'NEED-006', 'NEED-007', 'NEED-008'])
    expect('snapshot' in x && x.snapshot.sourceVersion).toBe(3)
    expect('snapshot' in x && x.snapshot.decision).toBe('approved')
  })
  it('still reads an older Week 1 version (2)', () => {
    const d = JSON.parse(WEEK1_JSON)
    d.version = 2
    expect('snapshot' in importWeek1(JSON.stringify(d))).toBe(true)
  })
  it('refuses AeroLink, a non-Week-1 file, broken JSON, a record without needs', () => {
    const aero = { ...TEAM_FIXTURE, proposal: { ...TEAM_FIXTURE.proposal, name: 'AeroLink Urban Mobility' } }
    expect(importWeek1(JSON.stringify(teamModelInputs(aero, '2026-10-19')))).toEqual({ error: expect.stringMatching(/AeroLink/) })
    expect(importWeek1('{"format":"week2-model-inputs","version":1}')).toEqual({ error: expect.stringMatching(/not a Week 1/) })
    expect(importWeek1('{nope')).toEqual({ error: expect.stringMatching(/not valid JSON/) })
    const noNeeds = { ...TEAM_FIXTURE, needs: [] }
    expect(importWeek1(JSON.stringify(teamModelInputs(noNeeds, '2026-10-19')))).toEqual({ error: expect.stringMatching(/no needs/) })
  })
  it('the import part fails without a Week 1 record, or with an unapproved proposal', () => {
    expect(checkImport(EMPTY_RECORD).ok).toBe(false)
    expect(recordState({ ...F(), week1: null })).toBe('not-ready')
    const r = F()
    expect(checkImport({ ...r, week1: { ...r.week1!, decision: 'pending' } }).issues.join(' ')).toMatch(/not recorded as approved/)
  })
})

describe('requirement hard gates: the ids are REQ_HARD_GATES, in order', () => {
  it('same ids, same order; advisories are REQ_ADVISORIES ids only', () => {
    const r = F()
    const a = assessRequirement(req(r, 'REQ-STK-001'), r)
    expect(a.gates.map((g) => g.id)).toEqual(REQ_HARD_GATES.map((g) => g.id))
    const ids = new Set(REQ_ADVISORIES.map((x) => x.id))
    const noisy = withReq('REQ-STK-001', { statement: 'The delivery service shall not quickly maximize produce using a van and notify pantries at 5 °C.', type: 'performance', method: 'inspection' })
    const adv = advisories(noisy, 'REQ-STK-001')
    expect(adv.length).toBeGreaterThan(0)
    for (const x of adv) expect(ids.has(x)).toBe(true)
  })

  // Each mutation breaks exactly one gate: the check fails for the right reason, and only that one.
  const ONLY: [string, string, Partial<Requirement>][] = [
    ['one-shall', 'REQ-STK-002', { statement: 'The network shall keep donated food at or below 5 °C and shall log every reading from collection to delivery.' }],
    ['subject', 'REQ-STK-002', { statement: 'Shall keep donated food at or below 5 °C from collection to delivery.' }],
    ['parent', 'REQ-STK-002', { parents: 'NEED-099' }],
    ['type', 'REQ-STK-002', { type: '' }],
    ['method', 'REQ-STK-002', { method: '' }],
    ['criterion', 'REQ-STK-002', { criterion: 'Meets the requirement' }],
    ['performance-value', 'REQ-STK-003', { type: 'performance', method: 'test' }],
    ['tbx-owned', 'REQ-STK-002', { statement: 'The network shall keep donated food at or below TBD-03 °C from collection to delivery.' }],
    ['rationale', 'REQ-STK-002', { rationale: '' }],
    ['unmeasurable', 'REQ-STK-003', { statement: 'The delivery service shall notify the pantry coordinator of any shortfall in an order quickly.' }],
  ]
  for (const [gate, id, patch] of ONLY)
    it(`${gate}: fails alone on a single mutation, passes on the original`, () => {
      expect(failed(F(), id)).toEqual([])
      expect(failed(withReq(id, patch), id)).toEqual([gate])
      expect(assessRequirement(req(withReq(id, patch), id), withReq(id, patch)).counts).toBe(false)
    })

  it('one-shall: no “shall” fails, two fail (“The aircraft shall be quiet and shall be safe …”), one passes', () => {
    expect(failed(withReq('REQ-STK-002', { statement: 'The network keeps donated food at or below 5 °C.' }), 'REQ-STK-002')).toContain('one-shall')
    expect(failed(withReq('REQ-STK-002', { statement: 'The aircraft shall be quiet and shall be safe at every vertiport.' }), 'REQ-STK-002')).toContain('one-shall')
  })
  it('subject: a pronoun is not a subject', () => {
    expect(failed(withReq('REQ-STK-002', { statement: 'It shall keep donated food at or below 5 °C.' }), 'REQ-STK-002')).toContain('subject')
    expect(failed(withReq('REQ-STK-002', { statement: 'When a load is collected, the network shall keep it at or below 5 °C.' }), 'REQ-STK-002')).toEqual([])
  })
  it('parent: absent, malformed, empty, self, inverted and level-skipping parents fail; valid ones pass', () => {
    const p = (id: string, parents: string) => failed(withReq(id, { parents }), id).includes('parent')
    expect(p('REQ-STK-002', 'NEED-099')).toBe(true) // absent need
    expect(p('REQ-STK-002', 'REQ-SYS-001')).toBe(true) // a REQ-STK may not derive from a REQ-SYS
    expect(p('REQ-STK-002', 'NEED-99')).toBe(true) // not an ID
    expect(p('REQ-STK-002', '')).toBe(true)
    expect(p('REQ-STK-002', 'REQ-STK-002')).toBe(true)
    expect(p('REQ-SYS-003', 'NEED-002')).toBe(true) // a REQ-SYS derives from a REQ-STK or CAP, not a need
    expect(p('REQ-STK-002', 'NEED-002')).toBe(false)
    expect(p('REQ-STK-002', 'CAP-002')).toBe(false)
    expect(p('REQ-STK-003', 'NEED-009')).toBe(false) // a need added by discovery is a valid parent
    expect(p('REQ-SYS-003', 'CAP-002')).toBe(false)
    expect(p('REQ-SYS-003', 'REQ-STK-002, REQ-SYS-001')).toBe(false) // a derived system requirement
    expect(p('REQ-SYS-003', 'CAP-099')).toBe(true)
  })
  it('criterion: empty, trivial and vague criteria fail; an observable one passes', () => {
    const c = (criterion: string) => failed(withReq('REQ-STK-002', { criterion }), 'REQ-STK-002').includes('criterion')
    expect(c('')).toBe(true)
    expect(c('Verified by test')).toBe(true)
    expect(c('The food stays safe and adequate')).toBe(true)
    expect(c('Logged temperature at or below 5 °C for every reading')).toBe(false)
    expect(c('Every load arrives safe, as logged')).toBe(false) // vague word anchored by a population
  })
  it('performance-value: a number with any unit or a TBD/TBR passes; none fails; other types are exempt', () => {
    const v = (statement: string, type: Requirement['type'] = 'performance') => failed(withReq('REQ-STK-002', { statement, type, method: 'test' }), 'REQ-STK-002').includes('performance-value')
    expect(v('The fleet shall maximize availability.')).toBe(true)
    expect(v('The fleet shall maximize availability.', 'functional')).toBe(false)
    expect(v('The network shall collect at least 500 lb of produce from each store every week.')).toBe(false)
    expect(v('The network shall keep donated food at or below 4 °C.')).toBe(false)
    expect(v('The network shall deliver each order by 17:00 on its agreed day.')).toBe(false)
    expect(v('The network shall deliver each order within two hours of loading.')).toBe(false)
    expect(v('The delivery service shall reach NEED-004 pantries.')).toBe(true) // an ID is not a value
    expect(valueIn('REQ-SYS-001 and TBD-02')).toBeUndefined()
  })
  it('tbx-owned: unrecorded, ownerless, unnumbered and wrongly linked tokens fail; an owned token passes', () => {
    const base = F()
    expect(failed(base, 'REQ-STK-004')).toEqual([]) // TBD-01 held by U-001, which has an owner
    const noOwner = { ...base, uncertainties: base.uncertainties.map((u) => (u.id === 'U-001' ? { ...u, owner: '' } : u)) }
    expect(failed(noOwner, 'REQ-STK-004')).toEqual(['tbx-owned'])
    const noU = { ...base, uncertainties: base.uncertainties.filter((u) => u.id !== 'U-001') }
    expect(failed(noU, 'REQ-STK-004')).toContain('tbx-owned')
    expect(failed(withReq('REQ-STK-004', { statement: 'The network shall alert the on-call staff to a freezer above the limit (TBD) within 5 minutes.' }), 'REQ-STK-004')).toEqual(['tbx-owned'])
    expect(failed(withReq('REQ-STK-004', { tbx: 'U-009' }), 'REQ-STK-004')).toEqual(['tbx-owned'])
    expect(failed(withReq('REQ-STK-004', { tbx: 'A-001' }), 'REQ-STK-004')).toEqual(['tbx-owned'])
    expect(failed(withReq('REQ-STK-004', { tbx: '' }), 'REQ-STK-004')).toEqual([]) // the token itself decides
  })
  it('rationale: empty, "n/a" or a restatement fails; a reason passes, however short (gate sweep 2026-10-19)', () => {
    const q = req(F(), 'REQ-STK-002')
    expect(failed(withReq('REQ-STK-002', { rationale: q.statement }), 'REQ-STK-002')).toEqual(['rationale'])
    expect(failed(withReq('REQ-STK-002', { rationale: 'n/a' }), 'REQ-STK-002')).toEqual(['rationale'])
    expect(failed(withReq('REQ-STK-002', { rationale: 'Food must be kept cold.' }), 'REQ-STK-002')).toEqual([])
    expect(failed(withReq('REQ-STK-002', { rationale: 'Health code (A-002)' }), 'REQ-STK-002')).toEqual([])
  })
})

describe('known false positives and advisories (advisories never block counting)', () => {
  const rec = (patch: Partial<Requirement>) => withReq('REQ-SYS-004', patch)
  it('“The booking function shall display the total fare … before it accepts a booking confirmation.” (functional, no number) counts', () => {
    const r = rec({ statement: 'The booking function shall display the total fare, including every charge, before it accepts a booking confirmation.', type: 'functional', method: 'demonstration', parents: 'REQ-STK-006' })
    const a = assessRequirement(req(r, 'REQ-SYS-004'), r)
    expect(a.counts).toBe(true)
  })
  it('“The AeroLink service shall not dispatch a flight when … (TBD-01)” with U-001 present counts and raises negative', () => {
    const r = withReq('REQ-STK-004', { statement: 'The AeroLink service shall not dispatch a flight when the forecast at its departure or arrival vertiport exceeds the approved aircraft weather limits (TBD-01).', type: 'functional', method: 'demonstration' })
    const a = assessRequirement(req(r, 'REQ-STK-004'), r)
    expect(a.counts).toBe(true)
    expect(a.advisories.map((x) => x.id)).toContain('negative')
    // it counts as a requirement, but the record refuses AeroLink at the part level
    expect(checkRequirementsPart(r).issues.join(' ')).toMatch(/names AeroLink/)
  })
  it('“The fleet shall maximize availability.” fails the unmeasurable gate and, typed performance, performance-value too', () => {
    const r = rec({ statement: 'The fleet shall maximize availability.', type: 'performance', method: 'analysis' })
    expect(failed(r, 'REQ-SYS-004')).toEqual(['performance-value', 'unmeasurable'])
    expect(failed(rec({ statement: 'The fleet shall maximize availability.', type: 'constraint', method: 'analysis' }), 'REQ-SYS-004')).toEqual(['unmeasurable'])
  })
  const ADV: [string, Partial<Requirement>][] = [
    ['vague', { statement: 'The reporting function shall export the delivered weight per district in the funders’ template in a timely manner.' }],
    ['maximize', { statement: 'The reporting function shall minimize the time to export the delivered weight per district to no more than 30 s.' }],
    ['negative', { statement: 'The reporting function shall not export a district total without its delivered weight.' }],
    ['single-point', { statement: 'The reporting function shall export the delivered weight per district in 30 s.' }],
    ['design', { statement: 'The reporting function shall export the delivered weight per district using a spreadsheet macro.' }],
    ['compound', { statement: 'The reporting function shall export the delivered weight per district and send it to each funder.' }],
    ['method-fit', { statement: 'The reporting function shall export the delivered weight per district within 30 s of a request.', type: 'performance', method: 'inspection' }],
  ]
  for (const [id, patch] of ADV)
    it(`${id}: raised by its sign, absent on the clean requirement, and the requirement still counts`, () => {
      expect(advisories(F(), 'REQ-SYS-004')).not.toContain(id)
      const r = rec(patch)
      expect(advisories(r, 'REQ-SYS-004')).toContain(id)
      expect(failed(r, 'REQ-SYS-004')).toEqual([])
    })
  it('a bounded value does not raise single-point; a value in a condition clause is not the obligation', () => {
    expect(advisories(rec({ statement: 'The reporting function shall export the delivered weight per district within 30 s.' }), 'REQ-SYS-004')).not.toContain('single-point')
    expect(advisories(rec({ statement: 'The reporting function shall flag a district when its weight falls below 200 lb.' }), 'REQ-SYS-004')).not.toContain('single-point')
  })
  it('a requirement with advisories still counts toward the minimums', () => {
    const r = rec({ statement: 'The reporting function shall not export a district total without its delivered weight in a timely manner.' })
    expect(advisories(r, 'REQ-SYS-004').length).toBeGreaterThanOrEqual(2)
    expect(requirementCount(r).total).toBe(requirementCount(F()).total)
  })
})

describe('the instructor’s AeroLink standard (worked example) under the same gates', () => {
  // AeroLink is used here ONLY as the standard: a record of the case's needs, capabilities, register and requirements.
  const r = normalizeRecord({
    ...EMPTY_RECORD,
    week1: { team: '00', enterprise: 'standard', needs: NEEDS.map((n) => ({ id: n.id, name: n.name, statement: n.statement })), goals: [], stakeholders: [] },
    conops: { soiName: SCENARIO_SOI.name, soi: SCENARIO_SOI.name },
    capabilities: CAPABILITIES.map((c) => ({ id: c.id, name: c.name, statement: c.text, needs: c.needs })),
    uncertainties: UNCERTAINTIES.map((u) => ({ id: u.id, name: u.name, tbx: u.tbx ?? '', owner: u.owner, closeBy: u.closeBy, validation: u.closeBy })),
    requirements: REQUIREMENTS.map((q) => ({ id: q.id, name: q.name, statement: q.statement, type: q.type, method: q.method, criterion: q.criterion, rationale: q.rationale, parents: q.parents.join(', '), owner: 'JS' })),
    scenarios: SCENARIOS.map((s) => ({
      id: s.id, name: s.name, kind: s.kind, owner: 'JS',
      actors: s.actors.map((a) => ({ id: a.id, name: a.label.replace(' (primary)', ''), primary: a.id === s.primary, environment: !!a.environment })),
      trigger: s.trigger, preconditions: s.preconditions, steps: s.steps.map((x) => ({ actor: x.actor, action: x.text })),
      alternates: s.alternates.map((a) => ({ id: a.id, fromStep: a.fromStep, condition: a.condition, response: a.response, outcome: a.outcome === 'ends' ? 'ends' : 'rejoin', rejoin: a.outcome === 'ends' ? 0 : a.outcome.rejoin })),
      success: s.success, failure: s.failure,
    })),
  })
  it('every scenario passes every scenario gate', () => {
    for (const s of r.scenarios) expect(scnFailed(r, s.id), s.id).toEqual([])
  })
  it('every requirement passes every hard gate (the TBRs are numbered and tracked by U-005 and U-006)', () => {
    const fails = Object.fromEntries(r.requirements.map((q) => [q.id, failed(r, q.id)]).filter(([, f]) => (f as string[]).length))
    expect(fails).toEqual({})
  })
  it('the standard’s orphan audit is empty', () => {
    expect(auditOf(r).orphans).toEqual([])
  })
  it('the worked-examples “Try it yourself” illustration for NEED-011 passes every gate with no advisory once U-007 holds TBR-03', () => {
    const withU7: Week2Record = { ...r, uncertainties: [...r.uncertainties, { id: 'U-007', name: 'Notice time not agreed', tbx: 'TBR-03', owner: 'Head of Customer Experience', closeBy: 'Agree with operations in Week 3', validation: '' }] }
    const base = { name: 'x', criterion: 'Every injected disruption notified within the limit', rationale: 'Passengers must hear of a disruption in time to act on it (NEED-011); the value is a first estimate.', tbx: '', owner: 'JS', reviewer: '', ai: false }
    const notice: Requirement = { ...base, id: 'REQ-STK-018', statement: 'The AeroLink service shall notify each passenger whose confirmed trip is held, diverted or cancelled within 5 min (TBR-03) of the decision.', type: 'performance', method: 'test', parents: 'NEED-011, CAP-015' }
    const onward: Requirement = { ...base, id: 'REQ-STK-019', statement: 'The AeroLink service shall offer each passenger whose confirmed trip is cancelled an alternative that reaches the destination vertiport’s area on the same day.', type: 'functional', method: 'demonstration', parents: 'NEED-011, CAP-015', rationale: 'Rests on assumption A-008, a public-transport fallback; passengers stranded at a vertiport lose trust in the service.' }
    for (const q of [notice, onward]) {
      const a = assessRequirement(q, withU7)
      expect(a.gates.filter((g) => !g.ok).map((g) => g.id), q.id).toEqual([])
      expect(a.advisories, q.id).toEqual([])
    }
    // without U-007 the TBR is untracked
    expect(assessRequirement(notice, r).gates.filter((g) => !g.ok).map((g) => g.id)).toEqual(['tbx-owned'])
  })
})

describe('scenario gates and advisories', () => {
  const ONLY: [string, Partial<Scenario>][] = [
    ['name', { name: '' }],
    ['kind', { kind: '' }],
    ['trigger', { trigger: '' }],

    ['preconditions', { preconditions: '' }],
    ['success', { success: '' }],
    ['failure', { failure: 'None' }],
  ]
  for (const [gate, patch] of ONLY)
    it(`${gate}: fails alone, passes on the original`, () => {
      expect(scnFailed(F(), 'SCN-001')).toEqual([])
      expect(scnFailed(withScn('SCN-001', patch), 'SCN-001')).toEqual([gate])
    })
  it('primary: none or two fail; outside: the primary actor named as the scenario system of interest fails (case-insensitive)', () => {
    const s = scn(F(), 'SCN-001')
    expect(scnFailed(withScn('SCN-001', { actors: s.actors.map((a) => ({ ...a, primary: false })) }), 'SCN-001')).toEqual(['primary', 'outside'])
    expect(scnFailed(withScn('SCN-001', { actors: s.actors.map((a) => ({ ...a, primary: true })) }), 'SCN-001')).toEqual(['primary'])
    expect(scnFailed(withScn('SCN-001', { actors: s.actors.map((a) => (a.primary ? { ...a, name: 'the RIVERSIDE delivery operation' } : a)) }), 'SCN-001')).toEqual(['outside'])
    const contains = withScn('SCN-001', { actors: s.actors.map((a) => (a.primary ? { ...a, name: 'Riverside delivery operation dispatcher' } : a)) })
    expect(scnFailed(contains, 'SCN-001')).toEqual([])
    expect(scnAdv(contains, 'SCN-001')).toContain('actor-in-soi')
  })
  it('steps: too few, or a step without an actor or action, fails', () => {
    const s = scn(F(), 'SCN-001')
    expect(scnFailed(withScn('SCN-001', { steps: s.steps.slice(0, LAB2_MINIMUMS.mainSteps - 1), alternates: [] }), 'SCN-001')).toEqual(['steps', 'alternates'])
    expect(scnFailed(withScn('SCN-001', { steps: s.steps.map((x, i) => (i === 1 ? { ...x, actor: '' } : x)) }), 'SCN-001')).toEqual(['steps'])
    expect(scnFailed(withScn('SCN-001', { steps: s.steps.slice(0, LAB2_MINIMUMS.mainSteps) }), 'SCN-001')).toEqual([])
  })
  it('alternates: none, a bad branch step, a bad rejoin step or no outcome fails; “ends” passes', () => {
    const a = scn(F(), 'SCN-001').alternates[0]
    const alt = (patch: object) => scnFailed(withScn('SCN-001', { alternates: [{ ...a, ...patch }] }), 'SCN-001')
    expect(scnFailed(withScn('SCN-001', { alternates: [] }), 'SCN-001')).toEqual(['alternates'])
    expect(alt({ fromStep: 9 })).toEqual(['alternates'])
    expect(alt({ fromStep: 0 })).toEqual(['alternates'])
    expect(alt({ outcome: 'rejoin', rejoin: 9 })).toEqual(['alternates'])
    expect(alt({ outcome: '' })).toEqual(['alternates'])
    expect(alt({ condition: '' })).toEqual(['alternates'])
    expect(alt({ outcome: 'ends', rejoin: 0 })).toEqual([])
  })
  it('advisories: a state trigger, a one-word step, an environmental primary, a loop back', () => {
    const s = scn(F(), 'SCN-001')
    expect(scnAdv(F(), 'SCN-001')).toEqual([])
    expect(scnAdv(withScn('SCN-001', { trigger: 'There is a weekly order waiting.' }), 'SCN-001')).toContain('trigger-state')
    expect(scnAdv(withScn('SCN-001', { trigger: 'The system is ready for orders.' }), 'SCN-001')).toContain('trigger-state')
    expect(scnAdv(withScn('SCN-001', { steps: s.steps.map((x, i) => (i === 0 ? { ...x, action: 'Orders' } : x)) }), 'SCN-001')).toContain('short-step')
    expect(scnAdv(withScn('SCN-001', { actors: s.actors.map((a) => (a.primary ? { ...a, environment: true } : a)) }), 'SCN-001')).toContain('environment-primary')
    expect(scnAdv(F(), 'SCN-002')).toContain('loops-back')
    // advisories never fail a scenario
    expect(scnFailed(withScn('SCN-001', { trigger: 'There is a weekly order waiting.' }), 'SCN-001')).toEqual([])
  })
})

describe('part checks fail on bad input', () => {
  it('Part 7: no scenario system of interest, too little environment, AeroLink', () => {
    const r = F()
    expect(checkConopsPart({ ...r, conops: { ...r.conops, soi: '' } }).ok).toBe(false)
    expect(checkConopsPart({ ...r, conops: { ...r.conops, environment: r.conops.environment.slice(0, 2) } }).ok).toBe(false)
    expect(checkConopsPart({ ...r, conops: { ...r.conops, soiName: 'AeroLink operational system' } }).issues.join(' ')).toMatch(/AeroLink/)
    expect(checkScenariosPart({ ...r, conops: { ...r.conops, soi: '' } }).ok).toBe(false) // record-level gate
  })
  it('Part 8: too few scenarios, a missing kind, an owner, a broken discovery, an incomplete unknown', () => {
    const r = F()
    expect(checkScenariosPart({ ...r, scenarios: r.scenarios.slice(0, 2) }).ok).toBe(false)
    expect(checkScenariosPart(withScn('SCN-003', { kind: 'nominal' })).issues.join(' ')).toMatch(/support scenario/)
    // a team of three: two scenarios, nominal and off-nominal required; support only recommended (labBrief REQUIRED_KINDS_THREE)
    const pair = { ...r, scenarios: r.scenarios.filter((s) => s.id !== 'SCN-003'), threePersonTeam: true }
    expect(checkScenariosPart({ ...pair, discoveries: r.discoveries, uncertainties: r.uncertainties }).issues.filter((x) => /scenario/.test(x) && !/SCN-003/.test(x))).toEqual([])
    expect(checkScenariosPart(pair).notes?.join(' ')).toMatch(/support scenario is recommended/)
    expect(checkScenariosPart({ ...pair, threePersonTeam: false }).ok).toBe(false)
    expect(checkScenariosPart({ ...pair, scenarios: pair.scenarios.filter((s) => s.id !== 'SCN-002') }).issues.join(' ')).toMatch(/off-nominal/)
    expect(checkScenariosPart(withScn('SCN-003', { owner: '' })).ok).toBe(false)
    expect(checkScenariosPart(withScn('SCN-002', { clinic: { decision: 'revise', reason: '' } })).ok).toBe(false)
    expect(checkScenariosPart({ ...r, discoveries: r.discoveries.map((d) => (d.ref === 'A-001' ? { ...d, ref: 'A-007' } : d)) }).issues.join(' ')).toMatch(/A-007 is not in the record/)
    expect(checkScenariosPart({ ...r, uncertainties: r.uncertainties.map((u) => (u.id === 'U-001' ? { ...u, tbx: 'TBD' } : u)) }).ok).toBe(false)
    expect(checkScenariosPart({ ...r, discoveries: r.discoveries.filter((d) => d.kind !== 'need') }).issues.join(' ')).toMatch(/NEED-009/)
  })
  it('Part 9: too few capabilities (team of four), a capability with no need, an uncovered need without a reason', () => {
    const r = F()
    const four = { ...r, capabilities: r.capabilities.slice(0, LAB2_MINIMUMS_THREE.capabilities), dispositions: r.dispositions }
    expect(checkCapabilitiesPart(four).ok).toBe(false)
    expect(checkCapabilitiesPart({ ...four, threePersonTeam: true }).ok).toBe(true) // the reduced minimum
    expect(checkCapabilitiesPart({ ...r, capabilities: r.capabilities.map((c) => (c.id === 'CAP-005' ? { ...c, needs: ['NEED-099'] } : c)) }).ok).toBe(false)
    expect(checkCapabilitiesPart({ ...r, coverage: r.coverage.map((c) => (c.need === 'NEED-003' ? { ...c, reason: '' } : c)) }).issues.join(' ')).toMatch(/NEED-003/)
    expect(checkCapabilitiesPart({ ...r, capabilities: r.capabilities.map((c) => (c.id === 'CAP-002' ? { ...c, refines: 'CAP-003' } : c)) }).issues.join(' ')).toMatch(/loop/)
  })
  it('Part 10: only gate-passing requirements count; minimums by level and type; the owner', () => {
    const r = withReq('REQ-STK-006', { statement: 'The network shall provide reach data and shall publish it.' })
    expect(requirementCount(r).total).toBe(requirementCount(F()).total - 1)
    expect(checkRequirementsPart(r).ok).toBe(false) // 5 STK < 6
    expect(checkRequirementsPart({ ...r, threePersonTeam: true }).issues.join(' ')).toMatch(/REQ-STK-006 does not count/) // a failing requirement is listed
    const nine = { ...F(), requirements: F().requirements.filter((q) => q.id !== 'REQ-STK-006' && q.id !== 'REQ-SYS-004'), threePersonTeam: true }
    expect(checkRequirementsPart(nine).ok).toBe(true) // 8 ≥ 8, 5 STK ≥ 5, 3 SYS ≥ 3
    expect(checkRequirementsPart({ ...nine, threePersonTeam: false }).ok).toBe(false)
    expect(checkRequirementsPart(withReq('REQ-SYS-004', { owner: '' })).ok).toBe(false)
    const oneType = { ...F(), requirements: F().requirements.map((q) => ({ ...q, type: q.type === 'interface' || q.type === 'constraint' ? ('functional' as const) : q.type })) }
    expect(checkRequirementsPart(oneType).issues.join(' ')).toMatch(/at least 3 of the four types/)
  })
  it('Part 11: an orphan is listed; a childless need or REQ-STK without a disposition; incomplete measures', () => {
    const r = F()
    const orphan = withReq('REQ-SYS-001', { parents: 'REQ-STK-099' })
    expect(auditOf(orphan).orphans).toEqual([{ id: 'REQ-SYS-001', missing: ['REQ-STK-099'] }])
    expect(checkAuditPart(orphan).issues.join(' ')).toMatch(/Orphans: REQ-SYS-001/)
    expect(checkAuditPart({ ...r, dispositions: { ...r.dispositions, 'NEED-007': '' } }).issues.join(' ')).toMatch(/NEED-007/)
    expect(checkAuditPart({ ...r, dispositions: { ...r.dispositions, 'REQ-STK-003': 'later' } }).issues.join(' ')).toMatch(/REQ-STK-003/)
    expect(checkAuditPart({ ...r, moes: r.moes.map((m) => (m.id === 'MOE-001' ? { ...m, measures: 'REQ-STK-001' } : m)) }).ok).toBe(false)
    expect(checkAuditPart({ ...r, mops: r.mops.map((m) => (m.id === 'MOP-001' ? { ...m, measures: 'MOE-002' } : m)) }).ok).toBe(false)
    expect(checkAuditPart({ ...r, mops: r.mops.map((m) => (m.id === 'MOP-001' ? { ...m, source: '' } : m)) }).ok).toBe(false)
    expect(checkAuditPart({ ...r, moes: r.moes.slice(0, 2) }).ok).toBe(false)
    const two = { ...r, moes: r.moes.slice(0, 2), mops: r.mops.filter((m) => m.id !== 'MOP-002') }
    expect(checkAuditPart(two).ok).toBe(false)
    expect(checkAuditPart({ ...two, threePersonTeam: true }).ok).toBe(true)
  })
  it('the AI usage statement needs 12 words', () => {
    expect(checkAiStatement({ ...F(), aiStatement: 'We did not use AI.' }).ok).toBe(false)
  })
})

describe('IDs are issued by the tool and never reused', () => {
  it('a deleted ID is not issued again', () => {
    const r = F()
    expect(nextId(r, 'REQ-STK')).toBe('REQ-STK-007')
    const after = { ...r, requirements: r.requirements.filter((q) => q.id !== 'REQ-STK-006') }
    expect(nextId(after, 'REQ-STK')).toBe('REQ-STK-007')
    expect(nextId(r, 'NEED')).toBe('NEED-010')
    const minus = { ...r, needsAdded: [], issued: withIssued(r, 'NEED', 'NEED-009') }
    expect(nextId(minus, 'NEED')).toBe('NEED-010')
    expect(nextId(r, 'U')).toBe('U-002')
    expect(nextId(r, 'A')).toBe('A-002')
  })
})

describe('exports and the teammate import', () => {
  it('Markdown: Parts 5–11 headings, the added need, the AI statement, the file name', () => {
    const md = recordMarkdown(F(), '2026-10-25')
    for (const h of ['## 5. Stakeholder needs (revised)', '## 6. AI usage statement', '## 7. ConOps narrative', '## 8. Operational scenarios', '## 9. Capabilities', '## 10. Stakeholder and system requirements', '## 11. Trace audit and measures']) expect(md).toContain(h)
    expect(md).toContain('NEED-009')
    expect(md).toContain('**Record status:** complete')
    expect(fileStem(F())).toBe('team-07-week2')
  })
  it('JSON: format, version, the Week 1 snapshot, seeds and check results', () => {
    const j = modelInputs(F())
    expect(j.format).toBe('week2-model-inputs')
    expect(j.version).toBe(1)
    expect(j.week1?.enterprise).toBe('Riverside Food Bank Network')
    expect(j.requirements[0].seeds).toContain('requirement def')
    expect(j.scenarios[0].seeds).toContain('use case')
    expect(j.moes[0].seeds).toEqual(['attribute (named only)'])
    expect(j.checks.requirements.total).toBe(10)
    expect(j.status).toBe('ready')
  })
  it('round trip: export then import gives the same record', () => {
    const r = F()
    const back = importWeek2(JSON.stringify(modelInputs(r)))
    expect('error' in back).toBe(false)
    expect(normalizeRecord(back)).toEqual(normalizeRecord(r))
  })
  it('import refuses wrong format, version, shapes, duplicate and malformed IDs, with clear messages; never throws', () => {
    const good = () => JSON.parse(JSON.stringify(modelInputs(F())))
    const err = (d: unknown) => {
      const x = importWeek2(typeof d === 'string' ? d : JSON.stringify(d))
      return 'error' in x ? x.error : ''
    }
    expect(err('{bad')).toMatch(/not valid JSON/)
    expect(err(WEEK1_JSON)).toMatch(/Week 1 model-inputs file/)
    expect(err({ format: 'other' })).toMatch(/not a Week 2/)
    expect(err({ ...good(), version: 2 })).toMatch(/version 2/)
    expect(err({ ...good(), scenarios: 'x' })).toMatch(/“scenarios” must be a list/)
    expect(err({ ...good(), requirements: [1] })).toMatch(/“requirements” item 1 is number/)
    const dup = good()
    dup.requirements[1].id = dup.requirements[0].id
    expect(err(dup)).toMatch(/Duplicate ID REQ-STK-001/)
    const bad = good()
    bad.capabilities[0].id = 'CAP-1'
    expect(err(bad)).toMatch(/Unexpected capability IDs in the file: CAP-1/)
    const aero = good()
    aero.week1.enterprise = 'AeroLink'
    expect(err(aero)).toMatch(/AeroLink/)
    for (const junk of ['null', '[]', '"x"', '42', '{"format":"week2-model-inputs","version":1,"scenarios":[{"actors":"x"}]}']) expect(() => importWeek2(junk)).not.toThrow()
  })
  it('normalize never throws on junk', () => {
    for (const junk of [null, 1, 'x', [], { scenarios: 'x' }, { scenarios: [{ steps: 3, alternates: [null] }] }, { requirements: [{ parents: ['NEED-001'] }] }]) expect(() => normalizeRecord(junk)).not.toThrow()
    expect(normalizeRecord({ requirements: [{ id: 'req-stk-001', parents: ['NEED-001', 'CAP-001'] }] }).requirements[0]).toMatchObject({ id: 'REQ-STK-001', parents: 'NEED-001, CAP-001' })
  })
})

describe('review M1: a one-word named subject counts; a pronoun does not', () => {
  const stmt = (statement: string, base = F()) => failed(withReq('REQ-STK-003', { statement }, base), 'REQ-STK-003')
  it('accepts a proper name, an organizational unit, and the enterprise or SoI name in any case', () => {
    expect(stmt('MedFly shall deliver each blood unit to the requesting hospital within 30 min of the request.')).toEqual([])
    expect(stmt('Dispatch shall assign a van to each pantry order within 10 min of its confirmation.')).toEqual([])
    expect(stmt('When an order is short, FreshRoute shall notify the pantry coordinator before the delivery leaves the warehouse.')).toEqual([])
    const named = { ...F(), conops: { ...F().conops, soiName: 'deliveries' } }
    expect(stmt('When an order is short, deliveries shall notify the pantry coordinator before the van leaves.', named)).toEqual([])
    expect(subjectAccepted('MedFly')).toBe(true)
    expect(subjectAccepted('medfly', ['MedFly'])).toBe(true)
  })
  it('still rejects a pronoun, a determiner, a lower-case unnamed word and an empty subject', () => {
    expect(stmt('It shall notify the pantry coordinator of any shortfall before the delivery leaves the warehouse.')).toEqual(['subject'])
    expect(stmt('They shall notify the pantry coordinator of any shortfall before the delivery leaves the warehouse.')).toEqual(['subject'])
    expect(stmt('When an order is short, it shall notify the pantry coordinator before the van leaves.')).toEqual(['subject'])
    expect(stmt('When an order is short, system shall notify the pantry coordinator before the van leaves.')).toEqual(['subject'])
    for (const w of ['', 'This', 'These', 'We', 'You', 'Each', 'the']) expect(subjectAccepted(w), w).toBe(false)
  })
})

describe('review M4: canonical defects no longer count; qualified good requirements still do', () => {
  const r = (patch: Partial<Requirement>) => withReq('REQ-SYS-004', { type: 'functional', method: 'demonstration', ...patch })
  const counts = (patch: Partial<Requirement>) => assessRequirement(req(r(patch), 'REQ-SYS-004'), r(patch)).counts
  it('the four probe defects fail the unmeasurable gate', () => {
    expect(failed(r({ statement: 'The fleet shall maximize availability.', type: 'constraint' }), 'REQ-SYS-004')).toEqual(['unmeasurable'])
    expect(failed(r({ statement: 'The operations system shall not dispatch flights in unsafe weather.' }), 'REQ-SYS-004')).toEqual(['unmeasurable'])
    expect(failed(r({ statement: 'The booking function shall be easy to use for pantry coordinators.' }), 'REQ-SYS-004')).toEqual(['unmeasurable'])
    expect(failed(r({ statement: 'The routing tool shall respond quickly to driver requests.' }), 'REQ-SYS-004')).toEqual(['unmeasurable'])
  })
  it('a bounded value or an owned TBD lets the word stand; false-positive guards stay advisory', () => {
    expect(counts({ statement: 'The routing tool shall respond quickly to driver requests, within 5 s of each request.' })).toBe(true)
    expect(counts({ statement: 'The operations system shall not dispatch a flight in weather outside the approved limits (TBD-01).', tbx: 'U-001' })).toBe(true)
    expect(counts({ statement: 'The booking function shall display the total fare, including every charge, before it accepts a booking confirmation.' })).toBe(true)
    expect(counts({ statement: 'The reporting function shall support the funders’ quarterly template for the delivered weight per district.' })).toBe(true)
    expect(counts({ statement: 'The scheduling function shall schedule no movement before 07:00 and after 20:00 beyond the configured limit.' })).toBe(true)
    expect(unmeasurableTermsIn('A fail-safe breakfast')).toEqual([])
  })
})

describe('review N12: a one-digit TBD gets a well-formed suggestion', () => {
  it('“TBD-1” is told to use TBD-01, and a TBR keeps its own stem', () => {
    const g = (statement: string) => assessRequirement(req(withReq('REQ-STK-004', { statement }), 'REQ-STK-004'), withReq('REQ-STK-004', { statement })).gates.find((x) => x.id === 'tbx-owned')!
    expect(g('The network shall alert the on-call staff to a freezer above TBD-1 within 5 minutes.').message).toMatch(/for example TBD-01\)/)
    expect(g('The network shall alert the on-call staff to a freezer above TBR-1 within 5 minutes.').message).toMatch(/for example TBR-01\)/)
  })
})
