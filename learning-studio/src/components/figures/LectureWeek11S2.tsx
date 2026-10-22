// Week 11, Session 2 lecture figures (original drawings): the three meanings of the warm-up drafts, a logical connection
// and a medium modeled as a part, flows established by an interface, the AeroLink interface set, the predict card (no
// result on its face), the week's checker calibration, six common errors, the interface review checklist, the mapping
// from the Phase I package to model v0.4, the bridge to Week 12, the Lab L11 deliverables, the in-class steps and the
// seven-day plan. Every ID, count and value comes from src/content/lectures/week11/aerolinkCase.ts, listings.ts or
// labBrief.ts; every label meets the 1/56-of-slide-width rule (week7FigureKit.ts; week11FigureKit.test.ts).
// Review status: new-pending-review.
import { AEROLINK_W11_MODEL, COUNTS } from '../../content/lectures/week11/aerolinkCase'
import { LAB11_OUTPUTS, REVIEW_CHECKS, SEVEN_DAY_PLAN as PLAN } from '../../content/lectures/week11/labBrief'
import { CALIBRATION } from '../../content/lectures/week11/listings'
import { Arrow, Card, Grid, Line, Lines, Shape, Svg } from './LectureWeek7Parts'
import { SEVEN_DAYS_11, T_11, T_7_11, W11, codeLines, short } from './week11FigureKit'
import { fit, wrap } from './week7FigureKit'

const S = T_11
const W = W11.w
const H = W11.h

export function ThreeMeaningsFigure({ alt }: { alt: string }) {
  const rows: { label: string; kind: 'flow' | 'back' | 'bind' }[] = [
    { label: 'flow: coolant moves', kind: 'flow' },
    { label: 'flow, the wrong way', kind: 'back' },
    { label: 'bind: same value, nothing moves', kind: 'bind' },
  ]
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          {rows.map((r, i) => {
            const y = 10 + i * 170
            return (
              <g key={r.label}>
                <Card x={14} y={y + 10} w={200} h={76} lines={['pump']} size={S} />
                <Card x={686} y={y + 10} w={200} h={76} lines={['engine']} size={S} />
                {r.kind === 'flow' && <Arrow id={id} d={`M 218 ${y + 48} L 682 ${y + 48}`} tone="ok" width={5} />}
                {r.kind === 'back' && <Arrow id={id} d={`M 682 ${y + 48} L 218 ${y + 48}`} tone="bad" width={5} />}
                {r.kind === 'bind' && <Lines x={450} y={y + 48} lines={['=']} size={S} weight={800} ink="warn" />}
                <Lines x={450} y={y + 124} lines={[r.label]} size={S} weight={700} ink={r.kind === 'flow' ? 'ok' : r.kind === 'back' ? 'bad' : 'warn'} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function ConnectionMediumFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={14} y={40} w={220} h={80} lines={['pump']} size={S} />
          <Card x={666} y={40} w={220} h={80} lines={['tank']} size={S} />
          <Line x1={236} y1={80} x2={664} y2={80} tone="accent" width={5} />
          <Lines x={450} y={170} lines={['logical connection']} size={S} weight={700} ink="accent" />
          <Card x={14} y={280} w={220} h={80} lines={['pump']} size={S} />
          <Card x={340} y={280} w={220} h={80} lines={['plumbing']} size={S} tone="soft" />
          <Card x={666} y={280} w={220} h={80} lines={['tank']} size={S} />
          <Line x1={236} y1={320} x2={338} y2={320} tone="ink" width={4} />
          <Line x1={562} y1={320} x2={664} y2={320} tone="ink" width={4} />
          <Lines x={450} y={430} lines={['the medium as a part']} size={S} weight={700} />
        </>
      )}
    </Svg>
  )
}

export function FlowEstablishedFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={60} w={330} h={240} lines={['interface', 'definition', 'flow a.x to b.x', 'flow b.y to a.y']} size={S} tone="panel" />
          <Arrow id={id} d="M 344 180 L 420 180" tone="accent" width={4} />
          <Lines x={382} y={340} lines={['used by']} size={S} weight={700} ink="accent" />
          <Card x={440} y={30} w={180} h={300} lines={['part']} size={S} />
          <Card x={710} y={30} w={180} h={300} lines={['part']} size={S} />
          <Shape x={606} y={150} w={28} h={28} tone="soft" rx={4} />
          <Shape x={696} y={150} w={28} h={28} tone="soft" rx={4} />
          <Arrow id={id} d="M 636 158 L 692 158" tone="ink" width={3} />
          <Arrow id={id} d="M 692 176 L 636 176" tone="ink" width={3} />
          <Lines x={665} y={420} lines={['x one way, y back']} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function InterfaceSetFigure({ alt }: { alt: string }) {
  const bars: [string, number][] = [
    ['physical', COUNTS.physicalIfs],
    ['information', COUNTS.informationIfs],
    ['organizational', COUNTS.organizationalIfs],
  ]
  const max = Math.max(...bars.map((b) => b[1]))
  const deg = new Map<string, number>()
  for (const x of AEROLINK_W11_MODEL.interfaces) for (const e of [x.endA, x.endB]) deg.set(e, (deg.get(e) ?? 0) + 1)
  const [hub, n] = [...deg.entries()].sort((a, b) => b[1] - a[1])[0]
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          {bars.map(([k, v], i) => (
            <g key={k}>
              <Lines x={14} y={60 + i * 110} lines={[k]} size={S} anchor="start" weight={600} />
              <Shape x={14} y={80 + i * 110} w={Math.max(20, (v / max) * 440)} h={36} tone="ok" rx={4} />
              <Lines x={24 + Math.max(20, (v / max) * 440)} y={98 + i * 110} lines={[String(v)]} size={S} anchor="start" weight={700} />
            </g>
          ))}
          <Card x={560} y={40} w={330} h={260} lines={[short(hub), `an end of ${n}`, 'interfaces']} size={S} weight={600} strong />
          <Lines x={W / 2} y={420} lines={[`${COUNTS.portDefs} port defs, ${COUNTS.ports} ports, ${COUNTS.flows} flows`]} size={S} weight={600} ink="muted" />
        </>
      )}
    </Svg>
  )
}

/** A drawn code card: the listing's lines (indent by level), with no checker result on it. */
function CodeCard({ alt, title, lines }: { alt: string; title?: string; lines: { text: string; level: number }[] }) {
  const top = title ? 92 : 50
  const step = Math.min(48, (H - top - 20) / Math.max(1, lines.length))
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Shape x={6} y={6} w={W - 12} h={H - 12} tone="panel" />
          {title && <Lines x={30} y={46} lines={[title]} size={S} anchor="start" weight={700} ink="accent" />}
          {lines.map((l, i) => (
            <Lines key={i} x={30 + l.level * 30} y={top + i * step} lines={[l.text]} size={S} anchor="start" />
          ))}
        </>
      )}
    </Svg>
  )
}
export function PredictCardFigure11b({ alt }: { alt: string }) {
  return <CodeCard alt={alt} title="Accepted, warned or rejected?" lines={codeLines('predict-satisfy', 0, undefined, 44)} />
}

export function CheckerTableFigure11b({ alt }: { alt: string }) {
  const cw = 430
  const max = fit(cw - 30, S)
  const col = (list: typeof CALIBRATION) => {
    let y = 92
    return list.map((c) => {
      const lines = wrap(c.label + (c.result === 'PASS with warnings' ? ' (warning)' : ''), max)
      const h = lines.length * 38 + 10
      const out = { c, lines, y, h }
      y += h + 6
      return out
    })
  }
  const rej = col(CALIBRATION.filter((c) => c.result === 'FAIL'))
  const acc = col(CALIBRATION.filter((c) => c.result !== 'FAIL'))
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={10} y={10} w={cw} h={70} lines={['checker rejects']} size={S} weight={700} tone="ok" />
          <Card x={460} y={10} w={cw} h={70} lines={['checker accepts']} size={S} weight={700} tone="warn" />
          {rej.map((r) => (
            <Card key={r.c.file} x={10} y={r.y} w={cw} h={r.h} lines={r.lines} size={S} tone="soft" />
          ))}
          {acc.map((r) => (
            <Card key={r.c.file} x={460} y={r.y} w={cw} h={r.h} lines={r.lines} size={S} tone="soft" />
          ))}
        </>
      )}
    </Svg>
  )
}

export function CommonErrorsFigure({ alt }: { alt: string }) {
  const errs = ['same port type at both ends', 'flow the wrong way', 'binding used as a transfer', 'interface not in Week 5', 'no nested functions', 'satisfy on the wrong element']
  const max = fit(400, S)
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          {errs.map((e, i) => (
            <Card key={e} x={10 + (i % 2) * 450} y={10 + Math.floor(i / 2) * 170} w={430} h={150} lines={wrap(e, max)} size={S} tone="soft" />
          ))}
        </>
      )}
    </Svg>
  )
}

/** Short face of each check (the full text is in labBrief.ts REVIEW_CHECKS, the lesson and the lab page). */
const CHECK_LABELS: Record<string, string> = {
  elements: 'elements and components as parts',
  allocation: 'logical to physical, nested',
  ports: 'ports: end B conjugate',
  flows: 'flows the right way',
  interfaces: 'every Week 5 interface, none invented',
  requirements: 'interface requirements allocated',
  satisfy: 'satisfy: conforming, with a basis',
  externals: 'externals have an interface',
}
export function ChecklistCardFigure11({ alt }: { alt: string }) {
  const rh = (H - 20) / REVIEW_CHECKS.length
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          {REVIEW_CHECKS.map((c, i) => {
            const y = 10 + i * rh
            return (
              <g key={c.id}>
                <Shape x={14} y={y + rh / 2 - 17} w={34} h={34} tone="panel" rx={4} />
                <Lines x={70} y={y + rh / 2} lines={[CHECK_LABELS[c.id] ?? c.id]} size={S} anchor="start" />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

/** Short face of the Week 11 mapping (the full mapping table is in labBrief.ts, the lesson and the lab page). */
const MAP_ROWS: [string, string][] = [
  ['PHY', 'part def and part'],
  ['CMP', 'nested part'],
  ['FN on PHY', 'perform'],
  ['LOG to PHY', 'allocate, nested'],
  ['EXT', 'ref part'],
  ['IF', 'port def, interface'],
  ['IF org.', 'connection'],
  ['crossing', 'directed item, flow'],
  ['interface REQ', 'allocate twice'],
  ['claim', 'satisfy'],
]
export function MappingFigure11({ alt }: { alt: string }) {
  const xs = [10, 300, 890]
  const top = 4
  const rh = (H - 8) / (MAP_ROWS.length + 1)
  const ys = Array.from({ length: MAP_ROWS.length + 2 }, (_, i) => top + i * rh)
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Grid xs={xs} ys={ys} />
          <Lines x={155} y={top + rh / 2} lines={['Phase I']} size={S} weight={700} />
          <Lines x={595} y={top + rh / 2} lines={['model v0.4']} size={S} weight={700} />
          {MAP_ROWS.map(([a, b], j) => {
            const y = top + (j + 1.5) * rh
            return (
              <g key={a}>
                <Lines x={155} y={y} lines={[a]} size={S} weight={600} />
                <Lines x={320} y={y} lines={[b]} size={S} anchor="start" />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

function Bars({ alt, rows }: { alt: string; rows: string[] }) {
  const gap = 18
  const h = (H - 20 - gap * (rows.length - 1)) / rows.length
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          {rows.map((t, i) => (
            <g key={t}>
              <Card x={20} y={10 + i * (h + gap)} w={860} h={h} lines={[t]} size={S} tone="soft" />
              {i < rows.length - 1 && <Arrow id={id} d={`M 450 ${10 + i * (h + gap) + h} L 450 ${10 + (i + 1) * (h + gap)}`} tone="ink" width={3} />}
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}
export function BridgeFigure11({ alt }: { alt: string }) {
  return <Bars alt={alt} rows={['satisfy claims, to verify', 'interface requirements, a case each', 'need to evidence, audited']} />
}
export function DeliverablesFigure11({ alt }: { alt: string }) {
  return <Bars alt={alt} rows={[...LAB11_OUTPUTS.map((o) => o.file), 'one upload, before Week 12']} />
}
export function LabMapFigure11({ alt }: { alt: string }) {
  return <Bars alt={alt} rows={['2 min · import both files', '2 min · link definitions, place functions', '7 min · each interface: items, directions', '1 min · preview ports and flows']} />
}

export function SevenDaysFigure11({ alt }: { alt: string }) {
  const s = T_7_11
  const left = 20
  const dw = (SEVEN_DAYS_11.w - 40) / 7
  const top = 50
  const rh = (SEVEN_DAYS_11.h - top - 10) / PLAN.length
  return (
    <Svg w={SEVEN_DAYS_11.w} h={SEVEN_DAYS_11.h} alt={alt}>
      {() => (
        <>
          {Array.from({ length: 7 }, (_, d) => (
            <g key={d}>
              <Line x1={left + d * dw} y1={top - 6} x2={left + d * dw} y2={SEVEN_DAYS_11.h - 6} tone="muted" width={1.4} />
              <Lines x={left + d * dw + dw / 2} y={22} lines={[`Day ${d + 1}`]} size={s} weight={700} />
            </g>
          ))}
          {PLAN.map((p, i) => {
            const x = left + (p.from - 1) * dw + 4
            const w = (p.to - p.from + 1) * dw - 8
            const y = top + i * rh + 4
            const inside = p.task.length * s * 0.56 + 16 < w
            const labelRight = x + w + 10 + p.task.length * s * 0.56 < SEVEN_DAYS_11.w
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
