import { useMemo, useState } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { THREAD_STEPS } from '../../model/engineering'
import { referenceUpTo } from '../../model/reference'
import { useWorkspace } from '../../state/Workspace'
import { describeThreads, hopsOf, threadsMarkdown } from './thread'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
export type ModelSource = 'workspace' | 'reference'

/** Text step bar: filled squares for steps reached; the screen-reader text says the same in words. */
export function StepBar({ reached }: { reached: number }) {
  return (
    <span>
      <span aria-hidden="true" className="font-mono tracking-tight">{'■'.repeat(reached)}{'□'.repeat(11 - reached)}</span>
      <span className="sr-only">{reached} of 11 steps</span>
    </span>
  )
}

export function ThreadExplorer() {
  const { model: ws } = useWorkspace()
  const [source, setSource] = usePersistentState<ModelSource>('w12-thread-source', 'reference')
  const model = useMemo(() => (source === 'reference' ? referenceUpTo(12) : ws), [source, ws])
  const stakeholders = model.elements.filter((e) => e.kind === 'STK' && e.status === 'active')
  const [stk, setStk] = useState('')
  const chosen = stakeholders.some((s) => s.id === stk) ? stk : (stakeholders[0]?.id ?? '')
  const rows = chosen ? describeThreads(model, chosen) : []
  const [walk, setWalk] = useState<number | null>(null)
  const walked = walk !== null && rows[walk]?.complete ? hopsOf(model, rows[walk].ids) : null
  const name = (id: string) => model.elements.find((e) => e.id === id)?.name ?? ''

  return (
    <div className="space-y-4 text-sm" data-testid="w12-thread-explorer">
      <fieldset className="flex flex-wrap gap-4">
        <legend className="sr-only">Model to explore</legend>
        <label className="flex items-center gap-1"><input type="radio" name="w12-thread-src" checked={source === 'reference'} onChange={() => { setSource('reference'); setWalk(null) }} /> Instructor reference (read-only)</label>
        <label className="flex items-center gap-1"><input type="radio" name="w12-thread-src" checked={source === 'workspace'} onChange={() => { setSource('workspace'); setWalk(null) }} /> My workspace model</label>
      </fieldset>

      <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <summary className="cursor-pointer font-medium">The 11 steps and what counts as each link (course convention)</summary>
        <ol className="ml-5 mt-1 list-decimal" data-testid="w12-thread-steps">
          {THREAD_STEPS.map((s, i) => <li key={s}><strong>{s}</strong>{i > 0 && <> — {STEP_RULE[i]}</>}</li>)}
        </ol>
      </details>

      {stakeholders.length === 0 ? (
        <p role="status">Your workspace has no stakeholders yet. Load or build your model, or explore the instructor reference.</p>
      ) : (
        <label className="flex flex-col">Stakeholder
          <select className={input} value={chosen} onChange={(e) => { setStk(e.target.value); setWalk(null) }}>
            {stakeholders.map((s) => <option key={s.id} value={s.id}>{s.id} {s.name}</option>)}
          </select>
        </label>
      )}

      {chosen && (
        <div className="overflow-x-auto">
          <p data-testid="w12-thread-count">{rows.filter((r) => r.complete).length} complete of {rows.length} thread(s) from {chosen}.</p>
          <table className="mt-1 w-full border-collapse text-xs">
            <caption className="sr-only">Threads from {chosen}: steps reached and the missing link</caption>
            <thead><tr className="text-left"><th className="border-b p-1">#</th><th className="border-b p-1">Steps reached</th><th className="border-b p-1">Thread</th><th className="border-b p-1">Missing link for the next step</th><th className="border-b p-1"><span className="sr-only">Action</span></th></tr></thead>
            <tbody data-testid="w12-thread-rows">
              {rows.map((r, i) => (
                <tr key={r.ids.join('>') + i} className="align-top">
                  <td className="border-b p-1">{i + 1}</td>
                  <td className="border-b p-1 whitespace-nowrap"><StepBar reached={r.reached} /> {r.reached}/11</td>
                  <td className="border-b p-1">{r.ids.join(' > ')}</td>
                  <td className="border-b p-1">{r.complete ? <strong>✓ complete</strong> : <>✗ step {r.missingStep} ({THREAD_STEPS[r.missingStep! - 1]}): {r.missing}</>}</td>
                  <td className="border-b p-1">{r.complete && <Button variant="ghost" ariaLabel={`Walk thread ${i + 1} hop by hop`} onClick={() => setWalk(i)}>Walk</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {walked && (
        <section aria-label="Thread walked hop by hop" data-testid="w12-thread-walk">
          <h4 className="font-medium">Thread {walk! + 1}, hop by hop</h4>
          <ol className="ml-5 list-decimal space-y-1">
            {walked.map((h) => (
              <li key={h.step}>
                <strong>{h.label}</strong>: {h.element} {name(h.element)}
                {h.links.length > 0 && <> — {h.links.map((l) => `${l.source} ${l.type} ${l.target} (${l.id})`).join('; ')}</>}
                <span className="text-slate-700 dark:text-slate-300"> {h.note}</span>
              </li>
            ))}
          </ol>
          <p className="mt-1 text-xs">A complete thread is complete by the course rule. Whether each hop is the right one — for example, whether this information item is the one this requirement needs — is a judgement the rule cannot make.</p>
        </section>
      )}

      {chosen && (
        <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
          <summary className="cursor-pointer font-medium">Thread table (Markdown) for the audit report</summary>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs" tabIndex={0}>{threadsMarkdown(model, chosen)}</pre>
        </details>
      )}
    </div>
  )
}

const STEP_RULE: Record<number, string> = {
  1: 'the need derives from the stakeholder',
  2: 'the capability derives from the need',
  3: 'the requirement derives from or refines the capability, directly or through other requirements',
  4: 'the requirement is allocated to the function',
  5: 'a logical element performs the function',
  6: 'the logical element is allocated to a physical element',
  7: 'an information item flows to or from that physical element',
  8: 'a verification activity verifies the requirement (step 4)',
  9: 'an MOE or MOP measures the requirement or the capability',
  10: 'a risk affects, or is mitigated by, any element already in the thread',
}
