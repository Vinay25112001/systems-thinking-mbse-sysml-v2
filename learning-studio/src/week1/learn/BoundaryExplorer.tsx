// IF-1 Boundary explorer (spec §d.9, LRN-20 MUST), the pattern for the textbook's interactive figures. Teaching purpose:
// a boundary is fit for a question, not true in general (SEBoK "What is Systems Thinking?", p.264, cited in 4.1).
// The reader switches among the three candidate boundaries of section 4.1 for one question; the figure marks the
// elements inside and every link that crosses the boundary, and a caption says whether that boundary can answer.
// Rules (§d.9): keyboard only (native radio group: arrow keys), state announced in a polite live region, text
// equivalent one click away (and printed instead of the drawing), no scoring, no animation by default; a 150 ms
// opacity change only when the reader has not asked for reduced motion (CSS).
// The "why" column quotes section 4.1's own sentences (session1.ts s1-lesson-boundary ¶1, cut, never retyped); the
// causal links are the instructor's drawing of that paragraph (demand, the charging queue and waiting time).
import { Maximize2 } from 'lucide-react'
import { useId, useLayoutEffect, useRef, useState } from 'react'
import { sentences } from '../../content/learn/resolve'
import { WEEK01_SESSION1 } from '../../content/lectures/week01/session1'
import { Inline } from '../../lectures/Blocks'
import { readableWidth } from './figureText'
import { BOUNDARY_QUESTION } from './textbook'

type NodeId = 'demand' | 'booking' | 'dispatch' | 'fleet' | 'chargers' | 'wait' | 'airspace' | 'grid' | 'weather'
const NODES: { id: NodeId; label: string[]; x: number; y: number; env?: boolean }[] = [
  { id: 'demand', label: ['Passenger', 'demand'], x: 90, y: 120 },
  { id: 'booking', label: ['Booking'], x: 235, y: 120 },
  { id: 'dispatch', label: ['Operations', 'center, dispatch'], x: 395, y: 120 },
  { id: 'fleet', label: ['Aircraft', '(fleet)'], x: 550, y: 120 },
  { id: 'wait', label: ['Waiting', 'time'], x: 235, y: 230 },
  { id: 'chargers', label: ['Vertiport pads', 'and chargers'], x: 395, y: 230 },
  { id: 'airspace', label: ['Controlled', 'airspace'], x: 395, y: 26, env: true },
  { id: 'weather', label: ['Weather'], x: 550, y: 26, env: true },
  { id: 'grid', label: ['Electric grid'], x: 395, y: 330, env: true },
]
const LINKS: [NodeId, NodeId][] = [
  ['demand', 'booking'],
  ['booking', 'dispatch'],
  ['dispatch', 'fleet'],
  ['fleet', 'chargers'],
  ['chargers', 'wait'],
  ['wait', 'demand'],
  ['airspace', 'dispatch'],
  ['weather', 'fleet'],
  ['grid', 'chargers'],
]

const leadBlock = WEEK01_SESSION1.studentLesson.find((s) => s.id === 's1-lesson-boundary')?.blocks[0]
/** Section 4.1's opening paragraph, cut into sentences: [2] aircraft, [3] flight operations, [4] air-taxi service. */
const lead = sentences(leadBlock?.kind === 'para' ? leadBlock.text : '')

export type BoundaryChoice = { id: 'aircraft' | 'operations' | 'service'; label: string; inside: NodeId[]; answers: string; why: string }
export const BOUNDARIES: BoundaryChoice[] = [
  { id: 'aircraft', label: 'Aircraft', inside: ['fleet'], answers: 'No', why: lead[2] },
  { id: 'operations', label: 'Flight operations', inside: ['dispatch', 'fleet'], answers: 'Only if charging is not the limit', why: lead[3] },
  { id: 'service', label: 'Air-taxi service', inside: ['demand', 'booking', 'dispatch', 'fleet', 'chargers', 'wait'], answers: 'Yes', why: lead[4] },
]

/** Half the size of a node box, in user units (labels are 15 units, so the widest two-line label fits). */
const NODE_HW = 66
const NODE_HH = 23

const name = (id: NodeId) => NODES.find((n) => n.id === id)!.label.join(' ').replace(/\s+/g, ' ')
export const crossing = (b: BoundaryChoice) => LINKS.filter(([a, z]) => b.inside.includes(a) !== b.inside.includes(z))
export const statusText = (b: BoundaryChoice) => {
  const c = crossing(b).length
  return `Boundary: ${b.label.toLowerCase()}. ${c} ${c === 1 ? 'link crosses' : 'links cross'} it. Can it answer the question? ${b.answers}.`
}

function Drawing({ b, big = false }: { b: BoundaryChoice; big?: boolean }) {
  const inside = NODES.filter((n) => b.inside.includes(n.id))
  const pad = 62
  const box = { x: Math.min(...inside.map((n) => n.x)) - pad, y: Math.min(...inside.map((n) => n.y)) - 40, x2: Math.max(...inside.map((n) => n.x)) + pad, y2: Math.max(...inside.map((n) => n.y)) + 40 }
  const cross = crossing(b)
  const at = (id: NodeId) => NODES.find((n) => n.id === id)!
  return (
    <svg viewBox="0 0 640 380" className={`w1l-ifig-svg${big ? ' is-big' : ''}`} role="img" aria-label={`${statusText(b)} Inside: ${b.inside.map(name).join(', ')}.`}>
      <defs>
        <marker id={`w1l-arrow${big ? '-b' : ''}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="w1l-ifig-head" />
        </marker>
      </defs>
      <rect x={box.x} y={box.y} width={box.x2 - box.x} height={box.y2 - box.y} rx="16" className="w1l-ifig-boundary" />
      <text x={box.x + 8} y={box.y2 + 18} className="w1l-ifig-blabel">
        Boundary: {b.label.toLowerCase()}
      </text>
      {LINKS.map(([a, z]) => {
        const A = at(a)
        const Z = at(z)
        const isX = cross.some(([p, q]) => p === a && q === z)
        const dx = Z.x - A.x
        const dy = Z.y - A.y
        const len = Math.hypot(dx, dy)
        // clip each link at the node boxes (plus a gap), so every arrowhead stays visible outside the target node
        // (review M4A F13: the demand → booking → … → waiting time → demand loop must read as directed)
        const t = (gap: number) => Math.min(dx ? (NODE_HW + gap) / Math.abs(dx) : Infinity, dy ? (NODE_HH + gap) / Math.abs(dy) : Infinity)
        const sx = A.x + dx * t(3)
        const sy = A.y + dy * t(3)
        const ex = Z.x - dx * t(6)
        const ey = Z.y - dy * t(6)
        void len
        return (
          <g key={`${a}-${z}`}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} className={`w1l-ifig-link${isX ? ' is-cross' : ''}`} markerEnd={`url(#w1l-arrow${big ? '-b' : ''})`} />
            {isX && (
              <text x={(sx + ex) / 2} y={(sy + ey) / 2 - 7} textAnchor="middle" className="w1l-ifig-xlabel">
                crosses
              </text>
            )}
          </g>
        )
      })}
      {NODES.map((n) => {
        const inn = b.inside.includes(n.id)
        return (
          <g key={n.id} className={`w1l-ifig-node${inn ? ' is-in' : ''}${n.env ? ' is-env' : ''}`}>
            <rect x={n.x - NODE_HW} y={n.y - NODE_HH} width={2 * NODE_HW} height={2 * NODE_HH} rx="8" />
            {n.label.map((l, i) => (
              <text key={i} x={n.x} y={n.y + (n.label.length === 1 ? 5 : i === 0 ? -5 : 14)} textAnchor="middle">
                {l}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/** Phone variant (review M4A F4): the same state as a stacked list in body text, shown instead of the drawing below
 *  600 px, where the 640-unit drawing cannot keep 13 px labels. */
function Stacked({ b }: { b: BoundaryChoice }) {
  const outside = NODES.filter((n) => !b.inside.includes(n.id))
  return (
    <div className="w1l-ifig-list" data-testid="if1-stacked">
      <p>
        <strong>Inside the boundary:</strong> {b.inside.map(name).join(', ')}.
      </p>
      <p>
        <strong>Outside:</strong> {outside.map((n) => name(n.id)).join(', ')}.
      </p>
      <p>
        <strong>Links crossing it:</strong> {crossing(b).map(([a, z]) => `${name(a)} → ${name(z)}`).join('; ')}.
      </p>
    </div>
  )
}

/** The drawing: inline it fits the panel; expanded, it is never narrower than the width at which its smallest label
 *  renders at 13 px (a narrow viewport scrolls inside the full-viewport view). */
function ReadableDrawing({ b, big = false }: { b: BoundaryChoice; big?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [minW, setMinW] = useState<number | null>(null)
  useLayoutEffect(() => {
    const svg = ref.current?.querySelector('svg')
    if (svg) setMinW(readableWidth(svg))
  }, [])
  return (
    // FD-f: inline it fits the panel; the expanded view keeps its readable width (labels ≥ 13 px)
    <div ref={ref} className={`w1l-ifig-art${big ? ' is-readable is-big' : ''}`} style={big && minW ? ({ '--w1l-art-min': `${minW}px` } as React.CSSProperties) : undefined}>
      <Drawing b={b} big={big} />
    </div>
  )
}

export function TextEquivalent() {
  return (
    <table className="w1l-table">
      <caption>Three candidate boundaries for the question “{BOUNDARY_QUESTION}”</caption>
      <thead>
        <tr>
          <th scope="col">Boundary</th>
          <th scope="col">Can it answer the question?</th>
          <th scope="col">Why</th>
        </tr>
      </thead>
      <tbody>
        {BOUNDARIES.map((b) => (
          <tr key={b.id}>
            <th scope="row">{b.label}</th>
            <td>{b.answers}</td>
            <td>
              <Inline text={b.why} /> Links crossing it: {crossing(b).map(([a, z]) => `${name(a)} → ${name(z)}`).join('; ')}.
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function BoundaryExplorer({ number }: { number: string }) {
  // opens on the narrowest candidate, so the reader explores toward the boundary that answers (review M4A F13)
  const [choice, setChoice] = useState<BoundaryChoice['id']>('aircraft')
  const b = BOUNDARIES.find((x) => x.id === choice)!
  const id = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const open = () => {
    const d = dialog.current
    if (d && typeof d.showModal === 'function') d.showModal()
    else d?.setAttribute('open', '')
  }
  const close = () => {
    dialog.current?.close?.()
    dialog.current?.removeAttribute('open')
    opener.current?.focus()
  }
  const controls = (group: string) => (
    <fieldset className="w1l-seg">
      <legend>Choose a boundary for: “{BOUNDARY_QUESTION}”</legend>
      {BOUNDARIES.map((x) => (
        <label key={x.id} className={x.id === choice ? 'is-on' : undefined}>
          <input type="radio" name={`${id}-${group}`} value={x.id} checked={x.id === choice} onChange={() => setChoice(x.id)} />
          <span>{x.label}</span>
        </label>
      ))}
    </fieldset>
  )
  return (
    <figure className="w1l-figure w1l-ifig" data-testid="if1-boundary-explorer" aria-labelledby={`${id}-cap`}>
      <div className="w1l-ifig-panel">
        {controls('fig')}
        <ReadableDrawing b={b} />
        <Stacked b={b} />
        <p className="w1l-ifig-status" role="status" aria-live="polite" data-testid="if1-status">
          {statusText(b)}
        </p>
        <p className="w1l-ifig-why">{<Inline text={b.why} />}</p>
      </div>
      <figcaption id={`${id}-cap`}>
        <span className="w1l-fig-no">Figure {number}</span> Boundary explorer: three candidate boundaries for one question. Interactive; AeroLink is a fictional teaching case.
      </figcaption>
      <div className="w1l-fig-actions">
        <button type="button" className="w1l-linkbtn" onClick={open} ref={opener} data-testid="if1-expand">
          <Maximize2 size={14} aria-hidden /> Expand
        </button>
      </div>
      <details className="w1l-textequiv" data-testid="if1-text-equivalent">
        <summary>Show text description</summary>
        <TextEquivalent />
      </details>
      <div className="w1l-print-only">
        <TextEquivalent />
      </div>
      <dialog ref={dialog} className="w1l-dialog" aria-label={`Figure ${number}, expanded`} onCancel={(e) => (e.preventDefault(), close())}>
        <div className="w1l-dialog-head">
          <p>Figure {number}. Boundary explorer</p>
          <button type="button" className="w1l-btn" onClick={close}>
            Close
          </button>
        </div>
        {controls('dlg')}
        <ReadableDrawing b={b} big />
        <Stacked b={b} />
        <p className="w1l-ifig-status">{statusText(b)}</p>
      </dialog>
    </figure>
  )
}
