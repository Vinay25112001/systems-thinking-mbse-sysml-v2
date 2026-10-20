// Check & submit helpers for the Week 1 Team Record and its model inputs (rebuilt 2026-10-18). The model inputs are
// exported from the Team enterprise view, from the same entries as the Team Record. Check & submit reads that stored
// record to say, the way the instructor will, where it stands (review F16 of the feedback pass; F02 of the rebuild
// review): "ready" needs every part, the AI usage statement, a current export and the instructor's approval with a valid,
// past date; a complete record whose proposal is only submitted for approval is labeled as such and never "ready".
import { loadJSON } from '../lib/storage'
import { approvalOf, checkAiStatement, checkCharterPart, checkContextPart, checkExported, checkNeedsPart, checkProposal, checkRegister, recordState, teamArtefact, todayISO, type PartCheck, type RecordState, type TeamRecord } from '../workbench/week1/team'

/** The workbench stores week artefacts under this key (WorkbenchProvider). */
export const ARTEFACTS_KEY = 'wb-artefacts'

export type RecordStatus = { parts: { id: string; label: string; check: PartCheck }[]; state: RecordState; ready: boolean; approved: boolean; record: TeamRecord }

/** The status of each Team Record part, computed by the same checks the Team enterprise view and mission 5 use. */
export function teamRecordStatus(artefacts: Record<string, unknown> = loadJSON<Record<string, unknown>>(ARTEFACTS_KEY, {}), today = todayISO()): RecordStatus {
  const r = teamArtefact(artefacts)
  const approved = approvalOf(r.proposal, today) === 'approved'
  const parts = [
    { id: 'charter', label: '1. Team charter', check: checkCharterPart(r.charter) },
    { id: 'proposal', label: '2. Enterprise proposal', check: checkProposal(r.proposal, today) },
    { id: 'context', label: '3. Context', check: checkContextPart(r) },
    { id: 'register', label: '4. Stakeholder register', check: checkRegister(r) },
    { id: 'needs', label: '5. Initial needs', check: checkNeedsPart(r) },
    { id: 'ai', label: 'AI usage statement', check: checkAiStatement(r) },
    { id: 'export', label: 'Export of both files', check: checkExported(r, today) },
    {
      id: 'approval',
      label: 'Instructor approval',
      check: approved
        ? { ok: true, issues: [], detail: `Approved on ${r.proposal.decidedOn}.` }
        : { ok: false, issues: ['Not yet approved: Week 1 may be submitted labeled “submitted for approval”, but the instructor’s approval is required before the Week 2 submission.'], detail: '' },
    },
  ]
  const state = recordState(r, today)
  return { parts, state, ready: state === 'ready', approved, record: r }
}
