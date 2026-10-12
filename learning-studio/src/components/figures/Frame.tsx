// Shared frame for the Learn-stage figures (Mayer: labels on the figure, a short caption, a text equivalent).
// Wide drawings keep a readable label size: on a narrow screen the drawing scrolls inside its own frame, never the page.
import type { ReactNode } from 'react'
import type { FigureSpec } from '../../content/learn/types'

export type FigureMeta = Pick<FigureSpec, 'id' | 'title' | 'alt' | 'textEquivalent'> & { caption: { text: string } }

export function FigureFrame({ spec, number, children, wide = true, below, ownTextAlt = false, full = false }: { spec: FigureMeta; number?: string; children: ReactNode; wide?: boolean; below?: ReactNode; ownTextAlt?: boolean; full?: boolean }) {
  const label = `${number ? `Figure ${number}: ` : ''}${spec.title}`
  return (
    <figure className={`lf-figure${full ? ' is-full' : ''}`} data-testid={`figure-${spec.id}`} aria-label={label}>
      <div className="lf-figure-title">
        {number && <span className="lf-figure-no">Figure {number}</span>}
        <span>{spec.title}</span>
      </div>
      {wide ? (
        <>
          <p className="lf-scroll-hint" aria-hidden>
            Scroll sideways to see the whole drawing →
          </p>
          <div className="lf-figure-scroll" tabIndex={0} role="group" aria-label={`${label} (drawing; scrolls sideways on small screens)`}>
            {children}
          </div>
        </>
      ) : (
        children
      )}
      {below}
      <figcaption className="lf-figcaption">{spec.caption.text}</figcaption>
      {!ownTextAlt && (
        <details className="lf-textalt">
          <summary>Text equivalent</summary>
          <p>{spec.textEquivalent}</p>
        </details>
      )}
    </figure>
  )
}

/** A rounded box with one or two centred lines of text (SVG units). */
export function Box({ x, y, w, h, lines, tone = 'box', size = 14, bold = false }: { x: number; y: number; w: number; h: number; lines: string[]; tone?: 'box' | 'soft' | 'accent' | 'dim' | 'warn'; size?: number; bold?: boolean }) {
  const lh = size * 1.25
  const top = y + h / 2 - ((lines.length - 1) * lh) / 2
  return (
    <g className={`f-${tone}`}>
      <rect x={x} y={y} width={w} height={h} rx={6} className="f-shape" />
      {lines.map((l, i) => (
        <text key={i} x={x + w / 2} y={top + i * lh} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={bold ? 600 : 500} className="f-label">
          {l}
        </text>
      ))}
    </g>
  )
}

/** Arrow-head markers (one per tone) used by every figure. */
export function Markers({ id }: { id: string }) {
  return (
    <defs>
      {(['ink', 'accent', 'muted', 'warn'] as const).map((t) => (
        <marker key={t} id={`${id}-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className={`f-head-${t}`} />
        </marker>
      ))}
    </defs>
  )
}
