// Instructor review of enterprise proposals (#/review; M2 minimal — the full review workspace is M6). Lists approval
// requests with the frozen proposal; the instructor approves or requests a revision with a comment the team sees, and
// may keep a faculty-only note that is never sent to students. The server re-checks the instructor role on every call.
// A proposal changed after approval (M2 review H1) is listed separately with a field diff against the approved snapshot;
// the instructor re-approves the current content or requests a revision (the decision carries the content fingerprint
// the instructor saw, so a proposal edited again meanwhile is refused and reloaded).
import { useCallback, useEffect, useId, useState } from 'react'
import { TopBar } from '../flow/Chrome'
import { Link } from '../lib/router'
import { api, ApiFailure, hasRole, probeBackend, useBackend } from '../services/backend'
import { APPROVAL_LABEL, type ApprovalView } from './ServerPanels'
import '../project/pages/project.css'
import { SubmissionReview } from './SubmissionReview' // m6

type Proposal = { enterprise: string; description?: string; domain: string; problem: string; suitability: string; soi: string; mission: string; objectives?: string[] }
type DiffRow = { id: string; type: string; field: string; approved: string; current: string; change: 'added' | 'removed' | 'changed' }
type InstructorApproval = ApprovalView & { privateNote: string; current: boolean; projectId: string; teamLabel: string; proposalSnapshot: string; proposal: Proposal; currentProposal: Proposal | null; baselineSnapshot: string | null; diff: DiffRow[]; currentHash: string | null }

const FIELD_LABEL: Record<string, string> = { title: 'name', description: 'text', 'attributes.problem': 'problem statement', 'attributes.kind': 'kind', 'attributes.crosses': 'what crosses the boundary', 'attributes.direction': 'direction' }
function Diff({ a }: { a: InstructorApproval }) {
  if (!a.baselineSnapshot) return null
  if (!a.diff.length) return <p className="pj-small pj-muted">No material difference from the approved version ({a.baselineSnapshot}).</p>
  return (
    <table className="pj-table pj-small" data-testid="approval-diff" style={{ margin: '8px 0' }}>
      <caption className="pj-small" style={{ textAlign: 'left' }}>
        What changed since the approved version ({a.baselineSnapshot})
      </caption>
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col">Field</th>
          <th scope="col">Approved</th>
          <th scope="col">Now</th>
        </tr>
      </thead>
      <tbody>
        {a.diff.map((d, i) => (
          <tr key={`${d.id}-${d.field}-${i}`} data-change={d.change}>
            <th scope="row">
              {d.id}
              {d.change !== 'changed' ? ` (${d.change})` : ''}
            </th>
            <td>{FIELD_LABEL[d.field] ?? (d.field || '—')}</td>
            <td>{d.approved ? <del>{d.approved}</del> : '—'}</td>
            <td>{d.current ? <ins>{d.current}</ins> : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Decide({ a, onDone }: { a: InstructorApproval; onDone: () => void }) {
  const id = useId()
  const [decision, setDecision] = useState<'approved' | 'revision-requested'>('approved')
  const [comment, setComment] = useState('')
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async () => {
    setBusy(true)
    setMsg('')
    try {
      await api('POST', `/approvals/${encodeURIComponent(a.id)}/decision`, { decision, comment, privateNote: note, ...(a.currentHash ? { currentHash: a.currentHash } : {}) })
      onDone()
    } catch (e) {
      setMsg(e instanceof ApiFailure ? e.error.message : 'The decision was not saved.')
      if (e instanceof ApiFailure && e.error.status === 409) onDone() // reload: the team changed it again, or it was decided
    } finally {
      setBusy(false)
    }
  }
  return (
    <fieldset className="pj-stack" style={{ border: 0, padding: 0, margin: '12px 0 0' }}>
      <legend className="pj-h3">Decision</legend>
      <div className="pj-row">
        <label>
          <input type="radio" name={`${id}-d`} checked={decision === 'approved'} onChange={() => setDecision('approved')} data-testid="decide-approve" /> {a.state === 'approved-changes-pending' ? 'Re-approve the current version' : 'Approve'}
        </label>
        <label>
          <input type="radio" name={`${id}-d`} checked={decision === 'revision-requested'} onChange={() => setDecision('revision-requested')} data-testid="decide-revise" /> Request a revision
        </label>
      </div>
      <label className="pj-field" htmlFor={`${id}-c`}>
        <span>Comment to the team{decision === 'revision-requested' ? ' (required)' : ''}</span>
        <textarea id={`${id}-c`} className="pj-textarea" value={comment} onChange={(e) => setComment(e.target.value)} data-testid="decide-comment" />
      </label>
      <label className="pj-field" htmlFor={`${id}-n`}>
        <span>Faculty-only note (never shown to students)</span>
        <textarea id={`${id}-n`} className="pj-textarea" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="pj-row">
        <button type="button" className="pj-btn primary" disabled={busy || (decision === 'revision-requested' && !comment.trim())} onClick={() => void submit()} data-testid="decide-submit">
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

export default function ReviewPage() {
  const b = useBackend()
  const [list, setList] = useState<InstructorApproval[] | null>(null)
  const [msg, setMsg] = useState('')
  const load = useCallback(async () => {
    try {
      setList((await api<{ approvals: InstructorApproval[] }>('GET', '/approvals')).data.approvals)
    } catch (e) {
      setMsg(e instanceof ApiFailure ? e.error.message : 'The requests could not be loaded.')
    }
  }, [])
  useEffect(() => {
    document.title = 'Review enterprise proposals · SysML Learning Studio'
    void probeBackend().then((s) => {
      if (s.status === 'signed-in' && hasRole(s.session, 'instructor')) void load()
    })
  }, [load])
  const staff = b.status === 'signed-in' && hasRole(b.session, 'instructor')
  const pending = (list ?? []).filter((a) => a.state === 'pending')
  const changed = (list ?? []).filter((a) => a.state === 'approved-changes-pending' && a.current)
  const decided = (list ?? []).filter((a) => a.state !== 'pending' && !(a.state === 'approved-changes-pending' && a.current)).reverse()
  return (
    <div className="pj-scope pj-root" data-testid="review-page">
      <TopBar title="Review enterprise proposals" />
      <main id="pj-main" className="pj-main" style={{ maxWidth: 960 }}>
        <h1 className="pj-h1">Enterprise proposals</h1>
        {!staff && b.status !== 'probing' && (
          <p className="pj-small">
            This page is for instructors signed in to the course server. <Link to="/signin">Sign in</Link>
          </p>
        )}
        {msg && (
          <p className="pj-small" role="alert">
            {msg}
          </p>
        )}
        {staff && list && (
          <>
            <h2 className="pj-h2">Waiting for a decision ({pending.length})</h2>
            {!pending.length && <p className="pj-small pj-muted">No proposal is waiting.</p>}
            {pending.map((a) => (
              <article key={a.id} className="pj-card" data-testid="pending-approval" style={{ marginBottom: 12 }}>
                <h3 className="pj-h3">
                  {a.teamLabel}: {a.proposal.enterprise || '(unnamed enterprise)'}
                </h3>
                <dl className="pj-small" style={{ margin: 0 }}>
                  {/* --- m6 --- the description and objectives are material to the approval (A26) */}
                  <dt><strong>Description</strong></dt>
                  <dd>{a.proposal.description || '—'}</dd>
                  {/* --- end m6 --- */}
                  <dt><strong>Domain</strong></dt>
                  <dd>{a.proposal.domain || '—'}</dd>
                  <dt><strong>Problem or opportunity</strong></dt>
                  <dd>{a.proposal.problem || '—'}</dd>
                  <dt><strong>Mission</strong></dt>
                  <dd>{a.proposal.mission || '—'}</dd>
                  {/* --- m6 --- */}
                  <dt><strong>Objectives</strong></dt>
                  <dd>{a.proposal.objectives?.length ? a.proposal.objectives.join('; ') : '—'}</dd>
                  {/* --- end m6 --- */}
                  <dt><strong>System of interest</strong></dt>
                  <dd>{a.proposal.soi || '—'}</dd>
                </dl>
                <p className="pj-small pj-muted">Sent {new Date(a.requestedAt).toLocaleString()} by {a.requestedBy}. You decide on this frozen version ({a.proposalSnapshot}), not on later edits.</p>
                <Diff a={a} />
                <Decide a={a} onDone={() => void load()} />
              </article>
            ))}
            <h2 className="pj-h2">Approved, then changed ({changed.length})</h2>
            {!changed.length && <p className="pj-small pj-muted">No approved proposal has changed since its approval.</p>}
            {changed.map((a) => (
              <article key={a.id} className="pj-card" data-testid="changed-approval" style={{ marginBottom: 12 }}>
                <h3 className="pj-h3">
                  {a.teamLabel}: {a.currentProposal?.enterprise || a.proposal.enterprise || '(unnamed enterprise)'}
                </h3>
                <p className="pj-small">
                  Approved {a.decidedAt ? new Date(a.decidedAt).toLocaleDateString() : ''}
                  {a.decidedBy ? ` by ${a.decidedBy}` : ''}; changed {a.changedAt ? new Date(a.changedAt).toLocaleString() : ''}. The approval stays on record; the current version needs your review.
                </p>
                <Diff a={a} />
                <Decide a={a} onDone={() => void load()} />
              </article>
            ))}
            <h2 className="pj-h2">Decided</h2>
            {!decided.length && <p className="pj-small pj-muted">Nothing decided yet.</p>}
            <ul className="pj-small">
              {decided.map((a) => (
                <li key={a.id} data-testid="decided-approval">
                  {a.teamLabel}: {a.proposal.enterprise || '(unnamed)'} — {a.state === 'approved-changes-pending' ? 'Approved, then changed (superseded)' : APPROVAL_LABEL[a.state].replace(' by your instructor', '')} {a.decidedAt ? `on ${new Date(a.decidedAt).toLocaleDateString()}` : ''}
                  {a.comment ? ` · “${a.comment}”` : ''}
                </li>
              ))}
            </ul>
            {/* --- m6 --- Week 1 submissions: snapshot, validation report, decision and feedback */}
            <SubmissionReview />
            {/* --- end m6 --- */}
          </>
        )}
      </main>
    </div>
  )
}
