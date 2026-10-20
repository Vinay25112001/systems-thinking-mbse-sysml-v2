// A complete, realistic Week 5 Team Record for a FICTIONAL student team: the Riverside Food Bank Network of the Week 1–4
// fixtures (src/workbench/week4/fixture.ts, read-only), continuing its own record from its Week 4 export. Used by the unit
// and component tests; it must pass every Week 5 check, and record.test.ts mutates it to prove each check can fail. It
// deliberately holds the unusual-but-valid inputs earlier tools wrongly rejected: a one-word component ("Hub"), a
// one-word proper-noun external ("Stripe"), a person group as an external end ("Passengers"), an external AI service
// ("OpenAI API"), an AI capability (AI-001) as an interface end, ID-only text, an information item consumed by an external
// element (INFO-003 to the county portal, carried by a relay) and an external with a recorded reason for no interface.
// Not imported by application code. Never AeroLink.
import { modelInputs as week4ModelInputs } from '../week4/record'
import { week4Fixture } from '../week4/fixture'
import { EMPTY_INTERFACE, EMPTY_RECORD, importWeek4File, normalizeRecord, pairKey, withWeek4, type Interface, type Week5Record } from './record'

/** The Week 4 model-inputs file the team exported from the Week 4 lab tool. */
export const WEEK4_JSON = JSON.stringify(week4ModelInputs(week4Fixture()))

const RFB = 'Riverside Food Bank'
const ifc = (id: string, p: Partial<Interface>): Interface => ({ ...EMPTY_INTERFACE(id), ...p })

export function week5Fixture(): Week5Record {
  const imported = importWeek4File(WEEK4_JSON)
  if ('error' in imported) throw new Error(imported.error)
  const base = withWeek4(EMPTY_RECORD, imported.snapshot)
  return normalizeRecord({
    ...base,
    cards: [
      { phy: 'PHY-001', responsibility: 'Watches every freezer and raises the alarm.', owner: RFB },
      { phy: 'PHY-002', responsibility: 'Moves food cold from the warehouse to the pantries, and gives clients a lift.', owner: RFB },
      { phy: 'PHY-003', responsibility: 'Keeps delivered produce cold until closing.', owner: 'Partner pantries' },
      { phy: 'PHY-004', responsibility: 'Plans routes, keeps delivery records and reports reach.', owner: RFB },
      { phy: 'PHY-005', responsibility: 'Picks, loads and services the equipment.', owner: RFB },
    ],
    components: [
      { id: 'CMP-001', name: 'Hub', parent: 'PHY-001', kind: 'hardware', responsibility: 'Collects sensor readings and places alarm calls.', functions: 'FN-006', ai: false },
      { id: 'CMP-002', name: 'Freezer sensors', parent: 'PHY-001', kind: 'hardware', responsibility: 'Measure each freezer every minute.', functions: 'FN-005', ai: false },
      { id: 'CMP-003', name: 'Route planner', parent: 'PHY-004', kind: 'software', responsibility: 'Plans routes within driver shifts.', functions: 'FN-001', ai: false },
      { id: 'CMP-004', name: 'Reach reporting', parent: 'PHY-004', kind: 'software', responsibility: 'Builds the quarterly district report.', functions: 'FN-010', ai: true },
    ],
    externals: [
      { id: 'EXT-002', name: 'Stripe' },
      { id: 'EXT-003', name: 'Passengers' },
      { id: 'EXT-004', name: 'OpenAI API' },
      { id: 'EXT-005', name: 'City bus service' },
    ],
    externalReasons: { 'EXT-005': 'No exchange yet: clients ride the bus on their own.' },
    interfaces: [
      ifc('IF-001', { name: 'Pick list to the dock', kind: 'information', endA: 'PHY-004', endB: 'PHY-005', crosses: 'INFO-001', direction: 'PHY-004 → PHY-005', medium: 'printed pick list', constraint: 'pick list ready by 7:00 on delivery days', ownerA: RFB, ownerB: RFB, verification: 'demonstration on a delivery day', degraded: 'Printer down: the coordinator reads the order list to the dock by phone.' }),
      ifc('IF-002', { name: 'Delivery records from the vans', kind: 'information', endA: 'PHY-002', endB: 'PHY-004', crosses: 'INFO-003', direction: 'PHY-002 → PHY-004', medium: 'driver phone app over the cellular network', exposed: true, requirements: 'REQ-SYS-004', ownerA: RFB, ownerB: RFB, verification: 'test with a full round of stops', protection: 'authenticate each driver phone; encrypt records in transit', degraded: 'No signal: the app keeps the records and syncs them at the dock.', risks: 'R-005' }),
      ifc('IF-003', { name: 'Reach report to the county', kind: 'information', endA: 'PHY-004', endB: 'EXT-001', crosses: 'INFO-003 (quarterly totals only)', direction: 'PHY-004 → EXT-001', medium: 'county portal upload over the internet', exposed: true, constraint: 'uploaded within five working days of quarter end', ownerA: RFB, ownerB: 'County funders office', verification: 'demonstration with the county', protection: 'named county account with two-factor sign-in', degraded: 'Portal down: the report is emailed to the grants officer and uploaded later.', standard: 'the county’s report template' }),
      ifc('IF-004', { name: 'Cargo log download', kind: 'information', endA: 'PHY-002', endB: 'PHY-005', crosses: 'INFO-004', direction: 'PHY-002 → PHY-005', medium: 'logger cable at the dock', requirements: 'REQ-SYS-003', ownerA: RFB, ownerB: RFB, verification: 'inspection of a downloaded log', degraded: 'Logger unreadable: the load is checked with a probe thermometer before it is kept.' }),
      ifc('IF-005', { name: 'Crates to the pantry', kind: 'physical', endA: 'PHY-002', endB: 'PHY-003', crosses: 'chilled produce crates', direction: 'PHY-002 → PHY-003, empty crates back', medium: 'hand trolley at the pantry door', constraint: 'crates into the refrigerator within 10 min of arrival', ownerA: RFB, ownerB: 'Partner pantries', verification: 'inspection at a delivery', noProtectionReason: 'no data crosses; only food moves', degraded: 'Pantry closed: the driver returns the crates to the warehouse cold room.' }),
      ifc('IF-006', { name: 'Failure warnings to the coordinator', kind: 'information', endA: 'AI-001', endB: 'PHY-004', crosses: 'freezer failure warnings', direction: 'AI-001 → PHY-004', medium: 'vendor cloud alert over the cellular network', exposed: true, requirements: 'REQ-STK-004', ownerA: RFB, ownerB: RFB, verification: 'test with injected warnings', protection: 'separate alarm account; warnings can never silence the threshold alarm', degraded: 'Warnings missing: the threshold alarm still calls the on-call phone.', risks: 'R-002, R-003' }),
      ifc('IF-007', { name: 'Donations through Stripe', kind: 'information', endA: 'PHY-004', endB: 'EXT-002', crosses: 'donation receipts', direction: 'EXT-002 → PHY-004', medium: 'Stripe API over the internet', exposed: true, constraint: 'every receipt recorded the same day', ownerA: RFB, ownerB: 'Stripe', protection: 'API keys held by the treasurer only; card data never stored', degraded: 'Stripe down: donors are offered the bank transfer details instead.' }),
      ifc('IF-008', { name: 'Clients ride along', kind: 'physical', endA: 'EXT-003', endB: 'PHY-002', crosses: 'clients and their bags', direction: 'EXT-003 → PHY-002 → EXT-003', medium: 'van side door and step', constraint: 'at most two riders per van', ownerA: 'Passengers', ownerB: RFB, verification: 'inspection of the step and belts', noProtectionReason: 'no data crosses the van door', degraded: 'Van full or late: clients are given the bus times and a food box at the stop.' }),
      ifc('IF-009', { name: 'Notice drafts from OpenAI API', kind: 'information', endA: 'PHY-004', endB: 'EXT-004', crosses: 'shortfall notice drafts', direction: 'PHY-004 → EXT-004 → PHY-004', medium: 'OpenAI API over the internet', exposed: true, ownerA: RFB, ownerB: 'OpenAI', verification: 'inspection of logged requests', protection: 'send no client names; a coordinator reads every draft before it is sent', degraded: 'API down: the coordinator writes the notice from the template.' }),
      ifc('IF-010', { name: 'Partner delivery agreement', kind: 'organizational', endA: 'PHY-005', endB: 'PHY-003', crosses: 'delivery days and crate returns', medium: 'signed partner pantry agreement', ownerA: RFB, ownerB: 'Partner pantries', noProtectionReason: 'an agreement carries no data', degraded: 'A breached agreement goes to the partners meeting; deliveries keep the last agreed days.' }),
    ],
    relays: { [pairKey('INFO-003', 'PHY-002', 'EXT-001')]: 'IF-002, IF-003' },
    requirements: [
      { id: 'REQ-SYS-005', name: 'Failure warning delivery', statement: 'The alarm gateway shall deliver each failure warning to the scheduling software over IF-006 within 2 min of detection.', interface: 'IF-006', criterion: 'every warning received within 2 min in 20 injected failures', method: 'test', parents: 'REQ-STK-004', rationale: 'A warning that arrives late cannot save the stock.', ai: false },
      { id: 'REQ-SYS-006', name: 'Quarterly upload', statement: 'The scheduling software shall upload the quarterly reach report to the county portal over IF-003 within five working days of quarter end.', interface: 'IF-003', criterion: 'upload confirmed within five working days', method: 'demonstration', parents: 'REQ-SYS-004', rationale: '', ai: false },
      { id: 'REQ-SYS-007', name: 'No client names to the AI service', statement: 'The scheduling software shall not send any client name to the OpenAI API over IF-009.', interface: 'IF-009', criterion: 'no client name in 50 logged requests', method: 'inspection', parents: 'NEED-001', rationale: 'Client privacy.', ai: false },
    ],
    icwg: `${RFB}\nPartner pantries\nCounty funders office`,
    standards: 'none: every interface follows its provider’s published format',
    changes: [
      { id: 'ICR-001', interface: 'IF-006', change: 'Move the freezer warnings from the vendor cloud to a text message gateway', impact: 'IF-006, PHY-001, REQ-SYS-005', decision: 'Approved for a one-month trial at the warehouse', decider: 'Warehouse manager' },
    ],
    aiStatement: 'We asked a chat assistant to list possible interfaces from our N² chart; we kept two, rejected three that joined elements with no exchange, and wrote every protection ourselves.',
  })
}
