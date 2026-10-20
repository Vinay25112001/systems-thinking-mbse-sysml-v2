// Flow storage helpers shared with the workbench and the dashboard (guarded localStorage).
import { loadJSON, saveJSON } from '../lib/storage'

export const FLOW_KEY = 'w1-flow-v2'

/** A section-check record (see state.tsx). `firstCorrect` is the first attempt, used for objective status. */
export type CheckRecord = { selected: string; correct: boolean; attempts: number; firstCorrect?: boolean; retrying?: boolean }
/** First-attempt correctness (records saved before `firstCorrect` existed fall back to `correct`). */
export const firstAttemptCorrect = (r: CheckRecord | undefined): boolean | undefined => (r ? (r.firstCorrect ?? r.correct) : undefined)

// ------------------------------------------------------------------------------------------- shared with the workbench
/** The opener's prediction is stored under mission w1-m1-try, step `predict` (design D3), so the mission finds it done. */
export const PREDICTION_MISSION = 'w1-m1-who'
type StoredProgress = Record<string, { answers?: Record<string, { value: string; at: number }> } & Record<string, unknown>>

export function readPrediction(): { value: string; at: number } | undefined {
  return loadJSON<StoredProgress>('mission-progress', {})[PREDICTION_MISSION]?.answers?.prediction
}

/** Records the prediction once (locked, like the mission's own input); returns the stored answer. */
export function recordPrediction(value: string, now = Date.now()): { value: string; at: number } {
  const store = loadJSON<StoredProgress>('mission-progress', {})
  const prev = store[PREDICTION_MISSION] ?? {}
  const existing = prev.answers?.prediction
  if (existing) return existing
  const answer = { value, at: now }
  const base = { manual: {}, revealed: {}, hints: {}, ...prev }
  saveJSON('mission-progress', { ...store, [PREDICTION_MISSION]: { ...base, answers: { ...(prev.answers ?? {}), prediction: answer } } })
  return answer
}

/** Opens the workbench on a given centre view the next time Practice mounts (the workbench reads `wb-ui`). */
export function preselectWorkbenchView(view: string): void {
  const ui = loadJSON<Record<number, Record<string, unknown>>>('wb-ui', {})
  saveJSON('wb-ui', { ...ui, 1: { ...(ui[1] ?? {}), view } })
}

/** Whether the course welcome was seen or dismissed (the dashboard shows its "Start here" card until then). */
export const WELCOME_KEY = 'welcome-seen'
