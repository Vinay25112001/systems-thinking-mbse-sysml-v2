// Minimal sign-in / account page (#/signin; M2, simple and accessible; final styling in M4). Signing in or out reloads
// the page so the project store is chosen afresh: the course server when signed in, this browser otherwise.
import { useEffect, useId, useState, type FormEvent } from 'react'
import { TopBar } from '../flow/Chrome'
import { Link } from '../lib/router'
import { ApiFailure, BACKEND, changePassword, hasRole, outboxKeys, probeBackend, signIn, signOut, useBackend } from '../services/backend'
import '../project/pages/project.css'

const reloadTo = (hash: string) => {
  window.location.hash = hash
  window.location.reload()
}

function ChangePassword({ required }: { required: boolean }) {
  const id = useId()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await changePassword(current, next)
      setMsg({ ok: true, text: 'Password changed. Other sessions of this account were signed out.' })
      setCurrent('')
      setNext('')
      if (required) reloadTo('#/project')
    } catch (err) {
      setMsg({ ok: false, text: err instanceof ApiFailure ? err.error.message : 'The password could not be changed.' })
    } finally {
      setBusy(false)
    }
  }
  return (
    <form className="pj-card" onSubmit={(e) => void submit(e)} aria-labelledby={`${id}-h`} data-testid="change-password">
      <h2 id={`${id}-h`} className="pj-h2">{required ? 'Choose your own password' : 'Change password'}</h2>
      {required && <p className="pj-small">Your account has a temporary password. Choose a new one (at least 12 characters) before you continue.</p>}
      <div className="pj-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <label className="pj-field" htmlFor={`${id}-cur`}>
          <span>Current password</span>
          <input id={`${id}-cur`} className="pj-input" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </label>
        <label className="pj-field" htmlFor={`${id}-new`}>
          <span>New password</span>
          <input id={`${id}-new`} className="pj-input" type="password" autoComplete="new-password" minLength={12} value={next} onChange={(e) => setNext(e.target.value)} required aria-describedby={`${id}-new-h`} />
          <small id={`${id}-new-h`}>At least 12 characters; not your name or login.</small>
        </label>
      </div>
      <div className="pj-row" style={{ marginTop: 12 }}>
        <button type="submit" className="pj-btn primary" disabled={busy}>
          Change password
        </button>
      </div>
      {msg && (
        <p className="pj-small" role={msg.ok ? 'status' : 'alert'} style={{ color: msg.ok ? undefined : 'var(--pj-bad)' }}>
          {msg.text}
        </p>
      )}
    </form>
  )
}

export default function SignInPage() {
  const id = useId()
  const b = useBackend()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    document.title = 'Sign in · SysML Learning Studio'
    void probeBackend()
  }, [])
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const s = await signIn(login, password)
      setPassword('')
      if (!s.mustChangePassword) reloadTo(hasRole(s, 'instructor') ? '#/review' : '#/project')
    } catch (err) {
      setError(err instanceof ApiFailure ? err.error.message : 'Signing in failed.')
    } finally {
      setBusy(false)
    }
  }
  const s = b.session
  return (
    <div className="pj-scope pj-root" data-testid="signin-page">
      <TopBar title="Account" />
      <main id="pj-main" className="pj-main" style={{ maxWidth: 720 }}>
        <h1 className="pj-h1">Course server account</h1>
        {(BACKEND === 'none' || b.status === 'offline') && (
          <div className="pj-banner status-info" role="note" data-testid="signin-offline">
            <span>
              <strong>Saved in this browser only.</strong> {BACKEND === 'none' ? 'This edition of the studio has no accounts and no course server.' : `${b.reason ?? 'The course server is not running.'} My Project keeps working in this browser; export it to keep a copy.`}
            </span>
          </div>
        )}
        {b.status === 'probing' && <p role="status" className="pj-muted">Checking the course server…</p>}
        {b.status === 'signed-out' && (
          <form className="pj-card" onSubmit={(e) => void submit(e)} aria-labelledby={`${id}-h`} data-testid="signin-form">
            <h2 id={`${id}-h`} className="pj-h2">Sign in</h2>
            <p className="pj-small pj-muted">Use the account your instructor created for you. Local demonstration server: synthetic accounts and data only.</p>
            {b.reason && <p className="pj-small" role="status">{b.reason}</p>}
            <div className="pj-stack">
              <label className="pj-field" htmlFor={`${id}-login`}>
                <span>Login</span>
                <input id={`${id}-login`} className="pj-input" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} required data-testid="signin-login" />
              </label>
              <label className="pj-field" htmlFor={`${id}-pw`}>
                <span>Password</span>
                <input id={`${id}-pw`} className="pj-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="signin-password" />
              </label>
            </div>
            <div className="pj-row" style={{ marginTop: 12 }}>
              <button type="submit" className="pj-btn primary" disabled={busy} data-testid="signin-submit">
                Sign in
              </button>
            </div>
            {error && (
              <p className="pj-small" role="alert" style={{ color: 'var(--pj-bad)' }} data-testid="signin-error">
                {error}
              </p>
            )}
          </form>
        )}
        {b.status === 'signed-in' && s && (
          <div className="pj-stack">
            <section className="pj-card" data-testid="account-card">
              <h2 className="pj-h2">Signed in</h2>
              <p>
                <strong>{s.user.displayName}</strong> ({s.user.initials}) · {s.roles.join(', ')}
                {s.team ? ` · ${s.team.label}` : ''}
              </p>
              <p className="pj-small pj-muted">Session ends after a period of inactivity, and at the latest at {new Date(s.expiresAt).toLocaleString()}.</p>
              <div className="pj-row">
                {!s.mustChangePassword && hasRole(s, 'student') && (
                  <Link to="/project" className="pj-btn primary">
                    Open My Project
                  </Link>
                )}
                {!s.mustChangePassword && hasRole(s, 'instructor') && (
                  <Link to="/review" className="pj-btn primary" data-testid="open-review">
                    Review enterprise proposals
                  </Link>
                )}
                <button
                  type="button"
                  className="pj-btn"
                  onClick={() => {
                    // unsaved project changes kept in this tab are removed by signing out (review N4): ask first
                    if (outboxKeys(s.user.id).length && !window.confirm('You have project changes that were not saved to the course server. Signing out discards them. Sign out anyway?')) return
                    void signOut().finally(() => reloadTo('#/signin'))
                  }}
                  data-testid="signout"
                >
                  Sign out
                </button>
              </div>
            </section>
            <ChangePassword required={s.mustChangePassword} />
          </div>
        )}
      </main>
    </div>
  )
}
