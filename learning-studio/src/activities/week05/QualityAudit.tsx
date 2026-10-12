import { useState } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { ATTRIBUTES, AUDIT_ITEMS, lintSignals, scoreAuditItem, type Attribute } from './audit'

export function QualityAudit() {
  const [sel, setSel] = usePersistentState<Record<string, Attribute[]>>('w05-audit', {})
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const item = AUDIT_ITEMS[idx]
  const chosen = sel[item.id] ?? []
  const score = scoreAuditItem(chosen, item.key)
  const toggle = (a: Attribute) => setSel({ ...sel, [item.id]: chosen.includes(a) ? chosen.filter((x) => x !== a) : [...chosen, a] })
  const exactCount = AUDIT_ITEMS.filter((a) => revealed[a.id] && scoreAuditItem(sel[a.id] ?? [], a.key).exact).length

  return (
    <div className="space-y-3 text-sm" data-testid="w05-quality-audit">
      <div className="flex flex-wrap items-center gap-2">
        {AUDIT_ITEMS.map((a, i) => (
          <Button key={a.id} variant={i === idx ? 'primary' : 'secondary'} onClick={() => setIdx(i)} ariaLabel={`Requirement ${i + 1} of ${AUDIT_ITEMS.length}: ${a.reqId}`}>
            {a.reqId}
            {revealed[a.id] ? (scoreAuditItem(sel[a.id] ?? [], a.key).exact ? ' ✓' : ' ✗') : ''}
          </Button>
        ))}
      </div>
      <blockquote className="rounded border-l-4 border-slate-400 bg-slate-50 p-2 dark:bg-slate-900">
        <p>
          <span className="font-mono">{item.reqId}</span> “{item.text}”
        </p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Context: {item.context}</p>
      </blockquote>
      <fieldset>
        <legend className="mb-1 font-medium">Which attributes of a good requirement (DoD SE Guidebook, R48 p.144) does it violate? Select none if it is sound.</legend>
        <div className="grid gap-1 sm:grid-cols-3">
          {ATTRIBUTES.map((a) => (
            <label key={a} className="flex items-center gap-1.5">
              <input type="checkbox" checked={chosen.includes(a)} onChange={() => toggle(a)} />
              {a}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setRevealed({ ...revealed, [item.id]: true })}>Check this finding</Button>
        <span role="status">
          {exactCount} of {AUDIT_ITEMS.length} exactly matched so far.
        </span>
      </div>
      {revealed[item.id] && (
        <div className="space-y-1 rounded-lg bg-slate-100 p-3 dark:bg-slate-800" data-testid="w05-audit-feedback">
          <p>
            <strong>{score.exact ? 'Matches the key.' : 'Differs from the key.'}</strong> Agreed: {score.hits.join(', ') || '—'}. Missed: {score.missed.join(', ') || '—'}. Not supported by the key: {score.extra.join(', ') || '—'}.
          </p>
          <p>
            <strong>Finding:</strong> {item.finding}
          </p>
          <p>
            <strong>Suggested revision:</strong> {item.revision}
          </p>
          <p className="text-xs">
            <strong>Mechanical lint signals</strong> (course heuristics, advisory only: a signal may be false, and none replaces judgement): {lintSignals(item.text).join(' ') || 'none.'}
          </p>
          <p className="text-xs">An audit finding you can defend from the text is acceptable even where it differs from the key — record the reason in your audit report (RB-3.6).</p>
        </div>
      )}
    </div>
  )
}
