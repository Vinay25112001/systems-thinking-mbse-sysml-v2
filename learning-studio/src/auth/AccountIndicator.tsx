// The current-user indicator in the course chrome (M2, minimal; final styling in M4). Shows who is signed in to the
// course server, or a "Sign in" link when the server answers and nobody is signed in. Shows nothing in the static
// student edition (no server) or when the server is not running, where My Project says "Saved in this browser only".
import { useEffect } from 'react'
import { Link } from '../lib/router'
import { BACKEND, probeBackend, useBackend } from '../services/backend'

const ROLE: Record<string, string> = { student: 'student', instructor: 'instructor', admin: 'admin' }

export function AccountIndicator() {
  const b = useBackend()
  useEffect(() => {
    void probeBackend()
  }, [])
  if (BACKEND === 'none' || b.status === 'probing' || b.status === 'offline') return null
  if (b.status === 'signed-out')
    return (
      <Link to="/signin" className="text-sm underline" data-testid="account-signin">
        Sign in
      </Link>
    )
  const s = b.session!
  const role = s.roles.includes('instructor') ? 'instructor' : s.roles.includes('admin') ? 'admin' : 'student'
  return (
    <Link to="/signin" className="text-sm" data-testid="account-indicator" title="Account and sign-out">
      <span className="sr-only">Signed in as </span>
      <strong>{s.user.displayName}</strong> <span className="opacity-75">({ROLE[role]}{s.team ? `, ${s.team.label}` : ''})</span>
    </Link>
  )
}
