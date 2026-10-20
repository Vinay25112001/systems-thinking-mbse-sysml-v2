// What the Week 1 course checks say about each artifact and about the milestone, computed by team.ts on the projected
// record (never re-implemented). "passing" means the course checks for that type pass; the tool never says "valid".
import { approvalOf, checkExported, checkProposal, concernIssue, contextRowIssues, needStatus, partsComplete, recordState, relRowIssues, stakeholderRowIssues, todayISO, type RecordState, type TeamRecord } from '../../workbench/week1/team'
import type { Artifact, MilestoneState, ProjectDoc, ValidationSnapshot } from '../model/types'
import { toTeamRecord } from './week1'

const snap = (issues: string[], checker: string, at: string): ValidationSnapshot => ({ state: issues.length ? 'failing' : 'passing', gates: issues.length ? issues.map((m, i) => ({ id: `g${i + 1}`, ok: false, message: m })) : [{ id: 'all', ok: true, message: 'The course checks for this item pass.' }], advisories: [], checkedAt: at, checker })

/** Validation of every active Week 1 artifact and stakeholder relationship, keyed by uid. */
export function week1Validation(doc: ProjectDoc, at = new Date().toISOString(), today = todayISO()): Map<string, ValidationSnapshot> {
  const r = toTeamRecord(doc)
  const out = new Map<string, ValidationSnapshot>()
  const byId = new Map(Object.values(doc.artifacts).filter((a) => a.status === 'active').map((a) => [a.id, a]))
  const put = (id: string, issues: string[], checker: string) => {
    const a = byId.get(id)
    if (a) out.set(a.uid, snap(issues, checker, at))
  }
  const prop = checkProposal(r.proposal, today)
  put('ENT-001', prop.issues.filter((x) => !/^Mission|^MGO-|^Goal IDs|^Duplicate goal/.test(x)), 'week1/team.ts checkProposal')
  put('MGO-001', prop.issues.filter((x) => x.startsWith('Mission')), 'week1/team.ts checkProposal (mission)')
  for (const g of r.proposal.goals) put(g.id, prop.issues.filter((x) => x.startsWith(g.id)), 'week1/team.ts checkProposal (goals)')
  for (const p of r.proposal.inside) put(p.id, p.name.trim() ? [] : ['Name the element inside the boundary.'], 'week1/team.ts checkProposal (PRT)')
  for (const c of r.context) put(c.id, contextRowIssues(c).length ? [`Add ${contextRowIssues(c).join(', ')}.`] : [], 'week1/team.ts contextRowIssues')
  for (const s of r.stakeholders) {
    const miss = stakeholderRowIssues(s)
    put(s.id, miss.length ? [`Add ${miss.join('; ')}.`] : [], 'week1/team.ts stakeholderRowIssues')
    for (const c of s.concerns) {
      const x = concernIssue(c, s.name)
      put(c.id, x ? [x] : [], 'week1/team.ts concernIssue')
    }
  }
  for (const n of r.needs) {
    const st = needStatus(n, r)
    put(n.id, st.counts ? [] : st.reasons, 'week1/team.ts needStatus')
  }
  const stkIds = new Set(r.stakeholders.map((s) => s.id))
  for (const rel of Object.values(doc.relationships).filter((x) => x.category === 'stakeholder' && x.status !== 'retired')) {
    const row = r.relationships.find((x) => x.id === rel.id)
    if (row) out.set(rel.uid, snap(relRowIssues(row, stkIds).length ? [`Add ${relRowIssues(row, stkIds).join('; ')}.`] : [], 'week1/team.ts relRowIssues', at))
  }
  return out
}

/** The artifacts with every derived validation snapshot filled in (for export). */
export function withValidation(doc: ProjectDoc): ProjectDoc {
  // checkedAt = the last change of the project, so the same content always exports the same snapshots
  const v = week1Validation(doc, doc.project.updatedAt)
  const artifacts: Record<string, Artifact> = {}
  for (const [uid, a] of Object.entries(doc.artifacts)) artifacts[uid] = v.has(uid) ? { ...a, validation: v.get(uid)! } : a
  return { ...doc, artifacts }
}

export type Week1Milestone = { state: MilestoneState; pendingApproval: boolean; record: TeamRecord; recordState: RecordState; approval: ReturnType<typeof approvalOf>; unadapted: number; hasContent: boolean; exportedCurrent: boolean }

/** Milestone 1 (roadmap §2.2): not-started / in-progress / checks-passing (partsComplete) / exported (an export after the
 *  last change), labeled pending approval while approvalOf ≠ approved, exactly as recordState. Practice copies not yet
 *  adapted do not count (integrity I14): the checks run on the record without them. */
export function week1Milestone(doc: ProjectDoc, today = todayISO()): Week1Milestone {
  const counted = toTeamRecord(doc, { excludeUnadapted: true })
  const full = toTeamRecord(doc)
  const unadapted = Object.values(doc.artifacts).filter((a) => a.status === 'active' && a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted).length
  const hasContent = !!(full.proposal.name.trim() || full.proposal.purpose.trim() || full.stakeholders.length || full.needs.length || full.context.length || full.proposal.inside.length || full.proposal.goals.length)
  const passing = partsComplete(counted, today)
  const exportedCurrent = checkExported(counted, today).ok
  const m1 = doc.milestones.find((m) => m.week === 1)
  const state: MilestoneState = m1?.markedSubmittedAt && exportedCurrent ? 'marked-submitted' : exportedCurrent ? 'exported' : passing ? 'checks-passing' : hasContent ? 'in-progress' : 'not-started'
  const approval = approvalOf(counted.proposal, today)
  return { state, pendingApproval: approval !== 'approved', record: counted, recordState: recordState(counted, today), approval, unadapted, hasContent, exportedCurrent }
}
