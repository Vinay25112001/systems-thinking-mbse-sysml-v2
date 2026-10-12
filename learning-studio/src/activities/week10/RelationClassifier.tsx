import { useState } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { CASES, RELATIONS, scoreRelations, type Relation } from './relations'

export function RelationClassifier() {
  const [answers, setAnswers] = usePersistentState<Record<string, Relation | undefined>>('w10-relations', {})
  const [checked, setChecked] = useState(false)
  const score = scoreRelations(answers)

  return (
    <div className="space-y-3 text-sm" data-testid="w10-relations">
      <p>
        For each engineering statement, choose the SysML v2 relationship that expresses it — or decide that the model should not assert anything yet. Then check: every answer has an explanation of what the relationship asserts and its source.
      </p>
      <ol className="space-y-2">
        {CASES.map((c, i) => {
          const a = answers[c.id]
          const ok = score.perItem[c.id]
          return (
            <li key={c.id} className="rounded border border-slate-200 p-2 dark:border-slate-800">
              <fieldset>
                <legend className="font-medium">
                  {i + 1}. {c.statement}
                </legend>
                <div className="mt-1 flex flex-col gap-1">
                  {RELATIONS.map((r) => (
                    <label key={r.id} className="flex items-center gap-1.5" title={r.hint}>
                      <input type="radio" name={`w10-rel-${c.id}`} checked={a === r.id} onChange={() => setAnswers({ ...answers, [c.id]: r.id })} />
                      <span className={r.id === 'no-relationship' ? '' : 'font-mono'}>{r.label}</span>
                    </label>
                  ))}
                </div>
                {checked && a && (
                  <p className="mt-1" data-testid={`w10-rel-feedback-${c.id}`}>
                    <strong>{ok ? '✓ Correct.' : `✗ Not this one: the answer is “${RELATIONS.find((r) => r.id === c.answer)!.label}”.`}</strong> {c.explanation}
                  </p>
                )}
              </fieldset>
            </li>
          )
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setChecked(true)}>Check my answers</Button>
        <Button
          variant="secondary"
          onClick={() => {
            setAnswers({})
            setChecked(false)
          }}
        >
          Start again
        </Button>
        <span role="status" data-testid="w10-relations-score">
          {score.answered} of {CASES.length} answered{checked ? `; ${score.correct} correct` : ''}.
        </span>
      </div>
    </div>
  )
}
