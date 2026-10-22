// Laboratory (#/week/7/lab): the full Lab L7 instructions, rendered from the single source src/content/lab/week07Lab.ts
// (docs/lectures/week07/WEEK7_LAB_INSTRUCTIONS.md is generated from the same module), with the package tool linked and the
// package's live readiness. Template: src/week6/Lab.tsx. Adds the design review's entry and exit criteria and the
// presentation and review instructions. The gate-justification table names, for every hard gate, the slide where a student
// reads the sentence that makes a failure a real defect, and the empty-answer rule is stated beside it.
import { ArrowRight } from 'lucide-react'
import { CitationLink } from '../lectures/Blocks'
import {
  GATE_TABLE, LAB_AT_A_GLANCE, LAB_EMPTY_ANSWER_RULE, LAB_ENTRY_CRITERIA, LAB_EXIT_CRITERIA, LAB_INPUTS, LAB_METHOD, LAB_OBJECTIVES, LAB_OUTPUT_FILES, LAB_PARTS, LAB_PREFIXES, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_NOTE, LAB_RUBRIC_ROWS, LAB_SUBMISSION,
  LAB_TITLE, LAB_TOOL, LAB_WORKLOAD, LAB_WORKLOAD_NOTE, PRESENTATION_INSTRUCTIONS, REVIEW_INSTRUCTIONS, RUBRIC_LEVELS, rubricRow,
} from '../content/lab/week07Lab'
import { Link } from '../lib/router'
import { Week7Readiness } from './Readiness'
import { WEEK7_PATHS } from './route'

export default function Lab() {
  return (
    <div className="wk-page" data-testid="week7-lab">
      <p className="lf-kicker">Week 7 · Engineering laboratory</p>
      <h1 className="lf-h1">{LAB_TITLE}</h1>
      <p className="lf-lede lf-column">{LAB_PURPOSE.text}</p>
      <div className="lf-actions" style={{ marginTop: 6 }}>
        <Link to={WEEK7_PATHS['lab-tool']} className="lf-btn primary" data-testid="open-lab-tool">
          Open the package tool <ArrowRight size={15} aria-hidden />
        </Link>
      </div>

      <dl className="lf-terms lf-wide" style={{ marginTop: 18 }} data-testid="lab-glance">
        {LAB_AT_A_GLANCE.map((x) => (
          <div key={x.label} className="contents">
            <dt>{x.label}</dt>
            <dd>{x.value}</dd>
          </div>
        ))}
      </dl>

      <div className="lf-grid2">
        <section className="wk-section" aria-labelledby="lab-inputs-h" data-testid="lab-inputs">
          <h2 id="lab-inputs-h" className="lf-h2">
            Inputs
          </h2>
          <ul className="lf-list">
            {LAB_INPUTS.map((i, k) => (
              <li key={k}>
                {i.text.text}
                {i.cites && (
                  <>
                    {' '}
                    {i.cites.map((c, j) => (
                      <span key={`${c.reading}-${j}`}>
                        {j > 0 && '; '}
                        <CitationLink c={c} />
                      </span>
                    ))}
                  </>
                )}
                {i.to && (
                  <>
                    {' '}
                    <Link to={i.to} className="underline">
                      {i.to === WEEK7_PATHS.examples ? 'Worked examples' : 'Package tool'}
                    </Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
        <section className="wk-section" aria-labelledby="lab-obj-h" data-testid="lab-objectives">
          <h2 id="lab-obj-h" className="lf-h2">
            Objectives
          </h2>
          <ul className="lf-plain">
            {LAB_OBJECTIVES.map((o) => (
              <li key={o.id} className="lf-objective">
                <span className="lf-chip">{o.id}</span>
                <span>
                  {o.text}
                  {o.proposed && <span className="lf-muted"> (proposed, pending faculty approval)</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="wk-section" aria-labelledby="lab-method-h" data-testid="lab-method">
        <h2 id="lab-method-h" className="lf-h2">
          Engineering method
        </h2>
        <p className="lf-prose lf-column">What the team applies, in order. Each step was taught in the lectures and is worked on AeroLink in the worked examples.</p>
        <ol className="wk-steps lf-column">
          {LAB_METHOD.map((m) => (
            <li key={m.title}>
              <strong>{m.title}.</strong> {m.text.text} <span className="lf-muted text-[14px]">Taught in: {m.taught}.</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="wk-section" aria-labelledby="lab-proc-h" data-testid="lab-procedure">
        <h2 id="lab-proc-h" className="lf-h2">
          Procedure, step by step
        </h2>
        <div className="lf-card" style={{ padding: 0 }}>
          <table className="lf-table lf-cards">
            <caption className="sr-only">Lab L7 procedure: each step, when, who leads it, its output and what to do</caption>
            <thead>
              <tr>
                <th scope="col">Step</th>
                <th scope="col">When</th>
                <th scope="col">Who (lead role)</th>
                <th scope="col">Output</th>
                <th scope="col">What to do</th>
              </tr>
            </thead>
            <tbody>
              {LAB_PROCEDURE.map((p, i) => (
                <tr key={p.step}>
                  <th scope="row" className="text-left font-semibold">
                    {i + 1}. {p.step}
                  </th>
                  <td data-label="When" className="text-[14px]">
                    {p.when}
                  </td>
                  <td data-label="Who" className="text-[14px]">
                    {p.who}
                  </td>
                  <td data-label="Output" className="text-[14px]">
                    {p.output}
                  </td>
                  <td data-label="What to do" className="text-[14.5px]">
                    {p.detail.text}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="lab-review-h" data-testid="lab-review">
        <h2 id="lab-review-h" className="lf-h2">
          The design review: criteria, presentation and review instructions
        </h2>
        <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: entry and exit criteria of the design review" data-testid="lab-criteria">
          <table className="lec-table">
            <caption>The entry and exit criteria of the Phase I design review (course convention).</caption>
            <thead>
              <tr>
                <th scope="col">Criterion</th>
                <th scope="col">What it requires</th>
              </tr>
            </thead>
            <tbody>
              {[...LAB_ENTRY_CRITERIA.map((c) => ['Entry', c]), ...LAB_EXIT_CRITERIA.map((c) => ['Exit', c])].map(([k, c]) => (
                <tr key={c}>
                  <th scope="row">{k}</th>
                  <td>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="lf-h3">Presentation instructions</h3>
        <dl className="lf-terms lf-wide" data-testid="lab-presentation">
          {PRESENTATION_INSTRUCTIONS.map((x) => (
            <div key={x.title} className="contents">
              <dt>{x.title}</dt>
              <dd>{x.text.text}</dd>
            </div>
          ))}
        </dl>
        <h3 className="lf-h3">Review instructions</h3>
        <dl className="lf-terms lf-wide" data-testid="lab-review-instructions">
          {REVIEW_INSTRUCTIONS.map((x) => (
            <div key={x.title} className="contents">
              <dt>{x.title}</dt>
              <dd>{x.text.text}</dd>
            </div>
          ))}
        </dl>
        <p className="lf-prose lf-column">
          The RID form and the full presentation rubric with its level descriptors are on the{' '}
          <Link to={WEEK7_PATHS.assessment} className="underline">
            Assessment page
          </Link>
          .
        </p>
      </section>

      <section className="wk-section" aria-labelledby="lab-out-h" data-testid="lab-outputs">
        <h2 id="lab-out-h" className="lf-h2">
          Expected outputs
        </h2>
        <ul className="lf-list">
          {LAB_OUTPUT_FILES.map((f) => (
            <li key={f.name}>
              <code>{f.name}</code>: {f.what}.
            </li>
          ))}
        </ul>
        <div className="lf-card" style={{ padding: 0 }}>
          <table className="lf-table lf-cards" data-testid="record-checklist">
            <caption className="sr-only">The Week 7 parts of the Team Record: the evidence each must contain, its minimum, and how it is judged</caption>
            <thead>
              <tr>
                <th scope="col">Part</th>
                <th scope="col">Evidence required</th>
                <th scope="col">Minimum (completeness check)</th>
                <th scope="col">Judged by</th>
              </tr>
            </thead>
            <tbody>
              {LAB_PARTS.map((p) => (
                <tr key={p.heading}>
                  <th scope="row" className="text-left font-semibold">
                    {p.heading}
                  </th>
                  <td className="text-[14.5px]" data-label="Evidence">
                    {p.evidence.text}
                  </td>
                  <td className="text-[14px]" data-label="Minimum">
                    {p.minimum}
                  </td>
                  <td className="text-[14px]" data-label="Judged by">
                    {p.judged}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="lab-ids-h" data-testid="lab-prefixes">
        <h2 id="lab-ids-h" className="lf-h2">
          IDs this week adds
        </h2>
        <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: the ID prefixes Week 7 adds">
          <table className="lec-table">
            <caption>The ID prefixes the Week 7 package adds, what each is, and the lead role that owns it.</caption>
            <thead>
              <tr>
                <th scope="col">Prefix</th>
                <th scope="col">Artifact type</th>
                <th scope="col">Owner (lead role)</th>
              </tr>
            </thead>
            <tbody>
              {LAB_PREFIXES.map((p) => (
                <tr key={p.prefix}>
                  <th scope="row">
                    <code>{p.prefix}</code>
                  </th>
                  <td>{p.type}</td>
                  <td>{p.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="lab-gates-h" data-testid="lab-gates">
        <h2 id="lab-gates-h" className="lf-h2">
          Why each check blocks, or only advises
        </h2>
        <p className="lf-prose lf-column">A hard gate stops an entry counting only where a sentence you can read in the lecture says the failure is a real defect; the last column names that slide and quotes the sentence. Anything that can occur in good work is an advisory, shown and never blocking. No check tests the form or length of a name. The package tool applies exactly these checks.</p>
        <p className="lf-prose lf-column" data-testid="lab-empty-answer-rule">{LAB_EMPTY_ANSWER_RULE}</p>
        <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: hard gates and advisories, with their basis">
          <table className="lec-table" data-testid="gate-table">
            <caption>
              Every check of the package tool: {GATE_TABLE.filter((g) => g.kind === 'gate').length} hard gates and {GATE_TABLE.filter((g) => g.kind === 'advisory').length} advisories, each with what it checks, its basis and where a student reads it.
            </caption>
            <thead>
              <tr>
                <th scope="col">Check</th>
                <th scope="col">Where</th>
                <th scope="col">Hard gate or advisory</th>
                <th scope="col">What it checks</th>
                <th scope="col">Basis</th>
                <th scope="col">Where you read it</th>
              </tr>
            </thead>
            <tbody>
              {GATE_TABLE.map((g) => (
                <tr key={`${g.group}-${g.id}`} data-kind={g.kind}>
                  <th scope="row">
                    <code>{g.id}</code>
                  </th>
                  <td>{g.group}</td>
                  <td>{g.kind === 'gate' ? <strong>hard gate</strong> : <span className="lf-chip">advisory</span>}</td>
                  <td>{g.checks}</td>
                  <td>{g.basis}</td>
                  <td>{g.taught}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="lab-rubric-h" data-testid="lab-rubric">
        <h2 id="lab-rubric-h" className="lf-h2">
          Grading rubric rows
        </h2>
        <p className="lf-prose lf-column">{LAB_RUBRIC_NOTE.text}</p>
        <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: grading rubric rows">
          <table className="lec-table" data-testid="record-rubric">
            <caption>Register rows applied this week, quoted from the course rubric register. The full presentation rubric with descriptors at every level is on the Assessment page.</caption>
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
              {LAB_RUBRIC_ROWS.map(([rb, c]) => {
                const r = rubricRow(rb, c)
                return (
                  <tr key={`${rb}-${c}`}>
                    <th scope="row">
                      {r[0]} {r[1]}
                    </th>
                    {r.slice(2, 6).map((x, j) => (
                      <td key={j}>{x}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="lab-sub-h" data-testid="lab-submission">
        <h2 id="lab-sub-h" className="lf-h2">
          Submission
        </h2>
        <dl className="lf-terms lf-wide">
          <div className="contents">
            <dt>Format</dt>
            <dd>{LAB_SUBMISSION.format.text}</dd>
          </div>
          <div className="contents">
            <dt>Where and when</dt>
            <dd>{LAB_SUBMISSION.where.text}</dd>
          </div>
          <div className="contents">
            <dt>How it is graded</dt>
            <dd>{LAB_SUBMISSION.grading.text}</dd>
          </div>
          <div className="contents">
            <dt>AI use</dt>
            <dd>{LAB_SUBMISSION.aiUse}</dd>
          </div>
          <div className="contents">
            <dt>Graduate task</dt>
            <dd>{LAB_SUBMISSION.graduate.text}</dd>
          </div>
        </dl>
        <h3 className="lf-h3">Where your team’s package stands</h3>
        <Week7Readiness />
      </section>

      <section className="wk-section" aria-labelledby="lab-tool-h" data-testid="lab-tool">
        <h2 id="lab-tool-h" className="lf-h2">
          The package tool
        </h2>
        <p className="lf-prose lf-column">{LAB_TOOL.text}</p>
        <div className="lf-actions" style={{ marginTop: 6 }}>
          <Link to={WEEK7_PATHS['lab-tool']} className="lf-btn primary">
            Open the package tool <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="lab-work-h" data-testid="lab-workload">
        <h2 id="lab-work-h" className="lf-h2">
          Workload
        </h2>
        <div className="lf-card lf-wide" style={{ padding: 0 }}>
          <table className="lf-table">
            <caption className="sr-only">The lab’s share of the Week 7 workload, per student</caption>
            <thead>
              <tr>
                <th scope="col">Activity</th>
                <th scope="col" className="wk-num">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody>
              {LAB_WORKLOAD.map((w) => (
                <tr key={w.activity}>
                  <td>{w.activity}</td>
                  <td className="wk-num">{w.hours ? w.hours.toFixed(1) : 'in class'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="lf-muted lf-wide mt-2 text-[14.5px]">{LAB_WORKLOAD_NOTE.text}</p>
      </section>

      <div className="lf-actions" style={{ marginTop: 34 }}>
        <Link to={WEEK7_PATHS.assessment} className="lf-btn primary">
          Next: assessment and submission <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={WEEK7_PATHS.examples} className="lf-btn">
          Back to the worked examples
        </Link>
      </div>
    </div>
  )
}
