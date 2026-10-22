// Canvas parts: Team & charter, Enterprise & mission (with the instructor approval box), Boundary & context. Every field
// writes through the canvas context (one canonical model); criteria and issues come from canvasProgress.
import { Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { COURSE_ROLES, MERGED_ROLE } from '../../workbench/week1/logic'
import { checkProposalContent, nextId, type ContextRow, type TeamRecord } from '../../workbench/week1/team'
import { api, ApiFailure } from '../../services/backend'
import { useProjectStore } from '../store/ProjectProvider'
import { fmtDate } from '../pages/ui'
import { setEnterpriseField } from './canvasModel'
import { Field, StateChip, useCanvas } from './ctx'
import { ITEM_STATE_LABEL, PART_STATE_LABEL, type PartId, type PartProgress } from './progress'

const num = (id: string) => Number(id.split('-')[1]) || 0
export const confirmRemove = (what: string) => typeof window === 'undefined' || window.confirm(`Remove ${what}? Its ID stays taken (IDs are never reused); the change is kept in the history and can be undone.`)

/** The part's heading, its state, its criteria as a checklist and what is still missing. */
export function PartHead({ p, lede, children }: { p: PartProgress; lede: string; children?: React.ReactNode }) {
  return (
    <div className="cv-card" data-testid={`part-head-${p.id}`}>
      <div className="cv-toolbar" style={{ marginBottom: 4 }}>
        <h2 id={`cv-${p.id}-h`}>{p.label}</h2>
        <StateChip state={p.state}>{PART_STATE_LABEL[p.state]}</StateChip>
        {p.count && (
          <span className="pj-small pj-muted" data-testid={`part-count-${p.id}`}>
            {p.count.complete} of {p.count.required} complete{p.count.present !== p.count.complete ? ` · ${p.count.present} recorded` : ''}
          </span>
        )}
        {children}
      </div>
      <p className="cv-lede">{lede}</p>
      <details>
        <summary className="pj-small" style={{ cursor: 'pointer', fontWeight: 600 }}>
          Criteria ({p.criteria.filter((x) => x.ok).length} of {p.criteria.length} met)
        </summary>
        <ul className="cv-criteria" data-testid={`criteria-${p.id}`}>
          {p.criteria.map((x) => (
            <li key={x.text} data-ok={x.ok}>
              {x.text}
            </li>
          ))}
        </ul>
        <p className="cv-note">These are the course’s structural checks. They show the work is complete enough to review, not that it is right; your instructor decides that.</p>
      </details>
      {p.issues.length > 0 && (
        <ul className="cv-issues" aria-label={`Still needed in ${p.label}`} data-testid={`issues-${p.id}`}>
          {p.issues.slice(0, 5).map((x) => (
            <li key={x}>{x}</li>
          ))}
          {p.issues.length > 5 && <li>and {p.issues.length - 5} more (open an item to see its own list)</li>}
        </ul>
      )}
    </div>
  )
}
export const partOf = (c: ReturnType<typeof useCanvas>, id: PartId) => c.progress.parts.find((p) => p.id === id)!
export function ItemChip({ c, uid }: { c: ReturnType<typeof useCanvas>; uid: string }) {
  for (const p of c.progress.parts) {
    const it = p.items.find((x) => x.uid === uid || x.id === uid)
    if (it) return <StateChip state={it.state}>{ITEM_STATE_LABEL[it.state]}</StateChip>
  }
  return null
}

// ------------------------------------------------------------------------------------------- team & charter
export function TeamPart() {
  const c = useCanvas()
  const r = c.rec
  const ch = r.charter
  const setCharter = (p: Partial<TeamRecord['charter']>) => c.editRecord((x) => ({ ...x, charter: { ...x.charter, ...p } }))
  const roles = COURSE_ROLES.filter((role) => !(ch.threePersonTeam && role === MERGED_ROLE))
  return (
    <section aria-labelledby="cv-team-h" data-testid="part-team">
      <PartHead p={partOf(c, 'team')} lede="Who leads what, how the team decides and talks, and who owns each kind of record. In a course-server project the members come from the team’s accounts." />
      <div className="cv-card">
        <h3>Members</h3>
        {c.doc.team.members.length ? (
          <ul className="pj-small" data-testid="team-members" style={{ margin: '0 0 8px', paddingLeft: 18 }}>
            {c.doc.team.members.filter((m) => m.active).map((m) => (
              <li key={m.initials}>
                <span className="cv-id">{m.initials}</span> {m.displayName ?? ''}
              </li>
            ))}
          </ul>
        ) : (
          <p className="pj-small pj-muted">{c.serverMode ? 'The team’s members appear here from their accounts.' : 'Members are recorded by their initials in the lead roles below.'}</p>
        )}
        <label className="pj-small" style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0 12px' }}>
          <input type="checkbox" checked={ch.threePersonTeam} disabled={c.readOnly} onChange={(e) => setCharter({ threePersonTeam: e.target.checked })} data-testid="three-person" />
          Three-person team (AI &amp; Data Management merges with Architecture; reduced needs minimum)
        </label>
        <h3>Lead roles</h3>
        <div className="cv-grid2">
          {roles.map((role) => (
            <Field key={role} gk="charter.roles" label={role} value={ch.roles[role] ?? ''} onCommit={(v) => setCharter({ roles: { ...c.rec.charter.roles, [role]: v.toUpperCase() } })} testId={`role-${role}`} mono />
          ))}
        </div>
        <Field gk="charter.decisionRules" label="Decision rules" kind="textarea" rows={2} value={ch.decisionRules} onCommit={(v) => setCharter({ decisionRules: v })} testId="charter-rules" />
        <Field gk="charter.norms" label="Communication norms" kind="textarea" rows={2} value={ch.norms} onCommit={(v) => setCharter({ norms: v })} testId="charter-norms" />
        <Field gk="charter.prefixes" label="Owned ID prefixes (one member per line)" kind="textarea" rows={3} value={ch.prefixes} onCommit={(v) => setCharter({ prefixes: v })} hint="For example “JS: STK, CON, NEED”. Every Week 1 prefix (ENT, PRT, EXT, STK, CON, NEED, REL) needs one owner." testId="charter-prefixes" />
      </div>
      <div className="cv-card">
        <h3 style={{ marginTop: 0 }}>AI usage statement</h3>
        <Field gk="aiStatement" label="AI usage statement" kind="textarea" rows={3} value={r.aiStatement} onCommit={(v) => c.editRecord({ aiStatement: v })} hint="Tool, purpose, prompts, what you accepted or rejected and why; or that no AI tool was used. You stay responsible for every value." testId="ai-statement" />
      </div>
    </section>
  )
}

// ------------------------------------------------------------------------------------------- approval
type ApprovalView = { id: string; state: 'pending' | 'approved' | 'approved-changes-pending' | 'revision-requested' | 'withdrawn'; requestedAt: string; requestedBy: string | null; decidedAt: string | null; decidedBy: string | null; comment: string; changedAt?: string | null }
const APPROVAL_TEXT: Record<ApprovalView['state'], string> = {
  pending: 'Pending instructor review',
  approved: 'Approved by the instructor',
  'approved-changes-pending': 'Approved — changes pending re-review',
  'revision-requested': 'Revision requested',
  withdrawn: 'Withdrawn',
}
const APPROVAL_TONE: Record<ApprovalView['state'], string> = { pending: 'draft', approved: 'meets', 'approved-changes-pending': 'draft', 'revision-requested': 'missing', withdrawn: 'not-started' }

/** Enterprise approval (directive §12, spec MP-10…MP-14): the team requests, the instructor decides on the course
 *  server, the team sees the state and the comment. No self-declared approval anywhere; offline says so honestly. */
export function ApprovalBox() {
  const c = useCanvas()
  const store = useProjectStore()
  const uid = c.doc.project.uid
  const [a, setA] = useState<ApprovalView | null | undefined>(undefined)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    if (!c.serverMode) return
    try {
      setA((await api<{ approval: ApprovalView | null }>('GET', `/projects/${encodeURIComponent(uid)}/approval`)).data.approval)
    } catch (e) {
      setMsg(e instanceof ApiFailure ? e.error.message : 'The approval status could not be loaded.')
    }
  }, [c.serverMode, uid])
  useEffect(() => {
    void load()
  }, [load, c.doc.rev])
  const legacy = c.progress.approval
  if (!c.serverMode)
    return (
      <div className="cv-infobox" data-testid="approval-offline" role="note">
        <strong>Instructor approval happens on the course server.</strong> This project is saved in this browser only, so it cannot be sent for approval from here. Sign in to your team’s project on the course server to request approval; your instructor decides there.
        {legacy.state === 'self-reported' && (
          <p className="pj-small" style={{ margin: '6px 0 0' }} data-testid="approval-legacy">
            An earlier version of the lab tool recorded “{legacy.decidedOn ? `${c.rec.proposal.decision} on ${legacy.decidedOn}` : c.rec.proposal.decision}” here. That value was typed by the team, not set by the instructor; it is kept read-only and is not an approval.
          </p>
        )}
      </div>
    )
  const request = async () => {
    setBusy(true)
    setMsg('')
    try {
      await store?.flush()
      await api('POST', `/projects/${encodeURIComponent(uid)}/approval-requests`, {})
      await load()
      await store?.pollRemote()
    } catch (e) {
      setMsg(e instanceof ApiFailure ? e.error.message : 'The request could not be sent.')
    } finally {
      setBusy(false)
    }
  }
  // "Request instructor approval" is enabled when the proposal's course checks pass (spec MP-10: checkProposal content,
  // including the elements inside the boundary) and the enterprise is described (M6 field)
  const content = { issues: [...checkProposalContent(c.rec.proposal).issues, ...partOf(c, 'enterprise').issues.filter((x) => /^Describe the enterprise/.test(x))] }
  const canRequest = !a || a.state === 'revision-requested' || a.state === 'withdrawn' || a.state === 'approved-changes-pending'
  const changedSinceRequest = a?.state === 'pending' && c.doc.project.updatedAt > a.requestedAt
  return (
    <div className="cv-card" data-testid="approval-box" aria-live="polite">
      <div className="cv-toolbar">
        <h3 style={{ margin: 0 }}>Instructor approval</h3>
        {a === undefined ? (
          <span className="pj-small pj-muted">Loading…</span>
        ) : a ? (
          <span data-testid="approval-state" data-state={a.state}>
            <StateChip state={APPROVAL_TONE[a.state]}>{APPROVAL_TEXT[a.state]}</StateChip>
          </span>
        ) : (
          <span data-testid="approval-state" data-state="none">
            <StateChip state="not-started">Not yet submitted for approval</StateChip>
          </span>
        )}
      </div>
      {a && (
        <p className="pj-small" style={{ margin: '0 0 6px' }}>
          {a.state === 'pending' ? `Requested ${fmtDate(a.requestedAt)}${a.requestedBy ? ` by ${a.requestedBy}` : ''}. Keep working: stakeholders and needs are not blocked while your instructor reviews.` : a.decidedAt ? `Decided ${fmtDate(a.decidedAt)}${a.decidedBy ? ` by ${a.decidedBy}` : ''}.` : ''}
        </p>
      )}
      {changedSinceRequest && <p className="cv-note" data-testid="approval-changed-since">Changed since your request; the instructor reviews the version you sent on {fmtDate(a!.requestedAt)}.</p>}
      {a?.state === 'approved-changes-pending' && (
        <div className="cv-warnbox" data-testid="approval-rereview">
          The enterprise, its description, problem, mission, objectives or system boundary changed after the approval. Your instructor sees exactly what changed and re-approves it or asks for a revision; you can also send the changed proposal now.
        </div>
      )}
      {a?.comment && (
        <blockquote className="cv-infobox" data-testid="approval-comment" style={{ margin: '6px 0' }}>
          <strong>Instructor’s comment:</strong> {a.comment}
        </blockquote>
      )}
      {canRequest && a !== undefined && (
        <div className="cv-toolbar" style={{ marginTop: 8 }}>
          <button type="button" className="pj-btn primary" disabled={busy || c.readOnly || content.issues.length > 0} onClick={() => void request()} data-testid="request-approval">
            {a?.state === 'revision-requested' ? 'Send the revised proposal for approval' : a?.state === 'approved-changes-pending' ? 'Send the changed proposal for re-review' : 'Request instructor approval'}
          </button>
          {content.issues.length > 0 && <span className="pj-small pj-muted" data-testid="request-blocked">Enabled when the proposal meets the course checks ({content.issues.length} still open: {content.issues[0]})</span>}
        </div>
      )}
      {msg && (
        <p className="pj-small" role="alert" style={{ color: 'var(--pj-bad)' }}>
          {msg}
        </p>
      )}
    </div>
  )
}

// ------------------------------------------------------------------------------------------- enterprise & mission
export function EnterprisePart() {
  const c = useCanvas()
  const p = c.rec.proposal
  const ent = Object.values(c.doc.artifacts).find((a) => a.type === 'ENT' && a.status === 'active')
  const setP = (q: Partial<TeamRecord['proposal']>) => c.editRecord((x) => ({ ...x, proposal: { ...x.proposal, ...q } }))
  const addObjective = () => {
    const id = nextId(c.rec, 'MGO')
    c.editRecord((x) => ({ ...x, proposal: { ...x.proposal, goals: [...x.proposal.goals, { id, text: '' }] }, issued: { ...x.issued, MGO: num(id) } }))
  }
  return (
    <section aria-labelledby="cv-enterprise-h" data-testid="part-enterprise">
      <PartHead p={partOf(c, 'enterprise')} lede="Your team’s own enterprise (never AeroLink): who it is, the problem it addresses, its mission and objectives, and the system of interest. Send it for instructor approval when the checks pass; the rest of the project is not blocked while you wait." />
      {c.serverMode && c.progress.approval.state === 'approved' && (
        <div className="cv-warnbox" role="note" data-testid="material-guard">
          {c.materialLocked ? (
            <>
              <strong>Approved by your instructor.</strong> Changing the enterprise name, description, problem statement, mission, objectives or system boundary marks the proposal “approved — changes pending re-review”, and your instructor sees what changed. Stakeholder and need edits do not affect the approval.{' '}
              <button type="button" className="pj-btn small" onClick={() => (c.unlockMaterial(), setTimeout(() => document.querySelector<HTMLElement>('[data-testid="ent-name"]')?.focus(), 0))} data-testid="unlock-material" disabled={c.readOnly}>
                I understand: edit the approved proposal
              </button>
            </>
          ) : (
            <>Editing the approved proposal: a change here will need instructor re-review.</>
          )}
        </div>
      )}
      <ApprovalBox />
      <div className="cv-card">
        <div className="cv-grid2">
          <Field gk="ent.name" label="Enterprise name (ENT-001)" value={p.name} onCommit={(v) => setP({ name: v })} testId="ent-name" />
          <Field gk="ent.domain" label="Domain" value={p.domain} onCommit={(v) => setP({ domain: v })} testId="ent-domain" />
        </div>
        <Field gk="ent.description" label="Enterprise description" kind="textarea" rows={2} value={ent?.description ?? ''} onCommit={(v) => c.applyOps((doc, st) => setEnterpriseField(doc, 'description', v, st), 'Edited the enterprise description')} testId="ent-description" />
        <Field gk="ent.problem" label="Problem statement" kind="textarea" rows={2} value={p.problem} onCommit={(v) => setP({ problem: v })} testId="ent-problem" />
        <Field gk="ent.mission" label="Mission (MGO-001)" kind="textarea" rows={2} value={p.purpose} onCommit={(v) => setP({ purpose: v })} testId="ent-mission" />
        <h3>Objectives</h3>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} data-testid="objectives">
          {p.goals.map((g) => (
            <li key={g.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span className="cv-id" style={{ paddingTop: 8 }}>{g.id}</span>
              <div style={{ flex: 1 }}>
                <Field gk="ent.objective" label={`Objective ${g.id}`} bare value={g.text} onCommit={(v) => setP({ goals: c.rec.proposal.goals.map((x) => (x.id === g.id ? { ...x, text: v } : x)) })} testId={`objective-${g.id}`} />
              </div>
              <button type="button" className="pj-btn small" aria-label={`Remove ${g.id}`} disabled={c.readOnly || c.materialLocked} onClick={() => confirmRemove(g.id) && setP({ goals: c.rec.proposal.goals.filter((x) => x.id !== g.id) })}>
                <Trash2 size={14} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="pj-btn small" onClick={addObjective} disabled={c.readOnly || c.materialLocked} data-testid="add-objective">
          <Plus size={14} aria-hidden /> Add objective
        </button>
        <h3>System of interest</h3>
        <Field gk="ent.soi" label="System of interest" kind="textarea" rows={2} value={p.soi} onCommit={(v) => setP({ soi: v })} testId="ent-soi" />
        <Field gk="ent.why" label="Why it suits a 14-week project" kind="textarea" rows={4} value={p.why} onCommit={(v) => setP({ why: v })} testId="ent-why" />
      </div>
    </section>
  )
}

// ------------------------------------------------------------------------------------------- boundary & context
const KIND_OPTS = [
  { value: 'system', label: 'System' },
  { value: 'actor', label: 'Actor' },
]
const DIR_OPTS = [
  { value: 'in', label: 'Into the system' },
  { value: 'out', label: 'Out of the system' },
  { value: 'both', label: 'Both ways' },
]
export function BoundaryPart() {
  const c = useCanvas()
  const r = c.rec
  const lock = c.readOnly || c.materialLocked
  const addPrt = () => {
    const id = nextId(c.rec, 'PRT')
    c.editRecord((x) => ({ ...x, proposal: { ...x.proposal, inside: [...x.proposal.inside, { id, name: '' }] }, issued: { ...x.issued, PRT: num(id) } }))
  }
  const addExt = () => {
    const id = nextId(c.rec, 'EXT')
    c.editRecord((x) => ({ ...x, context: [...x.context, { id, name: '', kind: '', crosses: '', direction: '' }], issued: { ...x.issued, EXT: num(id) } }))
  }
  const setExt = (id: string, q: Partial<ContextRow>) => c.editRecord((x) => ({ ...x, context: x.context.map((e) => (e.id === id ? { ...e, ...q } : e)) }))
  return (
    <section aria-labelledby="cv-boundary-h" data-testid="part-boundary">
      <PartHead p={partOf(c, 'boundary')} lede="What is inside the boundary of your system of interest (PRT) and what is outside and exchanges with it (EXT): what crosses the boundary and in which direction." />
      <div className="cv-card">
        <h3 style={{ marginTop: 0 }}>Inside the boundary (PRT)</h3>
        <div className="cv-tablewrap">
          <table className="cv-table cv-cards" data-testid="prt-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Element</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="cv-sr">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {r.proposal.inside.map((x) => (
                <tr key={x.id}>
                  <td className="cv-id" data-label="ID">{x.id}</td>
                  <td data-label="Element" className="cv-wide">
                    <Field gk="prt.name" bare label={`${x.id} element`} value={x.name} onCommit={(v) => c.editRecord((q) => ({ ...q, proposal: { ...q.proposal, inside: q.proposal.inside.map((y) => (y.id === x.id ? { ...y, name: v } : y)) } }))} testId={`prt-${x.id}`} />
                  </td>
                  <td data-label="Status"><ItemChip c={c} uid={x.id} /></td>
                  <td>
                    <button type="button" className="pj-btn small" aria-label={`Remove ${x.id}`} disabled={lock} onClick={() => confirmRemove(x.id) && c.editRecord((q) => ({ ...q, proposal: { ...q.proposal, inside: q.proposal.inside.filter((y) => y.id !== x.id) } }))}>
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="pj-btn small" style={{ marginTop: 8 }} onClick={addPrt} disabled={lock} data-testid="add-prt">
          <Plus size={14} aria-hidden /> Add element
        </button>
      </div>
      <div className="cv-card">
        <h3 style={{ marginTop: 0 }}>Context: external systems and actors (EXT)</h3>
        <div className="cv-tablewrap">
          <table className="cv-table cv-cards" data-testid="ext-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Kind</th>
                <th scope="col">What crosses the boundary</th>
                <th scope="col">Direction</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="cv-sr">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {r.context.map((x) => (
                <tr key={x.id}>
                  <td className="cv-id" data-label="ID">{x.id}</td>
                  <td data-label="Name" className="cv-wide"><Field gk="ext.name" bare label={`${x.id} name`} value={x.name} onCommit={(v) => setExt(x.id, { name: v })} testId={`ext-${x.id}-name`} /></td>
                  <td data-label="Kind"><Field gk="ext.kind" bare kind="select" options={KIND_OPTS} label={`${x.id} kind`} value={x.kind} onCommit={(v) => setExt(x.id, { kind: v as ContextRow['kind'] })} testId={`ext-${x.id}-kind`} /></td>
                  <td data-label="What crosses" className="cv-wide"><Field gk="ext.crosses" bare label={`${x.id} what crosses the boundary`} value={x.crosses} onCommit={(v) => setExt(x.id, { crosses: v })} testId={`ext-${x.id}-crosses`} /></td>
                  <td data-label="Direction"><Field gk="ext.direction" bare kind="select" options={DIR_OPTS} label={`${x.id} direction`} value={x.direction} onCommit={(v) => setExt(x.id, { direction: v as ContextRow['direction'] })} testId={`ext-${x.id}-direction`} /></td>
                  <td data-label="Status"><ItemChip c={c} uid={x.id} /></td>
                  <td>
                    <button type="button" className="pj-btn small" aria-label={`Remove ${x.id}`} disabled={lock} onClick={() => confirmRemove(x.id) && c.editRecord((q) => ({ ...q, context: q.context.filter((y) => y.id !== x.id) }))}>
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="pj-btn small" style={{ marginTop: 8 }} onClick={addExt} disabled={lock} data-testid="add-ext">
          <Plus size={14} aria-hidden /> Add external system or actor
        </button>
      </div>
    </section>
  )
}
