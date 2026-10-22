// The detail and guidance panel (spec §f.3 right region, §f.5). Details: the selected artifact or relationship with its
// linked records, rationale, provenance, validation and history. Field guidance: the eight items of directive §12.2 for
// the field that has focus (announced politely, never moving focus, never covering the field).
import { useEffect, useRef, useState } from 'react'
import { Link } from '../../lib/router'
import { learnPath } from '../../week1/route'
import { ARTIFACT_INFO } from '../model/vocabulary'
import type { Artifact, Relationship } from '../model/types'
import { WEEK1_RELATIONS, week1KindOf, week1Relations } from '../model/week1Relations'
import { fmtDate } from '../pages/ui'
import { setRelationshipRationale, updateArtifactFields } from './canvasModel'
import { Field, StateChip, useCanvas } from './ctx'
import { guidanceFor, objectiveText, sourceLabel } from '../../week1/guidance/fieldGuidance'
import { ITEM_STATE_LABEL } from './progress'

function Provenance({ a }: { a: Artifact | Relationship }) {
  const p = a.provenance
  const imp = 'attributes' in a ? ((a.attributes as Record<string, unknown> | undefined)?.import as Record<string, unknown> | undefined) : undefined
  return (
    <div data-testid="detail-provenance">
      <h4 className="pj-small" style={{ margin: '12px 0 4px' }}>Provenance</h4>
      {p.kind === 'own' && <p className="pj-small" style={{ margin: 0 }}>Written by your team in My Project.</p>}
      {p.kind === 'ai-suggested-reviewed' && <p className="pj-small" style={{ margin: 0 }}>Suggested by an AI tool and reviewed by your team.</p>}
      {p.kind === 'copied-from-practice' && <p className="pj-small" style={{ margin: 0 }}>Copied from the AeroLink practice ({p.copiedFrom.id}){p.adapted ? ', adapted' : ': adapt it to your enterprise'}.</p>}
      {p.kind === 'imported' && (
        <dl className="pj-small" style={{ margin: 0 }}>
          <dt style={{ fontWeight: 600 }}>Imported</dt>
          <dd style={{ margin: 0 }}>
            from {p.from.file ?? 'a file'} ({p.from.format}){imp ? `, sheet “${String(imp.sheet)}”, row ${String(imp.row)}` : ''}, {fmtDate(p.at)}
          </dd>
          {imp?.mapping && typeof imp.mapping === 'object' ? (
            <>
              <dt style={{ fontWeight: 600, marginTop: 4 }}>Column mapping used</dt>
              <dd style={{ margin: 0 }}>
                {Object.entries(imp.mapping as Record<string, string>).map(([f, h]) => (
                  <span key={f} style={{ display: 'block' }}>
                    {f} ← {h}
                  </span>
                ))}
              </dd>
            </>
          ) : null}
        </dl>
      )}
    </div>
  )
}

function History({ uid }: { uid: string }) {
  const c = useCanvas()
  const touches = c.st.changes
    .filter((ch) => ch.ops.some((o) => ('uid' in o && o.uid === uid) || (o.op === 'create-artifact' && o.artifact.uid === uid) || (o.op === 'create-relationship' && o.relationship.uid === uid)))
    .slice(-6)
    .reverse()
  if (!touches.length) return null
  return (
    <div>
      <h4 className="pj-small" style={{ margin: '12px 0 4px' }}>Recent history</h4>
      <ul className="pj-small" style={{ margin: 0, paddingLeft: 16 }}>
        {touches.map((ch) => (
          <li key={ch.id}>
            {fmtDate(ch.at)} · {ch.actor?.name ?? (ch.by || '—')}: {ch.summary}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Details() {
  const c = useCanvas()
  if (!c.selection) return <p className="pj-small pj-muted">Select a row, a map node or a map edge to see its details, links, provenance and history here.</p>
  const { uid, kind } = c.selection
  if (kind === 'relationship') {
    const r = c.doc.relationships[uid]
    if (!r) return <p className="pj-small pj-muted">That relationship is no longer in the project.</p>
    const k = week1KindOf(c.doc, r)
    const view = week1Relations(c.doc).find((x) => x.rel.uid === uid)
    return (
      <div data-testid="detail-relationship">
        <p style={{ margin: 0 }}>
          <span className="cv-id">{r.id}</span> {k ? <strong>{WEEK1_RELATIONS[k].label}</strong> : null}
        </p>
        <p style={{ margin: '4px 0' }}>{view?.sentence}</p>
        {k && <p className="pj-small pj-muted" style={{ margin: 0 }}>{WEEK1_RELATIONS[k].definition}</p>}
        {r.draft && <StateChip state="draft">Draft: an end or the type is not complete yet</StateChip>}
        {r.note !== undefined && <p className="pj-small">Note: {r.note || '—'}</p>}
        <Field gk={k === 'conflicting-concerns' ? 'con.conflict' : 'artifact.rationale'} label="Rationale (documented reason)" kind="textarea" rows={2} value={r.rationale ?? ''} onCommit={(v) => c.applyOps(setRelationshipRationale(c.doc, uid, v), `Explained ${r.id}`)} testId="detail-rel-rationale" />
        <Provenance a={r} />
        <History uid={uid} />
      </div>
    )
  }
  const a = c.doc.artifacts[uid]
  if (!a) return <p className="pj-small pj-muted">That item is no longer in the project.</p>
  const item = c.progress.parts.flatMap((p) => p.items).find((x) => x.uid === uid || x.id === a.id)
  const rels = week1Relations(c.doc).filter((x) => x.rel.from === uid || x.rel.to === uid)
  return (
    <div data-testid="detail-artifact">
      <p style={{ margin: 0 }}>
        <span className="cv-id">{a.id}</span> <span className="pj-small pj-muted">{ARTIFACT_INFO[a.type].label}</span>
      </p>
      <p style={{ margin: '4px 0', fontWeight: 600 }}>{a.title || a.description || '(not written yet)'}</p>
      {item && (
        <>
          <StateChip state={item.state}>{ITEM_STATE_LABEL[item.state]}</StateChip>
          {item.reasons.length > 0 && (
            <ul className="cv-issues" data-testid="detail-reasons">
              {item.reasons.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          )}
        </>
      )}
      {a.review.state === 'needs-review' && <p className="cv-warnbox" style={{ marginTop: 8 }}>Needs review: {a.review.causes.map((x) => x.summary).join('; ')}</p>}
      {c.feedback.filter((f) => f.artifactId === a.id).map((f, k) => (
        <p key={k} className="cv-infobox" style={{ marginTop: 8 }} data-testid="detail-feedback">
          <strong>Instructor feedback on {a.id}</strong> (submitted version {f.snapshotId}): {f.text}
        </p>
      ))}
      {rels.length > 0 && (
        <>
          <h4 className="pj-small" style={{ margin: '12px 0 4px' }}>Linked records</h4>
          <ul className="pj-small" style={{ margin: 0, paddingLeft: 16 }} data-testid="detail-links">
            {rels.map((x) => (
              <li key={x.rel.uid}>
                <button type="button" className="pj-btn small" style={{ padding: '0 6px' }} onClick={() => c.select({ uid: x.rel.uid, kind: 'relationship' })}>
                  {x.sentence}
                </button>{' '}
                <span className="pj-muted">({WEEK1_RELATIONS[x.kind].label})</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {a.type !== 'NEED' && <Field gk={a.type === 'A' ? 'au.assumption' : a.type === 'U' ? 'au.unknown' : 'artifact.rationale'} label="Rationale (documented reason)" kind="textarea" rows={2} value={a.rationale ?? ''} onCommit={(v) => c.applyOps(updateArtifactFields(c.doc, uid, { rationale: v }), `Documented the rationale of ${a.id}`)} testId="detail-rationale" />}
      <Provenance a={a} />
      <History uid={uid} />
      <p className="pj-small" style={{ marginTop: 10 }}>
        <Link to={`/project/artifact/${encodeURIComponent(a.id)}`}>Open {a.id} in the artifact library</Link>
      </p>
    </div>
  )
}

export function Guidance() {
  const c = useCanvas()
  const g = guidanceFor(c.focusKey)
  if (!g) return <p className="pj-small pj-muted">Focus a field (or press its “i” button) to see what belongs in it: its definition, what is expected, a worked example from the AeroLink case, the format, the objective it serves, how later weeks use it, and live feedback.</p>
  const sel = c.selection ? c.progress.parts.flatMap((p) => p.items).find((x) => x.uid === c.selection!.uid) : undefined
  const live = sel?.reasons ?? []
  return (
    <dl className="cv-guide" data-testid="field-guidance">
      <dt>Field</dt>
      <dd data-testid="guidance-label" style={{ fontWeight: 700, fontSize: 'var(--pj-t-ui)' }}>{g.label}</dd>
      <dt>Definition</dt>
      <dd>
        {g.definition.text} <span className="pj-muted">({g.definition.source === 'course convention' ? 'course convention' : sourceLabel(g.definition.source)})</span>
      </dd>
      <dt>What is expected</dt>
      <dd>{g.expected}</dd>
      {g.distinguishFrom && (
        <>
          <dt>Not to be confused with</dt>
          <dd>{g.distinguishFrom}</dd>
        </>
      )}
      <dt>AeroLink example</dt>
      <dd>
        {g.aerolinkExample ? (
          <div className="cv-example" data-testid="guidance-example">
            <span className="cv-fict">Fictional instructor example · {g.aerolinkExample.caseRef}</span>
            {g.aerolinkExample.text}
          </div>
        ) : (
          <span className="pj-muted">No AeroLink example for this field.</span>
        )}
      </dd>
      <dt>Format</dt>
      <dd>{g.format}</dd>
      <dt>Objective</dt>
      <dd>
        {g.objective}: {objectiveText(g.objective)}
      </dd>
      <dt>Later use</dt>
      <dd>
        {g.laterUse.length ? (
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {g.laterUse.map((u) => (
              <li key={u.text}>
                Week {u.week}: {u.text}
              </li>
            ))}
          </ul>
        ) : (
          'Kept in your project record.'
        )}
      </dd>
      <dt>Validation</dt>
      <dd data-testid="guidance-validation">
        <span className="pj-muted">Rule: {g.rule}</span>
        {live.length > 0 ? (
          <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
            {live.slice(0, 4).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        ) : sel ? (
          <span style={{ display: 'block', color: 'var(--pj-ok)' }}>The selected item meets the course checks.</span>
        ) : null}
      </dd>
      <dt>Learn more</dt>
      <dd>
        <Link to={learnPath(g.learnLink.slice(0, 4), g.learnLink)}>Read the textbook section</Link>
      </dd>
    </dl>
  )
}

/** Narrow screens (below 1200 px, where the panel sits below the work area): the guidance opens as a bottom sheet from
 *  the field's (i) button, takes focus, and gives it back on close (spec §f.5; review M-6). Hidden on wide screens. */
export function GuidanceSheet() {
  const c = useCanvas()
  const head = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (c.sheetOpen) head.current?.focus()
  }, [c.sheetOpen, c.focusKey])
  if (!c.sheetOpen) return null
  return (
    <div className="cv-sheet" role="dialog" aria-modal="false" aria-labelledby="cv-sheet-h" data-testid="guidance-sheet" onKeyDown={(e) => e.key === 'Escape' && c.closeGuidance()}>
      <div className="cv-sheet-head">
        <h2 id="cv-sheet-h" ref={head} tabIndex={-1}>
          Field guidance
        </h2>
        <button type="button" className="pj-btn small" onClick={c.closeGuidance} data-testid="guidance-sheet-close">
          Close
        </button>
      </div>
      <div className="cv-panel-body">
        <Guidance />
      </div>
    </div>
  )
}

export function DetailPanel() {
  const c = useCanvas()
  const [tab, setTab] = useState<'details' | 'guidance'>('guidance')
  const ref = useRef<HTMLElement>(null)
  // a field focused in the work area brings its guidance; a field inside the panel never swaps the panel under itself
  useEffect(() => {
    if (c.focusKey && !ref.current?.contains(document.activeElement)) setTab('guidance')
  }, [c.focusKey])
  useEffect(() => {
    if (c.selection) setTab('details')
  }, [c.selection])
  return (
    <aside ref={ref} className="cv-panel" aria-label="Details and field guidance" data-testid="detail-panel">
      <div className="cv-tabs" role="tablist" aria-label="Panel">
        <button type="button" role="tab" id="cv-tab-details" aria-selected={tab === 'details'} aria-controls="cv-tabpanel" onClick={() => setTab('details')} data-testid="tab-details">
          Details
        </button>
        <button type="button" role="tab" id="cv-tab-guidance" aria-selected={tab === 'guidance'} aria-controls="cv-tabpanel" onClick={() => setTab('guidance')} data-testid="tab-guidance">
          Field guidance
        </button>
      </div>
      {/* a short, polite announcement when the guidance follows a new field (not the eight items on every Tab; review M-6) */}
      <p className="cv-sr" aria-live="polite" data-testid="guidance-announce">
        {guidanceFor(c.focusKey) ? `Guidance available for ${guidanceFor(c.focusKey)!.label}.` : ''}
      </p>
      <div className="cv-panel-body" id="cv-tabpanel" role="tabpanel" aria-labelledby={tab === 'details' ? 'cv-tab-details' : 'cv-tab-guidance'}>
        {tab === 'details' ? <Details /> : <Guidance />}
      </div>
    </aside>
  )
}
