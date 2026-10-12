// Week 12 activity 1 (B12.4; pure): digital-thread explorer.
// Uses the shared `threadsFrom` (src/model/engineering.ts) and explains each result: the step the thread reached, the
// link that is missing for the next step, and - for a complete thread - the link that justifies every step.
// The 11 steps are the layers of the required digital thread in the course's capstone source (S02); what counts as
// each link is the COURSE CONVENTION written in engineering.ts (THREAD_STEPS), not a SysML or source rule.
import { THREAD_STEPS, kindOfId, threadsFrom, type EngineeringModel, type Link } from '../../model/engineering'

/** What must exist for a thread to reach step i+1 (index = the step already reached, 1..10). */
export const MISSING_LINK: Record<number, string> = {
  1: 'No NEED derives from this stakeholder (NEED derives-from STK).',
  2: 'No capability derives from this need (CAP derives-from NEED).',
  3: 'No requirement derives from or refines this capability, directly or through a chain of requirements (REQ derives-from / refines CAP).',
  4: 'The requirement is not allocated to a function (REQ allocated-to FN).',
  5: 'No logical element performs this function (LOG performs FN).',
  6: 'The logical element is not allocated to a physical element (LOG allocated-to PHY).',
  7: 'No information item flows to or from this physical element (INFO flows-to / from PHY).',
  8: 'No verification activity verifies the requirement (VER verifies REQ).',
  9: 'No MOE or MOP measures the requirement or the capability (MOE/MOP measures REQ or CAP).',
  10: 'No risk affects, or is mitigated by, any element already in the thread (R affects X, or X mitigates R).',
}

export type ThreadRow = {
  ids: string[]
  reached: number
  complete: boolean
  /** The step that could not be reached (reached + 1), or null when complete. */
  missingStep: number | null
  missing: string | null
}

export function describeThreads(m: EngineeringModel, stakeholder: string): ThreadRow[] {
  return threadsFrom(m, stakeholder).map((t) => ({
    ids: t.ids,
    reached: t.reachedStep,
    complete: t.complete,
    missingStep: t.complete ? null : t.reachedStep + 1,
    missing: t.complete ? null : MISSING_LINK[t.reachedStep] ?? null,
  }))
}

export type ThreadSummary = { stakeholder: string; threads: number; complete: number; best: number; stoppedAt: Record<number, number> }

/** Per stakeholder: how many threads, how many complete, the furthest step and where incomplete threads stop. */
export function summarise(m: EngineeringModel): ThreadSummary[] {
  return m.elements
    .filter((e) => e.kind === 'STK' && e.status === 'active')
    .map((s) => {
      const rows = describeThreads(m, s.id)
      const stoppedAt: Record<number, number> = {}
      for (const r of rows) if (!r.complete) stoppedAt[r.reached] = (stoppedAt[r.reached] ?? 0) + 1
      return { stakeholder: s.id, threads: rows.length, complete: rows.filter((r) => r.complete).length, best: Math.max(0, ...rows.map((r) => r.reached)), stoppedAt }
    })
}

export type Hop = { step: number; label: string; element: string; links: Link[]; note: string }

/**
 * The link(s) that justify each step of a thread returned by `threadsFrom`. Steps 8–11 do not chain from the
 * previous element: VER verifies the REQ (step 4), the measure measures the REQ or the CAP, and the risk attaches to
 * any element already in the thread - exactly as `threadsFrom` searches them.
 */
export function hopsOf(m: EngineeringModel, ids: string[]): Hop[] {
  const live = new Set(m.elements.filter((e) => e.status === 'active').map((e) => e.id))
  const L = m.links.filter((l) => live.has(l.source) && live.has(l.target))
  const find = (source: string, type: Link['type'], target: string) => L.filter((l) => l.source === source && l.type === type && l.target === target)
  const [stk, need, cap, req, fn, log, phy, info, ver, measure, risk] = ids
  const hops: Hop[] = [{ step: 1, label: THREAD_STEPS[0], element: stk, links: [], note: 'Start of the thread.' }]
  const push = (step: number, element: string | undefined, links: Link[], note: string) => {
    if (element) hops.push({ step, label: THREAD_STEPS[step - 1], element, links, note })
  }
  push(2, need, need ? find(need, 'derives-from', stk) : [], 'The need derives from the stakeholder.')
  push(3, cap, cap && need ? find(cap, 'derives-from', need) : [], 'The capability derives from the need.')
  if (req && cap) {
    const chain = reqChain(L, req, cap)
    push(4, req, chain, chain.length > 1 ? `Reached through ${chain.length - 1} intermediate requirement(s): ${chain.slice(0, -1).map((l) => l.target).join(', ')}.` : 'The requirement derives from or refines the capability directly.')
  }
  push(5, fn, fn && req ? find(req, 'allocated-to', fn) : [], 'The requirement is allocated to the function.')
  push(6, log, log && fn ? find(log, 'performs', fn) : [], 'The logical element performs the function.')
  push(7, phy, phy && log ? find(log, 'allocated-to', phy) : [], 'The logical element is allocated to the physical element.')
  push(8, info, info && phy ? [...find(phy, 'flows-to', info), ...find(info, 'flows-to', phy)] : [], 'The information item flows to or from the physical element.')
  push(9, ver, ver && req ? find(ver, 'verifies', req) : [], `Attaches to the requirement (${req}), not to the information item.`)
  push(10, measure, measure ? [...(req ? find(measure, 'measures', req) : []), ...(cap ? find(measure, 'measures', cap) : [])].slice(0, 1) : [], `Attaches to the requirement or the capability, not to the verification activity.`)
  if (risk) {
    const inThread = new Set(ids.slice(0, 10))
    const l = L.find((x) => (x.type === 'affects' && x.source === risk && inThread.has(x.target)) || (x.type === 'mitigates' && x.target === risk && inThread.has(x.source)))
    push(11, risk, l ? [l] : [], l ? `Attaches to ${l.source === risk ? l.target : l.source}, an element already in the thread.` : 'No link found.')
  }
  return hops
}

/** Shortest derives-from/refines path from a requirement up to a capability, through requirements only. */
function reqChain(L: Link[], req: string, cap: string): Link[] {
  const up = (x: string) => L.filter((l) => l.source === x && (l.type === 'derives-from' || l.type === 'refines'))
  const queue: { at: string; path: Link[] }[] = [{ at: req, path: [] }]
  const seen = new Set([req])
  while (queue.length) {
    const { at, path } = queue.shift()!
    for (const l of up(at)) {
      if (l.target === cap) return [...path, l]
      if (kindOfId(l.target) === 'REQ' && !seen.has(l.target)) {
        seen.add(l.target)
        queue.push({ at: l.target, path: [...path, l] })
      }
    }
  }
  return []
}

const cell = (s: string) => s.replace(/\|/g, '\\|')
export function threadsMarkdown(m: EngineeringModel, stakeholder: string): string {
  const rows = describeThreads(m, stakeholder)
  return [
    `Threads from ${stakeholder} (${rows.filter((r) => r.complete).length} complete of ${rows.length}); rule: course thread convention (engineering.ts THREAD_STEPS)`,
    '',
    '| # | Steps reached (of 11) | Thread | Missing link for the next step |',
    '|---|---|---|---|',
    ...rows.map((r, i) => `| ${i + 1} | ${r.reached} | ${cell(r.ids.join(' > '))} | ${r.complete ? 'complete' : cell(`step ${r.missingStep} (${THREAD_STEPS[r.missingStep! - 1]}): ${r.missing}`)} |`),
  ].join('\n')
}
