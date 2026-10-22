// Week 9, Session 1 lecture figures (original drawings; none redraws an OMG, SEBoK or training-deck figure): the week
// band, the two-team cards, the import lanes, need to requirement, table versus model, one definition and three usages,
// the subject and conformance, the declaration line, the assume/require truth table, the parameter slots, framing,
// the two kinds of group, the relationship ladder, the AeroLink thread, satisfy among the other relationships, the
// checker calibration table and the exit card. Every ID and value comes from src/content/lectures/week09/aerolinkCase.ts
// or listings.ts; every label meets the 1/56-of-slide-width rule (week7FigureKit.ts, checked by week9FigureKit.test.ts).
// These are course illustrations, not SysML v2 graphical notation (said on the slides that could be mistaken for it).
// Review status: new-pending-review.
import { CHAIN, reqOf } from '../../content/lectures/week09/aerolinkCase'
import { CALIBRATION } from '../../content/lectures/week09/listings'
import { Arrow, Card, Chip, Grid, Line, Lines, Shape, Svg } from './LectureWeek7Parts'
import { FB, T_FB } from './week7FigureKit'

const S = T_FB
const W = FB.w
const H = FB.h

export function WeekBandFigure9({ alt }: { alt: string }) {
  const weeks = [8, 9, 10, 11, 12, 13, 14]
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={20} y={14} w={400} h={76} lines={['Week 1 needs']} size={S} tone="soft" />
          <Card x={480} y={14} w={400} h={76} lines={['Week 2 requirements']} size={S} tone="soft" />
          <Arrow id={id} d="M 220 92 L 430 186" tone="accent" width={5} />
          <Arrow id={id} d="M 680 92 L 730 186" tone="accent" width={5} />
          <Card x={14} y={192} w={270} h={96} lines={['Stakeholders', 'Week 8']} size={S} tone="soft" />
          <Card x={300} y={192} w={250} h={96} lines={['Needs']} size={S} weight={700} strong />
          <Card x={566} y={192} w={320} h={96} lines={['Requirements']} size={S} weight={700} strong />
          <Lines x={20} y={360} lines={['Phase II']} size={S} anchor="start" weight={700} ink="muted" />
          {weeks.map((w, i) => (
            <Chip key={w} cx={250 + i * 96} cy={360} text={String(w)} size={S} tone={w === 9 ? 'box' : 'soft'} ink={w === 9 ? 'accent' : 'ink'} weight={w === 9 ? 800 : 500} />
          ))}
          <Lines x={W / 2} y={460} lines={['model v0.2 of your enterprise']} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function TwoCardsFigure({ alt }: { alt: string }) {
  const id = reqOf(CHAIN.sys).id
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={14} y={20} w={420} h={130} lines={[id, 'doc: the statement']} size={S} tone="panel" />
          <Lines x={224} y={200} lines={['Team A']} size={S} weight={700} />
          <Card x={466} y={20} w={420} h={130} lines={[id, 'doc: the statement']} size={S} tone="panel" />
          <Card x={466} y={166} w={420} h={66} lines={['subject: chargers']} size={S} tone="ok" />
          <Card x={466} y={246} w={420} h={66} lines={['limit: 20 min']} size={S} tone="ok" />
          <Card x={466} y={326} w={420} h={66} lines={['charge time ≤ limit']} size={S} tone="ok" />
          <Lines x={676} y={440} lines={['Team B']} size={S} weight={700} />
        </>
      )}
    </Svg>
  )
}

export function ImportLanesFigure({ alt }: { alt: string }) {
  const docs = ['Register', 'Needs', 'Requirements']
  const pkgs = ['Stakeholders', 'Needs', 'Requirements']
  const labels = ['STK, CON', 'MGO, NEED', 'REQ']
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Lines x={14} y={26} lines={['Phase I documents']} size={S} anchor="start" weight={700} ink="muted" />
          {docs.map((d, i) => (
            <Card key={d} x={14 + i * 296} y={56} w={280} h={76} lines={[d]} size={S} tone="soft" />
          ))}
          {labels.map((l, i) => (
            <g key={l}>
              <Arrow id={id} d={`M ${154 + i * 296} 134 L ${154 + i * 296} 330`} tone={i === 0 ? 'muted' : 'accent'} dashed={i === 0} width={4} />
              <Lines x={166 + i * 296} y={232} lines={[l]} size={S} anchor="start" weight={700} ink={i === 0 ? 'muted' : 'accent'} />
            </g>
          ))}
          {pkgs.map((p, i) => (
            <Card key={p} x={14 + i * 296} y={334} w={280} h={76} lines={[p]} size={S} weight={i ? 700 : 500} strong={i > 0} />
          ))}
          <Lines x={14} y={470} lines={['Model packages']} size={S} anchor="start" weight={700} ink="muted" />
        </>
      )}
    </Svg>
  )
}

export function NeedToReqFigure({ alt }: { alt: string }) {
  const b = CHAIN.budget
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={20} y={14} w={860} h={110} lines={[`Need: ${CHAIN.need}`, 'stakeholder’s view, black box']} size={S} tone="soft" />
          <Arrow id={id} d="M 450 126 L 450 194" tone="ink" width={4} />
          <Card x={20} y={198} w={860} h={110} lines={['Analysis and decision', `${b.total} = ${b.charge} + ${b.padWork} min`]} size={S} tone="panel" />
          <Arrow id={id} d="M 450 310 L 450 378" tone="accent" width={4} />
          <Lines x={470} y={344} lines={['traceable']} size={S} anchor="start" weight={700} ink="accent" />
          <Card x={20} y={382} w={860} h={124} lines={[`Requirement: ${CHAIN.stk}`, 'an obligation on an entity']} size={S} strong />
        </>
      )}
    </Svg>
  )
}

export function TableVsModelFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={10} y={160} w={300} h={200} lines={['table row', CHAIN.stk, `parent ${CHAIN.need}`]} size={S} tone="soft" />
          <Card x={500} y={222} w={250} h={76} lines={[CHAIN.stk]} size={S} weight={700} strong />
          <Card x={350} y={40} w={200} h={70} lines={[CHAIN.stakeholder]} size={S} />
          <Card x={690} y={40} w={200} h={70} lines={[CHAIN.concern]} size={S} />
          <Card x={350} y={410} w={220} h={70} lines={[CHAIN.need]} size={S} />
          <Card x={680} y={410} w={210} h={70} lines={['design']} size={S} dashed />
          <Line x1={560} y1={222} x2={470} y2={110} tone="ink" width={3} />
          <Line x1={690} y1={222} x2={780} y2={110} tone="ink" width={3} />
          <Line x1={560} y1={298} x2={470} y2={410} tone="ink" width={3} />
          <Line x1={690} y1={298} x2={780} y2={410} tone="muted" width={3} dashed />
        </>
      )}
    </Svg>
  )
}

export function DefUsagesFigure({ alt }: { alt: string }) {
  const uses: [string, string][] = [
    ['REQ-SYS-005', '60 s'],
    ['REQ-SYS-008', '2 min'],
    ['REQ-SYS-009', '30 s'],
  ]
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={190} y={14} w={520} h={120} lines={['definition', 'measured ≤ limit']} size={S} weight={600} strong />
          {uses.map(([u, v], i) => (
            <g key={u}>
              <Line x1={450} y1={134} x2={150 + i * 300} y2={330} tone="ink" width={3} />
              <Card x={14 + i * 300} y={330} w={272} h={130} lines={[u, `limit ${v}`]} size={S} tone="soft" />
            </g>
          ))}
          <Lines x={450} y={240} lines={['usages']} size={S} weight={700} ink="muted" halo />
        </>
      )}
    </Svg>
  )
}

export function SubjectFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={290} y={10} w={320} h={70} lines={[CHAIN.sys]} size={S} weight={700} strong />
          <Arrow id={id} d="M 450 82 L 450 160" tone="accent" width={4} />
          <Lines x={470} y={120} lines={['subject']} size={S} anchor="start" weight={700} ink="accent" />
          <Card x={290} y={164} w={320} h={70} lines={['Chargers']} size={S} tone="panel" />
          <Line x1={360} y1={236} x2={150} y2={360} tone="ok" width={3} />
          <Line x1={450} y1={236} x2={450} y2={360} tone="ok" width={3} />
          <Line x1={540} y1={236} x2={750} y2={360} tone="bad" width={3} dashed />
          <Card x={10} y={364} w={280} h={130} lines={['chargers', 'conforms']} size={S} tone="ok" />
          <Card x={310} y={364} w={280} h={130} lines={['fast chargers', 'specializes']} size={S} tone="ok" />
          <Card x={610} y={364} w={280} h={130} lines={['aircraft', 'does not']} size={S} tone="bad" />
        </>
      )}
    </Svg>
  )
}

export function DeclarationFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={10} y={30} w={320} h={86} lines={['requirement']} size={S} tone="soft" />
          <Card x={350} y={30} w={540} h={86} lines={[`<'${CHAIN.sys}'>`]} size={S} weight={700} strong />
          <Lines x={170} y={150} lines={['keyword']} size={S} weight={600} ink="muted" />
          <Lines x={620} y={150} lines={['short name = ID']} size={S} weight={700} ink="accent" />
          <Card x={10} y={250} w={560} h={86} lines={['\'Charge to dispatch …\'']} size={S} tone="panel" />
          <Card x={590} y={250} w={300} h={86} lines={['{ body }']} size={S} tone="panel" />
          <Lines x={290} y={370} lines={['declared name']} size={S} weight={600} ink="muted" />
          <Lines x={740} y={370} lines={['doc, subject …']} size={S} weight={600} ink="muted" />
          <Lines x={450} y={470} lines={['the ID is quoted: it has hyphens']} size={S} weight={600} />
        </>
      )}
    </Svg>
  )
}

export function TruthTableFigure({ alt }: { alt: string }) {
  const xs = [20, 300, 580, 880]
  const ys = [20, 120, 220, 320, 420]
  const rows: [string, string, string, 'ok' | 'bad'][] = [
    ['yes', 'yes', 'satisfied', 'ok'],
    ['yes', 'no', 'violated', 'bad'],
    ['no', 'either', 'satisfied', 'ok'],
  ]
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Grid xs={xs} ys={ys} />
          {['assumes', 'requires', 'result'].map((t, i) => (
            <Lines key={t} x={(xs[i] + xs[i + 1]) / 2} y={70} lines={[t]} size={S} weight={700} />
          ))}
          {rows.map((r, j) => (
            <g key={j}>
              <Lines x={(xs[0] + xs[1]) / 2} y={170 + j * 100} lines={[r[0]]} size={S} />
              <Lines x={(xs[1] + xs[2]) / 2} y={170 + j * 100} lines={[r[1]]} size={S} />
              <Lines x={(xs[2] + xs[3]) / 2} y={170 + j * 100} lines={[r[2]]} size={S} weight={700} ink={r[3]} />
            </g>
          ))}
          <Lines x={450} y={475} lines={['row 3: nothing is demanded']} size={S} weight={600} ink="warn" />
        </>
      )}
    </Svg>
  )
}

export function ParamSlotsFigure({ alt }: { alt: string }) {
  const slots: [string, string][] = [
    ['subject', 'the entity obliged'],
    ['actor', 'external, needed'],
    ['stakeholder', 'has concerns'],
  ]
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Shape x={10} y={10} w={880} h={500} tone="panel" />
          <Lines x={40} y={56} lines={['requirement']} size={S} anchor="start" weight={700} />
          {slots.map(([k, v], i) => (
            <g key={k}>
              <Card x={40} y={110 + i * 130} w={290} h={96} lines={[k]} size={S} weight={700} tone={i === 0 ? 'box' : 'soft'} strong={i === 0} />
              <Lines x={360} y={158 + i * 130} lines={[v]} size={S} anchor="start" />
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

export function FrameFigure9({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={210} w={280} h={90} lines={[CHAIN.need]} size={S} weight={700} strong />
          <Card x={560} y={60} w={330} h={90} lines={[CHAIN.concern]} size={S} tone="soft" />
          <Card x={560} y={370} w={330} h={90} lines={['CON-012']} size={S} tone="soft" />
          <Arrow id={id} d="M 292 236 L 556 112" tone="accent" width={5} />
          <Lines x={380} y={130} lines={['frame']} size={S} weight={700} ink="accent" halo />
          <Arrow id={id} d="M 292 276 L 556 410" tone="muted" dashed width={3} />
          <Lines x={430} y={345} lines={['✕']} size={S} weight={800} ink="bad" halo />
          <Lines x={725} y={492} lines={['not answered']} size={S} weight={600} ink="muted" />
        </>
      )}
    </Svg>
  )
}

export function GroupsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={10} y={14} w={430} h={330} lines={['specification group', 'one group subject', 'members share or', 'bind to it']} size={S} tone="soft" title={undefined} />
          <Card x={460} y={14} w={430} h={330} lines={['organizing group', 'no group subject', 'members unbound']} size={S} tone="soft" />
          <Chip cx={225} cy={420} text="satisfiable" size={S} tone="ok" />
          <Chip cx={675} cy={420} text="satisfy members" size={S} tone="warn" />
        </>
      )}
    </Svg>
  )
}

export function LadderFigure({ alt }: { alt: string }) {
  const rungs: [string, 'box' | 'soft'][] = [
    ['satisfy: an assertion', 'box'],
    ['derivation: parent ⇒ child', 'soft'],
    ['refinement: more precise', 'soft'],
    ['dependency: model level only', 'soft'],
  ]
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Arrow id={id} d="M 60 500 L 60 20" tone="accent" width={5} />
          {rungs.map(([t, tone], i) => (
            <Card key={t} x={110} y={14 + i * 126} w={780} h={104} lines={[t]} size={S} tone={tone} strong={i === 0} weight={i === 0 ? 700 : 500} />
          ))}
        </>
      )}
    </Svg>
  )
}

export function ThreadFigure({ alt }: { alt: string }) {
  const nodes = [CHAIN.stakeholder, CHAIN.concern, CHAIN.need, CHAIN.stk, CHAIN.sys]
  const links = ['stakeholder', 'frame', 'derivation', 'derivation']
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          {nodes.map((n, i) => (
            <Card key={n} x={20} y={8 + i * 104} w={290} h={66} lines={[n]} size={S} weight={i === 4 ? 700 : 500} strong={i === 4} tone={i < 2 ? 'soft' : 'box'} />
          ))}
          {links.map((l, i) => (
            <g key={i}>
              <Arrow id={id} d={`M 165 ${76 + i * 104} L 165 ${110 + i * 104}`} tone="ink" width={3} />
              <Lines x={190} y={93 + i * 104} lines={[l]} size={S} anchor="start" weight={600} ink="accent" halo />
            </g>
          ))}
          <Arrow id={id} d="M 312 448 L 500 360" tone="muted" dashed width={3} />
          <Arrow id={id} d="M 312 458 L 500 470" tone="muted" dashed width={3} />
          <Card x={504} y={316} w={380} h={80} lines={['satisfy · Week 11']} size={S} tone="dash" ink="muted" />
          <Card x={504} y={430} w={380} h={80} lines={['verify · Week 12']} size={S} tone="dash" ink="muted" />
        </>
      )}
    </Svg>
  )
}

export function SatisfyPreviewFigure({ alt }: { alt: string }) {
  return (
    <Svg w={W} h={H} alt={alt}>
      {(id) => (
        <>
          <Card x={300} y={10} w={300} h={72} lines={[CHAIN.stk]} size={S} tone="soft" />
          <Card x={300} y={214} w={300} h={76} lines={[CHAIN.sys]} size={S} weight={700} strong />
          <Card x={10} y={400} w={240} h={76} lines={['Chargers']} size={S} tone="warn" strong />
          <Card x={630} y={390} w={260} h={110} lines={['verification', 'case']} size={S} dashed ink="muted" />
          <Arrow id={id} d="M 450 212 L 450 86" tone="ink" width={4} />
          <Lines x={470} y={150} lines={['derivation']} size={S} anchor="start" weight={600} />
          <Arrow id={id} d="M 200 398 L 330 294" tone="warn" width={6} />
          <Lines x={30} y={330} lines={['satisfy']} size={S} anchor="start" weight={800} ink="warn" />
          <Arrow id={id} d="M 700 388 L 580 294" tone="muted" dashed width={3} />
          <Lines x={680} y={320} lines={['verify']} size={S} anchor="start" weight={600} ink="muted" />
        </>
      )}
    </Svg>
  )
}

export function CheckerTableFigure({ alt }: { alt: string }) {
  const rej = CALIBRATION.filter((c) => c.result === 'FAIL')
  const acc = CALIBRATION.filter((c) => c.result !== 'FAIL')
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <>
          <Card x={10} y={10} w={430} h={80} lines={['checker rejects']} size={S} weight={700} tone="ok" />
          <Card x={460} y={10} w={430} h={80} lines={['checker accepts']} size={S} weight={700} tone="warn" />
          {rej.map((c, i) => (
            <Card key={c.file} x={10} y={110 + i * 130} w={430} h={110} lines={[c.label]} size={S} tone="soft" />
          ))}
          {acc.map((c, i) => (
            <Card key={c.file} x={460} y={110 + i * 130} w={430} h={110} lines={[c.label]} size={S} tone="soft" />
          ))}
        </>
      )}
    </Svg>
  )
}

export function ExitCardFigure9({ alt }: { alt: string }) {
  const fields = ['ID', 'doc', 'subject', 'constraint']
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
          <Chip cx={450} cy={420} text="and three questions" size={S} tone="soft" ink="accent" />
        </>
      )}
    </Svg>
  )
}
