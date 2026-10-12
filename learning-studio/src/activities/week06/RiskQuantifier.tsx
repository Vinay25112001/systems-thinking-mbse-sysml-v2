import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { LIKELIHOOD, cellLevel } from './risk'
import { R008_EXAMPLE, compareWithOrdinal, eventTree, likelihoodBand, pAtLeastOneBinomial, sensitivity, type QuantInput } from './quant'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
type State = QuantInput & { ordinalL: number; consequence: number }
const DEFAULT: State = { ...R008_EXAMPLE, ordinalL: 2, consequence: 5 }
const pct = (p: number) => (p === 0 ? '0 %' : p < 0.001 ? `${(p * 100).toExponential(2)} %` : `${(p * 100).toPrecision(3)} %`)
const num = (s: string) => {
  const v = Number(s)
  return Number.isFinite(v) ? v : 0
}

export function RiskQuantifier() {
  const [s, setS] = usePersistentState<State>('w06-quant', DEFAULT)
  const tree = eventTree(s)
  const worst = tree.outcomes[tree.outcomes.length - 1]
  const cmp = compareWithOrdinal(worst.pAtLeastOne, s.ordinalL)
  const sens = sensitivity(s)
  const exposures = s.exposuresPerYear * s.years
  const setBarrier = (i: number, patch: Partial<QuantInput['barriers'][number]>) => setS({ ...s, barriers: s.barriers.map((b, j) => (j === i ? { ...b, ...patch } : b)) })

  return (
    <div className="space-y-4 text-sm" data-testid="w06-risk-quantifier">
      <p>
        Build an explicit probability model for one risk and compare it with the ordinal rating your team gave it. Exposures × initiating probability gives the expected number of initiating events (Poisson; the exact binomial is shown for comparison); an event tree over the barriers splits each initiation into outcomes. All default values are the FICTIONAL R-008 worked example.
      </p>
      <fieldset className="grid gap-2 sm:grid-cols-3">
        <legend className="sr-only">Model inputs</legend>
        <label className="flex flex-col gap-1">
          Exposures per year
          <input className={input} inputMode="decimal" value={s.exposuresPerYear} onChange={(e) => setS({ ...s, exposuresPerYear: num(e.target.value) })} />
        </label>
        <label className="flex flex-col gap-1">
          Initiating probability per exposure (p0)
          <input className={input} inputMode="decimal" defaultValue={String(s.p0)} key={`p0-${s.p0}`} onBlur={(e) => setS({ ...s, p0: num(e.target.value) })} />
        </label>
        <label className="flex flex-col gap-1">
          Horizon (years)
          <input className={input} inputMode="decimal" value={s.years} onChange={(e) => setS({ ...s, years: num(e.target.value) })} />
        </label>
        {s.barriers.map((b, i) => (
          <div key={i} className="contents">
            <label className="flex flex-col gap-1 sm:col-span-2">
              Barrier {i + 1}
              <input className={input} value={b.name} onChange={(e) => setBarrier(i, { name: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              Barrier {i + 1} failure probability
              <input className={input} inputMode="decimal" value={b.failProb} onChange={(e) => setBarrier(i, { failProb: num(e.target.value) })} />
            </label>
          </div>
        ))}
        <label className="flex flex-col gap-1">
          Your ordinal likelihood for the worst outcome
          <select className={input} value={s.ordinalL} onChange={(e) => setS({ ...s, ordinalL: Number(e.target.value) })}>
            {LIKELIHOOD.map((l) => (
              <option key={l.level} value={l.level}>
                L{l.level} {l.label} ({l.band})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Your ordinal consequence for the worst outcome
          <select className={input} value={s.consequence} onChange={(e) => setS({ ...s, consequence: Number(e.target.value) })}>
            {[1, 2, 3, 4, 5].map((c) => (
              <option key={c} value={c}>
                C{c}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <Button variant="secondary" onClick={() => setS(s.barriers.length < 3 ? { ...s, barriers: [...s.barriers, { name: 'Further barrier', failProb: 0.5 }] } : s)} disabled={s.barriers.length >= 3}>
            Add barrier
          </Button>
          <Button variant="ghost" onClick={() => setS(DEFAULT)}>
            Reset to R-008 example
          </Button>
        </div>
      </fieldset>

      <table className="w-full text-left text-xs" data-testid="w06-tree">
        <caption className="text-left font-medium">
          Event tree over {s.years} year(s): {exposures.toLocaleString('en-US')} exposures; expected initiating events {tree.initiations.toPrecision(4)}; P(at least one) {pct(tree.pInitiation)} (exact binomial {pct(pAtLeastOneBinomial(exposures, s.p0))}) — {likelihoodBand(tree.pInitiation).label}
        </caption>
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="py-1 pr-2">Outcome path</th>
            <th className="py-1 pr-2">Fraction of initiations</th>
            <th className="py-1 pr-2">Expected events</th>
            <th className="py-1 pr-2">P(at least one)</th>
            <th className="py-1">DoD band (R46 p.126)</th>
          </tr>
        </thead>
        <tbody>
          {tree.outcomes.map((o) => (
            <tr key={o.id} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-0.5 pr-2">{o.path}</td>
              <td className="py-0.5 pr-2">{o.fraction.toPrecision(3)}</td>
              <td className="py-0.5 pr-2">{o.expected.toPrecision(3)}</td>
              <td className="py-0.5 pr-2">{pct(o.pAtLeastOne)}</td>
              <td className="py-0.5">{likelihoodBand(o.pAtLeastOne).label}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p data-testid="w06-quant-compare" className="rounded bg-slate-50 p-2 dark:bg-slate-800/60">
        Worst outcome vs your rating: {cmp.message} Your cell L{s.ordinalL} × C{s.consequence} is {cellLevel(s.ordinalL, s.consequence)}.
      </p>

      <table className="w-full text-left text-xs" data-testid="w06-sensitivity">
        <caption className="text-left font-medium">Sensitivity: initiating probability ÷ 10, as entered, × 10 (R17 p.486 — challenge results; inputs are uncertain)</caption>
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="py-1 pr-2">p0 factor</th>
            <th className="py-1 pr-2">P(any initiation)</th>
            <th className="py-1 pr-2">Band</th>
            <th className="py-1 pr-2">P(worst outcome)</th>
            <th className="py-1">Band</th>
          </tr>
        </thead>
        <tbody>
          {sens.map((r) => (
            <tr key={r.factor} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-0.5 pr-2">× {r.factor}</td>
              <td className="py-0.5 pr-2">{pct(r.pInitiation)}</td>
              <td className="py-0.5 pr-2">{likelihoodBand(r.pInitiation).label}</td>
              <td className="py-0.5 pr-2">{pct(r.pWorst)}</td>
              <td className="py-0.5">{likelihoodBand(r.pWorst).label}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Questions for your write-up: Which event does your ordinal rating describe — the initiation or the worst outcome? Over what horizon? Which barrier would you improve, and does the matrix cell change when you do?
      </p>
    </div>
  )
}
