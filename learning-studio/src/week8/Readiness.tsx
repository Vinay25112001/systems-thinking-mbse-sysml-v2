// The Week 8 lab readiness, computed from the state the lab tool saved in this browser with the same checks the tool
// applies (src/workbench/week8/state.ts). Shown on the Laboratory and Assessment pages. These are course acceptance
// checks; model validity is decided by the course-designated checker run on the exported file.
import { loadJSON } from '../lib/storage'
import { normalizeState, readiness, W8_KEY } from '../workbench/week8/state'

export function Week8Readiness() {
  const s = normalizeState(loadJSON<unknown>(W8_KEY, null))
  const r = readiness(s)
  return (
    <div className="lf-card lf-wide" data-testid="w8-readiness-summary">
      <p className="m-0">
        <strong>Status:</strong> <span data-testid="w8-readiness-state">{r.ready ? 'ready to submit' : s.week1 ? 'not ready' : 'not started: import your Team Record in the lab tool'}</span>
      </p>
      <ul className="lf-list mt-2">
        {r.items.map((i) => (
          <li key={i.id} data-testid={`w8-readiness-${i.id}`}>
            {i.label}: {i.ok ? 'done' : `not yet (${i.detail})`}
          </li>
        ))}
      </ul>
    </div>
  )
}
