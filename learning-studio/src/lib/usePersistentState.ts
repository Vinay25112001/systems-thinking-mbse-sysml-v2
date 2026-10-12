import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from './storage'

/** useState that mirrors its value into localStorage under `key` (best effort). */
export function usePersistentState<T>(key: string, initial: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    const fallback = typeof initial === 'function' ? (initial as () => T)() : initial
    return loadJSON<T>(key, fallback)
  })
  useEffect(() => {
    saveJSON(key, value)
  }, [key, value])
  return [value, setValue] as const
}
