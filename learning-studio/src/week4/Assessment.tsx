// Assessment and submission (#/week/4/assessment): readiness quiz Q4, kept separate from the lecture; the individual
// applied exercise and the graduate coverage task; the Week 4 record's submission readiness, computed by the lab tool's own
// checks; and the bridge to Week 5. Template: src/week3/Assessment.tsx.
import { ArrowRight } from 'lucide-react'
import { WEEKS } from '../content/course'
import { WEEK4_QUIZ } from '../content/quizWeek4'
import { Quiz } from '../components/Quiz'
import { bloomLabel } from '../flow/route'
import { Link } from '../lib/router'
import { WEEK4_PATHS } from './route'
import { Week4Readiness } from './Readiness'

/** Review Mo5 (the Week 2 N20 pattern): level descriptors so the applied exercise and the graduate task can be graded
 *  consistently (course convention, pending faculty review). Levels: 4 exemplary, 3 proficient, 2 developing, 1 beginning.
 *  The bike-share brief itself is docs/lectures/week04/WEEK4_APPLIED_EXERCISE_BRIEF.md (released on the LMS). */
const LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']
type Row = [string, string, string, string, string]
const EXERCISE_RUBRIC: Row[] = [
  ['Views', 'Three purpose questions a named stakeholder would ask, each tied to the concern from the brief it answers.', 'Three purposes with concerns; one is a statement rather than a question, or its concern is vague.', 'Purposes name what is drawn (“show the stations”) rather than a question, or concerns are missing.', 'Views listed by name only.'],
  ['Functions', 'Every step of the scenario served; each function verb and object with an input and an output; one function the walk exposes, with the step that exposes it.', 'Steps served and named well; one function lacks an input or an output, or the exposed function is not tied to a step.', 'Several functions are element names or lack inputs and outputs; no exposed function.', 'A list of components or features instead of functions.'],
  ['Allocation', 'Three functions to a logical and a physical element, each physical element reachable from its logical one, each with a criterion from SEBoK’s list and a sentence that rests on the brief.', 'Three allocations with criteria; one reason restates the criterion without resting on the brief.', 'Allocations without criteria, or straight to a product with no logical element.', 'No allocation, or functions and elements confused.'],
  ['Information', 'Two items, each with data and information distinct, a producer, a consumer that makes the named decision, and the decision itself.', 'Two items complete; one decision is vague or its consumer is not the party that decides.', 'Items without decisions, or data and information the same.', 'A list of data stores.'],
  ['AI oversight', 'Who decides each rebalancing move, what the planner may not do alone, and one failure mode with its effect.', 'Oversight and failure named; one lacks its effect or a limit on the planner.', 'Oversight stated as “a human checks it” with no decision or limit.', 'No oversight or failure mode.'],
]
const GRAD_RUBRIC: Row[] = [
  ['Coverage matrix', 'Every Week 1 concern against every view; each mark is plausible (the view really answers the concern); an uncovered concern is named with the view proposed for it.', 'Matrix complete; one or two marks are doubtful.', 'Matrix incomplete, or marks assigned without regard to what the view shows.', 'No matrix.'],
  ['Decision evaluated', 'The team’s decision judged against one named aim from SEBoK’s list for a candidate physical architecture, with the evidence for the verdict.', 'Judged against a named aim; the evidence is thin.', 'An aim named but not applied, or no evidence.', 'No evaluation.'],
  ['Reversal condition', 'States the observation or number that would reverse the decision, and who would gather it.', 'States what would reverse it, without a number or an owner.', 'A general remark (“if things change”).', 'None.'],
]
function RubricTable({ caption, rows, testId }: { caption: string; rows: Row[]; testId: string }) {
  return (
    <div className="lec-table-wrap" tabIndex={0} role="region" aria-label={`Table: ${caption}`} data-testid={testId}>
      <table className="lec-table">
        <caption>{caption}</caption>
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
          {rows.map((r) => (
            <tr key={r[0]}>
              <th scope="row">{r[0]}</th>
              {r.slice(1).map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Assessment() {
  return (
    <div className="wk-page" data-testid="week4-assessment">
      <p className="lf-kicker">Week 4 · Assessment and submission</p>
      <h1 className="lf-h1">Assessment and submission</h1>
      <p className="lf-lede lf-column">Due before Week 5, Session 1. The readiness quiz and the applied exercise are individual and formative; the Week 4 record is submitted once per team.</p>

      <section className="wk-section" aria-labelledby="w4-quiz-h" data-testid="assessment-quiz">
        <h2 className="lf-h2" id="w4-quiz-h">
          Readiness quiz Q4
        </h2>
        <p className="lf-muted text-[15px]">{WEEK4_QUIZ.length} questions, individual and formative, about 15 minutes, taken after both lectures. Every option has an explanation, and each question names the slide that teaches it and cites its source.</p>
        <div className="lf-wide">
          <Quiz questions={WEEK4_QUIZ} bloomText={bloomLabel} />
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w4-ex-h" data-testid="assessment-exercise">
        <h2 className="lf-h2" id="w4-ex-h">
          Individual applied exercise
        </h2>
        <div className="lf-prose lf-column">
          <p>About 35 minutes, open book, on an unseen fictional case released on the LMS: a city bike-share scheme with docking stations, a rebalancing van fleet and a mobile app. The brief gives four stakeholders with their concerns, two operating scenarios, five capabilities and six requirements.</p>
          <ol className="wk-steps">
            <li>Write a purpose question for three views and name the concern each answers.</li>
            <li>Walk one scenario into functions, verb and object, each with an input and an output; name one function the walk exposes.</li>
            <li>Allocate three functions to logical and physical elements, each with a criterion from SEBoK’s list and a one-sentence reason.</li>
            <li>Write two information items with producer, consumer and the decision each supports, stating the data and the information.</li>
            <li>Name the human oversight an AI rebalancing planner would need and one failure mode.</li>
          </ol>
          <p className="lf-muted">Scored on four levels against five criteria (20 points), with the descriptors below.</p>
        </div>
        <div className="lf-wide">
          <RubricTable caption="Applied exercise: level descriptors (4 points per criterion)" rows={EXERCISE_RUBRIC} testId="exercise-rubric" />
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w4-submit-h" data-testid="assessment-submission">
        <h2 className="lf-h2" id="w4-submit-h">
          Week 4 record: submission readiness
        </h2>
        <p className="lf-prose lf-column">The status below is computed from the record saved in this browser by the lab tool, with the same checks the tool applies part by part.</p>
        <Week4Readiness />
        <ol className="wk-steps lf-column">
          <li>Finish every part in the lab tool until each shows its check as complete.</li>
          <li>Export both files after the last change: the Markdown record and the JSON model inputs.</li>
          <li>One team member uploads both files to the “Week 4 Team Record” assignment in the learning management system.</li>
        </ol>
        <div className="lf-actions">
          <Link to={WEEK4_PATHS['lab-tool']} className="lf-btn primary" data-testid="assessment-open-tool">
            Open the lab tool <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to={WEEK4_PATHS.lab} className="lf-btn">
            Lab instructions and rubric
          </Link>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w4-grad-h" data-testid="assessment-graduate">
        <h2 className="lf-h2" id="w4-grad-h">
          Graduate students: viewpoint coverage and one decision defended
        </h2>
        <p className="lf-prose lf-column">Replaces the applied exercise for graduate students (about 0.7 h). Build a concern × view matrix for your team’s enterprise: every Week 1 concern against every view, checking that each mark is plausible. Name any concern no view answers and propose the view that would. Then evaluate your team’s architecture decision against one aim from SEBoK’s list of what a candidate physical architecture may aim at (fewer physical interfaces, separately testable elements, compatible technology, proximity, ease of handling, shared resources, modularity, resilience; SEBoK, Physical Architecture), and state what evidence would reverse it. Individual, uploaded to the “Week 4 graduate task” assignment. Scored on four levels against three criteria (12 points).</p>
        <div className="lf-wide">
          <RubricTable caption="Graduate task: level descriptors (4 points per criterion)" rows={GRAD_RUBRIC} testId="graduate-rubric" />
        </div>
      </section>

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="w4-bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 5</p>
        <h2 id="w4-bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          Your physical view and information routes become components and interfaces.
        </h2>
        <p className="text-[15.5px]">Week 5 breaks each physical element into components and defines every interface: what crosses it, in which direction and under which constraints. Every route you recorded this week, and every one you could not, is where Week 5 starts.</p>
        <Link to="/week/5" className="lf-btn">
          Week 5: {WEEKS[4].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
