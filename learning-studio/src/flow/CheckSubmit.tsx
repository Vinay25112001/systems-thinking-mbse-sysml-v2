// Check & submit stage (WEEK1_LEARNING_DESIGN §5–§6, §10): per-objective status, readiness quiz Q1, the Week 1 Team
// Record (what each part must contain, the minimums, format, where to submit, the rubric rows, and where the team's
// record stands), the model inputs it exports and the SysML v2 elements they later seed, the graduate needs review, and
// the bridge to Week 2. Review of commit 0f3ebcb: F02 (three record states: not ready, submitted for approval, ready),
// F13 (at 400 px the tables become cards, captions sit outside the scroll wrappers, and the rubric, the model-inputs map
// and the graduate review are collapsible), F08 (rubric cells render their bold text instead of literal asterisks).
import { ArrowRight, CircleCheck, Download, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { WEEKS } from '../content/course'
import { WEEK1_QUIZ } from '../content/quizWeek1'
import week01 from '../content/weeks/week01'
import { BRIDGE, GRAD_REVIEW, LEARN_SECTIONS, MODEL_INPUTS, TEAM_RECORD, teamRecordTemplate } from '../content/learn/week01'
import { getRubric } from '../content/rubrics'
import { Quiz } from '../components/Quiz'
import { Link, navigate } from '../lib/router'
import { useApp } from '../state/AppState'
import { downloadText } from '../workbench/download'
import { Cite } from './Cite'
import { teamRecordStatus } from './modelInputs'
import { bloomLabel } from './route'
import { useFlow } from './state'
import { firstAttemptCorrect, preselectWorkbenchView } from './storage'
import { LEARN_TO_LESSON, WEEK1_PATHS } from '../week1/route'

type Status = 'secure' | 'review' | 'not yet'
const DOT: Record<Status, string> = { secure: 'var(--wb-ok)', review: 'var(--wb-warn)', 'not yet': 'var(--wb-line-strong)' }

/** Renders the rubric register's inline **bold** as bold (the register is Markdown; the app never retypes it). */
function inline(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))
}

export function ObjectiveStatus() {
  const { state } = useFlow()
  const { quiz } = useApp()
  const rows = WEEKS[0].objectives.map((o) => {
    const checks = LEARN_SECTIONS.filter((s) => s.check.objective === o.id)
    const items = WEEK1_QUIZ.filter((q) => q.objective === o.id)
    // the lesson self-checks are optional (2026-10-19): only the answered ones count, the quiz items always do
    const results = [...checks.map((s) => firstAttemptCorrect(state.checks[s.id])).filter((r) => r !== undefined), ...items.map((q) => quiz[q.id]?.correct)]
    const answered = results.filter((r) => r !== undefined)
    const status: Status = answered.length === 0 ? 'not yet' : answered.every(Boolean) && answered.length === results.length ? 'secure' : answered.some((r) => r === false) ? 'review' : 'not yet'
    const teach = LEARN_SECTIONS.filter((s) => s.objectives.includes(o.id))
    return { o, answered: answered.length, correct: answered.filter(Boolean).length, total: results.length, status, teach }
  })
  return (
    <div className="lf-card" style={{ padding: 0 }}>
      <table className="lf-table lf-cards" data-testid="objective-status">
        <caption className="sr-only">Status by objective, from the lesson self-checks and the readiness quiz items tagged with each objective</caption>
        <thead>
          <tr>
            <th scope="col">Objective</th>
            <th scope="col">Self-checks and quiz items</th>
            <th scope="col">Status</th>
            <th scope="col">Revisit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.o.id}>
              <td data-label="Objective">
                <span className="wb-mono text-[12.5px]">{r.o.id}</span> {r.o.text} <span className="lf-chip">{bloomLabel(r.o.bloom)}</span>
              </td>
              <td className="wb-mono text-[13px]" data-label="Checks and quiz">
                {r.correct}/{r.total} correct ({r.answered} answered)
              </td>
              <td data-label="Status">
                <span className="lf-status-dot" style={{ background: DOT[r.status] }} aria-hidden />
                {r.status}
              </td>
              <td className="text-[14px]" data-label="Revisit">
                {r.status === 'secure'
                  ? '—'
                  : r.teach.map((s, i) => (
                      <span key={s.id}>
                        {i > 0 && ', '}
                        <Link to={`/week/1/lesson/${LEARN_TO_LESSON[s.id]}`}>{s.title}</Link>
                      </span>
                    ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** A rubric row read from the rubric register (never retyped). */
function rubricRow(id: string, criterion: string): string[] {
  const part = getRubric(id).parts.find((p) => p.type === 'table')
  const row = part && part.type === 'table' ? part.rows.find((r) => r[0] === criterion) : undefined
  if (!row) throw new Error(`${id} has no criterion ${criterion}`)
  return row
}

const LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export function RubricTable({ rows, caption, testId }: { rows: [string, string][]; caption: string; testId: string }) {
  return (
    <>
      <p className="lf-figcaption" style={{ marginTop: 10 }} id={`${testId}-cap`}>
        {caption}
      </p>
      <div className="lf-card" style={{ padding: 0, marginTop: 6 }}>
        <table className="lf-table lf-cards" data-testid={testId} aria-describedby={`${testId}-cap`}>
          <caption className="sr-only">Rubric rows, levels 4 to 1</caption>
          <thead>
            <tr>
              <th scope="col">Criterion</th>
              {LEVELS.map((l) => (
                <th key={l} scope="col">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([rb, c]) => {
              const row = rubricRow(rb, c)
              return (
                <tr key={`${rb}-${c}`}>
                  <th scope="row" className="text-left">
                    {rb}.{row[0].split('.')[1]} {row[1]}
                  </th>
                  {row.slice(2, 6).map((x, i) => (
                    <td key={i} className="text-[14px]" data-label={LEVELS[i]}>
                      {inline(x)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function RecordReadiness() {
  const st = teamRecordStatus()
  const name = st.record.proposal.name ? `: ${st.record.proposal.name}` : ''
  return (
    <div className={`lf-card ${st.ready ? 'lf-ready' : ''}`} data-testid="record-readiness" data-state={st.state} role="status">
      <p className="m-0 font-semibold">
        {st.state === 'ready' ? (
          <>
            <CircleCheck size={16} aria-hidden className="mr-1 inline" /> Your Team Record is ready to submit{name}.
          </>
        ) : st.state === 'pending-approval' ? (
          <>
            <Info size={16} aria-hidden className="mr-1 inline" /> Submitted for approval, not ready{name}. Your record is complete and exported, but the instructor has not approved the proposal. You may upload it for Week 1, labeled “submitted for approval”; approval is required before the Week 2 submission.
          </>
        ) : (
          <>
            <Info size={16} aria-hidden className="mr-1 inline" /> Your Team Record is not ready yet. The checks below are the ones the instructor applies first.
          </>
        )}
      </p>
      <ul className="lf-plain" style={{ marginTop: 6 }}>
        {st.parts.map((p) => (
          <li key={p.id} className="flex items-start gap-2 py-0.5 text-[14.5px]">
            <span className={`lf-chip ${p.check.ok ? 'ok' : ''}`}>{p.check.ok ? 'complete' : 'to do'}</span>
            <span>
              <strong>{p.label}.</strong> {p.check.ok ? p.check.detail : p.check.issues[0]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function TeamRecordSection() {
  return (
    <section aria-labelledby="record-h" data-testid="team-record">
      <h2 className="lf-h2" id="record-h">
        Week 1 Team Record <span className="lf-chip">team · your own enterprise</span>
      </h2>
      <p className="lf-prose">{TEAM_RECORD.summary.text}</p>
      <RecordReadiness />
      <h3 className="lf-h3">What your team hands in</h3>
      <div className="lf-card" style={{ padding: 0 }}>
        <table className="lf-table lf-cards" data-testid="record-checklist">
          <caption className="sr-only">The parts of the Week 1 Team Record: the evidence each must contain, its minimum, and how it is judged</caption>
          <thead>
            <tr>
              <th scope="col">Part</th>
              <th scope="col">Evidence required</th>
              <th scope="col">Minimum (completeness check)</th>
              <th scope="col">Judged by</th>
            </tr>
          </thead>
          <tbody>
            {TEAM_RECORD.parts.map((p) => (
              <tr key={p.id}>
                <th scope="row" className="text-left font-semibold">
                  {p.heading}
                </th>
                <td className="text-[14.5px]" data-label="Evidence">
                  {p.evidence.text}
                </td>
                <td className="text-[14px]" data-label="Minimum">
                  {p.minimum}
                </td>
                <td className="text-[14px]" data-label="Judged by">
                  {p.judged}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="lf-terms" style={{ marginTop: 14 }}>
        <div className="contents">
          <dt>Format</dt>
          <dd>{TEAM_RECORD.format.text}</dd>
        </div>
        <div className="contents">
          <dt>Where and when</dt>
          <dd>{TEAM_RECORD.where.text}</dd>
        </div>
        <div className="contents">
          <dt>How it is graded</dt>
          <dd>{TEAM_RECORD.grading.text}</dd>
        </div>
      </dl>
      <details className="lf-deeper lf-wide" data-testid="record-rubric-details">
        <summary>The rubric rows this record is judged against</summary>
        <RubricTable rows={TEAM_RECORD.rubricRows} caption={TEAM_RECORD.rubricNote.text} testId="record-rubric" />
      </details>
      <div className="lf-actions">
        <button
          type="button"
          className="lf-btn primary"
          onClick={() => {
            preselectWorkbenchView('team')
            navigate(WEEK1_PATHS['lab-tool'])
          }}
          data-testid="open-team-view"
        >
          Open the Team enterprise view <ArrowRight size={15} aria-hidden />
        </button>
        <button type="button" className="lf-btn" onClick={() => downloadText('team-NN-week1-record-template.md', teamRecordTemplate(), 'text/markdown')} data-testid="record-template">
          <Download size={14} aria-hidden /> Download the blank template (.md)
        </button>
      </div>
      <p className="lf-muted mt-2 text-[14px]">
        <strong>AI use.</strong> {week01.assignment.aiUse}
      </p>
    </section>
  )
}

export function ModelInputsSection() {
  return (
    <section aria-labelledby="inputs-h" data-testid="model-inputs">
      <h2 className="lf-h2" id="inputs-h">
        Week 1 model inputs: what your record will seed in SysML v2
      </h2>
      <p className="lf-prose">{MODEL_INPUTS.lede.text}</p>
      <details className="lf-deeper lf-wide" data-testid="model-inputs-details">
        <summary>The SysML v2 element each item seeds (Phase II reading)</summary>
        <p className="lf-figcaption" id="model-inputs-cap">
          {MODEL_INPUTS.phaseNote.text}
        </p>
        <div className="lf-card" style={{ padding: 0, marginTop: 6 }}>
          <table className="lf-table lf-cards" data-testid="model-inputs-map" aria-describedby="model-inputs-cap">
            <caption className="sr-only">Week 1 items, how they are captured, and the SysML v2 elements they seed</caption>
            <thead>
              <tr>
                <th scope="col">Week 1 item</th>
                <th scope="col">Captured as</th>
                <th scope="col">Seeds in SysML v2 (Phase II reading)</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_INPUTS.rows.map((r) => (
                <tr key={r.id}>
                  <th scope="row" className="text-left font-semibold">
                    {r.item}
                  </th>
                  <td className="text-[14px]" data-label="Captured as">
                    {r.captured}
                  </td>
                  <td className="text-[14px]" data-label="Seeds">
                    <ul className="lf-plain">
                      {r.seeds.map((s, i) => (
                        <li key={i} className="py-0.5">
                          <code>{s.element}</code>: {s.note}
                          {s.cite && (
                            <>
                              {' '}
                              <Cite c={s.cite} />
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}

export function GraduateSection() {
  return (
    <section aria-labelledby="grad-h" data-testid="graduate-review">
      <h2 className="lf-h2" id="grad-h">
        {GRAD_REVIEW.heading} <span className="lf-chip">individual · graduate</span>
      </h2>
      <p className="lf-prose">{GRAD_REVIEW.what.text}</p>
      <details className="lf-deeper lf-wide" data-testid="graduate-details">
        <summary>Format, route, grading and rubric row</summary>
        <dl className="lf-terms">
          <div className="contents">
            <dt>Format</dt>
            <dd>{GRAD_REVIEW.format.text}</dd>
          </div>
          <div className="contents">
            <dt>Where and when</dt>
            <dd>{GRAD_REVIEW.where.text}</dd>
          </div>
          <div className="contents">
            <dt>How it is graded</dt>
            <dd>{GRAD_REVIEW.grading.text}</dd>
          </div>
        </dl>
        <RubricTable rows={[['RB-2', '2.2']]} caption="The rubric row applied to the four revised needs (levels 4 to 1)." testId="graduate-rubric" />
      </details>
    </section>
  )
}

export function CheckSubmit() {
  return (
    <div className="lf-page" data-testid="stage-check-page">
      <p className="lf-kicker">Week 1 · Check & submit</p>
      <h1 className="lf-h1">Check your understanding and submit</h1>
      <p className="lf-lede">
        Due {week01.assignment.due.toLowerCase()}. {week01.assignment.weight}
      </p>

      <h2 className="lf-h2">Where you stand, by objective</h2>
      <p className="lf-muted text-[15px]">From the first attempt at each section check and the quiz items tagged with each objective. Section checks never count toward a grade.</p>
      <ObjectiveStatus />

      <h2 className="lf-h2" id="quiz">
        Readiness quiz Q1
      </h2>
      <p className="lf-muted text-[15px]">Ten questions, formative. Every option has an explanation; each question cites its source. The workbench’s recall mission reads the same answers.</p>
      <div className="lf-wide">
        <Quiz questions={WEEK1_QUIZ} bloomText={bloomLabel} />
      </div>

      <TeamRecordSection />

      <ModelInputsSection />

      <GraduateSection />

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 2</p>
        <h2 id="bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          {BRIDGE.forwardQuestion.text}
        </h2>
        <p className="text-[15.5px]">{BRIDGE.continuity.text}</p>
        <p className="lf-muted text-[14.5px]">{BRIDGE.spacing.text}</p>
        <Link to="/week/2" className="lf-btn">
          Week 2: {WEEKS[1].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
