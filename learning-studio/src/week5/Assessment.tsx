// Assessment and submission (#/week/5/assessment): readiness quiz Q5, kept separate from the lecture; the individual
// applied exercise on an unseen case with a four-level descriptor for every criterion; the graduate coupling task with
// its own criteria and descriptors (from the lab module, single source); the Week 5 record's submission readiness,
// computed by the lab tool's own checks; and the bridge to Week 6. Template: src/week4/Assessment.tsx.
// Review 2026-10-19 Mo3: the case brief with marking notes is docs/lectures/week05/WEEK5_APPLIED_EXERCISE_BRIEF.md (a ski
// resort, a domain no Week 5 quiz item uses); four tasks fit the 35 minutes; the exercise and the graduate task are both
// scored on four criteria × four levels (16 points), so the two individual grades are on one scale.
import { ArrowRight } from 'lucide-react'
import { WEEKS } from '../content/course'
import { WEEK5_QUIZ } from '../content/quizWeek5'
import { LAB_LEVELS, RUBRIC_LEVELS } from '../content/lab/week05Lab'
import { Quiz } from '../components/Quiz'
import { bloomLabel } from '../flow/route'
import { Link } from '../lib/router'
import { WEEK5_PATHS } from './route'
import { Week5Readiness } from './Readiness'

/** The applied exercise's criteria with their four-level descriptors (4 Exemplary … 1 Beginning). */
const EXERCISE_LEVELS: { criterion: string; levels: [string, string, string, string] }[] = [
  { criterion: 'Breakdown', levels: ['Five to seven elements of the right kinds (people and procedures included), each with a one-sentence responsibility', 'Elements of several kinds with responsibilities; one responsibility restates the name', 'Hardware or software only, or responsibilities restating names', 'A list of parts with no responsibilities'] },
  { criterion: 'N² chart', levels: ['Every pair examined; each interface typed and in the cell of its two ends; degrees counted and the sum shown to be twice the count; an empty external row answered', 'Complete and typed, one slip in the degrees or one unanswered empty row', 'Several interfaces missing or untyped; no degree check', 'A connection list, not a chart'] },
  { criterion: 'Interface definitions and requirement', levels: ['Both rows complete: what crosses, direction, medium, constraint, owner of each side, verification, trust boundary with protection or a reason (the radio link crosses), degraded mode with a fail-safe choice where safety data cross; the requirement shows the three steps, one “shall”, the interface, a measurable criterion, a method and a parent', 'One attribute missing, a weak degraded mode, or one requirement element weak', 'Names, ends and what crosses only, or a requirement with no criterion', 'Ends only, no requirement'] },
  { criterion: 'Change traced', levels: ['The changed interface’s row and column read for every neighbour; the reached ones justified; the owners who decide named', 'Neighbours found, reach not justified', 'Only the two ends considered', 'Missing'] },
]

function Levels({ rows, testId, caption }: { rows: { criterion: string; levels: string[] }[]; testId: string; caption: string }) {
  return (
    <div className="lec-table-wrap lf-wide" tabIndex={0} role="region" aria-label={caption} data-testid={testId}>
      <table className="lec-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Criterion</th>
            {RUBRIC_LEVELS.map((l) => (
              <th key={l} scope="col">
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.criterion}>
              <th scope="row">{r.criterion}</th>
              {r.levels.map((x, i) => (
                <td key={i}>{x}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Assessment() {
  const grad = LAB_LEVELS.filter((x) => x.graduate)
  return (
    <div className="wk-page" data-testid="week5-assessment">
      <p className="lf-kicker">Week 5 · Assessment and submission</p>
      <h1 className="lf-h1">Assessment and submission</h1>
      <p className="lf-lede lf-column">Due before Week 6, Session 1. The readiness quiz and the applied exercise are individual and formative; the Week 5 record is submitted once per team.</p>

      <section className="wk-section" aria-labelledby="w5-quiz-h" data-testid="assessment-quiz">
        <h2 className="lf-h2" id="w5-quiz-h">
          Readiness quiz Q5
        </h2>
        <p className="lf-muted text-[15px]">{WEEK5_QUIZ.length} questions, individual and formative, about 15 minutes, taken after both lectures. Every option has an explanation, and each question names the slide that teaches it and cites its source.</p>
        <div className="lf-wide">
          <Quiz questions={WEEK5_QUIZ} bloomText={bloomLabel} />
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w5-ex-h" data-testid="assessment-exercise">
        <h2 className="lf-h2" id="w5-ex-h">
          Individual applied exercise
        </h2>
        <div className="lf-prose lf-column">
          <p>About 35 minutes, open book, on an unseen fictional case released on the LMS: a mountain ski resort with two chairlifts, a snowmaking plant, ticket gates and a ticketing app, lift operators and a ski patrol, and outside parties that include the electric utility and the county mountain-rescue service. The brief lists the elements, the external parties, the exchanges between them and two requirements.</p>
          <ol className="wk-steps">
            <li>Break the resort into five to seven components of any kind, each with a responsibility (about 6 min).</li>
            <li>Build the N² of your components and the external parties; type every interface, count the degrees and show the sum check; answer any empty external row (about 10 min).</li>
            <li>Define two interfaces completely, one of them external, including the trust boundary, the protection or the reason for none, and the degraded mode; then write one interface requirement by the three steps for the external one (about 13 min).</li>
            <li>A new lift-safety standard changes one interface: trace the change through the N² and name who decides (about 6 min).</li>
          </ol>
          <p className="lf-muted">Scored on four levels against four criteria (16 points). The graduate task below is scored the same way, four criteria on four levels (16 points), so the two individual grades are on one scale:</p>
        </div>
        <Levels rows={EXERCISE_LEVELS} testId="exercise-levels" caption="Applied exercise: four-level descriptors for each criterion" />
      </section>

      <section className="wk-section" aria-labelledby="w5-submit-h" data-testid="assessment-submission">
        <h2 className="lf-h2" id="w5-submit-h">
          Week 5 record: submission readiness
        </h2>
        <p className="lf-prose lf-column">The status below is computed from the record saved in this browser by the lab tool, with the same checks the tool applies part by part.</p>
        <Week5Readiness />
        <ol className="wk-steps lf-column">
          <li>Finish every part in the lab tool until each shows its check as complete.</li>
          <li>Export both files after the last change: the Markdown record and the JSON model inputs.</li>
          <li>One team member uploads both files to the “Week 5 Team Record” assignment in the learning management system.</li>
        </ol>
        <div className="lf-actions">
          <Link to={WEEK5_PATHS['lab-tool']} className="lf-btn primary" data-testid="assessment-open-tool">
            Open the lab tool <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to={WEEK5_PATHS.lab} className="lf-btn">
            Lab instructions and rubric
          </Link>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w5-grad-h" data-testid="assessment-graduate">
        <h2 className="lf-h2" id="w5-grad-h">
          Graduate students: the coupling comparison
        </h2>
        <p className="lf-prose lf-column">Replaces the applied exercise for graduate students (about 0.7 h; scored on four criteria × four levels, 16 points, the applied exercise’s scale). For your team’s enterprise, define two allocation alternatives for the same functions and compare them with the course coupling metric: state the metric before any number (E flows, X crossing flows, κ = X ÷ E, P element pairs, the most partners of one element), compute both from your own function flows, check each crossing pair against your interfaces, and say which limitation (criticality, aggregation, concentration, crossings without a matching interface, a flow set written for one alternative) could change the conclusion. The metric is the course’s, not a source’s. Individual, uploaded to the “Week 5 graduate task” assignment.</p>
        <Levels rows={grad} testId="graduate-levels" caption="Graduate task: four-level descriptors for each criterion" />
      </section>

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="w5-bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 6</p>
        <h2 id="w5-bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          Your interfaces are next week’s insertion points.
        </h2>
        <p className="text-[15.5px]">Week 6 plans how the enterprise evolves. Every technology you insert must plug into an interface; your standards column and your change request are where the roadmap starts.</p>
        <Link to="/week/6" className="lf-btn">
          Week 6: {WEEKS[5].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
