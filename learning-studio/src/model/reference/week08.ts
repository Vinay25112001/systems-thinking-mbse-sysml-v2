// Week 8 layer (L8 / CP3): architecture concept. Functions (FN) derived from capabilities with requirements allocated
// to them; the six S04 Lab 5 logical elements (LOG-001..006, plus LOG-007 Vertiport Operations) perform the
// functions and are allocated to the six S04 Lab 6 physical elements (PHY-001..006, plus PHY-007 and PHY-008).
// Every FN is also allocated directly to one PHY (the FN->PHY allocation matrix), and that PHY is always one the
// performing LOG is allocated to. Interfaces (IF) are typed with both ends in `ends`; the five S04 Lab 8 information
// items (INFO-001..005) record producer, consumer and the decision they support. Two AI-enabled capabilities.
// Design elements `satisfies` every REQ-SYS. DEC-002 records the one architecture decision made this week.
// Every FN except FN-013 (a planning function) also derives from the scenario (SCN) in which it is exercised.
// Coverage rule (Week 8): every information flow between two PHY/EXT elements (an AI counts as the PHY it is allocated
// to) crosses an information-typed IF, or a relay recorded in the INFO's `relay` attribute whose every hop does; an
// organisational IF carries no flow. Changes of 2026-10-11 (second batch): IF-010..IF-014, AI-001 -> PHY-005, FN -> SCN
// links, DEC-002 text, IF-002 carries INFO-002 only, INFO-002 includes health and fault reports (see
// docs/authoring/reference_model_notes.md section 1).
//
// FICTIONAL VALUES in this file (teaching values, not real-world data):
//   - 12 aircraft (16 after DEC-001), 4 seats, 150 km/h; 6 vertiports = 3 hubs + 3 spokes; 12 chargers installed =
//     6 high-power turnaround chargers at hubs + 6 standard chargers at spokes (A-002); 1 operations centre with
//     hot standby (DEC-002); 1 maintenance facility
import type { Element, ElementKind, EngineeringModel, Link } from '../engineering'
import { OFFICIAL_ELEMENTS } from '../airtaxi'

const el = (id: string, name: string, text: string, attributes?: Element['attributes'], provenance: Element['provenance'] = 'instructor-reference'): Element => ({
  id, kind: id.split('-')[0] as ElementKind, name, text, attributes, provenance, status: 'active',
})
let n = 0
const ln = (source: string, type: Link['type'], target: string, rationale?: string): Link => ({ id: `LNK-08-${String(++n).padStart(3, '0')}`, source, type, target, rationale })

// [id, name, text, parent CAPs, PHY it is allocated to, scenario it is exercised in (none for FN-013, a planning function)]
const fns: [string, string, string, string[], string, string[]][] = [
  ['FN-001', 'Accept ride request', 'Receive origin, destination and party size; quote fare and boarding-time estimate; confirm the booking.', ['CAP-002'], 'PHY-007', ['SCN-001']],
  ['FN-002', 'Match request to aircraft', 'Select a dispatch-ready aircraft and time slot for a confirmed request.', ['CAP-002'], 'PHY-004', ['SCN-001']],
  ['FN-003', 'Plan flight', 'Produce a route and energy plan that lands with at least the reserve.', ['CAP-004'], 'PHY-004', ['SCN-002']],
  ['FN-004', 'Assess dispatch weather', 'Compare vertiport forecasts with the weather limits and place or lift dispatch holds.', ['CAP-005'], 'PHY-004', ['SCN-005']],
  ['FN-005', 'Fly passenger trip', 'Take off, cruise, approach and land on the published procedures.', ['CAP-001', 'CAP-007'], 'PHY-001', ['SCN-002']],
  ['FN-006', 'Charge aircraft', 'Restore battery energy to the dispatch threshold during the turnaround.', ['CAP-003'], 'PHY-003', ['SCN-003']],
  ['FN-007', 'Control vertiport charging power', 'Share the vertiport connection limit among active charging sessions.', ['CAP-010'], 'PHY-003', ['SCN-003']],
  ['FN-008', 'Assess aircraft health', 'Classify reported and predicted faults as go / no-go and set aircraft availability.', ['CAP-006'], 'PHY-005', ['SCN-004']],
  ['FN-009', 'Manage fleet availability', 'Plan maintenance slots and spare aircraft so that scheduled aircraft-hours are met.', ['CAP-008', 'CAP-006'], 'PHY-004', ['SCN-004']],
  ['FN-010', 'Detect and report pad fire', 'Detect a battery fire on a pad and alert emergency services.', ['CAP-009'], 'PHY-008', ['SCN-003']],
  ['FN-011', 'Dispatch aircraft', 'Release an assigned aircraft for flight after the go / no-go interlock and weather-hold checks.', ['CAP-002', 'CAP-004'], 'PHY-004', ['SCN-002']],
  ['FN-012', 'Coordinate flight intent', 'Exchange route and timing with the air navigation service provider before departure.', ['CAP-004'], 'PHY-004', ['SCN-002']],
  ['FN-013', 'Forecast demand', 'Forecast trips per vertiport pair and hour for scheduling and capacity planning.', ['CAP-008'], 'PHY-004', []],
  ['FN-014', 'Board and alight passengers', 'Move passengers, including wheelchair users, between terminal and cabin.', ['CAP-001'], 'PHY-002', ['SCN-002']],
]

const logText: Record<string, string> = {
  'LOG-001': 'Plans and conducts flights and coordinates with the ANSP.',
  'LOG-002': 'Manages fleet energy, charging and availability.',
  'LOG-003': 'Assesses aircraft health and controls release to service.',
  'LOG-004': 'Handles passenger booking, information and payment.',
  'LOG-005': 'Assigns aircraft to requests and dispatches flights.',
  'LOG-006': 'Provides weather assessment and demand forecasts to operational and planning decisions.',
}
// [LOG, functions performed, PHY allocated to]
const logs: [string, string[], string[]][] = [
  ['LOG-001', ['FN-003', 'FN-005', 'FN-012'], ['PHY-001', 'PHY-004']],
  ['LOG-002', ['FN-006', 'FN-007', 'FN-009'], ['PHY-003', 'PHY-004']],
  ['LOG-003', ['FN-008'], ['PHY-005']],
  ['LOG-004', ['FN-001'], ['PHY-007', 'PHY-004']],
  ['LOG-005', ['FN-002', 'FN-011'], ['PHY-004']],
  ['LOG-006', ['FN-004', 'FN-013'], ['PHY-004']],
  ['LOG-007', ['FN-010', 'FN-014'], ['PHY-002', 'PHY-008']],
]

const phyAttr: Record<string, [string, Element['attributes']]> = {
  'PHY-001': ['Four-seat electric vertical take-off and landing aircraft.', { baselineCount: 12, plannedCount: 16, seats: 4, cruiseKmh: 150, plannedBy: 'DEC-001' }],
  'PHY-002': ['Six vertiports: three hubs with turnaround charging and three spokes.', { sites: 6, hubs: 3, spokes: 3 }],
  'PHY-003': ['Chargers at the vertiports: high-power turnaround chargers at hubs, standard chargers at spokes.', { installed: 12, highPowerAtHubs: 6, standardAtSpokes: 6, chargeMinToDispatch: 20 }],
  'PHY-004': ['Operations centre hosting scheduling, dispatch, flight following and decision support, with a hot standby.', { sites: 1, standby: 'hot', decidedBy: 'DEC-002' }],
  'PHY-005': ['Maintenance facility with battery workshop and diagnostic tools.', { sites: 1 }],
  'PHY-006': ['Air-ground datalink and ground network connecting aircraft, vertiports, chargers, the maintenance facility and the operations centre. It is the medium of the information interfaces IF-002, IF-010, IF-012, IF-013 and IF-014, not an end of any of them, so it has no interface of its own.', { media: 'datalink + ground network' }],
}

const ifs: [string, string, string, 'physical' | 'information' | 'organisational', string, string][] = [
  ['IF-001', 'Aircraft <-> pad', 'Landing loads, tie-down and pad markings for take-off and landing.', 'physical', 'PHY-001 <-> PHY-002', 'mechanical loads, position'],
  ['IF-002', 'Aircraft <-> operations centre datalink', 'Flight following, energy state and health telemetry over the communications infrastructure (PHY-006).', 'information', 'PHY-001 <-> PHY-004', 'INFO-002'],
  ['IF-003', 'Operations centre <-> ANSP', 'Flight intent submission and acceptance before take-off.', 'information', 'PHY-004 <-> EXT-001', 'route, departure time, acceptance'],
  ['IF-004', 'Operations <-> maintenance work-order handover', 'Agreed procedure and responsibilities for withdrawing and returning aircraft to service.', 'organisational', 'PHY-004 <-> PHY-005', 'work orders, release to service'],
  ['IF-005', 'Aircraft <-> charger power', 'DC charging power and battery-management handshake.', 'physical', 'PHY-001 <-> PHY-003', 'electrical energy, charge state'],
  ['IF-006', 'Charger <-> utility grid', 'Grid connection at each vertiport with an agreed power limit (TBD-02).', 'physical', 'PHY-003 <-> EXT-002', 'electrical power'],
  ['IF-007', 'Fire alarm <-> emergency services', 'Automatic battery-fire alarm to the emergency services dispatch centre.', 'information', 'PHY-008 <-> EXT-006', 'alarm, pad location'],
  ['IF-008', 'Booking platform <-> operations centre', 'Confirmed requests to scheduling; assignments and boarding times back to passengers.', 'information', 'PHY-007 <-> PHY-004', 'INFO-001'],
  ['IF-009', 'Vertiport operator <-> AeroLink pad-slot agreement', 'Organisational agreement allocating pad slots and ground-handling duties at each vertiport.', 'organisational', 'PHY-002 <-> PHY-004', 'pad slots, duties'],
  ['IF-010', 'Charger <-> operations centre data', 'Charge-session records and charge-complete status from the chargers to fleet energy management and dispatch, over the ground network (PHY-006).', 'information', 'PHY-003 <-> PHY-004', 'INFO-003 charge-session records, charge-complete status'],
  ['IF-011', 'Weather service <-> operations centre', 'Observed and forecast vertiport weather delivered to dispatch decision support.', 'information', 'EXT-003 <-> PHY-004', 'INFO-004'],
  ['IF-012', 'Maintenance <-> operations centre data', 'Go / no-go status, aircraft availability and release-to-service records from maintenance to dispatch within the 2 min of REQ-SYS-008, over the ground network (PHY-006); charge-session records relayed on to AI-001. IF-004 remains the agreed procedure.', 'information', 'PHY-005 <-> PHY-004', 'INFO-003 go / no-go and maintenance status, charge-session records relayed to AI-001'],
  ['IF-013', 'Aircraft <-> maintenance health data link', 'Health and fault reports from on-board monitoring to the maintenance diagnostic tools over the datalink (PHY-006), so that a no-go fault is flagged without depending on the dispatch platform (R-007).', 'information', 'PHY-001 <-> PHY-005', 'INFO-002 health and fault reports'],
  ['IF-014', 'Vertiport <-> operations centre data', 'Boarding timestamps and gate status from the vertiports to scheduling over the ground network (PHY-006). IF-009 remains the pad-slot agreement.', 'information', 'PHY-002 <-> PHY-004', 'INFO-001 boarding timestamps'],
]

const infoText: Record<string, string> = {
  'INFO-001': 'Ride requests, party size, accessibility needs, confirmation and boarding timestamps.',
  'INFO-002': 'Flight plan, position, energy state, landing energy, and health and fault reports for each flight.',
  'INFO-003': 'Fault reports, deferrals, work orders, release-to-service records and battery charge-session data.',
  'INFO-004': 'Observed and forecast wind, gust and visibility at each vertiport.',
  'INFO-005': 'Fare revenue, operating cost and capital spend by vertiport and aircraft.',
}
const infoAttr: Record<string, Element['attributes']> = {
  'INFO-001': { producer: 'PHY-007 booking platform; PHY-002 boarding gates', consumer: 'PHY-004 scheduling; AI-002', decisionSupported: 'Which aircraft to assign to a request, and when (REQ-SYS-005); wait monitoring (MOE-001)' },
  'INFO-002': { producer: 'PHY-001 aircraft', consumer: 'PHY-004 flight following; PHY-005 maintenance (health and fault reports)', decisionSupported: 'Whether the next leg can be dispatched with the energy reserve (REQ-SYS-003)' },
  'INFO-003': { producer: 'PHY-005 maintenance facility; PHY-003 charge-session records', consumer: 'PHY-004 dispatch; AI-001', decisionSupported: 'Release or withhold an aircraft (REQ-STK-006, REQ-SYS-008)', relay: 'PHY-003 > PHY-004 > PHY-005 over IF-010 and IF-012: charge-session records to AI-001 at the maintenance facility' },
  'INFO-004': { producer: 'EXT-003 weather (via weather service)', consumer: 'PHY-004 decision support', decisionSupported: 'Place or lift a vertiport dispatch hold (REQ-SYS-004)' },
  'INFO-005': { producer: 'PHY-007 fare revenue; LOG-002 operating cost', consumer: 'DEC-001 capacity investment', decisionSupported: 'How much capacity to add and when (DEC-001)' },
}

const ref: EngineeringModel = {
  elements: [
    ...fns.map(([id, name, text]) => el(id, name, text)),
    ...OFFICIAL_ELEMENTS.logical.map((l) => el(l.id, l.name, logText[l.id], { source: l.source }, 'official-S04')),
    el('LOG-007', 'Vertiport Operations', 'Runs passenger flow and pad safety at the vertiports, including fire detection and responder alerting.'),
    ...OFFICIAL_ELEMENTS.physical.map((p) => el(p.id, p.name, phyAttr[p.id][0], { source: p.source, ...phyAttr[p.id][1] }, 'official-S04')),
    el('PHY-007', 'Passenger booking platform', 'Mobile app and booking back end for requests, boarding passes and notifications.'),
    el('PHY-008', 'Pad fire detection and alarm system', 'Thermal and flame detection at every pad with automatic alarm transmission.', { padsCovered: 'all' }),
    ...ifs.map(([id, name, text, type, ends, carries]) => el(id, name, text, { type, ends, carries })),
    ...OFFICIAL_ELEMENTS.information.map((i) => el(i.id, i.name, infoText[i.id], { source: i.source, ...infoAttr[i.id] }, 'official-S04')),
    el('AI-001', 'Predictive maintenance', 'Predicts component and battery degradation from maintenance and charge-session data so that faults are found before they ground an aircraft.',
      { inputs: 'INFO-003 maintenance data incl. cell temperatures and capacity trends', outputs: 'Ranked list of aircraft and packs at risk, with predicted time to limit', humanOversight: 'A certifying technician decides every withdrawal; the model never releases an aircraft', failureMode: 'Missed prediction leaves the reactive FN-008 path as the safety net; false alarms cost availability (MOP-006)' }),
    el('AI-002', 'Demand forecasting', 'Forecasts trips per vertiport pair and hour from booking history for scheduling and capacity planning.',
      { inputs: 'INFO-001 passenger and booking history, calendar, weather outlook', outputs: 'Hourly demand forecast; Year-2 demand re-forecast (A-006)', humanOversight: 'Network planning reviews forecasts quarterly before they feed DEC-001', failureMode: 'Over-forecast strands capital; under-forecast repeats the Week 1 charging-limit (Limits to Growth) problem (R-001)' }),
    el('DEC-002', 'One operations platform with hot standby',
      'Host scheduling and dispatch on one operations platform with an automatic hot standby, rather than distributing dispatch to vertiports.',
      { alternativesConsidered: 'Distributed dispatch at each vertiport; single platform without standby; single platform with hot standby', rationale: 'A single platform gives one network-wide assignment (needed for REQ-SYS-005); the standby removes its single point of failure (R-007).', recommended: 'single platform with hot standby' }),
  ],
  links: [
    ...fns.flatMap(([id, , , caps]) => caps.map((c) => ln(id, 'derives-from', c))),
    ...fns.map(([id, , , , phy]) => ln(id, 'allocated-to', phy)),
    ...logs.flatMap(([log, fs]) => fs.map((f) => ln(log, 'performs', f))),
    ...logs.flatMap(([log, , phys]) => phys.map((p) => ln(log, 'allocated-to', p))),
    // requirement allocation to functions
    ...([
      ['REQ-SYS-001', 'FN-006'], ['REQ-SYS-002', 'FN-005'], ['REQ-SYS-003', 'FN-003'], ['REQ-SYS-004', 'FN-004'], ['REQ-SYS-005', 'FN-002'],
      ['REQ-SYS-006', 'FN-009'], ['REQ-SYS-007', 'FN-005'], ['REQ-SYS-008', 'FN-008'], ['REQ-SYS-009', 'FN-010'], ['REQ-SYS-010', 'FN-007'],
      ['REQ-STK-001', 'FN-001'], ['REQ-STK-006', 'FN-011'], ['REQ-STK-007', 'FN-014'], ['REQ-STK-009', 'FN-012'],
    ] as const).map(([r, f]) => ln(r, 'allocated-to', f)),
    // satisfaction of every REQ-SYS by a design element (and two REQ-STK satisfied by interface / site design)
    ln('PHY-003', 'satisfies', 'REQ-SYS-001'), ln('IF-005', 'satisfies', 'REQ-SYS-001'),
    ln('PHY-001', 'satisfies', 'REQ-SYS-002'),
    ln('LOG-001', 'satisfies', 'REQ-SYS-003'),
    ln('LOG-006', 'satisfies', 'REQ-SYS-004'),
    ln('LOG-005', 'satisfies', 'REQ-SYS-005'),
    ln('LOG-002', 'satisfies', 'REQ-SYS-006'),
    ln('PHY-001', 'satisfies', 'REQ-SYS-007'),
    ln('LOG-003', 'satisfies', 'REQ-SYS-008'),
    ln('PHY-008', 'satisfies', 'REQ-SYS-009'), ln('IF-007', 'satisfies', 'REQ-SYS-009'),
    ln('PHY-003', 'satisfies', 'REQ-SYS-010'), ln('IF-006', 'satisfies', 'REQ-SYS-010'),
    ln('IF-003', 'satisfies', 'REQ-STK-009'),
    ln('PHY-002', 'satisfies', 'REQ-STK-007'),
    // information flows: producer -> INFO -> consumer
    ln('PHY-007', 'flows-to', 'INFO-001'), ln('PHY-002', 'flows-to', 'INFO-001', 'Boarding timestamps'), ln('INFO-001', 'flows-to', 'PHY-004'), ln('INFO-001', 'flows-to', 'AI-002'),
    ln('PHY-001', 'flows-to', 'INFO-002'), ln('INFO-002', 'flows-to', 'PHY-004'), ln('INFO-002', 'flows-to', 'PHY-005'),
    ln('PHY-005', 'flows-to', 'INFO-003'), ln('PHY-003', 'flows-to', 'INFO-003', 'Charge-session records'), ln('INFO-003', 'flows-to', 'PHY-004'), ln('INFO-003', 'flows-to', 'AI-001'),
    ln('EXT-003', 'flows-to', 'INFO-004'), ln('INFO-004', 'flows-to', 'PHY-004'),
    ln('PHY-007', 'flows-to', 'INFO-005'), ln('LOG-002', 'flows-to', 'INFO-005', 'Energy and maintenance operating cost'), ln('INFO-005', 'flows-to', 'DEC-001'),
    // AI capabilities
    ln('AI-001', 'performs', 'FN-008'), ln('AI-001', 'allocated-to', 'PHY-005', 'Hosted where FN-008 sits and its certifying technicians work'), ln('AI-001', 'flows-to', 'PHY-005', 'At-risk list to technicians'),
    ln('AI-002', 'performs', 'FN-013'), ln('AI-002', 'allocated-to', 'PHY-004'), ln('AI-002', 'flows-to', 'DEC-001', 'Year-2 re-forecast'),
    // risk linkage to architecture, and mitigations by design
    ln('R-001', 'affects', 'PHY-003'), ln('R-002', 'affects', 'PHY-001'), ln('R-003', 'affects', 'PHY-001'), ln('R-005', 'affects', 'PHY-003'),
    ln('R-007', 'affects', 'PHY-004'), ln('R-007', 'affects', 'LOG-005'), ln('R-008', 'affects', 'PHY-003'), ln('R-008', 'affects', 'PHY-002'),
    ln('R-004', 'affects', 'LOG-006'),
    ln('PHY-008', 'mitigates', 'R-008'), ln('LOG-003', 'mitigates', 'R-002'), ln('AI-001', 'mitigates', 'R-002'), ln('AI-002', 'mitigates', 'R-001', 'Earlier capacity signal shortens the effective procurement delay'),
    ln('DEC-002', 'mitigates', 'R-007'), ln('DEC-002', 'affects', 'PHY-004'),
    ln('TECH-001', 'affects', 'PHY-003'), ln('TECH-002', 'affects', 'PHY-001'), ln('TECH-003', 'affects', 'PHY-001'),
    // FN derives-from SCN (added 2026-10-11, appended so that the earlier link IDs are unchanged); FN-013 has none
    ...fns.flatMap(([id, , , , , scns]) => scns.map((c) => ln(id, 'derives-from', c, 'Exercised in this scenario (R20b p.594)'))),
  ],
}
export default ref
