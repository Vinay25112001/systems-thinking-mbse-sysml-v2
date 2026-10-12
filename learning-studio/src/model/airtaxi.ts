// Canonical AeroLink Urban Mobility case data (LABORATORY_AND_CAPSTONE_PLAN.md §C).
// Every element carries a stable ID and a provenance tag. Nothing here is a real-world claim:
// "official-S04" = listed in the course's Weekly Lab Deliverables document; "teaching-content" =
// instructor-authored example; "fictional" = instructor-set number with no real-world source.

export type Provenance = 'official-S04' | 'teaching-content' | 'fictional' | 'student' | 'AI-suggested-reviewed'

export type StakeholderCategory =
  | 'customers'
  | 'regulators'
  | 'investors'
  | 'community'
  | 'infrastructure'
  | 'safety'
  | 'workforce'
  | 'suppliers'

export const CATEGORY_LABEL: Record<StakeholderCategory, string> = {
  customers: 'Customers & users',
  regulators: 'Regulators & authorities',
  investors: 'Investors & finance',
  community: 'Community & public',
  infrastructure: 'Infrastructure & partners',
  safety: 'Emergency & public safety',
  workforce: 'Workforce & operations',
  suppliers: 'Suppliers & technology',
}

export type Stakeholder = {
  id: string // STK-nnn, stable, never reused
  name: string
  category: StakeholderCategory
  concern: string
  interest: number // 1..5
  influence: number // 1..5
  rationale: string
  provenance: Provenance
  /** Owner initials (student-created stakeholders), for individual accountability. */
  owner?: string
}

export type RelationshipType =
  | 'regulates'
  | 'funds'
  | 'supplies'
  | 'uses-service'
  | 'affected-by'
  | 'partners-with'
  | 'coordinates-with'
  | 'conflicts-with'

export const RELATIONSHIP_LABEL: Record<RelationshipType, string> = {
  regulates: 'regulates',
  funds: 'funds',
  supplies: 'supplies',
  'uses-service': 'uses service of',
  'affected-by': 'is affected by',
  'partners-with': 'partners with',
  'coordinates-with': 'coordinates with',
  'conflicts-with': 'has conflicting concerns with',
}

export type Relationship = { id: string; source: string; target: string; type: RelationshipType; note: string }

export const ENTERPRISE = { id: 'ENT-001', name: 'AeroLink Urban Mobility', provenance: 'official-S04' as Provenance }

/** The six external entities named in S04 Lab 2A (the seventh entry there is AeroLink itself). */
export const SEED_STAKEHOLDERS: Stakeholder[] = [
  { id: 'STK-001', name: 'Passengers', category: 'customers', concern: '', interest: 3, influence: 3, rationale: '', provenance: 'official-S04' },
  { id: 'STK-002', name: 'FAA', category: 'regulators', concern: '', interest: 3, influence: 3, rationale: '', provenance: 'official-S04' },
  { id: 'STK-003', name: 'Investors', category: 'investors', concern: '', interest: 3, influence: 3, rationale: '', provenance: 'official-S04' },
  { id: 'STK-004', name: 'Communities', category: 'community', concern: '', interest: 3, influence: 3, rationale: '', provenance: 'official-S04' },
  { id: 'STK-005', name: 'Vertiport Operators', category: 'infrastructure', concern: '', interest: 3, influence: 3, rationale: '', provenance: 'official-S04' },
  { id: 'STK-006', name: 'Emergency Responders', category: 'safety', concern: '', interest: 3, influence: 3, rationale: '', provenance: 'official-S04' },
]
export const OFFICIAL_STAKEHOLDER_IDS = SEED_STAKEHOLDERS.map((s) => s.id)

/** Instructor example (teaching content). Shown only in Instructor review mode, for calibration. */
export const INSTRUCTOR_EXAMPLE: { stakeholders: Stakeholder[]; relationships: Relationship[] } = {
  stakeholders: [
    { id: 'STK-001', name: 'Passengers', category: 'customers', concern: 'Safe, reliable and affordable door-to-door trips with predictable wait times', interest: 5, influence: 3, rationale: 'Revenue depends on them, but individually they have little leverage; collectively they decide demand', provenance: 'official-S04' },
    { id: 'STK-002', name: 'FAA', category: 'regulators', concern: 'Airworthiness and operational safety of the aircraft and the operation', interest: 4, influence: 5, rationale: 'Approval authority: without it no revenue operation is possible', provenance: 'official-S04' },
    { id: 'STK-003', name: 'Investors', category: 'investors', concern: 'Return on capital and a credible path to scale', interest: 4, influence: 5, rationale: 'Control funding for fleet and vertiport growth', provenance: 'official-S04' },
    { id: 'STK-004', name: 'Communities', category: 'community', concern: 'Noise, privacy, visual impact and equitable access near vertiports', interest: 4, influence: 4, rationale: 'Local opposition can block vertiport siting through planning processes', provenance: 'official-S04' },
    { id: 'STK-005', name: 'Vertiport Operators', category: 'infrastructure', concern: 'Pad throughput, charging capacity and safe ground operations', interest: 5, influence: 4, rationale: 'Own a scarce capacity constraint (pads, chargers)', provenance: 'official-S04' },
    { id: 'STK-006', name: 'Emergency Responders', category: 'safety', concern: 'Incident response access and battery-fire procedures at vertiports', interest: 3, influence: 3, rationale: 'Must be able to respond; can impose operating conditions', provenance: 'official-S04' },
    { id: 'STK-007', name: 'Air navigation service provider', category: 'regulators', concern: 'Safe integration of air-taxi traffic with other airspace users', interest: 4, influence: 5, rationale: 'Controls access to airspace; capacity limits schedule density', provenance: 'teaching-content' },
    { id: 'STK-008', name: 'Pilots / remote operators', category: 'workforce', concern: 'Workload, training, duty time and automation trust', interest: 5, influence: 3, rationale: 'Operate every flight; workforce availability limits scaling', provenance: 'teaching-content' },
    { id: 'STK-009', name: 'Maintenance technicians', category: 'workforce', concern: 'Diagnostics access, battery handling safety, turnaround pressure', interest: 4, influence: 2, rationale: 'Turnaround time drives aircraft availability', provenance: 'teaching-content' },
    { id: 'STK-010', name: 'Electric utility', category: 'infrastructure', concern: 'Peak-load management and grid connection cost at vertiports', interest: 3, influence: 4, rationale: 'Grid capacity can cap charging throughput', provenance: 'teaching-content' },
    { id: 'STK-011', name: 'Aircraft manufacturer (OEM)', category: 'suppliers', concern: 'Fleet orders, operating data and certification progress', interest: 4, influence: 4, rationale: 'Sole source for aircraft and parts; delivery delays shape fleet growth', provenance: 'teaching-content' },
    { id: 'STK-012', name: 'Insurers', category: 'investors', concern: 'Quantifiable operational risk and loss history', interest: 3, influence: 4, rationale: 'Premiums and coverage conditions constrain operations', provenance: 'teaching-content' },
    { id: 'STK-013', name: 'City planning authority', category: 'regulators', concern: 'Land use, zoning and integration with public transport', interest: 3, influence: 5, rationale: 'Grants or blocks vertiport sites', provenance: 'teaching-content' },
    { id: 'STK-014', name: 'Accessibility advocates', category: 'community', concern: 'Boarding access and service for passengers with disabilities', interest: 3, influence: 2, rationale: 'Shape public acceptance and legal compliance expectations', provenance: 'teaching-content' },
  ],
  relationships: [
    { id: 'REL-001', source: 'STK-002', target: 'STK-011', type: 'regulates', note: 'Aircraft certification' },
    { id: 'REL-002', source: 'STK-004', target: 'STK-005', type: 'conflicts-with', note: 'Noise and siting vs throughput' },
    { id: 'REL-003', source: 'STK-010', target: 'STK-005', type: 'supplies', note: 'Grid power for charging' },
    { id: 'REL-004', source: 'STK-003', target: 'STK-011', type: 'funds', note: 'Fleet purchase financing' },
    { id: 'REL-005', source: 'STK-006', target: 'STK-005', type: 'coordinates-with', note: 'Incident response plans' },
    { id: 'REL-006', source: 'STK-007', target: 'STK-008', type: 'coordinates-with', note: 'Flight clearances' },
    { id: 'REL-007', source: 'STK-013', target: 'STK-004', type: 'affected-by', note: 'Public consultation on siting' },
    { id: 'REL-008', source: 'STK-012', target: 'STK-003', type: 'partners-with', note: 'Risk transfer conditions on financing' },
  ],
}

/** AeroLink Data Sheet. ALL VALUES ARE FICTIONAL teaching parameters (lab plan §C.3, FD-10). */
export type DataSheetParam = { key: string; label: string; value: number; unit: string }
export const DATA_SHEET: DataSheetParam[] = [
  { key: 'seats', label: 'Passenger seats per aircraft', value: 4, unit: 'seats' },
  { key: 'fleet', label: 'Initial fleet size', value: 12, unit: 'aircraft' },
  { key: 'vertiports', label: 'Vertiports in the network', value: 6, unit: 'sites' },
  { key: 'chargersPerVertiport', label: 'Chargers per vertiport', value: 2, unit: 'chargers' },
  { key: 'tripKm', label: 'Typical trip distance', value: 25, unit: 'km' },
  { key: 'cruiseKmh', label: 'Cruise speed', value: 150, unit: 'km/h' },
  { key: 'chargeMin', label: 'Charge time to dispatch threshold', value: 20, unit: 'min' },
  { key: 'opHours', label: 'Operating hours per day', value: 16, unit: 'h' },
  { key: 'reservePct', label: 'Energy reserve policy', value: 20, unit: '% of usable energy' },
  { key: 'noiseLimit', label: 'Noise limit at pad edge (local agreement)', value: 65, unit: 'dBA' },
]

/** Element lists named in the official lab sheet S04 (not yet modelled; IDs assigned by the course). */
export const OFFICIAL_ELEMENTS = {
  logical: ['Flight Operations', 'Fleet Management', 'Maintenance Management', 'Customer Services', 'Scheduling', 'Decision Support'].map((n, i) => ({ id: `LOG-${String(i + 1).padStart(3, '0')}`, name: n, source: 'S04 Lab 5' })),
  physical: ['eVTOL Aircraft', 'Vertiports', 'Charging Systems', 'Operations Center', 'Maintenance Facility', 'Communications Infrastructure'].map((n, i) => ({ id: `PHY-${String(i + 1).padStart(3, '0')}`, name: n, source: 'S04 Lab 6' })),
  scenarios: ['Passenger Ride Request', 'Passenger Transport Mission', 'Aircraft Charging', 'Maintenance Event', 'Weather Disruption'].map((n, i) => ({ id: `SCN-${String(i + 1).padStart(3, '0')}`, name: n, source: 'S04 Lab 7' })),
  information: ['Passenger Information', 'Flight Data', 'Maintenance Data', 'Weather Data', 'Financial Data'].map((n, i) => ({ id: `INFO-${String(i + 1).padStart(3, '0')}`, name: n, source: 'S04 Lab 8' })),
}

/** The required digital thread (S02 "Required Digital Thread") and when each layer is first built. */
export const THREAD_LAYERS: { name: string; week: number }[] = [
  { name: 'Stakeholder', week: 2 },
  { name: 'Need', week: 3 },
  { name: 'Capability', week: 3 },
  { name: 'Requirement', week: 4 },
  { name: 'Behavior', week: 11 },
  { name: 'Logical Element', week: 8 },
  { name: 'Physical Element', week: 8 },
  { name: 'Information Flow', week: 8 },
  { name: 'Verification Method', week: 12 },
  { name: 'MOE/MOP', week: 5 },
  { name: 'Associated Risk', week: 6 },
]

export function nextStakeholderId(existing: { id: string }[]): string {
  const max = existing.reduce((m, s) => {
    const n = parseInt(s.id.replace('STK-', ''), 10)
    return Number.isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `STK-${String(max + 1).padStart(3, '0')}`
}

export function nextRelationshipId(existing: { id: string }[]): string {
  const max = existing.reduce((m, s) => {
    const n = parseInt(s.id.replace('REL-', ''), 10)
    return Number.isNaN(n) ? m : Math.max(m, n)
  }, 0)
  return `REL-${String(max + 1).padStart(3, '0')}`
}
