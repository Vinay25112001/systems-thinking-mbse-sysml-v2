// Week 2, Session 2 lecture figures (requirements, their quality, the trace audit, the measures and the lab launch).
// Original drawings: none redraws a SEBoK, MITRE or DoD figure. Every label comes from the Week 2 figure specification,
// the Session 2 lecture text or the Week 2 AeroLink case (src/content/lectures/week02/aerolinkCase.ts, FICTIONAL, which
// imports the Week 1 needs read-only) and the Lab L2 brief (src/content/lectures/week02/labBrief.ts); case values are
// imported, never retyped, and a figure adds no claim of its own. Static SVG with the shared theme classes (flow.css:
// f-shape, f-soft, f-panel, f-env, f-label, f-muted, f-accent-ink, f-arrow, f-divider) and theme variables (--wb-warn,
// --wb-warn-soft, --wb-accent-soft), so the light and dark themes are both designed once; meaning is never carried by
// color alone (dash patterns, outlines, labels). The small helpers are copied from the Week 1 figure files, not imported.
// Review status: new-pending-review.
import { useId, type ReactNode } from 'react'
import { Markers } from './Frame'
import {
  CHAINS_S2,
  CRITIQUE,
  DELIBERATE_REQ_GAP,
  MOES,
  MOPS,
  NEEDS,
  OBJECTIVES,
  PROPOSED_REQUIREMENTS,
  REFERENCE_REQUIREMENTS,
  REQUIREMENTS,
  STAKEHOLDER_REQUIREMENTS,
  STK_DISPOSITION_FORM,
  SYSTEM_REQUIREMENTS,
  TURNAROUND_BUDGET,
  UNCERTAINTIES,
  capability,
  childlessStakeholderRequirements,
  countByType,
  need,
  requirement,
  type CaseMeasure,
} from '../../content/lectures/week02/aerolinkCase'
import { CLINIC_CRITERIA, LAB2_MINIMUMS as MIN, REQ_TYPES, SCENARIO_KINDS, VER_METHODS, WEEK2_PARTS, WEEK2_PREFIXES } from '../../content/lectures/week02/labBrief'

// ------------------------------------------------------------------------------------------------ shared helpers
type Tone = 'box' | 'soft' | 'panel' | 'env' | 'warn' | 'later'
const WARN_FILL = {
  fill: 'var(--wb-warn-soft)',
  stroke: 'var(--wb-warn)',
  strokeWidth: 1.8,
}
const WARN_INK = { fill: 'var(--wb-warn)' }
const PROPOSED = {
  fill: 'var(--wb-panel)',
  stroke: 'var(--wb-accent)',
  strokeWidth: 1.8,
}
const ICON = {
  stroke: 'var(--wb-fg)',
  strokeWidth: 2.4,
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Shape({ x, y, w, h, tone = 'box', rx = 7, strong = false, dashed = false }: { x: number; y: number; w: number; h: number; tone?: Tone; rx?: number; strong?: boolean; dashed?: boolean }) {
  const sw = strong ? { strokeWidth: 3 } : undefined
  const dash = dashed || tone === 'later' ? '6 4' : undefined
  if (tone === 'soft')
    return (
      <g className="f-soft">
        <rect x={x} y={y} width={w} height={h} rx={rx} className="f-shape" style={sw} strokeDasharray={dash} />
      </g>
    )
  if (tone === 'panel') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-panel" style={sw} strokeDasharray={dash} />
  if (tone === 'env' || tone === 'later') return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-env" style={sw} strokeDasharray={dash} />
  if (tone === 'warn') return <rect x={x} y={y} width={w} height={h} rx={rx} style={{ ...WARN_FILL, ...(sw ?? {}) }} strokeDasharray={dash} />
  return <rect x={x} y={y} width={w} height={h} rx={rx} className="f-shape" style={sw} strokeDasharray={dash} />
}

type Ink = 'ink' | 'muted' | 'accent' | 'warn'
const inkProps = (ink: Ink) =>
  ink === 'warn'
    ? { style: WARN_INK }
    : {
        className: ink === 'muted' ? 'f-muted' : ink === 'accent' ? 'f-accent-ink' : 'f-label',
      }

/** Estimated advance width of a string in IBM Plex Sans (em fractions per glyph class), for hand-wrapping labels. */
function textW(s: string, size: number) {
  let w = 0
  for (const ch of s) {
    if (ch === ' ' || ch === '\u00a0') w += 0.26
    else if (/[il.,;:'’‘|!]/.test(ch)) w += 0.25
    else if (/[fjtr()[\]“”"\-–]/.test(ch)) w += 0.34
    else if (/[mwMW%]/.test(ch)) w += 0.84
    else if (/[A-Z]/.test(ch)) w += 0.64
    else if (/[0-9]/.test(ch)) w += 0.57
    else if (/[≤≥→←×·]/.test(ch)) w += 0.6
    else w += 0.53
  }
  return w * size
}

/** Greedy word wrap of a string into lines no wider than `width` at `size`. */
function wrap(text: string, width: number, size: number): string[] {
  const out: string[] = []
  let cur = ''
  for (const word of text.split(' ')) {
    const next = cur ? `${cur} ${word}` : word
    if (cur && textW(next, size) > width) {
      out.push(cur)
      cur = word
    } else cur = next
  }
  if (cur) out.push(cur)
  return out
}

/** Start offsets of consecutive extents (sizes) laid end to end from `start` with `gap` between them. */
function runs(sizes: number[], start: number, gap = 0): number[] {
  const out: number[] = []
  sizes.reduce((at, s) => {
    out.push(at)
    return at + s + gap
  }, start)
  return out
}

/** Lines of text centered (or anchored) on (x, y): the block is vertically centered on y. */
function Lines({
  x,
  y,
  lines,
  size = 17,
  anchor = 'middle',
  weight = 500,
  ink = 'ink',
  lh = 1.25,
  italic = false,
}: {
  x: number
  y: number
  lines: string[]
  size?: number
  anchor?: 'start' | 'middle' | 'end'
  weight?: number
  ink?: Ink
  lh?: number
  italic?: boolean
}) {
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

/** Rows of mixed size and weight, vertically centered on y as one block. */
type Row = {
  t: string
  size?: number
  weight?: number
  ink?: Ink
  italic?: boolean
}
function Stack({ x, y, rows, anchor = 'middle', lh = 1.25 }: { x: number; y: number; rows: Row[]; anchor?: 'start' | 'middle' | 'end'; lh?: number }) {
  const hs = rows.map((r) => (r.size ?? 17) * lh)
  const tops = runs(hs, y - hs.reduce((a, b) => a + b, 0) / 2)
  return (
    <>
      {rows.map((r, i) => {
        const yy = tops[i] + hs[i] / 2
        return (
          <text key={i} x={x} y={yy} textAnchor={anchor} dominantBaseline="central" fontSize={r.size ?? 17} fontWeight={r.weight ?? 500} fontStyle={r.italic ? 'italic' : undefined} {...inkProps(r.ink ?? 'ink')}>
            {r.t}
          </text>
        )
      })}
    </>
  )
}
/** A wrapped string as Stack rows. */
const wr = (text: string, width: number, size = 17, extra: Omit<Row, 't' | 'size'> = {}): Row[] => wrap(text, width, size).map((t) => ({ t, size, ...extra }))

/** A shape with centered lines of text. */
function Card({
  x,
  y,
  w,
  h,
  lines,
  tone = 'box',
  size = 17,
  weight = 500,
  ink,
  strong = false,
  dashed = false,
}: {
  x: number
  y: number
  w: number
  h: number
  lines: string[]
  tone?: Tone
  size?: number
  weight?: number
  ink?: Ink
  strong?: boolean
  dashed?: boolean
}) {
  return (
    <g>
      <Shape x={x} y={y} w={w} h={h} tone={tone} strong={strong} dashed={dashed} />
      <Lines x={x + w / 2} y={y + h / 2} lines={lines} size={size} weight={weight} ink={ink ?? (tone === 'later' ? 'muted' : 'ink')} />
    </g>
  )
}

/** A shape holding a Stack of rows. */
function RowCard({
  x,
  y,
  w,
  h,
  rows,
  tone = 'box',
  strong = false,
  dashed = false,
  anchor = 'middle',
  pad = 14,
}: {
  x: number
  y: number
  w: number
  h: number
  rows: Row[]
  tone?: Tone
  strong?: boolean
  dashed?: boolean
  anchor?: 'start' | 'middle'
  pad?: number
}) {
  return (
    <g>
      <Shape x={x} y={y} w={w} h={h} tone={tone} strong={strong} dashed={dashed} />
      <Stack x={anchor === 'start' ? x + pad : x + w / 2} y={y + h / 2} rows={rows} anchor={anchor} />
    </g>
  )
}

function Arrow({ d, id, tone = 'ink', dashed = false, width, both = false }: { d: string; id: string; tone?: 'ink' | 'accent' | 'muted' | 'warn'; dashed?: boolean; width?: number; both?: boolean }) {
  const style = tone === 'warn' ? { stroke: 'var(--wb-warn)', strokeWidth: width ?? 2.6 } : tone === 'muted' ? { stroke: 'var(--wb-muted)', strokeWidth: width ?? 1.6 } : width ? { strokeWidth: width } : undefined
  return (
    <path d={d} className={`f-arrow${tone === 'accent' ? ' accent' : ''}`} style={style} strokeDasharray={dashed ? '7 5' : undefined} markerEnd={`url(#${id}-${tone})`} markerStart={both ? `url(#${id}-${tone})` : undefined} fill="none" />
  )
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

/** A drawn check mark (a glyph-free ✓, so the font cannot drop it). */
function Tick({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <path d={`M ${x - 8 * s} ${y} L ${x - 2 * s} ${y + 7 * s} L ${x + 10 * s} ${y - 8 * s}`} style={{ ...ICON, stroke: 'var(--wb-accent)', strokeWidth: 3 }} />
}

/** Wrapped text with highlighted phrases (amber or accent outline). The layout is pure so callers can aim arrows at
 *  a highlight. Phrases are kept on one line; widths are estimated (textW). */
type Mark = { phrase: string; tone: 'warn' | 'accent' }
const NB = (s: string) => s.replace(/ /g, '\u00a0')
const HI_PAD = 5
function layoutHi(text: string, width: number, size: number, marks: Mark[]) {
  let t = text
  for (const m of marks) t = t.replace(m.phrase, NB(m.phrase))
  const lines = wrap(t, width, size)
  const rects: {
    li: number
    dx: number
    w: number
    tone: Mark['tone']
    phrase: string
  }[] = []
  lines.forEach((ln, li) => {
    const found = marks.map((m) => ({ m, idx: ln.indexOf(NB(m.phrase)) })).filter((f) => f.idx >= 0)
    found.sort((a, b) => a.idx - b.idx)
    found.forEach(({ m, idx }, k) =>
      rects.push({
        li,
        dx: textW(ln.slice(0, idx), size) + HI_PAD * (2 * k + 1),
        w: textW(m.phrase, size) * 1.06,
        tone: m.tone,
        phrase: m.phrase,
      }),
    )
  })
  return { lines, rects }
}
function HiText({ x, y, size, lh = 1.35, layout, marks }: { x: number; y: number; size: number; lh?: number; layout: ReturnType<typeof layoutHi>; marks: Mark[] }) {
  const step = size * lh
  return (
    <>
      {layout.rects.map((r, i) => (
        <rect
          key={`r${i}`}
          x={x + r.dx - 4}
          y={y + r.li * step - size * 0.72}
          width={r.w + 8}
          height={size * 1.44}
          rx={4}
          style={
            r.tone === 'warn'
              ? { ...WARN_FILL, strokeWidth: 2.2 }
              : {
                  fill: 'var(--wb-accent-soft)',
                  stroke: 'var(--wb-accent)',
                  strokeWidth: 2.2,
                }
          }
        />
      ))}
      {layout.lines.map((ln, li) => {
        // split the line into plain and marked runs
        const parts: { s: string; m?: Mark }[] = []
        let rest = ln
        while (rest) {
          let best: { idx: number; m: Mark } | undefined
          for (const m of marks) {
            const idx = rest.indexOf(NB(m.phrase))
            if (idx >= 0 && (!best || idx < best.idx)) best = { idx, m }
          }
          if (!best) {
            parts.push({ s: rest })
            break
          }
          if (best.idx > 0) parts.push({ s: rest.slice(0, best.idx) })
          parts.push({ s: NB(best.m.phrase), m: best.m })
          rest = rest.slice(best.idx + best.m.phrase.length)
        }
        return (
          <text key={li} x={x} y={y + li * step} dominantBaseline="central" fontSize={size} className="f-label">
            {parts.map((p, k) =>
              p.m ? (
                <tspan key={k} dx={HI_PAD} fontWeight={700} {...inkProps(p.m.tone === 'warn' ? 'warn' : 'accent')}>
                  {p.s}
                </tspan>
              ) : (
                <tspan key={k} dx={k > 0 && parts[k - 1].m ? HI_PAD : undefined}>
                  {p.s}
                </tspan>
              ),
            )}
          </text>
        )
      })}
    </>
  )
}

const methodLabel = (id: string) => VER_METHODS.find((m) => m.id === requirement(id).method)?.label ?? requirement(id).method
const typeLabel = (t: string) => REQ_TYPES.find((x) => x.id === t)?.label ?? t
const uncertainty = (id: string) => UNCERTAINTIES.find((u) => u.id === id)!
const measure = (id: string): CaseMeasure => [...MOES, ...MOPS].find((m) => m.id === id)!
const STK_OWNER = WEEK2_PREFIXES.find((p) => p.prefix === 'REQ-STK')!.owner

// Size rule for these figures (checked at #/figure/<id>, 1600 × 900): figures beside bullets use a viewBox about 860
// wide with text of at least 16 units; full-width figures use a viewBox 1200–1440 wide and about 2.2–2.6:1, with text
// of at least 17 units. Both render at roughly 12 px or more on the slide stage and about 10 pt or more in the .pptx.

// ------------------------------------------------------------------------------------------------ S2.1 anatomy of a requirement
export function ReqAnatomyFigure({ alt }: { alt: string }) {
  const r = requirement('REQ-STK-001')
  // the statement, segment by segment (the segments join back into r.statement)
  const rows: { t: string; label: string }[][] = [
    [
      { t: 'The AeroLink service', label: 'subject' },
      { t: 'shall', label: '' },
      { t: 'board', label: 'action' },
      { t: 'at least 90 % of passengers', label: 'object' },
    ],
    [
      { t: 'in each calendar month', label: 'condition' },
      { t: 'within 15 min of their ride confirmation', label: 'criterion' },
    ],
  ]
  const attrs: [string, string, boolean?][] = [
    ['ID', r.id],
    ['Type', typeLabel(r.type)],
    ['Method', methodLabel(r.id)],
    ['Criterion', r.criterion],
    ['Rationale', 'attraction halves at a 15 min wait (A-001) … (shortened)'],
    ['Parents', r.parents.join(', ')],
    ['Owner', `${STK_OWNER} lead`],
  ]
  const attrLines = attrs.map(([, v]) => wrap(v, 610, 17))
  const attrY = runs(
    attrLines.map((ls) => ls.length * 23),
    318,
    12,
  )
  return (
    <Svg w={860} h={580} alt={alt}>
      {() => (
        <>
          <text x={14} y={28} fontSize={20} fontWeight={700} className="f-label">
            {r.id} · {r.name}
          </text>
          {rows.map((row, ri) => {
            const y = 76 + ri * 102
            const ws = row.map((s) => textW(s.t, 19) + 30)
            const xs = runs(ws, 14, 12)
            return row.map((s, si) => {
              const w = ws[si]
              const x = xs[si]
              const isShall = s.t === 'shall'
              const g = (
                <g key={s.t}>
                  {s.label && (
                    <text x={x + w / 2} y={y - 14} textAnchor="middle" fontSize={16} fontWeight={600} className="f-accent-ink">
                      {s.label}
                    </text>
                  )}
                  <Shape x={x} y={y} w={w} h={48} tone={isShall ? 'box' : 'soft'} strong={isShall} />
                  <text x={x + w / 2} y={y + 24} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={isShall ? 800 : 500} className="f-label">
                    {s.t}
                  </text>
                </g>
              )
              return g
            })
          })}
          <Shape x={6} y={262} w={848} h={310} tone="panel" />
          <text x={22} y={288} fontSize={18} fontWeight={700} className="f-label">
            Attributes recorded with the statement
          </text>
          {attrs.map(([k], ai) => {
            const ls = attrLines[ai]
            const y0 = attrY[ai]
            return (
              <g key={k}>
                <text x={24} y={y0} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
                  {k}
                </text>
                {ls.map((l, i) => (
                  <text key={i} x={210} y={y0 + i * 23} dominantBaseline="central" fontSize={17} className={k === 'Rationale' ? 'f-muted' : 'f-label'}>
                    {l}
                  </text>
                ))}
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.2 characteristics, DoD vs MITRE
export function CharacteristicsFigure({ alt }: { alt: string }) {
  type Item = { main: string; sub?: string }
  const cols: {
    title: string
    x: number
    w: number
    items: Item[]
    strong?: boolean
  }[] = [
    {
      title: 'DoD only',
      x: 6,
      w: 226,
      items: [{ main: 'necessary' }, { main: 'clear and concise' }, { main: 'complete' }, { main: 'able to be validated' }, { main: 'operationally effective and survivable' }],
    },
    {
      title: 'Both lists',
      x: 244,
      w: 336,
      strong: true,
      items: [
        { main: 'unambiguous' },
        { main: 'traceable' },
        { main: 'measurable' },
        { main: 'verifiable / testable' },
        { main: 'consistent' },
        { main: 'feasible' },
        { main: 'singular', sub: '(MITRE: specific and singular)' },
        { main: 'unique', sub: '(MITRE: uniquely identified)' },
      ],
    },
    {
      title: 'MITRE only',
      x: 592,
      w: 210,
      items: [{ main: 'performance specified' }, { main: 'design-free' }, { main: 'uses “shall”' }],
    },
  ]
  return (
    <Svg w={860} h={560} alt={alt}>
      {() => (
        <>
          {cols.map((c) => {
            const itemRows = c.items.map((it): Row[] => [...wrap(it.main, c.w - 24, 17).map((t) => ({ t, size: 17 })), ...(it.sub ? [{ t: it.sub, size: 16, ink: 'muted' as Ink }] : [])])
            const hs = itemRows.map((rows) => 16 + rows.length * 22)
            const ys = runs(hs, 78, 8)
            return (
              <g key={c.title}>
                <Card x={c.x} y={14} w={c.w} h={50} tone={c.strong ? 'soft' : 'panel'} strong={c.strong} lines={[c.title]} size={19} weight={700} />
                {c.items.map((it, k) => (
                  <RowCard key={it.main} x={c.x} y={ys[k]} w={c.w} h={hs[k]} rows={itemRows[k]} tone={c.strong ? 'soft' : 'box'} />
                ))}
              </g>
            )
          })}
          <Shape x={812} y={78} w={42} h={414} tone="later" />
          <text x={833} y={285} transform="rotate(-90 833 285)" textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={600} className="f-label">
            set-level: complete, consistent
          </text>
          <text x={430} y={540} textAnchor="middle" fontSize={16} className="f-muted">
            DoD Guidebook · MITRE SEG
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.3 types and categories
export function TypesGridFigure({ alt }: { alt: string }) {
  const ref = countByType(REFERENCE_REQUIREMENTS)
  const prop = countByType(PROPOSED_REQUIREMENTS)
  const all = countByType(REQUIREMENTS)
  const max = Math.max(...all.map((a) => a.n))
  const X0 = 156
  const U = 168 / max
  const cats: { name: string; ok: boolean; note: string }[] = [
    { name: 'Function / Performance', ok: true, note: '' },
    {
      name: 'Fit / Operational',
      ok: true,
      note: 'interfaces, operating environment',
    },
    { name: 'Form', ok: false, note: 'none yet' },
    { name: 'Quality', ok: true, note: 'fleet availability' },
    { name: 'Compliance', ok: true, note: 'noise, land use' },
  ]
  return (
    <Svg w={860} h={580} alt={alt}>
      {() => (
        <>
          <Shape x={6} y={6} w={424} h={568} tone="panel" />
          <Lines x={218} y={46} lines={['AeroLink requirements', 'by course type']} size={19} weight={700} />
          {all.map((a, i) => {
            const y = 112 + i * 92
            const r = ref[i].n
            const p = prop[i].n
            return (
              <g key={a.type}>
                <text x={20} y={y + 22} dominantBaseline="central" fontSize={17} fontWeight={600} className="f-label">
                  {typeLabel(a.type)}
                </text>
                {r > 0 && <Shape x={X0} y={y} w={r * U} h={44} tone="soft" rx={3} />}
                {p > 0 && <rect x={X0 + r * U} y={y} width={p * U} height={44} rx={3} style={PROPOSED} strokeDasharray="5 3" />}
                <text x={X0 + a.n * U + 8} y={y + 22} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
                  {a.n}
                  <tspan fontWeight={500} className="f-muted">
                    {` (${r} + ${p})`}
                  </tspan>
                </text>
              </g>
            )
          })}
          <Shape x={22} y={478} w={30} h={20} tone="soft" rx={3} />
          <text x={60} y={488} dominantBaseline="central" fontSize={16} className="f-label">
            reference
          </text>
          <rect x={22} y={508} width={30} height={20} rx={3} style={PROPOSED} strokeDasharray="5 3" />
          <text x={60} y={518} dominantBaseline="central" fontSize={16} className="f-label">
            proposed (instructor to confirm)
          </text>
          <text x={22} y={552} dominantBaseline="central" fontSize={16} className="f-muted">
            {`${REQUIREMENTS.length} requirements: ${STAKEHOLDER_REQUIREMENTS.length} stakeholder, ${SYSTEM_REQUIREMENTS.length} system`}
          </text>
          <Lines x={650} y={42} lines={['SEBoK’s five categories,', 'read for AeroLink']} size={19} weight={700} />
          <text x={650} y={86} textAnchor="middle" fontSize={16} className="f-muted">
            (instructor’s reading)
          </text>
          {cats.map((c, i) => {
            const y = 108 + i * 90
            return (
              <g key={c.name}>
                {c.ok ? <Shape x={446} y={y} w={408} h={78} tone="box" /> : <rect x={446} y={y} width={408} height={78} rx={7} style={WARN_FILL} strokeDasharray="7 4" />}
                {c.ok && <Tick x={474} y={y + 39} />}
                <Stack
                  x={500}
                  y={y + 39}
                  anchor="start"
                  rows={[
                    { t: c.name, size: 18, weight: 700 },
                    ...(c.note
                      ? [
                          {
                            t: c.note,
                            size: 16.5,
                            ink: (c.ok ? 'muted' : 'warn') as Ink,
                            weight: c.ok ? 500 : 700,
                          },
                        ]
                      : []),
                  ]}
                />
                {!c.ok && (
                  <text x={840} y={y + 39} textAnchor="end" dominantBaseline="central" fontSize={16.5} fontWeight={700} style={WARN_INK}>
                    gap to discuss
                  </text>
                )}
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.4 level and white space
export function ZoomLevelsFigure({ alt }: { alt: string }) {
  const zoom = {
    stroke: 'var(--wb-muted)',
    strokeWidth: 1.4,
    strokeDasharray: '5 4',
  }
  return (
    <Svg w={860} h={530} alt={alt}>
      {() => (
        <>
          <Shape x={20} y={16} w={820} h={108} tone="soft" strong />
          <text x={36} y={42} fontSize={16} fontWeight={600} className="f-accent-ink">
            service level
          </text>
          <text x={36} y={82} fontSize={18} fontWeight={700} className="f-label">
            {`REQ-STK-005: dispatch-ready within ${TURNAROUND_BUDGET.total} min of arrival`}
          </text>
          <Card x={640} y={56} w={184} h={54} tone="box" lines={['charging system']} size={17} weight={600} />
          <line x1={640} y1={110} x2={120} y2={172} style={zoom} />
          <line x1={824} y1={110} x2={840} y2={172} style={zoom} />
          <Shape x={120} y={172} w={720} h={190} tone="box" strong />
          <text x={136} y={198} fontSize={16} fontWeight={600} className="f-accent-ink">
            element level: the charging system
          </text>
          <text x={136} y={232} fontSize={18} fontWeight={700} className="f-label">
            {`REQ-SYS-001: charge 20 % → threshold within ${TURNAROUND_BUDGET.charge} min`}
          </text>
          <rect x={136} y={256} width={400} height={90} rx={6} fill="none" className="f-divider" style={{ strokeWidth: 1.5 }} />
          <text x={336} y={301} textAnchor="middle" dominantBaseline="central" fontSize={18} fontStyle="italic" className="f-muted">
            white space left for the designer
          </text>
          <Card x={556} y={266} w={268} h={80} tone="later" lines={['charger rating', 'and count']} size={17} />
          <line x1={556} y1={346} x2={220} y2={404} style={zoom} />
          <line x1={824} y1={346} x2={840} y2={404} style={zoom} />
          <Card x={220} y={404} w={620} h={110} tone="later" lines={['charger rating and count:', 'derived later, after the Week 3 trade']} size={19} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.5 a negative, a TBD and the positive rewrite
export function NegativeTbdFigure({ alt }: { alt: string }) {
  const a = requirement('REQ-STK-003')
  const b = requirement('REQ-SYS-004')
  const u = uncertainty('U-001')
  const tbd = `(${a.tbx ?? 'TBD-01'})`
  const mA: Mark[] = [
    { phrase: 'shall not', tone: 'warn' },
    { phrase: tbd, tone: 'warn' },
  ]
  const mB: Mark[] = [
    { phrase: 'shall place a dispatch hold', tone: 'accent' },
    { phrase: tbd, tone: 'warn' },
  ]
  const SZ = 17.5
  const LH = 1.4
  const TX = 24
  const la = layoutHi(a.statement, 412, SZ, mA)
  const lb = layoutHi(b.statement, 412, SZ, mB)
  const AY = 92
  const BY = 336
  const tA = la.rects.find((r) => r.phrase === tbd)!
  const tB = lb.rects.find((r) => r.phrase === tbd)!
  const ax = TX + tA.dx + tA.w + 4
  const ay = AY + tA.li * SZ * LH
  const bx = TX + tB.dx + tB.w + 4
  const by = BY + tB.li * SZ * LH
  return (
    <Svg w={860} h={480} alt={alt}>
      {(id) => (
        <>
          <Shape x={6} y={20} w={450} h={176} tone="box" />
          <text x={TX} y={50} fontSize={17} fontWeight={700} className="f-label">
            {a.id} · {a.level} · {methodLabel(a.id).toLowerCase()}
          </text>
          <HiText x={TX} y={AY} size={SZ} lh={LH} layout={la} marks={mA} />
          <Shape x={6} y={264} w={450} h={150} tone="box" />
          <text x={TX} y={294} fontSize={17} fontWeight={700} className="f-label">
            {b.id} · {b.level} · {methodLabel(b.id).toLowerCase()}
          </text>
          <HiText x={TX} y={BY} size={SZ} lh={LH} layout={lb} marks={mB} />
          <Arrow id={id} d="M 120 262 L 120 200" />
          <text x={132} y={230} dominantBaseline="central" fontSize={16} className="f-muted">
            derived from
          </text>
          <Shape x={540} y={136} w={314} h={196} tone="warn" />
          <Stack
            x={556}
            y={234}
            anchor="start"
            rows={[
              { t: `${u.id} · ${u.kind}`, size: 18, weight: 700 },
              ...wr(u.name, 280, 17),
              { t: 'owner:', size: 16, ink: 'muted' },
              ...wr(u.owner, 280, 17),
              {
                t: 'close by the requirements baseline',
                size: 16.5,
                ink: 'muted',
              },
            ]}
          />
          <Arrow id={id} d={`M ${ax} ${ay} C ${ax + 60} ${ay}, 480 200, 536 200`} tone="warn" dashed width={2.2} />
          <Arrow id={id} d={`M ${bx} ${by} L 486 ${by} C 512 ${by}, 506 284, 536 284`} tone="warn" dashed width={2.2} />
          <text x={430} y={456} textAnchor="middle" fontSize={17.5} fontStyle="italic" className="f-label">
            a negative is hard to prove; the positive hold can be demonstrated
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.6 verification methods
export function MethodsFigure({ alt }: { alt: string }) {
  const cards: {
    req: string
    text: string
    icon: (cx: number, cy: number) => ReactNode
  }[] = [
    {
      req: 'REQ-STK-007',
      text: 'step-free route at every vertiport',
      icon: (cx, cy) => (
        <>
          <path d={`M ${cx - 30} ${cy} Q ${cx} ${cy - 26} ${cx + 30} ${cy} Q ${cx} ${cy + 26} ${cx - 30} ${cy} Z`} style={ICON} />
          <circle cx={cx} cy={cy} r={9} style={ICON} />
        </>
      ),
    },
    {
      req: 'REQ-STK-004',
      text: 'capacity ≥ 300 trips/day',
      icon: (cx, cy) => (
        <>
          <path d={`M ${cx - 28} ${cy - 24} L ${cx - 28} ${cy + 22} L ${cx + 30} ${cy + 22}`} style={ICON} />
          <path d={`M ${cx - 20} ${cy + 12} L ${cx - 4} ${cy - 2} L ${cx + 8} ${cy + 4} L ${cx + 26} ${cy - 18}`} style={{ ...ICON, stroke: 'var(--wb-accent)' }} />
        </>
      ),
    },
    {
      req: 'REQ-STK-006',
      text: 'dispatch blocked with an open no-go fault',
      icon: (cx, cy) => (
        <>
          <rect x={cx - 32} y={cy - 22} width={64} height={42} rx={4} style={ICON} />
          <path
            d={`M ${cx - 8} ${cy - 11} L ${cx + 12} ${cy - 1} L ${cx - 8} ${cy + 9} Z`}
            style={{
              ...ICON,
              fill: 'var(--wb-accent)',
              stroke: 'var(--wb-accent)',
            }}
          />
          <path d={`M ${cx - 14} ${cy + 28} L ${cx + 14} ${cy + 28}`} style={ICON} />
        </>
      ),
    },
    {
      req: 'REQ-SYS-001',
      text: 'charge time ≤ 20 min',
      icon: (cx, cy) => (
        <>
          <circle cx={cx} cy={cy + 4} r={22} style={ICON} />
          <path d={`M ${cx} ${cy + 4} L ${cx + 10} ${cy - 8}`} style={{ ...ICON, stroke: 'var(--wb-accent)' }} />
          <path d={`M ${cx - 6} ${cy - 24} L ${cx + 6} ${cy - 24}`} style={ICON} />
        </>
      ),
    },
  ]
  return (
    <Svg w={860} h={410} alt={alt}>
      {() => (
        <>
          {cards.map((c, i) => {
            const x = 6 + i * 214
            const cx = x + 102
            return (
              <g key={c.req}>
                <Shape x={x} y={10} w={204} h={276} tone="box" />
                {c.icon(cx, 62)}
                <text x={cx} y={124} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={700} className="f-label">
                  {methodLabel(c.req)}
                </text>
                <text x={cx} y={158} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={700} className="f-accent-ink">
                  {c.req}
                </text>
                <Lines x={cx} y={220} lines={wrap(c.text, 176, 17)} size={17} />
              </g>
            )
          })}
          <Card x={6} y={304} w={530} h={96} tone="later" lines={['Certification: by an outside authority (SEBoK),', 'e.g. airworthiness']} size={17} />
          <Card x={556} y={304} w={298} h={96} tone="panel" lines={['inspection =', 'DoD ‘examination’']} size={17} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.7 two chains (full width)
export function TwoChainsFigure({ alt }: { alt: string }) {
  const NW = 320
  const NH = 100
  const ROWS = [28, 174, 320, 466]
  const CX = [20, 640]
  const CALL: Record<string, string> = {
    'REQ-STK-001': 'A-001: attraction halves at 15 min',
    'REQ-SYS-005': 'a negligible part of the 15 min budget',
    'REQ-STK-010': 'exceeding trips protection or incurs penalties',
    'REQ-SYS-010': 'enforced in the system, not by procedure',
  }
  const u = uncertainty('U-002')
  const UX = 1222
  const UY = 318
  const UH = 200
  const nodeRows = (eid: string): { rows: Row[]; tone: Tone } => {
    if (eid.startsWith('NEED-'))
      return {
        rows: [{ t: eid, size: 18, weight: 700 }, ...wr(need(eid).name, NW - 28)],
        tone: 'soft',
      }
    if (eid.startsWith('CAP-'))
      return {
        rows: [{ t: eid, size: 18, weight: 700 }, ...wr(capability(eid).name, NW - 28)],
        tone: 'panel',
      }
    const r = requirement(eid)
    return {
      rows: [
        { t: eid, size: 18, weight: 700 },
        ...wr(r.name, NW - 28),
        {
          t: `method: ${methodLabel(eid).toLowerCase()}`,
          size: 16,
          ink: 'muted',
        },
      ],
      tone: 'box',
    }
  }
  return (
    <Svg w={1440} h={620} alt={alt}>
      {(id) => (
        <>
          <line x1={608} y1={20} x2={608} y2={570} className="f-divider" />
          {CHAINS_S2.map((chain, ci) =>
            chain.map((eid, k) => {
              const x = CX[ci]
              const y = ROWS[k]
              const n = nodeRows(eid)
              const tbx = eid.startsWith('REQ-') ? requirement(eid).tbx : undefined
              const gapY = k > 0 ? (ROWS[k - 1] + NH + y) / 2 : 0
              return (
                <g key={eid}>
                  <RowCard x={x} y={y} w={NW} h={NH} rows={n.rows} tone={n.tone} />
                  {k > 0 && <Arrow id={id} d={`M ${x + NW / 2} ${y - 2} L ${x + NW / 2} ${ROWS[k - 1] + NH + 4}`} tone="accent" width={2.4} />}
                  {CALL[eid] && (
                    <g>
                      <line x1={x + NW / 2 + 6} y1={gapY} x2={x + 336} y2={gapY} className="f-divider" style={{ strokeWidth: 1.5 }} />
                      <Card x={x + 336} y={gapY - 28} w={224} h={56} tone="panel" lines={wrap(CALL[eid], 204, 17)} size={17} />
                    </g>
                  )}
                  {tbx && (
                    <g>
                      <line x1={x + NW} y1={y + NH / 2} x2={x + NW + 8} y2={y + NH / 2} style={{ stroke: 'var(--wb-warn)', strokeWidth: 2 }} />
                      <line x1={x + NW + 80} y1={y + NH / 2} x2={UX} y2={y + NH / 2} style={{ stroke: 'var(--wb-warn)', strokeWidth: 2 }} strokeDasharray="6 4" />
                      <rect x={x + NW + 8} y={y + NH / 2 - 13} width={72} height={26} rx={13} style={WARN_FILL} />
                      <text x={x + NW + 44} y={y + NH / 2} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} style={WARN_INK}>
                        {tbx}
                      </text>
                    </g>
                  )}
                </g>
              )
            }),
          )}
          <Shape x={UX} y={UY} w={212} h={UH} tone="warn" />
          <Stack x={UX + 12} y={UY + UH / 2} anchor="start" rows={[{ t: `${u.id} · ${u.kind}`, size: 18, weight: 700 }, ...wr(u.name, 184, 17), { t: 'owner:', size: 16, ink: 'muted' }, ...wr(u.owner, 184, 17)]} />
          <text x={20} y={604} dominantBaseline="central" fontSize={17} className="f-muted">
            Arrows point from each element to its parent · call-outs: the reasoning in each rationale (shortened)
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.8 the corrected noise need flows down
export function NoiseSplitFigure({ alt }: { alt: string }) {
  const n = need('NEED-003')
  const s11 = requirement('REQ-STK-011')
  const u3 = uncertainty('U-003')
  const C1 = 211
  const C2 = 590
  return (
    <Svg w={860} h={580} alt={alt}>
      {(id) => (
        <>
          <RowCard
            x={170}
            y={8}
            w={520}
            h={64}
            tone="soft"
            strong
            rows={[
              { t: n.id, size: 18, weight: 700 },
              { t: n.name, size: 17 },
            ]}
          />
          <Arrow id={id} d="M 400 74 C 400 96, 211 92, 211 114" tone="accent" width={2.4} />
          <Arrow id={id} d="M 460 74 C 460 96, 649 92, 649 114" tone="accent" width={2.4} />
          <Card x={6} y={118} w={410} h={66} tone="soft" lines={['level of each event:', '65 dBA at the pad edge']} size={17} weight={600} />
          <Card x={444} y={118} w={410} h={66} tone="soft" lines={['number of events before 07:00 and', 'after 20:00: the agreed cap']} size={17} weight={600} />
          <rect x={438} y={206} width={418} height={326} rx={9} fill="none" className="f-divider" style={{ strokeWidth: 1.6 }} />
          {/* column 1: the reference chain */}
          <Arrow id={id} d={`M ${C1} 186 L ${C1} 218`} />
          <RowCard
            x={C1 - 150}
            y={222}
            w={300}
            h={66}
            rows={[
              { t: 'REQ-STK-002', size: 17, weight: 700 },
              { t: requirement('REQ-STK-002').name, size: 17 },
            ]}
          />
          <Arrow id={id} d={`M ${C1} 290 L ${C1} 328`} />
          <RowCard
            x={C1 - 150}
            y={332}
            w={300}
            h={66}
            rows={[
              { t: 'REQ-SYS-002', size: 17, weight: 700 },
              { t: requirement('REQ-SYS-002').name, size: 17 },
            ]}
          />
          <RowCard
            x={C1 - 175}
            y={430}
            w={350}
            h={70}
            tone="panel"
            rows={[
              { t: 'measured by MOE-003', size: 17, weight: 700 },
              { t: measure('MOE-003').name, size: 17 },
            ]}
          />
          {/* column 2: the proposed chain */}
          <Arrow id={id} d={`M ${C2} 186 L ${C2} 218`} />
          <RowCard x={C2 - 140} y={222} w={280} h={84} dashed rows={[{ t: `${s11.id} (${s11.provenance})`, size: 17, weight: 700 }, ...wr(s11.name, 240, 17)]} />
          <line x1={C2 + 140} y1={250} x2={C2 + 150} y2={250} style={{ stroke: 'var(--wb-warn)', strokeWidth: 2 }} />
          <rect x={C2 + 150} y={237} width={78} height={26} rx={13} style={WARN_FILL} />
          <text x={C2 + 189} y={250} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} style={WARN_INK}>
            {s11.tbx}
          </text>
          <Arrow id={id} d={`M ${C2 + 189} 264 L ${C2 + 189} 290`} tone="warn" width={2} />
          <Card x={C2 + 150} y={294} w={104} h={52} tone="warn" lines={[u3.id]} size={17} weight={700} />
          <Arrow id={id} d={`M ${C2} 308 L ${C2} 328`} />
          <RowCard
            x={C2 - 140}
            y={332}
            w={280}
            h={66}
            dashed
            rows={[
              { t: 'REQ-SYS-011 (proposed)', size: 17, weight: 700 },
              { t: requirement('REQ-SYS-011').name, size: 17 },
            ]}
          />
          <RowCard
            x={C2 - 140}
            y={430}
            w={350}
            h={84}
            tone="panel"
            dashed
            rows={[
              {
                t: `measured by MOE-007 (${measure('MOE-007').provenance})`,
                size: 17,
                weight: 700,
              },
              ...wr(measure('MOE-007').name, 326, 17),
            ]}
          />
          <text x={647} y={556} textAnchor="middle" dominantBaseline="central" fontSize={17} fontStyle="italic" className="f-muted">
            the reference set had an empty box here
          </text>
          <text x={C1} y={556} textAnchor="middle" dominantBaseline="central" fontSize={16} className="f-muted">
            dashed: proposed, instructor to confirm
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.9 critique and rewrite (full width)
export function CritiqueTableFigure({ alt }: { alt: string }) {
  const cols = [
    { x: 14, w: 58, h: '' },
    { x: 72, w: 430, h: 'Draft' },
    { x: 502, w: 520, h: 'Defect (characteristic)' },
    { x: 1022, w: 196, h: 'Caught by' },
    { x: 1218, w: 208, h: 'Rewrite' },
  ]
  const Y0 = 56
  const RH = 92
  return (
    <Svg w={1440} h={660} alt={alt}>
      {() => (
        <>
          <Shape x={14} y={10} w={1412} h={42} tone="panel" rx={4} />
          {cols.map((c) => (
            <text key={c.x} x={c.x + 12} y={31} dominantBaseline="central" fontSize={18} fontWeight={700} className="f-label">
              {c.h}
            </text>
          ))}
          {CRITIQUE.map((f, i) => {
            const y = Y0 + i * RH
            const judged = f.catchBy === 'engineering judgment'
            const cy = y + RH / 2
            return (
              <g key={f.id}>
                {judged ? <Shape x={14} y={y + 3} w={1412} h={RH - 6} tone="soft" strong rx={5} /> : <line x1={14} y1={y + RH} x2={1426} y2={y + RH} className="f-divider" />}
                <text x={26} y={cy} dominantBaseline="central" fontSize={18} fontWeight={700} className="f-label">
                  {f.id}
                </text>
                <Lines x={cols[1].x + 12} y={cy} lines={wrap(f.draft, cols[1].w - 28, 17)} anchor="start" size={17} lh={1.22} />
                <Stack x={cols[2].x + 12} y={cy} anchor="start" lh={1.22} rows={[{ t: f.characteristic, size: 17, weight: 700 }, ...wr(f.defect, cols[2].w - 28, 17, { ink: 'muted' })]} />
                <Lines x={cols[3].x + 12} y={cy} lines={wrap(f.catchBy, cols[3].w - 24, 17)} anchor="start" size={17} weight={judged ? 700 : 500} />
                <Stack x={cols[4].x + 12} y={cy} anchor="start" lh={1.2} rows={[{ t: f.rewriteId, size: 17, weight: 700, ink: 'accent' }, ...wr(requirement(f.rewriteId).name, cols[4].w - 30, 17)]} />
              </g>
            )
          })}
          <rect x={14} y={630} width={30} height={20} rx={4} className="f-soft" />
          <g className="f-soft">
            <rect x={14} y={630} width={30} height={20} rx={4} className="f-shape" style={{ strokeWidth: 3 }} />
          </g>
          <text x={54} y={640} dominantBaseline="central" fontSize={17} className="f-label">
            outlined row: caught by engineering judgment in review; the other rows: a word-level check finds the defect
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.10 orphans and childless parents
export function OrphanChildlessFigure({ alt }: { alt: string }) {
  const BW = 100
  const BH = 50
  const N: Record<string, [number, number]> = {
    'N-1': [300, 70],
    'N-2': [480, 70],
    'N-3': [660, 70],
  }
  const S: Record<string, [number, number]> = {
    'S-1': [300, 225],
    'S-2': [480, 225],
    'S-3': [660, 225],
  }
  const Y: Record<string, [number, number]> = {
    'Y-1': [270, 380],
    'Y-2': [420, 380],
    'Y-3': [570, 380],
    'Y-4': [740, 380],
  }
  const all = { ...N, ...S, ...Y }
  const links: [string, string][] = [
    ['S-1', 'N-1'],
    ['S-2', 'N-1'],
    ['S-3', 'N-2'],
    ['Y-1', 'S-1'],
    ['Y-2', 'S-2'],
    ['Y-3', 'S-3'],
  ]
  return (
    <Svg w={860} h={520} alt={alt}>
      {(id) => (
        <>
          <Lines x={16} y={95} lines={['Needs']} anchor="start" size={18} weight={700} />
          <Lines x={16} y={250} lines={['Stakeholder', 'requirements']} anchor="start" size={18} weight={700} />
          <Lines x={16} y={405} lines={['System', 'requirements']} anchor="start" size={18} weight={700} />
          {links.map(([c, p]) => {
            const [cx, cy] = all[c]
            const [px, py] = all[p]
            return <Arrow key={c + p} id={id} d={`M ${cx} ${cy - 2} L ${px} ${py + BH + 4}`} />
          })}
          {Object.entries(all).map(([k, [x, y]]) => (
            <Card key={k} x={x - BW / 2} y={y} w={BW} h={BH} tone={k.startsWith('N') ? 'soft' : 'box'} lines={[k]} size={18} weight={600} />
          ))}
          <ellipse cx={660} cy={95} rx={80} ry={46} fill="none" style={{ stroke: 'var(--wb-warn)', strokeWidth: 2.6 }} strokeDasharray="7 4" />
          <text x={660} y={26} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} style={WARN_INK}>
            childless parent
          </text>
          <ellipse cx={740} cy={405} rx={80} ry={46} fill="none" style={{ stroke: 'var(--wb-warn)', strokeWidth: 2.6 }} strokeDasharray="7 4" />
          <text x={740} y={474} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} style={WARN_INK}>
            orphan (no source)
          </text>
          <text x={16} y={504} dominantBaseline="central" fontSize={16} className="f-muted">
            arrow: traces to its source
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.11 the AeroLink trace audit (full width)
/** Need names shortened by hand to fit the matrix rows (full names: need(id).name). */
const NEED_SHORT: Record<string, string> = {
  'NEED-001': 'Short wait to board',
  'NEED-002': 'Flight within safety limits',
  'NEED-003': 'Noise within the agreement',
  'NEED-004': 'Pads not limited by turnaround',
  'NEED-005': 'Capacity grows with demand',
  'NEED-006': 'Fire warning and access',
  'NEED-007': 'Known aircraft condition',
  'NEED-008': 'Step-free travel',
  'NEED-009': 'Flight intent known to ANSP',
  'NEED-010': 'Load within grid connection',
  'NEED-011': 'Notice and a way onward',
  'NEED-012': 'Sites fit the land-use plan',
  'NEED-013': 'Manageable workload',
  'NEED-014': 'Risk measurable from evidence',
  'NEED-015': 'Full fare before booking',
  'NEED-016': 'Sites linked to transport',
  'NEED-017': 'Competitive fares',
}
export function TraceMatrixFigure({ alt }: { alt: string }) {
  const MX = 360
  const CW = 46
  const MY = 84
  const RH = 26
  const stks = STAKEHOLDER_REQUIREMENTS
  const childless = new Set(childlessStakeholderRequirements())
  const W = stks.length * CW
  const SY = MY + NEEDS.length * RH + 30
  return (
    <Svg w={1440} h={720} alt={alt}>
      {() => (
        <>
          <text x={MX + W / 2} y={24} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
            Stakeholder requirements REQ-STK-001 … {stks[stks.length - 1].id.slice(-3)} (column: last three digits)
          </text>
          {stks.map((r, j) => (
            <text key={r.id} x={MX + j * CW + CW / 2} y={64} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={600} className="f-label">
              {r.id.slice(-3)}
              {r.provenance === 'proposed' ? <tspan fontSize={15}>†</tspan> : ''}
            </text>
          ))}
          {NEEDS.map((n, i) => {
            const y = MY + i * RH
            const gap = n.id === DELIBERATE_REQ_GAP.need
            return (
              <g key={n.id}>
                {gap && <rect x={10} y={y + 1} width={MX + W - 10} height={RH - 2} rx={3} style={WARN_FILL} strokeDasharray="6 3" />}
                <text x={16} y={y + RH / 2} dominantBaseline="central" fontSize={17} fontWeight={gap ? 700 : 500} className="f-label">
                  <tspan fontWeight={700}>{n.id}</tspan> {NEED_SHORT[n.id] ?? n.name}
                </text>
                {stks.map((r, j) => (r.parents.includes(n.id) ? <rect key={r.id} x={MX + j * CW + 9} y={y + 4} width={CW - 18} height={RH - 8} rx={2} style={{ fill: 'var(--wb-accent)' }} /> : null))}
                {gap && <Lines x={MX + W + 14} y={y + RH / 2 + 10} anchor="start" size={17} weight={700} ink="warn" lines={['← deliberate gap', `(exposed by ${DELIBERATE_REQ_GAP.exposedBy})`]} />}
              </g>
            )
          })}
          {Array.from({ length: stks.length + 1 }, (_, j) => (
            <line key={`v${j}`} x1={MX + j * CW} y1={MY} x2={MX + j * CW} y2={MY + NEEDS.length * RH} className="f-grid" />
          ))}
          {Array.from({ length: NEEDS.length + 1 }, (_, i) => (
            <line key={`h${i}`} x1={MX} y1={MY + i * RH} x2={MX + W} y2={MY + i * RH} className="f-grid" />
          ))}
          <text x={16} y={SY + 17} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
            REQ-SYS children
          </text>
          <text x={16} y={SY + 57} dominantBaseline="central" fontSize={17} fontWeight={700} className="f-label">
            childless: disposition
          </text>
          {stks.map((r, j) => {
            const n = SYSTEM_REQUIREMENTS.filter((s) => s.parents.includes(r.id)).length
            const x = MX + j * CW
            const kind = childless.has(r.id) ? (STK_DISPOSITION_FORM[r.id] === 'no-child' ? 'R' : 'O') : ''
            return (
              <g key={r.id}>
                <rect x={x + 2} y={SY} width={CW - 4} height={34} rx={3} className="f-shape" />
                <text x={x + CW / 2} y={SY + 17} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={600} className={n ? 'f-label' : 'f-muted'}>
                  {n}
                </text>
                {kind === 'O' && <rect x={x + 3} y={SY + 42} width={CW - 6} height={30} rx={3} style={WARN_FILL} strokeDasharray="5 3" />}
                {kind === 'R' && <rect x={x + 3} y={SY + 42} width={CW - 6} height={30} rx={3} className="f-panel" style={{ strokeWidth: 2 }} />}
                {kind && (
                  <text x={x + CW / 2} y={SY + 57} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={800} {...inkProps(kind === 'O' ? 'warn' : 'ink')}>
                    {kind}
                  </text>
                )}
              </g>
            )
          })}
          <rect x={16} y={SY + 96} width={24} height={16} rx={2} style={{ fill: 'var(--wb-accent)' }} />
          <text x={48} y={SY + 104} dominantBaseline="central" fontSize={17} className="f-label">
            filled: the requirement names the need as a parent · † proposed requirement, instructor to confirm · amber row: a need with no requirement
          </text>
          <text x={16} y={SY + 136} dominantBaseline="central" fontSize={17} className="f-label">
            <tspan fontWeight={800} style={WARN_INK}>
              O
            </tspan>
            {' record why not, open item: allocate later · '}
            <tspan fontWeight={800}>R</tspan>
            {' record why not, no child needed: verified at service level'}
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.12 requirement V&V
export function VvGridFigure({ alt }: { alt: string }) {
  const X = [214, 538]
  const CWD = 316
  return (
    <Svg w={860} h={480} alt={alt}>
      {() => (
        <>
          <Card x={X[0]} y={10} w={CWD} h={50} tone="panel" lines={['verification']} size={19} weight={700} />
          <Card x={X[1]} y={10} w={CWD} h={50} tone="panel" lines={['validation']} size={19} weight={700} />
          <Card x={6} y={70} w={198} h={180} tone="soft" strong lines={['the', 'requirements']} size={19} weight={700} />
          <rect x={22} y={206} width={166} height={30} rx={15} style={{ fill: 'var(--wb-accent)' }} />
          <text x={105} y={221} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={700} style={{ fill: 'var(--wb-panel)' }}>
            this week
          </text>
          <Card x={X[0]} y={70} w={CWD} h={180} tone="soft" strong lines={['Are they well formed?']} size={19} weight={600} />
          <Card x={X[1]} y={70} w={CWD} h={180} tone="soft" strong lines={wrap('Are they the right requirements, faithful to the needs and achievable?', 280, 19)} size={19} weight={600} />
          <Card x={6} y={262} w={198} h={130} tone="later" lines={['the system']} size={19} weight={700} />
          <Card x={X[0]} y={262} w={CWD} h={130} tone="later" lines={['Week 12:', 'system verification']} size={19} />
          <Card x={X[1]} y={262} w={CWD} h={130} tone="later" lines={['Week 12:', 'system validation']} size={19} />
          <text x={430} y={440} textAnchor="middle" dominantBaseline="central" fontSize={17.5} fontStyle="italic" className="f-label">
            SEBoK: requirement V&amp;V is not system V&amp;V
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.13 objectives, MOEs, MOPs
export function MeasuresPyramidFigure({ alt }: { alt: string }) {
  const CX = 270
  const LH = 112
  const G = 6
  const TOP = 16
  const hw = (y: number) => 92 + ((y - TOP) / (4 * LH + 3 * G)) * 168
  const levels: { rows: Row[]; tone: Tone }[] = [
    { rows: [{ t: 'Objective (MGO)', size: 18, weight: 700 }], tone: 'soft' },
    {
      rows: [
        { t: 'MOE: mission success,', size: 18, weight: 700 },
        { t: 'users’ view', size: 18, weight: 700 },
      ],
      tone: 'box',
    },
    {
      rows: [
        { t: 'MOP: a system characteristic,', size: 17.5, weight: 700 },
        { t: 'measured under specified', size: 17.5 },
        { t: 'conditions', size: 17.5 },
      ],
      tone: 'box',
    },
    {
      rows: [
        { t: 'TPM', size: 18, weight: 700, ink: 'muted' },
        { t: 'Week 3', size: 17, ink: 'muted' },
      ],
      tone: 'later',
    },
  ]
  const o = OBJECTIVES.find((x) => x.id === 'MGO-005')!
  const e = measure('MOE-001')
  const lvY = (i: number) => TOP + i * (LH + G)
  const EX = 534
  const EW = 280
  return (
    <Svg w={860} h={500} alt={alt}>
      {(id) => (
        <>
          {levels.map((l, i) => {
            const t = lvY(i)
            const b = t + LH
            const pts = `${CX - hw(t)},${t} ${CX + hw(t)},${t} ${CX + hw(b)},${b} ${CX - hw(b)},${b}`
            const style =
              l.tone === 'soft'
                ? {
                    fill: 'var(--wb-accent-soft)',
                    stroke: 'var(--wb-accent)',
                    strokeWidth: 2,
                  }
                : undefined
            return (
              <g key={i}>
                <polygon points={pts} className={l.tone === 'later' ? 'f-env' : l.tone === 'soft' ? undefined : 'f-shape'} style={style} strokeDasharray={l.tone === 'later' ? '6 4' : undefined} />
                <Stack x={CX} y={t + LH / 2} rows={l.rows} />
                {i < 3 && <line x1={CX + hw(t + LH / 2) + 6} y1={t + LH / 2} x2={EX - 6} y2={t + LH / 2} className="f-divider" style={{ strokeWidth: 1.5 }} />}
              </g>
            )
          })}
          <RowCard x={EX} y={lvY(0) + 16} w={EW} h={80} tone="soft" rows={[{ t: o.id, size: 17, weight: 700 }, ...wr(o.name, EW - 24, 17)]} />
          <RowCard x={EX} y={lvY(1) + 10} w={EW} h={92} rows={[{ t: e.id, size: 17, weight: 700 }, ...wr(e.name, EW - 24, 17)]} />
          {['MOP-001', 'MOP-002'].map((m, k) => (
            <RowCard
              key={m}
              x={EX}
              y={lvY(2) + 2 + k * 56}
              w={EW}
              h={52}
              rows={[
                { t: m, size: 16, weight: 700 },
                { t: measure(m).name, size: 16 },
              ]}
            />
          ))}
          <Arrow id={id} d={`M ${EX + EW} ${lvY(2) + 28} L ${EX + EW + 22} ${lvY(2) + 28} L ${EX + EW + 22} ${lvY(1) + 70} L ${EX + EW + 4} ${lvY(1) + 70}`} tone="accent" width={2} />
          <path d={`M ${EX + EW} ${lvY(2) + 84} L ${EX + EW + 22} ${lvY(2) + 84} L ${EX + EW + 22} ${lvY(2) + 28}`} className="f-arrow accent" fill="none" style={{ strokeWidth: 2 }} />
          <Arrow id={id} d={`M ${EX + EW} ${lvY(1) + 40} L ${EX + EW + 22} ${lvY(1) + 40} L ${EX + EW + 22} ${lvY(0) + 56} L ${EX + EW + 4} ${lvY(0) + 56}`} tone="accent" width={2} />
          <text x={EX + EW + 36} y={lvY(1) + 56} transform={`rotate(-90 ${EX + EW + 36} ${lvY(1) + 56})`} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={600} className="f-accent-ink">
            measures
          </text>
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.14 the measures, linked (full width)
export function MeasuresLinksFigure({ alt }: { alt: string }) {
  const COL = {
    A: [16, 240],
    B: [396, 260],
    C: [796, 260],
    D: [1196, 230],
  } as const
  type Node = {
    id: string
    col: keyof typeof COL
    y: number
    h: number
    rows: Row[]
    dashed?: boolean
    tone?: Tone
  }
  const nameOf = (eid: string) =>
    eid.startsWith('MGO-') ? OBJECTIVES.find((o) => o.id === eid)!.name : eid.startsWith('NEED-') ? need(eid).name : eid.startsWith('CAP-') ? capability(eid).name : eid.startsWith('REQ-') ? requirement(eid).name : measure(eid).name
  const basic = (eid: string, col: keyof typeof COL, y: number, h: number, extra: Row[] = [], dashed = false, tone: Tone = 'box'): Node => ({
    id: eid,
    col,
    y,
    h,
    dashed,
    tone,
    rows: [{ t: eid, size: 17, weight: 700 }, ...wr(nameOf(eid), COL[col][1] - 24, 17), ...extra],
  })
  const ds = (eid: string, w: number) =>
    wr(`data: ${measure(eid).dataSource}`, w - 24, 16, {
      ink: 'muted',
      italic: true,
    })
  const nodes: Node[] = [
    basic('MGO-005', 'A', 34, 84, [], false, 'soft'),
    basic('NEED-001', 'A', 128, 84, [], false, 'soft'),
    basic('CAP-001', 'A', 222, 84, [], false, 'panel'),
    basic('MOE-001', 'B', 92, 160, ds('MOE-001', 260)),
    basic('MOP-001', 'C', 36, 120, ds('MOP-001', 260)),
    basic('MOP-002', 'C', 172, 128, ds('MOP-002', 260)),
    basic('REQ-SYS-005', 'D', 34, 84),
    basic('REQ-SYS-001', 'D', 128, 84),
    basic('REQ-STK-005', 'D', 222, 84),
    basic('NEED-003', 'A', 424, 84, [], false, 'soft'),
    basic('MOE-003', 'B', 360, 104, [{ t: 'per event · reference', size: 16, ink: 'muted' }]),
    basic('MOE-007', 'B', 478, 104, [{ t: 'event cap · proposed', size: 16, ink: 'muted' }], true),
    basic('MOP-004', 'C', 360, 104),
    basic('MOP-010', 'C', 478, 104, [{ t: 'proposed', size: 16, ink: 'muted' }], true),
  ]
  const at = new Map(nodes.map((n) => [n.id, n]))
  const links = nodes.flatMap((n) =>
    n.id.startsWith('MO')
      ? measure(n.id)
          .measures.filter((t) => at.has(t))
          .map((t) => [n.id, t] as const)
      : [],
  )
  const xL = (n: Node) => COL[n.col][0]
  const xR = (n: Node) => COL[n.col][0] + COL[n.col][1]
  const cy = (n: Node) => n.y + n.h / 2
  // spread arrow ends on each side of a node
  const outCount = new Map<string, number>()
  const outIdx = links.map(([s, t]) => {
    const side = `${s}:${xL(at.get(t)!) < xL(at.get(s)!) ? 'L' : 'R'}`
    const k = outCount.get(side) ?? 0
    outCount.set(side, k + 1)
    return { side, k }
  })
  // one "measures" label per column gap and cluster, above the arrows, with the arrow direction
  const gapLabels = [
    ...new Map(
      links.map(([s, t]) => {
        const S = at.get(s)!
        const T = at.get(t)!
        const left = xL(T) < xL(S)
        const gx = left ? (xR(T) + xL(S)) / 2 : (xR(S) + xL(T)) / 2
        const cluster = S.y > 320 ? 2 : 1
        return [`${gx}:${cluster}`, { gx, y: cluster === 1 ? 14 : 338, left }] as const
      }),
    ).values(),
  ]
  return (
    <Svg w={1440} h={600} alt={alt}>
      {(id) => (
        <>
          <line x1={16} y1={322} x2={1426} y2={322} className="f-divider" />
          {gapLabels.map((g) => (
            <text key={`${g.gx}-${g.y}`} x={g.gx} y={g.y} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={700} className="f-accent-ink">
              {g.left ? '← measures' : 'measures →'}
            </text>
          ))}
          {links.map(([s, t], i) => {
            const S = at.get(s)!
            const T = at.get(t)!
            const left = xL(T) < xL(S)
            const n = outCount.get(outIdx[i].side)!
            const sy = cy(S) + (outIdx[i].k - (n - 1) / 2) * 14
            const sx = left ? xL(S) : xR(S)
            const tx = left ? xR(T) + 4 : xL(T) - 4
            const ty = cy(T)
            const mx = (sx + tx) / 2
            return <Arrow key={`${s}-${t}`} id={id} d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`} tone={S.dashed ? 'muted' : 'ink'} dashed={S.dashed} />
          })}
          {nodes.map((n) => (
            <RowCard key={n.id} x={COL[n.col][0]} y={n.y} w={COL[n.col][1]} h={n.h} rows={n.rows} tone={n.tone} dashed={n.dashed} />
          ))}
          <Shape x={1196} y={400} w={230} h={150} tone="panel" />
          <Stack
            x={1210}
            y={475}
            anchor="start"
            rows={[
              { t: 'arrow: measures', size: 16.5, weight: 700 },
              { t: 'solid: reference', size: 16.5 },
              { t: 'dashed: proposed,', size: 16.5 },
              { t: 'instructor to confirm', size: 16.5 },
              { t: 'links among the', size: 16, ink: 'muted' },
              { t: 'elements shown', size: 16, ink: 'muted' },
            ]}
          />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.15 where Week 2 goes next (full width)
export function BridgeFigure({ alt }: { alt: string }) {
  const left = ['Scenarios', 'Requirements', 'Verification methods', 'Measures', 'TBDs']
  const LY = (i: number) => 52 + i * 94
  const LH = 70
  const RX = 720
  const RW = 560
  const right = [
    {
      y: 34,
      h: 86,
      title: 'Week 10',
      lines: ['use cases and actions'],
      v2: true,
    },
    {
      y: 136,
      h: 86,
      title: 'Week 9',
      lines: ['requirement definitions and usages'],
      v2: true,
    },
    {
      y: 238,
      h: 86,
      title: 'Week 12',
      lines: ['verification cases'],
      v2: true,
    },
    {
      y: 340,
      h: 166,
      title: 'Week 3',
      lines: ['TPMs on risky requirements', 'trade criteria from MOEs', 'TBDs → unknowns and risks'],
      v2: false,
    },
  ]
  const lineY = (b: (typeof right)[number], k: number) => (b.v2 ? b.y + 58 : b.y + 56 + k * 34)
  const links: [number, number, number][] = [
    [0, 0, 0],
    [1, 1, 0],
    [1, 3, 0],
    [2, 2, 0],
    [3, 3, 1],
    [4, 3, 2],
  ]
  return (
    <Svg w={1300} h={520} alt={alt}>
      {(id) => (
        <>
          <text x={20} y={24} dominantBaseline="central" fontSize={19} fontWeight={700} className="f-label">
            This week’s artifacts
          </text>
          {left.map((l, i) => (
            <Card key={l} x={20} y={LY(i)} w={270} h={LH} tone="soft" lines={[l]} size={19} weight={600} />
          ))}
          {links.map(([li, ri, k]) => {
            const sy = LY(li) + LH / 2
            const ty = lineY(right[ri], k)
            return <Arrow key={`${li}-${ri}`} id={id} d={`M 294 ${sy} C 500 ${sy}, 520 ${ty}, ${RX - 6} ${ty}`} tone="accent" width={2.2} />
          })}
          {right.map((b) => (
            <g key={b.title}>
              <Shape x={RX} y={b.y} w={RW} h={b.h} tone={b.v2 ? 'box' : 'soft'} strong={!b.v2} />
              <text x={RX + 18} y={b.y + 26} dominantBaseline="central" fontSize={19} fontWeight={700} className="f-label">
                {b.title}
              </text>
              {b.v2 && (
                <text x={RX + RW - 16} y={b.y + 26} textAnchor="end" dominantBaseline="central" fontSize={16} fontStyle="italic" className="f-muted">
                  SysML v2 (named only)
                </text>
              )}
              {b.lines.map((l, k) => (
                <text key={l} x={RX + 18} y={lineY(b, k)} dominantBaseline="central" fontSize={18} className="f-label">
                  {l}
                </text>
              ))}
            </g>
          ))}
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.16 the Week 2 additions to the Team Record
export function RecordPartsW2Figure({ alt }: { alt: string }) {
  const kinds = SCENARIO_KINDS.map((k) => k.label.toLowerCase()).join(', ')
  const mins: Record<string, string[]> = {
    conops: [],
    scenarios: [`≥ ${MIN.scenarios}: ${kinds};`, `≥ ${MIN.alternatesPerScenario} alternate each; both end states`],
    capabilities: [`≥ ${MIN.capabilities} capabilities`],
    requirements: [`≥ ${MIN.requirements}: ≥ ${MIN.stakeholderRequirements} stakeholder, ≥ ${MIN.systemRequirements} system; ≥ ${MIN.types} types`],
    audit: [`≥ ${MIN.moes} MOE, ≥ ${MIN.mops} MOP`],
  }
  const BY = (i: number) => 78 + i * 92
  return (
    <Svg w={860} h={550} alt={alt}>
      {(id) => (
        <>
          <Card x={6} y={10} w={554} h={54} tone="later" lines={['Parts 5–6 updated: needs from discoveries; AI statement']} size={17} />
          {WEEK2_PARTS.map((p, i) => (
            <RowCard
              key={p.id}
              x={6}
              y={BY(i)}
              w={554}
              h={82}
              anchor="start"
              pad={16}
              tone="soft"
              rows={[
                { t: `Part ${p.n} · ${p.title}`, size: 18, weight: 700 },
                ...mins[p.id].map((t) => ({
                  t,
                  size: 16.5,
                  ink: 'muted' as Ink,
                })),
              ]}
            />
          ))}
          <Arrow id={id} d="M 566 300 L 590 300" tone="accent" width={2.4} />
          <Shape x={596} y={78} w={258} h={450} tone="panel" />
          {[0, 1].map((k) => {
            const y = 104 + k * 132
            return (
              <g key={k}>
                <path d={`M 616 ${y} L 650 ${y} L 662 ${y + 12} L 662 ${y + 52} L 616 ${y + 52} Z`} className="f-shape" />
                <path d={`M 650 ${y} L 650 ${y + 12} L 662 ${y + 12}`} className="f-arrow" />
                <Lines x={674} y={y + 26} anchor="start" size={16.5} weight={600} lines={k === 0 ? ['team-NN-week2-', 'record.md'] : ['team-NN-week2-', 'model-inputs.json']} />
              </g>
            )
          })}
          <text x={725} y={210} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={700} className="f-label">
            +
          </text>
          <line x1={612} y1={384} x2={838} y2={384} className="f-divider" />
          <Lines x={725} y={440} lines={['one upload', 'before Week 3', 'Session 1']} size={18} weight={700} ink="accent" />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.17 the scenario clinic card
export function ClinicCardFigure({ alt }: { alt: string }) {
  const fields = ['1 Scenario system of interest', '2 Off-nominal scenario: trigger and failure end state', '3 One actor outside the boundary']
  const box = (x: number, y: number) => <rect x={x} y={y} width={24} height={24} rx={3} className="f-shape" style={{ strokeWidth: 2 }} />
  return (
    <Svg w={860} h={540} alt={alt}>
      {() => (
        <>
          <Shape x={20} y={10} w={820} h={520} tone="box" strong />
          <text x={44} y={46} dominantBaseline="central" fontSize={21} fontWeight={700} className="f-label">
            Scenario clinic · about 80 s per team
          </text>
          {fields.map((f, i) => {
            const y = 104 + i * 58
            const w = textW(f, 18) * 1.08
            return (
              <g key={f}>
                <text x={44} y={y} dominantBaseline="central" fontSize={18} fontWeight={600} className="f-label">
                  {f}
                </text>
                <line x1={Math.min(44 + w + 14, 700)} y1={y + 12} x2={816} y2={y + 12} className="f-axis" style={{ strokeWidth: 1.5 }} />
              </g>
            )
          })}
          <line x1={36} y1={262} x2={824} y2={262} className="f-divider" />
          {CLINIC_CRITERIA.map((c, i) => {
            const y = 300 + i * 44
            return (
              <g key={c}>
                {box(44, y - 12)}
                <text x={82} y={y} dominantBaseline="central" fontSize={18} className="f-label">
                  {c}
                </text>
              </g>
            )
          })}
          <line x1={36} y1={432} x2={824} y2={432} className="f-divider" />
          {box(44, 462)}
          <text x={80} y={474} dominantBaseline="central" fontSize={19} fontWeight={700} className="f-label">
            proceed
          </text>
          {box(230, 462)}
          <text x={266} y={474} dominantBaseline="central" fontSize={19} fontWeight={700} className="f-label">
            revise (reason)
          </text>
          <line x1={420} y1={486} x2={816} y2={486} className="f-axis" style={{ strokeWidth: 1.5 }} />
        </>
      )}
    </Svg>
  )
}

// ------------------------------------------------------------------------------------------------ S2.18 the next seven days (full width)
export function SevenDaysW2Figure({ alt }: { alt: string }) {
  const X0 = 20
  const DW = 180
  const bars: { from: number; to: number; task: string; who: string }[] = [
    {
      from: 1,
      to: 2,
      task: 'ConOps narrative and environment',
      who: 'Architecture',
    },
    {
      from: 1,
      to: 3,
      task: 'scenarios, one owner each, reviewed',
      who: 'each member; V&V reviews',
    },
    {
      from: 3,
      to: 3,
      task: 'discovery log and needs update',
      who: 'Requirements & Compliance',
    },
    {
      from: 3,
      to: 4,
      task: 'capabilities and coverage matrix',
      who: 'Architecture',
    },
    {
      from: 4,
      to: 5,
      task: 'requirements, each member writes ≥ 3',
      who: '≥ 2 each in a team of three; R&C merges',
    },
    {
      from: 6,
      to: 6,
      task: 'trace audit and measures',
      who: 'V&V: audit; AI & Data: measures',
    },
    { from: 6, to: 6, task: 'AI usage statement', who: 'AI & Data' },
    { from: 7, to: 7, task: 'integration review, export, upload', who: 'V&V' },
  ]
  const RY = (i: number) => 58 + i * 54
  return (
    <Svg w={1300} h={500} alt={alt}>
      {() => (
        <>
          {Array.from({ length: 7 }, (_, d) => (
            <g key={d}>
              <text x={X0 + d * DW + DW / 2} y={26} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} className="f-label">
                Day {d + 1}
              </text>
              <line x1={X0 + d * DW} y1={44} x2={X0 + d * DW} y2={492} className="f-divider" />
            </g>
          ))}
          <line x1={X0 + 7 * DW} y1={44} x2={X0 + 7 * DW} y2={492} className="f-divider" />
          {bars.map((b, i) => {
            const x = X0 + (b.from - 1) * DW + 4
            const w = (b.to - b.from + 1) * DW - 8
            const y = RY(i)
            const right = b.to <= 5
            const tx = right ? x + w + 12 : x - 12
            return (
              <g key={b.task}>
                <Shape x={x} y={y} w={w} h={44} tone="soft" rx={6} />
                <text x={x + w / 2} y={y + 22} textAnchor="middle" dominantBaseline="central" fontSize={16.5} fontWeight={600} className="f-accent-ink">
                  {b.from === b.to ? `Day ${b.from}` : `Days ${b.from}–${b.to}`}
                </text>
                <Stack
                  x={tx}
                  y={y + 22}
                  anchor={right ? 'start' : 'end'}
                  lh={1.2}
                  rows={[
                    { t: b.task, size: 17, weight: 600 },
                    { t: `(${b.who})`, size: 16.5, ink: 'muted' },
                  ]}
                />
              </g>
            )
          })}
        </>
      )}
    </Svg>
  )
}
