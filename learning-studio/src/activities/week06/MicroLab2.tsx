import { useState } from 'react'
import { Button } from '../../components/ui'
import { sysmlSource } from '../../lib/sysml'
import { usePersistentState } from '../../lib/usePersistentState'
import { CLASSES2, LISTING2_FILE, TARGETS2, UNIT_EDITS, VERDICTS, scoreAnswers, segmentLine2, type ElementClass2, type ReadingTarget2, type Verdict } from './microlab'

type Store = { classes: Record<string, ElementClass2 | undefined>; verdicts: Record<string, Verdict | undefined> }

export function MicroLab2() {
  const src = sysmlSource(LISTING2_FILE) ?? ''
  const lines = src.split(/\r?\n/)
  const [store, setStore] = usePersistentState<Store>('w06-microlab2', { classes: {}, verdicts: {} })
  const [selected, setSelected] = useState<string>(TARGETS2[0].id)
  const [checked, setChecked] = useState(false)
  const classScore = scoreAnswers(store.classes, TARGETS2)
  const unitScore = scoreAnswers(store.verdicts, UNIT_EDITS)
  const target = TARGETS2.find((t) => t.id === selected)!
  const mark = (t: ReadingTarget2) => {
    const v = classScore.perItem[t.id]
    return !checked || v === null ? '' : v ? ' ✓' : ' ✗'
  }

  return (
    <div className="space-y-3 text-sm" data-testid="w06-microlab2">
      <p>
        Part 1. Select a highlighted element in <span className="font-mono">{LISTING2_FILE}</span> (a listing accepted by the reference implementation) and classify it. Part 2. Judge each proposed value binding: does the unit belong to the kind of quantity the attribute is typed by?
      </p>
      <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed dark:border-slate-800 dark:bg-slate-950" aria-label="SysML v2 listing with selectable elements">
        <code>
          {lines.map((text, i) => (
            <div key={i}>
              <span className="mr-2 inline-block w-6 select-none text-right text-slate-600 dark:text-slate-400" aria-hidden="true">
                {i + 1}
              </span>
              {segmentLine2(text, TARGETS2.filter((t) => t.line === i + 1)).map((s, j) =>
                s.target ? (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setSelected(s.target!.id)}
                    aria-pressed={selected === s.target.id}
                    aria-label={`Element ${s.target.id.slice(1)}: ${s.target.token} on line ${s.target.line}${store.classes[s.target.id] ? `, classified as ${CLASSES2.find((c) => c.id === store.classes[s.target!.id])?.label}` : ''}`}
                    className={`rounded px-0.5 underline decoration-dotted underline-offset-2 ${selected === s.target.id ? 'bg-sky-200 font-semibold ring-2 ring-sky-600 dark:bg-sky-900' : 'bg-amber-100 dark:bg-amber-900/40'}`}
                  >
                    {s.text}
                    <sup className="ml-0.5 text-[0.6rem]">
                      {s.target.id.slice(1)}
                      {mark(s.target)}
                    </sup>
                  </button>
                ) : (
                  <span key={j}>{s.text}</span>
                ),
              )}
            </div>
          ))}
        </code>
      </pre>

      <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">
          Element {target.id.slice(1)}: <span className="font-mono">{target.token}</span> (line {target.line})
        </legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {CLASSES2.map((c) => (
            <label key={c.id} className="flex items-center gap-1.5" title={c.hint}>
              <input type="radio" name={`w06-class-${target.id}`} checked={store.classes[target.id] === c.id} onChange={() => setStore({ ...store, classes: { ...store.classes, [target.id]: c.id } })} />
              {c.label}
            </label>
          ))}
        </div>
        {checked && store.classes[target.id] && (
          <p className="mt-2" data-testid="w06-microlab2-item-feedback">
            {store.classes[target.id] === target.answer ? 'Correct. ' : `Not quite — this is: ${CLASSES2.find((c) => c.id === target.answer)!.label.toLowerCase()}. `}
            {target.explanation}
          </p>
        )}
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Part 2 — units: would each edit to the usages be correct?</legend>
        <ol className="space-y-2">
          {UNIT_EDITS.map((u) => (
            <li key={u.id}>
              <label className="flex flex-col gap-1">
                <span className="font-mono text-xs">{u.binding}</span>
                <select aria-label={`Verdict for ${u.binding}`} className="w-fit rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900" value={store.verdicts[u.id] ?? ''} onChange={(e) => setStore({ ...store, verdicts: { ...store.verdicts, [u.id]: (e.target.value || undefined) as Verdict | undefined } })}>
                  <option value="">Choose…</option>
                  {VERDICTS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              {checked && store.verdicts[u.id] && (
                <p className="text-xs" data-testid={`w06-unit-feedback-${u.id}`}>
                  {store.verdicts[u.id] === u.answer ? 'Correct. ' : `Not quite — ${VERDICTS.find((v) => v.id === u.answer)!.label.toLowerCase()}. `}
                  {u.explanation}
                </p>
              )}
            </li>
          ))}
        </ol>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setChecked(true)}>Check my answers</Button>
        <Button
          variant="secondary"
          onClick={() => {
            setStore({ classes: {}, verdicts: {} })
            setChecked(false)
          }}
        >
          Clear
        </Button>
        <span role="status" data-testid="w06-microlab2-score">
          {checked
            ? `Elements: ${classScore.correct} of ${TARGETS2.length} correct. Units: ${unitScore.correct} of ${UNIT_EDITS.length} correct.`
            : `${classScore.answered} of ${TARGETS2.length} elements classified; ${unitScore.answered} of ${UNIT_EDITS.length} edits judged.`}
        </span>
      </div>
      <details>
        <summary className="cursor-pointer">Class definitions used here</summary>
        <ul className="list-disc pl-5">
          {CLASSES2.map((c) => (
            <li key={c.id}>
              <strong>{c.label}:</strong> {c.hint}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
