// The Week 6 record's readiness, computed from the record the lab tool saved in this browser with the same checks the
// tool applies (src/workbench/week6/record.ts). Shown on the Laboratory and Assessment pages. Template: src/week5/Readiness.tsx.
import { loadJSON } from '../lib/storage'
import { allChecks, normalizeRecord, recordState, W6_KEY } from '../workbench/week6/record'
import { WEEK6_PARTS } from '../content/lectures/week06/labBrief'

export function Week6Readiness() {
  const r = normalizeRecord(loadJSON<unknown>(W6_KEY, null))
  const checks = allChecks(r) as Record<string, { ok: boolean; issues: string[] }>
  const state = recordState(r)
  const ready = state === 'ready'
  return (
    <div className="lf-card lf-wide" data-testid="w6-readiness">
      <p className="m-0">
        <strong>Status:</strong>{' '}
        <span data-testid="w6-readiness-state">{ready ? 'ready to submit' : r.week5 ? 'not ready' : 'not started: import your Week 5 record in the lab tool'}</span>
      </p>
      <ul className="lf-list mt-2">
        {WEEK6_PARTS.map((p) => {
          const c = checks[p.id]
          return (
            <li key={p.id} data-testid={`w6-readiness-${p.id}`}>
              Part {p.n} · {p.title}: {c ? (c.ok ? 'complete' : `incomplete (${c.issues.length} item${c.issues.length === 1 ? '' : 's'} still needed)`) : 'not checked'}
            </li>
          )
        })}
        <li data-testid="w6-readiness-ai">Part 6 · AI usage statement (updated): {checks.ai?.ok ? 'complete' : 'incomplete'}</li>
      </ul>
    </div>
  )
}
