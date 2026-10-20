// The Week 5 record's readiness, computed from the record the lab tool saved in this browser with the same checks the
// tool applies (src/workbench/week5/record.ts). Shown on the Laboratory and Assessment pages.
import { loadJSON } from '../lib/storage'
import { allChecks, normalizeRecord, recordState, W5_KEY } from '../workbench/week5/record'
import { WEEK5_PARTS } from '../content/lectures/week05/labBrief'

export function Week5Readiness() {
  const r = normalizeRecord(loadJSON<unknown>(W5_KEY, null))
  const checks = allChecks(r) as Record<string, { ok: boolean; issues: string[] }>
  const state = recordState(r)
  const ready = state === 'ready'
  return (
    <div className="lf-card lf-wide" data-testid="w5-readiness">
      <p className="m-0">
        <strong>Status:</strong>{' '}
        <span data-testid="w5-readiness-state">{ready ? 'ready to submit' : r.week4 ? 'not ready' : 'not started: import your Week 4 record in the lab tool'}</span>
      </p>
      <ul className="lf-list mt-2">
        {WEEK5_PARTS.map((p) => {
          const c = checks[p.id]
          return (
            <li key={p.id} data-testid={`w5-readiness-${p.id}`}>
              Part {p.n} · {p.title}: {c ? (c.ok ? 'complete' : `incomplete (${c.issues.length} item${c.issues.length === 1 ? '' : 's'} still needed)`) : 'not checked'}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
