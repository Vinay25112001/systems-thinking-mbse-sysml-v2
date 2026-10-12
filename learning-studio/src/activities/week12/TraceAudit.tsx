import { useMemo, useState } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { referenceUpTo } from '../../model/reference'
import { useWorkspace } from '../../state/Workspace'
import { GAP_LABEL, RULES, audit, auditMarkdown, dispositionProblem, fmt, gapKey, pct, predictionOk } from './audit'
import type { ModelSource } from './ThreadExplorer'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

export function TraceAudit() {
  const { model: ws } = useWorkspace()
  const [source, setSource] = usePersistentState<ModelSource>('w12-audit-source', 'reference')
  const model = useMemo(() => (source === 'reference' ? referenceUpTo(12) : ws), [source, ws])
  const a = useMemo(() => audit(model), [model])
  const [allDisp, setAllDisp] = usePersistentState<Record<ModelSource, Record<string, string>>>('w12-audit-dispositions', { reference: {}, workspace: {} })
  const disp = allDisp[source] ?? {}
  const setDisp = (d: Record<string, string>) => setAllDisp({ ...allDisp, [source]: d })
  const [pred, setPred] = useState({ sat: '', ver: '' })
  const [shown, setShown] = useState(false)
  const [generatedAt, setGeneratedAt] = useState('')
  const canCompute = predictionOk(pred.sat) && predictionOk(pred.ver)
  const label = source === 'reference' ? 'instructor reference baseline (Week 12)' : 'my workspace model'
  const diff = (guess: string, actual: number) => (predictionOk(guess) ? ` (your prediction ${parseFloat(guess)} %, off by ${Math.abs(parseFloat(guess) - actual).toFixed(1)} points)` : '')

  return (
    <div className="space-y-4 text-sm" data-testid="w12-trace-audit">
      <fieldset className="flex flex-wrap gap-4">
        <legend className="sr-only">Model to audit</legend>
        <label className="flex items-center gap-1"><input type="radio" name="w12-audit-src" checked={source === 'reference'} onChange={() => { setSource('reference'); setShown(false) }} /> Instructor reference (read-only)</label>
        <label className="flex items-center gap-1"><input type="radio" name="w12-audit-src" checked={source === 'workspace'} onChange={() => { setSource('workspace'); setShown(false) }} /> My workspace model</label>
      </fieldset>

      <fieldset className="flex flex-wrap items-end gap-3 rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Predict first (all requirements, {a.parent.all.of} in this model)</legend>
        <label className="flex flex-col">% satisfied<input className={`${input} w-24`} inputMode="decimal" value={pred.sat} onChange={(e) => setPred({ ...pred, sat: e.target.value })} /></label>
        <label className="flex flex-col">% verified<input className={`${input} w-24`} inputMode="decimal" value={pred.ver} onChange={(e) => setPred({ ...pred, ver: e.target.value })} /></label>
        <Button disabled={!canCompute} onClick={() => { setGeneratedAt(new Date().toISOString()); setShown(true) }}>Compute the audit</Button>
        {!canCompute && <span className="text-xs" role="status">Enter both predictions (0–100 %) first.</span>}
      </fieldset>

      {shown && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs" data-testid="w12-audit-table">
              <caption className="text-left font-medium">Requirement coverage — {label} ({a.elements} active elements, {a.links} links; digest {a.digest})</caption>
              <thead><tr className="text-left"><th className="border-b p-1">Measure</th><th className="border-b p-1">All REQ</th><th className="border-b p-1">REQ-STK</th><th className="border-b p-1">REQ-SYS</th></tr></thead>
              <tbody>
                {([['Has a parent', a.parent], ['Satisfied', a.satisfied], ['Verified (has a VER)', a.verified]] as const).map(([k, r]) => (
                  <tr key={k}><th scope="row" className="border-b p-1 text-left font-normal">{k}</th><td className="border-b p-1">{fmt(r.all)}</td><td className="border-b p-1">{fmt(r.stk)}</td><td className="border-b p-1">{fmt(r.sys)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="list-disc pl-5" data-testid="w12-audit-metrics">
            <li>Satisfied, all requirements: {pct(a.satisfied.all)} %{diff(pred.sat, pct(a.satisfied.all))}; verified: {pct(a.verified.all)} %{diff(pred.ver, pct(a.verified.all))}.</li>
            <li>REQ-STK verified directly or through a verified child requirement (course rule): {fmt(a.stkVerifiedOrThroughChild)}.</li>
            <li>Upward trace to a NEED or CAP (RB-9.1): {fmt(a.upwardToNeedOrCap)}; NEED derived from a stakeholder: {fmt(a.needToStakeholder)}.</li>
            <li>REQ-SYS with a satisfy and a recorded verification method (RB-9.2): {fmt(a.sysSatisfiedWithMethod)}.</li>
            <li>Orphans: {a.orphans.join(', ') || 'none'}. Childless parents: {[...a.childless, ...a.gaps.filter((g) => g.kind === 'childless-stk').map((g) => g.id)].join(', ') || 'none'}.</li>
            <li>Complete 11-step threads: {a.completeThreads} from {a.threadStakeholders} stakeholder(s) (CP5 minimum: 3).</li>
          </ul>

          <section aria-label="Gaps and dispositions">
            <h4 className="font-medium">Gaps — record a disposition for each (RB-9.4)</h4>
            {a.gaps.length === 0 && <p>No gaps by these rules. That is not the same as a correct design: read the threads.</p>}
            <ul className="space-y-2" data-testid="w12-audit-gaps">
              {a.gaps.map((g) => {
                const k = gapKey(g)
                const problem = disp[k] ? dispositionProblem(disp[k]) : 'No disposition yet.'
                return (
                  <li key={k}>
                    <label className="flex flex-col"><span><strong>{g.id}</strong> — {GAP_LABEL[g.kind]}</span>
                      <textarea className={input} rows={2} value={disp[k] ?? ''} onChange={(e) => setDisp({ ...disp, [k]: e.target.value })} placeholder="Action and owner (e.g. owner AL, by CP5), or why the gap is accepted and where it is tracked" />
                    </label>
                    <span className="text-xs"><span aria-hidden="true" className="mr-1 font-bold">{problem ? '✗' : '✓'}</span>{problem ?? 'Disposition recorded.'}</span>
                  </li>
                )
              })}
            </ul>
          </section>

          <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
            <summary className="cursor-pointer font-medium">Counting rules (state them with your numbers)</summary>
            <ul className="ml-5 list-disc text-xs">{RULES.map((r) => <li key={r}>{r}</li>)}</ul>
          </details>
          <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
            <summary className="cursor-pointer font-medium">Audit report (Markdown) to attach to L12</summary>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs" tabIndex={0} data-testid="w12-audit-export">{auditMarkdown(a, label, disp, generatedAt)}</pre>
          </details>
        </>
      )}
    </div>
  )
}
