// AeroLink Week 2 case: ConOps, operational scenarios, capabilities, stakeholder and system requirements, the quality
// critique, the trace audit and the measures. The single source for the Week 2 lecture (session1.ts, session2.ts), its
// figures (src/components/figures/LectureWeek2S1.tsx, LectureWeek2S2.tsx), the worked-examples page and the tests
// (aerolinkCase.test.ts). Exported names are kept stable; fields are only ever added.
//
// Review status: new-pending-review. Written 2026-10-19 from the Week 2 lecture outline
// (docs/lectures/week02/WEEK02_LECTURE_OUTLINE.md §4).
//
// AeroLink Urban Mobility is FICTIONAL. Every number, name and statement is a teaching value, not a real-world claim.
//
// Provenance. Week 1 data are IMPORTED, never retyped: the corrected needs (NEED-001..017, in the recommended form), stakeholders,
// external systems, mission and goals and the noise agreement come from ../week01/aerolinkCase.ts (read-only). Week 2
// data start from the instructor reference: src/model/reference/week03.ts (MGO-005..008, CAP-001..010, SCN-001..005,
// A-008), week02.ts (U-001, A-001, A-007), week04.ts (REQ-STK-001..010, REQ-SYS-001..010, U-002), week05.ts
// (MOE-001..006, MOP-001..009) and src/activities/week04/critique.ts (drafts F1..F6). Spelling is American here
// (the reference keeps some British spellings). TPMs are taught in Week 3 (DECISION_LOG A21 item 5) and are not listed.
//
// The corrections this module makes, each `provenance: 'proposed'` (instructor to confirm):
//   - the corrected NEED-003 bounds the NUMBER of evening and early-morning events as well as the loudness of each, so
//     CAP-007 reads "within both agreed limits", and the cap flows down: REQ-STK-011 (event cap, TBD-03, U-003),
//     REQ-SYS-011 (scheduling enforces it), MOE-007 and MOP-010;
//   - the needs added in the Week 1 review (NEED-012..017) gain capabilities (CAP-011..014) and stakeholder
//     requirements (REQ-STK-012..017), and REQ-SYS-012 allocates the fare display;
//   - NEED-013 (workload) gains REQ-STK-015 with TBD-04 (U-004).
//   - (review M2) NEED-011 moves from CAP-005 to a proposed CAP-015 (disruption notice and re-accommodation), so no
//     requirement reaches NEED-011 by any trace path; (review M3) the scenario badges list every capability a scenario
//     exercises, consistent with NEED_COVERAGE; (review M10) MOE-008 and MOE-009 give MOP-008 and MOP-009 true parents.
// Exactly ONE need is left without a requirement, on purpose: NEED-011 (prompt notice and a way onward), exposed by
// writing scenario SCN-005. It is the declared deliberate gap of the trace audit (DELIBERATE_REQ_GAP): a missing
// requirement, not a missing link. The audit rule (AUDIT_RULE): a need is covered only by a stakeholder requirement
// that names it as a parent; no requirement reaches NEED-011 through any path (tested). No requirement is an orphan: every requirement traces, through its parents, to a
// Week 1 need (tested).
import { EXTERNAL_SYSTEMS, MISSION_GOALS, NEEDS, NOISE_AGREEMENT, PROBLEM_STATEMENT, need, type CaseProvenance } from '../week01/aerolinkCase'

export const AEROLINK_W2_REVIEW = 'new-pending-review' as const
export { NEEDS, need }

// ------------------------------------------------------------------------------------------------ objectives
/** The objectives under the goals (reference/week03.ts, American spelling). MGO-001..004 and MGO-009 are the mission
 *  and goals of the Week 1 case (MISSION_GOALS); the objectives add a measure and a target. */
export const OBJECTIVES: { id: string; goal: string; name: string; text: string }[] = [
  { id: 'MGO-005', goal: 'MGO-002', name: '90 % boarded within 15 min', text: 'From month 6 onward, at least 90 % of passengers in each calendar month board within 15 min of confirming their ride.' },
  { id: 'MGO-006', goal: 'MGO-003', name: 'No pad-edge noise exceedance', text: 'Zero take-off or landing events above 65 dBA at any vertiport pad edge in each quarter.' },
  { id: 'MGO-007', goal: 'MGO-004', name: 'Year-2 capacity with headroom', text: 'By month 24, serve the planning demand of 240 trips/day at a fleet utilization of no more than 80 %, that is, provide at least 300 trips/day of capacity.' },
  { id: 'MGO-008', goal: 'MGO-009', name: 'Zero dispatches outside limits', text: 'Zero flights dispatched outside the approved weather, energy-reserve or airworthiness limits in each quarter.' },
]
export const MISSION = MISSION_GOALS.find((m) => m.level === 'mission')!

// ------------------------------------------------------------------------------------------------ the ConOps
/** The system of interest FOR SCENARIOS (reference/week03.ts): narrower than Week 1's SOI-001 (the service, including its
 *  people). People are users outside it, so they appear as actors (R59 p.453). A deliberate scoping choice. */
export const SCENARIO_SOI = {
  name: 'AeroLink operational system',
  includes: ['aircraft', 'booking, scheduling and dispatch systems', 'operations-support tools'],
  outside: 'passengers, pilots and remote operators, operations-center staff, vertiport staff and technicians, and every external system',
  why: 'Actors are parties outside the system, so the boundary decides who is an actor. Drawing the scenario boundary around the operational system keeps the people who use it visible as actors in every step; Week 1’s system of interest, the air-taxi service, includes those people.',
}

/** The operational environment as the ConOps states it (FICTIONAL Data Sheet values; proposed items marked). */
export const CONOPS_ENVIRONMENT: { label: string; value: string; provenance: CaseProvenance }[] = [
  { label: 'Network', value: '6 vertiports in one metropolitan region, 2 chargers each; 3 hubs carry turnaround charging', provenance: 'reference' },
  { label: 'Fleet', value: '12 eVTOL aircraft at opening, 4 passenger seats each; the growth to about 15 aircraft needed for 300 trips/day by month 24 is sized in the Week 3 trade study (growth proposed)', provenance: 'reference' },
  { label: 'Operating day', value: '16 h, 06:00–22:00 (clock times proposed)', provenance: 'proposed' },
  { label: 'Typical trip', value: '25 km at 150 km/h: about 10 min cruise, 16 min block time', provenance: 'reference' },
  { label: 'Turnaround', value: '20 min charge to the dispatch threshold; 25 min hub turnaround including 5 min pad work', provenance: 'reference' },
  { label: 'Energy policy', value: 'every flight planned to land with at least 20 % usable energy', provenance: 'reference' },
  { label: 'Noise', value: '65 dBA per take-off or landing at the pad edge; an event cap before 07:00 and after 20:00 (proposed)', provenance: 'proposed' },
  { label: 'Weather', value: 'approved aircraft weather limits not yet published (TBD-01, U-001)', provenance: 'reference' },
]

export const CONOPS = {
  /** MITRE's critical component 1: the existing situation the user wants to replace (R52 p.301). */
  existing: 'Cross-town trips of 15–40 km go by car, ride-hail or public transport: 45–70 minutes at peak hours, with no quick, predictable option (FICTIONAL, proposed).',
  /** Component 2: justification, with its restrictions. */
  justification: 'A quick, predictable air option for those trips, introduced without exceeding what the communities, the grid and the airspace can accept.',
  restrictions: ['the local noise agreement (both limits)', 'the agreed grid connection at each vertiport (TBD-02)', 'access to controlled airspace through the air traffic service', 'the approved aircraft weather and energy-reserve limits'],
  /** Component 3: a description of the proposed system, in the users' language. */
  proposed: 'A passenger books a seat between any two of the six vertiports, is told the fare and the boarding time, boards step-free at the pad, flies for about ten minutes and lands at the destination vertiport. Operations staff schedule and dispatch the fleet, recharge aircraft between flights at the hubs, keep every aircraft’s condition known, and hold or divert flights when the weather approaches the limits.',
  userInteractions: ['Passengers: request, book, board, fly, alight; receive notices when a trip changes', 'Pilots and remote operators: plan, fly and divert flights; file flight intent', 'Operations-center duty manager: declare and lift weather holds; re-time the backlog', 'Vertiport operators: board passengers, connect and disconnect chargers', 'Maintenance technicians: classify faults, repair, sign the return to service'],
  problem: PROBLEM_STATEMENT,
  noise: NOISE_AGREEMENT,
  externalSystems: EXTERNAL_SYSTEMS.map((e) => e.id),
}

// ------------------------------------------------------------------------------------------------ scenarios
export type ScenarioKind = 'nominal' | 'off-nominal' | 'support'
export type ScenarioStep = { n: number; actor: string; text: string }
export type AlternateFlow = { id: string; fromStep: number; condition: string; response: string; outcome: { rejoin: number } | 'ends' }
export type CaseScenario = {
  id: string
  name: string
  kind: ScenarioKind
  /** Course grid row (S1.12): what part of the life cycle it exercises. */
  area: 'operation' | 'logistics and maintenance' | 'exceptional'
  summary: string
  primary: string
  /** Actors outside the scenario system of interest; environmental factors carry environment: true. */
  actors: { id: string; label: string; environment?: boolean }[]
  trigger: string
  preconditions: string
  steps: ScenarioStep[]
  alternates: AlternateFlow[]
  success: string
  failure: string
  /** Every capability it exercises: the reference links (SCN derives-from CAP) plus, as instructor additions, the
   *  capabilities whose needs NEED_COVERAGE marks as exercised by this scenario's steps (review M3), so the badges and
   *  the coverage matrix agree. */
  capabilities: string[]
}

const SYS = 'System'
const DM = 'Duty manager'

export const SCENARIOS: CaseScenario[] = [
  {
    id: 'SCN-001', name: 'Passenger Ride Request', kind: 'nominal', area: 'operation',
    summary: 'A passenger requests a ride and receives a confirmed booking with an assigned aircraft and boarding time.',
    primary: 'STK-001',
    actors: [{ id: 'STK-001', label: 'Passenger (primary)' }, { id: 'AGENT', label: 'Customer services agent' }],
    trigger: 'A passenger asks for a ride between two vertiports.',
    preconditions: 'The passenger has an account; the request is made within the 16 h operating day; at least one aircraft in the network is dispatch-ready.',
    steps: [
      { n: 1, actor: 'Passenger', text: 'Enters the origin and destination vertiports and the party size (1–4).' },
      { n: 2, actor: SYS, text: 'Checks weather status and capacity at both vertiports.' },
      { n: 3, actor: SYS, text: 'Quotes the fare and an estimated boarding time.' },
      { n: 4, actor: 'Passenger', text: 'Confirms the booking.' },
      { n: 5, actor: SYS, text: 'Assigns a dispatch-ready aircraft within 60 s of confirmation.' },
      { n: 6, actor: SYS, text: 'Issues a boarding pass with the pad and the boarding time.' },
    ],
    alternates: [
      { id: 'A1', fromStep: 2, condition: 'No aircraft can board the party within 15 min', response: 'Offer the next available slot or a waitlist.', outcome: { rejoin: 3 } },
      { id: 'A2', fromStep: 2, condition: 'The destination vertiport is under a weather hold (SCN-005)', response: 'Offer the nearest open vertiport, or decline the request with the reason recorded.', outcome: 'ends' },
      { id: 'A3', fromStep: 4, condition: 'The party includes a wheelchair user who asks for assistance', response: 'The customer services agent confirms the step-free route at both vertiports and completes the booking with the passenger.', outcome: { rejoin: 5 } },
    ],
    success: 'Confirmed booking with an assigned aircraft and a boarding time.',
    failure: 'Request declined, with the reason recorded and an alternative offered.',
    capabilities: ['CAP-002'],
  },
  {
    id: 'SCN-002', name: 'Passenger Transport Mission', kind: 'nominal', area: 'operation',
    summary: 'A booked party is flown 25 km between two vertiports and the aircraft is handed to charging.',
    primary: 'STK-001',
    actors: [{ id: 'STK-001', label: 'Passenger (primary)' }, { id: 'STK-008', label: 'Pilot or remote operator' }, { id: 'EXT-001', label: 'Air traffic service (controlled airspace)' }, { id: 'STK-005', label: 'Vertiport operator' }],
    trigger: 'The boarding time of a confirmed booking (SCN-001) is reached.',
    preconditions: 'Booking confirmed; aircraft dispatch-ready (charged to the dispatch threshold, no open no-go fault); forecast weather within limits at both vertiports.',
    steps: [
      { n: 1, actor: SYS, text: 'Plans the flight with at least 20 % usable energy at landing.' },
      { n: 2, actor: SYS, text: 'Files the flight intent with the air traffic service.' },
      { n: 3, actor: 'Air traffic service', text: 'Accepts the flight intent.' },
      { n: 4, actor: 'Vertiport operator', text: 'Boards the party step-free at the departure pad.' },
      { n: 5, actor: 'Pilot', text: 'Takes off within the pad-edge noise limit and cruises for about 10 min at 150 km/h.' },
      { n: 6, actor: 'Pilot', text: 'Approaches and lands at the destination pad.' },
      { n: 7, actor: 'Passenger', text: 'Deplanes at the destination; the aircraft passes to charging (SCN-003).' },
    ],
    alternates: [
      { id: 'A1', fromStep: 6, condition: 'The destination pad is occupied', response: 'Hold, or divert to the nearest open vertiport within the energy reserve.', outcome: { rejoin: 7 } },
      { id: 'A2', fromStep: 4, condition: 'A passenger does not show', response: 'Depart on time with the remaining party.', outcome: { rejoin: 5 } },
      { id: 'A3', fromStep: 3, condition: 'The air traffic service does not accept the flight intent', response: 'Hold the departure and re-file; if no acceptance is given, cancel and re-accommodate the party.', outcome: 'ends' },
    ],
    success: 'Passengers delivered; flight data logged; the aircraft on the destination pad with at least 20 % usable energy remaining.',
    failure: 'Flight not flown, or landed at an alternate vertiport, with the party re-accommodated and no flight outside limits.',
    capabilities: ['CAP-001', 'CAP-004', 'CAP-007'],
  },
  {
    id: 'SCN-003', name: 'Aircraft Charging', kind: 'support', area: 'logistics and maintenance',
    summary: 'An arrived aircraft is charged to the dispatch threshold in 20 min and is dispatch-ready within the 25 min hub turnaround.',
    primary: 'STK-005',
    actors: [{ id: 'STK-005', label: 'Vertiport operator (primary)' }, { id: 'FLEET', label: 'Fleet controller' }, { id: 'EXT-002', label: 'Electric grid' }],
    trigger: 'An aircraft lands on a hub pad at the end of SCN-002.',
    preconditions: 'A turnaround charger is free; the vertiport power limit (TBD-02) is configured.',
    steps: [
      { n: 1, actor: 'Vertiport operator', text: 'Connects the charger after rotor stop and the safety check.' },
      { n: 2, actor: SYS, text: 'Sets charging power within the vertiport connection limit.' },
      { n: 3, actor: SYS, text: 'Charges the battery to the dispatch threshold within 20 min while passengers deplane and board.' },
      { n: 4, actor: SYS, text: 'Records the charge session (energy, cell temperatures).' },
      { n: 5, actor: 'Vertiport operator', text: 'Disconnects the charger.' },
      { n: 6, actor: 'Fleet controller', text: 'Releases the aircraft as dispatch-ready.' },
    ],
    alternates: [
      { id: 'A1', fromStep: 1, condition: 'Both hub chargers are occupied', response: 'Queue the aircraft, or reposition it to another hub; scheduling re-times the next departure.', outcome: { rejoin: 1 } },
      { id: 'A2', fromStep: 2, condition: 'The electric grid signals a curtailment', response: 'Charge at reduced power for longer and notify scheduling of the later release.', outcome: { rejoin: 4 } },
      { id: 'A3', fromStep: 3, condition: 'A cell over-temperature alarm sounds', response: 'Stop charging, isolate the aircraft and start the fire-response procedure.', outcome: 'ends' },
    ],
    success: 'Aircraft dispatch-ready within the 25 min hub turnaround.',
    failure: 'Aircraft withdrawn from service, or released late, with the reason recorded.',
    capabilities: ['CAP-003', 'CAP-010', 'CAP-009'],
  },
  {
    id: 'SCN-004', name: 'Maintenance Event', kind: 'support', area: 'logistics and maintenance',
    summary: 'A fault is reported or predicted; the aircraft is withheld, repaired and returned to service.',
    primary: 'STK-009',
    actors: [{ id: 'STK-009', label: 'Maintenance technician (primary)' }, { id: 'FLEET', label: 'Fleet controller' }, { id: 'EXT-004', label: 'Aircraft and spares supply' }],
    trigger: 'Aircraft health monitoring reports a fault, or predictive maintenance flags one.',
    preconditions: 'The aircraft is in service; maintenance records and the approved deferral rules are available.',
    steps: [
      { n: 1, actor: 'Technician', text: 'Classifies the fault as go or no-go.' },
      { n: 2, actor: SYS, text: 'Flags a no-go aircraft unavailable for dispatch within 2 min of the report.' },
      { n: 3, actor: 'Fleet controller', text: 'Reassigns the affected bookings to other aircraft.' },
      { n: 4, actor: 'Technician', text: 'Moves the aircraft to the maintenance facility and repairs it.' },
      { n: 5, actor: 'Technician', text: 'Signs the return-to-service record.' },
      { n: 6, actor: SYS, text: 'Restores the aircraft’s availability.' },
    ],
    alternates: [
      { id: 'A1', fromStep: 4, condition: 'The part is not in stock', response: 'Order it from the aircraft and spares supply; the aircraft stays out of service and the capacity plan is updated.', outcome: 'ends' },
      { id: 'A2', fromStep: 1, condition: 'The fault is deferrable', response: 'Allow dispatch under a recorded deferral with its limits.', outcome: 'ends' },
    ],
    success: 'Aircraft returned to service with complete records.',
    failure: 'Aircraft out of service with an expected return date, or in service under a recorded deferral.',
    capabilities: ['CAP-006'],
  },
  {
    id: 'SCN-005', name: 'Weather Disruption', kind: 'off-nominal', area: 'exceptional',
    summary: 'Forecast weather approaches the aircraft limits at a vertiport; flights are held or diverted and the backlog is recovered.',
    primary: 'DM',
    actors: [{ id: 'DM', label: 'Operations-center duty manager (primary)' }, { id: 'STK-001', label: 'Passenger' }, { id: 'STK-008', label: 'Pilot or remote operator' }, { id: 'EXT-001', label: 'Air traffic service (controlled airspace)' }, { id: 'EXT-003', label: 'Weather', environment: true }],
    trigger: 'The forecast for a vertiport crosses a weather limit within the next 30 min (limits TBD-01, U-001).',
    preconditions: 'Flights are scheduled and some are airborne; weather data are received for all six vertiports; alternates and the 20 % energy reserve policy are in force.',
    steps: [
      { n: 1, actor: SYS, text: 'Flags vertiport V3 as approaching its weather limits and lists the affected departures, arrivals and airborne flights.' },
      { n: 2, actor: DM, text: 'Declares a weather hold for V3: no departures to or from V3.' },
      { n: 3, actor: 'Pilot', text: 'Diverts each airborne flight bound for V3 to its planned alternate within the energy reserve.' },
      { n: 4, actor: 'Air traffic service', text: 'Accepts the revised flight intents for the diverted flights.' },
      { n: 5, actor: SYS, text: 'Notifies affected passengers of a new boarding time, an alternate vertiport or a refund.' },
      { n: 6, actor: 'Passenger', text: 'Each affected passenger accepts a new time or vertiport, or takes the refund.' },
      { n: 7, actor: DM, text: 'Lifts the hold when the forecast has been back inside limits for 30 min; the backlog is re-timed.' },
    ],
    alternates: [
      { id: 'A1', fromStep: 3, condition: 'Conditions at the alternate also approach limits while the aircraft is airborne', response: 'Divert to the nearest open vertiport within the reserve; if none is reachable within the reserve, declare a priority landing with the air traffic service.', outcome: { rejoin: 5 } },
      { id: 'A2', fromStep: 2, condition: 'Two or more vertiports reach limits (region-wide event)', response: 'Suspend all departures network-wide; land airborne flights at the nearest open vertiport; offer passengers public transport (EXT-005).', outcome: 'ends' },
      { id: 'A3', fromStep: 7, condition: 'The hold lasts longer than 2 h', response: 'Cancel the remaining bookings to V3 for the day and refund; reposition aircraft for the next morning.', outcome: 'ends' },
    ],
    success: 'All aircraft on the ground or safely diverted; no flight dispatched outside limits; the backlog flown within the day.',
    failure: 'Service at V3 suspended for the day with every affected passenger re-accommodated or refunded and no flight outside limits.',
    capabilities: ['CAP-005', 'CAP-015'],
  },
]

export const scenario = (id: string): CaseScenario => {
  const s = SCENARIOS.find((x) => x.id === id)
  if (!s) throw new Error(`unknown scenario ${id}`)
  return s
}

/** Candidate scenarios the coverage grid shows as empty cells (instructor synthesis, S1.12). */
export const CANDIDATE_SCENARIOS = [
  { name: 'Region-wide power cut', kind: 'off-nominal' as ScenarioKind, area: 'exceptional' as const, why: 'Exercises NEED-010 and NEED-006 when the grid, not the weather, stops the network.' },
  { name: 'A passenger who books and cancels repeatedly', kind: 'off-nominal' as ScenarioKind, area: 'operation' as const, why: 'A good actor doing something bad to the system: does capacity planning still hold?' },
]

// ------------------------------------------------------------------------------------------------ what writing SCN-005 exposed
/** The discovery log of SCN-005 (S1.15): each exposed item goes into the needs set or the uncertainty register. */
export const DISCOVERIES: { scenario: string; where: string; kind: 'need' | 'assumption' | 'unknown'; id: string; text: string; goesTo: string }[] = [
  { scenario: 'SCN-005', where: 'step 5', kind: 'need', id: 'NEED-011', text: need('NEED-011').statement, goesTo: 'the needs set (Week 1 Part 5, revised)' },
  { scenario: 'SCN-005', where: 'alternate A2', kind: 'assumption', id: 'A-008', text: 'Public transport can carry stranded passengers onward from the vertiports during a region-wide suspension; no agreement with the transport authority confirms it yet.', goesTo: 'the uncertainty register (assumption, with an owner and a validation step)' },
  { scenario: 'SCN-005', where: 'trigger', kind: 'unknown', id: 'U-001', text: 'The approved crosswind, gust and visibility limits are not published, so the trigger cannot be stated as a number; requirements carry the value as TBD-01.', goesTo: 'the uncertainty register (unknown U-001, carried as TBD-01)' },
]

// ------------------------------------------------------------------------------------------------ needs × scenarios coverage
export type CoverageStatus = 'exercised' | 'weak' | 'constraint' | 'planning' | 'finding'
/** Instructor reading of the reference flows (S1.16; outline §4.3). `where` names the scenario steps. */
export const NEED_COVERAGE: { need: string; where: { scenario: string; steps: string }[]; status: CoverageStatus; note: string }[] = [
  { need: 'NEED-001', where: [{ scenario: 'SCN-001', steps: 'main flow, A1' }], status: 'exercised', note: '' },
  { need: 'NEED-002', where: [{ scenario: 'SCN-002', steps: 'step 1' }, { scenario: 'SCN-005', steps: 'steps 1–3' }], status: 'exercised', note: '' },
  { need: 'NEED-003', where: [{ scenario: 'SCN-002', steps: 'step 5' }], status: 'weak', note: 'Only the per-event limit is exercised; no step counts evening and early-morning events.' },
  { need: 'NEED-004', where: [{ scenario: 'SCN-003', steps: 'steps 1–6' }], status: 'exercised', note: '' },
  { need: 'NEED-005', where: [], status: 'planning', note: 'A planning need: no daily scenario exercises it; it points to a planning scenario or the Week 3 trade study.' },
  { need: 'NEED-006', where: [{ scenario: 'SCN-003', steps: 'A3' }], status: 'weak', note: 'The warning is exercised; responder access is not shown.' },
  { need: 'NEED-007', where: [{ scenario: 'SCN-004', steps: 'steps 1–2' }], status: 'exercised', note: '' },
  { need: 'NEED-008', where: [{ scenario: 'SCN-001', steps: 'A3' }, { scenario: 'SCN-002', steps: 'step 4' }], status: 'exercised', note: '' },
  { need: 'NEED-009', where: [{ scenario: 'SCN-002', steps: 'steps 2–3, A3' }, { scenario: 'SCN-005', steps: 'step 4' }], status: 'exercised', note: '' },
  { need: 'NEED-010', where: [{ scenario: 'SCN-003', steps: 'step 2, A2' }], status: 'exercised', note: '' },
  { need: 'NEED-011', where: [{ scenario: 'SCN-005', steps: 'steps 5–6' }], status: 'exercised', note: 'Exposed by writing this scenario.' },
  { need: 'NEED-012', where: [], status: 'constraint', note: 'A siting constraint, verified before operation: a reason, not a defect.' },
  { need: 'NEED-013', where: [{ scenario: 'SCN-005', steps: 'stress only' }], status: 'finding', note: 'SCN-005 loads the operators, but no step says how workload is limited: a finding.' },
  { need: 'NEED-014', where: [{ scenario: 'SCN-002', steps: 'success end state' }], status: 'weak', note: 'Only “flight data logged”; nothing shows the evidence insurers need.' },
  { need: 'NEED-015', where: [{ scenario: 'SCN-001', steps: 'step 3' }], status: 'exercised', note: '' },
  { need: 'NEED-016', where: [], status: 'constraint', note: 'A siting constraint, verified before operation: a reason, not a defect.' },
  { need: 'NEED-017', where: [{ scenario: 'SCN-001', steps: 'step 3' }], status: 'weak', note: 'The fare is quoted; whether it is competitive is not exercised.' },
]

// ------------------------------------------------------------------------------------------------ capabilities
export type CaseCapability = { id: string; name: string; text: string; needs: string[]; refines?: string; provenance: CaseProvenance }
export const CAPABILITIES: CaseCapability[] = [
  { id: 'CAP-001', name: 'On-demand passenger transport', text: 'Carry a booked party of 1–4 passengers between any two vertiports of the network on demand.', needs: ['NEED-001', 'NEED-008'], provenance: 'reference' },
  { id: 'CAP-002', name: 'Ride booking and dispatch', text: 'Accept a ride request, match it to a dispatch-ready aircraft and release the flight.', needs: ['NEED-001'], refines: 'CAP-001', provenance: 'reference' },
  { id: 'CAP-003', name: 'Fleet charging management', text: 'Return arriving aircraft to a dispatch-ready energy state within the turnaround time at hub vertiports.', needs: ['NEED-004'], provenance: 'reference' },
  { id: 'CAP-004', name: 'Flight operations within safety limits', text: 'Plan, coordinate and fly each flight within approved airworthiness, energy-reserve and airspace limits.', needs: ['NEED-002', 'NEED-009'], provenance: 'reference' },
  { id: 'CAP-005', name: 'Weather-aware operations', text: 'Detect weather approaching limits and hold, divert or recover flights accordingly.', needs: ['NEED-002'], refines: 'CAP-004', provenance: 'corrected' },
  { id: 'CAP-006', name: 'Fleet health management', text: 'Know the condition of each aircraft and its battery, and withhold unfit aircraft from dispatch.', needs: ['NEED-007', 'NEED-002'], provenance: 'reference' },
  { id: 'CAP-007', name: 'Noise-managed vertiport operations', text: 'Operate take-offs and landings so that noise at nearby homes stays within both agreed limits: the level of each event and the number of events in the noise-sensitive hours.', needs: ['NEED-003'], provenance: 'corrected' },
  { id: 'CAP-008', name: 'Capacity planning', text: 'Forecast demand and plan fleet and charging capacity to meet it.', needs: ['NEED-005'], provenance: 'reference' },
  { id: 'CAP-009', name: 'Incident response support', text: 'Detect vertiport incidents and give emergency responders warning and safe access.', needs: ['NEED-006'], provenance: 'reference' },
  { id: 'CAP-010', name: 'Charging power control', text: 'Schedule and limit charging power so that each vertiport stays within its grid connection.', needs: ['NEED-010', 'NEED-004'], refines: 'CAP-003', provenance: 'reference' },
  { id: 'CAP-011', name: 'Site compliance', text: 'Select and keep vertiport sites that conform to the land-use plan and connect with public transport.', needs: ['NEED-012', 'NEED-016'], provenance: 'proposed' },
  { id: 'CAP-012', name: 'Workload-managed operations', text: 'Assign and support flights so that each operator’s workload stays within agreed limits, including in disruptions.', needs: ['NEED-013'], provenance: 'proposed' },
  { id: 'CAP-013', name: 'Operational risk evidence', text: 'Record flight, incident and maintenance evidence from which operational risk can be measured.', needs: ['NEED-014'], provenance: 'proposed' },
  { id: 'CAP-014', name: 'Fare transparency and competitiveness', text: 'Price trips competitively with ground alternatives and show the full fare before a booking is confirmed.', needs: ['NEED-015', 'NEED-017'], provenance: 'proposed' },
  { id: 'CAP-015', name: 'Disruption notice and re-accommodation', text: 'Tell passengers promptly when a confirmed trip is held, diverted or cancelled, and re-accommodate them on a usable way onward.', needs: ['NEED-011'], provenance: 'proposed' },
]
/** The reference reads CAP-005 as tracing NEED-002 and NEED-011; the case moves NEED-011 to CAP-015 because weather
 *  handling does not oblige anyone to tell passengers anything (review M2). */
export const CAP005_REFERENCE_NEEDS = ['NEED-002', 'NEED-011'] as const
/** The reference reads CAP-007 as "pad-edge noise within the local agreement": per-event only (the reference text). */
export const CAP007_REFERENCE_TEXT = 'Operate take-offs and landings so that pad-edge noise stays within the local agreement.'

export const capability = (id: string): CaseCapability => {
  const c = CAPABILITIES.find((x) => x.id === id)
  if (!c) throw new Error(`unknown capability ${id}`)
  return c
}
/** Scenario badges per capability (reference links SCN derives-from CAP). */
export const scenariosOfCapability = (cap: string) => SCENARIOS.filter((s) => s.capabilities.includes(cap)).map((s) => s.id)

// ------------------------------------------------------------------------------------------------ uncertainty items
export const UNCERTAINTIES: { id: string; kind: 'unknown' | 'assumption'; name: string; tbx?: string; owner: string; closeBy: string; provenance: CaseProvenance }[] = [
  { id: 'U-001', kind: 'unknown', name: 'Aircraft weather limits not yet published', tbx: 'TBD-01', owner: 'Director of Flight Operations', closeBy: 'Obtain the limits from the manufacturer’s draft flight manual before the Week 7 package baseline', provenance: 'reference' },
  { id: 'U-002', kind: 'unknown', name: 'Vertiport grid connection limit not agreed', tbx: 'TBD-02', owner: 'Vertiport Infrastructure Manager', closeBy: 'A connection agreement with the utility for each vertiport, before the Week 3 trade study', provenance: 'reference' },
  { id: 'U-003', kind: 'unknown', name: 'Evening and early-morning event cap not agreed with the city', tbx: 'TBD-03', owner: 'Head of Community Relations', closeBy: 'Negotiate the cap per pad with the city planning authority and community consultation, before the Week 3 trade study closes', provenance: 'proposed' },
  { id: 'U-004', kind: 'unknown', name: 'Simultaneous-flight limit per remote operator not established', tbx: 'TBD-04', owner: 'Director of Flight Operations', closeBy: 'A workload analysis of SCN-005 with operators, in the Week 3 trade study', provenance: 'proposed' },
  { id: 'U-005', kind: 'unknown', name: 'Walking distance to public transport the city applies to sites (400 m, low confidence)', tbx: 'TBR-01', owner: 'Head of Partnerships', closeBy: 'Confirm the distance with the city planning authority before site applications', provenance: 'proposed' },
  { id: 'U-006', kind: 'unknown', name: 'Acceptable fare ratio to ride-hail (2.0, low confidence)', tbx: 'TBR-02', owner: 'Head of Customer Experience', closeBy: 'Relate fare to demand in the Week 3 trade study', provenance: 'proposed' },
  { id: 'A-008', kind: 'assumption', name: 'Public-transport fallback is available during weather holds', owner: 'Head of Partnerships', closeBy: 'A written arrangement with the transport authority before service starts', provenance: 'reference' },
]

// ------------------------------------------------------------------------------------------------ requirements
export type ReqType = 'functional' | 'performance' | 'interface' | 'constraint'
export type VerMethod = 'inspection' | 'analysis' | 'demonstration' | 'test'
export type CaseRequirement = {
  id: string
  level: 'stakeholder' | 'system'
  name: string
  statement: string
  type: ReqType
  method: VerMethod
  criterion: string
  rationale: string
  /** NEED, CAP or REQ-STK IDs (reference week04.ts parents). */
  parents: string[]
  tbx?: string
  provenance: CaseProvenance
}

const stk = (id: string, name: string, statement: string, type: ReqType, method: VerMethod, criterion: string, rationale: string, parents: string[], provenance: CaseProvenance = 'reference', tbx?: string): CaseRequirement => ({ id, level: 'stakeholder', name, statement, type, method, criterion, rationale, parents, provenance, ...(tbx ? { tbx } : {}) })
const sys = (id: string, name: string, statement: string, type: ReqType, method: VerMethod, criterion: string, rationale: string, parents: string[], provenance: CaseProvenance = 'reference', tbx?: string): CaseRequirement => ({ id, level: 'system', name, statement, type, method, criterion, rationale, parents, provenance, ...(tbx ? { tbx } : {}) })

export const STAKEHOLDER_REQUIREMENTS: CaseRequirement[] = [
  stk('REQ-STK-001', 'Passenger wait to board', 'The AeroLink service shall board at least 90 % of passengers in each calendar month within 15 min of their ride confirmation.', 'performance', 'analysis', '90th-percentile confirmation-to-boarding time ≤ 15 min per calendar month', 'Attraction to the service halves at a 15 min wait (A-001); controlling the 90th percentile protects the passengers most likely to stop using the service, not just the average.', ['NEED-001', 'CAP-001']),
  stk('REQ-STK-002', 'Pad-edge noise limit', 'The AeroLink service shall keep every take-off and landing at or below 65 dBA LAmax at the pad edge of each vertiport.', 'constraint', 'test', 'LAmax ≤ 65 dBA at the pad edge for every movement', 'The 65 dBA limit is the local agreement with the city; an exceedance puts the operating permit of the vertiport at risk.', ['NEED-003', 'CAP-007']),
  stk('REQ-STK-003', 'No dispatch outside weather limits', 'The AeroLink service shall not dispatch a flight when the forecast at its departure or arrival vertiport exceeds the approved aircraft weather limits (TBD-01).', 'functional', 'demonstration', 'Zero dispatches with a forecast beyond TBD-01 at either end (limits pending U-001)', 'Weather beyond the approved limits removes the margin the certification basis assumes; the FAA needs assurance that the operation, not just the aircraft, respects those limits.', ['NEED-002', 'CAP-005'], 'reference', 'TBD-01'),
  stk('REQ-STK-004', 'Network capacity by month 24', 'The AeroLink service shall provide a capacity of at least 300 trips per day across the six-vertiport network within the 16 h operating day by month 24.', 'performance', 'analysis', 'Network capacity ≥ 300 trips/day by month 24', 'Serving the 240 trips/day planning demand at no more than 80 % utilization keeps the queue-driven wait near 10 min (Week 1 dynamics model); 240 / 0.8 = 300.', ['NEED-005', 'CAP-008']),
  stk('REQ-STK-005', 'Hub turnaround time', 'The AeroLink service shall return an aircraft arriving at a hub vertiport to dispatch-ready status within 25 min of its arrival on the pad.', 'performance', 'test', 'Pad arrival to dispatch-ready ≤ 25 min', 'Turnaround time sets how many departures a pad can support; 25 min is the 20 min Data Sheet charge plus 5 min for rotor stop, safety check, connection and disconnection, with deplaning and boarding overlapping the charge.', ['NEED-004', 'CAP-003']),
  stk('REQ-STK-006', 'No dispatch with an open no-go fault', 'The AeroLink service shall confirm that an aircraft has no open no-go fault before each dispatch.', 'functional', 'demonstration', 'Dispatch blocked in 100 % of demonstrated cases with an open no-go fault', 'Technicians need the aircraft condition to be known before release whatever the schedule pressure; a dispatch interlock removes the judgment call from the turnaround.', ['NEED-007', 'CAP-006']),
  stk('REQ-STK-007', 'Step-free boarding', 'The AeroLink service shall allow a passenger with reduced mobility to board and alight at every vertiport without being lifted.', 'constraint', 'inspection', 'Step-free route from terminal to cabin at all 6 vertiports', 'Lifting a passenger is unsafe and undignified and excludes passengers who travel with their own mobility aid.', ['NEED-008', 'CAP-001']),
  stk('REQ-STK-008', 'Responder alert time', 'The AeroLink service shall alert emergency responders to a battery fire on a vertiport pad within 60 s of detection.', 'performance', 'test', 'Detection-to-responder-alert ≤ 60 s', 'Lithium battery fires escalate within minutes; an early alert lets responders arrive with the right equipment.', ['NEED-006', 'CAP-009']),
  stk('REQ-STK-009', 'Flight intent to the air traffic service', 'The AeroLink service shall provide each flight’s intended route and departure time to the air navigation service provider before take-off.', 'interface', 'demonstration', 'Intent accepted by the ANSP for 100 % of demonstrated departures before take-off', 'The ANSP must know each flight before it enters controlled airspace to separate it from other traffic.', ['NEED-009', 'CAP-004']),
  stk('REQ-STK-010', 'Vertiport power within the grid connection', 'The AeroLink service shall keep the total charging power drawn at each vertiport within the connection capacity agreed with the utility (TBD-02 kW).', 'constraint', 'test', 'Peak vertiport charging power ≤ TBD-02 kW (pending U-002)', 'Exceeding the agreed connection trips protection or incurs penalty tariffs and erodes the relationship with the utility.', ['NEED-010', 'CAP-010'], 'reference', 'TBD-02'),
  // ---- proposed additions (instructor to confirm): the corrected NEED-003 and the needs added in the Week 1 review
  stk('REQ-STK-011', 'Evening and early-morning event cap', 'The AeroLink service shall limit take-offs and landings at each vertiport pad before 07:00 and after 20:00 to no more than the hourly number agreed with the city (TBD-03).', 'constraint', 'analysis', 'Movements per pad per hour before 07:00 and after 20:00 ≤ TBD-03, from the movement log, every operating day (cap pending U-003)', 'The corrected NEED-003 bounds how often residents are disturbed in the hours they rest as well as how loud each event is; REQ-STK-002 covers only the loudness. The cap is the shared variable of the REL-002 conflict with throughput, so it must be a number before the Week 3 trade can be run.', ['NEED-003', 'CAP-007'], 'proposed', 'TBD-03'),
  stk('REQ-STK-012', 'Full fare before confirmation', 'The AeroLink service shall show the passenger the full fare for the requested trip, including every charge, before the passenger confirms the booking.', 'functional', 'demonstration', 'Full fare displayed before the confirmation step in 100 % of demonstrated bookings, peak and off-peak', 'Passengers compare the fare with the alternatives before they commit (NEED-015); a charge revealed after confirmation loses the booking and the passenger’s trust.', ['NEED-015', 'CAP-014'], 'proposed'),
  stk('REQ-STK-013', 'Sites with land-use approval', 'The AeroLink service shall operate only from vertiport sites that hold a land-use approval from the city planning authority.', 'constraint', 'inspection', 'A current land-use approval on file for each of the 6 sites before its first revenue flight', 'The city planning authority grants or blocks sites; a site that breaches the land-use plan cannot be approved (NEED-012).', ['NEED-012', 'CAP-011'], 'proposed'),
  stk('REQ-STK-014', 'Sites linked to public transport', 'The AeroLink service shall operate only from vertiport sites within 400 m (TBR-01) walking distance of a public transport stop.', 'constraint', 'inspection', 'Measured walking route ≤ 400 m from each site to a public transport stop (value TBR-01, U-005)', 'The city weighs public-transport access in approving a site (NEED-016). The 400 m is a known value with low confidence: it is marked TBR-01, tracked by U-005, until the city confirms the distance it applies.', ['NEED-016', 'CAP-011'], 'proposed', 'TBR-01'),
  stk('REQ-STK-015', 'Simultaneous flights per remote operator', 'The AeroLink service shall assign no more than TBD-04 simultaneous flights to one remote operator, including during weather disruptions.', 'performance', 'analysis', 'Maximum simultaneous flights per operator ≤ TBD-04 in every duty period, including replayed disruption days (limit pending U-004)', 'Overload erodes safety margins (NEED-013); SCN-005 showed that a disruption loads the operators, but nothing in the flows limits their workload. The limit is unknown until the Week 3 workload analysis.', ['NEED-013', 'CAP-012'], 'proposed', 'TBD-04'),
  stk('REQ-STK-016', 'Auditable record of every flight', 'The AeroLink service shall record the flight data, incidents and maintenance actions of every flight in a log that its insurers can audit.', 'functional', 'inspection', 'A complete log entry for 100 % of flights in a sampled month, readable by the insurers’ auditor', 'Insurers set premiums on evidence (NEED-014); a record kept from the first day of service gives them a loss history instead of an unknown.', ['NEED-014', 'CAP-013'], 'proposed'),
  stk('REQ-STK-017', 'Fare competitive with ground alternatives', 'The AeroLink service shall offer each trip between two vertiports at a fare no more than 2.0 times (TBR-02) the ride-hail fare for the same journey at the same time.', 'constraint', 'analysis', 'Monthly fare survey: AeroLink fare ÷ ride-hail fare ≤ 2.0 for the sampled journeys (ratio TBR-02, U-006)', 'Passengers choose by comparing fares (NEED-017). The ratio is the marketing team’s first estimate, marked TBR-02 and tracked by U-006 until the Week 3 trade relates fare to demand.', ['NEED-017', 'CAP-014'], 'proposed', 'TBR-02'),
]

export const SYSTEM_REQUIREMENTS: CaseRequirement[] = [
  sys('REQ-SYS-001', 'Charge to dispatch threshold in 20 min', 'The charging system shall charge an aircraft from any landing state of charge at or above the 20 % reserve to the dispatch threshold within 20 min.', 'performance', 'test', 'Charge time from 20 % reserve to dispatch threshold ≤ 20 min', 'The worst planned arrival state is the 20 % reserve that every flight plan protects (REQ-SYS-003); meeting 20 min from that state keeps the 25 min hub turnaround of REQ-STK-005 achievable.', ['REQ-STK-005']),
  sys('REQ-SYS-002', 'Aircraft pad-edge noise', 'The eVTOL aircraft shall produce no more than 65 dBA LAmax at the pad edge during take-off and landing on the published vertiport procedures.', 'performance', 'test', 'LAmax ≤ 65 dBA at the pad edge, every measured movement', 'The aircraft is the noise source; allocating the whole community limit to it keeps the vertiport free of noise-abatement infrastructure.', ['REQ-STK-002']),
  sys('REQ-SYS-003', 'Planned landing energy reserve', 'The flight planning function shall plan every flight so that the aircraft lands with at least 20 % of its usable battery energy remaining.', 'performance', 'analysis', 'Planned landing energy ≥ 20 % of usable energy, every flight plan', 'The 20 % reserve covers a hold or a diversion in SCN-002 A1 and SCN-005 A1. It derives directly from CAP-004 because no stakeholder requirement carries the energy-planning obligation.', ['CAP-004']),
  sys('REQ-SYS-004', 'Weather dispatch hold', 'The operations system shall place a dispatch hold on any vertiport whose forecast wind, gust or visibility within the next 30 min is outside the aircraft limits (TBD-01).', 'functional', 'demonstration', 'Hold placed for every injected forecast outside TBD-01 (pending U-001)', 'A vertiport-level hold implements REQ-STK-003 before a flight is dispatched, rather than relying on each operator’s judgment.', ['REQ-STK-003'], 'reference', 'TBD-01'),
  sys('REQ-SYS-005', 'Aircraft assignment time', 'The scheduling function shall assign a dispatch-ready aircraft to at least 99 % of confirmed ride requests within 60 s of confirmation.', 'performance', 'test', 'Confirmation-to-assignment ≤ 60 s for at least 99 % of at least 200 requests in a replayed peak-hour request profile', 'Assignment must be a negligible part of the 15 min wait budget (REQ-STK-001) so that the remaining time is set by aircraft and charger availability.', ['REQ-STK-001', 'CAP-002']),
  sys('REQ-SYS-006', 'Fleet availability', 'The fleet shall achieve an availability of at least 90 % of scheduled aircraft-hours in each calendar month.', 'performance', 'analysis', 'Available aircraft-hours ÷ scheduled aircraft-hours ≥ 90 % per month', 'The planning rate of 20 trips per aircraft per day assumes 90 % availability (43 min cycle); lower availability removes capacity needed for REQ-STK-004.', ['REQ-STK-004']),
  sys('REQ-SYS-007', 'Block time for the design trip', 'The eVTOL aircraft shall complete a 25 km vertiport-to-vertiport trip within 16 min block time in still air.', 'performance', 'test', 'Block time ≤ 16 min for a 25 km trip, still air', 'Block time drives the 43 min aircraft cycle and therefore the capacity of REQ-STK-004 (10 min cruise plus 6 min terminal phases; cycle = 16 min block + 25 min turnaround + 2 min positioning).', ['REQ-STK-004']),
  sys('REQ-SYS-008', 'No-go fault flag time', 'The maintenance management function shall mark an aircraft unavailable for dispatch within 2 min of a no-go fault being reported.', 'performance', 'test', 'Fault report to unavailable status ≤ 2 min', 'Release follows boarding and the pre-departure check, at least 5 min after assignment, so a 2 min flag removes a faulted aircraft from the pool before it can be released.', ['REQ-STK-006']),
  sys('REQ-SYS-009', 'Fire alarm transmission', 'The vertiport fire detection system shall transmit a battery-fire alarm to the emergency services dispatch center within 30 s of detection.', 'interface', 'test', 'Detection to receipt at the dispatch center ≤ 30 s', 'Transmission takes half of the 60 s alert budget of REQ-STK-008, leaving the rest for the dispatch center to alert crews.', ['REQ-STK-008']),
  sys('REQ-SYS-010', 'Vertiport charging power limit', 'The charging system shall limit the combined power of all chargers at a vertiport to the configured connection limit (TBD-02 kW).', 'constraint', 'test', 'Combined charger power ≤ configured limit under every tested load case (limit pending U-002)', 'Enforcing the limit in the charging system, not by procedure, keeps REQ-STK-010 met when several aircraft arrive together.', ['REQ-STK-010'], 'reference', 'TBD-02'),
  // ---- proposed additions
  sys('REQ-SYS-011', 'Sensitive-hour movement limit', 'The scheduling function shall schedule no take-off or landing at a vertiport pad before 07:00 or after 20:00 beyond the hourly movement limit configured for that pad (TBD-03).', 'functional', 'test', 'In a replayed evening schedule, zero movements scheduled beyond the configured limit at any pad in any sensitive hour (limit pending U-003)', 'The event cap of REQ-STK-011 is met where departures are planned, not by asking pilots to count; scheduling is the function that decides how many movements each pad gets per hour.', ['REQ-STK-011'], 'proposed', 'TBD-03'),
  sys('REQ-SYS-012', 'Fare shown before confirmation', 'The booking function shall display the total fare, including every charge, before it accepts a booking confirmation.', 'functional', 'demonstration', 'Total fare displayed before the confirmation is accepted, in 100 % of demonstrated booking paths', 'Allocates REQ-STK-012 to the booking function: whichever channel a passenger uses, the fare is complete before the commitment.', ['REQ-STK-012'], 'proposed'),
]

export const REQUIREMENTS: CaseRequirement[] = [...STAKEHOLDER_REQUIREMENTS, ...SYSTEM_REQUIREMENTS]

export const requirement = (id: string): CaseRequirement => {
  const r = REQUIREMENTS.find((x) => x.id === id)
  if (!r) throw new Error(`unknown requirement ${id}`)
  return r
}

/** The Week 1 need ids a requirement reaches through its parents (REQ-SYS → REQ-STK or CAP → NEED). */
export function needsOfRequirement(id: string, seen = new Set<string>()): string[] {
  if (seen.has(id)) return []
  seen.add(id)
  if (id.startsWith('NEED-')) return [id]
  if (id.startsWith('CAP-')) return capability(id).needs
  return [...new Set(requirement(id).parents.flatMap((p) => needsOfRequirement(p, seen)))]
}
/** Requirements with a parent of a given ID. */
export const childrenOf = (id: string) => REQUIREMENTS.filter((r) => r.parents.includes(id)).map((r) => r.id)
/** Orphans: requirements with no parent at all, or a parent that does not exist. */
export function orphanRequirements(): string[] {
  const known = new Set([...NEEDS.map((n) => n.id), ...CAPABILITIES.map((c) => c.id), ...REQUIREMENTS.map((r) => r.id)])
  return REQUIREMENTS.filter((r) => r.parents.length === 0 || r.parents.some((p) => !known.has(p))).map((r) => r.id)
}
/** Childless needs: needs that no stakeholder requirement names as a parent. */
export const childlessNeeds = () => NEEDS.filter((n) => !STAKEHOLDER_REQUIREMENTS.some((r) => r.parents.includes(n.id))).map((n) => n.id)
/** Stakeholder requirements with no system requirement under them yet. */
export const childlessStakeholderRequirements = () => STAKEHOLDER_REQUIREMENTS.filter((r) => !SYSTEM_REQUIREMENTS.some((s) => s.parents.includes(r.id))).map((r) => r.id)

/** The audit rule the case applies (S2.12, S2.13; review M2): coverage is read from direct parent links only. */
export const AUDIT_RULE = 'A need counts as covered only when a stakeholder requirement names it as a parent. A trace through a capability does not cover every need of that capability: each need still needs its own requirement or a disposition.'

/** The one deliberate gap of the trace audit (S2.12): exposed by SCN-005 and kept on purpose. No requirement reaches
 *  NEED-011 by any trace path: its only capability, CAP-015, has no requirement under it (tested). */
export const DELIBERATE_REQ_GAP = {
  need: 'NEED-011',
  exposedBy: 'SCN-005',
  finding: 'NEED-011 (prompt notice and a way onward when a trip is disrupted) has a capability (CAP-015) and a scenario (SCN-005), but no requirement reaches it by any trace path.',
  why: 'Nothing stops it being written now: the unknown notice time can carry an owned TBD, as the TBD slide teaches, and the way onward can rest on assumption A-008. SCN-005 exposed the need after the requirements were drafted; the reference leaves it unwritten so the audit has a real gap to find.',
  wrongFix: 'Linking an existing requirement, such as REQ-STK-001 (wait to board), to NEED-011 would make the matrix look complete and hide the gap: REQ-STK-001 does not oblige the service to tell anyone anything.',
  disposition: 'Open item: write it in Week 3 with an owned TBD for the notice time, traced to NEED-011 and CAP-015.',
}

/** Dispositions of the childless stakeholder requirements (S2.12; DoD: each high-level requirement is "ultimately"
 *  addressed by lower-level requirements and designs, R45 p.118). The vocabulary is the lecture's (labBrief.ts
 *  AUDIT_DISPOSITIONS, review M7): each of these is "record why not", in one of its two forms, an open item (O) or no
 *  child needed (R). STK_DISPOSITION_FORM gives the form. */
export const STK_DISPOSITIONS: Record<string, string> = {
  'REQ-STK-007': 'Open item: allocate to the vertiport and aircraft cabin elements in Week 5 (interfaces).',
  'REQ-STK-009': 'Open item: an interface requirement on the flight-planning function, allocated in Week 5 with the interface definition.',
  'REQ-STK-013': 'No child needed: verified at service level by inspection of the site approvals; no system element carries it.',
  'REQ-STK-014': 'No child needed: verified at service level by inspection of each site; no system element carries it.',
  'REQ-STK-015': 'Open item: allocate after the Week 3 workload analysis sets TBD-04.',
  'REQ-STK-016': 'Open item: allocate to the information elements in Week 4 (information view).',
  'REQ-STK-017': 'No child needed: a pricing obligation met by the enterprise’s fare policy, checked by analysis; no system element carries it.',
}
export const STK_DISPOSITION_FORM: Record<string, 'open' | 'no-child'> = Object.fromEntries(Object.entries(STK_DISPOSITIONS).map(([id, d]) => [id, /no child needed/.test(d) ? 'no-child' : 'open']))

/** Needs that a stakeholder requirement covers only in part (review M8). The NEED-003 lesson (one need, two bounds,
 *  two requirements) applies to each; the audit records the uncovered part with a disposition rather than leaving it
 *  silent. */
export const PARTIAL_COVERAGE: { need: string; by: string; covered: string; missing: string; disposition: string }[] = [
  { need: 'NEED-008', by: 'REQ-STK-007', covered: 'boarding and alighting without being lifted', missing: 'travel without being separated from the mobility aid', disposition: 'Open item: write a second stakeholder requirement, keeping each passenger’s mobility aid with them, in Week 5 with the cabin interface.' },
  { need: 'NEED-006', by: 'REQ-STK-008', covered: 'early warning to responders', missing: 'safe access for responders to the pad', disposition: 'Open item: write the responder-access requirement with the vertiport layout in Week 5.' },
  { need: 'NEED-017', by: 'REQ-STK-017', covered: 'fares compared with ride-hail', missing: 'fares compared with public transport', disposition: 'Open item: the Week 3 fare and demand trade decides whether a public-transport ratio is needed; TBR-02 stays open until then.' },
]

// ------------------------------------------------------------------------------------------------ the quality critique (S2.10)
/** Six flawed drafts and their rewrites (src/activities/week04/critique.ts; American spelling). `catchBy` says what
 *  finds the defect: a word-level check, or engineering judgment in review (requirement verification, R13 p.566). */
export const CRITIQUE: { id: string; draft: string; defect: string; characteristic: string; cite: { reading: string; pages: string }; catchBy: 'word-level check' | 'engineering judgment'; rewriteId: string }[] = [
  { id: 'F1', draft: 'The aircraft shall be quiet and shall be safe to operate near homes.', defect: 'Two obligations in one statement; “quiet” and “safe” have no measurable criterion.', characteristic: 'Singular; measurable', cite: { reading: 'R48b', pages: '144' }, catchBy: 'engineering judgment', rewriteId: 'REQ-SYS-002' },
  { id: 'F2', draft: 'The booking app should respond quickly to ride requests.', defect: '“Should” is not binding; “quickly” has no value, unit or start event; “the booking app” names one implementation.', characteristic: 'Uses “shall”; testable; design-free', cite: { reading: 'R54', pages: '329–330' }, catchBy: 'word-level check', rewriteId: 'REQ-SYS-005' },
  { id: 'F3', draft: 'The charging system shall charge each aircraft using two 350 kW DC fast chargers per hub pad.', defect: 'States how (charger type, rating and count), not what the turnaround needs: the number dictates the design.', characteristic: 'Design-free; leave white space', cite: { reading: 'R55', pages: '367' }, catchBy: 'engineering judgment', rewriteId: 'REQ-SYS-001' },
  { id: 'F4', draft: 'The fleet shall maximize availability.', defect: '“Maximize” leaves the engineer to judge when it is good enough; no threshold, no period.', characteristic: 'Avoid “maximize”; measurable', cite: { reading: 'R55', pages: '370' }, catchBy: 'word-level check', rewriteId: 'REQ-SYS-006' },
  { id: 'F5', draft: 'The operations system shall not dispatch flights in unsafe weather.', defect: 'A negative is hard to prove; “unsafe” hides an unknown value (the weather limits).', characteristic: 'Avoid “shall not”; track the TBD', cite: { reading: 'R55', pages: '370' }, catchBy: 'word-level check', rewriteId: 'REQ-SYS-004' },
  { id: 'F6', draft: 'The vertiport fire detection system shall send a battery-fire alarm to the emergency services dispatch center in 30 s.', defect: 'A single point value, and no start event: 30 s from what?', characteristic: 'Avoid one-point values; unambiguous', cite: { reading: 'R55', pages: '370' }, catchBy: 'word-level check', rewriteId: 'REQ-SYS-009' },
]

// ------------------------------------------------------------------------------------------------ measures
export type CaseMeasure = { id: string; kind: 'MOE' | 'MOP'; name: string; text: string; unit: string; threshold: string; dataSource: string; measures: string[]; provenance: CaseProvenance }
export const MOES: CaseMeasure[] = [
  { id: 'MOE-001', kind: 'MOE', name: 'Passenger wait (90th percentile)', text: 'Monthly 90th-percentile time from ride confirmation to boarding, across all vertiports.', unit: 'min', threshold: '≤ 15', dataSource: 'Booking and boarding timestamps', measures: ['NEED-001', 'CAP-001', 'MGO-005'], provenance: 'reference' },
  { id: 'MOE-002', kind: 'MOE', name: 'Daily trips served', text: 'Revenue trips flown per operating day, network-wide, compared with trips requested.', unit: 'trips/day', threshold: '≥ 240', dataSource: 'Flight log and booking records', measures: ['NEED-005', 'CAP-008', 'MGO-007'], provenance: 'reference' },
  { id: 'MOE-003', kind: 'MOE', name: 'Noise compliance rate', text: 'Share of take-offs and landings at or below 65 dBA LAmax at the pad edge.', unit: '%', threshold: '100', dataSource: 'Pad-edge noise monitors at each vertiport', measures: ['NEED-003', 'CAP-007', 'MGO-006'], provenance: 'reference' },
  { id: 'MOE-004', kind: 'MOE', name: 'Dispatches outside approved limits', text: 'Number of flights dispatched outside approved weather, energy-reserve or airworthiness limits.', unit: 'count/quarter', threshold: '0', dataSource: 'Dispatch records cross-checked with weather and maintenance data', measures: ['NEED-002', 'CAP-004', 'CAP-005', 'MGO-008'], provenance: 'reference' },
  { id: 'MOE-005', kind: 'MOE', name: 'Capital to meet the Year-2 capacity objective', text: 'Capital required over months 0–24 to add the capacity in a plan, in USD millions.', unit: 'USD M', threshold: 'lower is better (compared across plans)', dataSource: 'Capital plan; unit costs in the Week 3 trade study', measures: ['NEED-005', 'MGO-004'], provenance: 'reference' },
  { id: 'MOE-006', kind: 'MOE', name: 'Capacity retained after loss of one hub', text: 'Network trip capacity remaining when one hub vertiport is closed, as a share of full capacity.', unit: '%', threshold: 'higher is better (compared across plans)', dataSource: 'Capacity model', measures: ['NEED-005', 'CAP-008'], provenance: 'corrected' },
  { id: 'MOE-007', kind: 'MOE', name: 'Sensitive-hour events within the cap', text: 'Share of pad-hours before 07:00 and after 20:00 in which take-offs and landings stayed within the agreed cap.', unit: '%', threshold: '100 (cap TBD-03)', dataSource: 'Movement log per pad, compared with the agreed cap', measures: ['NEED-003', 'CAP-007'], provenance: 'proposed' },
  { id: 'MOE-008', kind: 'MOE', name: 'Responder alerts on time', text: 'Share of vertiport battery-fire detections, drills included, for which emergency responders were alerted within 60 s.', unit: '%', threshold: '100', dataSource: 'Alarm system and dispatch-center timestamps, drills included', measures: ['NEED-006', 'CAP-009'], provenance: 'proposed' },
  { id: 'MOE-009', kind: 'MOE', name: 'Grid connection compliance', text: 'Share of vertiport operating days on which the combined charging power stayed within the connection capacity agreed with the utility.', unit: '%', threshold: '100 (capacity TBD-02)', dataSource: 'Charger power meters and the utility’s connection records', measures: ['NEED-010', 'CAP-010'], provenance: 'proposed' },
]
export const MOPS: CaseMeasure[] = [
  { id: 'MOP-001', kind: 'MOP', name: 'Aircraft assignment latency', text: 'Time from ride confirmation to aircraft assignment (99th percentile).', unit: 's', threshold: '≤ 60', dataSource: 'Scheduling event log', measures: ['MOE-001', 'REQ-SYS-005'], provenance: 'reference' },
  { id: 'MOP-002', kind: 'MOP', name: 'Charge time to dispatch threshold', text: 'Time from charge start at the 20 % reserve state to the dispatch threshold.', unit: 'min', threshold: '≤ 20', dataSource: 'Charger session records', measures: ['MOE-001', 'REQ-SYS-001', 'REQ-STK-005'], provenance: 'reference' },
  { id: 'MOP-003', kind: 'MOP', name: 'Block time for the 25 km design trip', text: 'Gate-to-gate time for a 25 km trip in still air.', unit: 'min', threshold: '≤ 16', dataSource: 'Flight data', measures: ['MOE-002', 'REQ-SYS-007'], provenance: 'reference' },
  { id: 'MOP-004', kind: 'MOP', name: 'Pad-edge noise level', text: 'Maximum A-weighted sound level (LAmax) at the pad edge during take-off and landing.', unit: 'dBA', threshold: '≤ 65', dataSource: 'Pad-edge noise monitors', measures: ['MOE-003', 'REQ-SYS-002', 'REQ-STK-002'], provenance: 'reference' },
  { id: 'MOP-005', kind: 'MOP', name: 'Landing energy remaining', text: 'Usable battery energy remaining at landing, as a share of usable energy.', unit: '%', threshold: '≥ 20', dataSource: 'Flight data', measures: ['MOE-004', 'REQ-SYS-003'], provenance: 'reference' },
  { id: 'MOP-006', kind: 'MOP', name: 'Fleet availability', text: 'Available aircraft-hours divided by scheduled aircraft-hours in a calendar month.', unit: '%', threshold: '≥ 90', dataSource: 'Maintenance data', measures: ['MOE-002', 'REQ-SYS-006'], provenance: 'reference' },
  { id: 'MOP-007', kind: 'MOP', name: 'No-go fault flag latency', text: 'Time from a no-go fault report to the aircraft being marked unavailable for dispatch.', unit: 'min', threshold: '≤ 2', dataSource: 'Maintenance management event log', measures: ['MOE-004', 'REQ-SYS-008'], provenance: 'reference' },
  { id: 'MOP-008', kind: 'MOP', name: 'Fire alarm transmission latency', text: 'Time from fire detection on a pad to receipt of the alarm at the emergency services dispatch center.', unit: 's', threshold: '≤ 30', dataSource: 'Alarm system timestamps', measures: ['MOE-008', 'REQ-SYS-009', 'REQ-STK-008'], provenance: 'corrected' },
  { id: 'MOP-009', kind: 'MOP', name: 'Peak vertiport charging power', text: 'Highest 1-minute average of combined charger power at a vertiport in a day.', unit: 'kW', threshold: '≤ TBD-02', dataSource: 'Charger power meters', measures: ['MOE-009', 'REQ-SYS-010', 'REQ-STK-010'], provenance: 'corrected' },
  { id: 'MOP-010', kind: 'MOP', name: 'Sensitive-hour movements per pad', text: 'Take-offs and landings scheduled and flown per pad in each hour before 07:00 and after 20:00.', unit: 'movements/pad-hour', threshold: '≤ TBD-03', dataSource: 'Schedule and movement log', measures: ['MOE-007', 'REQ-SYS-011', 'REQ-STK-011'], provenance: 'proposed' },
]
export const MEASURES = [...MOES, ...MOPS]

// ------------------------------------------------------------------------------------------------ the worked chains
/** One chain end to end (S1.21): NEED-004 → CAP-003 + SCN-003 → REQ-STK-005 → REQ-SYS-001, with the time budget. */
export const TURNAROUND_BUDGET = { total: 25, padWork: 5, charge: 20, note: 'deplaning and boarding overlap the charge (A-007)' }
export const CHAIN_NEED004 = ['NEED-004', 'CAP-003', 'SCN-003', 'REQ-STK-005', 'REQ-SYS-001'] as const
/** The two chains of S2.8. */
export const CHAINS_S2 = [
  ['NEED-001', 'CAP-001', 'REQ-STK-001', 'REQ-SYS-005'],
  ['NEED-010', 'CAP-010', 'REQ-STK-010', 'REQ-SYS-010'],
] as const

// ------------------------------------------------------------------------------------------------ counts and helpers
export const countByType = (rs: CaseRequirement[]) => (['functional', 'performance', 'interface', 'constraint'] as ReqType[]).map((t) => ({ type: t, n: rs.filter((r) => r.type === t).length }))
export const countByMethod = (rs: CaseRequirement[]) => (['inspection', 'analysis', 'demonstration', 'test'] as VerMethod[]).map((m) => ({ method: m, n: rs.filter((r) => r.method === m).length }))
export const REFERENCE_REQUIREMENTS = REQUIREMENTS.filter((r) => r.provenance === 'reference')
export const PROPOSED_REQUIREMENTS = REQUIREMENTS.filter((r) => r.provenance === 'proposed')
