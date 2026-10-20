// A complete, realistic Week 4 Team Record for a FICTIONAL student team: the Riverside Food Bank Network of the Week 1–3
// fixtures (src/workbench/week3/fixture.ts, read-only), continuing its own record from its Week 3 export. Used by the
// unit, component and e2e tests; it must pass every Week 4 check, and record.test.ts mutates it to prove each check can
// fail. Not imported by application code. Never AeroLink.
import { modelInputs as week3ModelInputs } from '../week3/record'
import { week3Fixture } from '../week3/fixture'
import { EMPTY_RECORD, importWeek3File, normalizeRecord, withWeek3, type Week4Record } from './record'

/** The Week 3 model-inputs file the team exported from the Week 3 lab tool. */
export const WEEK3_JSON = JSON.stringify(week3ModelInputs(week3Fixture()))

const vp = (id: string, kind: string, name: string, purpose: string, stakeholders: string, concerns: string, serves: string, form: string) => ({ id, kind, name, purpose, stakeholders, concerns, serves, form })
const f = (id: string, name: string, group: string, inputs: string, outputs: string, capabilities: string, scenarios: string, requirements: string, log: string, phy: string, criterion: string, why: string, extra: Record<string, string> = {}) => ({ id, name, group, inputs, outputs, capabilities, scenarios, requirements, log, phy, criterion, why, planning: '', human: '', ...extra })

export function week4Fixture(): Week4Record {
  const imported = importWeek3File(WEEK3_JSON)
  if ('error' in imported) throw new Error(imported.error)
  const base = withWeek3(EMPTY_RECORD, imported.snapshot)
  return normalizeRecord({
    ...base,
    mission: 'Get donated food safely to the people who need it',
    viewpoints: [
      vp('VP-001', 'operational', 'Operational viewpoint', 'Who does what, in which order, on a delivery day and when a freezer fails at night?', 'Pantry coordinators, volunteer drivers', 'Deliveries arrive on the agreed day; shifts end on time', 'NEED-001, NEED-004', 'Scenario step tables with actors and alternate flows'),
      vp('VP-002', 'functional', 'Functional viewpoint', 'What must the network do, with which inputs and outputs, to keep food safe and on time?', 'County health inspector, warehouse staff', 'Food stays within the cold-chain limit from collection to delivery', 'NEED-002, NEED-005', 'A function tree and a function table with inputs and outputs'),
      vp('VP-003', 'physical', 'Physical viewpoint', 'Which vans, freezers, refrigerators and people perform the functions, and where are they?', 'Warehouse manager, pantry coordinators', 'Equipment that can be maintained by volunteers', 'CAP-002, REQ-SYS-003', 'An element table with counts and the allocation matrix'),
      vp('VP-004', 'information', 'Information viewpoint', 'Which information is produced where, used by whom, for which decision?', 'Funders, pantry coordinators', 'Reach is reported by district; shortfalls are known before the van leaves', 'NEED-006, NEED-009, REQ-STK-003', 'An information table from producer to consumer to decision, with the AI card'),
      vp('VP-005', 'enterprise', 'Enterprise viewpoint', 'Which organization owns each element, and which agreements bind them?', 'Partner pantries, the regional federation', 'Who maintains the pantry refrigerators and who lends the backup truck', 'NEED-001, CAP-001', 'The physical elements tinted by owner with the agreements between owners'),
    ],
    groups: [
      { id: 'FG-001', name: 'Deliver to pantries' },
      { id: 'FG-002', name: 'Keep food cold' },
      { id: 'FG-003', name: 'Report and plan' },
    ],
    functions: [
      f('FN-001', 'Plan delivery route', 'FG-001', 'week’s pantry orders\ndriver shift times', 'route with stop times', 'CAP-004', 'SCN-001', 'REQ-SYS-002', 'LOG-001', 'PHY-004', 'flow', 'Orders and shift times are already held in the scheduling software the coordinator uses.'),
      f('FN-002', 'Load the van', 'FG-001', 'picked orders\nroute', 'loaded van with temperature log started', 'CAP-001', 'SCN-001', '', 'LOG-002', 'PHY-005', 'enterprise', 'Warehouse volunteers do the picking and loading at the dock.', { human: 'warehouse volunteer' }),
      f('FN-003', 'Deliver order to pantry', 'FG-001', 'loaded van\nroute', 'order received at the pantry\ndelivery record', 'CAP-001', 'SCN-001', '', 'LOG-002', 'PHY-002', 'transformation', 'Only the vans move the food between warehouse and pantries.', { human: 'volunteer driver' }),
      f('FN-004', 'Notify pantry of shortfall', 'FG-001', 'picked order compared with the order placed', 'shortfall notice to the coordinator', 'CAP-001', 'SCN-001', 'REQ-STK-003', 'LOG-003', 'PHY-004', 'flow', 'The notice uses the order data the scheduling software already holds.'),
      f('FN-005', 'Monitor freezer temperature', 'FG-002', 'freezer temperature', 'temperature samples every minute', 'CAP-003', 'SCN-002', 'REQ-SYS-001', 'LOG-004', 'PHY-001', 'environment', 'Sensors must sit inside each freezer, in the cold environment they measure.'),
      f('FN-006', 'Alert on-call staff', 'FG-002', 'temperature above the alarm limit', 'alarm call to the on-call phone', 'CAP-003', 'SCN-002', 'REQ-STK-004', 'LOG-004', 'PHY-001', 'dependability', 'The gateway calls over the cellular network, so the alarm works when the building network is down.'),
      f('FN-007', 'Keep van cargo cold', 'FG-002', 'loaded cargo\nengine power', 'cargo at or below 5 °C', 'CAP-002', 'SCN-001', 'REQ-SYS-003', 'LOG-002', 'PHY-002', 'transformation', 'The van’s refrigeration unit is the only element that cools the cargo on the road.'),
      f('FN-008', 'Store produce at the pantry', 'FG-002', 'delivered produce\nmains power', 'produce kept cold until closing', 'CAP-002', 'SCN-001', 'REQ-STK-001', 'LOG-005', 'PHY-003', 'enterprise', 'The refrigerators chosen in Week 3 stand at each pantry, which owns and stocks them.'),
      f('FN-009', 'Service refrigeration equipment', 'FG-002', 'van and freezer fault reports', 'equipment returned to service', 'CAP-002', 'SCN-003', '', 'LOG-002', 'PHY-005', 'enterprise', 'The contracted technician works from the warehouse workshop.', { human: 'contracted technician' }),
      f('FN-010', 'Report reach by district', 'FG-003', 'delivery records', 'quarterly reach report per district', 'CAP-005', 'SCN-001', 'REQ-SYS-004', 'LOG-003', 'PHY-004', 'flow', 'The delivery records the report is built from are kept in the scheduling software.'),
    ],
    logical: [
      { id: 'LOG-001', name: 'Route planning', text: 'Plans routes within shifts.', phys: 'PHY-004' },
      { id: 'LOG-002', name: 'Distribution', text: 'Loads, moves and keeps cold the food on the road, and keeps the equipment working.', phys: 'PHY-002, PHY-005' },
      { id: 'LOG-003', name: 'Coordination and reporting', text: 'Tells pantries and funders what was delivered.', phys: 'PHY-004' },
      { id: 'LOG-004', name: 'Cold-storage monitoring', text: 'Watches stored food temperatures and raises alarms.', phys: 'PHY-001' },
      { id: 'LOG-005', name: 'Pantry storage', text: 'Keeps produce cold at the pantries.', phys: 'PHY-003' },
    ],
    physical: [
      { id: 'PHY-001', name: 'Freezer sensors and alarm gateway', text: 'Battery sensors in each freezer and a cellular gateway.', requirements: '' },
      { id: 'PHY-002', name: 'Refrigerated vans', text: 'Four vans with refrigeration units and volunteer drivers.', requirements: '' },
      { id: 'PHY-003', name: 'Pantry refrigerators', text: 'One refrigerator at each partner pantry (the Week 3 decision).', requirements: '' },
      { id: 'PHY-004', name: 'Scheduling and reporting software', text: 'The coordinator’s cloud scheduling tool with route planning.', requirements: '' },
      { id: 'PHY-005', name: 'Warehouse dock and workshop', text: 'Loading dock, volunteers and the technician’s workshop.', requirements: '' },
    ],
    externals: [{ id: 'EXT-001', name: 'County funders’ reporting portal' }],
    decisions: [
      {
        id: 'DEC-001', question: 'Where should produce be kept cold between delivery and closing time?',
        alternatives: 'In the van, with a second afternoon run\nIn insulated boxes at the pantry\nIn a refrigerator at each pantry',
        chosen: 'In a refrigerator at each pantry', rationale: 'Pantry refrigerators keep produce on the shelf until closing without extra van runs, which the volunteer shifts cannot absorb.',
        links: 'NEED-001, REQ-STK-001, R-003',
      },
    ],
    information: [
      { id: 'INFO-001', name: 'Pantry orders', content: 'Weekly order lines from each pantry.', data: 'order lines and quantities per pantry', information: 'the load plan and any shortfall against stock', producers: 'PHY-004', consumers: 'PHY-005', decision: 'What to load on each van and whether to send a shortfall notice', decisionRefs: 'FN-002, FN-004', route: 'printed pick list from the scheduling tool', sensitivity: 'none' },
      { id: 'INFO-002', name: 'Freezer temperatures', content: 'Temperature samples from every freezer.', data: 'one reading per freezer per minute', information: 'which freezer is above its limit and for how long', producers: 'PHY-001', consumers: 'AI-001', decision: 'Whether to call the on-call staff member out', decisionRefs: 'FN-006, REQ-STK-004', route: 'cellular link from the gateway to the vendor cloud', sensitivity: 'none' },
      { id: 'INFO-003', name: 'Delivery records', content: 'Weight delivered per pantry per run.', data: 'weights and times per stop', information: 'delivered weight per district per quarter', producers: 'PHY-002', consumers: 'PHY-004, EXT-001', decision: 'How to plan next quarter’s routes, and what the county funders conclude about reach', decisionRefs: 'FN-010, REQ-SYS-004', route: 'driver phone form synced to the scheduling tool; the quarterly report uploaded to the county portal', sensitivity: 'none' },
      { id: 'INFO-004', name: 'Van cargo temperature log', content: 'Cargo temperature over each delivery round.', data: 'cargo temperature every five minutes', information: 'whether each load stayed within the cold-chain limit', producers: 'PHY-002', consumers: 'PHY-005', decision: 'Whether a returned load is safe to keep or must be discarded', decisionRefs: 'FN-007, REQ-SYS-003', route: 'logger downloaded at the dock', sensitivity: 'none' },
      { id: 'INFO-005', name: 'Shift times', content: 'Each volunteer driver’s committed start and end times.', data: 'start and end time per driver per week', information: 'how long each route may be on each day', producers: 'PHY-004', consumers: 'PHY-004', decision: 'How long each planned route may run within the shift', decisionRefs: 'FN-001, REQ-SYS-002', route: 'kept within the scheduling tool', sensitivity: 'personal: driver names and phone numbers' },
    ],
    ai: [
      { id: 'AI-001', name: 'Freezer failure prediction', host: 'PHY-001', supports: 'FN-006', inputs: 'INFO-002', outputs: 'A warning when a freezer’s temperature pattern looks like an imminent compressor failure', oversight: 'The warehouse manager decides whether to move stock; the model never silences an alarm', failure: 'A missed warning leaves the threshold alarm as the safety net; false warnings waste a volunteer call-out', dataQuality: 'two years of readings with only three real failures' },
    ],
    aiStatement: 'We used a chat assistant to suggest function names from our scenarios; we kept four, renamed two that were element names, and rejected the rest as too detailed.',
  })
}
