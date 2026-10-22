// React side of the published-content seam (published.ts). The instructor's "Preview as student" wraps the real reader
// in LearnPreviewContext with the draft overlay, so the preview renders through exactly the student code path.
import { createContext, useContext, useSyncExternalStore } from 'react'
import { getLearnOverlay, subscribeLearnOverlay, type LearnOverlay } from './published'

export const LearnPreviewContext = createContext<LearnOverlay | null>(null)

/** The overlay the reader renders: the preview's when inside a preview, otherwise the published one (or null). */
export function useLearnOverlay(): LearnOverlay | null {
  const preview = useContext(LearnPreviewContext)
  const global = useSyncExternalStore(subscribeLearnOverlay, getLearnOverlay, getLearnOverlay)
  return preview ?? global
}
