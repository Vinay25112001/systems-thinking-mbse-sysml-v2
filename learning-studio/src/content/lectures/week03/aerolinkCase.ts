// AeroLink Week 3 case: technology readiness assessment, the risk and uncertainty register (with security and resilience
// risks), technical performance measures with planned profiles and margins, and the Year-2 capacity trade study with
// criteria traced to MOEs, swing weights, scores, sensitivity and the decision record. The single source for the Week 3
// lectures (session1.ts, session2.ts), their figures (src/components/figures/LectureWeek3S1.tsx, LectureWeek3S2.tsx), the
// worked-examples page and the tests (aerolinkCase.test.ts). Exported names are kept stable; fields are only ever added.
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week03/WEEK03_LECTURE_OUTLINE.md §4.
//
// AeroLink Urban Mobility is FICTIONAL. Every number, name and statement is a teaching value, not a real-world claim.
//
// Provenance. Week 1 and Week 2 data are IMPORTED, never retyped: needs from ../week01/aerolinkCase.ts; requirements,
// capabilities, scenarios, objectives, measures (MOE, MOP) and the unknowns U-001..U-006 and A-008 from
// ../week02/aerolinkCase.ts (both read-only). Week 3 data start from the instructor reference: src/model/reference/week02.ts
// (A-001, A-002, A-007, R-001, O-001), week05.ts (TPM-001..003), week06.ts (TECH-001..003, A-003..A-005, R-002..R-008,
// O-002) and week07.ts (A-006, CRIT-001..004, ALT-001..004, DEC-001). Every computed number (capacities, waits, costs,
// values, totals, reversal points, margins) is COMPUTED here from the stated rules, not copied, and the tests check the
// results against the reference. Spelling is American; old week numbers in the reference are updated to the current
// schedule (the trade study is in Week 3, the requirements baseline in Week 2, evolution planning in Week 6).
//
// The additions this module makes, each `provenance: 'proposed'` (instructor to confirm):
//   - contingency values for the three TPMs, so that margin is threshold minus WORST-CASE estimate (R44 p.117); the
//     reference margins equal threshold minus the current estimate, i.e. zero contingency;
//   - a planned profile for each TPM at five review points, and one hypothetical month-6 reading for the exercise;
//   - three risks that make security and resilience explicit (DECISION_LOG A21 item 6): R-009 intrusion into the
//     operations platform, R-010 altered charger commands, R-011 regional grid outage;
//   - one issue, I-001, which is the Week 2 trace audit's deliberate gap seen from the register;
//   - the event-cap correction downstream of the corrected NEED-003 (EVENT_CAP): the objective MGO-006 and the measure
//     MOE-003 now carry the evening and early-morning event cap, and TPM-002 records the Week 3 decision that the cap is
//     tracked by MOP-010, not by an aircraft TPM;
//   - two security screens in the trade study (must-meet, not weighted) and the resilience reading of CRIT-003.
import { NEEDS, need } from '../week01/aerolinkCase'
import {
  CAPABILITIES, DELIBERATE_REQ_GAP, MOES, MOPS, OBJECTIVES, REQUIREMENTS, SCENARIOS, UNCERTAINTIES, capability, requirement,
} from '../week02/aerolinkCase'
import type { CaseProvenance } from '../week01/aerolinkCase'
import {
  additiveValue, cellLevel, compareRisks, linearValue, margin, normalizeWeights, ordinalProduct, reversalPoints, round, worstCase,
  type Handling, type RiskCategory, type Sense,
} from './labBrief'

export const AEROLINK_W3_REVIEW = 'new-pending-review' as const
export { NEEDS, need, requirement, capability }

// ================================================================================================ technology readiness
export type CaseTechnology = {
  id: string
  name: string
  does: string
  benefit: string
  limitation: string
  trl: number
  /** The basis of the TRL: every AeroLink TRL rests on a labeled assumption (no supplier evidence in the course sources). */
  basis: { kind: 'evidence' | 'assumption'; ref: string; text: string }
  critical: boolean
  criticalWhy: string
  /** Requirements and capabilities the technology affects (reference week06.ts links). */
  affects: string[]
  maturityRisk?: string
  /** What the TRL does NOT tell about this technology (R16 pp.767–768; R60 p.525). */
  trlLimit: string
  provenance: CaseProvenance
}

export const TECHNOLOGIES: CaseTechnology[] = [
  {
    id: 'TECH-001', name: 'High-power charging',
    does: 'Hub chargers that restore the battery from the 20 % reserve to the dispatch threshold in 20 min.',
    benefit: 'Sets the 25 min turnaround and the charger-limited capacity of the network.',
    limitation: 'High grid demand at hubs and cell heating during the charge.',
    trl: 6, basis: { kind: 'assumption', ref: 'A-003', text: 'The supplier has demonstrated a prototype charger at another operator’s vertiport, whose grid connection and duty cycle differ from AeroLink’s hubs: a relevant environment, not the operational one (that would be TRL 7). To be confirmed by the supplier test report before the charger order.' },
    critical: true, criticalWhy: 'The 25 min hub turnaround (REQ-STK-005) and the 20 min charge (REQ-SYS-001) depend on it.',
    affects: ['REQ-SYS-001', 'CAP-003'], maturityRisk: 'R-005',
    trlLimit: 'TRL 6 says a prototype worked in a relevant environment. It does not say whether two chargers fit a hub’s grid connection (an integration question, U-002) or whether the units can be bought at the planned price (producibility).',
    provenance: 'reference',
  },
  {
    id: 'TECH-002', name: 'Battery cell technology',
    does: 'High-energy lithium-ion cells sized for a 25 km trip with a 20 % reserve at about 20 fast-charge cycles per aircraft per day.',
    benefit: 'Range and turnaround.',
    limitation: 'Capacity fade under fast charging; thermal-runaway hazard.',
    trl: 5, basis: { kind: 'assumption', ref: 'A-004', text: 'The cell supplier has validated the cell in a relevant environment (pack-level cycling at fast-charge rates); to be confirmed by cycle-test data at 20 cycles a day before the fleet order.' },
    critical: true, criticalWhy: 'The planned landing reserve (REQ-SYS-003) and the design-trip block time (REQ-SYS-007) depend on it; below TRL 6, it needs a maturity risk.',
    affects: ['REQ-SYS-003', 'REQ-SYS-007'], maturityRisk: 'R-002',
    trlLimit: 'A component validated at pack level is not an aircraft battery qualified for 20 fast charges a day for two years: the duty cycle is the “relevant environment” that must be agreed (R60 p.525).',
    provenance: 'reference',
  },
  {
    id: 'TECH-003', name: 'Detect-and-avoid and autonomy enablers',
    does: 'Onboard sensing and decision functions that detect and avoid other traffic, enabling remote or autonomous operation in a later increment.',
    benefit: 'Lower operator workload and crew cost.',
    limitation: 'Certification basis and operator trust.',
    trl: 4, basis: { kind: 'assumption', ref: 'A-005', text: 'Components have been validated in a laboratory environment only; to be confirmed by the developer’s laboratory reports before the Week 6 evolution roadmap plans the autonomy increment.' },
    critical: false, criticalWhy: 'The baseline operation is piloted and does not depend on it (R-006 accepted).',
    affects: ['CAP-004'], maturityRisk: 'R-006',
    trlLimit: 'A laboratory TRL says nothing about the certification basis, which is the binding constraint for autonomy; it is an evolution question (Week 6), not a baseline one.',
    provenance: 'reference',
  },
]
export const technology = (id: string) => {
  const t = TECHNOLOGIES.find((x) => x.id === id)
  if (!t) throw new Error(`unknown technology ${id}`)
  return t
}
/** The lowest TRL among the CRITICAL technologies (the number a readiness summary leads with). */
export const lowestCritical = () => [...TECHNOLOGIES].filter((t) => t.critical).sort((a, b) => a.trl - b.trl)[0]

// ================================================================================================ the register
export type CaseAssumption = { id: string; name: string; text: string; owner: string; validation: string; provenance: CaseProvenance }
/** Assumptions (reference week02.ts, week06.ts, week07.ts; A-008 is imported from the Week 2 case). */
export const ASSUMPTIONS: CaseAssumption[] = [
  { id: 'A-001', name: 'Passenger wait tolerance is 15 min', text: 'Attraction to the service halves when the typical wait reaches 15 min; longer waits drive churn.', owner: 'Head of Customer Experience', validation: 'Compare with booking-abandonment data in the first 3 months of operation (MOE-001).', provenance: 'reference' },
  { id: 'A-002', name: 'Turnaround charging at 3 hub vertiports', text: 'Three hubs carry turnaround charging with two high-power chargers each: a pool of 6 turnaround chargers; the spoke chargers serve overnight and top-up charging.', owner: 'Network Planning Manager', validation: 'Confirm against the vertiport charger specification before the trade study closes (this week).', provenance: 'reference' },
  { id: 'A-003', name: 'High-power charger maturity is TRL 6', text: 'The charger supplier has demonstrated a prototype at another operator’s vertiport, whose grid connection and duty cycle differ from AeroLink’s hubs (relevant, not operational: a demonstration at an AeroLink hub would be TRL 7).', owner: 'Vertiport Infrastructure Manager', validation: 'Supplier test report before the charger order.', provenance: 'reference' },
  { id: 'A-004', name: 'Battery cell maturity is TRL 5', text: 'The cell supplier has validated the cell at pack level at fast-charge rates (relevant environment); fade is assumed at 10 % before pack replacement.', owner: 'Fleet Engineering Lead', validation: 'Cycle-test data at 20 cycles a day before the fleet order.', provenance: 'reference' },
  { id: 'A-005', name: 'Detect-and-avoid maturity is TRL 4', text: 'Detect-and-avoid components have been validated in a laboratory environment only.', owner: 'Director of Flight Operations', validation: 'Review of the developer’s laboratory reports before the Week 6 evolution roadmap.', provenance: 'reference' },
  { id: 'A-006', name: 'Year-2 planning demand is 240 trips/day', text: 'Demand at month 24 is planned at 240 trips/day and is assumed independent of the alternative chosen.', owner: 'Network Planning Manager', validation: 'Re-forecast quarterly with the demand-forecasting function.', provenance: 'reference' },
  { id: 'A-007', name: 'A turnaround charger is occupied 20 min per turnaround', text: 'Two pads per turnaround charger: the charger delivers one 20 min charge per turnaround and up to 48 charges in the 16 h operating day (960 min ÷ 20 min).', owner: 'Network Planning Manager', validation: 'A turnaround time-and-motion trial at a hub; if a hub cannot provide two pads per charger, re-run the capacity at 25 min (38.4 charges a day).', provenance: 'reference' },
]
const W2_A008 = UNCERTAINTIES.find((u) => u.id === 'A-008')!
/** Unknowns U-001..U-006 and A-008, imported from the Week 2 case (the TBX register). */
export const UNKNOWNS = UNCERTAINTIES.filter((u) => u.kind === 'unknown')
export const ALL_ASSUMPTIONS: { id: string; name: string; owner: string }[] = [...ASSUMPTIONS, { id: W2_A008.id, name: W2_A008.name, owner: W2_A008.owner }]

export type CaseRisk = {
  id: string
  name: string
  category: RiskCategory
  /** What is known today: the root cause (MITRE condition–if–then, R61a pp.630–631). */
  condition: string
  /** The uncertain event. */
  ifEvent: string
  /** The consequences if it occurs. */
  then: string
  likelihood: number
  consequence: number
  likelihoodWhy: string
  consequenceWhy: string
  handling: Handling
  owner: string
  treatment: string
  trigger: string
  /** Requirements, capabilities, scenarios, technologies or TPMs it threatens (each resolves; tested). */
  affects: string[]
  /** For security and resilience risks: what the risk threatens and how the treatment answers it. */
  security?: { assets: string[]; note: string }
  resilience?: { objectives: ('avoid' | 'withstand' | 'recover')[]; note: string }
  provenance: CaseProvenance
}

export const RISKS: CaseRisk[] = [
  {
    id: 'R-001', name: 'Charging capacity lags fleet growth', category: 'performance',
    condition: 'the capital plan adds aircraft when utilization is high but holds the number of turnaround chargers fixed',
    ifEvent: 'fleet growth outpaces turnaround charging capacity',
    then: 'aircraft queue for chargers, the 90th-percentile wait rises above 15 min and riders churn',
    likelihood: 3, consequence: 4, likelihoodWhy: 'The Week 1 dynamics model shows the charging limit binding once more than 14 aircraft share 6 chargers; the board is already proposing more aircraft.', consequenceWhy: 'A stakeholder requirement (REQ-STK-001, 15 min wait) would be missed: C4.',
    handling: 'mitigate', owner: 'Network Planning Manager', treatment: 'Tie every aircraft order to a charging-capacity check; decided in the trade study (the recommended alternative adds hub chargers with aircraft).', trigger: 'Charger queue time above 5 min on 3 consecutive days',
    affects: ['REQ-STK-001', 'REQ-STK-004', 'CAP-003'], provenance: 'reference',
  },
  {
    id: 'R-002', name: 'Battery capacity fade under fast charging', category: 'technology',
    condition: 'cells are fast-charged about 20 times per aircraft per day and their fade at this duty is known only from assumed supplier data (A-004)',
    ifEvent: 'usable capacity fades by more than 10 % before the planned pack replacement',
    then: 'the 20 % landing reserve cannot be held on the 25 km design trip and flights must be shortened or cancelled',
    likelihood: 3, consequence: 4, likelihoodWhy: 'TRL 5 and no cycle data at this duty: an even chance.', consequenceWhy: 'Shortened or cancelled trips miss a stakeholder requirement, network capacity (REQ-STK-004): C4.',
    handling: 'mitigate', owner: 'Fleet Engineering Lead', treatment: 'Track TPM-003 monthly; sample-test packs; schedule pack replacement from the measured fade before the reserve is threatened.', trigger: 'TPM-003 margin below 1 percentage point',
    affects: ['REQ-SYS-003', 'TECH-002', 'TPM-003', 'CAP-006'], provenance: 'reference',
  },
  {
    id: 'R-003', name: 'Pad-edge noise above the agreed limit', category: 'performance',
    condition: 'the aircraft noise estimate (63.5 dBA, TPM-002) comes from prediction only',
    ifEvent: 'measured pad-edge noise exceeds 65 dBA',
    then: 'the local agreement is breached and the city may restrict operating hours at the affected vertiport',
    likelihood: 2, consequence: 5, likelihoodWhy: 'The prediction leaves 1.5 dBA below the limit; predictions of this kind are seldom that far off, but nothing is measured yet.', consequenceWhy: 'Restricted hours put the operating permit in jeopardy, and losing it is a permanent loss of the service at that vertiport: C5.',
    handling: 'mitigate', owner: 'Community Relations Manager', treatment: 'Early pad-edge measurement campaign before revenue service; steeper approach and departure procedures held in reserve.', trigger: 'Any measured movement above 64 dBA',
    affects: ['REQ-SYS-002', 'REQ-STK-002', 'TPM-002'], provenance: 'reference',
  },
  {
    id: 'R-004', name: 'Weather limits lower than planned', category: 'external',
    condition: 'the aircraft weather limits are unpublished (U-001, TBD-01)',
    ifEvent: 'the approved limits are lower than the planning values',
    then: 'weather holds exceed the planned 5 % of operating hours and delivered capacity falls below REQ-STK-004',
    likelihood: 3, consequence: 4, likelihoodWhy: 'First-of-type limits are often set conservatively: an even chance.', consequenceWhy: 'A stakeholder requirement on network capacity is missed: C4.',
    handling: 'transfer', owner: 'Director of Flight Operations', treatment: 'The aircraft purchase contract carries a performance guarantee on the weather envelope with compensation per lost operating hour; a weather-routing study starts if the trigger fires (contingent strategy).', trigger: 'Manufacturer’s draft flight-manual limits below the planning values',
    affects: ['REQ-SYS-004', 'REQ-STK-004', 'SCN-005'], provenance: 'reference',
  },
  {
    id: 'R-005', name: 'Grid connection below hub charging demand', category: 'external',
    condition: 'connection capacity at the hub vertiports is not yet agreed (U-002, TBD-02)',
    ifEvent: 'a hub connection is limited below the demand of its two high-power chargers',
    then: 'simultaneous charging is curtailed and turnaround exceeds 25 min',
    likelihood: 2, consequence: 4, likelihoodWhy: 'The utility has not refused any site, but has not confirmed one either.', consequenceWhy: 'The stakeholder requirement for a 25 min turnaround (REQ-STK-005) is missed: C4.',
    handling: 'avoid', owner: 'Vertiport Infrastructure Manager', treatment: 'Commit a hub site only where the utility confirms capacity for two high-power chargers.', trigger: 'Utility response to the connection request',
    affects: ['REQ-SYS-010', 'REQ-STK-005', 'TECH-001'], provenance: 'reference',
  },
  {
    id: 'R-006', name: 'Detect-and-avoid not mature for autonomy', category: 'technology',
    condition: 'detect-and-avoid is at TRL 4 (A-005)',
    ifEvent: 'it does not reach TRL 6 before the autonomy increment is planned',
    then: 'remote or autonomous operations are delayed and operator workload stays at the piloted baseline',
    likelihood: 3, consequence: 2, likelihoodWhy: 'Two TRL steps in the planning horizon: an even chance.', consequenceWhy: 'The baseline is piloted, so every requirement is still met; an evolution objective slips, with little effect on the baseline objectives: C2.',
    handling: 'accept', owner: 'Director of Flight Operations', treatment: 'Accepted: the baseline does not depend on TECH-003; reviewed when the Week 6 evolution roadmap is drawn.', trigger: 'TRL review at evolution planning',
    affects: ['TECH-003', 'CAP-004'], provenance: 'reference',
  },
  {
    id: 'R-007', name: 'Dispatch platform outage', category: 'resilience',
    condition: 'booking, scheduling and dispatch run on one operations platform',
    ifEvent: 'that platform fails during operating hours',
    then: 'no new rides can be assigned and waits exceed 15 min network-wide within minutes',
    likelihood: 2, consequence: 4, likelihoodWhy: 'Commercial platforms of this kind fail rarely, but a single instance has no fallback.', consequenceWhy: 'A stakeholder requirement (REQ-STK-001) is missed network-wide: C4.',
    handling: 'mitigate', owner: 'Head of Operations Technology', treatment: 'Hot-standby platform with automatic failover; a manual dispatch procedure for failover periods.', trigger: 'Platform health alarm or failover event',
    affects: ['REQ-SYS-005', 'CAP-002'],
    resilience: { objectives: ['withstand', 'recover'], note: 'Failover withstands the loss; the manual procedure recovers a reduced service while the platform is restored.' },
    provenance: 'reference',
  },
  {
    id: 'R-008', name: 'Battery thermal runaway during charging', category: 'safety',
    condition: 'aircraft batteries are charged at high power on hub pads next to passengers and other aircraft',
    ifEvent: 'a cell enters thermal runaway during charging',
    then: 'a fire can spread on the pad, injure people and close the vertiport',
    likelihood: 2, consequence: 5, likelihoodWhy: 'Rare per charge, but there are about 240 high-power charges a day today, and more with a larger fleet.', consequenceWhy: 'Injury and closure of a vertiport: C5.',
    handling: 'mitigate', owner: 'Vertiport Safety Manager', treatment: 'Cell-temperature monitoring stops charging; pad fire detection alerts responders within 60 s (REQ-STK-008, REQ-SYS-009); pad separation and suppression.', trigger: 'Cell over-temperature alarm',
    affects: ['REQ-SYS-001', 'SCN-003', 'CAP-009'], provenance: 'reference',
  },
  // ---- proposed: security and resilience made explicit (DECISION_LOG A21 item 6)
  {
    id: 'R-009', name: 'Intrusion into the operations platform', category: 'security',
    condition: 'the dispatch platform is reachable through the public booking channel and exchanges flight intent with the air navigation service provider (REQ-STK-009)',
    ifEvent: 'an unauthorized party gains write access to assignment or flight-intent data',
    then: 'altered assignments or flight intents are issued, passenger data are exposed and the service is suspended network-wide until the data are trusted again',
    likelihood: 2, consequence: 5, likelihoodWhy: 'Standard access controls are assumed; internet-facing platforms are attacked routinely, so not “not likely”.', consequenceWhy: 'Flights dispatched on false data can injure people: C5 (the network-wide suspension alone would be C4).',
    handling: 'mitigate', owner: 'Head of Operations Technology', treatment: 'Separate the booking front end from dispatch (domain separation); authenticate and integrity-check every assignment and flight-intent message; manual dispatch as the fallback shared with R-007.', trigger: 'Any failed integrity check, or an access attempt on the dispatch segment flagged by security monitoring',
    affects: ['REQ-SYS-005', 'REQ-STK-009', 'CAP-002', 'SCN-001'],
    security: { assets: ['System capability', 'Data and information'], note: 'The asset is the dispatch capability and the integrity of its data, not the server: the loss to control is a flight dispatched on false data (R25 p.1232).' },
    resilience: { objectives: ['avoid', 'withstand', 'recover'], note: 'Separation avoids exposure, integrity checks withstand an intrusion, manual dispatch recovers a reduced service.' },
    provenance: 'proposed',
  },
  {
    id: 'R-010', name: 'Altered charger commands or configuration', category: 'security',
    condition: 'the high-power chargers are networked to the charging power control (REQ-SYS-010) and can be configured remotely',
    ifEvent: 'a charger’s commands or configuration are altered by an unauthorized party or a faulty update',
    then: 'the vertiport power limit is exceeded and protection trips the hub, or a charge continues past the cell limits and creates the thermal hazard of R-008',
    likelihood: 2, consequence: 5, likelihoodWhy: 'Remote configuration is routine for chargers; an unsigned update path is a known weak point.', consequenceWhy: 'A thermal hazard that can injure people on the pad: C5.',
    handling: 'mitigate', owner: 'Vertiport Infrastructure Manager', treatment: 'Accept only signed configurations and updates; a local cell-temperature interlock that stops charging without any network command (defense in depth); configuration checked against the signed baseline each night.', trigger: 'A charger configuration that does not match the signed baseline',
    affects: ['REQ-SYS-010', 'REQ-SYS-001', 'CAP-010', 'SCN-003'],
    security: { assets: ['Material resources and infrastructure', 'Human resources'], note: 'A security risk with a safety consequence: the same loss can come from an attacker or from a faulty update, so the treatment does not depend on knowing which (R25 p.1231, adversity includes faults).' },
    provenance: 'proposed',
  },
  {
    id: 'R-011', name: 'Regional grid outage', category: 'resilience',
    condition: 'all six vertiports draw on one utility’s distribution network and none has on-site energy storage',
    ifEvent: 'a regional outage lasts more than 2 h in operating hours',
    then: 'charging stops network-wide, aircraft are grounded after their reserve-protected trips, the service is suspended, and recovery needs a recharging wave that the connection limits slow down',
    likelihood: 1, consequence: 4, likelihoodWhy: 'Long regional outages are rare in the operating hours of one year.', consequenceWhy: 'The service is suspended but recoverable the same day, and no one is injured (every trip in progress lands with its reserve): C4.',
    handling: 'accept', owner: 'Network Planning Manager', treatment: 'Accepted with a contingency plan: finish trips in progress, move waiting passengers to the public-transport fallback (A-008), then recharge in a staggered order that keeps each vertiport within its connection limit. On-site storage is evaluated in the Week 6 evolution roadmap.', trigger: 'Utility outage notice, or loss of supply at two vertiports for more than 30 min',
    affects: ['REQ-STK-004', 'REQ-STK-010', 'CAP-003', 'SCN-005'],
    resilience: { objectives: ['withstand', 'recover'], note: 'The matrix calls it Low; resilience asks how long the outage and the recovery last (time to recover is a common resilience metric, R24 p.1209).' },
    provenance: 'proposed',
  },
]
export const risk = (id: string) => {
  const r = RISKS.find((x) => x.id === id)
  if (!r) throw new Error(`unknown risk ${id}`)
  return r
}
/** The statement assembled in the course form. */
export const riskStatement = (r: CaseRisk) => `Condition: ${r.condition}. If ${r.ifEvent}, then ${r.then}.`
export const riskLevel = (r: CaseRisk) => cellLevel(r.likelihood, r.consequence)
/** The register ranked by the course rule (cell level, then consequence, then likelihood). */
export const rankedRisks = () => [...RISKS].sort(compareRisks)

export const OPPORTUNITIES: { id: string; name: string; text: string; owner: string; action: string; provenance: CaseProvenance }[] = [
  { id: 'O-001', name: 'Integrated public-transport ticketing', text: 'If AeroLink trips can be booked within the regional journey planner, first-and-last-mile friction falls and demand may grow faster than the planning forecast.', owner: 'Head of Partnerships', action: 'Open data-sharing talks with the transport authority; evaluate in the Year-2 capacity plan.', provenance: 'reference' },
  { id: 'O-002', name: 'Overnight charger capacity for ground fleets', text: 'Hub chargers are idle about 8 h each night. If they can be leased to ground electric-vehicle fleets, charger capital is recovered faster, improving the case for more hub chargers.', owner: 'Head of Partnerships', action: 'Assess demand from municipal and taxi fleets; feeds the cost case of the trade study.', provenance: 'reference' },
]

/** Week 3 closes the Week 2 deliberate gap as its disposition asks ("write it in Week 3 with an owned TBD"): two stakeholder
 *  requirements for NEED-011 through CAP-015, one obligation each (Week 2's one-"shall" gate; review M2), with the unknown
 *  notice time as TBD-05 tracked by U-007 (proposed). aerolinkCase.test.ts runs Week 2's requirement gates on both. */
export const W3_UNKNOWNS: { id: string; kind: 'unknown'; name: string; tbx: string; owner: string; closeBy: string; provenance: CaseProvenance }[] = [
  { id: 'U-007', kind: 'unknown', name: 'Notice time for a disrupted trip not agreed', tbx: 'TBD-05', owner: 'Head of Customer Experience', closeBy: 'Agree the notice time with passenger representatives and the transport authority (A-008) before the Week 4 architecture baseline', provenance: 'proposed' },
]
/** Week 3's disposition of every Week 2 unknown, and of the Week 2 promise that the event cap would be a number before the
 *  trade (REQ-STK-011's rationale). Week 2 set close-by points "in" or "before" the Week 3 trade for U-002, U-003, U-004
 *  and U-006; none of them closed, so each is re-dated with a reason here rather than left stale (review m2). The Week 2
 *  text is not edited: these dispositions are the Week 3 record of what happened to each promise. Shown on the
 *  worked-examples page and in the Session 1 register notes. */
export type W2Disposition = { status: 'open' | 're-dated' | 'closed'; promisedWeek3: boolean; closeBy: string; disposition: string }
export const W2_DISPOSITIONS: Record<string, W2Disposition> = {
  'U-001': { status: 'open', promisedWeek3: false, closeBy: 'Before the Week 7 package baseline (unchanged)', disposition: 'On schedule; not needed by the trade. Risk R-004 carries the consequence if the limits come out lower than planned.' },
  'U-002': { status: 're-dated', promisedWeek3: true, closeBy: 'Before the Week 4 architecture baseline (the charger order)', disposition: 'Still open when the trade ran: the utility has not answered. The trade proceeds because the connection is made a condition of the decision and risk R-005 is handled by avoidance (no hub is committed without confirmed capacity); if the spoke cannot take two high-power chargers, the decision record names the fallback.' },
  'U-003': { status: 're-dated', promisedWeek3: true, closeBy: 'Before the Week 4 architecture baseline, when the schedule is checked against the cap', disposition: 'Still open when the trade ran. The trade did not need the number: the cap limits movements per pad in the evening and early morning, which the scheduling function enforces (REQ-SYS-011) whichever alternative is chosen, and the alternatives differ only in peak-hour movements, which the noise criterion scores. Week 2 said the cap must be a number before the trade could run; that turned out to be too strong, and this is the reason.' },
  'U-004': { status: 're-dated', promisedWeek3: true, closeBy: 'The Week 6 evolution roadmap, with the autonomy increment', disposition: 'Not analyzed in the trade: every Year-2 alternative keeps the piloted baseline, and remote operation waits for detect-and-avoid (TECH-003 at TRL 4, risk R-006 accepted). The workload analysis belongs with the increment that needs it.' },
  'U-005': { status: 'open', promisedWeek3: false, closeBy: 'Before site applications (unchanged)', disposition: 'Open; it now matters to the trade, because the new-hub alternative needs a seventh site within the walking distance.' },
  'U-006': { status: 're-dated', promisedWeek3: true, closeBy: 'The first quarterly demand re-forecast (the validation action of A-006)', disposition: 'Not related to demand in the trade: no alternative changes the fare, and the trade assumes demand independent of the alternative (A-006). The fare–demand relation belongs with the demand re-forecast that validates that assumption.' },
  'REQ-STK-011': { status: 're-dated', promisedWeek3: true, closeBy: 'With U-003', disposition: 'The trade ran with the cap (TBD-03) open, for the reason given under U-003.' },
}

export const W3_REQUIREMENTS: { id: string; level: 'stakeholder'; name: string; statement: string; type: 'functional' | 'performance'; method: 'demonstration'; criterion: string; rationale: string; parents: string[]; tbx: string; provenance: CaseProvenance }[] = [
  {
    id: 'REQ-STK-018', level: 'stakeholder', name: 'Notice of a disrupted trip',
    statement: 'The AeroLink service shall notify each passenger whose confirmed trip is held, diverted or cancelled within TBD-05 min of the disruption decision.',
    type: 'performance', method: 'demonstration',
    criterion: 'In replayed disruption days, every affected passenger notified within TBD-05 min of the decision (notice time pending U-007)',
    rationale: 'Closes, with REQ-STK-019, the Week 2 trace-audit gap for NEED-011 as its disposition asked. The notice time is unknown, so it carries an owned TBD (U-007) rather than an invented number.',
    parents: [DELIBERATE_REQ_GAP.need, 'CAP-015'], tbx: 'TBD-05', provenance: 'proposed',
  },
  {
    id: 'REQ-STK-019', level: 'stakeholder', name: 'A way onward for a disrupted trip',
    statement: 'The AeroLink service shall offer each passenger whose confirmed trip is held, diverted or cancelled a way onward to the destination.',
    type: 'functional', method: 'demonstration',
    criterion: 'In replayed disruption days, every affected passenger offered a booked way onward (a later flight or the public-transport fallback) before leaving the vertiport',
    rationale: 'Closes, with REQ-STK-018, the Week 2 trace-audit gap for NEED-011: a notice without a way onward still strands the passenger. The way onward rests on the public-transport fallback (A-008).',
    parents: [DELIBERATE_REQ_GAP.need, 'CAP-015'], tbx: '', provenance: 'proposed',
  },
]

/** The issue log (kept apart from the register). I-001 is the Week 2 deliberate gap: at the end of Week 2 it had occurred
 *  (P = 1), so it was an issue, not a risk; Week 3 closes it with REQ-STK-018 and REQ-STK-019. */
export const ISSUES: { id: string; name: string; text: string; owner: string; action: string; status: 'open' | 'closed'; provenance: CaseProvenance }[] = [
  {
    id: 'I-001', name: `${DELIBERATE_REQ_GAP.need} had no requirement`,
    text: `${DELIBERATE_REQ_GAP.finding} It was not uncertain: the gap existed, so it was an issue, not a risk.`,
    owner: 'Requirements & Compliance lead', action: 'Closed in Week 3 by two requirements, one obligation each, both tracing to NEED-011 and CAP-015: REQ-STK-018 (notice, with the unknown notice time as TBD-05, owned through U-007) and REQ-STK-019 (a way onward, resting on A-008).', status: 'closed', provenance: 'proposed',
  },
]

// ================================================================================================ the event-cap correction
/** The second dimension of the corrected NEED-003 (the number of evening and early-morning events), carried into the
 *  objective, the measure and the TPM decision. The reference baseline records the same text as an `eventCap` attribute
 *  on MGO-006 (reference/week03.ts) and MOE-003 and TPM-002 (reference/week05.ts); aerolinkCase.test.ts checks they are
 *  equal, and the canonical-data test (week01/aerolinkCanonical.test.ts) no longer lists them as exceptions. */
export const EVENT_CAP = {
  'MGO-006': 'Week 3: the objective also counts pad-hours before 07:00 and after 20:00 above the agreed evening and early-morning event cap (TBD-03); the target is zero such pad-hours per quarter, alongside zero events above 65 dBA.',
  'MOE-003': 'Week 3: noise compliance is reported in two parts, the share of movements at or below 65 dBA and the share of evening and early-morning pad-hours within the agreed event cap (measured as MOE-007).',
  'TPM-002': 'Week 3 decision: the evening and early-morning event cap gets no aircraft TPM. It is not a design parameter that matures with development; the scheduling function enforces it (REQ-SYS-011, verified by test) and MOP-010 tracks it in operation. TPM-002 tracks the level of each event only.',
} as const
export const MGO006 = OBJECTIVES.find((o) => o.id === 'MGO-006')!
export const MOE003 = MOES.find((m) => m.id === 'MOE-003')!
export const MOE007 = MOES.find((m) => m.id === 'MOE-007')!
export const MOP010 = MOPS.find((m) => m.id === 'MOP-010')!

// ================================================================================================ TPMs
export type ProfilePoint = { label: string; month: number; cbe: number; contingency: number }
export type CaseTpm = {
  id: string
  name: string
  /** The requirement it tracks (TPM measures REQ-SYS) and the MOP it derives from (reference week05.ts links). */
  measures: string
  derivesFrom: string
  unit: string
  sense: Sense
  threshold: number
  objective: number
  cbe: number
  contingency: number
  contingencyWhy: string
  basis: string
  /** Planned current best estimate and contingency at each review point (proposed). */
  profile: ProfilePoint[]
  relatedRisk: string
  note?: string
  provenance: CaseProvenance
}
const REVIEWS = ['Now (concept)', 'Prototype test', 'Design review', 'Qualification', 'Service entry'] as const
const prof = (months: number[], cbe: number[], c: number[]): ProfilePoint[] => months.map((m, i) => ({ label: REVIEWS[i], month: m, cbe: cbe[i], contingency: c[i] }))
const MONTHS = [0, 6, 12, 18, 24]

export const TPMS: CaseTpm[] = [
  {
    id: 'TPM-001', name: 'Charge time to dispatch threshold', measures: 'REQ-SYS-001', derivesFrom: 'MOP-002', unit: 'min', sense: 'lower-is-better',
    threshold: 20, objective: 15, cbe: 18, contingency: 1.0, contingencyWhy: 'The estimate comes from the supplier’s charge-curve analysis of a prototype at another site, not from a measurement at an AeroLink hub.',
    basis: 'Supplier charge-curve analysis (FICTIONAL estimate)', profile: prof(MONTHS, [18, 17.5, 17, 16.5, 16.5], [1.0, 0.6, 0.4, 0.2, 0.1]), relatedRisk: 'R-005', provenance: 'reference',
  },
  {
    id: 'TPM-002', name: 'Pad-edge noise', measures: 'REQ-SYS-002', derivesFrom: 'MOP-004', unit: 'dBA', sense: 'lower-is-better',
    threshold: 65, objective: 62, cbe: 63.5, contingency: 1.0, contingencyWhy: 'Prediction only: no pad-edge measurement of this aircraft exists yet.',
    basis: 'Noise prediction analysis; no measurement yet (FICTIONAL estimate)', profile: prof(MONTHS, [63.5, 63.5, 63.2, 63, 63], [1.0, 0.5, 0.4, 0.3, 0.2]), relatedRisk: 'R-003',
    note: EVENT_CAP['TPM-002'], provenance: 'reference',
  },
  {
    id: 'TPM-003', name: 'Landing energy reserve on the design trip', measures: 'REQ-SYS-003', derivesFrom: 'MOP-005', unit: '%', sense: 'higher-is-better',
    threshold: 20, objective: 25, cbe: 23, contingency: 1.5, contingencyWhy: 'End-of-life capacity rests on assumed supplier fade data (A-004, 10 % fade).',
    basis: 'Energy analysis with end-of-life cell capacity (FICTIONAL estimate)', profile: prof(MONTHS, [23, 23, 23, 23, 23], [1.5, 1.0, 0.8, 0.5, 0.5]), relatedRisk: 'R-002', provenance: 'reference',
  },
]
export const tpm = (id: string) => {
  const t = TPMS.find((x) => x.id === id)
  if (!t) throw new Error(`unknown TPM ${id}`)
  return t
}
export const wceOf = (t: CaseTpm) => round(worstCase(t.sense, t.cbe, t.contingency))
export const marginOf = (t: CaseTpm) => round(margin(t.sense, t.threshold, wceOf(t)))
/** The reference margin: threshold minus the current estimate, i.e. zero contingency. */
export const referenceMarginOf = (t: CaseTpm) => round(margin(t.sense, t.threshold, t.cbe))
export const plannedProfile = (t: CaseTpm) =>
  t.profile.map((p) => {
    const wce = round(worstCase(t.sense, p.cbe, p.contingency))
    return { ...p, wce, margin: round(margin(t.sense, t.threshold, wce)) }
  })

/** The energy model behind TPM-003 (FICTIONAL): the design trip uses a fixed energy T. With fade f the usable end-of-life
 *  energy is (1 − f) of beginning-of-life energy, and the landing reserve is the share left: (1 − f − T) ÷ (1 − f).
 *  The reference CBE (23 % at 10 % fade) fixes T = 0.9 × 0.77 = 0.693 of beginning-of-life usable energy. */
export const FADE_MODEL = { assumedFade: 0.1, cbeAtAssumed: 0.23, get tripEnergy() { return round((1 - this.assumedFade) * (1 - this.cbeAtAssumed), 4) } }
export const reserveAtFade = (f: number) => round(((1 - f - FADE_MODEL.tripEnergy) / (1 - f)) * 100, 2)
/** The hypothetical month-6 reading of the exercise (proposed): cycle tests show 12 % fade, not 10 %. The reserve is
 *  rounded once, to two decimals (21.25 %), so worst case and margin are exact (20.25 %, 0.25 points; review minor 8). */
export const MONTH6 = (() => {
  const fade = 0.12
  const cbe = reserveAtFade(fade)
  const contingency = 1.0
  const t = tpm('TPM-003')
  const wce = round(worstCase(t.sense, cbe, contingency), 2)
  return { fade, cbe, contingency, wce, margin: round(margin(t.sense, t.threshold, wce), 2), trigger: 1.0 }
})()
/** And at 15 % fade the reserve falls below the 20 % threshold itself (the requirement becomes infeasible on the design trip). */
export const FADE15 = reserveAtFade(0.15)

/** One chain through all three instruments (Session 1, connecting slide). */
export const CHAIN = ['TECH-002', 'R-002', 'TPM-003', 'REQ-SYS-003', 'NEED-002'] as const

// ================================================================================================ risk arithmetic, worked
/** Why the ordinal product misleads (Session 1): same product, different cells; higher product, lower consequence. */
export const ORDINAL_DEMO = {
  sameProduct: [{ l: 1, c: 5 }, { l: 5, c: 1 }].map((x) => ({ ...x, product: ordinalProduct(x.l, x.c), level: cellLevel(x.l, x.c) })),
  r002: { product: ordinalProduct(3, 4), level: cellLevel(3, 4) },
  r008: { product: ordinalProduct(2, 5), level: cellLevel(2, 5) },
}
/** A cardinal check for one risk whose consequence CAN be measured (R-004): expected capacity lost, using the likelihood
 *  band (proposed values: holds rise from the planned 5 % to 8 % of operating hours). */
export const R004_EXPECTED = (() => {
  const capacity = 300
  const holdsPlanned = 0.05
  const holdsIfLower = 0.08
  const lost = round(capacity * (holdsIfLower - holdsPlanned), 1)
  const band = { lo: 0.4, hi: 0.6 }
  return { capacity, holdsPlanned, holdsIfLower, lost, expectedLo: round(lost * band.lo, 1), expectedMid: round(lost * 0.5, 1), expectedHi: round(lost * band.hi, 1) }
})()

// ================================================================================================ the trade study
/** The decision rules (reference week07.ts; FICTIONAL values). */
export const TRADE_RULES = {
  demand: 240,
  tripsPerAircraft: 20,
  chargesPerCharger: 48,
  aircraftCost: 3.0,
  chargerUpgradeCost: 0.4,
  newHubCost: 6.0,
  operatingHours: 16,
  movementsPerTrip: 2,
  peaking: 1.6,
  chargersPerHub: 2,
}
export const capacityOf = (aircraft: number, chargers: number) => Math.min(aircraft * TRADE_RULES.tripsPerAircraft, chargers * TRADE_RULES.chargesPerCharger)
/** Wait from the Week 1 dynamics approximation: w(u) = 2 ÷ (1 − min(u, 0.97)) + max(0, u − 1) × 120, u = demand ÷ capacity. */
export const waitOf = (capacity: number) => {
  const u = TRADE_RULES.demand / capacity
  return 2 / (1 - Math.min(u, 0.97)) + Math.max(0, u - 1) * 120
}
export const peakMovementsOf = (capacity: number, sites: number) => ((Math.min(TRADE_RULES.demand, capacity) * TRADE_RULES.movementsPerTrip) / TRADE_RULES.operatingHours / sites) * TRADE_RULES.peaking
export const retainedOf = (aircraft: number, chargers: number) => capacityOf(aircraft, chargers - TRADE_RULES.chargersPerHub) / capacityOf(aircraft, chargers)

export type CaseAlternative = { id: string; name: string; baseline?: boolean; aircraft: number; chargers: number; sites: number; addedAircraft: number; upgradedChargers: number; newHubs: number; text: string; provenance: CaseProvenance }
/** ALT-001..004 are the reference alternatives. ALT-005 and ALT-006 are the two further paths through the morphological
 *  box that pass every screen (review M1): without them the trade compared one feasible alternative with three infeasible
 *  ones. The other three paths of the box fail a screen and are not listed (MORPH_PATHS shows why). */
export const ALTERNATIVES: CaseAlternative[] = [
  { id: 'ALT-001', name: 'Baseline: no added capacity', baseline: true, aircraft: 12, chargers: 6, sites: 6, addedAircraft: 0, upgradedChargers: 0, newHubs: 0, text: 'Keep 12 aircraft and 6 vertiports (3 hubs with 2 turnaround chargers each).', provenance: 'reference' },
  { id: 'ALT-002', name: 'Additional aircraft only', aircraft: 18, chargers: 6, sites: 6, addedAircraft: 6, upgradedChargers: 0, newHubs: 0, text: 'Buy 6 aircraft (18 in total) and keep the charging network.', provenance: 'reference' },
  { id: 'ALT-003', name: 'Additional vertiport only', aircraft: 12, chargers: 8, sites: 7, addedAircraft: 0, upgradedChargers: 0, newHubs: 1, text: 'Build a seventh vertiport as a fourth hub with 2 turnaround chargers; keep 12 aircraft. (A seventh site would also need a change to the six-vertiport wording of REQ-STK-004.)', provenance: 'reference' },
  { id: 'ALT-004', name: 'Balanced: aircraft plus hub charging', aircraft: 16, chargers: 8, sites: 6, addedAircraft: 4, upgradedChargers: 2, newHubs: 0, text: 'Buy 4 aircraft (16 in total) and upgrade the 2 chargers at one spoke vertiport to high-power units, making it a fourth hub.', provenance: 'reference' },
  { id: 'ALT-005', name: 'Aircraft plus a new hub vertiport', aircraft: 16, chargers: 8, sites: 7, addedAircraft: 4, upgradedChargers: 0, newHubs: 1, text: 'Buy 4 aircraft (16 in total) and build a seventh vertiport as a fourth hub with 2 turnaround chargers. (A seventh site needs a change to the six-vertiport wording of REQ-STK-004 and a site within the walking distance of U-005.)', provenance: 'proposed' },
  { id: 'ALT-006', name: 'Six aircraft plus hub charging', aircraft: 18, chargers: 8, sites: 6, addedAircraft: 6, upgradedChargers: 2, newHubs: 0, text: 'Buy 6 aircraft (18 in total) and upgrade the 2 chargers at one spoke vertiport to high-power units, making it a fourth hub.', provenance: 'proposed' },
]
export const alternative = (id: string) => ALTERNATIVES.find((a) => a.id === id)!
/** The four reference alternatives (reference week07.ts ALT-001..004), kept for the comparison with the reference record. */
export const REFERENCE_ALTERNATIVES = ['ALT-001', 'ALT-002', 'ALT-003', 'ALT-004'] as const

export type CaseCriterion = {
  id: string
  name: string
  /** The MOE (and through it the need or objective) the criterion traces to (reference week07.ts derives-from links). */
  moe: string
  unit: string
  sense: Sense
  walkAway: number
  stretch: number
  swingPoints: number
  swingRationale: string
  scoreOf: (a: CaseAlternative) => number
  /** Security or resilience reading of the criterion, when it has one. */
  lens?: string
  provenance: CaseProvenance
}
export const CRITERIA: CaseCriterion[] = [
  { id: 'CRIT-001', name: 'Wait at Year-2 demand', moe: 'MOE-001', unit: 'min', sense: 'lower-is-better', walkAway: 60, stretch: 5, swingPoints: 100,
    swingRationale: 'Swinging from a 60 min to a 5 min wait was ranked the most valuable swing: it decides whether passengers stay (A-001).', scoreOf: (a) => waitOf(capacityOf(a.aircraft, a.chargers)), provenance: 'reference' },
  { id: 'CRIT-002', name: 'Capital cost', moe: 'MOE-005', unit: 'USD M', sense: 'lower-is-better', walkAway: 20, stretch: 0, swingPoints: 75,
    swingRationale: 'Investors rank avoiding USD 20 M of spend second: three quarters of the value of the wait swing.', scoreOf: (a) => a.addedAircraft * TRADE_RULES.aircraftCost + a.upgradedChargers * TRADE_RULES.chargerUpgradeCost + a.newHubs * TRADE_RULES.newHubCost, provenance: 'reference' },
  { id: 'CRIT-003', name: 'Capacity retained after loss of a hub', moe: 'MOE-006', unit: '%', sense: 'higher-is-better', walkAway: 50, stretch: 100, swingPoints: 40,
    swingRationale: 'Hub closures for weather are expected a few days a month (SCN-005); valued at 40 % of the wait swing.', scoreOf: (a) => 100 * retainedOf(a.aircraft, a.chargers),
    lens: 'The resilience criterion: performance after a disruption compared with before it, one of the common resilience metrics (R24 p.1209). It measures the “withstand” objective for the loss of one hub.', provenance: 'reference' },
  { id: 'CRIT-004', name: 'Community noise exposure', moe: 'MOE-003', unit: 'movements/h', sense: 'lower-is-better', walkAway: 10, stretch: 5, swingPoints: 35,
    swingRationale: 'Each movement already meets 65 dBA (REQ-STK-002); how often residents are disturbed matters to the community, but less than service.', scoreOf: (a) => peakMovementsOf(capacityOf(a.aircraft, a.chargers), a.sites),
    lens: 'The trade’s handle on the event-count dimension of NEED-003: peak-hour movements at the busiest vertiport. The trace to MOE-003 is indirect: MOE-003 reports the share of compliant movements and of pad-hours within the cap, and peak-hour movements is the trade’s stated proxy for how often residents are disturbed. The evening cap itself (TBD-03) is a constraint checked on the schedule, not a weighted criterion.', provenance: 'reference' },
]
export const criterion = (id: string) => CRITERIA.find((c) => c.id === id)!
export const WEIGHTS = normalizeWeights(CRITERIA.map((c) => c.swingPoints))

export const SCORES: Record<string, number[]> = Object.fromEntries(ALTERNATIVES.map((a) => [a.id, CRITERIA.map((c) => c.scoreOf(a))]))
export const VALUES: Record<string, number[]> = Object.fromEntries(ALTERNATIVES.map((a) => [a.id, CRITERIA.map((c, i) => linearValue(SCORES[a.id][i], c.walkAway, c.stretch))]))
export const TOTALS: Record<string, number> = Object.fromEntries(ALTERNATIVES.map((a) => [a.id, additiveValue(WEIGHTS, VALUES[a.id])]))
export const capacityOfAlt = (a: CaseAlternative) => capacityOf(a.aircraft, a.chargers)
export const REQUIRED_CAPACITY = 300
/** The criteria on which a score lies beyond the walk-away point (the decision maker walks away whatever else it scores). */
const beyond = (c: CaseCriterion, x: number) => (c.sense === 'lower-is-better' ? x > c.walkAway + 1e-9 : x < c.walkAway - 1e-9)
export const walkAwayFailures = (scores: number[]) => CRITERIA.filter((c, i) => beyond(c, scores[i])).map((c) => c.id)
const beyondNote = (scores: number[]) =>
  CRITERIA.flatMap((c, i) => (beyond(c, scores[i]) ? [`${c.name} ${round(scores[i], 1)} ${c.unit}, beyond the ${c.walkAway} ${c.unit} walk-away`] : [])).join('; ')

/** Must-meet screens, applied before any scoring (proposed; a screen is a walk-away point applied before the arithmetic,
 *  R18 pp.465–466). The first two are the frame itself (review M1): the stakeholder capacity requirement REQ-STK-004 and
 *  the walk-away points of the criteria. The last two are security: a minimum stakeholder expectation, not a quantity to
 *  trade against wait time (R25 p.1229). An alternative that fails a screen is not ranked and cannot be a reversal target.
 *  The ids of the two security screens are kept (SCREEN-1, SCREEN-2); the frame screens were added after them. */
export const SCREENS: { id: string; name: string; test: string; results: Record<string, { pass: boolean; note: string }>; provenance: CaseProvenance }[] = [
  {
    id: 'SCREEN-3', name: 'Meets the capacity requirement', test: `Capacity of at least ${REQUIRED_CAPACITY} trips/day by month 24 (REQ-STK-004).`,
    results: Object.fromEntries(ALTERNATIVES.map((a) => {
      const c = capacityOfAlt(a)
      return [a.id, { pass: c >= REQUIRED_CAPACITY, note: c >= REQUIRED_CAPACITY ? `${c} trips/day.` : `${c} trips/day, short of ${REQUIRED_CAPACITY}.` }]
    })),
    provenance: 'proposed',
  },
  {
    id: 'SCREEN-4', name: 'Inside every walk-away point', test: 'No score lies beyond a criterion’s walk-away point, where the decision maker walks away however well the alternative does elsewhere.',
    results: Object.fromEntries(ALTERNATIVES.map((a) => {
      const f = walkAwayFailures(SCORES[a.id])
      return [a.id, { pass: !f.length, note: f.length ? `${beyondNote(SCORES[a.id])}.` : 'Every score inside its walk-away point.' }]
    })),
    provenance: 'proposed',
  },
  {
    id: 'SCREEN-1', name: 'Charger control is authenticated', test: 'Every charger the alternative adds or upgrades accepts only signed configurations and has a local cell-temperature interlock (the treatment of R-010).',
    results: {
      'ALT-001': { pass: true, note: 'No charger is added.' },
      'ALT-002': { pass: true, note: 'No charger is added.' },
      'ALT-003': { pass: true, note: 'The new hub’s chargers are bought to the same specification.' },
      'ALT-004': { pass: true, note: 'Passes only if the two upgraded spoke chargers are replaced, not retrofitted: a condition on the decision.' },
      'ALT-005': { pass: true, note: 'The new hub’s chargers are bought to the same specification.' },
      'ALT-006': { pass: true, note: 'Passes only if the two upgraded spoke chargers are replaced, not retrofitted.' },
    },
    provenance: 'proposed',
  },
  {
    id: 'SCREEN-2', name: 'No new unauthenticated external interface', test: 'The alternative adds no interface to the dispatch platform or the charging control that bypasses authentication (the treatment of R-009).',
    results: {
      'ALT-001': { pass: true, note: 'No new interface.' },
      'ALT-002': { pass: true, note: 'More aircraft use the existing, authenticated interfaces.' },
      'ALT-003': { pass: true, note: 'The new site joins the existing network through the same gateway.' },
      'ALT-004': { pass: true, note: 'The converted hub joins through the existing gateway.' },
      'ALT-005': { pass: true, note: 'The new site joins the existing network through the same gateway.' },
      'ALT-006': { pass: true, note: 'The converted hub joins through the existing gateway.' },
    },
    provenance: 'proposed',
  },
]
export const passesScreens = (id: string) => SCREENS.every((s) => s.results[id]?.pass === true)
/** The alternatives that pass every screen, in record order: the only ones ranked and used in the sensitivity analysis. */
export const FEASIBLE = ALTERNATIVES.filter((a) => passesScreens(a.id)).map((a) => a.id)
export const SCREENED_OUT = ALTERNATIVES.filter((a) => !passesScreens(a.id)).map((a) => a.id)
/** The ranking among the feasible alternatives. */
export const RANKING = [...FEASIBLE].sort((a, b) => TOTALS[b] - TOTALS[a])

/** Every path through the morphological box (Session 2): 3 fleet choices × 3 hub choices. Each path is either a listed
 *  alternative or fails a screen; none is left unexplained. */
export const MORPH_FLEET = [{ added: 0, label: 'Keep 12' }, { added: 4, label: 'Add 4' }, { added: 6, label: 'Add 6' }] as const
export const MORPH_HUBS = [
  { key: 'keep', label: 'Keep 3 hubs', upgraded: 0, newHubs: 0 },
  { key: 'upgrade', label: 'Upgrade a spoke to a fourth hub', upgraded: 2, newHubs: 0 },
  { key: 'new', label: 'New vertiport as a fourth hub', upgraded: 0, newHubs: 1 },
] as const
export const MORPH_PATHS = MORPH_FLEET.flatMap((f) =>
  MORPH_HUBS.map((h) => {
    const a: CaseAlternative = {
      id: '', name: `${f.label}, ${h.label.toLowerCase()}`, aircraft: 12 + f.added, chargers: 6 + (h.upgraded ? TRADE_RULES.chargersPerHub : 0) + h.newHubs * TRADE_RULES.chargersPerHub,
      sites: 6 + h.newHubs, addedAircraft: f.added, upgradedChargers: h.upgraded, newHubs: h.newHubs, text: '', provenance: 'proposed',
    }
    const listed = ALTERNATIVES.find((x) => x.addedAircraft === a.addedAircraft && x.upgradedChargers === a.upgradedChargers && x.newHubs === a.newHubs)
    const scores = CRITERIA.map((c) => c.scoreOf(a))
    const capacity = capacityOfAlt(a)
    const fails = [...(capacity < REQUIRED_CAPACITY ? ['capacity'] : []), ...walkAwayFailures(scores)]
    return { fleet: f.label, hubs: h.label, alt: listed?.id ?? null, aircraft: a.aircraft, chargers: a.chargers, sites: a.sites, capacity, cost: scores[1], fails }
  }),
)

/** One-at-a-time sensitivity of every criterion among the FEASIBLE alternatives (rescaling the others in proportion).
 *  A "reversal" to a screened-out alternative is no reversal at all: the decision maker has already walked away from it. */
export const SENSITIVITY = CRITERIA.map((c, k) => {
  const r = reversalPoints(WEIGHTS, FEASIBLE.map((a) => VALUES[a]), k)
  return { criterion: c.id, base: WEIGHTS[k], up: r.up ? { w: r.up.w, to: FEASIBLE[r.up.to] } : null, down: r.down ? { w: r.down.w, to: FEASIBLE[r.down.to] } : null }
})
/** The same analysis over the four reference alternatives WITHOUT the screens: what the reference record reports (cost
 *  weight 0.478 → the baseline). Shown once in Session 2 as the mistake the screens prevent; never a decision condition. */
export const UNSCREENED_SENSITIVITY = CRITERIA.map((c, k) => {
  const ids = [...REFERENCE_ALTERNATIVES]
  const r = reversalPoints(WEIGHTS, ids.map((a) => VALUES[a]), k)
  return { criterion: c.id, base: WEIGHTS[k], up: r.up ? { w: r.up.w, to: ids[r.up.to] } : null, down: r.down ? { w: r.down.w, to: ids[r.down.to] } : null }
})
/** Line-diagram data for criterion k (Session 2): each feasible alternative's total at weights 0, 0.1, … 1. */
export const lineDiagram = (k: number, ids: readonly string[] = FEASIBLE) =>
  Array.from({ length: 11 }, (_, i) => i / 10).map((w) => ({ w, totals: Object.fromEntries(ids.map((a) => [a, additiveValue(WEIGHTS.map((x, j) => (j === k ? w : (x * (1 - w)) / (1 - WEIGHTS[k]))), VALUES[a])])) }))

/** The weighted-sum pitfall worked (Session 2): value from MIN–MAX normalization over the alternative set instead of fixed
 *  walk-away and stretch anchors. Removing an alternative changes the others' values and can reverse their order. */
export function minMaxTotals(ids: string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const id of ids) {
    const v = CRITERIA.map((c, i) => {
      const col = ids.map((x) => SCORES[x][i])
      const lo = Math.min(...col)
      const hi = Math.max(...col)
      if (hi === lo) return 0
      const t = (SCORES[id][i] - lo) / (hi - lo)
      return c.sense === 'higher-is-better' ? t : 1 - t
    })
    out[id] = additiveValue(WEIGHTS, v)
  }
  return out
}
/** Among the feasible alternatives: if the spoke conversion is ruled out (the TBD-02 condition), ALT-004 drops out, and
 *  min–max scaling reverses the order of the two that remain; fixed anchors keep their order in both sets. */
export const MINMAX_DEMO = (() => {
  const removed = 'ALT-004'
  const pair = FEASIBLE.filter((x) => x !== removed)
  return { removed, pair, all: minMaxTotals(FEASIBLE), without: minMaxTotals(pair) }
})()

/** The decision record (reference DEC-001, American spelling, current week numbers). The conditions and the would-change
 *  list come from the sensitivity among the feasible alternatives (review M1), the demand assumption, the grid unknown
 *  and the security screen (proposed). */
export const DECISION = (() => {
  const s = (id: string) => SENSITIVITY.find((x) => x.criterion === id)!
  const costDown = s('CRIT-002').down!
  const noiseUp = s('CRIT-004').up!
  const waitUp = s('CRIT-001').up!
  const runnerUp = RANKING[1]
  return {
    id: 'DEC-001',
    decision: 'How should AeroLink provide the Year-2 capacity objective (MGO-007; REQ-STK-004, at least 300 trips/day by month 24)?',
    recommended: 'ALT-004',
    why: `ALT-004 is one of ${FEASIBLE.length} alternatives that pass every screen (the capacity requirement, the walk-away points and the two security screens), and it scores ${TOTALS['ALT-004'].toFixed(3)} against ${TOTALS[runnerUp].toFixed(3)} for ${runnerUp}, the next best. Aircraft alone (ALT-002) move the bottleneck to charging and a vertiport alone (ALT-003) leaves the network fleet-limited: both fail the capacity requirement before any weight is applied, and so does the baseline.`,
    conditions: [
      `the capital weight stays above about ${costDown.w.toFixed(2)} and the noise weight below about ${noiseUp.w.toFixed(2)} (past either, ${costDown.to}, the new hub vertiport, ranks first)`,
      'Year-2 demand stays near 240 trips/day (A-006)',
      'the spoke site’s grid connection supports two high-power chargers (U-002, R-005)',
      'the two upgraded chargers are replaced to the signed-configuration specification, not retrofitted (SCREEN-1, R-010)',
    ],
    residualRisk: ['R-001 reduced but not removed', 'R-005 at the converted hub', 'R-002 rises with more fast-charge cycles (watch TPM-003)', 'R-010 grows with two more networked high-power chargers'],
    wouldChangeIf: [
      'the demand forecast falls to 192 trips/day or less (240 trips/day would then meet the 80 % utilization rule, and the baseline provides 240)',
      `the capital weight falls below ${costDown.w.toFixed(3)} or the noise weight rises above ${noiseUp.w.toFixed(3)} (${costDown.to} ranks first)`,
      `the wait weight rises above ${waitUp.w.toFixed(3)} (${waitUp.to} ranks first; far from the base of ${WEIGHTS[0].toFixed(2)})`,
      `the connection limit (TBD-02) rules out converting the spoke: ${costDown.to} is then the recommendation, subject to its own grid connection, a seventh site (U-005) and a change to the six-vertiport wording of REQ-STK-004`,
    ],
    provenance: 'reference' as CaseProvenance,
  }
})()

// ================================================================================================ links and lookups
/** Every id the Week 3 case may point at: Week 2 requirements, capabilities, scenarios, needs, objectives and measures,
 *  plus this module's own entries. Used by the tests to prove every trace resolves. */
export const KNOWN_IDS = new Set<string>([
  ...REQUIREMENTS.map((r) => r.id), ...CAPABILITIES.map((c) => c.id), ...SCENARIOS.map((s) => s.id), ...NEEDS.map((n) => n.id),
  ...OBJECTIVES.map((o) => o.id), ...MOES.map((m) => m.id), ...MOPS.map((m) => m.id), ...UNCERTAINTIES.map((u) => u.id),
  ...TECHNOLOGIES.map((t) => t.id), ...ASSUMPTIONS.map((a) => a.id), ...RISKS.map((r) => r.id), ...OPPORTUNITIES.map((o) => o.id),
  ...ISSUES.map((i) => i.id), ...W3_UNKNOWNS.map((u) => u.id), ...W3_REQUIREMENTS.map((r) => r.id), ...TPMS.map((t) => t.id), ...CRITERIA.map((c) => c.id), ...ALTERNATIVES.map((a) => a.id), 'DEC-001',
])
/** Week 3 artifacts and the Phase I and Phase II weeks they feed (Session 2, last lecture slide). */
export const FEEDS_FORWARD: { artifact: string; week: string; how: string }[] = [
  { artifact: 'Decision record (16 aircraft, four hubs)', week: 'Week 4', how: 'the starting configuration of the architecture and its information view' },
  { artifact: 'Derived requirements from the decision (charger rating and signed configuration at the converted hub)', week: 'Weeks 4–5', how: 'allocated to components and written into interface definitions' },
  { artifact: 'Security and resilience risks and treatments', week: 'Weeks 5–6', how: 'interfaces that need authentication; on-site storage and autonomy in the evolution roadmap' },
  { artifact: 'Risks, assumptions and unknowns with their links; TPMs as evidence', week: 'Week 12', how: 'risk metadata on model elements; TPMs and requirements verified through the digital thread' },
  { artifact: 'Trade study (criteria, value functions, weights, sensitivity) and TPM thresholds', week: 'Week 13', how: 'redone as analysis cases with the thresholds as constraints' },
]
