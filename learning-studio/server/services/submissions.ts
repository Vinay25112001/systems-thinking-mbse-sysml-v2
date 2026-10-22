// Week submissions (directive §16; spec §g, RS-01…RS-30; M6). A team member submits the package: in ONE transaction
// the server freezes the whole project document as an immutable `submission` snapshot, computes the SHA-256 of what it
// stored, and records the submission with the validation report the team reviewed and their notes on open items. A new
// submission supersedes an undecided or returned one (history kept). Only an instructor decides: approve, or return for
// revision with a comment (required), optionally with feedback anchored to artifact IDs of the snapshot. The instructor
// never edits the snapshot or the live project. Automated checks never substitute for the instructor's assessment: the
// validation summary is computed by the server from the frozen snapshot (labelled advisory); the figure the team's
// browser reported is kept only to flag a difference.
//
// Blocks submission (RS-11): only what makes the snapshot unusable: no enterprise named, or the proposal never sent for
// approval. A pending proposal is allowed and recorded (MP-13: "submitted for approval", never "ready").
import { createHash } from 'node:crypto'
import { snapshotId } from '../../src/project/model/ids'
import { badRequest, HttpError, isObj, str, type Deps, type Principal } from '../http/core'
import type { InstructorContext } from '../authz/policy'
import type { ProjectRow, Repos } from '../repo/types'
import type { Anchor, SubmissionRow } from '../repo/submissions'
import { reviewModel, validationReport } from '../../src/week1/review/report'

const MAX_NOTES = 60
const MAX_VALIDATION_BYTES = 64 * 1024
/** Resubmission limits (M6 review M-3): every submission keeps a permanent snapshot, so the number per week is bounded
 *  (MAX_PER_WEEK, including superseded ones), an unchanged project cannot be submitted again, and two submissions of
 *  one project are at least MIN_INTERVAL_MS apart. Kept snapshots are outside the members' version quota. */
export const SUBMISSION_LIMITS = { MAX_PER_WEEK: 10, MIN_INTERVAL_MS: 60_000 }
export const SUBMISSION_LABEL = (week: number) => `Week ${week} submission`

async function initials(r: Repos, id: string | null) {
  if (!id) return null
  return (await r.identity.userById(id))?.initials ?? null
}
/** What a team member (and the instructor) sees of a submission. No faculty-only field exists on a submission. */
export async function submissionView(r: Repos, s: SubmissionRow) {
  return {
    id: s.id,
    week: s.week,
    state: s.state,
    snapshotId: s.snapshotId,
    fingerprint: s.docSha256,
    rev: s.docRev,
    proposalState: s.proposalState,
    submittedAt: s.submittedAt,
    submittedBy: await initials(r, s.submittedBy),
    decidedAt: s.decidedAt,
    decidedBy: await initials(r, s.decidedBy),
    feedback: s.feedback ?? '',
    anchors: s.anchors,
    notes: s.notes,
    ...validationOf(s.validation),
    supersedes: s.supersedes,
  }
}
/** The validation summary is computed by the SERVER from the frozen snapshot (M6 review M-2); what the team's browser
 *  reported is kept only to flag a difference, never shown as the result. */
function validationOf(v: unknown) {
  const o = (v && typeof v === 'object' ? v : {}) as { server?: { headline?: { meets: number; required: number } }; reportedByBrowser?: { meets: number; required: number } | null }
  const server = o.server ?? null
  const reported = o.reportedByBrowser ?? null
  const mismatch = !!(server?.headline && reported && (server.headline.meets !== reported.meets || server.headline.required !== reported.required))
  return { validation: server, reportedByBrowser: reported, validationMismatch: mismatch }
}
export async function instructorSubmissionView(_ic: InstructorContext, r: Repos, s: SubmissionRow) {
  const project = await r.projects.get(s.projectId)
  const team = project ? await r.teams.get(project.teamId) : null
  const snap = await r.projects.snapshot(s.projectId, s.snapshotId)
  const ent = snap ? Object.values(snap.doc.artifacts).find((a) => a.type === 'ENT') : undefined
  return { ...(await submissionView(r, s)), projectId: s.projectId, teamLabel: team?.label ?? '', enterprise: ent?.title ?? '', current: (await r.submissions.latest(s.projectId, s.week))?.id === s.id }
}

export function parseSubmission(body: unknown) {
  if (!isObj(body)) throw badRequest('Send { week, rev, confirm, notes, validation }.')
  const week = body.week
  // M6 review M-4: the revision the team reviewed; the server freezes exactly that revision or refuses
  if (typeof body.rev !== 'number' || !Number.isInteger(body.rev) || body.rev < 0) throw badRequest('Send the revision of the project you reviewed (rev).')
  if (week !== 1) throw badRequest('Only the Week 1 package can be submitted in this release.')
  if (body.confirm !== true) throw badRequest('Confirm that your team has reviewed this package.')
  const notes: Record<string, string> = {}
  if (body.notes !== undefined) {
    if (!isObj(body.notes)) throw badRequest('notes must be an object of short texts.')
    const entries = Object.entries(body.notes)
    if (entries.length > MAX_NOTES) throw badRequest(`At most ${MAX_NOTES} notes.`)
    for (const [k, v] of entries) {
      if (!/^[A-Za-z0-9:._ -]{1,120}$/.test(k)) throw badRequest('A note key is not valid.')
      notes[k] = str(v, 'note', 2000, { optional: true })
    }
  }
  const validation = body.validation ?? null
  if (validation !== null && !isObj(validation)) throw badRequest('validation must be the report object.')
  if (Buffer.byteLength(JSON.stringify(validation)) > MAX_VALIDATION_BYTES) throw badRequest('The validation report is too large.')
  const h = isObj(validation) && isObj(validation.headline) ? validation.headline : null
  const reported = h && typeof h.meets === 'number' && typeof h.required === 'number' ? { meets: h.meets, required: h.required } : null
  return { week: 1 as const, rev: body.rev as number, notes, reported }
}

export async function submit(deps: Deps, p: Principal, project: ProjectRow, b: ReturnType<typeof parseSubmission>) {
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    const cur = await r.projects.get(project.id)
    if (!cur) throw new HttpError(404, 'not-found', 'Not found.')
    const ent = Object.values(cur.doc.artifacts).find((a) => a.type === 'ENT' && a.status === 'active')
    if (!ent?.title.trim()) throw badRequest('Name your enterprise in My Project before submitting.')
    const approval = await r.approvals.latest(project.id)
    if (!approval) throw badRequest('Send your enterprise proposal for instructor approval before submitting Week 1 (it may still be pending).')
    if (cur.doc.rev !== b.rev) throw new HttpError(409, 'conflict', `Your project changed since you reviewed it (you reviewed revision ${b.rev}; it is now revision ${cur.doc.rev}). Review the package again, then submit.`, { rev: cur.doc.rev })
    const prev = await r.submissions.latest(project.id, b.week)
    if (prev?.state === 'approved') throw new HttpError(409, 'conflict', 'Week 1 is already approved by your instructor.')
    const stored = JSON.stringify(cur.doc)
    const sha = createHash('sha256').update(stored).digest('hex')
    // M6 review M-3: bounded, permanent snapshots
    if (prev && prev.docSha256 === sha) throw new HttpError(409, 'conflict', 'Nothing changed since your last submission. Change the project (for example as your instructor asked), then submit again.')
    if (prev && Date.parse(at) - Date.parse(prev.submittedAt) < SUBMISSION_LIMITS.MIN_INTERVAL_MS) throw new HttpError(429, 'rate-limited', 'Your team submitted a moment ago. Wait a minute before submitting again.')
    if ((await r.submissions.byProject(project.id, b.week)).length >= SUBMISSION_LIMITS.MAX_PER_WEEK) throw new HttpError(409, 'conflict', `Your team has submitted Week ${b.week} ${SUBMISSION_LIMITS.MAX_PER_WEEK} times, the limit. Ask your instructor.`)
    // M6 review M-2: the summary the instructor sees is computed here from the frozen document
    const server = validationReport(reviewModel(cur.doc, { serverMode: true, approvalRequested: true }), at)
    const snp = snapshotId((await r.projects.maxSnapshotNo(project.id)) + 1)
    await r.projects.putSnapshot(project.id, { id: snp, at, kind: 'submission', label: SUBMISSION_LABEL(b.week), rev: cur.doc.rev, createdBy: p.userId }, cur.doc)
    if (prev && (prev.state === 'submitted' || prev.state === 'returned')) await r.submissions.supersede(prev.id)
    const row: SubmissionRow = { id: crypto.randomUUID(), projectId: project.id, week: b.week, snapshotId: snp, docSha256: sha, docRev: cur.doc.rev, validation: { server, reportedByBrowser: b.reported }, notes: b.notes, proposalState: approval.state, submittedBy: p.userId, submittedAt: at, state: 'submitted', decidedBy: null, decidedAt: null, feedback: null, anchors: [], supersedes: prev?.id ?? null }
    await r.submissions.create(row)
    await r.audit.append({ at, actorUserId: p.userId, actorRole: 'student', action: 'submission.create', targetType: 'submission', targetId: row.id, outcome: 'ok', detail: { week: b.week, snapshot: snp, sha256: sha, ...(prev ? { supersedes: prev.id } : {}) } })
    return { submission: await submissionView(r, row) }
  })
}

export function parseSubmissionDecision(body: unknown) {
  if (!isObj(body)) throw badRequest('Send { decision, comment, anchors? }.')
  if (body.decision !== 'approved' && body.decision !== 'returned') throw badRequest('decision must be approved or returned.')
  const comment = str(body.comment, 'comment', 8000, { optional: true })
  if (body.decision === 'returned' && !comment.trim()) throw badRequest('Say what the team should revise.')
  const anchors: Anchor[] = []
  if (body.anchors !== undefined) {
    if (!Array.isArray(body.anchors) || body.anchors.length > 100) throw badRequest('anchors must be a list of at most 100 items.')
    for (const a of body.anchors) {
      if (!isObj(a) || typeof a.artifactId !== 'string' || !/^[A-Z]{1,6}(-[A-Z]{3})?-\d{3,4}$/.test(a.artifactId)) throw badRequest('Each anchor names an artifact ID (for example NEED-004).')
      anchors.push({ artifactId: a.artifactId, text: str(a.text, 'anchor text', 2000) })
    }
  }
  return { decision: body.decision as 'approved' | 'returned', comment, anchors }
}

export async function decideSubmission(deps: Deps, ic: InstructorContext, s: SubmissionRow, d: ReturnType<typeof parseSubmissionDecision>) {
  const at = deps.clock().toISOString()
  return deps.store.tx(async (r) => {
    const snap = await r.projects.snapshot(s.projectId, s.snapshotId)
    if (snap) {
      const ids = new Set(Object.values(snap.doc.artifacts).map((a) => a.id))
      const unknown = d.anchors.filter((a) => !ids.has(a.artifactId)).map((a) => a.artifactId)
      if (unknown.length) throw badRequest(`${unknown.join(', ')} ${unknown.length > 1 ? 'are' : 'is'} not in the submitted snapshot.`)
    }
    if (!(await r.submissions.decide(s.id, d.decision, ic.userId, at, d.comment, d.anchors))) throw new HttpError(409, 'conflict', 'This submission was already decided or superseded by a newer one; reload the list.')
    await r.audit.append({ at, actorUserId: ic.userId, actorRole: 'instructor', action: 'submission.decide', targetType: 'submission', targetId: s.id, outcome: 'ok', detail: { decision: d.decision, anchors: d.anchors.length } })
    return { submission: await instructorSubmissionView(ic, r, (await r.submissions.get(s.id))!) }
  })
}
