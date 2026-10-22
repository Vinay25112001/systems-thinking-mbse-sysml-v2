// The Week 10 lecture figure maps (figure id -> title and component, and listing figure id -> listing key), kept apart
// from the figure components so that LectureWeek10S1.tsx and LectureWeek10S2.tsx export components only (fast refresh;
// oxlint only-export-components). The session maps live in lectureWeek10S1Figures.ts and lectureWeek10S2Figures.ts.
// Read by registry.ts. Review status: new-pending-review.
export { WEEK10_S1_FIGURES } from './lectureWeek10S1Figures'
export { WEEK10_S2_FIGURES } from './lectureWeek10S2Figures'

/** The listing figures of both sessions: figure id → listing key (src/content/lectures/week10/listings.ts). */
export const WEEK10_LISTING_FIGURES: Record<string, string> = {
  'w10s1-listing-guard-gap': 'guard-gap',
  'w10s1-listing-guard-covered': 'guard-covered',
  'w10s1-listing-logical-parts': 'logical-parts',
  'w10s1-listing-capability': 'capability',
  'w10s1-listing-function-io': 'function-io',
  'w10s1-listing-allocate-perform': 'allocate-perform',
  'w10s1-listing-worked-logical': 'worked-logical',
  'w10s1-listing-fork-join': 'fork-join',
  'w10s1-listing-item-flows': 'item-flows',
  'w10s1-listing-scn002-a': 'scn002-a',
  'w10s1-listing-scn002-b': 'scn002-b',
  'w10s2-listing-warmup': 'warmup',
  'w10s2-listing-state-def': 'state-def',
  'w10s2-listing-exhibit': 'exhibit',
  'w10s2-listing-use-case': 'use-case',
  'w10s2-listing-include': 'include',
}
