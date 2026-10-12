import { useState } from 'react'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { checkIssue, issueLogText, nextIssueId, type IssueEntry } from './risk'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const blank: Omit<IssueEntry, 'id'> = { title: '', text: '', owner: '', affects: '', action: '', linkedRisk: '' }

/** Issue log for the AROU register (W6-F10): issues are kept apart from the risks and copied into CP2 section 7. */
export function IssueLog({ targets }: { targets: { id: string; name: string }[] }) {
  const [log, setLog] = usePersistentState<IssueEntry[]>('w06-issues', [])
  const [draft, setDraft] = useState(blank)
  const [problems, setProblems] = useState<string[]>([])
  const set = (patch: Partial<typeof blank>) => setDraft((d) => ({ ...d, ...patch }))

  const record = () => {
    const found = checkIssue(draft)
    setProblems(found)
    if (found.length) return
    setLog([...log, { ...draft, id: nextIssueId(log) }])
    setDraft({ ...blank, owner: draft.owner })
  }

  return (
    <fieldset className="grid gap-2 rounded border border-slate-200 p-3 sm:grid-cols-2 dark:border-slate-800" data-testid="w06-issue-log">
      <legend className="px-1 font-medium">Issue log (already happened: probability 1.00, R61 p.637)</legend>
      <p className="text-xs sm:col-span-2">
        An issue is managed now, not rated on the 5×5 matrix. The shared workspace has no issue element, so issues are kept here (in this browser) and copied into CP2 section 7. If an issue could cause a further, uncertain consequence, record that as a separate risk and link its ID.
      </p>
      <label className="flex flex-col gap-1">
        Issue title
        <input className={input} value={draft.title} onChange={(e) => set({ title: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1">
        Issue affects element
        <select className={input} value={draft.affects} onChange={(e) => set({ affects: e.target.value })}>
          <option value="">Choose…</option>
          {targets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id} {t.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        What has happened (when, where)
        <textarea className={input} rows={2} value={draft.text} onChange={(e) => set({ text: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1">
        Issue owner (role)
        <input className={input} value={draft.owner} onChange={(e) => set({ owner: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1">
        Linked future risk (R-nnn, optional)
        <input className={input} value={draft.linkedRisk} onChange={(e) => set({ linkedRisk: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        Action now
        <input className={input} value={draft.action} onChange={(e) => set({ action: e.target.value })} />
      </label>
      <div className="sm:col-span-2">
        <Button variant="secondary" onClick={record}>
          Record issue
        </Button>
      </div>
      {problems.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-rose-700 sm:col-span-2 dark:text-rose-300">
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      <label className="flex flex-col gap-1 sm:col-span-2">
        Issue list for CP2 section 7
        <textarea readOnly className={`${input} font-mono text-xs`} rows={Math.max(2, log.length + 1)} value={issueLogText(log)} data-testid="w06-issue-text" />
      </label>
    </fieldset>
  )
}
