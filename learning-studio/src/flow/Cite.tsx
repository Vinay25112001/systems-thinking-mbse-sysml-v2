import { citationInRange, formatCitation, type Citation } from '../content/readings'

/** A verified citation in flow styling. Throws (fails tests) if the reading is not in the register. */
export function Cite({ c }: { c: Citation }) {
  const ok = citationInRange(c)
  return (
    <span className="lf-cite" data-reading={c.reading} data-in-range={ok}>
      {formatCitation(c)}
      {c.note ? ` — ${c.note}` : ''}
      {!ok && <strong> [pages outside verified range]</strong>}
    </span>
  )
}
