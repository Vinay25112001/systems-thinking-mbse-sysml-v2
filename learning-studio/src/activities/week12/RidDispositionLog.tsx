import { useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ProvenanceOwnerFields, ownerProblem, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { DECISIONS, MODEL_DISPOSITIONS, blankDisposition, checkDisposition, checkLog, dispositionMarkdown, dispositionOk, type Decision, type Disposition, type ReceivedSeverity } from './dispositions'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const FIELDS: { key: 'summary' | 'reason' | 'change' | 'evidence'; label: string; hint: string }[] = [
  { key: 'summary', label: 'RID summary (as received)', hint: 'What the reviewer says is wrong, in one sentence' },
  { key: 'reason', label: 'Reason', hint: 'Why you accept, modify, reject or defer; a rejection cites the criterion or source' },
  { key: 'change', label: 'Change made (fix reference) or target checkpoint', hint: "e.g. Removed satisfy 'REQ-SYS-001' by aeroLink.'PHY-003' (line 61); or: by CP5" },
  { key: 'evidence', label: 'Closure evidence or tracking', hint: 'e.g. Checker run: 0 errors; audit REQ-SYS satisfied 9 of 10; or: @Issue in the model' },
]

export function RidDispositionLog() {
  const [who, setWho] = usePersistentState<ProvenanceOwner>('w12-disp-owner', DEFAULT_PROVENANCE_OWNER)
  const [log, setLog] = usePersistentState<Disposition[]>('w12-dispositions', [])
  const [received, setReceived] = usePersistentState<number>('w12-disp-received', 0)
  const [d, setD] = useState<Disposition>(blankDisposition())
  const [showKey, setShowKey] = useState(false)
  const checks = checkDisposition(d)
  const ownerMsg = ownerProblem(who.owner)
  const canAdd = dispositionOk(d) && !ownerMsg
  const set = checkLog(log, received)

  const add = () => {
    setLog([...log.filter((x) => x.rid !== d.rid.trim()), { ...d, rid: d.rid.trim(), owner: who.owner.trim().toUpperCase(), provenance: who.provenance }])
    setD(blankDisposition())
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w12-disp-log">
      <p>Record a disposition for every RID your team received on CP4. The screens check the form of each disposition (a findable change, closure evidence, a cited reason for a rejection, a tracked deferral). They cannot tell whether your decision is right.</p>
      <ProvenanceOwnerFields value={who} onChange={setWho} />
      <label className="flex w-48 flex-col">RIDs received (peer team + instructor)<input className={input} type="number" min={0} value={received} onChange={(e) => setReceived(Math.max(0, parseInt(e.target.value, 10) || 0))} /></label>

      <fieldset className="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">Disposition</legend>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col">RID ID<input className={`${input} w-32`} value={d.rid} onChange={(e) => setD({ ...d, rid: e.target.value })} placeholder="RID-T4-01" /></label>
          <label className="flex flex-col">Severity received
            <select className={input} value={d.severity} onChange={(e) => setD({ ...d, severity: e.target.value as ReceivedSeverity })}>
              <option value="">— choose —</option><option value="major">major</option><option value="minor">minor</option><option value="editorial">editorial</option>
            </select>
          </label>
          <label className="flex flex-col">Disposition
            <select className={input} value={d.decision} onChange={(e) => setD({ ...d, decision: e.target.value as Decision })}>
              <option value="">— choose —</option>
              {DECISIONS.map((x) => <option key={x.id} value={x.id} title={x.meaning}>{x.label}</option>)}
            </select>
          </label>
        </div>
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col">{f.label}
            <textarea className={input} rows={2} value={d[f.key]} placeholder={f.hint} onChange={(e) => setD({ ...d, [f.key]: e.target.value })} />
          </label>
        ))}
        <ul className="space-y-0.5 text-xs" data-testid="w12-disp-screens" aria-live="polite">
          {checks.map((c, i) => <li key={i}><span aria-hidden="true" className="mr-1 font-bold">{c.ok ? '✓' : '✗'}</span><span className="sr-only">{c.ok ? 'OK' : 'Problem'}: </span><strong>{c.field}</strong>: {c.message}</li>)}
          {ownerMsg && <li><span aria-hidden="true" className="mr-1 font-bold">✗</span><strong>owner</strong>: {ownerMsg}</li>}
        </ul>
        <Button disabled={!canAdd} onClick={add}>Add to log</Button>
      </fieldset>

      <section>
        <h4 className="font-medium">Disposition log ({log.length})</h4>
        <ol className="ml-5 list-decimal space-y-1" data-testid="w12-disp-list">
          {log.map((x) => (
            <li key={x.rid}><span aria-hidden="true" className="mr-1 font-bold">{dispositionOk(x) ? '✓' : '✗'}</span><strong>{x.rid}</strong> [{x.severity}] {x.decision}: {x.summary} <span className="text-xs">({x.owner}, {x.provenance})</span>
              <Button variant="ghost" ariaLabel={`Edit ${x.rid}`} onClick={() => setD(x)}>Edit</Button>
              <Button variant="ghost" ariaLabel={`Remove ${x.rid}`} onClick={() => setLog(log.filter((y) => y.rid !== x.rid))}>Remove</Button>
            </li>
          ))}
        </ol>
        <ul className="mt-2 space-y-0.5" data-testid="w12-disp-set">
          {set.map((c, i) => <li key={i}><span aria-hidden="true" className="mr-1 font-bold">{c.ok ? '✓' : '✗'}</span>{c.message}</li>)}
        </ul>
      </section>

      <details className="rounded border border-slate-200 p-2 dark:border-slate-800">
        <summary className="cursor-pointer font-medium">Disposition table (Markdown) for L12</summary>
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs" tabIndex={0}>{dispositionMarkdown(log)}</pre>
      </details>

      <div>
        <Button variant="secondary" disabled={log.length < 2} onClick={() => setShowKey(true)}>Compare with a worked log (after two dispositions)</Button>
        {showKey && (
          <ol className="ml-5 mt-2 list-decimal space-y-1 text-xs" data-testid="w12-disp-key">
            {MODEL_DISPOSITIONS.map((x) => <li key={x.rid}><strong>{x.rid}</strong> [{x.severity}] <em>{x.decision}</em>: {x.summary} Reason: {x.reason} Change: {x.change} Evidence: {x.evidence}</li>)}
          </ol>
        )}
      </div>
    </div>
  )
}
