// The Week 11 lecture figure maps (figure id -> title and component, and listing figure id -> listing key), kept apart
// from the figure components so that LectureWeek11S1.tsx and LectureWeek11S2.tsx export components only (fast refresh;
// oxlint only-export-components). The session maps live in lectureWeek11S1Figures.ts and lectureWeek11S2Figures.ts.
// Read by registry.ts. Review status: new-pending-review.
export { WEEK11_S1_FIGURES } from './lectureWeek11S1Figures'
export { WEEK11_S2_FIGURES } from './lectureWeek11S2Figures'

/** The listing figures of both sessions: figure id → listing key (src/content/lectures/week11/listings.ts). */
export const WEEK11_LISTING_FIGURES: Record<string, string> = {
  'w11s1-listing-two-ports': 'two-ports',
  'w11s1-listing-two-ports-conjugated': 'two-ports-conjugated',
  'w11s1-listing-physical-parts': 'physical-parts',
  'w11s1-listing-perform-physical': 'perform-physical',
  'w11s1-listing-allocate-l2p': 'allocate-l2p',
  'w11s1-listing-port-def': 'port-def',
  'w11s1-listing-worked-ports': 'worked-ports',
  'w11s1-listing-externals': 'externals',
  'w11s2-listing-warmup': 'warmup',
  'w11s2-listing-interface-def': 'interface-def',
  'w11s2-listing-binding': 'binding',
  'w11s2-listing-interface-usage': 'interface-usage',
  'w11s2-listing-interface-requirement': 'interface-requirement',
  'w11s2-listing-req-allocation': 'req-allocation',
  'w11s2-listing-satisfy': 'satisfy',
}
