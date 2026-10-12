// Check & submit stage (WEEK1_LEARNING_DESIGN §5–§6): per-objective status, readiness quiz Q1, the L1 team record,
// the individual leverage-point memo, and the bridge to Week 2. Section checks never count towards a grade.
import { ArrowRight, Download } from 'lucide-react'
import { WEEKS } from '../content/course'
import { WEEK1_QUIZ } from '../content/quizWeek1'
import week01 from '../content/weeks/week01'
import { BRIDGE, LEARN_SECTIONS } from '../content/learn/week01'
import { Quiz } from '../components/Quiz'
import { Link, navigate } from '../lib/router'
import { useApp } from '../state/AppState'
import { downloadText } from '../workbench/download'
import { useFlow } from './state'
import { firstAttemptCorrect, preselectWorkbenchView } from './storage'

type Status = 'secure' | 'review' | 'not yet'
const DOT: Record<Status, string> = { secure: 'var(--wb-ok)', review: 'var(--wb-warn)', 'not yet': 'var(--wb-line-strong)' }

function ObjectiveStatus() {
  const { state } = useFlow()
  const { quiz } = useApp()
  const rows = WEEKS[0].objectives.map((o) => {
    const checks = LEARN_SECTIONS.filter((s) => s.check.objective === o.id)
    const items = WEEK1_QUIZ.filter((q) => q.objective === o.id)
    const results = [...checks.map((s) => firstAttemptCorrect(state.checks[s.id])), ...items.map((q) => quiz[q.id]?.correct)]
    const answered = results.filter((r) => r !== undefined)
    const status: Status = answered.length === 0 ? 'not yet' : answered.every(Boolean) && answered.length === results.length ? 'secure' : answered.some((r) => r === false) ? 'review' : 'not yet'
    const teach = LEARN_SECTIONS.filter((s) => s.objectives.includes(o.id))
    return { o, checks, items, answered: answered.length, correct: answered.filter(Boolean).length, total: results.length, status, teach }
  })
  return (
    <div className="lf-table-wrap lf-card" style={{ padding: 0 }}>
      <table className="lf-table" data-testid="objective-status">
        <caption className="sr-only">Status by objective, from the section checks and the readiness quiz items tagged with each objective</caption>
        <thead>
          <tr>
            <th scope="col">Objective</th>
            <th scope="col">Checks and quiz items</th>
            <th scope="col">Status</th>
            <th scope="col">Revisit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.o.id}>
              <td>
                <span className="wb-mono text-[12.5px]">{r.o.id}</span> {r.o.text}
              </td>
              <td className="wb-mono text-[13px]">
                {r.correct}/{r.total} correct ({r.answered} answered)
              </td>
              <td>
                <span className="lf-status-dot" style={{ background: DOT[r.status] }} aria-hidden />
                {r.status}
              </td>
              <td className="text-[14px]">
                {r.status === 'secure'
                  ? '—'
                  : r.teach.map((s, i) => (
                      <span key={s.id}>
                        {i > 0 && ', '}
                        <Link to={`/week/1/learn/${s.id}`}>{s.code}</Link>
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

function Memo() {
  const { state, patch } = useFlow()
  const a = week01.assignment
  const words = Object.values(state.memo).join(' ').split(/\s+/).filter(Boolean).length
  const download = () => {
    const md = [`# ${a.title}: leverage-point memo`, '', `Due: ${a.due}. Rubrics: ${a.rubrics.join(', ')}. AeroLink values are FICTIONAL.`, '', ...a.template.flatMap((t) => [`## ${t.heading}`, '', state.memo[t.heading]?.trim() || '_(not written yet)_', ''])].join('\n')
    downloadText('week1-leverage-memo.md', md, 'text/markdown')
  }
  return (
    <div className="lf-memo">
      <ul className="lf-list">
        {a.instructions.slice(1).map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
      {a.template.map((t) => (
        <div key={t.heading} className="mt-4">
          <label className="block">
            <span className="font-semibold">{t.heading}</span>
            <span className="lf-muted block text-[14px]">{t.guidance}</span>
            <textarea className="mt-1" value={state.memo[t.heading] ?? ''} onChange={(e) => patch('memo', { ...state.memo, [t.heading]: e.target.value })} />
          </label>
        </div>
      ))}
      <div className="lf-actions">
        <button type="button" className="lf-btn" onClick={download}>
          <Download size={14} aria-hidden /> Download the memo draft (.md)
        </button>
        <span className="lf-muted text-[14px]">{words} words · one page is the limit · saved in this browser only; submit the file as your course directs.</span>
      </div>
      <p className="lf-muted mt-3 text-[14px]">
        <strong>AI use.</strong> {a.aiUse}
      </p>
    </div>
  )
}

export function CheckSubmit() {
  const lab = week01.lab
  return (
    <div className="lf-page" data-testid="stage-check-page">
      <p className="lf-kicker">Week 1 · Check & submit</p>
      <h1 className="lf-h1">Check your understanding and submit</h1>
      <p className="lf-lede">Due {week01.assignment.due.toLowerCase()}. {week01.assignment.weight}</p>

      <h2 className="lf-h2">Where you stand, by objective</h2>
      <p className="lf-muted text-[15px]">From the first attempt at each section check and the quiz items tagged with each objective. Section checks never count towards a grade.</p>
      <ObjectiveStatus />

      <h2 className="lf-h2" id="quiz">
        Readiness quiz Q1
      </h2>
      <p className="lf-muted text-[15px]">Ten questions, formative. Every option has an explanation; each question cites its source. The workbench’s recall mission reads the same answers.</p>
      <div className="lf-wide">
        <Quiz questions={WEEK1_QUIZ} />
      </div>

      <h2 className="lf-h2">
        L1 team record <span className="lf-chip">team · Session 2</span>
      </h2>
      <div className="lf-grid2">
        <div className="lf-prose">
          <p>{week01.assignment.instructions[0]}</p>
          <ul className="lf-list">
            {lab.artefacts.map((x) => (
              <li key={x.idPrefix}>
                <span className="wb-mono text-[13px]">{x.idPrefix}</span> {x.description}: <span className="lf-muted">{x.minimum}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lf-card">
          <p className="m-0 text-[15px]">The record is built in the workbench’s L1 record view, with completeness checked as you go. Export it from there.</p>
          <div className="lf-actions" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="lf-btn"
              onClick={() => {
                preselectWorkbenchView('l1')
                navigate('/week/1/practice')
              }}
            >
              Open the L1 record view <ArrowRight size={15} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <h2 className="lf-h2">
        Leverage-point memo <span className="lf-chip">individual · graduate</span>
      </h2>
      <div className="lf-wide">
        <Memo />
      </div>

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 2</p>
        <h2 id="bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          {BRIDGE.forwardQuestion.text}
        </h2>
        <p className="text-[15.5px]">{lab.continuity}</p>
        <p className="lf-muted text-[14.5px]">{BRIDGE.spacing.text}</p>
        <Link to="/week/2" className="lf-btn">
          Week 2: {WEEKS[1].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
