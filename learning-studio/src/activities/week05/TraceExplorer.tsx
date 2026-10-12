import { useMemo, useState } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { referenceUpTo } from '../../model/reference'
import { useWorkspace } from '../../state/Workspace'
import { PEER_SAMPLE, comparePrediction, traceRows, traceSummary } from './trace'

type Source = 'peer' | 'workspace' | 'reference'
const SOURCES: { id: Source; label: string }[] = [
  { id: 'peer', label: 'Peer-team sample (Team Kestrel, FICTIONAL)' },
  { id: 'workspace', label: 'My team’s workspace' },
  { id: 'reference', label: 'Instructor reference (end of Week 5)' },
]
const list = (xs: string[]) => (xs.length ? xs.join(', ') : '—')

export function TraceExplorer() {
  const { model: workspace } = useWorkspace()
  const [source, setSource] = usePersistentState<Source>('w05-trace-source', 'peer')
  const [predOrphans, setPredOrphans] = useState<string[]>([])
  const [predChildless, setPredChildless] = useState<string[]>([])
  const [predStk, setPredStk] = useState<string[]>([])
  const [checked, setChecked] = useState(false)

  const model = useMemo(() => (source === 'peer' ? PEER_SAMPLE : source === 'reference' ? referenceUpTo(5) : workspace), [source, workspace])
  const rows = useMemo(() => traceRows(model), [model])
  const summary = useMemo(() => traceSummary(model), [model])
  const parents = model.elements.filter((e) => (e.kind === 'NEED' || e.kind === 'CAP') && e.status === 'active').map((e) => e.id).sort()
  const fbO = comparePrediction(predOrphans, summary.orphans)
  const fbC = comparePrediction(predChildless, summary.childlessNeedsCaps)
  const fbS = comparePrediction(predStk, summary.childlessStakeholderReqs)
  const stkRows = rows.filter((r) => r.level === 'stakeholder')

  const toggle = (xs: string[], set: (v: string[]) => void, id: string) => set(xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id])
  const choose = (s: Source) => {
    setSource(s)
    setPredOrphans([])
    setPredChildless([])
    setPredStk([])
    setChecked(false)
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w05-trace-explorer">
      <fieldset className="flex flex-wrap gap-3">
        <legend className="mb-1 font-medium">Requirement set to trace</legend>
        {SOURCES.map((s) => (
          <label key={s.id} className="flex items-center gap-1.5">
            <input type="radio" name="w05-trace-source" checked={source === s.id} onChange={() => choose(s.id)} />
            {s.label}
          </label>
        ))}
      </fieldset>

      {rows.length === 0 ? (
        <p role="status">This set has no active requirements yet. Record your L4 requirements in the workspace, or choose another set.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <caption className="text-left font-medium">Bidirectional trace table ({rows.length} requirements)</caption>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th scope="col" className="py-1 pr-2">Requirement</th>
                  <th scope="col" className="py-1 pr-2">Backward: parents</th>
                  <th scope="col" className="py-1 pr-2">Forward: child REQs</th>
                  <th scope="col" className="py-1 pr-2">Satisfied by</th>
                  <th scope="col" className="py-1 pr-2">Verified by</th>
                  <th scope="col" className="py-1">Measured by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                    <th scope="row" className="py-0.5 pr-2 font-normal">
                      <span className="font-mono">{r.id}</span> {r.name}
                    </th>
                    <td className="py-0.5 pr-2">{r.parents.length ? r.parents.join(', ') : <strong>none (orphan)</strong>}</td>
                    <td className="py-0.5 pr-2">{list(r.children)}</td>
                    <td className="py-0.5 pr-2">{list(r.satisfiedBy)}</td>
                    <td className="py-0.5 pr-2">{list(r.verifiedBy)}</td>
                    <td className="py-0.5">{list(r.measuredBy)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
              <legend className="px-1 font-medium">Predict: which requirements are orphans?</legend>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {rows.map((r) => (
                  <label key={r.id} className="flex items-center gap-1 font-mono text-xs">
                    <input type="checkbox" checked={predOrphans.includes(r.id)} onChange={() => toggle(predOrphans, setPredOrphans, r.id)} aria-label={`Orphan ${r.id}`} />
                    {r.id}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
              <legend className="px-1 font-medium">Predict: which needs and capabilities are childless?</legend>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {parents.length === 0 && <span>No NEED or CAP in this set.</span>}
                {parents.map((p) => (
                  <label key={p} className="flex items-center gap-1 font-mono text-xs">
                    <input type="checkbox" checked={predChildless.includes(p)} onChange={() => toggle(predChildless, setPredChildless, p)} aria-label={`Childless ${p}`} />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
              <legend className="px-1 font-medium">Predict: which stakeholder requirements are childless (no lower-level requirement, no design element)?</legend>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {stkRows.length === 0 && <span>No REQ-STK in this set.</span>}
                {stkRows.map((r) => (
                  <label key={r.id} className="flex items-center gap-1 font-mono text-xs">
                    <input type="checkbox" checked={predStk.includes(r.id)} onChange={() => toggle(predStk, setPredStk, r.id)} aria-label={`Childless stakeholder requirement ${r.id}`} />
                    {r.id}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <Button onClick={() => setChecked(true)}>Compute the trace and check my prediction</Button>

          {checked && (
            <div className="space-y-2 rounded-lg bg-slate-100 p-3 dark:bg-slate-800" data-testid="w05-trace-result" role="status">
              <p>
                <strong>Parent coverage:</strong> {summary.withParent} of {summary.requirements} requirements ({Math.round(summary.parentCoverage * 100)} %) trace to a parent.
              </p>
              <p>
                <strong>Orphans</strong> (no parent; R45 p.118): {list(summary.orphans)}.{' '}
                {fbO.exact ? 'Your prediction is exactly right.' : `You found ${fbO.correct.length}; missed: ${list(fbO.missed)}; not orphans: ${list(fbO.wrong)}.`}
              </p>
              <p>
                <strong>Childless parents, check 1 (R45 p.118)</strong>: high-level (stakeholder) requirements not yet addressed by a lower-level requirement or a satisfying design element: {list(summary.childlessStakeholderReqs)}.{' '}
                {fbS.exact ? 'Your prediction is exactly right.' : `You found ${fbS.correct.length}; missed: ${list(fbS.missed)}; not childless: ${list(fbS.wrong)}.`} R45 asks that each one is <em>ultimately</em> addressed, so early in the project these are open items, not errors.
              </p>
              <p>
                <strong>Childless parents, check 2 (course extension of the same idea)</strong>: needs and capabilities with no requirement derived from or refining them, of {summary.parentsChecked} checked: {list(summary.childlessNeedsCaps)}.{' '}
                {fbC.exact ? 'Your prediction is exactly right.' : `You found ${fbC.correct.length}; missed: ${list(fbC.missed)}; not childless: ${list(fbC.wrong)}.`} For each, decide: missing requirement or missing link?
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
