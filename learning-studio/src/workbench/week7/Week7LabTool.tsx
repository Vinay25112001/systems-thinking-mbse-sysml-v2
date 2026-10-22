// Week 7 package tool (Lab L7): the team's Systems Thinking Engineering Package, assembled from its six weekly exports.
// Rendered by the Week 7 page shell at #/week/7/lab/tool. Every check lives in record.ts (pure, tested both ways, with the
// labBrief rules the lecture uses); this view only loads the exports, shows the package index, the coverage per trace layer
// and every finding the audit computes with its disposition, and edits the executive summary, the review preparation and
// the RIDs received. Each gate is shown pass or fails with a glyph and a word (never color alone); advisories are labeled
// advisory. Saved in this browser (key w7.package); exported as Markdown (the package index and readiness report) and as
// the week7-package v1 JSON; a teammate's package replaces the record only after a confirmation (A22). Template:
// src/workbench/week6/Week6LabTool.tsx.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadJSON, saveJSON } from '../../lib/storage'
import { downloadText } from '../download'
import {
  DEFER_WEEKS, DISPOSITIONS, EMPTY_ANSWER_RULE, FINDING_ADVISORIES, FINDING_GATES, FINDING_KINDS, IDENTITY_RULE, PACKAGE_SECTIONS, PREP_GATES, PREP_ADVISORIES, RID_ADVISORIES, RID_DISPOSITIONS, RID_GATES, SEVERITIES, SOURCE_ADVISORIES, SOURCE_GATES, SOURCE_WEEKS, SUMMARY_GATES,
  type SectionId,
} from '../../content/lectures/week07/labBrief'
import {
  EMPTY_RID, W7_KEY, allChecks, assessFindingIn, assessPrep, assessRid, assessSources, assessSummary, decisionOptions, dispositionOf, fileStem, hasWork, importPackage, needOptions, nextRid, normalizePackage, packageJson, packageMarkdown,
  packageOf, packageState, threadOf, withSource,
  type Assessment, type Disposition, type PartCheck, type Rid, type Summary, type Week7Record,
} from './record'
import './week7tool.css'

const readFile = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result ?? ''))
    fr.onerror = () => reject(fr.error)
    fr.readAsText(f)
  })

function Part({ id, n, title, check, children }: { id: string; n?: string; title: string; check: PartCheck; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} className="w7-part" data-testid={id}>
      <div className="w7-ph">
        <h2 id={`${id}-h`}>{n ? `${n} · ${title}` : title}</h2>
        <span className="w7-sp" />
        <span className={`w7-chip ${check.ok ? 'ok' : 'warn'}`}>{check.ok ? '✓ complete' : '○ incomplete'}</span>
      </div>
      <div className="w7-body">
        {children}
        <div className={`w7-note ${check.ok ? 'ok' : 'warn'}`} role="status" data-testid={`${id}-check`}>
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
                {check.notes.map((x) => (
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
    <label className="w7-field">
      <span>{label}</span>
      {children}
    </label>
  )
}
const Text = ({ label, value, onChange, mono, testId }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean; testId?: string }) => (
  <Field label={label}>
    <input className={`w7-input${mono ? ' mono' : ''}`} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
const Area = ({ label, value, onChange, rows = 2, testId }: { label: string; value: string; onChange: (v: string) => void; rows?: number; testId?: string }) => (
  <Field label={label}>
    <textarea className="w7-textarea" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} />
  </Field>
)
function Select({ label, value, onChange, options, testId, none = 'Choose…' }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; testId?: string; none?: string }) {
  return (
    <Field label={label}>
      <select className="w7-select" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId}>
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
function GateList({ a, gates, advisories = [], testId }: { a: Assessment<string, string>; gates: readonly { id: string; short: string }[]; advisories?: readonly { id: string; short: string }[]; testId: string }) {
  const short = (list: readonly { id: string; short: string }[], id: string) => list.find((g) => g.id === id)?.short ?? id
  return (
    <div data-testid={testId}>
      <ul className="w7-gates" aria-label="Hard gates">
        {a.gates.map((g) => (
          <li key={g.id} data-gate={g.id} data-ok={g.ok} className={g.ok ? 'w7-pass' : 'w7-fail'}>
            <strong>{g.ok ? '✓ pass' : '✗ fails'}</strong> {short(gates, g.id)}: {g.message}
          </li>
        ))}
      </ul>
      {a.advisories.length > 0 && (
        <ul className="w7-gates" aria-label="Advisories">
          {a.advisories.map((x) => (
            <li key={x.id} data-advisory={x.id} className="w7-adv">
              <strong>! advisory</strong> {x.message || short(advisories, x.id)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
const STATE_TEXT = { 'not-ready': '○ not ready for review', 'ready-for-review': '✓ ready for review: the entry criteria are met', 'review-closed': '✓ review closed: every RID dispositioned' } as const
const SUMMARY_FIELDS: { key: keyof Summary; label: string; area?: boolean }[] = [
  { key: 'recommendation', label: 'Recommendation: what you ask the reviewer to approve', area: true },
  { key: 'evidence', label: 'Why: the evidence, cited by ID', area: true },
  { key: 'conditions', label: 'Conditions: what must stay true', area: true },
  { key: 'residual', label: 'Residual risk: what remains, by R ID' },
  { key: 'decisions', label: 'Decisions needed from the reviewer', area: true },
  { key: 'next', label: 'Next: the roadmap increment that comes next (INC ID)' },
]

export default function Week7LabTool() {
  const [rec, setRec] = useState<Week7Record>(() => normalizePackage(loadJSON<unknown>(W7_KEY, null)))
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  useEffect(() => {
    saveJSON(W7_KEY, rec)
  }, [rec])
  const edit = (f: (r: Week7Record) => Week7Record) => setRec((r) => ({ ...f(r), updatedAt: Date.now() }))
  const pkg = useMemo(() => packageOf(rec), [rec])
  const checks = useMemo(() => allChecks(rec), [rec])
  const state = packageState(rec)
  const src = assessSources(rec, pkg)
  const thread = rec.threadNeed ? threadOf(pkg, rec.threadNeed) : null

  async function onSources(files: FileList | null) {
    if (!files?.length) return
    const ok: string[] = []
    const bad: string[] = []
    let next = rec
    for (const f of Array.from(files)) {
      const x = withSource(next, await readFile(f))
      if ('error' in x) bad.push(`${f.name}: ${x.error}`)
      else {
        next = x.record
        ok.push(`Week ${x.loaded.week}`)
      }
    }
    if (ok.length) setRec({ ...next, updatedAt: Date.now() })
    setMsg({ ok: !bad.length, text: [ok.length ? `Loaded ${ok.join(', ')}.` : '', ...bad].filter(Boolean).join(' ') })
  }
  async function onPackage(f: File | undefined) {
    if (!f) return
    const x = importPackage(await readFile(f))
    if ('error' in x) return setMsg({ ok: false, text: x.error })
    if (hasWork(rec) && typeof window.confirm === 'function' && !window.confirm('Replace the Week 7 package in this browser with your teammate’s file? Export yours first if you want to keep it.')) return setMsg({ ok: false, text: 'Import cancelled: your package is unchanged.' })
    setRec({ ...x, updatedAt: Date.now() })
    setMsg({ ok: true, text: `Imported the teammate’s Week 7 package (${Object.keys(x.sources).length} weekly exports, ${x.rids.length} RIDs).` })
  }
  const setDisp = (key: string, cur: Disposition, patch: Partial<Disposition>) => edit((r) => ({ ...r, dispositions: { ...r.dispositions, [key]: { disposition: cur.disposition, reason: cur.reason, owner: cur.owner, week: cur.week, ...patch } } }))
  const updRid = (id: string, patch: Partial<Rid>) => edit((r) => ({ ...r, rids: r.rids.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  const addRid = () =>
    edit((r) => {
      const id = nextRid(r)
      return { ...r, rids: [...r.rids, EMPTY_RID(id)], issued: { RID: Number(id.slice(4)) } }
    })
  const exportMd = () => {
    downloadText(`${fileStem(rec)}.md`, packageMarkdown(rec))
    setRec((r) => ({ ...r, exportedMdAt: Date.now() }))
  }
  const exportJson = () => {
    downloadText(`${fileStem(rec)}.json`, JSON.stringify(packageJson(rec), null, 2), 'application/json')
    setRec((r) => ({ ...r, exportedJsonAt: Date.now() }))
  }
  const prep = assessPrep(rec, pkg)

  return (
    <div className="w7-tool" data-testid="w7-tool">
      <div className="w7-head">
        <h1>Lab L7 tool: your Systems Thinking Engineering Package</h1>
        <span className={`w7-chip ${state === 'not-ready' ? 'warn' : 'ok'}`} data-testid="w7-state">
          {STATE_TEXT[state]}
        </span>
        <span className="w7-sp" />
        <div className="w7-btn-row">
          <button type="button" className="lf-btn small primary" onClick={exportMd} data-testid="w7-export-md">
            Export the package index and readiness report (.md)
          </button>
          <button type="button" className="lf-btn small" onClick={exportJson} data-testid="w7-export-json">
            Export the package (.json)
          </button>
        </div>
      </div>
      <p className="w7-help">Your team’s own enterprise, never AeroLink. The package is assembled from your six weekly exports; every finding is computed from them. Saved in this browser only, so export after every working session. A teammate can import the package file to continue the same work.</p>
      <p className="w7-help" data-testid="w7-empty-answer-rule">{EMPTY_ANSWER_RULE}</p>
      <Field label="Import a teammate’s Week 7 package (.json): replaces the package in this browser after you confirm">
        <input type="file" accept=".json,application/json" className="w7-file" data-testid="w7-import-package" onChange={(e) => void onPackage(e.target.files?.[0])} />
      </Field>
      {msg && (
        <div className={`w7-note ${msg.ok ? 'ok' : 'warn'}`} role="status" data-testid="w7-message">
          {msg.ok ? '✓ ' : '✗ '}
          {msg.text}
        </div>
      )}

      <Part id="w7-part-sources" n="Part 28" title="Package sources and index" check={checks.sources}>
        <p className="w7-help">Add the model-inputs file of every week, from Week 1 to Week 6 (several at once is fine). Each file is read by its own week’s importer; a week added again replaces only that week. To fix a finding below, correct the record in that week’s lab tool, export it again and add the new file here.</p>
        <Field label="Add your weekly exports (team-NN-…-model-inputs.json, Weeks 1–6)">
          <input type="file" multiple accept=".json,application/json" className="w7-file" data-testid="w7-import" onChange={(e) => void onSources(e.target.files)} />
        </Field>
        <div className="w7-table-wrap" tabIndex={0} role="region" aria-label="Table: the weekly exports in the package">
          <table className="w7-table" data-testid="w7-sources-summary">
            <caption>The six weekly exports: which are loaded, and the status each week’s own tool gave its record.</caption>
            <thead>
              <tr>
                <th scope="col">Week</th>
                <th scope="col">Content</th>
                <th scope="col">Loaded</th>
                <th scope="col">Status at export</th>
              </tr>
            </thead>
            <tbody>
              {SOURCE_WEEKS.map((w) => {
                const l = pkg.loaded[w.week]
                return (
                  <tr key={w.week} data-testid={`w7-source-${w.week}`}>
                    <th scope="row">Week {w.week}</th>
                    <td>{w.title}</td>
                    <td>{l ? '✓ loaded' : '✗ not loaded'}</td>
                    <td>{l ? l.status || 'none' : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {pkg.enterprise && (
          <p className="m-0">
            Enterprise <strong>{pkg.enterprise}</strong> · team <strong>{pkg.team || '—'}</strong> · {pkg.index.size} IDs in the package index · {pkg.relationships.length} typed relationships
          </p>
        )}
        <GateList a={src} gates={SOURCE_GATES} advisories={SOURCE_ADVISORIES} testId="w7-gates-sources" />
      </Part>

      <Part id="w7-part-audit" n="Part 29" title="Consistency and trace audit, with dispositions" check={checks.audit}>
        <p className="w7-help">Coverage per trace layer, then every finding the audit computed. Each finding leaves the audit one of three ways. Corrected and re-imported: fix it in the week’s own tool and add the new export, and the finding disappears; that is the only proof of a correction, so a rationale such as “Fixed”, “Resolved” or “Withdrawn” is refused while the finding is still found. Accept, with a rationale that cites its evidence (an ID in the package, or the week whose record holds it). Or defer to a Phase II week, with an owner (status: open). A collision cannot be accepted.</p>
        <p className="w7-help" data-testid="w7-identity-rule">Identity rule: {IDENTITY_RULE}</p>
        {pkg.missing.length > 0 && Object.keys(pkg.loaded).length > 0 && (
          <p className="w7-note warn" role="note" data-testid="w7-provisional">
            Provisional: Week {pkg.missing.join(', Week ')} not loaded. Findings that depend on a missing week are hidden until it is added.
          </p>
        )}
        <div className="w7-table-wrap" tabIndex={0} role="region" aria-label="Table: coverage per trace layer">
          <table className="w7-table" data-testid="w7-coverage">
            <caption>Coverage per trace layer, computed from the package: how many items have their link, and which do not.</caption>
            <thead>
              <tr>
                <th scope="col">Layer</th>
                <th scope="col">Covered</th>
                <th scope="col">Coverage</th>
                <th scope="col">Not covered</th>
              </tr>
            </thead>
            <tbody>
              {pkg.coverage.map((c) => (
                <tr key={c.id} data-layer={c.id}>
                  <th scope="row">{c.label}</th>
                  <td>
                    {c.covered} of {c.total}
                  </td>
                  <td>{c.total ? `${c.pct} %` : '—'}</td>
                  <td>{c.uncovered.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div data-testid="w7-findings">
          {!pkg.findings.length && <p className="w7-help">{Object.keys(pkg.loaded).length ? 'No findings: the audit found nothing to disposition.' : 'Add your exports to run the audit.'}</p>}
          {pkg.findings.map((f, i) => {
            const d = dispositionOf(rec, f)
            const a = assessFindingIn(rec, f, pkg)
            const kind = FINDING_KINDS.find((k) => k.id === f.kind)!
            return (
              <fieldset key={f.key} className="w7-item" data-testid={`w7-finding-${i}`} data-key={f.key}>
                <legend>
                  {kind.label} · {a.counts ? '✓ dispositioned' : '✗ needs a disposition'}
                </legend>
                <p className="m-0">{f.text}</p>
                <p className="w7-help m-0">{kind.basis}</p>
                <div className="w7-row">
                  <Select label="Disposition" value={d.disposition} onChange={(v) => setDisp(f.key, d, { disposition: v as Disposition['disposition'] })} options={DISPOSITIONS.map((x) => ({ value: x.id, label: x.label }))} testId={`w7-finding-${i}-disposition`} />
                  <Text label={d.disposition === 'defer' ? 'Rationale' : 'Rationale, with its evidence (an ID or the week’s record)'} value={d.reason} onChange={(v) => setDisp(f.key, d, { reason: v })} testId={`w7-finding-${i}-reason`} />
                  {d.disposition === 'defer' && <Text label="Who closes it" value={d.owner} onChange={(v) => setDisp(f.key, d, { owner: v })} testId={`w7-finding-${i}-owner`} />}
                  {d.disposition === 'defer' && <Select label="Closes in" value={d.week} onChange={(v) => setDisp(f.key, d, { week: v })} options={DEFER_WEEKS.map((w) => ({ value: String(w), label: `Week ${w}` }))} testId={`w7-finding-${i}-week`} />}
                </div>
                <GateList a={a} gates={FINDING_GATES} advisories={FINDING_ADVISORIES} testId={`w7-gates-finding-${i}`} />
              </fieldset>
            )
          })}
        </div>
      </Part>

      <Part id="w7-part-summary" n="Part 30" title="Executive summary and lessons learned" check={checks.summary}>
        <p className="w7-help">The one page a reviewer reads first: what you ask them to approve, the evidence by ID, the conditions, the residual risk by R ID, the decisions you need and the increment that comes next.</p>
        <div className="w7-grid">
          {SUMMARY_FIELDS.map((s) =>
            s.area ? (
              <Area key={s.key} label={s.label} value={rec.summary[s.key]} onChange={(v) => edit((r) => ({ ...r, summary: { ...r.summary, [s.key]: v } }))} testId={`w7-summary-${s.key}`} />
            ) : (
              <Text key={s.key} label={s.label} mono value={rec.summary[s.key]} onChange={(v) => edit((r) => ({ ...r, summary: { ...r.summary, [s.key]: v } }))} testId={`w7-summary-${s.key}`} />
            ),
          )}
          <Area label="Lessons learned (one per line)" value={rec.lessons} onChange={(v) => edit((r) => ({ ...r, lessons: v }))} rows={3} testId="w7-lessons" />
        </div>
        <GateList a={assessSummary(rec.summary, pkg)} gates={SUMMARY_GATES} testId="w7-gates-summary" />
      </Part>

      <Part id="w7-part-prep" n="Part 31" title="Design review preparation" check={checks.prep}>
        <p className="w7-help">Every member presents and answers for the sections they own. Choose the decision you defend and the need whose thread you walk; the tool follows the package’s links from that need.</p>
        <div className="w7-grid">
          {PACKAGE_SECTIONS.map((s) => (
            <Text key={s.id} label={`Owner of ${s.n}. ${s.title}`} value={rec.owners[s.id] ?? ''} onChange={(v) => edit((r) => ({ ...r, owners: { ...r.owners, [s.id as SectionId]: v } }))} testId={`w7-owner-${s.id}`} />
          ))}
        </div>
        <div className="w7-grid">
          <Select label="The key decision you defend" value={rec.decision} onChange={(v) => edit((r) => ({ ...r, decision: v }))} options={decisionOptions(pkg).map((o) => ({ value: o.value, label: o.label }))} testId="w7-decision" />
          <Select label="The need whose thread you walk" value={rec.threadNeed} onChange={(v) => edit((r) => ({ ...r, threadNeed: v }))} options={needOptions(pkg)} testId="w7-thread-need" />
        </div>
        {thread && (
          <ol className="w7-list" data-testid="w7-thread" aria-label={`The thread from ${thread.need}`}>
            {thread.hops.map((h) => (
              <li key={h.layer}>
                <strong>{h.layer}:</strong> {h.ids.length ? h.ids.join(', ') : '— (the thread stops here)'}
              </li>
            ))}
          </ol>
        )}
        <GateList a={prep} gates={PREP_GATES} advisories={PREP_ADVISORIES} testId="w7-gates-prep" />
      </Part>

      <Part id="w7-part-rids" n="Part 32" title="Review findings (RIDs) and dispositions, after the review" check={checks.rids}>
        <p className="w7-help">After Session 2, enter every RID your reviewers raised and disposition it: accept (what changes, and who changes it), defer (when, and who carries it) or reject (the evidence: an ID, a recorded decision or a computation). The package is ready for review without RIDs; the review closes when every RID is dispositioned.</p>
        {rec.rids.map((x) => {
          const a = assessRid(x, pkg)
          return (
            <fieldset key={x.id} className="w7-item" data-testid={`w7-${x.id}`}>
              <legend>
                {x.id} · {a.counts ? '✓ dispositioned' : '✗ not dispositioned yet'}
              </legend>
              <div className="w7-grid">
                <Text label="From (reviewer)" value={x.from} onChange={(v) => updRid(x.id, { from: v })} testId={`w7-${x.id}-from`} />
                <Text label="Where: an ID or a section title" value={x.location} onChange={(v) => updRid(x.id, { location: v })} testId={`w7-${x.id}-location`} />
                <Area label="What is wrong" value={x.finding} onChange={(v) => updRid(x.id, { finding: v })} testId={`w7-${x.id}-finding`} />
                <Text label="Criterion or source it breaks" value={x.criterion} onChange={(v) => updRid(x.id, { criterion: v })} testId={`w7-${x.id}-criterion`} />
                <Select label="Severity" value={x.severity} onChange={(v) => updRid(x.id, { severity: v as Rid['severity'] })} options={SEVERITIES.map((s) => ({ value: s.id, label: `${s.label}: ${s.means}` }))} testId={`w7-${x.id}-severity`} />
                <Select label="Disposition" value={x.disposition} onChange={(v) => updRid(x.id, { disposition: v as Rid['disposition'] })} options={RID_DISPOSITIONS.map((s) => ({ value: s.id, label: `${s.label}: ${s.means}` }))} testId={`w7-${x.id}-disposition`} />
                <Area label="Response" value={x.response} onChange={(v) => updRid(x.id, { response: v })} testId={`w7-${x.id}-response`} />
                {(x.disposition === 'accept' || x.disposition === 'defer') && <Text label="Owner" value={x.owner} onChange={(v) => updRid(x.id, { owner: v })} testId={`w7-${x.id}-owner`} />}
              </div>
              <button type="button" className="lf-btn small" onClick={() => edit((r) => ({ ...r, rids: r.rids.filter((y) => y.id !== x.id) }))}>
                Remove {x.id}
              </button>
              <GateList a={a} gates={RID_GATES} advisories={RID_ADVISORIES} testId={`w7-gates-${x.id}`} />
            </fieldset>
          )
        })}
        <div className="w7-btn-row">
          <button type="button" className="lf-btn small" onClick={addRid} data-testid="w7-rid-add">
            Add a RID received
          </button>
        </div>
      </Part>

      <Part id="w7-part-ai" n="Part 6" title="AI usage summary for the package" check={checks.ai}>
        <Area label="Tool, purpose, prompts, what you accepted or rejected and why (or: no AI tool was used)" value={rec.aiStatement} onChange={(v) => edit((r) => ({ ...r, aiStatement: v }))} rows={3} testId="w7-ai-statement" />
      </Part>
    </div>
  )
}
