import { usePersistentState } from '../../lib/usePersistentState'
import { RATING_LABEL, SRR_CRITERIA, checkFinding, recommend, reviewRecord, type Rating, type Review } from './srr'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const EMPTY: Review = { reviewer: '', reviewed: '', findings: {} }

export function SrrChecklist() {
  const [r, setR] = usePersistentState<Review>('w06-srr', EMPTY)
  const rec = recommend(r)
  const setFinding = (id: string, patch: { rating?: Rating; text?: string }) =>
    setR({ ...r, findings: { ...r.findings, [id]: { ...(r.findings[id] ?? { text: '' }), ...patch } } })

  return (
    <div className="space-y-4 text-sm" data-testid="w06-srr-checklist">
      <p>
        Prepare your review of the other team’s CP2 package before Session 2. Each criterion adapts the DoD SRR criteria (R40 p.69–72) to CP2. Every rating below “met” needs an actionable finding: name the artefact by ID, state the defect against the criterion, and ask for a specific change. The tool flags findings with no ID or no requested change, and common non-actionable patterns (preferences, “change everything”); it is a heuristic, so read every finding as a reviewer would.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          Reviewing team
          <input className={input} value={r.reviewer} onChange={(e) => setR({ ...r, reviewer: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          Team and baseline reviewed
          <input className={input} value={r.reviewed} onChange={(e) => setR({ ...r, reviewed: e.target.value })} />
        </label>
      </div>
      <ol className="space-y-3">
        {SRR_CRITERIA.map((c) => {
          const f = r.findings[c.id] ?? { text: '' }
          const issues = f.rating || f.text ? checkFinding(f) : []
          return (
            <li key={c.id} className="rounded border border-slate-200 p-3 dark:border-slate-800">
              <p className="font-medium">
                {c.id} {c.title} <span className="text-xs font-normal text-slate-600 dark:text-slate-400">({c.cite})</span>
              </p>
              <p className="text-xs">{c.adapted}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">CP2 evidence to look for: {c.cp2Evidence}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-[12rem_1fr]">
                <label className="flex flex-col gap-1">
                  Rating
                  <select aria-label={`Rating for ${c.id}`} className={input} value={f.rating ?? ''} onChange={(e) => setFinding(c.id, { rating: (e.target.value || undefined) as Rating | undefined })}>
                    <option value="">Choose…</option>
                    {(Object.keys(RATING_LABEL) as Rating[]).map((k) => (
                      <option key={k} value={k}>
                        {RATING_LABEL[k]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  Finding (evidence checked; for “partly” or “not met”, the artefact ID and the change requested)
                  <textarea aria-label={`Finding for ${c.id}`} className={input} rows={2} value={f.text} onChange={(e) => setFinding(c.id, { text: e.target.value })} />
                </label>
              </div>
              {issues.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-xs" data-testid={`w06-srr-issues-${c.id}`}>
                  {issues.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
      <p role="status" data-testid="w06-srr-recommendation" className="rounded bg-slate-50 p-2 font-medium dark:bg-slate-800/60">
        {rec.text}
      </p>
      <label className="flex flex-col gap-1">
        Review record (copy into both teams’ CP2 packages)
        <textarea readOnly className={`${input} font-mono text-xs`} rows={10} value={reviewRecord(r)} />
      </label>
    </div>
  )
}
