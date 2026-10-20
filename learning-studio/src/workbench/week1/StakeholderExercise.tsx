// AeroLink stakeholder exercise (Week 1, missions 1 and 3): identify stakeholders, classify six, write one register
// row. Controlled: the workbench stores the value as an artefact, the classic page in browser storage. The key for each
// part appears only after the student checks that part with every item answered (no key leaks before). Review F14: a
// row that differs from the key must then be re-answered or its explanation acknowledged before the step completes.
import { useId } from 'react'
import { CANDIDATES, CLASSIFY_ROWS, ROLES, ROW_CHOICES, classifiedCount, classifyOpen, classifyScore, CLASSIFY_FIELDS, identifiedCount, identifyOpen, identifyScore, registerRowIssues, roleLabel, type Classification, type StakeholderExercise as Value } from './stakeholders'

const SIDE = { internal: 'Internal', external: 'External' } as const

function Panel({ id, title, children, status }: { id: string; title: string; children: React.ReactNode; status?: string }) {
  return (
    <section aria-labelledby={id} className="rounded border border-wb-line bg-wb-panel" data-testid={id.replace(/-h$/, '')}>
      <div className="wb-ph">
        <h2 id={id}>{title}</h2>
        <span className="wb-sp" />
        {status && <span className="wb-count">{status}</span>}
      </div>
      <div className="space-y-2 p-3">{children}</div>
    </section>
  )
}

export function StakeholderExercise({ value, onChange }: { value: Value; onChange: (v: Value) => void }) {
  const uid = useId()
  const set = (p: Partial<Value>) => onChange({ ...value, ...p })
  const idDone = identifiedCount(value) === CANDIDATES.length
  const idChecked = !!value.identifiedCheckedAt
  const clDone = classifiedCount(value) === CLASSIFY_ROWS.length
  const clChecked = !!value.classesCheckedAt
  const issues = registerRowIssues(value.row)
  const setClass = (stk: string, p: Classification) => set({ classes: { ...value.classes, [stk]: { ...(value.classes[stk] ?? {}), ...p } } })
  const setRow = (p: Partial<Value['row']>) => set({ row: { ...value.row, ...p }, rowRecordedAt: undefined })
  return (
    <div className="space-y-3">
      <Panel id={`stk-identify-h`} title="Part 1 · Who has a stake in the new vertiport?" status={`${identifiedCount(value)}/${CANDIDATES.length} marked`}>
        <p className="m-0 text-[13px]">For each candidate, decide whether it is a stakeholder: an individual, group or organization with an interest in the vertiport, or affected by it (L4). The explanation appears after you check.</p>
        <table className="wb-table" data-testid="stk-candidates">
          <thead>
            <tr>
              <th scope="col">Candidate</th>
              <th scope="col" style={{ width: 210 }}>Your answer</th>
              {idChecked && <th scope="col">Explanation</th>}
            </tr>
          </thead>
          <tbody>
            {CANDIDATES.map((c) => {
              const v = value.identified[c.id]
              const ok = v === (c.stakeholder ? 'yes' : 'no')
              return (
                <tr key={c.id}>
                  <td className="text-[13px]">{c.name}</td>
                  <td>
                    <select aria-label={`Is ${c.name} a stakeholder?`} className="wb-select w-full" value={v ?? ''} onChange={(e) => set({ identified: { ...value.identified, [c.id]: e.target.value as 'yes' | 'no' } })}>
                      <option value="">Choose…</option>
                      <option value="yes">Stakeholder</option>
                      <option value="no">Not a stakeholder</option>
                    </select>
                  </td>
                  {idChecked && (
                    <td className={`text-[12px] ${ok ? 'text-wb-ok' : 'text-wb-bad'}`}>
                      {ok ? 'Agrees with the key. ' : `Key: ${c.stakeholder ? 'stakeholder' : 'not a stakeholder'}. `}
                      {c.why}
                      {!ok && (
                        <label className="mt-1 flex items-center gap-1 text-wb-fg">
                          <input type="checkbox" checked={!!value.identifiedAck?.[c.id]} onChange={(e) => set({ identifiedAck: { ...(value.identifiedAck ?? {}), [c.id]: e.target.checked } })} />
                          I have read why
                        </label>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="wb-btn primary" disabled={!idDone} onClick={() => set({ identifiedCheckedAt: Date.now(), identifiedFirstScore: value.identifiedFirstScore ?? identifyScore(value) })}>
            Check
          </button>
          {!idDone && <span className="text-[12px] text-wb-muted">Mark every candidate first ({CANDIDATES.length - identifiedCount(value)} left).</span>}
          {idChecked && (
            <span role="status" className="wb-chip accent" data-testid="stk-identify-score">
              {identifyScore(value)} of {CANDIDATES.length} agree with the key
            </span>
          )}
          {idChecked && identifyOpen(value).length > 0 && (
            <span className="text-[12px] text-wb-warn" data-testid="stk-identify-open">
              {identifyOpen(value).length} to read: tick “I have read why” beside each, or change your answer.
            </span>
          )}
        </div>
      </Panel>

      <Panel id={`stk-classify-h`} title="Part 2 · Classify six AeroLink stakeholders" status={`${classifiedCount(value)}/${CLASSIFY_ROWS.length} classified`}>
        <p className="m-0 text-[13px]">Classify each one as the course register does (L5): its role group, whether it is internal or external to AeroLink Urban Mobility, and whether it is an approving authority.</p>
        <div className="overflow-x-auto">
          <table className="wb-table" data-testid="stk-classify">
            <thead>
              <tr>
                <th scope="col">Stakeholder</th>
                <th scope="col">Role</th>
                <th scope="col">Internal or external</th>
                <th scope="col">Approving authority</th>
              </tr>
            </thead>
            <tbody>
              {CLASSIFY_ROWS.map((r) => {
                const c = value.classes[r.stk] ?? {}
                const allOk = c.role === r.key.role && c.side === r.key.side && c.approving === r.key.approving
                return (
                  <tr key={r.stk}>
                    <td className="text-[13px]">
                      <span className="wb-mono text-[11px] text-wb-muted">{r.stk}</span> {r.name}
                      {clChecked && (
                        <span className={`mt-1 block text-[12px] ${allOk ? 'text-wb-ok' : 'text-wb-bad'}`}>
                          {allOk ? 'Agrees with the key. ' : `Key: ${roleLabel(r.key.role)}; ${SIDE[r.key.side].toLowerCase()}; approving authority ${r.key.approving}. `}
                          {r.why}
                        </span>
                      )}
                      {clChecked && !allOk && (
                        <label className="mt-1 flex items-center gap-1 text-[12px]">
                          <input type="checkbox" checked={!!value.classesAck?.[r.stk]} onChange={(e) => set({ classesAck: { ...(value.classesAck ?? {}), [r.stk]: e.target.checked } })} />
                          I have read why
                        </label>
                      )}
                    </td>
                    <td>
                      <select aria-label={`Role of ${r.name}`} className="wb-select w-full" value={c.role ?? ''} onChange={(e) => setClass(r.stk, { role: e.target.value as Classification['role'] })}>
                        <option value="">Choose…</option>
                        {ROLES.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select aria-label={`Internal or external: ${r.name}`} className="wb-select w-full" value={c.side ?? ''} onChange={(e) => setClass(r.stk, { side: e.target.value as Classification['side'] })}>
                        <option value="">Choose…</option>
                        <option value="internal">Internal</option>
                        <option value="external">External</option>
                      </select>
                    </td>
                    <td>
                      <select aria-label={`Approving authority: ${r.name}`} className="wb-select w-full" value={c.approving ?? ''} onChange={(e) => setClass(r.stk, { approving: e.target.value as Classification['approving'] })}>
                        <option value="">Choose…</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="wb-btn primary" disabled={!clDone} onClick={() => set({ classesCheckedAt: Date.now(), classesFirstScore: value.classesFirstScore ?? classifyScore(value) })}>
            Check classification
          </button>
          {!clDone && <span className="text-[12px] text-wb-muted">Classify all six first.</span>}
          {clChecked && (
            <span role="status" className="wb-chip accent" data-testid="stk-classify-score">
              {classifyScore(value)} of {CLASSIFY_FIELDS} choices agree with the key
            </span>
          )}
          {clChecked && classifyOpen(value).length > 0 && (
            <span className="text-[12px] text-wb-warn" data-testid="stk-classify-open">
              {classifyOpen(value).length} to read: tick “I have read why” under each, or change your answer.
            </span>
          )}
        </div>
      </Panel>

      <Panel id={`stk-row-h`} title="Part 3 · Write one register row" status={value.rowRecordedAt ? 'recorded' : 'not recorded'}>
        <p className="m-0 text-[13px]">Pick a stakeholder you have not classified, write a concern someone else could check (what, for whom, where or when), rate its influence from 1 to 5 and give the reason. The concern screen rejects a concern that names only a general quality, and asks for at least one concrete detail: a number or time, a condition, a place, an affected group, or a consequence. It cannot tell whether the detail is true or important; a reviewer judges that.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block" htmlFor={`${uid}-stk`}>
            <span className="wb-label">Stakeholder</span>
            <select id={`${uid}-stk`} className="wb-select w-full" value={value.row.stk} onChange={(e) => setRow({ stk: e.target.value })}>
              <option value="">Choose…</option>
              {ROW_CHOICES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block" htmlFor={`${uid}-inf`}>
            <span className="wb-label">Influence (1–5)</span>
            <select id={`${uid}-inf`} className="wb-select w-full" value={value.row.influence} onChange={(e) => setRow({ influence: e.target.value })}>
              <option value="">Choose…</option>
              {['1', '2', '3', '4', '5'].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block" htmlFor={`${uid}-con`}>
          <span className="wb-label">Concern</span>
          <textarea id={`${uid}-con`} rows={2} className="wb-textarea" value={value.row.concern} onChange={(e) => setRow({ concern: e.target.value })} />
        </label>
        <label className="block" htmlFor={`${uid}-why`}>
          <span className="wb-label">Reason for the influence rating</span>
          <input id={`${uid}-why`} className="wb-input w-full" value={value.row.reason} onChange={(e) => setRow({ reason: e.target.value })} />
        </label>
        {issues.length > 0 && (value.row.concern || value.row.stk || value.row.reason) ? (
          <ul className="m-0 list-disc space-y-0.5 pl-5 text-[12.5px] text-wb-warn" aria-live="polite" data-testid="stk-row-issues">
            {issues.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="wb-btn primary" disabled={issues.length > 0} onClick={() => set({ rowRecordedAt: Date.now() })}>
            Record the row
          </button>
          {value.rowRecordedAt && issues.length === 0 && (
            <span role="status" className="wb-chip ok" data-testid="stk-row-recorded">
              Recorded for {value.row.stk}
            </span>
          )}
        </div>
      </Panel>
    </div>
  )
}
