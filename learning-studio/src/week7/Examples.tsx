// Worked examples (#/week/7/examples): the instructor's own Phase I package and its design review, from both Week 7
// lectures, presented step by step on the Week 6 template (src/week6/Examples.tsx). The worked-example slides are shown as
// the lecture presents them; the solutions, tables and figures come from the student lesson (src/content/lectures/week07/
// session1.ts, session2.ts) and the case module (aerolinkCase.ts), never retyped: every number below is computed there.
// The reference catalogue at the end is for consultation (it is not counted in the reading load). An optional paper
// exercise closes the page, its answer computed from the case and hidden until asked for.
import { ArrowRight } from 'lucide-react'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { Lecture, LessonSection } from '../content/lectures/types'
import { PARTIAL_COVERAGE } from '../content/lectures/week02/aerolinkCase'
import { AUDIT, COVERAGE, EXEC_SUMMARY, FINDINGS, PACKAGE_INDEX, RIDS, THREAD, needCovered } from '../content/lectures/week07/aerolinkCase'
import { ridDispositionLabel } from '../content/lectures/week07/labBrief'
import { Link } from '../lib/router'
import { CitationList } from '../lectures/Blocks'
import { LessonBlockView } from '../lectures/LessonReader'
import { lessonPath, viewerPath } from '../lectures/route'
import { SlideFace } from '../lectures/SlideFace'
import { EXAMPLE_PARTS } from './exampleParts'
import { WEEK7_PATHS } from './route'

function SlideAt({ lecture, id }: { lecture: Lecture; id: string }) {
  const slides = allSlides(lecture)
  const i = slides.findIndex((s) => s.id === id)
  if (i < 0) return null
  return (
    <figure className="wk-slide m-0" data-testid={`example-slide-${id}`}>
      <div className="lec-stage is-static">
        <SlideFace lecture={lecture} slide={slides[i]} index={i} total={slides.length} />
      </div>
      <figcaption className="lf-muted mt-1 text-[13.5px]">
        Session {lecture.session}, slide {i + 1}. <Link to={viewerPath(lecture.week, lecture.session, i + 1)}>Open it in the slide viewer</Link>
      </figcaption>
    </figure>
  )
}

function LessonPart({ lecture, section, skipSlides }: { lecture: Lecture; section: LessonSection; skipSlides: string[] }) {
  return (
    <div className="wk-lesson" data-testid={`example-lesson-${section.id}`}>
      <h3>{section.title}</h3>
      {section.blocks.map((b, i) => (b.kind === 'figure' && 'slide' in b && skipSlides.includes(b.slide) ? null : <LessonBlockView key={i} block={b} lecture={lecture} />))}
      <CitationList cites={section.sources} />
    </div>
  )
}

function Table({ caption, header, rows, testId }: { caption: string; header: string[]; rows: string[][]; testId: string }) {
  return (
    <div className="lec-table-wrap" tabIndex={0} role="region" aria-label={`Table: ${caption}`} data-testid={testId}>
      <table className="lec-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {header.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, k) => (
            <tr key={`${r[0]}-${k}`}>
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

function Catalogue() {
  return (
    <section id="ex-catalogue" className="wk-section" aria-labelledby="ex-catalogue-h" data-testid="example-catalogue">
      <h2 id="ex-catalogue-h" className="lf-h2">
        5. Reference catalogue <span className="lf-chip">consult as needed</span>
      </h2>
      <p className="lf-prose lf-column">
        The complete AeroLink Week 7 reference set, for consultation while your team assembles its own package. It is not part of the reading load. Everything is computed from the Weeks 1–6 cases; the executive summary’s decisions needed, the disposition of the communications network and the review findings are <em>proposed</em> instructor examples; all values are FICTIONAL.
      </p>
      <div className="wk-lesson">
        <Table testId="catalogue-index" caption="The package index: what each section holds, by the week that supplies it." header={['Section', 'Supplied by', 'Holds']} rows={PACKAGE_INDEX.map((s) => [s.title, s.week === 7 ? 'Week 7' : `Week ${s.week}`, s.items.map((i) => `${i.count} ${i.kind}`).join('; ') || 'written this week'])} />
        <Table testId="catalogue-coverage" caption="Coverage of each trace layer, with every item not covered." header={['Layer', 'Covered', 'Total', 'Percent', 'Not covered']} rows={COVERAGE.map((c) => [c.label, String(c.covered), String(c.total), `${c.pct} %`, c.uncovered.join(', ') || '—'])} />
        <Table testId="catalogue-findings" caption={`Every finding of the audit with its disposition: ${AUDIT.recorded} accepted with rationale and evidence, ${AUDIT.deferred} deferred with owners and weeks (status open), ${AUDIT.carried} carried from an earlier week’s record.`} header={['Finding', 'Kind', 'IDs', 'What', 'Disposition', 'Rationale', 'Owner', 'Closes in']} rows={FINDINGS.map((f) => [f.id, f.kind.replace(/-/g, ' '), f.ids.join(', '), f.text, f.disposition === 'record' ? 'accept' : 'defer', f.reason, f.owner ?? '—', f.week ? `Week ${f.week}` : '—'])} />
        <Table testId="catalogue-thread" caption="The thread walked from the need to the decision, hop by hop." header={['Item', 'Week', 'Link']} rows={THREAD.map((h) => [`${h.id} ${h.name}`, `Week ${h.week}`, h.link])} />
        <Table testId="catalogue-summary" caption="The executive summary, field by field." header={['Field', 'Content']} rows={[['Recommendation', EXEC_SUMMARY.recommendation], ['Why', EXEC_SUMMARY.why.join('; ')], ['Evidence IDs', EXEC_SUMMARY.evidence.join(', ')], ['Conditions', EXEC_SUMMARY.conditions.join('; ')], ['Residual risk', EXEC_SUMMARY.residual.join('; ')], ['Decisions needed', EXEC_SUMMARY.decisionsNeeded.join('; ')], ['Next', EXEC_SUMMARY.next]]} />
        <Table testId="catalogue-rids" caption="The review findings (RIDs) raised against the package and their dispositions." header={['RID', 'From', 'Where', 'Severity', 'Finding', 'Disposition', 'Response', 'Owner']} rows={RIDS.map((r) => [r.id, r.from, r.location, r.severity, r.finding, ridDispositionLabel(r.disposition), r.response, r.owner ?? '—'])} />
      </div>
    </section>
  )
}

function TryItYourself() {
  const p = PARTIAL_COVERAGE.find((x) => AUDIT.partialStillOpen.includes(x.need) && x.need !== RIDS[0]?.location) ?? PARTIAL_COVERAGE[0]
  return (
    <section id="ex-try" className="wk-section" aria-labelledby="ex-try-h" data-testid="example-try">
      <h2 id="ex-try-h" className="lf-h2">
        6. Try it yourself <span className="lf-chip">optional, not counted</span>
      </h2>
      <div className="lf-card" data-testid="try-paper">
        <p className="m-0">
          Look up {p.need} in the AeroLink package and the requirement that names it as a parent, {p.by}. Without looking at the answer, say what the coverage layer reports for {p.need}, what the package audit reports and why, what a reviewer reading the need against its requirement would report, and how you would write that reviewer’s RID: where, what is wrong, against which criterion, severity and a proposed fix.
        </p>
        <details className="wk-reveal mt-3" data-testid="try-paper-solution">
          <summary>Show the solution</summary>
          <ol className="lec-steps mt-2">
            <li>
              <span className="lec-step-label">The coverage layer and the audit.</span> {needCovered(p.need) ? `The coverage layer counts ${p.need} as covered: ${p.by} names it as its parent. The audit still raises it, as an open item dropped: Week 2 recorded the missing part as an open item, and no later week completed or carried it.` : `Not covered: no stakeholder requirement names ${p.need}.`}
            </li>
            <li>
              <span className="lec-step-label">The reviewer.</span> {p.by} covers {p.covered}, but not {p.missing}. The link exists and carries only part of the need: a question of requirement validation, the right requirements, which only reading can answer.
            </li>
            <li>
              <span className="lec-step-label">The RID.</span> Where: {p.need}. What: {p.by} covers {p.covered}, not {p.missing}; no other requirement names {p.need}. Criterion: the requirements must carry the whole intent of the need. Severity: major, because the gap would enter the Week 8 model as a satisfied need. Fix: write a second stakeholder requirement for {p.missing}, traced to {p.need}.
            </li>
          </ol>
        </details>
      </div>
    </section>
  )
}

export default function Examples() {
  const lectures = { 1: getLecture(7, 1), 2: getLecture(7, 2) } as const
  return (
    <div className="wk-page" data-testid="week7-examples">
      <p className="lf-kicker">Week 7 · Worked examples</p>
      <h1 className="lf-h1">Worked examples: the AeroLink package and its review</h1>
      <div className="lf-prose lf-column" style={{ marginTop: 10 }}>
        <p className="lf-lede">The instructor assembles and reviews the AeroLink Phase I package once, end to end, across both lectures. This page sets those worked examples out step by step, with their tables and figures, so that you can study them before your team assembles its own package and takes it through the review.</p>
      </div>
      <p className="wk-note is-caution lf-wide" role="note">
        <strong>FICTIONAL case.</strong> AeroLink Urban Mobility is fictional; every number and statement is a teaching value. Values marked proposed are instructor additions awaiting faculty confirmation. Your package is always about your own enterprise, never AeroLink.
      </p>
      <nav aria-label="On this page" className="mt-4">
        <ol className="lf-list">
          {[...EXAMPLE_PARTS.map((p) => ({ id: p.id, title: p.title })), { id: 'catalogue', title: '5. Reference catalogue' }, { id: 'try', title: '6. Try it yourself (optional)' }].map((p) => (
            <li key={p.id}>
              <a href="#/week/7/examples" onClick={(e) => (e.preventDefault(), document.getElementById(`ex-${p.id}`)?.scrollIntoView({ block: 'start' }))}>
                {p.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {(!lectures[1] || !lectures[2]) && <p role="alert">The Week 7 lectures are not available, so the worked examples cannot be shown.</p>}
      {lectures[1] &&
        lectures[2] &&
        EXAMPLE_PARTS.map((p) => (
          <section key={p.id} id={`ex-${p.id}`} className="wk-section" aria-labelledby={`ex-${p.id}-h`} data-testid={`example-${p.id}`}>
            <h2 id={`ex-${p.id}-h`} className="lf-h2">
              {p.title}
            </h2>
            <p className="lf-prose lf-column">{p.intro}</p>
            {p.slides.map((s) => (
              <SlideAt key={s.id} lecture={lectures[s.session]!} id={s.id} />
            ))}
            {p.lessons.map((ls) => {
              const lecture = lectures[ls.session]!
              const section = lecture.studentLesson.find((x) => x.id === ls.id)
              return section ? <LessonPart key={ls.id} lecture={lecture} section={section} skipSlides={p.slides.map((s) => s.id)} /> : <p key={ls.id} className="lf-muted">This part of the lesson is not available yet.</p>
            })}
          </section>
        ))}

      <Catalogue />
      <TryItYourself />

      <div className="lf-actions" style={{ marginTop: 34 }}>
        <Link to={WEEK7_PATHS.lab} className="lf-btn primary">
          Next: the laboratory <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={lessonPath(7)} className="lf-btn">
          Back to the lesson
        </Link>
      </div>
    </div>
  )
}
