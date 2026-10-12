// Week 12 layer (L12): verification activities. Each VER verifies one requirement with the method recorded on that
// requirement (test | analysis | inspection | demonstration), and states objective, subject, level, environment,
// success criterion and verdict logic (pass / fail / inconclusive / error, the four outcomes RB-10.3 asks for).
// Verification answers "built right" against the requirement; validation against MOEs and scenarios is separate.
//
// FICTIONAL VALUES in this file (teaching values, not real-world data):
//   - thresholds repeat the requirements; sample sizes (30 charges, 50 movements, 200 requests, 20 injections,
//     10 alarms, 3 months) are instructor-set
import type { Element, EngineeringModel, Link } from '../engineering'

type Method = 'test' | 'analysis' | 'inspection' | 'demonstration'
const verdict = (pass: string, fail: string, inconclusive: string) =>
  `pass: ${pass}; fail: ${fail}; inconclusive: ${inconclusive}; error: the procedure or instrumentation was not executed as planned (repeat the run).`
const ver = (id: string, name: string, target: string, method: Method, objective: string, subject: string, level: string, environment: string, successCriterion: string, verdictLogic: string): [Element, string] => [
  { id, kind: 'VER', name, text: objective, provenance: 'instructor-reference', status: 'active', attributes: { method, objective, subject, level, environment, successCriterion, verdictLogic, verifies: target } },
  target,
]
let n = 0
const ln = (source: string, type: Link['type'], target: string, rationale?: string): Link => ({ id: `LNK-12-${String(++n).padStart(3, '0')}`, source, type, target, rationale })

const vers: [Element, string][] = [
  ver('VER-001', 'Turnaround charge-time test', 'REQ-SYS-001', 'test',
    'Show that a hub charger restores an aircraft from the 20 % reserve to the dispatch threshold within 20 min.', 'PHY-003 with PHY-001 (IF-005)', 'system', 'Hub vertiport, ambient 0-35 C',
    'All 30 charges from 20 % (+0/-1 %) state of charge reach the dispatch threshold in <= 20.0 min',
    verdict('all 30 charges <= 20.0 min', 'any charge > 20.0 min', 'fewer than 30 valid charges, or start state of charge outside tolerance')),
  ver('VER-002', 'Pad-edge noise measurement', 'REQ-SYS-002', 'test',
    'Measure aircraft LAmax at the pad edge for take-offs and landings on the published procedures.', 'PHY-001', 'system', 'Each vertiport, wind <= 10 kt, calibrated class 1 sound level meters at the pad edge',
    'Every one of 50 measured movements <= 65.0 dBA LAmax',
    verdict('all 50 movements <= 65.0 dBA', 'any movement > 65.0 dBA', 'background noise within 10 dB of the event, or fewer than 50 valid movements')),
  ver('VER-003', 'Landing energy reserve analysis', 'REQ-SYS-003', 'analysis',
    'Show by energy analysis that the flight planning function never produces a plan landing below 20 % usable energy.', 'LOG-001 flight planning with PHY-001 energy model', 'system', 'Model-based: all vertiport pairs, headwinds to the planning limit, end-of-life battery capacity',
    'Minimum planned landing energy >= 20 % for every vertiport pair and wind case',
    verdict('all cases >= 20 %', 'any case < 20 %', 'energy model not validated against flight data (INFO-002)')),
  ver('VER-004', 'Weather dispatch-hold demonstration', 'REQ-SYS-004', 'demonstration',
    'Demonstrate that injected forecasts above the weather limit place a dispatch hold on the affected vertiport.', 'LOG-006 on PHY-004', 'system', 'Operations centre with recorded and injected forecasts; limit TBD-01 set to a placeholder until U-001 closes',
    'Holds placed for all 20 injected exceedances and for none of 20 in-limit forecasts',
    verdict('20 of 20 holds and 0 false holds', 'any missed hold', 'TBD-01 not yet set to the approved limit (verdict re-run when U-001 closes)')),
  ver('VER-005', 'Aircraft assignment latency test', 'REQ-SYS-005', 'test',
    'Show that confirmed requests are assigned a dispatch-ready aircraft within 60 s.', 'LOG-005 on PHY-004 with PHY-007', 'subsystem', 'Operations platform with a replayed peak-hour request profile',
    '99th percentile of 200 assignments <= 60 s',
    verdict('99th percentile <= 60 s', '99th percentile > 60 s', 'fewer than 200 assignments or no dispatch-ready aircraft in the replay')),
  ver('VER-006', 'Fleet availability analysis', 'REQ-SYS-006', 'analysis',
    'Show from maintenance records that available aircraft-hours are at least 90 % of scheduled aircraft-hours.', 'LOG-002 with LOG-003 (fleet)', 'system', 'First 3 months of operation, maintenance data (INFO-003)',
    'Monthly availability >= 90 % in each of 3 consecutive months',
    verdict('all 3 months >= 90 %', 'any month < 90 %', 'records incomplete for any month')),
  ver('VER-007', 'Design-trip block-time flight test', 'REQ-SYS-007', 'test',
    'Show that the aircraft flies the 25 km design trip within 16 min block time.', 'PHY-001', 'system', 'Flight test between two vertiports 25 km apart; corrected to still air',
    'Mean corrected block time of 10 flights <= 16.0 min and no flight > 17.0 min',
    verdict('both conditions met', 'either condition not met', 'wind correction > 2 min on any flight')),
  ver('VER-008', 'No-go fault flag test', 'REQ-SYS-008', 'test',
    'Show that a reported no-go fault makes the aircraft unavailable for dispatch within 2 min.', 'LOG-003 on PHY-005 and PHY-004', 'subsystem', 'Integration test bench with injected fault reports',
    'All 20 injected no-go faults set the aircraft unavailable in <= 2 min and the dispatch interlock blocks release',
    verdict('20 of 20 within 2 min and blocked', 'any late flag or any release', 'fault injection not acknowledged by the bench')),
  ver('VER-009', 'Fire alarm transmission test', 'REQ-SYS-009', 'test',
    'Show that a pad fire alarm reaches the emergency services dispatch centre within 30 s.', 'PHY-008 with IF-007', 'system', 'Each vertiport, with the dispatch centre on a test line',
    'All 10 test alarms received in <= 30 s with the correct pad location',
    verdict('10 of 10 <= 30 s and correct location', 'any alarm > 30 s or wrong location', 'test line unavailable during a trial')),
  ver('VER-010', 'Vertiport power-limit test', 'REQ-SYS-010', 'test',
    'Show that combined charger power at a vertiport never exceeds the configured connection limit.', 'PHY-003 with IF-006', 'subsystem', 'Hub vertiport with two aircraft arriving together; limit set to TBD-02 placeholder',
    '1-minute average combined power <= configured limit in all load cases',
    verdict('all load cases within limit', 'any 1-minute average above the limit', 'limit not yet agreed (U-002); re-run with the signed value')),
  ver('VER-011', 'Step-free boarding inspection', 'REQ-STK-007', 'inspection',
    'Inspect every vertiport for a step-free route from terminal to cabin for a passenger using a wheelchair.', 'PHY-002 with PHY-001 cabin door', 'system', 'All 6 vertiports',
    'A step-free route exists at 6 of 6 vertiports',
    verdict('6 of 6 vertiports', 'any vertiport without a step-free route', 'a vertiport not accessible for inspection')),
]

const ref: EngineeringModel = {
  elements: vers.map(([v]) => v),
  links: [
    ...vers.map(([v, target]) => ln(v.id, 'verifies', target)),
    ln('VER-002', 'mitigates', 'R-003', 'Early measurement exposes an exceedance before revenue service'),
    ln('VER-010', 'mitigates', 'R-005', 'Shows the limit holds with simultaneous arrivals'),
  ],
}
export default ref
