// Week 8, Session 2 lecture figures (packages and names, the toolchain, the import mapping, the model skeleton, the
// audit, the bridge to Week 9 and the Lab L8 launch). Original drawings: none redraws a SEBoK, OMG or training-deck
// figure. Every label comes from the slide's caption and alt text (src/content/lectures/week08/session2.ts) or from the
// data modules: src/content/lectures/week08/aerolinkCase.ts (AEROLINK_AUDIT) and labBrief.ts (MODEL_PACKAGES,
// LAB8_OUTPUTS, FINDING_CLASSES). AeroLink is FICTIONAL; a figure adds no claim of its own. Static SVG with the shared
// theme classes (f-shape, f-soft, f-panel, f-env, f-label, f-muted, f-accent-ink, f-arrow) and theme variables, so the
// light and dark themes are both designed once; meaning is never carried by color alone (dash patterns, outlines,
// labels). The small helpers are copied from the Week 2 figures, not imported (separate owners).
// Review status: new-pending-review.
import { useId, type ReactNode } from 'react'
import { Markers } from './Frame'
import { AEROLINK_AUDIT } from '../../content/lectures/week08/aerolinkCase'
import { FINDING_CLASSES, LAB8_OUTPUTS, MODEL_PACKAGES } from '../../content/lectures/week08/labBrief'

// ------------------------------------------------------------------------------------------------ shared helpers
type Tone = 'box' | 'soft' | 'panel' | 'env' | 'warn' | 'dash'
const WARN_FILL = { fill: 'var(--wb-warn-soft)', stroke: 'var(--wb-warn)', strokeWidth: 1.8 }

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
  if (tone === 'dash') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-env" strokeDasharray="7 5" style={sw} />
  return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-shape" style={sw} />
}

type Ink = 'ink' | 'muted' | 'accent' | 'warn'
const inkProps = (ink: Ink) => (ink === 'warn' ? { style: { fill: 'var(--wb-warn)' } } : { className: ink === 'muted' ? 'f-muted' : ink === 'accent' ? 'f-accent-ink' : 'f-label' })

function Lines({ x, y, lines, size = 17, anchor = 'middle', weight = 500, ink = 'ink', lh = 1.25, mono = false }: { x: number; y: number; lines: string[]; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; ink?: Ink; lh?: number; mono?: boolean }) {
  const step = size * lh
  const top = y - ((lines.length - 1) * step) / 2
  return (
    <>
      {lines.map((l, i) => (
        <text key={i} x={x} y={top + i * step} textAnchor={anchor} dominantBaseline="central" fontSize={size} fontWeight={weight} style={mono ? { fontFamily: 'var(--wb-mono, monospace)' } : undefined} {...inkProps(ink)}>
          {l}
        </text>
      ))}
    </>
  )
}

function Card({ x, y, w, h, lines, tone = 'box', size = 17, weight = 500, ink, strong = false, mono = false }: { x: number; y: number; w: number; h: number; lines: string[]; tone?: Tone; size?: number; weight?: number; ink?: Ink; strong?: boolean; mono?: boolean }) {
  return (
    <g>
      <Shape x={x} y={y} w={w} h={h} tone={tone} strong={strong} />
      <Lines x={x + w / 2} y={y + h / 2} lines={lines} size={size} weight={weight} ink={ink ?? 'ink'} mono={mono} />
    </g>
  )
}

function Arrow({ d, id, tone = 'ink', dashed = false, width }: { d: string; id: string; tone?: 'ink' | 'accent' | 'muted' | 'warn'; dashed?: boolean; width?: number }) {
  const style = tone === 'warn' ? { stroke: 'var(--wb-warn)', strokeWidth: width ?? 2.6 } : tone === 'muted' ? { stroke: 'var(--wb-muted)', strokeWidth: width ?? 1.8 } : width ? { strokeWidth: width } : undefined
  return <path d={d} className={`f-arrow${tone === 'accent' ? ' accent' : ''}`} style={style} strokeDasharray={dashed ? '7 5' : undefined} markerEnd={`url(#${id}-${tone})`} fill="none" />
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

/** A package drawn as a folder: a small tab above a body, with the name in the tab. */
function Folder({ x, y, w, h, name, tone = 'panel', strong = false, size = 16 }: { x: number; y: number; w: number; h: number; name: string; tone?: Tone; strong?: boolean; size?: number }) {
  const tabW = Math.min(w - 10, name.length * size * 0.6 + 26)
  return (
    <g>
      <Shape x={x} y={y} w={tabW} h={26} tone={tone} rx={5} strong={strong} />
      <Shape x={x} y={y + 22} w={w} h={h - 22} tone={tone} strong={strong} />
      <Lines x={x + 12} y={y + 13} lines={[name]} size={size} anchor="start" weight={700} />
    </g>
  )
}

/** A small check mark or "gap" tag (text as well as shape). */
function Mark({ cx, cy, ok }: { cx: number; cy: number; ok: boolean }) {
  return ok ? (
    <g>
      <circle cx={cx} cy={cy} r={15} className="f-soft" style={{ fill: 'var(--wb-accent)', stroke: 'none' }} />
      <path d={`M ${cx - 7} ${cy} L ${cx - 2} ${cy + 6} L ${cx + 8} ${cy - 6}`} fill="none" style={{ stroke: 'var(--wb-panel)', strokeWidth: 3 }} />
    </g>
  ) : (
    <g>
      <rect x={cx - 22} y={cy - 13} width={44} height={26} rx={13} style={WARN_FILL} strokeDasharray="4 3" />
      <Lines x={cx} y={cy} lines={['gap']} size={15} weight={700} />
    </g>
  )
}

// ------------------------------------------------------------------------------------------------ packages and names
export function PackageTreeFigure({ alt }: { alt: string }) {
  return (
    <Svg w={1300} h={640} alt={alt}>
      {(id) => (
        <g>
          <Folder x={30} y={20} w={1240} h={520} name="AeroLink Model v0.1" tone="panel" size={18} />
          <Folder x={70} y={110} w={440} h={380} name="Context" tone="soft" />
          <Card x={100} y={180} w={380} h={70} lines={['ENT-001', 'AeroLink Urban Mobility']} />
          <Card x={100} y={360} w={380} h={60} lines={['part context']} mono />
          <Folder x={560} y={110} w={680} h={380} name="Stakeholders" tone="soft" strong />
          <Card x={600} y={180} w={300} h={70} lines={['STK-005', 'Vertiport operators']} strong />
          <Card x={600} y={300} w={600} h={70} lines={['CON-006', 'Pad throughput and charging capacity']} />
          <Card x={600} y={400} w={200} h={60} lines={['REL-002']} />
          {/* qualified-name paths */}
          <Arrow d="M 200 60 C 260 90 640 70 650 128" id={id} tone="accent" width={4} />
          <Arrow d="M 700 150 L 720 178" id={id} tone="accent" width={4} />
          <Lines x={940} y={150} lines={["Stakeholders::'STK-005'"]} size={19} weight={700} ink="accent" mono anchor="start" />
          <Arrow d="M 130 150 C 110 250 110 330 160 358" id={id} tone="muted" />
          <Lines x={150} y={300} lines={['Context::context']} size={17} weight={600} ink="muted" mono anchor="start" />
          <Lines x={650} y={590} lines={['Each package is a namespace for its members and a container for its owned members.']} size={17} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ the toolchain
export function ToolchainFlowFigure({ alt }: { alt: string }) {
  const y = 220
  const h = 150
  return (
    <Svg w={1360} h={680} alt={alt}>
      {(id) => (
        <g>
          <Card x={30} y={40} w={260} h={90} lines={['Eclipse SysON', '(optional, graphical editing)']} tone="dash" size={16} ink="muted" />
          <Card x={30} y={y} w={260} h={h} lines={wrap('Editor or SysML notebook (textual notation)', 20)} size={17} />
          <Card x={360} y={y} w={260} h={h} lines={['team-NN-model-v01.sysml', '(one file per version)']} size={16} />
          <Card x={690} y={y - 20} w={330} h={h + 40} lines={wrap('Course-designated checker: OMG SysML v2 Pilot Implementation, release 2026-08 (pilot of the 2.1 Beta 2 texts)', 26)} size={17} weight={600} strong />
          <Card x={1090} y={y} w={240} h={h} lines={wrap('Log: PASS or FAIL, with ERROR and WARNING lines', 18)} size={17} />
          <Arrow d={`M 290 ${y + h / 2} L 356 ${y + h / 2}`} id={id} />
          <Lines x={323} y={y + h / 2 - 18} lines={['save']} size={15} ink="muted" />
          <Arrow d={`M 620 ${y + h / 2} L 686 ${y + h / 2}`} id={id} width={3} />
          <Lines x={653} y={y + h / 2 - 18} lines={['check']} size={15} ink="muted" />
          <Arrow d={`M 1020 ${y + h / 2} L 1086 ${y + h / 2}`} id={id} />
          <Arrow d={`M 200 130 C 300 150 420 170 470 ${y - 4}`} id={id} tone="muted" dashed />
          <Card x={300} y={450} w={460} h={130} lines={wrap('Week 8 lab tool (in this app): import the Team Record, mapping table, findings, preview, export .sysml', 38)} tone="soft" size={17} />
          <Arrow d={`M 490 450 L 490 ${y + h + 4}`} id={id} tone="accent" />
          <Lines x={505} y={410} lines={['generates the first draft']} size={16} ink="accent" anchor="start" weight={600} />
          <Card x={820} y={450} w={420} h={130} lines={wrap('AeroLink engineering model page (instructor example)', 30)} tone="env" size={17} />
          <Lines x={680} y={640} lines={['Grades follow the instructor’s checker run.']} size={17} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function DecidesColumnsFigure({ alt }: { alt: string }) {
  const left = ['Syntax: does the text parse?', 'Names: does every name resolve, in the file and the standard library?', 'Rules: does any validation rule fire? ERROR fails the file; WARNING does not']
  const right = ['Meaning: is it the right construct (definition or usage, composite or referential)?', 'Completeness: is every register item there?', 'Fidelity: does each doc say what the register says?', 'Purpose: does the model serve the decisions it is for?']
  const col = (x: number, title: string, rows: string[], icon: 'gear' | 'person') => (
    <g>
      <Shape x={x} y={90} w={590} h={450} tone="panel" />
      {icon === 'gear' ? (
        <g>
          <circle cx={x + 40} cy={125} r={14} fill="none" className="f-arrow" style={{ strokeWidth: 4, strokeDasharray: '5 3' }} />
          <circle cx={x + 40} cy={125} r={5} className="f-arrow" fill="none" />
        </g>
      ) : (
        <g>
          <circle cx={x + 40} cy={115} r={8} fill="none" className="f-arrow" />
          <path d={`M ${x + 26} ${142} Q ${x + 40} ${118} ${x + 54} ${142}`} fill="none" className="f-arrow" />
        </g>
      )}
      <Lines x={x + 70} y={125} lines={[title]} size={21} weight={700} anchor="start" />
      {rows.map((r, i) => {
        const yy = 170 + i * (rows.length === 3 ? 120 : 90)
        const hh = rows.length === 3 ? 100 : 76
        return <Card key={i} x={x + 20} y={yy} w={550} h={hh} lines={wrap(r, 52)} size={17} tone={icon === 'gear' ? 'box' : 'soft'} />
      })}
    </g>
  )
  return (
    <Svg w={1300} h={680} alt={alt}>
      {() => (
        <g>
          <Lines x={650} y={45} lines={['One file, two judgments']} size={24} weight={700} />
          {col(40, 'The checker decides', left, 'gear')}
          {col(670, 'You decide', right, 'person')}
          <Card x={40} y={575} w={1220} h={70} lines={['Session 1, item 3: an attribute definition owning a part — PASS, no message']} tone="warn" size={18} weight={600} />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ the import
export function MappingArrowsFigure({ alt }: { alt: string }) {
  const parts: { label: string[]; key: string }[] = [
    { label: ['Week 1 register', '(ENT, EXT, PRT, STK, CON, REL, MGO, NEED)'], key: 'w1' },
    { label: ['Week 2 ConOps and requirements'], key: 'w2' },
    { label: ['Week 3 technology, risk, trade study'], key: 'w3' },
    { label: ['Week 4 architecture'], key: 'w4' },
    { label: ['Week 5 components and interfaces'], key: 'w5' },
    { label: ['Week 6 roadmap'], key: 'w6' },
  ]
  const pkgs = ['Context', 'Stakeholders', 'Physical', 'Needs', 'Requirements', 'Behavior', 'Logical', 'Verification', 'Analysis', 'AROU', 'Evolution']
  const py = (i: number) => 110 + i * 52
  const ly = (i: number) => 120 + i * 92
  const L = (k: string) => ly(parts.findIndex((p) => p.key === k)) + 36
  const P = (n: string) => py(pkgs.indexOf(n)) + 22
  const links: { from: string; to: string; week: string; solid?: boolean }[] = [
    { from: 'w1', to: 'Context', week: '', solid: true },
    { from: 'w1', to: 'Stakeholders', week: '', solid: true },
    { from: 'w1', to: 'Physical', week: '', solid: true },
    { from: 'w2', to: 'Needs', week: 'Week 9' },
    { from: 'w2', to: 'Requirements', week: 'Week 9' },
    { from: 'w4', to: 'Behavior', week: 'Week 10' },
    { from: 'w4', to: 'Logical', week: 'Week 10' },
    { from: 'w5', to: 'Physical', week: 'Week 11' },
    { from: 'w2', to: 'Verification', week: 'Week 12' },
    { from: 'w3', to: 'Analysis', week: 'Week 13' },
    { from: 'w3', to: 'AROU', week: 'Week 13' },
    { from: 'w6', to: 'Evolution', week: 'Week 14' },
  ]
  return (
    <Svg w={1300} h={700} alt={alt}>
      {(id) => (
        <g>
          <Shape x={30} y={40} w={470} h={640} tone="panel" />
          <Lines x={265} y={78} lines={['Systems Thinking Engineering Package (Week 7)']} size={18} weight={700} />
          {parts.map((p, i) => (
            <Card key={p.key} x={50} y={ly(i)} w={430} h={72} lines={p.label} size={p.label.length > 1 ? 16 : 17} tone={p.key === 'w1' ? 'soft' : 'box'} strong={p.key === 'w1'} />
          ))}
          {pkgs.map((n, i) => (
            <Card key={n} x={1040} y={py(i)} w={230} h={44} lines={[n]} size={17} weight={600} tone={['Context', 'Stakeholders', 'Physical'].includes(n) ? 'soft' : 'dash'} strong={['Context', 'Stakeholders', 'Physical'].includes(n)} />
          ))}
          <Lines x={1155} y={80} lines={['Model packages']} size={18} weight={700} />
          {links.map((k, i) => {
            const y1 = L(k.from)
            const y2 = P(k.to) + (k.from === 'w5' ? 8 : 0)
            return <Arrow key={i} d={`M 482 ${y1} C 720 ${y1} 800 ${y2} 1036 ${y2}`} id={id} tone={k.solid ? 'accent' : 'muted'} dashed={!k.solid} width={k.solid ? 3.5 : undefined} />
          })}
          <Lines x={760} y={118} lines={['modeled now']} size={17} weight={700} ink="accent" />
          {[...new Set(links.filter((k) => k.week).map((k) => k.week))].map((wk) => {
            const first = links.find((k) => k.week === wk)!
            return <Lines key={wk} x={960} y={P(first.to) - 16} lines={[wk]} size={15} weight={600} ink="muted" />
          })}
        </g>
      )}
    </Svg>
  )
}

export function PackageSkeletonFigure({ alt }: { alt: string }) {
  const per = Math.ceil(MODEL_PACKAGES.length / 2)
  const w = Math.floor((1240 - (per - 1) * 18) / per)
  const h = 170
  return (
    <Svg w={1340} h={620} alt={alt}>
      {() => (
        <g>
          <Folder x={20} y={20} w={1300} h={580} name="Model v0.1" tone="panel" size={19} />
          <Card x={50} y={70} w={1240} h={52} lines={['doc: Purpose — who uses this model, for which decisions']} tone="env" size={18} weight={600} />
          {MODEL_PACKAGES.map((p, i) => {
            const row = Math.floor(i / per)
            const col = i % per
            const x = 50 + col * (w + 18)
            const y = 150 + row * (h + 40)
            const now = p.filledIn === 8
            return (
              <g key={p.name}>
                <Folder x={x} y={y} w={w} h={h} name={p.name} tone={now ? 'soft' : 'dash'} strong={now} size={16} />
                <Lines x={x + w / 2} y={y + 90} lines={wrap(p.holds, Math.floor(w / 9.2)).slice(0, 4)} size={15} ink={now ? 'ink' : 'muted'} />
                <Lines x={x + w / 2} y={y + h - 16} lines={[now ? 'Week 8, modeled now' : `filled in Week ${p.filledIn}`]} size={15} weight={700} ink={now ? 'accent' : 'muted'} />
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ audit and bridge
export function AuditChecklistFigure({ alt }: { alt: string }) {
  const rowH = 140
  const top = 70
  return (
    <Svg w={1360} h={top + AEROLINK_AUDIT.length * rowH + 30} alt={alt}>
      {() => (
        <g>
          {['Question', 'Result', 'Disposition', 'Status'].map((t, i) => (
            <Lines key={t} x={[175, 600, 1045, 1265][i]} y={40} lines={[t]} size={18} weight={700} />
          ))}
          {AEROLINK_AUDIT.map((a, i) => {
            const y = top + i * rowH
            return (
              <g key={a.question}>
                <Shape x={90} y={y} w={1240} h={rowH - 10} tone={a.ok ? 'panel' : 'warn'} />
                <Lines x={175} y={y + rowH / 2 - 5} lines={[a.question]} size={18} weight={700} />
                <Lines x={275} y={y + rowH / 2 - 5} lines={wrap(a.result, 64).slice(0, 5)} size={15} anchor="start" lh={1.2} />
                <Lines x={890} y={y + rowH / 2 - 5} lines={wrap(a.disposition, 40).slice(0, 5)} size={15} anchor="start" lh={1.2} />
                <Mark cx={1265} cy={y + rowH / 2 - 5} ok={a.ok} />
              </g>
            )
          })}
          {[
            ['the tool answers', 0],
            ['the team answers', 2],
          ].map(([t, r]) => {
            const y1 = top + (r as number) * rowH
            const y2 = y1 + 2 * rowH - 10
            return (
              <g key={t as string}>
                <path d={`M 80 ${y1} L 66 ${y1} L 66 ${y2} L 80 ${y2}`} fill="none" style={{ stroke: 'var(--wb-muted)', strokeWidth: 2.2 }} />
                <text x={44} y={(y1 + y2) / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} className="f-muted" transform={`rotate(-90 44 ${(y1 + y2) / 2})`}>
                  {t as string}
                </text>
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

export function BridgeFigure({ alt }: { alt: string }) {
  return (
    <Svg w={1300} h={600} alt={alt}>
      {(id) => (
        <g>
          <Card x={40} y={170} w={340} h={140} lines={['CON-006', 'Pad throughput and', 'charging capacity', '(Week 8, modeled now)']} tone="soft" strong size={17} />
          <Card x={500} y={170} w={340} h={140} lines={['NEED-004', 'Pads not limited by turnaround', '(Week 9: requirement)']} tone="dash" size={17} />
          <Card x={500} y={400} w={340} h={110} lines={['stakeholder and system', 'requirements (Week 9)']} tone="dash" size={17} />
          <Card x={940} y={170} w={320} h={140} lines={['Operator view', 'viewpoint (Week 14)']} tone="dash" size={17} />
          <Arrow d="M 496 240 L 384 240" id={id} tone="accent" width={3} />
          <Lines x={440} y={222} lines={['frame']} size={17} weight={700} ink="accent" />
          <Arrow d="M 670 400 L 670 314" id={id} />
          <Lines x={685} y={357} lines={['derived from']} size={16} weight={600} anchor="start" ink="muted" />
          <Arrow d="M 1100 166 C 1100 60 210 60 210 166" id={id} tone="accent" width={3} />
          <Lines x={655} y={50} lines={['frame']} size={17} weight={700} ink="accent" />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ lab launch
export function DeliverablesFigure({ alt }: { alt: string }) {
  const w = 400
  return (
    <Svg w={1300} h={600} alt={alt}>
      {() => (
        <g>
          {LAB8_OUTPUTS.map((o, i) => {
            const x = 30 + i * (w + 25)
            return (
              <g key={o.file}>
                <path d={`M ${x} 40 L ${x + w - 40} 40 L ${x + w} 80 L ${x + w} 460 L ${x} 460 Z`} className="f-panel" />
                <path d={`M ${x + w - 40} 40 L ${x + w - 40} 80 L ${x + w} 80`} fill="none" className="f-arrow" style={{ strokeWidth: 1.6 }} />
                <Lines x={x + w / 2} y={110} lines={[o.file]} size={17} weight={700} mono />
                <Lines x={x + 24} y={290} lines={wrap(o.what, 40).slice(0, 10)} size={16} anchor="start" lh={1.3} />
              </g>
            )
          })}
          <Card x={30} y={495} w={1250} h={70} lines={['One upload by one member, before Week 9, Session 1. AI usage statement included in the mapping matrix file.']} tone="env" size={17} weight={600} />
        </g>
      )}
    </Svg>
  )
}

export function LabToolStepsFigure({ alt }: { alt: string }) {
  const w = 315
  const panel = (i: number, title: string, body: ReactNode) => {
    const x = 20 + i * (w + 15)
    return (
      <g key={title}>
        <Shape x={x} y={30} w={w} h={600} tone="panel" />
        <rect x={x} y={30} width={w} height={44} rx={7} className="f-env" />
        <circle cx={x + 26} cy={52} r={14} style={{ fill: 'var(--wb-accent)' }} />
        <text x={x + 26} y={52} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} style={{ fill: 'var(--wb-panel)' }}>
          {i + 1}
        </text>
        <Lines x={x + 50} y={52} lines={[title]} size={18} weight={700} anchor="start" />
        <g transform={`translate(${x} 0)`}>{body}</g>
      </g>
    )
  }
  const rows = [
    ['ENT', 'modeled now'],
    ['STK', 'modeled now'],
    ['CON', 'modeled now'],
    ['NEED', 'Week 9'],
    ['TECH', 'enter count'],
  ]
  return (
    <Svg w={1340} h={660} alt={alt}>
      {() => (
        <g>
          {panel(
            0,
            'Import',
            <g>
              <rect x={20} y={100} width={275} height={230} rx={10} className="f-env" strokeDasharray="7 5" />
              <Lines x={157} y={215} lines={wrap('Week 1 model inputs (.json), versions 1 to 3; optional Week 2 model inputs', 24)} size={16} />
              <rect x={20} y={360} width={275} height={110} rx={8} style={WARN_FILL} />
              <Lines x={157} y={415} lines={wrap('AeroLink records are refused: import your own', 24)} size={16} weight={600} />
            </g>,
          )}
          {panel(
            1,
            'Map',
            <g>
              <Lines x={20} y={105} lines={['Kind · Package · Construct · Week · Count']} size={15} weight={700} anchor="start" ink="muted" />
              {rows.map(([k, s], j) => (
                <g key={k}>
                  <rect x={20} y={125 + j * 70} width={275} height={58} rx={6} className={s === 'modeled now' ? 'f-soft' : 'f-env'} strokeDasharray={s === 'modeled now' ? undefined : '6 4'} style={{ fill: s === 'modeled now' ? 'var(--wb-accent-soft, transparent)' : undefined, stroke: 'var(--wb-muted)' }} />
                  <Lines x={36} y={154 + j * 70} lines={[k]} size={17} weight={700} anchor="start" mono />
                  <Lines x={280} y={154 + j * 70} lines={[s]} size={16} anchor="end" weight={600} ink={s === 'modeled now' ? 'accent' : 'muted'} />
                </g>
              ))}
            </g>,
          )}
          {panel(
            2,
            'Findings',
            <g>
              {FINDING_CLASSES.map((f, j) => (
                <g key={f.id}>
                  <rect x={20} y={100 + j * 125} width={275} height={44} rx={22} style={f.id === 'defect' || f.id === 'gap' ? WARN_FILL : undefined} className={f.id === 'defect' || f.id === 'gap' ? undefined : 'f-env'} strokeDasharray={f.id === 'info' ? '6 4' : undefined} />
                  <Lines x={157} y={122 + j * 125} lines={wrap(f.label, 28).slice(0, 1)} size={15} weight={700} />
                  {f.id === 'gap' && (
                    <g>
                      <rect x={40} y={152 + j * 125} width={255} height={40} rx={5} className="f-panel" strokeDasharray="4 3" />
                      <Lines x={52} y={172 + j * 125} lines={['disposition']} size={15} anchor="start" ink="muted" />
                    </g>
                  )}
                </g>
              ))}
            </g>,
          )}
          {panel(
            3,
            'Preview and export',
            <g>
              <rect x={20} y={100} width={275} height={300} rx={8} className="f-env" />
              <Lines x={34} y={150} lines={["package '…Model' {", "  doc /* Purpose: … */", '  package Context {', '  package Stakeholders {', '  …']} size={15} anchor="start" mono lh={1.6} />
              <Card x={20} y={430} w={275} h={60} lines={['Export .sysml']} tone="soft" size={17} weight={700} strong />
              <Card x={20} y={510} w={275} h={80} lines={['Export mapping', 'matrix (.md)']} tone="soft" size={17} weight={700} />
            </g>,
          )}
        </g>
      )}
    </Svg>
  )
}

export function SevenDaysFigure({ alt }: { alt: string }) {
  const dayW = 170
  const x0 = 70
  const X = (d: number) => x0 + (d - 1) * dayW
  const bars: { from: number; to: number; text: string; lead: string }[] = [
    { from: 1, to: 2, text: 'Mapping matrix and skeleton with purpose; each member writes the doc of ≥ 1 package', lead: 'Architecture' },
    { from: 3, to: 3, text: 'Context package', lead: 'Architecture' },
    { from: 3, to: 4, text: 'Stakeholders package (stakeholders, concerns, ratings); relationships', lead: 'Requirements & Compliance; Architecture' },
    { from: 5, to: 5, text: 'Import audit with dispositions', lead: 'Verification & Validation' },
    { from: 6, to: 6, text: 'Checker runs to zero errors; AI usage statement', lead: 'AI & Data runs; owners fix' },
    { from: 7, to: 7, text: 'Integration review and upload', lead: 'Verification & Validation' },
  ]
  return (
    <Svg w={1310} h={720} alt={alt}>
      {() => (
        <g>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <g key={d}>
              <line x1={X(d)} y1={60} x2={X(d)} y2={705} style={{ stroke: 'var(--wb-muted)', strokeWidth: 1 }} strokeDasharray="3 5" />
              <Lines x={X(d) + dayW / 2} y={40} lines={[`Day ${d}`]} size={18} weight={700} />
            </g>
          ))}
          {bars.map((b, i) => {
            const x = X(b.from) + 6
            const w = (b.to - b.from + 1) * dayW - 12
            const y = 70 + i * 106
            return (
              <g key={i}>
                <Shape x={x} y={y} w={w} h={100} tone={i % 2 ? 'soft' : 'panel'} />
                <Lines x={x + 12} y={y + 32} lines={wrap(b.text, Math.floor(w / 8.6))} size={15} anchor="start" weight={600} lh={1.15} />
                <Lines x={x + 12} y={y + 80} lines={wrap(b.lead, Math.floor(w / 8.6))} size={15} anchor="start" ink="accent" lh={1.15} />
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}
