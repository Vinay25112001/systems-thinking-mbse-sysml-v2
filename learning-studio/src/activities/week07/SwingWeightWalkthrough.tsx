import { useState } from 'react'
import { Button, CitationText } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { useW07 } from './store'
import { RANGE_PROBES, checkElicitation, type Elicitation } from './swing'
import { isHigherBetter, normaliseWeights } from './trade'

const input = 'rounded border border-slate-300 bg-white px-1 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900'
const th = 'px-1.5 py-1 text-left font-semibold'
const td = 'px-1.5 py-1 align-top'

export function SwingWeightWalkthrough() {
  const [st, set] = useW07()
  const criteria = st.study.criteria
  const [e, setE] = usePersistentState<Elicitation>('w07-swing-elicitation', { rank: {}, points: {} })
  const [checked, setChecked] = useState(false)
  const [probe, setProbe] = usePersistentState<Record<string, string>>('w07-swing-probes', {})
  const [probeShown, setProbeShown] = useState(false)
  const [applied, setApplied] = useState('')
  const res = checkElicitation(criteria, e)
  const current = normaliseWeights(criteria)

  const apply = () => {
    if (!res.ok) return
    set((x) => ({ ...x, study: { ...x.study, criteria: x.study.criteria.map((c) => ({ ...c, swingPoints: e.points[c.id]! })) } }))
    setApplied('Your swing points are now in the trade-study simulator; its weights, totals and reversal points have been recomputed.')
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w07-swing-walkthrough">
      <ol className="list-decimal space-y-1 pl-5 text-xs">
        <li>Imagine an alternative that sits at the walk-away point on every criterion.</li>
        <li>You may move exactly one criterion from walk-away to stretch goal. Which swing would you take first? Rank all swings (1 = first).</li>
        <li>Give the first-ranked swing 100 points. Score each other swing relative to it: “this swing is worth __ % of the first one”.</li>
        <li>Check, normalise and compare. <CitationText c={{ reading: 'R18', pages: '466' }} /></li>
      </ol>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-xs">
          <caption className="text-left text-xs text-slate-600 dark:text-slate-400">The swings (from the current trade study)</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              {['Criterion', 'Swing (walk-away → stretch goal)', 'Your rank', 'Your points', 'Your weight', 'Current weight in the simulator'].map((h) => (
                <th key={h} scope="col" className={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800">
                <th scope="row" className={`${td} font-normal`}>{c.id} {c.name}</th>
                <td className={td}>
                  {c.worst} → {c.best} {c.unit} ({isHigherBetter(c) ? 'higher is better' : 'lower is better'})
                </td>
                <td className={td}>
                  <select aria-label={`Rank of the ${c.id} swing`} className={input} value={e.rank[c.id] ?? ''} onChange={(ev) => { setE({ ...e, rank: { ...e.rank, [c.id]: ev.target.value ? Number(ev.target.value) : undefined } }); setChecked(false) }}>
                    <option value="">–</option>
                    {criteria.map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </td>
                <td className={td}>
                  <input aria-label={`Points for the ${c.id} swing`} type="number" min={1} max={100} className={`w-16 ${input}`} value={e.points[c.id] ?? ''} onChange={(ev) => { setE({ ...e, points: { ...e.points, [c.id]: ev.target.value === '' ? undefined : Number(ev.target.value) } }); setChecked(false) }} />
                </td>
                <td className={`${td} font-mono`}>{checked && res.weights ? res.weights[c.id].toFixed(3) : '—'}</td>
                <td className={`${td} font-mono`}>{current[c.id].toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setChecked(true)}>Check my elicitation</Button>
        <Button variant="secondary" onClick={apply} disabled={!checked || !res.ok}>Use my swing points in the simulator</Button>
      </div>
      {checked && (
        <div role="status" className="text-xs" data-testid="w07-swing-feedback">
          {res.ok ? <p className="text-emerald-800 dark:text-emerald-300">✓ Consistent: anchor at 100, points non-increasing down the ranking. Write one sentence of rationale per swing in your L7 workbook — it is what RB-6.3 scores.</p> : res.issues.map((i) => <p key={i} className="text-rose-800 dark:text-rose-300">✗ {i}</p>)}
        </div>
      )}
      {applied && <p role="status" className="text-xs">{applied}</p>}

      <section>
        <h4 className="font-semibold">Range probes: a swing weight is about a range, not about importance in the abstract</h4>
        <div className="mt-1 space-y-2">
          {RANGE_PROBES.map((p) => (
            <fieldset key={p.id} className="text-xs">
              <legend>{p.prompt}</legend>
              <div className="mt-1 flex gap-3">
                {(['rise', 'fall', 'same'] as const).map((o) => (
                  <label key={o} className="flex items-center gap-1">
                    <input type="radio" name={`w07-${p.id}`} value={o} checked={probe[p.id] === o} onChange={() => setProbe({ ...probe, [p.id]: o })} />
                    {o === 'same' ? 'stay the same' : o}
                  </label>
                ))}
              </div>
              {probeShown && probe[p.id] && (
                <p className={probe[p.id] === p.answer ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'} data-testid={`w07-probe-${p.id}`}>
                  {probe[p.id] === p.answer ? '✓ ' : `✗ The points should ${p.answer === 'same' ? 'stay the same' : p.answer}. `}
                  {p.why}
                </p>
              )}
            </fieldset>
          ))}
        </div>
        <Button variant="secondary" onClick={() => setProbeShown(true)}>Check my answers</Button>
      </section>
    </div>
  )
}
