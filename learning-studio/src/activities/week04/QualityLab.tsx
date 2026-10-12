import { useMemo, useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ownerProblem, ProvenanceOwnerFields, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { Badge, Button, CitationText } from '../../components/ui'
import { usePersistentState } from '../../lib/usePersistentState'
import { useWorkspace } from '../../state/Workspace'
import { FLAWED, draftFromFlawed } from './critique'
import { EMPTY_DRAFT, METHODS, REQ_TYPES, buildBatch, checkRequirement, hasTbx, summarise, type CheckStatus, type Draft, type Level, type Method, type ReqType } from './quality'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
const STATUS: Record<CheckStatus, { label: string; tone: 'emerald' | 'rose' | 'amber' | 'slate'; mark: string }> = {
  pass: { label: 'Pass', tone: 'emerald', mark: '✓' },
  fail: { label: 'Fail', tone: 'rose', mark: '✗' },
  advisory: { label: 'Review', tone: 'amber', mark: '!' },
  na: { label: 'Not applicable', tone: 'slate', mark: '–' },
}

export function QualityLab() {
  const { model, apply } = useWorkspace()
  const [d, setD] = usePersistentState<Draft>('w04-quality-draft', EMPTY_DRAFT)
  const [po, setPo] = usePersistentState<ProvenanceOwner>('w04-quality-po', DEFAULT_PROVENANCE_OWNER)
  const [message, setMessage] = useState('')
  const [example, setExample] = useState('')
  const set = (patch: Partial<Draft>) => {
    setD((p) => ({ ...p, ...patch }))
    setMessage('')
  }

  const live = model.elements.filter((e) => e.status === 'active')
  const parentCandidates = live.filter((e) => ['NEED', 'CAP', 'MGO', 'REQ'].includes(e.kind))
  const arouCandidates = live.filter((e) => e.kind === 'U' || e.kind === 'A')
  const arouTbd = useMemo(
    () => Object.fromEntries(d.arou.map((id) => { const v = model.elements.find((e) => e.id === id)?.attributes?.tbd; return [id, typeof v === 'string' ? v : undefined] })),
    [d.arou, model.elements],
  )
  const results = useMemo(() => checkRequirement({ ...d, arouTbd }), [d, arouTbd])
  const sum = summarise(results)
  const tbx = hasTbx(d.text)
  const nu = { name: '', text: '', owner: '', resolution: '', needBy: '', ...d.newUnknown }
  const teamReqs = live.filter((e) => e.kind === 'REQ' && e.provenance !== 'instructor-fictional' && e.provenance !== 'instructor-reference')

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

  const record = () => {
    if (!sum.recordable) {
      setMessage(`Not recorded: ${sum.fail} check(s) fail. Fix them first; review the advisories before your team accepts the requirement.`)
      return
    }
    const ownerIssue = ownerProblem(po.owner)
    if (ownerIssue) {
      setMessage(`Not recorded: ${ownerIssue}`)
      return
    }
    const res = apply(buildBatch(d, po))
    if (res.error) {
      setMessage(`Not recorded: ${res.error}`)
      return
    }
    const extra = res.ids.u ? ` and ${res.ids.u} (tracks ${d.text.match(/\bTB[DR](?:-\d+)?\b/)?.[0]})` : ''
    setMessage(`${res.ids.req} recorded${extra}, with ${res.linkIds.length} link(s). It now appears in the trace checker and the model workspace. Passing the checks is necessary, not sufficient: the team still reviews it.`)
    setD({ ...EMPTY_DRAFT, level: d.level, parents: d.parents })
  }

  return (
    <div className="space-y-4 text-sm" data-testid="w04-quality-lab">
      <p className="rounded border border-amber-300 bg-amber-50 p-2 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
        <strong>Heuristics, not a review.</strong> These checks look for words, values and attributes. They cannot tell whether a requirement is necessary, feasible, correct or consistent with the rest of the set; that is requirement verification and validation by people (R13 p.566). A requirement that passes every check can still be wrong.
      </p>

      <div>
        <label htmlFor="w04-example" className="mr-2 font-medium">
          Start from a flawed example
        </label>
        <select id="w04-example" className={input} value={example} onChange={(e) => setExample(e.target.value)}>
          <option value="">Choose…</option>
          {FLAWED.map((f) => (
            <option key={f.id} value={f.id}>
              {f.id}: {f.flawed}
            </option>
          ))}
        </select>{' '}
        <Button variant="secondary" disabled={!example} onClick={() => { const f = FLAWED.find((x) => x.id === example); if (f) set(draftFromFlawed(f)) }}>
          Load into editor
        </Button>
      </div>

      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="mb-1 font-semibold">Your requirement</legend>
        <label className="flex flex-col gap-1">
          Level
          <select className={input} value={d.level} onChange={(e) => set({ level: e.target.value as Level })}>
            <option value="STK">Stakeholder requirement (REQ-STK)</option>
            <option value="SYS">System requirement (REQ-SYS)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Short name
          <input className={input} value={d.name} onChange={(e) => set({ name: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          Requirement statement
          <textarea className={input} rows={3} value={d.text} onChange={(e) => set({ text: e.target.value })} placeholder="The <entity> shall <do or be something> <measurable criterion> <condition>." />
        </label>
        <label className="flex flex-col gap-1">
          Type
          <select className={input} value={d.type ?? ''} onChange={(e) => set({ type: (e.target.value || undefined) as ReqType | undefined })}>
            <option value="">Choose…</option>
            {REQ_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Verification method
          <select className={input} value={d.method ?? ''} onChange={(e) => set({ method: (e.target.value || undefined) as Method | undefined })}>
            <option value="">Choose…</option>
            {METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          Verification success criterion
          <input className={input} value={d.criterion ?? ''} onChange={(e) => set({ criterion: e.target.value })} placeholder="The observable pass condition, e.g. “≤ 20 min in every trial from 20 % state of charge”" />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-2">
          Rationale
          <textarea className={input} rows={2} value={d.rationale} onChange={(e) => set({ rationale: e.target.value })} placeholder="Why it is needed, the assumption behind it, and where the number comes from." />
        </label>
      </fieldset>

      <fieldset>
        <legend className="font-semibold">Parent(s): what motivates it ({parentCandidates.length} candidates in your workspace)</legend>
        {parentCandidates.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">
            No needs, capabilities or requirements in your workspace yet. Record your Week 3 NEED and CAP items first, or load the instructor reference in the model workspace (it replaces your model).
          </p>
        ) : (
          <div className="mt-1 max-h-48 overflow-y-auto rounded border border-slate-200 p-2 dark:border-slate-800">
            {parentCandidates.map((p) => (
              <label key={p.id} className="flex items-start gap-2 py-0.5">
                <input type="checkbox" checked={d.parents.includes(p.id)} onChange={() => set({ parents: toggle(d.parents, p.id) })} />
                <span>
                  <span className="font-medium">{p.id}</span> {p.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {tbx && (
        <fieldset className="rounded border border-slate-200 p-2 dark:border-slate-800">
          <legend className="font-semibold">TBD/TBR: which AROU item tracks it?</legend>
          {arouCandidates.map((a) => (
            <label key={a.id} className="flex items-start gap-2 py-0.5">
              <input type="checkbox" checked={d.arou.includes(a.id)} onChange={() => set({ arou: toggle(d.arou, a.id) })} />
              <span>
                <span className="font-medium">{a.id}</span> {a.name}
              </span>
            </label>
          ))}
          {d.arou.length === 0 && (
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <p className="sm:col-span-3">Or create a new Unknown with the requirement:</p>
              <label className="flex flex-col gap-1">
                Unknown name
                <input className={input} value={nu.name} onChange={(e) => set({ newUnknown: { ...nu, name: e.target.value } })} />
              </label>
              <label className="flex flex-col gap-1">
                Unknown owner (role)
                <input className={input} value={nu.owner} onChange={(e) => set({ newUnknown: { ...nu, owner: e.target.value } })} />
              </label>
              <label className="flex flex-col gap-1">
                Need-by date or milestone
                <input className={input} value={nu.needBy} placeholder="e.g. before the Week 7 trade study" onChange={(e) => set({ newUnknown: { ...nu, needBy: e.target.value } })} />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-3">
                What is unknown
                <input className={input} value={nu.text} onChange={(e) => set({ newUnknown: { ...nu, text: e.target.value } })} />
              </label>
              <label className="flex flex-col gap-1 sm:col-span-3">
                Resolution work (how it will be closed)
                <input className={input} value={nu.resolution} onChange={(e) => set({ newUnknown: { ...nu, resolution: e.target.value } })} />
              </label>
            </div>
          )}
        </fieldset>
      )}

      <section aria-labelledby="w04-checks-h">
        <h4 id="w04-checks-h" className="font-semibold">
          Heuristic checks: {sum.pass} pass, {sum.fail} fail, {sum.advisory} to review
        </h4>
        <ul className="mt-1 space-y-1" data-testid="w04-checks">
          {results.map((r) => (
            <li key={r.id} className="rounded border border-slate-100 p-1.5 dark:border-slate-800" data-check={r.id} data-status={r.status}>
              <Badge tone={STATUS[r.status].tone}>
                <span aria-hidden="true">{STATUS[r.status].mark}&nbsp;</span>
                {STATUS[r.status].label}
              </Badge>{' '}
              <span className="font-medium">{r.label}.</span> {r.message}
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Characteristic: {r.characteristic} ·{' '}
                {r.cite.map((c, i) => (
                  <span key={i}>
                    {i > 0 && '; '}
                    <CitationText c={c} />
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <ProvenanceOwnerFields value={po} onChange={setPo} />
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={record}>Record in workspace</Button>
        <span role="status" data-testid="w04-quality-message">
          {message}
        </span>
      </div>

      {teamReqs.length > 0 && (
        <table className="w-full text-left text-xs">
          <caption className="text-left font-medium">Your recorded requirements ({teamReqs.length}; L4 target 15–20)</caption>
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1 pr-2">ID</th>
              <th className="py-1 pr-2">Statement</th>
              <th className="py-1 pr-2">Type / method</th>
              <th className="py-1 pr-2">Parents</th>
              <th className="py-1">Owner / provenance</th>
            </tr>
          </thead>
          <tbody>
            {teamReqs.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                <td className="py-0.5 pr-2">{e.id}</td>
                <td className="py-0.5 pr-2">{e.text}</td>
                <td className="py-0.5 pr-2">
                  {String(e.attributes?.type ?? '—')} / {String(e.attributes?.method ?? '—')}
                </td>
                <td className="py-0.5 pr-2">
                  {model.links
                    .filter((l) => l.source === e.id && l.type === 'derives-from')
                    .map((l) => l.target)
                    .join(', ') || '—'}
                </td>
                <td className="py-0.5">
                  {e.owner ?? '—'} / {e.provenance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
