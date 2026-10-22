// Week 6, Session 1 lecture figures (original drawings): the fork in the road, where Week 6 sits, the capability
// trajectory, the gap chart, the portfolio, as is and to be, the development approaches, the two ways to define
// increments, the off-ramp, the planning loop, the plan columns, the backward plan, the TRL ladder, the technology
// exercise and its reveal, the known-unknowns record and the horizon board. Every number comes from the AeroLink case
// (src/content/lectures/week06/aerolinkCase.ts); every label meets the 1/56-of-slide-width rule (week6FigureKit.ts,
// checked by week6FigureKit.test.ts). Each figure draws exactly what its caption and alt text in session1.ts describe.
// Review status: new-pending-review.
import { KNOWN_UNKNOWNS, TECH_PLAN, YEAR2 } from '../../content/lectures/week06/aerolinkCase'
import { REQUIRED_CAPACITY } from '../../content/lectures/week03/aerolinkCase'
import { MATURE_TRL } from '../../content/lectures/week06/labBrief'
import { Arrow, Card, Diamond, Grid, Line, Lines, Shape, Svg } from './LectureWeek6Parts'
import { FB, FW, T_FB, T_FW } from './week6FigureKit'

const S = T_FB
const s = Math.max(T_FW, 26)
const word = (n: number) => ['zero', 'one', 'two', 'three', 'four', 'five', 'six'][n] ?? String(n)

export function DrivingQuestionW6Figure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Card x={16} y={170} w={300} h={180} lines={['Year 2:', `${YEAR2.aircraft} aircraft,`, `${word(YEAR2.hubs)} hubs`]} size={S} tone="soft" strong />
          <line x1={316} y1={260} x2={440} y2={260} style={{ stroke: 'var(--wb-fg)', strokeWidth: 8 }} />
          <circle cx={472} cy={260} r={32} style={{ fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', strokeWidth: 3 }} />
          <Lines x={472} y={260} lines={['?']} size={44} weight={700} />
          <Arrow id={id} d="M 504 250 C 540 200, 560 110, 604 96" />
          <Arrow id={id} d="M 504 260 L 604 260" />
          <Arrow id={id} d="M 504 270 C 540 320, 560 410, 604 424" />
          <Card x={610} y={58} w={280} h={76} lines={['Autonomy']} size={S} />
          <Card x={610} y={222} w={280} h={76} lines={['More capacity']} size={S} />
          <Card x={610} y={374} w={280} h={100} lines={['Integrated', 'ticketing']} size={S} />
        </>
      )}
    </Svg>
  )
}

export function WhereW6Figure({ alt }: { alt: string }) {
  const left = [['Week 1', 'needs'], ['Week 2', 'requirements'], ['Week 3', 'readiness'], ['Week 4', 'architecture'], ['Week 5', 'interfaces']]
  const right = [['Week 7', 'package'], ['Week 13', 'analysis'], ['Week 14', 'model change']]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          {left.map((l, i) => {
            const y = 12 + i * 102
            return (
              <g key={l[0]}>
                <Card x={8} y={y} w={250} h={88} lines={l} size={S} />
                <Arrow id={id} d={`M 258 ${y + 44} C 300 ${y + 44}, 300 260, 330 260`} tone="muted" width={2.4} />
              </g>
            )
          })}
          <Card x={330} y={190} w={240} h={140} lines={['Week 6', 'roadmap']} size={S} weight={700} tone="soft" strong />
          {right.map((r, i) => {
            const y = 20 + i * 180
            return (
              <g key={r[0]}>
                <Arrow id={id} d={`M 570 260 C 610 260, 610 ${y + 60}, 648 ${y + 60}`} tone="accent" />
                <Card x={650} y={y} w={242} h={120} lines={r} size={S} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function TrajectoryFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Arrow id={id} d="M 70 450 L 884 450" tone="muted" width={2.4} />
          <Arrow id={id} d="M 70 450 L 70 70" tone="muted" width={2.4} />
          <Lines x={84} y={36} lines={['capability']} size={S} anchor="start" ink="muted" />
          {[['now', 100], ['near', 300], ['mid', 540], ['far', 780]].map(([t, x]) => (
            <Lines key={t} x={x as number} y={488} lines={[t as string]} size={S} ink="muted" />
          ))}
          <line x1={80} y1={400} x2={860} y2={320} style={{ stroke: 'var(--wb-fg)', strokeWidth: 4 }} strokeDasharray="14 10" />
          <line x1={80} y1={400} x2={860} y2={110} style={{ stroke: 'var(--wb-accent)', strokeWidth: 5 }} />
          <Lines x={640} y={382} lines={['baseline trajectory']} size={S} />
          <Lines x={430} y={186} lines={['desired trajectory']} size={S} ink="accent" weight={600} />
          <Arrow id={id} d="M 700 326 C 690 280, 690 230, 700 184" tone="warn" width={3.4} />
          <Lines x={714} y={255} lines={['vectoring']} size={S} anchor="start" weight={600} />
        </>
      )}
    </Svg>
  )
}

export function GapChartFigure({ alt }: { alt: string }) {
  const base = 440
  const k = 300 / REQUIRED_CAPACITY
  const hDesired = REQUIRED_CAPACITY * k
  // the baseline TRAJECTORY at month 24 (the committed Year-2 step included), not the entry snapshot (review M1)
  const hBase = YEAR2.capacity * k
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          {[['Near term', 150], ['Mid term', 450], ['Far term', 750]].map(([t, x]) => (
            <Lines key={t} x={x as number} y={34} lines={[t as string]} size={S} weight={700} />
          ))}
          <Line x1={300} y1={70} x2={300} y2={500} />
          <Line x1={600} y1={70} x2={600} y2={500} />
          <rect x={40} y={base - hDesired} width={80} height={hDesired} rx={4} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2.4 }} />
          <rect x={180} y={base - hBase} width={80} height={hBase} rx={4} style={{ fill: 'var(--wb-sunk, var(--wb-panel))', stroke: 'var(--wb-fg)', strokeWidth: 2.4 }} strokeDasharray="8 6" />
          <Lines x={80} y={base - hDesired - 22} lines={[String(REQUIRED_CAPACITY)]} size={S} weight={700} />
          <Lines x={220} y={base - hBase - 22} lines={[String(YEAR2.capacity)]} size={S} weight={700} />
          <Lines x={80} y={474} lines={['desired']} size={S} />
          <Lines x={220} y={474} lines={['baseline']} size={S} />
          <Card x={315} y={110} w={270} h={140} lines={['desired:', 'service in a', 'grid outage']} size={S} tone="soft" />
          <Card x={315} y={290} w={270} h={100} lines={['baseline:', 'none']} size={S} dashed />
          <Card x={615} y={110} w={270} h={140} lines={['desired:', 'remote', 'supervision']} size={S} tone="soft" />
          <Card x={615} y={290} w={270} h={100} lines={['baseline:', 'pilot aboard']} size={S} dashed />
        </>
      )}
    </Svg>
  )
}

export function PortfolioFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={205} w={170} h={110} lines={['Gap']} size={S} weight={700} tone="warn" />
          {[['Add', 90], ['Change', 220], ['Drop', 350]].map(([t, y]) => (
            <g key={t}>
              <Arrow id={id} d={`M 180 260 C 220 260, 220 ${(y as number) + 40}, 256 ${(y as number) + 40}`} tone="muted" width={2.4} />
              <Card x={258} y={y as number} w={190} h={80} lines={[t as string]} size={S} />
            </g>
          ))}
          <Arrow id={id} d="M 448 260 L 494 260" tone="accent" />
          <Shape x={500} y={40} w={390} h={460} tone="panel" />
          <Lines x={695} y={82} lines={['Portfolio']} size={S} weight={700} />
          <Line x1={590} y1={168} x2={805} y2={168} tone="ink" dashed />
          <Line x1={590} y1={168} x2={695} y2={278} tone="ink" dashed />
          <Line x1={805} y1={168} x2={695} y2={278} tone="ink" dashed />
          <Line x1={695} y1={306} x2={615} y2={372} tone="ink" dashed />
          <Line x1={695} y1={306} x2={805} y2={372} tone="ink" dashed />
          <Card x={525} y={140} w={130} h={56} lines={['add']} size={S} />
          <Card x={735} y={140} w={140} h={56} lines={['change']} size={S} />
          <Card x={630} y={250} w={130} h={56} lines={['drop']} size={S} />
          <Card x={515} y={372} w={200} h={64} lines={['operations']} size={S} tone="soft" />
          <Card x={725} y={372} w={160} h={64} lines={['partners']} size={S} tone="soft" />
        </>
      )}
    </Svg>
  )
}

export function AsIsToBeFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          <Card x={16} y={310} w={190} h={140} lines={['As is']} size={S} weight={700} />
          <Card x={690} y={50} w={200} h={210} lines={['To be']} size={S} weight={700} tone="soft" strong />
          <path d="M 206 430 H 330 V 350 H 470 V 270 H 610 V 190 H 690" style={{ fill: 'none', stroke: 'var(--wb-accent)', strokeWidth: 5 }} />
          <Lines x={268} y={404} lines={['Inc 1']} size={S} weight={600} />
          <Lines x={400} y={324} lines={['Inc 2']} size={S} weight={600} />
          <Lines x={540} y={244} lines={['Inc 3']} size={S} weight={600} />
          <path d="M 206 446 H 420 V 400 H 580 V 330 H 790 V 262" style={{ fill: 'none', stroke: 'var(--wb-muted)', strokeWidth: 3 }} strokeDasharray="12 8" />
          <Lines x={560} y={488} lines={['another path']} size={S} ink="muted" />
        </>
      )}
    </Svg>
  )
}

export function ApproachesFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Lines x={450} y={30} lines={['enterprise roadmap, through operation']} size={S} weight={600} ink="accent" />
          <Arrow id={id} d="M 30 70 L 872 70" tone="accent" width={4} />
          <rect x={50} y={150} width={200} height={60} rx={6} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-fg)', strokeWidth: 2.4 }} />
          {[30, 45, 60, 75].map((h, i) => (
            <rect key={h} x={350 + i * 46} y={230 - h} width={38} height={h} rx={4} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-fg)', strokeWidth: 2.4 }} />
          ))}
          <line x1={700} y1={180} x2={800} y2={180} style={{ stroke: 'var(--wb-fg)', strokeWidth: 3 }} />
          {[670, 750, 830].map((x) => (
            <circle key={x} cx={x} cy={180} r={30} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 3 }} />
          ))}
          <Lines x={150} y={290} lines={['Sequential']} size={S} weight={600} />
          <Lines x={450} y={290} lines={['Incremental']} size={S} weight={600} />
          <Lines x={750} y={290} lines={['Evolutionary']} size={S} weight={600} />
          <path d="M 40 330 V 352 H 860 V 330" style={{ fill: 'none', stroke: 'var(--wb-fg)', strokeWidth: 3 }} />
          <Lines x={450} y={400} lines={['development stage only']} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function TwoApproachesFigure({ alt }: { alt: string }) {
  const block = (x: number, y: number, n: number) => <Card key={`${x}-${y}`} x={x} y={y} w={90} h={64} lines={[String(n)]} size={S} weight={700} tone="soft" />
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Arrow id={id} d="M 30 140 L 612 140" tone="muted" width={2.4} />
          {[60, 200, 340].map((x, i) => block(x, 108, i + 1))}
          <Card x={620} y={80} w={270} h={120} lines={['End state', 'defined']} size={S} weight={600} strong />
          <Arrow id={id} d="M 30 390 L 600 390" tone="muted" width={2.4} />
          {[60, 200, 340].map((x, i) => block(x, 358, i + 1))}
          <path d="M 640 430 C 600 430, 600 360, 650 355 C 650 310, 740 300, 760 335 C 790 300, 880 320, 860 370 C 900 395, 870 440, 820 435 C 790 460, 680 465, 640 430 Z" style={{ fill: 'none', stroke: 'var(--wb-fg)', strokeWidth: 3 }} strokeDasharray="10 7" />
          <Lines x={752} y={392} lines={['End state', 'emerges']} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function OffRampFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Lines x={450} y={140} lines={['planned technology']} size={S} weight={600} />
          <Arrow id={id} d="M 30 200 L 872 200" width={5} />
          <circle cx={260} cy={200} r={10} style={{ fill: 'var(--wb-fg)' }} />
          <circle cx={640} cy={200} r={10} style={{ fill: 'var(--wb-fg)' }} />
          <Arrow id={id} d="M 260 200 C 300 360, 600 360, 636 210" tone="ok" dashed width={4} />
          <Lines x={450} y={420} lines={['off-ramp: mature technology']} size={S} weight={600} ink="ok" />
        </>
      )}
    </Svg>
  )
}

export function PlanningLoopFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={40} w={290} h={150} lines={['Objectives', 'and gaps']} size={S} tone="warn" />
          <Card x={600} y={40} w={290} h={150} lines={['Technology', 'evaluations']} size={S} tone="soft" />
          <Card x={300} y={330} w={300} h={150} lines={['Technology', 'plan']} size={S} weight={700} strong />
          <Arrow id={id} d="M 155 190 C 170 290, 260 360, 296 384" width={3.4} />
          <Arrow id={id} d="M 745 190 C 730 290, 640 360, 604 384" tone="accent" width={3.4} />
          <Lines x={150} y={300} lines={['drives']} size={S} weight={600} halo />
          <Lines x={752} y={300} lines={['informs']} size={S} weight={600} ink="accent" halo />
        </>
      )}
    </Svg>
  )
}

export function PlanColumnsFigure({ alt }: { alt: string }) {
  const xs = [20, 240, 460, 680, 880]
  const heads = [['Available', 'now'], ['In', 'development'], ['Not yet', 'existing'], ['Insertion', 'point']]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Grid xs={xs} ys={[20, 130, 240, 350, 460]} />
          {heads.map((h, i) => (
            <Lines key={h[0]} x={(xs[i] + xs[i + 1]) / 2} y={75} lines={h} size={S} weight={700} />
          ))}
          {[0, 1, 2].map((r) => {
            const y = 185 + r * 110
            const x = (xs[r] + xs[r + 1]) / 2
            return (
              <g key={r}>
                <circle cx={x} cy={y} r={14} style={{ fill: 'var(--wb-fg)' }} />
                <Arrow id={id} d={`M ${x + 22} ${y} L 742 ${y}`} tone="accent" width={2.6} />
                <Diamond cx={760} cy={y} r={18} />
                <Lines x={790} y={y} lines={['INC']} size={S} anchor="start" weight={600} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function BackwardPlanFigure({ alt }: { alt: string }) {
  const marks = [
    { x: 250, n: 4, label: ['review'], above: false },
    { x: 360, n: 3, label: ['insertion', 'points'], above: true },
    { x: 470, n: 2, label: ['feedback', 'measures'], above: false },
    { x: 580, n: 1, label: ['core', 'technologies'], above: true },
  ]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={190} w={170} h={110} lines={['Today']} size={S} weight={700} />
          <Card x={690} y={170} w={200} h={150} lines={['End state', 'year 5–10']} size={S} weight={600} tone="soft" strong />
          <Arrow id={id} d="M 688 245 L 186 245" tone="accent" width={5} />
          {marks.map((m) => (
            <g key={m.n}>
              <circle cx={m.x} cy={245} r={22} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2.6 }} />
              <Lines x={m.x} y={245} lines={[String(m.n)]} size={S} weight={700} />
              <Lines x={m.x} y={m.above ? 160 : 330} lines={m.label} size={S} />
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

export function TrlLadderFigure({ alt }: { alt: string }) {
  const yOf = (k: number) => 480 - (k - 1) * 55
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          <line x1={80} y1={20} x2={80} y2={505} style={{ stroke: 'var(--wb-fg)', strokeWidth: 4 }} />
          <line x1={230} y1={20} x2={230} y2={505} style={{ stroke: 'var(--wb-fg)', strokeWidth: 4 }} />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => (
            <g key={k}>
              <line x1={80} y1={yOf(k)} x2={230} y2={yOf(k)} style={{ stroke: 'var(--wb-fg)', strokeWidth: 3 }} />
              <Lines x={40} y={yOf(k)} lines={[String(k)]} size={S} weight={700} />
            </g>
          ))}
          <path d={`M 250 ${yOf(1) + 10} H 262 V ${yOf(4) - 10} H 250`} style={{ fill: 'none', stroke: 'var(--wb-muted)', strokeWidth: 2.4 }} />
          <Lines x={274} y={(yOf(1) + yOf(4)) / 2} lines={['laboratory']} size={S} anchor="start" />
          <path d={`M 250 ${yOf(5) + 10} H 262 V ${yOf(6) - 10} H 250`} style={{ fill: 'none', stroke: 'var(--wb-muted)', strokeWidth: 2.4 }} />
          <Lines x={274} y={252} lines={['relevant', 'environment']} size={S} anchor="start" />
          <path d={`M 250 ${yOf(7) + 10} H 262 V ${yOf(9) - 10} H 250`} style={{ fill: 'none', stroke: 'var(--wb-muted)', strokeWidth: 2.4 }} />
          <Lines x={274} y={(yOf(7) + yOf(9)) / 2} lines={['operational']} size={S} anchor="start" />
          <line x1={60} y1={yOf(MATURE_TRL)} x2={560} y2={yOf(MATURE_TRL)} style={{ stroke: 'var(--wb-warn)', strokeWidth: 3.4 }} strokeDasharray="12 8" />
          <Lines x={572} y={yOf(MATURE_TRL) + 14} lines={['DoD threshold', 'practice']} size={S} anchor="start" ink="warn" weight={600} />
          <Card x={600} y={320} w={290} h={186} lines={['Architecture', 'fit:', 'not rated', 'by TRL']} size={S} dashed />
        </>
      )}
    </Svg>
  )
}

const TECH_SHORT: Record<string, string> = { 'TECH-001': 'High-power charging', 'TECH-002': 'Battery cells', 'TECH-003': 'Detect-and-avoid', 'TECH-004': 'On-site storage', 'TECH-005': '15-min charger' }

export function TechExerciseFigure({ alt }: { alt: string }) {
  const xs = [10, 370, 570, 700, 890]
  const ys = [10, 90, 172, 254, 336, 418, 500]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          <Grid xs={xs} ys={ys} />
          {['Candidate', 'Status', 'TRL', 'Insertion'].map((h, i) => (
            <Lines key={h} x={(xs[i] + xs[i + 1]) / 2} y={50} lines={[h]} size={S} weight={700} />
          ))}
          {TECH_PLAN.map((t, r) => (
            <Lines key={t.id} x={24} y={(ys[r + 1] + ys[r + 2]) / 2} lines={[TECH_SHORT[t.id] ?? t.name]} size={S} anchor="start" />
          ))}
        </>
      )}
    </Svg>
  )
}

export function TechTableFigure({ alt }: { alt: string }) {
  const xs = [10, 340, 620, 790, 1190]
  const ys = [4, 48, 93, 138, 183, 228, 273]
  const status = (x: (typeof TECH_PLAN)[number]) => (x.status === 'available' ? 'Available now' : x.status === 'in-development' ? 'In development' : 'Does not yet exist')
  const insertion = (x: (typeof TECH_PLAN)[number]) => (x.insertion === null ? 'not inserted' : x.insertion === 'INC-000' ? (x.committed ? 'Year-2 step (baseline)' : 'in service (baseline)') : `Increment ${Number(x.insertion.slice(-1))}`)
  return (
    <Svg w={FW.w} h={FW.h} alt={alt}>
      {() => (
        <>
          <Grid xs={xs} ys={ys} />
          {['Technology', 'Status', 'TRL', 'Insertion point'].map((h, i) => (
            <Lines key={h} x={(xs[i] + xs[i + 1]) / 2} y={26} lines={[h]} size={s} weight={700} />
          ))}
          {TECH_PLAN.map((t, r) => {
            const y = (ys[r + 1] + ys[r + 2]) / 2
            return (
              <g key={t.id}>
                <Lines x={22} y={y} lines={[TECH_SHORT[t.id] ?? t.name]} size={s} anchor="start" />
                <Lines x={(xs[1] + xs[2]) / 2} y={y} lines={[status(t)]} size={s} />
                <Lines x={(xs[2] + xs[3]) / 2} y={y} lines={[t.trl === null ? 'none' : `${t.trl} assumed`]} size={s} />
                <Lines x={(xs[3] + xs[4]) / 2} y={y} lines={[insertion(t)]} size={s} weight={600} ink={t.insertion === null ? 'warn' : 'ink'} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function UnknownsRecordFigure({ alt }: { alt: string }) {
  const xs = [10, 250, 495, 740, 985, 1190]
  const ys = [4, 74, 176, 276]
  const u9 = KNOWN_UNKNOWNS.find((x) => x.id === 'U-009')!
  const u4 = KNOWN_UNKNOWNS.find((x) => x.id === 'U-004')!
  const rows = [
    [[`${u9.id} storage`, `fit (${u9.tbx})`], ['outage service', 'not assured'], ['a one-hub', 'demonstration'], ['keep staggered', 'recharge'], ['Increment 1']],
    [[`${u4.id} flights`, 'per operator'], ['autonomy cannot', 'be scheduled'], ['a workload', 'analysis'], ['collect the', 'evidence first'], ['Increment 3']],
  ]
  return (
    <Svg w={FW.w} h={FW.h} alt={alt}>
      {() => (
        <>
          <Grid xs={xs} ys={ys} />
          {[['Unknown'], ['Impact'], ['Information', 'needed'], ['Mitigation'], ['Gates']].map((h, i) => (
            <Lines key={h[0]} x={(xs[i] + xs[i + 1]) / 2} y={(ys[0] + ys[1]) / 2} lines={h} size={s} weight={700} />
          ))}
          {rows.map((row, r) =>
            row.map((cell, c) => <Lines key={`${r}-${c}`} x={(xs[c] + xs[c + 1]) / 2} y={(ys[r + 1] + ys[r + 2]) / 2} lines={cell} size={s} weight={c === 4 ? 700 : 500} ink={c === 4 ? 'accent' : 'ink'} />),
          )}
        </>
      )}
    </Svg>
  )
}

export function HorizonBoardFigure({ alt }: { alt: string }) {
  const cards: [string[], number, number][] = [
    [['On-site', 'storage'], 10, 250],
    [['Integrated', 'ticketing'], 310, 250],
    [['Charger', 'leasing'], 610, 250],
    [['Predictive', 'maintenance'], 10, 380],
    [['Demand', 're-forecast'], 310, 380],
    [['Autonomy'], 610, 380],
  ]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          {[['Near term', 10], ['Mid term', 305], ['Far term', 600]].map(([t, x]) => (
            <g key={t}>
              <Shape x={x as number} y={10} w={290} h={215} tone="dash" />
              <Lines x={(x as number) + 145} y={46} lines={[t as string]} size={S} weight={700} />
            </g>
          ))}
          {cards.map(([l, x, y]) => (
            <Card key={l[0]} x={x} y={y} w={280} h={100} lines={l} size={S} tone="soft" />
          ))}
        </>
      )}
    </Svg>
  )
}
