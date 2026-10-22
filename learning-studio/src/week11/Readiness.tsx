// The Week 11 lab readiness, computed from the state the lab tool saved in this browser with the same checks the tool
// applies (src/workbench/week11/state.ts). Shown on the Laboratory and Assessment pages. These are course acceptance
// checks; model validity is decided by the course-designated checker run on the exported file.
import { loadJSON } from '../lib/storage'
import { normalizeState, readiness, W11_KEY } from '../workbench/week11/state'

export function Week11Readiness() {
  const s = normalizeState(loadJSON<unknown>(W11_KEY, null))
  const r = readiness(s)
  const started = !!(s.w10 || s.w5)
  return (
    <div className="lf-card lf-wide" data-testid="w11-readiness-summary">
      <p className="m-0">
        <strong>Status:</strong> <span data-testid="w11-readiness-state">{r.ready ? 'ready to submit' : started ? 'not ready' : 'not started: import your two files in the lab tool'}</span>
      </p>
      <ul className="lf-list mt-2">
        {r.items.map((i) => (
          <li key={i.id} data-testid={`w11-readiness-${i.id}`}>
            {i.label}: {i.ok ? 'done' : `not yet (${i.detail})`}
          </li>
        ))}
      </ul>
    </div>
  )
}
