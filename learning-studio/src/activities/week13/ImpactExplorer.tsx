import { useMemo, useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ProvenanceOwnerFields, ownerProblem, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { referenceUpTo } from '../../model/reference'
import { useWorkspace } from '../../state/Workspace'
import { directedImpact, impactMarkdown, margin, recommendationProblem, summarise, tpmsMeasuring, type ImpactItem } from './impact'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const th = 'border-b border-slate-200 px-2 py-1 text-left dark:border-slate-700'
const td = 'border-b border-slate-100 px-2 py-1 align-top dark:border-slate-800'

type Draft = { start: string; change: string; newLimit: string; prediction: string; computed: boolean; mustChange: string[]; recommendation: string }
const BLANK: Draft = { start: '', change: '', newLimit: '', prediction: '', computed: false, mustChange: [], recommendation: '' }

export function ImpactExplorer() {
  const { model, apply } = useWorkspace()
  const [practice, setPractice] = usePersistentState<boolean>('w13-impact-practice', true)
  const [d, setD] = usePersistentState<Draft>('w13-impact-draft', BLANK)
  const [who, setWho] = usePersistentState<ProvenanceOwner>('w13-impact-owner', DEFAULT_PROVENANCE_OWNER)
  const [decName, setDecName] = useState('')
  const [status, setStatus] = useState('')
  const source = useMemo(() => (practice ? referenceUpTo(14) : model), [practice, model])
  const elements = useMemo(() => source.elements.filter((e) => e.status === 'active' && e.kind !== 'STK').sort((a, b) => a.id.localeCompare(b.id)), [source])
  const predictionOk = /^\d{1,3}$/.test(d.prediction.trim())
  const result = useMemo(() => (d.computed && d.start ? directedImpact(source, d.start, d.mustChange) : null), [d.computed, d.start, d.mustChange, source])
  const tpms = d.start.startsWith('REQ-') ? tpmsMeasuring(source, d.start) : []
  const newLimit = d.newLimit.trim() === '' ? null : Number(d.newLimit)
  const recMsg = recommendationProblem(d.recommendation)
  const ownerMsg = ownerProblem(who.owner)
  const impacted = result ? [...result.firstOrder, ...result.secondOrder].map((i) => i.id) : []
  const nameOk = decName.trim().split(/\s+/).filter(Boolean).length >= 3
  const canSave = !practice && !!result && !recMsg && !ownerMsg && nameOk && d.change.trim().length > 0

  const set = (patch: Partial<Draft>) => setD({ ...d, ...patch })
  const toggle = (id: string) => set({ mustChange: d.mustChange.includes(id) ? d.mustChange.filter((x) => x !== id) : [...d.mustChange, id] })

  const save = () => {
    const r = apply({
      elements: [{ key: 'dec', kind: 'DEC', name: decName.trim(), text: d.recommendation.trim(), provenance: who.provenance, owner: who.owner.trim().toUpperCase(), attributes: { change: d.change.trim(), changedElement: d.start, mustChange: d.mustChange.join(', '), method: 'Week 13 directed impact (course dependency table)' } }],
      links: impacted.map((id) => ({ source: 'dec', type: 'affects' as const, target: id, rationale: `Impact set of the change to ${d.start} (Week 13)` })),
    })
    if (r.error) { setStatus(`Not saved: ${r.error}`); return }
    setStatus(`Saved ${r.ids.dec} affecting ${impacted.length} element(s) (${who.owner.trim().toUpperCase()}, ${who.provenance}).`)
    setDecName('')
  }

  const rows = (items: ImpactItem[], withToggle: boolean) => (
    <table className="w-full border-collapse text-xs">
      <thead><tr><th className={th}>ID</th><th className={th}>Name</th><th className={th}>Reached by</th><th className={th}>Action</th>{withToggle && <th className={th}>Must change?</th>}</tr></thead>
      <tbody>
        {items.map((i) => (
          <tr key={i.id}>
            <td className={td}><strong>{i.id}</strong></td>
            <td className={td}>{i.name}</td>
            <td className={td}>{i.via}{i.from ? ` (from ${i.from})` : ''}</td>
            <td className={td}>{i.action}</td>
            {withToggle && <td className={td}><label className="flex items-center gap-1"><input type="checkbox" checked={d.mustChange.includes(i.id)} onChange={() => toggle(i.id)} aria-label={`${i.id} must change in response`} /> yes</label></td>}
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div className="space-y-4 text-sm" data-testid="w13-impact-explorer">
      <p>State a change, predict, then derive its impact set from the model’s links. Hop 1 follows the course’s dependency table; hop 2 opens only from the elements you decide must change. The undirected reach is shown for comparison. The table is a method, not a verdict: you still judge every row.</p>
      <label className="flex items-center gap-2"><input type="checkbox" checked={practice} onChange={(e) => { setPractice(e.target.checked); setD(BLANK) }} /> Practice on the instructor reference (read-only: nothing is saved)</label>
      {!practice && elements.length === 0 && <p role="status">Your workspace has no elements yet. Tick the practice box, or load your model in the workspace.</p>}

      <fieldset className="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">1. The change</legend>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col">Changed element
            <select className={input} value={d.start} onChange={(e) => set({ ...BLANK, start: e.target.value })}>
              <option value="">— choose —</option>
              {elements.map((e) => <option key={e.id} value={e.id}>{e.id} {e.name}</option>)}
            </select>
          </label>
          <label className="flex grow flex-col">Change (what, from → to)<input className={input} value={d.change} onChange={(e) => set({ change: e.target.value })} placeholder="e.g. REQ-SYS-001 limit 20 min → 18 min" /></label>
          {tpms.length > 0 && <label className="flex flex-col">New limit for {tpms.map((t) => t.id).join(', ')} ({tpms[0].unit})<input className={`${input} w-24`} inputMode="decimal" value={d.newLimit} onChange={(e) => set({ newLimit: e.target.value })} /></label>}
        </div>
        {tpms.length > 0 && newLimit !== null && Number.isFinite(newLimit) && (
          <ul className="text-xs" data-testid="w13-impact-tpm">
            {tpms.map((t) => <li key={t.id}>{t.id}: threshold {t.threshold} → {newLimit} {t.unit}; estimate {t.currentEstimate} {t.unit}; margin against the estimate {margin(t.sense, t.threshold, t.currentEstimate)} → {margin(t.sense, newLimit, t.currentEstimate)} {t.unit}. Use the what-if analyser for the worst case and the status.</li>)}
          </ul>
        )}
      </fieldset>

      <fieldset className="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">2. Predict, then derive</legend>
        <label className="flex flex-col">Your prediction: how many elements must be re-examined at hop 1?
          <input className={`${input} w-24`} inputMode="numeric" value={d.prediction} onChange={(e) => set({ prediction: e.target.value, computed: false })} />
        </label>
        <Button onClick={() => set({ computed: true, mustChange: [] })} disabled={!d.start || !predictionOk}>Derive the impact set</Button>
        {!predictionOk && d.start && <p className="text-xs">Enter a whole-number prediction first.</p>}
      </fieldset>

      {result && (
        <>
          <section aria-label="First-order impact" className="space-y-1">
            <h4 className="font-medium" data-testid="w13-impact-count">Hop 1: {result.firstOrder.length} dependent element(s) to re-examine (your prediction {d.prediction}); {result.upstream.length} upstream for review. Undirected reach: {result.naive.map((n) => `${n.count} within ${n.depth} hop${n.depth > 1 ? 's' : ''}`).join(', ')} (of {result.activeElements - 1}).</h4>
            <div data-testid="w13-impact-first">{rows(result.firstOrder, true)}</div>
          </section>
          {result.upstream.length > 0 && (
            <section aria-label="Upstream" className="space-y-1">
              <h4 className="font-medium">Upstream (review only, nothing propagates)</h4>
              <div data-testid="w13-impact-up">{rows(result.upstream, false)}</div>
            </section>
          )}
          <section aria-label="Second-order impact" className="space-y-1">
            <h4 className="font-medium">Hop 2 (second order): {d.mustChange.length === 0 ? 'tick the hop-1 elements whose re-check fails and that must change in response.' : `${result.secondOrder.length} element(s) reached from ${d.mustChange.join(', ')}.`}</h4>
            {result.secondOrder.length > 0 && <div data-testid="w13-impact-second">{rows(result.secondOrder, false)}</div>}
          </section>
          <p className="text-xs" data-testid="w13-impact-summary">
            {(() => { const s = summarise(result); return `Consequences — verification to re-run: ${s.verification.join(', ') || 'none'}; measures: ${s.measures.join(', ') || 'none'}; risks and technology: ${s.risks.join(', ') || 'none'}; design: ${s.design.join(', ') || 'none'}; requirements: ${s.requirements.join(', ') || 'none'}.` })()}
          </p>

          <fieldset className="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-800">
            <legend className="px-1 font-medium">3. Recommendation</legend>
            <label className="flex flex-col">Recommendation (what to decide, the affected IDs, and the condition or reason)
              <textarea className={input} rows={3} value={d.recommendation} onChange={(e) => set({ recommendation: e.target.value })} />
            </label>
            <p className="text-xs" role="status" data-testid="w13-impact-rec">{recMsg ? `✗ Problem: ${recMsg}` : '✓ OK: the recommendation states a decision, names affected elements and gives a condition or reason.'}</p>
          </fieldset>

          {!practice && (
            <fieldset className="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-800">
              <legend className="px-1 font-medium">4. Record the decision (DEC) in your workspace</legend>
              <ProvenanceOwnerFields value={who} onChange={setWho} />
              <label className="flex flex-col">Decision name (≥ 3 words)<input className={input} value={decName} onChange={(e) => setDecName(e.target.value)} placeholder="e.g. Keep REQ-SYS-001 at 20 min" /></label>
              <p className="text-xs">Saving creates one DEC with the recommendation as its text and an <em>affects</em> link to each of the {impacted.length} impacted element(s).</p>
              <Button onClick={save} disabled={!canSave}>Save the decision to the workspace</Button>
              <p role="status" data-testid="w13-impact-status">{status}</p>
            </fieldset>
          )}

          <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
            <summary className="cursor-pointer font-medium">Impact report (Markdown) for L13</summary>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs" tabIndex={0} data-testid="w13-impact-export">{impactMarkdown(result, d.change, d.mustChange, d.recommendation)}</pre>
          </details>
        </>
      )}
    </div>
  )
}
