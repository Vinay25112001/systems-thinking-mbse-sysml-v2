// Assessment and submission (#/week/10/assessment): readiness quiz Q10, kept separate from the lecture; the individual
// applied exercise on an unseen case with its rubric (five criteria, four level descriptors each); the lab's submission
// readiness, computed by the lab tool's own checks; and the bridge to Week 11. Template: src/week9/Assessment.tsx.
import { ArrowRight } from 'lucide-react'
import { WEEKS } from '../content/course'
import { WEEK10_QUIZ } from '../content/quizWeek10'
import { EXERCISE, EXERCISE_POINTS, EXERCISE_RUBRIC } from '../content/week10Assessment'
import { Quiz } from '../components/Quiz'
import { bloomLabel } from '../flow/route'
import { Link } from '../lib/router'
import { CHECKER_GUIDE, WEEK10_PATHS } from './route'
import { Week10Readiness } from './Readiness'

const LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export default function Assessment() {
  const s = EXERCISE.scenario
  return (
    <div className="wk-page" data-testid="week10-assessment">
      <p className="lf-kicker">Week 10 · Assessment and submission</p>
      <h1 className="lf-h1">Assessment and submission</h1>
      <p className="lf-lede lf-column">Due before Week 11, Session 1. The readiness quiz and the applied exercise are individual and formative; model v0.3 is submitted once per team.</p>

      <section className="wk-section" aria-labelledby="w10-quiz-h" data-testid="assessment-quiz">
        <h2 className="lf-h2" id="w10-quiz-h">
          Readiness quiz Q10
        </h2>
        <p className="lf-muted text-[15px]">{WEEK10_QUIZ.length} questions, individual and formative, about 15 minutes, taken after both lectures. Answer each question before you see its explanation; every option then explains itself, names the slide that teaches it and cites its source. The contexts are new: none is about AeroLink.</p>
        <div className="lf-wide">
          <Quiz questions={WEEK10_QUIZ} bloomText={bloomLabel} />
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w10-ex-h" data-testid="assessment-exercise">
        <h2 className="lf-h2" id="w10-ex-h">
          Individual applied exercise
        </h2>
        <div className="lf-prose lf-column">
          <p>
            <strong>{EXERCISE.title}.</strong> About {EXERCISE.minutes} minutes, open book. {EXERCISE.brief}
          </p>
        </div>
        <div className="lf-card lf-column" data-testid="exercise-scenario">
          <h3 className="lf-h3" style={{ marginTop: 0 }}>
            Scenario: {s.name}
          </h3>
          <p className="m-0">
            <strong>Actors:</strong> {s.actors}. <strong>Trigger:</strong> {s.trigger}
          </p>
          <ol className="lf-list mt-2">
            {s.steps.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
          <p className="m-0">
            <strong>Alternates:</strong>
          </p>
          <ul className="lf-list">
            {s.alternates.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="m-0">
            <strong>Success end state:</strong> {s.success}
          </p>
        </div>
        <h3 className="lf-h3">The draft for task 5</h3>
        <div className="wk-code" tabIndex={0} role="region" aria-label="Draft SysML v2 fragment for task 5" data-testid="exercise-fragment">
          <pre>{EXERCISE.fragment.join('\n')}</pre>
        </div>
        <ol className="wk-steps lf-column">
          {EXERCISE.tasks.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
        <p className="lf-prose lf-column">
          The checker is the one your team installed in Week 8 (<Link to={CHECKER_GUIDE}>install-and-run guide</Link>). Upload one .sysml file and your written answers to the LMS assignment “Week 10 applied exercise”.
        </p>
        <h3 className="lf-h3">How it is scored ({EXERCISE_POINTS} points)</h3>
        <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: applied exercise rubric" data-testid="exercise-rubric">
          <table className="lec-table">
            <caption>Five criteria, four points each; each level has its own descriptor.</caption>
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
              {EXERCISE_RUBRIC.map((r) => (
                <tr key={r.criterion}>
                  <th scope="row">{r.criterion}</th>
                  {r.levels.map((d, j) => (
                    <td key={j}>{d}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w10-submit-h" data-testid="assessment-submission">
        <h2 className="lf-h2" id="w10-submit-h">
          Model v0.3: submission readiness
        </h2>
        <p className="lf-prose lf-column">The status below is computed from what the lab tool saved in this browser, with the same checks the tool applies. They are course acceptance checks: whether the model is valid SysML v2 is decided by the course-designated checker run on your exported file, and a PASS still does not show that a flow follows your ConOps.</p>
        <Week10Readiness />
        <ol className="wk-steps lf-column">
          <li>Decide every function’s items and performer, map your chosen scenario step by step, define your operating states, give every finding a disposition, and complete the review checklist and the AI usage statement in the lab tool.</li>
          <li>Export model v0.3 (.sysml) and the behavior review (.md); run the checker until it reports zero errors and explain every warning.</li>
          <li>One team member uploads the model, the behavior review and the checker log to the “Week 10 model v0.3” assignment in the learning management system.</li>
        </ol>
        <div className="lf-actions">
          <Link to={WEEK10_PATHS['lab-tool']} className="lf-btn primary" data-testid="assessment-open-tool">
            Open the lab tool <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to={WEEK10_PATHS.lab} className="lf-btn">
            Lab instructions and rubric
          </Link>
        </div>
      </section>

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="w10-bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 11</p>
        <h2 id="w10-bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          Your logical elements and items are what next week gives a physical home.
        </h2>
        <p className="text-[15.5px]">Week 11 models the physical parts of your enterprise, their ports, interfaces and connections, and allocates each logical element to the physical parts that realize it. Keep every function, item and logical element ID stable.</p>
        <Link to="/week/11" className="lf-btn">
          Week 11: {WEEKS[10].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
