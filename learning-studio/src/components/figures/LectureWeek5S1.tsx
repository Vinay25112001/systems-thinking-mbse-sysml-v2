// Week 5, Session 1 lecture figures (components and their breakdown, what an interface is and how it is typed, external
// and hidden external interfaces, the N² chart built and read on AeroLink, the crossing-flow check, the interface table,
// interface requirements and modularity). Original drawings: none redraws a SEBoK, MITRE or DoD figure. Every number,
// name and identifier is imported from src/content/lectures/week05/aerolinkCase.ts and labBrief.ts (or the Week 4 case
// they import); every other label is a phrase from the slide text. The N² figures are generated from n2Cell and degreeOf
// over the received interface set. AeroLink is FICTIONAL; a figure adds no claim of its own. Canvas sizes and the 12 pt
// label rule: week5FigureKit.ts. The figure map is in lectureWeek5Figures.ts. Review status: new-pending-review.
import { fn, logical, physical } from '../../content/lectures/week04/aerolinkCase'
import {
  COUNTS, DIAGONAL, INTERFACE_DECISION, INTERFACE_REQUIREMENTS, RECEIVED, SHORT, componentsOf, crossingFlows, degreeOf, directionOf, elementName, functionsAt, iface, isExternal, isExternalInterface, n2Cell, ownerOf,
} from '../../content/lectures/week05/aerolinkCase'
import { TABLE_COLUMNS } from '../../content/lectures/week05/labBrief'
import { Arrow, Card, Chip, Cloud, Computer, Doc, Envelope, ExtMark, KindRect, Line, Lines, Person, Shape, Svg } from './LectureWeek5Parts'
import { FB_W, FW_H, FW_W, KIND_STYLE, MIN_FB, MIN_FW, MODULARITY, textW, wrap, type KindId } from './week5FigureKit'

const S = MIN_FB // 22: smallest label on figure-bullets canvases
const L = S + 2
const F = MIN_FW // 14: smallest label on full-width worked canvases
const c14 = COUNTS.received

// ------------------------------------------------------------------------------------------------ framing
/** The driving-question scene; `answered` adds the IF-015 arrow (w5s1-answer reuses it, drawn in a shorter band: `k`
 *  scales positions only, never the text). */
function Scene({ id, answered, k = 1 }: { id: string; answered: boolean; k?: number }) {
  const if7 = iface('IF-007')
  const if15 = iface('IF-015')
  const Y = (v: number) => Math.round(v * k)
  return (
    <g>
      <Card x={20} y={Y(110)} w={250} h={Math.max(70, Y(90))} lines={[SHORT['PHY-008'], `(${if7.ends[0]})`]} size={L} weight={700} />
      {[0, 1, 2].map((q) => (
        <Doc key={q} x={40 + q * 12} y={Y(222) + q * 10} w={60} h={50} />
      ))}
      <Lines x={140} y={Y(222) + 40} lines={['pad incident', 'records']} size={S} ink="muted" anchor="start" />
      <Card x={560} y={Y(20)} w={320} h={Math.max(70, Y(90))} lines={wrap(elementName(if7.ends[1]), 18)} size={S} weight={700} />
      <Line d={`M 272 ${Y(150)} L 558 ${Y(66)}`} width={3.2} />
      <Lines x={400} y={Y(66)} lines={[`${if7.id} alarm`]} size={S} weight={700} halo />
      <Shape x={560} y={Y(280)} w={320} h={Math.max(140, Y(180))} tone="panel" strong />
      <Lines x={720} y={Y(280) + 30} lines={[SHORT['PHY-004']]} size={L} weight={700} />
      <Doc x={655} y={Y(280) + 56} w={130} h={Math.max(74, Y(180) - 72)} />
      <Lines x={715} y={Y(280) + 56 + Math.max(74, Y(180) - 72) / 2} lines={['evidence', 'log']} size={S} />
      {answered ? (
        <>
          <Arrow d={`M 272 ${Y(185)} L 556 ${Y(330)}`} id={id} tone="accent" width={3.6} />
          <Lines x={395} y={Y(330) + 46} lines={[`${if15.id} incident records,`, 'one way']} size={S} weight={700} ink="accent" halo />
        </>
      ) : (
        <text x={430} y={300} textAnchor="middle" dominantBaseline="central" fontSize={120} fontWeight={700} className="f-accent-ink">
          ?
        </text>
      )}
    </g>
  )
}

export function DrivingQuestionW5Figure({ alt }: { alt: string }) {
  return <Svg w={FB_W} h={480} alt={alt}>{(id) => <Scene id={id} answered={false} />}</Svg>
}

export function WhereW5Figure({ alt }: { alt: string }) {
  const ins = [
    { y: 30, l: ['Week 4 physical', 'view and routes'] },
    { y: 190, l: ['Week 2', 'requirements'] },
    { y: 350, l: ['Week 3 risks'] },
  ]
  const outs = [
    { y: 30, l: ['Week 6 evolution', 'roadmap'], dashed: false },
    { y: 190, l: ['Week 11 physical', 'model and interfaces'], dashed: true },
    { y: 350, l: ['Week 12', 'verification'], dashed: true },
  ]
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {(id) => (
        <g>
          {ins.map((b) => (
            <g key={b.l[0]}>
              <Card x={10} y={b.y} w={240} h={110} lines={b.l} size={S} />
              <Arrow d={`M 252 ${b.y + 55} L 328 ${200 + (b.y / 160) * 40}`} id={id} />
            </g>
          ))}
          <Card x={332} y={160} w={236} h={160} lines={['Week 5', 'components', 'and interfaces']} size={L} weight={700} tone="soft" strong />
          {outs.map((b) => (
            <g key={b.l[0]}>
              <Arrow d={`M 570 ${200 + (b.y / 160) * 40} L 646 ${b.y + 55}`} id={id} tone="accent" dashed={b.dashed} width={b.dashed ? 2.4 : 3.4} />
              <Card x={650} y={b.y} w={240} h={110} lines={b.l} size={S} />
            </g>
          ))}
          <Line d="M 470 495 L 540 495" tone="accent" dashed width={2.4} />
          <Lines x={890} y={495} lines={['dashed: a later modeling step']} size={S} anchor="end" ink="muted" />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ components
function ElementIcon({ kind, x, y }: { kind: number; x: number; y: number }) {
  const st = { fill: 'var(--wb-panel)', stroke: 'var(--wb-fg)', strokeWidth: 2.2 }
  const ac = { fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2.2 }
  switch (kind) {
    case 0: // hardware: a chip
      return (
        <g>
          <rect x={x - 16} y={y - 16} width={32} height={32} rx={3} style={ac} />
          <path d={`M ${x - 22} ${y - 8} h 6 M ${x - 22} ${y + 8} h 6 M ${x + 16} ${y - 8} h 6 M ${x + 16} ${y + 8} h 6 M ${x - 8} ${y - 22} v 6 M ${x + 8} ${y - 22} v 6 M ${x - 8} ${y + 16} v 6 M ${x + 8} ${y + 16} v 6`} style={{ ...st, fill: 'none' }} />
        </g>
      )
    case 1: // software: a window with code lines
      return (
        <g>
          <rect x={x - 22} y={y - 18} width={44} height={36} rx={3} style={st} />
          <path d={`M ${x - 22} ${y - 9} h 44 M ${x - 14} ${y} h 18 M ${x - 14} ${y + 8} h 26`} style={{ ...ac, fill: 'none' }} />
        </g>
      )
    case 2: // data: a cylinder
      return (
        <g>
          <path d={`M ${x - 18} ${y - 14} L ${x - 18} ${y + 14} A 18 6 0 0 0 ${x + 18} ${y + 14} L ${x + 18} ${y - 14}`} style={ac} />
          <ellipse cx={x} cy={y - 14} rx={18} ry={6} style={ac} />
        </g>
      )
    case 3: // humans
      return <Person x={x} y={y} s={0.9} />
    case 4: // processes: a cycle arrow
      return (
        <g>
          <path d={`M ${x + 16} ${y - 6} A 17 17 0 1 0 ${x + 12} ${y + 12}`} style={{ ...st, fill: 'none', strokeWidth: 3 }} />
          <path d={`M ${x + 9} ${y - 10} L ${x + 18} ${y - 2} L ${x + 22} ${y - 14} Z`} style={{ fill: 'var(--wb-fg)' }} />
        </g>
      )
    case 5: // procedures: a document with lines
      return (
        <g>
          <Doc x={x - 16} y={y - 20} w={32} h={40} />
          <path d={`M ${x - 9} ${y - 4} h 18 M ${x - 9} ${y + 4} h 18 M ${x - 9} ${y + 12} h 12`} style={{ ...ac, fill: 'none' }} />
        </g>
      )
    case 6: // facilities: a building
      return (
        <g>
          <path d={`M ${x - 22} ${y + 20} L ${x - 22} ${y - 6} L ${x} ${y - 20} L ${x + 22} ${y - 6} L ${x + 22} ${y + 20} Z`} style={st} />
          <rect x={x - 6} y={y + 4} width={12} height={16} style={ac} />
        </g>
      )
    case 7: // materials: stacked blocks
      return (
        <g>
          <rect x={x - 20} y={y + 2} width={18} height={16} style={ac} />
          <rect x={x + 2} y={y + 2} width={18} height={16} style={ac} />
          <rect x={x - 9} y={y - 16} width={18} height={16} style={ac} />
        </g>
      )
    default: // naturally occurring entities: a tree
      return (
        <g>
          <path d={`M ${x} ${y + 20} L ${x} ${y + 2}`} style={{ ...st, strokeWidth: 3 }} />
          <circle cx={x} cy={y - 6} r={14} style={{ fill: 'var(--wb-ok-soft)', stroke: 'var(--wb-ok)', strokeWidth: 2.2 }} />
        </g>
      )
  }
}

export function SystemElementFigure({ alt }: { alt: string }) {
  const kinds = [['hardware'], ['software'], ['data'], ['humans'], ['processes'], ['procedures'], ['facilities'], ['materials'], ['naturally', 'occurring entities']]
  return (
    <Svg w={FB_W} h={530} alt={alt}>
      {(id) => (
        <g>
          <Shape x={10} y={10} w={880} h={320} tone="soft" strong />
          <Lines x={450} y={42} lines={['System element']} size={L + 2} weight={700} />
          {kinds.map((k, i) => {
            const row = i < 5 ? 0 : 1
            const col = row ? i - 5 : i
            const cx = row ? 150 + col * 200 : 100 + col * 175
            const cy = row ? 225 : 105
            return (
              <g key={k[0]}>
                <ElementIcon kind={i} x={cx} y={cy} />
                <Lines x={cx} y={cy + (k.length > 1 ? 56 : 44)} lines={k} size={S} />
              </g>
            )
          })}
          <Arrow d="M 450 334 L 450 424" id={id} width={3} />
          <Lines x={470} y={378} lines={['at the chosen level of decomposition']} size={S} anchor="start" ink="accent" weight={600} />
          <Card x={300} y={428} w={300} h={84} lines={['Component']} size={L + 2} weight={700} />
        </g>
      )}
    </Svg>
  )
}

export function LayersFigure({ alt }: { alt: string }) {
  const l1 = [0, 1, 2, 3, 4].map((k) => ({ x: 160 + k * 145, label: `E${k + 1}` }))
  const kids = [0, 1, 2, 3].map((k) => ({ x: 340 + k * 130, label: `E3.${k + 1}` }))
  return (
    <Svg w={FB_W} h={500} alt={alt}>
      {() => (
        <g>
          <Card x={350} y={20} w={260} h={64} lines={['system of interest']} size={S} weight={700} tone="soft" strong />
          {l1.map((b) => (
            <g key={b.label}>
              <Line d={`M 480 84 L 480 120 L ${b.x + 55} 120 L ${b.x + 55} 160`} />
              <Card x={b.x} y={160} w={110} h={60} lines={[b.label]} size={S} weight={700} />
            </g>
          ))}
          {kids.map((b) => (
            <g key={b.label}>
              <Line d={`M ${l1[2].x + 55} 220 L ${l1[2].x + 55} 262 L ${b.x + 55} 262 L ${b.x + 55} 300`} />
              <Card x={b.x} y={300} w={110} h={60} lines={[b.label]} size={S} />
            </g>
          ))}
          <Lines x={20} y={190} lines={['level 1']} size={S} anchor="start" ink="muted" />
          <Lines x={20} y={330} lines={['level 2']} size={S} anchor="start" ink="muted" />
          <Line d="M 160 236 L 160 248 L 885 248 L 885 236" tone="accent" width={2.6} />
          <Lines x={232} y={278} lines={['5 ± 2']} size={L + 4} weight={700} ink="accent" />
          <Shape x={520} y={400} w={370} h={80} tone="warn" />
          <Lines x={705} y={440} lines={['a guideline, not a rule']} size={L} weight={700} ink="warn" />
          <Lines x={20} y={440} lines={['only E3 is still complex,', 'so only E3 is broken down']} size={S} anchor="start" ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function BreakdownWbsFigure({ alt }: { alt: string }) {
  const left = [['aircraft'], ['vertiports'], ['operations center']]
  const right = [['aircraft acquisition'], ['vertiport construction'], ['operations software', 'development']]
  const ys = [180, 300, 420]
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          <Lines x={200} y={24} lines={['System breakdown']} size={L} weight={700} />
          <Lines x={700} y={24} lines={['Work breakdown']} size={L} weight={700} />
          <Card x={60} y={56} w={180} h={60} lines={['service']} size={S} weight={700} tone="soft" />
          <Card x={700} y={56} w={180} h={60} lines={['program']} size={S} weight={700} tone="soft" />
          {ys.map((y, k) => (
            <g key={y}>
              <Line d={`M 90 116 L 90 ${y + 35} L 120 ${y + 35}`} />
              <Card x={120} y={y} w={260} h={70} lines={left[k]} size={S} />
              <Line d={`M 860 116 L 860 ${y + 35} L 840 ${y + 35}`} />
              <Card x={550} y={y} w={290} h={70} lines={right[k]} size={S} />
              <Line d={`M 382 ${y + 35} L 548 ${y + 35}`} tone="accent" dots width={3.4} />
            </g>
          ))}
          <Line d="M 300 522 L 370 522" tone="accent" dots width={3.4} />
          <Lines x={385} y={522} lines={['dotted: produces']} size={S} anchor="start" ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function LogicalPhysicalFigure({ alt }: { alt: string }) {
  const log = logical('LOG-002')
  const [p3, p4] = log.phys
  const parts = componentsOf(p3)
  return (
    <Svg w={FB_W} h={530} alt={alt}>
      {(id) => (
        <g>
          <path d="M 60 12 L 890 12 L 840 140 L 10 140 Z" className="f-env" />
          <Lines x={70} y={40} lines={['logical']} size={S} anchor="start" ink="muted" weight={700} />
          <Card x={310} y={40} w={300} h={80} lines={[log.id, log.name]} size={S} weight={700} tone="soft" />
          <path d="M 60 196 L 890 196 L 840 330 L 10 330 Z" className="f-env" />
          <Lines x={70} y={222} lines={['physical']} size={S} anchor="start" ink="muted" weight={700} />
          <Card x={120} y={238} w={280} h={80} lines={[p3, physical(p3).name]} size={S} weight={700} />
          <Card x={520} y={238} w={300} h={80} lines={[p4, physical(p4).name]} size={S} weight={700} />
          <Arrow d="M 400 122 L 290 234" id={id} tone="accent" width={2.8} />
          <Arrow d="M 520 122 L 650 234" id={id} tone="accent" width={2.8} />
          <Lines x={330} y={172} lines={['allocated to']} size={S} anchor="end" ink="accent" halo />
          <Lines x={600} y={172} lines={['allocated to']} size={S} anchor="start" ink="accent" halo />
          {parts.map((c, k) => (
            <g key={c.id}>
              <Line d={`M 260 318 L 260 350 L ${115 + k * 245} 350 L ${115 + k * 245} 372`} />
              <Card x={10 + k * 245} y={372} w={210} h={100} lines={wrap(c.name, 15)} size={S} />
            </g>
          ))}
          <Lines x={450} y={505} lines={[`components of ${p3}`]} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function WorkedBreakdownFigure({ alt }: { alt: string }) {
  const counts: Record<string, string> = { 'PHY-001': `${COUNTS.aircraft} aircraft`, 'PHY-002': `${COUNTS.vertiports} sites, ${COUNTS.hubs} hubs`, 'PHY-003': `${COUNTS.chargers} chargers` }
  const broken = COUNTS.brokenDown
  const leaves = DIAGONAL.filter((d) => !isExternal(d) && !broken.includes(d))
  const colW = 158
  const gap = 10
  const lh = F * 1.16
  const xL = 5 * (colW + gap) + 4
  // layout computed up front (pure), so a repeated render draws the same thing
  const cols = broken.map((p, k) => {
    const x = k * (colW + gap)
    const lines = [p, ...wrap(physical(p).name, 19), ...(counts[p] ? [counts[p]] : [])]
    const h = lines.length * lh + 6
    let y = 36 + h + 6
    const kids = componentsOf(p).map((c) => {
      const kl = wrap(c.name, 19)
      const ch = kl.length * lh + 2
      const box = { id: c.id, lines: kl, y, h: ch }
      y += ch + 2
      return box
    })
    return { p, x, lines, h, kids }
  })
  const leafBoxes = leaves.reduce<{ p: string; lines: string[]; y: number; h: number }[]>((acc, p) => {
    const lines = [p, ...wrap(physical(p).name, 21)]
    const h = lines.length * lh + 6
    const prev = acc.at(-1)
    return [...acc, { p, lines, y: prev ? prev.y + prev.h + 6 : 36, h }]
  }, [])
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {() => (
        <g>
          <Card x={300} y={2} w={400} h={22} lines={['AeroLink service']} size={F} weight={700} tone="soft" />
          <Line d={`M 500 24 L 500 30 M ${colW / 2} 30 L ${xL - 8} 30`} />
          {cols.map((c) => (
            <g key={c.p}>
              <Line d={`M ${c.x + colW / 2} 30 L ${c.x + colW / 2} 36`} />
              <Card x={c.x} y={36} w={colW} h={c.h} lines={c.lines} size={F} weight={600} />
              <Line d={`M ${c.x + 4} ${36 + c.h} L ${c.x + 4} ${c.kids.at(-1)!.y + c.kids.at(-1)!.h / 2}`} tone="muted" />
              {c.kids.map((b) => (
                <g key={b.id}>
                  <Line d={`M ${c.x + 4} ${b.y + b.h / 2} L ${c.x + 8} ${b.y + b.h / 2}`} tone="muted" />
                  <Card x={c.x + 8} y={b.y} w={colW - 8} h={b.h} lines={b.lines} size={F} />
                </g>
              ))}
            </g>
          ))}
          <Line d={`M ${xL - 8} 30 L ${xL - 8} ${leafBoxes.at(-1)!.y + leafBoxes.at(-1)!.h / 2}`} />
          {leafBoxes.map((b) => (
            <g key={b.p}>
              <Line d={`M ${xL - 8} ${b.y + b.h / 2} L ${xL} ${b.y + b.h / 2}`} />
              <Card x={xL} y={b.y} w={FW_W - xL - 2} h={b.h} lines={b.lines} size={F} weight={600} tone="panel" />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

export function CardsFigure({ alt }: { alt: string }) {
  const p = 'PHY-003'
  const fns = functionsAt(p)
  const reqs = [...new Set(fns.flatMap((f) => fn(f).requirements))]
  const ifs = RECEIVED.filter((x) => x.ends.includes(p)).map((x) => x.id)
  const rows: { k: string; v: string[]; mark?: string }[] = [
    { k: 'Responsibility', v: ['charge aircraft within the turnaround and', 'keep each vertiport within its power limit'] },
    { k: 'Functions', v: fns.map((f) => `${f} ${fn(f).name}`) },
    { k: 'Requirements', v: [reqs.join(', ')] },
    { k: 'Owner', v: [ownerOf(p)], mark: 'manages its side of each interface' },
    { k: 'Interfaces', v: [ifs.join(', ')], mark: 'filled from the N² chart' },
  ]
  let acc = 86
  const placed = rows.map((r) => {
    const h = r.v.length * S * 1.25 + (r.mark ? S * 1.25 : 0) + 22
    const top = acc
    acc += h
    return { ...r, top }
  })
  return (
    <Svg w={FB_W} h={Math.ceil(acc + 14)} alt={alt}>
      {() => (
        <g>
          <Shape x={10} y={10} w={880} h={acc - 6} tone="box" strong />
          <rect x={10} y={10} width={880} height={64} rx={8} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2 }} />
          <Lines x={450} y={42} lines={[`${p} ${physical(p).name}`]} size={L + 2} weight={700} />
          {placed.map((r) => {
            const top = r.top
            return (
              <g key={r.k}>
                <line x1={24} x2={876} y1={top} y2={top} className="f-divider" style={{ strokeDasharray: 'none' }} />
                <Lines x={30} y={top + 11 + S * 0.62} lines={[r.k]} size={S} anchor="start" weight={700} />
                <Lines x={240} y={top + 11 + (r.v.length * S * 1.25) / 2} lines={r.v} size={S} anchor="start" lh={1.25} />
                {r.mark && <Lines x={240} y={top + 11 + r.v.length * S * 1.25 + S * 0.62} lines={[`↑ ${r.mark}`]} size={S} anchor="start" ink="accent" italic />}
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ interfaces
export function InterfaceFigure({ alt }: { alt: string }) {
  const panels = [
    { x: 10, t: 'plug and outlet' },
    { x: 310, t: 'procedure' },
    { x: 610, t: 'message' },
  ]
  return (
    <Svg w={FB_W} h={470} alt={alt}>
      {(id) => (
        <g>
          {panels.map((p) => (
            <g key={p.t}>
              <Shape x={p.x} y={10} w={280} h={330} tone="panel" />
              <Lines x={p.x + 140} y={40} lines={[p.t]} size={S} weight={700} />
            </g>
          ))}
          {/* plug meets outlet */}
          <rect x={30} y={150} width={90} height={110} rx={8} className="f-shape" style={{ strokeWidth: 2.2 }} />
          <path d="M 120 185 L 150 185 M 120 225 L 150 225" style={{ stroke: 'var(--wb-fg)', strokeWidth: 6 }} />
          <rect x={170} y={140} width={100} height={130} rx={10} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2.4 }} />
          <path d="M 180 178 L 196 178 L 196 192 L 180 192 Z M 180 218 L 196 218 L 196 232 L 180 232 Z" style={{ fill: 'var(--wb-fg)' }} />
          <Lines x={75} y={300} lines={['plug']} size={S} />
          <Lines x={220} y={300} lines={['outlet']} size={S} />
          {/* procedure between two people */}
          <Person x={355} y={200} s={1.3} />
          <Person x={545} y={200} s={1.3} />
          <Doc x={415} y={150} w={70} h={92} />
          <path d="M 427 182 h 46 M 427 198 h 46 M 427 214 h 30" style={{ stroke: 'var(--wb-accent)', strokeWidth: 2.2 }} />
          <Lines x={450} y={290} lines={['procedure']} size={S} />
          {/* message between two computers */}
          <Computer x={665} y={200} s={1.25} />
          <Computer x={835} y={200} s={1.25} />
          <Envelope x={712} y={172} w={76} h={50} />
          <Arrow d="M 700 252 L 800 252" id={id} tone="accent" both />
          <Lines x={750} y={290} lines={['message']} size={S} />
          <Shape x={10} y={360} w={880} h={90} tone="soft" strong />
          <Lines x={450} y={405} lines={['interface: a shared boundary between two units']} size={L} weight={700} />
        </g>
      )}
    </Svg>
  )
}

/** A small badge with the interface-kind letter (P, I or O) in a kind-styled square. */
function KindBadge({ x, y, kind, size }: { x: number; y: number; kind: KindId; size: number }) {
  const s = size + 12
  return (
    <g>
      <KindRect x={x} y={y} w={s} h={s} kind={kind} />
      <Lines x={x + s / 2} y={y + s / 2} lines={[KIND_STYLE[kind].letter]} size={size} weight={700} />
    </g>
  )
}

export function TypingFigure({ alt }: { alt: string }) {
  const cols: { kind: KindId; label: string; crosses: string[]; ex: string; exText: string[] }[] = [
    { kind: 'physical', label: 'Physical', crosses: ['energy, material', 'or load'], ex: 'IF-005', exText: ['charger power', 'to the aircraft'] },
    { kind: 'information', label: 'Information', crosses: ['data over a', 'named medium'], ex: 'IF-008', exText: ['booking', 'messages'] },
    { kind: 'organizational', label: 'Organizational', crosses: ['an agreement that', 'carries no flow'], ex: 'IF-009', exText: ['pad-slot', 'agreement'] },
  ]
  const grid = iface('IF-006')
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          {cols.map((c, k) => {
            const x = 10 + k * 297
            return (
              <g key={c.kind}>
                <KindRect x={x} y={10} w={283} h={330} kind={c.kind} rx={8} />
                <KindBadge x={x + 14} y={22} kind={c.kind} size={S} />
                <Lines x={x + 60} y={39} lines={[c.label]} size={L} weight={700} anchor="start" />
                <Lines x={x + 141} y={120} lines={c.crosses} size={S} />
                <Card x={x + 16} y={190} w={251} h={130} title={iface(c.ex).id} lines={c.exText} size={S} />
              </g>
            )
          })}
          <Shape x={10} y={360} w={880} h={170} tone="panel" />
          <Lines x={30} y={388} lines={['external flag (any kind)']} size={S} anchor="start" weight={700} />
          <line x1={520} y1={372} x2={520} y2={520} className="f-boundary" />
          <Lines x={505} y={500} lines={['system boundary']} size={S} anchor="end" ink="accent" />
          <Card x={280} y={420} w={180} h={64} lines={[SHORT[grid.ends[0]]]} size={S} />
          <Card x={640} y={420} w={220} h={64} lines={[SHORT[grid.ends[1]]]} size={S} tone="panel" />
          <line x1={460} y1={452} x2={640} y2={452} style={{ stroke: KIND_STYLE.physical.stroke, strokeWidth: 5 }} />
          <Lines x={580} y={425} lines={[grid.id]} size={S} weight={700} halo />
          <KindBadge x={30} y={430} kind="physical" size={S} />
          <Lines x={76} y={447} lines={['grid', 'connection']} size={S} anchor="start" />
        </g>
      )}
    </Svg>
  )
}

export function ExternalHiddenFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB_W} h={500} alt={alt}>
      {() => (
        <g>
          <rect x={10} y={30} width={470} height={440} rx={14} className="f-boundary" />
          <Lines x={30} y={56} lines={['system boundary']} size={S} anchor="start" ink="accent" weight={600} />
          <Card x={50} y={110} w={190} h={80} lines={['element A']} size={L} weight={700} />
          <Card x={50} y={330} w={190} h={80} lines={['element B']} size={L} weight={700} />
          <Line d="M 145 192 L 145 328" dots width={3.6} />
          <Lines x={165} y={245} lines={['internal interface:', 'the data']} size={S} anchor="start" weight={600} />
          <Cloud x={720} y={265} w={300} h={190} />
          <Lines x={720} y={268} lines={['leased network,', 'not ours']} size={S} weight={700} />
          <Line d="M 242 150 L 620 220" width={3} />
          <Line d="M 242 370 L 620 315" width={3} />
          <Shape x={590} y={392} w={290} h={56} tone="bad" />
          <Lines x={735} y={420} lines={['hidden external interface']} size={S} weight={700} ink="bad" />
          <Line d="M 735 392 L 735 352" tone="bad" width={2.6} />
        </g>
      )}
    </Svg>
  )
}

export function N2TeachingFigure({ alt }: { alt: string }) {
  const els = ['A', 'B', 'C', 'D', 'E']
  const c = 84
  const x0 = 20
  const y0 = 20
  return (
    <Svg w={FB_W} h={470} alt={alt}>
      {(id) => (
        <g>
          {els.map((r, i) =>
            els.map((_, j) => {
              const x = x0 + j * c
              const y = y0 + i * c
              if (i === j)
                return (
                  <g key={`${i}${j}`}>
                    <rect x={x} y={y} width={c} height={c} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2.4 }} />
                    <Lines x={x + c / 2} y={y + c / 2} lines={[r]} size={L + 6} weight={700} />
                  </g>
                )
              if (i > j)
                return (
                  <g key={`${i}${j}`}>
                    <rect x={x} y={y} width={c} height={c} className="f-panel" />
                    <Lines x={x + c / 2} y={y + c / 2} lines={['mirror']} size={S} ink="muted" />
                  </g>
                )
              const filled = i === 0 && j === 2
              return (
                <g key={`${i}${j}`}>
                  <rect x={x} y={y} width={c} height={c} className="f-shape" />
                  {filled && <KindRect x={x + 6} y={y + 6} w={c - 12} h={c - 12} kind="information" />}
                  {filled && <Lines x={x + c / 2} y={y + c / 2} lines={['IF-1']} size={S} weight={700} />}
                </g>
              )
            }),
          )}
          {/* inset: the directed form */}
          <Shape x={490} y={20} w={400} h={430} tone="panel" />
          <Lines x={690} y={50} lines={['directed form']} size={S} weight={700} />
          <rect x={560} y={100} width={110} height={110} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2.4 }} />
          <Lines x={615} y={155} lines={['X']} size={L + 6} weight={700} />
          <rect x={670} y={100} width={110} height={110} className="f-shape" />
          <Lines x={725} y={155} lines={['X → Y']} size={S} weight={700} />
          <rect x={560} y={210} width={110} height={110} className="f-shape" />
          <Lines x={615} y={265} lines={['Y → X']} size={S} weight={700} />
          <rect x={670} y={210} width={110} height={110} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2.4 }} />
          <Lines x={725} y={265} lines={['Y']} size={L + 6} weight={700} />
          <Arrow d="M 600 120 L 682 120" id={id} tone="accent" width={3} />
          <Arrow d="M 760 190 L 760 228" id={id} tone="accent" width={3} />
          <Lines x={690} y={365} lines={['row produces,', 'column consumes']} size={S} weight={700} ink="accent" />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ the AeroLink N²
/** The upper-triangle N² of the received interfaces, generated from n2Cell and degreeOf. `reveal` false: the degree
 *  column holds '?' (worked example); true: degrees, the hub's row and column highlighted, the empty elements' rows
 *  outlined, and the sum. Element labels stand beside their diagonal cell, in the empty lower triangle. */
function AeroN2({ alt, reveal }: { alt: string; reveal: boolean }) {
  const set = RECEIVED
  const n = DIAGONAL.length
  const size = reveal ? S : F
  const W = reveal ? FB_W : FW_W
  const rowH = reveal ? 28 : 15.2
  const top = reveal ? 8 : 3
  const pad = reveal ? 10 : 8
  const label = (d: string) => `${d} ${SHORT[d]}`
  const cellText = (ids: string[]) => (reveal ? ids.map((x) => KIND_STYLE[iface(x).kind].letter).join(' ') : ids.join(' '))
  const lm = textW(label(DIAGONAL[0]), size) + 8
  const degW = reveal ? 46 : 26
  const tail = reveal ? 14 : 22
  const avail = W - lm - degW - tail
  // a column is as wide as its widest cell needs, then all columns share the rest equally
  const extS = reveal ? 12 : 8
  const extPad = (ids: string[]) => (ids.some((x2) => isExternalInterface(iface(x2))) ? extS + 2 : 0)
  const need = DIAGONAL.map((b, j) => Math.max(0, ...DIAGONAL.slice(0, j).map((a) => textW(cellText(n2Cell(a, b, set)), size) * (reveal ? 1 : 0.92) + pad + extPad(n2Cell(a, b, set)))))
  // a column whose cell needs more than the shared rest is given its need too, until no shared column is too narrow
  // (otherwise reserving room for the external mark squeezes a plain cell such as IF-008 below its label)
  const wide = need.map((w) => w > avail / n)
  const restOf = () => (avail - need.filter((_, j) => wide[j]).reduce((a, b) => a + b, 0)) / Math.max(1, wide.filter((x) => !x).length)
  for (let grew = true; grew; ) {
    const r0 = restOf()
    grew = false
    need.forEach((w, j) => { if (!wide[j] && w > r0) { wide[j] = true; grew = true } })
  }
  const rest = restOf()
  const cw = need.map((w, j) => (wide[j] ? w : rest))
  const xs = cw.reduce<number[]>((acc, _, j) => [...acc, j ? acc[j - 1] + cw[j - 1] : lm], [])
  const gridR = xs[n - 1] + cw[n - 1]
  const yOf = (i: number) => top + i * rowH
  const hub = c14.hub
  const hubI = DIAGONAL.indexOf(hub)
  return (
    <Svg w={W} h={reveal ? 540 : FW_H} alt={alt}>
      {() => (
        <g>
          {reveal && (
            <g>
              <rect x={xs[hubI]} y={yOf(hubI)} width={gridR + degW - xs[hubI]} height={rowH} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 3 }} />
              <rect x={xs[hubI]} y={yOf(0)} width={cw[hubI]} height={yOf(hubI) - yOf(0)} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 3 }} />
            </g>
          )}
          {DIAGONAL.map((a, i) => (
            <g key={a}>
              {DIAGONAL.map((b, j) => {
                if (j < i) return null
                const x = xs[j]
                const y = yOf(i)
                if (i === j) return <rect key={b} x={x} y={y} width={cw[j]} height={rowH} style={{ fill: 'var(--wb-fg)', opacity: 0.78 }} />
                const ids = n2Cell(a, b, set)
                if (!ids.length) return <rect key={b} x={x} y={y} width={cw[j]} height={rowH} style={{ fill: 'none', stroke: 'var(--wb-line)', strokeWidth: 1 }} />
                const ext = ids.some((x2) => isExternalInterface(iface(x2)))
                const kinds = ids.map((x2) => iface(x2).kind)
                return (
                  <g key={b}>
                    {kinds.map((k, q) => (
                      <KindRect key={q} x={x + 1 + (q * (cw[j] - 2)) / kinds.length} y={y + 1} w={(cw[j] - 2) / kinds.length} h={rowH - 2} kind={k} rx={2} />
                    ))}
                    {ids.map((x2, q) => (
                      <Lines key={x2} x={x + ((q + 0.5) * (cw[j] - extPad(ids))) / ids.length} y={y + rowH / 2} lines={[reveal ? KIND_STYLE[iface(x2).kind].letter : x2]} size={size} weight={reveal ? 700 : 600} />
                    ))}
                    {ext && <ExtMark x={x + cw[j] - 1} y={y + 1} s={extS} />}
                  </g>
                )
              })}
              <Lines x={xs[i] - 5} y={yOf(i) + rowH / 2} lines={[label(a)]} size={size} anchor="end" weight={600} />
              <rect x={gridR + 6} y={yOf(i)} width={degW - 6} height={rowH} style={{ fill: 'var(--wb-panel)', stroke: 'var(--wb-line-strong)', strokeWidth: 1.2 }} />
              <Lines x={gridR + 3 + degW / 2} y={yOf(i) + rowH / 2} lines={[reveal ? String(degreeOf(a, set)) : '?']} size={size} weight={700} ink={reveal ? 'ink' : 'muted'} />
            </g>
          ))}
          {reveal &&
            c14.isolated.map((d) => {
              const i = DIAGONAL.indexOf(d)
              return (
                <g key={d}>
                  <rect x={xs[i] - textW(label(d), size) - 12} y={yOf(i) + 1} width={gridR + degW + 2 - (xs[i] - textW(label(d), size) - 12)} height={rowH - 2} rx={4} style={{ fill: 'none', stroke: 'var(--wb-bad)', strokeWidth: 3 }} strokeDasharray="7 4" />
                  <Lines x={xs[i] + cw[i] + 8} y={yOf(i) + rowH / 2} lines={['empty']} size={size} anchor="start" weight={700} ink="bad" />
                </g>
              )
            })}
          {reveal ? (
            <g>
              <Lines x={gridR + 3 + degW / 2} y={yOf(n) + 8} lines={['degree']} size={size} weight={700} anchor="end" />
              <Lines x={gridR - 70} y={yOf(n) + 44} lines={[`sum ${c14.degreeSum} = 2 × ${c14.total}`]} size={L} weight={700} anchor="end" />
              <line x1={gridR + 6} x2={W - 4} y1={yOf(n) + 22} y2={yOf(n) + 22} style={{ stroke: 'var(--wb-fg)', strokeWidth: 2 }} />
              <Lines x={gridR + 3 + degW / 2} y={yOf(n) + 44} lines={[String(c14.degreeSum)]} size={L} weight={700} />
              <N2Legend x={10} y={510} size={size} reveal />
              <Chip cx={xs[hubI] - textW(label(hub), size) - 52} cy={yOf(hubI) + rowH / 2} text="hub" size={size} tone="soft" ink="accent" />
            </g>
          ) : (
            <g>
              <text transform={`translate(${gridR + degW + 15} ${yOf(0) + 4}) rotate(90)`} fontSize={size} fontWeight={700} className="f-label" dominantBaseline="central">
                degree: you count
              </text>
              <N2Legend x={6} y={yOf(10) + 4} size={size} reveal={false} />
            </g>
          )}
        </g>
      )}
    </Svg>
  )
}

function N2Legend({ x, y, size, reveal }: { x: number; y: number; size: number; reveal: boolean }) {
  const kinds: KindId[] = ['physical', 'information', 'organizational']
  const sw = size * 1.9
  const sh = size * 1.1
  if (reveal) {
    let cx = x
    const items = kinds.map((k) => {
      const at = cx
      cx += sw + 8 + textW(k, size) + 26
      return { k, at }
    })
    return (
      <g>
        {items.map(({ k, at }) => (
          <g key={k}>
            <KindRect x={at} y={y - sh / 2} w={sw} h={sh} kind={k} rx={2} />
            <Lines x={at + sw / 2} y={y} lines={[KIND_STYLE[k].letter]} size={size} weight={700} />
            <Lines x={at + sw + 8} y={y} lines={[k]} size={size} anchor="start" />
          </g>
        ))}
        <rect x={cx} y={y - sh / 2} width={sw} height={sh} className="f-shape" />
        <ExtMark x={cx + sw} y={y - sh / 2} s={12} />
        <Lines x={cx + sw + 8} y={y} lines={['external']} size={size} anchor="start" />
      </g>
    )
  }
  const step = size * 1.32
  return (
    <g>
      {kinds.map((k, i) => (
        <g key={k}>
          <KindRect x={x} y={y + i * step} w={sw} h={sh} kind={k} rx={2} />
          <Lines x={x + sw + 6} y={y + i * step + sh / 2} lines={[`${k}${k === 'organizational' ? ' (dashed edge)' : k === 'physical' ? ' (heavy edge)' : ''}`]} size={size} anchor="start" />
        </g>
      ))}
      <rect x={x} y={y + 3 * step} width={sw} height={sh} className="f-shape" />
      <ExtMark x={x + sw} y={y + 3 * step} s={8} />
      <Lines x={x + sw + 6} y={y + 3 * step + sh / 2} lines={['external: one end outside AeroLink']} size={size} anchor="start" />
    </g>
  )
}

export function WorkedN2Figure({ alt }: { alt: string }) {
  return <AeroN2 alt={alt} reveal={false} />
}

export function ReadingN2Figure({ alt }: { alt: string }) {
  return <AeroN2 alt={alt} reveal />
}

export function CrossingFigure({ alt }: { alt: string }) {
  const flows = crossingFlows(RECEIVED)
  const go = flows.find((f) => f.fn === 'FN-011' && f.from === 'PHY-005')!
  const gap = flows.find((f) => f.fn === 'FN-016' && f.from === 'PHY-008')!
  const goSrc = fn(go.fn).inputs.find((x) => x.item === go.item)!.src!
  const gapSrc = fn(gap.fn).inputs.find((x) => x.item === gap.item)!.src!
  const fnCard = (id: string) => [id, ...wrap(fn(id).name, 18)]
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {(id) => (
        <g>
          <Shape x={10} y={20} w={290} h={200} tone="panel" />
          <Lines x={155} y={46} lines={[SHORT[go.from]]} size={L} weight={700} />
          <Card x={30} y={72} w={250} h={128} lines={fnCard(goSrc)} size={S} />
          <Shape x={10} y={300} w={290} h={200} tone="panel" />
          <Lines x={155} y={326} lines={[SHORT[gap.from]]} size={L} weight={700} />
          <Card x={30} y={352} w={250} h={128} lines={fnCard(gapSrc)} size={S} />
          <Shape x={590} y={20} w={300} h={480} tone="panel" />
          <Lines x={740} y={46} lines={[SHORT[go.to]]} size={L} weight={700} />
          <Card x={610} y={72} w={260} h={128} lines={fnCard(go.fn)} size={S} />
          <Card x={610} y={352} w={260} h={128} lines={fnCard(gap.fn)} size={S} />
          <Arrow d="M 282 136 L 606 136" id={id} width={3.4} />
          <Lines x={444} y={102} lines={[go.item]} size={S} weight={700} halo />
          <Lines x={444} y={168} lines={[`over ${go.via.join(', ')}`]} size={S} weight={700} ink="accent" halo />
          <Arrow d="M 282 416 L 606 416" id={id} tone="bad" dashed width={3.4} />
          <Lines x={444} y={382} lines={[gap.item.replace('pad ', '')]} size={S} weight={700} ink="bad" halo />
          <Lines x={444} y={452} lines={['no interface in Week 4']} size={S} weight={700} ink="bad" halo />
        </g>
      )}
    </Svg>
  )
}

export function AnswerFigure({ alt }: { alt: string }) {
  const n = INTERFACE_DECISION.counts
  const p = INTERFACE_DECISION.path
  const opts = [
    { t: 'direct', l: [`${n.direct} new interface`, `path of ${p.direct} · chosen`], tone: 'ok' as const, strike: false },
    { t: 'relay', l: [`${n.relay} new interface`, `path of ${p.relay}`], tone: 'box' as const, strike: false },
    { t: 'staff re-entry', l: ['no interface,', 'records lost'], tone: 'bad' as const, strike: true },
  ]
  return (
    <Svg w={FB_W} h={560} alt={alt}>
      {(id) => (
        <g>
          <Scene id={id} answered k={0.78} />
          {opts.map((o, k) => (
            <g key={o.t}>
              <Shape x={10 + k * 297} y={408} w={283} h={140} tone={o.tone} strong={k === 0} />
              <Lines x={151 + k * 297} y={448} lines={[o.t]} size={L} weight={700} strike={o.strike} />
              <Lines x={151 + k * 297} y={500} lines={o.l} size={S} strike={o.strike} ink={o.tone === 'ok' ? 'ok' : o.tone === 'bad' ? 'bad' : 'ink'} weight={600} />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ definitions
export function TableFigure({ alt }: { alt: string }) {
  const x = iface('IF-007')
  const bands = [
    { cols: TABLE_COLUMNS.slice(0, 5), w: [250, 160, 160, 160, 170] },
    { cols: TABLE_COLUMNS.slice(5), w: [150, 150, 150, 150, 150, 150] },
  ]
  const filled: Record<string, string[]> = {
    [TABLE_COLUMNS[0]]: [x.id, ...wrap(x.name, 19)],
    [TABLE_COLUMNS[1]]: [x.kind, isExternalInterface(x) ? 'external' : 'internal'],
    [TABLE_COLUMNS[2]]: [x.ends[0], x.ends[1]],
  }
  const hh = 92
  const rh = 128
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          {bands.map((b, k) => {
            const y = 6 + k * (hh + rh + 34)
            let cx = 0
            return (
              <g key={k}>
                {b.cols.map((c, j) => {
                  const x0 = cx
                  cx += b.w[j]
                  const v = filled[c]
                  return (
                    <g key={c}>
                      <rect x={x0 + 1} y={y} width={b.w[j] - 2} height={hh} style={{ fill: 'var(--wb-accent)', stroke: 'var(--wb-accent)' }} />
                      {wrap(c, 12).map((t, q, all) => (
                        <text key={q} x={x0 + b.w[j] / 2} y={y + hh / 2 + (q - (all.length - 1) / 2) * S * 1.18} textAnchor="middle" dominantBaseline="central" fontSize={S} fontWeight={700} style={{ fill: 'var(--wb-accent-fg)' }}>
                          {t}
                        </text>
                      ))}
                      <rect x={x0 + 1} y={y + hh} width={b.w[j] - 2} height={rh} className="f-shape" style={{ strokeWidth: 1.6 }} />
                      {v && <Lines x={x0 + b.w[j] / 2} y={y + hh + rh / 2} lines={v} size={S} weight={600} />}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

export function WorkedDefinitionsFigure({ alt }: { alt: string }) {
  const cards = ['IF-007', 'IF-015'].map((i) => {
    const x = iface(i)
    const ext = isExternalInterface(x)
    return {
      x,
      rows: [
        { k: 'kind', v: `${x.kind}${ext ? ', external' : ''}` },
        { k: 'direction', v: directionOf(x) },
        { k: 'medium', v: x.medium },
        { k: 'constraint', v: x.constraint },
        { k: x.requirements.length > 1 ? 'requirements' : 'requirement', v: x.requirements.join(', ') },
        { k: 'owners', v: `${ownerOf(x.ends[0])} and ${ownerOf(x.ends[1])}` },
        { k: 'verification', v: x.verification.length ? x.verification.join(', ') : `planned: ${x.verificationPlan}` },
      ],
    }
  })
  const lh = F * 1.17
  const cardW = 494
  const kw = 104
  const chars = Math.floor((cardW - kw - 16) / (F * 0.53))
  return (
    <Svg w={FW_W} h={FW_H} alt={alt}>
      {() => (
        <g>
          {cards.map((c, k) => {
            const x0 = k * (cardW + 12)
            let y = 26
            return (
              <g key={c.x.id}>
                <Shape x={x0} y={1} w={cardW} h={FW_H - 2} tone="box" strong />
                <rect x={x0} y={1} width={cardW} height={22} rx={8} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 1.6 }} />
                <Lines x={x0 + 8} y={12} lines={[`${c.x.id} ${c.x.name}`]} size={F} weight={700} anchor="start" />
                {c.rows.map((r) => {
                  const v = wrap(r.v, chars)
                  const top = y
                  y += v.length * lh + 3
                  return (
                    <g key={r.k}>
                      <Lines x={x0 + 8} y={top + lh / 2} lines={[r.k]} size={F} anchor="start" weight={700} ink="muted" />
                      <Lines x={x0 + kw} y={top + (v.length * lh) / 2} lines={v} size={F} anchor="start" lh={1.17} weight={r.k === 'verification' ? 600 : 500} ink={r.k === 'verification' ? 'accent' : 'ink'} />
                    </g>
                  )
                })}
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

export function InterfaceReqsFigure({ alt }: { alt: string }) {
  const q = INTERFACE_REQUIREMENTS.find((r) => r.id === 'REQ-SYS-013')!
  const steps = [
    { n: '1', t: 'Identify', v: q.steps.boundary },
    { n: '2', t: 'Define', v: q.steps.interaction },
    { n: '3', t: 'Write', v: q.statement },
  ]
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {(id) => (
        <g>
          {steps.map((s, k) => {
            const x = 10 + k * 300
            const lines = wrap(s.v, 21)
            return (
              <g key={s.n}>
                <Shape x={x} y={10} w={270} h={520} tone={k === 2 ? 'soft' : 'box'} strong={k === 2} />
                <circle cx={x + 34} cy={46} r={22} style={{ fill: 'var(--wb-accent)' }} />
                <text x={x + 34} y={46} textAnchor="middle" dominantBaseline="central" fontSize={L} fontWeight={700} style={{ fill: 'var(--wb-accent-fg)' }}>
                  {s.n}
                </text>
                <Lines x={x + 66} y={46} lines={[s.t]} size={L} weight={700} anchor="start" />
                {lines.map((l, i) => (
                  <Lines key={i} x={x + 16} y={100 + i * S * 1.3} lines={[l]} size={S} anchor="start" weight={l.includes(q.interface) ? 700 : 500} ink={l.includes(q.interface) ? 'accent' : 'ink'} />
                ))}
                {k < 2 && <Arrow d={`M ${x + 272} 46 L ${x + 298} 46`} id={id} />}
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

export function ModularityFigure({ alt }: { alt: string }) {
  // six elements; module 1 = A, B, C and module 2 = D, E, F (geometry and its clearance test: week5FigureKit.ts)
  const { links, scattered, grouped, r } = MODULARITY
  const crossing = links.filter(([a, b]) => a < 3 !== b < 3)
  const node = (p: { x: number; y: number }, k: number) => (
    <g key={k}>
      <circle cx={p.x} cy={p.y} r={r} className="f-shape" style={{ strokeWidth: 2.2 }} />
      <Lines x={p.x} y={p.y} lines={[String.fromCharCode(65 + k)]} size={S} weight={700} />
    </g>
  )
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {() => (
        <g>
          <Shape x={10} y={10} w={420} h={500} tone="panel" />
          <Lines x={220} y={40} lines={['scattered']} size={L} weight={700} />
          {links.map(([a, b], k) => (
            <Line key={k} d={`M ${scattered[a].x} ${scattered[a].y} L ${scattered[b].x} ${scattered[b].y}`} width={2.2} />
          ))}
          {scattered.map(node)}
          <Shape x={450} y={10} w={440} h={500} tone="panel" />
          <Lines x={670} y={40} lines={['grouped into two modules']} size={L} weight={700} />
          <rect x={490} y={95} width={200} height={190} rx={60} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2.4, fillOpacity: 0.6 }} />
          <rect x={700} y={265} width={200} height={190} rx={60} style={{ fill: 'var(--wb-accent-soft)', stroke: 'var(--wb-accent)', strokeWidth: 2.4, fillOpacity: 0.6 }} />
          {links.map(([a, b], k) => {
            const cross = crossing.includes(links[k])
            return <Line key={k} d={`M ${grouped[a].x} ${grouped[a].y} L ${grouped[b].x} ${grouped[b].y}`} width={cross ? 5 : 2} tone={cross ? 'warn' : 'ink'} />
          })}
          {grouped.map(node)}
          <Lines x={480} y={445} lines={[`${crossing.length} links cross`, 'the module boundary']} size={S} weight={700} anchor="start" ink="warn" />
        </g>
      )}
    </Svg>
  )
}
