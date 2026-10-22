// Constants for the Week 9 lecture figures (LectureWeek9S1.tsx, LectureWeek9S2.tsx), kept apart from the drawing
// components so every .tsx file exports components only (fast refresh; oxlint only-export-components). The type rule and
// the standard canvases are Week 7's (week7FigureKit.ts), reused read-only. Review status: new-pending-review.
import { minLabelFor } from './week7FigureKit'

/** The seven-day plan (a full-width figure with nothing below): 1200 × 440 canvas, and its smallest label. */
export const SEVEN_DAYS = { w: 1200, h: 440 }
export const T_7 = minLabelFor('figure', SEVEN_DAYS.w, SEVEN_DAYS.h)
