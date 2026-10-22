// "Edit this section" (spec NAV-20) and the instructor's "Content" entry: shown only to an account the course server
// signed in with the instructor role. Showing the link is convenience, not authorization: every authoring call is
// authorized again on the server. Compiled out of the static student build (no server there).
import { useContext } from 'react'
import { Link } from '../lib/router'
import { OFF } from '../publishing/client'
import { PreviewMode } from '../publishing/usePublishedContent'
import { hasRole, useBackend } from '../services/backend'

export const authoringPath = (itemId?: string) => (itemId ? `/authoring/item/${encodeURIComponent(itemId)}` : '/authoring')

export function EditContentLink({ itemId, label = 'Edit this section', className = 'pub-edit' }: { itemId: string; label?: string; className?: string }) {
  const b = useBackend()
  const preview = useContext(PreviewMode)
  if (OFF || preview || b.status !== 'signed-in' || !hasRole(b.session, 'instructor')) return null
  return (
    <Link to={authoringPath(itemId)} className={className} data-testid={`edit-content-${itemId}`}>
      {label}
    </Link>
  )
}

export function AuthoringNavLink() {
  const b = useBackend()
  if (OFF || b.status !== 'signed-in' || !hasRole(b.session, 'instructor')) return null
  return (
    <Link to={authoringPath()} className="text-sm underline" data-testid="authoring-link">
      Content
    </Link>
  )
}
