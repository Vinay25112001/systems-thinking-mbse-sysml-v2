import { useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ownerProblem, ProvenanceOwnerFields, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Button, CitationText } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { useWorkspace } from '../../state/Workspace'
import { HORIZONS, WORKED_GAP, capabilityCoverage, checkCapability, gapAnalysis, l3CapabilityChecks, type CapDraft, type CapNode, type GapRow, type GapStatus } from './capabilities'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const blank: CapDraft = { name: '', text: '', needs: [], parent: '' }
const STATUS: Record<GapStatus, string> = {
  gap: 'GAP (shortfall)',
  'probable-gap': 'PROBABLE GAP (inside ±5 %, but the baseline is an upper bound)',
  excess: 'Excess',
  balanced: 'Balanced (±5 %)',
  incomplete: '—',
}

function Tree({ nodes, meta }: { nodes: CapNode[]; meta: (id: string) => string }) {
  return (
    <ul className="ml-4 list-disc space-y-0.5">
      {nodes.map((n) => (
        <li key={n.id}>
          <span className="font-medium">{n.id}</span> {n.name} <span className="text-slate-600 dark:text-slate-400">← {n.needs.length ? n.needs.join(', ') : 'no need (untraced)'}</span>
          {meta(n.id) && <span className="text-xs text-slate-600 dark:text-slate-400"> · owner / provenance: {meta(n.id)}</span>}
          {n.children.length > 0 && <Tree nodes={n.children} meta={meta} />}
        </li>
      ))}
    </ul>
  )
}

function GapAnalysis() {
  const empty: GapRow = { capability: '', measure: '', unit: '', baseline: {}, desired: {} }
  const [rows, setRows] = usePersistentState<GapRow[]>('w03-gap-rows', [empty])
  const result = gapAnalysis(rows)
  const num = (v: string) => (v.trim() === '' ? undefined : Number(v))
  const update = (i: number, patch: Partial<GapRow>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  return (
    <section data-testid="w03-gap">
      <h4 className="font-semibold">Part B — capability-gap analysis over three horizons (graduate)</h4>
      <p className="mt-1">
        Compare the desired level of a capability (from the needs and objectives) with the baseline level under current plans, per time bucket. A shortfall is a gap; a surplus is an excess (<CitationText c={{ reading: 'R12', pages: '862' }} />). Year-1/2/3 buckets suit a fast-changing service. Values are yours to justify; the worked example’s numbers are FICTIONAL.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <caption className="sr-only">Capability gap table: baseline and desired level per horizon</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1 pr-2">Capability and measure</th>
              {HORIZONS.map((h) => (
                <th key={h.id} className="py-1 pr-2">
                  {h.label}: baseline / desired → result
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 align-top dark:border-slate-800">
                <td className="py-1 pr-2">
                  <input className={`${input} w-full`} aria-label={`Row ${i + 1} capability`} value={r.capability} onChange={(e) => update(i, { capability: e.target.value })} />
                  <input className={`${input} mt-1 w-full`} aria-label={`Row ${i + 1} unit`} placeholder="unit, e.g. trips/day" value={r.unit} onChange={(e) => update(i, { unit: e.target.value })} />
                  <label className="mt-1 inline-flex items-center gap-1">
                    <input type="checkbox" checked={!!r.upperBound} onChange={(e) => update(i, { upperBound: e.target.checked })} aria-label={`Row ${i + 1} baseline is an upper bound`} />
                    Baseline is an upper bound
                  </label>
                </td>
                {HORIZONS.map((h, k) => {
                  const cell = result[i].cells[k]
                  return (
                    <td key={h.id} className="py-1 pr-2">
                      <div className="flex gap-1">
                        <input className={`${input} w-20`} type="number" aria-label={`Row ${i + 1} ${h.label} baseline`} value={r.baseline[h.id] ?? ''} onChange={(e) => update(i, { baseline: { ...r.baseline, [h.id]: num(e.target.value) } })} />
                        <input className={`${input} w-20`} type="number" aria-label={`Row ${i + 1} ${h.label} desired`} value={r.desired[h.id] ?? ''} onChange={(e) => update(i, { desired: { ...r.desired, [h.id]: num(e.target.value) } })} />
                      </div>
                      <p className="mt-0.5" data-testid={`w03-gap-${i}-${h.id}`}>
                        <strong>{STATUS[cell.status]}</strong>
                        {cell.delta !== undefined && ` (${cell.delta > 0 ? '+' : ''}${cell.delta} ${r.unit}; ${Math.round((cell.ratio ?? 0) * 100)} % of desired)`}
                      </p>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setRows([...rows, empty])}>Add row</Button>
        <Button variant="secondary" onClick={() => setRows(WORKED_GAP)}>Load the worked example</Button>
        <Button variant="ghost" onClick={() => setRows([empty])}>Clear</Button>
      </div>
      <p className="mt-2" data-testid="w03-gap-summary">
        {result
          .filter((r) => r.capability.trim())
          .map((r) => `${r.capability}: ${r.firstGap ? `first gap in the ${r.firstGap} term${r.firstGapProbable ? ' (probable: upper-bound baseline)' : ''}` : 'no gap in any horizon'}`)
          .join(' · ') || 'Enter at least one capability.'}
      </p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
        Test at least one assumption: change the value it drives (for example the minutes a charger is held per aircraft) and see whether the first gap moves. A conclusion that survives the change is robust; one that flips must be reported with its assumption.
      </p>
    </section>
  )
}

export function CapabilityBuilder() {
  const { model, apply } = useWorkspace()
  const [d, setD] = usePersistentState<CapDraft>('w03-cap-draft', blank)
  const [po, setPo] = usePersistentState<ProvenanceOwner>('w03-cap-po', DEFAULT_PROVENANCE_OWNER)
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const needs = model.elements.filter((e) => e.kind === 'NEED' && e.status === 'active')
  const caps = model.elements.filter((e) => e.kind === 'CAP' && e.status === 'active')
  const cov = capabilityCoverage(model)
  const checks = l3CapabilityChecks(cov)
  const { advisories } = checkCapability(d)

  const record = () => {
    const c = checkCapability(d)
    const ownerIssue = ownerProblem(po.owner)
    const errs = ownerIssue ? [...c.errors, ownerIssue] : c.errors
    setErrors(errs)
    if (errs.length) return
    const r = apply({
      elements: [{ key: 'cap', kind: 'CAP', name: d.name.trim(), text: d.text.trim(), owner: po.owner.trim().toUpperCase(), provenance: po.provenance }],
      links: [
        ...d.needs.map((n) => ({ source: 'cap', type: 'derives-from' as const, target: n, rationale: 'Recorded in Lab L3' })),
        ...(d.parent ? [{ source: 'cap', type: 'refines' as const, target: d.parent, rationale: `Constituent of ${d.parent}` }] : []),
      ],
    })
    if (r.error) {
      setMessage(`Not recorded: ${r.error}`)
      return
    }
    setMessage(`${r.ids.cap} recorded${d.parent ? ` as a constituent of ${d.parent}` : ''}, derived from ${d.needs.join(', ')}.`)
    setD(blank)
  }

  return (
    <div className="space-y-6 text-sm" data-testid="w03-capability-tree">
      <section>
        <h4 className="font-semibold">Part A — derive and decompose capabilities</h4>
        <p className="mt-1">
          A capability states what the enterprise must be able to do to meet one or more needs. Choose the needs it serves and, to decompose, the parent capability it is a constituent of (recorded as <em>refines</em>, the course’s teaching relationship). {needs.length} needs available.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            Capability name
            <input className={input} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            Constituent of (parent capability)
            <select className={input} value={d.parent} onChange={(e) => setD({ ...d, parent: e.target.value })}>
              <option value="">None (top-level capability)</option>
              {caps.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            What the enterprise must be able to do
            <textarea className={input} rows={2} value={d.text} onChange={(e) => setD({ ...d, text: e.target.value })} />
          </label>
        </div>
        <fieldset className="mt-2">
          <legend className="font-medium">Derives from (needs)</legend>
          <div className="mt-1 grid max-h-48 gap-1 overflow-y-auto sm:grid-cols-2">
            {needs.map((n) => (
              <label key={n.id} className="inline-flex items-start gap-1">
                <input type="checkbox" checked={d.needs.includes(n.id)} onChange={() => setD({ ...d, needs: d.needs.includes(n.id) ? d.needs.filter((x) => x !== n.id) : [...d.needs, n.id] })} />
                <span>
                  {n.id} {n.name}
                </span>
              </label>
            ))}
            {needs.length === 0 && <p>No needs yet: record them in the need-statement studio.</p>}
          </div>
        </fieldset>
        {advisories.length > 0 && <p className="mt-2">Advisory: {advisories.join(' ')}</p>}
        <div className="mt-2">
          <ProvenanceOwnerFields value={po} onChange={setPo} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button onClick={record}>Record capability</Button>
          <span role="status" data-testid="w03-cap-message">
            {message}
          </span>
        </div>
        {errors.length > 0 && (
          <ul role="alert" className="mt-1 list-disc pl-5 text-rose-700 dark:text-rose-300">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h4 className="font-semibold">Capability tree and coverage</h4>
        {cov.roots.length ? <Tree nodes={cov.roots} meta={(id) => { const e = caps.find((x) => x.id === id); return e ? `${e.owner ?? '—'} / ${e.provenance}` : '' }} /> : <p>No capabilities yet.</p>}
        <ul className="mt-2 space-y-0.5" data-testid="w03-cap-checks">
          {checks.map((c) => (
            <li key={c.id}>
              <strong>{c.ok ? '✓ Pass' : '✗ Not yet'}</strong> — {c.label}
              {c.detail ? ` (${c.detail})` : ''}
            </li>
          ))}
        </ul>
        {cov.uncoveredNeeds.length > 0 && <p className="mt-1" data-testid="w03-cap-gaps">Needs with no capability (coverage gaps): {cov.uncoveredNeeds.join(', ')}.</p>}
        {cov.singleChild.length > 0 && <p className="mt-1">Advisory: {cov.singleChild.join(', ')} each have a single constituent. Name the other constituents, or say why one is enough.</p>}
      </section>
      <GapAnalysis />
    </div>
  )
}
