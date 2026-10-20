// Week 2, Session 1 lecture figures (ConOps, operational scenarios, capabilities, the first requirements). Original
// drawings: none redraws a SEBoK, MITRE, DoD or IEEE figure. Every label comes from the Week 2 figure specification or
// from the case modules: src/content/lectures/week02/aerolinkCase.ts (scenarios, coverage, capabilities, discoveries,
// requirements, the turnaround budget), src/content/lectures/week02/labBrief.ts (the scenario template fields, the
// scenario kinds) and, read-only, src/content/lectures/week01/aerolinkCase.ts (needs, external systems). AeroLink is
// FICTIONAL; a figure adds no claim of its own. Static SVG with the shared theme classes (flow.css: f-shape, f-soft,
// f-panel, f-env, f-label, f-muted, f-accent-ink, f-arrow, f-divider) and theme variables (--wb-warn, --wb-warn-soft,
// --wb-accent), so the light and dark themes are both designed once; meaning is never carried by color alone (dash
// patterns, outlines, labels). The small helpers are copied from the Week 1 figures, not imported (separate owners).
// Review status: new-pending-review.
import { useId, type ReactNode } from 'react'
import { Markers } from './Frame'
import { CANDIDATE_SCENARIOS, CAPABILITIES, CHAIN_NEED004, DISCOVERIES, NEEDS, NEED_COVERAGE, SCENARIOS, SCENARIO_SOI, STAKEHOLDER_REQUIREMENTS, TURNAROUND_BUDGET, UNCERTAINTIES, capability, need, requirement, scenario, scenariosOfCapability, type CaseScenario } from '../../content/lectures/week02/aerolinkCase'
import { SCENARIO_FIELDS, SCENARIO_KINDS } from '../../content/lectures/week02/labBrief'
import { EXTERNAL_SYSTEMS } from '../../content/lectures/week01/aerolinkCase'

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
function Lines({ x, y, lines, size = 17, anchor = 'middle', weight = 500, ink = 'ink', lh = 1.25, italic = false }: { x: number; y: number; lines: string[]; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; ink?: Ink; lh?: number; italic?: boolean }) {
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
function Card({ x, y, w, h, lines, tone = 'box', size = 17, weight = 500, ink, strong = false }: { x: number; y: number; w: number; h: number; lines: string[]; tone?: Tone; size?: number; weight?: number; ink?: Ink; strong?: boolean }) {
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

/** Greedy word wrap by character count (≈ 0.55 × font size per character). */
function wrap(text: string, max: number): string[] {
  const out: string[] = []
  let cur = ''
  for (const w of text.split(' ')) {
    if (!cur) cur = w
    else if (`${cur} ${w}`.length <= max) cur = `${cur} ${w}`
    else {
      out.push(cur)
      cur = w
    }
  }
  if (cur) out.push(cur)
  return out
}

/** A small rounded tag with one line of text, centered on (cx, cy). */
function Chip({ cx, cy, text, size = 16, tone = 'box', ink = 'ink', weight = 600 }: { cx: number; cy: number; text: string; size?: number; tone?: Tone; ink?: Ink; weight?: number }) {
  const w = text.length * size * 0.56 + 18
  const h = size + 12
  return (
    <g>
      <Shape x={cx - w / 2} y={cy - h / 2} w={w} h={h} tone={tone} rx={h / 2} />
      <Lines x={cx} y={cy} lines={[text]} size={size} weight={weight} ink={ink} />
    </g>
  )
}

/** A numbered round badge with a text label beside, above or below it. */
function Badge({ cx, cy, n, label, pos = 'right' }: { cx: number; cy: number; n: number; label: string; pos?: 'left' | 'right' | 'below' | 'above' }) {
  const r = 15
  const lx = pos === 'right' ? cx + r + 5 : pos === 'left' ? cx - r - 5 : cx
  const ly = pos === 'below' ? cy + r + 14 : pos === 'above' ? cy - r - 14 : cy
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} style={{ fill: 'var(--wb-accent)', stroke: 'var(--wb-panel)', strokeWidth: 2 }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={700} style={{ fill: 'var(--wb-panel)' }}>
        {n}
      </text>
      <text x={lx} y={ly} textAnchor={pos === 'right' ? 'start' : pos === 'left' ? 'end' : 'middle'} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-accent-ink">
        {label}
      </text>
    </g>
  )
}

/** A horizontal bracket with end ticks pointing down and a label above. */
function Bracket({ x1, x2, y, label, ink = 'ink', dashed = false }: { x1: number; x2: number; y: number; label: string; ink?: Ink; dashed?: boolean }) {
  const stroke = ink === 'accent' ? 'var(--wb-accent)' : ink === 'warn' ? 'var(--wb-warn)' : 'var(--wb-muted)'
  return (
    <g>
      <path d={`M ${x1} ${y + 12} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y + 12}`} fill="none" style={{ stroke, strokeWidth: 2.2 }} strokeDasharray={dashed ? '6 4' : undefined} />
      <Lines x={(x1 + x2) / 2} y={y - 18} lines={[label]} size={18} weight={700} ink={ink} />
    </g>
  )
}

/** A stick figure standing with its head centered at (x, y). */
function Stick({ x, y, s = 1, phone = false }: { x: number; y: number; s?: number; phone?: boolean }) {
  const st = { stroke: 'var(--wb-fg)', strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round' as const }
  return (
    <g>
      <circle cx={x} cy={y} r={11 * s} style={{ ...st, fill: 'var(--wb-panel)' }} />
      <path d={`M ${x} ${y + 11 * s} L ${x} ${y + 46 * s} M ${x - 20 * s} ${y + 24 * s} L ${x + 20 * s} ${y + 24 * s} M ${x} ${y + 46 * s} L ${x - 15 * s} ${y + 72 * s} M ${x} ${y + 46 * s} L ${x + 15 * s} ${y + 72 * s}`} style={st} />
      {phone && <rect x={x + 18 * s} y={y + 12 * s} width={9 * s} height={15 * s} rx={2} style={{ fill: 'var(--wb-fg)' }} />}
    </g>
  )
}

/** A document icon (folded corner) with lines of text inside. */
function Doc({ x, y, w, h, lines, size = 17, tone = 'box' }: { x: number; y: number; w: number; h: number; lines: string[]; size?: number; tone?: Tone }) {
  const f = 16
  const cls = tone === 'soft' ? 'f-soft' : undefined
  return (
    <g className={cls}>
      <path d={`M ${x} ${y} L ${x + w - f} ${y} L ${x + w} ${y + f} L ${x + w} ${y + h} L ${x} ${y + h} Z`} className="f-shape" style={{ strokeWidth: 1.8 }} />
      <path d={`M ${x + w - f} ${y} L ${x + w - f} ${y + f} L ${x + w} ${y + f}`} className="f-shape" style={{ strokeWidth: 1.4 }} />
      <Lines x={x + w / 2} y={y + h / 2 + 4} lines={lines} size={size} weight={700} />
    </g>
  )
}

/** A storyboard frame of three sketch panels (person with a phone, aircraft, pad). */
function Storyboard({ x, y, w, h, strong = false }: { x: number; y: number; w: number; h: number; strong?: boolean }) {
  const pw = (w - 32) / 3
  const ph = h - 20
  const st = { stroke: 'var(--wb-fg)', strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const }
  return (
    <g>
      <Shape x={x} y={y} w={w} h={h} tone={strong ? 'soft' : 'panel'} strong={strong} />
      {[0, 1, 2].map((i) => {
        const px = x + 8 + i * (pw + 8)
        const cx = px + pw / 2
        const cy = y + 10 + ph / 2
        return (
          <g key={i}>
            <rect x={px} y={y + 10} width={pw} height={ph} rx={4} className="f-shape" />
            {i === 0 && <Stick x={cx - 6} y={cy - 22} s={0.55} phone />}
            {i === 1 && (
              <g>
                <ellipse cx={cx} cy={cy} rx={pw * 0.28} ry={8} style={st} />
                <path d={`M ${cx - pw * 0.36} ${cy - 16} L ${cx - pw * 0.08} ${cy - 16} M ${cx + pw * 0.08} ${cy - 16} L ${cx + pw * 0.36} ${cy - 16} M ${cx - pw * 0.22} ${cy - 16} L ${cx - pw * 0.22} ${cy - 7} M ${cx + pw * 0.22} ${cy - 16} L ${cx + pw * 0.22} ${cy - 7}`} style={st} />
              </g>
            )}
            {i === 2 && (
              <g>
                <path d={`M ${px + 8} ${cy + 18} L ${px + pw - 8} ${cy + 18}`} style={st} />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={700} className="f-label">
                  H
                </text>
              </g>
            )}
          </g>
        )
      })}
    </g>
  )
}

/** A stack of three cards, the top one at (x, y). */
function CardStack({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children: ReactNode }) {
  return (
    <g>
      {[3, 2, 1].map((k) => (
        <Shape key={k} x={x + k * 9} y={y - k * 9} w={w} h={h} tone="env" />
      ))}
      <Shape x={x} y={y} w={w} h={h} tone="soft" strong />
      {children}
    </g>
  )
}

/** A five-pointed star centered at (cx, cy). */
function starPoints(cx: number, cy: number, r: number) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 === 0 ? r : r * 0.45
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

const ext = (id: string) => EXTERNAL_SYSTEMS.find((e) => e.id === id)?.short ?? id

// Size rule for these figures (checked in the viewer at 1600 × 900): figures beside bullets use a viewBox about
// 860 wide with text of at least 16 units; full-width figures use a viewBox 1200–1440 wide, with text of at least 17
// units. Both render at roughly 12 px or more on the slide stage and about 10 pt or more in the .pptx.

// ------------------------------------------------------------------------------------------------ S1.1 the week band (full width)
export function WeekBandFigure({ alt }: { alt: string }) {
  const w1 = [['team', 'charter'], ['enterprise', 'proposal'], ['boundary', 'and context'], ['stakeholder', 'register'], ['initial', 'needs']]
  const w2 = [['ConOps and', 'scenarios'], ['Capabilities'], ['Requirements', 'and measures']]
  const Y = 100
  const H = 150
  const mid = Y + H / 2
  return (
    <Svg w={1400} h={340} alt={alt}>
      {(id) => (
        <>
          <Bracket x1={10} x2={652} y={70} label="Week 1 Team Record" ink="muted" />
          {w1.map((l, i) => (
            <Card key={i} x={10 + i * 130} y={Y} w={122} h={H} lines={l} tone="env" ink="muted" size={17} />
          ))}
          <Bracket x1={686} x2={1204} y={70} label="Week 2 additions to your Team Record" ink="accent" />
          {w2.map((l, i) => {
            const x = 686 + i * 184
            return (
              <g key={i}>
                <Arrow id={id} d={`M ${x - 32} ${mid} L ${x - 4} ${mid}`} tone="accent" width={2.6} />
                <Card x={x} y={Y} w={150} h={H} lines={l} tone="soft" strong size={18} weight={700} />
              </g>
            )
          })}
          <Arrow id={id} d={`M 1208 ${mid} L 1232 ${mid - 42}`} tone="muted" dashed />
          <Arrow id={id} d={`M 1208 ${mid} L 1232 ${mid + 42}`} tone="muted" dashed />
          <Card x={1236} y={mid - 80} w={158} h={74} tone="dash" ink="muted" lines={['Week 9:', 'requirements in', 'SysML v2']} size={17} />
          <Card x={1236} y={mid + 6} w={158} h={74} tone="dash" ink="muted" lines={['Week 10:', 'scenarios as', 'behavior']} size={17} />
          <text x={10} y={312} fontSize={17} className="f-muted">
            Thin outline: done in Week 1 · bold outline: added in Week 2 · dashed: where this work is used later in the course
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.2 the driving question
export function DrivingQuestionFigure({ alt }: { alt: string }) {
  const n4 = need('NEED-004')
  return (
    <Svg w={860} h={540} alt={alt}>
      {(id) => (
        <>
          <CardStack x={20} y={130} w={262} h={170}>
            <Lines x={151} y={170} lines={[n4.id]} size={20} weight={700} />
            <Lines x={151} y={232} lines={wrap(n4.name, 22)} size={18} />
          </CardStack>
          <text x={160} y={330} textAnchor="middle" fontSize={17} className="f-muted">
            {`${NEEDS.length} needs, recommended form (Week 1)`}
          </text>
          <rect x={520} y={110} width={330} height={214} rx={6} className="f-shape" />
          <rect x={520} y={110} width={330} height={46} rx={6} className="f-panel" />
          {[156, 212, 268].map((y) => (
            <line key={y} x1={520} y1={y} x2={850} y2={y} className="f-axis" />
          ))}
          <line x1={610} y1={110} x2={610} y2={324} className="f-axis" />
          <line x1={765} y1={110} x2={765} y2={324} className="f-axis" />
          <Lines x={565} y={133} lines={['ID']} size={17} weight={700} />
          <Lines x={687} y={133} lines={['Statement']} size={17} weight={700} />
          <Lines x={807} y={133} lines={['Parent']} size={17} weight={700} />
          <Arrow id={id} d="M 318 200 L 512 200" width={2.6} />
          <text x={414} y={180} textAnchor="middle" fontSize={24} fontWeight={700} className="f-label">
            shall?
          </text>
          <Arrow id={id} d="M 160 346 C 160 420, 200 452, 284 452" tone="muted" dashed />
          <Storyboard x={290} y={400} w={250} h={104} />
          <Arrow id={id} d="M 546 452 C 660 452, 685 420, 685 332" tone="muted" dashed />
          <text x={415} y={368} textAnchor="middle" dominantBaseline="central" fontSize={44} fontWeight={700} className="f-accent-ink">
            ?
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.3 the 15288 technical processes and the inputs
const PROCESS_CELLS: string[][] = [
  ['Business or', 'Mission', 'Analysis'],
  ['Stakeholder', 'Needs and', 'Requirements', 'Definition'],
  ['System', 'Requirements', 'Definition'],
  ['Architecture', 'Definition'],
  ['Design', 'Definition'],
  ['System', 'Analysis'],
  ['Implemen-', 'tation'],
  ['Integration'],
  ['Verification'],
  ['Transition'],
  ['Validation'],
  ['Operation'],
  ['Maintenance'],
  ['Disposal'],
]
export function ProcessInputsFigure({ alt }: { alt: string }) {
  const CW = 116
  const PITCH = 122
  const H = 150
  return (
    <Svg w={860} h={526} alt={alt}>
      {(id) => (
        <>
          <text x={6} y={22} fontSize={17} className="f-muted">
            ISO/IEC/IEEE 15288:2015 technical processes, as SEBoK lists them
          </text>
          <Card x={16} y={46} w={250} h={80} tone="box" lines={['integrated set of needs', '(Week 1)']} size={17} />
          <Card x={300} y={46} w={340} h={80} tone="soft" lines={['life-cycle concepts, incl. the', 'operational concept (this week)']} size={17} />
          <Arrow id={id} d="M 141 128 L 292 192" tone="accent" width={2.6} />
          <Arrow id={id} d="M 470 128 L 330 192" tone="accent" width={2.6} />
          {PROCESS_CELLS.map((lines, i) => {
            const x = 6 + (i % 7) * PITCH
            const y = i < 7 ? 196 : 362
            const tag = i < 2 ? 'Week 1' : i === 2 ? 'Week 2' : ''
            return (
              <g key={i}>
                <Shape x={x} y={y} w={CW} h={H} tone={i === 2 ? 'soft' : 'box'} strong={i === 2} />
                <text x={x + 10} y={y + 18} dominantBaseline="central" fontSize={16} fontWeight={700} className="f-muted">
                  {i + 1}
                </text>
                <Lines x={x + CW / 2} y={y + 72} lines={lines} size={16} lh={1.2} weight={i === 2 ? 700 : 500} />
                {tag && <Chip cx={x + CW / 2} cy={y + H - 18} text={tag} size={16} tone={i === 2 ? 'soft' : 'env'} ink={i === 2 ? 'accent' : 'muted'} weight={700} />}
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.4 need or requirement (the mirror)
export function MirrorFigure({ alt }: { alt: string }) {
  const n3 = need('NEED-003')
  const body = wrap(n3.statement, 34)
  return (
    <Svg w={860} h={480} alt={alt}>
      {(id) => (
        <>
          <Shape x={6} y={6} w={344} h={468} tone="panel" />
          <Shape x={510} y={6} w={344} h={468} tone="panel" />
          <Lines x={178} y={46} lines={['Need: stakeholder’s view,', 'black box, outside']} size={18} weight={700} />
          <Lines x={682} y={46} lines={['Requirement: developer’s', 'view, white box, inside']} size={18} weight={700} />
          <Shape x={22} y={104} w={312} h={330} tone="soft" />
          <Lines x={178} y={168} lines={[n3.id]} size={18} weight={700} />
          <Lines x={178} y={300} lines={body} size={17} />
          <Shape x={526} y={150} w={312} h={220} tone="dash" />
          <Lines x={682} y={200} lines={['written this week:']} size={17} ink="muted" />
          <Lines x={682} y={272} lines={['The AeroLink service', 'shall …']} size={20} weight={600} />
          <Arrow id={id} d="M 358 280 L 502 280" tone="accent" width={3} />
          <Lines x={430} y={236} lines={['transformation', '= analysis']} size={17} weight={700} ink="accent" />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.5 the ConOps as a living document
export function ConopsTimelineFigure({ alt }: { alt: string }) {
  const stages: [number, string[]][] = [
    [70, ['Concept']],
    [230, ['Development']],
    [390, ['developmental', 'testing']],
    [570, ['operational', 'testing']],
    [760, ['Operation']],
  ]
  const docs: [number, string][] = [
    [70, 'v1'],
    [480, 'v2'],
    [665, 'v3'],
  ]
  return (
    <Svg w={860} h={460} alt={alt}>
      {(id) => (
        <>
          <Arrow id={id} d="M 24 200 L 846 200" width={3} />
          {stages.map(([x, l]) => (
            <g key={x}>
              <circle cx={x} cy={200} r={7} style={{ fill: 'var(--wb-fg)' }} />
              <Lines x={x} y={l.length > 1 ? 156 : 166} lines={l} size={17} weight={600} />
            </g>
          ))}
          {docs.map(([x, v]) => (
            <g key={v}>
              <line x1={x} y1={204} x2={x} y2={224} style={{ stroke: 'var(--wb-muted)', strokeWidth: 1.6 }} />
              <Doc x={x - 37} y={226} w={74} h={90} lines={['ConOps', v]} size={17} tone={v === 'v1' ? 'soft' : 'box'} />
            </g>
          ))}
          <Arrow id={id} d="M 110 270 L 438 270" tone="muted" dashed />
          <Arrow id={id} d="M 520 270 L 623 270" tone="muted" dashed />
          <text x={275} y={238} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} fontStyle="italic" className="f-accent-ink">
            a living document
          </text>
          <Arrow id={id} d="M 58 320 L 92 374" tone="accent" width={2.4} />
          <Arrow id={id} d="M 86 320 L 296 374" tone="accent" width={2.4} />
          <Card x={14} y={378} w={180} h={58} lines={['requirements']} size={18} />
          <Card x={222} y={378} w={180} h={58} lines={['test planning']} size={18} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.6 concept of operations vs operational concept
export function ConopsLevelsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={860} h={470} alt={alt}>
      {() => (
        <>
          <Shape x={6} y={8} w={848} h={392} tone="panel" />
          <text x={24} y={42} fontSize={20} fontWeight={700} className="f-label">
            Concept of operations:
          </text>
          <Lines x={24} y={86} anchor="start" lines={['an organization’s assumptions or intent for an operation or series of operations', '(enterprise level)']} size={17} />
          <Shape x={100} y={150} w={660} h={196} tone="soft" strong />
          <text x={124} y={196} fontSize={20} fontWeight={700} className="f-label">
            Operational concept:
          </text>
          <Lines x={124} y={240} anchor="start" lines={['the operation of a system or related set of systems, from the', 'users’ and operators’ view (system level)']} size={17} />
          <Chip cx={620} cy={150} text="MITRE’s CONOPS sits here" size={16} tone="box" />
          <polygon points={starPoints(144, 306, 15)} style={{ fill: 'var(--wb-accent)' }} />
          <text x={168} y={306} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-accent-ink">
            Your Week 2 ConOps (course convention)
          </text>
          <text x={430} y={442} textAnchor="middle" fontSize={17} className="f-muted">
            SEBoK: the two are ‘slightly different’
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.7 what a ConOps contains
export function ConopsTocFigure({ alt }: { alt: string }) {
  const items = [['1 Existing situation'], ['2 Justification and', 'restrictions'], ['3 Proposed system'], ['4 Operational environment', 'and constraints'], ['5 User interactions'], ['6 Operational scenarios']]
  const tags = [['traceability: needs ↔', 'source requirements'], ['basis for requirements'], ['basis for test planning'], ['system capacity'], ['discover implicit', 'requirements']]
  const R0 = 84
  const RH = 74
  const cy = (i: number) => R0 + i * RH + RH / 2
  const BX = 258
  const brk = (y1: number, y2: number, dashed = false) => (
    <path d={`M ${BX + 8} ${y1} L ${BX} ${y1} L ${BX} ${y2} L ${BX + 8} ${y2}`} fill="none" style={{ stroke: dashed ? 'var(--wb-muted)' : 'var(--wb-fg)', strokeWidth: 2.2 }} strokeDasharray={dashed ? '6 4' : undefined} />
  )
  const lead = { stroke: 'var(--wb-fg)', strokeWidth: 1.6, fill: 'none' }
  return (
    <Svg w={860} h={556} alt={alt}>
      {() => (
        <>
          <Shape x={270} y={20} w={300} h={520} tone="box" strong />
          <text x={290} y={56} fontSize={20} fontWeight={700} className="f-label">
            ConOps: contents
          </text>
          <line x1={286} y1={76} x2={554} y2={76} className="f-axis" />
          {items.map((l, i) => (
            <g key={i}>
              {i > 0 && <line x1={286} y1={R0 + i * RH} x2={554} y2={R0 + i * RH} className="f-divider" />}
              <Lines x={290} y={cy(i)} anchor="start" lines={l} size={17} />
            </g>
          ))}
          {brk(R0 + 6, R0 + 3 * RH - 6)}
          {brk(R0 + 5 * RH + 6, R0 + 6 * RH - 6)}
          {brk(R0 + 3 * RH + 6, R0 + 5 * RH - 6, true)}
          <Lines x={236} y={cy(1)} anchor="end" lines={['critical components', '(MITRE, from', 'IEEE 1362)']} size={17} weight={700} />
          <path d={`M 240 ${cy(1)} L ${BX} ${cy(1)}`} style={lead} />
          <path d={`M 244 ${cy(1)} L 244 ${cy(3) + RH / 2 - 14}`} style={lead} />
          <path d={`M 244 ${cy(3) + RH / 2 + 14} L 244 ${cy(5)} L ${BX} ${cy(5)}`} style={lead} />
          <Lines x={232} y={cy(3) + RH / 2} anchor="end" lines={['course', 'deliverable', 'contents']} size={17} weight={700} ink="muted" />
          <path d={`M 236 ${cy(3) + RH / 2} L ${BX} ${cy(3) + RH / 2}`} style={{ ...lead, stroke: 'var(--wb-muted)' }} strokeDasharray="5 4" />
          {tags.map((l, i) => {
            const y = 110 + i * 92
            return (
              <g key={i}>
                <line x1={604} y1={y} x2={574} y2={280} style={{ stroke: 'var(--wb-muted)', strokeWidth: 1.2 }} />
                <Card x={606} y={y - 32} w={248} h={64} tone="soft" lines={l} size={16} />
              </g>
            )
          })}
          <circle cx={572} cy={280} r={4} style={{ fill: 'var(--wb-muted)' }} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.8 writing in the user's language
export function BeforeAfterFigure({ alt }: { alt: string }) {
  const before = 'On REQ trigger the dispatcher service runs the assignment heuristic over the SOC-qualified pool and pushes a slot to the client.'
  const after = 'When you confirm a ride, we assign an aircraft with enough charge and send you your pad and boarding time within a minute.'
  const tag = 'instructor-written example (FICTIONAL)'
  return (
    <Svg w={860} h={530} alt={alt}>
      {(id) => (
        <>
          <Shape x={6} y={20} w={848} h={160} tone="env" />
          <text x={24} y={52} fontSize={19} fontWeight={700} className="f-label">
            Before: engineer’s jargon
          </text>
          <Lines x={24} y={104} anchor="start" lines={wrap(before, 76)} size={18} />
          <text x={838} y={160} textAnchor="end" fontSize={16} className="f-muted">
            {tag}
          </text>
          <Arrow id={id} d="M 430 184 L 430 220" tone="accent" width={3} />
          <Shape x={6} y={226} w={848} h={160} tone="soft" strong />
          <text x={24} y={258} fontSize={19} fontWeight={700} className="f-label">
            After: the passenger’s and operator’s words
          </text>
          <Lines x={24} y={310} anchor="start" lines={wrap(after, 76)} size={18} />
          <text x={838} y={366} textAnchor="end" fontSize={16} className="f-muted">
            {tag}
          </text>
          <line x1={150} y1={390} x2={150} y2={426} style={{ stroke: 'var(--wb-muted)', strokeWidth: 1.6 }} strokeDasharray="4 4" />
          <Shape x={40} y={428} w={780} h={86} tone="dash" />
          <Lines x={60} y={471} anchor="start" lines={['Glossary: dispatch-ready = charged to the dispatch threshold,', 'with no open no-go fault.']} size={18} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.9 OV-1-style storyboard (full width)
export function Ov1StoryboardFigure({ alt }: { alt: string }) {
  const V: Record<string, [number, number]> = { V1: [470, 370], V2: [690, 250], V3: [860, 380], V4: [640, 480], V5: [1040, 250], V6: [1100, 490] }
  const hubs = ['V1', 'V3', 'V5']
  const links: [string, string][] = [
    ['V2', 'V3'],
    ['V1', 'V4'],
    ['V4', 'V3'],
    ['V3', 'V5'],
    ['V3', 'V6'],
    ['V5', 'V6'],
  ]
  const [ax, ay] = V.V1
  const [bx, by] = V.V2
  const mx = (ax + bx) / 2
  const my = (ay + by) / 2
  const cloud = (cx: number, cy: number) => `M ${cx - 62} ${cy + 22} A 20 20 0 0 1 ${cx - 48} ${cy - 12} A 30 30 0 0 1 ${cx + 6} ${cy - 26} A 28 28 0 0 1 ${cx + 52} ${cy - 6} A 18 18 0 0 1 ${cx + 62} ${cy + 22} Z`
  const thin = { stroke: 'var(--wb-muted)', strokeWidth: 1.6 }
  const ink = { stroke: 'var(--wb-fg)', strokeWidth: 2, fill: 'none' }
  const pylons = [1380, 1220, 1060, 900, 740, 600, 470]
  return (
    <Svg w={1440} h={600} alt={alt}>
      {(id) => (
        <>
          {/* controlled airspace dome */}
          <path d="M 250 556 C 250 -60, 1210 -60, 1210 556" fill="none" style={{ stroke: 'var(--wb-accent)', strokeWidth: 2 }} strokeDasharray="10 7" />
          <text x={750} y={138} textAnchor="middle" fontSize={18} fontWeight={700} className="f-accent-ink">
            {ext('EXT-001')}
          </text>
          {/* electric grid: a power line along the ground with drops to the hubs */}
          <line x1={460} y1={584} x2={1436} y2={584} style={{ stroke: 'var(--wb-fg)', strokeWidth: 2.6 }} />
          {pylons.map((x) => (
            <path key={x} d={`M ${x - 8} 596 L ${x} 572 L ${x + 8} 596 M ${x - 10} 578 L ${x + 10} 578`} style={ink} />
          ))}
          {[
            [470, 388],
            [880, 398],
            [1060, 268],
          ].map(([x, y]) => (
            <line key={x} x1={x} y1={584} x2={x} y2={y} style={thin} strokeDasharray="5 4" />
          ))}
          <text x={1428} y={560} textAnchor="end" fontSize={17} fontWeight={700} className="f-label">
            {ext('EXT-002')}
          </text>
          {/* public transport */}
          <line x1={20} y1={536} x2={600} y2={536} style={ink} />
          <line x1={20} y1={548} x2={600} y2={548} style={ink} />
          {Array.from({ length: 29 }, (_, i) => 30 + i * 20).map((x) => (
            <line key={x} x1={x} y1={532} x2={x} y2={552} style={thin} />
          ))}
          <circle cx={612} cy={542} r={8} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2 }} />
          <text x={24} y={516} fontSize={17} fontWeight={700} className="f-label">
            {ext('EXT-005')}
          </text>
          {/* network links */}
          {links.map(([a, b]) => (
            <line key={a + b} x1={V[a][0]} y1={V[a][1]} x2={V[b][0]} y2={V[b][1]} style={thin} />
          ))}
          <line x1={ax} y1={ay} x2={bx} y2={by} style={{ stroke: 'var(--wb-accent)', strokeWidth: 5 }} />
          {/* weather */}
          <path d={cloud(860, 262)} className="f-shape" style={{ strokeWidth: 2 }} />
          <text x={860} y={268} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
            {ext('EXT-003')}
          </text>
          {/* vertiports */}
          {Object.entries(V).map(([k, [x, y]]) =>
            hubs.includes(k) ? (
              <g key={k}>
                <Shape x={x - 42} y={y - 18} w={84} h={36} tone="soft" strong rx={6} />
                <Lines x={x} y={y} lines={[`${k} · hub`]} size={16} weight={700} />
              </g>
            ) : (
              <g key={k}>
                <circle cx={x} cy={y} r={22} className="f-shape" style={{ strokeWidth: 2 }} />
                <Lines x={x} y={y} lines={[k]} size={16} weight={700} />
              </g>
            ),
          )}
          {/* aircraft on the V1–V2 leg */}
          <g>
            {[
              [-13, -10],
              [13, -10],
              [-13, 10],
              [13, 10],
            ].map(([dx, dy]) => (
              <circle key={`${dx}${dy}`} cx={mx + dx} cy={my + dy} r={7} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 1.6 }} />
            ))}
            <rect x={mx - 7} y={my - 12} width={14} height={24} rx={6} style={{ fill: 'var(--wb-fg)' }} />
          </g>
          <text x={mx - 22} y={my - 34} textAnchor="end" fontSize={17} fontWeight={700} className="f-accent-ink">
            25 km, about 10 min
          </text>
          {/* hub charger at V3 */}
          <line x1={860} y1={398} x2={860} y2={414} style={ink} />
          <rect x={849} y={414} width={22} height={28} rx={3} className="f-shape" style={{ strokeWidth: 2 }} />
          <path d="M 862 418 L 855 430 L 862 430 L 857 439" style={{ ...ink, strokeWidth: 1.8 }} />
          {/* passenger with a phone near V1 */}
          <Stick x={404} y={432} s={0.8} phone />
          {/* operations center */}
          <path d="M 150 250 L 150 196 L 210 172 L 270 196 L 270 250 Z" className="f-shape" style={{ strokeWidth: 2 }} />
          {[166, 196, 226].map((x) => (
            <rect key={x} x={x} y={206} width={22} height={16} rx={2} className="f-panel" />
          ))}
          <text x={210} y={274} textAnchor="middle" fontSize={17} fontWeight={700} className="f-label">
            Operations center
          </text>
          {/* emergency response service */}
          <rect x={120} y={326} width={100} height={60} rx={4} className="f-shape" style={{ strokeWidth: 2 }} />
          <path d="M 170 338 L 170 374 M 152 356 L 188 356" style={{ stroke: 'var(--wb-fg)', strokeWidth: 6 }} />
          <Lines x={170} y={418} lines={wrap(ext('EXT-006'), 16)} size={17} weight={700} />
          {/* maintenance hangar and supply */}
          <path d="M 1222 404 L 1222 360 A 58 34 0 0 1 1338 360 L 1338 404 Z" className="f-shape" style={{ strokeWidth: 2 }} />
          <rect x={1262} y={374} width={36} height={30} className="f-panel" />
          <text x={1280} y={428} textAnchor="middle" fontSize={17} fontWeight={700} className="f-label">
            Maintenance hangar
          </text>
          <Card x={1230} y={156} w={196} h={70} lines={wrap(ext('EXT-004'), 14)} size={17} weight={600} />
          <Arrow id={id} d="M 1300 228 L 1288 322" />
          {/* corner panel */}
          <Shape x={10} y={10} w={292} h={138} tone="panel" />
          <Lines x={24} y={79} anchor="start" lines={['12 aircraft × 4 seats', '16 h day', '20 % energy reserve', '65 dBA per event', '(FICTIONAL)']} size={17} lh={1.2} />
          <text x={1430} y={26} textAnchor="end" fontSize={16} className="f-muted">
            original drawing in the style of an OV-1 overview
          </text>
          {/* scenario badges */}
          <Badge cx={350} cy={462} n={1} label={SCENARIOS[0].id} pos="below" />
          <Badge cx={mx + 44} cy={my + 22} n={2} label={SCENARIOS[1].id} pos="right" />
          <Badge cx={860} cy={472} n={3} label={SCENARIOS[2].id} pos="left" />
          <Badge cx={1396} cy={352} n={4} label={SCENARIOS[3].id} pos="below" />
          <Badge cx={846} cy={208} n={5} label={SCENARIOS[4].id} pos="right" />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.10 use case, actors, threads
export function ActorsThreadsFigure({ alt }: { alt: string }) {
  const T: [number, number] = [292, 190]
  const G: [number, number] = [636, 190]
  const F: [number, number] = [600, 316]
  return (
    <Svg w={860} h={500} alt={alt}>
      {(id) => (
        <>
          <rect x={220} y={20} width={440} height={466} rx={8} className="f-boundary" />
          <text x={236} y={46} fontSize={18} fontWeight={700} className="f-accent-ink">
            system of interest
          </text>
          <Stick x={108} y={150} s={1.2} />
          <Lines x={108} y={290} lines={['primary actor', '(has a goal that needs', 'the system’s help)']} size={16} />
          <line x1={134} y1={186} x2={326} y2={164} className="f-arrow" />
          <Shape x={676} y={300} w={176} h={60} tone="box" strong />
          <Lines x={764} y={330} lines={['secondary actor']} size={17} weight={700} />
          <Lines x={764} y={392} lines={['(the system needs', 'its help)']} size={16} />
          <line x1={562} y1={238} x2={676} y2={318} className="f-arrow" />
          <ellipse cx={460} cy={190} rx={140} ry={70} className="f-shape" style={{ strokeWidth: 2 }} />
          <text x={470} y={224} textAnchor="middle" fontSize={16} className="f-muted">
            use case
          </text>
          <Arrow id={id} d={`M ${T[0] + 8} ${T[1]} L ${G[0] - 14} ${G[1]}`} tone="accent" width={3} />
          <Arrow id={id} d={`M ${T[0] + 6} ${T[1] - 6} C 360 116, 550 110, ${G[0] - 10} ${G[1] - 10}`} tone="accent" dashed width={2.4} />
          <path d={`M ${T[0] + 6} ${T[1] + 6} C 340 300, 480 316, ${F[0] - 8} ${F[1]}`} fill="none" style={{ stroke: 'var(--wb-warn)', strokeWidth: 2.6 }} strokeDasharray="2 5" strokeLinecap="round" />
          <path d={`M ${F[0] - 9} ${F[1] - 9} L ${F[0] + 9} ${F[1] + 9} M ${F[0] + 9} ${F[1] - 9} L ${F[0] - 9} ${F[1] + 9}`} style={{ stroke: 'var(--wb-warn)', strokeWidth: 3.4 }} />
          <circle cx={T[0]} cy={T[1]} r={8} style={{ fill: 'var(--wb-fg)' }} />
          <text x={T[0] - 12} y={T[1] + 26} textAnchor="end" fontSize={16} fontWeight={700} className="f-label">
            trigger
          </text>
          <circle cx={G[0]} cy={G[1]} r={12} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-accent)', strokeWidth: 3 }} />
          <circle cx={G[0]} cy={G[1]} r={4} style={{ fill: 'var(--wb-accent)' }} />
          <text x={G[0]} y={G[1] + 30} textAnchor="middle" fontSize={16} fontWeight={700} className="f-accent-ink">
            goal
          </text>
          {[
            { y: 392, label: 'main thread → goal', st: { stroke: 'var(--wb-accent)', strokeWidth: 3 }, dash: undefined },
            { y: 422, label: 'alternate thread → goal', st: { stroke: 'var(--wb-accent)', strokeWidth: 2.4 }, dash: '7 5' },
            { y: 452, label: 'failure thread → falls short', st: { stroke: 'var(--wb-warn)', strokeWidth: 2.6 }, dash: '2 5' },
          ].map((r) => (
            <g key={r.label}>
              <line x1={240} y1={r.y} x2={300} y2={r.y} style={r.st} strokeDasharray={r.dash} strokeLinecap="round" />
              <text x={312} y={r.y} dominantBaseline="central" fontSize={17} className="f-label">
                {r.label}
              </text>
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.11 the course scenario template
export function ScenarioCardFigure({ alt }: { alt: string }) {
  const L = (fid: string) => SCENARIO_FIELDS.find((f) => f.id === fid)!.label
  const VX = 214
  const blank = (y: number, x1 = VX, x2 = 600) => <line x1={x1} y1={y + 10} x2={x2} y2={y + 10} className="f-axis" strokeDasharray="4 4" />
  const label = (y: number, t: string) => (
    <text x={24} y={y} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
      {t}
    </text>
  )
  const val = (y: number, t: string) => (
    <text x={VX} y={y} dominantBaseline="central" fontSize={17} className="f-muted">
      {t}
    </text>
  )
  const mainY = (n: number) => 222 + (n - 1) * 30
  return (
    <Svg w={860} h={590} alt={alt}>
      {(id) => (
        <>
          <Shape x={6} y={8} w={626} h={572} tone="box" strong />
          <text x={24} y={42} fontSize={19} fontWeight={700} className="f-label">
            Scenario system of interest: …
          </text>
          <line x1={20} y1={62} x2={618} y2={62} className="f-axis" />
          {label(90, L('actors'))}
          {val(90, '★ primary …   ·   …   ·   … (environment)')}
          {label(132, L('trigger'))}
          {blank(126)}
          {label(174, L('preconditions'))}
          {blank(168)}
          {label(222, L('main'))}
          {[1, 2, 3, 4, 5].map((n) => (
            <text key={n} x={VX} y={mainY(n)} dominantBaseline="central" fontSize={17} className="f-label">
              {`${n}. actor: action`}
            </text>
          ))}
          {label(384, L('alternates'))}
          {val(384, 'A1 from step 3 … rejoin at step 5')}
          {val(416, 'A2 from step 2 … ends')}
          {label(470, L('success'))}
          {blank(464, 230)}
          {label(522, L('failure'))}
          {blank(516, 230)}
          {/* branch and rejoin */}
          <Arrow id={id} d={`M 208 ${mainY(3)} C 176 ${mainY(3)}, 176 384, 204 384`} tone="accent" width={2.2} />
          <Arrow id={id} d={`M 480 380 C 572 380, 572 ${mainY(5)}, 364 ${mainY(5)}`} tone="accent" dashed width={2.2} />
          <path d={`M 646 ${mainY(3)} L 646 384`} fill="none" style={{ stroke: 'var(--wb-accent)', strokeWidth: 2 }} />
          <Lines x={660} y={(mainY(3) + 384) / 2} anchor="start" lines={['branch from step 3,', 'rejoin at step 5']} size={17} weight={700} ink="accent" />
          {/* end states */}
          <path d="M 640 456 L 652 456 L 652 536 L 640 536 M 652 496 L 662 496" fill="none" style={{ stroke: 'var(--wb-fg)', strokeWidth: 2 }} />
          <Lines x={672} y={496} anchor="start" lines={['separate success', 'and failure', 'end states']} size={17} weight={700} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.12 coverage grid
export function CoverageGridFigure({ alt }: { alt: string }) {
  const areas: { id: CaseScenario['area']; lines: string[] }[] = [
    { id: 'operation', lines: ['Operation'] },
    { id: 'logistics and maintenance', lines: ['Logistics and', 'maintenance'] },
    { id: 'exceptional', lines: ['Exceptional'] },
  ]
  const X0 = 150
  const CW = 234
  const Y0 = 76
  const RH = 156
  return (
    <Svg w={860} h={556} alt={alt}>
      {() => (
        <>
          {areas.map((a, j) => (
            <Lines key={a.id} x={X0 + j * CW + CW / 2} y={44} lines={a.lines} size={18} weight={700} />
          ))}
          {SCENARIO_KINDS.map((k, i) => {
            const y = Y0 + i * RH
            return (
              <g key={k.id}>
                <rect x={6} y={y} width={X0 - 12} height={RH - 8} rx={6} className="f-panel" />
                <Lines x={X0 / 2} y={y + RH / 2 - 4} lines={[k.label]} size={18} weight={700} />
                {areas.map((a, j) => {
                  const x = X0 + j * CW
                  const items = [
                    ...SCENARIOS.filter((s) => s.kind === k.id && s.area === a.id).map((s) => ({ key: s.id, cand: false, lines: [s.id, ...wrap(s.name, 22)] })),
                    ...CANDIDATE_SCENARIOS.filter((s) => s.kind === k.id && s.area === a.id).map((s) => ({ key: s.name, cand: true, lines: ['candidate', ...wrap(s.name, 22)] })),
                  ]
                  const hs = items.map((it) => it.lines.length * 20 + 12)
                  const gap = 8
                  const total = hs.reduce((p, c) => p + c, 0) + gap * Math.max(0, items.length - 1)
                  let cy = y + (RH - 8 - total) / 2
                  return (
                    <g key={a.id}>
                      <rect x={x + 4} y={y} width={CW - 8} height={RH - 8} rx={6} className="f-env" style={{ fill: 'none' }} />
                      {items.length === 0 && <Lines x={x + CW / 2} y={y + RH / 2 - 4} lines={['—']} size={22} ink="muted" />}
                      {items.map((it, n) => {
                        const top = cy
                        cy += hs[n] + gap
                        return (
                          <g key={it.key}>
                            <Shape x={x + 14} y={top} w={CW - 28} h={hs[n]} tone={it.cand ? 'dash' : 'soft'} />
                            {it.lines.map((l, q) => (
                              <text key={q} x={x + CW / 2} y={top + 16 + q * 20} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={q === 0 ? 700 : 500} {...(it.cand && q === 0 ? { className: 'f-muted', fontStyle: 'italic' } : { className: 'f-label' })}>
                                {l}
                              </text>
                            ))}
                          </g>
                        )
                      })}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.13 reviewing SCN-001
export function ReviewScn001Figure({ alt }: { alt: string }) {
  const s = scenario('SCN-001')
  const blocks = s.steps.map((st) => wrap(`${st.n}. ${st.actor}: ${st.text}`, 44))
  const tops: number[] = []
  let y = 76
  for (const b of blocks) {
    tops.push(y)
    y += b.length * 21 + 22
  }
  const qs = [['Complete?'], ['Actor’s goal met?'], ['Simpler by a procedure or', 'requirement change?'], ['Missing goals?'], ['Missing actors?']]
  const stepMid = (n: number) => tops[n - 1] + (blocks[n - 1].length * 21) / 2
  return (
    <Svg w={860} h={600} alt={alt}>
      {() => (
        <>
          <text x={10} y={36} fontSize={19} fontWeight={700} className="f-label">
            {`${s.id} ${s.name}: main flow`}
          </text>
          {blocks.map((b, i) => {
            const n = i + 1
            const hl = n === 3 || n === 5
            return (
              <g key={n}>
                {hl && <rect x={6} y={tops[i] - 8} width={444} height={b.length * 21 + 12} rx={6} style={n === 5 ? { fill: 'none', stroke: 'var(--wb-warn)', strokeWidth: 2.2 } : { fill: 'none', stroke: 'var(--wb-muted)', strokeWidth: 1.8 }} strokeDasharray={n === 3 ? '6 4' : undefined} />}
                {b.map((l, q) => (
                  <text key={q} x={16} y={tops[i] + 4 + q * 21} dominantBaseline="central" fontSize={17} fontWeight={q === 0 ? 600 : 500} className="f-label">
                    {l}
                  </text>
                ))}
              </g>
            )
          })}
          <Shape x={486} y={14} w={368} h={278} tone="panel" />
          <text x={504} y={46} fontSize={19} fontWeight={700} className="f-label">
            Review questions (MITRE)
          </text>
          {qs.map((q, i) => {
            const qy = 82 + i * 40 + (i > 2 ? 20 : 0)
            return (
              <g key={i}>
                <rect x={504} y={qy - 10} width={20} height={20} rx={3} className="f-shape" style={{ strokeWidth: 2 }} />
                <Lines x={536} y={qy + (q.length - 1) * 10} anchor="start" lines={q} size={17} lh={1.2} />
              </g>
            )
          })}
          {/* margin comments */}
          <Shape x={486} y={310} w={368} h={124} tone="box" />
          <Lines x={502} y={360} anchor="start" lines={['Interface detail? — No: it states', 'what the passenger learns,', 'not a screen']} size={17} />
          <Chip cx={790} cy={412} text="false alarm" size={16} tone="env" ink="muted" />
          <path d={`M 486 340 C 470 340, 466 ${stepMid(3)}, 452 ${stepMid(3)}`} fill="none" style={{ stroke: 'var(--wb-muted)', strokeWidth: 1.8 }} strokeDasharray="6 4" />
          <Shape x={486} y={456} w={368} h={124} tone="warn" />
          <Lines x={502} y={500} anchor="start" lines={['‘within 60 s’ is a performance', 'value: it belongs in a', 'requirement']} size={17} />
          <Chip cx={810} cy={558} text="valid" size={16} tone="box" ink="warn" weight={700} />
          <path d={`M 486 486 C 470 486, 466 ${stepMid(5)}, 452 ${stepMid(5)}`} fill="none" style={{ stroke: 'var(--wb-warn)', strokeWidth: 2.2 }} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.14 SCN-005 as swimlanes (full width)
const SCN005_SHORT: Record<number, string[]> = {
  1: ['1 flag V3'],
  2: ['2 declare hold'],
  3: ['3 divert to', 'alternate'],
  4: ['4 accept revised', 'intents'],
  5: ['5 notify', 'passengers'],
  6: ['6 accept new', 'time or refund'],
  7: ['7 lift hold', 'after 30 min', 'inside limits'],
}
export function Scn005SwimlaneFigure({ alt }: { alt: string }) {
  const s = scenario('SCN-005')
  const lanes = ['Duty manager', 'System', 'Pilot', 'Air traffic service', 'Passenger']
  const LY = 96
  const LH = 84
  const laneMid = (actor: string) => LY + lanes.indexOf(actor) * LH + LH / 2
  const SX = (n: number) => 196 + (n - 1) * 158
  const BW = 140
  const BH = 68
  const env = s.actors.find((a) => a.environment)
  const end = (x: number, y: number) => (
    <g>
      <circle cx={x} cy={y} r={11} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2 }} />
      <circle cx={x} cy={y} r={5} style={{ fill: 'var(--wb-fg)' }} />
    </g>
  )
  const midOf = (n: number) => laneMid(s.steps[n - 1].actor)
  return (
    <Svg w={1440} h={646} alt={alt}>
      {(id) => (
        <>
          <text x={6} y={24} fontSize={19} fontWeight={700} className="f-label">
            {`Scenario system of interest: ${SCENARIO_SOI.name}`}
          </text>
          <text x={1434} y={24} textAnchor="end" fontSize={18} fontWeight={700} className="f-muted">
            {`${s.id} ${s.name}`}
          </text>
          <rect x={6} y={42} width={1428} height={44} rx={6} className="f-panel" style={{ strokeDasharray: '6 4' }} />
          <text x={1426} y={64} textAnchor="end" dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
            {`${env?.label ?? 'Weather'} (environment)`}
          </text>
          <path d="M 210 52 L 214 62 L 206 64 L 212 78" fill="none" style={{ stroke: 'var(--wb-warn)', strokeWidth: 3 }} />
          <text x={228} y={64} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
            Trigger: forecast crosses a limit within 30 min (TBD-01)
          </text>
          {lanes.map((l, i) => (
            <g key={l}>
              <rect x={6} y={LY + i * LH} width={1428} height={LH} className={i % 2 === 0 ? 'f-panel' : 'f-env2'} style={{ stroke: 'var(--wb-line)' }} />
              <Lines x={16} y={LY + i * LH + LH / 2} anchor="start" lines={wrap(l, 12)} size={18} weight={700} />
            </g>
          ))}
          <Arrow id={id} d={`M 210 84 L 210 ${midOf(1) - BH / 2 - 2}`} tone="warn" width={2.4} />
          {s.steps.map((st) => {
            const x = SX(st.n)
            const y = midOf(st.n)
            const next = s.steps[st.n]
            const gx = x + BW + 9
            return (
              <g key={st.n}>
                {next && <Arrow id={id} d={`M ${x + BW} ${y} L ${gx} ${y} L ${gx} ${midOf(next.n)} L ${SX(next.n) - 2} ${midOf(next.n)}`} width={2} />}
                <Card x={x} y={y - BH / 2} w={BW} h={BH} lines={SCN005_SHORT[st.n]} size={17} />
              </g>
            )
          })}
          {/* success end state */}
          <Arrow id={id} d={`M ${SX(7) + BW} ${midOf(7)} L 1296 ${midOf(7)}`} width={2} />
          <Card x={1300} y={midOf(7) - 32} w={130} h={64} tone="soft" strong lines={['success', 'end state']} size={17} weight={700} />
          {/* alternates */}
          <rect x={6} y={526} width={1428} height={114} rx={6} className="f-env" style={{ fill: 'none' }} strokeDasharray="4 4" />
          <text x={16} y={548} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-muted">
            alternates
          </text>
          <Arrow id={id} d={`M 380 ${midOf(2) + BH / 2} L 380 556`} tone="muted" dashed width={2} />
          <Shape x={196} y={560} w={244} h={66} tone="dash" />
          <Lines x={318} y={593} lines={['A2 region-wide: suspend,', 'offer public transport']} size={17} />
          <Arrow id={id} d="M 442 593 L 462 593" width={2} />
          {end(476, 593)}
          <text x={494} y={593} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
            end
          </text>
          <Arrow id={id} d={`M 560 ${midOf(3) + BH / 2} L 560 540`} tone="muted" dashed width={2} />
          <Shape x={540} y={544} w={270} h={88} tone="dash" />
          <Lines x={675} y={588} lines={['A1 alternate degrading →', 'nearest open vertiport /', 'priority landing']} size={17} />
          <Arrow id={id} d={`M 812 588 L 884 588 L 884 ${midOf(5) + BH / 2 + 2}`} tone="accent" dashed width={2.2} />
          <text x={894} y={400} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-accent-ink">
            rejoin 5
          </text>
          <Arrow id={id} d={`M 1200 ${midOf(7) + BH / 2} L 1200 556`} tone="muted" dashed width={2} />
          <Shape x={1064} y={560} w={190} h={66} tone="dash" />
          <Lines x={1159} y={593} lines={['A3 hold > 2 h:', 'cancel and refund']} size={17} />
          <Arrow id={id} d="M 1256 593 L 1296 593" width={2} />
          <text x={1276} y={574} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} className="f-label">
            end
          </text>
          <Card x={1300} y={561} w={130} h={64} tone="warn" lines={['failure', 'end state']} size={17} weight={700} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.15 what writing SCN-005 exposed (full width)
export function DiscoveriesFigure({ alt }: { alt: string }) {
  const s = scenario('SCN-005')
  const Y = 160
  const TX = 150
  const dotX = (n: number) => 270 + (n - 1) * 135
  const a2 = s.alternates.find((a) => a.id === 'A2')!
  const A2END: [number, number] = [dotX(a2.fromStep) + 130, 256]
  const byWhere = (w: string) => DISCOVERIES.find((d) => d.where === w)!
  const u = byWhere('trigger')
  const tbx = UNCERTAINTIES.find((x) => x.id === u.id)?.tbx
  const cards = [
    { d: u, from: 'from the trigger', head: `${u.id}, carried as ${tbx} (unknown)`, src: [TX, Y + 14] as [number, number] },
    { d: byWhere('alternate A2'), from: 'from alternate A2', head: '', src: [A2END[0], A2END[1] + 12] as [number, number] },
    { d: byWhere('step 5'), from: 'from step 5', head: '', src: [dotX(5), Y + 18] as [number, number] },
  ]
  return (
    <Svg w={1300} h={520} alt={alt}>
      {(id) => (
        <>
          <text x={20} y={40} fontSize={19} fontWeight={700} className="f-label">
            {`${s.id} ${s.name} (simplified)`}
          </text>
          <Arrow id={id} d={`M ${TX + 14} ${Y} L 1190 ${Y}`} width={2.4} />
          <path d={`M ${TX} ${Y - 16} L ${TX + 16} ${Y} L ${TX} ${Y + 16} L ${TX - 16} ${Y} Z`} style={{ fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', strokeWidth: 2.2 }} />
          <text x={TX} y={Y - 32} textAnchor="middle" fontSize={17} fontWeight={700} className="f-label">
            trigger
          </text>
          {s.steps.map((st) => (
            <g key={st.n}>
              <circle cx={dotX(st.n)} cy={Y} r={17} style={{ fill: st.n === 5 ? 'var(--wb-accent-soft)' : 'var(--wb-panel)', stroke: st.n === 5 ? 'var(--wb-accent)' : 'var(--wb-fg)', strokeWidth: st.n === 5 ? 3 : 2 }} />
              <text x={dotX(st.n)} y={Y} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
                {st.n}
              </text>
            </g>
          ))}
          <Arrow id={id} d={`M ${dotX(a2.fromStep) + 8} ${Y + 16} C ${dotX(a2.fromStep) + 20} ${A2END[1]}, ${A2END[0] - 60} ${A2END[1]}, ${A2END[0] - 14} ${A2END[1]}`} tone="muted" dashed width={2} />
          <circle cx={A2END[0]} cy={A2END[1]} r={11} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2 }} />
          <circle cx={A2END[0]} cy={A2END[1]} r={5} style={{ fill: 'var(--wb-fg)' }} />
          <text x={A2END[0] + 20} y={A2END[1]} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
            {`${a2.id} (ends)`}
          </text>
          {cards.map((c, i) => {
            const x = 20 + i * 430
            const head = c.head || `${c.d.id} (${c.d.kind})`
            const dest = c.d.kind === 'need' ? '→ the needs set' : '→ uncertainty register'
            return (
              <g key={c.d.id}>
                <Arrow id={id} d={`M ${c.src[0]} ${c.src[1]} L ${x + 200} 326`} tone="accent" width={2.2} />
                <Shape x={x} y={330} w={400} h={124} tone={c.d.kind === 'need' ? 'soft' : 'box'} strong />
                <Lines x={x + 200} y={354} lines={[c.from]} size={16} ink="muted" />
                <Lines x={x + 200} y={392} lines={[head]} size={19} weight={700} />
                <Lines x={x + 200} y={426} lines={[dest]} size={18} ink="accent" weight={600} />
              </g>
            )
          })}
          <text x={650} y={498} textAnchor="middle" fontSize={20} fontWeight={700} fontStyle="italic" className="f-accent-ink">
            a scenario is an analysis instrument
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.16 needs × scenarios coverage (full width)
const NEED_NAME_SHORT: Record<string, string> = {
  'NEED-006': 'Early warning, access for a vertiport fire',
  'NEED-011': 'Prompt notice, a way onward when disrupted',
}
export function NeedsScenariosMatrixFigure({ alt }: { alt: string }) {
  const X_NAME = 116
  const X0 = 540
  const CW = 80
  const NOTE_X = X0 + SCENARIOS.length * CW + 18
  const Y0 = 52
  const rows = NEED_COVERAGE.map((c) => {
    const shaded = c.status === 'constraint' || c.status === 'planning'
    const finding = c.status === 'finding'
    const note = shaded || finding ? wrap(c.note, 50) : []
    return { c, shaded, finding, note, h: Math.max(34, note.length * 21 + 12) }
  })
  const ys: number[] = []
  let y = Y0
  for (const r of rows) {
    ys.push(y)
    y += r.h
  }
  const bottom = y
  const LEG = bottom + 34
  return (
    <Svg w={1440} h={LEG + 24} alt={alt}>
      {() => (
        <>
          <text x={12} y={30} fontSize={18} fontWeight={700} className="f-label">
            Need
          </text>
          <text x={X_NAME} y={30} fontSize={18} fontWeight={700} className="f-label">
            Short name
          </text>
          {SCENARIOS.map((s, j) => (
            <text key={s.id} x={X0 + j * CW + CW / 2} y={30} textAnchor="middle" fontSize={17} fontWeight={700} className="f-label">
              {s.id}
            </text>
          ))}
          <text x={NOTE_X} y={30} fontSize={18} fontWeight={700} className="f-label">
            Note (rows not exercised, and the finding)
          </text>
          <line x1={4} y1={Y0 - 2} x2={1436} y2={Y0 - 2} className="f-axis" />
          {rows.map((r, i) => {
            const top = ys[i]
            const cy = top + r.h / 2
            const n = need(r.c.need)
            return (
              <g key={r.c.need}>
                {r.shaded ? (
                  <rect x={4} y={top + 1} width={1432} height={r.h - 2} style={{ fill: 'var(--wb-sunk)', stroke: 'var(--wb-line-strong)', strokeWidth: 1 }} />
                ) : r.finding ? (
                  <rect x={4} y={top + 1} width={1432} height={r.h - 2} rx={4} style={WARN_FILL} strokeDasharray="7 4" />
                ) : i % 2 === 1 ? (
                  <rect x={4} y={top} width={1432} height={r.h} className="f-panel" style={{ stroke: 'none' }} />
                ) : null}
                <text x={12} y={cy} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
                  {n.id}
                </text>
                <text x={X_NAME} y={cy} dominantBaseline="central" fontSize={17} {...(r.shaded ? { className: 'f-muted' } : { className: 'f-label' })}>
                  {NEED_NAME_SHORT[n.id] ?? n.name}
                </text>
                {SCENARIOS.map((s, j) => {
                  const cx = X0 + j * CW + CW / 2
                  const hit = r.c.where.some((w) => w.scenario === s.id)
                  if (r.shaded) return <text key={s.id} x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={17} className="f-muted">—</text>
                  if (!hit) return <circle key={s.id} cx={cx} cy={cy} r={2} className="f-muted" style={{ fill: 'var(--wb-muted)' }} />
                  if (r.c.status === 'exercised') return <rect key={s.id} x={cx - 10} y={cy - 10} width={20} height={20} rx={2} style={{ fill: 'var(--wb-fg)' }} />
                  if (r.c.status === 'weak') return <rect key={s.id} x={cx - 9} y={cy - 9} width={18} height={18} rx={2} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2.4 }} />
                  return <rect key={s.id} x={cx - 9} y={cy - 9} width={18} height={18} rx={2} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-warn)', strokeWidth: 2.4 }} strokeDasharray="4 3" />
                })}
                {r.finding && (
                  <text x={NOTE_X} y={cy - ((r.note.length - 1) * 21) / 2} dominantBaseline="central" fontSize={17} fontWeight={700} style={WARN_INK}>
                    finding:
                  </text>
                )}
                {r.note.map((l, q) => (
                  <text key={q} x={NOTE_X + (r.finding && q === 0 ? 74 : 0)} y={cy + (q - (r.note.length - 1) / 2) * 21} dominantBaseline="central" fontSize={17} className={r.finding ? 'f-label' : 'f-muted'}>
                    {l}
                  </text>
                ))}
              </g>
            )
          })}
          {SCENARIOS.map((_, j) => (
            <line key={j} x1={X0 + j * CW} y1={Y0} x2={X0 + j * CW} y2={bottom} className="f-divider" />
          ))}
          <line x1={X0 + SCENARIOS.length * CW} y1={Y0} x2={X0 + SCENARIOS.length * CW} y2={bottom} className="f-divider" />
          <rect x={12} y={LEG - 10} width={20} height={20} rx={2} style={{ fill: 'var(--wb-fg)' }} />
          <text x={40} y={LEG} dominantBaseline="central" fontSize={17} className="f-label">
            filled = exercised
          </text>
          <rect x={214} y={LEG - 9} width={18} height={18} rx={2} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2.4 }} />
          <text x={242} y={LEG} dominantBaseline="central" fontSize={17} className="f-label">
            outlined = weak
          </text>
          <rect x={410} y={LEG - 11} width={40} height={22} style={{ fill: 'var(--wb-sunk)', stroke: 'var(--wb-line-strong)', strokeWidth: 1 }} />
          <text x={460} y={LEG} dominantBaseline="central" fontSize={17} className="f-label">
            shaded row = not exercised, reason recorded
          </text>
          <rect x={860} y={LEG - 11} width={40} height={22} rx={3} style={WARN_FILL} strokeDasharray="7 4" />
          <text x={910} y={LEG} dominantBaseline="central" fontSize={17} className="f-label">
            amber, dashed = finding
          </text>
          <text x={1432} y={LEG} textAnchor="end" dominantBaseline="central" fontSize={16} className="f-muted">
            instructor’s reading · FICTIONAL
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.17 feature, capability, benefit
export function FcbLadderFigure({ alt }: { alt: string }) {
  const rungs = ['Benefit', 'Capability', 'Feature']
  const sebok = [['saving time and', 'adding security'], ['storing passwords'], ['fingerprint scanner']]
  const aero = [['short, predictable waits', '(MGO-002)'], ['return arriving aircraft to', 'dispatch-ready within the', 'turnaround (CAP-003)'], ['high-power hub chargers']]
  const RY = (i: number) => 70 + i * 146
  const RH = 110
  return (
    <Svg w={860} h={520} alt={alt}>
      {(id) => (
        <>
          <Lines x={330} y={36} lines={['SEBoK’s example']} size={19} weight={700} />
          <Lines x={688} y={36} lines={['AeroLink']} size={19} weight={700} ink="accent" />
          {rungs.map((r, i) => (
            <g key={r}>
              <Card x={6} y={RY(i) + RH / 2 - 26} w={140} h={52} tone="panel" lines={[r]} size={18} weight={700} />
              <Card x={170} y={RY(i)} w={320} h={RH} tone="box" lines={sebok[i]} size={17} />
              <Card x={516} y={RY(i)} w={338} h={RH} tone="soft" strong={i === 1} lines={aero[i]} size={17} />
              {i < 2 && (
                <>
                  <Arrow id={id} d={`M 76 ${RY(i + 1) + RH / 2 - 28} L 76 ${RY(i) + RH / 2 + 30}`} width={2.4} />
                  <Arrow id={id} d={`M 330 ${RY(i + 1) - 2} L 330 ${RY(i) + RH + 4}`} tone="muted" width={2} />
                  <Arrow id={id} d={`M 685 ${RY(i + 1) - 2} L 685 ${RY(i) + RH + 4}`} tone="accent" width={2.4} />
                </>
              )}
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.18 the capability tree (full width)
function CapNode({ x, y, w, h, capId }: { x: number; y: number; w: number; h: number; capId: string }) {
  const c = capability(capId)
  const name = wrap(c.name, 18)
  const scns = scenariosOfCapability(capId)
  return (
    <g>
      <Shape x={x} y={y} w={w} h={h} tone="box" strong={!c.refines} />
      <text x={x + w / 2} y={y + 22} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} className="f-label">
        {c.id}
      </text>
      <Lines x={x + w / 2} y={y + 50 + ((name.length - 1) * 21) / 2} lines={name} size={17} lh={1.22} />
      <text x={x + w / 2} y={y + h - 54} textAnchor="middle" dominantBaseline="central" fontSize={16} className="f-muted">
        {c.needs.join(' · ')}
      </text>
      {scns.length ? (
        scns.map((s, k) => <Chip key={s} cx={x + w / 2 + (k - (scns.length - 1) / 2) * 92} cy={y + h - 22} text={s} size={16} tone="soft" ink="accent" weight={700} />)
      ) : (
        <text x={x + w / 2} y={y + h - 22} textAnchor="middle" dominantBaseline="central" fontSize={16} fontStyle="italic" className="f-muted">
          no scenario yet
        </text>
      )}
    </g>
  )
}
export function CapabilityTreeFigure({ alt }: { alt: string }) {
  const ref = CAPABILITIES.filter((c) => Number(c.id.slice(4)) <= 10)
  const top = ref.filter((c) => !c.refines)
  const W = 192
  const PITCH = 204
  const X0 = 8
  const TY = 130
  const NH = 196
  const CY = 400
  const ROOT_Y = 16
  const xOf = (i: number) => X0 + i * PITCH
  return (
    <Svg w={1440} h={620} alt={alt}>
      {() => (
        <>
          <Card x={520} y={ROOT_Y} w={400} h={56} tone="soft" strong lines={['AeroLink enterprise capabilities']} size={19} weight={700} />
          <line x1={720} y1={ROOT_Y + 56} x2={720} y2={100} className="f-arrow" />
          <line x1={xOf(0) + W / 2} y1={100} x2={xOf(top.length - 1) + W / 2} y2={100} className="f-arrow" />
          {top.map((c, i) => {
            const x = xOf(i)
            const kids = ref.filter((k) => k.refines === c.id)
            return (
              <g key={c.id}>
                <line x1={x + W / 2} y1={100} x2={x + W / 2} y2={TY} className="f-arrow" />
                <CapNode x={x} y={TY} w={W} h={NH} capId={c.id} />
                {kids.map((k) => (
                  <g key={k.id}>
                    <line x1={x + W / 2} y1={TY + NH} x2={x + W / 2} y2={CY} className="f-arrow" style={{ strokeDasharray: '6 4' }} />
                    <text x={x + W / 2 + 8} y={(TY + NH + CY) / 2} dominantBaseline="central" fontSize={16} fontStyle="italic" className="f-muted">
                      refines
                    </text>
                    <CapNode x={x} y={CY} w={W} h={NH} capId={k.id} />
                  </g>
                ))}
              </g>
            )
          })}
          <Shape x={xOf(3)} y={CY + 20} w={1440 - xOf(3) - 8} h={150} tone="panel" />
          <Lines x={xOf(3) + 20} y={CY + 95} anchor="start" lines={['Each node: ID, name, the needs it serves (NEED-0nn)', 'Badge: a scenario that exercises it (SCN-0nn)', 'Bold outline: top level · dashed line: refines (child under parent)', 'The ten reference capabilities (CAP-001 to CAP-010)']} size={17} lh={1.3} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.19 what the tree does not yet cover
const CAP_TINY: Record<string, string> = {
  'CAP-001': 'Passenger transport',
  'CAP-002': 'Booking and dispatch',
  'CAP-003': 'Fleet charging',
  'CAP-004': 'Flight ops in limits',
  'CAP-005': 'Weather-aware ops',
  'CAP-006': 'Fleet health',
  'CAP-007': 'Noise-managed ops',
  'CAP-008': 'Capacity planning',
  'CAP-009': 'Incident response',
  'CAP-010': 'Charging power control',
}
export function CapabilityGapsFigure({ alt }: { alt: string }) {
  const ref = CAPABILITIES.filter((c) => Number(c.id.slice(4)) <= 10)
  const ordered = ref.filter((c) => !c.refines).flatMap((c) => [c, ...ref.filter((k) => k.refines === c.id)])
  const proposed = CAPABILITIES.filter((c) => c.provenance === 'proposed')
  // review M2/M3: CAP-005 is corrected too (NEED-011 moved to the proposed CAP-015); both corrected rows are amber
  const moved = proposed.find((c) => c.needs.includes('NEED-011'))
  const WARN_LABEL: Record<string, string> = { 'CAP-007': 'corrected: both agreed limits', ...(moved ? { 'CAP-005': `corrected: NEED-011 → ${moved.id}` } : {}) }
  const PITCH = Math.min(132, Math.floor((600 - 62 - 6) / Math.max(1, proposed.length)))
  const PH = PITCH - 16
  const rows: { id: string; child: boolean; y: number; h: number }[] = []
  let y = 62
  for (const c of ordered) {
    const h = WARN_LABEL[c.id] ? 64 : 40
    rows.push({ id: c.id, child: !!c.refines, y, h })
    y += h + 8
  }
  const lastTop = [...rows].reverse().find((r) => !r.child)!
  return (
    <Svg w={860} h={600} alt={alt}>
      {() => (
        <>
          <text x={10} y={34} fontSize={19} fontWeight={700} className="f-label">
            AeroLink enterprise capabilities
          </text>
          <line x1={22} y1={46} x2={22} y2={lastTop.y + lastTop.h / 2} className="f-arrow" />
          {rows.map((r, i) => {
            const x = r.child ? 76 : 40
            const w = 380 - x
            const cy = r.y + r.h / 2
            const warn = !!WARN_LABEL[r.id]
            const parentRow = r.child ? rows.slice(0, i).reverse().find((p) => !p.child)! : null
            return (
              <g key={r.id}>
                {r.child && parentRow ? <path d={`M 58 ${parentRow.y + parentRow.h} L 58 ${cy} L ${x} ${cy}`} fill="none" className="f-arrow" /> : <line x1={22} y1={cy} x2={x} y2={cy} className="f-arrow" />}
                <Shape x={x} y={r.y} w={w} h={r.h} tone={warn ? 'warn' : 'box'} strong={warn} />
                <text x={x + 12} y={warn ? r.y + 20 : cy} dominantBaseline="central" fontSize={17} className="f-label">
                  <tspan fontWeight={700}>{r.id}</tspan> {CAP_TINY[r.id]}
                </text>
                {warn && (
                  <text x={x + 12} y={r.y + 46} dominantBaseline="central" fontSize={16} fontWeight={700} style={WARN_INK}>
                    {WARN_LABEL[r.id]}
                  </text>
                )}
              </g>
            )
          })}
          <line x1={22} y1={46} x2={420} y2={46} className="f-arrow" style={{ strokeDasharray: '6 4' }} />
          <line x1={420} y1={46} x2={420} y2={62 + (proposed.length - 1) * PITCH + PH / 2} className="f-arrow" style={{ strokeDasharray: '6 4' }} />
          {proposed.map((c, i) => {
            const py = 62 + i * PITCH
            return (
              <g key={c.id}>
                <line x1={420} y1={py + PH / 2} x2={446} y2={py + PH / 2} className="f-arrow" style={{ strokeDasharray: '6 4' }} />
                <Shape x={446} y={py} w={408} h={PH} tone="dash" strong />
                <text x={462} y={py + 22} dominantBaseline="central" fontSize={18} fontWeight={700} className="f-label">
                  {c.id}
                </text>
                <Chip cx={800} cy={py + 22} text="proposed" size={16} tone="env" ink="muted" />
                <Lines x={462} y={py + Math.round(PH * 0.53)} anchor="start" lines={wrap(c.name, 38)} size={17} />
                <text x={462} y={py + PH - 16} dominantBaseline="central" fontSize={16} className="f-muted">
                  {c.needs.join(' · ')}
                </text>
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.20 the staircase
export function StaircaseFigure({ alt }: { alt: string }) {
  const steps = [
    { x: 6, top: 370, tone: 'env' as Tone, head: 'NEED', lines: ['stakeholder’s words:', 'Vertiport operators need', 'the air-taxi service to …'] },
    { x: 290, top: 240, tone: 'box' as Tone, head: 'REQ-STK', lines: ['service level:', 'The AeroLink service', 'shall …'] },
    { x: 574, top: 110, tone: 'soft' as Tone, head: 'REQ-SYS', lines: ['element level:', 'The charging system', 'shall …'] },
  ]
  const W = 280
  const BOT = 540
  return (
    <Svg w={860} h={550} alt={alt}>
      {(id) => (
        <>
          {steps.map((s) => (
            <g key={s.head}>
              <Shape x={s.x} y={s.top} w={W} h={BOT - s.top} tone={s.tone} strong={s.tone === 'soft'} rx={4} />
              <text x={s.x + W / 2} y={s.top + 30} textAnchor="middle" dominantBaseline="central" fontSize={21} fontWeight={700} className="f-label">
                {s.head}
              </text>
              <Lines x={s.x + W / 2} y={s.top + 92} lines={s.lines} size={17} />
            </g>
          ))}
          <Arrow id={id} d="M 150 360 C 150 300, 200 290, 278 292" tone="accent" width={2.4} />
          <Lines x={18} y={262} anchor="start" lines={['transformed from needs into', 'more formal statements', '(ISO/IEC/IEEE 29148,', 'via SEBoK)']} size={16} ink="accent" weight={600} />
          <Arrow id={id} d="M 434 230 C 434 170, 484 160, 562 162" tone="accent" width={2.4} />
          <Lines x={302} y={128} anchor="start" lines={['a technical view of a', 'solution (ISO/IEC/IEEE', '15288, via SEBoK)']} size={16} ink="accent" weight={600} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.21 one chain, with its budget
export function ChainBudgetFigure({ alt }: { alt: string }) {
  const [nId, cId, sId, stkId, sysId] = CHAIN_NEED004
  const B = TURNAROUND_BUDGET
  const cards = [
    { id: nId, lines: wrap(need(nId).name, 20) },
    { id: cId, lines: wrap(capability(cId).name, 20) },
    { id: requirement(stkId).id, lines: ['dispatch-ready', `within ${B.total} min`] },
    { id: requirement(sysId).id, lines: ['charge 20 % →', `threshold within ${B.charge} min`] },
  ]
  const CW = 196
  const PITCH = 216
  const BX = 30
  const BW = 800
  const k = BW / B.total
  const padEnd = BX + B.padWork * k
  const BY = 300
  const BH = 64
  return (
    <Svg w={860} h={540} alt={alt}>
      {(id) => (
        <>
          {cards.map((c, i) => {
            const x = 6 + i * PITCH
            return (
              <g key={c.id}>
                <Shape x={x} y={30} w={CW} h={130} tone={i === 0 ? 'env' : i === 1 ? 'box' : 'soft'} strong={i >= 2} />
                <text x={x + CW / 2} y={58} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} className="f-label">
                  {c.id}
                </text>
                <Lines x={x + CW / 2} y={108} lines={c.lines} size={16} />
                {i < 3 && <Arrow id={id} d={`M ${x + CW + 2} 95 L ${x + PITCH - 4} 95`} tone="accent" width={2.4} />}
              </g>
            )
          })}
          <line x1={6 + PITCH + CW / 2} y1={160} x2={6 + PITCH + CW / 2} y2={176} className="f-arrow" />
          <Chip cx={6 + PITCH + CW / 2} cy={192} text={sId} size={16} tone="soft" ink="accent" weight={700} />
          <text x={BX} y={262} fontSize={19} fontWeight={700} className="f-label">
            {`${B.total} min = ${B.padWork} min pad work + ${B.charge} min charge`}
          </text>
          <rect x={BX} y={BY} width={padEnd - BX} height={BH} className="f-shape" style={{ strokeWidth: 2 }} />
          <rect x={padEnd} y={BY} width={BX + BW - padEnd} height={BH} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2.4 }} />
          <Lines x={(BX + padEnd) / 2} y={BY + BH / 2} lines={[`${B.padWork} min`, 'pad work']} size={16} weight={600} />
          <Lines x={(padEnd + BX + BW) / 2} y={BY + BH / 2} lines={[`${B.charge} min charge · ${sysId}`]} size={18} weight={700} />
          {[0, B.padWork, B.total].map((t) => (
            <g key={t}>
              <line x1={BX + t * k} y1={BY + BH} x2={BX + t * k} y2={BY + BH + 10} className="f-axis" style={{ strokeWidth: 2 }} />
              <text x={BX + t * k} y={BY + BH + 26} textAnchor="middle" fontSize={16} className="f-muted">
                {`${t} min`}
              </text>
            </g>
          ))}
          <path d={`M ${padEnd + 4} ${BY + BH + 44} L ${padEnd + 4} ${BY + BH + 54} L ${BX + BW - 4} ${BY + BH + 54} L ${BX + BW - 4} ${BY + BH + 44}`} fill="none" style={{ stroke: 'var(--wb-accent)', strokeWidth: 2 }} strokeDasharray="6 4" />
          <text x={(padEnd + BX + BW) / 2} y={BY + BH + 78} textAnchor="middle" fontSize={17} className="f-label">
            {B.note}
          </text>
          <text x={430} y={520} textAnchor="middle" fontSize={17} fontStyle="italic" className="f-muted">
            a budget: change one value and the other must change
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S1.22 the answer
export function AnswerFigure({ alt }: { alt: string }) {
  const rows = STAKEHOLDER_REQUIREMENTS.filter((r) => r.parents.some((p) => p.startsWith('NEED-'))).slice(0, 3)
  const disc = (kind: string) => DISCOVERIES.find((d) => d.kind === kind)!
  const u = disc('unknown')
  const tbx = UNCERTAINTIES.find((x) => x.id === u.id)?.tbx
  const n4 = need('NEED-004')
  return (
    <Svg w={860} h={560} alt={alt}>
      {(id) => (
        <>
          <Shape x={6} y={6} w={848} h={50} tone="soft" strong />
          <Lines x={430} y={31} lines={['Answer: B — first describe how the service will be operated']} size={19} weight={700} />
          <CardStack x={16} y={120} w={210} h={150}>
            <Lines x={121} y={154} lines={[n4.id]} size={18} weight={700} />
            <Lines x={121} y={206} lines={wrap(n4.name, 18)} size={16} />
          </CardStack>
          <text x={200} y={294} textAnchor="middle" fontSize={17} className="f-muted">
            needs set
          </text>
          <Arrow id={id} d="M 230 190 L 280 190" tone="accent" width={2.6} />
          <Storyboard x={284} y={136} w={226} h={104} strong />
          <Arrow id={id} d="M 514 190 L 560 190" tone="accent" width={2.6} />
          <rect x={564} y={100} width={290} height={190} rx={6} className="f-shape" />
          <rect x={564} y={100} width={290} height={40} rx={6} className="f-panel" />
          {[140, 190, 240].map((y) => (
            <line key={y} x1={564} y1={y} x2={854} y2={y} className="f-axis" />
          ))}
          <line x1={684} y1={100} x2={684} y2={290} className="f-axis" />
          <line x1={770} y1={100} x2={770} y2={290} className="f-axis" />
          <Lines x={624} y={120} lines={['ID']} size={16} weight={700} />
          <Lines x={727} y={120} lines={['Statement']} size={16} weight={700} />
          <Lines x={812} y={120} lines={['Parent']} size={16} weight={700} />
          {rows.map((r, i) => {
            const cy = 165 + i * 50
            return (
              <g key={r.id}>
                <Lines x={624} y={cy} lines={[r.id]} size={16} weight={600} />
                <line x1={696} y1={cy - 6} x2={758} y2={cy - 6} style={{ stroke: 'var(--wb-muted)', strokeWidth: 2 }} />
                <line x1={696} y1={cy + 6} x2={740} y2={cy + 6} style={{ stroke: 'var(--wb-muted)', strokeWidth: 2 }} />
                <Lines x={812} y={cy} lines={[r.parents.find((p) => p.startsWith('NEED-'))!]} size={16} weight={600} />
              </g>
            )
          })}
          {/* discoveries dropping from the storyboard */}
          <Arrow id={id} d="M 320 244 C 300 290, 260 330, 236 352" tone="accent" width={2.2} />
          <Arrow id={id} d="M 397 244 L 397 350" tone="accent" width={2.2} />
          <Arrow id={id} d="M 470 244 C 500 290, 560 320, 586 350" tone="accent" width={2.2} />
          <Card x={110} y={356} w={170} h={50} tone="soft" strong lines={[disc('need').id]} size={18} weight={700} />
          <Card x={330} y={356} w={134} h={50} tone="box" strong lines={[disc('assumption').id]} size={18} weight={700} />
          <Card x={510} y={356} w={190} h={50} tone="box" strong lines={[`${u.id} / ${tbx}`]} size={18} weight={700} />
          <Arrow id={id} d="M 130 352 L 82 278" tone="accent" width={2.2} />
          <Arrow id={id} d="M 397 410 L 430 462" width={2} />
          <Arrow id={id} d="M 605 410 L 560 462" width={2} />
          <Card x={300} y={466} w={380} h={64} tone="panel" lines={['uncertainty register']} size={19} weight={700} />
        </>
      )}
    </Svg>
  )
}
