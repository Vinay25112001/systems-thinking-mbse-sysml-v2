// The Week 2 record's readiness, computed from the record the lab tool saved in this browser with the same checks the
// tool applies (src/workbench/week2/record.ts). Shown on the Laboratory and Assessment pages.
import { loadJSON } from '../lib/storage'
import { allChecks, normalizeRecord, recordState, W2_KEY } from '../workbench/week2/record'
import { WEEK2_PARTS } from '../content/lectures/week02/labBrief'

export function Week2Readiness() {
  const r = normalizeRecord(loadJSON<unknown>(W2_KEY, null))
  const checks = allChecks(r) as Record<string, { ok: boolean; issues: string[]; detail: string }>
  const state = recordState(r)
  const ready = state === 'ready'
  return (
    <div className="lf-card lf-wide" data-testid="w2-readiness">
      <p className="m-0">
        <strong>Status:</strong>{' '}
        <span data-testid="w2-readiness-state">{ready ? 'ready to submit' : r.week1 ? 'not ready' : 'not started: import your Week 1 record in the lab tool'}</span>
      </p>
      <ul className="lf-list mt-2">
        {WEEK2_PARTS.map((p) => {
          const c = checks[p.id]
          return (
            <li key={p.id} data-testid={`w2-readiness-${p.id}`}>
              Part {p.n} · {p.title}: {c ? (c.ok ? 'complete' : `incomplete (${c.issues.length} item${c.issues.length === 1 ? '' : 's'} still needed)`) : 'not checked'}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
