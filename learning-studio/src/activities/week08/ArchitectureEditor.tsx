import { useState } from 'react'
import { Button } from '../../components/ui'
import { DEFAULT_PROVENANCE_OWNER, ProvenanceOwnerFields, ownerProblem, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { referenceUpTo } from '../../model/reference'
import type { Batch } from '../../state/Workspace'
import { useWorkspace } from '../../state/Workspace'
import { IF_TYPES, allocationMatrix, checkArchitecture, criteriaNamed, functionNameProblem, justificationProblem } from './architecture'
import { decisionProblem } from './infoflow'

const input = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900'
type Mode = 'PHY' | 'FN' | 'ALLOC' | 'FLOW' | 'IF' | 'INFO' | 'AI'
const MODES: { id: Mode; label: string }[] = [
  { id: 'PHY', label: 'New physical element' },
  { id: 'FN', label: 'New function, derived and allocated' },
  { id: 'ALLOC', label: 'Allocate an existing function' },
  { id: 'FLOW', label: 'New function-to-function flow (for the N² coupling)' },
  { id: 'IF', label: 'New interface (typed, both ends)' },
  { id: 'INFO', label: 'New information item (producer → consumer → decision)' },
  { id: 'AI', label: 'New AI-enabled capability' },
]
type Draft = { name: string; text: string; cap: string; scn: string; toFn: string; flowKind: string; phy: string; log: string; fn: string; justification: string; ifType: string; endA: string; endB: string; carries: string; producer: string; consumer: string; decision: string; inputs: string; outputs: string; oversight: string; failure: string }
const BLANK: Draft = { name: '', text: '', cap: '', scn: '', toFn: '', flowKind: '', phy: '', log: '', fn: '', justification: '', ifType: '', endA: '', endB: '', carries: '', producer: '', consumer: '', decision: '', inputs: '', outputs: '', oversight: '', failure: '' }
const MARK = { ok: '✓ Pass', fail: '✗ Fail', advise: '! Advisory' }

export function ArchitectureEditor() {
  const { model, apply } = useWorkspace()
  const [mode, setMode] = useState<Mode>('FN')
  const [d, setD] = useState<Draft>(BLANK)
  const [po, setPo] = useState<ProvenanceOwner>(DEFAULT_PROVENANCE_OWNER)
  const [issues, setIssues] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [view, setView] = useState<'mine' | 'reference'>('mine')
  const of = (k: string) => model.elements.filter((e) => e.kind === k && e.status === 'active')
  const caps = of('CAP')
  const scns = of('SCN')
  const phys = of('PHY')
  const logs = of('LOG')
  const fns = of('FN')
  const ends = [...phys, ...of('EXT')]
  const producers = [...phys, ...of('EXT'), ...logs, ...of('AI')]
  const consumers = [...producers, ...of('DEC')]
  const shown = view === 'mine' ? model : referenceUpTo(8)
  const checks = checkArchitecture(shown)
  const matrix = allocationMatrix(shown)
  const set = (patch: Partial<Draft>) => setD({ ...d, ...patch })

  const validate = (): string[] => {
    const out: string[] = []
    const owner = ownerProblem(po.owner)
    if (owner) out.push(owner)
    if (mode === 'PHY' || mode === 'AI') {
      if (!d.name.trim()) out.push(mode === 'PHY' ? 'Give the physical element a name.' : 'Give the AI capability a name.')
      if (d.text.trim().split(/\s+/).filter(Boolean).length < 5) out.push('Describe the element in at least one short sentence.')
    }
    if (mode === 'AI') {
      const missing = [['inputs', d.inputs], ['outputs', d.outputs], ['human oversight', d.oversight], ['failure considerations', d.failure]].filter(([, v]) => !v.trim()).map(([k]) => k)
      if (missing.length) out.push(`State the AI capability’s ${missing.join(', ')} (RB-7.6).`)
    }
    if (mode === 'FN') {
      if (!d.name.trim()) out.push('Give the function a name.')
      else {
        const p = functionNameProblem(d.name, phys.map((x) => x.name))
        if (p) out.push(p)
      }
      if (!d.cap) out.push('Choose the capability the function derives from (RB-7.2).')
    }
    if (mode === 'ALLOC' && !d.fn) out.push('Choose the function to allocate.')
    if (mode === 'FLOW') {
      if (!d.fn || !d.toFn) out.push('Choose the producing and the consuming function.')
      else if (d.fn === d.toFn) out.push('A flow joins two different functions.')
      if (!d.flowKind) out.push('Say what kind of flow it is: information, energy or material (R20b p.587).')
      if (!d.name.trim()) out.push('Name the item that flows (e.g. “Flight release”).')
    }
    if (mode === 'FN' || mode === 'ALLOC') {
      if (!d.phy) out.push('Choose the physical element the function is allocated to.')
      const j = justificationProblem(d.justification)
      if (j) out.push(j)
    }
    if (mode === 'IF') {
      if (!d.name.trim()) out.push('Give the interface a name.')
      if (!d.ifType) out.push('Type the interface: physical, information or organisational (L8 acceptance).')
      if (!d.endA || !d.endB) out.push('Choose both ends of the interface (L8 acceptance).')
      else if (d.endA === d.endB) out.push('An interface joins two different elements.')
      if (!d.carries.trim()) out.push('State what the interface carries.')
    }
    if (mode === 'INFO') {
      if (!d.name.trim()) out.push('Give the information item a name.')
      if (!d.producer) out.push('Choose the producer.')
      if (!d.consumer) out.push('Choose the consumer.')
      const p = decisionProblem(d.decision)
      if (p) out.push(`Decision: ${p}`)
    }
    return out
  }

  const submit = () => {
    const found = validate()
    setIssues(found)
    setMessage('')
    if (found.length) return
    const owner = po.owner.trim().toUpperCase()
    const who = `[${owner} · ${po.provenance}]`
    let batch: Batch
    if (mode === 'PHY') batch = { elements: [{ key: 'phy', kind: 'PHY', name: d.name.trim(), text: d.text.trim(), owner, provenance: po.provenance }] }
    else if (mode === 'AI')
      batch = {
        elements: [{ key: 'ai', kind: 'AI', name: d.name.trim(), text: d.text.trim(), owner, provenance: po.provenance, attributes: { inputs: d.inputs.trim(), outputs: d.outputs.trim(), humanOversight: d.oversight.trim(), failureMode: d.failure.trim() } }],
        links: [...(d.fn ? [{ source: 'ai', type: 'performs' as const, target: d.fn }] : []), ...(d.phy ? [{ source: 'ai', type: 'allocated-to' as const, target: d.phy }] : [])],
      }
    else if (mode === 'FN')
      batch = {
        elements: [{ key: 'fn', kind: 'FN', name: d.name.trim(), text: d.text.trim(), owner, provenance: po.provenance }],
        links: [
          { source: 'fn', type: 'derives-from', target: d.cap, rationale: 'Recorded in Lab L8' },
          ...(d.scn ? [{ source: 'fn', type: 'derives-from' as const, target: d.scn, rationale: 'Exercised in this scenario (L8)' }] : []),
          { source: 'fn', type: 'allocated-to', target: d.phy, rationale: `${who} ${d.justification.trim()}` },
          ...(d.log ? [{ source: d.log, type: 'performs' as const, target: 'fn' }] : []),
        ],
      }
    else if (mode === 'ALLOC') batch = { links: [{ source: d.fn, type: 'allocated-to', target: d.phy, rationale: `${who} ${d.justification.trim()}` }] }
    else if (mode === 'FLOW') batch = { links: [{ source: d.fn, type: 'flows-to', target: d.toFn, rationale: `${d.flowKind}: ${d.name.trim()} ${who}` }] }
    else if (mode === 'IF')
      batch = { elements: [{ key: 'if', kind: 'IF', name: d.name.trim(), text: d.text.trim(), owner, provenance: po.provenance, attributes: { type: d.ifType, ends: `${d.endA} <-> ${d.endB}`, carries: d.carries.trim() } }] }
    else
      batch = {
        elements: [{ key: 'info', kind: 'INFO', name: d.name.trim(), text: d.text.trim(), owner, provenance: po.provenance, attributes: { producer: d.producer, consumer: d.consumer, decisionSupported: d.decision.trim() } }],
        links: [
          { source: d.producer, type: 'flows-to', target: 'info' },
          { source: 'info', type: 'flows-to', target: d.consumer },
        ],
      }
    const r = apply(batch)
    if (r.error) {
      setIssues([`Not recorded: ${r.error}.`])
      return
    }
    const id = mode === 'FLOW' ? `Flow ${d.fn} → ${d.toFn}` : (r.ids.phy ?? r.ids.ai ?? r.ids.fn ?? r.ids.if ?? r.ids.info ?? d.fn)
    const crit = mode === 'FN' || mode === 'ALLOC' ? ` Criteria named: ${criteriaNamed(d.justification).join('; ')}.` : ''
    setMessage(`${id} recorded (${r.linkIds.length} link${r.linkIds.length === 1 ? '' : 's'}), owner ${owner}, tagged ${po.provenance}.${crit}`)
    setD({ ...BLANK, cap: d.cap, phy: d.phy })
  }

  const opt = (list: { id: string; name: string }[]) =>
    list.map((e) => (
      <option key={e.id} value={e.id}>
        {e.id} {e.name}
      </option>
    ))

  return (
    <div className="space-y-3 text-sm" data-testid="w08-architecture-editor">
      <p>
        Record your team’s functions, allocations, interfaces and information items in the AeroLink workspace. Each entry is checked against the L8 acceptance rules before it is written. Your workspace has {fns.length} FN, {phys.length} PHY, {of('IF').length} IF and {of('INFO').length} INFO.
        {phys.length === 0 && ' No physical elements yet: record them first (L8 needs at least 6, including the six S04 Lab 6 elements).'}
      </p>
      <fieldset className="flex flex-wrap gap-x-4 gap-y-1">
        <legend className="font-medium">What do you want to record?</legend>
        {MODES.map((m) => (
          <label key={m.id} className="flex items-center gap-1.5">
            <input type="radio" name="w08-mode" checked={mode === m.id} onChange={() => { setMode(m.id); setIssues([]); setMessage('') }} />
            {m.label}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-2 sm:grid-cols-2">
        {mode !== 'ALLOC' && (
          <label className="flex flex-col gap-1">
            {mode === 'FN' ? 'Function name (verb + object)' : mode === 'FLOW' ? 'Item that flows' : mode === 'IF' ? 'Interface name' : mode === 'INFO' ? 'Information item name' : mode === 'PHY' ? 'Physical element name' : 'AI capability name'}
            <input className={input} value={d.name} onChange={(e) => set({ name: e.target.value })} />
          </label>
        )}
        {mode === 'FN' && (
          <label className="flex flex-col gap-1">
            Derived from capability
            <select className={input} value={d.cap} onChange={(e) => set({ cap: e.target.value })}>
              <option value="">Choose…</option>
              {opt(caps)}
            </select>
          </label>
        )}
        {mode === 'FN' && (
          <label className="flex flex-col gap-1">
            Exercised in scenario (recommended; R20b p.594)
            <select className={input} value={d.scn} onChange={(e) => set({ scn: e.target.value })}>
              <option value="">None yet</option>
              {opt(scns)}
            </select>
          </label>
        )}
        {mode === 'FLOW' && (
          <>
            <label className="flex flex-col gap-1">
              From function (producer)
              <select className={input} value={d.fn} onChange={(e) => set({ fn: e.target.value })}>
                <option value="">Choose…</option>
                {opt(fns)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              To function (consumer)
              <select className={input} value={d.toFn} onChange={(e) => set({ toFn: e.target.value })}>
                <option value="">Choose…</option>
                {opt(fns)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Kind of flow
              <select className={input} value={d.flowKind} onChange={(e) => set({ flowKind: e.target.value })}>
                <option value="">Choose…</option>
                <option value="information">information</option>
                <option value="energy">energy</option>
                <option value="material">material</option>
              </select>
            </label>
          </>
        )}
        {mode === 'ALLOC' && (
          <label className="flex flex-col gap-1">
            Function
            <select className={input} value={d.fn} onChange={(e) => set({ fn: e.target.value })}>
              <option value="">Choose…</option>
              {opt(fns)}
            </select>
          </label>
        )}
        {(mode === 'FN' || mode === 'ALLOC') && (
          <label className="flex flex-col gap-1">
            Allocated to physical element
            <select className={input} value={d.phy} onChange={(e) => set({ phy: e.target.value })}>
              <option value="">Choose…</option>
              {opt(phys)}
            </select>
          </label>
        )}
        {mode === 'FN' && (
          <label className="flex flex-col gap-1">
            Performed by logical element (optional)
            <select className={input} value={d.log} onChange={(e) => set({ log: e.target.value })}>
              <option value="">None yet</option>
              {opt(logs)}
            </select>
          </label>
        )}
        {(mode === 'FN' || mode === 'ALLOC') && (
          <label className="flex flex-col gap-1 sm:col-span-2">
            Allocation justification (name the criterion — shared flows, technology, control, execution frequency, dependability, proximity, interfaces — and cite the ID it rests on, e.g. REQ-SYS-001 or IF-005)
            <textarea className={input} rows={2} value={d.justification} onChange={(e) => set({ justification: e.target.value })} />
          </label>
        )}
        {mode === 'IF' && (
          <>
            <label className="flex flex-col gap-1">
              Interface type
              <select className={input} value={d.ifType} onChange={(e) => set({ ifType: e.target.value })}>
                <option value="">Choose…</option>
                {IF_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              End A
              <select className={input} value={d.endA} onChange={(e) => set({ endA: e.target.value })}>
                <option value="">Choose…</option>
                {opt(ends)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              End B
              <select className={input} value={d.endB} onChange={(e) => set({ endB: e.target.value })}>
                <option value="">Choose…</option>
                {opt(ends)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Carries
              <input className={input} value={d.carries} onChange={(e) => set({ carries: e.target.value })} />
            </label>
          </>
        )}
        {mode === 'INFO' && (
          <>
            <label className="flex flex-col gap-1">
              Producer
              <select className={input} value={d.producer} onChange={(e) => set({ producer: e.target.value })}>
                <option value="">Choose…</option>
                {opt(producers)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Consumer
              <select className={input} value={d.consumer} onChange={(e) => set({ consumer: e.target.value })}>
                <option value="">Choose…</option>
                {opt(consumers)}
              </select>
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              Decision supported (who decides what? cite the REQ or DEC ID)
              <input className={input} value={d.decision} onChange={(e) => set({ decision: e.target.value })} />
            </label>
          </>
        )}
        {mode === 'AI' && (
          <>
            <label className="flex flex-col gap-1">
              Inputs
              <input className={input} value={d.inputs} onChange={(e) => set({ inputs: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              Outputs
              <input className={input} value={d.outputs} onChange={(e) => set({ outputs: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              Human oversight
              <input className={input} value={d.oversight} onChange={(e) => set({ oversight: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              Failure considerations
              <input className={input} value={d.failure} onChange={(e) => set({ failure: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              Performs function (optional)
              <select className={input} value={d.fn} onChange={(e) => set({ fn: e.target.value })}>
                <option value="">None</option>
                {opt(fns)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              Hosted on physical element (optional)
              <select className={input} value={d.phy} onChange={(e) => set({ phy: e.target.value })}>
                <option value="">None</option>
                {opt(phys)}
              </select>
            </label>
          </>
        )}
        {mode !== 'ALLOC' && mode !== 'FLOW' && (
          <label className="flex flex-col gap-1 sm:col-span-2">
            Description
            <textarea className={input} rows={2} value={d.text} onChange={(e) => set({ text: e.target.value })} />
          </label>
        )}
        <div className="sm:col-span-2">
          <ProvenanceOwnerFields value={po} onChange={setPo} />
        </div>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        Screening only: the name, justification and decision checks catch common errors (a solution or performer named in the functional view, a justification without a criterion or without the ID it rests on, a “decision” that names no choice). They can be fooled by well-formed but wrong text; a reviewer still judges quality (RB-7).
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={submit}>Check and record</Button>
        <span role="status" data-testid="w08-editor-message">
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

      <fieldset className="flex flex-wrap gap-x-4">
        <legend className="font-medium">Completeness checks for</legend>
        <label className="flex items-center gap-1.5">
          <input type="radio" name="w08-view" checked={view === 'mine'} onChange={() => setView('mine')} /> My workspace
        </label>
        <label className="flex items-center gap-1.5">
          <input type="radio" name="w08-view" checked={view === 'reference'} onChange={() => setView('reference')} /> Instructor reference (read-only)
        </label>
      </fieldset>
      <table className="w-full text-left text-xs" data-testid="w08-arch-checks">
        <caption className="text-left font-medium">L8 acceptance, minimums and advisories</caption>
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="py-1 pr-2">Result</th>
            <th className="py-1 pr-2">Check</th>
            <th className="py-1 pr-2">Failing</th>
            <th className="py-1">Source</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((c) => (
            <tr key={c.id} className="border-b border-slate-100 align-top dark:border-slate-800">
              <td className="py-0.5 pr-2 whitespace-nowrap">{c.ok ? MARK.ok : c.severity === 'advisory' ? MARK.advise : MARK.fail}</td>
              <td className="py-0.5 pr-2">{c.label}</td>
              <td className="py-0.5 pr-2">{c.ok ? '—' : c.failing.join(', ')}</td>
              <td className="py-0.5">{c.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {matrix.rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="text-left text-xs" data-testid="w08-alloc-matrix">
            <caption className="text-left font-medium">FN → PHY allocation matrix (“X” = allocated)</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-1 pr-2" scope="col">Function</th>
                {matrix.phys.map((p) => (
                  <th key={p} className="px-1 py-1" scope="col">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((r) => (
                <tr key={r.fn} className="border-b border-slate-100 dark:border-slate-800">
                  <th className="py-0.5 pr-2 font-normal" scope="row">
                    {r.fn} {r.name}
                  </th>
                  {r.cells.map((c, i) => (
                    <td key={i} className="px-1 text-center">
                      {c ? 'X' : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
