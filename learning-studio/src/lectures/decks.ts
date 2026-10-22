// Which lecture decks the current edition ships (FD-g, integrator decision 2026-10-21, consistent with A23/A24): the
// Week 1 lectures are instructor-only (A23), so the student build drops the Week 1 decks (student-edition.ts) and shows
// no link to them; Weeks 2–8 keep the lecture-first template until the new navigation reaches them (A24), so their
// decks ship (speaker notes blanked) and their download links stay. scripts/check-student-build.mjs checks both: no
// Week 1 deck in dist-student/, and every .pptx link the student edition renders resolves to a shipped file.
import { IS_STUDENT_EDITION } from '../lib/edition'

/** Deck file stems the student build does not ship. */
export const STUDENT_DROPPED_DECK = /^week01-/

/** True when the deck `stem` (e.g. "week02-session1") is shipped by this edition, so a download link may render. */
export const deckShipped = (stem: string) => !(IS_STUDENT_EDITION && STUDENT_DROPPED_DECK.test(stem))
