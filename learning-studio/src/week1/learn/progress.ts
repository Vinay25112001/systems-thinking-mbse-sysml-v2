// Reading progress for the Week 1 textbook (spec §d.8, LRN-15). Rows keep the content id and the state reached:
// opened → read → checked. Until the course server (M2) stores progress, it stays in this browser and the reader says
// so; knowledge checks never gate progress.
import { useCallback, useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../../lib/storage'

export const PROGRESS_KEY = 'w01-learn-progress-v1'
export type LearnProgress = { opened: Record<string, number>; read: Record<string, number>; checked: Record<string, { choice: string; correct: boolean }>; last?: string }
const EMPTY: LearnProgress = { opened: {}, read: {}, checked: {} }

export const loadProgress = (): LearnProgress => ({ ...EMPTY, ...loadJSON<LearnProgress>(PROGRESS_KEY, EMPTY) })

export function useLearnProgress() {
  const [p, setP] = useState<LearnProgress>(loadProgress)
  useEffect(() => {
    const on = (e: StorageEvent) => e.key === PROGRESS_KEY && setP(loadProgress())
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])
  const update = useCallback((f: (x: LearnProgress) => LearnProgress) => {
    setP((prev) => {
      const next = f(prev)
      saveJSON(PROGRESS_KEY, next)
      return next
    })
  }, [])
  const open = useCallback((id: string) => update((x) => (x.opened[id] && x.last === id ? x : { ...x, opened: { ...x.opened, [id]: x.opened[id] ?? Date.now() }, last: id })), [update])
  const markRead = useCallback((id: string, read: boolean) => update((x) => {
    const r = { ...x.read }
    if (read) r[id] = Date.now()
    else delete r[id]
    return { ...x, read: r }
  }), [update])
  const answer = useCallback((check: string, choice: string, correct: boolean) => update((x) => ({ ...x, checked: { ...x.checked, [check]: { choice, correct } } })), [update])
  return { progress: p, open, markRead, answer }
}
