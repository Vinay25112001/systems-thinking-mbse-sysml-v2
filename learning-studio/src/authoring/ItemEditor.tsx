// H2 editor, H3 validation, H5 compare, H6 publish plan and confirm, H7 history and restore (spec §h) for one content
// item. The working copy is local until "Save draft"; the server normalises and validates every save (its answer
// replaces the working copy), and the same validator runs here for live feedback. Destructive and student-visible
// actions (discard, restore, withdraw, publish) are confirmed in a dialog.
import { Eye, History, Save, Send } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, navigate } from '../lib/router'
import { summaryText } from '../publishing/diff'
import type { AnyBody, RevisionMeta, Validation } from '../publishing/types'
import { validateBody } from '../publishing/validate'
import { ApiFailure } from '../services/backend'
import * as A from './api'
import { authoringPath } from './EditLink'
import { BodyEditor, Confirm, DiffView, StateChip, ValidationPanel } from './parts'

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—')
const msgOf = (e: unknown, fallback: string) => (e instanceof ApiFailure ? e.error.message : fallback)
type Save = { kind: 'idle' | 'dirty' | 'saving' | 'saved' | 'failed' | 'conflict'; at?: string; message?: string }

export function ItemEditor({ id, onChanged }: { id: string; onChanged: () => void }) {
  const [d, setD] = useState<A.ItemDetail | null>(null)
  const [body, setBody] = useState<AnyBody | null>(null)
  const [version, setVersion] = useState<number | null>(null)
  const [save, setSave] = useState<Save>({ kind: 'idle' })
  const [serverV, setServerV] = useState<Validation | null>(null)
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'validation' | 'history' | 'compare'>('validation')
  const [dialog, setDialog] = useState<null | 'publish' | 'discard' | 'archive' | { restore: RevisionMeta }>(null)
  const [busy, setBusy] = useState(false)
  const [cmp, setCmp] = useState<{ a: string; b: string }>({ a: '', b: '' })
  const [revBodies, setRevBodies] = useState<Record<string, AnyBody>>({})

  const load = useCallback(async () => {
    try {
      const x = await A.getItem(id)
      setD(x)
      setBody(structuredClone(x.draft?.body ?? x.published?.body ?? x.seed))
      setVersion(x.draft?.meta.version ?? null)
      setServerV(x.draft?.validation ?? null)
      setSave({ kind: x.draft ? 'saved' : 'idle', at: x.draft?.meta.updatedAt })
      const bodies: Record<string, AnyBody> = {}
      if (x.published) bodies[x.published.meta.id] = x.published.body
      if (x.draft) bodies[x.draft.meta.id] = x.draft.body
      setRevBodies(bodies)
      setCmp({ a: x.published?.meta.id ?? x.revisions.find((r) => r.state !== 'draft' && r.state !== 'ready-for-review')?.id ?? '', b: x.draft?.meta.id ?? 'working' })
    } catch (e) {
      setMsg(msgOf(e, 'The item could not be loaded.'))
    }
  }, [id])
  useEffect(() => {
    setD(null)
    setMsg('')
    void load()
  }, [load])
  useEffect(() => {
    if (save.kind !== 'dirty') return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [save.kind])

  const live = useMemo(() => (d && body ? validateBody(d.item.kind, body, d.seed).validation : null), [d, body])
  if (!d || !body) return <div className="au-main">{msg ? <p role="alert">{msg}</p> : <p className="au-muted">Loading…</p>}</div>
  const draft = d.draft
  const pub = d.published
  const kind = d.item.kind
  const errors = (live?.errors.length ?? 0) > 0
  const dirty = save.kind === 'dirty'
  const baseSeq = draft?.meta.baseRevisionId ? d.revisions.find((r) => r.id === draft.meta.baseRevisionId)?.seq : undefined

  const edit = (b: AnyBody) => {
    setBody(b)
    setSave({ kind: 'dirty' })
  }
  const doSave = async (): Promise<boolean> => {
    setSave({ kind: 'saving' })
    try {
      const r = await A.saveDraft(id, body, version)
      setBody(r.body)
      setVersion(r.draft.version)
      setServerV(r.validation)
      setSave({ kind: 'saved', at: r.draft.updatedAt })
      setMsg('')
      const x = await A.getItem(id)
      setD(x)
      setRevBodies((m) => ({ ...m, [r.draft.id]: r.body }))
      setCmp((c) => ({ ...c, b: r.draft.id }))
      onChanged()
      return true
    } catch (e) {
      const conflict = e instanceof ApiFailure && e.error.status === 409
      setSave({ kind: conflict ? 'conflict' : 'failed', message: msgOf(e, 'The draft could not be saved.') })
      return false
    }
  }
  const act = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true)
    try {
      await fn()
      setMsg(ok)
      setDialog(null)
      await load()
      onChanged()
    } catch (e) {
      setMsg(msgOf(e, 'That did not work.'))
      if (e instanceof ApiFailure && e.error.data.validation) setServerV(e.error.data.validation as Validation)
    } finally {
      setBusy(false)
    }
  }
  const openPreview = async () => {
    if (dirty && !(await doSave())) return
    navigate(`/authoring/preview/${encodeURIComponent(id)}`)
  }
  const compareBody = async (rev: string): Promise<AnyBody | null> => {
    if (rev === 'working') return body
    if (revBodies[rev]) return revBodies[rev]
    const r = await A.getRevision(id, rev)
    setRevBodies((m) => ({ ...m, [rev]: r.body }))
    return r.body
  }
  const seqOf = (rev: string) => (rev === 'working' ? 'working copy' : `r${d.revisions.find((r) => r.id === rev)?.seq ?? '?'}`)

  return (
    <div className="au-editor" data-testid="item-editor">
      <section className="au-main au-card" aria-labelledby="au-item-h">
        <header className="au-edit-head">
          <div>
            <p className="au-small au-muted" data-testid="draft-banner">
              {draft ? (
                <>
                  Draft r{draft.meta.seq}
                  {draft.meta.restoredFromSeq ? ` · restored from r${draft.meta.restoredFromSeq}` : ''}
                  {baseSeq ? ` · based on published r${baseSeq}` : ''} · {draft.meta.state === 'ready-for-review' ? 'ready for review' : 'edited'} by {draft.meta.author}, {when(draft.meta.updatedAt)}
                </>
              ) : pub ? (
                <>Published r{pub.meta.seq} · editing creates a draft; students keep seeing r{pub.meta.seq} until you publish</>
              ) : (
                <>Withdrawn from students · restore a version from the history, or edit to start a draft</>
              )}
            </p>
            <h1 id="au-item-h" className="au-h1">
              {d.item.title}
            </h1>
            <p className="au-mono au-small au-muted">{d.item.id}</p>
          </div>
          <p className={`au-save is-${save.kind}`} role="status" aria-live="polite" data-testid="save-state">
            {save.kind === 'dirty' ? 'Unsaved changes' : save.kind === 'saving' ? 'Saving…' : save.kind === 'saved' ? `Draft saved · ${new Date(save.at ?? '').toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : save.kind === 'failed' ? 'Save failed' : save.kind === 'conflict' ? 'Conflict: not saved' : pub ? `Published r${pub.meta.seq}` : ''}
          </p>
        </header>
        {draft?.stale && (
          <p className="au-alert is-warning" role="note" data-testid="stale-warning">
            A newer version was published or withdrawn after this draft started. Compare the draft with the published version before publishing; the publish step asks you to confirm.
          </p>
        )}
        {d.item.codeChanged && (
          <p className="au-alert is-warning" role="note">
            The TypeScript source of this item changed after the store was seeded. On the course server the store is authoritative; offline editions show the code version.
          </p>
        )}
        {(save.kind === 'failed' || save.kind === 'conflict') && (
          <div className="au-alert is-error" role="alert" data-testid="save-error">
            <p>{save.message}</p>
            {save.kind === 'conflict' && (
              <p>
                <button type="button" className="au-btn small" onClick={() => void load()}>
                  Reload their draft
                </button>{' '}
                <button type="button" className="au-btn small" onClick={() => void navigator.clipboard?.writeText(JSON.stringify(body, null, 2))}>
                  Copy my text
                </button>
              </p>
            )}
          </div>
        )}
        {msg && (
          <p className="au-alert" role="status" data-testid="editor-message">
            {msg}
          </p>
        )}
        <div className="au-actions">
          <button type="button" className={`au-btn${dirty ? ' primary' : ''}`} onClick={() => void doSave()} disabled={!dirty || save.kind === 'saving'} data-testid="save-draft">
            <Save size={15} aria-hidden /> Save draft
          </button>
          <button type="button" className="au-btn" onClick={() => void openPreview()} disabled={!draft && !dirty} data-testid="preview-as-student" title={!draft && !dirty ? 'Edit and save a draft first' : undefined}>
            <Eye size={15} aria-hidden /> Preview as student
          </button>
          {draft?.meta.state === 'draft' && (
            <button type="button" className="au-btn" onClick={() => void act(() => A.markReady(id, version ?? 0), 'Marked ready for review.')} disabled={dirty || errors || busy} data-testid="mark-ready">
              Mark ready for review
            </button>
          )}
          {draft?.meta.state === 'ready-for-review' && (
            <button type="button" className="au-btn" onClick={() => void act(() => A.returnToDraft(id), 'Returned to draft.')} disabled={busy}>
              Return to draft
            </button>
          )}
          <button type="button" className="au-btn primary" onClick={() => setDialog('publish')} disabled={!draft || dirty || errors} data-testid="review-publish" title={dirty ? 'Save the draft first' : undefined}>
            <Send size={15} aria-hidden /> Review and publish
          </button>
          {draft && (
            <button type="button" className="au-btn danger-quiet" onClick={() => setDialog('discard')} data-testid="discard-draft">
              Discard draft
            </button>
          )}
          {kind === 'learn-section' && pub && (
            <button type="button" className="au-btn danger-quiet" onClick={() => setDialog('archive')} data-testid="withdraw">
              Withdraw from students
            </button>
          )}
        </div>
        <BodyEditor kind={kind} body={body} onChange={edit} />
      </section>

      <aside className="au-side" aria-label="Validation, history and compare">
        <div className="au-tabs" role="tablist" aria-label="Item panels">
          {(['validation', 'history', 'compare'] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} className={`au-tab${tab === t ? ' is-on' : ''}`} onClick={() => setTab(t)} data-testid={`tab-${t}`}>
              {t === 'validation' ? 'Validation' : t === 'history' ? 'History' : 'Compare'}
            </button>
          ))}
        </div>
        {tab === 'validation' && (
          <>
            <ValidationPanel v={live} title="Validation (live)" />
            {serverV && save.kind === 'saved' && JSON.stringify(serverV) !== JSON.stringify(live) && <ValidationPanel v={serverV} title="Validation (last save, server)" />}
          </>
        )}
        {tab === 'history' && (
          <section className="au-card" aria-labelledby="au-hist-h" data-testid="history-panel">
            <h2 id="au-hist-h" className="au-h2">
              <History size={16} aria-hidden /> Publication history
            </h2>
            <ol className="au-history">
              {d.revisions.map((r) => (
                <li key={r.id} data-testid={`history-r${r.seq}`}>
                  <p>
                    <StateChip state={r.state} seq={r.seq} /> <span className="au-small">{when(r.publishedAt ?? r.updatedAt)}</span>
                  </p>
                  <p className="au-small">
                    {r.state === 'published' || r.state === 'superseded' || (r.state === 'archived' && r.publishedAt) ? `Published by ${r.publishedBy}` : `By ${r.author}`}
                    {r.releaseId ? ` · ${r.releaseId}` : ''}
                    {r.restoredFromSeq ? ` · restored from r${r.restoredFromSeq}` : ''}
                    {r.archivedAt ? ` · withdrawn ${when(r.archivedAt)} by ${r.archivedBy}` : ''}
                  </p>
                  {r.changeNote && <p className="au-small au-note">“{r.changeNote}”</p>}
                  <p className="au-small">
                    <button type="button" className="au-link" onClick={() => (setCmp({ a: r.id, b: draft?.meta.id ?? pub?.meta.id ?? 'working' }), setTab('compare'))}>
                      Compare
                    </button>
                    {(r.state === 'superseded' || r.state === 'archived') && (
                      <>
                        {' · '}
                        <button type="button" className="au-link" onClick={() => setDialog({ restore: r })} disabled={!!draft} title={draft ? 'Publish or discard the open draft first' : undefined} data-testid={`restore-r${r.seq}`}>
                          Restore r{r.seq}
                        </button>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ol>
            {draft && <p className="au-small au-muted">Restoring is available when no draft is open (one open draft per item).</p>}
          </section>
        )}
        {tab === 'compare' && <Compare d={d} cmp={cmp} setCmp={setCmp} bodyOf={compareBody} label={seqOf} />}
      </aside>

      <PublishDialog open={dialog === 'publish'} id={id} onClose={() => setDialog(null)} onDone={async (rel, seq) => {
        setDialog(null)
        await load()
        onChanged()
        setMsg(`Published r${seq} to students (${rel}). Students see it after a refresh or when they choose “Show the update”.`)
      }} />
      <Confirm open={dialog === 'discard'} title="Discard this draft?" confirm="Discard draft" danger busy={busy} onClose={() => setDialog(null)} onConfirm={() => void act(() => A.discardDraft(id), 'Draft discarded. The published version is unchanged.')} testid="confirm-discard">
        <p>Draft r{draft?.meta.seq} and its unsaved changes are deleted. The history and the published version are kept; students are not affected.</p>
      </Confirm>
      {typeof dialog === 'object' && dialog && 'restore' in dialog && (
        <Confirm open title={`Restore r${dialog.restore.seq}?`} confirm={`Restore r${dialog.restore.seq} as a new draft`} busy={busy} onClose={() => setDialog(null)} onConfirm={() => void act(() => A.restore(id, dialog.restore.id), `r${dialog.restore.seq} copied into a new draft. Review it, then publish it to make it visible to students.`)} testid="confirm-restore">
          <p>
            A new draft is created as a copy of r{dialog.restore.seq} ({when(dialog.restore.publishedAt ?? dialog.restore.updatedAt)}). Nothing is overwritten: history stays linear, and students keep the current version until you publish the
            restored draft.
          </p>
        </Confirm>
      )}
      <ArchiveDialog open={dialog === 'archive'} busy={busy} onClose={() => setDialog(null)} onConfirm={(note) => void act(() => A.archive(id, note), 'Withdrawn from students. The history is kept; restore a version to bring it back.')} />
      <p className="au-small au-backlink">
        <Link to={authoringPath()}>All content</Link>
      </p>
    </div>
  )
}

function Compare({ d, cmp, setCmp, bodyOf, label }: { d: A.ItemDetail; cmp: { a: string; b: string }; setCmp: (c: { a: string; b: string }) => void; bodyOf: (rev: string) => Promise<AnyBody | null>; label: (rev: string) => string }) {
  const [pair, setPair] = useState<{ a: AnyBody | null; b: AnyBody | null } | null>(null)
  useEffect(() => {
    let live = true
    void Promise.all([cmp.a ? bodyOf(cmp.a) : Promise.resolve(null), bodyOf(cmp.b || 'working')]).then(([a, b]) => live && setPair({ a, b }))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmp.a, cmp.b])
  const opts = [...d.revisions.map((r) => ({ v: r.id, l: `r${r.seq} · ${r.state}` })), { v: 'working', l: 'working copy (unsaved)' }]
  return (
    <section className="au-card" aria-labelledby="au-cmp-h" data-testid="compare-panel">
      <h2 id="au-cmp-h" className="au-h2">
        Compare revisions
      </h2>
      <div className="au-pair">
        <label className="au-label">
          From
          <select className="au-input" value={cmp.a} onChange={(e) => setCmp({ ...cmp, a: e.target.value })} data-testid="compare-a">
            {opts.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
        </label>
        <label className="au-label">
          To
          <select className="au-input" value={cmp.b} onChange={(e) => setCmp({ ...cmp, b: e.target.value })} data-testid="compare-b">
            {opts.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
        </label>
      </div>
      {pair?.b ? <DiffView kind={d.item.kind} before={pair.a} after={pair.b} beforeLabel={label(cmp.a)} afterLabel={label(cmp.b)} /> : <p className="au-muted au-small">Loading…</p>}
    </section>
  )
}

function PublishDialog({ open, id, onClose, onDone }: { open: boolean; id: string; onClose: () => void; onDone: (release: string, seq: number) => void }) {
  const [plan, setPlan] = useState<A.Plan | null>(null)
  const [note, setNote] = useState('')
  const [ack, setAck] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!open) return
    setPlan(null)
    setErr('')
    setNote('')
    setAck(false)
    A.plan([id]).then(setPlan, (e) => setErr(msgOf(e, 'The publish plan could not be made.')))
  }, [open, id])
  const go = async () => {
    if (!plan) return
    setBusy(true)
    setErr('')
    try {
      const r = await A.publish(plan.planToken, note, ack)
      onDone(r.releaseId, plan.items[0]?.to.seq ?? 0)
    } catch (e) {
      setErr(msgOf(e, 'Publishing failed; nothing was changed.'))
    } finally {
      setBusy(false)
    }
  }
  const i = plan?.items[0]
  return (
    <Confirm open={open} title="Publish plan" confirm="Publish to students" busy={busy} disabled={!plan || plan.errors > 0 || note.trim().length < 3 || (plan.stale && !ack)} onClose={onClose} onConfirm={() => void go()} testid="publish-dialog">
      {!plan && !err && <p className="au-muted">Preparing the plan…</p>}
      {plan && i && (
        <dl className="au-plan" data-testid="publish-plan">
          <dt>Item</dt>
          <dd>
            <span className="au-mono">{i.itemId}</span> {i.from ? `r${i.from.seq}` : 'withdrawn'} → r{i.to.seq}
            {i.restoredFromSeq ? ` (restores r${i.restoredFromSeq})` : ''}
          </dd>
          <dt>Changes</dt>
          <dd data-testid="plan-changes">
            {summaryText(i.summary)}; words {i.summary.wordDelta >= 0 ? '+' : ''}
            {i.summary.wordDelta}
          </dd>
          <dt>Validation</dt>
          <dd>{i.validation.errors.length ? `${i.validation.errors.length} error(s): publishing is blocked` : `No errors${i.validation.warnings.length ? `, ${i.validation.warnings.length} warning(s)` : ''}`}</dd>
          <dt>Student data</dt>
          <dd>{plan.studentData}</dd>
          <dt>Readers</dt>
          <dd>Students who read the earlier version see “Updated since you read it”.</dd>
          <dt>Valid until</dt>
          <dd>{new Date(plan.expiresAt).toLocaleTimeString()}</dd>
        </dl>
      )}
      {plan?.stale && (
        <label className="au-check au-alert is-warning">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} data-testid="ack-stale" /> I compared this draft with the newer published version and still want to publish it.
        </label>
      )}
      {plan && (
        <div className="au-field">
          <label htmlFor="au-note" className="au-label">
            Change note (required): what changed and why
          </label>
          <textarea id="au-note" className="au-textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} data-testid="change-note" />
        </div>
      )}
      {err && (
        <p role="alert" className="au-alert is-error">
          {err}
        </p>
      )}
    </Confirm>
  )
}

function ArchiveDialog({ open, busy, onClose, onConfirm }: { open: boolean; busy: boolean; onClose: () => void; onConfirm: (note: string) => void }) {
  const [note, setNote] = useState('')
  return (
    <Confirm open={open} title="Withdraw this section from students?" confirm="Withdraw" danger busy={busy} disabled={note.trim().length < 3} onClose={onClose} onConfirm={() => onConfirm(note)} testid="confirm-withdraw">
      <p>Students stop seeing this section; the remaining sections are renumbered without gaps. The history is kept, and restoring a version brings the section back. Sections that other text refers to by number cannot be withdrawn.</p>
      <div className="au-field">
        <label htmlFor="au-why" className="au-label">
          Reason (required)
        </label>
        <textarea id="au-why" className="au-textarea" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Confirm>
  )
}
