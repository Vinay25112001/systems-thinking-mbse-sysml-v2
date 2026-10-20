// AeroLink Week 4 case: the architecture description. Viewpoints selected from the Week 1 stakeholder concerns; the
// functional architecture derived from the Week 2 capabilities, scenarios and requirements (with the functions the Week 2
// and Week 3 corrections need); the logical and physical elements with the Week 3 decision applied; the allocation
// function → logical → physical with a stated criterion for every row; one architecture decision; the information view
// (producer → item → consumer → decision) with the AI capability cards; the route check against the interfaces Week 5 will
// define; the evaluation of the architecture against requirements and TPMs; and the audit findings. The single source for
// the Week 4 lectures (session1.ts, session2.ts), their figures (src/components/figures/LectureWeek4S1.tsx, S2.tsx), the
// worked-examples page and the tests (aerolinkCase.test.ts). Exported names are kept stable; fields are only ever added.
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week04/WEEK04_LECTURE_OUTLINE.md §4.
//
// AeroLink Urban Mobility is FICTIONAL. Every number, name and statement is a teaching value, not a real-world claim.
//
// Provenance. Week 1, Week 2 and Week 3 data are IMPORTED, never retyped: stakeholders, concerns, needs and external
// systems from ../week01/aerolinkCase.ts; capabilities, scenarios, requirements and measures from ../week02/aerolinkCase.ts;
// the TPMs, risks, the Week 3 requirement REQ-STK-018 and the trade decision from ../week03/aerolinkCase.ts (all read-only).
// Week 4 data start from the instructor reference src/model/reference/week08.ts (FN-001..014, LOG-001..007, PHY-001..008,
// INFO-001..005, AI-001..002, DEC-002 and the interfaces IF-001..014, which Week 5 owns); the test compares the reference
// functions and allocations with the reference file. Spelling is American; week numbers follow the current schedule.
//
// The additions and corrections this module makes, each `provenance: 'proposed'` or 'corrected' (instructor to confirm):
//   - three functions for capabilities the reference does not serve: FN-015 (CAP-015, the Week 3 requirement REQ-STK-018),
//     FN-016 (CAP-013, REQ-STK-016, closing the Week 2 open item "allocate to the information elements in Week 4") and
//     FN-017 (CAP-012, REQ-STK-015); CAP-011 (site compliance) gets a disposition instead of a function;
//   - a three-level decomposition (the reference has no first-level groups);
//   - an allocation criterion for every function (the reference stores no criterion);
//   - the physical view with the Week 3 decision applied (16 aircraft, four hubs, eight turnaround chargers), computed
//     from the Week 3 alternative, not typed;
//   - INFO-004's producer corrected from Weather (a natural system) to a proposed external system, a weather information
//     service (EXT-007); INFO-005's producer and consumer corrected from a logical element and a decision record to
//     physical elements; a new item INFO-006 (operational evidence) for REQ-STK-016, whose incident records expose a
//     missing interface for Week 5;
//   - the viewpoints with their purposes, stakeholders and concerns (the reference has none).
import { CONCERNS, EXTERNAL_SYSTEMS, NEEDS, STAKEHOLDERS, type CaseProvenance } from '../week01/aerolinkCase'
import { CAPABILITIES, MOES, REQUIREMENTS, SCENARIOS, STK_DISPOSITIONS, SYSTEM_REQUIREMENTS, scenario } from '../week02/aerolinkCase'
import { CRITERIA, DECISION as TRADE_DECISION, REQUIRED_CAPACITY, RISKS, SCORES, TPMS, TRADE_RULES, W3_REQUIREMENTS, alternative, capacityOf, criterion, marginOf, tpm, wceOf } from '../week03/aerolinkCase'
import type { CriterionId, FlowKind, ViewKind } from './labBrief'

export const AEROLINK_W4_REVIEW = 'new-pending-review' as const

// ================================================================================================ viewpoints
export type CaseViewpoint = {
  id: string
  kind: ViewKind
  name: string
  /** The question the view answers (its purpose). */
  purpose: string
  stakeholders: string[]
  /** Week 1 concern IDs the viewpoint answers. */
  concerns: string[]
  /** Week 1 need IDs the view helps show are met. */
  needs: string[]
  /** The viewpoint's conventions: the form of the view and the element types it shows. */
  form: string
  /** The IDs or ID ranges of the elements the AeroLink view shows. */
  shows: string
  feeds: string
  provenance: CaseProvenance
}

export const VIEWPOINTS: CaseViewpoint[] = [
  {
    id: 'VP-001', kind: 'operational', name: 'Operational viewpoint',
    purpose: 'Who does what, in which order, when a passenger rides, an aircraft is charged, a fault is found or weather closes a vertiport?',
    stakeholders: ['STK-001', 'STK-005', 'STK-007', 'STK-008', 'STK-014', 'STK-015'], concerns: ['CON-001', 'CON-008', 'CON-009', 'CON-013', 'CON-017'],
    needs: ['NEED-001', 'NEED-008', 'NEED-009', 'NEED-011', 'NEED-013'],
    form: 'Scenario step tables with actors, alternate flows and end states', shows: 'SCN-001 to SCN-005', feeds: 'Week 10 use cases and action flows', provenance: 'proposed',
  },
  {
    id: 'VP-002', kind: 'functional', name: 'Functional viewpoint',
    purpose: 'What must the service do, with which inputs and outputs, so that every requirement has a function that meets it?',
    stakeholders: ['STK-002', 'STK-001', 'STK-006', 'STK-009', 'STK-010'], concerns: ['CON-002', 'CON-003', 'CON-004', 'CON-007', 'CON-010', 'CON-011'],
    needs: ['NEED-002', 'NEED-006', 'NEED-007', 'NEED-010'],
    form: 'A three-level function tree and a function table with inputs, outputs, capability, scenario and allocated requirements', shows: 'FG-1 to FG-7 and FN-001 to FN-017', feeds: 'Week 10 action definitions with their inputs and outputs', provenance: 'proposed',
  },
  {
    id: 'VP-003', kind: 'logical', name: 'Logical viewpoint',
    purpose: 'Which technology-independent elements perform the functions, so that make-or-buy and supplier choices stay open?',
    stakeholders: ['STK-003'], concerns: ['CON-005'],
    needs: ['NEED-005'],
    form: 'An allocation table, function to logical element, with the criterion for each row', shows: 'LOG-001 to LOG-007', feeds: 'Week 10 parts that perform actions', provenance: 'proposed',
  },
  {
    id: 'VP-004', kind: 'physical', name: 'Physical viewpoint',
    purpose: 'Which concrete elements implement the logical elements, how many of each, and where do they stand?',
    stakeholders: ['STK-005', 'STK-004', 'STK-013'], concerns: ['CON-006', 'CON-012', 'CON-016'],
    needs: ['NEED-003', 'NEED-004', 'NEED-012', 'NEED-016'],
    form: 'An element table with counts and the allocation matrix, function to physical element', shows: 'PHY-001 to PHY-008', feeds: 'Week 5 components and interfaces; Week 11 physical model', provenance: 'proposed',
  },
  {
    id: 'VP-005', kind: 'information', name: 'Information viewpoint',
    purpose: 'Which information is produced where, used where, for which decision, and how is it protected?',
    stakeholders: ['STK-009', 'STK-012', 'STK-008'], concerns: ['CON-009', 'CON-010', 'CON-014'],
    needs: ['NEED-007', 'NEED-013', 'NEED-014', 'NEED-015'],
    form: 'An information table, producer to item to consumer to decision, with the AI capability cards', shows: 'INFO-001 to INFO-006, AI-001 and AI-002', feeds: 'Week 5 information interfaces; Week 12 digital thread', provenance: 'proposed',
  },
  {
    id: 'VP-006', kind: 'enterprise', name: 'Enterprise viewpoint',
    purpose: 'Which organization owns which element and agreement, and where does the enterprise boundary cut the physical view?',
    stakeholders: ['STK-003', 'STK-005', 'STK-010', 'STK-011', 'STK-013'], concerns: ['CON-005', 'CON-006', 'CON-011', 'CON-015', 'CON-016'],
    needs: ['NEED-004', 'NEED-005', 'NEED-010', 'NEED-012', 'NEED-016', 'NEED-017'],
    form: 'The physical elements tinted by owner, with the organizational agreements between owners', shows: 'owners of PHY-001 to PHY-008 and the agreements', feeds: 'Week 6 evolution roadmap (as-is and to-be)', provenance: 'proposed',
  },
]
export const viewpoint = (id: string) => VIEWPOINTS.find((v) => v.id === id)!
/** Concern × viewpoint coverage (the graduate task's matrix): which viewpoints answer each Week 1 concern. */
export const CONCERN_COVERAGE = CONCERNS.map((c) => ({ concern: c.id, name: c.name, viewpoints: VIEWPOINTS.filter((v) => v.concerns.includes(c.id)).map((v) => v.id) }))
export const uncoveredConcerns = () => CONCERN_COVERAGE.filter((c) => !c.viewpoints.length).map((c) => c.concern)
/** Concerns that only the given viewpoint answers: deleting it would leave exactly these without a view. Coverage is
 *  only as good as the assignments behind it, so a reviewer checks that each one is plausible. */
export const onlyAnsweredBy = (vp: string) => CONCERN_COVERAGE.filter((c) => c.viewpoints.length === 1 && c.viewpoints[0] === vp).map((c) => c.concern)
export const NEED_VIEW_COVERAGE = NEEDS.map((n) => ({ need: n.id, viewpoints: VIEWPOINTS.filter((v) => v.needs.includes(n.id)).map((v) => v.id) }))

// ================================================================================================ functions
/** A flow item of a function. For an information input, `src` names where it comes from: the producing function, an
 *  external system or an AI capability, or 'held' (configuration or records the performing element keeps itself) or
 *  'stakeholder' (entered or carried by a person outside the physical view). An information output to an external system
 *  names it in `dst`. When a flow crosses from one physical element to another, `info` names the information item that
 *  carries it; the flow check (flowCheck below) computes every such crossing from `src`, `dst` and the allocation, so a
 *  crossing with no item, or with an item that does not join the two elements, is found. */
export type FlowItem = { item: string; kind: FlowKind; src?: string; dst?: string; info?: string }
export type CaseFunction = {
  id: string
  name: string
  text: string
  group: string
  inputs: FlowItem[]
  outputs: FlowItem[]
  capabilities: string[]
  /** Scenarios that exercise the function (none for a planning function: `planning` gives the reason). */
  scenarios: string[]
  planning?: string
  /** Requirements allocated to the function (system requirements, and stakeholder requirements with no system child). */
  requirements: string[]
  log: string
  phy: string
  criterion: CriterionId
  /** The allocation justification: one sentence naming why this element, resting on an ID. */
  why: string
  restsOn: string
  /** A human operation inside the function (R48c p.145: functions are allocated to human operations too). */
  human?: string
  note?: string
  provenance: CaseProvenance
}

/** The Week 3 requirement(s) written for the disruption capability (imported, so a split in Week 3 flows through). */
const W3_DISRUPTION_REQS = W3_REQUIREMENTS.filter((r) => r.parents.includes('CAP-015')).map((r) => r.id)
const i = (item: string, src?: string, info?: string): FlowItem => ({ item, kind: 'information', ...(src ? { src } : {}), ...(info ? { info } : {}) })
/** An information output sent to an external system. */
const out = (item: string, dst: string, info: string): FlowItem => ({ item, kind: 'information', dst, info })
const e = (item: string): FlowItem => ({ item, kind: 'energy' })
const m = (item: string): FlowItem => ({ item, kind: 'material' })

/** First-level functions under the mission function F0 (proposed grouping; the reference has none). */
export const MISSION_FUNCTION = { id: 'F0', name: 'Provide on-demand air trips between the six vertiports' }
export const GROUPS: { id: string; name: string }[] = [
  { id: 'FG-1', name: 'Serve passengers' },
  { id: 'FG-2', name: 'Assign and dispatch' },
  { id: 'FG-3', name: 'Conduct flights' },
  { id: 'FG-4', name: 'Manage energy' },
  { id: 'FG-5', name: 'Keep the fleet fit' },
  { id: 'FG-6', name: 'Protect the vertiports' },
  { id: 'FG-7', name: 'Plan capacity' },
]
export const group = (id: string) => GROUPS.find((g) => g.id === id)!

export const FUNCTIONS: CaseFunction[] = [
  {
    id: 'FN-001', name: 'Accept ride request', text: 'Receive origin, destination and party size; quote the full fare and a boarding-time estimate; confirm the booking.', group: 'FG-1',
    inputs: [i('ride request (origin, destination, party size)', 'stakeholder'), i('weather and capacity status', 'FN-004', 'INFO-007')], outputs: [i('full fare and boarding estimate'), i('confirmed booking and boarding pass')],
    capabilities: ['CAP-002', 'CAP-014'], scenarios: ['SCN-001'], requirements: ['REQ-SYS-012', 'REQ-STK-001'],
    log: 'LOG-004', phy: 'PHY-007', criterion: 'flow', why: 'Every exchange in it is passenger-facing information that the booking channel already holds: request, fare, confirmation.', restsOn: 'REQ-SYS-012',
    note: 'Also serves CAP-014 (fare transparency), added in Week 2: the full fare is quoted here before confirmation (REQ-SYS-012).', provenance: 'corrected',
  },
  {
    id: 'FN-002', name: 'Match request to aircraft', text: 'Select a dispatch-ready aircraft and a time slot for a confirmed request, within each pad’s sensitive-hour movement limit.', group: 'FG-2',
    inputs: [i('confirmed booking', 'FN-001', 'INFO-001'), i('aircraft availability', 'FN-009'), i('charge state', 'FN-006', 'INFO-003'), i('sensitive-hour movement limit per pad', 'held')], outputs: [i('aircraft and time-slot assignment')],
    capabilities: ['CAP-002'], scenarios: ['SCN-001'], requirements: ['REQ-SYS-005', 'REQ-SYS-011'],
    log: 'LOG-005', phy: 'PHY-004', criterion: 'control', why: 'Centralized control pools every aircraft in the network into one assignment, which matching at each vertiport cannot do; REQ-SYS-005 asks for that assignment within 60 s.', restsOn: 'REQ-SYS-005', provenance: 'reference',
  },
  {
    id: 'FN-003', name: 'Plan flight', text: 'Produce a route and energy plan that lands with at least the 20 % reserve.', group: 'FG-3',
    inputs: [i('assignment', 'FN-002'), i('aircraft energy state', 'FN-005', 'INFO-002'), i('forecast weather', 'EXT-007', 'INFO-004')], outputs: [i('flight plan with the landing reserve')],
    capabilities: ['CAP-004'], scenarios: ['SCN-002'], requirements: ['REQ-SYS-003'],
    log: 'LOG-001', phy: 'PHY-004', criterion: 'flow', why: 'It exchanges the same flight, energy and weather information that dispatch uses; placing it where that information already arrives adds no interface, an aim of a candidate physical architecture.', restsOn: 'REQ-SYS-003', provenance: 'reference',
  },
  {
    id: 'FN-004', name: 'Assess dispatch weather', text: 'Compare vertiport forecasts with the weather limits and place or lift dispatch holds.', group: 'FG-3',
    inputs: [i('observed and forecast weather per vertiport', 'EXT-007', 'INFO-004'), i('aircraft weather limits (TBD-01)', 'held')], outputs: [i('dispatch hold placed or lifted')],
    capabilities: ['CAP-005'], scenarios: ['SCN-005'], requirements: ['REQ-SYS-004'],
    log: 'LOG-006', phy: 'PHY-004', criterion: 'flow', why: 'Weather information for every vertiport is consumed in one place, where the duty manager declares and lifts holds; a hold placed anywhere else would need a new interface to dispatch.', restsOn: 'REQ-SYS-004',
    human: 'the duty manager declares and lifts each hold (SCN-005 steps 2 and 7)', provenance: 'reference',
  },
  {
    id: 'FN-005', name: 'Fly passenger trip', text: 'Take off, cruise, approach and land on the published procedures.', group: 'FG-3',
    inputs: [m('boarded party and released aircraft'), i('release, flight plan and accepted flight intent', 'FN-011', 'INFO-008'), e('stored battery energy')], outputs: [m('party at the destination pad'), i('flight data with landing energy')],
    capabilities: ['CAP-001', 'CAP-007'], scenarios: ['SCN-002'], requirements: ['REQ-SYS-002', 'REQ-SYS-007'],
    log: 'LOG-001', phy: 'PHY-001', criterion: 'transformation', why: 'Only the aircraft transforms stored energy into flight; noise and block time are properties of that transformation.', restsOn: 'REQ-SYS-007',
    human: 'the pilot or remote operator flies or supervises the trip', provenance: 'reference',
  },
  {
    id: 'FN-006', name: 'Charge aircraft', text: 'Restore battery energy to the dispatch threshold during the turnaround.', group: 'FG-4',
    inputs: [m('arrived aircraft at the reserve'), e('grid power within the connection limit')], outputs: [e('battery at the dispatch threshold'), i('charge-session record')],
    capabilities: ['CAP-003'], scenarios: ['SCN-003'], requirements: ['REQ-SYS-001'],
    log: 'LOG-002', phy: 'PHY-003', criterion: 'flow', why: 'Energy and the charge handshake cross the same physical connection between aircraft and charger, so both belong to the charger.', restsOn: 'REQ-SYS-001',
    human: 'the vertiport operator connects and disconnects the charger (SCN-003 steps 1 and 5)', provenance: 'reference',
  },
  {
    id: 'FN-007', name: 'Control vertiport charging power', text: 'Share the vertiport connection limit among the active charging sessions.', group: 'FG-4',
    inputs: [i('active charging sessions', 'FN-006'), i('configured connection limit (TBD-02)', 'held')], outputs: [i('power set-point per charger')],
    capabilities: ['CAP-010'], scenarios: ['SCN-003'], requirements: ['REQ-SYS-010'],
    log: 'LOG-002', phy: 'PHY-003', criterion: 'control', why: 'Distributed control enforces the limit in each vertiport’s chargers, not by procedure, so it holds when several aircraft arrive together.', restsOn: 'REQ-SYS-010', provenance: 'reference',
  },
  {
    id: 'FN-008', name: 'Assess aircraft health', text: 'Classify reported and predicted faults as go or no-go and set each aircraft’s availability.', group: 'FG-5',
    inputs: [i('health and fault reports', 'FN-005', 'INFO-002'), i('predicted faults and at-risk packs', 'AI-001'), i('approved deferral rules', 'held')], outputs: [i('go / no-go status and availability'), i('work order')],
    capabilities: ['CAP-006'], scenarios: ['SCN-004'], requirements: ['REQ-SYS-008'],
    log: 'LOG-003', phy: 'PHY-005', criterion: 'enterprise', why: 'The certifying technicians and diagnostic tools are at the maintenance facility, and only they may classify a fault.', restsOn: 'REQ-SYS-008',
    human: 'a certifying technician classifies every fault and signs the return to service (SCN-004 steps 1 and 5)', provenance: 'reference',
  },
  {
    id: 'FN-009', name: 'Manage fleet availability', text: 'Plan maintenance slots and spare aircraft so that the scheduled aircraft-hours are met.', group: 'FG-5',
    inputs: [i('go / no-go status', 'FN-008', 'INFO-003'), i('maintenance slots', 'held'), i('flight schedule', 'FN-002')], outputs: [i('aircraft-hours plan with spares')],
    capabilities: ['CAP-008', 'CAP-006'], scenarios: ['SCN-004'], requirements: ['REQ-SYS-006'],
    log: 'LOG-002', phy: 'PHY-004', criterion: 'control', why: 'Availability is planned fleet-wide, under the same central control that holds the schedule it must meet.', restsOn: 'REQ-SYS-006', provenance: 'reference',
  },
  {
    id: 'FN-010', name: 'Detect and report pad fire', text: 'Detect a battery fire on a pad and alert the emergency services.', group: 'FG-6',
    inputs: [e('heat and flame at the pad')], outputs: [out('alarm with the pad location', 'EXT-006', 'INFO-010'), i('pad incident records', undefined, 'INFO-006')],
    capabilities: ['CAP-009'], scenarios: ['SCN-003'], requirements: ['REQ-SYS-009'],
    log: 'LOG-007', phy: 'PHY-008', criterion: 'environment', why: 'Detection has to work in the pad environment itself, heat, weather and rotor wash included, so it sits at every pad.', restsOn: 'REQ-SYS-009', provenance: 'reference',
  },
  {
    id: 'FN-011', name: 'Dispatch aircraft', text: 'Release an assigned aircraft for flight after the go / no-go interlock and the weather-hold check.', group: 'FG-2',
    inputs: [i('assignment', 'FN-002'), i('go / no-go status', 'FN-008', 'INFO-003'), i('weather-hold state', 'FN-004'), i('flight plan', 'FN-003'), i('charge-complete status', 'FN-006', 'INFO-003')], outputs: [i('release for flight')],
    capabilities: ['CAP-002', 'CAP-004'], scenarios: ['SCN-002'], requirements: ['REQ-STK-006'],
    log: 'LOG-005', phy: 'PHY-004', criterion: 'control', why: 'The interlock reads the central fault status and the hold state; central control makes one release decision per flight.', restsOn: 'REQ-STK-006', provenance: 'reference',
  },
  {
    id: 'FN-012', name: 'Coordinate flight intent', text: 'Exchange route and timing with the air traffic service before departure.', group: 'FG-3',
    inputs: [i('flight plan', 'FN-003'), i('acceptance or amendment of each intent', 'EXT-001', 'INFO-009')], outputs: [out('flight intent filed with the air traffic service', 'EXT-001', 'INFO-009'), i('accepted flight intent')],
    capabilities: ['CAP-004'], scenarios: ['SCN-002'], requirements: ['REQ-STK-009'],
    log: 'LOG-001', phy: 'PHY-004', criterion: 'flow', why: 'One point of information exchange with the air traffic service, beside the flight plans it files.', restsOn: 'REQ-STK-009', provenance: 'reference',
  },
  {
    id: 'FN-013', name: 'Forecast demand', text: 'Forecast trips per vertiport pair and hour for scheduling and capacity planning.', group: 'FG-7',
    inputs: [i('booking history', 'FN-001', 'INFO-001'), i('calendar', 'held'), i('weather outlook', 'EXT-007', 'INFO-004')], outputs: [i('hourly demand forecast'), i('Year-2 demand re-forecast')],
    capabilities: ['CAP-008'], scenarios: [], planning: 'A planning function: it runs on history and calendars, outside any daily operating scenario.', requirements: [],
    log: 'LOG-006', phy: 'PHY-004', criterion: 'flow', why: 'It consumes the booking history that already reaches the operations center and feeds the capacity decisions made there, so placing it there adds no interface.', restsOn: 'CAP-008', provenance: 'reference',
  },
  {
    id: 'FN-014', name: 'Board and alight passengers', text: 'Move passengers, wheelchair users included, between the terminal and the cabin.', group: 'FG-1',
    inputs: [m('passengers at the terminal'), i('boarding pass (presented by the passenger)', 'stakeholder')], outputs: [m('passengers in the cabin or at the terminal'), i('boarding timestamps')],
    capabilities: ['CAP-001'], scenarios: ['SCN-002'], requirements: ['REQ-STK-007'],
    log: 'LOG-007', phy: 'PHY-002', criterion: 'enterprise', why: 'The step-free route is part of each vertiport, which the vertiport operators own and staff.', restsOn: 'REQ-STK-007',
    human: 'the vertiport operator boards the party (SCN-002 step 4)', provenance: 'reference',
  },
  // ---- proposed (instructor to confirm): functions for capabilities the reference does not serve
  {
    id: 'FN-015', name: 'Notify disrupted passengers', text: 'Tell each passenger whose confirmed trip is held, diverted or cancelled, and offer a new time, an alternate vertiport, a way onward or a refund.', group: 'FG-1',
    inputs: [i('hold, diversion or cancellation decision', 'FN-004', 'INFO-007'), i('affected bookings', 'held')], outputs: [i('notice to each affected passenger (within TBD-05)'), i('new time, alternate vertiport or refund')],
    capabilities: ['CAP-015'], scenarios: ['SCN-005'], requirements: W3_DISRUPTION_REQS,
    log: 'LOG-004', phy: 'PHY-007', criterion: 'flow', why: 'Notices travel on the channel that holds each booking and the passenger’s contact details.', restsOn: W3_DISRUPTION_REQS[0], provenance: 'proposed',
  },
  {
    id: 'FN-016', name: 'Record operational evidence', text: 'Keep an auditable record of the flight data, incidents and maintenance actions of every flight.', group: 'FG-5',
    inputs: [i('flight data', 'FN-005', 'INFO-006'), i('maintenance and release records', 'FN-008', 'INFO-006'), i('pad incident records', 'FN-010', 'INFO-006')], outputs: [i('auditable evidence log per flight')],
    capabilities: ['CAP-013'], scenarios: ['SCN-002', 'SCN-004'], requirements: ['REQ-STK-016'],
    log: 'LOG-002', phy: 'PHY-004', criterion: 'flow', why: 'Flight data and maintenance records already arrive at the operations center, so keeping the log where its inputs meet adds no interface, an aim of a candidate physical architecture.', restsOn: 'REQ-STK-016', provenance: 'proposed',
  },
  {
    id: 'FN-017', name: 'Assign flights to operators', text: 'Give each remote operator no more simultaneous flights than the workload limit, diversions included.', group: 'FG-2',
    inputs: [i('scheduled and diverted flights', 'FN-002'), i('simultaneous-flight limit (TBD-04)', 'held')], outputs: [i('flight-to-operator assignments within the limit')],
    capabilities: ['CAP-012'], scenarios: ['SCN-005'], requirements: ['REQ-STK-015'],
    log: 'LOG-005', phy: 'PHY-004', criterion: 'control', why: 'Workload can only be balanced across all operators from one place that sees every flight.', restsOn: 'REQ-STK-015', provenance: 'proposed',
  },
]
export const fn = (id: string) => {
  const f = FUNCTIONS.find((x) => x.id === id)
  if (!f) throw new Error(`unknown function ${id}`)
  return f
}
/** The fourteen functions of the instructor reference (FN-001 is 'corrected': it also serves a Week 2 capability). */
export const REFERENCE_FUNCTIONS = FUNCTIONS.filter((f) => f.provenance !== 'proposed')
export const PROPOSED_FUNCTIONS = FUNCTIONS.filter((f) => f.provenance === 'proposed')
export const functionsOfGroup = (g: string) => FUNCTIONS.filter((f) => f.group === g)
export const functionsOfCapability = (cap: string) => FUNCTIONS.filter((f) => f.capabilities.includes(cap)).map((f) => f.id)
/** Capabilities served by no function, each with its disposition (a constraint or a refinement, not a missing function). */
export const CAPABILITY_DISPOSITIONS: Record<string, string> = {
  'CAP-011': 'Site compliance is a constraint on where vertiports stand, met by site selection and verified by inspection before operation (REQ-STK-013 and REQ-STK-014 need no system child). It becomes a property of the physical view, not a function.',
}
export const capabilitiesWithoutFunction = () => CAPABILITIES.filter((c) => !functionsOfCapability(c.id).length).map((c) => c.id)

/** Requirements allocated to functions (the reverse index), and stakeholder requirements that need no allocation. */
export const allocationOfRequirement = (req: string) => FUNCTIONS.filter((f) => f.requirements.includes(req)).map((f) => f.id)
export const ALL_REQUIREMENTS = [...REQUIREMENTS, ...W3_REQUIREMENTS]
/** Every system requirement allocated to at least one function (an unallocated one is an incomplete architecture). */
export const unallocatedSystemRequirements = () => SYSTEM_REQUIREMENTS.filter((r) => !allocationOfRequirement(r.id).length).map((r) => r.id)
/** A stakeholder requirement is accounted for when a system requirement refines it, a function has it allocated, or its
 *  Week 2 disposition says no child is needed. */
export function stakeholderRequirementAccount(id: string): 'refined' | 'allocated' | 'no-child' | 'missing' {
  if (SYSTEM_REQUIREMENTS.some((s) => s.parents.includes(id))) return 'refined'
  if (allocationOfRequirement(id).length) return 'allocated'
  if (/^no child needed/i.test(STK_DISPOSITIONS[id] ?? '')) return 'no-child'
  return 'missing'
}
export const STAKEHOLDER_REQUIREMENT_IDS = ALL_REQUIREMENTS.filter((r) => r.level === 'stakeholder').map((r) => r.id)

/** Walking a scenario step by step to find functions (the proven practice: scenarios of functions before the tree,
 *  R20b p.594). Each step maps to the function it exercises; `finds` marks a function the walk exposes. */
/** `short` is the step in a few words (the worksheet figure shows it, with the function left for the class to supply);
 *  `human` marks a step where a person decides (a human operation inside the function). */
export type WalkStep = { step: string; short: string; fn: string; note?: string; finds?: boolean; human?: boolean }
export const SCENARIO_WALKS: { scenario: string; steps: WalkStep[] }[] = [
  {
    scenario: 'SCN-001',
    steps: [
      { step: '1', short: 'enter the request', fn: 'FN-001', note: 'the request enters' },
      { step: '2', short: 'check weather, capacity', fn: 'FN-001', note: 'reads the weather and capacity status FN-004 and FN-002 keep' },
      { step: '3', short: 'quote fare, boarding time', fn: 'FN-001', note: 'the full fare is quoted (REQ-SYS-012)' },
      { step: '4', short: 'confirm the booking', fn: 'FN-001' },
      { step: '5', short: 'assign aircraft in 60 s', fn: 'FN-002', note: 'assignment within 60 s (REQ-SYS-005)' },
      { step: '6', short: 'issue the boarding pass', fn: 'FN-001', note: 'the boarding pass closes the booking' },
      { step: 'A3', short: 'wheelchair help by agent', fn: 'FN-001', note: 'a human operation: the customer services agent', human: true },
    ],
  },
  {
    scenario: 'SCN-005',
    steps: [
      { step: '1', short: 'flag V3 near its limits', fn: 'FN-004', note: 'forecast against the limits' },
      { step: '2', short: 'declare the hold', fn: 'FN-004', note: 'a human operation: the duty manager declares the hold', human: true },
      { step: '3', short: 'divert airborne flights', fn: 'FN-005', note: 'diversions load the remote operators' },
      { step: '3', short: 'divert airborne flights', fn: 'FN-017', note: 'no reference function limits operator workload', finds: true },
      { step: '4', short: 'revised flight intents', fn: 'FN-012' },
      { step: '5', short: 'notify passengers', fn: 'FN-015', note: 'no reference function tells passengers', finds: true },
      { step: '6', short: 'passenger chooses', fn: 'FN-015' },
      { step: '7', short: 'lift hold, re-time backlog', fn: 'FN-004', note: 'the hold is lifted; the backlog is re-timed by FN-002', human: true },
    ],
  },
]
/** Functions a walk exposes, and the scenario step that exposes each. */
export const FOUND_BY_WALK = SCENARIO_WALKS.flatMap((w) => w.steps.filter((s) => s.finds).map((s) => ({ scenario: w.scenario, step: s.step, fn: s.fn })))

// ================================================================================================ logical and physical
export type CaseLogical = { id: string; name: string; text: string; phys: string[]; provenance: CaseProvenance }
/** Logical elements (reference names; LOG-007 added by the reference) and the physical elements each is allocated to.
 *  LOG-002, LOG-004, LOG-005 and LOG-007 are 'corrected': their text is extended to cover the proposed functions. */
export const LOGICAL: CaseLogical[] = [
  { id: 'LOG-001', name: 'Flight Operations', text: 'Plans and conducts flights and coordinates with the air traffic service.', phys: ['PHY-001', 'PHY-004'], provenance: 'reference' },
  { id: 'LOG-002', name: 'Fleet Management', text: 'Manages fleet energy, charging, availability and the operational evidence log.', phys: ['PHY-003', 'PHY-004'], provenance: 'corrected' },
  { id: 'LOG-003', name: 'Maintenance Management', text: 'Assesses aircraft health and controls release to service.', phys: ['PHY-005'], provenance: 'reference' },
  { id: 'LOG-004', name: 'Customer Services', text: 'Handles passenger booking, information, notices and payment.', phys: ['PHY-007', 'PHY-004'], provenance: 'corrected' },
  { id: 'LOG-005', name: 'Scheduling', text: 'Assigns aircraft to requests, flights to operators, and dispatches flights.', phys: ['PHY-004'], provenance: 'corrected' },
  { id: 'LOG-006', name: 'Decision Support', text: 'Provides weather assessment and demand forecasts to operational and planning decisions.', phys: ['PHY-004'], provenance: 'reference' },
  { id: 'LOG-007', name: 'Vertiport Operations', text: 'Runs passenger flow and pad safety at the vertiports, fire detection included.', phys: ['PHY-002', 'PHY-008'], provenance: 'corrected' },
]
export const logical = (id: string) => LOGICAL.find((l) => l.id === id)!
export const functionsOfLogical = (log: string) => FUNCTIONS.filter((f) => f.log === log).map((f) => f.id)

/** The physical configuration after the Week 3 decision, COMPUTED from the recommended alternative (ALT-004) and the
 *  network of the ConOps (six vertiports, two chargers each). */
export const CONFIGURATION = (() => {
  const alt = alternative(TRADE_DECISION.recommended)
  const base = alternative('ALT-001')
  const chargersInstalled = alt.sites * TRADE_RULES.chargersPerHub
  const hubs = alt.chargers / TRADE_RULES.chargersPerHub
  return {
    decision: TRADE_DECISION.id,
    alternative: alt.id,
    aircraft: alt.aircraft,
    baselineAircraft: base.aircraft,
    sites: alt.sites,
    hubs,
    spokes: alt.sites - hubs,
    turnaroundChargers: alt.chargers,
    standardChargers: chargersInstalled - alt.chargers,
    chargersInstalled,
    capacity: capacityOf(alt.aircraft, alt.chargers),
    fleetLimit: alt.aircraft * TRADE_RULES.tripsPerAircraft,
    chargerLimit: alt.chargers * TRADE_RULES.chargesPerCharger,
  }
})()

export type Owner = 'AeroLink' | 'Vertiport operators'
export type CasePhysical = { id: string; name: string; text: string; kind: string; owner: Owner; count?: string; provenance: CaseProvenance }
export const PHYSICAL: CasePhysical[] = [
  { id: 'PHY-001', name: 'eVTOL Aircraft', text: 'Four-seat electric vertical take-off and landing aircraft.', kind: 'hardware with software', owner: 'AeroLink', count: `${CONFIGURATION.aircraft} (${CONFIGURATION.baselineAircraft} at opening)`, provenance: 'corrected' },
  { id: 'PHY-002', name: 'Vertiports', text: 'Sites with pads, terminals and step-free routes.', kind: 'facilities', owner: 'Vertiport operators', count: `${CONFIGURATION.sites}: ${CONFIGURATION.hubs} hubs, ${CONFIGURATION.spokes} spokes`, provenance: 'corrected' },
  { id: 'PHY-003', name: 'Charging Systems', text: 'Chargers at the vertiports with their power control: high-power turnaround chargers at hubs, standard chargers at spokes.', kind: 'hardware with software', owner: 'Vertiport operators', count: `${CONFIGURATION.chargersInstalled}: ${CONFIGURATION.turnaroundChargers} high-power, ${CONFIGURATION.standardChargers} standard`, provenance: 'corrected' },
  { id: 'PHY-004', name: 'Operations Center', text: 'Hosts scheduling, dispatch, flight following, decision support and the evidence log, with a hot standby.', kind: 'facility, software and staff', owner: 'AeroLink', count: '1, with hot standby', provenance: 'reference' },
  { id: 'PHY-005', name: 'Maintenance Facility', text: 'Battery workshop, diagnostic tools and certifying technicians.', kind: 'facility, tools and staff', owner: 'AeroLink', count: '1', provenance: 'reference' },
  { id: 'PHY-006', name: 'Communications Infrastructure', text: 'Air-ground datalink and ground network: the medium of the information interfaces, with no function of its own.', kind: 'network', owner: 'AeroLink', provenance: 'reference' },
  { id: 'PHY-007', name: 'Passenger booking platform', text: 'Mobile app and booking back end for requests, fares, boarding passes and notices.', kind: 'software', owner: 'AeroLink', provenance: 'reference' },
  { id: 'PHY-008', name: 'Pad fire detection and alarm system', text: 'Thermal and flame detection at every pad with automatic alarm transmission.', kind: 'hardware', owner: 'Vertiport operators', provenance: 'reference' },
]
export const physical = (id: string) => PHYSICAL.find((p) => p.id === id)!
export const functionsOfPhysical = (phy: string) => FUNCTIONS.filter((f) => f.phy === phy).map((f) => f.id)
/** The check rule of the reference: every function's physical element is one its logical element is allocated to. */
export const inconsistentAllocations = () => FUNCTIONS.filter((f) => !logical(f.log)?.phys.includes(f.phy)).map((f) => f.id)

/** Organizational agreements of the enterprise view. Organizational agreements record duties; they carry no data flow. */
export const AGREEMENTS: { id: string; name: string; between: [string, string]; covers: string; ref?: string; provenance: CaseProvenance }[] = [
  { id: 'AG-1', name: 'Pad-slot and ground-handling agreement', between: ['AeroLink', 'Vertiport operators'], covers: 'pad slots and boarding duties at each vertiport', ref: 'IF-009', provenance: 'reference' },
  { id: 'AG-2', name: 'Work-order handover procedure', between: ['Operations Center', 'Maintenance Facility'], covers: 'withdrawing aircraft from service and returning them', ref: 'IF-004', provenance: 'reference' },
  { id: 'AG-3', name: 'Grid connection agreement', between: ['Vertiport operators', 'Electric utility'], covers: 'the power limit at each vertiport (TBD-02)', provenance: 'proposed' },
  { id: 'AG-4', name: 'Aircraft purchase agreement', between: ['AeroLink', 'Aircraft manufacturer'], covers: 'orders, delivery slots and payment milestones', provenance: 'proposed' },
  { id: 'AG-5', name: 'Insurance evidence agreement', between: ['AeroLink', 'Insurers'], covers: 'a quarterly report from the evidence log', provenance: 'proposed' },
]

// ================================================================================================ architecture decision
export const ARCH_DECISION = {
  id: 'DEC-002',
  question: 'Where should scheduling and dispatch run, at each vertiport or on one operations platform, and how is that platform kept running and protected?',
  alternatives: ['Distributed dispatch at each vertiport', 'One operations platform without standby', 'One operations platform with a hot standby'],
  chosen: 'One operations platform with a hot standby',
  rationale: 'One platform pools the whole fleet into one network-wide assignment, so a request can take any ready aircraft in the network, which short waits and the 60 s assignment of REQ-SYS-005 need; the hot standby removes the single point of failure of the dispatch-platform outage risk.',
  /** What the decision is tested against (Session 1). */
  tests: [
    { id: 'NEED-001', against: 'one assignment pools every aircraft in the network, so a request is not limited to the aircraft standing at its own vertiport (REQ-SYS-005)', verdict: 'supports' },
    { id: 'R-007', against: 'a single platform is a single point of failure', verdict: 'mitigated by the hot standby and the manual procedure' },
    { id: 'R-009', against: 'one platform concentrates the target for an intrusion', verdict: 'condition: the booking front end stays separated from dispatch, and every assignment is integrity-checked' },
  ],
  conditions: ['failover within the 60 s assignment window', 'the booking platform separated from the dispatch segment (the treatment of R-009)'],
  wouldChangeIf: 'a vertiport-level outage of the network itself (PHY-006) became more likely than a platform outage: then distributed fallback dispatch would earn its cost',
  quantitative: 'the coupling count of each alternative, done in Week 5 when the interfaces exist',
  provenance: 'reference' as CaseProvenance,
}

// ================================================================================================ information view
/** External systems referenced by the information view: Week 1's, plus the proposed weather information service. */
export const W4_EXTERNALS: { id: string; name: string; provenance: CaseProvenance }[] = [
  ...EXTERNAL_SYSTEMS.map((x) => ({ id: x.id, name: x.name, provenance: x.nameProvenance })),
  { id: 'EXT-007', name: 'Weather information service', provenance: 'proposed' },
]
export type Route = { from: string; to: string; via: string[] }
export type CaseInfo = {
  id: string
  name: string
  content: string
  /** Data: the raw values; information: what they become in context, analyzed (R21 p.512). */
  data: string
  information: string
  producers: string[]
  consumers: string[]
  decision: string
  /** Functions, requirements and decisions the decision belongs to. */
  decisionRefs: string[]
  /** Every producer → consumer route (an AI counts as its host element) with the interfaces it crosses (a relay lists
   *  each hop's interface); an empty list is a route with no interface. */
  routes: Route[]
  timeliness: string
  sensitivity: string
  note?: string
  provenance: CaseProvenance
}

export const INFORMATION: CaseInfo[] = [
  {
    id: 'INFO-001', name: 'Passenger information', content: 'Ride requests, party size, accessibility needs, confirmation and boarding timestamps.',
    data: 'each request’s origin, destination, party size and timestamps', information: 'the queue of confirmed requests per vertiport pair, with each passenger’s wait so far',
    producers: ['PHY-007', 'PHY-002'], consumers: ['PHY-004', 'AI-002'],
    decision: 'Which aircraft to assign to each request, and when; whether the monthly wait target is being met', decisionRefs: ['FN-002', 'REQ-SYS-005', 'MOE-001'],
    routes: [{ from: 'PHY-007', to: 'PHY-004', via: ['IF-008'] }, { from: 'PHY-002', to: 'PHY-004', via: ['IF-014'] }],
    timeliness: 'within seconds: the assignment has 60 s', sensitivity: 'personal: identifies individuals and records accessibility needs', provenance: 'reference',
  },
  {
    id: 'INFO-002', name: 'Flight data', content: 'Flight plan, position, energy state, landing energy, and health and fault reports for each flight.',
    data: 'position, energy state, cell temperatures and fault codes, sampled through each flight', information: 'whether the aircraft can fly its next leg with the 20 % reserve, and which of its faults are no-go',
    producers: ['PHY-001'], consumers: ['PHY-004', 'PHY-005'],
    decision: 'At the operations center, whether the next leg can be planned and dispatched with the energy reserve; at the maintenance facility, whether a reported fault makes the aircraft no-go', decisionRefs: ['FN-003', 'FN-011', 'REQ-SYS-003', 'FN-008', 'REQ-SYS-008'],
    routes: [{ from: 'PHY-001', to: 'PHY-004', via: ['IF-002'] }, { from: 'PHY-001', to: 'PHY-005', via: ['IF-013'] }],
    timeliness: 'continuous in flight; fault reports within the 2 min of REQ-SYS-008', sensitivity: 'safety-related', provenance: 'reference',
  },
  {
    id: 'INFO-003', name: 'Maintenance data', content: 'Fault reports, deferrals, work orders, release-to-service records and battery charge-session data.',
    data: 'work-order entries, deferral records and charge-session logs', information: 'each aircraft’s go / no-go status and its packs’ capacity trend',
    producers: ['PHY-005', 'PHY-003'], consumers: ['PHY-004', 'AI-001'],
    decision: 'Release or withhold an aircraft', decisionRefs: ['FN-008', 'FN-011', 'REQ-STK-006', 'REQ-SYS-008'],
    routes: [{ from: 'PHY-005', to: 'PHY-004', via: ['IF-012'] }, { from: 'PHY-003', to: 'PHY-004', via: ['IF-010'] }, { from: 'PHY-003', to: 'PHY-005', via: ['IF-010', 'IF-012'] }],
    timeliness: 'go / no-go within 2 min of a report', sensitivity: 'safety-related; airworthiness records', note: 'The charge-session records reach AI-001 at the maintenance facility by a recorded relay through the operations center.', provenance: 'reference',
  },
  {
    id: 'INFO-004', name: 'Weather data', content: 'Observed and forecast wind, gust and visibility at each vertiport.',
    data: 'observed and forecast wind, gust and visibility values', information: 'which vertiports will be outside the aircraft limits in the next 30 min',
    producers: ['EXT-007'], consumers: ['PHY-004'],
    decision: 'Place or lift a vertiport dispatch hold', decisionRefs: ['FN-004', 'REQ-SYS-004'],
    routes: [{ from: 'EXT-007', to: 'PHY-004', via: ['IF-011'] }],
    timeliness: 'loses value within the 30 min forecast window', sensitivity: 'none', note: 'Producer corrected from Weather, a natural system with no owner, to a weather information service (proposed).', provenance: 'corrected',
  },
  {
    id: 'INFO-005', name: 'Financial data', content: 'Fare revenue, operating cost and capital spend by vertiport and aircraft.',
    data: 'fares paid, energy and maintenance costs, capital invoices', information: 'revenue and cost per trip and per vertiport, against the capital plan',
    producers: ['PHY-007', 'PHY-004'], consumers: ['PHY-004'],
    decision: 'How much capacity to add, and when: the capacity decision after the Year-2 decision', decisionRefs: ['DEC-001', 'REQ-STK-004'],
    routes: [{ from: 'PHY-007', to: 'PHY-004', via: ['IF-008'] }],
    timeliness: 'monthly; quarterly for the capacity review', sensitivity: 'commercial', note: 'Producer corrected from a logical element and consumer from a decision record to physical elements: network planning works at the operations center (proposed).', provenance: 'corrected',
  },
  {
    id: 'INFO-006', name: 'Operational evidence', content: 'For every flight: the flight data, any incident, and the maintenance actions, kept as an auditable log.',
    data: 'flight records, incident reports and maintenance entries', information: 'measured operational risk: incident rates and their causes per flight-hour',
    producers: ['PHY-001', 'PHY-005', 'PHY-008'], consumers: ['PHY-004'],
    decision: 'Which incident causes the operations center corrects first, and what its quarterly evidence report to the insurers shows', decisionRefs: ['FN-016', 'REQ-STK-016'],
    routes: [{ from: 'PHY-001', to: 'PHY-004', via: ['IF-002'] }, { from: 'PHY-005', to: 'PHY-004', via: ['IF-012'] }, { from: 'PHY-008', to: 'PHY-004', via: [] }],
    timeliness: 'per flight; reported quarterly', sensitivity: 'safety-related and commercial', note: 'New item for REQ-STK-016 (proposed). The pad incident records have no route: a finding for Week 5. The insurers receive the quarterly report under agreement AG-5; they are a stakeholder, not an element of the physical view, so their own premium decision lies outside this view.', provenance: 'proposed',
  },
  // ---- proposed (instructor to confirm): items the flow check found missing, each a function flow between two elements
  {
    id: 'INFO-007', name: 'Service status and disruption decisions', content: 'Weather holds, diversions, cancellations and remaining capacity per vertiport, as decided at the operations center.',
    data: 'hold flags, diverted and cancelled flight numbers, open slots per vertiport', information: 'which confirmed bookings a disruption affects, and which trips can still be offered',
    producers: ['PHY-004'], consumers: ['PHY-007'],
    decision: 'Which rides the booking platform still offers, and what each affected passenger is told and offered', decisionRefs: ['FN-001', 'FN-015', ...W3_DISRUPTION_REQS],
    routes: [{ from: 'PHY-004', to: 'PHY-007', via: ['IF-008'] }],
    timeliness: 'within the notice time TBD-05 of a hold, diversion or cancellation', sensitivity: 'none: operational status', note: 'New item (proposed): the hold is decided at the operations center (FN-004), but the passengers are told by the booking platform (FN-015), so the decision crosses IF-008. IF-008 must then carry this item as well (Week 5).', provenance: 'proposed',
  },
  {
    id: 'INFO-008', name: 'Flight release and plan', content: 'For each flight: the release, the route and energy plan with the landing reserve, and the accepted flight intent.',
    data: 'release flag, waypoints, planned energy at each waypoint, intent acceptance reference', information: 'whether this aircraft may take off now, on which route and with what reserve',
    producers: ['PHY-004'], consumers: ['PHY-001'],
    decision: 'Whether the pilot or remote operator takes off, and which route and energy plan the flight follows', decisionRefs: ['FN-005', 'REQ-SYS-003', 'REQ-STK-006'],
    routes: [{ from: 'PHY-004', to: 'PHY-001', via: ['IF-002'] }],
    timeliness: 'before each departure', sensitivity: 'safety-related', note: 'New item (proposed): the plan (FN-003) and the release (FN-011) are made at the operations center and flown at the aircraft.', provenance: 'proposed',
  },
  {
    id: 'INFO-009', name: 'Flight intent', content: 'The route and timing of each flight filed with the air traffic service, and its acceptance or amendment.',
    data: 'filed routes, times and altitudes; acceptance and amendment messages', information: 'which flights may enter controlled airspace as planned, and which must be re-planned',
    producers: ['PHY-004', 'EXT-001'], consumers: ['EXT-001', 'PHY-004'],
    decision: 'The air traffic service accepts or amends each intent; the operations center releases only flights whose intent is accepted', decisionRefs: ['FN-012', 'FN-011', 'REQ-STK-009'],
    routes: [{ from: 'PHY-004', to: 'EXT-001', via: ['IF-003'] }, { from: 'EXT-001', to: 'PHY-004', via: ['IF-003'] }],
    timeliness: 'before each departure, and again for every diversion', sensitivity: 'safety-related', note: 'New item (proposed): two parties each decide with it, so each is a consumer.', provenance: 'proposed',
  },
  {
    id: 'INFO-010', name: 'Pad fire alarm', content: 'An automatic alarm with the pad location when a battery fire is detected on a pad.',
    data: 'detector state, pad identifier and detection time', information: 'a detected fire at a named pad that responders must attend',
    producers: ['PHY-008'], consumers: ['EXT-006'],
    decision: 'Whether and where the emergency services send fire crews', decisionRefs: ['FN-010', 'REQ-SYS-009'],
    routes: [{ from: 'PHY-008', to: 'EXT-006', via: ['IF-007'] }],
    timeliness: 'within 30 s of detection (REQ-SYS-009)', sensitivity: 'safety-related', note: 'New item (proposed): the consumer is an external system, because the decision it supports is made outside AeroLink.', provenance: 'proposed',
  },
]
export const info = (id: string) => INFORMATION.find((x) => x.id === id)!

/** The interfaces the route check reads (reference IF-001..014; Week 5 defines them). IF-011's end is corrected to the
 *  weather information service (proposed). Organizational interfaces record an agreement and carry no flow. */
export const INTERFACES: { id: string; ends: [string, string]; type: 'physical' | 'information' | 'organizational' }[] = [
  { id: 'IF-001', ends: ['PHY-001', 'PHY-002'], type: 'physical' },
  { id: 'IF-002', ends: ['PHY-001', 'PHY-004'], type: 'information' },
  { id: 'IF-003', ends: ['PHY-004', 'EXT-001'], type: 'information' },
  { id: 'IF-004', ends: ['PHY-004', 'PHY-005'], type: 'organizational' },
  { id: 'IF-005', ends: ['PHY-001', 'PHY-003'], type: 'physical' },
  { id: 'IF-006', ends: ['PHY-003', 'EXT-002'], type: 'physical' },
  { id: 'IF-007', ends: ['PHY-008', 'EXT-006'], type: 'information' },
  { id: 'IF-008', ends: ['PHY-007', 'PHY-004'], type: 'information' },
  { id: 'IF-009', ends: ['PHY-002', 'PHY-004'], type: 'organizational' },
  { id: 'IF-010', ends: ['PHY-003', 'PHY-004'], type: 'information' },
  { id: 'IF-011', ends: ['EXT-007', 'PHY-004'], type: 'information' },
  { id: 'IF-012', ends: ['PHY-005', 'PHY-004'], type: 'information' },
  { id: 'IF-013', ends: ['PHY-001', 'PHY-005'], type: 'information' },
  { id: 'IF-014', ends: ['PHY-002', 'PHY-004'], type: 'information' },
]

export type CaseAi = { id: string; name: string; host: string; supports: string; inputs: string[]; outputs: string; oversight: string; failure: string; dataQuality: string; risk: string; provenance: CaseProvenance }
export const AI_CAPABILITIES: CaseAi[] = [
  {
    id: 'AI-001', name: 'Predictive maintenance', host: 'PHY-005', supports: 'FN-008', inputs: ['INFO-003'],
    outputs: 'A ranked list of aircraft and battery packs at risk, with the predicted time to limit',
    oversight: 'A certifying technician decides every withdrawal; the model never releases an aircraft',
    failure: 'A missed prediction leaves the reactive fault path of FN-008 as the safety net; false alarms withdraw good aircraft and cost availability (MOP-006)',
    dataQuality: 'trained on charge-session and fault records from a young fleet: few failures to learn from', risk: 'R-002', provenance: 'reference',
  },
  {
    id: 'AI-002', name: 'Demand forecasting', host: 'PHY-004', supports: 'FN-013', inputs: ['INFO-001'],
    outputs: 'An hourly demand forecast per vertiport pair and the Year-2 re-forecast',
    oversight: 'Network planning reviews the forecast each quarter before it feeds a capacity decision',
    failure: 'An over-forecast strands capital; an under-forecast repeats the charging limit; demand patterns that shift once the network is reconfigured make past data misleading',
    dataQuality: 'booking history comes from the opening network only; once the Week 3 decision changes where the hubs and high-power chargers are, trips may shift between vertiport pairs, so that history may no longer describe the network in use', risk: 'R-001', provenance: 'corrected',
  },
]
export const ai = (id: string) => AI_CAPABILITIES.find((x) => x.id === id)!

/** The element an AI capability or a physical element stands for in the route check. */
export const placeOf = (id: string) => (id.startsWith('AI-') ? ai(id).host : id)
const joins = (a: string, b: string, ifId: string) => {
  const f = INTERFACES.find((x) => x.id === ifId)
  return !!f && f.type === 'information' && ((f.ends[0] === a && f.ends[1] === b) || (f.ends[0] === b && f.ends[1] === a))
}
/** A route is covered when its interfaces form an information path from producer to consumer: one interface joining the
 *  two ends, or a relay whose every hop is an information interface (course coverage rule, Session 2). */
export function routeCovered(r: Route): boolean {
  if (!r.via.length) return false
  let at = r.from
  for (const ifId of r.via) {
    const f = INTERFACES.find((x) => x.id === ifId)
    if (!f || f.type !== 'information') return false
    const next = f.ends[0] === at ? f.ends[1] : f.ends[1] === at ? f.ends[0] : null
    if (!next || !joins(at, next, ifId)) return false
    at = next
  }
  return at === r.to
}
/** Every producer → consumer pair between different elements, with its route (or none) and whether it is covered. */
export const routeCheck = () => INFORMATION.flatMap((x) =>
  x.producers.flatMap((p) =>
    x.consumers
      .map((c) => ({ info: x.id, from: p, to: placeOf(c) }))
      .filter((pair) => pair.from !== pair.to)
      .map((pair) => {
        const r = x.routes.find((y) => y.from === pair.from && y.to === pair.to)
        return { ...pair, via: r?.via ?? [], recorded: !!r, covered: !!r && routeCovered(r) }
      }),
  ),
).filter((v, k, all) => all.findIndex((w) => w.info === v.info && w.from === v.from && w.to === v.to) === k)
export const ROUTE_CHECK = routeCheck()
export const uncoveredRoutes = () => routeCheck().filter((r) => !r.covered)

/** Where a flow source stands: a function's physical element, an AI capability's host, or the external system itself.
 *  'held' and 'stakeholder' sources are not elements and never cross an interface. */
export const placeOfSource = (src: string) => (src.startsWith('FN-') ? fn(src).phy : src.startsWith('AI-') || src.startsWith('EXT-') ? placeOf(src) : null)
export type CrossFlow = { fn: string; item: string; from: string; to: string; info?: string; status: 'covered' | 'no-route' | 'unlisted' }
/** Every information flow of the functions that crosses from one element to another, computed from the inputs' sources,
 *  the outputs to external systems and the allocation, NOT from the information items. Each crossing must travel in a
 *  named information item whose producers include the source's element and whose consumers include the receiving element
 *  ('unlisted' otherwise); the item's route for that pair must then cross an information interface ('no-route'
 *  otherwise). A flow nobody listed in the information view therefore fails this check. */
export function flowCheck(): CrossFlow[] {
  const flows: Omit<CrossFlow, 'status'>[] = []
  for (const f of FUNCTIONS) {
    for (const x of f.inputs) {
      if (x.kind !== 'information' || !x.src) continue
      const from = placeOfSource(x.src)
      if (from && from !== f.phy) flows.push({ fn: f.id, item: x.item, from, to: f.phy, info: x.info })
    }
    for (const x of f.outputs) if (x.kind === 'information' && x.dst && x.dst !== f.phy) flows.push({ fn: f.id, item: x.item, from: f.phy, to: x.dst, info: x.info })
  }
  return flows.map((fl) => {
    const item = fl.info ? INFORMATION.find((y) => y.id === fl.info) : undefined
    const joins = !!item && item.producers.some((p) => placeOf(p) === fl.from) && item.consumers.some((c) => placeOf(c) === fl.to)
    if (!joins) return { ...fl, status: 'unlisted' as const }
    const r = item!.routes.find((y) => y.from === fl.from && y.to === fl.to)
    return { ...fl, status: r && routeCovered(r) ? ('covered' as const) : ('no-route' as const) }
  })
}
/** Information inputs whose source is not stated: the flow check cannot see them, so the case test requires none. */
export const unsourcedInputs = () => FUNCTIONS.flatMap((f) => f.inputs.filter((x) => x.kind === 'information' && !x.src).map((x) => `${f.id}: ${x.item}`))

// ================================================================================================ the driving question
/** One input of the release decision: the function that produces it and where; whether it crosses an information
 *  interface to reach the decision (`crosses`), or is made inside the deciding element from information that crossed
 *  one (`madeFrom`); and, for an input that is itself a decision, the person who makes it. */
export type DispatchInput = { what: string; fn: string; at: string; by?: string; crosses?: { info: string; via: string }; madeFrom?: { what: string; info: string; at: string; via: string }; bound: string }
/** Who decides that an aircraft may fly, and what reaches them (Session 1 question, Session 2 answer). Data, decisions
 *  and deciders are kept apart: the weather data cross IF-011, but the hold is the duty manager's decision inside the
 *  operations center; the aircraft reports its energy state over IF-002, but the flight plan is made by FN-003 inside the
 *  operations center. The case test checks every input against FN-011's inputs, their sources and the routes. */
export const DISPATCH_ANSWER: { decision: string; decidedAt: string; performedBy: string; inputs: DispatchInput[]; output: { what: string; info: string; to: string; via: string }; history: string } = {
  decision: 'FN-011',
  decidedAt: fn('FN-011').phy,
  performedBy: fn('FN-011').log,
  inputs: [
    { what: 'go / no-go status', fn: 'FN-008', at: fn('FN-008').phy, by: 'a certifying technician', crosses: { info: 'INFO-003', via: 'IF-012' }, bound: 'within 2 min of the fault report (REQ-SYS-008)' },
    { what: 'charge-complete status', fn: 'FN-006', at: fn('FN-006').phy, crosses: { info: 'INFO-003', via: 'IF-010' }, bound: 'at the dispatch threshold (REQ-SYS-001)' },
    { what: 'weather-hold state', fn: 'FN-004', at: fn('FN-004').phy, by: 'the duty manager', madeFrom: { what: 'weather data', info: 'INFO-004', at: 'EXT-007', via: 'IF-011' }, bound: 'forecast for the next 30 min (REQ-SYS-004)' },
    { what: 'flight plan', fn: 'FN-003', at: fn('FN-003').phy, madeFrom: { what: 'energy state', info: 'INFO-002', at: 'PHY-001', via: 'IF-002' }, bound: 'planned to land with 20 % (REQ-SYS-003)' },
    { what: 'assignment', fn: 'FN-002', at: fn('FN-002').phy, bound: 'within 60 s of confirmation (REQ-SYS-005)' },
  ],
  output: { what: 'release, flight plan and accepted flight intent', info: 'INFO-008', to: 'PHY-001', via: 'IF-002' },
  history: 'In the first reference version the go / no-go status had only the organizational work-order procedure (IF-004) to travel on, so the dispatch interlock rested on a procedure. Tracing the information to the decision exposed the gap; the information interfaces IF-012 and IF-013 were added.',
}

// ================================================================================================ evaluation
/** The architecture evaluated against requirements and TPMs (Session 2): each row names the requirement or TPM, the
 *  function and element it is allocated to, the evidence and a verdict. Every number is computed. */
export const EVALUATION = (() => {
  const t1 = tpm('TPM-001')
  const t2 = tpm('TPM-002')
  const t3 = tpm('TPM-003')
  const at = (req: string) => {
    const f = fn(allocationOfRequirement(req)[0])
    return { fn: f.id, phy: f.phy }
  }
  const retained = SCORES[TRADE_DECISION.recommended][CRITERIA.findIndex((c) => c.id === 'CRIT-003')]
  const rows: { id: string; item: string; allocated: string; evidence: string; verdict: 'meets' | 'margin' | 'open' }[] = [
    { id: 'REQ-STK-004', item: `capacity of at least ${REQUIRED_CAPACITY} trips/day`, allocated: `PHY-001 (${CONFIGURATION.aircraft} aircraft), PHY-003 (${CONFIGURATION.turnaroundChargers} turnaround chargers)`, evidence: `min(${CONFIGURATION.aircraft} × ${TRADE_RULES.tripsPerAircraft}, ${CONFIGURATION.turnaroundChargers} × ${TRADE_RULES.chargesPerCharger}) = ${CONFIGURATION.capacity} trips/day`, verdict: CONFIGURATION.capacity >= REQUIRED_CAPACITY ? 'meets' : 'open' },
    { id: t1.id, item: `${t1.name} (${t1.measures})`, allocated: `${at(t1.measures).fn} at ${at(t1.measures).phy}`, evidence: `worst case ${wceOf(t1)} ${t1.unit} against ${t1.threshold}: margin ${marginOf(t1).toFixed(1)} ${t1.unit}`, verdict: marginOf(t1) > 0 ? 'margin' : 'open' },
    { id: t2.id, item: `${t2.name} (${t2.measures})`, allocated: `${at(t2.measures).fn} at ${at(t2.measures).phy}`, evidence: `worst case ${wceOf(t2)} ${t2.unit} against ${t2.threshold}: margin ${marginOf(t2).toFixed(1)} ${t2.unit}`, verdict: marginOf(t2) > 0 ? 'margin' : 'open' },
    { id: t3.id, item: `${t3.name} (${t3.measures})`, allocated: `${at(t3.measures).fn} at ${at(t3.measures).phy}; the quantity depends on the battery in PHY-001`, evidence: `worst case ${wceOf(t3)} ${t3.unit} against ${t3.threshold}: margin ${marginOf(t3).toFixed(1)} points`, verdict: marginOf(t3) > 0 ? 'margin' : 'open' },
    { id: 'REQ-SYS-008', item: 'no-go flag within 2 min', allocated: `${at('REQ-SYS-008').fn} at ${at('REQ-SYS-008').phy}`, evidence: 'an information path exists, IF-013 from aircraft to maintenance and IF-012 on to dispatch, independent of a procedure; but an interface says nothing about latency: the 2 min needs a latency budget across both hops, owned by Week 5', verdict: 'open' },
    { id: 'R-007', item: 'dispatch platform outage', allocated: 'PHY-004 with a hot standby (DEC-002)', evidence: 'failover and a manual procedure; failover time to be shown within the 60 s assignment window', verdict: 'open' },
    { id: 'R-009', item: 'intrusion into the operations platform', allocated: 'PHY-007 separated from the dispatch segment of PHY-004', evidence: 'a condition of DEC-002, to be written into the Week 5 interface definition of IF-008', verdict: 'open' },
    { id: 'CRIT-003', item: 'capacity retained after loss of one hub', allocated: `${CONFIGURATION.hubs} hubs in PHY-002`, evidence: `${retained.toFixed(0)} % of capacity retained (Week 3 trade, ${criterion('CRIT-003').name.toLowerCase()})`, verdict: 'meets' },
    { id: 'REQ-STK-016', item: 'auditable record of every flight', allocated: `${at('REQ-STK-016').fn} at ${at('REQ-STK-016').phy}`, evidence: 'pad incident records from PHY-008 have no route to the log', verdict: 'open' },
  ]
  return rows
})()

// ================================================================================================ audit findings
export const FINDINGS: { id: string; where: string; finding: string; proposed: string; owner: string }[] = [
  { id: 'F1', where: 'INFO-004, IF-011', finding: 'The weather item’s producer and the interface end were Weather (EXT-003), a natural system with no owner; the weather service appeared only in a note. A system can only exchange information with another system.', proposed: 'Make the weather information service an external system of its own (EXT-007), the producer and the end of IF-011: a refinement of the reference’s note, not a reversal.', owner: 'instructor to confirm' },
  { id: 'F2', where: 'INFO-005', finding: 'The financial item flowed from a logical element to a decision record, mixing three kinds of element in one flow.', proposed: 'Producers PHY-007 and PHY-004, consumer PHY-004 (network planning); the decision named in the decision field. IF-008 must then also carry fare revenue (Week 5).', owner: 'instructor to confirm' },
  { id: 'F3', where: 'INFO-006, FN-016', finding: 'Pad incident records from the fire detection system have no route to the evidence log: no interface joins PHY-008 and PHY-004. This gap is in the item Week 4 proposes, not in the reference.', proposed: 'Week 5 decides: a new information interface, or a relay through the vertiport systems.', owner: 'Week 5' },
  { id: 'F4', where: 'FN-013', finding: 'The planning function has no requirement allocated: capacity planning serves REQ-STK-004 only through other functions.', proposed: 'Record it as a planning function with a reason; no requirement is invented for it.', owner: 'accepted' },
  { id: 'F5', where: 'functional view', finding: 'No system modes are defined, although a functional view lists how functions vary by mode.', proposed: 'Normal, weather-hold and degraded (standby) modes, modeled in Week 10.', owner: 'Week 10' },
]

// ================================================================================================ feeds forward
export const FEEDS_FORWARD: { artifact: string; week: string; how: string }[] = [
  { artifact: 'Physical view and the information routes', week: 'Week 5', how: 'components and every interface defined; the missing incident route (F3) and IF-008’s extra item resolved' },
  { artifact: 'Enterprise view and DEC-002', week: 'Week 6', how: 'as-is and to-be views of the evolution roadmap: autonomy, on-site storage, a second platform' },
  { artifact: 'The whole architecture description', week: 'Week 7', how: 'the architecture section of the Systems Thinking Engineering Package' },
  { artifact: 'Functions, scenarios and logical elements', week: 'Week 10', how: 'action definitions with inputs and outputs, use cases, parts that perform actions; modes added' },
  { artifact: 'Physical elements and the allocations', week: 'Week 11', how: 'parts and allocations in the physical model' },
  { artifact: 'Information items and their decisions', week: 'Week 12', how: 'the digital thread from requirement to evidence' },
  { artifact: 'The viewpoints and their purposes', week: 'Week 14', how: 'stakeholder views of the team’s enterprise model' },
]

// ================================================================================================ links and counts
/** Every id the Week 4 case may point at. Used by the tests to prove every trace resolves. */
export const KNOWN_IDS = new Set<string>([
  ...STAKEHOLDERS.map((s) => s.id), ...CONCERNS.map((c) => c.id), ...NEEDS.map((n) => n.id), ...CAPABILITIES.map((c) => c.id), ...SCENARIOS.map((s) => s.id),
  ...ALL_REQUIREMENTS.map((r) => r.id), ...MOES.map((x) => x.id), ...RISKS.map((r) => r.id), ...TPMS.map((t) => t.id), 'DEC-001', 'CRIT-003',
  ...VIEWPOINTS.map((v) => v.id), ...GROUPS.map((g) => g.id), ...FUNCTIONS.map((f) => f.id), ...LOGICAL.map((l) => l.id), ...PHYSICAL.map((p) => p.id),
  ...W4_EXTERNALS.map((x) => x.id), ...INFORMATION.map((x) => x.id), ...AI_CAPABILITIES.map((x) => x.id), ...INTERFACES.map((x) => x.id), ARCH_DECISION.id,
])
/** Counts used in the notes and on the slides, computed here so no note types a number. */
export const COUNTS = {
  viewpoints: VIEWPOINTS.length,
  concerns: CONCERNS.length,
  concernsCovered: CONCERN_COVERAGE.filter((c) => c.viewpoints.length).length,
  groups: GROUPS.length,
  functions: FUNCTIONS.length,
  referenceFunctions: REFERENCE_FUNCTIONS.length,
  proposedFunctions: PROPOSED_FUNCTIONS.length,
  capabilities: CAPABILITIES.length,
  capabilitiesServed: CAPABILITIES.filter((c) => functionsOfCapability(c.id).length).length,
  systemRequirements: SYSTEM_REQUIREMENTS.length,
  systemAllocated: SYSTEM_REQUIREMENTS.filter((r) => allocationOfRequirement(r.id).length).length,
  stakeholderRequirements: STAKEHOLDER_REQUIREMENT_IDS.length,
  stakeholderNoChild: STAKEHOLDER_REQUIREMENT_IDS.filter((r) => stakeholderRequirementAccount(r) === 'no-child').length,
  logical: LOGICAL.length,
  physical: PHYSICAL.length,
  functionlessPhysical: PHYSICAL.filter((p) => !functionsOfPhysical(p.id).length).map((p) => p.id),
  information: INFORMATION.length,
  routes: ROUTE_CHECK.length,
  routesCovered: ROUTE_CHECK.filter((r) => r.covered).length,
  informationReference: INFORMATION.filter((x) => x.provenance === 'reference').length,
  informationCorrected: INFORMATION.filter((x) => x.provenance === 'corrected').length,
  informationProposed: INFORMATION.filter((x) => x.provenance === 'proposed').length,
  crossFlows: flowCheck().length,
  crossFlowsListed: flowCheck().filter((x) => x.status !== 'unlisted').length,
  crossFlowsCovered: flowCheck().filter((x) => x.status === 'covered').length,
  /** Stakeholder requirements allocated straight to a function, with no system requirement between (a concept-level
   *  shortcut; Week 5 derives the system requirement). */
  stakeholderDirect: STAKEHOLDER_REQUIREMENT_IDS.filter((r) => stakeholderRequirementAccount(r) === 'allocated').length,
  ai: AI_CAPABILITIES.length,
  humanOperations: FUNCTIONS.filter((f) => f.human).length,
}
export { scenario, STK_DISPOSITIONS }
