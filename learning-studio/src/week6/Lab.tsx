// Laboratory (#/week/6/lab): the full Lab L6 instructions, rendered from the single source src/content/lab/week06Lab.ts
// (docs/lectures/week06/WEEK6_LAB_INSTRUCTIONS.md is generated from the same module), with the lab tool linked and the
// record's live readiness. Template: src/week5/Lab.tsx. The gate-justification table names, for every hard gate, the slide
// where a student reads the sentence that makes a failure a real defect, and the empty-answer rule is stated beside it. The
// ID prefixes the record adds are listed with their canonical artifact types. No check or reading gates the lab.
import { ArrowRight } from 'lucide-react'
import { CitationLink } from '../lectures/Blocks'
import {
  GATE_TABLE, LAB_AT_A_GLANCE, LAB_INPUTS, LAB_LEVELS, LAB_METHOD, LAB_OBJECTIVES, LAB_OUTPUT_FILES, LAB_PARTS, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_NOTE, LAB_RUBRIC_ROWS, LAB_SUBMISSION, LAB_TITLE, LAB_TOOL,
  LAB_EMPTY_ANSWER_RULE, LAB_PREFIXES, LAB_WORKLOAD, LAB_WORKLOAD_NOTE, PROPOSED_RUBRIC, RUBRIC_LEVELS, rubricRow,
} from '../content/lab/week06Lab'
import { Link } from '../lib/router'
import { Week6Readiness } from './Readiness'
import { WEEK6_PATHS } from './route'

export default function Lab() {
  return (
    <div className="wk-page" data-testid="week6-lab">
      <p className="lf-kicker">Week 6 · Engineering laboratory</p>
      <h1 className="lf-h1">{LAB_TITLE}</h1>
      <p className="lf-lede lf-column">{LAB_PURPOSE.text}</p>
      <div className="lf-actions" style={{ marginTop: 6 }}>
        <Link to={WEEK6_PATHS['lab-tool']} className="lf-btn primary" data-testid="open-lab-tool">
          Open the lab tool <ArrowRight size={15} aria-hidden />
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
                      {i.to === WEEK6_PATHS.examples ? 'Worked examples' : 'Lab tool'}
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
            <caption className="sr-only">Lab L6 procedure: each step, when, who leads it, its output and what to do</caption>
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
            <caption className="sr-only">The Week 6 parts of the Team Record: the evidence each must contain, its minimum, and how it is judged</caption>
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
        <p className="lf-prose lf-column">Keep your IDs stable: they are the keys Week 7 imports. Each prefix maps to an artifact type of the course data model, so My Project and later weeks can read your record without retyping it.</p>
        <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: the ID prefixes Week 6 adds">
          <table className="lec-table">
            <caption>The ID prefixes the Week 6 record adds, the artifact type and relationships each maps to, and the lead role that owns it.</caption>
            <thead>
              <tr>
                <th scope="col">Prefix</th>
                <th scope="col">Artifact type and relationships</th>
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
        <p className="lf-prose lf-column">A hard gate stops an entry counting only where a sentence you can read in the lecture or the lesson says the failure is a real defect; the last column names that slide and quotes the sentence. Anything that can occur in good work is an advisory, shown and never blocking. No check tests the form or length of a name. The lab tool applies exactly these checks.</p>
        <p className="lf-prose lf-column" data-testid="lab-empty-answer-rule">{LAB_EMPTY_ANSWER_RULE}</p>
        <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: hard gates and advisories, with their basis">
          <table className="lec-table" data-testid="gate-table">
            <caption>
              Every check of the lab tool: {GATE_TABLE.filter((g) => g.kind === 'gate').length} hard gates and {GATE_TABLE.filter((g) => g.kind === 'advisory').length} advisories, each with what it checks, its basis and where a student reads it.
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
            <caption>Rubric rows applied to the Week 6 record: register rows quoted from the course rubric register, then the two proposed rows (not yet in the register, pending faculty approval).</caption>
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
              {PROPOSED_RUBRIC.map((p) => (
                <tr key={p.id} data-testid="proposed-rubric-row">
                  <th scope="row">
                    {p.id} {p.criterion} <span className="lf-chip">proposed, pending faculty approval</span>
                  </th>
                  {p.levels.map((x, j) => (
                    <td key={j}>{x}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="lf-h3">Level descriptors for the lab criteria</h3>
        <p className="lf-prose lf-column">How each part of the record is judged on the four levels (course convention, pending faculty approval). The last two rows are the graduate task’s criteria.</p>
        <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: level descriptors for the lab criteria">
          <table className="lec-table" data-testid="lab-levels">
            <caption>Four-level descriptors for every lab criterion and the graduate criteria (proposed, pending faculty approval).</caption>
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
              {LAB_LEVELS.map((x) => (
                <tr key={x.criterion}>
                  <th scope="row">{x.criterion}</th>
                  {x.levels.map((d, j) => (
                    <td key={j}>{d}</td>
                  ))}
                </tr>
              ))}
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
        <h3 className="lf-h3">Where your team’s record stands</h3>
        <Week6Readiness />
      </section>

      <section className="wk-section" aria-labelledby="lab-tool-h" data-testid="lab-tool">
        <h2 id="lab-tool-h" className="lf-h2">
          The lab tool
        </h2>
        <p className="lf-prose lf-column">{LAB_TOOL.text}</p>
        <div className="lf-actions" style={{ marginTop: 6 }}>
          <Link to={WEEK6_PATHS['lab-tool']} className="lf-btn primary">
            Open the lab tool <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </section>

      <section className="wk-section" aria-labelledby="lab-work-h" data-testid="lab-workload">
        <h2 id="lab-work-h" className="lf-h2">
          Workload
        </h2>
        <div className="lf-card lf-wide" style={{ padding: 0 }}>
          <table className="lf-table">
            <caption className="sr-only">The lab’s share of the Week 6 workload, per student</caption>
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
        <Link to={WEEK6_PATHS.assessment} className="lf-btn primary">
          Next: assessment and submission <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={WEEK6_PATHS.examples} className="lf-btn">
          Back to the worked examples
        </Link>
      </div>
    </div>
  )
}
