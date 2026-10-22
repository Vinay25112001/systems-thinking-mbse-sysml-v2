// Week 9, Session 2 lecture figures (original drawings): the two quality questions, the derivation chain with its
// rationale, a fragment of the AeroLink trace matrix (computed from model v0.2's derivations and the Week 2 open
// items), the predict-the-checker cards (no results on the face: the reveal is the next slide), the AI review method,
// the lab tool's steps, the bridge to Weeks 10-13, the Lab L9 deliverables, the in-class chain and the seven-day plan.
// Every ID and value comes from src/content/lectures/week09/aerolinkCase.ts or labBrief.ts; every label meets the
// 1/56-of-slide-width rule (week7FigureKit.ts; week9FigureKit.test.ts). Review status: new-pending-review.
import { CHAIN, TRACE_FRAGMENT } from '../../content/lectures/week09/aerolinkCase'
import { listing } from '../../content/lectures/week09/listings'
import { LAB9_OUTPUTS, SEVEN_DAY_PLAN as PLAN } from '../../content/lectures/week09/labBrief'
import { Arrow, Card, Chip, Grid, Line, Lines, Shape, Svg } from './LectureWeek7Parts'
import { FB, T_FB } from './week7FigureKit'
import { SEVEN_DAYS, T_7 } from './week9FigureKit'

const S = T_FB
const W = FB.w
const H = FB.h

export function TwoQuestionsFigure({ alt }: { alt: string }) {
  const glass = (cx: number, cy: number) => (
    <g>
      <circle cx={cx} cy={cy} r={58} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 6 }} />
      <Line x1={cx + 42} y1={cy + 42} x2={cx + 88} y2={cy + 88} tone="ink" width={12} />
    </g>
  )
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Chip cx={700} cy={40} text={CHAIN.need} size={S} tone="soft" />
          <Card x={300} y={190} w={300} h={86} lines={[CHAIN.stk]} size={S} weight={700} strong />
          {glass(130, 230)}
          {glass(770, 230)}
          <Arrow id={id} d="M 760 168 L 720 70" tone="accent" width={4} />
          <Lines x={150} y={430} lines={['well formed?']} size={S} weight={700} />
          <Lines x={750} y={430} lines={['right intent?']} size={S} weight={700} ink="accent" />
        </>
      )}
    </Svg>
  )
}

export function ChainFigure({ alt }: { alt: string }) {
  const b = CHAIN.budget
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={10} w={460} h={80} lines={[CHAIN.need]} size={S} tone="soft" />
          <Card x={10} y={214} w={460} h={80} lines={[`${CHAIN.stk} ≤ ${b.total} min`]} size={S} weight={600} />
          <Card x={10} y={420} w={460} h={80} lines={[`${CHAIN.sys} ≤ ${b.charge} min`]} size={S} weight={600} strong />
          <Arrow id={id} d="M 240 92 L 240 210" tone="accent" width={4} />
          <Arrow id={id} d="M 240 296 L 240 416" tone="accent" width={4} />
          <Lines x={256} y={152} lines={['derivation']} size={S} anchor="start" weight={600} ink="accent" halo />
          <Lines x={256} y={356} lines={['derivation']} size={S} anchor="start" weight={600} ink="accent" halo />
          <Card x={510} y={150} w={380} h={230} lines={[`${b.total} = ${b.charge} + ${b.padWork}`, 'charge + pad work', 'text, not math']} size={S} tone="env" title="rationale" />
        </>
      )}
    </Svg>
  )
}

export function TraceFragmentFigure({ alt }: { alt: string }) {
  const rows = TRACE_FRAGMENT
  const xs = [10, 180, 470, 690, 890]
  const top = 10
  const rh = (H - 30) / (rows.length + 1)
  const ys = Array.from({ length: rows.length + 2 }, (_, i) => top + i * rh)
  const mid = (i: number) => (xs[i] + xs[i + 1]) / 2
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Grid xs={xs} ys={ys} />
          {['need', 'STK', 'SYS', 'status'].map((t, i) => (
            <Lines key={t} x={mid(i)} y={top + rh / 2} lines={[t]} size={S} weight={700} />
          ))}
          {rows.map((r, j) => {
            const y = top + (j + 1.5) * rh
            return (
              <g key={r.need}>
                <Lines x={mid(0)} y={y} lines={[r.need]} size={S} />
                <Lines x={mid(1)} y={y} lines={[r.stk]} size={S} />
                <Lines x={mid(2)} y={y} lines={[r.sys]} size={S} />
                <Lines x={mid(3)} y={y} lines={[r.status]} size={S} weight={700} ink={r.status === 'partial' ? 'warn' : 'ok'} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function PredictCardsFigure9({ alt }: { alt: string }) {
  // verbatim code lines of the three predict listings (no recorded result on the face: the reveal is the next slide)
  const code = (key: string, pick: (l: string) => boolean) => listing(key).lines.map((l) => l.trim()).filter(pick)
  const panels = [
    { n: '1', lines: code('predict-unquoted', (l) => l.startsWith('requirement')) },
    { n: '2', lines: code('predict-reversed', (l) => l.startsWith('end')) },
    { n: '3', lines: code('predict-satisfy', (l) => l.startsWith('satisfy')) },
  ]
  const mono = { fontFamily: 'var(--wb-mono, monospace)' }
  let y = 10
  const boxes = panels.map((p) => {
    const h = 40 + p.lines.length * 46
    const box = { ...p, y, h }
    y += h + 16
    return box
  })
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          {boxes.map((b) => (
            <g key={b.n}>
              <Shape x={10} y={b.y} w={880} h={b.h} tone="panel" />
              <Chip cx={46} cy={b.y + b.h / 2} text={b.n} size={S} tone="soft" ink="accent" weight={800} />
              {b.lines.map((l, k) => (
                <text key={k} x={88} y={b.y + 43 + k * 46} fontSize={S} dominantBaseline="central" className="f-label" style={mono}>
                  {l}
                </text>
              ))}
            </g>
          ))}
          <Lines x={W / 2} y={Math.min(H - 30, y + 40)} lines={['each: PASS, warning or FAIL?']} size={S} weight={700} ink="accent" />
        </>
      )}
    </Svg>
  )
}

function Bars({ alt, rows, strongFirst = false }: { alt: string; rows: string[]; strongFirst?: boolean }) {
  const gap = 18
  const h = (H - 20 - gap * (rows.length - 1)) / rows.length
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          {rows.map((t, i) => (
            <g key={t}>
              <Card x={20} y={10 + i * (h + gap)} w={860} h={h} lines={[t]} size={S} tone={i === 0 && strongFirst ? 'box' : 'soft'} strong={i === 0 && strongFirst} />
              {i < rows.length - 1 && <Arrow id={id} d={`M 450 ${10 + i * (h + gap) + h} L 450 ${10 + (i + 1) * (h + gap)}`} tone="ink" width={3} />}
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

export function AiFunnelFigure({ alt }: { alt: string }) {
  return <Bars alt={alt} rows={['findings: an ID and a quote', 'triage: decide, with a reason', 'change: in the record', 'check: checker, then the need']} />
}
export function ToolStepsFigure9({ alt }: { alt: string }) {
  return <Bars alt={alt} rows={['1 · import three files', '2 · decide each requirement', '3 · read the trace audit', '4 · preview and export']} />
}
export function BridgeFigure9({ alt }: { alt: string }) {
  return <Bars alt={alt} rows={['Week 10: functions', 'Week 11: satisfy', 'Week 12: verify', 'Week 13: analysis']} />
}
export function DeliverablesFigure9({ alt }: { alt: string }) {
  return <Bars alt={alt} rows={[...LAB9_OUTPUTS.map((o) => o.file), 'one upload, before Week 10']} />
}

export function LabChainFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={10} w={560} h={110} lines={['need', 'stakeholder, frame']} size={S} tone="soft" />
          <Card x={10} y={200} w={560} h={110} lines={['stakeholder req.', 'enterprise subject']} size={S} />
          <Card x={10} y={390} w={560} h={110} lines={['system requirement', 'element subject']} size={S} strong />
          <Arrow id={id} d="M 290 122 L 290 196" tone="accent" width={4} />
          <Arrow id={id} d="M 290 312 L 290 386" tone="accent" width={4} />
          <Chip cx={740} cy={110} text="3 min import" size={S} tone="soft" />
          <Chip cx={740} cy={255} text="5 min" size={S} tone="soft" />
          <Chip cx={740} cy={445} text="4 min" size={S} tone="soft" />
        </>
      )}
    </Svg>
  )
}

export function SevenDaysFigure9({ alt }: { alt: string }) {
  const s = T_7
  const left = 20
  const dw = (SEVEN_DAYS.w - 40) / 7
  const top = 50
  const rh = (SEVEN_DAYS.h - top - 10) / PLAN.length
  return (
    <Svg w={SEVEN_DAYS.w} h={SEVEN_DAYS.h} alt={alt}>
      {() => (
        <>
          {Array.from({ length: 7 }, (_, d) => (
            <g key={d}>
              <Line x1={left + d * dw} y1={top - 6} x2={left + d * dw} y2={SEVEN_DAYS.h - 6} tone="muted" width={1.4} />
              <Lines x={left + d * dw + dw / 2} y={22} lines={[`Day ${d + 1}`]} size={s} weight={700} />
            </g>
          ))}
          {PLAN.map((p, i) => {
            const x = left + (p.from - 1) * dw + 4
            const w = (p.to - p.from + 1) * dw - 8
            const y = top + i * rh + 4
            const inside = p.task.length * s * 0.56 + 16 < w
            const labelRight = x + w + 10 + p.task.length * s * 0.56 < SEVEN_DAYS.w
            return (
              <g key={p.task}>
                <Shape x={x} y={y} w={w} h={rh - 8} tone={i % 2 ? 'soft' : 'box'} rx={6} />
                <Lines x={inside ? x + 10 : labelRight ? x + w + 10 : x - 10} y={y + (rh - 8) / 2} lines={[p.task]} size={s} anchor={inside || labelRight ? 'start' : 'end'} weight={600} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}
