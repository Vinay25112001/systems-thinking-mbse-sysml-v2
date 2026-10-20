// One artifact (roadmap §2.2): its fields read-only, relationships in and out (as sentences, with status), its revision
// history, and the actions Edit in the Week 1 lab tool, Mark reviewed (rationale required), Retire (reason required; the
// ID stays taken) and, for an item copied from the AeroLink practice, Mark adapted (only after it was edited).
import { useState, type ReactNode } from 'react'
import { Link } from '../../lib/router'
import { week1Validation } from '../adapters/week1Status'
import { artifactById, displayTitle } from '../model/create'
import { clearReviewOps } from '../model/impact'
import { ARTIFACT_INFO, sentence } from '../model/vocabulary'
import type { AttrValue, Relationship } from '../model/types'
import { editedSinceCopy, markAdaptedOps } from '../practice/copyFromPractice'
import { useProjectState, useProjectStore } from '../store/ProjectProvider'
import { ProvenanceBadge, ReviewBadge } from './Library'
import { Chip, EmptyState, fmtDate } from './ui'

const LAB_PART: Record<string, string> = { ENT: 'Part 2', MGO: 'Part 2', PRT: 'Part 2', EXT: 'Part 3', STK: 'Part 4', CON: 'Part 4', NEED: 'Part 5' }
const HIDDEN = new Set(['seq', 'copiedText', 'influence', 'sourcesText', 'concernsText', 'goalText'])
const LABEL: Record<string, string> = { influenceText: 'influence (1–5)', influenceReason: 'reason for the rating', suitability: 'why it suits a 14-week project', soi: 'system of interest', approving: 'approving authority', selfCheck: 'six checks confirmed', addedIn: 'added in week' }
function show(v: AttrValue | undefined): ReactNode {
  if (v === null || v === undefined || v === '') return <span className="pj-muted">—</span>
  if (typeof v === 'boolean') return v ? 'yes' : 'no'
  if (Array.isArray(v)) return v.map(String).join(', ')
  if (typeof v === 'object') {
    const parts = Object.entries(v).filter(([, x]) => x !== '' && x !== null && x !== false).map(([k, x]) => (x === true ? k : `${k}: ${String(x)}`))
    return parts.length ? parts.join('; ') : <span className="pj-muted">—</span>
  }
  return String(v)
}

function Dialogish({ title, label, onCancel, onConfirm, confirm, danger }: { title: string; label: string; onCancel: () => void; onConfirm: (text: string) => void; confirm: string; danger?: boolean }) {
  const [text, setText] = useState('')
  return (
    <div className="pj-card flat" role="group" aria-label={title} style={{ marginTop: 8 }}>
      <h3 className="pj-h3">{title}</h3>
      <label className="pj-field">
        <span>{label}</span>
        <textarea className="pj-textarea" value={text} onChange={(e) => setText(e.target.value)} autoFocus data-testid="action-rationale" />
      </label>
      <div className="pj-row" style={{ marginTop: 8 }}>
        <button type="button" className={`pj-btn ${danger ? 'danger' : 'primary'}`} disabled={text.trim().split(/\s+/).filter(Boolean).length < 3} onClick={() => onConfirm(text.trim())} data-testid="action-confirm">
          {confirm}
        </button>
        <button type="button" className="pj-btn" onClick={onCancel}>
          Cancel
        </button>
        <span className="pj-caption">At least three words.</span>
      </div>
    </div>
  )
}

export function ArtifactPage({ id }: { id: string }) {
  const st = useProjectState()
  const store = useProjectStore()!
  const doc = st.doc!
  const a = artifactById(doc, id)
  const [mode, setMode] = useState<'' | 'review' | 'retire'>('')
  const [msg, setMsg] = useState('')
  if (!a)
    return (
      <EmptyState title={`${id} is not in your project`} action={<Link to="/project/artifacts" className="pj-btn">Back to the library</Link>}>
        No artifact has this ID. IDs are never reused, so an ID you remember may belong to a retired item: switch on “Show retired” in the library.
      </EmptyState>
    )
  const v = week1Validation(doc).get(a.uid)
  const idOf = (u: string) => doc.artifacts[u]?.id ?? '?'
  const rels = Object.values(doc.relationships).filter((r) => r.from === a.uid || r.to === a.uid)
  const history = st.changes.filter((c) => c.ops.some((o) => ('uid' in o && o.uid === a.uid) || (o.op === 'create-artifact' && o.artifact.uid === a.uid))).reverse()
  const run = (ops: Parameters<typeof store.apply>[0], summary: string, rationale?: string, source: 'review' | 'editor' = 'editor') => {
    const r = store.apply(ops, { source, summary, rationale, noCoalesce: true })
    setMsg(r.ok ? `${summary}.` : `Not done: ${r.error}`)
    setMode('')
  }
  const relRow = (r: Relationship) => (
    <li key={r.uid} style={{ padding: '6px 0', borderBottom: '1px solid var(--pj-line)' }} className="pj-small">
      <span className="pj-mono">{r.id}</span> {r.category === 'stakeholder' ? `${String(r.attributes?.fromText ?? idOf(r.from))} ${r.type || '(type not chosen)'} ${String(r.attributes?.toText ?? idOf(r.to))}` : sentence(idOf(r.from), r.type, idOf(r.to))}{' '}
      {r.status === 'suspect' ? <Chip tone="warn">Suspect</Chip> : r.status === 'retired' ? <Chip tone="neutral">Retired</Chip> : r.draft ? <Chip tone="draft">Draft</Chip> : null}
      {r.note && <span className="pj-caption"> · {r.note}</span>}
      {r.category !== 'stakeholder' && (
        <>
          {' '}
          <Link to={`/project/artifact/${r.from === a.uid ? idOf(r.to) : idOf(r.from)}`} className="pj-caption">
            open {r.from === a.uid ? idOf(r.to) : idOf(r.from)}
          </Link>
        </>
      )}
    </li>
  )
  const out = rels.filter((r) => r.from === a.uid)
  const inc = rels.filter((r) => r.to === a.uid)
  return (
    <div className="pj-stack" data-testid="artifact-page">
      <div>
        <nav className="pj-caption" aria-label="Library">
          <Link to="/project/artifacts">Artifact library</Link> / <Link to={`/project/artifacts/${a.type}`}>{ARTIFACT_INFO[a.type].plural}</Link>
        </nav>
        <h1 className="pj-h1">
          <span className="pj-mono" style={{ fontSize: 26 }}>{a.id}</span> {displayTitle(a)}
        </h1>
        <div className="pj-row">
          {a.status === 'retired' ? <Chip tone="neutral">Retired: {a.retired?.reason}</Chip> : v ? v.state === 'passing' ? <Chip tone="ok">Course checks pass</Chip> : <Chip tone="draft">Checks failing</Chip> : <Chip tone="neutral">Unchecked</Chip>}
          <ReviewBadge a={a} />
          <ProvenanceBadge p={a.provenance} />
          <span className="pj-caption">revision {a.revision} · last revised by {a.revised.by || 'not recorded'} (self-declared), {fmtDate(a.revised.at)}</span>
        </div>
      </div>
      {msg && <p className="pj-small" role="status">{msg}</p>}
      {a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted && (
        <div className="pj-scope">
          <div className="pj-banner example" role="note">
            <span>
              <strong>Copied from the AeroLink practice ({a.provenance.copiedFrom.id}).</strong> It does not count toward your minimums until you rewrite it for your enterprise and mark it adapted.
            </span>
          </div>
        </div>
      )}
      <div className="pj-grid two">
        <div className="pj-stack">
          <section className="pj-card" aria-labelledby="af-h">
            <h2 id="af-h" className="pj-h2">Fields</h2>
            <dl className="pj-small" style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 0.6fr) minmax(0, 2fr)', gap: '6px 14px', margin: 0 }}>
              {a.title && (<><dt className="pj-muted">Name</dt><dd style={{ margin: 0 }}>{a.title}</dd></>)}
              {a.description && (<><dt className="pj-muted">Statement</dt><dd style={{ margin: 0 }}>{a.description}</dd></>)}
              {a.rationale && (<><dt className="pj-muted">Rationale</dt><dd style={{ margin: 0 }}>{a.rationale}</dd></>)}
              {Object.entries(a.attributes).filter(([k]) => !HIDDEN.has(k)).map(([k, x]) => (
                <div key={k} className="contents" style={{ display: 'contents' }}>
                  <dt className="pj-muted">{LABEL[k] ?? k.replace(/([A-Z])/g, ' $1').toLowerCase()}</dt>
                  <dd style={{ margin: 0 }}>{show(x)}</dd>
                </div>
              ))}
              {a.unresolvedRefs.length > 0 && (<><dt className="pj-muted">Unresolved references</dt><dd style={{ margin: 0 }}>{a.unresolvedRefs.join(', ')} (not in the project; kept, never dropped)</dd></>)}
              {a.formerIds.length > 0 && (<><dt className="pj-muted">Former IDs</dt><dd style={{ margin: 0 }}>{a.formerIds.join(', ')}</dd></>)}
            </dl>
          </section>
          {v && v.state === 'failing' && (
            <section className="pj-card" aria-labelledby="ac-h">
              <h2 id="ac-h" className="pj-h2">What the checks still need</h2>
              <ul className="pj-small" style={{ margin: 0, paddingLeft: 18 }}>{v.gates.filter((g) => !g.ok).map((g) => <li key={g.id}>{g.message}</li>)}</ul>
              <p className="pj-caption" style={{ marginBottom: 0 }}>Checked by {v.checker}. A pass says the course checks pass, not that the engineering is right.</p>
            </section>
          )}
          <section className="pj-card" aria-labelledby="ar-h">
            <h2 id="ar-h" className="pj-h2">Relationships</h2>
            <h3 className="pj-caption" style={{ margin: '4px 0' }}>Out of {a.id} ({out.length})</h3>
            {out.length ? <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>{out.map(relRow)}</ul> : <p className="pj-small pj-muted" style={{ margin: 0 }}>None.</p>}
            <h3 className="pj-caption" style={{ margin: '12px 0 4px' }}>Into {a.id} ({inc.length})</h3>
            {inc.length ? <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>{inc.map(relRow)}</ul> : <p className="pj-small pj-muted" style={{ margin: 0 }}>None.</p>}
          </section>
        </div>
        <div className="pj-stack">
          <section className="pj-card" aria-labelledby="aa-h">
            <h2 id="aa-h" className="pj-h2">Actions</h2>
            <div className="pj-stack">
              {a.status === 'active' && LAB_PART[a.type] && (
                <Link to="/week/1/lab/tool" className="pj-btn primary">
                  Edit in the Week 1 lab tool ({LAB_PART[a.type]})
                </Link>
              )}
              {a.review.state === 'needs-review' && (
                <div>
                  <p className="pj-small" style={{ margin: '0 0 6px' }}>
                    Flagged because {a.review.causes.map((c) => `${c.changedId} changed (${c.summary}; via ${c.path.join(' → ')})`).join('; ')}.
                  </p>
                  {mode === 'review' ? (
                    <Dialogish title="Mark reviewed: still holds" label="Rationale: why the item still holds after the change" confirm="Mark reviewed" onCancel={() => setMode('')} onConfirm={(t) => run(clearReviewOps(doc, a.uid, st.editor, t, new Date().toISOString()), `Reviewed ${a.id}: still holds`, t, 'review')} />
                  ) : (
                    <button type="button" className="pj-btn" onClick={() => setMode('review')} data-testid="mark-reviewed">
                      Mark reviewed…
                    </button>
                  )}
                </div>
              )}
              {a.provenance.kind === 'copied-from-practice' && !a.provenance.adapted && (
                <div>
                  <button type="button" className="pj-btn" disabled={!editedSinceCopy(a)} onClick={() => run(markAdaptedOps(a), `Marked ${a.id} adapted to the team’s enterprise`)} data-testid="mark-adapted">
                    Mark adapted
                  </button>
                  {!editedSinceCopy(a) && <p className="pj-caption">Rewrite it for your enterprise in the lab tool first.</p>}
                </div>
              )}
              {a.status === 'active' && a.type !== 'ENT' && a.id !== 'MGO-001' && (mode === 'retire' ? (
                <Dialogish danger title={`Retire ${a.id}`} label="Reason (the ID stays taken; relationships turn suspect, none is deleted)" confirm={`Retire ${a.id}`} onCancel={() => setMode('')} onConfirm={(t) => run([{ op: 'retire-artifact', uid: a.uid, reason: t }], `Retired ${a.id}`, t)} />
              ) : (
                <button type="button" className="pj-btn danger" onClick={() => setMode('retire')} data-testid="retire">
                  Retire…
                </button>
              ))}
              {a.status === 'retired' && (
                <button type="button" className="pj-btn" onClick={() => run([{ op: 'restore-artifact', uid: a.uid }], `Restored ${a.id}`)}>
                  Restore {a.id}
                </button>
              )}
            </div>
          </section>
          <section className="pj-card" aria-labelledby="ah-h">
            <h2 id="ah-h" className="pj-h2">Revision history</h2>
            {history.length ? (
              <ol className="pj-small" style={{ margin: 0, paddingLeft: 18 }}>
                {history.map((c) => (
                  <li key={c.id} style={{ marginBottom: 6 }}>
                    <span className="pj-mono">{c.id}</span> · {fmtDate(c.at)} · {c.by || 'not recorded'} (self-declared) · {c.summary}
                    {c.rationale && <span className="pj-caption"> — {c.rationale}</span>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="pj-small pj-muted" style={{ margin: 0 }}>Created with the project; no later change recorded.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
