// Week 1 layer: the system of interest and its context (L1). External systems follow the Week 1 lesson.
import type { EngineeringModel } from '../engineering'

const ref: EngineeringModel = {
  elements: [
    { id: 'ENT-001', kind: 'ENT', name: 'AeroLink Urban Mobility service enterprise', text: 'Fleet, vertiports and chargers, operations centre and passenger demand, bounded for the question of passenger waiting time.', provenance: 'official-S04', status: 'active' },
    { id: 'EXT-001', kind: 'EXT', name: 'Air navigation service provider', text: 'Provides airspace access and traffic integration.', provenance: 'instructor-reference', status: 'active' },
    { id: 'EXT-002', kind: 'EXT', name: 'Electric utility grid', text: 'Supplies power to vertiport chargers.', provenance: 'instructor-reference', status: 'active' },
    { id: 'EXT-003', kind: 'EXT', name: 'Weather', text: 'Natural system constraining operations.', provenance: 'instructor-reference', status: 'active' },
    { id: 'EXT-004', kind: 'EXT', name: 'Aircraft manufacturer (OEM)', text: 'Supplies aircraft and parts; sets delivery lead time.', provenance: 'instructor-reference', status: 'active' },
    { id: 'EXT-005', kind: 'EXT', name: 'Public transport network', text: 'Connects passengers to and from vertiports.', provenance: 'instructor-reference', status: 'active' },
    { id: 'EXT-006', kind: 'EXT', name: 'Emergency services', text: 'Respond to incidents at vertiports and in flight.', provenance: 'instructor-reference', status: 'active' },
  ],
  links: [],
}
export default ref
