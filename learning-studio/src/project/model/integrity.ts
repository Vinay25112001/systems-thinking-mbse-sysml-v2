// Integrity rules (data model §7). checkOp refuses an invalid operation before anything changes (I1–I7, I9, I13);
// validateProject reports problems of a whole document on load and on import (never throws, never repairs).
import { ID_RE, numOf, prefixOf } from './ids'
import { allowedPair, isRelationshipType, isSymmetric, pairMessage, relPrefix, ruleOf, VOCABULARY } from './vocabulary'
import { isArtifactType, type Artifact, type Operation, type ProjectDoc, type Relationship } from './types'

/** Paths an update-artifact may change; identity (uid, id, type), status and review have their own operations. */
const ARTIFACT_PATHS = /^(title|description|rationale|source|owner|aiAssisted|unresolvedRefs|formerIds|milestones|provenance(\..+)?|attributes\..+)$/
const RELATIONSHIP_PATHS = /^(type|from|to|role|rationale|note|status|draft|attributes\..+)$/

export type Issue = { code: string; severity: 'error' | 'warning'; message: string; ids: string[] }

const active = (a: Artifact | undefined) => !!a && a.status === 'active'
const label = (doc: ProjectDoc, uid: string) => doc.artifacts[uid]?.id ?? '(missing)'

function relProblem(doc: ProjectDoc, r: Relationship, issuedAtStart: Record<string, number> | null, isNew: boolean): string | null {
  if (!ID_RE(relPrefix(r.category)).test(r.id)) return `${r.id || '(empty)'} is not a ${relPrefix(r.category)} ID (I2).`
  if (isNew) {
    if (Object.values(doc.relationships).some((x) => x.id === r.id)) return `${r.id} is already used by another relationship (I1).`
    if (issuedAtStart && numOf(r.id) <= (issuedAtStart[relPrefix(r.category)] ?? 0)) return `${r.id} was issued before in this project; IDs are never reused (I3).`
  }
  if (r.draft) {
    if (r.category !== 'stakeholder') return 'Only a stakeholder relationship row may be saved before both ends are known.'
    for (const end of [r.from, r.to]) if (end && !doc.artifacts[end]) return `${r.id}: an end that is not in the project (I4).`
    return null
  }
  if (!isRelationshipType(r.type)) return `${r.id}: “${r.type || '(none)'}” is not a relationship type of the course vocabulary.`
  if (!ruleOf(r.type, r.category)) return `${r.id}: ${r.type} belongs to the ${VOCABULARY[r.type].category} category, not ${r.category}.`
  const a = doc.artifacts[r.from]
  const b = doc.artifacts[r.to]
  if (!a || !b) return `${r.id}: both ends must be artifacts of this project (I4).`
  if (r.from === r.to) return `${r.id}: an artifact cannot be related to itself (I6).`
  if (!allowedPair(a.type, r.type, b.type, r.category)) return pairMessage(a.type, r.type, b.type) + ' (I5)'
  if (r.status !== 'retired') {
    const sym = isSymmetric(r.type, r.category)
    const dup = Object.values(doc.relationships).find((x) => x.uid !== r.uid && !x.draft && x.status !== 'retired' && x.type === r.type && x.category === r.category && (x.role ?? '') === (r.role ?? '') && ((x.from === r.from && x.to === r.to) || (sym && x.from === r.to && x.to === r.from)))
    if (dup) return `${a.id} ${r.type} ${b.id} already exists as ${dup.id} (I7).`
  }
  return null
}

/** The reason an operation is refused, or null when it may be applied. `issuedAtStart` = the counters before the
 *  change set began (I3 compares new numbers with them, so one change set may create IDs in any order). */
export function checkOp(doc: ProjectDoc, op: Operation, issuedAtStart: Record<string, number>): string | null {
  switch (op.op) {
    case 'create-artifact': {
      const a = op.artifact
      if (!isArtifactType(a.type)) return `“${a.type}” is not an artifact type.`
      if (!a.uid) return 'An artifact needs a uid.'
      if (doc.artifacts[a.uid]) return `An artifact with this uid already exists (${doc.artifacts[a.uid].id}).`
      if (!ID_RE(a.type).test(a.id) || prefixOf(a.id) !== a.type) return `${a.id || '(empty)'} is not a well-formed ${a.type} ID (I2).`
      if (Object.values(doc.artifacts).some((x) => x.id === a.id)) return `${a.id} is already used in this project (I1).`
      if (a.type !== 'ENT' && numOf(a.id) <= (issuedAtStart[a.type] ?? 0)) return `${a.id} was issued before in this project; IDs are never reused (I3).`
      if (a.type === 'ENT' && a.id !== 'ENT-001') return 'The enterprise is ENT-001; a project has exactly one (I9).'
      if (a.type === 'CONOPS' && Object.values(doc.artifacts).some((x) => x.type === 'CONOPS' && x.status === 'active')) return 'A project has at most one concept of operations (I9).'
      return null
    }
    case 'update-artifact': {
      if (!doc.artifacts[op.uid]) return 'That artifact is not in the project.'
      const bad = op.fields.find((f) => !ARTIFACT_PATHS.test(f.path))
      return bad ? `${bad.path} cannot be changed by an edit.` : null
    }
    case 'retire-artifact': {
      const a = doc.artifacts[op.uid]
      if (!a) return 'That artifact is not in the project.'
      if (a.status === 'retired') return `${a.id} is already retired.`
      if (a.type === 'ENT') return 'The enterprise (ENT-001) cannot be retired.'
      if (!op.reason.trim()) return 'Give the reason for retiring the artifact.'
      return null
    }
    case 'restore-artifact':
      return doc.artifacts[op.uid]?.status === 'retired' ? null : 'Only a retired artifact can be restored.'
    case 'renumber-artifact': {
      const a = doc.artifacts[op.uid]
      if (!a || a.id !== op.from) return 'That artifact is not in the project under that ID.'
      if (!ID_RE(a.type).test(op.to)) return `${op.to} is not a well-formed ${a.type} ID (I2).`
      if (Object.values(doc.artifacts).some((x) => x.id === op.to)) return `${op.to} is already used (I1).`
      return numOf(op.to) <= (issuedAtStart[a.type] ?? 0) ? `${op.to} was issued before; IDs are never reused (I3).` : null
    }
    case 'create-relationship': {
      if (!op.relationship.uid || doc.relationships[op.relationship.uid]) return 'A relationship needs a new uid.'
      return relProblem(doc, op.relationship, issuedAtStart, true)
    }
    case 'update-relationship': {
      const r = doc.relationships[op.uid]
      if (!r) return 'That relationship is not in the project.'
      const bad = op.fields.find((f) => !RELATIONSHIP_PATHS.test(f.path))
      if (bad) return `${bad.path} cannot be changed by an edit.`
      const next = { ...r } as Record<string, unknown>
      for (const f of op.fields) if (!f.path.startsWith('attributes.')) next[f.path] = f.after
      if (next.status === 'retired') return 'Retire a relationship with its own operation, with a reason.'
      return relProblem(doc, next as Relationship, null, false)
    }
    case 'retire-relationship': {
      const r = doc.relationships[op.uid]
      if (!r) return 'That relationship is not in the project.'
      if (r.status === 'retired') return `${r.id} is already retired.`
      return op.reason.trim() ? null : 'Give the reason for retiring the relationship.'
    }
    case 'set-review':
      return (op.kind === 'artifact' ? doc.artifacts[op.uid] : doc.relationships[op.uid]) ? null : 'Nothing to review under that uid.'
    case 'update-milestone':
      return doc.milestones.some((m) => m.week === op.week) ? null : `Week ${op.week} has no milestone.`
    default:
      return null
  }
}

/** Every integrity problem of a document (I1, I2, I4–I7, I9–I12). Used on load and on import; reports, never repairs. */
export function validateProject(doc: ProjectDoc): Issue[] {
  const out: Issue[] = []
  const arts = Object.values(doc.artifacts)
  const seen = new Map<string, number>()
  for (const a of arts) seen.set(a.id, (seen.get(a.id) ?? 0) + 1)
  for (const [id, n] of seen) if (n > 1) out.push({ code: 'I1', severity: 'error', message: `${id} is used by ${n} artifacts.`, ids: [id] })
  for (const a of arts) {
    if (!isArtifactType(a.type)) out.push({ code: 'I2', severity: 'error', message: `${a.id}: unknown artifact type “${a.type}”.`, ids: [a.id] })
    else if (!ID_RE(a.type).test(a.id) || prefixOf(a.id) !== a.type) out.push({ code: 'I2', severity: 'error', message: `${a.id || '(empty)'} is not a well-formed ${a.type} ID.`, ids: [a.id] })
  }
  const relIds = new Map<string, number>()
  for (const r of Object.values(doc.relationships)) relIds.set(r.id, (relIds.get(r.id) ?? 0) + 1)
  for (const [id, n] of relIds) if (n > 1) out.push({ code: 'I1', severity: 'error', message: `${id} is used by ${n} relationships.`, ids: [id] })
  for (const r of Object.values(doc.relationships)) {
    const p = relProblem(doc, r, null, false)
    if (p) out.push({ code: /\(I(\d+)\)/.exec(p)?.[0].slice(1, -1) ?? 'REL', severity: 'error', message: p, ids: [r.id] })
    else if (!r.draft && r.status === 'active' && (!active(doc.artifacts[r.from]) || !active(doc.artifacts[r.to])))
      out.push({ code: 'I8', severity: 'warning', message: `${r.id} (${label(doc, r.from)} ${r.type} ${label(doc, r.to)}) touches a retired artifact and should be suspect.`, ids: [r.id] })
  }
  const ents = arts.filter((a) => a.type === 'ENT')
  if (ents.length > 1) out.push({ code: 'I9', severity: 'error', message: 'More than one enterprise (ENT).', ids: ents.map((a) => a.id) })
  if (ents.length && !arts.some((a) => a.id === 'MGO-001' && a.attributes.level === 'mission')) out.push({ code: 'I10', severity: 'warning', message: 'The mission (MGO-001) is missing.', ids: ['MGO-001'] })
  for (const a of arts.filter((x) => x.type === 'IF' && x.status === 'active')) {
    const ends = Object.values(doc.relationships).filter((r) => r.from === a.uid && r.type === 'connects' && r.status !== 'retired')
    if (ends.filter((r) => r.role === 'endA').length !== 1 || ends.filter((r) => r.role === 'endB').length !== 1) out.push({ code: 'I11', severity: 'warning', message: `${a.id} needs one endA and one endB.`, ids: [a.id] })
  }
  for (const a of arts) if (a.unresolvedRefs.length) out.push({ code: 'I12', severity: 'warning', message: `${a.id} names ${a.unresolvedRefs.join(', ')}, not in the project.`, ids: [a.id] })
  return out
}
