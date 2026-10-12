// Converted weeks are discovered by file name (weekNN.ts), like weeks and activities: converting a week to the
// workbench never edits a shared file. A week with a missions module opens in the workbench at /week/N; every other
// week keeps the classic WeekPage.
import type { WorkbenchWeek } from './types'

const modules = import.meta.glob<{ default: WorkbenchWeek }>('./week[0-9][0-9].ts', { eager: true })

export const WORKBENCH_WEEKS: Record<number, WorkbenchWeek> = Object.fromEntries(
  Object.entries(modules).map(([path, m]) => {
    const n = parseInt(path.match(/week(\d\d)\.ts$/)![1], 10)
    if (m.default.week !== n) throw new Error(`${path} declares week ${m.default.week}`)
    return [n, m.default]
  }),
)

export function workbenchWeek(n: number): WorkbenchWeek | undefined {
  return WORKBENCH_WEEKS[n]
}

export const hasWorkbench = (n: number) => !!WORKBENCH_WEEKS[n]
