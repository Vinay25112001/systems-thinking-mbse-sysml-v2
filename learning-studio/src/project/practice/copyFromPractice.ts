// Explicit copy from the AeroLink practice into a team project (architecture §6.3, faculty decision F4 default:
// allowed as templates, flagged, not counted until adapted; stakeholders only in P1). The ONLY module under
// src/project/ that reads AeroLink data, and only when the student asks: nothing is copied without the confirmation
// dialog that lists exactly what will be copied (see Handoff.tsx). Copied items get NEW project IDs (the AeroLink ID is
// recorded in provenance.copiedFrom, never reused), the provenance `copied-from-practice`, a visible badge, and are
// excluded from milestone minimums until a team member edits them and marks them adapted.
// To remove copying (if faculty decide against F4), set COPY_FROM_PRACTICE_ENABLED to false: the handoff panel stays.
import { CONCERNS, ROLE_GROUP_LABEL, STAKEHOLDERS, type CaseStakeholder } from '../../content/lectures/week01/aerolinkCase'
import { STAGES } from '../../workbench/week1/stakeholders'
import { makeArtifact, makeRelationship } from '../model/create'
import { formatId, nextNumber } from '../model/ids'
import type { Artifact, Operation, ProjectDoc, Provenance, Stamp } from '../model/types'

/** Faculty decision F4 (pending): copying AeroLink practice stakeholders as templates. */
export const COPY_FROM_PRACTICE_ENABLED = true
export const PRACTICE_WARNING = 'These are AeroLink (instructor example) items. They count only after you adapt them to your enterprise.'
/** The warning of the template review (spec §e.5 step 2), word for word. */
export const TEMPLATE_WARNING = 'These are the instructor’s AeroLink records. They are not about your enterprise. Each copied row arrives marked ‘Template from AeroLink — adapt before use’, does not count toward your Week 1 progress, and must be rewritten for your enterprise. Copying AeroLink content without adapting it is not acceptable work.'
/** What a template copy never carries (spec §e.5 step 2). */
export const NOT_COPIED = ['influence ratings and their reasons', 'interest and support levels', 'needs, relationships and the AeroLink enterprise, mission and system of interest', 'the AeroLink IDs (each copy gets a new ID from your project)']

export type PracticeStakeholder = { id: string; name: string; concerns: { id: string; text: string }[]; detail: string }
export const PRACTICE_STAKEHOLDERS: PracticeStakeholder[] = STAKEHOLDERS.map((s: CaseStakeholder) => ({
  id: s.id,
  name: s.name,
  concerns: CONCERNS.filter((c) => c.stakeholder === s.id).map((c) => ({ id: c.id, text: c.text })),
  detail: `${ROLE_GROUP_LABEL[s.roleGroup]}, ${s.side}${s.approving ? ', approving authority' : ''}`,
}))

/** Template options (spec §e.5): `concernsOf` = the stakeholders whose concerns are copied too (all when omitted);
 *  `ratings` = copy the influence rating and its reason (true when omitted, for the earlier callers; the template review
 *  passes false, so ratings and reasons are never copied there). */
export type CopyOptions = { concernsOf?: string[]; ratings?: boolean }
export type PlannedCopy = { from: string; fromName: string; to: string; type: 'STK' | 'CON' }

/** Operations that copy the chosen practice stakeholders (with their concerns) into the project. */
export function copyStakeholdersOps(doc: ProjectDoc, ids: string[], stamp: Stamp, opts: CopyOptions = {}): { ops: Operation[]; created: string[]; planned: PlannedCopy[] } {
  const planned: PlannedCopy[] = []
  const ratings = opts.ratings ?? true
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
    const rating: Record<string, number | string> = ratings ? { influence: s.influence, influenceText: String(s.influence), influenceReason: s.influenceReason } : {}
    const a: Artifact = makeArtifact({ id: formatId('STK', stk++), type: 'STK', title: s.name, attributes: { role: s.roleGroup, stage, side: s.side, approving: s.approving, ...rating, seq: ++stkSeq, copiedText: s.name }, provenance: prov(s.id), stamp })
    ops.push({ op: 'create-artifact', artifact: a })
    created.push(a.id)
    planned.push({ from: s.id, fromName: s.name, to: a.id, type: 'STK' })
    if (opts.concernsOf && !opts.concernsOf.includes(s.id)) continue
    for (const c of CONCERNS.filter((x) => x.stakeholder === s.id)) {
      const k = makeArtifact({ id: formatId('CON', con++), type: 'CON', description: c.text, attributes: { seq: ++conSeq, copiedText: c.text }, provenance: prov(c.id), stamp })
      ops.push({ op: 'create-artifact', artifact: k })
      ops.push({ op: 'create-relationship', relationship: makeRelationship({ id: formatId('LNK', lnk++), category: 'trace', type: 'derives-from', from: k.uid, to: a.uid, stamp, provenance: prov(`${c.id}→${s.id}`) }) })
      created.push(k.id)
      planned.push({ from: c.id, fromName: c.name, to: k.id, type: 'CON' })
    }
  }
  return { ops, created, planned }
}

/** Whether the team has changed a copied item's text since copying (a precondition for marking it adapted). */
export const editedSinceCopy = (a: Artifact) => a.provenance.kind === 'copied-from-practice' && (a.type === 'CON' ? a.description : a.title) !== a.attributes.copiedText
/** Marks a copied item adapted (it then counts toward the minimums). */
export function markAdaptedOps(a: Artifact): Operation[] {
  if (a.provenance.kind !== 'copied-from-practice' || a.provenance.adapted) return []
  return [{ op: 'update-artifact', uid: a.uid, fields: [{ path: 'provenance.adapted', before: false, after: true }] }]
}
