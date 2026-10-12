import { useState } from 'react'
import { Button, CitationText } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import {
  DIRECTION_LABEL,
  EXCLUDED_STAKEHOLDERS,
  MATRIX_STAKEHOLDERS,
  SUPPORT_LABEL,
  VARIABLES,
  compareWithKey,
  conflictsByPair,
  findConflicts,
  keyDirection,
  keyWhy,
  refStakeholder,
  supportGaps,
  type Direction,
  type Matrix,
  type SupportLevel,
} from './conflicts'

const select = 'rounded border border-slate-300 bg-white px-1 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-900'
const SYMBOL: Record<Direction, string> = { up: '↑', down: '↓', none: '–' }
const name = (id: string) => `${id} ${refStakeholder(id).name}`
const vname = (id: string) => VARIABLES.find((v) => v.id === id)?.name ?? id

export function ConflictMatrix() {
  const [m, setM] = usePersistentState<Matrix>('w02-conflict-matrix', {})
  const [support, setSupport] = usePersistentState<Record<string, SupportLevel | undefined>>('w02-support', {})
  const [compared, setCompared] = useState(false)
  const conflicts = findConflicts(m)
  const pairs = conflictsByPair(conflicts)
  const cmp = compareWithKey(m)
  const gaps = supportGaps(support)
  const setCell = (s: string, v: string, d: string) => {
    setM((p) => ({ ...p, [s]: { ...(p[s] ?? {}), [v]: (d || undefined) as Direction | undefined } }))
    setCompared(false)
  }

  return (
    <div className="space-y-5 text-sm" data-testid="w02-conflict-matrix">
      <section>
        <h4 className="font-semibold">Part A — which way does each stakeholder want each decision variable to move?</h4>
        <p className="mt-1">
          Base each cell on the stakeholder’s concern in the reference map (STK-001..014). Influence ratings (1–5) are the FICTIONAL calibration values of the reference map. Conflicts are then <em>computed</em>: one stakeholder wants more of a variable, another wants less.
        </p>
        <p className="mt-1 text-xs" data-testid="w02-matrix-scope">
          Scope: {MATRIX_STAKEHOLDERS.length} of the 14 reference stakeholders and five decision variables. Left out: {EXCLUDED_STAKEHOLDERS.map((x) => `${name(x.id)} (${x.why})`).join('; ')}. Every count, ranking and “hub” conclusion holds only for this selection; in L2, add the stakeholders your team judges relevant.
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <caption className="sr-only">Stakeholder × decision-variable direction matrix</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-1 pr-2">Stakeholder (influence)</th>
                {VARIABLES.map((v) => (
                  <th key={v.id} className="py-1 pr-2" title={v.baseline}>
                    {v.id} {v.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX_STAKEHOLDERS.map((s) => (
                <tr key={s} className="border-b border-slate-100 align-top dark:border-slate-800">
                  <th scope="row" className="py-1 pr-2 font-normal">
                    {name(s)} ({refStakeholder(s).influence})
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">{refStakeholder(s).concern}</span>
                  </th>
                  {VARIABLES.map((v) => {
                    const d = m[s]?.[v.id]
                    const k = keyDirection(s, v.id)
                    return (
                      <td key={v.id} className="py-1 pr-2">
                        <select aria-label={`${name(s)} on ${v.name}`} className={select} value={d ?? ''} onChange={(e) => setCell(s, v.id, e.target.value)}>
                          <option value="">?</option>
                          {(Object.keys(DIRECTION_LABEL) as Direction[]).map((x) => (
                            <option key={x} value={x}>
                              {DIRECTION_LABEL[x]}
                            </option>
                          ))}
                        </select>
                        {compared && d !== undefined && d !== k && (
                          <span className="block text-[11px] text-rose-700 dark:text-rose-300" title={keyWhy(s, v.id)}>
                            ✗ key {SYMBOL[k]}: {keyWhy(s, v.id)}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Variable baselines: {VARIABLES.map((v) => `${v.id} ${v.baseline}`).join(' · ')}.</p>
      </section>

      <section aria-live="polite">
        <h4 className="font-semibold">Computed conflicts ({conflicts.length})</h4>
        {conflicts.length === 0 ? (
          <p>No conflicts yet: mark at least one stakeholder ↑ and another ↓ on the same variable.</p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            <table className="text-left text-xs">
              <caption className="text-left font-medium">Top conflicts by conflict weight (influence × influence)</caption>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-1 pr-2">Variable</th>
                  <th className="py-1 pr-2">Wants more</th>
                  <th className="py-1 pr-2">Wants less</th>
                  <th className="py-1">Salience</th>
                </tr>
              </thead>
              <tbody>
                {conflicts.slice(0, 8).map((c) => (
                  <tr key={`${c.variable}${c.up}${c.down}`} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-0.5 pr-2">{vname(c.variable)}</td>
                    <td className="py-0.5 pr-2">{name(c.up)}</td>
                    <td className="py-0.5 pr-2">{name(c.down)}</td>
                    <td className="py-0.5">{c.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="text-left text-xs" data-testid="w02-conflict-pairs">
              <caption className="text-left font-medium">Stakeholder pairs (a pair in conflict on several variables is a structural conflict)</caption>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-1 pr-2">Pair</th>
                  <th className="py-1 pr-2">Variables</th>
                  <th className="py-1">Total weight</th>
                </tr>
              </thead>
              <tbody>
                {pairs.slice(0, 6).map((p) => (
                  <tr key={p.a + p.b} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-0.5 pr-2">
                      {name(p.a)} ↔ {name(p.b)}
                    </td>
                    <td className="py-0.5 pr-2">{p.variables.join(', ')}</td>
                    <td className="py-0.5">{p.totalWeight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button onClick={() => setCompared(true)} disabled={cmp.answered === 0}>
            Compare with the instructor key
          </Button>
          {compared && (
            <span role="status" data-testid="w02-conflict-compare">
              {cmp.agree} of {cmp.answered} answered cells agree with the key ({cmp.total} cells in all). Conflicts you missed: {cmp.missed.length}; conflicts not in the key: {cmp.extra.length}.
            </span>
          )}
        </div>
        {compared && cmp.missed.length > 0 && (
          <p className="mt-1 text-xs">
            Missed (highest weight first): {cmp.missed.slice(0, 5).map((c) => `${vname(c.variable)}: ${c.up} ↑ vs ${c.down} ↓ (${c.weight})`).join('; ')}
            {cmp.missed.length > 5 ? '; …' : ''}
          </p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          The key and the conflict-weight rule are instructor-authored teaching devices; a different, argued cell is acceptable in L2 if the concern supports it. “Conflict weight” is a course measure, not stakeholder salience in the sense of Mitchell, Agle and Wood (power, legitimacy, urgency).
        </p>
      </section>

      <section>
        <h4 className="font-semibold">Part B — support gap (MITRE stakeholder map)</h4>
        <p className="mt-1">
          Estimate each stakeholder’s current level of support for AeroLink’s launch plan. MITRE maps influence against support (awareness → understanding → buy-in → commitment) and notes that high influencers must be committed advocates. Required level here is a course convention: influence ≥ 4 → commitment, 3 → buy-in, ≤ 2 → understanding.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {MATRIX_STAKEHOLDERS.map((s) => (
            <label key={s} className="flex items-center justify-between gap-2 text-xs">
              <span>
                {name(s)} (influence {refStakeholder(s).influence})
              </span>
              <select className={select} value={support[s] ?? ''} onChange={(e) => setSupport((p) => ({ ...p, [s]: e.target.value ? (Number(e.target.value) as SupportLevel) : undefined }))}>
                <option value="">Current support…</option>
                {([1, 2, 3, 4] as SupportLevel[]).map((l) => (
                  <option key={l} value={l}>
                    {SUPPORT_LABEL[l]}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {gaps.length > 0 && (
          <table className="mt-2 text-left text-xs" data-testid="w02-support-gaps">
            <caption className="text-left font-medium">Engagement priority (influence × gap)</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-1 pr-2">Stakeholder</th>
                <th className="py-1 pr-2">Current</th>
                <th className="py-1 pr-2">Required</th>
                <th className="py-1 pr-2">Gap</th>
                <th className="py-1">Priority</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((g) => (
                <tr key={g.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-0.5 pr-2">{name(g.id)}</td>
                  <td className="py-0.5 pr-2">{SUPPORT_LABEL[g.current]}</td>
                  <td className="py-0.5 pr-2">{SUPPORT_LABEL[g.required]}</td>
                  <td className="py-0.5 pr-2">{g.gap}</td>
                  <td className="py-0.5">{g.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-1">
          <CitationText c={{ reading: 'R63', pages: '236–237' }} />
        </p>
      </section>
    </div>
  )
}
