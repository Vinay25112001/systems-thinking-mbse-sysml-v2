// Week 8 lab tool (Lab L8): import the team's Phase I exports (the Week 1 model inputs, versions 1–3, and optionally
// the Week 2 model inputs), review the artifact-to-model mapping and the import findings, preview the generated SysML v2
// model v0.1 skeleton, and export the model (.sysml), the mapping matrix with the audit (.md) and the shared workspace
// (.json). Rendered by the Week 8 page shell at #/week/8/lab/tool. All logic lives in skeleton.ts and state.ts (pure,
// tested both ways); saved in this browser under 'w8.import'. Only a real defect (a relationship end that is not a
// registered stakeholder) keeps an item out of the model; everything else imports and is reported for a disposition.
// M7: the student may read the Week 1 input from the team's My Project instead of a file (ProjectSource.tsx); the
// skeleton is generated from the same projection, so it is byte-identical to a file import of the same data.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadJSON, saveJSON } from '../../lib/storage'
import { downloadText } from '../download'
import { AUDIT_QUESTIONS, FINDING_CLASSES } from '../../content/lectures/week08/labBrief'
import { importFile, type ManualRow } from './skeleton'
import { projectRefOf, week8SourceFromProject } from '../../project/adapters/week8'
import { recordCounts, recordHasContent, toTeamRecord } from '../../project/adapters/week1'
import { useProjectOptional, useProjectState } from '../../project/store/ProjectProvider'
import { isAeroLink } from '../week1/team'
import { IdMappings, SourceChooser } from './ProjectSource'
import { W8_KEY, normalizeSource, auditAnswer, derive, findingKey, importWorkspace, matrixFileName, matrixMarkdown, needsDisposition, normalizeState, readiness, sysmlFileName, words, workspaceFileName, workspaceJson, type W8State } from './state'
import './week8tool.css'

const readFile = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result ?? ''))
    fr.onerror = () => reject(fr.error)
    fr.readAsText(f)
  })

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} className="w8-part" data-testid={id}>
      <h2 id={`${id}-h`} className="w8-ph">
        {title}
      </h2>
      <div className="w8-body">{children}</div>
    </section>
  )
}

export default function Week8LabTool() {
  const [st, setSt] = useState<W8State>(() => normalizeState(loadJSON<unknown>(W8_KEY, null)))
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => {
    saveJSON(W8_KEY, st)
  }, [st])
  // a saved state repaired on load (M7 review M7-10) says so once, then the repaired state is what is saved
  useEffect(() => {
    if (!st.notice) return
    setMsg({ ok: false, text: st.notice })
    setSt(({ notice: _n, ...rest }) => (void _n, rest))
  }, [st.notice])
  const edit = (f: (s: W8State) => W8State) => setSt((s) => ({ ...f(s), updatedAt: Date.now() }))
  const d = useMemo(() => derive(st), [st])
  const ready = useMemo(() => readiness(st), [st])
  const handle = useProjectOptional()
  const pstate = useProjectState()
  // the Week 1 content changed since it was read (compared on the generated source, so the team's own mapping writes,
  // which also raise the project revision, do not count)
  const stale = useMemo(() => !!(handle && st.source === 'project' && st.week1 && st.projectRef?.uid === handle.doc.project.uid && JSON.stringify(normalizeSource(week8SourceFromProject(handle.doc))) !== JSON.stringify(normalizeSource(st.week1))), [handle, st.source, st.week1, st.projectRef])

  /** Reads the Week 1 input from My Project (the student's explicit choice), recording which project and revision. */
  function readProject() {
    if (!handle) return setMsg({ ok: false, text: 'No team project is open in this browser yet.' })
    const doc = handle.doc
    const rec = toTeamRecord(doc, { excludeUnadapted: true })
    if (!recordHasContent(rec)) return setMsg({ ok: false, text: `My Project “${projectRefOf(doc, pstate.storage, '').title}” has no Week 1 work yet: record it in My Project first.` })
    if ([rec.proposal.name, rec.proposal.domain, rec.proposal.soi].some(isAeroLink)) return setMsg({ ok: false, text: 'This project is about AeroLink, the instructor’s worked example: use your team’s own enterprise.' })
    const source = week8SourceFromProject(doc)
    const ref = projectRefOf(doc, pstate.storage, new Date().toISOString())
    edit((s) => ({ ...s, source: 'project', projectRef: ref, week1: source, week1Origin: `My Project “${ref.title}”, revision ${ref.rev}`, snapshot: null }))
    const n = recordCounts(rec)
    return setMsg({ ok: true, text: `My Project “${ref.title}” read at revision ${ref.rev} (${n.stakeholders} stakeholders, ${n.concerns} concerns, ${n.context} external systems).` })
  }
  /** Back to a file: what came from the project is cleared, so the tool never mixes the two sources. */
  function chooseFile() {
    setMsg(null)
    edit((s) => (s.source === 'project' ? { ...s, source: 'file', projectRef: null, week1: null, week1Origin: '' } : s))
  }

  async function onFile(kind: 'week1' | 'week2' | 'workspace', f: File | undefined) {
    if (!f) return
    let text = ''
    try {
      text = await readFile(f)
    } catch {
      setMsg({ ok: false, text: `${f.name} could not be read.` })
      return
    }
    if (kind === 'workspace') {
      const w = importWorkspace(text)
      if ('error' in w) return setMsg({ ok: false, text: w.error })
      edit(() => w)
      return setMsg({ ok: true, text: `Workspace ${f.name} imported.` })
    }
    const r = importFile(text)
    if ('error' in r) return setMsg({ ok: false, text: r.error })
    if (r.kind === 'week1') {
      if (kind === 'week2') return setMsg({ ok: false, text: 'This is a Week 1 model-inputs file: use the Week 1 import.' })
      edit((s) => ({ ...s, week1: r.source, week1Origin: r.source.origin, snapshot: null }))
      return setMsg({ ok: true, text: `${f.name}: ${r.source.origin} imported (${r.source.stakeholders.length} stakeholders, ${r.source.concerns.length} concerns, ${r.source.context.length} external systems).` })
    }
    if (kind === 'week1' && !st.week1 && !r.snapshotOnly) return setMsg({ ok: false, text: 'This Week 2 file carries no Week 1 snapshot: import the Week 1 model inputs.' })
    edit((s) => ({ ...s, week2: r.week2, snapshot: s.week1 ? s.snapshot : r.snapshotOnly }))
    const n = Object.values(r.week2).reduce((a, x) => a + x.length, 0)
    return setMsg({ ok: true, text: `${f.name}: Week 2 model inputs imported (${n} IDs).${st.week1 ? '' : ' Import the Week 1 model inputs too: a Week 2 file holds only stakeholder IDs and names.'}` })
  }

  const setManual = (prefix: string, patch: Partial<ManualRow>) =>
    edit((s) => {
      const cur = s.manual.find((m) => m.prefix === prefix) ?? { prefix, count: '', reason: '' }
      return { ...s, manual: [...s.manual.filter((m) => m.prefix !== prefix), { ...cur, ...patch }] }
    })

  const exportSysml = () => {
    if (!d) return
    if (downloadText(sysmlFileName(st), d.model.text, 'text/plain')) setSt((s) => ({ ...s, exportedSysmlAt: Date.now() }))
  }
  const exportMd = () => {
    if (downloadText(matrixFileName(st), matrixMarkdown(st))) setSt((s) => ({ ...s, exportedMdAt: Date.now() }))
  }
  const exportWorkspace = () => downloadText(workspaceFileName(st), workspaceJson(st), 'application/json')
  const fileInput = (id: string, label: string, kind: 'week1' | 'week2' | 'workspace') => (
    <label className="w8-field">
      <span>{label}</span>
      <input type="file" accept=".json,application/json" className="w8-file" data-testid={id} onChange={(e) => void onFile(kind, e.target.files?.[0])} />
    </label>
  )
  const src = d?.source

  return (
    <div className="w8-tool" data-testid="w8-tool">
      <p className="w8-note" role="note">
        The checks in this tool are course acceptance checks. Whether your model is valid SysML v2 is decided by the course-designated checker, and a checker PASS shows only that the file parsed, every name resolved and no rule fired: it does not show that the model says what your register says. Saved in this browser only: export after every working session.
      </p>

      <Section id="w8-part-import" title="1 · Import your Phase I exports">
        <p className="w8-help">Your team’s Week 1 model inputs (.json, versions 1–3) carry the register: enterprise, system of interest, context, stakeholders, concerns, relationships, mission, goals and needs. The Week 2 model inputs add the scenario, capability, requirement and measure IDs to the mapping. AeroLink files are refused: import your own enterprise.</p>
        <SourceChooser source={st.source} projectRef={st.projectRef} handle={handle} loading={!pstate.ready} stale={stale} onProject={readProject} onFile={chooseFile} />
        <div className="w8-row">
          {st.source === 'file' && fileInput('w8-import-week1', 'Week 1 model inputs (.json)', 'week1')}
          {fileInput('w8-import-week2', 'Week 2 model inputs (.json, optional)', 'week2')}
          {fileInput('w8-import-workspace', 'A teammate’s Week 8 workspace (.json)', 'workspace')}
        </div>
        {msg && (
          <p className={`w8-msg ${msg.ok ? 'ok' : 'err'}`} role={msg.ok ? 'status' : 'alert'} data-testid="w8-message">
            {msg.ok ? '✓ ' : '✗ '}
            {msg.text}
          </p>
        )}
        {src && (
          <dl className="w8-summary" data-testid="w8-summary">
            <dt>Team</dt>
            <dd>{src.team || '(no team number)'}</dd>
            <dt>Enterprise</dt>
            <dd>{src.enterprise.name || '(no name)'}</dd>
            {st.source === 'project' && (
              <>
                <dt>Source</dt>
                <dd data-testid="w8-summary-source">{st.week1Origin}</dd>
              </>
            )}
            <dt>Imported</dt>
            <dd>
              {src.stakeholders.length} stakeholders, {src.concerns.length} concerns, {src.context.length} external systems, {src.relationships.length} relationships, {src.needs.length} needs{src.week2 ? `, Week 2: ${Object.values(src.week2).reduce((a, x) => a + x.length, 0)} IDs` : ''}
            </dd>
          </dl>
        )}
      </Section>

      {d && src && (
        <>
          <Section id="w8-part-purpose" title="2 · Model purpose">
            <label className="w8-field">
              <span>Who uses this model, and for which decisions? (written in the root package’s documentation; {words(st.purpose)} words)</span>
              <textarea className="w8-textarea" rows={3} value={st.purpose} data-testid="w8-purpose" onChange={(e) => edit((s) => ({ ...s, purpose: e.target.value }))} />
            </label>
          </Section>

          <Section id="w8-part-options" title="3 · Scope">
            <label className="w8-check">
              <input type="checkbox" checked={st.assessment} data-testid="w8-option-assessment" onChange={(e) => edit((s) => ({ ...s, assessment: e.target.checked }))} />
              <span>Register ratings as assessment metadata (unchecked: kept in each stakeholder’s documentation, the reduced scope for a team of three)</span>
            </label>
            <label className="w8-field narrow">
              <span>Relationships to model</span>
              <select value={st.relationships} data-testid="w8-option-relationships" onChange={(e) => edit((s) => ({ ...s, relationships: e.target.value === 'conflicts' ? 'conflicts' : 'all' }))}>
                <option value="all">All relationships</option>
                <option value="conflicts">Conflict relationships only (reduced scope, team of three)</option>
              </select>
            </label>
          </Section>

          <Section id="w8-part-mapping" title="4 · Artifact-to-model mapping matrix">
            <p className="w8-help">One row per ID kind of the course mapping. Kinds that are not in the imported files come from your Week 7 package: enter how many IDs it holds (0 if none) and the reason for any choice that is not obvious.</p>
            <div className="w8-scroll" tabIndex={0} role="region" aria-label="Mapping matrix (scrolls sideways on small screens)">
              <table className="w8-table" data-testid="w8-mapping">
                <caption className="sr-only">Mapping of each Phase I ID kind to a model package and a SysML v2 construct</caption>
                <thead>
                  <tr>
                    <th scope="col">Prefix</th>
                    <th scope="col">Artifact (Phase I week)</th>
                    <th scope="col">Package · construct</th>
                    <th scope="col">Modeled in</th>
                    <th scope="col">Count / IDs</th>
                    <th scope="col">Status</th>
                    <th scope="col">Team reason</th>
                  </tr>
                </thead>
                <tbody>
                  {d.matrix.map((r) => (
                    <tr key={r.prefix} data-prefix={r.prefix} data-status={r.status}>
                      <th scope="row">{r.prefix}</th>
                      <td>
                        {r.artifact} ({r.phaseWeek})
                      </td>
                      <td>
                        {r.pkg} · {r.construct}
                      </td>
                      <td>Week {r.modeledIn}</td>
                      <td>
                        {r.ids.length ? (
                          <span title={r.ids.join(', ')}>{r.count}</span>
                        ) : (
                          <input className="w8-input narrow" inputMode="numeric" aria-label={`Count of ${r.prefix} IDs in the Week 7 package`} value={r.manual?.count ?? ''} data-testid={`w8-count-${r.prefix}`} onChange={(e) => setManual(r.prefix, { count: e.target.value })} />
                        )}
                      </td>
                      <td>{r.status}</td>
                      <td>
                        <input className="w8-input" aria-label={`Reason for the ${r.prefix} mapping`} value={r.manual?.reason ?? ''} onChange={(e) => setManual(r.prefix, { reason: e.target.value })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {st.source === 'project' && handle && st.projectRef?.uid === handle.doc.project.uid && (
            <Section id="w8-part-ids" title="4b · Package for each Week 1 ID (saved in My Project)">
              <IdMappings handle={handle} />
            </Section>
          )}

          <Section id="w8-part-findings" title="5 · Import findings">
            <div data-testid="w8-findings">
              {FINDING_CLASSES.map((c) => {
                const fs = d.findings.filter((f) => f.cls === c.id)
                return (
                  <div key={c.id} className="w8-group" data-class={c.id}>
                    <h3>
                      {c.label} ({fs.length})
                    </h3>
                    <p className="w8-help">{c.meaning}</p>
                    {fs.length > 0 && (
                      <ul className="w8-findings">
                        {fs.map((f) => (
                          <li key={findingKey(f)} data-finding={f.code}>
                            <strong>{f.id}</strong> {f.text}
                            {needsDisposition(f) && (
                              <label className="w8-field">
                                <span>Disposition for {f.id}</span>
                                <input className="w8-input" value={st.dispositions[findingKey(f)] ?? ''} onChange={(e) => edit((s) => ({ ...s, dispositions: { ...s.dispositions, [findingKey(f)]: e.target.value } }))} />
                              </label>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </Section>

          <Section id="w8-part-audit" title="6 · Import audit">
            <ol className="w8-audit" data-testid="w8-audit">
              {AUDIT_QUESTIONS.map((q) => (
                <li key={q.id}>
                  <strong>{q.label}.</strong> {q.question}
                  {q.id === 'completeness' || q.id === 'structure' ? (
                    <p className="w8-answer" data-testid={`w8-audit-${q.id}`}>
                      {auditAnswer(q.id, d, st.notes)}
                    </p>
                  ) : (
                    <label className="w8-field">
                      <span>Your answer ({q.label.toLowerCase()})</span>
                      <textarea className="w8-textarea" rows={2} value={st.notes[q.id] ?? ''} onChange={(e) => edit((s) => ({ ...s, notes: { ...s.notes, [q.id]: e.target.value } }))} />
                    </label>
                  )}
                </li>
              ))}
            </ol>
          </Section>

          <Section id="w8-part-preview" title="7 · Generated model v0.1 (preview)">
            <p className="w8-help">Extend this skeleton in your editor, then run it through the checker until it reports zero errors and every warning is explained.{d.model.excluded.length ? ` Left out as defects: ${d.model.excluded.join(', ')}.` : ''}</p>
            <div className="w8-scroll" tabIndex={0} role="region" aria-label="Generated SysML v2 text (scrolls on small screens)">
              <pre className="w8-pre" data-testid="w8-preview">
                {d.model.text}
              </pre>
            </div>
          </Section>

          <Section id="w8-part-export" title="8 · Export">
            <div className="w8-row">
              <button type="button" className="lf-btn primary small" data-testid="w8-export-sysml" onClick={exportSysml}>
                Export the model ({sysmlFileName(st)})
              </button>
              <button type="button" className="lf-btn small" data-testid="w8-export-md" onClick={exportMd}>
                Export the mapping matrix and audit ({matrixFileName(st)})
              </button>
              <button type="button" className="lf-btn small" data-testid="w8-export-workspace" onClick={exportWorkspace}>
                Export the workspace for a teammate
              </button>
            </div>
          </Section>
        </>
      )}

      <section aria-labelledby="w8-ready-h" className="w8-part" data-testid="w8-readiness">
        <h2 id="w8-ready-h" className="w8-ph">
          Readiness: <span data-testid="w8-state">{ready.ready ? '✓ ready to submit' : '○ not ready'}</span>
        </h2>
        <ul className="w8-body w8-ready">
          {ready.items.map((x) => (
            <li key={x.id} data-ok={x.ok}>
              <strong>{x.ok ? '✓ done' : '○ to do'}</strong> {x.label}: {x.detail}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
