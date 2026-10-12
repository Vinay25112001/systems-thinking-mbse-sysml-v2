import { useMemo, useState } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { referenceUpTo } from '../../model/reference'
import { useWorkspace } from '../../state/Workspace'
import { readArchitecture } from './architecture'
import { DATA_OR_INFORMATION, PEER_INFO_SAMPLE, scorePrediction, traceInformation } from './infoflow'

type Source = 'peer' | 'mine' | 'reference'

export function InfoTracer() {
  const { model } = useWorkspace()
  const [source, setSource] = useState<Source>('peer')
  const [predicted, setPredicted] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [di, setDi] = usePersistentState<Record<string, 'data' | 'information' | undefined>>('w08-data-or-information', {})
  const [diChecked, setDiChecked] = useState(false)

  const m = source === 'peer' ? PEER_INFO_SAMPLE : source === 'reference' ? referenceUpTo(8) : model
  const traces = useMemo(() => traceInformation(m, readArchitecture(m).ifs), [m])
  const failing = traces.filter((t) => t.problems.length).map((t) => t.id)
  const score = scorePrediction(predicted, failing)
  const diCorrect = DATA_OR_INFORMATION.filter((x) => di[x.id] === x.answer).length

  const toggle = (id: string) => {
    setPredicted(predicted.includes(id) ? predicted.filter((p) => p !== id) : [...predicted, id])
    setChecked(false)
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w08-info-tracer">
      <section className="space-y-2">
        <h4 className="font-semibold">Part 1 — Producer → consumer → decision</h4>
        <fieldset className="flex flex-wrap gap-x-4">
          <legend>Information view to trace</legend>
          {([['peer', 'Peer team sample (practice)'], ['mine', 'My workspace'], ['reference', 'Instructor reference (end of Week 8)']] as const).map(([v, l]) => (
            <label key={v} className="flex items-center gap-1.5">
              <input type="radio" name="w08-info-src" checked={source === v} onChange={() => { setSource(v); setPredicted([]); setChecked(false) }} /> {l}
            </label>
          ))}
        </fieldset>
        <p>Before tracing, tick each item you expect to fail an L8 rule: it needs a linked producer, a linked consumer, and a decision that names a choice.</p>
        <ul className="space-y-1">
          {traces.map((t) => (
            <li key={t.id}>
              <label className="flex items-start gap-1.5">
                <input type="checkbox" checked={predicted.includes(t.id)} onChange={() => toggle(t.id)} />
                <span>
                  {t.id} {t.name} — decision as written: “{t.decision || '(none)'}”
                </span>
              </label>
            </li>
          ))}
          {traces.length === 0 && <li>No information items in this view.</li>}
        </ul>
        <Button onClick={() => setChecked(true)}>Trace and check my prediction</Button>
        {checked && (
          <div className="space-y-2" data-testid="w08-info-result">
            <p>
              {failing.length} of {traces.length} items fail a required rule. Your prediction: {score.hits.length} correct
              {score.missed.length ? `; missed: ${score.missed.join(', ')}` : ''}
              {score.falseAlarms.length ? `; flagged but passing: ${score.falseAlarms.join(', ')}` : ''}.
            </p>
            <table className="w-full text-left text-xs">
              <caption className="text-left font-medium">Traces (✗ = fails a rule; ! = advisory)</caption>
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-1 pr-2">INFO</th>
                  <th className="py-1 pr-2">Producer → consumer</th>
                  <th className="py-1 pr-2">Decision (IDs)</th>
                  <th className="py-1">Findings</th>
                </tr>
              </thead>
              <tbody>
                {traces.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                    <td className="py-0.5 pr-2">
                      {t.id} {t.name}
                    </td>
                    <td className="py-0.5 pr-2">
                      {t.producers.join(', ') || '—'} → {t.consumers.join(', ') || '—'}
                    </td>
                    <td className="py-0.5 pr-2">
                      {t.decision || '—'} {t.decisionIds.length ? `(${t.decisionIds.join(', ')})` : ''}
                    </td>
                    <td className="py-0.5">
                      {[...t.problems.map((p) => `✗ ${p}`), ...t.advisories.map((a) => `! ${a}`)].join(' ') || '✓ Pass'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h4 className="font-semibold">Part 2 — Data or information? (R21 p.512)</h4>
        <p>Data are raw values; information is data put in context, analysed and interpreted. Classify each item (FICTIONAL).</p>
        {DATA_OR_INFORMATION.map((x) => (
          <fieldset key={x.id} className="rounded border border-slate-200 p-2 dark:border-slate-800">
            <legend className="px-1">{x.text}</legend>
            <div className="flex gap-4">
              {(['data', 'information'] as const).map((v) => (
                <label key={v} className="flex items-center gap-1.5">
                  <input type="radio" name={`w08-di-${x.id}`} checked={di[x.id] === v} onChange={() => { setDi({ ...di, [x.id]: v }); setDiChecked(false) }} /> {v}
                </label>
              ))}
            </div>
            {diChecked && di[x.id] && (
              <p className="mt-1 text-xs">
                {di[x.id] === x.answer ? '✓ Correct. ' : `✗ Not quite: this is ${x.answer}. `}
                {x.why}
              </p>
            )}
          </fieldset>
        ))}
        <div className="flex items-center gap-3">
          <Button onClick={() => setDiChecked(true)}>Check classifications</Button>
          <span role="status" data-testid="w08-di-score">
            {diChecked ? `${diCorrect} of ${DATA_OR_INFORMATION.length} correct.` : ''}
          </span>
        </div>
      </section>
    </div>
  )
}
