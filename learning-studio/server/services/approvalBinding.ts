// The approval is bound to the content the instructor approved (M2 review H1). At approval the server stores the
// SHA-256 of the proposal snapshot's material content (src/project/model/approvalBinding.ts, APPROVAL_MATERIAL_FIELDS).
// After every accepted member write the server compares the stored document with it, in the same transaction:
//   approved                  + material content differs  → approved-changes-pending (history kept, never revoked silently)
//   approved-changes-pending  + content equal again       → approved (the team went back to exactly what was approved)
// The state is mirrored into the document (ENT-001 attributes.approval and Milestone 1 approval) by a `system` change
// set, so Week 1 readers never show "approved" for content the instructor has not seen.
import { createHash } from 'node:crypto'
import { canonicalMaterial, CHANGED_SINCE_APPROVAL } from '../../src/project/model/approvalBinding'
import type { Operation, ProjectDoc } from '../../src/project/model/types'
import type { ApprovalRow, ApprovalState, Repos } from '../repo/types'

export const materialHash = (doc: ProjectDoc) => createHash('sha256').update(canonicalMaterial(doc)).digest('hex')

export type DocDecision = { decision: string; decidedOn: string }
/** The two document paths that carry the approval (ENT-001 attributes.approval and Milestone 1 approval). */
export function approvalOps(doc: ProjectDoc, d: DocDecision): Operation[] {
  const ops: Operation[] = []
  const ent = Object.values(doc.artifacts).find((a) => a.type === 'ENT')
  if (ent) ops.push({ op: 'update-artifact', uid: ent.uid, fields: [{ path: 'attributes.approval', before: (ent.attributes.approval ?? undefined) as never, after: d as never }] })
  const m1 = doc.milestones.find((m) => m.week === 1)
  if (m1) ops.push({ op: 'update-milestone', week: 1, fields: [{ path: 'approval', before: m1.approval as never, after: d as never }] })
  return ops
}

/** The approved content's hash of a request: stored at approval; for a request approved before migration 2 it is
 *  computed from its frozen proposal snapshot. */
export async function approvedHashOf(r: Repos, a: ApprovalRow): Promise<string | null> {
  if (a.approvedHash) return a.approvedHash
  if (a.state !== 'approved' && a.state !== 'approved-changes-pending') return null
  const snap = await r.projects.snapshot(a.projectId, a.proposalSnapshot)
  return snap ? materialHash(snap.doc) : null
}

export type Transition = { approval: ApprovalRow; from: ApprovalState; to: ApprovalState; mirror: DocDecision; summary: string }
/** The approval state change that `doc` (the document about to be stored) causes, or null. */
export async function approvalTransition(r: Repos, projectId: string, doc: ProjectDoc): Promise<Transition | null> {
  const a = await r.approvals.latest(projectId)
  if (!a || (a.state !== 'approved' && a.state !== 'approved-changes-pending')) return null
  const approved = await approvedHashOf(r, a)
  if (!approved) return null
  const same = materialHash(doc) === approved
  const day = (a.decidedAt ?? '').slice(0, 10)
  if (a.state === 'approved' && !same)
    return { approval: a, from: 'approved', to: 'approved-changes-pending', mirror: { decision: CHANGED_SINCE_APPROVAL, decidedOn: day }, summary: 'The approved enterprise proposal changed: it needs instructor re-review' }
  if (a.state === 'approved-changes-pending' && same)
    return { approval: a, from: 'approved-changes-pending', to: 'approved', mirror: { decision: 'approved', decidedOn: day }, summary: 'The enterprise proposal is back to the approved version' }
  return null
}
