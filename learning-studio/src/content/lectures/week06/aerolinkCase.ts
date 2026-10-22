// AeroLink Week 6 case: the enterprise evolution roadmap. The baseline ("as is", increment 0) and the capability gaps and
// excesses over three horizons; the technology plan built from the Week 3 readiness assessment, with every candidate read
// for maturity, insertability and operational timing; the increments with their content, entry triggers, dependencies,
// off-ramps, development approach, transition approach and security and resilience change; the known-unknowns record;
// the AROU update with its transition risks; the impact of the autonomy increment across the Weeks 1–5 artifacts; the
// dispositions of everything Weeks 2–5 handed to Week 6; and the Phase I baseline review that prepares Week 7. The single
// source for the Week 6 lectures (session1.ts, session2.ts), their figures (src/components/figures/LectureWeek6S1.tsx,
// S2.tsx), the worked-examples page and the tests (aerolinkCase.test.ts). Exported names are kept stable; fields are only
// ever added.
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week06/WEEK06_LECTURE_OUTLINE.md §4.
//
// AeroLink Urban Mobility is FICTIONAL. Every number, name and statement is a teaching value, not a real-world claim.
//
// Provenance. Week 1–5 data are IMPORTED, never retyped: stakeholders, concerns and needs from ../week01; objectives,
// capabilities, requirements and the Week 2 unknowns from ../week02; the technologies with their TRLs and assumptions, the
// risks, opportunities, TPMs, the trade rules and alternatives, the trade decision DEC-001 and the Week 2 dispositions from
// ../week03; the functions, physical elements, AI capability cards, DEC-002 and the Week 4 feed-forward from ../week04; the
// interfaces, the change request ICR-001, the Week 5 findings and feed-forward from ../week05 (all read-only). Every
// capacity, limit, utilization threshold, transition step and count below is COMPUTED from the Week 3 trade rules, so a
// change upstream flows through and the tests catch any number that no longer holds.
//
// What this module adds, each `provenance: 'proposed'` (instructor to confirm): the bucket lengths of the three horizons;
// Increments 1, 2 and 3 and their content, triggers, off-ramps and transition approaches; TECH-004 (vertiport on-site energy
// storage, resting on the proposed assumption A-009) and TECH-005 (the higher-power charger of ICR-001, with no maturity
// evidence held); the unknowns U-008 (certification basis for remote or autonomous operation) and U-009 (storage
// integration); the transition risks R-012 and R-013; and the change of R-011 from accept to mitigate.
//
// Baseline model (integrator decision 2026-10-21 on review M1; faculty may revisit): SEBoK's baseline is current AND
// planned capability (R12 pp.860, 862). The Week 3 decision DEC-001 (ALT-004) is already committed, so it is part of the
// baseline trajectory (Increment 0): 240 trips/day at entry into service, 320 by month 24. Every gap and excess is measured
// against that trajectory (COMPUTED below, asserted in aerolinkCase.test.ts), and Increment 1 is the first change AFTER
// the Year-2 decision. The entry snapshot (BASELINE) is kept for the as-is view and for the "wrong reference" teaching
// point: measured against it, the near-term capacity would show a gap the committed step already closes.
import { CONCERNS, NEEDS, STAKEHOLDERS, type CaseProvenance } from '../week01/aerolinkCase'
import { CAPABILITIES, OBJECTIVES, REQUIREMENTS, UNCERTAINTIES } from '../week02/aerolinkCase'
import {
  ASSUMPTIONS, DECISION as TRADE_DECISION, MORPH_FLEET, OPPORTUNITIES, REQUIRED_CAPACITY, RISKS, TECHNOLOGIES, TPMS, TRADE_RULES, W2_DISPOSITIONS, W3_REQUIREMENTS, W3_UNKNOWNS, alternative, capacityOf, retainedOf,
} from '../week03/aerolinkCase'
import { AI_CAPABILITIES, ARCH_DECISION, FEEDS_FORWARD as W4_FEEDS, FINDINGS as W4_FINDINGS, FUNCTIONS, PHYSICAL } from '../week04/aerolinkCase'
import { CHANGE_REQUEST, FEEDS_FORWARD_W5, FINDINGS as W5_FINDINGS, INTERFACES } from '../week05/aerolinkCase'
import { MATURE_TRL, type ApproachId, type HorizonId, type TechStatus } from './labBrief'

export const AEROLINK_W6_REVIEW = 'new-pending-review' as const
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
const T = TRADE_RULES

// ================================================================================================ horizons
/** AeroLink's three planning horizons (proposed). SEBoK maps gaps into near-, mid- and far-term buckets, five, ten and
 *  twenty years for long-lasting capabilities and one, two and three for fast-changing ones (R12 p.862); MITRE's planning
 *  horizon is usually 5–10 years (R105 p.530). AeroLink is a young service on a fast-moving technology, so its buckets are
 *  short: the near term ends at the Year-2 capacity objective (MGO-007). The buckets do not overlap: year 5 belongs to the
 *  mid term (review n4). */
export const AEROLINK_HORIZONS: { id: HorizonId; label: string; length: string; endState: string; provenance: CaseProvenance }[] = [
  { id: 'near', label: 'Near term', length: 'to month 24 (Year 2)', endState: 'the Year-2 capacity objective met with headroom by the committed step (DEC-001)', provenance: 'proposed' },
  { id: 'mid', label: 'Mid term', length: 'years 3–5', endState: 'a network that withstands a grid outage, with the evidence autonomy will need', provenance: 'proposed' },
  { id: 'far', label: 'Far term', length: 'years 6–10', endState: 'remote or autonomous flight operations, if the evidence allows', provenance: 'proposed' },
]
export const horizon = (id: string) => AEROLINK_HORIZONS.find((h) => h.id === id)!

// ================================================================================================ the baseline (increment 0)
const baseAlt = alternative('ALT-001')
const inc1Alt = alternative(TRADE_DECISION.recommended)
/** The "as is" at entry into service, COMPUTED from the Week 3 baseline alternative and trade rules. */
export const BASELINE = {
  alternative: baseAlt.id,
  aircraft: baseAlt.aircraft,
  sites: baseAlt.sites,
  hubs: baseAlt.chargers / T.chargersPerHub,
  turnaroundChargers: baseAlt.chargers,
  fleetLimit: baseAlt.aircraft * T.tripsPerAircraft,
  chargerLimit: baseAlt.chargers * T.chargesPerCharger,
  capacity: capacityOf(baseAlt.aircraft, baseAlt.chargers),
  operatingHours: T.operatingHours,
  retainedAfterHubLoss: retainedOf(baseAlt.aircraft, baseAlt.chargers),
  platform: ARCH_DECISION.chosen,
  platformDecision: ARCH_DECISION.id,
}
/** Which limit binds a configuration: the fleet or the chargers. */
export const bindingOf = (aircraft: number, chargers: number) => (aircraft * T.tripsPerAircraft <= chargers * T.chargesPerCharger ? 'fleet' : 'chargers')
/** The MGO-007 utilization rule: demand may use at most 80 % of the capacity (300 = 240 ÷ 0.8). */
export const UTILIZATION_LIMIT = Number(OBJECTIVES.find((o) => o.id === 'MGO-007')!.text.match(/no more than (\d+) %/)![1]) / 100
/** The highest planning demand a capacity supports under the utilization rule. */
export const demandSupported = (capacity: number) => Math.round(capacity * UTILIZATION_LIMIT)

/** The committed Year-2 step (DEC-001, the recommended Week 3 alternative), COMPUTED. It is part of the baseline
 *  trajectory (Increment 0): where AeroLink's current plans lead by month 24 without any further change. */
export const YEAR2 = {
  alternative: inc1Alt.id,
  month: 24,
  aircraft: inc1Alt.aircraft,
  addedAircraft: inc1Alt.addedAircraft,
  hubs: inc1Alt.chargers / T.chargersPerHub,
  turnaroundChargers: inc1Alt.chargers,
  upgradedChargers: inc1Alt.upgradedChargers,
  capacity: capacityOf(inc1Alt.aircraft, inc1Alt.chargers),
  fleetLimit: inc1Alt.aircraft * T.tripsPerAircraft,
  chargerLimit: inc1Alt.chargers * T.chargesPerCharger,
  supports: demandSupported(capacityOf(inc1Alt.aircraft, inc1Alt.chargers)),
  retainedAfterHubLoss: retainedOf(inc1Alt.aircraft, inc1Alt.chargers),
  /** Capacity while one hub's chargers are out of turnaround service (Increment 1's hub-by-hub transition). */
  oneHubOut: capacityOf(inc1Alt.aircraft, inc1Alt.chargers - T.chargersPerHub),
}
/** The fleet options of the Week 3 morphological box, and the smallest one that meets the capacity requirement: why the
 *  committed step lands above the desired level (computed). */
export const FLEET_STEP = (() => {
  const options = MORPH_FLEET.map((f) => ({ added: f.added, capacity: (baseAlt.aircraft + f.added) * T.tripsPerAircraft }))
  const smallest = options.filter((o) => o.capacity >= REQUIRED_CAPACITY).sort((a, b) => a.added - b.added)[0]
  return { options, smallest, exact: Math.ceil(REQUIRED_CAPACITY / T.tripsPerAircraft) }
})()

// ================================================================================================ gaps and excesses
export type CaseGap = { id: string; kind: 'gap' | 'excess'; horizon: HorizonId; capability: string; desired: string; baseline: string; size?: string; sources: string[]; note: string; provenance: CaseProvenance }
/** The capability gaps and excesses, each from a need, objective, capability or requirement (R12 p.862). Every entry is
 *  measured against the BASELINE TRAJECTORY (the committed Year-2 step included). A gap is the trajectory below the
 *  desired level; an excess is the trajectory ABOVE the desired level (SEBoK p.862; quiz w6q-1), never slack on a limit
 *  that does not bind. */
export const GAPS: CaseGap[] = [
  {
    id: 'GAP-001', kind: 'excess', horizon: 'near', capability: 'Network capacity by month 24',
    desired: `${REQUIRED_CAPACITY} trips/day (planning demand ${T.demand} at ${UTILIZATION_LIMIT * 100} % utilization, MGO-007)`,
    baseline: `${YEAR2.capacity} trips/day by month ${YEAR2.month} (${YEAR2.aircraft} × ${T.tripsPerAircraft}, fleet-limited), the committed step (DEC-001) included`,
    size: `${YEAR2.capacity - REQUIRED_CAPACITY} trips/day above the desired level`, sources: ['MGO-007', 'REQ-STK-004', 'NEED-005'],
    note: `No near-term capacity gap: the committed step closes it. Measured against the entry snapshot (${BASELINE.capacity}) instead of the trajectory, it would look like a ${REQUIRED_CAPACITY - BASELINE.capacity} trips/day gap and the roadmap would plan the Year-2 decision a second time. The excess is a candidate for divestment that is kept, with a reason: the Week 3 box offered ${FLEET_STEP.options.map((o) => `+${o.added}`).join(', ')} aircraft, and +${FLEET_STEP.smallest.added} is the smallest step that meets ${REQUIRED_CAPACITY}; the headroom lets demand grow to ${YEAR2.supports} trips/day before the next capacity step.`,
    provenance: 'reference',
  },
  {
    id: 'GAP-002', kind: 'excess', horizon: 'near', capability: 'Turnaround chargers outside the operating day',
    desired: `charging capacity used, or earning, outside the ${T.operatingHours}-hour operating day`,
    baseline: `all ${YEAR2.turnaroundChargers} turnaround chargers idle ${24 - T.operatingHours} h a night`,
    size: `${YEAR2.turnaroundChargers} chargers × ${24 - T.operatingHours} h a night`, sources: ['CAP-003', 'NEED-005'],
    note: `An excess against the desired level, which the leasing opportunity O-002 would sell. The charger limit above the fleet limit in the operating day (${YEAR2.chargerLimit} against ${YEAR2.capacity}) is NOT an excess: it is slack on a limit that does not bind, and removing it would make the chargers bind (one hub out leaves ${YEAR2.oneHubOut}, below ${REQUIRED_CAPACITY}).`,
    provenance: 'proposed',
  },
  {
    id: 'GAP-003', kind: 'gap', horizon: 'mid', capability: 'Service during a regional grid outage',
    desired: 'a reduced service at the hubs through an outage of more than 2 h (the R-011 event), then a recovery that the connection limits do not slow (proposed target, sized in the increment)',
    baseline: '0 trips/day: charging stops network-wide and the service is suspended (R-011, accepted)',
    sources: ['CAP-003', 'REQ-STK-004'], note: 'A resilience gap: the trade study’s resilience criterion measured the loss of one hub, not of the grid.', provenance: 'proposed',
  },
  {
    id: 'GAP-004', kind: 'gap', horizon: 'mid', capability: 'Operator workload limit',
    desired: 'a simultaneous-flight limit per remote operator, set from evidence and enforced by the assignment function',
    baseline: 'the limit is TBD-04: no workload analysis exists',
    sources: ['NEED-013', 'REQ-STK-015', 'CAP-012'], note: 'A gap in knowledge before it is a gap in capability: autonomy cannot be planned without it.', provenance: 'proposed',
  },
  {
    id: 'GAP-005', kind: 'gap', horizon: 'mid', capability: 'Integrated journeys',
    desired: 'AeroLink trips booked inside the regional journey planner, with a written public-transport fallback',
    baseline: 'a separate booking app; the fallback rests on an unwritten arrangement (A-008)',
    sources: ['NEED-011', 'CAP-015'], note: 'Rests on a partner: the transport authority must agree (O-001).', provenance: 'proposed',
  },
  {
    id: 'GAP-006', kind: 'gap', horizon: 'far', capability: 'Operations not tied to a pilot aboard every aircraft',
    desired: 'flights supervised remotely, so that operator workload and crew cost do not grow aircraft for aircraft',
    baseline: 'piloted operations: every flight needs a pilot aboard',
    sources: ['NEED-013', 'CAP-004'], note: 'The gap the autonomy enablers (TECH-003) would close; their benefit in the Week 3 assessment is lower operator workload and crew cost.', provenance: 'proposed',
  },
]
export const gap = (id: string) => GAPS.find((g) => g.id === id)!

// ================================================================================================ the technology plan
/** One candidate in the technology plan, read for the three things MITRE's flexible-roadmap rule balances (R107 p.449):
 *  maturity, the ability to insert it, and whether it is operationally appropriate now. */
export type CaseTech = {
  id: string
  name: string
  status: TechStatus
  trl: number | null
  basis: string
  /** The increment that inserts it, or null when it is deliberately not inserted. */
  insertion: string | null
  /** True when the insertion is the committed Year-2 step inside the baseline trajectory (not yet in service). */
  committed?: boolean
  notInserted?: string
  risk: string
  maturity: { ok: boolean; why: string }
  insertability: { ok: boolean; why: string }
  timing: { ok: boolean; why: string }
  provenance: CaseProvenance
}
const tech = (id: string) => TECHNOLOGIES.find((t) => t.id === id)!
const t1 = tech('TECH-001')
const t2 = tech('TECH-002')
const t3 = tech('TECH-003')
/** The higher-power charger of ICR-001 adds no trips while the fleet limit binds: the month-24 configuration of the
 *  baseline trajectory is fleet-limited, so a faster charge changes the turnaround, not the capacity (computed). */
export const FASTER_CHARGE = (() => {
  const fleet = inc1Alt.aircraft * T.tripsPerAircraft
  const chargers = inc1Alt.chargers * T.chargesPerCharger
  return { fleetLimit: fleet, chargerLimit: chargers, binding: bindingOf(inc1Alt.aircraft, inc1Alt.chargers), addsTrips: chargers < fleet }
})()
export const TECH_PLAN: CaseTech[] = [
  {
    id: t1.id, name: t1.name, status: 'available', trl: t1.trl, basis: `${t1.basis.ref}: ${t1.basis.text}`, insertion: 'INC-000', committed: true, risk: `${t1.maturityRisk} (grid connection, handled by avoidance)`,
    maturity: { ok: t1.trl >= MATURE_TRL, why: `TRL ${t1.trl} assumed (${t1.basis.ref}); the supplier test report is a condition of the committed Year-2 step` },
    insertability: { ok: true, why: 'the hubs’ charging connector and its published standard (IF-005) already take it' },
    timing: { ok: true, why: `the committed Year-2 step converts the fourth hub now: the ${YEAR2.capacity} trips/day of month ${YEAR2.month} rest on it` },
    provenance: 'reference',
  },
  {
    id: t2.id, name: t2.name, status: 'in-development', trl: t2.trl, basis: `${t2.basis.ref}: ${t2.basis.text}`, insertion: 'INC-000', risk: `${t2.maturityRisk}, tracked through TPM-003`,
    maturity: { ok: t2.trl >= MATURE_TRL, why: `TRL ${t2.trl} assumed (${t2.basis.ref}): below ${MATURE_TRL}, so the baseline already carries a maturity risk` },
    insertability: { ok: true, why: 'in service at entry; packs are replaced at the maintenance facility' },
    timing: { ok: true, why: 'pack replacement is scheduled from the measured fade, not from the roadmap’s horizons' },
    provenance: 'reference',
  },
  {
    id: t3.id, name: t3.name, status: 'in-development', trl: t3.trl, basis: `${t3.basis.ref}: ${t3.basis.text}`, insertion: 'INC-003', risk: `${t3.maturityRisk} (accepted for the piloted baseline)`,
    maturity: { ok: t3.trl >= MATURE_TRL, why: `TRL ${t3.trl} assumed (${t3.basis.ref}): laboratory components only` },
    insertability: { ok: false, why: 'the air-ground datalink (IF-002) would carry flight control, which its definition does not cover' },
    timing: { ok: false, why: 'the far-term gap waits for a certification basis (U-008) and the workload limit (TBD-04)' },
    provenance: 'reference',
  },
  {
    id: 'TECH-004', name: 'Vertiport on-site energy storage', status: 'available', trl: 8, basis: 'A-009 (proposed): stationary battery storage is a qualified commercial product; its integration with high-power chargers and the grid connection is not demonstrated', insertion: 'INC-001', risk: 'U-009 (integration unproven); mitigation: demonstrate at one hub first',
    maturity: { ok: true, why: 'the product is assumed qualified (TRL 8, A-009); TRL rates the product, not its fit with the chargers' },
    insertability: { ok: false, why: 'no interface joins storage to the charging power control yet: Increment 1 defines it' },
    timing: { ok: true, why: 'the mid-term resilience gap (GAP-003) and the R-011 hand-over from Week 3' },
    provenance: 'proposed',
  },
  {
    id: 'TECH-005', name: `Higher-power charging (ICR-001: dispatch threshold in 15 min)`, status: 'not-existing', trl: null, basis: 'no maturity evidence is held for a charger of this power: treated as not yet existing until a supplier shows one', insertion: null,
    notInserted: `adds no trips while the fleet limit binds (${inc1Alt.aircraft} × ${T.tripsPerAircraft} = ${FASTER_CHARGE.fleetLimit} below ${inc1Alt.chargers} × ${T.chargesPerCharger} = ${FASTER_CHARGE.chargerLimit}); kept on the watch list for a charger-limited configuration`,
    risk: 'R-005 (more power per charger against the connection limit); no insertion, so no off-ramp',
    maturity: { ok: false, why: 'no evidence held' },
    insertability: { ok: true, why: 'ICR-001 keeps the old IF-005 version supported until every aircraft is upgraded' },
    timing: { ok: false, why: `the network is ${FASTER_CHARGE.binding}-limited on the baseline trajectory, so the faster charge buys turnaround margin, not capacity` },
    provenance: 'proposed',
  },
]
export const techPlan = (id: string) => TECH_PLAN.find((t) => t.id === id)!
/** A technology is an insertion point only when maturity, insertability and timing all hold (the three-circle rule). */
export const insertionReady = (t: CaseTech) => t.maturity.ok && t.insertability.ok && t.timing.ok
export const isImmature = (t: Pick<CaseTech, 'status' | 'trl'>) => t.status !== 'available' || t.trl === null || t.trl < MATURE_TRL

// ================================================================================================ increments
export type CaseIncrement = {
  id: string
  order: number
  name: string
  horizon: HorizonId | 'baseline'
  content: string[]
  serves: string[]
  trigger: string[]
  dependencies: string[]
  offRamp: string
  approach: ApproachId | null
  approachWhy: string
  transition: string
  security: string
  resilience: string
  risks: string[]
  inserts: string[]
  provenance: CaseProvenance
}

/** The order in which the committed Year-2 step is carried out, COMPUTED: converting the hub before the aircraft arrive
 *  keeps the charger limit from binding (the Week 3 treatment of R-001: tie every aircraft order to a charging-capacity
 *  check), and the capacity requirement is met with the n-th aircraft, n = ceil(300 ÷ 20). The step is committed, so it
 *  sits inside the baseline trajectory; its transition is still to be carried out, so the roadmap plans it. */
export const YEAR2_TRANSITION = (() => {
  const needed = Math.ceil(REQUIRED_CAPACITY / T.tripsPerAircraft)
  const aircraftFirst = capacityOf(inc1Alt.aircraft, baseAlt.chargers)
  const hubFirst = capacityOf(baseAlt.aircraft, inc1Alt.chargers)
  const steps = Array.from({ length: inc1Alt.addedAircraft + 1 }, (_, k) => ({ aircraft: baseAlt.aircraft + k, capacity: capacityOf(baseAlt.aircraft + k, inc1Alt.chargers) }))
  return {
    needed, addedForRequired: needed - baseAlt.aircraft, added: inc1Alt.addedAircraft, aircraftFirst, aircraftFirstBinding: bindingOf(inc1Alt.aircraft, baseAlt.chargers), hubFirst,
    chargerLimitBefore: BASELINE.chargerLimit, chargerLimitAfter: inc1Alt.chargers * T.chargesPerCharger, steps,
  }
})()
/** The capacity step of Increment 2: the Week 3 alternative ALT-006 configuration (six aircraft added in all, four hubs),
 *  started only when the quarterly re-forecast passes what the baseline trajectory supports at 80 % (computed). */
const alt6 = alternative('ALT-006')
export const INC2_STEP = {
  alternative: alt6.id,
  aircraft: alt6.aircraft,
  addedBeyondYear2: alt6.aircraft - inc1Alt.aircraft,
  capacity: capacityOf(alt6.aircraft, alt6.chargers),
  supports: demandSupported(capacityOf(alt6.aircraft, alt6.chargers)),
  trigger: YEAR2.supports,
  binding: bindingOf(alt6.aircraft, alt6.chargers),
}
const pctOf = (x: number) => `${Math.round(x * 100)} %`
const idleHours = 24 - T.operatingHours
/** The DEC-001 off-ramp, from the Week 3 decision record. */
const YEAR2_OFF_RAMP = (TRADE_DECISION.wouldChangeIf.find((w) => /connection limit/.test(w)) ?? '').replace(/^the connection limit \(TBD-02\) rules out converting the spoke: /, 'If the connection is refused, ')

export const INCREMENTS: CaseIncrement[] = [
  {
    id: 'INC-000', order: 0, name: 'Baseline trajectory: entry into service and the committed Year-2 step', horizon: 'baseline',
    content: [
      `at entry: ${BASELINE.aircraft} four-seat aircraft; ${BASELINE.sites} vertiports, ${BASELINE.hubs} of them hubs with ${T.chargersPerHub} turnaround chargers each; capacity ${BASELINE.capacity} trips/day, fleet-limited (charger limit ${BASELINE.chargerLimit})`,
      `committed by month ${YEAR2.month} (DEC-001): ${YEAR2.addedAircraft} more aircraft (${YEAR2.aircraft} in total) and one spoke converted into a fourth hub, its ${YEAR2.upgradedChargers} chargers replaced by high-power units`,
      `capacity ${YEAR2.capacity} trips/day by month ${YEAR2.month}, fleet-limited (charger limit ${YEAR2.chargerLimit})`,
      'piloted operations', `one operations platform with a hot standby (${ARCH_DECISION.id})`,
    ],
    serves: ['MGO-001', 'MGO-007'],
    trigger: ['the committed step’s conditions: the supplier test report confirms the charger at TRL 6 (A-003)', 'the utility agrees connection capacity at the chosen spoke (U-002)'],
    dependencies: [],
    offRamp: YEAR2_OFF_RAMP,
    approach: 'sequential', approachWhy: 'the committed step’s requirements are known (REQ-STK-004), its technologies are assumed mature and the domain is familiar: a sequential development with the usual iteration fits',
    transition: `The committed step, phased while the service runs: convert the hub first (the charger limit rises from ${YEAR2_TRANSITION.chargerLimitBefore} to ${YEAR2_TRANSITION.chargerLimitAfter} while capacity stays ${YEAR2_TRANSITION.hubFirst}, fleet-limited), then accept the aircraft one at a time; ${REQUIRED_CAPACITY} trips/day is reached with aircraft number ${YEAR2_TRANSITION.needed}, the ${ordinal(YEAR2_TRANSITION.addedForRequired)} of the ${YEAR2_TRANSITION.added} added.`,
    security: 'The Week 5 protections and the R-009 and R-010 treatments are in place; the committed step’s two high-power chargers are replaced to the signed-configuration specification (DEC-001), so R-010 grows.',
    resilience: `Losing one hub leaves ${pctOf(BASELINE.retainedAfterHubLoss)} of capacity at entry and ${pctOf(YEAR2.retainedAfterHubLoss)} once the fourth hub is in; a regional grid outage suspends the service (R-011, accepted).`,
    risks: ['R-001', 'R-004', 'R-005', 'R-010', 'R-011'], inserts: ['TECH-002', 'TECH-001'], provenance: 'reference',
  },
  {
    id: 'INC-001', order: 1, name: 'Resilient hubs', horizon: 'mid',
    content: ['on-site energy storage at the four hubs (TECH-004), one hub first', `overnight leasing of the ${YEAR2.turnaroundChargers} turnaround chargers to ground fleets (O-002)`],
    serves: ['GAP-003', 'GAP-002', 'CAP-003'],
    trigger: ['storage demonstrated at one hub with the utility’s agreement (U-009 closed)', 'leasing: a signed lease with a ground-fleet operator (O-002)'],
    dependencies: ['INC-000'],
    offRamp: 'Storage: keep the staggered-recharge contingency of R-011. Leasing: leave the chargers idle overnight.',
    approach: 'incremental', approachWhy: 'one hub first retires the integration unknown (U-009), then the other three follow, each adding capability: increments of growing capability with a focus on technical risk',
    transition: `Hub by hub, inside the ${idleHours}-hour overnight window, so that every hub is back in turnaround service each morning: with one hub out, the network would be charger-limited at ${YEAR2.oneHubOut} trips/day, below ${REQUIRED_CAPACITY} (R-012).`,
    security: 'Storage control accepts only signed commands (the R-010 pattern); a leased charging session is kept apart from the AeroLink charging control, so a ground-fleet vehicle cannot reach it.',
    resilience: 'Storage adds “withstand” to the grid outage: R-011 changes from accept to mitigate.',
    risks: ['R-011', 'R-010', 'R-012'], inserts: ['TECH-004'], provenance: 'proposed',
  },
  {
    id: 'INC-002', order: 2, name: 'Data-ready, integrated network', horizon: 'mid',
    content: ['the predictive-maintenance capability (AI-001) used for maintenance planning once its predictions are checked against operating evidence', 'workload evidence for the remote-operator limit (TBD-04) from replayed disruption days', 'integrated ticketing with the transport authority (O-001), if it agrees', `a capacity step to ${INC2_STEP.aircraft} aircraft (${INC2_STEP.capacity} trips/day) only when its trigger fires`],
    serves: ['GAP-004', 'GAP-005', 'MGO-007'],
    trigger: [`12 months of operating data on the month-${YEAR2.month} configuration (for AI-001 and the workload replay)`, `the capacity step: the quarterly re-forecast (A-006) passes ${INC2_STEP.trigger} trips/day, the most the baseline trajectory supports at ${UTILIZATION_LIMIT * 100} % utilization`, 'ticketing: a written agreement with the transport authority (A-008)'],
    dependencies: ['INC-000'],
    offRamp: 'Ticketing: keep the separate booking app with the written fallback. AI-001: keep calendar-based maintenance planning.',
    approach: 'incremental', approachWhy: 'independent parts delivered one after another as their triggers fire, each adding capability, with room for emerging technology',
    transition: 'Software changes reach the platform by continuous integration; the capacity step accepts aircraft one at a time while the service runs.',
    security: 'The journey planner is a new external interface: it crosses a trust boundary, is authenticated and stays separated from dispatch (the DEC-002 condition, R-009).',
    resilience: 'A written public-transport fallback (A-008) carries riders through a disruption, and checked maintenance predictions cut unplanned aircraft outages.',
    risks: ['R-009'], inserts: [], provenance: 'proposed',
  },
  {
    id: 'INC-003', order: 3, name: 'Remote or autonomous flight operations', horizon: 'far',
    content: ['remote supervision of flights, then autonomous flight on approved routes (TECH-003)', 'operators assigned by the workload limit (FN-017)'],
    serves: ['GAP-006', 'GAP-004', 'NEED-013'],
    trigger: [`detect-and-avoid at TRL ${MATURE_TRL} or higher on evidence (the R-006 trigger: a TRL review at evolution planning)`, 'a certification basis agreed with the FAA (U-008)', 'the workload limit TBD-04 closed (U-004)'],
    dependencies: ['INC-002', 'INC-000'],
    offRamp: 'Stay piloted: the baseline does not depend on TECH-003 (R-006 is accepted).',
    approach: 'evolutionary', approachWhy: 'the final functionality cannot be defined now, so each step is set by maturing technology matched with evolving user needs (MITRE’s second approach)',
    transition: 'Simultaneous operation: one vertiport pair first, with piloted flights continuing everywhere else, then block deployment after the evidence is reviewed.',
    security: 'The air-ground radio datalink (IF-002) becomes part of flight control: a forged or lost command link becomes a flight-safety hazard, so its authentication is redesigned and R-009’s consequence grows.',
    resilience: 'The link-loss degraded mode changes: with no pilot aboard, the aircraft must reach a safe landing on its own.',
    risks: ['R-006', 'R-009', 'R-013'], inserts: ['TECH-003'], provenance: 'proposed',
  },
]
export const increment = (id: string) => INCREMENTS.find((x) => x.id === id)!
function ordinal(n: number) {
  return ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth'][n] ?? `${n}th`
}

// ================================================================================================ known unknowns
export type CaseUnknown = { id: string; name: string; tbx?: string; impact: string; need: string; mitigation: string; owner: string; gates: string; provenance: CaseProvenance }
const u = (id: string) => [...UNCERTAINTIES, ...W3_UNKNOWNS].find((x) => x.id === id)!
export const KNOWN_UNKNOWNS: CaseUnknown[] = [
  { id: 'U-009', name: 'Storage integration with the high-power chargers and the grid connection unproven', tbx: 'TBD-07', impact: 'storage may not carry a reduced service through an outage', need: 'a one-hub demonstration and the utility’s terms for storage behind the connection', mitigation: 'keep the staggered-recharge contingency of R-011', owner: 'Vertiport Infrastructure Manager', gates: 'INC-001', provenance: 'proposed' },
  { id: 'U-004', name: u('U-004').name, tbx: u('U-004').tbx, impact: 'the staffing case for remote operation cannot be made, so Increment 3 cannot be scheduled', need: 'a workload analysis of replayed disruption days (SCN-005) with remote operators', mitigation: 'collect the evidence in Increment 2; the assignment function enforces a conservative limit meanwhile', owner: u('U-004').owner, gates: 'INC-003', provenance: 'reference' },
  { id: 'U-008', name: 'Certification basis for remote or autonomous operation not known', tbx: 'TBD-06', impact: 'Increment 3 has no approval path and stays a proposal', need: 'the FAA’s basis for this type of operation', mitigation: 'engage the authority early; the off-ramp keeps the service piloted', owner: 'Director of Flight Operations', gates: 'INC-003', provenance: 'proposed' },
  { id: 'U-002', name: u('U-002').name, tbx: u('U-002').tbx, impact: 'the spoke cannot be converted and the committed Year-2 step takes its off-ramp (a seventh site)', need: 'the utility’s connection agreement for the chosen spoke', mitigation: 'no hub is committed without confirmed capacity (R-005, avoid)', owner: u('U-002').owner, gates: 'INC-000', provenance: 'reference' },
  { id: 'U-001', name: u('U-001').name, tbx: u('U-001').tbx, impact: 'weather holds above the planned 5 % of hours cut every increment’s delivered capacity (R-004)', need: 'the limits from the manufacturer’s draft flight manual', mitigation: 'the purchase contract’s weather-envelope guarantee (R-004, transfer)', owner: u('U-001').owner, gates: 'INC-000', provenance: 'reference' },
]

// ================================================================================================ the AROU update
export type CaseArou = { id: string; kind: 'risk' | 'opportunity' | 'assumption'; name: string; text: string; category?: string; owner: string; increment: string; transition: boolean; change: 'new' | 'changed' | 'linked'; provenance: CaseProvenance }
export const AROU_UPDATE: CaseArou[] = [
  {
    id: 'R-012', kind: 'risk', name: 'A hub out of turnaround service while its storage is installed', category: 'performance',
    text: `Condition: Increment 1 equips the hubs one at a time. If a hub’s chargers are still out of turnaround service when the operating day starts, then the network is charger-limited at ${YEAR2.oneHubOut} trips/day (${YEAR2.aircraft} × ${T.tripsPerAircraft} against ${YEAR2.turnaroundChargers - T.chargersPerHub} × ${T.chargesPerCharger}), below the ${REQUIRED_CAPACITY} the utilization rule needs, until the hub returns. It exists only while the hubs are being equipped.`,
    owner: 'Vertiport Infrastructure Manager', increment: 'INC-001', transition: true, change: 'new', provenance: 'proposed',
  },
  {
    id: 'R-013', kind: 'risk', name: 'Mixed piloted and remote operations during the transition', category: 'safety',
    text: 'Condition: piloted and remotely supervised flights share the network while Increment 3 is introduced. If procedures, airspace coordination or operator roles are confused between the two, then a flight is dispatched or supervised under the wrong rules.',
    owner: 'Director of Flight Operations', increment: 'INC-003', transition: true, change: 'new', provenance: 'proposed',
  },
  {
    id: 'R-011', kind: 'risk', name: RISKS.find((r) => r.id === 'R-011')!.name, category: 'resilience',
    text: 'Changed: handling from accept to mitigate once on-site storage is in place; the trigger and the contingency plan stay until then.',
    owner: RISKS.find((r) => r.id === 'R-011')!.owner, increment: 'INC-001', transition: false, change: 'changed', provenance: 'proposed',
  },
  {
    id: 'O-002', kind: 'opportunity', name: OPPORTUNITIES.find((o) => o.id === 'O-002')!.name,
    text: `Linked: sells the ${24 - T.operatingHours} idle overnight hours of the ${YEAR2.turnaroundChargers} turnaround chargers (GAP-002), once storage installation no longer needs the window.`,
    owner: OPPORTUNITIES.find((o) => o.id === 'O-002')!.owner, increment: 'INC-001', transition: false, change: 'linked', provenance: 'reference',
  },
  {
    id: 'A-009', kind: 'assumption', name: 'Stationary storage is a qualified product (TRL 8)',
    text: 'Stationary battery storage for a vertiport is a qualified commercial product; its integration with high-power chargers and the grid connection is NOT assumed (U-009).',
    owner: 'Vertiport Infrastructure Manager', increment: 'INC-001', transition: false, change: 'new', provenance: 'proposed',
  },
]
/** Every risk linked to an increment, with its category from the register or the update. */
export const linkedRisks = () => {
  const ids = [...new Set(INCREMENTS.flatMap((x) => x.risks))]
  return ids.map((id) => ({ id, category: RISKS.find((r) => r.id === id)?.category ?? AROU_UPDATE.find((a) => a.id === id)?.category ?? 'unknown' }))
}
export const SECURITY_RESILIENCE_LINKS = () => linkedRisks().filter((r) => /security|resilience/.test(r.category)).map((r) => r.id)
export const TRANSITION_RISKS = () => AROU_UPDATE.filter((a) => a.transition).map((a) => a.id)

// ================================================================================================ impact of Increment 3
/** The impact list of the autonomy increment (Session 2): CANDIDATES are computed by following the links of the Weeks 1–5
 *  data one step from what the increment inserts or changes (the technology, the operators' role, the aircraft); the
 *  judgment (`IMPACT_JUDGED`) says which candidates the change actually reaches. Same pattern as the Week 5 change request:
 *  the links propose, the engineer decides. Every candidate is judged (tested), so "every candidate judged" is a claim the
 *  test can falsify. */
export const IMPACT_SEEDS = { technology: 'TECH-003', stakeholder: 'STK-008', element: 'PHY-001' } as const
export const IMPACT_CANDIDATES = (() => {
  const t = tech(IMPACT_SEEDS.technology)
  const stkNeeds = NEEDS.filter((n) => n.subject === IMPACT_SEEDS.stakeholder).map((n) => n.id)
  const caps = [...new Set([...t.affects.filter((x) => x.startsWith('CAP-')), ...CAPABILITIES.filter((c) => c.needs.some((n) => stkNeeds.includes(n))).map((c) => c.id)])]
  const fns = FUNCTIONS.filter((f) => f.capabilities.some((c) => caps.includes(c)) || /pilot/i.test(f.human ?? '')).map((f) => f.id)
  const reqs = [...new Set(FUNCTIONS.filter((f) => fns.includes(f.id)).flatMap((f) => f.requirements))]
  const needs = [...new Set([...stkNeeds, ...CAPABILITIES.filter((c) => caps.includes(c.id)).flatMap((c) => c.needs)])]
  const stakeholders = [...new Set(NEEDS.filter((n) => needs.includes(n.id)).map((n) => n.subject))]
  const concerns = CONCERNS.filter((c) => stakeholders.includes(c.stakeholder)).map((c) => c.id)
  const phys = [...new Set(FUNCTIONS.filter((f) => fns.includes(f.id)).map((f) => f.phy))]
  const ifs = INTERFACES.filter((x) => x.ends.includes(IMPACT_SEEDS.element) || x.requirements.some((q) => reqs.includes(q))).map((x) => x.id)
  const risks = [...new Set([...(t.maturityRisk ? [t.maturityRisk] : []), ...RISKS.filter((r) => r.affects.some((a) => caps.includes(a) || reqs.includes(a))).map((r) => r.id)])]
  return { stakeholders, concerns, needs, capabilities: caps, requirements: reqs, functions: fns, physical: phys, interfaces: ifs, risks }
})()
export const IMPACT_CANDIDATE_IDS = Object.values(IMPACT_CANDIDATES).flat()
/** The judgment on every candidate: reached (and how) or not reached (and why). */
export const IMPACT_JUDGED: Record<string, { reached: boolean; why: string }> = {
  'STK-002': { reached: true, why: 'the FAA approves the new operation: a certification basis is needed (U-008)' },
  'STK-007': { reached: true, why: 'the air traffic service coordinates flights with no pilot aboard' },
  'STK-008': { reached: true, why: 'pilots become remote operators supervising several flights' },
  'CON-004': { reached: true, why: 'airworthiness and operational safety now include the command link and autonomous contingencies' },
  'CON-008': { reached: true, why: 'airspace integration of flights with no pilot aboard' },
  'CON-009': { reached: true, why: 'operator workload and automation trust are the concern the increment changes most' },
  'NEED-002': { reached: true, why: 'assurance that every flight stays within limits must now be shown for remote flights' },
  'NEED-009': { reached: false, why: 'flight intent is still filed before departure: the need is unchanged, only who files it' },
  'NEED-013': { reached: true, why: 'manageable workload is redefined for an operator with several flights' },
  'CAP-004': { reached: true, why: 'flights are planned, coordinated and flown within limits without a pilot aboard' },
  'CAP-012': { reached: true, why: 'workload-managed operations become the core of the increment' },
  'FN-003': { reached: false, why: 'flight planning with the 20 % reserve is unchanged' },
  'FN-005': { reached: true, why: 'the human operation inside the function changes from flying to supervising' },
  'FN-011': { reached: true, why: 'release now hands the flight to a remote operator, not a pilot aboard' },
  'FN-012': { reached: true, why: 'flight-intent coordination must state that the flight is remotely supervised' },
  'FN-017': { reached: true, why: 'the workload limit (TBD-04) decides how many flights each operator takes' },
  'REQ-SYS-002': { reached: false, why: 'pad-edge noise depends on the aircraft and the procedures, not on who supervises' },
  'REQ-SYS-003': { reached: false, why: 'the planned landing reserve is unchanged' },
  'REQ-SYS-007': { reached: false, why: 'the design-trip block time is unchanged' },
  'REQ-STK-006': { reached: false, why: 'the no-go fault check before dispatch is unchanged' },
  'REQ-STK-009': { reached: true, why: 'flight intent to the air traffic service must add the supervision mode' },
  'REQ-STK-015': { reached: true, why: 'TBD-04 becomes the number Increment 3 cannot start without' },
  'PHY-001': { reached: true, why: 'the aircraft carry the detect-and-avoid and autonomy enablers' },
  'PHY-004': { reached: true, why: 'the operations center hosts the remote operators' },
  'IF-001': { reached: false, why: 'the aircraft-to-pad interface carries loads and passengers, unchanged' },
  'IF-002': { reached: true, why: 'the datalink becomes part of flight control (the security and resilience change)' },
  'IF-003': { reached: true, why: 'the flight-intent exchange carries the supervision mode' },
  'IF-004': { reached: false, why: 'the work-order handover between operations and maintenance is unchanged' },
  'IF-005': { reached: false, why: 'charging is unchanged' },
  'IF-013': { reached: false, why: 'health data still reach maintenance the same way' },
  'R-002': { reached: false, why: 'battery fade is unchanged by who supervises the flight' },
  'R-003': { reached: false, why: 'pad-edge noise is unchanged' },
  'R-006': { reached: true, why: 'its trigger, the TRL review, is the increment’s entry trigger' },
  'R-009': { reached: true, why: 'an intrusion could now reach flight control through the datalink' },
}
export const IMPACT_REACHED = () => IMPACT_CANDIDATE_IDS.filter((id) => IMPACT_JUDGED[id]?.reached)
export const IMPACT_NOT_REACHED = () => IMPACT_CANDIDATE_IDS.filter((id) => IMPACT_JUDGED[id] && !IMPACT_JUDGED[id].reached)
export const unjudgedCandidates = () => IMPACT_CANDIDATE_IDS.filter((id) => !IMPACT_JUDGED[id])
/** The week each ID was introduced in (by prefix), for the impact tree grouped by week. */
export const weekOfId = (id: string): number => {
  if (/^(STK|CON|NEED)-/.test(id)) return 1
  if (/^(CAP|REQ|SCN|MGO|MOE|MOP)-/.test(id)) return 2
  if (/^(TECH|R|TPM|A|O|U|ALT|CRIT)-/.test(id)) return 3
  if (/^(FN|LOG|PHY|INFO|AI|VP)-/.test(id)) return 4
  if (/^(IF|CMP|ICR)-/.test(id)) return 5
  return 0
}
export const impactByWeek = (ids: string[]) => [1, 2, 3, 4, 5].map((w) => ({ week: w, ids: ids.filter((id) => weekOfId(id) === w) }))

// ================================================================================================ hand-overs to Week 6
/** Everything Weeks 2–5 handed to Week 6, each with its disposition (none may stay pending: tested). */
export const HANDOVERS_TO_W6: { from: string; item: string; status: 'closed' | 'carried' | 're-dated'; disposition: string }[] = [
  { from: 'Week 2 U-004, re-dated by Week 3', item: W2_DISPOSITIONS['U-004'].closeBy, status: 'carried', disposition: 'Still open: it gates Increment 3, and Increment 2 collects the workload evidence that would close it.' },
  { from: 'Week 3 A-005', item: ASSUMPTIONS.find((a) => a.id === 'A-005')!.validation, status: 're-dated', disposition: 'No laboratory reports are held, so the TRL stays an assumption (4); Increment 3 is entered only on TRL 6 evidence.' },
  { from: 'Week 3 R-006', item: RISKS.find((r) => r.id === 'R-006')!.treatment, status: 'closed', disposition: 'Reviewed: still accepted for the piloted baseline; its trigger is now the entry trigger of Increment 3.' },
  { from: 'Week 3 R-011', item: 'On-site storage is evaluated in the Week 6 evolution roadmap', status: 'closed', disposition: 'Evaluated: on-site storage is Increment 1 (TECH-004), gated by the integration unknown U-009.' },
  { from: 'Week 4 feed-forward', item: W4_FEEDS.find((f) => f.week === 'Week 6')?.how ?? 'as-is and to-be views of the evolution roadmap', status: 'closed', disposition: 'Autonomy is Increment 3 and storage Increment 1; a second platform is not planned, because the condition under which DEC-002 would change (a network outage likelier than a platform outage) has not arisen.' },
  { from: 'Week 5 feed-forward', item: FEEDS_FORWARD_W5.find((f) => f.week === 'Week 6')?.how ?? 'technology insertion points', status: 'closed', disposition: `The charging connector standard (IF-005) is the insertion point of the committed Year-2 step’s high-power chargers; ${CHANGE_REQUEST.id} is assessed as TECH-005 and not inserted, because it adds no trips while the fleet limit binds.` },
  { from: 'Week 5 finding F6', item: W5_FINDINGS.find((f) => f.id === 'F6')?.disposition ?? 'owned or leased ground network', status: 're-dated', disposition: 'Still open: AeroLink has not decided owned or leased; carried into the Phase I baseline review as an open item for the Head of Operations Technology.' },
]

// ================================================================================================ the Phase I baseline review
/** Open items carried from Weeks 1–5 into the Week 7 package, COMPUTED from the earlier cases: unknowns not closed, and
 *  findings whose owner is a later week or an organization. */
const OPEN_FINDING = (owner: string) => !/closed|accepted/i.test(owner)
/** Items whose earlier owner or close-by point was Week 6 itself: the Week 6 disposition replaces the stale text. */
const RE_DATED: Record<string, { text?: string; owner?: string }> = {
  'A-005': { text: 'Detect-and-avoid maturity is TRL 4: no laboratory reports are held, so the TRL stays assumed; Increment 3 is entered only on TRL 6 evidence' },
  'Week 5 F6': { text: 'Ownership of the ground network (owned or leased) is not decided; if any segment is leased, the interfaces it carries have a hidden external part', owner: 'AeroLink, Head of Operations Technology, before the Week 7 review' },
}
const redate = (x: { id: string; text: string; owner: string }) => ({ ...x, ...(RE_DATED[x.id] ?? {}) })
export const BASELINE_REVIEW: { week: number; part: string; status: 'ready' | 'open items'; items: { id: string; text: string; owner: string }[] }[] = [
  { week: 1, part: 'Team charter, stakeholders and needs', status: 'ready', items: [] },
  {
    week: 2, part: 'ConOps, scenarios and requirements',
    status: 'open items',
    items: UNCERTAINTIES.filter((x) => x.kind === 'unknown' && (W2_DISPOSITIONS[x.id]?.status ?? 'open') !== 'closed').map((x) => ({ id: x.id, text: `${x.name} (${x.tbx})`, owner: x.owner })),
  },
  {
    week: 3, part: 'Technology readiness, risks and the trade study',
    status: 'open items',
    items: [
      ...W3_UNKNOWNS.map((x) => ({ id: x.id, text: `${x.name} (${x.tbx})`, owner: x.owner })),
      ...ASSUMPTIONS.filter((a) => /TRL/.test(a.name)).map((a) => redate({ id: a.id, text: `${a.name}: ${a.validation.replace(/\.$/, '')}`, owner: a.owner })),
    ],
  },
  {
    week: 4, part: 'Architecture and information view',
    status: 'open items',
    items: W4_FINDINGS.filter((f) => /^Week (\d+)/.test(f.owner) && Number(f.owner.match(/\d+/)![0]) > 5).map((f) => ({ id: `Week 4 ${f.id}`, text: f.finding, owner: f.owner })),
  },
  {
    week: 5, part: 'Components and interfaces',
    status: 'open items',
    items: W5_FINDINGS.filter((f) => OPEN_FINDING(f.owner)).map((f) => redate({ id: `Week 5 ${f.id}`, text: f.finding, owner: f.owner })),
  },
]
export const OPEN_ITEM_COUNT = () => BASELINE_REVIEW.reduce((a, r) => a + r.items.length, 0)

// ================================================================================================ the driving question
/** The board's question (Session 1) and its answer (Session 2), from the evidence above. */
export const DRIVING_QUESTION = {
  question: 'After the Year-2 decision, should the next step be autonomous operations, more capacity, or integrated ticketing, and in what order?',
  options: [
    { id: 'A', text: 'Autonomy first' },
    { id: 'B', text: 'More capacity first' },
    { id: 'C', text: 'Ticketing first' },
    { id: 'D', text: 'None of the three first' },
  ],
  answer: 'D',
  /** The evidence answer in one line (Session 2). */
  order: 'resilience first (Increment 1); data, ticketing and the capacity step as their triggers fire (Increment 2); autonomy when the evidence allows (Increment 3)',
  reasons: [
    `More capacity does not come first: the committed Year-2 step already gives ${YEAR2.capacity} trips/day by month ${YEAR2.month}, ${YEAR2.capacity - REQUIRED_CAPACITY} trips/day above the ${REQUIRED_CAPACITY} the objective needs, so the near term has no capacity gap; the next capacity step waits until the re-forecast passes ${YEAR2.supports} trips/day.`,
    `Resilience comes first: the grid-outage gap (GAP-003) is the open gap whose technology is available now (storage, TRL ${TECH_PLAN.find((t) => t.id === 'TECH-004')!.trl} as a product) and whose start depends only on AeroLink’s own one-hub demonstration; Week 3 handed it to the roadmap (R-011).`,
    'Ticketing waits for a partner: the transport authority has to agree (O-001, A-008), so it is planned with a trigger, not a date.',
    `Autonomy waits for evidence: detect-and-avoid is at TRL ${t3.trl} and no certification basis is known (U-008), so Increment 2 prepares for it and the roadmap does not schedule it.`,
  ],
}

// ================================================================================================ feeds forward
export const FEEDS_FORWARD_W6: { artifact: string; week: string; how: string }[] = [
  { artifact: 'The roadmap, the known unknowns and the baseline review', week: 'Week 7', how: 'the evolution section of the Systems Thinking Engineering Package, and the open items the design review checks' },
  { artifact: 'The triggers and the demand rule', week: 'Week 13', how: 'analysis cases: what if demand passes the trigger, what if the TRL review slips' },
  { artifact: 'One increment and its impact list', week: 'Week 14', how: 'the increment modeled as a change to the team’s SysML v2 model, its impact assessed from the model' },
]

// ================================================================================================ links and counts
/** Every id the Week 6 case may point at. Used by the tests to prove every trace resolves. */
export const KNOWN_IDS = new Set<string>([
  ...STAKEHOLDERS.map((s) => s.id), ...CONCERNS.map((c) => c.id), ...NEEDS.map((n) => n.id), ...OBJECTIVES.map((o) => o.id), 'MGO-001',
  ...CAPABILITIES.map((c) => c.id), ...REQUIREMENTS.map((r) => r.id), ...W3_REQUIREMENTS.map((r) => r.id), ...UNCERTAINTIES.map((x) => x.id), ...W3_UNKNOWNS.map((x) => x.id),
  ...TECHNOLOGIES.map((t) => t.id), ...ASSUMPTIONS.map((a) => a.id), ...RISKS.map((r) => r.id), ...OPPORTUNITIES.map((o) => o.id), ...TPMS.map((t) => t.id),
  ...FUNCTIONS.map((f) => f.id), ...PHYSICAL.map((p) => p.id), ...AI_CAPABILITIES.map((a) => a.id), ...INTERFACES.map((x) => x.id), ARCH_DECISION.id, TRADE_DECISION.id, CHANGE_REQUEST.id,
  ...GAPS.map((g) => g.id), ...TECH_PLAN.map((t) => t.id), ...INCREMENTS.map((x) => x.id), ...KNOWN_UNKNOWNS.map((x) => x.id), ...AROU_UPDATE.map((a) => a.id),
])

/** Counts used in the notes and on the slides, computed here so no note types a number. */
export const COUNTS = {
  gaps: GAPS.filter((g) => g.kind === 'gap').length,
  excesses: GAPS.filter((g) => g.kind === 'excess').length,
  technologies: TECH_PLAN.length,
  inserted: TECH_PLAN.filter((t) => t.insertion && t.insertion !== 'INC-000').length,
  increments: INCREMENTS.length,
  unknowns: KNOWN_UNKNOWNS.length,
  arou: AROU_UPDATE.length,
  candidates: IMPACT_CANDIDATE_IDS.length,
  reached: IMPACT_CANDIDATE_IDS.filter((id) => IMPACT_JUDGED[id]?.reached).length,
  openItems: BASELINE_REVIEW.reduce((a, r) => a + r.items.length, 0),
  handovers: HANDOVERS_TO_W6.length,
  /** The near-term capacity on the baseline trajectory above the desired level (GAP-001, an excess). */
  capacityExcess: YEAR2.capacity - REQUIRED_CAPACITY,
  /** The gap a planner would wrongly see against the entry snapshot instead of the trajectory (the M1 teaching point). */
  snapshotGap: REQUIRED_CAPACITY - BASELINE.capacity,
  /** Slack on the charger limit, which does not bind: NOT an excess. */
  chargerSlack: YEAR2.chargerLimit - YEAR2.capacity,
  idleHours: 24 - T.operatingHours,
  idleChargers: YEAR2.turnaroundChargers,
}
export const describeIncrement = (x: CaseIncrement) => `${x.id} ${x.name} (${x.horizon === 'baseline' ? 'baseline' : horizon(x.horizon).label.toLowerCase()})`
export { plural }
