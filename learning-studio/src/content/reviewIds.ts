// Review-decision IDs shared by the review list (pages/InstructorReview.tsx) and the week page's lab panel
// (pages/WeekPage.tsx), so both record the lab decision under the same key.
import type { WeekContent } from './schema'

/** The lab item's review ID: w<N>-lab, unless a lesson block already has that ID (Weeks 9-13 have a lab block w<N>-lab);
 *  then w<N>-lab-summary, so the lab and the lesson block no longer share one recorded decision. Lesson blocks keep
 *  their IDs, so decisions recorded for them still match. */
export function labReviewId(c: Pick<WeekContent, 'week' | 'blocks'>): string {
  return c.blocks.some((b) => b.id === `w${c.week}-lab`) ? `w${c.week}-lab-summary` : `w${c.week}-lab`
}
