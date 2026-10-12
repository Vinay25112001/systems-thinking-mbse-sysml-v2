import { useMemo } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { referenceUpTo } from '../../model/reference'
import { BASE_ENERGY, ENERGY_SCENARIOS, TPM_SPECS, editProblem, landingPercent, minRetainedFor, tripEnergy, usableEnergyEOL, whatIf, whatIfMarkdown, type EnergyInputs } from './margins'

const input = 'w-20 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const th = 'border-b border-slate-200 px-2 py-1 text-left dark:border-slate-700'
const td = 'border-b border-slate-100 px-2 py-1 align-top dark:border-slate-800'
const STATUS_WORD = { breach: '✗ BREACH', 'at-risk': '! AT RISK', 'on-track': '✓ On track' } as const

type Edits = Record<string, { cbe: string; contingency: string; threshold: string }>
const initialEdits = (): Edits => Object.fromEntries(TPM_SPECS.map((s) => [s.id, { cbe: String(s.cbe), contingency: String(s.contingency), threshold: String(s.threshold) }]))
const ENERGY_FIELDS: { key: keyof EnergyInputs; label: string }[] = [
  { key: 'usableEnergyBOL', label: 'Usable energy, beginning of life (kWh)' },
  { key: 'capacityRetainedEOL', label: 'Capacity retained at end of life (0–1)' },
  { key: 'terminalPower', label: 'Terminal-phase power (kW)' },
  { key: 'terminalTime', label: 'Terminal-phase time (min)' },
  { key: 'cruisePower', label: 'Cruise power (kW)' },
  { key: 'cruiseTime', label: 'Cruise time (min)' },
]

export function MarginWhatIf() {
  const ref = useMemo(() => referenceUpTo(14), [])
  const [edits, setEdits] = usePersistentState<Edits>('w13-whatif-edits', initialEdits)
  const [energy, setEnergy] = usePersistentState<EnergyInputs>('w13-whatif-energy', BASE_ENERGY)
  const [label, setLabel] = usePersistentState<string>('w13-whatif-label', 'Baseline (reference estimates)')
  const parsed = Object.fromEntries(Object.entries(edits).map(([id, e]) => [id, { cbe: Number(e.cbe), contingency: Number(e.contingency), threshold: Number(e.threshold) }]))
  const problems = Object.entries(parsed).map(([id, v]) => [id, editProblem(v)] as const).filter(([, p]) => p)
  const rows = problems.length ? [] : whatIf(ref, parsed)
  const energyOk = Object.values(energy).every((x) => Number.isFinite(x) && x > 0) && energy.capacityRetainedEOL <= 1
  const setEdit = (id: string, k: 'cbe' | 'contingency' | 'threshold', v: string) => setEdits({ ...edits, [id]: { ...edits[id], [k]: v } })
  const applyEnergy = (inputs: EnergyInputs, name: string) => {
    setEnergy(inputs)
    setEdits({ ...edits, 'TPM-003': { ...edits['TPM-003'], cbe: String(landingPercent(inputs)) } })
    setLabel(name)
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w13-margin-whatif">
      <p>Change a TPM’s estimate, contingency or threshold, or recompute TPM-003 from the energy inputs of the analysis case, and see the margins, the status, the requirement each TPM tracks, the verification to re-run and the risks whose trigger reads the margin. All values are FICTIONAL teaching values; computed estimates are <strong>analysis-computed (teaching)</strong>, never aircraft data.</p>

      <fieldset className="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">TPM-003 from the energy model (same expressions as worked example (a))</legend>
        <div className="flex flex-wrap gap-2">
          {ENERGY_SCENARIOS.map((s) => <Button key={s.id} variant="secondary" onClick={() => applyEnergy(s.inputs, s.label)}>{s.label}</Button>)}
        </div>
        <div className="flex flex-wrap gap-3">
          {ENERGY_FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col text-xs">{f.label}
              <input className={input} inputMode="decimal" value={String(energy[f.key])} onChange={(e) => setEnergy({ ...energy, [f.key]: Number(e.target.value) })} />
            </label>
          ))}
        </div>
        {energyOk ? (
          <p className="text-xs" data-testid="w13-whatif-energy">Trip energy {tripEnergy(energy)} kWh; usable at end of life {usableEnergyEOL(energy)} kWh; landing energy {landingPercent(energy)} % of usable. With these trip inputs the reserve needs at least {Math.round(minRetainedFor(energy, 0.2) * 1000) / 10} % capacity retained (20 % on the estimate) or {Math.round(minRetainedFor(energy, 0.215) * 1000) / 10} % (20 % on the worst case, contingency 1.5 points).</p>
        ) : <p role="alert" className="text-xs">Every energy input must be a positive number, and capacity retained at most 1.</p>}
        <Button onClick={() => applyEnergy(energy, 'Custom energy inputs')} disabled={!energyOk}>Use this landing energy as the TPM-003 estimate</Button>
      </fieldset>

      <table className="w-full border-collapse text-xs" data-testid="w13-whatif-inputs">
        <caption className="text-left font-medium">Inputs (edit any cell)</caption>
        <thead><tr><th className={th}>TPM</th><th className={th}>Threshold</th><th className={th}>Current best estimate</th><th className={th}>Contingency</th><th className={th}>Unit, sense</th></tr></thead>
        <tbody>
          {TPM_SPECS.map((s) => (
            <tr key={s.id}>
              <td className={td}><strong>{s.id}</strong> {s.name}</td>
              {(['threshold', 'cbe', 'contingency'] as const).map((k) => (
                <td key={k} className={td}><input className={input} inputMode="decimal" aria-label={`${s.id} ${k === 'cbe' ? 'current best estimate' : k}`} value={edits[s.id]?.[k] ?? ''} onChange={(e) => setEdit(s.id, k, e.target.value)} /></td>
              ))}
              <td className={td}>{s.unit}, {s.sense}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="ghost" onClick={() => { setEdits(initialEdits()); setEnergy(BASE_ENERGY); setLabel('Baseline (reference estimates)') }}>Reset to the reference values</Button>
      {problems.map(([id, p]) => <p key={id} role="alert" className="text-xs">✗ {id}: {p}</p>)}

      {rows.length > 0 && (
        <>
          <table className="w-full border-collapse text-xs" data-testid="w13-whatif-results">
            <caption className="text-left font-medium">Results: {label}</caption>
            <thead><tr><th className={th}>TPM</th><th className={th}>WCE</th><th className={th}>Margin (CBE)</th><th className={th}>Margin (WCE)</th><th className={th}>Status</th><th className={th}>Tracks</th><th className={th}>Re-run if not on track</th><th className={th}>Risks and triggers</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.spec.id}>
                  <td className={td}><strong>{r.spec.id}</strong></td>
                  <td className={td}>{r.a.wce} {r.spec.unit}</td>
                  <td className={td}>{r.a.marginCbe}</td>
                  <td className={td}>{r.a.marginWce}</td>
                  <td className={td}><span>{STATUS_WORD[r.a.status]}</span>{r.a.rule ? ` (${r.a.rule})` : ''}<br />{r.a.reason}</td>
                  <td className={td}>{r.links.requirement ?? '—'}</td>
                  <td className={td}>{r.a.status === 'on-track' ? '—' : r.links.verifications.join(', ') || '—'}</td>
                  <td className={td}>{r.links.risks.length === 0 ? '—' : r.links.risks.map((k) => <div key={k.id}>{k.id} {k.name}{k.floor !== null ? `: trigger “${k.trigger}” ${k.firesOnCbe ? 'FIRES' : 'does not fire'} on the CBE margin, ${k.firesOnWce ? 'FIRES' : 'does not fire'} on the WCE margin` : ' (no margin trigger: re-assess by judgement)'}</div>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
            <summary className="cursor-pointer font-medium">What-if table (Markdown) for the L13 report</summary>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs" tabIndex={0} data-testid="w13-whatif-export">{whatIfMarkdown(rows, label)}</pre>
          </details>
        </>
      )}
    </div>
  )
}
