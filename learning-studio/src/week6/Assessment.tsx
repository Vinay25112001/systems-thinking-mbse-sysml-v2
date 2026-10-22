// Assessment and submission (#/week/6/assessment): readiness quiz Q6, kept separate from the lecture; the individual
// applied exercise on an unseen case with a four-level descriptor for every criterion; the graduate roadmap sensitivity memo
// with its own criteria and descriptors (from the lab module, single source); the Week 6 record's submission readiness,
// computed by the lab tool's own checks; and the bridge to Week 7. Template: src/week5/Assessment.tsx.
// The case brief with marking notes is docs/lectures/week06/WEEK6_APPLIED_EXERCISE_BRIEF.md (a city bike-share, a setting no
// Week 6 quiz item uses: quizWeek6.test.ts asserts it); five minutes of reading and four tasks fit the 36 minutes; the exercise and the graduate memo are
// both scored on four criteria × four levels (16 points), so the two individual grades are on one scale (the Week 4 N6 and
// Week 5 Mo3 lessons).
import { ArrowRight } from 'lucide-react'
import { WEEKS } from '../content/course'
import { WEEK6_QUIZ } from '../content/quizWeek6'
import { LAB_LEVELS, RUBRIC_LEVELS } from '../content/lab/week06Lab'
import { Quiz } from '../components/Quiz'
import { bloomLabel } from '../flow/route'
import { Link } from '../lib/router'
import { WEEK6_PATHS } from './route'
import { Week6Readiness } from './Readiness'
import { EXERCISE_LEVELS, EXERCISE_MINUTES, EXERCISE_READING_MINUTES, EXERCISE_TASKS } from './assessmentParts'

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
    <div className="wk-page" data-testid="week6-assessment">
      <p className="lf-kicker">Week 6 · Assessment and submission</p>
      <h1 className="lf-h1">Assessment and submission</h1>
      <p className="lf-lede lf-column">Due before Week 7, Session 1. The readiness quiz and the applied exercise are individual and formative; the Week 6 record is submitted once per team.</p>

      <section className="wk-section" aria-labelledby="w6-quiz-h" data-testid="assessment-quiz">
        <h2 className="lf-h2" id="w6-quiz-h">
          Readiness quiz Q6
        </h2>
        <p className="lf-muted text-[15px]">{WEEK6_QUIZ.length} questions, individual and formative, about 15 minutes, taken after both lectures. Every option has an explanation, and each question names the slide that teaches it and cites its source.</p>
        <div className="lf-wide">
          <Quiz questions={WEEK6_QUIZ} bloomText={bloomLabel} />
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w6-ex-h" data-testid="assessment-exercise">
        <h2 className="lf-h2" id="w6-ex-h">
          Individual applied exercise
        </h2>
        <div className="lf-prose lf-column">
          <p>About {EXERCISE_MINUTES} minutes, open book, on an unseen fictional case released on the LMS: a city bike-share with a fleet of docked pedal bikes, a proposed electric fleet, a battery-swap technology still in field trials, and an unknown electricity tariff for the charging docks. The brief gives the fleet, the docks, the demand figures, two needs and the maturity evidence. The first {EXERCISE_READING_MINUTES} minutes are for reading it.</p>
          <ol className="wk-steps">
            {EXERCISE_TASKS.map((t) => (
              <li key={t.minutes + t.text.slice(0, 12)}>
                {t.text} (about {t.minutes} min)
              </li>
            ))}
          </ol>
          <p className="lf-muted">Scored on four levels against four criteria (16 points). The graduate memo below is scored the same way, four criteria on four levels (16 points), so the two individual grades are on one scale:</p>
        </div>
        <Levels rows={EXERCISE_LEVELS} testId="exercise-levels" caption="Applied exercise: four-level descriptors for each criterion" />
      </section>

      <section className="wk-section" aria-labelledby="w6-submit-h" data-testid="assessment-submission">
        <h2 className="lf-h2" id="w6-submit-h">
          Week 6 record: submission readiness
        </h2>
        <p className="lf-prose lf-column">The status below is computed from the record saved in this browser by the lab tool, with the same checks the tool applies part by part.</p>
        <Week6Readiness />
        <ol className="wk-steps lf-column">
          <li>Finish every part in the lab tool until each shows its check as complete.</li>
          <li>Export both files after the last change: the Markdown record and the JSON model inputs. Draw the roadmap graphic from the grid the tool shows.</li>
          <li>One team member uploads both files and the graphic to the “Week 6 Team Record” assignment in the learning management system.</li>
        </ol>
        <div className="lf-actions">
          <Link to={WEEK6_PATHS['lab-tool']} className="lf-btn primary" data-testid="assessment-open-tool">
            Open the lab tool <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to={WEEK6_PATHS.lab} className="lf-btn">
            Lab instructions and rubric
          </Link>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w6-grad-h" data-testid="assessment-graduate">
        <h2 className="lf-h2" id="w6-grad-h">
          Graduate students: the roadmap sensitivity memo
        </h2>
        <p className="lf-prose lf-column">Replaces the applied exercise for graduate students (one page, about 0.7 h; scored on four criteria × four levels, 16 points, the applied exercise’s scale). For your team’s own roadmap: identify the trigger or unknown that would move an increment by a full horizon, with its threshold computed or sourced from your own data; trace the impact set of that increment across your Weeks 1–5 IDs by the record’s links, judging every candidate; name the earlier decision, for example your Week 3 trade study, that would have to be re-run and the criterion or screen that would change; and state the assumption or data limit that could change the memo’s conclusion, with the evidence that would settle it. Individual, uploaded to the “Week 6 graduate task” assignment.</p>
        <Levels rows={grad} testId="graduate-levels" caption="Graduate memo: four-level descriptors for each criterion" />
      </section>

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="w6-bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 7</p>
        <h2 id="w6-bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          Your baseline review is next week’s starting list.
        </h2>
        <p className="text-[15.5px]">Week 7 integrates Weeks 1–6 into the Systems Thinking Engineering Package and presents it. Your roadmap becomes its evolution section, and every open item you named, with its owner, is what the review checks first. Your Week 6 export feeds the Week 7 package.</p>
        <Link to="/week/7" className="lf-btn">
          Week 7: {WEEKS[6].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
