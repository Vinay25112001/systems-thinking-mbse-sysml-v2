// Word count of the Week 1 textbook as the current edition shows it (spec §c block 7: Learn reading time from word count).
// Required reading only: extension blocks (optional, not counted; faculty decision 2026-10-21, M4b review packages A–C)
// are left out of learnWords(); learnWordsAll() counts everything, for the report.
import { CHAPTER_MODELS, blockText } from './model'

const count = (keep: (optional: boolean) => boolean) =>
  CHAPTER_MODELS().reduce((a, m) => a + m.sections.reduce((b, s) => b + s.blocks.filter((x) => x.kind !== 'figure' && keep(!!x.optional)).reduce((c, x) => c + blockText(x).split(/\s+/).filter(Boolean).length, 0), 0), 0)
let cached: number | null = null
/** Required Learn words (extension reading excluded). */
export function learnWords(): number {
  if (cached === null) cached = count((optional) => !optional)
  return cached
}
/** Every Learn word, extension reading included. */
export const learnWordsAll = () => count(() => true)
/** Extension-reading words only. */
export const learnWordsOptional = () => count((optional) => optional)
