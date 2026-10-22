// Week 9 generator logic, both directions: the readers refuse what they must (JSON in the model field, a text that is
// not a model, AeroLink, a model whose packages were deleted, another file's format) with a reason, and accept the
// fixture team; the generator writes every need and requirement once with its ID as a quoted short name, the derivation
// from each parent with the parent as the original end, the TBD status with its owner, a shared definition only for
// two or more members; it leaves out exactly the references that would not resolve and reports why; a second import of
// its own output regenerates the same text (no duplicates); and a disposition is accepted when it says something and
// refused when it is empty or claims a fix. Uses the fictional food bank fixture, never AeroLink as a team.
import { describe, expect, it } from 'vitest'
import { AEROLINK_MODEL } from '../../content/lectures/week08/aerolinkCase'
import { teamModelInputs } from '../week1/team'
import { TEAM_FIXTURE } from '../week1/teamFixture'
import { week2Fixture } from '../week2/fixture'
import { modelInputs } from '../week2/record'
import { fixtureModel } from '../week8/generated'
import { FIXTURE_CHOICES, FIXTURE_WEEK1_JSON, FIXTURE_WEEK2_JSON, fixture9, phase1Of, stress9 } from './generated'
import { EMPTY_CHOICE, MARK_BEGIN, dispositionProblem, generateModel, readWeek1, readWeek2For9, readWeek8, stripGenerated, traceGrid, traceRows } from './requirements'

const W8 = fixtureModel().model.text

describe('readers', () => {
  it('the fixture Week 8 model is read: stakeholders, concerns, Physical definitions, the enterprise reference', () => {
    const r = readWeek8(W8)
    if ('error' in r) throw new Error(r.error)
    expect(r.model.stakeholders).toHaveLength(8)
    expect(r.model.concerns.length).toBeGreaterThanOrEqual(8)
    expect(r.model.physicalDefs).toContain('Delivery vans and volunteer drivers')
    expect(r.model.entRef).toBe("Context::'ENT-001'")
    expect(r.model.enterpriseName).toBe('Riverside Food Bank Network')
  })
  it('refuses JSON, a text with no package, AeroLink, and a model whose Needs package was deleted, each with a reason', () => {
    expect(readWeek8(FIXTURE_WEEK1_JSON)).toEqual({ error: expect.stringMatching(/JSON file/) })
    expect(readWeek8('hello world')).toEqual({ error: expect.stringMatching(/not a SysML v2 model file/) })
    expect(readWeek8(AEROLINK_MODEL.text)).toEqual({ error: expect.stringMatching(/AeroLink/) })
    const noNeeds = W8.replace(/\tpackage Needs \{[\s\S]*?\n\t\}\n/, '')
    expect(readWeek8(noNeeds)).toEqual({ error: expect.stringMatching(/no top-level Needs package/) })
  })
  it('the Week 1 and Week 2 readers refuse other formats and AeroLink, and accept the fixture', () => {
    expect(readWeek1(FIXTURE_WEEK2_JSON)).toEqual({ error: expect.stringMatching(/not a Week 1 model-inputs file/) })
    const aero = { ...TEAM_FIXTURE, proposal: { ...TEAM_FIXTURE.proposal, name: 'AeroLink Urban Mobility' } }
    expect(readWeek1(JSON.stringify(teamModelInputs(aero, '2026-10-19')))).toEqual({ error: expect.stringMatching(/AeroLink/) })
    expect('record' in readWeek1(FIXTURE_WEEK1_JSON)).toBe(true)
    expect(readWeek2For9(FIXTURE_WEEK1_JSON)).toEqual({ error: expect.stringMatching(/Week 1 model-inputs file/) })
    const r = week2Fixture()
    r.week1 = { ...r.week1!, enterprise: 'AeroLink Urban Mobility' }
    expect(readWeek2For9(JSON.stringify(modelInputs(r)))).toEqual({ error: expect.stringMatching(/AeroLink/) })
    expect('record' in readWeek2For9(FIXTURE_WEEK2_JSON)).toBe(true)
  })
})

describe('generation on the fixture team', () => {
  const { p1, model } = fixture9()
  const t = model.text
  it('every need, objective and requirement appears once, with its ID as a quoted short name', () => {
    for (const id of [...p1.objectives.map((o) => o.id), ...p1.needs.map((n) => n.id), ...p1.requirements.map((r) => r.id)]) {
      expect(t.split(`requirement <'${id}'>`).length - 1, id).toBe(1)
      expect(model.included.has(id), id).toBe(true)
    }
  })
  it('each parent link to a need or requirement is a derivation with the parent as the original end; capability links wait', () => {
    expect(t).toContain("#derivation connection 'REQ-STK-001 derives from NEED-001' {\n\t\t\tend #original ::> Needs::'NEED-001';\n\t\t\tend #derive ::> 'REQ-STK-001';")
    expect(t).toContain("end #original ::> 'REQ-STK-004';\n\t\t\tend #derive ::> 'REQ-SYS-001';")
    expect(model.derivations.every((d) => !d.original.startsWith('CAP-'))).toBe(true)
    expect(model.pendingCaps.map((d) => d.original)).toContain('CAP-001')
  })
  it('a TBD requirement keeps its constraint and carries StatusInfo with the owner from the Week 2 register', () => {
    const block = t.slice(t.indexOf("requirement <'REQ-STK-004'>"), t.indexOf("requirement <'REQ-STK-005'>"))
    expect(block).toContain('require constraint { enterprise.freezerAlarmTime <= maxFreezerAlarmTime }')
    expect(block).toContain('@StatusInfo { status = StatusKind::tbd; owner = "Warehouse manager"; }')
  })
  it('two requirements marked shared with one quantity and comparison make one shared definition', () => {
    expect(model.sharedDefs).toEqual([{ name: 'DurationUpperLimit', members: ['REQ-SYS-001', 'REQ-SYS-002'] }])
    expect(t).toContain("requirement <'REQ-SYS-001'> 'Freezer sampling interval' : DurationUpperLimit {")
    expect(t).toContain('attribute :>> measured = temperatureMonitoring.sampleInterval;')
  })
  it('the measured features are added to their subjects, and placeholders are written in their packages between markers', () => {
    expect(t).toMatch(/part def <'ENT-001'> 'Riverside Food Bank Network' \{[\s\S]*?attribute maxFoodTemperature : ThermodynamicTemperatureValue;/)
    expect(t).toMatch(/package Logical \{[\s\S]*?part def 'Temperature monitoring' \{[\s\S]*?attribute sampleInterval : DurationValue;/)
    expect(t).toMatch(/part def 'Delivery vans and volunteer drivers' \{[\s\S]*?attribute cargoTemperature : ThermodynamicTemperatureValue;/)
    expect(t.split(MARK_BEGIN).length - 1).toBeGreaterThanOrEqual(5)
  })
  it('the trace matrix is read from the derivations: needs without a stakeholder requirement are reported, never hidden', () => {
    const rows = traceRows(p1, model)
    expect(rows.find((r) => r.need === 'NEED-001')!.stkReqs).toEqual(['REQ-STK-001'])
    expect(rows.filter((r) => r.status === 'childless').map((r) => r.need)).toEqual(['NEED-003', 'NEED-007', 'NEED-008', 'NEED-009'].filter((n) => !p1.requirements.some((q) => q.level === 'stakeholder' && q.parents.includes(n))))
    const g = traceGrid(p1, model)
    expect(g.rows.find((r) => r.need === 'NEED-001')!.cells[g.cols.indexOf('REQ-STK-001')]).toBe(true)
    expect(model.findings.filter((f) => f.code === 'childless-need').map((f) => f.id)).toEqual(rows.filter((r) => r.status === 'childless').map((r) => r.need))
  })
  it('a second import of the generated file regenerates exactly the same text (nothing duplicated)', () => {
    const again = readWeek8(t)
    if ('error' in again) throw new Error(again.error)
    expect(generateModel(again.model, p1, FIXTURE_CHOICES, {}, { date: '2026-10-21' }).text).toBe(t)
    expect(stripGenerated(t)).not.toContain(MARK_BEGIN)
  })
})

describe('gaps and defects, both directions', () => {
  const base = () => {
    const r = readWeek8(W8)
    if ('error' in r) throw new Error(r.error)
    return { w8: r.model, p1: phase1Of(FIXTURE_WEEK1_JSON, FIXTURE_WEEK2_JSON) }
  }
  it('a system requirement with no subject chosen, or with the enterprise as subject, is reported', () => {
    const { w8, p1 } = base()
    const g = generateModel(w8, p1, { ...FIXTURE_CHOICES, 'REQ-SYS-004': { ...EMPTY_CHOICE }, 'REQ-SYS-003': { ...FIXTURE_CHOICES['REQ-SYS-003'], subject: 'enterprise' } })
    expect(g.findings.map((f) => `${f.code}:${f.id}`)).toEqual(expect.arrayContaining(['sys-no-subject:REQ-SYS-004', 'sys-enterprise-subject:REQ-SYS-003', 'sys-doc-only:REQ-SYS-004']))
    expect(generateModel(w8, p1, FIXTURE_CHOICES).findings.filter((f) => f.code.startsWith('sys-'))).toEqual([])
  })
  it('a lone shared requirement is written directly and reported; a non-number limit and a fractional count are refused with a reason', () => {
    const { w8, p1 } = base()
    const g = generateModel(w8, p1, { ...FIXTURE_CHOICES, 'REQ-SYS-002': { ...FIXTURE_CHOICES['REQ-SYS-002'], form: 'direct' }, 'REQ-STK-003': { ...FIXTURE_CHOICES['REQ-STK-003'], value: '1.5' }, 'REQ-STK-005': { ...FIXTURE_CHOICES['REQ-STK-005'], value: 'two' } })
    expect(g.sharedDefs).toEqual([])
    expect(g.findings.find((f) => f.code === 'shared-single')?.id).toBe('REQ-SYS-001')
    expect(g.formal.get('REQ-STK-003')).toEqual({ ok: false, why: 'a count must be a whole number of zero or more' })
    expect(g.formal.get('REQ-STK-005')).toEqual({ ok: false, why: 'the limit “two” is not a number' })
  })
  it('a stakeholder or concern that is not in the model is left out as a defect; a parent that does not exist too', () => {
    const { w8, p1 } = base()
    const q = structuredClone(p1)
    q.needs[3].stakeholders.push('STK-099')
    q.needs[3].concerns.push('CON-099')
    q.requirements[0].parents.push('NEED-077')
    const g = generateModel(w8, q, FIXTURE_CHOICES)
    expect(g.findings.filter((f) => f.cls === 'defect').map((f) => f.code)).toEqual(['need-stk-missing', 'need-con-missing', 'parent-missing'])
    expect(g.text).not.toContain("'STK-099'")
    expect(g.text).not.toContain("'CON-099'")
    expect(g.text).not.toContain("'NEED-077'")
    expect(g.excluded).toEqual(['NEED-004→STK-099', 'NEED-004→CON-099', 'REQ-STK-001→NEED-077'])
  })
  it('the adversarial set generates twice to the same text, with the package-name shadowing reported and references qualified from the root', () => {
    const s = stress9()
    expect(s.model.text).toBe(s.first.text)
    expect(s.model.findings.some((f) => f.code === 'name-shadow' && f.id === 'NAMES')).toBe(true)
    expect(s.model.text).toContain("Co Model'::Stakeholders::'STK-001';")
    expect(s.model.formal.get('REQ-STK-006')).toMatchObject({ ok: true, feature: 'resultValue' })
  })
})

describe('dispositions', () => {
  it('short dispositions that say something are accepted', () => {
    for (const ok of ['Open item: Week 10, JS', 'No child needed: fare policy', 'Defer to Week 11 (AK)', 'Kept: met by procedure']) expect(dispositionProblem(ok), ok).toBeNull()
  })
  it('empty answers and claims of a fix are refused, each with the reason shown to the student', () => {
    for (const bad of ['', '  ', 'none', 'n/a', 'TBD', 'later', 'n/a todo']) expect(dispositionProblem(bad), bad).toMatch(/not a disposition/)
    for (const claim of ['Fixed', 'Resolved in Week 2', 'Done', 'Corrected in the record']) expect(dispositionProblem(claim), claim).toMatch(/reads as a fix/)
  })
  it('a plan in the future or modal form is not a claimed fix (review m6)', () => {
    for (const plan of ['Open item: to be resolved in Week 10 (owner: Architecture lead)', 'Open item: to be done with the vertiport layout, AK', 'Will be corrected once the layout is fixed (JS, Week 11)']) expect(dispositionProblem(plan), plan).toBeNull()
    expect(dispositionProblem('Resolved. To be reviewed in Week 10')).toMatch(/reads as a fix/)
  })
})
