// Worked examples (#/week/10/examples): the AeroLink logical architecture and behavior from both Week 10 lectures,
// presented step by step on the current template (src/week9/Examples.tsx). The worked-example slides are shown as the
// lecture presents them; the explanations, listings and figures come from the student lesson
// (src/content/lectures/week10/session1.ts, session2.ts) and the case module (week10/aerolinkCase.ts), never retyped. Then
// the scenario mapping table, the allocation of requirements to functions, the transition table, the behavior audit (the
// instructor's dispositions stay folded until the student asks for them, after trying) and the generated model v0.3,
// the file the course-designated checker validated (week10-report.json).
import { ArrowRight } from 'lucide-react'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { Lecture, LessonSection } from '../content/lectures/types'
import { AEROLINK_W10_MODEL, AEROLINK_W10_MODEL_FILE, ALLOCATION_GRID, DISPOSABLE_FINDINGS, FLOW_NODES, FLOW_SCENARIO, ITEM_FLOWS, TRANSITION_SOURCES, UNALLOCATED, W10_DISPOSITIONS, scenarioOf } from '../content/lectures/week10/aerolinkCase'
import { Link } from '../lib/router'
import { CitationList } from '../lectures/Blocks'
import { LessonBlockView } from '../lectures/LessonReader'
import { lessonPath, viewerPath } from '../lectures/route'
import { SlideFace } from '../lectures/SlideFace'
import { EXAMPLE_PARTS } from './exampleParts'
import { WEEK10_PATHS } from './route'

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

function Table({ testId, label, caption, head, rows }: { testId: string; label: string; caption: string; head: string[]; rows: string[][] }) {
  return (
    <div className="lec-table-wrap" tabIndex={0} role="region" aria-label={`Table: ${label}`} data-testid={testId}>
      <table className="lec-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
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

function Mapping() {
  const s = scenarioOf(FLOW_SCENARIO)
  return (
    <section id="ex-mapping" className="wk-section" aria-labelledby="ex-mapping-h" data-testid="example-mapping">
      <h2 id="ex-mapping-h" className="lf-h2">
        5. The mapping table of {FLOW_SCENARIO} <span className="lf-chip">consult as needed</span>
      </h2>
      <p className="lf-prose lf-column">
        Every step and alternate of {s.name}, in the order the flow writes them, with the node it becomes and the construct, read from the generated flow. Then the {ITEM_FLOWS.length} item flows the generator computed from the functions’ out and in items. All values are FICTIONAL.
      </p>
      <Table testId="example-mapping-table" label={`${FLOW_SCENARIO} mapping`} caption={`${FLOW_SCENARIO}: ConOps item, flow node and construct, computed from model v0.3.`} head={['Flow node', 'ConOps item', 'Construct']} rows={FLOW_NODES.map((n) => [n.name, n.conops, n.construct])} />
      <h3 className="lf-h3">Item flows</h3>
      <ul className="lf-list" data-testid="example-item-flows" style={{ overflowWrap: 'anywhere' }}>
        {ITEM_FLOWS.map((f) => (
          <li key={f.text}>
            <code>{f.text}</code>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Allocation() {
  return (
    <section id="ex-alloc" className="wk-section" aria-labelledby="ex-alloc-h" data-testid="example-alloc">
      <h2 id="ex-alloc-h" className="lf-h2">
        6. Requirements allocated to functions
      </h2>
      <p className="lf-prose lf-column">Each requirement the Week 4 allocation gives a function, read from the allocations in model v0.3: the traceability between the logical architecture and the requirements. System requirements with no function are listed after the table; each needs a disposition.</p>
      <Table
        testId="example-alloc-table"
        label="AeroLink requirements to functions"
        caption="AeroLink requirements and the functions they are allocated to, computed from model v0.3."
        head={['Requirement', 'Allocated to']}
        rows={ALLOCATION_GRID.rows.map((r) => [r.req, ALLOCATION_GRID.cols.filter((_, i) => r.cells[i]).join(', ')])}
      />
      <p className="lf-prose lf-column" data-testid="example-unallocated">
        System requirements allocated to no function: {UNALLOCATED.length ? UNALLOCATED.join(', ') : 'none'}.
      </p>
    </section>
  )
}

function Transitions() {
  const m = AEROLINK_W10_MODEL.machine
  if (!m) return null
  return (
    <section id="ex-transitions" className="wk-section" aria-labelledby="ex-transitions-h" data-testid="example-transitions">
      <h2 id="ex-transitions-h" className="lf-h2">
        7. The transition table of {m.name}
      </h2>
      <p className="lf-prose lf-column">
        {m.states.length} states and {m.transitions.length} transitions, each with its trigger, its guard where it has one, and the ConOps step it comes from (the instructor’s reading). The state definition is exhibited by {m.exhibitedBy}.
      </p>
      <Table
        testId="example-transition-table"
        label="AeroLink aircraft transitions"
        caption="Transitions of the aircraft’s operating states, read from model v0.3, with their ConOps source."
        head={['Transition', 'From', 'Trigger', 'Guard', 'To', 'ConOps source']}
        rows={m.transitions.map((t) => [t.name, t.from, t.trigger, t.guard || '—', t.to, TRANSITION_SOURCES[`${t.from}→${t.to}`] ?? '—'])}
      />
    </section>
  )
}

function Audit() {
  return (
    <section id="ex-audit" className="wk-section" aria-labelledby="ex-audit-h" data-testid="example-audit">
      <h2 id="ex-audit-h" className="lf-h2">
        8. The behavior audit
      </h2>
      <p className="lf-prose lf-column">The findings of AeroLink model v0.3 that need a disposition, as the lab tool computes them. Decide what you would do about each one, and write the reason you would defend, before you open the instructor’s dispositions.</p>
      <ul className="lf-list" data-testid="example-findings">
        {DISPOSABLE_FINDINGS.map((f) => (
          <li key={`${f.cls}:${f.code}:${f.id}`}>
            <strong>{f.id}</strong> ({f.cls}): {f.text}
          </li>
        ))}
      </ul>
      <details className="lf-wide mt-3" data-testid="example-key">
        <summary className="lf-btn small">Show the instructor’s dispositions</summary>
        <ul className="lf-list mt-2">
          {DISPOSABLE_FINDINGS.map((f) => (
            <li key={`${f.cls}:${f.code}:${f.id}`}>
              <strong>{f.id}</strong>: {W10_DISPOSITIONS[f.id] ?? '(no disposition recorded)'}
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}

function ModelFile() {
  return (
    <section id="ex-model" className="wk-section" aria-labelledby="ex-model-h" data-testid="example-model">
      <h2 id="ex-model-h" className="lf-h2">
        9. The generated model v0.3
      </h2>
      <p className="lf-prose lf-column">
        AeroLink model v0.3 as the Week 10 lab tool generates it from model v0.2 and the AeroLink Phase I package: the same generator your team uses. The file is kept as <code>sysml/{AEROLINK_W10_MODEL_FILE}</code> and the course-designated checker accepted it with no message. That shows the text parsed, every name resolved and no validation rule fired; it does not show that the flow follows the ConOps, that a guard means its condition, or that the states are complete.
      </p>
      <div className="wk-code" tabIndex={0} role="region" aria-label="AeroLink model v0.3, SysML v2 textual notation" data-testid="example-model-text">
        <pre>{AEROLINK_W10_MODEL.text}</pre>
      </div>
    </section>
  )
}

const EXTRA = [
  { id: 'mapping', title: `5. The mapping table of ${FLOW_SCENARIO}` },
  { id: 'alloc', title: '6. Requirements allocated to functions' },
  { id: 'transitions', title: '7. The transition table' },
  { id: 'audit', title: '8. The behavior audit' },
  { id: 'model', title: '9. The generated model v0.3' },
]

export default function Examples() {
  const lectures = { 1: getLecture(10, 1), 2: getLecture(10, 2) } as const
  return (
    <div className="wk-page" data-testid="week10-examples">
      <p className="lf-kicker">Week 10 · Worked examples</p>
      <h1 className="lf-h1">Worked examples: AeroLink’s logical architecture and behavior</h1>
      <div className="lf-prose lf-column" style={{ marginTop: 10 }}>
        <p className="lf-lede">The instructor models AeroLink’s logical architecture and behavior across both lectures. This page sets those worked examples out step by step, with their listings and tables, so that you can study them before your team models its own in the laboratory.</p>
      </div>
      <p className="wk-note is-caution lf-wide" role="note">
        <strong>FICTIONAL case.</strong> AeroLink Urban Mobility is fictional; every number and statement is a teaching value. Your model is always of your own enterprise, never AeroLink. The drawings are course illustrations, not SysML v2 graphical notation; the model is the text.
      </p>
      <nav aria-label="On this page" className="mt-4">
        <ol className="lf-list">
          {[...EXAMPLE_PARTS.map((p) => ({ id: p.id, title: p.title })), ...EXTRA].map((p) => (
            <li key={p.id}>
              <a href="#/week/10/examples" onClick={(e) => (e.preventDefault(), document.getElementById(`ex-${p.id}`)?.scrollIntoView({ block: 'start' }))}>
                {p.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {EXAMPLE_PARTS.map((p) => {
        const slides = p.slides.filter((s) => lectures[s.session])
        const lessons = p.lessons.flatMap((ls) => {
          const lecture = lectures[ls.session]
          const section = lecture?.studentLesson.find((x) => x.id === ls.id)
          return lecture && section ? [{ lecture, section }] : []
        })
        return (
          <section key={p.id} id={`ex-${p.id}`} className="wk-section" aria-labelledby={`ex-${p.id}-h`} data-testid={`example-${p.id}`}>
            <h2 id={`ex-${p.id}-h`} className="lf-h2">
              {p.title}
            </h2>
            <p className="lf-prose lf-column">{p.intro}</p>
            {slides.map((s) => (
              <SlideAt key={s.id} lecture={lectures[s.session]!} id={s.id} />
            ))}
            {lessons.map(({ lecture, section }) => (
              <LessonPart key={section.id} lecture={lecture} section={section} skipSlides={p.slides.map((s) => s.id)} />
            ))}
          </section>
        )
      })}

      <Mapping />
      <Allocation />
      <Transitions />
      <Audit />
      <ModelFile />

      <div className="lf-actions" style={{ marginTop: 34 }}>
        <Link to={WEEK10_PATHS.lab} className="lf-btn primary">
          Next: the laboratory <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={lessonPath(10)} className="lf-btn">
          Back to the lesson
        </Link>
      </div>
    </div>
  )
}
