import { useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ownerProblem, ProvenanceOwnerFields, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Button, CitationText } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { useWorkspace } from '../../state/Workspace'
import { blankMgo, checkMgo, concernsOf, mgoAttributes, type MgoDraft, type MgoLevel } from './mgo'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

export function MgoRecorder() {
  const { model, apply } = useWorkspace()
  const [d, setD] = usePersistentState<MgoDraft>('w03-mgo-draft', blankMgo)
  const [po, setPo] = usePersistentState<ProvenanceOwner>('w03-mgo-po', DEFAULT_PROVENANCE_OWNER)
  const [message, setMessage] = useState('')
  const mgos = model.elements.filter((e) => e.kind === 'MGO' && e.status === 'active')
  const concerns = model.elements.filter((e) => (e.kind === 'CON' || e.kind === 'STK') && e.status === 'active')
  const levelOf = (id: string) => mgos.find((m) => m.id === id)?.attributes?.level as MgoLevel | undefined
  const findings = checkMgo(d, levelOf(d.parent), d.parent ? concernsOf(model, d.parent) : [])
  const ownerIssue = ownerProblem(po.owner)
  const ok = findings.every((f) => f.ok)
  const wantParent = d.level === 'goal' ? 'mission' : d.level === 'objective' ? 'goal' : undefined

  const record = () => {
    if (!ok) {
      setMessage('Not recorded: fix the items marked “Fix” first.')
      return
    }
    if (ownerIssue) {
      setMessage(`Not recorded: ${ownerIssue}`)
      return
    }
    const r = apply({
      elements: [{ key: 'mgo', kind: 'MGO', name: d.name.trim(), text: d.text.trim(), attributes: mgoAttributes(d), owner: po.owner.trim().toUpperCase(), provenance: po.provenance }],
      links: [
        ...(d.parent && wantParent ? [{ source: 'mgo', type: 'derives-from' as const, target: d.parent, rationale: `Elaborated from ${d.parent}` }] : []),
        ...d.concerns.map((c) => ({ source: 'mgo', type: 'derives-from' as const, target: c, rationale: 'Answers this concern (Lab L3)' })),
      ],
    })
    setMessage(r.error ? `Not recorded: ${r.error}` : `${r.ids.mgo} recorded with ${r.linkIds.length} link(s).`)
    if (!r.error) setD({ ...blankMgo(), level: d.level, parent: d.parent })
  }

  return (
    <div className="space-y-3 text-sm" data-testid="w03-mgo-recorder">
      <p>
        SEBoK has four levels: the mission, goals elaborated from it, objectives elaborated from the goals, and measures (MOE) that validate the objectives (<CitationText c={{ reading: 'R10', pages: '543–546' }} />). Its example objectives are qualitative and the number sits in the measure. <strong>Course convention (RB-2.1):</strong> record each objective together with its measure, a numeric target, a unit and a horizon; the mission, and each objective directly or through its goal, trace to the concerns they answer.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          Level
          <select className={input} value={d.level} onChange={(e) => setD({ ...d, level: e.target.value as MgoLevel | '', parent: '' })}>
            <option value="">Choose…</option>
            <option value="mission">Mission</option>
            <option value="goal">Goal</option>
            <option value="objective">Objective</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          MGO name
          <input className={input} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
        </label>
        {wantParent && (
          <label className="flex flex-col gap-1">
            Elaborated from ({wantParent})
            <select className={input} value={d.parent} onChange={(e) => setD({ ...d, parent: e.target.value })}>
              <option value="">Choose…</option>
              {mgos
                .filter((m) => m.attributes?.level === wantParent)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} {m.name}
                  </option>
                ))}
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1 sm:col-span-3">
          MGO statement
          <textarea className={input} rows={2} value={d.text} onChange={(e) => setD({ ...d, text: e.target.value })} />
        </label>
        {d.level === 'objective' && (
          <>
            <label className="flex flex-col gap-1">
              Measure (MOE)
              <input className={input} value={d.measure} placeholder="e.g. 90th-percentile wait" onChange={(e) => setD({ ...d, measure: e.target.value })} />
            </label>
            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1">
                Target
                <input className={input} type="number" value={d.target} onChange={(e) => setD({ ...d, target: e.target.value })} />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                Unit
                <input className={input} value={d.unit} onChange={(e) => setD({ ...d, unit: e.target.value })} />
              </label>
            </div>
            <label className="flex flex-col gap-1">
              Horizon
              <input className={input} value={d.horizon} placeholder="e.g. each month from month 6" onChange={(e) => setD({ ...d, horizon: e.target.value })} />
            </label>
          </>
        )}
      </div>
      {!!d.level && (
        <fieldset>
          <legend className="font-medium">Answers concerns{d.level === 'objective' ? ' (optional if its goal already traces to one)' : ''}</legend>
          <div className="mt-1 grid max-h-40 gap-1 overflow-y-auto sm:grid-cols-2">
            {concerns.map((c) => (
              <label key={c.id} className="inline-flex items-start gap-1">
                <input type="checkbox" checked={d.concerns.includes(c.id)} onChange={() => setD({ ...d, concerns: d.concerns.includes(c.id) ? d.concerns.filter((x) => x !== c.id) : [...d.concerns, c.id] })} />
                <span>
                  {c.id} {c.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <ul className="space-y-0.5" data-testid="w03-mgo-checks">
        {findings.map((f) => (
          <li key={f.id}>
            <strong>{f.ok ? '✓ Pass' : '✗ Fix'}</strong> — {f.message} {f.cite && <CitationText c={f.cite} />}
          </li>
        ))}
      </ul>
      <ProvenanceOwnerFields value={po} onChange={setPo} />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={record}>Record MGO</Button>
        <span role="status" data-testid="w03-mgo-message">
          {message}
        </span>
      </div>
      <p data-testid="w03-mgo-coverage">
        Workspace: {mgos.filter((m) => m.attributes?.level === 'mission').length} mission, {mgos.filter((m) => m.attributes?.level === 'goal').length} goal(s), {mgos.filter((m) => m.attributes?.level === 'objective').length} objective(s).
      </p>
      {mgos.length > 0 && (
        <table className="w-full text-left text-xs">
          <caption className="text-left font-medium">MGOs in your workspace</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1 pr-2">ID</th>
              <th className="py-1 pr-2">Level</th>
              <th className="py-1 pr-2">Name</th>
              <th className="py-1 pr-2">Measure and target</th>
              <th className="py-1">Owner / provenance</th>
            </tr>
          </thead>
          <tbody>
            {mgos.map((m) => (
              <tr key={m.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                <td className="py-0.5 pr-2">{m.id}</td>
                <td className="py-0.5 pr-2">{String(m.attributes?.level ?? '—')}</td>
                <td className="py-0.5 pr-2">{m.name}</td>
                <td className="py-0.5 pr-2">{m.attributes?.measure ? `${m.attributes.measure}: ${m.attributes.target} ${m.attributes.unit ?? ''}` : '—'}</td>
                <td className="py-0.5">
                  {m.owner ?? '—'} / {m.provenance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
