// Shared drawing components for the Week 6 lecture figures (LectureWeek6S1.tsx, LectureWeek6S2.tsx). Adapted from the
// Week 5 helpers (separate owners, so not imported). Static SVG with the shared theme classes (flow.css: f-shape, f-soft,
// f-panel, f-env, f-label, f-muted, f-accent-ink, f-boundary) and the theme variables (--wb-accent, --wb-warn, --wb-ok,
// --wb-bad and their -soft forms), so light and dark themes are designed once. Components only: constants and the type
// rule are in week6FigureKit.ts. Review status: new-pending-review.
import { useId, type ReactNode } from 'react'

export type Tone = 'box' | 'soft' | 'panel' | 'env' | 'warn' | 'bad' | 'ok' | 'dash' | 'none'
const FILLS: Partial<Record<Tone, { fill: string; stroke: string; strokeWidth: number }>> = {
  warn: { fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', strokeWidth: 2 },
  bad: { fill: 'var(--wb-bad-soft)', stroke: 'var(--wb-bad)', strokeWidth: 2 },
  ok: { fill: 'var(--wb-ok-soft)', stroke: 'var(--wb-ok)', strokeWidth: 2 },
}
const TONES = ['ink', 'accent', 'muted', 'warn', 'bad', 'ok'] as const
export type ArrowTone = (typeof TONES)[number]
const STROKE: Record<ArrowTone, string> = { ink: 'var(--wb-fg)', accent: 'var(--wb-accent)', muted: 'var(--wb-muted)', warn: 'var(--wb-warn)', bad: 'var(--wb-bad)', ok: 'var(--wb-ok)' }

export function Shape({ x, y, w, h, tone = 'box', rx = 10, strong = false }: { x: number; y: number; w: number; h: number; tone?: Tone; rx?: number; strong?: boolean }) {
  const sw = strong ? { strokeWidth: 3.4 } : undefined
  if (tone === 'none') return null
  if (tone === 'soft')
    return (
      <g className="f-soft">
        <rect x={x} y={y} width={w} height={h} rx={rx} className="f-shape" style={sw} />
      </g>
    )
  if (tone === 'panel') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-panel" style={sw} />
  if (tone === 'env') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-env" style={sw} />
  if (tone === 'dash') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-boundary" style={sw} />
  const f = FILLS[tone]
  if (f) return <rect x={x} y={y} width={w} height={h} rx={rx} style={{ ...f, ...(sw ?? {}) }} />
  return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-shape" style={sw} />
}

export type Ink = 'ink' | 'muted' | 'accent' | 'warn' | 'bad' | 'ok'
const inkProps = (ink: Ink) =>
  ink === 'warn' || ink === 'bad' || ink === 'ok' ? { style: { fill: `var(--wb-${ink})` } } : { className: ink === 'muted' ? 'f-muted' : ink === 'accent' ? 'f-accent-ink' : 'f-label' }

/** Lines of text anchored on (x, y); the block is vertically centered on y. */
export function Lines({ x, y, lines, size, anchor = 'middle', weight = 500, ink = 'ink', lh = 1.2, italic = false, halo = false }: { x: number; y: number; lines: string[]; size: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; ink?: Ink; lh?: number; italic?: boolean; halo?: boolean }) {
  const step = size * lh
  const top = y - ((lines.length - 1) * step) / 2
  const p = inkProps(ink)
  const haloStyle = halo ? { paintOrder: 'stroke' as const, stroke: 'var(--wb-panel)', strokeWidth: 7, strokeLinejoin: 'round' as const } : {}
  return (
    <>
      {lines.map((l, i) => (
        <text key={i} x={x} y={top + i * step} textAnchor={anchor} dominantBaseline="central" fontSize={size} fontWeight={weight} fontStyle={italic ? 'italic' : undefined} className={'className' in p ? p.className : undefined} style={{ ...('style' in p ? p.style : {}), ...haloStyle }}>
          {l}
        </text>
      ))}
    </>
  )
}

/** A rounded box with centered lines; `title` is drawn bold above the lines. */
export function Card({ x, y, w, h, lines, size, tone = 'box', weight = 500, ink = 'ink', strong = false, title, dashed = false }: { x: number; y: number; w: number; h: number; lines: string[]; size: number; tone?: Tone; weight?: number; ink?: Ink; strong?: boolean; title?: string; dashed?: boolean }) {
  const all = title ? [title, ...lines] : lines
  const step = size * 1.2
  const top = y + h / 2 - ((all.length - 1) * step) / 2
  return (
    <g>
      <Shape x={x} y={y} w={w} h={h} tone={dashed ? 'dash' : tone} strong={strong} />
      {all.map((l, i) => (
        <text key={i} x={x + w / 2} y={top + i * step} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={title && i === 0 ? 700 : weight} {...inkProps(title && i === 0 ? 'ink' : ink)}>
          {l}
        </text>
      ))}
    </g>
  )
}

export function Arrow({ d, id, tone = 'ink', dashed = false, width, both = false, head = true }: { d: string; id: string; tone?: ArrowTone; dashed?: boolean; width?: number; both?: boolean; head?: boolean }) {
  return (
    <path
      d={d}
      style={{ stroke: STROKE[tone], strokeWidth: width ?? 3, fill: 'none' }}
      strokeDasharray={dashed ? '12 8' : undefined}
      markerEnd={head ? `url(#${id}-${tone})` : undefined}
      markerStart={both ? `url(#${id}-${tone})` : undefined}
    />
  )
}

export function Svg({ w, h, alt, children }: { w: number; h: number; alt: string; children: (id: string) => ReactNode }) {
  const id = `w6${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="lf-svg" role="img" aria-label={alt}>
      <defs>
        {TONES.map((t) => (
          <marker key={t} id={`${id}-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" style={{ fill: STROKE[t] }} />
          </marker>
        ))}
      </defs>
      {children(id)}
    </svg>
  )
}

/** A rounded tag with one line of text, centered on (cx, cy). */
export function Chip({ cx, cy, text, size, tone = 'box', ink = 'ink', weight = 600 }: { cx: number; cy: number; text: string; size: number; tone?: Tone; ink?: Ink; weight?: number }) {
  const w = text.length * size * 0.56 + 26
  const h = size + 16
  return (
    <g>
      <Shape x={cx - w / 2} y={cy - h / 2} w={w} h={h} tone={tone} rx={h / 2} />
      <Lines x={cx} y={cy} lines={[text]} size={size} weight={weight} ink={ink} />
    </g>
  )
}

/** A trigger: a diamond centered on (cx, cy), filled in the accent color (a shape, not only a color). */
export function Diamond({ cx, cy, r = 16 }: { cx: number; cy: number; r?: number }) {
  return <path d={`M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`} style={{ fill: 'var(--wb-accent)', stroke: 'var(--wb-fg)', strokeWidth: 2 }} />
}

/** A plain line (no arrowhead). */
export function Line({ x1, y1, x2, y2, tone = 'muted', dashed = false, width = 2 }: { x1: number; y1: number; x2: number; y2: number; tone?: ArrowTone; dashed?: boolean; width?: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: STROKE[tone], strokeWidth: width }} strokeDasharray={dashed ? '10 7' : undefined} />
}

/** A table outline: column x positions (left edges and the right end) and row y positions, drawn as light rules. */
export function Grid({ xs, ys, header = true }: { xs: number[]; ys: number[]; header?: boolean }) {
  const x0 = xs[0]
  const x1 = xs[xs.length - 1]
  const y0 = ys[0]
  const y1 = ys[ys.length - 1]
  return (
    <g>
      {header && <rect x={x0} y={y0} width={x1 - x0} height={ys[1] - y0} style={{ fill: 'var(--wb-accent-soft)' }} />}
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} style={{ fill: 'none', stroke: 'var(--wb-fg)', strokeWidth: 2 }} />
      {ys.slice(1, -1).map((y) => (
        <line key={`r${y}`} x1={x0} y1={y} x2={x1} y2={y} style={{ stroke: 'var(--wb-muted)', strokeWidth: 1.4 }} />
      ))}
      {xs.slice(1, -1).map((x) => (
        <line key={`c${x}`} x1={x} y1={y0} x2={x} y2={y1} style={{ stroke: 'var(--wb-muted)', strokeWidth: 1.4 }} />
      ))}
    </g>
  )
}
