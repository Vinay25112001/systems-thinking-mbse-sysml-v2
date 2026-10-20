// Assessment and submission (#/week/8/assessment): readiness quiz Q8, kept separate from the lecture; the individual
// applied exercise and the graduate memo; the lab's submission readiness, computed by the lab tool's own checks; and the
// bridge to Week 9. Template: src/week1/Assessment.tsx.
import { ArrowRight } from 'lucide-react'
import { WEEKS } from '../content/course'
import { WEEK8_QUIZ } from '../content/quizWeek8'
import { Quiz } from '../components/Quiz'
import { bloomLabel } from '../flow/route'
import { Link } from '../lib/router'
import { listing } from '../content/lectures/week08/listings'
import { EXERCISE_MINUTES } from '../content/lectures/week08/labBrief'
import { resultLines } from '../content/lab/week08Checker'
import { WEEK8_PATHS } from './route'
import { Week8Readiness } from './Readiness'

export default function Assessment() {
  return (
    <div className="wk-page" data-testid="week8-assessment">
      <p className="lf-kicker">Week 8 · Assessment and submission</p>
      <h1 className="lf-h1">Assessment and submission</h1>
      <p className="lf-lede lf-column">Due before Week 9, Session 1. The readiness quiz and the applied exercise are individual and formative; model v0.1 is submitted once per team.</p>

      <section className="wk-section" aria-labelledby="w8-quiz-h" data-testid="assessment-quiz">
        <h2 className="lf-h2" id="w8-quiz-h">
          Readiness quiz Q8
        </h2>
        <p className="lf-muted text-[15px]">{WEEK8_QUIZ.length} questions, individual and formative, about 15 minutes, taken after both lectures. Every option has an explanation, and each question names the slide that teaches it and cites its source. The contexts are new: none is about AeroLink.</p>
        <div className="lf-wide">
          <Quiz questions={WEEK8_QUIZ} bloomText={bloomLabel} />
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w8-ex-h" data-testid="assessment-exercise">
        <h2 className="lf-h2" id="w8-ex-h">
          Individual applied exercise
        </h2>
        <div className="lf-prose lf-column">
          <p>About {EXERCISE_MINUTES} minutes, open book, on an unseen fictional case released on the LMS: a university campus microgrid enterprise. The brief gives an excerpt of its Phase I register (five stakeholders, six concerns, two relationships, one of them a conflict) and a list of eight artifact IDs. You do not need the checker installed: task 5 gives its recorded output.</p>
          <ol className="wk-steps">
            <li>Write the package skeleton with a purpose statement and private imports.</li>
            <li>Model the five stakeholders and six concerns with their IDs as short names, each concern with a subject and its stakeholders.</li>
            <li>Model the conflict relationship as a dependency between the two stakeholders, with a comment naming its type (a keyword metadata definition is optional). A conflict is symmetric, so either direction is accepted.</li>
            <li>Map the eight artifacts to a package and a construct, with a reason for two non-obvious choices.</li>
            <li>
              The file below has three seeded defects. (a) Find, explain and fix each. (b) Read the checker’s recorded output for the fragment: say which errors each defect causes directly, and which errors only follow from an earlier one. (c) The second output is for the same fragment with defects 1 and 2 fixed and defect 3 left in: explain why the checker reports nothing, and what that tells you about a PASS.
            </li>
          </ol>
          <div className="wk-code" tabIndex={0} role="region" aria-label="Applied exercise fragment with three seeded defects" data-testid="exercise-fragment">
            <pre>
              {seeded().lines.map((text, i) => (
                <span key={i} data-line={seeded().firstLine! + i}>
                  <span className="wk-ln">{seeded().firstLine! + i}</span>
                  {text}
                  {'\n'}
                </span>
              ))}
            </pre>
          </div>
          <p className="lf-muted">Recorded checker output for this file. Each diagnostic gives line:column. The line is the number in the margin above, counted from the file’s first line (the comment header is line 1). The column counts characters from the start of that line, and a tab counts as one, so column 2 on a line indented by one tab is its first visible character.</p>
          <div className="wk-code" tabIndex={0} role="region" aria-label="Recorded checker output for the seeded fragment" data-testid="exercise-output-seeded">
            <pre>{resultLines('invalid_exercise_microgrid_seeded.sysml', 'models/invalid_exercise_microgrid_seeded.sysml').join('\n')}</pre>
          </div>
          <p className="lf-muted">Recorded checker output for the same fragment with defects 1 and 2 fixed and defect 3 left in:</p>
          <div className="wk-code" tabIndex={0} role="region" aria-label="Recorded checker output with defects 1 and 2 fixed" data-testid="exercise-output-fixed12">
            <pre>{resultLines('exercise_microgrid_defects12_fixed.sysml', 'models/exercise_microgrid_defects12_fixed.sysml').join('\n')}</pre>
          </div>
          <p className="lf-muted">Scored on four levels against five criteria: skeleton and conventions; stakeholders and concerns; relationship; mapping; defect analysis. Graduate students explain the semantic defect in KerML terms.</p>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w8-submit-h" data-testid="assessment-submission">
        <h2 className="lf-h2" id="w8-submit-h">
          Model v0.1: submission readiness
        </h2>
        <p className="lf-prose lf-column">The status below is computed from what the lab tool saved in this browser, with the same checks the tool applies. They are course acceptance checks: whether the model is valid SysML v2 is decided by the course-designated checker run on your exported file, and a PASS still does not show that the model says what your register says.</p>
        <Week8Readiness />
        <ol className="wk-steps lf-column">
          <li>Finish the mapping matrix, the purpose statement and a disposition for every gap in the lab tool.</li>
          <li>Export model v0.1 (.sysml) and the mapping matrix with the audit (.md); extend the model where the method asks, and run the checker until it reports zero errors.</li>
          <li>One team member uploads the model, the mapping matrix and the checker log to the “Week 8 model v0.1” assignment in the learning management system.</li>
        </ol>
        <div className="lf-actions">
          <Link to={WEEK8_PATHS['lab-tool']} className="lf-btn primary" data-testid="assessment-open-tool">
            Open the lab tool <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to={WEEK8_PATHS.lab} className="lf-btn">
            Lab instructions and rubric
          </Link>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w8-grad-h" data-testid="assessment-graduate">
        <h2 className="lf-h2" id="w8-grad-h">
          Graduate students: the KerML semantics memo
        </h2>
        <p className="lf-prose lf-column">Replaces the applied exercise for graduate students (about 0.8 h). Using KerML clause 7.3 (Core: classification, features, specialization), explain in one page what subsetting and redefinition assert about the values of features, and apply the explanation to the AeroLink vertiport network listing from Session 1: what the hub’s turnaround chargers and the spoke’s redefined chargers each guarantee about every hub and every spoke. Upload it to the “Week 8 graduate memo” assignment.</p>
      </section>

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="w8-bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 9</p>
        <h2 id="w8-bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          Your concerns are what next week’s needs will frame.
        </h2>
        <p className="text-[15.5px]">Week 9 models your Week 2 needs and requirements in the Needs and Requirements packages you created this week: each need frames the concerns you modeled, and each requirement gets a subject and is derived from a need.</p>
        <Link to="/week/9" className="lf-btn">
          Week 9: {WEEKS[8].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}

/** The seeded exercise file, shown whole and numbered as the checker read it (it FAILS by design; the key is
 *  instructor-only). sysmlWeek08.test.ts checks every line:column of the recorded output against these lines. */
const seeded = () => listing('exercise-seeded')
