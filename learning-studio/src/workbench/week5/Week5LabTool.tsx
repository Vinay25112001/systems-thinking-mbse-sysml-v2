// Week 5 lab tool (Lab L5): the team's own Week 5 Team Record, extending its Week 4 record. Rendered by the Week 5 page
// shell at #/week/5/lab/tool. Every check lives in record.ts (pure, tested both ways, with the labBrief rules the lecture
// uses); this view only edits the record and shows each Part's status with "Still needed" issues, the per-entry hard gates
// (pass or fails, with a glyph and a word, never color alone), the advisories, labeled advisory, the live N² chart with
// its degree column and the crossing-flow check with a relay field per uncovered pair. Saved in this browser (key
// w5.record) and normalized on load; exported as Markdown and JSON (week5-model-inputs v1); a teammate's JSON export can be
// imported.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadJSON, saveJSON } from '../../lib/storage'
import { downloadText } from '../download'
import { CARD_GATES, CHANGE_GATES, COMPONENT_GATES, COMPONENT_KINDS, DEGRADED_PROMPTS, INTERFACE_ADVISORIES, INTERFACE_GATES, INTERFACE_KINDS, PROTECTION_PROMPTS, REQUIREMENT_GATES } from '../../content/lectures/week05/labBrief'
import {
  EMPTY_CHANGE, EMPTY_COMPONENT, EMPTY_EXTERNAL, EMPTY_INTERFACE, EMPTY_REQUIREMENT, VERIFICATION_METHODS, W5_KEY,
  allChecks, allExternals, assessCard, assessChange, assessComponent, assessInterface, assessRequirement, boundaryReasons, cardOf, cardOwnerOf, componentsOf, countedInterfaces, crossingPairs, fileStem,
  functionsAt, gateShort, hasWork, importWeek4File, importWeek5, minimumsOf, modelInputs, n2Cell, n2Of, nameOf, neighboursOf, nextId, normalizeRecord, physicalOf, placedInterfaces, recordMarkdown, recordState,
  riskLinks, withIssued, withWeek4,
  type Assessment, type Card, type Change, type Component, type External, type IdPrefix, type Interface, type PartCheck, type Requirement, type Week5Record,
} from './record'
import './week5tool.css'

const readFile = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result ?? ''))
    fr.onerror = () => reject(fr.error)
    fr.readAsText(f)
  })

function Part({ id, n, title, check, children }: { id: string; n?: string; title: string; check: PartCheck; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} className="w5-part" data-testid={id}>
      <div className="w5-ph">
        <h2 id={`${id}-h`}>{n ? `${n} · ${title}` : title}</h2>
        <span className="w5-sp" />
        <span className={`w5-chip ${check.ok ? 'ok' : 'warn'}`}>{check.ok ? '✓ complete' : '○ incomplete'}</span>
      </div>
      <div className="w5-body">
        {children}
        <div className={`w5-note ${check.ok ? 'ok' : 'warn'}`} role="status" data-testid={`${id}-check`}>
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
    <label className="w5-field">
      <span>{label}</span>
      {children}
    </label>
  )
}
const Text = ({ label, value, onChange, mono, testId }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; testId?: string }) => (
  <Field label={label}>
    <input className={`w5-input${mono ? ' mono' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
const Area = ({ label, value, onChange, rows = 2, testId }: { label: string; value: string; onChange: (v: string) => void; rows?: number; testId?: string }) => (
  <Field label={label}>
    <textarea className="w5-textarea" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
function Select({ label, value, onChange, options, testId }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; testId?: string }) {
  return (
    <Field label={label}>
      <select className="w5-select" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId}>
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
  <label className="w5-check">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid={testId} /> {label}
  </label>
)

function GateList({ a, gates, advisories = [], testId }: { a: Assessment<string, string>; gates: readonly { id: string; short: string }[]; advisories?: readonly { id: string; short: string }[]; testId: string }) {
  return (
    <div data-testid={testId}>
      <ul className="w5-gates" aria-label="Hard gates">
        {a.gates.map((g) => (
          <li key={g.id} data-gate={g.id} data-ok={g.ok} className={g.ok ? 'w5-pass' : 'w5-fail'}>
            <strong>{g.ok ? '✓ pass' : '✗ fails'}</strong> {gateShort(gates, g.id)}: {g.message}
          </li>
        ))}
      </ul>
      {a.advisories.length > 0 && (
        <ul className="w5-gates" aria-label="Advisories">
          {a.advisories.map((x) => (
            <li key={x.id} data-advisory={x.id} className="w5-adv">
              <strong>! advisory</strong> {gateShort(advisories, x.id)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type ListKey = 'components' | 'externals' | 'interfaces' | 'requirements' | 'changes'
type Item = { id: string }

export default function Week5LabTool() {
  const [rec, setRec] = useState<Week5Record>(() => normalizeRecord(loadJSON<unknown>(W5_KEY, null)))
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => {
    saveJSON(W5_KEY, rec)
  }, [rec])
  const edit = (f: (r: Week5Record) => Week5Record) => setRec((r) => ({ ...f(r), updatedAt: Date.now() }))
  const checks = useMemo(() => allChecks(rec), [rec])
  const placed = useMemo(() => placedInterfaces(rec), [rec])
  const counted = useMemo(() => new Set(countedInterfaces(rec).map((x) => x.id)), [rec])
  const n2 = useMemo(() => n2Of(rec, placed), [rec, placed])
  const pairs = useMemo(() => crossingPairs(rec), [rec])
  const state = recordState(rec)
  const min = minimumsOf(rec)
  const w4 = rec.week4

  const add = (key: ListKey, prefix: IdPrefix, make: (id: string) => Item) =>
    edit((r) => {
      const id = nextId(r, prefix)
      return { ...r, [key]: [...(r[key] as Item[]), make(id)], issued: withIssued(r, prefix, id) }
    })
  const upd = <T extends Item>(key: ListKey, id: string, patch: Partial<T>) => edit((r) => ({ ...r, [key]: (r[key] as Item[]).map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  const del = (key: ListKey, id: string) => edit((r) => ({ ...r, [key]: (r[key] as Item[]).filter((x) => x.id !== id) }))
  const updCard = (phy: string, patch: Partial<Card>) => edit((r) => ({ ...r, cards: r.cards.some((c) => c.phy === phy) ? r.cards.map((c) => (c.phy === phy ? { ...c, ...patch } : c)) : [...r.cards, { ...cardOf(r, phy), ...patch }] }))

  async function onWeek4File(f: File | undefined) {
    if (!f) return
    const x = importWeek4File(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    edit((r) => withWeek4(r, x.snapshot))
    setMsg({ ok: true, text: `Imported the Week 4 record of ${x.snapshot.enterprise}: ${x.snapshot.physical.length} physical elements, ${x.snapshot.externals.length} external elements, ${x.snapshot.information.length} information items.` })
  }
  async function onWeek5File(f: File | undefined) {
    if (!f) return
    const x = importWeek5(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    // review n18 (A22: no silent overwrite): ask before a teammate's file replaces work already in this browser
    if (hasWork(rec) && typeof window.confirm === 'function' && !window.confirm('Replace the Week 5 record in this browser with your teammate’s file? Export yours first if you want to keep it.')) return setMsg({ ok: false, text: 'Import cancelled: your record is unchanged.' })
    setRec({ ...x, updatedAt: Date.now() })
    setMsg({ ok: true, text: `Imported the teammate’s Week 5 record (${x.components.length} components, ${x.interfaces.length} interfaces, ${x.requirements.length} interface requirements).` })
  }
  const exportMd = () => {
    downloadText(`${fileStem(rec)}-record.md`, recordMarkdown(rec))
    setRec((r) => ({ ...r, exportedMdAt: Date.now() }))
  }
  const exportJson = () => {
    downloadText(`${fileStem(rec)}-model-inputs.json`, JSON.stringify(modelInputs(rec), null, 2), 'application/json')
    setRec((r) => ({ ...r, exportedJsonAt: Date.now() }))
  }

  const phys = physicalOf(rec)
  const exts = allExternals(rec)
  const endOptions = [
    ...phys.map((p) => ({ value: p.id, label: `${p.id} ${p.name}` })),
    ...rec.components.map((c) => ({ value: c.id, label: `${c.id} ${c.name} (in ${c.parent || '?'})` })),
    ...exts.map((x) => ({ value: x.id, label: `${x.id} ${x.name} (external)` })),
    ...(w4?.ai ?? []).map((a) => ({ value: a.id, label: `${a.id} ${a.name} (AI, at ${a.host})` })),
  ]
  const ifOptions = rec.interfaces.map((x) => ({ value: x.id, label: `${x.id} ${x.name}` }))
  const links = riskLinks(rec)
  const label = (id: string) => `${id}${nameOf(rec, id) ? ` ${nameOf(rec, id)}` : ''}`

  return (
    <div className="w5-tool" data-testid="w5-tool">
      <div className="w5-head">
        <h1>Lab L5 tool: your Week 5 Team Record</h1>
        <span className={`w5-chip ${state === 'ready' ? 'ok' : 'warn'}`} data-testid="w5-state">
          {state === 'ready' ? '✓ ready: every part complete' : '○ not ready'}
        </span>
        <span className="w5-sp" />
        <div className="w5-btn-row">
          <button type="button" className="lf-btn small primary" onClick={exportMd} data-testid="w5-export-md">
            Export the record (.md)
          </button>
          <button type="button" className="lf-btn small" onClick={exportJson} data-testid="w5-export-json">
            Export the model inputs (.json)
          </button>
        </div>
      </div>
      <p className="w5-help">Your team’s own enterprise, never AeroLink. Each part is checked as you type; saved in this browser only, so export after every working session. A teammate can import the JSON file to continue the same record.</p>
      <Field label="Import a teammate’s Week 5 model-inputs file (.json): replaces the record in this browser">
        <input type="file" accept=".json,application/json" className="w5-file" data-testid="w5-import-week5" onChange={(e) => void onWeek5File(e.target.files?.[0])} />
      </Field>
      {msg && (
        <div className={`w5-note ${msg.ok ? 'ok' : 'warn'}`} role="status" data-testid="w5-message">
          {msg.ok ? '✓ ' : '✗ '}
          {msg.text}
        </div>
      )}

      {/* ---------------------------------------------------------------- 0: Week 4 import */}
      <Part id="w5-part-import" title="Start from your Week 4 Team Record" check={checks.import}>
        <p className="w5-help">The Week 5 record extends the Week 4 record as returned with feedback: its physical elements are level 1 of the breakdown, its external elements and information routes are where the interfaces come from, and its requirements and risks are what the interface requirements and risk links trace to.</p>
        <Field label="Week 4 model-inputs file (team-NN-week4-model-inputs.json)">
          <input type="file" accept=".json,application/json" className="w5-file" data-testid="w5-import-week4" onChange={(e) => void onWeek4File(e.target.files?.[0])} />
        </Field>
        {w4 && (
          <p className="m-0" data-testid="w5-week4-summary">
            Team <strong>{w4.team || '—'}</strong> · enterprise <strong>{w4.enterprise}</strong> · {w4.physical.length} physical elements · {w4.externals.length} external elements · {w4.information.length} information items · {w4.ai.length} AI capabilities
          </p>
        )}
        <Check label="Three-person team: reduced minimums (pending faculty approval)" checked={rec.threePersonTeam} onChange={(v) => edit((r) => ({ ...r, threePersonTeam: v }))} />
      </Part>

      {/* ---------------------------------------------------------------- Part 19 */}
      <Part id="w5-part-breakdown" n="Part 19" title="Component breakdown and responsibility cards" check={checks.breakdown}>
        <p className="w5-help">At least {min.components} components, counting each Week 4 physical element (level 1) with a complete responsibility card and each level-2 component that passes its gates. A component may be hardware, software, data, people, a procedure or a facility; one word is enough for a name. The functions on each card come from your Week 4 allocation.</p>
        {phys.map((p) => {
          const c = cardOf(rec, p.id)
          return (
            <fieldset key={p.id} className="w5-item" data-testid={`w5-card-${p.id}`}>
              <legend>
                {p.id} {p.name} · responsibility card · {assessCard(c).counts ? '✓ complete' : '✗ incomplete'}
              </legend>
              <div className="w5-grid">
                <Area label="Responsibility" value={c.responsibility} onChange={(v) => updCard(p.id, { responsibility: v })} testId={`w5-card-${p.id}-responsibility`} />
                <Text label="Owner (organization)" value={c.owner} onChange={(v) => updCard(p.id, { owner: v })} testId={`w5-card-${p.id}-owner`} />
              </div>
              <p className="w5-help">
                Functions (Week 4 allocation): {functionsAt(rec, p.id).join(', ') || 'none'} · level-2 components: {componentsOf(rec, p.id).map((x) => x.id).join(', ') || 'none'}
              </p>
              <GateList a={assessCard(c)} gates={CARD_GATES} testId={`w5-gates-card-${p.id}`} />
            </fieldset>
          )
        })}
        {rec.components.map((c) => (
          <fieldset key={c.id} className="w5-item" data-testid={`w5-${c.id}`}>
            <legend>
              {c.id} · component · {assessComponent(c, rec).counts ? '✓ counts' : '✗ does not count yet'}
            </legend>
            <div className="w5-grid">
              <Text label="Name" value={c.name} onChange={(v) => upd<Component>('components', c.id, { name: v })} testId={`w5-${c.id}-name`} />
              <Select label="Part of (Week 4 physical element)" value={c.parent} onChange={(v) => upd<Component>('components', c.id, { parent: v })} options={phys.map((p) => ({ value: p.id, label: `${p.id} ${p.name}` }))} testId={`w5-${c.id}-parent`} />
              <Select label="Kind" value={c.kind} onChange={(v) => upd<Component>('components', c.id, { kind: v as Component['kind'] })} options={COMPONENT_KINDS.map((k) => ({ value: k.id, label: k.label }))} testId={`w5-${c.id}-kind`} />
              <Area label="Responsibility" value={c.responsibility} onChange={(v) => upd<Component>('components', c.id, { responsibility: v })} testId={`w5-${c.id}-responsibility`} />
              <Text label="Functions it carries (FN IDs; optional)" mono value={c.functions} onChange={(v) => upd<Component>('components', c.id, { functions: v })} />
            </div>
            <Check label="AI-suggested, reviewed by the team" checked={c.ai} onChange={(v) => upd<Component>('components', c.id, { ai: v })} />
            <Remove label={c.id} onClick={() => del('components', c.id)} />
            <GateList a={assessComponent(c, rec)} gates={COMPONENT_GATES} testId={`w5-gates-${c.id}`} />
          </fieldset>
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w5-add-component" onClick={() => add('components', 'CMP', (id) => EMPTY_COMPONENT(id))}>
            Add a level-2 component
          </button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 20 */}
      <Part id="w5-part-interfaces" n="Part 20" title="N² chart and interface definitions" check={checks.interfaces}>
        <p className="w5-help">At least {min.interfaces} interfaces that pass every hard gate. An end may be a physical element, a component, an external element (a person group or an outside service is fine) or an AI capability, which stands at its host element. Every external element needs an interface or a reason it has none, and every Week 4 information route between two elements must ride an information interface, directly or by a relay.</p>
        <fieldset className="w5-item" data-testid="w5-externals">
          <legend>External elements</legend>
          {exts.map((x) => {
            const added = rec.externals.some((y) => y.id === x.id)
            return (
              <div className="w5-row" key={x.id} data-testid={`w5-${x.id}`}>
                <span className="w5-id">{x.id}</span>
                {added ? <Text label="Name (added this week)" value={x.name} onChange={(v) => upd<External>('externals', x.id, { name: v })} testId={`w5-${x.id}-name`} /> : <span>{x.name} (from Week 4)</span>}
                <span className="w5-help">{n2.degrees[x.id] ?? 0} interfaces</span>
                <Text label="If it has no interface: the reason" value={rec.externalReasons[x.id] ?? ''} onChange={(v) => edit((r) => ({ ...r, externalReasons: { ...r.externalReasons, [x.id]: v } }))} testId={`w5-${x.id}-reason`} />
                {added && <Remove label={x.id} onClick={() => del('externals', x.id)} />}
              </div>
            )
          })}
          <div>
            <button type="button" className="lf-btn small" data-testid="w5-add-external" onClick={() => add('externals', 'EXT', EMPTY_EXTERNAL)}>
              Add an external element
            </button>
          </div>
        </fieldset>
        {rec.interfaces.map((x) => (
          <InterfaceEditor key={x.id} x={x} rec={rec} endOptions={endOptions} onChange={(p) => upd<Interface>('interfaces', x.id, p)} onRemove={() => del('interfaces', x.id)} />
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w5-add-interface" onClick={() => add('interfaces', 'IF', EMPTY_INTERFACE)}>
            Add an interface
          </button>
        </div>
        <div className="w5-table-wrap" role="region" aria-label="N² chart" tabIndex={0}>
          <table className="w5-table w5-n2" data-testid="w5-n2">
            <caption className="w5-legend text-left">
              N² chart: each cell lists the interfaces joining the row and column elements (symmetric; components shown at their parent, AI capabilities at their host). Interfaces marked ○ do not count yet. Degree sum {n2.degreeSum} = 2 × {n2.interfaces} interfaces.
            </caption>
            <thead>
              <tr>
                <td />
                {n2.elements.map((e) => (
                  <th key={e} scope="col" title={nameOf(rec, e)}>
                    {e}
                  </th>
                ))}
                <th scope="col">Degree</th>
              </tr>
            </thead>
            <tbody>
              {n2.elements.map((a) => (
                <tr key={a}>
                  <th scope="row">{label(a)}</th>
                  {n2.elements.map((b) => {
                    const ids = n2Cell(n2, a, b)
                    return (
                      <td key={b} className={a === b ? 'w5-diag' : undefined} data-cell={`${a}|${b}`}>
                        {a === b && !ids.length ? <span title="diagonal">■</span> : ids.map((id) => <div key={id} className={counted.has(id) ? undefined : 'w5-pending'}>{counted.has(id) ? id : `${id} ○`}</div>)}
                      </td>
                    )
                  })}
                  <td data-degree={a}>{n2.degrees[a]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="w5-help">
          Shown: {n2.counts.physical} physical, {n2.counts.information} information, {n2.counts.organizational} organizational; external: {n2.counts.external.join(', ') || 'none'}.
        </p>
        <fieldset className="w5-item" data-testid="w5-crossing">
          <legend>Crossing-flow check: every Week 4 information route between two different elements</legend>
          {!pairs.length && <p className="w5-help">No Week 4 information item crosses between two different elements.</p>}
          <ul className="w5-gates">
            {pairs.map((p) => {
              const ok = p.status === 'direct' || p.status === 'relay'
              return (
                <li key={p.key} className={`w5-relay ${ok ? 'w5-pass' : 'w5-fail'}`} data-pair={p.key} data-ok={ok}>
                  <span>
                    <strong>{ok ? '✓ pass' : '✗ fails'}</strong> {p.info} {p.infoName}, {p.from} → {p.to}: {p.message}
                  </span>
                  {p.status !== 'direct' && <Text label="Relay: the IF IDs in order, from producer to consumer" mono value={p.relay} onChange={(v) => edit((r) => ({ ...r, relays: { ...r.relays, [p.key]: v } }))} testId={`w5-relay-${p.key}`} />}
                </li>
              )
            })}
          </ul>
        </fieldset>
      </Part>

      {/* ---------------------------------------------------------------- Part 21 */}
      <Part id="w5-part-requirements" n="Part 21" title="Interface requirements" check={checks.requirements}>
        <p className="w5-help">At least {min.requirements} interface requirements written by the three steps (the boundary, then what crosses it and the medium, then the requirement), one per external interface where you can. IDs continue after your highest system requirement and are never reused.</p>
        {rec.requirements.map((q) => (
          <fieldset key={q.id} className="w5-item" data-testid={`w5-${q.id}`}>
            <legend>
              {q.id} · interface requirement · {assessRequirement(q, rec).counts ? '✓ counts' : '✗ does not count yet'}
            </legend>
            <div className="w5-grid">
              <Text label="Name" value={q.name} onChange={(v) => upd<Requirement>('requirements', q.id, { name: v })} testId={`w5-${q.id}-name`} />
              <Select label="Interface it governs" value={q.interface} onChange={(v) => upd<Requirement>('requirements', q.id, { interface: v })} options={ifOptions} testId={`w5-${q.id}-interface`} />
              <Area label="Statement (one “shall”)" value={q.statement} onChange={(v) => upd<Requirement>('requirements', q.id, { statement: v })} testId={`w5-${q.id}-statement`} />
              <Text label="Verification criterion (a value, or a TBD with an owner)" value={q.criterion} onChange={(v) => upd<Requirement>('requirements', q.id, { criterion: v })} testId={`w5-${q.id}-criterion`} />
              <Select label="Method" value={q.method} onChange={(v) => upd<Requirement>('requirements', q.id, { method: v as Requirement['method'] })} options={VERIFICATION_METHODS.map((m) => ({ value: m, label: m }))} testId={`w5-${q.id}-method`} />
              <Text label="Parents (NEED, CAP or REQ IDs)" mono value={q.parents} onChange={(v) => upd<Requirement>('requirements', q.id, { parents: v })} testId={`w5-${q.id}-parents`} />
              <Text label="Rationale (optional)" value={q.rationale} onChange={(v) => upd<Requirement>('requirements', q.id, { rationale: v })} />
            </div>
            <Check label="AI-suggested, reviewed by the team" checked={q.ai} onChange={(v) => upd<Requirement>('requirements', q.id, { ai: v })} />
            <Remove label={q.id} onClick={() => del('requirements', q.id)} />
            <GateList a={assessRequirement(q, rec)} gates={REQUIREMENT_GATES} testId={`w5-gates-${q.id}`} />
          </fieldset>
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w5-add-requirement" onClick={() => add('requirements', 'REQ', (id) => EMPTY_REQUIREMENT(id))}>
            Add an interface requirement
          </button>
        </div>
      </Part>

      {/* ---------------------------------------------------------------- Part 22 */}
      <Part id="w5-part-management" n="Part 22" title="Interface management, security and resilience" check={checks.management}>
        <p className="w5-help">Name the interface control working group (one organization per line), the standards that apply (or “none” with the reason), at least {min.changeRequests} change request traced through the N², and link at least {min.riskLinks} interfaces to risks in your register, one of them a security or resilience risk.</p>
        <div className="w5-grid">
          <Area label="Interface control working group: one organization per line" value={rec.icwg} onChange={(v) => edit((r) => ({ ...r, icwg: v }))} rows={3} testId="w5-icwg" />
          <Area label="Standards that apply (or none, with the reason)" value={rec.standards} onChange={(v) => edit((r) => ({ ...r, standards: v }))} testId="w5-standards" />
        </div>
        <p className="w5-help" data-testid="w5-risk-links">
          Interfaces linked to register risks: {links.linked.join(', ') || 'none'} · security or resilience risks linked: {links.securityOrResilience.join(', ') || 'none'} (link risks in each interface’s “Risks” field).
        </p>
        {rec.changes.map((x) => (
          <fieldset key={x.id} className="w5-item" data-testid={`w5-${x.id}`}>
            <legend>
              {x.id} · interface change request · {assessChange(x, rec).counts ? '✓ counts' : '✗ does not count yet'}
            </legend>
            <div className="w5-grid">
              <Select label="Interface it changes" value={x.interface} onChange={(v) => upd<Change>('changes', x.id, { interface: v })} options={ifOptions} testId={`w5-${x.id}-interface`} />
              <Area label="The change" value={x.change} onChange={(v) => upd<Change>('changes', x.id, { change: v })} testId={`w5-${x.id}-change`} />
              <Text label="Impact (IF, PHY, EXT, CMP or REQ IDs)" mono value={x.impact} onChange={(v) => upd<Change>('changes', x.id, { impact: v })} testId={`w5-${x.id}-impact`} />
              <Area label="Decision" value={x.decision} onChange={(v) => upd<Change>('changes', x.id, { decision: v })} testId={`w5-${x.id}-decision`} />
              <Text label="Decided by" value={x.decider} onChange={(v) => upd<Change>('changes', x.id, { decider: v })} testId={`w5-${x.id}-decider`} />
            </div>
            <p className="w5-help" data-testid={`w5-${x.id}-neighbours`}>
              Suggestion from the N² (interfaces sharing an end with {x.interface || 'the chosen interface'}): {neighboursOf(rec, x.interface).join(', ') || 'none'}
            </p>
            <Remove label={x.id} onClick={() => del('changes', x.id)} />
            <GateList a={assessChange(x, rec)} gates={CHANGE_GATES} testId={`w5-gates-${x.id}`} />
          </fieldset>
        ))}
        <div>
          <button type="button" className="lf-btn small" data-testid="w5-add-change" onClick={() => add('changes', 'ICR', EMPTY_CHANGE)}>
            Add a change request
          </button>
        </div>
      </Part>

      <Part id="w5-part-ai" n="Part 6" title="AI usage statement (updated)" check={checks.ai}>
        <Area label="Tool, purpose, prompts, what you accepted or rejected and why (or: no AI tool was used)" value={rec.aiStatement} onChange={(v) => edit((r) => ({ ...r, aiStatement: v }))} rows={3} testId="w5-ai-statement" />
      </Part>
    </div>
  )
}

function InterfaceEditor({ x, rec, endOptions, onChange, onRemove }: { x: Interface; rec: Week5Record; endOptions: { value: string; label: string }[]; onChange: (p: Partial<Interface>) => void; onRemove: () => void }) {
  const a = assessInterface(x, rec)
  const reasons = boundaryReasons(x, rec)
  const hintA = cardOwnerOf(rec, x.endA)
  const hintB = cardOwnerOf(rec, x.endB)
  return (
    <fieldset className="w5-item" data-testid={`w5-${x.id}`}>
      <legend>
        {x.id} · interface · {a.counts ? '✓ counts' : '✗ does not count yet'}
        {reasons.length ? ` · crosses a trust boundary (${reasons.join(', ')})` : ''}
      </legend>
      <div className="w5-row">
        <Text label="Name" value={x.name} onChange={(v) => onChange({ name: v })} testId={`w5-${x.id}-name`} />
        <Select label="Kind" value={x.kind} onChange={(v) => onChange({ kind: v as Interface['kind'] })} options={INTERFACE_KINDS.map((k) => ({ value: k.id, label: `${k.label}: ${k.crosses}` }))} testId={`w5-${x.id}-kind`} />
        <Remove label={x.id} onClick={onRemove} />
      </div>
      <div className="w5-grid">
        <Select label="End A" value={x.endA} onChange={(v) => onChange({ endA: v })} options={endOptions} testId={`w5-${x.id}-endA`} />
        <Select label="End B" value={x.endB} onChange={(v) => onChange({ endB: v })} options={endOptions} testId={`w5-${x.id}-endB`} />
        <Text label="What crosses (words or INFO IDs)" value={x.crosses} onChange={(v) => onChange({ crosses: v })} testId={`w5-${x.id}-crosses`} />
        <Text label="Direction (for example PHY-001 → PHY-004; none for an agreement)" value={x.direction} onChange={(v) => onChange({ direction: v })} testId={`w5-${x.id}-direction`} />
        <Text label="Medium or carrier" value={x.medium} onChange={(v) => onChange({ medium: v })} testId={`w5-${x.id}-medium`} />
        <Text label="Constraint" value={x.constraint} onChange={(v) => onChange({ constraint: v })} testId={`w5-${x.id}-constraint`} />
        <Text label="Requirements (REQ IDs)" mono value={x.requirements} onChange={(v) => onChange({ requirements: v })} testId={`w5-${x.id}-requirements`} />
        <Text label={`Owner of end A${hintA ? ` (card: ${hintA})` : ''}`} value={x.ownerA} onChange={(v) => onChange({ ownerA: v })} testId={`w5-${x.id}-ownerA`} />
        <Text label={`Owner of end B${hintB ? ` (card: ${hintB})` : ''}`} value={x.ownerB} onChange={(v) => onChange({ ownerB: v })} testId={`w5-${x.id}-ownerB`} />
        <Text label="Verification (method and when)" value={x.verification} onChange={(v) => onChange({ verification: v })} testId={`w5-${x.id}-verification`} />
        <Text label="Standard (optional)" value={x.standard} onChange={(v) => onChange({ standard: v })} />
        <Text label="Risks (R IDs)" mono value={x.risks} onChange={(v) => onChange({ risks: v })} testId={`w5-${x.id}-risks`} />
      </div>
      <Check label="An end accepts input from the public, or the medium is radio or a network we may not own" checked={x.exposed} onChange={(v) => onChange({ exposed: v })} testId={`w5-${x.id}-exposed`} />
      <div className="w5-grid">
        <Area label={`Protection (prompts: ${PROTECTION_PROMPTS.slice(0, 3).join('; ')} …)`} value={x.protection} onChange={(v) => onChange({ protection: v })} testId={`w5-${x.id}-protection`} />
        <Text label="Or: why it needs no protection" value={x.noProtectionReason} onChange={(v) => onChange({ noProtectionReason: v })} testId={`w5-${x.id}-noProtection`} />
        <Area label={`Degraded mode: what each side does when it fails (for example: ${DEGRADED_PROMPTS[0]})`} value={x.degraded} onChange={(v) => onChange({ degraded: v })} testId={`w5-${x.id}-degraded`} />
      </div>
      <Check label="AI-suggested, reviewed by the team" checked={x.ai} onChange={(v) => onChange({ ai: v })} />
      <GateList a={a} gates={INTERFACE_GATES} advisories={INTERFACE_ADVISORIES} testId={`w5-gates-${x.id}`} />
    </fieldset>
  )
}
