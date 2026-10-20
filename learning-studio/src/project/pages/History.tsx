// Revision history (roadmap §2.2): every change set (time, self-declared initials, source, summary, rationale,
// expandable field diffs with before and after), the saved versions (manual, milestone, pre-import, pre-restore,
// automatic) with Restore as current (confirmation, a pre-restore snapshot, recorded as a new change set) and Export this
// version; the self-declared editor, storage persistence and quota.
import { useState } from 'react'
import { ownerProblem } from '../../components/ProvenanceOwnerFields'
import { downloadText } from '../../workbench/download'
import type { AttrValue, ChangeSet, Operation, ProjectDoc } from '../model/types'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { exportFileName, exportProjectText } from '../transfer/exportProject'
import { Chip, EmptyState, fmtDate } from './ui'

const val = (v: AttrValue | undefined) => (v === undefined ? '(none)' : typeof v === 'string' ? (v.length > 140 ? `${v.slice(0, 138)}…` : v || '(empty)') : JSON.stringify(v).slice(0, 140))
function opLines(doc: ProjectDoc, op: Operation): string[] {
  const id = (u: string) => doc.artifacts[u]?.id ?? doc.relationships[u]?.id ?? u.slice(0, 8)
  switch (op.op) {
    case 'create-artifact':
      return [`Added ${op.artifact.id}${op.artifact.title ? ` “${op.artifact.title}”` : ''}`]
    case 'retire-artifact':
      return [`Retired ${id(op.uid)}: ${op.reason}`]
    case 'restore-artifact':
      return [`Restored ${id(op.uid)}`]
    case 'create-relationship':
      return [`Added relationship ${op.relationship.id} (${op.relationship.type || 'draft'})`]
    case 'retire-relationship':
      return [`Retired relationship ${id(op.uid)}: ${op.reason}`]
    case 'set-review':
      return [`${id(op.uid)}: review ${op.before.state} → ${op.after.state}`]
    case 'renumber-artifact':
      return [`Renumbered ${op.from} → ${op.to}`]
    default:
      return 'fields' in op ? op.fields.map((f) => `${'uid' in op ? id(op.uid) : op.op.replace('update-', '')} ${f.path}: ${val(f.before)} → ${val(f.after)}`) : [op.op]
  }
}

function Change({ c, doc }: { c: ChangeSet; doc: ProjectDoc }) {
  const [open, setOpen] = useState(false)
  const lines = c.ops.flatMap((o) => opLines(doc, o))
  return (
    <li style={{ padding: '10px 0', borderBottom: '1px solid var(--pj-line)' }} data-testid="change-row">
      <div className="pj-row" style={{ justifyContent: 'space-between' }}>
        <span>
          <span className="pj-mono">{c.id}</span> · <strong>{c.summary}</strong>
        </span>
        <span className="pj-caption">
          {fmtDate(c.at)} · {c.by ? `${c.by} (self-declared)` : 'initials not recorded'} · {c.source} · rev {c.rev}
        </span>
      </div>
      {c.rationale && <p className="pj-small" style={{ margin: '4px 0 0' }}>Rationale: {c.rationale}</p>}
      {lines.length > 0 && (
        <button type="button" className="pj-btn link pj-small" aria-expanded={open} onClick={() => setOpen((x) => !x)}>
          {open ? 'Hide' : 'Show'} what changed ({lines.length})
        </button>
      )}
      {open && (
        <ul className="pj-diff">
          {lines.slice(0, 60).map((l, i) => (
            <li key={i}>{l}</li>
          ))}
          {lines.length > 60 && <li>and {lines.length - 60} more</li>}
        </ul>
      )}
    </li>
  )
}

export function History() {
  const st = useProjectState()
  const store = useProjectStore()!
  const doc = st.doc!
  const [restoring, setRestoring] = useState<string | null>(null)
  const [why, setWhy] = useState('')
  const [msg, setMsg] = useState('')
  const [ini, setIni] = useState(st.editor)
  const restore = async (id: string) => {
    const r = await store.restore(id, why.trim())
    setMsg(r.ok ? `Restored ${id} as the current version; the state before it was saved as a pre-restore version.` : `Not restored: ${r.error}`)
    setRestoring(null)
    setWhy('')
  }
  const exportVersion = async (id: string) => {
    const s = await store.getSnapshot(id)
    if (!s) return
    const ok = downloadText(exportFileName(s.doc).replace('.json', `-${s.id}.json`), await exportProjectText(s.doc, { exportedBy: st.editor, includesHistory: false }), 'application/json')
    setMsg(ok ? `Exported ${s.id}.` : 'The browser blocked the download.')
  }
  const changes = [...st.changes].reverse()
  return (
    <div className="pj-stack" data-testid="project-history">
      <div>
        <h1 className="pj-h1">History</h1>
        <p className="pj-lede">Every change is kept with its before and after values. Who changed what is recorded as self-declared initials: an honest log, not proof of authorship. Restoring never deletes history; it adds a revision.</p>
      </div>
      {msg && <p className="pj-small" role="status">{msg}</p>}
      <div className="pj-grid two">
        <section className="pj-card" aria-labelledby="h-ch">
          <h2 id="h-ch" className="pj-h2">Changes ({changes.length})</h2>
          {changes.length ? <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>{changes.map((c) => <Change key={c.id} c={c} doc={doc} />)}</ol> : <EmptyState title="No changes yet">Edits in the Week 1 lab tool appear here, one entry per meaningful change (keystrokes on the same field within a minute are merged).</EmptyState>}
        </section>
        <div className="pj-stack">
          <section className="pj-card" aria-labelledby="h-v">
            <h2 id="h-v" className="pj-h2">Versions ({st.snapshots.length})</h2>
            {st.snapshots.length ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {[...st.snapshots].reverse().map((s) => (
                  <li key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--pj-line)' }} data-testid="version-row">
                    <div className="pj-row" style={{ justifyContent: 'space-between' }}>
                      <span className="pj-small">
                        <span className="pj-mono">{s.id}</span> <Chip tone={s.kind === 'manual' || s.kind === 'milestone' ? 'project' : 'neutral'}>{s.kind}</Chip>
                      </span>
                      <span className="pj-caption">{fmtDate(s.at)} · rev {s.rev}</span>
                    </div>
                    <p className="pj-small" style={{ margin: '2px 0 4px' }}>{s.label}</p>
                    <div className="pj-row">
                      <button type="button" className="pj-btn small" onClick={() => setRestoring(s.id)} data-testid={`restore-${s.id}`}>
                        Restore as current…
                      </button>
                      <button type="button" className="pj-btn small" onClick={() => void exportVersion(s.id)}>
                        Export this version
                      </button>
                    </div>
                    {restoring === s.id && (
                      <div className="pj-card flat" style={{ marginTop: 8 }} role="group" aria-label={`Restore ${s.id}`}>
                        <p className="pj-small" style={{ marginTop: 0 }}>Restore {s.id} ({s.label}) as the current version? The current state is saved first as a pre-restore version, so this can be undone.</p>
                        <label className="pj-field">
                          <span>Rationale</span>
                          <input className="pj-input" value={why} onChange={(e) => setWhy(e.target.value)} data-testid="restore-rationale" />
                        </label>
                        <div className="pj-row" style={{ marginTop: 8 }}>
                          <button type="button" className="pj-btn primary" disabled={!why.trim()} onClick={() => void restore(s.id)} data-testid="restore-confirm">
                            Restore
                          </button>
                          <button type="button" className="pj-btn" onClick={() => setRestoring(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No saved versions yet">Save a version from the Overview (“Save version”). Versions are also saved automatically once a day, before every import and restore, and at every export for submission.</EmptyState>
            )}
          </section>
          <section className="pj-card" aria-labelledby="h-e">
            <h2 id="h-e" className="pj-h2">Who is editing in this browser</h2>
            <div className="pj-row" style={{ flexWrap: 'nowrap', alignItems: 'flex-end' }}>
              <label className="pj-field">
                <span>Your initials (self-declared)</span>
                <input className="pj-input" value={ini} maxLength={4} onChange={(e) => setIni(e.target.value)} aria-invalid={!!(ini.trim() && ownerProblem(ini))} />
              </label>
              <button type="button" className="pj-btn" disabled={!!(ini.trim() && ownerProblem(ini))} onClick={() => void store.setEditor(ini).then(() => setMsg(`Changes from now on are recorded as ${ini.trim().toUpperCase() || 'not recorded'}.`))}>
                Use these initials
              </button>
            </div>
            {st.editor && !doc.team.members.some((m) => m.initials === st.editor) && <p className="pj-caption">{st.editor} is not one of the team’s role holders in the charter: changes are accepted and recorded as self-declared.</p>}
            <h3 className="pj-h3" style={{ marginTop: 14 }}>Storage</h3>
            <ul className="pj-small" style={{ margin: 0, paddingLeft: 18 }}>
              <li>{st.storage === 'indexeddb' ? 'Saved in this browser’s IndexedDB storage.' : 'Not saved: kept in this tab only.'}</li>
              <li>Persistent storage: {st.persisted === 'granted' ? 'granted (the browser will not clear it on its own)' : st.persisted === 'denied' ? 'not granted (the browser may clear it under storage pressure)' : 'not known'}.</li>
              {st.quota && <li>Space used: {(st.quota.usage / 1e6).toFixed(1)} MB of {(st.quota.quota / 1e6).toFixed(0)} MB{st.quota.usage / st.quota.quota > 0.8 ? ' — over 80 %: export and delete old automatic versions' : ''}.</li>}
              <li>Clearing site data, another browser or another computer means an empty store: the export is the durable copy.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
