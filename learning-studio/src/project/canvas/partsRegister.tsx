// Canvas parts: Stakeholders (table · map · coverage), Concerns (with conflicting concerns), Relationships (table · map,
// and every Week 1 traceability relation), Needs (table + editor), Assumptions & unknowns. Tables are the primary
// editing surface (spec MP-21); the map is read-and-select (MP-22): selecting a node or edge selects the same row and
// opens it in the detail panel. All views read and write the one canonical document.
import { FileSpreadsheet, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { NEED_FORM, NEED_PRIORITY_DEFINITION, REL_TYPES, REL_VERB, type RelType } from '../../content/lectures/week01/labBrief'
import { ROLES, STAGES } from '../../workbench/week1/stakeholders'
import { SELF_CHECK } from '../../workbench/week1/needQuality'
import { EMPTY_NEED_ROW, MISSION_ID, needStatus, nextId, PRIORITIES, PRIORITY_LABEL, sourcesOf, SUPPORT_LEVELS, type NeedRow, type StakeholderRow, type TeamRecord } from '../../workbench/week1/team'
import { SUPPORT_LABEL } from '../../week1/guidance/fieldGuidance'
import { concernConflicts, hasRationale, WEEK1_RELATIONS, week1Relations } from '../model/week1Relations'
import { activeOf, addConcernConflict, createAu, linkAffects, retireOps, retireRelationshipOps, setRelationshipRationale, updateArtifactFields } from './canvasModel'
import { Field, StateChip, useCanvas } from './ctx'
import { confirmRemove, ItemChip, PartHead, partOf } from './partsCore'
import { ExcelImport } from './ExcelImport'

const num = (id: string) => Number(id.split('-')[1]) || 0
const ROLE_OPTS = ROLES.map((r) => ({ value: r.id, label: r.label }))
const STAGE_OPTS = STAGES.map((s) => ({ value: s, label: s }))
const SIDE_OPTS = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
]
const YN_OPTS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]
const RATING_OPTS = ['1', '2', '3', '4', '5'].map((v) => ({ value: v, label: v }))
const SUPPORT_OPTS = SUPPORT_LEVELS.map((v) => ({ value: v, label: `${v} ${SUPPORT_LABEL[Number(v) as 1 | 2 | 3 | 4]}` }))
const TYPE_OPTS = REL_TYPES.map((t) => ({ value: t, label: REL_VERB[t] }))

type C = ReturnType<typeof useCanvas>
const uidOf = (c: C, id: string) => Object.values(c.doc.artifacts).find((a) => a.id === id)?.uid ?? ''
const rowKeys = (onActivate: () => void) => ({
  tabIndex: 0,
  onKeyDown: (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.target !== e.currentTarget) return
    if (e.key === 'Enter') onActivate()
    if (e.key === 'ArrowDown') (e.currentTarget.nextElementSibling as HTMLElement | null)?.focus()
    if (e.key === 'ArrowUp') (e.currentTarget.previousElementSibling as HTMLElement | null)?.focus()
  },
})

function ViewSwitch<T extends string>({ value, set, options, label }: { value: T; set: (v: T) => void; options: { id: T; label: string }[]; label: string }) {
  return (
    <div className="cv-switch" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => set(o.id)} data-testid={`view-${o.id}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ------------------------------------------------------------------------------------------- relationship map
/** Stakeholders as nodes on a circle, REL rows as typed labelled edges, conflicts dashed with a ≠ mark. Read-and-select. */
export function RelationshipMap() {
  const c = useCanvas()
  const stks = c.rec.stakeholders
  const rels = c.rec.relationships.filter((x) => x.from && x.to && x.type && stks.some((s) => s.id === x.from) && stks.some((s) => s.id === x.to))
  const W = 640
  const H = Math.max(360, Math.min(560, 200 + stks.length * 18))
  const R = Math.min(W, H) / 2 - 60
  const pos = new Map(stks.map((s, i) => [s.id, { x: W / 2 + R * Math.cos((2 * Math.PI * i) / Math.max(1, stks.length) - Math.PI / 2), y: H / 2 + R * Math.sin((2 * Math.PI * i) / Math.max(1, stks.length) - Math.PI / 2) }]))
  const selUid = c.selection?.uid
  const act = (uid: string, kind: 'artifact' | 'relationship') => (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      c.select({ uid, kind })
    }
  }
  if (!stks.length) return <p className="pj-small pj-muted">The map shows your stakeholders and their relationships once the register has entries.</p>
  return (
    <figure style={{ margin: 0 }} data-testid="relationship-map">
      <svg className="cv-map" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Relationship map: stakeholders and the relationships between them">
        {rels.map((x) => {
          const a = pos.get(x.from)!
          const b = pos.get(x.to)!
          const uid = Object.values(c.doc.relationships).find((q) => q.id === x.id)?.uid ?? x.id
          const conflict = x.type === 'conflicts-with'
          return (
            <g key={x.id} className="cv-edge" data-conflict={conflict} role="button" tabIndex={0} aria-pressed={selUid === uid} aria-label={`${x.id}: ${x.from} ${stks.find((s) => s.id === x.from)?.name ?? ''} ${REL_VERB[x.type as RelType]} ${x.to} ${stks.find((s) => s.id === x.to)?.name ?? ''}`} onClick={() => c.select({ uid, kind: 'relationship' })} onKeyDown={act(uid, 'relationship')} data-testid={`map-edge-${x.id}`}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
              <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} textAnchor="middle">
                {conflict ? '≠ ' : ''}
                {REL_VERB[x.type as RelType]}
              </text>
            </g>
          )
        })}
        {stks.map((s) => {
          const p = pos.get(s.id)!
          const uid = uidOf(c, s.id)
          return (
            <g key={s.id} className="cv-node" role="button" tabIndex={0} aria-pressed={selUid === uid} aria-label={`${s.id} ${s.name || '(not named)'}`} onClick={() => c.select({ uid, kind: 'artifact' })} onKeyDown={act(uid, 'artifact')} data-testid={`map-node-${s.id}`}>
              <circle cx={p.x} cy={p.y} r={22} />
              <text x={p.x} y={p.y + 4} textAnchor="middle" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>
                {s.id.replace('STK-', '')}
              </text>
              {(() => {
                // the name sits outside the circle, away from the centre, so edges never run through it
                const dx = p.x - W / 2
                const dy = p.y - H / 2
                const len = Math.hypot(dx, dy) || 1
                const lx = p.x + (dx / len) * 34
                const ly = p.y + (dy / len) * 34 + 4
                return (
                  <text x={lx} y={ly} textAnchor={Math.abs(dx) < 20 ? 'middle' : dx > 0 ? 'start' : 'end'}>
                    {(s.name || '(not named)').slice(0, 28)}
                  </text>
                )
              })()}
            </g>
          )
        })}
      </svg>
      <figcaption className="pj-small pj-muted">Select a stakeholder or a relationship to open it in the detail panel. Dashed edges marked ≠ are conflicts. To add a relationship use the table (“Add relationship”).</figcaption>
      <ul className="cv-sr">
        {rels.map((x) => (
          <li key={x.id}>
            {x.id}: {x.from} {REL_VERB[x.type as RelType]} {x.to}
          </li>
        ))}
      </ul>
    </figure>
  )
}

// ------------------------------------------------------------------------------------------- coverage
export function CoverageView() {
  const c = useCanvas()
  const r = c.rec
  return (
    <div className="cv-tablewrap" data-testid="coverage-matrix">
      <table className="cv-table cv-matrix">
        <caption className="cv-sr">Coverage: which stakeholder is a source of which need</caption>
        <thead>
          <tr>
            <th scope="col">Stakeholder</th>
            {r.needs.map((n) => (
              <th key={n.id} scope="col" className="cv-id">
                {n.id}
              </th>
            ))}
            <th scope="col">If no need: why</th>
          </tr>
        </thead>
        <tbody>
          {r.stakeholders.map((s) => {
            const hits = r.needs.map((n) => sourcesOf(n).includes(s.id))
            const empty = !hits.some(Boolean)
            const a = Object.values(c.doc.artifacts).find((x) => x.id === s.id)
            return (
              <tr key={s.id} data-empty={empty}>
                <th scope="row">
                  <span className="cv-id">{s.id}</span> {s.name}
                </th>
                {hits.map((h, i) => (
                  <td key={r.needs[i].id} className={h ? 'cv-hit' : ''} aria-label={h ? `${s.id} is a source of ${r.needs[i].id}` : undefined}>
                    {h ? '●' : ''}
                  </td>
                ))}
                <td>
                  {empty && a ? (
                    <Field gk="need.sources" bare label={`Why ${s.id} has no need`} value={String(a.attributes.coverageNote ?? '')} onCommit={(v) => c.applyOps(updateArtifactFields(c.doc, a.uid, { 'attributes.coverageNote': v || null }), `Recorded why ${s.id} has no need`)} testId={`coverage-note-${s.id}`} />
                  ) : null}
                  {empty && !a?.attributes.coverageNote && <span className="pj-small" style={{ color: 'var(--pj-bad)' }}>No need recorded: add a need or record why</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ------------------------------------------------------------------------------------------- stakeholders
export function StakeholdersPart() {
  const c = useCanvas()
  const [view, setView] = useState<'table' | 'map' | 'coverage'>('table')
  const [importing, setImporting] = useState(false)
  const [q, setQ] = useState('')
  const r = c.rec
  const setStk = (id: string, p: Partial<StakeholderRow>) => c.editRecord((x) => ({ ...x, stakeholders: x.stakeholders.map((s) => (s.id === id ? { ...s, ...p } : s)) }))
  const add = () => {
    const id = nextId(c.rec, 'STK')
    c.editRecord((x) => ({ ...x, stakeholders: [...x.stakeholders, { id, name: '', role: '', stage: '', side: '', approving: '', concerns: [], influence: '', reason: '', interest: '', interestReason: '', support: '' }], issued: { ...x.issued, STK: num(id) } }))
    const uid = c.latestUid(id)
    if (uid) c.select({ uid, kind: 'artifact' })
  }
  const rows = r.stakeholders.filter((s) => !q.trim() || `${s.id} ${s.name}`.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <section aria-labelledby="cv-stakeholders-h" data-testid="part-stakeholders">
      <PartHead p={partOf(c, 'stakeholders')} lede="The stakeholder register: who has a stake in your system of interest, how they are classified, their level of interest (required, with a reason), and optionally their influence and support." />
      <div className="cv-card">
        <div className="cv-toolbar">
          <ViewSwitch label="Stakeholder view" value={view} set={setView} options={[{ id: 'table', label: 'Table' }, { id: 'map', label: 'Map' }, { id: 'coverage', label: 'Coverage' }]} />
          <label className="cv-sr" htmlFor="cv-stk-search">Search stakeholders</label>
          <input id="cv-stk-search" className="cv-input" style={{ maxWidth: 220 }} placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="button" className="pj-btn small primary" onClick={add} disabled={c.readOnly} data-testid="add-stakeholder">
            <Plus size={14} aria-hidden /> Add stakeholder
          </button>
          <button type="button" className="pj-btn small" onClick={() => setImporting(true)} disabled={c.readOnly} data-testid="import-excel">
            <FileSpreadsheet size={14} aria-hidden /> Import from Excel
          </button>
        </div>
        {view === 'map' && <RelationshipMap />}
        {view === 'coverage' && <CoverageView />}
        {view === 'table' && (
          <div className="cv-tablewrap">
            <table className="cv-table cv-cards" data-testid="stakeholder-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Role group</th>
                  <th scope="col">Stage</th>
                  <th scope="col">Side</th>
                  <th scope="col">Approves</th>
                  <th scope="col">Interest</th>
                  <th scope="col">Reason for interest</th>
                  <th scope="col">Influence</th>
                  <th scope="col">Reason for influence</th>
                  <th scope="col">Support</th>
                  <th scope="col">Concerns</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="cv-sr">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const uid = uidOf(c, s.id)
                  const a = c.doc.artifacts[uid]
                  return (
                    <tr key={s.id} aria-selected={c.selection?.uid === uid} {...rowKeys(() => c.select({ uid, kind: 'artifact' }))} onClick={() => uid && c.select({ uid, kind: 'artifact' })} data-testid={`stk-row-${s.id}`}>
                      <td className="cv-id" data-label="ID">
                        {s.id}
                        {a?.provenance.kind === 'imported' && <span className="pj-small pj-muted" title={String(a.attributes.importRow ?? '')}> · imported</span>}
                      </td>
                      <td data-label="Name" className="cv-wide"><Field gk="stk.name" bare label={`${s.id} name`} value={s.name} onCommit={(v) => setStk(s.id, { name: v })} testId={`stk-${s.id}-name`} /></td>
                      <td data-label="Role group"><Field gk="stk.role" bare kind="select" options={ROLE_OPTS} label={`${s.id} role group`} value={s.role} onCommit={(v) => setStk(s.id, { role: v })} testId={`stk-${s.id}-role`} /></td>
                      <td data-label="Stage"><Field gk="stk.stage" bare kind="select" options={STAGE_OPTS} label={`${s.id} life-cycle stage`} value={s.stage} onCommit={(v) => setStk(s.id, { stage: v })} testId={`stk-${s.id}-stage`} /></td>
                      <td data-label="Side"><Field gk="stk.side" bare kind="select" options={SIDE_OPTS} label={`${s.id} internal or external`} value={s.side} onCommit={(v) => setStk(s.id, { side: v as StakeholderRow['side'] })} testId={`stk-${s.id}-side`} /></td>
                      <td data-label="Approves"><Field gk="stk.approving" bare kind="select" options={YN_OPTS} label={`${s.id} approving authority`} value={s.approving} onCommit={(v) => setStk(s.id, { approving: v as StakeholderRow['approving'] })} testId={`stk-${s.id}-approving`} /></td>
                      <td data-label="Interest"><Field gk="stk.interest" bare kind="select" options={RATING_OPTS} label={`${s.id} level of interest`} value={s.interest ?? ''} onCommit={(v) => setStk(s.id, { interest: v })} testId={`stk-${s.id}-interest`} /></td>
                      <td data-label="Reason for interest" className="cv-wide"><Field gk="stk.interestReason" bare label={`${s.id} reason for the level of interest`} value={s.interestReason ?? ''} onCommit={(v) => setStk(s.id, { interestReason: v })} testId={`stk-${s.id}-interestReason`} /></td>
                      <td data-label="Influence"><Field gk="stk.influence" bare kind="select" options={RATING_OPTS} label={`${s.id} influence (optional)`} value={s.influence} onCommit={(v) => setStk(s.id, { influence: v })} testId={`stk-${s.id}-influence`} /></td>
                      <td data-label="Reason for influence" className="cv-wide"><Field gk="stk.influence" bare label={`${s.id} reason for the influence (optional)`} value={s.reason} onCommit={(v) => setStk(s.id, { reason: v })} testId={`stk-${s.id}-reason`} /></td>
                      <td data-label="Support"><Field gk="stk.support" bare kind="select" options={SUPPORT_OPTS} label={`${s.id} support (optional)`} value={s.support ?? ''} onCommit={(v) => setStk(s.id, { support: v })} testId={`stk-${s.id}-support`} /></td>
                      <td data-label="Concerns">{s.concerns.length}</td>
                      <td data-label="Status"><ItemChip c={c} uid={s.id} /></td>
                      <td>
                        <button type="button" className="pj-btn small" aria-label={`Remove ${s.id}`} disabled={c.readOnly} onClick={(e) => (e.stopPropagation(), confirmRemove(`${s.id} and its concerns`) && c.editRecord((x) => ({ ...x, stakeholders: x.stakeholders.filter((y) => y.id !== s.id) })))}>
                          <Trash2 size={14} aria-hidden />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {importing && <ExcelImport onClose={() => setImporting(false)} />}
    </section>
  )
}

// ------------------------------------------------------------------------------------------- concerns
export function ConcernsPart() {
  const c = useCanvas()
  const r = c.rec
  const [holder, setHolder] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [why, setWhy] = useState('')
  const conflicts = concernConflicts(c.doc)
  const allCons = r.stakeholders.flatMap((s) => s.concerns.map((k) => ({ ...k, holder: s })))
  const addConcern = () => {
    if (!holder) return
    const id = nextId(c.rec, 'CON')
    c.editRecord((x) => ({ ...x, stakeholders: x.stakeholders.map((s) => (s.id === holder ? { ...s, concerns: [...s.concerns, { id, text: '' }] } : s)), issued: { ...x.issued, CON: num(id) } }))
  }
  const setCon = (holderId: string, id: string, text: string) => c.editRecord((x) => ({ ...x, stakeholders: x.stakeholders.map((s) => (s.id === holderId ? { ...s, concerns: s.concerns.map((k) => (k.id === id ? { ...k, text } : k)) } : s)) }))
  const addConflict = () => {
    const a = uidOf(c, from)
    const b = uidOf(c, to)
    if (!a || !b) return
    if (!c.applyOps((doc, st) => addConcernConflict(doc, a, b, why.trim(), st), `Recorded that ${from} conflicts with ${to}`)) {
      setFrom('')
      setTo('')
      setWhy('')
    }
  }
  const conOpts = allCons.map((k) => ({ value: k.id, label: `${k.id} (${k.holder.id}) ${k.text.slice(0, 40)}` }))
  return (
    <section aria-labelledby="cv-concerns-h" data-testid="part-concerns">
      <PartHead p={partOf(c, 'concerns')} lede="Each stakeholder’s specific concerns: what, for whom, and where or when it bites. Concerns that pull against each other are recorded as conflicting, with the reason." />
      <div className="cv-card">
        <div className="cv-tablewrap">
          <table className="cv-table cv-cards" data-testid="concern-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Holder</th>
                <th scope="col">Concern</th>
                <th scope="col">Conflicts with</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="cv-sr">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {allCons.map((k) => {
                const uid = uidOf(c, k.id)
                const cf = conflicts.filter((x) => x.a.uid === uid || x.b.uid === uid).map((x) => (x.a.uid === uid ? x.b.id : x.a.id))
                return (
                  <tr key={k.id} aria-selected={c.selection?.uid === uid} {...rowKeys(() => c.select({ uid, kind: 'artifact' }))} onClick={() => uid && c.select({ uid, kind: 'artifact' })} data-testid={`con-row-${k.id}`}>
                    <td className="cv-id" data-label="ID">{k.id}</td>
                    <td data-label="Holder"><span className="cv-id">{k.holder.id}</span> {k.holder.name}</td>
                    <td data-label="Concern" style={{ minWidth: 260 }}><Field gk="con.text" bare kind="textarea" rows={2} label={`${k.id} concern`} value={k.text} onCommit={(v) => setCon(k.holder.id, k.id, v)} testId={`con-${k.id}-text`} /></td>
                    <td data-label="Conflicts with" className="cv-id">{cf.join(', ') || '—'}</td>
                    <td data-label="Status"><ItemChip c={c} uid={k.id} /></td>
                    <td>
                      <button type="button" className="pj-btn small" aria-label={`Remove ${k.id}`} disabled={c.readOnly} onClick={(e) => (e.stopPropagation(), confirmRemove(k.id) && c.editRecord((x) => ({ ...x, stakeholders: x.stakeholders.map((s) => (s.id === k.holder.id ? { ...s, concerns: s.concerns.filter((y) => y.id !== k.id) } : s)) })))}>
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="cv-toolbar" style={{ marginTop: 10 }}>
          <label className="pj-small" htmlFor="cv-con-holder">Add a concern for</label>
          <select id="cv-con-holder" className="cv-select" style={{ maxWidth: 260 }} value={holder} onChange={(e) => setHolder(e.target.value)} data-testid="concern-holder">
            <option value="">Choose a stakeholder…</option>
            {r.stakeholders.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} {s.name}
              </option>
            ))}
          </select>
          <button type="button" className="pj-btn small primary" disabled={!holder || c.readOnly} onClick={addConcern} data-testid="add-concern">
            <Plus size={14} aria-hidden /> Add concern
          </button>
        </div>
      </div>
      <div className="cv-card" data-testid="concern-conflicts">
        <h3 style={{ marginTop: 0 }}>Conflicting concerns</h3>
        <p className="cv-lede">Two concerns conflict when addressing one makes the other harder. Record the pair and what pulls against what; the Week 3 trade study starts from these.</p>
        {conflicts.length > 0 && (
          <ul style={{ paddingLeft: 18 }} className="pj-small">
            {conflicts.map((x) => (
              <li key={x.rel.uid} data-testid={`conflict-${x.rel.id}`}>
                <span className="cv-id">{x.rel.id}</span> {x.a.id} conflicts with {x.b.id}
                {!hasRationale(x.rel) && <StateChip state="draft">needs a reason</StateChip>}
                <Field gk="con.conflict" label={`Why ${x.a.id} and ${x.b.id} conflict`} value={x.rel.rationale ?? ''} onCommit={(v) => c.applyOps(setRelationshipRationale(c.doc, x.rel.uid, v), `Explained the conflict ${x.rel.id}`)} testId={`conflict-${x.rel.id}-why`} />
                <button type="button" className="pj-btn small" disabled={c.readOnly} onClick={() => confirmRemove(x.rel.id) && c.applyOps(retireRelationshipOps(x.rel.uid, 'Removed in My Project'), `Removed ${x.rel.id}`)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="cv-grid2">
          <div className="cv-field">
            <label className="cv-label" htmlFor="cv-cf-from">Concern</label>
            <select id="cv-cf-from" className="cv-select" value={from} onChange={(e) => setFrom(e.target.value)} onFocus={() => c.setFocusKey('con.conflict')} data-testid="conflict-from">
              <option value="">Choose…</option>
              {conOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="cv-field">
            <label className="cv-label" htmlFor="cv-cf-to">conflicts with</label>
            <select id="cv-cf-to" className="cv-select" value={to} onChange={(e) => setTo(e.target.value)} onFocus={() => c.setFocusKey('con.conflict')} data-testid="conflict-to">
              <option value="">Choose…</option>
              {conOpts.filter((o) => o.value !== from).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="cv-field">
          <label className="cv-label" htmlFor="cv-cf-why">What pulls against what (rationale)</label>
          <input id="cv-cf-why" className="cv-input" value={why} onChange={(e) => setWhy(e.target.value)} onFocus={() => c.setFocusKey('con.conflict')} data-testid="conflict-why" />
        </div>
        <button type="button" className="pj-btn small primary" disabled={!from || !to || from === to || c.readOnly} onClick={addConflict} data-testid="add-conflict">
          Record the conflict
        </button>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------------------------------- relationships
export function RelationshipsPart() {
  const c = useCanvas()
  const r = c.rec
  const [view, setView] = useState<'table' | 'map' | 'all'>('table')
  const [nf, setNf] = useState({ from: '', type: '' as RelType | '', to: '' })
  const stkOpts = r.stakeholders.map((s) => ({ value: s.id, label: `${s.id} ${s.name}` }))
  const setRel = (id: string, p: Partial<TeamRecord['relationships'][number]>) => c.editRecord((x) => ({ ...x, relationships: x.relationships.map((y) => (y.id === id ? { ...y, ...p } : y)) }))
  const add = () => {
    const id = nextId(c.rec, 'REL')
    if (!c.editRecord((x) => ({ ...x, relationships: [...x.relationships, { id, from: nf.from, to: nf.to, type: nf.type, note: '' }], issued: { ...x.issued, REL: num(id) } }), `Added ${id}`)) setNf({ from: '', type: '', to: '' })
  }
  const all = useMemo(() => week1Relations(c.doc), [c.doc])
  return (
    <section aria-labelledby="cv-relationships-h" data-testid="part-relationships">
      <PartHead p={partOf(c, 'relationships')} lede="How your stakeholders relate (REL rows: regulates, funds, supplies, is affected by, partners with, coordinates with, conflicts with), and every Week 1 trace relation the project holds. The same records appear in the table, the map and the detail panel." />
      <div className="cv-card">
        <ViewSwitch label="Relationship view" value={view} set={setView} options={[{ id: 'table', label: 'Table' }, { id: 'map', label: 'Map' }, { id: 'all', label: 'All Week 1 relations' }]} />
        {view === 'map' && <RelationshipMap />}
        {view === 'table' && (
          <>
            <div className="cv-tablewrap">
              <table className="cv-table cv-cards" data-testid="rel-table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">From</th>
                    <th scope="col">Type</th>
                    <th scope="col">To</th>
                    <th scope="col">Note</th>
                    <th scope="col">Status</th>
                    <th scope="col"><span className="cv-sr">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {r.relationships.map((x) => {
                    const uid = Object.values(c.doc.relationships).find((q) => q.id === x.id)?.uid ?? ''
                    const it = partOf(c, 'relationships').items.find((i) => i.id === x.id)
                    return (
                      <tr key={x.id} aria-selected={c.selection?.uid === uid} {...rowKeys(() => c.select({ uid, kind: 'relationship' }))} onClick={() => uid && c.select({ uid, kind: 'relationship' })} data-testid={`rel-row-${x.id}`}>
                        <td className="cv-id" data-label="ID">{x.id}</td>
                        <td data-label="From"><Field gk="rel.type" bare kind="select" options={stkOpts} label={`${x.id} from`} value={x.from} onCommit={(v) => setRel(x.id, { from: v })} testId={`rel-${x.id}-from`} /></td>
                        <td data-label="Type"><Field gk="rel.type" bare kind="select" options={TYPE_OPTS} label={`${x.id} type`} value={x.type} onCommit={(v) => setRel(x.id, { type: v as RelType })} testId={`rel-${x.id}-type`} /></td>
                        <td data-label="To"><Field gk="rel.type" bare kind="select" options={stkOpts} label={`${x.id} to`} value={x.to} onCommit={(v) => setRel(x.id, { to: v })} testId={`rel-${x.id}-to`} /></td>
                        <td data-label="Note" className="cv-wide"><Field gk="rel.note" bare label={`${x.id} note`} value={x.note} onCommit={(v) => setRel(x.id, { note: v })} testId={`rel-${x.id}-note`} /></td>
                        <td data-label="Status">{it && <StateChip state={it.state}>{it.reasons.length ? 'Draft' : 'Meets course checks'}</StateChip>}</td>
                        <td>
                          <button type="button" className="pj-btn small" aria-label={`Remove ${x.id}`} disabled={c.readOnly} onClick={(e) => (e.stopPropagation(), confirmRemove(x.id) && c.editRecord((q) => ({ ...q, relationships: q.relationships.filter((y) => y.id !== x.id) })))}>
                            <Trash2 size={14} aria-hidden />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <fieldset className="cv-infobox" style={{ marginTop: 10 }} data-testid="add-rel-form">
              <legend className="pj-small" style={{ fontWeight: 600 }}>Add relationship: from · type · to</legend>
              <div className="cv-toolbar" style={{ margin: 0 }}>
                <label className="cv-sr" htmlFor="cv-nr-from">From</label>
                <select id="cv-nr-from" className="cv-select" style={{ maxWidth: 220 }} value={nf.from} onFocus={() => c.setFocusKey('rel.type')} onChange={(e) => setNf({ ...nf, from: e.target.value })} data-testid="new-rel-from">
                  <option value="">From…</option>
                  {stkOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <label className="cv-sr" htmlFor="cv-nr-type">Type</label>
                <select id="cv-nr-type" className="cv-select" style={{ maxWidth: 200 }} value={nf.type} onFocus={() => c.setFocusKey('rel.type')} onChange={(e) => setNf({ ...nf, type: e.target.value as RelType })} data-testid="new-rel-type">
                  <option value="">Type…</option>
                  {TYPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <label className="cv-sr" htmlFor="cv-nr-to">To</label>
                <select id="cv-nr-to" className="cv-select" style={{ maxWidth: 220 }} value={nf.to} onFocus={() => c.setFocusKey('rel.type')} onChange={(e) => setNf({ ...nf, to: e.target.value })} data-testid="new-rel-to">
                  <option value="">To…</option>
                  {stkOpts.filter((o) => o.value !== nf.from).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button type="button" className="pj-btn small primary" disabled={!nf.from || !nf.to || !nf.type || c.readOnly} onClick={add} data-testid="add-relationship">
                  <Plus size={14} aria-hidden /> Add relationship
                </button>
              </div>
            </fieldset>
          </>
        )}
        {view === 'all' && (
          <div className="cv-tablewrap">
            <table className="cv-table" data-testid="week1-relations">
              <caption className="cv-sr">Every Week 1 trace relation in the project</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Relation</th>
                  <th scope="col">Reads</th>
                  <th scope="col">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {all.map((x) => (
                  <tr key={x.rel.uid} aria-selected={c.selection?.uid === x.rel.uid} onClick={() => c.select({ uid: x.rel.uid, kind: 'relationship' })} {...rowKeys(() => c.select({ uid: x.rel.uid, kind: 'relationship' }))}>
                    <td className="cv-id">{x.rel.id}</td>
                    <td title={WEEK1_RELATIONS[x.kind].definition}>{WEEK1_RELATIONS[x.kind].label}</td>
                    <td>
                      {x.sentence}
                      {x.draft ? ' (draft)' : ''}
                    </td>
                    <td>{x.rel.rationale || x.rel.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="cv-note" style={{ padding: '0 8px 8px' }}>Course conventions for engineering traceability, not SysML relationships. Needs create their links from their source stakeholders, concerns and objective.</p>
          </div>
        )}
      </div>
    </section>
  )
}

// ------------------------------------------------------------------------------------------- needs
const PRIORITY_OPTS = PRIORITIES.filter(Boolean).map((p) => ({ value: p, label: `${PRIORITY_LABEL[p as keyof typeof PRIORITY_LABEL]}` }))
function NeedEditor({ n }: { n: NeedRow }) {
  const c = useCanvas()
  const r = c.rec
  const set = (p: Partial<NeedRow>) => c.editRecord((x) => ({ ...x, needs: x.needs.map((y) => (y.id === n.id ? { ...y, ...p } : y)) }))
  // editing what the team confirmed clears the confirmation, so a tick always refers to the current wording
  const setWording = (p: Partial<NeedRow>) => set({ ...p, selfCheck: {} })
  const st = needStatus(n, r)
  const a = st.assessment
  const goals = [MISSION_ID, ...r.proposal.goals.map((g) => g.id)]
  return (
    <div className="cv-card" data-testid={`need-editor-${n.id}`}>
      <h3 style={{ marginTop: 0 }}>
        <span className="cv-id">{n.id}</span> {n.name || 'New need'}
      </h3>
      <div className="cv-grid2">
        <Field gk="need.name" label="Short name" value={n.name} onCommit={(v) => set({ name: v })} testId={`need-${n.id}-name`} />
        <Field gk="need.priority" label="Priority" kind="select" options={PRIORITY_OPTS} value={n.priority} onCommit={(v) => set({ priority: v as NeedRow['priority'] })} hint={n.priority ? NEED_PRIORITY_DEFINITION[n.priority as keyof typeof NEED_PRIORITY_DEFINITION] : undefined} testId={`need-${n.id}-priority`} />
      </div>
      <Field gk="need.text" label={`Need statement (recommended form: “${NEED_FORM}”)`} kind="textarea" rows={2} value={n.text} onCommit={(v) => setWording({ text: v })} testId={`need-${n.id}-text`} />
      <div className="cv-grid2">
        <Field gk="need.conditions" label="Condition (if not in the statement)" value={n.conditions} onCommit={(v) => setWording({ conditions: v })} testId={`need-${n.id}-conditions`} />
        <Field gk="need.rationale" label="Rationale (why they need it)" value={n.rationale} onCommit={(v) => set({ rationale: v })} testId={`need-${n.id}-rationale`} />
      </div>
      <div className="cv-grid2">
        <Field gk="need.sources" label="Source stakeholders (STK IDs)" value={n.sources} onCommit={(v) => set({ sources: v })} mono testId={`need-${n.id}-sources`} />
        <Field gk="need.concerns" label="Concerns it answers (CON IDs)" value={n.concerns} onCommit={(v) => set({ concerns: v })} mono testId={`need-${n.id}-concerns`} />
      </div>
      <Field gk="need.goal" label="Mission or objective it supports" kind="select" options={goals.map((g) => ({ value: g, label: g === MISSION_ID ? `${g} (mission) ${r.proposal.purpose.slice(0, 50)}` : `${g} ${r.proposal.goals.find((x) => x.id === g)?.text.slice(0, 50) ?? ''}` }))} value={n.goal} onCommit={(v) => set({ goal: v })} testId={`need-${n.id}-goal`} />
      {(n.text || n.name) && (
        <div className="pj-small" data-testid={`need-${n.id}-assessment`}>
          <ul style={{ paddingLeft: 18, margin: '4px 0' }}>
            {a.gates.map((g) => (
              <li key={g.id} style={{ color: g.ok ? 'var(--pj-ok)' : 'var(--pj-bad)' }}>
                <strong>{g.ok ? 'Checked' : 'Fix'}:</strong> {g.message}
              </li>
            ))}
            {a.warnings.map((w) => (
              <li key={w.id} style={{ color: 'var(--pj-warn)' }}>
                <strong>Warning:</strong> {w.message}
              </li>
            ))}
          </ul>
          {a.warnings.length > 0 && <Field gk="need.justification" label="Justification, if a warning stays" value={n.justification} onCommit={(v) => set({ justification: v })} testId={`need-${n.id}-justification`} />}
          <fieldset className="cv-infobox" onFocus={() => c.setFocusKey('need.selfCheck')}>
            <legend className="pj-small" style={{ fontWeight: 600 }}>Self-check: confirm each of the six checks for this wording</legend>
            {SELF_CHECK.map((k) => (
              <label key={k.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '2px 0' }}>
                <input type="checkbox" disabled={c.readOnly} checked={!!n.selfCheck[k.id]} onChange={(e) => set({ selfCheck: { ...n.selfCheck, [k.id]: e.target.checked } })} data-testid={`need-${n.id}-check-${k.id}`} />
                <span>{k.label}</span>
              </label>
            ))}
          </fieldset>
        </div>
      )}
      <p className="pj-small" style={{ color: st.counts ? 'var(--pj-ok)' : 'var(--pj-warn)' }} data-testid={`need-${n.id}-status`}>
        {st.counts ? 'Meets the course checks: counts toward the minimum.' : `Does not count yet: ${st.reasons[0]}`}
      </p>
    </div>
  )
}

export function NeedsPart() {
  const c = useCanvas()
  const r = c.rec
  const selId = c.selection ? c.doc.artifacts[c.selection.uid]?.id : undefined
  const sel = r.needs.find((n) => n.id === selId)
  const add = () => {
    const id = nextId(c.rec, 'NEED')
    c.editRecord((x) => ({ ...x, needs: [...x.needs, EMPTY_NEED_ROW(id)], issued: { ...x.issued, NEED: num(id) } }), `Added ${id}`)
    const uid = c.latestUid(id)
    if (uid) c.select({ uid, kind: 'artifact' })
  }
  return (
    <section aria-labelledby="cv-needs-h" data-testid="part-needs">
      <PartHead p={partOf(c, 'needs')} lede="Initial stakeholder needs, each with its rationale and its links: the stakeholders who express it, the concerns that motivate it, and the mission or objective it supports. Select a need to edit it in full." />
      <div className="cv-card">
        <div className="cv-toolbar">
          <button type="button" className="pj-btn small primary" onClick={add} disabled={c.readOnly} data-testid="add-need">
            <Plus size={14} aria-hidden /> Add need
          </button>
        </div>
        <div className="cv-tablewrap">
          <table className="cv-table cv-cards" data-testid="need-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Statement</th>
                <th scope="col">Sources</th>
                <th scope="col">Concerns</th>
                <th scope="col">Objective</th>
                <th scope="col">Priority</th>
                <th scope="col">Status</th>
                <th scope="col"><span className="cv-sr">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {r.needs.map((n) => {
                const uid = uidOf(c, n.id)
                return (
                  <tr key={n.id} aria-selected={selId === n.id} {...rowKeys(() => c.select({ uid, kind: 'artifact' }))} onClick={() => uid && c.select({ uid, kind: 'artifact' })} data-testid={`need-row-${n.id}`} style={{ cursor: 'pointer' }}>
                    <td className="cv-id" data-label="ID">{n.id}</td>
                    <td data-label="Name">{n.name || '—'}</td>
                    <td data-label="Statement">{n.text ? `${n.text.slice(0, 90)}${n.text.length > 90 ? '…' : ''}` : '—'}</td>
                    <td className="cv-id" data-label="Sources">{n.sources || '—'}</td>
                    <td className="cv-id" data-label="Concerns">{n.concerns || '—'}</td>
                    <td className="cv-id" data-label="Objective">{n.goal || '—'}</td>
                    <td data-label="Priority">{n.priority ? PRIORITY_LABEL[n.priority as keyof typeof PRIORITY_LABEL] : '—'}</td>
                    <td data-label="Status"><ItemChip c={c} uid={n.id} /></td>
                    <td>
                      <button type="button" className="pj-btn small" aria-label={`Remove ${n.id}`} disabled={c.readOnly} onClick={(e) => (e.stopPropagation(), confirmRemove(n.id) && c.editRecord((x) => ({ ...x, needs: x.needs.filter((y) => y.id !== n.id) })))}>
                        <Trash2 size={14} aria-hidden />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {sel ? <NeedEditor key={sel.id} n={sel} /> : r.needs.length > 0 && <p className="pj-small pj-muted">Select a need in the table (or press Enter on a row) to edit it in full.</p>}
    </section>
  )
}

// ------------------------------------------------------------------------------------------- assumptions & unknowns
export function AssumptionsPart() {
  const c = useCanvas()
  const items = [...activeOf(c.doc, 'A'), ...activeOf(c.doc, 'U')].filter((a) => a.milestones.includes(1))
  const targets = Object.values(c.doc.artifacts).filter((a) => a.status === 'active' && ['ENT', 'MGO', 'PRT', 'EXT', 'STK', 'CON', 'NEED'].includes(a.type)).sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }))
  const add = (kind: 'A' | 'U') => c.applyOps((doc, st) => createAu(doc, kind, {}, st).ops, kind === 'A' ? 'Added an assumption' : 'Added an unknown')
  return (
    <section aria-labelledby="cv-assumptions-h" data-testid="part-assumptions">
      <PartHead p={partOf(c, 'assumptions')} lede="Optional in Week 1: what the team assumes without proof, and what it does not know yet, each with its rationale. They carry forward to Weeks 2 and 3 with the same IDs." />
      <div className="cv-card">
        <div className="cv-toolbar">
          <button type="button" className="pj-btn small" onClick={() => add('A')} disabled={c.readOnly} data-testid="add-assumption">
            <Plus size={14} aria-hidden /> Add assumption
          </button>
          <button type="button" className="pj-btn small" onClick={() => add('U')} disabled={c.readOnly} data-testid="add-unknown">
            <Plus size={14} aria-hidden /> Add unknown
          </button>
        </div>
        {items.length === 0 ? (
          <p className="pj-small pj-muted">None recorded. That is allowed in Week 1.</p>
        ) : (
          <div className="cv-tablewrap">
            <table className="cv-table cv-cards" data-testid="au-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Statement</th>
                  <th scope="col">Rationale</th>
                  <th scope="col">Bears on</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="cv-sr">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => {
                  const gk = a.type === 'A' ? 'au.assumption' : 'au.unknown'
                  const affects = Object.values(c.doc.relationships).filter((r) => r.status !== 'retired' && r.type === 'affects' && r.from === a.uid).map((r) => c.doc.artifacts[r.to]?.id).filter(Boolean)
                  return (
                    <tr key={a.uid} aria-selected={c.selection?.uid === a.uid} onClick={() => c.select({ uid: a.uid, kind: 'artifact' })} {...rowKeys(() => c.select({ uid: a.uid, kind: 'artifact' }))} data-testid={`au-row-${a.id}`}>
                      <td className="cv-id" data-label="ID">{a.id}</td>
                      <td data-label="Statement" style={{ minWidth: 220 }}><Field gk={gk} bare kind="textarea" rows={2} label={`${a.id} statement`} value={a.title} onCommit={(v) => c.applyOps(updateArtifactFields(c.doc, a.uid, { title: v }), `Edited ${a.id}`)} testId={`au-${a.id}-title`} /></td>
                      <td data-label="Rationale" style={{ minWidth: 200 }}><Field gk={gk} bare kind="textarea" rows={2} label={`${a.id} rationale`} value={a.rationale ?? ''} onCommit={(v) => c.applyOps(updateArtifactFields(c.doc, a.uid, { rationale: v }), `Edited ${a.id} rationale`)} testId={`au-${a.id}-rationale`} /></td>
                      <td data-label="Bears on">
                        <span className="cv-id">{affects.join(', ')}</span>
                        <label className="cv-sr" htmlFor={`cv-aff-${a.id}`}>{a.id} bears on</label>
                        <select id={`cv-aff-${a.id}`} className="cv-select" value="" disabled={c.readOnly} onChange={(e) => e.target.value && c.applyOps((doc, st) => linkAffects(doc, a.uid, e.target.value, st), `${a.id} bears on ${c.doc.artifacts[e.target.value]?.id}`)}>
                          <option value="">Link to…</option>
                          {targets.map((t) => (
                            <option key={t.uid} value={t.uid}>
                              {t.id} {(t.title || t.description).slice(0, 30)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label="Status"><ItemChip c={c} uid={a.uid} /></td>
                      <td>
                        <button type="button" className="pj-btn small" aria-label={`Remove ${a.id}`} disabled={c.readOnly} onClick={(e) => (e.stopPropagation(), confirmRemove(a.id) && c.applyOps(retireOps(a.uid, 'Removed in My Project'), `Removed ${a.id}`))}>
                          <Trash2 size={14} aria-hidden />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
