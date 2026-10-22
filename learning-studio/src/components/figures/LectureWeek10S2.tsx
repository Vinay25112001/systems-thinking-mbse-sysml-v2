// Week 10, Session 2 lecture figures (original drawings): a function and its operational mode, the anatomy of a state
// definition, the five parts of a transition, entry and do actions, a parallel state with the forbidden transition, the
// four links from behavior to structure on one AeroLink function, the predict-the-checker cards (no results on the face:
// the reveal is the next slide), the five scenarios as use cases, the flow-and-states cross-check, the behavior review
// checklist, the mapping from the Phase I package to model v0.3, the bridge to Week 11, the Lab L10 deliverables, the
// in-class mapping and the seven-day plan. Every ID, count and value comes from src/content/lectures/week10/aerolinkCase.ts,
// listings.ts or labBrief.ts; every label meets the 1/56-of-slide-width rule (week7FigureKit.ts; week10FigureKit.test.ts).
// Review status: new-pending-review.
import { AEROLINK_W10_MODEL, CROSS_CHECK, MACHINE, THREAD } from '../../content/lectures/week10/aerolinkCase'
import { LAB10_OUTPUTS, REVIEW_CHECKS, SEVEN_DAY_PLAN as PLAN } from '../../content/lectures/week10/labBrief'
import { listing } from '../../content/lectures/week10/listings'
import { Arrow, Card, Chip, Grid, Line, Lines, Shape, Svg } from './LectureWeek7Parts'
import { FB, T_FB, minLabelFor } from './week7FigureKit'
import { SEVEN_DAYS, T_7 } from './week9FigureKit'

const S = T_FB
const W = FB.w
const H = FB.h
/** The full-width canvas (a figure with nothing below it on the slide) and its smallest label. */
const WIDE = { w: 1500, h: 560 }
const SW = minLabelFor('figure', WIDE.w, WIDE.h)
const mono = { fontFamily: 'var(--wb-mono, monospace)' }

export function FunctionModeFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={150} w={360} h={150} lines={[THREAD.fn, 'Fly passenger', 'trip']} size={S} weight={600} />
          <Card x={530} y={150} w={360} h={150} lines={['state', THREAD.state]} size={S} weight={600} strong />
          <Arrow id={id} d="M 378 225 L 522 225" tone="accent" width={4} both />
          <Lines x={190} y={360} lines={['function:', '“to fly”']} size={S} weight={700} />
          <Lines x={710} y={360} lines={['mode:', '“in flight”']} size={S} weight={700} ink="accent" />
          <Lines x={W / 2} y={60} lines={['two views of one behavior']} size={S} weight={700} />
        </>
      )}
    </Svg>
  )
}

export function StateAnatomyFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Shape x={6} y={6} w={888} h={508} tone="env" rx={18} />
          <Lines x={24} y={40} lines={['state def AircraftOperatingStates']} size={S} weight={700} anchor="start" />
          <circle cx={70} cy={150} r={16} style={{ fill: 'var(--wb-fg)' }} />
          <Arrow id={id} d="M 88 150 L 168 150" tone="ink" width={3} />
          <Card x={172} y={110} w={210} h={80} lines={['onPad']} size={S} weight={600} />
          <Arrow id={id} d="M 386 150 L 556 150" tone="accent" width={4} />
          <Card x={560} y={110} w={250} h={80} lines={['charging']} size={S} weight={600} />
          <Lines x={150} y={250} lines={['first start', 'then onPad']} size={S} anchor="start" />
          <Lines x={470} y={250} lines={['transition']} size={S} weight={600} ink="accent" />
          <Lines x={680} y={250} lines={['state']} size={S} />
          <Lines x={W / 2} y={400} lines={['one state active at a time', 'after entry']} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function TransitionPartsFigure({ alt }: { alt: string }) {
  const rows: { code: string; part: string; dashed?: boolean }[] = [
    { code: 'first dispatchReady', part: 'source' },
    { code: 'accept DispatchRelease', part: 'trigger' },
    { code: 'if not noGoFaultOpen', part: 'guard' },
    { code: 'do …', part: 'effect', dashed: true },
    { code: 'then inFlight', part: 'target' },
  ]
  const h = 84
  const gap = 18
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          {rows.map((r, i) => (
            <g key={r.part}>
              <Shape x={10} y={10 + i * (h + gap)} w={560} h={h} tone={r.dashed ? 'dash' : i === 2 ? 'soft' : 'box'} />
              <text x={30} y={10 + i * (h + gap) + h / 2} fontSize={S} dominantBaseline="central" className="f-label" style={mono}>
                {r.code}
              </text>
              <Lines x={600} y={10 + i * (h + gap) + h / 2} lines={[r.part]} size={S} anchor="start" weight={700} ink={i === 2 ? 'accent' : 'ink'} />
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

export function EntryDoFigure({ alt }: { alt: string }) {
  const out = MACHINE.states.find((s) => s.entry)!
  const ch = MACHINE.states.find((s) => s.do)!
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={10} y={20} w={420} h={190} lines={[`entry ${out.entry}`]} size={S} title={out.name} strong />
          <Card x={470} y={20} w={420} h={190} lines={[`do ${ch.do}`]} size={S} title={ch.name} strong />
          <Lines x={30} y={290} lines={['entry: on entry']} size={S} anchor="start" weight={600} />
          <Lines x={30} y={360} lines={['do: while in the state']} size={S} anchor="start" weight={600} ink="accent" />
          <Lines x={30} y={430} lines={['exit: on leaving (optional)']} size={S} anchor="start" ink="muted" />
        </>
      )}
    </Svg>
  )
}

export function ParallelRegionsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Shape x={6} y={6} w={888} h={508} tone="env" rx={18} />
          <Lines x={24} y={38} lines={['aircraftStates: parallel']} size={S} weight={700} anchor="start" />
          <Line x1={450} y1={70} x2={450} y2={500} tone="muted" dashed width={3} />
          <Lines x={230} y={100} lines={['operational']} size={S} weight={600} />
          <Lines x={670} y={100} lines={['health']} size={S} weight={600} />
          <Card x={60} y={150} w={340} h={76} lines={['onPad']} size={S} />
          <Card x={60} y={300} w={340} h={76} lines={['inFlight']} size={S} />
          <Card x={500} y={150} w={340} h={76} lines={['fit']} size={S} />
          <Card x={500} y={300} w={340} h={76} lines={['degraded']} size={S} />
          <Arrow id={id} d="M 404 338 L 496 338" tone="bad" width={4} dashed />
          <Lines x={450} y={290} lines={['✕']} size={S + 8} weight={800} ink="bad" halo />
          <Lines x={W / 2} y={450} lines={['no transition between regions']} size={S} weight={700} ink="bad" halo />
        </>
      )}
    </Svg>
  )
}

export function FourLinksFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={290} y={200} w={320} h={110} lines={[THREAD.fn]} size={S} weight={700} strong />
          <Card x={10} y={10} w={360} h={90} lines={[THREAD.step]} size={S} title="step" />
          <Card x={530} y={10} w={360} h={90} lines={[THREAD.performer]} size={S} title="logical part" />
          <Card x={10} y={410} w={360} h={90} lines={[THREAD.state]} size={S} title="state" />
          <Card x={530} y={410} w={360} h={90} lines={[THREAD.exhibitor]} size={S} title="part def" />
          <Arrow id={id} d="M 190 104 L 330 196" tone="accent" width={4} />
          <Arrow id={id} d="M 710 104 L 570 196" tone="accent" width={4} />
          <Arrow id={id} d="M 190 406 L 330 314" tone="accent" width={4} />
          <Arrow id={id} d="M 526 455 L 374 455" tone="ink" width={4} />
          <Lines x={140} y={160} lines={['subsets']} size={S} weight={600} ink="accent" halo />
          <Lines x={760} y={160} lines={['perform']} size={S} weight={600} ink="accent" halo />
          <Lines x={140} y={350} lines={['do']} size={S} weight={600} ink="accent" halo />
          <Lines x={450} y={380} lines={['exhibit']} size={S} weight={600} halo />
        </>
      )}
    </Svg>
  )
}

export function PredictCardsFigure10({ alt }: { alt: string }) {
  // verbatim code lines of the three predict listings (no recorded result on the face: the reveal is the next slide);
  // the long transition line of card 2 is wrapped for display at "accept"
  const code = (key: string, pick: (l: string) => boolean) => listing(key).lines.map((l) => l.trim()).filter(pick)
  const wrapAt = (l: string) => (l.length > 60 && l.includes(' accept ') ? [l.slice(0, l.indexOf(' accept ')), `    ${l.slice(l.indexOf(' accept ') + 1)}`] : [l])
  const panels = [
    { n: '1', lines: code('predict-two-initial', (l) => l.startsWith('first start')) },
    { n: '2', lines: code('predict-parallel', (l) => l.startsWith('state aircraftStates') || l === 'state operational {' || l.startsWith('transition') || l === 'state health {').flatMap(wrapAt) },
    { n: '3', lines: code('predict-unreachable', (l) => l.startsWith('first start') || l.startsWith('accept') || l === 'state maintenance;') },
  ]
  const row = 40
  let y = 10
  const boxes = panels.map((p) => {
    const h = 24 + p.lines.length * row
    const box = { ...p, y, h }
    y += h + 14
    return box
  })
  return (
    <Svg w={WIDE.w} h={WIDE.h} alt={alt}>
      {() => (
        <>
          {boxes.map((b) => (
            <g key={b.n}>
              <Shape x={10} y={b.y} w={WIDE.w - 20} h={b.h} tone="panel" />
              <Chip cx={50} cy={b.y + b.h / 2} text={b.n} size={SW} tone="soft" ink="accent" weight={800} />
              {b.lines.map((l, k) => (
                <text key={k} x={100} y={b.y + 12 + row / 2 + k * row} fontSize={SW} dominantBaseline="central" className="f-label" style={{ ...mono, whiteSpace: 'pre' }} xmlSpace="preserve">
                  {l}
                </text>
              ))}
            </g>
          ))}
          <Lines x={WIDE.w / 2} y={Math.min(WIDE.h - 24, y + 24)} lines={['each: PASS or FAIL? and does it say what it means?']} size={SW} weight={700} ink="accent" />
        </>
      )}
    </Svg>
  )
}

export function UseCaseMapFigure({ alt }: { alt: string }) {
  const rows = AEROLINK_W10_MODEL.useCases
  const xs = [10, 300, 610, 890]
  const top = 10
  const rh = (H - 20) / (rows.length + 1)
  const ys = Array.from({ length: rows.length + 2 }, (_, i) => top + i * rh)
  const mid = (i: number) => (xs[i] + xs[i + 1]) / 2
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Grid xs={xs} ys={ys} />
          {['use case', 'actors', 'doc only'].map((t, i) => (
            <Lines key={t} x={mid(i)} y={top + rh / 2} lines={[t]} size={S} weight={700} />
          ))}
          {rows.map((r, j) => {
            const y = top + (j + 1.5) * rh
            return (
              <g key={r.id}>
                <Lines x={mid(0)} y={y} lines={[r.id]} size={S} weight={600} />
                <Lines x={mid(1)} y={y} lines={[String(r.actors.length)]} size={S} ink="ok" weight={700} />
                <Lines x={mid(2)} y={y} lines={[String(r.unmapped.length)]} size={S} ink={r.unmapped.length ? 'warn' : 'muted'} weight={700} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function CrossCheckFigure({ alt }: { alt: string }) {
  const rows = CROSS_CHECK
  const xs = [10, 760, WIDE.w - 10]
  const top = 6
  const rh = (WIDE.h - 12) / (rows.length + 1)
  const ys = Array.from({ length: rows.length + 2 }, (_, i) => top + i * rh)
  return (
    <Svg w={WIDE.w} h={WIDE.h} alt={alt}>
      {() => (
        <>
          <Grid xs={xs} ys={ys} />
          <Lines x={30} y={top + rh / 2} lines={['transition (from → to)']} size={SW} weight={700} anchor="start" />
          <Lines x={780} y={top + rh / 2} lines={['SCN-002 steps doing its function']} size={SW} weight={700} anchor="start" />
          {rows.map((r, j) => {
            const y = top + (j + 1.5) * rh
            return (
              <g key={r.transition}>
                <Lines x={30} y={y} lines={[`${r.from} → ${r.to}`]} size={SW} anchor="start" />
                <Lines x={780} y={y} lines={[r.steps.length ? r.steps.join(', ') : 'none: check by hand']} size={SW} anchor="start" weight={r.steps.length ? 600 : 500} ink={r.steps.length ? 'ok' : 'warn'} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

/** Short face labels of the review checks (the full wording is on the slide notes, the lesson and the lab page). */
const CHECK_LABELS: Record<string, string> = {
  steps: 'every step and alternate has a node',
  alternates: 'alternates end or rejoin as written',
  guards: 'every branch guarded, else last',
  flows: 'flows: producer to later consumer',
  functions: 'functions: items and a performer',
  states: 'states reachable, triggers named',
  cross: 'flow and states agree',
  allocation: 'requirements allocated',
}
export function ChecklistCardFigure({ alt }: { alt: string }) {
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

/** Short face of the Week 10 mapping (the full mapping table is in labBrief.ts, the lesson and the lab page). */
const MAP_ROWS: [string, string][] = [
  ['CAP', 'action def'],
  ['INFO', 'item def'],
  ['FN', 'action, in and out items'],
  ['LOG', 'part def and part'],
  ['FN on LOG', 'perform'],
  ['REQ on FN', 'allocate'],
  ['to a CAP', '#derivedFrom'],
  ['SCN', 'use case (one with a flow)'],
  ['modes', 'state def, exhibit'],
]
export function MappingFigure({ alt }: { alt: string }) {
  const xs = [10, 250, 890]
  const top = 6
  const rh = (H - 12) / (MAP_ROWS.length + 1)
  const ys = Array.from({ length: MAP_ROWS.length + 2 }, (_, i) => top + i * rh)
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Grid xs={xs} ys={ys} />
          <Lines x={130} y={top + rh / 2} lines={['Phase I']} size={S} weight={700} />
          <Lines x={570} y={top + rh / 2} lines={['model v0.3']} size={S} weight={700} />
          {MAP_ROWS.map(([a, b], j) => {
            const y = top + (j + 1.5) * rh
            return (
              <g key={a}>
                <Lines x={130} y={y} lines={[a]} size={S} weight={600} />
                <Lines x={270} y={y} lines={[b]} size={S} anchor="start" />
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

export function BridgeFigure10({ alt }: { alt: string }) {
  return <Bars alt={alt} rows={['logical parts → physical parts', 'items → ports and interfaces', 'send and accept → connections', 'first satisfy claims']} />
}
export function DeliverablesFigure10({ alt }: { alt: string }) {
  return <Bars alt={alt} rows={[...LAB10_OUTPUTS.map((o) => o.file), 'one upload, before Week 11']} />
}
export function LabMapFigure({ alt }: { alt: string }) {
  return <Bars alt={alt} rows={['2 min · import, choose the scenario', '6 min · each step: name, function', '3 min · each alternate: a guard', '1 min · preview the flow']} />
}

export function SevenDaysFigure10({ alt }: { alt: string }) {
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
