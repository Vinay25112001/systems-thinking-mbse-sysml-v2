// Constants and pure helpers for the Week 11 lecture figures (LectureWeek11S1.tsx, LectureWeek11S2.tsx), kept apart from
// the drawing components so every .tsx file exports components only (fast refresh; oxlint only-export-components). The
// type rule and the standard canvases are Week 7's (week7FigureKit.ts), reused read-only. Every value a figure draws is
// computed here from the AeroLink Week 11 case or the listings, never typed. Review status: new-pending-review.
import { AEROLINK_W10, AEROLINK_W11_MODEL, ifOf, partOf, physicalName, shortName } from '../../content/lectures/week11/aerolinkCase'
import { listing } from '../../content/lectures/week11/listings'
import { FB, minLabelFor, wrap } from './week7FigureKit'

/** The figure-bullets canvas and its smallest label (900 × 520 → 32). */
export const W11 = { w: FB.w, h: FB.h }
export const T_11 = minLabelFor('figure-bullets', FB.w, FB.h)
/** The seven-day plan (a full-width figure with nothing below): 1200 × 440 canvas, and its smallest label. */
export const SEVEN_DAYS_11 = { w: 1200, h: 440 }
export const T_7_11 = minLabelFor('figure', SEVEN_DAYS_11.w, SEVEN_DAYS_11.h)

/** Short display names for crowded figures (from the case, so the alt text uses the same words). */
export const short = shortName

/** The elements-and-interfaces drawing: the elements, and each interface between two of them with its ID. */
export const ELEMENT_IDS = ['PHY-001', 'PHY-003', 'PHY-004', 'PHY-007', 'EXT-002'] as const
export function elementLinks(): { id: string; a: string; b: string }[] {
  const set = new Set<string>(ELEMENT_IDS)
  return AEROLINK_W11_MODEL.interfaces.filter((x) => set.has(x.endA) && set.has(x.endB)).map((x) => ({ id: x.id, a: x.endA, b: x.endB }))
}

/** A logical element and the physical homes of its functions (the split-allocation figure). */
export function homesOf(log: string): { def: string; performs: string[]; homes: { phy: string; fns: string[] }[] } {
  const l = AEROLINK_W10.logical.find((x) => x.id === log)!
  const homes = AEROLINK_W11_MODEL.allocations.filter((a) => a.log === log).map((a) => ({ phy: a.phy, fns: a.fns }))
  return { def: l.def, performs: l.performs, homes }
}

/** The components of an element, by short labels wrapped to the width of a card. */
export function componentsOf(phy: string, max: number): { id: string; lines: string[] }[] {
  return partOf(phy).components.map((c) => ({ id: c.id, lines: wrap(physicalName(c.id), max) }))
}

/** The crossings of one interface: item, kind word, direction in short names. */
export function crossingsOf(ifId: string): { item: string; from: string; to: string }[] {
  return ifOf(ifId).flows.map((f) => ({ item: f.itemName, from: short(f.from), to: short(f.to) }))
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
