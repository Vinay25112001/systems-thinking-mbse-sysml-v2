// My Project / Lab, Week 1 (M6; directive §12; spec §f): the continuous engineering canvas. One project and one
// canonical model for all fourteen weeks; Week 1 lays the foundation. Three regions: the section navigator (parts with
// their state, then the milestone strip), the work area (tables first, a map and a coverage view where they help), and
// the detail and guidance panel. Entry states (spec §f.1): no project → create it (or, signed in without a team, join
// one); with a project → the canvas.
import { Download, FileText, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, navigate } from '../../lib/router'
import { NoTeamProject } from '../../auth/ServerPanels'
import { getBackend } from '../../services/backend'
import { WEEK1_PATHS } from '../../week1/route'
import { projectTitle } from '../model/create'
import { exportProject, exportReport } from '../pages/actions'
import { CreateProject } from '../pages/CreateProject'
import { EditAccess } from '../pages/EditAccess'
import { weekState } from '../pages/MilestoneStrip'
import { SaveStatus } from '../pages/ui'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { CanvasProvider, StateChip, useCanvas } from './ctx'
import { BoundaryPart, EnterprisePart, TeamPart } from './partsCore'
import { AssumptionsPart, ConcernsPart, NeedsPart, RelationshipsPart, StakeholdersPart } from './partsRegister'
import { DetailPanel, GuidanceSheet } from './Panel'
import { PART_STATE_LABEL, type PartId } from './progress'
import '../pages/project.css'
import './canvas.css'

export const CANVAS_PARTS: { id: PartId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'team', label: 'Team & charter' },
  { id: 'enterprise', label: 'Enterprise & mission' },
  { id: 'boundary', label: 'Boundary & context' },
  { id: 'stakeholders', label: 'Stakeholders' },
  { id: 'concerns', label: 'Concerns' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'needs', label: 'Needs' },
  { id: 'assumptions', label: 'Assumptions & unknowns' },
  { id: 'week8', label: 'Week 8 preview' },
]
export const isPartId = (x: string | undefined): x is PartId => !!x && CANVAS_PARTS.some((p) => p.id === x)
export const partPath = (p: PartId) => (p === 'overview' ? WEEK1_PATHS.project : `${WEEK1_PATHS.project}/${p}`)

function Nav() {
  const c = useCanvas()
  const state = (id: PartId) => c.progress.parts.find((p) => p.id === id)
  return (
    <>
      <nav className="cv-nav" aria-label="Week 1 parts" data-testid="canvas-nav">
        <ol>
          {CANVAS_PARTS.map((p) => {
            const s = state(p.id)
            return (
              <li key={p.id}>
                <button type="button" aria-current={c.part === p.id} onClick={() => c.setPart(p.id)} data-testid={`nav-${p.id}`}>
                  <span className="cv-dot" data-state={s?.state ?? 'none'} aria-hidden />
                  <span>{p.label}</span>
                  <span className="cv-count">{s ? (s.count ? `${s.count.complete}/${s.count.required}` : PART_STATE_LABEL[s.state]) : ''}</span>
                  {s && <span className="cv-sr">{PART_STATE_LABEL[s.state]}</span>}
                </button>
              </li>
            )
          })}
        </ol>
        <CompactMilestones />
      </nav>
      <div className="cv-nav-select">
        <label className="cv-label" htmlFor="cv-part-select">Part</label>
        <select id="cv-part-select" className="cv-select" value={c.part} onChange={(e) => c.setPart(e.target.value as PartId)}>
          {CANVAS_PARTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} {state(p.id) ? `(${PART_STATE_LABEL[state(p.id)!.state]})` : ''}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

/** The 14 weekly milestones in the navigator's width: Week 1 current, the others upcoming (spec §f.3, below the parts). */
function CompactMilestones() {
  const c = useCanvas()
  return (
    <div className="cv-weeks" aria-label="14-week milestones" role="group">
      <p className="pj-small pj-muted" style={{ margin: '12px 0 6px' }}>
        14-week milestones
      </p>
      {[
        { label: 'Phase I · Systems thinking', weeks: [1, 2, 3, 4, 5, 6, 7] },
        { label: 'Phase II · SysML v2 model', weeks: [8, 9, 10, 11, 12, 13, 14] },
      ].map((ph) => (
        <div key={ph.label}>
          <span className="cv-weeks-phase">{ph.label}</span>
          <ol>
            {ph.weeks.map((w) => {
              const s = weekState(c.doc, w)
              const m = c.doc.milestones.find((x) => x.week === w)
              return (
                <li key={w}>
                  <Link to={`/project/milestones/${w}`} aria-current={w === 1 ? 'step' : undefined} aria-label={`Week ${w}: ${m?.title ?? ''}. ${s.label}`} title={`Week ${w}: ${m?.title ?? ''} · ${s.label}`} data-state={s.done ? 'done' : w === 1 ? 'current' : 'upcoming'}>
                    {w}
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </div>
  )
}

function OverviewPart() {
  const c = useCanvas()
  const pr = c.progress
  const pct = Math.round((pr.headline.meets / Math.max(1, pr.headline.required)) * 100)
  const ap = pr.approval
  const apText = !c.serverMode ? 'Instructor approval happens on the course server (this project is saved in this browser only).' : ap.state === 'approved' ? `Approved by the instructor${ap.decidedOn ? ` (${ap.decidedOn})` : ''}.` : ap.state === 'changed' ? 'Approved — changes pending re-review.' : ap.state === 'pending' ? 'Pending instructor review.' : ap.state === 'revise' ? 'Revision requested by the instructor.' : 'Not yet submitted for approval.'
  return (
    <section aria-labelledby="cv-overview-h" data-testid="part-overview">
      <div className="cv-card">
        <h2 id="cv-overview-h">Week 1 progress</h2>
        <p className="cv-lede" data-testid="canvas-headline">
          <strong>{pr.headline.meets} of {pr.headline.required}</strong> required parts meet the course checks. Progress counts records that meet stated criteria, not filled boxes; open a part to read its criteria.
        </p>
        <div className="cv-progressbar" role="progressbar" aria-label="Required parts meeting the course checks" aria-valuemin={0} aria-valuemax={pr.headline.required} aria-valuenow={pr.headline.meets}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="cv-note">The checks show the work is complete enough to review, not that it is right; your instructor decides that.</p>
      </div>
      <div className="cv-card">
        <div className="cv-tablewrap">
          <table className="cv-table cv-cards" data-testid="overview-parts">
            <thead>
              <tr>
                <th scope="col">Part</th>
                <th scope="col">State</th>
                <th scope="col">Complete</th>
                <th scope="col">Next step</th>
              </tr>
            </thead>
            <tbody>
              {pr.parts.map((p) => (
                <tr key={p.id}>
                  <th scope="row">
                    <button type="button" className="pj-btn small" onClick={() => c.setPart(p.id)}>
                      {p.label}
                    </button>
                  </th>
                  <td data-label="State"><StateChip state={p.state}>{PART_STATE_LABEL[p.state]}</StateChip></td>
                  <td data-label="Complete">{p.count ? `${p.count.complete} of ${p.count.required}` : `${p.criteria.filter((x) => x.ok).length} of ${p.criteria.length} criteria`}</td>
                  <td data-label="Next step" className="pj-small">{p.issues[0] ?? (p.state === 'optional' ? 'Optional in Week 1.' : 'Meets the course checks.')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="cv-grid2">
        <div className="cv-card" data-testid="overview-approval">
          <h3 style={{ marginTop: 0 }}>Pending reviews and approvals</h3>
          <p className="pj-small" style={{ margin: 0 }}>
            <strong>Enterprise proposal:</strong> {apText}
          </p>
          {pr.pendingReviews.length > 0 ? (
            <ul className="pj-small" style={{ paddingLeft: 16 }}>
              {pr.pendingReviews.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          ) : (
            <p className="pj-small pj-muted">No item needs review.</p>
          )}
        </div>
        <div className="cv-card" data-testid="overview-unresolved">
          <h3 style={{ marginTop: 0 }}>Unresolved relationships</h3>
          {pr.unresolved.length ? (
            <ul className="pj-small" style={{ paddingLeft: 16 }}>
              {pr.unresolved.slice(0, 8).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          ) : (
            <p className="pj-small pj-muted">Every recorded link resolves to a record in the project.</p>
          )}
        </div>
      </div>
      <div className="cv-card" data-testid="overview-future">
        <h3 style={{ marginTop: 0 }}>How this week’s work feeds later weeks</h3>
        <div className="cv-grid2">
          <div className="cv-future">
            <strong>Next: Week 2</strong> (not started) · Your concept of operations and stakeholder requirements will trace to your NEED IDs; assumptions and unknowns carry forward with their IDs.
          </div>
          <div className="cv-future">
            <strong>Week 8</strong> (future) · Your stakeholders, concerns, needs, mission and relationships keep their IDs and are mapped into the model (course working mapping). <Link to="/project/model">See the Week 8 preview</Link>.
          </div>
        </div>
      </div>
      <details className="cv-card" data-testid="lab-drawer">
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Lab instructions</summary>
        <p className="pj-small">The Lab L1 brief (purpose, inputs, method, procedure, outputs and submission) is on its own page; the method behind each step is explained in Learn.</p>
        <div className="cv-toolbar">
          <Link to={`${WEEK1_PATHS.project}/instructions`} className="pj-btn small" data-testid="open-lab-instructions">
            <FileText size={14} aria-hidden /> Open the lab instructions
          </Link>
          <Link to={WEEK1_PATHS.review} className="pj-btn small">
            Go to Review &amp; Submit
          </Link>
        </div>
      </details>
    </section>
  )
}

function Week8Part() {
  return (
    <section className="cv-card" data-testid="part-week8" aria-labelledby="cv-week8-h">
      <h2 id="cv-week8-h">Week 8 preview: how your Week 1 records will be modelled</h2>
      <p className="cv-lede">In Week 8 the same project is opened in the modelling tool: the enterprise, mission, stakeholders, concerns, needs and relationships keep their IDs, and each gets a mapping status (not mapped, mapping proposed, mapped, needs review, invalid). The mapping is the course’s working mapping; nothing here claims SysML conformance.</p>
      <Link to="/project/model" className="pj-btn primary">
        Open the Week 8 preview
      </Link>
    </section>
  )
}

function Work() {
  const c = useCanvas()
  return (
    <div className="cv-work" id="cv-work">
      {c.message && (
        <p className="cv-warnbox" role="alert" data-testid="canvas-refused">
          Not saved: {c.message}{' '}
          <button type="button" className="pj-btn small" onClick={() => c.say('')}>
            Dismiss
          </button>
        </p>
      )}
      {c.part === 'overview' && <OverviewPart />}
      {c.part === 'team' && <TeamPart />}
      {c.part === 'enterprise' && <EnterprisePart />}
      {c.part === 'boundary' && <BoundaryPart />}
      {c.part === 'stakeholders' && <StakeholdersPart />}
      {c.part === 'concerns' && <ConcernsPart />}
      {c.part === 'relationships' && <RelationshipsPart />}
      {c.part === 'needs' && <NeedsPart />}
      {c.part === 'assumptions' && <AssumptionsPart />}
      {c.part === 'week8' && <Week8Part />}
    </div>
  )
}

function Header() {
  const c = useCanvas()
  const store = useProjectStore()
  const [msg, setMsg] = useState('')
  const last = c.st.changes[c.st.changes.length - 1]
  const name = projectTitle(c.doc)
  return (
    <>
      <header className="cv-banner" data-testid="canvas-banner">
        <div>
          <span className="cv-kicker">Your enterprise</span>
          <h1>{name || 'Name your enterprise'}</h1>
          <span className="pj-small pj-muted">{c.serverMode ? 'Shared team project, saved on the course server.' : 'Saved in this browser only: export to keep a copy.'}</span>
        </div>
        <div className="cv-banner-actions">
          <SaveStatus save={c.st.save} storage={c.st.storage} onExport={store ? () => void exportProject(store).then(setMsg) : undefined} />
          {last && (
            <button type="button" className="pj-btn small" onClick={() => store?.undo()} disabled={c.readOnly} title={`Undo: ${last.summary}`} data-testid="canvas-undo">
              Undo last change
            </button>
          )}
          {store && (
            <button type="button" className="pj-btn small" onClick={() => void exportProject(store).then(setMsg)} data-testid="canvas-export">
              <Download size={14} aria-hidden /> Export Project
            </button>
          )}
          <Link to="/project/transfer" className="pj-btn small" data-testid="canvas-import-project">
            <Upload size={14} aria-hidden /> Import Project
          </Link>
          {store && (
            <button type="button" className="pj-btn small" onClick={() => void exportReport(store).then(setMsg)} data-testid="canvas-report">
              <FileText size={14} aria-hidden /> Download Engineering Report
            </button>
          )}
        </div>
      </header>
      {msg && (
        <p className="pj-small" role="status" data-testid="canvas-export-msg">
          {msg}
        </p>
      )}
      <EditAccess st={c.st} store={store} />
    </>
  )
}

export function Week1Canvas({ part }: { part?: string }) {
  const st = useProjectState()
  const current: PartId = isPartId(part) ? part : 'overview'
  const setPart = (p: PartId) => navigate(partPath(p))
  useEffect(() => {
    document.getElementById('cv-work')?.scrollIntoView?.({ block: 'start' })
  }, [current])
  if (!st.ready)
    return (
      <p role="status" className="pj-muted">
        Opening your project…
      </p>
    )
  const session = st.storage === 'http' ? getBackend().session : null
  if (!st.doc && session && (!session.team || !session.roles.includes('student')))
    return (
      <div className="pj-scope" data-testid="canvas-no-team">
        <NoTeamProject />
      </div>
    )
  if (!st.doc)
    return (
      <div className="pj-scope" data-testid="canvas-create">
        <p className="pj-small pj-muted">My Project holds your team’s enterprise for all fourteen weeks: its mission and objectives, stakeholders, concerns, relationships and needs, with stable IDs your later weeks build on. Create it once per team.</p>
        <CreateProject after={WEEK1_PATHS.project} />
      </div>
    )
  return (
    <div className="pj-scope cv-root" data-testid="week1-canvas">
      <CanvasProvider part={current} setPart={setPart}>
        <Header />
        <div className="cv-layout">
          <Nav />
          <Work />
          <DetailPanel />
        </div>
        <GuidanceSheet />
      </CanvasProvider>
    </div>
  )
}
