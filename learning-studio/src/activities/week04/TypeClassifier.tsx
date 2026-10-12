import { useState } from 'react'
import { Badge, Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { ITEMS, LEVELS, TYPES, gradeItem, scoreAll, type Answer, type ItemLevel, type ItemType, type ItemVerdict } from './classify'

const select = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const VERDICT: Record<ItemVerdict, { label: string; tone: 'emerald' | 'sky' | 'rose' | 'slate' }> = {
  correct: { label: 'Matches the key', tone: 'emerald' },
  defensible: { label: 'Defensible: argue it', tone: 'sky' },
  incorrect: { label: 'Does not match', tone: 'rose' },
  unanswered: { label: 'Not answered', tone: 'slate' },
}

export function TypeClassifier() {
  const [answers, setAnswers] = usePersistentState<Record<string, Answer>>('w04-classifier', {})
  const [checked, setChecked] = useState(false)
  const set = (id: string, patch: Answer) => {
    setAnswers((p) => ({ ...p, [id]: { ...p[id], ...patch } }))
    setChecked(false)
  }
  const score = scoreAll(answers)

  return (
    <div className="space-y-3 text-sm" data-testid="w04-classifier">
      <p>
        For each statement decide its level (need, stakeholder requirement or system requirement) and, if it is a requirement, its type. Decide before you check. The key is the instructor reference; where a second answer can be argued, it is marked as defensible and you should write the argument.
      </p>
      <ol className="space-y-3">
        {ITEMS.map((item, n) => {
          const a = answers[item.id] ?? {}
          const f = gradeItem(item, a)
          return (
            <li key={item.id} className="rounded border border-slate-200 p-2 dark:border-slate-800">
              <p>
                <span className="font-medium">{n + 1}.</span> {item.text}
              </p>
              <div className="mt-1 flex flex-wrap gap-3">
                <label className="flex items-center gap-1">
                  Level
                  <select aria-label={`Level of statement ${n + 1}`} className={select} value={a.level ?? ''} onChange={(e) => set(item.id, { level: (e.target.value || undefined) as ItemLevel | undefined })}>
                    <option value="">Choose…</option>
                    {LEVELS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-1">
                  Type
                  <select aria-label={`Type of statement ${n + 1}`} className={select} value={a.type ?? ''} onChange={(e) => set(item.id, { type: (e.target.value || undefined) as ItemType | undefined })}>
                    <option value="">Choose…</option>
                    {TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {checked && (
                <div className="mt-2 rounded bg-slate-50 p-2 dark:bg-slate-800/60" data-testid={`w04-class-fb-${item.id}`}>
                  <Badge tone={VERDICT[f.overall].tone}>{VERDICT[f.overall].label}</Badge>{' '}
                  <span>
                    Key: {item.id}, {LEVELS.find((l) => l.id === item.level)!.label.toLowerCase()}
                    {item.type !== 'none' && `, ${item.type}`}
                    {item.alsoDefensible?.length ? ` (also defensible: ${item.alsoDefensible.join(', ')})` : ''}. SEBoK category: {item.sebok}.
                    {f.levelOk === false && ' Your level differs from the key.'}
                  </span>
                  <p className="mt-1">{item.why}</p>
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setChecked(true)}>Check my classification</Button>
        <span role="status" data-testid="w04-class-score">
          {checked ? `${score.correct} match the key, ${score.defensible} defensible, ${score.incorrect} do not match, ${ITEMS.length - score.answered} unanswered (levels right: ${score.levelCorrect} of ${ITEMS.length}).` : ''}
        </span>
      </div>
    </div>
  )
}
