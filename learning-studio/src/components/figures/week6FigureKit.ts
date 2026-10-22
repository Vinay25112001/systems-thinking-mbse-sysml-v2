// Constants and pure helpers for the Week 6 lecture figures (LectureWeek6S1.tsx, LectureWeek6S2.tsx). Kept apart from the
// drawing components (LectureWeek6Parts.tsx) so every .tsx file exports components only (fast refresh; oxlint
// only-export-components). Review status: new-pending-review.
//
// Type rule (UI_UX_REDESIGN_PROPOSAL.md §"projector-ready type scale"): every figure label is at least 1/56 of the slide
// width once the figure is placed on the slide. The .pptx (scripts/build-lectures.mjs) is 13.333 in wide, so a label must
// render at least 13.333 ÷ 56 ≈ 0.238 in tall (about 17 pt). The figure is placed, keeping its aspect ratio, in one of
// three boxes (inches; conservative heights that allow a two-line caption and sources line):
//   - figure-bullets: the left 57.5 % of the 12.13 in content width, 6.98 × 4.45;
//   - figure with nothing below: the full width, 12.13 × 4.45;
//   - figure with a body below (worked-example steps, or bullets under a full-width figure): 12.13 × 2.85 (the body takes
//     at most 35 % of the height).
// A figure of viewBox w × h renders min(boxW, boxH × w ÷ h) inches wide, so one viewBox unit is that width ÷ w inches and
// the smallest label is LABEL_IN × w ÷ renderedWidth units, plus 4 % for the capture padding. minLabelFor() computes it;
// week6FigureKit.test.ts renders every Week 6 figure and checks every <text> font size against the box of the slide that
// shows it, and checks that no label runs outside the drawing.

export const SLIDE_W_IN = 13.333
export const LABEL_IN = SLIDE_W_IN / 56
export type FigureBox = 'figure-bullets' | 'figure' | 'figure-with-body'
export const BOX_IN: Record<FigureBox, { w: number; h: number }> = {
  'figure-bullets': { w: 6.98, h: 4.45 },
  figure: { w: 12.13, h: 4.45 },
  'figure-with-body': { w: 12.13, h: 2.85 },
}
/** The smallest label size, in viewBox units, that meets the 1/56-of-slide-width rule for a figure of viewBox w × h. */
export function minLabelFor(box: FigureBox, w: number, h: number): number {
  const b = BOX_IN[box]
  const renderedW = Math.min(b.w, (b.h * w) / h)
  return Math.ceil(((LABEL_IN * w) / renderedW) * 1.04)
}

/** The two standard canvases: figure-bullets drawings are 900 × 520; full-width drawings with a body below are 1200 × 280. */
export const FB = { w: 900, h: 520 } as const
export const FW = { w: 1200, h: 280 } as const
/** Label sizes used by the drawings (each at or above the computed minimum; asserted in the test). */
export const T_FB = minLabelFor('figure-bullets', FB.w, FB.h)
export const T_FW = minLabelFor('figure-with-body', FW.w, FW.h)

/** Approximate rendered width of `text` at `size` (IBM Plex Sans averages about 0.55 em per character). */
export const textW = (text: string, size: number) => text.length * size * 0.56
/** Greedy word wrap to at most `max` characters per line. */
export function wrap(text: string, max: number): string[] {
  const out: string[] = []
  let cur = ''
  for (const w of text.split(' ')) {
    if (!cur) cur = w
    else if (`${cur} ${w}`.length <= max) cur = `${cur} ${w}`
    else {
      out.push(cur)
      cur = w
    }
  }
  if (cur) out.push(cur)
  return out
}
/** Characters that fit in `width` units at `size`. */
export const fit = (width: number, size: number) => Math.floor(width / (size * 0.56))
