// Week 4 lab tool (Lab L4): the team's own Week 4 Team Record, extending its Week 3 record. Rendered by the Week 4 page
// shell at #/week/4/lab/tool. Every check lives in record.ts (pure, tested both ways, with the labBrief rules the lecture
// uses); this view only edits the record and shows each Part's status with "Still needed" issues, the per-entry hard gates
// (pass or fails, with a glyph and a word, never color alone) and the advisories, labeled advisory. Saved in this browser
// (key w4.record) and normalized on load; exported as Markdown and JSON (week4-model-inputs v1); a teammate's JSON export
// can be imported.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadJSON, saveJSON } from '../../lib/storage'
import { downloadText } from '../download'
import { AI_GATES, ALLOCATION_CRITERIA, ALLOCATION_GATES, DECISION_GATES, FUNCTION_ADVISORIES, FUNCTION_GATES, INFO_ADVISORIES, INFO_GATES, VIEWPOINT_ADVISORIES, VIEWPOINT_GATES, VIEW_KINDS } from '../../content/lectures/week04/labBrief'
import {
  EMPTY_AI, EMPTY_DECISION, EMPTY_EXTERNAL, EMPTY_FN, EMPTY_GROUP, EMPTY_INFO, EMPTY_LOGICAL, EMPTY_PHYSICAL, EMPTY_VIEWPOINT, W4_KEY,
  allChecks, assessAi, assessAllocation, assessDecision, assessFunction, assessInfo, assessViewpoint, consistency, fileStem, gateShort, importWeek3File, importWeek4, minimumsOf, modelInputs, nextId,
  normalizeRecord, recordMarkdown, recordState, withIssued, withWeek3,
  type AiCard, type Assessment, type Decision, type External, type Fn, type Group, type IdPrefix, type Info, type Logical, type PartCheck, type Physical, type Viewpoint, type Week4Record,
} from './record'
import './week4tool.css'

const readFile = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result ?? ''))
    fr.onerror = () => reject(fr.error)
    fr.readAsText(f)
  })

function Part({ id, n, title, check, children }: { id: string; n?: string; title: string; check: PartCheck; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} className="w4-part" data-testid={id}>
      <div className="w4-ph">
        <h2 id={`${id}-h`}>{n ? `${n} · ${title}` : title}</h2>
        <span className="w4-sp" />
        <span className={`w4-chip ${check.ok ? 'ok' : 'warn'}`}>{check.ok ? '✓ complete' : '○ incomplete'}</span>
      </div>
      <div className="w4-body">
        {children}
        <div className={`w4-note ${check.ok ? 'ok' : 'warn'}`} role="status" data-testid={`${id}-check`}>
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
    <label className="w4-field">
      <span>{label}</span>
      {children}
    </label>
  )
}
const Text = ({ label, value, onChange, mono, testId }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; testId?: string }) => (
  <Field label={label}>
    <input className={`w4-input${mono ? ' mono' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
const Area = ({ label, value, onChange, rows = 2, testId }: { label: string; value: string; onChange: (v: string) => void; rows?: number; testId?: string }) => (
  <Field label={label}>
    <textarea className="w4-textarea" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
function Select({ label, value, onChange, options, testId }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; testId?: string }) {
  return (
    <Field label={label}>
      <select className="w4-select" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId}>
        <option value="">Choose…</option>
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
  <label className="w4-check">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid={testId} /> {label}
  </label>
)

function GateList({ a, gates, advisories = [], testId }: { a: Assessment<string, string>; gates: readonly { id: string; short: string }[]; advisories?: readonly { id: string; short: string }[]; testId: string }) {
  return (
    <div data-testid={testId}>
      <ul className="w4-gates" aria-label="Hard gates">
        {a.gates.map((g) => (
          <li key={g.id} data-gate={g.id} data-ok={g.ok} className={g.ok ? 'w4-pass' : 'w4-fail'}>
            <strong>{g.ok ? '✓ pass' : '✗ fails'}</strong> {gateShort(gates, g.id)}: {g.message}
          </li>
        ))}
      </ul>
      {a.advisories.length > 0 && (
        <ul className="w4-gates" aria-label="Advisories">
          {a.advisories.map((x) => (
            <li key={x.id} data-advisory={x.id} className="w4-adv">
              <strong>! advisory</strong> {gateShort(advisories, x.id)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type ListKey = 'viewpoints' | 'groups' | 'functions' | 'logical' | 'physical' | 'externals' | 'decisions' | 'information' | 'ai'
type Item = { id: string }

export default function Week4LabTool() {
  const [rec, setRec] = useState<Week4Record>(() => normalizeRecord(loadJSON<unknown>(W4_KEY, null)))
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => {
    saveJSON(W4_KEY, rec)
  }, [rec])
  const edit = (f: (r: Week4Record) => Week4Record) => setRec((r) => ({ ...f(r), updatedAt: Date.now() }))
  const checks = useMemo(() => allChecks(rec), [rec])
  const cons = useMemo(() => consistency(rec), [rec])
  const state = recordState(rec)
  const min = minimumsOf(rec)
  const w3 = rec.week3

  const add = (key: ListKey, prefix: IdPrefix, make: (id: string) => Item) =>
    edit((r) => {
      const id = nextId(r, prefix)
      return { ...r, [key]: [...(r[key] as Item[]), make(id)], issued: withIssued(r, prefix, id) }
    })
  const upd = <T extends Item>(key: ListKey, id: string, patch: Partial<T>) => edit((r) => ({ ...r, [key]: (r[key] as Item[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  const del = (key: ListKey, id: string) => edit((r) => ({ ...r, [key]: (r[key] as Item[]).filter((x) => x.id !== id) }))

  async function onWeek3File(f: File | undefined) {
    if (!f) return
    const x = importWeek3File(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    edit((r) => withWeek3(r, x.snapshot))
    setMsg({ ok: true, text: `Imported the Week 3 record of ${x.snapshot.enterprise}: ${x.snapshot.capabilities.length} capabilities, ${x.snapshot.scenarios.length} scenarios, ${x.snapshot.requirements.length} requirements.` })
  }
  async function onWeek4File(f: File | undefined) {
    if (!f) return
    const x = importWeek4(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    setRec({ ...x, updatedAt: Date.now() })
    setMsg({ ok: true, text: `Imported the teammate’s Week 4 record (${x.viewpoints.length} viewpoints, ${x.functions.length} functions, ${x.information.length} information items).` })
  }
  const exportMd = () => {
    downloadText(`${fileStem(rec)}-record.md`, recordMarkdown(rec))
    setRec((r) => ({ ...r, exportedMdAt: Date.now() }))
  }
  const exportJson = () => {
    downloadText(`${fileStem(rec)}-model-inputs.json`, JSON.stringify(modelInputs(rec), null, 2), 'application/json')
    setRec((r) => ({ ...r, exportedJsonAt: Date.now() }))
  }

  const opt = (xs: { id: string; name: string }[]) => xs.map((x) => ({ value: x.id, label: `${x.id} ${x.name}` }))

  return (
    <div className="w4-tool" data-testid="w4-tool">
      <div className="w4-head">
        <h1>Lab L4 tool: your Week 4 Team Record</h1>
        <span className={`w4-chip ${state === 'ready' ? 'ok' : 'warn'}`} data-testid="w4-state">
          {state === 'ready' ? '✓ ready: every part complete' : '○ not ready'}
        </span>
        <span className="w4-sp" />
        <div className="w4-btn-row">
          <button type="button" className="lf-btn small primary" onClick={exportMd} data-testid="w4-export-md">
            Export the record (.md)
          </button>
          <button type="button" className="lf-btn small" onClick={exportJson} data-testid="w4-export-json">
            Export the model inputs (.json)
          </button>
        </div>
      </div>
      <p className="w4-help">Your team’s own enterprise, never AeroLink. Each part is checked as you type; saved in this browser only, so export after every working session. A teammate can import the JSON file to continue the same record.</p>
      <Field label="Import a teammate’s Week 4 model-inputs file (.json): replaces the record in this browser">
        <input type="file" accept=".json,application/json" className="w4-file" data-testid="w4-import-week4" onChange={(e) => void onWeek4File(e.target.files?.[0])} />
      </Field>
      {msg && (
        <div className={`w4-note ${msg.ok ? 'ok' : 'warn'}`} role="status" data-testid="w4-message">
          {msg.ok ? '✓ ' : '✗ '}
          {msg.text}
        </div>
      )}

      {/* ---------------------------------------------------------------- 0: Week 3 import */}
      <Part id="w4-part-import" title="Start from your Week 3 Team Record" check={checks.import}>
        <p className="w4-help">The Week 4 record extends the Week 3 record as returned with feedback: its needs, capabilities, scenarios and requirements are what the views, functions and allocations trace to; its trade decision is the starting configuration of the physical view.</p>
        <Field label="Week 3 model-inputs file (team-NN-week3-model-inputs.json)">
          <input type="file" accept=".json,application/json" className="w4-file" data-testid="w4-import-week3" onChange={(e) => void onWeek3File(e.target.files?.[0])} />
        </Field>
        {w3 && (
          <div data-testid="w4-week3-summary">
            <p className="m-0">
              Team <strong>{w3.team || '—'}</strong> · enterprise <strong>{w3.enterprise}</strong> · {w3.capabilities.length} capabilities · {w3.scenarios.length} scenarios · {w3.requirements.length} requirements{w3.decision.name ? ` · decision: ${w3.decision.name}` : ''}
            </p>
            <ul className="w4-help m-0 pl-5" aria-label="Capabilities and scenarios">
              {[...w3.capabilities, ...w3.scenarios].map((x) => (
                <li key={x.id}>
                  <span className="w4-id">{x.id}</span> {x.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Check label="Three-person team: reduced minimums (pending faculty approval)" checked={rec.threePersonTeam} onChange={(v) => edit((r) => ({ ...r, threePersonTeam: v }))} />
      </Part>

      {/* ---------------------------------------------------------------- Part 15 */}
      <Part id="w4-part-views" n="Part 15" title="Architecture viewpoints and views" check={checks.views}>
        <p className="w4-help">At least {min.viewpoints} viewpoints: one of each kind the course requires (operational, functional, physical, information, enterprise), plus any view a concern needs. Write the purpose as the question the view answers. Each entry holds both the viewpoint, the rule (purpose, stakeholders, concern, form), and the view it produces for your one system.</p>
        {rec.viewpoints.map((v) => (
          <fieldset key={v.id} className="w4-item" data-testid={`w4-${v.id}`}>
            <legend>
              {v.id} · viewpoint · {assessViewpoint(v, rec).counts ? '✓ counts' : '✗ does not count yet'}
            </legend>
            <div className="w4-row">
              <Select label="Kind" value={v.kind} onChange={(x) => upd<Viewpoint>('viewpoints', v.id, { kind: x as Viewpoint['kind'] })} options={VIEW_KINDS.map((k) => ({ value: k.id, label: k.label }))} testId={`w4-${v.id}-kind`} />
              <Text label="Name" value={v.name} onChange={(x) => upd<Viewpoint>('viewpoints', v.id, { name: x })} />
              <Remove label={v.id} onClick={() => del('viewpoints', v.id)} />
            </div>
            <Area label="Purpose: the question this view answers" value={v.purpose} onChange={(x) => upd<Viewpoint>('viewpoints', v.id, { purpose: x })} testId={`w4-${v.id}-purpose`} />
            <div className="w4-grid">
              <Text label="Stakeholders it serves" value={v.stakeholders} onChange={(x) => upd<Viewpoint>('viewpoints', v.id, { stakeholders: x })} testId={`w4-${v.id}-stakeholders`} />
              <Text label="Their concern, in words or its ID (CON-001)" value={v.concerns} onChange={(x) => upd<Viewpoint>('viewpoints', v.id, { concerns: x })} testId={`w4-${v.id}-concerns`} />
              <Text label="Serves (NEED, CAP or REQ IDs; optional)" mono value={v.serves} onChange={(x) => upd<Viewpoint>('viewpoints', v.id, { serves: x })} testId={`w4-${v.id}-serves`} />
              <Text label="Conventions: form and element types shown" value={v.form} onChange={(x) => upd<Viewpoint>('viewpoints', v.id, { form: x })} testId={`w4-${v.id}-form`} />
            </div>
            <GateList a={assessViewpoint(v, rec)} gates={VIEWPOINT_GATES} advisories={VIEWPOINT_ADVISORIES} testId={`w4-gates-${v.id}`} />
          </fieldset>
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w4-add-viewpoint" onClick={() => add('viewpoints', 'VP', (id) => EMPTY_VIEWPOINT(id))}>
            Add a viewpoint
          </button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 16 */}
      <Part id="w4-part-functions" n="Part 16" title="Functional architecture: functions and decomposition" check={checks.functions}>
        <p className="w4-help">At least {min.functions} functions under at least {min.groups} first-level functions. Walk each scenario step by step; name each function as an action (verb and object), with at least one input and one output; trace it to a capability and to the scenario that exercises it (or give the reason it is a planning function).</p>
        <Text label="Mission function (the top of the tree, an action)" value={rec.mission} onChange={(x) => edit((r) => ({ ...r, mission: x }))} testId="w4-mission" />
        <fieldset className="w4-item">
          <legend>First-level functions</legend>
          {rec.groups.map((g) => (
            <div className="w4-row" key={g.id} data-testid={`w4-${g.id}`}>
              <span className="w4-id">{g.id}</span>
              <Text label="Name (an action)" value={g.name} onChange={(x) => upd<Group>('groups', g.id, { name: x })} testId={`w4-${g.id}-name`} />
              <Remove label={g.id} onClick={() => del('groups', g.id)} />
            </div>
          ))}
          <div>
            <button type="button" className="lf-btn small" data-testid="w4-add-group" onClick={() => add('groups', 'FG', EMPTY_GROUP)}>
              Add a first-level function
            </button>
          </div>
        </fieldset>
        {rec.functions.map((f) => (
          <FnEditor key={f.id} f={f} rec={rec} groups={opt(rec.groups)} onChange={(p) => upd<Fn>('functions', f.id, p)} onRemove={() => del('functions', f.id)} />
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w4-add-function" onClick={() => add('functions', 'FN', EMPTY_FN)}>
            Add a function
          </button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 17 */}
      <Part id="w4-part-allocation" n="Part 17" title="Logical and physical architecture: allocation and decision" check={checks.allocation}>
        <p className="w4-help">At least {min.logical} logical and {min.physical} physical elements (people, procedures and facilities count). Each logical element lists the physical elements it is allocated to; each function is allocated to a logical element and to a physical element that logical element reaches, with a criterion and a sentence. Allocate every system requirement to a function or a physical element. Record at least {min.decisions} architecture decision.</p>
        <fieldset className="w4-item">
          <legend>Logical elements</legend>
          {rec.logical.map((l) => (
            <div className="w4-row" key={l.id} data-testid={`w4-${l.id}`}>
              <span className="w4-id">{l.id}</span>
              <Text label="Name" value={l.name} onChange={(x) => upd<Logical>('logical', l.id, { name: x })} testId={`w4-${l.id}-name`} />
              <Text label="What it does" value={l.text} onChange={(x) => upd<Logical>('logical', l.id, { text: x })} />
              <Text label="Allocated to (PHY IDs)" mono value={l.phys} onChange={(x) => upd<Logical>('logical', l.id, { phys: x })} testId={`w4-${l.id}-phys`} />
              <Remove label={l.id} onClick={() => del('logical', l.id)} />
            </div>
          ))}
          <div>
            <button type="button" className="lf-btn small" data-testid="w4-add-logical" onClick={() => add('logical', 'LOG', EMPTY_LOGICAL)}>
              Add a logical element
            </button>
          </div>
        </fieldset>
        <fieldset className="w4-item">
          <legend>Physical elements</legend>
          {rec.physical.map((p) => (
            <div className="w4-row" key={p.id} data-testid={`w4-${p.id}`}>
              <span className="w4-id">{p.id}</span>
              <Text label="Name" value={p.name} onChange={(x) => upd<Physical>('physical', p.id, { name: x })} testId={`w4-${p.id}-name`} />
              <Text label="Description (with counts)" value={p.text} onChange={(x) => upd<Physical>('physical', p.id, { text: x })} />
              <Text label="Requirements allocated directly (REQ IDs)" mono value={p.requirements} onChange={(x) => upd<Physical>('physical', p.id, { requirements: x })} />
              <Remove label={p.id} onClick={() => del('physical', p.id)} />
            </div>
          ))}
          <div>
            <button type="button" className="lf-btn small" data-testid="w4-add-physical" onClick={() => add('physical', 'PHY', EMPTY_PHYSICAL)}>
              Add a physical element
            </button>
          </div>
        </fieldset>
        <fieldset className="w4-item">
          <legend>External systems (producers or consumers of information outside your enterprise)</legend>
          {rec.externals.map((x) => (
            <div className="w4-row" key={x.id}>
              <span className="w4-id">{x.id}</span>
              <Text label="Name (a system, not a natural phenomenon)" value={x.name} onChange={(v) => upd<External>('externals', x.id, { name: v })} />
              <Remove label={x.id} onClick={() => del('externals', x.id)} />
            </div>
          ))}
          <div>
            <button type="button" className="lf-btn small" data-testid="w4-add-external" onClick={() => add('externals', 'EXT', EMPTY_EXTERNAL)}>
              Add an external system
            </button>
          </div>
        </fieldset>
        <div className="w4-table-wrap" role="region" aria-label="Allocation" tabIndex={0}>
          <table className="w4-table" data-testid="w4-allocation-table">
            <caption className="w4-legend text-left">Allocation: function → logical → physical, with the criterion</caption>
            <thead>
              <tr>
                <th scope="col">Function</th>
                <th scope="col">Logical</th>
                <th scope="col">Physical</th>
                <th scope="col">Criterion and justification</th>
                <th scope="col">Checks</th>
              </tr>
            </thead>
            <tbody>
              {rec.functions.map((f) => {
                const a = assessAllocation(f, rec)
                return (
                  <tr key={f.id} data-testid={`w4-alloc-${f.id}`}>
                    <th scope="row">
                      {f.id} {f.name}
                    </th>
                    <td>
                      <Select label="Logical" value={f.log} onChange={(x) => upd<Fn>('functions', f.id, { log: x })} options={opt(rec.logical)} testId={`w4-${f.id}-log`} />
                    </td>
                    <td>
                      <Select label="Physical" value={f.phy} onChange={(x) => upd<Fn>('functions', f.id, { phy: x })} options={opt(rec.physical)} testId={`w4-${f.id}-phy`} />
                    </td>
                    <td>
                      <Select label="Criterion" value={f.criterion} onChange={(x) => upd<Fn>('functions', f.id, { criterion: x as Fn['criterion'] })} options={ALLOCATION_CRITERIA.map((c) => ({ value: c.id, label: c.label }))} testId={`w4-${f.id}-criterion`} />
                      <Text label="Why this element (one sentence, naming the ID it rests on)" value={f.why} onChange={(x) => upd<Fn>('functions', f.id, { why: x })} testId={`w4-${f.id}-why`} />
                    </td>
                    <td>
                      <GateList a={a} gates={ALLOCATION_GATES} testId={`w4-gates-alloc-${f.id}`} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {rec.decisions.map((d) => (
          <fieldset key={d.id} className="w4-item" data-testid={`w4-${d.id}`}>
            <legend>
              {d.id} · architecture decision · {assessDecision(d, rec).counts ? '✓ counts' : '✗ does not count yet'}
            </legend>
            <Area label="The architecture question" value={d.question} onChange={(x) => upd<Decision>('decisions', d.id, { question: x })} testId={`w4-${d.id}-question`} />
            <div className="w4-grid">
              <Area label="Alternatives considered (one per line)" value={d.alternatives} onChange={(x) => upd<Decision>('decisions', d.id, { alternatives: x })} rows={3} testId={`w4-${d.id}-alternatives`} />
              <Text label="Chosen alternative (same wording as in the list)" value={d.chosen} onChange={(x) => upd<Decision>('decisions', d.id, { chosen: x })} testId={`w4-${d.id}-chosen`} />
              <Area label="Rationale" value={d.rationale} onChange={(x) => upd<Decision>('decisions', d.id, { rationale: x })} testId={`w4-${d.id}-rationale`} />
              <Text label="Affects (NEED, REQ, R or TPM IDs)" mono value={d.links} onChange={(x) => upd<Decision>('decisions', d.id, { links: x })} testId={`w4-${d.id}-links`} />
            </div>
            <Remove label={d.id} onClick={() => del('decisions', d.id)} />
            <GateList a={assessDecision(d, rec)} gates={DECISION_GATES} testId={`w4-gates-${d.id}`} />
          </fieldset>
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w4-add-decision" onClick={() => add('decisions', 'DEC', EMPTY_DECISION)}>
            Add an architecture decision
          </button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 18 */}
      <Part id="w4-part-information" n="Part 18" title="Information view and AI capabilities" check={checks.information}>
        <p className="w4-help">At least {min.information} information items, each with the raw data and the information made from it, its producer, its consumer and the decision it supports; at least {min.ai} AI capability card with its human oversight and failure modes.</p>
        {rec.information.map((x) => (
          <InfoEditor key={x.id} x={x} rec={rec} onChange={(p) => upd<Info>('information', x.id, p)} onRemove={() => del('information', x.id)} />
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w4-add-info" onClick={() => add('information', 'INFO', EMPTY_INFO)}>
            Add an information item
          </button>
        </div>
        {rec.ai.map((a) => (
          <fieldset key={a.id} className="w4-item" data-testid={`w4-${a.id}`}>
            <legend>
              {a.id} · AI capability · {assessAi(a, rec).counts ? '✓ counts' : '✗ does not count yet'}
            </legend>
            <div className="w4-grid">
              <Text label="Name" value={a.name} onChange={(v) => upd<AiCard>('ai', a.id, { name: v })} testId={`w4-${a.id}-name`} />
              <Select label="Hosted on" value={a.host} onChange={(v) => upd<AiCard>('ai', a.id, { host: v })} options={opt(rec.physical)} testId={`w4-${a.id}-host`} />
              <Select label="Supports the function" value={a.supports} onChange={(v) => upd<AiCard>('ai', a.id, { supports: v })} options={opt(rec.functions)} testId={`w4-${a.id}-supports`} />
              <Text label="Inputs (INFO IDs)" mono value={a.inputs} onChange={(v) => upd<AiCard>('ai', a.id, { inputs: v })} testId={`w4-${a.id}-inputs`} />
              <Text label="Outputs" value={a.outputs} onChange={(v) => upd<AiCard>('ai', a.id, { outputs: v })} testId={`w4-${a.id}-outputs`} />
              <Area label="Human oversight: who decides, what the AI may not do" value={a.oversight} onChange={(v) => upd<AiCard>('ai', a.id, { oversight: v })} testId={`w4-${a.id}-oversight`} />
              <Area label="Failure modes and their effects" value={a.failure} onChange={(v) => upd<AiCard>('ai', a.id, { failure: v })} testId={`w4-${a.id}-failure`} />
              <Text label="Data quality note" value={a.dataQuality} onChange={(v) => upd<AiCard>('ai', a.id, { dataQuality: v })} />
            </div>
            <Remove label={a.id} onClick={() => del('ai', a.id)} />
            <GateList a={assessAi(a, rec)} gates={AI_GATES} testId={`w4-gates-${a.id}`} />
          </fieldset>
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w4-add-ai" onClick={() => add('ai', 'AI', EMPTY_AI)}>
            Add an AI capability card
          </button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- consistency and AI statement */}
      <section className="w4-part" aria-labelledby="w4-cons-h" data-testid="w4-consistency">
        <div className="w4-ph">
          <h2 id="w4-cons-h">Consistency checks</h2>
        </div>
        <div className="w4-body">
          <ul className="w4-gates">
            {cons.map((c) => (
              <li key={c.check} className={c.ok ? 'w4-pass' : 'w4-fail'} data-ok={c.ok}>
                <strong>{c.ok ? '✓ pass' : '○ open'}</strong> {c.check}: {c.detail}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Part id="w4-part-ai" n="Part 6" title="AI usage statement (updated)" check={checks.ai}>
        <Area label="Tool, purpose, prompts, what you accepted or rejected and why (or: no AI tool was used)" value={rec.aiStatement} onChange={(v) => edit((r) => ({ ...r, aiStatement: v }))} rows={3} testId="w4-ai-statement" />
      </Part>
    </div>
  )
}

function FnEditor({ f, rec, groups, onChange, onRemove }: { f: Fn; rec: Week4Record; groups: { value: string; label: string }[]; onChange: (p: Partial<Fn>) => void; onRemove: () => void }) {
  const a = assessFunction(f, rec)
  return (
    <fieldset className="w4-item" data-testid={`w4-${f.id}`}>
      <legend>
        {f.id} · function · {a.counts ? '✓ counts' : '✗ does not count yet'}
      </legend>
      <div className="w4-row">
        <Text label="Function (verb and object)" value={f.name} onChange={(v) => onChange({ name: v })} testId={`w4-${f.id}-name`} />
        <Select label="Under the first-level function" value={f.group} onChange={(v) => onChange({ group: v })} options={groups} testId={`w4-${f.id}-group`} />
        <Remove label={f.id} onClick={onRemove} />
      </div>
      <div className="w4-grid">
        <Area label="Inputs (one per line)" value={f.inputs} onChange={(v) => onChange({ inputs: v })} testId={`w4-${f.id}-inputs`} />
        <Area label="Outputs (one per line)" value={f.outputs} onChange={(v) => onChange({ outputs: v })} testId={`w4-${f.id}-outputs`} />
        <Text label="Capabilities (CAP IDs)" mono value={f.capabilities} onChange={(v) => onChange({ capabilities: v })} testId={`w4-${f.id}-capabilities`} />
        <Text label="Scenarios (SCN IDs)" mono value={f.scenarios} onChange={(v) => onChange({ scenarios: v })} testId={`w4-${f.id}-scenarios`} />
        <Text label="If no scenario: why it is a planning function" value={f.planning} onChange={(v) => onChange({ planning: v })} />
        <Text label="Requirements allocated (REQ IDs)" mono value={f.requirements} onChange={(v) => onChange({ requirements: v })} testId={`w4-${f.id}-requirements`} />
        <Text label="Human operation inside it (optional)" value={f.human} onChange={(v) => onChange({ human: v })} />
      </div>
      <Check label="AI-suggested, reviewed by the team" checked={f.ai} onChange={(v) => onChange({ ai: v })} />
      <GateList a={a} gates={FUNCTION_GATES} advisories={FUNCTION_ADVISORIES} testId={`w4-gates-${f.id}`} />
    </fieldset>
  )
}

function InfoEditor({ x, rec, onChange, onRemove }: { x: Info; rec: Week4Record; onChange: (p: Partial<Info>) => void; onRemove: () => void }) {
  const a = assessInfo(x, rec)
  return (
    <fieldset className="w4-item" data-testid={`w4-${x.id}`}>
      <legend>
        {x.id} · information item · {a.counts ? '✓ counts' : '✗ does not count yet'}
      </legend>
      <div className="w4-row">
        <Text label="Name" value={x.name} onChange={(v) => onChange({ name: v })} testId={`w4-${x.id}-name`} />
        <Remove label={x.id} onClick={onRemove} />
      </div>
      <div className="w4-grid">
        <Text label="Content" value={x.content} onChange={(v) => onChange({ content: v })} testId={`w4-${x.id}-content`} />
        <Text label="Data: the raw values" value={x.data} onChange={(v) => onChange({ data: v })} testId={`w4-${x.id}-data`} />
        <Text label="Information: what the data become, in context" value={x.information} onChange={(v) => onChange({ information: v })} testId={`w4-${x.id}-information`} />
        <Text label="Producers (PHY, EXT or AI IDs)" mono value={x.producers} onChange={(v) => onChange({ producers: v })} testId={`w4-${x.id}-producers`} />
        <Text label="Consumers (PHY, EXT or AI IDs)" mono value={x.consumers} onChange={(v) => onChange({ consumers: v })} testId={`w4-${x.id}-consumers`} />
        <Area label="Decision it supports" value={x.decision} onChange={(v) => onChange({ decision: v })} testId={`w4-${x.id}-decision`} />
        <Text label="Decision belongs to (FN, REQ or DEC IDs)" mono value={x.decisionRefs} onChange={(v) => onChange({ decisionRefs: v })} testId={`w4-${x.id}-refs`} />
        <Text label="How it travels from producer to consumer" value={x.route} onChange={(v) => onChange({ route: v })} />
        <Text label="Sensitivity (none, personal, safety, commercial …)" value={x.sensitivity} onChange={(v) => onChange({ sensitivity: v })} />
      </div>
      <Check label="AI-suggested, reviewed by the team" checked={x.ai} onChange={(v) => onChange({ ai: v })} />
      <GateList a={a} gates={INFO_GATES} advisories={INFO_ADVISORIES} testId={`w4-gates-${x.id}`} />
    </fieldset>
  )
}
