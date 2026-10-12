// Mission signals (WORKBENCH_SPEC §3): an activity publishes a fact a mission checks, e.g. the dynamics explorer's
// latest student-initiated run. Outside the workbench (the classic WeekPage, tests) there is no provider and
// publishing is a no-op, so existing activities need only one optional hook call and no rewrite.
import { createContext, useContext, useEffect, useRef, useState } from 'react'

type Publish = (key: string, value: unknown) => void
const noop: Publish = () => {}

export const SignalPublishContext = createContext<Publish>(noop)

export function usePublishSignal(): Publish {
  return useContext(SignalPublishContext)
}

/**
 * Publishes `value` under `key` whenever it changes (by value). `undefined` publishes nothing, so an activity can hold
 * a signal back until the student has acted (e.g. a run counts only after the student chose a scenario).
 */
export function useMissionSignal(key: string, value: unknown): void {
  const publish = useContext(SignalPublishContext)
  const last = useRef<string | null>(null)
  const json = value === undefined ? null : JSON.stringify(value)
  useEffect(() => {
    if (json === null || json === last.current) return
    last.current = json
    publish(key, JSON.parse(json))
  }, [key, json, publish])
}

/** The persisted signals the workbench holds (empty outside it), so an activity can restore what the student
 *  already committed (e.g. the explorer's archetype choices) after a reload. */
export const SignalReadContext = createContext<Record<string, { value: unknown } | undefined>>({})

/** The last published value of `key`, read once when the activity mounts; undefined outside the workbench. */
export function useSignalValue<T>(key: string): T | undefined {
  const all = useContext(SignalReadContext)
  const [initial] = useState(() => all[key]?.value as T | undefined)
  return initial
}
