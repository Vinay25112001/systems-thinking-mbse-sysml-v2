// The working surface of each Guided Practice step (M5, spec §e.2). Every step: one short instruction, the editable
// surface (table, diagram or form), "Check" / "Check again", and the feedback of its kind (feedback.ts). Every input stays
// editable after a check (GP-21). The diagrams are driven by the same native controls as their tables, so they work from
// the keyboard; each has a text equivalent (DS-30).
import { useId, useRef, type ReactNode } from 'react'
import type { BoundaryClass } from '../../content/week1'
import { RELATIONSHIP_VERB, type RelationshipType } from '../../content/lectures/week01/aerolinkCase'
import { NEED_FORM } from '../../content/lectures/week01/labBrief'
import { SELF_CHECK } from '../../workbench/week1/needQuality'
import { ROLES, assessAeroLinkNeed, draftBlockers, type Classification, type NeedDraft } from '../../workbench/week1/stakeholders'
import { compareSummary, runCheck, setAck, setAnswer, structuralLine, type CompareResult, type StructuralResult } from './feedback'
import type { ExchangeDirection, GP1, GP2, GP3, GP4, GP5, GP6 } from './store'
import * as T from './tasks'
import { Agreement, Choice, Feedback, Mono, ReadWhy } from './ui'

type Up<S> = (f: (s: S) => S) => void

function Instruction({ children }: { children: ReactNode }) {
  return <p className="gp-instr">{children}</p>
}

function CheckBar({ ready, checked, onCheck, missing, label = 'Check my answer' }: { ready: boolean; checked: boolean; onCheck: () => void; missing?: string; label?: string }) {
  return (
    <div className="gp-checkbar">
      <button type="button" className="gp-btn course" disabled={!ready} onClick={onCheck} data-testid="gp-check">
        {checked ? 'Check again' : label}
      </button>
      {!ready && missing && <span className="gp-hint">{missing}</span>}
    </div>
  )
}

/** The compared-reading block: the summary, then the reasoning for every differing item with "I have read why". */
function ComparedBlock({ r, render, ack, onAck, agreeNote }: { r: CompareResult | { agree: number; differ: number; open: number; stale: boolean; rows: { id: string; agrees: boolean; acknowledged: boolean; changed: boolean }[] }; render: (id: string) => ReactNode; ack: Record<string, boolean>; onAck: (id: string, v: boolean) => void; agreeNote?: string }) {
  const differing = r.rows.filter((x) => !x.agrees)
  return (
    <Feedback kind="compared" title={<>Compared with the instructor’s reading: {compareSummary(r)}</>} testId="fb-compared">
      {r.stale && <p className="gp-note">Some answers changed after the last check. The reasoning below is about the answers you checked; press “Check again”.</p>}
      {differing.map((x) => (
        <div key={x.id} id={`why-${x.id}`} className="gp-why" tabIndex={-1}>
          {render(x.id)}
          <ReadWhy checked={!!ack[x.id]} onChange={(v) => onAck(x.id, v)} />
        </div>
      ))}
      <p className="gp-note">{agreeNote ?? 'Judgment items get reasoning, not marks. The step counts as attempted when every item is answered, checked, and every difference is changed or acknowledged.'}</p>
    </Feedback>
  )
}

function StructuralBlock({ r, passNote, children }: { r: StructuralResult; passNote: string; children?: ReactNode }) {
  return (
    <Feedback kind="structural" tone={r.ok ? 'pass' : 'fail'} title={structuralLine(r)} testId="fb-structural">
      {r.ok ? <p>{passNote}</p> : r.issues.length > 1 && <ul>{r.issues.slice(1).map((x) => <li key={x}>Also: {x}</li>)}</ul>}
      {children}
    </Feedback>
  )
}

const Defensible = ({ text }: { text?: string }) => (text ? <p className="gp-defensible"><strong>A well-argued different answer can be defensible:</strong> {text}</p> : null)

// =================================================================================================== GP-1
export function GP1View({ s, up, step }: { s: GP1; up: Up<GP1>; step: string }) {
  const r = T.gp1Identify(s)
  if (step === 'predict')
    return (
      <>
        <Instruction>Before reading any explanation, commit to a prediction. It locks when you record it, and you compare it with what you find in step 2.</Instruction>
        <blockquote className="gp-case">{T.GP1_QUESTION}</blockquote>
        <Choice legend="Your prediction" options={T.PREDICTION_OPTIONS.map((o) => ({ id: o.id, label: o.text }))} value={s.prediction?.value} onChange={(v) => up((x) => (x.prediction ? x : { ...x, prediction: { value: v, at: Date.now() } }))} disabled={!!s.prediction} />
        {s.prediction ? <p className="gp-ok-line" role="status">Prediction recorded and locked. There is no penalty for any prediction.</p> : <p className="gp-hint">Choosing an answer records it.</p>}
      </>
    )
  if (step === 'identify')
    return (
      <>
        <Instruction>For each candidate, decide whether it is a stakeholder of the new vertiport. Then check, and read the instructor’s reasoning for every candidate that differs.</Instruction>
        <div className="gp-tablewrap">
          <table className="gp-table" data-testid="gp1-table">
            <caption className="sr-only">Candidates for the vertiport’s stakeholder register</caption>
            <thead>
              <tr>
                <th scope="col">Candidate</th>
                <th scope="col">Your answer</th>
                <th scope="col">Compared with the instructor’s reading</th>
              </tr>
            </thead>
            <tbody>
              {T.GP1_ITEMS.map((it, i) => {
                const c = T.gp1Candidate(it.id)
                const row = r.rows[i]
                return (
                  <tr key={it.id} className={r.checked && !row.agrees ? 'is-differ' : ''}>
                    <th scope="row">{c.name}</th>
                    <td>
                      <Choice compact hideLegend legend={`Is ${c.name} a stakeholder?`} options={[{ id: 'yes', label: 'Stakeholder' }, { id: 'no', label: 'Not a stakeholder' }]} value={s.identify.answers[it.id]} onChange={(v) => up((x) => ({ ...x, identify: setAnswer(x.identify, it.id, v) }))} />
                    </td>
                    <td>{r.checked ? <Agreement agrees={row.agrees} changed={row.changed} why={it.id} /> : <span className="gp-muted">After the check</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <CheckBar ready={r.answered === r.total} checked={r.checked} onCheck={() => up((x) => ({ ...x, identify: runCheck(x.identify) }))} missing={`Answer every candidate first (${r.total - r.answered} left).`} />
        {r.checked && (
          <ComparedBlock
            r={r}
            ack={s.identify.ack}
            onAck={(id, v) => up((x) => ({ ...x, identify: setAck(x.identify, id, v) }))}
            render={(id) => {
              const c = T.gp1Candidate(id)
              return (
                <>
                  <p><strong>{c.name}.</strong> The instructor’s reading: <strong>{c.stakeholder ? 'a stakeholder' : 'not a stakeholder'}</strong>. {c.why}</p>
                  <Defensible text={c.defensible} />
                </>
              )
            }}
          />
        )}
        {r.checked && r.differ === 0 && <p className="gp-note">Every candidate agrees. The reasons are worth reading anyway: Learn chapter 6 explains each kind of party.</p>}
      </>
    )
  return (
    <>
      <Instruction>Compare what you found with your prediction. Recording your comparison shows the reasoning.</Instruction>
      {/* review M5-03: nothing to compare, and no reasoning shown, before the sort has been checked */}
      {!s.prediction ? <p className="gp-hint" data-testid="gp1-compare-locked">Record your prediction in step 1 first.</p> : !r.checked && <p className="gp-hint" data-testid="gp1-compare-locked">Sort every candidate and press “Check my answer” in step 2 first: this step compares what you found with your prediction.</p>}
      <Choice legend="Did what you found match your prediction?" options={T.MATCH_OPTIONS.map((o) => ({ id: o.id, label: o.text }))} value={s.match?.value} onChange={(v) => up((x) => ({ ...x, match: { value: v, at: Date.now() } }))} disabled={!s.prediction || !r.checked} />
      {s.match && s.prediction && r.checked && (
        <Feedback kind="reveal" title="Reasoning: why the three-party list is not enough" testId="fb-reveal">
          <p>{T.gp1Reveal(s)}</p>
          {!r.complete && <p className="gp-note">Finish step 2 (every candidate checked and every difference read) to complete this task.</p>}
        </Feedback>
      )}
    </>
  )
}

// =================================================================================================== GP-2
function BoundaryDiagram({ s, onFocus }: { s: GP2; onFocus: (id: string) => void }) {
  const zone = (c: BoundaryClass | undefined) => T.GP2_ITEMS.filter((i) => s.boundary.answers[i.id] === c).map((i) => T.gp2Item(i.id))
  const chip = (b: { id: string; name: string }) => (
    <li key={b.id}>
      <button type="button" className="gp-chip" onClick={() => onFocus(b.id)} aria-label={`${b.name}: change its place`}>
        {b.name}
      </button>
    </li>
  )
  const unplaced = T.GP2_ITEMS.filter((i) => !s.boundary.answers[i.id]).map((i) => T.gp2Item(i.id))
  const desc = `Inside: ${zone('inside').map((b) => b.name).join(', ') || 'nothing yet'}. Environment: ${zone('environment').map((b) => b.name).join(', ') || 'nothing yet'}. Irrelevant to the question: ${zone('irrelevant').map((b) => b.name).join(', ') || 'nothing yet'}. Not yet placed: ${unplaced.map((b) => b.name).join(', ') || 'none'}.`
  return (
    <figure className="gp-figure" data-testid="gp2-diagram">
      <div className="gp-bd-env" role="group" aria-label="Boundary diagram">
        <span className="gp-bd-label">Environment</span>
        <ul className="gp-chips">{zone('environment').map(chip)}</ul>
        <div className="gp-bd-soi">
          <span className="gp-bd-label">Inside the boundary · the air-taxi service</span>
          <ul className="gp-chips">{zone('inside').map(chip)}</ul>
        </div>
      </div>
      <div className="gp-bd-out">
        <span className="gp-bd-label">Irrelevant to the question</span>
        <ul className="gp-chips">{zone('irrelevant').map(chip)}</ul>
        {unplaced.length > 0 && (
          <>
            <span className="gp-bd-label">Not yet placed</span>
            <ul className="gp-chips is-unplaced">{unplaced.map(chip)}</ul>
          </>
        )}
      </div>
      <figcaption className="gp-caption">
        The boundary as you have drawn it, for the question “{T.BOUNDARY_QUESTION_TEXT}”. Choose a place in the table, or press an element to jump to its row. <span className="sr-only">{desc}</span>
      </figcaption>
    </figure>
  )
}

function ContextDiagram({ s }: { s: GP2 }) {
  const arrow = (d?: ExchangeDirection) => (d === 'in' ? '→' : d === 'out' ? '←' : d === 'both' ? '↔' : '·')
  return (
    <figure className="gp-figure" data-testid="gp2-context">
      <div className="gp-ctx">
        {T.GP2_EXTERNALS.map((e) => {
          const x = s.exchanges[e.id]
          return (
            <div key={e.id} className="gp-ctx-row">
              <span className="gp-node is-ext"><Mono>{e.id}</Mono> {e.name}</span>
              <span className="gp-ctx-arrow" aria-hidden>{arrow(x?.direction)}</span>
              <span className="gp-ctx-label">{x?.text?.trim() || 'what crosses?'}</span>
              <span className="gp-node is-soi">Air-taxi service</span>
            </div>
          )
        })}
      </div>
      <figcaption className="gp-caption">
        Context sketch: an arrow pointing right means into the service. <span className="sr-only">{T.GP2_EXTERNALS.map((e) => `${e.name}: ${s.exchanges[e.id]?.text?.trim() || 'not stated'}, ${s.exchanges[e.id]?.direction ? T.DIRECTION_LABEL[s.exchanges[e.id]!.direction!] : 'direction not chosen'}.`).join(' ')}</span>
      </figcaption>
    </figure>
  )
}

export function GP2View({ s, up, step }: { s: GP2; up: Up<GP2>; step: string }) {
  const r = T.gp2Boundary(s)
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({})
  const focusRow = (id: string) => rowRefs.current[id]?.querySelector<HTMLInputElement>('input:checked, input')?.focus()
  if (step === 'boundary')
    return (
      <>
        <Instruction>Place each candidate element inside the boundary, in the environment, or as irrelevant, for the question “{T.BOUNDARY_QUESTION_TEXT}” The system of interest is the AeroLink air-taxi service.</Instruction>
        <BoundaryDiagram s={s} onFocus={focusRow} />
        <div className="gp-tablewrap">
          <table className="gp-table" data-testid="gp2-table">
            <caption className="sr-only">Candidate elements and where you place them</caption>
            <thead>
              <tr><th scope="col">Element</th><th scope="col">Your placement</th><th scope="col">Compared with the instructor’s reading</th></tr>
            </thead>
            <tbody>
              {T.GP2_ITEMS.map((it, i) => {
                const b = T.gp2Item(it.id)
                const row = r.rows[i]
                return (
                  <tr key={it.id} ref={(el) => { rowRefs.current[it.id] = el }} className={r.checked && !row.agrees ? 'is-differ' : ''}>
                    <th scope="row">{b.name}</th>
                    <td><Choice compact hideLegend legend={`Place ${b.name}`} options={T.BOUNDARY_CLASSES} value={s.boundary.answers[it.id] as BoundaryClass | undefined} onChange={(v) => up((x) => ({ ...x, boundary: setAnswer(x.boundary, it.id, v) }))} /></td>
                    <td>{r.checked ? <Agreement agrees={row.agrees} changed={row.changed} why={it.id} /> : <span className="gp-muted">After the check</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <CheckBar ready={r.answered === r.total} checked={r.checked} onCheck={() => up((x) => ({ ...x, boundary: runCheck(x.boundary) }))} missing={`Place every element first (${r.total - r.answered} left).`} />
        {r.checked && (
          <ComparedBlock
            r={r}
            ack={s.boundary.ack}
            onAck={(id, v) => up((x) => ({ ...x, boundary: setAck(x.boundary, id, v) }))}
            render={(id) => {
              const b = T.gp2Item(id)
              return (
                <>
                  <p><strong>{b.name}.</strong> The instructor’s reading: <strong>{b.answer}</strong>. {b.why}</p>
                  <Defensible text={b.defensible} />
                </>
              )
            }}
          />
        )}
      </>
    )
  if (step === 'criterion') {
    const chosen = T.CRITERION_OPTIONS.find((o) => o.id === s.criterion?.value)
    // review M5-04: the question presupposes the instructor's placements, so it opens only after step 1 is checked
    if (!r.checked)
      return (
        <>
          <Instruction>This step asks about two placements of the instructor’s boundary, so it opens after you have drawn and checked your own.</Instruction>
          <p className="gp-hint" data-testid="gp2-criterion-locked">Place every element and press “Check my answer” in step 1 first.</p>
        </>
      )
    return (
      <>
        <Instruction>In the instructor’s reading, passenger demand is inside the boundary and the electric grid is in the environment, yet AeroLink controls neither. Which criterion puts demand inside?</Instruction>
        <Choice legend="Criterion" options={T.CRITERION_OPTIONS.map((o) => ({ id: o.id, label: o.text }))} value={s.criterion?.value} onChange={(v) => up((x) => ({ ...x, criterion: { value: v, at: Date.now() } }))} />
        {chosen && (
          <Feedback kind="reveal" title="Best supported answer: the model-boundary criterion" testId="fb-reveal">
            <p>This item has one best supported answer. Each option, explained:</p>
            <ul>
              {T.CRITERION_OPTIONS.map((o) => (
                <li key={o.id}>
                  <strong>{o.text}{o.id === chosen.id ? ' (your choice)' : ''}.</strong> {o.explanation}
                </li>
              ))}
            </ul>
          </Feedback>
        )}
      </>
    )
  }
  // M5 confirmation N-1: the external systems are named only after the student's own boundary has been checked
  if (!r.checked)
    return (
      <>
        <Instruction>This step works with three external systems of the instructor’s context, so it opens after you have drawn and checked your own boundary.</Instruction>
        <p className="gp-hint" data-testid="gp2-exchanges-locked">Place every element and press “Check my answer” in step 1 first.</p>
      </>
    )
  const x = T.gp2Exchanges(s)
  const xc = T.gp2Exchanges({ ...s, exchanges: s.exchangesChecked ?? {} })
  const open = T.gp2ExchangeOpen(s)
  const stale = T.gp2ExchangesStale(s)
  return (
    <>
      <Instruction>For three external systems, state what crosses the boundary and its direction. Then check your record and compare it with the instructor’s reading.</Instruction>
      <ContextDiagram s={s} />
      {T.GP2_EXTERNALS.map((e) => (
        <fieldset key={e.id} className="gp-ext">
          <legend><Mono>{e.id}</Mono> {e.name}</legend>
          <label className="gp-field">
            <span>What crosses the boundary</span>
            <input type="text" value={s.exchanges[e.id]?.text ?? ''} onChange={(ev) => up((y) => ({ ...y, exchanges: { ...y.exchanges, [e.id]: { ...(y.exchanges[e.id] ?? { text: '' }), text: ev.target.value } } }))} />
          </label>
          <Choice compact legend="Direction" options={(['in', 'out', 'both'] as ExchangeDirection[]).map((d) => ({ id: d, label: T.DIRECTION_LABEL[d] }))} value={s.exchanges[e.id]?.direction} onChange={(d) => up((y) => ({ ...y, exchanges: { ...y.exchanges, [e.id]: { ...(y.exchanges[e.id] ?? { text: '' }), direction: d } } }))} />
          {s.exchangesChecked && xc.ok && (
            <div className="gp-reading">
              <p>
                <Agreement agrees={s.exchangesChecked[e.id]?.direction === e.direction} changed={s.exchanges[e.id]?.direction !== s.exchangesChecked[e.id]?.direction || (s.exchanges[e.id]?.text ?? '') !== (s.exchangesChecked[e.id]?.text ?? '')} /> <strong>Instructor’s reading:</strong> {e.reading} Direction: {T.DIRECTION_LABEL[e.direction]}. {e.why}
              </p>
              <Defensible text={e.defensible} />
              {s.exchangesChecked[e.id]?.direction !== e.direction && <ReadWhy checked={!!s.exchangesAck[e.id]} onChange={(v) => up((y) => ({ ...y, exchangesAck: { ...y.exchangesAck, [e.id]: v } }))} />}
            </div>
          )}
        </fieldset>
      ))}
      <CheckBar ready={x.touched} checked={!!s.exchangesChecked} onCheck={() => up((y) => T.gp2CheckExchanges(y))} missing="Start with the first external system." />
      {s.exchangesChecked && stale && <p className="gp-note">You changed an exchange after the last check. The comparison shown is about the exchanges you checked; press “Check again”.</p>}
      {s.exchangesChecked && (
        <StructuralBlock r={xc} passNote="Every exchange is stated and has a direction. This check is structural: it says the record is complete, not that the reading is right. Your wording is compared with the instructor’s, not scored.">
          {xc.ok && open.length > 0 && <p className="gp-note">{open.length} direction{open.length > 1 ? 's differ' : ' differs'} from the instructor’s reading: read why above, or change it.</p>}
        </StructuralBlock>
      )}
    </>
  )
}

// =================================================================================================== GP-3
export function GP3View({ s, up, step, template }: { s: GP3; up: Up<GP3>; step: string; template: ReactNode }) {
  const r = T.gp3Classify(s)
  const setField = (stk: string, p: Classification) =>
    up((x) => {
      const fields = { ...x.fields, [stk]: { ...(x.fields[stk] ?? {}), ...p } }
      return { ...x, fields, classes: setAnswer(x.classes, stk, T.gp3Answer(fields[stk])) }
    })
  if (step === 'classify')
    return (
      <>
        <Instruction>Classify each stakeholder as the course register does: its role group, internal or external to AeroLink Urban Mobility, and whether it is an approving authority. Then check and read the reasoning.</Instruction>
        <div className="gp-tablewrap">
          <table className="gp-table is-stack" data-testid="gp3-table">
            <caption className="sr-only">Six AeroLink stakeholders to classify</caption>
            <thead>
              <tr><th scope="col">Stakeholder</th><th scope="col">Role group</th><th scope="col">Internal or external</th><th scope="col">Approving authority</th><th scope="col">Compared</th></tr>
            </thead>
            <tbody>
              {T.GP3_ITEMS.map((it, i) => {
                const row = T.gp3Row(it.id)
                const f = s.fields[it.id] ?? {}
                const res = r.rows[i]
                return (
                  <tr key={it.id} className={r.checked && !res.agrees ? 'is-differ' : ''}>
                    <th scope="row"><Mono>{row.stk}</Mono> {row.name}</th>
                    <td data-label="Role group">
                      <select aria-label={`Role group of ${row.name}`} value={f.role ?? ''} onChange={(e) => setField(it.id, { role: e.target.value as Classification['role'] })}>
                        <option value="">Choose…</option>
                        {ROLES.map((ro) => <option key={ro.id} value={ro.id}>{ro.label}</option>)}
                      </select>
                    </td>
                    <td data-label="Internal or external"><Choice compact hideLegend legend={`${row.name}: internal or external`} options={[{ id: 'internal', label: 'Internal' }, { id: 'external', label: 'External' }]} value={f.side} onChange={(v) => setField(it.id, { side: v })} /></td>
                    <td data-label="Approving authority"><Choice compact hideLegend legend={`${row.name}: approving authority`} options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]} value={f.approving} onChange={(v) => setField(it.id, { approving: v })} /></td>
                    <td data-label="Compared">{r.checked ? <Agreement agrees={res.agrees} changed={res.changed} why={it.id} /> : <span className="gp-muted">After the check</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <CheckBar ready={r.answered === r.total} checked={r.checked} onCheck={() => up((x) => ({ ...x, classes: runCheck(x.classes) }))} missing={`Classify every stakeholder fully first (${r.total - r.answered} left).`} />
        {r.checked && (
          <ComparedBlock
            r={r}
            ack={s.classes.ack}
            onAck={(id, v) => up((x) => ({ ...x, classes: setAck(x.classes, id, v) }))}
            render={(id) => {
              const row = T.gp3Row(id)
              const role = ROLES.find((ro) => ro.id === row.key.role)!.label
              return (
                <>
                  <p><strong>{row.name}.</strong> The instructor’s reading: <strong>{role}, {row.key.side}, {row.key.approving === 'yes' ? 'an approving authority' : 'not an approving authority'}</strong>. {row.why}</p>
                  <Defensible text={row.defensible} />
                </>
              )
            }}
          />
        )}
      </>
    )
  const c = T.gp3RowCheck(s)
  const reading = T.gp3RowReading(s.row.stk)
  const setRow = (p: Partial<GP3['row']>) => up((x) => ({ ...x, row: { ...x.row, ...p } }))
  return (
    <>
      <Instruction>Write one register row for a stakeholder you have not classified: a concern someone else could check, the stakeholder’s interest from 1 to 5 with a short reason, and, if you wish, its influence.</Instruction>
      <div className="gp-form">
        <label className="gp-field">
          <span>Stakeholder</span>
          <select value={s.row.stk} onChange={(e) => setRow({ stk: e.target.value })}>
            <option value="">Choose…</option>
            {T.GP3_ROW_CHOICES.map((o) => <option key={o.id} value={o.id}>{o.id} {o.name}</option>)}
          </select>
        </label>
        <label className="gp-field">
          <span>Concern (what, for whom, where or when)</span>
          <textarea rows={3} value={s.row.concern} onChange={(e) => setRow({ concern: e.target.value })} />
        </label>
        <Choice compact legend="Interest (required; 1 = slight, 5 = intense)" options={['1', '2', '3', '4', '5'].map((v) => ({ id: v, label: v }))} value={s.row.interest || undefined} onChange={(v) => setRow({ interest: v })} />
        <label className="gp-field">
          <span>Reason for the interest rating (required)</span>
          <input type="text" value={s.row.interestReason} onChange={(e) => setRow({ interestReason: e.target.value })} />
        </label>
        <Choice compact legend="Influence (optional; 1 = little, 5 = decisive)" options={['1', '2', '3', '4', '5'].map((v) => ({ id: v, label: v }))} value={s.row.influence || undefined} onChange={(v) => setRow({ influence: v })} />
        <label className="gp-field">
          <span>Reason for the influence rating (optional)</span>
          <input type="text" value={s.row.reason} onChange={(e) => setRow({ reason: e.target.value })} />
        </label>
      </div>
      <CheckBar ready={!!(s.row.stk || s.row.concern)} checked={!!s.rowCheckedAt} onCheck={() => up((x) => ({ ...x, rowCheckedAt: Date.now() }))} missing="Choose a stakeholder and write the concern first." />
      {s.rowCheckedAt && (
        <StructuralBlock r={c} passNote="The concern carries a concrete detail and the interest rating has a reason. The check cannot judge whether the concern is true or important; compare it with the instructor’s register below.">
          {reading && c.ok && (
            <div className="gp-reading" data-testid="gp3-reading">
              <p><strong>The instructor’s register for {reading.name}:</strong> {reading.concern} Interest {reading.interest}; influence {reading.influence}: {reading.reason}.</p>
              <p className="gp-note">A different concern or rating is fine when your reason supports it. This comparison is for reflection, not a key.</p>
            </div>
          )}
        </StructuralBlock>
      )}
      {template}
    </>
  )
}

// =================================================================================================== GP-4
const NODE_POS: Record<string, [number, number]> = { 'STK-010': [115, 50], 'STK-005': [115, 200], 'STK-006': [115, 350], 'STK-002': [340, 50], 'STK-011': [340, 140], 'STK-012': [340, 250], 'STK-003': [340, 350], 'STK-013': [565, 50], 'STK-004': [565, 200] }
function RelationshipMap({ s, onEdge, conflict }: { s: GP4; onEdge: (id: string) => void; conflict?: string }) {
  const node = (id: string) => {
    const [x, y] = NODE_POS[id]
    const name = T.GP4_PAIRS.find((p) => p.source === id)?.sourceName ?? T.GP4_PAIRS.find((p) => p.target === id)?.targetName ?? id
    return (
      <g key={id}>
        <rect x={x - 100} y={y - 22} width={200} height={44} rx={8} className="gp-map-node" />
        <text x={x} y={y + 5} textAnchor="middle" className="gp-map-text">{name}</text>
      </g>
    )
  }
  const pair = conflict ? T.CONFLICT_PAIRS.find((p) => p.id === conflict) : undefined
  const desc = T.GP4_PAIRS.map((p) => `${p.sourceName} ${s.rels.answers[p.id] ? RELATIONSHIP_VERB[s.rels.answers[p.id] as RelationshipType] : '(type not chosen)'} ${p.targetName}.`).join(' ') + (pair ? ` Conflict marked: ${T.pairLabel(pair.id)}.` : '')
  return (
    <figure className="gp-figure gp-map" data-testid="gp4-map">
      <svg viewBox="0 0 680 380" role="group" aria-label="Relationship map">
        <defs>
          <marker id="gp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="gp-map-head" />
          </marker>
        </defs>
        {pair && NODE_POS[pair.a] && NODE_POS[pair.b] && <line x1={NODE_POS[pair.a][0]} y1={NODE_POS[pair.a][1]} x2={NODE_POS[pair.b][0]} y2={NODE_POS[pair.b][1]} className="gp-map-conflict" />}
        {T.GP4_PAIRS.map((p) => {
          const [x1, y1] = NODE_POS[p.source]
          const [x2, y2] = NODE_POS[p.target]
          const horizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1)
          const sx = horizontal ? x1 + Math.sign(x2 - x1) * 100 : x1
          const sy = horizontal ? y1 : y1 + Math.sign(y2 - y1) * 22
          const ex = horizontal ? x2 - Math.sign(x2 - x1) * 100 : x2
          const ey = horizontal ? y2 : y2 - Math.sign(y2 - y1) * 22
          const t = s.rels.answers[p.id] as RelationshipType | undefined
          const label = t ? RELATIONSHIP_VERB[t] : 'choose…'
          const mx = (sx + ex) / 2 + (horizontal ? 0 : 8)
          const my = (sy + ey) / 2 + (horizontal ? -8 : 5)
          return (
            <g key={p.id} className="gp-map-edge" tabIndex={0} role="button" aria-label={`${p.sourceName} ${label} ${p.targetName}: change the type`} onClick={() => onEdge(p.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onEdge(p.id))}>
              <line x1={sx} y1={sy} x2={ex} y2={ey} markerEnd="url(#gp-arrow)" className="gp-map-line" />
              <text x={mx} y={my} textAnchor={horizontal ? 'middle' : 'start'} className={`gp-map-label${t ? '' : ' is-empty'}`}>{label}</text>
            </g>
          )
        })}
        {Object.keys(NODE_POS).map(node)}
      </svg>
      <ul className="gp-map-list" aria-label="Relationships, as a list">
        {T.GP4_PAIRS.map((p) => (
          <li key={p.id}>{p.sourceName} <strong>{s.rels.answers[p.id] ? RELATIONSHIP_VERB[s.rels.answers[p.id] as RelationshipType] : '(choose)'}</strong> {p.targetName}</li>
        ))}
      </ul>
      <figcaption className="gp-caption">Relationship map: an arrow reads “source relationship target”; a dashed line marks the conflict you name in step 2. Press a relationship to change it. <span className="sr-only">{desc}</span></figcaption>
    </figure>
  )
}

export function GP4View({ s, up, step }: { s: GP4; up: Up<GP4>; step: string }) {
  const r = T.gp4Rels(s)
  const selects = useRef<Record<string, HTMLSelectElement | null>>({})
  const uid = useId()
  if (step === 'rels')
    return (
      <>
        <Instruction>For each pair from AeroLink’s register, choose the relationship type the case supports. Then check your answers and read the reasoning for each.</Instruction>
        <RelationshipMap s={s} onEdge={(id) => selects.current[id]?.focus()} />
        <div className="gp-tablewrap">
          <table className="gp-table" data-testid="gp4-table">
            <caption className="sr-only">Stakeholder pairs and their relationship type</caption>
            <thead><tr><th scope="col">From</th><th scope="col">Relationship</th><th scope="col">To</th><th scope="col">Compared with the instructor’s reading</th></tr></thead>
            <tbody>
              {T.GP4_PAIRS.map((p, i) => {
                const row = r.rows[i]
                return (
                  <tr key={p.id} className={r.checked && !row.agrees ? 'is-differ' : ''}>
                    <th scope="row"><Mono>{p.source}</Mono> {p.sourceName}</th>
                    <td>
                      <select ref={(el) => { selects.current[p.id] = el }} aria-label={`Relationship from ${p.sourceName} to ${p.targetName}`} value={s.rels.answers[p.id] ?? ''} onChange={(e) => up((x) => ({ ...x, rels: setAnswer(x.rels, p.id, e.target.value as RelationshipType) }))}>
                        <option value="">Choose…</option>
                        {T.REL_TYPES.map((t) => <option key={t} value={t}>{RELATIONSHIP_VERB[t]}</option>)}
                      </select>
                    </td>
                    <td><Mono>{p.target}</Mono> {p.targetName}</td>
                    <td>{r.checked ? <Agreement agrees={row.agrees} changed={row.changed} why={p.id} /> : <span className="gp-muted">After the check</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <CheckBar ready={r.answered === r.total} checked={r.checked} onCheck={() => up((x) => ({ ...x, rels: runCheck(x.rels) }))} missing={`Choose a type for every pair first (${r.total - r.answered} left).`} />
        {r.checked && (
          <ComparedBlock
            r={r}
            ack={s.rels.ack}
            onAck={(id, v) => up((x) => ({ ...x, rels: setAck(x.rels, id, v) }))}
            render={(id) => {
              const p = T.GP4_PAIRS.find((x) => x.id === id)!
              return (
                <>
                  <p><strong>{p.sourceName} → {p.targetName}.</strong> The instructor’s reading: <strong>“{RELATIONSHIP_VERB[p.type]}”</strong> ({p.id}). {p.why}</p>
                  <Defensible text={p.defensible} />
                </>
              )
            }}
          />
        )}
        {r.checked && <StructuralBlock r={{ ok: true, issues: [] }} passNote="Every pair has a relationship type from the seven course types. This check is structural: it says the record is complete, not that the reading is right." />}
      </>
    )
  if (step === 'conflict') {
    const c = T.gp4ConflictCheck(s)
    const opts = T.concernOptions()
    const chosen = T.CONFLICT_PAIRS.find((p) => p.id === s.conflict.pair)
    const setC = (p: Partial<GP4['conflict']>) => up((x) => ({ ...x, conflict: { ...x.conflict, ...p } }))
    return (
      <>
        <Instruction>One pair of stakeholders in the case has concerns that pull against each other. Choose the pair, the two concerns behind the conflict, and the shared variable both concerns pull on.</Instruction>
        <RelationshipMap s={s} onEdge={() => undefined} conflict={s.conflict.pair} />
        <Choice legend="Which pair is in conflict?" options={T.CONFLICT_PAIRS.map((p) => ({ id: p.id, label: T.pairLabel(p.id) }))} value={s.conflict.pair} onChange={(v) => setC({ pair: v })} />
        <div className="gp-form two">
          {[0, 1].map((k) => (
            <label key={k} className="gp-field" htmlFor={`${uid}-c${k}`}>
              <span>Concern {k === 0 ? 'on one side' : 'on the other side'}</span>
              <select id={`${uid}-c${k}`} value={s.conflict.concerns[k] ?? ''} onChange={(e) => { const next = [...s.conflict.concerns]; next[k] = e.target.value; setC({ concerns: next }) }}>
                <option value="">Choose…</option>
                {opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </label>
          ))}
        </div>
        <label className="gp-field">
          <span>The shared variable both concerns pull on</span>
          <input type="text" value={s.conflict.variable} onChange={(e) => setC({ variable: e.target.value })} />
        </label>
        <CheckBar ready={!!s.conflict.pair} checked={!!s.conflictCheckedAt} onCheck={() => up((x) => ({ ...x, conflictCheckedAt: Date.now() }))} missing="Choose a pair first." />
        {s.conflictCheckedAt && (
          <>
            <StructuralBlock r={c} passNote="The conflict is recorded with a pair, one concern on each side and a shared variable. Structural only: the comparison below is about the reading." />
            {c.ok && chosen && (
              <Feedback kind="compared" title={T.gp4ConflictAgrees(s) ? 'Agrees with the instructor’s reading' : chosen.reading === 'defensible' ? 'Differs from the instructor’s reading, and is defensible' : 'Differs from the instructor’s reading'} testId="fb-compared">
                <p><strong>The instructor’s reading:</strong> the communities and the vertiport operators (REL-002), community noise (CON-012) against pad throughput (CON-006), sharing the variable “{T.CONFLICT_CASE.variable}”.</p>
                <p>{T.CONFLICT_PAIRS[0].why}</p>
                {chosen.id !== T.CONFLICT_CASE.pair && <p><strong>Your pair:</strong> {chosen.why}</p>}
                <p className="gp-note">Your wording of the shared variable is compared, not scored. In your own register this is the relation “conflicting concerns”: record both concerns and the variable they share.</p>
              </Feedback>
            )}
          </>
        )}
      </>
    )
  }
  const g = T.gp4GenericCheck(s)
  return (
    <>
      <Instruction>A register lists “{T.GP4_GENERIC}”. Rewrite it as a concern someone else could check: what exactly worries the insurers, for whom, and where or when it bites.</Instruction>
      <label className="gp-field">
        <span>The insurers’ concern</span>
        <textarea rows={3} value={s.generic} onChange={(e) => up((x) => ({ ...x, generic: e.target.value }))} />
      </label>
      <CheckBar ready={!!s.generic.trim()} checked={!!s.genericCheckedAt} onCheck={() => up((x) => ({ ...x, genericCheckedAt: Date.now() }))} missing="Write the concern first." />
      {s.genericCheckedAt && (
        <StructuralBlock r={g} passNote="The concern names more than a general quality and carries a concrete detail. Whether it is the insurers’ real concern is a judgment; compare it with the instructor’s version.">
          {g.ok && <div className="gp-reading"><p><strong>The instructor’s version (CON-014):</strong> {T.GP4_GENERIC_READING}</p></div>}
        </StructuralBlock>
      )}
    </>
  )
}

// =================================================================================================== GP-5
export function GP5View({ s, up, step, template }: { s: GP5; up: Up<GP5>; step: string; template: ReactNode }) {
  const d = T.gp5Diagnose(s)
  if (step === 'diagnose')
    return (
      <>
        <Instruction>Judge every draft: tick each flaw you see, or tick “Acceptable as written”. Then check and read the instructor’s reading of each draft, with its reference rewrite.</Instruction>
        <ol className="gp-drafts" data-testid="gp5-drafts">
          {T.GP5_DRAFTS.map((it, i) => {
            const row = d.rows[i]
            return (
              <li key={it.id} className={d.checked && !row.agrees ? 'is-differ' : ''}>
                <p className="gp-draft">“{it.before}”</p>
                <fieldset className="gp-flaws">
                  <legend className="sr-only">Flaws in draft {i + 1}</legend>
                  {T.GP5_FLAWS.map((f) => (
                    <label key={f.id}>
                      <input type="checkbox" checked={!!s.critique[it.id]?.[f.id]} onChange={(e) => up((x) => ({ ...x, critique: { ...x.critique, [it.id]: { ...(x.critique[it.id] ?? {}), ok: false, [f.id]: e.target.checked } } }))} />
                      <span>{f.label}</span>
                    </label>
                  ))}
                  <label className="gp-flaw-ok">
                    <input type="checkbox" checked={!!s.critique[it.id]?.ok} onChange={(e) => up((x) => ({ ...x, critique: { ...x.critique, [it.id]: e.target.checked ? { ok: true } : {} } }))} data-testid={`gp5-ok-${it.id}`} />
                    <span>Acceptable as written</span>
                  </label>
                </fieldset>
                {d.checked && <Agreement agrees={row.agrees} changed={row.changed} why={it.id} />}
              </li>
            )
          })}
        </ol>
        <CheckBar ready={T.gp5AllJudged(s)} checked={d.checked} onCheck={() => up((x) => ({ ...x, critiqueChecked: JSON.parse(JSON.stringify(x.critique)), critiqueCheckedAt: Date.now(), critiqueAck: Object.fromEntries(Object.entries(x.critiqueAck).filter(([k, v]) => v && JSON.stringify(x.critiqueChecked?.[k] ?? {}) === JSON.stringify(x.critique[k] ?? {}))) }))} missing={`Judge every draft first: tick its flaws or “Acceptable as written” (${T.GP5_DRAFTS.filter((dd) => !T.gp5Judged(s.critique[dd.id])).length} left).`} />
        {d.checked && (
          <ComparedBlock
            r={d}
            ack={s.critiqueAck}
            onAck={(id, v) => up((x) => ({ ...x, critiqueAck: { ...x.critiqueAck, [id]: v } }))}
            render={(id) => {
              const it = T.GP5_DRAFTS.find((x) => x.id === id)!
              const key = it.key.length ? it.key.map((k) => T.GP5_FLAWS.find((f) => f.id === k)!.label.toLowerCase()).join('; ') : 'acceptable as written'
              return (
                <>
                  <p><strong>“{it.before}”</strong> The instructor’s reading: <strong>{key}</strong>. {it.note}</p>
                  <p className="gp-rewrite"><strong>Reference rewrite:</strong> {it.after}{it.afterCondition ? ` Condition: ${it.afterCondition}` : ''}</p>
                </>
              )
            }}
          />
        )}
      </>
    )
  const dr = s.draft
  const a = assessAeroLinkNeed(dr)
  const blockers = T.gp5DraftBlockers(s)
  const w = T.gp5Write(s)
  const edit = (p: Partial<NeedDraft>, wording = false) => up((x) => ({ ...x, draft: { ...x.draft, ...p, ...(wording ? { selfCheck: {} } : {}) } }))
  const started = !!(dr.text || dr.name || dr.rationale || dr.conditions || dr.traces.length)
  return (
    <>
      <Instruction>Write two needs for the new vertiport, each from a different stakeholder of the case register, in the recommended form “{NEED_FORM}”. Fix what the course check reports, rewrite or justify each warning, confirm the six checks, and record the need.</Instruction>
      <div className="gp-form">
        <label className="gp-field"><span>Stakeholder the need comes from</span>
          <select value={dr.traces[0] ?? ''} onChange={(e) => edit({ traces: e.target.value ? [e.target.value] : [] })}>
            <option value="">Choose…</option>
            {T.REGISTER_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.id} {o.name}</option>)}
          </select>
        </label>
        <label className="gp-field"><span>Need statement</span><textarea rows={3} value={dr.text} onChange={(e) => edit({ text: e.target.value }, true)} /></label>
        <label className="gp-field"><span>Condition (when, where, under what operating conditions)</span><input type="text" value={dr.conditions} onChange={(e) => edit({ conditions: e.target.value }, true)} /></label>
        <label className="gp-field"><span>Rationale (why the stakeholder needs it)</span><input type="text" value={dr.rationale} onChange={(e) => edit({ rationale: e.target.value })} /></label>
        <label className="gp-field"><span>Short name</span><input type="text" value={dr.name} onChange={(e) => edit({ name: e.target.value })} /></label>
      </div>
      {started && (
        <>
          <Feedback kind="structural" tone={a.gates.every((g) => g.ok) && a.completeness.every((c) => c.ok) ? 'pass' : 'fail'} title={a.gates.every((g) => g.ok) && a.completeness.every((c) => c.ok) ? 'Passes the course check' : `Does not pass yet: ${T.plain([...a.gates, ...a.completeness].find((g) => !g.ok)!.message)}`} testId="fb-structural">
            <ul className="gp-gates">
              {[...a.gates, ...a.completeness].map((g) => <li key={g.id} className={g.ok ? 'is-ok' : 'is-no'}>{g.ok ? 'Passes' : 'Not yet'}: {T.plain(g.message)}</li>)}
            </ul>
            {a.warnings.length > 0 && (
              <>
                <p><strong>Warnings</strong> (the check cannot judge these; rewrite or justify):</p>
                <ul>{a.warnings.map((x) => <li key={x.id}>{T.plain(x.message)}</li>)}</ul>
                <label className="gp-field"><span>Justification for any warning that stays</span><input type="text" value={dr.justification ?? ''} onChange={(e) => edit({ justification: e.target.value })} /></label>
              </>
            )}
            {a.advice.map((x) => <p key={x.id} className="gp-note">{T.plain(x.message)}</p>)}
          </Feedback>
          <fieldset className="gp-selfcheck">
            <legend>Self-check: confirm each of the six checks (your judgment)</legend>
            {SELF_CHECK.map((c) => (
              <label key={c.id}>
                <input type="checkbox" checked={!!dr.selfCheck?.[c.id]} onChange={(e) => edit({ selfCheck: { ...(dr.selfCheck ?? {}), [c.id]: e.target.checked } })} />
                <span><strong>{c.gate}.</strong> {T.plain(c.label)}</span>
              </label>
            ))}
          </fieldset>
        </>
      )}
      <div className="gp-checkbar">
        <button type="button" className="gp-btn course" disabled={draftBlockers(dr).length > 0} data-testid="gp5-record" onClick={() => up((x) => ({ ...x, pnSeq: (x.pnSeq ?? 0) + 1, needs: [...x.needs, { ...x.draft, id: `PN-${(x.pnSeq ?? 0) + 1}`, at: Date.now() }], draft: { name: '', text: '', conditions: '', rationale: '', traces: [], selfCheck: {}, justification: '' } }))}>
          Record this need
        </button>
        {started && blockers.length > 0 && <span className="gp-hint">Not yet: {blockers[0]}</span>}
      </div>
      {s.needs.length > 0 && (
        <>
          <h3 className="gp-h3">Your recorded needs</h3>
          <ul className="gp-needs" data-testid="gp5-needs">
            {s.needs.map((n) => {
              const reading = T.gp5Reading(n.traces[0] ?? '')
              return (
                <li key={n.id}>
                  <p><strong>{n.name || n.id}</strong> ({n.traces.join(', ')}): {n.text}</p>
                  {reading && <p className="gp-reading-inline"><strong>Compare with the instructor’s {reading.id}:</strong> {reading.statement} Condition: {reading.condition}</p>}
                  <button type="button" className="gp-btn small" onClick={() => up((x) => ({ ...x, draft: { ...n }, needs: x.needs.filter((y) => y.id !== n.id) }))}>Revise</button>
                </li>
              )
            })}
          </ul>
          <StructuralBlock r={w} passNote="Two needs from two different stakeholders pass the course check and the six checks are confirmed. Compare each with the instructor’s need for the same stakeholder: the check cannot tell whether a need is the right one." />
        </>
      )}
      {template}
    </>
  )
}

// =================================================================================================== GP-6
export function GP6View({ s, up, step, handoff }: { s: GP6; up: Up<GP6>; step: string; handoff: ReactNode }) {
  const r = T.gp6Links(s)
  if (step === 'links')
    return (
      <>
        <Instruction>Link each need to the mission or the objective it serves most directly. Then check and read the reasoning.</Instruction>
        <ul className="gp-objectives" aria-label="Mission and objectives">
          {T.OBJECTIVE_OPTIONS.map((o) => <li key={o.id}>{o.label}</li>)}
        </ul>
        <div className="gp-tablewrap">
          <table className="gp-table" data-testid="gp6-table">
            <caption className="sr-only">Needs and the mission or objective each serves</caption>
            <thead><tr><th scope="col">Need</th><th scope="col">Serves</th><th scope="col">Compared</th></tr></thead>
            <tbody>
              {T.GP6_NEEDS.map((n, i) => {
                const row = r.rows[i]
                return (
                  <tr key={n.id} className={r.checked && !row.agrees ? 'is-differ' : ''}>
                    <th scope="row"><Mono>{n.id}</Mono> {n.statement}</th>
                    <td>
                      <select aria-label={`Mission or objective served by ${n.id}`} value={s.links.answers[n.id] ?? ''} onChange={(e) => up((x) => ({ ...x, links: setAnswer(x.links, n.id, e.target.value) }))}>
                        <option value="">Choose…</option>
                        {T.OBJECTIVE_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                    </td>
                    <td>{r.checked ? <Agreement agrees={row.agrees} changed={row.changed} why={n.id} /> : <span className="gp-muted">After the check</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <CheckBar ready={r.answered === r.total} checked={r.checked} onCheck={() => up((x) => ({ ...x, links: runCheck(x.links) }))} missing={`Link every need first (${r.total - r.answered} left).`} />
        {r.checked && (
          <ComparedBlock
            r={r}
            ack={s.links.ack}
            onAck={(id, v) => up((x) => ({ ...x, links: setAck(x.links, id, v) }))}
            render={(id) => {
              const n = T.GP6_NEEDS.find((x) => x.id === id)!
              return (
                <>
                  <p><strong>{n.id}.</strong> The instructor’s reading: <strong>{T.objectiveLabel(n.mgo)}</strong>. {n.why}</p>
                  <Defensible text={n.defensible} />
                </>
              )
            }}
          />
        )}
      </>
    )
  const rows = T.coverageRows()
  const c = T.gp6GapCheck(s)
  const setG = (p: Partial<GP6['gap']>) => up((x) => ({ ...x, gap: { ...x.gap, ...p } }))
  const agrees = !!s.gap.stakeholder && T.GAP_STAKEHOLDERS.includes(s.gap.stakeholder)
  return (
    <>
      <Instruction>Read the coverage matrix: how many needs trace to each stakeholder. Find the stakeholder with no need, decide whether to add a need or record why not, and write the reason.</Instruction>
      <div className="gp-tablewrap">
        <table className="gp-table gp-coverage" data-testid="gp6-coverage">
          <caption>Coverage matrix: needs traced to each stakeholder of the case register</caption>
          <thead><tr><th scope="col">Stakeholder</th><th scope="col">As the subject</th><th scope="col">As a contributing source</th></tr></thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id}>
                <th scope="row"><Mono>{x.id}</Mono> {x.name}</th>
                <td className="gp-num">{x.subject}</td>
                <td className="gp-num">{x.contributing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="gp-form">
        <label className="gp-field"><span>The stakeholder with no need</span>
          <select value={s.gap.stakeholder ?? ''} onChange={(e) => setG({ stakeholder: e.target.value || undefined })}>
            <option value="">Choose…</option>
            {rows.map((x) => <option key={x.id} value={x.id}>{x.id} {x.name}</option>)}
          </select>
        </label>
        <Choice legend="Your decision" options={[{ id: 'add', label: 'Add a need' }, { id: 'record', label: 'Record why not' }]} value={s.gap.decision} onChange={(v) => setG({ decision: v })} />
        <label className="gp-field"><span>Reason (a full sentence a reviewer could challenge)</span><textarea rows={3} value={s.gap.reason} onChange={(e) => setG({ reason: e.target.value })} /></label>
      </div>
      <CheckBar ready={!!(s.gap.stakeholder || s.gap.reason)} checked={!!s.gapCheckedAt} onCheck={() => up((x) => ({ ...x, gapCheckedAt: Date.now() }))} missing="Choose the stakeholder first." />
      {s.gapCheckedAt && (
        <>
          <StructuralBlock r={c} passNote="The gap is named, a decision is made and the reason is written. Structural only: whether the reason holds is yours and the instructor’s to judge." />
          {c.ok && (
            <Feedback kind="compared" title={agrees ? 'Agrees with the instructor’s reading' : 'Differs from the instructor’s reading'} testId="fb-compared">
              <p><strong>The instructor’s reading:</strong> {T.GAP_CASE.finding} {T.GAP_CASE.why}</p>
              <p><strong>Your decision:</strong> {s.gap.decision === 'record' ? 'record why not, which is the case’s handling.' : 'add a need. That is defensible when there is a new concern: '}{s.gap.decision === 'add' ? T.GAP_CASE.debate : ''}</p>
              <p>{T.GAP_CASE.teaching}</p>
            </Feedback>
          )}
        </>
      )}
      {handoff}
    </>
  )
}

