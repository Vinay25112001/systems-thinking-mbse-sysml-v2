// AeroLink Week 5 case: components and interfaces. The component breakdown from the Week 4 physical view (level 1) with
// proposed level-2 components and a responsibility card per element; the interface set received from Week 4 (IF-001..014)
// defined in full, with the two interfaces this week adds (IF-015 resolves the INFO-006 gap Week 4 handed over; IF-016
// gives the aircraft and spares supply its interface); the N² chart computed from the definitions; the interface
// requirements written by the three steps; the latency budget Week 4 left open; the trust boundaries, protection and
// degraded mode of every interface (security and resilience at interfaces, DECISION_LOG A21 item 6); one change request
// traced through the N²; the integration aggregates; the coupling comparison of the Week 4 decision; and the audit. The
// single source for the Week 5 lectures (session1.ts, session2.ts), their figures (src/components/figures/LectureWeek5S1.tsx,
// S2.tsx), the worked-examples page and the tests (aerolinkCase.test.ts). Exported names are kept stable; fields are only
// ever added.
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week05/WEEK05_LECTURE_OUTLINE.md §4.
//
// AeroLink Urban Mobility is FICTIONAL. Every number, name and statement is a teaching value, not a real-world claim.
//
// Provenance. Week 1–4 data are IMPORTED, never retyped: external systems and stakeholders from ../week01, requirements from
// ../week02, risks from ../week03, and the physical elements, functions, information items with their routes, the
// interfaces' ends and types, the agreements and DEC-002 from ../week04/aerolinkCase.ts (read-only). The interface names
// and the verification cases are checked against the instructor reference (src/model/reference/week08.ts, week12.ts) in
// the test. What crosses an information interface, and in which direction, is COMPUTED from the Week 4 routes, so a
// definition that disagrees with the information view fails the test. Everything this module adds is
// `provenance: 'proposed'` (instructor to confirm): the level-2 components, the medium, owners, constraints, protection and
// degraded mode of each interface, IF-015, IF-016, the interface requirements REQ-SYS-013..015, the latency budget, the
// change request and the aggregates.
import { EXTERNAL_SYSTEMS, STAKEHOLDERS, type CaseProvenance } from '../week01/aerolinkCase'
import { requirement } from '../week02/aerolinkCase'
import { RISKS } from '../week03/aerolinkCase'
import {
  AGREEMENTS, ARCH_DECISION, CONFIGURATION, FEEDS_FORWARD, FINDINGS as W4_FINDINGS, FUNCTIONS, INFORMATION, INTERFACES as W4_INTERFACES, PHYSICAL, W4_EXTERNALS, fn, info, physical, placeOf,
} from '../week04/aerolinkCase'
import type { ComponentKind, InterfaceKind } from './labBrief'

export const AEROLINK_W5_REVIEW = 'new-pending-review' as const
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

// ================================================================================================ elements on the diagonal
/** The elements of the N² diagonal: the Week 4 physical elements, then every external element of the Week 4 view (Week 1's
 *  six and the proposed weather information service). Externals with no interface stay on the diagonal: their empty row
 *  and column are an audit finding the chart must be able to show. */
export const DIAGONAL: string[] = [...PHYSICAL.map((p) => p.id), ...W4_EXTERNALS.map((x) => x.id)]
export const isExternal = (id: string) => id.startsWith('EXT-')
const external = (id: string) => W4_EXTERNALS.find((x) => x.id === id)
export const elementName = (id: string) => (isExternal(id) ? external(id)?.name ?? id : physical(id).name)
/** Short labels for crowded figures (an element's own short name; Week 1's `short` for externals). */
export const SHORT: Record<string, string> = {
  'PHY-001': 'Aircraft', 'PHY-002': 'Vertiports', 'PHY-003': 'Chargers', 'PHY-004': 'Ops center', 'PHY-005': 'Maintenance', 'PHY-006': 'Comms network', 'PHY-007': 'Booking', 'PHY-008': 'Fire alarm',
  ...Object.fromEntries(EXTERNAL_SYSTEMS.map((x) => [x.id, x.short])),
  'EXT-007': 'Weather service',
}

/** The owner of an element: the Week 4 owner of a physical element; the Week 1 owning stakeholder of an external system. */
export function ownerOf(id: string): string {
  if (!isExternal(id)) return physical(id).owner
  const owner = EXTERNAL_SYSTEMS.find((x) => x.id === id)?.owner
  if (owner) return STAKEHOLDERS.find((s) => s.id === owner)!.name
  if (id === 'EXT-007') return 'Weather information provider'
  return 'no owner (a natural system or an open network)'
}
/** Elements that accept input from the public (course convention for the trust-boundary rule; PHY-007 is the public
 *  booking channel, the exposure in R-009’s condition). */
export const PUBLIC_FACING = ['PHY-007'] as const

// ================================================================================================ component breakdown
export type CaseComponent = { id: string; name: string; parent: string; kind: ComponentKind; responsibility: string; functions: string[]; provenance: CaseProvenance }
/** Level-2 components (proposed, instructor to confirm). Each component's functions are a subset of its parent's Week 4
 *  allocation (tested), so the breakdown refines the allocation and never contradicts it. PHY-006 (the medium) and
 *  PHY-007 and PHY-008 (single-purpose elements) are not broken down: a one-child breakdown would only rename them. */
export const COMPONENTS: CaseComponent[] = [
  { id: 'CMP-001', name: 'Airframe and rotors', parent: 'PHY-001', kind: 'hardware', responsibility: 'Turns battery energy into lift and thrust within the noise limit.', functions: ['FN-005'], provenance: 'proposed' },
  { id: 'CMP-002', name: 'Battery pack and battery management', parent: 'PHY-001', kind: 'hardware', responsibility: 'Stores energy and controls each charge through the charging handshake.', functions: ['FN-005'], provenance: 'proposed' },
  { id: 'CMP-003', name: 'Flight management and health monitoring', parent: 'PHY-001', kind: 'software', responsibility: 'Flies the accepted plan and reports flight data, health and faults.', functions: ['FN-005'], provenance: 'proposed' },
  { id: 'CMP-004', name: 'Pads', parent: 'PHY-002', kind: 'facility', responsibility: 'Take-off and landing surfaces with tie-down points and markings.', functions: ['FN-014'], provenance: 'proposed' },
  { id: 'CMP-005', name: 'Terminal and step-free route', parent: 'PHY-002', kind: 'facility', responsibility: 'Moves passengers, wheelchair users included, between terminal and cabin.', functions: ['FN-014'], provenance: 'proposed' },
  { id: 'CMP-006', name: 'Vertiport staff', parent: 'PHY-002', kind: 'people', responsibility: 'Board each party and handle aircraft on the pads.', functions: ['FN-014'], provenance: 'proposed' },
  { id: 'CMP-007', name: 'High-power turnaround chargers', parent: 'PHY-003', kind: 'hardware', responsibility: 'Charge aircraft to the dispatch threshold within the turnaround at hubs.', functions: ['FN-006'], provenance: 'proposed' },
  { id: 'CMP-008', name: 'Standard chargers', parent: 'PHY-003', kind: 'hardware', responsibility: 'Charge aircraft at the spoke vertiports where turnaround is not time-critical.', functions: ['FN-006'], provenance: 'proposed' },
  { id: 'CMP-009', name: 'Vertiport power controller', parent: 'PHY-003', kind: 'software', responsibility: 'Shares the vertiport connection limit among the active charging sessions.', functions: ['FN-007'], provenance: 'proposed' },
  { id: 'CMP-010', name: 'Scheduling and dispatch platform', parent: 'PHY-004', kind: 'software', responsibility: 'Matches requests, plans flights, coordinates intent and releases each flight.', functions: ['FN-002', 'FN-003', 'FN-011', 'FN-012', 'FN-017'], provenance: 'proposed' },
  { id: 'CMP-011', name: 'Hot-standby platform', parent: 'PHY-004', kind: 'software', responsibility: 'Takes over scheduling and dispatch within the assignment window if the platform fails.', functions: ['FN-002', 'FN-011'], provenance: 'proposed' },
  { id: 'CMP-012', name: 'Duty managers and remote operators', parent: 'PHY-004', kind: 'people', responsibility: 'Declare and lift weather holds and supervise every flight.', functions: ['FN-004', 'FN-017'], provenance: 'proposed' },
  { id: 'CMP-013', name: 'Planning and evidence services', parent: 'PHY-004', kind: 'software', responsibility: 'Forecast demand, plan fleet availability and keep the auditable evidence log.', functions: ['FN-009', 'FN-013', 'FN-016'], provenance: 'proposed' },
  { id: 'CMP-014', name: 'Certifying technicians', parent: 'PHY-005', kind: 'people', responsibility: 'Classify every fault and sign each return to service.', functions: ['FN-008'], provenance: 'proposed' },
  { id: 'CMP-015', name: 'Diagnostic tools and battery workshop', parent: 'PHY-005', kind: 'mixed', responsibility: 'Read fault reports, test packs and host the predictive-maintenance model.', functions: ['FN-008'], provenance: 'proposed' },
]
export const componentsOf = (phy: string) => COMPONENTS.filter((c) => c.parent === phy)
/** Functions the Week 4 allocation places on a physical element. */
export const functionsAt = (phy: string) => FUNCTIONS.filter((f) => f.phy === phy).map((f) => f.id)

// ================================================================================================ interfaces
export type Flow = { item: string; from: string; to: string; info?: string }
export type InterfaceDef = {
  id: string
  name: string
  kind: InterfaceKind
  ends: [string, string]
  /** Information interfaces: the Week 4 items it carries (checked against the routes). */
  items: string[]
  /** Physical interfaces: what crosses and which way. Information interfaces: computed (carriesOf), not stored. */
  flows: Flow[]
  /** Organizational interfaces: the agreement it records (Week 4 AGREEMENTS id) and what the agreement covers. */
  agreement?: string
  medium: string
  constraint: string
  requirements: string[]
  verification: string[]
  /** Planned verification where the reference holds no case (a proposal, not a case). */
  verificationPlan?: string
  standard?: string
  protection: string[]
  /** Why no protection is needed, when the interface carries no data or crosses no trust boundary. */
  noProtectionReason?: string
  degraded: string
  risks: string[]
  provenance: CaseProvenance
}

const W4 = (id: string) => {
  const x = W4_INTERFACES.find((y) => y.id === id)
  if (!x) throw new Error(`unknown Week 4 interface ${id}`)
  return x
}
const ground = 'ground network (PHY-006)'
const datalink = 'air-ground radio datalink (PHY-006)'

/** The interface definitions. IF-001..014 keep the Week 4 ends and type (read from Week 4, never retyped); the attributes
 *  are this week's (proposed). IF-015 and IF-016 are new (proposed). */
export const INTERFACES: InterfaceDef[] = [
  {
    id: 'IF-001', name: 'Aircraft to pad', kind: W4('IF-001').type, ends: W4('IF-001').ends, items: [],
    flows: [{ item: 'landing loads and tie-down forces', from: 'PHY-001', to: 'PHY-002' }, { item: 'boarding passengers', from: 'PHY-002', to: 'PHY-001' }, { item: 'alighting passengers', from: 'PHY-001', to: 'PHY-002' }],
    medium: 'pad surface, tie-down points and markings', constraint: 'none recorded yet: the pad load rating is a design value for the vertiport operators', requirements: ['REQ-STK-007'], verification: [], verificationPlan: 'inspection of each pad and the step-free route at commissioning (with VER-011 for the step-free route)',
    protection: [], noProtectionReason: 'no data crosses; physical access to the pad is the vertiport operator’s site security',
    degraded: 'A pad out of service is removed from scheduling; arriving aircraft divert to another pad or vertiport.', risks: [], provenance: 'proposed',
  },
  {
    id: 'IF-002', name: 'Aircraft to operations center datalink', kind: W4('IF-002').type, ends: W4('IF-002').ends, items: ['INFO-002', 'INFO-006', 'INFO-008'], flows: [],
    medium: datalink, constraint: 'the release and plan reach the aircraft before each departure; flight data flow continuously in flight', requirements: ['REQ-SYS-003', 'REQ-STK-006'], verification: [], verificationPlan: 'demonstration of release, flight following and loss of link in the integration rig',
    protection: ['authenticate the sender of every release and plan', 'integrity-check every release (a forged release is a flight hazard)'],
    degraded: 'Link lost in flight: the aircraft flies its accepted plan and lands with the reserve; the center marks flight following lost and sends no new release until the link returns.', risks: ['R-009'], provenance: 'proposed',
  },
  {
    id: 'IF-003', name: 'Operations center to air traffic service', kind: W4('IF-003').type, ends: W4('IF-003').ends, items: ['INFO-009'], flows: [],
    medium: 'the air traffic service’s flight-intent data service', constraint: 'each intent filed at least 10 min before the planned departure, and the acceptance received before release', requirements: ['REQ-STK-009', 'REQ-SYS-013'], verification: [], verificationPlan: 'demonstration with the air traffic service before service starts',
    standard: 'the air traffic service’s published message format',
    protection: ['authenticate both ends', 'integrity-check every intent and acceptance (the flight-intent data of R-009)'],
    degraded: 'No accepted intent, no release: flights wait, and the duty manager coordinates urgent departures by voice under a manual procedure.', risks: ['R-009'], provenance: 'proposed',
  },
  {
    id: 'IF-004', name: 'Operations to maintenance work-order handover', kind: W4('IF-004').type, ends: W4('IF-004').ends, items: [], flows: [], agreement: 'AG-2',
    medium: 'the agreed work-order procedure (a document)', constraint: 'an aircraft withdrawn by maintenance is returned only on a signed release to service', requirements: ['REQ-STK-006'], verification: [], verificationPlan: 'inspection of the procedure and a sampled audit of handovers',
    protection: [], noProtectionReason: 'an agreement between two departments of one owner carries no data; the status itself travels on IF-012',
    degraded: 'A missed or disputed handover is escalated to the duty manager; the aircraft stays no-go until a signed release exists.', risks: [], provenance: 'proposed',
  },
  {
    id: 'IF-005', name: 'Aircraft to charger power and handshake', kind: W4('IF-005').type, ends: W4('IF-005').ends, items: [],
    flows: [{ item: 'DC charging power', from: 'PHY-003', to: 'PHY-001' }, { item: 'battery-management handshake (state of charge, cell limits)', from: 'PHY-001', to: 'PHY-003' }, { item: 'charger readiness and session control', from: 'PHY-003', to: 'PHY-001' }],
    medium: 'charging connector and cable', constraint: 'charge from the 20 % reserve to the dispatch threshold within 20 min', requirements: ['REQ-SYS-001'], verification: ['VER-001'],
    standard: 'a published charging-connector standard (to be selected; it is what lets a future charger plug in)',
    protection: ['the charger accepts only signed configurations (R-010)', 'a local cell-temperature interlock stops charging without any network command'],
    degraded: 'Handshake lost: charging stops (fail safe); the aircraft moves to another charger and the turnaround grows.', risks: ['R-008', 'R-010'], provenance: 'proposed',
  },
  {
    id: 'IF-006', name: 'Charger to electric grid', kind: W4('IF-006').type, ends: W4('IF-006').ends, items: [],
    flows: [{ item: 'electrical power within the agreed connection limit', from: 'EXT-002', to: 'PHY-003' }],
    medium: 'the grid connection at each vertiport (agreement AG-3)', constraint: 'combined charging power within the connection limit (TBD-02 kW)', requirements: ['REQ-STK-010', 'REQ-SYS-010'], verification: ['VER-010'],
    protection: [], noProtectionReason: 'power only, no data; the limit is enforced inside the charging system (REQ-SYS-010), not trusted to the grid',
    degraded: 'Supply lost: charging stops at that vertiport; the regional-outage contingency applies (finish trips, public-transport fallback, staggered recharge).', risks: ['R-005', 'R-011'], provenance: 'proposed',
  },
  {
    id: 'IF-007', name: 'Fire alarm to emergency response service', kind: W4('IF-007').type, ends: W4('IF-007').ends, items: ['INFO-010'], flows: [],
    medium: 'alarm transmission to the emergency services dispatch center over two independent paths (proposed)', constraint: 'alarm received at the dispatch center within 30 s of detection', requirements: ['REQ-SYS-009'], verification: ['VER-009'],
    standard: 'the emergency services’ alarm-receiving format',
    protection: ['authenticate the alarm source so that false alarms cannot be injected', 'two diverse paths, so one failure or attack does not silence the alarm'],
    degraded: 'One path lost: the other carries the alarm. Both lost: the local alarm sounds and vertiport staff call the emergency number.', risks: ['R-008'], provenance: 'proposed',
  },
  {
    id: 'IF-008', name: 'Booking platform to operations center', kind: W4('IF-008').type, ends: W4('IF-008').ends, items: ['INFO-001', 'INFO-005', 'INFO-007'], flows: [],
    medium: ground, constraint: 'confirmed requests reach scheduling so that an aircraft is assigned within 60 s; disruption decisions reach the booking platform within the notice time (TBD-05)', requirements: ['REQ-SYS-005', 'REQ-STK-018'], verification: ['VER-005'],
    protection: ['domain separation: the booking front end has no direct path to the dispatch segment (DEC-002 condition, R-009)', 'authenticate and integrity-check every assignment message', 'encrypt the personal data of passengers in transit'],
    degraded: 'Booking platform down: no new bookings, confirmed trips still fly. Operations center down: failover to the hot standby, then manual dispatch.', risks: ['R-009', 'R-007'], provenance: 'proposed',
  },
  {
    id: 'IF-009', name: 'Vertiport operator to AeroLink pad-slot agreement', kind: W4('IF-009').type, ends: W4('IF-009').ends, items: [], flows: [], agreement: 'AG-1',
    medium: 'the pad-slot and ground-handling agreement (a contract)', constraint: 'none recorded yet: slot counts per hour are set in the agreement', requirements: [], verification: [],
    protection: [], noProtectionReason: 'an agreement carries no data; the operational data between the same owners travel on IF-014, which is protected',
    degraded: 'A lapsed or breached agreement goes to the interface control working group; pads fall back to the last agreed slot schedule.', risks: [], provenance: 'proposed',
  },
  {
    id: 'IF-010', name: 'Charger to operations center data', kind: W4('IF-010').type, ends: W4('IF-010').ends, items: ['INFO-003'], flows: [],
    medium: ground, constraint: 'charge-complete status reaches dispatch before the release of each charged aircraft', requirements: ['REQ-SYS-001'], verification: [], verificationPlan: 'test in the integration rig: injected charge-complete messages, including altered ones',
    protection: ['authenticate every charger', 'integrity-check charge-complete status (a false “complete” would release an aircraft that is not charged)'],
    degraded: 'Status missing: dispatch treats the aircraft as not charged (fail safe) until the vertiport operator confirms on the pad.', risks: ['R-010'], provenance: 'proposed',
  },
  {
    id: 'IF-011', name: 'Weather information service to operations center', kind: W4('IF-011').type, ends: W4('IF-011').ends, items: ['INFO-004'], flows: [],
    medium: 'the provider’s data feed over the public internet', constraint: 'a forecast for every vertiport at least every 10 min, each covering at least the next 60 min', requirements: ['REQ-SYS-004', 'REQ-SYS-014'], verification: [], verificationPlan: 'test with a recorded feed, including late and malformed forecasts',
    standard: 'the provider’s published forecast format',
    protection: ['authenticate the provider', 'reject malformed or out-of-date forecasts (boundary enforcement)'],
    degraded: 'The newest valid forecast no longer covers the next 30 min (it is more than 30 min old): dispatch holds the affected vertiports (fail safe) until a valid forecast arrives.', risks: ['R-004'], provenance: 'proposed',
  },
  {
    id: 'IF-012', name: 'Maintenance to operations center data', kind: W4('IF-012').type, ends: W4('IF-012').ends, items: ['INFO-003', 'INFO-006'], flows: [],
    medium: ground, constraint: 'go / no-go status at dispatch within its share of the 2 min budget (see the latency budget)', requirements: ['REQ-SYS-008'], verification: ['VER-008'],
    protection: ['least privilege: only the maintenance facility may write go / no-go status', 'integrity-check every status message'],
    degraded: 'Status missing or stale: dispatch treats the aircraft as no-go (fail safe) until maintenance confirms.', risks: [], provenance: 'proposed',
  },
  {
    id: 'IF-013', name: 'Aircraft to maintenance health data link', kind: W4('IF-013').type, ends: W4('IF-013').ends, items: ['INFO-002'], flows: [],
    medium: datalink, constraint: 'fault reports reach maintenance within their share of the 2 min budget', requirements: ['REQ-SYS-008'], verification: [], verificationPlan: 'test on the aircraft: fault reports reach maintenance within 30 s (VER-008 injects reports at the bench, so it does not cover this hop)',
    protection: ['authenticate the aircraft as the sender of every health and fault report (anyone with a transmitter can reach the radio link)', 'integrity-check every health and fault report'],
    degraded: 'Link lost: fault reports are downloaded on arrival, so the 2 min of REQ-SYS-008 cannot hold during the loss; the aircraft is not released again until a fresh report is classified (fail safe).', risks: [], provenance: 'proposed',
  },
  {
    id: 'IF-014', name: 'Vertiport to operations center data', kind: W4('IF-014').type, ends: W4('IF-014').ends, items: ['INFO-001'], flows: [],
    medium: ground, constraint: 'none recorded yet: boarding timestamps feed the monthly wait measure', requirements: [], verification: [], verificationPlan: 'analysis of a month’s timestamps against bookings',
    protection: ['authenticate the vertiport systems', 'encrypt passenger data in transit'],
    degraded: 'Timestamps missing: the wait measure has gaps for that period; dispatch is unaffected.', risks: [], provenance: 'proposed',
  },
  // ---- added this week (proposed, instructor to confirm)
  {
    id: 'IF-015', name: 'Fire detection to operations center incident records', kind: 'information', ends: ['PHY-008', 'PHY-004'], items: ['INFO-006'], flows: [],
    medium: ground, constraint: 'each pad incident record in the evidence log within 1 h of the incident', requirements: ['REQ-STK-016', 'REQ-SYS-015'], verification: [], verificationPlan: 'test: injected pad incidents appear in the evidence log within 1 h',
    protection: ['one way only: the evidence log can never command the alarm system (domain separation)', 'tamper-evident records: integrity-checked and kept unaltered for the insurers’ audit'],
    degraded: 'Link down: the alarm system stores its records and forwards them when the link returns; the alarm path IF-007 is unaffected.', risks: ['R-008'], provenance: 'proposed',
  },
  {
    id: 'IF-016', name: 'Maintenance to aircraft and spares supply', kind: 'organizational', ends: ['PHY-005', 'EXT-004'], items: [], flows: [], agreement: 'AG-4',
    medium: 'the aircraft purchase agreement’s spares terms (a contract)', constraint: 'none recorded yet: spares lead time is set in the agreement', requirements: [], verification: [],
    protection: [], noProtectionReason: 'an agreement carries no data; if parts orders are ever exchanged electronically, that exchange is a new information interface to define',
    degraded: 'Late parts: the aircraft stays out of service and fleet availability falls; held spares cover the gap.', risks: [], provenance: 'proposed',
  },
]
export const iface = (id: string) => {
  const x = INTERFACES.find((y) => y.id === id)
  if (!x) throw new Error(`unknown interface ${id}`)
  return x
}
export const RECEIVED_IDS = W4_INTERFACES.map((x) => x.id)
export const ADDED_IDS = INTERFACES.filter((x) => !RECEIVED_IDS.includes(x.id)).map((x) => x.id)
export const isExternalInterface = (x: InterfaceDef) => x.ends.some(isExternal)

/** The Week 4 routes with this week's resolution applied: the pad incident records of INFO-006, which had no route, now
 *  travel on IF-015. Every other route is Week 4's, unchanged. */
export const ROUTES = INFORMATION.flatMap((x) =>
  x.routes.map((r) => ({ info: x.id, from: r.from, to: r.to, via: x.id === 'INFO-006' && r.from === 'PHY-008' && !r.via.length ? ['IF-015'] : r.via })),
)
/** What an information interface carries and in which direction, computed hop by hop from the routes (a relay contributes
 *  one hop to each interface it uses). */
export function carriesOf(id: string): Flow[] {
  const out: Flow[] = []
  for (const r of ROUTES) {
    let at = r.from
    for (const v of r.via) {
      const x = INTERFACES.find((y) => y.id === v)
      if (!x) break
      const next = x.ends[0] === at ? x.ends[1] : x.ends[1] === at ? x.ends[0] : null
      if (!next) break
      if (v === id && !out.some((f) => f.info === r.info && f.from === at && f.to === next)) out.push({ item: info(r.info).name, info: r.info, from: at, to: next })
      at = next
    }
  }
  return out
}
/** Every flow across an interface: computed for information interfaces, stated for physical ones, none for organizational. */
export const flowsOf = (x: InterfaceDef): Flow[] => (x.kind === 'information' ? carriesOf(x.id) : x.flows)
/** Direction as the table prints it: each distinct (from → to) pair, with the items. */
export function directionOf(x: InterfaceDef): string {
  if (x.kind === 'organizational') return 'none: an agreement carries no flow'
  const pairs = new Map<string, string[]>()
  for (const f of flowsOf(x)) {
    const k = `${f.from} → ${f.to}`
    pairs.set(k, [...(pairs.get(k) ?? []), f.info ?? f.item])
  }
  return [...pairs.entries()].map(([k, v]) => `${k} (${[...new Set(v)].join(', ')})`).join('; ')
}
export const isTwoWay = (x: InterfaceDef) => new Set(flowsOf(x).map((f) => f.from)).size > 1

// ================================================================================================ trust boundaries
/** Course convention (Session 2): an interface crosses a trust boundary when (1) one end is external, (2) its ends have
 *  different owners, (3) one end accepts input from the public, (4) its medium is a public network nobody in the
 *  enterprise controls, or (5) its medium is radio or another medium outsiders can reach (MITRE R54 p.331: "radios connect
 *  subsystems via airwaves", a hidden external interface whoever owns the radios). A wired medium the enterprise may lease
 *  (the ground network of PHY-006, whose ownership Week 4 left open) makes a POSSIBLE crossing, a hidden external interface
 *  if any segment is leased (R55 p.369): listed apart in LEASE_DEPENDENT, not counted here. Each reason is computed; the
 *  test checks it against the data (both directions). */
export type BoundaryReason = 'external end' | 'different owners' | 'public-facing end' | 'public network' | 'radio medium'
/** A medium outsiders can reach without touching the enterprise's equipment: radio in any form (R54 p.331). */
export const RADIO_MEDIUM = /\bradio\b|datalink|satellite|wi-?fi|wireless|cellular|\b[345]g\b|\blte\b/i
export function boundaryReasons(x: InterfaceDef): BoundaryReason[] {
  const out: BoundaryReason[] = []
  if (x.ends.some(isExternal)) out.push('external end')
  if (ownerOf(x.ends[0]) !== ownerOf(x.ends[1])) out.push('different owners')
  if (x.ends.some((e) => (PUBLIC_FACING as readonly string[]).includes(e))) out.push('public-facing end')
  if (/public internet/i.test(x.medium)) out.push('public network')
  if (RADIO_MEDIUM.test(x.medium)) out.push('radio medium')
  return out
}
export const crossesBoundary = (x: InterfaceDef) => boundaryReasons(x).length > 0
/** Interfaces that carry an information item whose sensitivity is safety-related (Week 4 field). */
export const carriesSafetyData = (x: InterfaceDef) => x.kind === 'information' && x.items.some((i) => /safety/i.test(info(i).sensitivity))
export const carriesPersonalData = (x: InterfaceDef) => x.kind === 'information' && x.items.some((i) => /personal/i.test(info(i).sensitivity))

/** The open ownership question of the communications network (Week 4 left PHY-006 ownership open): if any segment is
 *  leased, every interface whose medium is PHY-006 has a hidden external part. */
export const HIDDEN_EXTERNAL = INTERFACES.filter((x) => x.medium.includes('PHY-006')).map((x) => x.id)
/** Interfaces over radio: hidden external interfaces whoever owns the radios (R54 p.331), so they cross a trust boundary
 *  whatever the leasing decision. */
export const RADIO_INTERFACES = INTERFACES.filter((x) => RADIO_MEDIUM.test(x.medium)).map((x) => x.id)
/** Interfaces over the communications network whose hidden external part depends only on the leasing decision. */
export const LEASE_DEPENDENT = HIDDEN_EXTERNAL.filter((id) => !RADIO_INTERFACES.includes(id))

// ================================================================================================ the N² chart
/** The interface N² (symmetric): cell (a, b) lists the interfaces whose two ends are a and b, written once above the
 *  diagonal in DIAGONAL order. Computed from the definitions, never typed. */
export function n2Cell(a: string, b: string, set: InterfaceDef[] = INTERFACES): string[] {
  return set.filter((x) => (x.ends[0] === a && x.ends[1] === b) || (x.ends[0] === b && x.ends[1] === a)).map((x) => x.id)
}
export const n2Upper = (set: InterfaceDef[] = INTERFACES) =>
  DIAGONAL.flatMap((a, i) => DIAGONAL.slice(i + 1).map((b) => ({ a, b, ids: n2Cell(a, b, set) }))).filter((c) => c.ids.length)
/** The directed information N² (course convention: the row element produces, the column element consumes): cell (from,
 *  to) lists the information items flowing that way, from the computed carries. */
export function directedCell(from: string, to: string): string[] {
  return [...new Set(INTERFACES.filter((x) => x.kind === 'information').flatMap((x) => carriesOf(x.id)).filter((f) => f.from === from && f.to === to).map((f) => f.info!))]
}
export const degreeOf = (id: string, set: InterfaceDef[] = INTERFACES) => set.filter((x) => x.ends.includes(id)).length
export const RECEIVED = INTERFACES.filter((x) => RECEIVED_IDS.includes(x.id))
/** Counts used in the notes and on the slides, computed so no note types a number. */
export const countsOf = (set: InterfaceDef[]) => ({
  total: set.length,
  physical: set.filter((x) => x.kind === 'physical').length,
  information: set.filter((x) => x.kind === 'information').length,
  organizational: set.filter((x) => x.kind === 'organizational').length,
  external: set.filter(isExternalInterface).map((x) => x.id),
  degrees: Object.fromEntries(DIAGONAL.map((d) => [d, degreeOf(d, set)])) as Record<string, number>,
  degreeSum: DIAGONAL.reduce((a, d) => a + degreeOf(d, set), 0),
  pairs: n2Upper(set).length,
  possiblePairs: (DIAGONAL.length * (DIAGONAL.length - 1)) / 2,
  hub: [...DIAGONAL].sort((a, b) => degreeOf(b, set) - degreeOf(a, set))[0],
  isolated: DIAGONAL.filter((d) => !degreeOf(d, set)),
})

// ================================================================================================ crossing flows
/** Every function information flow that crosses from one physical element to another (Week 4's flow check), with the
 *  interface that now carries it. Status 'covered' needs the flow's item to ride an information interface joining the two
 *  elements, directly or by its recorded relay. */
export function crossingFlows(set: InterfaceDef[] = INTERFACES, routes: typeof ROUTES = ROUTES) {
  const flows: { fn: string; item: string; from: string; to: string; info?: string; via: string[]; covered: boolean }[] = []
  const covered = (r: { from: string; via: string[] } | undefined, to: string) => {
    if (!r || !r.via.length) return false
    let at = r.from
    for (const v of r.via) {
      const x = set.find((y) => y.id === v)
      if (!x || x.kind !== 'information') return false
      const next = x.ends[0] === at ? x.ends[1] : x.ends[1] === at ? x.ends[0] : null
      if (!next) return false
      at = next
    }
    return at === to
  }
  for (const f of FUNCTIONS) {
    const add = (item: string, from: string, to: string, infoId?: string) => {
      const r = routes.find((y) => y.info === infoId && y.from === from && y.to === to)
      flows.push({ fn: f.id, item, from, to, info: infoId, via: r?.via ?? [], covered: covered(r, to) })
    }
    for (const x of f.inputs) {
      if (x.kind !== 'information' || !x.src) continue
      const from = x.src.startsWith('FN-') ? fn(x.src).phy : x.src.startsWith('AI-') || x.src.startsWith('EXT-') ? placeOf(x.src) : null
      if (from && from !== f.phy) add(x.item, from, f.phy, x.info)
    }
    for (const x of f.outputs) if (x.kind === 'information' && x.dst && x.dst !== f.phy) add(x.item, f.phy, x.dst, x.info)
  }
  return flows
}

// ================================================================================================ the driving question
/** Session 1 opens on the Week 4 gap: pad incident records (INFO-006, for the auditable record of REQ-STK-016) had no route
 *  from the fire detection system to the evidence log. Data, decision and decider kept apart: the data are the incident
 *  records produced at PHY-008; the decision they support (which incident causes to correct first, and the insurers'
 *  report) is made at the operations center; the decider is the operations center's management, using the evidence log
 *  (FN-016). The interface decision below is the architect's, recorded with alternatives. */
export const DRIVING_QUESTION = (() => {
  const w4 = W4_FINDINGS.find((f) => f.id === 'F3')!
  const item = info('INFO-006')
  const before = item.routes.find((r) => r.from === 'PHY-008')!
  return {
    finding: w4.id,
    findingText: w4.finding,
    info: item.id,
    data: 'pad incident records: detector events, alarm times and the pad identifier',
    producedAt: 'PHY-008',
    decision: item.decision,
    decidedAt: 'PHY-004',
    decider: 'the operations center’s management, reading the evidence log kept by FN-016',
    serves: 'REQ-STK-016',
    routeBefore: before.via,
    degreeBefore: degreeOf('PHY-008', RECEIVED),
  }
})()
/** The interface decision for the INFO-006 gap (proposed; the decider is the instructor in the reference, the team's
 *  architect in a team record). */
export const INTERFACE_DECISION = {
  id: 'DEC-003',
  question: 'How do the pad incident records reach the evidence log at the operations center?',
  alternatives: [
    'A new information interface from the fire detection system to the operations center over the ground network',
    'A relay through the vertiport systems: a new interface from the fire detection system to the vertiport systems, then on over IF-014',
    'Staff re-enter each incident from the alarm panel into the evidence log',
  ],
  chosen: 'A new information interface from the fire detection system to the operations center over the ground network',
  rationale: 'Both interface options add one new interface, so the count does not decide. The direct path is one hop with one owner pair: the record reaches the log without depending on a second system, and it can be made one way so that the evidence log never commands the alarm system. The relay puts the vertiport systems, and their owner’s availability, in the path, adds INFO-006 to the items of IF-014, and needs the vertiport systems to store and forward records. Re-entry is a manual procedure that loses records and cannot meet the audit of every flight.',
  /** New interfaces each alternative adds (both interface options add one), and the hops on the record’s path. */
  counts: { direct: 1, relay: 1, manual: 0 },
  path: { direct: 1, relay: 2, manual: 0 },
  wouldChangeIf: 'the vertiport operators already run a site system that collects all pad events for their own audit: then the relay reuses an interface they must keep anyway',
  provenance: 'proposed' as CaseProvenance,
}

// ================================================================================================ interface requirements
export type CaseInterfaceRequirement = {
  id: string; level: 'system'; name: string; statement: string; type: 'interface' | 'performance'; method: 'demonstration' | 'test'; criterion: string; rationale: string; parents: string[]; interface: string
  /** The three steps of R13 p.563 as worked for this requirement. */
  steps: { boundary: string; interaction: string }
  provenance: CaseProvenance
}
/** Interface requirements written by the three steps (proposed, instructor to confirm). Each passes the Week 2 requirement
 *  gates (tested), names its interface and traces to an existing parent. */
export const INTERFACE_REQUIREMENTS: CaseInterfaceRequirement[] = [
  {
    id: 'REQ-SYS-013', level: 'system', name: 'Flight intent filed before departure', interface: 'IF-003',
    statement: 'The operations system shall send each flight intent to the air navigation service provider over IF-003 at least 10 min before the planned departure.',
    type: 'interface', method: 'demonstration', criterion: 'Intent received by the air navigation service provider at least 10 min before departure for 100 % of demonstrated departures',
    rationale: 'Refines REQ-STK-009 into the interface exchange: the 10 min lead lets the provider accept or amend the intent before the aircraft is released. The value is a proposed planning figure to agree with the provider.',
    parents: ['REQ-STK-009'], steps: { boundary: 'operations center (PHY-004) and the air traffic service (EXT-001), across IF-003', interaction: 'the intended route and departure time out; acceptance or amendment back; over the provider’s data service' }, provenance: 'proposed',
  },
  {
    id: 'REQ-SYS-014', level: 'system', name: 'Weather forecast refresh', interface: 'IF-011',
    statement: 'The operations system shall receive a forecast covering at least the next 60 min for every vertiport from the weather information service over IF-011 at least every 10 min.',
    type: 'performance', method: 'test', criterion: 'Interval between received forecasts at most 10 min, and every forecast covering at least 60 min ahead, at every vertiport over a replayed 16 h operating day',
    rationale: 'The dispatch hold of REQ-SYS-004 looks 30 min ahead, so the newest forecast must always cover the next 30 min. A forecast covering 60 min and refreshed every 10 min still covers 60 − 10 = 50 min ahead just before the next one arrives; it stops covering the 30 min look-ahead only when it is 30 min old, so two consecutive lost refreshes are tolerated before the hold. The horizon and the interval are proposed for agreement with the provider.',
    parents: ['REQ-STK-003'], steps: { boundary: 'weather information service (EXT-007) and the operations center (PHY-004), across IF-011', interaction: 'observed and forecast wind, gust and visibility per vertiport, one way, over the provider’s feed' }, provenance: 'proposed',
  },
  {
    id: 'REQ-SYS-015', level: 'system', name: 'Pad incident records to the evidence log', interface: 'IF-015',
    statement: 'The pad fire detection system shall send each pad incident record to the operations center evidence log over IF-015 within 1 h of the incident.',
    type: 'performance', method: 'test', criterion: 'Every injected pad incident present in the evidence log within 1 h, in a test of at least 20 incidents',
    rationale: 'Refines REQ-STK-016, whose auditable record of every flight had no path for pad incidents (the Week 4 finding). One hour keeps the log complete for the next shift’s review; the value is proposed.',
    parents: ['REQ-STK-016'], steps: { boundary: 'pad fire detection (PHY-008) and the operations center (PHY-004), across the new IF-015', interaction: 'incident records (detector events, alarm time, pad), one way, over the ground network' }, provenance: 'proposed',
  },
]
/** Existing requirements that are already interface requirements (Week 2), named on the interface they govern. */
export const EXISTING_INTERFACE_REQUIREMENTS = ['REQ-STK-009', 'REQ-SYS-009'] as const
export const requirementText = (id: string) => INTERFACE_REQUIREMENTS.find((q) => q.id === id)?.statement ?? requirement(id).statement

// ================================================================================================ latency budget
/** Week 4 left REQ-SYS-008 open: "an interface says nothing about latency: the 2 min needs a latency budget across both
 *  hops, owned by Week 5". The budget (proposed values) allocates the 2 min along the path; the margin is computed. */
export const LATENCY_BUDGET = (() => {
  const limitS = 120
  const legs = [
    { leg: 'fault report from the aircraft to maintenance', where: 'IF-013', seconds: 30 },
    { leg: 'hold pending classification: a reported fault code on the no-go list marks the aircraft unavailable at once (a hold, not a classification)', where: 'FN-008 at PHY-005', seconds: 30 },
    { leg: 'unavailable status from maintenance to dispatch', where: 'IF-012', seconds: 30 },
  ]
  const used = legs.reduce((a, l) => a + l.seconds, 0)
  return {
    requirement: 'REQ-SYS-008', limitS, legs, used, margin: limitS - used,
    /** Why the middle leg is a hold, and how it keeps Week 4’s rule that only certifying technicians classify a fault. */
    holdNote: 'A technician cannot classify a fault within a 30 s leg, so the budget proposes a hold: the aircraft is marked unavailable as soon as a fault code on the no-go list is reported, the fail-safe value. The hold classifies nothing; the certifying technician still classifies every fault and alone returns the aircraft to go.',
    /** The exception the IF-013 degraded mode creates. */
    linkLossNote: 'While the radio link is lost in flight the 2 min cannot hold: fault reports are downloaded on arrival, and the aircraft is not released until a fresh report is classified.',
  }
})()

// ================================================================================================ change control
/** One interface change traced through the N² (Session 2): a higher-power charger for the Week 6 roadmap changes IF-005.
 *  The impact set is COMPUTED: every interface that shares an end with the changed one (its ends' rows and columns),
 *  then the owners whose agreement the change needs. */
export const CHANGE_REQUEST = (() => {
  const changed = 'IF-005'
  const x = iface(changed)
  const neighbours = INTERFACES.filter((y) => y.id !== changed && y.ends.some((e) => x.ends.includes(e))).map((y) => y.id)
  const owners = [...new Set(x.ends.map(ownerOf))]
  return {
    id: 'ICR-001',
    interface: changed,
    change: 'Raise the charging power of the turnaround chargers so that the dispatch threshold is reached in 15 min instead of 20 min',
    why: 'a candidate technology insertion for the Week 6 roadmap',
    neighbours,
    /** Neighbours the change actually reaches, each with its reason (judged from the definitions; the others are unaffected). */
    reaches: [
      { id: 'IF-006', why: 'more power per charger draws more from the grid connection, against the limit TBD-02 (R-005)' },
      { id: 'IF-010', why: 'charge-session records and the charge-complete timing change' },
      { id: 'REQ-SYS-001', why: 'the 20 min requirement would be tightened, or the margin grows' },
    ],
    owners,
    decider: 'the interface control working group, with the vertiport operators, AeroLink and the electric utility',
    decision: 'Hold until the utility confirms connection capacity at the hubs (R-005); then baseline the new IF-005 version and keep the old version supported until every aircraft is upgraded.',
    provenance: 'proposed' as CaseProvenance,
  }
})()
/** The interface control working group (proposed): the owners of the interfaces that cross organizational lines. */
export const ICWG = (() => {
  const crossing = INTERFACES.filter((x) => ownerOf(x.ends[0]) !== ownerOf(x.ends[1]))
  const members = [...new Set(crossing.flatMap((x) => x.ends.map(ownerOf)))]
  return { members, interfaces: crossing.map((x) => x.id) }
})()

// ================================================================================================ integration
/** Integration aggregates (R22 p.631: group elements so that the interfaces to verify between aggregates are minimized).
 *  Two candidate groupings of the eight physical elements; the counts are computed from the interface set. External
 *  interfaces are verified last, with the external parties, and are counted apart. */
export const GROUPINGS = [
  { id: 'G1', name: 'By owner', aggregates: [['PHY-001', 'PHY-004', 'PHY-005', 'PHY-006', 'PHY-007'], ['PHY-002', 'PHY-003', 'PHY-008']] },
  { id: 'G2', name: 'Aircraft and charging first', aggregates: [['PHY-001', 'PHY-003'], ['PHY-002', 'PHY-004', 'PHY-005', 'PHY-006', 'PHY-007', 'PHY-008']] },
] as const
export function groupingCounts(g: (typeof GROUPINGS)[number]) {
  const where = (e: string) => g.aggregates.findIndex((a) => (a as readonly string[]).includes(e))
  const internal = INTERFACES.filter((x) => !isExternalInterface(x))
  const between = internal.filter((x) => where(x.ends[0]) !== where(x.ends[1])).map((x) => x.id)
  return { inside: internal.length - between.length, between, external: INTERFACES.filter(isExternalInterface).length }
}

// ================================================================================================ coupling (Week 4 DEC-002)
/** Week 4 DEC-002 deferred its quantitative test to this week: "the coupling count of each alternative, done in Week 5
 *  when the interfaces exist". Course metric (instructor-defined, labeled as such; no source defines a numerical
 *  coupling measure): over the function-to-function information flows of the Week 4 functions, E = flows, X = flows whose
 *  two functions sit on different physical elements, κ = X / E, P = element pairs joined by at least one crossing flow,
 *  D_max = the most partners of one element. A: the Week 4 allocation; B: distributed dispatch (FN-002 and FN-011 at the
 *  vertiports), the alternative DEC-002 rejected. */
export const FN_FLOWS = FUNCTIONS.flatMap((f) => f.inputs.filter((x) => x.kind === 'information' && x.src?.startsWith('FN-')).map((x) => ({ from: x.src!, to: f.id, item: x.item })))
export const ALLOCATIONS = {
  A: Object.fromEntries(FUNCTIONS.map((f) => [f.id, f.phy])) as Record<string, string>,
  B: Object.fromEntries(FUNCTIONS.map((f) => [f.id, f.id === 'FN-002' || f.id === 'FN-011' ? 'PHY-002' : f.phy])) as Record<string, string>,
}
export function coupling(alloc: Record<string, string>) {
  const crossing = FN_FLOWS.filter((f) => alloc[f.from] !== alloc[f.to])
  const pairs = [...new Set(crossing.map((f) => [alloc[f.from], alloc[f.to]].sort().join(' ↔ ')))]
  const partners = new Map<string, number>()
  for (const p of pairs) for (const e of p.split(' ↔ ')) partners.set(e, (partners.get(e) ?? 0) + 1)
  const dmax = Math.max(0, ...partners.values())
  return { E: FN_FLOWS.length, X: crossing.length, kappa: crossing.length / FN_FLOWS.length, P: pairs.length, pairs, Dmax: dmax, atMax: [...partners.entries()].filter(([, n]) => n === dmax).map(([e]) => e).sort() }
}
export const COUPLING = { A: coupling(ALLOCATIONS.A), B: coupling(ALLOCATIONS.B), decision: ARCH_DECISION.id }
/** B's crossing pairs with no information interface in the set: B would need its own interface design. */
export const uncoveredPairs = (pairs: string[]) => pairs.filter((p) => { const [a, b] = p.split(' ↔ '); return !n2Cell(a, b).some((id) => iface(id).kind === 'information') })

// ================================================================================================ verification coverage
export const verifiedInterfaces = () => INTERFACES.filter((x) => x.verification.length).map((x) => x.id)
export const unverifiedInterfaces = () => INTERFACES.filter((x) => !x.verification.length).map((x) => x.id)

// ================================================================================================ audit
/** Externals with no interface, and the reason recorded for each (an externals check that can fail: tested). */
export const EXTERNAL_DISPOSITIONS: Record<string, string> = {
  'EXT-003': 'Weather is a natural system: it constrains the operation (the weather limits, TBD-01) but exchanges nothing. Its information reaches the system from the weather information service over IF-011.',
  'EXT-005': 'No exchange yet: passengers move between the networks on their own. The public-transport fallback of A-008 has no written arrangement; when it exists, it becomes an organizational interface.',
}
export const externalsWithoutInterface = () => W4_EXTERNALS.map((x) => x.id).filter((id) => !degreeOf(id))
export const undisposedExternals = () => externalsWithoutInterface().filter((id) => !EXTERNAL_DISPOSITIONS[id])

export const FINDINGS: { id: string; where: string; finding: string; disposition: string; owner: string }[] = [
  { id: 'F1', where: 'INFO-006, Week 4 finding F3', finding: 'Pad incident records had no interface from the fire detection system to the evidence log.', disposition: 'Resolved: IF-015 (DEC-003) and the interface requirement REQ-SYS-015.', owner: 'closed this week' },
  { id: 'F2', where: 'EXT-004', finding: 'The aircraft and spares supply had no interface, although SCN-004 A1 orders parts from it.', disposition: 'Resolved: the organizational IF-016 under the purchase agreement AG-4; an electronic ordering exchange would be a new information interface.', owner: 'closed this week' },
  { id: 'F3', where: 'IF-008', finding: 'Week 4 added two items to IF-008 (fare revenue, INFO-005; service status, INFO-007), and DEC-002 made separation from dispatch a condition.', disposition: 'Resolved: IF-008 carries INFO-001, INFO-005 and INFO-007, and its protection names the domain separation (R-009).', owner: 'closed this week' },
  { id: 'F4', where: 'REQ-SYS-008', finding: 'An interface path existed, but nothing allocated the 2 min across the two hops.', disposition: 'Resolved: the latency budget allocates 90 s and keeps 30 s of margin (proposed values).', owner: 'closed this week' },
  { id: 'F5', where: 'R-010, IF-010', finding: 'The charger risk says chargers are configured remotely, but no information item or interface carries configuration to them.', disposition: 'Open: the configuration path is a hidden interface; the vertiport operators name it and it is defined with signed configurations.', owner: 'vertiport operators, with the ICWG' },
  { id: 'F6', where: 'PHY-006', finding: `The communications network carries ${plural(HIDDEN_EXTERNAL.length, 'interface')}. The ${RADIO_INTERFACES.length} over the air-ground radio datalink (${RADIO_INTERFACES.join(', ')}) have a hidden external part whoever owns the radios, because anyone with a transmitter can reach the medium (R54 p.331): they cross a trust boundary and authenticate every message. Ownership of the ground network is open: if any segment is leased, the other ${plural(LEASE_DEPENDENT.length, 'interface')} have a hidden external part too.`, disposition: 'Partly open: the radio interfaces are protected now; AeroLink decides owned or leased for the ground network, and leased segments get their own external interface and service-level agreement.', owner: 'AeroLink, before Week 6' },
  { id: 'F7', where: 'verification', finding: 'Most interfaces have no verification case; only the ones whose requirement already had one are covered.', disposition: 'Accepted for now: each definition names a planned method; the cases are written in Week 12.', owner: 'Week 12' },
  { id: 'F8', where: 'passengers', finding: 'Passengers are told of disruptions through the booking app: a human–system interface that the interface set does not list.', disposition: 'Accepted: the app’s user interface is part of PHY-007; it is modeled as a use case in Week 10.', owner: 'Week 10' },
]

/** Week 4's hand-overs to Week 5, each with its disposition (none may stay pending: tested). */
export const W4_HANDOVERS: { from: string; item: string; status: 'resolved' | 're-dated'; disposition: string }[] = [
  { from: 'Week 4 finding F3', item: 'pad incident records have no route to the evidence log', status: 'resolved', disposition: 'IF-015, chosen in DEC-003 over a relay and re-entry; REQ-SYS-015.' },
  { from: 'Week 4 finding F2 and INFO-007', item: 'IF-008 must carry fare revenue and the disruption decisions', status: 'resolved', disposition: 'IF-008 carries INFO-001, INFO-005 and INFO-007; the carries are computed from the routes.' },
  { from: 'Week 4 evaluation, REQ-SYS-008', item: 'a latency budget across both hops', status: 'resolved', disposition: 'Budget of 90 s with 30 s margin (proposed).' },
  { from: 'Week 4 evaluation, R-009', item: 'the DEC-002 separation condition written into IF-008', status: 'resolved', disposition: 'IF-008 protection: domain separation, authentication and integrity checks.' },
  { from: 'Week 4 DEC-002', item: 'the coupling count of each alternative', status: 'resolved', disposition: 'Computed with the course metric over the Week 4 function flows (Session 2).' },
  { from: 'Week 4 case, stakeholder requirements allocated directly', item: 'derive system requirements where an interface carries them', status: 'resolved', disposition: 'REQ-SYS-013 (from REQ-STK-009) and REQ-SYS-015 (from REQ-STK-016); the others are not interface requirements and stay with their functions.' },
]

// ================================================================================================ feeds forward
export const FEEDS_FORWARD_W5: { artifact: string; week: string; how: string }[] = [
  { artifact: 'Interface standards and the change request', week: 'Week 6', how: 'technology insertion points: what a new charger, aircraft or platform must plug into' },
  { artifact: 'Components, interfaces and their security attributes', week: 'Week 7', how: 'the components-and-interfaces section of the Systems Thinking Engineering Package' },
  { artifact: 'Components and interfaces', week: 'Week 11', how: 'components become parts; interface ends become ports; interfaces become interface definitions and connections; what crosses becomes flows of items' },
  { artifact: 'Verification column and degraded modes', week: 'Week 12', how: 'verification cases for each interface, and the digital thread from requirement to evidence' },
  { artifact: 'The coupling count', week: 'Week 13', how: 'an analysis the trade study may reuse (instructor option)' },
]
/** The Week 4 artifact that names Week 5, so the continuity can be checked (tested to exist). */
export const W4_FEED = FEEDS_FORWARD.find((f) => f.week === 'Week 5')!

// ================================================================================================ links and counts
export const KNOWN_IDS = new Set<string>([
  ...DIAGONAL, ...COMPONENTS.map((c) => c.id), ...INTERFACES.map((x) => x.id), ...INFORMATION.map((x) => x.id), ...FUNCTIONS.map((f) => f.id), ...RISKS.map((r) => r.id),
  ...AGREEMENTS.map((a) => a.id), ...INTERFACE_REQUIREMENTS.map((q) => q.id), INTERFACE_DECISION.id, CHANGE_REQUEST.id, ARCH_DECISION.id,
])
export const COUNTS = (() => {
  const received = countsOf(RECEIVED)
  const all = countsOf(INTERFACES)
  return {
    level1: PHYSICAL.length,
    level2: COMPONENTS.length,
    brokenDown: PHYSICAL.filter((p) => componentsOf(p.id).length).map((p) => p.id),
    received,
    all,
    added: ADDED_IDS,
    crossing: INTERFACES.filter(crossesBoundary).map((x) => x.id),
    safetyData: INTERFACES.filter(carriesSafetyData).map((x) => x.id),
    personalData: INTERFACES.filter(carriesPersonalData).map((x) => x.id),
    twoWay: INTERFACES.filter((x) => x.kind !== 'organizational' && isTwoWay(x)).map((x) => x.id),
    crossingFlows: crossingFlows().length,
    crossingCovered: crossingFlows().filter((f) => f.covered).length,
    verified: verifiedInterfaces(),
    hiddenExternal: HIDDEN_EXTERNAL,
    aircraft: CONFIGURATION.aircraft,
    vertiports: CONFIGURATION.sites,
    hubs: CONFIGURATION.hubs,
    chargers: CONFIGURATION.chargersInstalled,
    risksLinked: [...new Set(INTERFACES.flatMap((x) => x.risks))].sort(),
  }
})()
export const describeCounts = (c: ReturnType<typeof countsOf>) => `${plural(c.total, 'interface')}: ${c.physical} physical, ${c.information} information, ${c.organizational} organizational; ${c.external.length} external`
