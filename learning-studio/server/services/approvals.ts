// Enterprise approval (PROJECT_DATA_SCHEMA.md §5.2; directive §12, §19 C). A member requests approval: the server
// freezes a `proposal` snapshot and marks the proposal "submitted for approval" in the document. Only an instructor
// decides (approved / revision-requested, with a comment), against that frozen snapshot; the server then mirrors the
// decision into the document with a `review` change set, so the existing Week 1 readers (adapters/week1.ts,
// week1Status.ts) keep working. Students cannot write those paths (serverRules.ts): self-declared approval is no longer
// authoritative in server mode.
//
// The approval is bound to the approved content (M2 review H1; services/approvalBinding.ts): approving stores the
// material-content hash of the frozen snapshot. A later material edit moves the request to `approved-changes-pending`
// (history kept); the instructor sees the difference from the approved snapshot and re-approves the current content or
// requests a revision, and the team may also send a new request in that state.
//
// The faculty-only note lives in the faculty store (r.faculty, its own table) and is read only by instructorView, which
// requires an InstructorContext (M2 review M5). No student path reads that table.
import { CHANGED_SINCE_APPROVAL, materialContent, materialDiff, type MaterialDiffRow } from '../../src/project/model/approvalBinding'
import { snapshotId } from '../../src/project/model/ids'
import type { ProjectDoc } from '../../src/project/model/types'
import { badRequest, HttpError, isObj, str, type Deps, type Principal } from '../http/core'
import type { InstructorContext } from '../authz/policy'
import type { ApprovalRow, ProjectRow, Repos } from '../repo/types'
import { approvalOps, materialHash, type DocDecision } from './approvalBinding'
import { systemChange } from './projects'

// ------------------------------------------------------------------------------------------- views
async function initialsOf(r: Repos, id: string | null) {
  if (!id) return null
  return (await r.identity.userById(id))?.initials ?? null
}
/** What a team member sees: state, dates, initials and the instructor's comment. Never the faculty note (which this
 *  function cannot even reach: it lives in the faculty store). */
export async function studentView(r: Repos, a: ApprovalRow) {
  return { id: a.id, state: a.state, requestedAt: a.requestedAt, requestedBy: await initialsOf(r, a.requestedBy), decidedAt: a.decidedAt, decidedBy: await initialsOf(r, a.decidedBy), comment: a.decisionComment ?? '', changedAt: a.changedAt }
}

const proposalOf = (doc: ProjectDoc | undefined) => {
  const ent = doc ? Object.values(doc.artifacts).find((x) => x.type === 'ENT') : undefined
  const mission = doc ? Object.values(doc.artifacts).find((x) => x.id === 'MGO-001') : undefined
  // M6: the enterprise description (a material field, A26) and the objectives are part of what the instructor reviews
  const objectives = doc ? Object.values(doc.artifacts).filter((x) => x.type === 'MGO' && x.id !== 'MGO-001' && x.status === 'active').sort((a, b) => a.id.localeCompare(b.id)).map((x) => `${x.id} ${x.description}`) : []
  return { enterprise: ent?.title ?? '', description: ent?.description ?? '', domain: String(ent?.attributes.domain ?? ''), problem: String(ent?.attributes.problem ?? ''), suitability: String(ent?.attributes.suitability ?? ''), soi: String(ent?.attributes.soi ?? ''), mission: mission?.description ?? '', objectives }
}

/** The most recent request of the project, before `a`, that the instructor approved (its snapshot is the approved
 *  baseline the review page compares with). */
async function lastApprovedBefore(r: Repos, a: ApprovalRow): Promise<ApprovalRow | null> {
  const hist = await r.approvals.history(a.projectId)
  const i = hist.findIndex((x) => x.id === a.id)
  for (let k = (i < 0 ? hist.length : i) - 1; k >= 0; k--) if (hist[k].state === 'approved' || hist[k].state === 'approved-changes-pending') return hist[k]
  return null
}

/** The instructor's view adds the faculty-only note, the frozen proposal and, when there is an approved baseline, the
 *  field-by-field difference from it (for `approved-changes-pending`: the current content against the approved
 *  snapshot; for a pending request: the proposal against the last approved one). Requires an InstructorContext. */
export async function instructorView(ic: InstructorContext, r: Repos, a: ApprovalRow) {
  const project = await r.projects.get(a.projectId)
  const team = project ? await r.teams.get(project.teamId) : null
  const snap = await r.projects.snapshot(a.projectId, a.proposalSnapshot)
  const latest = await r.approvals.latest(a.projectId)
  let diff: MaterialDiffRow[] = []
  let baseline: string | null = null
  let currentHash: string | null = null
  if (a.state === 'approved-changes-pending' && project && snap) {
    diff = materialDiff(materialContent(snap.doc), materialContent(project.doc))
    baseline = a.proposalSnapshot
    currentHash = materialHash(project.doc)
  } else if (a.state === 'pending' && snap) {
    const prev = await lastApprovedBefore(r, a)
    const prevSnap = prev ? await r.projects.snapshot(a.projectId, prev.proposalSnapshot) : null
    if (prevSnap) {
      diff = materialDiff(materialContent(prevSnap.doc), materialContent(snap.doc))
      baseline = prev!.proposalSnapshot
    }
  }
  return {
    ...(await studentView(r, a)),
    privateNote: (await r.faculty.approvalNote(ic, a.id)) ?? '',
    current: latest?.id === a.id,
    projectId: a.projectId,
    teamId: project?.teamId ?? null,
    teamLabel: team?.label ?? '',
    proposalSnapshot: a.proposalSnapshot,
    proposal: proposalOf(snap?.doc),
    /** The proposal as it stands now (differs from `proposal` once changed after approval). */
    currentProposal: a.state === 'approved-changes-pending' ? proposalOf(project?.doc) : null,
    baselineSnapshot: baseline,
    diff,
    /** For a re-review: the material hash the instructor is looking at; a decision is refused if it moved meanwhile. */
    currentHash,
  }
}

// ------------------------------------------------------------------------------------------- actions
/** States in which the team may send a (new) request. `approved-changes-pending` included: the changed proposal can be
 *  sent for review (H1 d). */
const CAN_REQUEST = new Set(['revision-requested', 'withdrawn', 'approved-changes-pending'])

export async function requestApproval(deps: Deps, p: Principal, project: ProjectRow) {
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    const latest = await r.approvals.latest(project.id)
    if (latest?.state === 'pending') throw new HttpError(409, 'conflict', 'An approval request is already waiting for your instructor.')
    if (latest?.state === 'approved') throw new HttpError(409, 'conflict', 'Your enterprise proposal is already approved.')
    if (latest && !CAN_REQUEST.has(latest.state)) throw new HttpError(409, 'conflict', 'A request cannot be sent in this state.')
    const cur = await r.projects.get(project.id)
    if (!cur) throw new HttpError(404, 'not-found', 'Not found.')
    const ent = Object.values(cur.doc.artifacts).find((a) => a.type === 'ENT')
    if (!ent?.title.trim()) throw badRequest('Name your enterprise (Week 1 lab tool, Part 2) before requesting approval.')
    const snp = snapshotId((await r.projects.maxSnapshotNo(project.id)) + 1)
    const label = latest?.state === 'approved-changes-pending' ? 'Changed enterprise proposal sent for instructor re-review' : 'Enterprise proposal sent for instructor approval'
    await r.projects.putSnapshot(project.id, { id: snp, at, kind: 'proposal', label, rev: cur.doc.rev, createdBy: p.userId }, cur.doc)
    const row: ApprovalRow = { id: crypto.randomUUID(), projectId: project.id, state: 'pending', requestedBy: p.userId, requestedAt: at, proposalSnapshot: snp, decidedBy: null, decidedAt: null, decisionComment: null, approvedHash: null, changedAt: null, supersedes: latest?.id ?? null }
    await r.approvals.create(row)
    const res = await systemChange(r, project.id, (doc) => approvalOps(doc, { decision: 'pending', decidedOn: '' }), { source: 'system', summary: label, actorUserId: p.userId, initials: p.user.initials, actorName: p.user.displayName, at })
    await r.audit.append({ at, actorUserId: p.userId, actorRole: 'student', action: 'approval.request', targetType: 'approval', targetId: row.id, outcome: 'ok', detail: latest ? { supersedes: latest.id, from: latest.state } : undefined })
    return { approval: await studentView(r, row), version: res.version }
  })
}

export function parseDecision(body: unknown) {
  if (!isObj(body)) throw badRequest('Send { decision, comment }.')
  if (body.decision !== 'approved' && body.decision !== 'revision-requested') throw badRequest('decision must be approved or revision-requested.')
  const comment = str(body.comment, 'comment', 4000, { optional: true })
  if (body.decision === 'revision-requested' && !comment) throw badRequest('Say what the team should revise.')
  const privateNote = str(body.privateNote, 'privateNote', 4000, { optional: true })
  const currentHash = body.currentHash === undefined || body.currentHash === null ? null : str(body.currentHash, 'currentHash', 64)
  return { decision: body.decision as 'approved' | 'revision-requested', comment, privateNote: privateNote || null, currentHash }
}

const mirrorFor = (decision: 'approved' | 'revision-requested', day: string): DocDecision => ({ decision: decision === 'approved' ? 'approved' : 'revise', decidedOn: day })

export async function decideApproval(deps: Deps, ic: InstructorContext, a: ApprovalRow, d: ReturnType<typeof parseDecision>) {
  if (a.state === 'approved-changes-pending') return reReview(deps, ic, a, d)
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    const snap = await r.projects.snapshot(a.projectId, a.proposalSnapshot)
    const approvedHash = d.decision === 'approved' && snap ? materialHash(snap.doc) : null
    if (!(await r.approvals.decide(a.id, d.decision, ic.userId, at, d.comment, approvedHash))) throw new HttpError(409, 'conflict', 'This request was already decided or withdrawn.')
    if (d.privateNote) await r.faculty.putApprovalNote(ic, a.id, d.privateNote, at)
    const day = at.slice(0, 10)
    let mirror = mirrorFor(d.decision, day)
    let summary = d.decision === 'approved' ? 'Instructor approved the enterprise proposal' : 'Instructor requested a revision of the enterprise proposal'
    // approved against the frozen snapshot while the team kept editing: the live content is not what was approved
    const cur = approvedHash ? await r.projects.get(a.projectId) : null
    if (cur && approvedHash && materialHash(cur.doc) !== approvedHash) {
      await r.approvals.setState(a.id, 'approved', 'approved-changes-pending', at)
      mirror = { decision: CHANGED_SINCE_APPROVAL, decidedOn: day }
      summary = 'Instructor approved the proposal as sent; it has changed since, so it needs re-review'
    }
    const res = await systemChange(r, a.projectId, (doc) => approvalOps(doc, mirror), { source: 'review', summary, ...(d.comment ? { rationale: d.comment } : {}), actorUserId: ic.userId, initials: ic.user.initials, actorName: ic.user.displayName, at })
    await r.audit.append({ at, actorUserId: ic.userId, actorRole: 'instructor', action: 'approval.decide', targetType: 'approval', targetId: a.id, outcome: 'ok', detail: { decision: d.decision } })
    const row = await r.approvals.get(a.id)
    return { approval: await instructorView(ic, r, row!), version: res.version }
  })
}

/** A decision on an approved proposal that changed afterwards (H1 c). The instructor decides on the CURRENT content (the
 *  one shown in the diff): it is frozen as a new proposal snapshot and recorded as a new request that supersedes the
 *  changed one, so the earlier approval stays in the history. A stale view (the team edited again) is refused (409). */
async function reReview(deps: Deps, ic: InstructorContext, a: ApprovalRow, d: ReturnType<typeof parseDecision>) {
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    const latest = await r.approvals.latest(a.projectId)
    if (latest?.id !== a.id || latest.state !== 'approved-changes-pending') throw new HttpError(409, 'conflict', 'This proposal was already re-reviewed or sent again by the team; reload the list.')
    const cur = await r.projects.get(a.projectId)
    if (!cur) throw new HttpError(404, 'not-found', 'Not found.')
    const hash = materialHash(cur.doc)
    if (!d.currentHash || d.currentHash !== hash) throw new HttpError(409, 'conflict', 'The team changed the proposal again since you opened it; reload to see the latest difference.')
    const snp = snapshotId((await r.projects.maxSnapshotNo(a.projectId)) + 1)
    await r.projects.putSnapshot(a.projectId, { id: snp, at, kind: 'proposal', label: 'Changed enterprise proposal re-reviewed by the instructor', rev: cur.doc.rev, createdBy: ic.userId }, cur.doc)
    const approved = d.decision === 'approved'
    const row: ApprovalRow = { id: crypto.randomUUID(), projectId: a.projectId, state: approved ? 'approved' : 'revision-requested', requestedBy: ic.userId, requestedAt: at, proposalSnapshot: snp, decidedBy: ic.userId, decidedAt: at, decisionComment: d.comment, approvedHash: approved ? hash : null, changedAt: null, supersedes: a.id }
    await r.approvals.create(row)
    if (d.privateNote) await r.faculty.putApprovalNote(ic, row.id, d.privateNote, at)
    const res = await systemChange(r, a.projectId, (doc) => approvalOps(doc, mirrorFor(d.decision, at.slice(0, 10))), { source: 'review', summary: approved ? 'Instructor re-approved the changed enterprise proposal' : 'Instructor requested a revision of the changed enterprise proposal', ...(d.comment ? { rationale: d.comment } : {}), actorUserId: ic.userId, initials: ic.user.initials, actorName: ic.user.displayName, at })
    await r.audit.append({ at, actorUserId: ic.userId, actorRole: 'instructor', action: 'approval.re-review', targetType: 'approval', targetId: row.id, outcome: 'ok', detail: { decision: d.decision, supersedes: a.id } })
    return { approval: await instructorView(ic, r, row), version: res.version }
  })
}

