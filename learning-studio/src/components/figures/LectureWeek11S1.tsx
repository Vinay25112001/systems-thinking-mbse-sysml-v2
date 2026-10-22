// Week 11, Session 1 lecture figures (original drawings; none redraws an OMG, SEBoK or training-deck figure): the week
// band, the driving-question code card (no result on it), the import lanes, elements and interfaces, layers, a split
// allocation, the pitfalls card, the allocation matrix, a design property, the anatomy of a port, matching ports, a port
// definition and its conjugate, the crossings of one interface, the predict card, the checker calibration and the exit
// card. Every ID, name and count comes from src/content/lectures/week11/aerolinkCase.ts or listings.ts through
// week11FigureKit.ts; every label meets the 1/56-of-slide-width rule (week7FigureKit.ts, checked by
// week11FigureKit.test.ts). These are course illustrations, not SysML v2 graphical notation (every caption says so).
// Review status: new-pending-review.
import { ALLOCATION_GRID, DESIGN_VALUES } from '../../content/lectures/week11/aerolinkCase'
import { CALIBRATION } from '../../content/lectures/week11/listings'
import { Arrow, Card, Chip, Line, Lines, Shape, Svg } from './LectureWeek7Parts'
import { ELEMENT_IDS, T_11, W11, codeLines, componentsOf, crossingsOf, elementLinks, homesOf, short } from './week11FigureKit'
import { fit, wrap } from './week7FigureKit'

const S = T_11
const W = W11.w
const H = W11.h

export function WeekBandFigure11({ alt }: { alt: string }) {
  const weeks = [8, 9, 10, 11, 12, 13, 14]
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={20} y={14} w={400} h={76} lines={['Week 4 physical view']} size={S} tone="soft" />
          <Card x={480} y={14} w={400} h={76} lines={['Week 5 interfaces']} size={S} tone="soft" />
          <Arrow id={id} d="M 220 92 L 560 186" tone="accent" width={5} />
          <Arrow id={id} d="M 680 92 L 680 186" tone="accent" width={5} />
          <Card x={14} y={192} w={200} h={96} lines={['Logical', 'Week 10']} size={S} tone="soft" />
          <Card x={226} y={192} w={220} h={96} lines={['Behavior', 'Week 10']} size={S} tone="soft" />
          <Card x={460} y={192} w={426} h={96} lines={['Physical']} size={S} weight={700} strong />
          <Lines x={20} y={360} lines={['Phase II']} size={S} anchor="start" weight={700} ink="muted" />
          {weeks.map((w, i) => (
            <Chip key={w} cx={250 + i * 96} cy={360} text={String(w)} size={S} tone={w === 11 ? 'box' : 'soft'} ink={w === 11 ? 'accent' : 'ink'} weight={w === 11 ? 800 : 500} />
          ))}
          <Lines x={W / 2} y={460} lines={['model v0.4 of your enterprise']} size={S} weight={600} />
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

export function TwoPortsCardFigure({ alt }: { alt: string }) {
  return <CodeCard alt={alt} lines={codeLines('two-ports-card', 0, undefined, 44)} />
}
export function PredictCardFigure11({ alt }: { alt: string }) {
  return <CodeCard alt={alt} title="Accepted or rejected? Why?" lines={codeLines('predict-undirected', 0, undefined, 44)} />
}

export function ImportLanesFigure11({ alt }: { alt: string }) {
  const docs = ['Physical view', 'Interfaces', 'Model v0.3']
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Lines x={14} y={26} lines={['What enters the model']} size={S} anchor="start" weight={700} ink="muted" />
          {docs.map((d, i) => (
            <Card key={d} x={14 + i * 296} y={56} w={280} h={76} lines={[d]} size={S} tone="soft" />
          ))}
          <Arrow id={id} d="M 154 134 L 154 330" tone="accent" width={4} />
          <Lines x={166} y={220} lines={['PHY,', 'placements']} size={S} anchor="start" weight={700} ink="accent" />
          <Arrow id={id} d="M 400 134 L 400 330" tone="accent" width={4} />
          <Lines x={412} y={200} lines={['CMP, IF,', 'EXT']} size={S} anchor="start" weight={700} ink="accent" />
          <Arrow id={id} d="M 520 134 L 770 330" tone="accent" width={4} />
          <Arrow id={id} d="M 746 134 L 600 330" tone="muted" dashed width={4} />
          <Lines x={886} y={240} lines={['LOG, FN,', 'items']} size={S} anchor="end" weight={700} ink="muted" />
          <Card x={14} y={334} w={620} h={76} lines={['Physical']} size={S} weight={700} strong />
          <Card x={650} y={334} w={236} h={76} lines={['Requirements']} size={S} weight={700} strong />
          <Lines x={14} y={470} lines={['Model packages']} size={S} anchor="start" weight={700} ink="muted" />
        </>
      )}
    </Svg>
  )
}

export function ElementsInterfacesFigure({ alt }: { alt: string }) {
  const pos: Record<string, [number, number]> = { 'PHY-001': [140, 70], 'PHY-003': [140, 440], 'PHY-004': [600, 255], 'PHY-007': [600, 70], 'EXT-002': [600, 440] }
  const links = elementLinks()
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          {links.map((l) => {
            const [x1, y1] = pos[l.a]
            const [x2, y2] = pos[l.b]
            return (
              <g key={l.id}>
                <Line x1={x1} y1={y1} x2={x2} y2={y2} tone="accent" width={4} />
                <Chip cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} text={l.id} size={S} tone="box" ink="accent" />
              </g>
            )
          })}
          {ELEMENT_IDS.map((e) => {
            const [x, y] = pos[e]
            return <Card key={e} x={x - 130} y={y - 40} w={260} h={80} lines={[short(e)]} size={S} weight={600} tone={e.startsWith('EXT') ? 'soft' : 'box'} dashed={e.startsWith('EXT')} />
          })}
        </>
      )}
    </Svg>
  )
}

export function LayersFigure({ alt }: { alt: string }) {
  const comps = componentsOf('PHY-004', fit(190, S))
  const cw = 210
  const gap = (W - 20 - comps.length * cw) / Math.max(1, comps.length - 1)
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={120} y={10} w={660} h={80} lines={['PHY-004 Ops center']} size={S} weight={700} strong />
          {comps.map((c, i) => {
            const x = 10 + i * (cw + gap)
            return (
              <g key={c.id}>
                <Line x1={450} y1={92} x2={x + cw / 2} y2={176} tone="muted" width={2} />
                <Lines x={x + cw / 2} y={200} lines={[c.id]} size={S} weight={700} ink="accent" />
                <Card x={x} y={226} w={cw} h={190} lines={c.lines.slice(0, 4)} size={S} tone="soft" />
              </g>
            )
          })}
          <Lines x={W / 2} y={474} lines={['one level at a time: 5 ± 2']} size={S} weight={600} ink="muted" />
        </>
      )}
    </Svg>
  )
}

export function SplitAllocationFigure({ alt }: { alt: string }) {
  const h = homesOf('LOG-001')
  const n = h.homes.length
  const cw = (W - 20 - (n - 1) * 30) / n
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={150} y={10} w={600} h={120} lines={[h.def, h.performs.join(', ')]} size={S} weight={600} strong />
          {h.homes.map((p, i) => {
            const x = 10 + i * (cw + 30)
            return (
              <g key={p.phy}>
                <Arrow id={id} d={`M 450 132 L ${x + cw / 2} 300`} tone="accent" width={4} />
                <Card x={x} y={306} w={cw} h={140} lines={[short(p.phy), p.fns.join(', ')]} size={S} tone="soft" />
              </g>
            )
          })}
          <Lines x={W / 2} y={490} lines={['one logical element, two homes']} size={S} weight={600} ink="accent" />
        </>
      )}
    </Svg>
  )
}

export function PitfallCardFigure11({ alt }: { alt: string }) {
  const pit = ['too many levels', 'no logical model', 'straight to technology']
  const pra = ['modularity', 'focus on interfaces']
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={10} y={10} w={430} h={70} lines={['Pitfalls']} size={S} weight={700} tone="warn" />
          <Card x={460} y={10} w={430} h={70} lines={['Practices']} size={S} weight={700} tone="ok" />
          {pit.map((p, i) => (
            <Card key={p} x={10} y={96 + i * 100} w={430} h={86} lines={[p]} size={S} tone="soft" />
          ))}
          {pra.map((p, i) => (
            <Card key={p} x={460} y={96 + i * 100} w={430} h={86} lines={[p]} size={S} tone="soft" />
          ))}
          <Card x={10} y={406} w={880} h={100} lines={['outputs: function to element matrix,', 'requirement trace']} size={S} tone="panel" />
        </>
      )}
    </Svg>
  )
}

export function AllocMatrixFigure11({ alt }: { alt: string }) {
  const g = ALLOCATION_GRID
  const x0 = 170
  const cw = (W - x0 - 10) / g.cols.length
  const rh = (H - 70) / g.rows.length
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          {g.cols.map((c, j) => (
            <Lines key={c} x={x0 + j * cw + cw / 2} y={30} lines={[c.replace('PHY-', '')]} size={S} weight={700} />
          ))}
          {g.rows.map((r, i) => (
            <g key={r.log}>
              <Line x1={10} y1={58 + i * rh} x2={W - 10} y2={58 + i * rh} tone="muted" width={1.4} />
              <Lines x={14} y={58 + i * rh + rh / 2} lines={[r.log]} size={S} anchor="start" weight={600} />
              {r.cells.map((on, j) => (on ? <Lines key={j} x={x0 + j * cw + cw / 2} y={58 + i * rh + rh / 2} lines={['X']} size={S} weight={800} ink="accent" /> : null))}
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

export function DesignPropertyFigure({ alt }: { alt: string }) {
  const d = DESIGN_VALUES[0]
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={40} w={270} h={200} lines={['required', `≤ ${d.threshold} ${d.unit}`]} size={S} weight={600} />
          <Card x={315} y={40} w={270} h={200} lines={['design value', `${d.cbe} ${d.unit}`, d.tpm]} size={S} weight={600} tone="soft" />
          <Card x={620} y={40} w={270} h={200} lines={['compared', `${d.cbe} ≤ ${d.threshold}`]} size={S} weight={600} tone="ok" />
          <Arrow id={id} d="M 282 140 L 312 140" tone="ink" width={3} />
          <Arrow id={id} d="M 587 140 L 617 140" tone="ink" width={3} />
          <Lines x={W / 2} y={330} lines={['charge time to the dispatch threshold']} size={S} weight={600} ink="muted" />
          <Lines x={W / 2} y={430} lines={['a claim to verify, with its basis']} size={S} weight={700} ink="accent" />
        </>
      )}
    </Svg>
  )
}

export function PortAnatomyFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={60} w={420} h={260} lines={['port def', 'out item …', 'in item …']} size={S} tone="panel" weight={600} />
          <Shape x={560} y={60} w={320} h={260} tone="box" strong />
          <Lines x={720} y={190} lines={['part']} size={S} weight={700} />
          <Shape x={540} y={160} w={40} h={40} tone="soft" rx={4} />
          <Lines x={560} y={240} lines={['port']} size={S} weight={700} ink="accent" />
          <Arrow id={id} d="M 538 180 L 434 180" tone="accent" width={4} />
          <Lines x={486} y={420} lines={['typed by']} size={S} weight={700} ink="accent" />
        </>
      )}
    </Svg>
  )
}

export function MatchingFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={20} w={330} h={110} lines={['out oxygen']} size={S} />
          <Card x={560} y={20} w={330} h={110} lines={['out oxygen']} size={S} />
          <Lines x={450} y={75} lines={['✗']} size={S} weight={800} ink="bad" />
          <Lines x={450} y={180} lines={['no match']} size={S} weight={700} ink="bad" />
          <Card x={10} y={270} w={330} h={110} lines={['out oxygen']} size={S} />
          <Card x={560} y={270} w={330} h={110} lines={['in oxygen']} size={S} />
          <Arrow id={id} d="M 344 325 L 556 325" tone="ok" width={5} />
          <Lines x={450} y={440} lines={['match: out to in']} size={S} weight={700} ink="ok" />
        </>
      )}
    </Svg>
  )
}

export function ConjugateFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={40} w={380} h={300} lines={['OxygenPort', 'out oxygen', 'in pressureAlarm']} size={S} weight={600} tone="panel" />
          <Card x={510} y={40} w={380} h={300} lines={['~OxygenPort', 'in oxygen', 'out pressureAlarm']} size={S} weight={600} tone="soft" />
          <Arrow id={id} d="M 394 190 L 506 190" tone="accent" width={4} both />
          <Lines x={W / 2} y={430} lines={['reversed']} size={S} weight={700} ink="accent" />
        </>
      )}
    </Svg>
  )
}

export function CrossingsTableFigure({ alt }: { alt: string }) {
  const rows = crossingsOf('IF-005')
  const rh = (H - 80) / rows.length
  const max = fit(500, S)
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Lines x={14} y={36} lines={['item']} size={S} anchor="start" weight={700} ink="muted" />
          <Lines x={560} y={36} lines={['direction']} size={S} anchor="start" weight={700} ink="muted" />
          {rows.map((r, i) => (
            <g key={r.item}>
              <Line x1={10} y1={66 + i * rh} x2={W - 10} y2={66 + i * rh} tone="muted" width={1.4} />
              <Lines x={14} y={66 + i * rh + rh / 2 - 20} lines={wrap(r.item, max).slice(0, 2)} size={S} anchor="start" weight={600} />
              <Lines x={560} y={66 + i * rh + rh / 2 - 20} lines={[`${r.from} →`, r.to]} size={S} anchor="start" />
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

export function CheckerTableFigure11({ alt }: { alt: string }) {
  const rows = CALIBRATION.filter((c) => c.session === 1)
  const cw = 430
  const max = fit(cw - 30, S)
  const col = (list: typeof rows) => {
    let y = 96
    return list.map((c) => {
      const lines = wrap(c.label, max)
      const h = lines.length * 40 + 12
      const out = { c, lines, y, h }
      y += h + 8
      return out
    })
  }
  const rej = col(rows.filter((c) => c.result === 'FAIL'))
  const acc = col(rows.filter((c) => c.result !== 'FAIL'))
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={10} y={10} w={cw} h={72} lines={['checker rejects']} size={S} weight={700} tone="ok" />
          <Card x={460} y={10} w={cw} h={72} lines={['checker accepts']} size={S} weight={700} tone="warn" />
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

export function ExitCardFigure11({ alt }: { alt: string }) {
  const fields = ['ends A and B', 'crossings', 'port definition', 'conjugate end']
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Shape x={10} y={10} w={880} h={500} tone="panel" />
          {fields.map((f, i) => (
            <g key={f}>
              <Shape x={40 + (i % 2) * 420} y={40 + Math.floor(i / 2) * 150} w={390} h={120} tone="env" />
              <Lines x={60 + (i % 2) * 420} y={80 + Math.floor(i / 2) * 150} lines={[f]} size={S} anchor="start" weight={700} />
            </g>
          ))}
          <Chip cx={450} cy={420} text="and two questions" size={S} tone="soft" ink="accent" />
        </>
      )}
    </Svg>
  )
}
