// Week 1, Session 1 lecture figures (src/content/lectures/week01/session1.ts). Original drawings: none redraws a SEBoK,
// MITRE or DoD figure. Every label comes from the lecture text (whose claims are cited there) or from the instructor
// reference model (src/model/airtaxi.ts, src/model/reference/week01.ts; AeroLink is FICTIONAL). Static SVG with the
// shared theme classes (flow.css), so the light and dark themes come for free; sizes are set for a 1600 × 900 PNG and a
// PowerPoint slide (figure-bullets drawings ≈ 680–700 units wide, full-width drawings 1000–1200 units wide, labels ≥ 14
// units). AeroLink data come from the case module (src/content/lectures/week01/aerolinkCase.ts), never retyped.
// Review status: new-pending-review (revised after the independent review: F03, F05, F06, F26, F28, F29).
import { useId, type ReactNode } from 'react'
import { EXTERNAL_SYSTEMS, ORIGINAL_LIST, STAKEHOLDERS, TABLE1_STAGES, methodCoverage } from '../../content/lectures/week01/aerolinkCase'
import { Box, Markers } from './Frame'

const useMid = () => useId().replace(/:/g, '')

type Anchor = 'start' | 'middle' | 'end'

/** The SVG shell: viewBox, role, accessible name (alt), and a <title>/<desc> pair for assistive technology. */
function Fig({ title, alt, w, h, mid, children }: { title: string; alt: string; w: number; h: number; mid: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="lf-svg" role="img" aria-label={alt}>
      <title>{title}</title>
      <desc>{alt}</desc>
      <Markers id={mid} />
      {children}
    </svg>
  )
}

/** Lines of text from a baseline; `lh` is the line height in units. */
function Txt({ x, y, lines, size = 15, lh, anchor = 'start', cls = 'f-ink', weight, italic }: { x: number; y: number; lines: string[] | string; size?: number; lh?: number; anchor?: Anchor; cls?: string; weight?: number; italic?: boolean }) {
  const ls = typeof lines === 'string' ? [lines] : lines
  const step = lh ?? size * 1.3
  return (
    <text x={x} y={y} fontSize={size} textAnchor={anchor} className={cls} fontWeight={weight} fontStyle={italic ? 'italic' : undefined}>
      {ls.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : step}>
          {l}
        </tspan>
      ))}
    </text>
  )
}

/** A two-part card: a bold name line and a muted detail line, in a rounded rectangle. */
function Card({ x, y, w, h, name, detail, tone = 'box', size = 15, dashed = false }: { x: number; y: number; w: number; h: number; name: string[]; detail?: string[]; tone?: 'box' | 'soft' | 'panel'; size?: number; dashed?: boolean }) {
  const all = name.length + (detail?.length ?? 0)
  const step = size * 1.28
  const top = y + h / 2 - ((all - 1) * step) / 2
  const rect = <rect x={x} y={y} width={w} height={h} rx={8} className={tone === 'panel' ? 'f-panel' : 'f-shape'} strokeDasharray={dashed ? '6 4' : undefined} />
  return (
    <g className={tone === 'soft' ? 'f-soft' : undefined}>
      {rect}
      {name.map((l, i) => (
        <text key={`n${i}`} x={x + w / 2} y={top + i * step} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={600} className="f-ink">
          {l}
        </text>
      ))}
      {(detail ?? []).map((l, i) => (
        <text key={`d${i}`} x={x + w / 2} y={top + (name.length + i) * step} textAnchor="middle" dominantBaseline="central" fontSize={size - 1.5} className="f-muted">
          {l}
        </text>
      ))}
    </g>
  )
}

const arrow = (mid: string, tone: 'ink' | 'accent' | 'muted' = 'ink') => `url(#${mid}-${tone})`

// ------------------------------------------------------------------------------------------- S1.3 two phases
export function TwoPhasesFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const xs = [14, 182, 350, 518]
  const W = 150
  const top: [string[], string[], boolean][] = [
    [['Week 1'], ['stakeholders,', 'concerns, needs'], true],
    [['Week 2'], ['ConOps,', 'requirements'], false],
    [['Weeks 3–6'], ['risk, architecture,', 'interfaces, roadmap'], false],
    [['Week 7'], ['Systems Thinking', 'Package'], false],
  ]
  const bottom: [string[], string[], boolean][] = [
    [['Week 8'], ['stakeholders and', 'concerns modeled'], true],
    [['Week 9'], ['needs and', 'requirements'], true],
    [['Weeks 10–13'], ['behavior, physical,', 'V&V, analysis'], false],
    [['Week 14'], ['coherent', 'SysML v2 model'], false],
  ]
  return (
    <Fig title="One enterprise, two representations" alt={alt} w={682} h={400} mid={mid}>
      <Txt x={14} y={30} lines="Phase I · Weeks 1–7 · document-based package" size={16} weight={600} cls="f-accent-ink" />
      {top.map(([n, d, hi], i) => (
        <Card key={i} x={xs[i]} y={44} w={W} h={92} name={n} detail={d} tone={hi ? 'soft' : 'box'} size={15} />
      ))}
      
      {bottom.map(([n, d, hi], i) => (
        <Card key={i} x={xs[i]} y={266} w={W} h={92} name={n} detail={d} tone={hi ? 'soft' : 'box'} size={15} />
      ))}
      {/* Week 1 → Week 8, Week 1 → Week 9, Week 2 → Week 9, Week 7 → Phase II */}
      <line x1={70} y1={138} x2={70} y2={262} className="f-arrow accent" markerEnd={arrow(mid, 'accent')} />
      <Txt x={78} y={204} lines="STK, CON" size={14.5} cls="f-edge-label" weight={600} />
      <line x1={130} y1={138} x2={214} y2={262} className="f-arrow accent" markerEnd={arrow(mid, 'accent')} />
      <Txt x={160} y={176} lines="NEED" size={14.5} cls="f-edge-label" weight={600} />
      <line x1={290} y1={138} x2={290} y2={262} className="f-arrow" markerEnd={arrow(mid)} />
      <Txt x={298} y={222} lines="REQ" size={14.5} cls="f-edge-label" />
      <line x1={593} y1={138} x2={593} y2={262} className="f-arrow" markerEnd={arrow(mid)} />
      <Txt x={585} y={204} lines={['the package is', 'the model’s source']} size={14} anchor="end" cls="f-edge-label" />
      <Txt x={14} y={386} lines="Phase II · Weeks 8–14 · SysML v2 model" size={16} weight={600} cls="f-accent-ink" />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.9 SoI and enabling systems
export function SoiEnablingFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const enabling: [string, string][] = [
    ['Maintenance facility', 'serves support'],
    ['Training system', 'serves utilization'],
    ['Charger test rig', 'serves production, V&V'],
    ['Project team', 'serves concept, development'],
  ]
  const ext = (id: string) => EXTERNAL_SYSTEMS.find((e) => e.id === id)!
  const external: [string, string, boolean][] = [
    [ext('EXT-002').short, 'EXT-002 · power', false],
    [ext('EXT-001').short, 'EXT-001 · access', false],
    [ext('EXT-003').short, 'EXT-003 · constrains', true],
  ]
  return (
    <Fig title="System of interest, enabling systems and external systems" alt={alt} w={700} h={436} mid={mid}>
      <Txt x={10} y={28} lines="Enabling systems" size={16} weight={600} />
      <Txt x={10} y={47} lines="complement the SoI" size={14} cls="f-muted" />
      <Txt x={690} y={28} lines="External systems" size={16} weight={600} anchor="end" />
      <Txt x={690} y={47} lines="in the environment" size={14} cls="f-muted" anchor="end" />
      {enabling.map(([n, d], i) => {
        const y = 66 + i * 80
        return (
          <g key={n}>
            <Card x={6} y={y} w={190} h={64} name={[n]} detail={[d]} size={15} />
            <line x1={196} y1={y + 32} x2={226} y2={y + 32} className="f-arrow" strokeDasharray="2 4" strokeWidth={2.2} />
          </g>
        )
      })}
      <rect x={226} y={58} width={248} height={330} rx={26} className="f-boundary" />
      <Txt x={350} y={86} lines="System of interest" size={16} weight={600} anchor="middle" cls="f-accent-ink" />
      <Txt x={350} y={106} lines="AeroLink air-taxi service" size={15} anchor="middle" />
      <Box x={240} y={124} w={106} h={58} lines={['eVTOL', 'aircraft']} tone="soft" size={14.5} />
      <Box x={354} y={124} w={106} h={58} lines={['Pads and', 'chargers']} tone="soft" size={14.5} />
      <Box x={240} y={196} w={106} h={58} lines={['Operations', 'center']} tone="soft" size={14.5} />
      <Box x={354} y={196} w={106} h={58} lines={['Commu-', 'nications']} tone="soft" size={14.5} />
      <line x1={346} y1={153} x2={354} y2={153} className="f-arrow" />
      <line x1={293} y1={182} x2={293} y2={196} className="f-arrow" />
      <line x1={407} y1={182} x2={407} y2={196} className="f-arrow" />
      <line x1={346} y1={225} x2={354} y2={225} className="f-arrow" />
      <Txt x={350} y={282} lines={['operational elements', 'work together in use']} size={14} anchor="middle" cls="f-muted" />
      <Txt x={350} y={340} lines={['SEBoK: a SoI may also', 'include enabling systems']} size={14} anchor="middle" cls="f-muted" italic />
      {external.map(([n, d, oneWay], i) => {
        const y = 92 + i * 92
        return (
          <g key={n}>
            <Card x={510} y={y} w={184} h={64} name={[n]} detail={[d]} size={15} />
            <line x1={508} y1={y + 32} x2={476} y2={y + 32} className="f-arrow" markerEnd={arrow(mid)} markerStart={oneWay ? undefined : arrow(mid)} />
          </g>
        )
      })}
      <line x1={10} y1={418} x2={46} y2={418} className="f-arrow" strokeDasharray="2 4" strokeWidth={2.2} />
      <Txt x={54} y={423} lines="enabling: supports a life-cycle stage" size={14} />
      <line x1={384} y1={418} x2={420} y2={418} className="f-arrow" />
      <Txt x={428} y={423} lines="external: exchange in operation" size={14} />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.10 enterprise nesting
export function EnterpriseNestingFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const partners = ['Vertiport operators', 'Electric utility', 'Aircraft manufacturer', 'Investors']
  const ext: [string[], string][] = [
    [['Passengers'], 'downstream consumers'],
    [['Insurers'], 'upstream supplier (insurance)'],
    [['Public transport,', 'emergency response'], 'sidestream partners'],
    [['FAA, city, ANSP'], 'key stakeholders'],
  ]
  return (
    <Fig title="Organization, enterprise and extended enterprise" alt={alt} w={700} h={440} mid={mid}>
      <rect x={4} y={4} width={692} height={432} rx={24} className="f-env" />
      <Txt x={20} y={30} lines="Extended enterprise" size={16} weight={600} />
      <rect x={18} y={44} width={468} height={380} rx={18} className="f-env2" />
      <Txt x={34} y={70} lines="AeroLink enterprise: one shared mission" size={16} weight={600} />
      <Card x={32} y={86} w={200} h={64} name={['AeroLink Urban Mobility']} detail={['the company: one organization']} tone="panel" size={14.5} />
      <Txt x={34} y={170} lines="partner organizations" size={14} cls="f-muted" italic />
      {partners.map((t, i) => (
        <Box key={t} x={32} y={178 + i * 44} w={200} h={36} lines={[t]} size={14.5} />
      ))}
      <Card x={32} y={358} w={200} h={56} name={['Other resources']} detail={['funding, processes, policies']} tone="panel" size={14.5} />
      <rect x={250} y={86} width={224} height={328} rx={20} className="f-boundary" />
      <Txt x={362} y={112} lines="System of interest" size={15.5} weight={600} anchor="middle" cls="f-accent-ink" />
      <Txt x={362} y={132} lines="air-taxi service" size={15} anchor="middle" />
      {['Fleet', 'Operations center', 'Booking and dispatch'].map((t, i) => (
        <Box key={t} x={266} y={150 + i * 54} w={192} h={42} lines={[t]} tone="soft" size={14.5} />
      ))}
      <rect x={266} y={312} width={192} height={42} rx={6} className="f-shape" strokeDasharray="5 4" fill="none" />
      <Txt x={362} y={338} lines="Pads and chargers" size={14.5} anchor="middle" />
      <line x1={232} y1={196} x2={264} y2={330} className="f-arrow" strokeDasharray="3 4" markerEnd={arrow(mid, 'muted')} />
      <Txt x={362} y={378} lines={['dashed: owned by the vertiport', 'operators, not by AeroLink']} size={13.5} anchor="middle" cls="f-muted" italic />
      {ext.map(([n, d], i) => (
        <Card key={d} x={502} y={60 + i * 92} w={186} h={76} name={n} detail={[d]} size={14.5} />
      ))}
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.11 three scopes
export function ThreeScopesFigure({ alt }: { alt: string }) {
  const mid = useMid()
  return (
    <Fig title="Three candidate systems of interest for one question" alt={alt} w={680} h={420} mid={mid}>
      <rect x={8} y={8} width={664} height={404} rx={24} className="f-boundary" />
      <Txt x={26} y={36} lines="(c) Air-taxi service" size={16} weight={600} cls="f-accent-ink" />
      <rect x={30} y={56} width={348} height={222} rx={18} className="f-shape" strokeDasharray="8 5" fill="none" />
      <Txt x={46} y={82} lines="(b) Flight operations" size={15.5} weight={600} />
      <rect x={50} y={100} width={176} height={150} rx={14} className="f-panel" strokeDasharray="5 4" />
      <Txt x={64} y={124} lines="(a) Aircraft" size={15.5} weight={600} />
      <Box x={66} y={150} w={144} h={74} lines={['eVTOL', 'aircraft']} size={15} />
      <Box x={242} y={110} w={120} h={74} lines={['Pilots and', 'dispatch']} size={15} />
      <Box x={242} y={196} w={120} h={64} lines={['Flights', 'flown']} size={15} />
      {/* the feedback that only (c) contains: demand -> chargers -> waiting -> demand */}
      <Box x={430} y={70} w={210} h={60} lines={['Passenger demand']} tone="soft" size={15} />
      <Box x={430} y={182} w={210} h={60} lines={['Charger and pad queue']} tone="soft" size={15} />
      <Box x={186} y={318} w={200} h={64} lines={['Waiting time', '(the question)']} tone="soft" size={15} bold />
      <line x1={535} y1={130} x2={535} y2={180} className="f-arrow" markerEnd={arrow(mid)} />
      <path d="M 520 242 C 500 300, 440 340, 388 346" className="f-arrow" markerEnd={arrow(mid)} />
      <path d="M 386 366 H 656 V 100 H 644" className="f-arrow accent" markerEnd={arrow(mid, 'accent')} />
      <line x1={362} y1={228} x2={428} y2={214} className="f-arrow" markerEnd={arrow(mid)} />
      <Txt x={548} y={160} lines="loads" size={14} cls="f-edge-label" />
      <Txt x={540} y={360} lines="shapes demand" size={14} cls="f-edge-label" anchor="middle" />
      <Txt x={420} y={292} lines="delays" size={14} cls="f-edge-label" />
      <Txt x={26} y={402} lines="outside (b): waiting and its cause" size={14} cls="f-muted" italic />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.12 boundary anatomy
export function BoundaryAnatomyFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const nodes: [number, number][] = [
    [214, 176],
    [292, 150],
    [366, 196],
    [330, 262],
    [234, 252],
  ]
  const links: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 3], [1, 4], [0, 3],
  ]
  return (
    <Fig title="Anatomy of a boundary" alt={alt} w={680} h={430} mid={mid}>
      <rect x={4} y={4} width={672} height={422} rx={22} className="f-env" strokeDasharray="6 4" />
      <Txt x={20} y={414} lines="other environments: development, production, retirement" size={14} cls="f-muted" />
      <rect x={30} y={30} width={620} height={352} rx={20} className="f-env2" />
      <Txt x={46} y={56} lines="operational environment" size={15} cls="f-muted" weight={600} />
      <ellipse cx={290} cy={208} rx={150} ry={112} className="f-boundary" />
      {links.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} className="f-arrow" />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={15} className="f-dot-s1" />
      ))}
      <Box x={510} y={70} w={124} h={50} lines={['external', 'system']} size={14.5} />
      <Box x={510} y={184} w={124} h={50} lines={['external', 'system']} size={14.5} />
      <Box x={510} y={298} w={124} h={50} lines={['external', 'system']} size={14.5} />
      <line x1={306} y1={146} x2={508} y2={98} className="f-arrow" markerEnd={arrow(mid)} markerStart={arrow(mid)} />
      <line x1={382} y1={202} x2={508} y2={209} className="f-arrow" markerEnd={arrow(mid)} markerStart={arrow(mid)} />
      <line x1={508} y1={322} x2={346} y2={268} className="f-arrow" markerEnd={arrow(mid)} />
      <Txt x={454} y={150} lines={['exchanges', 'cross it']} size={14.5} anchor="middle" cls="f-edge-label" weight={600} />
      <Txt x={46} y={100} lines={['boundary: a', 'distinction an', 'observer makes']} size={14.5} weight={600} cls="f-accent-ink" />
      <line x1={120} y1={150} x2={150} y2={180} className="f-arrow accent" />
      <Txt x={290} y={352} lines="interactions concentrated inside" size={14.5} anchor="middle" weight={600} />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.13 context layers
const EXCHANGE_SHORT: Record<string, string[]> = { 'EXT-001': ['access,', 'clearances'], 'EXT-002': ['power'], 'EXT-003': ['constrains'], 'EXT-004': ['aircraft,', 'spares'], 'EXT-005': ['passengers'], 'EXT-006': ['incident', 'response'] }
const OWNER_SHORT: Record<string, string> = { 'STK-007': 'STK-007 ANSP', 'STK-010': 'STK-010 utility', 'STK-011': 'STK-011 manufacturer', 'STK-006': 'STK-006 responders' }

export function ContextLayersFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const rowY = (i: number) => 132 + i * 96
  return (
    <Fig title="The structure of a system context, applied to AeroLink" alt={alt} w={1200} h={480} mid={mid}>
      <rect x={4} y={4} width={1192} height={472} rx={26} className="f-env" />
      <Txt x={22} y={30} lines="Wider environment: no direct interaction; may influence decisions" size={16.5} weight={600} />
      <Txt x={600} y={466} lines="regional economy  ·  public opinion  ·  national aviation policy" size={15.5} anchor="middle" cls="f-muted" italic />
      <rect x={30} y={44} width={1140} height={396} rx={22} className="f-env2" />
      <Txt x={48} y={70} lines="Immediate environment: external systems" size={16.5} weight={600} />
      <Txt x={48} y={92} lines="exchange material, energy or information" size={15} cls="f-muted" />
      <rect x={420} y={60} width={360} height={366} rx={20} className="f-shape" strokeDasharray="9 5" />
      <Txt x={600} y={86} lines="Wider SoI = SOI-001, the air-taxi service" size={16} weight={600} anchor="middle" />
      <Txt x={600} y={110} lines={['+ vertiport operators’ pads and chargers', '+ passenger demand']} size={15} lh={20} anchor="middle" cls="f-muted" />
      <g className="f-soft">
        <rect x={452} y={160} width={296} height={236} rx={18} className="f-shape" />
      </g>
      <rect x={452} y={160} width={296} height={236} rx={18} className="f-boundary" />
      <Txt x={600} y={190} lines="Narrower SoI: what AeroLink controls" size={16} weight={600} anchor="middle" cls="f-accent-ink" />
      <Txt x={600} y={240} lines={['fleet', 'operations center', 'booking and dispatch']} size={15.5} lh={26} anchor="middle" />
      <Txt x={600} y={376} lines="scoped by authority or control" size={14.5} anchor="middle" cls="f-muted" italic />
      {EXTERNAL_SYSTEMS.map((e, i) => {
        const left = i < 3
        const y = rowY(i % 3)
        const w = 270
        const x = left ? 50 : 880
        const bx = left ? 420 : 780
        const ax = left ? x + w : x
        const cy = y + 42
        const behind = e.owner ? `behind it: ${OWNER_SHORT[e.owner] ?? e.owner}` : e.id === 'EXT-003' ? 'behind it: none (natural)' : 'operator: not in register'
        return (
          <g key={e.id}>
            <Card x={x} y={y} w={w} h={84} name={[e.short]} detail={[e.id, behind]} size={15} />
            <line x1={ax} y1={cy} x2={bx} y2={cy} className="f-arrow" markerEnd={arrow(mid)} markerStart={e.oneWay ? undefined : arrow(mid)} />
            <Txt x={(ax + bx) / 2} y={cy - 8 - (EXCHANGE_SHORT[e.id].length - 1) * 17} lines={EXCHANGE_SHORT[e.id]} size={14.5} lh={17} anchor="middle" cls="f-edge-label" />
          </g>
        )
      })}
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.14 control and influence
export function ControlInfluenceFigure({ alt }: { alt: string }) {
  const mid = useMid()
  return (
    <Fig title="Control, influence and what influences us" alt={alt} w={700} h={430} mid={mid}>
      <rect x={6} y={6} width={436} height={418} rx={22} className="f-ring3" />
      <Txt x={24} y={34} lines="Influences us; beyond our influence" size={16} weight={600} />
      <Txt x={24} y={58} lines={['weather · national aviation policy', 'ANSP airspace rules']} size={15} lh={20} />
      <rect x={30} y={104} width={388} height={296} rx={18} className="f-ring2" />
      <Txt x={48} y={132} lines="We influence" size={16} weight={600} />
      <Txt x={48} y={156} lines={['vertiport operators · electric utility', 'passenger demand (through fares, service)']} size={15} lh={20} />
      <rect x={64} y={196} width={320} height={182} rx={14} className="f-ring1" />
      <Txt x={224} y={226} lines="We control" size={16} weight={600} anchor="middle" />
      <Txt x={224} y={256} lines={['AeroLink fleet', 'dispatch and schedule', 'operations center']} size={15} lh={22} anchor="middle" />
      <Txt x={224} y={360} lines="instructor’s reading; others are defensible" size={13.5} anchor="middle" cls="f-muted" italic />
      <Txt x={466} y={34} lines="MITRE’s questions" size={16} weight={600} />
      {[
        ['1. What is my', 'enterprise?'],
        ['2. Which elements', 'do I control?'],
        ['3. Which do I', 'influence?'],
        ['4. Which influence me,', 'though I neither control', 'nor influence them?'],
      ].map((q, i) => (
        <Txt key={i} x={466} y={70 + i * 66} lines={q} size={15} lh={20} />
      ))}
      <rect x={458} y={340} width={234} height={84} rx={8} className="f-panel" />
      <Txt x={472} y={366} lines={['Too tight a boundary hides', 'the owners of your', 'constraints.']} size={14.5} lh={19} weight={600} />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.15 life cycle
export function LifeCycleFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const W = 146
  const gap = 22
  const x = (i: number) => 7 + i * (W + gap)
  const stages: [string, string[]][] = [
    ['Concept', ['Identify stakeholders’', 'needs; explore', 'concepts; propose', 'viable solutions']],
    ['Development', ['Refine requirements;', 'create solution', 'description; build;', 'verify, validate']],
    ['Production', ['Produce systems;', 'inspect and test']],
    ['Utilization', ['Operate the system', 'to satisfy users’', 'needs']],
    ['Support', ['Provide sustained', 'system capability']],
    ['Retirement', ['Store, archive or', 'dispose of the', 'system']],
  ]
  const table: string[][] = [['Concept'], ['Development'], ['Production,', 'integration, V&V'], ['Operation'], ['Logistics and', 'maintenance'], ['Disposal']]
  return (
    <Fig title="Life-cycle stages, decision gates and the stakeholder-table stage names" alt={alt} w={1000} h={392} mid={mid}>
      <Txt x={x(0) + W / 2} y={22} lines="Week 1 works here" size={15.5} weight={600} anchor="middle" cls="f-accent-ink" />
      <line x1={x(0) + W / 2} y1={28} x2={x(0) + W / 2} y2={40} className="f-arrow accent" markerEnd={arrow(mid, 'accent')} />
      {stages.map(([n, g], i) => (
        <g key={n} className={i === 0 ? 'f-soft' : undefined}>
          <rect x={x(i)} y={44} width={W} height={150} rx={8} className="f-shape" />
          <text x={x(i) + W / 2} y={70} textAnchor="middle" fontSize={16.5} fontWeight={600} className="f-ink">
            {n}
          </text>
          {g.map((l, k) => (
            <text key={k} x={x(i) + W / 2} y={100 + k * 21} textAnchor="middle" fontSize={14} className="f-ink">
              {l}
            </text>
          ))}
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((i) => {
        const cx = x(i) + W + gap / 2
        return <rect key={i} x={cx - 8} y={111} width={16} height={16} transform={`rotate(45 ${cx} 119)`} className="f-shape" style={{ stroke: 'var(--wb-accent)', strokeWidth: 2 }} />
      })}
      <Txt x={500} y={222} lines="◆ decision gate: entry and exit criteria between stages" size={14} anchor="middle" cls="f-muted" />
      <Txt x={5} y={258} lines="Stage names in SEBoK’s stakeholder table (Table 1)" size={15} weight={600} />
      {table.map((t, i) => (
        <g key={i}>
                    <Card x={x(i)} y={272} w={W} h={62} name={t} tone="panel" size={15} />
        </g>
      ))}
      <Txt x={500} y={374} lines="A register built from the operation stage alone misses most stakeholders." size={15} anchor="middle" weight={600} />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.16 15288 process strip
export function ProcessStripFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const names: string[][] = [
    ['Business or', 'Mission Analysis'],
    ['Stakeholder Needs', 'and Requirements', 'Definition'],
    ['System', 'Requirements', 'Definition'],
    ['Architecture', 'Definition'],
    ['Design', 'Definition'],
    ['System', 'Analysis'],
    ['Implementation'],
    ['Integration'],
    ['Verification'],
    ['Transition'],
    ['Validation'],
    ['Operations'],
    ['Maintenance'],
    ['Disposal'],
  ]
  const W = 132
  const gap = 11
  const cx = (i: number) => 4 + (i % 7) * (W + gap)
  const cy = (i: number) => (i < 7 ? 56 : 194)
  return (
    <Fig title="ISO/IEC/IEEE 15288:2015 technical processes, as listed by SEBoK" alt={alt} w={1000} h={462} mid={mid}>
      <path d={`M 6 46 L 6 38 L ${4 + 2 * W + gap - 2} 38 L ${4 + 2 * W + gap - 2} 46`} className="f-arrow accent" />
      <Txt x={4 + W + gap / 2} y={26} lines="SEBoK: Concept Definition" size={16} weight={600} anchor="middle" cls="f-accent-ink" />
      {names.map((n, i) => {
        const hi = i < 2 ? 'Week 1' : i === 2 ? 'Week 2' : ''
        const step = 19
        const top = cy(i) + 60 - ((n.length - 1) * step) / 2 - (hi ? 6 : 0)
        return (
          <g key={i} className={hi ? 'f-soft' : undefined}>
            <rect x={cx(i)} y={cy(i)} width={W} height={124} rx={8} className="f-shape" strokeWidth={i < 2 ? 2.5 : undefined} />
            <text x={cx(i) + 9} y={cy(i) + 19} fontSize={13.5} className="f-muted">
              {i + 1}
            </text>
            {n.map((l, k) => (
              <text key={k} x={cx(i) + W / 2} y={top + k * step} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={hi ? 600 : 500} className="f-ink">
                {l}
              </text>
            ))}
            {hi && (
              <text x={cx(i) + W / 2} y={cy(i) + 110} textAnchor="middle" fontSize={14.5} fontWeight={700} className="f-accent-ink">
                {hi}
              </text>
            )}
          </g>
        )
      })}
      <Txt x={4} y={354} lines="One process, three names:" size={15} weight={600} />
      {(
        [
          ['SEBoK article', ['Stakeholder Needs Definition']],
          ['15288:2015, via SEBoK', ['Stakeholder Needs and', 'Requirements Definition']],
          ['DoD SE Guidebook', ['Stakeholder Requirements', 'Definition']],
        ] as [string, string[]][]
      ).map(([src, name], k) => (
        <Card key={src} x={4 + k * 332} y={366} w={324} h={66} name={name} detail={[src]} tone="panel" size={14.5} />
      ))}
      <Txt x={500} y={452} lines="Fourteen technical processes; they iterate and overlap rather than run in strict order." size={14.5} anchor="middle" cls="f-muted" />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.17 BMA feeds SND
export function BmaSndFigure({ alt }: { alt: string }) {
  const mid = useMid()
  return (
    <Fig title="Business or Mission Analysis feeds Stakeholder Needs Definition" alt={alt} w={700} h={456} mid={mid}>
      <rect x={6} y={30} width={270} height={268} rx={12} className="f-env2" />
      <Txt x={141} y={58} lines={['Business or', 'Mission Analysis']} size={16.5} weight={600} anchor="middle" />
      <Txt
        x={20}
        y={118}
        lines={['• problem, threat or opportunity', '• mission, goals, objectives', '   and measures of success', '• major stakeholders, ranked', '• preliminary life-cycle', '   concepts', '• candidate solution classes']}
        size={14.5}
        lh={23}
      />
      <g className="f-soft">
        <rect x={326} y={14} width={368} height={300} rx={12} className="f-shape" />
      </g>
      <Txt x={510} y={44} lines="Stakeholder Needs Definition" size={16.5} weight={600} anchor="middle" />
      <Txt
        x={342}
        y={80}
        lines={['• identify more stakeholders,', '   across every life-cycle stage', '• elicit, consolidate, prioritize', '• identify drivers and constraints', '• identify risks', '• mature the life-cycle concepts']}
        size={14.5}
        lh={25}
      />
      <Txt x={342} y={238} lines={['• identify and baseline the', '   integrated set of needs']} size={14.5} lh={25} weight={700} />
      <line x1={278} y1={150} x2={324} y2={150} className="f-arrow accent" markerEnd={arrow(mid, 'accent')} />
      <Txt x={301} y={138} lines="inputs" size={14} anchor="middle" cls="f-edge-label" />
      <path d="M 500 316 C 500 368, 141 368, 141 302" className="f-arrow" strokeDasharray="6 4" markerEnd={arrow(mid)} />
      <Txt x={320} y={360} lines="performed iteratively" size={14.5} anchor="middle" cls="f-edge-label" italic />
      <rect x={6} y={384} width={688} height={66} rx={8} className="f-panel" />
      <Txt x={20} y={408} lines={['AeroLink BMA output (FICTIONAL), MGO-001: safe, quiet, on-demand air trips between', 'six vertiports, at predictable waits and a cost that lets the network grow.']} size={14.5} lh={21} />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.18 IPT structure
export function IptStructureFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const ipts = ['aircraft', 'vertiports', 'operations']
  const xs = [14, 242, 470]
  return (
    <Fig title="Integrated product teams under a systems engineering and integration team" alt={alt} w={680} h={420} mid={mid}>
      <Card x={180} y={8} w={320} h={70} name={['SE and integration team (SEIT)']} detail={['program level: oversees the IPTs']} tone="soft" size={15.5} />
      <path d={`M 340 78 L 340 100 M ${xs[0] + 98} 100 L ${xs[2] + 98} 100 M ${xs[0] + 98} 100 L ${xs[0] + 98} 122 M ${xs[1] + 98} 100 L ${xs[1] + 98} 122 M ${xs[2] + 98} 100 L ${xs[2] + 98} 122`} className="f-arrow" />
      {ipts.map((n, i) => (
        <g key={n}>
          <rect x={xs[i]} y={122} width={196} height={92} rx={10} className="f-shape" />
          <Txt x={xs[i] + 98} y={148} lines={`IPT: ${n}`} size={16} weight={600} anchor="middle" />
          <Txt x={xs[i] + 98} y={172} lines="one SBS element" size={14} anchor="middle" cls="f-muted" />
          <Txt x={xs[i] + 98} y={194} lines="multidisciplinary" size={14} anchor="middle" cls="f-muted" />
          <line x1={xs[i] + 98} y1={216} x2={xs[i] + 98} y2={240} className="f-arrow" strokeDasharray="3 4" markerEnd={arrow(mid, 'muted')} markerStart={arrow(mid, 'muted')} />
        </g>
      ))}
      <rect x={4} y={244} width={672} height={56} rx={8} className="f-panel" />
      <Txt x={340} y={267} lines="AIT: safety and reliability specialists" size={15.5} weight={600} anchor="middle" />
      <Txt x={340} y={288} lines="work across every element at this level" size={14} anchor="middle" cls="f-muted" />
      <Card x={130} y={322} w={420} h={84} name={['Your team = one IPT, for one enterprise']} detail={['DoD: a smaller program may run as a single IPT']} tone="soft" size={16} />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.19 communication paths
function Complete({ cx, cy, r, n, nodeR, thin }: { cx: number; cy: number; r: number; n: number; nodeR: number; thin?: boolean }) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n + (n === 4 ? Math.PI / 4 : 0)
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const
  })
  const edges: [number, number][] = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push([i, j])
  return (
    <g>
      {edges.map(([a, b], k) => (
        <line key={k} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} className="f-arrow" strokeWidth={thin ? 1 : 2} />
      ))}
      {pts.map(([x, y], k) => (
        <circle key={k} cx={x} cy={y} r={nodeR} className="f-dot-s1" />
      ))}
    </g>
  )
}

export function CommPathsFigure({ alt }: { alt: string }) {
  const mid = useMid()
  return (
    <Fig title="Communication paths grow as N(N − 1) ÷ 2" alt={alt} w={680} h={420} mid={mid}>
      <Complete cx={160} cy={160} r={92} n={4} nodeR={15} />
      <Txt x={160} y={300} lines="N = 4" size={18} weight={700} anchor="middle" />
      <Txt x={160} y={326} lines="4 × 3 ÷ 2 = 6 paths" size={16} anchor="middle" />
      <Txt x={160} y={350} lines="(the preferred team size)" size={14} anchor="middle" cls="f-muted" />
      <Complete cx={490} cy={160} r={128} n={10} nodeR={11} thin />
      <Txt x={490} y={326} lines="N = 10" size={18} weight={700} anchor="middle" />
      <Txt x={490} y={352} lines="10 × 9 ÷ 2 = 45 paths" size={16} anchor="middle" />
      <Txt x={340} y={404} lines="SEBoK’s examples: 5 → 10, 7 → 21, 9 → 36; above 10, organize hierarchically" size={14.5} anchor="middle" cls="f-muted" />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.20 charter and Tuckman
export function CharterTuckmanFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const fields: [string, string][] = [
    ['Lead roles', 'R&C · Architecture · AI & Data · V&V'],
    ['Decision rules', 'propose → consensus → vote → tie-break'],
    ['Communication norms', 'channels, response times, meetings'],
    ['Owned ID prefixes', 'R&C: STK, CON, NEED · Arch.: ENT, PRT, EXT, REL'],
  ]
  const stages = ['Forming', 'Storming', 'Norming', 'Performing', 'Adjourning']
  return (
    <Fig title="The team charter and the stages of team development" alt={alt} w={716} h={430} mid={mid}>
      <rect x={4} y={4} width={334} height={422} rx={10} className="f-env2" />
      <Txt x={20} y={34} lines="Team charter" size={17} weight={700} />
      <Txt x={20} y={54} lines="course template" size={14} cls="f-muted" />
      {fields.map(([l, p], i) => {
        const y = 82 + i * 86
        return (
          <g key={l}>
            <Txt x={20} y={y} lines={l} size={15.5} weight={600} />
            <rect x={20} y={y + 10} width={302} height={50} rx={6} className="f-panel" />
            <Txt x={32} y={y + 41} lines={p} size={13.5} cls="f-muted" />
          </g>
        )
      })}
      <Txt x={364} y={34} lines="How groups develop (Tuckman)" size={16} weight={600} />
      {stages.map((s, i) => {
        const y = 52 + i * 72
        const last = i === stages.length - 1
        return (
          <g key={s}>
            <Card x={384} y={y} w={176} h={48} name={[s]} detail={last ? ['added later'] : undefined} size={15.5} dashed={last} />
            {!last && <line x1={472} y1={y + 48} x2={472} y2={y + 70} className="f-arrow" markerEnd={arrow(mid)} />}
          </g>
        )
      })}
      <path d="M 562 220 C 630 220, 630 148, 564 148" className="f-arrow accent" markerEnd={arrow(mid, 'accent')} />
      <Txt x={628} y={170} lines={['groups', 'may cycle', 'back']} size={14} lh={18} cls="f-accent-ink" />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.23 life-cycle sweep
const STAGE_HEAD: string[][] = [['Concept'], ['Develop-', 'ment'], ['Produc-', 'tion, V&V'], ['Opera-', 'tion'], ['Logistics,', 'maint.'], ['Disposal']]
/** Short register names for the dense Session 1 figures. */
const S1_SHORT: Record<string, string> = {
  'STK-001': 'Passengers',
  'STK-002': 'FAA',
  'STK-003': 'Investors',
  'STK-004': 'Communities',
  'STK-005': 'Vertiport operators',
  'STK-006': 'Emergency responders',
  'STK-007': 'ANSP',
  'STK-008': 'Pilots / remote operators',
  'STK-009': 'Maintenance technicians',
  'STK-010': 'Electric utility',
  'STK-011': 'Aircraft manufacturer',
  'STK-012': 'Insurers',
  'STK-013': 'City planning authority',
  'STK-014': 'Accessibility advocates',
  'STK-015': 'Reduced-mobility passengers',
}

/** Rows: register stakeholders. Columns: SEBoK Table 1 stages. A dot where the stage's example list (the prompt)
 *  surfaces the stakeholder; an outline on the stage of main involvement (the register's stage field). Case data. */
export function LifecycleSweepFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const X0 = 330
  const CW = 86
  const Y0 = 76
  const RH = 31
  const PX = X0 + 6 * CW + 18
  const rows = [
    ...STAKEHOLDERS.map((s) => ({ id: s.id, name: `${s.id.slice(-3)} ${S1_SHORT[s.id]}`, prompted: s.promptedAt as { stage: string; prompt: string }[], main: s.stage as string, candidate: false })),
    { id: 'cand', name: 'Battery recycler?', prompted: [{ stage: 'Disposal', prompt: 'waste management (candidate)' }], main: '', candidate: true },
  ]
  const footY = Y0 + rows.length * RH
  return (
    <Fig title="The life-cycle sweep applied to AeroLink" alt={alt} w={1300} h={footY + 96} mid={mid}>
      <Txt x={8} y={48} lines="Stakeholder (register)" size={17} weight={700} />
      {STAGE_HEAD.map((h, j) => (
        <Txt key={j} x={X0 + j * CW + CW / 2} y={h.length > 1 ? 30 : 48} lines={h} size={16} lh={19} weight={700} anchor="middle" />
      ))}
      <Txt x={PX} y={48} lines="Table 1 prompt that surfaces it (first stage)" size={17} weight={700} />
      <line x1={4} y1={Y0 - 4} x2={1296} y2={Y0 - 4} className="f-axis" />
      {rows.map((r, i) => {
        const y = Y0 + i * RH
        const cy = y + RH / 2
        const none = r.prompted.length === 0
        return (
          <g key={r.id}>
            {i % 2 === 0 && <rect x={4} y={y} width={1292} height={RH} className="f-panel" style={{ stroke: 'none' }} />}
            <text x={10} y={cy} dominantBaseline="central" fontSize={18} fontStyle={r.candidate ? 'italic' : undefined} className={r.candidate ? 'f-muted' : 'f-ink'}>
              {r.name}
            </text>
            {TABLE1_STAGES.map((st, j) => {
              const cx = X0 + j * CW + CW / 2
              const hit = r.prompted.some((p) => p.stage === st)
              return (
                <g key={st}>
                  {r.main === st && <rect x={cx - 26} y={y + 3} width={52} height={RH - 6} rx={11} style={{ fill: 'none', stroke: 'var(--wb-accent)', strokeWidth: 2.4 }} />}
                  {hit ? <circle cx={cx} cy={cy} r={8} className={r.candidate ? 'f-shape' : 'f-dot-s1'} strokeDasharray={r.candidate ? '3 2' : undefined} /> : <circle cx={cx} cy={cy} r={1.8} className="f-muted" />}
                </g>
              )
            })}
            <text x={PX} y={cy} dominantBaseline="central" fontSize={17} fontWeight={none ? 700 : 400} className={none ? 'f-accent-ink' : 'f-muted'}>
              {none ? 'not prompted by any stage: found by role class' : `${r.prompted[0].stage}: ${r.prompted[0].prompt}`}
            </text>
          </g>
        )
      })}
      {TABLE1_STAGES.map((_, j) => (
        <line key={j} x1={X0 + j * CW} y1={Y0 - 4} x2={X0 + j * CW} y2={footY} className="f-divider" />
      ))}
      <circle cx={18} cy={footY + 28} r={8} className="f-dot-s1" />
      <Txt x={32} y={footY + 33} lines="the stage’s Table 1 prompt surfaces this stakeholder" size={17} />
      <rect x={520} y={footY + 17} width={52} height={22} rx={11} style={{ fill: 'none', stroke: 'var(--wb-accent)', strokeWidth: 2.4 }} />
      <Txt x={582} y={footY + 33} lines="stage of main involvement (the register’s stage field)" size={17} />
      <Txt x={8} y={footY + 76} lines="Owners of external systems, approving authorities and the public are all Concept prompts: the sweep starts at Concept, not at Operation." size={17} weight={600} cls="f-accent-ink" />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.25 approval gates
export function ApprovalGatesFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const gates: { x: number; who: string; what: string[]; id: string; firm: boolean }[] = [
    { x: 236, who: 'FAA', what: ['aircraft and', 'operation'], id: 'STK-002|approves', firm: true },
    { x: 366, who: 'City planning', what: ['vertiport', 'sites'], id: 'STK-013|approves', firm: true },
    { x: 496, who: 'ANSP', what: ['airspace access:', 'approval?'], id: 'STK-007|to confirm', firm: false },
  ]
  return (
    <Fig title="Approving authorities as gates to operational use" alt={alt} w={680} h={380} mid={mid}>
      <Box x={6} y={150} w={134} h={84} lines={['AeroLink', 'air-taxi', 'service']} tone="soft" size={15} bold />
      <line x1={142} y1={192} x2={570} y2={192} className="f-arrow accent" markerEnd={arrow(mid, 'accent')} />
      <Box x={574} y={150} w={100} h={84} lines={['Operational', 'use']} size={15} bold />
      {gates.map((g) => (
        <g key={g.who}>
          <rect x={g.x - 8} y={122} width={16} height={140} rx={4} className={g.firm ? 'f-ring1' : 'f-shape'} strokeDasharray={g.firm ? undefined : '5 4'} style={g.firm ? undefined : { stroke: 'var(--wb-warn)', strokeWidth: 2 }} />
          <Txt x={g.x} y={52} lines={g.who} size={16} weight={700} anchor="middle" />
          <Txt x={g.x} y={74} lines={g.what} size={14.5} lh={19} anchor="middle" cls={g.firm ? 'f-ink' : 'f-token-label'} />
          <Txt x={g.x} y={288} lines={g.id.split('|')} size={14.5} anchor="middle" cls={g.firm ? 'f-ink' : 'f-token-label'} weight={600} />
        </g>
      ))}
      <Txt x={340} y={346} lines={['They certify, qualify and approve the system for use;', 'the customer is not the only one.']} size={14.5} lh={20} anchor="middle" cls="f-muted" />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.26 two stakeholder maps
export function InfluenceMapsFigure({ alt }: { alt: string }) {
  const mid = useMid()
  // left: MITRE's idea, schematic (no data)
  const L = { x0: 92, x1: 452, y0: 64, y1: 340 }
  const sup = ['Awareness', 'Understanding', 'Buy-in', 'Commitment']
  const sx = (i: number) => L.x0 + 40 + i * ((L.x1 - L.x0 - 80) / 3)
  const infY = { High: L.y0 + 30, Med: (L.y0 + L.y1) / 2, Low: L.y1 - 30 }
  // right: course-convention grid from the instructor register (FICTIONAL)
  const R = { x0: 600, x1: 968, y0: 64, y1: 340 }
  const gx = (v: number) => R.x0 + ((v - 1) / 4) * (R.x1 - R.x0)
  const gy = (v: number) => R.y1 - ((v - 1) / 4) * (R.y1 - R.y0)
  const groups = new Map<string, { i: number; f: number; ids: string[] }>()
  for (const s of STAKEHOLDERS) {
    const k = `${s.interest},${s.influence}`
    const g = groups.get(k) ?? { i: s.interest, f: s.influence, ids: [] }
    g.ids.push(String(parseInt(s.id.slice(4), 10)))
    groups.set(k, g)
  }
  return (
    <Fig title="Two stakeholder maps: influence and support (MITRE); influence and interest (course convention)" alt={alt} w={1000} h={436} mid={mid}>
      <Txt x={10} y={28} lines="MITRE: influence over change × level of support" size={16} weight={600} />
      <rect x={L.x0} y={L.y0} width={L.x1 - L.x0} height={L.y1 - L.y0} className="f-panel" />
      {(['High', 'Med', 'Low'] as const).map((k) => (
        <Txt key={k} x={L.x0 - 10} y={infY[k] + 5} lines={k} size={14.5} anchor="end" />
      ))}
      {sup.map((s, i) => (
        <Txt key={s} x={sx(i)} y={L.y1 + 24} lines={s} size={14} anchor="middle" />
      ))}
      <Txt x={(L.x0 + L.x1) / 2} y={L.y1 + 52} lines="level of support →" size={14.5} anchor="middle" cls="f-muted" />
      <text x={24} y={(L.y0 + L.y1) / 2} transform={`rotate(-90 24 ${(L.y0 + L.y1) / 2})`} textAnchor="middle" fontSize={14.5} className="f-muted">
        influence over change →
      </text>
      <circle cx={sx(1)} cy={infY.High} r={11} className="f-dot" />
      <circle cx={sx(3)} cy={infY.High} r={13} className="f-shape" strokeDasharray="4 3" style={{ stroke: 'var(--wb-accent)', strokeWidth: 2.5, fill: 'none' }} />
      <line x1={sx(1) + 14} y1={infY.High} x2={sx(3) - 16} y2={infY.High} className="f-arrow accent" markerEnd={arrow(mid, 'accent')} />
      <Txt x={(sx(1) + sx(3)) / 2} y={infY.High - 18} lines="move toward commitment" size={14.5} anchor="middle" cls="f-accent-ink" weight={600} />
      <circle cx={sx(0)} cy={infY.Med} r={11} className="f-dot" />
      <circle cx={sx(2)} cy={infY.Med} r={13} className="f-shape" strokeDasharray="4 3" style={{ stroke: 'var(--wb-accent)', strokeWidth: 2.5, fill: 'none' }} />
      <line x1={sx(0) + 14} y1={infY.Med} x2={sx(2) - 16} y2={infY.Med} className="f-arrow" markerEnd={arrow(mid)} />
      <circle cx={sx(2)} cy={infY.Low} r={11} className="f-dot" />
      <circle cx={L.x0 + 24} cy={L.y1 + 76} r={8} className="f-dot" />
      <Txt x={L.x0 + 38} y={L.y1 + 81} lines="current" size={14} />
      <circle cx={L.x0 + 134} cy={L.y1 + 76} r={9} className="f-shape" strokeDasharray="4 3" style={{ stroke: 'var(--wb-accent)', strokeWidth: 2.5, fill: 'none' }} />
      <Txt x={L.x0 + 150} y={L.y1 + 81} lines="required (schematic groups)" size={14} />

      <line x1={510} y1={16} x2={510} y2={426} className="f-divider" />

      <Txt x={540} y={28} lines="Course convention: interest × influence (AeroLink)" size={16} weight={600} />
      {[1, 2, 3, 4, 5].map((v) => (
        <g key={v}>
          <line x1={gx(v)} y1={R.y0} x2={gx(v)} y2={R.y1} className="f-grid" />
          <line x1={R.x0} y1={gy(v)} x2={R.x1} y2={gy(v)} className="f-grid" />
          <Txt x={gx(v)} y={R.y1 + 22} lines={String(v)} size={14} anchor="middle" />
          <Txt x={R.x0 - 10} y={gy(v) + 5} lines={String(v)} size={14} anchor="end" />
        </g>
      ))}
      <line x1={gx(3.5)} y1={R.y0} x2={gx(3.5)} y2={R.y1} className="f-gap" />
      <line x1={R.x0} y1={gy(3.5)} x2={R.x1} y2={gy(3.5)} className="f-gap" />
      <Txt x={(R.x0 + R.x1) / 2} y={R.y1 + 50} lines="interest (1–5) →" size={14.5} anchor="middle" cls="f-muted" />
      <text x={560} y={(R.y0 + R.y1) / 2} transform={`rotate(-90 560 ${(R.y0 + R.y1) / 2})`} textAnchor="middle" fontSize={14.5} className="f-muted">
        influence (1–5) →
      </text>
      {[...groups.values()].map((g) => {
        const px = gx(g.i)
        const py = gy(g.f)
        const right = g.i < 5
        return (
          <g key={`${g.i},${g.f}`}>
            <circle cx={px} cy={py} r={8} className="f-dot-s1" />
            <Txt x={right ? px + 13 : px - 13} y={py - 9} lines={g.ids.join(', ')} size={14.5} anchor={right ? 'start' : 'end'} cls="f-edge-label" weight={600} />
          </g>
        )
      })}
      <Txt x={540} y={R.y1 + 81} lines="Labels are STK numbers; dashed lines at 3.5 are a course convention." size={14} cls="f-muted" />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.2 the driving-question scene
/** The scene of the driving question (FICTIONAL): a new vertiport beside homes, and the three parties the project team
 *  proposes to consult. Context items are labeled as things, not as stakeholders: students infer who stands behind them. */
export function VertiportSceneFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const houses = [24, 74, 124, 174]
  const q = (x: number, y: number) => (
    <g key={`${x},${y}`}>
      <circle cx={x} cy={y} r={15} className="f-shape" strokeDasharray="4 3" />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} className="f-ink">
        ?
      </text>
    </g>
  )
  return (
    <Fig title="A new vertiport beside a residential district" alt={alt} w={700} h={430} mid={mid}>
      <path d="M 40 150 Q 350 40 660 150" className="f-arrow" strokeDasharray="7 6" fill="none" />
      <Txt x={350} y={78} lines="controlled airspace" size={14.5} anchor="middle" cls="f-muted" italic />
      <line x1={6} y1={330} x2={694} y2={330} className="f-axis" />
      {houses.map((x) => (
        <g key={x}>
          <rect x={x} y={286} width={38} height={44} className="f-shape" />
          <path d={`M ${x - 4} 288 L ${x + 19} 266 L ${x + 42} 288 Z`} className="f-shape" />
        </g>
      ))}
      <Txt x={112} y={354} lines="homes" size={14.5} anchor="middle" cls="f-muted" />
      <rect x={268} y={306} width={164} height={24} rx={4} className="f-shape" />
      <ellipse cx={350} cy={306} rx={58} ry={9} className="f-boundary" />
      <Txt x={350} y={354} lines="new vertiport" size={15} anchor="middle" weight={700} />
      <g>
        <ellipse cx={350} cy={244} rx={40} ry={13} className="f-shape" />
        <line x1={300} y1={226} x2={400} y2={226} className="f-arrow" strokeWidth={3} />
        <line x1={350} y1={231} x2={350} y2={226} className="f-arrow" />
        <line x1={350} y1={262} x2={350} y2={296} className="f-arrow" strokeDasharray="3 4" markerEnd={arrow(mid, 'muted')} />
      </g>
      <line x1={480} y1={330} x2={480} y2={250} className="f-arrow" strokeWidth={3} />
      <line x1={560} y1={330} x2={560} y2={250} className="f-arrow" strokeWidth={3} />
      <path d="M 432 312 Q 456 280 480 254 Q 520 276 560 254 Q 600 276 640 258" className="f-arrow" fill="none" />
      <Txt x={520} y={354} lines="power line" size={14.5} anchor="middle" cls="f-muted" />
      <rect x={606} y={270} width={78} height={60} className="f-shape" />
      <path d="M 600 272 L 645 246 L 690 272 Z" className="f-shape" />
      <Txt x={645} y={354} lines="city hall" size={14.5} anchor="middle" cls="f-muted" />
      {[q(112, 238), q(350, 120), q(520, 220), q(645, 216)]}
      <rect x={6} y={378} width={688} height={46} rx={8} className="f-panel" />
      <Txt x={20} y={407} lines="Proposed list: passengers · investors · aircraft manufacturer" size={16} weight={700} cls="f-accent-ink" />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.4 the AeroLink network
export function AerolinkNetworkFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const pts: [number, number][] = [
    [100, 160],
    [320, 120],
    [520, 190],
    [560, 330],
    [330, 340],
    [110, 320],
  ]
  const pairs: [number, number][] = []
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) pairs.push([i, j])
  return (
    <Fig title="AeroLink: six vertiports in one region" alt={alt} w={700} h={430} mid={mid}>
      {pairs.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} className="f-divider" />
      ))}
      <line x1={pts[0][0]} y1={pts[0][1]} x2={pts[1][0]} y2={pts[1][1]} className="f-arrow accent" strokeWidth={3} markerEnd={arrow(mid, 'accent')} />
      <Txt x={170} y={78} lines={['typical trip: 25 km', 'at 150 km/h ≈ 10 min']} size={14.5} lh={18} anchor="middle" cls="f-accent-ink" weight={600} />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={26} className="f-shape" style={{ strokeWidth: 2.4 }} />
          <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} className="f-ink">
            V{i + 1}
          </text>
          <Txt x={x} y={y + 46} lines="2 chargers" size={13.5} anchor="middle" cls="f-muted" />
        </g>
      ))}
      <rect x={392} y={394} width={180} height={30} rx={6} className="f-shape" strokeDasharray="5 4" />
      <Txt x={482} y={414} lines="homes near the new site (V5)" size={13.5} anchor="middle" cls="f-muted" />
      <rect x={440} y={8} width={254} height={90} rx={8} className="f-panel" />
      <Txt x={454} y={34} lines={['12 aircraft × 4 seats', '16 h operating day', '20 min charge to dispatch']} size={15} lh={22} weight={600} />
      <Txt x={8} y={424} lines="All values FICTIONAL (course Data Sheet)" size={13.5} cls="f-muted" italic />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.21 who counts as a stakeholder
export function StakeholderScopeFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const defs: [string, string[]][] = [
    ['15288:2015', ['individual or organization with a', '“right, share, claim, or interest”']],
    ['29148 draft (2010)', ['as above, with example roles:', 'trainers, maintainers, disposers, regulators']],
    ['26702:2007', ['individual, team, organization or classes,', 'with “interests in, or concerns relative to”']],
    ['Freeman (1984)', ['any group or individual who “can affect', 'or is affected by” the organization’s objectives']],
  ]
  const tests: [string, string, boolean][] = [
    ['Weather', 'a natural system', false],
    ['Electric grid', 'a system: list its owner', false],
    ['Electric utility', 'an organization', true],
    ['Residents near the vertiport', 'affected, never ride', true],
    ['Passengers with reduced mobility', 'a class of stakeholders', true],
  ]
  return (
    <Fig title="Who counts as a stakeholder" alt={alt} w={700} h={440} mid={mid}>
      <Txt x={8} y={22} lines="Four recorded definitions (SEBoK glossary)" size={15.5} weight={700} />
      {defs.map(([src, t], i) => (
        <g key={src}>
          <rect x={6} y={34 + i * 92} width={394} height={82} rx={8} className={i === 2 ? 'f-panel' : 'f-shape'} style={i === 2 ? { strokeWidth: 2.4 } : undefined} />
          <Txt x={18} y={56 + i * 92} lines={src} size={15} weight={700} cls="f-accent-ink" />
          <Txt x={18} y={78 + i * 92} lines={t} size={14} lh={18} />
        </g>
      ))}
      <Txt x={420} y={22} lines="Apply the test" size={15.5} weight={700} />
      {tests.map(([who, why, yes], i) => {
        const y = 34 + i * 74
        return (
          <g key={who}>
            <rect x={414} y={y} width={280} height={64} rx={8} className="f-shape" strokeDasharray={yes ? undefined : '5 4'} />
            <text x={430} y={y + 22} fontSize={15} fontWeight={700} className="f-ink">
              {yes ? '✓ ' : '✗ '}
              {who}
            </text>
            <Txt x={430} y={y + 46} lines={`${yes ? 'stakeholder' : 'not a stakeholder'}: ${why}`} size={13.5} cls="f-muted" />
          </g>
        )
      })}
      <Txt x={420} y={418} lines="✓ stakeholder · ✗ not (dashed)" size={13.5} cls="f-muted" />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.22 the cost of a missing stakeholder
export function MissingStakeholderFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const chain: [string[], string[]][] = [
    [['Stakeholder', 'left out'], ['communities near', 'the new vertiport']],
    [['Their needs', 'never elicited'], ['evening and early-', 'morning noise']],
    [['Requirements', 'miss them'], ['no bound on', 'evening events']],
    [['System fails', 'validation'], ['site permit at risk', 'after it is built']],
  ]
  return (
    <Fig title="Why a missing stakeholder is a validation failure" alt={alt} w={700} h={420} mid={mid}>
      {chain.map(([head, ex], i) => {
        const x = 6 + i * 174
        return (
          <g key={i}>
            <Card x={x} y={40} w={156} h={92} name={head} tone={i === 3 ? 'soft' : 'box'} size={15.5} />
            {i < 3 && <line x1={x + 158} y1={86} x2={x + 172} y2={86} className="f-arrow accent" markerEnd={arrow(mid, 'accent')} />}
            <Txt x={x + 78} y={164} lines={ex} size={14} lh={18} anchor="middle" cls="f-muted" italic />
          </g>
        )
      })}
      <Txt x={8} y={26} lines="SEBoK: leaving out a relevant stakeholder → missing needs → failed validation" size={15} weight={600} />
      <Txt x={8} y={218} lines="AeroLink example (FICTIONAL), read under each step" size={13.5} cls="f-muted" />
      <rect x={6} y={240} width={688} height={168} rx={10} className="f-panel" />
      <Txt x={22} y={268} lines="Who gets forgotten" size={15.5} weight={700} />
      <Txt x={22} y={296} lines={['• “unwilling” stakeholders: affected, not beneficiaries (residents)', '• unstated but necessary needs: access, language, disability', '   (passengers with reduced mobility)', '• the ones a subset of stakeholders never mentions (MITRE)']} size={14.5} lh={24} />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.24 methods 2 and 3
/** Method 2 (owners behind external systems) and Method 3 (role classes), both from the case data. */
export function ContextRolesFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const roleRows = new Map<string, string[]>()
  for (const s of STAKEHOLDERS) if (s.roleClass) roleRows.set(s.roleClass, [...(roleRows.get(s.roleClass) ?? []), S1_SHORT[s.id]])
  const roles = [...roleRows.entries()]
  return (
    <Fig title="Methods 2 and 3: from the context, and by role class" alt={alt} w={1200} h={470} mid={mid}>
      <Txt x={8} y={26} lines="Method 2: for each external system, who runs it?" size={17} weight={700} />
      {EXTERNAL_SYSTEMS.map((e, i) => {
        const y = 44 + i * 62
        const owner = e.owner ? `${e.owner.slice(-3)} ${S1_SHORT[e.owner]}` : e.id === 'EXT-003' ? 'none: a natural system' : 'its operator: not registered?'
        return (
          <g key={e.id}>
            <rect x={6} y={y} width={290} height={50} rx={6} className="f-shape" />
            <Txt x={18} y={y + 31} lines={`${e.id} ${e.short}`} size={14.5} />
            <line x1={298} y1={y + 25} x2={340} y2={y + 25} className="f-arrow" markerEnd={arrow(mid)} />
            <rect x={344} y={y} width={220} height={50} rx={6} className={e.owner ? 'f-panel' : 'f-shape'} strokeDasharray={e.owner ? undefined : '5 4'} />
            <Txt x={356} y={y + 31} lines={owner} size={14.5} weight={e.owner ? 700 : 400} cls={e.owner ? 'f-ink' : 'f-muted'} />
          </g>
        )
      })}
      <Txt x={8} y={432} lines="The system is context; the organization behind it is the stakeholder." size={14.5} cls="f-accent-ink" weight={600} />
      <line x1={590} y1={14} x2={590} y2={456} className="f-divider" />
      <Txt x={612} y={26} lines="Method 3: which role classes does the list cover?" size={17} weight={700} />
      {roles.map(([role, names], i) => {
        const y = 42 + i * 54
        return (
          <g key={role}>
            <rect x={610} y={y} width={584} height={48} rx={6} className={i % 2 === 0 ? 'f-panel' : 'f-shape'} />
            <Txt x={622} y={y + 19} lines={role} size={14.5} weight={700} />
            <Txt x={622} y={y + 39} lines={names.join(', ')} size={14} cls="f-muted" />
          </g>
        )
      })}
      <Txt x={612} y={444} lines="Snowballing (course name for MITRE’s advice): ask interviewees for further names." size={14.5} cls="f-accent-ink" weight={600} />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.27 which method finds whom
/** Every register stakeholder grouped by the combination of methods that finds it (methodCoverage() in the case
 *  module): a set diagram drawn as labeled regions, so every name stays legible. */
export function MethodVennFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const cov = methodCoverage()
  const region = (m1: boolean, m2: boolean, m3: boolean) => cov.filter((r) => r.m1 === m1 && r.m2 === m2 && r.m3 === m3).map((r) => r.stakeholder)
  const label = (id: string) => `${id.slice(-3)} ${S1_SHORT[id]}${ORIGINAL_LIST.includes(id) ? ' ★' : ''}`
  const n = (k: 'm1' | 'm2' | 'm3') => cov.filter((r) => r[k]).length
  const card = (title: string, ids: string[], x: number, y: number, w: number, strong = false) => (
    <g key={title}>
      <rect x={x} y={y} width={w} height={34 + Math.max(1, ids.length) * 20} rx={8} className={strong ? 'f-panel' : 'f-shape'} style={strong ? { stroke: 'var(--wb-accent)', strokeWidth: 2.6 } : undefined} />
      <Txt x={x + 12} y={y + 22} lines={`${title} (${ids.length})`} size={15} weight={700} cls={strong ? 'f-accent-ink' : 'f-ink'} />
      <Txt x={x + 12} y={y + 44} lines={ids.length ? ids.map(label) : ['none']} size={14} lh={20} cls={ids.length ? 'f-ink' : 'f-muted'} />
    </g>
  )
  const empty = [region(true, false, false), region(false, true, false), region(false, true, true)].every((r) => r.length === 0)
  return (
    <Fig title="Which method finds whom" alt={alt} w={700} h={440} mid={mid}>
      {(
        [
          ['M1 sweep', n('m1')],
          ['M2 context', n('m2')],
          ['M3 role class', n('m3')],
        ] as [string, number][]
      ).map(([t, v], i) => (
        <g key={t}>
          <rect x={6 + i * 232} y={6} width={220} height={52} rx={8} className="f-panel" />
          <Txt x={18 + i * 232} y={38} lines={t} size={15.5} weight={600} />
          <Txt x={214 + i * 232} y={40} lines={`${v} of ${cov.length}`} size={18} weight={700} anchor="end" cls="f-accent-ink" />
        </g>
      ))}
      {card('Sweep and role class', region(true, false, true), 6, 74, 336)}
      {card('Sweep and context', region(true, true, false), 356, 74, 338)}
      {card('All three methods', region(true, true, true), 356, 206, 338)}
      {card('Role class only', region(false, false, true), 356, 280, 338, true)}
      <Txt x={18} y={330} lines={empty ? ['Sweep only, context only,', 'context and role class: none'] : ['(other regions: see the table)']} size={14} lh={19} cls="f-muted" />
      <Txt x={6} y={428} lines="★ on the original three-party list · every stakeholder is found by at least one method" size={13.5} cls="f-muted" />
    </Fig>
  )
}

// ------------------------------------------------------------------------------------------- S1.25 exit and hand-off
export function ExitPrepFigure({ alt }: { alt: string }) {
  const mid = useMid()
  const steps: [string, string[]][] = [
    ['Now · 1 min', ['One-minute paper: a stakeholder', 'of your enterprise found by', 'one method only, and which']],
    ['Before Session 2', ['Bring one candidate enterprise:', 'name, purpose, first guess at', 'its system of interest']],
    ['Before Session 2', ['Read SEBoK, Stakeholder Needs', 'Definition (R11 pp.549–555);', 'about 20 minutes in all']],
    ['Session 2', ['Sit with your team; charter,', 'pitch and lead candidate', 'in the laboratory launch']],
  ]
  return (
    <Fig title="Exit and hand-off to Session 2" alt={alt} w={700} h={400} mid={mid}>
      {steps.map(([when, what], i) => {
        const y = 10 + i * 96
        return (
          <g key={i}>
            <circle cx={30} cy={y + 40} r={20} className={i === 0 ? 'f-dot-s1' : 'f-shape'} />
            <text x={30} y={y + 41} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} className="f-ink">
              {i + 1}
            </text>
            {i < 3 && <line x1={30} y1={y + 62} x2={30} y2={y + 94} className="f-arrow" markerEnd={arrow(mid)} />}
            <Txt x={64} y={y + 30} lines={when} size={15.5} weight={700} cls="f-accent-ink" />
            <rect x={210} y={y} width={484} height={82} rx={8} className={i === 0 ? 'f-panel' : 'f-shape'} />
            <Txt x={224} y={y + 22} lines={what} size={14.5} lh={20} />
          </g>
        )
      })}
    </Fig>
  )
}
