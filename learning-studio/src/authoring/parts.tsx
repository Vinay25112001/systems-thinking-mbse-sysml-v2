// Building blocks of the instructor content editor (M3, spec §h H2, H3, H5): the block editor of a Learn section, the
// course introduction and settings forms, the validation panel, the revision compare view, state chips and the
// confirmation dialog used by every destructive or student-visible action.
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowDown, ArrowUp, Lock, Plus, Trash2 } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { studentCitation } from '../week1/learn/studentText'
import { blockText, diffBodies, summaryText, type UnitDiff } from '../publishing/diff'
import { EDITABLE_BLOCK_KINDS, type BodyBlock, type CourseIntroBody, type CourseSettingsBody, type ItemKind, type SectionBody, type Validation, type AnyBody, type ContentState } from '../publishing/types'

// ------------------------------------------------------------------------------------------- chips and dialog
const STATE_LABEL: Record<ContentState, string> = { draft: 'Draft', 'ready-for-review': 'Ready for review', published: 'Published', superseded: 'Superseded', archived: 'Withdrawn' }
export function StateChip({ state, seq, testid }: { state: ContentState | 'code'; seq?: number; testid?: string }) {
  if (state === 'code') return <span className="au-chip is-code">Code-authored</span>
  return (
    <span className={`au-chip is-${state}`} data-testid={testid}>
      {STATE_LABEL[state]}
      {seq ? ` r${seq}` : ''}
    </span>
  )
}

export function Confirm({ open, title, children, confirm, danger = false, busy = false, disabled = false, onConfirm, onClose, testid }: { open: boolean; title: string; children: ReactNode; confirm: string; danger?: boolean; busy?: boolean; disabled?: boolean; onConfirm: () => void; onClose: () => void; testid?: string }) {
  const id = useId()
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="au-overlay" />
        <Dialog.Content className="au-dialog" aria-describedby={`${id}-d`} data-testid={testid}>
          <Dialog.Title className="au-dialog-title">{title}</Dialog.Title>
          <div id={`${id}-d`} className="au-dialog-body">
            {children}
          </div>
          <div className="au-dialog-actions">
            <Dialog.Close asChild>
              <button type="button" className="au-btn">
                Cancel
              </button>
            </Dialog.Close>
            <button type="button" className={`au-btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm} disabled={busy || disabled} data-testid={testid ? `${testid}-confirm` : undefined}>
              {busy ? 'Working…' : confirm}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ------------------------------------------------------------------------------------------- validation panel (H3)
export function ValidationPanel({ v, title = 'Validation' }: { v: Validation | null; title?: string }) {
  if (!v) return null
  const ok = !v.errors.length
  return (
    <section className="au-card" aria-labelledby="au-val-h" data-testid="validation-panel">
      <header className="au-card-head">
        <h2 id="au-val-h" className="au-h2">
          {title}
        </h2>
        <span className={`au-chip ${ok ? 'is-published' : 'is-error'}`} data-testid="validation-status">
          {ok ? 'No errors' : `${v.errors.length} error${v.errors.length > 1 ? 's' : ''}`}
        </span>
      </header>
      {ok && !v.warnings.length && <p className="au-muted au-small">Every citation is in the register and within its verified pages; no internal codes, slide pointers or pending wording in student text; quotations unchanged; read-only blocks intact.</p>}
      <ul className="au-issues">
        {v.errors.map((i, k) => (
          <li key={`e${k}`} className="is-error" data-testid="validation-error">
            <strong>{i.where}:</strong> {i.message}
          </li>
        ))}
        {v.warnings.map((i, k) => (
          <li key={`w${k}`} className="is-warning" data-testid="validation-warning">
            <strong>{i.where}:</strong> {i.message}
          </li>
        ))}
      </ul>
      {!ok && <p className="au-small">Errors block “Mark ready” and publishing. The draft can still be saved.</p>}
    </section>
  )
}

// ------------------------------------------------------------------------------------------- Learn section editor (H2)
const KIND_LABEL: Record<string, string> = { para: 'Paragraph', heading: 'Heading', bullets: 'List', definition: 'Definition', table: 'Table', equation: 'Equation', callout: 'Callout', steps: 'Worked steps', figure: 'Figure', interactive: 'Interactive figure' }
const READ_ONLY_WHY: Record<string, string> = {
  definition: 'Read-only: a quoted definition stays tied to its verified source.',
  table: 'Read-only in this version (tables are computed from the case data).',
  equation: 'Read-only in this version.',
  steps: 'Read-only in this version (worked steps).',
  figure: 'Read-only: figures are code; caption and alt text stay as reviewed.',
  interactive: 'Read-only: an interactive figure.',
}
const editable = (b: BodyBlock) => (EDITABLE_BLOCK_KINDS as readonly string[]).includes(b.kind)
let newSeq = 0

function TextArea({ label, value, onChange, rows = 4, testid }: { label: string; value: string; onChange: (v: string) => void; rows?: number; testid?: string }) {
  const id = useId()
  return (
    <div className="au-field">
      <label htmlFor={id} className="au-label">
        {label}
      </label>
      <textarea id={id} className="au-textarea" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testid} spellCheck />
    </div>
  )
}

export function SectionEditor({ body, onChange }: { body: SectionBody; onChange: (b: SectionBody) => void }) {
  const set = (i: number, b: BodyBlock) => onChange({ ...body, blocks: body.blocks.map((x, k) => (k === i ? b : x)) })
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= body.blocks.length) return
    const blocks = [...body.blocks]
    ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
    onChange({ ...body, blocks })
  }
  const remove = (i: number) => onChange({ ...body, blocks: body.blocks.filter((_, k) => k !== i) })
  const addAfter = (i: number) => {
    const blocks = [...body.blocks]
    blocks.splice(i + 1, 0, { id: `new-${++newSeq}`, kind: 'para', text: '' })
    onChange({ ...body, blocks })
  }
  return (
    <ol className="au-blocks" aria-label="Blocks of this section">
      {body.blocks.map((b, i) => (
        <li key={b.id} className={`au-block${editable(b) ? '' : ' is-readonly'}`} data-testid={`block-${b.id}`}>
          <div className="au-block-head">
            <span className="au-block-kind">
              {!editable(b) && <Lock size={12} aria-hidden />} {KIND_LABEL[b.kind] ?? b.kind}
              {b.optional ? ' · extension reading' : ''}
            </span>
            <span className="au-mono au-small">{b.id.startsWith('new-') ? 'new' : `#${b.id}`}</span>
            <span className="au-block-tools">
              <button type="button" className="au-icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move block ${i + 1} up`}>
                <ArrowUp size={14} aria-hidden />
              </button>
              <button type="button" className="au-icon" onClick={() => move(i, 1)} disabled={i === body.blocks.length - 1} aria-label={`Move block ${i + 1} down`}>
                <ArrowDown size={14} aria-hidden />
              </button>
              {b.kind === 'para' && !b.cites && (
                <button type="button" className="au-icon" onClick={() => remove(i)} aria-label={`Delete paragraph ${i + 1}`} data-testid={`delete-${b.id}`}>
                  <Trash2 size={14} aria-hidden />
                </button>
              )}
            </span>
          </div>
          <BlockFields b={b} onChange={(x) => set(i, x)} n={i + 1} />
          <button type="button" className="au-link au-small" onClick={() => addAfter(i)} data-testid={`add-after-${b.id}`}>
            <Plus size={12} aria-hidden /> Add paragraph below
          </button>
        </li>
      ))}
    </ol>
  )
}

function BlockFields({ b, onChange, n }: { b: BodyBlock; onChange: (b: BodyBlock) => void; n: number }) {
  switch (b.kind) {
    case 'para':
      return (
        <>
          <TextArea label={`Paragraph ${n}`} value={b.text} onChange={(text) => onChange({ ...b, text })} rows={Math.min(12, Math.max(3, Math.ceil(b.text.length / 90)))} testid={`text-${b.id}`} />
          {b.cites && <p className="au-small au-muted">Footnotes attached after this paragraph (read-only): {b.cites.map((c) => studentCitation(c)).join('; ')}</p>}
        </>
      )
    case 'heading':
      return <TextArea label={`Heading ${n}`} value={b.text} onChange={(text) => onChange({ ...b, text })} rows={1} testid={`text-${b.id}`} />
    case 'callout':
      return (
        <>
          {b.title !== undefined && <TextArea label="Callout title" value={b.title} onChange={(title) => onChange({ ...b, title })} rows={1} />}
          <TextArea label={`Callout text (${b.tone})`} value={b.text} onChange={(text) => onChange({ ...b, text })} rows={3} testid={`text-${b.id}`} />
        </>
      )
    case 'bullets':
      return (
        <div>
          {b.items.map((it, k) =>
            typeof it === 'string' ? (
              <TextArea key={k} label={`Item ${k + 1}`} value={it} rows={2} onChange={(v) => onChange({ ...b, items: b.items.map((x, j) => (j === k ? v : x)) })} />
            ) : (
              <div key={k} className="au-subitems">
                <TextArea label={`Item ${k + 1}`} value={it.text} rows={2} onChange={(v) => onChange({ ...b, items: b.items.map((x, j) => (j === k ? { ...it, text: v } : x)) })} />
                {it.sub.map((s, m) => (
                  <TextArea key={m} label={`Item ${k + 1}.${m + 1}`} value={s} rows={2} onChange={(v) => onChange({ ...b, items: b.items.map((x, j) => (j === k ? { ...it, sub: it.sub.map((y, q) => (q === m ? v : y)) } : x)) })} />
                ))}
              </div>
            ),
          )}
        </div>
      )
    default:
      return (
        <div className="au-readonly">
          <p className="au-readonly-text">{blockText(b)}</p>
          {b.kind === 'definition' && <p className="au-small">Source: {studentCitation(b.source)}</p>}
          <p className="au-small au-muted">{READ_ONLY_WHY[b.kind]}</p>
        </div>
      )
  }
}

// ------------------------------------------------------------------------------------------- course introduction
export function IntroEditor({ body, onChange }: { body: CourseIntroBody; onChange: (b: CourseIntroBody) => void }) {
  const f = (k: 'title' | 'lede' | 'submitNote' | 'savedStatic' | 'start', label: string, rows = 2) => <TextArea label={label} value={body[k]} onChange={(v) => onChange({ ...body, [k]: v })} rows={rows} testid={`intro-${k}`} />
  return (
    <div className="au-form" data-testid="intro-editor">
      <fieldset className="au-fieldset">
        <legend>Opening</legend>
        {f('title', 'Title', 1)}
        {f('lede', 'Lede', 3)}
      </fieldset>
      <fieldset className="au-fieldset">
        <legend>What the course teaches</legend>
        {body.what.map((p, i) => (
          <div key={i}>
            <TextArea label={`Paragraph ${i + 1}${p.label ? ' (course framing)' : ''}`} value={p.text} rows={3} onChange={(v) => onChange({ ...body, what: body.what.map((x, k) => (k === i ? { ...x, text: v } : x)) })} testid={`intro-what-${i}`} />
            {p.quote && (
              <p className="au-readonly au-small">
                <Lock size={12} aria-hidden /> Quoted definition (read-only): “{p.quote.text}” — {p.quote.attribution} {studentCitation(p.quote.cite)}
              </p>
            )}
            {p.cite && <p className="au-small au-muted">Footnote (read-only): {studentCitation(p.cite)}</p>}
          </div>
        ))}
      </fieldset>
      <fieldset className="au-fieldset">
        <legend>Two phases, one enterprise</legend>
        {body.phases.map((p, i) => (
          <TextArea key={i} label={`Paragraph ${i + 1} (course framing)`} value={p.text} rows={3} onChange={(v) => onChange({ ...body, phases: body.phases.map((x, k) => (k === i ? { ...x, text: v } : x)) })} />
        ))}
      </fieldset>
      <fieldset className="au-fieldset">
        <legend>AeroLink and your enterprise</legend>
        {body.aerolink.map((t, i) => (
          <TextArea key={`a${i}`} label={`AeroLink sentence ${i + 1}`} value={t} rows={2} onChange={(v) => onChange({ ...body, aerolink: body.aerolink.map((x, k) => (k === i ? v : x)) })} />
        ))}
        {body.enterprise.map((t, i) => (
          <TextArea key={`e${i}`} label={`Enterprise sentence ${i + 1}`} value={t} rows={2} onChange={(v) => onChange({ ...body, enterprise: body.enterprise.map((x, k) => (k === i ? v : x)) })} />
        ))}
      </fieldset>
      <fieldset className="au-fieldset">
        <legend>What you submit</legend>
        {body.submit.map((s, i) => (
          <div key={i} className="au-pair">
            <TextArea label={`Submission ${i + 1}`} value={s.what} rows={1} onChange={(v) => onChange({ ...body, submit: body.submit.map((x, k) => (k === i ? { ...x, what: v } : x)) })} />
            <TextArea label="Detail" value={s.detail} rows={1} onChange={(v) => onChange({ ...body, submit: body.submit.map((x, k) => (k === i ? { ...x, detail: v } : x)) })} />
          </div>
        ))}
        {f('submitNote', 'Note under the list', 2)}
      </fieldset>
      <fieldset className="au-fieldset">
        <legend>How the site is organized</legend>
        {body.stages.map((s, i) => (
          <TextArea key={s.id} label={`${s.label} (stage name read-only)`} value={s.line} rows={1} onChange={(v) => onChange({ ...body, stages: body.stages.map((x, k) => (k === i ? { ...x, line: v } : x)) })} />
        ))}
        {f('savedStatic', 'Static-edition note', 2)}
        {f('start', 'Start button', 1)}
      </fieldset>
    </div>
  )
}

export function SettingsEditor({ body, onChange }: { body: CourseSettingsBody; onChange: (b: CourseSettingsBody) => void }) {
  const id = useId()
  return (
    <div className="au-form" data-testid="settings-editor">
      <div className="au-field">
        <label htmlFor={`${id}-l`} className="au-label">
          Department label
        </label>
        <input id={`${id}-l`} className="au-input" value={body.department_label} onChange={(e) => onChange({ ...body, department_label: e.target.value })} aria-describedby={`${id}-h`} data-testid="settings-department" />
        <p id={`${id}-h`} className="au-small au-muted">
          Enter only an authorised department name. Students see “Wright State University” alone until the name is set and marked verified. No logos, seals or endorsements are shown (DECISION_LOG A24).
        </p>
      </div>
      <label className="au-check">
        <input type="checkbox" checked={body.department_label_verified} onChange={(e) => onChange({ ...body, department_label_verified: e.target.checked })} data-testid="settings-verified" /> The faculty owner confirmed this name and its use
      </label>
    </div>
  )
}

export function BodyEditor({ kind, body, onChange }: { kind: ItemKind; body: AnyBody; onChange: (b: AnyBody) => void }) {
  if (kind === 'learn-section') return <SectionEditor body={body as SectionBody} onChange={onChange} />
  if (kind === 'course-intro') return <IntroEditor body={body as CourseIntroBody} onChange={onChange} />
  return <SettingsEditor body={body as CourseSettingsBody} onChange={onChange} />
}

// ------------------------------------------------------------------------------------------- compare (H5)
const CHANGE_LABEL: Record<UnitDiff['change'], string> = { same: 'unchanged', added: 'added', removed: 'removed', changed: 'changed', moved: 'moved' }
export function DiffView({ kind, before, after, beforeLabel, afterLabel }: { kind: ItemKind; before: AnyBody | null; after: AnyBody; beforeLabel: string; afterLabel: string }) {
  const [all, setAll] = useState(false)
  const d = diffBodies(kind, before, after)
  const shown = all ? d.units : d.units.filter((u) => u.change !== 'same')
  return (
    <div data-testid="diff-view">
      <p className="au-small">
        <strong>
          {beforeLabel} → {afterLabel}:
        </strong>{' '}
        <span data-testid="diff-summary">{summaryText(d.summary)}</span>; words {d.summary.wordDelta >= 0 ? '+' : ''}
        {d.summary.wordDelta}.{' '}
        <label className="au-check au-inline">
          <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> show unchanged blocks
        </label>
      </p>
      {!shown.length && <p className="au-muted au-small">No differences.</p>}
      <ol className="au-diff">
        {shown.map((u) => (
          <li key={`${u.change}-${u.id}`} className={`is-${u.change}`} data-testid={`diff-${u.change}`}>
            <p className="au-diff-head">
              <span className={`au-chip is-diff-${u.change}`}>{CHANGE_LABEL[u.change]}</span> <span className="au-small">{u.label}</span>
            </p>
            <p className="au-diff-text">
              {u.words
                ? u.words.map((w, i) => (w.op === 'eq' ? <span key={i}>{w.text}</span> : w.op === 'add' ? <ins key={i}>{w.text}</ins> : <del key={i}>{w.text}</del>))
                : u.after}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
