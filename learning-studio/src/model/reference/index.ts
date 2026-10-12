// Instructor reference AeroLink baseline (lab plan §C.4), split by the week in which each layer is introduced
// (weekNN.ts, discovered by file name). Used for worked examples, for the digital-thread and impact tools, and as
// a recovery input a team can load. Every value is FICTIONAL or instructor-reference unless an element is cited.
import type { EngineeringModel } from '../engineering'

type RefModule = { default: EngineeringModel }
const modules = import.meta.glob<RefModule>('./week[0-9][0-9].ts', { eager: true })

export const REFERENCE_BY_WEEK: Record<number, EngineeringModel> = Object.fromEntries(
  Object.entries(modules).map(([p, m]) => [parseInt(p.match(/week(\d\d)\.ts$/)![1], 10), m.default]),
)

/** The reference baseline as it stands at the end of week `upTo` (all layers introduced up to then). */
export function referenceUpTo(upTo = 14): EngineeringModel {
  const weeks = Object.keys(REFERENCE_BY_WEEK).map(Number).filter((w) => w <= upTo).sort((a, b) => a - b)
  return {
    elements: weeks.flatMap((w) => REFERENCE_BY_WEEK[w].elements),
    links: weeks.flatMap((w) => REFERENCE_BY_WEEK[w].links),
  }
}
