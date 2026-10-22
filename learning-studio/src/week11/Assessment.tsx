// Assessment and submission (#/week/10/assessment): readiness quiz Q10, kept separate from the lecture; the individual
// applied exercise on an unseen case with its rubric (five criteria, four level descriptors each); the lab's submission
// readiness, computed by the lab tool's own checks; and the bridge to Week 11. template: src/week10/Assessment.tsx.
import { ArrowRight } from 'lucide-react'
import { WEEKS } from '../content/course'
import { WEEK11_QUIZ } from '../content/quizWeek11'
import { EXERCISE, EXERCISE_POINTS, EXERCISE_RUBRIC } from '../content/week11Assessment'
import { Quiz } from '../components/Quiz'
import { bloomLabel } from '../flow/route'
import { Link } from '../lib/router'
import { CHECKER_GUIDE, WEEK11_PATHS } from './route'
import { Week11Readiness } from './Readiness'

const LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']

export default function Assessment() {
  const s = EXERCISE.scenario
  return (
    <div className="wk-page" data-testid="week11-assessment">
      <p className="lf-kicker">Week 11 · Assessment and submission</p>
      <h1 className="lf-h1">Assessment and submission</h1>
      <p className="lf-lede lf-column">Due before Week 12, Session 1. The readiness quiz and the applied exercise are individual and formative; model v0.4 is submitted once per team.</p>

      <section className="wk-section" aria-labelledby="w11-quiz-h" data-testid="assessment-quiz">
        <h2 className="lf-h2" id="w11-quiz-h">
          Readiness quiz Q11
        </h2>
        <p className="lf-muted text-[15px]">{WEEK11_QUIZ.length} questions, individual and formative, about 15 minutes, taken after both lectures. Answer each question before you see its explanation; every option then explains itself, names the slide that teaches it and cites its source. The contexts are new: none is about AeroLink.</p>
        <div className="lf-wide">
          <Quiz questions={WEEK11_QUIZ} bloomText={bloomLabel} />
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w11-ex-h" data-testid="assessment-exercise">
        <h2 className="lf-h2" id="w11-ex-h">
          Individual applied exercise
        </h2>
        <div className="lf-prose lf-column">
          <p>
            <strong>{EXERCISE.title}.</strong> About {EXERCISE.minutes} minutes, open book. {EXERCISE.brief}
          </p>
        </div>
        <div className="lf-card lf-column" data-testid="exercise-scenario">
          <h3 className="lf-h3" style={{ marginTop: 0 }}>
            The case: {s.name}
          </h3>
          <p className="m-0">
            <strong>Elements:</strong> {s.actors}. <strong>Placement:</strong> {s.trigger}
          </p>
          <p className="m-0 mt-2">
            <strong>Interfaces (Week 5):</strong>
          </p>
          <ol className="lf-list mt-2">
            {s.steps.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
          <p className="m-0">
            <strong>Requirements:</strong>
          </p>
          <ul className="lf-list">
            {s.alternates.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="m-0">
            <strong>Design data:</strong> {s.success}
          </p>
        </div>
        <h3 className="lf-h3">The draft for task 4</h3>
        <div className="wk-code" tabIndex={0} role="region" aria-label="Draft SysML v2 fragment for task 4" data-testid="exercise-fragment">
          <pre>{EXERCISE.fragment.join('\n')}</pre>
        </div>
        <ol className="wk-steps lf-column">
          {EXERCISE.tasks.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ol>
        <p className="lf-prose lf-column">
          The checker is the one your team installed in Week 8 (<Link to={CHECKER_GUIDE}>install-and-run guide</Link>). Upload one .sysml file and your written answers to the LMS assignment “Week 11 applied exercise”.
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

      <section className="wk-section" aria-labelledby="w11-submit-h" data-testid="assessment-submission">
        <h2 className="lf-h2" id="w11-submit-h">
          Model v0.4: submission readiness
        </h2>
        <p className="lf-prose lf-column">The status below is computed from what the lab tool saved in this browser, with the same checks the tool applies. They are course acceptance checks: whether the model is valid SysML v2 is decided by the course-designated checker run on your exported file, and a PASS still does not show that your connected ports match or that a satisfy claim is true.</p>
        <Week11Readiness />
        <ol className="wk-steps lf-column">
          <li>Link your part definitions, place every function, set what crosses each interface, allocate your interface requirements, write your satisfy claims with their basis, give every finding a disposition, and complete the review checklist and the AI usage statement in the lab tool.</li>
          <li>Export model v0.4 (.sysml) and the interface review (.md); run the checker until it reports zero errors and explain every warning.</li>
          <li>One team member uploads the model, the interface review and the checker log to the “Week 11 model v0.4” assignment in the learning management system.</li>
        </ol>
        <div className="lf-actions">
          <Link to={WEEK11_PATHS['lab-tool']} className="lf-btn primary" data-testid="assessment-open-tool">
            Open the lab tool <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to={WEEK11_PATHS.lab} className="lf-btn">
            Lab instructions and rubric
          </Link>
        </div>
      </section>

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="w11-bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 12</p>
        <h2 id="w11-bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          Your satisfy claims and interface requirements are what next week verifies.
        </h2>
        <p className="text-[15.5px]">Week 12 models verification cases that verify your requirements, plans the evidence for every satisfy claim and audits the digital thread from need to verification. Keep every physical element, component, interface and item ID stable.</p>
        <Link to="/week/12" className="lf-btn">
          Week 12: {WEEKS[11].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
