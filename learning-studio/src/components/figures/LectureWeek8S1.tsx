// Week 8, Session 1 lecture figures (from documents to a model; the SysML v2 language). Original drawings: none redraws a
// SEBoK, OMG specification or training-deck figure. Every label comes from the Week 8 Session 1 figure specification
// (the slide's caption and alt text in src/content/lectures/week08/session1.ts) or from the case and course modules:
// src/content/lectures/week08/aerolinkCase.ts (NINE_PLACES), src/content/lectures/week08/labBrief.ts (MODEL_PACKAGES)
// and src/content/lectures/week08/listings.ts (the predict listings and their recorded checker results). AeroLink is
// FICTIONAL; a figure adds no claim of its own. Static SVG with the shared theme classes (f-shape, f-soft, f-panel, f-env,
// f-label, f-muted, f-accent-ink, f-arrow) and theme variables (--wb-warn, --wb-warn-soft, --wb-accent, --wb-panel,
// --wb-fg, --wb-muted, --wb-mono), so the light and dark themes are both designed once; meaning is never carried by color
// alone (dash patterns, outlines, labels). The small helpers are copied from the Week 2 figures, not imported (separate
// owners). The listing figures (w8s1-listing-*) are drawn by LectureWeek8Code.tsx. Review status: new-pending-review.
import { useId, type ReactNode } from 'react'
import { Markers } from './Frame'
import { NINE_PLACES } from '../../content/lectures/week08/aerolinkCase'
import { MODEL_PACKAGES } from '../../content/lectures/week08/labBrief'
import { listing } from '../../content/lectures/week08/listings'
import { PROOF_OUTPUT } from '../../content/lab/week08Checker'

// ------------------------------------------------------------------------------------------------ shared helpers
type Tone = 'box' | 'soft' | 'panel' | 'env' | 'warn' | 'dash' | 'later'
const WARN_FILL = { fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', strokeWidth: 1.8 }
const WARN_INK = { fill: 'var(--wb-warn)' }
const MONO = { fontFamily: 'var(--wb-mono, monospace)' }

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
function Lines({ x, y, lines, size = 17, anchor = 'middle', weight = 500, ink = 'ink', lh = 1.25, italic = false, mono = false }: { x: number; y: number; lines: string[]; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; ink?: Ink; lh?: number; italic?: boolean; mono?: boolean }) {
  const step = size * lh
  const top = y - ((lines.length - 1) * step) / 2
  const ip = inkProps(ink)
  return (
    <>
      {lines.map((l, i) => (
        <text key={i} x={x} y={top + i * step} textAnchor={anchor} dominantBaseline="central" fontSize={size} fontWeight={weight} fontStyle={italic ? 'italic' : undefined} {...ip} style={{ ...('style' in ip ? ip.style : {}), ...(mono ? MONO : {}), whiteSpace: 'pre' }} xmlSpace="preserve">
          {l}
        </text>
      ))}
    </>
  )
}

/** A shape with centered lines of text. */
function Card({ x, y, w, h, lines, tone = 'box', size = 17, weight = 500, ink, strong = false, mono = false }: { x: number; y: number; w: number; h: number; lines: string[]; tone?: Tone; size?: number; weight?: number; ink?: Ink; strong?: boolean; mono?: boolean }) {
  return (
    <g>
      <Shape x={x} y={y} w={w} h={h} tone={tone} strong={strong} />
      <Lines x={x + w / 2} y={y + h / 2} lines={lines} size={size} weight={weight} ink={ink ?? (tone === 'later' ? 'muted' : 'ink')} mono={mono} />
    </g>
  )
}

function Arrow({ d, id, tone = 'ink', dashed = false, width, both = false, dotted = false }: { d: string; id: string; tone?: 'ink' | 'accent' | 'muted' | 'warn'; dashed?: boolean; width?: number; both?: boolean; dotted?: boolean }) {
  const style = tone === 'warn' ? { stroke: 'var(--wb-warn)', strokeWidth: width ?? 2.6 } : tone === 'muted' ? { stroke: 'var(--wb-muted)', strokeWidth: width ?? 1.6 } : width ? { strokeWidth: width } : undefined
  return <path d={d} className={`f-arrow${tone === 'accent' ? ' accent' : ''}`} style={style} strokeDasharray={dotted ? '2 5' : dashed ? '7 5' : undefined} markerEnd={`url(#${id}-${tone})`} markerStart={both ? `url(#${id}-${tone})` : undefined} fill="none" />
}

/** A plain line (no arrow head). */
function Line({ d, dashed = false, dotted = false, accent = false, width = 1.8 }: { d: string; dashed?: boolean; dotted?: boolean; accent?: boolean; width?: number }) {
  return <path d={d} fill="none" style={{ stroke: accent ? 'var(--wb-accent)' : 'var(--wb-muted)', strokeWidth: width }} strokeDasharray={dotted ? '2 5' : dashed ? '7 5' : undefined} />
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

/** Greedy word wrap by character count. */
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

/** A code line wrapped for display (continuation lines indented with "↳"). */
function wrapCode(line: string, max: number): string[] {
  if (line.length <= max) return [line]
  const indent = line.match(/^ */)![0]
  const words = line.trim().split(' ')
  const out: string[] = []
  let cur = indent
  for (const w of words) {
    if (cur.trim() === '') cur = `${cur}${w}`
    else if (`${cur} ${w}`.length <= max) cur = `${cur} ${w}`
    else {
      out.push(cur)
      cur = `${indent}  ↳ ${w}`
    }
  }
  out.push(cur)
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

/** A vertical bracket on the right of a span, with its label to the right. */
function VBracket({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  return (
    <g>
      <path d={`M ${x - 12} ${y1} L ${x} ${y1} L ${x} ${y2} L ${x - 12} ${y2}`} fill="none" style={{ stroke: 'var(--wb-accent)', strokeWidth: 2.6 }} />
      <Lines x={x + 18} y={(y1 + y2) / 2} lines={[label]} size={22} weight={700} anchor="start" ink="accent" />
    </g>
  )
}

/** A stick figure standing with its head centered at (x, y). */
function Stick({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const st = { stroke: 'var(--wb-fg)', strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round' as const }
  return (
    <g>
      <circle cx={x} cy={y} r={11 * s} style={{ ...st, fill: 'var(--wb-panel)' }} />
      <path d={`M ${x} ${y + 11 * s} L ${x} ${y + 46 * s} M ${x - 20 * s} ${y + 24 * s} L ${x + 20 * s} ${y + 24 * s} M ${x} ${y + 46 * s} L ${x - 15 * s} ${y + 72 * s} M ${x} ${y + 46 * s} L ${x + 15 * s} ${y + 72 * s}`} style={st} />
    </g>
  )
}

/** A document icon (folded corner) with lines of text inside. */
function Doc({ x, y, w, h, lines, size = 16, tone = 'box', dashed = false }: { x: number; y: number; w: number; h: number; lines: string[]; size?: number; tone?: Tone; dashed?: boolean }) {
  const f = 14
  const cls = tone === 'soft' ? 'f-soft' : undefined
  return (
    <g className={cls}>
      <path d={`M ${x} ${y} L ${x + w - f} ${y} L ${x + w} ${y + f} L ${x + w} ${y + h} L ${x} ${y + h} Z`} className="f-shape" style={{ strokeWidth: 1.8 }} strokeDasharray={dashed ? '6 4' : undefined} />
      <path d={`M ${x + w - f} ${y} L ${x + w - f} ${y + f} L ${x + w} ${y + f}`} className="f-shape" style={{ strokeWidth: 1.4 }} />
      <Lines x={x + w / 2} y={y + h / 2 + 3} lines={lines} size={size} weight={700} />
    </g>
  )
}

/** A database-style cylinder with a label. */
function Cylinder({ cx, y, w, h, lines }: { cx: number; y: number; w: number; h: number; lines: string[] }) {
  const ry = 18
  return (
    <g className="f-soft">
      <path d={`M ${cx - w / 2} ${y + ry} L ${cx - w / 2} ${y + h - ry} A ${w / 2} ${ry} 0 0 0 ${cx + w / 2} ${y + h - ry} L ${cx + w / 2} ${y + ry}`} className="f-shape" style={{ strokeWidth: 2.4 }} />
      <ellipse cx={cx} cy={y + ry} rx={w / 2} ry={ry} className="f-shape" style={{ strokeWidth: 2.4 }} />
      <Lines x={cx} y={y + h / 2 + 10} lines={lines} size={20} weight={700} />
    </g>
  )
}

/** A check mark centered at (x, y). */
function Check({ x, y }: { x: number; y: number }) {
  return <path d={`M ${x - 9} ${y} L ${x - 2} ${y + 8} L ${x + 11} ${y - 9}`} fill="none" style={{ stroke: 'var(--wb-accent)', strokeWidth: 3.4, strokeLinecap: 'round' }} />
}

/** A cross mark centered at (x, y), optionally in a circle. */
function Cross({ x, y, r = 12, circle = false }: { x: number; y: number; r?: number; circle?: boolean }) {
  return (
    <g>
      {circle && <circle cx={x} cy={y} r={r + 6} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-warn)', strokeWidth: 2.6 }} />}
      <path d={`M ${x - r * 0.6} ${y - r * 0.6} L ${x + r * 0.6} ${y + r * 0.6} M ${x + r * 0.6} ${y - r * 0.6} L ${x - r * 0.6} ${y + r * 0.6}`} style={{ stroke: 'var(--wb-warn)', strokeWidth: 3.4, strokeLinecap: 'round' }} />
    </g>
  )
}

// ------------------------------------------------------------------------------------------------ the figures
/** Week 7 package → import by ID → model v0.1, with the packages filled now and the weeks that fill the others. */
export function WeekBandFigure({ alt }: { alt: string }) {
  const rows = Math.ceil(MODEL_PACKAGES.length / 2)
  const H = 150 + rows * 92 + 20
  return (
    <Svg w={1300} h={H} alt={alt}>
      {(id) => (
        <>
          {[3, 2, 1, 0].map((k) => (
            <Doc key={k} x={50 + k * 12} y={H / 2 - 110 - k * 12} w={230} h={200} lines={k === 0 ? ['Week 7', 'Systems Thinking', 'package'] : []} size={19} tone={k === 0 ? 'soft' : 'box'} />
          ))}
          <Arrow d={`M 330 ${H / 2 - 10} L 488 ${H / 2 - 10}`} id={id} tone="accent" width={6} />
          <Lines x={409} y={H / 2 - 44} lines={['import by ID']} size={19} weight={700} ink="accent" />
          <Card x={520} y={30} w={740} h={64} lines={['Model v0.1']} tone="soft" size={22} weight={700} strong />
          {MODEL_PACKAGES.map((p, i) => {
            const col = i < rows ? 0 : 1
            const r = i % rows
            const x = 560 + col * 360
            const y = 130 + r * 92
            const now = p.filledIn === 8
            return (
              <g key={p.name}>
                <Line d={`M ${x - 22} ${y - 30 - (r === 0 ? 6 : 0)} L ${x - 22} ${y + 28} L ${x} ${y + 28}`} />
                <Card x={x} y={y} w={300} h={56} lines={[p.name]} tone={now ? 'soft' : 'later'} size={19} weight={now ? 700 : 500} strong={now} />
                <Chip cx={x + 250} cy={y} text={now ? 'filled now' : `Week ${p.filledIn}`} size={15} tone={now ? 'box' : 'dash'} ink={now ? 'accent' : 'muted'} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

/** The nine places AeroLink's 20-minute charge appears, and the one you miss. */
export function NinePlacesFigure({ alt }: { alt: string }) {
  const W = 1300
  const tw = 390
  const th = 150
  return (
    <Svg w={W} h={700} alt={alt}>
      {() => (
        <>
          {NINE_PLACES.map((p, i) => {
            const x = 40 + (i % 3) * (tw + 25)
            const y = 20 + Math.floor(i / 3) * (th + 22)
            return (
              <g key={p.id}>
                <Doc x={x} y={y} w={tw} h={th} lines={[]} />
                <Lines x={x + 18} y={y + 28} lines={[p.id]} size={21} weight={700} anchor="start" />
                <Lines x={x + 18} y={y + 56} lines={[p.artifact]} size={16} anchor="start" ink="muted" />
                <rect x={x + 12} y={y + 74} width={tw - 24} height={wrap(p.detail, 38).length * 21 + 10} rx={4} style={{ fill: 'var(--wb-accent-soft, var(--wb-warn-soft))' }} />
                <Lines x={x + 20} y={y + 79 + (wrap(p.detail, 38).length * 21) / 2} lines={wrap(p.detail, 38)} size={17} weight={600} anchor="start" lh={1.2} />
                <Chip cx={x + tw - 70} cy={y + 28} text={p.how} size={15} tone="dash" ink="accent" />
              </g>
            )
          })}
          <g>
            <Doc x={W - 320} y={562} w={260} h={110} lines={[]} dashed />
            <path d={`M ${W - 320} 562 L ${W - 60} 672 L ${W - 320} 672 Z`} className="f-env" style={{ strokeWidth: 1.8 }} />
            <Lines x={W - 190} y={598} lines={['the one you miss']} size={18} weight={700} ink="warn" />
            <text x={W - 110} y={648} textAnchor="middle" dominantBaseline="central" fontSize={40} fontWeight={700} style={WARN_INK}>
              ?
            </text>
          </g>
        </>
      )}
    </Svg>
  )
}

const LANES: [string, string][] = [
  ['Week 1', 'Week 8'],
  ['Week 2', 'Week 9'],
  ['Weeks 2 and 4', 'Week 10'],
  ['Week 5', 'Week 11'],
  ['Weeks 2 and 3', 'Week 12'],
  ['Week 3', 'Week 13'],
  ['Weeks 6 and 7', 'Week 14'],
]
/** Phase I documents and Phase II model, with the week-to-week continuity arrows and the stable-ID thread. */
export function TwoLanesFigure({ alt }: { alt: string }) {
  const bx = (i: number) => 240 + i * 150
  return (
    <Svg w={1320} h={620} alt={alt}>
      {(id) => (
        <>
          <Shape x={20} y={40} w={1280} h={130} tone="panel" />
          <Shape x={20} y={440} w={1280} h={130} tone="panel" />
          <Lines x={40} y={105} lines={['Phase I:', 'documents']} size={20} weight={700} anchor="start" />
          <Lines x={40} y={505} lines={['Phase II:', 'one model']} size={20} weight={700} anchor="start" />
          {[1, 2, 3, 4, 5, 6, 7].map((w, i) => (
            <Card key={w} x={bx(i)} y={75} w={128} h={60} lines={[`Week ${w}`]} size={18} weight={600} />
          ))}
          {[8, 9, 10, 11, 12, 13, 14].map((w, i) => (
            <Card key={w} x={bx(i)} y={475} w={128} h={60} lines={[`Week ${w}`]} size={18} weight={600} tone={w === 8 ? 'soft' : 'box'} strong={w === 8} />
          ))}
          <Line d="M 230 300 C 500 270, 800 330, 1290 296" accent width={2.4} />
          <Lines x={765} y={262} lines={['stable IDs (ENT, EXT, STK, CON, NEED, REQ …)']} size={17} weight={600} ink="accent" />
          {LANES.flatMap(([from, to]) => {
            const t = parseInt(to.match(/\d+/)![0], 10) - 8
            return (from.match(/\d+/g) ?? []).map((s) => {
              const f = parseInt(s, 10) - 1
              const first = from === 'Week 1'
              const x1 = bx(f) + 64 + (t - f) * 3
              const x2 = bx(t) + 64 - (t - f) * 3
              return <Arrow key={`${from}-${to}-${s}`} d={`M ${x1} 137 C ${x1} 300, ${x2} 320, ${x2} 470`} id={id} tone={first ? 'accent' : 'ink'} dashed={!first} width={first ? 3.6 : 1.8} />
            })
          })}
        </>
      )}
    </Svg>
  )
}

/** One aircraft, three selective models, each with the concern it serves. */
export function ThreeModelsFigure({ alt }: { alt: string }) {
  const st = { stroke: 'var(--wb-fg)', strokeWidth: 2.4, fill: 'none', strokeLinecap: 'round' as const }
  const aircraft = (cx: number, cy: number, s: number) => (
    <g>
      <ellipse cx={cx} cy={cy} rx={70 * s} ry={20 * s} style={{ ...st, fill: 'var(--wb-panel)' }} />
      <path d={`M ${cx - 110 * s} ${cy - 34 * s} L ${cx - 30 * s} ${cy - 34 * s} M ${cx + 30 * s} ${cy - 34 * s} L ${cx + 110 * s} ${cy - 34 * s} M ${cx - 70 * s} ${cy - 34 * s} L ${cx - 50 * s} ${cy - 10 * s} M ${cx + 70 * s} ${cy - 34 * s} L ${cx + 50 * s} ${cy - 10 * s} M ${cx - 40 * s} ${cy + 20 * s} L ${cx - 50 * s} ${cy + 36 * s} M ${cx + 40 * s} ${cy + 20 * s} L ${cx + 50 * s} ${cy + 36 * s}`} style={st} />
    </g>
  )
  const panel = (x: number, y: number, w: number, h: number, title: string, concern: string, child: ReactNode) => (
    <g>
      <Shape x={x} y={y} w={w} h={h} tone="panel" />
      <Lines x={x + w / 2} y={y + 26} lines={[title]} size={19} weight={700} />
      {child}
      <Lines x={x + w / 2} y={y + h - 34} lines={wrap(`Concern: ${concern}`, 42)} size={16} ink="accent" weight={600} />
    </g>
  )
  return (
    <Svg w={1300} h={680} alt={alt}>
      {() => (
        <>
          <Line d="M 650 300 L 340 160" dashed />
          <Line d="M 650 300 L 960 160" dashed />
          <Line d="M 650 340 L 650 450" dashed />
          <Lines x={500} y={210} lines={['mapping']} size={15} ink="muted" italic />
          <Lines x={800} y={210} lines={['mapping']} size={15} ink="muted" italic />
          <Lines x={700} y={400} lines={['mapping']} size={15} ink="muted" italic />
          {aircraft(650, 330, 1.25)}
          <Lines x={650} y={392} lines={['AeroLink air taxi']} size={17} weight={600} />
          {panel(40, 30, 400, 250, 'physical model', 'does the cabin fit four seats?', (
            <g>
              {aircraft(240, 130, 0.7)}
              <path d="M 240 150 L 240 200 M 200 200 L 280 200" style={st} />
            </g>
          ))}
          {panel(860, 30, 400, 250, 'mathematical model', 'can it reach the next vertiport?', <Lines x={1060} y={130} lines={['range = speed × flight time']} size={22} weight={600} />)}
          {panel(380, 450, 540, 210, 'logical model', 'what fails if the battery fails?', (
            <g>
              {['battery', 'motors', 'rotors'].map((t, i) => (
                <Card key={t} x={420 + i * 170} y={505} w={120} h={46} lines={[t]} size={17} />
              ))}
              <path d="M 540 528 L 588 528 M 710 528 L 758 528" className="f-arrow" fill="none" />
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

/** Abstract syntax, concrete syntax and semantics; what a tool checks and what it cannot. */
export function SyntaxSemanticsFigure({ alt }: { alt: string }) {
  const layers = [
    { y: 70, title: 'Semantics: what it means', sub: '' },
    { y: 250, title: 'Concrete syntax: how it is written', sub: 'text, diagrams, tables' },
    { y: 430, title: 'Abstract syntax: what may exist', sub: 'constructs and the rules for combining them' },
  ]
  return (
    <Svg w={1300} h={620} alt={alt}>
      {(id) => (
        <>
          {layers.map((l, i) => (
            <g key={l.title}>
              <Shape x={60} y={l.y} w={720} h={130} tone={i === 0 ? 'panel' : 'soft'} />
              <Lines x={420} y={l.y + (l.sub ? 48 : 65)} lines={[l.title]} size={22} weight={700} />
              {l.sub && <Lines x={420} y={l.y + 88} lines={[l.sub]} size={18} ink="muted" />}
            </g>
          ))}
          <Card x={1000} y={340} w={240} h={110} lines={['modeling', 'tool']} tone="soft" size={21} weight={700} strong />
          <Arrow d="M 1000 420 C 900 440, 860 480, 790 495" id={id} tone="accent" width={3} />
          <Arrow d="M 1000 370 C 900 340, 860 320, 790 315" id={id} tone="accent" width={3} />
          <Check x={880} y={455} />
          <Check x={880} y={318} />
          <Lines x={1120} y={500} lines={['conforms to the rules']} size={17} weight={600} ink="accent" />
          <Arrow d="M 1120 340 C 1120 200, 1000 140, 800 135" id={id} tone="warn" dashed width={2.4} />
          <text x={780} y={110} textAnchor="middle" fontSize={40} fontWeight={700} style={WARN_INK}>
            ?
          </text>
          <Lines x={1130} y={220} lines={['means what', 'you intend?']} size={18} weight={700} ink="warn" anchor="start" />
        </>
      )}
    </Svg>
  )
}

/** Nine documents kept in step by hand, against one model element the others relate to. */
export function DocsVsModelFigure({ alt }: { alt: string }) {
  const pos = [
    [60, 110], [250, 90], [440, 120], [80, 260], [270, 290], [460, 270], [60, 430], [260, 470], [450, 440],
  ]
  const others = NINE_PLACES.filter((p) => p.id !== 'Data Sheet')
  const cx = 960
  const cy = 360
  return (
    <Svg w={1320} h={680} alt={alt}>
      {(id) => (
        <>
          <Shape x={20} y={20} w={620} h={640} tone="panel" />
          <Shape x={670} y={20} w={630} h={640} tone="panel" />
          <Lines x={330} y={54} lines={['document-centric']} size={21} weight={700} />
          <Lines x={985} y={54} lines={['model-based']} size={21} weight={700} />
          {[[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [2, 5], [3, 6], [6, 7], [7, 8], [5, 8], [4, 7]].map(([a, b]) => (
            <Arrow key={`${a}-${b}`} d={`M ${pos[a][0] + 70} ${pos[a][1] + 40} L ${pos[b][0] + 70} ${pos[b][1] + 40}`} id={id} tone="muted" dashed both />
          ))}
          {NINE_PLACES.map((p, i) => (
            <Doc key={p.id} x={pos[i][0]} y={pos[i][1]} w={140} h={80} lines={[p.id]} size={16} />
          ))}
          <Chip cx={330} cy={620} text="keep in step (by hand)" size={16} tone="dash" ink="muted" />
          {others.map((p, i) => {
            const a = (i / others.length) * Math.PI * 2 - Math.PI / 2
            const x = cx + Math.cos(a) * 230
            const y = cy + Math.sin(a) * 215
            return (
              <g key={p.id}>
                <Line d={`M ${cx} ${cy} L ${x} ${y}`} accent width={2.2} />
                <Lines x={(cx + x) / 2} y={(cy + y) / 2 - 12} lines={[p.how]} size={15} weight={600} ink="accent" />
                <Card x={x - 66} y={y - 22} w={132} h={44} lines={[p.id]} size={16} weight={600} />
              </g>
            )
          })}
          <Card x={cx - 150} y={cy - 38} w={300} h={76} lines={['chargeTimeToDispatch', '= 20 min']} tone="soft" size={18} weight={700} strong mono />
        </>
      )}
    </Svg>
  )
}

/** Benefits against upkeep, with the hybrid corner. */
export function BalanceFigure({ alt }: { alt: string }) {
  const left = ['inconsistencies surface while modeling', 'one source reduces miscommunication', 'easier to search and extract']
  const right = ['regular model updates', 'learning the language and tool', 'model drift if neglected']
  const st = { stroke: 'var(--wb-fg)', strokeWidth: 3, fill: 'none', strokeLinecap: 'round' as const }
  const pan = (x: number, items: string[], title: string) => (
    <g>
      <path d={`M ${x + 30} 420 L ${x + 330} 420 L ${x + 300} 450 L ${x + 60} 450 Z`} style={{ ...st, fill: 'var(--wb-panel)' }} />
      {items.map((t, i) => (
        <Card key={t} x={x + 20} y={350 - i * 74} w={320} h={62} lines={wrap(t, 30)} size={16} tone={title === 'benefits' ? 'soft' : 'dash'} weight={600} />
      ))}
      <Lines x={x + 180} y={130} lines={[title]} size={20} weight={700} ink={title === 'benefits' ? 'accent' : 'muted'} />
    </g>
  )
  return (
    <Svg w={1300} h={640} alt={alt}>
      {(id) => (
        <>
          <path d="M 650 150 L 650 520 M 560 540 L 740 540 M 610 540 L 650 500 L 690 540" style={st} />
          <path d="M 270 160 L 1030 160" style={st} />
          <path d="M 270 160 L 270 420 M 1030 160 L 1030 420" style={{ ...st, strokeWidth: 1.6 }} />
          {pan(90, left, 'benefits')}
          {pan(850, right, 'upkeep')}
          <Lines x={650} y={585} lines={['benefits shrink when the model falls out of date']} size={18} weight={600} italic />
          <Cylinder cx={980} y={500} w={70} h={80} lines={[]} />
          <Arrow d="M 1020 545 L 1110 545" id={id} />
          <Doc x={1120} y={505} w={70} h={86} lines={[]} />
          <Lines x={1050} y={612} lines={['hybrid: documents generated for milestones']} size={15} ink="muted" />
        </>
      )}
    </Svg>
  )
}

/** A precisely dimensioned chair with one short leg. */
export function ChairFigure({ alt }: { alt: string }) {
  const st = { stroke: 'var(--wb-fg)', strokeWidth: 3.2, fill: 'none', strokeLinecap: 'round' as const }
  const legs = [
    { x: 420, y: 330, b: 520 },
    { x: 520, y: 290, b: 480 },
    { x: 760, y: 330, b: 500, short: true },
    { x: 860, y: 290, b: 480 },
  ]
  return (
    <Svg w={1300} h={680} alt={alt}>
      {(id) => (
        <>
          <path d="M 420 330 L 760 330 L 860 290 L 520 290 Z" style={{ ...st, fill: 'var(--wb-panel)' }} />
          <path d="M 520 290 L 520 110 L 860 110 L 860 290 M 520 160 L 860 160 M 520 210 L 860 210" style={st} />
          {legs.map((l, i) => (
            <g key={i}>
              <path d={`M ${l.x} ${l.y} L ${l.x} ${l.b}`} style={st} />
              <path d={`M ${l.x - 26} ${l.y} L ${l.x - 26} ${l.b}`} fill="none" style={{ stroke: 'var(--wb-muted)', strokeWidth: 1.4 }} markerStart={`url(#${id}-muted)`} markerEnd={`url(#${id}-muted)`} />
              <Lines x={l.x - 34} y={(l.y + l.b) / 2} lines={[`leg ${i + 1}`]} size={15} anchor="end" ink="muted" />
            </g>
          ))}
          <path d="M 420 560 L 760 560" fill="none" style={{ stroke: 'var(--wb-muted)', strokeWidth: 1.4 }} markerStart={`url(#${id}-muted)`} markerEnd={`url(#${id}-muted)`} />
          <Lines x={590} y={580} lines={['seat width']} size={15} ink="muted" />
          <path d="M 760 520 L 760 500" style={{ stroke: 'var(--wb-warn)', strokeWidth: 2, strokeDasharray: '4 3' }} />
          <Arrow d="M 960 440 L 775 505" id={id} tone="warn" />
          <Lines x={970} y={430} lines={['design: wobbles']} size={20} weight={700} ink="warn" anchor="start" />
          <Check x={990} y={150} />
          <Lines x={1010} y={150} lines={['model: precise']} size={20} weight={700} ink="accent" anchor="start" />
          <Card x={200} y={605} w={900} h={56} lines={['root package doc: purpose, who uses the model and for which decisions']} tone="soft" size={18} weight={600} />
        </>
      )}
    </Svg>
  )
}

/** One model, three views, each for a stakeholder's concern inside a viewpoint. */
export function ModelViewsFigure({ alt }: { alt: string }) {
  const views = [
    { y: 30, label: 'stakeholder table view', who: 'the review board', q: 'who holds which concern?', kind: 'table' },
    { y: 250, label: 'context diagram view', who: 'the architect', q: 'what crosses the boundary?', kind: 'diagram' },
    { y: 470, label: 'textual view', who: 'the modeler', q: 'what exactly is declared?', kind: 'text' },
  ]
  return (
    <Svg w={1320} h={700} alt={alt}>
      {(id) => (
        <>
          <Cylinder cx={220} y={250} w={260} h={200} lines={['AeroLink', 'model']} />
          {views.map((v) => {
            const vx = 600
            return (
              <g key={v.label}>
                <rect x={560} y={v.y - 10} width={740} height={210} rx={10} fill="none" style={{ stroke: 'var(--wb-muted)', strokeWidth: 1.6 }} strokeDasharray="8 6" />
                <Lines x={1290} y={v.y + 8} lines={['viewpoint']} size={15} anchor="end" ink="muted" italic />
                <Arrow d={`M 350 350 C 450 350, 480 ${v.y + 85}, ${vx - 8} ${v.y + 85}`} id={id} tone="accent" width={2.4} />
                <Shape x={vx} y={v.y + 20} w={290} h={130} tone="panel" />
                {v.kind === 'table' && [0, 1, 2, 3].map((r) => <Line key={r} d={`M ${vx + 15} ${v.y + 45 + r * 25} L ${vx + 275} ${v.y + 45 + r * 25}`} />)}
                {v.kind === 'table' && <Line d={`M ${vx + 130} ${v.y + 32} L ${vx + 130} ${v.y + 120}`} />}
                {v.kind === 'diagram' && (
                  <g>
                    <rect x={vx + 20} y={v.y + 50} width={80} height={45} rx={5} className="f-shape" />
                    <rect x={vx + 190} y={v.y + 50} width={80} height={45} rx={5} className="f-shape" />
                    <path d={`M ${vx + 100} ${v.y + 72} L ${vx + 190} ${v.y + 72}`} className="f-arrow" fill="none" />
                  </g>
                )}
                {v.kind === 'text' && [0, 1, 2, 3].map((r) => <Line key={r} d={`M ${vx + 20 + (r % 2) * 24} ${v.y + 50 + r * 22} L ${vx + 250 - r * 30} ${v.y + 50 + r * 22}`} width={3} />)}
                <Lines x={vx + 145} y={v.y + 172} lines={[v.label]} size={17} weight={700} />
                <Stick x={960} y={v.y + 50} s={0.9} />
                <Lines x={1000} y={v.y + 60} lines={[v.who]} size={17} weight={700} anchor="start" />
                <Lines x={1000} y={v.y + 100} lines={wrap(v.q, 24)} size={17} anchor="start" ink="accent" weight={600} />
              </g>
            )
          })}
          <Lines x={450} y={240} lines={['query + rendering']} size={16} weight={600} ink="accent" />
        </>
      )}
    </Svg>
  )
}

const CONTRASTS: [string, string][] = [
  ['UML profile', 'own metamodel'],
  ['nine diagram types', 'views and viewpoints'],
  ['diagrams as the model', 'text, diagrams and tables as renderings'],
  ['tool files', 'a standard API'],
]
/** The same part definition in the graphical and textual notation, and four v1 → v2 contrasts. */
export function TwoNotationsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={1300} h={640} alt={alt}>
      {(id) => (
        <>
          <Shape x={40} y={20} w={560} h={330} tone="panel" />
          <Shape x={700} y={20} w={560} h={330} tone="panel" />
          <Lines x={320} y={52} lines={['graphical notation']} size={21} weight={700} />
          <Lines x={980} y={52} lines={['textual notation']} size={21} weight={700} />
          {[
            { y: 85, name: 'PartDef1' },
            { y: 215, name: '<PD2> PartDef2' },
          ].map((b) => (
            <g key={b.name}>
              <Shape x={170} y={b.y} w={300} h={100} />
              <Lines x={320} y={b.y + 32} lines={['«part def»']} size={18} />
              <Lines x={320} y={b.y + 66} lines={[b.name]} size={20} weight={700} />
            </g>
          ))}
          <Lines x={760} y={170} lines={['part def PartDef1;']} size={22} weight={600} anchor="start" mono />
          <Lines x={760} y={250} lines={['part def <PD2> PartDef2;']} size={22} weight={600} anchor="start" mono />
          <Arrow d="M 610 185 L 690 185" id={id} tone="accent" width={3} both />
          <Lines x={650} y={150} lines={['same', 'element']} size={16} weight={700} ink="accent" />
          <Lines x={650} y={400} lines={['SysML v1 to SysML v2']} size={20} weight={700} />
          {CONTRASTS.map(([a, b], i) => (
            <g key={a}>
              <Shape x={40 + i * 308} y={430} w={290} h={180} tone="soft" />
              <Lines x={185 + i * 308} y={470} lines={wrap(a, 26)} size={17} ink="muted" />
              <Arrow d={`M ${185 + i * 308} 495 L ${185 + i * 308} 525`} id={id} />
              <Lines x={185 + i * 308} y={565} lines={wrap(b, 24)} size={17} weight={700} />
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

const LAYERS = [
  { name: 'Root', what: 'syntactic elements without model-level semantics', words: 'element, comment, namespace, relationship, import, dependency' },
  { name: 'Core', what: 'fundamental semantic concepts with a direct mapping to formal logic', words: 'type, classifier, feature, multiplicity, specialization' },
  { name: 'Kernel', what: 'the foundation for building modeling languages', words: 'class, data type, behavior, function, metadata, package' },
  { name: 'Systems', what: 'the modeling language for systems engineering', words: 'part, attribute, port, action, state, requirement, concern, view' },
]
/** The four-layer language architecture with KerML and SysML brackets. */
export function FourLayersFigure({ alt }: { alt: string }) {
  const y = (i: number) => 510 - i * 140
  return (
    <Svg w={1300} h={660} alt={alt}>
      {() => (
        <>
          {LAYERS.map((l, i) => (
            <g key={l.name}>
              <Shape x={60} y={y(i)} w={1000} h={124} tone={i === 3 ? 'soft' : 'panel'} strong={i === 3} />
              <Lines x={90} y={y(i) + 40} lines={[l.name]} size={26} weight={700} anchor="start" />
              <Lines x={260} y={y(i) + 40} lines={[l.what]} size={19} anchor="start" />
              <Lines x={260} y={y(i) + 86} lines={[l.words]} size={17} anchor="start" ink="muted" mono />
            </g>
          ))}
          <VBracket x={1090} y1={y(2)} y2={y(0) + 124} label="KerML" />
          <VBracket x={1090} y1={y(3)} y2={y(3) + 124} label="SysML" />
        </>
      )}
    </Svg>
  )
}

/** An ownership tree with a cross-branch relationship and a deleted subtree. */
export function OwnershipTreeFigure({ alt }: { alt: string }) {
  const pid = useId().replace(/:/g, '')
  return (
    <Svg w={1300} h={640} alt={alt}>
      {(id) => (
        <>
          <defs>
            <pattern id={`${pid}-hatch`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" style={{ stroke: 'var(--wb-muted)', strokeWidth: 2 }} />
            </pattern>
          </defs>
          <Card x={460} y={40} w={340} h={70} lines={['package Stakeholders']} tone="soft" size={20} weight={700} strong />
          <Line d="M 630 110 L 630 160 L 330 160 L 330 220 M 630 160 L 930 160 L 930 220" width={2.4} />
          <Card x={170} y={220} w={320} h={70} lines={["part def STK-005"]} size={19} weight={600} mono />
          <Line d="M 330 290 L 330 400" width={2.4} />
          <Card x={170} y={400} w={320} h={70} lines={['metadata annotation']} size={19} />
          <g opacity={0.55}>
            <rect x={770} y={220} width={320} height={70} rx={7} className="f-env" />
            <rect x={770} y={220} width={320} height={70} rx={7} fill={`url(#${pid}-hatch)`} style={{ stroke: 'var(--wb-muted)', strokeWidth: 1.8 }} strokeDasharray="6 4" />
          </g>
          <Lines x={930} y={255} lines={['concern CON-006']} size={19} weight={600} mono />
          <Cross x={1090} y={220} circle />
          <Lines x={930} y={320} lines={['deleted with it']} size={17} weight={700} ink="warn" />
          <Arrow d="M 790 290 C 700 380, 560 330, 495 270" id={id} dashed tone="accent" width={2.2} />
          <Lines x={640} y={390} lines={['relationship: stakeholder', 'typed by STK-005']} size={16} weight={600} ink="accent" />
          <Shape x={760} y={470} w={500} h={120} tone="dash" />
          <Lines x={1010} y={530} lines={['element ID: managed by the tool;', 'name and short name: written in the text']} size={17} />
        </>
      )}
    </Svg>
  )
}

const PHASE_WORDS: [string, string][] = [
  ['enterprise', 'a part definition in Context'],
  ['system of interest', 'the part the context refers to'],
  ['subsystem', 'parts inside it (Week 11)'],
  ['component', 'parts inside it (Week 11)'],
  ['external system', 'a part usage in the context part'],
]
/** Phase I words all become parts, at different places. */
export function AllPartsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={1300} h={620} alt={alt}>
      {(id) => (
        <>
          <Card x={980} y={220} w={280} h={160} lines={['part', '(part def and', 'part usage)']} tone="soft" size={21} weight={700} strong />
          {PHASE_WORDS.map(([w, note], i) => {
            const y = 50 + i * 112
            return (
              <g key={w}>
                <Shape x={40} y={y} w={260} h={60} rx={30} />
                <Lines x={170} y={y + 30} lines={[w]} size={19} weight={700} />
                <Lines x={330} y={y + 30} lines={[note]} size={17} anchor="start" ink="muted" />
                <Arrow d={`M 700 ${y + 30} C 850 ${y + 30}, 860 300, 972 300`} id={id} tone="accent" width={2} />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

/** One definition, usages in two contexts, instances below. */
export function DefUsageChargerFigure({ alt }: { alt: string }) {
  const bolt = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={44} height={60} rx={6} className="f-shape" />
      <path d={`M ${x + 26} ${y + 10} L ${x + 14} ${y + 32} L ${x + 24} ${y + 32} L ${x + 18} ${y + 52} L ${x + 32} ${y + 26} L ${x + 22} ${y + 26} Z`} style={{ fill: 'var(--wb-fg)' }} />
    </g>
  )
  const ctx = [
    { x: 260, label: 'hub vertiport' },
    { x: 800, label: 'spoke vertiport' },
  ]
  return (
    <Svg w={1300} h={660} alt={alt}>
      {(id) => (
        <>
          {[
            { y: 20, h: 140, t: 'definition' },
            { y: 190, h: 220, t: 'usages' },
            { y: 440, h: 200, t: 'instances (not in the model text)' },
          ].map((b) => (
            <g key={b.t}>
              <Shape x={20} y={b.y} w={1260} h={b.h} tone="panel" />
              <Lines x={40} y={b.y + 26} lines={wrap(b.t, 18)} size={17} weight={700} anchor="start" ink="muted" />
            </g>
          ))}
          <Card x={530} y={55} w={300} h={70} lines={['part def Charger']} tone="soft" size={21} weight={700} strong mono />
          {ctx.map((c) => (
            <g key={c.label}>
              <Shape x={c.x} y={215} w={340} h={175} />
              <Lines x={c.x + 170} y={240} lines={[c.label]} size={18} weight={700} />
              <Card x={c.x + 20} y={290} w={300} h={64} lines={['part chargers : Charger']} size={17} mono />
              <Arrow d={`M ${c.x + 170} 288 L ${c.x + 170 < 680 ? 640 : 720} 130`} id={id} tone="accent" width={2.4} />
              {[0, 1, 2].map((k) => (
                <g key={k}>
                  <Line d={`M ${c.x + 170} 356 L ${c.x + 70 + k * 100} 500`} dotted width={2} />
                  {bolt(c.x + 48 + k * 100, 500)}
                </g>
              ))}
            </g>
          ))}
          <Lines x={680} y={235} lines={['defined by']} size={17} weight={600} ink="accent" />
          <Lines x={680} y={470} lines={['plays the role']} size={16} ink="muted" italic />
        </>
      )}
    </Svg>
  )
}

/** Reading :> by what stands on its left, with the recorded failing example. */
export function SymbolTreeFigure({ alt }: { alt: string }) {
  return (
    <Svg w={1300} h={680} alt={alt}>
      {(id) => (
        <>
          <Card x={300} y={20} w={700} h={76} lines={['Is the element on the left of :>', 'a definition or a usage?']} tone="soft" size={20} weight={700} strong />
          <Arrow d="M 500 96 L 330 190" id={id} width={2.4} />
          <Arrow d="M 800 96 L 970 190" id={id} width={2.4} />
          <Lines x={250} y={150} lines={['definition (part def, attribute def …)']} size={16} weight={600} ink="muted" />
          <Lines x={1110} y={150} lines={['usage (part, attribute …)']} size={16} weight={600} ink="muted" />
          <Card x={90} y={195} w={480} h={64} lines={['specialization (specializes)']} size={19} weight={700} />
          <Card x={90} y={285} w={480} h={64} lines={['on the right must stand a definition']} size={17} tone="panel" />
          <Card x={730} y={195} w={480} h={64} lines={['subsetting (subsets)']} size={19} weight={700} />
          <Card x={730} y={285} w={480} h={64} lines={['on the right must stand a usage (a feature)']} size={17} tone="panel" />
          <Shape x={680} y={380} w={580} h={140} tone="warn" />
          <Lines x={700} y={415} lines={['part hubs : HubVertiport[3] :> Vertiport;']} size={17} weight={600} anchor="start" mono />
          <Cross x={1230} y={415} />
          <Lines x={700} y={470} lines={['recorded: Couldn’t resolve reference', 'to Feature Vertiport']} size={16} anchor="start" />
          {[
            [':', 'defined by'],
            [':>', 'subsets'],
            [':>>', 'redefines'],
          ].map(([s, t], i) => (
            <g key={s}>
              <Shape x={190 + i * 320} y={570} w={280} h={70} tone="soft" />
              <Lines x={230 + i * 320} y={605} lines={[s]} size={24} weight={700} anchor="start" mono />
              <Lines x={300 + i * 320} y={605} lines={[t]} size={18} anchor="start" />
            </g>
          ))}
          <Lines x={110} y={605} lines={['usage forms']} size={16} ink="muted" weight={600} />
        </>
      )}
    </Svg>
  )
}

/** Three predict cards with their recorded results. */
export function PredictCardsFigure({ alt }: { alt: string }) {
  const cards = ['predict-block', 'predict-duplicate', 'predict-attribute-part'].map((k) => listing(k))
  return (
    <Svg w={1320} h={720} alt={alt}>
      {() => (
        <>
          {cards.map((l, i) => {
            const x = 20 + i * 432
            const code = l.lines.flatMap((ln) => wrapCode(ln, 40))
            const stamp = l.status === 'FAIL' ? 'FAIL' : 'PASS'
            const rec = wrap(l.recorded ?? '', 40)
            return (
              <g key={l.id}>
                <Shape x={x} y={20} w={410} h={680} tone="panel" />
                <Lines x={x + 205} y={48} lines={[`Card ${i + 1}`]} size={19} weight={700} />
                {code.map((c, j) => (
                  <Lines key={j} x={x + 18} y={88 + j * 23} lines={[c]} size={15} anchor="start" mono />
                ))}
                <g transform={`rotate(-6 ${x + 205} 470)`}>
                  <rect x={x + 105} y={440} width={200} height={60} rx={6} fill="none" style={{ stroke: stamp === 'FAIL' ? 'var(--wb-warn)' : 'var(--wb-accent)', strokeWidth: 3.4 }} strokeDasharray={stamp === 'FAIL' ? '9 4' : undefined} />
                  <Lines x={x + 205} y={470} lines={[stamp]} size={30} weight={800} ink={stamp === 'FAIL' ? 'warn' : 'accent'} />
                </g>
                <Lines x={x + 205} y={560 + ((rec.length - 1) * 19) / 2} lines={rec} size={15} lh={1.25} />
                {i === 2 && <Chip cx={x + 205} cy={665} text="PASS, but wrong" size={18} tone="warn" ink="warn" weight={700} />}
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

/** The tool proof as the course checker prints it (recorded run, read from the checker report), with callouts. */
export function CheckerRunFigure({ alt }: { alt: string }) {
  const cmd = ['$ python -I scripts/check_sysml.py models/tool_proof_pass.sysml', '      models/invalid_tool_proof_unquoted_id.sysml --report models/proof-report.json']
  const out = PROOF_OUTPUT.flatMap((l) => (l.length > 92 ? wrapCode(l, 92) : [l]))
  const rows = [...cmd, '', ...out]
  const top = 70
  const step = 30
  const H = top + rows.length * step + 40
  const at = (pred: (l: string) => boolean) => top + rows.findIndex(pred) * step
  const callouts: [number, string][] = [
    [at((l) => l.includes('release')), 'tool, release 2026-08, kernel 0.62.0'],
    [at((l) => l.startsWith('PASS')), 'PASS: no message under it'],
    [at((l) => l.trim().startsWith('ERROR')), 'ERROR line:column message'],
    [at((l) => l.includes('file(s):')), 'summary and report file'],
  ]
  return (
    <Svg w={1300} h={Math.max(H, 460)} alt={alt}>
      {(id) => (
        <>
          <Shape x={20} y={20} w={900} h={Math.max(H, 460) - 40} tone="panel" />
          <Shape x={20} y={20} w={900} h={34} tone="env" />
          <Lines x={40} y={37} lines={['terminal: sysml-checker/checker']} size={15} weight={600} anchor="start" mono />
          {rows.map((r, i) => (
            <Lines key={i} x={40} y={top + i * step} lines={[r]} size={15} anchor="start" mono ink={i < cmd.length ? 'accent' : r.startsWith('FAIL') || r.trim().startsWith('ERROR') ? 'warn' : 'ink'} weight={i < cmd.length || /^(PASS|FAIL)/.test(r) ? 700 : 500} />
          ))}
          {callouts.map(([y, label], i) => (
            <g key={label}>
              <Arrow d={`M 960 ${y} L 924 ${y}`} id={id} tone="accent" />
              <circle cx={980} cy={y} r={14} style={{ fill: 'var(--wb-accent)' }} />
              <text x={980} y={y} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={700} style={{ fill: 'var(--wb-panel)' }}>
                {i + 1}
              </text>
              <Lines x={1004} y={y} lines={wrap(label, 22)} size={17} weight={600} anchor="start" ink="accent" />
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

/** The exit ticket and the before-Session-2 checklist. */
export function ExitTicketFigure({ alt }: { alt: string }) {
  const items = ['install the checker (guide on the Laboratory page): one per team, your own optional', 'run both tool-proof files: PASS, then FAIL at line 9', 'bring your Week 7 package’s list of ID kinds']
  return (
    <Svg w={1300} h={600} alt={alt}>
      {() => (
        <>
          <Shape x={40} y={60} w={580} h={460} tone="soft" strong />
          <path d="M 40 130 L 620 130" fill="none" style={{ stroke: 'var(--wb-muted)', strokeWidth: 2 }} strokeDasharray="4 6" />
          <Lines x={330} y={96} lines={['Exit ticket']} size={24} weight={700} />
          {[
            ['1', 'One place your Week 7 package repeats a value'],
            ['2', 'In part x : A :> y;, what is y?'],
          ].map(([n, t], i) => (
            <g key={n}>
              <Lines x={70} y={185 + i * 170} lines={[`${n}.`]} size={22} weight={700} anchor="start" />
              <Lines x={105} y={185 + i * 170} lines={wrap(t, 40)} size={19} anchor="start" />
              <Line d={`M 105 ${250 + i * 170} L 590 ${250 + i * 170}`} />
            </g>
          ))}
          <Shape x={680} y={60} w={580} h={460} tone="panel" />
          <Lines x={970} y={96} lines={['before Session 2']} size={24} weight={700} />
          {items.map((t, i) => (
            <g key={t}>
              <rect x={710} y={160 + i * 115} width={30} height={30} rx={4} fill="none" style={{ stroke: 'var(--wb-fg)', strokeWidth: 2.2 }} />
              <Lines x={760} y={175 + i * 115 + (wrap(t, 38).length - 1) * 11} lines={wrap(t, 38)} size={18} anchor="start" />
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}
