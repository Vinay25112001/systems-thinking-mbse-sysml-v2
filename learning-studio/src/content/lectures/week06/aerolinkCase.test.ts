// Week 6 AeroLink case: every trace resolves; every impact candidate is judged and no judgment is stale; every hand-over
// to Week 6 has a disposition; the baseline model is pinned (the baseline trajectory includes the committed Year-2 step, and
// every gap and excess is measured against it, an excess being ABOVE the desired level); the transition order of the
// committed step, the capacity and excess numbers, Increment 1's hub-out transition risk and the trigger of the Increment 2
// capacity step are recomputed here from the Week 3 trade rules; the case follows its own record rules
// (off-ramp wherever an immature technology is inserted, a security or resilience risk and a transition risk linked, every
// later increment states its security and resilience change); and the reference passes the Week 6 lab tool's own hard
// gates, so the worked example never models an entry the students' tool would refuse. Each check is also shown able to fail
// on a mutated copy, so a clean run is not a vacuous pass.
import { describe, expect, it } from 'vitest'
import {
  EMPTY_RECORD, assessArou, assessGap, assessIncrement, assessTech, assessUnknown, normalizeRecord, type Week5Snapshot, type Week6Record,
} from '../../../workbench/week6/record'
import { REQUIRED_CAPACITY, TRADE_RULES as T, capacityOf } from '../week03/aerolinkCase'
import { blockText } from '../text'
import { WEEK6_SESSION1 } from './session1'
import {
  AEROLINK_HORIZONS, AROU_UPDATE, BASELINE, BASELINE_REVIEW, COUNTS, DRIVING_QUESTION, FLEET_STEP, GAPS, HANDOVERS_TO_W6, IMPACT_CANDIDATE_IDS, IMPACT_JUDGED, INC2_STEP, INCREMENTS, KNOWN_IDS, YEAR2, YEAR2_TRANSITION,
  KNOWN_UNKNOWNS, SECURITY_RESILIENCE_LINKS, TECH_PLAN, TRANSITION_RISKS, UTILIZATION_LIMIT, demandSupported, insertionReady, isImmature, unjudgedCandidates, type CaseIncrement,
} from './aerolinkCase'

/** Every ID a case entry points at. */
function tracesOf(incs: CaseIncrement[] = INCREMENTS): { from: string; to: string }[] {
  const out: { from: string; to: string }[] = []
  for (const g of GAPS) for (const id of g.sources) out.push({ from: g.id, to: id })
  for (const x of incs) for (const id of [...x.serves, ...x.dependencies, ...x.risks, ...x.inserts]) out.push({ from: x.id, to: id })
  for (const t of TECH_PLAN) if (t.insertion) out.push({ from: t.id, to: t.insertion })
  for (const u of KNOWN_UNKNOWNS) out.push({ from: u.id, to: u.gates })
  for (const a of AROU_UPDATE) out.push({ from: a.id, to: a.increment })
  return out
}
const unresolved = (incs?: CaseIncrement[]) => tracesOf(incs).filter((t) => !KNOWN_IDS.has(t.to))

describe('Week 6 case: traces resolve', () => {
  it('every gap, increment, technology, unknown and AROU item points at IDs that exist', () => {
    expect(unresolved()).toEqual([])
  })
  it('the technology plan and the increments agree: each technology is inserted by the increment that lists it', () => {
    for (const t of TECH_PLAN.filter((x) => x.insertion)) expect(INCREMENTS.find((x) => x.id === t.insertion)!.inserts, t.id).toContain(t.id)
    for (const x of INCREMENTS) for (const id of x.inserts) expect(TECH_PLAN.find((t) => t.id === id)?.insertion, `${x.id} inserts ${id}`).toBe(x.id)
  })
  it('a technology not inserted says why', () => {
    for (const t of TECH_PLAN.filter((x) => !x.insertion)) expect((t.notInserted ?? '').length, t.id).toBeGreaterThan(10)
  })
  it('negative direction: a dependency on an increment that does not exist is caught', () => {
    const bad = INCREMENTS.map((x) => (x.id === 'INC-002' ? { ...x, dependencies: ['INC-099'] } : x))
    expect(unresolved(bad)).toEqual([{ from: 'INC-002', to: 'INC-099' }])
  })
})

describe('Week 6 case: the impact list', () => {
  it('every candidate found by the links is judged, and every judgment belongs to a candidate', () => {
    expect(unjudgedCandidates()).toEqual([])
    expect(Object.keys(IMPACT_JUDGED).filter((id) => !IMPACT_CANDIDATE_IDS.includes(id))).toEqual([])
    for (const [id, j] of Object.entries(IMPACT_JUDGED)) expect(j.why.length, id).toBeGreaterThan(10)
  })
  it('the counts the notes use are computed from the judgments', () => {
    expect(COUNTS.candidates).toBe(IMPACT_CANDIDATE_IDS.length)
    expect(COUNTS.reached).toBe(IMPACT_CANDIDATE_IDS.filter((id) => IMPACT_JUDGED[id].reached).length)
    expect(COUNTS.reached).toBeGreaterThan(0)
    expect(COUNTS.reached).toBeLessThan(COUNTS.candidates)
  })
  it('negative direction: a candidate with no judgment is caught', () => {
    const judged = { ...IMPACT_JUDGED }
    delete judged['IF-002']
    expect(IMPACT_CANDIDATE_IDS.filter((id) => !judged[id])).toEqual(['IF-002'])
  })
})

describe('Week 6 case: numbers recomputed from the Week 3 trade rules', () => {
  it('the baseline capacity is the smaller of the fleet and charger limits, fleet-limited', () => {
    expect(BASELINE.fleetLimit).toBe(BASELINE.aircraft * T.tripsPerAircraft)
    expect(BASELINE.chargerLimit).toBe(BASELINE.turnaroundChargers * T.chargesPerCharger)
    expect(BASELINE.capacity).toBe(Math.min(BASELINE.fleetLimit, BASELINE.chargerLimit))
    expect(BASELINE.capacity).toBe(BASELINE.fleetLimit)
  })
  it('the near-term capacity entry and the charger excess are differences of computed values, measured against the trajectory', () => {
    expect(COUNTS.capacityExcess).toBe(YEAR2.capacity - REQUIRED_CAPACITY)
    expect(COUNTS.capacityExcess).toBeGreaterThan(0)
    expect(COUNTS.snapshotGap).toBe(REQUIRED_CAPACITY - BASELINE.capacity)
    expect(COUNTS.chargerSlack).toBe(YEAR2.chargerLimit - YEAR2.capacity)
    expect(COUNTS.idleHours).toBe(24 - T.operatingHours)
    expect(COUNTS.idleChargers).toBe(YEAR2.turnaroundChargers)
    expect(GAPS.find((g) => g.id === 'GAP-001')!.size).toBe(`${COUNTS.capacityExcess} trips/day above the desired level`)
    expect(GAPS.find((g) => g.id === 'GAP-002')!.size).toBe(`${YEAR2.turnaroundChargers} chargers × ${COUNTS.idleHours} h a night`)
    // the committed step lands above the desired level because the Week 3 box offered whole fleet steps
    expect(FLEET_STEP.smallest.added).toBe(YEAR2.addedAircraft)
    expect(FLEET_STEP.exact).toBeLessThan(YEAR2.aircraft)
  })
  it('the committed Year-2 step: aircraft first is charger-limited and short of the requirement; hub first keeps capacity and reaches it with the n-th aircraft', () => {
    expect(YEAR2.capacity).toBeGreaterThanOrEqual(REQUIRED_CAPACITY)
    expect(YEAR2_TRANSITION.aircraftFirst).toBeLessThan(REQUIRED_CAPACITY)
    expect(YEAR2_TRANSITION.aircraftFirstBinding).toBe('chargers')
    expect(YEAR2_TRANSITION.hubFirst).toBe(BASELINE.capacity)
    expect(YEAR2_TRANSITION.needed).toBe(Math.ceil(REQUIRED_CAPACITY / T.tripsPerAircraft))
    expect(YEAR2_TRANSITION.needed * T.tripsPerAircraft).toBeGreaterThanOrEqual(REQUIRED_CAPACITY)
    expect((YEAR2_TRANSITION.needed - 1) * T.tripsPerAircraft).toBeLessThan(REQUIRED_CAPACITY)
    // each step adds one aircraft and never loses capacity; the last step is the month-24 trajectory capacity
    const caps = YEAR2_TRANSITION.steps.map((s) => s.capacity)
    for (let i = 1; i < caps.length; i++) expect(caps[i]).toBeGreaterThanOrEqual(caps[i - 1])
    expect(caps[caps.length - 1]).toBe(YEAR2.capacity)
    expect(YEAR2_TRANSITION.addedForRequired).toBeLessThanOrEqual(YEAR2_TRANSITION.added)
  })
  it('Increment 1’s transition risk R-012 is real: with one hub out the network is charger-limited below the requirement', () => {
    expect(YEAR2.oneHubOut).toBe(capacityOf(YEAR2.aircraft, YEAR2.turnaroundChargers - T.chargersPerHub))
    expect(YEAR2.oneHubOut).toBeLessThan(REQUIRED_CAPACITY)
    const r012 = AROU_UPDATE.find((a) => a.id === 'R-012')!
    expect(r012.increment).toBe('INC-001')
    expect(r012.transition).toBe(true)
    expect(r012.text).toContain(`${YEAR2.oneHubOut} trips/day`)
  })
  it('the Increment 2 capacity step fires above what the baseline trajectory supports at the utilization limit', () => {
    expect(UTILIZATION_LIMIT).toBeGreaterThan(0)
    expect(UTILIZATION_LIMIT).toBeLessThanOrEqual(1)
    expect(INC2_STEP.trigger).toBe(Math.round(YEAR2.capacity * UTILIZATION_LIMIT))
    expect(INC2_STEP.trigger).toBeGreaterThan(T.demand)
    expect(INC2_STEP.capacity).toBeGreaterThan(YEAR2.capacity)
    expect(INC2_STEP.supports).toBe(demandSupported(INC2_STEP.capacity))
    expect(capacityOf(INC2_STEP.aircraft, YEAR2.turnaroundChargers)).toBeLessThanOrEqual(INC2_STEP.capacity)
  })
  it('the lesson’s claim “only high-power charging passes all three now” holds on the data, and the committed step inserts it', () => {
    expect(TECH_PLAN.filter(insertionReady).map((t) => t.id)).toEqual(['TECH-001'])
    const t1 = TECH_PLAN.find((t) => t.id === 'TECH-001')!
    expect(t1.name).toMatch(/high-power charging/i)
    expect(t1.insertion).toBe('INC-000')
    expect(t1.committed).toBe(true)
  })
  it('the driving question’s reasons quote the computed excess and trigger, and the answer is one of the options', () => {
    expect(DRIVING_QUESTION.options.map((o) => o.id)).toContain(DRIVING_QUESTION.answer)
    expect(DRIVING_QUESTION.question).toMatch(/^After the Year-2 decision/)
    expect(DRIVING_QUESTION.reasons[0]).toContain(`${COUNTS.capacityExcess} trips/day`)
    expect(DRIVING_QUESTION.reasons[0]).toContain(`${INC2_STEP.trigger} trips/day`)
    expect(DRIVING_QUESTION.reasons[1]).toMatch(/^Resilience comes first/)
    // the key is the option that names none of the three branches, and Increment 1 is the resilience increment
    expect(DRIVING_QUESTION.options.find((o) => o.id === DRIVING_QUESTION.answer)!.text).toMatch(/none/i)
    expect(INCREMENTS.find((x) => x.order === 1)!.inserts).toEqual(['TECH-004'])
    expect(INCREMENTS.find((x) => x.order === 1)!.serves).toContain('GAP-003')
  })
  it('negative direction: a wrong transition order is caught by the requirement', () => {
    // had the aircraft been accepted before the hub, the network would be short of the requirement
    expect(capacityOf(YEAR2.aircraft, BASELINE.turnaroundChargers) >= REQUIRED_CAPACITY).toBe(false)
  })
})

/** The leading number of a level text ("300 trips/day …" → 300), or null. */
const levelNumber = (s: string) => {
  const m = s.match(/^(\d+)\s/)
  return m ? Number(m[1]) : null
}
describe('Week 6 case: the baseline model is pinned (review M1, integrator decision 2026-10-21)', () => {
  it('the baseline trajectory includes the committed Year-2 step: Increment 0 holds DEC-001 and the month-24 capacity', () => {
    const inc0 = INCREMENTS.find((x) => x.horizon === 'baseline')!
    expect(inc0.content.join(' ')).toContain('DEC-001')
    expect(inc0.content.join(' ')).toContain(`capacity ${YEAR2.capacity} trips/day by month ${YEAR2.month}`)
    expect(inc0.inserts).toContain('TECH-001')
    // no later increment re-plans the committed step
    for (const x of INCREMENTS.filter((y) => y.horizon !== 'baseline')) {
      expect(x.serves, x.id).not.toContain('GAP-001')
      expect(x.inserts, x.id).not.toContain('TECH-001')
      expect(x.dependencies.length, x.id).toBeGreaterThan(0)
    }
  })
  it('GAP-001’s baseline value is the trajectory the notes state (not the entry snapshot), and it is an excess', () => {
    const g1 = GAPS.find((g) => g.id === 'GAP-001')!
    expect(levelNumber(g1.baseline)).toBe(YEAR2.capacity)
    expect(levelNumber(g1.desired)).toBe(REQUIRED_CAPACITY)
    expect(g1.kind).toBe('excess')
    const notes = WEEK6_SESSION1.sections.flatMap((s) => s.slides).find((s) => s.id === 'w6s1-capability-trajectory')!.notes.teach.join(' ')
    expect(notes).toContain(`${YEAR2.capacity} trips a day by month ${YEAR2.month}`)
    const lesson = WEEK6_SESSION1.studentLesson.find((s) => s.id === 'w6-lesson-gaps')!.blocks.flatMap((b) => (b.kind === 'para' || b.kind === 'heading' ? [b.text] : b.kind === 'figure' || b.kind === 'slide-ref' ? [] : blockText(b))).join(' ')
    expect(lesson).toContain(`${YEAR2.capacity} trips a day`)
    expect(lesson).not.toMatch(new RegExp(`the gap is ${COUNTS.snapshotGap}\\b`))
  })
  it('an excess is the baseline ABOVE the desired level; a gap is below it (wherever both levels are numbers)', () => {
    for (const g of GAPS) {
      const d = levelNumber(g.desired)
      const b = levelNumber(g.baseline)
      if (d === null || b === null) continue
      if (g.kind === 'excess') expect(b, g.id).toBeGreaterThan(d)
      else expect(b, g.id).toBeLessThan(d)
    }
    // slack on the non-binding charger limit is not recorded as an excess
    expect(GAPS.find((g) => g.id === 'GAP-002')!.baseline).not.toContain(String(COUNTS.chargerSlack))
  })
  it('negative direction: the entry snapshot as the reference would show a gap of the size the committed step closes', () => {
    expect(COUNTS.snapshotGap).toBeGreaterThan(0)
    expect(BASELINE.capacity < REQUIRED_CAPACITY && YEAR2.capacity >= REQUIRED_CAPACITY).toBe(true)
    const wrong = { ...GAPS.find((g) => g.id === 'GAP-001')!, baseline: `${BASELINE.capacity} trips/day` }
    expect(levelNumber(wrong.baseline)! > levelNumber(wrong.desired)!).toBe(false)
  })
})

describe('Week 6 case: the case follows the record rules it teaches', () => {
  it('three horizons, each with a length and an end state', () => {
    expect(AEROLINK_HORIZONS.map((h) => h.id)).toEqual(['near', 'mid', 'far'])
    for (const h of AEROLINK_HORIZONS) {
      expect(h.length.length, h.id).toBeGreaterThan(3)
      expect(h.endState.length, h.id).toBeGreaterThan(10)
    }
  })
  it('exactly one baseline; at least one increment beyond the near term; each later increment serves a gap, starts at a trigger and states its security and resilience change', () => {
    expect(INCREMENTS.filter((x) => x.horizon === 'baseline').length).toBe(1)
    expect(INCREMENTS.some((x) => x.horizon === 'mid' || x.horizon === 'far')).toBe(true)
    for (const x of INCREMENTS.filter((y) => y.horizon !== 'baseline')) {
      expect(x.serves.some((id) => id.startsWith('GAP-')), x.id).toBe(true)
      expect(x.trigger.length, x.id).toBeGreaterThan(0)
      expect(x.security.length, x.id).toBeGreaterThan(10)
      expect(x.resilience.length, x.id).toBeGreaterThan(10)
      expect(x.approach, x.id).not.toBeNull()
      expect(x.transition.length, x.id).toBeGreaterThan(5)
    }
  })
  it('an off-ramp wherever a later increment inserts an immature technology', () => {
    for (const x of INCREMENTS.filter((y) => y.horizon !== 'baseline')) {
      const immature = x.inserts.filter((id) => isImmature(TECH_PLAN.find((t) => t.id === id)!))
      if (immature.length) expect(x.offRamp.length, `${x.id} inserts ${immature.join(', ')}`).toBeGreaterThan(5)
    }
  })
  it('at least one security or resilience risk and at least one transition risk, each linked to a later increment', () => {
    expect(SECURITY_RESILIENCE_LINKS().length).toBeGreaterThan(0)
    const tr = TRANSITION_RISKS()
    expect(tr.length).toBeGreaterThan(0)
    for (const id of tr) expect(AROU_UPDATE.find((a) => a.id === id)!.increment).not.toBe('INC-000')
  })
  it('every hand-over to Week 6 has a status and a disposition', () => {
    for (const h of HANDOVERS_TO_W6) {
      expect(['closed', 'carried', 're-dated'], h.from).toContain(h.status)
      expect(h.disposition.length, h.from).toBeGreaterThan(20)
      expect(h.item.length, h.from).toBeGreaterThan(3)
    }
  })
  it('the baseline review: a week is ready exactly when it has no open item, and every open item has an owner', () => {
    expect(BASELINE_REVIEW.map((r) => r.week)).toEqual([1, 2, 3, 4, 5])
    for (const r of BASELINE_REVIEW) {
      expect(r.status === 'ready', `Week ${r.week}`).toBe(r.items.length === 0)
      for (const x of r.items) expect(x.owner.trim().length, x.id).toBeGreaterThan(1)
    }
    expect(COUNTS.openItems).toBe(BASELINE_REVIEW.reduce((a, r) => a + r.items.length, 0))
  })
  it('no stale week numbers in the hand-over and review text (Week 6 items re-dated)', () => {
    const text = [...HANDOVERS_TO_W6.map((h) => h.disposition), ...BASELINE_REVIEW.flatMap((r) => r.items.map((x) => `${x.text} ${x.owner}`))].join(' ')
    expect(text).not.toMatch(/Week 14 evolution|before the Week 7 trade study|requirements baseline \(Week 6\)/)
  })
})

/** The AeroLink reference as a Week 6 tool record: every ID the case may point at is made known to the tool through the
 *  snapshot, so the tool judges the entries, not the import. */
function referenceRecord(): Week6Record {
  const ids = [...KNOWN_IDS].map((id) => ({ id, name: id }))
  const snapshot: Week5Snapshot = {
    team: 'instructor', enterprise: 'reference', soi: 'reference', needs: ids, capabilities: [], requirements: [], risks: [], tpms: [], physical: [], externals: [], functions: [], information: [], ai: [], decisions: [],
    components: [], interfaces: [], changes: [], threePersonTeam: false, week5Status: 'ready', sourceVersion: 1,
  }
  return normalizeRecord({
    ...EMPTY_RECORD,
    week5: snapshot,
    horizons: Object.fromEntries(AEROLINK_HORIZONS.map((h) => [h.id, h.length])),
    gaps: GAPS.map((g) => ({ id: g.id, capability: g.capability, kind: g.kind, horizon: g.horizon, desired: g.desired, baseline: g.baseline, sources: g.sources.join(', '), ai: false })),
    technologies: TECH_PLAN.map((t) => ({ id: t.id, name: t.name, status: t.status, trl: t.trl ?? 0, basis: t.basis, insertion: t.insertion ?? '', notInserted: t.notInserted ?? '', risk: t.risk, ai: false })),
    increments: INCREMENTS.map((x) => ({
      id: x.id, baseline: x.horizon === 'baseline', name: x.name, horizon: x.horizon === 'baseline' ? '' : x.horizon, content: x.content.join('; '), serves: x.serves.join(', '), trigger: x.trigger.join('; '),
      dependencies: x.dependencies.join(', '), offRamp: x.offRamp, approach: x.approach ?? '', transition: x.transition, security: `${x.security} ${x.resilience}`, risks: x.risks.join(', '), ai: false,
    })),
    unknowns: KNOWN_UNKNOWNS.map((u) => ({ id: u.id, name: u.name, tbx: u.tbx ?? '', impact: u.impact, need: u.need, mitigation: u.mitigation, owner: u.owner, gates: u.gates, ai: false })),
    arou: AROU_UPDATE.map((a) => ({ id: a.id, kind: a.kind, statement: a.text, category: a.category ?? '', owner: a.owner, increment: a.increment, transition: a.transition, ai: false })),
  })
}

describe('Week 6 case: the reference passes the lab tool’s own hard gates', () => {
  const r = referenceRecord()
  const failing = (rec: Week6Record) => [
    ...rec.gaps.filter((g) => !assessGap(g, rec).counts).map((g) => `${g.id}: ${assessGap(g, rec).gates.filter((x) => !x.ok).map((x) => x.id).join(', ')}`),
    ...rec.technologies.filter((t) => !assessTech(t, rec).counts).map((t) => `${t.id}: ${assessTech(t, rec).gates.filter((x) => !x.ok).map((x) => x.id).join(', ')}`),
    ...rec.increments.filter((x) => !x.baseline && !assessIncrement(x, rec).counts).map((x) => `${x.id}: ${assessIncrement(x, rec).gates.filter((g) => !g.ok).map((g) => g.id).join(', ')}`),
    ...rec.unknowns.filter((u) => !assessUnknown(u, rec).counts).map((u) => `${u.id}: ${assessUnknown(u, rec).gates.filter((x) => !x.ok).map((x) => x.id).join(', ')}`),
    ...rec.arou.filter((a) => !assessArou(a, rec).counts).map((a) => `${a.id}: ${assessArou(a, rec).gates.filter((x) => !x.ok).map((x) => x.id).join(', ')}`),
  ]
  it('every gap, technology, later increment, unknown and AROU item counts', () => {
    expect(failing(r)).toEqual([])
  })
  it('negative direction: the autonomy increment without its off-ramp fails the tool’s off-ramp gate', () => {
    const bad = { ...r, increments: r.increments.map((x) => (x.id === 'INC-003' ? { ...x, offRamp: '' } : x)) }
    expect(failing(bad)).toEqual(['INC-003: off-ramp'])
  })
})
