// Week 8 pure-logic tests. Pins every number quoted in the lesson (worked examples (b)-(d) and the advanced block),
// runs the instructor reference through the module's own checks (AUTHORING_GUIDE §7 rule 4), and proves that each
// check can fail on realistic bad input (rule 5).
import { describe, expect, it } from 'vitest'
import { referenceUpTo } from '../../model/reference'
import type { EngineeringModel } from '../../model/engineering'
import { sysmlSource } from '../../lib/sysml'
import week08 from '../../content/weeks/week08'
import { allocationMatrix, checkArchitecture, criteriaNamed, functionNameProblem, justificationProblem, parseEnds, readArchitecture } from './architecture'
import { ALLOCATION_A, ALLOCATION_B, FN_FLOWS, allocationFromModel, coupling, flowsFromModel, functionalN2, inducedN2, interfaceN2, pairsWithoutInterface, parseFlowRationale, round3 } from './n2'
import { DATA_OR_INFORMATION, PEER_FAILING, PEER_INFO_SAMPLE, decisionProblem, scorePrediction, traceInformation } from './infoflow'
import { ASSERTION_OPTIONS, LISTING_FILE, ROLES, TARGETS, findToken, scoreReading } from './reading'

const ref = referenceUpTo(8)
const arch = readArchitecture(ref)
/** The interfaces of the first version of the reference, before the Week 8 review's corrections (IF-010..014 added on 2026-10-11). */
const draftIfs = arch.ifs.filter((i) => Number(i.id.slice(3)) <= 9)
const byId = (checks: ReturnType<typeof checkArchitecture>, id: string) => checks.find((c) => c.id === id)!

describe('reference baseline passes the Week 8 checks (rule 4)', () => {
  const checks = checkArchitecture(ref)
  it('every required and minimum check passes on the reference', () => {
    expect(checks.filter((c) => c.severity !== 'advisory' && !c.ok).map((c) => `${c.id}: ${c.failing.join(',')}`)).toEqual([])
  })
  it('two advisories on the reference, each explained in the model: PHY-006 (the medium, no interface of its own) and FN-013 (a planning function, no scenario)', () => {
    expect(checks.filter((c) => !c.ok).map((c) => c.id)).toEqual(['fn-scenario', 'phy-isolated'])
    expect(byId(checks, 'phy-isolated').failing).toEqual(['PHY-006'])
    expect(byId(checks, 'fn-scenario').failing).toEqual(['FN-013'])
    // Corrected after the review (W8-F23, W8-F13): AI-001 is hosted with FN-008 on PHY-005, and 13 of 14 FN record their scenario.
    expect(byId(checks, 'alloc-consistent').ok).toBe(true)
    expect(byId(checks, 'fn-performed').ok).toBe(true)
    expect(byId(checks, 'if-carries').ok).toBe(true)
  })
  it('mutation: hosting AI-001 on PHY-004 again (the first version) fails alloc-consistent for FN-008 — for the AI performer, not for LOG-003', () => {
    const m = structuredClone(ref)
    m.links = m.links.map((l) => (l.source === 'AI-001' && l.type === 'allocated-to' ? { ...l, target: 'PHY-004' } : l))
    expect(byId(checkArchitecture(m), 'alloc-consistent').failing).toEqual(['FN-008'])
  })
  it('mutation: removing the FN derives-from SCN links (the first version) fails fn-scenario for all 14 FN', () => {
    const m = structuredClone(ref)
    m.links = m.links.filter((l) => !(l.source.startsWith('FN-') && l.type === 'derives-from' && l.target.startsWith('SCN-')))
    expect(byId(checkArchitecture(m), 'fn-scenario').failing).toHaveLength(14)
  })
  it('reads 14 FN, 7 LOG, 8 PHY, 14 IF, 5 INFO, 2 AI', () => {
    expect([arch.fns.length, arch.logs.length, arch.phys.length, arch.ifs.length, arch.infos.length, arch.ais.length]).toEqual([14, 7, 8, 14, 5, 2])
  })
  it('worked chain FN-006 → LOG-002 → PHY-003 with IF-005', () => {
    const fn = arch.fns.find((f) => f.id === 'FN-006')!
    expect(fn.phys).toEqual(['PHY-003'])
    expect(fn.caps).toEqual(['CAP-003'])
    expect(fn.performers).toEqual(['LOG-002'])
    expect(arch.logs.find((l) => l.id === 'LOG-002')!.phys).toEqual(['PHY-003', 'PHY-004'])
    expect(arch.ifs.find((i) => i.id === 'IF-005')).toMatchObject({ type: 'physical', ends: ['PHY-001', 'PHY-003'] })
  })
  it('allocation matrix has exactly one PHY per FN; PHY-004 hosts 7 functions', () => {
    const mx = allocationMatrix(ref)
    expect(mx.rows.every((r) => r.cells.filter(Boolean).length === 1)).toBe(true)
    const col = mx.phys.indexOf('PHY-004')
    expect(mx.rows.filter((r) => r.cells[col]).map((r) => r.fn)).toEqual(['FN-002', 'FN-003', 'FN-004', 'FN-009', 'FN-011', 'FN-012', 'FN-013'])
  })
})

describe('architecture checks fail on realistic bad input (mutation, rule 5)', () => {
  const mutate = (f: (m: EngineeringModel) => EngineeringModel) => checkArchitecture(f(structuredClone(ref)))
  it('removing one FN allocation fails fn-allocated', () => {
    const c = mutate((m) => ({ ...m, links: m.links.filter((l) => !(l.source === 'FN-010' && l.type === 'allocated-to')) }))
    expect(byId(c, 'fn-allocated').failing).toEqual(['FN-010'])
  })
  it('an untyped IF and an IF with one end fail', () => {
    const c = mutate((m) => {
      m.elements = m.elements.map((e) => (e.id === 'IF-004' ? { ...e, attributes: { ...e.attributes, type: 'procedural' } } : e.id === 'IF-007' ? { ...e, attributes: { ...e.attributes, ends: 'PHY-008' } } : e))
      return m
    })
    expect(byId(c, 'if-typed').failing).toEqual(['IF-004'])
    expect(byId(c, 'if-ends').failing).toEqual(['IF-007'])
  })
  it('an IF to an element that does not exist fails if-ends; the min-if check needs all three types', () => {
    const c = mutate((m) => {
      m.elements = m.elements.map((e) => (e.id === 'IF-001' ? { ...e, attributes: { ...e.attributes, ends: 'PHY-001 <-> PHY-099' } } : e))
      m.elements = m.elements.filter((e) => !['IF-004', 'IF-009'].includes(e.id))
      return m
    })
    expect(byId(c, 'if-ends').failing).toEqual(['IF-001'])
    expect(byId(c, 'min-if').ok).toBe(false)
  })
  it('an INFO without a decision fails info-decision', () => {
    const c = mutate((m) => {
      m.elements = m.elements.map((e) => (e.id === 'INFO-004' ? { ...e, attributes: { ...e.attributes, decisionSupported: '' } } : e))
      return m
    })
    expect(byId(c, 'info-decision').failing).toEqual(['INFO-004'])
  })
  it('moving FN-006 to PHY-005 breaks allocation consistency with LOG-002', () => {
    const c = mutate((m) => ({ ...m, links: m.links.map((l) => (l.source === 'FN-006' && l.type === 'allocated-to' ? { ...l, target: 'PHY-005' } : l)) }))
    expect(byId(c, 'alloc-consistent').failing).toEqual(['FN-006'])
  })
  it('function names that name the solution or the performer are flagged; reference-style names pass', () => {
    const phys = arch.phys.map((p) => p.name)
    for (const bad of ['Operations centre dispatch scheduling', 'Charging system control unit', 'Booking app', 'Vertiports passenger flow', 'Charging']) expect(functionNameProblem(bad, phys), bad).not.toBeNull()
    // Reviewer probes (W8-F05): performer-as-subject names of passing length, incl. the q8-3 distractor; each fails for the performer.
    for (const bad of ['Technician repairs aircraft', 'Charger delivers energy to aircraft', 'Dispatcher releases aircraft', 'Pilot flies the passenger trip'])
      expect(functionNameProblem(bad, phys), bad).toMatch(/starts with a performer/)
    expect(functionNameProblem('Maintenance software flags faults', phys)).toMatch(/names a solution element/)
    for (const good of arch.fns.map((f) => f.name).concat(['Charge eVTOL aircraft', 'Monitor battery temperature during charging'])) expect(functionNameProblem(good, phys), good).toBeNull()
  })
  it('allocation justifications without a criterion, or without the ID it rests on, are rejected even when long enough', () => {
    expect(justificationProblem('This function goes here because it seems like the most sensible place for it overall.')).toMatch(/no allocation criterion/)
    expect(justificationProblem('We allocated it to that element since the whole team agreed this was best.')).toMatch(/no allocation criterion/)
    expect(justificationProblem('Close to the chargers.')).toMatch(/full sentence/)
    // Reviewer probes (W8-F05): generic words that used to satisfy the criterion patterns.
    for (const bad of [
      'We put it at the operations centre because that is where all the data ends up anyway.',
      'The team agreed this location is the most convenient place for the function overall.',
      'Allocated here because the operations centre is a safe choice for most things we do.',
      'Allocated here because the operations centre is a safe choice for REQ-SYS-005 work.',
    ])
      expect(justificationProblem(bad), bad).toMatch(/no allocation criterion/)
    // A criterion with nothing checkable behind it fails on the missing ID, not on the criterion.
    expect(justificationProblem('Same flows: the energy crosses at the pad, so the function sits with the chargers.')).toMatch(/cites no ID/)
    const good = 'Charging power and the battery-management handshake are energy and data flows at the pad, so the function sits with the chargers (REQ-SYS-001).'
    expect(justificationProblem(good)).toBeNull()
    expect(criteriaNamed(good)).toContain('same input-output flows (information, energy, material)')
  })
  it('every justification in the lesson’s worked allocation table passes the screen (rule 4)', () => {
    const table = week08.blocks.find((b) => b.id === 'w8-worked-allocation')!.table!
    expect(table.rows.length).toBe(6)
    for (const row of table.rows) expect(justificationProblem(row[4]), row[0]).toBeNull()
  })
  it('parses interface ends in the forms students type', () => {
    expect(parseEnds('PHY-001 <-> PHY-003')).toEqual(['PHY-001', 'PHY-003'])
    expect(parseEnds('PHY-004 ↔ EXT-001')).toEqual(['PHY-004', 'EXT-001'])
    expect(parseEnds('PHY-004')).toBeNull()
    expect(parseEnds(undefined)).toBeNull()
  })
})

describe('interface N² over the reference (worked example c)', () => {
  const n2 = interfaceN2(arch.ifs, arch.phys.map((p) => p.id))
  it('14 interfaces: 3 physical, 9 information, 2 organisational; 4 touch an external element', () => {
    expect(n2.edges).toHaveLength(14)
    expect(n2.byType).toEqual({ physical: 3, information: 9, organisational: 2 })
    expect(n2.edges.filter((e) => e.a.startsWith('EXT') || e.b.startsWith('EXT')).map((e) => e.id)).toEqual(['IF-003', 'IF-006', 'IF-007', 'IF-011'])
  })
  it('degrees: PHY-004 9, PHY-001 4, PHY-002/003/005 3, PHY-006 0; the degree sum is 2 × 14; two pairs are joined twice', () => {
    expect(n2.nodes).toEqual(['PHY-001', 'PHY-002', 'PHY-003', 'PHY-004', 'PHY-005', 'PHY-006', 'PHY-007', 'PHY-008', 'EXT-001', 'EXT-002', 'EXT-003', 'EXT-006'])
    expect(n2.degree).toEqual({ 'PHY-001': 4, 'PHY-002': 3, 'PHY-003': 3, 'PHY-004': 9, 'PHY-005': 3, 'PHY-006': 0, 'PHY-007': 1, 'PHY-008': 1, 'EXT-001': 1, 'EXT-002': 1, 'EXT-003': 1, 'EXT-006': 1 })
    expect(Object.values(n2.degree).reduce((a, b) => a + b, 0)).toBe(28)
    expect(n2.isolated).toEqual(['PHY-006'])
    // PHY-004–PHY-005 (IF-004 organisational, IF-012 information) and PHY-002–PHY-004 (IF-009, IF-014): 14 interfaces over 12 pairs.
    const twice = n2.cells.flatMap((row) => row.filter((c) => c.length > 1).map((c) => c.map((e) => e.id).join('+')))
    expect(twice.sort()).toEqual(['IF-004+IF-012', 'IF-009+IF-014'])
    expect(n2.pairs).toBe(12)
    // 12 nodes → 66 possible pairs; 12 / 66 = 0.182
    expect(round3(n2.pairs / ((n2.nodes.length * (n2.nodes.length - 1)) / 2))).toBe(0.182)
  })
  it('the first version (IF-001..009) had 9 interfaces, PHY-004 degree 5 and density 9 / 55 (what the review counted)', () => {
    const d = interfaceN2(draftIfs, arch.phys.map((p) => p.id))
    expect(d.byType).toEqual({ physical: 3, information: 4, organisational: 2 })
    expect(d.degree).toMatchObject({ 'PHY-004': 5, 'PHY-001': 3, 'PHY-005': 1, 'PHY-006': 0 })
    expect([d.pairs, round3(d.pairs / 55)]).toEqual([9, 0.164])
  })
  it('mutation: retyping IF-004 as information changes the counts', () => {
    const n = interfaceN2(arch.ifs.map((i) => (i.id === 'IF-004' ? { ...i, type: 'information' } : i)))
    expect(n.byType).toEqual({ physical: 3, information: 10, organisational: 1 })
  })
})

describe('coupling of two allocation alternatives (advanced block, graduate task)', () => {
  const A = coupling(FN_FLOWS, ALLOCATION_A)
  const B = coupling(FN_FLOWS, ALLOCATION_B)
  it('the teaching flow set has 19 flows over 13 functions (FN-010 has only external flows)', () => {
    expect(FN_FLOWS).toHaveLength(19)
    expect(functionalN2(FN_FLOWS).fns).toHaveLength(13)
    expect(new Set(FN_FLOWS.map((f) => f.id)).size).toBe(19)
  })
  it('alternative A (reference): X = 10 of 19, κ = 0.526, P = 7, D_max = 4 (PHY-001, PHY-004)', () => {
    expect([A.flows, A.crossing, A.internal, round3(A.kappa), A.pairs.length]).toEqual([19, 10, 9, 0.526, 7])
    expect(A.maxPartners).toEqual({ phy: ['PHY-001', 'PHY-004'], count: 4 })
    expect(A.crossingFlows.map((f) => f.id)).toEqual(['F01', 'F02', 'F10', 'F11', 'F12', 'F13', 'F14', 'F15', 'F17', 'F18'])
  })
  it('alternative B (distributed dispatch): X = 16 of 19, κ = 0.842, P = 8, D_max = 5 (PHY-002)', () => {
    expect([B.flows, B.crossing, B.internal, round3(B.kappa), B.pairs.length]).toEqual([19, 16, 3, 0.842, 8])
    expect(B.maxPartners).toEqual({ phy: ['PHY-002'], count: 5 })
    expect(B.pairs.find((p) => p.a === 'PHY-002' && p.b === 'PHY-004')!.flows).toEqual(['F03', 'F04', 'F05', 'F07', 'F08', 'F09'])
  })
  it('typed gaps in A: none against the corrected reference (IF-010, IF-012, IF-013 carry F11, F10/F18, F17)', () => {
    expect(pairsWithoutInterface(A, arch.ifs)).toEqual([])
  })
  it('typed gaps in A against the first version (IF-001..009): PHY-001–PHY-005 (F17, none), PHY-003–PHY-004 (F11, none), PHY-004–PHY-005 (F10, F18 over organisational IF-004 only)', () => {
    const g = pairsWithoutInterface(A, draftIfs)
    expect(g.map((p) => `${p.a}–${p.b}`)).toEqual(['PHY-001–PHY-005', 'PHY-003–PHY-004', 'PHY-004–PHY-005'])
    expect(g[2]).toEqual({ a: 'PHY-004', b: 'PHY-005', flows: ['F10', 'F18'], present: ['IF-004 organisational'] })
    // IF-001 (physical) carries the passenger flows F13/F14 (material); IF-005 (physical) carries F15 (energy).
    expect(g.some((p) => p.a === 'PHY-001' && p.b === 'PHY-002')).toBe(false)
  })
  it('typed gaps in B: 4 of the 8 crossing pairs (the reference interfaces were designed for A); 7 against the first version', () => {
    const g = pairsWithoutInterface(B, arch.ifs)
    expect(g.map((p) => `${p.a}–${p.b}`)).toEqual(['PHY-001–PHY-002', 'PHY-002–PHY-003', 'PHY-002–PHY-005', 'PHY-002–PHY-007'])
    expect(g.find((p) => p.a === 'PHY-001' && p.b === 'PHY-002')).toMatchObject({ flows: ['F12'], present: ['IF-001 physical'] })
    expect(g.find((p) => p.a === 'PHY-002' && p.b === 'PHY-007')).toMatchObject({ flows: ['F01', 'F02'], present: [] })
    // IF-014 (information) now carries the six B flows on PHY-002–PHY-004 that only organisational IF-009 joined before.
    const d = pairsWithoutInterface(B, draftIfs)
    expect(d.map((p) => `${p.a}–${p.b}`)).toEqual(['PHY-001–PHY-002', 'PHY-001–PHY-005', 'PHY-002–PHY-003', 'PHY-002–PHY-004', 'PHY-002–PHY-005', 'PHY-002–PHY-007', 'PHY-004–PHY-005'])
    expect(d.find((p) => p.a === 'PHY-002' && p.b === 'PHY-004')).toMatchObject({ flows: ['F03', 'F04', 'F05', 'F07', 'F08', 'F09'], present: ['IF-009 organisational'] })
  })
  it('mutation: the gap check fails for the type, not for the ends (retyping changes coverage, moving nothing)', () => {
    const retype = (id: string, type: string) => arch.ifs.map((i) => (i.id === id ? { ...i, type } : i))
    // IF-012 retyped organisational: F10/F18 have no carrier again although two interfaces join PHY-004 and PHY-005.
    expect(pairsWithoutInterface(A, retype('IF-012', 'organisational'))).toEqual([{ a: 'PHY-004', b: 'PHY-005', flows: ['F10', 'F18'], present: ['IF-004 organisational', 'IF-012 organisational'] }])
    // First version: IF-004 as an information interface would carry F10/F18, so the PHY-004–PHY-005 gap disappears.
    const draftRetyped = draftIfs.map((i) => (i.id === 'IF-004' ? { ...i, type: 'information' } : i))
    expect(pairsWithoutInterface(A, draftRetyped).map((p) => `${p.a}–${p.b}`)).toEqual(['PHY-001–PHY-005', 'PHY-003–PHY-004'])
    // IF-001 as an information interface no longer carries passengers: PHY-001–PHY-002 becomes a gap for F13, F14.
    expect(pairsWithoutInterface(A, retype('IF-001', 'information')).find((p) => p.a === 'PHY-001' && p.b === 'PHY-002')).toMatchObject({ flows: ['F13', 'F14'] })
  })
  it('each of the two moved functions alone gives X = 14 (κ = 0.737)', () => {
    expect(round3(coupling(FN_FLOWS, { ...ALLOCATION_B, 'FN-011': 'PHY-004' }).kappa)).toBe(0.737)
    expect(round3(coupling(FN_FLOWS, { ...ALLOCATION_B, 'FN-002': 'PHY-004' }).kappa)).toBe(0.737)
    expect(coupling(FN_FLOWS, { ...ALLOCATION_B, 'FN-002': 'PHY-004' }).crossing).toBe(14)
  })
  it('induced PHY N² is directed and excludes the diagonal', () => {
    const m = inducedN2(FN_FLOWS, ALLOCATION_A)
    const i = m.phys.indexOf('PHY-003')
    const j = m.phys.indexOf('PHY-001')
    expect(m.cells[i][j]).toEqual(['F15'])
    expect(m.cells[j][i]).toEqual([])
    expect(m.phys.every((_, k) => m.cells[k][k].length === 0)).toBe(true)
  })
  it('mutation: co-locating everything gives κ = 0; an unallocated function is reported and its flows not counted', () => {
    const all = Object.fromEntries(Object.keys(ALLOCATION_A).map((k) => [k, 'PHY-004']))
    expect(coupling(FN_FLOWS, all)).toMatchObject({ crossing: 0, kappa: 0, pairs: [] })
    const { ['FN-014']: _omit, ...partial } = ALLOCATION_A
    const c = coupling(FN_FLOWS, partial)
    expect(c.unallocated).toEqual(['FN-014'])
    expect(c.flows).toBe(17)
  })
})

describe('the student’s own flow set from the workspace (graduate memo, review W8-F03)', () => {
  const withFlows = (): EngineeringModel => {
    const m = structuredClone(ref)
    // The 19 teaching flows recorded as the editor records them: FN flows-to FN, rationale "<kind>: <item> [owner · provenance]".
    m.links.push(...FN_FLOWS.map((f, k) => ({ id: `LNK-T${String(k + 1).padStart(2, '0')}`, source: f.from, type: 'flows-to' as const, target: f.to, rationale: `${f.kind}: ${f.item} [AB · team-derived]` })))
    return m
  }
  it('parses the recorded rationale; anything else is read as information', () => {
    expect(parseFlowRationale('energy: Battery energy [AB · team-derived]')).toEqual({ kind: 'energy', item: 'Battery energy' })
    expect(parseFlowRationale('Material: Boarded passengers')).toEqual({ kind: 'material', item: 'Boarded passengers' })
    expect(parseFlowRationale('just a note')).toBeNull()
  })
  it('the reference baseline records no FN → FN flows, so the workspace set starts empty', () => {
    expect(flowsFromModel(ref)).toEqual([])
  })
  it('recorded flows and the recorded allocation reproduce the teaching-set numbers (A: X = 10, κ = 0.526, P = 7)', () => {
    const m = withFlows()
    const flows = flowsFromModel(m)
    expect(flows).toHaveLength(19)
    expect(flows.filter((f) => f.kind !== 'information').map((f) => f.item)).toEqual(['Boarded passengers', 'Arriving passengers', 'Battery energy', 'Charging power share'])
    const alloc = allocationFromModel(m)
    expect(alloc).toEqual(ALLOCATION_A)
    const c = coupling(flows, alloc)
    expect([c.crossing, round3(c.kappa), c.pairs.length]).toEqual([10, 0.526, 7])
    expect(round3(coupling(flows, { ...alloc, 'FN-002': 'PHY-002', 'FN-011': 'PHY-002' }).kappa)).toBe(0.842)
  })
  it('an FN → INFO → FN chain counts as one information flow; a retired function drops its flows (mutation)', () => {
    const m = structuredClone(ref)
    m.links.push({ id: 'LNK-X1', source: 'FN-008', type: 'flows-to', target: 'INFO-003' }, { id: 'LNK-X2', source: 'INFO-003', type: 'flows-to', target: 'FN-011' })
    expect(flowsFromModel(m)).toEqual([{ id: 'INFO-003:FN-008>FN-011', from: 'FN-008', to: 'FN-011', item: 'INFO-003 Maintenance Data', kind: 'information' }])
    m.elements = m.elements.map((e) => (e.id === 'FN-011' ? { ...e, status: 'retired' as const } : e))
    expect(flowsFromModel(m)).toEqual([])
  })
})

describe('information-flow tracer (worked example d)', () => {
  const traces = traceInformation(ref, arch.ifs)
  it('every reference INFO has producer, consumer and an acceptable decision (rule 4)', () => {
    expect(traces).toHaveLength(5)
    expect(traces.flatMap((t) => t.problems)).toEqual([])
    expect(traces.find((t) => t.id === 'INFO-005')!.consumers).toEqual(['DEC-001'])
    expect(traces.find((t) => t.id === 'INFO-003')!.decisionIds).toEqual(['REQ-STK-006', 'REQ-SYS-008'])
  })
  it('no advisory on the corrected reference: every producer–consumer pair is joined by an information interface', () => {
    expect(traces.flatMap((t) => t.advisories)).toEqual([])
  })
  it('mutation: removing IF-013 brings back exactly the INFO-002 advisory (fault reports to maintenance)', () => {
    const t = traceInformation(ref, arch.ifs.filter((i) => i.id !== 'IF-013'))
    expect(t.flatMap((x) => x.advisories.map((a) => `${x.id} ${a.split(':')[0]}`))).toEqual(['INFO-002 PHY-001 → PHY-005'])
  })
  it('first version (IF-001..009): five producer–consumer pairs had no information interface (two only an organisational one)', () => {
    const traces = traceInformation(ref, draftIfs)
    expect(traces.flatMap((t) => t.advisories.map((a) => `${t.id} ${a.split(':')[0]}`))).toEqual([
      'INFO-001 PHY-002 → PHY-004',
      'INFO-002 PHY-001 → PHY-005',
      'INFO-003 PHY-005 → PHY-004',
      'INFO-003 PHY-003 → PHY-004',
      'INFO-004 EXT-003 → PHY-004',
    ])
    expect(traces.find((t) => t.id === 'INFO-001')!.advisories[0]).toMatch(/only IF-009 \(organisational\)/)
    expect(traces.find((t) => t.id === 'INFO-003')!.advisories[0]).toMatch(/only IF-004 \(organisational\)/)
  })
  it('mutation (first version): an information interface PHY-002 ↔ PHY-004 clears exactly the INFO-001 advisory', () => {
    const extra = [...draftIfs, { id: 'IF-110', name: 'Gate status feed', type: 'information', ends: ['PHY-002', 'PHY-004'] as [string, string], endsRaw: 'PHY-002 <-> PHY-004', carries: 'boarding timestamps' }]
    const t = traceInformation(ref, extra)
    expect(t.find((x) => x.id === 'INFO-001')!.advisories).toEqual([])
    expect(t.flatMap((x) => x.advisories)).toHaveLength(4)
  })
  it('the peer sample fails exactly the seeded items, each for the seeded reason', () => {
    const p = traceInformation(PEER_INFO_SAMPLE)
    expect(p.filter((t) => t.problems.length).map((t) => t.id)).toEqual(PEER_FAILING)
    expect(p.find((t) => t.id === 'INFO-101')!.problems[0]).toMatch(/names no choice/)
    expect(p.find((t) => t.id === 'INFO-102')!.problems).toEqual(['No consumer.'])
    expect(p.find((t) => t.id === 'INFO-104')!.problems).toEqual(['No decision named.'])
    expect(p.find((t) => t.id === 'INFO-105')!.problems).toEqual(['No producer.'])
  })
  it('vague decision statements of realistic length are rejected; reference decisions pass', () => {
    for (const bad of [
      'Operational awareness for the dispatch team and the management dashboards',
      'Supports decision making in daily operations',
      'Shared with stakeholders for transparency and reporting',
      // Reviewer probes (W8-F05): bare "if" / "which" / "order" no longer count as a choice.
      'Stored for future analysis if needed by the team',
      'Supports situational awareness of which aircraft are flying right now',
      'Kept in order for the monthly report to the board',
    ])
      expect(decisionProblem(bad), bad).toMatch(/names no choice/)
    for (const good of ['Whether to switch a vertiport to the quieter departure procedure (REQ-STK-002)', 'Which aircraft to withdraw at the next maintenance slot', 'When to schedule overnight charging at the spokes (O-002)'])
      expect(decisionProblem(good), good).toBeNull()
    for (const t of traces) expect(decisionProblem(t.decision), t.id).toBeNull()
  })
  it('prediction scoring separates hits, misses and false alarms', () => {
    expect(scorePrediction(['INFO-101', 'INFO-103'], PEER_FAILING)).toEqual({ hits: ['INFO-101'], missed: ['INFO-102', 'INFO-104', 'INFO-105'], falseAlarms: ['INFO-103'] })
  })
  it('data-or-information set is balanced', () => {
    expect(DATA_OR_INFORMATION.filter((d) => d.answer === 'data')).toHaveLength(3)
  })
})

describe('SysML micro-lab 3 key', () => {
  const lines = (sysmlSource(LISTING_FILE) ?? '').split(/\r?\n/)
  it('every target token occurs on its stated line of the validated listing', () => {
    expect(lines.length).toBeGreaterThan(25)
    for (const t of TARGETS) expect(findToken(lines[t.line - 1] ?? '', t.token), `${t.id} ${t.token} line ${t.line}`).toBeGreaterThanOrEqual(0)
  })
  it('every role class is used and exactly one assertion option is correct', () => {
    expect(new Set(TARGETS.map((t) => t.answer)).size).toBe(ROLES.length)
    expect(ASSERTION_OPTIONS.filter((o) => o.correct).map((o) => o.id)).toEqual(['b'])
  })
  it('the listing binds 18 min against a 20 min limit, and the satisfy names PHY-003', () => {
    expect(lines[15]).toContain('18 [min]')
    expect(lines[23]).toContain('20 [min]')
    expect(lines[27].trim()).toBe("satisfy 'REQ-SYS-001' by aeroLink.'PHY-003';")
  })
  it('scoring counts correct and unanswered targets', () => {
    expect(scoreReading({ t1: 'design-value', t2: 'subject' })).toMatchObject({ answered: 2, correct: 1 })
  })
})
