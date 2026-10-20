// Definition-of-done status for each week, computed from the authored content (see content/schema.ts).
import { ACTIVITY_KEYS } from '../activities/registry'
import { weekByNumber } from '../content/course'
import { draftWeekByNumber } from '../content/draftWeeks'
import { RUBRIC_IDS } from '../content/rubrics'
import { weekChecks, weekStatus, type Check, type WeekStatus } from '../content/schema'
import { draftContent, weekContent } from '../content/weeks'

export function checksForWeek(n: number): Check[] | null {
  const c = weekContent(n)
  const w = weekByNumber(n)
  if (!c || !w) return null
  return weekChecks(c, w.objectives.map((o) => o.id), RUBRIC_IDS, ACTIVITY_KEYS)
}

/** Definition-of-done checks of an earlier reviewed draft module, against the earlier outline it was written for. */
export function checksForDraft(oldWeek: number): Check[] | null {
  const c = draftContent(oldWeek)
  const w = draftWeekByNumber(oldWeek)
  if (!c || !w) return null
  return weekChecks(c, w.objectives.map((o) => o.id), RUBRIC_IDS, ACTIVITY_KEYS)
}

export function statusOfWeek(n: number): WeekStatus {
  return weekStatus(checksForWeek(n))
}

export const STATUS_LABEL: Record<WeekStatus, string> = {
  complete: 'Complete draft',
  'in-development': 'In development',
  outline: 'Provisional: being rebuilt',
}
