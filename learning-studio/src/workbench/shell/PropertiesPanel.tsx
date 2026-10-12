// Properties of the selected element. Engineering elements are edited through Workspace.updateElement with
// owner/provenance via ProvenanceOwnerFields; instructor-provided elements are read-only; stakeholders are owned by the
// stakeholder editor. Week-specific artefacts (e.g. Week 1 loops) use the week's own form.
import { ExternalLink, MousePointerClick } from 'lucide-react'
import { useId, useState } from 'react'
import { ProvenanceOwnerFields } from '../../components/ProvenanceOwnerFields'
import { ProvenanceBadge } from '../../components/ui'
import { KIND_INFO, type Element } from '../../model/engineering'
import { useWorkspace } from '../../state/Workspace'
import { useWorkbench } from '../context'
import { useSelection } from '../selection'
import { SeverityChip } from '../ui'
import { VIEW_REGISTRY } from '../views'

const STUDENT = new Set(['team-derived', 'team-assumption', 'AI-suggested-reviewed', 'cited'])
const ATTR_LABEL: Record<string, string> = { exchange: 'Exchange with the SoI', rejectedBoundary: 'Rejected boundary and why' }

function ElementForm({ e }: { e: Element }) {
  const { updateElement, retireElement } = useWorkspace()
  const wb = useWorkbench()
  const id = useId()
  const [reason, setReason] = useState('')
  const editable = STUDENT.has(e.provenance) && e.kind !== 'STK' && e.status === 'active'
  const attrs = Object.entries(e.attributes ?? {})
  return (
    <div className="space-y-3">
      <div>
        <span className="wb-mono text-[11px] text-wb-muted">
          {KIND_INFO[e.kind].label} · {e.id}
          {e.status === 'retired' ? ' · retired' : ''}
        </span>
        <h3 className="wb-section-title mt-0.5">{e.name}</h3>
        <div className="mt-1">
          <ProvenanceBadge value={e.provenance} />
        </div>
      </div>
      {editable ? (
        <>
          <label className="block" htmlFor={`${id}-n`}>
            <span className="wb-label">Name</span>
            <input id={`${id}-n`} className="wb-input w-full" value={e.name} onChange={(ev) => updateElement(e.id, { name: ev.target.value })} />
          </label>
          <label className="block" htmlFor={`${id}-t`}>
            <span className="wb-label">{e.kind === 'ENT' ? 'Boundary statement' : 'Statement / description'}</span>
            <textarea id={`${id}-t`} rows={3} className="wb-textarea" value={e.text ?? ''} onChange={(ev) => updateElement(e.id, { text: ev.target.value })} />
          </label>
          {(e.kind === 'EXT' ? [['exchange', String(e.attributes?.exchange ?? '')] as const] : attrs.filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, String(v)] as const)).map(([k, v]) => (
            <label key={k} className="block" htmlFor={`${id}-a-${k}`}>
              <span className="wb-label">{ATTR_LABEL[k] ?? k}</span>
              <input id={`${id}-a-${k}`} className="wb-input w-full" value={v} onChange={(ev) => updateElement(e.id, { attributes: { ...(e.attributes ?? {}), [k]: ev.target.value } })} />
            </label>
          ))}
          <ProvenanceOwnerFields value={{ owner: e.owner ?? '', provenance: e.provenance }} onChange={(v) => updateElement(e.id, { owner: v.owner, provenance: v.provenance })} />
          <details className="text-[12px]">
            <summary className="cursor-pointer text-wb-muted">Retire {e.id}</summary>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <label className="min-w-0 flex-1">
                <span className="wb-label">Reason (IDs are never reused)</span>
                <input className="wb-input w-full" value={reason} onChange={(ev) => setReason(ev.target.value)} />
              </label>
              <button
                type="button"
                className="wb-btn"
                disabled={!reason.trim()}
                onClick={() => {
                  retireElement(e.id, reason.trim())
                  wb.log('info', `Retired ${e.id}: ${reason.trim()}`)
                }}
              >
                Retire
              </button>
            </div>
          </details>
        </>
      ) : (
        <dl className="wb-kv">
          {e.text && (
            <>
              <dt>Statement</dt>
              <dd style={{ fontFamily: 'var(--wb-body)' }}>{e.text}</dd>
            </>
          )}
          {attrs.map(([k, v]) => (
            <div key={k} className="contents">
              <dt>{ATTR_LABEL[k] ?? k}</dt>
              <dd>{String(v)}</dd>
            </div>
          ))}
          <dt>Owner</dt>
          <dd>{e.owner || '—'}</dd>
          {e.retiredReason && (
            <>
              <dt>Retired</dt>
              <dd>{e.retiredReason}</dd>
            </>
          )}
        </dl>
      )}
      {e.kind === 'STK' && (
        <button type="button" className="wb-link" onClick={() => wb.setView('stakeholders')}>
          Stakeholders are edited in the stakeholder editor <ExternalLink size={11} aria-hidden className="inline" />
        </button>
      )}
      {!editable && e.kind !== 'STK' && <p className="text-[11px] text-wb-muted">Instructor-provided element: read-only.</p>}
    </div>
  )
}

export function PropertiesPanel() {
  const wb = useWorkbench()
  const { selectedId, select } = useSelection()
  const el = selectedId ? wb.state.model.elements.find((e) => e.id === selectedId) : undefined
  const WeekProps = wb.ui.Properties
  const problems = selectedId ? wb.problems.filter((p) => p.elementId === selectedId) : []
  const home = selectedId ? wb.ui.homeView(selectedId) : undefined
  return (
    <div className="space-y-3 p-3" data-testid="properties">
      {!selectedId ? (
        <div className="wb-empty -m-3">
          <MousePointerClick size={16} aria-hidden />
          <p className="m-0">
            <strong>Nothing selected.</strong> Select an element in the model browser, a view or the Problems list to see and edit its properties.
          </p>
        </div>
      ) : el ? (
        <ElementForm e={el} />
      ) : WeekProps ? (
        <WeekProps id={selectedId} />
      ) : (
        <p className="text-wb-muted">{selectedId} is not in the model.</p>
      )}
      {selectedId && home && home !== wb.view && (
        <button type="button" className="wb-btn" onClick={() => wb.setView(home)}>
          Show in the {VIEW_REGISTRY[home]?.title ?? home} view
        </button>
      )}
      {problems.length > 0 && (
        <div>
          <h4 className="wb-label">Problems on this element</h4>
          <ul className="m-0 list-none space-y-1.5 p-0 text-[12px]">
            {problems.map((p, i) => (
              <li key={i}>
                <SeverityChip s={p.severity} /> {p.message}
                <div className="mt-0.5 text-wb-muted">{p.hint}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedId && (
        <button type="button" className="wb-link" onClick={() => select(null)}>
          Clear selection
        </button>
      )}
    </div>
  )
}
