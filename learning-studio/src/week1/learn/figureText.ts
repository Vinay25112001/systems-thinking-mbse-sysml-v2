// Figure text size in the Week 1 textbook (spec §d.6, the --t-caption token; review M4A F4). Shared by the figure frame
// (LearnReader) and the IF-1 boundary explorer.
/** Spec §d.6 and the --t-caption token: no rendered text below 13 px at 100 % zoom (review M4A F4). */
export const FIGURE_TEXT_FLOOR = 13
/** The width at which the smallest label of a drawing renders at the floor: viewBox width × floor ÷ smallest font size
 *  (in user units, read from the rendered SVG, so CSS-set sizes count too). Below that width the drawing keeps its
 *  readable size and scrolls sideways inside its own frame; the text description stays one click away. */
export function readableWidth(svg: SVGSVGElement): number | null {
  const vb = svg.viewBox?.baseVal
  if (!vb || !vb.width) return null
  let min = Infinity
  svg.querySelectorAll('text, tspan').forEach((t) => {
    const f = parseFloat(getComputedStyle(t).fontSize)
    if (f > 0 && f < min && (t.textContent ?? '').trim()) min = f
  })
  return Number.isFinite(min) ? Math.ceil((vb.width * FIGURE_TEXT_FLOOR) / min) : null
}
