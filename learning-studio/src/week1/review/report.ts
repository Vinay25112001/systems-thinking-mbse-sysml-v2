// The Week 1 package review (directive §16; spec §g.2, RS-10/RS-11). Pure: the five review sections computed from the
// canonical project with the same course checks as My Project (canvasProgress, team.ts, needQuality.ts), every open
// item with a severity, and the validation report that travels with a submission. Automated checks never substitute
// for faculty assessment: the report says so, and only conditions that make the snapshot unusable block submission.
import { needStatus, sourcesOf, concernsOf, MISSION_ID } from '../../workbench/week1/team'
import { canvasProgress, type CanvasProgress, type PartId } from '../../project/canvas/progress'
import { concernConflicts, hasRationale } from '../../project/model/week1Relations'
import type { ProjectDoc } from '../../project/model/types'

export type Severity = 'blocks' | 'should-fix' | 'note'
export const SEVERITY_LABEL: Record<Severity, string> = { blocks: 'Blocks submission', 'should-fix': 'Should fix', note: 'Note' }
export type ReviewIssue = { key: string; section: 1 | 2 | 3 | 4; severity: Severity; text: string; part: PartId }
export type TeamReviewState = 'draft' | 'ready-for-review'
export type ReviewModel = {
  progress: CanvasProgress
  issues: ReviewIssue[]
  coverage: { stakeholder: string; name: string; needs: string[]; reason: string }[]
  traces: { need: string; stakeholder: boolean; concern: boolean; objective: boolean; counts: boolean }[]
  rationaleMissing: string[]
  conflicts: { rel: string; text: string }[]
  aiStatement: boolean
  templates: string[]
  aiItems: string[]
  teamReview: TeamReviewState
  blocks: string[]
}

/** A note key: stable for the same item and wording, within the server's key alphabet (≤ 120 characters). */
export const issueKey = (section: number, text: string) => `s${section}:${text.replace(/[^A-Za-z0-9:._ -]/g, '_').slice(0, 110)}`

export function reviewModel(doc: ProjectDoc, opts: { serverMode: boolean; approvalRequested: boolean }): ReviewModel {
  const progress = canvasProgress(doc, { serverMode: opts.serverMode })
  const r = progress.record
  const part = (id: PartId) => progress.parts.find((p) => p.id === id)!
  const issues: ReviewIssue[] = []
  const add = (section: ReviewIssue['section'], severity: Severity, text: string, p: PartId) => issues.push({ key: issueKey(section, text), section, severity, text, part: p })
  // RS-11: only what makes the snapshot unusable blocks the submission
  const blocks: string[] = []
  if (!r.proposal.name.trim()) blocks.push('Name your enterprise.')
  if (opts.serverMode && !opts.approvalRequested) blocks.push('Send the enterprise proposal for instructor approval (it may still be pending when you submit).')
  for (const b of blocks) add(1, 'blocks', b, 'enterprise')
  // 1 enterprise, team, mission, objectives
  for (const p of ['team', 'enterprise', 'boundary'] as PartId[]) for (const x of part(p).issues) add(1, 'should-fix', x, p)
  // 2 stakeholders, concerns, relationships, conflicts
  for (const p of ['stakeholders', 'concerns', 'relationships'] as PartId[]) for (const x of part(p).issues) add(2, 'should-fix', x, p)
  // 3 needs and traceability completeness
  for (const x of part('needs').issues) add(3, 'should-fix', x, 'needs')
  const traces = r.needs.map((n) => {
    const s = needStatus(n, r)
    const goals = [MISSION_ID, ...r.proposal.goals.map((g) => g.id)]
    return { need: n.id, stakeholder: sourcesOf(n).some((id) => r.stakeholders.some((x) => x.id === id)), concern: concernsOf(n).length > 0, objective: goals.includes(n.goal.trim().toUpperCase()), counts: s.counts }
  })
  const coverage = r.stakeholders.map((s) => {
    const a = Object.values(doc.artifacts).find((x) => x.id === s.id)
    return { stakeholder: s.id, name: s.name, needs: r.needs.filter((n) => sourcesOf(n).includes(s.id)).map((n) => n.id), reason: String(a?.attributes.coverageNote ?? '') }
  })
  for (const c of coverage) if (!c.needs.length && !c.reason.trim()) add(3, 'note', `${c.stakeholder} has no need: add one or record why (Coverage view).`, 'stakeholders')
  // 4 sources and rationale quality
  const live = Object.values(doc.artifacts).filter((a) => a.status === 'active')
  const rationaleMissing = live.filter((a) => a.type === 'NEED' && !hasRationale(a)).map((a) => a.id)
  for (const id of rationaleMissing) add(4, 'should-fix', `${id}: the rationale is missing or very short (a reason of a few words).`, 'needs')
  const conflicts = [
    ...r.relationships.filter((x) => x.type === 'conflicts-with').map((x) => ({ rel: x.id, text: `${x.from} conflicts with ${x.to}: ${x.note || '(no note)'}` })),
    ...concernConflicts(doc).map((x) => ({ rel: x.rel.id, text: `${x.a.id} conflicts with ${x.b.id}: ${x.rel.rationale || '(no rationale)'}` })),
  ]
  const aiStatement = r.aiStatement.trim().split(/\s+/).filter(Boolean).length >= 12
  if (!aiStatement) add(4, 'should-fix', 'Write the AI usage statement (or state that no AI tool was used).', 'team')
  const templates = live.filter((a) => a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted).map((a) => a.id)
  for (const id of templates) add(4, 'should-fix', `${id} was copied from the AeroLink practice and is not adapted to your enterprise.`, 'stakeholders')
  const aiItems = live.filter((a) => a.provenance.kind === 'ai-suggested-reviewed' || a.aiAssisted).map((a) => a.id)
  const m1 = doc.milestones.find((m) => m.week === 1)
  return { progress, issues, coverage, traces, rationaleMissing, conflicts, aiStatement, templates, aiItems, teamReview: m1?.teamReview?.state === 'ready-for-review' ? 'ready-for-review' : 'draft', blocks }
}

/** The validation report stored with a submission: what the team saw, labelled advisory. */
export function validationReport(m: ReviewModel, at: string) {
  return {
    format: 'week1-validation-report',
    version: 1,
    generatedAt: at,
    advisory: 'Automated structural checks of the course. They show the package is complete enough to review, not that it is right; they never substitute for the instructor’s assessment.',
    headline: m.progress.headline,
    parts: m.progress.parts.map((p) => ({ id: p.id, label: p.label, state: p.state, count: p.count, criteria: p.criteria })),
    issues: m.issues.map((i) => ({ key: i.key, section: i.section, severity: i.severity, text: i.text })),
    traces: m.traces,
    coverage: m.coverage,
    approval: m.progress.approval.state,
  }
}
