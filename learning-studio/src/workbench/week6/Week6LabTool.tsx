// Week 6 lab tool (Lab L6): the team's own Week 6 Team Record, extending its Week 5 record. Rendered by the Week 6 page
// shell at #/week/6/lab/tool. Every check lives in record.ts (pure, tested both ways, with the labBrief rules the lecture
// uses); this view only edits the record and shows each Part's status with "Still needed" issues, the per-entry hard gates
// (pass or fails, with a glyph and a word, never color alone), the advisories, labeled advisory, the roadmap grid (the text
// equivalent of the team's roadmap graphic) and the candidates an increment's links reach for the impact list. Saved in this
// browser (key w6.record) and normalized on load; exported as Markdown and JSON (week6-model-inputs v1); a teammate's JSON
// export can be imported after a confirmation (A22: no silent overwrite). Template: src/workbench/week5/Week5LabTool.tsx.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadJSON, saveJSON } from '../../lib/storage'
import { downloadText } from '../download'
import {
  APPROACHES, AROU_ADVISORIES, AROU_GATES, AROU_KINDS, BASELINE_GATES, EMPTY_ANSWER_RULE, GAP_GATES, HORIZONS, IMPACT_GATES, INCREMENT_ADVISORIES, INCREMENT_GATES, REVIEW_GATES, RISK_CATEGORIES, TECH_ADVISORIES, TECH_GATES, TECH_STATUSES, UNKNOWN_ADVISORIES,
  UNKNOWN_GATES, type ArouKind,
} from '../../content/lectures/week06/labBrief'
import {
  EMPTY_AROU, EMPTY_GAP, EMPTY_INCREMENT, EMPTY_TECH, EMPTY_UNKNOWN, W6_KEY,
  allChecks, assessArou, assessBaseline, assessGap, assessImpact, assessIncrement, assessReviewRow, assessTech, assessUnknown, baselineOf, fileStem, gateShort, hasWork, impactCandidates, importWeek3File, importWeek5File,
  importWeek6, laterIncrements, minimumsOf, modelInputs, nameOf, nextId, normalizeRecord, recordMarkdown, recordState, roadmapGrid, withIssued, withWeek3, withWeek5,
  type Arou, type Assessment, type Gap, type IdPrefix, type Increment, type PartCheck, type ReviewRow, type Tech, type Unknown, type Week6Record,
} from './record'
import './week6tool.css'

const readFile = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result ?? ''))
    fr.onerror = () => reject(fr.error)
    fr.readAsText(f)
  })

function Part({ id, n, title, check, children }: { id: string; n?: string; title: string; check: PartCheck; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} className="w6-part" data-testid={id}>
      <div className="w6-ph">
        <h2 id={`${id}-h`}>{n ? `${n} · ${title}` : title}</h2>
        <span className="w6-sp" />
        <span className={`w6-chip ${check.ok ? 'ok' : 'warn'}`}>{check.ok ? '✓ complete' : '○ incomplete'}</span>
      </div>
      <div className="w6-body">
        {children}
        <div className={`w6-note ${check.ok ? 'ok' : 'warn'}`} role="status" data-testid={`${id}-check`}>
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
                {check.notes.slice(0, 10).map((x) => (
                  <li key={x}>{x}</li>
                ))}
                {check.notes.length > 10 && <li>and {check.notes.length - 10} more</li>}
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
    <label className="w6-field">
      <span>{label}</span>
      {children}
    </label>
  )
}
const Text = ({ label, value, onChange, mono, testId }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; testId?: string }) => (
  <Field label={label}>
    <input className={`w6-input${mono ? ' mono' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
const Area = ({ label, value, onChange, rows = 2, testId }: { label: string; value: string; onChange: (v: string) => void; rows?: number; testId?: string }) => (
  <Field label={label}>
    <textarea className="w6-textarea" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
function Select({ label, value, onChange, options, testId, none = 'Choose…' }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; testId?: string; none?: string }) {
  return (
    <Field label={label}>
      <select className="w6-select" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId}>
        <option value="">{none}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
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
  <label className="w6-check">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid={testId} /> {label}
  </label>
)

function GateList({ a, gates, advisories = [], testId }: { a: Assessment<string, string>; gates: readonly { id: string; short: string }[]; advisories?: readonly { id: string; short: string }[]; testId: string }) {
  return (
    <div data-testid={testId}>
      <ul className="w6-gates" aria-label="Hard gates">
        {a.gates.map((g) => (
          <li key={g.id} data-gate={g.id} data-ok={g.ok} className={g.ok ? 'w6-pass' : 'w6-fail'}>
            <strong>{g.ok ? '✓ pass' : '✗ fails'}</strong> {gateShort(gates, g.id)}: {g.message}
          </li>
        ))}
      </ul>
      {a.advisories.length > 0 && (
        <ul className="w6-gates" aria-label="Advisories">
          {a.advisories.map((x) => (
            <li key={x.id} data-advisory={x.id} className="w6-adv">
              <strong>! advisory</strong> {x.message || gateShort(advisories, x.id)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type ListKey = 'gaps' | 'technologies' | 'increments' | 'unknowns' | 'arou'
type Item = { id: string }
const TRLS = Array.from({ length: 9 }, (_, i) => ({ value: String(i + 1), label: `TRL ${i + 1}` }))
const AROU_PREFIX: Record<ArouKind, IdPrefix> = { risk: 'R', opportunity: 'O', assumption: 'A' }

export default function Week6LabTool() {
  const [rec, setRec] = useState<Week6Record>(() => normalizeRecord(loadJSON<unknown>(W6_KEY, null)))
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => {
    saveJSON(W6_KEY, rec)
  }, [rec])
  const edit = (f: (r: Week6Record) => Week6Record) => setRec((r) => ({ ...f(r), updatedAt: Date.now() }))
  const checks = useMemo(() => allChecks(rec), [rec])
  const grid = useMemo(() => roadmapGrid(rec), [rec])
  const candidates = useMemo(() => impactCandidates(rec, rec.impact.increment), [rec])
  const state = recordState(rec)
  const min = minimumsOf(rec)
  const w5 = rec.week5
  const base = baselineOf(rec)

  const add = (key: ListKey, prefix: IdPrefix, make: (id: string) => Item) =>
    edit((r) => {
      const id = nextId(r, prefix)
      return { ...r, [key]: [...(r[key] as Item[]), make(id)], issued: withIssued(r, prefix, id) }
    })
  const upd = <T extends Item>(key: ListKey, id: string, patch: Partial<T>) => edit((r) => ({ ...r, [key]: (r[key] as Item[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  const del = (key: ListKey, id: string) => edit((r) => ({ ...r, [key]: (r[key] as Item[]).filter((x) => x.id !== id) }))
  /** A Week 3 technology added under its own TECH ID, with its name and TRL, so the Week 3 trace is kept. */
  const addFromWeek3 = (id: string) =>
    edit((r) => {
      const t = r.week3?.technologies.find((x) => x.id === id)
      if (!t || r.technologies.some((x) => x.id === id)) return r
      return { ...r, technologies: [...r.technologies, { ...EMPTY_TECH(id), name: t.name, trl: t.trl }], issued: withIssued(r, 'TECH', id) }
    })

  async function onWeek5File(f: File | undefined) {
    if (!f) return
    const x = importWeek5File(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    edit((r) => withWeek5(r, x.snapshot))
    setMsg({ ok: true, text: `Imported the Week 5 record of ${x.snapshot.enterprise}: ${x.snapshot.needs.length} needs, ${x.snapshot.requirements.length} requirements, ${x.snapshot.risks.length} risks, ${x.snapshot.physical.length} physical elements, ${x.snapshot.interfaces.length} interfaces.` })
  }
  async function onWeek3File(f: File | undefined) {
    if (!f) return
    const x = importWeek3File(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    edit((r) => withWeek3(r, x.extra))
    setMsg({ ok: true, text: `Added the Week 3 record: ${x.extra.technologies.length} technologies, ${x.extra.unknowns.length} unknowns, ${x.extra.assumptions.length} assumptions.` })
  }
  async function onWeek6File(f: File | undefined) {
    if (!f) return
    const x = importWeek6(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    if (hasWork(rec) && typeof window.confirm === 'function' && !window.confirm('Replace the Week 6 record in this browser with your teammate’s file? Export yours first if you want to keep it.')) return setMsg({ ok: false, text: 'Import cancelled: your record is unchanged.' })
    setRec({ ...x, updatedAt: Date.now() })
    setMsg({ ok: true, text: `Imported the teammate’s Week 6 record (${x.gaps.length} gaps, ${x.technologies.length} technologies, ${x.increments.length} increments, ${x.unknowns.length} unknowns).` })
  }
  const exportMd = () => {
    downloadText(`${fileStem(rec)}-record.md`, recordMarkdown(rec))
    setRec((r) => ({ ...r, exportedMdAt: Date.now() }))
  }
  const exportJson = () => {
    downloadText(`${fileStem(rec)}-model-inputs.json`, JSON.stringify(modelInputs(rec), null, 2), 'application/json')
    setRec((r) => ({ ...r, exportedJsonAt: Date.now() }))
  }

  const incOptions = rec.increments.map((x) => ({ value: x.id, label: `${x.id} ${x.name.trim() || '(unnamed)'}${x.baseline ? ' (baseline)' : ''}` }))
  const laterOptions = laterIncrements(rec).map((x) => ({ value: x.id, label: `${x.id} ${x.name.trim() || '(unnamed)'}` }))
  const horizonOptions = HORIZONS.map((h) => ({ value: h.id, label: `${h.label}${rec.horizons[h.id].trim() ? ` (${rec.horizons[h.id].trim()})` : ''}` }))
  const w3Missing = (rec.week3?.technologies ?? []).filter((t) => !rec.technologies.some((x) => x.id === t.id))
  const label = (id: string) => `${id}${nameOf(rec, id) ? ` ${nameOf(rec, id)}` : ''}`

  return (
    <div className="w6-tool" data-testid="w6-tool">
      <div className="w6-head">
        <h1>Lab L6 tool: your Week 6 Team Record</h1>
        <span className={`w6-chip ${state === 'ready' ? 'ok' : 'warn'}`} data-testid="w6-state">
          {state === 'ready' ? '✓ ready: every part complete' : '○ not ready'}
        </span>
        <span className="w6-sp" />
        <div className="w6-btn-row">
          <button type="button" className="lf-btn small primary" onClick={exportMd} data-testid="w6-export-md">
            Export the record (.md)
          </button>
          <button type="button" className="lf-btn small" onClick={exportJson} data-testid="w6-export-json">
            Export the model inputs (.json)
          </button>
        </div>
      </div>
      <p className="w6-help">Your team’s own enterprise, never AeroLink. Each part is checked as you type; saved in this browser only, so export after every working session. A teammate can import the JSON file to continue the same record.</p>
      <p className="w6-help" data-testid="w6-empty-answer-rule">{EMPTY_ANSWER_RULE}</p>
      <Field label="Import a teammate’s Week 6 model-inputs file (.json): replaces the record in this browser after you confirm">
        <input type="file" accept=".json,application/json" className="w6-file" data-testid="w6-import-week6" onChange={(e) => void onWeek6File(e.target.files?.[0])} />
      </Field>
      {msg && (
        <div className={`w6-note ${msg.ok ? 'ok' : 'warn'}`} role="status" data-testid="w6-message">
          {msg.ok ? '✓ ' : '✗ '}
          {msg.text}
        </div>
      )}

      {/* ---------------------------------------------------------------- 0: Week 5 import */}
      <Part id="w6-part-import" title="Start from your Week 5 Team Record" check={checks.import}>
        <p className="w6-help">The Week 6 record extends the Week 5 record as returned with feedback: its needs, capabilities and requirements are what every gap traces to, its physical elements and interfaces are the as-is, and its risks are what the increments link to. The Week 3 file is optional but advised: the Week 5 file does not carry the technology table.</p>
        <div className="w6-grid">
          <Field label="Week 5 model-inputs file (team-NN-week5-model-inputs.json)">
            <input type="file" accept=".json,application/json" className="w6-file" data-testid="w6-import-week5" onChange={(e) => void onWeek5File(e.target.files?.[0])} />
          </Field>
          <Field label="Add your Week 3 record (optional; team-NN-week3-model-inputs.json)">
            <input type="file" accept=".json,application/json" className="w6-file" data-testid="w6-import-week3" onChange={(e) => void onWeek3File(e.target.files?.[0])} />
          </Field>
        </div>
        {w5 && (
          <p className="m-0" data-testid="w6-week5-summary">
            Team <strong>{w5.team || '—'}</strong> · enterprise <strong>{w5.enterprise}</strong> · {w5.needs.length} needs · {w5.requirements.length} requirements · {w5.risks.length} risks · {w5.physical.length} physical elements · {w5.interfaces.length} interfaces
            {rec.week3 ? ` · ${rec.week3.technologies.length} technologies from Week 3` : ''}
          </p>
        )}
        <Check label="Three-person team: reduced minimums (pending faculty approval)" checked={rec.threePersonTeam} onChange={(v) => edit((r) => ({ ...r, threePersonTeam: v }))} />
      </Part>

      {/* ---------------------------------------------------------------- Part 23 */}
      <Part id="w6-part-gaps" n="Part 23" title="Baseline and capability gaps over three horizons" check={checks.gaps}>
        <p className="w6-help">State the length of each horizon with a reason (long buckets for long-lived capabilities, short ones for fast-changing ones), write the as-is, then at least {min.gaps} gaps or excesses that pass every hard gate, each traced to a need, objective, capability or requirement ID in your record.</p>
        <div className="w6-grid">
          {HORIZONS.map((h) => (
            <Text key={h.id} label={`${h.label}: length (for example “2 years”)`} value={rec.horizons[h.id]} onChange={(v) => edit((r) => ({ ...r, horizons: { ...r.horizons, [h.id]: v } }))} testId={`w6-horizon-${h.id}`} />
          ))}
        </div>
        {base && (
          <fieldset className="w6-item" data-testid={`w6-${base.id}`}>
            <legend>
              {base.id} · baseline (as is) · {assessBaseline(base).counts ? '✓ complete' : '✗ incomplete'}
            </legend>
            <Area label="The as-is: what exists when the enterprise enters service, and the limit that binds it, plus any change already decided (the baseline trajectory)" value={base.content} onChange={(v) => upd<Increment>('increments', base.id, { content: v })} rows={3} testId="w6-baseline-content" />
            <GateList a={assessBaseline(base)} gates={BASELINE_GATES} testId={`w6-gates-${base.id}`} />
          </fieldset>
        )}
        {rec.gaps.map((g) => (
          <fieldset key={g.id} className="w6-item" data-testid={`w6-${g.id}`}>
            <legend>
              {g.id} · {g.kind || 'gap or excess'} · {assessGap(g, rec).counts ? '✓ counts' : '✗ does not count yet'}
            </legend>
            <div className="w6-grid">
              <Text label="What is short or in excess" value={g.capability} onChange={(v) => upd<Gap>('gaps', g.id, { capability: v })} testId={`w6-${g.id}-capability`} />
              <Select label="Gap or excess" value={g.kind} onChange={(v) => upd<Gap>('gaps', g.id, { kind: v as Gap['kind'] })} options={[{ value: 'gap', label: 'Gap: short of what is needed' }, { value: 'excess', label: 'Excess: more than is needed' }]} testId={`w6-${g.id}-kind`} />
              <Select label="Horizon" value={g.horizon} onChange={(v) => upd<Gap>('gaps', g.id, { horizon: v as Gap['horizon'] })} options={horizonOptions} testId={`w6-${g.id}-horizon`} />
              <Text label="Desired level" value={g.desired} onChange={(v) => upd<Gap>('gaps', g.id, { desired: v })} testId={`w6-${g.id}-desired`} />
              <Text label="Baseline level" value={g.baseline} onChange={(v) => upd<Gap>('gaps', g.id, { baseline: v })} testId={`w6-${g.id}-baseline`} />
              <Text label="From (NEED, MGO, CAP or REQ IDs)" mono value={g.sources} onChange={(v) => upd<Gap>('gaps', g.id, { sources: v })} testId={`w6-${g.id}-sources`} />
            </div>
            <Check label="AI-suggested, reviewed by the team" checked={g.ai} onChange={(v) => upd<Gap>('gaps', g.id, { ai: v })} />
            <Remove label={g.id} onClick={() => del('gaps', g.id)} />
            <GateList a={assessGap(g, rec)} gates={GAP_GATES} testId={`w6-gates-${g.id}`} />
          </fieldset>
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w6-add-gap" onClick={() => add('gaps', 'GAP', EMPTY_GAP)}>
            Add a gap or excess
          </button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 24 */}
      <Part id="w6-part-technology" n="Part 24" title="Technology plan and insertion points" check={checks.technology}>
        <p className="w6-help">At least {min.technologies} technologies that pass every hard gate, at least one inserted by an increment after the baseline. Start from your Week 3 readiness assessment: add each technology under its Week 3 ID so the trace is kept. Insert a technology only where its maturity, the ability to insert it and the operational timing all hold.</p>
        {w3Missing.length > 0 && (
          <div className="w6-btn-row" data-testid="w6-week3-technologies">
            {w3Missing.map((t) => (
              <button key={t.id} type="button" className="lf-btn small" onClick={() => addFromWeek3(t.id)} data-testid={`w6-add-${t.id}`}>
                Add {t.id} {t.name} (Week 3, TRL {t.trl || '?'})
              </button>
            ))}
          </div>
        )}
        {rec.technologies.map((t) => (
          <fieldset key={t.id} className="w6-item" data-testid={`w6-${t.id}`}>
            <legend>
              {t.id} · technology · {assessTech(t, rec).counts ? '✓ counts' : '✗ does not count yet'}
            </legend>
            <div className="w6-grid">
              <Text label="Name" value={t.name} onChange={(v) => upd<Tech>('technologies', t.id, { name: v })} testId={`w6-${t.id}-name`} />
              <Select label="Status" value={t.status} onChange={(v) => upd<Tech>('technologies', t.id, { status: v as Tech['status'] })} options={TECH_STATUSES.map((s) => ({ value: s.id, label: s.label }))} testId={`w6-${t.id}-status`} />
              <Select label="TRL (not needed when it does not yet exist)" value={t.trl ? String(t.trl) : ''} onChange={(v) => upd<Tech>('technologies', t.id, { trl: Number(v) || 0 })} options={TRLS} none="No TRL" testId={`w6-${t.id}-trl`} />
              <Text label="Basis of the TRL: evidence or a labeled assumption (an A ID is enough)" value={t.basis} onChange={(v) => upd<Tech>('technologies', t.id, { basis: v })} testId={`w6-${t.id}-basis`} />
              <Select label="Insertion point: the increment that brings it in" value={t.insertion} onChange={(v) => upd<Tech>('technologies', t.id, { insertion: v })} options={incOptions} none="Not inserted" testId={`w6-${t.id}-insertion`} />
              {!t.insertion && <Text label="Not inserted: the reason" value={t.notInserted} onChange={(v) => upd<Tech>('technologies', t.id, { notInserted: v })} testId={`w6-${t.id}-notInserted`} />}
              <Text label="If immature: a risk ID or a mitigation" value={t.risk} onChange={(v) => upd<Tech>('technologies', t.id, { risk: v })} testId={`w6-${t.id}-risk`} />
            </div>
            <Check label="AI-suggested, reviewed by the team" checked={t.ai} onChange={(v) => upd<Tech>('technologies', t.id, { ai: v })} />
            <Remove label={t.id} onClick={() => del('technologies', t.id)} />
            <GateList a={assessTech(t, rec)} gates={TECH_GATES} advisories={TECH_ADVISORIES} testId={`w6-gates-${t.id}`} />
          </fieldset>
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w6-add-technology" onClick={() => add('technologies', 'TECH', EMPTY_TECH)}>
            Add a new technology
          </button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 25 */}
      <Part id="w6-part-increments" n="Part 25" title="Increments, triggers and transition" check={checks.increments}>
        <p className="w6-help">At least {min.increments} increments counting the baseline, each after the baseline passing every hard gate, at least one beyond the near term. A trigger is the evidence or event that starts the increment, not a date; an off-ramp is needed wherever the increment inserts a technology below TRL 6, in development or not yet existing.</p>
        {laterIncrements(rec).map((x) => (
          <IncrementEditor key={x.id} x={x} rec={rec} horizonOptions={horizonOptions} onChange={(p) => upd<Increment>('increments', x.id, p)} onRemove={() => del('increments', x.id)} />
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w6-add-increment" onClick={() => add('increments', 'INC', (id) => EMPTY_INCREMENT(id))}>
            Add an increment
          </button>
        </div>
        <div className="w6-table-wrap" role="region" aria-label="Roadmap grid" tabIndex={0}>
          <table className="w6-table w6-grid-road" data-testid="w6-roadmap">
            <caption className="w6-legend text-left">Roadmap grid, the text equivalent of your roadmap graphic: one column per horizon, the baseline first; each increment with its trigger, the technologies it inserts and what it follows. Increments inserting an immature technology are marked dashed.</caption>
            <thead>
              <tr>
                {grid.map((c) => (
                  <th key={c.horizon} scope="col">
                    {c.label}
                    {c.length ? ` (${c.length})` : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {grid.map((c) => (
                  <td key={c.horizon} data-horizon={c.horizon}>
                    {c.increments.length ? (
                      c.increments.map((x) => (
                        <span key={x.id} className={`w6-inc${x.dashed ? ' w6-dashed' : ''}`}>
                          <strong>{x.id}</strong> {x.name || '(unnamed)'}
                          {x.trigger ? ` · starts when ${x.trigger}` : ''}
                          {x.inserts.length ? ` · inserts ${x.inserts.join(', ')}` : ''}
                          {x.dependencies.length ? ` · after ${x.dependencies.join(', ')}` : ''}
                          {x.dashed ? ' · dashed: immature technology' : ''}
                        </span>
                      ))
                    ) : (
                      <span className="w6-help">no increment</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 26 */}
      <Part id="w6-part-unknowns" n="Part 26" title="Known unknowns, AROU update, security and resilience" check={checks.unknowns}>
        <p className="w6-help">At least {min.unknowns} known unknowns, each gating an increment; at least {min.arou} new or changed AROU item linked to an increment; at least one security or resilience risk and one transition risk (a risk that exists only while a change is being made) linked to increments.</p>
        {rec.unknowns.map((u) => (
          <fieldset key={u.id} className="w6-item" data-testid={`w6-${u.id}`}>
            <legend>
              {u.id} · known unknown · {assessUnknown(u, rec).counts ? '✓ counts' : '✗ does not count yet'}
            </legend>
            <div className="w6-grid">
              <Text label="What is unknown" value={u.name} onChange={(v) => upd<Unknown>('unknowns', u.id, { name: v })} testId={`w6-${u.id}-name`} />
              <Text label="TBD or TBR placeholder (optional, for example TBD-02)" mono value={u.tbx} onChange={(v) => upd<Unknown>('unknowns', u.id, { tbx: v })} />
              <Text label="Impact if it comes out badly" value={u.impact} onChange={(v) => upd<Unknown>('unknowns', u.id, { impact: v })} testId={`w6-${u.id}-impact`} />
              <Text label="Information needed to close it" value={u.need} onChange={(v) => upd<Unknown>('unknowns', u.id, { need: v })} testId={`w6-${u.id}-need`} />
              <Text label="Mitigation while it stays open" value={u.mitigation} onChange={(v) => upd<Unknown>('unknowns', u.id, { mitigation: v })} testId={`w6-${u.id}-mitigation`} />
              <Text label="Owner (a role or a person)" value={u.owner} onChange={(v) => upd<Unknown>('unknowns', u.id, { owner: v })} testId={`w6-${u.id}-owner`} />
              <Select label="The increment it gates" value={u.gates} onChange={(v) => upd<Unknown>('unknowns', u.id, { gates: v })} options={incOptions} testId={`w6-${u.id}-gates`} />
            </div>
            <Check label="AI-suggested, reviewed by the team" checked={u.ai} onChange={(v) => upd<Unknown>('unknowns', u.id, { ai: v })} />
            <Remove label={u.id} onClick={() => del('unknowns', u.id)} />
            <GateList a={assessUnknown(u, rec)} gates={UNKNOWN_GATES} advisories={UNKNOWN_ADVISORIES} testId={`w6-gates-${u.id}`} />
          </fieldset>
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w6-add-unknown" onClick={() => add('unknowns', 'U', EMPTY_UNKNOWN)}>
            Add a known unknown
          </button>
        </div>
        {rec.arou.map((a) => (
          <fieldset key={a.id} className="w6-item" data-testid={`w6-${a.id}`}>
            <legend>
              {a.id} · {a.kind || 'AROU item'} · {assessArou(a, rec).counts ? '✓ counts' : '✗ does not count yet'}
            </legend>
            <div className="w6-grid">
              <Area label="What it says" value={a.statement} onChange={(v) => upd<Arou>('arou', a.id, { statement: v })} testId={`w6-${a.id}-statement`} />
              {a.kind === 'risk' && <Select label="Risk category (as in your Week 3 register)" value={a.category} onChange={(v) => upd<Arou>('arou', a.id, { category: v })} options={RISK_CATEGORIES.map((c) => ({ value: c, label: c }))} testId={`w6-${a.id}-category`} />}
              <Text label="Owner" value={a.owner} onChange={(v) => upd<Arou>('arou', a.id, { owner: v })} testId={`w6-${a.id}-owner`} />
              <Select label="The increment it belongs to" value={a.increment} onChange={(v) => upd<Arou>('arou', a.id, { increment: v })} options={incOptions} testId={`w6-${a.id}-increment`} />
            </div>
            {a.kind === 'risk' && <Check label="Transition risk: it exists only while the change is being made" checked={a.transition} onChange={(v) => upd<Arou>('arou', a.id, { transition: v })} testId={`w6-${a.id}-transition`} />}
            <Check label="AI-suggested, reviewed by the team" checked={a.ai} onChange={(v) => upd<Arou>('arou', a.id, { ai: v })} />
            <Remove label={a.id} onClick={() => del('arou', a.id)} />
            <GateList a={assessArou(a, rec)} gates={AROU_GATES} advisories={AROU_ADVISORIES} testId={`w6-gates-${a.id}`} />
          </fieldset>
        ))}
        <div className="w6-btn-row">
          {AROU_KINDS.map((k) => (
            <button key={k.id} type="button" className="lf-btn small" data-testid={`w6-add-${k.id}`} onClick={() => add('arou', AROU_PREFIX[k.id], (id) => EMPTY_AROU(id, k.id))}>
              Add a {k.label.toLowerCase()}
            </button>
          ))}
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 27 */}
      <Part id="w6-part-review" n="Part 27" title="Impact of one increment and the Phase I baseline review" check={checks.review}>
        <p className="w6-help">Choose one increment after the baseline. The tool lists the IDs its links reach one step from what it names (its content, trigger, serves, risks, security change and the technologies it inserts); judge each candidate as reached, with how, or not reached, with why. Then review Weeks 1–5 for Week 7: ready, or each open item with who closes it.</p>
        <fieldset className="w6-item" data-testid="w6-impact">
          <legend>Impact list · {assessImpact(rec).counts ? '✓ complete' : '✗ incomplete'}</legend>
          <Select label="The increment" value={rec.impact.increment} onChange={(v) => edit((r) => ({ ...r, impact: { ...r.impact, increment: v } }))} options={laterOptions} testId="w6-impact-increment" />
          <p className="w6-help" data-testid="w6-impact-candidates">
            Candidates the record’s links reach: {candidates.length ? candidates.map(label).join('; ') : rec.impact.increment ? 'none yet: name the elements, functions or interfaces the increment changes in its content' : 'choose an increment'}
          </p>
          <div className="w6-grid">
            <Area label="Reached: each ID with how the change reaches it" value={rec.impact.reached} onChange={(v) => edit((r) => ({ ...r, impact: { ...r.impact, reached: v } }))} rows={3} testId="w6-impact-reached" />
            <Area label="Not reached: each ID with why not" value={rec.impact.notReached} onChange={(v) => edit((r) => ({ ...r, impact: { ...r.impact, notReached: v } }))} rows={3} testId="w6-impact-notReached" />
          </div>
          <GateList a={assessImpact(rec)} gates={IMPACT_GATES} testId="w6-gates-impact" />
        </fieldset>
        {rec.review.map((row) => (
          <fieldset key={row.week} className="w6-item" data-testid={`w6-review-${row.week}`}>
            <legend>
              Week {row.week} · baseline review · {assessReviewRow(row).counts ? '✓ reviewed' : '✗ not reviewed yet'}
            </legend>
            <div className="w6-grid">
              <Select label="Status" value={row.status} onChange={(v) => edit((r) => ({ ...r, review: r.review.map((x) => (x.week === row.week ? { ...x, status: v as ReviewRow['status'] } : x)) }))} options={[{ value: 'ready', label: 'Ready' }, { value: 'open', label: 'Open items' }]} testId={`w6-review-${row.week}-status`} />
              {row.status === 'open' && (
                <>
                  <Text label="Open items" value={row.items} onChange={(v) => edit((r) => ({ ...r, review: r.review.map((x) => (x.week === row.week ? { ...x, items: v } : x)) }))} testId={`w6-review-${row.week}-items`} />
                  <Text label="Who closes them" value={row.owner} onChange={(v) => edit((r) => ({ ...r, review: r.review.map((x) => (x.week === row.week ? { ...x, owner: v } : x)) }))} testId={`w6-review-${row.week}-owner`} />
                </>
              )}
            </div>
            <GateList a={assessReviewRow(row)} gates={REVIEW_GATES} testId={`w6-gates-review-${row.week}`} />
          </fieldset>
        ))}
      </Part>

      <Part id="w6-part-ai" n="Part 6" title="AI usage statement (updated)" check={checks.ai}>
        <Area label="Tool, purpose, prompts, what you accepted or rejected and why (or: no AI tool was used)" value={rec.aiStatement} onChange={(v) => edit((r) => ({ ...r, aiStatement: v }))} rows={3} testId="w6-ai-statement" />
      </Part>
    </div>
  )
}

function IncrementEditor({ x, rec, horizonOptions, onChange, onRemove }: { x: Increment; rec: Week6Record; horizonOptions: { value: string; label: string }[]; onChange: (p: Partial<Increment>) => void; onRemove: () => void }) {
  const a = assessIncrement(x, rec)
  return (
    <fieldset className="w6-item" data-testid={`w6-${x.id}`}>
      <legend>
        {x.id} · increment · {a.counts ? '✓ counts' : '✗ does not count yet'}
      </legend>
      <div className="w6-row">
        <Text label="Name" value={x.name} onChange={(v) => onChange({ name: v })} testId={`w6-${x.id}-name`} />
        <Select label="Horizon" value={x.horizon} onChange={(v) => onChange({ horizon: v as Increment['horizon'] })} options={horizonOptions} testId={`w6-${x.id}-horizon`} />
        <Select label="Development approach" value={x.approach} onChange={(v) => onChange({ approach: v as Increment['approach'] })} options={APPROACHES.map((p) => ({ value: p.id, label: `${p.label}: ${p.when}` }))} testId={`w6-${x.id}-approach`} />
        <Remove label={x.id} onClick={onRemove} />
      </div>
      <div className="w6-grid">
        <Area label="Content: what changes" value={x.content} onChange={(v) => onChange({ content: v })} testId={`w6-${x.id}-content`} />
        <Text label="Serves (GAP, NEED, MGO, CAP or REQ IDs)" mono value={x.serves} onChange={(v) => onChange({ serves: v })} testId={`w6-${x.id}-serves`} />
        <Area label="Entry trigger: the evidence or event that starts it" value={x.trigger} onChange={(v) => onChange({ trigger: v })} testId={`w6-${x.id}-trigger`} />
        <Text label="Depends on (INC IDs; optional)" mono value={x.dependencies} onChange={(v) => onChange({ dependencies: v })} testId={`w6-${x.id}-dependencies`} />
        <Area label="Transition: how the service keeps operating while it changes" value={x.transition} onChange={(v) => onChange({ transition: v })} testId={`w6-${x.id}-transition`} />
        <Area label="Security and resilience change (“None” with the reason is an answer)" value={x.security} onChange={(v) => onChange({ security: v })} testId={`w6-${x.id}-security`} />
        <Text label="Off-ramp: the mature fallback if an inserted technology does not mature" value={x.offRamp} onChange={(v) => onChange({ offRamp: v })} testId={`w6-${x.id}-offRamp`} />
        <Text label="Risks it creates or changes (R IDs)" mono value={x.risks} onChange={(v) => onChange({ risks: v })} testId={`w6-${x.id}-risks`} />
      </div>
      <Check label="AI-suggested, reviewed by the team" checked={x.ai} onChange={(v) => onChange({ ai: v })} />
      <GateList a={a} gates={INCREMENT_GATES} advisories={INCREMENT_ADVISORIES} testId={`w6-gates-${x.id}`} />
    </fieldset>
  )
}
