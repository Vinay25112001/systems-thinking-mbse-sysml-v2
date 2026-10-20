// Week 3 lab tool (Lab L3): the team's own Week 3 Team Record, extending its Week 2 record. Rendered by the Week 3 page
// shell at #/week/3/lab/tool. Every check and every number lives in record.ts (pure, tested both ways, computed with the
// labBrief functions the lecture uses); this view only edits the record and shows each Part's status with "Still needed"
// issues, the per-entry hard gates (pass or fails, with a glyph and a word, never color alone) and the advisories, labeled
// advisory. Saved in this browser (key w3.record) and normalized on load; exported as Markdown and JSON; a teammate's JSON
// export can be imported.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadJSON, saveJSON } from '../../lib/storage'
import { downloadText } from '../download'
import { CONSEQUENCE, HANDLING, LIKELIHOOD, RISK_CATEGORIES, TRL_SCALE } from '../../content/lectures/week03/labBrief'
import {
  CHECKPOINT_CRITERIA, EMPTY_ALTERNATIVE, EMPTY_ASSUMPTION, EMPTY_CRITERION, EMPTY_ISSUE, EMPTY_OPPORTUNITY, EMPTY_PROFILE_ROW, EMPTY_RISK, EMPTY_SCREEN, EMPTY_TECHNOLOGY, EMPTY_TPM, EMPTY_UNKNOWN,
  RISK_ADVISORY_SHORT, RISK_GATE_SHORT, TECH_ADVISORY_SHORT, TECH_GATE_SHORT, TPM_ADVISORY_SHORT, TPM_GATE_SHORT, TRADE_ADVISORY_SHORT, TRADE_GATE_SHORT, W3_KEY,
  allChecks, assessRisk, assessTechnology, assessTpm, assessTrade, fileStem, importWeek2File, importWeek3, minimumsOf, modelInputs, nextId, normalizeRecord, recordMarkdown, recordState,
  riskLevel, riskStatement, tpmNumbers, tpmProfile, trlWording, withIssued, withWeek2,
  type Alternative, type Assumption, type Criterion, type IdPrefix, type Issue, type Opportunity, type PartCheck, type Risk, type Screen, type Technology, type Tpm, type Unknown, type Week3Record,
} from './record'
import './week3tool.css'

const readFile = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result ?? ''))
    fr.onerror = () => reject(fr.error)
    fr.readAsText(f)
  })

function Part({ id, n, title, check, children }: { id: string; n?: string; title: string; check: PartCheck; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} className="w3-part" data-testid={id}>
      <div className="w3-ph">
        <h2 id={`${id}-h`}>{n ? `${n} · ${title}` : title}</h2>
        <span className="w3-sp" />
        <span className={`w3-chip ${check.ok ? 'ok' : 'warn'}`}>{check.ok ? '✓ complete' : '○ incomplete'}</span>
      </div>
      <div className="w3-body">
        {children}
        <div className={`w3-note ${check.ok ? 'ok' : 'warn'}`} role="status" data-testid={`${id}-check`}>
          {check.ok ? (
            <>✓ {check.detail}</>
          ) : (
            <>
              <strong>Still needed:</strong>
              <ul>
                {check.issues.slice(0, 8).map((x) => (
                  <li key={x}>{x}</li>
                ))}
                {check.issues.length > 8 && <li>and {check.issues.length - 8} more</li>}
              </ul>
            </>
          )}
          {!!check.notes?.length && (
            <>
              <strong className="mt-1 block">Advisory notes (they never block):</strong>
              <ul>
                {check.notes.slice(0, 8).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="w3-field">
      <span>{label}</span>
      {children}
    </label>
  )
}
const Text = ({ label, value, onChange, mono, narrow, testId }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; narrow?: boolean; testId?: string }) => (
  <Field label={label}>
    <input className={`w3-input${mono ? ' mono' : ''}${narrow ? ' narrow' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
const Area = ({ label, value, onChange, rows = 2, testId }: { label: string; value: string; onChange: (v: string) => void; rows?: number; testId?: string }) => (
  <Field label={label}>
    <textarea className="w3-textarea" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
function Select({ label, value, onChange, options, testId }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; testId?: string }) {
  return (
    <Field label={label}>
      <select className="w3-select" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId}>
        <option value="">Choose…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  )
}
const Remove = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" className="lf-btn small" onClick={onClick}>
    Remove {label}
  </button>
)
const Check = ({ label, checked, onChange, testId }: { label: string; checked: boolean; onChange: (v: boolean) => void; testId?: string }) => (
  <label className="w3-check">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid={testId} /> {label}
  </label>
)

function GateList({ gates, advisories, testId }: { gates: { id: string; ok: boolean; message: string; label: string }[]; advisories: { id: string; message: string; label: string }[]; testId: string }) {
  return (
    <div data-testid={testId}>
      <ul className="w3-gates" aria-label="Hard gates">
        {gates.map((g) => (
          <li key={g.id} data-gate={g.id} data-ok={g.ok} className={g.ok ? 'w3-pass' : 'w3-fail'}>
            <strong>{g.ok ? '✓ pass' : '✗ fails'}</strong> {g.label}: {g.message}
          </li>
        ))}
      </ul>
      {advisories.length > 0 && (
        <ul className="w3-gates" aria-label="Advisories">
          {advisories.map((a) => (
            <li key={a.id} data-advisory={a.id} className="w3-adv">
              <strong>! advisory</strong> {a.label}: {a.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type ListKey = 'technologies' | 'assumptions' | 'unknowns' | 'risks' | 'opportunities' | 'issues' | 'tpms'

export default function Week3LabTool() {
  const [rec, setRec] = useState<Week3Record>(() => normalizeRecord(loadJSON<unknown>(W3_KEY, null)))
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => {
    saveJSON(W3_KEY, rec)
  }, [rec])
  const edit = (f: (r: Week3Record) => Week3Record) => setRec((r) => ({ ...f(r), updatedAt: Date.now() }))
  const checks = useMemo(() => allChecks(rec), [rec])
  const trade = useMemo(() => assessTrade(rec), [rec])
  const state = recordState(rec)
  const min = minimumsOf(rec)
  const w2 = rec.week2

  const add = <K extends ListKey>(key: K, prefix: IdPrefix, make: (id: string) => Week3Record[K][number]) =>
    edit((r) => {
      const id = nextId(r, prefix)
      return { ...r, [key]: [...(r[key] as unknown[]), make(id)], issued: withIssued(r, prefix, id) }
    })
  const upd = <K extends ListKey>(key: K, id: string, patch: Partial<Week3Record[K][number]>) => edit((r) => ({ ...r, [key]: (r[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  const del = (key: ListKey, id: string) => edit((r) => ({ ...r, [key]: (r[key] as { id: string }[]).filter((x) => x.id !== id) }))
  const setTrade = (patch: Partial<Week3Record['trade']>) => edit((r) => ({ ...r, trade: { ...r.trade, ...patch } }))
  const addTrade = (key: 'alternatives' | 'criteria' | 'screens', prefix: IdPrefix, make: (id: string) => Alternative | Criterion | Screen) =>
    edit((r) => {
      const id = nextId(r, prefix)
      return { ...r, trade: { ...r.trade, [key]: [...(r.trade[key] as unknown[]), make(id)] }, issued: withIssued(r, prefix, id) }
    })
  const updTrade = <K extends 'alternatives' | 'criteria' | 'screens'>(key: K, id: string, patch: Partial<Week3Record['trade'][K][number]>) => edit((r) => ({ ...r, trade: { ...r.trade, [key]: (r.trade[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) } }))
  const delTrade = (key: 'alternatives' | 'criteria' | 'screens', id: string) => edit((r) => ({ ...r, trade: { ...r.trade, [key]: (r.trade[key] as { id: string }[]).filter((x) => x.id !== id) } }))
  const setScore = (alt: string, crit: string, v: string) => edit((r) => ({ ...r, trade: { ...r.trade, scores: { ...r.trade.scores, [alt]: { ...(r.trade.scores[alt] ?? {}), [crit]: v } } } }))

  async function onWeek2File(f: File | undefined) {
    if (!f) return
    const x = importWeek2File(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    edit((r) => withWeek2(r, x.snapshot))
    setMsg({ ok: true, text: `Imported the Week 2 record of ${x.snapshot.enterprise}: ${x.snapshot.requirements.length} requirements, ${x.snapshot.moes.length} MOEs, ${x.snapshot.unknowns.length} unknowns.` })
  }
  async function onWeek3File(f: File | undefined) {
    if (!f) return
    const x = importWeek3(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    setRec({ ...x, updatedAt: Date.now() })
    setMsg({ ok: true, text: `Imported the teammate’s Week 3 record (${x.technologies.length} technologies, ${x.risks.length} risks, ${x.tpms.length} TPMs).` })
  }
  const exportMd = () => {
    downloadText(`${fileStem(rec)}-record.md`, recordMarkdown(rec))
    setRec((r) => ({ ...r, exportedMdAt: Date.now() }))
  }
  const exportJson = () => {
    downloadText(`${fileStem(rec)}-model-inputs.json`, JSON.stringify(modelInputs(rec), null, 2), 'application/json')
    setRec((r) => ({ ...r, exportedJsonAt: Date.now() }))
  }

  const reqOptions = (w2?.requirements ?? []).map((q) => ({ value: q.id, label: `${q.id} ${q.name}` }))
  const riskOptions = rec.risks.map((k) => ({ value: k.id, label: `${k.id} ${k.name}` }))
  const assumptionOptions = rec.assumptions.map((a) => ({ value: a.id, label: `${a.id} ${a.name}` }))
  const comp = trade.computation

  return (
    <div className="w3-tool" data-testid="w3-tool">
      <div className="w3-head">
        <h1>Lab L3 tool: your Week 3 Team Record</h1>
        <span className={`w3-chip ${state === 'ready' ? 'ok' : 'warn'}`} data-testid="w3-state">{state === 'ready' ? '✓ ready: every part complete' : '○ not ready'}</span>
        <span className="w3-sp" />
        <div className="w3-btn-row">
          <button type="button" className="lf-btn small primary" onClick={exportMd} data-testid="w3-export-md">Export the record (.md)</button>
          <button type="button" className="lf-btn small" onClick={exportJson} data-testid="w3-export-json">Export the model inputs (.json)</button>
        </div>
      </div>
      <p className="w3-help">Your team’s own enterprise, never AeroLink. Each part is checked as you type, with the same scales and arithmetic the lecture uses; saved in this browser only, so export after every working session. A teammate can import the JSON file to continue the same record.</p>
      <Field label="Import a teammate’s Week 3 model-inputs file (.json): replaces the record in this browser">
        <input type="file" accept=".json,application/json" className="w3-file" data-testid="w3-import-week3" onChange={(e) => void onWeek3File(e.target.files?.[0])} />
      </Field>
      {msg && (
        <div className={`w3-note ${msg.ok ? 'ok' : 'warn'}`} role="status" data-testid="w3-message">
          {msg.ok ? '✓ ' : '✗ '}
          {msg.text}
        </div>
      )}

      {/* ---------------------------------------------------------------- 0: Week 2 import */}
      <Part id="w3-part-import" title="Start from your Week 2 Team Record" check={checks.import}>
        <p className="w3-help">The Week 3 record extends the Week 2 record as returned with feedback: its requirements, capabilities, scenarios, objectives, measures and TBD/TBR register are what the assessment, the risks, the TPMs and the trade study trace to.</p>
        <Field label="Week 2 model-inputs file (team-NN-week2-model-inputs.json)">
          <input type="file" accept=".json,application/json" className="w3-file" data-testid="w3-import-week2" onChange={(e) => void onWeek2File(e.target.files?.[0])} />
        </Field>
        {w2 && (
          <div data-testid="w3-week2-summary">
            <p className="m-0">
              Team <strong>{w2.team || '—'}</strong> · enterprise <strong>{w2.enterprise}</strong> · {w2.requirements.length} requirements · {w2.moes.length} MOEs · {w2.mops.length} MOPs · {w2.unknowns.length} unknowns
            </p>
            <ul className="w3-help m-0 pl-5" aria-label="Requirements">
              {w2.requirements.map((q) => (
                <li key={q.id}>
                  <span className="w3-id">{q.id}</span> {q.name || q.statement}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Check label="Three-person team: reduced minimums (pending faculty approval)" checked={rec.threePersonTeam} onChange={(v) => edit((r) => ({ ...r, threePersonTeam: v }))} />
      </Part>

      {/* ---------------------------------------------------------------- Part 12 */}
      <Part id="w3-part-readiness" n="Part 12" title="Technology readiness assessment" check={checks.readiness}>
        <p className="w3-help">At least {min.technologies} enabling technologies. A TRL is read against the scale wording; it rests on cited evidence or on a labeled assumption in the register (Part 13) with an owner and a validation action. A critical technology below TRL 6 needs a maturity risk.</p>
        {rec.technologies.map((t) => (
          <TechEditor key={t.id} t={t} rec={rec} assumptionOptions={assumptionOptions} riskOptions={riskOptions} onChange={(p) => upd('technologies', t.id, p)} onRemove={() => del('technologies', t.id)} />
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w3-add-tech" onClick={() => add('technologies', 'TECH', EMPTY_TECHNOLOGY)}>Add a technology</button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 13 */}
      <Part id="w3-part-register" n="Part 13" title="Risk and uncertainty register" check={checks.register}>
        <p className="w3-help">At least {min.risks} risks in condition–if–then form, including at least {min.securityRisks} security risk and {min.resilienceRisks} resilience risk; at least {min.opportunities} opportunity. Every Week 2 unknown stays in the register until it is closed. Something that has already happened is an issue: record it in the issue log, not as a risk.</p>
        <h3 className="m-0 text-base">Risks</h3>
        {rec.risks.map((k) => (
          <RiskEditor key={k.id} k={k} rec={rec} onChange={(p) => upd('risks', k.id, p)} onRemove={() => del('risks', k.id)} />
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w3-add-risk" onClick={() => add('risks', 'R', EMPTY_RISK)}>Add a risk</button>
        </div>
        <h3 className="m-0 text-base">Assumptions</h3>
        {rec.assumptions.map((a) => (
          <AssumptionRow key={a.id} a={a} onChange={(p) => upd('assumptions', a.id, p)} onRemove={() => del('assumptions', a.id)} />
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w3-add-assumption" onClick={() => add('assumptions', 'A', EMPTY_ASSUMPTION)}>Add an assumption</button>
        </div>
        <h3 className="m-0 text-base">Unknowns (TBD/TBR)</h3>
        {rec.unknowns.map((u) => (
          <UnknownRow key={u.id} u={u} onChange={(p) => upd('unknowns', u.id, p)} onRemove={() => del('unknowns', u.id)} />
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w3-add-unknown" onClick={() => add('unknowns', 'U', EMPTY_UNKNOWN)}>Add an unknown</button>
        </div>
        <h3 className="m-0 text-base">Opportunities</h3>
        {rec.opportunities.map((o) => (
          <SimpleRow key={o.id} x={o} what="Opportunity: a possible outcome better than expected" onChange={(p) => upd('opportunities', o.id, p)} onRemove={() => del('opportunities', o.id)} />
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w3-add-opportunity" onClick={() => add('opportunities', 'O', EMPTY_OPPORTUNITY)}>Add an opportunity</button>
        </div>
        <h3 className="m-0 text-base">Issue log (kept apart from the risks)</h3>
        {rec.issues.map((i) => (
          <SimpleRow key={i.id} x={i} what="Issue: what has happened or is certain to happen" onChange={(p) => upd('issues', i.id, p)} onRemove={() => del('issues', i.id)} />
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w3-add-issue" onClick={() => add('issues', 'I', EMPTY_ISSUE)}>Add an issue</button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 11 (TPMs) */}
      <Part id="w3-part-tpm" n="Part 11" title="Measures: technical performance measures" check={checks.tpm}>
        <p className="w3-help">At least {min.tpms} TPMs, each tracking a risky requirement and derived from an MOP. Worst case = the current best estimate moved by the contingency toward the threshold; margin = threshold minus worst case. Give a planned value at two or more future review points.</p>
        {rec.tpms.map((t) => (
          <TpmEditor key={t.id} t={t} rec={rec} reqOptions={reqOptions} riskOptions={riskOptions} onChange={(p) => upd('tpms', t.id, p)} onRemove={() => del('tpms', t.id)} />
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w3-add-tpm" onClick={() => add('tpms', 'TPM', EMPTY_TPM)}>Add a TPM</button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 14 */}
      <Part id="w3-part-trade" n="Part 14" title="Trade study and decision record" check={checks.trade}>
        <p className="w3-help">The decision approved at the Session 2 checkpoint ({CHECKPOINT_CRITERIA.join('; ')}). At least {min.alternatives} alternatives including the baseline and {min.criteria} criteria traced to MOEs. Value is linear from the walk-away point (0) to the stretch goal (1); swing points are normalized to weights that sum to one; the total is the weighted sum. Security can be a must-meet screen; an alternative that fails a screen is not scored.</p>
        <Area label="Decision statement (“How should [enterprise] [achieve objective X] given [constraint]?”)" value={rec.trade.decision} onChange={(v) => setTrade({ decision: v })} testId="w3-decision" />
        <Text label="Traces to (REQ or MGO IDs from the Week 2 record)" mono value={rec.trade.trace} onChange={(v) => setTrade({ trace: v })} testId="w3-trace" />
        <fieldset className="w3-item">
          <legend>Alternatives</legend>
          {rec.trade.alternatives.map((a) => (
            <div className="w3-row" key={a.id} data-testid={`w3-${a.id}`}>
              <span className="w3-id">{a.id}</span>
              <Text label="Name" value={a.name} onChange={(v) => updTrade('alternatives', a.id, { name: v })} testId={`w3-${a.id}-name`} />
              <Text label="Description" value={a.description} onChange={(v) => updTrade('alternatives', a.id, { description: v })} testId={`w3-${a.id}-description`} />
              <Check label="Baseline (status quo)" checked={a.baseline} onChange={(v) => updTrade('alternatives', a.id, { baseline: v })} testId={`w3-${a.id}-baseline`} />
              <Remove label={a.id} onClick={() => delTrade('alternatives', a.id)} />
            </div>
          ))}
          <div>
            <button type="button" className="lf-btn small" data-testid="w3-add-alt" onClick={() => addTrade('alternatives', 'ALT', (id) => EMPTY_ALTERNATIVE(id, rec.trade.alternatives.length === 0))}>Add an alternative</button>
          </div>
        </fieldset>
        <fieldset className="w3-item">
          <legend>Criteria, value functions and swing weights</legend>
          {rec.trade.criteria.map((c, i) => (
            <div className="w3-sub" key={c.id} data-testid={`w3-${c.id}`}>
              <div className="w3-row">
                <span className="w3-id">{c.id}</span>
                <Text label="Criterion" value={c.name} onChange={(v) => updTrade('criteria', c.id, { name: v })} testId={`w3-${c.id}-name`} />
                <Select label="Traced to (MOE or MGO)" value={c.moe} onChange={(v) => updTrade('criteria', c.id, { moe: v })} options={[...(w2?.moes ?? []).map((m) => ({ value: m.id, label: `${m.id} ${m.name}` })), ...(w2?.objectives ?? []).map((o) => ({ value: o.id, label: `${o.id} ${o.statement.slice(0, 50)}` }))]} testId={`w3-${c.id}-moe`} />
                <Text label="Unit" narrow value={c.unit} onChange={(v) => updTrade('criteria', c.id, { unit: v })} />
                <Remove label={c.id} onClick={() => delTrade('criteria', c.id)} />
              </div>
              <div className="w3-grid">
                <Text label="Walk-away point (value 0)" value={c.walkAway} onChange={(v) => updTrade('criteria', c.id, { walkAway: v })} testId={`w3-${c.id}-walkaway`} />
                <Text label="Stretch goal (value 1)" value={c.stretch} onChange={(v) => updTrade('criteria', c.id, { stretch: v })} testId={`w3-${c.id}-stretch`} />
                <Text label={`Swing points (weight ${(comp.weights[i] ?? 0).toFixed(3)})`} value={c.swingPoints} onChange={(v) => updTrade('criteria', c.id, { swingPoints: v })} testId={`w3-${c.id}-points`} />
                <Text label="Swing rationale: the range swung and why it is worth that much" value={c.rationale} onChange={(v) => updTrade('criteria', c.id, { rationale: v })} testId={`w3-${c.id}-rationale`} />
              </div>
            </div>
          ))}
          <div>
            <button type="button" className="lf-btn small" data-testid="w3-add-crit" onClick={() => addTrade('criteria', 'CRIT', EMPTY_CRITERION)}>Add a criterion</button>
          </div>
        </fieldset>
        <fieldset className="w3-item">
          <legend>Must-meet screens (optional; for example a security screen)</legend>
          {rec.trade.screens.map((s) => (
            <div className="w3-sub" key={s.id}>
              <div className="w3-row">
                <span className="w3-id">{s.id}</span>
                <Text label="Screen" value={s.name} onChange={(v) => updTrade('screens', s.id, { name: v })} />
                <Text label="Test every alternative must pass" value={s.test} onChange={(v) => updTrade('screens', s.id, { test: v })} />
                <Remove label={s.id} onClick={() => delTrade('screens', s.id)} />
              </div>
              <div className="w3-row">
                {rec.trade.alternatives.map((a) => (
                  <Select key={a.id} label={`${a.id} result`} value={s.results[a.id] ?? ''} onChange={(v) => updTrade('screens', s.id, { results: { ...s.results, [a.id]: v as '' | 'pass' | 'fail' } })} options={[{ value: 'pass', label: 'Passes' }, { value: 'fail', label: 'Fails' }]} />
                ))}
              </div>
            </div>
          ))}
          <div>
            <button type="button" className="lf-btn small" data-testid="w3-add-screen" onClick={() => addTrade('screens', 'SCREEN', EMPTY_SCREEN)}>Add a screen</button>
          </div>
        </fieldset>
        {rec.trade.alternatives.length > 0 && rec.trade.criteria.length > 0 && (
          <div className="w3-table-wrap" data-testid="w3-trade-results">
            <table className="w3-table">
              <caption className="w3-legend text-left">Scores (type each alternative’s score in the criterion’s unit) with the computed value in brackets, and the weighted total</caption>
              <thead>
                <tr>
                  <th scope="col">Alternative</th>
                  {rec.trade.criteria.map((c, i) => (
                    <th scope="col" key={c.id}>{c.id} (w {(comp.weights[i] ?? 0).toFixed(3)})</th>
                  ))}
                  <th scope="col">Total</th>
                  <th scope="col">Rank</th>
                </tr>
              </thead>
              <tbody>
                {rec.trade.alternatives.map((a) => (
                  <tr key={a.id}>
                    <th scope="row">{a.id}</th>
                    {rec.trade.criteria.map((c, i) => (
                      <td key={c.id}>
                        <Field label={`Score ${a.id}, ${c.id}`}>
                          <input className="w3-input narrow" value={rec.trade.scores[a.id]?.[c.id] ?? ''} onChange={(e) => setScore(a.id, c.id, e.target.value)} data-testid={`w3-score-${a.id}-${c.id}`} />
                        </Field>
                        {comp.values[a.id] && <span className="w3-help"> ({comp.values[a.id][i].toFixed(3)})</span>}
                      </td>
                    ))}
                    <td data-testid={`w3-total-${a.id}`}>{comp.screenedOut.includes(a.id) ? 'screened out' : comp.totals[a.id] !== undefined ? comp.totals[a.id].toFixed(3) : ''}</td>
                    <td>{comp.ranking.indexOf(a.id) >= 0 ? comp.ranking.indexOf(a.id) + 1 : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="w3-table-wrap" data-testid="w3-sensitivity">
          {comp.sensitivity.length ? (
            <table className="w3-table">
              <caption className="w3-legend text-left">One weight at a time, the others rescaled in proportion: where the top rank changes</caption>
              <thead>
                <tr>
                  <th scope="col">Criterion</th>
                  <th scope="col">Base weight</th>
                  <th scope="col">Raising it</th>
                  <th scope="col">Lowering it</th>
                </tr>
              </thead>
              <tbody>
                {comp.sensitivity.map((x) => (
                  <tr key={x.criterion}>
                    <th scope="row">{x.criterion}</th>
                    <td>{x.base.toFixed(3)}</td>
                    <td>{x.up ? `above ${x.up.w.toFixed(3)}: ${x.up.to} ranks first` : 'no change'}</td>
                    <td>{x.down ? `below ${x.down.w.toFixed(3)}: ${x.down.to} ranks first` : 'no change'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="w3-help m-0">The sensitivity table appears when every criterion has anchors and swing points and every alternative is scored.</p>
          )}
        </div>
        <Area label="Your reading of the sensitivity: the reversal point of the most heavily weighted criterion, and what it means for the decision" value={rec.trade.sensitivityNote} onChange={(v) => setTrade({ sensitivityNote: v })} testId="w3-sensitivity-note" />
        <div className="w3-grid">
          <Select label="Recommended alternative" value={rec.trade.recommended} onChange={(v) => setTrade({ recommended: v })} options={rec.trade.alternatives.map((a) => ({ value: a.id, label: `${a.id} ${a.name}` }))} testId="w3-recommended" />
          <Area label="Conditions under which it holds (one per line)" value={rec.trade.conditions} onChange={(v) => setTrade({ conditions: v })} testId="w3-conditions" />
          <Area label="Residual risk" value={rec.trade.residualRisk} onChange={(v) => setTrade({ residualRisk: v })} testId="w3-residual" />
          <Area label="What would change the decision (one per line)" value={rec.trade.wouldChangeIf} onChange={(v) => setTrade({ wouldChangeIf: v })} testId="w3-would-change" />
          <Area label="Derived requirements the decision creates (optional, one per line)" value={rec.trade.derived} onChange={(v) => setTrade({ derived: v })} />
        </div>
        <GateList testId="w3-gates-trade" gates={trade.gates.map((g) => ({ ...g, label: TRADE_GATE_SHORT[g.id] }))} advisories={trade.advisories.map((x) => ({ ...x, label: TRADE_ADVISORY_SHORT[x.id] }))} />
      </Part>

      {/* ---------------------------------------------------------------- AI statement */}
      <Part id="w3-part-ai" n="Part 6" title="AI usage statement (updated)" check={checks.ai}>
        <Area label="Tool, purpose, prompts, what you accepted or rejected and why; or say that no AI tool was used" rows={3} value={rec.aiStatement} onChange={(v) => edit((r) => ({ ...r, aiStatement: v }))} testId="w3-ai" />
      </Part>
    </div>
  )
}

function TechEditor({ t, rec, assumptionOptions, riskOptions, onChange, onRemove }: { t: Technology; rec: Week3Record; assumptionOptions: { value: string; label: string }[]; riskOptions: { value: string; label: string }[]; onChange: (p: Partial<Technology>) => void; onRemove: () => void }) {
  const a = assessTechnology(t, rec)
  return (
    <fieldset className="w3-item" data-testid={`w3-${t.id}`}>
      <legend>
        {t.id} · technology · {a.counts ? '✓ counts' : '✗ does not count yet'}
      </legend>
      <div className="w3-row">
        <Text label="Technology" value={t.name} onChange={(v) => onChange({ name: v })} testId={`w3-${t.id}-name`} />
        <Field label="TRL (SEBoK scale wording)">
          <select className="w3-select" value={t.trl || ''} onChange={(e) => onChange({ trl: Number(e.target.value) || 0 })} data-testid={`w3-${t.id}-trl`}>
            <option value="">Choose…</option>
            {TRL_SCALE.map((x) => (
              <option key={x.level} value={x.level}>{`TRL ${x.level}: ${x.text}`}</option>
            ))}
          </select>
        </Field>
        <Remove label={t.id} onClick={onRemove} />
      </div>
      <Area label="What it does for the enterprise" value={t.does} onChange={(v) => onChange({ does: v })} testId={`w3-${t.id}-does`} />
      <div className="w3-grid">
        <Text label="Benefits" value={t.benefits} onChange={(v) => onChange({ benefits: v })} />
        <Text label="Limitations" value={t.limitations} onChange={(v) => onChange({ limitations: v })} />
        <Select label="Basis of the TRL" value={t.basisKind} onChange={(v) => onChange({ basisKind: v as Technology['basisKind'] })} options={[{ value: 'evidence', label: 'Cited evidence' }, { value: 'assumption', label: 'Labeled assumption' }]} testId={`w3-${t.id}-basis`} />
        {t.basisKind === 'evidence' && <Text label="Evidence: report, test or demonstration, and where to find it" value={t.evidence} onChange={(v) => onChange({ evidence: v })} testId={`w3-${t.id}-evidence`} />}
        {t.basisKind === 'assumption' && <Select label="Assumption in the register (A ID)" value={t.assumption} onChange={(v) => onChange({ assumption: v })} options={assumptionOptions} testId={`w3-${t.id}-assumption`} />}
        <Text label="Affects (REQ or CAP IDs)" mono value={t.affects} onChange={(v) => onChange({ affects: v })} testId={`w3-${t.id}-affects`} />
        <Select label="Maturity risk (R ID)" value={t.maturityRisk} onChange={(v) => onChange({ maturityRisk: v })} options={riskOptions} testId={`w3-${t.id}-risk`} />
      </div>
      <div className="w3-row">
        <Check label="Critical: a requirement or capability fails without it" checked={t.critical} onChange={(v) => onChange({ critical: v })} testId={`w3-${t.id}-critical`} />
        {t.critical && <Text label="Why it is critical" value={t.criticalWhy} onChange={(v) => onChange({ criticalWhy: v })} />}
        <Check label="AI-suggested, reviewed by the team" checked={t.ai} onChange={(v) => onChange({ ai: v })} />
      </div>
      {t.trl > 0 && <p className="w3-help m-0">TRL {t.trl}: {trlWording(t.trl)}</p>}
      <GateList testId={`w3-gates-${t.id}`} gates={a.gates.map((g) => ({ ...g, label: TECH_GATE_SHORT[g.id] }))} advisories={a.advisories.map((x) => ({ ...x, label: TECH_ADVISORY_SHORT[x.id] }))} />
    </fieldset>
  )
}

function RiskEditor({ k, rec, onChange, onRemove }: { k: Risk; rec: Week3Record; onChange: (p: Partial<Risk>) => void; onRemove: () => void }) {
  const a = assessRisk(k, rec)
  const level = riskLevel(k)
  return (
    <fieldset className="w3-item" data-testid={`w3-${k.id}`}>
      <legend>
        {k.id} · risk · {a.counts ? '✓ counts' : '✗ does not count yet'}
        {level ? ` · ${level}` : ''}
      </legend>
      <div className="w3-row">
        <Text label="Short name" value={k.name} onChange={(v) => onChange({ name: v })} testId={`w3-${k.id}-name`} />
        <Select label="Category" value={k.category} onChange={(v) => onChange({ category: v as Risk['category'] })} options={RISK_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))} testId={`w3-${k.id}-category`} />
        <Remove label={k.id} onClick={onRemove} />
      </div>
      <div className="w3-grid">
        <Area label="Condition: what is known today (the root cause)" value={k.condition} onChange={(v) => onChange({ condition: v })} testId={`w3-${k.id}-condition`} />
        <Area label="If: the uncertain future event" value={k.ifEvent} onChange={(v) => onChange({ ifEvent: v })} testId={`w3-${k.id}-if`} />
        <Area label="Then: the consequences, and what is harmed" value={k.then} onChange={(v) => onChange({ then: v })} testId={`w3-${k.id}-then`} />
      </div>
      {k.condition.trim() && k.ifEvent.trim() && k.then.trim() && <p className="w3-help m-0" data-testid={`w3-${k.id}-statement`}>{riskStatement(k)}</p>}
      <div className="w3-grid">
        <Field label="Likelihood (1–5)">
          <select className="w3-select" value={k.likelihood || ''} onChange={(e) => onChange({ likelihood: Number(e.target.value) || 0 })} data-testid={`w3-${k.id}-l`}>
            <option value="">Choose…</option>
            {LIKELIHOOD.map((x) => (
              <option key={x.level} value={x.level}>{`${x.level} ${x.label} (${x.band})`}</option>
            ))}
          </select>
        </Field>
        <Text label="Why that likelihood" value={k.likelihoodWhy} onChange={(v) => onChange({ likelihoodWhy: v })} testId={`w3-${k.id}-lwhy`} />
        <Field label="Consequence (1–5)">
          <select className="w3-select" value={k.consequence || ''} onChange={(e) => onChange({ consequence: Number(e.target.value) || 0 })} data-testid={`w3-${k.id}-c`}>
            <option value="">Choose…</option>
            {CONSEQUENCE.map((x) => (
              <option key={x.level} value={x.level}>{`${x.level} ${x.label}: ${x.anchor}`}</option>
            ))}
          </select>
        </Field>
        <Text label="Why that consequence" value={k.consequenceWhy} onChange={(v) => onChange({ consequenceWhy: v })} testId={`w3-${k.id}-cwhy`} />
      </div>
      <div className="w3-grid">
        <Select label="Handling" value={k.handling} onChange={(v) => onChange({ handling: v as Risk['handling'] })} options={HANDLING.map((h) => ({ value: h.id, label: `${h.label}: ${h.meaning}` }))} testId={`w3-${k.id}-handling`} />
        <Text label="Owner" value={k.owner} onChange={(v) => onChange({ owner: v })} testId={`w3-${k.id}-owner`} />
        <Text label="Treatment (not needed when accepted or watched)" value={k.treatment} onChange={(v) => onChange({ treatment: v })} testId={`w3-${k.id}-treatment`} />
        <Text label="Trigger or watch item" value={k.trigger} onChange={(v) => onChange({ trigger: v })} testId={`w3-${k.id}-trigger`} />
        <Text label="Affects (REQ, CAP, SCN, TECH or TPM IDs)" mono value={k.affects} onChange={(v) => onChange({ affects: v })} testId={`w3-${k.id}-affects`} />
      </div>
      <Check label="AI-suggested, reviewed by the team" checked={k.ai} onChange={(v) => onChange({ ai: v })} />
      <GateList testId={`w3-gates-${k.id}`} gates={a.gates.map((g) => ({ ...g, label: RISK_GATE_SHORT[g.id] }))} advisories={a.advisories.map((x) => ({ ...x, label: RISK_ADVISORY_SHORT[x.id] }))} />
    </fieldset>
  )
}

function TpmEditor({ t, rec, reqOptions, riskOptions, onChange, onRemove }: { t: Tpm; rec: Week3Record; reqOptions: { value: string; label: string }[]; riskOptions: { value: string; label: string }[]; onChange: (p: Partial<Tpm>) => void; onRemove: () => void }) {
  const a = assessTpm(t, rec)
  const n = tpmNumbers(t)
  const pts = tpmProfile(t)
  const setRow = (i: number, p: Partial<Tpm['profile'][number]>) => onChange({ profile: t.profile.map((x, j) => (j === i ? { ...x, ...p } : x)) })
  return (
    <fieldset className="w3-item" data-testid={`w3-${t.id}`}>
      <legend>
        {t.id} · TPM · {a.counts ? '✓ counts' : '✗ does not count yet'}
      </legend>
      <div className="w3-row">
        <Text label="Name" value={t.name} onChange={(v) => onChange({ name: v })} testId={`w3-${t.id}-name`} />
        <Select label="Tracks (requirement)" value={t.measures} onChange={(v) => onChange({ measures: v })} options={reqOptions} testId={`w3-${t.id}-measures`} />
        <Select label="Derives from (MOP)" value={t.derivesFrom} onChange={(v) => onChange({ derivesFrom: v })} options={(rec.week2?.mops ?? []).map((m) => ({ value: m.id, label: `${m.id} ${m.name}` }))} testId={`w3-${t.id}-mop`} />
        <Remove label={t.id} onClick={onRemove} />
      </div>
      <div className="w3-grid">
        <Text label="Unit" narrow value={t.unit} onChange={(v) => onChange({ unit: v })} testId={`w3-${t.id}-unit`} />
        <Select label="Sense" value={t.sense} onChange={(v) => onChange({ sense: v as Tpm['sense'] })} options={[{ value: 'lower-is-better', label: 'Lower is better' }, { value: 'higher-is-better', label: 'Higher is better' }]} testId={`w3-${t.id}-sense`} />
        <Text label="Threshold" narrow value={t.threshold} onChange={(v) => onChange({ threshold: v })} testId={`w3-${t.id}-threshold`} />
        <Text label="Objective" narrow value={t.objective} onChange={(v) => onChange({ objective: v })} testId={`w3-${t.id}-objective`} />
        <Text label="Current best estimate" narrow value={t.cbe} onChange={(v) => onChange({ cbe: v })} testId={`w3-${t.id}-cbe`} />
        <Text label="Contingency" narrow value={t.contingency} onChange={(v) => onChange({ contingency: v })} testId={`w3-${t.id}-contingency`} />
        <Text label="Basis of the estimate" value={t.basis} onChange={(v) => onChange({ basis: v })} testId={`w3-${t.id}-basis`} />
        <Select label="Related risk (R ID)" value={t.relatedRisk} onChange={(v) => onChange({ relatedRisk: v })} options={riskOptions} />
      </div>
      <p className="w3-help m-0" data-testid={`w3-${t.id}-margin`}>
        {n ? `Worst case ${n.wce} ${t.unit.trim()}; margin ${n.margin} ${t.unit.trim()}${n.margin < 0 ? ' (outside the threshold)' : ''}.` : 'Worst case and margin appear when the numbers and the sense are entered.'}
      </p>
      <fieldset className="w3-item">
        <legend>Planned profile</legend>
        {t.profile.map((p, i) => (
          <div className="w3-row" key={i}>
            <Text label={`Point ${i + 1}: review`} value={p.label} onChange={(v) => setRow(i, { label: v })} />
            <Text label={`Point ${i + 1}: month`} narrow value={p.month} onChange={(v) => setRow(i, { month: v })} testId={`w3-${t.id}-p${i}-month`} />
            <Text label={`Point ${i + 1}: planned estimate`} narrow value={p.cbe} onChange={(v) => setRow(i, { cbe: v })} testId={`w3-${t.id}-p${i}-cbe`} />
            <Text label={`Point ${i + 1}: contingency`} narrow value={p.contingency} onChange={(v) => setRow(i, { contingency: v })} testId={`w3-${t.id}-p${i}-contingency`} />
            <span className="w3-help">{pts.find((x) => x.label === p.label.trim() && String(x.month) === p.month.trim()) ? `margin ${pts.find((x) => x.label === p.label.trim() && String(x.month) === p.month.trim())!.margin}` : ''}</span>
            <Remove label={`point ${i + 1}`} onClick={() => onChange({ profile: t.profile.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid={`w3-${t.id}-add-point`} onClick={() => onChange({ profile: [...t.profile, { ...EMPTY_PROFILE_ROW }] })}>Add a review point</button>
        </div>
      </fieldset>
      <GateList testId={`w3-gates-${t.id}`} gates={a.gates.map((g) => ({ ...g, label: TPM_GATE_SHORT[g.id] }))} advisories={a.advisories.map((x) => ({ ...x, label: TPM_ADVISORY_SHORT[x.id] }))} />
    </fieldset>
  )
}

function AssumptionRow({ a, onChange, onRemove }: { a: Assumption; onChange: (p: Partial<Assumption>) => void; onRemove: () => void }) {
  return (
    <div className="w3-sub" data-testid={`w3-${a.id}`}>
      <div className="w3-row">
        <span className="w3-id">{a.id}{a.fromWeek2 ? ' (Week 2)' : ''}</span>
        <Text label="Assumption" value={a.name} onChange={(v) => onChange({ name: v })} />
        <Text label="Owner" narrow value={a.owner} onChange={(v) => onChange({ owner: v })} />
        <Text label="Validated by (action and when)" value={a.validation} onChange={(v) => onChange({ validation: v })} />
        <Remove label={a.id} onClick={onRemove} />
      </div>
    </div>
  )
}
function UnknownRow({ u, onChange, onRemove }: { u: Unknown; onChange: (p: Partial<Unknown>) => void; onRemove: () => void }) {
  return (
    <div className="w3-sub" data-testid={`w3-${u.id}`}>
      <div className="w3-row">
        <span className="w3-id">{u.id}{u.fromWeek2 ? ' (Week 2)' : ''}</span>
        <Text label="Unknown" value={u.name} onChange={(v) => onChange({ name: v })} />
        <Text label="TBD/TBR token" narrow mono value={u.tbx} onChange={(v) => onChange({ tbx: v })} />
        <Text label="Owner" narrow value={u.owner} onChange={(v) => onChange({ owner: v })} />
        <Text label="Closed by (how and when)" value={u.closeBy} onChange={(v) => onChange({ closeBy: v })} />
        <Text label="Affects (IDs)" mono value={u.affects} onChange={(v) => onChange({ affects: v })} />
        <Remove label={u.id} onClick={onRemove} />
      </div>
    </div>
  )
}
function SimpleRow<T extends Opportunity | Issue>({ x, what, onChange, onRemove }: { x: T; what: string; onChange: (p: Partial<T>) => void; onRemove: () => void }) {
  return (
    <div className="w3-sub" data-testid={`w3-${x.id}`}>
      <div className="w3-row">
        <span className="w3-id">{x.id}</span>
        <Text label="Name" value={x.name} onChange={(v) => onChange({ name: v } as Partial<T>)} />
        <Text label={what} value={x.text} onChange={(v) => onChange({ text: v } as Partial<T>)} />
        <Text label="Owner" narrow value={x.owner} onChange={(v) => onChange({ owner: v } as Partial<T>)} />
        <Text label="Action" value={x.action} onChange={(v) => onChange({ action: v } as Partial<T>)} />
        <Remove label={x.id} onClick={onRemove} />
      </div>
    </div>
  )
}
