// Worked examples (#/week/8/examples): the AeroLink import from both Week 8 lectures, presented step by step on the
// Week 1 template (src/week1/Examples.tsx). The worked-example slides are shown as the lecture presents them; the
// solutions, tables and figures come from the student lesson (src/content/lectures/week08/session1.ts, session2.ts) and
// the case module (week08/aerolinkCase.ts), never retyped. The full mapping matrix and the generated model file close
// the page; the file is the one the course-designated checker validated (week08-report.json).
import { ArrowRight } from 'lucide-react'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { Lecture, LessonSection } from '../content/lectures/types'
import { AEROLINK_FINDINGS, AEROLINK_MATRIX, AEROLINK_MODEL, AEROLINK_MODEL_FILE } from '../content/lectures/week08/aerolinkCase'
import { FINDING_CLASSES } from '../content/lectures/week08/labBrief'
import { compact } from '../workbench/week8/skeleton'
import { Link } from '../lib/router'
import { CitationList } from '../lectures/Blocks'
import { LessonBlockView } from '../lectures/LessonReader'
import { lessonPath, viewerPath } from '../lectures/route'
import { SlideFace } from '../lectures/SlideFace'
import { EXAMPLE_PARTS } from './exampleParts'
import { WEEK8_PATHS } from './route'

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

function Matrix() {
  return (
    <section id="ex-catalogue" className="wk-section" aria-labelledby="ex-catalogue-h" data-testid="example-catalogue">
      <h2 id="ex-catalogue-h" className="lf-h2">
        5. The full AeroLink mapping matrix <span className="lf-chip">consult as needed</span>
      </h2>
      <p className="lf-prose lf-column">Every ID kind of the AeroLink Phase I package. The Week 1 and Week 2 kinds are counted from the case data; the Weeks 3–6 kinds were entered by hand from the instructor reference, the way your team enters its own counts in the lab tool. All values are FICTIONAL.</p>
      <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: AeroLink artifact-to-model mapping matrix" data-testid="example-matrix-table">
        <table className="lec-table">
          <caption>AeroLink artifact-to-model mapping (course convention): the package, the construct and the week that models each kind.</caption>
          <thead>
            <tr>
              {['Kind', 'Artifact (Phase I week)', 'Package', 'SysML v2 construct', 'Modeled in', 'Count', 'IDs'].map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AEROLINK_MATRIX.map((r) => (
              <tr key={r.prefix}>
                <th scope="row">{r.prefix}</th>
                <td>
                  {r.artifact} (Week {r.phaseWeek})
                </td>
                <td>{r.pkg}</td>
                <td>{r.construct}</td>
                <td>{r.modeledIn === 8 ? 'Week 8 (now)' : `Week ${r.modeledIn}`}</td>
                <td>{r.count || '—'}</td>
                <td>{r.ids.length ? compact(r.ids) : r.status === 'not in the imported files' ? 'not yet in the reference' : 'entered by hand'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="lf-h3">What the tool reports for AeroLink</h3>
      <ul className="lf-list" data-testid="example-findings">
        {FINDING_CLASSES.map((c) => {
          const fs = AEROLINK_FINDINGS.filter((f) => f.cls === c.id)
          return (
            <li key={c.id}>
              <strong>{c.label}:</strong> {fs.length ? fs.map((f) => f.text).join(' ') : 'none.'}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function ModelFile() {
  return (
    <section id="ex-model" className="wk-section" aria-labelledby="ex-model-h" data-testid="example-model">
      <h2 id="ex-model-h" className="lf-h2">
        6. The generated model file
      </h2>
      <p className="lf-prose lf-column">
        AeroLink model v0.1 as the Week 8 lab tool generates it from the corrected Week 1 register: the same generator your team uses. The file is kept as <code>sysml/{AEROLINK_MODEL_FILE}</code> and the course-designated checker accepted it with no message. That shows the text parsed, every name resolved and no validation rule fired; it does not show that each concern says what the register says. The audit above is how that was checked.
      </p>
      <div className="wk-code" tabIndex={0} role="region" aria-label="AeroLink model v0.1, SysML v2 textual notation" data-testid="example-model-text">
        <pre>{AEROLINK_MODEL.text}</pre>
      </div>
    </section>
  )
}

export default function Examples() {
  const lectures = { 1: getLecture(8, 1), 2: getLecture(8, 2) } as const
  return (
    <div className="wk-page" data-testid="week8-examples">
      <p className="lf-kicker">Week 8 · Worked examples</p>
      <h1 className="lf-h1">Worked examples: the AeroLink import</h1>
      <div className="lf-prose lf-column" style={{ marginTop: 10 }}>
        <p className="lf-lede">The instructor works the Week 8 method once, end to end, on AeroLink across both lectures. This page sets those worked examples out step by step, with their listings and tables, so that you can study them before your team imports its own Systems Thinking package in the laboratory.</p>
      </div>
      <p className="wk-note is-caution lf-wide" role="note">
        <strong>FICTIONAL case.</strong> AeroLink Urban Mobility is fictional; every number and statement is a teaching value. Your model is always of your own enterprise, never AeroLink.
      </p>
      <nav aria-label="On this page" className="mt-4">
        <ol className="lf-list">
          {[...EXAMPLE_PARTS.map((p) => ({ id: p.id, title: p.title })), { id: 'catalogue', title: '5. The full AeroLink mapping matrix' }, { id: 'model', title: '6. The generated model file' }].map((p) => (
            <li key={p.id}>
              <a href="#/week/8/examples" onClick={(e) => (e.preventDefault(), document.getElementById(`ex-${p.id}`)?.scrollIntoView({ block: 'start' }))}>
                {p.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {(!lectures[1] || !lectures[2]) && <p role="alert">The Week 8 lectures are not available, so the worked examples cannot be shown.</p>}
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

      <Matrix />
      <ModelFile />

      <div className="lf-actions" style={{ marginTop: 34 }}>
        <Link to={WEEK8_PATHS.lab} className="lf-btn primary">
          Next: the laboratory <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={lessonPath(8)} className="lf-btn">
          Back to the lesson
        </Link>
      </div>
    </div>
  )
}
