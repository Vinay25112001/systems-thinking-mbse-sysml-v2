// Constants and pure helpers for the Week 10 lecture figures (LectureWeek10S1.tsx, LectureWeek10S2.tsx), kept apart from
// the drawing components so every .tsx file exports components only (fast refresh; oxlint only-export-components). The
// type rule and the standard canvases are Week 7's (week7FigureKit.ts), reused read-only. Every value a figure draws is
// computed here from the AeroLink Week 10 case or the listings, never typed. Review status: new-pending-review.
import { ALLOCATION_GRID, UNALLOCATED, fnOf } from '../../content/lectures/week10/aerolinkCase'
import { AEROLINK_W10_MODEL } from '../../content/lectures/week10/aerolinkCase'
import { listing } from '../../content/lectures/week10/listings'
import { FB, minLabelFor } from './week7FigureKit'

/** The figure-bullets canvas and its smallest label (900 × 520 → 32). */
export const W10 = { w: FB.w, h: FB.h }
export const T_10 = minLabelFor('figure-bullets', FB.w, FB.h)
/** The seven-day plan (a full-width figure with nothing below): 1200 × 440 canvas, and its smallest label. */
export const SEVEN_DAYS_10 = { w: 1200, h: 440 }
export const T_7_10 = minLabelFor('figure', SEVEN_DAYS_10.w, SEVEN_DAYS_10.h)

const itemName = (id: string) => AEROLINK_W10_MODEL.items.find((x) => x.id === id)?.name ?? id

/** A chain of functions with the item each passes to the next (an out item of the first that is an in item of the
 *  second), or null where no item joins them. */
export function functionChain(ids: string[]): { id: string; name: string; item: string | null }[] {
  return ids.map((id, i) => {
    const f = fnOf(id)
    const next = ids[i + 1] ? fnOf(ids[i + 1]) : null
    const shared = next ? f.outputs.find((x) => next.inputs.includes(x)) : undefined
    return { id, name: f.name, item: shared ? itemName(shared) : null }
  })
}

/** A fragment of the allocation matrix: the first `rows` system requirements and the functions they are allocated to. */
export function allocationFragment(rows = 4): { cols: string[]; rows: { req: string; cells: boolean[] }[]; allocated: number; total: number } {
  const sys = ALLOCATION_GRID.rows.filter((r) => r.req.startsWith('REQ-SYS-'))
  const pick = sys.slice(0, rows)
  const cols = ALLOCATION_GRID.cols.filter((_, j) => pick.some((r) => r.cells[j]))
  return {
    cols,
    rows: pick.map((r) => ({ req: r.req, cells: cols.map((c) => r.cells[ALLOCATION_GRID.cols.indexOf(c)]) })),
    allocated: sys.length,
    total: sys.length + UNALLOCATED.length,
  }
}

/** Code lines for a drawn code card: trimmed text and indent level (4 spaces = one level), long lines wrapped on a space
 *  at `max` characters with the continuation one level deeper. */
export function codeLines(id: string, from = 0, to?: number, max = 44): { text: string; level: number }[] {
  const out: { text: string; level: number }[] = []
  for (const raw of listing(id).lines.slice(from, to)) {
    if (!raw.trim()) continue
    const level = Math.floor((raw.match(/^ */)![0].length) / 4)
    let rest = raw.trim()
    let lv = level
    while (rest.length > max) {
      const cut = rest.lastIndexOf(' ', max)
      out.push({ text: rest.slice(0, cut), level: lv })
      rest = rest.slice(cut + 1)
      lv = level + 1
    }
    out.push({ text: rest, level: lv })
  }
  return out
}

/** The physical placeholder names Week 9 wrote that a logical element's Week 4 allocation points at (for the two-views
 *  figure): Scheduling and Flight Operations are realized at the ops center and in the aircraft. */
export const PHYSICAL_OF: Record<string, string> = { 'LOG-005': 'Ops center', 'LOG-001': 'Aircraft' }
