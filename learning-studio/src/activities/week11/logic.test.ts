import { describe, expect, it } from 'vitest'
import { referenceUpTo } from '../../model/reference'
import { sysmlSource } from '../../lib/sysml'
import {
  DONE, REFERENCE_SCN002_FLOW, SCN001_SKELETON_FLOW, START, TEAM_K_SCN005_FLOW, checkFlow, flowErrors, mappingMarkdown, scenarioSpec,
  type FlowModel,
} from './flow'
import { REFERENCE_MACHINE, TEAM_K_MACHINE, TRACES, analyseMachine, fire, guardValue, runTrace, type StateMachine } from './states'
import { MODEL_RIDS, PRACTICE_TARGET, blankRid, checkCriterion, checkRid, checkRidSet, distinctFindings, practiceUnlock, ridMarkdown, ridOk, type Rid } from './rids'
import { blockLines, edgeSet, nodeSet, parseFlow, parseMachine, transitionSet } from './listing.testutil'

const ref = referenceUpTo(3)
const spec = (id: string) => scenarioSpec(ref.elements.find((e) => e.id === id)!, ref)
const failing = (fs: ReturnType<typeof checkFlow>) => fs.filter((f) => !f.ok).map((f) => f.id)
const errors = (fs: ReturnType<typeof checkFlow>) => flowErrors(fs).map((f) => f.id)
const msg = (fs: ReturnType<typeof checkFlow>, id: string) => fs.find((f) => f.id === id)!.message
const clone = (f: FlowModel): FlowModel => JSON.parse(JSON.stringify(f))
const FRAGMENT = 'week11/aerolink_review_fragment_team_k.sysml'
const SCN002 = 'week11/aerolink_scn002_action_flow.sysml'

// L11 model answer for SCN-001 (instructor key, kept in the test so it is not shipped in the bundle): A1 offers the
// next slot or a waitlist and merges back before step 3; A2 offers an alternative or declines, then done; A3 confirms
// the step-free route and rejoins at step 5. The answer key, q11-8 and the coverage tool must agree on it (W11-F02).
const n = (id: string, kind: FlowModel['nodes'][number]['kind'], covers: string[] = [], fn?: string) => ({ id, kind, covers, ...(fn ? { fn } : {}) })
const L11_MODEL_SCN001: FlowModel = {
  nodes: [
    n('enterRequest', 'action', ['M1']), n('checkWeatherAndCapacity', 'action', ['M2'], 'FN-001'),
    n('weatherCheck', 'decide'), n('offerAlternativeOrDecline', 'action', ['A2']),
    n('capacityCheck', 'decide'), n('offerNextSlotOrWaitlist', 'action', ['A1']), n('quoteReady', 'merge'),
    n('quoteFare', 'action', ['M3'], 'FN-001'), n('confirmBooking', 'action', ['M4']),
    n('assistanceCheck', 'decide'), n('confirmStepFreeRoute', 'action', ['A3']), n('bookingComplete', 'merge'),
    n('assignAircraft', 'action', ['M5'], 'FN-002'), n('issueBoardingPass', 'action', ['M6'], 'FN-001'),
  ],
  edges: [
    { from: START, to: 'enterRequest' }, { from: 'enterRequest', to: 'checkWeatherAndCapacity' }, { from: 'checkWeatherAndCapacity', to: 'weatherCheck' },
    { from: 'weatherCheck', to: 'offerAlternativeOrDecline', guard: 'destinationOnHold' }, { from: 'weatherCheck', to: 'capacityCheck', guard: 'else' },
    { from: 'offerAlternativeOrDecline', to: DONE },
    { from: 'capacityCheck', to: 'quoteReady', guard: 'aircraftWithin15min' }, { from: 'capacityCheck', to: 'offerNextSlotOrWaitlist', guard: 'else' },
    { from: 'offerNextSlotOrWaitlist', to: 'quoteReady' }, { from: 'quoteReady', to: 'quoteFare' }, { from: 'quoteFare', to: 'confirmBooking' },
    { from: 'confirmBooking', to: 'assistanceCheck' }, { from: 'assistanceCheck', to: 'confirmStepFreeRoute', guard: 'assistanceRequested' }, { from: 'assistanceCheck', to: 'bookingComplete', guard: 'else' },
    { from: 'confirmStepFreeRoute', to: 'bookingComplete' }, { from: 'bookingComplete', to: 'assignAircraft' }, { from: 'assignAircraft', to: 'issueBoardingPass' }, { from: 'issueBoardingPass', to: DONE },
  ],
}

describe('ConOps scenario parsing', () => {
  it('reads SCN-002 as 7 main steps and alternates A1–A3 with their outcomes', () => {
    const s = spec('SCN-002')
    expect(s.main).toHaveLength(7)
    expect(s.main[0].actor).toBe('AeroLink (system of interest)')
    expect(s.alternates.map((a) => [a.ref, a.atStep, a.outcome, a.rejoinAt])).toEqual([['A1', 6, 'rejoin', 7], ['A2', 4, 'rejoin', 5], ['A3', 3, 'end', undefined]])
  })
  it('reads SCN-005 and SCN-001 alternates', () => {
    expect(spec('SCN-005').alternates.map((a) => a.outcome)).toEqual(['rejoin', 'end', 'end'])
    expect(spec('SCN-001').alternates.map((a) => a.rejoinAt ?? 'end')).toEqual([3, 'end', 5])
  })
})

describe('flow coverage checker', () => {
  it('rule 4: the reference SCN-002 flow passes every error-level check and every advisory', () => {
    const fs = checkFlow(spec('SCN-002'), REFERENCE_SCN002_FLOW)
    expect(flowErrors(fs)).toEqual([])
    expect(failing(fs)).toEqual([])
  })
  it('the L11 model answer for SCN-001 passes every error-level check (answer key, q11-8 and the tool agree)', () => {
    expect(errors(checkFlow(spec('SCN-001'), L11_MODEL_SCN001))).toEqual([])
  })
  it('W11-F02: the old q11-8 key (accepted alternative rejoins at quoteFare) fails alt-outcome; the new key (then done) passes', () => {
    const old = clone(L11_MODEL_SCN001)
    old.edges = old.edges.map((e) => (e.from === 'offerAlternativeOrDecline' ? { from: e.from, to: 'quoteFare' } : e))
    expect(msg(checkFlow(spec('SCN-001'), old), 'alt-outcome')).toMatch(/A2 ends the scenario but leads on to quoteFare/)
    expect(errors(checkFlow(spec('SCN-001'), L11_MODEL_SCN001))).not.toContain('alt-outcome')
  })
  it('flags the seeded Team K defects: order, A2 not ending, A1 dead end, A3 missing, no else, unlinked step 5', () => {
    const fs = checkFlow(spec('SCN-005'), TEAM_K_SCN005_FLOW)
    expect(failing(fs).sort()).toEqual(['alt-covered', 'alt-outcome', 'decide-else', 'fn-link', 'main-order', 'terminates'].sort())
    expect(msg(fs, 'main-order')).toMatch(/step 2 cannot follow step 1/)
    expect(msg(fs, 'alt-outcome')).toMatch(/A2 ends the scenario but leads on to notifyPassengers/)
    expect(msg(fs, 'alt-outcome')).toMatch(/A1 should rejoin at step 5 but never reaches it/)
    expect(msg(fs, 'alt-covered')).toMatch(/A3/)
    expect(msg(fs, 'fn-link')).toMatch(/step 5/)
  })
  it('the L11 skeleton fails only what the lab asks the team to add (alternates and a decision)', () => {
    expect(errors(checkFlow(spec('SCN-001'), SCN001_SKELETON_FLOW)).sort()).toEqual(['alt-covered', 'minimum'])
  })

  // W11-F03: realistic bad mappings of the worked flow that the earlier checker passed (reviewer probes P1, P2, P5).
  it('mutation P1: A2 rejoining at step 4 (re-board) instead of step 5 is an alt-outcome error', () => {
    const f = clone(REFERENCE_SCN002_FLOW)
    f.edges = f.edges.map((e) => (e.from === 'departWithRemainingParty' ? { from: e.from, to: 'boardPassengers' } : e))
    const fs = checkFlow(spec('SCN-002'), f)
    expect(errors(fs)).toContain('alt-outcome')
    expect(msg(fs, 'alt-outcome')).toMatch(/A2 should rejoin at step 5 but never reaches it \(it only returns to step 4\)/)
  })
  it('mutation: an alternate rejoining at a LATER step than the ConOps says is an error', () => {
    const f = clone(REFERENCE_SCN002_FLOW)
    f.edges = f.edges.map((e) => (e.from === 'departWithRemainingParty' ? { from: e.from, to: 'approachAgain' } : e))
    expect(msg(checkFlow(spec('SCN-002'), f), 'alt-outcome')).toMatch(/A2 should rejoin at step 5 but rejoins at step 6 \(approach\)/)
  })
  it('mutation P2: the A3 branch moved to just after step 1 is an alt-origin error', () => {
    const f = clone(REFERENCE_SCN002_FLOW)
    f.nodes.push({ id: 'earlyCheck', kind: 'decide', covers: [] })
    f.edges = f.edges.filter((e) => !(e.from === 'intentCheck' && e.guard === 'else') && !(e.from === 'planFlight'))
    f.edges.push({ from: 'planFlight', to: 'earlyCheck' }, { from: 'earlyCheck', to: 'fileFlightIntent', guard: 'flightIntentAccepted' }, { from: 'earlyCheck', to: 'holdAndRefile', guard: 'else' })
    f.edges = f.edges.map((e) => (e.from === 'intentCheck' ? { from: e.from, to: e.to } : e)) // intentCheck now just passes on
    f.nodes = f.nodes.map((x) => (x.id === 'intentCheck' ? { ...x, kind: 'merge' as const } : x))
    const fs = checkFlow(spec('SCN-002'), f)
    expect(errors(fs)).toContain('alt-origin')
    expect(msg(fs, 'alt-origin')).toMatch(/A3 should branch at step 3 but is entered from earlyCheck/)
  })
  it('mutation: an alternate branching AFTER a later main step (A2 decided after take-off) is an alt-origin error', () => {
    const f = clone(REFERENCE_SCN002_FLOW)
    f.edges = f.edges.filter((e) => !(e.from === 'boardPassengers' || e.to === 'partyCheck' || e.from === 'takeOff'))
    f.edges.push({ from: 'boardPassengers', to: 'departureReady' }, { from: 'takeOff', to: 'partyCheck' })
    f.edges = f.edges.map((e) => (e.from === 'partyCheck' && e.guard === 'allPassengersPresent' ? { ...e, to: 'cruise' } : e.from === 'departWithRemainingParty' ? { from: e.from, to: 'cruise' } : e))
    expect(msg(checkFlow(spec('SCN-002'), f), 'alt-origin')).toMatch(/A2 should branch at step 4 but is entered from partyCheck/)
  })
  it('mutation P5: a normal landing that goes straight to done skips step 7 on the main path (main-order error)', () => {
    const f = clone(REFERENCE_SCN002_FLOW)
    f.edges = f.edges.map((e) => (e.from === 'landAtDestination' ? { from: e.from, to: DONE } : e))
    const fs = checkFlow(spec('SCN-002'), f)
    expect(errors(fs)).toContain('main-order')
    expect(msg(fs, 'main-order')).toMatch(/step 7 cannot follow step 6 on the main path/)
  })
  it('mutation: a rejoin alternate that goes to done instead is an error', () => {
    const f = clone(REFERENCE_SCN002_FLOW)
    f.edges = f.edges.map((e) => (e.from === 'divertToAlternate' ? { from: e.from, to: DONE } : e))
    expect(msg(checkFlow(spec('SCN-002'), f), 'alt-outcome')).toMatch(/A1 should rejoin at step 7 but one path ends at done/)
  })
  it('mutation: an alternate reached without a guard is reported as always happening', () => {
    const f = clone(REFERENCE_SCN002_FLOW)
    f.edges = f.edges.map((e) => (e.from === 'partyCheck' && e.to === 'departWithRemainingParty' ? { from: 'boardPassengers', to: 'departWithRemainingParty' } : e))
    f.nodes = f.nodes.filter((x) => x.id !== 'partyCheck')
    f.edges = f.edges.filter((e) => e.from !== 'partyCheck' && e.to !== 'partyCheck')
    f.edges.push({ from: 'boardPassengers', to: 'departureReady' })
    expect(failing(checkFlow(spec('SCN-002'), f))).toContain('alt-guarded')
  })
  it('mutation: a decision with an unguarded branch, and a decision with one branch, are errors', () => {
    const f = clone(REFERENCE_SCN002_FLOW)
    f.edges = f.edges.map((e) => (e.from === 'intentCheck' && e.guard === 'flightIntentAccepted' ? { from: e.from, to: e.to } : e))
    expect(msg(checkFlow(spec('SCN-002'), f), 'decide-branches')).toMatch(/Unguarded branch out of a decision: intentCheck/)
    const g = clone(REFERENCE_SCN002_FLOW)
    g.edges = g.edges.filter((e) => !(e.from === 'intentCheck' && e.guard === 'else'))
    expect(failing(checkFlow(spec('SCN-002'), g))).toEqual(expect.arrayContaining(['decide-branches', 'reachable']))
  })
  it('mutation: an end alternate that loops back into the main flow is caught (realistic: “re-file and carry on”)', () => {
    const f = clone(REFERENCE_SCN002_FLOW)
    f.edges = f.edges.map((e) => (e.from === 'holdAndRefile' ? { from: 'holdAndRefile', to: 'fileFlightIntent' } : e))
    expect(msg(checkFlow(spec('SCN-002'), f), 'alt-outcome')).toMatch(/A3 ends the scenario but leads on to/)
  })
  it('mutation: undeclared targets, a node unreachable from start, and no decision at all', () => {
    const f = clone(REFERENCE_SCN002_FLOW)
    f.edges.push({ from: 'cruise', to: 'landing' })
    expect(failing(checkFlow(spec('SCN-002'), f))).toContain('graph')
    const linear: FlowModel = { nodes: [{ id: 'a', kind: 'action', covers: ['M1'] }, { id: 'b', kind: 'action', covers: [] }], edges: [{ from: START, to: 'a' }, { from: 'a', to: DONE }] }
    expect(failing(checkFlow(spec('SCN-002'), linear))).toEqual(expect.arrayContaining(['reachable', 'minimum', 'main-covered', 'alt-covered']))
  })
  it('exports a mapping table with every ConOps item', () => {
    const md = mappingMarkdown(spec('SCN-002'), REFERENCE_SCN002_FLOW)
    expect(md).toMatch(/\| Step 3 \| EXT-001 \|.*\| intentCheck \|/)
    expect(md).toMatch(/\| A1 \(step 6\) \|.*\| holdForPad, divertToAlternate \|/)
  })
})

describe('encodings match the listings edge by edge and guard by guard (W11-F23)', () => {
  const flowOf = (file: string, header: RegExp) => parseFlow(blockLines(sysmlSource(file) ?? '', header))
  it('the worked SCN-002 flow', () => {
    const p = flowOf(SCN002, /use case <'SCN-002'>/)
    expect(edgeSet(p)).toEqual(edgeSet(REFERENCE_SCN002_FLOW))
    expect(nodeSet(p)).toEqual(nodeSet(REFERENCE_SCN002_FLOW))
  })
  it('Team K’s SCN-005 draft', () => {
    const p = flowOf(FRAGMENT, /use case <'SCN-005'>/)
    expect(edgeSet(p)).toEqual(edgeSet(TEAM_K_SCN005_FLOW))
    expect(nodeSet(p)).toEqual(nodeSet(TEAM_K_SCN005_FLOW))
  })
  it('the L11 starter skeleton', () => {
    const p = flowOf('week11/aerolink_l11_starter_scn001.sysml', /use case <'SCN-001'>/)
    expect(edgeSet(p)).toEqual(edgeSet(SCN001_SKELETON_FLOW))
    expect(nodeSet(p)).toEqual(nodeSet(SCN001_SKELETON_FLOW))
  })
  it('Team K’s weather machine and the reference operating states', () => {
    const k = parseMachine(blockLines(sysmlSource(FRAGMENT) ?? '', /state def VertiportWeatherStates/))
    expect([k.states, k.initial, transitionSet(k)]).toEqual([TEAM_K_MACHINE.states, TEAM_K_MACHINE.initial, transitionSet(TEAM_K_MACHINE)])
    const r = parseMachine(blockLines(sysmlSource('week11/aerolink_operating_states.sysml') ?? '', /state def AircraftOperatingStates/))
    expect([r.states, r.initial, transitionSet(r)]).toEqual([REFERENCE_MACHINE.states, REFERENCE_MACHINE.initial, transitionSet(REFERENCE_MACHINE)])
  })
  it('mutation: changing the guard on fragment line 39, or a transition target, makes the comparison fail', () => {
    const lines = (sysmlSource(FRAGMENT) ?? '').split(/\r?\n/)
    expect(lines[38]).toMatch(/if alternateWithinReserve then divertNearest;/)
    const guardMutant = lines.map((l, i) => (i === 38 ? l.replace('alternateWithinReserve', 'alternateClosed') : l)).join('\n')
    expect(edgeSet(parseFlow(blockLines(guardMutant, /use case <'SCN-005'>/)))).not.toEqual(edgeSet(TEAM_K_SCN005_FLOW))
    const targetMutant = lines.map((l, i) => (i === 56 ? l.replace('then open', 'then hold') : l)).join('\n')
    expect(transitionSet(parseMachine(blockLines(targetMutant, /state def VertiportWeatherStates/)))).not.toEqual(transitionSet(TEAM_K_MACHINE))
  })
})

describe('state-machine walker', () => {
  it('rule 4: the reference machine passes every check', () => {
    expect(analyseMachine(REFERENCE_MACHINE).filter((f) => !f.ok)).toEqual([])
  })
  it('guards: the dispatch transition fires only with no open no-go fault', () => {
    expect(guardValue('not noGoFaultOpen', { noGoFaultOpen: true })).toBe(false)
    expect(guardValue('a and b', {})).toBeUndefined()
    expect(fire(REFERENCE_MACHINE, 'dispatchReady', 'DispatchRelease', { noGoFaultOpen: true })).toMatchObject({ next: null })
    expect(fire(REFERENCE_MACHINE, 'dispatchReady', 'DispatchRelease', {})).toMatchObject({ next: 'inFlight' })
    expect(fire(REFERENCE_MACHINE, 'inFlight', 'ChargerConnected')).toMatchObject({ next: null, reason: expect.stringMatching(/No transition from inFlight/) })
  })
  it('ConOps traces T1–T3 run on the reference; T4 exposes a gap (no fault transition while charging), recorded as a finding', () => {
    const r = Object.fromEntries(TRACES.map((t) => [t.id, runTrace(REFERENCE_MACHINE, t)]))
    expect([r.T1.matches, r.T2.matches, r.T3.matches]).toEqual([true, true, true])
    expect(r.T4).toMatchObject({ matches: false, stoppedAt: 1 })
  })
  it('flags the seeded Team K machine: closedForDay unreachable, and below the L11 minimum', () => {
    expect(analyseMachine(TEAM_K_MACHINE).filter((f) => !f.ok).map((f) => f.id)).toEqual(['reachable', 'minimum'])
  })
  it('W11-F07: applying the RID-IN-05 and RID-IN-09 fixes to the fragment clears the walker’s reachability and minimum errors', () => {
    const lines = (sysmlSource(FRAGMENT) ?? '').split(/\r?\n/)
    const fixed = lines.flatMap((l, i) => {
      if (i === 54) return ['accept ForecastClear then clearing;', 'accept after 2 [h] then closedForDay;', 'state clearing;', 'accept after 30 [min] then open;', 'accept LimitForecast then hold;'] // line 55 (IN-09) + IN-05
      if (i === 56) return ['accept OperatingDayStart then open;'] // line 57 (IN-05)
      return [l]
    }).join('\n')
    const m = parseMachine(blockLines(fixed, /state def VertiportWeatherStates/))
    // 'after' triggers are time triggers; the walker treats them as named events.
    expect(analyseMachine(m).filter((f) => f.level === 'error' && !f.ok)).toEqual([])
    expect(MODEL_RIDS[4].fix).toMatch(/private import SI::\*;/) // probe p45 FAILs without the import (notes)
  })
  it('mutation: removing returnToService makes outOfService a sink; removing connectCharger strands three states', () => {
    const noReturn: StateMachine = { ...REFERENCE_MACHINE, transitions: REFERENCE_MACHINE.transitions.filter((t) => t.id !== 'returnToService') }
    expect(analyseMachine(noReturn).find((f) => f.id === 'exits')!.message).toMatch(/outOfService/)
    const noConnect: StateMachine = { ...REFERENCE_MACHINE, transitions: REFERENCE_MACHINE.transitions.filter((t) => t.id !== 'connectCharger') }
    expect(analyseMachine(noConnect).find((f) => f.id === 'reachable')!.message).toMatch(/charging, dispatchReady, inFlight/)
  })
  it('mutation: two initial states, a competing transition and an undeclared target are each reported', () => {
    const two: StateMachine = { ...REFERENCE_MACHINE, initial: ['onPad', 'charging'] }
    expect(analyseMachine(two).find((f) => f.id === 'initial')!.ok).toBe(false)
    const compete: StateMachine = { ...REFERENCE_MACHINE, transitions: [...REFERENCE_MACHINE.transitions, { id: 'faultOnPad2', from: 'onPad', trigger: 'NoGoFaultReported', to: 'charging' }] }
    expect(analyseMachine(compete).find((f) => f.id === 'determinism')!.ok).toBe(false)
    expect(fire(compete, 'onPad', 'NoGoFaultReported')).toMatchObject({ next: null, reason: expect.stringMatching(/Undetermined/) })
    const dangling: StateMachine = { ...REFERENCE_MACHINE, transitions: [...REFERENCE_MACHINE.transitions, { id: 'x', from: 'inFlight', trigger: 'Divert', to: 'diverted' }] }
    expect(analyseMachine(dangling).find((f) => f.id === 'names')!.message).toMatch(/diverted/)
  })
})

describe('RID writer screens', () => {
  it('rule 4: every instructor model RID passes the screens, and the set passes', () => {
    for (const r of MODEL_RIDS) expect(checkRid(r).filter((c) => !c.ok), r.id).toEqual([])
    expect(checkRidSet(MODEL_RIDS).filter((c) => !c.ok)).toEqual([])
  })
  it('W11-F06: model RID severities follow the course scale (a missing ConOps alternate, an unexhibited state usage and a below-minimum machine are major)', () => {
    const sev = Object.fromEntries(MODEL_RIDS.map((r) => [r.id, r.severity]))
    expect([sev['RID-IN-06'], sev['RID-IN-07'], sev['RID-IN-08']]).toEqual(['major', 'major', 'major'])
    expect(MODEL_RIDS.find((r) => r.id === 'RID-IN-08')!.criterion).toMatch(/L11 minimum/)
  })
  it('model RIDs point at lines that hold the named element in the seeded fragment', () => {
    const lines = (sysmlSource(FRAGMENT) ?? '').split(/\r?\n/)
    expect(lines[33]).toMatch(/action suspendNetwork/)
    expect(lines[44]).toMatch(/liftHold/)
    expect(lines[53]).toMatch(/state hold/)
    expect(lines[54]).toMatch(/accept ForecastClear then open;/)
    expect(lines[55]).toMatch(/state closedForDay/)
    expect(lines[56]).toMatch(/accept ForecastClear then open;/)
    expect(lines[58]).toMatch(/state vertiportWeatherStates/)
    expect(lines[62]).toMatch(/'PHY-002'/)
    expect(lines[17]).toMatch(/'LOG-001'/)
  })
  const good: Rid = MODEL_RIDS[4]
  const bad = (patch: Partial<Rid>) => checkRid({ ...good, ...patch }).filter((c) => !c.ok).map((c) => c.field)
  it('rule 5: realistic vague inputs of passing length are flagged', () => {
    expect(bad({ location: 'The vertiport weather state machine in the behaviour package' })).toEqual(['location'])
    expect(bad({ criterion: 'SysML best practice and good modelling style (RB-8)' })).toEqual(['criterion'])
    expect(bad({ discrepancy: 'The weather behaviour could be improved to better reflect the ConOps scenario and its alternates.' })).toEqual(['discrepancy'])
    expect(bad({ discrepancy: 'The state closedForDay has a doc comment that describes cancelled bookings for the day.' })).toEqual(['discrepancy'])
    expect(bad({ fix: 'Update the state machine accordingly so that it matches the ConOps scenario.' })).toEqual(['fix'])
    expect(bad({ fix: 'Add the missing transition so that this state can be reached properly.' })).toEqual(['fix'])
    expect(bad({ fix: 'Fix closedForDay so that it works as the scenario intends it to.' })).toEqual(['fix'])
    expect(bad({ severity: '' })).toEqual(['severity'])
    expect(bad({ id: 'RID 1' })).toEqual(['id'])
  })
  it('W11-F05: the reviewer’s vague RIDs that used to pass are now flagged (R1, R16, R13, R4)', () => {
    expect(bad({ discrepancy: 'The state machine in Behavior::VertiportWeatherStates does not fully reflect the ConOps and is incomplete.' })).toEqual(['discrepancy'])
    expect(bad({ discrepancy: "The flow in Behavior::'SCN-005' is not complete and is not fully aligned with SCN-005." })).toEqual(['discrepancy'])
    expect(bad({ fix: 'Make closedForDay a proper state.' })).toEqual(['fix'])
    expect(bad({ criterion: 'RB-9.9 and S06 p.999' })).toEqual(['criterion'])
    expect(checkCriterion('RB-9.9').problem).toMatch(/RB-9.9 is not a criterion/)
    expect(checkCriterion('S06 p.999').problem).toMatch(/S06 999/)
    expect(bad({ discrepancy: 'Behavior::VertiportWeatherStates only has three states, but the ConOps has more cases.' })).toEqual(['discrepancy'])
  })
  it('W11-F05: naturally written good RIDs pass (plurals, UpperCamel and plain state names, “slide 54”)', () => {
    const natural: Rid[] = [
      { id: 'RID-T3-01', location: 'VertiportWeatherStates, state hold', criterion: 'SCN-005 A3', category: 'semantics', severity: 'major', discrepancy: 'State hold is never left except on ForecastClear, so a hold longer than 2 h cannot lead to closedForDay as A3 requires.', fix: 'Add two transitions: hold to closedForDay on after 2 [h]; closedForDay to open on a next-day signal.', owner: 'AB' },
      { id: 'RID-T3-02', location: 'LimitForecast trigger, state open', criterion: 'S10 slide 54', category: 'semantics', severity: 'minor', discrepancy: 'No element of the model sends LimitForecast, so the transition from open to hold can fire only if something outside the model sends it.', fix: 'Replace accept LimitForecast with accept when forecastAtLimit; and declare attribute forecastAtLimit : Boolean.', owner: 'AB' },
      { id: 'RID-T3-03', location: 'ForecastClear transitions (lines 55 and 57)', criterion: 'SCN-005 step 7', category: 'semantics', severity: 'major', discrepancy: 'Both transitions on ForecastClear go to open without the 30 min wait that step 7 requires before the hold is lifted.', fix: 'Add state clearing between hold and open with accept after 30 [min] then open.', owner: 'AB' },
      { id: 'RID-T3-04', location: 'PHY-002 vertiports', criterion: 'RB-8.5; S10 sl.56', category: 'traceability', severity: 'major', discrepancy: 'PHY-002 has no exhibit, so no part exhibits the vertiport weather states and the thread stops at the state usage.', fix: 'Add exhibit Behavior::vertiportWeatherStates; to PHY-002.', owner: 'AB' },
      { id: 'RID-T3-05', location: 'decide alternateCheck (line 37)', criterion: 'S10 sl.38; SCN-005 A1', category: 'semantics', severity: 'major', discrepancy: 'The guards of alternateCheck overlap when alternateOpen and alternateWithinReserve are both true, and there is no else for the priority landing.', fix: 'Make the second guard (not alternateOpen) and alternateWithinReserve, and add else declarePriorityLanding;', owner: 'AB' },
    ]
    for (const r of natural) expect(checkRid(r).filter((c) => !c.ok).map((c) => `${c.field}: ${c.message}`), r.id).toEqual([])
  })
  it('severity screens: a conventions RID rated major, and a checker error rated minor, are questioned', () => {
    expect(bad({ category: 'conventions', severity: 'major' })).toEqual(['severity'])
    expect(bad({ category: 'validity', severity: 'minor' })).toEqual(['severity'])
  })
  it('set screens: fewer than the minimum, fewer than 2 semantic/traceability, missing writer initials, duplicates', () => {
    expect(checkRidSet(MODEL_RIDS.slice(0, 3)).find((c) => /at least 5/.test(c.message))!.ok).toBe(false)
    expect(checkRidSet(MODEL_RIDS.slice(0, 3), PRACTICE_TARGET).find((c) => /at least 3/.test(c.message))!.ok).toBe(true)
    const styleOnly = MODEL_RIDS.map((r) => ({ ...r, category: 'completeness' as const }))
    expect(checkRidSet(styleOnly).find((c) => /RB-17.2/.test(c.message))!.ok).toBe(false)
    const anon = MODEL_RIDS.map((r, i) => (i === 0 ? { ...r, owner: '' } : r))
    expect(checkRidSet(anon).find((c) => /initials/.test(c.message))!.ok).toBe(false)
    expect(checkRidSet([...MODEL_RIDS, { ...MODEL_RIDS[0] }]).filter((c) => !c.ok).map((c) => c.message).join(' ')).toMatch(/Duplicate RID IDs: RID-IN-01/)
    const renamedCopy = { ...MODEL_RIDS[0], id: 'RID-IN-99', location: `${MODEL_RIDS[0].location} (again)` }
    expect(checkRidSet([...MODEL_RIDS, renamedCopy]).filter((c) => !c.ok).map((c) => c.message).join(' ')).toMatch(/same discrepancy/)
  })
  it('W11-F14: the instructor key and the Team K tool results unlock on distinct findings, not on any saved count', () => {
    const one = MODEL_RIDS[0]
    const copies = [one, { ...one, id: 'RID-IN-21' }, { ...one, id: 'RID-IN-22' }, { ...one, id: 'RID-IN-23' }, { ...one, id: 'RID-IN-24' }]
    expect(distinctFindings(copies)).toHaveLength(1)
    expect(practiceUnlock(copies).ok).toBe(false)
    expect(practiceUnlock(MODEL_RIDS.slice(0, 2)).ok).toBe(false)
    expect(practiceUnlock(MODEL_RIDS.slice(0, 3))).toMatchObject({ ok: true, count: 3 })
    const unscreened = MODEL_RIDS.slice(0, 3).map((r, i) => (i === 2 ? { ...r, fix: 'Fix it.' } : r))
    expect(practiceUnlock(unscreened).ok).toBe(false)
  })
  it('a blank RID fails every field, and the Markdown export escapes pipes', () => {
    expect(ridOk(blankRid('RID-T1-01'))).toBe(false)
    expect(ridMarkdown([{ ...good, discrepancy: 'a | b' }])).toMatch(/a \\\| b/)
  })
})
