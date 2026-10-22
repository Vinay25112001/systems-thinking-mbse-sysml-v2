// Week 7, Session 1 lecture figures (original drawings): where Week 7 sits, the package tabs, the executive summary
// skeleton, the trace ladder, the three ways out of a finding, the AeroLink thread, AeroLink's coverage and tally, the
// review stages and the review roles. Every number and ID comes from the AeroLink case
// (src/content/lectures/week07/aerolinkCase.ts) or the lab brief (labBrief.ts); every label meets the 1/56-of-slide-width
// rule (week7FigureKit.ts, checked by week7FigureKit.test.ts). Each figure draws exactly what its caption and alt text in
// session1.ts describe. Review status: new-pending-review.
import { AUDIT, COVERAGE, THREAD } from '../../content/lectures/week07/aerolinkCase'
import { PACKAGE_SECTIONS } from '../../content/lectures/week07/labBrief'
import { Arrow, Card, Chip, Line, Lines, Shape, Svg } from './LectureWeek7Parts'
import { FB, FW, T_FB, T_FW } from './week7FigureKit'

const S = T_FB
const s = Math.max(T_FW, 26)

export function WhereW7Figure({ alt }: { alt: string }) {
  const weeks = [1, 2, 3, 4, 5, 6]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          {weeks.map((w, i) => (
            <g key={w}>
              <Card x={16} y={28 + i * 78} w={170} h={58} lines={[`Week ${w}`]} size={S} tone="soft" />
              <Arrow id={id} d={`M 188 ${57 + i * 78} L 286 260`} tone="muted" width={2} />
            </g>
          ))}
          <Card x={290} y={210} w={200} h={100} lines={['package']} size={S} weight={700} strong />
          <Arrow id={id} d="M 492 260 L 666 260" tone="ink" width={3} />
          <Line x1={556} y1={190} x2={556} y2={330} tone="ink" width={6} />
          <Line x1={604} y1={190} x2={604} y2={330} tone="ink" width={6} />
          <Lines x={580} y={160} lines={['review']} size={S} weight={700} ink="accent" />
          <Card x={670} y={200} w={214} h={120} lines={['Week 8', 'model']} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function PackageTabsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          {PACKAGE_SECTIONS.map((sec, i) => {
            const x = 8 + i * 4
            const y = 6 + i * 46
            return (
              <g key={sec.id}>
                <Shape x={x} y={y} w={890 - x} h={42} tone={sec.week === 7 ? 'box' : 'soft'} rx={8} />
                <Lines x={x + 12} y={y + 21} lines={[`${sec.n} ${sec.title}`]} size={S} anchor="start" weight={sec.week === 7 ? 700 : 500} />
                <Lines x={884} y={y + 21} lines={[`Week ${sec.week}`]} size={S} anchor="end" ink="muted" weight={600} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function ExecSkeletonFigure({ alt }: { alt: string }) {
  const rows = ['recommendation', 'why', 'conditions', 'residual risk', 'decisions needed', 'next increment']
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          {rows.map((r, i) => {
            const y = 8 + i * 85
            return (
              <g key={r}>
                <Shape x={10} y={y} w={880} h={74} tone={i === 0 ? 'box' : 'soft'} strong={i === 0} />
                <Lines x={30} y={y + 37} lines={[r]} size={S} anchor="start" weight={700} />
                {r === 'why' && [520, 640, 760].map((cx) => <Chip key={cx} cx={cx} cy={y + 37} text="ID" size={S} tone="panel" ink="accent" />)}
                {r === 'residual risk' && [640, 790].map((cx) => <Chip key={cx} cx={cx} cy={y + 37} text="R-nnn" size={S} tone="warn" />)}
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function TraceLadderFigure({ alt }: { alt: string }) {
  const rungs: string[][] = [['needs'], ['stakeholder', 'requirements'], ['system', 'requirements'], ['functions and', 'physical elements'], ['interfaces'], ['roadmap', 'increments']]
  const xs = [400, 480, 560]
  const y = (i: number) => 44 + i * 86
  // links between adjacent rungs: [rung, from dot, to dot]; need dot 2 has nothing below (childless parent); system
  // requirement dot 2 has nothing above (orphan)
  const links: [number, number, number][] = [
    [0, 0, 0], [0, 1, 1], [0, 1, 0],
    [1, 0, 0], [1, 1, 1],
    [2, 0, 0], [2, 1, 1], [2, 2, 2],
    [3, 0, 0], [3, 1, 1], [3, 2, 2],
    [4, 0, 0], [4, 1, 1], [4, 2, 2],
  ]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          {rungs.map((r, i) => (
            <g key={i}>
              <Lines x={16} y={y(i)} lines={r} size={S} anchor="start" weight={600} />
              <Line x1={380} y1={y(i)} x2={580} y2={y(i)} tone="muted" width={2} dashed />
            </g>
          ))}
          {links.map(([r, a, b]) => (
            <Line key={`${r}-${a}-${b}`} x1={xs[a]} y1={y(r)} x2={xs[b]} y2={y(r + 1)} tone="ink" width={2.5} />
          ))}
          {rungs.map((_, i) =>
            xs.map((x, k) => {
              const marked = (i === 0 && k === 2) || (i === 2 && k === 2)
              return <circle key={`${i}-${k}`} cx={x} cy={y(i)} r={marked ? 15 : 11} style={marked ? { fill: 'var(--wb-bad-soft)', stroke: 'var(--wb-bad)', strokeWidth: 4 } : { fill: 'var(--wb-accent)', stroke: 'var(--wb-fg)', strokeWidth: 2 }} />
            }),
          )}
          <Line x1={590} y1={y(0)} x2={700} y2={y(0)} tone="bad" width={2.5} />
          <Lines x={712} y={y(0)} lines={['childless', 'parent']} size={S} anchor="start" weight={700} ink="bad" />
          <Line x1={590} y1={y(2)} x2={700} y2={y(2)} tone="bad" width={2.5} />
          <Lines x={712} y={y(2)} lines={['orphan']} size={S} anchor="start" weight={700} ink="bad" />
        </>
      )}
    </Svg>
  )
}

export function DispositionsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Card x={14} y={210} w={176} h={100} lines={['finding']} size={S} weight={700} strong />
          <Arrow id={id} d="M 192 240 L 556 115" tone="ok" width={3} />
          <Lines x={340} y={60} lines={['correct the week', 'and export again']} size={S} ink="muted" />
          <Card x={560} y={60} w={330} h={110} lines={['finding gone']} size={S} weight={700} tone="ok" />
          <Arrow id={id} d="M 192 260 L 556 275" tone="ink" width={3} />
          <Card x={560} y={200} w={330} h={150} lines={['accept, with', 'rationale and', 'evidence']} size={S} weight={600} />
          <Arrow id={id} d="M 192 282 L 556 432" tone="ink" width={3} />
          <Card x={560} y={378} w={330} h={120} lines={['defer, with an', 'owner and a week']} size={S} weight={600} tone="warn" />
        </>
      )}
    </Svg>
  )
}

/** The thread on a figure-with-body canvas (1200 × 280): two rows of chips, each with its ID and its week. */
export function ThreadFigure({ alt }: { alt: string }) {
  const perRow = Math.ceil(THREAD.length / 2)
  const w = 170
  const gap = 30
  const h = 92
  const pos = (i: number) => ({ x: 8 + (i % perRow) * (w + gap), y: i < perRow ? 10 : 176 })
  return (
    <Svg w={FW.w} h={FW.h} alt={alt}>
      {(id) => (
        <>
          {THREAD.map((hop, i) => {
            const p = pos(i)
            const next = i + 1 < THREAD.length ? pos(i + 1) : null
            return (
              <g key={hop.id}>
                <Card x={p.x} y={p.y} w={w} h={h} lines={[hop.id, `Week ${hop.week}`]} size={s} weight={600} tone={hop.week === 1 || hop.week === 4 ? 'soft' : 'box'} />
                {next && next.y === p.y && <Arrow id={id} d={`M ${p.x + w + 2} ${p.y + h / 2} L ${next.x - 3} ${p.y + h / 2}`} tone="ink" width={2.5} />}
                {next && next.y !== p.y && <Arrow id={id} d={`M ${p.x + w / 2} ${p.y + h + 2} L ${p.x + w / 2} 134 L ${next.x + w / 2} 134 L ${next.x + w / 2} ${next.y - 3}`} tone="ink" width={2.5} />}
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function CoverageFigure({ alt }: { alt: string }) {
  const max = 470
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          {COVERAGE.map((c, i) => {
            const y = 26 + i * 100
            return (
              <g key={c.layer}>
                <Lines x={16} y={y} lines={[c.label]} size={S} anchor="start" weight={600} />
                <rect x={16} y={y + 24} width={max} height={26} rx={6} className="f-env" />
                <rect x={16} y={y + 24} width={(max * c.pct) / 100} height={26} rx={6} style={{ fill: 'var(--wb-accent)' }} />
                <Lines x={500} y={y + 37} lines={[`${c.pct} %`]} size={S} anchor="start" weight={700} />
              </g>
            )
          })}
          <Shape x={650} y={120} w={240} h={290} tone="panel" />
          <Lines x={770} y={170} lines={[`${AUDIT.recorded} accepted`]} size={S} weight={700} />
          <Lines x={770} y={236} lines={[`(${AUDIT.staleDispositions} no longer`, 'true)']} size={S} ink="muted" />
          <Lines x={770} y={340} lines={[`${AUDIT.deferred} deferred`]} size={S} weight={700} />
        </>
      )}
    </Svg>
  )
}

export function ReviewFlowFigure({ alt }: { alt: string }) {
  const cols: { title: string; items: string[][] }[] = [
    { title: 'prepare', items: [['criteria defined'], ['entry confirmed'], ['items sent in', 'advance']] },
    { title: 'conduct', items: [['analysis from', 'different', 'perspectives'], ['findings', 'recorded']] },
    { title: 'complete', items: [['exit criteria', 'met'], ['results', 'communicated'], ['actions', 'implemented']] },
  ]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          {cols.map((c, i) => {
            const x = 8 + i * 305
            let y = 150
            return (
              <g key={c.title}>
                <Card x={x} y={20} w={280} h={80} lines={[c.title]} size={S} weight={700} strong />
                {i < 2 && <Arrow id={id} d={`M ${x + 282} 60 L ${x + 304} 60`} tone="ink" width={3} />}
                {c.items.map((it, k) => {
                  const block = <Lines key={k} x={x + 140} y={y + ((it.length - 1) * S * 1.2) / 2} lines={it} size={S} weight={500} />
                  y += it.length * S * 1.2 + 26
                  return block
                })}
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function RolesFigure({ alt }: { alt: string }) {
  const card = (x: number, y: number, title: string, lines: string[], tone: 'box' | 'soft' = 'box') => <Card key={title} x={x} y={y} w={284} h={190} title={title} lines={lines} size={S} tone={tone} />
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          <Lines x={603} y={26} lines={['far enough removed: independent']} size={S} weight={600} ink="accent" />
          <path d="M 312 82 L 312 58 L 894 58 L 894 82" style={{ fill: 'none', stroke: 'var(--wb-accent)', strokeWidth: 4 }} />
          {card(8, 96, 'Owning team', ['presents and', 'answers'], 'soft')}
          {card(312, 96, 'Peer reviewers', ['raise findings'])}
          {card(610, 96, 'Chair', ['the instructor', 'decides'])}
          {card(160, 316, 'Recorder', ['writes findings', 'and actions'], 'soft')}
          {card(460, 316, 'Timekeeper', ['holds the slots'], 'soft')}
        </>
      )}
    </Svg>
  )
}
