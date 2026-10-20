// Week 8 preview (roadmap §2.2, directive §9), read-only in P1: left, the project's Week 1 artifacts grouped by the course
// mapping rows (ENT, PRT, EXT, STK, CON, REL, MGO, NEED); right, the target package and construct and the generated
// SysML v2 skeleton text (the existing Week 8 generator over sourceFromProject); a status per artifact from the five
// statuses (each its own shape, colour and word). Nothing is stored and nothing is Mapped: that needs a person in Week 8.
import { useMemo, useState } from 'react'
import { Link } from '../../lib/router'
import { buildPreview, type PreviewRow } from '../adapters/week8'
import { MAPPING_STATUSES, MAPPING_STATUS_LABEL, type MappingStatus } from '../model/types'
import { useProjectState } from '../store/ProjectProvider'
import { EmptyState, MapStatus } from './ui'

const BAR: Record<MappingStatus, string> = { mapped: 'var(--pj-ok)', 'mapping-proposed': 'var(--pj-course)', 'needs-review': 'var(--pj-warn)', 'invalid-or-incomplete': 'var(--pj-bad)', 'not-mapped': 'var(--pj-line-strong)' }

export function ModelPreview() {
  const doc = useProjectState().doc!
  const p = useMemo(() => buildPreview(doc), [doc])
  const [sel, setSel] = useState<PreviewRow | null>(null)
  const total = MAPPING_STATUSES.reduce((n, s) => n + p.counts[s], 0)
  const selKind = sel ? p.groups.find((g) => g.kind.prefix === sel.prefix)?.kind : undefined
  const line = sel ? p.text.split('\n').findIndex((l) => l.includes(`<'${sel.id}'>`)) : -1
  return (
    <div className="pj-stack" data-testid="project-model-preview">
      <div>
        <p className="pj-caption" style={{ margin: 0 }}>MBSE Studio preview · Week 8</p>
        <h1 className="pj-h1">How your Week 1 work becomes a model</h1>
        <p className="pj-lede">Every artifact your team recorded is listed on the left with its original ID; the right shows where the course mapping puts it in the SysML v2 model and the text the Week 8 generator writes from it. Where the record does not say enough to model, the status says so.</p>
      </div>
      <div className="pj-banner status-info" role="note" data-testid="preview-banner">
        <span>
          <strong>Preview.</strong> In Week 8 you confirm each mapping and run the course checker. Nothing here is saved or marked Mapped; the generated text is not yet checked.
        </span>
      </div>
      <section className="pj-card" aria-labelledby="mp-sum">
        <h2 id="mp-sum" className="sr-only">Mapping status summary</h2>
        <div className="pj-bar" aria-hidden>
          {MAPPING_STATUSES.map((s) => (p.counts[s] ? <i key={s} style={{ width: `${(100 * p.counts[s]) / Math.max(1, total)}%`, background: BAR[s] }} /> : null))}
        </div>
        <ul className="pj-legend" style={{ listStyle: 'none', margin: 0, padding: 0 }} data-testid="status-legend">
          {MAPPING_STATUSES.map((s) => (
            <li key={s}>
              <MapStatus status={s} /> <strong>{p.counts[s]}</strong>
            </li>
          ))}
        </ul>
        {p.unadapted.length > 0 && <p className="pj-caption" style={{ marginBottom: 0 }}>{p.unadapted.join(', ')}: copied from the AeroLink practice and not adapted, so left out of the generated model.</p>}
      </section>
      <div className="pj-three" aria-label="Three different things">
        <div className="doc">
          <strong>Engineering document</strong>
          <p style={{ margin: '4px 0 0' }}>What your team wrote in Phase I: a register row, a statement. Kept unchanged as the source.</p>
        </div>
        <div className="el">
          <strong>Model element</strong>
          <p style={{ margin: '4px 0 0' }}>A typed element of the SysML v2 model, such as a part definition or a concern, with the source ID kept as its short name.</p>
        </div>
        <div className="rel">
          <strong>Traceable relationship</strong>
          <p style={{ margin: '4px 0 0' }}>An explicit, typed link, such as a concern naming its stakeholder. A row can be mapped while its relationships are still unmodeled.</p>
        </div>
      </div>
      {total === 0 ? (
        <EmptyState title="Nothing to map yet" action={<Link to="/week/1/lab/tool" className="pj-btn primary">Open the Week 1 lab tool</Link>}>
          Your stakeholders, concerns and needs appear here as soon as you record them.
        </EmptyState>
      ) : (
        <div className="pj-map">
          <section className="pj-pane" aria-labelledby="mp-left">
            <div className="pj-pane-head project">
              <h2 id="mp-left">Phase I package · {doc.team.label ? `Team ${doc.team.label}` : 'your enterprise'}</h2>
              <span className="pj-caption">Read-only source · rev {doc.rev}</span>
            </div>
            <div className="pj-pane-body">
              {p.groups.map((g) => (
                <div key={g.kind.prefix} data-testid={`preview-group-${g.kind.prefix}`}>
                  <div className="pj-mgroup">
                    <span>
                      {g.kind.artifact} <span className="pj-mono pj-muted">{g.kind.prefix}</span>
                    </span>
                    <span>{g.rows.length}</span>
                  </div>
                  {g.rows.length === 0 && <p className="pj-caption" style={{ margin: '0 0 6px' }}>None recorded yet.</p>}
                  {g.rows.map((r) => (
                    <div key={r.uid} className="pj-mrow" data-testid={`preview-${r.id}`} style={sel?.uid === r.uid ? { background: 'var(--pj-project-soft)' } : undefined}>
                      <button type="button" className="pj-btn link pj-mono" onClick={() => setSel(r)} aria-pressed={sel?.uid === r.uid} style={{ textAlign: 'left' }}>
                        {r.id}
                      </button>
                      <span>{r.title || <span className="pj-muted">(not written yet)</span>}</span>
                      <MapStatus status={r.status} short />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
          <div className="pj-map-gutter" aria-hidden>
            → maps to
          </div>
          <section className="pj-pane" aria-labelledby="mp-right">
            <div className="pj-pane-head mbse">
              <h2 id="mp-right">Model baseline v0.1</h2>
              <span className="pj-caption">Generated SysML v2 text · checker not yet run</span>
            </div>
            <div className="pj-pane-body">
              <table className="pj-table" style={{ marginTop: 8 }}>
                <caption className="sr-only">Target package and construct per kind</caption>
                <thead>
                  <tr>
                    <th scope="col">Kind</th>
                    <th scope="col">Package</th>
                    <th scope="col">Construct</th>
                    <th scope="col">Modeled</th>
                  </tr>
                </thead>
                <tbody>
                  {p.groups.map((g) => (
                    <tr key={g.kind.prefix}>
                      <td className="pj-id">{g.kind.prefix}</td>
                      <td>{g.kind.pkg}</td>
                      <td className="pj-small">{g.kind.construct}</td>
                      <td className="pj-small">Week {g.kind.modeledIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 className="pj-h3" style={{ marginTop: 14 }}>Generated text, not yet checked</h3>
              <pre className="pj-code" tabIndex={0} aria-label="Generated SysML v2 text" data-testid="generated-sysml">{p.text}</pre>
              <p className="pj-caption">Generated text for teaching. Whether it is valid SysML v2 is decided by the course checker (the reference implementation), not by this view.</p>
            </div>
          </section>
        </div>
      )}
      {sel && (
        <section className="pj-card" aria-labelledby="mp-sel" data-testid="preview-detail">
          <div className="pj-row">
            <h2 id="mp-sel" className="pj-h2" style={{ margin: 0 }}>
              <span className="pj-mono">{sel.id}</span> {sel.title}
            </h2>
            <MapStatus status={sel.status} />
          </div>
          <p className="pj-small">{sel.reason}</p>
          {selKind && <p className="pj-small">Target: {selKind.construct} in package {selKind.pkg} (course mapping, Week {selKind.modeledIn}).</p>}
          {line >= 0 && <pre className="pj-code">{p.text.split('\n').slice(Math.max(0, line - 1), line + 3).join('\n')}</pre>}
          {sel.findings.length > 0 && (
            <ul className="pj-small">
              {sel.findings.map((f) => (
                <li key={f.code}>
                  <strong>{f.cls}</strong>: {f.text}
                </li>
              ))}
            </ul>
          )}
          <div className="pj-row">
            {sel.prefix !== 'REL' ? <Link to={`/project/artifact/${sel.id}`} className="pj-btn primary">Open {sel.id} in My Project</Link> : <Link to="/project/artifacts/REL" className="pj-btn primary">Open the relationships</Link>}
            <span className="pj-caption">Statuses: {MAPPING_STATUSES.map((s) => MAPPING_STATUS_LABEL[s]).join(' · ')}.</span>
          </div>
        </section>
      )}
    </div>
  )
}
