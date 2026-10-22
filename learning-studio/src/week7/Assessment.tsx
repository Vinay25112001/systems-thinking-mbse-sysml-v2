// Assessment and submission (#/week/7/assessment): the design-review presentation rubric (team and individual criteria, a
// descriptor at every level), the peer-review RID form with a downloadable Markdown copy, the package's readiness computed
// by the package tool's own checks, the graduate trace-audit memo with its criteria, and the bridge to Week 8. No readiness
// quiz: Week 7 is a review week (assessmentParts.ts says why). Template: src/week6/Assessment.tsx.
import { ArrowRight, Download } from 'lucide-react'
import { WEEKS } from '../content/course'
import { RID_FORM_FIELDS, RUBRIC_LEVELS, ridFormMarkdown, type Criterion } from '../content/lab/week07Lab'
import { Link } from '../lib/router'
import { downloadText } from '../workbench/download'
import { EXAM_NOTE, GRADUATE_CRITERIA, INDIVIDUAL_CRITERIA, NO_QUIZ_NOTE, RID_FORM_FILE, TEAM_CRITERIA } from './assessmentParts'
import { Week7Readiness } from './Readiness'
import { WEEK7_PATHS } from './route'

function Levels({ rows, testId, caption }: { rows: Criterion[]; testId: string; caption: string }) {
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
            <tr key={r.id}>
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
  return (
    <div className="wk-page" data-testid="week7-assessment">
      <p className="lf-kicker">Week 7 · Assessment and submission</p>
      <h1 className="lf-h1">Assessment and submission</h1>
      <p className="lf-lede lf-column">The package is due 24 hours before Session 2 and closed within 3 days of it; your findings on another team’s package are due before Session 2. The rubric below is what the reviewers and the instructor apply.</p>
      <p className="wk-note lf-wide" role="note" data-testid="assessment-no-quiz">
        {NO_QUIZ_NOTE} {EXAM_NOTE}
      </p>

      <section className="wk-section" aria-labelledby="w7-rubric-h" data-testid="assessment-rubric">
        <h2 className="lf-h2" id="w7-rubric-h">
          The design-review presentation rubric
        </h2>
        <p className="lf-prose lf-column">Six team criteria, scored once for the team, and two individual criteria, scored for each member: your answers on the elements you own, and the findings you write on another team’s package. Four levels each; weights follow the course assessment table. Proposed, pending faculty approval.</p>
        <h3 className="lf-h3">Team criteria</h3>
        <Levels rows={TEAM_CRITERIA} testId="rubric-team" caption="Design review, team criteria: four-level descriptors" />
        <h3 className="lf-h3">Individual criteria</h3>
        <Levels rows={INDIVIDUAL_CRITERIA} testId="rubric-individual" caption="Design review, individual criteria: four-level descriptors" />
      </section>

      <section className="wk-section" aria-labelledby="w7-rid-h" data-testid="assessment-rid-form">
        <h2 className="lf-h2" id="w7-rid-h">
          The peer-review RID form
        </h2>
        <p className="lf-prose lf-column">Write at least two review findings on the package you were assigned, reading the sections that match your own role. At least one should concern meaning or traceability, not style. A finding with no location or no criterion cannot be checked or fixed, and scores at most level 2.</p>
        <div className="lec-table-wrap lf-wide" tabIndex={0} role="region" aria-label="Table: the fields of the RID form">
          <table className="lec-table">
            <caption>The fields of a review item discrepancy (RID) and what each must hold (course convention).</caption>
            <thead>
              <tr>
                <th scope="col">Field</th>
                <th scope="col">What it holds</th>
              </tr>
            </thead>
            <tbody>
              {RID_FORM_FIELDS.map((f) => (
                <tr key={f.field}>
                  <th scope="row">{f.field}</th>
                  <td>{f.holds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="lf-actions">
          <button type="button" className="lf-btn primary" data-testid="rid-form-download" onClick={() => downloadText(RID_FORM_FILE, ridFormMarkdown())}>
            <Download size={14} aria-hidden /> Download the RID form (.md)
          </button>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w7-submit-h" data-testid="assessment-submission">
        <h2 className="lf-h2" id="w7-submit-h">
          Your package: readiness
        </h2>
        <p className="lf-prose lf-column">The status below is computed from the package saved in this browser by the package tool, with the same checks the tool applies part by part. “Ready for review” means the entry criteria the tool can check are met; “review closed” means every finding you received is dispositioned.</p>
        <Week7Readiness />
        <ol className="wk-steps lf-column">
          <li>Load your six exports in the package tool and complete Parts 28 to 31 until the tool shows the package ready for review.</li>
          <li>Export the package index (.md) and the package (.json) and upload them with your briefing at least 24 hours before Session 2.</li>
          <li>After the review, enter every finding you received in Part 32, export again and upload the closed package within 3 days.</li>
        </ol>
        <div className="lf-actions">
          <Link to={WEEK7_PATHS['lab-tool']} className="lf-btn primary" data-testid="assessment-open-tool">
            Open the package tool <ArrowRight size={15} aria-hidden />
          </Link>
          <Link to={WEEK7_PATHS.lab} className="lf-btn">
            Lab instructions
          </Link>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="w7-grad-h" data-testid="assessment-graduate">
        <h2 className="lf-h2" id="w7-grad-h">
          Graduate students: the package trace-audit memo
        </h2>
        <p className="lf-prose lf-column">One page, about 0.7 h, individual, uploaded to the “Week 7 graduate task” assignment within 3 days of Session 2; four criteria on four levels (16 points). For your team’s package: report the coverage of each trace layer with the counting rule, reproducing one layer by hand; list every orphan and childless parent with its disposition and judge which reasons will still hold in Phase II; name the one gap that most threatens the Week 8 import and trace the model elements and relationships it would corrupt; and say what the structural audit cannot see in your package, with one example you found by reading.</p>
        <Levels rows={GRADUATE_CRITERIA} testId="graduate-levels" caption="Graduate memo: four-level descriptors for each criterion" />
      </section>

      <section className="lf-card lf-wide" style={{ marginTop: 40 }} aria-labelledby="w7-bridge-h" data-testid="bridge">
        <p className="lf-kicker">Bridge to Week 8</p>
        <h2 id="w7-bridge-h" className="lf-h3" style={{ marginTop: 0 }}>
          Your closed package is next week’s baseline.
        </h2>
        <p className="text-[15.5px]">Week 8 introduces MBSE and SysML v2 and starts model v0.1 from your package: every ID becomes a model element, every link a relationship, and every deferred finding or RID, with its owner, one of the first modeling tasks. (The Week 8 tool reads your Week 1 and Week 2 exports today; its import of the package file is being built.)</p>
        <Link to="/week/8" className="lf-btn">
          Week 8: {WEEKS[7].title} <ArrowRight size={15} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
