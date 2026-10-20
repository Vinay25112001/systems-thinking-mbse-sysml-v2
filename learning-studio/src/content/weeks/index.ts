// Week modules are discovered by file name (weekNN.ts), so authors of different weeks never edit a shared file.
// The modules are numbered by the EARLIER outline (content/draftWeeks.ts). Under the authoritative schedule
// (COURSE_SCHEDULE.md, DECISION_LOG A19) only the design-template week (Week 1) is live; the other modules are earlier
// reviewed draft material, served under #/draft/<oldWeek> and never under a current week title.
import { weekByNumber } from '../course'
import type { WeekContent } from '../schema'

const modules = import.meta.glob<{ default: WeekContent }>('./week[0-9][0-9].ts', { eager: true })

/** Every authored module, keyed by its own (earlier-outline) week number. */
export const WEEK_CONTENT: Record<number, WeekContent> = Object.fromEntries(
  Object.entries(modules).map(([path, m]) => {
    const n = parseInt(path.match(/week(\d\d)\.ts$/)![1], 10)
    if (m.default.week !== n) throw new Error(`${path} declares week ${m.default.week}`)
    return [n, m.default]
  }),
)

const isLive = (n: number) => weekByNumber(n)?.status === 'template'

/** The modules live under the current schedule, keyed by current week number. */
export const CURRENT_CONTENT: Record<number, WeekContent> = Object.fromEntries(Object.entries(WEEK_CONTENT).filter(([n]) => isLive(Number(n))))

/** The live module for current week n (undefined while the week is being rebuilt). */
export function weekContent(n: number): WeekContent | undefined {
  return CURRENT_CONTENT[n]
}

/** Earlier-outline weeks whose module was rebuilt in place as the live week (Week 1, 2026-10-18). Their module file now
 *  holds the current week, so it is not served as "earlier draft" material; the reviewed earlier text is in the
 *  repository history (commit 9dec1e7) and its reusable blocks stay in content/week1.ts. */
export const REBUILT_IN_PLACE = new Set([1])

/** An earlier reviewed draft module, by its earlier-outline week number (none for a week rebuilt in place). */
export function draftContent(oldWeek: number): WeekContent | undefined {
  return REBUILT_IN_PLACE.has(oldWeek) ? undefined : WEEK_CONTENT[oldWeek]
}
