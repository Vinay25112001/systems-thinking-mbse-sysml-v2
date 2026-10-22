// A complete, realistic Week 6 Team Record for a FICTIONAL student team: the Riverside Food Bank Network of the Week 1–5
// fixtures (src/workbench/week5/fixture.ts and week3/fixture.ts, read-only), continuing its own record from its Week 5
// export and its optional Week 3 export. Used by the unit and component tests; it must pass every Week 6 check, and
// record.test.ts mutates it to prove each check can fail. It deliberately holds short-but-valid answers the course calls
// complete: a one-word transition ("Cutover"), "None" with a reason for a security change, an ID-only basis ("A-003"),
// a one-word off-ramp ("Refrigeration"), initials as owners ("TL"), a one-word reason for not inserting ("Cost") and a
// decision trigger with no number (which only draws an advisory). Not imported by application code. Never AeroLink.
import { modelInputs as week5ModelInputs } from '../week5/record'
import { week5Fixture } from '../week5/fixture'
import { modelInputs as week3ModelInputs } from '../week3/record'
import { week3Fixture } from '../week3/fixture'
import { EMPTY_RECORD, importWeek3File, importWeek5File, normalizeRecord, withWeek3, withWeek5, type Week6Record } from './record'

/** The Week 5 model-inputs file the team exported from the Week 5 lab tool. */
export const WEEK5_JSON = JSON.stringify(week5ModelInputs(week5Fixture()))
/** The team's optional Week 3 model-inputs file. */
export const WEEK3_JSON = JSON.stringify(week3ModelInputs(week3Fixture()))

export function week6Fixture(): Week6Record {
  const w5 = importWeek5File(WEEK5_JSON)
  if ('error' in w5) throw new Error(w5.error)
  const w3 = importWeek3File(WEEK3_JSON)
  if ('error' in w3) throw new Error(w3.error)
  const base = withWeek3(withWeek5(EMPTY_RECORD, w5.snapshot), w3.extra)
  const inc0 = base.increments.find((x) => x.baseline)!
  return normalizeRecord({
    ...base,
    horizons: { near: '18 months', mid: 'years 2 to 4', far: 'years 5 to 8' },
    increments: [
      { ...inc0, content: 'Four refrigerated vans, one refrigerator per pantry, freezer sensors with vendor-cloud warnings (PHY-001 to PHY-005); van cargo cooling binds in summer.' },
      {
        id: 'INC-002', baseline: false, name: 'Text-message warnings', horizon: 'near', content: 'Move the freezer warnings from the vendor cloud to a text gateway (ICR-001 on IF-006, PHY-001).', serves: 'GAP-001, CAP-003, REQ-STK-004',
        trigger: 'ICR-001 approved by the operations lead', dependencies: '', offRamp: '', approach: 'incremental', transition: 'Run both warning paths for two weeks, then retire the vendor cloud', security: 'Removes the shared vendor account (R-002); adds gateway PINs', risks: 'R-002', ai: false,
      },
      {
        id: 'INC-003', baseline: false, name: 'Cold plates', horizon: 'mid', content: 'Fit eutectic cold plates to the van cargo areas (TECH-003, PHY-002).', serves: 'GAP-002, REQ-SYS-003',
        trigger: 'Summer field test on one van holds 5 °C for a full route', dependencies: 'INC-002', offRamp: 'Refrigeration', approach: 'evolutionary', transition: 'One van at a time, the others keep their units', security: 'Resilience: vans keep cold for 4 h without engine power', risks: 'R-001, R-007', ai: false,
      },
      {
        id: 'INC-004', baseline: false, name: 'Warehouse backup power', horizon: 'far', content: 'Battery backup for the warehouse freezers (TECH-005, PHY-005).', serves: 'GAP-003, NEED-002',
        trigger: 'Board decision', dependencies: 'INC-002', offRamp: '', approach: 'sequential', transition: 'Cutover', security: 'None: no new interface', risks: 'R-003', ai: true,
      },
    ],
    gaps: [
      { id: 'GAP-001', capability: 'Warnings reach on-call staff without the vendor cloud', kind: 'gap', horizon: 'near', desired: '2 min', baseline: 'No path', sources: 'CAP-003, REQ-STK-004', ai: false },
      { id: 'GAP-002', capability: 'Van cargo held at 5 °C in summer', kind: 'gap', horizon: 'mid', desired: '5 °C for 6 h', baseline: '5 °C for 3 h', sources: 'REQ-SYS-003, NEED-002', ai: false },
      { id: 'GAP-003', capability: 'Freezers kept cold through a weekend power cut', kind: 'gap', horizon: 'far', desired: '48 h', baseline: '6 h', sources: 'NEED-002, MGO-003', ai: false },
      { id: 'GAP-004', capability: 'Reach reported by district', kind: 'gap', horizon: 'mid', desired: 'Quarterly', baseline: 'Yearly', sources: 'CAP-005', ai: true },
      { id: 'GAP-005', capability: 'Pantry refrigerator space', kind: 'excess', horizon: 'near', desired: '1 per pantry', baseline: '2 at three pantries', sources: 'NEED-001', ai: false },
    ],
    technologies: [
      { id: 'TECH-001', name: 'Wireless freezer sensors with a cellular alarm gateway', status: 'available', trl: 8, basis: 'Vendor qualification test report', insertion: 'INC-001', notInserted: '', risk: '', ai: false },
      { id: 'TECH-002', name: 'Route planning software with a shift-length limit', status: 'available', trl: 7, basis: 'A-002', insertion: 'INC-001', notInserted: '', risk: '', ai: false },
      { id: 'TECH-003', name: 'Eutectic cold plates for the van cargo areas', status: 'in-development', trl: 5, basis: 'A-003', insertion: 'INC-003', notInserted: '', risk: 'R-001', ai: false },
      { id: 'TECH-004', name: 'Telematics', status: 'available', trl: 9, basis: 'In service elsewhere', insertion: '', notInserted: 'Cost', risk: '', ai: false },
      { id: 'TECH-005', name: 'Battery backup for walk-in freezers', status: 'available', trl: 9, basis: 'Commercial product', insertion: 'INC-004', notInserted: '', risk: '', ai: true },
    ],
    unknowns: [
      { id: 'U-002', name: 'Cold-plate hold time in a heat wave', tbx: '', impact: 'INC-003 moves out a horizon', need: 'Field test data', mitigation: 'Keep the refrigeration units', owner: 'AK', gates: 'INC-003', ai: false },
      { id: 'U-003', name: 'Gateway text delivery time', tbx: 'TBD-02', impact: 'Alarm late', need: 'Carrier data', mitigation: 'Keep the vendor cloud', owner: 'TL', gates: 'INC-002', ai: false },
      { id: 'U-004', name: 'Grant for backup power', tbx: '', impact: 'INC-004 waits', need: 'Board decision', mitigation: 'Generator loan', owner: 'Director', gates: 'INC-004', ai: false },
      { id: 'U-005', name: 'Driver numbers in summer', tbx: '', impact: 'Fewer routes', need: 'Volunteer survey', mitigation: 'Recruit', owner: 'MV', gates: 'INC-003', ai: false },
    ],
    arou: [
      { id: 'R-007', kind: 'risk', statement: 'Mixed fleet during the cold-plate rollout: drivers load the wrong van', category: 'safety', owner: 'AK', increment: 'INC-003', transition: true, ai: false },
      { id: 'R-008', kind: 'risk', statement: 'Gateway PINs shared among volunteers', category: 'security', owner: 'TL', increment: 'INC-002', transition: false, ai: false },
      { id: 'O-002', kind: 'opportunity', statement: 'Spare pantry refrigerators lent to new partners', category: '', owner: 'MV', increment: 'INC-002', transition: false, ai: false },
    ],
    impact: {
      increment: 'INC-002',
      reached: 'IF-006 changes its path; CMP-001 hub reconfigured; FN-006 alert path; AI-001 output route; PHY-004 receives texts; R-002 retired; CAP-003 and REQ-STK-004 now met',
      notReached: 'CMP-002 sensors unchanged; FN-005 sampling unchanged; PHY-001 hardware unchanged; ICR-001 is the change itself',
    },
    review: [
      { week: 1, status: 'ready', items: '', owner: '' },
      { week: 2, status: 'open', items: 'U-001 freezer alarm limit', owner: 'Warehouse manager' },
      { week: 3, status: 'ready', items: '', owner: '' },
      { week: 4, status: 'open', items: 'IF-008 standard', owner: 'TL' },
      { week: 5, status: 'ready', items: '', owner: '' },
    ],
    aiStatement: 'We used a chat assistant to suggest gaps from our needs and to check the technology table for missing fields. We accepted GAP-004, INC-004 and TECH-005 after review and rejected two suggested increments that served no gap.',
  })
}
