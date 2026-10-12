// Swing-weight elicitation walkthrough (R18 p.466): rank the swings from walk-away to stretch goal, give the most
// valuable swing 100 points, assess the others relative to it, then normalise. The consistency checks below are an
// instructor-authored operationalisation of that procedure.
import type { Criterion } from './trade'

export type Elicitation = { rank: Record<string, number | undefined>; points: Record<string, number | undefined> }

export type ElicitationCheck = { ok: boolean; issues: string[]; weights: Record<string, number> | null }

export function checkElicitation(criteria: Criterion[], e: Elicitation): ElicitationCheck {
  const issues: string[] = []
  const n = criteria.length
  const ranks = criteria.map((c) => e.rank[c.id])
  if (ranks.some((r) => r === undefined)) issues.push('Rank every swing first (1 = the swing you would take first).')
  else {
    const set = new Set(ranks)
    if (set.size !== n || ranks.some((r) => r! < 1 || r! > n)) issues.push(`Ranks must be 1 to ${n}, each used once.`)
  }
  const pts = criteria.map((c) => e.points[c.id])
  if (pts.some((p) => p === undefined || !Number.isFinite(p))) issues.push('Give every swing a number of points.')
  if (issues.length) return { ok: false, issues, weights: null }
  const byRank = [...criteria].sort((a, b) => e.rank[a.id]! - e.rank[b.id]!)
  if (e.points[byRank[0].id] !== 100) issues.push(`The swing ranked first (${byRank[0].id}) is the anchor and gets 100 points (R18 p.466).`)
  for (const c of criteria) if (!(e.points[c.id]! > 0 && e.points[c.id]! <= 100)) issues.push(`${c.id}: points must be greater than 0 and at most 100.`)
  for (let i = 1; i < byRank.length; i++) {
    const hi = byRank[i - 1]
    const lo = byRank[i]
    if (e.points[lo.id]! > e.points[hi.id]!)
      issues.push(`${lo.id} is ranked below ${hi.id} but has more points (${e.points[lo.id]} > ${e.points[hi.id]}); points must not increase down the ranking.`)
  }
  const total = criteria.reduce((s, c) => s + (e.points[c.id] ?? 0), 0)
  const weights = total > 0 ? Object.fromEntries(criteria.map((c) => [c.id, e.points[c.id]! / total])) : null
  return { ok: issues.length === 0, issues, weights }
}

export type RangeProbe = { id: string; prompt: string; answer: 'rise' | 'fall' | 'same'; why: string }

/** Probes that test whether the student understands that a swing weight depends on the measure's range. */
export const RANGE_PROBES: RangeProbe[] = [
  {
    id: 'p1',
    prompt: 'The board widens CRIT-002’s walk-away point from USD 20 M to USD 40 M (the stretch goal stays at USD 0 M). Should CRIT-002’s swing points rise, fall or stay the same?',
    answer: 'rise',
    why: 'The swing from worst to best is now twice as large in dollars, so moving across it is worth more. Swing weights depend on importance and on the range (R18 p.466); an “importance” weight that ignores the range would wrongly stay the same.',
  },
  {
    id: 'p2',
    prompt: 'Every alternative scores between 85 % and 100 % on CRIT-003, but the scale still runs from 50 % to 100 %. The team narrows the scale to 85–100 %. What happens to CRIT-003’s swing points?',
    answer: 'fall',
    why: 'The new swing (85 → 100 %) is smaller than the old one (50 → 100 %), so it is worth less and its points should fall. Keeping the old points while narrowing the range would overweight the criterion, because every alternative’s value on it is now spread over 0–1.',
  },
  {
    id: 'p3',
    prompt: 'An alternative is added whose wait is 30 min. The CRIT-001 scale (60 → 5 min) already covers it. What happens to CRIT-001’s swing points?',
    answer: 'same',
    why: 'The walk-away point and stretch goal are unchanged, so the swing — and therefore the weight — is unchanged. Weights are a judgement about ranges, not about which alternatives happen to be on the table.',
  },
]
