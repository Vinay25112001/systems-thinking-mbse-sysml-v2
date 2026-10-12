import { useState } from 'react'
import { Button } from '../../components/ui'
import { sysmlSource } from '../../lib/sysml'
import { usePersistentState } from '../../lib/usePersistentState'
import { CLASSES, LISTING_FILE, TARGETS, scoreReading, segmentLine, type ElementClass, type ReadingTarget } from './reading'

export function SysmlReading() {
  const src = sysmlSource(LISTING_FILE) ?? ''
  const lines = src.split(/\r?\n/)
  const [answers, setAnswers] = usePersistentState<Record<string, ElementClass | undefined>>('w05-sysml-answers', {})
  const [selected, setSelected] = useState<string>(TARGETS[0].id)
  const [checked, setChecked] = useState(false)
  const result = scoreReading(answers)
  const target = TARGETS.find((t) => t.id === selected)!

  const mark = (t: ReadingTarget) => {
    const v = result.perTarget[t.id]
    return !checked || v === null ? '' : v ? ' ✓' : ' ✗'
  }

  return (
    <div className="space-y-3 text-sm" data-testid="w05-sysml-reading">
      <p>
        Select a highlighted element in <span className="font-mono">{LISTING_FILE}</span> (a listing accepted by the reference implementation), then classify it. Numbered markers follow reading order.
      </p>
      <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed dark:border-slate-800 dark:bg-slate-950" aria-label="SysML v2 listing with selectable elements">
        <code>
          {lines.map((text, i) => {
            const segs = segmentLine(text, TARGETS.filter((t) => t.line === i + 1))
            return (
              <div key={i}>
                <span className="mr-2 inline-block w-6 select-none text-right text-slate-600 dark:text-slate-400" aria-hidden="true">
                  {i + 1}
                </span>
                {segs.map((s, j) =>
                  s.target ? (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setSelected(s.target!.id)}
                      aria-pressed={selected === s.target.id}
                      aria-label={`Element ${s.target.id.slice(1)}: ${s.target.token} on line ${s.target.line}${answers[s.target.id] ? `, classified as ${CLASSES.find((c) => c.id === answers[s.target!.id])?.label}` : ''}`}
                      className={`rounded px-0.5 underline decoration-dotted underline-offset-2 ${selected === s.target.id ? 'bg-sky-200 font-semibold ring-2 ring-sky-600 dark:bg-sky-900' : 'bg-amber-100 dark:bg-amber-900/40'}`}
                    >
                      {s.text}
                      <sup className="ml-0.5 text-[0.6rem]">{s.target.id.slice(1)}{mark(s.target)}</sup>
                    </button>
                  ) : (
                    <span key={j}>{s.text}</span>
                  ),
                )}
              </div>
            )
          })}
        </code>
      </pre>

      <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">
          Element {target.id.slice(1)}: <span className="font-mono">{target.token}</span> (line {target.line})
        </legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {CLASSES.map((c) => (
            <label key={c.id} className="flex items-center gap-1.5" title={c.hint}>
              <input type="radio" name={`w05-class-${target.id}`} checked={answers[target.id] === c.id} onChange={() => setAnswers({ ...answers, [target.id]: c.id })} />
              {c.label}
            </label>
          ))}
        </div>
        {checked && answers[target.id] && (
          <p className="mt-2" data-testid="w05-sysml-item-feedback">
            {answers[target.id] === target.answer ? 'Correct. ' : `Not quite — this is a ${CLASSES.find((c) => c.id === target.answer)!.label.toLowerCase()}. `}
            {target.explanation}
          </p>
        )}
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setChecked(true)}>Check my classifications</Button>
        <Button variant="secondary" onClick={() => { setAnswers({}); setChecked(false) }}>
          Clear
        </Button>
        <span role="status" data-testid="w05-sysml-score">
          {checked ? `${result.correct} of ${TARGETS.length} correct (${result.answered} answered).` : `${result.answered} of ${TARGETS.length} classified.`}
        </span>
      </div>
      <details>
        <summary className="cursor-pointer">Class definitions used here</summary>
        <ul className="list-disc pl-5">
          {CLASSES.map((c) => (
            <li key={c.id}>
              <strong>{c.label}:</strong> {c.hint}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
