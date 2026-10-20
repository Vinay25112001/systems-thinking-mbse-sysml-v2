// Worked examples (#/week/1/examples): the AeroLink case from the Session 2 lecture (Section H), presented step by step.
// The worked-example slides are shown as the lecture presents them; the step-by-step solutions, tables and figures come
// from the student lesson (src/content/lectures/week01/session2.ts) and the case data module (aerolinkCase.ts), never
// retyped. The interactive AeroLink missions 1–4 are offered at the end as optional "try it yourself" practice
// (faculty-default decision 3: optional, not counted in the workload).
import { ArrowRight } from 'lucide-react'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { Lecture, LessonSection } from '../content/lectures/types'
import { CONCERNS, CONFLICT, NEEDS, PRIORITY_LABEL, stakeholder } from '../content/lectures/week01/aerolinkCase'
import week1Missions from '../content/missions/week01'
import { WORKLOAD } from '../content/week1Path'
import { Link } from '../lib/router'
import { CitationList } from '../lectures/Blocks'
import { LessonBlockView } from '../lectures/LessonReader'
import { lessonPath, viewerPath } from '../lectures/route'
import { SlideFace } from '../lectures/SlideFace'
import { WEEK1_PATHS } from './route'
import { EXAMPLE_PARTS } from './exampleParts'
import { Handoff } from '../project/practice/Handoff'
import { ExampleBanner } from '../project/pages/ui'


const PRACTICE_IDS = ['w1-m1-who', 'w1-m2-boundary', 'w1-m3-stakeholders', 'w1-m4-needs']
/** The "try it yourself" exercise on paper: CON-014 to NEED-014, with the solution built from the case data. */
export const TRY_CONCERN = 'CON-014'
export const TRY_NEED = 'NEED-014'

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
      {section.blocks.map((b, i) => (b.kind === 'figure' && 'slide' in b && skipSlides.includes(b.slide) ? null : <LessonBlockView key={i} block={b} lecture={lecture} />))}
      <CitationList cites={section.sources} />
    </div>
  )
}

function TryItYourself() {
  const con = CONCERNS.find((c) => c.id === TRY_CONCERN)
  const need = NEEDS.find((x) => x.id === TRY_NEED)
  if (!con || !need) return null
  const holder = stakeholder(con.stakeholder)
  const steps = [
    { label: 'Start from the concern', text: `${con.id}, held by ${holder.id} ${holder.name}: ${con.text}` },
    { label: 'Ask why', text: `Until the answer is an outcome the stakeholder cares about. Here: ${need.rationale}` },
    { label: 'Strip design and requirement wording', text: 'Name no mechanism (no data recorder, no software, no report format) and use no “shall” or “must”: those belong to later weeks, when requirements and solutions are analyzed.' },
    { label: 'Attribute', text: `Name the registered stakeholder, preferably in the recommended form: “${holder.name} need the [system] to …”.` },
    { label: 'State the need and its condition', text: `“${need.statement}” Condition: ${need.condition.replace(/\.$/, '')}.` },
    { label: 'Record and check', text: `${need.id}, “${need.name}”; source ${need.sources.map((s) => `${s.stakeholder}${s.concern ? ` via ${s.concern}` : ''}`).join('; ')}; priority ${PRIORITY_LABEL[need.priority].toLowerCase()} (proposed, instructor to confirm); then check form, MITRE’s attributes and the six minimum checks.` },
  ]
  return (
    <section className="lf-card" aria-labelledby="try-paper-h" data-testid="try-paper">
      <h3 id="try-paper-h" className="lf-h3" style={{ marginTop: 0 }}>
        On paper: take {con.id} to a need
      </h3>
      <p className="m-0">
        Run the six steps yourself on the insurers’ concern before you open the solution. <strong>{con.id}</strong> ({holder.name}): {con.text}
      </p>
      <details className="wk-reveal mt-3" data-testid="try-paper-solution">
        <summary>Show the worked solution</summary>
        <ol className="lec-steps mt-2">
          {steps.map((s) => (
            <li key={s.label}>
              <span className="lec-step-label">{s.label}</span> {s.text}
            </li>
          ))}
        </ol>
      </details>
    </section>
  )
}

export default function Examples() {
  const s2 = getLecture(1, 2)
  const sections = new Map((s2?.studentLesson ?? []).map((s) => [s.id, s]))
  const missions = week1Missions.missions.filter((m) => PRACTICE_IDS.includes(m.id))
  return (
    <div className="wk-page" data-testid="week1-examples">
      <p className="lf-kicker">Week 1 · Worked examples</p>
      <h1 className="lf-h1">Worked examples: the AeroLink case</h1>
      {/* My Project (A22): practice identity banner; the handoff panel closes the page */}
      <ExampleBanner>The worked example and its practice belong to the instructor’s case. Nothing here is written into your project.</ExampleBanner>
      <div className="lf-prose lf-column" style={{ marginTop: 10 }}>
        <p className="lf-lede">
          The instructor works the Week 1 method once, end to end, on AeroLink in Session 2. This page sets that worked example out step by step, with its tables and figures, so you can study it before your team applies the same method to its own enterprise in the laboratory.
        </p>
      </div>
      <p className="wk-note is-caution lf-wide" role="note">
        <strong>FICTIONAL case.</strong> AeroLink Urban Mobility is fictional; every number, rating and statement is a teaching value. Values marked proposed are instructor additions awaiting faculty confirmation. Your Team Record is always about your own enterprise, never AeroLink.
      </p>
      <nav aria-label="On this page" className="mt-4">
        <ol className="lf-list">
          {EXAMPLE_PARTS.map((p) => (
            <li key={p.id}>
              <a href={`#/week/1/examples`} onClick={(e) => (e.preventDefault(), document.getElementById(`ex-${p.id}`)?.scrollIntoView({ block: 'start' }))}>
                {p.title}
              </a>
            </li>
          ))}
          <li>
            <a href="#/week/1/examples" onClick={(e) => (e.preventDefault(), document.getElementById('ex-try')?.scrollIntoView({ block: 'start' }))}>
              4. Try it yourself (optional)
            </a>
          </li>
        </ol>
      </nav>

      {!s2 && <p role="alert">The Session 2 lecture is not available, so the worked examples cannot be shown.</p>}
      {s2 &&
        EXAMPLE_PARTS.map((p) => {
          const section = sections.get(p.lesson)
          return (
            <section key={p.id} id={`ex-${p.id}`} className="wk-section" aria-labelledby={`ex-${p.id}-h`} data-testid={`example-${p.id}`}>
              <h2 id={`ex-${p.id}-h`} className="lf-h2">
                {p.title}
              </h2>
              <p className="lf-prose lf-column">{p.intro}</p>
              {p.slides.map((id) => (
                <SlideAt key={id} lecture={s2} id={id} />
              ))}
              {section ? <LessonPart lecture={s2} section={section} skipSlides={p.slides} /> : <p className="lf-muted">This part of the lesson is not available yet.</p>}
              {p.id === 'audit' && (
                <div className="wk-lesson" data-testid="example-conflict">
                  <h3>Adjudicating the conflict, step by step</h3>
                  <p>{CONFLICT.why}</p>
                  <div className="lec-table-wrap" tabIndex={0} role="region" aria-label="Table: the adjudication route">
                    <table className="lec-table">
                      <caption>The adjudication route for {CONFLICT.relationship} (course application of MITRE’s advice; the outcome is not decided in Week 1). FICTIONAL.</caption>
                      <thead>
                        <tr>
                          <th scope="col">Step</th>
                          <th scope="col">What the team does</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CONFLICT.protocol.map((s, i) => (
                          <tr key={s.step}>
                            <th scope="row">
                              {i + 1}. {s.step}
                            </th>
                            <td>{s.text}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p>{CONFLICT.priorityReading}</p>
                </div>
              )}
            </section>
          )
        })}

      <section id="ex-try" className="wk-section" aria-labelledby="ex-try-h" data-testid="example-try">
        <h2 id="ex-try-h" className="lf-h2">
          4. Try it yourself <span className="lf-chip">optional, not counted</span>
        </h2>
        <p className="lf-prose lf-column">
          Two ways to rehearse the method before the lab. Neither is required and neither counts toward the week’s workload or grade; the lab is where your team applies the method for real.
        </p>
        <TryItYourself />
        <section className="lf-card" aria-labelledby="try-wb-h" data-testid="try-workbench" style={{ marginTop: 14 }}>
          <h3 id="try-wb-h" className="lf-h3" style={{ marginTop: 0 }}>
            In the workbench: the AeroLink missions
          </h3>
          <p className="m-0">Four short interactive exercises on the same case, each with automatic checks (about {WORKLOAD.practiceHours.toFixed(1)} h in all):</p>
          <ol className="lf-list">
            {missions.map((m) => (
              <li key={m.id}>
                <strong>{m.title}</strong> <span className="lf-muted">· {m.minutes} min</span>
              </li>
            ))}
          </ol>
          <div className="lf-actions" style={{ marginTop: 10 }}>
            <Link to={WEEK1_PATHS.practice} className="lf-btn" data-testid="open-practice">
              Open the AeroLink practice (optional) <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </section>
      </section>

      <Handoff week={1} where="examples" />

      <div className="lf-actions" style={{ marginTop: 34 }}>
        <Link to={WEEK1_PATHS.lab} className="lf-btn primary">
          Next: the laboratory <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={lessonPath(1)} className="lf-btn">
          Back to the lesson
        </Link>
      </div>
    </div>
  )
}
