// Week 9 lab tool (Lab L9): import the team's Week 8 model v0.1 (.sysml) and its Week 1 and Week 2 model inputs (.json),
// decide each requirement's subject and required constraint and each need's stakeholders and concerns, read the trace
// matrix and the trace audit, keep the AI review log, preview model v0.2 and export it (.sysml) with the trace matrix
// (.md) and a shared workspace (.json). Rendered by the Week 9 page shell at #/week/9/lab/tool. All logic lives in
// requirements.ts and state.ts (pure, tested both ways); saved in this browser under 'w9.requirements'. Only a real
// defect (a reference that would not resolve) keeps an item out of the model; every other gap is reported with the
// reason, in the student's view, beside the field that fixes it.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadJSON, saveJSON } from '../../lib/storage'
import { downloadText } from '../download'
import { AI_CATEGORIES, LAB9_MINIMUMS, OPS, QUANTITIES, W9_FINDING_CLASSES, quantityOf } from '../../content/lectures/week09/labBrief'
import { EMPTY_CHOICE, dispositionProblem, findingKey, hasUnknown, needsDisposition, phase1FromWeek1, phase1FromWeek2, readWeek1, readWeek2For9, readWeek8, type Choice } from './requirements'
import {
  W9_KEY, aiProblem, derive, dispositionOf, importWorkspace, matrixFileName, matrixMarkdown, mismatch, nextAiId, normalizeState, partialProblem, readiness, sysmlFileName, workspaceFileName, workspaceJson, type AiFinding, type W9State,
} from './state'
import '../week8/week8tool.css'
import './week9tool.css'

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

type Kind = 'week8' | 'week1' | 'week2' | 'workspace'

export default function Week9LabTool() {
  const [st, setSt] = useState<W9State>(() => normalizeState(loadJSON<unknown>(W9_KEY, null)))
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => {
    saveJSON(W9_KEY, st)
  }, [st])
  const edit = (f: (s: W9State) => W9State) => setSt((s) => ({ ...f(s), updatedAt: Date.now() }))
  const d = useMemo(() => derive(st), [st])
  const ready = useMemo(() => readiness(st), [st])
  const mm = mismatch(st)

  async function onFile(kind: Kind, f: File | undefined) {
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
    if (kind === 'week8') {
      const r = readWeek8(text)
      if ('error' in r) return setMsg({ ok: false, text: r.error })
      const had = /package\s+Needs\s*\{[^}]*requirement\s*</.test(text)
      edit((s) => ({ ...s, w8: { text, origin: `${f.name} (model of ${r.model.enterpriseName || 'an unnamed enterprise'})` } }))
      return setMsg({ ok: true, text: `${f.name}: ${r.model.stakeholders.length} stakeholders and ${r.model.concerns.length} concerns found in the model.${had ? ' This file already holds needs or requirements: the tool regenerates the Needs and Requirements packages from your Week 1 and Week 2 files, so any change you made to them by hand after the last export is replaced.' : ''}` })
    }
    if (kind === 'week1') {
      const r = readWeek1(text)
      if ('error' in r) return setMsg({ ok: false, text: r.error })
      const p = phase1FromWeek1(r.record)
      edit((s) => ({ ...s, w1: { ...p, origin: `${f.name} (Week 1 model inputs, team ${p.team || 'unnumbered'})` } }))
      return setMsg({ ok: true, text: `${f.name}: ${p.needs.length} needs and ${p.objectives.length} mission and objective elements imported.` })
    }
    const r = readWeek2For9(text)
    if ('error' in r) return setMsg({ ok: false, text: r.error })
    const p = phase1FromWeek2(r.record)
    edit((s) => ({ ...s, w2: { team: p.team, enterprise: p.enterprise, requirements: p.requirements, needsAdded: p.needsAdded, dispositions: p.dispositions, origin: `${f.name} (Week 2 model inputs)` } }))
    return setMsg({ ok: true, text: `${f.name}: ${p.requirements.length} requirements${p.needsAdded.length ? ` and ${p.needsAdded.length} needs added in Week 2` : ''} imported.` })
  }

  const choice = (id: string): Choice => ({ ...EMPTY_CHOICE, ...(st.choices[id] ?? {}) })
  const setChoice = (id: string, patch: Partial<Choice>) => edit((s) => ({ ...s, choices: { ...s.choices, [id]: { ...EMPTY_CHOICE, ...(s.choices[id] ?? {}), ...patch } } }))
  const setNeed = (id: string, patch: Partial<{ stakeholders: string; concerns: string }>) => edit((s) => ({ ...s, needChoices: { ...s.needChoices, [id]: { ...(s.needChoices[id] ?? { stakeholders: '', concerns: '' }), ...patch } } }))
  const setAi = (i: number, patch: Partial<AiFinding>) => edit((s) => ({ ...s, ai: s.ai.map((a, k) => (k === i ? { ...a, ...patch } : a)) }))
  const addAi = () => edit((s) => ({ ...s, ai: [...s.ai, { id: nextAiId(s), requirement: '', category: '', quote: '', decision: '', reason: '', change: '' }], aiIssued: s.aiIssued + 1 }))

  const exportSysml = () => {
    if (d && downloadText(sysmlFileName(st), d.model.text, 'text/plain')) setSt((s) => ({ ...s, exportedSysmlAt: Date.now() }))
  }
  const exportMd = () => {
    if (downloadText(matrixFileName(st), matrixMarkdown(st))) setSt((s) => ({ ...s, exportedMdAt: Date.now() }))
  }
  const exportWorkspace = () => downloadText(workspaceFileName(st), workspaceJson(st), 'application/json')
  const fileInput = (id: string, label: string, kind: Kind, accept: string) => (
    <label className="w8-field">
      <span>{label}</span>
      <input type="file" accept={accept} className="w8-file" data-testid={id} onChange={(e) => void onFile(kind, e.target.files?.[0])} />
    </label>
  )
  const physDefs = d?.w8.physicalDefs ?? []

  return (
    <div className="w8-tool w9-tool" data-testid="w9-tool">
      <p className="w8-note" role="note">
        The checks in this tool are course acceptance checks. Whether model v0.2 is valid SysML v2 is decided by the course-designated checker, and a checker PASS shows only that the file parsed, every name resolved and no rule fired: it does not show that a requirement is the right one, that its subject is the right element, or that a design meets it. Saved in this browser only: export after every working session.
      </p>

      <Section id="w9-part-import" title="1 · Import your three files">
        <p className="w8-help">Your Week 8 model v0.1 (the .sysml file the Week 8 lab tool exported), your Week 1 model inputs and your Week 2 model inputs (.json). AeroLink files and files of another team are refused with the reason.</p>
        <div className="w8-row">
          {fileInput('w9-import-week8', 'Week 8 model v0.1 (.sysml)', 'week8', '.sysml,.txt,text/plain')}
          {fileInput('w9-import-week1', 'Week 1 model inputs (.json)', 'week1', '.json,application/json')}
          {fileInput('w9-import-week2', 'Week 2 model inputs (.json)', 'week2', '.json,application/json')}
          {fileInput('w9-import-workspace', 'A teammate’s Week 9 workspace (.json)', 'workspace', '.json,application/json')}
        </div>
        {msg && (
          <p className={`w8-msg ${msg.ok ? 'ok' : 'err'}`} role={msg.ok ? 'status' : 'alert'} data-testid="w9-message">
            {msg.ok ? '✓ ' : '✗ '}
            {msg.text}
          </p>
        )}
        {mm && (
          <p className="w8-msg err" role="alert" data-testid="w9-mismatch">
            ✗ {mm}
          </p>
        )}
        <ul className="w9-files" data-testid="w9-files">
          <li data-ok={!!st.w8}>{st.w8 ? `✓ Week 8 model: ${st.w8.origin}` : '○ Week 8 model: not imported'}</li>
          <li data-ok={!!st.w1}>{st.w1 ? `✓ Week 1: ${st.w1.origin}` : '○ Week 1 model inputs: not imported'}</li>
          <li data-ok={!!st.w2}>{st.w2 ? `✓ Week 2: ${st.w2.origin}` : '○ Week 2 model inputs: not imported'}</li>
        </ul>
      </Section>

      {d && (
        <>
          <Section id="w9-part-needs" title="2 · Needs: stakeholders and framed concerns">
            <p className="w8-help">Each need becomes a requirement usage with the enterprise as subject, a stakeholder parameter for each stakeholder and a frame for each concern it answers. The IDs come from your Week 1 record; correct them here only if the record is wrong (type IDs, for example “STK-002, STK-005”), and frame only the concerns the need answers.</p>
            <div className="w8-scroll" tabIndex={0} role="region" aria-label="Needs (scrolls sideways on small screens)">
              <table className="w8-table" data-testid="w9-needs">
                <caption className="sr-only">Each need with its stakeholders, framed concerns and the objective it serves</caption>
                <thead>
                  <tr>
                    <th scope="col">Need</th>
                    <th scope="col">Stakeholders</th>
                    <th scope="col">Framed concerns</th>
                    <th scope="col">Serves</th>
                  </tr>
                </thead>
                <tbody>
                  {d.p1.needs.map((n) => (
                    <tr key={n.id} data-need={n.id}>
                      <th scope="row">
                        {n.id} <span className="w9-name">{n.name}</span>
                      </th>
                      <td>
                        <input className="w8-input" aria-label={`Stakeholders of ${n.id}`} placeholder={n.stakeholders.join(', ') || 'STK-…'} value={st.needChoices[n.id]?.stakeholders ?? ''} onChange={(e) => setNeed(n.id, { stakeholders: e.target.value })} />
                      </td>
                      <td>
                        <input className="w8-input" aria-label={`Concerns framed by ${n.id}`} placeholder={n.concerns.join(', ') || 'CON-…'} value={st.needChoices[n.id]?.concerns ?? ''} onChange={(e) => setNeed(n.id, { concerns: e.target.value })} />
                      </td>
                      <td>{n.objective || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="w9-part-reqs" title="3 · Requirements: subject and required constraint">
            <p className="w8-help">For each requirement: the subject (the enterprise for a stakeholder requirement; for a system requirement, the element its “shall” is about: an existing part definition of your model, or a placeholder the tool writes in Physical or Logical), then the measured feature of the subject, the comparison and the limit with its unit. Leave the limit empty only when the statement carries a TBD or TBR: the constraint stays, and the status records the open value and its owner.</p>
            <ol className="w9-reqs" data-testid="w9-reqs">
              {d.p1.requirements.map((q) => {
                const c = choice(q.id)
                const fm = d.model.formal.get(q.id)
                const qt = quantityOf(c.quantity)
                return (
                  <li key={q.id} className="w9-req" data-req={q.id} data-formal={fm?.ok ? 'yes' : 'no'}>
                    <p className="w9-req-head">
                      <strong>{q.id}</strong> {q.name} <span className="w9-name">({q.level})</span>
                    </p>
                    <p className="w8-help">{q.statement}</p>
                    <div className="w8-row">
                      <label className="w8-field">
                        <span>Subject</span>
                        <select value={c.subject || (q.level === 'stakeholder' ? 'enterprise' : '')} data-testid={`w9-subject-${q.id}`} onChange={(e) => setChoice(q.id, { subject: e.target.value as Choice['subject'] })}>
                          {q.level === 'system' && <option value="">Choose the element…</option>}
                          <option value="enterprise">the enterprise</option>
                          <option value="soi">the system of interest</option>
                          {physDefs
                            .filter((p) => p !== 'System of interest')
                            .map((p) => (
                              <option key={p} value={`def:${p}`}>
                                {p}
                              </option>
                            ))}
                          <option value="new">a new placeholder…</option>
                        </select>
                      </label>
                      {c.subject === 'new' && (
                        <>
                          <label className="w8-field">
                            <span>Placeholder name</span>
                            <input className="w8-input" value={c.newName} data-testid={`w9-newname-${q.id}`} onChange={(e) => setChoice(q.id, { newName: e.target.value })} />
                          </label>
                          <label className="w8-field">
                            <span>Package</span>
                            <select value={c.newPkg} onChange={(e) => setChoice(q.id, { newPkg: e.target.value === 'Logical' ? 'Logical' : 'Physical' })}>
                              <option value="Physical">Physical</option>
                              <option value="Logical">Logical</option>
                            </select>
                          </label>
                        </>
                      )}
                    </div>
                    <div className="w8-row">
                      <label className="w8-field">
                        <span>Measured feature of the subject</span>
                        <input className="w8-input" value={c.feature} placeholder="e.g. waitP90" data-testid={`w9-feature-${q.id}`} onChange={(e) => setChoice(q.id, { feature: e.target.value })} />
                      </label>
                      <label className="w8-field">
                        <span>Quantity</span>
                        <select value={c.quantity} data-testid={`w9-quantity-${q.id}`} onChange={(e) => setChoice(q.id, { quantity: e.target.value as Choice['quantity'], unit: quantityOf(e.target.value)?.units[0] ?? '' })}>
                          <option value="">Choose…</option>
                          {QUANTITIES.map((x) => (
                            <option key={x.id} value={x.id}>
                              {x.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="w8-field">
                        <span>Comparison</span>
                        <select value={c.op} data-testid={`w9-op-${q.id}`} onChange={(e) => setChoice(q.id, { op: e.target.value as Choice['op'] })}>
                          {OPS.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="w8-field">
                        <span>Limit{hasUnknown(q) ? ` (may stay empty: ${q.tokens.join(', ')})` : ''}</span>
                        <input className="w8-input narrow" inputMode="decimal" value={c.value} data-testid={`w9-value-${q.id}`} onChange={(e) => setChoice(q.id, { value: e.target.value })} />
                      </label>
                      {qt && qt.units.length > 0 && (
                        <label className="w8-field">
                          <span>Unit</span>
                          <select value={c.unit} data-testid={`w9-unit-${q.id}`} onChange={(e) => setChoice(q.id, { unit: e.target.value })}>
                            {qt.units.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <label className="w8-field">
                        <span>Form</span>
                        <select value={c.form} data-testid={`w9-form-${q.id}`} onChange={(e) => setChoice(q.id, { form: e.target.value === 'shared' ? 'shared' : 'direct' })}>
                          <option value="direct">direct</option>
                          <option value="shared">shared definition</option>
                        </select>
                      </label>
                    </div>
                    <div className="w8-row">
                      <label className="w8-field w9-wide">
                        <span>Assumption, only if the condition bounds where the requirement applies (optional). Written as an informal assumption (doc only); write the condition as an expression by hand if it should gate the requirement</span>
                        <input className="w8-input" value={c.assume} onChange={(e) => setChoice(q.id, { assume: e.target.value })} />
                      </label>
                      {hasUnknown(q) && (
                        <label className="w8-field">
                          <span>Owner of {q.tokens.join(', ')}</span>
                          <input className="w8-input" value={c.owner} placeholder={q.tbdOwner || 'who closes it'} data-testid={`w9-owner-${q.id}`} onChange={(e) => setChoice(q.id, { owner: e.target.value })} />
                        </label>
                      )}
                    </div>
                    <p className={`w9-formal ${fm?.ok ? 'ok' : 'gap'}`} data-testid={`w9-formal-${q.id}`}>
                      {fm?.ok ? `✓ require constraint { ${fm.subjectName}.${fm.feature} ${fm.op} ${fm.value ?? `${fm.limitName} (open value)`} }` : `○ doc only: ${fm && !fm.ok ? fm.why : 'not formalized'}`}
                    </p>
                  </li>
                )
              })}
            </ol>
            {d.model.sharedDefs.length === 0 && (
              <label className="w8-field">
                <span>No shared requirement definition yet: mark at least {LAB9_MINIMUMS.sharedUsages} requirements of one quantity and comparison “shared definition”, or write why none of your requirements share a form</span>
                <input className="w8-input" value={st.sharedReason} data-testid="w9-shared-reason" onChange={(e) => edit((s) => ({ ...s, sharedReason: e.target.value }))} />
              </label>
            )}
          </Section>

          <Section id="w9-part-trace" title="4 · Trace matrix (read from the model)">
            <div className="w8-scroll" tabIndex={0} role="region" aria-label="Trace matrix (scrolls sideways on small screens)">
              <table className="w8-table" data-testid="w9-trace">
                <caption className="sr-only">Each need with the stakeholder and system requirements derived from it</caption>
                <thead>
                  <tr>
                    <th scope="col">Need</th>
                    <th scope="col">Stakeholder requirements</th>
                    <th scope="col">System requirements</th>
                    <th scope="col">Coverage</th>
                    <th scope="col">Only partly covered?</th>
                  </tr>
                </thead>
                <tbody>
                  {d.rows.map((r) => (
                    <tr key={r.need} data-status={r.status}>
                      <th scope="row">{r.need}</th>
                      <td>{r.stkReqs.join(', ') || '—'}</td>
                      <td>{r.sysReqs.join(', ') || '—'}</td>
                      <td>{r.status === 'covered' ? '✓ covered' : r.status === 'partial' ? '◐ partial' : '○ no stakeholder requirement'}</td>
                      <td>
                        {r.stkReqs.length > 0 && (
                          <label>
                            <input type="checkbox" checked={!!st.partials[r.need]} data-testid={`w9-partial-${r.need}`} onChange={(e) => edit((s) => { const partials = { ...s.partials }; if (e.target.checked) partials[r.need] = { missing: '', owner: '', week: '' }; else delete partials[r.need]; return { ...s, partials } })} />
                            <span className="sr-only">{r.need} is only partly covered</span>
                          </label>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="w8-help">A derivation shows that a link exists, not that the whole need is met. Tick every need your Week 2 audit recorded as only partly covered: it then reads “partial” in the matrix and the export, and you record the open item below.</p>
            {Object.keys(st.partials).sort().map((k) => {
              const p = st.partials[k]
              const problem = partialProblem(p)
              const set = (f: keyof typeof p, v: string) => edit((s) => ({ ...s, partials: { ...s.partials, [k]: { ...s.partials[k], [f]: v } } }))
              return (
                <fieldset key={k} className="w8-group" data-testid={`w9-partial-item-${k}`}>
                  <legend>{k}: the open item</legend>
                  <label className="w8-field"><span>Missing part of {k}</span><input className="w8-input" value={p.missing} data-testid={`w9-partial-missing-${k}`} onChange={(e) => set('missing', e.target.value)} /></label>
                  <label className="w8-field"><span>Owner</span><input className="w8-input" value={p.owner} data-testid={`w9-partial-owner-${k}`} onChange={(e) => set('owner', e.target.value)} /></label>
                  <label className="w8-field"><span>Week or review</span><input className="w8-input" value={p.week} data-testid={`w9-partial-week-${k}`} onChange={(e) => set('week', e.target.value)} /></label>
                  {problem && (
                    <span className="w9-problem" role="note">
                      ○ {problem}
                    </span>
                  )}
                </fieldset>
              )
            })}
          </Section>

          <Section id="w9-part-audit" title="5 · Trace audit">
            <div data-testid="w9-findings">
              {W9_FINDING_CLASSES.map((c) => {
                const fs = d.findings.filter((f) => f.cls === c.id)
                return (
                  <div key={c.id} className="w8-group" data-class={c.id}>
                    <h3>
                      {c.label} ({fs.length})
                    </h3>
                    <p className="w8-help">{c.meaning}</p>
                    {fs.length > 0 && (
                      <ul className="w8-findings">
                        {fs.map((f) => {
                          const v = dispositionOf(st, f)
                          const problem = needsDisposition(f) ? dispositionProblem(v) : null
                          return (
                            <li key={findingKey(f)} data-finding={f.code}>
                              <strong>{f.id}</strong> {f.text}
                              {needsDisposition(f) && (
                                <label className="w8-field">
                                  <span>Disposition for {f.id}</span>
                                  <input className="w8-input" value={v} data-testid={`w9-disp-${f.code}-${f.id}`} onChange={(e) => edit((s) => ({ ...s, dispositions: { ...s.dispositions, [findingKey(f)]: e.target.value } }))} />
                                  {problem && v.trim() && (
                                    <span className="w9-problem" role="note">
                                      ○ {problem}
                                    </span>
                                  )}
                                </label>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
            <label className="w8-field">
              <span>Trace-audit note: one sentence justifying each assumption you wrote, and anything else the audit must record (exported under its own heading)</span>
              <textarea className="w8-input" rows={4} value={st.auditNote} data-testid="w9-audit-note" onChange={(e) => edit((s) => ({ ...s, auditNote: e.target.value }))} />
            </label>
          </Section>

          <Section id="w9-part-ai" title="6 · AI review log">
            <p className="w8-help">
              Ask an AI tool for findings in four categories ({AI_CATEGORIES.join(', ')}), each tied to a requirement ID and a quoted phrase. Record every finding here, accept or reject it with a reason, and for an accepted one say what you changed. At least {st.w1?.threePersonTeam ? LAB9_MINIMUMS.aiFindingsThree : LAB9_MINIMUMS.aiFindings} findings. IDs are never reused.
            </p>
            <ol className="w9-ai" data-testid="w9-ai">
              {st.ai.map((a, i) => {
                const problem = aiProblem(a)
                return (
                  <li key={a.id} data-ai={a.id}>
                    <div className="w8-row">
                      <strong>{a.id}</strong>
                      <label className="w8-field">
                        <span>Requirement</span>
                        <input className="w8-input narrow" value={a.requirement} onChange={(e) => setAi(i, { requirement: e.target.value })} />
                      </label>
                      <label className="w8-field">
                        <span>Category</span>
                        <select value={a.category} onChange={(e) => setAi(i, { category: e.target.value })}>
                          <option value="">Choose…</option>
                          {AI_CATEGORIES.map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="w8-field">
                        <span>Quoted phrase</span>
                        <input className="w8-input" value={a.quote} onChange={(e) => setAi(i, { quote: e.target.value })} />
                      </label>
                      <label className="w8-field">
                        <span>Decision</span>
                        <select value={a.decision} onChange={(e) => setAi(i, { decision: e.target.value as AiFinding['decision'] })}>
                          <option value="">Choose…</option>
                          <option value="accept">accept</option>
                          <option value="reject">reject</option>
                        </select>
                      </label>
                    </div>
                    <div className="w8-row">
                      <label className="w8-field w9-wide">
                        <span>Reason</span>
                        <input className="w8-input" value={a.reason} onChange={(e) => setAi(i, { reason: e.target.value })} />
                      </label>
                      <label className="w8-field w9-wide">
                        <span>Change made (if accepted)</span>
                        <input className="w8-input" value={a.change} onChange={(e) => setAi(i, { change: e.target.value })} />
                      </label>
                      <button type="button" className="lf-btn small" onClick={() => edit((s) => ({ ...s, ai: s.ai.filter((_, k) => k !== i) }))}>
                        Remove {a.id}
                      </button>
                    </div>
                    <p className={`w9-formal ${problem ? 'gap' : 'ok'}`}>{problem ? `○ ${problem}` : '✓ complete'}</p>
                  </li>
                )
              })}
            </ol>
            <div className="w8-row">
              <button type="button" className="lf-btn small" data-testid="w9-ai-add" onClick={addAi}>
                Add a finding ({nextAiId(st)})
              </button>
            </div>
          </Section>

          <Section id="w9-part-preview" title="7 · Generated model v0.2 (preview)">
            <p className="w8-help">Run this file through the checker until it reports zero errors and every warning is explained.{d.model.excluded.length ? ` Left out as defects: ${d.model.excluded.join(', ')}.` : ''}</p>
            <div className="w8-scroll" tabIndex={0} role="region" aria-label="Generated SysML v2 text (scrolls on small screens)">
              <pre className="w8-pre" data-testid="w9-preview">
                {d.model.text}
              </pre>
            </div>
          </Section>

          <Section id="w9-part-export" title="8 · Export">
            <div className="w8-row">
              <button type="button" className="lf-btn primary small" data-testid="w9-export-sysml" onClick={exportSysml}>
                Export the model ({sysmlFileName(st)})
              </button>
              <button type="button" className="lf-btn small" data-testid="w9-export-md" onClick={exportMd}>
                Export the trace matrix and audit ({matrixFileName(st)})
              </button>
              <button type="button" className="lf-btn small" data-testid="w9-export-workspace" onClick={exportWorkspace}>
                Export the workspace for a teammate
              </button>
            </div>
          </Section>
        </>
      )}

      <section aria-labelledby="w9-ready-h" className="w8-part" data-testid="w9-readiness">
        <h2 id="w9-ready-h" className="w8-ph">
          Readiness: <span data-testid="w9-state">{ready.ready ? '✓ ready to submit' : '○ not ready'}</span>
        </h2>
        <ul className="w8-body w8-ready">
          {ready.items.map((x) => (
            <li key={x.id} data-ok={x.ok} data-testid={`w9-ready-${x.id}`}>
              <strong>{x.ok ? '✓ done' : '○ to do'}</strong> {x.label}: {x.detail}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
