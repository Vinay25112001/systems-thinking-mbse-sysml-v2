// Project → EngineeringModel (src/model/engineering.ts), so impactSet, requirementCoverage and threadsFrom run on a
// team's data as they do on AeroLink. Only the element kinds and the ten link types engineering.ts knows are kept
// (REQ-STK/REQ-SYS become REQ); extension types are dropped from this projection only (data model §6.1).
import { ELEMENT_KINDS, LINK_RULES, type Element, type ElementKind, type EngineeringModel, type LinkType } from '../../model/engineering'
import type { ProjectDoc } from './types'

const KINDS = new Set<string>(ELEMENT_KINDS)
const kindOf = (type: string): ElementKind | null => (type === 'REQ-STK' || type === 'REQ-SYS' ? 'REQ' : KINDS.has(type) ? (type as ElementKind) : null)

export function toEngineeringModel(doc: ProjectDoc): EngineeringModel {
  const byUid = new Map<string, Element>()
  for (const a of Object.values(doc.artifacts)) {
    const kind = kindOf(a.type)
    if (!kind || a.status !== 'active') continue
    byUid.set(a.uid, { id: a.id, kind, name: a.title || a.description, text: a.description || undefined, provenance: a.provenance.kind === 'copied-from-practice' ? 'instructor-fictional' : 'team-derived', status: 'active', ...(a.owner ? { owner: a.owner } : {}) })
  }
  const links = Object.values(doc.relationships)
    .filter((r) => !r.draft && r.status !== 'retired' && r.type in LINK_RULES && byUid.has(r.from) && byUid.has(r.to))
    .map((r) => ({ id: r.id, source: byUid.get(r.from)!.id, type: r.type as LinkType, target: byUid.get(r.to)!.id, ...(r.rationale ? { rationale: r.rationale } : {}) }))
    .filter((l) => {
      const rule = LINK_RULES[l.type]
      const s = [...byUid.values()].find((e) => e.id === l.source)!
      const t = [...byUid.values()].find((e) => e.id === l.target)!
      return rule.from.includes(s.kind) && rule.to.includes(t.kind)
    })
  return { elements: [...byUid.values()], links }
}
