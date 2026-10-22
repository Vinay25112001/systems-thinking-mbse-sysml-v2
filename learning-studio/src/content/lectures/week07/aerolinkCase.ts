// AeroLink Week 7 case: the instructor's own Phase I Systems Thinking Engineering Package and its design review, worked
// once end to end. The package index (what each week contributes), the package-level consistency and trace audit (coverage
// per layer, every finding with its disposition), one thread walked from a need to the roadmap, the executive summary,
// the readiness answer to the Session 1 driving question, and four review item discrepancies (RIDs) raised against the
// package with their dispositions (Session 2). The single source for the Week 7 lectures (session1.ts, session2.ts), their
// figures (src/components/figures/LectureWeek7S1.tsx, S2.tsx), the worked-examples page and the tests
// (aerolinkCase.test.ts). Exported names are kept stable; fields are only ever added.
//
// Review status: new-pending-review. Written 2026-10-21 from docs/lectures/week07/WEEK07_LECTURE_OUTLINE.md §2 and §4.
//
// AeroLink Urban Mobility is FICTIONAL. Every number, name and statement is a teaching value, not a real-world claim.
//
// Provenance. Nothing about Weeks 1–6 is retyped: stakeholders, needs and external systems from ../week01; capabilities,
// requirements, measures, unknowns and the Week 2 dispositions from ../week02; the Week 3 requirements, risks and the
// trade decision DEC-001 from ../week03; functions, physical elements, externals and their dispositions from ../week04;
// interfaces, interface requirements and the external dispositions from ../week05; the roadmap, its unknowns, its
// baseline trajectory and the Phase I baseline review from ../week06 (all read-only). Every count, coverage figure, finding
// and thread hop below is COMPUTED from those modules, so a change upstream flows through and aerolinkCase.test.ts catches
// any number that no longer holds.
//
// What this module adds, each marked `provenance: 'proposed'` (instructor to confirm): the disposition of PHY-006 (the
// communications network is the medium of interfaces, not an end of one), the executive summary's decisions needed from
// the board, and the four RIDs with their dispositions. Package-level audit rule (course convention, Week 4 lesson): a
// stakeholder requirement is accounted for when a system requirement refines it, a function carries it directly, or an
// earlier week recorded "no child needed"; a system requirement is carried by a function or by the interface it governs.
import { CONCERNS, EXTERNAL_SYSTEMS, MISSION_GOALS, NEEDS, STAKEHOLDERS, type CaseProvenance } from '../week01/aerolinkCase'
import {
  CAPABILITIES, DELIBERATE_REQ_GAP, MOES, MOPS, OBJECTIVES, PARTIAL_COVERAGE, SCENARIOS, STAKEHOLDER_REQUIREMENTS, STK_DISPOSITIONS, STK_DISPOSITION_FORM, SYSTEM_REQUIREMENTS, UNCERTAINTIES,
} from '../week02/aerolinkCase'
import { ALTERNATIVES, ASSUMPTIONS, DECISION, OPPORTUNITIES, RISKS, TECHNOLOGIES, TPMS, W3_REQUIREMENTS, W3_UNKNOWNS, alternative } from '../week03/aerolinkCase'
import { AI_CAPABILITIES, ARCH_DECISION, CAPABILITY_DISPOSITIONS, FUNCTIONS, INFORMATION, LOGICAL, PHYSICAL, VIEWPOINTS, W4_EXTERNALS, capabilitiesWithoutFunction } from '../week04/aerolinkCase'
import { CHANGE_REQUEST, COMPONENTS, EXTERNAL_DISPOSITIONS, FINDINGS as W5_FINDINGS, HIDDEN_EXTERNAL, INTERFACES, INTERFACE_REQUIREMENTS, externalsWithoutInterface } from '../week05/aerolinkCase'
import { AROU_UPDATE, BASELINE_REVIEW, FLEET_STEP, GAPS, INCREMENTS, KNOWN_IDS as W6_KNOWN_IDS, KNOWN_UNKNOWNS, TECH_PLAN, YEAR2 } from '../week06/aerolinkCase'
import { REQUIRED_CAPACITY } from '../week03/aerolinkCase'
import { COVERAGE_LAYERS, PACKAGE_SECTIONS, reviewPlan, type DispositionId, type FindingKind, type LayerId, type RidDispositionId, type SectionId, type SeverityId } from './labBrief'

export const AEROLINK_W7_REVIEW = 'new-pending-review' as const
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 100)

// ================================================================================================ the package index
/** Every requirement in the package, from every week that writes one: Week 2 (stakeholder and system), Week 3 (the two
 *  stakeholder requirements for NEED-011) and Week 5 (the interface requirements). */
export const PACKAGE_REQUIREMENTS: { id: string; level: 'stakeholder' | 'system'; name: string; parents: string[]; week: number; interface?: string; tbx?: string }[] = [
  ...STAKEHOLDER_REQUIREMENTS.map((r) => ({ id: r.id, level: r.level, name: r.name, parents: r.parents, week: 2, tbx: r.tbx })),
  ...SYSTEM_REQUIREMENTS.map((r) => ({ id: r.id, level: r.level, name: r.name, parents: r.parents, week: 2, tbx: r.tbx })),
  ...W3_REQUIREMENTS.map((r) => ({ id: r.id, level: r.level, name: r.name, parents: r.parents, week: 3 })),
  ...INTERFACE_REQUIREMENTS.map((r) => ({ id: r.id, level: r.level, name: r.name, parents: r.parents, week: 5, interface: r.interface })),
]
const stakeholderReqs = PACKAGE_REQUIREMENTS.filter((r) => r.level === 'stakeholder')
const systemReqs = PACKAGE_REQUIREMENTS.filter((r) => r.level === 'system')

/** What each package section holds, counted from the weekly cases (the package index of the worked example). */
export const PACKAGE_INDEX: { section: SectionId; title: string; week: number; items: { kind: string; count: number }[] }[] = PACKAGE_SECTIONS.map((s) => {
  const items: Record<SectionId, { kind: string; count: number }[]> = {
    summary: [{ kind: 'recommendation with conditions', count: 1 }],
    enterprise: [{ kind: 'mission and objectives (MGO)', count: MISSION_GOALS.length }, { kind: 'external systems (EXT)', count: EXTERNAL_SYSTEMS.length }],
    stakeholders: [{ kind: 'stakeholders (STK)', count: STAKEHOLDERS.length }, { kind: 'concerns (CON)', count: CONCERNS.length }, { kind: 'needs (NEED)', count: NEEDS.length }],
    requirements: [{ kind: 'scenarios (SCN)', count: SCENARIOS.length }, { kind: 'capabilities (CAP)', count: CAPABILITIES.length }, { kind: 'stakeholder requirements (REQ-STK)', count: stakeholderReqs.length }, { kind: 'system requirements (REQ-SYS)', count: systemReqs.length }, { kind: 'measures (MOE, MOP)', count: MOES.length + MOPS.length }],
    trade: [{ kind: 'technologies (TECH)', count: TECHNOLOGIES.length }, { kind: 'risks (R)', count: RISKS.length }, { kind: 'TPMs', count: TPMS.length }, { kind: 'alternatives (ALT)', count: ALTERNATIVES.length }, { kind: 'trade decision (DEC)', count: 1 }],
    architecture: [{ kind: 'viewpoints (VP)', count: VIEWPOINTS.length }, { kind: 'functions (FN)', count: FUNCTIONS.length }, { kind: 'logical elements (LOG)', count: LOGICAL.length }, { kind: 'physical elements (PHY)', count: PHYSICAL.length }, { kind: 'information items (INFO)', count: INFORMATION.length }, { kind: 'AI capabilities (AI)', count: AI_CAPABILITIES.length }],
    interfaces: [{ kind: 'components (CMP)', count: COMPONENTS.length }, { kind: 'interfaces (IF)', count: INTERFACES.length }, { kind: 'interface requirements (REQ-SYS)', count: INTERFACE_REQUIREMENTS.length }, { kind: 'change requests (ICR)', count: 1 }],
    roadmap: [{ kind: 'gaps and excesses (GAP)', count: GAPS.length }, { kind: 'technologies planned (TECH)', count: TECH_PLAN.length }, { kind: 'increments (INC), baseline included', count: INCREMENTS.length }, { kind: 'known unknowns (U)', count: KNOWN_UNKNOWNS.length }, { kind: 'AROU items', count: AROU_UPDATE.length }],
    audit: [],
    lessons: [],
    ai: [],
  }
  return { section: s.id, title: s.title, week: s.week, items: items[s.id] }
})
/** Number of IDs carried by the Weeks 1–6 sections of the package. */
export const PACKAGE_ID_COUNT = PACKAGE_INDEX.reduce((a, s) => a + s.items.filter((i) => !/recommendation|decision \(DEC\)|change requests/.test(i.kind)).reduce((b, i) => b + i.count, 0), 0)

// ================================================================================================ coverage (package rule)
const carriedByFunction = (id: string) => FUNCTIONS.some((f) => f.requirements.includes(id))
const interfaceIds = new Set(INTERFACES.map((x) => x.id))
const childrenOf = (id: string) => PACKAGE_REQUIREMENTS.filter((r) => r.parents.includes(id)).map((r) => r.id)
/** A need is covered when a stakeholder requirement, from any week, names it as a parent. */
export const needCovered = (id: string) => stakeholderReqs.some((r) => r.parents.includes(id))
/** A stakeholder requirement is flowed down when a system requirement refines it or a function carries it directly. */
export const stkFlowed = (id: string) => systemReqs.some((r) => r.parents.includes(id)) || carriedByFunction(id)
/** A system requirement is allocated when a function carries it or it governs an interface in the package. */
export const sysAllocated = (id: string) => carriedByFunction(id) || PACKAGE_REQUIREMENTS.some((r) => r.id === id && !!r.interface && interfaceIds.has(r.interface))
const endsOf = (phy: string) => [phy, ...COMPONENTS.filter((c) => c.parent === phy).map((c) => c.id)]
/** A physical element is connected when it, or one of its components, is an end of an interface. */
export const phyConnected = (id: string) => INTERFACES.some((x) => x.ends.some((e) => endsOf(id).includes(e)))
/** An increment after the baseline resolves when every ID it serves exists in the package. */
export const incrementResolves = (x: (typeof INCREMENTS)[number]) => x.serves.every((id) => W6_KNOWN_IDS.has(id))

export type Coverage = { layer: LayerId; label: string; covered: number; total: number; pct: number; uncovered: string[] }
const layer = (id: LayerId, ids: string[], ok: (id: string) => boolean): Coverage => {
  const uncovered = ids.filter((x) => !ok(x))
  return { layer: id, label: COVERAGE_LAYERS.find((l) => l.id === id)!.label, covered: ids.length - uncovered.length, total: ids.length, pct: pct(ids.length - uncovered.length, ids.length), uncovered }
}
export const COVERAGE: Coverage[] = [
  layer('need-req', NEEDS.map((n) => n.id), needCovered),
  layer('stk-sys', stakeholderReqs.map((r) => r.id), stkFlowed),
  layer('sys-arch', systemReqs.map((r) => r.id), sysAllocated),
  layer('arch-if', PHYSICAL.map((p) => p.id), phyConnected),
  layer('roadmap', INCREMENTS.filter((x) => x.horizon !== 'baseline').map((x) => x.id), (id) => incrementResolves(INCREMENTS.find((x) => x.id === id)!)),
]
export const coverage = (id: LayerId) => COVERAGE.find((c) => c.layer === id)!

// ================================================================================================ the audit findings
export type CaseFinding = {
  id: string
  kind: FindingKind
  ids: string[]
  text: string
  disposition: DispositionId
  reason: string
  owner?: string
  /** The Phase II week a deferred finding closes in (review M2: a deferral names its week). */
  week?: number
  /** The disposition was carried from an earlier week's record (the tool's "carried" advisory). */
  carried: boolean
  provenance: CaseProvenance
}
/** Week 2 recorded dispositions of the "open item" kind whose gap a later week has closed: each is now false. */
const staleStkDispositions = Object.keys(STK_DISPOSITIONS).filter((id) => STK_DISPOSITION_FORM[id] === 'open' && stkFlowed(id))
const needClosedLater = needCovered(DELIBERATE_REQ_GAP.need) ? childrenOf(DELIBERATE_REQ_GAP.need) : []
const w3Weeks = (ids: string[]) => [...new Set(ids.map((id) => PACKAGE_REQUIREMENTS.find((r) => r.id === id)?.week))].filter(Boolean).join(', ')
const unflowed = COVERAGE[1].uncovered
/** Week 2's partial-coverage open items (review M1): each was due in a later week; it is still open when its need has only
 *  the one stakeholder requirement that covers part of it. Week 6's baseline review did not carry them, so the package
 *  audit must. */
export const PARTIAL_OPEN = PARTIAL_COVERAGE.filter((p) => stakeholderReqs.filter((r) => r.parents.includes(p.need)).length === 1)
/** A Phase II week for a deferral: the week named in the owner text, else the proposed default (the Week 9 requirements
 *  model). Instructor proposal. */
const weekFrom = (owner: string, fallback = 9) => {
  const m = owner.match(/week\s*(\d+)/i)
  return m && Number(m[1]) >= 8 ? Number(m[1]) : fallback
}
const withEvidence = (reason: string, week: number) => `${reason.replace(/\.$/, '')} (evidence: the Week ${week} record).`
const raw: Omit<CaseFinding, 'id'>[] = [
  ...(needClosedLater.length
    ? [{ kind: 'stale-disposition' as const, ids: [DELIBERATE_REQ_GAP.need, ...needClosedLater], text: `Week 2 recorded ${DELIBERATE_REQ_GAP.need} as the one deliberately childless need; Week ${w3Weeks(needClosedLater)} gave it ${plural(needClosedLater.length, 'stakeholder requirement')} (${needClosedLater.join(', ')}).`, disposition: 'record' as const, reason: `Kept as history only: the Week 2 status is superseded by ${needClosedLater.join(' and ')}, and the package states the current one.`, carried: false, provenance: 'reference' as const }]
    : []),
  ...staleStkDispositions.map((id) => {
    const by = [...childrenOf(id), ...FUNCTIONS.filter((f) => f.requirements.includes(id)).map((f) => f.id)]
    return {
      kind: 'stale-disposition' as const,
      ids: [id, ...by],
      text: `Week 2 recorded ${id} as an open item (“${STK_DISPOSITIONS[id].replace(/^Open item: /, '').replace(/\.$/, '')}”); a later week has flowed it down (${by.join(', ')}).`,
      disposition: 'record' as const,
      reason: `Kept as history only: the Week 2 status is superseded by ${by.join(', ')}.`,
      carried: false,
      provenance: 'reference' as const,
    }
  }),
  ...unflowed.map((id) => ({ kind: 'childless-stk' as const, ids: [id], text: `${id} has no system requirement and no function carries it.`, disposition: 'record' as const, reason: withEvidence(STK_DISPOSITIONS[id] ?? 'No recorded reason', 2), carried: !!STK_DISPOSITIONS[id], provenance: 'reference' as const })),
  ...capabilitiesWithoutFunction().map((id) => ({ kind: 'cap-no-function' as const, ids: [id], text: `${id} has no function.`, disposition: 'record' as const, reason: withEvidence(CAPABILITY_DISPOSITIONS[id] ?? 'No recorded reason', 4), carried: !!CAPABILITY_DISPOSITIONS[id], provenance: 'reference' as const })),
  ...COVERAGE[3].uncovered.map((id) => ({
    kind: 'phy-no-interface' as const,
    ids: [id, ...(id === 'PHY-006' ? HIDDEN_EXTERNAL : [])],
    text: `${id} (${PHYSICAL.find((p) => p.id === id)!.name}) is not an end of any interface.`,
    disposition: 'record' as const,
    reason: id === 'PHY-006' ? `It is the medium that carries ${plural(HIDDEN_EXTERNAL.length, 'interface')} (${HIDDEN_EXTERNAL.join(', ')}), not an end of one; who owns it is the open item from Week 5.` : 'No recorded reason',
    carried: false,
    provenance: 'proposed' as const,
  })),
  ...externalsWithoutInterface().map((id) => ({ kind: 'ext-no-interface' as const, ids: [id], text: `${id} (${W4_EXTERNALS.find((x) => x.id === id)!.name}) has no interface.`, disposition: 'record' as const, reason: withEvidence(EXTERNAL_DISPOSITIONS[id] ?? 'No recorded reason', 5), carried: !!EXTERNAL_DISPOSITIONS[id], provenance: 'reference' as const })),
  // review M1: Week 2's partial-coverage open items that no later week completed or carried
  ...PARTIAL_OPEN.map((p) => {
    const tbr = p.disposition.match(/\bTB[DR]-\d{2}\b/)?.[0]
    const u = tbr ? UNCERTAINTIES.find((x) => x.tbx === tbr) : undefined
    const due = p.disposition.match(/Week (\d+)/)?.[1]
    return u
      ? { kind: 'dropped-open-item' as const, ids: [p.need, p.by, u.id], text: `Week 2 recorded ${p.need} as covered only in part by ${p.by} (missing: ${p.missing}), an open item that waits on ${tbr}; no later week carried it.`, disposition: 'record' as const, reason: `Accepted while ${tbr} is open: ${u.id} carries it as a deferred open item, and the missing part is written once the ratio is known.`, carried: false, provenance: 'proposed' as const }
      : { kind: 'dropped-open-item' as const, ids: [p.need, p.by], text: `Week 2 recorded ${p.need} as covered only in part by ${p.by} (missing: ${p.missing}), an open item due in Week ${due ?? '?'}; it was not done, and Week 6’s baseline review did not carry it.`, disposition: 'defer' as const, reason: `Write the second stakeholder requirement (${p.missing}), traced to ${p.need}.`, owner: 'Requirements & Compliance lead', week: 9, carried: false, provenance: 'proposed' as const }
  }),
  ...BASELINE_REVIEW.flatMap((r) => r.items.map((i) => ({ kind: 'open-item' as const, ids: [i.id], text: `Week ${r.week} open item ${i.id}: ${i.text}`, disposition: 'defer' as const, reason: 'Carried from the Week 6 baseline review', owner: i.owner, week: weekFrom(i.owner), carried: true, provenance: 'reference' as const }))),
]
export const FINDINGS: CaseFinding[] = raw.map((f, i) => ({ id: `F-${String(i + 1).padStart(2, '0')}`, ...f }))
export const findingsOf = (kind: FindingKind) => FINDINGS.filter((f) => f.kind === kind)
/** Every open item an earlier week recorded, with where it went (review M1): `closedBy` when a later week closed it (computed),
 *  else the audit finding that carries it. aerolinkCase.test.ts asserts that none is silent. */
export const EARLIER_OPEN_ITEMS: { id: string; from: string; closedBy?: string; finding?: string }[] = (() => {
  const findingFor = (id: string) => FINDINGS.find((f) => f.ids.includes(id))?.id
  const out: { id: string; from: string; closedBy?: string; finding?: string }[] = []
  for (const p of PARTIAL_COVERAGE) out.push(PARTIAL_OPEN.includes(p) ? { id: p.need, from: 'Week 2 partial coverage', finding: findingFor(p.need) } : { id: p.need, from: 'Week 2 partial coverage', closedBy: stakeholderReqs.filter((r) => r.parents.includes(p.need)).map((r) => r.id).join(', ') })
  for (const id of Object.keys(STK_DISPOSITIONS).filter((k) => STK_DISPOSITION_FORM[k] === 'open')) out.push(stkFlowed(id) ? { id, from: 'Week 2 trace audit', closedBy: [...childrenOf(id), ...FUNCTIONS.filter((f) => f.requirements.includes(id)).map((f) => f.id)].join(', '), finding: findingFor(id) } : { id, from: 'Week 2 trace audit', finding: findingFor(id) })
  out.push(needCovered(DELIBERATE_REQ_GAP.need) ? { id: DELIBERATE_REQ_GAP.need, from: 'Week 2 deliberate gap', closedBy: childrenOf(DELIBERATE_REQ_GAP.need).join(', '), finding: findingFor(DELIBERATE_REQ_GAP.need) } : { id: DELIBERATE_REQ_GAP.need, from: 'Week 2 deliberate gap', finding: findingFor(DELIBERATE_REQ_GAP.need) })
  for (const r of BASELINE_REVIEW) for (const i of r.items) out.push({ id: i.id, from: `Week ${r.week} (Week 6 baseline review)`, finding: findingFor(i.id) })
  return out
})()

/** Counts used on the slides and in the notes (never typed). */
export const AUDIT = {
  findings: FINDINGS.length,
  recorded: FINDINGS.filter((f) => f.disposition === 'record').length,
  deferred: FINDINGS.filter((f) => f.disposition === 'defer').length,
  staleDispositions: findingsOf('stale-disposition').length,
  openItems: findingsOf('open-item').length,
  carried: FINDINGS.filter((f) => f.carried).length,
  traceGaps: FINDINGS.filter((f) => ['childless-stk', 'cap-no-function', 'phy-no-interface', 'ext-no-interface'].includes(f.kind)).length,
  droppedOpenItems: findingsOf('dropped-open-item').length,
  /** The dropped Week 2 open items the package defers (owner, week) and the ones it carries through an unknown (review N4). */
  droppedDeferred: findingsOf('dropped-open-item').filter((f) => f.disposition === 'defer').map((f) => f.ids[0]),
  droppedViaUnknown: findingsOf('dropped-open-item').filter((f) => f.disposition === 'record').map((f) => ({ need: f.ids[0], unknown: f.ids.find((i) => i.startsWith('U-')) ?? '' })),
  /** Partial coverage recorded in Week 2 that no later requirement completed: the coverage layer counts these needs as
   *  covered (the parent link exists); the audit finds them through the Week 2 record of the open item (review M1). */
  partialStillOpen: PARTIAL_OPEN.map((p) => p.need),
}

// ================================================================================================ one thread, walked
export type Hop = { id: string; name: string; week: number; link: string }
/** The thread from a need, COMPUTED by following the package's own links: need → capability → stakeholder requirement →
 *  system requirement → function → physical element → interface → measure → unknown (by the requirement's TBD) →
 *  roadmap increment it gates → the decision whose condition names it. Each hop is the first that exists; the walk stops
 *  where a link is missing. */
export function threadFrom(needId: string): Hop[] {
  const need = NEEDS.find((n) => n.id === needId)
  if (!need) return []
  const hops: Hop[] = [{ id: need.id, name: need.name, week: 1, link: 'the need' }]
  const cap = CAPABILITIES.find((c) => c.needs.includes(needId) && c.needs[0] === needId) ?? CAPABILITIES.find((c) => c.needs.includes(needId))
  if (cap) hops.push({ id: cap.id, name: cap.name, week: 2, link: `answers ${needId}` })
  const stk = stakeholderReqs.find((r) => r.parents.includes(needId))
  if (!stk) return hops
  hops.push({ id: stk.id, name: stk.name, week: stk.week, link: `names ${needId} as its parent` })
  const sys = systemReqs.find((r) => r.parents.includes(stk.id))
  if (!sys) return hops
  hops.push({ id: sys.id, name: sys.name, week: sys.week, link: `refines ${stk.id}` })
  const fn = FUNCTIONS.find((f) => f.requirements.includes(sys.id))
  if (!fn) return hops
  hops.push({ id: fn.id, name: fn.name, week: 4, link: `carries ${sys.id}` })
  const phy = PHYSICAL.find((p) => p.id === fn.phy)
  if (!phy) return hops
  hops.push({ id: phy.id, name: phy.name, week: 4, link: `performs ${fn.id}` })
  const ifs = INTERFACES.filter((x) => x.ends.some((e) => endsOf(phy.id).includes(e)))
  const ifc = ifs.find((x) => x.ends.some((e) => e.startsWith('EXT-'))) ?? ifs[0]
  if (ifc) {
    const other = ifc.ends.find((e) => e !== phy.id)!
    const otherName = W4_EXTERNALS.find((x) => x.id === other)?.name ?? PHYSICAL.find((p) => p.id === other)?.name ?? other
    hops.push({ id: ifc.id, name: `${phy.name} – ${otherName}`, week: 5, link: `joins ${phy.id} to ${other}` })
  }
  const mop = MOPS.find((m) => m.measures.includes(sys.id))
  if (mop) hops.push({ id: mop.id, name: mop.name, week: 2, link: `measures ${sys.id}` })
  const unknown = sys.tbx ? [...UNCERTAINTIES, ...W3_UNKNOWNS].find((u) => 'tbx' in u && u.tbx === sys.tbx) : undefined
  if (!unknown) return hops
  hops.push({ id: unknown.id, name: unknown.name, week: 2, link: `owns ${sys.tbx} in ${sys.id}` })
  const gated = KNOWN_UNKNOWNS.find((k) => k.id === unknown.id)
  const inc = gated ? INCREMENTS.find((x) => x.id === gated.gates) : undefined
  if (inc) hops.push({ id: inc.id, name: inc.name, week: 6, link: `${unknown.id} gates it` })
  if (DECISION.conditions.some((c) => c.includes(unknown.id))) hops.push({ id: DECISION.id, name: `the Year-2 decision (${DECISION.recommended})`, week: 3, link: `a condition names ${unknown.id}` })
  return hops
}
export const THREAD_START = 'NEED-010'
export const THREAD = threadFrom(THREAD_START)

// ================================================================================================ the executive summary
/** “2 deferred (NEED-006, NEED-008) and NEED-017 carried through U-006”, from the findings (review N4). */
export const dropText = () => [AUDIT.droppedDeferred.length ? `${AUDIT.droppedDeferred.length} deferred (${AUDIT.droppedDeferred.join(', ')})` : '', ...AUDIT.droppedViaUnknown.map((x) => `${x.need} carried through ${x.unknown}`)].filter(Boolean).join(' and ')
const rec = alternative(DECISION.recommended)
const inc1 = INCREMENTS.find((x) => x.id === 'INC-001')!
export const EXEC_SUMMARY = {
  recommendation: `Accept the Phase I package as the baseline for the Week 8 model, with its ${plural(AUDIT.deferred, 'open item')} carried and owned; carry out the committed Year-2 step (${DECISION.id}, ${rec.id}: ${rec.addedAircraft} more aircraft and ${rec.upgradedChargers} spoke chargers upgraded to make a fourth hub) and start ${inc1.id} ${inc1.name} when its trigger fires.`,
  why: [
    `${DECISION.id} recommends ${DECISION.recommended}: ${YEAR2.capacity} trips/day by month ${YEAR2.month} against the ${REQUIRED_CAPACITY} that MGO-007 and REQ-STK-004 need`,
    `coverage: ${COVERAGE.map((c) => `${c.label.toLowerCase()} ${c.pct} %`).join('; ')}`,
    `every gap in the package carries a disposition: ${AUDIT.recorded} accepted with rationale and evidence, ${AUDIT.deferred} deferred with owners and weeks, among them the Week 2 open items Week 6 had dropped: ${dropText()}`,
  ],
  evidence: [DECISION.id, 'REQ-STK-004', 'MGO-007', 'GAP-003', inc1.id],
  conditions: DECISION.conditions,
  residual: [...DECISION.residualRisk, ...AROU_UPDATE.filter((a) => a.transition && a.increment === inc1.id).map((a) => `${a.id} ${a.name.toLowerCase()} (transition)`)],
  decisionsNeeded: [
    `accept the package as the Phase I baseline with the ${plural(AUDIT.deferred, 'open item')} carried into Week 8`,
    'approve the connection study at the chosen spoke before the hub conversion (U-002)',
    `approve the one-hub storage demonstration that is ${inc1.id}’s entry trigger (U-009)`,
  ],
  next: inc1.id,
  provenance: 'proposed' as CaseProvenance,
}

// ================================================================================================ the readiness answer
/** The Session 1 driving question and its answer, from the audit. */
export const DRIVING_QUESTION = {
  question: 'The board asks: is AeroLink’s Phase I package ready to become the baseline of a SysML v2 model?',
  options: [
    { id: 'A', text: 'Not ready: items are still open' },
    { id: 'B', text: 'Ready: every week was submitted' },
    { id: 'C', text: 'Ready with conditions, if every gap is dispositioned and owned' },
  ],
  answer: 'C',
  reasons: [
    `Not A: a baseline includes what could not be met; the package has ${plural(AUDIT.deferred, 'open item')}, each owned, and that is a recorded state, not a defect.`,
    `Not B: submission is not consistency; the audit found ${plural(AUDIT.staleDispositions, 'disposition')} from Week 2 that later weeks made false.`,
    `C: every one of the ${plural(AUDIT.findings, 'finding')} has a disposition, including the Week 2 open items that Week 6 had dropped (${dropText()}), so the review can confirm the entry criteria and decide.`,
  ],
}

// ================================================================================================ the review (Session 2)
export type CaseRid = { id: string; from: string; location: string; finding: string; criterion: string; severity: SeverityId; disposition: RidDispositionId; response: string; owner?: string; evidence: string[]; provenance: CaseProvenance }
const partial = PARTIAL_OPEN[0]
const partialFinding = partial ? FINDINGS.find((f) => f.kind === 'dropped-open-item' && f.ids[0] === partial.need) : undefined
const f6 = W5_FINDINGS.find((f) => f.id === 'F6')!
/** Open items whose recorded owner is a week, not a person or a role (found by the review, RID-004). */
export const WEEK_OWNED_ITEMS = FINDINGS.filter((f) => f.kind === 'open-item' && /^Week \d+$/.test(f.owner ?? ''))
const gap1 = GAPS.find((g) => g.id === 'GAP-001')!
/** Four RIDs raised against the AeroLink package by a peer team and the instructor, each with its disposition. */
const RID_LIST: CaseRid[] = [
  ...(partial
    ? [{
        id: 'RID-001', from: 'Peer team (Requirements & Compliance)', location: partial.need,
        finding: `${partial.by} covers ${partial.covered}, not ${partial.missing}. Week 2 made the second requirement an open item due in Week ${partial.disposition.match(/Week (\d+)/)?.[1] ?? '?'}; it was not written, Week 6 dropped it, and the package now defers it (${partialFinding?.id ?? 'a finding'}) to Week ${partialFinding?.week ?? '?'} a second time. A deferred gap that has already slipped once should be closed before the baseline is accepted.`,
        criterion: 'requirement validation: the requirements must carry the whole intent of the need; and an item due before the review is an entry-criterion exception the chair checks',
        severity: 'major' as const, disposition: 'accept' as const,
        response: `Accepted: the deferral is replaced by the work itself; the second stakeholder requirement (${partial.missing}) is written, traced to ${partial.need}, before the package is closed. The coverage layer counted ${partial.need} as covered because the parent link exists; the audit found the gap only through the Week 2 record of the open item, and the reviewer read the need against its requirement.`,
        owner: 'Requirements & Compliance lead', evidence: [partial.need, partial.by], provenance: 'proposed' as const,
      }]
    : []),
  {
    id: 'RID-002', from: 'Instructor (chair)', location: 'PHY-006',
    finding: `The communications network (PHY-006) carries ${plural(HIDDEN_EXTERNAL.length, 'interface')}, and whether AeroLink owns or leases it is still not decided, although the Week 6 review set this review as the date (${f6.id} of Week 5).`,
    criterion: 'interfaces documented, with their owners (the SRR criterion the review borrows)',
    severity: 'major', disposition: 'defer',
    response: 'Deferred and re-dated in the open: the decision was due before this review and was not made. The Head of Operations Technology owns it with a new date, before the Week 11 physical model is built; every interface it affects stays listed in the finding.',
    owner: 'AeroLink, Head of Operations Technology', evidence: ['PHY-006', ...HIDDEN_EXTERNAL.slice(0, 3)], provenance: 'proposed',
  },
  {
    id: 'RID-003', from: 'Peer team (Architecture)', location: gap1.id,
    finding: `The near-term capacity of ${YEAR2.capacity} trips/day exceeds the ${REQUIRED_CAPACITY} required: ${YEAR2.capacity - REQUIRED_CAPACITY} trips/day of capacity is waste and should be divested.`,
    criterion: 'an excess capability is a candidate for divestment',
    severity: 'minor', disposition: 'reject',
    response: `Rejected, with evidence: the Week 3 box offered ${FLEET_STEP.options.map((o) => `+${o.added}`).join(', ')} aircraft and +${FLEET_STEP.smallest.added} is the smallest step that meets ${REQUIRED_CAPACITY}; the excess is kept on purpose and lets demand grow to ${YEAR2.supports} trips/day before the next capacity step (${gap1.id}, ${DECISION.id}).`,
    evidence: [gap1.id, DECISION.id], provenance: 'proposed',
  },
  ...(WEEK_OWNED_ITEMS.length
    ? [{
        id: 'RID-004', from: 'Peer team (Verification & Validation)', location: WEEK_OWNED_ITEMS.map((f) => f.ids[0]).join(', '),
        finding: `${plural(WEEK_OWNED_ITEMS.length, 'open item')} (${WEEK_OWNED_ITEMS.map((f) => f.ids[0]).join(', ')}) name a week as the owner (${[...new Set(WEEK_OWNED_ITEMS.map((f) => f.owner))].join(', ')}), not a person or a role: a week closes nothing.`,
        criterion: 'TBX management identifies the owner of the work that closes each open issue',
        severity: 'minor' as const, disposition: 'accept' as const,
        response: 'Accepted: each item gets a role as its owner and keeps the week as its date: the Architecture lead for the system modes and the passenger interface, the Verification & Validation lead for the interface verification cases.',
        owner: 'Verification & Validation lead', evidence: WEEK_OWNED_ITEMS.map((f) => f.id), provenance: 'proposed' as const,
      }]
    : []),
]
export const RIDS: CaseRid[] = RID_LIST.map((r, i) => ({ ...r, id: `RID-${String(i + 1).padStart(3, '0')}` }))
export const RID_COUNTS = {
  total: RIDS.length,
  accept: RIDS.filter((r) => r.disposition === 'accept').length,
  defer: RIDS.filter((r) => r.disposition === 'defer').length,
  reject: RIDS.filter((r) => r.disposition === 'reject').length,
  major: RIDS.filter((r) => r.severity === 'major').length,
}

/** The course review plan for a class of five teams (labBrief.reviewPlan). */
export const REVIEW_PLAN_FIVE = reviewPlan(5)
export const REVIEW_PLAN_FOUR = reviewPlan(4)

// ================================================================================================ links and counts
/** Every ID the Week 7 case may point at: the Week 6 set plus the Week 5 interface requirements and components. */
export const KNOWN_IDS = new Set<string>([...W6_KNOWN_IDS, ...INTERFACE_REQUIREMENTS.map((r) => r.id), ...COMPONENTS.map((c) => c.id), ...EXTERNAL_SYSTEMS.map((x) => x.id), ...W4_EXTERNALS.map((x) => x.id), ...OBJECTIVES.map((o) => o.id), ...ASSUMPTIONS.map((a) => a.id), ...OPPORTUNITIES.map((o) => o.id), ARCH_DECISION.id, CHANGE_REQUEST.id])
export { plural, pct }
