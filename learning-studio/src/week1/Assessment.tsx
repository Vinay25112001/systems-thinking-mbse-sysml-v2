// Assessment and submission (#/week/1/assessment): readiness quiz Q1, kept separate from the lecture; where the student
// stands by objective (quiz items plus the optional lesson self-checks); the Team Record's submission readiness (not
// ready, submitted for approval, ready), computed by the same checks as the lab tool; the graduate needs review; and the
// bridge to Week 2.
import { ArrowRight } from 'lucide-react'
import { WEEKS } from '../content/course'
import { BRIDGE } from '../content/learn/week01'
import { WEEK1_QUIZ } from '../content/quizWeek1'
import week01 from '../content/weeks/week01'
import { Quiz } from '../components/Quiz'
import { GraduateSection, ObjectiveStatus, RecordReadiness } from '../flow/CheckSubmit'
import { FlowProvider } from '../flow/state'
import { bloomLabel } from '../flow/route'
import { preselectWorkbenchView } from '../flow/storage'
import { Link } from '../lib/router'
import { WEEK1_PATHS } from './route'

export default function Assessment() {
  return (
    <FlowProvider>
      <div className="wk-page" data-testid="week1-assessment">
        <p className="lf-kicker">Week 1 · Assessment and submission</p>
        <h1 className="lf-h1">Assessment and submission</h1>
        <p className="lf-lede lf-column">
          Due {week01.assignment.due.toLowerCase()}. The readiness quiz is individual and formative; the Team Record is submitted once per team. {week01.assignment.weight}
        </p>

        <section className="wk-section" aria-labelledby="quiz-h" data-testid="assessment-quiz">
          <h2 className="lf-h2" id="quiz-h">
            Readiness quiz Q1
          </h2>
          <p className="lf-muted text-[15px]">
            {WEEK1_QUIZ.length} questions, individual and formative, taken after both lectures. Every option has an explanation, and each question cites its source.
          </p>
          <div className="lf-wide">
            <Quiz questions={WEEK1_QUIZ} bloomText={bloomLabel} />
          </div>
        </section>

        <section className="wk-section" aria-labelledby="stand-h" data-testid="assessment-objectives">
          <h2 className="lf-h2" id="stand-h">
            Where you stand, by objective
          </h2>
          <p className="lf-muted text-[15px]">From the quiz items tagged with each objective and, if you answered them, the optional self-checks in the lesson (first attempts). Self-checks never count toward a grade.</p>
          <ObjectiveStatus />
        </section>

        <section className="wk-section" aria-labelledby="submit-h" data-testid="assessment-submission">
          <h2 className="lf-h2" id="submit-h">
            Team Record: submission readiness
          </h2>
          <p className="lf-prose lf-column">
            The status below is computed from the record saved in this browser by the lab tool, with the checks the instructor applies first. A complete record whose proposal is still awaiting the instructor’s decision is “submitted for approval”, never “ready”.
          </p>
          <RecordReadiness />
          <ol className="wk-steps lf-column">
            <li>Finish every part in the lab tool until each shows its check as complete.</li>
            <li>Export both files after the last change: the Markdown record and the JSON model inputs.</li>
            <li>One team member uploads both files to the “Week 1 Team Record” assignment in the learning management system.</li>
          </ol>
          <div className="lf-actions">
            <Link to={WEEK1_PATHS['lab-tool']} className="lf-btn primary" onClick={() => preselectWorkbenchView('team')} data-testid="assessment-open-tool">
              Open the lab tool <ArrowRight size={15} aria-hidden />
            </Link>
            <Link to={WEEK1_PATHS.lab} className="lf-btn">
              Lab instructions and rubric
            </Link>
          </div>
        </section>

        <div className="wk-section">
          <GraduateSection />
        </div>

        <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="bridge-h" data-testid="bridge">
          <p className="lf-kicker">Bridge to Week 2</p>
          <h2 id="bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
            {BRIDGE.forwardQuestion.text}
          </h2>
          <p className="text-[15.5px]">{BRIDGE.continuity.text}</p>
          <Link to="/week/2" className="lf-btn">
            Week 2: {WEEKS[1].title} <ArrowRight size={15} aria-hidden />
          </Link>
        </section>
      </div>
    </FlowProvider>
  )
}
