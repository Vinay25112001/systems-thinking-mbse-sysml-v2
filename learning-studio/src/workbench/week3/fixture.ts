// A complete, realistic Week 3 Team Record for a FICTIONAL student team: the Riverside Food Bank Network of the Week 1
// and Week 2 fixtures (src/workbench/week2/fixture.ts, read-only), continuing its own record. Used by the unit and
// component tests; it must pass every Week 3 check, and record.test.ts mutates it to prove each check can fail. Not
// imported by application code. Never AeroLink.
import { modelInputs as week2ModelInputs } from '../week2/record'
import { week2Fixture } from '../week2/fixture'
import { EMPTY_RECORD, importWeek2File, normalizeRecord, withWeek2, type Week3Record } from './record'

/** The Week 2 model-inputs file the team exported from the Week 2 lab tool. */
export const WEEK2_JSON = JSON.stringify(week2ModelInputs(week2Fixture()))

export function week3Fixture(): Week3Record {
  const imported = importWeek2File(WEEK2_JSON)
  if ('error' in imported) throw new Error(imported.error)
  const base = withWeek2(EMPTY_RECORD, imported.snapshot)
  return normalizeRecord({
    ...base,
    technologies: [
      {
        id: 'TECH-001', name: 'Wireless freezer sensors with a cellular alarm gateway',
        does: 'Battery sensors in each freezer report the temperature every minute to a gateway that phones the on-call staff member when a limit is crossed.',
        benefits: 'Night and weekend failures are found in minutes instead of on Monday morning.', limitations: 'Depends on the cellular network and on sensor batteries being replaced on time.',
        trl: 8, basisKind: 'evidence', evidence: 'Vendor qualification test report for the sensor and gateway, and the county extension office’s 2025 pilot at two food pantries.',
        critical: true, criticalWhy: 'The freezer alarm time (REQ-STK-004) cannot be met without it.', affects: 'REQ-STK-004, REQ-SYS-001, CAP-003', maturityRisk: '',
      },
      {
        id: 'TECH-002', name: 'Route planning software with a shift-length limit',
        does: 'Plans each delivery route from the week’s orders so that loading, driving and unloading fit inside the driver’s shift.',
        benefits: 'Shifts stop overrunning; dispatchers stop improvising routes.', limitations: 'Planned driving times come from map data and may be optimistic at school-run hours.',
        trl: 7, basisKind: 'assumption', assumption: 'A-002',
        critical: true, criticalWhy: 'Shifts within two hours (REQ-SYS-002) depend on realistic planned durations.', affects: 'REQ-SYS-002, CAP-004', maturityRisk: 'R-005',
      },
      {
        id: 'TECH-003', name: 'Eutectic cold plates for the van cargo areas',
        does: 'Plates frozen overnight keep the van cargo cold for a delivery round without running the engine-driven refrigeration unit.',
        benefits: 'Quieter loading on Mill Street and less engine idling.', limitations: 'Hold time falls in hot weather; plates must be refrozen every night.',
        trl: 5, basisKind: 'assumption', assumption: 'A-003',
        critical: true, criticalWhy: 'The van cargo limit (REQ-SYS-003) would rest on them on summer rounds.', affects: 'REQ-SYS-003, CAP-002', maturityRisk: 'R-001',
      },
    ],
    assumptions: [
      ...base.assumptions,
      { id: 'A-002', name: 'Route planning software is at TRL 7', text: 'The vendor’s software has been used by two other food banks of similar size.', owner: 'TL', validation: 'Run one month of our orders through the trial version and compare planned with actual shift times.' },
      { id: 'A-003', name: 'Cold plates are at TRL 5', text: 'The supplier validated the plates in a laboratory cargo box at 20 °C ambient.', owner: 'AK', validation: 'Test one van on a full summer round at 30 °C or more before buying plates for all four vans.' },
    ],
    unknowns: base.unknowns.map((u) => (u.id === 'U-001' ? { ...u, affects: 'REQ-STK-004, TECH-001' } : u)),
    risks: [
      {
        id: 'R-001', name: 'Cold plates too short in summer heat', category: 'technology',
        condition: 'the cold plates have been validated only in a laboratory box at 20 °C (A-003)', ifEvent: 'they hold the cargo at or below 5 °C for less than three hours on rounds above 30 °C',
        then: 'loads exceed the cold-chain limit and the pantry must discard the food',
        likelihood: 3, consequence: 4, likelihoodWhy: 'Laboratory hold time at 20 °C says little about a hot van with the door opening at four pantries.', consequenceWhy: 'A stakeholder requirement, the cold-chain limit, would be missed on summer rounds.',
        handling: 'mitigate', owner: 'AK', treatment: 'Summer field test on one van before purchase; keep the refrigeration units as the fallback; track TPM-001.', trigger: 'TPM-001 margin below 0.1 h', affects: 'REQ-SYS-003, TECH-003, TPM-001',
      },
      {
        id: 'R-002', name: 'Alarm settings changed through the shared account', category: 'security',
        condition: 'the alarm gateway is managed through one vendor cloud account whose password three staff members share', ifEvent: 'an unauthorized person changes the alarm limit or silences the alarms',
        then: 'a freezer failure goes unnoticed and the stored food spoils',
        likelihood: 2, consequence: 4, likelihoodWhy: 'Shared passwords leak through former staff and phones; no change log is kept today.', consequenceWhy: 'The freezer alarm requirement would be defeated without anyone knowing.',
        handling: 'mitigate', owner: 'RM', treatment: 'Individual accounts with two-factor sign-in; alarm settings reviewed weekly against the change log.', trigger: 'Any alarm-setting change not in the change log', affects: 'REQ-STK-004, CAP-003',
      },
      {
        id: 'R-003', name: 'Weekend power cut at the warehouse', category: 'resilience',
        condition: 'the warehouse has one grid connection and no backup generator', ifEvent: 'a power cut longer than four hours hits the district on a weekend',
        then: 'freezer stock warms past the limit and must be quarantined, and deliveries stop until it is replaced',
        likelihood: 2, consequence: 4, likelihoodWhy: 'The utility reports one or two long outages a year in the district.', consequenceWhy: 'Deliveries stop and the cold-chain limit is missed for the stock in storage.',
        handling: 'mitigate', owner: 'JS', treatment: 'Install a generator hookup and agree a rental contract; the federation truck (A-001) is the recovery route.', trigger: 'Utility outage notice for the district', affects: 'REQ-STK-002, CAP-002, SCN-002',
      },
      {
        id: 'R-004', name: 'Too few summer drivers', category: 'external',
        condition: 'driver sign-ups dropped by a third last July and August', ifEvent: 'fewer than six drivers sign up for a week in July',
        then: 'some pantries get no delivery that week and their shelves run out of produce early',
        likelihood: 3, consequence: 3, likelihoodWhy: 'The same summer drop is likely again without action.', consequenceWhy: 'A system-level plan needs a workaround; one district is short for a week.',
        handling: 'mitigate', owner: 'RM', treatment: 'Recruit student volunteers in May; pair new drivers with experienced ones.', trigger: 'Fewer than eight drivers signed up two weeks ahead', affects: 'REQ-STK-005, SCN-001',
      },
      {
        id: 'R-005', name: 'Planned routes shorter than real ones', category: 'performance',
        condition: 'the route software’s maturity rests on other food banks’ use (A-002)', ifEvent: 'planned durations underestimate real rounds by more than 15 minutes at school-run hours',
        then: 'volunteer shifts overrun their two hours and drivers drop out',
        likelihood: 3, consequence: 3, likelihoodWhy: 'Map-based driving times are often optimistic in town traffic.', consequenceWhy: 'A system requirement, the route fitting the shift, is missed at times.',
        handling: 'mitigate', owner: 'TL', treatment: 'Calibrate the software with our own logged round times; track TPM-002.', trigger: 'TPM-002 margin below 2 minutes', affects: 'REQ-SYS-002, TPM-002',
      },
      {
        id: 'R-006', name: 'Funders change their report template', category: 'schedule-cost',
        condition: 'funders revise their reporting templates every year', ifEvent: 'a funder changes its template in the third quarter',
        then: 'the export no longer fits and the quarterly reach report is late',
        likelihood: 2, consequence: 2, likelihoodWhy: 'Templates changed in two of the last three years.', consequenceWhy: 'A few days of rework; no requirement is missed for long.',
        handling: 'accept', owner: 'RM', treatment: '', trigger: 'Funder notice of a new template', affects: 'REQ-SYS-004',
      },
    ],
    opportunities: [
      { id: 'O-001', name: 'Grocery chain sensor donation', text: 'A grocery chain replacing its store sensors may donate working units, which would cut the sensor cost of the alarm system.', owner: 'JS', action: 'Ask the chain’s community officer before ordering sensors.' },
    ],
    issues: [
      { id: 'I-001', name: 'Van 3 refrigeration unit out of service', text: 'Van 3 failed its temperature test on 14 October and is in the repair shop for at least two weeks.', owner: 'AK', action: 'Cover its routes with the other three vans until it returns.' },
    ],
    tpms: [
      {
        id: 'TPM-001', name: 'Cargo hold time at 32 °C ambient', measures: 'REQ-SYS-003', derivesFrom: 'MOP-003', unit: 'h', sense: 'higher-is-better',
        threshold: '3', objective: '4', cbe: '3.4', contingency: '0.3', basis: 'Supplier laboratory curve scaled to 32 °C by the supplier’s engineer.', relatedRisk: 'R-001',
        profile: [{ label: 'Summer field test', month: '2', cbe: '3.4', contingency: '0.2' }, { label: 'Purchase decision', month: '4', cbe: '3.5', contingency: '0.1' }],
      },
      {
        id: 'TPM-002', name: 'Planned route duration', measures: 'REQ-SYS-002', derivesFrom: 'MOP-002', unit: 'min', sense: 'lower-is-better',
        threshold: '110', objective: '95', cbe: '100', contingency: '6', basis: 'Trial-version plans for two weeks of orders, before calibration.', relatedRisk: 'R-005',
        profile: [{ label: 'After calibration', month: '1', cbe: '100', contingency: '4' }, { label: 'Second month in use', month: '2', cbe: '98', contingency: '2' }],
      },
    ],
    trade: {
      decision: 'How should the Riverside Food Bank Network keep fresh produce on pantry shelves until closing within two-hour volunteer shifts and the cold-chain limit?',
      trace: 'REQ-STK-001, MGO-002',
      alternatives: [
        { id: 'ALT-001', name: 'Weekly delivery (status quo)', description: 'One delivery per pantry per week with the four vans.', baseline: true },
        { id: 'ALT-002', name: 'Twice-weekly delivery', description: 'Two smaller deliveries per pantry per week with the same vans and more shifts.', baseline: false },
        { id: 'ALT-003', name: 'Larger refrigerated van', description: 'Replace one van with a larger one and keep weekly deliveries.', baseline: false },
        { id: 'ALT-004', name: 'Pantry refrigerators', description: 'Install a refrigerator at each pantry and keep weekly deliveries.', baseline: false },
      ],
      criteria: [
        { id: 'CRIT-001', name: 'Produce availability at closing', moe: 'MOE-001', unit: '% of days', walkAway: '60', stretch: '100', swingPoints: '100', rationale: 'Swinging from 60 % to 100 % of days with produce at closing is why the decision exists.' },
        { id: 'CRIT-002', name: 'Annual cost', moe: 'MGO-004', unit: 'USD k per year', walkAway: '60', stretch: '0', swingPoints: '70', rationale: 'Donors fund about USD 60 k a year of new spending at most; the full range is worth 70 % of the produce swing.' },
        { id: 'CRIT-003', name: 'Stock retained after a warehouse power cut', moe: 'MOE-002', unit: 'days of produce at pantries', walkAway: '0', stretch: '4', swingPoints: '45', rationale: 'Resilience: days the pantries keep serving produce if the warehouse loses power, from none to four days.' },
        { id: 'CRIT-004', name: 'Shift reliability', moe: 'MOE-003', unit: '% of shifts within 2 h', walkAway: '80', stretch: '100', swingPoints: '35', rationale: 'Volunteers leave when shifts overrun; the 80 % to 100 % range matters but less than produce.' },
      ],
      scores: {
        'ALT-001': { 'CRIT-001': '70', 'CRIT-002': '0', 'CRIT-003': '1', 'CRIT-004': '90' },
        'ALT-002': { 'CRIT-001': '92', 'CRIT-002': '38', 'CRIT-003': '2', 'CRIT-004': '85' },
        'ALT-003': { 'CRIT-001': '78', 'CRIT-002': '25', 'CRIT-003': '1', 'CRIT-004': '95' },
        'ALT-004': { 'CRIT-001': '88', 'CRIT-002': '30', 'CRIT-003': '4', 'CRIT-004': '90' },
      },
      screens: [
        { id: 'SCREEN-001', name: 'Temperature data individually authenticated', test: 'Every temperature sensor or refrigerator the alternative adds reports through individually authenticated accounts.', results: { 'ALT-001': 'pass', 'ALT-002': 'pass', 'ALT-003': 'pass', 'ALT-004': 'pass' } },
      ],
      sensitivityNote: 'Pantry refrigerators rank first until the cost weight rises above 0.47 (base 0.28), when the status quo wins; the produce weight would have to fall to 0.02, so the result is robust to that judgment.',
      recommended: 'ALT-004',
      conditions: 'Each pantry has space and a power outlet for a refrigerator\nThe refrigerators report temperatures through individual accounts (the security screen)',
      residualRisk: 'R-003 remains at the warehouse; pantry refrigerators add a temperature check at 24 sites.',
      wouldChangeIf: 'Donor funding falls below USD 30 k a year\nThe county health department will not accept pantry refrigerators without daily logs',
      derived: 'Each pantry refrigerator shall report its temperature to the alarm gateway at least every 5 minutes.',
    },
    aiStatement: 'We asked a chat assistant for security risks of cloud-managed sensors; we kept the shared-account risk after checking it with the vendor and rejected two that did not apply to a food bank. The trade arithmetic was checked by hand.',
  })
}
