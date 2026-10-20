// Week 5 layer (L5): the measures hierarchy. MOE = mission/user effectiveness (measures MGO / NEED / CAP);
// MOP = system characteristic (measures an MOE and >= 1 REQ); TPM = tracked design parameter with threshold,
// objective, current estimate and margin (derives-from an MOP, measures the risky requirement it tracks).
//
// FICTIONAL VALUES in this file (teaching values, not real-world data):
//   - thresholds copy the requirements (15 min, 300 trips/day, 65 dBA, 20 %, 20 min, 16 min, 90 %, 60 s, 2 min, 30 s)
//   - TPM objectives and current estimates (18 min charge, 63.5 dBA, 23 % landing energy) are instructor-set
//     estimates "from analysis" - no real aircraft, charger or test data exist in the course sources
//   - capital and resilience scales used by the Week 7 trade study
import type { Element, ElementKind, EngineeringModel, Link } from '../engineering'

const el = (id: string, name: string, text: string, attributes?: Element['attributes'], provenance: Element['provenance'] = 'instructor-reference'): Element => ({
  id, kind: id.split('-')[0] as ElementKind, name, text, attributes, provenance, status: 'active',
})
let n = 0
const ln = (source: string, type: Link['type'], target: string, rationale?: string): Link => ({ id: `LNK-05-${String(++n).padStart(3, '0')}`, source, type, target, rationale })

const moe: Element[] = [
  el('MOE-001', 'Passenger wait (90th percentile)', 'Monthly 90th-percentile time from ride confirmation to boarding, across all vertiports.',
    { unit: 'min', threshold: 15, sense: 'lower-is-better', dataSource: 'Booking and boarding timestamps (INFO-001)', collection: 'Monthly from launch' }),
  el('MOE-002', 'Daily trips served', 'Revenue trips flown per operating day, network-wide, compared with trips requested.',
    { unit: 'trips/day', threshold: 240, sense: 'higher-is-better', dataSource: 'Flight log (INFO-002) and booking records', collection: 'Daily; reported monthly' }),
  el('MOE-003', 'Noise compliance rate', 'Share of take-offs and landings at or below 65 dBA LAmax at the pad edge.',
    { unit: '%', threshold: 100, sense: 'higher-is-better', dataSource: 'Pad-edge noise monitors at each vertiport', collection: 'Every movement; reported quarterly to the city',
      // Event-cap dimension of the corrected NEED-003, added by Week 3 (src/content/lectures/week03/aerolinkCase.ts EVENT_CAP).
      eventCap: 'Week 3: noise compliance is reported in two parts, the share of movements at or below 65 dBA and the share of evening and early-morning pad-hours within the agreed event cap (measured as MOE-007).' }),
  el('MOE-004', 'Dispatches outside approved limits', 'Number of flights dispatched outside approved weather, energy-reserve or airworthiness limits.',
    { unit: 'count/quarter', threshold: 0, sense: 'lower-is-better', dataSource: 'Dispatch records cross-checked with weather (INFO-004) and maintenance data (INFO-003)', collection: 'Quarterly safety review' }),
  el('MOE-005', 'Capital to meet the Year-2 capacity objective', 'Capital required over months 0-24 to add the capacity in a plan, in USD millions (course cost measure, handled explicitly per RB-6.2).',
    { unit: 'USD M', sense: 'lower-is-better', dataSource: 'Capital plan; unit costs in the Week 7 trade study (FICTIONAL)', collection: 'Per capacity plan' }, 'instructor-fictional'),
  el('MOE-006', 'Capacity retained after loss of one hub', 'Network trip capacity remaining when one hub vertiport is closed (weather or incident), as a share of full capacity.',
    { unit: '%', sense: 'higher-is-better', dataSource: 'Capacity model: min(fleet x 20, turnaround chargers x 48)', collection: 'Per capacity plan; checked after each closure event' }),
]

const mop: Element[] = [
  el('MOP-001', 'Aircraft assignment latency', 'Time from ride confirmation to aircraft assignment (99th percentile).',
    { unit: 's', threshold: 60, sense: 'lower-is-better', dataSource: 'Scheduling event log' }),
  el('MOP-002', 'Charge time to dispatch threshold', 'Time from charge start at the 20 % reserve state to the dispatch threshold.',
    { unit: 'min', threshold: 20, sense: 'lower-is-better', dataSource: 'Charger session records' }),
  el('MOP-003', 'Block time for the 25 km design trip', 'Gate-to-gate time for a 25 km trip in still air.',
    { unit: 'min', threshold: 16, sense: 'lower-is-better', dataSource: 'Flight data (INFO-002)' }),
  el('MOP-004', 'Pad-edge noise level', 'Maximum A-weighted sound level (LAmax) at the pad edge during take-off and landing.',
    { unit: 'dBA', threshold: 65, sense: 'lower-is-better', dataSource: 'Pad-edge noise monitors' }),
  el('MOP-005', 'Landing energy remaining', 'Usable battery energy remaining at landing, as a share of usable energy.',
    { unit: '%', threshold: 20, sense: 'higher-is-better', dataSource: 'Flight data (INFO-002)' }),
  el('MOP-006', 'Fleet availability', 'Available aircraft-hours divided by scheduled aircraft-hours in a calendar month.',
    { unit: '%', threshold: 90, sense: 'higher-is-better', dataSource: 'Maintenance data (INFO-003)' }),
  el('MOP-007', 'No-go fault flag latency', 'Time from a no-go fault report to the aircraft being marked unavailable for dispatch.',
    { unit: 'min', threshold: 2, sense: 'lower-is-better', dataSource: 'Maintenance management event log' }),
  el('MOP-008', 'Fire alarm transmission latency', 'Time from fire detection on a pad to receipt of the alarm at the emergency services dispatch centre.',
    { unit: 's', threshold: 30, sense: 'lower-is-better', dataSource: 'Alarm system timestamps' }),
  el('MOP-009', 'Peak vertiport charging power', 'Highest 1-minute average of combined charger power at a vertiport in a day.',
    { unit: 'kW', threshold: 'TBD-02', sense: 'lower-is-better', dataSource: 'Charger power meters' }),
]

// TPMs: margin = threshold - estimate for lower-is-better; estimate - threshold for higher-is-better.
const tpm: Element[] = [
  el('TPM-001', 'Charge time to dispatch threshold', 'Charge time from 20 % reserve to the dispatch threshold, tracked through charger and battery design maturity.',
    { unit: 'min', sense: 'lower-is-better', threshold: 20, objective: 15, currentEstimate: 18, margin: 2, basis: 'Supplier charge-curve analysis (FICTIONAL estimate)' }, 'instructor-fictional'),
  el('TPM-002', 'Pad-edge noise', 'Aircraft LAmax at the pad edge on the published procedures, tracked through aircraft and procedure design.',
    { unit: 'dBA', sense: 'lower-is-better', threshold: 65, objective: 62, currentEstimate: 63.5, margin: 1.5, basis: 'Noise prediction analysis; no measurement yet (FICTIONAL estimate)',
      // Week 3 TPM decision on the event cap (src/content/lectures/week03/aerolinkCase.ts EVENT_CAP).
      eventCap: 'Week 3 decision: the evening and early-morning event cap gets no aircraft TPM. It is not a design parameter that matures with development; the scheduling function enforces it (REQ-SYS-011, verified by test) and MOP-010 tracks it in operation. TPM-002 tracks the level of each event only.' }, 'instructor-fictional'),
  el('TPM-003', 'Landing energy reserve on the design trip', 'Usable energy remaining after the 25 km design trip, tracked through battery capacity and fade estimates.',
    { unit: '%', sense: 'higher-is-better', threshold: 20, objective: 25, currentEstimate: 23, margin: 3, basis: 'Energy analysis with end-of-life cell capacity (FICTIONAL estimate)' }, 'instructor-fictional'),
]

const ref: EngineeringModel = {
  elements: [...moe, ...mop, ...tpm],
  links: [
    ln('MOE-001', 'measures', 'NEED-001'), ln('MOE-001', 'measures', 'CAP-001'), ln('MOE-001', 'measures', 'MGO-005'),
    ln('MOE-002', 'measures', 'NEED-005'), ln('MOE-002', 'measures', 'CAP-008'), ln('MOE-002', 'measures', 'MGO-007'),
    ln('MOE-003', 'measures', 'NEED-003'), ln('MOE-003', 'measures', 'CAP-007'), ln('MOE-003', 'measures', 'MGO-006'),
    ln('MOE-004', 'measures', 'NEED-002'), ln('MOE-004', 'measures', 'CAP-004'), ln('MOE-004', 'measures', 'CAP-005'), ln('MOE-004', 'measures', 'MGO-008'),
    ln('MOE-005', 'measures', 'NEED-005'), ln('MOE-005', 'measures', 'MGO-004'),
    ln('MOE-006', 'measures', 'NEED-001'), ln('MOE-006', 'measures', 'CAP-005'),
    ln('MOP-001', 'measures', 'MOE-001'), ln('MOP-001', 'measures', 'REQ-SYS-005'),
    ln('MOP-002', 'measures', 'MOE-001'), ln('MOP-002', 'measures', 'REQ-SYS-001'), ln('MOP-002', 'measures', 'REQ-STK-005'),
    ln('MOP-003', 'measures', 'MOE-002'), ln('MOP-003', 'measures', 'REQ-SYS-007'),
    ln('MOP-004', 'measures', 'MOE-003'), ln('MOP-004', 'measures', 'REQ-SYS-002'), ln('MOP-004', 'measures', 'REQ-STK-002'),
    ln('MOP-005', 'measures', 'MOE-004'), ln('MOP-005', 'measures', 'REQ-SYS-003'),
    ln('MOP-006', 'measures', 'MOE-002'), ln('MOP-006', 'measures', 'REQ-SYS-006'),
    ln('MOP-007', 'measures', 'MOE-004'), ln('MOP-007', 'measures', 'REQ-SYS-008'),
    ln('MOP-008', 'measures', 'MOE-004'), ln('MOP-008', 'measures', 'REQ-SYS-009'), ln('MOP-008', 'measures', 'REQ-STK-008'),
    ln('MOP-009', 'measures', 'MOE-002'), ln('MOP-009', 'measures', 'REQ-SYS-010'),
    ln('TPM-001', 'derives-from', 'MOP-002'), ln('TPM-001', 'measures', 'REQ-SYS-001'),
    ln('TPM-002', 'derives-from', 'MOP-004'), ln('TPM-002', 'measures', 'REQ-SYS-002'),
    ln('TPM-003', 'derives-from', 'MOP-005'), ln('TPM-003', 'measures', 'REQ-SYS-003'),
  ],
}
export default ref
