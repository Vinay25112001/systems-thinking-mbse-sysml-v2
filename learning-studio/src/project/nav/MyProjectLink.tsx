// The persistent "My Project" entry in every lecture-first page's top bar (and the course top bar): the student's
// enterprise, one click away from any week. Indigo, with the folder icon and the enterprise name (never colour alone).
import { FolderOpen } from 'lucide-react'
import { Link } from '../../lib/router'
import { projectTitle } from '../model/create'
import { useProjectState } from '../store/ProjectProvider'
import '../pages/project.css'

export function MyProjectLink({ current = false }: { current?: boolean }) {
  const st = useProjectState()
  const name = st.doc ? projectTitle(st.doc) : ''
  return (
    <span className="pj-scope" style={{ display: 'contents' }}>
      <Link to="/project" className="pj-nav-link" aria-current={current ? 'page' : undefined} data-testid="nav-my-project">
        <FolderOpen size={14} aria-hidden />
        My Project
        {name && <span className="pj-nav-name">· {name}</span>}
      </Link>
    </span>
  )
}
