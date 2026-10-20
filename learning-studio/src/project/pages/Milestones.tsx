// Weekly milestones 1–14 (directive §3.C.2): expected artifacts, status, outstanding tasks and submission readiness.
// Week 1 in full (computed by the Week 1 checks on the projected record); Weeks 2–14 as upcoming, with the artifacts each
// week will add and, for Phase II, the Phase I week it models (COURSE_SCHEDULE.md rule 6).
import { ArrowRight, Download } from 'lucide-react'
import { useState } from 'react'
import { WEEKS } from '../../content/course'
import { Link } from '../../lib/router'
import { checkAiStatement, checkCharterPart, checkContextPart, checkExported, checkNeedsPart, checkProposal, checkRegister, needsMinimum } from '../../workbench/week1/team'
import { week1Milestone } from '../adapters/week1Status'
import { activeOfType } from '../model/create'
import { EXPECTED, phaseOf } from '../model/milestones'
import { ARTIFACT_INFO } from '../model/vocabulary'
import type { ExpectedArtifact, ProjectDoc } from '../model/types'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { exportProject, exportWeek1Files } from './actions'
import { MilestoneStrip, STATE_LABEL, weekState } from './MilestoneStrip'
import { Chip, fmtDate } from './ui'

const typeLabel = (t: ExpectedArtifact['type']) => (t === 'REL' ? 'Stakeholder relationships' : ARTIFACT_INFO[t].plural)
function count(doc: ProjectDoc, e: ExpectedArtifact): number {
  if (e.type === 'REL') return Object.values(doc.relationships).filter((r) => r.category === 'stakeholder' && r.status !== 'retired' && !r.draft).length
  return activeOfType(doc, e.type).filter((a) => !(a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted)).length
}

function Week1Detail({ doc }: { doc: ProjectDoc }) {
  const store = useProjectStore()!
  const [msg, setMsg] = useState('')
  const m = week1Milestone(doc)
  const r = m.record
  const nm = needsMinimum(r.charter)
  const parts = [
    { label: 'Part 1 · Team charter', c: checkCharterPart(r.charter) },
    { label: 'Part 2 · Enterprise proposal', c: checkProposal(r.proposal) },
    { label: 'Part 3 · Context', c: checkContextPart(r) },
    { label: 'Part 4 · Stakeholder register and relationships', c: checkRegister(r) },
    { label: 'Part 5 · Initial needs', c: checkNeedsPart(r) },
    { label: 'AI usage statement', c: checkAiStatement(r) },
    { label: 'Export of both files after the last change', c: checkExported(r) },
  ]
  const ms = doc.milestones.find((x) => x.week === 1)!
  const markSubmitted = () => store.apply([{ op: 'update-milestone', week: 1, fields: [{ path: 'markedSubmittedAt', before: ms.markedSubmittedAt, after: ms.markedSubmittedAt ? undefined : new Date().toISOString() }] }], { source: 'editor', summary: ms.markedSubmittedAt ? 'Unmarked the Week 1 LMS upload' : 'Marked the Week 1 files as uploaded to the LMS', noCoalesce: true })
  return (
    <div className="pj-stack" data-testid="milestone-1-detail">
      <div className="pj-row">
        <Chip tone={m.state === 'exported' || m.state === 'marked-submitted' ? 'ok' : m.state === 'checks-passing' ? 'ok' : m.state === 'in-progress' ? 'draft' : 'neutral'}>{STATE_LABEL[m.state]}</Chip>
        {m.hasContent && m.pendingApproval && <Chip tone="warn">Pending approval</Chip>}
        <span className="pj-small">Readiness: {m.recordState === 'ready' ? 'ready to submit' : m.recordState === 'pending-approval' ? 'complete and exported, labeled “submitted for approval”' : 'not ready yet'}</span>
      </div>
      <section className="pj-card" aria-labelledby="m1-exp">
        <h2 id="m1-exp" className="pj-h2">Expected artifacts</h2>
        <div className="pj-table-wrap">
          <table className="pj-table">
            <thead>
              <tr>
                <th scope="col">Artifact</th>
                <th scope="col">Minimum</th>
                <th scope="col">In your project</th>
                <th scope="col" className="pj-hide-sm">Rule</th>
              </tr>
            </thead>
            <tbody>
              {EXPECTED[1].map((e) => {
                const min = e.type === 'NEED' ? nm.needs : e.min
                const n = count(doc, e)
                return (
                  <tr key={e.type}>
                    <td>
                      <Link to={e.type === 'REL' ? '/project/artifacts/REL' : `/project/artifacts/${e.type}`}>{typeLabel(e.type)}</Link> <span className="pj-mono pj-muted">{e.type}</span>
                    </td>
                    <td>{min}</td>
                    <td>{n >= min ? <Chip tone="ok">{n}</Chip> : <Chip tone="draft">{n} of {min}</Chip>}</td>
                    <td className="pj-hide-sm pj-small">{e.rule}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="pj-caption" style={{ marginBottom: 0 }}>Counts are of items present; an item counts toward the part checks only when its own checks pass. Items copied from the AeroLink practice count only after you adapt them.</p>
      </section>
      <section className="pj-card" aria-labelledby="m1-out">
        <h2 id="m1-out" className="pj-h2">Outstanding tasks</h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {parts.map((p) => (
            <li key={p.label} className="pj-row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid var(--pj-line)' }}>
              <Chip tone={p.c.ok ? 'ok' : 'draft'}>{p.c.ok ? 'Complete' : 'To do'}</Chip>
              <span className="pj-small">
                <strong>{p.label}.</strong> {p.c.ok ? p.c.detail : p.c.issues[0]}
              </span>
            </li>
          ))}
        </ul>
        <div className="pj-row" style={{ marginTop: 12 }}>
          <Link to="/week/1/lab/tool" className="pj-btn primary">
            Open the Week 1 lab tool <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </section>
      <section className="pj-card" aria-labelledby="m1-sub">
        <h2 id="m1-sub" className="pj-h2">Submission</h2>
        <p className="pj-small" style={{ marginTop: 0 }}>The graded files are the ones uploaded to the LMS (faculty decision F1): the Week 1 Markdown record and the model inputs, exported from your project. One member uploads both.</p>
        <div className="pj-row">
          <button type="button" className="pj-btn primary" onClick={() => void exportWeek1Files(store).then(setMsg)} data-testid="export-week1-files">
            <Download size={14} aria-hidden /> Export the Week 1 files (.md and .json)
          </button>
          <button type="button" className="pj-btn" onClick={() => void exportProject(store).then(setMsg)}>
            <Download size={14} aria-hidden /> Export the whole project
          </button>
          <button type="button" className="pj-btn" onClick={markSubmitted} disabled={!m.exportedCurrent && !ms.markedSubmittedAt}>
            {ms.markedSubmittedAt ? `Marked uploaded ${fmtDate(ms.markedSubmittedAt)} (undo)` : 'I uploaded the files to the LMS'}
          </button>
        </div>
        {msg && <p className="pj-small" role="status">{msg}</p>}
        <h3 className="pj-h3" style={{ marginTop: 14 }}>Exports recorded</h3>
        {ms.exports.length ? (
          <ul className="pj-small" style={{ margin: 0, paddingLeft: 18 }}>
            {[...ms.exports].reverse().slice(0, 8).map((e, i) => (
              <li key={i}>
                {fmtDate(e.at)} · {e.files.map((f) => f.name).join(', ')} · rev {e.rev}
                {e.by ? ` · ${e.by} (self-declared)` : ''}
              </li>
            ))}
          </ul>
        ) : (
          <p className="pj-small pj-muted">No export yet.</p>
        )}
      </section>
    </div>
  )
}

function UpcomingDetail({ week }: { week: number }) {
  const w = WEEKS.find((x) => x.number === week)!
  return (
    <div className="pj-stack" data-testid={`milestone-${week}-detail`}>
      <div className="pj-row">
        <Chip tone="neutral">Upcoming</Chip>
        <span className="pj-small">Opens in Week {week}. {w.models?.length ? `Models the Phase I work of Week ${w.models.join(' and Week ')}.` : ''}</span>
      </div>
      <section className="pj-card" aria-labelledby={`m${week}-exp`}>
        <h2 id={`m${week}-exp`} className="pj-h2">What this week adds</h2>
        <p className="pj-small" style={{ marginTop: 0 }}>{w.output}</p>
        <ul style={{ margin: 0, paddingLeft: 18 }} className="pj-small">
          {(EXPECTED[week] ?? []).map((e, i) => (
            <li key={i}>
              <strong>{typeLabel(e.type)}</strong> <span className="pj-mono pj-muted">{e.type}</span>
              {e.min ? `: at least ${e.min}` : ''}
              {e.rule ? ` (${e.rule})` : ''}
            </li>
          ))}
        </ul>
        <p className="pj-caption" style={{ marginBottom: 0 }}>Minimums come from the week’s lab brief where one exists; weeks without a lab brief yet are provisional. The week’s editor joins My Project as its lab tool is connected (Weeks 2–5 next).</p>
      </section>
    </div>
  )
}

export function Milestones({ week }: { week?: number }) {
  const doc = useProjectState().doc!
  const valid = week && week >= 1 && week <= 14 ? week : undefined
  return (
    <div className="pj-stack" data-testid="project-milestones">
      <div>
        <h1 className="pj-h1">{valid ? `Week ${valid} · ${WEEKS[valid - 1].title}` : 'Weekly milestones'}</h1>
        <p className="pj-lede">{valid ? `${phaseOf(valid)} · ${weekState(doc, valid).label}` : 'One continuous project: Phase I builds the engineering package of your enterprise, Phase II turns the same package into a SysML v2 model.'}</p>
      </div>
      <div className="pj-card">
        <MilestoneStrip doc={doc} current={valid} />
      </div>
      {valid === 1 && <Week1Detail doc={doc} />}
      {valid && valid > 1 && <UpcomingDetail week={valid} />}
      {!valid && (
        <div className="pj-table-wrap pj-card" style={{ padding: 0 }}>
          <table className="pj-table">
            <caption className="sr-only">The fourteen weekly milestones</caption>
            <thead>
              <tr>
                <th scope="col">Week</th>
                <th scope="col">Title</th>
                <th scope="col">State</th>
                <th scope="col" className="pj-hide-sm">Expected artifacts</th>
              </tr>
            </thead>
            <tbody>
              {WEEKS.map((w) => (
                <tr key={w.number}>
                  <td>
                    <Link to={`/project/milestones/${w.number}`}>Week {w.number}</Link>
                  </td>
                  <td>{w.title}</td>
                  <td>{weekState(doc, w.number).label}</td>
                  <td className="pj-hide-sm pj-small">{(EXPECTED[w.number] ?? []).map((e) => e.type).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
