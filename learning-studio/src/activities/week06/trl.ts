// Week 6 — TRL assessor logic (pure). The nine level names are the TRL scale of SEBoK Table 1 (R16 p.767). The
// "ladder" (a level is supported only if every lower level is also evidenced), the evidence-or-assumption rule and the
// lowest-critical-TRL summary are course conventions built on R16 p.766–768, R60 p.525–526 and RB-5.2; the TRL < 6
// flag follows the DoD practice reported in R60 p.526 and is applied to AeroLink as an instructor analogy.
import type { Element } from '../../model/engineering'
import ref06 from '../../model/reference/week06'

export type Environment = 'none' | 'laboratory' | 'relevant' | 'operational' | 'mission'

export const TRL_LEVELS: { level: number; name: string; environment: Environment; question: string }[] = [
  { level: 1, name: 'Basic principles observed and reported', environment: 'none', question: 'Have the basic principles been observed and reported?' },
  { level: 2, name: 'Technology concept and/or application formulated', environment: 'none', question: 'Has the technology concept or its application been formulated?' },
  { level: 3, name: 'Analytical and experimental critical function and/or characteristic proof of concept', environment: 'none', question: 'Is there an analytical and experimental proof of concept of the critical function or characteristic?' },
  { level: 4, name: 'Component validation in laboratory environment', environment: 'laboratory', question: 'Has the component been validated in a laboratory environment?' },
  { level: 5, name: 'Component validation in relevant environment', environment: 'relevant', question: 'Has the component been validated in a relevant environment?' },
  { level: 6, name: 'Prototype demonstration in a relevant environment', environment: 'relevant', question: 'Has a prototype been demonstrated in a relevant environment?' },
  { level: 7, name: 'Prototype demonstration in an operational environment', environment: 'operational', question: 'Has a prototype been demonstrated in an operational environment?' },
  { level: 8, name: 'System qualified through test and demonstration', environment: 'operational', question: 'Has the system been qualified through test and demonstration?' },
  { level: 9, name: 'System proven through successful mission operations', environment: 'mission', question: 'Has the system been proven through successful mission operations?' },
]

export const trlName = (n: number) => TRL_LEVELS.find((l) => l.level === n)?.name ?? '—'

/** The three enabling technologies of the reference baseline (descriptions only; the TRLs are the key). */
export const TECHNOLOGIES: Element[] = ref06.elements.filter((e) => e.kind === 'TECH')

export type Answer = 'yes' | 'no' | 'unknown'

export type TrlInput = {
  tech: string
  /** Answers to the nine ladder questions, by level. */
  ladder: Record<number, Answer | undefined>
  claimed?: number
  basis?: 'evidence' | 'assumption'
  /** Cited evidence (document, test, demonstration) when basis = evidence. */
  evidence: string
  /** Assumption ID (A-nnn) when basis = assumption. */
  assumptionId: string
  /** The assumption statement (what is assumed, and how it will be confirmed). */
  assumptionText: string
  /** How "relevant environment" is defined for this technology (R60 p.525: terms must be interpreted in context). */
  relevantEnv: string
  critical: boolean
  /** Maturity risk ID (R-nnn), required when a critical technology is below TRL 6. */
  maturityRisk: string
}

export const emptyTrl = (tech: string): TrlInput => ({ tech, ladder: {}, evidence: '', assumptionId: '', assumptionText: '', relevantEnv: '', critical: true, maturityRisk: '' })

/** Highest level supported by the ladder: the last consecutive "yes" starting at TRL 1 (0 when TRL 1 is not supported). */
export function ladderLevel(ladder: TrlInput['ladder']): number {
  let n = 0
  for (const l of TRL_LEVELS) {
    if (ladder[l.level] !== 'yes') break
    n = l.level
  }
  return n
}

/** Levels answered "yes" above a gap — a sign that a higher claim skips a lower level. */
export function ladderGaps(ladder: TrlInput['ladder']): number[] {
  const top = ladderLevel(ladder)
  return TRL_LEVELS.filter((l) => l.level > top + 1 && ladder[l.level] === 'yes').map((l) => l.level)
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

/** The course maturity-risk rule (RB-5.2): required exactly when a critical technology is below TRL 6. */
export const needsMaturityRisk = (trl: number, critical: boolean) => critical && trl < 6

export type TrlFinding = { severity: 'error' | 'warning'; message: string }

/** Checks one assessment against the RB-5.2 standard: a TRL from the scale definitions, backed by cited evidence or a labelled assumption. */
export function checkTrl(a: TrlInput): TrlFinding[] {
  const f: TrlFinding[] = []
  const supported = ladderLevel(a.ladder)
  if (!a.claimed) f.push({ severity: 'error', message: 'Assign a TRL (1–9) from the scale definitions.' })
  if (!a.basis) f.push({ severity: 'error', message: 'State the basis: cited evidence, or a labelled assumption with an A-nnn ID (RB-5.2).' })
  if (a.basis === 'evidence' && words(a.evidence) < 6)
    f.push({ severity: 'error', message: 'Cite the evidence specifically: which report, test or demonstration, by whom, in what environment.' })
  if (a.basis === 'assumption') {
    if (!/^A-\d{3}$/.test(a.assumptionId.trim())) f.push({ severity: 'error', message: 'An assumption needs a register ID of the form A-nnn.' })
    if (words(a.assumptionText) < 8) f.push({ severity: 'error', message: 'Write the assumption out: what is assumed, and how and when it will be confirmed.' })
  }
  if (a.claimed && a.claimed > supported)
    f.push({ severity: 'error', message: `TRL ${a.claimed} is claimed, but your answers support only TRL ${supported}. A level is reached only when every lower level is also met.` })
  if (a.claimed && supported > a.claimed)
    f.push({ severity: 'warning', message: `Your answers support TRL ${supported}, above the TRL ${a.claimed} you assigned. Either lower an answer or raise the TRL, and say why.` })
  const gaps = ladderGaps(a.ladder)
  if (gaps.length) f.push({ severity: 'warning', message: `You answered “yes” at TRL ${gaps.join(', ')} above an unmet lower level. Check those answers.` })
  if (a.claimed && a.claimed >= 5 && words(a.relevantEnv) < 5)
    f.push({ severity: 'error', message: 'Define what “relevant environment” means for this technology at AeroLink (R60 p.525). Without it a TRL of 5 or more cannot be checked.' })
  if (a.claimed && needsMaturityRisk(a.claimed, a.critical) && !/^R-\d{3}$/.test(a.maturityRisk.trim()))
    f.push({ severity: 'error', message: 'A critical technology below TRL 6 needs a maturity risk (R-nnn) in the register (R60 p.526, R60 p.530).' })
  return f
}

export const isComplete = (a: TrlInput) => checkTrl(a).every((x) => x.severity !== 'error')

/** The lowest TRL among technologies marked critical, and which technologies hold it. */
export function lowestCritical(as: TrlInput[]): { level: number; techs: string[] } | null {
  const crit = as.filter((a) => a.critical && a.claimed)
  if (!crit.length) return null
  const level = Math.min(...crit.map((a) => a.claimed!))
  return { level, techs: crit.filter((a) => a.claimed === level).map((a) => a.tech) }
}

/**
 * Instructor key: the reference TRLs rest on assumptions A-003..A-005 (FICTIONAL). `maturityRisk` is '' when the course
 * rule requires none (TRL ≥ 6). TECH-001's related risk R-005 is an external-dependency (grid) risk, not a maturity
 * risk, so it is shown separately (W6-F09); the reference file still lists it as maturityRisk (lead request).
 */
export const TRL_KEY: Record<string, { trl: number; assumption: string; critical: boolean; maturityRisk: string; relatedRisk?: string; why: string }> = {
  'TECH-001': { trl: 6, assumption: 'A-003', critical: true, maturityRisk: '', relatedRisk: 'R-005 (external dependency: grid connection)', why: 'Assumed supplier prototype demonstration at an operating vertiport (relevant environment); not yet AeroLink revenue service, so not TRL 7. At TRL 6 the course rule requires no maturity risk; R-005 threatens the same capability through the grid connection, which is a dependency, not technology maturity.' },
  'TECH-002': { trl: 5, assumption: 'A-004', critical: true, maturityRisk: 'R-002', why: 'Assumed pack-level cycling at fast-charge rates in a relevant environment — a component validation, not a prototype aircraft demonstration, so not TRL 6.' },
  'TECH-003': { trl: 4, assumption: 'A-005', critical: false, maturityRisk: 'R-006', why: 'Assumed laboratory validation only. Not critical to the piloted baseline, which is why R-006 can be accepted.' },
}
