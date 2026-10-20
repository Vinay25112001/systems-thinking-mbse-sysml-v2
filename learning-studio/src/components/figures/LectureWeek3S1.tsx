// Week 3, Session 1 lecture figures (technology readiness, the risk register with security and resilience risks, TPMs).
// Original drawings: none redraws a SEBoK, MITRE or DoD figure (the reporting-matrix cell levels are drawn from the
// course's cellLevel(), which follows DoD Figure 4-9, R46 p.126). Every number, name and identifier is imported from
// src/content/lectures/week03/aerolinkCase.ts and labBrief.ts (and, read-only, the Week 2 case for measure names); every
// other label is a phrase from the slide or lesson text. AeroLink is FICTIONAL; a figure adds no claim of its own.
// Canvas sizes and the 12 pt label rule: LectureWeek3Parts.tsx. Review status: new-pending-review.
import type { ComponentType } from 'react'
import { ALL_ASSUMPTIONS, CHAIN, ISSUES, MONTH6, OPPORTUNITIES, ORDINAL_DEMO, RISKS, TECHNOLOGIES, TRADE_RULES, UNKNOWNS, lowestCritical, marginOf, plannedProfile, risk, technology, tpm, wceOf } from '../../content/lectures/week03/aerolinkCase'
import { cellLevel, TRL_SCALE, type CellLevel } from '../../content/lectures/week03/labBrief'
import { MOES, MOPS } from '../../content/lectures/week02/aerolinkCase'
import { Arrow, Card, Charger, Chip, Craft, FB_W, FW_H, FW_W, Lines, MIN_FB, MIN_FW, Shape, Svg, f1, f2, fit, wrap, type Tone } from './LectureWeek3Parts'

const S = MIN_FB // 22: smallest label on figure-bullets canvases
const SW = MIN_FW // 20: smallest label on full-width canvases
const L = S + 2 // titles
const LEVEL_TONE: Record<CellLevel, Tone> = { Low: 'ok', Moderate: 'warn', High: 'bad' }
const range = (ids: string[]) => `${ids[0]} to ${ids[ids.length - 1]}`

// ------------------------------------------------------------------------------------------------ framing
export function DrivingQuestionW3Figure({ alt }: { alt: string }) {
  const H = 520
  return (
    <Svg w={FB_W} h={H} alt={alt}>
      {(id) => (
        <g>
          <Shape x={20} y={14} w={860} h={46} tone="panel" />
          <Lines x={450} y={37} lines={[`Year-2 demand ${TRADE_RULES.demand} trips/day`]} size={L} weight={700} />
          <Lines x={230} y={92} lines={['12 aircraft today']} size={S} weight={700} />
          {Array.from({ length: 18 }, (_, i) => (
            <Craft key={i} x={60 + (i % 6) * 68} y={145 + Math.floor(i / 6) * 74} s={0.95} dashed={i >= 12} />
          ))}
          <Lines x={230} y={355} lines={['+6 proposed (dashed)']} size={S} weight={700} ink="accent" />
          <Arrow d="M 445 260 L 520 260" id={id} />
          <Shape x={530} y={110} w={350} h={300} tone="env" />
          <Lines x={705} y={136} lines={['Hub: 2 chargers']} size={S} weight={700} />
          {[0, 1, 2, 3].map((i) => (
            <Craft key={i} x={560 + i * 56} y={350} s={0.8} />
          ))}
          <Charger x={800} y={395} />
          <Charger x={850} y={395} />
          <Lines x={640} y={395} lines={['queue']} size={S} ink="muted" />
          <text x={660} y={250} textAnchor="middle" dominantBaseline="central" fontSize={110} fontWeight={700} className="f-accent-ink">
            ?
          </text>
          <Lines x={450} y={470} lines={['More aircraft: shorter waits, or a longer queue?']} size={S} weight={600} />
        </g>
      )}
    </Svg>
  )
}

export function ThreeProcessesFigure({ alt }: { alt: string }) {
  const r = 150
  const t1 = technology('TECH-001')
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          <circle cx={300} cy={215} r={r} className="f-shape" style={{ fillOpacity: 0.6 }} />
          <circle cx={600} cy={215} r={r} className="f-shape" style={{ fillOpacity: 0.6 }} />
          <circle cx={450} cy={360} r={r + 10} className="f-shape" style={{ fillOpacity: 0.6 }} />
          <Lines x={225} y={170} lines={['Technical', 'assessment']} size={S} weight={700} />
          <Lines x={225} y={245} lines={[`Charging`, `at TRL ${t1.trl}`]} size={S} ink="muted" />
          <Lines x={675} y={170} lines={['Risk', 'management']} size={S} weight={700} />
          <Lines x={668} y={250} lines={wrap(risk('R-001').name, 13)} size={S} ink="muted" />
          <Lines x={450} y={420} lines={['Decision management']} size={S} weight={700} />
          <Lines x={450} y={472} lines={['Year-2 capacity', 'decision']} size={S} ink="muted" />
          <Lines x={450} y={275} lines={['uncertainty']} size={L} weight={700} ink="accent" />
          <Arrow d="M 330 60 Q 450 10 570 60" id={id} tone="accent" />
          <Lines x={450} y={22} lines={['measures feed risk analysis']} size={S} weight={600} ink="accent" />
          <Arrow d="M 605 440 Q 700 470 680 372" id={id} tone="accent" />
          <Lines x={770} y={480} lines={['decisions select', 'and treat risks']} size={S} weight={600} ink="accent" />
        </g>
      )}
    </Svg>
  )
}

export function FiveKindsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB_W} h={500} alt={alt}>
      {() => (
        <g>
          <Shape x={20} y={20} w={860} h={200} tone="panel" />
          <Lines x={40} y={48} lines={['Knowledge']} size={L} weight={700} anchor="start" />
          <Card x={60} y={78} w={370} h={124} title="Assumption" lines={['taken as true;', 'to be validated']} size={S} />
          <Card x={470} y={78} w={390} h={124} title="Unknown" lines={['not yet available;', 'TBD or TBR in a requirement']} size={S} />
          <Lines x={40} y={262} lines={['Events']} size={L} weight={700} anchor="start" />
          <Shape x={90} y={290} w={360} h={70} tone="warn" />
          <Lines x={270} y={325} lines={['Risk (negative)']} size={S} weight={700} />
          <Shape x={470} y={290} w={330} h={70} tone="ok" />
          <Lines x={635} y={325} lines={['Opportunity (positive)']} size={S} weight={700} />
          <line x1={70} y1={395} x2={820} y2={395} className="f-axis" style={{ strokeWidth: 3 }} />
          <line x1={70} y1={380} x2={70} y2={410} className="f-axis" style={{ strokeWidth: 3 }} />
          <line x1={820} y1={370} x2={820} y2={420} style={{ stroke: 'var(--wb-bad)', strokeWidth: 5 }} />
          <Lines x={70} y={432} lines={['0']} size={S} weight={700} />
          <Lines x={820} y={432} lines={['1']} size={S} weight={700} />
          <Lines x={445} y={432} lines={['probability, strictly between 0 and 1']} size={S} ink="muted" />
          <Lines x={820} y={474} lines={['Issue: has occurred or is certain']} size={S} weight={700} anchor="end" ink="bad" />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ readiness
const GROUPS: { from: number; to: number; label: string[]; hi: boolean }[] = [
  { from: 1, to: 2, label: ['concept'], hi: false },
  { from: 3, to: 4, label: ['laboratory'], hi: true },
  { from: 5, to: 6, label: ['relevant', 'environment'], hi: true },
  { from: 7, to: 9, label: ['operational'], hi: true },
]
export function TraStaircaseFigure({ alt }: { alt: string }) {
  const x0 = 30
  const sw = 92
  const base = 440
  const sh = 36
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          {TRL_SCALE.map((t, i) => {
            const top = base - sh * (i + 1)
            const env = GROUPS.find((g) => t.level >= g.from && t.level <= g.to)!
            return (
              <g key={t.level}>
                <Shape x={x0 + i * sw} y={top} w={sw - 4} h={base - top} tone={env.hi ? 'soft' : 'box'} rx={4} />
                <Lines x={x0 + i * sw + (sw - 4) / 2} y={top + 24} lines={[String(t.level)]} size={L} weight={700} />
              </g>
            )
          })}
          {GROUPS.map((g) => {
            const a = x0 + (g.from - 1) * sw
            const b = x0 + g.to * sw - 4
            return (
              <g key={g.from}>
                <path d={`M ${a} ${base + 12} L ${a} ${base + 22} L ${b} ${base + 22} L ${b} ${base + 12}`} fill="none" style={{ stroke: g.hi ? 'var(--wb-accent)' : 'var(--wb-muted)', strokeWidth: 2.4 }} />
                <Lines x={(a + b) / 2} y={base + 40 + (g.label.length - 1) * 13} lines={g.label} size={S} weight={700} ink={g.hi ? 'accent' : 'muted'} />
              </g>
            )
          })}
          <Lines x={870} y={56} lines={['TRL 9: proven in', 'mission operations']} size={S} weight={600} anchor="end" />
          <Lines x={40} y={60} lines={['Technology readiness levels 1–9']} size={L} weight={700} anchor="start" />
        </g>
      )}
    </Svg>
  )
}

export function TrlLimitsFigure({ alt }: { alt: string }) {
  const steps = TRL_SCALE.filter((t) => t.level >= 4 && t.level <= 7)
  const x0 = 10
  const sw = 158
  const base = 455
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          <Shape x={10} y={10} w={600} h={78} tone="dash" />
          <Lines x={310} y={49} lines={['Does it integrate with the rest of the system?', 'Integration and system readiness']} size={S} weight={600} />
          {steps.map((t, i) => {
            const top = 280 - i * 55
            return (
              <g key={t.level}>
                <Shape x={x0 + i * sw} y={top} w={sw - 6} h={base - top} tone={t.environment === 'relevant' ? 'soft' : 'box'} rx={4} />
                <Lines x={x0 + i * sw + (sw - 6) / 2} y={top + 24} lines={[`TRL ${t.level}`]} size={S} weight={700} />
                <Lines x={x0 + i * sw + (sw - 6) / 2} y={top + 50 + ((wrap(t.text.replace(/\.$/, ''), 11).length - 1) * S * 1.22) / 2} lines={wrap(t.text.replace(/\.$/, ''), 11)} size={S} />
              </g>
            )
          })}
          <Shape x={652} y={140} w={238} h={250} tone="dash" />
          <Lines x={771} y={265} lines={['Can it be', 'produced', 'affordably?', '', 'Manufacturing', 'readiness level']} size={S} weight={600} />
          <Arrow d="M 637 265 L 650 265" id={id} tone="muted" />
          <Shape x={10} y={474} w={880} h={56} tone="warn" />
          <Lines x={450} y={502} lines={['Off-the-shelf item used beyond its design limits: the TRL changes']} size={S} weight={700} />
        </g>
      )}
    </Svg>
  )
}

export function MaturityCurveFigure({ alt }: { alt: string }) {
  // logistic s-curve with a declining tail (aging)
  const px = (t: number) => 90 + t * 760
  const s = (t: number) => (t < 0.85 ? 1 / (1 + Math.exp(-12 * (t - 0.42))) : 1 / (1 + Math.exp(-12 * (0.85 - 0.42))) - (t - 0.85) * 1.6)
  const py = (v: number) => 470 - v * 250
  const pts = Array.from({ length: 61 }, (_, i) => i / 60).map((t) => `${px(t).toFixed(1)},${py(s(t)).toFixed(1)}`).join(' ')
  const hype = Array.from({ length: 41 }, (_, i) => i / 40).map((t) => {
    const tt = t * 0.5
    const v = 0.15 + 0.85 * Math.exp(-((tt - 0.14) ** 2) / 0.004) + tt * 0.4
    return `${px(tt).toFixed(1)},${py(Math.min(v, 1.2)).toFixed(1)}`
  }).join(' ')
  const cuts = [0, 0.3, 0.55, 0.85, 1]
  const names = ['new', 'improving', 'mature', 'aging']
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          <line x1={90} y1={480} x2={860} y2={480} className="f-axis" style={{ strokeWidth: 2 }} />
          <line x1={90} y1={480} x2={90} y2={150} className="f-axis" style={{ strokeWidth: 2 }} />
          <Lines x={860} y={455} lines={['time →']} size={S} anchor="end" ink="muted" />
          <Lines x={100} y={140} lines={['performance']} size={S} anchor="start" ink="muted" />
          {cuts.slice(1, -1).map((c) => (
            <line key={c} x1={px(c)} y1={200} x2={px(c)} y2={480} className="f-divider" style={{ strokeWidth: 1.6 }} />
          ))}
          {names.map((n, i) => (
            <Lines key={n} x={(px(cuts[i]) + px(cuts[i + 1])) / 2} y={510} lines={[n]} size={S} weight={700} />
          ))}
          <polyline points={hype} fill="none" style={{ stroke: 'var(--wb-warn)', strokeWidth: 3 }} strokeDasharray="9 6" />
          <Lines x={px(0.14)} y={py(1.08) - 10} lines={['hype']} size={S} weight={700} ink="warn" />
          <polyline points={pts} fill="none" style={{ stroke: 'var(--wb-fg)', strokeWidth: 3.5 }} />
          <Arrow d={`M ${px(0.62)} ${py(0.4)} L ${px(0.45)} ${py(0.6)}`} id={id} tone="accent" />
          <Lines x={px(0.64)} y={py(0.35)} lines={['TRL measures', 'this slope']} size={S} weight={700} anchor="start" ink="accent" />
          <Shape x={300} y={14} w={580} h={92} tone="panel" />
          <Lines x={590} y={60} lines={['“Relevant environment” must be agreed by', 'users, program office and developer']} size={S} />
        </g>
      )}
    </Svg>
  )
}

export function EvidenceCardsFigure({ alt }: { alt: string }) {
  const t1 = technology('TECH-001')
  const cards: { title: string; lines: string[]; struck?: boolean; tag: string }[] = [
    { title: `TRL ${t1.trl}`, tag: 'Evidence', lines: ['Test report,', 'cited'] },
    { title: `TRL ${t1.trl}`, tag: 'Assumption', lines: ['Owner named;', 'validate by the', 'supplier test report'] },
    { title: `TRL ${t1.trl}`, tag: 'No basis', lines: ['A number with', 'nothing behind it'], struck: true },
  ]
  return (
    <Svg w={FB_W} h={500} alt={alt}>
      {() => (
        <g>
          <Lines x={450} y={30} lines={[`Same technology: ${t1.name}`]} size={L} weight={700} />
          {cards.map((c, i) => {
            const x = 20 + i * 293
            return (
              <g key={i}>
                <Shape x={x} y={70} w={273} h={380} tone={c.struck ? 'bad' : i === 1 ? 'soft' : 'box'} />
                <Lines x={x + 136} y={115} lines={[c.title]} size={34} weight={700} />
                <Chip cx={x + 136} cy={175} text={c.tag} size={S} tone={c.struck ? 'warn' : 'panel'} />
                {i === 0 && (
                  <g>
                    <path d={`M ${x + 106} 215 L ${x + 156} 215 L ${x + 170} 229 L ${x + 170} 290 L ${x + 106} 290 Z`} className="f-shape" style={{ strokeWidth: 2 }} />
                    {[235, 250, 265].map((yy) => (
                      <line key={yy} x1={x + 116} y1={yy} x2={x + 158} y2={yy} className="f-divider" style={{ strokeWidth: 2, strokeDasharray: 'none' }} />
                    ))}
                  </g>
                )}
                <Lines x={x + 136} y={i === 0 ? 350 : 290} lines={c.lines} size={S} />
                {c.struck && (
                  <g>
                    <line x1={x + 10} y1={80} x2={x + 263} y2={440} style={{ stroke: 'var(--wb-bad)', strokeWidth: 5 }} />
                    <line x1={x + 263} y1={80} x2={x + 10} y2={440} style={{ stroke: 'var(--wb-bad)', strokeWidth: 5 }} />
                  </g>
                )}
              </g>
            )
          })}
          <Lines x={313} y={478} lines={['acceptable']} size={S} weight={700} ink="accent" />
          <Lines x={753} y={478} lines={['graded as missing']} size={S} weight={700} ink="bad" />
        </g>
      )}
    </Svg>
  )
}

export function WorkedTrlFigure({ alt }: { alt: string }) {
  const low = lowestCritical()
  const cols = [
    { x: 10, w: 360, h: 'Technology' },
    { x: 370, w: 90, h: 'TRL' },
    { x: 460, w: 140, h: 'Basis' },
    { x: 600, w: 170, h: 'Critical' },
    { x: 770, w: 220, h: 'Maturity risk' },
  ]
  const rh = 72
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {(id) => (
        <g>
          {cols.map((c) => (
            <g key={c.h}>
              <Shape x={c.x} y={8} w={c.w - 4} h={44} tone="panel" rx={4} />
              <Lines x={c.x + (c.w - 4) / 2} y={30} lines={[c.h]} size={SW} weight={700} />
            </g>
          ))}
          {TECHNOLOGIES.map((t, r) => {
            const y = 58 + r * rh
            const cells = [wrap(t.name, 30), [String(t.trl)], [t.basis.ref], [t.critical ? 'yes' : 'no (piloted)'], [`${t.maturityRisk}${t.critical ? '' : ' accepted'}`]]
            const isLow = t.id === low.id
            return (
              <g key={t.id}>
                {cells.map((cl, i) => (
                  <g key={i}>
                    <Shape x={cols[i].x} y={y} w={cols[i].w - 4} h={rh - 6} tone={isLow ? 'soft' : 'box'} rx={4} />
                    <Lines x={i === 0 ? cols[i].x + 12 : cols[i].x + (cols[i].w - 4) / 2} y={y + (rh - 6) / 2} lines={cl} size={SW} weight={i === 1 ? 700 : 500} anchor={i === 0 ? 'start' : 'middle'} />
                  </g>
                ))}
                {isLow && <rect x={6} y={y - 4} width={988} height={rh + 2} rx={6} fill="none" style={{ stroke: 'var(--wb-accent)', strokeWidth: 4 }} />}
              </g>
            )
          })}
          <Arrow d={`M 458 ${FW_H - 26} L 458 ${58 + 2 * rh + 2}`} id={id} tone="accent" />
          <Lines x={490} y={FW_H - 20} lines={[`Lowest critical TRL: ${low.name}, TRL ${low.trl}`]} size={SW} weight={700} anchor="start" ink="accent" />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ risk
export function RiskLoopFigure({ alt }: { alt: string }) {
  const boxes = [
    { x: 330, y: 14, t: 'Planning', l: ['What is our process?', '→ L and C criteria'] },
    { x: 640, y: 160, t: 'Identification', l: ['What can go wrong?', '→ if–then statements'] },
    { x: 520, y: 390, t: 'Analysis', l: ['How likely, how severe?', '→ ratings, register'] },
    { x: 130, y: 390, t: 'Mitigation', l: ['Accept, avoid,', 'transfer or control?', '→ plans, burn-down'] },
    { x: 10, y: 160, t: 'Monitoring', l: ['How has it changed?', '→ updates, closures'] },
  ]
  const W = 250
  const Hb = 132
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          {boxes.map((b, i) => (
            <Card key={b.t} x={b.x} y={b.y} w={W} h={Hb} title={b.t} lines={b.l} size={S} tone={i === 0 ? 'panel' : 'box'} />
          ))}
          <Arrow d="M 580 80 Q 730 90 765 155" id={id} />
          <Arrow d="M 765 296 Q 760 360 700 386" id={id} />
          <Arrow d="M 518 456 L 384 456" id={id} />
          <Arrow d="M 200 386 Q 140 360 135 296" id={id} />
          <Arrow d="M 262 226 L 636 226" id={id} tone="accent" dashed />
          <Lines x={450} y={205} lines={['continuous: back to identification']} size={S} weight={600} ink="accent" />
        </g>
      )}
    </Svg>
  )
}

export function RiskAnatomyFigure({ alt }: { alt: string }) {
  const r = risk('R-002')
  const n = fit(700, S)
  const parts: { label: string; text: string; tone: Tone }[] = [
    { label: 'Condition', text: r.condition, tone: 'panel' },
    { label: 'If', text: r.ifEvent, tone: 'warn' },
    { label: 'Then', text: r.then, tone: 'bad' },
  ]
  const laid = parts.map((p) => ({ ...p, lines: wrap(p.text, n), h: wrap(p.text, n).length * S * 1.22 + 26 }))
  const tops = laid.map((_, i) => 14 + laid.slice(0, i).reduce((a, q) => a + q.h + 12, 0))
  const y = 14 + laid.reduce((a, q) => a + q.h + 12, 0)
  return (
    <Svg w={FB_W} h={y + 120} alt={alt}>
      {() => (
        <g>
          {laid.map((p, i) => {
            const { lines, h } = p
            const top = tops[i]
            return (
              <g key={p.label}>
                <Shape x={10} y={top} w={880} h={h} tone={p.tone} />
                <Lines x={26} y={top + h / 2} lines={[p.label]} size={L} weight={700} anchor="start" />
                <Lines x={170} y={top + h / 2} lines={lines} size={S} anchor="start" />
              </g>
            )
          })}
          <Shape x={10} y={y + 6} w={880} h={100} tone="dash" />
          <Lines x={170} y={y + 36} lines={['so we will sample-test packs']} size={S} anchor="start" strike ink="muted" />
          <line x1={165} y1={y + 36} x2={480} y2={y + 36} style={{ stroke: 'var(--wb-bad)', strokeWidth: 3 }} />
          <Lines x={26} y={y + 36} lines={['Not here']} size={S} weight={700} anchor="start" ink="bad" />
          <Lines x={170} y={y + 76} lines={['mitigation does not belong in the statement']} size={S} weight={700} anchor="start" ink="bad" />
        </g>
      )}
    </Svg>
  )
}

export function RiskMatrixFigure({ alt }: { alt: string }) {
  const x0 = 70
  const y0 = 16
  const cw = 120
  const ch = 90
  const at = (l: number, c: number) => RISKS.filter((r) => r.likelihood === l && r.consequence === c).map((r) => r.id)
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          {[5, 4, 3, 2, 1].map((l, row) =>
            [1, 2, 3, 4, 5].map((c) => {
              const x = x0 + (c - 1) * cw
              const y = y0 + row * ch
              const ids = at(l, c)
              return (
                <g key={`${l}${c}`}>
                  <Shape x={x} y={y} w={cw} h={ch} tone={LEVEL_TONE[cellLevel(l, c)]} rx={0} />
                  {ids.map((idd, k) => {
                    const two = ids.length > 2
                    const cx = two ? x + (k % 2 === 0 ? 31 : 89) : x + cw / 2
                    const rows = two ? Math.ceil(ids.length / 2) : ids.length
                    const ri = two ? Math.floor(k / 2) : k
                    const cy = y + ch / 2 + (ri - (rows - 1) / 2) * 26
                    return (
                      <text key={idd} x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={two ? S : S} fontWeight={700} className="f-label">
                        {two ? idd.replace('R-0', '') : idd}
                      </text>
                    )
                  })}
                </g>
              )
            }),
          )}
          {[5, 4, 3, 2, 1].map((l, row) => (
            <Lines key={l} x={x0 - 18} y={y0 + row * ch + ch / 2} lines={[String(l)]} size={S} weight={700} />
          ))}
          {[1, 2, 3, 4, 5].map((c) => (
            <Lines key={c} x={x0 + (c - 1) * cw + cw / 2} y={y0 + 5 * ch + 22} lines={[String(c)]} size={S} weight={700} />
          ))}
          <text x={18} y={y0 + 2.5 * ch} transform={`rotate(-90 18 ${y0 + 2.5 * ch})`} textAnchor="middle" dominantBaseline="central" fontSize={S} fontWeight={700} className="f-label">
            Likelihood →
          </text>
          <Lines x={x0 + 2.5 * cw} y={y0 + 5 * ch + 54} lines={['Consequence →']} size={S} weight={700} />
          <Lines x={790} y={60} lines={['2 × 5 or 3 × 4:', 'which is worse?']} size={S} weight={700} ink="accent" />
          <Lines x={790} y={160} lines={['Crowded cells:', '03 = R-003']} size={S} ink="muted" />
          {(['Low', 'Moderate', 'High'] as CellLevel[]).map((lv, i) => (
            <g key={lv}>
              <Shape x={702} y={250 + i * 52} w={34} h={34} tone={LEVEL_TONE[lv]} rx={3} />
              <Lines x={748} y={267 + i * 52} lines={[lv]} size={S} anchor="start" />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export function OrdinalTrapFigure({ alt }: { alt: string }) {
  const [a, b] = ORDINAL_DEMO.sameProduct
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {() => (
        <g>
          <Lines x={235} y={22} lines={['Same product, different cells']} size={SW} weight={700} />
          {[a, b].map((x, i) => (
            <g key={i}>
              <Shape x={20 + i * 230} y={52} w={210} h={180} tone={LEVEL_TONE[x.level]} />
              <Lines x={125 + i * 230} y={100} lines={[`${x.l} × ${x.c}`]} size={34} weight={700} />
              <Lines x={125 + i * 230} y={155} lines={[`product ${x.product}`]} size={SW} />
              <Lines x={125 + i * 230} y={200} lines={[x.level]} size={SW} weight={700} />
            </g>
          ))}
          <Lines x={235} y={275} lines={['The product hides the', 'asymmetry the matrix keeps']} size={SW} ink="muted" />
          <line x1={480} y1={14} x2={480} y2={326} className="f-divider" style={{ strokeWidth: 2 }} />
          <Card x={500} y={14} w={235} h={110} title="Fade 3 × 4" lines={[`= ${ORDINAL_DEMO.r002.product} · ${ORDINAL_DEMO.r002.level}`]} size={SW} tone={LEVEL_TONE[ORDINAL_DEMO.r002.level]} />
          <Card x={755} y={14} w={235} h={110} title="Runaway 2 × 5" lines={[`= ${ORDINAL_DEMO.r008.product} · ${ORDINAL_DEMO.r008.level}`]} size={SW} tone={LEVEL_TONE[ORDINAL_DEMO.r008.level]} />
          <Shape x={500} y={146} w={490} h={74} tone="panel" />
          <Lines x={520} y={183} lines={['Product: fade first, runaway second']} size={SW} anchor="start" ink="muted" strike />
          <Shape x={500} y={236} w={490} h={92} tone="soft" strong />
          <Lines x={520} y={282} lines={['Course rule: same level, so higher', 'consequence first: runaway, then fade']} size={SW} weight={700} anchor="start" />
        </g>
      )}
    </Svg>
  )
}

export function HandlingDoorsFigure({ alt }: { alt: string }) {
  const doors = [
    { t: 'Avoid', l: 'Commit a hub site only where the utility confirms capacity', r: '(grid connection)' },
    { t: 'Control', l: 'Cell-temperature monitoring stops charging', r: '(thermal runaway)' },
    { t: 'Transfer', l: 'A performance guarantee in the purchase contract', r: '(weather limits)' },
    { t: 'Accept', l: 'The piloted baseline does not depend on detect-and-avoid', r: '(autonomy)' },
  ]
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          {doors.map((d, i) => {
            const x = 14 + i * 222
            return (
              <g key={d.t}>
                <rect x={x + 20} y={20} width={170} height={180} rx={6} className="f-shape" style={{ strokeWidth: 2.4 }} />
                <circle cx={x + 170} cy={115} r={7} style={{ fill: 'var(--wb-fg)' }} />
                <Lines x={x + 105} y={70} lines={[d.t]} size={L + 2} weight={700} ink="accent" />
                <Lines x={x + 105} y={300} lines={wrap(d.l, 16)} size={S} />
                <Lines x={x + 105} y={405} lines={[d.r]} size={S} ink="muted" />
              </g>
            )
          })}
          <Shape x={444} y={440} w={240} h={86} tone="warn" />
          <Lines x={564} y={483} lines={['consequence for', 'passengers unchanged']} size={S} weight={700} />
        </g>
      )}
    </Svg>
  )
}

export function SecurityResilienceFigure({ alt }: { alt: string }) {
  const sec = ['R-009', 'R-010', 'R-011'].map(risk)
  const yReq = 110
  const yLow = 270
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          <rect x={110} y={50} width={220} height={260} className="f-panel" />
          <rect x={330} y={50} width={230} height={260} style={{ fill: 'var(--wb-warn-soft)', opacity: 0.7 }} />
          <rect x={560} y={50} width={150} height={260} style={{ fill: 'var(--wb-ok-soft)', opacity: 0.8 }} />
          <Lines x={220} y={72} lines={['Avoid']} size={S} weight={700} />
          <Lines x={445} y={72} lines={['Withstand']} size={S} weight={700} />
          <Lines x={635} y={72} lines={['Recover']} size={S} weight={700} />
          <line x1={60} y1={310} x2={880} y2={310} className="f-axis" style={{ strokeWidth: 2 }} />
          <line x1={60} y1={310} x2={60} y2={40} className="f-axis" style={{ strokeWidth: 2 }} />
          <path d={`M 60 ${yReq} L 330 ${yReq} L 370 ${yLow} L 560 ${yLow} L 700 ${yReq} L 880 ${yReq}`} fill="none" style={{ stroke: 'var(--wb-fg)', strokeWidth: 4 }} />
          <Lines x={70} y={yReq + 28} lines={['required capability']} size={S} anchor="start" weight={600} />
          <Arrow d="M 345 132 L 345 168" id={id} tone="warn" />
          <Lines x={445} y={150} lines={['adversity']} size={S} weight={700} ink="warn" />
          <Lines x={870} y={290} lines={['time →']} size={S} anchor="end" ink="muted" />
          {sec.map((r, i) => (
            <Card key={r.id} x={10 + i * 295} y={346} w={290} h={102} title={r.category === 'security' ? 'Security' : 'Resilience'} lines={wrap(r.name, 24)} size={S} weight={500} tone={r.category === 'security' ? 'warn' : 'ok'} />
          ))}
          <Lines x={450} y={476} lines={['Assets: system capability · data and information']} size={S} ink="muted" />
          <Lines x={450} y={510} lines={['infrastructure · people']} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function WorkedRiskFigure({ alt }: { alt: string }) {
  const a = risk('R-010')
  const b = risk('R-004')
  const card = (x: number, title: string, lines: string[], affects: string[]) => (
    <g>
      <Shape x={x} y={8} w={485} h={324} tone="box" />
      <Lines x={x + 16} y={34} lines={[title]} size={SW + 2} weight={700} anchor="start" />
      {lines.map((l, i) => (
        <Lines key={i} x={x + 16} y={72 + i * 34} lines={[l]} size={SW} anchor="start" weight={i === 3 ? 700 : 500} ink={i === 3 ? 'accent' : 'ink'} />
      ))}
      <Lines x={x + 16} y={72 + lines.length * 34 + 12} lines={wrap(`→ ${affects.join(', ')}`, 40)} size={SW} anchor="start" weight={600} lh={1.4} />
    </g>
  )
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {() => (
        <g>
          {card(8, 'Altered charger commands', ['Condition: networked, remotely configurable', 'If: commands or configuration altered', 'Then: power limit exceeded, or past cell limits', `Rated ${a.likelihood} × ${a.consequence} · ${cellLevel(a.likelihood, a.consequence)} · control`, 'Signed configurations; local interlock', 'Affects:'], a.affects)}
          {card(507, 'Weather limits lower than planned', ['Condition: limits unpublished (TBD-01)', 'If: approved limits lower than planned', 'Then: holds above 5 %; capacity short', `Rated ${b.likelihood} × ${b.consequence} · ${cellLevel(b.likelihood, b.consequence)} · transfer`, 'Contract guarantee; consequence unchanged', 'Affects:'], b.affects)}
        </g>
      )}
    </Svg>
  )
}

export function BurnDownFigure({ alt }: { alt: string }) {
  const x = (m: number) => 90 + (m / 18) * 470
  const y = (lv: number) => 360 - lv * 110 // 0 low … 2 high
  const plan = [[0, 1.0], [4, 1.0], [4, 0.75], [9, 0.75], [9, 0.45], [14, 0.45], [14, 0.1], [18, 0.1]]
  const actual = [[0, 1.0], [4, 0.98], [5, 0.78], [9, 0.75], [12, 0.75], [18, 0.74]]
  const pts = (a: number[][]) => a.map(([m, v]) => `${x(m)},${y(v)}`).join(' ')
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          <line x1={90} y1={380} x2={580} y2={380} className="f-axis" style={{ strokeWidth: 2 }} />
          <line x1={90} y1={380} x2={90} y2={60} className="f-axis" style={{ strokeWidth: 2 }} />
          {[['High', 2], ['Moderate', 1], ['Low', 0]].map(([n, v]) => (
            <g key={n}>
              <line x1={90} y1={y(v as number)} x2={580} y2={y(v as number)} className="f-grid" />
              <Lines x={80} y={y(v as number)} lines={[n as string]} size={S} anchor="end" ink="muted" />
            </g>
          ))}
          {[0, 6, 12, 18].map((m) => (
            <Lines key={m} x={x(m)} y={402} lines={[String(m)]} size={S} />
          ))}
          <Lines x={335} y={436} lines={['months']} size={S} ink="muted" />
          <polyline points={pts(plan)} fill="none" style={{ stroke: 'var(--wb-accent)', strokeWidth: 3.5 }} strokeDasharray="10 6" />
          <polyline points={pts(actual)} fill="none" style={{ stroke: 'var(--wb-fg)', strokeWidth: 4 }} />
          <Lines x={x(11.2)} y={y(0.45) + 26} lines={['planned']} size={S} weight={700} ink="accent" />
          <Lines x={x(15)} y={y(0.74) - 26} lines={['actual']} size={S} weight={700} />
          <Shape x={620} y={40} w={270} h={340} tone="panel" />
          {['Staffing', 'Budget', 'Test schedule'].map((n, i) => (
            <g key={n}>
              <circle cx={655} cy={88 + i * 60} r={16} style={{ fill: 'var(--wb-ok)' }} />
              <Lines x={684} y={88 + i * 60} lines={[n]} size={S} anchor="start" />
            </g>
          ))}
          <Lines x={755} y={300} lines={['Sea of green:', 'plan on track,', 'risk not falling']} size={S} weight={700} ink="bad" />
          <Shape x={20} y={460} w={870} h={66} tone="dash" />
          <line x1={40} y1={493} x2={140} y2={493} style={{ stroke: 'var(--wb-warn)', strokeWidth: 3 }} strokeDasharray="8 5" />
          <Lines x={155} y={493} lines={[`Trigger: ${risk('R-002').trigger}`]} size={S} weight={600} anchor="start" />
        </g>
      )}
    </Svg>
  )
}

export function RegisterNetworkFigure({ alt }: { alt: string }) {
  const left = [
    { t: 'Assumptions', s: range(ALL_ASSUMPTIONS.map((a) => a.id).sort()) },
    { t: 'Risks', s: range(RISKS.map((r) => r.id)) },
    { t: 'Opportunities', s: OPPORTUNITIES.map((o) => o.id).join(', ') },
    { t: 'Unknowns', s: range(UNKNOWNS.map((u) => u.id)) },
  ]
  const right = ['Requirements', 'Capabilities', 'Scenarios']
  const r1 = risk('R-001')
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          {left.map((b, i) => (
            <Card key={b.t} x={10} y={10 + i * 82} w={330} h={72} title={b.t} lines={[b.s]} size={S} tone={i === 1 ? 'soft' : 'box'} />
          ))}
          {right.map((t, i) => (
            <Card key={t} x={620} y={30 + i * 100} w={270} h={70} lines={[t]} size={S} weight={700} tone="panel" />
          ))}
          {left.map((_, i) =>
            right.map((__, j) => (i + j) % 2 === 0 || i === 1 ? <Arrow key={`${i}${j}`} d={`M 342 ${46 + i * 82} L 616 ${65 + j * 100}`} id={id} tone="muted" width={1.6} /> : null),
          )}
          <Lines x={480} y={22} lines={['affects']} size={S} weight={700} ink="accent" />
          <Shape x={10} y={350} w={880} h={110} tone="box" />
          <Lines x={26} y={405} lines={wrap(`${r1.id} → ${r1.affects.join(', ')}`, 70).concat(['U-001 → the TBD in REQ-STK-003'])} size={S} anchor="start" />
          <Shape x={10} y={474} w={880} h={56} tone="dash" />
          <Lines x={450} y={502} lines={[`Issue log, kept separate: ${ISSUES.map((i) => i.id).join(', ')}`]} size={S} weight={600} />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ TPMs
export function TpmPyramidFigure({ alt }: { alt: string }) {
  const t = tpm('TPM-001')
  const mop = MOPS.find((m) => m.id === t.derivesFrom)!
  const moe = MOES.find((m) => m.id === 'MOE-001')!
  const levels = [
    { y: 20, x: 190, w: 300, title: 'Measure of effectiveness', l: `${moe.name.split(' (')[0]} (${moe.id})`, tone: 'box' as Tone },
    { y: 175, x: 110, w: 460, title: 'Measure of performance', l: `${mop.name} (${mop.id})`, tone: 'box' as Tone },
    { y: 330, x: 20, w: 640, title: 'Technical performance measure', l: `${t.name} (${t.id})`, tone: 'soft' as Tone },
  ]
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {(id) => (
        <g>
          {levels.map((v) => (
            <g key={v.title}>
              <Card x={v.x} y={v.y} w={v.w} h={140} title={v.title} lines={wrap(v.l, fit(v.w - 20, S))} size={S} tone={v.tone} strong={v.tone === 'soft'} />
            </g>
          ))}
          <Lines x={340} y={496} lines={[`measures ${t.measures}`]} size={S} weight={700} ink="accent" />
          <Arrow d="M 680 400 L 880 400" id={id} tone="accent" width={3} />
          <Lines x={780} y={370} lines={['over time']} size={S} weight={700} ink="accent" />
          <Arrow d="M 340 168 L 340 176" id={id} tone="muted" />
          <Arrow d="M 340 323 L 340 331" id={id} tone="muted" />
        </g>
      )}
    </Svg>
  )
}

export function MarginBarFigure({ alt }: { alt: string }) {
  const t = tpm('TPM-001')
  const wce = wceOf(t)
  const y = (v: number) => 40 + ((t.threshold - v) / (t.threshold - t.objective)) * 270
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {() => (
        <g>
          <rect x={300} y={y(t.threshold)} width={110} height={y(wce) - y(t.threshold)} rx={3} className="f-shape" style={{ strokeWidth: 2.4 }} />
          <defs>
            <pattern id="w3-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" style={{ stroke: 'var(--wb-warn)', strokeWidth: 4 }} />
            </pattern>
          </defs>
          <rect x={300} y={y(wce)} width={110} height={y(t.cbe) - y(wce)} fill="url(#w3-hatch)" style={{ stroke: 'var(--wb-warn)', strokeWidth: 2 }} />
          <rect x={300} y={y(t.cbe)} width={110} height={y(t.objective) - y(t.cbe)} className="f-panel" />
          {[
            [t.threshold, `Threshold ${t.threshold} ${t.unit}`, 'ink'],
            [wce, `Worst-case estimate ${wce} ${t.unit}`, 'warn'],
            [t.cbe, `Current best estimate ${t.cbe} ${t.unit}`, 'ink'],
            [t.objective, `Objective ${t.objective} ${t.unit}`, 'muted'],
          ].map(([v, l, ink]) => (
            <g key={l as string}>
              <line x1={280} y1={y(v as number)} x2={430} y2={y(v as number)} style={{ stroke: 'var(--wb-fg)', strokeWidth: 2.4 }} />
              <Lines x={440} y={y(v as number)} lines={[l as string]} size={SW} weight={600} anchor="start" ink={ink as 'ink'} />
            </g>
          ))}
          <Lines x={270} y={(y(t.threshold) + y(wce)) / 2} lines={['margin']} size={SW} weight={700} anchor="end" ink="accent" />
          <Lines x={270} y={(y(wce) + y(t.cbe)) / 2} lines={['contingency']} size={SW} weight={700} anchor="end" ink="warn" />
          <Lines x={20} y={250} lines={[...wrap(t.name, 18), '(lower is better)']} size={SW} anchor="start" ink="muted" />
          <Lines x={990} y={70} lines={['margin is trade space']} size={SW} weight={700} anchor="end" ink="accent" />
          <Lines x={990} y={260} lines={['contingency decreases', 'as the design matures']} size={SW} weight={700} anchor="end" ink="warn" />
        </g>
      )}
    </Svg>
  )
}

export function TpmProfileFigure({ alt }: { alt: string }) {
  const t = tpm('TPM-003')
  const p = plannedProfile(t)
  const x = (m: number) => 110 + (m / 24) * 560
  const y = (v: number) => 300 - ((v - 19) / 7) * 270
  const trig = t.threshold + MONTH6.trigger
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {() => (
        <g>
          <line x1={110} y1={300} x2={690} y2={300} className="f-axis" style={{ strokeWidth: 2 }} />
          <line x1={110} y1={300} x2={110} y2={20} className="f-axis" style={{ strokeWidth: 2 }} />
          {p.map((q) => (
            <Lines key={q.month} x={x(q.month)} y={322} lines={[String(q.month)]} size={SW} />
          ))}
          <Lines x={60} y={322} lines={['month']} size={SW} ink="muted" />
          {[20, 22, 24, 26].map((v) => (
            <Lines key={v} x={100} y={y(v)} lines={[`${v}`]} size={SW} anchor="end" ink="muted" />
          ))}
          <line x1={110} y1={y(t.threshold)} x2={690} y2={y(t.threshold)} style={{ stroke: 'var(--wb-fg)', strokeWidth: 3 }} />
          <line x1={110} y1={y(t.objective)} x2={690} y2={y(t.objective)} style={{ stroke: 'var(--wb-ok)', strokeWidth: 3 }} strokeDasharray="4 4" />
          <line x1={110} y1={y(trig)} x2={690} y2={y(trig)} style={{ stroke: 'var(--wb-warn)', strokeWidth: 2.5 }} strokeDasharray="9 6" />
          <polyline points={p.map((q) => `${x(q.month)},${y(q.wce)}`).join(' ')} fill="none" style={{ stroke: 'var(--wb-accent)', strokeWidth: 4 }} />
          {p.map((q) => (
            <circle key={q.month} cx={x(q.month)} cy={y(q.wce)} r={6} style={{ fill: 'var(--wb-accent)' }} />
          ))}
          <circle cx={x(6)} cy={y(MONTH6.wce)} r={11} style={{ fill: 'var(--wb-bad)' }} />
          <Lines x={705} y={y(t.objective)} lines={[`objective ${t.objective} %`]} size={SW} weight={600} anchor="start" />
          <Lines x={705} y={y(p[4].wce) - 8} lines={['planned worst case']} size={SW} weight={700} anchor="start" ink="accent" />
          <Lines x={705} y={y(trig) + 12} lines={[`trigger: margin < ${MONTH6.trigger} point`]} size={SW} weight={600} anchor="start" ink="warn" />
          <Lines x={705} y={y(t.threshold) + 18} lines={[`threshold ${t.threshold} %`]} size={SW} weight={700} anchor="start" />
          <Lines x={x(6) + 18} y={y(MONTH6.wce) + 22} lines={[`month 6: ${f2(MONTH6.wce)} %`]} size={SW} weight={700} anchor="start" ink="bad" />
          <Lines x={110} y={8} lines={['landing energy reserve, %']} size={SW} anchor="start" ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function ChainW3Figure({ alt }: { alt: string }) {
  const t2 = technology('TECH-002')
  const r2 = risk('R-002')
  const t3 = tpm('TPM-003')
  const sub: Record<string, string[]> = {
    [CHAIN[0]]: [`TRL ${t2.trl} on an`, 'assumption'],
    [CHAIN[1]]: [`Rated ${r2.likelihood} × ${r2.consequence},`, 'mitigate'],
    [CHAIN[2]]: [`Margin ${f1(marginOf(t3))} points,`, `trigger < ${MONTH6.trigger}`],
    [CHAIN[3]]: [`≥ ${t3.threshold} % usable`, 'energy on landing'],
    [CHAIN[4]]: ['Flight within', 'safety limits'],
  }
  const pos = [
    { x: 20, y: 80 },
    { x: 320, y: 80 },
    { x: 620, y: 80 },
    { x: 620, y: 340 },
    { x: 320, y: 340 },
  ]
  const W = 260
  const Hc = 140
  return (
    <Svg w={FB_W} h={500} alt={alt}>
      {(id) => (
        <g>
          {CHAIN.map((cid, i) => (
            <Card key={cid} x={pos[i].x} y={pos[i].y} w={W} h={Hc} title={cid} lines={sub[cid]} size={S} tone={i === 2 ? 'soft' : 'box'} />
          ))}
          <Arrow d={`M ${20 + W} 150 L 318 150`} id={id} />
          <Arrow d={`M ${320 + W} 150 L 618 150`} id={id} />
          <Arrow d={`M 750 222 L 750 338`} id={id} />
          <Arrow d={`M 618 410 L ${320 + W + 2} 410`} id={id} />
          <Arrow d="M 700 78 Q 400 0 120 76" id={id} tone="warn" dashed />
          <Lines x={410} y={26} lines={[`${Math.round(MONTH6.fade * 100)} % fade at month 6`]} size={S} weight={700} ink="warn" />
          <Lines x={150} y={410} lines={['One result', 'moves every link']} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function HandoffFigure({ alt }: { alt: string }) {
  const slots = ['Decision', 'Alternatives', 'Criteria', 'Weights', 'Scores', 'Sensitivity', 'Recommendation']
  const sy = (i: number) => 40 + i * 64
  const entries = [
    { slot: 2, label: 'criterion' },
    { slot: 1, label: 'screen' },
    { slot: 6, label: 'condition' },
  ]
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {(id) => (
        <g>
          <Shape x={470} y={20} w={420} h={480} tone="panel" />
          {slots.map((s, i) => (
            <Card key={s} x={500} y={sy(i)} w={360} h={52} lines={[s]} size={S} />
          ))}
          <Card x={10} y={90} w={250} h={110} title="Maturity" lines={['readiness assessment']} size={S} tone="soft" strong />
          <Card x={10} y={300} w={250} h={110} title="Risk" lines={['the register']} size={S} tone="soft" strong />
          {entries.map((e) => (
            <g key={e.label}>
              <Arrow d={`M 262 145 L 496 ${sy(e.slot) + 26}`} id={id} tone="accent" width={1.8} />
              <Arrow d={`M 262 355 L 496 ${sy(e.slot) + 26}`} id={id} tone="accent" width={1.8} />

            </g>
          ))}
          {entries.map((e) => (
            <Chip key={e.label} cx={405} cy={sy(e.slot) + 26} text={e.label} size={S} tone="box" ink="accent" />
          ))}
          <Lines x={130} y={470} lines={['each enters as', 'criterion, screen or condition']} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}


export const WEEK3_S1_FIGURES: Record<string, { title: string; C: ComponentType<{ alt: string }> }> = {
  'w3s1-driving-question': { title: 'Should AeroLink buy six more aircraft?', C: DrivingQuestionW3Figure },
  'w3s1-three-processes': { title: 'Three processes, one subject: uncertainty', C: ThreeProcessesFigure },
  'w3s1-five-kinds': { title: 'Five kinds of register entry', C: FiveKindsFigure },
  'w3s1-tra-staircase': { title: 'The technology readiness staircase', C: TraStaircaseFigure },
  'w3s1-trl-limits': { title: 'What a TRL does not tell you', C: TrlLimitsFigure },
  'w3s1-maturity-curve': { title: 'Maturity, hype and the s-curve', C: MaturityCurveFigure },
  'w3s1-evidence-cards': { title: 'Evidence, or a labeled assumption', C: EvidenceCardsFigure },
  'w3s1-worked-trl': { title: 'AeroLink readiness assessment', C: WorkedTrlFigure },
  'w3s1-risk-loop': { title: 'The risk process', C: RiskLoopFigure },
  'w3s1-risk-anatomy': { title: 'Condition, if, then', C: RiskAnatomyFigure },
  'w3s1-risk-matrix': { title: 'The AeroLink risks on the reporting matrix', C: RiskMatrixFigure },
  'w3s1-ordinal-trap': { title: 'Why the ordinal product misleads', C: OrdinalTrapFigure },
  'w3s1-handling-doors': { title: 'Four handling options', C: HandlingDoorsFigure },
  'w3s1-security-resilience': { title: 'Adversity, resilience and security', C: SecurityResilienceFigure },
  'w3s1-worked-risk': { title: 'Two risks worked in full', C: WorkedRiskFigure },
  'w3s1-burn-down': { title: 'Burn-down, trigger and the sea of green', C: BurnDownFigure },
  'w3s1-register-network': { title: 'The register linked to the package', C: RegisterNetworkFigure },
  'w3s1-tpm-pyramid': { title: 'From MOE and MOP to TPM', C: TpmPyramidFigure },
  'w3s1-margin-bar': { title: 'Estimate, contingency, worst case, margin', C: MarginBarFigure },
  'w3s1-tpm-profile': { title: 'Landing-energy planned profile', C: TpmProfileFigure },
  'w3s1-chain': { title: 'One chain through all three instruments', C: ChainW3Figure },
  'w3s1-handoff': { title: 'What the trade study needs from today', C: HandoffFigure },
}
