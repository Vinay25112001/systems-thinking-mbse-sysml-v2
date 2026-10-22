// Week 5 AeroLink case: every trace resolves; the N² is consistent with the interface definitions in both directions (every
// definition sits in exactly one cell, every cell holds only interfaces with those two ends, degrees sum to twice the count);
// what each information interface carries agrees with the Week 4 routes in both directions; every crossing function flow
// rides an information interface; every external element has an interface or a recorded reason; every interface that
// crosses a trust boundary states its protection or why it needs none, and every interface states its degraded mode; the
// new interface requirements pass Week 2's own requirement gates; every number the notes use is recomputed here by hand.
// Each check is also shown able to fail on a mutated copy, so a clean run is not a vacuous pass.
import { describe, expect, it } from 'vitest'
import { referenceUpTo } from '../../../model/reference'
import { EMPTY_RECORD, assessRequirement, normalizeRecord, type Week2Record } from '../../../workbench/week2/record'
import { EMPTY_INTERFACE, EMPTY_RECORD as EMPTY_W5, assessInterface, normalizeRecord as normalizeW5, type Interface as ToolInterface } from '../../../workbench/week5/record'
import { NEEDS } from '../week01/aerolinkCase'
import { CAPABILITIES, REQUIREMENTS, SCENARIO_SOI, UNCERTAINTIES } from '../week02/aerolinkCase'
import { RISKS, W3_REQUIREMENTS, W3_UNKNOWNS } from '../week03/aerolinkCase'
import { FINDINGS as W4_FINDINGS, FUNCTIONS, INFORMATION, INTERFACES as W4_INTERFACES, PHYSICAL, W4_EXTERNALS } from '../week04/aerolinkCase'
import {
  ADDED_IDS, CHANGE_REQUEST, COMPONENTS, COUNTS, COUPLING, DIAGONAL, DRIVING_QUESTION, EXTERNAL_DISPOSITIONS, FN_FLOWS, GROUPINGS, HIDDEN_EXTERNAL, ICWG, INTERFACES, INTERFACE_DECISION,
  INTERFACE_REQUIREMENTS, KNOWN_IDS, LATENCY_BUDGET, LEASE_DEPENDENT, RADIO_INTERFACES, RECEIVED, ROUTES, W4_FEED, W4_HANDOVERS, POSSIBLE_CROSSING, boundaryReasons, carriesOf, crossingText, componentsOf, countsOf, crossesBoundary, crossingFlows, degreeOf,
  directionOf, externalsWithoutInterface, functionsAt, groupingCounts, n2Cell, n2Upper, ownerOf, uncoveredPairs, undisposedExternals, type InterfaceDef,
} from './aerolinkCase'

const RISKS_SNAP = RISKS.map((r) => ({ id: r.id, name: r.name, category: r.category }))
const ref = referenceUpTo(14)
const refEl = (id: string) => ref.elements.find((e) => e.id === id)
const words = (s: string) => s.split(/\s+/).filter(Boolean).length
const REQ_IDS = new Set([...REQUIREMENTS, ...W3_REQUIREMENTS, ...INTERFACE_REQUIREMENTS].map((q) => q.id))

describe('Week 5 case: traces resolve', () => {
  it('every component, interface, route and requirement points at ids that exist', () => {
    for (const c of COMPONENTS) for (const id of [c.parent, ...c.functions]) expect(KNOWN_IDS.has(id), `${c.id} → ${id}`).toBe(true)
    for (const x of INTERFACES) {
      for (const id of [...x.ends, ...x.items, ...x.risks]) expect(KNOWN_IDS.has(id), `${x.id} → ${id}`).toBe(true)
      for (const q of x.requirements) expect(REQ_IDS.has(q), `${x.id} → ${q}`).toBe(true)
      for (const v of x.verification) expect(refEl(v)?.kind, `${x.id} → ${v}`).toBe('VER')
    }
    for (const r of ROUTES) for (const id of [r.from, r.to, ...r.via]) expect(KNOWN_IDS.has(id), `${r.info} → ${id}`).toBe(true)
    for (const q of INTERFACE_REQUIREMENTS) for (const id of [q.interface, ...q.parents]) expect(KNOWN_IDS.has(id) || REQ_IDS.has(id), `${q.id} → ${id}`).toBe(true)
    for (const id of [...CHANGE_REQUEST.neighbours, ...CHANGE_REQUEST.reaches.map((x) => x.id)]) expect(KNOWN_IDS.has(id) || REQ_IDS.has(id), id).toBe(true)
  })
  it('a verification case is cited on an interface only if the reference case exercises it (its subject names the interface or both ends) and verifies one of its requirements', () => {
    for (const x of INTERFACES)
      for (const v of x.verification) {
        const a = refEl(v)!.attributes as { subject: string; verifies: string }
        expect(a.subject.includes(x.id) || x.ends.every((e) => a.subject.includes(e)), `${x.id} ${v}: ${a.subject}`).toBe(true)
        expect(x.requirements, `${x.id} ${v}`).toContain(a.verifies)
      }
  })
  it('negative direction: an unknown id is not known, and VER-008 (a bench test of maintenance to dispatch) does not exercise IF-013', () => {
    expect(KNOWN_IDS.has('IF-099')).toBe(false)
    const subject = (refEl('VER-008')!.attributes as { subject: string }).subject
    expect(subject.includes('IF-013') || ['PHY-001', 'PHY-005'].every((e) => subject.includes(e))).toBe(false)
  })
})

describe('Week 5 case: the interfaces received from Week 4 keep their ends and types', () => {
  it('IF-001..014 have Week 4’s ends and type; IF-015 and IF-016 are the only additions; the reference agrees except IF-011’s corrected end', () => {
    for (const w of W4_INTERFACES) {
      const x = INTERFACES.find((y) => y.id === w.id)!
      expect([x.ends, x.kind], w.id).toEqual([w.ends, w.type])
      if (w.id !== 'IF-011') for (const e of w.ends) expect(JSON.stringify(refEl(w.id)), w.id).toContain(e)
    }
    expect(ADDED_IDS).toEqual(['IF-015', 'IF-016'])
    expect(JSON.stringify(refEl('IF-011'))).toContain('EXT-003')
    expect(INTERFACES.find((x) => x.id === 'IF-011')!.ends).toContain('EXT-007')
  })
})

describe('Week 5 case: the N² is consistent with the definitions (both directions)', () => {
  it('every definition appears in exactly one upper-triangle cell, and every cell holds only interfaces whose two ends are that pair', () => {
    const cells = n2Upper()
    for (const x of INTERFACES) expect(cells.filter((c) => c.ids.includes(x.id)), x.id).toHaveLength(1)
    for (const c of cells) for (const id of c.ids) expect(new Set(INTERFACES.find((x) => x.id === id)!.ends)).toEqual(new Set([c.a, c.b]))
    expect(cells.reduce((n, c) => n + c.ids.length, 0)).toBe(INTERFACES.length)
  })
  it('both ends of every interface are on the diagonal and differ', () => {
    for (const x of INTERFACES) {
      expect(x.ends[0]).not.toBe(x.ends[1])
      for (const e of x.ends) expect(DIAGONAL, x.id).toContain(e)
    }
  })
  it('the degree sum is twice the number of interfaces (each interface has two ends)', () => {
    expect(COUNTS.received.degreeSum).toBe(2 * COUNTS.received.total)
    expect(COUNTS.all.degreeSum).toBe(2 * COUNTS.all.total)
  })
  it('the received set, counted by hand: 14 interfaces, 3 physical, 9 information, 2 organizational, 4 external; PHY-004 9, PHY-001 4, PHY-006 0; 12 joined pairs of 105', () => {
    const c = COUNTS.received
    expect([c.total, c.physical, c.information, c.organizational]).toEqual([14, 3, 9, 2])
    expect(c.external).toEqual(['IF-003', 'IF-006', 'IF-007', 'IF-011'])
    expect([c.degrees['PHY-004'], c.degrees['PHY-001'], c.degrees['PHY-002'], c.degrees['PHY-003'], c.degrees['PHY-005'], c.degrees['PHY-007'], c.degrees['PHY-008'], c.degrees['PHY-006']]).toEqual([9, 4, 3, 3, 3, 1, 1, 0])
    expect([c.degreeSum, c.pairs, c.possiblePairs, c.hub]).toEqual([28, 12, 105, 'PHY-004'])
    expect(c.isolated).toEqual(['PHY-006', 'EXT-003', 'EXT-004', 'EXT-005'])
  })
  it('after this week: 16 interfaces, 10 information and 3 organizational; PHY-004 10, PHY-008 2, PHY-005 4; degree sum 32', () => {
    const c = COUNTS.all
    expect([c.total, c.physical, c.information, c.organizational, c.degreeSum]).toEqual([16, 3, 10, 3, 32])
    expect([c.degrees['PHY-004'], c.degrees['PHY-008'], c.degrees['PHY-005'], c.degrees['EXT-004']]).toEqual([10, 2, 4, 1])
  })
  it('negative direction: an interface whose ends disagree with its cell is caught, and a one-ended definition breaks the degree rule', () => {
    const bad: InterfaceDef[] = INTERFACES.map((x) => (x.id === 'IF-014' ? { ...x, ends: ['PHY-002', 'PHY-005'] } : x))
    expect(n2Cell('PHY-002', 'PHY-004', bad)).not.toContain('IF-014')
    const oneEnded: InterfaceDef[] = INTERFACES.map((x) => (x.id === 'IF-014' ? { ...x, ends: ['PHY-002', 'PHY-002'] } : x))
    expect(countsOf(oneEnded).degreeSum).toBe(2 * oneEnded.length - 1)
  })
})

describe('Week 5 case: what crosses each interface agrees with the Week 4 routes (both directions)', () => {
  it('every information interface declares exactly the items the routes carry over it', () => {
    for (const x of INTERFACES.filter((y) => y.kind === 'information')) expect([...new Set(carriesOf(x.id).map((f) => f.info))].sort(), x.id).toEqual([...x.items].sort())
  })
  it('every hop of every route uses an information interface that joins the hop’s two elements; no route uses a physical or organizational interface', () => {
    for (const r of ROUTES) {
      let at = r.from
      for (const v of r.via) {
        const x = INTERFACES.find((y) => y.id === v)!
        expect(x.kind, `${r.info} ${v}`).toBe('information')
        expect(x.ends, `${r.info} ${v}`).toContain(at)
        at = x.ends[0] === at ? x.ends[1] : x.ends[0]
      }
      if (r.via.length) expect(at, r.info).toBe(r.to)
    }
    for (const x of INTERFACES.filter((y) => y.kind !== 'information')) expect(carriesOf(x.id), x.id).toEqual([])
  })
  it('directions are computed: IF-012 carries go / no-go to dispatch and relays charge-session records back; IF-007 is one way', () => {
    expect(directionOf(INTERFACES.find((x) => x.id === 'IF-012')!)).toBe('PHY-005 → PHY-004 (INFO-003, INFO-006); PHY-004 → PHY-005 (INFO-003)')
    expect(directionOf(INTERFACES.find((x) => x.id === 'IF-007')!)).toBe('PHY-008 → EXT-006 (INFO-010)')
    expect(COUNTS.twoWay).toEqual(['IF-001', 'IF-002', 'IF-003', 'IF-005', 'IF-008', 'IF-012'])
  })
  it('negative direction: a definition that omits a carried item, or claims one the routes do not carry, is caught', () => {
    const x = INTERFACES.find((y) => y.id === 'IF-008')!
    const computed = [...new Set(carriesOf('IF-008').map((f) => f.info))].sort()
    expect(computed).not.toEqual(x.items.filter((i) => i !== 'INFO-007').sort())
    expect(computed).not.toEqual([...x.items, 'INFO-009'].sort())
  })
})

describe('Week 5 case: crossing flows, externals and the driving question', () => {
  it('every function information flow between two physical elements rides an information interface (computed from the Week 4 functions)', () => {
    const flows = crossingFlows()
    expect(flows.length).toBe(COUNTS.crossingFlows)
    expect(flows.filter((f) => !f.covered)).toEqual([])
  })
  it('the driving question: in the Week 4 view the pad incident records had no route and PHY-008 had one interface; IF-015 now carries them', () => {
    expect(DRIVING_QUESTION.routeBefore).toEqual([])
    expect(DRIVING_QUESTION.degreeBefore).toBe(1)
    expect(W4_FINDINGS.find((f) => f.id === 'F3')!.owner).toBe('Week 5')
    expect(INFORMATION.find((x) => x.id === 'INFO-006')!.routes.find((r) => r.from === 'PHY-008')!.via).toEqual([])
    expect(ROUTES.find((r) => r.info === 'INFO-006' && r.from === 'PHY-008')!.via).toEqual(['IF-015'])
    expect(INTERFACE_DECISION.alternatives).toContain(INTERFACE_DECISION.chosen)
  })
  it('DEC-003 counts what the data say: both interface options end with the same N² size, so the rationale does not rest on a count', () => {
    const after = RECEIVED.length + ADDED_IDS.filter((id) => id === 'IF-015').length
    expect(RECEIVED.length + INTERFACE_DECISION.counts.direct).toBe(after)
    expect(RECEIVED.length + INTERFACE_DECISION.counts.relay).toBe(after)
    expect(INTERFACE_DECISION.path).toEqual({ direct: 1, relay: 2, manual: 0 })
    expect(INTERFACE_DECISION.rationale).not.toMatch(/relay adds an interface/i)
  })
  it('the FN-010 producer exists upstream: the fire detection function outputs the pad incident records that FN-016 consumes (Week 4 N1)', () => {
    expect(FUNCTIONS.find((f) => f.id === 'FN-010')!.outputs.some((o) => o.info === 'INFO-006')).toBe(true)
  })
  it('data, decision and decider are kept apart: the data are produced at the fire detection system, the decision is made at the operations center, by people', () => {
    expect(DRIVING_QUESTION.producedAt).toBe('PHY-008')
    expect(DRIVING_QUESTION.decidedAt).toBe(FUNCTIONS.find((f) => f.id === 'FN-016')!.phy)
    expect(INFORMATION.find((x) => x.id === 'INFO-006')!.producers).toContain(DRIVING_QUESTION.producedAt)
    expect(INFORMATION.find((x) => x.id === 'INFO-006')!.consumers).toContain(DRIVING_QUESTION.decidedAt)
  })
  it('negative direction: without IF-015 the pad incident flow is uncovered', () => {
    const without = INTERFACES.filter((x) => x.id !== 'IF-015')
    const flows = crossingFlows(without)
    expect(flows.filter((f) => !f.covered).map((f) => `${f.fn}:${f.from}`)).toEqual(['FN-016:PHY-008'])
  })
  it('every external element has an interface or a recorded reason; on the received set EXT-004 had neither', () => {
    expect(undisposedExternals()).toEqual([])
    expect(externalsWithoutInterface()).toEqual(Object.keys(EXTERNAL_DISPOSITIONS))
    const receivedWithout = DIAGONAL.filter((d) => d.startsWith('EXT-') && !degreeOf(d, RECEIVED))
    expect(receivedWithout.filter((id) => !EXTERNAL_DISPOSITIONS[id])).toEqual(['EXT-004'])
  })
})

describe('Week 5 case: components', () => {
  it('every level-2 component refines its parent’s Week 4 allocation (its functions are a subset), and every broken-down element has at least two components', () => {
    for (const c of COMPONENTS) for (const f of c.functions) expect(functionsAt(c.parent), `${c.id} ${f}`).toContain(f)
    for (const p of PHYSICAL) {
      const n = componentsOf(p.id).length
      expect(n === 0 || n >= 2, p.id).toBe(true)
    }
    expect([COUNTS.level1, COUNTS.level2, COUNTS.brokenDown.length]).toEqual([8, 15, 5])
  })
  it('every function allocated to a broken-down element is carried by at least one of its components', () => {
    for (const p of COUNTS.brokenDown) for (const f of functionsAt(p)) expect(componentsOf(p).some((c) => c.functions.includes(f)), `${p} ${f}`).toBe(true)
  })
  it('negative direction: a component claiming a function of another element is caught', () => {
    expect(functionsAt('PHY-003')).not.toContain('FN-005')
  })
})

describe('Week 5 case: security and resilience at the interfaces', () => {
  it('trust-boundary reasons, recomputed: IF-008 crosses because its booking end faces the public; the radio datalink interfaces IF-002 and IF-013 cross (R54 p.331); IF-012 only possibly (leased ground network); IF-004 crosses none', () => {
    expect(boundaryReasons(INTERFACES.find((x) => x.id === 'IF-008')!)).toEqual(['public-facing end'])
    expect(boundaryReasons(INTERFACES.find((x) => x.id === 'IF-004')!)).toEqual([])
    for (const id of ['IF-002', 'IF-013']) expect(boundaryReasons(INTERFACES.find((x) => x.id === id)!), id).toEqual(['radio medium'])
    expect(crossesBoundary(INTERFACES.find((x) => x.id === 'IF-012')!)).toBe(false)
    expect(COUNTS.crossing).toHaveLength(14)
    expect(HIDDEN_EXTERNAL).toEqual(['IF-002', 'IF-008', 'IF-010', 'IF-012', 'IF-013', 'IF-014', 'IF-015'])
    expect(RADIO_INTERFACES).toEqual(['IF-002', 'IF-013'])
    expect(LEASE_DEPENDENT.filter((id) => !COUNTS.crossing.includes(id))).toEqual(['IF-012'])
  })
  it('confirmation N7: one trust-boundary cell for every interface table (lesson, slides, Examples), both directions', () => {
    const cell = (id: string, none?: string) => crossingText(INTERFACES.find((x) => x.id === id)!, none)
    expect(cell('IF-012')).toBe(POSSIBLE_CROSSING)
    expect(cell('IF-012', 'no')).toBe(POSSIBLE_CROSSING)
    expect(cell('IF-004')).toBe('none')
    expect(cell('IF-004', 'no')).toBe('no')
    expect(cell('IF-013')).toBe('radio medium')
    // a crossing lease-dependent interface shows its reasons, never "possibly"
    for (const id of LEASE_DEPENDENT.filter((x) => COUNTS.crossing.includes(x))) expect(cell(id), id).not.toBe(POSSIBLE_CROSSING)
    const possible = INTERFACES.filter((x) => crossingText(x) === POSSIBLE_CROSSING).map((x) => x.id)
    const none = INTERFACES.filter((x) => crossingText(x) === 'none').map((x) => x.id)
    expect([COUNTS.crossing.length, possible, none]).toEqual([14, ['IF-012'], ['IF-004']])
  })
  it('radio medium, both directions: radio, Wi-Fi, cellular, satellite media cross; a wired ground network alone does not', () => {
    const base = { ...INTERFACES.find((y) => y.id === 'IF-012')! }
    for (const medium of ['radio link', 'site Wi-Fi', 'wifi', 'cellular data', 'LTE modem', '5G slice', 'satellite relay', 'wireless mesh', 'air-ground datalink']) expect(boundaryReasons({ ...base, medium }), medium).toContain('radio medium')
    for (const medium of ['ground network (PHY-006)', 'fibre between the two buildings', 'a document', 'charging cable', 'radiography report courier']) expect(boundaryReasons({ ...base, medium }), medium).not.toContain('radio medium')
  })
  it('IF-013 (radio, safety data) authenticates its sender as well as checking integrity', () => {
    expect(INTERFACES.find((y) => y.id === 'IF-013')!.protection.join(' ')).toMatch(/authenticat/)
  })
  it('every interface that crosses a trust boundary states its protection or why it needs none; every interface states its degraded mode', () => {
    for (const x of INTERFACES.filter(crossesBoundary)) expect(x.protection.length > 0 || words(x.noProtectionReason ?? '') >= 3, x.id).toBe(true)
    for (const x of INTERFACES) expect(words(x.degraded), x.id).toBeGreaterThanOrEqual(5)
  })
  it('every interface carrying safety-related data names an integrity or authentication measure', () => {
    for (const id of COUNTS.safetyData) expect(INTERFACES.find((x) => x.id === id)!.protection.join(' '), id).toMatch(/integrity|authenticat|tamper|one way/i)
  })
  it('every interface carrying personal data names encryption or separation', () => {
    for (const id of COUNTS.personalData) expect(INTERFACES.find((x) => x.id === id)!.protection.join(' '), id).toMatch(/encrypt|separation/i)
  })
  it('the DEC-002 condition is on IF-008: domain separation, with R-009 linked', () => {
    const x = INTERFACES.find((y) => y.id === 'IF-008')!
    expect(x.protection.join(' ')).toMatch(/domain separation/)
    expect(x.risks).toContain('R-009')
  })
  it('negative direction: a crossing interface with neither protection nor reason fails the rule', () => {
    const x = { ...INTERFACES.find((y) => y.id === 'IF-010')!, protection: [], noProtectionReason: undefined }
    expect(crossesBoundary(x) && !(x.protection.length > 0 || words(x.noProtectionReason ?? '') >= 3)).toBe(true)
    expect(ownerOf('EXT-003')).toMatch(/no owner/)
  })
})

describe('Week 5 case: the new interface requirements pass Week 2’s own requirement gates', () => {
  const record = (reqs: typeof INTERFACE_REQUIREMENTS): Week2Record =>
    normalizeRecord({
      ...EMPTY_RECORD,
      week1: { team: '00', enterprise: 'standard', needs: NEEDS.map((n) => ({ id: n.id, name: n.name, statement: n.statement })), goals: [], stakeholders: [] },
      conops: { soiName: SCENARIO_SOI.name, soi: SCENARIO_SOI.name },
      capabilities: CAPABILITIES.map((c) => ({ id: c.id, name: c.name, statement: c.text, needs: c.needs })),
      uncertainties: [...UNCERTAINTIES, ...W3_UNKNOWNS].map((u) => ({ id: u.id, name: u.name, tbx: u.tbx ?? '', owner: u.owner, closeBy: u.closeBy, validation: u.closeBy })),
      requirements: [...REQUIREMENTS, ...W3_REQUIREMENTS, ...reqs].map((q) => ({ id: q.id, name: q.name, statement: q.statement, type: q.type, method: q.method, criterion: q.criterion, rationale: q.rationale, parents: q.parents.join(', '), owner: 'JS' })),
    })
  const failures = (reqs: typeof INTERFACE_REQUIREMENTS) => {
    const r = record(reqs)
    return Object.fromEntries(reqs.map((q) => [q.id, assessRequirement(r.requirements.find((x) => x.id === q.id)!, r).gates.filter((g) => !g.ok).map((g) => g.id)]))
  }
  it('every interface requirement passes every Week 2 hard gate, names its interface, and that interface lists it', () => {
    expect(failures(INTERFACE_REQUIREMENTS)).toEqual(Object.fromEntries(INTERFACE_REQUIREMENTS.map((q) => [q.id, []])))
    for (const q of INTERFACE_REQUIREMENTS) {
      expect(q.statement).toContain(q.interface)
      expect(INTERFACES.find((x) => x.id === q.interface)!.requirements).toContain(q.id)
    }
  })
  it('negative direction: a compound statement (two “shall”s) fails the one-shall gate', () => {
    const compound = { ...INTERFACE_REQUIREMENTS[0], statement: `${INTERFACE_REQUIREMENTS[0].statement.replace(/\.$/, '')}, and shall receive its acceptance before release.` }
    expect(failures([compound])['REQ-SYS-013']).toContain('one-shall')
  })
})

describe('Week 5 case: numbers the notes use, recomputed by hand', () => {
  it('latency budget: 30 + 30 + 30 = 90 s of the 120 s, margin 30 s, across IF-013 and IF-012', () => {
    expect(LATENCY_BUDGET.used).toBe(90)
    expect(LATENCY_BUDGET.margin).toBe(LATENCY_BUDGET.limitS - LATENCY_BUDGET.legs.reduce((a, l) => a + l.seconds, 0))
    expect(LATENCY_BUDGET.margin).toBeGreaterThan(0)
    expect(LATENCY_BUDGET.legs.map((l) => l.where)).toEqual(['IF-013', 'FN-008 at PHY-005', 'IF-012'])
  })
  it('coupling (course metric): 23 function flows; A crosses 14 (κ 0.61, 6 pairs), B crosses 20 (κ 0.87, 10 pairs); B has 4 crossing pairs with no information interface, A none', () => {
    expect(FN_FLOWS).toHaveLength(23)
    expect([COUPLING.A.X, COUPLING.A.P, COUPLING.A.Dmax, COUPLING.A.kappa.toFixed(2)]).toEqual([14, 6, 5, '0.61'])
    expect([COUPLING.B.X, COUPLING.B.P, COUPLING.B.Dmax, COUPLING.B.kappa.toFixed(2)]).toEqual([20, 10, 5, '0.87'])
    expect(uncoveredPairs(COUPLING.A.pairs)).toEqual([])
    expect(uncoveredPairs(COUPLING.B.pairs)).toHaveLength(4)
    // by hand: a flow crosses when its two functions sit on different elements
    const crossA = FN_FLOWS.filter((f) => FUNCTIONS.find((x) => x.id === f.from)!.phy !== FUNCTIONS.find((x) => x.id === f.to)!.phy).length
    expect(crossA).toBe(COUPLING.A.X)
  })
  it('integration aggregates: by owner leaves 6 interfaces between aggregates, aircraft-and-charging-first leaves 4; externals are verified apart', () => {
    const [g1, g2] = GROUPINGS.map(groupingCounts)
    expect([g1.between.length, g2.between.length, g1.external]).toEqual([6, 4, 5])
    expect(g1.inside + g1.between.length + g1.external).toBe(INTERFACES.length)
  })
  it('the change request: IF-005’s N² neighbours are exactly the interfaces sharing an aircraft or charger end; its reach is among them or a requirement', () => {
    expect(CHANGE_REQUEST.neighbours).toEqual(['IF-001', 'IF-002', 'IF-006', 'IF-010', 'IF-013'])
    for (const r of CHANGE_REQUEST.reaches) expect(CHANGE_REQUEST.neighbours.includes(r.id) || REQ_IDS.has(r.id), r.id).toBe(true)
    expect(CHANGE_REQUEST.owners).toEqual(['AeroLink', 'Vertiport operators'])
  })
  it('the ICWG includes every owner of an interface that joins two organizations', () => {
    for (const id of ICWG.interfaces) for (const e of INTERFACES.find((x) => x.id === id)!.ends) expect(ICWG.members).toContain(ownerOf(e))
  })
  it('the configuration carried from Weeks 3–4: 16 aircraft, 6 vertiports with 4 hubs, 12 chargers', () => {
    expect([COUNTS.aircraft, COUNTS.vertiports, COUNTS.hubs, COUNTS.chargers]).toEqual([16, 6, 4, 12])
  })
})

describe('Week 5 case: continuity', () => {
  it('Week 4 names Week 5 as the next owner of the physical view and routes; every Week 4 hand-over has a disposition and none is left pending', () => {
    expect(W4_FEED.week).toBe('Week 5')
    for (const h of W4_HANDOVERS) expect(['resolved', 're-dated']).toContain(h.status)
    const toWeek5 = W4_FINDINGS.filter((f) => f.owner === 'Week 5').map((f) => f.id)
    for (const id of toWeek5) expect(W4_HANDOVERS.some((h) => h.from.includes(`finding ${id}`)), id).toBe(true)
  })
  it('the received interface set has an empty row for EXT-004 that the audit closes, and verification covers fewer than half the interfaces (an honest finding)', () => {
    expect(degreeOf('EXT-004', RECEIVED)).toBe(0)
    expect(degreeOf('EXT-004')).toBe(1)
    expect(COUNTS.verified.length).toBeLessThan(INTERFACES.length / 2)
  })
})

describe('Week 5 case: the reference interfaces pass the Week 5 lab tool’s own hard gates (the case obeys the rules it teaches)', () => {
  const snapshot = {
    team: '00', enterprise: 'standard', soi: 'standard', needs: [], capabilities: [], requirements: [], risks: RISKS_SNAP, tpms: [],
    physical: PHYSICAL.map((p) => ({ id: p.id, name: p.name, text: p.text })), externals: W4_EXTERNALS.map((x) => ({ id: x.id, name: x.name })),
    functions: FUNCTIONS.map((f) => ({ id: f.id, name: f.name, phy: f.phy, log: f.log })), information: [], ai: [], decisions: [], threePersonTeam: false, week4Status: 'ready', sourceVersion: 1,
  }
  const toTool = (x: InterfaceDef): ToolInterface => ({
    ...EMPTY_INTERFACE(x.id), name: x.name, kind: x.kind, endA: x.ends[0], endB: x.ends[1],
    crosses: x.kind === 'information' ? x.items.join(', ') : x.kind === 'physical' ? x.flows.map((f) => f.item).join('; ') : `agreement ${x.agreement}`,
    direction: x.kind === 'organizational' ? '' : directionOf(x), medium: x.medium, constraint: x.constraint, requirements: x.requirements.join(', '),
    ownerA: ownerOf(x.ends[0]), ownerB: ownerOf(x.ends[1]), verification: x.verification.join(', ') || (x.verificationPlan ?? ''), protection: x.protection.join('; '), noProtectionReason: x.noProtectionReason ?? '',
    degraded: x.degraded, risks: x.risks.join(', '), exposed: x.ends.some((e) => e === 'PHY-007'),
  })
  const record = normalizeW5({ ...EMPTY_W5, week4: snapshot, interfaces: INTERFACES.map(toTool) })
  it('every one of the 16 interfaces passes every hard gate of the tool', () => {
    const failed = Object.fromEntries(record.interfaces.map((x) => [x.id, assessInterface(x, record).gates.filter((g) => !g.ok).map((g) => g.id)]))
    expect(failed).toEqual(Object.fromEntries(INTERFACES.map((x) => [x.id, []])))
  })
  it('negative direction: dropping the degraded mode, or the protection and its reason on a crossing interface, fails the tool’s gates', () => {
    const if10 = { ...record.interfaces.find((x) => x.id === 'IF-010')!, protection: '', noProtectionReason: '' }
    expect(assessInterface(if10, record).gates.find((g) => g.id === 'protection')!.ok).toBe(false)
    const if1 = { ...record.interfaces.find((x) => x.id === 'IF-001')!, degraded: '' }
    expect(assessInterface(if1, record).gates.find((g) => g.id === 'degraded')!.ok).toBe(false)
  })
})
