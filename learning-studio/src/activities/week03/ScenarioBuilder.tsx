import { useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ownerProblem, ProvenanceOwnerFields, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Button, CitationText } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { nextId } from '../../model/engineering'
import { useWorkspace } from '../../state/Workspace'
import {
  OFFICIAL_SCENARIOS,
  SCENARIO_KINDS,
  SYSTEM_ACTOR,
  WORKED_SCN005,
  checkScenario,
  emptyScenario,
  looksEnvironmental,
  performersOf,
  scenarioCoverage,
  toScenarioAttributes,
  type AltFlow,
  type ScenarioDraft,
  type ScenarioKind,
} from './scenarios'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'

export function ScenarioBuilder() {
  const { model, apply } = useWorkspace()
  const [d, setD] = usePersistentState<ScenarioDraft>('w03-scenario-draft', emptyScenario)
  const [po, setPo] = usePersistentState<ProvenanceOwner>('w03-scenario-po', DEFAULT_PROVENANCE_OWNER)
  const [message, setMessage] = useState('')
  const [attempted, setAttempted] = useState(false)
  const modelActors = model.elements.filter((e) => (e.kind === 'STK' || e.kind === 'EXT') && e.status === 'active')
  const caps = model.elements.filter((e) => e.kind === 'CAP' && e.status === 'active')
  const scns = model.elements.filter((e) => e.kind === 'SCN' && e.status === 'active')
  const performers = performersOf(d)
  const env = d.environment ?? []
  const findings = checkScenario(d)
  const ok = findings.every((f) => f.ok)
  const cov = scenarioCoverage(model)
  const nextScn = nextId('SCN', model)
  const label = (a: string) => {
    const e = model.elements.find((x) => x.id === a)
    return e ? `${a} ${e.name}` : a
  }
  const setStep = (i: number, patch: Partial<ScenarioDraft['steps'][number]>) => setD({ ...d, steps: d.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) })
  const setAlt = (i: number, patch: Partial<AltFlow>) => setD({ ...d, alternates: d.alternates.map((a, j) => (j === i ? { ...a, ...patch } : a)) })
  const toggleIn = (key: 'actorIds' | 'capabilities', id: string) => setD({ ...d, [key]: d[key].includes(id) ? d[key].filter((x) => x !== id) : [...d[key], id] })
  const toggleActor = (id: string) => {
    const on = !d.actorIds.includes(id)
    const e = model.elements.find((x) => x.id === id)
    const suggestEnv = on && !!e && e.kind === 'EXT' && looksEnvironmental(e.name, e.text)
    setD({ ...d, actorIds: on ? [...d.actorIds, id] : d.actorIds.filter((x) => x !== id), environment: on ? (suggestEnv ? [...env, id] : env) : env.filter((x) => x !== id) })
  }
  const toggleEnv = (id: string) => setD({ ...d, environment: env.includes(id) ? env.filter((x) => x !== id) : [...env, id] })
  const ownerIssue = ownerProblem(po.owner)

  const record = () => {
    setAttempted(true)
    if (!ok) {
      setMessage('Not recorded: complete the items marked “Fix” first.')
      return
    }
    if (ownerIssue) {
      setMessage(`Not recorded: ${ownerIssue}`)
      return
    }
    const inModel = new Set(model.elements.map((e) => e.id))
    const missing = d.capabilities.filter((c) => !inModel.has(c))
    if (missing.length) {
      setMessage(`Not recorded: ${missing.join(', ')} is not in your workspace. Record it in the capability builder (or load the reference baseline) first.`)
      return
    }
    const r = apply({
      elements: [{ key: 'scn', kind: 'SCN', name: d.name.trim(), text: `${d.trigger.trim()} ${d.successEnd.trim()}`, attributes: toScenarioAttributes(d), owner: po.owner.trim().toUpperCase(), provenance: po.provenance }],
      links: [
        ...d.capabilities.map((c) => ({ source: 'scn', type: 'derives-from' as const, target: c, rationale: 'Scenario exercises this capability (Lab L3)' })),
        ...d.actorIds
          .filter((a) => inModel.has(a))
          .map((a) =>
            env.includes(a)
              ? { source: a, type: 'affects' as const, target: 'scn', rationale: 'Environmental factor: affects the scenario, does not act in it' }
              : { source: a, type: 'performs' as const, target: 'scn', rationale: a === d.primaryActor ? 'Primary actor' : 'Participating actor' },
          ),
      ],
    })
    if (r.error) {
      setMessage(`Not recorded: ${r.error}`)
      return
    }
    setMessage(`${r.ids.scn} recorded with ${r.linkIds.length} link(s).`)
    setD(emptyScenario())
    setAttempted(false)
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w03-scenario-builder">
      <p>
        Build one operational scenario at a time: actors, trigger, preconditions, a main flow of simple steps, alternate flows that branch from a named step, and both end states. The checks implement the L3 acceptance criteria and MITRE’s use-case guidance (<CitationText c={{ reading: 'R59', pages: '453–455' }} />).
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          Official S04 Lab 7 scenario
          <select
            className={input}
            value={d.official}
            onChange={(e) => {
              const o = OFFICIAL_SCENARIOS.find((x) => x.id === e.target.value)
              setD({ ...d, official: e.target.value, name: o ? o.name : d.name, kind: o ? o.kind : d.kind })
            }}
          >
            <option value="">None / team scenario</option>
            {OFFICIAL_SCENARIOS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} {o.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Scenario name
          <input className={input} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          Type
          <select className={input} value={d.kind} onChange={(e) => setD({ ...d, kind: e.target.value as ScenarioKind | '' })}>
            <option value="">Choose…</option>
            {SCENARIO_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {d.official && d.official !== nextScn && (
        <p data-testid="w03-scn-id-note">
          Note: IDs are issued in order, so this scenario will be recorded as {nextScn}, not {d.official}. The official ID is kept as an attribute; to keep the S04 numbering, record the official scenarios in order.
        </p>
      )}
      <fieldset>
        <legend className="font-medium">Actors</legend>
        <div className="mt-1 grid max-h-40 gap-1 overflow-y-auto sm:grid-cols-3">
          {modelActors.map((a) => (
            <div key={a.id} className="flex flex-col">
              <label className="inline-flex items-start gap-1">
                <input type="checkbox" checked={d.actorIds.includes(a.id)} onChange={() => toggleActor(a.id)} />
                <span>
                  {a.id} {a.name}
                </span>
              </label>
              {d.actorIds.includes(a.id) && (
                <label className="ml-5 inline-flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={env.includes(a.id)} onChange={() => toggleEnv(a.id)} aria-label={`${a.id} is an environmental factor`} />
                  environmental factor (affects, does not act)
                </label>
              )}
            </div>
          ))}
        </div>
        <label className="mt-2 flex flex-col gap-1">
          Other actors and roles (comma-separated)
          <input className={input} value={d.otherActors} onChange={(e) => setD({ ...d, otherActors: e.target.value })} />
        </label>
        <label className="mt-2 flex flex-col gap-1">
          Primary actor (whose goal the scenario serves)
          <select className={input} value={d.primaryActor} onChange={(e) => setD({ ...d, primaryActor: e.target.value })}>
            <option value="">Choose…</option>
            {performers.map((a) => (
              <option key={a} value={a}>
                {label(a)}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          System of interest for scenarios: AeroLink’s operational system (aircraft, booking, scheduling and dispatch systems, operations-support tools). People, including operations-centre staff, are users outside it and can be actors; a natural factor such as weather affects the scenario but does not act in it.
        </p>
      </fieldset>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          Trigger event
          <textarea className={input} rows={2} value={d.trigger} onChange={(e) => setD({ ...d, trigger: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          Preconditions
          <textarea className={input} rows={2} value={d.preconditions} onChange={(e) => setD({ ...d, preconditions: e.target.value })} />
        </label>
      </div>
      <fieldset>
        <legend className="font-medium">Main flow</legend>
        <ol className="mt-1 space-y-1">
          {d.steps.map((s, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              <span className="w-6">{i + 1}.</span>
              <select className={input} aria-label={`Step ${i + 1} actor`} value={s.actor} onChange={(e) => setStep(i, { actor: e.target.value })}>
                <option value="">Actor…</option>
                <option value={SYSTEM_ACTOR}>{SYSTEM_ACTOR}</option>
                {performers.map((a) => (
                  <option key={a} value={a}>
                    {label(a)}
                  </option>
                ))}
              </select>
              <input className={`${input} min-w-[16rem] flex-1`} aria-label={`Step ${i + 1} action`} value={s.action} onChange={(e) => setStep(i, { action: e.target.value })} />
              <Button variant="ghost" ariaLabel={`Remove step ${i + 1}`} onClick={() => setD({ ...d, steps: d.steps.filter((_, j) => j !== i) })}>
                Remove
              </Button>
            </li>
          ))}
        </ol>
        <Button variant="secondary" onClick={() => setD({ ...d, steps: [...d.steps, { actor: '', action: '' }] })}>Add step</Button>
      </fieldset>
      <fieldset>
        <legend className="font-medium">Alternate and exception flows</legend>
        <ul className="mt-1 space-y-2">
          {d.alternates.map((a, i) => (
            <li key={i} className="grid gap-1 rounded border border-slate-200 p-2 sm:grid-cols-4 dark:border-slate-800">
              <label className="flex flex-col gap-1">
                A{i + 1} branches at step
                <input className={input} type="number" min={1} value={a.atStep} onChange={(e) => setAlt(i, { atStep: Number(e.target.value) })} />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-3">
                A{i + 1} condition
                <input className={input} value={a.condition} onChange={(e) => setAlt(i, { condition: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-2">
                A{i + 1} steps
                <textarea className={input} rows={2} value={a.steps} onChange={(e) => setAlt(i, { steps: e.target.value })} />
              </label>
              <label className="flex flex-col gap-1">
                A{i + 1} outcome
                <select className={input} value={a.outcome} onChange={(e) => setAlt(i, { outcome: e.target.value as AltFlow['outcome'] })}>
                  <option value="rejoin">Rejoins the main flow</option>
                  <option value="end">Ends the scenario</option>
                </select>
              </label>
              {a.outcome === 'rejoin' && (
                <label className="flex flex-col gap-1">
                  A{i + 1} rejoins at step
                  <input className={input} type="number" min={1} value={a.rejoinAt ?? ''} onChange={(e) => setAlt(i, { rejoinAt: Number(e.target.value) })} />
                </label>
              )}
              <div className="sm:col-span-4">
                <Button variant="ghost" ariaLabel={`Remove alternate flow A${i + 1}`} onClick={() => setD({ ...d, alternates: d.alternates.filter((_, j) => j !== i) })}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <Button variant="secondary" onClick={() => setD({ ...d, alternates: [...d.alternates, { atStep: 1, condition: '', steps: '', outcome: 'rejoin', rejoinAt: 1 }] })}>Add alternate flow</Button>
      </fieldset>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          Success end state
          <textarea className={input} rows={2} value={d.successEnd} onChange={(e) => setD({ ...d, successEnd: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          Failure or degraded end state
          <textarea className={input} rows={2} value={d.failureEnd} onChange={(e) => setD({ ...d, failureEnd: e.target.value })} />
        </label>
      </div>
      <fieldset>
        <legend className="font-medium">Capabilities exercised</legend>
        <div className="mt-1 grid max-h-40 gap-1 overflow-y-auto sm:grid-cols-3">
          {caps.map((c) => (
            <label key={c.id} className="inline-flex items-start gap-1">
              <input type="checkbox" checked={d.capabilities.includes(c.id)} onChange={() => toggleIn('capabilities', c.id)} />
              <span>
                {c.id} {c.name}
              </span>
            </label>
          ))}
          {caps.length === 0 && <p>No capabilities yet: record them in the capability builder.</p>}
        </div>
      </fieldset>
      <ul className="space-y-0.5" aria-label="Scenario checks" data-testid="w03-scn-checks">
        {findings.map((f) => (
          <li key={f.id}>
            <strong>{f.ok ? '✓ Pass' : '✗ Fix'}</strong> — {f.message} {f.cite && <CitationText c={f.cite} />}
          </li>
        ))}
      </ul>
      <ProvenanceOwnerFields value={po} onChange={setPo} />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={record}>Record scenario</Button>
        <Button variant="secondary" onClick={() => setD(WORKED_SCN005)}>Load the SCN-005 worked example</Button>
        <Button variant="ghost" onClick={() => setD(emptyScenario())}>Clear</Button>
        <span role="status" data-testid="w03-scn-message">
          {message}
        </span>
      </div>
      {attempted && !ok && <p role="alert" className="text-rose-700 dark:text-rose-300">{findings.filter((f) => !f.ok).length} check(s) still to fix.</p>}
      <p data-testid="w03-scn-coverage">
        L3 scenario coverage: {cov.count} scenario(s); nominal {cov.nominal ? 'yes' : 'no'}; weather disruption {cov.weather ? 'yes' : 'no'}; charging or maintenance {cov.chargingOrMaintenance ? 'yes' : 'no'}
        {cov.incomplete.length ? `; incomplete: ${cov.incomplete.join(', ')}` : ''}.
      </p>
      {scns.length > 0 && (
        <table className="w-full text-left text-xs">
          <caption className="text-left font-medium">Scenarios in your workspace</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1 pr-2">ID</th>
              <th className="py-1 pr-2">Name</th>
              <th className="py-1">Owner / provenance</th>
            </tr>
          </thead>
          <tbody>
            {scns.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-0.5 pr-2">{s.id}</td>
                <td className="py-0.5 pr-2">{s.name}</td>
                <td className="py-0.5">
                  {s.owner ?? '—'} / {s.provenance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
