// My Project pieces that exist only with the course server (M2): the enterprise approval panel (a member requests, the
// instructor decides; the student sees the status and the comment) and the screen for a signed-in account without a
// team project (instructor, or a student not yet in a team).
import { useCallback, useEffect, useId, useState, type FormEvent } from 'react'
import { Link } from '../lib/router'
import { useProjectState, useProjectStore } from '../project/store/ProjectProvider'
import { api, ApiFailure, hasRole, useBackend } from '../services/backend'

export type ApprovalView = { id: string; state: 'pending' | 'approved' | 'approved-changes-pending' | 'revision-requested' | 'withdrawn'; requestedAt: string; requestedBy: string | null; decidedAt: string | null; decidedBy: string | null; comment: string; changedAt?: string | null }
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '')
export const APPROVAL_LABEL: Record<ApprovalView['state'], string> = { pending: 'Waiting for your instructor', approved: 'Approved by your instructor', 'approved-changes-pending': 'Approved, then changed: needs instructor re-review', 'revision-requested': 'Revision requested by your instructor', withdrawn: 'Withdrawn' }

export function ApprovalPanel() {
  const st = useProjectState()
  const store = useProjectStore()
  const uid = st.doc?.project.uid
  const [a, setA] = useState<ApprovalView | null | undefined>(undefined)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    if (!uid) return
    try {
      setA((await api<{ approval: ApprovalView | null }>('GET', `/projects/${encodeURIComponent(uid)}/approval`)).data.approval)
    } catch (e) {
      setMsg(e instanceof ApiFailure ? e.error.message : 'The approval status could not be loaded.')
    }
  }, [uid])
  useEffect(() => {
    void load()
  }, [load, st.doc?.rev])
  if (!uid) return null
  const request = async () => {
    setBusy(true)
    setMsg('')
    try {
      await store?.flush()
      await api('POST', `/projects/${encodeURIComponent(uid)}/approval-requests`, {})
      await load()
      await store?.pollRemote()
    } catch (e) {
      setMsg(e instanceof ApiFailure ? e.error.message : 'The request could not be sent.')
    } finally {
      setBusy(false)
    }
  }
  const canRequest = !a || a.state === 'revision-requested' || a.state === 'withdrawn' || a.state === 'approved-changes-pending'
  return (
    <section className="pj-card" aria-labelledby="approval-h" data-testid="approval-panel" style={{ marginBottom: 16 }}>
      <h2 id="approval-h" className="pj-h2">Enterprise approval</h2>
      {a === undefined ? (
        <p className="pj-small pj-muted" role="status">Loading…</p>
      ) : !a ? (
        <p className="pj-small">Not requested yet. When your proposal (Week 1 lab tool, Part 2) is ready, send it to your instructor. The instructor decides on the course server; the decision appears here and in the lab tool.</p>
      ) : (
        <div className="pj-small" data-testid="approval-status" data-state={a.state}>
          <p style={{ margin: 0 }}>
            <strong>{APPROVAL_LABEL[a.state]}</strong>
            {a.state === 'pending' ? ` · sent ${when(a.requestedAt)}${a.requestedBy ? ` by ${a.requestedBy}` : ''}` : a.decidedAt ? ` · ${when(a.decidedAt)}${a.decidedBy ? ` by ${a.decidedBy}` : ''}` : ''}
          </p>
          {a.state === 'approved-changes-pending' && (
            <p style={{ margin: '6px 0 0' }} data-testid="approval-changed">
              The enterprise, mission, objectives or system boundary changed after the approval{a.changedAt ? ` (${when(a.changedAt)})` : ''}. Your instructor sees what changed and re-approves it or asks for a revision; you can also send the changed proposal now.
            </p>
          )}
          {a.comment && (
            <p style={{ margin: '6px 0 0' }} data-testid="approval-comment">
              Instructor’s comment: {a.comment}
            </p>
          )}
        </div>
      )}
      {canRequest && a !== undefined && (
        <div className="pj-row" style={{ marginTop: 10 }}>
          <button type="button" className="pj-btn primary" disabled={busy || st.readOnly} onClick={() => void request()} data-testid="request-approval">
            {a?.state === 'revision-requested' ? 'Send the revised proposal for approval' : a?.state === 'approved-changes-pending' ? 'Send the changed proposal for re-review' : 'Request instructor approval'}
          </button>
        </div>
      )}
      {msg && (
        <p className="pj-small" role="alert" style={{ color: 'var(--pj-bad)' }}>
          {msg}
        </p>
      )}
    </section>
  )
}

export function NoTeamProject() {
  const b = useBackend()
  const id = useId()
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const s = b.session
  if (!s) return null
  if (hasRole(s, 'instructor') && !hasRole(s, 'student'))
    return (
      <div className="pj-card" data-testid="no-team-instructor">
        <h1 className="pj-h1">My Project is the students’ workspace</h1>
        <p className="pj-small">You are signed in as an instructor. Instructors read team projects and decide enterprise proposals; they never edit student work.</p>
        <Link to="/review" className="pj-btn primary">
          Review enterprise proposals
        </Link>
      </div>
    )
  const join = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await api('POST', '/teams/join', { code })
      window.location.reload()
    } catch (err) {
      setMsg(err instanceof ApiFailure ? err.error.message : 'Joining failed.')
    }
  }
  return (
    <form className="pj-card" onSubmit={(e) => void join(e)} data-testid="no-team">
      <h1 className="pj-h1">You are not in a team yet</h1>
      <p className="pj-small">Your instructor adds you to a team, or gives your team a join code.</p>
      <label className="pj-field" htmlFor={`${id}-code`} style={{ maxWidth: 260 }}>
        <span>Join code</span>
        <input id={`${id}-code`} className="pj-input" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
      </label>
      <div className="pj-row" style={{ marginTop: 10 }}>
        <button type="submit" className="pj-btn primary" disabled={!code.trim()}>
          Join the team
        </button>
      </div>
      {msg && (
        <p className="pj-small" role="alert" style={{ color: 'var(--pj-bad)' }}>
          {msg}
        </p>
      )}
    </form>
  )
}
