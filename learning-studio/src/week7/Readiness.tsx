// The Week 7 package's readiness, computed from the package the tool saved in this browser with the same checks the tool
// applies (src/workbench/week7/record.ts). Shown on the Laboratory and Assessment pages. Template: src/week6/Readiness.tsx.
import { loadJSON } from '../lib/storage'
import { STATES, WEEK7_PARTS } from '../content/lectures/week07/labBrief'
import { allChecks, normalizePackage, packageState, W7_KEY } from '../workbench/week7/record'

export function Week7Readiness() {
  const r = normalizePackage(loadJSON<unknown>(W7_KEY, null))
  const checks = allChecks(r)
  const state = packageState(r)
  const loaded = Object.keys(r.sources).length
  return (
    <div className="lf-card lf-wide" data-testid="w7-readiness">
      <p className="m-0">
        <strong>Status:</strong>{' '}
        <span data-testid="w7-readiness-state">{loaded ? STATES.find((s) => s.id === state)!.label : 'not started: load your six weekly exports in the package tool'}</span>
      </p>
      <ul className="lf-list mt-2">
        {WEEK7_PARTS.map((p) => {
          const c = checks[p.id]
          return (
            <li key={p.id} data-testid={`w7-readiness-${p.id}`}>
              Part {p.n} · {p.title}: {c.ok ? 'complete' : `incomplete (${c.issues.length} item${c.issues.length === 1 ? '' : 's'} still needed)`}
              {p.id === 'rids' ? ' (after the review)' : ''}
            </li>
          )
        })}
        <li data-testid="w7-readiness-ai">Part 6 · AI usage summary: {checks.ai.ok ? 'complete' : 'incomplete'}</li>
      </ul>
    </div>
  )
}
