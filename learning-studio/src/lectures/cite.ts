// Citation helpers for the lecture views (kept out of the component modules for fast refresh).
import { getReading, type Citation } from '../content/readings'

/** The existing sources route: /sources/:id/:pages. */
export const sourcesPath = (c: Citation) => `/sources/${encodeURIComponent(c.reading)}${c.pages ? `/${encodeURIComponent(c.pages)}` : ''}`

/** Short form for slide footers: "R38 p.1637". */
export function shortCitation(c: Citation): string {
  const r = getReading(c.reading)
  return `${r.id} ${r.unit === 'slide' ? 'sl.' : 'p.'}${c.pages ?? (r.firstPage === r.lastPage ? r.firstPage : `${r.firstPage}–${r.lastPage}`)}`
}
