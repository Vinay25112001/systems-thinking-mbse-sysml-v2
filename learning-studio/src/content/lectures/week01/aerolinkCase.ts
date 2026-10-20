// AeroLink stakeholder and needs case study: the CORRECTED case data for the Week 1 lecture (both sessions) and, later,
// the Week 1 laboratory. One module, imported by src/content/lectures/week01/session1.ts and session2.ts, by the Week 1
// lecture figures (src/components/figures/LectureWeek1S1.tsx, LectureWeek1S2.tsx) and by the Week 1 worked-examples
// page; the lab can import it unchanged. Exported names are kept stable; fields are only ever added.
//
// Review status: new-pending-review (search for that string). Written 2026-10-19; revised the same day after the
// independent review of the lecture (_source_cache/review/week01_lecture_review.md, findings F02–F06, F10, F11, F13,
// F15, F31; dispositions in docs/lectures/week01/REVIEW_DISPOSITIONS.md).
//
// AeroLink Urban Mobility is FICTIONAL. Every number, name, rating and statement here is a teaching value, not a
// real-world claim. Nothing in this module states real regulatory facts about any real authority.
//
// Provenance. The data start from the instructor reference: src/model/airtaxi.ts (INSTRUCTOR_EXAMPLE: STK-001..014 with
// interest, influence and rationale; REL-001..008), src/model/reference/week01.ts (ENT-001, EXT-001..006),
// week02.ts (CON-001..016) and week03.ts (NEED-001..011, MGO-001..009), and the classification key in
// src/workbench/week1/stakeholders.ts (CLASSIFY_ROWS). The corrections this module makes:
//   - every approving authority has at least one need (the city planning authority gains NEED-012 and NEED-016);
//   - every need is written in the course's recommended form, the example format SEBoK gives for needs ("such as"
//     "The stakeholders need the system to", R11 p.555), naming the system of interest, "the air-taxi service". The
//     form is recommended, not required: the lab tool accepts other valid phrasings (DECISION_LOG A21); the reference wording of each need is kept
//     in docs/lectures/week01/AEROLINK_CASE_CHANGES.md;
//   - every need's subject is a registered stakeholder or class of stakeholders (NEED-008: the class "Passengers with
//     reduced mobility", STK-015, with the accessibility advocates, STK-014, as a contributing source);
//   - no need is compound: the reference NEED-012 and the proposed fare need are each split in two (NEED-016, NEED-017);
//   - every need traces to the mission or a goal (MGO); every need has a priority (MITRE's categories, R65 p.325,
//     applied to needs as a course convention);
//   - external systems are named as systems, never after the organization behind them (EXT-001, EXT-002, EXT-004,
//     EXT-006 renamed); the stakeholder behind each is recorded separately (`owner`);
//   - the system of interest is "the AeroLink air-taxi service" (SOI-001, proposed ID), distinct from the enterprise,
//     and drawn at the wider system of interest (R92 p.327);
//   - the noise need carries exposure (the level of each event AND the number of events in the noise-sensitive hours),
//     so the recorded conflict with throughput shares a real variable;
//   - the register's stage field means one thing: the life-cycle stage of MAIN involvement; the life-cycle stages
//     whose SEBoK Table 1 prompts surface each stakeholder are a separate field (`promptedAt`);
//   - American spelling throughout.
// Exactly ONE gap is kept on purpose for the coverage audit: STK-011 (the aircraft manufacturer) has no need, because
// its concern CON-015 (orders, delivery slots and payment milestones) is a matter of the enterprise's purchase
// agreement, not something the air-taxi service does. The audit teaches that such a gap must be recorded with its
// reason, not silently left (DELIBERATE_GAP below).
//
// Values that go beyond the existing reference data carry `provenance: 'proposed'` (instructor to confirm). The
// workbench reference data (src/workbench/**, src/model/**) is NOT changed by this module; every difference is listed in
// docs/lectures/week01/AEROLINK_CASE_CHANGES.md for later reconciliation.

import { NEED_PRIORITY_DEFINITION, NEED_PRIORITY_LABEL, type NeedPriority } from './labBrief'

export const AEROLINK_CASE_REVIEW = 'new-pending-review' as const

/** reference = as in the instructor reference; corrected = reference value changed here; proposed = new value,
 *  instructor to confirm. */
export type CaseProvenance = 'reference' | 'corrected' | 'proposed'

export const PROPOSED_NOTE = 'proposed, instructor to confirm'

// ------------------------------------------------------------------------------------------------ context
export const ENTERPRISE = {
  id: 'ENT-001',
  name: 'AeroLink Urban Mobility',
  text: 'The enterprise: the company and its partners (the vertiport operators, the electric utility, the aircraft manufacturer and the investors) that share one mission: on-demand electric air trips in one metropolitan region. Insurers, public transport, emergency response and the approving authorities sit in the extended enterprise.',
  provenance: 'corrected' as CaseProvenance,
}

export const SYSTEM_OF_INTEREST = {
  id: 'SOI-001',
  idProvenance: 'proposed' as CaseProvenance,
  name: 'the AeroLink air-taxi service',
  /** Short form used in every need statement (the recommended form: "The [stakeholders] need the [system] to …"). */
  short: 'the air-taxi service',
  text: 'The system of interest inside the enterprise. AeroLink controls the fleet, the operations center, and booking and dispatch: the narrower system of interest. The service also needs elements AeroLink does not control, the vertiport operators’ pads and chargers and the passenger demand they serve, so SOI-001 is drawn at the wider system of interest, which SEBoK permits for a service.',
  /** What AeroLink controls (the narrower system of interest). */
  controlled: ['fleet', 'operations center', 'booking and dispatch'],
  /** What the service needs but AeroLink does not control (added in the wider system of interest). */
  wider: ['vertiport operators’ pads and chargers', 'passenger demand'],
  provenance: 'corrected' as CaseProvenance,
}

/** The FICTIONAL Data Sheet values the lecture quotes (DATA_SHEET in src/model/airtaxi.ts), plus the proposed noise
 *  agreement terms (NOISE_AGREEMENT). */
export const CASE_FACTS = [
  '12 aircraft, 4 seats each',
  '6 vertiports, 2 chargers each',
  '16 h operating day (06:00–22:00, proposed clock times)',
  'typical trip 25 km at 150 km/h (about 10 min)',
  '20 min charge to the dispatch threshold',
  '65 dBA pad-edge limit for each take-off or landing (local agreement)',
  'cap on take-offs and landings per pad in the noise-sensitive hours (proposed)',
]

/** The local noise agreement with the city (FICTIONAL). The per-event level is the Data Sheet value; the sensitive
 *  hours and the event cap are proposed, instructor to confirm, and are quantified with the city in Week 2. */
export const NOISE_AGREEMENT = {
  perEvent: '65 dBA at the pad edge for each take-off or landing (Data Sheet)',
  sensitiveHours: 'before 07:00 and after 20:00 on the 06:00–22:00 operating day (proposed)',
  eventCap: 'a cap on take-offs and landings per pad in the sensitive hours, to be quantified with the city in Week 2 (proposed)',
}

/** External systems of the air-taxi service. Each is named as a system; the stakeholder behind it, if any, is `owner`. */
export const EXTERNAL_SYSTEMS: { id: string; name: string; short: string; exchange: string; owner?: string; oneWay?: boolean; nameProvenance: CaseProvenance }[] = [
  { id: 'EXT-001', name: 'Controlled airspace (air traffic service)', short: 'Controlled airspace', exchange: 'airspace access, clearances and traffic information', owner: 'STK-007', nameProvenance: 'corrected' },
  { id: 'EXT-002', name: 'Electric grid', short: 'Electric grid', exchange: 'power to the vertiport chargers', owner: 'STK-010', nameProvenance: 'corrected' },
  { id: 'EXT-003', name: 'Weather', short: 'Weather', exchange: 'constrains operations (one-way influence)', oneWay: true, nameProvenance: 'reference' },
  { id: 'EXT-004', name: 'Aircraft and spares supply', short: 'Aircraft and spares supply', exchange: 'aircraft and parts; delivery lead time', owner: 'STK-011', nameProvenance: 'corrected' },
  { id: 'EXT-005', name: 'Public transport network', short: 'Public transport network', exchange: 'passengers to and from vertiports', nameProvenance: 'reference' },
  { id: 'EXT-006', name: 'Emergency response service', short: 'Emergency response service', exchange: 'incident response at vertiports and in flight', owner: 'STK-006', nameProvenance: 'corrected' },
]

// ------------------------------------------------------------------------------------------------ register
/** The six course role groups (course convention; a grouping of SEBoK's list, R11 p.552). Same ids as the workbench. */
export type RoleGroup = 'user' | 'customer' | 'authority' | 'supplier' | 'maintainer' | 'public'
export const ROLE_GROUP_LABEL: Record<RoleGroup, string> = {
  user: 'User or operator',
  customer: 'Customer, acquirer or funder',
  authority: 'Approving or regulatory authority',
  supplier: 'Supplier or owner of an enabling or external system',
  maintainer: 'Maintainer or support',
  public: 'Affected public',
}
export const ROLE_GROUP_SHORT: Record<RoleGroup, string> = {
  user: 'User/operator',
  customer: 'Funder',
  authority: 'Authority',
  supplier: 'Supplier/owner',
  maintainer: 'Maintainer',
  public: 'Affected public',
}

/** The stage names of SEBoK's stakeholder table (R11 p.552, Table 1), in life-cycle order (Operation before Logistics
 *  and maintenance, as in the Session 1 life-cycle figure; the two run concurrently). */
export const TABLE1_STAGES = ['Concept', 'Development', 'Production, integration, V&V', 'Operation', 'Logistics and maintenance', 'Disposal'] as const
export type Table1Stage = (typeof TABLE1_STAGES)[number]

/** MITRE's levels of support for a change (R63 pp.236–237: awareness → understanding → buy-in → commitment). The
 *  AeroLink values are proposed, instructor to confirm. */
export type SupportLevel = 1 | 2 | 3 | 4
export const SUPPORT_LABEL: Record<SupportLevel, string> = { 1: 'Awareness', 2: 'Understanding', 3: 'Buy-in', 4: 'Commitment' }

export type CaseStakeholder = {
  id: string
  name: string
  roleGroup: RoleGroup
  /** The life-cycle stage of MAIN involvement (Table 1 stage names, R11 p.552). The same meaning in both sessions. */
  stage: Table1Stage
  /** The Table 1 stages whose example list (the "prompt") surfaces this stakeholder, with the prompt words that match
   *  (instructor's reading of R11 p.552). Empty when no stage prompts it. */
  promptedAt: { stage: Table1Stage; prompt: string }[]
  /** The MITRE stakeholder role or group (R65 p.322; R63 p.235; DoD list R99 pp.51–52) the stakeholder clearly matches,
   *  or null (instructor's analysis; only clear matches count). */
  roleClass: string | null
  side: 'internal' | 'external'
  approving: boolean
  approvingNote?: string
  /** Concern IDs (CON) held by this stakeholder. */
  concerns: string[]
  interest: number
  influence: number
  influenceReason: string
  support: SupportLevel
  supportReason: string
  /** Provenance of the classification (role group, stage, side, approving, prompts, role class). */
  classification: CaseProvenance
  /** reference = registered in the instructor reference; proposed = a stakeholder (class) added here. */
  entry: CaseProvenance
}

const P = (stage: Table1Stage, prompt: string) => ({ stage, prompt })

export const STAKEHOLDERS: CaseStakeholder[] = [
  { id: 'STK-001', name: 'Passengers', roleGroup: 'user', stage: 'Operation', promptedAt: [P('Concept', 'end users'), P('Operation', 'normal users')], roleClass: 'primary stakeholders (requirement providers)', side: 'external', approving: false, concerns: ['CON-001', 'CON-002', 'CON-003'], interest: 5, influence: 3, influenceReason: 'Revenue depends on them, but individually they have little leverage; collectively they decide demand', support: 2, supportReason: 'Curious but unconvinced until the service proves safe, quick and affordable', classification: 'proposed', entry: 'reference' },
  { id: 'STK-002', name: 'FAA', roleGroup: 'authority', stage: 'Concept', promptedAt: [P('Concept', 'regulators, approving authorities'), P('Production, integration, V&V', 'approving authorities'), P('Disposal', 'regulators')], roleClass: 'certification authority (DoD list)', side: 'external', approving: true, approvingNote: 'Approves the aircraft and the operation', concerns: ['CON-004'], interest: 4, influence: 5, influenceReason: 'Approval authority: without it no revenue operation is possible', support: 2, supportReason: 'Neutral by mandate; engaged, but commits only to evidence', classification: 'reference', entry: 'reference' },
  { id: 'STK-003', name: 'Investors', roleGroup: 'customer', stage: 'Concept', promptedAt: [P('Concept', 'sponsor, paying customer')], roleClass: 'executive sponsor (funding)', side: 'external', approving: false, concerns: ['CON-005'], interest: 4, influence: 5, influenceReason: 'Control funding for fleet and vertiport growth', support: 4, supportReason: 'Have committed capital to the venture', classification: 'proposed', entry: 'reference' },
  { id: 'STK-004', name: 'Communities', roleGroup: 'public', stage: 'Concept', promptedAt: [P('Concept', 'public'), P('Disposal', 'public')], roleClass: 'indirectly affected', side: 'external', approving: false, concerns: ['CON-012'], interest: 4, influence: 4, influenceReason: 'Local opposition can block vertiport siting through planning processes', support: 1, supportReason: 'Aware of the plan; skeptical about noise near homes', classification: 'reference', entry: 'reference' },
  { id: 'STK-005', name: 'Vertiport operators', roleGroup: 'supplier', stage: 'Operation', promptedAt: [P('Concept', 'owners of enabling systems'), P('Production, integration, V&V', 'owners of enabling systems')], roleClass: 'indirectly affected (interfacing business)', side: 'external', approving: false, concerns: ['CON-006'], interest: 5, influence: 4, influenceReason: 'Own a scarce capacity constraint (pads, chargers)', support: 3, supportReason: 'Gain traffic from the service; want throughput protected', classification: 'reference', entry: 'reference' },
  { id: 'STK-006', name: 'Emergency responders', roleGroup: 'supplier', stage: 'Operation', promptedAt: [P('Concept', 'owners of external systems')], roleClass: null, side: 'external', approving: false, concerns: ['CON-007'], interest: 3, influence: 3, influenceReason: 'Must be able to respond; can impose operating conditions', support: 2, supportReason: 'Understand the plan; battery-fire procedures not yet agreed', classification: 'proposed', entry: 'reference' },
  { id: 'STK-007', name: 'Air navigation service provider', roleGroup: 'authority', stage: 'Operation', promptedAt: [P('Concept', 'owners of external systems')], roleClass: null, side: 'external', approving: false, approvingNote: 'Controls airspace access but does not certify the system: a constraint holder (debated in Session 1)', concerns: ['CON-008'], interest: 4, influence: 5, influenceReason: 'Controls access to airspace; capacity limits schedule density', support: 2, supportReason: 'Engaged; integration procedures still open', classification: 'proposed', entry: 'reference' },
  { id: 'STK-008', name: 'Pilots / remote operators', roleGroup: 'user', stage: 'Operation', promptedAt: [P('Concept', 'operators'), P('Production, integration, V&V', 'operators/users'), P('Disposal', 'operators')], roleClass: 'directly impacted employees', side: 'internal', approving: false, concerns: ['CON-009'], interest: 5, influence: 3, influenceReason: 'Operate every flight; workforce availability limits scaling', support: 3, supportReason: 'Employees who want the service to succeed; wary of workload', classification: 'reference', entry: 'reference' },
  { id: 'STK-009', name: 'Maintenance technicians', roleGroup: 'maintainer', stage: 'Logistics and maintenance', promptedAt: [P('Logistics and maintenance', 'service technicians')], roleClass: 'directly impacted employees', side: 'internal', approving: false, concerns: ['CON-010'], interest: 4, influence: 2, influenceReason: 'Turnaround time drives aircraft availability', support: 3, supportReason: 'Employees; support depends on release pressure staying in check', classification: 'reference', entry: 'reference' },
  { id: 'STK-010', name: 'Electric utility', roleGroup: 'supplier', stage: 'Operation', promptedAt: [P('Concept', 'owners of external systems')], roleClass: null, side: 'external', approving: false, concerns: ['CON-011'], interest: 3, influence: 4, influenceReason: 'Grid capacity can cap charging throughput', support: 2, supportReason: 'A new load customer; cautious about peak demand', classification: 'reference', entry: 'reference' },
  { id: 'STK-011', name: 'Aircraft manufacturer (OEM)', roleGroup: 'supplier', stage: 'Development', promptedAt: [P('Concept', 'suppliers'), P('Development', 'suppliers'), P('Logistics and maintenance', 'replacement part providers')], roleClass: null, side: 'external', approving: false, concerns: ['CON-015'], interest: 4, influence: 4, influenceReason: 'Sole source for aircraft and parts; delivery delays shape fleet growth', support: 4, supportReason: 'AeroLink is a launch customer; committed', classification: 'proposed', entry: 'reference' },
  { id: 'STK-012', name: 'Insurers', roleGroup: 'supplier', stage: 'Operation', promptedAt: [], roleClass: 'indirectly affected', side: 'external', approving: false, concerns: ['CON-014'], interest: 3, influence: 4, influenceReason: 'Premiums and coverage conditions constrain operations', support: 1, supportReason: 'No loss history yet; aware but uncommitted', classification: 'proposed', entry: 'reference' },
  { id: 'STK-013', name: 'City planning authority', roleGroup: 'authority', stage: 'Concept', promptedAt: [P('Concept', 'approving authorities')], roleClass: 'decision makers', side: 'external', approving: true, approvingNote: 'Approves vertiport sites', concerns: ['CON-016'], interest: 3, influence: 5, influenceReason: 'Grants or blocks vertiport sites', support: 1, supportReason: 'Aware of the proposal; awaiting site applications and consultation', classification: 'proposed', entry: 'reference' },
  { id: 'STK-014', name: 'Accessibility advocates', roleGroup: 'public', stage: 'Concept', promptedAt: [], roleClass: 'indirectly affected', side: 'external', approving: false, concerns: ['CON-013'], interest: 3, influence: 2, influenceReason: 'Shape public acceptance and legal compliance expectations', support: 1, supportReason: 'Aware; not yet consulted on boarding design', classification: 'proposed', entry: 'reference' },
  { id: 'STK-015', name: 'Passengers with reduced mobility', roleGroup: 'user', stage: 'Operation', promptedAt: [P('Concept', 'end users'), P('Operation', 'normal and unexpected users')], roleClass: 'primary stakeholders (requirement providers)', side: 'external', approving: false, concerns: ['CON-017'], interest: 5, influence: 2, influenceReason: 'Individually little leverage; accessibility expectations and their advocates amplify it', support: 1, supportReason: 'Not yet consulted; will judge the service by whether boarding works for them', classification: 'proposed', entry: 'proposed' },
]

export const stakeholder = (id: string): CaseStakeholder => {
  const s = STAKEHOLDERS.find((x) => x.id === id)
  if (!s) throw new Error(`unknown stakeholder ${id}`)
  return s
}

// ------------------------------------------------------------------------------------------------ identification methods
/** Method coverage (Session 1, slide "Answering the driving question"). The counting rules are the instructor's,
 *  stated so students can check them: M1 sweep = some Table 1 prompt surfaces the stakeholder (R11 p.552); M2 context =
 *  it owns an external system or an element of the wider system of interest; M3 role class = it clearly matches a MITRE
 *  role or group (R65 p.322; R63 p.235) or the DoD list (R99 pp.51–52). */
export type MethodCoverage = { stakeholder: string; m1: boolean; m2: boolean; m3: boolean }
/** Owners of an element of the wider system of interest (the vertiport operators own the pads and chargers). */
export const WIDER_SOI_OWNERS = ['STK-005']
export function methodCoverage(): MethodCoverage[] {
  const owners = new Set([...EXTERNAL_SYSTEMS.map((e) => e.owner).filter((o): o is string => !!o), ...WIDER_SOI_OWNERS])
  return STAKEHOLDERS.map((s) => ({ stakeholder: s.id, m1: s.promptedAt.length > 0, m2: owners.has(s.id), m3: s.roleClass !== null }))
}
/** The stakeholders on the original three-party list of the Session 1 driving question. */
export const ORIGINAL_LIST = ['STK-001', 'STK-003', 'STK-011']

// ------------------------------------------------------------------------------------------------ concerns
export type CaseConcern = { id: string; name: string; stakeholder: string; text: string; provenance?: CaseProvenance }

export const CONCERNS: CaseConcern[] = [
  { id: 'CON-001', name: 'Predictable waiting time', stakeholder: 'STK-001', text: 'Passengers judge the service by how long they wait between confirming a ride and boarding, and by whether that wait is predictable.' },
  { id: 'CON-002', name: 'Personal safety in flight', stakeholder: 'STK-001', text: 'Passengers must be confident that every flight is safe before they will use a new mode of transport.' },
  { id: 'CON-003', name: 'Affordable fare', stakeholder: 'STK-001', text: 'Passengers compare the fare with ride-hail and public transport for the same trip.' },
  { id: 'CON-004', name: 'Airworthiness and operational safety', stakeholder: 'STK-002', text: 'The FAA is concerned that aircraft and operations stay within approved safety limits at all times, including in adverse weather.' },
  { id: 'CON-005', name: 'Return on capital and path to scale', stakeholder: 'STK-003', text: 'Investors are concerned that capital spent on aircraft and vertiports produces capacity that is actually used.' },
  { id: 'CON-006', name: 'Pad throughput and charging capacity', stakeholder: 'STK-005', text: 'Vertiport operators are concerned that charging and turnaround, not demand, limit how many flights a pad can handle.' },
  { id: 'CON-007', name: 'Battery-fire response at vertiports', stakeholder: 'STK-006', text: 'Emergency responders are concerned about early warning, access and procedures for a lithium battery fire on a pad.' },
  { id: 'CON-008', name: 'Airspace integration', stakeholder: 'STK-007', text: 'The air navigation service provider is concerned that air-taxi traffic is known and separated from other airspace users.' },
  { id: 'CON-009', name: 'Operator workload and automation trust', stakeholder: 'STK-008', text: 'Pilots and remote operators are concerned about workload, duty time and how far they can trust automated decision aids.' },
  { id: 'CON-010', name: 'Turnaround pressure on maintenance', stakeholder: 'STK-009', text: 'Maintenance technicians are concerned that schedule pressure leads to aircraft being released without a clear condition picture.' },
  { id: 'CON-011', name: 'Peak grid load', stakeholder: 'STK-010', text: 'The electric utility is concerned about simultaneous high-power charging exceeding the agreed connection capacity at a vertiport.' },
  { id: 'CON-012', name: 'Community noise', stakeholder: 'STK-004', text: 'Residents near vertiports are concerned about take-off and landing noise, how often it occurs and at what hours.' },
  { id: 'CON-013', name: 'Step-free boarding access', stakeholder: 'STK-014', text: 'Accessibility advocates are concerned that passengers using wheelchairs can board and alight without being lifted.' },
  { id: 'CON-014', name: 'Quantifiable operational risk', stakeholder: 'STK-012', text: 'Insurers are concerned that operational risk is measured and recorded so that premiums can be set on evidence.' },
  { id: 'CON-015', name: 'Fleet orders and delivery milestones', stakeholder: 'STK-011', text: 'The aircraft manufacturer is concerned that AeroLink’s aircraft orders, delivery slots and payment milestones are kept as agreed in the purchase agreement, because they set its own production plan.', provenance: 'corrected' },
  { id: 'CON-016', name: 'Land use and zoning of vertiport sites', stakeholder: 'STK-013', text: 'The city planning authority is concerned that vertiport sites conform to zoning and land-use plans and connect to public transport, especially sites in residential districts.' },
  { id: 'CON-017', name: 'Travel with one’s own mobility aid', stakeholder: 'STK-015', text: 'Passengers with reduced mobility are concerned that they can board, travel and alight without being lifted and without being parted from their wheelchair or other mobility aid.', provenance: 'proposed' },
]

export const concern = (id: string): CaseConcern => {
  const c = CONCERNS.find((x) => x.id === id)
  if (!c) throw new Error(`unknown concern ${id}`)
  return c
}

// ------------------------------------------------------------------------------------------------ relationships
export type RelationshipType = 'regulates' | 'funds' | 'supplies' | 'affected-by' | 'partners-with' | 'coordinates-with' | 'conflicts-with'
export const RELATIONSHIP_VERB: Record<RelationshipType, string> = {
  regulates: 'regulates',
  funds: 'funds',
  supplies: 'supplies',
  'affected-by': 'is affected by',
  'partners-with': 'partners with',
  'coordinates-with': 'coordinates with',
  'conflicts-with': 'conflicts with',
}
export type CaseRelationship = { id: string; source: string; target: string; type: RelationshipType; note: string }

/** REL-001..008 exactly as in INSTRUCTOR_EXAMPLE (src/model/airtaxi.ts). "A is affected by B": B influences A. */
export const RELATIONSHIPS: CaseRelationship[] = [
  { id: 'REL-001', source: 'STK-002', target: 'STK-011', type: 'regulates', note: 'Aircraft certification' },
  { id: 'REL-002', source: 'STK-004', target: 'STK-005', type: 'conflicts-with', note: 'Noise and siting vs throughput' },
  { id: 'REL-003', source: 'STK-010', target: 'STK-005', type: 'supplies', note: 'Grid power for charging' },
  { id: 'REL-004', source: 'STK-003', target: 'STK-011', type: 'funds', note: 'Fleet purchase financing' },
  { id: 'REL-005', source: 'STK-006', target: 'STK-005', type: 'coordinates-with', note: 'Incident response plans' },
  { id: 'REL-006', source: 'STK-007', target: 'STK-008', type: 'coordinates-with', note: 'Flight clearances' },
  { id: 'REL-007', source: 'STK-013', target: 'STK-004', type: 'affected-by', note: 'Public consultation on siting' },
  { id: 'REL-008', source: 'STK-012', target: 'STK-003', type: 'partners-with', note: 'Risk transfer conditions on financing' },
]

// ------------------------------------------------------------------------------------------------ mission and goals
/** The BMA anchor (FICTIONAL, reference/week03.ts; American spelling). Every need traces to one of these. */
export const MISSION_GOALS: { id: string; level: 'mission' | 'goal'; name: string }[] = [
  { id: 'MGO-001', level: 'mission', name: 'Safe, quiet, on-demand air trips between six vertiports, at predictable waits and a cost that lets the network grow' },
  { id: 'MGO-002', level: 'goal', name: 'Short, predictable waits' },
  { id: 'MGO-003', level: 'goal', name: 'Be a good neighbor' },
  { id: 'MGO-004', level: 'goal', name: 'Grow capacity in step with demand' },
  { id: 'MGO-009', level: 'goal', name: 'Every flight within approved limits' },
]
/** The problem statement behind the mission (proposed, instructor to confirm; a course example of a BMA output). */
export const PROBLEM_STATEMENT = 'Cross-town trips in the region take 45–70 minutes by road at peak hours, and no service offers a quick, predictable alternative for trips of 15–40 km (FICTIONAL, proposed).'

// ------------------------------------------------------------------------------------------------ needs
/** MITRE's priority categories (R65 p.325, written there for requirements; applied to needs as a course convention).
 *  The definitions are the course's (MITRE asks the engineer to define each category, R65 p.325). */
export type Priority = NeedPriority
export const PRIORITY_LABEL = NEED_PRIORITY_LABEL
export const PRIORITY_DEFINITION = NEED_PRIORITY_DEFINITION

/** `concern` is the concern of that stakeholder the need answers (null only when the stakeholder holds no concern of
 *  its own on the matter; no need in the corrected case has a null subject concern). */
export type NeedSource = { stakeholder: string; concern: string | null; role: 'subject' | 'contributing' }
export type CaseNeed = {
  id: string
  name: string
  /** The recommended form (R11 p.555 gives it as an example): "The [stakeholders] need the air-taxi service to …". */
  statement: string
  /** The stakeholder named as the statement's subject (always a registered stakeholder or class). */
  subject: string
  sources: NeedSource[]
  condition: string
  rationale: string
  priority: Priority
  /** The mission or goal (MGO) the need serves (SEBoK: the integrated set reflects the MGOs, R11 p.554). */
  mgo: string
  /** reference = statement as in reference/week03.ts (none remain: every statement now names the system of interest);
   *  corrected = a reference need whose statement or trace changed; proposed = a need added here. */
  provenance: CaseProvenance
  /** The priority is always proposed: the reference data store none. */
  priorityProvenance: 'proposed'
}

const subj = (stakeholder: string, concern: string | null): NeedSource => ({ stakeholder, concern, role: 'subject' })
const contrib = (stakeholder: string, concern: string): NeedSource => ({ stakeholder, concern, role: 'contributing' })

export const NEEDS: CaseNeed[] = [
  { id: 'NEED-001', name: 'Short, predictable wait to board', statement: 'Passengers need the air-taxi service to let them board within a short and predictable time after they confirm a ride.', subject: 'STK-001', sources: [subj('STK-001', 'CON-001')], condition: 'Throughout the 16 h operating day, including peak hours.', rationale: 'The wait and its predictability decide whether passengers use the service again.', priority: 'critical', mgo: 'MGO-002', provenance: 'corrected', priorityProvenance: 'proposed' },
  { id: 'NEED-002', name: 'Assurance of flight within safety limits', statement: 'The FAA needs the air-taxi service to demonstrate that every flight is conducted within the approved airworthiness, energy-reserve and weather limits.', subject: 'STK-002', sources: [subj('STK-002', 'CON-004'), contrib('STK-001', 'CON-002')], condition: 'For every flight, including when weather changes during the day.', rationale: 'The regulator must be assured that the operation, not only the aircraft, stays inside the approved envelope; the same assurance answers the passengers’ safety concern.', priority: 'mandatory', mgo: 'MGO-009', provenance: 'corrected', priorityProvenance: 'proposed' },
  { id: 'NEED-003', name: 'Noise exposure within the local agreement', statement: 'Communities near vertiports need the air-taxi service to keep take-off and landing noise exposure at nearby homes within the agreed limits on the loudness of each event and on the number of events in the evening and early morning.', subject: 'STK-004', sources: [subj('STK-004', 'CON-012')], condition: 'At every vertiport, every operating day; the evening and early-morning hours are the noise-sensitive period.', rationale: 'Residents judge noise by how loud each event is and by how often it happens when they rest; exceeding either agreed limit puts the site permit at risk and erodes acceptance.', priority: 'mandatory', mgo: 'MGO-003', provenance: 'corrected', priorityProvenance: 'proposed' },
  { id: 'NEED-004', name: 'Pads not limited by turnaround', statement: 'Vertiport operators need the air-taxi service to turn arriving aircraft around quickly enough that pad occupancy does not become the limit on departures.', subject: 'STK-005', sources: [subj('STK-005', 'CON-006')], condition: 'At every vertiport during peak hours.', rationale: 'How long an arriving aircraft occupies a pad sets how many departures the pad can support.', priority: 'critical', mgo: 'MGO-002', provenance: 'corrected', priorityProvenance: 'proposed' },
  { id: 'NEED-005', name: 'Capacity that grows with demand', statement: 'Investors need the air-taxi service to grow its capacity in step with demand.', subject: 'STK-003', sources: [subj('STK-003', 'CON-005')], condition: 'Throughout the first three years of service, while demand grows.', rationale: 'Capital that is short when demand arrives, or idle when it does not, erodes the return investors expect.', priority: 'desirable', mgo: 'MGO-004', provenance: 'corrected', priorityProvenance: 'proposed' },
  { id: 'NEED-006', name: 'Early warning and access for a vertiport fire', statement: 'Emergency responders need the air-taxi service to give them early warning of, and safe access to, a battery fire at a vertiport.', subject: 'STK-006', sources: [subj('STK-006', 'CON-007')], condition: 'At any hour of operation, at every vertiport.', rationale: 'Lithium battery fires escalate within minutes and need specialist equipment and a safe approach; warning without access leaves the response half defined.', priority: 'mandatory', mgo: 'MGO-001', provenance: 'corrected', priorityProvenance: 'proposed' },
  { id: 'NEED-007', name: 'Known aircraft condition before release', statement: 'Maintenance technicians need the air-taxi service to make the condition of each aircraft known before the aircraft is released for flight.', subject: 'STK-009', sources: [subj('STK-009', 'CON-010')], condition: 'At every release, regardless of schedule pressure.', rationale: 'Releasing an aircraft whose condition is unknown is the failure technicians most want to prevent.', priority: 'mandatory', mgo: 'MGO-009', provenance: 'corrected', priorityProvenance: 'proposed' },
  { id: 'NEED-008', name: 'Unassisted step-free travel', statement: 'Passengers with reduced mobility need the air-taxi service to let them board, travel and alight without being lifted or separated from their mobility aid.', subject: 'STK-015', sources: [subj('STK-015', 'CON-017'), contrib('STK-014', 'CON-013')], condition: 'At every vertiport, throughout operating hours.', rationale: 'Being lifted is unsafe and undignified and excludes passengers who travel with their own mobility aid; the accessibility advocates raised the same concern on their behalf.', priority: 'critical', mgo: 'MGO-001', provenance: 'corrected', priorityProvenance: 'proposed' },
  { id: 'NEED-009', name: 'Flight intent known to the ANSP', statement: 'The air navigation service provider needs the air-taxi service to make each flight’s intended route and time known before the aircraft enters controlled airspace.', subject: 'STK-007', sources: [subj('STK-007', 'CON-008')], condition: 'Whenever a flight will enter controlled airspace.', rationale: 'The ANSP can separate air-taxi flights from other traffic only if it knows them in advance.', priority: 'mandatory', mgo: 'MGO-001', provenance: 'corrected', priorityProvenance: 'proposed' },
  { id: 'NEED-010', name: 'Charging load within the grid connection', statement: 'The electric utility needs the air-taxi service to keep the power drawn at each vertiport within the agreed connection capacity.', subject: 'STK-010', sources: [subj('STK-010', 'CON-011')], condition: 'At all times, including when several arriving aircraft charge together.', rationale: 'Exceeding the agreed connection trips protection or incurs penalty tariffs.', priority: 'mandatory', mgo: 'MGO-004', provenance: 'corrected', priorityProvenance: 'proposed' },
  { id: 'NEED-011', name: 'Prompt notice and a way onward when a trip is disrupted', statement: 'Passengers need the air-taxi service to tell them promptly when a confirmed trip is held, diverted or cancelled, and to offer them a usable way to complete the journey.', subject: 'STK-001', sources: [subj('STK-001', 'CON-001')], condition: 'Whenever a confirmed trip is held, diverted or cancelled, including during weather holds and region-wide suspensions.', rationale: 'A passenger left waiting without news or a way onward loses more time and trust than one told early and offered an alternative (exposed by scenario SCN-005). Notice and a way onward are one end-to-end outcome: notice alone leaves the passenger stranded.', priority: 'desirable', mgo: 'MGO-002', provenance: 'corrected', priorityProvenance: 'proposed' },
  { id: 'NEED-012', name: 'Sites that conform to the land-use plan', statement: 'The city planning authority needs the air-taxi service to operate only from vertiport sites that conform to the zoning and land-use plan.', subject: 'STK-013', sources: [subj('STK-013', 'CON-016')], condition: 'For every site, from site approval through operation.', rationale: 'The authority grants or blocks sites; a site that breaches the land-use plan cannot be approved.', priority: 'mandatory', mgo: 'MGO-003', provenance: 'proposed', priorityProvenance: 'proposed' },
  { id: 'NEED-013', name: 'Manageable operator workload', statement: 'Pilots and remote operators need the air-taxi service to keep their workload manageable throughout every duty period.', subject: 'STK-008', sources: [subj('STK-008', 'CON-009')], condition: 'Throughout every duty period, including weather disruptions (SCN-005) and other off-nominal events.', rationale: 'Overload erodes safety margins and caps how many flights each operator can handle; workforce availability limits scaling.', priority: 'critical', mgo: 'MGO-009', provenance: 'proposed', priorityProvenance: 'proposed' },
  { id: 'NEED-014', name: 'Operational risk measurable from evidence', statement: 'Insurers need the air-taxi service to make its operational risk measurable from evidence recorded on every flight.', subject: 'STK-012', sources: [subj('STK-012', 'CON-014')], condition: 'On every flight, from the first day of service.', rationale: 'Premiums and coverage are set on evidence; without an incident and loss record insurers price the unknown and constrain operations.', priority: 'desirable', mgo: 'MGO-004', provenance: 'proposed', priorityProvenance: 'proposed' },
  { id: 'NEED-015', name: 'Full fare known before booking', statement: 'Passengers need the air-taxi service to show them the full fare before they confirm a trip.', subject: 'STK-001', sources: [subj('STK-001', 'CON-003')], condition: 'At every booking, including at peak hours.', rationale: 'Passengers compare the fare with the alternatives before they commit; a fare revealed late loses the booking and the passenger’s trust.', priority: 'desirable', mgo: 'MGO-001', provenance: 'proposed', priorityProvenance: 'proposed' },
  { id: 'NEED-016', name: 'Sites connected to public transport', statement: 'The city planning authority needs the air-taxi service to operate only from vertiport sites that connect with the public transport network.', subject: 'STK-013', sources: [subj('STK-013', 'CON-016')], condition: 'For every site, from site approval through operation, especially sites in residential districts.', rationale: 'A site that strands passengers away from public transport adds road traffic around it and weakens the case for approval.', priority: 'critical', mgo: 'MGO-003', provenance: 'proposed', priorityProvenance: 'proposed' },
  { id: 'NEED-017', name: 'Fares competitive with ground alternatives', statement: 'Passengers need the air-taxi service to offer fares that are competitive with ride-hail and public transport for the same journey.', subject: 'STK-001', sources: [subj('STK-001', 'CON-003')], condition: 'For typical trips between any two vertiports, including at peak hours.', rationale: 'Passengers choose by comparing the fare with ride-hail and public transport for the same trip; a fare far above both loses the trip.', priority: 'desirable', mgo: 'MGO-001', provenance: 'proposed', priorityProvenance: 'proposed' },
]

/** Reference needs whose subject or contributing source was corrected (not only reworded into the recommended form). */
export const TRACE_CORRECTED = ['NEED-002', 'NEED-008']

export const need = (id: string): CaseNeed => {
  const n = NEEDS.find((x) => x.id === id)
  if (!n) throw new Error(`unknown need ${id}`)
  return n
}

/** The recommended statement form every reference need follows (R11 p.555's example format): subject, "need(s) the
 *  air-taxi service to", outcome. A consistency check on the case data, not a rule for student needs (A21). */
export const NEED_FORM = /^(The )?[A-Z][^.]*? needs? the air-taxi service to [a-z]/

// ------------------------------------------------------------------------------------------------ conflict and adjudication
/** The noise-versus-throughput conflict (REL-002) and how it is adjudicated (R65 p.325; R11 pp.551, 553; R48a p.142).
 *  The protocol steps are the course's application of MITRE's advice; the outcome is not decided in Week 1. */
export const CONFLICT = {
  relationship: 'REL-002',
  between: ['STK-004', 'STK-005'],
  needsA: ['NEED-001', 'NEED-004'],
  needB: 'NEED-003',
  sharedVariable: 'take-offs and landings per pad in the evening and early-morning hours',
  why: 'The evening commute peak runs into the noise-sensitive evening hours, and the first departures of the day fall in the early morning. More take-offs and landings per pad in those hours serve NEED-001 and NEED-004; every one of them also counts against the cap on evening and early-morning events that NEED-003 carries. The loudness of each event is a separate bound, met by quieter procedures and flight paths, so it does not trade against throughput in the same way.',
  protocol: [
    { step: 'Record', text: 'Keep all three needs in the set; log the conflict as REL-002 with the needs it links and the shared variable.' },
    { step: 'Analyze', text: 'Week 3 trade study: how departures are spread across the sensitive hours, which pads carry them, approach and departure paths and quieter procedures, all inside both agreed limits.' },
    { step: 'Negotiate', text: 'Options go to the city planning authority (STK-013) and community consultation (REL-007), with the vertiport operators (STK-005).' },
    { step: 'Escalate', text: 'An unresolved conflict goes to the sponsor, AeroLink Urban Mobility’s leadership, who decides and records the reason.' },
  ],
  priorityReading: 'NEED-003 is mandatory (the agreement conditions the site permit) and NEED-001 and NEED-004 are critical, so the trade looks for the best service in the sensitive hours that stays inside both noise limits; priority frames the trade, it does not end it.',
}

/** A second tension the audit should find (not recorded as a REL in the reference data). */
export const SECOND_TENSION = { needs: ['NEED-005', 'NEED-010'], text: 'Capacity growth (more aircraft charging) against the fixed grid connection at each vertiport.' }

// ------------------------------------------------------------------------------------------------ the deliberate gap
/** Exactly one gap is kept for the coverage audit. */
export const DELIBERATE_GAP = {
  stakeholder: 'STK-011',
  concern: 'CON-015',
  finding: 'STK-011 (aircraft manufacturer) has no need traced to it.',
  why: 'CON-015 is about the purchase agreement between the enterprise and the manufacturer: order quantities, delivery slots and payment milestones. Those are obligations of the enterprise’s contracts, kept by its purchasing and finance functions, not something the air-taxi service does when it operates. The defensible handling is to record that decision and its reason in the register.',
  /** The argument a student may make, and the model answer (the debate is itself a teaching point). */
  debate: 'A student may argue that the manufacturer also wants fleet operating data. That would be a new concern, not CON-015; if the enterprise agrees to share operating data, the team adds the concern and a need on the service, and the gap closes for a recorded reason.',
  teaching: 'Coverage is a question, not a quota: every stakeholder without a need must either gain one or carry a recorded reason. A silent gap is the defect; a reasoned gap is a decision.',
}

// ------------------------------------------------------------------------------------------------ elicitation plan
/** Instructor reasoning (course convention): technique choices for five AeroLink stakeholders, built on the techniques
 *  named in R11 p.553 and R65 p.324. */
export const ELICITATION_PLAN: { stakeholder: string; techniques: string; why: string }[] = [
  { stakeholder: 'STK-004', techniques: 'Public workshop + questionnaire', why: 'Many people, a contested topic; the workshop surfaces positions, the questionnaire reaches those who do not attend' },
  { stakeholder: 'STK-002', techniques: 'Documentation review + structured meeting', why: 'Its expectations are largely written down; meetings resolve how they apply to this operation' },
  { stakeholder: 'STK-009', techniques: 'Direct observation of a turnaround', why: 'Tacit know-how and time pressure show in the work, not in an interview' },
  { stakeholder: 'STK-001', techniques: 'Survey + booking prototype', why: 'Large, dispersed group; a prototype exposes reactions to waits and fares that people cannot predict in the abstract' },
  { stakeholder: 'STK-010', techniques: 'Interview + connection-agreement review', why: 'One expert counterpart; the agreement fixes the capacity number' },
]

// ------------------------------------------------------------------------------------------------ audit helpers
export type CoverageCell = 'subject' | 'contributing' | null
/** stakeholder × need trace matrix: subject when the stakeholder is the need's subject, contributing when it is a
 *  listed contributing source. */
export function coverageMatrix(): { stakeholder: string; cells: CoverageCell[] }[] {
  return STAKEHOLDERS.map((s) => ({
    stakeholder: s.id,
    cells: NEEDS.map((n) => n.sources.find((src) => src.stakeholder === s.id)?.role ?? null),
  }))
}

/** Stakeholders with no need traced to them (as subject or contributing source). */
export const uncoveredStakeholders = (): string[] => coverageMatrix().filter((r) => r.cells.every((c) => c === null)).map((r) => r.stakeholder)

/** Concerns that no need answers. */
export const unansweredConcerns = (): string[] => CONCERNS.filter((c) => !NEEDS.some((n) => n.sources.some((s) => s.concern === c.id))).map((c) => c.id)

export const needsOf = (stk: string) => NEEDS.filter((n) => n.sources.some((s) => s.stakeholder === stk))

/** Count of needs per priority category. */
export const priorityCounts = (): Record<Priority, number> => ({
  mandatory: NEEDS.filter((n) => n.priority === 'mandatory').length,
  critical: NEEDS.filter((n) => n.priority === 'critical').length,
  desirable: NEEDS.filter((n) => n.priority === 'desirable').length,
  optional: NEEDS.filter((n) => n.priority === 'optional').length,
})

/** Number words for counts quoted in prose (so the lecture text follows the data). */
export const numberWord = (n: number): string => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'][n] ?? String(n)
