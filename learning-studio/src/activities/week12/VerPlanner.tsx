import { useMemo, useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ProvenanceOwnerFields, ownerProblem, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Button } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { referenceUpTo } from '../../model/reference'
import { useWorkspace } from '../../state/Workspace'
import { LEVELS, METHODS, activeRequirements, blankPlan, checkPlan, planBatch, planFromElement, satisfiersOf, type Method, type VerPlan } from './planner'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const TEXT_FIELDS: { key: keyof VerPlan; label: string; hint: string; area?: boolean }[] = [
  { key: 'objective', label: 'Objective (what the activity must show)', hint: 'e.g. Show that a hub charger restores an aircraft from the 20 % reserve to the dispatch threshold within 20 min.', area: true },
  { key: 'subject', label: 'Subject (element under verification, by ID)', hint: 'e.g. PHY-003 with PHY-001 (IF-005)' },
  { key: 'environment', label: 'Environment and conditions', hint: 'e.g. Hub vertiport, ambient 0-35 C' },
  { key: 'successCriterion', label: 'Success criterion (expected result)', hint: 'Quantity, comparison, limit and sample: e.g. all 30 charges <= 20.0 min', area: true },
  { key: 'pass', label: 'Verdict: pass when', hint: 'e.g. all 30 charges <= 20.0 min' },
  { key: 'fail', label: 'Verdict: fail when', hint: 'e.g. any charge > 20.0 min' },
  { key: 'inconclusive', label: 'Verdict: inconclusive when', hint: 'e.g. fewer than 30 valid charges' },
]
const mark = (s: 'error' | 'warning' | 'ok') => (s === 'ok' ? '✓' : s === 'error' ? '✗' : '?')
const word = (s: 'error' | 'warning' | 'ok') => (s === 'ok' ? 'OK' : s === 'error' ? 'Problem' : 'Check')

export function VerPlanner() {
  const { model, apply } = useWorkspace()
  const [who, setWho] = usePersistentState<ProvenanceOwner>('w12-ver-owner', DEFAULT_PROVENANCE_OWNER)
  const [practice, setPractice] = useState(false)
  const source = useMemo(() => (practice ? referenceUpTo(12) : model), [practice, model])
  const reqs = activeRequirements(source)
  const [plan, setPlan] = usePersistentState<VerPlan>('w12-ver-draft', blankPlan())
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [showRef, setShowRef] = useState(false)
  const req = reqs.find((r) => r.id === plan.target)
  const checks = checkPlan(plan, req, { satisfiers: req ? satisfiersOf(source, req.id) : [] })
  const errors = checks.filter((c) => c.severity === 'error')
  const ownerMsg = ownerProblem(who.owner)
  const nameOk = name.trim().split(/\s+/).filter(Boolean).length >= 2
  const canSave = !practice && errors.length === 0 && !ownerMsg && nameOk
  const mine = model.elements.filter((e) => e.kind === 'VER' && e.status === 'active')
  const refVers = referenceUpTo(12).elements.filter((e) => e.kind === 'VER' && e.attributes?.verifies === plan.target)

  const save = () => {
    const r = apply(planBatch(plan, name, who))
    if (r.error) { setStatus(`Not saved: ${r.error}`); return }
    setStatus(`Saved ${r.ids.ver} verifies ${plan.target} (${who.owner.trim().toUpperCase()}, ${who.provenance}).`)
    setPlan(blankPlan())
    setName('')
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w12-ver-planner">
      <p>Plan a verification activity for one requirement. Each field is checked against an explicit, cited criterion; ✗ blocks saving, ? asks you to justify. The checks catch common defects, not every bad plan.</p>
      <ProvenanceOwnerFields value={who} onChange={setWho} />
      <label className="flex items-center gap-2"><input type="checkbox" checked={practice} onChange={(e) => { setPractice(e.target.checked); setPlan(blankPlan()) }} /> Practice on the instructor reference requirements (read-only: nothing is saved)</label>
      {reqs.length === 0 && <p role="status">Your workspace has no requirements yet. Tick the practice box, or load your model in the workspace.</p>}

      <fieldset className="space-y-2 rounded border border-slate-200 p-2 dark:border-slate-800">
        <legend className="px-1 font-medium">New verification activity</legend>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col">Verifies (requirement)
            <select className={input} value={plan.target} onChange={(e) => setPlan({ ...plan, target: e.target.value })}>
              <option value="">— choose —</option>
              {reqs.map((r) => <option key={r.id} value={r.id}>{r.id} {r.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col">Method
            <select className={input} value={plan.method} onChange={(e) => setPlan({ ...plan, method: e.target.value as Method })}>
              <option value="">— choose —</option>
              {METHODS.map((m) => <option key={m.id} value={m.id}>{m.label} ({m.sysml})</option>)}
            </select>
          </label>
          <label className="flex flex-col">Level
            <select className={input} value={plan.level} onChange={(e) => setPlan({ ...plan, level: e.target.value as VerPlan['level'] })}>
              <option value="">— choose —</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label className="flex flex-col">Name<input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Turnaround charge-time test" /></label>
        </div>
        {req && <p className="text-xs" data-testid="w12-ver-req"><strong>{req.id}</strong>: {req.text} <em>Recorded method: {String(req.attributes?.method ?? '—')}; criterion: {String(req.attributes?.criterion ?? '—')}</em></p>}
        {TEXT_FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col">
            {f.label}
            {f.area
              ? <textarea className={input} rows={2} value={plan[f.key]} placeholder={f.hint} onChange={(e) => setPlan({ ...plan, [f.key]: e.target.value })} />
              : <input className={input} value={plan[f.key]} placeholder={f.hint} onChange={(e) => setPlan({ ...plan, [f.key]: e.target.value })} />}
          </label>
        ))}
        <p className="text-xs">Error verdict (course reading of S06 p.173): the procedure or instrumentation was not executed as planned — added automatically.</p>
        <ul className="space-y-0.5 text-xs" data-testid="w12-ver-checks" aria-live="polite">
          {checks.map((c, i) => (
            <li key={i}><span aria-hidden="true" className="mr-1 font-bold">{mark(c.severity)}</span><span className="sr-only">{word(c.severity)}: </span><strong>{c.field}</strong>: {c.message}</li>
          ))}
          {ownerMsg && <li><span aria-hidden="true" className="mr-1 font-bold">✗</span><strong>owner</strong>: {ownerMsg}</li>}
          {!nameOk && <li><span aria-hidden="true" className="mr-1 font-bold">✗</span><strong>name</strong>: Give the activity a short name (two words or more).</li>}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!canSave} onClick={save}>Save to workspace</Button>
          <Button variant="secondary" disabled={!plan.target || refVers.length === 0} onClick={() => setShowRef(true)}>Compare with the reference VER</Button>
        </div>
        {practice && <p className="text-xs">Practice mode: saving is off.</p>}
        {status && <p role="status" data-testid="w12-ver-status">{status}</p>}
        {showRef && refVers.map((v) => {
          const r = planFromElement(v)
          return (
            <dl key={v.id} className="grid grid-cols-[auto_1fr] gap-x-2 text-xs" data-testid="w12-ver-ref">
              <dt className="font-medium">{v.id}</dt><dd>{v.name} — {r.method}, {r.level}</dd>
              <dt>Objective</dt><dd>{r.objective}</dd><dt>Subject</dt><dd>{r.subject}</dd><dt>Environment</dt><dd>{r.environment}</dd>
              <dt>Criterion</dt><dd>{r.successCriterion}</dd><dt>Verdict</dt><dd>pass: {r.pass}; fail: {r.fail}; inconclusive: {r.inconclusive}</dd>
            </dl>
          )
        })}
      </fieldset>

      <section>
        <h4 className="font-medium">Verification activities in my workspace ({mine.length})</h4>
        <ul className="ml-5 list-disc" data-testid="w12-ver-list">
          {mine.map((v) => <li key={v.id}><strong>{v.id}</strong> {v.name} — {String(v.attributes?.method ?? '')}, verifies {String(v.attributes?.verifies ?? '')} ({v.owner ?? '—'}, {v.provenance})</li>)}
        </ul>
      </section>
    </div>
  )
}
