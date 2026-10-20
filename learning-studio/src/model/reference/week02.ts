// Week 2 layer (L2): stakeholders (the instructor calibration example from the stakeholder editor), their concerns
// (CON derives-from STK; every stakeholder has at least one concern of its own) and AROU register v0 (one each of A, R,
// O, U plus the hub-charging assumption A-002 and the charger-occupancy convention A-007).
//
// FICTIONAL VALUES in this file (teaching values, not real-world data):
//   - 15 min passenger wait tolerance (A-001; the `waitToleranceMin` default of src/sim/aerolink.ts)
//   - 3 hub vertiports x 2 turnaround chargers = 6 effective chargers (A-002; reconciles the Data Sheet's
//     6 vertiports x 2 chargers with the dynamics model's 6 chargers)
//   - 20 min charger occupancy per turnaround, 48 charges per charger per 16 h day (A-007; course-wide convention)
//   - risk ratings (likelihood / consequence on the course 5x5 scale)
import type { Element, ElementKind, EngineeringModel, Link } from '../engineering'
import { INSTRUCTOR_EXAMPLE } from '../airtaxi'

const el = (id: string, name: string, text: string, attributes?: Element['attributes'], provenance: Element['provenance'] = 'instructor-reference'): Element => ({
  id, kind: id.split('-')[0] as ElementKind, name, text, attributes, provenance, status: 'active',
})
let n = 0
const ln = (source: string, type: Link['type'], target: string, rationale?: string): Link => ({ id: `LNK-02-${String(++n).padStart(3, '0')}`, source, type, target, rationale })

const stakeholders = INSTRUCTOR_EXAMPLE.stakeholders.map(
  (s): Element => ({
    id: s.id,
    kind: 'STK',
    name: s.name,
    text: s.concern,
    attributes: { category: s.category, interest: s.interest, influence: s.influence },
    provenance: s.provenance === 'official-S04' ? 'official-S04' : 'instructor-reference',
    status: 'active',
  }),
)

// Concerns: one stakeholder's stake, stated as the matter that worries them (not yet a need).
const concerns: [string, string, string, string[]][] = [
  ['CON-001', 'Predictable waiting time', 'Passengers judge the service by how long they wait between confirming a ride and boarding, and by whether that wait is predictable.', ['STK-001']],
  ['CON-002', 'Personal safety in flight', 'Passengers must be confident that every flight is safe before they will use a new mode of transport.', ['STK-001']],
  ['CON-003', 'Affordable fare', 'Passengers compare the fare with ride-hail and public transport for the same trip.', ['STK-001']],
  ['CON-004', 'Airworthiness and operational safety', 'The FAA is concerned that aircraft and operations stay within approved safety limits at all times, including in adverse weather.', ['STK-002']],
  ['CON-005', 'Return on capital and path to scale', 'Investors are concerned that capital spent on aircraft and vertiports produces capacity that is actually used.', ['STK-003']],
  ['CON-006', 'Pad throughput and charging capacity', 'Vertiport operators are concerned that charging and turnaround, not demand, limit how many flights a pad can handle.', ['STK-005']],
  ['CON-007', 'Battery-fire response at vertiports', 'Emergency responders are concerned about early warning, access and procedures for a lithium battery fire on a pad.', ['STK-006']],
  ['CON-008', 'Airspace integration', 'The air navigation service provider is concerned that air-taxi traffic is known and separated from other airspace users.', ['STK-007']],
  ['CON-009', 'Operator workload and automation trust', 'Pilots and remote operators are concerned about workload, duty time and how far they can trust automated decision aids.', ['STK-008']],
  ['CON-010', 'Turnaround pressure on maintenance', 'Maintenance technicians are concerned that schedule pressure leads to aircraft being released without a clear condition picture.', ['STK-009']],
  ['CON-011', 'Peak grid load', 'The electric utility is concerned about simultaneous high-power charging exceeding the agreed connection capacity at a vertiport.', ['STK-010']],
  ['CON-012', 'Community noise', 'Residents near vertiports are concerned about take-off and landing noise, how often it occurs and at what hours.', ['STK-004']],
  ['CON-013', 'Step-free boarding access', 'Accessibility advocates are concerned that passengers using wheelchairs can board and alight without being lifted.', ['STK-014']],
  ['CON-014', 'Quantifiable operational risk', 'Insurers are concerned that operational risk is measured and recorded so that premiums can be set on evidence.', ['STK-012']],
  // W2-F04: every stakeholder has a concern of its own (STK-011 had none; STK-013 shared the residents' noise concern).
  // Week 8 model import: CON-015 reworded as the case's purchase-agreement concern (the deliberate audit gap of Week 1).
  ['CON-015', 'Fleet orders and delivery milestones', 'The aircraft manufacturer is concerned that AeroLink’s aircraft orders, delivery slots and payment milestones are kept as agreed in the purchase agreement, because they set its own production plan.', ['STK-011']],
  ['CON-016', 'Land use and zoning of vertiport sites', 'The City planning authority is concerned that vertiport sites conform to zoning and land-use plans and connect to public transport, especially sites in residential districts.', ['STK-013']],
]

const arou: Element[] = [
  el('A-001', 'Passenger wait tolerance is 15 min',
    'Passenger attraction to the service halves when the typical wait reaches 15 min (the Week 1 dynamics model parameter). Waits above this drive churn.',
    { owner: 'Head of Customer Experience', validation: 'Compare with booking-abandonment data in the first 3 months of operation (MOE-001).', value: 15, unit: 'min' }, 'instructor-fictional'),
  el('A-002', 'Turnaround charging is concentrated at 3 hub vertiports',
    'Of the 6 vertiports (2 chargers each, Data Sheet), 3 hubs carry turnaround charging with high-power chargers; the 6 chargers at the 3 spoke vertiports are standard units used for overnight and opportunity top-up. The effective turnaround charging pool is therefore 6 chargers, which is the charger count used by the Week 1 dynamics model.',
    { owner: 'Network Planning Manager', validation: 'Confirm against the vertiport charger specification before the Week 7 trade study.', hubVertiports: 3, turnaroundChargers: 6, installedChargers: 12 }, 'instructor-fictional'),
  // Course-wide charger-occupancy convention (DECISION_LOG W8). Used by Week 1 (dynamics), Week 3 (gap analysis) and
  // Week 7 (trade study: capacity = min(aircraft x 20, chargers x 48)).
  el('A-007', 'A turnaround charger is occupied 20 min per turnaround',
    'The 25 min hub turnaround (REQ-STK-005) is 5 min of rotor stop, safety check and charger connection and disconnection plus 20 min of charging (REQ-SYS-001), with deplaning and boarding overlapping the charge (the Week 4 derivation). Each hub has two pads per turnaround charger, and the charger is switched to the other pad during the 5 min of pad work, so it delivers one 20 min charge per turnaround and up to 48 charges in the 16 h operating day (960 min / 20 min). This is the convention used by the Week 1 dynamics model, the Week 3 gap analysis and the Week 7 trade study; 25 min per charge (one charger per pad, held for the whole turnaround) is a sensitivity case.',
    { owner: 'Network Planning Manager', validation: 'Confirm by a turnaround time-and-motion trial at a hub before the Week 7 trade study; if a hub cannot provide two pads per turnaround charger, re-run the capacity figures at 25 min (38.4 charges per charger per day).', occupancyMin: 20, turnaroundMin: 25, padWorkMin: 5, padsPerTurnaroundCharger: 2, chargesPerChargerPerDay: 48 }, 'instructor-fictional'),
  el('R-001', 'Charging capacity lags fleet growth',
    'Condition: the capital plan adds aircraft when utilisation is high but holds the number of turnaround chargers fixed. If fleet growth outpaces turnaround charging capacity, then aircraft queue for chargers, the 90th-percentile passenger wait rises above 15 min and riders churn (the Week 1 Limits-to-Growth structure: the charging limit; it would become Growth and Underinvestment only if stalled growth were used to justify withholding charger investment).',
    { likelihood: 3, consequence: 4, owner: 'Network Planning Manager', handling: 'mitigate', treatment: 'Tie every aircraft order to a charging-capacity check; decided in DEC-001 (ALT-004 adds hub chargers with aircraft).', trigger: 'Charger queue time above 5 min on 3 consecutive days' }),
  el('O-001', 'Integrated public-transport ticketing',
    'If AeroLink trips can be booked within the regional public-transport journey planner, first-and-last-mile friction falls and demand may grow faster than the planning forecast.',
    { owner: 'Head of Partnerships', action: 'Open data-sharing talks with the transport authority; evaluate in the Year-2 capacity plan.', likelihood: 3, benefit: 3 }),
  el('U-001', 'Aircraft weather limits not yet published',
    'The OEM has not published the approved crosswind, gust and visibility limits for the aircraft. Weather-hold thresholds in requirements are held as TBD-01 until they are known.',
    { owner: 'Director of Flight Operations', resolution: 'Obtain limits from the OEM flight manual draft', needBy: 'Before CP2 requirements baseline (Week 6)', tbd: 'TBD-01' }),
]

const ref: EngineeringModel = {
  elements: [
    ...stakeholders,
    ...concerns.map(([id, name, text]) => el(id, name, text)),
    ...arou,
  ],
  links: [
    ...concerns.flatMap(([id, , , stks]) => stks.map((s) => ln(id, 'derives-from', s))),
    ln('A-001', 'affects', 'CON-001', 'Sets the wait level at which the concern turns into lost riders'),
    ln('A-002', 'affects', 'CON-006', 'Defines which chargers limit turnaround throughput'),
    ln('A-007', 'affects', 'CON-006', 'Sets how many turnaround charges one charger delivers per day'),
    ln('R-001', 'affects', 'CON-001', 'Charger queues lengthen passenger waits'),
    ln('R-001', 'affects', 'CON-006', 'Charging becomes the throughput limit'),
    ln('O-001', 'affects', 'CON-005', 'Faster demand growth improves utilisation of capital'),
    ln('U-001', 'affects', 'CON-004', 'Weather limits are part of the approved safety envelope'),
  ],
}
export default ref
