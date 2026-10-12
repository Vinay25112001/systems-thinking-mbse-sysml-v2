// SVG charts for the Week 7 activities. Every series is distinguished by line pattern and a text label as well as
// colour, and every chart is paired with a table equivalent by its caller.
import type { Sensitivity, TornadoBar } from './trade'

const PALETTE = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#0891b2', '#be185d', '#4b5563']
const DASH = ['', '8 4', '2 4', '10 4 2 4', '1 6', '14 6', '6 2 2 2', '4 4']
const seriesStyle = (i: number) => ({ stroke: PALETTE[i % PALETTE.length], dash: DASH[i % DASH.length] })

/** Line diagram of total value against one criterion's weight (R18 p.472), with the base weight and reversals marked. */
export function LineDiagram({ s, names, label }: { s: Sensitivity; names: Record<string, string>; label: string }) {
  const W = 560
  const H = 260
  const m = { l: 44, r: 92, t: 12, b: 36 }
  const x = (w: number) => m.l + w * (W - m.l - m.r)
  const y = (v: number) => m.t + (1 - v) * (H - m.t - m.b)
  const rev = [s.down, s.up].filter((r): r is NonNullable<typeof r> => !!r)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl text-slate-700 dark:text-slate-200" role="img" aria-label={label}>
      <rect x={m.l} y={m.t} width={W - m.l - m.r} height={H - m.t - m.b} fill="none" stroke="currentColor" strokeOpacity={0.3} />
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={y(0)} y2={y(0) + 4} stroke="currentColor" />
          <text x={x(t)} y={y(0) + 16} fontSize={11} textAnchor="middle" fill="currentColor">{t.toFixed(2)}</text>
          <line x1={m.l - 4} x2={m.l} y1={y(t)} y2={y(t)} stroke="currentColor" />
          <text x={m.l - 6} y={y(t) + 4} fontSize={11} textAnchor="end" fill="currentColor">{t.toFixed(2)}</text>
        </g>
      ))}
      <text x={(m.l + W - m.r) / 2} y={H - 4} fontSize={11} textAnchor="middle" fill="currentColor">weight of {s.criterion} (others rescaled in proportion)</text>
      <text x={12} y={(m.t + H - m.b) / 2} fontSize={11} textAnchor="middle" fill="currentColor" transform={`rotate(-90 12 ${(m.t + H - m.b) / 2})`}>total value</text>
      <line x1={x(s.base)} x2={x(s.base)} y1={y(1)} y2={y(0)} stroke="currentColor" strokeDasharray="3 3" />
      <text x={x(s.base) + 3} y={y(1) + 11} fontSize={10} fill="currentColor">base {s.base.toFixed(3)}</text>
      {s.lines.map((l, i) => {
        const st = seriesStyle(i)
        const v1 = l.intercept + l.slope
        return (
          <g key={l.id}>
            <line x1={x(0)} y1={y(l.intercept)} x2={x(1)} y2={y(v1)} stroke={st.stroke} strokeWidth={2} strokeDasharray={st.dash} />
            <text x={x(1) + 4} y={y(v1) + 4 + (i % 2 ? 6 : -2)} fontSize={10} fill="currentColor">{l.id}</text>
          </g>
        )
      })}
      {rev.map((r) => {
        const line = s.lines.find((l) => l.id === r.from)!
        const v = line.intercept + line.slope * r.at
        return (
          <g key={r.direction}>
            <circle cx={x(r.at)} cy={y(v)} r={5} fill="none" stroke="currentColor" strokeWidth={2} />
            <text x={x(r.at)} y={y(v) - 9} fontSize={10} textAnchor="middle" fill="currentColor">reversal {r.at.toFixed(3)} → {r.to}</text>
          </g>
        )
      })}
      <title>{names[s.criterion] ?? s.criterion}</title>
    </svg>
  )
}

/** Tornado of the base-case winner's margin over the best other alternative when each weight moves by ±delta. */
export function Tornado({ bars, winner, label }: { bars: TornadoBar[]; winner: string; label: string }) {
  const W = 560
  const rowH = 30
  const H = 40 + bars.length * rowH
  const lo = Math.min(0, ...bars.map((b) => Math.min(b.marginLow, b.marginHigh))) - 0.02
  const hi = Math.max(...bars.map((b) => Math.max(b.marginLow, b.marginHigh, b.marginBase))) + 0.02
  const ml = 80
  const mr = 20
  const x = (v: number) => ml + ((v - lo) / (hi - lo)) * (W - ml - mr)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-2xl text-slate-700 dark:text-slate-200" role="img" aria-label={label}>
      <line x1={x(0)} x2={x(0)} y1={8} y2={H - 26} stroke="currentColor" strokeWidth={1.5} />
      <text x={x(0)} y={H - 12} fontSize={10} textAnchor="middle" fill="currentColor">0 (tie)</text>
      <line x1={x(bars[0]?.marginBase ?? 0)} x2={x(bars[0]?.marginBase ?? 0)} y1={8} y2={H - 26} stroke="currentColor" strokeDasharray="3 3" />
      <text x={x(bars[0]?.marginBase ?? 0)} y={H - 2} fontSize={10} textAnchor="middle" fill="currentColor">base margin {(bars[0]?.marginBase ?? 0).toFixed(3)}</text>
      {bars.map((b, i) => {
        const a = Math.min(b.marginLow, b.marginHigh)
        const z = Math.max(b.marginLow, b.marginHigh)
        const yy = 12 + i * rowH
        return (
          <g key={b.criterion}>
            <text x={ml - 6} y={yy + 14} fontSize={11} textAnchor="end" fill="currentColor">{b.criterion}</text>
            <rect x={x(a)} y={yy} width={Math.max(1, x(z) - x(a))} height={18} fill={b.flips ? '#dc2626' : '#2563eb'} fillOpacity={0.35} stroke="currentColor" strokeDasharray={b.flips ? '4 2' : ''} />
            {b.flips && <text x={x(z) + 4} y={yy + 14} fontSize={10} fill="currentColor">✗ {winner} loses</text>}
          </g>
        )
      })}
    </svg>
  )
}

/** Horizontal bars for probabilities or values with the number printed beside each bar. */
export function Bars({ rows, label, max = 1, digits = 3 }: { rows: { id: string; value: number; note?: string }[]; label: string; max?: number; digits?: number }) {
  return (
    <div role="img" aria-label={label} className="space-y-1">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center gap-2 text-xs">
          <span className="w-16 shrink-0">{r.id}</span>
          <span className="h-3 rounded bg-brand-600/70 dark:bg-brand-500/70" style={{ width: `${Math.max(0.5, (100 * Math.max(0, r.value)) / max) * 0.7}%` }} />
          <span>
            {r.value.toFixed(digits)}
            {r.note ? ` ${r.note}` : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
