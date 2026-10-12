// One trade study shared by the Week 7 activities on the page (simulator, Monte Carlo, swing elicitation), so a
// change made in one is seen by the others at once. Persisted per browser under the w07- key.
import { useSyncExternalStore } from 'react'
import { loadJSON, saveJSON } from '../../lib/storage'
import { REFERENCE_DRIVERS, REFERENCE_SHARED, REFERENCE_UNCERTAINTY, referenceStudy } from './reference'
import type { Driver, TradeStudy, Uncertainty } from './trade'

export type W07State = { study: TradeStudy; unc: Uncertainty; drivers: Driver[]; shared: string[]; source: string }

const KEY = 'w07-trade-study'
export const referenceState = (): W07State => ({ study: referenceStudy(), unc: structuredClone(REFERENCE_UNCERTAINTY), drivers: structuredClone(REFERENCE_DRIVERS), shared: [...REFERENCE_SHARED], source: 'Instructor reference trade study (Week 7 baseline)' })

let state: W07State | null = null
const listeners = new Set<() => void>()
// States saved before drivers existed have no `drivers` field; read them with an empty driver list.
const get = () => (state ??= ((s: W07State) => ({ ...s, drivers: s.drivers ?? [] }))(loadJSON<W07State>(KEY, referenceState())))

export function setW07(update: W07State | ((s: W07State) => W07State)) {
  state = typeof update === 'function' ? update(get()) : update
  saveJSON(KEY, state)
  for (const l of listeners) l()
}

/** For tests: forget the in-memory copy so the next read comes from storage (or the reference). */
export function resetW07Store() {
  state = null
  for (const l of listeners) l()
}

export function useW07(): [W07State, typeof setW07] {
  const s = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    get,
    get,
  )
  return [s, setW07]
}
