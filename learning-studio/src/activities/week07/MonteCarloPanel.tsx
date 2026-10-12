import { useState } from 'react'
import { Button, CitationText } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { Bars } from './charts'
import { REFERENCE_DRIVERS, REFERENCE_SHARED, REFERENCE_UNCERTAINTY } from './reference'
import { useW07 } from './store'
import { checkStudy, derivedFormula, distIssue, distMean, driverIssue, isDerived, monteCarlo, rank, valueTable, type CellUncertainty, type Dist, type Driver, type MonteCarloResult } from './trade'

const input = 'rounded border border-slate-300 bg-white px-1 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900'
const n3 = 'w-16 ' + input
const th = 'px-1.5 py-1 text-left font-semibold'
const td = 'px-1.5 py-1 align-top'
const f3 = (x: number) => (Number.isFinite(x) ? x.toFixed(3) : '—')
const num = (s: string) => (s.trim() === '' ? NaN : Number(s))

type CellKind = CellUncertainty['kind']

export function MonteCarloPanel() {
  const [st, set] = useW07()
  const { study, unc, shared, drivers } = st
  const [n, setN] = usePersistentState<number>('w07-mc-n', 5000)
  const [seed, setSeed] = usePersistentState<number>('w07-mc-seed', 2026)
  const [result, setResult] = useState<{ a: MonteCarloResult; b?: MonteCarloResult } | null>(null)
  const [err, setErr] = useState('')
  const blocking = checkStudy(study).some((i) => i.level === 'error')
  const det = blocking ? [] : rank(valueTable(study))
  const driverNames = Object.fromEntries(drivers.map((d) => [d.id, d.name]))

  const setDist = (a: string, c: string, d: CellUncertainty) => set((x) => ({ ...x, unc: { ...x.unc, [a]: { ...(x.unc[a] ?? {}), [c]: d } } }))
  const toggleShared = (c: string) => set((x) => ({ ...x, shared: x.shared.includes(c) ? x.shared.filter((y) => y !== c) : [...x.shared, c] }))
  const setDriver = (id: string, patch: Partial<Driver>) => set((x) => ({ ...x, drivers: x.drivers.map((d) => (d.id === id ? { ...d, ...patch } : d)) }))
  const addDriver = () =>
    set((x) => {
      let k = x.drivers.length + 1
      while (x.drivers.some((d) => d.id === `X${k}`)) k++
      return { ...x, drivers: [...x.drivers, { id: `X${k}`, name: 'New driver', unit: '', dist: { kind: 'triangular', low: 0, mode: 1, high: 2 } }] }
    })
  const removeDriver = (id: string) => set((x) => ({ ...x, drivers: x.drivers.filter((d) => d.id !== id) }))
  const loadRef = () => {
    set((x) => ({ ...x, unc: structuredClone(REFERENCE_UNCERTAINTY), drivers: structuredClone(REFERENCE_DRIVERS), shared: [...REFERENCE_SHARED] }))
    setResult(null)
  }
  const bad = [
    ...drivers.map((d) => ({ where: `driver ${d.id}`, why: driverIssue(d) })),
    ...study.alternatives.flatMap((a) => study.criteria.map((c) => ({ where: `${a.id}/${c.id}`, why: distIssue(unc[a.id]?.[c.id] ?? { kind: 'fixed' }, drivers) }))),
  ].filter((x) => x.why)
  const run = (compare: boolean) => {
    if (blocking) return setErr('Fix the errors in the trade study first (simulator above).')
    if (bad.length) return setErr(`Fix the distributions first: ${bad.map((x) => `${x.where} ${x.why}`).join('; ')}.`)
    if (!(n >= 100 && n <= 50000) || !Number.isInteger(seed)) return setErr('Use 100–50,000 trials and a whole-number seed.')
    setErr('')
    const a = monteCarlo(study, unc, { n, seed, shared, drivers })
    const b = compare ? monteCarlo(study, unc, { n, seed, drivers, independentDrivers: true }) : undefined
    setResult({ a, b })
  }
  const changeKind = (aId: string, cId: string, k: CellKind, nominal: number) => {
    const first = drivers[0]
    const mode = first ? (first.dist.kind === 'triangular' ? first.dist.mode : first.dist.kind === 'uniform' ? (first.dist.low + first.dist.high) / 2 : 1) : 1
    const next: CellUncertainty =
      k === 'fixed'
        ? { kind: 'fixed' }
        : k === 'uniform'
          ? { kind: 'uniform', low: nominal, high: nominal }
          : k === 'triangular'
            ? { kind: 'triangular', low: nominal, mode: nominal, high: nominal }
            : k === 'linear'
              ? { kind: 'linear', constant: 0, terms: [{ driver: first?.id ?? '', coef: mode ? nominal / mode : 1 }] }
              : { kind: 'wait', driver: first?.id ?? '', capacity: 1 }
    setDist(aId, cId, next)
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w07-monte-carlo">
      <p>
        Give each uncertain <strong>driver</strong> — an independent variable that moves one or more scores, such as the demand forecast — a lower bound, a most-likely value and an upper bound. A score that follows from a driver through a model (wait from demand, capital from unit prices) is entered as <em>derived</em>: each trial draws every driver once and pushes the same value through every alternative’s model, so one forecast moves all the waits together. Scores with no driver model get their own triangular or uniform distribution. Each trial recomputes the additive value with the current weights and records which alternative ranks first. <CitationText c={{ reading: 'R18', pages: '471–472' }} />
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={loadRef}>Load reference uncertainty (FICTIONAL)</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-xs" data-testid="w07-mc-drivers">
          <caption className="text-left text-xs text-slate-600 dark:text-slate-400">Uncertain drivers (one draw per trial, shared by every score derived from it)</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              {['ID', 'Driver', 'Unit', 'Distribution', 'Low', 'Most likely', 'High', ''].map((h) => (
                <th key={h} scope="col" className={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const issue = driverIssue(d)
              return (
                <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800">
                  <th scope="row" className={`${td} font-mono font-normal`}>{d.id}</th>
                  <td className={td}><input aria-label={`Driver ${d.id} name`} className={input} value={d.name} onChange={(e) => setDriver(d.id, { name: e.target.value })} /></td>
                  <td className={td}><input aria-label={`Driver ${d.id} unit`} className={n3} value={d.unit} onChange={(e) => setDriver(d.id, { unit: e.target.value })} /></td>
                  <td className={td}>
                    <select
                      aria-label={`Driver ${d.id} distribution`}
                      className={input}
                      value={d.dist.kind}
                      onChange={(e) => {
                        const lo = d.dist.kind === 'fixed' ? 0 : d.dist.low
                        const hi = d.dist.kind === 'fixed' ? 1 : d.dist.high
                        setDriver(d.id, { dist: e.target.value === 'uniform' ? { kind: 'uniform', low: lo, high: hi } : { kind: 'triangular', low: lo, mode: (lo + hi) / 2, high: hi } })
                      }}
                    >
                      <option value="triangular">triangular</option>
                      <option value="uniform">uniform</option>
                    </select>
                  </td>
                  {d.dist.kind !== 'fixed' && (
                    <>
                      <td className={td}><input aria-label={`Driver ${d.id} low`} type="number" className={n3} value={Number.isFinite(d.dist.low) ? d.dist.low : ''} onChange={(e) => setDriver(d.id, { dist: { ...(d.dist as Exclude<Dist, { kind: 'fixed' }>), low: num(e.target.value) } })} /></td>
                      <td className={td}>
                        {d.dist.kind === 'triangular' ? (
                          <input aria-label={`Driver ${d.id} most likely`} type="number" className={n3} value={Number.isFinite(d.dist.mode) ? d.dist.mode : ''} onChange={(e) => setDriver(d.id, { dist: { ...(d.dist as Extract<Dist, { kind: 'triangular' }>), mode: num(e.target.value) } })} />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className={td}><input aria-label={`Driver ${d.id} high`} type="number" className={n3} value={Number.isFinite(d.dist.high) ? d.dist.high : ''} onChange={(e) => setDriver(d.id, { dist: { ...(d.dist as Exclude<Dist, { kind: 'fixed' }>), high: num(e.target.value) } })} /></td>
                    </>
                  )}
                  <td className={td}>
                    <Button variant="ghost" ariaLabel={`Remove driver ${d.id}`} onClick={() => removeDriver(d.id)}>✕</Button>
                    {issue && <span className="block text-[10px] text-rose-700 dark:text-rose-300">✗ {issue}</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Button variant="secondary" onClick={addDriver}>Add driver</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-xs">
          <caption className="text-left text-xs text-slate-600 dark:text-slate-400">Score uncertainty per alternative and criterion (measure units). “Fixed” uses the nominal score from the simulator; “derived” computes the score from the drivers.</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th scope="col" className={th}>Alternative</th>
              {study.criteria.map((c) => (
                <th key={c.id} scope="col" className={th}>
                  {c.id} ({c.unit})
                  <label className="mt-0.5 flex items-center gap-1 font-normal">
                    <input type="checkbox" checked={shared.includes(c.id)} onChange={() => toggleShared(c.id)} aria-label={`${c.id} elicited distributions drawn at the same quantile`} />
                    same quantile (approximation)
                  </label>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {study.alternatives.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800">
                <th scope="row" className={`${td} font-normal`}>{a.id}</th>
                {study.criteria.map((c) => {
                  const d = unc[a.id]?.[c.id] ?? { kind: 'fixed' as const }
                  const nominal = a.scores[c.id]
                  const issue = distIssue(d, drivers)
                  return (
                    <td key={c.id} className={td}>
                      <select aria-label={`${a.id} ${c.id} distribution`} className={input} value={d.kind} onChange={(e) => changeKind(a.id, c.id, e.target.value as CellKind, nominal)}>
                        <option value="fixed">fixed {Number.isFinite(nominal) ? nominal : ''}</option>
                        <option value="uniform">uniform</option>
                        <option value="triangular">triangular</option>
                        <option value="linear">derived: linear in a driver</option>
                        <option value="wait">derived: wait model</option>
                      </select>
                      {(d.kind === 'uniform' || d.kind === 'triangular') && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          <input aria-label={`${a.id} ${c.id} low`} type="number" className={n3} value={Number.isFinite(d.low) ? d.low : ''} onChange={(e) => setDist(a.id, c.id, { ...d, low: num(e.target.value) })} />
                          {d.kind === 'triangular' && <input aria-label={`${a.id} ${c.id} most likely`} type="number" className={n3} value={Number.isFinite(d.mode) ? d.mode : ''} onChange={(e) => setDist(a.id, c.id, { ...d, mode: num(e.target.value) })} />}
                          <input aria-label={`${a.id} ${c.id} high`} type="number" className={n3} value={Number.isFinite(d.high) ? d.high : ''} onChange={(e) => setDist(a.id, c.id, { ...d, high: num(e.target.value) })} />
                          <span className="w-full text-[10px] text-slate-500 dark:text-slate-400">mean {f3(distMean(d, nominal))}</span>
                        </div>
                      )}
                      {isDerived(d) && (
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {(d.kind === 'wait' || d.terms.length === 1) && (
                            <select
                              aria-label={`${a.id} ${c.id} driver`}
                              className={input}
                              value={d.kind === 'wait' ? d.driver : d.terms[0].driver}
                              onChange={(e) => setDist(a.id, c.id, d.kind === 'wait' ? { ...d, driver: e.target.value } : { ...d, terms: [{ ...d.terms[0], driver: e.target.value }] })}
                            >
                              {drivers.map((x) => (
                                <option key={x.id} value={x.id}>{x.id}</option>
                              ))}
                            </select>
                          )}
                          {d.kind === 'wait' && (
                            <label className="flex items-center gap-1">
                              ÷ capacity
                              <input aria-label={`${a.id} ${c.id} capacity`} type="number" className={n3} value={Number.isFinite(d.capacity) ? d.capacity : ''} onChange={(e) => setDist(a.id, c.id, { ...d, capacity: num(e.target.value) })} />
                            </label>
                          )}
                          {d.kind === 'linear' && d.terms.length === 1 && (
                            <>
                              <label className="flex items-center gap-1">
                                ×
                                <input aria-label={`${a.id} ${c.id} coefficient`} type="number" className={n3} value={Number.isFinite(d.terms[0].coef) ? d.terms[0].coef : ''} onChange={(e) => setDist(a.id, c.id, { ...d, terms: [{ ...d.terms[0], coef: num(e.target.value) }] })} />
                              </label>
                              <label className="flex items-center gap-1">
                                +
                                <input aria-label={`${a.id} ${c.id} constant`} type="number" className={n3} value={Number.isFinite(d.constant) ? d.constant : ''} onChange={(e) => setDist(a.id, c.id, { ...d, constant: num(e.target.value) })} />
                              </label>
                            </>
                          )}
                          <span className="w-full text-[10px] text-slate-500 dark:text-slate-400" data-testid={`w07-mc-formula-${a.id}-${c.id}`}>= {derivedFormula(d, driverNames)}</span>
                        </div>
                      )}
                      {issue && <span className="block text-[10px] text-rose-700 dark:text-rose-300">✗ {issue}</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        The wait model is the Week 1 approximation 2 ÷ (1 − u) at u = demand ÷ capacity, with u capped at 0.97 and 120 min added per unit of overload (a course extension). “Same quantile” draws the elicited distributions of a criterion at one common quantile in each trial: a rank-correlation approximation for scores you believe move together but cannot model. It is not the same as a shared driver, because equal quantiles of different distributions need not correspond to one value of the driver; prefer a derived score whenever the model is known.
      </p>
      <div className="flex flex-wrap items-end gap-3 text-xs">
        <label className="flex flex-col gap-1">
          Trials
          <input aria-label="Number of trials" type="number" className={`w-24 ${input}`} value={n} onChange={(e) => setN(Math.round(num(e.target.value)))} />
        </label>
        <label className="flex flex-col gap-1">
          Seed (same seed → same result)
          <input aria-label="Random seed" type="number" className={`w-24 ${input}`} value={seed} onChange={(e) => setSeed(Math.round(num(e.target.value)))} />
        </label>
        <Button onClick={() => run(false)}>Run Monte Carlo</Button>
        <Button variant="secondary" onClick={() => run(true)}>Run and compare with independent draws</Button>
      </div>
      {err && <p role="alert" className="text-xs text-rose-800 dark:text-rose-300">{err}</p>}
      {result && (
        <section aria-live="polite" data-testid="w07-mc-result">
          <h4 className="font-semibold">Probability of ranking first ({result.a.n} trials, seed {result.a.seed})</h4>
          <Bars rows={det.map((r) => ({ id: r.id, value: result.a.pFirst[r.id], note: `± ${f3(result.a.seFirst[r.id])}` }))} label="Bar chart of the probability that each alternative ranks first; the table below gives the same data." />
          <table className="mt-2 w-full text-xs" data-testid="w07-mc-table">
            <caption className="text-left text-xs text-slate-600 dark:text-slate-400">
              Monte Carlo summary ({drivers.length ? `drivers ${drivers.map((d) => d.id).join(', ')} drawn once per trial` : 'no drivers'}{shared.length ? `; same quantile on ${shared.join(', ')}` : ''}). ± is the Monte Carlo standard error √(p(1−p)/n): the precision of the estimate given these inputs, not the accuracy of the inputs.
            </caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                {['Alternative', 'Deterministic value (rank)', 'P(first) ± s.e.', 'Mean value', '5th–95th percentile', 'Mean rank', ...(result.b ? ['P(first), independent draws'] : [])].map((h) => (
                  <th key={h} scope="col" className={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {det.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                  <th scope="row" className={`${td} font-normal`}>{r.id}</th>
                  <td className={`${td} font-mono`}>{f3(r.total)} ({r.rank})</td>
                  <td className={`${td} font-mono`} data-testid={`w07-pfirst-${r.id}`}>{f3(result.a.pFirst[r.id])} ± {f3(result.a.seFirst[r.id])}</td>
                  <td className={`${td} font-mono`}>{f3(result.a.mean[r.id])}</td>
                  <td className={`${td} font-mono`}>{f3(result.a.p05[r.id])}–{f3(result.a.p95[r.id])}</td>
                  <td className={`${td} font-mono`}>{result.a.meanRank[r.id].toFixed(2)}</td>
                  {result.b && <td className={`${td} font-mono`}>{f3(result.b.pFirst[r.id])}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          {result.b && <p className="mt-1 text-xs">“Independent draws” gives every derived score its own draw of each driver, as if each alternative had its own forecast, and ignores “same quantile”: it shows what ignoring the shared drivers would do.</p>}
          <p className="mt-2 text-xs">
            Interpret, do not just report: does the deterministic winner stay first in most trials? In which trials does it lose — which driver, and which side of its range? Does the order of the others change when uncertainty is skewed? Which assumption about shared drivers is closer to your situation, and what does the comparison with independent draws change?
          </p>
        </section>
      )}
    </div>
  )
}
