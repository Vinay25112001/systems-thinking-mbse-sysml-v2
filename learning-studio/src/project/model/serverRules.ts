// Server-owned fields of the project document (SECURITY_ARCHITECTURE.md §5.3, PROJECT_DATA_SCHEMA.md §5.2). Pure, shared
// by the course server (authoritative: it screens every member change set) and the HTTP persistence adapter (an early,
// visible refusal in the browser, so a refused edit never sits in the save queue). In offline mode nothing here runs.
//
//   - Enterprise approval (ENT-001 attributes.approval, Milestone.approval) is written only by the server after an
//     instructor decision; a member change that touches it is refused with a message.
//   - Team.members is projected by the server from the team's memberships; member edits to it are stripped (the Week 1
//     charter editor recomputes the list on every charter edit, so refusing would block the whole charter).
//   - Team.label and project.course (team label, course, term) are set by the server on create and replace; member edits
//     to them are stripped, not refused, because the Week 1 lab tool writes them together with the charter (M2 review
//     L2: no spoofed team name in exports or on screen).
//   - Project identity (uid, createdAt, createdWith) never changes by an edit.
import type { ChangeSource, Operation, ProjectDoc } from './types'

/** Change sources a member's browser may send. 'review' is a member clearing a review flag (\"Mark reviewed\", attributed
 *  to the authenticated member); 'system' and 'migration' are written by the server only; 'restore' only as a whole-content
 *  replacement (checked by the server). */
export const MEMBER_SOURCES: readonly ChangeSource[] = ['editor', 'import', 'practice-copy', 'restore', 'review']
export const APPROVAL_REFUSAL = 'The enterprise approval is decided by your instructor on the course server. Use “Request instructor approval” on the My Project overview.'
export const MAX_OPS_PER_CHANGE = 2000

const approvalPath = (p: string) => p === 'approval' || p.startsWith('approval.')
const entApprovalPath = (p: string) => p === 'attributes.approval' || p.startsWith('attributes.approval.')
const teamServerOwned = (p: string) => p === 'members' || p.startsWith('members.') || p === 'label' || p.startsWith('label.')
const PROJECT_IDENTITY = /^(uid|createdAt|createdWith)(\.|$)/
const courseServerOwned = (p: string) => p === 'course' || p.startsWith('course.')

export type Screened = { ok: true; ops: Operation[]; stripped: number } | { ok: false; error: string }

/** Screens a member's operations against the server-owned fields. Never throws on well-shaped operations. */
export function screenMemberOps(doc: ProjectDoc, ops: Operation[]): Screened {
  if (ops.length > MAX_OPS_PER_CHANGE) return { ok: false, error: `A change may hold at most ${MAX_OPS_PER_CHANGE} operations.` }
  const out: Operation[] = []
  let stripped = 0
  for (const op of ops) {
    switch (op.op) {
      case 'update-artifact':
        if (doc.artifacts[op.uid]?.type === 'ENT' && op.fields.some((f) => entApprovalPath(f.path))) return { ok: false, error: APPROVAL_REFUSAL }
        out.push(op)
        break
      case 'create-artifact': {
        const ap = op.artifact?.attributes?.approval as { decision?: unknown } | undefined
        if (op.artifact?.type === 'ENT' && ap && typeof ap === 'object' && ap.decision) return { ok: false, error: APPROVAL_REFUSAL }
        out.push(op)
        break
      }
      case 'update-milestone':
        if (op.fields.some((f) => approvalPath(f.path))) return { ok: false, error: APPROVAL_REFUSAL }
        out.push(op)
        break
      case 'update-team': {
        const fields = op.fields.filter((f) => !teamServerOwned(f.path))
        stripped += op.fields.length - fields.length
        if (fields.length) out.push({ ...op, fields })
        break
      }
      case 'update-project':
        if (op.fields.some((f) => PROJECT_IDENTITY.test(f.path))) return { ok: false, error: 'The project’s identity (uid, creation date, app) cannot be changed by an edit.' }
        {
          const fields = op.fields.filter((f) => !courseServerOwned(f.path))
          stripped += op.fields.length - fields.length
          if (fields.length) out.push({ ...op, fields })
        }
        break
      default:
        out.push(op)
    }
  }
  return { ok: true, ops: out, stripped }
}

/** The approval stored in the document (ENT-001 attributes.approval), as the Week 1 readers see it. */
export function docApproval(doc: ProjectDoc): { decision: string; decidedOn: string } {
  const ent = Object.values(doc.artifacts).find((a) => a.type === 'ENT')
  const ap = ent?.attributes.approval as { decision?: unknown; decidedOn?: unknown } | undefined
  return { decision: typeof ap?.decision === 'string' ? ap.decision : '', decidedOn: typeof ap?.decidedOn === 'string' ? ap.decidedOn : '' }
}

/** Everything a member must never change about the approval, order-independent: the decision on every enterprise and
 *  on Milestone 1 (a missing value counts as none, so a new enterprise without a decision changes nothing). */
export function approvalFingerprint(doc: ProjectDoc): string {
  const norm = (ap: unknown) => {
    const a = (ap && typeof ap === 'object' ? ap : {}) as { decision?: unknown; decidedOn?: unknown }
    return [typeof a.decision === 'string' ? a.decision : '', typeof a.decidedOn === 'string' ? a.decidedOn : '']
  }
  const ents = Object.values(doc.artifacts).filter((a) => a.type === 'ENT').map((a) => norm(a.attributes.approval)).filter(([d, o]) => d || o)
  return JSON.stringify([ents, norm(doc.milestones.find((m) => m.week === 1)?.approval)])
}

/** Keeps the server-owned fields of `current` in a whole-content replacement (restore of a version, replace-import):
 *  the approval and the member list are never taken from the incoming content. */
export function keepServerOwned(current: ProjectDoc, incoming: ProjectDoc): ProjectDoc {
  const curEnt = Object.values(current.artifacts).find((a) => a.type === 'ENT')
  const artifacts = { ...incoming.artifacts }
  for (const a of Object.values(artifacts)) {
    if (a.type !== 'ENT') continue
    artifacts[a.uid] = { ...a, attributes: { ...a.attributes, approval: (curEnt?.attributes.approval ?? { decision: '', decidedOn: '' }) as never } }
  }
  const curM = new Map(current.milestones.map((m) => [m.week, m]))
  const milestones = incoming.milestones.map((m) => {
    const { approval: _drop, ...rest } = m
    void _drop
    const ap = curM.get(m.week)?.approval
    return ap ? { ...rest, approval: ap } : rest
  })
  return { ...incoming, artifacts, milestones, team: { ...incoming.team, members: current.team.members } }
}
