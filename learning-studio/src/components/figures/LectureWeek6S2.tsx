// Week 6, Session 2 lecture figures (original drawings): the transition bar, the three insertion circles, the running
// service, the Vee entry points, security and resilience across increments, the roadmap grid, the baseline trajectory, the
// committed Year-2 step and its transition order, Increments 1 to 3, the full roadmap, the impact tree, the hand-on to Weeks 7, 13 and 14, the
// lab worksheet and the seven-day plan. Every number comes from the AeroLink case
// (src/content/lectures/week06/aerolinkCase.ts); every label meets the 1/56-of-slide-width rule (week6FigureKit.ts,
// checked by week6FigureKit.test.ts). Each figure draws exactly what its caption and alt text in session2.ts describe.
// Review status: new-pending-review.
import { REQUIRED_CAPACITY } from '../../content/lectures/week03/aerolinkCase'
import { BASELINE, IMPACT_CANDIDATE_IDS, IMPACT_JUDGED, YEAR2, YEAR2_TRANSITION, INC2_STEP, impactByWeek } from '../../content/lectures/week06/aerolinkCase'
import { MATURE_TRL } from '../../content/lectures/week06/labBrief'
import { Arrow, Card, Diamond, Grid, Line, Lines, Shape, Svg } from './LectureWeek6Parts'
import { FB, FW, T_FB, T_FW } from './week6FigureKit'

const S = T_FB
const s = Math.max(T_FW, 26)

export function TransitionBarFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Lines x={450} y={50} lines={['a process over time']} size={S} ink="muted" />
          <Arrow id={id} d="M 20 96 L 880 96" tone="muted" width={2.4} />
          <Card x={20} y={140} w={260} h={120} lines={['Plan']} size={S} weight={700} tone="soft" />
          <Card x={280} y={140} w={280} h={120} lines={['Implement']} size={S} weight={700} />
          <Card x={560} y={140} w={320} h={120} lines={['Operate and', 'maintain']} size={S} weight={700} tone="soft" />
          {[620, 720, 820].map((x) => (
            <path key={x} d={`M ${x} 272 L ${x + 20} 310 L ${x - 20} 310 Z`} style={{ fill: 'var(--wb-accent)', stroke: 'var(--wb-fg)', strokeWidth: 2 }} />
          ))}
          <Lines x={720} y={352} lines={['insert technology']} size={S} weight={600} ink="accent" />
        </>
      )}
    </Svg>
  )
}

export function ThreeCirclesFigure({ alt }: { alt: string }) {
  const c = { fill: 'var(--wb-accent-soft)', fillOpacity: 0.55, stroke: 'var(--wb-fg)', strokeWidth: 3 }
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          <circle cx={330} cy={185} r={165} style={c} />
          <circle cx={570} cy={185} r={165} style={c} />
          <circle cx={450} cy={345} r={165} style={c} />
          <Lines x={250} y={140} lines={['Maturity']} size={S} weight={600} />
          <Lines x={640} y={140} lines={['Ability to', 'insert']} size={S} weight={600} />
          <Lines x={450} y={440} lines={['Operational', 'timing']} size={S} weight={600} />
          <Lines x={450} y={248} lines={['Insertion', 'point']} size={S} weight={700} halo />
        </>
      )}
    </Svg>
  )
}

export function RunningServiceFigure({ alt }: { alt: string }) {
  const car = (x: number, y: number, dashed = false) => (
    <g key={`${x}-${y}`}>
      <Shape x={x} y={y} w={190} h={100} tone={dashed ? 'dash' : 'soft'} />
      <circle cx={x + 45} cy={y + 112} r={14} style={{ fill: 'var(--wb-fg)' }} />
      <circle cx={x + 145} cy={y + 112} r={14} style={{ fill: 'var(--wb-fg)' }} />
    </g>
  )
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          {car(460, 40)}
          <Arrow id={id} d="M 555 160 L 555 252" tone="accent" width={4} />
          {car(40, 270)}
          {car(250, 270)}
          {car(460, 270, true)}
          {car(670, 270)}
          <Line x1={20} y1={398} x2={880} y2={398} tone="ink" width={3} />
          <Arrow id={id} d="M 700 430 L 860 430" tone="muted" width={3} />
          <Lines x={450} y={482} lines={['phase-based change, backward compatible']} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function VeeEntryFigure({ alt }: { alt: string }) {
  const leftX = (y: number) => 60 + (390 * (y - 40)) / 440
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <path d="M 60 40 L 450 480 L 840 40" style={{ fill: 'none', stroke: 'var(--wb-fg)', strokeWidth: 4 }} />
          {[110, 250, 390].map((y) => (
            <circle key={y} cx={leftX(y)} cy={y} r={14} style={{ fill: 'var(--wb-accent)', stroke: 'var(--wb-fg)', strokeWidth: 2.4 }} />
          ))}
          <Lines x={leftX(110) + 26} y={110} lines={['A system']} size={S} anchor="start" weight={600} />
          <Lines x={leftX(250) - 24} y={250} lines={['B subsystem']} size={S} anchor="end" weight={600} />
          <Lines x={leftX(390) - 24} y={390} lines={['C component']} size={S} anchor="end" weight={600} />
          <Arrow id={id} d={`M ${leftX(390) + 30} 378 L ${leftX(130) + 30} 132`} tone="warn" width={4} />
          <Lines x={470} y={196} lines={['flow requirements', 'to parents']} size={S} weight={600} ink="warn" />
        </>
      )}
    </Svg>
  )
}

export function SrEvolutionFigure({ alt }: { alt: string }) {
  const sec = [['signed storage', 'commands'], ['new link,', 'authenticated'], ['datalink flies', 'the aircraft']]
  const res = [['service in a', 'grid outage'], ['written', 'fallback'], ['safe landing', 'without link']]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          {['Increment 1', 'Increment 2', 'Increment 3'].map((t, i) => (
            <Lines key={t} x={150 + i * 300} y={34} lines={[t]} size={S} weight={700} />
          ))}
          <Lines x={450} y={92} lines={['Security']} size={S} weight={700} ink="accent" />
          {sec.map((l, i) => (
            <Card key={l[0]} x={15 + i * 300} y={120} w={270} h={110} lines={l} size={S} tone="soft" />
          ))}
          <Lines x={450} y={274} lines={['Resilience']} size={S} weight={700} ink="ok" />
          {res.map((l, i) => (
            <Card key={l[0]} x={15 + i * 300} y={302} w={270} h={110} lines={l} size={S} tone="ok" />
          ))}
        </>
      )}
    </Svg>
  )
}

export function RoadmapGridFigure({ alt }: { alt: string }) {
  const xs = [10, 280, 480, 680, 880]
  const ys = [10, 76, 182, 288, 394, 500]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          <Grid xs={xs} ys={ys} />
          {['Near term', 'Mid term', 'Far term'].map((t, i) => (
            <Lines key={t} x={(xs[i + 1] + xs[i + 2]) / 2} y={43} lines={[t]} size={S} weight={700} />
          ))}
          {[['Capability'], ['Technology'], ['Architecture', 'and interfaces'], ['Operations', 'and people']].map((l, i) => (
            <Lines key={l[0]} x={(xs[0] + xs[1]) / 2} y={(ys[i + 1] + ys[i + 2]) / 2} lines={l} size={S} weight={600} />
          ))}
          <Shape x={510} y={98} w={140} h={270} tone="dash" rx={14} />
          <Diamond cx={510} cy={98} r={18} />
          <Lines x={468} y={130} lines={['trigger']} size={S} anchor="end" weight={600} halo />
        </>
      )}
    </Svg>
  )
}

export function BaselineW6Figure({ alt }: { alt: string }) {
  const xs = [10, 250, 610, 800, 990, 1190]
  const ys = [4, 48, 105, 162, 219, 276]
  const cells = [`${BASELINE.capacity}/day, fleet-limited`, `${BASELINE.turnaroundChargers} chargers, ${BASELINE.chargerLimit}/day`, '1 platform + standby', `${BASELINE.aircraft} aircraft, piloted`]
  // the near column holds the committed Year-2 step: the rest of the baseline trajectory (review M1)
  const near = [`${YEAR2.capacity}/day`, `${YEAR2.turnaroundChargers} chargers`, 'unchanged', `${YEAR2.aircraft} aircraft`]
  return (
    <Svg w={FW.w} h={FW.h} alt={alt}>
      {() => (
        <>
          <rect x={xs[3]} y={ys[1]} width={xs[5] - xs[3]} height={ys[5] - ys[1]} style={{ fill: 'var(--wb-sunk, var(--wb-panel))' }} />
          <Grid xs={xs} ys={ys} />
          {['', 'As is', 'Near', 'Mid', 'Far'].map((t, i) => (t ? <Lines key={t} x={(xs[i] + xs[i + 1]) / 2} y={26} lines={[t]} size={s} weight={700} /> : null))}
          {['Capability', 'Technology', 'Architecture', 'Operations'].map((t, i) => (
            <Lines key={t} x={22} y={(ys[i + 1] + ys[i + 2]) / 2} lines={[t]} size={s} anchor="start" weight={600} />
          ))}
          {cells.map((t, i) => (
            <Lines key={t} x={(xs[1] + xs[2]) / 2} y={(ys[i + 1] + ys[i + 2]) / 2} lines={[t]} size={s} />
          ))}
          {near.map((t, i) => (
            <Lines key={`n${t}`} x={(xs[2] + xs[3]) / 2} y={(ys[i + 1] + ys[i + 2]) / 2} lines={[t]} size={s} ink="accent" weight={600} />
          ))}
        </>
      )}
    </Svg>
  )
}

export function Increment1Figure({ alt }: { alt: string }) {
  const x0 = 480
  const dx = 160
  const yOf = (c: number) => 200 - (c - BASELINE.capacity) * (140 / (YEAR2.capacity - BASELINE.capacity))
  const pts = YEAR2_TRANSITION.steps.map((p, i) => ({ x: x0 + i * dx, y: yOf(p.capacity), ...p }))
  const stairs = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `H ${p.x} V ${p.y}`)).join(' ')
  return (
    <Svg w={FW.w} h={FW.h} alt={alt}>
      {(id) => (
        <>
          <Diamond cx={40} cy={90} r={16} />
          <Lines x={66} y={90} lines={['A-003 test report']} size={s} anchor="start" weight={600} />
          <Diamond cx={40} cy={180} r={16} />
          <Lines x={66} y={180} lines={['U-002 utility']} size={s} anchor="start" weight={600} />
          <Arrow id={id} d="M 440 240 L 1170 240" tone="muted" width={2.4} />
          <Arrow id={id} d="M 440 240 L 440 22" tone="muted" width={2.4} />
          <Lines x={428} y={30} lines={['trips/day']} size={s} anchor="end" ink="muted" />
          <Lines x={428} y={262} lines={['aircraft:']} size={s} anchor="end" ink="muted" />
          {pts.map((p) => (
            <Lines key={p.aircraft} x={p.x} y={262} lines={[String(p.aircraft)]} size={s} ink="muted" />
          ))}
          <line x1={440} y1={yOf(REQUIRED_CAPACITY)} x2={1160} y2={yOf(REQUIRED_CAPACITY)} style={{ stroke: 'var(--wb-warn)', strokeWidth: 3 }} />
          <Lines x={452} y={yOf(REQUIRED_CAPACITY) - 18} lines={[`${REQUIRED_CAPACITY} needed`]} size={s} anchor="start" ink="warn" weight={600} />
          <line x1={440} y1={yOf(YEAR2_TRANSITION.aircraftFirst)} x2={1160} y2={yOf(YEAR2_TRANSITION.aircraftFirst)} style={{ stroke: 'var(--wb-muted)', strokeWidth: 2.6 }} strokeDasharray="10 7" />
          <Lines x={452} y={yOf(YEAR2_TRANSITION.aircraftFirst) + 20} lines={[`aircraft first: ${YEAR2_TRANSITION.aircraftFirst}`]} size={s} anchor="start" ink="muted" />
          <path d={stairs} style={{ fill: 'none', stroke: 'var(--wb-accent)', strokeWidth: 4 }} />
          {pts.map((p) => (
            <circle key={`c${p.aircraft}`} cx={p.x} cy={p.y} r={p.capacity === REQUIRED_CAPACITY ? 12 : 8} style={{ fill: p.capacity >= REQUIRED_CAPACITY ? 'var(--wb-accent)' : 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2.4 }} />
          ))}
          <Lines x={pts[pts.length - 1].x} y={pts[pts.length - 1].y - 26} lines={[String(YEAR2.capacity)]} size={s} weight={700} />
          <Lines x={pts[0].x + 4} y={pts[0].y + 22} lines={[String(BASELINE.capacity)]} size={s} anchor="start" weight={700} />
        </>
      )}
    </Svg>
  )
}

export function Increments23Figure({ alt }: { alt: string }) {
  return (
    <Svg w={FW.w} h={FW.h} alt={alt}>
      {(id) => (
        <>
          <Lines x={300} y={20} lines={['Mid term']} size={s} weight={700} />
          <Lines x={900} y={20} lines={['Far term']} size={s} weight={700} />
          <Line x1={600} y1={4} x2={600} y2={276} />
          <Shape x={60} y={40} w={510} h={44} tone="soft" />
          <Diamond cx={60} cy={62} r={15} />
          <Lines x={88} y={62} lines={['Increment 1: storage, leasing']} size={s} anchor="start" weight={700} />
          <Lines x={88} y={106} lines={['trigger: storage demo']} size={s} anchor="start" weight={600} />
          <Shape x={60} y={134} w={510} h={44} tone="soft" />
          <Diamond cx={60} cy={156} r={15} />
          <Lines x={88} y={156} lines={['Increment 2: data, ticketing']} size={s} anchor="start" weight={700} />
          <Lines x={88} y={200} lines={[`re-forecast > ${INC2_STEP.trigger}`]} size={s} anchor="start" weight={600} />
          <Lines x={300} y={250} lines={['in parallel, each on its trigger']} size={s} ink="muted" />
          <Shape x={660} y={40} w={510} h={44} tone="dash" />
          <Diamond cx={660} cy={62} r={15} />
          <Lines x={688} y={62} lines={['Increment 3']} size={s} anchor="start" weight={700} />
          <Lines x={688} y={110} lines={[`TRL ${MATURE_TRL} + certification`]} size={s} anchor="start" weight={600} />
          <Arrow id={id} d="M 730 132 C 760 200, 900 214, 1150 206" tone="ok" dashed width={3.4} />
          <Lines x={950} y={250} lines={['off-ramp: stay piloted']} size={s} weight={600} ink="ok" />
        </>
      )}
    </Svg>
  )
}

export function FullRoadmapFigure({ alt }: { alt: string }) {
  const cols = [['As is', 10], ['Near', 230], ['Mid', 450], ['Far', 670]] as const
  // Increment 0 is the baseline TRAJECTORY: it spans the as-is and the near column (the committed Year-2 step).
  // Increments 1 and 2 run in parallel in the mid term; Increment 3 (far) depends on Increment 2.
  const bars = [
    { n: 0, x: 20, y: 80, w: 410, dashed: false, trigger: false },
    { n: 1, x: 460, y: 190, w: 190, dashed: false, trigger: true },
    { n: 2, x: 460, y: 300, w: 190, dashed: false, trigger: true },
    { n: 3, x: 680, y: 400, w: 190, dashed: true, trigger: true },
  ]
  const arrows = [
    'M 330 170 C 330 235, 400 235, 456 235',
    'M 250 170 C 250 345, 400 345, 456 345',
    'M 650 345 C 668 345, 668 445, 676 445',
  ]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          {cols.map(([t, x]) => (
            <g key={t}>
              <Shape x={x} y={10} w={210} h={500} tone="env" />
              <Lines x={x + 105} y={44} lines={[t]} size={S} weight={700} />
            </g>
          ))}
          {arrows.map((d) => (
            <Arrow key={d} id={id} d={d} tone="muted" width={2.6} />
          ))}
          {bars.map((b) => (
            <g key={`b${b.n}`}>
              <Card x={b.x} y={b.y} w={b.w} h={90} lines={b.n === 0 ? ['Increment 0:', 'trajectory'] : ['Increment', String(b.n)]} size={S} weight={700} tone={b.n === 0 ? 'box' : 'soft'} dashed={b.dashed} />
              {b.trigger && <Diamond cx={b.x} cy={b.y + 45} r={18} />}
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

export function ImpactTreeFigure({ alt }: { alt: string }) {
  const reached = IMPACT_CANDIDATE_IDS.filter((id) => IMPACT_JUDGED[id]?.reached)
  const weeks = impactByWeek(reached)
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          <Card x={10} y={200} w={240} h={120} lines={['Increment 3']} size={S} weight={700} tone="soft" strong />
          {weeks.map((w, i) => {
            const y = 20 + i * 100
            return (
              <g key={w.week}>
                <path d={`M 250 260 C 380 260, 380 ${y + 40}, 516 ${y + 40}`} style={{ fill: 'none', stroke: 'var(--wb-muted)', strokeWidth: 2.6 }} />
                <Card x={520} y={y} w={370} h={80} lines={[`Week ${w.week}: ${w.ids.length} IDs`]} size={S} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function ForwardW6Figure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={30} w={300} h={130} lines={['open items', 'with owners']} size={S} dashed />
          <Arrow id={id} d="M 135 160 L 135 236" tone="accent" />
          <Card x={10} y={240} w={250} h={160} lines={['Week 7', 'package and', 'review']} size={S} weight={600} tone="soft" strong />
          <Arrow id={id} d="M 262 320 L 321 320" />
          <Card x={325} y={240} w={250} h={160} lines={['Week 13', 'analysis', 'cases']} size={S} weight={600} />
          <Arrow id={id} d="M 577 320 L 636 320" />
          <Card x={640} y={240} w={250} h={160} lines={['Week 14', 'model', 'change']} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function LabWorksheetW6Figure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          <Lines x={20} y={30} lines={['As is']} size={S} anchor="start" weight={700} />
          {[78, 118, 158, 198, 238].map((y) => (
            <Line key={y} x1={20} y1={y} x2={880} y2={y} tone="muted" width={2} />
          ))}
          <Grid xs={[10, 450, 650, 890]} ys={[270, 330, 390, 450, 510]} />
          {[['Gap', 230], ['Horizon', 550], ['Need', 770]].map(([t, x]) => (
            <Lines key={t} x={x as number} y={300} lines={[t as string]} size={S} weight={700} />
          ))}
        </>
      )}
    </Svg>
  )
}

export function SevenDaysW6Figure({ alt }: { alt: string }) {
  const rows: [string, string][] = [
    ['Days 1–3', 'gaps, technology plan'],
    ['Days 3–5', 'increments, unknowns, AROU'],
    ['Days 5–6', 'impact, review, graphic'],
    ['Day 7', 'integrate and upload'],
  ]
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          <line x1={120} y1={30} x2={120} y2={490} style={{ stroke: 'var(--wb-accent)', strokeWidth: 4 }} />
          {rows.map(([d, t], i) => {
            const y = 75 + i * 120
            return (
              <g key={d}>
                <Card x={10} y={y - 40} w={220} h={80} lines={[d]} size={S} weight={700} tone="soft" />
                <Lines x={252} y={y} lines={[t]} size={S} anchor="start" />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}
