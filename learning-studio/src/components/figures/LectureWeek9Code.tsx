// Week 9 code-listing figure: draws one SysML v2 listing from src/content/lectures/week09/listings.ts as a static SVG
// (monospace lines with line numbers, a title strip naming the validated file and the checker's recorded status, and
// callouts with leader lines), so the same listing reaches the slide viewer, the reader and the .pptx PNG. The status is
// written as text, never shown by color alone. Long lines are wrapped for display only (a continuation mark, no line
// number); the figure's alt text carries the listing verbatim. Adapted from LectureWeek8Code.tsx (same drawing rules,
// the Week 9 listing source). Review status: new-pending-review.
import { useId } from 'react'
import { Markers } from './Frame'
import { listing, type Listing } from '../../content/lectures/week09/listings'
import { rowsOf } from './listingRows'

const FONT = 15
const CHAR = FONT * 0.6
const ROW = 22
const GUTTER = 44
const PAD = 18
const CALLOUT_W = 300

const statusText = (l: Listing) => (l.status === 'FAIL' ? 'checker: FAIL (by design)' : l.status === 'PASS with warnings' ? 'checker: PASS with warnings' : 'checker: PASS')

export function CodeListing9({ id, alt }: { id: string; alt: string }) {
  const uid = useId().replace(/:/g, '')
  const l = listing(id)
  const rows = rowsOf(l)
  const marks = l.marks ?? []
  const codeW = GUTTER + PAD + Math.max(40, ...rows.map((r) => r.text.length)) * CHAR + PAD
  const W = Math.round(codeW + (marks.length ? CALLOUT_W + 30 : 0))
  const top = 46
  const H = top + rows.length * ROW + PAD + (l.credit ? 26 : 0)
  const rowOfLine = (line: number) => rows.findIndex((r) => r.line === line)
  const callouts = marks.reduce<{ line: number; label: string; y: number; at: number }[]>((acc, m) => {
    const at = top + Math.max(0, rowOfLine(m.line)) * ROW + ROW / 2
    const prev = acc.at(-1)?.y ?? -Infinity
    return [...acc, { ...m, y: Math.max(at, prev + 44), at }]
  }, [])
  const lastY = callouts.at(-1)?.y ?? -Infinity
  const file = l.file.split('/').at(-1)
  return (
    <svg viewBox={`0 0 ${W} ${Math.max(H, lastY + 30)}`} className="lf-svg" role="img" aria-label={alt}>
      <Markers id={uid} />
      <rect x={0} y={0} width={codeW} height={Math.max(H, lastY + 30)} rx={8} className="f-panel" />
      <rect x={0} y={0} width={codeW} height={34} rx={8} className="f-env" />
      <text x={PAD} y={22} fontSize={14} fontWeight={600} className="f-label" style={{ fontFamily: 'var(--wb-mono, monospace)' }}>
        {file}
      </text>
      <text x={codeW - PAD} y={22} fontSize={14} fontWeight={700} textAnchor="end" className={l.status === 'FAIL' ? 'f-label' : 'f-accent-ink'}>
        {statusText(l)}
      </text>
      {rows.map((r, i) => (
        <g key={i}>
          {r.no !== null && (
            <text x={GUTTER - 10} y={top + i * ROW + ROW * 0.68} fontSize={12} textAnchor="end" className="f-muted" style={{ fontFamily: 'var(--wb-mono, monospace)' }}>
              {r.no}
            </text>
          )}
          <text x={GUTTER + PAD / 2} y={top + i * ROW + ROW * 0.68} fontSize={FONT} className="f-label" style={{ fontFamily: 'var(--wb-mono, monospace)', whiteSpace: 'pre' }} xmlSpace="preserve">
            {r.no === null ? `↳${r.text.slice(1)}` : r.text}
          </text>
        </g>
      ))}
      {l.credit && (
        <text x={PAD} y={top + rows.length * ROW + 20} fontSize={12.5} fontStyle="italic" className="f-muted">
          {l.credit}
        </text>
      )}
      {callouts.map((c, i) => (
        <g key={i}>
          <path d={`M ${codeW + 24} ${c.y} L ${codeW - 8} ${c.at}`} className="f-arrow accent" markerEnd={`url(#${uid}-accent)`} fill="none" />
          <circle cx={codeW + 34} cy={c.y} r={11} style={{ fill: 'var(--wb-accent)' }} />
          <text x={codeW + 34} y={c.y} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700} style={{ fill: 'var(--wb-panel)' }}>
            {c.line}
          </text>
          {wrapLabel(c.label, 30).map((t, j) => (
            <text key={j} x={codeW + 52} y={c.y + j * 18} dominantBaseline="central" fontSize={15} fontWeight={600} className="f-accent-ink">
              {t}
            </text>
          ))}
        </g>
      ))}
    </svg>
  )
}

function wrapLabel(text: string, max: number): string[] {
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
