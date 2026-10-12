import { useState } from 'react'
import { Button } from '../../components/ui'
import { sysmlSource } from '../../lib/sysml'
import { usePersistentState } from '../../lib/usePersistentState'
import { ASSERTION_OPTIONS, LISTING_FILE, ROLES, TARGETS, scoreReading, segmentLine, type ReadingTarget, type RoleClass } from './reading'

const notesInput = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

export function SatisfyReading() {
  const lines = (sysmlSource(LISTING_FILE) ?? '').split(/\r?\n/)
  const [answers, setAnswers] = usePersistentState<Record<string, RoleClass | undefined>>('w08-satisfy-answers', {})
  const [selected, setSelected] = useState(TARGETS[0].id)
  const [checked, setChecked] = useState(false)
  const [assertion, setAssertion] = useState('')
  const [assertChecked, setAssertChecked] = useState(false)
  const [notes, setNotes] = usePersistentState<{ assertion: string; invalid: string }>('w08-microlab3-notes', { assertion: '', invalid: '' })
  const result = scoreReading(answers)
  const target = TARGETS.find((t) => t.id === selected)!
  const mark = (t: ReadingTarget) => {
    const v = result.perTarget[t.id]
    return !checked || v === null ? '' : v ? ' ✓' : ' ✗'
  }
  const label = (r?: RoleClass) => ROLES.find((x) => x.id === r)?.label ?? ''

  return (
    <div className="space-y-3 text-sm" data-testid="w08-satisfy-reading">
      <p>
        Micro-lab 3. Select a highlighted element of <span className="font-mono">{LISTING_FILE}</span> (accepted by the reference implementation) and classify its role. Then answer the question below the listing.
      </p>
      <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed dark:border-slate-800 dark:bg-slate-950" aria-label="SysML v2 listing with selectable elements">
        <code>
          {lines.map((text, i) => (
            <div key={i}>
              <span className="mr-2 inline-block w-6 select-none text-right text-slate-600 dark:text-slate-400" aria-hidden="true">
                {i + 1}
              </span>
              {segmentLine(text, TARGETS.filter((t) => t.line === i + 1)).map((s, j) =>
                s.target ? (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setSelected(s.target!.id)}
                    aria-pressed={selected === s.target.id}
                    aria-label={`Element ${s.target.id.slice(1)}: ${s.target.token} on line ${s.target.line}${answers[s.target.id] ? `, classified as ${label(answers[s.target.id])}` : ''}`}
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
          {ROLES.map((r) => (
            <label key={r.id} className="flex items-center gap-1.5" title={r.hint}>
              <input type="radio" name={`w08-role-${target.id}`} checked={answers[target.id] === r.id} onChange={() => setAnswers({ ...answers, [target.id]: r.id })} />
              {r.label}
            </label>
          ))}
        </div>
        {checked && answers[target.id] && (
          <p className="mt-2" data-testid="w08-role-feedback">
            {answers[target.id] === target.answer ? 'Correct. ' : `Not quite — this is the ${label(target.answer).toLowerCase()}. `}
            {target.explanation}
          </p>
        )}
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setChecked(true)}>Check my classifications</Button>
        <Button variant="secondary" onClick={() => { setAnswers({}); setChecked(false) }}>
          Clear
        </Button>
        <span role="status" data-testid="w08-role-score">
          {checked ? `${result.correct} of ${TARGETS.length} correct (${result.answered} answered).` : `${result.answered} of ${TARGETS.length} classified.`}
        </span>
      </div>
      <fieldset className="space-y-1 rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">What does line 28 assert?</legend>
        {ASSERTION_OPTIONS.map((o) => (
          <label key={o.id} className="flex items-start gap-1.5">
            <input type="radio" name="w08-assertion" checked={assertion === o.id} onChange={() => { setAssertion(o.id); setAssertChecked(false) }} />
            <span>
              {o.text}
              {assertChecked && assertion === o.id && (
                <span className="block text-xs" data-testid="w08-assertion-feedback">
                  {o.correct ? '✓ Correct. ' : '✗ Not this one. '}
                  {o.why}
                </span>
              )}
            </span>
          </label>
        ))}
        <Button onClick={() => setAssertChecked(true)}>Check my answer</Button>
      </fieldset>
      <fieldset className="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Your written answers (closed-AI; kept in this browser — copy them into your review notebook as the entry “Micro-lab 3”)</legend>
        <label className="flex flex-col gap-1">
          One sentence: what does line 28 assert, and what would substantiate it?
          <textarea className={notesInput} rows={2} value={notes.assertion} onChange={(e) => setNotes({ ...notes, assertion: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          Two sentences: why does the checker reject invalid_wrong_subject.sysml, and what would it not have caught?
          <textarea className={notesInput} rows={3} value={notes.invalid} onChange={(e) => setNotes({ ...notes, invalid: e.target.value })} />
        </label>
      </fieldset>
      <details>
        <summary className="cursor-pointer">Role definitions used here</summary>
        <ul className="list-disc pl-5">
          {ROLES.map((r) => (
            <li key={r.id}>
              <strong>{r.label}:</strong> {r.hint}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
