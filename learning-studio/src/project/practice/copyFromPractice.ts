// Explicit copy from the AeroLink practice into a team project (architecture §6.3, faculty decision F4 default:
// allowed as templates, flagged, not counted until adapted; stakeholders only in P1). The ONLY module under
// src/project/ that reads AeroLink data, and only when the student asks: nothing is copied without the confirmation
// dialog that lists exactly what will be copied (see Handoff.tsx). Copied items get NEW project IDs (the AeroLink ID is
// recorded in provenance.copiedFrom, never reused), the provenance `copied-from-practice`, a visible badge, and are
// excluded from milestone minimums until a team member edits them and marks them adapted.
// To remove copying (if faculty decide against F4), set COPY_FROM_PRACTICE_ENABLED to false: the handoff panel stays.
import { CONCERNS, STAKEHOLDERS, type CaseStakeholder } from '../../content/lectures/week01/aerolinkCase'
import { STAGES } from '../../workbench/week1/stakeholders'
import { makeArtifact, makeRelationship } from '../model/create'
import { formatId, nextNumber } from '../model/ids'
import type { Artifact, Operation, ProjectDoc, Provenance, Stamp } from '../model/types'

/** Faculty decision F4 (pending): copying AeroLink practice stakeholders as templates. */
export const COPY_FROM_PRACTICE_ENABLED = true
export const PRACTICE_WARNING = 'These are AeroLink (instructor example) items. They count only after you adapt them to your enterprise.'

export type PracticeStakeholder = { id: string; name: string; concerns: { id: string; text: string }[]; detail: string }
export const PRACTICE_STAKEHOLDERS: PracticeStakeholder[] = STAKEHOLDERS.map((s: CaseStakeholder) => ({
  id: s.id,
  name: s.name,
  concerns: CONCERNS.filter((c) => c.stakeholder === s.id).map((c) => ({ id: c.id, text: c.text })),
  detail: `${s.roleGroup}, ${s.side}${s.approving ? ', approving authority' : ''}`,
}))

/** Operations that copy the chosen practice stakeholders (with their concerns) into the project. */
export function copyStakeholdersOps(doc: ProjectDoc, ids: string[], stamp: Stamp): { ops: Operation[]; created: string[] } {
  const ops: Operation[] = []
  const created: string[] = []
  let stk = nextNumber(doc, 'STK')
  let con = nextNumber(doc, 'CON')
  let lnk = nextNumber(doc, 'LNK')
  const maxSeq = (t: string) => Math.max(0, ...Object.values(doc.artifacts).filter((a) => a.type === t).map((a) => (typeof a.attributes.seq === 'number' ? (a.attributes.seq as number) : 0)))
  let stkSeq = maxSeq('STK')
  let conSeq = maxSeq('CON')
  for (const id of ids) {
    const s = STAKEHOLDERS.find((x) => x.id === id)
    if (!s) continue
    const prov = (from: string): Provenance => ({ kind: 'copied-from-practice', copiedFrom: { case: 'AeroLink', id: from }, at: stamp.at, adapted: false })
    const stage = (STAGES as readonly string[]).includes(s.stage) ? s.stage : ''
    const a: Artifact = makeArtifact({ id: formatId('STK', stk++), type: 'STK', title: s.name, attributes: { role: s.roleGroup, stage, side: s.side, approving: s.approving, influence: s.influence, influenceText: String(s.influence), influenceReason: s.influenceReason, seq: ++stkSeq, copiedText: s.name }, provenance: prov(s.id), stamp })
    ops.push({ op: 'create-artifact', artifact: a })
    created.push(a.id)
    for (const c of CONCERNS.filter((x) => x.stakeholder === s.id)) {
      const k = makeArtifact({ id: formatId('CON', con++), type: 'CON', description: c.text, attributes: { seq: ++conSeq, copiedText: c.text }, provenance: prov(c.id), stamp })
      ops.push({ op: 'create-artifact', artifact: k })
      ops.push({ op: 'create-relationship', relationship: makeRelationship({ id: formatId('LNK', lnk++), category: 'trace', type: 'derives-from', from: k.uid, to: a.uid, stamp, provenance: prov(`${c.id}→${s.id}`) }) })
      created.push(k.id)
    }
  }
  return { ops, created }
}

/** Whether the team has changed a copied item's text since copying (a precondition for marking it adapted). */
export const editedSinceCopy = (a: Artifact) => a.provenance.kind === 'copied-from-practice' && (a.type === 'CON' ? a.description : a.title) !== a.attributes.copiedText
/** Marks a copied item adapted (it then counts toward the minimums). */
export function markAdaptedOps(a: Artifact): Operation[] {
  if (a.provenance.kind !== 'copied-from-practice' || a.provenance.adapted) return []
  return [{ op: 'update-artifact', uid: a.uid, fields: [{ path: 'provenance.adapted', before: false, after: true }] }]
}
