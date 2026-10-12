import { useMemo } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { referenceUpTo } from '../../model/reference'
import { CHECKS, CORRECTED_FRAGMENT, SEEDED_FRAGMENT, checkFragment, findingsMarkdown, referenceFragment, type Bound, type FragmentRow, type QuantityKind, type Role } from './consistency'

const input = 'w-full min-w-[4rem] rounded border border-slate-300 bg-white px-1 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900'
const th = 'border-b border-slate-200 px-1 py-1 text-left dark:border-slate-700'
const td = 'border-b border-slate-100 px-1 py-1 align-top dark:border-slate-800'
const ROLES: Role[] = ['limit', 'threshold', 'estimate', 'margin', 'criterion', 'design value', 'other']
const KINDS: QuantityKind[] = ['duration', 'power', 'energy', 'sound', 'fraction', 'none']
const BOUNDS: Bound[] = ['', 'max', 'min']
const TEXT: { key: 'id' | 'name' | 'feature' | 'value' | 'unit' | 'refersTo' | 'doc'; label: string }[] = [
  { key: 'id', label: 'ID' }, { key: 'name', label: 'Name' }, { key: 'feature', label: 'Feature' }, { key: 'value', label: 'Value' }, { key: 'unit', label: 'Unit' }, { key: 'refersTo', label: 'Refers to' }, { key: 'doc', label: 'Stated in text' },
]
const blankRow = (): FragmentRow => ({ id: '', name: '', feature: '', role: 'other', kind: 'duration', value: '', unit: '', bound: '', refersTo: '', doc: '' })

type Store = { rows: FragmentRow[]; myCount: string; ran: boolean; source: string }

export function ConsistencyReview() {
  const [s, setS] = usePersistentState<Store>('w13-consistency', { rows: SEEDED_FRAGMENT, myCount: '', ran: false, source: 'seeded fragment' })
  const findings = useMemo(() => checkFragment(s.rows), [s.rows])
  const countOk = /^\d{1,2}$/.test(s.myCount.trim())
  const load = (rows: FragmentRow[], source: string) => setS({ rows, myCount: '', ran: false, source })
  const setCell = (i: number, patch: Partial<FragmentRow>) => setS({ ...s, ran: false, rows: s.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) })

  return (
    <div className="space-y-4 text-sm" data-testid="w13-consistency-review">
      <p>Review a model fragment the way a reviewer does: one row per value-bearing feature. First inspect it yourself and count the inconsistencies you find; then run the checks. Each finding also says what the course-designated checker (release 2026-08) did with the same defect in the course probes. The checks catch common defects only; no findings does not prove the fragment consistent.</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => load(SEEDED_FRAGMENT, 'seeded fragment')}>Load the seeded fragment (worked example c)</Button>
        <Button variant="secondary" onClick={() => load(referenceFragment(referenceUpTo(14)), 'reference TPM rows')}>Load the reference TPM rows</Button>
        <Button variant="secondary" onClick={() => load(CORRECTED_FRAGMENT, 'one repaired fragment')}>Load one repaired fragment</Button>
        <Button variant="ghost" onClick={() => setS({ ...s, ran: false, rows: [...s.rows, blankRow()] })}>Add a row</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs" data-testid="w13-consistency-rows">
          <caption className="text-left font-medium">Fragment: {s.source} ({s.rows.length} rows)</caption>
          <thead><tr><th className={th}>#</th>{TEXT.slice(0, 3).map((c) => <th key={c.key} className={th}>{c.label}</th>)}<th className={th}>Role</th><th className={th}>Kind</th>{TEXT.slice(3, 5).map((c) => <th key={c.key} className={th}>{c.label}</th>)}<th className={th}>Bound</th>{TEXT.slice(5).map((c) => <th key={c.key} className={th}>{c.label}</th>)}<th className={th}>Remove</th></tr></thead>
          <tbody>
            {s.rows.map((r, i) => (
              <tr key={i}>
                <td className={td}>{i + 1}</td>
                {TEXT.slice(0, 3).map((c) => <td key={c.key} className={td}><input className={input} aria-label={`Row ${i + 1} ${c.label}`} value={r[c.key]} onChange={(e) => setCell(i, { [c.key]: e.target.value })} /></td>)}
                <td className={td}><select className={input} aria-label={`Row ${i + 1} Role`} value={r.role} onChange={(e) => setCell(i, { role: e.target.value as Role })}>{ROLES.map((x) => <option key={x} value={x}>{x}</option>)}</select></td>
                <td className={td}><select className={input} aria-label={`Row ${i + 1} Kind`} value={r.kind} onChange={(e) => setCell(i, { kind: e.target.value as QuantityKind })}>{KINDS.map((x) => <option key={x} value={x}>{x}</option>)}</select></td>
                {TEXT.slice(3, 5).map((c) => <td key={c.key} className={td}><input className={input} aria-label={`Row ${i + 1} ${c.label}`} value={r[c.key]} onChange={(e) => setCell(i, { [c.key]: e.target.value })} /></td>)}
                <td className={td}><select className={input} aria-label={`Row ${i + 1} Bound`} value={r.bound} onChange={(e) => setCell(i, { bound: e.target.value as Bound })}>{BOUNDS.map((x) => <option key={x} value={x}>{x || '—'}</option>)}</select></td>
                {TEXT.slice(5).map((c) => <td key={c.key} className={td}><input className={input} aria-label={`Row ${i + 1} ${c.label}`} value={r[c.key]} onChange={(e) => setCell(i, { [c.key]: e.target.value })} /></td>)}
                <td className={td}><Button variant="ghost" ariaLabel={`Remove row ${i + 1}`} onClick={() => setS({ ...s, ran: false, rows: s.rows.filter((_, j) => j !== i) })}>×</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <fieldset className="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Inspect first</legend>
        <label className="flex flex-col">How many inconsistencies did you find by inspection? (list them in your notes)
          <input className="w-24 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900" inputMode="numeric" value={s.myCount} onChange={(e) => setS({ ...s, myCount: e.target.value, ran: false })} />
        </label>
        <Button onClick={() => setS({ ...s, ran: true })} disabled={!countOk}>Run the consistency checks</Button>
      </fieldset>

      {s.ran && (
        <>
          <p data-testid="w13-consistency-count" role="status">{findings.length === 0 ? 'No findings from these checks (that does not prove the fragment consistent).' : `${findings.length} finding(s) from ${new Set(findings.map((f) => f.check)).size} check(s); you counted ${s.myCount}. Compare item by item: a finding may name the same defect twice, and the checks miss whatever they do not look for.`}</p>
          {findings.length > 0 && (
            <table className="w-full border-collapse text-xs" data-testid="w13-consistency-findings">
              <thead><tr><th className={th}>Check</th><th className={th}>Rows</th><th className={th}>Finding</th><th className={th}>The checker on the same defect (release 2026-08 probes)</th></tr></thead>
              <tbody>
                {findings.map((f, i) => (
                  <tr key={i}>
                    <td className={td}>{f.severity === 'error' ? '✗ Problem' : '? Check'}: {CHECKS.find((c) => c.id === f.check)!.label}</td>
                    <td className={td}>{f.rows.map((r) => r + 1).join(', ')}</td>
                    <td className={td}>{f.message}</td>
                    <td className={td}>{f.checker}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
            <summary className="cursor-pointer font-medium">Review record (Markdown)</summary>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs" tabIndex={0} data-testid="w13-consistency-export">{findingsMarkdown(s.rows, findings)}</pre>
          </details>
        </>
      )}
    </div>
  )
}
