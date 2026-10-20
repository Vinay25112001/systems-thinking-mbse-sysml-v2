// Worked examples (#/week/2/examples): the AeroLink case from both Week 2 lectures, presented step by step on the Week 1
// template (src/week1/Examples.tsx). The worked-example slides are shown as the lecture presents them; the solutions,
// tables and figures come from the student lesson (src/content/lectures/week02/session1.ts, session2.ts) and the case
// module (aerolinkCase.ts), never retyped. The reference catalogue at the end is built from the case module and is for
// consultation (it is not counted in the reading load). An optional paper exercise closes the page.
import { ArrowRight } from 'lucide-react'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { Lecture, LessonSection } from '../content/lectures/types'
import { CAPABILITIES, DELIBERATE_REQ_GAP, MOES, MOPS, PARTIAL_COVERAGE, STAKEHOLDER_REQUIREMENTS, SYSTEM_REQUIREMENTS, UNCERTAINTIES, scenariosOfCapability, type CaseRequirement } from '../content/lectures/week02/aerolinkCase'
import { REQ_GATE_TEXT } from '../content/lectures/week02/labBrief'
import { need } from '../content/lectures/week01/aerolinkCase'
import { Link } from '../lib/router'
import { CitationList } from '../lectures/Blocks'
import { LessonBlockView } from '../lectures/LessonReader'
import { lessonPath, viewerPath } from '../lectures/route'
import { SlideFace } from '../lectures/SlideFace'
import { EXAMPLE_PARTS } from './exampleParts'
import { WEEK2_PATHS } from './route'

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

const reqRows = (rs: CaseRequirement[]) => rs.map((r) => [`${r.id} ${r.name}`, r.statement, r.type, r.method, r.criterion, r.rationale, r.parents.join(', '), r.provenance])

function Catalogue() {
  return (
    <section id="ex-catalogue" className="wk-section" aria-labelledby="ex-catalogue-h" data-testid="example-catalogue">
      <h2 id="ex-catalogue-h" className="lf-h2">
        6. Reference catalogue <span className="lf-chip">consult as needed</span>
      </h2>
      <p className="lf-prose lf-column">
        The complete AeroLink Week 2 reference set, for consultation while your team writes its own record. It is not part of the reading load. Rows marked <em>proposed</em> carry the Week 1 corrections and await instructor confirmation; all values are FICTIONAL.
      </p>
      <div className="wk-lesson">
        <Table testId="catalogue-capabilities" caption="Capabilities: the needs each traces to, the parent it refines and the scenarios that exercise it." header={['Capability', 'Statement', 'Traces to', 'Refines', 'Exercised by', 'Status']} rows={CAPABILITIES.map((c) => [`${c.id} ${c.name}`, c.text, c.needs.join(', '), c.refines ?? '—', scenariosOfCapability(c.id).join(', ') || 'no scenario yet', c.provenance])} />
        <Table testId="catalogue-stk" caption="Stakeholder requirements (the service shall …)." header={['Requirement', 'Statement', 'Type', 'Method', 'Criterion', 'Rationale', 'Parents', 'Status']} rows={reqRows(STAKEHOLDER_REQUIREMENTS)} />
        <Table testId="catalogue-sys" caption="System requirements (an element or function shall …)." header={['Requirement', 'Statement', 'Type', 'Method', 'Criterion', 'Rationale', 'Parents', 'Status']} rows={reqRows(SYSTEM_REQUIREMENTS)} />
        <Table testId="catalogue-measures" caption="Measures of effectiveness and performance." header={['Measure', 'Definition', 'Threshold', 'Data source', 'Measures', 'Status']} rows={[...MOES, ...MOPS].map((m) => [`${m.id} ${m.name}`, m.text, `${m.threshold} ${m.unit}`, m.dataSource, m.measures.join(', '), m.provenance])} />
        <Table testId="catalogue-partial" caption="Needs a stakeholder requirement covers only in part, and the disposition of the uncovered part." header={['Need', 'Covered by', 'Covered', 'Not yet covered', 'Disposition']} rows={PARTIAL_COVERAGE.map((p) => [p.need, p.by, p.covered, p.missing, p.disposition])} />
        <Table testId="catalogue-uncertainty" caption="The uncertainty register behind the TBDs." header={['Item', 'What is not known or not agreed', 'Placeholder', 'Owner', 'How it closes', 'Status']} rows={UNCERTAINTIES.map((u) => [u.id, u.name, u.tbx ?? 'assumption', u.owner, u.closeBy, u.provenance])} />
      </div>
    </section>
  )
}

function TryItYourself() {
  const n = need(DELIBERATE_REQ_GAP.need)
  return (
    <section id="ex-try" className="wk-section" aria-labelledby="ex-try-h" data-testid="example-try">
      <h2 id="ex-try-h" className="lf-h2">
        7. Try it yourself <span className="lf-chip">optional, not counted</span>
      </h2>
      <div className="lf-card" data-testid="try-paper">
        <p className="m-0">
          Draft the stakeholder requirements that close the deliberate gap, <strong>{n.id}</strong>: “{n.statement}” Where a value is not known yet, write a numbered TBD or TBR and say which unknown holds it; where a requirement rests on assumption A-008 (a public-transport fallback), say so in its rationale. Check each draft against the hard gates ({REQ_GATE_TEXT}) before you open the illustration.
        </p>
        <details className="wk-reveal mt-3" data-testid="try-paper-solution">
          <summary>Show an instructor illustration (not part of the reference set)</summary>
          <ol className="lec-steps mt-2">
            <li>
              <span className="lec-step-label">Split the need.</span> It has two outcomes, notice and a way onward, so expect two requirements, each with one “shall”.
            </li>
            <li>
              <span className="lec-step-label">Notice.</span> “The AeroLink service shall notify each passenger whose confirmed trip is held, diverted or cancelled within 5 min (TBR-03) of the decision.” Performance; test with injected disruptions; parents {n.id} and CAP-015; the 5 min is a known value held with low confidence, so it is marked TBR-03 and held by a new unknown, U-007, owned by the head of customer experience.
            </li>
            <li>
              <span className="lec-step-label">A way onward.</span> “The AeroLink service shall offer each passenger whose confirmed trip is cancelled an alternative that reaches the destination vertiport’s area on the same day.” Functional; demonstration; parents {n.id} and CAP-015; the rationale names assumption A-008.
            </li>
            <li>
              <span className="lec-step-label">Check.</span> Both pass the gates once U-007 is in the register, with no advisory: “held, diverted or cancelled” lists the conditions of one obligation, not two actions.
            </li>
          </ol>
        </details>
      </div>
    </section>
  )
}

export default function Examples() {
  const lectures = { 1: getLecture(2, 1), 2: getLecture(2, 2) } as const
  return (
    <div className="wk-page" data-testid="week2-examples">
      <p className="lf-kicker">Week 2 · Worked examples</p>
      <h1 className="lf-h1">Worked examples: the AeroLink case</h1>
      <div className="lf-prose lf-column" style={{ marginTop: 10 }}>
        <p className="lf-lede">The instructor works the Week 2 method once, end to end, on AeroLink across both lectures. This page sets those worked examples out step by step, with their tables and figures, so that you can study them before your team applies the same method to its own enterprise in the laboratory.</p>
      </div>
      <p className="wk-note is-caution lf-wide" role="note">
        <strong>FICTIONAL case.</strong> AeroLink Urban Mobility is fictional; every number and statement is a teaching value. Values marked proposed are instructor additions awaiting faculty confirmation. Your record is always about your own enterprise, never AeroLink.
      </p>
      <nav aria-label="On this page" className="mt-4">
        <ol className="lf-list">
          {[...EXAMPLE_PARTS.map((p) => ({ id: p.id, title: p.title })), { id: 'catalogue', title: '6. Reference catalogue' }, { id: 'try', title: '7. Try it yourself (optional)' }].map((p) => (
            <li key={p.id}>
              <a href="#/week/2/examples" onClick={(e) => (e.preventDefault(), document.getElementById(`ex-${p.id}`)?.scrollIntoView({ block: 'start' }))}>
                {p.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {(!lectures[1] || !lectures[2]) && <p role="alert">The Week 2 lectures are not available, so the worked examples cannot be shown.</p>}
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
        <Link to={WEEK2_PATHS.lab} className="lf-btn primary">
          Next: the laboratory <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={lessonPath(2)} className="lf-btn">
          Back to the lesson
        </Link>
      </div>
    </div>
  )
}
