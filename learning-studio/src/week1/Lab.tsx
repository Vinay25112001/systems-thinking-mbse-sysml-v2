// Laboratory (#/week/1/lab): the full Lab L1 instructions, rendered from the single source
// src/content/lab/week01Lab.ts (docs/lectures/week01/WEEK1_LAB_INSTRUCTIONS.md is generated from the same module),
// with the lab tool (the Team enterprise view) linked, the record's live readiness, the blank template and the
// model-inputs map. No check or reading gates the lab.
import { ArrowRight, Download } from 'lucide-react'
import { CitationLink } from '../lectures/Blocks'
import { LAB_AT_A_GLANCE, LAB_INPUTS, LAB_METHOD, LAB_OBJECTIVES, LAB_OUTPUT_FILES, LAB_PARTS, LAB_PROCEDURE, LAB_PURPOSE, LAB_RUBRIC_NOTE, LAB_RUBRIC_ROWS, LAB_SUBMISSION, LAB_TITLE, LAB_TOOL, LAB_WORKLOAD, LAB_WORKLOAD_NOTE } from '../content/lab/week01Lab'
import { teamRecordTemplate } from '../content/learn/week01'
import { ModelInputsSection, RecordReadiness, RubricTable } from '../flow/CheckSubmit'
import { preselectWorkbenchView } from '../flow/storage'
import { Link } from '../lib/router'
import { downloadText } from '../workbench/download'
import { WEEK1_PATHS } from './route'
import { Handoff } from '../project/practice/Handoff'

export default function Lab() {
  return (
    <div className="wk-page" data-testid="week1-lab">
      <p className="lf-kicker">Week 1 · Engineering laboratory</p>
      <h1 className="lf-h1">{LAB_TITLE}</h1>
      <p className="lf-lede lf-column">{LAB_PURPOSE.text}</p>
      <div className="lf-actions" style={{ marginTop: 6 }}>
        <Link to={WEEK1_PATHS['lab-tool']} className="lf-btn primary" data-testid="open-lab-tool" onClick={() => preselectWorkbenchView('team')}>
          Open the lab tool <ArrowRight size={15} aria-hidden />
        </Link>
        <button type="button" className="lf-btn" onClick={() => downloadText('team-NN-week1-record-template.md', teamRecordTemplate(), 'text/markdown')} data-testid="record-template">
          <Download size={14} aria-hidden /> Blank template (.md)
        </button>
      </div>

      {/* My Project (A22): where the lab's output lives */}
      <Handoff week={1} where="lab" />

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
                      <span key={c.reading}>
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
                      {i.to === WEEK1_PATHS.examples ? 'Worked examples' : 'Lab tool'}
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
            <caption className="sr-only">Lab L1 procedure: each step, when, who leads it, its output and what to do</caption>
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
        <p className="lf-prose lf-column">Two files, exported from the lab tool after the last change:</p>
        <ul className="lf-list">
          {LAB_OUTPUT_FILES.map((f) => (
            <li key={f.name}>
              <code>{f.name}</code>: {f.what}.
            </li>
          ))}
        </ul>
        <p className="lf-prose lf-column">The record has six parts. The minimum is the completeness check the lab tool and the instructor apply first.</p>
        <div className="lf-card" style={{ padding: 0 }}>
          <table className="lf-table lf-cards" data-testid="record-checklist">
            <caption className="sr-only">The parts of the Week 1 Team Record: the evidence each must contain, its minimum, and how it is judged</caption>
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
                <tr key={p.id}>
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

      <section className="wk-section" aria-labelledby="lab-rubric-h" data-testid="lab-rubric">
        <h2 id="lab-rubric-h" className="lf-h2">
          Grading rubric rows
        </h2>
        <RubricTable rows={LAB_RUBRIC_ROWS} caption={LAB_RUBRIC_NOTE.text} testId="record-rubric" />
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
        </dl>
        <h3 className="lf-h3">Where your team’s record stands</h3>
        <RecordReadiness />
      </section>

      <section className="wk-section" aria-labelledby="lab-tool-h" data-testid="lab-tool">
        <h2 id="lab-tool-h" className="lf-h2">
          The lab tool
        </h2>
        <p className="lf-prose lf-column">{LAB_TOOL.text}</p>
        <div className="lf-actions" style={{ marginTop: 6 }}>
          <Link to={WEEK1_PATHS['lab-tool']} className="lf-btn primary" onClick={() => preselectWorkbenchView('team')}>
            Open the Team enterprise view <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <ModelInputsSection />
      </section>

      <section className="wk-section" aria-labelledby="lab-work-h" data-testid="lab-workload">
        <h2 id="lab-work-h" className="lf-h2">
          Workload
        </h2>
        <div className="lf-card lf-wide" style={{ padding: 0 }}>
          <table className="lf-table">
            <caption className="sr-only">The lab’s share of the Week 1 workload, per student</caption>
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
        <Link to={WEEK1_PATHS.assessment} className="lf-btn primary">
          Next: assessment and submission <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={WEEK1_PATHS.examples} className="lf-btn">
          Back to the worked examples
        </Link>
      </div>
    </div>
  )
}
