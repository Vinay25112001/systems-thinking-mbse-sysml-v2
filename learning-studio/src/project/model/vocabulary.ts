// Artifact type registry and relationship vocabulary (data model §5, §6.1). `from type to` reads as a sentence.
// Impact says whose change flags what (trace plan §5): '→from' = a change to `to` flags `from` (the dependent);
// '→to' = a change to `from` flags `to`; 'both'; 'none' (stakeholder relationships: shown as related, never flagged).
import { mappingOf } from '../../content/lectures/week08/labBrief'
import { REL_VERB } from '../../content/lectures/week01/labBrief'
import { ARTIFACT_TYPES, STAKEHOLDER_TYPES, STRUCTURE_TYPES, TRACE_TYPES, type ArtifactType, type RelationshipCategory, type RelationshipType } from './types'

export type LibraryGroup =
  | 'overview' | 'stakeholders' | 'needs' | 'capabilities' | 'conops' | 'requirements' | 'technology' | 'arou' | 'trades'
  | 'architecture' | 'information' | 'components' | 'interfaces' | 'roadmaps' | 'verification' | 'analysis' | 'baseline'

export type ArtifactTypeInfo = { prefix: ArtifactType; label: string; plural: string; phaseWeek: number; library: LibraryGroup; singleton?: boolean; sysml?: string }

const T = (prefix: ArtifactType, label: string, plural: string, phaseWeek: number, library: LibraryGroup, singleton?: boolean): ArtifactTypeInfo => ({ prefix, label, plural, phaseWeek, library, singleton, sysml: mappingOf(prefix)?.construct })

export const ARTIFACT_INFO: Record<ArtifactType, ArtifactTypeInfo> = {
  ENT: T('ENT', 'Enterprise', 'Enterprise', 1, 'overview', true),
  PRT: T('PRT', 'Element inside the boundary', 'Elements inside the boundary', 1, 'architecture'),
  EXT: T('EXT', 'External system or actor', 'Context: external systems and actors', 1, 'stakeholders'),
  STK: T('STK', 'Stakeholder', 'Stakeholders', 1, 'stakeholders'),
  CON: T('CON', 'Concern', 'Concerns', 1, 'stakeholders'),
  MGO: T('MGO', 'Mission or goal', 'Mission and goals', 1, 'needs'),
  NEED: T('NEED', 'Need', 'Needs', 1, 'needs'),
  CONOPS: T('CONOPS', 'Concept of operations', 'Concept of operations', 2, 'conops', true),
  SCN: T('SCN', 'Scenario', 'Scenarios', 2, 'conops'),
  CAP: T('CAP', 'Capability', 'Capabilities', 2, 'capabilities'),
  'REQ-STK': T('REQ-STK', 'Stakeholder requirement', 'Stakeholder requirements', 2, 'requirements'),
  'REQ-SYS': T('REQ-SYS', 'System requirement', 'System requirements', 2, 'requirements'),
  MOE: T('MOE', 'Measure of effectiveness', 'Measures of effectiveness', 2, 'requirements'),
  MOP: T('MOP', 'Measure of performance', 'Measures of performance', 2, 'requirements'),
  VER: T('VER', 'Verification plan or case', 'Verification plans', 2, 'verification'),
  A: T('A', 'Assumption', 'Assumptions', 2, 'arou'),
  U: T('U', 'Unknown (TBD/TBR)', 'Unknowns', 2, 'arou'),
  TECH: T('TECH', 'Technology', 'Technology assessments', 3, 'technology'),
  R: T('R', 'Risk', 'Risks', 3, 'arou'),
  O: T('O', 'Opportunity', 'Opportunities', 3, 'arou'),
  I: T('I', 'Issue', 'Issues', 3, 'arou'),
  TPM: T('TPM', 'Technical performance measure', 'Technical performance measures', 3, 'requirements'),
  TRD: T('TRD', 'Trade study', 'Trade studies', 3, 'trades'),
  ALT: T('ALT', 'Trade alternative', 'Trade alternatives', 3, 'trades'),
  CRIT: T('CRIT', 'Trade criterion', 'Trade criteria', 3, 'trades'),
  DEC: T('DEC', 'Decision record', 'Decision records', 3, 'trades'),
  VP: T('VP', 'Viewpoint', 'Viewpoints', 4, 'architecture'),
  FG: T('FG', 'Function group', 'Function groups', 4, 'architecture'),
  FN: T('FN', 'Function', 'Functions', 4, 'architecture'),
  LOG: T('LOG', 'Logical element', 'Logical elements', 4, 'architecture'),
  PHY: T('PHY', 'Physical element', 'Physical elements', 4, 'architecture'),
  INFO: T('INFO', 'Information item', 'Information items', 4, 'information'),
  AI: T('AI', 'AI-enabled capability', 'AI-enabled capabilities', 4, 'architecture'),
  CMP: T('CMP', 'Component', 'Components', 5, 'components'),
  IF: T('IF', 'Interface', 'Interfaces', 5, 'interfaces'),
  ICR: T('ICR', 'Interface change request', 'Interface change requests', 5, 'interfaces'),
  INC: T('INC', 'Roadmap increment', 'Roadmap increments', 6, 'roadmaps'),
  PKG: T('PKG', 'Phase I package', 'Phase I packages', 7, 'baseline'),
  EVD: T('EVD', 'Verification evidence', 'Verification evidence', 12, 'verification'),
  ANL: T('ANL', 'Analysis result', 'Analysis results', 13, 'analysis'),
  RID: T('RID', 'Review item', 'Review items', 7, 'baseline'),
}
/** The artifact library's P1 types (Week 1), in display order. */
export const WEEK1_TYPES: ArtifactType[] = ['ENT', 'MGO', 'PRT', 'EXT', 'STK', 'CON', 'NEED']
export const TYPE_ORDER = new Map<string, number>(ARTIFACT_TYPES.map((t, i) => [t, i]))

type Impact = '→from' | '→to' | 'both' | 'none'
type Rule = { category: RelationshipCategory; from: readonly ArtifactType[] | 'any'; to: readonly ArtifactType[] | 'any'; impact: Impact; verb: string }

const REQ: ArtifactType[] = ['REQ-STK', 'REQ-SYS']
const TRACE: Record<(typeof TRACE_TYPES)[number], Rule> = {
  'derives-from': { category: 'trace', from: ['CON', 'NEED', 'MGO', 'CAP', ...REQ, 'SCN', 'CRIT', 'FN', 'TPM', 'DEC', 'VP', 'ANL'], to: ['STK', 'CON', 'NEED', 'MGO', 'CAP', ...REQ, 'SCN', 'MOE', 'MOP', 'TRD', 'TPM'], impact: '→from', verb: 'derives from' },
  refines: { category: 'trace', from: [...REQ, 'SCN', 'NEED', 'CAP', 'FN'], to: [...REQ, 'SCN', 'NEED', 'CAP', 'FN'], impact: '→from', verb: 'refines' },
  satisfies: { category: 'trace', from: ['FN', 'LOG', 'PHY', 'IF', 'INFO', 'AI', 'CAP', 'SCN', 'CMP'], to: REQ, impact: 'both', verb: 'satisfies' },
  'allocated-to': { category: 'trace', from: [...REQ, 'FN', 'LOG', 'CAP', 'AI'], to: ['FN', 'LOG', 'PHY', 'AI', 'CMP'], impact: 'both', verb: 'is allocated to' },
  verifies: { category: 'trace', from: ['VER'], to: [...REQ, 'NEED', 'MOP', 'TPM'], impact: '→from', verb: 'verifies' },
  measures: { category: 'trace', from: ['MOE', 'MOP', 'TPM'], to: ['MGO', 'NEED', 'CAP', ...REQ, 'PHY', 'LOG', 'FN', 'MOE', 'MOP', 'CRIT', 'CMP'], impact: '→from', verb: 'measures' },
  mitigates: { category: 'trace', from: [...REQ, 'FN', 'PHY', 'LOG', 'DEC', 'VER', 'TECH', 'AI', 'CMP', 'IF'], to: ['R'], impact: 'both', verb: 'mitigates' },
  affects: { category: 'trace', from: ['A', 'R', 'O', 'U', 'TECH', 'DEC', 'EXT', 'I', 'ICR', 'ANL', 'RID'], to: 'any', impact: '→to', verb: 'affects' },
  performs: { category: 'trace', from: ['LOG', 'PHY', 'EXT', 'STK', 'AI', 'CMP'], to: ['FN', 'SCN', 'CAP'], impact: 'both', verb: 'performs' },
  'flows-to': { category: 'trace', from: ['PHY', 'LOG', 'EXT', 'INFO', 'FN', 'AI', 'CMP'], to: ['PHY', 'LOG', 'EXT', 'INFO', 'FN', 'AI', 'DEC', 'CMP'], impact: 'both', verb: 'flows to' },
  covers: { category: 'trace', from: ['SCN'], to: ['NEED', 'CAP'], impact: '→from', verb: 'covers' },
  frames: { category: 'trace', from: ['VP'], to: ['CON'], impact: '→from', verb: 'frames' },
  evidences: { category: 'trace', from: ['EVD'], to: ['VER'], impact: '→from', verb: 'is evidence for' },
  delivers: { category: 'trace', from: ['INC'], to: ['CAP', ...REQ, 'PHY', 'CMP', 'FN', 'TECH'], impact: '→from', verb: 'delivers' },
  precedes: { category: 'trace', from: ['INC'], to: ['INC'], impact: '→to', verb: 'precedes' },
}
const STRUCTURE: Record<(typeof STRUCTURE_TYPES)[number], Rule> = {
  contains: { category: 'structure', from: ['ENT', 'PHY', 'FG', 'TRD'], to: ['PRT', 'CMP', 'FN', 'ALT', 'CRIT'], impact: 'both', verb: 'contains' },
  connects: { category: 'structure', from: ['IF'], to: ['PHY', 'CMP', 'EXT', 'LOG', 'PRT'], impact: '→from', verb: 'connects' },
  carries: { category: 'structure', from: ['IF'], to: ['INFO'], impact: 'both', verb: 'carries' },
}
const STAKEHOLDER = Object.fromEntries(STAKEHOLDER_TYPES.map((t) => [t, { category: 'stakeholder', from: ['STK'], to: ['STK'], impact: 'none', verb: REL_VERB[t] } satisfies Rule])) as unknown as Record<(typeof STAKEHOLDER_TYPES)[number], Rule>

export const VOCABULARY: Record<RelationshipType, Rule> = { ...TRACE, ...STRUCTURE, ...STAKEHOLDER }
export const RELATIONSHIP_TYPES = Object.keys(VOCABULARY) as RelationshipType[]
export const isRelationshipType = (x: unknown): x is RelationshipType => typeof x === 'string' && x in VOCABULARY

const inSet = (set: readonly ArtifactType[] | 'any', t: ArtifactType) => set === 'any' || set.includes(t)
export function allowedPair(from: ArtifactType, type: RelationshipType, to: ArtifactType): boolean {
  const r = VOCABULARY[type]
  return !!r && inSet(r.from, from) && inSet(r.to, to)
}
/** "CON satisfies REQ-SYS is not an allowed relationship" (integrity I5). */
export const pairMessage = (from: string, type: string, to: string) => `${from} ${type} ${to} is not an allowed relationship.`
/** Reads a relationship as a sentence: "NEED-004 derives from STK-002". */
export const sentence = (fromId: string, type: RelationshipType | '', toId: string) => `${fromId} ${type ? VOCABULARY[type].verb : '(type not chosen)'} ${toId}`
/** The ID series a relationship of a category takes: REL for Week 1 stakeholder relationships, LNK for every other. */
export const relPrefix = (c: RelationshipCategory) => (c === 'stakeholder' ? 'REL' : 'LNK')
