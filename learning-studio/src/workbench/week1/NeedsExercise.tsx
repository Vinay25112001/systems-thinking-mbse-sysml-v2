// AeroLink needs exercise (Week 1, mission 4): diagnose six draft "needs" against an authored instructor key, then write
// need statements traced to reference stakeholders. Review F01 (commit 0f3ebcb): the writer reports the structural gates
// it can check (the taught form "The [stakeholders] need the [system] to …", a subject in the case register
// (aerolinkCase.ts, sign-off review Mo5/M1), the trace and the rationale),
// warns on what it cannot judge (vague, requirement and design words, a missing condition), and asks the student to
// confirm the six minimum checks. A need records when the gates pass, the self-check is complete and every warning is either
// rewritten away or justified. Controlled like StakeholderExercise; the diagnosis key is shown only after "Check".
import { useId } from 'react'
import { CitationText } from '../../components/ui'
import { NEED_FORM } from '../../content/lectures/week01/labBrief'
import { SELF_CHECK } from './needQuality'
import { EMPTY_NEED, REFERENCE_REGISTER, W1_CRITIQUE, W1_FLAWS, assessAeroLinkNeed, critiqueTicks, draftBlockers, scoreCritiqueW1, type NeedsExercise as Value } from './stakeholders'

const flawLabel = (id: string) => W1_FLAWS.find((f) => f.id === id)?.label ?? id

export function NeedsExercise({ value, onChange }: { value: Value; onChange: (v: Value) => void }) {
  const uid = useId()
  const set = (p: Partial<Value>) => onChange({ ...value, ...p })
  const checked = !!value.critiqueCheckedAt
  const score = scoreCritiqueW1(value.critique)
  const d = value.draft
  const a = assessAeroLinkNeed(d)
  const blockers = draftBlockers(d)
  const setDraft = (p: Partial<Value['draft']>) => set({ draft: { ...d, ...p } })
  // editing the wording clears the confirmation, so the ticks always refer to the current statement
  const editWording = (p: Partial<Value['draft']>) => setDraft({ ...p, selfCheck: {} })
  const started = !!(d.text || d.name || d.rationale || d.conditions || d.traces.length)
  return (
    <div className="space-y-3">
      <section aria-labelledby="needs-diagnose-h" className="rounded border border-wb-line bg-wb-panel" data-testid="needs-diagnose">
        <div className="wb-ph">
          <h2 id="needs-diagnose-h">Part 1 · Diagnose six draft “needs”</h2>
          <span className="wb-sp" />
          {checked && <span className="wb-count">{score.correct}/{score.total} agree with the key</span>}
        </div>
        <div className="space-y-2 p-3">
          <p className="m-0 text-[13px]">Tick every flaw you see; tick nothing if a draft is already acceptable. The key is the instructor’s reading of each draft against the course gate taught in Session 2; argue any disagreement from the checks. Tick “Not a valid need” for a draft with a real defect the need check rejects (no stakeholder, a requirement, a solution as the thing needed, no outcome), never for its word order alone; the reference rewrite shows the recommended form “{NEED_FORM}”.</p>
          <ol className="m-0 space-y-2 pl-5">
            {W1_CRITIQUE.map((it, i) => {
              const row = score.rows[i]
              return (
                <li key={it.id} className="text-[13px]">
                  <p className="m-0 italic">“{it.before}”</p>
                  <fieldset className="m-0 mt-1 flex flex-wrap gap-3 border-0 p-0">
                    <legend className="sr-only">Flaws in draft {i + 1}</legend>
                    {W1_FLAWS.map((f) => (
                      <label key={f.id} className="inline-flex items-center gap-1 text-[12.5px]">
                        <input type="checkbox" checked={!!value.critique[it.id]?.[f.id]} onChange={(e) => set({ critique: { ...value.critique, [it.id]: { ...(value.critique[it.id] ?? {}), [f.id]: e.target.checked } } })} aria-label={`Draft ${i + 1}: ${f.label}`} />
                        {f.label}
                      </label>
                    ))}
                  </fieldset>
                  {checked && (
                    <p className={`m-0 mt-1 text-[12px] ${row.correct ? 'text-wb-ok' : 'text-wb-bad'}`} data-testid={`needs-key-${it.id}`}>
                      {row.correct ? 'Agrees with the key.' : 'Differs from the key.'} Key: {row.key.length ? row.key.map(flawLabel).join(', ') : 'no flaw'}. Reference rewrite: “{it.after}”{it.afterCondition ? ` Condition: ${it.afterCondition}` : ''} {it.note}
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="wb-btn primary" disabled={critiqueTicks(value) === 0} onClick={() => set({ critiqueCheckedAt: Date.now() })}>
              Check
            </button>
            {critiqueTicks(value) === 0 && <span className="text-[12px] text-wb-muted">Tick the flaws you see first.</span>}
          </div>
        </div>
      </section>

      <section aria-labelledby="needs-write-h" className="rounded border border-wb-line bg-wb-panel" data-testid="needs-write">
        <div className="wb-ph">
          <h2 id="needs-write-h">Part 2 · Write AeroLink needs</h2>
          <span className="wb-sp" />
          <span className="wb-count">{value.needs.length} recorded</span>
        </div>
        <div className="space-y-2 p-3">
          <p className="m-0 text-[13px]">
            Write a need for AeroLink’s new vertiport in the form taught in Session 2, “{NEED_FORM}” (the system is the air-taxi service), choose the stakeholder of the case register it comes from, and confirm the six checks. Write two, from two different stakeholders. The tool checks the form, that the subject is a stakeholder in the case register, the trace and the rationale; it only warns about vague, requirement and design words and a missing condition. Whether the need is good is your judgment.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block" htmlFor={`${uid}-name`}>
              <span className="wb-label">Short name</span>
              <input id={`${uid}-name`} className="wb-input w-full" value={d.name} onChange={(e) => setDraft({ name: e.target.value })} />
            </label>
            <label className="block" htmlFor={`${uid}-src`}>
              <span className="wb-label">Comes from (stakeholder)</span>
              <select id={`${uid}-src`} className="wb-select w-full" value={d.traces[0] ?? ''} onChange={(e) => setDraft({ traces: e.target.value ? [e.target.value] : [] })}>
                <option value="">Choose…</option>
                {REFERENCE_REGISTER.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block" htmlFor={`${uid}-text`}>
            <span className="wb-label">Need statement</span>
            <textarea id={`${uid}-text`} rows={2} className="wb-textarea" value={d.text} onChange={(e) => editWording({ text: e.target.value })} />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block" htmlFor={`${uid}-cond`}>
              <span className="wb-label">Condition (if not in the statement)</span>
              <input id={`${uid}-cond`} className="wb-input w-full" value={d.conditions} onChange={(e) => editWording({ conditions: e.target.value })} />
            </label>
            <label className="block" htmlFor={`${uid}-why`}>
              <span className="wb-label">Rationale (why they need it)</span>
              <input id={`${uid}-why`} className="wb-input w-full" value={d.rationale} onChange={(e) => setDraft({ rationale: e.target.value })} />
            </label>
          </div>
          {started && (
            <ul className="m-0 list-none space-y-1 p-0 text-[12.5px]" aria-live="polite" data-testid="needs-criteria">
              {a.gates.map((g) => (
                <li key={g.id} className={g.ok ? 'text-wb-ok' : 'text-wb-bad'}>
                  <strong>{g.ok ? 'Checked' : 'Fix'}:</strong> {g.message}
                </li>
              ))}
              {a.completeness.filter((c) => !c.ok).map((c) => (
                <li key={c.id} className="text-wb-bad">
                  <strong>Fix:</strong> {c.message}
                </li>
              ))}
              {a.warnings.map((w) => (
                <li key={w.id} className="text-wb-warn">
                  <strong>Warning:</strong> {w.message}
                </li>
              ))}
              {a.advice.map((x) => (
                <li key={x.id} className="text-wb-muted" data-testid="need-advice">
                  <strong>Note:</strong> {x.message}
                </li>
              ))}
            </ul>
          )}
          {started && a.warnings.length > 0 && (
            <label className="block" htmlFor={`${uid}-just`}>
              <span className="wb-label">Justification, if a warning stays</span>
              <input id={`${uid}-just`} className="wb-input w-full" value={d.justification ?? ''} onChange={(e) => setDraft({ justification: e.target.value })} />
            </label>
          )}
          {started && (
            <fieldset className="m-0 rounded border border-wb-line p-2 text-[12.5px]" data-testid="needs-selfcheck">
              <legend className="px-1 font-semibold">Self-check: confirm each of the six checks for this wording</legend>
              <ul className="m-0 list-none space-y-1 p-0">
                {SELF_CHECK.map((c) => (
                  <li key={c.id}>
                    <label className="flex items-start gap-2">
                      <input type="checkbox" className="mt-0.5" checked={!!d.selfCheck?.[c.id]} onChange={(e) => setDraft({ selfCheck: { ...(d.selfCheck ?? {}), [c.id]: e.target.checked } })} />
                      <span>
                        {c.label} <span className="text-wb-muted">{c.tool}</span> <CitationText c={c.cite} />
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
          <button
            type="button"
            className="wb-btn primary"
            disabled={blockers.length > 0}
            onClick={() => set({ needs: [...value.needs, { ...d, id: `NEED-A${String(Math.max(0, ...value.needs.map((x) => Number(x.id.slice(6)) || 0)) + 1).padStart(2, '0')}`, at: Date.now() }], draft: EMPTY_NEED })}
          >
            Record need
          </button>
          {started && blockers.length > 0 && <p className="m-0 text-[12px] text-wb-muted">Not yet: {blockers[0]}</p>}
          {value.needs.length > 0 && (
            <ul className="m-0 list-none space-y-1 p-0 text-[13px]" data-testid="needs-recorded">
              {value.needs.map((x) => (
                <li key={x.id} className="flex flex-wrap items-start gap-2">
                  <span className="wb-mono text-[11px] text-wb-muted">{x.id}</span>
                  <span className="min-w-0 flex-1">
                    {x.text} <span className="text-wb-muted">({x.traces.join(', ')})</span>
                  </span>
                  <button type="button" className="wb-btn ghost" aria-label={`Delete ${x.id}`} onClick={() => set({ needs: value.needs.filter((y) => y.id !== x.id) })}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
