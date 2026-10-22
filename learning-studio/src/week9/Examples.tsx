// Worked examples (#/week/9/examples): the AeroLink needs and requirements from both Week 9 lectures, presented step by
// step on the current template (src/week8/Examples.tsx). The worked-example slides are shown as the lecture presents
// them; the explanations, listings and figures come from the student lesson (src/content/lectures/week09/session1.ts,
// session2.ts) and the case module (week09/aerolinkCase.ts), never retyped. Then the full AeroLink trace matrix, the AI
// review demonstration (the instructor's dispositions stay folded until the student asks for them, after trying) and the
// generated model v0.2, the file the course-designated checker validated (week09-report.json).
import { ArrowRight } from 'lucide-react'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { Lecture, LessonSection } from '../content/lectures/types'
import { AEROLINK_W9_MODEL, AEROLINK_W9_MODEL_FILE, AI_FINDINGS, CHILDLESS_STK, PARTIAL_CLOSED_W9, PARTIAL_OPEN, REVIEW_SEEDED, TRACE_ROWS, W9_STK_DISPOSITIONS } from '../content/lectures/week09/aerolinkCase'
import { Link } from '../lib/router'
import { CitationList } from '../lectures/Blocks'
import { LessonBlockView } from '../lectures/LessonReader'
import { lessonPath, viewerPath } from '../lectures/route'
import { SlideFace } from '../lectures/SlideFace'
import { EXAMPLE_PARTS } from './exampleParts'
import { WEEK9_PATHS } from './route'

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

/** The open-item note of a need: closed by a requirement Week 9 writes, or still open (carried with its unknown). */
function openItem(need: string): string {
  const c = PARTIAL_CLOSED_W9.find((p) => p.need === need)
  if (c) return `Partly covered in Week 2 (${c.missing}); Week 9 writes ${c.closedBy}.`
  const o = PARTIAL_OPEN.find((p) => p.need === need)
  return o ? `Partly covered: ${o.missing} has no requirement yet; carried while TBR-02 is open (Week 7 audit).` : '—'
}

function TraceMatrix() {
  return (
    <section id="ex-matrix" className="wk-section" aria-labelledby="ex-matrix-h" data-testid="example-matrix">
      <h2 id="ex-matrix-h" className="lf-h2">
        5. The full AeroLink trace matrix <span className="lf-chip">consult as needed</span>
      </h2>
      <p className="lf-prose lf-column">Every AeroLink need with the stakeholder requirements derived from it and the system requirements derived from those, read from the derivations in model v0.2. The last column carries the Week 2 open items that the derivations cannot show. All values are FICTIONAL.</p>
      <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: AeroLink needs-to-requirements trace matrix" data-testid="example-matrix-table">
        <table className="lec-table">
          <caption>AeroLink needs to requirements, computed from model v0.2, with the recorded open items.</caption>
          <thead>
            <tr>
              {['Need', 'Stakeholders', 'Frames', 'Stakeholder requirements', 'System requirements', 'Open item'].map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRACE_ROWS.map((r) => {
              return (
                <tr key={r.need} data-partial={PARTIAL_OPEN.some((p) => p.need === r.need)}>
                  <th scope="row">{r.need}</th>
                  <td>{r.stakeholders.join(', ')}</td>
                  <td>{r.concerns.join(', ')}</td>
                  <td>{r.stkReqs.join(', ') || '—'}</td>
                  <td>{r.sysReqs.join(', ') || '—'}</td>
                  <td>{openItem(r.need)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <h3 className="lf-h3">Stakeholder requirements with no system requirement yet</h3>
      <ul className="lf-list" data-testid="example-childless">
        {CHILDLESS_STK.map((id) => (
          <li key={id}>
            <strong>{id}</strong>: {W9_STK_DISPOSITIONS[id] ?? '(no disposition recorded)'}
          </li>
        ))}
      </ul>
    </section>
  )
}

function AiReview() {
  return (
    <section id="ex-ai" className="wk-section" aria-labelledby="ex-ai-h" data-testid="example-ai">
      <h2 id="ex-ai-h" className="lf-h2">
        6. AI-assisted review: the seeded set
      </h2>
      <p className="lf-prose lf-column">Six draft requirements in AeroLink’s style (course file of the review set), {REVIEW_SEEDED.length} of them with a seeded defect, and an AI-style list of {AI_FINDINGS.length} findings. Decide each finding yourself, accept or reject with a reason, before you open the instructor’s dispositions. FICTIONAL; proposed, instructor to confirm.</p>
      <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: AI-style findings on the seeded drafts">
        <table className="lec-table">
          <caption>The findings, as an AI tool might report them.</caption>
          <thead>
            <tr>
              {['#', 'Draft', 'Category', 'Quoted phrase'].map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AI_FINDINGS.map((f) => (
              <tr key={f.n}>
                <th scope="row">{f.n}</th>
                <td>{f.draft}</td>
                <td>{f.category}</td>
                <td>“{f.quote}”</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details className="lf-wide mt-3" data-testid="example-ai-key">
        <summary className="lf-btn small">Show the instructor’s dispositions</summary>
        <ul className="lf-list mt-2">
          {AI_FINDINGS.map((f) => (
            <li key={f.n}>
              <strong>Finding {f.n}</strong> ({f.verdict}): {f.disposition}. {f.reason}
            </li>
          ))}
        </ul>
        <p className="lf-muted text-[14.5px]">The seeded defects: {REVIEW_SEEDED.map((s) => `${s.draft}, ${s.category}: ${s.defect}`).join('; ')}.</p>
      </details>
    </section>
  )
}

function ModelFile() {
  return (
    <section id="ex-model" className="wk-section" aria-labelledby="ex-model-h" data-testid="example-model">
      <h2 id="ex-model-h" className="lf-h2">
        7. The generated model v0.2
      </h2>
      <p className="lf-prose lf-column">
        AeroLink model v0.2 as the Week 9 lab tool generates it from model v0.1 and the AeroLink Phase I package: the same generator your team uses. The file is kept as <code>sysml/{AEROLINK_W9_MODEL_FILE}</code> and the course-designated checker accepted it with no message. That shows the text parsed, every name resolved and no validation rule fired; it does not show that each requirement is the right one, that its subject is the right element, or that any design meets it.
      </p>
      <div className="wk-code" tabIndex={0} role="region" aria-label="AeroLink model v0.2, SysML v2 textual notation" data-testid="example-model-text">
        <pre>{AEROLINK_W9_MODEL.text}</pre>
      </div>
    </section>
  )
}

export default function Examples() {
  const lectures = { 1: getLecture(9, 1), 2: getLecture(9, 2) } as const
  return (
    <div className="wk-page" data-testid="week9-examples">
      <p className="lf-kicker">Week 9 · Worked examples</p>
      <h1 className="lf-h1">Worked examples: AeroLink’s needs and requirements</h1>
      <div className="lf-prose lf-column" style={{ marginTop: 10 }}>
        <p className="lf-lede">The instructor models AeroLink’s needs and requirements across both lectures. This page sets those worked examples out step by step, with their listings and tables, so that you can study them before your team models its own in the laboratory.</p>
      </div>
      <p className="wk-note is-caution lf-wide" role="note">
        <strong>FICTIONAL case.</strong> AeroLink Urban Mobility is fictional; every number and statement is a teaching value. Your model is always of your own enterprise, never AeroLink. The drawings are course illustrations, not SysML v2 graphical notation; the model is the text.
      </p>
      <nav aria-label="On this page" className="mt-4">
        <ol className="lf-list">
          {[...EXAMPLE_PARTS.map((p) => ({ id: p.id, title: p.title })), { id: 'matrix', title: '5. The full AeroLink trace matrix' }, { id: 'ai', title: '6. AI-assisted review: the seeded set' }, { id: 'model', title: '7. The generated model v0.2' }].map((p) => (
            <li key={p.id}>
              <a href="#/week/9/examples" onClick={(e) => (e.preventDefault(), document.getElementById(`ex-${p.id}`)?.scrollIntoView({ block: 'start' }))}>
                {p.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {(!lectures[1] || !lectures[2]) && <p role="alert">The Week 9 lectures are not available, so the worked examples cannot be shown.</p>}
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
              return section ? <LessonPart key={ls.id} lecture={lecture} section={section} skipSlides={p.slides.map((s) => s.id)} /> : null
            })}
          </section>
        ))}

      <TraceMatrix />
      <AiReview />
      <ModelFile />

      <div className="lf-actions" style={{ marginTop: 34 }}>
        <Link to={WEEK9_PATHS.lab} className="lf-btn primary">
          Next: the laboratory <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={lessonPath(9)} className="lf-btn">
          Back to the lesson
        </Link>
      </div>
    </div>
  )
}
