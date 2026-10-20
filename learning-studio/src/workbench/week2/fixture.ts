// A complete, realistic Week 2 Team Record for a FICTIONAL student team (the Riverside Food Bank Network of the Week 1
// fixture, src/workbench/week1/teamFixture.ts, read-only), used by the unit and component tests. It must pass every
// Week 2 check; record.test.ts mutates it to prove each check can fail. Not imported by application code.
import { TEAM_FIXTURE } from '../week1/teamFixture'
import { teamModelInputs } from '../week1/team'
import { EMPTY_RECORD, importWeek1, normalizeRecord, withWeek1, type Week2Record } from './record'

/** The Week 1 model-inputs file the team exported from the Week 1 lab tool. */
export const WEEK1_JSON = JSON.stringify(teamModelInputs(TEAM_FIXTURE, '2026-10-19'))

const step = (actor: string, action: string) => ({ actor, action })
const actor = (id: string, name: string, primary = false, environment = false) => ({ id, name, primary, environment })

export function week2Fixture(): Week2Record {
  const imported = importWeek1(WEEK1_JSON)
  if ('error' in imported) throw new Error(imported.error)
  const base = withWeek1(EMPTY_RECORD, imported.snapshot)
  return normalizeRecord({
    ...base,
    conops: {
      soiName: 'Riverside delivery operation',
      soi: 'The network’s collection, cold-storage and delivery operation: the warehouse with its refrigeration and monitoring, the vans, and the scheduling and routing tools; volunteers, donors, pantries and staff are actors outside it.',
      existing: 'Pantries phone in orders, volunteers improvise routes, and freezer problems are found by whoever opens the warehouse on Monday.',
      justification: 'Families arriving late find empty shelves while surplus spoils, so deliveries must follow pantry demand and keep food cold throughout.',
      restrictions: 'the county food permit and its cold-chain limit\nvolunteer shifts of two hours\nno loading before 06:00 on Mill Street',
      proposed: 'Each partner pantry submits a weekly order; the warehouse allocates stock and schedules a slot; a volunteer driver loads a refrigerated van and delivers on a route that fits the shift; the pantry confirms the delivered weight. Temperatures are watched day and night and staff are alerted when a freezer warms.',
      environment: [
        { id: 'ENV-001', label: 'Service area', value: 'one county, 24 partner pantries in 6 districts' },
        { id: 'ENV-002', label: 'Fleet', value: '4 refrigerated vans, volunteer drivers in two-hour shifts' },
        { id: 'ENV-003', label: 'Operating week', value: 'deliveries Monday to Saturday, 07:00–19:00' },
        { id: 'ENV-004', label: 'Cold chain', value: 'food at or below 5 °C from collection to delivery' },
      ],
      interactions: 'Pantry coordinators: order, receive, confirm the delivered weight\nVolunteer drivers: sign in, load, deliver, sign out\nWarehouse staff: allocate stock, answer temperature alarms',
      constraints: 'county food permit\nnoise agreement with Mill Street residents\nvolunteer availability',
    },
    scenarios: [
      {
        id: 'SCN-001', name: 'Weekly produce delivery to a pantry', kind: 'nominal', owner: 'JS',
        actors: [actor('ACT-001', 'Pantry coordinator', true), actor('ACT-002', 'Volunteer driver')],
        trigger: 'A partner pantry submits its weekly order.',
        preconditions: 'The pantry has an agreed delivery day; stock is in cold storage; a driver is signed up for the shift.',
        steps: [step('Pantry coordinator', 'Submits the weekly order with fresh produce quantities.'), step('System', 'Allocates stock from cold storage and schedules a delivery slot.'), step('System', 'Plans a route that fits the driver’s two-hour shift.'), step('Volunteer driver', 'Loads the van and delivers the order.'), step('Pantry coordinator', 'Confirms receipt and records the delivered weight.')],
        alternates: [{ id: 'A1', fromStep: 2, condition: 'Fresh produce stock is short', response: 'Offer substitute items and tell the coordinator of the shortfall.', outcome: 'rejoin', rejoin: 3 }],
        success: 'The order is delivered within the shift and its weight is recorded.',
        failure: 'The delivery is rescheduled, the coordinator is told why, and the food stays in cold storage.',
        clinic: { decision: 'proceed', reason: '' },
      },
      {
        id: 'SCN-002', name: 'Freezer fails overnight on a weekend', kind: 'off-nominal', owner: 'AK',
        actors: [actor('ACT-003', 'On-call warehouse staff member', true), actor('ACT-004', 'Electric utility', false, true)],
        trigger: 'The walk-in freezer temperature rises above its alarm limit during the night.',
        preconditions: 'The freezer holds stock; an on-call staff member is on the weekend roster.',
        steps: [step('System', 'Detects the temperature rise and raises an alarm.'), step('System', 'Sends the alarm to the on-call staff member.'), step('On-call warehouse staff member', 'Acknowledges the alarm and travels to the warehouse.'), step('On-call warehouse staff member', 'Moves the stock to the backup freezer and logs the temperatures.')],
        alternates: [
          { id: 'A1', fromStep: 3, condition: 'Nobody acknowledges the alarm within 15 minutes', response: 'Escalate the alarm to the warehouse manager.', outcome: 'rejoin', rejoin: 3 },
          { id: 'A2', fromStep: 1, condition: 'A power cut affects the whole district', response: 'Record the outage and request a refrigerated truck from the federation.', outcome: 'ends', rejoin: 0 },
        ],
        success: 'All stock is back below the limit with a temperature log showing how long it was warm.',
        failure: 'Stock that was warm too long is quarantined, labeled and reported, so none is distributed.',
        clinic: { decision: 'revise', reason: 'State the trigger as the alarm event, not the freezer state.' },
      },
      {
        id: 'SCN-003', name: 'Refrigerated van maintenance', kind: 'support', owner: 'TL',
        actors: [actor('ACT-005', 'Fleet maintenance volunteer', true), actor('ACT-006', 'Van repair shop')],
        trigger: 'A van’s refrigeration unit reports a fault code after a delivery.',
        preconditions: 'The van is back at the warehouse; the repair shop has an account with the network.',
        steps: [step('System', 'Logs the fault and marks the van unavailable.'), step('System', 'Notifies the fleet maintenance volunteer.'), step('Fleet maintenance volunteer', 'Books the van into the repair shop.'), step('Van repair shop', 'Repairs the unit and returns the van.'), step('System', 'Returns the van to the schedule after a temperature test.')],
        alternates: [{ id: 'A1', fromStep: 4, condition: 'The repair takes longer than two days', response: 'Reassign the van’s routes to the other vans.', outcome: 'rejoin', rejoin: 5 }],
        success: 'The van passes the temperature test and is back on the schedule.',
        failure: 'The van stays marked unavailable and its routes are covered by the other vans.',
        clinic: { decision: '', reason: '' },
      },
    ],
    discoveries: [
      { id: 'D-001', scenario: 'SCN-002', where: 'step 1', kind: 'unknown', ref: 'U-001', text: 'Nobody has agreed the freezer alarm limit with the health department, so the trigger has no number.' },
      { id: 'D-002', scenario: 'SCN-002', where: 'alternate A2', kind: 'assumption', ref: 'A-001', text: 'The federation can lend a refrigerated truck within four hours during a district power cut.' },
      { id: 'D-003', scenario: 'SCN-001', where: 'alternate A1', kind: 'need', ref: 'NEED-009', text: 'Pantry coordinators need to hear of a shortfall before the van leaves, which no Week 1 need says.' },
    ],
    uncertainties: [
      { id: 'U-001', name: 'Freezer alarm limit not agreed', tbx: 'TBD-01', owner: 'Warehouse manager', closeBy: 'Agree the limit with the county health inspector before the Week 3 trade study', validation: '' },
      { id: 'A-001', name: 'Federation can lend a refrigerated truck', tbx: '', owner: 'RM', closeBy: '', validation: 'Written confirmation from the federation’s logistics office' },
    ],
    needsAdded: [{ id: 'NEED-009', name: 'Shortfall notice', statement: 'Pantry coordinators need the delivery service to tell them of any shortfall in their order before the delivery leaves the warehouse.', priority: 'desirable', goal: 'MGO-002' }],
    coverage: [
      { need: 'NEED-001', scenarios: [{ scenario: 'SCN-001', steps: '1–5' }], reason: '' },
      { need: 'NEED-002', scenarios: [{ scenario: 'SCN-002', steps: '1–4' }, { scenario: 'SCN-003', steps: '5' }], reason: '' },
      { need: 'NEED-003', scenarios: [], reason: 'Collection from the stores is a separate scenario, planned for Week 3.' },
      { need: 'NEED-004', scenarios: [{ scenario: 'SCN-001', steps: '3' }], reason: '' },
      { need: 'NEED-005', scenarios: [{ scenario: 'SCN-002', steps: '1–2' }], reason: '' },
      { need: 'NEED-006', scenarios: [{ scenario: 'SCN-001', steps: '5' }], reason: '' },
      { need: 'NEED-007', scenarios: [], reason: 'Loading noise constrains every delivery; no single scenario exercises it alone.' },
      { need: 'NEED-008', scenarios: [], reason: 'Disposal of spoiled food is not exercised by the three scenarios written this week.' },
      { need: 'NEED-009', scenarios: [{ scenario: 'SCN-001', steps: 'A1' }], reason: '' },
    ],
    capabilities: [
      { id: 'CAP-001', name: 'Deliver fresh food to pantries', statement: 'Deliver ordered fresh food to every partner pantry on its agreed day.', needs: ['NEED-001', 'NEED-009'], refines: '', scenarios: ['SCN-001'] },
      { id: 'CAP-002', name: 'Keep food cold', statement: 'Keep donated food within safe temperatures from collection to delivery.', needs: ['NEED-002'], refines: '', scenarios: ['SCN-002', 'SCN-003'] },
      { id: 'CAP-003', name: 'Detect storage failures', statement: 'Detect a storage temperature failure at any hour and bring staff to it.', needs: ['NEED-005', 'NEED-002'], refines: 'CAP-002', scenarios: ['SCN-002'] },
      { id: 'CAP-004', name: 'Plan routes within shifts', statement: 'Plan delivery routes that fit the volunteers’ committed shift length.', needs: ['NEED-004'], refines: '', scenarios: ['SCN-001'] },
      { id: 'CAP-005', name: 'Report reach by district', statement: 'Report how much food reached each county district each quarter.', needs: ['NEED-006'], refines: '', scenarios: ['SCN-001'] },
    ],
    requirements: [
      { id: 'REQ-STK-001', name: 'Produce until closing', statement: 'The delivery service shall keep fresh produce on the shelves of each partner pantry until at least 30 minutes before its closing time on every distribution day.', type: 'performance', method: 'analysis', criterion: 'Produce on the shelf 30 min before closing on at least 90 % of distribution days, from the pantry closing reports', rationale: 'Families arriving after work currently find nothing left; the margin covers the last arrivals that coordinators report.', parents: 'NEED-001, CAP-001', tbx: '', owner: 'JS', reviewer: '', ai: false },
      { id: 'REQ-STK-002', name: 'Cold-chain limit', statement: 'The network shall keep donated food at or below 5 °C from collection to delivery.', type: 'constraint', method: 'test', criterion: 'Logged temperature ≤ 5 °C for every reading of every load', rationale: 'The county health department sets this limit in the food permit; an exceedance can suspend all distribution.', parents: 'NEED-002, CAP-002', tbx: '', owner: 'JS', reviewer: '', ai: false },
      { id: 'REQ-STK-003', name: 'Shortfall notice', statement: 'The delivery service shall notify the pantry coordinator of any shortfall in an order before the delivery leaves the warehouse.', type: 'functional', method: 'demonstration', criterion: 'Shortfall notice received before departure in every demonstrated short order', rationale: 'Coordinators plan their distribution around the delivered quantities; a late surprise leaves families without the expected items.', parents: 'NEED-009, CAP-001', tbx: '', owner: 'AK', reviewer: '', ai: true },
      { id: 'REQ-STK-004', name: 'Freezer alarm time', statement: 'The network shall alert the on-call warehouse staff to a freezer temperature above the alarm limit (TBD-01) within 5 minutes, at any hour.', type: 'performance', method: 'test', criterion: 'Alarm received by the on-call phone ≤ 5 min after an injected rise above TBD-01, in every trial (limit pending U-001)', rationale: 'Weekend failures currently spoil stored meat before anyone notices; five minutes leaves time to move stock before it warms.', parents: 'NEED-005, CAP-003', tbx: 'U-001', owner: 'AK', reviewer: '', ai: false },
      { id: 'REQ-STK-005', name: 'Shift length', statement: 'The delivery service shall end every volunteer delivery shift within 2 hours of its start.', type: 'performance', method: 'analysis', criterion: 'Shift end minus start ≤ 2 h for at least 95 % of shifts in a month, from the sign-out log', rationale: 'Volunteers sign up for two-hour commitments and drop out when they overrun; dispatchers plan against that commitment.', parents: 'NEED-004, CAP-004', tbx: '', owner: 'RM', reviewer: '', ai: false },
      { id: 'REQ-STK-006', name: 'Reach report to funders', statement: 'The network shall provide the delivered weight per county district to each funder every quarter.', type: 'interface', method: 'inspection', criterion: 'A district-by-district weight table in each quarterly report for 4 consecutive quarters', rationale: 'Grant renewals depend on evidence of reach across districts; funders compare districts to decide where to invest next.', parents: 'NEED-006, CAP-005', tbx: '', owner: 'RM', reviewer: '', ai: false },
      { id: 'REQ-SYS-001', name: 'Freezer sampling interval', statement: 'The temperature monitoring function shall sample each freezer temperature at intervals of no more than 60 s.', type: 'performance', method: 'test', criterion: 'Interval between logged samples ≤ 60 s over a 24 h test', rationale: 'An alert within five minutes needs several readings to confirm a rise and to filter out door openings.', parents: 'REQ-STK-004', tbx: '', owner: 'TL', reviewer: '', ai: false },
      { id: 'REQ-SYS-002', name: 'Route fits the shift', statement: 'The routing tool shall plan each delivery route so that its planned duration fits within the driver’s shift.', type: 'functional', method: 'demonstration', criterion: 'Planned duration within the shift for every route in a replayed week of orders', rationale: 'Routes planned longer than the shift are the main reason shifts overrun, according to the volunteer coordinator.', parents: 'REQ-STK-005, CAP-004', tbx: '', owner: 'TL', reviewer: '', ai: false },
      { id: 'REQ-SYS-003', name: 'Van cargo temperature', statement: 'The refrigerated vans shall hold their cargo at or below 5 °C for a delivery round of up to 3 hours.', type: 'constraint', method: 'test', criterion: 'Cargo logger ≤ 5 °C for every reading over a 3 h loaded test round', rationale: 'The longest round in the county takes about three hours, including loading and unloading at four pantries.', parents: 'REQ-STK-002', tbx: '', owner: 'AK', reviewer: '', ai: false },
      { id: 'REQ-SYS-004', name: 'Funder report export', statement: 'The reporting function shall export the delivered weight per district in the funders’ spreadsheet template.', type: 'interface', method: 'demonstration', criterion: 'The export opens in the funders’ template with every district filled, for one sampled quarter', rationale: 'Funders compile reports from many grantees and accept only their own template; retyping by hand introduces errors.', parents: 'REQ-STK-006', tbx: '', owner: 'RM', reviewer: '', ai: false },
    ],
    dispositions: {
      'NEED-003': 'Deferred: store collection requirements follow the collection scenario planned for Week 3.',
      'NEED-007': 'Covered later: the noise limit becomes a constraint once the city agreement is obtained.',
      'NEED-008': 'Deliberate gap: disposal is outside this week’s scenarios and is revisited in Week 3.',
      'REQ-STK-001': 'Allocated in Week 3, after the trade study decides between more deliveries and larger loads.',
      'REQ-STK-003': 'Met by an operating procedure for warehouse staff; no system element carries it yet.',
    },
    moes: [
      { id: 'MOE-001', name: 'Produce availability at closing', definition: 'Share of distribution days on which produce is still on the shelf 30 min before closing', measures: 'NEED-001', unit: '% of distribution days', threshold: '≥ 90 %', source: 'Pantry coordinators’ closing reports' },
      { id: 'MOE-002', name: 'Food kept safe', definition: 'Share of loads whose every logged temperature stayed within the cold-chain limit', measures: 'NEED-002, MGO-003', unit: '% of loads', threshold: '100 %', source: 'Van and warehouse temperature logs' },
      { id: 'MOE-003', name: 'Shift reliability', definition: 'Share of volunteer shifts that end within the committed two hours', measures: 'NEED-004', unit: '% of shifts', threshold: '≥ 95 %', source: 'Driver sign-out log' },
    ],
    mops: [
      { id: 'MOP-001', name: 'Alarm latency', definition: 'Time from a freezer rise above the limit to the alarm on the on-call phone', measures: 'MOE-002, REQ-STK-004', unit: 'min', threshold: '≤ 5 min', source: 'Alarm system event log' },
      { id: 'MOP-002', name: 'Planned route duration', definition: 'Planned duration of each delivery route including loading and unloading', measures: 'MOE-003, REQ-SYS-002', unit: 'min', threshold: '≤ 110 min', source: 'Routing tool plan records' },
      { id: 'MOP-003', name: 'Van cargo temperature', definition: 'Highest cargo temperature logged during each delivery round', measures: 'MOE-002, REQ-SYS-003', unit: '°C', threshold: '≤ 5 °C', source: 'Van cargo data loggers' },
    ],
    aiStatement: 'We asked a chat assistant to suggest off-nominal scenarios; we kept the freezer failure after checking it against the warehouse staff concern and rejected two that duplicated SCN-001. REQ-STK-003 was drafted with the assistant and rewritten by the team.',
  })
}
