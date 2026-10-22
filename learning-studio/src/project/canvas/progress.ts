// Progress of the Week 1 canvas (directive §12.3; spec §f.6, MP-50). Progress counts artifacts that meet stated
// criteria, never filled boxes: every part shows its criteria as a readable checklist, and the per-artifact state comes
// from the course's structural checks (team.ts, needQuality.ts), the review flags (impact.ts), the practice-copy
// provenance and the instructor's decision. These checks show that the work is complete enough to review, not that it
// is right; the instructor decides that.
import {
  checkAiStatement, checkCharterPart, checkContextPart, checkNeedsPart, checkProposalContent, checkRegister, checkRelationships, concernIssue, contextRowIssues, MIN_CONFLICTS, MIN_CONTEXT, MIN_INSIDE, MIN_RELATIONSHIPS, MIN_ROLE_GROUPS, MIN_STAKEHOLDERS, MIN_WHY_WORDS, needsMinimum, needStatus, relRowIssues, stakeholderRowIssues, words, type TeamRecord,
} from '../../workbench/week1/team'
import { toTeamRecord } from '../adapters/week1'
import type { Artifact, ProjectDoc } from '../model/types'
import { CHANGED_SINCE_APPROVAL } from '../model/approvalBinding'
import { docApproval } from '../model/serverRules'
import { concernConflicts, hasRationale } from '../model/week1Relations'

export type PartId = 'overview' | 'team' | 'enterprise' | 'boundary' | 'stakeholders' | 'concerns' | 'relationships' | 'needs' | 'assumptions' | 'week8'
export type ItemState = 'missing' | 'draft' | 'template' | 'meets' | 'needs-review' | 'instructor-reviewed'
export const ITEM_STATE_LABEL: Record<ItemState, string> = {
  missing: 'Missing',
  draft: 'Draft',
  template: 'Template: adapt',
  meets: 'Meets course checks',
  'needs-review': 'Needs review',
  'instructor-reviewed': 'Instructor reviewed',
}
export type PartState = 'not-started' | 'in-progress' | 'meets' | 'optional'
export const PART_STATE_LABEL: Record<PartState, string> = { 'not-started': 'Not started', 'in-progress': 'In progress', meets: 'Meets course checks', optional: 'Optional' }

export type ItemProgress = { uid: string; id: string; label: string; state: ItemState; reasons: string[] }
export type PartProgress = {
  id: PartId
  label: string
  state: PartState
  /** "6 of 8 complete" style summary; null for parts without countable items. */
  count: { complete: number; required: number; present: number } | null
  /** The criteria in words (shown as a checklist). */
  criteria: { text: string; ok: boolean }[]
  /** What still keeps the part from meeting the checks, student wording. */
  issues: string[]
  items: ItemProgress[]
}

export type ApprovalStatus = { state: 'none' | 'pending' | 'approved' | 'changed' | 'revise' | 'self-reported'; decidedOn: string; serverMode: boolean }
/** The approval as the document holds it. In server mode the server mirrors the instructor's decision into the document
 *  (members cannot write it); offline, a decision is a value typed into an earlier version of the tool and is shown as
 *  self-reported, never as an instructor approval. */
export function approvalStatus(doc: ProjectDoc, serverMode: boolean): ApprovalStatus {
  const { decision, decidedOn } = docApproval(doc)
  if (!serverMode) return { state: decision ? 'self-reported' : 'none', decidedOn, serverMode }
  const state = decision === 'approved' ? 'approved' : decision === CHANGED_SINCE_APPROVAL ? 'changed' : decision === 'pending' ? 'pending' : decision === 'revise' ? 'revise' : 'none'
  return { state, decidedOn, serverMode }
}

const itemState = (a: Artifact | undefined, reasons: string[], approvedByInstructor = false): ItemState => {
  if (a?.provenance.kind === 'copied-from-practice' && !a.provenance.adapted) return 'template'
  if (a?.review.state === 'needs-review') return 'needs-review'
  if (reasons.length) return 'draft'
  return approvedByInstructor ? 'instructor-reviewed' : 'meets'
}
const partState = (issues: string[], started: boolean): PartState => (!started ? 'not-started' : issues.length ? 'in-progress' : 'meets')
const byId = (doc: ProjectDoc) => new Map(Object.values(doc.artifacts).filter((a) => a.status === 'active').map((a) => [a.id, a]))

export type CanvasProgress = {
  parts: PartProgress[]
  /** Required parts that meet the course checks / required parts (the transparent headline). */
  headline: { meets: number; required: number }
  unresolved: string[]
  pendingReviews: string[]
  approval: ApprovalStatus
  record: TeamRecord
}

export function canvasProgress(doc: ProjectDoc, opts: { serverMode: boolean }): CanvasProgress {
  const r = toTeamRecord(doc)
  const ids = byId(doc)
  const approval = approvalStatus(doc, opts.serverMode)
  const approved = approval.state === 'approved'
  const parts: PartProgress[] = []

  // Team & charter
  const c1 = checkCharterPart(r.charter)
  const ai = checkAiStatement(r)
  parts.push({
    id: 'team', label: 'Team & charter', state: partState([...c1.issues, ...ai.issues], !!(Object.values(r.charter.roles).some(Boolean) || r.charter.decisionRules || r.charter.norms || r.charter.prefixes || r.aiStatement)), count: null,
    criteria: [
      { text: 'Each lead role held by a different member (initials)', ok: !c1.issues.some((x) => /Initials|different member/.test(x)) },
      { text: 'Decision rules and communication norms written', ok: !c1.issues.some((x) => /Decision rules|Communication norms/.test(x)) },
      { text: 'Every Week 1 ID prefix (ENT, PRT, EXT, STK, CON, NEED, REL) owned by exactly one member', ok: !c1.issues.some((x) => /prefix|owns|owned/i.test(x)) },
      { text: 'AI usage statement recorded (or a statement that no AI tool was used)', ok: ai.ok },
    ],
    issues: [...c1.issues, ...ai.issues], items: [],
  })

  // Enterprise & mission
  const ent = Object.values(doc.artifacts).find((a) => a.type === 'ENT' && a.status === 'active')
  const content = checkProposalContent(r.proposal)
  const boundaryIssue = (x: string) => /Inside the boundary|inside the boundary/.test(x)
  const descOk = words(ent?.description ?? '') >= 3
  const entIssues = [...content.issues.filter((x) => !boundaryIssue(x)), ...(descOk ? [] : ['Describe the enterprise: who it is and what it offers, in one or two sentences.'])]
  const mgo = [...ids.values()].filter((a) => a.type === 'MGO')
  parts.push({
    id: 'enterprise', label: 'Enterprise & mission', state: partState(entIssues, !!(r.proposal.name || r.proposal.purpose || ent?.description)),
    count: null,
    criteria: [
      { text: 'Enterprise named (your own, not AeroLink) and described; domain stated', ok: !!r.proposal.name.trim() && descOk && !!r.proposal.domain.trim() && !entIssues.some((x) => /AeroLink/.test(x)) },
      { text: 'Problem statement in one sentence', ok: !entIssues.some((x) => /^Problem statement/.test(x)) },
      { text: 'Mission (MGO-001) in one sentence; objectives optional, each stated', ok: !entIssues.some((x) => /Mission|MGO|objective|goal/i.test(x)) },
      { text: 'System of interest in one sentence', ok: !entIssues.some((x) => /^System of interest/.test(x)) },
      { text: `Why it suits a 14-week project: at least ${MIN_WHY_WORDS} words`, ok: !entIssues.some((x) => /14-week/.test(x)) },
    ],
    issues: entIssues,
    items: [ent, ...mgo].filter((a): a is Artifact => !!a).map((a) => {
      const reasons = a.type === 'ENT' ? entIssues.filter((x) => !/Mission|MGO|goal/i.test(x)) : a.id === 'MGO-001' ? entIssues.filter((x) => /Mission/.test(x)) : entIssues.filter((x) => x.startsWith(a.id))
      return { uid: a.uid, id: a.id, label: a.type === 'ENT' ? a.title || '(enterprise not named)' : a.description || '(not stated)', state: itemState(a, reasons, approved), reasons }
    }),
  })

  // Boundary & context
  const c3 = checkContextPart(r)
  const insideIssues = content.issues.filter(boundaryIssue)
  const boundaryIssues = [...insideIssues, ...c3.issues]
  const prt = [...ids.values()].filter((a) => a.type === 'PRT')
  const ext = [...ids.values()].filter((a) => a.type === 'EXT')
  const extComplete = r.context.filter((c) => contextRowIssues(c).length === 0).length
  parts.push({
    id: 'boundary', label: 'Boundary & context', state: partState(boundaryIssues, prt.length + ext.length > 0),
    count: { complete: Math.min(prt.filter((p) => p.title.trim()).length, MIN_INSIDE) + Math.min(extComplete, MIN_CONTEXT), required: MIN_INSIDE + MIN_CONTEXT, present: prt.length + ext.length },
    criteria: [
      { text: `At least ${MIN_INSIDE} named elements inside the boundary (PRT)`, ok: !insideIssues.length },
      { text: `At least ${MIN_CONTEXT} external systems or actors, each with its kind, what crosses the boundary and the direction`, ok: c3.ok },
    ],
    issues: boundaryIssues,
    items: [
      ...prt.map((a) => ({ uid: a.uid, id: a.id, label: a.title || '(not named)', state: itemState(a, a.title.trim() ? [] : ['Name the element.'], approved), reasons: a.title.trim() ? [] : ['Name the element.'] })),
      ...r.context.map((c) => {
        const a = ids.get(c.id)
        const reasons = contextRowIssues(c).map((x) => `Add ${x}.`)
        return { uid: a?.uid ?? c.id, id: c.id, label: c.name || '(not named)', state: itemState(a, reasons, approved), reasons }
      }),
    ],
  })

  // Stakeholders
  const reg = checkRegister(r)
  const relIssues = new Set(checkRelationships(r).issues)
  const regIssues = reg.issues.filter((x) => !relIssues.has(x))
  const stkComplete = r.stakeholders.filter((s) => stakeholderRowIssues(s).length === 0).length
  parts.push({
    id: 'stakeholders', label: 'Stakeholders', state: partState(regIssues, r.stakeholders.length > 0),
    count: { complete: stkComplete, required: MIN_STAKEHOLDERS, present: r.stakeholders.length },
    criteria: [
      { text: `At least ${MIN_STAKEHOLDERS} stakeholders, each with a role group, life-cycle stage, internal or external, and whether it approves`, ok: stkComplete >= MIN_STAKEHOLDERS },
      { text: 'Each with a level of interest from 1 to 5 and a short reason (influence and support are optional)', ok: !r.stakeholders.some((s) => stakeholderRowIssues(s).some((x) => /interest/.test(x))) && r.stakeholders.length > 0 },
      { text: 'Each with at least one specific concern', ok: r.stakeholders.length > 0 && r.stakeholders.every((s) => s.concerns.length > 0) },
      { text: `At least ${MIN_ROLE_GROUPS} role groups and at least one approving authority`, ok: !regIssues.some((x) => /role groups|approving authority/.test(x)) && stkComplete > 0 },
    ],
    issues: regIssues,
    items: r.stakeholders.map((s) => {
      const a = ids.get(s.id)
      const reasons = stakeholderRowIssues(s).map((x) => (/^CON-/.test(x) ? x : `Add ${x}.`))
      return { uid: a?.uid ?? s.id, id: s.id, label: s.name || '(not named)', state: itemState(a, reasons), reasons }
    }),
  })

  // Concerns
  const concernRows = r.stakeholders.flatMap((s) => s.concerns.map((c) => ({ c, s })))
  const conflicts = concernConflicts(doc)
  const conflictIssues = conflicts.filter((x) => !hasRationale(x.rel)).map((x) => `${x.a.id} conflicts with ${x.b.id}: say what pulls against what (a short rationale).`)
  const concernIssues = [...(r.stakeholders.length ? [] : ['No concern yet: register stakeholders, then record at least one specific concern for each.']), ...concernRows.map(({ c, s }) => concernIssue(c, s.name)).filter(Boolean), ...r.stakeholders.filter((s) => !s.concerns.length).map((s) => `${s.id} has no concern yet.`)] // conflicts are optional: their rationale stays on the item (draft), never in the part state (M6 review L-6)
  // counted per stakeholder: each needs at least one concern, and every concern it holds must be specific
  const conComplete = r.stakeholders.filter((s) => s.concerns.length > 0 && s.concerns.every((c) => !concernIssue(c, s.name))).length
  parts.push({
    id: 'concerns', label: 'Concerns', state: partState(concernIssues, concernRows.length > 0),
    count: { complete: conComplete, required: Math.max(1, r.stakeholders.length), present: r.stakeholders.length },
    criteria: [
      { text: 'Every stakeholder holds at least one concern', ok: r.stakeholders.length > 0 && r.stakeholders.every((s) => s.concerns.length > 0) },
      { text: 'Each concern is specific: what, for whom, and where or when it bites', ok: concernRows.length > 0 && concernRows.every(({ c, s }) => !concernIssue(c, s.name)) },
      { text: 'Optional: concerns that pull against each other are recorded as conflicting, each with a reason', ok: !conflictIssues.length },
    ],
    issues: concernIssues,
    items: concernRows.map(({ c, s }) => {
      const a = ids.get(c.id)
      const x = concernIssue(c, s.name)
      return { uid: a?.uid ?? c.id, id: c.id, label: c.text || '(not written)', state: itemState(a, x ? [x] : []), reasons: x ? [x] : [] }
    }),
  })

  // Relationships
  const rel = checkRelationships(r)
  const stkIds = new Set(r.stakeholders.map((s) => s.id))
  const relAllIssues = [...rel.issues]
  parts.push({
    id: 'relationships', label: 'Relationships', state: partState(relAllIssues, r.relationships.length + conflicts.length > 0),
    count: { complete: rel.complete, required: MIN_RELATIONSHIPS, present: r.relationships.length },
    criteria: [
      { text: `At least ${MIN_RELATIONSHIPS} relationships between registered stakeholders, each with a type and a note`, ok: rel.complete >= MIN_RELATIONSHIPS },
      { text: `At least ${MIN_CONFLICTS} of them “conflicts with”`, ok: rel.conflicts >= MIN_CONFLICTS },
      { text: 'Each relationship once (no repeated pair and type)', ok: !rel.issues.some((x) => /same pair|Duplicate relationship/.test(x)) },
    ],
    issues: relAllIssues,
    items: [
      ...r.relationships.map((x) => {
        const reasons = relRowIssues(x, stkIds).map((y) => `Add ${y}.`)
        const rr = Object.values(doc.relationships).find((q) => q.id === x.id)
        return { uid: rr?.uid ?? x.id, id: x.id, label: `${x.from || '…'} ${x.type || '(type)'} ${x.to || '…'}`, state: (reasons.length ? 'draft' : 'meets') as ItemState, reasons }
      }),
      ...conflicts.map((x) => ({ uid: x.rel.uid, id: x.rel.id, label: `${x.a.id} conflicts with ${x.b.id}`, state: (hasRationale(x.rel) ? 'meets' : 'draft') as ItemState, reasons: hasRationale(x.rel) ? [] : ['Say what pulls against what.'] })),
    ],
  })

  // Needs
  const c5 = checkNeedsPart(r)
  const nm = needsMinimum(r.charter)
  const needItems = r.needs.map((n) => {
    const a = ids.get(n.id)
    const s = needStatus(n, r)
    return { uid: a?.uid ?? n.id, id: n.id, label: n.name || n.text || '(not written)', state: itemState(a, s.reasons), reasons: s.reasons }
  })
  parts.push({
    id: 'needs', label: 'Needs', state: partState(c5.issues, r.needs.length > 0),
    count: { complete: needItems.filter((x) => !x.reasons.length).length, required: nm.needs, present: r.needs.length },
    criteria: [
      { text: `At least ${nm.needs} needs that count, from at least ${nm.needSources} different stakeholders`, ok: c5.ok },
      { text: 'Each a valid need statement whose subject is a registered stakeholder (no “shall”, no named solution)', ok: needItems.length > 0 && !needItems.some((x) => x.reasons.some((y) => /statement|subject|shall|solution/i.test(y))) },
      { text: 'Each traced to its concern(s) and to the mission or an objective, with a rationale and a priority', ok: needItems.length > 0 && !needItems.some((x) => x.reasons.some((y) => /concern|MGO|mission|rationale|priority/i.test(y))) },
      { text: 'The six checks confirmed by your team; every warning rewritten or justified', ok: needItems.length > 0 && !needItems.some((x) => x.reasons.some((y) => /Confirm each|warning|justif/i.test(y))) },
    ],
    issues: c5.issues, items: needItems,
  })

  // Assumptions & unknowns (A25: optional, each with a rationale)
  const au = [...ids.values()].filter((a) => (a.type === 'A' || a.type === 'U') && a.milestones.includes(1))
  const auItems = au.map((a) => {
    const reasons = [...(words(a.title) + words(a.description) >= 3 ? [] : ['State it in a sentence.']), ...(hasRationale(a) ? [] : ['Give its rationale: why the team assumes it, or why it is still unknown.'])]
    return { uid: a.uid, id: a.id, label: a.title || a.description || '(not stated)', state: itemState(a, reasons), reasons }
  })
  const auIssues = auItems.flatMap((x) => x.reasons.map((y) => `${x.id}: ${y}`))
  parts.push({
    id: 'assumptions', label: 'Assumptions & unknowns', state: au.length ? partState(auIssues, true) : 'optional',
    count: null,
    criteria: [{ text: 'Optional in Week 1: each assumption or unknown stated, with its rationale (they carry forward to Weeks 2 and 3)', ok: !auIssues.length }],
    issues: auIssues, items: auItems,
  })

  const required = parts.filter((p) => p.id !== 'assumptions')
  const unresolved = [
    ...r.relationships.filter((x) => relRowIssues(x, stkIds).length).map((x) => `${x.id}: ${relRowIssues(x, stkIds)[0]}`),
    ...Object.values(doc.artifacts).filter((a) => a.status === 'active' && a.unresolvedRefs.length).map((a) => `${a.id} names ${a.unresolvedRefs.join(', ')}, not in the project`),
  ]
  const pendingReviews = [
    ...Object.values(doc.artifacts).filter((a) => a.status === 'active' && a.review.state === 'needs-review').map((a) => `${a.id} needs review: an item it depends on changed`),
    ...Object.values(doc.artifacts).filter((a) => a.status === 'active' && a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted).map((a) => `${a.id} was copied from the AeroLink practice and is not adapted yet`),
  ]
  return { parts, headline: { meets: required.filter((p) => p.state === 'meets').length, required: required.length }, unresolved, pendingReviews, approval, record: r }
}
