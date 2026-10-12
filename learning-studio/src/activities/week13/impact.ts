// Week 13 change-impact logic (pure). Computes the impact set of a proposed change by traversing the AeroLink
// engineering model, the way RB-9.5 asks: a first-order set derived from model relationships (method shown), second-order
// effects, and the consequences for verification and risk.
//
// COURSE CONVENTION (instructor-authored; no reading prescribes it): the DEPENDS table below says, for each of the ten
// course relationship types and each direction, whether the element at the other end DEPENDS on the changed element
// (so it must be re-examined against the change) or is only UPSTREAM of it (so the change is checked for consistency
// with it, but nothing propagates through it). Two further rules keep the set honest:
//   1. First order = every dependent neighbour of the changed element (hop 1). Upstream neighbours are listed for review.
//   2. Second order is not automatic. It is opened only from the hop-1 elements the engineer decides MUST CHANGE in
//      response (e.g. the charger design, if the tightened limit can no longer be met); from those, dependents are
//      followed one more hop. A re-check that passes changes nothing and propagates nothing.
// The undirected `impactSet` of engineering.ts is shown alongside as the naive over-approximation.
import { impactSet, kindOfId, type Element, type ElementKind, type EngineeringModel, type Link, type LinkType } from '../../model/engineering'

export type Direction = 'out' | 'in' // 'out': the changed element is the link's source; 'in': it is the link's target

/** Does the neighbour depend on the changed element? `true` = dependent (re-examine); `false` = upstream (review only). */
export function depends(type: LinkType, dir: Direction, neighbourKind: ElementKind | undefined): boolean {
  switch (type) {
    case 'derives-from':
    case 'refines':
      // child -> parent. A change to the parent reaches its children; a change to a child is checked against its parent.
      return dir === 'in'
    case 'satisfies':
    case 'allocated-to':
    case 'verifies':
    case 'measures':
    case 'performs':
      return true
    case 'mitigates':
      // mitigator -> risk. Changing the mitigator re-opens the risk; changing the risk is reviewed against its mitigators.
      return dir === 'out'
    case 'affects':
      // source (R, A, O, U, TECH, DEC, EXT) -> target. A change to the target re-opens a risk or a technology assessment
      // that is about it; assumptions, unknowns, opportunities, decisions and external systems are reviewed only.
      return dir === 'out' || neighbourKind === 'R' || neighbourKind === 'TECH'
    case 'flows-to':
      // producer -> consumer.
      return dir === 'out'
  }
}

/** What the engineer must do with a dependent element of this kind (course convention; cited where a source applies). */
export function actionFor(kind: ElementKind | undefined, via: LinkType, dir: Direction): string {
  if (kind === 'VER') return 'Re-plan and re-run: the success criterion and the verdict were set against the old value; a verdict holds only for the configuration it was obtained on (R49 p.150, Week 12).'
  if (kind === 'TPM' || kind === 'MOP' || kind === 'MOE') return 'Update the threshold or estimate and recompute the margin and its status (Week 5 rules).'
  if (kind === 'R') return 'Re-assess likelihood, consequence and trigger; the risk is about an element that changes.'
  if (kind === 'TECH') return 'Re-assess the technology: its TRL evidence was for the old value.'
  if (kind === 'REQ') return via === 'satisfies' ? 'Re-check that the requirement is still satisfied.' : 'Re-check the child requirement against the changed parent (value, derivation rationale).'
  if (kind === 'PHY' || kind === 'IF' || kind === 'LOG' || kind === 'AI') return via === 'satisfies' && dir === 'in' ? 'Re-check that the design still satisfies the changed requirement: a satisfy asserts it (S06 p.168).' : 'Re-check the design element against the change (allocation, capacity, behaviour).'
  if (kind === 'FN') return 'Re-check that the function still achieves the allocated requirement.'
  if (kind === 'INFO') return 'Re-check the information exchanged (content, timing).'
  return 'Re-examine against the change.'
}

export type ImpactItem = {
  id: string
  name: string
  kind: ElementKind | undefined
  hop: 1 | 2
  /** Link used to reach the element, written as a sentence, e.g. "PHY-003 satisfies REQ-SYS-001 (LNK-08-071)". */
  via: string
  /** For hop 2: the hop-1 element it was reached from. */
  from?: string
  action: string
}

export type ImpactResult = {
  start: string
  firstOrder: ImpactItem[]
  upstream: ImpactItem[]
  secondOrder: ImpactItem[]
  /** Naive undirected reach (engineering.ts impactSet) at depths 1, 2 and 3, for comparison. */
  naive: { depth: number; count: number }[]
  activeElements: number
}

const READS: Record<LinkType, string> = {
  'derives-from': 'derives from', refines: 'refines', satisfies: 'satisfies', 'allocated-to': 'is allocated to', verifies: 'verifies',
  measures: 'measures', mitigates: 'mitigates', affects: 'affects', performs: 'performs', 'flows-to': 'flows to',
}
export const linkSentence = (l: Link) => `${l.source} ${READS[l.type]} ${l.target} (${l.id})`

function activeIndex(m: EngineeringModel) {
  const live = new Map(m.elements.filter((e) => e.status === 'active').map((e) => [e.id, e] as const))
  const links = m.links.filter((l) => live.has(l.source) && live.has(l.target))
  return { live, links }
}

function neighbours(links: Link[], id: string): { other: string; link: Link; dir: Direction }[] {
  const out: { other: string; link: Link; dir: Direction }[] = []
  for (const l of links) {
    if (l.source === id && l.target !== id) out.push({ other: l.target, link: l, dir: 'out' })
    else if (l.target === id && l.source !== id) out.push({ other: l.source, link: l, dir: 'in' })
  }
  return out
}

const byId = (a: ImpactItem, b: ImpactItem) => a.id.localeCompare(b.id)

/**
 * Directed impact of a change to `start`. `mustChange` lists the hop-1 elements the engineer has decided must change in
 * response; second order is expanded only from those (rule 2). Elements already in the first-order set, upstream set or
 * the start are not repeated at hop 2.
 */
export function directedImpact(m: EngineeringModel, start: string, mustChange: string[] = []): ImpactResult {
  const { live, links } = activeIndex(m)
  const name = (id: string) => live.get(id)?.name ?? id
  const firstOrder: ImpactItem[] = []
  const upstream: ImpactItem[] = []
  const seen = new Set<string>([start])
  for (const n of neighbours(links, start)) {
    if (seen.has(n.other)) continue
    const k = kindOfId(n.other)
    const item: ImpactItem = { id: n.other, name: name(n.other), kind: k, hop: 1, via: linkSentence(n.link), action: '' }
    if (depends(n.link.type, n.dir, k)) firstOrder.push({ ...item, action: actionFor(k, n.link.type, n.dir) })
    else upstream.push({ ...item, action: n.link.type === 'derives-from' || n.link.type === 'refines' ? 'Review: is the changed value still consistent with the parent it derives from?' : 'Review only: upstream of the change; check that it is still valid.' })
    seen.add(n.other)
  }
  const secondOrder: ImpactItem[] = []
  const first = new Set(firstOrder.map((i) => i.id))
  for (const src of mustChange.filter((x) => first.has(x)).sort()) {
    for (const n of neighbours(links, src)) {
      if (seen.has(n.other)) continue
      const k = kindOfId(n.other)
      if (!depends(n.link.type, n.dir, k)) continue
      secondOrder.push({ id: n.other, name: name(n.other), kind: k, hop: 2, via: linkSentence(n.link), from: src, action: actionFor(k, n.link.type, n.dir) })
      seen.add(n.other)
    }
  }
  return {
    start,
    firstOrder: firstOrder.sort(byId),
    upstream: upstream.sort(byId),
    secondOrder: secondOrder.sort(byId),
    naive: [1, 2, 3].map((depth) => ({ depth, count: impactSet(m, start, depth).length })),
    activeElements: live.size,
  }
}

export type ImpactSummary = { verification: string[]; measures: string[]; risks: string[]; design: string[]; requirements: string[]; other: string[] }

/** Groups the impacted elements (hop 1 and hop 2) by the consequence RB-9.5 asks about. */
export function summarise(r: ImpactResult): ImpactSummary {
  const s: ImpactSummary = { verification: [], measures: [], risks: [], design: [], requirements: [], other: [] }
  for (const i of [...r.firstOrder, ...r.secondOrder]) {
    const k = i.kind
    if (k === 'VER') s.verification.push(i.id)
    else if (k === 'TPM' || k === 'MOP' || k === 'MOE') s.measures.push(i.id)
    else if (k === 'R' || k === 'TECH' || k === 'A' || k === 'U' || k === 'O') s.risks.push(i.id)
    else if (k === 'PHY' || k === 'IF' || k === 'LOG' || k === 'FN' || k === 'INFO' || k === 'AI') s.design.push(i.id)
    else if (k === 'REQ' || k === 'NEED' || k === 'CAP') s.requirements.push(i.id)
    else s.other.push(i.id)
  }
  return s
}

// ------------------------------------------------------------------------------------------------
// TPM consequences of a change to a requirement limit (or to a TPM estimate).

export type TpmLike = { id: string; name: string; unit: string; sense: 'lower-is-better' | 'higher-is-better'; threshold: number; currentEstimate: number; storedMargin?: number }

export function tpmsMeasuring(m: EngineeringModel, req: string): TpmLike[] {
  const { live, links } = activeIndex(m)
  return links
    .filter((l) => l.type === 'measures' && l.target === req && kindOfId(l.source) === 'TPM')
    .map((l) => live.get(l.source)!)
    .map((e: Element) => ({
      id: e.id, name: e.name, unit: String(e.attributes?.unit ?? ''), sense: e.attributes?.sense === 'higher-is-better' ? 'higher-is-better' : 'lower-is-better',
      threshold: Number(e.attributes?.threshold), currentEstimate: Number(e.attributes?.currentEstimate),
      storedMargin: e.attributes?.margin === undefined ? undefined : Number(e.attributes?.margin),
    }))
}

const r6 = (x: number) => Math.round(x * 1e6) / 1e6
export const margin = (sense: TpmLike['sense'], threshold: number, estimate: number) => r6(sense === 'lower-is-better' ? threshold - estimate : estimate - threshold)

// ------------------------------------------------------------------------------------------------
// Export: a Markdown impact report with the method stated, so another person can reproduce the set.

export function impactMarkdown(r: ImpactResult, change: string, mustChange: string[], recommendation: string): string {
  const row = (i: ImpactItem) => `| ${i.hop} | ${i.id} | ${i.name.replace(/\|/g, '/')} | ${i.via}${i.from ? ` (from ${i.from})` : ''} | ${i.action.replace(/\|/g, '/')} |`
  const s = summarise(r)
  return [
    `# Impact report: ${r.start}`,
    '',
    `**Change.** ${change || '(not stated)'}`,
    '',
    '**Method (course convention, Week 13).** Hop 1: every neighbour of the changed element that depends on it by the dependency table (derives-from/refines: children; satisfies, allocated-to, verifies, measures, performs: both ends; mitigates: the risk; affects: the target, or the risk/technology about the changed element; flows-to: the consumer). Upstream neighbours are listed for review and not propagated. Hop 2: dependents of the hop-1 elements decided to MUST CHANGE only.',
    `**Must change (engineer’s decision).** ${mustChange.length ? mustChange.join(', ') : 'none: every first-order re-check passes, so nothing propagates'}`,
    `**Naive undirected reach for comparison** (engineering.ts impactSet): ${r.naive.map((n) => `depth ${n.depth}: ${n.count}`).join('; ')} of ${r.activeElements - 1} other active elements.`,
    '',
    '| Hop | ID | Name | Reached by | Action |',
    '|---|---|---|---|---|',
    ...r.firstOrder.map(row),
    ...r.secondOrder.map(row),
    '',
    `Upstream (review only): ${r.upstream.map((i) => `${i.id} via ${i.via}`).join('; ') || 'none'}`,
    '',
    `Consequences: verification to re-run ${s.verification.join(', ') || 'none'}; measures ${s.measures.join(', ') || 'none'}; risks and technology ${s.risks.join(', ') || 'none'}; design ${s.design.join(', ') || 'none'}; requirements ${s.requirements.join(', ') || 'none'}.`,
    '',
    `**Recommendation.** ${recommendation || '(not stated)'}`,
  ].join('\n')
}

/** A recommendation must say what to do and on what condition (course screen; RB-9.5 "recommendation"). */
export function recommendationProblem(text: string): string | null {
  const t = text.trim()
  if (t.split(/\s+/).filter(Boolean).length < 12) return 'Write the recommendation in at least one full sentence (≥ 12 words): what to decide, and why.'
  if (!/\b(accept|reject|defer|approve|adopt|keep|change|redesign|re-?baseline|proceed|do not)\b/i.test(t)) return 'Say what you recommend: accept, reject, defer or change something.'
  if (!/\b(REQ|TPM|VER|PHY|R|TECH|DEC|IF|FN|LOG|MOP|MOE|U|A)-(STK-|SYS-)?\d{3}\b/.test(t)) return 'Name at least one affected element by its ID, so the reader can check it in the model.'
  if (!/\b(if|unless|provided|until|because|since|so that)\b/i.test(t)) return 'State the condition or the reason (if / unless / provided / because …).'
  return null
}
