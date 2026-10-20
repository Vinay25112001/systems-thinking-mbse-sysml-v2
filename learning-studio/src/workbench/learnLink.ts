// When the workbench is the Practice stage of a book-style week, a mission step's "Read more" points first to the Learn
// section that teaches it (WEEK1_LEARNING_DESIGN §4), with the Reference drawer as the fallback. Null elsewhere.
import { createContext, useContext } from 'react'

export type LearnLink = { href: string; label: string }
export const LearnLinkContext = createContext<((block: string) => LearnLink | null) | null>(null)
export const useLearnLink = () => useContext(LearnLinkContext)

/** Practice-stage links (faculty feedback 2026-10-18, items 11 and 13): reopen the orientation, and go on to Check &
 *  submit once every mission is complete. Null outside the book-style flow. */
export type PracticeLinks = {
  onGuide: () => void
  checkHref: string
  completeText: string
  /** Labels on the lecture-first path (Week 1 lab tool and optional practice); the flow's labels by default. */
  guideLabel?: string
  checkLabel?: string
  progressLabel?: string
  /** Only these missions are shown (sign-off Mo3): the Week 1 lab tool shows the Team Record alone, the optional
   *  practice the AeroLink missions 1–4. All missions by default. */
  missions?: string[]
  /** With a single mission: count its steps as these parts ("Team Record parts") instead of counting missions. */
  partsLabel?: string
  /** Shown after the parts count, e.g. what the counted steps are (sign-off confirmation N4). */
  partsNote?: string
}
export const PracticeLinksContext = createContext<PracticeLinks | null>(null)
export const usePracticeLinks = () => useContext(PracticeLinksContext)
