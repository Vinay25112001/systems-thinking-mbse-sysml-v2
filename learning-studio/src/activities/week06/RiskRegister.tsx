import { useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ownerProblem, ProvenanceOwnerFields, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Button } from '../../components/ui'
import { referenceUpTo } from '../../model/reference'
import { useWorkspace } from '../../state/Workspace'
import {
  AROU_LABEL,
  CONSEQUENCE,
  HANDLING,
  LEVEL_MARK,
  LIKELIHOOD,
  attributesFor,
  cellLevel,
  checkEntry,
  entryFrom,
  handlingLabel,
  plotRisks,
  registerCompleteness,
  type AROUKind,
  type CellLevel,
  type Handling,
  type RegisterEntry,
} from './risk'
import { IssueLog } from './IssueLog'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const blank: RegisterEntry = { kind: 'R', name: '', text: '', owner: '', affects: '', treatment: '', trigger: '', action: '', needBy: '' }
// Colour is redundant: every cell also carries its level as text (L / M / H) and a distinct border style.
const CELL: Record<CellLevel, string> = {
  Low: 'bg-emerald-50 border border-emerald-600 dark:bg-emerald-950/50 dark:border-emerald-500',
  Moderate: 'bg-amber-50 border-2 border-dashed border-amber-600 dark:bg-amber-950/50 dark:border-amber-400',
  High: 'bg-rose-50 border-4 border-double border-rose-700 dark:bg-rose-950/50 dark:border-rose-400',
}
const REFERENCE = referenceUpTo(6)

export function RiskRegister() {
  const { model, apply, updateElement, addLink } = useWorkspace()
  const [source, setSource] = useState<'mine' | 'reference'>('mine')
  const [entry, setEntry] = useState<RegisterEntry>(blank)
  const [editing, setEditing] = useState<string | null>(null)
  const [issues, setIssues] = useState<{ errors: string[]; warnings: string[] }>({ errors: [], warnings: [] })
  const [message, setMessage] = useState('')
  const [po, setPo] = useState<ProvenanceOwner>(DEFAULT_PROVENANCE_OWNER)
  const m = source === 'mine' ? model : REFERENCE
  const arou = m.elements.filter((e) => e.status === 'active' && ['A', 'R', 'O', 'U'].includes(e.kind))
  const plotted = plotRisks(m.elements)
  const completeness = registerCompleteness(m)
  const targets = model.elements.filter((e) => e.status === 'active' && e.id !== editing)
  const affectsOf = (id: string) => m.links.filter((l) => l.source === id && l.type === 'affects').map((l) => l.target)
  const set = (patch: Partial<RegisterEntry>) => setEntry((e) => ({ ...e, ...patch }))

  const startEdit = (id: string) => {
    const el = model.elements.find((e) => e.id === id)
    if (!el || source !== 'mine') return
    setEditing(id)
    setEntry(entryFrom(el, affectsOf(id)[0] ?? ''))
    setPo({ owner: el.owner ?? '', provenance: el.provenance === 'instructor-reference' || el.provenance === 'instructor-fictional' || el.provenance === 'official-S04' ? 'team-derived' : el.provenance })
    setIssues({ errors: [], warnings: [] })
    setMessage(`Editing ${id}.`)
  }

  const save = () => {
    const found = checkEntry(entry)
    const ownerIssue = ownerProblem(po.owner)
    if (ownerIssue) found.errors.push(`${ownerIssue} The element owner is the student accountable for the entry; the owner role above is the risk manager.`)
    setIssues(found)
    if (found.errors.length) return setMessage('')
    const attributes = attributesFor(entry)
    const owner = po.owner.trim().toUpperCase()
    const provenance = po.provenance
    if (editing) {
      updateElement(editing, { name: entry.name.trim(), text: entry.text.trim(), attributes, owner, provenance })
      const linkRes: { error?: string } = affectsOf(editing).includes(entry.affects) ? {} : addLink(editing, 'affects', entry.affects, 'Recorded in Lab L6')
      setMessage(`${editing} updated${linkRes.error ? ` (link not added: ${linkRes.error})` : ''}.`)
      setEditing(null)
      setEntry({ ...blank, kind: entry.kind })
      return
    }
    const res = apply({
      elements: [{ key: 'e', kind: entry.kind, name: entry.name.trim(), text: entry.text.trim(), attributes, owner, provenance }],
      links: [{ source: 'e', type: 'affects', target: entry.affects, rationale: 'Recorded in Lab L6' }],
    })
    if (res.error) return setMessage(res.error)
    setMessage(`${res.ids.e} recorded and linked (affects ${entry.affects}).`)
    setEntry({ ...blank, kind: entry.kind, owner: entry.owner })
  }

  const level = entry.kind === 'R' && entry.likelihood && entry.consequence ? cellLevel(entry.likelihood, entry.consequence) : null

  return (
    <div className="space-y-4 text-sm" data-testid="w06-risk-register">
      <fieldset className="flex flex-wrap gap-4">
        <legend className="sr-only">Register shown</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="w06-source" checked={source === 'mine'} onChange={() => setSource('mine')} /> My workspace register
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="w06-source" checked={source === 'reference'} onChange={() => setSource('reference')} /> Instructor reference register (read-only)
        </label>
      </fieldset>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <figure>
          <table className="border-separate border-spacing-1 text-xs" data-testid="w06-matrix">
            <caption className="mb-1 text-left font-medium">5×5 matrix: likelihood (rows) × consequence (columns); cell level as in R46 p.126 and R61 p.642</caption>
            <thead>
              <tr>
                <th scope="col" className="px-1">L \ C</th>
                {CONSEQUENCE.map((c) => (
                  <th key={c.level} scope="col" className="px-1" title={c.anchor}>
                    {c.level} {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...LIKELIHOOD].reverse().map((l) => (
                <tr key={l.level}>
                  <th scope="row" className="px-1 text-right font-normal" title={l.band}>
                    {l.level} {l.label}
                  </th>
                  {CONSEQUENCE.map((c) => {
                    const lev = cellLevel(l.level, c.level)
                    const here = plotted.filter((r) => r.likelihood === l.level && r.consequence === c.level)
                    return (
                      <td key={c.level} className={`h-16 w-20 rounded p-1 align-top ${CELL[lev]}`} aria-label={`Likelihood ${l.level}, consequence ${c.level}: ${lev}${here.length ? `; ${here.map((r) => r.id).join(', ')}` : ''}`}>
                        <span className="font-semibold" aria-hidden="true">
                          {LEVEL_MARK[lev]}
                        </span>
                        <span className="mt-0.5 flex flex-wrap gap-0.5">
                          {here.map((r) => (
                            <button key={r.id} type="button" onClick={() => startEdit(r.id)} disabled={source !== 'mine'} className="rounded bg-white/80 px-1 text-[11px] text-slate-900 underline-offset-2 hover:underline disabled:no-underline dark:bg-slate-900/80 dark:text-slate-100">
                              {r.id}
                            </button>
                          ))}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <figcaption className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Key: L = Low (thin border), M = Moderate (dashed border), H = High (double border). Likelihood bands: {LIKELIHOOD.map((l) => `${l.level} ${l.band}`).join('; ')}.
          </figcaption>
        </figure>

        <div>
          <h4 className="font-semibold">Register completeness for CP2 ({source === 'mine' ? 'your workspace' : 'reference'})</h4>
          <ul className="mt-1 space-y-0.5" data-testid="w06-completeness">
            {completeness.map((c) => (
              <li key={c.id}>
                <span className="font-semibold">{c.ok ? 'Pass' : 'Fail'}</span> — {c.label} ({c.detail})
              </li>
            ))}
          </ul>
        </div>
      </div>

      <table className="w-full text-left text-xs" data-testid="w06-risk-table">
        <caption className="text-left font-medium">Table equivalent of the matrix — risks in priority order (level, then consequence, then likelihood)</caption>
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="py-1 pr-2">ID</th>
            <th className="py-1 pr-2">Title</th>
            <th className="py-1 pr-2">L</th>
            <th className="py-1 pr-2">C</th>
            <th className="py-1 pr-2">Level</th>
            <th className="py-1 pr-2">Handling</th>
            <th className="py-1">Owner</th>
          </tr>
        </thead>
        <tbody>
          {plotted.map((r) => (
            <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-0.5 pr-2">{r.id}</td>
              <td className="py-0.5 pr-2">{r.name}</td>
              <td className="py-0.5 pr-2">{r.likelihood}</td>
              <td className="py-0.5 pr-2">{r.consequence}</td>
              <td className="py-0.5 pr-2">{r.level}</td>
              <td className="py-0.5 pr-2">{r.handling ? handlingLabel(r.handling) : '—'}</td>
              <td className="py-0.5">{r.owner || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center gap-1 text-xs" data-testid="w06-other-entries">
        <span>Assumptions, opportunities and unknowns:</span>
        {arou.filter((e) => e.kind !== 'R').length === 0 && <span>none</span>}
        {arou
          .filter((e) => e.kind !== 'R')
          .map((e) =>
            source === 'mine' ? (
              <button key={e.id} type="button" onClick={() => startEdit(e.id)} className="rounded border border-slate-300 px-1 hover:underline dark:border-slate-700" title={e.name}>
                {e.id} ({AROU_LABEL[e.kind as AROUKind]})
              </button>
            ) : (
              <span key={e.id} title={e.name}>
                {e.id} ({AROU_LABEL[e.kind as AROUKind]})
              </span>
            ),
          )}
      </div>

      {source === 'mine' && (
        <fieldset className="grid gap-2 rounded border border-slate-200 p-3 sm:grid-cols-2 dark:border-slate-800">
          <legend className="px-1 font-medium">{editing ? `Edit ${editing}` : 'Record a new AROU entry'}</legend>
          <label className="flex flex-col gap-1">
            Kind
            <select className={input} value={entry.kind} disabled={!!editing} onChange={(e) => set({ kind: e.target.value as AROUKind })}>
              {(Object.keys(AROU_LABEL) as AROUKind[]).map((k) => (
                <option key={k} value={k}>
                  {AROU_LABEL[k]} ({k})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Affects element
            <select className={input} value={entry.affects} onChange={(e) => set({ affects: e.target.value })}>
              <option value="">Choose…</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Title
            <input className={input} value={entry.name} onChange={(e) => set({ name: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            Owner (role with the knowledge, authority and resources to act)
            <input className={input} value={entry.owner} onChange={(e) => set({ owner: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            {entry.kind === 'R' ? 'Risk statement (Condition: … If …, then …)' : 'Statement'}
            <textarea className={input} rows={3} value={entry.text} onChange={(e) => set({ text: e.target.value })} />
          </label>
          {entry.kind === 'R' ? (
            <>
              <label className="flex flex-col gap-1">
                Likelihood
                <select className={input} value={entry.likelihood ?? ''} onChange={(e) => set({ likelihood: e.target.value ? Number(e.target.value) : undefined })}>
                  <option value="">Choose…</option>
                  {LIKELIHOOD.map((l) => (
                    <option key={l.level} value={l.level}>
                      {l.level} {l.label} ({l.band})
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Consequence
                <select className={input} value={entry.consequence ?? ''} onChange={(e) => set({ consequence: e.target.value ? Number(e.target.value) : undefined })}>
                  <option value="">Choose…</option>
                  {CONSEQUENCE.map((c) => (
                    <option key={c.level} value={c.level}>
                      {c.level} {c.label} — {c.anchor}
                    </option>
                  ))}
                </select>
              </label>
              <p className="sm:col-span-2" data-testid="w06-cell-level">
                {level ? `Cell level: ${level}. MITRE’s general guideline for this cell: ${level === 'Low' ? 'watch or assume' : 'avoid, control or transfer'} (R61 p.642).` : 'Rate both scales to see the cell level.'}
              </p>
              <label className="flex flex-col gap-1">
                Handling option
                <select className={input} value={entry.handling ?? ''} onChange={(e) => set({ handling: (e.target.value || undefined) as Handling | undefined })}>
                  <option value="">Choose…</option>
                  {HANDLING.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                Trigger / watch item
                <input className={input} value={entry.trigger} onChange={(e) => set({ trigger: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                Treatment (actions; or, if accepted, why and who approved)
                <textarea className={input} rows={2} value={entry.treatment} onChange={(e) => set({ treatment: e.target.value })} />
              </label>
            </>
          ) : (
            <>
              <label className="flex flex-col gap-1 sm:col-span-2">
                {entry.kind === 'A' ? 'Validation (how and when it will be confirmed)' : entry.kind === 'U' ? 'Resolution (how it will be resolved)' : 'Action (how the opportunity would be captured)'}
                <input className={input} value={entry.action} onChange={(e) => set({ action: e.target.value })} />
              </label>
              {entry.kind === 'U' && (
                <label className="flex flex-col gap-1">
                  Need-by date or event
                  <input className={input} value={entry.needBy} onChange={(e) => set({ needBy: e.target.value })} />
                </label>
              )}
            </>
          )}
          <div className="sm:col-span-2">
            <ProvenanceOwnerFields value={po} onChange={setPo} />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <Button onClick={save}>{editing ? 'Save changes' : 'Record entry'}</Button>
            {editing && (
              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(null)
                  setEntry(blank)
                  setMessage('')
                }}
              >
                Cancel edit
              </Button>
            )}
            <span role="status" data-testid="w06-register-message">
              {message}
            </span>
          </div>
          {issues.errors.length > 0 && (
            <ul role="alert" className="list-disc pl-5 text-rose-700 sm:col-span-2 dark:text-rose-300">
              {issues.errors.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
          {issues.warnings.length > 0 && (
            <ul className="list-disc pl-5 sm:col-span-2" data-testid="w06-register-warnings">
              {issues.warnings.map((i) => (
                <li key={i}>Advice: {i}</li>
              ))}
            </ul>
          )}
        </fieldset>
      )}
      {source === 'mine' && arou.length > 0 && <p className="text-xs">Select an ID in the matrix or in the list above to edit that entry.</p>}
      {source === 'mine' && <IssueLog targets={targets.map((t) => ({ id: t.id, name: t.name }))} />}
    </div>
  )
}
