// Guided Practice building blocks (M5): the three feedback blocks (spec §e.3, each with its own icon, word and border so
// students can tell them apart), the per-item agreement word, a segmented radio group (native radios: arrow keys move
// within a group), and the confirmation dialog for resets (spec GP-22).
import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, CheckCircle2, Info, Lightbulb, Target } from 'lucide-react'
import { useId, useRef, type ReactNode } from 'react'
import type { FeedbackKind } from './feedback'

const KIND_LABEL: Record<FeedbackKind, string> = { structural: 'Course check', compared: 'Compared with the instructor’s reading', reveal: 'Reasoning' }

/** One feedback block. `tone` only for the structural check: pass or not yet. */
export function Feedback({ kind, tone, title, children, testId }: { kind: FeedbackKind; tone?: 'pass' | 'fail'; title: ReactNode; children?: ReactNode; testId?: string }) {
  const icon = kind === 'compared' ? <Target size={16} aria-hidden /> : kind === 'reveal' ? <Lightbulb size={16} aria-hidden /> : tone === 'pass' ? <CheckCircle2 size={16} aria-hidden /> : <AlertTriangle size={16} aria-hidden />
  return (
    <section className={`gp-fb gp-fb-${kind}${tone ? ` is-${tone}` : ''}`} data-testid={testId ?? `fb-${kind}`} data-feedback={kind} aria-label={KIND_LABEL[kind]}>
      <p className="gp-fb-title">
        {icon}
        <span>{title}</span>
      </p>
      {children && <div className="gp-fb-body">{children}</div>}
    </section>
  )
}

/** Moves to an explanation block on this page without touching the hash route (review M5-01: a raw `#why-…` link
 *  would be read by the hash router as a route and leave the page). */
export function goToWhy(id: string) {
  const el = document.getElementById(`why-${id}`)
  if (!el) return
  el.scrollIntoView?.({ block: 'center' })
  el.focus({ preventScroll: true })
}

/** The per-item word after a check: never colour alone, never "correct" or "wrong". `why` = the item whose explanation
 *  block "read why" moves to. */
export function Agreement({ agrees, changed, why }: { agrees: boolean; changed?: boolean; why?: string }) {
  if (changed) return <span className="gp-agree is-changed"><Info size={14} aria-hidden /> Changed since the last check</span>
  return agrees ? (
    <span className="gp-agree is-agree"><CheckCircle2 size={14} aria-hidden /> Agrees</span>
  ) : (
    <span className="gp-agree is-differ">
      <Info size={14} aria-hidden /> Differs · {why ? <button type="button" className="gp-linkbtn" onClick={() => goToWhy(why)}>read why</button> : 'read why'}
    </span>
  )
}

/** A row of mutually exclusive choices as native radio buttons (keyboard: Tab into the group, arrows to move). */
export function Choice<V extends string>({ legend, options, value, onChange, name, compact = false, hideLegend = false, disabled = false }: { legend: string; options: { id: V; label: string }[]; value: V | undefined; onChange: (v: V) => void; name?: string; compact?: boolean; hideLegend?: boolean; disabled?: boolean }) {
  const auto = useId()
  const group = name ?? auto
  return (
    <fieldset className={`gp-choice${compact ? ' is-compact' : ''}`} disabled={disabled}>
      <legend className={hideLegend ? 'sr-only' : ''}>{legend}</legend>
      <div className="gp-choice-opts">
        {options.map((o) => (
          <label key={o.id} className={value === o.id ? 'is-on' : ''}>
            <input type="radio" name={group} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** "I have read why": acknowledges a difference (spec §e.3); the alternative is to change the answer. */
export function ReadWhy({ checked, onChange, label = 'I have read why (or change my answer above)' }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="gp-readwhy">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

/** Confirmation for a destructive action (reset). The dialog says what is cleared and that the project is not affected. */
/** Initial focus is on Cancel, the safe action; on close focus returns to `returnFocus` (review M5-08). */
export function ConfirmDialog({ open, onOpenChange, title, body, confirm, onConfirm, testId, returnFocus }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; body: ReactNode; confirm: string; onConfirm: () => void; testId?: string; returnFocus?: () => HTMLElement | null }) {
  const bodyId = useId()
  const cancel = useRef<HTMLButtonElement>(null)
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="gp-overlay" />
        <Dialog.Content
          className="gp-dialog"
          role="alertdialog"
          data-testid={testId ?? 'gp-confirm'}
          aria-describedby={bodyId}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            cancel.current?.focus()
          }}
          onCloseAutoFocus={(e) => {
            const el = returnFocus?.()
            if (el && document.contains(el)) {
              e.preventDefault()
              el.focus()
            }
          }}
        >
          <Dialog.Title className="gp-dialog-title">{title}</Dialog.Title>
          <div className="gp-dialog-body" id={bodyId}>{body}</div>
          <div className="gp-actions">
            <button type="button" className="gp-btn danger" onClick={onConfirm} data-testid="gp-confirm-yes">
              {confirm}
            </button>
            <Dialog.Close asChild>
              <button type="button" className="gp-btn" data-testid="gp-confirm-cancel" ref={cancel}>
                Cancel
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export const Mono = ({ children }: { children: ReactNode }) => <span className="gp-mono">{children}</span>
