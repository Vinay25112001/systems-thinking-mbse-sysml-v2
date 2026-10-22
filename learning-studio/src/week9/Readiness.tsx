// The Week 9 lab readiness, computed from the state the lab tool saved in this browser with the same checks the tool
// applies (src/workbench/week9/state.ts). Shown on the Laboratory and Assessment pages. These are course acceptance
// checks; model validity is decided by the course-designated checker run on the exported file.
import { loadJSON } from '../lib/storage'
import { normalizeState, readiness, W9_KEY } from '../workbench/week9/state'

export function Week9Readiness() {
  const s = normalizeState(loadJSON<unknown>(W9_KEY, null))
  const r = readiness(s)
  const started = !!(s.w8 || s.w1 || s.w2)
  return (
    <div className="lf-card lf-wide" data-testid="w9-readiness-summary">
      <p className="m-0">
        <strong>Status:</strong> <span data-testid="w9-readiness-state">{r.ready ? 'ready to submit' : started ? 'not ready' : 'not started: import your three files in the lab tool'}</span>
      </p>
      <ul className="lf-list mt-2">
        {r.items.map((i) => (
          <li key={i.id} data-testid={`w9-readiness-${i.id}`}>
            {i.label}: {i.ok ? 'done' : `not yet (${i.detail})`}
          </li>
        ))}
      </ul>
    </div>
  )
}
