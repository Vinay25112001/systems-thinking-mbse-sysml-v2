import data from './rubrics.generated.json' with { type: 'json' }

export type RubricPart = { type: 'text'; text: string } | { type: 'table'; header: string[]; rows: string[][] }
export type Rubric = { id: string; title: string; parts: RubricPart[] }
export type ScaleLevel = { level: number; name: string; meaning: string }

/** Generated from ASSESSMENT_RUBRICS.md by `npm run content:rubrics`; never edit by hand. */
export const RUBRICS: Rubric[] = data.rubrics as Rubric[]
export const RATING_SCALE: ScaleLevel[] = data.scale
export const RUBRIC_IDS = new Set(RUBRICS.map((r) => r.id))

export function getRubric(id: string): Rubric {
  const r = RUBRICS.find((x) => x.id === id)
  if (!r) throw new Error(`Unknown rubric ${id}`)
  return r
}
