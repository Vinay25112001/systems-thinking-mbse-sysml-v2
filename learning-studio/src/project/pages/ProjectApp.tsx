// The My Project shell (lazy chunk): the course top bar, a breadcrumb with the save status and the export button, the
// project tabs, the storage banners (memory fallback, read-only tab, save failure), then the page.
import { Download } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { TopBar } from '../../flow/Chrome'
import { Link } from '../../lib/router'
import { projectTitle } from '../model/create'
import { PROJECT_TABS, type ProjectRoute } from '../route'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { exportProject } from './actions'
import { ArtifactPage } from './ArtifactPage'
import { CreateProject } from './CreateProject'
import { EditAccess } from './EditAccess'
import { History } from './History'
import { Library } from './Library'
import { Milestones } from './Milestones'
import { ModelPreview } from './ModelPreview'
import { Overview } from './Overview'
import { Transfer } from './Transfer'
import { SaveStatus } from './ui'
// --- course server (M2) ---
import { ApprovalPanel, NoTeamProject } from '../../auth/ServerPanels'
import { SessionRecovery } from '../../auth/SessionRecovery'
import { getBackend, useBackend } from '../../services/backend'
// --- end course server ---

const TITLES: Record<ProjectRoute['page'], string> = { overview: 'Overview', milestones: 'Milestones', artifacts: 'Artifacts', artifact: 'Artifact', history: 'History', transfer: 'Export and import', model: 'Week 8 preview' }

function StorageBanners() {
  const st = useProjectState()
  const store = useProjectStore()
  const [msg, setMsg] = useState('')
  const backend = useBackend()
  return (
    <div className="pj-stack" style={{ marginBottom: 16 }}>
      {/* --- course server (M2): where the project is saved, said honestly --- */}
      {st.ready && st.storage === 'http' && (
        <div className="pj-banner status-info" role="note" data-testid="server-banner">
          <span>
            <strong>Shared team project, saved on the course server.</strong> Teammates’ changes appear within about 15 seconds.
          </span>
        </div>
      )}
      {st.ready && st.storage === 'http' && <SessionRecovery />}
      {st.ready && st.storage === 'indexeddb' && (
        <div className="pj-banner status-info" role="note" data-testid="browser-only-banner">
          <span>
            <strong>Saved in this browser only.</strong> Export the project to keep a copy{backend.status === 'signed-out' ? '; sign in to work on your team’s shared project on the course server' : ''}.
          </span>
          {backend.status === 'signed-out' && (
            <span className="pj-banner-act">
              <Link to="/signin" className="pj-btn small">
                Sign in
              </Link>
            </span>
          )}
        </div>
      )}
      {/* --- end course server --- */}
      {st.storage === 'memory' && st.memoryReason && (
        <div className="pj-banner status-warn" role="alert" data-testid="memory-banner">
          <span>
            <strong>This browser is not saving your project. Export before you close the tab.</strong> {st.memoryReason}
          </span>
          {st.doc && store && (
            <span className="pj-banner-act">
              <button type="button" className="pj-btn small" onClick={() => void exportProject(store).then(setMsg)}>
                <Download size={14} aria-hidden /> Export project
              </button>
            </span>
          )}
        </div>
      )}
      <EditAccess st={st} store={store} />
      {st.save.kind === 'error' && (
        <div className="pj-banner status-bad" role="alert" data-testid="save-error-banner">
          <span>
            <strong>Not saved: {st.save.reason}.</strong> Your latest changes are kept in this tab only. Export the project now so nothing is lost.
          </span>
          {store && (
            <span className="pj-banner-act">
              <button type="button" className="pj-btn small" onClick={() => void exportProject(store).then(setMsg)}>
                Export now
              </button>
            </span>
          )}
        </div>
      )}
      {st.notice && (
        <div className="pj-banner status-info" role="status">
          <span>{st.notice}</span>
          <span className="pj-banner-act">
            <button type="button" className="pj-btn small" onClick={() => store?.dismissNotice()}>
              Dismiss
            </button>
          </span>
        </div>
      )}
      {msg && (
        <p className="pj-small" role="status">
          {msg}
        </p>
      )}
    </div>
  )
}

function Shell({ route, children }: { route: ProjectRoute; children: ReactNode }) {
  const st = useProjectState()
  const store = useProjectStore()
  const [msg, setMsg] = useState('')
  const name = st.doc ? projectTitle(st.doc) : ''
  useEffect(() => {
    document.title = `${TITLES[route.page]} · My Project${name ? ` · ${name}` : ''} · SysML Learning Studio`
  }, [route.page, name])
  const current = route.page === 'artifact' ? 'artifacts' : route.page
  return (
    <div className="pj-scope pj-root" data-testid="project-app">
      <a href="#pj-main" className="lf-skip" onClick={(e) => (e.preventDefault(), document.getElementById('pj-main')?.focus())}>
        Skip to content
      </a>
      <TopBar title={name ? `My Project — ${name}` : 'My Project'} projectCurrent />
      {st.doc && (
        <header className="pj-header">
          <div className="pj-header-row">
            <nav className="pj-crumb" aria-label="Breadcrumb">
              <Link to="/project">My Project</Link>
              <span aria-hidden>/</span>
              <strong>{TITLES[route.page]}</strong>
            </nav>
            <SaveStatus save={st.save} storage={st.storage} onExport={store ? () => void exportProject(store).then(setMsg) : undefined} />
            {store && (
              <button type="button" className="pj-btn small" onClick={() => void exportProject(store).then(setMsg)} data-testid="header-export">
                <Download size={14} aria-hidden /> Export project
              </button>
            )}
          </div>
          <nav className="pj-tabs" aria-label="My Project sections" data-testid="project-tabs">
            {PROJECT_TABS.map((t) => (
              <Link key={t.page} to={t.to} aria-current={current === t.page ? 'page' : undefined} data-testid={`project-tab-${t.page}`}>
                {t.label}
              </Link>
            ))}
          </nav>
        </header>
      )}
      <main id="pj-main" tabIndex={-1} className="pj-main">
        <StorageBanners />
        {msg && (
          <p className="pj-small" role="status" data-testid="export-msg">
            {msg}
          </p>
        )}
        {children}
      </main>
    </div>
  )
}

export default function ProjectApp({ route }: { route: ProjectRoute }) {
  const st = useProjectState()
  if (!st.ready)
    return (
      <Shell route={route}>
        <p role="status" className="pj-muted">
          Opening your project…
        </p>
      </Shell>
    )
  // --- course server (M2): an instructor, or a student without a team, has no team project to create ---
  const session = st.storage === 'http' ? getBackend().session : null
  if (!st.doc && session && (!session.team || !session.roles.includes('student')))
    return (
      <Shell route={route}>
        <NoTeamProject />
      </Shell>
    )
  // --- end course server ---
  if (!st.doc)
    return (
      <Shell route={route}>
        <CreateProject />
      </Shell>
    )
  return (
    <Shell route={route}>
      {route.page === 'overview' && st.storage === 'http' && <ApprovalPanel />}
      {route.page === 'overview' && <Overview />}
      {route.page === 'milestones' && <Milestones week={route.param ? Number(route.param) : undefined} />}
      {route.page === 'artifacts' && <Library type={route.param} />}
      {route.page === 'artifact' && <ArtifactPage id={route.param ?? ''} />}
      {route.page === 'history' && <History />}
      {route.page === 'transfer' && <Transfer />}
      {route.page === 'model' && <ModelPreview />}
    </Shell>
  )
}
