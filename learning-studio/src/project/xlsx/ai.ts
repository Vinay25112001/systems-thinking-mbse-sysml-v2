// The optional AI mapping provider (directive §13 "AI"; spec §j.2 step 7, LATER). Defined, DISABLED: the import works
// entirely on the deterministic heuristics. No provider is registered, no network call exists in this module, and no
// data leaves the machine. If a faculty-approved service is ever enabled, its proposals must be labelled
// "Suggestion (AI)" and must never be pre-selected over a deterministic match (mapping.ts keeps `source: 'ai'` apart).
import type { Candidate } from './mapping'

export type MappingSuggestionRequest = { headers: string[]; samples: string[][] }
export interface MappingSuggestionProvider {
  readonly id: string
  readonly enabled: boolean
  /** Human-readable name of the approved service (shown with every suggestion). */
  readonly label: string
  suggest(req: MappingSuggestionRequest): Promise<Candidate[][]>
}

/** The only provider shipped: does nothing and says so. */
export const DISABLED_PROVIDER: MappingSuggestionProvider = {
  id: 'none',
  enabled: false,
  label: 'No AI provider (deterministic mapping only)',
  suggest: async () => [],
}
export const AI_SUGGESTION_LABEL = 'Suggestion (AI)'
/** The provider in use. Changing it requires a faculty decision (approved service, data agreement); see M6_REPORT. */
export const activeProvider = (): MappingSuggestionProvider => DISABLED_PROVIDER
