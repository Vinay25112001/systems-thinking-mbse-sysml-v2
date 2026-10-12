import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { STATUS_LABEL, STATUS_SYMBOL, TPMS, TPM_HISTORY, assessHistory, type TpmPoint, type TpmStatus } from './measures'

const input = 'w-24 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const fill: Record<TpmStatus, string> = { breach: '#e11d48', 'at-risk': '#d97706', 'on-track': '#0284c7' }

type DotProps = { cx?: number; cy?: number; payload?: { status: TpmStatus } }
function StatusDot({ cx, cy, payload }: DotProps) {
  if (cx === undefined || cy === undefined || !payload) return null
  const c = fill[payload.status]
  if (payload.status === 'breach') return <path d={`M${cx - 5},${cy - 5}L${cx + 5},${cy + 5}M${cx + 5},${cy - 5}L${cx - 5},${cy + 5}`} stroke={c} strokeWidth={2.5} />
  if (payload.status === 'at-risk') return <path d={`M${cx},${cy - 6}L${cx + 6},${cy + 5}L${cx - 6},${cy + 5}Z`} fill={c} />
  return <circle cx={cx} cy={cy} r={4.5} fill={c} />
}

export function TpmTracker() {
  const [tpmId, setTpmId] = usePersistentState('w05-tpm-selected', 'TPM-002')
  const [added, setAdded] = usePersistentState<Record<string, TpmPoint[]>>('w05-tpm-added', {})
  const [draft, setDraft] = useState({ month: '', cbe: '', contingency: '', basis: '' })
  const [error, setError] = useState('')
  const spec = TPMS.find((t) => t.id === tpmId) ?? TPMS[0]
  const points = useMemo(() => [...TPM_HISTORY[spec.id], ...(added[spec.id] ?? [])], [spec.id, added])
  const sortedPoints = useMemo(() => [...points].sort((a, b) => a.month - b.month), [points])
  const rows = useMemo(() => assessHistory(spec, sortedPoints), [spec, sortedPoints])
  const last = rows.at(-1)!
  const data = rows.map((r) => ({ month: r.month, margin: r.marginWce, status: r.status }))

  const add = () => {
    const month = Number(draft.month)
    const cbe = Number(draft.cbe)
    const contingency = Number(draft.contingency)
    if (![month, cbe, contingency].every((x) => Number.isFinite(x)) || draft.month === '' || draft.cbe === '' || draft.contingency === '') return setError('Enter a month, a current best estimate and a contingency (numbers).')
    if (contingency < 0) return setError('Contingency cannot be negative.')
    if (points.some((p) => p.month === month) || month <= Math.max(...points.map((p) => p.month))) return setError('The new review must be later than the last one.')
    setError('')
    setAdded({ ...added, [spec.id]: [...(added[spec.id] ?? []), { month, cbe, contingency, basis: draft.basis.trim() ? `Student entry: ${draft.basis.trim()}` : 'Student entry (no basis given)' }] })
    setDraft({ month: '', cbe: '', contingency: '', basis: '' })
  }

  const sign = spec.sense === 'lower-is-better' ? '+' : '−'
  return (
    <div className="space-y-4 text-sm" data-testid="w05-tpm-tracker">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          TPM
          <select className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900" value={spec.id} onChange={(e) => setTpmId(e.target.value)}>
            {TPMS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} {t.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {spec.sense === 'lower-is-better' ? 'Lower is better' : 'Higher is better'} · threshold {spec.threshold} {spec.unit} · objective {spec.objective} {spec.unit} · alert floor {spec.alertFloor} {spec.unit} · tracks {spec.tracks} (MOP {spec.mop}) · all values FICTIONAL
        </p>
      </div>

      <figure className="rounded-lg border border-slate-200 p-2 dark:border-slate-800">
        <figcaption className="px-1 text-xs font-semibold">
          {spec.id} worst-case margin by review month ({spec.unit}){' '}
          <span className="font-normal text-slate-600 dark:text-slate-400">— marker shape shows status (● on track, ▲ at risk, ✖ breach); solid line at 0 = threshold, dashed line = alert floor; values in the table below</span>
        </figcaption>
        <div className="h-56" role="img" aria-label="Margin chart for the selected TPM; the table below gives the same values and statuses.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#94a3b833" strokeDasharray="3 3" />
              <XAxis dataKey="month" type="number" domain={['dataMin', 'dataMax']} stroke="#64748b" tick={{ fontSize: 10 }} label={{ value: 'month', position: 'insideBottomRight', offset: -2, fontSize: 10, fill: '#64748b' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} width={40} domain={[(min: number) => Math.min(0, min) - 0.5, (max: number) => max + 0.5]} />
              <Tooltip formatter={(v) => [`${v} ${spec.unit}`, 'WCE margin']} labelFormatter={(m) => `Month ${m}`} />
              <ReferenceLine y={0} stroke="#e11d48" strokeWidth={1.5} label={{ value: 'threshold', fontSize: 10, fill: '#64748b', position: 'insideTopLeft' }} />
              <ReferenceLine y={spec.alertFloor} stroke="#d97706" strokeDasharray="5 4" label={{ value: 'alert floor', fontSize: 10, fill: '#64748b', position: 'insideTopLeft' }} />
              <Line type="linear" dataKey="margin" stroke="#0284c7" strokeWidth={2} dot={<StatusDot />} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </figure>

      <table className="w-full text-left text-xs">
        <caption className="text-left font-medium">Margin arithmetic at each review (WCE = CBE {sign} contingency; contingency should fall only as the basis matures, R44 p.117)</caption>
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th scope="col" className="py-1 pr-2">Month</th>
            <th scope="col" className="py-1 pr-2">CBE</th>
            <th scope="col" className="py-1 pr-2">Contingency</th>
            <th scope="col" className="py-1 pr-2">Basis of the estimate</th>
            <th scope="col" className="py-1 pr-2">WCE</th>
            <th scope="col" className="py-1 pr-2">Margin vs CBE</th>
            <th scope="col" className="py-1 pr-2">Margin vs WCE</th>
            <th scope="col" className="py-1 pr-2">Projected next</th>
            <th scope="col" className="py-1">Status (rule)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.month} className="border-b border-slate-100 align-top dark:border-slate-800">
              <td className="py-0.5 pr-2">{r.month}</td>
              <td className="py-0.5 pr-2">{r.cbe}</td>
              <td className="py-0.5 pr-2">{sortedPoints[i].contingency}</td>
              <td className="py-0.5 pr-2">{sortedPoints[i].basis}</td>
              <td className="py-0.5 pr-2">{r.wce}</td>
              <td className="py-0.5 pr-2">{r.marginCbe}</td>
              <td className="py-0.5 pr-2">{r.marginWce}</td>
              <td className="py-0.5 pr-2">{r.projectedMargin ?? '—'}</td>
              <td className="py-0.5">
                <span aria-hidden="true">{STATUS_SYMBOL[r.status]} </span>
                {STATUS_LABEL[r.status]}
                {r.rule ? ` (${r.rule})` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800" role="status" data-testid="w05-tpm-status">
        <strong>
          Month {last.month}: {STATUS_LABEL[last.status]}
        </strong>
        {last.rule ? ` (rule ${last.rule})` : ''}. {last.reason} Objective {last.objectiveMet ? 'met' : 'not yet met'} (CBE {last.cbe} {spec.unit} vs objective {spec.objective} {spec.unit}).
      </p>

      <fieldset className="flex flex-wrap items-end gap-3 rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Add your next estimate</legend>
        <label className="flex flex-col gap-1">
          Review month
          <input className={input} inputMode="decimal" value={draft.month} onChange={(e) => setDraft({ ...draft, month: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          CBE ({spec.unit})
          <input className={input} inputMode="decimal" value={draft.cbe} onChange={(e) => setDraft({ ...draft, cbe: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          Contingency ({spec.unit})
          <input className={input} inputMode="decimal" value={draft.contingency} onChange={(e) => setDraft({ ...draft, contingency: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          Basis of the contingency
          <input className="w-56 rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900" value={draft.basis} onChange={(e) => setDraft({ ...draft, basis: e.target.value })} />
        </label>
        <Button onClick={add}>Add estimate</Button>
        <Button variant="secondary" onClick={() => setAdded({ ...added, [spec.id]: [] })}>
          Reset this TPM
        </Button>
      </fieldset>
      {error && (
        <p role="alert" className="text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
    </div>
  )
}
