// Week 8 lab tool logic, both directions: good exports import (Week 1 versions 1–3 and Week 2), bad files are refused
// with a message and nothing throws; a dangling relationship is the only defect and is left out of the generated text,
// while the valid fixture has none; every gap fires on a mutated record and not on the fixture; generated names and
// documentation are escaped; the output is deterministic; the mapping and the audit numbers follow the data.
import { describe, expect, it } from 'vitest'
import { teamModelInputs, type TeamRecord } from '../week1/team'
import { TEAM_FIXTURE } from '../week1/teamFixture'
import { AEROLINK_MODEL, AEROLINK_SOURCE, AEROLINK_SUMMARY } from '../../content/lectures/week08/aerolinkCase'
import { MAPPING_KINDS, MODEL_PACKAGES, REL_KEYWORDS, dependencyEnds } from '../../content/lectures/week08/labBrief'
import { CONCERNS, EXTERNAL_SYSTEMS, RELATIONSHIPS, STAKEHOLDERS } from '../../content/lectures/week01/aerolinkCase'
import { auditFindings, auditSummary, basicName, compact, CONCERN_INHERITED, docText, generateSysml, importFile, mappingMatrix, namePlan, quoted, readWeek2, RESERVED, type ImportSource } from './skeleton'
import { collisionModel, stressModel } from './generated'

const json = (t: TeamRecord = TEAM_FIXTURE) => JSON.stringify(teamModelInputs(t, '2026-10-19'))
const src = (t: TeamRecord = TEAM_FIXTURE): ImportSource => {
  const r = importFile(json(t))
  if ('error' in r || r.kind !== 'week1') throw new Error('fixture must import')
  return r.source
}
const mutate = (f: (t: TeamRecord) => void) => {
  const t = structuredClone(TEAM_FIXTURE)
  f(t)
  return src(t)
}
const codes = (s: ImportSource) => auditFindings(s).map((f) => f.code)
const week2Json = (extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    format: 'week2-model-inputs',
    version: 1,
    team: '07',
    week1: { team: '07', enterprise: 'Riverside Food Bank Network', domain: 'Food', soi: 'The service', mission: 'Deliver food', goals: [{ id: 'MGO-002', statement: 'Stocked shelves' }], stakeholders: [{ id: 'STK-001', name: 'Families' }], needs: [{ id: 'NEED-001', name: 'Produce' }] },
    scenarios: [{ id: 'SCN-001', name: 'Weekly delivery' }],
    capabilities: [{ id: 'CAP-001', name: 'Allocate stock' }],
    requirements: [{ id: 'REQ-STK-001', name: 'Produce until closing' }, { id: 'REQ-SYS-001', name: 'Cold chain' }],
    moes: [{ id: 'MOE-001', name: 'Fill rate' }],
    mops: [],
    uncertainties: [{ id: 'U-001', name: 'Demand' }, { id: 'A-001', name: 'Volunteers' }],
    needsAdded: [],
    ...extra,
  })

describe('importFile: good input is accepted', () => {
  it('reads the Week 1 model inputs, version 3', () => {
    const s = src()
    expect(s.origin).toBe('Week 1 model inputs, version 3')
    expect(s.stakeholders).toHaveLength(8)
    expect(s.concerns).toHaveLength(8)
    expect(s.context).toHaveLength(6)
    expect(s.relationships).toHaveLength(3)
    expect(s.inside.map((x) => x.id)).toEqual(['PRT-001', 'PRT-002', 'PRT-003', 'PRT-004'])
    expect(s.charterPrefixes).toEqual(expect.arrayContaining(['STK', 'INFO', 'AI', 'VER']))
  })
  it('reads version 2 (no mission and goals list, one free-text conflict) and version 1 (concern owner as `stakeholder`)', () => {
    const d = JSON.parse(json())
    delete d.missionGoals
    delete d.relationships
    d.conflicts = [{ text: 'STK-007 neighbors conflict with STK-004 drivers over early loading.' }]
    for (const v of [2, 1]) {
      const x = { ...structuredClone(d), version: v }
      if (v === 1) x.concerns = x.concerns.map((c: { stakeholders: string[] }) => ({ ...c, stakeholder: c.stakeholders[0], stakeholders: undefined }))
      const r = importFile(JSON.stringify(x))
      expect('error' in r, JSON.stringify(r).slice(0, 200)).toBe(false)
      if (!('error' in r) && r.kind === 'week1') {
        expect(r.source.origin).toBe(`Week 1 model inputs, version ${v}`)
        expect(r.source.concerns).toHaveLength(8)
        expect(r.source.relationships).toEqual([expect.objectContaining({ from: 'STK-007', to: 'STK-004', type: 'conflicts-with' })])
      }
    }
  })
  it('reads the Week 2 model inputs: the IDs and the embedded Week 1 snapshot', () => {
    const r = importFile(week2Json())
    expect('error' in r).toBe(false)
    if ('error' in r || r.kind !== 'week2') return
    expect(r.week2.requirements.map((x) => x.id)).toEqual(['REQ-STK-001', 'REQ-SYS-001'])
    expect(r.snapshotOnly?.stakeholders).toEqual([expect.objectContaining({ id: 'STK-001', name: 'Families' })])
    expect(r.snapshotOnly?.concerns).toEqual([])
    // a snapshot-only source reports the missing concerns as a gap
    expect(codes(r.snapshotOnly!)).toContain('no-concerns')
  })
})

describe('importFile: bad input is refused with a message, never thrown', () => {
  it('refuses broken JSON, another format, a wrong version, AeroLink, duplicate and malformed IDs, non-list shapes', () => {
    expect(importFile('{nope')).toEqual({ error: expect.stringMatching(/not valid JSON/) })
    expect(importFile('{"format":"something-else"}')).toEqual({ error: expect.stringMatching(/not a Week 1 or Week 2/) })
    expect(importFile(JSON.stringify({ ...JSON.parse(json()), version: 4 }))).toEqual({ error: expect.stringMatching(/version 1, 2 or 3/) })
    expect(importFile(week2Json({ version: 2 }))).toEqual({ error: expect.stringMatching(/version 2/) })
    const aero = structuredClone(TEAM_FIXTURE)
    aero.proposal.name = 'AeroLink Urban Mobility'
    expect(importFile(json(aero))).toEqual({ error: expect.stringMatching(/AeroLink/) })
    expect(importFile(week2Json({ week1: { enterprise: 'AeroLink Urban Mobility' } }))).toEqual({ error: expect.stringMatching(/AeroLink/) })
    const dup = JSON.parse(json())
    dup.stakeholders[1].id = 'STK-001'
    expect(importFile(JSON.stringify(dup))).toEqual({ error: expect.stringMatching(/Duplicate ID STK-001|names STK-002/) })
    const bad = JSON.parse(json())
    bad.context[0].id = 'X-1'
    expect(importFile(JSON.stringify(bad))).toEqual({ error: expect.stringMatching(/Unexpected EXT IDs/) })
    expect(importFile(week2Json({ scenarios: { id: 'SCN-001' } }))).toEqual({ error: expect.stringMatching(/must be a list/) })
    expect(importFile(week2Json({ scenarios: [{ id: 'SCN-1' }] }))).toEqual({ error: expect.stringMatching(/not in the course form/) })
    expect(importFile(week2Json({ capabilities: [{ id: 'CAP-001' }, { id: 'CAP-001' }] }))).toEqual({ error: expect.stringMatching(/Duplicate ID CAP-001/) })
    expect(readWeek2('{"format":"week1-model-inputs"}')).toEqual({ error: expect.stringMatching(/not a Week 2/) })
  })
  it('never throws on junk', () => {
    for (const junk of ['', 'null', '[]', '"x"', '42', '{"format":"week1-model-inputs","version":3,"stakeholders":"x"}', '{"format":"week2-model-inputs","version":1,"week1":5}', '{"format":"week1-model-inputs","version":3,"concerns":[{"id":"CON-001","stakeholders":["STK-009"]}]}'])
      expect(() => importFile(junk)).not.toThrow()
  })
})

describe('findings: only a real defect keeps an item out', () => {
  it('the valid fixture has no defect and no gap except the charter prefixes the mapping does not cover', () => {
    const f = auditFindings(src())
    expect(f.filter((x) => x.cls === 'defect')).toEqual([])
    expect(f.filter((x) => x.cls === 'gap')).toEqual([])
    expect(f.filter((x) => x.cls === 'unmapped').map((x) => x.id)).toEqual(['AI'])
    expect(f.filter((x) => x.cls === 'info').map((x) => x.id)).toEqual(['MGO', 'NEED'])
  })
  it('a relationship with an unregistered end is the one defect, and it is left out of the generated text', () => {
    const s = mutate((t) => t.relationships.push({ id: 'REL-004', from: 'STK-001', to: 'STK-099', type: 'funds', note: 'x' }))
    expect(auditFindings(s).filter((x) => x.cls === 'defect')).toEqual([expect.objectContaining({ id: 'REL-004', code: 'rel-end' })])
    const g = generateSysml(s, { purpose: 'p' })
    expect(g.excluded).toEqual(['REL-004'])
    expect(g.text).not.toMatch(/<'REL-004'>/)
    expect(g.text).toMatch(/Left out \(defects, fix in the Week 1 record\): REL-004/)
    expect(generateSysml(src(), { purpose: 'p' }).excluded).toEqual([])
  })
  const cases: [string, (t: TeamRecord) => void][] = [
    ['ent-name', (t) => (t.proposal.name = '')],
    ['soi', (t) => (t.proposal.soi = '')],
    ['ext-name', (t) => (t.context[0].name = '')],
    ['ext-crosses', (t) => (t.context[0].crosses = '')],
    ['stk-name', (t) => (t.stakeholders[0].name = '')],
    ['stk-no-concern', (t) => (t.stakeholders[0].concerns = [])],
    ['stk-unrated', (t) => (t.stakeholders[0].influence = '')],
    ['con-text', (t) => (t.stakeholders[0].concerns[0].text = '')],
    ['rel-type', (t) => (t.relationships[1].type = '')],
    ['rel-self', (t) => (t.relationships[1].to = t.relationships[1].from)],
    ['no-conflict', (t) => (t.relationships = t.relationships.filter((r) => r.type !== 'conflicts-with'))],
    ['stk-dup-name', (t) => (t.stakeholders[1].name = t.stakeholders[0].name)],
    ['ext-dup-name', (t) => (t.context[1].name = t.context[0].name)],
  ]
  for (const [code, f] of cases)
    it(`gap ${code} fires on a mutated record and not on the fixture`, () => {
      expect(codes(src())).not.toContain(code)
      expect(codes(mutate(f))).toContain(code)
    })
})

describe('generation', () => {
  it('writes the course structure: purpose, Context, Stakeholders, every later package with its week', () => {
    const t = generateSysml(src(), { purpose: 'Used by the team to trace decisions to concerns.' }).text
    expect(t).toMatch(/^package 'Riverside Food Bank Network Model' \{$/m)
    expect(t).toContain("doc /* Purpose: Used by the team to trace decisions to concerns. */")
    for (const p of ['Context', 'Stakeholders', 'Needs', 'Requirements', 'Behavior', 'Logical', 'Physical', 'Verification', 'Analysis', 'AROU']) expect(t).toMatch(new RegExp(`^\\tpackage ${p} \\{$`, 'm'))
    expect(t).toContain("concern <'CON-001'> {")
    expect(t).toContain("subject enterprise : Context::'ENT-001';")
    expect(t).toContain("stakeholder familiesUsingPartnerPantries : 'STK-001';")
    expect(t).toContain("#conflictsWith dependency <'REL-001'> from 'STK-007' to 'STK-004' {")
    expect(t).toContain('@StakeholderAssessment { influence = 2; influenceReason = "little leverage alone, but they decide demand"; }')
    expect(t).toMatch(/NEED-001 to NEED-008 \(Week 9/)
  })
  it('an empty purpose leaves a visible placeholder', () => {
    expect(generateSysml(src(), { purpose: ' ' }).text).toContain('[Write the model purpose here')
  })
  it('the reduced scope: ratings in documentation, conflict relationships only', () => {
    const t = generateSysml(src(), { purpose: 'p', assessment: false, relationships: 'conflicts' }).text
    expect(t).not.toContain('StakeholderAssessment')
    expect(t).toContain('Influence 2 (1-5): little leverage alone')
    expect(t).toContain("<'REL-001'>")
    expect(t).not.toContain("<'REL-002'>")
  })
  it('escapes names and documentation; never emits a reserved word as a basic name', () => {
    expect(quoted("O'Neil \\ x")).toBe("'O\\'Neil \\\\ x'")
    expect(quoted('“curly” ‘quotes’ – dash')).toBe(`'"curly" \\'quotes\\' - dash'`)
    expect(docText('ends */ early')).toBe('ends * / early')
    expect(basicName('Public', 'x')).toBe('public_')
    expect(basicName('part', 'x')).toBe('part_')
    expect(basicName('', 'ext003')).toBe('ext003')
    expect(basicName('3D printer shop', 'x')).toBe('x3DPrinterShop')
    for (const w of RESERVED) expect(RESERVED.has(basicName(w, 'x'))).toBe(false)
    const t = stressModel().model.text
    expect(t).toContain("package 'O\\'Neil \"Quick\" Relief \\\\ Network */ Co Model' {")
    expect(t).toContain("part <'EXT-001'> public_ : 'Public'")
    expect(t).toContain("part <'EXT-002'> part_ : 'part'")
    expect(t).toContain("part def <'STK-005'> {")
    expect(t).toContain('doc /* Ends with a backslash \\ and a terminator * / inside. */')
    // every documentation comment closes once, on its own line
    for (const line of t.split('\n').filter((l) => l.includes('/*'))) expect(line.match(/\*\//g)?.length ?? 0, line).toBe(1)
    // the unrated stakeholder gets no annotation
    const stk3 = t.slice(t.indexOf("part def <'STK-003'>"), t.indexOf("part def <'STK-004'>"))
    expect(stk3).not.toContain('@StakeholderAssessment')
  })
  it('dependency direction: from is the dependent element (client), to the element it depends on, for every relationship type', () => {
    // SysML v2.1 Beta 2, Part 1, 7.3 (R80 pp.50–51): a change to the supplier (to) may result in a change to the client (from).
    const expected: Record<string, { keyword: string; from: 'source' | 'target' }> = {
      regulates: { keyword: 'regulatedBy', from: 'target' },
      funds: { keyword: 'fundedBy', from: 'target' },
      supplies: { keyword: 'suppliedBy', from: 'target' },
      'affected-by': { keyword: 'affectedBy', from: 'source' },
      'partners-with': { keyword: 'partnersWith', from: 'source' },
      'coordinates-with': { keyword: 'coordinatesWith', from: 'source' },
      'conflicts-with': { keyword: 'conflictsWith', from: 'source' },
    }
    expect(Object.keys(REL_KEYWORDS).sort()).toEqual(Object.keys(expected).sort())
    for (const [type, e] of Object.entries(expected)) {
      const s = mutate((t) => (t.relationships = [{ id: 'REL-001', from: 'STK-002', to: 'STK-005', type: type as TeamRecord['relationships'][number]['type'], note: '' }]))
      const t = generateSysml(s, { purpose: 'p' }).text
      const [client, supplier] = e.from === 'source' ? ['STK-002', 'STK-005'] : ['STK-005', 'STK-002']
      expect(t, type).toContain(`#${e.keyword} dependency <'REL-001'> from '${client}' to '${supplier}'`)
      expect(dependencyEnds({ from: 'STK-002', to: 'STK-005', type })).toEqual({ client, supplier })
      // the keyword's definition says which end is the client, and the symmetric types say the direction carries no meaning
      const def = t.slice(t.indexOf(`metadata def <${e.keyword}>`), t.indexOf(':> annotatedElement', t.indexOf(`metadata def <${e.keyword}>`)))
      expect(def, type).toMatch(REL_KEYWORDS[type].direction === 'symmetric' ? /symmetric: from and to keep the register's order, and the direction carries no meaning/ : /the client \(from\) .* the supplier \(to\), so the client depends on the supplier/)
    }
    // the AeroLink worked example: the OEM depends on its regulator and its investors, the operators on the utility
    expect(AEROLINK_MODEL.text).toContain("#regulatedBy dependency <'REL-001'> from 'STK-011' to 'STK-002' {")
    expect(AEROLINK_MODEL.text).toContain("#suppliedBy dependency <'REL-003'> from 'STK-005' to 'STK-010' {")
    expect(AEROLINK_MODEL.text).toContain("#fundedBy dependency <'REL-004'> from 'STK-011' to 'STK-003' {")
    expect(AEROLINK_MODEL.text).toContain("#affectedBy dependency <'REL-007'> from 'STK-013' to 'STK-004' {")
    expect(AEROLINK_MODEL.text).not.toMatch(/#(regulates|funds|supplies) /)
    // an untyped relationship keeps the register's order (a plain dependency)
    expect(dependencyEnds({ from: 'STK-003', to: 'STK-006', type: '' })).toEqual({ client: 'STK-003', supplier: 'STK-006' })
  })
  it('name shadowing: register names that would hide a package or a definition still give a file that resolves, and each is reported', () => {
    const s = mutate((t) => {
      t.stakeholders[3].name = 'Context'
      t.context[3].name = 'context'
      t.context[4].name = 'Physical'
      t.context[5].name = 'weather'
      t.proposal.inside[0].name = 'soi'
      t.proposal.inside[2].name = 'warehouse'
    })
    const g = generateSysml(s, { purpose: 'p' }).text
    const root = "'Riverside Food Bank Network Model'"
    expect(g).toContain(`subject enterprise : ${root}::Context::'ENT-001';`)
    expect(g).toContain(`ref part systemOfInterest :> ${root}::Physical::soi2;`)
    expect(g).toMatch(/^\t\tpart context2 \{$/m)
    expect(g).toContain("part <'EXT-004'> context3 : 'context'")
    expect(g).toContain("part <'EXT-006'> weather2 : 'weather'")
    expect(g).toMatch(/^\t\tpart soi2 : 'System of interest' \{$/m)
    expect(g).toContain("part <'PRT-001'> soi3 : 'soi';")
    expect(g).toContain("part <'PRT-003'> warehouse2 : 'warehouse';")
    // no usage is typed by its own name, in any generated file
    for (const text of [g, stressModel().model.text, AEROLINK_MODEL.text])
      for (const [, use, type] of text.matchAll(/part (?:<'[^']+'> )?(\w+) : '([^']*)'/g)) expect(use, `${use} : '${type}'`).not.toBe(type)
    const shadow = auditFindings(s).filter((f) => f.code === 'name-shadow')
    expect(shadow.map((f) => f.id).sort()).toEqual(['EXT-004', 'EXT-004', 'EXT-005', 'EXT-006', 'PRT-001', 'PRT-001', 'PRT-003', 'STK-004'].sort())
    expect(shadow.every((f) => f.cls === 'gap')).toBe(true)
    // the probe names are in the checked stress file, and the fixture has no shadowing
    expect(stressModel().model.text).toContain("::Context::'ENT-001';")
    expect(codes(src())).not.toContain('name-shadow')
    expect(namePlan(src(), 'x').entRef).toBe("Context::'ENT-001'")
    expect(namePlan(src(), 'x').soiRef).toBe('Physical::soi')
  })
  it('name collisions: a name equal to another element’s ID or name, "System of interest", or an inherited concern feature is renamed and reported', () => {
    const { source: s, model } = collisionModel()
    const g = model.text
    // a name equal to another element's ID (or the enterprise's name) is written "<name> (<own ID>)"
    expect(g).toContain("part def <'STK-001'> 'STK-003 (STK-001)' {")
    expect(g).toContain("part def 'ENT-001 (EXT-001)';")
    expect(g).toContain("part def 'EXT-003 (EXT-002)';")
    expect(g).toContain("part def 'Riverside Food Bank Network (EXT-003)';")
    expect(g).toContain("part def 'System of interest (PRT-001)';")
    expect(g).toContain("part <'PRT-002'> pRT003 : 'PRT-003 (PRT-002)';")
    // every short name and name in a package is distinct: no quoted name equals an ID, and 'System of interest' is declared once
    for (const id of [...g.matchAll(/<'([^']+)'>/g)].map((m) => m[1])) expect(g, id).not.toMatch(new RegExp(`part def '${id}'[ ;{]`))
    expect(g.match(/part def 'System of interest'[ ;{]/g)).toHaveLength(1)
    // stakeholder parameters never take an inherited feature's name
    expect(g).toContain("stakeholder stakeholders2 : 'STK-002';")
    expect(g).toContain("stakeholder result2 : 'STK-004';")
    for (const [, p] of g.matchAll(/stakeholder (\w+) :/g)) expect(CONCERN_INHERITED.has(p), p).toBe(false)
    // accented letters are transliterated, other letters dropped, the quoted name kept
    expect(g).toContain("part <'EXT-004'> angstromMeteo : 'Ångström météo 東京'")
    expect(basicName('Ångström météo', 'x')).toBe('angstromMeteo')
    expect(basicName('Straße Øresund Łódź', 'x')).toBe('strasseOresundLodz')
    // each adaptation is a name-shadow gap
    const shadow = auditFindings(s).filter((f) => f.code === 'name-shadow')
    expect(shadow.map((f) => f.id).sort()).toEqual(['EXT-001', 'EXT-002', 'EXT-003', 'EXT-004', 'PRT-001', 'PRT-002', 'STK-001', 'STK-002', 'STK-004'].sort())
    expect(shadow.find((f) => f.id === 'STK-002')?.text).toMatch(/inherits from the standard library/)
    expect(shadow.find((f) => f.id === 'EXT-004')?.text).toMatch(/only ASCII letters/)
    // a concern named like a stakeholder or another element's ID is renamed too
    const named: ImportSource = { ...src(), concerns: src().concerns.map((c, i) => (i === 0 ? { ...c, name: 'STK-002' } : i === 1 ? { ...c, name: src().stakeholders[2].name } : c)) }
    const plan = namePlan(named, 'x')
    expect(plan.conNames.get(named.concerns[0].id)).toBe(`STK-002 (${named.concerns[0].id})`)
    expect(plan.conNames.get(named.concerns[1].id)).toBe(`${src().stakeholders[2].name} (${named.concerns[1].id})`)
    // negative direction: the fixture keeps every register name as written and reports nothing
    const fixture = namePlan(src(), 'x')
    expect(src().stakeholders.every((x) => fixture.stkNames.get(x.id) === x.name)).toBe(true)
    expect(fixture.extTypes).toEqual(src().context.map((x) => x.name))
    expect(fixture.insideTypes).toEqual(src().inside.map((x) => x.name))
    // a stakeholder may carry its own ID as its name (one element, no clash)
    expect(namePlan({ ...src(), stakeholders: src().stakeholders.map((x, i) => (i === 0 ? { ...x, name: x.id } : x)) }, 'x').stkNames.get('STK-001')).toBe('STK-001')
  })
  it('the no-concerns gap names its cause: a Week 2 snapshot, or a Week 1 file without concerns', () => {
    const w1 = mutate((t) => t.stakeholders.forEach((x) => (x.concerns = [])))
    expect(auditFindings(w1).find((f) => f.code === 'no-concerns')?.text).toMatch(/^The Week 1 file lists stakeholders but no concerns/)
    const r = importFile(week2Json())
    if ('error' in r || r.kind !== 'week2') throw new Error('week 2 must import')
    expect(auditFindings(r.snapshotOnly!).find((f) => f.code === 'no-concerns')?.text).toMatch(/a Week 2 file holds only stakeholder IDs and names/)
  })
  it('every course package is present, Evolution (Week 14) included; no internal source code reaches the file', () => {
    const t = generateSysml(src(), { purpose: 'p' }).text
    for (const p of MODEL_PACKAGES) expect(t, p.name).toMatch(new RegExp(`^\\tpackage ${p.name} \\{$`, 'm'))
    expect(t).toContain('Week 14 models the roadmap increments here')
    for (const text of [t, stressModel().model.text, AEROLINK_MODEL.text]) expect(text).not.toMatch(/\b(S0\d|S10|R\d{2}[a-z]?)\b/)
  })
  it('is deterministic', () => {
    expect(generateSysml(src(), { purpose: 'p', date: '2026-10-19' }).text).toBe(generateSysml(src(), { purpose: 'p', date: '2026-10-19' }).text)
  })
  it('compact writes ranges', () => {
    expect(compact(['NEED-003', 'NEED-001', 'NEED-002', 'NEED-007', 'NEED-008'])).toBe('NEED-001 to NEED-003, NEED-007, NEED-008')
  })
})

describe('mapping matrix', () => {
  it('one row per course kind; imported kinds are modeled now or mapped; manual kinds take the team count', () => {
    const rows = mappingMatrix(src(), [{ prefix: 'PHY', count: '7', reason: 'components' }, { prefix: 'TECH', count: '0', reason: '' }])
    expect(rows.map((r) => r.prefix)).toEqual(MAPPING_KINDS.map((k) => k.prefix))
    const r = (p: string) => rows.find((x) => x.prefix === p)!
    expect([r('STK').status, r('STK').count]).toEqual(['modeled now', 8])
    expect([r('NEED').status, r('NEED').count]).toEqual(['mapped', 8])
    expect([r('PHY').status, r('PHY').count]).toEqual(['mapped', 7])
    expect(r('TECH').status).toBe('none in the package')
    expect(r('IF').status).toBe('not in the imported files')
    expect(mappingMatrix(src(), [{ prefix: 'IF', count: 'many', reason: '' }]).find((x) => x.prefix === 'IF')!.status).toBe('not in the imported files')
  })
})

describe('audit summary follows the data', () => {
  it('the fixture', () => {
    const s = src()
    const a = auditSummary(s, generateSysml(s, { purpose: 'p' }))
    expect(a).toEqual({ stakeholders: { record: 8, model: 8 }, concerns: { record: 8, model: 8 }, externals: { record: 6, model: 6 }, concernsWithSubjectAndStakeholder: 8, stakeholdersWithConcern: 8, relationships: 3, conflicts: 1 })
  })
  it('AeroLink (the worked example): every stakeholder, concern, external system and relationship of the corrected case', () => {
    expect(AEROLINK_SUMMARY.stakeholders).toEqual({ record: STAKEHOLDERS.length, model: STAKEHOLDERS.length })
    expect(AEROLINK_SUMMARY.concerns).toEqual({ record: CONCERNS.length, model: CONCERNS.length })
    expect(AEROLINK_SUMMARY.externals).toEqual({ record: EXTERNAL_SYSTEMS.length, model: EXTERNAL_SYSTEMS.length })
    expect(AEROLINK_SUMMARY.relationships).toBe(RELATIONSHIPS.length)
    expect(AEROLINK_SUMMARY.conflicts).toBe(RELATIONSHIPS.filter((r) => r.type === 'conflicts-with').length)
    expect([STAKEHOLDERS.length, CONCERNS.length, EXTERNAL_SYSTEMS.length, RELATIONSHIPS.length]).toEqual([15, 17, 6, 8])
    expect(AEROLINK_MODEL.text).toContain("part def <'STK-015'> 'Passengers with reduced mobility'")
    expect(AEROLINK_MODEL.text).toContain("concern <'CON-017'> 'Travel with one\\'s own mobility aid'")
    expect(AEROLINK_MODEL.text).toContain("concern <'CON-015'> 'Fleet orders and delivery milestones'")
    expect(AEROLINK_MODEL.text).toContain("'Controlled airspace (air traffic service)'")
    expect(auditFindings(AEROLINK_SOURCE).filter((f) => f.cls === 'defect' || f.cls === 'gap')).toEqual([])
  })
})
