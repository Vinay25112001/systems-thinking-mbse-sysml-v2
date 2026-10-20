// Week 1, Session 2 lecture figures (concerns, needs, the AeroLink worked example, the lab launch). Original drawings:
// none redraws a SEBoK, MITRE or DoD figure. Every label comes from the Session 2 lecture text
// (src/content/lectures/week01/session2.ts) or the corrected AeroLink case (src/content/lectures/week01/aerolinkCase.ts,
// FICTIONAL); a figure adds no claim of its own. Static SVG with the shared theme classes (flow.css: f-shape, f-soft,
// f-panel, f-env, f-label, f-muted, f-accent-ink, f-arrow) and theme variables (--wb-warn, --wb-warn-soft), so the light
// and dark themes are both designed once; meaning is never carried by color alone (dash patterns, outlines, labels).
// Review status: new-pending-review (revised after the independent review: F02, F04, F12, F19, F25–F28).
import { useId, type ReactNode } from 'react'
import { Markers } from './Frame'
import { CONFLICT, DELIBERATE_GAP, NEEDS, PRIORITY_LABEL, STAKEHOLDERS, SUPPORT_LABEL, TRACE_CORRECTED, coverageMatrix, need, stakeholder, uncoveredStakeholders, type CaseStakeholder } from '../../content/lectures/week01/aerolinkCase'
import { LAB_MINIMUMS as MIN } from '../../content/lectures/week01/labBrief'
import { WEEK1_METHODS } from '../../content/lectures/week01/methods'

// ------------------------------------------------------------------------------------------------ shared helpers
type Tone = 'box' | 'soft' | 'panel' | 'env' | 'warn' | 'dash' | 'later'
const WARN_FILL = { fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', strokeWidth: 1.8 }
const WARN_INK = { fill: 'var(--wb-warn)' }

function Shape({ x, y, w, h, tone = 'box', rx = 7, strong = false }: { x: number; y: number; w: number; h: number; tone?: Tone; rx?: number; strong?: boolean }) {
  const sw = strong ? { strokeWidth: 3 } : undefined
  if (tone === 'soft')
    return (
      <g className="f-soft">
        <rect x={x} y={y} width={w} height={h} rx={rx} className="f-shape" style={sw} />
      </g>
    )
  if (tone === 'panel') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-panel" style={sw} />
  if (tone === 'env') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-env" style={sw} />
  if (tone === 'warn') return <rect x={x} y={y} width={w} height={h} rx={rx} style={{ ...WARN_FILL, ...(sw ?? {}) }} />
  if (tone === 'dash' || tone === 'later') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-env" strokeDasharray="6 4" style={sw} />
  return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-shape" style={sw} />
}

type Ink = 'ink' | 'muted' | 'accent' | 'warn'
const inkProps = (ink: Ink) => (ink === 'warn' ? { style: WARN_INK } : { className: ink === 'muted' ? 'f-muted' : ink === 'accent' ? 'f-accent-ink' : 'f-label' })

/** Lines of text centered (or anchored) on (x, y): the block is vertically centered on y. */
function Lines({ x, y, lines, size = 16, anchor = 'middle', weight = 500, ink = 'ink', lh = 1.25, italic = false }: { x: number; y: number; lines: string[]; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; ink?: Ink; lh?: number; italic?: boolean }) {
  const step = size * lh
  const top = y - ((lines.length - 1) * step) / 2
  return (
    <>
      {lines.map((l, i) => (
        <text key={i} x={x} y={top + i * step} textAnchor={anchor} dominantBaseline="central" fontSize={size} fontWeight={weight} fontStyle={italic ? 'italic' : undefined} {...inkProps(ink)}>
          {l}
        </text>
      ))}
    </>
  )
}

/** A shape with centered lines of text. */
function Card({ x, y, w, h, lines, tone = 'box', size = 16, weight = 500, ink, strong = false }: { x: number; y: number; w: number; h: number; lines: string[]; tone?: Tone; size?: number; weight?: number; ink?: Ink; strong?: boolean }) {
  return (
    <g>
      <Shape x={x} y={y} w={w} h={h} tone={tone} strong={strong} />
      <Lines x={x + w / 2} y={y + h / 2} lines={lines} size={size} weight={weight} ink={ink ?? (tone === 'later' ? 'muted' : 'ink')} />
    </g>
  )
}

function Arrow({ d, id, tone = 'ink', dashed = false, width, both = false }: { d: string; id: string; tone?: 'ink' | 'accent' | 'muted' | 'warn'; dashed?: boolean; width?: number; both?: boolean }) {
  const style = tone === 'warn' ? { stroke: 'var(--wb-warn)', strokeWidth: width ?? 2.6 } : tone === 'muted' ? { stroke: 'var(--wb-muted)', strokeWidth: width ?? 1.6 } : width ? { strokeWidth: width } : undefined
  return <path d={d} className={`f-arrow${tone === 'accent' ? ' accent' : ''}`} style={style} strokeDasharray={dashed ? '7 5' : undefined} markerEnd={`url(#${id}-${tone})`} markerStart={both ? `url(#${id}-${tone})` : undefined} fill="none" />
}

function Svg({ w, h, alt, children }: { w: number; h: number; alt: string; children: (id: string) => ReactNode }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="lf-svg" role="img" aria-label={alt}>
      <Markers id={id} />
      {children(id)}
    </svg>
  )
}

const SHORT: Record<string, string> = {
  'STK-001': 'Passengers',
  'STK-002': 'FAA',
  'STK-003': 'Investors',
  'STK-004': 'Communities',
  'STK-005': 'Vertiport operators',
  'STK-006': 'Emergency responders',
  'STK-007': 'ANSP',
  'STK-008': 'Pilots / remote ops',
  'STK-009': 'Maintenance techs',
  'STK-010': 'Electric utility',
  'STK-011': 'Manufacturer (OEM)',
  'STK-012': 'Insurers',
  'STK-013': 'City planning auth.',
  'STK-014': 'Accessibility adv.',
  'STK-015': 'Reduced-mobility pass.',
}
const shortName = (id: string) => SHORT[id] ?? id

/** Shorter names for the dense influence × support grid. */
const TINY: Record<string, string> = {
  'STK-001': 'Passengers',
  'STK-002': 'FAA',
  'STK-003': 'Investors',
  'STK-004': 'Communities',
  'STK-005': 'Vertiport ops',
  'STK-006': 'Emergency resp.',
  'STK-007': 'ANSP',
  'STK-008': 'Pilots/operators',
  'STK-009': 'Maintenance',
  'STK-010': 'Utility',
  'STK-011': 'Manufacturer',
  'STK-012': 'Insurers',
  'STK-013': 'City planning',
  'STK-014': 'Advocates',
  'STK-015': 'Reduced mobility',
}

// Size rule for these figures (checked in the viewer at 1600 × 900): figures beside bullets use a viewBox about
// 860 wide with text of at least 16 units; full-width figures use a viewBox 1200–1440 wide and about 2.4:1, with text of
// at least 17 units. Both render at roughly 12 px or more on the slide stage and about 10 pt or more in the .pptx.

// ------------------------------------------------------------------------------------------------ S2.1 influence × support (MITRE map)
export function InfluenceSupportFigure({ alt }: { alt: string }) {
  const cols = [1, 2, 3, 4] as const
  const rows = [5, 4, 3, 2]
  const X0 = 92
  const Y0 = 92
  const CW = 188
  const RH = 104
  const groups = new Map<string, CaseStakeholder[]>()
  for (const s of STAKEHOLDERS) {
    const k = `${s.support - 1},${rows.indexOf(s.influence)}`
    groups.set(k, [...(groups.get(k) ?? []), s])
  }
  return (
    <Svg w={860} h={610} alt={alt}>
      {(id) => (
        <>
          <rect x={X0} y={Y0} width={CW * 3} height={RH * 2} style={{ fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', strokeWidth: 1.5 }} strokeDasharray="6 4" />
          <rect x={X0 + CW * 3} y={Y0} width={CW} height={RH * 4} style={{ fill: 'var(--wb-accent-soft)' }} />
          {cols.map((c, i) => (
            <line key={`v${c}`} x1={X0 + i * CW} y1={Y0} x2={X0 + i * CW} y2={Y0 + RH * 4} className="f-divider" />
          ))}
          {rows.map((r, i) => (
            <line key={`h${r}`} x1={X0} y1={Y0 + i * RH} x2={X0 + CW * 4} y2={Y0 + i * RH} className="f-divider" />
          ))}
          <rect x={X0} y={Y0} width={CW * 4} height={RH * 4} fill="none" className="f-axis" />
          {rows.map((r, i) => (
            <text key={r} x={X0 - 14} y={Y0 + i * RH + RH / 2} textAnchor="end" dominantBaseline="central" fontSize={20} fontWeight={700} className="f-label">
              {r}
            </text>
          ))}
          <text x={26} y={Y0 + RH * 2} transform={`rotate(-90 26 ${Y0 + RH * 2})`} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} className="f-label">
            Influence (1–5)
          </text>
          {cols.map((c, i) => (
            <text key={c} x={X0 + i * CW + CW / 2} y={Y0 + RH * 4 + 26} textAnchor="middle" fontSize={18} fontWeight={700} className="f-label">
              {SUPPORT_LABEL[c]}
            </text>
          ))}
          <text x={X0 + CW * 2} y={Y0 + RH * 4 + 58} textAnchor="middle" fontSize={17} className="f-muted">
            Level of support → (MITRE’s scale)
          </text>
          <text x={X0 + 4} y={Y0 - 58} fontSize={18} fontWeight={700} style={WARN_INK}>
            High influence, not yet committed: move right
          </text>
          <text x={X0 + CW * 3 + CW / 2} y={Y0 - 58} textAnchor="middle" fontSize={18} fontWeight={700} className="f-accent-ink">
            Required level
          </text>
          <Arrow id={id} d={`M ${X0 + 6} ${Y0 - 24} L ${X0 + CW * 3 + 36} ${Y0 - 24}`} tone="warn" width={3} />
          {[...groups.entries()].map(([k, list]) => {
            const [c, r] = k.split(',').map(Number)
            return list.map((s, j) => {
              const h = 42
              const y = Y0 + r * RH + (RH - list.length * h - (list.length - 1) * 8) / 2 + j * (h + 8)
              return (
                <g key={s.id}>
                  <Shape x={X0 + c * CW + 8} y={y} w={CW - 16} h={h} tone="box" strong={s.approving} />
                  <Lines x={X0 + c * CW + CW / 2} y={y + h / 2} lines={[`${s.id.slice(-3)} ${TINY[s.id]}`]} size={17} weight={s.approving ? 700 : 500} />
                </g>
              )
            })
          })}
          <rect x={X0} y={Y0 + RH * 4 + 84} width={22} height={15} rx={3} className="f-shape" style={{ strokeWidth: 3 }} />
          <text x={X0 + 30} y={Y0 + RH * 4 + 92} dominantBaseline="central" fontSize={16} className="f-label">
            thick outline: approving authority · numbers are STK-0nn
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.2 concern specificity ladder
export function ConcernLadderFigure({ alt }: { alt: string }) {
  return (
    <Svg w={860} h={610} alt={alt}>
      {(id) => (
        <>
          <Card x={10} y={30} w={560} h={84} tone="later" lines={['Still not a need: NEED-003 says what the', 'communities need the service to do']} size={18} />
          <Arrow id={id} d="M 290 166 L 290 120" tone="muted" dashed />
          <Card x={10} y={170} w={560} h={124} tone="soft" strong lines={['CON-012: Residents near vertiports are', 'concerned about take-off and landing', 'noise, how often it occurs and at what hours.']} size={18} weight={600} />
          <Lines x={590} y={232} lines={['Specific: who, what,', 'where, how often,', 'when']} size={18} anchor="start" ink="accent" weight={700} />
          <Arrow id={id} d="M 150 346 L 150 300" tone="accent" width={2.5} />
          <Card x={10} y={350} w={500} h={84} tone="box" lines={['“Noise near homes', 'around vertiports”']} size={19} />
          <Lines x={530} y={392} lines={['Adds who and where;', 'no when, no how often']} size={18} anchor="start" ink="muted" />
          <Arrow id={id} d="M 110 486 L 110 440" tone="accent" width={2.5} />
          <Card x={10} y={490} w={440} h={70} tone="env" lines={['“Communities: noise”']} size={19} />
          <Lines x={470} y={525} lines={['Generic: a reviewer', 'can check nothing']} size={18} anchor="start" ink="muted" />
          <text x={10} y={596} fontSize={16.5} className="f-muted">
            Course rule: say what, for whom, and where or when it bites.
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.3 relationship map (full width)
export function RelationshipMapFigure({ alt }: { alt: string }) {
  const W = 204
  const H = 58
  const pos: Record<string, [number, number]> = {
    'STK-013': [120, 60],
    'STK-004': [120, 300],
    'STK-005': [560, 300],
    'STK-010': [400, 480],
    'STK-006': [720, 480],
    'STK-007': [470, 60],
    'STK-008': [780, 60],
    'STK-002': [1090, 60],
    'STK-011': [1090, 240],
    'STK-003': [1090, 380],
    'STK-012': [1090, 510],
  }
  const edge = (a: string, b: string) => {
    const [ax, ay] = pos[a]
    const [bx, by] = pos[b]
    const len = Math.hypot(bx - ax, by - ay)
    const sx = (bx - ax) / len
    const sy = (by - ay) / len
    const clip = (cx: number, cy: number, ux: number, uy: number) => {
      const t = Math.min(ux === 0 ? Infinity : W / 2 / Math.abs(ux), uy === 0 ? Infinity : H / 2 / Math.abs(uy))
      return [cx + ux * t, cy + uy * t]
    }
    const [x1, y1] = clip(ax, ay, sx, sy)
    const [x2, y2] = clip(bx, by, -sx, -sy)
    return { x1, y1, x2, y2, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 }
  }
  const rels: { a: string; b: string; label: string[]; dx: number; dy: number; start?: boolean }[] = [
    { a: 'STK-002', b: 'STK-011', label: ['REL-001 regulates:', 'aircraft certification'], dx: 14, dy: 0, start: true },
    { a: 'STK-010', b: 'STK-005', label: ['REL-003 supplies:', 'grid power'], dx: -110, dy: 0 },
    { a: 'STK-003', b: 'STK-011', label: ['REL-004 funds:', 'fleet purchase'], dx: 14, dy: 0, start: true },
    { a: 'STK-006', b: 'STK-005', label: ['REL-005 coordinates', 'with: incident plans'], dx: 120, dy: 0 },
    { a: 'STK-007', b: 'STK-008', label: ['REL-006 coordinates with:', 'flight clearances'], dx: 0, dy: 62 },
    // "013 is affected by 004": the arrow runs from 004 to 013, in the direction of influence
    { a: 'STK-004', b: 'STK-013', label: ['REL-007: 013 is affected by 004', '(public consultation on siting)'], dx: 14, dy: -62, start: true },
    { a: 'STK-012', b: 'STK-003', label: ['REL-008 partners with:', 'risk transfer on financing'], dx: 14, dy: 0, start: true },
  ]
  const c = edge('STK-004', 'STK-005')
  return (
    <Svg w={1440} h={560} alt={alt}>
      {(id) => (
        <>
          {rels.map((r) => {
            const e = edge(r.a, r.b)
            return (
              <g key={r.label[0]}>
                <Arrow id={id} d={`M ${e.x1} ${e.y1} L ${e.x2} ${e.y2}`} />
                <Lines x={e.mx + r.dx} y={e.my + r.dy} lines={r.label} size={17} anchor={r.start ? 'start' : 'middle'} />
              </g>
            )
          })}
          <Arrow id={id} d={`M ${c.x1 + 4} ${c.y1} L ${c.x2 - 4} ${c.y2}`} tone="warn" dashed width={4.5} both />
          <rect x={c.mx - 165} y={c.my - 112} width={330} height={60} rx={7} style={WARN_FILL} />
          <line x1={c.mx} y1={c.my - 52} x2={c.mx} y2={c.my - 8} style={{ stroke: 'var(--wb-warn)', strokeWidth: 1.8 }} />
          <Lines x={c.mx} y={c.my - 82} lines={['REL-002 conflicts with:', 'noise and siting vs throughput']} size={18} weight={700} />
          {Object.entries(pos).map(([sid, [x, y]]) => {
            const s = stakeholder(sid)
            return (
              <g key={sid}>
                <Shape x={x - W / 2} y={y - H / 2} w={W} h={H} tone={sid === 'STK-004' || sid === 'STK-005' ? 'soft' : 'box'} strong={s.approving} />
                <Lines x={x} y={y} lines={[sid, shortName(sid)]} size={17} weight={s.approving ? 700 : 500} lh={1.2} />
              </g>
            )
          })}
          <rect x={10} y={400} width={262} height={146} rx={7} className="f-env" strokeDasharray="5 4" />
          <Lines x={24} y={473} lines={['No recorded relationship:', 'STK-001 Passengers', 'STK-009 Maintenance techs', 'STK-014 Accessibility adv.', 'STK-015 Reduced-mobility pass.']} size={16} anchor="start" ink="muted" />
          <rect x={300} y={538} width={24} height={15} rx={3} className="f-shape" style={{ strokeWidth: 3 }} />
          <text x={332} y={546} dominantBaseline="central" fontSize={16} className="f-label">
            thick outline: approving authority · arrows run from source to target; “is affected by” runs from the influencer
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.4 needs vs requirements (full width)
export function NeedVsRequirementFigure({ alt }: { alt: string }) {
  return (
    <Svg w={1240} h={480} alt={alt}>
      {(id) => (
        <>
          <Shape x={6} y={6} w={520} h={468} tone="panel" />
          <Shape x={714} y={6} w={520} h={468} tone="panel" />
          <Lines x={266} y={36} lines={['Stakeholder’s view: black box, outside']} size={20} weight={700} />
          <Lines x={974} y={36} lines={['Developer’s view: white box, inside']} size={20} weight={700} />
          <rect x={226} y={62} width={80} height={46} rx={4} style={{ fill: 'var(--wb-fg)' }} />
          <text x={266} y={85} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} style={{ fill: 'var(--wb-panel)' }}>
            SoI
          </text>
          <rect x={934} y={62} width={80} height={46} rx={4} className="f-shape" style={{ strokeWidth: 2 }} />
          <line x1={946} y1={78} x2={1002} y2={78} className="f-divider" />
          <line x1={946} y1={94} x2={1002} y2={94} className="f-divider" />
          <text x={266} y={132} textAnchor="middle" fontSize={17} className="f-muted">
            what they need it to do; no “shall”
          </text>
          <text x={974} y={132} textAnchor="middle" fontSize={17} className="f-muted">
            what the SoI shall do
          </text>
          <Card x={22} y={150} w={488} h={130} tone="soft" size={17} lines={['The user needs the coffee maker to', 'stop heating water once the selected', 'temperature is reached.', '(SEBoK example, paraphrased)']} />
          <Card x={730} y={150} w={488} h={130} tone="box" size={17} lines={['The coffee maker shall stop the heating', 'function once the selected brew', 'temperature is reached.', '(SEBoK example, paraphrased)']} />
          <Card x={22} y={300} w={488} h={158} tone="soft" size={17} lines={['NEED-010 (AeroLink): The electric', 'utility needs the air-taxi service to', 'keep the power drawn at each vertiport', 'within the agreed connection capacity.']} />
          <Card x={730} y={300} w={488} h={158} tone="later" size={18} lines={['Week 2: several requirements,', 'each an engineering decision,', 'transformed from NEED-010']} />
          <Arrow id={id} d="M 536 215 L 704 215" tone="accent" width={3} />
          <Arrow id={id} d="M 536 380 L 704 380" tone="accent" width={3} />
          <Lines x={620} y={170} lines={['transformation', '= analysis']} size={18} weight={700} ink="accent" />
          <Lines x={620} y={426} lines={['functional,', 'interface,', 'performance']} size={16} ink="muted" />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.5 the integrated set of needs
export function IntegratedSetFigure({ alt }: { alt: string }) {
  const inputs = [['Stakeholder needs,', 'elicited, prioritized'], ['Drivers and', 'constraints'], ['Risks', '(threats, hazards)'], ['Life-cycle concepts,', 'matured']]
  return (
    <Svg w={860} h={600} alt={alt}>
      {(id) => (
        <>
          {inputs.map((l, i) => {
            const y = 20 + i * 136
            return (
              <g key={i}>
                <Card x={6} y={y} w={232} h={96} lines={l} tone="box" size={18} />
                <Arrow id={id} d={`M 242 ${y + 48} C 290 ${y + 48}, 290 290, 318 290`} />
              </g>
            )
          })}
          <Shape x={322} y={160} w={256} h={260} tone="soft" strong />
          <Lines x={450} y={210} lines={['Integrated set', 'of needs']} size={23} weight={700} />
          <Lines x={450} y={330} lines={['correct', 'consistent', 'complete', 'feasible']} size={19} ink="accent" weight={700} />
          <text x={450} y={448} textAnchor="middle" fontSize={17} className="f-muted">
            defines the project scope
          </text>
          <Arrow id={id} d="M 582 230 L 650 166" tone="accent" width={2.5} />
          <Card x={612} y={40} w={242} h={118} tone="later" lines={['transformed into', 'design-input', 'requirements', '(Week 2)']} size={17.5} />
          <Arrow id={id} d="M 650 430 L 582 360" tone="accent" width={2.5} />
          <Card x={612} y={430} w={242} h={130} tone="box" lines={['validation reference', 'for requirements,', 'design and the', 'realized system']} size={17.5} />
          <text x={430} y={592} textAnchor="middle" fontSize={16} className="f-muted">
            Original drawing after SEBoK’s process description.
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.6 one need, many requirements
export function OneNeedManyFigure({ alt }: { alt: string }) {
  const leaves = [['REQ-? charging', 'power limit'], ['REQ-? charge', 'scheduling'], ['REQ-? load', 'monitoring'], ['REQ-? over-limit', 'alarm, response']]
  return (
    <Svg w={860} h={600} alt={alt}>
      {(id) => (
        <>
          <Card x={6} y={176} w={250} h={204} tone="soft" strong size={17.5} lines={['NEED-010', 'The utility needs the', 'air-taxi service to keep', 'each vertiport’s power', 'within the agreed', 'connection capacity']} />
          <Card x={290} y={226} w={200} h={104} tone="panel" size={17.5} lines={['analysis:', 'functional,', 'interface,', 'performance']} />
          <Arrow id={id} d="M 258 278 L 286 278" />
          {leaves.map((l, i) => {
            const y = 10 + i * 132
            return (
              <g key={i}>
                <Arrow id={id} d={`M 492 278 C 530 278, 530 ${y + 48}, 566 ${y + 48}`} tone="accent" />
                <Card x={570} y={y} w={284} h={96} tone="later" size={18} lines={l} />
              </g>
            )
          })}
          <Lines x={430} y={562} lines={['Each leaf is a design decision, not a reworded need.', 'Leaves are illustrative; Week 2 decides them.']} size={16.5} ink="muted" />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.7 the needs survive to validation
/** A V: needs → system requirements → design → realize on the left; integration → system verification (against the
 *  requirements) → system validation (against the needs) on the right. Horizontal pairings show what each right-arm
 *  step checks against. */
export function ValidationVFigure({ alt }: { alt: string }) {
  return (
    <Svg w={860} h={570} alt={alt}>
      {(id) => (
        <>
          <Card x={6} y={60} w={240} h={76} tone="soft" strong lines={['Integrated set', 'of needs']} size={20} weight={700} />
          <Card x={56} y={196} w={230} h={70} tone="box" lines={['System', 'requirements']} size={19} />
          <Card x={136} y={326} w={190} h={60} tone="box" lines={['Design']} size={19} />
          <Card x={330} y={462} w={200} h={60} tone="panel" lines={['Realize']} size={19} />
          <Card x={534} y={326} w={190} h={60} tone="box" lines={['Integration']} size={19} />
          <Card x={574} y={196} w={280} h={70} tone="box" strong lines={['System verification:', 'against the requirements']} size={18} weight={600} />
          <Card x={614} y={60} w={240} h={76} tone="soft" strong lines={['System validation:', 'right system?']} size={20} weight={700} />
          <Arrow id={id} d="M 110 140 L 140 192" />
          <Arrow id={id} d="M 200 270 L 222 322" />
          <Arrow id={id} d="M 262 390 L 360 458" />
          <Arrow id={id} d="M 500 458 L 600 390" />
          <Arrow id={id} d="M 640 322 L 680 270" />
          <Arrow id={id} d="M 720 192 L 740 140" />
          <Arrow id={id} d="M 250 98 L 608 98" tone="accent" dashed width={2.8} both />
          <text x={430} y={82} textAnchor="middle" fontSize={17.5} fontWeight={700} className="f-accent-ink">
            validated against the needs
          </text>
          <Arrow id={id} d="M 290 231 L 568 231" tone="muted" dashed both />
          <text x={430} y={220} textAnchor="middle" fontSize={16.5} className="f-muted">
            verified against the requirements
          </text>
          <Arrow id={id} d="M 330 356 L 528 356" tone="muted" dashed both />
          <Lines x={430} y={290} lines={['on the requirements themselves:', 'verification: well formed?', 'validation: faithful to the needs?']} size={15.5} ink="muted" />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.8 layered characteristics
export function NeedAttributesFigure({ alt }: { alt: string }) {
  const layers: { title: string; chips: { l: string[]; gate?: boolean }[] }[] = [
    { title: 'Set test (SEBoK)', chips: [{ l: ['correct'] }, { l: ['consistent'] }, { l: ['complete'] }, { l: ['feasible'] }] },
    {
      title: 'Content attributes (MITRE)',
      chips: [{ l: ['enterprise,', 'operational', 'context'] }, { l: ['complete,', 'end to end'] }, { l: ['conditions', 'or scenario'], gate: true }, { l: ['attributes', 'and metrics'] }, { l: ['growth,', 'extensibility'] }, { l: ['solution-', 'independent'], gate: true }],
    },
    { title: 'Statement form (SEBoK)', chips: [{ l: ['stakeholder’s', 'perspective'], gate: true }, { l: ['no “shall”'], gate: true }, { l: ['recommended:', '“… need the', 'system to …”'], gate: true }, { l: ['ID, rationale,', 'source'], gate: true }] },
  ]
  const WIDTH = 848
  return (
    <Svg w={860} h={610} alt={alt}>
      {() => (
        <>
          {layers.map((ly, i) => {
            const y = 6 + i * 180
            const n = ly.chips.length
            const gap = 8
            const cw = (WIDTH - 16 - gap * (n - 1)) / n
            return (
              <g key={ly.title}>
                <Shape x={6} y={y} w={WIDTH} h={168} tone="panel" />
                <text x={20} y={y + 28} fontSize={19} fontWeight={700} className="f-label">
                  {ly.title}
                </text>
                {ly.chips.map((c, k) => {
                  const cx = 14 + k * (cw + gap)
                  return (
                    <g key={k}>
                      <Card x={cx} y={y + 48} w={cw} h={108} lines={c.l} tone={c.gate ? 'soft' : 'box'} size={n > 4 ? 16.5 : 18} strong={c.gate} />
                      {c.gate && <circle cx={cx + cw - 12} cy={y + 60} r={6} style={{ fill: 'var(--wb-accent)' }} />}
                    </g>
                  )
                })}
              </g>
            )
          })}
          <circle cx={16} cy={566} r={6} style={{ fill: 'var(--wb-accent)' }} />
          <Lines x={30} y={578} lines={['Bold outline and dot: covered by the course minimum gate (stated as a', 'need, no design, attributed, traced, condition, rationale)']} size={16.5} anchor="start" />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.10 elicitation technique selection (full width)
type Dot = 2 | 1 | 0
function RatingDot({ cx, cy, v }: { cx: number; cy: number; v: Dot }) {
  const r = 12
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} style={{ fill: v === 2 ? 'var(--wb-fg)' : 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2 }} />
      {v === 1 && <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z`} style={{ fill: 'var(--wb-fg)' }} />}
    </g>
  )
}
const ELICITATION_ROWS: { t: string; src: string; v: Dot[] }[] = [
  { t: 'Structured brainstorming workshop', src: 'SEBoK, MITRE', v: [1, 0, 1, 0, 0] },
  { t: 'One-on-one interview', src: 'SEBoK, MITRE', v: [0, 2, 1, 1, 2] },
  { t: 'Questionnaire or survey', src: 'SEBoK, MITRE', v: [2, 0, 2, 0, 1] },
  { t: 'Focus group or workshop', src: 'SEBoK, MITRE', v: [1, 2, 1, 1, 1] },
  { t: 'Direct observation', src: 'MITRE', v: [0, 2, 0, 2, 0] },
  { t: 'Prototype or visual content', src: 'SEBoK, MITRE', v: [1, 2, 0, 2, 1] },
  { t: 'Documentation review', src: 'SEBoK', v: [0, 1, 2, 0, 0] },
  { t: 'Joint user–developer session', src: 'MITRE', v: [1, 2, 0, 1, 2] },
]
const ELICITATION_FACTORS = ['Reach', 'Depth', 'Low cost', 'Tacit knowledge', 'Contested topics']
export function ElicitationMatrixFigure({ alt }: { alt: string }) {
  const X0 = 370
  const CW = 158
  const Y0 = 58
  const RH = 44
  const legY = Y0 + 8 * RH + 36
  return (
    <Svg w={1330} h={legY + 34} alt={alt}>
      {() => (
        <>
          <text x={12} y={34} fontSize={19} fontWeight={700} className="f-label">
            Technique
          </text>
          {ELICITATION_FACTORS.map((f, i) => (
            <text key={f} x={X0 + i * CW + CW / 2} y={34} textAnchor="middle" fontSize={19} fontWeight={700} className="f-label">
              {f}
            </text>
          ))}
          <text x={X0 + 5 * CW + 22} y={34} fontSize={19} fontWeight={700} className="f-label">
            Named in
          </text>
          {ELICITATION_ROWS.map((r, i) => {
            const y = Y0 + i * RH
            return (
              <g key={r.t}>
                {i % 2 === 0 && <rect x={4} y={y} width={1322} height={RH} className="f-panel" style={{ stroke: 'none' }} />}
                <text x={12} y={y + RH / 2} dominantBaseline="central" fontSize={19} className="f-label">
                  {r.t}
                </text>
                {r.v.map((v, k) => (
                  <RatingDot key={k} cx={X0 + k * CW + CW / 2} cy={y + RH / 2} v={v} />
                ))}
                <text x={X0 + 5 * CW + 22} y={y + RH / 2} dominantBaseline="central" fontSize={18} className="f-muted">
                  {r.src}
                </text>
              </g>
            )
          })}
          <line x1={4} y1={Y0} x2={1326} y2={Y0} className="f-axis" />
          {([[2, 'strong'], [1, 'partial'], [0, 'weak']] as const).map(([v, l], i) => (
            <g key={l}>
              <RatingDot cx={24 + i * 110} cy={legY} v={v} />
              <text x={44 + i * 110} y={legY} dominantBaseline="central" fontSize={17} className="f-label">
                {l}
              </text>
            </g>
          ))}
          <text x={370} y={legY} dominantBaseline="central" fontSize={17} className="f-muted">
            Ratings: instructor judgment (course convention). SEBoK also lists V&amp;V feedback.
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.11 the why ladder
/** Asking why climbs from a stated solution to the residents' outcome; the city agreement is a constraint beside the
 *  ladder (a driver, R11 p.554), not its top rung. The outcome, bounded by the agreement, is recorded as NEED-003. */
export function WhyLadderFigure({ alt }: { alt: string }) {
  return (
    <Svg w={860} h={610} alt={alt}>
      {(id) => (
        <>
          <Card x={6} y={496} w={440} h={104} tone="env" lines={['Stated: “Put up sound barriers', 'around the pad.”', '(a solution masquerading as a need)']} size={18} />
          <Card x={40} y={318} w={460} h={96} tone="box" lines={['Effect: late-evening and early-', 'morning take-offs wake residents']} size={18} />
          <Card x={74} y={110} w={480} h={124} tone="soft" strong lines={['Outcome: rest and home life near the', 'vertiport not disrupted by take-off and', 'landing noise, above all at night']} size={18} weight={600} />
          <Arrow id={id} d="M 220 492 L 250 420" tone="accent" width={2.8} />
          <Arrow id={id} d="M 270 314 L 300 240" tone="accent" width={2.8} />
          <text x={262} y={462} fontSize={20} fontWeight={700} className="f-accent-ink">
            why?
          </text>
          <text x={312} y={284} fontSize={20} fontWeight={700} className="f-accent-ink">
            why?
          </text>
          <Card x={74} y={8} w={480} h={74} tone="panel" lines={['Recorded as NEED-003: noise exposure at', 'homes within the agreed limits']} size={17} weight={600} />
          <Arrow id={id} d="M 314 108 L 314 86" />
          <Card x={586} y={8} w={268} h={142} tone="dash" lines={['Constraint (driver):', 'city agreement:', '65 dBA per event; cap on', 'evening and early-', 'morning events']} size={16.5} />
          <Arrow id={id} d="M 584 60 L 558 52" tone="muted" dashed />
          <Arrow id={id} d="M 558 210 L 598 210" />
          <Card x={602} y={176} w={252} h={196} tone="later" lines={['Possible solutions', '(Week 3 onward):', 'sound barriers', 'flight paths', 'operating hours', 'quieter procedures']} size={17} />
          <Lines x={560} y={450} lines={['The barrier survives', 'as one option only;', 'the need stays', 'solution-free.']} size={17} anchor="start" ink="muted" />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.12 conflict and adjudication
export function AdjudicationFigure({ alt }: { alt: string }) {
  const sub = [['all three needs', 'and REL-002'], ['Week 3 trade', 'inside both limits'], ['city, residents,', 'operators'], ['sponsor decides,', 'records why']]
  return (
    <Svg w={860} h={600} alt={alt}>
      {(id) => (
        <>
          <Card x={6} y={10} w={330} h={116} tone="box" lines={['NEED-001, NEED-004', 'more departures, sooner', 'Priority: Critical']} size={19} />
          <Card x={524} y={10} w={330} h={116} tone="box" lines={['NEED-003', 'noise exposure: level and', 'number of evening events', 'Priority: Mandatory']} size={18} />
          <line x1={60} y1={168} x2={800} y2={168} style={{ stroke: 'var(--wb-warn)', strokeWidth: 6 }} strokeDasharray="12 6" />
          <path d="M 410 174 L 430 212 L 450 174 Z" style={{ fill: 'var(--wb-warn)' }} />
          <line x1={170} y1={130} x2={170} y2={164} className="f-arrow" />
          <line x1={690} y1={130} x2={690} y2={164} className="f-arrow" />
          <Lines x={430} y={252} lines={['shared variable: take-offs and landings per pad', 'in the evening and early-morning hours']} size={18} weight={600} />
          {CONFLICT.protocol.map((p, i) => {
            const x = 6 + i * 214
            return (
              <g key={p.step}>
                <Card x={x} y={310} w={200} h={64} tone={i === 3 ? 'warn' : 'soft'} lines={[`${i + 1}. ${p.step}`]} size={20} weight={700} />
                {i < 3 && <Arrow id={id} d={`M ${x + 202} 342 L ${x + 214} 342`} tone="accent" />}
                <Lines x={x + 100} y={414} lines={sub[i]} size={17} ink="muted" />
              </g>
            )
          })}
          <Lines x={430} y={500} lines={['Priority frames the trade; agreement ends it', '(MITRE: prioritization ends when stakeholders agree).']} size={17.5} />
          <text x={430} y={574} textAnchor="middle" fontSize={16} className="f-muted">
            Protocol steps: the course’s application of MITRE’s advice. REL-002 records the conflict.
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.13 a weak register line, annotated
export function WeakRegisterFigure({ alt }: { alt: string }) {
  // [card center x, word center x on the line above, text, tag]
  const notes: [number, number, string[], string][] = [
    [152, 368, ['The developing company,', 'with no role or concern'], '“the company”'],
    [430, 511, ['A system listed as a', 'stakeholder: name the', 'organization behind it'], '“the app”'],
    [700, 600, ['No approving authority:', 'who must certify, qualify', 'or approve it for use?'], '(missing)'],
  ]
  return (
    <Svg w={860} h={520} alt={alt}>
      {(id) => (
        <>
          <Shape x={6} y={20} w={848} h={92} tone="panel" />
          <text x={24} y={56} fontSize={19} fontWeight={700} className="f-label">
            A weak register line (illustrative)
          </text>
          <text x={24} y={90} fontSize={22} style={{ fontFamily: 'var(--wb-mono)' }} className="f-label">
            Stakeholders: users, the company, the app.
          </text>
          {notes.map(([x, wx, t, tag]) => (
            <g key={tag}>
              <Arrow id={id} d={`M ${wx} 104 L ${x} 168`} tone="warn" width={2.4} />
              <Card x={x - 130} y={172} w={260} h={112} tone="warn" lines={t} size={17} />
              <Lines x={x} y={300} lines={[tag]} size={15} ink="muted" />
            </g>
          ))}
          <Shape x={6} y={330} w={848} h={180} tone="box" />
          <text x={24} y={362} fontSize={18} fontWeight={700} className="f-label">
            Rewritten from the register (a start, not the answer)
          </text>
          <Lines x={24} y={438} lines={['riders (users) · the agency that commissions the service (customer) ·', 'the organization that runs the app platform (owner of an external system) ·', 'the transport regulator (approving authority) · riders who need accessible formats (a class)']} size={17} anchor="start" />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.15 the corrected reference needs (full width)
export function NeedsCatalogFigure({ alt }: { alt: string }) {
  const cols = [
    { h: 'ID', x: 12 },
    { h: 'Need (short name)', x: 138 },
    { h: 'Subject', x: 640 },
    { h: 'Contributing', x: 890 },
    { h: 'Concern', x: 1050 },
    { h: 'Goal', x: 1160 },
    { h: 'Priority', x: 1270 },
  ]
  const RH = 31
  const Y0 = 44
  return (
    <Svg w={1420} h={Y0 + NEEDS.length * RH + 40} alt={alt}>
      {() => (
        <>
          {cols.map((c) => (
            <text key={c.h} x={c.x} y={28} fontSize={18} fontWeight={700} className="f-label">
              {c.h}
            </text>
          ))}
          <line x1={4} y1={Y0 - 3} x2={1416} y2={Y0 - 3} className="f-axis" />
          {NEEDS.map((n, i) => {
            const y = Y0 + i * RH
            const mark = n.provenance === 'proposed' ? '+' : TRACE_CORRECTED.includes(n.id) ? '*' : ''
            const subject = n.sources.find((s) => s.role === 'subject')!
            const contrib = n.sources.filter((s) => s.role === 'contributing')
            const cons = n.sources.map((s) => s.concern).filter(Boolean).join(', ')
            const cy = y + RH / 2
            return (
              <g key={n.id}>
                {mark ? <rect x={4} y={y} width={1412} height={RH} style={{ fill: 'var(--wb-warn-soft)' }} /> : i % 2 === 0 ? <rect x={4} y={y} width={1412} height={RH} className="f-panel" style={{ stroke: 'none' }} /> : null}
                <text x={12} y={cy} dominantBaseline="central" fontSize={18} fontWeight={700} className="f-label">
                  {n.id}
                </text>
                {mark && (
                  <text x={116} y={cy} dominantBaseline="central" fontSize={20} fontWeight={700} style={WARN_INK}>
                    {mark}
                  </text>
                )}
                <text x={138} y={cy} dominantBaseline="central" fontSize={18} className="f-label">
                  {n.name}
                </text>
                <text x={640} y={cy} dominantBaseline="central" fontSize={18} className="f-label">
                  {`${subject.stakeholder.slice(-3)} ${shortName(subject.stakeholder)}`}
                </text>
                <text x={890} y={cy} dominantBaseline="central" fontSize={18} className="f-label">
                  {contrib.map((x) => `${x.stakeholder.slice(-3)} ${TINY[x.stakeholder]}`).join(', ') || '—'}
                </text>
                <text x={1050} y={cy} dominantBaseline="central" fontSize={18} className="f-label">
                  {cons.replace(/CON-0*/g, 'C')}
                </text>
                <text x={1160} y={cy} dominantBaseline="central" fontSize={18} className="f-label">
                  {n.mgo.replace('MGO-00', 'G')}
                </text>
                <text x={1270} y={cy} dominantBaseline="central" fontSize={18} fontWeight={n.priority === 'mandatory' ? 700 : 500} className="f-label">
                  {PRIORITY_LABEL[n.priority]}
                </text>
              </g>
            )
          })}
          <text x={12} y={Y0 + NEEDS.length * RH + 26} fontSize={17} className="f-muted">
            Shaded: + added need, * subject or source corrected. STK-0nn; C2 = CON-002; G3 = MGO-003. Priorities proposed. FICTIONAL.
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.16 coverage audit matrix (full width)
export function CoverageMatrixFigure({ alt }: { alt: string }) {
  const m = coverageMatrix()
  const X0 = 370
  const CW = 44
  const Y0 = 64
  const RH = 29
  const noteX = X0 + NEEDS.length * CW + 18
  const footY = Y0 + m.length * RH
  return (
    <Svg w={1290} h={footY + 78} alt={alt}>
      {() => (
        <>
          <text x={X0 + (NEEDS.length * CW) / 2} y={20} textAnchor="middle" fontSize={18} fontWeight={700} className="f-label">
            NEED-0nn
          </text>
          {NEEDS.map((n, j) => (
            <text key={n.id} x={X0 + j * CW + CW / 2} y={48} textAnchor="middle" fontSize={17} fontWeight={700} className="f-label">
              {n.id.slice(-2)}
            </text>
          ))}
          <text x={noteX} y={48} fontSize={17} fontWeight={700} className="f-label">
            Audit note
          </text>
          {m.map((row, i) => {
            const y = Y0 + i * RH
            const s = stakeholder(row.stakeholder)
            const gap = row.stakeholder === DELIBERATE_GAP.stakeholder
            const n = row.cells.filter(Boolean).length
            return (
              <g key={row.stakeholder}>
                {gap ? <rect x={4} y={y} width={1282} height={RH} style={WARN_FILL} strokeDasharray="6 4" /> : i % 2 === 0 ? <rect x={4} y={y} width={1282} height={RH} className="f-panel" style={{ stroke: 'none' }} /> : null}
                <text x={12} y={y + RH / 2} dominantBaseline="central" fontSize={17.5} fontWeight={s.approving ? 700 : 500} className="f-label">
                  {`${row.stakeholder} ${shortName(row.stakeholder)}${s.approving ? ' (AA)' : ''}`}
                </text>
                {row.cells.map((c, j) => {
                  const cx = X0 + j * CW + CW / 2
                  const cy = y + RH / 2
                  if (c === 'subject') return <rect key={j} x={cx - 10} y={cy - 10} width={20} height={20} rx={2} style={{ fill: 'var(--wb-fg)' }} />
                  if (c === 'contributing') return <rect key={j} x={cx - 9} y={cy - 9} width={18} height={18} rx={2} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2.4 }} />
                  return <circle key={j} cx={cx} cy={cy} r={2} className="f-muted" />
                })}
                <text x={noteX} y={y + RH / 2} dominantBaseline="central" fontSize={17} fontWeight={gap ? 700 : 500} {...(gap ? { style: WARN_INK } : { className: 'f-muted' })}>
                  {gap ? 'GAP (deliberate)' : `${n} need${n === 1 ? '' : 's'}`}
                </text>
              </g>
            )
          })}
          {NEEDS.map((_, j) => (
            <line key={j} x1={X0 + j * CW} y1={Y0} x2={X0 + j * CW} y2={footY} className="f-divider" />
          ))}
          <rect x={12} y={footY + 16} width={20} height={20} rx={2} style={{ fill: 'var(--wb-fg)' }} />
          <text x={40} y={footY + 26} dominantBaseline="central" fontSize={17} className="f-label">
            subject
          </text>
          <rect x={130} y={footY + 17} width={18} height={18} rx={2} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2.4 }} />
          <text x={156} y={footY + 26} dominantBaseline="central" fontSize={17} className="f-label">
            contributing source
          </text>
          <text x={340} y={footY + 26} dominantBaseline="central" fontSize={17} className="f-label">
            {`(AA) approving authority · ${m.length - uncoveredStakeholders().length} of ${m.length} traced · both authorities covered`}
          </text>
          <text x={12} y={footY + 60} dominantBaseline="central" fontSize={17} fontWeight={700} style={WARN_INK}>
            STK-011: no need. CON-015 (orders, delivery slots, payment milestones) is a purchase-agreement matter, recorded with its reason.
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.17 trace lanes to Week 2 and Week 8 (full width)
export function TraceLanesFigure({ alt }: { alt: string }) {
  const code = ["part def 'Electric utility';", "concern 'peak grid load' {", '  subject airTaxiService;', "  stakeholder utility : 'Electric utility';", '}']
  return (
    <Svg w={1240} h={500} alt={alt}>
      {(id) => (
        <>
          {[
            ['Week 1', 'stakeholders, needs'],
            ['Week 2', 'ConOps, requirements'],
            ['Week 8', 'SysML v2 model'],
          ].map(([w, d], i) => {
            const y = 6 + i * 162
            return (
              <g key={w}>
                <Shape x={4} y={y} w={1232} h={150} tone="panel" />
                <text x={18} y={y + 34} fontSize={21} fontWeight={700} className="f-label">
                  {w}
                </text>
                <text x={18} y={y + 62} fontSize={17} className="f-muted">
                  {d}
                </text>
              </g>
            )
          })}
          <Card x={240} y={34} w={220} h={92} tone="box" lines={['STK-010', 'Electric utility']} size={18} />
          <Card x={520} y={34} w={220} h={92} tone="box" lines={['CON-011', 'Peak grid load']} size={18} />
          <Card x={810} y={26} w={330} h={108} tone="soft" strong lines={['NEED-010', 'Charging load within', 'the grid connection']} size={18} />
          <Arrow id={id} d="M 462 80 L 516 80" />
          <Arrow id={id} d="M 742 80 L 806 80" />
          <Card x={560} y={198} w={250} h={92} tone="box" lines={['SCN-003', 'Aircraft Charging']} size={18} />
          <Card x={880} y={198} w={300} h={92} tone="later" lines={['REQ-? (to be written)', 'traced to NEED-010']} size={18} />
          <Arrow id={id} d="M 990 136 L 1010 194" tone="accent" />
          <text x={1022} y={170} fontSize={16} className="f-accent-ink">
            transformed
          </text>
          <Arrow id={id} d="M 812 244 L 876 244" tone="muted" dashed />
          <rect x={240} y={348} width={600} height={140} rx={6} className="f-shape" />
          {code.map((l, i) => (
            <text key={i} x={256} y={374 + i * 25} fontSize={17} style={{ fontFamily: 'var(--wb-mono)' }} className="f-label" xmlSpace="preserve">
              {l}
            </text>
          ))}
          <Lines x={870} y={418} lines={['the IDs become model elements:', 'STK → part def', 'CON → concern']} size={17} anchor="start" ink="muted" />
          <Arrow id={id} d="M 560 128 C 500 180, 470 280, 480 344" tone="muted" dashed />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.20 enterprise pitch card
export function PitchCardFigure({ alt }: { alt: string }) {
  const lines: [string, string][] = [
    ['1. Enterprise', 'purpose, participants'],
    ['2. Problem and mission', 'one sentence each'],
    ['3. System of interest', 'inside the enterprise'],
    ['4. Boundary', 'inside / outside'],
    ['5. Approving authority', 'who approves use'],
    ['6. Non-customer, non-user', 'stakeholder + concern'],
  ]
  return (
    <Svg w={860} h={600} alt={alt}>
      {() => (
        <>
          <Shape x={6} y={6} w={848} h={588} tone="panel" />
          <text x={26} y={46} fontSize={22} fontWeight={700} className="f-label">
            Enterprise pitch (about 90 s)
          </text>
          {lines.map(([k, v], i) => {
            const y = 66 + i * 68
            return (
              <g key={k}>
                <text x={26} y={y + 22} fontSize={19} fontWeight={700} className="f-label">
                  {k}
                </text>
                <text x={834} y={y + 22} textAnchor="end" fontSize={17} className="f-muted">
                  {v}
                </text>
                <line x1={26} y1={y + 56} x2={834} y2={y + 56} className="f-axis" strokeDasharray="4 4" />
              </g>
            )
          })}
          {['Approved', 'With conditions', 'Revise (reason)'].map((d, i) => {
            const x = 26 + i * 276
            return (
              <g key={d}>
                <rect x={x} y={492} width={24} height={24} rx={3} className="f-shape" style={{ strokeWidth: 2 }} />
                <text x={x + 34} y={504} dominantBaseline="central" fontSize={19} fontWeight={700} className="f-label">
                  {d}
                </text>
              </g>
            )
          })}
          <text x={26} y={566} fontSize={16.5} className="f-muted">
            Decision and date go into Part 2 of the Team Record.
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.21 the next seven days (full width)
export function SevenDaysFigure({ alt }: { alt: string }) {
  const tasks: { t: string; who: string; from: number; to: number }[] = [
    { t: 'Proposal (problem, mission); context', who: 'Architecture', from: 1, to: 2 },
    { t: 'Stakeholder sweep, then merge', who: 'everyone; R&C merges', from: 2, to: 3 },
    { t: 'Register, concerns, relationships', who: 'R&C; Architecture', from: 3, to: 4 },
    { t: 'Needs (≥ 8, ≥ 5 STK, ≥ 1 authority)', who: 'R&C; everyone writes 2', from: 4, to: 5 },
    { t: 'Self-check, coverage audit, AI statement', who: 'V&V; AI & Data', from: 6, to: 6 },
    { t: 'Integration review, export, upload', who: 'V&V', from: 7, to: 7 },
  ]
  const X0 = 480
  const DW = 108
  const Y0 = 48
  const RH = 64
  return (
    <Svg w={1240} h={Y0 + tasks.length * RH + 10} alt={alt}>
      {() => (
        <>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <g key={d}>
              <text x={X0 + (d - 1) * DW + DW / 2} y={28} textAnchor="middle" fontSize={19} fontWeight={700} className="f-label">
                Day {d}
              </text>
              <line x1={X0 + (d - 1) * DW} y1={Y0 - 6} x2={X0 + (d - 1) * DW} y2={Y0 + tasks.length * RH} className="f-divider" />
            </g>
          ))}
          {tasks.map((k, i) => {
            const y = Y0 + i * RH
            return (
              <g key={k.t}>
                {i % 2 === 0 && <rect x={4} y={y} width={1232} height={RH} className="f-panel" style={{ stroke: 'none' }} />}
                <text x={12} y={y + RH / 2 - 11} dominantBaseline="central" fontSize={18.5} fontWeight={700} className="f-label">
                  {k.t}
                </text>
                <text x={12} y={y + RH / 2 + 13} dominantBaseline="central" fontSize={16.5} className="f-muted">
                  {k.who}
                </text>
                <Shape x={X0 + (k.from - 1) * DW + 6} y={y + 12} w={(k.to - k.from + 1) * DW - 12} h={RH - 24} tone="soft" rx={5} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.9 anatomy of a need, and the level problem
export function NeedAnatomyLevelFigure({ alt }: { alt: string }) {
  const n3 = need('NEED-003')
  const parts: [string, string[], number][] = [
    ['who needs it', ['Communities near vertiports'], 52],
    ['need, not “shall”', ['need the air-taxi service to'], 52],
    ['what, no design', ['keep take-off and landing noise exposure at nearby', 'homes within the agreed limits on the loudness of', 'each event and on the number of events in the', 'evening and early morning'], 120],
    ['condition', ['at every vertiport, every operating day'], 52],
  ]
  // positions computed once, outside the render callback (which React may call more than once)
  const tops = parts.reduce<number[]>((acc, _p, i) => [...acc, i === 0 ? 8 : acc[i - 1] + parts[i - 1][2] + 8], [])
  const y = tops[tops.length - 1] + parts[parts.length - 1][2] + 8
  return (
    <Svg w={860} h={620} alt={alt}>
      {(id) => (
        <>
          {parts.map(([label, text, h], i) => {
            const top = tops[i]
            return (
              <g key={label}>
                <text x={190} y={top + h / 2} textAnchor="end" dominantBaseline="central" fontSize={18} fontWeight={700} className="f-accent-ink">
                  {label}
                </text>
                <line x1={198} y1={top + 6} x2={198} y2={top + h - 6} className="f-arrow accent" style={{ strokeWidth: 3 }} />
                <Card x={212} y={top} w={642} h={h} tone={label.startsWith('need,') ? 'panel' : 'soft'} lines={text} size={18} />
              </g>
            )
          })}
          {[['ID', n3.id], ['Source', 'STK-004, CON-012'], ['Goal', n3.mgo], ['Rationale', 'permit at risk']].map(([k, v], i) => (
            <g key={k}>
              <Shape x={212 + i * 162} y={y + 2} w={152} h={58} tone="env" />
              <Lines x={212 + i * 162 + 76} y={y + 31} lines={[k, v]} size={15.5} />
            </g>
          ))}
          <text x={190} y={y + 31} textAnchor="end" dominantBaseline="central" fontSize={18} fontWeight={700} className="f-accent-ink">
            travels with it
          </text>
          <line x1={6} y1={y + 78} x2={854} y2={y + 78} className="f-divider" />
          <text x={6} y={y + 106} fontSize={19} fontWeight={700} className="f-label">
            The level problem
          </text>
          <Card x={6} y={y + 120} w={400} h={86} tone="soft" lines={['Service level (our SoI):', '“noise exposure within the', 'agreed limits” is a need']} size={16.5} />
          <Arrow id={id} d={`M 410 ${y + 163} L 448 ${y + 163}`} tone="muted" dashed />
          <Card x={452} y={y + 120} w={402} h={86} tone="later" lines={['Rotor-blade level (later):', 'a blade-tip speed limit may be', 'a legitimate derived constraint']} size={16.5} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.14 from draft to need (worked example I)
export function DraftToNeedFigure({ alt }: { alt: string }) {
  const n10 = need('NEED-010')
  return (
    <Svg w={860} h={600} alt={alt}>
      {(id) => (
        <>
          <text x={8} y={26} fontSize={18} fontWeight={700} className="f-label">
            Interview draft
          </text>
          <Card x={6} y={40} w={848} h={74} tone="env" lines={['“There is a need for a smart grid controller', 'that must cap charging.”']} size={19} />
          {(
            [
              [96, 'no subject'],
              [430, 'a solution'],
              [740, '“must”: requirement wording'],
            ] as [number, string][]
          ).map(([x, t]) => (
            <g key={t}>
              <Arrow id={id} d={`M ${x} 118 L ${x} 140`} tone="warn" width={2.2} />
              <Lines x={x} y={156} lines={[t]} size={16} ink="warn" weight={700} />
            </g>
          ))}
          <Arrow id={id} d="M 430 178 L 430 214" tone="accent" width={3} />
          <text x={446} y={204} fontSize={16} fontWeight={700} className="f-accent-ink">
            ask why · strip design · attribute · add condition
          </text>
          <text x={8} y={244} fontSize={18} fontWeight={700} className="f-label">
            NEED-010 (recommended form)
          </text>
          <Shape x={6} y={256} w={848} h={170} tone="soft" strong />
          <text x={24} y={282} dominantBaseline="central" fontSize={19} fontWeight={700}>
            <tspan className="f-accent-ink">The electric utility </tspan>
            <tspan className="f-label">needs the air-taxi service to</tspan>
          </text>
          <Lines x={24} y={326} lines={['keep the power drawn at each vertiport within the agreed', 'connection capacity.']} size={19} anchor="start" lh={1.3} />
          <Lines x={24} y={396} lines={[`Condition: ${n10.condition.replace(/\.$/, '')}`]} size={17} anchor="start" ink="muted" />
          {[['Source', 'STK-010 via CON-011'], ['Goal', n10.mgo], ['Rationale', 'trips protection or penalty'], ['Priority', `${PRIORITY_LABEL[n10.priority]} (proposed)`]].map(([k, v], i) => (
            <g key={k}>
              <Shape x={6 + i * 214} y={444} w={206} h={70} tone="env" />
              <Lines x={6 + i * 214 + 103} y={479} lines={[k, v]} size={15.5} />
            </g>
          ))}
          <text x={8} y={556} fontSize={16} className="f-muted">
            The controller is set aside as an option for Weeks 2–3, not discarded.
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.18 the Team Record parts
export function RecordPartsFigure({ alt }: { alt: string }) {
  const parts: [string, string[], boolean][] = [
    ['1 Charter', ['roles, tie-break,', 'norms, ID owners'], false],
    ['2 Proposal', ['problem, mission, goals;', `SoI, PRT ≥ ${MIN.inside} (its parts)`], false],
    ['3 Context', [`EXT ≥ ${MIN.context}, each`, 'exchange, direction'], false],
    ['4 Register', [`STK ≥ ${MIN.stakeholders} with CON;`, `REL ≥ ${MIN.relationships}, ${MIN.conflicts} conflict`], false],
    ['5 Needs', [`NEED ≥ ${MIN.needs} from ≥ ${MIN.needSources} STK,`, 'each → mission or goal;', '≥ 1 authority; audit'], false],
    ['6 AI statement', ['every AI-suggested', 'item tagged'], true],
  ]
  return (
    <Svg w={860} h={560} alt={alt}>
      {(id) => (
        <>
          <text x={8} y={26} fontSize={18} fontWeight={700} className="f-label">
            Five engineering outputs, plus the AI-use statement
          </text>
          {parts.map(([t, d, ai], i) => {
            const col = i % 3
            const row = Math.floor(i / 3)
            const x = 6 + col * 286
            const y = 44 + row * 188
            return (
              <g key={t}>
                <Shape x={x} y={y} w={272} h={170} tone={ai ? 'dash' : i === 4 ? 'soft' : 'box'} strong={i === 4} />
                <Lines x={x + 136} y={y + 34} lines={[t]} size={20} weight={700} />
                <Lines x={x + 136} y={y + 102} lines={d} size={17} ink="muted" />
              </g>
            )
          })}
          <Arrow id={id} d="M 430 424 L 430 452" tone="accent" />
          <Shape x={150} y={456} w={560} h={88} tone="panel" />
          <Lines x={430} y={500} lines={['team-NN-week1-record.md + team-NN-week1-model-inputs.json', 'one upload on the LMS, before Week 2 Session 1']} size={17} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.19 charter: roles and ID owners
export function CharterOwnersFigure({ alt }: { alt: string }) {
  const roles: [string, string[]][] = [
    ['Requirements & Compliance', ['STK, CON, NEED']],
    ['Architecture', ['ENT, PRT, EXT', 'REL (suggested)']],
    ['AI & Data Management', ['model inputs (JSON);', 'AI-use statement']],
    ['Verification & Validation', ['self-check, coverage', 'audit, final review']],
  ]
  return (
    <Svg w={860} h={560} alt={alt}>
      {() => (
        <>
          {roles.map(([r, o], i) => {
            const x = 6 + (i % 2) * 428
            const y = 10 + Math.floor(i / 2) * 176
            return (
              <g key={r}>
                <Shape x={x} y={y} w={418} h={160} tone={i < 2 ? 'soft' : 'box'} />
                <Lines x={x + 209} y={y + 38} lines={[r]} size={20} weight={700} />
                <Lines x={x + 209} y={y + 100} lines={o} size={18} ink="accent" weight={600} />
              </g>
            )
          })}
          <Shape x={6} y={368} w={848} h={88} tone="panel" />
          <Lines x={430} y={412} lines={['Decision rules with a tie-break · communication norms', 'apply to the whole team']} size={18} weight={600} />
          <text x={8} y={496} fontSize={16} className="f-muted">
            ENT enterprise · PRT part inside the SoI boundary · EXT external system · REL relationship.
          </text>
          <text x={8} y={526} fontSize={16} className="f-muted">
            Three-person team: AI &amp; Data Management merges with Architecture (course convention).
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ why each method, and what it feeds (A21 item 4)
export function MethodsWhyFigure({ alt }: { alt: string }) {
  const RH = 64
  const Y0 = 58
  const cols = [
    { h: 'Method', x: 12, w: 300 },
    { h: 'Why we do it', x: 322, w: 470 },
    { h: 'What it feeds (Week 2, Week 8)', x: 802, w: 630 },
  ]
  return (
    <Svg w={1440} h={Y0 + WEEK1_METHODS.length * RH + 46} alt={alt}>
      {() => (
        <>
          {cols.map((c) => (
            <text key={c.h} x={c.x + 12} y={32} fontSize={22} fontWeight={700} dominantBaseline="central" className="f-label">
              {c.h}
            </text>
          ))}
          {WEEK1_METHODS.map((m, i) => {
            const y = Y0 + i * RH
            return (
              <g key={m.id}>
                <Shape x={cols[0].x} y={y + 4} w={cols[0].w} h={RH - 8} tone={i < 5 ? 'box' : 'soft'} />
                <Lines x={cols[0].x + 16} y={y + RH / 2} lines={[m.method]} size={22} weight={700} anchor="start" />
                <Lines x={cols[1].x + 12} y={y + RH / 2} lines={[m.whyShort]} size={22} anchor="start" />
                <Lines x={cols[2].x + 12} y={y + RH / 2} lines={[m.feedsShort]} size={22} anchor="start" ink="accent" weight={600} />
              </g>
            )
          })}
          <Lines x={12} y={Y0 + WEEK1_METHODS.length * RH + 22} lines={['Shaded: taught in Session 2. Each “why” is sourced in the notes; the “feeds” column is course design.']} size={18} anchor="start" ink="muted" />
        </>
      )}
    </Svg>
  )
}
