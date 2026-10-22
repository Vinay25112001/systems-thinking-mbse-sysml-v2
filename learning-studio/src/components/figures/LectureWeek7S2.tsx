// Week 7, Session 2 lecture figures (original drawings): the argument skeleton, the two-depth briefing, the blank RID form,
// the disposition flow, AeroLink's four RIDs and the review time bar. Every number and ID comes from the AeroLink case
// (src/content/lectures/week07/aerolinkCase.ts) or the lab brief (labBrief.ts); every label meets the 1/56-of-slide-width
// rule (week7FigureKit.ts, checked by week7FigureKit.test.ts). Each figure draws exactly what its caption and alt text in
// session2.ts describe. Review status: new-pending-review.
import { RIDS } from '../../content/lectures/week07/aerolinkCase'
import { REVIEW_TEAM_MINUTES, reviewPlan } from '../../content/lectures/week07/labBrief'
import { Arrow, Card, Chip, Grid, Line, Lines, Shape, Svg } from './LectureWeek7Parts'
import { FB, FW, T_FB, T_FW } from './week7FigureKit'

const S = T_FB
const s = Math.max(T_FW, 26)

export function ArgumentFigure({ alt }: { alt: string }) {
  const boxes = [['claim'], ['evidence', 'by ID'], ['criteria and', 'weights'], ['conditions'], ['residual', 'risk'], ['what would', 'change it']]
  const pos = (i: number) => ({ x: 25 + (i % 3) * 300, y: i < 3 ? 60 : 300 })
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          {boxes.map((b, i) => {
            const p = pos(i)
            return <Card key={i} x={p.x} y={p.y} w={250} h={130} lines={b} size={S} weight={i === 0 ? 700 : 600} strong={i === 0} />
          })}
          <Arrow id={id} d="M 277 125 L 322 125" tone="ink" width={3} />
          <Arrow id={id} d="M 577 125 L 622 125" tone="ink" width={3} />
          <Arrow id={id} d="M 750 192 L 750 262 L 150 262 L 150 297" tone="ink" width={3} />
          <Arrow id={id} d="M 277 365 L 322 365" tone="ink" width={3} />
          <Arrow id={id} d="M 577 365 L 622 365" tone="ink" width={3} />
          <Chip cx={450} cy={222} text="ID" size={S} tone="panel" ink="accent" />
          <Arrow id={id} d="M 877 365 L 893 365 L 893 30 L 150 30 L 150 57" tone="accent" width={3} dashed />
        </>
      )}
    </Svg>
  )
}

export function ExecBriefFigure({ alt }: { alt: string }) {
  const panels = ['trade', 'risk', 'roadmap']
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Card x={14} y={16} w={790} h={160} title="decision and conditions," lines={['in plain words']} size={S} strong />
          {panels.map((p, i) => (
            <g key={p}>
              <Shape x={14 + i * 270} y={230} w={250} h={270} tone="soft" />
              <Lines x={139 + i * 270} y={300} lines={[p]} size={S} weight={700} />
              <Chip cx={139 + i * 270} cy={400} text="ID" size={S} tone="panel" ink="accent" />
            </g>
          ))}
          <Lines x={858} y={100} lines={['?']} size={S + 16} weight={700} ink="accent" />
          <Arrow id={id} d="M 858 140 L 858 330 L 812 330" tone="accent" width={3} dashed />
        </>
      )}
    </Svg>
  )
}

export function RidFormFigure({ alt }: { alt: string }) {
  const rows = ['RID number and reviewer', 'where, the ID or section', 'what is wrong', 'the criterion or source', 'severity', 'proposed fix']
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          <Shape x={4} y={4} w={892} h={512} tone="panel" />
          {rows.map((r, i) => {
            const y = 50 + i * 84
            return (
              <g key={r}>
                <Lines x={20} y={y} lines={[r]} size={S} anchor="start" weight={600} />
                {r === 'severity' ? (
                  <>
                    <Shape x={470} y={y - 18} w={36} h={36} tone="box" rx={4} />
                    <Lines x={518} y={y} lines={['major']} size={S} anchor="start" />
                    <Shape x={680} y={y - 18} w={36} h={36} tone="box" rx={4} />
                    <Lines x={728} y={y} lines={['minor']} size={S} anchor="start" />
                  </>
                ) : (
                  <Shape x={460} y={y - 26} w={420} h={52} tone="box" rx={6} />
                )}
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function DispositionFlowFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {(id) => (
        <>
          <Card x={6} y={210} w={110} h={100} lines={['RID']} size={S} weight={700} strong />
          <Arrow id={id} d="M 118 240 L 216 80" tone="ink" width={3} />
          <Card x={220} y={6} w={470} h={140} title="Accept" lines={['response says', 'what changes; owner']} size={S} tone="ok" />
          <Arrow id={id} d="M 118 260 L 216 252" tone="ink" width={3} />
          <Card x={220} y={164} w={470} h={176} title="Defer" lines={['response says when;', 'owner; carried as', 'an open item']} size={S} tone="warn" />
          <Arrow id={id} d="M 118 282 L 216 428" tone="ink" width={3} />
          <Card x={220} y={360} w={470} h={140} title="Reject" lines={['response gives', 'the evidence']} size={S} />
          {[76, 252, 430].map((y) => (
            <Arrow key={y} id={id} d={`M 692 ${y} L 736 ${y}`} tone="ink" width={3} />
          ))}
          <Card x={740} y={6} w={150} h={494} lines={['exit', 'criteria', 'met']} size={S} weight={700} tone="soft" strong />
        </>
      )}
    </Svg>
  )
}

/** AeroLink's RIDs on a figure-with-body canvas (1200 × 280): a four-column table. */
export function DefendFigure({ alt }: { alt: string }) {
  const xs = [6, 186, 676, 896, 1194]
  const rowH = (FW.h - 12) / (RIDS.length + 1)
  const ys = Array.from({ length: RIDS.length + 2 }, (_, i) => 6 + i * rowH)
  const head = ['RID', 'where', 'severity', 'disposition']
  return (
    <Svg w={FW.w} h={FW.h} alt={alt}>
      {() => (
        <>
          <Grid xs={xs} ys={ys} />
          {head.map((h, k) => (
            <Lines key={h} x={xs[k] + 12} y={ys[0] + rowH / 2} lines={[h]} size={s} anchor="start" weight={700} />
          ))}
          {RIDS.map((r, i) => {
            const y = ys[i + 1] + rowH / 2
            return (
              <g key={r.id}>
                <Lines x={xs[0] + 12} y={y} lines={[r.id]} size={s} anchor="start" weight={600} />
                <Lines x={xs[1] + 12} y={y} lines={[r.location]} size={s} anchor="start" />
                <Lines x={xs[2] + 12} y={y} lines={[r.severity]} size={s} anchor="start" weight={r.severity === 'major' ? 700 : 500} />
                <Lines x={xs[3] + 12} y={y} lines={[r.disposition]} size={s} anchor="start" weight={600} ink="accent" />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

export function ReviewTimelineFigure({ alt }: { alt: string }) {
  const plan = reviewPlan(5)
  const total = REVIEW_TEAM_MINUTES + 4
  const x0 = 20
  const scale = 860 / total
  const X = (m: number) => x0 + m * scale
  const top = 170
  const h = 90
  return (
    <Svg w={FB.w} h={FB.h} alt={alt}>
      {() => (
        <>
          <Shape x={X(0)} y={top} w={2 * scale} h={h} tone="soft" rx={4} />
          {Array.from({ length: plan.teams }, (_, i) => {
            const m = 2 + i * plan.slot
            return (
              <g key={i}>
                <Shape x={X(m)} y={top} w={plan.briefing * scale} h={h} tone="box" rx={4} />
                <Shape x={X(m + plan.briefing)} y={top} w={plan.questions * scale} h={h} tone="warn" rx={4} />
                <Lines x={X(m + plan.briefing / 2)} y={top + h / 2} lines={['B']} size={S} weight={700} />
                <Lines x={X(m + plan.briefing + plan.questions / 2)} y={top + h / 2} lines={['Q']} size={S} weight={700} />
                <Lines x={X(m + plan.slot / 2)} y={top - 40} lines={[`team ${i + 1}`]} size={S} weight={600} />
              </g>
            )
          })}
          <Shape x={X(total - 2)} y={top} w={2 * scale} h={h} tone="soft" rx={4} />
          <Line x1={X(0)} y1={top + h + 14} x2={X(total)} y2={top + h + 14} tone="muted" width={2} />
          <Lines x={X(0)} y={top + h + 48} lines={['2 min open']} size={S} anchor="start" ink="muted" />
          <Lines x={X(total)} y={top + h + 48} lines={['2 min close']} size={S} anchor="end" ink="muted" />
          <Lines x={450} y={top + h + 112} lines={[`B: ${plan.briefing} min briefing · Q: ${plan.questions} min questions`]} size={S} weight={600} />
          <Lines x={450} y={44} lines={[`${total} min: ${plan.teams} slots of ${plan.slot} min`]} size={S} weight={700} />
        </>
      )}
    </Svg>
  )
}
