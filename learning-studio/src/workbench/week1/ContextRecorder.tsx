// Context recorder (Week 1, L1 steps 1–2): the system of interest (ENT-001) with its one-sentence boundary and a
// rejected boundary, and the external systems (EXT-001 …) with labelled exchanges. Elements go into the shared AeroLink
// workspace so they carry into Week 2 (stakeholders) and Week 9 (SysML context parts). Every recorder records owner
// and provenance (AUTHORING_GUIDE §7.1).
import { Plus } from 'lucide-react'
import { useId, useState } from 'react'
import { DEFAULT_PROVENANCE_OWNER, ProvenanceOwnerFields, ownerProblem, type ProvenanceOwner } from '../../components/ProvenanceOwnerFields'
import { useWorkspace } from '../../state/Workspace'
import { useWorkbench } from '../context'
import { useSelection } from '../selection'
import { EXCHANGES, MIN_EXT, checkContext, checkSoi } from './logic'
import { StateChip } from '../ui'


function SoiForm() {
  const { model, apply, updateElement } = useWorkspace()
  const wb = useWorkbench()
  const { select } = useSelection()
  const ent = model.elements.find((e) => e.kind === 'ENT' && e.status === 'active')
  const [draft, setDraft] = useState({ name: 'AeroLink service enterprise', text: '', rejected: '' })
  const [po, setPo] = useState<ProvenanceOwner>(DEFAULT_PROVENANCE_OWNER)
  const [msg, setMsg] = useState('')
  const id = useId()
  const soi = checkSoi(model)

  if (ent) {
    return (
      <div className="space-y-2" data-testid="soi-form">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="wb-link wb-mono" onClick={() => select(ent.id, { reveal: true })}>
            {ent.id}
          </button>
          <span className="font-medium">{ent.name}</span>
          <StateChip ok={soi.ok}>{soi.ok ? 'L1 step 1 complete' : 'incomplete'}</StateChip>
        </div>
        <label className="block" htmlFor={`${id}-t`}>
          <span className="wb-label">Boundary statement (one sentence)</span>
          <textarea id={`${id}-t`} rows={2} className="wb-textarea" value={ent.text ?? ''} onChange={(e) => updateElement(ent.id, { text: e.target.value })} />
        </label>
        <label className="block" htmlFor={`${id}-r`}>
          <span className="wb-label">A boundary you rejected, and why</span>
          <textarea id={`${id}-r`} rows={2} className="wb-textarea" value={String(ent.attributes?.rejectedBoundary ?? '')} onChange={(e) => updateElement(ent.id, { attributes: { ...(ent.attributes ?? {}), rejectedBoundary: e.target.value } })} />
        </label>
        {!soi.ok && <p className="text-[12px] text-wb-muted">{soi.detail}</p>}
        <p className="text-[12px] text-wb-muted">Owner and provenance are edited in Properties.</p>
      </div>
    )
  }

  const create = () => {
    const problem = ownerProblem(po.owner)
    if (problem) return setMsg(problem)
    if (!draft.text.trim()) return setMsg('Write the boundary statement first.')
    const r = apply({ elements: [{ key: 'ent', kind: 'ENT', name: draft.name.trim() || 'System of interest', text: draft.text.trim(), attributes: { rejectedBoundary: draft.rejected.trim() }, owner: po.owner.trim().toUpperCase(), provenance: po.provenance }] })
    if (r.error) return setMsg(r.error)
    setMsg('')
    wb.log('info', `Recorded ${r.ids.ent} (system of interest)`)
    select(r.ids.ent, { reveal: true })
  }
  return (
    <div className="space-y-2" data-testid="soi-form">
      <label className="block" htmlFor={`${id}-n`}>
        <span className="wb-label">System of interest (name)</span>
        <input id={`${id}-n`} className="wb-input w-full" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
      </label>
      <label className="block" htmlFor={`${id}-t`}>
        <span className="wb-label">Boundary statement (one sentence)</span>
        <textarea id={`${id}-t`} rows={2} className="wb-textarea" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
      </label>
      <label className="block" htmlFor={`${id}-r`}>
        <span className="wb-label">A boundary you rejected, and why</span>
        <textarea id={`${id}-r`} rows={2} className="wb-textarea" value={draft.rejected} onChange={(e) => setDraft({ ...draft, rejected: e.target.value })} />
      </label>
      <ProvenanceOwnerFields value={po} onChange={setPo} />
      <div className="flex items-center gap-3">
        <button type="button" className="wb-btn primary" onClick={create}>
          Record ENT-001
        </button>
        {msg && (
          <span role="alert" className="text-[12px] text-wb-bad">
            {msg}
          </span>
        )}
      </div>
    </div>
  )
}

function ExtForm() {
  const { model, apply } = useWorkspace()
  const wb = useWorkbench()
  const { select } = useSelection()
  const [name, setName] = useState('')
  const [exchange, setExchange] = useState('')
  const [other, setOther] = useState('')
  const [po, setPo] = useState<ProvenanceOwner>(DEFAULT_PROVENANCE_OWNER)
  const [msg, setMsg] = useState('')
  const id = useId()
  const ext = model.elements.filter((e) => e.kind === 'EXT' && e.status === 'active')
  const ctx = checkContext(model)
  const label = exchange === 'other' ? other.trim() : exchange

  const add = () => {
    if (!name.trim()) return setMsg('Name the external system or actor.')
    const problem = ownerProblem(po.owner)
    if (problem) return setMsg(problem)
    const r = apply({ elements: [{ key: 'ext', kind: 'EXT', name: name.trim(), attributes: label ? { exchange: label } : {}, owner: po.owner.trim().toUpperCase(), provenance: po.provenance }] })
    if (r.error) return setMsg(r.error)
    setMsg(label ? '' : `Recorded ${r.ids.ext} without an exchange label — Problems will flag it.`)
    setName('')
    wb.log('info', `Recorded ${r.ids.ext} (${name.trim()})`)
    select(r.ids.ext)
  }

  return (
    <div className="space-y-2" data-testid="ext-form">
      <div className="flex flex-wrap items-center gap-2">
        <StateChip ok={ctx.ok}>
          {Math.min(ext.length, 99)} of {MIN_EXT}+ external systems
        </StateChip>
        <span className="text-[12px] text-wb-muted">{ctx.detail}</span>
      </div>
      {ext.length > 0 && (
        <table className="wb-table" aria-label="External systems recorded">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">External system or actor</th>
              <th scope="col">Exchange</th>
              <th scope="col">Owner</th>
            </tr>
          </thead>
          <tbody>
            {ext.map((e) => (
              <tr key={e.id} className="clickable" onClick={() => select(e.id, { reveal: true })}>
                <td className="wb-mono whitespace-nowrap">
                  <button type="button" className="wb-link wb-mono" onClick={(ev) => (ev.stopPropagation(), select(e.id, { reveal: true }))}>
                    {e.id}
                  </button>
                </td>
                <td>{e.name}</td>
                <td>{String(e.attributes?.exchange ?? '') || <span className="text-wb-muted">{e.text ? e.text : '—'}</span>}</td>
                <td className="wb-mono">{e.owner || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-48 flex-1" htmlFor={`${id}-n`}>
          <span className="wb-label">External system or actor</span>
          <input id={`${id}-n`} className="wb-input w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Air navigation service provider" />
        </label>
        <label htmlFor={`${id}-x`}>
          <span className="wb-label">Exchange with the SoI</span>
          <select id={`${id}-x`} className="wb-select" value={exchange} onChange={(e) => setExchange(e.target.value)}>
            <option value="">choose…</option>
            {EXCHANGES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
            <option value="other">other…</option>
          </select>
        </label>
        {exchange === 'other' && (
          <label htmlFor={`${id}-o`}>
            <span className="wb-label">Exchange label</span>
            <input id={`${id}-o`} className="wb-input" value={other} onChange={(e) => setOther(e.target.value)} />
          </label>
        )}
      </div>
      <ProvenanceOwnerFields value={po} onChange={setPo} />
      <div className="flex items-center gap-3">
        <button type="button" className="wb-btn primary" onClick={add}>
          <Plus size={13} aria-hidden /> Add external system
        </button>
        {msg && (
          <span role="status" className="text-[12px] text-wb-warn">
            {msg}
          </span>
        )}
      </div>
    </div>
  )
}

export function ContextRecorder() {
  return (
    <section aria-labelledby="ctx-rec-h" className="rounded border border-wb-line bg-wb-panel" data-testid="context-recorder">
      <div className="wb-ph">
        <h2 id="ctx-rec-h">L1 context · system of interest and external systems</h2>
      </div>
      <div className="grid gap-4 p-3 xl:grid-cols-2">
        <div className="min-w-0">
          <h3 className="wb-section-title mb-2">System of interest</h3>
          <SoiForm />
        </div>
        <div className="min-w-0">
          <h3 className="wb-section-title mb-2">External systems (EXT)</h3>
          <ExtForm />
        </div>
      </div>
    </section>
  )
}
