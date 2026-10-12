import { useState } from 'react'
import { Button, CitationText } from '../../components/ui'
import type { Citation } from '../../content/readings'
import { usePersistentState } from '../../lib/usePersistentState'
import {
  DECISIONS,
  DECISION_CITE,
  GATE_SCENARIOS,
  REVIEW_CITE,
  REVIEW_ITEMS,
  REVIEW_TYPES,
  STAGES,
  STAGE_CITE,
  STAGE_ITEMS,
  isAccepted,
  scoreKeyed,
  type Keyed,
} from './lifecycle'

const select = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

type Part<T extends string> = {
  id: string
  title: string
  intro: string
  items: (Keyed<T> & { gate?: string })[]
  options: { id: T; label: string }[]
  cite: Citation
  /** Optional free-text prompt per item (saved in this browser; copy it into the review notebook). */
  notePrompt?: string
  /** Extra key information shown only after checking (e.g. the review type's characteristic risk). */
  reveal?: (answer: T) => string
}

function KeyedPart<T extends string>({ part }: { part: Part<T> }) {
  const [answers, setAnswers] = usePersistentState<Record<string, T | undefined>>(`w02-lifecycle-${part.id}`, {})
  const [checked, setChecked] = useState(false)
  const [notes, setNotes] = usePersistentState<Record<string, string>>(`w02-lifecycle-${part.id}-notes`, {})
  const score = scoreKeyed(part.items, answers)
  const label = (id: T) => part.options.find((o) => o.id === id)?.label ?? id
  return (
    <fieldset className="space-y-2" data-testid={`w02-part-${part.id}`}>
      <legend className="font-semibold">{part.title}</legend>
      <p>{part.intro}</p>
      <ol className="space-y-2">
        {part.items.map((i) => {
          const v = answers[i.id]
          return (
            <li key={i.id} className="rounded border border-slate-200 p-2 dark:border-slate-800">
              {i.gate && <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{i.gate}</p>}
              <p>{i.text}</p>
              <select
                aria-label={`Answer for: ${i.text}`}
                className={`${select} mt-1`}
                value={v ?? ''}
                onChange={(e) => {
                  setAnswers((p) => ({ ...p, [i.id]: (e.target.value || undefined) as T | undefined }))
                  setChecked(false)
                }}
              >
                <option value="">Choose…</option>
                {part.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              {part.notePrompt && (
                <label className="mt-1 flex flex-col gap-1 text-xs">
                  {part.notePrompt}
                  <textarea
                    className={select}
                    rows={2}
                    value={notes[i.id] ?? ''}
                    onChange={(e) => setNotes((p) => ({ ...p, [i.id]: e.target.value }))}
                  />
                </label>
              )}
              {checked && (
                <p className={`mt-1 text-xs ${v === undefined ? '' : isAccepted(i, v) ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                  {v === undefined ? `Not answered. Key: ${label(i.answer)}. ` : v === i.answer ? '✓ Matches the key. ' : isAccepted(i, v) ? `✓ Accepted (the key prefers ${label(i.answer)}). ` : `✗ Key: ${label(i.answer)}. `}
                  {i.why}
                  {part.reveal ? ` ${part.reveal(i.answer)}` : ''}
                  {part.notePrompt && !(notes[i.id] ?? '').trim() ? ' You have not yet answered the written prompt for this item.' : ''}
                </p>
              )}
            </li>
          )
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setChecked(true)} disabled={score.answered === 0}>
          Check
        </Button>
        {checked && (
          <span role="status" data-testid={`w02-score-${part.id}`}>
            {score.correct} of {score.total} match the instructor key.{part.notePrompt ? ` Written answers: ${part.items.filter((i) => (notes[i.id] ?? '').trim()).length} of ${part.items.length} (copy them into your review notebook).` : ''}
          </span>
        )}
        <CitationText c={part.cite} />
      </div>
    </fieldset>
  )
}

export function LifecycleExplorer() {
  return (
    <div className="space-y-6 text-sm" data-testid="w02-lifecycle-explorer">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <caption className="mb-1 text-left font-semibold">Generic life-cycle stages and their primary goals (R06b p.384)</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1 pr-2">Stage</th>
              <th className="py-1">Primary goals</th>
            </tr>
          </thead>
          <tbody>
            {STAGES.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1 pr-2 font-medium">{s.label}</td>
                <td className="py-1">{s.goal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <KeyedPart
        part={{ id: 'stages', title: 'Part A — place AeroLink activities in a stage', intro: 'Choose the stage whose primary goal each activity serves. Remember that stages can run concurrently.', items: STAGE_ITEMS, options: STAGES.map((s) => ({ id: s.id, label: s.label })), cite: STAGE_CITE }}
      />
      <KeyedPart
        part={{ id: 'gates', title: 'Part B — make the gate decision', intro: 'Choose one of the five decision options for each situation, then write what evidence would change your decision.', items: GATE_SCENARIOS, options: DECISIONS, cite: DECISION_CITE, notePrompt: 'What evidence would change your decision?' }}
      />
      <KeyedPart
        part={{
          id: 'reviews',
          title: 'Part C — what triggers this technical review?',
          intro: 'Classify each review by its trigger (schedule, event or evidence), then name the risk you would guard against. The Boehm and Lane opportunity and risk for each type are shown after you check.',
          items: REVIEW_ITEMS,
          options: REVIEW_TYPES.map((t) => ({ id: t.id, label: t.label })),
          cite: REVIEW_CITE,
          notePrompt: 'Which risk would you guard against, and how?',
          reveal: (id) => {
            const t = REVIEW_TYPES.find((x) => x.id === id)!
            return `Boehm and Lane (R06c p.387): ${t.label} — opportunity: ${t.opportunity.toLowerCase()}; risk: ${t.risk.toLowerCase()}.`
          },
        }}
      />
    </div>
  )
}
