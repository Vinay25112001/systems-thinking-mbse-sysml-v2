// Week 3 layer (L3 / CP1): mission, goals and objectives (MGO), solution-free needs (NEED), capabilities (CAP, with
// decomposition by `refines`), the five operational scenarios named in S04 Lab 7 (SCN-001..005) and the AROU v1 entry
// exposed by a scenario (A-008, from SCN-005).
//
// FICTIONAL VALUES in this file (teaching values, not real-world data):
//   - Data Sheet: 6 vertiports, 12 aircraft, 4 seats, 25 km typical trip, 150 km/h cruise, 20 min charge to the
//     dispatch threshold, 16 h operating day, 20 % energy reserve, 65 dBA pad-edge noise limit
//   - 15 min wait (A-001); 240 trips/day planning demand by month 24 (A-006, Week 7); 80 % utilisation ceiling
//   - 60 s aircraft assignment, 2 min no-go flag
//   - aircraft cycle 43 min = 16 min block + 25 min hub turnaround (20 min charge + 5 min handling) + 2 min positioning; 960 min / 43 min x 90 % availability
//     = 20.1, i.e. the dynamics model's 20 trips per aircraft per day is a fleet average net of availability
// A "trip" is one revenue flight for one booking (a party of 1-4 passengers), as in the Week 1 dynamics model.
import type { Element, ElementKind, EngineeringModel, Link } from '../engineering'

const el = (id: string, name: string, text: string, attributes?: Element['attributes'], provenance: Element['provenance'] = 'instructor-reference'): Element => ({
  id, kind: id.split('-')[0] as ElementKind, name, text, attributes, provenance, status: 'active',
})
let n = 0
const ln = (source: string, type: Link['type'], target: string, rationale?: string): Link => ({ id: `LNK-03-${String(++n).padStart(3, '0')}`, source, type, target, rationale })

const mgo: Element[] = [
  el('MGO-001', 'Mission: safe, quiet on-demand urban air trips',
    'AeroLink provides safe, quiet, on-demand air trips between the six vertiports of one metropolitan region, at waits passengers find predictable and at a cost that lets the network grow.',
    { level: 'mission' }),
  el('MGO-002', 'Goal: short, predictable waits', 'Passengers board soon after they confirm a ride, and the wait they are quoted is the wait they get.', { level: 'goal' }),
  el('MGO-003', 'Goal: be a good neighbour', 'Vertiport operations stay within what neighbouring communities have agreed to accept.', { level: 'goal' }),
  el('MGO-004', 'Goal: grow capacity in step with demand', 'Capacity is added when and where demand needs it, without stranding capital in idle aircraft or chargers.', { level: 'goal' }),
  // Course convention (Week 3 lesson): each objective is recorded with its measure (SEBoK's MOE, R10 p.544), a numeric
  // target, a unit and a horizon. SEBoK itself keeps objective and measure as separate levels (R10 p.546). Objectives
  // answer their concerns through their goal (MGO-002 -> CON-001, MGO-003 -> CON-012, MGO-004 -> CON-005).
  el('MGO-005', 'Objective: 90 % boarded within 15 min',
    'From month 6 onward, at least 90 % of passengers in each calendar month board within 15 min of confirming their ride.',
    { level: 'objective', measure: '90th-percentile wait', target: 15, unit: 'min', horizon: 'month 6 onward' }, 'instructor-fictional'),
  el('MGO-006', 'Objective: no pad-edge noise exceedance',
    'Zero take-off or landing events above 65 dBA at any vertiport pad edge in each quarter.',
    { level: 'objective', measure: 'take-off or landing events above 65 dBA LAmax at any pad edge', target: 0, unit: 'events per quarter', limit: 65, limitUnit: 'dBA', horizon: 'each quarter from the start of service' }, 'instructor-fictional'),
  el('MGO-007', 'Objective: Year-2 capacity with headroom',
    'By month 24, serve the planning demand of 240 trips/day at a fleet utilisation of no more than 80 %, i.e. provide at least 300 trips/day of capacity.',
    { level: 'objective', measure: 'trips/day capacity', target: 300, unit: 'trips/day', demand: 240, maxUtilisation: 0.8, horizon: 'month 24' }, 'instructor-fictional'),
  // MGO-008 is elaborated from the goal MGO-009 (W3-F02: it used to derive directly from the mission, skipping a goal).
  el('MGO-008', 'Objective: zero dispatches outside limits',
    'Zero flights dispatched outside the approved weather, energy-reserve or airworthiness limits in each quarter.',
    { level: 'objective', measure: 'flights dispatched outside the approved weather, energy-reserve or airworthiness limits', target: 0, unit: 'dispatches per quarter', horizon: 'each quarter from the start of service' }, 'instructor-fictional'),
  // Goal added for W3-F02 (MGO-009 is the next free ID; listed last so that existing IDs keep their order).
  el('MGO-009', 'Goal: every flight within approved limits', 'Every flight is planned, dispatched and flown within the approved weather, energy-reserve and airworthiness limits, whatever the schedule pressure.', { level: 'goal' }),
]

// Needs: solution-free, stakeholder-attributed, no "shall"; each with an explicit operating condition and a rationale
// (the six need-studio criteria, src/activities/week03/needs.ts). [id, name, text, parents, conditions, rationale]
const needs: [string, string, string, string[], string, string][] = [
  ['NEED-001', 'Short, predictable wait to board', 'Passengers need to board within a short and predictable time after confirming a ride, throughout operating hours.', ['STK-001', 'CON-001'],
    'Throughout the 16 h operating day, including peak hours.', 'The wait and its predictability decide whether passengers use the service again (CON-001, A-001).'],
  ['NEED-002', 'Assurance of flight within safety limits', 'The FAA needs assurance that every flight is conducted within the approved airworthiness, energy and weather limits, including when weather changes during the day.', ['STK-002', 'CON-004', 'CON-002'],
    'For every flight, including when weather changes during the day.', 'The regulator must be assured that the operation, not only the aircraft, stays inside the approved envelope (CON-004).'],
  ['NEED-003', 'Noise kept within the local agreement', 'Communities near vertiports need take-off and landing noise kept within the limit agreed with the city, at every pad, at all operating hours.', ['STK-004', 'CON-012'],
    'At every pad, at all operating hours.', 'An exceedance puts the vertiport operating permit at risk and erodes community acceptance (CON-012).'],
  ['NEED-004', 'Pads not limited by turnaround', 'Vertiport operators need arriving aircraft to be ready to depart again quickly enough that pad turnaround does not become the throughput limit.', ['STK-005', 'CON-006'],
    'At peak hours, at every hub vertiport.', 'How long an arriving aircraft occupies a pad sets how many departures the pad can support (CON-006).'],
  ['NEED-005', 'Capacity that grows with demand', 'Investors need service capacity to grow in step with demand so that capital is neither short when demand arrives nor idle when it does not.', ['STK-003', 'CON-005'],
    'Throughout the first three years of service, while demand grows.', 'Capital tied up in idle assets, or demand turned away for lack of them, erodes the return investors expect (CON-005).'],
  ['NEED-006', 'Early warning and access for a vertiport fire', 'Emergency responders need early warning of, and safe access to, a battery fire at a vertiport.', ['STK-006', 'CON-007'],
    'At any hour of operation, at every vertiport.', 'Lithium battery fires escalate within minutes and need specialist equipment and a safe approach (CON-007).'],
  ['NEED-007', 'Known aircraft condition before release', 'Maintenance technicians need the condition of each aircraft to be known before it is released for a flight, regardless of schedule pressure.', ['STK-009', 'CON-010'],
    'At every release, regardless of schedule pressure.', 'Releasing an aircraft whose condition is unknown is the failure technicians most want to prevent (CON-010).'],
  ['NEED-008', 'Unassisted step-free travel', 'Passengers who use wheelchairs need to board, travel and alight without being lifted or separated from their mobility aid.', ['STK-014', 'CON-013'],
    'At every vertiport, throughout operating hours.', 'Being lifted is unsafe and undignified and excludes passengers who travel with their own mobility aid (CON-013).'],
  ['NEED-009', 'Flight intent known to the ANSP', 'The air navigation service provider needs each flight\'s intended route and time known before the aircraft enters controlled airspace.', ['STK-007', 'CON-008'],
    'Whenever a flight will enter controlled airspace.', 'The ANSP can separate air-taxi flights from other traffic only if it knows them in advance (CON-008).'],
  ['NEED-010', 'Charging load within the grid connection', 'The electric utility needs the power drawn by each vertiport to stay within the agreed connection capacity at all times.', ['STK-010', 'CON-011'],
    'At all times, including when several arriving aircraft charge together.', 'Exceeding the agreed connection trips protection or incurs penalty tariffs (CON-011).'],
  // Discovered by writing SCN-005 (step 5): the scenario-to-need loop of the Week 3 lesson (W3-F18).
  ['NEED-011', 'Prompt notice and a way onward when a trip is disrupted', 'Passengers need prompt notice whenever their trip is held, diverted or cancelled, and a usable alternative way to complete their journey.', ['STK-001', 'CON-001'],
    'Whenever a confirmed trip is held, diverted or cancelled, including during weather holds and region-wide suspensions.', 'A passenger left waiting without news or a way onward loses more time and trust than one told early and offered an alternative (CON-001; exposed by SCN-005 step 5).'],
]

// AROU v1 entry exposed by a scenario (L3 rule; W3-F18): SCN-005 A2 offers passengers public transport (EXT-005).
const arouV1: Element[] = [
  el('A-008', 'Public-transport fallback is available during weather holds',
    'When a weather hold or a region-wide suspension stops flights (SCN-005 A2), the public transport network (EXT-005) can carry the affected passengers onward from the vertiports concerned within the operating day. No agreement with the transport authority confirms this yet.',
    { owner: 'Head of Partnerships', validation: 'Agree a disruption-transfer arrangement with the transport authority covering every vertiport and the full operating day before entry into service.' }),
]

// Capabilities: what the enterprise must be able to do; CAP-002, CAP-005 and CAP-010 decompose a parent (refines).
const caps: [string, string, string, string[]][] = [
  ['CAP-001', 'On-demand passenger transport', 'Carry a booked party of 1-4 passengers between any two vertiports of the network on demand.', ['NEED-001', 'NEED-008']],
  ['CAP-002', 'Ride booking and dispatch', 'Accept a ride request, match it to a dispatch-ready aircraft and release the flight (part of CAP-001).', ['NEED-001']],
  ['CAP-003', 'Fleet charging management', 'Return arriving aircraft to a dispatch-ready energy state within the turnaround time at hub vertiports.', ['NEED-004']],
  ['CAP-004', 'Flight operations within safety limits', 'Plan, coordinate and fly each flight within approved airworthiness, energy-reserve and airspace limits.', ['NEED-002', 'NEED-009']],
  ['CAP-005', 'Weather-aware operations', 'Detect weather approaching limits and hold, divert or recover flights accordingly (part of CAP-004).', ['NEED-002', 'NEED-011']],
  ['CAP-006', 'Fleet health management', 'Know the condition of each aircraft and its battery, and withhold unfit aircraft from dispatch.', ['NEED-007', 'NEED-002']],
  ['CAP-007', 'Noise-managed vertiport operations', 'Operate take-offs and landings so that pad-edge noise stays within the local agreement.', ['NEED-003']],
  ['CAP-008', 'Capacity planning', 'Forecast demand and plan fleet and charging capacity to meet it.', ['NEED-005']],
  ['CAP-009', 'Incident response support', 'Detect vertiport incidents and give emergency responders warning and safe access.', ['NEED-006']],
  ['CAP-010', 'Charging power control', 'Schedule and limit charging power so that each vertiport stays within its grid connection (part of CAP-003).', ['NEED-010', 'NEED-004']],
]

// Scenarios (official S04 Lab 7 names and IDs) in the scenario builder's shape (src/activities/week03/scenarios.ts,
// toScenarioAttributes): actors with the primary actor marked and environmental factors marked "(environment)", a
// trigger, preconditions, a main flow with an actor for every step, alternate flows that each branch from a step and
// rejoin or end, and separate success and failure end states. The system of interest for scenarios is AeroLink's
// operational system (aircraft, booking, scheduling and dispatch systems, operations-support tools); people, including
// operations-centre staff, are users outside it (R59 p.453: actors are parties outside the system).
// SCN-005 is identical to worked example (c) (WORKED_SCN005; test-asserted).
const SYS = 'AeroLink (system of interest)'
type ScnAttrs = { actors: string; trigger: string; preconditions: string; mainFlow: string; alternateFlows: string; endState: string; kind: string; official: string }
const scn = (id: string, name: string, text: string, a: ScnAttrs): Element => el(id, name, text, a, 'official-S04')

const scenarios: Element[] = [
  scn('SCN-001', 'Passenger Ride Request', 'A passenger requests a ride and receives a confirmed booking with an assigned aircraft and boarding time.', {
    kind: 'nominal', official: 'SCN-001',
    actors: 'STK-001 (primary); Customer services agent',
    trigger: 'A passenger asks for a ride between two vertiports.',
    preconditions: 'The passenger has an account; the request is made within the 16 h operating day; at least one aircraft in the network is dispatch-ready.',
    mainFlow: `1. STK-001: Enters the origin and destination vertiports and the party size (1-4). 2. ${SYS}: Checks weather status and capacity at both vertiports. 3. ${SYS}: Quotes the fare and an estimated boarding time. 4. STK-001: Confirms the booking. 5. ${SYS}: Assigns a dispatch-ready aircraft within 60 s of confirmation. 6. ${SYS}: Issues a boarding pass with the pad and the boarding time.`,
    alternateFlows: 'A1 (step 2): no aircraft can board the party within 15 min - Offer the next available slot or a waitlist. Rejoin at step 3. A2 (step 2): the destination vertiport is under a weather hold (SCN-005) - Offer the nearest open vertiport, or decline the request with the reason recorded. Scenario ends. A3 (step 4): the party includes a wheelchair user who asks for assistance - The customer services agent confirms the step-free route at both vertiports and completes the booking with the passenger. Rejoin at step 5.',
    endState: 'Success: Confirmed booking with an assigned aircraft and a boarding time. Failure/degraded: Request declined, with the reason recorded and an alternative offered.',
  }),
  scn('SCN-002', 'Passenger Transport Mission', 'Nominal flight: a booked party is flown 25 km between two vertiports and the aircraft is handed to charging.', {
    kind: 'nominal', official: 'SCN-002',
    actors: 'STK-001 (primary); STK-008; EXT-001; STK-005',
    trigger: 'The boarding time of a confirmed booking (SCN-001) is reached.',
    preconditions: 'Booking confirmed; aircraft dispatch-ready (charged to the dispatch threshold, no open no-go fault); forecast weather within limits at both vertiports.',
    mainFlow: `1. ${SYS}: Plans the flight with at least 20 % usable energy at landing. 2. ${SYS}: Files the flight intent with the ANSP. 3. EXT-001: Accepts the flight intent. 4. STK-005: Boards the party step-free at the departure pad. 5. STK-008: Takes off within the pad-edge noise limit and cruises for about 10 min at 150 km/h. 6. STK-008: Approaches and lands at the destination pad. 7. STK-001: Deplane at the destination; the aircraft passes to charging (SCN-003).`,
    alternateFlows: 'A1 (step 6): the destination pad is occupied - Hold, or divert to the nearest open vertiport within the energy reserve. Rejoin at step 7. A2 (step 4): a passenger does not show - Depart on time with the remaining party. Rejoin at step 5. A3 (step 3): the ANSP does not accept the flight intent - Hold the departure and re-file; if no acceptance is given, cancel and re-accommodate the party. Scenario ends.',
    endState: 'Success: Passengers delivered; flight data logged; the aircraft on the destination pad with at least 20 % usable energy remaining. Failure/degraded: Flight not flown, or landed at an alternate vertiport, with the party re-accommodated and no flight outside limits.',
  }),
  scn('SCN-003', 'Aircraft Charging', 'An arrived aircraft is charged to the dispatch threshold in 20 min and is dispatch-ready within the 25 min hub turnaround.', {
    kind: 'charging', official: 'SCN-003',
    actors: 'STK-005 (primary); Fleet controller; EXT-002',
    trigger: 'An aircraft lands on a hub pad at the end of SCN-002.',
    preconditions: 'A turnaround charger is free; the vertiport power limit (TBD-02) is configured.',
    mainFlow: `1. STK-005: Connects the charger after rotor stop and the safety check. 2. ${SYS}: Sets charging power within the vertiport connection limit. 3. ${SYS}: Charges the battery to the dispatch threshold within 20 min while passengers deplane and board. 4. ${SYS}: Records the charge session (energy, cell temperatures). 5. STK-005: Disconnects the charger. 6. Fleet controller: Releases the aircraft as dispatch-ready.`,
    alternateFlows: 'A1 (step 1): both hub chargers are occupied - Queue the aircraft, or reposition it to another hub; scheduling re-times the next departure. Rejoin at step 1. A2 (step 2): EXT-002 signals a curtailment - Charge at reduced power for longer and notify scheduling of the later release. Rejoin at step 4. A3 (step 3): a cell over-temperature alarm sounds - Stop charging, isolate the aircraft and start the fire-response procedure. Scenario ends.',
    endState: 'Success: Aircraft dispatch-ready within the 25 min hub turnaround. Failure/degraded: Aircraft withdrawn from service, or released late, with the reason recorded.',
  }),
  scn('SCN-004', 'Maintenance Event', 'A fault is reported or predicted; the aircraft is withheld, repaired and returned to service.', {
    kind: 'maintenance', official: 'SCN-004',
    actors: 'STK-009 (primary); Fleet controller; EXT-004',
    trigger: 'Aircraft health monitoring reports a fault, or predictive maintenance flags one.',
    preconditions: 'The aircraft is in service; maintenance records and the approved deferral rules are available.',
    mainFlow: `1. STK-009: Classifies the fault as go or no-go. 2. ${SYS}: Flags a no-go aircraft unavailable for dispatch within 2 min of the report. 3. Fleet controller: Reassigns the affected bookings to other aircraft. 4. STK-009: Moves the aircraft to the maintenance facility and repairs it. 5. STK-009: Signs the return-to-service record. 6. ${SYS}: Restores the aircraft's availability.`,
    alternateFlows: 'A1 (step 4): the part is not in stock - Order it from EXT-004; the aircraft stays out of service and the capacity plan is updated. Scenario ends. A2 (step 1): the fault is deferrable - Allow dispatch under a recorded deferral with its limits. Scenario ends.',
    endState: 'Success: Aircraft returned to service with complete records. Failure/degraded: Aircraft out of service with an expected return date, or in service under a recorded deferral.',
  }),
  scn('SCN-005', 'Weather Disruption', 'Forecast weather approaches the aircraft limits at a vertiport; flights are held or diverted and the backlog is recovered.', {
    kind: 'weather', official: 'SCN-005',
    actors: 'Operations centre duty manager (primary); STK-001; STK-008; EXT-001; EXT-003 (environment)',
    trigger: 'The forecast for a vertiport crosses a weather limit within the next 30 min (limits TBD-01, U-001).',
    preconditions: 'Flights are scheduled and some are airborne; weather data are received for all six vertiports; alternates and the 20 % energy reserve policy are in force.',
    mainFlow: `1. ${SYS}: Flags vertiport V3 as approaching its weather limits and lists the affected departures, arrivals and airborne flights. 2. Operations centre duty manager: Declares a weather hold for V3: no departures to or from V3. 3. STK-008: Diverts each airborne flight bound for V3 to its planned alternate within the energy reserve. 4. EXT-001: Accepts the revised flight intents for the diverted flights. 5. ${SYS}: Notifies affected passengers of a new boarding time, an alternate vertiport or a refund. 6. STK-001: Each affected passenger accepts a new time or vertiport, or takes the refund. 7. Operations centre duty manager: Lifts the hold when the forecast has been back inside limits for 30 min; the backlog is re-timed.`,
    alternateFlows: 'A1 (step 3): conditions at the alternate also approach limits while the aircraft is airborne - Divert to the nearest open vertiport within the reserve; if none is reachable within the reserve, declare a priority landing with the ANSP. Rejoin at step 5. A2 (step 2): two or more vertiports reach limits (region-wide event) - Suspend all departures network-wide; land airborne flights at the nearest open vertiport; offer passengers public transport (EXT-005). Scenario ends. A3 (step 7): the hold lasts longer than 2 h - Cancel the remaining bookings to V3 for the day and refund; reposition aircraft for the next morning. Scenario ends.',
    endState: 'Success: All aircraft on the ground or safely diverted; no flight dispatched outside limits; the backlog flown within the day. Failure/degraded: Service at V3 suspended for the day with every affected passenger re-accommodated or refunded and no flight outside limits.',
  }),
]

const ref: EngineeringModel = {
  elements: [
    ...mgo,
    ...needs.map(([id, name, text, , conditions, rationale]) => el(id, name, text, { conditions, rationale })),
    ...caps.map(([id, name, text]) => el(id, name, text)),
    ...scenarios,
    ...arouV1,
  ],
  links: [
    ...['CON-001', 'CON-004', 'CON-005', 'CON-012'].map((c) => ln('MGO-001', 'derives-from', c)),
    ln('MGO-002', 'derives-from', 'MGO-001'), ln('MGO-002', 'derives-from', 'CON-001'),
    ln('MGO-003', 'derives-from', 'MGO-001'), ln('MGO-003', 'derives-from', 'CON-012'),
    ln('MGO-004', 'derives-from', 'MGO-001'), ln('MGO-004', 'derives-from', 'CON-005'),
    ln('MGO-005', 'derives-from', 'MGO-002'),
    ln('MGO-006', 'derives-from', 'MGO-003'),
    ln('MGO-007', 'derives-from', 'MGO-004'),
    ln('MGO-009', 'derives-from', 'MGO-001'), ln('MGO-009', 'derives-from', 'CON-004'),
    ln('MGO-008', 'derives-from', 'MGO-009'),
    ...needs.flatMap(([id, , , parents]) => parents.map((p) => ln(id, 'derives-from', p))),
    ...caps.flatMap(([id, , , parents]) => parents.map((p) => ln(id, 'derives-from', p))),
    ln('CAP-002', 'refines', 'CAP-001', 'Booking and dispatch is a constituent of on-demand transport'),
    ln('CAP-005', 'refines', 'CAP-004', 'Weather-aware operations is a constituent of flight operations'),
    ln('CAP-010', 'refines', 'CAP-003', 'Power control is a constituent of fleet charging management'),
    ln('SCN-001', 'derives-from', 'CAP-002'),
    ln('SCN-002', 'derives-from', 'CAP-001'), ln('SCN-002', 'derives-from', 'CAP-004'),
    ln('SCN-003', 'derives-from', 'CAP-003'),
    ln('SCN-004', 'derives-from', 'CAP-006'),
    ln('SCN-005', 'derives-from', 'CAP-005'),
    ln('STK-001', 'performs', 'SCN-001'),
    ln('STK-008', 'performs', 'SCN-002'),
    ln('STK-005', 'performs', 'SCN-003'),
    ln('STK-009', 'performs', 'SCN-004'),
    ln('EXT-001', 'performs', 'SCN-005', 'ANSP issues and lifts airspace restrictions during the disruption'),
    ln('EXT-003', 'affects', 'SCN-005'),
    ln('U-001', 'affects', 'SCN-005', 'Hold thresholds are TBD-01'),
    ln('U-001', 'affects', 'CAP-005'),
    ln('A-001', 'affects', 'MGO-005', 'Sets the 15 min objective'),
    ln('R-001', 'affects', 'CAP-003'),
    ln('A-007', 'affects', 'CAP-003', 'Sets the charging baseline of the capability-gap analysis (48 charges per charger per day)'),
    ln('A-008', 'affects', 'SCN-005', 'The region-wide suspension (A2) relies on the public-transport fallback'),
  ],
}
export default ref
