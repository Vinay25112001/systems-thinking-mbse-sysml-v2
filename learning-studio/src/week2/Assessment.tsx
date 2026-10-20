// Assessment and submission (#/week/2/assessment): readiness quiz Q2, kept separate from the lecture; the individual
// applied exercise and the graduate memo; the Week 2 record's submission readiness, computed by the lab tool's own
// checks; and the bridge to Week 3. Template: src/week1/Assessment.tsx.
import { ArrowRight } from 'lucide-react'
import { WEEKS } from '../content/course'
import { WEEK2_QUIZ } from '../content/quizWeek2'
import { Quiz } from '../components/Quiz'
import { bloomLabel } from '../flow/route'
import { Link } from '../lib/router'
import { WEEK2_PATHS } from './route'
import { Week2Readiness } from './Readiness'

/** Review N20: level descriptors so the applied exercise and the graduate memo can be graded consistently (course
 *  convention, pending faculty review). Levels: 4 exemplary, 3 proficient, 2 developing, 1 beginning. */
const LEVELS = ['4 Exemplary', '3 Proficient', '2 Developing', '1 Beginning']
const EXERCISE_RUBRIC: [string, string, string, string, string][] = [
  ['Scenario structure and boundary', 'Every template field present; the scenario system of interest stated; every actor outside it; the trigger is an event; both end states observable.', 'All fields present; at most one boundary or trigger slip.', 'A feature list partly turned into steps; actors or end states missing.', 'Still a feature list, or no boundary stated.'],
  ['Capabilities', 'Two outcomes at the right level, each traced to a need, neither naming a solution.', 'Two capabilities traced to needs; one leans toward a solution.', 'One usable capability, or untraced ones.', 'Features or functions in place of capabilities.'],
  ['Requirement quality', 'Three requirements pass every lab-tool hard gate, each with a rationale that says why and a fitting method.', 'Three requirements with one gate failure or a weak rationale between them.', 'Two or more gate failures, or a rationale that restates the statement.', 'Statements that are not requirements (no “shall”, no subject, no criterion).'],
  ['Trace and disposition', 'Every requirement traces to a parent at the right level; the childless need is named with a disposition in the lecture’s terms and a reason.', 'Trace complete; the disposition lacks its reason or target week.', 'A trace error (a skipped level or a false link), or no disposition.', 'No trace.'],
  ['Measures', 'An MOE from the user’s viewpoint and an MOP of the system, each with a unit and threshold, and the difference stated correctly.', 'Both measures present; one lacks a unit or threshold.', 'The two measures are swapped or are the same kind.', 'No measures, or inputs given as measures.'],
]
const MEMO_RUBRIC: [string, string, string, string, string][] = [
  ['Checklist coverage', 'Six or more checklist items applied, each to named requirements of the set.', 'Six items applied; one only in general terms.', 'Fewer than six items, or items not tied to requirements.', 'The checklist is restated, not applied.'],
  ['Evidence', 'Each verdict quotes the requirement text that supports it.', 'Most verdicts quote evidence.', 'Verdicts asserted without evidence.', 'No verdicts.'],
  ['Fixes', 'Each “not met” has a rewrite that passes the hard gates.', 'Rewrites given; one still fails a gate.', 'Fixes described but not written.', 'No fixes.'],
]
function RubricTable({ caption, rows, testId }: { caption: string; rows: [string, string, string, string, string][]; testId: string }) {
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
    <div className="wk-page" data-testid="week2-assessment">
      <p className="lf-kicker">Week 2 · Assessment and submission</p>
      <h1 className="lf-h1">Assessment and submission</h1>
      <p className="lf-lede lf-column">Due before Week 3, Session 1. The readiness quiz and the applied exercise are individual and formative; the Week 2 record is submitted once per team.</p>

      <section className="wk-section" aria-labelledby="w2-quiz-h" data-testid="assessment-quiz">
        <h2 className="lf-h2" id="w2-quiz-h">
          Readiness quiz Q2
        </h2>
        <p className="lf-muted text-[15px]">{WEEK2_QUIZ.length} questions, individual and formative, about 15 minutes, taken after both lectures. Every option has an explanation, and each question names the slide that teaches it and cites its source.</p>
        <div className="lf-wide">
          <Quiz questions={WEEK2_QUIZ} bloomText={bloomLabel} />
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w2-ex-h" data-testid="assessment-exercise">
        <h2 className="lf-h2" id="w2-ex-h">
          Individual applied exercise
        </h2>
        <div className="lf-prose lf-column">
          <p>About 35 minutes, open book, on an unseen fictional case released on the LMS: a regional blood-supply courier service with drones and vans between a blood bank and four hospitals. The brief gives the mission, three needs in the recommended form, an environment paragraph and a draft “scenario” that is really a feature list.</p>
          <ol className="wk-steps">
            <li>Rewrite the draft as one off-nominal scenario on the course template, stating its scenario system of interest.</li>
            <li>Derive two capabilities from the needs.</li>
            <li>Write three requirements (two stakeholder, one system), each with a rationale, a parent and a verification method.</li>
            <li>Trace them, and name one need left without a requirement, with its disposition.</li>
            <li>Propose one MOE and one MOP, and say what distinguishes them.</li>
          </ol>
          <p className="lf-muted">Scored on four levels against five criteria, as the table below describes.</p>
        </div>
        <div className="lf-wide">
          <RubricTable caption="Applied exercise: what each level looks like." rows={EXERCISE_RUBRIC} testId="assessment-exercise-levels" />
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w2-submit-h" data-testid="assessment-submission">
        <h2 className="lf-h2" id="w2-submit-h">
          Week 2 record: submission readiness
        </h2>
        <p className="lf-prose lf-column">The status below is computed from the record saved in this browser by the lab tool, with the same checks the tool applies part by part.</p>
        <Week2Readiness />
        <ol className="wk-steps lf-column">
          <li>Finish every part in the lab tool until each shows its check as complete.</li>
          <li>Export both files after the last change: the Markdown record and the JSON model inputs.</li>
          <li>One team member uploads both files to the “Week 2 Team Record” assignment in the learning management system.</li>
        </ol>
        <div className="lf-actions">
          <Link to={WEEK2_PATHS['lab-tool']} className="lf-btn primary" data-testid="assessment-open-tool">
            Open the lab tool <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to={WEEK2_PATHS.lab} className="lf-btn">
            Lab instructions and rubric
          </Link>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w2-grad-h" data-testid="assessment-graduate">
        <h2 className="lf-h2" id="w2-grad-h">
          Graduate students: the requirements-checklist memo
        </h2>
        <p className="lf-prose lf-column">Replaces the applied exercise for graduate students (about 0.8 h). Apply MITRE’s system-level requirements checklist (MITRE SEG pp.368–370) to your team’s requirement set and write a one-page memo: for six checklist items you choose as most relevant to your set, met or not met, the evidence, and the fix. Upload it to the “Week 2 graduate memo” assignment.</p>
        <div className="lf-wide">
          <RubricTable caption="Graduate memo: what each level looks like." rows={MEMO_RUBRIC} testId="assessment-memo-levels" />
        </div>
      </section>

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="w2-bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 3</p>
        <h2 id="w2-bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          Your TBDs are next week’s unknowns and risks.
        </h2>
        <p className="text-[15.5px]">Week 3 takes the values your requirements could not yet state, rates the technologies they depend on, and runs a trade study whose criteria come from your MOEs.</p>
        <Link to="/week/3" className="lf-btn">
          Week 3: {WEEKS[2].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
