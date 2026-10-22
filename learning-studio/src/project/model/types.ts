// Canonical project document (CANONICAL_ENGINEERING_DATA_MODEL.md §3–§9, schema version 1). One document per team
// enterprise; every lab tool, the artifact library, the Week 8 preview and every export read and write it through pure
// functions. Nothing here touches storage or the screen.
//
// Additive to the data-model document (recorded in docs/project/P1_IMPLEMENTATION_REPORT.md):
//   - Milestone.contentUpdatedAt: when the week's content last changed (the Week 1 export step compares its export
//     stamps with it, exactly as team.ts checkExported compares exportedMdAt/exportedJsonAt with updatedAt);
//   - Team.prefixesText: the charter's prefix lines as typed (prefixOwnership is parsed from it), so a half-typed line
//     survives a reload;
//   - Relationship.draft: a Week 1 REL row whose ends or type are not complete yet (it holds the typed text in
//     attributes and stays out of the trace graph and the integrity rule I4 until both ends resolve).
import { REL_TYPES } from '../../content/lectures/week01/labBrief'

export const SCHEMA_VERSION = 1
export const APP_NAME = 'sysml-learning-studio'

/** Every artifact type (= its course ID prefix), Weeks 1–14 (data model §2.1). */
export const ARTIFACT_TYPES = [
  'ENT', 'PRT', 'EXT', 'STK', 'CON', 'MGO', 'NEED',
  'CONOPS', 'SCN', 'CAP', 'REQ-STK', 'REQ-SYS', 'MOE', 'MOP', 'VER', 'A', 'U',
  'TECH', 'R', 'O', 'I', 'TPM', 'TRD', 'ALT', 'CRIT', 'DEC',
  'VP', 'FG', 'FN', 'LOG', 'PHY', 'INFO', 'AI',
  'CMP', 'IF', 'ICR', 'INC', 'PKG', 'EVD', 'ANL', 'RID',
] as const
export type ArtifactType = (typeof ARTIFACT_TYPES)[number]
export const isArtifactType = (x: unknown): x is ArtifactType => typeof x === 'string' && (ARTIFACT_TYPES as readonly string[]).includes(x)

export const TRACE_TYPES = ['derives-from', 'refines', 'satisfies', 'allocated-to', 'verifies', 'measures', 'mitigates', 'affects', 'performs', 'flows-to', 'covers', 'frames', 'evidences', 'delivers', 'precedes'] as const
export const STRUCTURE_TYPES = ['contains', 'connects', 'carries'] as const
/** Week 1 Part 4 relationship types, read from the lecture's lab brief (single source). */
export const STAKEHOLDER_TYPES = REL_TYPES
export type TraceType = (typeof TRACE_TYPES)[number]
export type StructureType = (typeof STRUCTURE_TYPES)[number]
export type StakeholderRelType = (typeof STAKEHOLDER_TYPES)[number]
export type RelationshipType = TraceType | StructureType | StakeholderRelType
export type RelationshipCategory = 'trace' | 'structure' | 'stakeholder'

export type AttrValue = string | number | boolean | null | AttrValue[] | { [k: string]: AttrValue }
/** by = self-declared initials ('' = not recorded); change = the CHG id that made it. */
export type Stamp = { at: string; by: string; change: string }

export type Provenance =
  | { kind: 'own' }
  | { kind: 'copied-from-practice'; copiedFrom: { case: 'AeroLink'; id: string }; at: string; adapted: boolean }
  | { kind: 'imported'; from: { format: string; version: number | string; file?: string; sha256?: string }; at: string }
  | { kind: 'ai-suggested-reviewed' }

export type ValidationSnapshot = {
  state: 'unchecked' | 'failing' | 'passing'
  gates: { id: string; ok: boolean; message: string }[]
  advisories: { id: string; message: string }[]
  checkedAt: string
  checker: string
}
export type ReviewCause = { change: string; changedId: string; path: string[]; summary: string }
export type ReviewState =
  | { state: 'none' }
  | { state: 'needs-review'; since: string; causes: ReviewCause[] }
  | { state: 'reviewed'; at: string; by: string; rationale: string; clearedCauses: ReviewCause[] }

export type Artifact = {
  uid: string
  id: string
  type: ArtifactType
  title: string
  description: string
  attributes: Record<string, AttrValue>
  status: 'active' | 'retired'
  retired?: { at: string; reason: string; by: string }
  provenance: Provenance
  rationale?: string
  source?: string
  validation: ValidationSnapshot
  review: ReviewState
  milestones: number[]
  owner?: string
  aiAssisted: boolean
  unresolvedRefs: string[]
  formerIds: string[]
  created: Stamp
  revised: Stamp
  revision: number
}

export type Relationship = {
  uid: string
  id: string
  category: RelationshipCategory
  /** '' only on a draft stakeholder relationship (type not chosen yet). */
  type: RelationshipType | ''
  /** Artifact uid; '' only on a draft. */
  from: string
  to: string
  role?: 'endA' | 'endB'
  rationale?: string
  note?: string
  attributes?: Record<string, AttrValue>
  status: 'active' | 'suspect' | 'retired'
  /** A Week 1 REL row still being written: an end or the type is missing (see the header). */
  draft?: boolean
  retired?: { at: string; reason: string; by: string }
  provenance: Provenance
  created: Stamp
  revised: Stamp
}

export type CourseRole = string
export type Member = { initials: string; displayName?: string; active: boolean }
export type Team = {
  label: string
  threePersonTeam: boolean
  members: Member[]
  roles: Record<CourseRole, string>
  decisionRules: string
  norms: string
  prefixOwnership: Record<string, string>
  /** The charter's prefix lines as typed ("JS: STK, CON"). */
  prefixesText: string
  charterUpdatedAt?: string
}

export type Project = {
  uid: string
  title: string
  createdAt: string
  updatedAt: string
  createdWith: { app: typeof APP_NAME; version: string }
  course: { term?: string; section?: string; teamLabel?: string }
  model: { purpose: string; rootPackage?: string; options: { assessment: boolean; relationships: 'all' | 'conflicts' } }
}

export type ExpectedArtifact = { type: ArtifactType | 'REL'; min: number; minThreePerson?: number; rule?: string }
export type SubmissionExport = {
  at: string
  by: string
  files: { name: string; format: string; version: number | string; sha256?: string }[]
  rev: number
  snapshot: string
  contentState: 'not-ready' | 'pending-approval' | 'ready'
}
export type MilestoneState = 'not-started' | 'in-progress' | 'checks-passing' | 'exported' | 'marked-submitted'
export type Milestone = {
  week: number
  title: string
  expected: ExpectedArtifact[]
  state: MilestoneState
  approval?: { decision: 'pending' | 'approved' | 'revise'; decidedOn: string }
  aiStatement: string
  notes: Record<string, string>
  exports: SubmissionExport[]
  markedSubmittedAt?: string
  contentUpdatedAt?: string
  /** M6 (spec §g.1, additive): the team's own review state. Absent = DRAFT; 'ready-for-review' = a teammate should look
   *  before the package is submitted (who marked it, when). SUBMITTED / APPROVED / RETURNED live on the course server. */
  teamReview?: { state: 'ready-for-review'; by: string; at: string }
}

export type ModelElement = {
  uid: string
  id: string
  package: string
  construct: string
  name: string
  shortName?: string
  qualifiedName?: string
  textRef?: { file: string; line?: number }
  conformance: 'teaching-diagram' | 'generated-text-unchecked' | 'checker-accepted'
  checkedAt?: string
}
export type MappingStatus = 'not-mapped' | 'mapping-proposed' | 'mapped' | 'needs-review' | 'invalid-or-incomplete'
export const MAPPING_STATUSES: MappingStatus[] = ['not-mapped', 'mapping-proposed', 'mapped', 'needs-review', 'invalid-or-incomplete']
export const MAPPING_STATUS_LABEL: Record<MappingStatus, string> = {
  'not-mapped': 'Not mapped',
  'mapping-proposed': 'Mapping proposed',
  mapped: 'Mapped',
  'needs-review': 'Needs review',
  'invalid-or-incomplete': 'Invalid or incomplete',
}
export type ModelMapping = {
  uid: string
  id: string
  artifact: string
  elements: string[]
  rule: string
  status: MappingStatus
  statusReason: string
  findings: string[]
  confirmedBy?: Stamp
  sourceRevision: number
  week: number
  /** M7 (additive): the package the team chose for this ID in the Week 8 lab tool (`rule` is the prefix when it is the
   *  course working mapping's package, 'custom' otherwise). */
  pkg?: string
  /** M7 (additive): what the Week 1 item was when the team confirmed the mapping (its course ID, its name, and the
   *  project revision read), so a later rename, change or removal is shown, never silently dropped. */
  source?: { id: string; title: string; projectRev: number }
}
export type Finding = {
  key: string
  cls: 'defect' | 'gap' | 'unmapped' | 'info'
  code: string
  artifactId: string
  text: string
  disposition?: string
  dispositionBy?: Stamp
}

export type ProjectDoc = {
  schemaVersion: 1
  project: Project
  team: Team
  artifacts: Record<string, Artifact>
  relationships: Record<string, Relationship>
  milestones: Milestone[]
  modelElements: Record<string, ModelElement>
  mappings: Record<string, ModelMapping>
  findings: Finding[]
  issued: Record<string, number>
  rev: number
}

export type FieldChange = { path: string; before: AttrValue | undefined; after: AttrValue | undefined }
export type Operation =
  | { op: 'create-artifact'; artifact: Artifact }
  | { op: 'update-artifact'; uid: string; fields: FieldChange[] }
  | { op: 'retire-artifact'; uid: string; reason: string }
  | { op: 'restore-artifact'; uid: string }
  | { op: 'renumber-artifact'; uid: string; from: string; to: string }
  | { op: 'create-relationship'; relationship: Relationship }
  | { op: 'update-relationship'; uid: string; fields: FieldChange[] }
  | { op: 'retire-relationship'; uid: string; reason: string }
  | { op: 'set-review'; uid: string; kind: 'artifact' | 'relationship'; before: ReviewState; after: ReviewState }
  | { op: 'update-team'; fields: FieldChange[] }
  | { op: 'update-project'; fields: FieldChange[] }
  | { op: 'update-milestone'; week: number; fields: FieldChange[] }
  | { op: 'upsert-mapping'; mapping: ModelMapping; before?: ModelMapping }
  | { op: 'upsert-model-element'; element: ModelElement; before?: ModelElement }

export type ChangeSource = 'editor' | 'import' | 'practice-copy' | 'migration' | 'restore' | 'review' | 'system'
export type ChangeSet = {
  id: string
  at: string
  by: string
  source: ChangeSource
  summary: string
  rationale?: string
  ops: Operation[]
  rev: number
  /** Server mode (M2, additive): the authenticated account that made the change; absent offline, where `by` is
   *  self-declared initials. */
  actor?: { userId: string; name: string }
}

/** 'proposal' (frozen when approval is requested) and 'submission' are written by the course server only (M2, additive). */
export type SnapshotKind = 'manual' | 'milestone' | 'pre-import' | 'pre-restore' | 'pre-migration' | 'auto' | 'proposal' | 'submission'
export type Snapshot = { id: string; at: string; kind: SnapshotKind; label: string; rev: number; doc: ProjectDoc }
export type SnapshotMeta = Omit<Snapshot, 'doc'>

export const UNCHECKED: ValidationSnapshot = { state: 'unchecked', gates: [], advisories: [], checkedAt: '', checker: '' }
export const NO_REVIEW: ReviewState = { state: 'none' }
export const OWN: Provenance = { kind: 'own' }
