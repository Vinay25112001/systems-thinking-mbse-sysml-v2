// Enterprise overview (roadmap §2.2): the title block (name, ENT ID, team, approval as recorded, SoI, revision, last
// export), mission, problem and goals, the milestone strip with the current milestone, the system boundary, team and
// roles (initials, faculty decision F7), the artifact library at a glance, and save / export / history. Empty fields say
// what to write and where, never AeroLink text.
import { ArrowRight, Download, FolderOpen, History as HistoryIcon, Save } from 'lucide-react'
import { useState } from 'react'
import { Link } from '../../lib/router'
import { COURSE_ROLES, MERGED_ROLE } from '../../workbench/week1/logic'
import { DECISION_LABEL, MISSION_ID } from '../../workbench/week1/team'
import { week1Milestone } from '../adapters/week1Status'
import { activeOfType, enterpriseOf, projectTitle } from '../model/create'
import { EXPECTED, weekTitle } from '../model/milestones'
import { ARTIFACT_INFO, WEEK1_TYPES } from '../model/vocabulary'
import type { ProjectDoc } from '../model/types'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { exportProject } from './actions'
import { MilestoneStrip, STATE_LABEL } from './MilestoneStrip'
import { Chip, fmtDate } from './ui'

const Empty = ({ children }: { children: string }) => <span className="pj-muted" style={{ fontWeight: 400 }}>{children}</span>

function approvalChip(doc: ProjectDoc) {
  const m = week1Milestone(doc)
  const p = m.record.proposal
  if (m.approval === 'approved') return <Chip tone="ok">Approved {p.decidedOn}</Chip>
  if (p.decision === 'revise') return <Chip tone="bad">Revise and resubmit</Chip>
  if (m.approval === 'pending') return <Chip tone="warn">Submitted for approval</Chip>
  return <Chip tone="draft">{DECISION_LABEL[''].replace(/[()]/g, '')}</Chip>
}

export function Overview() {
  const st = useProjectState()
  const store = useProjectStore()!
  const doc = st.doc!
  const [msg, setMsg] = useState('')
  const [label, setLabel] = useState('')
  const ent = enterpriseOf(doc)
  const m1 = week1Milestone(doc)
  const rec = m1.record
  const all = Object.values(doc.artifacts).filter((a) => a.status === 'active')
  const review = all.filter((a) => a.review.state === 'needs-review').length
  const lastExport = doc.milestones.flatMap((m) => m.exports).map((e) => e.at).sort().at(-1)
  const members = doc.team.members.filter((m) => m.active)
  const prt = activeOfType(doc, 'PRT')
  const ext = activeOfType(doc, 'EXT')
  const name = projectTitle(doc)
  const saveVersion = async () => {
    const s = await store.saveVersion(label || 'Saved version')
    setLabel('')
    setMsg(`Saved version ${s.id}: ${s.label}.`)
  }
  return (
    <div className="pj-stack" data-testid="project-overview">
      <section className="pj-titleblock" aria-label="Enterprise title block" data-testid="title-block">
        <div className="pj-tb-name">
          <span className="pj-tb-own">
            <FolderOpen size={16} aria-hidden /> Your team’s enterprise
          </span>
          <h1 data-testid="enterprise-name">{ent?.title.trim() || name}</h1>
          <p className="pj-small" style={{ margin: 0, color: 'var(--pj-ink-2)' }} data-testid="mission">
            {rec.proposal.purpose.trim() || <Empty>{`Mission (${MISSION_ID}): one sentence, a purpose rather than a product, written in the Week 1 lab tool, Part 2.`}</Empty>}
          </p>
        </div>
        <div>
          <span className="pj-tb-label">Enterprise ID</span>
          <span className="pj-tb-value pj-mono">ENT-001</span>
        </div>
        <div>
          <span className="pj-tb-label">Team</span>
          <span className="pj-tb-value">{doc.team.label ? `Team ${doc.team.label}` : <Empty>Team label not set</Empty>} · {members.length} member{members.length === 1 ? '' : 's'}</span>
        </div>
        <div>
          <span className="pj-tb-label">Proposal (as recorded by the team)</span>
          {approvalChip(doc)}
        </div>
        <div>
          <span className="pj-tb-label">Revision</span>
          <span className="pj-tb-value">rev {doc.rev}</span>
        </div>
        <div className="pj-tb-r2">
          <span className="pj-tb-label">System of interest</span>
          <span className="pj-tb-value pj-small">{rec.proposal.soi.trim() || <Empty>One sentence, Week 1 lab tool, Part 2</Empty>}</span>
          <span className="pj-caption" style={{ display: 'block' }}>
            {prt.length} inside (PRT) · {ext.length} external (EXT)
          </span>
        </div>
        <div className="pj-tb-r2">
          <span className="pj-tb-label">Artifacts</span>
          <span className="pj-tb-value">
            {all.length} · {review} need review
          </span>
        </div>
        <div className="pj-tb-r2">
          <span className="pj-tb-label">Current milestone</span>
          <span className="pj-tb-value">Week 1 · {STATE_LABEL[m1.state]}</span>
        </div>
        <div className="pj-tb-r2">
          <span className="pj-tb-label">Last export</span>
          <span className="pj-tb-value">{lastExport ? fmtDate(lastExport) : <Empty>Not exported yet</Empty>}</span>
        </div>
      </section>

      <div className="pj-grid two">
        <div className="pj-stack">
          <section className="pj-card" aria-labelledby="ov-ms-h">
            <div className="pj-row" style={{ justifyContent: 'space-between' }}>
              <h2 id="ov-ms-h" className="pj-h2">
                Milestones
              </h2>
              <Link to="/project/milestones" className="pj-small">
                All 14 milestones
              </Link>
            </div>
            <MilestoneStrip doc={doc} />
            <div className="pj-card flat" style={{ marginTop: 12, background: 'var(--pj-sunk)' }} data-testid="current-milestone">
              <h3 className="pj-h3">Week 1 · {weekTitle(1)}</h3>
              <p className="pj-small" style={{ margin: '0 0 8px' }}>
                {STATE_LABEL[m1.state]}
                {m1.hasContent && m1.pendingApproval ? ', the proposal is not yet approved (approval is needed before the Week 2 submission)' : ''}. Expected: {EXPECTED[1].map((e) => `${e.min} ${e.type}`).join(', ')}.
                {m1.unadapted ? ` ${m1.unadapted} item(s) copied from the AeroLink practice do not count until you adapt them.` : ''}
              </p>
              <div className="pj-row">
                <Link to="/week/1/lab/tool" className="pj-btn primary" data-testid="open-lab-tool">
                  Open the Week 1 lab tool <ArrowRight size={14} aria-hidden />
                </Link>
                <Link to="/project/milestones/1" className="pj-btn">
                  Milestone details
                </Link>
              </div>
            </div>
          </section>

          <section className="pj-card" aria-labelledby="ov-pr-h">
            <h2 id="ov-pr-h" className="pj-h2">
              Problem, mission and goals
            </h2>
            <dl className="pj-small" style={{ margin: 0 }}>
              <dt className="pj-caption">Problem statement</dt>
              <dd style={{ margin: '0 0 8px' }} data-testid="problem">{rec.proposal.problem.trim() || <Empty>One sentence: the problem or opportunity the enterprise addresses (Week 1 lab tool, Part 2).</Empty>}</dd>
              <dt className="pj-caption">Domain</dt>
              <dd style={{ margin: '0 0 8px' }}>{rec.proposal.domain.trim() || <Empty>For example health care, logistics, energy, transport.</Empty>}</dd>
              <dt className="pj-caption">Goals (MGO-002 onward)</dt>
              <dd style={{ margin: 0 }}>
                {rec.proposal.goals.length ? (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {rec.proposal.goals.map((g) => (
                      <li key={g.id}>
                        <span className="pj-mono">{g.id}</span> {g.text || <Empty>(empty)</Empty>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty>Optional: what the mission breaks into. Every need traces to the mission or a goal.</Empty>
                )}
              </dd>
            </dl>
          </section>

          <section aria-labelledby="ov-lib-h">
            <div className="pj-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 id="ov-lib-h" className="pj-h2">
                Artifact library
              </h2>
              <Link to="/project/artifacts" className="pj-small">
                Open the library
              </Link>
            </div>
            <div className="pj-grid cards">
              {WEEK1_TYPES.map((t) => {
                const list = activeOfType(doc, t)
                const flagged = list.filter((a) => a.review.state === 'needs-review').length
                return (
                  <Link key={t} to={`/project/artifacts/${t}`} className="pj-card pj-acard" data-testid={`card-${t}`}>
                    <span className="pj-row" style={{ justifyContent: 'space-between' }}>
                      <span className="pj-caption">Week 1</span>
                      {flagged ? <Chip tone="warn">{flagged} to review</Chip> : list.length ? <Chip tone="neutral">{list.length}</Chip> : <Chip tone="draft">Not started</Chip>}
                    </span>
                    <span className="pj-h3" style={{ margin: 0 }}>{ARTIFACT_INFO[t].plural}</span>
                    <span>
                      <span className="pj-count">{list.length}</span> <span className="pj-caption">{t}</span>
                    </span>
                  </Link>
                )
              })}
              <div className="pj-card pj-acard future" aria-label="Week 2 artifacts: upcoming">
                <span className="pj-caption">Week 2 · upcoming</span>
                <span className="pj-h3" style={{ margin: 0 }}>ConOps, scenarios, capabilities, requirements</span>
                <span className="pj-caption">Built from your needs. The Week 2 lab tool joins My Project in the next increment.</span>
              </div>
            </div>
          </section>
        </div>

        <div className="pj-stack">
          <section className="pj-card" aria-labelledby="ov-bd-h">
            <h2 id="ov-bd-h" className="pj-h2">
              System boundary and context
            </h2>
            <p className="pj-small" style={{ marginTop: 0 }}>{rec.proposal.soi.trim() || <Empty>State the system of interest in Part 2 of the lab tool.</Empty>}</p>
            <h3 className="pj-caption" style={{ margin: '8px 0 4px' }}>Inside the boundary (PRT)</h3>
            {prt.length ? <ul className="pj-small" style={{ margin: 0, paddingLeft: 18 }}>{prt.map((p) => <li key={p.uid}><span className="pj-mono">{p.id}</span> {p.title || '(unnamed)'}</li>)}</ul> : <p className="pj-small pj-muted" style={{ margin: 0 }}>At least 3 elements, Week 1 lab tool, Part 2.</p>}
            <h3 className="pj-caption" style={{ margin: '10px 0 4px' }}>External systems and actors (EXT)</h3>
            {ext.length ? <ul className="pj-small" style={{ margin: 0, paddingLeft: 18 }}>{ext.map((p) => <li key={p.uid}><span className="pj-mono">{p.id}</span> {p.title || '(unnamed)'}</li>)}</ul> : <p className="pj-small pj-muted" style={{ margin: 0 }}>At least 6, each with what crosses the boundary: Week 1 lab tool, Part 3.</p>}
          </section>

          <section className="pj-card" aria-labelledby="ov-team-h" data-testid="team-roles">
            <h2 id="ov-team-h" className="pj-h2">
              Team and roles
            </h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} className="pj-stack">
              {COURSE_ROLES.map((role) => {
                const merged = doc.team.threePersonTeam && role === MERGED_ROLE
                const who = (doc.team.roles[role] ?? '').trim().toUpperCase()
                return (
                  <li key={role} className="pj-row" style={{ flexWrap: 'nowrap', marginTop: 8 }}>
                    <span className="pj-avatar" aria-hidden>{merged ? '—' : who || '?'}</span>
                    <span>
                      <strong>{merged ? 'Merged with Architecture' : who || 'Not assigned'}</strong>
                      <span className="pj-caption" style={{ display: 'block' }}>{role}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
            <p className="pj-caption" style={{ marginBottom: 0 }}>Initials only (no full names are stored). Set in the Week 1 lab tool, Part 1.</p>
          </section>

          <section className="pj-card" aria-labelledby="ov-save-h">
            <h2 id="ov-save-h" className="pj-h2">
              Save, export and history
            </h2>
            <p className="pj-small" style={{ marginTop: 0 }}>Your project is stored in this browser only. Export a project file to keep a copy, hand it in or move to another computer. Imports are checked and never overwrite silently.</p>
            <div className="pj-row">
              <button type="button" className="pj-btn primary" onClick={() => void exportProject(store).then(setMsg)} data-testid="overview-export">
                <Download size={14} aria-hidden /> Export project
              </button>
              <Link to="/project/transfer" className="pj-btn">
                Import or other exports
              </Link>
            </div>
            <div className="pj-row" style={{ marginTop: 10, flexWrap: 'nowrap' }}>
              <label className="sr-only" htmlFor="ov-ver">Version label</label>
              <input id="ov-ver" className="pj-input" placeholder="Version label, e.g. Week 1 submitted" value={label} onChange={(e) => setLabel(e.target.value)} />
              <button type="button" className="pj-btn" onClick={() => void saveVersion()} data-testid="save-version">
                <Save size={14} aria-hidden /> Save version
              </button>
            </div>
            {msg && (
              <p className="pj-small" role="status">
                {msg}
              </p>
            )}
            <ul className="pj-small" style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
              {st.changes.slice(-3).reverse().map((c) => (
                <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, borderTop: '1px solid var(--pj-line)', padding: '6px 0' }}>
                  <span>{c.summary}</span>
                  <span className="pj-caption">{fmtDate(c.at)}</span>
                </li>
              ))}
            </ul>
            <Link to="/project/history" className="pj-small">
              <HistoryIcon size={13} aria-hidden /> Full history
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
