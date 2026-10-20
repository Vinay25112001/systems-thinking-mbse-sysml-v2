// Week 2 lab tool (Lab L2): the team's own Week 2 Team Record, extending its Week 1 record. Rendered by the Week 2 page
// shell at #/week/2/lab/tool. Every check lives in record.ts (pure, tested both ways); this view only edits the record,
// shows each Part's status with "Still needed" issues, the per-requirement hard gates (pass or fails, with a glyph and a
// word, never color alone) and the advisories, labeled advisory. Saved in this browser (key w2.record) and normalized on
// load; exported as Markdown and JSON; a teammate's JSON export can be imported.
import { useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import { loadJSON, saveJSON } from '../../lib/storage'
import { downloadText } from '../download'
import { AUDIT_DISPOSITIONS, RECORD_WHY_NOT_FORMS, REQ_ADVISORIES, REQ_HARD_GATES, REQ_TYPES, SCENARIO_FIELDS, SCENARIO_KINDS, VER_METHODS } from '../../content/lectures/week02/labBrief'
import { teamArtefact } from '../week1/team'
import {
  ADVISORY_SHORT, EMPTY_CAPABILITY, EMPTY_MEASURE, EMPTY_REQUIREMENT, EMPTY_SCENARIO, EMPTY_UNCERTAINTY, GATE_SHORT, SCENARIO_GATES, W2_KEY,
  allChecks, allNeeds, assessRequirement, assessScenario, auditOf, coverageOf, fileStem, importWeek1, importWeek2, minimumsOf, modelInputs, nextAlternateId, nextId, nextTbx,
  normalizeRecord, recordMarkdown, recordState, requirementCount, snapshotOf, typeLabel, withIssued, withWeek1,
  type Capability, type Discovery, type IdPrefix, type Measure, type PartCheck, type Requirement, type Scenario, type Uncertainty, type Week2Record,
} from './record'
import './week2tool.css'

const readFile = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result ?? ''))
    fr.onerror = () => reject(fr.error)
    fr.readAsText(f)
  })

function Part({ id, n, title, check, children }: { id: string; n?: string; title: string; check: PartCheck; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} className="w2-part" data-testid={id}>
      <div className="w2-ph">
        <h2 id={`${id}-h`}>{n ? `${n} · ${title}` : title}</h2>
        <span className="w2-sp" />
        <span className={`w2-chip ${check.ok ? 'ok' : 'warn'}`}>{check.ok ? '✓ complete' : '○ incomplete'}</span>
      </div>
      <div className="w2-body">
        {children}
        <div className={`w2-note ${check.ok ? 'ok' : 'warn'}`} role="status" data-testid={`${id}-check`}>
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
    <label className="w2-field">
      <span>{label}</span>
      {children}
    </label>
  )
}
const Text = ({ label, value, onChange, mono, narrow, testId }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; narrow?: boolean; testId?: string }) => (
  <Field label={label}>
    <input className={`w2-input${mono ? ' mono' : ''}${narrow ? ' narrow' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
const Area = ({ label, value, onChange, rows = 2, testId }: { label: string; value: string; onChange: (v: string) => void; rows?: number; testId?: string }) => (
  <Field label={label}>
    <textarea className="w2-textarea" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
const NumberIn = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <Field label={label}>
    <input className="w2-input narrow" type="number" min={0} value={value || ''} onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
  </Field>
)
const Remove = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" className="lf-btn small" onClick={onClick}>
    Remove {label}
  </button>
)

function GateList({ gates, advisories, testId }: { gates: { id: string; ok: boolean; message: string; label: string }[]; advisories: { id: string; message: string; label: string }[]; testId: string }) {
  return (
    <div data-testid={testId}>
      <ul className="w2-gates" aria-label="Hard gates">
        {gates.map((g) => (
          <li key={g.id} data-gate={g.id} data-ok={g.ok} className={g.ok ? 'w2-pass' : 'w2-fail'}>
            <strong>{g.ok ? '✓ pass' : '✗ fails'}</strong> {g.label}: {g.message}
          </li>
        ))}
      </ul>
      {advisories.length > 0 && (
        <ul className="w2-gates" aria-label="Advisories">
          {advisories.map((a) => (
            <li key={a.id} data-advisory={a.id} className="w2-adv">
              <strong>! advisory</strong> {a.label}: {a.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Week2LabTool() {
  const uid = useId()
  const [rec, setRec] = useState<Week2Record>(() => normalizeRecord(loadJSON<unknown>(W2_KEY, null)))
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => {
    saveJSON(W2_KEY, rec)
  }, [rec])
  const edit = (f: (r: Week2Record) => Week2Record) => setRec((r) => ({ ...f(r), updatedAt: Date.now() }))
  const checks = useMemo(() => allChecks(rec), [rec])
  const state = recordState(rec)
  const min = minimumsOf(rec)
  const needs = allNeeds(rec)

  const add = <K extends 'scenarios' | 'capabilities' | 'requirements' | 'moes' | 'mops' | 'uncertainties'>(key: K, prefix: IdPrefix, make: (id: string) => Week2Record[K][number]) =>
    edit((r) => {
      const id = nextId(r, prefix)
      return { ...r, [key]: [...(r[key] as unknown[]), make(id)], issued: withIssued(r, prefix, id) }
    })
  const upd = <K extends 'scenarios' | 'capabilities' | 'requirements' | 'moes' | 'mops' | 'uncertainties' | 'discoveries'>(key: K, id: string, patch: Partial<Week2Record[K][number]>) =>
    edit((r) => ({ ...r, [key]: (r[key] as { id: string }[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  const del = (key: 'scenarios' | 'capabilities' | 'requirements' | 'moes' | 'mops' | 'uncertainties' | 'discoveries', id: string) => edit((r) => ({ ...r, [key]: (r[key] as { id: string }[]).filter((x) => x.id !== id) }))

  async function onWeek1File(f: File | undefined) {
    if (!f) return
    const x = importWeek1(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    edit((r) => withWeek1(r, x.snapshot))
    setMsg({ ok: true, text: `Imported the Week 1 record of ${x.snapshot.enterprise}: ${x.snapshot.needs.length} needs.` })
  }
  function loadSavedWeek1() {
    const t = teamArtefact(loadJSON<Record<string, unknown>>('wb-artefacts', {}))
    if (!t.proposal.name.trim() || !t.needs.length) return setMsg({ ok: false, text: 'No Week 1 record with an enterprise and needs is saved in this browser. Import the Week 1 model-inputs file instead.' })
    if (/aero\s*-?\s*link/i.test([t.proposal.name, t.proposal.soi].join(' '))) return setMsg({ ok: false, text: 'The Week 1 record saved in this browser names AeroLink, the instructor’s worked example. Import your team’s own record.' })
    const snap = snapshotOf(t, 3)
    edit((r) => withWeek1(r, snap))
    setMsg({ ok: true, text: `Loaded the Week 1 record saved in this browser: ${snap.enterprise}, ${snap.needs.length} needs.` })
  }
  async function onWeek2File(f: File | undefined) {
    if (!f) return
    const x = importWeek2(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    setRec({ ...x, updatedAt: Date.now() })
    setMsg({ ok: true, text: `Imported the teammate’s Week 2 record (${x.requirements.length} requirements, ${x.scenarios.length} scenarios).` })
  }
  const exportMd = () => {
    downloadText(`${fileStem(rec)}-record.md`, recordMarkdown(rec))
    setRec((r) => ({ ...r, exportedMdAt: Date.now() }))
  }
  const exportJson = () => {
    downloadText(`${fileStem(rec)}-model-inputs.json`, JSON.stringify(modelInputs(rec), null, 2), 'application/json')
    setRec((r) => ({ ...r, exportedJsonAt: Date.now() }))
  }

  const count = requirementCount(rec)
  const audit = auditOf(rec)
  const kindHelp = SCENARIO_KINDS.map((k) => `${k.label}: ${k.meaning}`).join('. ')
  const fieldHelp = (id: string) => SCENARIO_FIELDS.find((f) => f.id === id)?.help ?? ''

  return (
    <div className="w2-tool" data-testid="w2-tool">
      <div className="w2-head">
        <h1>Lab L2 tool: your Week 2 Team Record</h1>
        <span className={`w2-chip ${state === 'ready' ? 'ok' : 'warn'}`} data-testid="w2-state">{state === 'ready' ? '✓ ready: every part complete' : '○ not ready'}</span>
        <span className="w2-sp" />
        <div className="w2-btn-row">
          <button type="button" className="lf-btn small primary" onClick={exportMd} data-testid="w2-export-md">Export the record (.md)</button>
          <button type="button" className="lf-btn small" onClick={exportJson} data-testid="w2-export-json">Export the model inputs (.json)</button>
        </div>
      </div>
      <p className="w2-help">Your team’s own enterprise, never AeroLink. Each part is checked as you type; saved in this browser only, so export after every working session. A teammate can import the JSON file to continue the same record.</p>
      <Field label="Import a teammate’s Week 2 model-inputs file (.json): replaces the record in this browser">
        <input type="file" accept=".json,application/json" className="w2-file" data-testid="w2-import-week2" onChange={(e) => void onWeek2File(e.target.files?.[0])} />
      </Field>
      {msg && (
        <div className={`w2-note ${msg.ok ? 'ok' : 'warn'}`} role="status" data-testid="w2-message">
          {msg.ok ? '✓ ' : '✗ '}
          {msg.text}
        </div>
      )}

      {/* ---------------------------------------------------------------- 0: Week 1 import */}
      <Part id="w2-part-import" title="Start from your Week 1 Team Record" check={checks.import}>
        <p className="w2-help">The Week 2 record extends the Week 1 record as returned with feedback: its enterprise, system of interest and needs are the parents of everything you add this week.</p>
        <div className="w2-row">
          <Field label="Week 1 model-inputs file (team-NN-week1-model-inputs.json)">
            <input type="file" accept=".json,application/json" className="w2-file" data-testid="w2-import-week1" onChange={(e) => void onWeek1File(e.target.files?.[0])} />
          </Field>
          <button type="button" className="lf-btn small" onClick={loadSavedWeek1}>Use the Week 1 record saved in this browser</button>
        </div>
        {rec.week1 && (
          <div data-testid="w2-week1-summary">
            <p className="m-0">
              Team <strong>{rec.week1.team || '—'}</strong> · enterprise <strong>{rec.week1.enterprise}</strong> · {needs.length} needs ({rec.week1.needs.length} from Week 1{rec.needsAdded.length ? `, ${rec.needsAdded.length} added this week` : ''})
            </p>
            <ul className="w2-help m-0 pl-5" aria-label="Needs">
              {needs.map((n) => (
                <li key={n.id}>
                  <span className="w2-id">{n.id}</span> {n.name || n.statement}
                </li>
              ))}
            </ul>
          </div>
        )}
        <label className="w2-check">
          <input type="checkbox" checked={rec.threePersonTeam} onChange={(e) => edit((r) => ({ ...r, threePersonTeam: e.target.checked }))} />
          Three-person team: reduced minimums (pending faculty approval)
        </label>
      </Part>

      {/* ---------------------------------------------------------------- Part 7 */}
      <Part id="w2-part-conops" n="Part 7" title="ConOps narrative" check={checks.conops}>
        <div className="w2-grid">
          <Text label="Scenario system of interest: short name" value={rec.conops.soiName} onChange={(v) => edit((r) => ({ ...r, conops: { ...r.conops, soiName: v } }))} />
        </div>
        <Area label="Scenario system of interest, in a sentence: what is inside it (everyone outside it is an actor)" value={rec.conops.soi} onChange={(v) => edit((r) => ({ ...r, conops: { ...r.conops, soi: v } }))} />
        <div className="w2-grid">
          <Area label="Existing situation the users want to change" value={rec.conops.existing} onChange={(v) => edit((r) => ({ ...r, conops: { ...r.conops, existing: v } }))} />
          <Area label="Justification for the change" value={rec.conops.justification} onChange={(v) => edit((r) => ({ ...r, conops: { ...r.conops, justification: v } }))} />
          <Area label="Restrictions on the proposed system (one per line)" value={rec.conops.restrictions} onChange={(v) => edit((r) => ({ ...r, conops: { ...r.conops, restrictions: v } }))} />
        </div>
        <Area label="Proposed system, in the users’ language" rows={3} value={rec.conops.proposed} onChange={(v) => edit((r) => ({ ...r, conops: { ...r.conops, proposed: v } }))} />
        <fieldset className="w2-item">
          <legend>Operational environment</legend>
          {rec.conops.environment.map((e, i) => (
            <div className="w2-row" key={e.id}>
              <Text label={`Entry ${i + 1}: label`} value={e.label} onChange={(v) => edit((r) => ({ ...r, conops: { ...r.conops, environment: r.conops.environment.map((x) => (x.id === e.id ? { ...x, label: v } : x)) } }))} />
              <Text label={`Entry ${i + 1}: value`} value={e.value} onChange={(v) => edit((r) => ({ ...r, conops: { ...r.conops, environment: r.conops.environment.map((x) => (x.id === e.id ? { ...x, value: v } : x)) } }))} />
              <Remove label={`entry ${i + 1}`} onClick={() => edit((r) => ({ ...r, conops: { ...r.conops, environment: r.conops.environment.filter((x) => x.id !== e.id) } }))} />
            </div>
          ))}
          <div>
            <button type="button" className="lf-btn small" onClick={() => edit((r) => { const id = nextId(r, 'ENV'); return { ...r, conops: { ...r.conops, environment: [...r.conops.environment, { id, label: '', value: '' }] }, issued: withIssued(r, 'ENV', id) } })}>Add an environment entry</button>
          </div>
        </fieldset>
        <div className="w2-grid">
          <Area label="User interactions (one per line: who does what)" rows={3} value={rec.conops.interactions} onChange={(v) => edit((r) => ({ ...r, conops: { ...r.conops, interactions: v } }))} />
          <Area label="Operational constraints (one per line)" rows={3} value={rec.conops.constraints} onChange={(v) => edit((r) => ({ ...r, conops: { ...r.conops, constraints: v } }))} />
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 8 */}
      <Part id="w2-part-scenarios" n="Part 8" title="Operational scenarios" check={checks.scenarios}>
        <p className="w2-help">At least {min.scenarios} scenarios, each with one owner. {kindHelp}.</p>
        <ul className="w2-list">
          {rec.scenarios.map((s) => (
            <li key={s.id}>
              <ScenarioEditor s={s} rec={rec} uid={uid} fieldHelp={fieldHelp} onChange={(p) => upd('scenarios', s.id, p)} onRemove={() => del('scenarios', s.id)} />
            </li>
          ))}
        </ul>
        <div>
          <button type="button" className="lf-btn small" onClick={() => add('scenarios', 'SCN', EMPTY_SCENARIO)}>Add a scenario</button>
        </div>

        <fieldset className="w2-item" data-testid="w2-discoveries">
          <legend>Discovery log: what writing the scenarios exposed</legend>
          {rec.discoveries.map((d) => (
            <DiscoveryRow key={d.id} d={d} rec={rec} onChange={(p) => upd('discoveries', d.id, p)} onRemove={() => del('discoveries', d.id)} />
          ))}
          <div className="w2-btn-row">
            <button type="button" className="lf-btn small" onClick={() => edit((r) => { const id = nextId(r, 'D'); return { ...r, discoveries: [...r.discoveries, { id, scenario: '', where: '', kind: '', ref: '', text: '' }], issued: withIssued(r, 'D', id) } })}>Add a discovery</button>
            <button type="button" className="lf-btn small" disabled={!rec.week1} onClick={() => edit((r) => { const id = nextId(r, 'NEED'); return { ...r, needsAdded: [...r.needsAdded, { id, name: '', statement: '', priority: '', goal: '' }], issued: withIssued(r, 'NEED', id) } })}>Add a need the scenarios exposed</button>
          </div>
          {rec.needsAdded.map((n) => (
            <div className="w2-row" key={n.id}>
              <span className="w2-id">{n.id}</span>
              <Text label="Short name" value={n.name} onChange={(v) => edit((r) => ({ ...r, needsAdded: r.needsAdded.map((x) => (x.id === n.id ? { ...x, name: v } : x)) }))} />
              <Text label="Need statement (“The [stakeholders] need the [system] to …”)" value={n.statement} onChange={(v) => edit((r) => ({ ...r, needsAdded: r.needsAdded.map((x) => (x.id === n.id ? { ...x, statement: v } : x)) }))} />
              <Text label="Goal it serves (MGO)" mono narrow value={n.goal} onChange={(v) => edit((r) => ({ ...r, needsAdded: r.needsAdded.map((x) => (x.id === n.id ? { ...x, goal: v.trim().toUpperCase() } : x)) }))} />
              <Remove label={n.id} onClick={() => edit((r) => ({ ...r, needsAdded: r.needsAdded.filter((x) => x.id !== n.id) }))} />
            </div>
          ))}
        </fieldset>

        <fieldset className="w2-item" data-testid="w2-register">
          <legend>Uncertainty register: unknowns (U, with a TBD/TBR token) and assumptions (A)</legend>
          {rec.uncertainties.map((u) => (
            <UncertaintyRow key={u.id} u={u} onChange={(p) => upd('uncertainties', u.id, p)} onRemove={() => del('uncertainties', u.id)} />
          ))}
          <div className="w2-btn-row">
            <button type="button" className="lf-btn small" onClick={() => add('uncertainties', 'U', (id) => ({ ...EMPTY_UNCERTAINTY(id), tbx: nextTbx(rec) }))}>Add an unknown (U)</button>
            <button type="button" className="lf-btn small" onClick={() => add('uncertainties', 'A', EMPTY_UNCERTAINTY)}>Add an assumption (A)</button>
          </div>
        </fieldset>
      </Part>

      {/* ---------------------------------------------------------------- Part 9 */}
      <Part id="w2-part-capabilities" n="Part 9" title="Capabilities and the needs × scenarios coverage" check={checks.capabilities}>
        <p className="w2-help">At least {min.capabilities} capabilities, each derived from at least one need. Then mark which scenarios exercise each need, or record why none does.</p>
        <ul className="w2-list">
          {rec.capabilities.map((c) => (
            <li key={c.id}>
              <CapabilityEditor c={c} rec={rec} onChange={(p) => upd('capabilities', c.id, p)} onRemove={() => del('capabilities', c.id)} />
            </li>
          ))}
        </ul>
        <div>
          <button type="button" className="lf-btn small" onClick={() => add('capabilities', 'CAP', EMPTY_CAPABILITY)}>Add a capability</button>
        </div>
        <CoverageMatrix rec={rec} edit={edit} />
      </Part>

      {/* ---------------------------------------------------------------- Part 10 */}
      <Part id="w2-part-requirements" n="Part 10" title="Stakeholder and system requirements" check={checks.requirements}>
        <p className="w2-help" data-testid="w2-req-counter">
          Counting (every hard gate passed): <strong>{count.total}</strong> of {min.requirements} · stakeholder <strong>{count.stk}</strong> of {min.stakeholderRequirements} · system <strong>{count.sys}</strong> of {min.systemRequirements} · types <strong>{count.types.length}</strong> of {min.types}. Advisories are shown but never stop a requirement counting.
        </p>
        <ul className="w2-list">
          {rec.requirements.map((q) => (
            <li key={q.id}>
              <RequirementEditor q={q} rec={rec} onChange={(p) => upd('requirements', q.id, p)} onRemove={() => del('requirements', q.id)} />
            </li>
          ))}
        </ul>
        <div className="w2-btn-row">
          <button type="button" className="lf-btn small" onClick={() => add('requirements', 'REQ-STK', EMPTY_REQUIREMENT)} data-testid="w2-add-stk">Add a stakeholder requirement (REQ-STK)</button>
          <button type="button" className="lf-btn small" onClick={() => add('requirements', 'REQ-SYS', EMPTY_REQUIREMENT)} data-testid="w2-add-sys">Add a system requirement (REQ-SYS)</button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 11 */}
      <Part id="w2-part-audit" n="Part 11" title="Trace audit and measures (MOE, MOP)" check={checks.audit}>
        <div data-testid="w2-audit">
          <p className="m-0">
            <strong>Orphans</strong> (a requirement whose parent is missing): {audit.orphans.length ? audit.orphans.map((o) => `${o.id} (${o.missing.join(', ')})`).join('; ') : 'none'}
          </p>
          {[
            { title: 'Needs with no stakeholder requirement', ids: audit.childlessNeeds },
            { title: 'Stakeholder requirements with no system requirement', ids: audit.childlessStk },
          ].map((g) => (
            <fieldset className="w2-item mt-2" key={g.title}>
              <legend>{g.title}: write the child, or record a disposition</legend>
              <p className="w2-help">
                Dispositions: {AUDIT_DISPOSITIONS.map((d) => d.label.toLowerCase()).join('; ')}. Record why not as an {RECORD_WHY_NOT_FORMS[0].label} ({RECORD_WHY_NOT_FORMS[0].meaning}) or as {RECORD_WHY_NOT_FORMS[1].label} ({RECORD_WHY_NOT_FORMS[1].meaning}).
              </p>
              {!g.ids.length && <p className="w2-help">None.</p>}
              {g.ids.map((id) => (
                <Text key={id} label={`${id}: disposition (record why not: an open item with who closes it and the target week, or why no child is needed)`} value={rec.dispositions[id] ?? ''} onChange={(v) => edit((r) => ({ ...r, dispositions: { ...r.dispositions, [id]: v } }))} />
              ))}
            </fieldset>
          ))}
        </div>
        {(['moes', 'mops'] as const).map((key) => (
          <fieldset className="w2-item" key={key}>
            <legend>{key === 'moes' ? `Measures of effectiveness (at least ${min.moes}): each measures a NEED, CAP or MGO` : `Measures of performance (at least ${min.mops}): each supports an MOE and measures a requirement`}</legend>
            {rec[key].map((m) => (
              <MeasureRow key={m.id} m={m} onChange={(p) => upd(key, m.id, p)} onRemove={() => del(key, m.id)} />
            ))}
            <div>
              <button type="button" className="lf-btn small" onClick={() => add(key, key === 'moes' ? 'MOE' : 'MOP', EMPTY_MEASURE)}>Add {key === 'moes' ? 'an MOE' : 'a MOP'}</button>
            </div>
          </fieldset>
        ))}
      </Part>

      {/* ---------------------------------------------------------------- Part 6 updated */}
      <Part id="w2-part-ai" n="Part 6 (updated)" title="AI usage statement" check={checks.ai}>
        <Area label="Tool, purpose, prompts, what you accepted or rejected and why; or that no AI tool was used" rows={3} value={rec.aiStatement} onChange={(v) => edit((r) => ({ ...r, aiStatement: v }))} testId="w2-ai" />
      </Part>
    </div>
  )
}

// ------------------------------------------------------------------------------------------- editors
function ScenarioEditor({ s, rec, uid, fieldHelp, onChange, onRemove }: { s: Scenario; rec: Week2Record; uid: string; fieldHelp: (id: string) => string; onChange: (p: Partial<Scenario>) => void; onRemove: () => void }) {
  const a = assessScenario(s, rec)
  const gateLabel = Object.fromEntries(SCENARIO_GATES.map((g) => [g.id, g.short]))
  return (
    <fieldset className="w2-item" data-testid={`w2-${s.id}`}>
      <legend>{s.id}</legend>
      <div className="w2-row">
        <Text label="Scenario name" value={s.name} onChange={(v) => onChange({ name: v })} />
        <Field label="Kind">
          <select className="w2-select" value={s.kind} onChange={(e) => onChange({ kind: e.target.value as Scenario['kind'] })}>
            <option value="">Choose…</option>
            {SCENARIO_KINDS.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
        </Field>
        <Text label="Owner (initials)" narrow value={s.owner} onChange={(v) => onChange({ owner: v })} />
        <Remove label={s.id} onClick={onRemove} />
      </div>
      <div className="w2-sub">
        <span className="w2-legend">Actors: {fieldHelp('actors')}</span>
        {s.actors.map((x, i) => (
          <div className="w2-row" key={x.id}>
            <Text label={`Actor ${i + 1}`} value={x.name} onChange={(v) => onChange({ actors: s.actors.map((y) => (y.id === x.id ? { ...y, name: v } : y)) })} />
            <label className="w2-check">
              <input type="radio" name={`${uid}-${s.id}-primary`} checked={x.primary} onChange={() => onChange({ actors: s.actors.map((y) => ({ ...y, primary: y.id === x.id })) })} /> primary
            </label>
            <label className="w2-check">
              <input type="checkbox" checked={x.environment} onChange={(e) => onChange({ actors: s.actors.map((y) => (y.id === x.id ? { ...y, environment: e.target.checked } : y)) })} /> environment
            </label>
            <Remove label={`actor ${i + 1}`} onClick={() => onChange({ actors: s.actors.filter((y) => y.id !== x.id) })} />
          </div>
        ))}
        <div>
          <button type="button" className="lf-btn small" onClick={() => onChange({ actors: [...s.actors, { id: `ACT-${Date.now().toString(36)}-${s.actors.length}`, name: '', primary: !s.actors.some((y) => y.primary), environment: false }] })}>Add an actor</button>
        </div>
      </div>
      <div className="w2-grid">
        <Area label={`Trigger: ${fieldHelp('trigger')}`} value={s.trigger} onChange={(v) => onChange({ trigger: v })} />
        <Area label={`Preconditions: ${fieldHelp('preconditions')}`} value={s.preconditions} onChange={(v) => onChange({ preconditions: v })} />
      </div>
      <div className="w2-sub">
        <span className="w2-legend">Main flow: {fieldHelp('main')}</span>
        {s.steps.map((x, i) => (
          <div className="w2-row" key={i}>
            <span className="w2-id">{i + 1}.</span>
            <Text label={`Step ${i + 1}: actor`} value={x.actor} onChange={(v) => onChange({ steps: s.steps.map((y, j) => (j === i ? { ...y, actor: v } : y)) })} />
            <Text label={`Step ${i + 1}: action`} value={x.action} onChange={(v) => onChange({ steps: s.steps.map((y, j) => (j === i ? { ...y, action: v } : y)) })} />
            <Remove label={`step ${i + 1}`} onClick={() => onChange({ steps: s.steps.filter((_, j) => j !== i) })} />
          </div>
        ))}
        <div>
          <button type="button" className="lf-btn small" onClick={() => onChange({ steps: [...s.steps, { actor: '', action: '' }] })}>Add a step</button>
        </div>
      </div>
      <div className="w2-sub">
        <span className="w2-legend">Alternate flows: {fieldHelp('alternates')}</span>
        {s.alternates.map((x) => (
          <div className="w2-row" key={x.id}>
            <span className="w2-id">{x.id}</span>
            <NumberIn label="From step" value={x.fromStep} onChange={(v) => onChange({ alternates: s.alternates.map((y) => (y.id === x.id ? { ...y, fromStep: v } : y)) })} />
            <Text label="Condition" value={x.condition} onChange={(v) => onChange({ alternates: s.alternates.map((y) => (y.id === x.id ? { ...y, condition: v } : y)) })} />
            <Text label="Response" value={x.response} onChange={(v) => onChange({ alternates: s.alternates.map((y) => (y.id === x.id ? { ...y, response: v } : y)) })} />
            <Field label="Then">
              <select className="w2-select" value={x.outcome} onChange={(e) => onChange({ alternates: s.alternates.map((y) => (y.id === x.id ? { ...y, outcome: e.target.value as typeof x.outcome } : y)) })}>
                <option value="">Choose…</option>
                <option value="rejoin">rejoins a step</option>
                <option value="ends">ends</option>
              </select>
            </Field>
            {x.outcome === 'rejoin' && <NumberIn label="Rejoin step" value={x.rejoin} onChange={(v) => onChange({ alternates: s.alternates.map((y) => (y.id === x.id ? { ...y, rejoin: v } : y)) })} />}
            <Remove label={x.id} onClick={() => onChange({ alternates: s.alternates.filter((y) => y.id !== x.id) })} />
          </div>
        ))}
        <div>
          <button type="button" className="lf-btn small" onClick={() => onChange({ alternates: [...s.alternates, { id: nextAlternateId(s), fromStep: 0, condition: '', response: '', outcome: '', rejoin: 0 }] })}>Add an alternate flow</button>
        </div>
      </div>
      <div className="w2-grid">
        <Area label={`Success end state: ${fieldHelp('success')}`} value={s.success} onChange={(v) => onChange({ success: v })} />
        <Area label={`Failure end state: ${fieldHelp('failure')}`} value={s.failure} onChange={(v) => onChange({ failure: v })} />
      </div>
      <div className="w2-row">
        <Field label="Scenario clinic decision (instructor)">
          <select className="w2-select" value={s.clinic.decision} onChange={(e) => onChange({ clinic: { ...s.clinic, decision: e.target.value as Scenario['clinic']['decision'] } })}>
            <option value="">(not recorded)</option>
            <option value="proceed">proceed</option>
            <option value="revise">revise</option>
          </select>
        </Field>
        <Text label="What the clinic asked for" value={s.clinic.reason} onChange={(v) => onChange({ clinic: { ...s.clinic, reason: v } })} />
      </div>
      <GateList testId={`w2-gates-${s.id}`} gates={a.gates.map((g) => ({ ...g, label: gateLabel[g.id] }))} advisories={a.advisories.map((x) => ({ ...x, label: 'scenario advisory' }))} />
    </fieldset>
  )
}

function DiscoveryRow({ d, rec, onChange, onRemove }: { d: Discovery; rec: Week2Record; onChange: (p: Partial<Discovery>) => void; onRemove: () => void }) {
  return (
    <div className="w2-row">
      <Field label="Scenario">
        <select className="w2-select" value={d.scenario} onChange={(e) => onChange({ scenario: e.target.value })}>
          <option value="">Choose…</option>
          {rec.scenarios.map((s) => (
            <option key={s.id} value={s.id}>{s.id}</option>
          ))}
        </select>
      </Field>
      <Text label="Where (trigger, step n, alternate An)" value={d.where} onChange={(v) => onChange({ where: v })} />
      <Field label="Kind">
        <select className="w2-select" value={d.kind} onChange={(e) => onChange({ kind: e.target.value as Discovery['kind'] })}>
          <option value="">Choose…</option>
          <option value="need">need</option>
          <option value="assumption">assumption</option>
          <option value="unknown">unknown</option>
        </select>
      </Field>
      <Text label="ID created or changed (NEED, A or U)" mono narrow value={d.ref} onChange={(v) => onChange({ ref: v.trim().toUpperCase() })} />
      <Text label="What was found" value={d.text} onChange={(v) => onChange({ text: v })} />
      <Remove label="discovery" onClick={onRemove} />
    </div>
  )
}

function UncertaintyRow({ u, onChange, onRemove }: { u: Uncertainty; onChange: (p: Partial<Uncertainty>) => void; onRemove: () => void }) {
  const unknown = u.id.startsWith('U-')
  return (
    <div className="w2-row">
      <span className="w2-id">{u.id}</span>
      <Text label="Name" value={u.name} onChange={(v) => onChange({ name: v })} />
      {unknown && <Text label="TBD/TBR token" mono narrow value={u.tbx} onChange={(v) => onChange({ tbx: v.trim().toUpperCase() })} />}
      <Text label="Owner" value={u.owner} onChange={(v) => onChange({ owner: v })} />
      {unknown ? <Text label="How and by when it closes" value={u.closeBy} onChange={(v) => onChange({ closeBy: v })} /> : <Text label="How it will be validated" value={u.validation} onChange={(v) => onChange({ validation: v })} />}
      <Remove label={u.id} onClick={onRemove} />
    </div>
  )
}

function CapabilityEditor({ c, rec, onChange, onRemove }: { c: Capability; rec: Week2Record; onChange: (p: Partial<Capability>) => void; onRemove: () => void }) {
  const toggle = (list: string[], id: string, on: boolean) => (on ? [...new Set([...list, id])] : list.filter((x) => x !== id))
  return (
    <fieldset className="w2-item" data-testid={`w2-${c.id}`}>
      <legend>{c.id}</legend>
      <div className="w2-row">
        <Text label="Capability name" value={c.name} onChange={(v) => onChange({ name: v })} />
        <Field label="Refines (optional)">
          <select className="w2-select" value={c.refines} onChange={(e) => onChange({ refines: e.target.value })}>
            <option value="">(none)</option>
            {rec.capabilities.filter((x) => x.id !== c.id).map((x) => (
              <option key={x.id} value={x.id}>{x.id} {x.name}</option>
            ))}
          </select>
        </Field>
        <Remove label={c.id} onClick={onRemove} />
      </div>
      <Area label="Statement: what the enterprise must be able to do" value={c.statement} onChange={(v) => onChange({ statement: v })} />
      <fieldset className="w2-sub m-0 border-0">
        <legend className="w2-legend">Derived from (needs)</legend>
        <div className="w2-btn-row">
          {allNeeds(rec).map((n) => (
            <label className="w2-check" key={n.id}>
              <input type="checkbox" checked={c.needs.includes(n.id)} onChange={(e) => onChange({ needs: toggle(c.needs, n.id, e.target.checked) })} /> {n.id}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="w2-sub m-0 border-0">
        <legend className="w2-legend">Exercised by (scenarios)</legend>
        <div className="w2-btn-row">
          {rec.scenarios.map((s) => (
            <label className="w2-check" key={s.id}>
              <input type="checkbox" checked={c.scenarios.includes(s.id)} onChange={(e) => onChange({ scenarios: toggle(c.scenarios, s.id, e.target.checked) })} /> {s.id}
            </label>
          ))}
        </div>
      </fieldset>
    </fieldset>
  )
}

function CoverageMatrix({ rec, edit }: { rec: Week2Record; edit: (f: (r: Week2Record) => Week2Record) => void }) {
  const setRow = (need: string, f: (row: { scenarios: { scenario: string; steps: string }[]; reason: string }) => { scenarios: { scenario: string; steps: string }[]; reason: string }) =>
    edit((r) => {
      const cur = r.coverage.find((x) => x.need === need) ?? { need, scenarios: [], reason: '' }
      const next = { need, ...f(cur) }
      return { ...r, coverage: [...r.coverage.filter((x) => x.need !== need), next] }
    })
  return (
    <div className="w2-table-wrap" data-testid="w2-coverage">
      <table className="w2-table">
        <caption className="w2-legend text-left">Needs × scenarios coverage: tick the scenarios that exercise each need and give the steps, or record why none does</caption>
        <thead>
          <tr>
            <th scope="col">Need</th>
            {rec.scenarios.map((s) => (
              <th scope="col" key={s.id}>{s.id}</th>
            ))}
            <th scope="col">Reason if no scenario exercises it</th>
          </tr>
        </thead>
        <tbody>
          {allNeeds(rec).map((n) => {
            const cov = coverageOf(rec, n.id)
            return (
              <tr key={n.id}>
                <th scope="row">{n.id}</th>
                {rec.scenarios.map((s) => {
                  const e = cov.scenarios.find((x) => x.scenario === s.id)
                  return (
                    <td key={s.id}>
                      <label className="w2-check">
                        <input type="checkbox" checked={!!e} onChange={(ev) => setRow(n.id, (row) => ({ ...row, scenarios: ev.target.checked ? [...row.scenarios.filter((x) => x.scenario !== s.id), { scenario: s.id, steps: '' }] : row.scenarios.filter((x) => x.scenario !== s.id) }))} />
                        exercises
                      </label>
                      {e && (
                        <Field label={`Steps (${n.id}, ${s.id})`}>
                          <input className="w2-input narrow" value={e.steps} onChange={(ev) => setRow(n.id, (row) => ({ ...row, scenarios: row.scenarios.map((x) => (x.scenario === s.id ? { ...x, steps: ev.target.value } : x)) }))} />
                        </Field>
                      )}
                    </td>
                  )
                })}
                <td>
                  {!cov.scenarios.length && (
                    <Field label={`Reason (${n.id})`}>
                      <input className="w2-input" value={cov.reason} onChange={(ev) => setRow(n.id, (row) => ({ ...row, reason: ev.target.value }))} />
                    </Field>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function RequirementEditor({ q, rec, onChange, onRemove }: { q: Requirement; rec: Week2Record; onChange: (p: Partial<Requirement>) => void; onRemove: () => void }) {
  const a = assessRequirement(q, rec)
  const stk = q.id.startsWith('REQ-STK-')
  return (
    <fieldset className="w2-item" data-testid={`w2-${q.id}`}>
      <legend>
        {q.id} · {stk ? 'stakeholder' : 'system'} requirement · {a.counts ? '✓ counts' : '✗ does not count yet'}
      </legend>
      <div className="w2-row">
        <Text label="Short name" value={q.name} onChange={(v) => onChange({ name: v })} />
        <Field label="Type">
          <select className="w2-select" value={q.type} onChange={(e) => onChange({ type: e.target.value as Requirement['type'] })} data-testid={`w2-${q.id}-type`}>
            <option value="">Choose…</option>
            {REQ_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Verification method">
          <select className="w2-select" value={q.method} onChange={(e) => onChange({ method: e.target.value as Requirement['method'] })} data-testid={`w2-${q.id}-method`}>
            <option value="">Choose…</option>
            {VER_METHODS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Text label="Owner (initials)" narrow value={q.owner} onChange={(v) => onChange({ owner: v })} testId={`w2-${q.id}-owner`} />
        <Remove label={q.id} onClick={onRemove} />
      </div>
      <Area label={`Statement (${stk ? '“The [service] shall …”' : '“The [element or function] shall …”'})`} value={q.statement} onChange={(v) => onChange({ statement: v })} testId={`w2-${q.id}-statement`} />
      <div className="w2-grid">
        <Text label="Verification criterion: how a verifier decides pass or fail" value={q.criterion} onChange={(v) => onChange({ criterion: v })} testId={`w2-${q.id}-criterion`} />
        <Text label="Rationale: why, its assumptions, the source of its numbers" value={q.rationale} onChange={(v) => onChange({ rationale: v })} testId={`w2-${q.id}-rationale`} />
        <Text label={`Parents (${stk ? 'NEED or CAP' : 'REQ-STK or CAP'} IDs)`} mono value={q.parents} onChange={(v) => onChange({ parents: v })} testId={`w2-${q.id}-parents`} />
        <Text label="Unknowns its TBD/TBR tokens link to (U IDs, optional)" mono value={q.tbx} onChange={(v) => onChange({ tbx: v })} />
        <Text label="Reviewer note (optional)" value={q.reviewer} onChange={(v) => onChange({ reviewer: v })} />
      </div>
      <label className="w2-check">
        <input type="checkbox" checked={q.ai} onChange={(e) => onChange({ ai: e.target.checked })} /> AI-suggested, reviewed by the team
      </label>
      <GateList
        testId={`w2-gates-${q.id}`}
        gates={a.gates.map((g) => ({ ...g, label: GATE_SHORT[g.id] }))}
        advisories={a.advisories.map((x) => ({ ...x, label: ADVISORY_SHORT[x.id] }))}
      />
      <p className="w2-help m-0">
        Hard gates: {REQ_HARD_GATES.length}; advisories checked: {REQ_ADVISORIES.length}. Type {typeLabel(q.type).toLowerCase()}.
      </p>
    </fieldset>
  )
}

function MeasureRow({ m, onChange, onRemove }: { m: Measure; onChange: (p: Partial<Measure>) => void; onRemove: () => void }) {
  const moe = m.id.startsWith('MOE-')
  return (
    <div className="w2-sub" data-testid={`w2-${m.id}`}>
      <div className="w2-row">
        <span className="w2-id">{m.id}</span>
        <Text label="Name" value={m.name} onChange={(v) => onChange({ name: v })} />
        <Text label={moe ? 'Measures (NEED, CAP or MGO IDs)' : 'Links (MOE and REQ IDs)'} mono value={m.measures} onChange={(v) => onChange({ measures: v })} />
        <Remove label={m.id} onClick={onRemove} />
      </div>
      <div className="w2-grid">
        <Text label="Definition: what is measured and how" value={m.definition} onChange={(v) => onChange({ definition: v })} />
        <Text label="Unit" value={m.unit} onChange={(v) => onChange({ unit: v })} />
        <Text label="Threshold" value={m.threshold} onChange={(v) => onChange({ threshold: v })} />
        <Text label="Data source" value={m.source} onChange={(v) => onChange({ source: v })} />
      </div>
    </div>
  )
}
