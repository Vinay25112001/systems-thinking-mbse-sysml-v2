// Week 2 — concern and AROU v0 recorder logic (pure). Acceptance rules come from the course plan, not an external
// standard: L2 asks for a specific concern per stakeholder (RB-1.3: generic concerns such as "wants safety" score low)
// and for ≥ 4 AROU entries, with risks written as condition–if–then (LABORATORY_AND_CAPSTONE_PLAN.md, L2 and L6).
// The generic-concern and risk-form checks are INSTRUCTOR-AUTHORED screening heuristics: they catch concerns that name
// nothing beyond a generic quality and risks with no stated condition. A human reviewer still judges specificity.
import type { ElementKind, ElementProvenance, EngineeringModel } from '../../model/engineering'
import { ownerProblem } from '../../components/ProvenanceOwnerFields'

export type EntryKind = Extract<ElementKind, 'CON' | 'A' | 'R' | 'O' | 'U'>
export const ENTRY_KINDS: { id: EntryKind; label: string; link: 'derives-from' | 'affects' }[] = [
  { id: 'CON', label: 'Concern (CON)', link: 'derives-from' },
  { id: 'A', label: 'Assumption (A)', link: 'affects' },
  { id: 'R', label: 'Risk (R)', link: 'affects' },
  { id: 'O', label: 'Opportunity (O)', link: 'affects' },
  { id: 'U', label: 'Unknown (U)', link: 'affects' },
]
export const linkFor = (k: EntryKind) => ENTRY_KINDS.find((e) => e.id === k)!.link

export type Entry = {
  kind: EntryKind
  name: string
  text: string
  /** STK (for a CON) or STK/CON (for an AROU entry) that the entry derives from or affects. */
  target: string
  /** Owner initials and provenance come from the shared ProvenanceOwnerFields (lab plan §C.2 rule 5). */
  owner: string
  provenance: ElementProvenance
}

// Words that carry no specific content in a concern statement: articles, auxiliaries, the "who wants" frame and
// generic subjects. Removing them leaves what the concern is actually about.
const FILLER = new Set(
  (
    'a an the to be is are was were been being of and or for with about by in on at its their our his her they it we he she them ' +
    'want wants wanted need needs needed care cares cared concerned concern concerns worried worry worries expect expects ' +
    'like likes prefer prefers always very more much should must will would can could all any some ' +
    'stakeholder stakeholders community communities resident residents passenger passengers people public user users ' +
    'customer customers everyone everybody operator operators aerolink service system company'
  ).split(' '),
)
// Generic qualities: a concern that names only these (and filler) says nothing about what, for whom or where it bites.
const GENERIC_TERMS = new Set(
  (
    'safety safe safer cost costs cheap cheaper affordable affordability money price quality performance reliability reliable ' +
    'environment environmental noise noisy quiet efficiency efficient value convenience convenient comfort comfortable ' +
    'security secure sustainability sustainable profit profits good better best low lower high higher great nice'
  ).split(' '),
)

/**
 * True when a concern names nothing specific: once filler words are removed, every remaining word is a generic quality
 * (safety, cost, noise, quality…) and there is no number. "The community is concerned about noise." is generic;
 * "Departures after 22:00 wake residents near the pad" is not.
 */
export function isGenericConcern(text: string): boolean {
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? []
  if (tokens.some((t) => /\d/.test(t))) return false
  const content = tokens.filter((t) => !FILLER.has(t))
  return content.every((t) => GENERIC_TERMS.has(t))
}

const CONDITION_CUE = /^(?:given|condition:|because|since|as|while|with|under)\s+(.*?)\bif\b/i
/**
 * Risk form: condition–if–then. The statement must open with a condition clause (Given / Condition: / Because / Since /
 * As / While / With / Under) of at least two words before the "if", and contain "if … then".
 */
export function riskFormIssues(text: string): string[] {
  const issues: string[] = []
  const t = text.trim()
  if (!/\bif\b[\s\S]*\bthen\b/i.test(t)) issues.push('A risk needs an “if …, then …” part: the uncertain event and its consequence.')
  const m = CONDITION_CUE.exec(t.replace(/\s+/g, ' '))
  const conditionWords = m ? (m[1].match(/[A-Za-z0-9]+/g) ?? []).length : 0
  if (conditionWords < 2) issues.push('State the condition first: the current fact that makes the risk possible (“Given …, if …, then …” or “Condition: … If …, then …”).')
  return issues
}

/** Returns the reasons an entry is not acceptable; an empty list means it can be recorded. */
export function checkEntry(e: Entry): string[] {
  const issues: string[] = []
  const text = e.text.trim()
  if (!e.name.trim()) issues.push('Give the entry a short name.')
  if (!e.target) issues.push(e.kind === 'CON' ? 'Choose the stakeholder it derives from.' : 'Choose the stakeholder or concern it affects.')
  if (text.split(/\s+/).filter(Boolean).length < 5) issues.push('The statement is too short to be specific (at least five words).')
  if (e.kind === 'CON' && isGenericConcern(text)) issues.push('This concern is generic: it names only a general quality (safety, cost, noise…). Say what, for whom, and where or when it bites (RB-1.3).')
  if (e.kind === 'R') issues.push(...riskFormIssues(text))
  const owner = ownerProblem(e.owner)
  if (owner) issues.push(owner)
  return issues
}

export type L2Coverage = { stakeholders: number; withConcern: number; missingConcern: string[]; arou: number; arouLinked: number }

/** L2 coverage: STK with ≥ 1 CON derived from it, and AROU entries with an "affects" link to a stakeholder or concern. */
export function l2Coverage(m: EngineeringModel): L2Coverage {
  const active = m.elements.filter((e) => e.status === 'active')
  const stk = active.filter((e) => e.kind === 'STK').map((e) => e.id)
  const conIds = new Set(active.filter((e) => e.kind === 'CON').map((e) => e.id))
  const stkIds = new Set(stk)
  const covered = new Set(m.links.filter((l) => l.type === 'derives-from' && conIds.has(l.source)).map((l) => l.target))
  const arou = active.filter((e) => ['A', 'R', 'O', 'U'].includes(e.kind)).map((e) => e.id)
  const linked = new Set(m.links.filter((l) => l.type === 'affects' && (stkIds.has(l.target) || conIds.has(l.target))).map((l) => l.source))
  return {
    stakeholders: stk.length,
    withConcern: stk.filter((id) => covered.has(id)).length,
    missingConcern: stk.filter((id) => !covered.has(id)),
    arou: arou.length,
    arouLinked: arou.filter((id) => linked.has(id)).length,
  }
}
