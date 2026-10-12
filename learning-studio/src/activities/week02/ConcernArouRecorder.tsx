import { useState } from 'react'
import { Button } from '../../components/ui'
import { DEFAULT_PROVENANCE_OWNER, ProvenanceOwnerFields } from '../../components/ProvenanceOwnerFields'
import { useWorkspace } from '../../state/Workspace'
import { ENTRY_KINDS, checkEntry, l2Coverage, linkFor, type Entry, type EntryKind } from './register'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const blank: Entry = { kind: 'CON', name: '', text: '', target: '', ...DEFAULT_PROVENANCE_OWNER }

export function ConcernArouRecorder() {
  const { model, apply } = useWorkspace()
  const [entry, setEntry] = useState<Entry>(blank)
  const [issues, setIssues] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const stakeholders = model.elements.filter((e) => e.kind === 'STK' && e.status === 'active')
  const concerns = model.elements.filter((e) => e.kind === 'CON' && e.status === 'active')
  // A concern derives from a stakeholder; an AROU entry may affect a stakeholder or a concern (lab artefact L2).
  const targets = entry.kind === 'CON' ? stakeholders : [...stakeholders, ...concerns]
  const cov = l2Coverage(model)

  const submit = () => {
    const found = checkEntry(entry)
    setIssues(found)
    if (found.length) return
    // One atomic update: the element and its trace link are created together, or nothing is applied.
    const r = apply({
      elements: [{ key: 'new', kind: entry.kind, name: entry.name.trim(), text: entry.text.trim(), owner: entry.owner.trim().toUpperCase(), provenance: entry.provenance }],
      links: [{ source: 'new', type: linkFor(entry.kind), target: entry.target, rationale: 'Recorded in Lab L2' }],
    })
    if (r.error) {
      setIssues([`Not recorded: ${r.error}.`])
      setMessage('')
      return
    }
    setMessage(`${r.ids.new} recorded and linked (${linkFor(entry.kind)} ${entry.target}), tagged ${entry.provenance}.`)
    setEntry({ ...blank, kind: entry.kind, target: entry.target, owner: entry.owner, provenance: entry.provenance })
  }

  const recorded = model.elements.filter((e) => ['CON', 'A', 'R', 'O', 'U'].includes(e.kind) && e.status === 'active')

  return (
    <div className="space-y-3 text-sm" data-testid="w02-concern-arou">
      <p>
        Concerns (CON) and AROU entries recorded here go into your AeroLink engineering workspace with the course ID scheme, so Week 3 needs can trace to them. Stakeholders come from the stakeholder editor ({stakeholders.length} found).
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          Kind
          <select className={input} value={entry.kind} onChange={(e) => setEntry({ ...entry, kind: e.target.value as EntryKind, target: '' })}>
            {ENTRY_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          {entry.kind === 'CON' ? 'Derived from stakeholder' : 'Affects stakeholder or concern'}
          <select className={input} value={entry.target} onChange={(e) => setEntry({ ...entry, target: e.target.value })}>
            <option value="">Choose…</option>
            {targets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Short name
          <input className={input} value={entry.name} onChange={(e) => setEntry({ ...entry, name: e.target.value })} />
        </label>
        <div className="sm:col-span-2">
          <ProvenanceOwnerFields value={{ owner: entry.owner, provenance: entry.provenance }} onChange={(v) => setEntry({ ...entry, ...v })} />
        </div>
        <label className="flex flex-col gap-1 sm:col-span-2">
          Statement
          <textarea className={input} rows={2} value={entry.text} onChange={(e) => setEntry({ ...entry, text: e.target.value })} />
        </label>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Screening only: the recorder flags concerns that name nothing beyond a general quality (“The community is concerned about noise.”) and risks without a condition–if–then form. Whether a concern is specific enough is still judged by a reviewer (RB-1.3).
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={submit}>Record entry</Button>
        <span role="status" data-testid="w02-recorder-message">
          {message}
        </span>
      </div>
      {issues.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-rose-700 dark:text-rose-300">
          {issues.map((i) => (
            <li key={i}>✗ {i}</li>
          ))}
        </ul>
      )}
      <p data-testid="w02-l2-coverage">
        Coverage: {cov.withConcern} of {cov.stakeholders} stakeholders have at least one concern{cov.missingConcern.length ? ` (missing: ${cov.missingConcern.join(', ')})` : ''}; {cov.arou} AROU entries (L2 minimum 4), {cov.arouLinked} linked by “affects” to a stakeholder or concern.
      </p>
      {recorded.length > 0 && (
        <table className="w-full text-left text-xs">
          <caption className="text-left font-medium">Recorded concerns and AROU entries</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1 pr-2">ID</th>
              <th className="py-1 pr-2">Name</th>
              <th className="py-1 pr-2">Statement</th>
              <th className="py-1 pr-2">Owner · provenance</th>
              <th className="py-1">Links</th>
            </tr>
          </thead>
          <tbody>
            {recorded.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                <td className="py-0.5 pr-2">{e.id}</td>
                <td className="py-0.5 pr-2">{e.name}</td>
                <td className="py-0.5 pr-2">{e.text}</td>
                <td className="py-0.5 pr-2">{e.owner ?? '—'} · {e.provenance}</td>
                <td className="py-0.5">
                  {model.links
                    .filter((l) => l.source === e.id)
                    .map((l) => `${l.type} ${l.target}`)
                    .join('; ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
