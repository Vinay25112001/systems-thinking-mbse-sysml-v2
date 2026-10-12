// Week 4 layer (L4): the requirements set - 10 stakeholder requirements (REQ-STK) derived from needs and
// capabilities, and 10 system requirements (REQ-SYS) derived from them. Each has exactly one "shall", a measurable
// criterion (or a TBD tied to an Unknown), a type, a rationale, a verification method and a parent.
//
// FICTIONAL VALUES in this file (teaching values, not real-world data):
//   - Data Sheet: 65 dBA pad-edge limit, 20 min charge to dispatch threshold (25 min pad turnaround incl. 5 min handling), 20 % energy reserve, 25 km trip,
//     6 vertiports, 16 h operating day
//   - 15 min wait at the 90th percentile (A-001), 300 trips/day capacity (MGO-007: 240 trips/day at <= 80 %
//     utilisation), 16 min block time (25 km at 150 km/h = 10 min cruise + 6 min terminal phases),
//     90 % availability, 60 s assignment for >= 99 % of requests (>= 200 in a peak-hour replay, as VER-005), 2 min no-go
//     flag, >= 5 min from assignment to release, 60 s / 30 s fire alerting
//   - TBD-01 weather limits (U-001), TBD-02 vertiport grid connection limit (U-002)
import type { Element, EngineeringModel, Link } from '../engineering'

type Method = 'test' | 'analysis' | 'inspection' | 'demonstration'
type ReqType = 'functional' | 'performance' | 'interface' | 'constraint'
const req = (id: string, name: string, text: string, type: ReqType, method: Method, criterion: string, rationale: string, extra: Element['attributes'] = {}, provenance: Element['provenance'] = 'instructor-fictional'): Element => ({
  id, kind: 'REQ', name, text, provenance, status: 'active',
  attributes: { level: id.startsWith('REQ-STK') ? 'stakeholder' : 'system', type, method, criterion, rationale, ...extra },
})
let n = 0
const ln = (source: string, type: Link['type'], target: string, rationale?: string): Link => ({ id: `LNK-04-${String(++n).padStart(3, '0')}`, source, type, target, rationale })

const stk: Element[] = [
  req('REQ-STK-001', 'Passenger wait to board',
    'The AeroLink service shall board at least 90 % of passengers in each calendar month within 15 min of their ride confirmation.',
    'performance', 'analysis', '90th-percentile confirmation-to-boarding time <= 15 min per calendar month',
    'Attraction to the service halves at a 15 min wait (A-001); controlling the 90th percentile protects the passengers most likely to churn, not just the average.'),
  req('REQ-STK-002', 'Pad-edge noise limit',
    'The AeroLink service shall keep every take-off and landing at or below 65 dBA LAmax at the pad edge of each vertiport.',
    'constraint', 'test', 'LAmax <= 65 dBA at the pad edge for every movement',
    'The 65 dBA limit is the local agreement with the city; an exceedance puts the operating permit of the vertiport at risk.'),
  req('REQ-STK-003', 'No dispatch outside weather limits',
    'The AeroLink service shall not dispatch a flight when the forecast at its departure or arrival vertiport exceeds the approved aircraft weather limits (TBD-01).',
    'functional', 'demonstration', 'Zero dispatches with a forecast beyond TBD-01 at either end (limits pending U-001)',
    'Weather beyond the approved limits removes the margin the certification basis assumes; the FAA needs assurance that the operation, not just the aircraft, respects those limits.',
    { tbd: 'TBD-01', tbdItem: 'U-001' }, 'instructor-reference'),
  req('REQ-STK-004', 'Network capacity by month 24',
    'The AeroLink service shall provide a capacity of at least 300 trips per day across the six-vertiport network within the 16 h operating day by month 24.',
    'performance', 'analysis', 'Network capacity >= 300 trips/day by month 24',
    'Serving the 240 trips/day planning demand at no more than 80 % utilisation keeps the queue-driven wait near 10 min (Week 1 dynamics model); 240 / 0.8 = 300.'),
  req('REQ-STK-005', 'Hub turnaround time',
    'The AeroLink service shall return an aircraft arriving at a hub vertiport to dispatch-ready status within 25 min of its arrival on the pad.',
    'performance', 'test', 'Pad arrival to dispatch-ready <= 25 min',
    'Turnaround time sets how many departures a pad can support; 25 min is the 20 min Data Sheet charge plus 5 min for rotor stop, safety check, connection and disconnection, with deplaning and boarding overlapping the charge.'),
  req('REQ-STK-006', 'No dispatch with an open no-go fault',
    'The AeroLink service shall confirm that an aircraft has no open no-go fault before each dispatch.',
    'functional', 'demonstration', 'Dispatch blocked in 100 % of demonstrated cases with an open no-go fault',
    'Technicians need the aircraft condition to be known before release whatever the schedule pressure; a dispatch interlock removes the judgement call from the turnaround.',
    {}, 'instructor-reference'),
  req('REQ-STK-007', 'Step-free boarding',
    'The AeroLink service shall allow a passenger using a wheelchair to board and alight at every vertiport without being lifted.',
    'constraint', 'inspection', 'Step-free route from terminal to cabin at all 6 vertiports',
    'Lifting a passenger is unsafe and undignified and excludes passengers who travel with their own mobility aid.',
    {}, 'instructor-reference'),
  req('REQ-STK-008', 'Responder alert time',
    'The AeroLink service shall alert emergency responders to a battery fire on a vertiport pad within 60 s of detection.',
    'performance', 'test', 'Detection-to-responder-alert <= 60 s',
    'Lithium battery fires escalate within minutes; an early alert lets responders arrive with the right equipment.'),
  req('REQ-STK-009', 'Flight intent to the ANSP',
    'The AeroLink service shall provide each flight\'s intended route and departure time to the air navigation service provider before take-off.',
    'interface', 'demonstration', 'Intent accepted by the ANSP for 100 % of demonstrated departures before take-off',
    'The ANSP must know each flight before it enters controlled airspace to separate it from other traffic.',
    {}, 'instructor-reference'),
  req('REQ-STK-010', 'Vertiport power within the grid connection',
    'The AeroLink service shall keep the total charging power drawn at each vertiport within the connection capacity agreed with the utility (TBD-02 kW).',
    'constraint', 'test', 'Peak vertiport charging power <= TBD-02 kW (pending U-002)',
    'Exceeding the agreed connection trips protection or incurs penalty tariffs and erodes the relationship with the utility.',
    { tbd: 'TBD-02', tbdItem: 'U-002' }, 'instructor-reference'),
]

const sys: Element[] = [
  req('REQ-SYS-001', 'Charge to dispatch threshold in 20 min',
    'The charging system shall charge an aircraft from any landing state of charge at or above the 20 % reserve to the dispatch threshold within 20 min.',
    'performance', 'test', 'Charge time from 20 % reserve to dispatch threshold <= 20 min',
    'The worst planned arrival state is the 20 % reserve that every flight plan protects (REQ-SYS-003); meeting 20 min from that state keeps the 25 min hub turnaround of REQ-STK-005 achievable. An aircraft that diverts or holds within the reserve can arrive below 20 %; its turnaround is not covered by this requirement and needs its own allowance (open point for the graduate memo).'),
  req('REQ-SYS-002', 'Aircraft pad-edge noise',
    'The eVTOL aircraft shall produce no more than 65 dBA LAmax at the pad edge during take-off and landing on the published vertiport procedures.',
    'performance', 'test', 'LAmax <= 65 dBA at the pad edge, every measured movement',
    'The aircraft is the noise source; allocating the whole community limit to it keeps the vertiport free of noise-abatement infrastructure.'),
  req('REQ-SYS-003', 'Planned landing energy reserve',
    'The flight planning function shall plan every flight so that the aircraft lands with at least 20 % of its usable battery energy remaining.',
    'performance', 'analysis', 'Planned landing energy >= 20 % of usable energy, every flight plan',
    'The 20 % reserve (Data Sheet) covers a hold or a diversion to the nearest open vertiport in SCN-002 A1 and SCN-005 A1. It derives directly from CAP-004 because no stakeholder requirement carries the energy-planning obligation: the regulator’s need (NEED-002) is met at service level by REQ-STK-003, and the reserve is the flight-planning function’s own contribution to it.'),
  req('REQ-SYS-004', 'Weather dispatch hold',
    'The operations system shall place a dispatch hold on any vertiport whose forecast wind or gust within the next 30 min exceeds the aircraft limit (TBD-01).',
    'functional', 'demonstration', 'Hold placed for every injected forecast above TBD-01 (pending U-001)',
    'A vertiport-level hold implements REQ-STK-003 before a flight is dispatched, rather than relying on each operator\'s judgement.',
    { tbd: 'TBD-01', tbdItem: 'U-001' }, 'instructor-reference'),
  req('REQ-SYS-005', 'Aircraft assignment time',
    'The scheduling function shall assign a dispatch-ready aircraft to at least 99 % of confirmed ride requests within 60 s of confirmation.',
    'performance', 'test', 'Confirmation-to-assignment <= 60 s for at least 99 % of at least 200 requests in a replayed peak-hour request profile',
    'Assignment must be a negligible part of the 15 min wait budget (REQ-STK-001) so that the remaining time is set by aircraft and charger availability.'),
  req('REQ-SYS-006', 'Fleet availability',
    'The fleet shall achieve an availability of at least 90 % of scheduled aircraft-hours in each calendar month.',
    'performance', 'analysis', 'Available aircraft-hours / scheduled aircraft-hours >= 90 % per month',
    'The planning rate of 20 trips per aircraft per day assumes 90 % availability (43 min cycle); lower availability removes capacity needed for REQ-STK-004.'),
  req('REQ-SYS-007', 'Block time for the design trip',
    'The eVTOL aircraft shall complete a 25 km vertiport-to-vertiport trip within 16 min block time in still air.',
    'performance', 'test', 'Block time <= 16 min for a 25 km trip, still air',
    'Block time drives the 43 min aircraft cycle and therefore the capacity of REQ-STK-004 (25 km at 150 km/h = 10 min cruise plus 6 min terminal phases; cycle = 16 min block + 25 min turnaround + 2 min positioning).'),
  req('REQ-SYS-008', 'No-go fault flag time',
    'The maintenance management function shall mark an aircraft unavailable for dispatch within 2 min of a no-go fault being reported.',
    'performance', 'test', 'Fault report to unavailable status <= 2 min',
    'Assignment (REQ-SYS-005) is not release: release follows boarding and the pre-departure check, which take at least 5 min after assignment (FICTIONAL). A 2 min flag therefore removes a faulted aircraft from the pool before it can be released; the REQ-STK-006 interlock also reads open fault reports directly at release, so the flag is not the only barrier.'),
  req('REQ-SYS-009', 'Fire alarm transmission',
    'The vertiport fire detection system shall transmit a battery-fire alarm to the emergency services dispatch centre within 30 s of detection.',
    'interface', 'test', 'Detection to receipt at the dispatch centre <= 30 s',
    'Transmission takes half of the 60 s alert budget of REQ-STK-008, leaving the rest for the dispatch centre to alert crews.'),
  req('REQ-SYS-010', 'Vertiport charging power limit',
    'The charging system shall limit the combined power of all chargers at a vertiport to the configured connection limit (TBD-02 kW).',
    'constraint', 'test', 'Combined charger power <= configured limit under every tested load case (limit pending U-002)',
    'Enforcing the limit in the charging system, not by procedure, keeps REQ-STK-010 met when several aircraft arrive together.',
    { tbd: 'TBD-02', tbdItem: 'U-002' }, 'instructor-reference'),
]

const u002: Element = {
  id: 'U-002', kind: 'U', name: 'Vertiport grid connection limit not agreed',
  text: 'The utility has not confirmed the connection capacity at each vertiport. The charging power limit is held as TBD-02 until the connection agreements are signed.',
  attributes: { owner: 'Vertiport Infrastructure Manager', resolution: 'Connection agreement with the utility for each vertiport', needBy: 'Before the Week 7 trade study', tbd: 'TBD-02' },
  provenance: 'instructor-reference', status: 'active',
}

// [child, parents]
const parents: [string, string[]][] = [
  ['REQ-STK-001', ['NEED-001', 'CAP-001']], ['REQ-STK-002', ['NEED-003', 'CAP-007']], ['REQ-STK-003', ['NEED-002', 'CAP-005']],
  ['REQ-STK-004', ['NEED-005', 'CAP-008']], ['REQ-STK-005', ['NEED-004', 'CAP-003']], ['REQ-STK-006', ['NEED-007', 'CAP-006']],
  ['REQ-STK-007', ['NEED-008', 'CAP-001']], ['REQ-STK-008', ['NEED-006', 'CAP-009']], ['REQ-STK-009', ['NEED-009', 'CAP-004']],
  ['REQ-STK-010', ['NEED-010', 'CAP-010']],
  ['REQ-SYS-001', ['REQ-STK-005']], ['REQ-SYS-002', ['REQ-STK-002']], ['REQ-SYS-003', ['CAP-004']],
  ['REQ-SYS-004', ['REQ-STK-003']], ['REQ-SYS-005', ['REQ-STK-001', 'CAP-002']], ['REQ-SYS-006', ['REQ-STK-004']],
  ['REQ-SYS-007', ['REQ-STK-004']], ['REQ-SYS-008', ['REQ-STK-006']], ['REQ-SYS-009', ['REQ-STK-008']],
  ['REQ-SYS-010', ['REQ-STK-010']],
]

const ref: EngineeringModel = {
  elements: [...stk, ...sys, u002],
  links: [
    ...parents.flatMap(([c, ps]) => ps.map((p) => ln(c, 'derives-from', p))),
    ln('U-001', 'affects', 'REQ-STK-003', 'TBD-01'),
    ln('U-001', 'affects', 'REQ-SYS-004', 'TBD-01'),
    ln('U-002', 'affects', 'REQ-STK-010', 'TBD-02'),
    ln('U-002', 'affects', 'REQ-SYS-010', 'TBD-02'),
    ln('U-002', 'affects', 'CAP-010'),
    ln('A-001', 'affects', 'REQ-STK-001', 'Source of the 15 min threshold'),
    ln('A-002', 'affects', 'REQ-STK-005', 'Turnaround charging happens at the hubs'),
    ln('R-001', 'affects', 'REQ-STK-005'),
  ],
}
export default ref
