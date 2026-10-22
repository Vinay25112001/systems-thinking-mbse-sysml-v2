// Published-content seam of the Week 1 textbook (M3, limited scope). When the course server is reachable and a student
// or instructor is signed in, src/publishing/client.ts places the latest PUBLISHED bodies of the Learn sections here;
// model.ts then renders those blocks instead of the code-assembled parts, through the same toRBlock path (student
// wording layer, footnotes, figure numbering). Offline, on GitHub Pages and in the static student build the overlay stays
// null and the bundled code content renders unchanged. Content ids, progress keys and links never change.
// Pure module (no React): textbook.ts reads `isWithdrawn` so that an archived section leaves every list and the gap-free
// numbering at once. The React hook is in usePublished.tsx.
import type { SectionBody } from '../../publishing/types'

export type LearnOverlay = {
  /** Published body per section id (`ch06-03`). A section without an entry renders the bundled code content. */
  sections: Record<string, SectionBody>
  /** Published revision and time per section (the "Updated since you read it" badge, FD-C4 default). */
  meta: Record<string, { seq: number; publishedAt: string }>
  /** Sections withdrawn (archived) from the student view. */
  withdrawn: ReadonlySet<string>
}

let current: LearnOverlay | null = null
const listeners = new Set<() => void>()
export const getLearnOverlay = () => current
export function setLearnOverlay(o: LearnOverlay | null) {
  current = o
  for (const l of listeners) l()
}
export function subscribeLearnOverlay(fn: () => void) {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}
export const isWithdrawn = (sectionId: string) => !!current && current.withdrawn.has(sectionId)
