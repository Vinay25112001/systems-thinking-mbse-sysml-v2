// Week 1 figures for the rebuilt week (Team Formation / Needs / Identifying Stakeholders, 2026-10-18). Every label comes
// from the Week 1 lesson text or the instructor reference register (src/model/airtaxi.ts, FICTIONAL); nothing here adds
// a claim. Static SVG with theme classes (flow.css), so both themes are designed once; each figure's alt text and text
// equivalent are in src/content/learn/week01.ts.
import { useId } from 'react'
import { Box, Markers } from './Frame'

function Later({ x, y, w, h, lines }: { x: number; y: number; w: number; h: number; lines: string[] }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} className="f-env" strokeDasharray="5 4" />
      {lines.map((l, i) => (
        <text key={i} x={x + w / 2} y={y + h / 2 + (i - (lines.length - 1) / 2) * 16} textAnchor="middle" dominantBaseline="central" fontSize={13} className="f-muted">
          {l}
        </text>
      ))}
    </g>
  )
}

// ------------------------------------------------------------------------------------------- Overview: the week's path
export function WeekPathFigure({ alt }: { alt: string }) {
  const id = useId().replace(/:/g, '')
  const steps = [['Team', 'charter'], ['Enterprise', 'proposal'], ['Boundary', 'and context'], ['Stakeholder', 'register'], ['Initial', 'needs']]
  const W = 118
  const gap = 22
  return (
    <svg viewBox="0 0 900 170" className="lf-svg" role="img" aria-label={alt}>
      <Markers id={id} />
      {steps.map((s, i) => {
        const x = 8 + i * (W + gap)
        return (
          <g key={i}>
            <Box x={x} y={20} w={W} h={60} lines={s} tone="soft" size={13.5} />
            {i < steps.length - 1 && <line x1={x + W + 2} y1={50} x2={x + W + gap - 2} y2={50} className="f-arrow" markerEnd={`url(#${id}-ink)`} />}
          </g>
        )
      })}
      <path d={`M 8 96 L 8 104 L ${8 + 5 * (W + gap) - gap} 104 L ${8 + 5 * (W + gap) - gap} 96`} className="f-arrow" />
      <text x={(8 + 5 * (W + gap) - gap) / 2 + 4} y={126} textAnchor="middle" fontSize={14} fontWeight={600} className="f-accent-ink">
        Week 1 Team Record (your own enterprise)
      </text>
      <line x1={8 + 5 * (W + gap) - gap + 4} y1={50} x2={8 + 5 * (W + gap) + 6} y2={50} className="f-arrow" markerEnd={`url(#${id}-muted)`} />
      <Later x={8 + 5 * (W + gap) + 10} y={14} w={74} h={36} lines={['Week 2']} />
      <Later x={8 + 5 * (W + gap) + 10} y={56} w={74} h={36} lines={['Week 8']} />
      <text x={8 + 5 * (W + gap) + 47} y={112} textAnchor="middle" fontSize={11.5} className="f-muted">
        requirements;
      </text>
      <text x={8 + 5 * (W + gap) + 47} y={127} textAnchor="middle" fontSize={11.5} className="f-muted">
        SysML v2 model
      </text>
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- L1: charter
export function TeamCharterFigure({ alt }: { alt: string }) {
  const roles: [string[], string[]][] = [
    [['Requirements', '& Compliance'], ['STK, CON, NEED']],
    [['Architecture'], ['ENT, EXT']],
    [['AI & Data', 'Management'], ['added in', 'later weeks']],
    [['Verification', '& Validation'], ['added in later weeks;', 'need-quality review']],
  ]
  const W = 168
  return (
    <svg viewBox="0 0 760 230" className="lf-svg" role="img" aria-label={alt}>
      {roles.map(([name, owns], i) => {
        const x = 8 + i * (W + 20)
        return (
          <g key={i}>
            <Box x={x} y={10} w={W} h={58} lines={name} tone="soft" size={14} bold />
            <rect x={x} y={76} width={W} height={64} rx={6} className="f-panel" />
            <text x={x + W / 2} y={94} textAnchor="middle" fontSize={11.5} className="f-muted">
              owned ID prefixes
            </text>
            {owns.map((o, k) => (
              <text key={k} x={x + W / 2} y={114 + k * 16} textAnchor="middle" fontSize={13} className="f-ink">
                {o}
              </text>
            ))}
          </g>
        )
      })}
      <rect x={8} y={156} width={4 * W + 60} height={52} rx={6} className="f-env" />
      <text x={8 + (4 * W + 60) / 2} y={178} textAnchor="middle" fontSize={14} fontWeight={600} className="f-ink">
        Decision rules and communication norms
      </text>
      <text x={8 + (4 * W + 60) / 2} y={197} textAnchor="middle" fontSize={12} className="f-muted">
        shared by the whole team
      </text>
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- L2: three scopes
export function EnterpriseScopeFigure({ alt }: { alt: string }) {
  return (
    <svg viewBox="0 0 760 330" className="lf-svg" role="img" aria-label={alt}>
      <rect x={8} y={8} width={744} height={314} rx={28} className="f-env" />
      <text x={30} y={36} fontSize={14} fontWeight={600} className="f-ink">
        The AeroLink enterprise (SEBoK sense): wider than the company
      </text>
      {['Independent vertiport operators', 'Electric utility’s grid connections', 'Manufacturers’ delivery commitments', 'Funding'].map((t, i) => (
        <Box key={t} x={30 + (i % 2) * 175} y={226 + Math.floor(i / 2) * 46} w={165} h={38} lines={t.length > 22 ? [t.split(' ').slice(0, 2).join(' '), t.split(' ').slice(2).join(' ')] : [t]} size={11.5} />
      ))}
      <rect x={400} y={56} width={330} height={250} rx={22} className="f-boundary" />
      <text x={565} y={80} textAnchor="middle" fontSize={14} fontWeight={600} className="f-accent-ink">
        System of interest
      </text>
      <text x={565} y={98} textAnchor="middle" fontSize={12} className="f-muted">
        AeroLink air-taxi service (chosen for a question)
      </text>
      {['Fleet', 'Vertiports & chargers', 'Operations center', 'Passenger demand'].map((t, i) => (
        <Box key={t} x={420 + (i % 2) * 150} y={118 + Math.floor(i / 2) * 60} w={140} h={44} lines={t.length > 16 ? [t.split(' ')[0], t.split(' ').slice(1).join(' ')] : [t]} tone="soft" size={12.5} />
      ))}
      <rect x={30} y={60} width={340} height={120} rx={10} className="f-panel" />
      <text x={200} y={92} textAnchor="middle" fontSize={14} fontWeight={600} className="f-ink">
        AeroLink Urban Mobility
      </text>
      <text x={200} y={114} textAnchor="middle" fontSize={12.5} className="f-muted">
        the company: one organization
      </text>
      <text x={200} y={134} textAnchor="middle" fontSize={12.5} className="f-muted">
        among several in the enterprise
      </text>
      <text x={200} y={212} textAnchor="middle" fontSize={12} className="f-muted">
        resources the company does not own:
      </text>
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- L4: three sources
export function StakeholderSourcesFigure({ alt }: { alt: string }) {
  const id = useId().replace(/:/g, '')
  const sources: [string[], string][] = [
    [['Context'], 'ANSP, electric utility, manufacturer, responders'],
    [['Life-cycle', 'stages'], 'FAA, city planning, operators, technicians'],
    [['Who is affected', 'or could stop us?'], 'communities, accessibility advocates'],
  ]
  return (
    <svg viewBox="0 0 760 290" className="lf-svg" role="img" aria-label={alt}>
      <Markers id={id} />
      {sources.map(([name, eg], i) => {
        const y = 14 + i * 92
        return (
          <g key={i}>
            <Box x={8} y={y} w={170} h={62} lines={name} tone="soft" size={13.5} bold />
            <line x1={180} y1={y + 31} x2={556} y2={145} className="f-arrow" markerEnd={`url(#${id}-ink)`} />
            {/* labels sit just past the source box, above a falling or level arrow and below a rising one */}
            <text x={192} y={i === 2 ? y + 31 + 20 : y + 31 - 10} fontSize={12} className="f-edge-label">
              {eg}
            </text>
          </g>
        )
      })}
      <Box x={560} y={95} w={190} h={100} lines={['Stakeholder', 'register', '14 for AeroLink']} size={14} bold />
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- L5: a register row
export function RegisterRowFigure({ alt }: { alt: string }) {
  const cells: [string, string[], number][] = [
    ['ID', ['STK-010'], 78],
    ['Stakeholder', ['Electric', 'utility'], 88],
    ['Role', ['Supplier of an', 'enabling system'], 120],
    ['Stage', ['Operation'], 80],
    ['Int./ext.', ['External'], 74],
    ['Approves?', ['No'], 74],
    ['Concern (CON-011)', ['Peak charging above', 'the agreed connection'], 156],
    ['Influence', ['4: grid capacity', 'can cap charging'], 74 + 40],
  ]
  let x = 4
  const groups: [string, number, number][] = []
  const pos = cells.map(([, , w]) => {
    const p = x
    x += w
    return p
  })
  groups.push(['who', pos[0], pos[2]], ['classification', pos[2], pos[6]], ['concern', pos[6], pos[7]], ['influence', pos[7], x])
  return (
    <svg viewBox={`0 0 ${x + 8} 190`} className="lf-svg" role="img" aria-label={alt}>
      {groups.map(([g, a, b]) => (
        <g key={g}>
          <path d={`M ${a + 4} 34 L ${a + 4} 26 L ${b - 4} 26 L ${b - 4} 34`} className="f-arrow" />
          <text x={(a + b) / 2} y={18} textAnchor="middle" fontSize={12.5} fontWeight={600} className="f-accent-ink">
            {g}
          </text>
        </g>
      ))}
      {cells.map(([h, v, w], i) => (
        <g key={h}>
          <rect x={pos[i]} y={42} width={w} height={34} className="f-panel" />
          <text x={pos[i] + w / 2} y={59} textAnchor="middle" dominantBaseline="central" fontSize={11.5} fontWeight={600} className="f-ink">
            {h}
          </text>
          <rect x={pos[i]} y={76} width={w} height={72} className="f-shape" />
          {v.map((t, k) => (
            <text key={k} x={pos[i] + w / 2} y={112 + (k - (v.length - 1) / 2) * 16} textAnchor="middle" dominantBaseline="central" fontSize={12} className="f-ink">
              {t}
            </text>
          ))}
        </g>
      ))}
      <text x={4} y={176} fontSize={11.5} className="f-muted">
        Instructor reference register; the rating is FICTIONAL.
      </text>
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- L6: stakeholder to requirement
export function NeedChainFigure({ alt }: { alt: string }) {
  const id = useId().replace(/:/g, '')
  const boxes: [string[], boolean][] = [
    [['Stakeholder', 'STK-004', 'communities'], true],
    [['Concern', 'CON-012', 'community noise'], true],
    [['Need', 'NEED-003', 'stakeholder’s side'], true],
    [['Requirement', 'Week 2', 'developer’s side'], false],
  ]
  const W = 160
  return (
    <svg viewBox="0 0 760 210" className="lf-svg" role="img" aria-label={alt}>
      <Markers id={id} />
      {boxes.map(([lines, now], i) => {
        const x = 8 + i * (W + 32)
        return (
          <g key={i}>
            {now ? <Box x={x} y={40} w={W} h={80} lines={lines} tone={i === 2 ? 'soft' : 'box'} size={13.5} /> : <Later x={x} y={40} w={W} h={80} lines={lines} />}
            {i < boxes.length - 1 && <line x1={x + W + 2} y1={80} x2={x + W + 30} y2={80} className="f-arrow" markerEnd={`url(#${id}-ink)`} />}
          </g>
        )
      })}
      <path d={`M ${8 + 3 * (W + 32) + W / 2} 122 C ${8 + 3 * (W + 32) + W / 2} 180, ${8 + 2 * (W + 32) + W / 2} 180, ${8 + 2 * (W + 32) + W / 2} 124`} className="f-arrow accent" markerEnd={`url(#${id}-accent)`} />
      <text x={8 + 2 * (W + 32) + W + 16} y={192} textAnchor="middle" fontSize={12.5} className="f-accent-ink">
        validated against the need
      </text>
      <text x={8} y={22} fontSize={12.5} className="f-muted">
        This week
      </text>
      <text x={8 + 3 * (W + 32)} y={22} fontSize={12.5} className="f-muted">
        Week 2
      </text>
    </svg>
  )
}

// ------------------------------------------------------------------------------------------- L7: anatomy of a need
export function NeedAnatomyFigure({ alt }: { alt: string }) {
  const parts: [string, string, number][] = [
    ['Communities near vertiports', 'who needs it', 190],
    ['need the air-taxi service to', 'need the [system] to, not “shall”', 170],
    ['keep take-off and landing noise exposure within the agreed limits,', 'what, with no design', 300],
    ['at every pad, at all operating hours.', 'condition', 190],
  ]
  let x = 4
  const pos = parts.map(([, , w]) => {
    const p = x
    x += w + 8
    return p
  })
  return (
    <svg viewBox={`0 0 ${x} 220`} className="lf-svg" role="img" aria-label={alt}>
      {parts.map(([t, label, w], i) => {
        const words = t.split(' ')
        const half = Math.ceil(words.length / 2)
        const lines = w > 200 ? [words.slice(0, half).join(' '), words.slice(half).join(' ')] : t.length > 26 ? [words.slice(0, half).join(' '), words.slice(half).join(' ')] : [t]
        return (
          <g key={i}>
            <rect x={pos[i]} y={10} width={w} height={64} rx={6} className={i === 1 ? 'f-panel' : 'f-shape'} />
            {lines.map((l, k) => (
              <text key={k} x={pos[i] + w / 2} y={42 + (k - (lines.length - 1) / 2) * 17} textAnchor="middle" dominantBaseline="central" fontSize={13} className="f-ink">
                {l}
              </text>
            ))}
            <path d={`M ${pos[i] + 4} 82 L ${pos[i] + 4} 90 L ${pos[i] + w - 4} 90 L ${pos[i] + w - 4} 82`} className="f-arrow" />
            <text x={pos[i] + w / 2} y={108} textAnchor="middle" fontSize={12.5} fontWeight={600} className="f-accent-ink">
              {label}
            </text>
          </g>
        )
      })}
      {[['ID', 'NEED-003'], ['Source', 'STK-004, CON-012'], ['Rationale', 'recorded with it']].map(([k, v], i) => (
        <g key={k}>
          <rect x={4 + i * 250} y={140} width={236} height={50} rx={6} className="f-env" />
          <text x={4 + i * 250 + 118} y={160} textAnchor="middle" fontSize={12} fontWeight={600} className="f-ink">
            {k}
          </text>
          <text x={4 + i * 250 + 118} y={178} textAnchor="middle" fontSize={12} className="f-muted">
            {v}
          </text>
        </g>
      ))}
    </svg>
  )
}
