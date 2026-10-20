// Week 5, Session 2 lecture figures (managing interfaces, change control, interface security and resilience, the audit,
// integration aggregates, the coupling count, what Week 5 feeds, and the lab template). Original drawings: none redraws a
// SEBoK, MITRE or DoD figure. Every AeroLink number, name and identifier is imported from
// src/content/lectures/week05/aerolinkCase.ts; every other label is a phrase from the slide text. The two generic figures
// (trust boundaries, protection) carry no AeroLink answers. AeroLink is FICTIONAL. Canvas sizes and the 12 pt label rule:
// week5FigureKit.ts. The figure map is in lectureWeek5Figures.ts. Review status: new-pending-review.
import {
  CHANGE_REQUEST, COUNTS, COUPLING, DIAGONAL, FEEDS_FORWARD_W5, GROUPINGS, HIDDEN_EXTERNAL, ICWG, INTERFACES, SHORT, boundaryReasons, degreeOf, groupingCounts, iface, isExternalInterface, n2Cell, ownerOf, uncoveredPairs,
} from '../../content/lectures/week05/aerolinkCase'
import { Arrow, Card, Chip, Cloud, Doc, ExtMark, KindRect, Line, Lines, Shape, Svg } from './LectureWeek5Parts'
import { FB_W, FW_H, FW_W, KIND_STYLE, MIN_FB, MIN_FW, textW, wrap } from './week5FigureKit'

const S = MIN_FB // 22
const L = S + 2
const F = MIN_FW // 14
const f2 = (x: number) => x.toFixed(2)
const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`)

// ------------------------------------------------------------------------------------------------ managing
export function WhyManageFigure({ alt }: { alt: string }) {
  const steps = [
    { t: 'define', s: ['interface', 'specifications'], x: 330, y: 20 },
    { t: 'control', s: ['changes under', 'configuration mgmt'], x: 620, y: 175 },
    { t: 'communicate', s: ['to the owners of', 'affected elements'], x: 330, y: 330 },
    { t: 'verify', s: ['compliance', 'and tests'], x: 40, y: 175 },
  ]
  return (
    <Svg w={FB_W} h={480} alt={alt}>
      {(id) => (
        <g>
          {steps.map((s) => (
            <Card key={s.t} x={s.x} y={s.y} w={240} h={120} title={s.t} lines={s.s} size={S} tone="soft" />
          ))}
          <Arrow d="M 570 80 Q 700 90 730 172" id={id} width={3} />
          <Arrow d="M 730 298 Q 700 380 572 390" id={id} width={3} />
          <Arrow d="M 328 390 Q 190 380 160 298" id={id} width={3} />
          <Arrow d="M 160 172 Q 190 90 326 80" id={id} width={3} tone="accent" />
          <Lines x={450} y={240} lines={['iterative as', 'design matures']} size={S} weight={700} ink="accent" />
        </g>
      )}
    </Svg>
  )
}

export function GovernanceFigure({ alt }: { alt: string }) {
  const seats = [
    [325, 8], [15, 118], [635, 118], [15, 300], [635, 300], [170, 446], [480, 446],
  ] as const
  const shared = (m: string) => ICWG.interfaces.filter((x) => iface(x).ends.some((e) => ownerOf(e) === m)).length
  return (
    <Svg w={FB_W} h={560} alt={alt}>
      {() => (
        <g>
          <ellipse cx={450} cy={300} rx={150} ry={92} className="f-panel" style={{ strokeWidth: 3 }} />
          <Lines x={450} y={300} lines={['ICWG']} size={L + 4} weight={700} />
          {ICWG.members.slice(0, seats.length).map((m, k) => {
            const [x, y] = seats[k]
            const n = shared(m)
            return <Card key={m} x={x} y={y} w={250} h={106} lines={[...wrap(m, 19), `${n} shared interface${n === 1 ? '' : 's'}`]} size={S} />
          })}
        </g>
      )}
    </Svg>
  )
}

export function StandardsFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB_W} h={480} alt={alt}>
      {(id) => (
        <g>
          <Shape x={250} y={150} w={150} h={180} tone="soft" strong />
          <rect x={290} y={200} width={18} height={60} className="f-shape" />
          <rect x={342} y={200} width={18} height={60} className="f-shape" />
          <Lines x={325} y={300} lines={['standard']} size={S} weight={700} />
          <Card x={10} y={40} w={200} h={90} lines={['today’s', 'charger']} size={S} />
          <Card x={10} y={350} w={200} h={90} lines={['future', 'charger']} size={S} tone="ok" />
          <Arrow d="M 212 90 L 252 190" id={id} width={3} />
          <Arrow d="M 212 390 L 252 300" id={id} width={3} tone="ok" />
          <Doc x={480} y={40} w={400} h={400} />
          <Lines x={680} y={84} lines={['agreement']} size={L} weight={700} />
          {['parties', 'obligations', 'service level', 'review date'].map((t, k) => (
            <g key={t}>
              <Lines x={520} y={150 + k * 72} lines={[t]} size={S} anchor="start" weight={600} />
              <Line d={`M 520 ${172 + k * 72} L 840 ${172 + k * 72}`} tone="muted" dots />
            </g>
          ))}
        </g>
      )}
    </Svg>
  )
}

/** The full N² of all interfaces as a compact grid (variable column widths, IDs in cells), with optional shading of the
 *  rows and columns of some elements and marks on some interfaces. */
function FullN2({ W, size, rowH, shade = [], outline = [], marked = [], filled = [] }: { W: number; size: number; rowH: number; shade?: string[]; outline?: string[]; marked?: string[]; filled?: string[] }) {
  const n = DIAGONAL.length
  const label = (d: string) => `${d} ${SHORT[d]}`
  const lm = textW(label(DIAGONAL[0]), size) * 1.12 + 12
  const degW = 24
  const avail = W - lm - degW - 6
  const pad = 8
  const need = DIAGONAL.map((b, j) => Math.max(26, ...DIAGONAL.slice(0, j).map((a) => n2Cell(a, b).reduce((t, id) => t + textW(id, size) * 1.08 + pad, 0))))
  const total = need.reduce((x, y) => x + y, 0)
  const cw = need.map((w) => (w * avail) / total)
  const xs = cw.reduce<number[]>((acc, _, j) => [...acc, j ? acc[j - 1] + cw[j - 1] : lm], [])
  const gridR = xs[n - 1] + cw[n - 1]
  const top = 3
  const yOf = (i: number) => top + i * rowH
  return (
    <g>
      {shade.map((d) => {
        const i = DIAGONAL.indexOf(d)
        return (
          <g key={d}>
            <rect x={xs[i]} y={yOf(i)} width={gridR - xs[i]} height={rowH} style={{ fill: 'var(--wb-warn-soft)' }} />
            <rect x={xs[i]} y={yOf(0)} width={cw[i]} height={yOf(i) - yOf(0)} style={{ fill: 'var(--wb-warn-soft)' }} />
          </g>
        )
      })}
      {DIAGONAL.map((a, i) => (
        <g key={a}>
          {DIAGONAL.map((b, j) => {
            if (j < i) return null
            const x = xs[j]
            const y = yOf(i)
            if (i === j) return <rect key={b} x={x} y={y} width={cw[j]} height={rowH} style={{ fill: 'var(--wb-fg)', opacity: 0.78 }} />
            const ids = n2Cell(a, b)
            if (!ids.length) return <rect key={b} x={x} y={y} width={cw[j]} height={rowH} style={{ fill: 'none', stroke: 'var(--wb-line)', strokeWidth: 1 }} />
            return (
              <g key={b}>
                {ids.map((x2, q) => {
                  const w = (cw[j] - 2) / ids.length
                  const isOut = outline.includes(x2)
                  const isFill = filled.includes(x2)
                  const isMark = marked.includes(x2)
                  return (
                    <g key={x2}>
                      <KindRect x={x + 1 + q * w} y={y + 1} w={w} h={rowH - 2} kind={iface(x2).kind} rx={2} />
                      {(isOut || isMark || isFill) && <rect x={x + 1 + q * w} y={y + 1} width={w} height={rowH - 2} style={{ fill: isFill ? 'var(--wb-bad)' : 'none', fillOpacity: isFill ? 0.42 : undefined, stroke: isOut ? 'var(--wb-fg)' : 'var(--wb-bad)', strokeWidth: isOut ? 3.4 : 2.4 }} />}
                      <Lines x={x + 1 + (q + 0.5) * w} y={y + rowH / 2} lines={[x2]} size={size} weight={isOut || isMark || isFill ? 700 : 500} />
                    </g>
                  )
                })}
                {ids.some((x2) => isExternalInterface(iface(x2))) && <ExtMark x={x + cw[j] - 1} y={y + 1} s={7} />}
              </g>
            )
          })}
          <Lines x={xs[i] - 5} y={yOf(i) + rowH / 2} lines={[label(a)]} size={size} anchor="end" weight={shade.includes(a) ? 700 : 500} />
          <Lines x={gridR + 4 + degW / 2} y={yOf(i) + rowH / 2} lines={[String(degreeOf(a))]} size={size} weight={600} />
        </g>
      ))}
    </g>
  )
}

export function ChangeControlFigure({ alt }: { alt: string }) {
  const x = iface(CHANGE_REQUEST.interface)
  const reached = CHANGE_REQUEST.reaches.filter((r) => r.id.startsWith('IF-')).map((r) => r.id)
  const H = FW_H
  return (
    <Svg w={FW_W} h={H} alt={alt}>
      {() => (
        <g>
          <FullN2 W={FW_W} size={F} rowH={15.2} shade={[...x.ends]} outline={[x.id]} marked={CHANGE_REQUEST.neighbours.filter((n) => !reached.includes(n))} filled={reached} />
          <rect x={6} y={150} width={16} height={12} style={{ fill: 'none', stroke: 'var(--wb-fg)', strokeWidth: 3.4 }} />
          <Lines x={28} y={156} lines={[`changed: ${x.id}`]} size={F} anchor="start" />
          <rect x={6} y={172} width={16} height={12} style={{ fill: 'none', stroke: 'var(--wb-bad)', strokeWidth: 2.4 }} />
          <Lines x={28} y={178} lines={['neighbour, not reached']} size={F} anchor="start" />
          <rect x={6} y={194} width={16} height={12} style={{ fill: 'var(--wb-bad)', fillOpacity: 0.42, stroke: 'var(--wb-bad)', strokeWidth: 2.4 }} />
          <Lines x={28} y={200} lines={['neighbour, reached']} size={F} anchor="start" />
          <rect x={6} y={216} width={16} height={12} style={{ fill: 'var(--wb-warn-soft)' }} />
          <Lines x={28} y={222} lines={['rows and columns of its ends']} size={F} anchor="start" />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ security
export function TrustBoundariesFigure({ alt }: { alt: string }) {
  // Each numbered example isolates one reason (review n8): 2 joins two owners; 3, 4 and 5 join two elements of ONE owner,
  // so only the public-facing end, the public network or the radio medium can make them cross. The leased line has two ends.
  return (
    <Svg w={FB_W} h={560} alt={alt}>
      {(id) => (
        <g>
          <Shape x={10} y={50} w={620} h={420} tone="dash" />
          <Lines x={30} y={72} lines={['enterprise boundary']} size={S} anchor="start" weight={700} ink="muted" />
          <Shape x={30} y={90} w={270} h={365} tone="soft" />
          <Lines x={165} y={110} lines={['owner 1']} size={S} weight={700} />
          <Shape x={320} y={90} w={290} h={365} tone="warn" />
          <Lines x={465} y={110} lines={['owner 2']} size={S} weight={700} />
          <Card x={60} y={130} w={180} h={58} lines={['element A']} size={S} />
          <Card x={60} y={385} w={180} h={58} lines={['element B']} size={S} />
          <Card x={350} y={130} w={200} h={58} lines={['element C']} size={S} />
          <Card x={350} y={240} w={150} h={70} lines={['public', 'front end']} size={S} tone="bad" />
          <Card x={350} y={385} w={200} h={58} lines={['element D']} size={S} />
          <Card x={680} y={110} w={200} h={80} lines={['external', 'system']} size={S} tone="env" />
          {/* 1 external end */}
          <Arrow d="M 552 150 L 678 150" id={id} width={3} both />
          <Chip cx={615} cy={124} text="1" size={S} tone="soft" />
          {/* 2 different owners */}
          <Arrow d="M 242 166 L 348 166" id={id} width={3} both />
          <Chip cx={295} cy={140} text="2" size={S} tone="soft" />
          {/* 3 public-facing end (both ends owner 2) */}
          <Arrow d="M 425 238 L 425 192" id={id} width={3} />
          <Chip cx={462} cy={214} text="3" size={S} tone="soft" />
          {/* 4 public network (both ends owner 1) */}
          <Cloud x={150} y={287} w={200} h={76} />
          <Lines x={150} y={295} lines={['public network']} size={S} weight={700} />
          <Line d="M 150 190 L 150 252" width={3} />
          <Line d="M 150 324 L 150 383" width={3} />
          <Chip cx={272} cy={287} text="4" size={S} tone="soft" />
          {/* 5 radio medium (both ends owner 2) */}
          <Line d="M 530 190 L 530 215 L 518 225 L 542 240 L 518 255 L 542 270 L 518 285 L 542 300 L 518 315 L 542 330 L 530 340 L 530 383" width={3} />
          <Chip cx={578} cy={262} text="5" size={S} tone="soft" />
          <Lines x={578} y={298} lines={['radio']} size={S} weight={700} />
          {/* possible: a leased wired network between two elements of owner 2 */}
          <Cloud x={770} y={330} w={200} h={86} />
          <Lines x={770} y={338} lines={['leased network', '(possible)']} size={S} weight={700} ink="warn" />
          <Line d="M 552 180 Q 650 200 690 296" width={2.6} dots />
          <Line d="M 552 414 Q 660 405 700 366" width={2.6} dots />
          <Lines x={450} y={500} lines={['1 external end · 2 different owners · 3 public-facing end']} size={S} weight={600} />
          <Lines x={450} y={532} lines={['4 public network · 5 radio medium · dotted: possible']} size={S} weight={600} />
        </g>
      )}
    </Svg>
  )
}

export function ProtectionFigure({ alt }: { alt: string }) {
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {(id) => (
        <g>
          <Card x={20} y={120} w={200} h={90} lines={['sending', 'element']} size={L} weight={700} />
          <Shape x={560} y={60} w={330} h={260} tone="dash" />
          <Lines x={725} y={86} lines={['domain separation']} size={S} weight={700} ink="accent" />
          <Card x={640} y={120} w={200} h={90} lines={['receiving', 'element']} size={L} weight={700} />
          <Card x={330} y={14} w={200} h={70} lines={['public', 'front end']} size={S} tone="bad" />
          <Arrow d="M 222 165 L 636 165" id={id} width={3.4} />
          <Lines x={120} y={250} lines={['authenticate', 'the sender;', 'least privilege']} size={S} weight={600} />
          <Lines x={420} y={215} lines={['integrity check;', 'encrypt personal data']} size={S} weight={600} ink="accent" halo />
          <Lines x={740} y={268} lines={['boundary enforcement:', 'reject malformed or', 'out-of-date messages']} size={S} weight={600} />
          <Card x={640} y={400} w={240} h={100} lines={['local interlock', '(no interface)']} size={S} tone="ok" />
        </g>
      )}
    </Svg>
  )
}

export function DegradedFigure({ alt }: { alt: string }) {
  const phases = [
    { t: 'normal', s: ['messages', 'flowing'], tone: 'ok' as const },
    { t: 'loss detected', s: ['a gap,', 'a timer runs'], tone: 'warn' as const },
    { t: 'degraded mode', s: ['missing status =', 'unsafe value;', 'stop or manual'], tone: 'bad' as const },
    { t: 'recovery', s: ['messages resume,', 'back to normal'], tone: 'ok' as const },
  ]
  return (
    <Svg w={FB_W} h={420} alt={alt}>
      {(id) => (
        <g>
          {phases.map((p, k) => (
            <Card key={p.t} x={10 + k * 222} y={40} w={204} h={200} title={p.t} lines={p.s} size={S} tone={p.tone} />
          ))}
          <Arrow d="M 20 280 L 880 280" id={id} width={3} />
          <Lines x={450} y={306} lines={['time']} size={S} ink="muted" />
          <Shape x={10} y={340} w={880} h={64} tone="soft" />
          <Lines x={450} y={372} lines={['limit the duration and the spread of the loss']} size={S} weight={700} />
        </g>
      )}
    </Svg>
  )
}

export function WorkedSecurityFigure({ alt }: { alt: string }) {
  const ids = ['IF-008', 'IF-010', 'IF-006']
  const notCrossing = INTERFACES.filter((x) => !COUNTS.crossing.includes(x.id)).map((x) => x.id)
  const possible = notCrossing.filter((x) => HIDDEN_EXTERNAL.includes(x))
  const W = FW_W
  const H = FW_H
  const sz = 15
  const cardW = 322
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <g>
          {ids.map((x, k) => {
            const d = iface(x)
            const prot = d.protection.length ? `protect: ${d.protection.length} measures, e.g. ${d.protection[0].split(/[:(]/)[0].trim()}` : 'no data: reason given'
            const lines = [...wrap(`crosses: ${list(boundaryReasons(d))}`, 38), ...wrap(prot, 38), ...wrap(`degraded: ${d.degraded}`, 38)]
            return (
              <g key={x}>
                <Shape x={6 + k * (cardW + 9)} y={4} w={cardW} h={188} tone="soft" />
                <Lines x={6 + k * (cardW + 9) + cardW / 2} y={22} lines={[`${x} ${d.name}`]} size={sz} weight={700} />
                <Lines x={14 + k * (cardW + 9)} y={110} lines={lines} size={sz} anchor="start" />
              </g>
            )
          })}
          <Shape x={6} y={198} w={W - 12} h={34} tone="panel" />
          <Lines x={W / 2} y={215} lines={[`${COUNTS.crossing.length} crossing · ${possible.length} possible (leased ground network) · ${notCrossing.length - possible.length} none`]} size={sz + 3} weight={700} />
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ audit and integration
export function AuditFigure({ alt }: { alt: string }) {
  const n = DIAGONAL.length
  const c = 24
  const x0 = 20
  const y0 = 60
  const lenses = [
    { t: 'coverage', q: ['is every crossing', 'flow carried?'], gx: 4, gy: 1 },
    { t: 'externals', q: ['an interface or a', 'reason for each?'], gx: 8, gy: 4 },
    { t: 'hidden paths', q: ['media we may not own;', 'exchanges with none'], gx: 11, gy: 7 },
    { t: 'verification', q: ['which interfaces', 'have a case?'], gx: 14, gy: 10 },
  ]
  return (
    <Svg w={FB_W} h={540} alt={alt}>
      {() => (
        <g>
          <Lines x={x0 + (n * c) / 2} y={30} lines={['AeroLink interface N²']} size={S} weight={700} />
          {DIAGONAL.map((a, i) =>
            DIAGONAL.map((b, j) => {
              if (j < i) return null
              const x = x0 + j * c
              const y = y0 + i * c
              if (i === j) return <rect key={`${a}${b}`} x={x} y={y} width={c} height={c} style={{ fill: 'var(--wb-fg)', opacity: 0.78 }} />
              const ids = n2Cell(a, b)
              if (!ids.length) return <rect key={`${a}${b}`} x={x} y={y} width={c} height={c} style={{ fill: 'none', stroke: 'var(--wb-line)', strokeWidth: 1 }} />
              return <KindRect key={`${a}${b}`} x={x + 1} y={y + 1} w={c - 2} h={c - 2} kind={iface(ids[0]).kind} rx={2} />
            }),
          )}
          {lenses.map((l, k) => {
            const cx = x0 + l.gx * c
            const cy = y0 + l.gy * c
            const by = 60 + k * 118
            return (
              <g key={l.t}>
                <circle cx={cx} cy={cy} r={34} style={{ fill: 'none', stroke: 'var(--wb-accent)', strokeWidth: 4 }} />
                <Line d={`M ${cx + 24} ${cy + 24} L ${cx + 40} ${cy + 40}`} tone="accent" width={6} />
                <Line d={`M ${cx + 34} ${cy} L 446 ${by + 50}`} tone="accent" dashed width={1.6} />
                <Card x={450} y={by} w={440} h={104} title={l.t} lines={l.q} size={S} tone="soft" />
              </g>
            )
          })}
          <Lines x={x0} y={y0 + n * c + 24} lines={['no findings are marked']} size={S} anchor="start" ink="muted" weight={600} />
        </g>
      )}
    </Svg>
  )
}

export function IntegrationFigure({ alt }: { alt: string }) {
  const panels = GROUPINGS.map((g) => ({ g, n: groupingCounts(g) }))
  return (
    <Svg w={FB_W} h={560} alt={alt}>
      {() => (
        <g>
          {panels.map(({ g, n }, k) => {
            const x0 = 8 + k * 450
            const names = (agg: readonly string[]) => wrap(agg.map((e) => SHORT[e]).join(', '), 30)
            const ids = n.between
            const per = Math.ceil(ids.length / 2)
            return (
              <g key={g.id}>
                <Lines x={x0 + 215} y={22} lines={[g.name]} size={L} weight={700} />
                <Card x={x0} y={46} w={430} h={130} lines={names(g.aggregates[0])} size={S} tone="soft" />
                <Card x={x0} y={340} w={430} h={150} lines={names(g.aggregates[1])} size={S} tone="soft" />
                {ids.map((x, q) => {
                  // rows are offset by half a step so a link never runs through another row's pill; the link stops at
                  // its own pill instead of striking through the label; the pill takes its interface kind's colours
                  const row = Math.floor(q / per)
                  const col = q % per
                  const cx = x0 + 215 + (col - (Math.min(per, ids.length - row * per) - 1) / 2) * 120 + (row % 2 ? 60 : 0)
                  const cy = 222 + row * 70
                  const k = KIND_STYLE[iface(x).kind]
                  const w = textW(x, S) + 22
                  const h = S + 14
                  return (
                    <g key={x}>
                      <Line d={`M ${cx} 178 L ${cx} ${cy - h / 2} M ${cx} ${cy + h / 2} L ${cx} 338`} width={2} />
                      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h / 2} style={{ fill: k.fill, stroke: k.stroke, strokeWidth: k.width }} strokeDasharray={k.dash} />
                      <Lines x={cx} y={cy} lines={[x]} size={S} weight={600} />
                    </g>
                  )
                })}
                <Lines x={x0 + 215} y={520} lines={[`${ids.length} between aggregates`]} size={L} weight={700} ink="accent" />
              </g>
            )
          })}
          <Lines x={450} y={548} lines={[`${panels[0].n.external} external interfaces: verified with the external parties`]} size={S} ink="muted" />
        </g>
      )}
    </Svg>
  )
}

export function CouplingFigure({ alt }: { alt: string }) {
  const A = COUPLING.A
  const B = COUPLING.B
  const unc = uncoveredPairs(B.pairs)
  const W = FW_W
  const H = FW_H
  const sz = F + 1
  const panel = (x: number, title: string, c: typeof A, extra?: string) => (
    <g>
      <Shape x={x} y={6} w={488} h={H - 12} tone="soft" />
      <Lines x={x + 244} y={28} lines={[title]} size={sz + 3} weight={700} />
      {[
        `X = ${c.X} of ${c.E} flows cross`,
        `κ = ${f2(c.kappa)}`,
        `P = ${c.P} element pairs`,
        `most partners: ${c.Dmax} at ${list(c.atMax)}`,
      ].map((t, k) => (
        <Lines key={t} x={x + 20} y={66 + k * 30} lines={[t]} size={sz + 1} anchor="start" weight={k === 1 ? 700 : 500} />
      ))}
      {extra && <Lines x={x + 20} y={190} lines={wrap(extra, 60)} size={sz} anchor="start" ink="bad" weight={600} />}
    </g>
  )
  return (
    <Svg w={W} h={H} alt={alt}>
      {() => (
        <g>
          {panel(6, 'One operations platform (chosen)', A)}
          {panel(506, 'Distributed dispatch at the vertiports', B, `${unc.length} of its pairs have no information interface`)}
        </g>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ bridge and lab
export function FeedsW5Figure({ alt }: { alt: string }) {
  const n = FEEDS_FORWARD_W5.length
  return (
    <Svg w={FB_W} h={560} alt={alt}>
      {(id) => (
        <g>
          <Card x={20} y={210} w={230} h={130} lines={['Week 5', 'components and', 'interfaces']} size={S} tone="soft" strong />
          {FEEDS_FORWARD_W5.map((f, k) => {
            const y = 8 + k * (544 / n)
            return (
              <g key={f.week + f.artifact}>
                <Arrow d={`M 252 275 L 396 ${y + 48}`} id={id} width={2.4} dashed={Number(f.week.replace(/\D/g, '')) > 7} />
                <Card x={400} y={y} w={490} h={96} lines={[f.week, ...wrap(f.artifact.toLowerCase(), 36).slice(0, 2)]} size={S} />
              </g>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

export function LabN2Figure({ alt }: { alt: string }) {
  const n = 10
  const c = 46
  const x0 = 140
  const y0 = 30
  return (
    <Svg w={FB_W} h={520} alt={alt}>
      {() => (
        <g>
          {Array.from({ length: n }, (_, i) => (
            <g key={i}>
              <Lines x={x0 - 8} y={y0 + i * c + c / 2} lines={[`element ${i + 1}`]} size={S} anchor="end" />
              {Array.from({ length: n }, (_, j) =>
                j < i ? null : <rect key={j} x={x0 + j * c} y={y0 + i * c} width={c} height={c} style={i === j ? { fill: 'var(--wb-fg)', opacity: 0.6 } : { fill: 'none', stroke: 'var(--wb-line-strong)', strokeWidth: 1.2 }} />,
              )}
            </g>
          ))}
          {(['physical', 'information', 'organizational'] as const).map((k, q) => (
            <g key={k}>
              <KindRect x={630} y={300 + q * 40} w={44} h={28} kind={k} rx={3} />
              <Lines x={652} y={314 + q * 40} lines={[KIND_STYLE[k].letter]} size={S} weight={700} />
              <Lines x={684} y={314 + q * 40} lines={[k]} size={S} anchor="start" />
            </g>
          ))}
          <rect x={630} y={420} width={44} height={28} className="f-shape" />
          <ExtMark x={674} y={420} s={12} />
          <Lines x={684} y={434} lines={['external']} size={S} anchor="start" />
          <circle cx={760} cy={130} r={70} className="f-panel" style={{ strokeWidth: 3 }} />
          <Line d="M 760 130 L 760 80" width={4} />
          <Line d="M 760 130 L 795 150" width={4} />
          <Lines x={760} y={230} lines={['12 min']} size={L + 4} weight={700} />
        </g>
      )}
    </Svg>
  )
}
