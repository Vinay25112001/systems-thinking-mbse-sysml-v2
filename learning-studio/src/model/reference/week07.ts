// Week 7 layer (L7): trade study for the S04 Lab 11 decision "additional aircraft vs additional vertiports",
// framed as: how should AeroLink provide the Year-2 capacity objective (MGO-007, REQ-STK-004)?
// Additive value model v(a) = sum_i w_i * v_i(x_i,a) (S11 p.469) with linear single-attribute value functions
// between a worst (v = 0) and a best (v = 1) anchor, and swing weights (S11 p.467). Sensitivity: vary one weight,
// rescale the others in proportion so the weights still sum to 1, and report where the top rank changes.
//
// FICTIONAL VALUES in this file (teaching values, not real-world data):
//   - 240 trips/day Year-2 planning demand (A-006); 20 trips per aircraft per day; 48 charges per turnaround
//     charger per day (16 h x 60 / 20 min); capacity = min(aircraft x 20, turnaround chargers x 48)
//   - wait from the Week 1 dynamics approximation: w(u) = 2 / (1 - min(u, 0.97)) + max(0, u - 1) x 120 min,
//     u = demand / capacity
//   - unit costs: aircraft USD 3.0 M, high-power charger upgrade USD 0.4 M, new hub vertiport USD 6.0 M
//   - noise exposure = served trips x 2 movements / 16 h / sites x 1.6 peaking factor (busiest vertiport)
//   - resilience = capacity with one hub (2 turnaround chargers) closed / full capacity
//   - swing points 100 / 75 / 40 / 35 -> weights 0.40 / 0.30 / 0.16 / 0.14
// Results (recomputed in reference.detail.test.ts): ALT-004 0.670, ALT-002 0.489, ALT-003 0.458, ALT-001 0.452.
// Rank reversal: cost weight (CRIT-002) above 0.478 -> ALT-001 ranks first; wait weight (CRIT-001) below 0.226 ->
// ALT-003 ranks first.
import type { Element, ElementKind, EngineeringModel, Link } from '../engineering'

const el = (id: string, name: string, text: string, attributes?: Element['attributes'], provenance: Element['provenance'] = 'instructor-reference'): Element => ({
  id, kind: id.split('-')[0] as ElementKind, name, text, attributes, provenance, status: 'active',
})
let n = 0
const ln = (source: string, type: Link['type'], target: string, rationale?: string): Link => ({ id: `LNK-07-${String(++n).padStart(3, '0')}`, source, type, target, rationale })

const crit: Element[] = [
  el('CRIT-001', 'Wait at Year-2 demand', 'Typical passenger wait at 240 trips/day, from the Week 1 dynamics approximation; a proxy for MOE-001.',
    { unit: 'min', sense: 'lower-is-better', valueFunction: 'linear: v = 1 at 5 min, v = 0 at 60 min or more', best: 5, worst: 60, swingPoints: 100, weight: 0.4,
      swingRationale: 'Swinging from a 60 min to a 5 min wait was ranked the most valuable swing: it decides whether passengers stay (A-001).' }),
  el('CRIT-002', 'Capital cost', 'Capital required over months 0-24 to implement the alternative (MOE-005).',
    { unit: 'USD M', sense: 'lower-is-better', valueFunction: 'linear: v = 1 at USD 0 M, v = 0 at USD 20 M', best: 0, worst: 20, swingPoints: 75, weight: 0.3,
      swingRationale: 'Investors (STK-003) rank avoiding USD 20 M of spend second: three quarters of the value of the wait swing.' }),
  el('CRIT-003', 'Capacity retained after loss of a hub', 'Share of network capacity kept when one hub vertiport closes (MOE-006).',
    { unit: '%', sense: 'higher-is-better', valueFunction: 'linear: v = 0 at 50 %, v = 1 at 100 %', best: 100, worst: 50, swingPoints: 40, weight: 0.16,
      swingRationale: 'Hub closures for weather are expected a few days per month (SCN-005); valued at 40 % of the wait swing.' }),
  el('CRIT-004', 'Community noise exposure', 'Peak-hour take-offs and landings at the busiest vertiport (MOE-003).',
    { unit: 'movements/h', sense: 'lower-is-better', valueFunction: 'linear: v = 1 at 5 movements/h, v = 0 at 10 movements/h', best: 5, worst: 10, swingPoints: 35, weight: 0.14,
      swingRationale: 'Each movement already meets 65 dBA (REQ-STK-002); exposure frequency matters to communities (CON-012) but less than service.' }),
]

const alt: Element[] = [
  el('ALT-001', 'Baseline: no added capacity',
    'Keep 12 aircraft and 6 vertiports (3 hubs with 2 turnaround chargers each). Capacity min(240, 288) = 240 trips/day: fleet-limited; fails REQ-STK-004.',
    { baseline: true, aircraft: 12, turnaroundChargers: 6, sites: 6, capacityTripsPerDay: 240, 'CRIT-001': 66.7, 'CRIT-002': 0, 'CRIT-003': 80, 'CRIT-004': 8 }, 'instructor-fictional'),
  el('ALT-002', 'Additional aircraft only',
    'Buy 6 aircraft (18 in total) and keep the charging network. Capacity min(360, 288) = 288 trips/day: becomes charger-limited (R-001); fails REQ-STK-004.',
    { aircraft: 18, turnaroundChargers: 6, sites: 6, capacityTripsPerDay: 288, 'CRIT-001': 12, 'CRIT-002': 18, 'CRIT-003': 66.7, 'CRIT-004': 8 }, 'instructor-fictional'),
  el('ALT-003', 'Additional vertiport only',
    'Build a seventh vertiport as a fourth hub with 2 turnaround chargers; keep 12 aircraft. Capacity min(240, 384) = 240 trips/day: still fleet-limited; fails REQ-STK-004, but spreads movements and adds a hub.',
    { aircraft: 12, turnaroundChargers: 8, sites: 7, capacityTripsPerDay: 240, 'CRIT-001': 66.7, 'CRIT-002': 6, 'CRIT-003': 100, 'CRIT-004': 6.86 }, 'instructor-fictional'),
  el('ALT-004', 'Balanced: aircraft plus hub charging',
    'Buy 4 aircraft (16 in total) and upgrade the 2 chargers at one spoke vertiport to high-power units, making it a fourth hub (TECH-001). Capacity min(320, 384) = 320 trips/day: meets REQ-STK-004.',
    { aircraft: 16, turnaroundChargers: 8, sites: 6, capacityTripsPerDay: 320, 'CRIT-001': 8, 'CRIT-002': 12.8, 'CRIT-003': 90, 'CRIT-004': 8 }, 'instructor-fictional'),
]

const ref: EngineeringModel = {
  elements: [
    el('A-006', 'Year-2 planning demand is 240 trips/day', 'Demand at month 24 is planned at 240 trips/day, equal to the baseline capacity; demand is assumed independent of the alternative chosen.',
      { owner: 'Network Planning Manager', validation: 'Re-forecast quarterly with AI-002 demand forecasting', value: 240, unit: 'trips/day' }, 'instructor-fictional'),
    ...crit,
    ...alt,
    el('DEC-001', 'Year-2 capacity: add aircraft with hub charging',
      'Recommend ALT-004: buy 4 aircraft and convert one spoke vertiport into a fourth hub with high-power chargers. It is the only alternative that meets REQ-STK-004 (320 >= 300 trips/day) and scores 0.670 against 0.489 for the next best. Adding aircraft alone (ALT-002) moves the bottleneck to charging, and adding a vertiport alone (ALT-003) leaves the network fleet-limited.',
      {
        decision: 'How should AeroLink provide the Year-2 capacity objective (S04 Lab 11: additional aircraft vs additional vertiports)?',
        recommended: 'ALT-004',
        scores: 'ALT-004 0.670; ALT-002 0.489; ALT-003 0.458; ALT-001 0.452',
        sensitivityCriterion: 'CRIT-002',
        reversalPoint: 0.478,
        reversalTo: 'ALT-001',
        reversalNote: 'Cost weight above 0.478 (base 0.30) makes the baseline rank first; wait weight below 0.226 (base 0.40) makes ALT-003 rank first. Both changes amount to abandoning MGO-007.',
        conditions: 'Valid while the board weights capital below 0.48, Year-2 demand is near 240 trips/day (A-006) and the spoke site connection supports two high-power chargers (U-002, R-005).',
        residualRisk: 'R-001 reduced but not removed; R-005 at the converted hub; R-002 rises with more cycles on high-power chargers.',
        wouldChangeIf: 'The demand forecast falls to 192 trips/day or less (MGO-007’s 80 % rule would then re-derive REQ-STK-004 as 240 trips/day, which the baseline already provides), the board weights capital above 0.478, or the connection limit (TBD-02) prevents a fourth hub. Aircraft unit cost alone cannot reverse the ranking at base weights: ALT-004 still scores 0.562 with zero cost value.',
      }),
  ],
  links: [
    ln('CRIT-001', 'derives-from', 'MOE-001'),
    ln('CRIT-002', 'derives-from', 'MOE-005'),
    ln('CRIT-003', 'derives-from', 'MOE-006'),
    ln('CRIT-004', 'derives-from', 'MOE-003'),
    ln('DEC-001', 'affects', 'ALT-004', 'Selected alternative'),
    ln('DEC-001', 'affects', 'REQ-STK-004', 'Recommended plan meets the capacity requirement'),
    ln('DEC-001', 'mitigates', 'R-001', 'Charging capacity is added together with aircraft'),
    ln('A-006', 'affects', 'DEC-001'),
    ln('A-006', 'affects', 'CRIT-001'),
    ln('A-002', 'affects', 'ALT-001', 'Defines the 6 turnaround chargers of the baseline'),
    ln('U-002', 'affects', 'DEC-001', 'Fourth hub needs a confirmed connection'),
    ln('R-005', 'affects', 'ALT-004'),
    ln('O-002', 'affects', 'DEC-001', 'Leasing overnight charger time would lower the net cost of ALT-004'),
    ln('TECH-001', 'affects', 'ALT-004'),
  ],
}
export default ref
