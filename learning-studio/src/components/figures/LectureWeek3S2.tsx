// Week 3, Session 2 lecture figures (decision management, the AeroLink Year-2 capacity trade worked in full, the
// weighted-sum pitfalls, the decision record, the lab launch). Original drawings: none redraws a SEBoK, MITRE or DoD
// figure (the decision ring is drawn from the DoD step list, R43 p.110, not SEBoK's Figure 1). Every number, name and
// identifier is imported from src/content/lectures/week03/aerolinkCase.ts and labBrief.ts; every other label is a phrase
// from the slide or lesson text. AeroLink is FICTIONAL; a figure adds no claim of its own. Canvas sizes and the 12 pt
// label rule: LectureWeek3Parts.tsx. Review status: new-pending-review.
import type { ComponentType } from 'react'
import { ALTERNATIVES, CRITERIA, DECISION, FEASIBLE, FEEDS_FORWARD, MINMAX_DEMO, MORPH_FLEET, MORPH_HUBS, MORPH_PATHS, RANKING, REQUIRED_CAPACITY, SENSITIVITY, TOTALS, TRADE_RULES, VALUES, WEIGHTS, alternative, capacityOfAlt, lineDiagram } from '../../content/lectures/week03/aerolinkCase'
import { CHECKPOINT_CRITERIA, LAB3_MINIMUMS as MIN } from '../../content/lectures/week03/labBrief'
import { Arrow, Card, CheckBox, Charger, Chip, Craft, FB_W, FW_H, FW_W, Lines, MIN_FB, MIN_FW, Shape, Svg, f2, f3, fit, wrap, type Tone } from './LectureWeek3Parts'

const S = MIN_FB
const SW = MIN_FW
const L = S + 2
/** Short alternative names for drawings ("Baseline", "Aircraft only", "Vertiport only", "Balanced", "New hub", "Six + hub"). */
const SHORT: Record<string, string> = { 'ALT-005': 'New hub', 'ALT-006': 'Six + hub' }
const short = (id: string) => {
  if (SHORT[id]) return SHORT[id]
  const n = alternative(id).name.split(':')[0].replace(/^Additional /, '')
  return n.charAt(0).toUpperCase() + n.slice(1)
}
const ALT_DASH: Record<string, string | undefined> = { 'ALT-001': '2 6', 'ALT-002': '12 6', 'ALT-003': '4 4 12 4', 'ALT-004': undefined, 'ALT-005': '16 5 3 5', 'ALT-006': '7 4' }
const ALT_STROKE: Record<string, string> = { 'ALT-001': 'var(--wb-muted)', 'ALT-002': 'var(--wb-warn)', 'ALT-003': 'var(--wb-ok)', 'ALT-004': 'var(--wb-accent)', 'ALT-005': 'var(--wb-bad)', 'ALT-006': 'var(--wb-fg)' }

// ------------------------------------------------------------------------------------------------ decision management
const STEPS = ['Identify the problem', 'Review requirements and assumptions', 'Frame the decision', 'Choose methods and tools', 'Develop criteria and weights', 'Record assumptions', 'Define alternatives', 'Assess alternatives', 'Synthesize results', 'Analyze sensitivities', 'Brief and recommend']
const LAB: Record<number, string> = { 2: 'decision statement', 4: 'criteria, weights', 6: 'alternatives', 7: 'scores', 9: 'sensitivity', 10: 'recommendation' }
export function DecisionRingFigure({ alt }: { alt: string }) {
  const cx = 450
  const cy = 278
  const r = 178
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: 'var(--wb-line-strong)', strokeWidth: 3 }} />
          {STEPS.map((s, i) => {
            const a = -Math.PI / 2 + (i * 2 * Math.PI) / STEPS.length
            const x = cx + r * Math.cos(a)
            const y = cy + r * Math.sin(a)
            const a2 = a + (2 * Math.PI) / STEPS.length
            const lab = LAB[i]
            const anchor = Math.abs(Math.cos(a)) < 0.15 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end'
            const lines = wrap(s, 19)
            const all = lab ? [...lines, `Lab: ${lab}`] : lines
            const half = ((all.length - 1) * S * 1.22) / 2
            const lx = anchor === 'middle' ? x : anchor === 'start' ? x + 28 : x - 28
            const ly = anchor === 'middle' ? y + (Math.sin(a) < 0 ? -(30 + half) : 30 + half) : y
            const dy = 0
            return (
              <g key={s}>
                <Arrow d={`M ${x + 22 * Math.cos(a + Math.PI / 2)} ${y + 22 * Math.sin(a + Math.PI / 2)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a2 - 0.16)} ${cy + r * Math.sin(a2 - 0.16)}`} id={id} tone="muted" width={2} />
                <circle cx={x} cy={y} r={19} style={lab ? { fill: 'var(--wb-accent)' } : { fill: 'var(--wb-panel)', stroke: 'var(--wb-line-strong)', strokeWidth: 2 }} />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={S - 2 < 20 ? 20 : S - 2} fontWeight={700} style={{ fill: lab ? 'var(--wb-panel)' : 'var(--wb-fg)' }}>
                  {i + 1}
                </text>
                {all.map((l, k) => (
                  <text key={k} x={lx} y={ly + dy + (k - (all.length - 1) / 2) * S * 1.22} textAnchor={anchor} dominantBaseline="central" fontSize={S} fontWeight={lab && k === all.length - 1 ? 700 : 500} className={lab && k === all.length - 1 ? 'f-accent-ink' : 'f-label'}>
                    {l}
                  </text>
                ))}
              </g>
            )
          })}
          <Lines x={cx} y={cy} lines={['The decision', 'maker keeps full', 'responsibility']} size={S} weight={700} />
        </g>
      )}
    </Svg>
  )
}

export function ObjectivesHierarchyFigure({ alt }: { alt: string }) {
  const w = 214
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          <Card x={200} y={10} w={500} h={78} lines={['Provide the Year-2', 'capacity objective']} size={L} weight={700} tone="soft" strong />
          {CRITERIA.map((c, i) => {
            const x = 10 + i * (w + 8)
            return (
              <g key={c.id}>
                <Arrow d={`M 450 90 L ${x + w / 2} 148`} id={id} tone="muted" />
                <Shape x={x} y={150} w={w} h={250} tone="box" />
                <Lines x={x + w / 2} y={215} lines={wrap(c.name, fit(w - 16, S))} size={S} weight={700} />
                <Lines x={x + w / 2} y={305} lines={[c.unit]} size={S} ink="muted" />
                <Chip cx={x + w / 2} cy={360} text={`→ ${c.moe}`} size={S} tone="panel" ink="accent" />
              </g>
            )
          })}
          <Shape x={10} y={430} w={880} h={70} tone="dash" />
          <Lines x={450} y={465} lines={['Cost and risk handled explicitly']} size={S} weight={700} />
        </g>
      )}
    </Svg>
  )
}

export function ValueFunctionsFigure({ alt }: { alt: string }) {
  const wait = CRITERIA[0]
  const kept = CRITERIA[2]
  const chart = (x0: number, title: string, xs: [number, number], pts: [number, number][], ticks: number[], labels: { at: [number, number]; text: string; anchor: 'start' | 'end'; dy: number }[], extra?: string) => {
    const W = 330
    const H = 300
    const px = (v: number) => x0 + ((v - xs[0]) / (xs[1] - xs[0])) * W
    const py = (v: number) => 420 - v * H
    return (
      <g>
        <line x1={x0} y1={420} x2={x0 + W} y2={420} className="f-axis" style={{ strokeWidth: 2 }} />
        <line x1={x0} y1={420} x2={x0} y2={100} className="f-axis" style={{ strokeWidth: 2 }} />
        <Lines x={x0 - 10} y={py(1)} lines={['1']} size={S} anchor="end" />
        <Lines x={x0 - 10} y={py(0)} lines={['0']} size={S} anchor="end" />
        <Lines x={x0 + W / 2} y={40} lines={[title]} size={S} weight={700} />
        {ticks.map((t) => (
          <Lines key={t} x={px(t)} y={446} lines={[String(t)]} size={S} />
        ))}
        {extra && <path d={extra} fill="none" style={{ stroke: 'var(--wb-muted)', strokeWidth: 2.5, opacity: 0.7 }} strokeDasharray="5 5" />}
        <polyline points={pts.map(([a, b]) => `${px(a)},${py(b)}`).join(' ')} fill="none" style={{ stroke: 'var(--wb-accent)', strokeWidth: 4 }} />
        {labels.map((l) => (
          <Lines key={l.text} x={px(l.at[0]) + (l.anchor === 'start' ? 10 : l.dy > 0 ? -26 : -10)} y={py(l.at[1]) + l.dy} lines={[l.text]} size={S} weight={700} anchor={l.anchor} ink="accent" />
        ))}
      </g>
    )
  }
  const kx = (v: number) => 540 + ((v - 40) / 60) * 330
  const concave = Array.from({ length: 21 }, (_, i) => 50 + i * 2.5).map((v) => `${kx(v)},${420 - Math.sqrt((v - 50) / 50) * 300}`).join(' L ')
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {() => (
        <g>
          {chart(80, 'Wait (min)', [0, 70], [[0, 1], [wait.stretch, 1], [wait.walkAway, 0], [70, 0]], [wait.stretch, wait.walkAway], [{ at: [wait.stretch, 1], text: 'stretch', anchor: 'start', dy: -24 }, { at: [wait.walkAway, 0], text: 'walk-away', anchor: 'start', dy: -26 }])}
          {chart(540, 'Capacity kept (%)', [40, 100], [[40, 0], [kept.walkAway, 0], [kept.stretch, 1]], [kept.walkAway, kept.stretch], [{ at: [kept.walkAway, 0], text: 'walk-away', anchor: 'end', dy: 26 }, { at: [kept.stretch, 1], text: 'stretch', anchor: 'end', dy: -24 }], `M ${concave}`)}
          <Lines x={705} y={492} lines={['dashed: other shapes exist']} size={S} ink="muted" />
          <Lines x={245} y={492} lines={['value from 0 to 1']} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function SwingWeightsFigure({ alt }: { alt: string }) {
  const max = Math.max(...CRITERIA.map((c) => c.swingPoints))
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {() => (
        <g>
          {CRITERIA.map((c, i) => {
            const y = 14 + i * 112
            const w = (c.swingPoints / max) * 520
            return (
              <g key={c.id}>
                <Lines x={10} y={y + 16} lines={[`${i + 1}. ${c.name}`]} size={S} weight={700} anchor="start" />
                <Lines x={890} y={y + 16} lines={[`${c.walkAway} → ${c.stretch} ${c.unit}`]} size={S} anchor="end" ink="muted" />
                <Shape x={10} y={y + 38} w={w} h={50} tone={i === 0 ? 'soft' : 'box'} rx={4} />
                <Lines x={w + 22} y={y + 63} lines={[`${c.swingPoints} pts → ${f2(WEIGHTS[i])}`]} size={S} weight={700} anchor="start" ink="accent" />
              </g>
            )
          })}
          <line x1={10} y1={466} x2={890} y2={466} className="f-divider" style={{ strokeWidth: 2 }} />
          <Lines x={450} y={494} lines={[`${CRITERIA.reduce((a, c) => a + c.swingPoints, 0)} points; weight = points ÷ total; weights sum to 1`]} size={S} weight={600} />
        </g>
      )}
    </Svg>
  )
}

export function MorphBoxFigure({ alt }: { alt: string }) {
  const hubText: Record<string, string[]> = { keep: ['Keep 3'], upgrade: ['Upgrade a spoke', 'to a fourth hub'], new: ['New vertiport', 'as a fourth hub'] }
  const cx = (i: number) => 330 + i * 250
  const hubOf = (a: (typeof ALTERNATIVES)[number]) => (a.newHubs ? 2 : a.upgradedChargers ? 1 : 0)
  const fleetOf = (a: (typeof ALTERNATIVES)[number]) => MORPH_FLEET.findIndex((f) => f.added === a.addedAircraft)
  const unlisted = MORPH_PATHS.filter((p) => !p.alt)
  const why = (p: (typeof MORPH_PATHS)[number]) => `${p.fleet} + ${p.hubs.split(' ')[0].toLowerCase()}: ${p.fails.includes('capacity') ? `${p.capacity} trips/day` : `USD ${p.cost} M`}`
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {() => (
        <g>
          {ALTERNATIVES.map((a, i) => (
            <g key={a.id}>
              <line x1={20 + (i % 3) * 300} y1={16 + Math.floor(i / 3) * 30} x2={64 + (i % 3) * 300} y2={16 + Math.floor(i / 3) * 30} style={{ stroke: ALT_STROKE[a.id], strokeWidth: 5 }} strokeDasharray={ALT_DASH[a.id]} />
              <Lines x={72 + (i % 3) * 300} y={16 + Math.floor(i / 3) * 30} lines={[short(a.id)]} size={SW} weight={700} anchor="start" />
            </g>
          ))}
          <Lines x={100} y={98} lines={['Fleet']} size={SW + 2} weight={700} />
          <Lines x={100} y={228} lines={['Hubs']} size={SW + 2} weight={700} />
          {MORPH_FLEET.map((f, i) => (
            <Card key={i} x={cx(i) - 110} y={70} w={220} h={56} lines={[f.label]} size={SW} />
          ))}
          {MORPH_HUBS.map((h, i) => (
            <Card key={h.key} x={cx(i) - 110} y={194} w={220} h={70} lines={hubText[h.key]} size={SW} />
          ))}
          {ALTERNATIVES.map((a, i) => {
            const off = (i - 2.5) * 12
            return <path key={a.id} d={`M ${cx(fleetOf(a)) + off} 128 L ${cx(hubOf(a)) + off} 192`} fill="none" style={{ stroke: ALT_STROKE[a.id], strokeWidth: 5 }} strokeDasharray={ALT_DASH[a.id]} />
          })}
          <Lines x={20} y={296} lines={['Three more paths fail a screen from the box alone:']} size={SW} weight={700} anchor="start" ink="muted" />
          <Lines x={20} y={324} lines={[unlisted.map(why).join(' · ')]} size={SW} anchor="start" ink="muted" />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ the AeroLink trade
const MARK = ['circle', 'square', 'triangle', 'diamond', 'square', 'triangle'] as const
function Marker({ x, y, k, id }: { x: number; y: number; k: number; id: string }) {
  const st = { fill: ALT_STROKE[id], stroke: 'var(--wb-fg)', strokeWidth: 1.5 }
  if (MARK[k] === 'circle') return <circle cx={x} cy={y} r={10} style={st} />
  if (MARK[k] === 'square') return <rect x={x - 9} y={y - 9} width={18} height={18} style={st} />
  if (MARK[k] === 'triangle') return <path d={`M ${x} ${y - 11} L ${x + 11} ${y + 9} L ${x - 11} ${y + 9} Z`} style={st} />
  return <path d={`M ${x} ${y - 12} L ${x + 12} ${y} L ${x} ${y + 12} L ${x - 12} ${y} Z`} style={st} />
}
export function CapacityChartFigure({ alt }: { alt: string }) {
  const px = (v: number) => 110 + ((v - 200) / 200) * 470
  const py = (v: number) => 300 - ((v - 250) / 170) * 270
  const req = REQUIRED_CAPACITY
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {() => (
        <g>
          <rect x={px(req)} y={py(420)} width={px(400) - px(req)} height={py(req) - py(420)} style={{ fill: 'var(--wb-ok-soft)', opacity: 0.6 }} />
          <line x1={110} y1={300} x2={580} y2={300} className="f-axis" style={{ strokeWidth: 2 }} />
          <line x1={110} y1={300} x2={110} y2={30} className="f-axis" style={{ strokeWidth: 2 }} />
          <line x1={px(250)} y1={py(250)} x2={px(400)} y2={py(400)} className="f-divider" style={{ strokeWidth: 2 }} />
          <line x1={px(req)} y1={30} x2={px(req)} y2={300} style={{ stroke: 'var(--wb-warn)', strokeWidth: 2.5 }} strokeDasharray="8 5" />
          <line x1={110} y1={py(req)} x2={580} y2={py(req)} style={{ stroke: 'var(--wb-warn)', strokeWidth: 2.5 }} strokeDasharray="8 5" />
          {[200, 300, 400].map((v) => (
            <Lines key={v} x={px(v)} y={322} lines={[String(v)]} size={SW} />
          ))}
          {[250, 300, 400].map((v) => (
            <Lines key={v} x={100} y={py(v)} lines={[String(v)]} size={SW} anchor="end" />
          ))}
          <Lines x={480} y={322} lines={['fleet limit →']} size={SW} weight={600} ink="muted" />
          <Lines x={120} y={18} lines={['charger limit (trips/day)']} size={SW} anchor="start" weight={600} ink="muted" />
          <Lines x={px(req) + 8} y={py(415)} lines={[`${req}`]} size={SW} weight={700} anchor="start" ink="warn" />
          {ALTERNATIVES.map((a, k) => {
            // two alternatives share a point (same fleet and charger limits); offset the second so both markers show
            const twin = ALTERNATIVES.findIndex((b) => b.aircraft === a.aircraft && b.chargers === a.chargers) < k
            return <Marker key={a.id} x={px(a.aircraft * TRADE_RULES.tripsPerAircraft) + (twin ? 22 : 0)} y={py(a.chargers * TRADE_RULES.chargesPerCharger)} k={k} id={a.id} />
          })}
          {ALTERNATIVES.map((a, k) => (
            <g key={a.id}>
              <Marker x={630} y={44 + k * 46} k={k} id={a.id} />
              <Lines x={652} y={44 + k * 46} lines={[`${short(a.id)}: ${capacityOfAlt(a)}/day`]} size={SW} weight={a.id === DECISION.recommended ? 700 : 500} anchor="start" ink={capacityOfAlt(a) >= req ? 'accent' : 'ink'} />
            </g>
          ))}
          <Lines x={630} y={322} lines={['capacity = the lower limit']} size={SW} anchor="start" ink="muted" />
        </g>
      )}
    </Svg>
  )
}

const SEG_TONE: Tone[] = ['soft', 'box', 'ok', 'warn']
const SEG_LETTER = ['W', 'C', 'K', 'N']
export function ValueComponentsFigure({ alt }: { alt: string }) {
  const x0 = 220
  const scale = 900
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {() => (
        <g>
          {['wait', 'cost', 'capacity kept', 'noise'].map((n, i) => (
            <g key={n}>
              <Shape x={[60, 250, 440, 740][i]} y={8} w={28} h={28} tone={SEG_TONE[i]} rx={3} />
              <Lines x={[96, 286, 476, 776][i]} y={22} lines={[`${SEG_LETTER[i]} = ${n}`]} size={SW} anchor="start" />
            </g>
          ))}
          {RANKING.map((aid, r) => {
            const y = 56 + r * 70
            const segs = VALUES[aid].map((v, i) => WEIGHTS[i] * v * scale)
            const starts = segs.map((_, i) => x0 + segs.slice(0, i).reduce((a, b) => a + b, 0))
            const x = x0 + segs.reduce((a, b) => a + b, 0)
            return (
              <g key={aid}>
                <Lines x={x0 - 12} y={y + 26} lines={[short(aid)]} size={SW} weight={700} anchor="end" />
                {segs.map((w, i) => {
                  const sx = starts[i]
                  return w > 0 ? (
                    <g key={i}>
                      <Shape x={sx} y={y} w={w} h={52} tone={SEG_TONE[i]} rx={0} />
                      {w > 34 && <Lines x={sx + w / 2} y={y + 26} lines={[SEG_LETTER[i]]} size={SW} weight={700} />}
                    </g>
                  ) : null
                })}
                <Lines x={x + 10} y={y + 26} lines={[f3(TOTALS[aid])]} size={SW} weight={700} anchor="start" ink={r === 0 ? 'accent' : 'ink'} />
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

export function LineDiagramFigure({ alt }: { alt: string }) {
  const k = CRITERIA.findIndex((c) => c.id === 'CRIT-002')
  const data = lineDiagram(k)
  const rev = SENSITIVITY.find((s) => s.criterion === 'CRIT-002')!.down!
  const px = (w: number) => 100 + w * 560
  const py = (v: number) => 300 - v * 270
  const base = WEIGHTS[k]
  const at = (aid: string, w: number) => (data[0].totals[aid] as number) + ((data[10].totals[aid] as number) - (data[0].totals[aid] as number)) * w
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {() => (
        <g>
          <line x1={100} y1={300} x2={660} y2={300} className="f-axis" style={{ strokeWidth: 2 }} />
          <line x1={100} y1={300} x2={100} y2={20} className="f-axis" style={{ strokeWidth: 2 }} />
          {[0, 0.5, 1].map((v) => (
            <Lines key={v} x={px(v)} y={322} lines={[String(v)]} size={SW} />
          ))}
          {[0, 0.5, 1].map((v) => (
            <Lines key={v} x={90} y={py(v)} lines={[String(v)]} size={SW} anchor="end" />
          ))}
          <Lines x={480} y={322} lines={['cost weight →']} size={SW} ink="muted" />
          <line x1={px(base)} y1={20} x2={px(base)} y2={300} className="f-divider" style={{ strokeWidth: 2.4 }} />
          <Lines x={px(base) + 8} y={30} lines={[`base ${f2(base)}`]} size={SW} weight={700} anchor="start" />
          {FEASIBLE.map((a) => (
            <line key={a} x1={px(0)} y1={py(at(a, 0))} x2={px(1)} y2={py(at(a, 1))} style={{ stroke: ALT_STROKE[a], strokeWidth: a === DECISION.recommended ? 5 : 4 }} strokeDasharray={ALT_DASH[a]} />
          ))}
          <circle cx={px(rev.w)} cy={py(at('ALT-004', rev.w))} r={13} fill="none" style={{ stroke: 'var(--wb-bad)', strokeWidth: 3.5 }} />
          <Lines x={px(rev.w) + 6} y={py(at('ALT-004', rev.w)) - 30} lines={[f3(rev.w)]} size={SW} weight={700} ink="bad" />
          {[...FEASIBLE].sort((a, b) => at(b, 0) - at(a, 0)).map((a, i) => (
            <g key={a}>
              <line x1={700} y1={50 + i * 66} x2={750} y2={50 + i * 66} style={{ stroke: ALT_STROKE[a], strokeWidth: 5 }} strokeDasharray={ALT_DASH[a]} />
              <Lines x={760} y={50 + i * 66} lines={[short(a)]} size={SW} weight={700} anchor="start" />
            </g>
          ))}
          <Lines x={700} y={300} lines={['total value']} size={SW} anchor="start" ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function NormalizationTrapFigure({ alt }: { alt: string }) {
  const panel = (x0: number, title: string, totals: Record<string, number>) => {
    const ids = Object.keys(totals).sort((a, b) => totals[b] - totals[a])
    return (
      <g>
        <Lines x={x0 + 210} y={26} lines={[title]} size={S} weight={700} />
        {ids.map((aid, i) => {
          const y = 66 + i * 90
          const hl = MINMAX_DEMO.pair.includes(aid)
          return (
            <g key={aid}>
              <Lines x={x0} y={y + 4} lines={[`${i + 1}. ${short(aid)}`]} size={S} weight={hl ? 700 : 500} anchor="start" ink={hl ? 'warn' : 'ink'} />
              <Shape x={x0} y={y + 24} w={totals[aid] * 400} h={36} tone={hl ? 'warn' : 'box'} rx={3} />
              <Lines x={x0 + totals[aid] * 400 + 10} y={y + 42} lines={[f3(totals[aid])]} size={S} weight={700} anchor="start" />
            </g>
          )
        })}
      </g>
    )
  }
  return (
    <Svg w={FB_W} h={500} alt={alt}>
      {() => (
        <g>
          {panel(10, 'All three feasible', MINMAX_DEMO.all)}
          <line x1={450} y1={10} x2={450} y2={420} className="f-divider" style={{ strokeWidth: 2 }} />
          {panel(470, `${short(MINMAX_DEMO.removed)} removed`, MINMAX_DEMO.without)}
          <Shape x={10} y={430} w={880} h={60} tone="warn" />
          <Lines x={450} y={460} lines={[`${short(MINMAX_DEMO.pair[0])} and ${short(MINMAX_DEMO.pair[1]).toLowerCase()} swap places: min–max scaling`]} size={S} weight={700} />
        </g>
      )}
    </Svg>
  )
}

export function DecisionRecordFigure({ alt }: { alt: string }) {
  const rec = DECISION.recommended
  const boxes: { t: string; l: string[]; tone: Tone }[] = [
    { t: 'Decision', l: [`Provide ≥ ${REQUIRED_CAPACITY} trips/day by month 24`], tone: 'panel' },
    { t: 'Recommendation', l: [`${short(rec)}: ${capacityOfAlt(alternative(rec))} trips/day, value ${f3(TOTALS[rec])}`], tone: 'soft' },
    { t: 'Conditions', l: [`Capital weight > ${f2(SENSITIVITY[1].down!.w)} · noise weight < ${f2(SENSITIVITY[3].up!.w)}`, 'demand ≈ 240 · grid connection · charger security'], tone: 'box' },
    { t: 'Residual risk', l: [DECISION.residualRisk.map((r) => r.slice(0, 5)).join(' · ')], tone: 'box' },
    { t: 'Would change if', l: [`demand ≤ 192 · cost weight < ${f3(SENSITIVITY[1].down!.w)} · noise weight > ${f3(SENSITIVITY[3].up!.w)}`, `wait weight > ${f3(SENSITIVITY[0].up!.w)} · no spoke conversion: ${short(SENSITIVITY[1].down!.to).toLowerCase()}`], tone: 'warn' },
  ]
  const hs = boxes.map((b) => 34 + b.l.length * S * 1.22 + 10)
  const tops = hs.map((_, i) => 10 + hs.slice(0, i).reduce((a, h) => a + h + 10, 0))
  return (
    <Svg w={FB_W} h={tops[tops.length - 1] + hs[hs.length - 1] + 12} alt={alt}>
      {() => (
        <g>
          {boxes.map((b, i) => {
            const h = hs[i]
            const top = tops[i]
            return (
              <g key={b.t}>
                <Shape x={10} y={top} w={880} h={h} tone={b.tone} strong={b.tone === 'soft'} />
                <Lines x={26} y={top + 22} lines={[b.t]} size={S} weight={700} anchor="start" ink="accent" />
                <Lines x={26} y={top + 34 + (b.l.length * S * 1.22) / 2} lines={b.l} size={S} anchor="start" />
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ answer, bias, bridge
export function AnswerW3Figure({ alt }: { alt: string }) {
  const rec = alternative(DECISION.recommended)
  const hubs = rec.chargers / TRADE_RULES.chargersPerHub
  const perHub = rec.aircraft / hubs
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          {Array.from({ length: hubs }, (_, h) => {
            const x = 10 + (h % 2) * 450
            const y = 10 + Math.floor(h / 2) * 205
            const converted = h === hubs - 1
            return (
              <g key={h}>
                <Shape x={x} y={y} w={430} h={190} tone={converted ? 'soft' : 'env'} strong={converted} />
                <Lines x={x + 16} y={y + 26} lines={[converted ? 'Converted hub' : `Hub ${h + 1}`]} size={S} weight={700} anchor="start" />
                {Array.from({ length: perHub }, (_, i) => (
                  <Craft key={i} x={x + 50 + i * 72} y={y + 118} s={0.95} dashed={converted} accent={converted} />
                ))}
                <Charger x={x + 345} y={y + 172} />
                <Charger x={x + 395} y={y + 172} />
              </g>
            )
          })}
          <Lines x={235} y={445} lines={[`${rec.aircraft} aircraft, ${rec.addedAircraft} new (dashed)`, 'no queue at the chargers']} size={S} weight={600} />
          <Shape x={470} y={425} w={420} h={104} tone="warn" />
          <Lines x={680} y={477} lines={['Conditions: grid connection', 'confirmed; chargers to the', 'signed-configuration spec']} size={S} weight={600} />
        </g>
      )}
    </Svg>
  )
}

export function BiasFigure({ alt }: { alt: string }) {
  const bubble = (cx: number, lines: string[], accent: boolean) => (
    <g>
      <ellipse cx={cx} cy={120} rx={205} ry={100} className={accent ? undefined : 'f-shape'} style={accent ? { fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2.5 } : { strokeWidth: 2 }} />
      <circle cx={cx - 20} cy={240} r={14} className="f-shape" />
      <circle cx={cx - 34} cy={270} r={8} className="f-shape" />
      <Lines x={cx} y={120} lines={lines} size={S} weight={700} ink={accent ? 'accent' : 'ink'} />
    </g>
  )
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {() => (
        <g>
          {bubble(220, ['Which option', 'wins?'], false)}
          {bubble(680, ['What would the ideal', 'look like, and can we', 'design closer to it?'], true)}
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              {[0, 1, 2, 3, 4].map((c) => (
                <rect key={c} x={250 + c * 80} y={300 + r * 34} width={80} height={34} className={r === 0 ? 'f-panel' : 'f-shape'} />
              ))}
            </g>
          ))}
          <Lines x={450} y={470} lines={['Confirmation bias · independent review · premortem']} size={S} weight={600} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function FeedsForwardFigure({ alt }: { alt: string }) {
  const pos = [
    { x: 10, y: 20 },
    { x: 10, y: 250 },
    { x: 610, y: 20 },
    { x: 610, y: 250 },
    { x: 310, y: 398 },
  ]
  const art = (s: string) => wrap(s.split(/[;(]/)[0].trim(), 21).slice(0, 3)
  const ARROWS = ['M 330 205 L 294 150', 'M 330 250 L 294 300', 'M 570 205 L 606 150', 'M 570 250 L 606 300', 'M 450 282 L 450 396']
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          <Card x={330} y={170} w={240} h={110} title="Week 3" lines={['decision record', 'and register']} size={S} tone="soft" strong />
          {FEEDS_FORWARD.map((f, i) => {
            const p = pos[i]
            const w = 280
            const h = 140
            const cx = p.x + w / 2
            return (
              <g key={f.week + i}>
                <Arrow d={ARROWS[i]} id={id} tone="accent" width={2.6} />
                <Shape x={p.x} y={p.y} w={w} h={h} tone="box" />
                <Lines x={cx} y={p.y + 24} lines={[f.week]} size={S} weight={700} ink="accent" />
                <Lines x={cx} y={p.y + 86} lines={art(f.artifact)} size={S} />
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ lab launch
export function LabChecklistFigure({ alt }: { alt: string }) {
  const sections: { t: string; items: string[] }[] = [
    { t: 'Readiness', items: [`${MIN.technologies} technologies`, 'TRL: evidence or assumption', 'critical < TRL 6: maturity risk'] },
    { t: 'Register', items: [`${MIN.risks} risks: ≥ ${MIN.securityRisks} security, ≥ ${MIN.resilienceRisks} resilience`, `${MIN.opportunities} opportunity`, 'TBDs linked; issues apart'] },
    { t: 'TPMs', items: [`${MIN.tpms} TPMs`, 'contingency and margin', 'planned profile'] },
    { t: 'Trade study', items: [`${MIN.alternatives} alternatives, baseline in`, `${MIN.criteria} criteria traced to MOEs`, 'reversal point; conditions'] },
  ]
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          {sections.map((s, i) => {
            const x = 10 + (i % 2) * 445
            const y = 10 + Math.floor(i / 2) * 265
            return (
              <g key={s.t}>
                <Shape x={x} y={y} w={435} h={255} tone={i % 3 === 0 ? 'soft' : 'box'} />
                <Lines x={x + 18} y={y + 30} lines={[s.t]} size={L} weight={700} anchor="start" />
                {s.items.map((it, k) => (
                  <g key={k}>
                    <CheckBox x={x + 18} y={y + 70 + k * 58} size={28} />
                    <Lines x={x + 58} y={y + 84 + k * 58} lines={[it]} size={S} anchor="start" />
                  </g>
                ))}
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

export function CheckpointCardFigure({ alt }: { alt: string }) {
  const wrapped = CHECKPOINT_CRITERIA.map((c) => wrap(c.charAt(0).toUpperCase() + c.slice(1), 56))
  const tops = wrapped.map((_, i) => 30 + wrapped.slice(0, i).reduce((a, l) => a + l.length * S * 1.22 + 46, 0))
  return (
    <Svg w={FB_W} h={380} alt={alt}>
      {() => (
        <g>
          <Shape x={10} y={10} w={880} h={360} tone="panel" />
          {CHECKPOINT_CRITERIA.map((c, i) => {
            const lines = wrapped[i]
            const top = tops[i]
            return (
              <g key={c}>
                <CheckBox x={36} y={top + 6} size={34} ticked={false} />
                <Lines x={90} y={top + 22 + ((lines.length - 1) * S * 1.22) / 2} lines={lines} size={S} anchor="start" />
              </g>
            )
          })}
          {['Approve', 'Approve with conditions', 'Revise with a reason'].map((t, i) => (
            <Chip key={t} cx={[120, 420, 735][i]} cy={318} text={t} size={S} tone={i === 0 ? 'ok' : i === 1 ? 'soft' : 'warn'} />
          ))}
        </g>
      )}
    </Svg>
  )
}

export function SevenDaysW3Figure({ alt }: { alt: string }) {
  const rows = [
    ['Days 1–2', 'Readiness: one technology per member'],
    ['Days 2–3', 'Risk workshop: two risks each, security and resilience'],
    ['Day 3', 'Register links and TPMs'],
    ['Day 4', 'Criteria, value functions and weights'],
    ['Day 5', 'Scores, computation and sensitivity'],
    ['Day 6', 'Recommendation, derived requirements, AI statement'],
    ['Day 7', 'Integration review and upload'],
  ]
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          <line x1={150} y1={20} x2={150} y2={520} style={{ stroke: 'var(--wb-line-strong)', strokeWidth: 3 }} />
          {rows.map(([d, t], i) => {
            const y = 36 + i * 72
            return (
              <g key={d}>
                <circle cx={150} cy={y} r={11} style={{ fill: i >= 3 && i <= 5 ? 'var(--wb-accent)' : 'var(--wb-panel)', stroke: 'var(--wb-accent)', strokeWidth: 3 }} />
                <Lines x={130} y={y} lines={[d]} size={S} weight={700} anchor="end" />
                <Lines x={175} y={y} lines={wrap(t, fit(710, S))} size={S} anchor="start" />
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

export const WEEK3_S2_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w3s2-decision-ring': { title: 'The decision-analysis steps', C: DecisionRingFigure },
  'w3s2-objectives-hierarchy': { title: 'AeroLink objectives hierarchy', C: ObjectivesHierarchyFigure },
  'w3s2-value-functions': { title: 'Two value functions', C: ValueFunctionsFigure },
  'w3s2-swing-weights': { title: 'Swing weights', C: SwingWeightsFigure },
  'w3s2-morph-box': { title: 'A morphological box for AeroLink capacity', C: MorphBoxFigure },
  'w3s2-capacity-chart': { title: 'Fleet limit and charger limit', C: CapacityChartFigure },
  'w3s2-value-components': { title: 'Value component chart', C: ValueComponentsFigure },
  'w3s2-line-diagram': { title: 'Sensitivity to the cost weight', C: LineDiagramFigure },
  'w3s2-normalization-trap': { title: 'Min–max scaling reverses ranks', C: NormalizationTrapFigure },
  'w3s2-decision-record': { title: 'The decision record', C: DecisionRecordFigure },
  'w3s2-answer': { title: 'Answering the driving question', C: AnswerW3Figure },
  'w3s2-bias': { title: 'Which option wins, or what is ideal?', C: BiasFigure },
  'w3s2-feeds-forward': { title: 'What the Week 3 artifacts feed', C: FeedsForwardFigure },
  'w3s2-lab-checklist': { title: 'Lab L3 at a glance', C: LabChecklistFigure },
  'w3s2-checkpoint-card': { title: 'The framing checkpoint', C: CheckpointCardFigure },
  'w3s2-seven-days': { title: 'The next seven days', C: SevenDaysW3Figure },
}
