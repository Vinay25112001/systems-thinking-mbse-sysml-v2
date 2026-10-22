// Sign in again without leaving the page (M2 review M4; SECURITY_ARCHITECTURE.md §4.2). When the course-server session
// ends (idle or absolute expiry) while My Project is open, the edits stay in this tab (and in the outbox) and this dialog
// asks for the password. After signing in as the SAME account, the pending change sets are saved with the version check
// (merge, or "Conflict requires review"); nothing is reloaded and nothing is lost. A different account is refused: the
// kept edits belong to the person who made them.
import * as Dialog from '@radix-ui/react-dialog'
import { useId, useState, type FormEvent } from 'react'
import { useProjectState, useProjectStore } from '../project/store/ProjectProvider'
import { ApiFailure, getLastUser, signIn, signOut, useBackend } from '../services/backend'

export function SessionRecovery() {
  const id = useId()
  const st = useProjectState()
  const store = useProjectStore()
  const b = useBackend()
  const user = getLastUser()
  const [login, setLogin] = useState(user?.login ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // "Not now" turns the dialog into a banner with a Sign in button (it never blocks reading the project)
  const [dismissed, setDismissed] = useState(false)
  const needed = st.storage === 'http' && (b.status === 'signed-out' || !!st.save.signin)
  if (!needed || !user) return null
  const unsaved = store?.hasUnsaved() ?? false
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const s = await signIn(login, password)
      setPassword('')
      if (s.user.id !== user.id) {
        await signOut().catch(() => undefined)
        setError(`These edits were made by ${user.displayName}. Sign in as ${user.login ?? user.displayName} to save them.`)
        return
      }
      await store?.flush()
    } catch (err) {
      setError(err instanceof ApiFailure ? err.error.message : 'Signing in failed.')
    } finally {
      setBusy(false)
    }
  }
  if (dismissed)
    return (
      <div className="pj-banner status-warn" role="alert" data-testid="session-recovery-banner">
        <span>
          <strong>Signed out.</strong> {unsaved ? 'Your unsaved changes are kept in this tab; sign in to save them.' : 'Sign in to keep working on the shared project.'}
        </span>
        <span className="pj-banner-act">
          <button type="button" className="pj-btn small" onClick={() => setDismissed(false)}>
            Sign in
          </button>
        </span>
      </div>
    )
  return (
    <Dialog.Root open onOpenChange={(o) => !o && setDismissed(true)}>
      <Dialog.Portal>
        <Dialog.Overlay className="pj-overlay" />
        <Dialog.Content className="pj-dialog pj-scope" data-testid="session-recovery" aria-describedby={`${id}-d`}>
          <Dialog.Title asChild>
            <h2>Sign in again to save your work</h2>
          </Dialog.Title>
          <p id={`${id}-d`} className="pj-small">
            Your session on the course server ended. {unsaved ? 'Your unsaved changes are kept in this tab and are saved as soon as you sign in.' : 'Nothing is lost; sign in to keep working.'}
          </p>
          <form className="pj-stack" onSubmit={(e) => void submit(e)}>
            <label className="pj-field" htmlFor={`${id}-login`}>
              <span>Login</span>
              <input id={`${id}-login`} className="pj-input" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} required data-testid="recovery-login" />
            </label>
            <label className="pj-field" htmlFor={`${id}-pw`}>
              <span>Password</span>
              <input id={`${id}-pw`} className="pj-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus data-testid="recovery-password" />
            </label>
            <div className="pj-row">
              <button type="submit" className="pj-btn primary" disabled={busy} data-testid="recovery-submit">
                Sign in and save
              </button>
              <Dialog.Close asChild>
                <button type="button" className="pj-btn">
                  Not now
                </button>
              </Dialog.Close>
            </div>
            {error && (
              <p className="pj-small" role="alert" style={{ color: 'var(--pj-bad)' }} data-testid="recovery-error">
                {error}
              </p>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
