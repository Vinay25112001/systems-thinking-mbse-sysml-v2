// Assessment and submission (#/week/9/assessment): readiness quiz Q9, kept separate from the lecture; the individual
// applied exercise on an unseen case with its rubric (five criteria, four level descriptors each); the lab's submission
// readiness, computed by the lab tool's own checks; and the bridge to Week 10. Template: src/week8/Assessment.tsx.
import { ArrowRight } from 'lucide-react'
import { WEEKS } from '../content/course'
import { WEEK9_QUIZ } from '../content/quizWeek9'
import { EXERCISE, EXERCISE_POINTS, EXERCISE_RUBRIC } from '../content/week9Assessment'
import { Quiz } from '../components/Quiz'
import { bloomLabel } from '../flow/route'
import { Link } from '../lib/router'
import { CHECKER_GUIDE, WEEK9_PATHS } from './route'
import { Week9Readiness } from './Readiness'

const LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export default function Assessment() {
  return (
    <div className="wk-page" data-testid="week9-assessment">
      <p className="lf-kicker">Week 9 · Assessment and submission</p>
      <h1 className="lf-h1">Assessment and submission</h1>
      <p className="lf-lede lf-column">Due before Week 10, Session 1. The readiness quiz and the applied exercise are individual and formative; model v0.2 is submitted once per team.</p>

      <section className="wk-section" aria-labelledby="w9-quiz-h" data-testid="assessment-quiz">
        <h2 className="lf-h2" id="w9-quiz-h">
          Readiness quiz Q9
        </h2>
        <p className="lf-muted text-[15px]">{WEEK9_QUIZ.length} questions, individual and formative, about 15 minutes, taken after both lectures. Answer each question before you see its explanation; every option then explains itself, names the slide that teaches it and cites its source. The contexts are new: none is about AeroLink.</p>
        <div className="lf-wide">
          <Quiz questions={WEEK9_QUIZ} bloomText={bloomLabel} />
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w9-ex-h" data-testid="assessment-exercise">
        <h2 className="lf-h2" id="w9-ex-h">
          Individual applied exercise
        </h2>
        <div className="lf-prose lf-column">
          <p>
            <strong>{EXERCISE.title}.</strong> About {EXERCISE.minutes} minutes, open book. {EXERCISE.brief}
          </p>
        </div>
        <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: the case’s needs and requirements" data-testid="exercise-table">
          <table className="lec-table">
            <caption>The flood-warning service’s needs and requirements (FICTIONAL).</caption>
            <thead>
              <tr>
                {['ID', 'Kind', 'Statement', 'Trace'].map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EXERCISE.table.map((r) => (
                <tr key={r[0]}>
                  <th scope="row">{r[0]}</th>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td>{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ol className="wk-steps lf-column">
          {EXERCISE.tasks.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
        <p className="lf-prose lf-column">
          The checker is the one your team installed in Week 8 (<Link to={CHECKER_GUIDE}>install-and-run guide</Link>). Upload one .sysml file and your written answers to the LMS assignment “Week 9 applied exercise”.
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

      <section className="wk-section" aria-labelledby="w9-submit-h" data-testid="assessment-submission">
        <h2 className="lf-h2" id="w9-submit-h">
          Model v0.2: submission readiness
        </h2>
        <p className="lf-prose lf-column">The status below is computed from what the lab tool saved in this browser, with the same checks the tool applies. They are course acceptance checks: whether the model is valid SysML v2 is decided by the course-designated checker run on your exported file, and a PASS still does not show that a requirement is the right one.</p>
        <Week9Readiness />
        <ol className="wk-steps lf-column">
          <li>Decide the subject and the constraint of every requirement, give every trace finding a disposition, and complete the AI review log in the lab tool.</li>
          <li>Export model v0.2 (.sysml) and the trace matrix (.md); run the checker until it reports zero errors and explain every warning.</li>
          <li>One team member uploads the model, the trace matrix and the checker log to the “Week 9 model v0.2” assignment in the learning management system.</li>
        </ol>
        <div className="lf-actions">
          <Link to={WEEK9_PATHS['lab-tool']} className="lf-btn primary" data-testid="assessment-open-tool">
            Open the lab tool <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to={WEEK9_PATHS.lab} className="lf-btn">
            Lab instructions and rubric
          </Link>
        </div>
      </section>

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="w9-bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 10</p>
        <h2 id="w9-bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          Your requirements are what next week’s functions and behavior will serve.
        </h2>
        <p className="text-[15.5px]">Week 10 models the functions, capabilities and behavior of your enterprise: the capability parents your requirements carry are linked, and the placeholder subjects in the Logical package become logical elements.</p>
        <Link to="/week/10" className="lf-btn">
          Week 10: {WEEKS[9].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
