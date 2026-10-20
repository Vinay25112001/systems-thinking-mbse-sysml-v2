// Practice → My Project handoff panel (directive §8, mockup docs/ux/mockups/practice-handoff.html): the from/to strip
// (AeroLink → your enterprise), "Now apply this engineering method to your own enterprise", what to create, what it
// builds on, how it connects, how completion is determined and the evidence to submit; the primary action opens the
// editor. Optional: copy practice stakeholders (faculty decision F4), only after a confirmation that lists them.
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowRight, Copy, FolderOpen } from 'lucide-react'
import { useState } from 'react'
import { Link } from '../../lib/router'
import { projectTitle } from '../model/create'
import { Chip } from '../pages/ui'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { COPY_FROM_PRACTICE_ENABLED, copyStakeholdersOps, PRACTICE_STAKEHOLDERS, PRACTICE_WARNING } from './copyFromPractice'
import { HANDOFFS } from './handoffs'
import '../pages/project.css'

function CopyDialog({ onDone }: { onDone: (msg: string) => void }) {
  const store = useProjectStore()
  const st = useProjectState()
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<string[]>([])
  const [step, setStep] = useState<'pick' | 'confirm'>('pick')
  const chosen = PRACTICE_STAKEHOLDERS.filter((s) => picked.includes(s.id))
  const confirm = () => {
    if (!store) return
    let created: string[] = []
    const r = store.apply(
      (doc, stamp) => {
        const x = copyStakeholdersOps(doc, picked, stamp)
        created = x.created
        return x.ops
      },
      { source: 'practice-copy', summary: `Copied ${chosen.length} AeroLink practice stakeholder${chosen.length === 1 ? '' : 's'} as templates (not counted until adapted)`, noCoalesce: true },
    )
    setOpen(false)
    setStep('pick')
    setPicked([])
    onDone(r.ok ? `Copied as ${created.join(', ')}, marked “Copied from practice”. Rewrite each for your enterprise, then mark it adapted on its page in My Project.` : `Not copied: ${r.error}`)
  }
  return (
    <Dialog.Root open={open} onOpenChange={(o) => (setOpen(o), o || setStep('pick'))}>
      <Dialog.Trigger asChild>
        <button type="button" className="pj-btn" disabled={!st.doc || st.readOnly} data-testid="copy-from-practice">
          <Copy size={15} aria-hidden /> Copy from practice…
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="pj-overlay" />
        <Dialog.Content className="pj-dialog pj-scope" data-testid="copy-dialog" aria-describedby="copy-desc">
          <Dialog.Title asChild>
            <h2>{step === 'pick' ? 'Copy AeroLink practice stakeholders' : 'Confirm the copy'}</h2>
          </Dialog.Title>
          <div className="pj-banner example" role="note" id="copy-desc" style={{ marginBottom: 12 }}>
            <span>
              <strong>{PRACTICE_WARNING}</strong> They get new IDs in your project and the badge “Copied from practice”.
            </span>
          </div>
          {step === 'pick' ? (
            <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
              <legend className="pj-small" style={{ marginBottom: 6 }}>Choose the stakeholders to use as templates (with their concerns):</legend>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 340, overflowY: 'auto' }}>
                {PRACTICE_STAKEHOLDERS.map((s) => (
                  <li key={s.id} style={{ padding: '4px 0' }}>
                    <label className="pj-row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={picked.includes(s.id)} onChange={(e) => setPicked((p) => (e.target.checked ? [...p, s.id] : p.filter((x) => x !== s.id)))} />
                      <span className="pj-small">
                        <strong>{s.name}</strong> <span className="pj-caption">({s.id} in the example · {s.detail} · {s.concerns.length} concern{s.concerns.length === 1 ? '' : 's'})</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="pj-row" style={{ marginTop: 12 }}>
                <button type="button" className="pj-btn primary" disabled={!picked.length} onClick={() => setStep('confirm')} data-testid="copy-next">
                  Review {picked.length || ''} to copy
                </button>
                <Dialog.Close asChild>
                  <button type="button" className="pj-btn">Cancel</button>
                </Dialog.Close>
              </div>
            </fieldset>
          ) : (
            <div>
              <p className="pj-small">Exactly this will be added to {st.doc ? `“${projectTitle(st.doc)}”` : 'your project'}:</p>
              <ul className="pj-small" data-testid="copy-list">
                {chosen.map((s) => (
                  <li key={s.id}>
                    {s.name} ({s.id} in the example) with {s.concerns.length} concern{s.concerns.length === 1 ? '' : 's'}
                  </li>
                ))}
              </ul>
              <p className="pj-caption">Relationships between the copied items are kept; nothing else from AeroLink is copied. They do not count toward your minimums until you adapt them.</p>
              <div className="pj-row" style={{ marginTop: 12 }}>
                <button type="button" className="pj-btn primary" onClick={confirm} data-testid="copy-confirm">
                  Copy into my project
                </button>
                <button type="button" className="pj-btn" onClick={() => setStep('pick')}>
                  Back
                </button>
                <Dialog.Close asChild>
                  <button type="button" className="pj-btn">Cancel</button>
                </Dialog.Close>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function Handoff({ week, where }: { week: number; where: 'examples' | 'practice' | 'lab' }) {
  const h = HANDOFFS[week]
  const st = useProjectState()
  const [msg, setMsg] = useState('')
  if (!h) return null
  const name = st.doc ? projectTitle(st.doc) : ''
  const compact = where === 'lab'
  return (
    <section className="pj-scope pj-handoff" aria-labelledby={`handoff-${week}-${where}`} data-testid="handoff-panel">
      <div className="pj-handoff-strip">
        <span className="from">
          You practised on
          <strong>AeroLink · instructor example</strong>
        </span>
        <hr />
        <span className="via pj-muted">same method</span>
        <hr />
        <span className="to">
          Now apply it to
          <strong>{name ? `${name} · your enterprise` : 'Your enterprise'}</strong>
        </span>
      </div>
      <div className="pj-handoff-body">
        <h2 id={`handoff-${week}-${where}`}>Now apply this engineering method to your own enterprise.</h2>
        <p className="pj-small" style={{ margin: 0, maxWidth: '80ch' }}>
          You practised {h.practised}. {h.howTo}
        </p>
        {!compact && (
          <div className="pj-handoff-cols">
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FolderOpen size={15} aria-hidden /> What you create
              </h3>
              <ul>{h.create.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div>
              <h3>What it builds on and connects to</h3>
              <ul>
                {h.prior.map((x) => <li key={x}>{x}</li>)}
                {h.connects.map((x) => <li key={x}>{x}</li>)}
              </ul>
            </div>
            <div>
              <h3>How you know it is done</h3>
              <ul>
                {h.done.map((x) => <li key={x}>{x}</li>)}
                <li>
                  <strong>Evidence:</strong> {h.evidence}
                </li>
              </ul>
            </div>
          </div>
        )}
        {compact && (
          <p className="pj-small" style={{ margin: '8px 0 0' }}>
            <strong>Done when:</strong> {h.done.join(' ')} <strong>Evidence:</strong> {h.evidence}
          </p>
        )}
      </div>
      <div className="pj-handoff-foot">
        <div className="pj-row">
          {st.doc ? (
            where !== 'lab' && (
              <Link to={h.editor.to} className="pj-btn primary" data-testid="handoff-open-editor">
                {h.editor.label} <ArrowRight size={15} aria-hidden />
              </Link>
            )
          ) : (
            <Link to="/project" className="pj-btn primary" data-testid="handoff-create">
              Create your project <ArrowRight size={15} aria-hidden />
            </Link>
          )}
          <Link to="/project" className="pj-btn" data-testid="handoff-open-project">
            <FolderOpen size={15} aria-hidden /> Open My Project
          </Link>
          {h.library.map((l) => (
            <Link key={l.to} to={l.to} className="pj-btn link">
              {l.label}
            </Link>
          ))}
          {COPY_FROM_PRACTICE_ENABLED && st.doc && <CopyDialog onDone={setMsg} />}
        </div>
        {COPY_FROM_PRACTICE_ENABLED && st.doc && <p className="pj-caption" style={{ margin: '8px 0 0' }}>“Copy from practice” copies chosen AeroLink stakeholders as templates, only after you confirm the list; they count only once adapted. <Chip tone="example">Pending faculty decision F4</Chip></p>}
        {msg && (
          <p className="pj-small" role="status" data-testid="copy-msg">
            {msg}
          </p>
        )}
      </div>
    </section>
  )
}
