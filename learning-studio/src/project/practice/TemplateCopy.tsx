// Explicit template transfer from the AeroLink practice into the team project (spec §e.5 GP-30; directive §11: never
// silent). The only path: (1) a secondary action "Use AeroLink rows as a starting template…" (never the primary button);
// (2) a choice of rows, each with its own "include its concerns" box; (3) a review screen that lists exactly what would
// be created, with the new project IDs, what is not copied, and the adapt warning; (4) "I understand these must be
// adapted" before Confirm. The copy runs through copyFromPractice.ts as create-artifact operations with provenance
// `copied-from-practice`, adapted: false, new IDs from the project's own counters, in ONE change set "Template copied
// from AeroLink (n rows)". It goes through the project store's `apply`, so it works the same with the offline adapter
// (IndexedDB) and the course server adapter (which screens the change set; source 'practice-copy' is a member source).
// COPY_FROM_PRACTICE_ENABLED (faculty decision F4) still switches the whole action off.
import * as Dialog from '@radix-ui/react-dialog'
import { Copy } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '../../lib/router'
import type { ProjectDoc, Stamp } from '../model/types'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import './templateCopy.css'
import { COPY_FROM_PRACTICE_ENABLED, copyStakeholdersOps, NOT_COPIED, PRACTICE_STAKEHOLDERS, TEMPLATE_WARNING, type PlannedCopy } from './copyFromPractice'

export const TEMPLATE_SUMMARY = (n: number) => `Template copied from AeroLink (${n} row${n === 1 ? '' : 's'})`

/** What the copy would create in `doc`, without changing it (the review screen lists exactly this). */
export function planTemplateCopy(doc: ProjectDoc, picked: string[], concernsOf: string[]): PlannedCopy[] {
  const stamp: Stamp = { at: new Date().toISOString(), by: '', change: 'CHG-PREVIEW' }
  return copyStakeholdersOps(doc, picked, stamp, { concernsOf, ratings: false }).planned
}

export function TemplateCopy({ label = 'Use AeroLink rows as a starting template…', onDone }: { label?: string; onDone?: (msg: string) => void }) {
  const store = useProjectStore()
  const st = useProjectState()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'pick' | 'review'>('pick')
  const [picked, setPicked] = useState<string[]>([])
  const [withConcerns, setWithConcerns] = useState<string[]>([])
  const [understood, setUnderstood] = useState(false)
  const [msg, setMsg] = useState('')
  const [planNote, setPlanNote] = useState('')
  const title = useRef<HTMLHeadingElement>(null)
  // review M5-09: the step change is announced by moving focus to the dialog title
  useEffect(() => {
    if (open) requestAnimationFrame(() => title.current?.focus())
  }, [step, open])
  const plan = useMemo(() => (st.doc && step === 'review' ? planTemplateCopy(st.doc, picked, withConcerns) : []), [st.doc, step, picked, withConcerns])
  if (!COPY_FROM_PRACTICE_ENABLED) return null
  const close = () => {
    setOpen(false)
    setStep('pick')
    setUnderstood(false)
  }
  const confirm = () => {
    if (!store || !st.doc || !understood) return
    // review M5-09: the project may have changed since the review (a teammate's save): never create other IDs than shown
    const now = planTemplateCopy(st.doc, picked, withConcerns)
    if (now.map((p) => p.to).join() !== plan.map((p) => p.to).join()) {
      setPlanNote('Your project changed since this review, so the new IDs changed. Review the list again, then confirm.')
      setStep('pick')
      requestAnimationFrame(() => setStep('review'))
      return
    }
    setPlanNote('')
    const rows = picked.length
    let created: string[] = []
    const r = store.apply(
      (doc, stamp) => {
        const x = copyStakeholdersOps(doc, picked, stamp, { concernsOf: withConcerns, ratings: false })
        created = x.created
        return x.ops
      },
      { source: 'practice-copy', summary: TEMPLATE_SUMMARY(rows), noCoalesce: true },
    )
    close()
    setPicked([])
    setWithConcerns([])
    const text = r.ok ? `Copied as ${created.join(', ')}, each marked “Template from AeroLink — adapt before use”. They do not count until you rewrite them for your enterprise and mark them adapted in My Project.` : `Not copied: ${r.error}`
    setMsg(text)
    onDone?.(text)
  }
  const toggle = (list: string[], id: string, on: boolean) => (on ? [...new Set([...list, id])] : list.filter((x) => x !== id))
  return (
    <div className="tc" data-testid="template-copy">
      <Dialog.Root open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
        <Dialog.Trigger asChild>
          <button type="button" className="tc-trigger" data-testid="template-copy-open" disabled={!st.doc || st.readOnly}>
            <Copy size={15} aria-hidden /> {label}
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="gp-overlay" />
          <Dialog.Content className="gp-dialog tc-dialog" data-testid="template-dialog" aria-describedby="tc-warning">
            <Dialog.Title className="gp-dialog-title" ref={title} tabIndex={-1}>{step === 'pick' ? 'Choose AeroLink rows to use as a template' : 'Review exactly what would be copied'}</Dialog.Title>
            <p className="tc-warning" id="tc-warning" role="note">
              <strong>{TEMPLATE_WARNING}</strong>
            </p>
            {step === 'pick' ? (
              <>
                <fieldset className="tc-list">
                  <legend>AeroLink stakeholders (instructor example). Tick a row to copy it; tick “with its concerns” to copy its concern text too.</legend>
                  <ul>
                    {PRACTICE_STAKEHOLDERS.map((s) => (
                      <li key={s.id}>
                        <label>
                          <input type="checkbox" checked={picked.includes(s.id)} onChange={(e) => { setPicked(toggle(picked, s.id, e.target.checked)); if (!e.target.checked) setWithConcerns(toggle(withConcerns, s.id, false)) }} />
                          <span><span className="gp-mono">{s.id}</span> {s.name} (role: {s.detail})</span>
                        </label>
                        {picked.includes(s.id) && s.concerns.length > 0 && (
                          <label className="tc-sub">
                            <input type="checkbox" checked={withConcerns.includes(s.id)} onChange={(e) => setWithConcerns(toggle(withConcerns, s.id, e.target.checked))} />
                            <span>with its {s.concerns.length === 1 ? 'concern' : `${s.concerns.length} concerns`} (AeroLink-specific text)</span>
                          </label>
                        )}
                      </li>
                    ))}
                  </ul>
                </fieldset>
                <div className="gp-actions">
                  <button type="button" className="gp-btn course" disabled={!picked.length} onClick={() => setStep('review')} data-testid="template-review">
                    Review {picked.length ? `${picked.length} row${picked.length === 1 ? '' : 's'}` : ''}
                  </button>
                  <Dialog.Close asChild><button type="button" className="gp-btn">Cancel</button></Dialog.Close>
                </div>
              </>
            ) : (
              <>
                <p>These items would be added to your project, each with a new ID from your project and the mark “Template from AeroLink — adapt before use”:</p>
                {planNote && <p className="tc-note" role="alert" data-testid="template-plan-changed">{planNote}</p>}
                <ul className="tc-plan" data-testid="template-plan">
                  {plan.map((p) => (
                    <li key={p.to}><span className="gp-mono">{p.to}</span> {p.type === 'STK' ? 'stakeholder' : 'concern'} from AeroLink <span className="gp-mono">{p.from}</span> {p.fromName}</li>
                  ))}
                </ul>
                <p><strong>Not copied:</strong> {NOT_COPIED.join('; ')}.</p>
                <label className="gp-readwhy">
                  <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} data-testid="template-understood" />
                  <span>I understand these must be adapted</span>
                </label>
                <div className="gp-actions">
                  <button type="button" className="gp-btn course" disabled={!understood} onClick={confirm} data-testid="template-confirm">
                    Copy {plan.length} item{plan.length === 1 ? '' : 's'} as templates
                  </button>
                  <button type="button" className="gp-btn" onClick={() => setStep('pick')}>Back</button>
                  <Dialog.Close asChild><button type="button" className="gp-btn">Cancel</button></Dialog.Close>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {!st.doc && <p className="tc-note">Templates can be copied once your project exists. <Link to="/project">Create your project</Link>.</p>}
      {msg && <p className="tc-note" role="status" data-testid="template-msg">{msg}</p>}
    </div>
  )
}
