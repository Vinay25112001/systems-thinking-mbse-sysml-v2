// Per-viewer progress through the Week 1 flow (guarded localStorage via usePersistentState; works without storage).
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { LEARN_SECTIONS } from '../content/learn/week01'
import { usePersistentState } from '../lib/usePersistentState'
import { FLOW_KEY, firstAttemptCorrect } from './storage'

/** A section-check record. `firstCorrect` is the first attempt and is what objective status uses (review W1F-F13): a
 *  retry after the key has been shown cannot turn "review" into "secure". `retrying` is set while a second attempt is
 *  open; the record (and so the "answered" gate) is never deleted. */
export type { CheckRecord } from './storage'
import type { CheckRecord } from './storage'
export type FlowState = {
  /** Section check answers, by section id. */
  checks: Record<string, CheckRecord>
  /** Sections the viewer marked as read (only possible once the check is answered). */
  read: Record<string, boolean>
  selfRating: Record<string, boolean>
  timePlan: Record<string, boolean>
  /** Worked-example inputs, by section id. */
  worked: Record<string, string>
  memo: Record<string, string>
  practiceStarted?: boolean
}
const EMPTY: FlowState = { checks: {}, read: {}, selfRating: {}, timePlan: {}, worked: {}, memo: {} }


type Flow = {
  state: FlowState
  answerCheck: (section: string, option: string, correct: boolean) => void
  retryCheck: (section: string) => void
  markRead: (section: string) => void
  patch: <K extends keyof FlowState>(key: K, value: FlowState[K]) => void
  readCount: number
  allRead: boolean
}

const Ctx = createContext<Flow | null>(null)

export function FlowProvider({ children }: { children: ReactNode }) {
  const [raw, setState] = usePersistentState<FlowState>(FLOW_KEY, EMPTY)
  const state = useMemo(() => ({ ...EMPTY, ...raw }), [raw])
  const answerCheck = useCallback(
    (section: string, option: string, correct: boolean) =>
      setState((s) => {
        const prev = s.checks?.[section]
        const rec: CheckRecord = { selected: option, correct, attempts: (prev?.attempts ?? 0) + 1, firstCorrect: prev ? firstAttemptCorrect(prev) : correct }
        return { ...EMPTY, ...s, checks: { ...s.checks, [section]: rec } }
      }),
    [setState],
  )
  const retryCheck = useCallback(
    (section: string) =>
      setState((s) => {
        const prev = s.checks?.[section]
        if (!prev) return s
        return { ...EMPTY, ...s, checks: { ...s.checks, [section]: { ...prev, firstCorrect: firstAttemptCorrect(prev), retrying: true } } }
      }),
    [setState],
  )
  const markRead = useCallback((section: string) => setState((s) => ({ ...EMPTY, ...s, read: { ...s.read, [section]: true } })), [setState])
  const patch = useCallback(<K extends keyof FlowState>(key: K, value: FlowState[K]) => setState((s) => ({ ...EMPTY, ...s, [key]: value })), [setState])
  const readCount = LEARN_SECTIONS.filter((s) => state.read[s.id]).length
  const value = useMemo<Flow>(
    () => ({ state, answerCheck, retryCheck, markRead, patch, readCount, allRead: readCount === LEARN_SECTIONS.length }),
    [state, answerCheck, retryCheck, markRead, patch, readCount],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useFlow(): Flow {
  const v = useContext(Ctx)
  if (!v) throw new Error('useFlow must be used inside FlowProvider')
  return v
}
