// Instructor review of Week 1 submissions (M6; spec §g.4, RS-30). The submission list by team and state; a submission
// opens its immutable snapshot rendered read-only (the enterprise, mission and objectives, and the artifact tables), the
// validation report the team saw (advisory) with their notes, and a feedback composer: approve, or return for revision
// (comment required), with optional feedback anchored to artifact IDs of the snapshot. The instructor cannot edit the
// snapshot or the live project; the server re-checks the role on every call.
import { useCallback, useEffect, useId, useState } from 'react'
import { api, ApiFailure } from '../services/backend'
import type { Artifact, ProjectDoc } from '../project/model/types'

type Sub = { id: string; week: number; state: string; snapshotId: string; fingerprint: string; rev: number; proposalState: string; submittedAt: string; submittedBy: string | null; decidedAt: string | null; decidedBy: string | null; feedback: string; anchors: { artifactId: string; text: string }[]; notes: Record<string, string>; validation: { headline?: { meets: number; required: number }; issues?: { text: string; severity: string; key: string }[]; advisory?: string } | null; reportedByBrowser?: { meets: number; required: number } | null; validationMismatch?: boolean; projectId: string; teamLabel: string; enterprise: string; current: boolean }
const STATE: Record<string, string> = { submitted: 'Submitted, waiting for your decision', approved: 'Approved', returned: 'Returned for revision', superseded: 'Superseded by a newer submission' }
const ORDER = ['ENT', 'MGO', 'PRT', 'EXT', 'STK', 'CON', 'NEED', 'A', 'U']

function SnapshotView({ projectId, snapshotId }: { projectId: string; snapshotId: string }) {
  const [doc, setDoc] = useState<ProjectDoc | null>(null)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    void api<{ doc: ProjectDoc }>('GET', `/projects/${encodeURIComponent(projectId)}/snapshots/${encodeURIComponent(snapshotId)}`)
      .then((r) => setDoc(r.data.doc))
      .catch((e) => setMsg(e instanceof ApiFailure ? e.error.message : 'The snapshot could not be loaded.'))
  }, [projectId, snapshotId])
  if (msg) return <p className="pj-small" role="alert">{msg}</p>
  if (!doc) return <p className="pj-small pj-muted">Loading the snapshot…</p>
  const arts = Object.values(doc.artifacts).filter((a) => a.status === 'active' && ORDER.includes(a.type)).sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type) || a.id.localeCompare(b.id, 'en', { numeric: true }))
  const text = (a: Artifact) => [a.title, a.description].filter(Boolean).join(' — ')
  return (
    <div data-testid="submission-snapshot" style={{ maxHeight: 360, overflow: 'auto', border: '1px solid var(--pj-line)', borderRadius: 8, marginTop: 8 }}>
      <table className="pj-table pj-small">
        <caption className="pj-small" style={{ textAlign: 'left', padding: 6 }}>
          Snapshot {snapshotId} (read-only): {arts.length} records
        </caption>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Record</th>
            <th scope="col">Rationale</th>
          </tr>
        </thead>
        <tbody>
          {arts.map((a) => (
            <tr key={a.uid}>
              <th scope="row" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{a.id}</th>
              <td>{text(a) || '—'}</td>
              <td>{a.rationale || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Decide({ s, onDone }: { s: Sub; onDone: () => void }) {
  const id = useId()
  const [decision, setDecision] = useState<'approved' | 'returned'>('approved')
  const [comment, setComment] = useState('')
  const [anchors, setAnchors] = useState<{ artifactId: string; text: string }[]>([])
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const send = async () => {
    setBusy(true)
    setMsg('')
    try {
      await api('POST', `/submissions/${encodeURIComponent(s.id)}/decision`, { decision, comment, anchors: anchors.filter((a) => a.artifactId.trim() && a.text.trim()).map((a) => ({ artifactId: a.artifactId.trim().toUpperCase(), text: a.text.trim() })) })
      onDone()
    } catch (e) {
      setMsg(e instanceof ApiFailure ? e.error.message : 'The decision was not saved.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <fieldset className="pj-stack" style={{ border: 0, padding: 0, margin: '12px 0 0' }} data-testid="submission-decide">
      <legend className="pj-h3">Decision</legend>
      <div className="pj-row">
        <label>
          <input type="radio" name={`${id}-d`} checked={decision === 'approved'} onChange={() => setDecision('approved')} data-testid="sub-approve" /> Approve
        </label>
        <label>
          <input type="radio" name={`${id}-d`} checked={decision === 'returned'} onChange={() => setDecision('returned')} data-testid="sub-return" /> Return for revision
        </label>
      </div>
      <label className="pj-field" htmlFor={`${id}-c`}>
        <span>Feedback to the team{decision === 'returned' ? ' (required)' : ''}</span>
        <textarea id={`${id}-c`} className="pj-textarea" value={comment} onChange={(e) => setComment(e.target.value)} data-testid="sub-comment" />
      </label>
      {anchors.map((a, i) => (
        <div key={i} className="pj-row">
          <label className="pj-field" style={{ maxWidth: 140 }}>
            <span>Artifact ID</span>
            <input className="pj-input" value={a.artifactId} onChange={(e) => setAnchors(anchors.map((x, k) => (k === i ? { ...x, artifactId: e.target.value } : x)))} data-testid={`sub-anchor-id-${i}`} />
          </label>
          <label className="pj-field" style={{ flex: 1 }}>
            <span>Feedback on it</span>
            <input className="pj-input" value={a.text} onChange={(e) => setAnchors(anchors.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)))} data-testid={`sub-anchor-text-${i}`} />
          </label>
        </div>
      ))}
      <div className="pj-row">
        <button type="button" className="pj-btn small" onClick={() => setAnchors([...anchors, { artifactId: '', text: '' }])} data-testid="sub-add-anchor">
          Add feedback on an artifact
        </button>
        <button type="button" className="pj-btn primary" disabled={busy || (decision === 'returned' && !comment.trim())} onClick={() => void send()} data-testid="sub-submit">
          Record the decision
        </button>
      </div>
      {msg && (
        <p className="pj-small" role="alert" style={{ color: 'var(--pj-bad)' }}>
          {msg}
        </p>
      )}
    </fieldset>
  )
}

export function SubmissionReview() {
  const [list, setList] = useState<Sub[] | null>(null)
  const [msg, setMsg] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const load = useCallback(async () => {
    try {
      setList((await api<{ submissions: Sub[] }>('GET', '/submissions')).data.submissions)
    } catch (e) {
      setMsg(e instanceof ApiFailure ? e.error.message : 'The submissions could not be loaded.')
    }
  }, [])
  useEffect(() => {
    void load()
  }, [load])
  const waiting = (list ?? []).filter((s) => s.state === 'submitted')
  const others = (list ?? []).filter((s) => s.state !== 'submitted').reverse()
  return (
    <section aria-labelledby="sub-h" data-testid="submission-review" style={{ marginTop: 24 }}>
      <h2 id="sub-h" className="pj-h2">Week 1 submissions ({waiting.length} waiting)</h2>
      <p className="pj-small pj-muted">Each submission is an unchangeable snapshot of the team’s project. The automated structural checks shown here are computed by the course server from the submitted snapshot; the team’s own view may differ (a difference is flagged). They are advisory, never a substitute for your assessment.</p>
      {msg && <p className="pj-small" role="alert">{msg}</p>}
      {list && !waiting.length && <p className="pj-small pj-muted">No submission is waiting.</p>}
      {waiting.map((s) => (
        <article key={s.id} className="pj-card" data-testid="pending-submission" style={{ marginBottom: 12 }}>
          <h3 className="pj-h3">
            {s.teamLabel}: {s.enterprise || '(unnamed enterprise)'} · Week {s.week}
          </h3>
          <p className="pj-small">
            {STATE[s.state]} · submitted {new Date(s.submittedAt).toLocaleString()} by {s.submittedBy} · snapshot {s.snapshotId} · fingerprint <code>{s.fingerprint.slice(0, 12)}…</code>
            {s.proposalState === 'pending' ? ' · the enterprise proposal was still pending (submitted for approval)' : ''}
          </p>
          {s.validation?.headline && (
            <p className="pj-small" data-testid="submission-validation">
              Automated checks, computed by the course server from the submitted snapshot (advisory): {s.validation.headline.meets} of {s.validation.headline.required} required parts met · {s.validation.issues?.length ?? 0} open items
            </p>
          )}
          {s.validationMismatch && s.reportedByBrowser && (
            <p className="pj-small" role="note" data-testid="submission-validation-mismatch" style={{ color: 'var(--pj-warn)' }}>
              The team’s browser reported {s.reportedByBrowser.meets} of {s.reportedByBrowser.required}; the server’s count from the snapshot is the one shown above.
            </p>
          )}
          {Object.keys(s.notes).length > 0 && (
            <details className="pj-small">
              <summary>Team’s notes on open items ({Object.keys(s.notes).length})</summary>
              <ul>
                {Object.entries(s.notes).map(([k, v]) => (
                  <li key={k}>
                    <em>{k.replace(/^s\d:/, '')}</em>: {v}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <button type="button" className="pj-btn small" onClick={() => setOpen(open === s.id ? null : s.id)} data-testid="open-snapshot" aria-expanded={open === s.id}>
            {open === s.id ? 'Hide the snapshot' : 'Open the snapshot'}
          </button>
          {open === s.id && <SnapshotView projectId={s.projectId} snapshotId={s.snapshotId} />}
          <Decide s={s} onDone={() => void load()} />
        </article>
      ))}
      {others.length > 0 && (
        <>
          <h3 className="pj-h3">Decided and superseded</h3>
          <ul className="pj-small">
            {others.map((s) => (
              <li key={s.id} data-testid="decided-submission">
                {s.teamLabel}: {s.enterprise} — {STATE[s.state] ?? s.state}
                {s.decidedAt ? ` on ${new Date(s.decidedAt).toLocaleDateString()}` : ''}
                {s.feedback ? ` · “${s.feedback}”` : ''}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
