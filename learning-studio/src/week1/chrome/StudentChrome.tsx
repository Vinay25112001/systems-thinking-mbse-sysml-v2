// One student chrome for the homepage, the Week 1 shell and Learn (spec §b.1 NAV-01…05, §l DS-01), Milestone M4 part A.
// App rail (expanded 248 px on reading pages, compact 76 px on work pages, NAV-06), header with breadcrumb and page
// actions (NAV-04), the Week 1 stage bar slot (NAV-10), and on phones a top bar plus a five-item bottom bar (NAV-05).
// No "Instructor mode" checkbox in the student edition (NAV-02, X14): the interim instructor switch below exists only in
// the instructor edition, inside a compile-time condition, so its text never reaches dist-student; until M2 brings
// server roles it is presentation only and gates nothing but the Week 1 lecture viewer link.
import { BookOpen, Boxes, FileText, FolderOpen, Home, Lock, Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { IS_STUDENT_EDITION } from '../../lib/edition'
import { Link } from '../../lib/router'
import { useApp, type ThemePref } from '../../state/AppState'
import '../studio.css'

export type Crumb = { label: string; to?: string }
type RailItem = { id: string; label: string; to: string; icon: ReactNode; identity: 'course' | 'project' | 'mbse' | 'neutral'; locked?: string }
const RAIL: RailItem[] = [
  { id: 'home', label: 'Home', to: '/', icon: <Home size={18} aria-hidden />, identity: 'course' },
  { id: 'course', label: 'Course', to: '/week/1', icon: <BookOpen size={18} aria-hidden />, identity: 'course' },
  { id: 'project', label: 'My Project', to: '/project', icon: <FolderOpen size={18} aria-hidden />, identity: 'project' },
  { id: 'mbse', label: 'MBSE Studio', to: '/project/model', icon: <Boxes size={18} aria-hidden />, identity: 'mbse', locked: 'Week 8' },
  { id: 'sources', label: 'Sources', to: '/sources', icon: <FileText size={18} aria-hidden />, identity: 'neutral' },
]

function ThemeControl() {
  const { theme, setTheme } = useApp()
  return (
    <label className="sc-theme">
      <span>Theme</span>
      <select aria-label="Color theme" value={theme} onChange={(e) => setTheme(e.target.value as ThemePref)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  )
}

/** Instructor edition only (interim until M2): a visible chip and the switch that opens the Week 1 lecture viewer. */
function InstructorSwitch() {
  const { instructor, setInstructor } = useApp()
  return (
    <label className="sc-instr" data-testid="instructor-switch">
      <input type="checkbox" checked={instructor} onChange={(e) => setInstructor(e.target.checked)} />
      <span>Instructor view (interim, instructor edition)</span>
    </label>
  )
}

export function StudentChrome({ current, crumbs, compact = false, stageBar, app = false, children, title }: { current: 'home' | 'course' | 'project' | 'sources'; crumbs: Crumb[]; compact?: boolean; stageBar?: ReactNode; app?: boolean; children: ReactNode; title: string }) {
  const [expanded, setExpanded] = useState(false)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    document.title = `${title} · SysML Learning Studio`
  }, [title])
  const isCompact = compact && !expanded
  const rail = (
    <nav className="sc-rail-nav" aria-label="App menu">
      <ul>
        {RAIL.map((r) => (
          <li key={r.id}>
            <Link to={r.to} className={`sc-rail-item is-${r.identity}`} aria-current={r.id === current ? 'page' : undefined} title={isCompact ? `${r.label}${r.locked ? ` (from ${r.locked})` : ''}` : undefined} onClick={() => setMenu(false)}>
              {r.icon}
              <span className="sc-rail-label">{r.label}</span>
              {r.locked && (
                <span className="sc-rail-lock">
                  <Lock size={12} aria-hidden />
                  <span>{r.locked}</span>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
  return (
    <div className={`sc-root lf-root${isCompact ? ' is-compact' : ''}${app ? ' is-app' : ''}`} data-testid="student-chrome">
      <a href="#sc-main" className="sc-skip" onClick={(e) => (e.preventDefault(), document.getElementById('sc-main')?.focus())}>
        Skip to content
      </a>
      <aside className="sc-rail" aria-label="Application">
        <Link to="/" className="sc-brand" aria-label="SysML Learning Studio, home">
          <span className="sc-brand-mark" aria-hidden>
            S
          </span>
          <span className="sc-brand-text">
            <strong>SysML Learning Studio</strong>
            <span>Systems Thinking and MBSE</span>
          </span>
        </Link>
        {rail}
        {compact && (
          <button type="button" className="sc-rail-toggle" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
            {expanded ? <PanelLeftClose size={16} aria-hidden /> : <PanelLeftOpen size={16} aria-hidden />}
            <span className="sc-rail-label">{expanded ? 'Collapse menu' : 'Expand menu'}</span>
            {!expanded && <span className="sr-only">Expand menu</span>}
          </button>
        )}
      </aside>
      <div className="sc-body">
        <header className="sc-header">
          <button type="button" className="sc-menu-btn" aria-label={menu ? 'Close the menu' : 'Open the menu'} aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
            {menu ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
          <nav aria-label="Breadcrumb" className="sc-crumbs">
            <ol>
              {crumbs.map((c, i) => (
                <li key={i}>{c.to && i < crumbs.length - 1 ? <Link to={c.to}>{c.label}</Link> : <span aria-current={i === crumbs.length - 1 ? 'page' : undefined}>{c.label}</span>}</li>
              ))}
            </ol>
          </nav>
          <div className="sc-actions">
            {!IS_STUDENT_EDITION && <InstructorSwitch />}
            <ThemeControl />
          </div>
        </header>
        {menu && (
          <div className="sc-menu-sheet" data-testid="sc-menu-sheet">
            {rail}
          </div>
        )}
        {IS_STUDENT_EDITION && (
          <p className="sc-edition" role="note">
            Public preview. Accounts, team projects, instructor review and submission are available only on the course server.
          </p>
        )}
        {stageBar}
        <main id="sc-main" tabIndex={-1} className="sc-main">
          {children}
        </main>
      </div>
      <nav className="sc-bottom" aria-label="App menu (phone)">
        {RAIL.slice(0, 4).map((r) => (
          <Link key={r.id} to={r.to} aria-current={r.id === current ? 'page' : undefined} className={`is-${r.identity}`}>
            {r.icon}
            <span>{r.id === 'mbse' ? 'MBSE' : r.label}</span>
          </Link>
        ))}
        <Link to="/sources" aria-current={current === 'sources' ? 'page' : undefined}>
          <FileText size={18} aria-hidden />
          <span>Sources</span>
        </Link>
      </nav>
    </div>
  )
}
