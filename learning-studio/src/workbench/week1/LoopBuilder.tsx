// Loop builder (Week 1, L1 step 3): the student constructs causal loops from the explorer's variables or their own,
// gives every arrow a polarity and declares the loop type. The computed type is deliberately not shown: the check in
// Problems tells the student when the declaration disagrees with the polarities, so declaring stays their reasoning.
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useId } from 'react'
import { LOOP_NODES } from '../../content/causalLoops'
import { ProvenanceOwnerFields } from '../../components/ProvenanceOwnerFields'
import { useWorkbench } from '../context'
import { useSelection } from '../selection'
import { SeverityChip } from '../ui'
import { analyseLoop, varLabel, type LoopType, type LoopVar, type Polarity, type StudentLoop } from './logic'
import { newLoopId, useLoops } from './useLoops'

const OWN = '__own__'

function LoopDiagram({ loop }: { loop: StudentLoop }) {
  const a = analyseLoop(loop)
  const n = loop.vars.length
  if (n < 2) return null
  const R = 92
  const cx = 160
  const cy = 120
  const pts = loop.vars.map((_, i) => {
    const t = -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: cx + R * Math.cos(t), y: cy + R * Math.sin(t) }
  })
  return (
    <figure className="m-0">
      <svg viewBox="0 0 320 240" className="h-auto w-full max-w-[360px]" role="img" aria-label={`Diagram of ${loop.id}: ${a.links.map((k) => `${k.from || '?'} to ${k.to || '?'} (${k.polarity || 'no polarity'})`).join('; ')}`}>
        <defs>
          <marker id={`ah-${loop.id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0L10,5L0,10z" fill="var(--wb-muted)" />
          </marker>
        </defs>
        {pts.map((p, i) => {
          const q = pts[(i + 1) % n]
          const dx = q.x - p.x
          const dy = q.y - p.y
          const len = Math.hypot(dx, dy) || 1
          const sx = p.x + (dx / len) * 34
          const sy = p.y + (dy / len) * 16
          const ex = q.x - (dx / len) * 34
          const ey = q.y - (dy / len) * 16
          const mx = (sx + ex) / 2 + (-dy / len) * 12
          const my = (sy + ey) / 2 + (dx / len) * 12
          const pol = a.links[i]?.polarity
          return (
            <g key={i}>
              <path d={`M${sx},${sy} Q${mx},${my} ${ex},${ey}`} fill="none" stroke="var(--wb-muted)" strokeWidth="1.4" markerEnd={`url(#ah-${loop.id})`} strokeDasharray={pol ? undefined : '3 3'} />
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--wb-mono)" fontSize="14" fontWeight="600" fill={pol === '−' ? 'var(--wb-bad)' : pol === '+' ? 'var(--wb-ok)' : 'var(--wb-muted)'}>
                {pol || '?'}
              </text>
            </g>
          )
        })}
        {pts.map((p, i) => (
          <g key={`n${i}`}>
            <rect x={p.x - 52} y={p.y - 13} width="104" height="26" rx="4" fill="var(--wb-panel)" stroke={loop.vars[i].ref ? 'var(--wb-line-strong)' : 'var(--wb-accent)'} />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--wb-body)" fontSize="10" fill="var(--wb-fg)">
              {(varLabel(loop.vars[i]) || '(unnamed)').slice(0, 22)}
            </text>
          </g>
        ))}
        <text x={6} y={14} fontFamily="var(--wb-mono)" fontSize="11" fill="var(--wb-muted)">
          {loop.id}
        </text>
      </svg>
      <figcaption className="text-[11px] text-wb-muted">Accent outline = your own variable; dashed arrow = no polarity yet.</figcaption>
    </figure>
  )
}

function VarRow({ loop, i, onPatch }: { loop: StudentLoop; i: number; onPatch: (p: Partial<StudentLoop>) => void }) {
  const id = useId()
  const v = loop.vars[i]
  const n = loop.vars.length
  const next = loop.vars[(i + 1) % n]
  const setVar = (nv: LoopVar) => onPatch({ vars: loop.vars.map((x, j) => (j === i ? nv : x)) })
  const setPol = (p: Polarity) => {
    const pols = [...loop.polarities]
    while (pols.length < n) pols.push('')
    pols[i] = p
    onPatch({ polarities: pols })
  }
  const move = (d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= n) return
    const vars = [...loop.vars]
    ;[vars[i], vars[j]] = [vars[j], vars[i]]
    onPatch({ vars, polarities: loop.polarities.map(() => '' as Polarity) })
  }
  const remove = () => onPatch({ vars: loop.vars.filter((_, j) => j !== i), polarities: loop.polarities.filter((_, j) => j !== i).map(() => '' as Polarity) })
  return (
    <li className="grid gap-1 border-b border-wb-line py-2 last:border-b-0">
      <div className="flex flex-wrap items-end gap-2">
        <span className="wb-mono w-5 text-[11px] text-wb-muted">{i + 1}</span>
        <label className="min-w-[10rem] flex-1" htmlFor={`${id}-v`}>
          <span className="wb-label">Variable {i + 1}</span>
          <select
            id={`${id}-v`}
            aria-label={`Variable ${i + 1}`}
            className="wb-select w-full"
            value={v.ref ?? OWN}
            onChange={(e) => (e.target.value === OWN ? setVar({ label: v.ref ? '' : v.label }) : setVar({ ref: e.target.value, label: LOOP_NODES.find((x) => x.id === e.target.value)!.label }))}
          >
            {LOOP_NODES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
            <option value={OWN}>My own variable…</option>
          </select>
        </label>
        {!v.ref && (
          <label className="min-w-0 flex-1" htmlFor={`${id}-own`}>
            <span className="wb-label">Own variable name</span>
            <input id={`${id}-own`} aria-label={`Own variable name ${i + 1}`} className="wb-input w-full" value={v.label} placeholder="e.g. Noise complaints" onChange={(e) => setVar({ label: e.target.value })} />
          </label>
        )}
        <span className="flex gap-0.5">
          <button type="button" className="wb-btn ghost icon" aria-label={`Move variable ${i + 1} up`} onClick={() => move(-1)} disabled={i === 0}>
            <ArrowUp size={13} aria-hidden />
          </button>
          <button type="button" className="wb-btn ghost icon" aria-label={`Move variable ${i + 1} down`} onClick={() => move(1)} disabled={i === n - 1}>
            <ArrowDown size={13} aria-hidden />
          </button>
          <button type="button" className="wb-btn ghost icon" aria-label={`Remove variable ${i + 1}`} onClick={remove} disabled={n <= 2}>
            <Trash2 size={13} aria-hidden />
          </button>
        </span>
      </div>
      <label className="ml-7 flex flex-wrap items-center gap-2 text-[12px]" htmlFor={`${id}-p`}>
        <span className="text-wb-muted">
          {i === n - 1 ? 'Closing link' : 'Link'} → {varLabel(next) || `variable ${((i + 1) % n) + 1}`}:
        </span>
        <select id={`${id}-p`} className="wb-select mono" value={loop.polarities[i] ?? ''} onChange={(e) => setPol(e.target.value as Polarity)} aria-label={`Polarity of the link from variable ${i + 1} to ${i === n - 1 ? 'variable 1' : `variable ${i + 2}`}`}>
          <option value="">choose…</option>
          <option value="+">+ same direction</option>
          <option value="−">− opposite direction</option>
        </select>
      </label>
    </li>
  )
}

export function LoopBuilder() {
  const wb = useWorkbench()
  const { selectedId, select } = useSelection()
  const { loops, issued, update, patch } = useLoops()
  const current = loops.find((l) => l.id === selectedId) ?? loops[loops.length - 1]
  const idType = useId()

  const create = () => {
    const id = newLoopId(issued)
    update((a) => ({
      issued: a.issued + 1,
      loops: [...a.loops, { id, name: '', vars: [{ ref: 'riders', label: 'Riders' }, { label: '' }], polarities: ['', ''], declared: '', owner: '', provenance: 'team-derived' }],
    }))
    select(id, { reveal: true })
    wb.log('info', `Created ${id} in the loop builder`)
    requestAnimationFrame(() => document.querySelector('[data-testid="loop-builder"]')?.scrollIntoView?.({ block: 'start', behavior: 'auto' }))
  }
  const remove = (l: StudentLoop) => {
    update((a) => ({ ...a, loops: a.loops.filter((x) => x.id !== l.id) }))
    wb.log('info', `Deleted ${l.id} (IDs are not reused)`)
    select(null)
  }
  const problems = current ? wb.problems.filter((p) => p.elementId === current.id) : []

  return (
    <section aria-labelledby="loop-builder-h" className="rounded border border-wb-line bg-wb-panel" data-testid="loop-builder">
      <div className="wb-ph">
        <h2 id="loop-builder-h">Loop builder · my causal loops</h2>
        <span className="wb-sp" />
        <button type="button" className="wb-btn primary" onClick={create}>
          <Plus size={13} aria-hidden /> New loop
        </button>
      </div>
      {loops.length > 0 && (
        <div className="flex flex-wrap gap-1 border-b border-wb-line px-3 py-2" role="group" aria-label="My loops">
          {loops.map((l) => (
            <button key={l.id} type="button" className={`wb-btn ${current?.id === l.id ? 'primary' : ''}`} aria-pressed={current?.id === l.id} onClick={() => select(l.id, { reveal: true })}>
              <span className="wb-mono">{l.id}</span>
              {l.name && <span className="max-w-40 truncate font-normal">{l.name}</span>}
            </button>
          ))}
        </div>
      )}
      {!current ? (
        <p className="px-3 py-4 text-wb-muted">No loops yet. Create one, choose its variables, give every arrow a polarity and declare whether it is reinforcing or balancing.</p>
      ) : (
        <div className="grid gap-4 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,340px)]">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="min-w-0 flex-1">
                <span className="wb-label">Loop name ({current.id})</span>
                <input className="wb-input w-full" value={current.name} onChange={(e) => patch(current.id, { name: e.target.value })} placeholder="e.g. Charger queue slows turnaround" />
              </label>
              <label htmlFor={idType}>
                <span className="wb-label">Declared loop type</span>
                <select id={idType} aria-label="Declared loop type" className="wb-select" value={current.declared} onChange={(e) => patch(current.id, { declared: e.target.value as LoopType })}>
                  <option value="">choose…</option>
                  <option value="Reinforcing">Reinforcing</option>
                  <option value="Balancing">Balancing</option>
                </select>
              </label>
            </div>
            <ol className="m-0 list-none rounded border border-wb-line px-2" aria-label={`Variables and links of ${current.id}`}>
              {current.vars.map((_, i) => (
                <VarRow key={i} loop={current} i={i} onPatch={(p) => patch(current.id, p)} />
              ))}
            </ol>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="wb-btn" onClick={() => patch(current.id, { vars: [...current.vars, { label: '' }], polarities: [...current.polarities.slice(0, current.vars.length - 1), '', ''] })}>
                <Plus size={13} aria-hidden /> Add variable
              </button>
              <button type="button" className="wb-btn ghost" onClick={() => remove(current)}>
                <Trash2 size={13} aria-hidden /> Delete {current.id}
              </button>
            </div>
            <ProvenanceOwnerFields value={{ owner: current.owner, provenance: current.provenance }} onChange={(v) => patch(current.id, v)} />
          </div>
          <div className="min-w-0 space-y-2">
            <LoopDiagram loop={current} />
            <div>
              <h3 className="wb-label">Checks on {current.id}</h3>
              {problems.length === 0 ? (
                <p className="text-[12px] text-wb-ok">No problems reported for this loop.</p>
              ) : (
                <ul className="m-0 list-none space-y-1 p-0 text-[12px]">
                  {problems.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <SeverityChip s={p.severity} />
                      <span>{p.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
