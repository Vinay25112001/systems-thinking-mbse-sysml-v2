// Review & Submit, Week 1 (#/week/1/review; M6; directive §16; spec §g). The package review in five numbered sections
// (enterprise and team; stakeholders, concerns, relationships and conflicts; needs and traceability; sources and
// rationale; outstanding issues with the team's notes), the states DRAFT / READY FOR REVIEW / SUBMITTED / APPROVED or
// RETURNED FOR REVISION, the immutable submission snapshot (course server), and the instructor's feedback. Automated
// checks never substitute for faculty assessment, and the page says so next to every check summary.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '../../lib/router'
import { api, ApiFailure } from '../../services/backend'
import { WEEK1_QUIZ } from '../../content/quizWeek1'
import { Quiz } from '../../components/Quiz'
import { bloomLabel } from '../../flow/route'
import { FlowProvider } from '../../flow/state'
import { ObjectiveStatus } from '../../flow/CheckSubmit'
import { exportProject, exportReport, exportWeek1Files } from '../../project/pages/actions'
import { EditAccess } from '../../project/pages/EditAccess'
import { fmtDate, SaveStatus } from '../../project/pages/ui'
import { CreateProject } from '../../project/pages/CreateProject'
import { useProjectState, useProjectStore } from '../../project/store/ProjectProvider'
import { PART_STATE_LABEL, type PartId } from '../../project/canvas/progress'
import { WEEK1_PATHS } from '../route'
import { reviewModel, SEVERITY_LABEL, validationReport, type ReviewIssue } from './report'
import '../../project/pages/project.css'
import '../../project/canvas/canvas.css'

type Submission = { id: string; week: number; state: 'submitted' | 'approved' | 'returned' | 'superseded'; snapshotId: string; fingerprint: string; rev: number; proposalState: string; submittedAt: string; submittedBy: string | null; decidedAt: string | null; decidedBy: string | null; feedback: string; anchors: { artifactId: string; text: string }[]; notes: Record<string, string> }
type Approval = { state: string } | null
const STATE_TEXT = { draft: 'DRAFT', 'ready-for-review': 'READY FOR REVIEW', submitted: 'SUBMITTED', approved: 'APPROVED', returned: 'RETURNED FOR REVISION' } as const
type PackageState = keyof typeof STATE_TEXT
const TONE: Record<PackageState, string> = { draft: 'not-started', 'ready-for-review': 'draft', submitted: 'draft', approved: 'meets', returned: 'missing' }
const fix = (p: PartId) => (p === 'overview' ? WEEK1_PATHS.project : `${WEEK1_PATHS.project}/${p}`)
const ADVISORY = 'These are the course’s automated structural checks. They show the package is complete enough to review, not that it is right; they never substitute for your instructor’s assessment.'

function Section({ n, title, testId, children }: { n: number; title: string; testId: string; children: React.ReactNode }) {
  return (
    <section className="cv-card" aria-labelledby={`rs-${n}-h`} data-testid={testId}>
      <h2 id={`rs-${n}-h`}>
        {n}. {title}
      </h2>
      {children}
      <p className="cv-note">{ADVISORY}</p>
    </section>
  )
}
function Issues({ list }: { list: ReviewIssue[] }) {
  if (!list.length) return <p className="pj-small" style={{ color: 'var(--pj-ok)' }}>No open item in this section.</p>
  return (
    <ul className="cv-issues">
      {list.slice(0, 8).map((i) => (
        <li key={i.key}>
          {i.text}{' '}
          <Link to={fix(i.part)} className="pj-small">
            Fix in My Project
          </Link>
        </li>
      ))}
      {list.length > 8 && <li>and {list.length - 8} more (see section 5)</li>}
    </ul>
  )
}

export default function ReviewSubmit() {
  const st = useProjectState()
  const store = useProjectStore()
  const serverMode = st.storage === 'http'
  const uid = st.doc?.project.uid
  const [subs, setSubs] = useState<Submission[] | null>(null)
  const [approval, setApproval] = useState<Approval | undefined>(undefined)
  const [msg, setMsg] = useState('')
  const [confirming, setConfirming] = useState(false)
  const confirmHead = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (confirming) confirmHead.current?.focus() // the confirmation takes focus when it opens (review L-15)
  }, [confirming])
  const [ack, setAck] = useState(false)
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    if (!serverMode || !uid) return
    try {
      const [s, a] = await Promise.all([api<{ submissions: Submission[] }>('GET', `/projects/${encodeURIComponent(uid)}/submissions`), api<{ approval: Approval }>('GET', `/projects/${encodeURIComponent(uid)}/approval`)])
      setSubs(s.data.submissions)
      setApproval(a.data.approval)
    } catch (e) {
      setMsg(e instanceof ApiFailure ? e.error.message : 'The submission status could not be loaded.')
    }
  }, [serverMode, uid])
  useEffect(() => {
    void load()
  }, [load])
  const m = useMemo(() => (st.doc ? reviewModel(st.doc, { serverMode, approvalRequested: !!approval }) : null), [st.doc, serverMode, approval])
  if (!st.ready) return <p role="status">Opening your project…</p>
  if (!st.doc || !m)
    return (
      <div className="pj-scope wk-page" data-testid="review-no-project">
        <h1 className="lf-h1">Review &amp; Submit</h1>
        <p className="lf-lede">Create your team’s project in My Project first; this page reviews it and submits it.</p>
        <CreateProject after={WEEK1_PATHS.review} />
        <QuizDrawer />
      </div>
    )
  const doc = st.doc
  const latest = subs?.filter((s) => s.week === 1).at(-1) ?? null
  const pkg: PackageState = latest && latest.state !== 'superseded' ? latest.state : m.teamReview
  const changesSince = latest ? st.changes.filter((c) => c.rev > latest.rev).length || Math.max(0, doc.rev - latest.rev) : 0
  const notes = doc.milestones.find((x) => x.week === 1)?.notes ?? {}
  const setNote = (key: string, v: string) =>
    store?.apply((d) => {
      const m1 = d.milestones.find((x) => x.week === 1)!
      const next = { ...m1.notes, [key]: v }
      if (!v.trim()) delete next[key]
      return [{ op: 'update-milestone', week: 1, fields: [{ path: 'notes', before: m1.notes as never, after: next as never }] }]
    }, { summary: 'Recorded a note on an open review item' })
  const markReady = (ready: boolean) =>
    store?.apply((d) => {
      const m1 = d.milestones.find((x) => x.week === 1)!
      return [{ op: 'update-milestone', week: 1, fields: [{ path: 'teamReview', before: m1.teamReview as never, after: (ready ? { state: 'ready-for-review', by: st.editor || 'team', at: new Date().toISOString() } : undefined) as never }] }]
    }, { summary: ready ? 'Marked Week 1 ready for review' : 'Set Week 1 back to draft', noCoalesce: true })
  const submit = async () => {
    if (!uid) return
    setBusy(true)
    setMsg('')
    try {
      await store?.flush()
      // M6 review M-4: submit only what was saved and reviewed; the server refuses if the revision moved meanwhile
      const s = store?.getState()
      if (s && (s.save.kind === 'pending' || s.save.kind === 'saving' || s.save.kind === 'error' || s.save.kind === 'conflict' || store!.hasUnsaved())) {
        setMsg('Your latest changes are not saved on the course server yet, so the package cannot be submitted. Wait for “Saved” (or resolve the save problem shown above), review again, then submit.')
        return
      }
      const fresh = store?.getState().doc ?? doc
      const model = reviewModel(fresh, { serverMode, approvalRequested: !!approval })
      const notesNow = fresh.milestones.find((x) => x.week === 1)?.notes ?? {}
      await api('POST', `/projects/${encodeURIComponent(uid)}/submissions`, { week: 1, rev: fresh.rev, confirm: true, notes: notesNow, validation: validationReport(model, new Date().toISOString()) })
      setConfirming(false)
      setAck(false)
      await load()
    } catch (e) {
      setMsg(e instanceof ApiFailure ? e.error.message : 'The package was not submitted.')
      if (e instanceof ApiFailure && e.error.status === 409) await store?.pollRemote()
    } finally {
      setBusy(false)
    }
  }
  const sec = (n: 1 | 2 | 3 | 4) => m.issues.filter((i) => i.section === n)
  const r = m.progress.record
  const part = (id: PartId) => m.progress.parts.find((p) => p.id === id)!
  const download = (f: (s: NonNullable<typeof store>) => Promise<string>) => store && void f(store).then(setMsg)

  return (
    <div className="pj-scope cv-root wk-page" data-testid="week1-review">
      <header className="cv-banner">
        <div>
          <span className="cv-kicker">Week 1 · Review &amp; Submit</span>
          <h1>{r.proposal.name || 'Your enterprise'}: review the package</h1>
          <span className="pj-small pj-muted">{ADVISORY}</span>
        </div>
        <div className="cv-banner-actions">
          <span data-testid="package-state" data-state={pkg}>
            <span className="cv-state" data-state={TONE[pkg]}>
              {STATE_TEXT[pkg]}
            </span>
          </span>
          <SaveStatus save={st.save} storage={st.storage} />
        </div>
      </header>
      <EditAccess st={st} store={store} />
      {msg && (
        <p className="cv-infobox" role="status" data-testid="review-msg">
          {msg}
        </p>
      )}
      <div className="cv-layout" style={{ gridTemplateColumns: 'minmax(0,1fr) 340px' }}>
        <div className="cv-work">
          <Section n={1} title="Enterprise, team, mission and objectives" testId="review-s1">
            <dl className="pj-small" style={{ margin: 0 }}>
              <dt style={{ fontWeight: 600 }}>Enterprise</dt>
              <dd style={{ margin: '0 0 6px' }}>ENT-001 {r.proposal.name || '—'} · approval: {!serverMode ? 'on the course server (not available in this browser edition)' : approval ? approval.state.replace(/-/g, ' ') : 'not yet requested'}</dd>
              <dt style={{ fontWeight: 600 }}>Mission and objectives</dt>
              <dd style={{ margin: '0 0 6px' }}>
                MGO-001 {r.proposal.purpose || '—'}
                {r.proposal.goals.map((g) => (
                  <span key={g.id} style={{ display: 'block' }}>
                    {g.id} {g.text}
                  </span>
                ))}
              </dd>
              <dt style={{ fontWeight: 600 }}>Team and roles</dt>
              <dd style={{ margin: '0 0 6px' }}>{Object.entries(r.charter.roles).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—'} · charter {PART_STATE_LABEL[part('team').state].toLowerCase()}</dd>
            </dl>
            <Issues list={sec(1)} />
          </Section>
          <Section n={2} title="Stakeholders, concerns, relationships and conflicts" testId="review-s2">
            <ul className="pj-small" style={{ paddingLeft: 18 }}>
              {(['stakeholders', 'concerns', 'relationships'] as PartId[]).map((id) => {
                const p = part(id)
                return (
                  <li key={id}>
                    {p.label}: {p.count ? `${p.count.complete} of ${p.count.required} complete` : PART_STATE_LABEL[p.state]} ({PART_STATE_LABEL[p.state]})
                  </li>
                )
              })}
              <li>Conflicts recorded: {m.conflicts.length ? m.conflicts.map((c) => `${c.rel} (${c.text})`).join('; ') : 'none'}</li>
            </ul>
            <Issues list={sec(2)} />
          </Section>
          <Section n={3} title="Needs and traceability completeness" testId="review-s3">
            <div className="cv-tablewrap">
              <table className="cv-table" data-testid="review-traces">
                <caption className="cv-sr">Each need and whether it traces to a stakeholder, a concern and an objective</caption>
                <thead>
                  <tr>
                    <th scope="col">Need</th>
                    <th scope="col">Stakeholder</th>
                    <th scope="col">Concern</th>
                    <th scope="col">Mission or objective</th>
                    <th scope="col">Meets the checks</th>
                  </tr>
                </thead>
                <tbody>
                  {m.traces.map((t) => (
                    <tr key={t.need}>
                      <th scope="row" className="cv-id">{t.need}</th>
                      <td>{t.stakeholder ? 'yes' : 'missing'}</td>
                      <td>{t.concern ? 'yes' : 'missing'}</td>
                      <td>{t.objective ? 'yes' : 'missing'}</td>
                      <td>{t.counts ? 'yes' : 'not yet'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="pj-small">Coverage: {m.coverage.filter((c) => !c.needs.length).length} stakeholder(s) without a need{m.coverage.some((c) => !c.needs.length && c.reason) ? ` (${m.coverage.filter((c) => !c.needs.length && c.reason).length} with a recorded reason)` : ''}.</p>
            <Issues list={sec(3)} />
          </Section>
          <Section n={4} title="Sources and rationale quality" testId="review-s4">
            <ul className="pj-small" style={{ paddingLeft: 18 }}>
              <li>Needs without a rationale: {m.rationaleMissing.join(', ') || 'none'}</li>
              <li>AI usage statement: {m.aiStatement ? 'recorded' : 'missing'}</li>
              <li>Items marked AI-assisted and reviewed: {m.aiItems.join(', ') || 'none'}</li>
              <li>AeroLink practice copies not adapted: {m.templates.join(', ') || 'none'}</li>
            </ul>
            <Issues list={sec(4)} />
          </Section>
          <section className="cv-card" aria-labelledby="rs-5-h" data-testid="review-s5">
            <h2 id="rs-5-h">5. Outstanding issues</h2>
            <p className="cv-lede">Every open item from sections 1–4. Only items marked “Blocks submission” stop a submission; for any other item you may leave a note that travels with the package.</p>
            {m.issues.length === 0 ? (
              <p className="pj-small" style={{ color: 'var(--pj-ok)' }}>No open item.</p>
            ) : (
              <div className="cv-tablewrap">
                <table className="cv-table cv-cards" data-testid="review-issues">
                  <thead>
                    <tr>
                      <th scope="col">Severity</th>
                      <th scope="col">Item</th>
                      <th scope="col">Team’s note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.issues.map((i) => (
                      <tr key={i.key}>
                        <td data-label="Severity">
                          <span className="cv-state" data-state={i.severity === 'blocks' ? 'missing' : i.severity === 'should-fix' ? 'draft' : 'not-started'}>
                            {SEVERITY_LABEL[i.severity]}
                          </span>
                        </td>
                        <td data-label="Item" className="pj-small">
                          {i.text} <Link to={fix(i.part)}>Fix in My Project</Link>
                        </td>
                        <td data-label="Team’s note">
                          {i.severity !== 'blocks' && <NoteField label={`Note on: ${i.text.slice(0, 60)}`} value={notes[i.key] ?? ''} disabled={st.readOnly} onCommit={(v) => setNote(i.key, v)} />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <QuizDrawer />
        </div>

        <aside className="cv-panel" aria-label="Submission" data-testid="review-summary">
          <div className="cv-panel-body">
            <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Package</h2>
            <p className="pj-small" style={{ margin: '0 0 8px' }}>
              {m.progress.headline.meets} of {m.progress.headline.required} required parts meet the course checks · {m.issues.length} open item{m.issues.length === 1 ? '' : 's'}
              {m.blocks.length ? ` · ${m.blocks.length} blocking` : ''}
            </p>
            <p className="cv-note">{ADVISORY}</p>
            {pkg === 'draft' && (
              <button type="button" className="pj-btn" onClick={() => markReady(true)} disabled={st.readOnly} data-testid="mark-ready">
                Mark ready for review
              </button>
            )}
            {pkg === 'ready-for-review' && (
              <>
                <p className="pj-small">Marked ready by {doc.milestones.find((x) => x.week === 1)?.teamReview?.by || 'a teammate'}: a teammate should look before you submit.</p>
                <button type="button" className="pj-btn small" onClick={() => markReady(false)} disabled={st.readOnly} data-testid="back-to-draft">
                  Back to draft
                </button>
              </>
            )}
            {serverMode ? (
              <div style={{ marginTop: 12 }}>
                {pkg !== 'approved' && (
                  <button type="button" className="pj-btn primary" disabled={st.readOnly || m.blocks.length > 0 || busy} onClick={() => setConfirming(true)} data-testid="submit-open">
                    {pkg === 'returned' ? 'Resubmit Week 1' : pkg === 'submitted' ? 'Submit again (replaces the undecided submission)' : 'Submit Week 1'}
                  </button>
                )}
                {m.blocks.length > 0 && <p className="pj-small">To submit: {m.blocks.join(' ')}</p>}
                {confirming && (
                  <div className="cv-warnbox" role="dialog" aria-modal="false" aria-labelledby="rs-confirm-h" data-testid="submit-confirm" style={{ marginTop: 8 }}>
                    <h3 id="rs-confirm-h" style={{ marginTop: 0 }} tabIndex={-1} ref={confirmHead}>
                      Submit Week 1?
                    </h3>
                    <ul className="pj-small" style={{ paddingLeft: 16 }}>
                      <li>The whole project at revision {doc.rev}, frozen as an unchangeable snapshot on the course server.</li>
                      <li>The validation report shown on this page and your notes on {Object.keys(notes).length} open item{Object.keys(notes).length === 1 ? '' : 's'}.</li>
                      <li>Submitted by you, the signed-in team member. Your team keeps working afterwards; the snapshot does not change.</li>
                      {approval?.state === 'pending' && <li>The enterprise proposal is still pending: the package is labelled “submitted for approval”.</li>}
                    </ul>
                    <label className="pj-small" style={{ display: 'flex', gap: 8 }}>
                      <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} data-testid="submit-ack" /> Our team has reviewed this package
                    </label>
                    <div className="cv-toolbar" style={{ marginTop: 8 }}>
                      <button type="button" className="pj-btn primary" disabled={!ack || busy} onClick={() => void submit()} data-testid="submit-confirm-btn">
                        {busy ? 'Submitting…' : 'Submit'}
                      </button>
                      <button type="button" className="pj-btn" onClick={() => (setConfirming(false), setTimeout(() => document.querySelector<HTMLElement>('[data-testid="submit-open"]')?.focus(), 0))}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="cv-infobox" style={{ marginTop: 12 }} data-testid="submit-offline">
                <strong>Submission happens on the course server.</strong> This project is saved in this browser only. Download the package below and follow your instructor’s submission instructions (for example the LMS assignment); sign in to the course server to submit in the app.
              </div>
            )}
            {latest && (
              <div style={{ marginTop: 14 }} data-testid="submission-latest">
                <h3 style={{ fontSize: '1rem' }}>Latest submission</h3>
                <p className="pj-small" style={{ margin: 0 }}>
                  {STATE_TEXT[latest.state === 'superseded' ? 'submitted' : latest.state]} · {fmtDate(latest.submittedAt)}{latest.submittedBy ? ` by ${latest.submittedBy}` : ''} · version {latest.snapshotId} · fingerprint <span className="cv-id">{latest.fingerprint.slice(0, 10)}…</span>
                </p>
                {latest.proposalState === 'pending' && <p className="cv-note">Submitted for approval: the proposal was pending at submission.</p>}
                {changesSince > 0 && <p className="pj-small" data-testid="changes-since">Changes since submission: {changesSince} (the submitted snapshot is unchanged).</p>}
                {latest.feedback && (
                  <blockquote className="cv-infobox" data-testid="submission-feedback" style={{ margin: '6px 0' }}>
                    <strong>Instructor feedback{latest.decidedBy ? ` (${latest.decidedBy}, ${fmtDate(latest.decidedAt ?? '')})` : ''}:</strong> {latest.feedback}
                  </blockquote>
                )}
                {latest.anchors.length > 0 && (
                  <ul className="pj-small" style={{ paddingLeft: 16 }} data-testid="submission-anchors">
                    {latest.anchors.map((a, k) => (
                      <li key={k}>
                        <Link to={`/project/artifact/${encodeURIComponent(a.artifactId)}`}>Instructor feedback on {a.artifactId}</Link>: {a.text} <span className="pj-muted">(snapshot {latest.snapshotId})</span>
                      </li>
                    ))}
                  </ul>
                )}
                {subs && subs.length > 1 && <p className="cv-note">{subs.length - 1} earlier submission{subs.length > 2 ? 's are' : ' is'} kept in the history.</p>}
              </div>
            )}
            <h3 style={{ fontSize: '1rem', marginTop: 14 }}>Package files</h3>
            <div style={{ display: 'grid', gap: 6 }}>
              <button type="button" className="pj-btn small" onClick={() => download(exportReport)} data-testid="review-report">
                Download Engineering Report
              </button>
              <button type="button" className="pj-btn small" onClick={() => download(exportProject)}>
                Export Project
              </button>
              <button type="button" className="pj-btn small" onClick={() => download(exportWeek1Files)}>
                Week 1 files for the LMS (.md and .json)
              </button>
            </div>
            <p className="cv-note">Where the grade is recorded: as your instructor announces (in this app and, if used, the LMS).</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

/** The optional readiness quiz (individual, formative) and where the student stands by objective (M4a, kept). */
function QuizDrawer() {
  return (
    <details className="cv-card" data-testid="review-quiz">
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Optional: readiness quiz and where you stand by objective (individual, formative, not graded)</summary>
      <FlowProvider>
        <Quiz questions={WEEK1_QUIZ} bloomText={bloomLabel} studentSafe />
        <h3 style={{ fontSize: '1rem' }}>Where you stand, by objective</h3>
        <ObjectiveStatus />
      </FlowProvider>
    </details>
  )
}

function NoteField({ label, value, onCommit, disabled }: { label: string; value: string; onCommit: (v: string) => void; disabled?: boolean }) {
  const [v, setV] = useState(value)
  useEffect(() => setV(value), [value])
  return <input className="cv-input" aria-label={label} value={v} disabled={disabled} onChange={(e) => setV(e.target.value)} onBlur={() => v !== value && onCommit(v)} placeholder="Why the team leaves it (optional)" />
}
