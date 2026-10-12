import { useEffect, useState } from 'react'
import { Button } from '../../components/ui'
import { SYSML_REPORT, reportEntry, sha256Hex, sysmlSource, toolLabel } from '../../lib/sysml'
import { usePersistentState } from '../../lib/usePersistentState'
import { OUTCOMES, PREDICT_ITEMS, recordedResult, scorePredictions, type HashState, type Outcome } from './predict'

type Store = { predictions: Record<string, Outcome | undefined>; revealed: Record<string, boolean | undefined> }

/** `hash` is injectable for tests; by default the Web Crypto SHA-256 used by the course's listing views. */
export function PredictChecker({ hash = sha256Hex }: { hash?: (text: string) => Promise<string> } = {}) {
  const [store, setStore] = usePersistentState<Store>('w09-predict', { predictions: {}, revealed: {} })
  const [index, setIndex] = useState(0)
  const [hashes, setHashes] = useState<Record<string, HashState>>({})
  const item = PREDICT_ITEMS[index]
  const text = sysmlSource(item.file) ?? ''

  // Hash the listing on screen and every revealed listing: a revealed item is scored only once its record is verified.
  const toHash = PREDICT_ITEMS.filter((it) => it.file === item.file || store.revealed[it.id]).map((it) => it.file)
  const toHashKey = toHash.join('|')
  useEffect(() => {
    let live = true
    for (const file of toHashKey.split('|')) {
      const src = sysmlSource(file)
      if (hashes[file] || !src) continue
      let pending: Promise<string>
      try {
        pending = hash(src)
      } catch (e) {
        pending = Promise.reject(e)
      }
      pending.then(
        (h) => live && setHashes((s) => ({ ...s, [file]: { state: 'done', sha256: h } })),
        () => live && setHashes((s) => ({ ...s, [file]: { state: 'unavailable' } })),
      )
    }
    return () => {
      live = false
    }
  }, [toHashKey, hashes, hash])

  const predicted = store.predictions[item.id]
  const revealed = !!store.revealed[item.id]
  const recordOf = (file: string) => recordedResult(reportEntry(file), hashes[file] ?? { state: 'pending' })
  const rec = recordOf(item.file)
  const score = scorePredictions(store.predictions, store.revealed, Object.fromEntries(PREDICT_ITEMS.map((it) => [it.id, recordOf(it.file)])))

  return (
    <div className="space-y-3 text-sm" data-testid="w09-predict">
      <p>
        Each listing below was run once through {toolLabel()} by the course&apos;s validation script, and the result was recorded with the file&apos;s SHA-256. Predict the outcome, then reveal the <strong>recorded</strong> result. This app does not run the checker and never simulates a verdict: if no record matches the text on screen, it says so.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          Previous
        </Button>
        <span>
          Item {index + 1} of {PREDICT_ITEMS.length}: <strong>{item.title}</strong>
        </span>
        <Button variant="secondary" onClick={() => setIndex((i) => Math.min(PREDICT_ITEMS.length - 1, i + 1))} disabled={index === PREDICT_ITEMS.length - 1}>
          Next
        </Button>
      </div>
      <pre tabIndex={0} className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed dark:border-slate-800 dark:bg-slate-950" aria-label={`Listing for item ${index + 1}`}>
        <code>
          {text.split(/\r?\n/).map((l, i) => (
            <div key={i}>
              <span className="mr-2 inline-block w-6 select-none text-right text-slate-600 dark:text-slate-400" aria-hidden="true">
                {i + 1}
              </span>
              {l}
            </div>
          ))}
        </code>
      </pre>
      <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Your prediction</legend>
        <div className="flex flex-col gap-1">
          {OUTCOMES.map((o) => (
            <label key={o.id} className="flex items-center gap-1.5" title={o.hint}>
              <input type="radio" name={`w09-predict-${item.id}`} disabled={revealed} checked={predicted === o.id} onChange={() => setStore({ ...store, predictions: { ...store.predictions, [item.id]: o.id } })} />
              {o.label}
            </label>
          ))}
        </div>
        <div className="mt-2">
          <Button disabled={!predicted || revealed} onClick={() => setStore({ ...store, revealed: { ...store.revealed, [item.id]: true } })}>
            Reveal the recorded result
          </Button>
        </div>
      </fieldset>
      {revealed && (
        <div className="rounded border border-slate-300 p-2 dark:border-slate-700" data-testid="w09-predict-result">
          {rec.state === 'recorded' ? (
            <>
              <p>
                <strong>Recorded result: {rec.status}</strong> ({OUTCOMES.find((o) => o.id === rec.outcome)!.label}). File <span className="font-mono">{item.file}</span>; record of {SYSML_REPORT?.timestamp ?? 'unknown date'}.
              </p>
              {rec.diagnostics.length > 0 ? (
                <ul className="list-disc pl-5 font-mono text-xs">
                  {rec.diagnostics.map((d, i) => {
                    const dd = d as { severity?: string; line?: number; column?: number; message?: string }
                    return (
                      <li key={i}>
                        {dd.severity} {dd.line}:{dd.column} {dd.message}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p>No messages.</p>
              )}
              <p className="mt-1">{predicted === rec.outcome ? 'Your prediction matches the recorded result. ' : `Your prediction was “${OUTCOMES.find((o) => o.id === predicted)?.label}”. `}{item.explanation}</p>
            </>
          ) : rec.state === 'pending' ? (
            <p>Checking that the recorded result belongs to exactly the text on screen (SHA-256)… No result is shown until that check is complete.</p>
          ) : rec.state === 'unverifiable' ? (
            <p>This browser cannot compute the SHA-256 of the listing here (the Web Crypto API is available only on pages served over HTTPS or from localhost), so the app cannot verify that the record belongs to this text and shows no result. Open the app over HTTPS or on localhost, or ask the instructor.</p>
          ) : rec.state === 'stale' ? (
            <p>The recorded result belongs to a different version of this text, so it is not shown. Ask the instructor to re-run the course validation script.</p>
          ) : (
            <p>No recorded result exists for this listing. Ask the instructor to run the course validation script; the app will not guess.</p>
          )}
        </div>
      )}
      <p role="status" data-testid="w09-predict-score">
        {score.predicted} of {PREDICT_ITEMS.length} predicted; {score.scored} revealed with a verified record; of those, {score.correct} exactly right and {score.passFailCorrect} right on PASS/FAIL.
      </p>
      <Button
        variant="secondary"
        onClick={() => {
          setStore({ predictions: {}, revealed: {} })
          setIndex(0)
        }}
      >
        Start again
      </Button>
    </div>
  )
}
