// IF-7 Progressive trace (spec §d.9, LRN-22 MUST; M4 part B). Teaching purpose: identifiers carry a chain of reasoning
// from the enterprise to a need, and on to later weeks. "Step" walks the chain one artifact at a time and says each
// relation in words, using the §14 vocabulary as course conventions for engineering traceability (never SysML
// semantics); the last step adds the dashed future links (Week 2, Week 8) labelled "future: not yet created".
// Never autoplays. "Show all" is the default state; under reduced motion "Step" reveals instantly (otherwise a 150 ms
// fade, figures.css). Text equivalent: the ordered list of steps, one click away and printed instead of the drawing.
// Data: aerolinkCase.ts only. The chain is read from NEED-010's record: its subject source (stakeholder and concern) and
// the objective it serves, which refines the mission. NEED-010 serves objective MGO-004, so the walk passes through it
// (the spec's outline ENT-001 → MGO-001 → STK-010 → CON-011 → NEED-010 omits the objective level; M4B_REPORT.md).
import { useId, useRef, useState } from 'react'
import { ENTERPRISE, EXTERNAL_SYSTEMS, MISSION_GOALS, concern, need, stakeholder } from '../../content/lectures/week01/aerolinkCase'
import { ExpandButton, FigureDialog, ReadableArt, useDialog, wrap } from './ifigShared'
import './figures.css'

const N10 = need('NEED-010')
const SRC = N10.sources.find((s) => s.role === 'subject')!
const STK = stakeholder(SRC.stakeholder)
const CON = concern(SRC.concern!)
const OBJ = MISSION_GOALS.find((m) => m.id === N10.mgo)!
const MISSION = MISSION_GOALS.find((m) => m.level === 'mission')!
const OWNED = EXTERNAL_SYSTEMS.find((e) => e.owner === STK.id)

type NodeId = 'ent' | 'mission' | 'obj' | 'stk' | 'con' | 'need' | 'req' | 'model'
type TNode = { id: NodeId; code: string; name: string; x: number; y: number; step: number; future?: boolean }
// Two columns: the mission line on the left (enterprise, mission, objective), the stakeholder line on the right
// (stakeholder, concern, need), so every relation runs down a column or straight across, with room for its label.
const COL = [135, 505]
const ROW = [50, 175, 300, 425]
export const TRACE_NODES: TNode[] = [
  { id: 'ent', code: ENTERPRISE.id, name: ENTERPRISE.name, x: COL[0], y: ROW[0], step: 1 },
  { id: 'mission', code: MISSION.id, name: 'Mission', x: COL[0], y: ROW[1], step: 2 },
  { id: 'obj', code: OBJ.id, name: `Objective: ${OBJ.name}`, x: COL[0], y: ROW[2], step: 3 },
  { id: 'stk', code: STK.id, name: STK.name, x: COL[1], y: ROW[0], step: 4 },
  { id: 'con', code: CON.id, name: CON.name, x: COL[1], y: ROW[1], step: 5 },
  { id: 'need', code: N10.id, name: N10.name, x: COL[1], y: ROW[2], step: 6 },
  { id: 'model', code: 'Week 8', name: 'concern in the model (future: not yet created)', x: COL[0], y: ROW[3], step: 7, future: true },
  { id: 'req', code: 'Week 2', name: 'stakeholder requirement (future: not yet created)', x: COL[1], y: ROW[3], step: 7, future: true },
]
type TEdge = { from: NodeId; to: NodeId; label: string; step: number; future?: boolean }
export const TRACE_EDGES: TEdge[] = [
  { from: 'ent', to: 'mission', label: 'states the mission', step: 2 },
  { from: 'obj', to: 'mission', label: 'elaborates', step: 3 },
  { from: 'stk', to: 'con', label: 'has concern', step: 5 },
  { from: 'con', to: 'need', label: 'motivates', step: 6 },
  { from: 'stk', to: 'need', label: 'expresses', step: 6 },
  { from: 'need', to: 'obj', label: 'supports', step: 6 },
  { from: 'req', to: 'need', label: 'derives from', step: 7, future: true },
  { from: 'con', to: 'model', label: 'maps to', step: 7, future: true },
]
/** The relation of each step in words (§14 vocabulary, course conventions). */
export const TRACE_STEPS: string[] = [
  `${ENTERPRISE.id} ${ENTERPRISE.name}: the enterprise, where the trace starts.`,
  `${ENTERPRISE.id} states the mission ${MISSION.id}: “${MISSION.name}.” (Course convention: the enterprise proposal records one mission.)`,
  `${OBJ.id} elaborates ${MISSION.id}: the objective “${OBJ.name}” elaborates the mission (course convention, after SEBoK’s wording that objectives are elaborated from the mission).`,
  `${STK.id} ${STK.name} enters from the register${OWNED ? ` (it runs ${OWNED.id}, the ${OWNED.short.toLowerCase()})` : ''}. No relation to the mission yet: a stakeholder reaches the mission only through its concerns and needs.`,
  `${STK.id} has concern ${CON.id}, ${CON.name.toLowerCase()} (course convention).`,
  `${CON.id} motivates ${N10.id}; ${STK.id} expresses ${N10.id}; ${N10.id} supports ${OBJ.id}; and ${N10.id} has documented rationale: “${N10.rationale}” (course conventions).`,
  `Future links, not yet created: in Week 2 a stakeholder requirement derives from ${N10.id}; in Week 8 ${CON.id} maps to a concern in the model (course working mapping).`,
]
const LAST = TRACE_STEPS.length
const W = 220
const H = 82
const at = (id: NodeId) => TRACE_NODES.find((n) => n.id === id)!

export const stepStatus = (step: number) => (step >= LAST ? `All ${LAST} steps shown. ${TRACE_STEPS[LAST - 1]}` : `Step ${step} of ${LAST}. ${TRACE_STEPS[step - 1]}`)

function edgePath(e: TEdge) {
  const a = at(e.from)
  const b = at(e.to)
  if (e.from === 'stk' && e.to === 'need') {
    // beside the stakeholder column, so it does not pass through the concern
    const x = a.x + W / 2
    return { d: `M${x},${a.y} C${x + 120},${a.y} ${x + 120},${b.y} ${x + 6},${b.y}`, lx: x + 12, ly: (a.y + b.y) / 2 + 5, anchor: 'start' as const }
  }
  if (a.y === b.y) {
    const dir = b.x > a.x ? 1 : -1
    const x1 = a.x + (dir * W) / 2
    const x2 = b.x - (dir * W) / 2 - dir * 6
    // label nearer the source, clear of the dashed Week 8 diagonal that crosses this line
    return { d: `M${x1},${a.y} L${x2},${b.y}`, lx: (3 * x1 + x2) / 4, ly: a.y - 9 }
  }
  if (a.x === b.x) {
    const dir = b.y > a.y ? 1 : -1
    const y1 = a.y + (dir * H) / 2
    const y2 = b.y - (dir * H) / 2 - dir * 6
    return { d: `M${a.x},${y1} L${b.x},${y2}`, lx: a.x + 10, ly: (y1 + y2) / 2 + 5, anchor: 'start' as const }
  }
  // the concern to its future Week 8 counterpart: a diagonal from the concern down to the left column
  const x1 = a.x - W / 2 + 10
  const y1 = a.y + H / 2
  const x2 = b.x + W / 2 - 10
  const y2 = b.y - H / 2 - 6
  return { d: `M${x1},${y1} L${x2},${y2}`, lx: x2 + 6, ly: y2 - 4, anchor: 'start' as const }
}

function Drawing({ step, fresh, big = false }: { step: number; fresh: boolean; big?: boolean }) {
  const marker = `w1l-trace-arrow${big ? '-b' : ''}`
  const nodes = TRACE_NODES.filter((n) => n.step <= step)
  const edges = TRACE_EDGES.filter((e) => e.step <= step)
  const isNew = (s: number) => fresh && s === step && step < LAST
  return (
    <svg viewBox="0 0 760 475" className={`w1l-ifig-svg w1l-eco-svg${big ? ' is-big' : ''}`} role="img" aria-label={`Progressive trace. ${stepStatus(step)}`}>
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="w1l-eco-head" />
        </marker>
      </defs>
      {edges.map((e) => {
        const g = edgePath(e)
        const cur = e.step === step && step < LAST
        return (
          <g key={`${e.from}-${e.to}`} className={isNew(e.step) ? 'w1l-trace-new' : undefined}>
            <path d={g.d} className={`w1l-trace-edge${e.future ? ' is-future' : ''}${cur ? ' is-current' : ''}`} markerEnd={`url(#${marker})`} />
            <text x={g.lx} y={g.ly} textAnchor={g.anchor ?? 'middle'} className={`w1l-trace-label${cur ? ' is-current' : ''}`}>
              {e.label}
            </text>
          </g>
        )
      })}
      {nodes.map((n) => {
        const lines = wrap(n.name, 24).slice(0, 3)
        const cur = n.step === step && step < LAST
        return (
          <g key={n.id} className={`w1l-trace-node${n.future ? ' is-future' : ''}${cur ? ' is-current' : ''}${isNew(n.step) ? ' w1l-trace-new' : ''}`}>
            <rect x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} rx="8" />
            <text x={n.x - W / 2 + 10} y={n.y - H / 2 + 20} className="w1l-trace-id">
              {n.code}
            </text>
            {lines.map((l, i) => (
              <text key={i} x={n.x - W / 2 + 10} y={n.y - H / 2 + 40 + i * 18}>
                {l}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export function TextEquivalent({ upTo = LAST }: { upTo?: number }) {
  return (
    <ol className="w1l-list" data-testid="if7-steps">
      {TRACE_STEPS.slice(0, upTo).map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ol>
  )
}

export default function ProgressiveTrace({ number }: { number: string }) {
  const [step, setStep] = useState(LAST) // "Show all" is the default state (§d.9)
  const [fresh, setFresh] = useState(false)
  const id = useId()
  const d = useDialog()
  const restart = useRef<HTMLButtonElement>(null)
  const go = (s: number) => {
    setFresh(s > 1)
    setStep(s)
    // review M4b F14: "Step" and "Show all" disable themselves at the last step, so keyboard focus moves to "Start over"
    if (s >= LAST) requestAnimationFrame(() => restart.current?.focus())
  }
  return (
    <figure className="w1l-figure w1l-ifig" data-testid="if7-progressive-trace" aria-labelledby={`${id}-cap`}>
      <div className="w1l-ifig-panel">
        <div className="w1l-trace-buttons" role="group" aria-label="Walk the trace">
          <button type="button" className="w1l-btn" ref={restart} onClick={() => go(1)} data-testid="if7-restart">
            Start over
          </button>
          <button type="button" className="w1l-btn primary" onClick={() => go(Math.min(LAST, step + 1))} disabled={step >= LAST} data-testid="if7-step">
            Step
          </button>
          <button type="button" className="w1l-btn" onClick={() => go(LAST)} disabled={step >= LAST} data-testid="if7-all">
            Show all
          </button>
        </div>
        <ReadableArt>
          <Drawing step={step} fresh={fresh} />
        </ReadableArt>
        <div className="w1l-ifig-list" data-testid="if7-stacked">
          <TextEquivalent upTo={step} />
        </div>
        <p className="w1l-ifig-status" role="status" aria-live="polite" data-testid="if7-status">
          {stepStatus(step)}
        </p>
      </div>
      <figcaption id={`${id}-cap`}>
        <span className="w1l-fig-no">Figure {number}</span> Progressive trace from the enterprise to one need, and on to Weeks 2 and 8. The relations are course conventions for engineering traceability, not SysML relationships; dashed links are future, not yet created. Interactive; AeroLink is a fictional teaching case.
      </figcaption>
      <ExpandButton d={d} testId="if7-expand" label={`figure ${number}`} />
      <details className="w1l-textequiv" data-testid="if7-text-equivalent">
        <summary>Show text description</summary>
        <TextEquivalent />
      </details>
      <div className="w1l-print-only">
        <TextEquivalent />
      </div>
      <FigureDialog d={d} title={`Figure ${number}. Progressive trace`}>
        <ReadableArt big>
          <Drawing step={step} fresh={false} big />
        </ReadableArt>
        <p className="w1l-ifig-status">{stepStatus(step)}</p>
      </FigureDialog>
    </figure>
  )
}
