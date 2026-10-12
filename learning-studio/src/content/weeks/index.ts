// Week modules are discovered by file name (weekNN.ts), so authors of different weeks never edit a shared file.
import type { WeekContent } from '../schema'

const modules = import.meta.glob<{ default: WeekContent }>('./week[0-9][0-9].ts', { eager: true })

export const WEEK_CONTENT: Record<number, WeekContent> = Object.fromEntries(
  Object.entries(modules).map(([path, m]) => {
    const n = parseInt(path.match(/week(\d\d)\.ts$/)![1], 10)
    if (m.default.week !== n) throw new Error(`${path} declares week ${m.default.week}`)
    return [n, m.default]
  }),
)

export function weekContent(n: number): WeekContent | undefined {
  return WEEK_CONTENT[n]
}
