// Overview stage: the week opener (Gagné events 1–3; WEEK1_LEARNING_DESIGN §4, §10). Order (review F12): what the week
// teaches and why, the week's path, Meet AeroLink, and only then the question and the locked prediction.
import { ArrowRight, Lock } from 'lucide-react'
import { useState } from 'react'
import { WEEKS } from '../content/course'
import { WEEK1_INTRO } from '../content/week1'
import week01 from '../content/weeks/week01'
import { workloadTotal } from '../content/schema'
import week1Missions from '../content/missions/week01'
import { LEARN_SECTIONS, MEET_AEROLINK, OPENER, WORKLOAD_BUDGET, WORKLOAD_NOTE } from '../content/learn/week01'
import { FigureFrame } from '../components/figures/Frame'
import { WeekPathFigure } from '../components/figures/StakeholderFigures'
import { Link } from '../lib/router'
import { bloomLabel } from './route'
import { useFlow } from './state'
import { readPrediction, recordPrediction } from './storage'

const W1 = WEEKS[0]
const predictStep = week1Missions.missions.find((m) => m.id === 'w1-m1-who')!.steps.find((s) => s.id === 'predict')!

function Prediction() {
  const [recorded, setRecorded] = useState(readPrediction)
  const [draft, setDraft] = useState('')
  const options = predictStep.input!.options!
  return (
    <section className="lf-card" aria-labelledby="predict-h" data-testid="opener-prediction">
      <h2 id="predict-h" className="lf-h3" style={{ marginTop: 0 }}>
        Your prediction, before any explanation
      </h2>
      <fieldset className="m-0 border-0 p-0">
        <legend className="lf-check-prompt">{WEEK1_INTRO.question}</legend>
        {options.map((o) => (
          <label key={o.id} className="lf-option">
            <input type="radio" name="w1-prediction" value={o.id} checked={(recorded?.value ?? draft) === o.id} disabled={!!recorded} onChange={() => setDraft(o.id)} />
            <span>{o.text}</span>
          </label>
        ))}
      </fieldset>
      {recorded ? (
        <p className="m-0 flex items-center gap-2 text-[15px]" role="status">
          <Lock size={14} aria-hidden /> Recorded and locked. You will compare it with the stakeholders you find in the first Practice mission.
        </p>
      ) : (
        <div className="lf-actions" style={{ marginTop: 8 }}>
          <button type="button" className="lf-btn primary" disabled={!draft} onClick={() => setRecorded(recordPrediction(draft))}>
            Record my prediction
          </button>
          <span className="lf-muted text-[14px]">{predictStep.hint?.split('.')[0]}.</span>
        </div>
      )}
    </section>
  )
}

export function Overview() {
  const { state, patch } = useFlow()
  const total = workloadTotal(week01.workload)
  return (
    <div className="lf-page" data-testid="stage-overview-page">
      <p className="lf-kicker">Week 1 · Overview</p>
      <h1 className="lf-h1">Week 1 — {W1.title}</h1>
      <section aria-labelledby="what-why-h" data-testid="opener-what-why">
        <h2 id="what-why-h" className="sr-only">
          What you will learn this week, and why
        </h2>
        <p className="lf-lede lf-column" data-testid="opener-intro">
          {OPENER.intro.text}
        </p>
        <div className="lf-column lf-prose">
          <p data-testid="opener-why">{OPENER.why.text}</p>
          <p>{OPENER.how.text}</p>
        </div>
      </section>
      <FigureFrame spec={OPENER.weekPath}>
        <WeekPathFigure alt={OPENER.weekPath.alt} />
      </FigureFrame>

      <section className="lf-meet lf-prose" aria-labelledby="meet-h" data-testid="meet-aerolink">
        <h2 id="meet-h" className="lf-h2">
          Meet AeroLink, the instructor’s worked example
        </h2>
        <p>{MEET_AEROLINK.what.text}</p>
        <p>{MEET_AEROLINK.conopsIntro.text}</p>
        <ol>
          {MEET_AEROLINK.conops.map((c, i) => (
            <li key={i}>{c.text}</li>
          ))}
        </ol>
        <p>{MEET_AEROLINK.use.text}</p>
        <p className="lf-muted">{MEET_AEROLINK.readFirst.text}</p>
      </section>

      <section aria-labelledby="question-h" data-testid="opener-question">
        <h2 id="question-h" className="lf-h2">
          The question for this week
        </h2>
        <p className="lf-prose lf-column">{OPENER.questionIntro.text}</p>
        <div className="lf-wide">
          <Prediction />
        </div>
      </section>

      <div className="lf-grid2" style={{ marginTop: 10 }}>
        <section aria-labelledby="learn-h">
          <h2 id="learn-h" className="lf-h2">
            What you will learn
          </h2>
          <ol className="lf-plain">
            {LEARN_SECTIONS.map((s) => (
              <li key={s.id} className="lf-objective">
                <span className="lf-chip">{s.code}</span>
                <span>
                  <Link to={`/week/1/learn/${s.id}`} className="font-semibold">
                    {s.title}
                  </Link>{' '}
                  <span className="lf-muted text-[14px]">· {s.minutes} min</span>
                  <br />
                  <span className="text-[15px]">{s.teaser.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
        <section aria-labelledby="cando-h">
          <h2 id="cando-h" className="lf-h2">
            By the end of the week you will be able to
          </h2>
          <ul className="lf-plain">
            {OPENER.canDo.map((o) => (
              <li key={o.id} className="lf-objective">
                <span className="lf-chip accent">{bloomLabel(o.bloom)}</span>
                <span>
                  {o.text.text} <span className="id">{o.id === 'Graduate' ? 'graduate expectation' : o.id}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="lf-grid2">
        <section aria-labelledby="assess-h">
          <h2 id="assess-h" className="lf-h2">
            How you will be assessed
          </h2>
          <ul className="lf-list">
            {OPENER.assessed.map((a, i) => (
              <li key={i}>{a.text}</li>
            ))}
            <li>{OPENER.assessedTeam.text}</li>
            <li>{OPENER.assessedGraduate.text}</li>
          </ul>
          <details className="lf-textalt">
            <summary>Rubric scope</summary>
            <p>{week01.assignment.rubricScope}</p>
          </details>
        </section>
        <section aria-labelledby="time-h">
          <h2 id="time-h" className="lf-h2">
            Time plan · {total.toFixed(1)} h per student, realistic ({WORKLOAD_BUDGET} h budget) · due {week01.assignment.due.toLowerCase()}
          </h2>
          <ul className="lf-plain" data-testid="time-plan">
            {week01.workload.map((w) => (
              <li key={w.activity} className="flex items-start gap-3 border-b border-wb-line py-2 text-[14.5px] leading-snug">
                <input
                  type="checkbox"
                  className="mt-1"
                  aria-label={`Done: ${w.activity}`}
                  checked={!!state.timePlan[w.activity]}
                  onChange={(e) => patch('timePlan', { ...state.timePlan, [w.activity]: e.target.checked })}
                />
                <span className="min-w-0 flex-1">{w.activity}</span>
                <span className="wb-mono flex-none">{w.hours} h</span>
              </li>
            ))}
          </ul>
          <p className="lf-muted mt-2 text-[14px]" data-testid="workload-note">
            {WORKLOAD_NOTE.text}
          </p>
        </section>
      </div>

      <div className="lf-actions" style={{ marginTop: 34 }}>
        <Link to="/week/1/learn/l1" className="lf-btn primary">
          Start Learn: L1 {LEARN_SECTIONS[0].title} <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to="/welcome" className="lf-btn">
          Course welcome
        </Link>
      </div>
    </div>
  )
}
