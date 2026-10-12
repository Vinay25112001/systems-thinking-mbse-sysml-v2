import { useMemo, useState } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { referenceUpTo } from '../../model/reference'
import { useWorkspace } from '../../state/Workspace'
import {
  DONE, EMPTY_FLOW, NODE_KINDS, REFERENCE_SCN002_FLOW, SCN001_SKELETON_FLOW, START, TEAM_K_SCN005_FLOW, checkFlow, isEmptyFlow, mappingMarkdown, scenarioSpec,
  type FlowModel, type NodeKind,
} from './flow'
import { TEAM_K_FLOW_STORE, practiceRids, practiceUnlock } from './rids'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const mark = (ok: boolean, level: string) => (ok ? '✓' : level === 'error' ? '✗' : '!')

export function FlowCoverage() {
  const { model } = useWorkspace()
  const ref = useMemo(() => referenceUpTo(3), [])
  const options = useMemo(() => {
    const refs = ['SCN-002', 'SCN-005', 'SCN-001'].map((id) => ({ key: `ref:${id}`, label: `${id} (reference ConOps)`, el: ref.elements.find((e) => e.id === id)!, m: ref }))
    const mine = model.elements.filter((e) => e.kind === 'SCN' && e.status === 'active' && e.attributes?.mainFlow).map((e) => ({ key: `ws:${e.id}`, label: `${e.id} ${e.name} (my workspace)`, el: e, m: model }))
    return [...refs, ...mine]
  }, [model, ref])
  const [choice, setChoice] = usePersistentState<string>('w11-flow-choice', 'ref:SCN-002')
  const [flows, setFlows] = usePersistentState<Record<string, FlowModel>>('w11-flows', {})
  const [teamK, setTeamK] = usePersistentState<FlowModel | null>(TEAM_K_FLOW_STORE, null)
  const [view, setView] = usePersistentState<'mine' | 'teamK'>('w11-flow-view', 'mine')
  const [pending, setPending] = useState<null | { label: string; run: () => void }>(null)
  const current = options.find((o) => o.key === choice) ?? options[0]
  const spec = scenarioSpec(current.el, current.m)
  const isTeamKView = current.key === 'ref:SCN-005' && view === 'teamK'
  const flow = isTeamKView ? (teamK ?? TEAM_K_SCN005_FLOW) : (flows[current.key] ?? EMPTY_FLOW)
  const setFlow = (f: FlowModel) => (isTeamKView ? setTeamK(f) : setFlows({ ...flows, [current.key]: f }))
  /** Replacing a non-empty draft asks for a second click (no browser dialog), so a draft is never lost by one click. */
  const replaceDraft = (label: string, f: FlowModel) => (isEmptyFlow(flow) || isTeamKView ? setFlow(f) : setPending({ label, run: () => setFlow(f) }))
  const unlock = practiceUnlock(practiceRids())
  const hideFindings = isTeamKView && !unlock.ok
  const findings = checkFlow(spec, flow)
  const refs = [...spec.main.map((s) => s.ref), ...spec.alternates.map((a) => a.ref)]
  const [draft, setDraft] = useState<{ id: string; kind: NodeKind }>({ id: '', kind: 'action' })
  const [edge, setEdge] = useState({ from: START, to: DONE, guard: '' })
  const nodeIds = flow.nodes.map((x) => x.id)

  const updateNode = (i: number, patch: Partial<FlowModel['nodes'][number]>) => setFlow({ ...flow, nodes: flow.nodes.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
  const removeNode = (id: string) => setFlow({ nodes: flow.nodes.filter((x) => x.id !== id), edges: flow.edges.filter((e) => e.from !== id && e.to !== id) })

  return (
    <div className="space-y-4 text-sm" data-testid="w11-flow-coverage">
      <p>
        Teaching aid: you type the action flow as a table of nodes and successions, and map each ConOps step and alternate flow to the nodes that realise it. The tool checks the mapping and the graph against the criteria cited beside each result. It does not read or validate SysML — only the course-designated checker does.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col">
          Scenario
          <select className={input} value={current.key} onChange={(e) => { setChoice(e.target.value); setPending(null) }}>
            {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </label>
        {current.key === 'ref:SCN-002' && <Button variant="secondary" onClick={() => replaceDraft('Replace your SCN-002 draft with the worked flow?', REFERENCE_SCN002_FLOW)}>Load the worked SCN-002 flow</Button>}
        {current.key === 'ref:SCN-001' && <Button variant="secondary" onClick={() => replaceDraft('Replace your SCN-001 draft with the L11 skeleton?', SCN001_SKELETON_FLOW)}>Load the L11 skeleton (six steps, no decisions)</Button>}
        {current.key === 'ref:SCN-005' && (
          <fieldset className="flex flex-wrap items-center gap-3">
            <legend className="sr-only">Which SCN-005 flow</legend>
            <label className="flex items-center gap-1.5"><input type="radio" name="w11-flow-view" checked={view === 'mine'} onChange={() => { setView('mine'); setPending(null) }} />My draft</label>
            <label className="flex items-center gap-1.5"><input type="radio" name="w11-flow-view" checked={view === 'teamK'} onChange={() => { setView('teamK'); setPending(null) }} />Team K’s draft (seeded defects; separate copy)</label>
          </fieldset>
        )}
        {isTeamKView && <Button variant="ghost" onClick={() => setTeamK(TEAM_K_SCN005_FLOW)}>Reset Team K’s copy</Button>}
        {!isTeamKView && <Button variant="ghost" onClick={() => (isEmptyFlow(flow) ? setFlow(EMPTY_FLOW) : setPending({ label: 'Clear this draft? Its nodes and successions will be deleted.', run: () => setFlow(EMPTY_FLOW) }))}>Clear this flow</Button>}
      </div>
      {pending && (
        <div role="alert" className="flex flex-wrap items-center gap-2 rounded border border-amber-400 p-2 dark:border-amber-600">
          <span>{pending.label}</span>
          <Button variant="danger" onClick={() => { pending.run(); setPending(null) }}>Yes, replace my draft</Button>
          <Button variant="ghost" onClick={() => setPending(null)}>Keep my draft</Button>
        </div>
      )}

      <details open className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <summary className="cursor-pointer font-medium">{spec.id} {spec.name}: the ConOps steps</summary>
        <ol className="ml-5 list-decimal">
          {spec.main.map((s) => <li key={s.ref}><span className="font-mono">{s.ref}</span> {s.actor}: {s.text}</li>)}
        </ol>
        <ul className="ml-5 list-disc">
          {spec.alternates.map((a) => <li key={a.ref}><span className="font-mono">{a.ref}</span> (step {a.atStep}) {a.condition} — {a.steps} {a.outcome === 'end' ? 'Scenario ends.' : `Rejoin at step ${a.rejoinAt}.`}</li>)}
        </ul>
      </details>

      <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Nodes ({flow.nodes.length})</legend>
        <table className="w-full text-left text-xs">
          <thead><tr><th>Name</th><th>Kind</th><th>Realises (ConOps items)</th><th>Subsets FN</th><th /></tr></thead>
          <tbody data-testid="w11-flow-nodes">
            {flow.nodes.map((x, i) => (
              <tr key={x.id} className="border-t border-slate-100 align-top dark:border-slate-800">
                <td className="font-mono">{x.id}</td>
                <td>
                  <select aria-label={`Kind of ${x.id}`} className={input} value={x.kind} onChange={(e) => updateNode(i, { kind: e.target.value as NodeKind })}>
                    {NODE_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
                  </select>
                </td>
                <td>
                  <div className="flex flex-wrap gap-x-2">
                    {refs.map((r) => (
                      <label key={r} className="flex items-center gap-1">
                        <input type="checkbox" aria-label={`${x.id} realises ${r}`} checked={x.covers.includes(r)} onChange={(e) => updateNode(i, { covers: e.target.checked ? [...x.covers, r] : x.covers.filter((c) => c !== r) })} />
                        <span aria-hidden="true">{r}</span>
                      </label>
                    ))}
                  </div>
                </td>
                <td><input aria-label={`FN subsetted by ${x.id}`} className={`${input} w-24`} value={x.fn ?? ''} placeholder="FN-0nn" onChange={(e) => updateNode(i, { fn: e.target.value })} /></td>
                <td><Button variant="ghost" ariaLabel={`Remove node ${x.id}`} onClick={() => removeNode(x.id)}>Remove</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="flex flex-col">New node name<input className={input} value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value.trim() })} placeholder="e.g. flagVertiport" /></label>
          <label className="flex flex-col">Kind
            <select className={input} value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as NodeKind })}>
              {NODE_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
          </label>
          <Button disabled={!draft.id || nodeIds.includes(draft.id)} onClick={() => { setFlow({ ...flow, nodes: [...flow.nodes, { id: draft.id, kind: draft.kind, covers: [] }] }); setDraft({ id: '', kind: 'action' }) }}>Add node</Button>
        </div>
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Successions ({flow.edges.length})</legend>
        <ul className="space-y-1 font-mono text-xs" data-testid="w11-flow-edges">
          {flow.edges.map((e, i) => (
            <li key={`${e.from}-${e.to}-${i}`} className="flex items-center gap-2">
              <span>{e.from === START ? 'first start; then' : `first ${e.from}`} {e.guard ? (e.guard === 'else' ? 'else' : `if ${e.guard}`) : 'then'} {e.to};</span>
              <Button variant="ghost" ariaLabel={`Remove succession ${e.from} to ${e.to}`} onClick={() => setFlow({ ...flow, edges: flow.edges.filter((_, j) => j !== i) })}>Remove</Button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <label className="flex flex-col">From
            <select className={input} value={edge.from} onChange={(e) => setEdge({ ...edge, from: e.target.value })}>
              {[START, ...nodeIds].map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label className="flex flex-col">Guard (blank, a condition, or else)<input className={input} value={edge.guard} onChange={(e) => setEdge({ ...edge, guard: e.target.value })} /></label>
          <label className="flex flex-col">To
            <select className={input} value={edge.to} onChange={(e) => setEdge({ ...edge, to: e.target.value })}>
              {[...nodeIds, DONE].map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <Button onClick={() => setFlow({ ...flow, edges: [...flow.edges, { from: edge.from, to: edge.to, ...(edge.guard.trim() ? { guard: edge.guard.trim() } : {}) }] })}>Add succession</Button>
        </div>
      </fieldset>

      <section aria-live="polite">
        <h4 className="font-medium">Checks</h4>
        {hideFindings && <p className="text-xs" data-testid="w11-flow-locked">Results on Team K’s draft are hidden until you have written your own findings: {unlock.message}</p>}
        <ul className="space-y-1" data-testid="w11-flow-findings">
          {(hideFindings ? [] : findings).map((f) => (
            <li key={f.id}>
              <span aria-hidden="true" className="mr-1 font-bold">{mark(f.ok, f.level)}</span>
              <span className="sr-only">{f.ok ? 'Pass' : f.level === 'error' ? 'Error' : 'Advisory'}: </span>
              {f.message} <span className="text-xs text-slate-600 dark:text-slate-400">({f.source})</span>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">✓ pass · ✗ error · ! advisory (a decision for the modeller). Passing these checks does not make a SysML file valid. They do not tell whether a guard is the right condition, whether an alternate's own steps are all there, or whether a node does what its ConOps step says — read the flow for those.</p>
      </section>

      <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <summary className="cursor-pointer font-medium">Mapping table (Markdown) for the L11 deliverable</summary>
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs" tabIndex={0}>{mappingMarkdown(spec, flow)}</pre>
      </details>
    </div>
  )
}
