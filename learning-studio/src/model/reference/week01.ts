// Week 1 layer: the system of interest and its context (L1). External systems follow the Week 1 lesson.
// Reconciled with the corrected case module (src/content/lectures/week01/aerolinkCase.ts) in the Week 8 model import
// (docs/lectures/week08/WEEK8_MILESTONE_REPORT.md): ENT-001 is the enterprise "AeroLink Urban Mobility" (the system of
// interest, the AeroLink air-taxi service, is Physical::aeroLink in the SysML files), and EXT-001/002/004/006 are named
// as systems (Controlled airspace (air traffic service), Electric grid, Aircraft and spares supply, Emergency response
// service); the organization behind each is a stakeholder. This layer is mirrored verbatim in the Phase II SysML
// reference files (sysml/reference/aerolink_v01..v04, checked by sysmlDrift.test.ts).
import type { EngineeringModel } from '../engineering'

const ref: EngineeringModel = {
  elements: [
    { id: 'ENT-001', kind: 'ENT', name: 'AeroLink Urban Mobility', text: 'The enterprise: the company and its partners (the vertiport operators, the electric utility, the aircraft manufacturer and the investors) that share one mission: on-demand electric air trips in one metropolitan region. Insurers, public transport, emergency response and the approving authorities sit in the extended enterprise.', provenance: 'official-S04', status: 'active' },
    { id: 'EXT-001', kind: 'EXT', name: 'Controlled airspace (air traffic service)', text: 'Provides airspace access and traffic integration.', provenance: 'instructor-reference', status: 'active' },
    { id: 'EXT-002', kind: 'EXT', name: 'Electric grid', text: 'Supplies power to vertiport chargers.', provenance: 'instructor-reference', status: 'active' },
    { id: 'EXT-003', kind: 'EXT', name: 'Weather', text: 'Natural system constraining operations.', provenance: 'instructor-reference', status: 'active' },
    { id: 'EXT-004', kind: 'EXT', name: 'Aircraft and spares supply', text: 'Supplies aircraft and parts; sets delivery lead time.', provenance: 'instructor-reference', status: 'active' },
    { id: 'EXT-005', kind: 'EXT', name: 'Public transport network', text: 'Connects passengers to and from vertiports.', provenance: 'instructor-reference', status: 'active' },
    { id: 'EXT-006', kind: 'EXT', name: 'Emergency response service', text: 'Responds to incidents at vertiports and in flight.', provenance: 'instructor-reference', status: 'active' },
  ],
  links: [],
}
export default ref
