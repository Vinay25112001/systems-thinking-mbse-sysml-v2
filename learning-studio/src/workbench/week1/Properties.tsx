// Week 1 properties for the systems-thinking artefacts (boundary candidates, explorer variables and loops, the student's
// loops). Engineering elements (ENT, EXT, STK, …) use the shell's generic form.
import { ALL_LOOPS, LOOP_LINKS, LOOP_NODES } from '../../content/causalLoops'
import { BOUNDARY_ITEMS, type BoundaryClass } from '../../content/week1'
import { ProvenanceOwnerFields } from '../../components/ProvenanceOwnerFields'
import { useApp } from '../../state/AppState'
import { useWorkbench } from '../context'
import { SIG_BOUNDARY, analyseLoop, type LoopType } from './logic'
import { useLoops } from './useLoops'

const nodeLabel = (id: string) => LOOP_NODES.find((n) => n.id === id)?.label ?? id
const CLASS_LABEL: Record<BoundaryClass, string> = { inside: 'Inside the boundary', environment: 'Environment', irrelevant: 'Irrelevant to this question' }

function Head({ id, title, kind }: { id: string; title: string; kind: string }) {
  return (
    <div>
      <span className="wb-mono text-[11px] text-wb-muted">
        {kind} · {id}
      </span>
      <h3 className="wb-section-title mt-0.5">{title}</h3>
    </div>
  )
}

function BoundaryProps({ id }: { id: string }) {
  const { boundary, setBoundary } = useApp()
  const wb = useWorkbench()
  const item = BOUNDARY_ITEMS.find((b) => `boundary:${b.id}` === id)
  if (!item) return null
  const checked = !!wb.state.signals[SIG_BOUNDARY]
  const v = boundary[item.id] as BoundaryClass | undefined
  return (
    <div className="space-y-3">
      <Head id={item.id} title={item.name} kind="Boundary candidate" />
      <label className="block">
        <span className="wb-label">Classification for the driving question</span>
        <select className="wb-select w-full" value={v ?? ''} onChange={(e) => setBoundary(item.id, e.target.value)}>
          <option value="">Choose…</option>
          {(Object.keys(CLASS_LABEL) as BoundaryClass[]).map((k) => (
            <option key={k} value={k}>
              {CLASS_LABEL[k]}
            </option>
          ))}
        </select>
      </label>
      {checked && v ? (
        <p className={`wb-note ${v === item.answer ? 'ok' : 'warn'}`}>
          {v === item.answer ? 'Matches the instructor key. ' : `Instructor key: ${CLASS_LABEL[item.answer]}. `}
          {item.why}
        </p>
      ) : (
        <p className="text-[12px] text-wb-muted">Feedback appears after you check the classification against the instructor key in the Boundary view.</p>
      )}
    </div>
  )
}

function VarProps({ id }: { id: string }) {
  const node = LOOP_NODES.find((n) => `var:${n.id}` === id)
  if (!node) return null
  const out = LOOP_LINKS.filter((l) => l.from === node.id)
  const inc = LOOP_LINKS.filter((l) => l.to === node.id)
  const loops = ALL_LOOPS.filter((l) => l.path.includes(node.id))
  const row = (l: (typeof LOOP_LINKS)[number], other: string) => (
    <li key={`${l.from}-${l.to}`}>
      <span className="wb-mono">{l.polarity}</span> {other}
      {l.delay ? ', with delay' : ''}
      {l.condition ? <span className="text-wb-muted"> ({l.condition})</span> : null}
    </li>
  )
  return (
    <div className="space-y-3 text-[12px]">
      <Head id={node.id} title={node.label} kind="Explorer variable" />
      <div>
        <h4 className="wb-label">Affects</h4>
        <ul className="m-0 space-y-0.5 pl-4">{out.length ? out.map((l) => row(l, nodeLabel(l.to))) : <li>—</li>}</ul>
      </div>
      <div>
        <h4 className="wb-label">Affected by</h4>
        <ul className="m-0 space-y-0.5 pl-4">{inc.length ? inc.map((l) => row(l, nodeLabel(l.from))) : <li>—</li>}</ul>
      </div>
      <div>
        <h4 className="wb-label">In loops</h4>
        <p className="wb-mono m-0">{loops.map((l) => l.id).join(', ') || '—'}</p>
      </div>
    </div>
  )
}

function ExplorerLoopProps({ id }: { id: string }) {
  const l = ALL_LOOPS.find((x) => `loop:${x.id}` === id)
  if (!l) return null
  return (
    <div className="space-y-3 text-[12px]">
      <Head id={l.id} title={l.name} kind="Explorer loop" />
      <dl className="wb-kv">
        <dt>Path</dt>
        <dd>{[...l.path, l.path[0]].map(nodeLabel).join(' → ')}</dd>
        <dt>Type</dt>
        <dd>{l.kind} (computed from the link polarities)</dd>
        {l.condition && (
          <>
            <dt>Condition</dt>
            <dd>{l.condition}</dd>
          </>
        )}
      </dl>
    </div>
  )
}

function StudentLoopProps({ id }: { id: string }) {
  const { loops, patch } = useLoops()
  const wb = useWorkbench()
  const l = loops.find((x) => x.id === id)
  if (!l) return <p className="text-wb-muted">{id} no longer exists.</p>
  const a = analyseLoop(l)
  return (
    <div className="space-y-3">
      <Head id={l.id} title={l.name || '(unnamed loop)'} kind="My causal loop" />
      <label className="block">
        <span className="wb-label">Name</span>
        <input className="wb-input w-full" value={l.name} onChange={(e) => patch(l.id, { name: e.target.value })} />
      </label>
      <label className="block">
        <span className="wb-label">Declared loop type</span>
        <select className="wb-select" value={l.declared} onChange={(e) => patch(l.id, { declared: e.target.value as LoopType })}>
          <option value="">choose…</option>
          <option value="Reinforcing">Reinforcing</option>
          <option value="Balancing">Balancing</option>
        </select>
      </label>
      <div>
        <h4 className="wb-label">Links</h4>
        <ul className="m-0 space-y-0.5 pl-4 text-[12px]">
          {a.links.map((k, i) => (
            <li key={i}>
              {k.from || '?'} → {k.to || '?'}: <span className="wb-mono">{k.polarity || 'no polarity'}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="wb-link mt-1" onClick={() => wb.setView('loops')}>
          Edit variables and polarities in the Loop builder
        </button>
      </div>
      <ProvenanceOwnerFields value={{ owner: l.owner, provenance: l.provenance }} onChange={(v) => patch(l.id, v)} />
    </div>
  )
}

export function Week1Properties({ id }: { id: string }) {
  if (id.startsWith('boundary:')) return <BoundaryProps id={id} />
  if (id.startsWith('var:')) return <VarProps id={id} />
  if (id.startsWith('loop:')) return <ExplorerLoopProps id={id} />
  if (id.startsWith('LOOP-')) return <StudentLoopProps id={id} />
  return null
}
