// Week 4 AeroLink case: every trace resolves; every count the notes use is computed here from the data; the functional
// architecture covers every capability (or gives a disposition) and every system requirement; every function's allocation
// is consistent (its physical element is one its logical element reaches); the physical view carries the Week 3 decision;
// the information view's routes are checked against the interfaces; the reference functions and allocations match the
// instructor reference. Each check is also shown able to fail on a mutated copy, so a clean run is not a vacuous pass.
import { describe, expect, it } from 'vitest'
import { referenceUpTo } from '../../../model/reference'
import { CAPABILITIES, SYSTEM_REQUIREMENTS } from '../week02/aerolinkCase'
import { ALTERNATIVES, DECISION, REQUIRED_CAPACITY, TRADE_RULES, W3_REQUIREMENTS } from '../week03/aerolinkCase'
import { CONCERNS, NEEDS } from '../week01/aerolinkCase'
import {
  AI_CAPABILITIES, ARCH_DECISION, CAPABILITY_DISPOSITIONS, CONCERN_COVERAGE, CONFIGURATION, COUNTS, DISPATCH_ANSWER, EVALUATION, FINDINGS, FOUND_BY_WALK, FUNCTIONS, GROUPS,
  INFORMATION, INTERFACES, KNOWN_IDS, LOGICAL, PHYSICAL, ROUTE_CHECK, SCENARIO_WALKS, STAKEHOLDER_REQUIREMENT_IDS, VIEWPOINTS,
  capabilitiesWithoutFunction, flowCheck, fn, functionsOfCapability, inconsistentAllocations, onlyAnsweredBy, routeCovered, stakeholderRequirementAccount, unallocatedSystemRequirements, uncoveredConcerns, uncoveredRoutes,
  unsourcedInputs,
} from './aerolinkCase'
import { ALLOCATION_CRITERIA, LAB4_MINIMUMS, REQUIRED_VIEW_KINDS, SPAN } from './labBrief'

const ref = referenceUpTo(14)
const refLink = (s: string, type: string) => ref.links.filter((l) => l.source === s && l.type === type).map((l) => l.target)

describe('Week 4 case: traces resolve', () => {
  it('every viewpoint, function, allocation, information item, AI card and the decision points at ids that exist', () => {
    for (const v of VIEWPOINTS) for (const id of [...v.stakeholders, ...v.concerns, ...v.needs]) expect(KNOWN_IDS.has(id), `${v.id} → ${id}`).toBe(true)
    for (const f of FUNCTIONS) for (const id of [f.group, ...f.capabilities, ...f.scenarios, ...f.requirements, f.log, f.phy, f.restsOn]) expect(KNOWN_IDS.has(id), `${f.id} → ${id}`).toBe(true)
    for (const l of LOGICAL) for (const id of l.phys) expect(KNOWN_IDS.has(id), `${l.id} → ${id}`).toBe(true)
    for (const x of INFORMATION) for (const id of [...x.producers, ...x.consumers, ...x.decisionRefs, ...x.routes.flatMap((r) => [r.from, r.to, ...r.via])]) expect(KNOWN_IDS.has(id), `${x.id} → ${id}`).toBe(true)
    for (const a of AI_CAPABILITIES) for (const id of [a.host, a.supports, ...a.inputs, a.risk]) expect(KNOWN_IDS.has(id), `${a.id} → ${id}`).toBe(true)
    for (const t of ARCH_DECISION.tests) expect(KNOWN_IDS.has(t.id), t.id).toBe(true)
    for (const r of EVALUATION) expect(KNOWN_IDS.has(r.id), r.id).toBe(true)
    for (const w of SCENARIO_WALKS) for (const s of w.steps) expect(KNOWN_IDS.has(s.fn), s.fn).toBe(true)
  })
  it('negative direction: an unknown id is not known', () => {
    expect(KNOWN_IDS.has('FN-099')).toBe(false)
    expect(KNOWN_IDS.has('INFO-099')).toBe(false)
  })
})

describe('Week 4 case: viewpoints chosen from concerns', () => {
  it('the view set contains every required kind, each with a purpose question and a form', () => {
    for (const k of REQUIRED_VIEW_KINDS) expect(VIEWPOINTS.some((v) => v.kind === k), k).toBe(true)
    for (const v of VIEWPOINTS) {
      expect(v.purpose.trim().endsWith('?'), v.id).toBe(true)
      expect(v.concerns.length, v.id).toBeGreaterThan(0)
      expect(v.form.split(' ').length, v.id).toBeGreaterThan(4)
    }
  })
  it('every Week 1 concern is answered by at least one viewpoint, and every need is shown in at least one view', () => {
    expect(uncoveredConcerns()).toEqual([])
    expect(COUNTS.concernsCovered).toBe(CONCERNS.length)
    for (const n of NEEDS) expect(VIEWPOINTS.some((v) => v.needs.includes(n.id)), n.id).toBe(true)
    // each viewpoint's concerns belong to its stakeholders
    for (const v of VIEWPOINTS) for (const c of v.concerns) expect(v.stakeholders, `${v.id}: ${c}`).toContain(CONCERNS.find((x) => x.id === c)!.stakeholder)
  })
  it('negative direction: removing the information viewpoint leaves the insurers’ concern uncovered; removing the logical one leaves none (it is there for supplier choice, not coverage)', () => {
    const without = (vp: string) => CONCERN_COVERAGE.map((c) => ({ ...c, viewpoints: c.viewpoints.filter((v) => v !== vp) })).filter((c) => !c.viewpoints.length).map((c) => c.concern)
    expect(without('VP-005')).toEqual(['CON-014'])
    expect(onlyAnsweredBy('VP-005')).toEqual(['CON-014'])
    expect(without('VP-003')).toEqual([])
    expect(onlyAnsweredBy('VP-003')).toEqual([])
  })
  it('review Mo2: the fare concern sits with the functional view, where FN-001 quotes the fare; the logical view no longer claims the manufacturer’s concern', () => {
    expect(VIEWPOINTS.find((v) => v.kind === 'functional')!.concerns).toContain('CON-003')
    expect(VIEWPOINTS.find((v) => v.kind === 'information')!.concerns).not.toContain('CON-003')
    expect(VIEWPOINTS.find((v) => v.kind === 'logical')!.concerns).toEqual(['CON-005'])
    expect(fn('FN-001').requirements).toContain('REQ-SYS-012')
  })
})

describe('Week 4 case: functional architecture', () => {
  it('names are verb and object, every function has inputs and outputs, and a capability', () => {
    for (const f of FUNCTIONS) {
      expect(f.name.split(' ').length, f.id).toBeGreaterThanOrEqual(2)
      expect(f.inputs.length * f.outputs.length, f.id).toBeGreaterThan(0)
      expect(f.capabilities.length, f.id).toBeGreaterThan(0)
      expect(PHYSICAL.some((p) => p.name.toLowerCase() === f.name.toLowerCase()) || LOGICAL.some((l) => l.name.toLowerCase() === f.name.toLowerCase()), f.id).toBe(false)
    }
  })
  it('every function is exercised in a scenario or is a planning function with a reason; the decomposition has three levels and respects 5 ± 2 per level', () => {
    for (const f of FUNCTIONS) expect(f.scenarios.length > 0 || (f.planning ?? '').split(' ').length >= 5, f.id).toBe(true)
    expect(FUNCTIONS.filter((f) => !f.scenarios.length).map((f) => f.id)).toEqual(['FN-013'])
    expect(GROUPS.length).toBeGreaterThanOrEqual(SPAN.low)
    expect(GROUPS.length).toBeLessThanOrEqual(SPAN.high)
    for (const f of FUNCTIONS) expect(GROUPS.some((g) => g.id === f.group), f.id).toBe(true)
    for (const g of GROUPS) expect(FUNCTIONS.some((f) => f.group === g.id), g.id).toBe(true)
  })
  it('every capability has a function or a disposition; only CAP-011 has none, by disposition', () => {
    expect(capabilitiesWithoutFunction()).toEqual(Object.keys(CAPABILITY_DISPOSITIONS))
    expect(COUNTS.capabilitiesServed).toBe(CAPABILITIES.length - 1)
  })
  it('every system requirement is allocated; every stakeholder requirement is refined, allocated or needs no child', () => {
    expect(unallocatedSystemRequirements()).toEqual([])
    expect(COUNTS.systemAllocated).toBe(SYSTEM_REQUIREMENTS.length)
    for (const r of STAKEHOLDER_REQUIREMENT_IDS) expect(stakeholderRequirementAccount(r), r).not.toBe('missing')
    // the Week 2 open item for REQ-STK-016 is closed here, and the Week 3 requirement REQ-STK-018 has its function
    expect(stakeholderRequirementAccount('REQ-STK-016')).toBe('allocated')
    for (const r of W3_REQUIREMENTS) expect(stakeholderRequirementAccount(r.id), r.id).not.toBe('missing')
    expect(COUNTS.stakeholderNoChild).toBe(3)
  })
  it('the scenario walks find exactly the proposed functions for the Week 2 and Week 3 corrections', () => {
    expect(FOUND_BY_WALK.map((x) => x.fn).sort()).toEqual(['FN-015', 'FN-017'])
    expect(FUNCTIONS.filter((f) => f.provenance === 'proposed').map((f) => f.id)).toEqual(['FN-015', 'FN-016', 'FN-017'])
    // every SCN-001 walk step maps to a function that lists SCN-001
    for (const s of SCENARIO_WALKS[0].steps) expect(FUNCTIONS.find((f) => f.id === s.fn)!.scenarios).toContain('SCN-001')
  })
  it('negative direction: a function without a requirement allocation leaves a system requirement unallocated', () => {
    const f = FUNCTIONS.find((x) => x.id === 'FN-006')!
    const saved = f.requirements
    f.requirements = []
    expect(unallocatedSystemRequirements()).toEqual(['REQ-SYS-001'])
    f.requirements = saved
    expect(functionsOfCapability('CAP-999')).toEqual([])
  })
})

describe('Week 4 case: allocation', () => {
  it('every function is allocated to one physical element its logical element reaches, with a criterion from SEBoK and a sentence', () => {
    expect(inconsistentAllocations()).toEqual([])
    for (const f of FUNCTIONS) {
      expect(ALLOCATION_CRITERIA.map((c) => c.id), f.id).toContain(f.criterion)
      expect(f.why.split(' ').length, f.id).toBeGreaterThanOrEqual(8)
    }
  })
  it('the physical view carries the Week 3 decision, computed from the recommended alternative', () => {
    const alt = ALTERNATIVES.find((a) => a.id === DECISION.recommended)!
    expect(CONFIGURATION.aircraft).toBe(alt.aircraft)
    expect(CONFIGURATION.turnaroundChargers).toBe(alt.chargers)
    expect(CONFIGURATION.hubs + CONFIGURATION.spokes).toBe(alt.sites)
    expect(CONFIGURATION.turnaroundChargers + CONFIGURATION.standardChargers).toBe(CONFIGURATION.chargersInstalled)
    expect(CONFIGURATION.capacity).toBe(Math.min(CONFIGURATION.fleetLimit, CONFIGURATION.chargerLimit))
    expect(CONFIGURATION.capacity).toBeGreaterThanOrEqual(REQUIRED_CAPACITY)
  })
  it('review n11: hubs are derived as turnaround chargers ÷ chargers per hub, which holds only while every Week 3 alternative installs its high-power chargers at hubs in whole pairs', () => {
    // If Week 3 ever adds an alternative with a single upgraded charger, CONFIGURATION.hubs must be read from the
    // alternative instead of derived; this assertion fails first and says so.
    for (const a of ALTERNATIVES) expect(a.chargers % TRADE_RULES.chargersPerHub, a.id).toBe(0)
    expect(Number.isInteger(CONFIGURATION.hubs)).toBe(true)
  })
  it('the communications infrastructure is the only physical element with no function (it is a medium)', () => {
    expect(COUNTS.functionlessPhysical).toEqual(['PHY-006'])
  })
  it('the decision lists three alternatives, the chosen one among them, and is tested against a need and two risks', () => {
    expect(ARCH_DECISION.alternatives).toHaveLength(3)
    expect(ARCH_DECISION.alternatives).toContain(ARCH_DECISION.chosen)
    expect(ARCH_DECISION.tests.map((t) => t.id)).toEqual(['NEED-001', 'R-007', 'R-009'])
  })
  it('meets the lab minimums the lecture asks of teams (it is the worked example)', () => {
    expect(FUNCTIONS.length).toBeGreaterThanOrEqual(LAB4_MINIMUMS.functions)
    expect(LOGICAL.length).toBeGreaterThanOrEqual(LAB4_MINIMUMS.logical)
    expect(PHYSICAL.length).toBeGreaterThanOrEqual(LAB4_MINIMUMS.physical)
    expect(INFORMATION.length).toBeGreaterThanOrEqual(LAB4_MINIMUMS.information)
    expect(AI_CAPABILITIES.length).toBeGreaterThanOrEqual(LAB4_MINIMUMS.ai)
    expect(VIEWPOINTS.length).toBeGreaterThanOrEqual(LAB4_MINIMUMS.viewpoints)
  })
  it('negative direction: moving a function to an element its logical element does not reach is caught', () => {
    const f = FUNCTIONS.find((x) => x.id === 'FN-008')!
    const saved = f.phy
    f.phy = 'PHY-004'
    expect(inconsistentAllocations()).toEqual(['FN-008'])
    f.phy = saved
  })
})

describe('Week 4 case: information view', () => {
  it('every item has data and information stated, producers, consumers, a decision with references, and a route for every producer–consumer pair', () => {
    for (const x of INFORMATION) {
      expect(x.data.length * x.information.length, x.id).toBeGreaterThan(0)
      expect(x.producers.length * x.consumers.length, x.id).toBeGreaterThan(0)
      expect(x.decision.split(' ').length, x.id).toBeGreaterThanOrEqual(5)
      expect(x.decisionRefs.length, x.id).toBeGreaterThan(0)
    }
    for (const r of ROUTE_CHECK) expect(r.recorded, `${r.info} ${r.from} → ${r.to}`).toBe(true)
  })
  it('the route check finds exactly one uncovered route: pad incident records to the evidence log (finding F3)', () => {
    expect(uncoveredRoutes().map((r) => `${r.info} ${r.from}→${r.to}`)).toEqual(['INFO-006 PHY-008→PHY-004'])
    expect(FINDINGS.find((f) => f.id === 'F3')!.finding).toMatch(/not in the reference/)
    expect(COUNTS.routesCovered).toBe(COUNTS.routes - 1)
    expect(FINDINGS.find((f) => f.id === 'F3')!.where).toContain('INFO-006')
  })
  it('a relay is checked hop by hop, and an organizational interface carries nothing', () => {
    expect(routeCovered({ from: 'PHY-003', to: 'PHY-005', via: ['IF-010', 'IF-012'] })).toBe(true)
    expect(routeCovered({ from: 'PHY-003', to: 'PHY-005', via: ['IF-012', 'IF-010'] })).toBe(false)
    expect(routeCovered({ from: 'PHY-004', to: 'PHY-005', via: ['IF-004'] })).toBe(false)
    expect(INTERFACES.find((f) => f.id === 'IF-004')!.type).toBe('organizational')
  })
  it('review M1: the dispatch answer keeps data, decisions and deciders apart, and agrees with FN-011’s inputs, their sources and the routes', () => {
    const f11 = fn(DISPATCH_ANSWER.decision)
    expect(DISPATCH_ANSWER.decidedAt).toBe('PHY-004')
    // every FN-011 information input is answered, from the function its source names
    expect(DISPATCH_ANSWER.inputs.map((x) => x.what).sort()).toEqual(f11.inputs.filter((x) => x.kind === 'information').map((x) => x.item).sort())
    for (const x of DISPATCH_ANSWER.inputs) {
      const input = f11.inputs.find((y) => y.item === x.what)!
      expect(input.src, x.what).toBe(x.fn)
      expect(fn(x.fn).phy, x.what).toBe(x.at)
      // an input crosses an interface exactly when it is produced on another element; the item and route must agree
      expect(!!x.crosses, x.what).toBe(x.at !== DISPATCH_ANSWER.decidedAt)
      if (x.crosses) {
        const item = INFORMATION.find((y) => y.id === x.crosses!.info)!
        expect(item.producers, x.what).toContain(x.at)
        const route = item.routes.find((r) => r.from === x.at && r.to === DISPATCH_ANSWER.decidedAt)!
        expect(route.via, x.what).toEqual([x.crosses.via])
        expect(routeCovered(route), x.what).toBe(true)
        expect(INTERFACES.find((f) => f.id === x.crosses!.via)!.type, x.what).toBe('information')
      }
      if (x.madeFrom) {
        const item = INFORMATION.find((y) => y.id === x.madeFrom!.info)!
        expect(item.producers, x.what).toContain(x.madeFrom.at)
        expect(item.consumers, x.what).toContain(DISPATCH_ANSWER.decidedAt)
        expect(routeCovered({ from: x.madeFrom.at, to: DISPATCH_ANSWER.decidedAt, via: [x.madeFrom.via] }), x.what).toBe(true)
        // the data feed the function that makes the input from them
        expect(fn(x.fn).inputs.some((y) => y.info === x.madeFrom!.info), x.what).toBe(true)
      }
    }
    // the hold is the duty manager's decision made inside the operations center; it does not cross IF-011
    const hold = DISPATCH_ANSWER.inputs.find((x) => x.what === 'weather-hold state')!
    expect(hold.crosses).toBeUndefined()
    expect(hold.by).toBe('the duty manager')
    expect(fn(hold.fn).human).toMatch(/duty manager/)
    // the flight plan is made by FN-003 at the operations center; IF-002 carries only the energy state in
    const plan = DISPATCH_ANSWER.inputs.find((x) => x.what === 'flight plan')!
    expect(plan.fn).toBe('FN-003')
    expect(plan.crosses).toBeUndefined()
    // the release goes back to the aircraft in an item that joins the two
    const rel = INFORMATION.find((y) => y.id === DISPATCH_ANSWER.output.info)!
    expect(rel.producers).toContain(DISPATCH_ANSWER.decidedAt)
    expect(rel.consumers).toContain(DISPATCH_ANSWER.output.to)
  })
  it('review M1: the consumer of an item is the party that makes its decision (the insurers’ item is re-scoped to the operations center’s decision)', () => {
    const ev = INFORMATION.find((x) => x.id === 'INFO-006')!
    expect(ev.consumers).toEqual(['PHY-004'])
    expect(ev.decision).toMatch(/operations center/)
    expect(ev.decision).not.toMatch(/insurers’ premium/)
    // items whose decision is made outside AeroLink name the external system as their consumer
    expect(INFORMATION.find((x) => x.id === 'INFO-010')!.consumers).toEqual(['EXT-006'])
    expect(INFORMATION.find((x) => x.id === 'INFO-009')!.consumers).toContain('EXT-001')
  })
  it('every AI capability names human oversight and a failure mode and reads an existing information item', () => {
    for (const a of AI_CAPABILITIES) {
      expect(a.oversight.split(' ').length, a.id).toBeGreaterThanOrEqual(6)
      expect(a.failure.split(' ').length, a.id).toBeGreaterThanOrEqual(6)
      for (const x of a.inputs) expect(INFORMATION.some((y) => y.id === x), a.id).toBe(true)
    }
  })
  it('review M1: every information input states its source, so the flow check sees every flow; every flow between two elements travels in an item that joins them', () => {
    expect(unsourcedInputs()).toEqual([])
    const flows = flowCheck()
    expect(flows.filter((x) => x.status === 'unlisted')).toEqual([])
    expect(flows.filter((x) => x.status === 'no-route').map((x) => `${x.fn} ${x.from}→${x.to}`)).toEqual(['FN-016 PHY-008→PHY-004'])
    expect(COUNTS.crossFlowsListed).toBe(COUNTS.crossFlows)
    // the flows the review named are now carried: the disruption decision, flight intent, the alarm, the release
    const carried = (fnId: string, to: string) => flows.find((x) => x.fn === fnId && x.to === to)?.info
    expect(carried('FN-015', 'PHY-007')).toBe('INFO-007')
    expect(carried('FN-012', 'EXT-001')).toBe('INFO-009')
    expect(carried('FN-010', 'EXT-006')).toBe('INFO-010')
    expect(carried('FN-005', 'PHY-001')).toBe('INFO-008')
  })
  it('negative direction: the flow check fails for a flow nobody listed, for an item that does not join the two elements, and for an unsourced input', () => {
    // (a) a new cross-element flow with no item: FN-017 made to read flight data from the aircraft
    const f17 = FUNCTIONS.find((x) => x.id === 'FN-017')!
    f17.inputs.push({ item: 'live position of every airborne flight', kind: 'information', src: 'FN-005' })
    expect(flowCheck().filter((x) => x.status === 'unlisted').map((x) => `${x.fn} ${x.from}→${x.to}`)).toEqual(['FN-017 PHY-001→PHY-004'])
    f17.inputs.pop()
    // (b) the disruption decision pointed at an item that does not reach the booking platform
    const f15 = FUNCTIONS.find((x) => x.id === 'FN-015')!
    const input = f15.inputs.find((x) => x.src === 'FN-004')!
    input.info = 'INFO-004'
    expect(flowCheck().filter((x) => x.status === 'unlisted').map((x) => x.fn)).toEqual(['FN-015'])
    // (c) the item removed from the information view altogether: both flows it carried are found
    input.info = 'INFO-007'
    const k = INFORMATION.findIndex((x) => x.id === 'INFO-007')
    const [saved] = INFORMATION.splice(k, 1)
    expect(flowCheck().filter((x) => x.status === 'unlisted').map((x) => x.fn).sort()).toEqual(['FN-001', 'FN-015'])
    INFORMATION.splice(k, 0, saved)
    // (d) an input with no stated source is reported, because the check could not see it
    const src = input.src
    delete input.src
    expect(unsourcedInputs()).toEqual(['FN-015: hold, diversion or cancellation decision'])
    input.src = src
    expect(flowCheck().filter((x) => x.status === 'unlisted')).toEqual([])
  })
  it('negative direction: deleting an interface uncovers its routes', () => {
    const k = INTERFACES.findIndex((f) => f.id === 'IF-012')
    const [saved] = INTERFACES.splice(k, 1)
    expect(uncoveredRoutes().length).toBeGreaterThan(1)
    INTERFACES.splice(k, 0, saved)
    expect(uncoveredRoutes()).toHaveLength(1)
  })
})

describe('Week 4 case: evaluation and reference agreement', () => {
  it('the evaluation rows carry computed evidence; open items are named, not hidden', () => {
    expect(EVALUATION.find((r) => r.id === 'REQ-STK-004')!.evidence).toContain(String(CONFIGURATION.capacity))
    expect(EVALUATION.filter((r) => r.verdict === 'open').map((r) => r.id)).toEqual(['REQ-SYS-008', 'R-007', 'R-009', 'REQ-STK-016'])
    // review Mo4: an interface is not evidence of latency, and the capacity threshold is the Week 3 constant
    expect(EVALUATION.find((r) => r.id === 'REQ-SYS-008')!.evidence).toMatch(/latency/)
    expect(EVALUATION.find((r) => r.id === 'REQ-STK-004')!.item).toContain(String(REQUIRED_CAPACITY))
  })
  it('the fourteen reference functions keep the reference names, capabilities, scenarios and physical allocation', () => {
    expect(FUNCTIONS.filter((x) => x.provenance !== 'proposed')).toHaveLength(14)
    for (const f of FUNCTIONS.filter((x) => x.provenance !== 'proposed')) {
      const el = ref.elements.find((x) => x.id === f.id)
      expect(el?.name, f.id).toBe(f.name)
      const refCaps = refLink(f.id, 'derives-from').filter((t) => t.startsWith('CAP-'))
      // a corrected function keeps every reference capability and adds only capabilities the Week 2 case added
      if (f.provenance === 'reference') expect(refCaps.sort(), f.id).toEqual([...f.capabilities].sort())
      else for (const c of refCaps) expect(f.capabilities, f.id).toContain(c)
      expect(refLink(f.id, 'derives-from').filter((t) => t.startsWith('SCN-')).sort(), f.id).toEqual([...f.scenarios].sort())
      expect(refLink(f.id, 'allocated-to'), f.id).toEqual([f.phy])
    }
  })
  it('the logical elements keep the reference allocation to physical elements, and perform the reference functions', () => {
    for (const l of LOGICAL) {
      expect(refLink(l.id, 'allocated-to').sort(), l.id).toEqual([...l.phys].sort())
      for (const f of refLink(l.id, 'performs')) expect(FUNCTIONS.find((x) => x.id === f)!.log, `${l.id} performs ${f}`).toBe(l.id)
    }
  })
})
