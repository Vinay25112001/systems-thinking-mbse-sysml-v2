// Shared drawing components for the Week 5 lecture figures (LectureWeek5S1.tsx, LectureWeek5S2.tsx). Adapted from the
// Week 4 helpers (separate owners, so not imported). Static SVG with the shared theme classes (flow.css: f-shape, f-soft,
// f-panel, f-env, f-label, f-muted, f-accent-ink, f-arrow, f-boundary) and the theme variables (--wb-accent, --wb-warn,
// --wb-ok, --wb-bad and their -soft forms), so light and dark themes are designed once. Components only: constants and
// helpers are in week5FigureKit.ts; the 12 pt label rule is stated there. Review status: new-pending-review.
import { useId, type ReactNode } from 'react'
import { KIND_STYLE, type KindId } from './week5FigureKit'

export type Tone = 'box' | 'soft' | 'panel' | 'env' | 'warn' | 'bad' | 'ok' | 'dash' | 'none'
const FILLS: Partial<Record<Tone, { fill: string; stroke: string; strokeWidth: number }>> = {
  warn: { fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', strokeWidth: 1.8 },
  bad: { fill: 'var(--wb-bad-soft)', stroke: 'var(--wb-bad)', strokeWidth: 1.8 },
  ok: { fill: 'var(--wb-ok-soft)', stroke: 'var(--wb-ok)', strokeWidth: 1.8 },
}
const TONES = ['ink', 'accent', 'muted', 'warn', 'bad', 'ok'] as const
export type ArrowTone = (typeof TONES)[number]
const STROKE: Record<ArrowTone, string> = { ink: 'var(--wb-fg)', accent: 'var(--wb-accent)', muted: 'var(--wb-muted)', warn: 'var(--wb-warn)', bad: 'var(--wb-bad)', ok: 'var(--wb-ok)' }

export function Shape({ x, y, w, h, tone = 'box', rx = 8, strong = false }: { x: number; y: number; w: number; h: number; tone?: Tone; rx?: number; strong?: boolean }) {
  const sw = strong ? { strokeWidth: 3.2 } : undefined
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
export function Lines({ x, y, lines, size, anchor = 'middle', weight = 500, ink = 'ink', lh = 1.22, italic = false, strike = false, halo = false }: { x: number; y: number; lines: string[]; size: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; ink?: Ink; lh?: number; italic?: boolean; strike?: boolean; halo?: boolean }) {
  const step = size * lh
  const top = y - ((lines.length - 1) * step) / 2
  const p = inkProps(ink)
  const haloStyle = halo ? { paintOrder: 'stroke' as const, stroke: 'var(--wb-panel)', strokeWidth: 5, strokeLinejoin: 'round' as const } : {}
  return (
    <>
      {lines.map((l, i) => (
        <text key={i} x={x} y={top + i * step} textAnchor={anchor} dominantBaseline="central" fontSize={size} fontWeight={weight} fontStyle={italic ? 'italic' : undefined} textDecoration={strike ? 'line-through' : undefined} className={'className' in p ? p.className : undefined} style={{ ...('style' in p ? p.style : {}), ...haloStyle }}>
          {l}
        </text>
      ))}
    </>
  )
}

export function Card({ x, y, w, h, lines, size, tone = 'box', weight = 500, ink = 'ink', strong = false, title }: { x: number; y: number; w: number; h: number; lines: string[]; size: number; tone?: Tone; weight?: number; ink?: Ink; strong?: boolean; title?: string }) {
  const all = title ? [title, ...lines] : lines
  const step = size * 1.22
  const top = y + h / 2 - ((all.length - 1) * step) / 2
  return (
    <g>
      <Shape x={x} y={y} w={w} h={h} tone={tone} strong={strong} />
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
      style={{ stroke: STROKE[tone], strokeWidth: width ?? 2.4, fill: 'none' }}
      strokeDasharray={dashed ? '9 6' : undefined}
      markerEnd={head ? `url(#${id}-${tone})` : undefined}
      markerStart={both ? `url(#${id}-${tone})` : undefined}
    />
  )
}

export function Svg({ w, h, alt, children }: { w: number; h: number; alt: string; children: (id: string) => ReactNode }) {
  const id = `w5${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="lf-svg" role="img" aria-label={alt}>
      <defs>
        {TONES.map((t) => (
          <marker key={t} id={`${id}-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
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
  const w = text.length * size * 0.56 + 22
  const h = size + 14
  return (
    <g>
      <Shape x={cx - w / 2} y={cy - h / 2} w={w} h={h} tone={tone} rx={h / 2} />
      <Lines x={cx} y={cy} lines={[text]} size={size} weight={weight} ink={ink} />
    </g>
  )
}

/** A rectangle filled and edged by interface kind (colour plus edge style). */
export function KindRect({ x, y, w, h, kind, rx = 4 }: { x: number; y: number; w: number; h: number; kind: KindId; rx?: number }) {
  const k = KIND_STYLE[kind]
  return <rect x={x} y={y} width={w} height={h} rx={rx} style={{ fill: k.fill, stroke: k.stroke, strokeWidth: k.width }} strokeDasharray={k.dash} />
}

/** The external marker: a solid corner triangle in the top-right corner of a cell (a shape, not a colour). */
export function ExtMark({ x, y, s }: { x: number; y: number; s: number }) {
  return <path d={`M ${x - s} ${y} L ${x} ${y} L ${x} ${y + s} Z`} style={{ fill: 'var(--wb-fg)' }} />
}

/** A person: head and shoulders, centered at (x, y). */
export function Person({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const st = { fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2.2 }
  return (
    <g>
      <circle cx={x} cy={y - 14 * s} r={10 * s} style={st} />
      <path d={`M ${x - 18 * s} ${y + 20 * s} Q ${x - 18 * s} ${y} ${x} ${y} Q ${x + 18 * s} ${y} ${x + 18 * s} ${y + 20 * s} Z`} style={st} />
    </g>
  )
}

/** A document with a folded corner, top-left (x, y). */
export function Doc({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const f = Math.min(w, h) * 0.25
  const st = { fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2 }
  return (
    <g>
      <path d={`M ${x} ${y} L ${x + w - f} ${y} L ${x + w} ${y + f} L ${x + w} ${y + h} L ${x} ${y + h} Z`} style={st} />
      <path d={`M ${x + w - f} ${y} L ${x + w - f} ${y + f} L ${x + w} ${y + f}`} style={{ ...st, fill: 'none' }} />
    </g>
  )
}

/** A computer: screen and stand, centered at (x, y). */
export function Computer({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const st = { fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2.2 }
  return (
    <g>
      <rect x={x - 24 * s} y={y - 22 * s} width={48 * s} height={32 * s} rx={3} style={st} />
      <path d={`M ${x} ${y + 10 * s} L ${x} ${y + 18 * s} M ${x - 14 * s} ${y + 20 * s} L ${x + 14 * s} ${y + 20 * s}`} style={{ ...st, fill: 'none' }} />
    </g>
  )
}

/** An envelope, top-left (x, y). */
export function Envelope({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const st = { fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2.2 }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} style={st} />
      <path d={`M ${x} ${y} L ${x + w / 2} ${y + h * 0.55} L ${x + w} ${y}`} style={{ ...st, fill: 'none' }} />
    </g>
  )
}

/** A cloud outline centered at (x, y), w wide. */
export function Cloud({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const l = x - w / 2
  const b = y + h / 2
  return (
    <path
      d={`M ${l + w * 0.15} ${b} Q ${l} ${b} ${l} ${b - h * 0.3} Q ${l} ${b - h * 0.62} ${l + w * 0.2} ${b - h * 0.62} Q ${l + w * 0.24} ${y - h / 2} ${l + w * 0.45} ${y - h / 2} Q ${l + w * 0.62} ${y - h / 2} ${l + w * 0.68} ${b - h * 0.7} Q ${l + w} ${b - h * 0.72} ${l + w} ${b - h * 0.3} Q ${l + w} ${b} ${l + w * 0.85} ${b} Z`}
      className="f-env"
      style={{ strokeWidth: 2.2 }}
    />
  )
}

/** Generic line or polyline (no head). */
export function Line({ d, tone = 'ink', dashed = false, width = 2, dots = false }: { d: string; tone?: ArrowTone; dashed?: boolean; width?: number; dots?: boolean }) {
  return <path d={d} style={{ stroke: STROKE[tone], strokeWidth: width, fill: 'none' }} strokeDasharray={dots ? '2 6' : dashed ? '9 6' : undefined} strokeLinecap={dots ? 'round' : undefined} />
}
