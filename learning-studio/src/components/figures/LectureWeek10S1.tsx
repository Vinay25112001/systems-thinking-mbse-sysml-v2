// Week 10, Session 1 lecture figures (original drawings; none redraws an OMG, SEBoK or training-deck figure): the week
// band, the import lanes, the logical and physical views, the three logical-architecture views, a chain of functions with
// their items, the pitfalls card, an allocation-matrix fragment, flow versus succession, the then shorthand, a decision
// and a merge, the guard number line, the driving-question and predict code cards (no result on them), the checker
// calibration table and the exit card. Every ID, name and count comes from src/content/lectures/week10/aerolinkCase.ts or
// listings.ts through week10FigureKit.ts; every label meets the 1/56-of-slide-width rule (week7FigureKit.ts, checked by
// week10FigureKit.test.ts). These are course illustrations, not SysML v2 graphical notation (every caption says so).
// Review status: new-pending-review.
import { FLOW_NODES, logicalOf } from '../../content/lectures/week10/aerolinkCase'
import { CALIBRATION } from '../../content/lectures/week10/listings'
import { Arrow, Card, Chip, Diamond, Line, Lines, Shape, Svg } from './LectureWeek7Parts'
import { PHYSICAL_OF, T_10, W10, allocationFragment, codeLines, functionChain } from './week10FigureKit'
import { fit, wrap } from './week7FigureKit'

const S = T_10
const W = W10.w
const H = W10.h

export function WeekBandFigure10({ alt }: { alt: string }) {
  const weeks = [8, 9, 10, 11, 12, 13, 14]
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={20} y={14} w={400} h={76} lines={['Week 2 ConOps']} size={S} tone="soft" />
          <Card x={480} y={14} w={400} h={76} lines={['Week 4 architecture']} size={S} tone="soft" />
          <Arrow id={id} d="M 220 92 L 420 186" tone="accent" width={5} />
          <Arrow id={id} d="M 680 92 L 726 186" tone="accent" width={5} />
          <Card x={14} y={192} w={270} h={96} lines={['Requirements', 'Week 9']} size={S} tone="soft" />
          <Card x={300} y={192} w={250} h={96} lines={['Behavior']} size={S} weight={700} strong />
          <Card x={566} y={192} w={320} h={96} lines={['Logical']} size={S} weight={700} strong />
          <Lines x={20} y={360} lines={['Phase II']} size={S} anchor="start" weight={700} ink="muted" />
          {weeks.map((w, i) => (
            <Chip key={w} cx={250 + i * 96} cy={360} text={String(w)} size={S} tone={w === 10 ? 'box' : 'soft'} ink={w === 10 ? 'accent' : 'ink'} weight={w === 10 ? 800 : 500} />
          ))}
          <Lines x={W / 2} y={460} lines={['model v0.3 of your enterprise']} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function ImportLanesFigure10({ alt }: { alt: string }) {
  const docs = ['ConOps', 'Architecture', 'Model v0.2']
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Lines x={14} y={26} lines={['What enters the model']} size={S} anchor="start" weight={700} ink="muted" />
          {docs.map((d, i) => (
            <Card key={d} x={14 + i * 296} y={56} w={280} h={76} lines={[d]} size={S} tone="soft" />
          ))}
          <Arrow id={id} d="M 154 134 L 154 330" tone="accent" width={4} />
          <Lines x={166} y={232} lines={['SCN, CAP']} size={S} anchor="start" weight={700} ink="accent" />
          <Arrow id={id} d="M 450 134 L 450 330" tone="accent" width={4} />
          <Lines x={462} y={210} lines={['FN, LOG, INFO']} size={S} anchor="start" weight={700} ink="accent" />
          <Arrow id={id} d="M 746 134 L 746 330" tone="muted" dashed width={4} />
          <Lines x={734} y={280} lines={['placeholders']} size={S} anchor="end" weight={700} ink="muted" />
          <Card x={14} y={334} w={280} h={76} lines={['Behavior']} size={S} weight={700} strong />
          <Card x={310} y={334} w={576} h={76} lines={['Logical']} size={S} weight={700} strong />
          <Lines x={14} y={470} lines={['Model packages']} size={S} anchor="start" weight={700} ink="muted" />
        </>
      )}
    </Svg>
  )
}

export function TwoViewsFigure({ alt }: { alt: string }) {
  const logs = ['LOG-005', 'LOG-001']
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Lines x={14} y={30} lines={['Logical view: what it must do']} size={S} anchor="start" weight={700} />
          {logs.map((l, i) => (
            <Card key={l} x={14 + i * 452} y={60} w={420} h={80} lines={[logicalOf(l).def]} size={S} weight={600} strong />
          ))}
          {logs.map((l, i) => (
            <g key={`a${l}`}>
              <Arrow id={id} d={`M ${224 + i * 452} 142 L ${224 + i * 452} 318`} tone="muted" dashed width={3} />
              <Chip cx={224 + i * 452} cy={230} text="Week 11" size={S} tone="soft" ink="muted" />
            </g>
          ))}
          <Lines x={14} y={296} lines={['Physical view: a concrete solution']} size={S} anchor="start" weight={700} ink="muted" />
          {logs.map((l, i) => (
            <Card key={`p${l}`} x={14 + i * 452} y={322} w={420} h={80} lines={[PHYSICAL_OF[l]]} size={S} tone="soft" />
          ))}
          <Lines x={W / 2} y={470} lines={['both are parts, at two levels']} size={S} weight={600} ink="accent" />
        </>
      )}
    </Svg>
  )
}

export function ThreePanelsFigure({ alt }: { alt: string }) {
  const panels: [string, string[]][] = [
    ['functional', ['what it', 'transforms']],
    ['behavioral', ['in what', 'order, when']],
    ['temporal', ['how often', 'each runs']],
  ]
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          {panels.map(([t, ls], i) => (
            <g key={t}>
              <Shape x={10 + i * 300} y={10} w={280} h={500} tone="env" />
              <Lines x={150 + i * 300} y={56} lines={[t]} size={S} weight={700} ink="accent" />
              <Lines x={150 + i * 300} y={140} lines={ls} size={S} />
            </g>
          ))}
          <Card x={40} y={260} w={220} h={70} lines={['function']} size={S} />
          <Arrow id={id} d="M 150 332 L 150 420" tone="ink" width={3} />
          <Lines x={150} y={460} lines={['item']} size={S} ink="muted" />
          <Card x={350} y={250} w={180} h={64} lines={['F1']} size={S} />
          <Arrow id={id} d="M 440 316 L 440 362" tone="ink" width={3} />
          <Card x={350} y={366} w={180} h={64} lines={['F2']} size={S} />
          <Lines x={750} y={300} lines={['every 1 s']} size={S} weight={600} />
          <Lines x={750} y={400} lines={['on an event']} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function FunctionChainFigure({ alt }: { alt: string }) {
  const chain = functionChain(['FN-001', 'FN-002', 'FN-011'])
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          {chain.map((f, i) => (
            <Card key={f.id} x={100} y={10 + i * 190} w={700} h={90} lines={[`${f.id} ${f.name}`]} size={S} weight={600} strong={i === 0} />
          ))}
          {chain.slice(0, -1).map((f, i) => (
            <g key={`l${f.id}`}>
              <Arrow id={id} d={`M 300 ${102 + i * 190} L 300 ${196 + i * 190}`} tone={f.item ? 'accent' : 'muted'} dashed={!f.item} width={4} />
              <Lines x={320} y={150 + i * 190} lines={[f.item ?? 'no shared item']} size={S} anchor="start" weight={700} ink={f.item ? 'accent' : 'muted'} />
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

export function PitfallCardFigure({ alt }: { alt: string }) {
  const pit = ['too deep', 'no inputs, outputs', 'a static tree only']
  const pra = ['scenarios first', 'to move ↔ moving', 'control, I/O, trigger']
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={10} y={10} w={430} h={76} lines={['Pitfalls']} size={S} weight={700} tone="warn" />
          <Card x={460} y={10} w={430} h={76} lines={['Practices']} size={S} weight={700} tone="ok" />
          {pit.map((p, i) => (
            <Card key={p} x={10} y={110 + i * 130} w={430} h={110} lines={[p]} size={S} tone="soft" />
          ))}
          {pra.map((p, i) => (
            <Card key={p} x={460} y={110 + i * 130} w={430} h={110} lines={[p]} size={S} tone="soft" />
          ))}
        </>
      )}
    </Svg>
  )
}

export function AllocMatrixFigure({ alt }: { alt: string }) {
  const g = allocationFragment(4)
  const x0 = 250
  const cw = 150
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          {g.cols.map((c, j) => (
            <Lines key={c} x={x0 + j * cw + cw / 2} y={40} lines={[c]} size={S} weight={700} />
          ))}
          {g.rows.map((r, i) => (
            <g key={r.req}>
              <Lines x={20} y={120 + i * 80} lines={[r.req]} size={S} anchor="start" weight={600} />
              <Line x1={20} y1={80 + i * 80} x2={x0 + g.cols.length * cw} y2={80 + i * 80} tone="muted" width={1.4} />
              {r.cells.map((on, j) => (on ? <Lines key={j} x={x0 + j * cw + cw / 2} y={120 + i * 80} lines={['X']} size={S} weight={800} ink="accent" /> : null))}
            </g>
          ))}
          <Lines x={W / 2} y={470} lines={[`${g.allocated} of ${g.total} system requirements allocated`]} size={S} weight={600} ink="muted" />
        </>
      )}
    </Svg>
  )
}

export function ThreeLinksFigure({ alt }: { alt: string }) {
  const rows: { label: string; dashed: boolean; chip: boolean }[] = [
    { label: 'flow', dashed: true, chip: true },
    { label: 'succession', dashed: false, chip: false },
    { label: 'succession flow', dashed: false, chip: true },
  ]
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          {rows.map((r, i) => {
            const y = 10 + i * 170
            return (
              <g key={r.label}>
                <Lines x={14} y={y + 20} lines={[r.label]} size={S} anchor="start" weight={700} ink="accent" />
                <Card x={14} y={y + 46} w={230} h={76} lines={['planFlight']} size={S} />
                <Card x={600} y={y + 46} w={290} h={76} lines={['fileFlightIntent']} size={S} />
                <Arrow id={id} d={`M 246 ${y + 84} L 596 ${y + 84}`} tone={r.dashed ? 'muted' : 'ink'} dashed={r.dashed} width={4} />
                {r.chip && <Chip cx={421} cy={y + 84} text="plan" size={S} tone="soft" ink="accent" />}
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function ThenShorthandFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={10} y={20} w={400} h={160} lines={['first a;', 'then action b;']} size={S} tone="panel" />
          <Lines x={450} y={100} lines={['=']} size={S} weight={800} />
          <Card x={490} y={20} w={400} h={160} lines={['first a then b;', 'action b;']} size={S} tone="panel" />
          <Card x={10} y={250} w={880} h={100} lines={['then: from the action just before']} size={S} tone="ok" />
          <Card x={10} y={380} w={880} h={100} lines={['text order alone orders nothing']} size={S} tone="warn" />
        </>
      )}
    </Svg>
  )
}

export function DecideMergeFigure({ alt }: { alt: string }) {
  const at = FLOW_NODES.findIndex((n) => n.name === 'afterBoardParty')
  const step = FLOW_NODES[at - 1].name
  const alt2 = FLOW_NODES[at + 1]
  const guard = alt2.construct.replace(/^guard (\w+);.*$/, '$1')
  const next = FLOW_NODES.slice(at + 1).find((n) => n.kind === 'step')!.name
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={40} y={10} w={300} h={70} lines={[step]} size={S} weight={600} />
          <Arrow id={id} d="M 190 82 L 190 126" tone="ink" width={3} />
          <Diamond cx={190} cy={150} r={22} />
          <Lines x={226} y={150} lines={['decide']} size={S} anchor="start" weight={700} />
          <Arrow id={id} d="M 212 158 L 428 214" tone="accent" width={3} />
          <Lines x={560} y={140} lines={[`[${guard}]`]} size={S} weight={700} ink="accent" />
          <Card x={430} y={180} w={460} h={70} lines={[alt2.name]} size={S} tone="soft" />
          <Arrow id={id} d="M 190 172 L 190 316" tone="ink" width={3} />
          <Lines x={206} y={250} lines={['[else]']} size={S} anchor="start" weight={700} />
          <Arrow id={id} d="M 660 252 L 214 336" tone="muted" width={3} />
          <Diamond cx={190} cy={340} r={22} />
          <Lines x={160} y={340} lines={['merge']} size={S} anchor="end" weight={700} />
          <Arrow id={id} d="M 190 362 L 190 416" tone="ink" width={3} />
          <Card x={40} y={420} w={340} h={70} lines={[next]} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function GuardNumberLineFigure({ alt }: { alt: string }) {
  const x = (v: number) => 60 + v * 80
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Lines x={x(1.5)} y={40} lines={['routine']} size={S} weight={600} />
          <Lines x={x(6)} y={40} lines={['urgent']} size={S} weight={600} />
          <Lines x={x(9)} y={40} lines={['critical']} size={S} weight={600} />
          <Shape x={x(0)} y={70} w={x(3) - x(0)} h={40} tone="ok" rx={4} />
          <Shape x={x(4)} y={70} w={x(8) - x(4)} h={40} tone="ok" rx={4} />
          <Shape x={x(8)} y={70} w={x(10) - x(8)} h={40} tone="ok" rx={4} />
          <Shape x={x(3)} y={70} w={x(4) - x(3)} h={40} tone="bad" rx={4} />
          <Line x1={x(0)} y1={130} x2={x(10)} y2={130} tone="ink" width={3} />
          {[0, 3, 4, 8, 10].map((v) => (
            <Lines key={v} x={x(v)} y={170} lines={[String(v)]} size={S} weight={600} />
          ))}
          <Lines x={x(3.5)} y={230} lines={['gap: no successor']} size={S} weight={700} ink="bad" />
          <Lines x={14} y={300} lines={['overlap: two guards true']} size={S} anchor="start" weight={700} />
          <Shape x={x(3)} y={334} w={x(10) - x(3)} h={30} tone="soft" rx={4} />
          <Lines x={x(3) - 14} y={349} lines={['B']} size={S} anchor="end" weight={700} />
          <Shape x={x(5)} y={384} w={x(10) - x(5)} h={30} tone="soft" rx={4} />
          <Lines x={x(5) - 14} y={399} lines={['A']} size={S} anchor="end" weight={700} />
          <Lines x={x(7)} y={470} lines={['both true: one is chosen']} size={S} weight={700} ink="warn" />
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

export function GapCardFigure({ alt }: { alt: string }) {
  return <CodeCard alt={alt} lines={codeLines('guard-gap', 1, 8, 44)} />
}

export function PredictCardFigure10({ alt }: { alt: string }) {
  return <CodeCard alt={alt} title="Accepted or rejected? Why?" lines={codeLines('predict-target', 0, undefined, 44)} />
}

export function CheckerTableFigure10({ alt }: { alt: string }) {
  const cw = 430
  const max = fit(cw - 30, S)
  const col = (rows: typeof CALIBRATION) => {
    let y = 100
    return rows.map((c) => {
      const lines = wrap(c.label, max)
      const h = lines.length * 40 + 12
      const out = { c, lines, y, h }
      y += h + 8
      return out
    })
  }
  const rej = col(CALIBRATION.filter((c) => c.result === 'FAIL'))
  const acc = col(CALIBRATION.filter((c) => c.result !== 'FAIL'))
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={10} y={10} w={cw} h={76} lines={['checker rejects']} size={S} weight={700} tone="ok" />
          <Card x={460} y={10} w={cw} h={76} lines={['checker accepts']} size={S} weight={700} tone="warn" />
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

export function ExitCardFigure10({ alt }: { alt: string }) {
  const fields = ['ConOps step', 'flow node', 'construct', 'function']
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
