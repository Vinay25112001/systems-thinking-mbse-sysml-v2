// Constants and pure helpers for the Week 5 lecture figures (LectureWeek5S1.tsx, LectureWeek5S2.tsx). Kept apart from the
// drawing components (LectureWeek5Parts.tsx) so every .tsx file exports components only (fast refresh; oxlint
// only-export-components).
//
// Readability rule (faculty review of Week 1): every label is at least 12 pt at slide size. The .pptx places a figure
// (scripts/build-lectures.mjs) in one of two boxes on the 13.333 × 7.5 in slide:
//   - figure-bullets: the left 57.5 % of the 12.13 in content width, 6.98 in wide and about 4.7 in tall (it depends on
//     the caption length). A viewBox 900 wide and at most 560 tall is width-bound, so one unit is 6.98 ÷ 900 in and
//     MIN_FB = 22 units is 22 × 6.98 ÷ 900 × 72 ≈ 12.3 pt.
//   - worked-example (and any figure with its body below): the full 12.13 in width, about 2.95 in tall once the steps
//     block takes its 35 % (a one-line caption; 2.87 in with a two-line caption). A viewBox 1000 × 236 is width-bound
//     (ratio 4.24 > 12.13 ÷ 2.87), one unit is 12.13 ÷ 1000 in, and MIN_FW = 14 units ≈ 12.2 pt. Taller worked
//     drawings are height-bound: then MIN = ceil(12 ÷ 72 × H ÷ 2.87) units (minFor below).
// The render harness checks the real placement of every label; these constants are the design rule.
// Review status: new-pending-review.

export const FB_W = 900
export const MIN_FB = 22
export const FW_W = 1000
export const FW_H = 236
export const MIN_FW = 14
/** Worked-example figure box height in inches (two-line caption, the conservative case). */
export const WORKED_BOX_IN = 2.87
/** The smallest label (units) that is 12 pt at slide size for a full-width worked figure of viewBox w × h. */
export const minFor = (w: number, h: number) => Math.ceil((12 / 72) * Math.max(w / 12.13, h / WORKED_BOX_IN))

/** Greedy word wrap by character count (about 0.53 × font size per character in IBM Plex Sans). */
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
/** Characters that fit in `width` user units at font `size`. */
export const fit = (width: number, size: number) => Math.floor(width / (size * 0.55))
/** Approximate rendered width of `text` at `size` (IBM Plex Sans). */
export const textW = (text: string, size: number) => text.length * size * 0.56

/** Interface kinds: colour plus a non-colour cue (a letter and an edge style), so colour never carries meaning alone. */
export type KindId = 'physical' | 'information' | 'organizational'
export const KIND_STYLE: Record<KindId, { letter: string; fill: string; stroke: string; dash?: string; width: number }> = {
  physical: { letter: 'P', fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', width: 2.6 },
  information: { letter: 'I', fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', width: 1.6 },
  organizational: { letter: 'O', fill: 'var(--wb-ok-soft)', stroke: 'var(--wb-ok)', dash: '5 3', width: 1.8 },
}

/** The modularity figure (Session 1): six elements, module 1 = A, B, C and module 2 = D, E, F; three links inside each
 *  module, five crossing. Positions are chosen so that no link passes within NODE_R + 8 units of a node it does not join
 *  (tested in week5FigureKit.test.ts), so a class counting the heavy links aloud counts five, not six. */
export const MODULARITY = {
  r: 26,
  links: [[0, 1], [1, 2], [0, 2], [3, 4], [4, 5], [3, 5], [0, 3], [1, 4], [2, 5], [2, 3], [1, 5]] as [number, number][],
  scattered: [{ x: 303, y: 140 }, { x: 384, y: 329 }, { x: 96, y: 120 }, { x: 123, y: 321 }, { x: 70, y: 460 }, { x: 371, y: 459 }],
  grouped: [{ x: 547, y: 252 }, { x: 614, y: 130 }, { x: 539, y: 154 }, { x: 843, y: 295 }, { x: 852, y: 384 }, { x: 756, y: 420 }],
}
/** Distance from point p to the segment a–b. */
export function pointSegment(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / Math.max(1e-9, dx * dx + dy * dy)))
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy)
}
/** The smallest clearance between any link and a node it does not join, over a layout. */
export function minLinkClearance(links: [number, number][], pts: { x: number; y: number }[]): number {
  let m = Infinity
  for (const [a, b] of links) pts.forEach((p, k) => { if (k !== a && k !== b) m = Math.min(m, pointSegment(p, pts[a], pts[b])) })
  return m
}
