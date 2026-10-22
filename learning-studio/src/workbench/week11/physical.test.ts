// Week 11 lab tool logic, both directions: the readers refuse what is not a team's Week 10 model or Week 5 export (with a
// reason) and accept what is; the generator writes every physical element, component, interface, allocation and claim
// the sources and choices call for, keeps model v0.3 whole, re-imports idempotently, continues IDs after the highest and
// never renumbers (a colliding ID is reported and left out); every finding fires on the input built to trigger it and not
// on the clean fixture. Uses the fictional food bank fixture and an adversarial record, never AeroLink as a team.
import { describe, expect, it } from 'vitest'
import { AEROLINK_W10_MODEL } from '../../content/lectures/week10/aerolinkCase'
import { AEROLINK_PHYS, AEROLINK_W10, AEROLINK_W11_CHOICES } from '../../content/lectures/week11/aerolinkCase'
import { fixture10 } from '../week10/generated'
import { FIXTURE_WEEK4_JSON } from '../week10/generated'
import { fixture9 } from '../week9/generated'
import { FIXTURE11_CHOICES, FIXTURE_WEEK5_JSON, fixture11, physOf, stress11 } from './generated'
import { EMPTY_CHOICES, MARK_BEGIN, MARK_END, VALUE, basisProblem, findingKey, limitOf, meetsLimit, claimsCompletion, defaultFlows, dispositionProblem, generateModel, needsDisposition, nextInfoId, parseModel, readWeek10, readWeek5For11, stripGenerated, suggestedFunctions } from './physical'

const F = fixture11()
const codes = (g: { findings: { code: string; id: string }[] }) => g.findings.map((f) => `${f.code}:${f.id}`)
const gen = (patch: Partial<typeof FIXTURE11_CHOICES>) => generateModel(F.w10, F.phys, { ...FIXTURE11_CHOICES, ...patch })

describe('Week 11 readers', () => {
  it('the Week 10 field refuses JSON, Markdown, a model without a logical architecture, AeroLink and text with no package', () => {
    expect(readWeek10(FIXTURE_WEEK5_JSON)).toMatchObject({ error: expect.stringMatching(/JSON file/) })
    expect(readWeek10('# Week 10 behavior review\n| a | b |')).toMatchObject({ error: expect.stringMatching(/Markdown/) })
    expect(readWeek10(fixture9().model.text)).toMatchObject({ error: expect.stringMatching(/no logical architecture/) })
    expect(readWeek10(AEROLINK_W10_MODEL.text)).toMatchObject({ error: expect.stringMatching(/AeroLink/) })
    expect(readWeek10('hello')).toMatchObject({ error: expect.stringMatching(/No package/) })
  })
  it('the Week 10 field accepts the team’s model v0.3 and the v0.4 the tool wrote', () => {
    const a = readWeek10(fixture10().model.text)
    expect('model' in a && a.model.logical.length).toBe(5)
    const b = readWeek10(F.model.text)
    expect('model' in b && b.model.rootName).toBe('model' in a && a.model.rootName)
    expect('model' in b && b.model.logical.length).toBe(5)
  })
  it('the Week 5 field refuses invalid JSON, a Week 4 file, a Week 10 workspace, a file with no format and an AeroLink record', () => {
    expect(readWeek5For11('{')).toMatchObject({ error: expect.stringMatching(/not valid JSON/) })
    expect(readWeek5For11(FIXTURE_WEEK4_JSON)).toMatchObject({ error: expect.stringMatching(/Week 4 model-inputs file/) })
    expect(readWeek5For11(JSON.stringify({ format: 'week10-behavior', version: 1 }))).toMatchObject({ error: expect.stringMatching(/Week 10 workspace/) })
    expect(readWeek5For11(JSON.stringify({ team: '07' }))).toMatchObject({ error: expect.stringMatching(/no “format”/) })
    const aero = JSON.parse(FIXTURE_WEEK5_JSON)
    aero.week4.enterprise = 'AeroLink Urban Mobility'
    expect(readWeek5For11(JSON.stringify(aero))).toMatchObject({ error: expect.stringMatching(/AeroLink/) })
    expect('record' in readWeek5For11(FIXTURE_WEEK5_JSON)).toBe(true)
  })
})

describe('Week 11 generator: the fixture team', () => {
  const t = F.model.text
  it('writes every physical element as a part usage with its ID, its components nested, and the functions it performs', () => {
    for (const p of F.phys.physical) expect(t, p.id).toContain(`part <'${p.id}'>`)
    for (const c of F.phys.components) expect(t, c.id).toContain(`part <'${c.id}'>`)
    expect(F.model.parts.reduce((a, p) => a + p.components.length, 0)).toBe(F.phys.components.length)
    expect(F.model.placements.map((p) => p.fn).sort()).toEqual(F.w10.functions.map((f) => f.id).sort())
  })
  it('every Week 5 interface appears once: physical and information ones as interfaces with ports, organizational ones as connections', () => {
    for (const x of F.phys.interfaces) {
      const kw = x.kind === 'organizational' ? 'connection' : 'interface'
      expect(t.split(`${kw} <'${x.id}'>`).length - 1, x.id).toBe(1)
    }
    for (const x of F.model.interfaces.filter((y) => y.portDef)) {
      expect(t).toContain(`port def '${x.portDef}'`)
      expect(t).toMatch(new RegExp(`end port \\w+ : ~'${x.portDef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}';`))
    }
  })
  it('allocates each logical element to every physical element that performs one of its functions, with a nested allocation per function', () => {
    for (const a of F.model.allocations) for (const fn of a.fns) expect(F.model.parts.find((p) => p.id === a.phy)!.performs).toContain(fn)
    expect(F.model.allocations.reduce((n, a) => n + a.fns.length, 0)).toBe(F.model.placements.filter((p) => F.w10.logical.some((l) => l.performs.includes(p.fn))).length)
  })
  it('the interface requirements the model lacked are written with the interface definition as subject, derived and allocated', () => {
    expect(F.model.addedReqs).toEqual(F.phys.requirements.map((q) => q.id))
    for (const q of F.phys.requirements) {
      expect(t).toContain(`requirement <'${q.id}'>`)
      expect(F.model.reqAllocations.some((a) => a.req === q.id && a.to === q.interface)).toBe(true)
      for (const p of q.parents) expect(t).toContain(`'${q.id} derives from ${p}'`)
    }
  })
  it('nothing is left out, and model v0.3 is kept whole: removing the Week 11 regions and the rename gives it back', () => {
    expect(F.model.findings.filter((f) => f.cls === 'defect')).toEqual([])
    const back = stripGenerated(t).split("'Riverside Food Bank Network Model v0.4'").join("'Riverside Food Bank Network Model v0.3'")
    expect(back.replace(/\n$/, '')).toBe(stripGenerated(fixture10().model.text).replace(/\n$/, ''))
    expect(t.split(MARK_BEGIN).length).toBe(t.split(MARK_END).length)
  })
  it('the information items added this week take the next IDs after the highest the Week 5 file and model hold', () => {
    const first = Number(nextInfoId(F.phys, F.w10, 0).slice(5))
    expect(F.model.issued).toEqual(FIXTURE11_CHOICES.newItems.filter((x) => x.id).map((_, i) => `INFO-${String(first + i).padStart(3, '0')}`))
    expect(first).toBe(Math.max(...F.phys.information.map((x) => Number(x.id.slice(5))), F.w10.maxInfo) + 1)
  })
  it('re-importing the generated file and generating again changes nothing (idempotent)', () => {
    const again = readWeek10(F.model.text)
    if (!('model' in again)) throw new Error('re-import failed')
    expect(generateModel(again.model, F.phys, FIXTURE11_CHOICES, { date: '2026-10-22' }).text).toBe(F.model.text)
  })
})

describe('Week 11 generator: findings fire on the input built for them', () => {
  it('a part definition left unlinked is a gap that needs a disposition', () => {
    const f = F.model.findings.find((x) => x.code === 'placeholder-unlinked')!
    expect(f.id).toBe('Donation intake desk')
    expect(needsDisposition(f)).toBe(true)
  })
  it('a crossing that names no item is a defect and the crossing is left out; naming an existing item clears it', () => {
    const bad = gen({ flows: { ...FIXTURE11_CHOICES.flows, 'IF-005': [{ item: 'Nothing like this', dir: 'AtoB' }] } })
    expect(codes(bad)).toContain('flow-item-missing-nothinglikethis:IF-005')
    expect(bad.interfaces.find((x) => x.id === 'IF-005')!.flows).toEqual([])
    expect(codes(gen({}))).not.toContain('flow-item-missing-nothinglikethis:IF-005')
  })
  it('a direction the record does not give is assumed and flagged; setting the rows clears it', () => {
    const noRows = gen({ flows: {} })
    expect(codes(noRows)).toContain('flow-direction-assumed:IF-003')
    expect(codes(gen({}))).not.toContain('flow-direction-assumed:IF-003')
  })
  it('the default direction of an information item comes from its Week 4 producer', () => {
    const x = F.phys.interfaces.find((y) => y.id === 'IF-002')!
    const d = defaultFlows(x, F.phys)
    expect(d.rows).toContainEqual({ item: 'INFO-003', dir: 'AtoB' })
    expect(d.assumed).toBe(false)
  })
  it('a crossing set against its Week 4 producer is a gap; the producer’s direction is not', () => {
    const rev = gen({ flows: { ...FIXTURE11_CHOICES.flows, 'IF-002': [{ item: 'INFO-003', dir: 'BtoA' }] } })
    expect(codes(rev)).toContain('flow-against-producer:IF-002 INFO-003')
    expect(codes(gen({ flows: { ...FIXTURE11_CHOICES.flows, 'IF-002': [{ item: 'INFO-003', dir: 'AtoB' }] } }))).not.toContain('flow-against-producer:IF-002 INFO-003')
  })
  it('removing the only crossing of an information item between two elements reports the uncovered flow', () => {
    const cut = gen({ flows: { ...FIXTURE11_CHOICES.flows, 'IF-002': [], 'IF-003': [] } })
    expect(cut.findings.some((f) => f.code === 'crossing-uncovered' && f.id.startsWith('INFO-003'))).toBe(true)
    expect(F.model.findings.some((f) => f.code === 'crossing-uncovered')).toBe(false)
  })
  it('an interface requirement with no confirmed functions is allocated to the suggested ones and flagged; typed functions are used', () => {
    const sug = generateModel(AEROLINK_W10, AEROLINK_PHYS, { ...AEROLINK_W11_CHOICES, reqFns: {} })
    expect(sug.findings.some((f) => f.code === 'req-fn-assumed' && f.id === 'REQ-SYS-013')).toBe(true)
    expect(sug.reqAllocations).toContainEqual({ req: 'REQ-SYS-013', to: 'FN-012' })
    expect(gen({ reqFns: {} }).findings.some((f) => f.code === 'req-no-function' || f.code === 'req-fn-assumed')).toBe(true)
    expect(F.model.findings.some((f) => f.code === 'req-fn-assumed')).toBe(false)
    expect(F.model.reqAllocations).toContainEqual({ req: 'REQ-SYS-005', to: 'FN-006' })
  })
  it('the suggested functions are the ones at the interface’s ends whose parameters use an item it carries', () => {
    const x = F.phys.interfaces.find((y) => y.id === 'IF-002')!
    expect(suggestedFunctions(F.w10, F.phys, x, [{ item: 'INFO-003', dir: 'AtoB' }])).toEqual(F.w10.functions.filter((f) => f.items.includes('INFO-003') && ['PHY-002', 'PHY-004'].includes(F.phys.functions.find((y) => y.id === f.id)?.phy ?? '')).map((f) => f.id))
  })
  it('a satisfy claim on a part of another type is left out with the reason; a conforming one writes the design value', () => {
    const wrong = gen({ satisfy: [{ req: 'REQ-SYS-003', by: 'PHY-001', attribute: 'cargoTemperature', value: '4', basis: 'x y' }] })
    expect(codes(wrong)).toContain('satisfy-nonconforming:REQ-SYS-003:PHY-001')
    expect(wrong.text).not.toMatch(/satisfy Requirements::'REQ-SYS-003' by physicalArchitecture\.freezerSensors/)
    expect(F.model.text).toContain("attribute :>> cargoTemperature = 4 ['°C'];")
    expect(F.model.text).toMatch(/satisfy Requirements::'REQ-SYS-003' by physicalArchitecture\.refrigeratedVans \{ doc/)
  })
  it('a claim without a basis or with an unreadable value is a gap; fewer claims than the minimum is a gap', () => {
    const noBasis = gen({ satisfy: [{ ...FIXTURE11_CHOICES.satisfy[0], basis: 'n/a n/a' }] })
    expect(codes(noBasis)).toContain('satisfy-no-basis:REQ-SYS-003:PHY-002')
    expect(codes(noBasis)).toContain('satisfy-minimum:SATISFY')
    const unreadable = gen({ satisfy: [{ ...FIXTURE11_CHOICES.satisfy[0], value: 'cold' }] })
    expect(codes(unreadable)).toContain('satisfy-value-unreadable:REQ-SYS-003:PHY-002')
    expect(codes(F.model)).not.toContain('satisfy-minimum:SATISFY')
  })
  it('a function with no placement is a trace finding; a placement on a missing element is a defect', () => {
    expect(codes(gen({ fnPhy: {} }))).toContain('fn-no-physical:FN-011')
    expect(codes(gen({ fnPhy: { 'FN-011': 'PHY-077' } }))).toContain('fn-phy-missing:FN-011')
  })
})

describe('Week 11 generator: the adversarial record', () => {
  const S = stress11()
  it('re-import is idempotent on the adversarial model', () => {
    expect(S.model.text).toBe(S.first.text)
  })
  it('an external ID that names a different external in the model is reported and its interfaces left out; no ID is renumbered', () => {
    expect(S.model.findings.filter((f) => f.code === 'ext-collision').map((f) => f.id)).toEqual(['EXT-001', 'EXT-002', 'EXT-003', 'EXT-004'])
    expect(S.model.interfaces.map((x) => x.id)).not.toContain('IF-003')
    const extIds = [...S.model.text.matchAll(/<'(EXT-\d{3})'>/g)].map((m) => m[1])
    const known = new Set([...S.w10.externals.map((x) => x.id), ...S.phys.externals.map((x) => x.id)])
    expect(extIds.every((id) => known.has(id))).toBe(true)
  })
  it('a requirement ID that names a different requirement in the model is reported, not written', () => {
    expect(codes(S.model)).toContain('req-collision:REQ-SYS-001')
    expect(S.model.text.split("requirement <'REQ-SYS-001'>").length - 1).toBe(1)
  })
  it('names like packages are qualified from the root; repeats are renamed with their ID', () => {
    expect(codes(S.model)).toContain('name-clash:NAMES')
    expect(S.model.text).toMatch(/perform 'O\\'Neil "Quick" Relief \\\\ Network \*\/ Co Model'::Logical::'FN-005';/)
    expect(S.model.text).toContain("interface def 'Requirements' {")
  })
  it('each other defect fires: orphan component, missing end, taken item ID, missing function, missing requirement', () => {
    for (const c of ['cmp-parent-missing:CMP-099', 'end-missing:IF-099', 'item-id-taken:INFO-001', 'req-fn-missing-FN-099:REQ-SYS-005', 'satisfy-req-missing:REQ-SYS-099:PHY-002', 'req-part-missing-PHY-088:REQ-STK-001']) expect(codes(S.model), c).toContain(c)
  })
})

describe('Week 11 short answers', () => {
  it('a disposition: a plan or a reason is valid; an empty answer or a claimed fix is not; an adjective is not a claim', () => {
    for (const v of ['Open item: Week 12 (JS)', 'Kept', 'To be resolved in Week 12, owner JS', 'Closed site at night: no function']) expect(dispositionProblem(v), v).toBeNull()
    for (const v of ['', 'none none', 'Fixed', 'Done.', 'Resolved in Week 4', 'The gap is fixed now', 'We fixed it']) expect(dispositionProblem(v), v).not.toBeNull()
    expect(claimsCompletion('Closed site at night')).toBe(false)
    expect(claimsCompletion('closed the gap')).toBe(true)
  })
  it('a basis is any said answer; a design value is a number with an optional bracketed unit', () => {
    expect(basisProblem('Data sheet')).toBeNull()
    expect(basisProblem('tbd, later')).not.toBeNull()
    for (const v of ['18 [min]', '63.5 [dB]', '0.2', "4 ['°C']"]) expect(VALUE.test(v), v).toBe(true)
    for (const v of ['cold', '18 minutes', '[min]', '']) expect(VALUE.test(v), v).toBe(false)
  })
  it('the physical source reads the Week 5 JSON as the tool does', () => {
    const p = physOf(FIXTURE_WEEK5_JSON)
    expect(p.physical.map((x) => x.id)).toEqual(['PHY-001', 'PHY-002', 'PHY-003', 'PHY-004', 'PHY-005'])
    expect(p.externals.slice(0, 6).every((x) => x.origin === 'Week 1')).toBe(true)
    expect(parseModel(F.model.text)).toHaveProperty('model')
    expect(generateModel(F.w10, F.phys, EMPTY_CHOICES).findings.some((f) => f.code === 'satisfy-minimum')).toBe(true)
  })
})

describe('Week 11 review fixes (N1, N2, N3, m5)', () => {
  it('N1: a satisfy claim whose own design value violates the requirement’s limit is a finding, is left out and does not count', () => {
    expect(limitOf("attribute maxCargoTemperature : ThermodynamicTemperatureValue = 5 ['°C'];\nrequire constraint { vans.cargoTemperature <= maxCargoTemperature }")).toEqual({ attr: 'cargoTemperature', op: '<=', value: 5, unit: '°C' })
    expect(limitOf('require constraint { 7.0 <= x.flow }')).toEqual({ attr: 'flow', op: '>=', value: 7, unit: '' })
    expect(limitOf('require constraint { a.b <= c.d }')).toBeUndefined()
    const lim = { attr: 'cargoTemperature', op: '<=' as const, value: 5, unit: '°C' }
    expect(meetsLimit("4 ['°C']", lim)).toBe(true)
    expect(meetsLimit("25 ['°C']", lim)).toBe(false)
    expect(meetsLimit('25 [K]', lim)).toBe('unit')
    const hot = gen({ satisfy: [{ ...FIXTURE11_CHOICES.satisfy[0], value: "25 ['°C']" }, FIXTURE11_CHOICES.satisfy[1]] })
    expect(codes(hot)).toContain('satisfy-value-violates:REQ-SYS-003:PHY-002')
    expect(codes(hot)).toContain('satisfy-minimum:SATISFY')
    expect(hot.text).not.toContain("cargoTemperature = 25")
    expect(hot.text).not.toMatch(/satisfy Requirements::'REQ-SYS-003'/)
    expect(codes(gen({ satisfy: [{ ...FIXTURE11_CHOICES.satisfy[0], value: '4 [K]' }] }))).toContain('satisfy-value-unit:REQ-SYS-003:PHY-002')
    expect(codes(F.model).filter((c) => c.startsWith('satisfy-value'))).toEqual([])
  })
  it('N2: the same finding on two rows of one interface gets distinct codes, so every finding key is unique', () => {
    const g = gen({ flows: { ...FIXTURE11_CHOICES.flows, 'IF-001': [{ item: '', dir: 'AtoB' }, { item: '', dir: 'AtoB' }, { item: 'nothing like it', dir: 'BtoA' }, { item: 'nothing like it', dir: 'AtoB' }] } })
    const keys = g.findings.map(findingKey)
    expect(new Set(keys).size).toBe(keys.length)
    expect(g.findings.filter((f) => f.id === 'IF-001' && f.code.startsWith('flow-item-missing-empty')).map((f) => f.code)).toEqual(['flow-item-missing-empty', 'flow-item-missing-empty-2'])
    for (const m of [F.model, stress11().model]) expect(new Set(m.findings.map(findingKey)).size).toBe(m.findings.length)
  })
  it('N3: two allocation rows with the same requirement keep both rows’ elements and raise a finding', () => {
    const g = gen({ reqParts: [{ row: 1, req: 'REQ-STK-001', els: 'PHY-002' }, { row: 2, req: 'req-stk-001', els: 'PHY-005' }] })
    expect(g.reqAllocations.filter((a) => a.req === 'REQ-STK-001').map((a) => a.to)).toEqual(['PHY-002', 'PHY-005'])
    expect(codes(g)).toContain('req-part-duplicate:REQ-STK-001')
    expect(codes(gen({ reqParts: [{ row: 1, req: 'REQ-STK-001', els: 'PHY-002' }] }))).not.toContain('req-part-duplicate:REQ-STK-001')
  })
  it('m5: a model whose root package is never closed is refused', () => {
    const text = fixture10().model.text.replace(/\}\s*$/, '\n')
    expect(readWeek10(text)).toMatchObject({ error: expect.stringMatching(/not closed/) })
    expect('model' in readWeek10(fixture10().model.text)).toBe(true)
  })
})
