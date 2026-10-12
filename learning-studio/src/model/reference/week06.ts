// Week 6 layer (L6 / CP2): technology maturity (TECH-001..003) and AROU register v2. Every TRL rests on a labelled
// assumption (A-003..A-005) because the course holds no supplier or test evidence for any real product. Risks are
// written condition-if-then, rated on the 5x5 scale (likelihood and consequence 1-5) and given an owner, a handling
// option (avoid | mitigate | transfer | accept) and a treatment; each `affects` the elements it threatens.
//
// FICTIONAL VALUES in this file (teaching values, not real-world data):
//   - TRL 6 / 5 / 4 for TECH-001 / 002 / 003 (assumptions, TRL scale per S11 p.767)
//   - 10 % capacity fade, 5 % of operating hours in weather holds, 8 h overnight charger idle time
//   - all likelihood / consequence ratings
import type { Element, ElementKind, EngineeringModel, Link } from '../engineering'

const el = (id: string, name: string, text: string, attributes?: Element['attributes'], provenance: Element['provenance'] = 'instructor-reference'): Element => ({
  id, kind: id.split('-')[0] as ElementKind, name, text, attributes, provenance, status: 'active',
})
let n = 0
const ln = (source: string, type: Link['type'], target: string, rationale?: string): Link => ({ id: `LNK-06-${String(++n).padStart(3, '0')}`, source, type, target, rationale })

type Handling = 'avoid' | 'mitigate' | 'transfer' | 'accept'
const risk = (id: string, name: string, text: string, likelihood: number, consequence: number, owner: string, handling: Handling, treatment: string, trigger: string): Element =>
  el(id, name, text, { likelihood, consequence, owner, handling, treatment, trigger })

const tech: Element[] = [
  el('TECH-001', 'High-power charging',
    'Hub chargers that restore the battery from the 20 % reserve to the dispatch threshold in 20 min. Benefit: sets the 25 min turnaround and the charger-limited capacity. Limitations: high grid demand at hubs (CON-011) and cell heating during charge.',
    { trl: 6, trlMeaning: 'Prototype demonstration in a relevant environment', evidence: 'Assumption A-003 (no supplier test report in the course sources)', assumptionId: 'A-003', relatedRisk: 'R-005' }, 'instructor-fictional'),
  el('TECH-002', 'Battery cell technology',
    'High-energy lithium-ion cells sized for a 25 km trip with a 20 % reserve at 20 fast-charge cycles per aircraft per day. Benefit: range and turnaround. Limitations: capacity fade under fast charging, thermal-runaway hazard.',
    { trl: 5, trlMeaning: 'Component validation in a relevant environment', evidence: 'Assumption A-004 (cell supplier data assumed; not available in the course sources)', assumptionId: 'A-004', maturityRisk: 'R-002' }, 'instructor-fictional'),
  el('TECH-003', 'Detect-and-avoid and autonomy enablers',
    'Onboard sensing and decision functions that detect and avoid other traffic, enabling remote or autonomous operation (Week 14 evolution). Benefit: lower operator workload and crew cost. Limitations: certification basis and operator trust (CON-009).',
    { trl: 4, trlMeaning: 'Component validation in a laboratory environment', evidence: 'Assumption A-005 (laboratory results assumed; no flight evidence in the course sources)', assumptionId: 'A-005', maturityRisk: 'R-006' }, 'instructor-fictional'),
]

const arou: Element[] = [
  el('A-003', 'High-power charger maturity is TRL 6', 'The charger supplier has demonstrated a prototype at an operating vertiport (relevant environment). To be confirmed by the supplier test report.',
    { owner: 'Vertiport Infrastructure Manager', validation: 'Supplier test report before charger order', trlAssumed: 6 }, 'instructor-fictional'),
  el('A-004', 'Battery cell maturity is TRL 5', 'The cell supplier has validated the cell in a relevant environment (pack-level cycling at fast-charge rates). To be confirmed by cycle-test data.',
    { owner: 'Fleet Engineering Lead', validation: 'Cycle-test data at 20 cycles/day equivalent before fleet order', trlAssumed: 5 }, 'instructor-fictional'),
  el('A-005', 'Detect-and-avoid maturity is TRL 4', 'Detect-and-avoid components have been validated in a laboratory environment only. To be confirmed before the autonomy increment is planned.',
    { owner: 'Director of Flight Operations', validation: 'Review of the developer\'s laboratory reports before Week 14 evolution planning', trlAssumed: 4 }, 'instructor-fictional'),
  risk('R-002', 'Battery capacity fade under fast charging',
    'Condition: cells are fast-charged about 20 times per aircraft per day and their fade rate at this duty is known only from assumed supplier data (A-004). If usable capacity fades by more than 10 % before the planned pack replacement, then the 20 % landing reserve cannot be held on the 25 km design trip and flights must be shortened or cancelled.',
    3, 4, 'Fleet Engineering Lead', 'mitigate', 'Track TPM-003 monthly; sample-test packs; predictive maintenance (AI-001) schedules pack replacement before the reserve is threatened.', 'TPM-003 margin below 1 percentage point'),
  risk('R-003', 'Pad-edge noise above the agreed limit',
    'Condition: the aircraft noise estimate (63.5 dBA, TPM-002) comes from prediction only. If measured pad-edge noise exceeds 65 dBA, then the local agreement is breached and the city may restrict operating hours at the affected vertiport.',
    2, 5, 'Community Relations Manager', 'mitigate', 'Early pad-edge measurement campaign (VER-002) before revenue service; steeper approach and departure procedures held in reserve.', 'Any measured movement above 64 dBA'),
  risk('R-004', 'Weather limits lower than planned',
    'Condition: the aircraft weather limits are unpublished (U-001). If the approved limits are lower than planned, then weather holds will exceed the planned 5 % of operating hours and delivered capacity falls below REQ-STK-004.',
    3, 4, 'Director of Flight Operations', 'transfer', 'Aircraft purchase contract carries a performance guarantee on the weather envelope with compensation per lost operating hour.', 'OEM draft flight manual limits below the planning values'),
  risk('R-005', 'Grid connection below hub charging demand',
    'Condition: connection capacity at the hub vertiports is not yet agreed (U-002). If a hub connection is limited below the demand of its two high-power chargers, then simultaneous charging is curtailed and turnaround exceeds 25 min.',
    2, 4, 'Vertiport Infrastructure Manager', 'avoid', 'Select hub sites only where the utility confirms capacity for two high-power chargers before the site is committed.', 'Utility response to the connection request'),
  risk('R-006', 'Detect-and-avoid not mature for autonomy',
    'Condition: detect-and-avoid is at TRL 4 (A-005). If it does not reach TRL 6 before the autonomy increment is planned, then remote or autonomous operations are delayed and operator workload stays at the piloted baseline.',
    3, 2, 'Director of Flight Operations', 'accept', 'Accepted: the baseline operation is piloted and does not depend on TECH-003; reviewed at the Week 14 evolution decision.', 'TRL review at evolution planning'),
  risk('R-007', 'Dispatch platform outage',
    'Condition: booking, scheduling and dispatch run on one operations platform. If that platform fails during operating hours, then no new rides can be assigned and passenger waits exceed 15 min network-wide within minutes.',
    2, 4, 'Head of Operations Technology', 'mitigate', 'Hot-standby platform with automatic failover (DEC-002); manual dispatch procedure for failover periods.', 'Platform health alarm or failover event'),
  risk('R-008', 'Battery thermal runaway during charging',
    'Condition: aircraft batteries are charged at high power on hub pads next to passengers and other aircraft. If a cell enters thermal runaway during charging, then a fire can spread on the pad, injure people and close the vertiport.',
    2, 5, 'Vertiport Safety Manager', 'mitigate', 'Cell-temperature monitoring stops charging (SCN-003 A3); pad fire detection alerts responders within 60 s (REQ-STK-008, REQ-SYS-009); pad separation and suppression.', 'Cell over-temperature alarm'),
  el('O-002', 'Overnight charger capacity for ground fleets', 'Hub chargers are idle for about 8 h each night. If they can be leased to ground electric-vehicle fleets overnight, then charger capital is recovered faster, improving the case for adding hub chargers.',
    { owner: 'Head of Partnerships', action: 'Assess demand from municipal and taxi fleets; feeds the cost case of DEC-001.', likelihood: 2, benefit: 2 }),
]

const ref: EngineeringModel = {
  elements: [...tech, ...arou],
  links: [
    ln('A-003', 'affects', 'TECH-001'), ln('A-004', 'affects', 'TECH-002'), ln('A-005', 'affects', 'TECH-003'),
    ln('TECH-001', 'affects', 'REQ-SYS-001'), ln('TECH-001', 'affects', 'CAP-003'),
    ln('TECH-002', 'affects', 'REQ-SYS-003'), ln('TECH-002', 'affects', 'REQ-SYS-007'),
    ln('TECH-003', 'affects', 'CAP-004'),
    ln('TECH-001', 'mitigates', 'R-001', 'Faster charging raises turnaround capacity per charger'),
    ln('R-001', 'affects', 'REQ-STK-001'), ln('R-001', 'affects', 'REQ-STK-004'),
    ln('R-002', 'affects', 'REQ-SYS-003'), ln('R-002', 'affects', 'TECH-002'), ln('R-002', 'affects', 'TPM-003'), ln('R-002', 'affects', 'CAP-006'),
    ln('R-003', 'affects', 'REQ-SYS-002'), ln('R-003', 'affects', 'REQ-STK-002'), ln('R-003', 'affects', 'TPM-002'),
    ln('R-004', 'affects', 'REQ-SYS-004'), ln('R-004', 'affects', 'REQ-STK-004'), ln('R-004', 'affects', 'SCN-005'),
    ln('R-005', 'affects', 'REQ-SYS-010'), ln('R-005', 'affects', 'REQ-STK-005'), ln('R-005', 'affects', 'TECH-001'),
    ln('R-006', 'affects', 'TECH-003'), ln('R-006', 'affects', 'CAP-004'),
    ln('R-007', 'affects', 'REQ-SYS-005'), ln('R-007', 'affects', 'CAP-002'),
    ln('R-008', 'affects', 'REQ-SYS-001'), ln('R-008', 'affects', 'SCN-003'), ln('R-008', 'affects', 'CAP-009'),
    ln('REQ-SYS-009', 'mitigates', 'R-008', 'Fast alarm transmission limits fire escalation'),
    ln('REQ-STK-008', 'mitigates', 'R-008'),
    ln('REQ-SYS-010', 'mitigates', 'R-005', 'Enforced power limit keeps a constrained connection usable'),
    ln('O-002', 'affects', 'TECH-001'),
  ],
}
export default ref
