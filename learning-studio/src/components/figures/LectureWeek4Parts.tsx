// Shared drawing helpers for the Week 4 lecture figures (LectureWeek4S1.tsx, LectureWeek4S2.tsx). Copied from the Week 3
// helpers (separate owners, so not imported). Static SVG with the shared theme classes (flow.css: f-shape, f-soft,
// f-panel, f-env, f-label, f-muted, f-accent-ink, f-arrow, f-grid, f-axis, f-divider) and the theme variables
// (--wb-accent, --wb-warn, --wb-ok, --wb-bad and their -soft forms), so light and dark themes are designed once.
//
// Readability rule (faculty review of Week 1): every label is at least 12 pt at slide size. Two canvases are used:
//   - FB, figure-bullets slides: viewBox 900 wide, at most 540 tall, drawn about 6.98 in wide in the .pptx, so one user
//     unit is 6.98 ÷ 900 in and the minimum label size MIN_FB = 22 units is 22 × 6.98 ÷ 900 × 72 ≈ 12.3 pt;
//   - FW, full-width slides with a body below (worked-example, equation): viewBox 1000 × 340, height-bound at about
//     2.87 in, so one unit is 2.87 ÷ 340 in and MIN_FW = 20 units ≈ 12.2 pt.
// Review status: new-pending-review.
import { useId, type ReactNode } from 'react'
import { Markers } from './Frame'

export const MIN_FB = 22
export const MIN_FW = 20
export const FB_W = 900
export const FW_W = 1000
export const FW_H = 340

export type Tone = 'box' | 'soft' | 'panel' | 'env' | 'warn' | 'bad' | 'ok' | 'dash'
const FILLS: Partial<Record<Tone, { fill: string; stroke: string; strokeWidth: number }>> = {
  warn: { fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', strokeWidth: 1.8 },
  bad: { fill: 'var(--wb-bad-soft)', stroke: 'var(--wb-bad)', strokeWidth: 1.8 },
  ok: { fill: 'var(--wb-ok-soft)', stroke: 'var(--wb-ok)', strokeWidth: 1.8 },
}

export function Shape({ x, y, w, h, tone = 'box', rx = 8, strong = false }: { x: number; y: number; w: number; h: number; tone?: Tone; rx?: number; strong?: boolean }) {
  const sw = strong ? { strokeWidth: 3.2 } : undefined
  if (tone === 'soft')
    return (
      <g className="f-soft">
        <rect x={x} y={y} width={w} height={h} rx={rx} className="f-shape" style={sw} />
      </g>
    )
  if (tone === 'panel') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-panel" style={sw} />
  if (tone === 'env') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-env" style={sw} />
  if (tone === 'dash') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-env" strokeDasharray="8 5" style={sw} />
  const f = FILLS[tone]
  if (f) return <rect x={x} y={y} width={w} height={h} rx={rx} style={{ ...f, ...(sw ?? {}) }} />
  return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-shape" style={sw} />
}

export type Ink = 'ink' | 'muted' | 'accent' | 'warn' | 'bad'
export const inkProps = (ink: Ink) =>
  ink === 'warn' ? { style: { fill: 'var(--wb-warn)' } } : ink === 'bad' ? { style: { fill: 'var(--wb-bad)' } } : { className: ink === 'muted' ? 'f-muted' : ink === 'accent' ? 'f-accent-ink' : 'f-label' }

/** Lines of text anchored on (x, y); the block is vertically centered on y. */
export function Lines({ x, y, lines, size, anchor = 'middle', weight = 500, ink = 'ink', lh = 1.22, italic = false, strike = false }: { x: number; y: number; lines: string[]; size: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; ink?: Ink; lh?: number; italic?: boolean; strike?: boolean }) {
  const step = size * lh
  const top = y - ((lines.length - 1) * step) / 2
  return (
    <>
      {lines.map((l, i) => (
        <text key={i} x={x} y={top + i * step} textAnchor={anchor} dominantBaseline="central" fontSize={size} fontWeight={weight} fontStyle={italic ? 'italic' : undefined} textDecoration={strike ? 'line-through' : undefined} {...inkProps(ink)}>
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

export function Arrow({ d, id, tone = 'ink', dashed = false, width, both = false }: { d: string; id: string; tone?: 'ink' | 'accent' | 'muted' | 'warn'; dashed?: boolean; width?: number; both?: boolean }) {
  const style = tone === 'warn' ? { stroke: 'var(--wb-warn)', strokeWidth: width ?? 2.8 } : tone === 'muted' ? { stroke: 'var(--wb-muted)', strokeWidth: width ?? 1.8 } : { strokeWidth: width ?? 2.2 }
  return <path d={d} className={`f-arrow${tone === 'accent' ? ' accent' : ''}`} style={style} strokeDasharray={dashed ? '8 6' : undefined} markerEnd={`url(#${id}-${tone})`} markerStart={both ? `url(#${id}-${tone})` : undefined} fill="none" />
}

export function Svg({ w, h, alt, children }: { w: number; h: number; alt: string; children: (id: string) => ReactNode }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="lf-svg" role="img" aria-label={alt}>
      <Markers id={id} />
      {children(id)}
    </svg>
  )
}

/** Greedy word wrap by character count (about 0.53 × font size per character in IBM Plex Sans). */
export function wrap(text: string, max: number): string[] {
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
/** Characters that fit in `width` user units at font `size`. */
export const fit = (width: number, size: number) => Math.floor(width / (size * 0.55))

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

/** A small eVTOL silhouette (fuselage and two rotor bars) centered at (x, y). */
export function Craft({ x, y, s = 1, dashed = false, accent = false }: { x: number; y: number; s?: number; dashed?: boolean; accent?: boolean }) {
  const st = { stroke: accent ? 'var(--wb-accent)' : 'var(--wb-fg)', strokeWidth: 2.4, fill: 'var(--wb-panel)', strokeLinecap: 'round' as const }
  const da = dashed ? '5 4' : undefined
  return (
    <g>
      <ellipse cx={x} cy={y} rx={22 * s} ry={8 * s} style={st} strokeDasharray={da} />
      <path d={`M ${x - 30 * s} ${y - 15 * s} L ${x - 8 * s} ${y - 15 * s} M ${x + 8 * s} ${y - 15 * s} L ${x + 30 * s} ${y - 15 * s} M ${x - 19 * s} ${y - 15 * s} L ${x - 15 * s} ${y - 6 * s} M ${x + 19 * s} ${y - 15 * s} L ${x + 15 * s} ${y - 6 * s}`} style={{ ...st, fill: 'none' }} strokeDasharray={da} />
    </g>
  )
}

/** A charger: a post with a lightning mark, base at (x, y). */
export function Charger({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g>
      <rect x={x - 16 * s} y={y - 60 * s} width={32 * s} height={60 * s} rx={5} className="f-shape" style={{ strokeWidth: 2 }} />
      <path d={`M ${x + 3 * s} ${y - 52 * s} L ${x - 7 * s} ${y - 30 * s} L ${x + 2 * s} ${y - 30 * s} L ${x - 4 * s} ${y - 9 * s} L ${x + 9 * s} ${y - 35 * s} L ${x} ${y - 35 * s} Z`} style={{ fill: 'var(--wb-accent)' }} />
    </g>
  )
}

/** A check box, optionally ticked, top-left at (x, y). */
export function CheckBox({ x, y, size, ticked = true }: { x: number; y: number; size: number; ticked?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} rx={4} className="f-shape" style={{ strokeWidth: 2 }} />
      {ticked && <path d={`M ${x + size * 0.2} ${y + size * 0.52} L ${x + size * 0.42} ${y + size * 0.75} L ${x + size * 0.82} ${y + size * 0.25}`} fill="none" style={{ stroke: 'var(--wb-accent)', strokeWidth: 3 }} />}
    </g>
  )
}

export const f1 = (x: number) => x.toFixed(1)
export const f2 = (x: number) => x.toFixed(2)
export const f3 = (x: number) => x.toFixed(3)
