// Week 12 activity 2 (B12.4; pure): trace audit with reproducible numbers.
// Coverage of parent, satisfy and verify per requirement uses the shared `requirementCoverage`; orphans and childless
// NEED/CAP use `orphansAndChildless` (src/model/engineering.ts). The audit adds what RB-9.1, 9.2 and 9.4 ask for:
// upward trace to a NEED or CAP (through requirement chains), NEED -> STK, satisfy plus a recorded verification method
// for REQ-SYS, the childless higher-level requirement of R45 p.118 (a REQ-STK addressed by no lower-level requirement
// and no design element), stakeholder requirements with no verification evidence, and a disposition for every gap.
// The counting RULES, the active population and a digest of it are stated in the export so that anyone can reproduce
// the numbers from the same model: they are the course's rules, not a source's.
import { completeThreads, kindOfId, orphansAndChildless, requirementCoverage, type EngineeringModel } from '../../model/engineering'

export type Ratio = { n: number; of: number }
export const pct = (r: Ratio) => (r.of ? Math.round((1000 * r.n) / r.of) / 10 : 0)
export const fmt = (r: Ratio) => `${r.n} of ${r.of} (${r.of ? `${pct(r)} %` : 'n/a'})`

export type Gap = {
  id: string
  kind: 'orphan' | 'childless' | 'childless-stk' | 'no-upward-trace' | 'need-without-stakeholder' | 'unsatisfied-sys' | 'unverified-sys' | 'no-method' | 'unverified-stk'
}

export type ReqRow = { id: string; parents: string[]; upward: boolean; children: string[]; satisfiedBy: string[]; verifiedBy: string[] }

export type Audit = {
  /** Active elements and links between active elements (the population every number is counted over). */
  elements: number
  links: number
  /** Short digest of the sorted active element IDs and links: two audits with the same digest counted the same model. */
  digest: string
  parent: { all: Ratio; stk: Ratio; sys: Ratio }
  satisfied: { all: Ratio; stk: Ratio; sys: Ratio }
  verified: { all: Ratio; stk: Ratio; sys: Ratio }
  /** Course rule: a REQ-STK verified by its own VER or through at least one verified child requirement. */
  stkVerifiedOrThroughChild: Ratio
  /** RB-9.1: every REQ reaches a NEED or CAP through derives-from/refines (requirement chains allowed). */
  upwardToNeedOrCap: Ratio
  /** RB-9.1: every NEED derives from a STK. */
  needToStakeholder: Ratio
  /** RB-9.2: every REQ-SYS has a satisfy and a recorded verification method (attribute `method`). */
  sysSatisfiedWithMethod: Ratio
  orphans: string[]
  childless: string[]
  completeThreads: number
  threadStakeholders: number
  requirements: ReqRow[]
  gaps: Gap[]
}

const ratio = (xs: boolean[]): Ratio => ({ n: xs.filter(Boolean).length, of: xs.length })

/** FNV-1a, 32 bit: a short, stable fingerprint (not a security hash). */
export function digestOf(lines: string[]): string {
  let h = 0x811c9dc5
  for (const ch of lines.join('\n')) {
    h ^= ch.codePointAt(0)!
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

export function audit(m: EngineeringModel): Audit {
  const active = m.elements.filter((e) => e.status === 'active')
  const live = new Set(active.map((e) => e.id))
  const L = m.links.filter((l) => live.has(l.source) && live.has(l.target))
  const cov = requirementCoverage(m)
  const isStk = (id: string) => id.startsWith('REQ-STK')
  const stk = cov.filter((c) => isStk(c.id))
  const sys = cov.filter((c) => !isStk(c.id))
  const byId = new Map(m.elements.map((e) => [e.id, e]))
  const parentLink = (t: string) => t === 'derives-from' || t === 'refines'

  const reachesNeedOrCap = (req: string) => {
    const seen = new Set<string>([req])
    let frontier = [req]
    while (frontier.length) {
      const next: string[] = []
      for (const x of frontier)
        for (const l of L)
          if (l.source === x && parentLink(l.type)) {
            const k = kindOfId(l.target)
            if (k === 'NEED' || k === 'CAP') return true
            if (k === 'REQ' && !seen.has(l.target)) { seen.add(l.target); next.push(l.target) }
          }
      frontier = next
    }
    return false
  }
  const upward = cov.map((c) => reachesNeedOrCap(c.id))
  const rows: ReqRow[] = cov.map((c, i) => ({
    id: c.id,
    parents: L.filter((l) => l.source === c.id && parentLink(l.type)).map((l) => l.target),
    upward: upward[i],
    children: L.filter((l) => l.target === c.id && parentLink(l.type) && kindOfId(l.source) === 'REQ').map((l) => l.source),
    satisfiedBy: L.filter((l) => l.target === c.id && l.type === 'satisfies').map((l) => l.source),
    verifiedBy: L.filter((l) => l.target === c.id && l.type === 'verifies').map((l) => l.source),
  }))
  const row = new Map(rows.map((r) => [r.id, r]))
  const verifiedDirect = (id: string) => (row.get(id)?.verifiedBy.length ?? 0) > 0
  const stkThroughChild = stk.map((c) => verifiedDirect(c.id) || (row.get(c.id)?.children ?? []).some(verifiedDirect))
  const needs = active.filter((e) => e.kind === 'NEED')
  const needOk = needs.map((n) => L.some((l) => l.source === n.id && l.type === 'derives-from' && kindOfId(l.target) === 'STK'))
  const hasMethod = (id: string) => String(byId.get(id)?.attributes?.method ?? '').trim() !== ''
  const sysWithMethod = sys.map((c) => c.satisfied && hasMethod(c.id))
  const { orphans, childless } = orphansAndChildless(m)
  const threads = completeThreads(m)
  const childlessStk = stk.filter((c) => (row.get(c.id)?.children.length ?? 0) === 0 && !c.satisfied).map((c) => c.id)

  const gaps: Gap[] = [
    ...orphans.map((id) => ({ id, kind: 'orphan' as const })),
    ...childless.map((id) => ({ id, kind: 'childless' as const })),
    ...childlessStk.map((id) => ({ id, kind: 'childless-stk' as const })),
    ...cov.filter((_, i) => !upward[i]).filter((c) => !orphans.includes(c.id)).map((c) => ({ id: c.id, kind: 'no-upward-trace' as const })),
    ...needs.filter((_, i) => !needOk[i]).map((n) => ({ id: n.id, kind: 'need-without-stakeholder' as const })),
    ...sys.filter((c) => !c.satisfied).map((c) => ({ id: c.id, kind: 'unsatisfied-sys' as const })),
    ...sys.filter((c) => !c.verified).map((c) => ({ id: c.id, kind: 'unverified-sys' as const })),
    ...sys.filter((c) => !hasMethod(c.id)).map((c) => ({ id: c.id, kind: 'no-method' as const })),
    ...stk.filter((_, i) => !stkThroughChild[i]).map((c) => ({ id: c.id, kind: 'unverified-stk' as const })),
  ]

  const digest = digestOf([...[...live].sort(), ...L.map((l) => `${l.source} ${l.type} ${l.target}`).sort()])
  return {
    elements: active.length,
    links: L.length,
    digest,
    parent: { all: ratio(cov.map((c) => c.hasParent)), stk: ratio(stk.map((c) => c.hasParent)), sys: ratio(sys.map((c) => c.hasParent)) },
    satisfied: { all: ratio(cov.map((c) => c.satisfied)), stk: ratio(stk.map((c) => c.satisfied)), sys: ratio(sys.map((c) => c.satisfied)) },
    verified: { all: ratio(cov.map((c) => c.verified)), stk: ratio(stk.map((c) => c.verified)), sys: ratio(sys.map((c) => c.verified)) },
    stkVerifiedOrThroughChild: ratio(stkThroughChild),
    upwardToNeedOrCap: ratio(upward),
    needToStakeholder: ratio(needOk),
    sysSatisfiedWithMethod: ratio(sysWithMethod),
    orphans,
    childless,
    completeThreads: threads.length,
    threadStakeholders: new Set(threads.map((t) => t.ids[0])).size,
    requirements: rows,
    gaps,
  }
}

export const GAP_LABEL: Record<Gap['kind'], string> = {
  orphan: 'Orphan: requirement with no derives-from or refines link',
  childless: 'Childless parent (course extension to needs): NEED or CAP with no requirement derived from or refining it',
  'childless-stk': 'Childless parent (R45 p.118): stakeholder requirement addressed by no lower-level requirement and no design element',
  'no-upward-trace': 'Requirement whose parent chain never reaches a NEED or CAP (RB-9.1)',
  'need-without-stakeholder': 'NEED that derives from no stakeholder (RB-9.1)',
  'unsatisfied-sys': 'System requirement with no satisfying design element (RB-9.2)',
  'unverified-sys': 'System requirement with no verification activity (RB-9.2, RB-10.3)',
  'no-method': 'System requirement with no recorded verification method (RB-9.2)',
  'unverified-stk': 'Stakeholder requirement with no verification activity, of its own or through a verified child requirement (course V&V convention)',
}

export const RULES = [
  'Population: active elements and links between active elements only; requirements are elements of kind REQ (REQ-STK = stakeholder level, REQ-SYS = system level).',
  'Parent: the requirement is the source of at least one derives-from or refines link (to any element).',
  'Upward trace: following derives-from/refines from the requirement, through requirements only, reaches a NEED or a CAP.',
  'Satisfied: at least one satisfies link targets the requirement (any design element, including interfaces).',
  'Verified: at least one VER verifies the requirement. This counts planned activities, not verdicts.',
  'REQ-STK verified directly or through a child: the REQ-STK has its own VER, or at least one requirement derived from it has one. A child’s VER is evidence towards the parent, not proof: the children must together imply the parent.',
  'Method recorded: the requirement has a non-empty `method` attribute (Week 4).',
  'Orphan: a requirement with no parent. Childless parent: a REQ-STK with no child requirement and no satisfier (R45 p.118); by course extension, an active NEED or CAP that no active requirement derives from or refines.',
  'Complete thread: the course thread convention (engineering.ts THREAD_STEPS), counted by completeThreads (distinct 11-step paths).',
]

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
const list = (xs: string[]) => (xs.length ? xs.join(', ') : '—')

/** A reproducible audit report: the model identity, the numbers, the counting rules and one disposition per gap. */
export function auditMarkdown(a: Audit, source: string, dispositions: Record<string, string> = {}, generatedAt = ''): string {
  const row = (label: string, r: { all: Ratio; stk: Ratio; sys: Ratio }) => `| ${label} | ${fmt(r.all)} | ${fmt(r.stk)} | ${fmt(r.sys)} |`
  return [
    `# Trace audit — ${source}`,
    '',
    `Model: ${a.elements} active elements, ${a.links} links between them; digest ${a.digest} (FNV-1a over the sorted active IDs and links)${generatedAt ? `; generated ${generatedAt}` : ''}.`,
    '',
    '| Measure | All REQ | REQ-STK | REQ-SYS |',
    '|---|---|---|---|',
    row('Has a parent', a.parent),
    row('Satisfied', a.satisfied),
    row('Verified (has a VER)', a.verified),
    '',
    `- REQ-STK verified directly or through a verified child (course rule): ${fmt(a.stkVerifiedOrThroughChild)}`,
    `- Upward trace to a NEED or CAP (RB-9.1): ${fmt(a.upwardToNeedOrCap)}`,
    `- NEED derived from a stakeholder (RB-9.1): ${fmt(a.needToStakeholder)}`,
    `- REQ-SYS with satisfy and a recorded method (RB-9.2): ${fmt(a.sysSatisfiedWithMethod)}`,
    `- Orphans: ${a.orphans.join(', ') || 'none'}`,
    `- Childless parents: ${[...a.childless, ...a.gaps.filter((g) => g.kind === 'childless-stk').map((g) => g.id)].join(', ') || 'none'}`,
    `- Complete 11-step threads: ${a.completeThreads} from ${a.threadStakeholders} stakeholder(s)`,
    '',
    '## Per-requirement coverage',
    '',
    '| Requirement | Parents | Reaches NEED/CAP | Child requirements | Satisfied by | Verified by |',
    '|---|---|---|---|---|---|',
    ...a.requirements.map((r) => `| ${r.id} | ${list(r.parents)} | ${r.upward ? 'yes' : 'no'} | ${list(r.children)} | ${list(r.satisfiedBy)} | ${list(r.verifiedBy)} |`),
    '',
    '## Gaps and dispositions (RB-9.4)',
    '',
    '| Element | Finding | Disposition |',
    '|---|---|---|',
    ...(a.gaps.length ? a.gaps.map((g) => `| ${g.id} | ${GAP_LABEL[g.kind]} | ${cell(dispositions[`${g.kind}:${g.id}`] ?? '(none recorded)')} |`) : ['| — | No gaps found | — |']),
    '',
    '## Counting rules (course rules; state them with the numbers)',
    '',
    ...RULES.map((r) => `- ${r}`),
  ].join('\n')
}

export const gapKey = (g: Gap) => `${g.kind}:${g.id}`

const OWNER = /\bowner\s*:?\s*[A-Z]{2,4}\b|\((?:owner\s+)?[A-Z]{2,4}\)|\b(?:lead|instructor|team lead)\b/
const TRACKING = /\bCP[1-5]\b|\bWeek 1[2-5]\b|@Issue|@StatusInfo|\b[AROU]-\d{3}\b|\bAROU\b|\bgap table\b|\bG-\d{2}\b|\bDECISION_LOG\b/i
/** A disposition is usable when it says what will happen (or why the gap stays), who owns it or where it is tracked (RB-9.4). */
export function dispositionProblem(text: string): string | null {
  const t = text.trim()
  if (t.split(/\s+/).filter(Boolean).length < 6) return 'Write a sentence: what you will do (or why the gap stays) and who owns it.'
  if (/^(ok|fine|n\/?a|todo|tbd|later|will fix|to do)\b/i.test(t)) return 'A placeholder is not a disposition: state the action or the reason the gap is accepted.'
  if (/\b(?:at some point|look into|when (?:we|time)|eventually|if time)\b/i.test(t)) return 'Name the action and a checkpoint, not an intention (“at some point”, “look into”).'
  if (!OWNER.test(t) && !TRACKING.test(t)) return 'Add the owner (initials, e.g. “owner AL”) or where the gap is tracked (a checkpoint such as CP5, an @Issue, an AROU item or the gap table).'
  return null
}

/** A prediction is usable when it is a percentage from 0 to 100. */
export const predictionOk = (s: string) => /^\s*\d+(?:\.\d+)?\s*%?\s*$/.test(s) && parseFloat(s) <= 100
