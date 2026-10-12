// Definition-of-done status for each week, computed from the authored content (see content/schema.ts).
import { ACTIVITY_KEYS } from '../activities/registry'
import { weekByNumber } from '../content/course'
import { RUBRIC_IDS } from '../content/rubrics'
import { weekChecks, weekStatus, type Check, type WeekStatus } from '../content/schema'
import { WEEK_CONTENT } from '../content/weeks'

export function checksForWeek(n: number): Check[] | null {
  const c = WEEK_CONTENT[n]
  const w = weekByNumber(n)
  if (!c || !w) return null
  return weekChecks(c, w.objectives.map((o) => o.id), RUBRIC_IDS, ACTIVITY_KEYS)
}

export function statusOfWeek(n: number): WeekStatus {
  return weekStatus(checksForWeek(n))
}

export const STATUS_LABEL: Record<WeekStatus, string> = {
  complete: 'Complete draft',
  'in-development': 'In development',
  outline: 'Outline',
}
