// A complete, realistic Week 1 Team Record for a FICTIONAL student team (a regional food bank network), used by the unit
// tests and the end-to-end walk-through (imported through the Team enterprise view's JSON import, the way teammates
// share one record). It must pass every Team Record check; team.test.ts mutates it to prove each check can fail.
// Not imported by application code, so it is not part of the shipped bundle. Sign-off review 2026-10-19: the needs are
// in the lecture's form "The [stakeholders] need the [system] to …" (M1), each traced to the mission or a goal (M3),
// with a problem statement, goals and three REL rows including one conflict (Mo1).
import { EMPTY_TEAM, type NeedRow, type TeamRecord } from './team'

const ALL_CONFIRMED = { form: true, 'solution-free': true, attributed: true, traced: true, condition: true, rationale: true } as const
const need = (n: number, name: string, text: string, rationale: string, priority: NeedRow['priority'], goal: string): NeedRow => ({
  id: `NEED-00${n}`,
  name,
  text,
  conditions: '',
  rationale,
  sources: `STK-00${n}`,
  concerns: `CON-00${n}`,
  goal,
  priority,
  selfCheck: { ...ALL_CONFIRMED },
  justification: '',
})
const con = (n: number, text: string) => [{ id: `CON-00${n}`, text }]

export const TEAM_FIXTURE: TeamRecord = {
  ...EMPTY_TEAM,
  team: '07',
  proposal: {
    name: 'Riverside Food Bank Network',
    domain: 'Food security and logistics',
    problem: 'Donated food reaches partner pantries unevenly across the county, so fresh produce runs out early while surplus spoils in store back rooms.',
    goals: [
      { id: 'MGO-002', text: 'Keep partner pantries stocked with fresh food every week' },
      { id: 'MGO-003', text: 'Keep all donated food safe from collection to delivery' },
      { id: 'MGO-004', text: 'Run the service within what donors, volunteers and neighbors can sustain' },
      { id: 'MGO-005', text: 'Show funders how far every delivered pound reaches' },
    ],
    purpose: 'Collect surplus food from donors and deliver it safely to partner pantries across the county every week.',
    soi: 'The network’s collection, warehousing and delivery service that moves donated food from donors to partner pantries.',
    inside: [
      { id: 'PRT-001', name: 'Warehouse and cold storage' },
      { id: 'PRT-002', name: 'Delivery vans and volunteer drivers' },
      { id: 'PRT-003', name: 'Volunteer scheduling office' },
      { id: 'PRT-004', name: 'Donation intake desk' },
    ],
    why: 'The network has many interacting parts (donors, a warehouse, vans, volunteers and pantries), people as well as technology, exchanges with outside systems such as the health department and the road network, and stakeholders whose needs conflict, such as neighbors and early delivery shifts. It is large enough to model in SysML v2 and small enough for one term.',
    decision: 'approved',
    decidedOn: '2026-10-16',
  },
  charter: {
    threePersonTeam: false,
    roles: { 'Requirements & Compliance': 'JS', Architecture: 'AK', 'AI & Data Management': 'RM', 'Verification & Validation': 'TL' },
    decisionRules: 'The area lead proposes; the team aims for consensus within one working day, then a majority vote decides.',
    norms: 'One team channel; replies within one working day; a short stand-up after each lab.',
    prefixes: 'JS: STK, CON, NEED\nAK: ENT, PRT, EXT, REL\nRM: INFO, AI\nTL: VER',
  },
  context: [
    { id: 'EXT-001', name: 'Grocery store donors', kind: 'actor', crosses: 'surplus food', direction: 'in' },
    { id: 'EXT-002', name: 'County health department', kind: 'actor', crosses: 'inspection results and permits', direction: 'both' },
    { id: 'EXT-003', name: 'Partner pantries', kind: 'actor', crosses: 'food deliveries and demand reports', direction: 'both' },
    { id: 'EXT-004', name: 'Regional food bank federation', kind: 'actor', crosses: 'shared stock and guidance', direction: 'both' },
    { id: 'EXT-005', name: 'Road network', kind: 'system', crosses: 'delivery routes and travel times', direction: 'in' },
    { id: 'EXT-006', name: 'Electric utility', kind: 'actor', crosses: 'power for cold storage', direction: 'in' },
  ],
  stakeholders: [
    { id: 'STK-001', name: 'Families using partner pantries', role: 'user', stage: 'Operation', side: 'external', approving: 'no', concerns: con(1, 'Families arriving after work find the shelves empty of fresh produce by 5 p.m.'), influence: '2', reason: 'little leverage alone, but they decide demand' },
    { id: 'STK-002', name: 'County health department', role: 'authority', stage: 'Concept', side: 'external', approving: 'yes', concerns: con(2, 'Cold-chain temperatures above 5 °C during delivery could make donated food unsafe to distribute.'), influence: '5', reason: 'it can suspend the food permit' },
    { id: 'STK-003', name: 'Grocery store donors', role: 'supplier', stage: 'Operation', side: 'external', approving: 'no', concerns: con(3, 'Store managers want surplus collected before closing so it does not fill their back rooms overnight.'), influence: '4', reason: 'they decide how much is donated' },
    { id: 'STK-004', name: 'Volunteer drivers', role: 'user', stage: 'Operation', side: 'internal', approving: 'no', concerns: con(4, 'Volunteers drop out when delivery shifts run past the two hours they signed up for.'), influence: '3', reason: 'volunteer availability limits deliveries' },
    { id: 'STK-005', name: 'Warehouse staff', role: 'maintainer', stage: 'Logistics and maintenance', side: 'internal', approving: 'no', concerns: con(5, 'Freezer breakdowns on weekends go unnoticed until Monday and spoil stored meat.'), influence: '2', reason: 'they keep storage running' },
    { id: 'STK-006', name: 'Funders and grant makers', role: 'customer', stage: 'Concept', side: 'external', approving: 'no', concerns: con(6, 'Grant reports have to show pounds delivered per county district each quarter.'), influence: '4', reason: 'they fund staff and vans' },
    { id: 'STK-007', name: 'Neighbors of the warehouse', role: 'public', stage: 'Operation', side: 'external', approving: 'no', concerns: con(7, 'Residents on Mill Street are woken by van loading before 6 a.m.'), influence: '2', reason: 'they can complain to the zoning board' },
    { id: 'STK-008', name: 'Waste hauler', role: 'supplier', stage: 'Disposal', side: 'external', approving: 'no', concerns: con(8, 'Spoiled food mixed with packaging is refused at the composting site.'), influence: '2', reason: 'disposal costs rise when loads are refused' },
  ],
  relationships: [
    { id: 'REL-001', from: 'STK-007', to: 'STK-004', type: 'conflicts-with', note: 'Neighbors want no loading before 6 a.m.; volunteer drivers need early starts to finish within their shifts.' },
    { id: 'REL-002', from: 'STK-002', to: 'STK-005', type: 'regulates', note: 'Food-safety inspections of the warehouse and cold storage' },
    { id: 'REL-003', from: 'STK-004', to: 'STK-005', type: 'coordinates-with', note: 'Loading times at the warehouse dock' },
  ],
  needs: [
    need(1, 'Produce until closing', 'Families using partner pantries need the delivery service to keep fresh produce on the pantry shelves until closing time.', 'Families arriving after work currently find no produce left.', 'critical', 'MGO-002'),
    need(2, 'Safe temperatures', 'The county health department needs the network to keep donated food within safe temperature limits throughout collection, storage and delivery.', 'Unsafe temperatures could make distributed food harmful.', 'mandatory', 'MGO-003'),
    need(3, 'Collection before closing', 'Grocery store donors need the collection service to collect surplus food at every store before it closes for the night.', 'Surplus left overnight fills their storage space.', 'desirable', 'MGO-004'),
    need(4, 'Shifts within commitment', 'Volunteer drivers need the delivery service to end each delivery shift within the two hours they signed up for, even when donations are heavy.', 'Volunteers drop out when shifts overrun their commitment.', 'critical', 'MGO-004'),
    need(5, 'Early warning of storage failure', 'Warehouse staff need the network to warn them of a freezer failure within minutes, at any hour including weekends.', 'Weekend failures currently spoil stored meat before anyone notices.', 'critical', 'MGO-003'),
    need(6, 'Reach by district', 'Funders need the network to show how much food reached each county district during every quarter.', 'Grant renewals depend on evidence of reach across districts.', 'desirable', 'MGO-005'),
    need(7, 'Quiet early mornings', 'Neighbors of the warehouse need the delivery service to keep loading noise within the limits agreed with the city, at night and early in the morning.', 'Early loading currently wakes residents on Mill Street.', 'mandatory', 'MGO-004'),
    need(8, 'Separated spoiled food', 'The waste hauler needs the network to separate spoiled food from packaging whenever a load is handed over for composting.', 'Mixed loads are refused at the composting site.', 'optional', 'MGO-003'),
  ],
  aiStatement: 'We used a chat assistant to brainstorm candidate stakeholders; we kept two (waste hauler, neighbors) after checking them against the life-cycle stages and rejected three that were systems, not stakeholders. No AI wrote any need statement.',
  issued: { EXT: 6, STK: 8, CON: 8, NEED: 8, PRT: 4, MGO: 5, REL: 3 },
}
