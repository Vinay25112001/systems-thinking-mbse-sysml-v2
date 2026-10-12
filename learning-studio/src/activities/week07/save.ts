// Plan the workspace changes that store a trade study as CRIT, ALT and DEC elements (lab plan C.2 ID scheme) so that
// later weeks (CP3, Week 8 architecture) can use them. Pure: the component applies the plan with useWorkspace().
import type { Element, ElementProvenance, EngineeringModel, LinkType } from '../../model/engineering'
import type { NewElement } from '../../state/Workspace'
import { critAttributes } from './reference'
import { normaliseWeights, rank, sensitivity, valueTable, type TradeStudy } from './trade'

export type SavePlan = {
  /** Existing elements to update in place. */
  updates: { id: string; patch: Partial<Omit<Element, 'id' | 'kind'>> }[]
  /** New elements; `key` is the simulator's local ID, replaced by the issued workspace ID. */
  creates: (NewElement & { key: string })[]
  links: { source: string; type: LinkType; target: string; rationale?: string }[]
  warnings: string[]
}

const exists = (m: EngineeringModel, id: string, kind: string) => m.elements.some((e) => e.id === id && e.kind === kind && e.status === 'active')

const stable = (v: unknown): string => (v && typeof v === 'object' ? `{${Object.keys(v as object).sort().map((k) => `${k}:${stable((v as Record<string, unknown>)[k])}`).join(',')}}` : JSON.stringify(v))
/** True when saving `fields` would change the element's content (name, text or attributes). */
function changes(m: EngineeringModel, id: string, fields: { name: string; text: string; attributes?: Record<string, unknown> }, ignore: string[] = []): boolean {
  const e = m.elements.find((x) => x.id === id)!
  const drop = (a: Record<string, unknown>) => Object.fromEntries(Object.entries(a).filter(([k]) => !ignore.includes(k)))
  return e.name !== fields.name || (e.text ?? '') !== fields.text || stable(drop({ ...(e.attributes ?? {}), ...(fields.attributes ?? {}) })) !== stable(drop(e.attributes ?? {}))
}
/** Keep attributes the simulator does not manage (e.g. a reference alternative's aircraft and charger counts). */
const merged = (m: EngineeringModel, id: string, attrs: Record<string, string | number | boolean> | undefined) => ({ ...(m.elements.find((x) => x.id === id)?.attributes ?? {}), ...(attrs ?? {}) })

/**
 * Owner initials and provenance recorded on every element the save CREATES or actually CHANGES (AUTHORING_GUIDE §7
 * rule 1). Unchanged elements keep their existing owner and provenance, so an earlier AI-suggested-reviewed tag or
 * another student's ownership is never overwritten by a later save.
 */
export type OwnerProvenance = { owner: string; provenance: ElementProvenance }

export function planSave(study: TradeStudy, model: EngineeringModel, po: OwnerProvenance): SavePlan {
  const w = normaliseWeights(study.criteria)
  const plan: SavePlan = { updates: [], creates: [], links: [], warnings: [] }
  for (const c of study.criteria) {
    const fields = { name: c.name, text: `Trade criterion (${c.unit}); value function from walk-away ${c.worst} to stretch goal ${c.best}.`, attributes: critAttributes(c, w[c.id]), owner: po.owner, provenance: po.provenance }
    if (exists(model, c.id, 'CRIT')) {
      // the stored weight is normalised across all criteria, so one swing-point edit changes every weight: compare the
      // student's own inputs (swing points etc.), not the derived weight, so unchanged criteria keep their owner and tag
      if (changes(model, c.id, fields, ['weight'])) plan.updates.push({ id: c.id, patch: { ...fields, attributes: merged(model, c.id, fields.attributes) } })
      // only the derived weight moved: keep it current without re-tagging owner or provenance
      else if (changes(model, c.id, fields)) plan.updates.push({ id: c.id, patch: { attributes: merged(model, c.id, fields.attributes) } })
    }
    else plan.creates.push({ key: c.id, kind: 'CRIT', ...fields })
    if (c.moe) {
      if (exists(model, c.moe, 'MOE')) {
        if (!model.links.some((l) => l.source === c.id && l.type === 'derives-from' && l.target === c.moe)) plan.links.push({ source: c.id, type: 'derives-from', target: c.moe, rationale: 'Trade criterion traced to MOE (L7)' })
      } else plan.warnings.push(`${c.id}: ${c.moe} is not an MOE in your workspace, so the trace link was not created.`)
    } else plan.warnings.push(`${c.id}: no MOE given (RB-6.2).`)
  }
  for (const a of study.alternatives) {
    const fields = { name: a.name, text: a.description ?? '', attributes: { ...a.scores, baseline: !!a.baseline }, owner: po.owner, provenance: po.provenance }
    if (exists(model, a.id, 'ALT')) {
      if (changes(model, a.id, fields)) plan.updates.push({ id: a.id, patch: { ...fields, attributes: merged(model, a.id, fields.attributes) } })
    }
    else plan.creates.push({ key: a.id, kind: 'ALT', ...fields })
  }
  return plan
}

/** Replace the simulator's local keys by issued IDs in ALT score attributes (criterion IDs) after a save. */
export function remapScores(scores: Record<string, number>, ids: Record<string, string>): Record<string, number> {
  return Object.fromEntries(Object.entries(scores).map(([k, v]) => [ids[k] ?? k, v]))
}

/** The study with its local IDs replaced by the IDs the workspace issued (criteria, alternatives and score keys). */
export function renameStudy(study: TradeStudy, ids: Record<string, string>): TradeStudy {
  const r = (x: string) => ids[x] ?? x
  return {
    ...study,
    criteria: study.criteria.map((c) => ({ ...c, id: r(c.id) })),
    alternatives: study.alternatives.map((a) => ({ ...a, id: r(a.id), scores: remapScores(a.scores, ids) })),
  }
}

export type DecisionDraft = { recommended: string; conditions: string; residualRisk: string; wouldChangeIf: string }

/** Attributes of a DEC element summarising the computed trade study (same keys as the reference DEC-001). */
export function decisionAttributes(study: TradeStudy, d: DecisionDraft): Record<string, string | number> {
  const ranked = rank(valueTable(study))
  const w = normaliseWeights(study.criteria)
  const top2 = [...study.criteria].sort((a, b) => w[b.id] - w[a.id]).slice(0, 2)
  const sens = top2.map((c) => ({ c: c.id, s: sensitivity(study, c.id) }))
  const first = sens.find((x) => x.s.up || x.s.down)
  const r = first ? (first.s.up ?? first.s.down)! : null
  const note = sens
    .map(({ c, s }) => {
      const parts = [s.up && `above ${s.up.at.toFixed(3)} → ${s.up.to}`, s.down && `below ${s.down.at.toFixed(3)} → ${s.down.to}`].filter(Boolean)
      return `${c} (base ${w[c].toFixed(3)}): ${parts.length ? parts.join('; ') : 'no reversal in [0, 1]'}`
    })
    .join(' | ')
  const out: Record<string, string | number> = {
    decision: study.decision,
    recommended: d.recommended,
    scores: ranked.map((x) => `${x.id} ${x.total.toFixed(3)}`).join('; '),
    reversalNote: note,
    conditions: d.conditions,
    residualRisk: d.residualRisk,
    wouldChangeIf: d.wouldChangeIf,
  }
  if (first && r) {
    out.sensitivityCriterion = first.c
    out.reversalPoint = Math.round(r.at * 1000) / 1000
    out.reversalTo = r.to
  }
  return out
}

const wordsIn = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

export function checkDecision(study: TradeStudy, d: DecisionDraft): { errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const top = rank(valueTable(study))[0]?.id
  if (!study.alternatives.some((a) => a.id === d.recommended)) errors.push('Choose the recommended alternative.')
  else if (d.recommended !== top) warnings.push(`You recommend ${d.recommended} but ${top} has the highest value; say why in the conditions (the analysis informs the decision — it does not make it).`)
  if (wordsIn(d.conditions) < 8) errors.push('State the conditions under which the recommendation holds, in at least one full sentence (RB-6.6).')
  if (wordsIn(d.residualRisk) < 5) errors.push('Name the residual risk the decision leaves (RB-6.6).')
  if (wordsIn(d.wouldChangeIf) < 5) errors.push('Say what would change the recommendation, using the reversal point(s) (RB-6.5–6.6).')
  return { errors, warnings }
}
