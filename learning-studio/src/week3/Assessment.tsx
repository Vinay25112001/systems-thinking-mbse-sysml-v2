// Assessment and submission (#/week/3/assessment): readiness quiz Q3, kept separate from the lecture; the individual
// applied exercise and the graduate Monte Carlo memo; the Week 3 record's submission readiness, computed by the lab
// tool's own checks; and the bridge to Week 4. Template: src/week2/Assessment.tsx.
import { ArrowRight } from 'lucide-react'
import { WEEKS } from '../content/course'
import { WEEK3_QUIZ } from '../content/quizWeek3'
import { Quiz } from '../components/Quiz'
import { bloomLabel } from '../flow/route'
import { Link } from '../lib/router'
import { WEEK3_PATHS } from './route'
import { Week3Readiness } from './Readiness'

export default function Assessment() {
  return (
    <div className="wk-page" data-testid="week3-assessment">
      <p className="lf-kicker">Week 3 · Assessment and submission</p>
      <h1 className="lf-h1">Assessment and submission</h1>
      <p className="lf-lede lf-column">Due before Week 4, Session 1. The readiness quiz and the applied exercise are individual and formative; the Week 3 record is submitted once per team.</p>

      <section className="wk-section" aria-labelledby="w3-quiz-h" data-testid="assessment-quiz">
        <h2 className="lf-h2" id="w3-quiz-h">
          Readiness quiz Q3
        </h2>
        <p className="lf-muted text-[15px]">{WEEK3_QUIZ.length} questions, individual and formative, about 15 minutes, taken after both lectures. Every option has an explanation, and each question names the slide that teaches it and cites its source.</p>
        <div className="lf-wide">
          <Quiz questions={WEEK3_QUIZ} bloomText={bloomLabel} />
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w3-ex-h" data-testid="assessment-exercise">
        <h2 className="lf-h2" id="w3-ex-h">
          Individual applied exercise
        </h2>
        <div className="lf-prose lf-column">
          <p>About 35 minutes, open book, on an unseen fictional case released on the LMS: a municipal electric-bus depot choosing between overnight depot charging, on-route fast chargers and a mixed option. The brief gives three technologies with supplier claims of different quality, a short list of worries from interviews, three criteria with their walk-away and stretch points, a swing ranking, and the scores of each option.</p>
          <ol className="wk-steps">
            <li>Assign a TRL to each technology with its basis (evidence or a labeled assumption), and name the lowest critical TRL.</li>
            <li>Turn three worries into condition–if–then risks, one of them a security or resilience risk; rate each with reasons and choose a handling option.</li>
            <li>Separate one issue and one unknown from the remaining worries, and say why each is not a risk.</li>
            <li>Compute the weights from the swing ranking and the leading option’s additive value.</li>
            <li>State one condition under which the recommendation would change.</li>
          </ol>
          <p className="lf-muted">Scored on four levels against five criteria (20 points): readiness; risk statements and ratings; classification; computation; recommendation.</p>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w3-submit-h" data-testid="assessment-submission">
        <h2 className="lf-h2" id="w3-submit-h">
          Week 3 record: submission readiness
        </h2>
        <p className="lf-prose lf-column">The status below is computed from the record saved in this browser by the lab tool, with the same checks the tool applies part by part.</p>
        <Week3Readiness />
        <ol className="wk-steps lf-column">
          <li>Finish every part in the lab tool until each shows its check as complete.</li>
          <li>Export both files after the last change: the Markdown record and the JSON model inputs.</li>
          <li>One team member uploads both files to the “Week 3 Team Record” assignment in the learning management system.</li>
        </ol>
        <div className="lf-actions">
          <Link to={WEEK3_PATHS['lab-tool']} className="lf-btn primary" data-testid="assessment-open-tool">
            Open the lab tool <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to={WEEK3_PATHS.lab} className="lf-btn">
            Lab instructions and rubric
          </Link>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w3-grad-h" data-testid="assessment-graduate">
        <h2 className="lf-h2" id="w3-grad-h">
          Graduate students: the Monte Carlo memo
        </h2>
        <p className="lf-prose lf-column">Replaces the applied exercise for graduate students (about 0.8 h). For the two most uncertain measures of your team’s trade study, give lower, nominal and upper scores (SEBoK pp.471–472); run at least 1,000 Monte Carlo trials; report the probability that the recommended alternative ranks first and say whether the recommendation stands. One page, individual, uploaded to the “Week 3 graduate memo” assignment.</p>
      </section>

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="w3-bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 4</p>
        <h2 id="w3-bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          Your decision is next week’s starting architecture.
        </h2>
        <p className="text-[15.5px]">Week 4 starts from the alternative your trade study recommends, decomposes its functions and builds the information view; the derived requirements and the security and resilience treatments go with it.</p>
        <Link to="/week/4" className="lf-btn">
          Week 4: {WEEKS[3].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
