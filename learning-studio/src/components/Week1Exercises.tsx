import { useState } from 'react'
import { BOUNDARY_ITEMS, PRINCIPLES, WEEK1_INTRO, type BoundaryClass } from '../content/week1'
import { useApp } from '../state/AppState'
import { useMissionSignal } from '../workbench/signals'
import { SIG_BOUNDARY } from '../workbench/week1/logic'
import { Button, CitationText } from './ui'
import { useIsWorkbench } from './surface'

/** `initiallyOpen` (Learn stage, L3) pre-opens named principles as a signal of where to look first. */
export function PrinciplesExplorer({ initiallyOpen = [] }: { initiallyOpen?: string[] } = {}) {
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(initiallyOpen.map((n) => [n, true])))
  const wb = useIsWorkbench()
  return (
    <div className={wb ? 'grid gap-3 sm:grid-cols-2 2xl:grid-cols-4' : 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4'}>
      {PRINCIPLES.map((p) => (
        <div key={p.name} className={wb ? 'flex flex-col rounded border border-wb-line bg-wb-panel p-3 text-[13px]' : 'rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800'}>
          <h4 className={wb ? 'wb-section-title' : 'font-semibold'}>{p.name}</h4>
          <p className={wb ? 'mt-1 mb-0' : 'mt-1 text-slate-700 dark:text-slate-300'}>{p.statement}</p>
          <button
            className={wb ? 'wb-btn ghost mt-2 self-start px-1.5 text-wb-accent' : 'mt-2 text-xs font-medium text-brand-600 underline dark:text-brand-100'}
            aria-expanded={!!open[p.name]}
            onClick={() => setOpen((o) => ({ ...o, [p.name]: !o[p.name] }))}
          >
            {open[p.name] ? 'Hide' : 'Apply it to AeroLink'}
          </button>
          {open[p.name] && <p className={wb ? 'wb-note accent mt-1 mb-0' : 'mt-1 rounded bg-sky-50 p-2 text-xs dark:bg-sky-950/40'}>{p.aerolink}</p>}
          <p className={wb ? 'mt-auto mb-0 pt-2' : 'mt-2'}>
            <CitationText c={p.cite} />
          </p>
        </div>
      ))}
    </div>
  )
}

const LABELS: Record<BoundaryClass, string> = { inside: 'Inside the boundary', environment: 'Environment', irrelevant: 'Irrelevant to this question' }

export function BoundaryExercise() {
  const { boundary, setBoundary } = useApp()
  const [checked, setChecked] = useState(false)
  const score = BOUNDARY_ITEMS.filter((i) => boundary[i.id] === i.answer).length
  const answered = BOUNDARY_ITEMS.filter((i) => boundary[i.id]).length
  const wb = useIsWorkbench()
  // the workbench's guided boundary mission reads the checked score (no-op outside the workbench)
  useMissionSignal(SIG_BOUNDARY, checked ? { score, answered, total: BOUNDARY_ITEMS.length } : undefined)
  return (
    <div data-testid="boundary-exercise">
      <p className={wb ? 'm-0 text-[13px]' : 'text-sm'}>
        Question: <em>{WEEK1_INTRO.question.split('.')[0]}.</em> System of interest: the AeroLink service enterprise. Classify each candidate element.
      </p>
      <table className={wb ? 'wb-table mt-3' : 'mt-3 w-full text-left text-sm'}>
        <thead>
          <tr className={wb ? undefined : 'border-b border-slate-200 dark:border-slate-800'}>
            <th className={wb ? undefined : 'py-1 pr-2'}>Element</th>
            <th className={wb ? undefined : 'py-1 pr-2'} style={wb ? { width: 230 } : undefined}>Your classification</th>
            {checked && <th className={wb ? undefined : 'py-1'}>Feedback</th>}
          </tr>
        </thead>
        <tbody>
          {BOUNDARY_ITEMS.map((i) => {
            const v = boundary[i.id] as BoundaryClass | undefined
            const ok = v === i.answer
            return (
              <tr key={i.id} className={wb ? undefined : 'border-b border-slate-100 align-top dark:border-slate-800'}>
                <td className={wb ? 'text-[13px]' : 'py-1.5 pr-2'}>{i.name}</td>
                <td className={wb ? undefined : 'py-1.5 pr-2'}>
                  <select
                    aria-label={`Classify ${i.name}`}
                    value={v ?? ''}
                    onChange={(e) => setBoundary(i.id, e.target.value)}
                    className={wb ? 'wb-select w-full' : 'rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900'}
                  >
                    <option value="">Choose…</option>
                    {(Object.keys(LABELS) as BoundaryClass[]).map((k) => (
                      <option key={k} value={k}>
                        {LABELS[k]}
                      </option>
                    ))}
                  </select>
                </td>
                {checked && (
                  <td className={wb ? `text-[12px] ${ok ? 'text-wb-ok' : 'text-wb-bad'}` : `py-1.5 text-xs ${ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                    {v ? (ok ? 'Correct. ' : `Suggested: ${LABELS[i.answer]}. `) : 'Not answered. '}
                    {i.why}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="mt-3 flex items-center gap-3">
        {wb ? (
          <button type="button" className="wb-btn primary" onClick={() => setChecked(true)} disabled={answered === 0}>
            Check classification
          </button>
        ) : (
          <Button onClick={() => setChecked(true)} disabled={answered === 0}>
            Check classification
          </Button>
        )}
        {checked && (
          <span role="status" className={wb ? 'wb-chip accent' : 'text-sm'} data-testid="boundary-score">
            {score} of {BOUNDARY_ITEMS.length} match the instructor key.
          </span>
        )}
      </div>
      <p className={wb ? 'mt-2 mb-0 text-[12px] text-wb-muted' : 'mt-2 text-xs text-slate-500 dark:text-slate-400'}>
        The key is instructor-authored and debatable by design: a well-argued different boundary can be valid. Record your reasoning in the L1 lab record.
      </p>
    </div>
  )
}
