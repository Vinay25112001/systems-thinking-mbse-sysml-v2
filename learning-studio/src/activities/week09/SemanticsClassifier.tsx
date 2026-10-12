import { useState } from 'react'
import { Button } from '../../components/ui'
import { sysmlSource } from '../../lib/sysml'
import { usePersistentState } from '../../lib/usePersistentState'
import { ASSERTIONS, ROLES, SEMANTICS_FILE, TARGETS, scoreAnswers, segmentLine, type Role, type Target, type Truth } from './semantics'

type Store = { roles: Record<string, Role | undefined>; truths: Record<string, Truth | undefined> }

export function SemanticsClassifier() {
  const src = sysmlSource(SEMANTICS_FILE) ?? ''
  const lines = src.split(/\r?\n/)
  const [store, setStore] = usePersistentState<Store>('w09-semantics', { roles: {}, truths: {} })
  const [selected, setSelected] = useState<string>(TARGETS[0].id)
  const [checked, setChecked] = useState(false)
  const roleScore = scoreAnswers(store.roles, TARGETS)
  const truthScore = scoreAnswers(store.truths, ASSERTIONS)
  const target = TARGETS.find((t) => t.id === selected)!
  const mark = (t: Target) => {
    const v = roleScore.perItem[t.id]
    return !checked || v === null ? '' : v ? ' ✓' : ' ✗'
  }
  /** The same result in words, for the accessible name (the aria-label replaces the visible ✓/✗ for screen readers). */
  const markWords = (t: Target) => {
    const v = roleScore.perItem[t.id]
    return !checked || v === null ? '' : v ? '; checked: correct' : '; checked: incorrect'
  }

  return (
    <div className="space-y-3 text-sm" data-testid="w09-semantics">
      <p>
        Part 1. Select a highlighted token in <span className="font-mono">{SEMANTICS_FILE}</span> (accepted by the course-designated checker) and say what role it plays. Watch the symbol in front of it: “:&gt;” after a definition and “:&gt;” after a usage do not mean the same thing. Part 2. Decide whether the listing guarantees each statement, i.e. whether it holds in everything the listing describes.
      </p>
      <pre tabIndex={0} className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed dark:border-slate-800 dark:bg-slate-950" aria-label="SysML v2 listing with selectable tokens">
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
                    aria-label={`Token ${s.target.id.slice(1)}: ${s.target.token} on line ${s.target.line}${store.roles[s.target.id] ? `, marked ${ROLES.find((r) => r.id === store.roles[s.target!.id])?.label}` : ''}${markWords(s.target)}`}
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
          Token {target.id.slice(1)}: <span className="font-mono">{target.token}</span> (line {target.line})
        </legend>
        <div className="flex flex-col gap-1">
          {ROLES.map((r) => (
            <label key={r.id} className="flex items-center gap-1.5" title={r.hint}>
              <input type="radio" name={`w09-role-${target.id}`} checked={store.roles[target.id] === r.id} onChange={() => setStore({ ...store, roles: { ...store.roles, [target.id]: r.id } })} />
              {r.label}
            </label>
          ))}
        </div>
        {checked && store.roles[target.id] && (
          <p className="mt-2" data-testid="w09-semantics-item-feedback">
            {store.roles[target.id] === target.answer ? 'Correct. ' : `Not quite: this is the ${ROLES.find((r) => r.id === target.answer)!.label.toLowerCase()}. `}
            {target.explanation}
          </p>
        )}
      </fieldset>

      <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Part 2: does the listing guarantee this?</legend>
        <ol className="space-y-2">
          {ASSERTIONS.map((a) => (
            <li key={a.id}>
              <label className="flex flex-col gap-1">
                <span>{a.text}</span>
                <select aria-label={`Guaranteed? ${a.text}`} className="w-fit rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900" value={store.truths[a.id] ?? ''} onChange={(e) => setStore({ ...store, truths: { ...store.truths, [a.id]: (e.target.value || undefined) as Truth | undefined } })}>
                  <option value="">Choose…</option>
                  <option value="true">Guaranteed by the listing</option>
                  <option value="false">Not guaranteed by the listing</option>
                </select>
              </label>
              {checked && store.truths[a.id] && (
                <p className="text-xs" data-testid={`w09-assertion-feedback-${a.id}`}>
                  {store.truths[a.id] === a.answer ? 'Correct. ' : 'Not quite. '}
                  {a.explanation}
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
            setStore({ roles: {}, truths: {} })
            setChecked(false)
          }}
        >
          Clear
        </Button>
        <span role="status" data-testid="w09-semantics-score">
          {checked
            ? `Tokens: ${roleScore.correct} of ${TARGETS.length} correct. Statements: ${truthScore.correct} of ${ASSERTIONS.length} correct.`
            : `${roleScore.answered} of ${TARGETS.length} tokens marked; ${truthScore.answered} of ${ASSERTIONS.length} statements judged.`}
        </span>
      </div>
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
