// Static figures for the opener and L1–L4 (WEEK1_LEARNING_DESIGN §4–§5). Labels come from the reviewed content or the
// instructor reference model; numbers come from the dynamics model (FICTIONAL).
import { useId, useState } from 'react'
import { resolveBullet } from '../../content/learn/resolve'
import { LOOP_LINKS } from '../../content/causalLoops'
import { CHARGE_CAP_6, F4_ALONE, F4_DELIVERED, F4_FLEET, F4_PER_AIRCRAFT_DAY } from '../../content/learn/week01'
import { REFERENCE_BY_WEEK } from '../../model/reference'
import { DEFAULT_PARAMS, simulate } from '../../sim/aerolink'
import { Box, Markers } from './Frame'

const fmt = (x: number) => Math.round(x).toLocaleString('en-US')

// ------------------------------------------------------------------------------------------- opener: the jam
/** Two lanes of cars, bumper to bumper, brake lights on (review W1F-F28); one car is magnified. */
const JAM_LANES = [
  { y: 102, x0: 4 },
  { y: 132, x0: 30 },
]
const JAM_FOCUS = { lane: 1, i: 6 }
export function JamFigure({ alt }: { alt: string }) {
  const cars = Array.from({ length: 12 }, (_, i) => i)
  const fx = JAM_LANES[JAM_FOCUS.lane].x0 + JAM_FOCUS.i * 52 + 24
  return (
    <svg viewBox="0 40 640 160" className="lf-svg lf-svg-jam" role="img" aria-label={alt}>
      <rect x={0} y={96} width={640} height={60} className="f-road" />
      <line x1={0} x2={640} y1={126} y2={126} className="f-lane" />
      {JAM_LANES.map((lane, l) =>
        cars.map((i) => {
          const x = lane.x0 + i * 52
          if (x + 48 > 640) return null
          const focus = l === JAM_FOCUS.lane && i === JAM_FOCUS.i
          return (
            <g key={`${l}-${i}`} transform={`translate(${x}, ${lane.y})`}>
              <rect width={48} height={18} rx={5} className={focus ? 'f-car-focus' : 'f-car'} />
              <rect x={0.5} y={2} width={3.5} height={4} rx={1} className="f-brake" />
              <rect x={0.5} y={12} width={3.5} height={4} rx={1} className="f-brake" />
            </g>
          )
        }),
      )}
      <circle cx={fx} cy={141} r={40} className="f-lens" />
      <line x1={fx + 28} y1={170} x2={fx + 54} y2={192} className="f-lens-handle" />
      <text x={fx} y={60} textAnchor="middle" fontSize={16} fontWeight={600} className="f-ink">
        the jam is not in here
      </text>
      <line x1={fx} y1={68} x2={fx} y2={98} className="f-pointer" />
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- L1: open system
/** Exchange labels: short phrases from the instructor reference model's EXT descriptions (src/model/reference/week01.ts). */
const EXCHANGE: Record<string, string[]> = {
  'EXT-001': ['airspace', 'access'],
  'EXT-002': ['power'],
  'EXT-003': ['constrains', 'operations'],
  'EXT-004': ['aircraft,', 'lead time'],
  'EXT-005': ['passengers'],
  'EXT-006': ['incident', 'response'],
}
/** Exchanges that act one way only, into the boundary (review W1F-F22: weather is not exchanged both ways). */
const ONE_WAY_IN = new Set(['EXT-003'])

/** Wraps a name into lines of at most `max` characters, at word boundaries. */
const wrap = (name: string, max = 17) =>
  name.split(' ').reduce<string[]>((lines, w) => {
    const last = lines.at(-1)
    if (last !== undefined && (last + ' ' + w).length <= max) lines[lines.length - 1] = last + ' ' + w
    else lines.push(w)
    return lines
  }, [])

export function OpenSystemFigure({ alt }: { alt: string }) {
  const id = useId().replace(/:/g, '')
  const ext = REFERENCE_BY_WEEK[1].elements.filter((e) => e.kind === 'EXT')
  const start = simulate({ ...DEFAULT_PARAMS, months: 0 })[0]
  const left = ext.slice(0, 3)
  const right = ext.slice(3, 6)
  const rowY = (i: number) => 36 + i * 100
  const W = 150
  return (
    <svg viewBox="0 0 760 360" className="lf-svg" role="img" aria-label={alt}>
      <Markers id={id} />
      {/* the boundary */}
      <rect x={250} y={24} width={260} height={276} rx={28} className="f-boundary" />
      <text x={380} y={48} textAnchor="middle" fontSize={14} fontWeight={600} className="f-accent-ink">
        AeroLink service enterprise
      </text>
      <text x={380} y={66} textAnchor="middle" fontSize={12} className="f-muted">
        boundary (system of interest)
      </text>
      {/* elements and the links between them: demand → operations centre → fleet → chargers */}
      <Box x={272} y={80} w={96} h={44} lines={['Fleet']} tone="soft" />
      <Box x={392} y={80} w={96} h={44} lines={['Vertiports', '& chargers']} tone="soft" size={13} />
      <Box x={272} y={148} w={96} h={44} lines={['Operations', 'centre']} tone="soft" size={13} />
      <Box x={392} y={148} w={96} h={44} lines={['Passenger', 'demand']} tone="soft" size={13} />
      <line x1={391} y1={170} x2={370} y2={170} className="f-arrow" markerEnd={`url(#${id}-ink)`} />
      <line x1={320} y1={147} x2={320} y2={126} className="f-arrow" markerEnd={`url(#${id}-ink)`} />
      <line x1={369} y1={102} x2={390} y2={102} className="f-arrow" markerEnd={`url(#${id}-ink)`} />
      <text x={380} y={212} textAnchor="middle" fontSize={12} className="f-muted">
        elements interact
      </text>
      {/* state panel */}
      <g>
        <rect x={272} y={226} width={216} height={60} rx={6} className="f-panel" />
        <text x={284} y={244} fontSize={12} fontWeight={600} className="f-ink">
          State, month 0 (FICTIONAL)
        </text>
        <text x={284} y={264} fontSize={12} className="f-ink">
          Riders {fmt(start.riders)} · Fleet {start.fleet}
        </text>
        <text x={284} y={280} fontSize={12} className="f-ink">
          Waiting time {start.waitMin.toFixed(1)} min
        </text>
      </g>
      {[left, right].map((side, s) =>
        side.map((e, i) => {
          const x = s === 0 ? 8 : 760 - 8 - W
          const y = rowY(i)
          const bx = s === 0 ? 250 : 510
          const ax = s === 0 ? x + W : x
          const name = wrap(e.name.replace(' (OEM)', ''))
          const h = 24 + name.length * 15
          const cy = y + h / 2
          const oneWay = ONE_WAY_IN.has(e.id)
          return (
            <g key={e.id}>
              <Box x={x} y={y} w={W} h={h} lines={[e.id, ...name]} size={11.5} />
              <line x1={ax} y1={cy} x2={bx} y2={cy} className="f-arrow" markerStart={oneWay ? undefined : `url(#${id}-ink)`} markerEnd={`url(#${id}-ink)`} />
              <text textAnchor="middle" fontSize={11} className="f-edge-label">
                {EXCHANGE[e.id].map((t, k, all) => (
                  <tspan key={k} x={(ax + bx) / 2} y={cy - 8 - (all.length - 1 - k) * 13}>
                    {t}
                  </tspan>
                ))}
              </text>
            </g>
          )
        }),
      )}
      <text x={8 + W / 2} y={342} textAnchor="middle" fontSize={12} className="f-muted">
        environment
      </text>
      <text x={760 - 8 - W / 2} y={342} textAnchor="middle" fontSize={12} className="f-muted">
        environment
      </text>
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- L2: three boundaries
const LAYERS = [
  { id: 'A', name: 'The aircraft', bullet: 0, rect: { x: 300, y: 150, w: 150, h: 70 } },
  { id: 'B', name: 'Flight operations', bullet: 1, rect: { x: 230, y: 100, w: 300, h: 160 } },
  { id: 'C', name: 'Service enterprise', bullet: 2, rect: { x: 150, y: 40, w: 460, h: 270 } },
] as const

export function BoundaryLayers({ alt }: { alt: string }) {
  const [sel, setSel] = useState<'A' | 'B' | 'C'>('C')
  const name = useId()
  const layer = LAYERS.find((l) => l.id === sel)!
  return (
    <div>
      <fieldset className="lf-segmented" aria-describedby={`${name}-bullet`}>
        <legend className="lf-label">Choose a system of interest</legend>
        {LAYERS.map((l) => (
          <label key={l.id} className={sel === l.id ? 'is-on' : ''}>
            <input type="radio" name={name} value={l.id} checked={sel === l.id} onChange={() => setSel(l.id)} />
            <span>
              <strong>{l.id}</strong> {l.name}
            </span>
          </label>
        ))}
      </fieldset>
      <div className="lf-figure-scroll" tabIndex={0} role="group" aria-label="Three boundaries (drawing; scrolls sideways on small screens)">
        <svg viewBox="0 0 760 350" className="lf-svg" role="img" aria-label={alt}>
          {/* environment (synthesis ring) */}
          <rect x={10} y={10} width={740} height={330} rx={18} className="f-env" />
          <text x={24} y={34} fontSize={12.5} className="f-muted">
            Environment: urban transport system · shared airspace system
          </text>
          {LAYERS.slice()
            .reverse()
            .map((l) => (
              <g key={l.id} className={sel === l.id ? 'f-layer-on' : 'f-layer'}>
                <rect x={l.rect.x} y={l.rect.y} width={l.rect.w} height={l.rect.h} rx={20} className="f-layer-shape" />
                <text x={l.rect.x + 14} y={l.rect.y + 22} fontSize={13.5} fontWeight={600} className="f-layer-label">
                  {l.id} · {l.name}
                </text>
              </g>
            ))}
          {/* contents */}
          <text x={375} y={196} textAnchor="middle" fontSize={12} className="f-ink">
            turnaround · seats · range
          </text>
          <text x={380} y={244} textAnchor="middle" fontSize={12} className="f-ink">
            fleet size · dispatch · schedule · utilisation
          </text>
          <text x={380} y={288} textAnchor="middle" fontSize={12} className="f-ink">
            vertiports & charging · operations centre · demand
          </text>
          {/* the waiting-time token: outside A, straddling B (its charging cause outside), inside C */}
          <g>
            <rect x={470} y={140} width={128} height={32} rx={16} className="f-token" />
            <text x={534} y={156} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600} className="f-token-label">
              waiting time
            </text>
          </g>
        </svg>
      </div>
      <p id={`${name}-bullet`} className="lf-figure-note" aria-live="polite">
        <strong>
          {layer.id} · {layer.name}.
        </strong>{' '}
        {resolveBullet('w1-worked', layer.bullet).replace(/^SoI = [^.]*?\. /, '')}
      </p>
    </div>
  )
}

// ------------------------------------------------------------------------------------------- L3: analysis and synthesis
export function DownAndUp({ alt }: { alt: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 760 300" className="lf-svg" role="img" aria-label={alt}>
      <Markers id={id} />
      <text x={190} y={22} textAnchor="middle" fontSize={15} fontWeight={600} className="f-ink">
        Analysis
      </text>
      <text x={570} y={22} textAnchor="middle" fontSize={15} fontWeight={600} className="f-ink">
        Synthesis
      </text>
      <line x1={380} x2={380} y1={10} y2={290} className="f-divider" />
      {/* analysis tree */}
      <Box x={95} y={44} w={190} h={46} lines={['AeroLink service', 'enterprise']} tone="soft" size={13} bold />
      {[['Fleet'], ['Chargers'], ['Operations', 'centre']].map((l, i) => (
        <g key={i}>
          <line x1={190} y1={90} x2={60 + i * 130} y2={168} className="f-arrow" markerEnd={`url(#${id}-ink)`} />
          <Box x={10 + i * 130} y={170} w={100} h={46} lines={l} size={13} />
        </g>
      ))}
      <text x={190} y={258} textAnchor="middle" fontSize={13} className="f-accent-ink" fontWeight={600}>
        “How does it work?”
      </text>
      <text x={190} y={278} textAnchor="middle" fontSize={12} className="f-muted">
        decompose · explain each · aggregate
      </text>
      {/* synthesis: AeroLink inside two wider systems shared with others (w1-worked, synthesis bullet) */}
      <rect x={400} y={44} width={230} height={176} rx={16} className="f-env" fillOpacity={0.9} />
      <rect x={520} y={74} width={230} height={176} rx={16} className="f-env2" fillOpacity={0.6} />
      <text x={414} y={66} fontSize={12.5} className="f-ink">
        Urban transport system
      </text>
      <text x={736} y={240} textAnchor="end" fontSize={12.5} className="f-ink">
        Shared airspace system
      </text>
      <Box x={515} y={124} w={120} h={52} lines={['AeroLink', '(its role)']} tone="soft" size={13} bold />
      <text x={575} y={258} textAnchor="middle" fontSize={13} className="f-accent-ink" fontWeight={600}>
        “Why is it what it is?”
      </text>
      <text x={575} y={278} textAnchor="middle" fontSize={12} className="f-muted">
        identify the whole · explain it · find the role
      </text>
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- L4: less than the sum
/** Three bars (review W1F-F12): fleet capacity with charging ignored, the six-charger ceiling, and what the coupled
 *  system delivers, so the two couplings (shared chargers, riders' response to waiting) are visible separately. */
export function LessThanSum({ alt }: { alt: string }) {
  const max = F4_ALONE
  const W = 520
  const bar = (v: number) => (v / max) * W
  const rows = [
    { label: `Fleet capacity of ${F4_FLEET} aircraft, charging ignored`, v: F4_ALONE, cls: 'f-s1', num: fmt(F4_ALONE) },
    { label: `Ceiling with ${DEFAULT_PARAMS.chargers} shared chargers`, v: CHARGE_CAP_6, cls: 'f-s2', num: fmt(CHARGE_CAP_6) },
    { label: 'Delivered by the coupled system (month 60)', v: F4_DELIVERED, cls: 'f-ink-bar', num: `≈ ${fmt(F4_DELIVERED)}` },
  ]
  return (
    <svg viewBox="0 0 760 262" className="lf-svg" role="img" aria-label={alt}>
      {rows.map((r, i) => (
        <g key={i} transform={`translate(0, ${i * 74})`}>
          <text x={0} y={30} fontSize={13} className="f-ink" fontWeight={600}>
            {r.label}
          </text>
          <rect x={0} y={40} width={bar(r.v)} height={28} rx={4} className={r.cls}>
            <title>{`${r.num} trips a month`}</title>
          </rect>
          <text x={bar(r.v) + 10} y={59} fontSize={14} fontWeight={600} className="f-ink">
            {r.num}
          </text>
        </g>
      ))}
      <text x={0} y={248} fontSize={12.5} className="f-ink">
        Shared chargers remove most of the gap; riders’ response to waiting keeps delivery below the ceiling (≈ {F4_PER_AIRCRAFT_DAY.toFixed(1)} trips per aircraft per day).
      </text>
      <text x={760} y={14} textAnchor="end" fontSize={11} className="f-muted">
        trips a month · FICTIONAL
      </text>
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- L5: two loops
/** L5 figure (review W1F-F14): only loops R1 and B1, each with its own colour and line pattern; polarities come from
 *  LOOP_LINKS, so the drawing cannot disagree with the model. The full interactive diagram stays in Practice. */
const LP_NODES: Record<string, { x: number; y: number; w: number; lines: string[] }> = {
  adoption: { x: 40, y: 150, w: 140, lines: ['Word-of-mouth', 'adoption'] },
  riders: { x: 250, y: 150, w: 110, lines: ['Riders'] },
  demand: { x: 330, y: 30, w: 120, lines: ['Trip demand'] },
  util: { x: 580, y: 30, w: 120, lines: ['Utilisation'] },
  wait: { x: 580, y: 270, w: 120, lines: ['Waiting time'] },
  attract: { x: 330, y: 270, w: 140, lines: ['Service', 'attractiveness'] },
}
const LP_H = 46
type LpEdge = { from: string; to: string; cls: 'f-r1' | 'f-b1' | 'f-shared'; d: [number, number, number, number]; label: [number, number] }
const LP_EDGES: LpEdge[] = [
  { from: 'riders', to: 'adoption', cls: 'f-r1', d: [249, 162, 182, 162], label: [215, 154] },
  { from: 'adoption', to: 'riders', cls: 'f-shared', d: [181, 186, 248, 186], label: [215, 205] },
  { from: 'riders', to: 'demand', cls: 'f-b1', d: [320, 149, 372, 78], label: [332, 108] },
  { from: 'demand', to: 'util', cls: 'f-b1', d: [451, 53, 578, 53], label: [514, 44] },
  { from: 'util', to: 'wait', cls: 'f-b1', d: [640, 77, 640, 268], label: [654, 176] },
  { from: 'wait', to: 'attract', cls: 'f-b1', d: [579, 293, 472, 293], label: [526, 284] },
  { from: 'attract', to: 'adoption', cls: 'f-b1', d: [330, 300, 140, 198], label: [222, 270] },
]
export function LoopPair({ alt }: { alt: string }) {
  const id = useId().replace(/:/g, '')
  const pol = (from: string, to: string) => LOOP_LINKS.find((l) => l.from === from && l.to === to)!.polarity
  const head = (cls: LpEdge['cls']) => `url(#${id}-${cls === 'f-r1' ? 's1' : cls === 'f-b1' ? 's2' : 'ink'})`
  return (
    <svg viewBox="0 0 760 340" className="lf-svg" role="img" aria-label={alt}>
      <defs>
        {(['ink', 's1', 's2'] as const).map((t) => (
          <marker key={t} id={`${id}-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className={t === 'ink' ? 'f-head-ink' : `f-head-${t}`} />
          </marker>
        ))}
      </defs>
      {LP_EDGES.map((e) => (
        <g key={`${e.from}-${e.to}`} data-polarity={pol(e.from, e.to)}>
          <line x1={e.d[0]} y1={e.d[1]} x2={e.d[2]} y2={e.d[3]} className={e.cls} markerEnd={head(e.cls)} />
          <text x={e.label[0]} y={e.label[1]} textAnchor="middle" fontSize={15} fontWeight={700} className="f-edge-label">
            {pol(e.from, e.to)}
          </text>
        </g>
      ))}
      {Object.entries(LP_NODES).map(([k, n]) => (
        <Box key={k} x={n.x} y={n.y} w={n.w} h={LP_H} lines={n.lines} size={13} />
      ))}
      <text x={215} y={130} textAnchor="middle" fontSize={14} fontWeight={700} className="f-r1-ink">
        R1
      </text>
      <text x={215} y={221} textAnchor="middle" fontSize={11} className="f-muted">
        shared by R1 and B1
      </text>
      <text x={505} y={168} textAnchor="middle" fontSize={14} fontWeight={700} className="f-b1-ink">
        B1
      </text>
      <g transform="translate(470, 196)">
        <line x1={0} x2={34} y1={0} y2={0} className="f-r1" />
        <text x={42} y={0} dominantBaseline="central" fontSize={11.5} className="f-ink">
          R1 only (solid)
        </text>
        <line x1={0} x2={34} y1={18} y2={18} className="f-b1" />
        <text x={42} y={18} dominantBaseline="central" fontSize={11.5} className="f-ink">
          B1 only (dashed)
        </text>
      </g>
    </svg>
  )
}

export function ControlHierarchy({ alt }: { alt: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 420 270" className="lf-svg lf-svg-narrow" role="img" aria-label={alt}>
      <Markers id={id} />
      <Box x={110} y={10} w={200} h={46} lines={['Airspace authority']} size={14} bold />
      <Box x={110} y={112} w={200} h={46} lines={['Operations centre']} tone="soft" size={14} bold />
      <Box x={110} y={214} w={200} h={46} lines={['Dispatch']} tone="soft" size={14} bold />
      <line x1={210} y1={56} x2={210} y2={110} className="f-arrow" markerEnd={`url(#${id}-ink)`} />
      <text x={222} y={88} fontSize={13} className="f-edge-label">
        constrains
      </text>
      <line x1={210} y1={158} x2={210} y2={212} className="f-arrow accent" markerEnd={`url(#${id}-accent)`} />
      <text x={222} y={190} fontSize={13} className="f-edge-label">
        controls
      </text>
      <text x={20} y={140} fontSize={11.5} className="f-muted" transform="rotate(-90 20 140)" textAnchor="middle">
        higher level → lower level
      </text>
    </svg>
  )
}
