// Display helpers for the Week 8 code-listing figure (LectureWeek8Code.tsx), kept apart from the component (fast
// refresh): the wrapped display rows of a listing, and the figure ids of both sessions that draw a listing.
import type { Listing } from '../../content/lectures/week08/listings'

const WRAP = 74

export type Row = { text: string; no: number | null; line: number }

/** Display rows: each listing line, wrapped at about WRAP characters on a space (continuations indented). */
export function rowsOf(l: Listing): Row[] {
  const out: Row[] = []
  // the number drawn in the gutter: the file's own line number when the listing says where it starts
  const shown = (i: number) => (l.firstLine ?? 1) + i
  l.lines.forEach((text, i) => {
    if (text.length <= WRAP) {
      out.push({ text, no: shown(i), line: i + 1 })
      return
    }
    const indent = text.match(/^ */)![0] + '    '
    let rest = text
    let first = true
    while (rest.length > (first ? WRAP : WRAP - indent.length)) {
      const limit = first ? WRAP : WRAP - indent.length
      let cut = rest.lastIndexOf(' ', limit)
      if (cut <= indent.length) cut = limit
      out.push({ text: first ? rest.slice(0, cut) : `${indent}${rest.slice(0, cut).trimStart()}`, no: first ? shown(i) : null, line: i + 1 })
      rest = rest.slice(cut)
      first = false
    }
    out.push({ text: `${indent}${rest.trimStart()}`, no: null, line: i + 1 })
  })
  return out
}

/** The listing figures of both sessions: `w8s<n>-listing-<key>` → the listing key. */
export const WEEK8_LISTING_FIGURES: Record<string, string> = {
  'w8s1-listing-vehicle-def': 'vehicle-def',
  'w8s1-listing-aircraft-usage': 'aircraft-usage',
  'w8s1-listing-aircraft-def': 'aircraft-def',
  'w8s1-listing-charger-specialization': 'charger-specialization',
  'w8s1-listing-vertiport-subsetting': 'vertiport-subsetting',
  'w8s1-listing-engine-redefinition': 'engine-redefinition',
  'w8s1-listing-network-configurations': 'network-configurations',
  'w8s2-listing-warmup': 'warmup',
  'w8s2-listing-root-imports': 'root-imports',
  'w8s2-listing-stakeholder-decl': 'stakeholder-decl',
  'w8s2-listing-comments-doc': 'comments-doc',
  'w8s2-listing-concern-adapted': 'concern-adapted',
  'w8s2-listing-need-frames': 'need-frames',
  'w8s2-listing-context-worked': 'context-worked',
  'w8s2-listing-stakeholder-worked': 'stakeholder-worked',
  'w8s2-listing-tool-proof-pass': 'tool-proof-pass',
  'w8s2-listing-tool-proof-fail': 'tool-proof-fail',
}
