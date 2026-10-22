// Worked examples (#/week/11/examples): the AeroLink physical architecture and interfaces from both Week 11 lectures,
// presented step by step on the current template (src/week10/Examples.tsx). The worked-example slides are shown as the
// lecture presents them; the explanations, listings and figures come from the student lesson
// (src/content/lectures/week11/session1.ts, session2.ts) and the case module (week11/aerolinkCase.ts), never retyped. Then
// the interface table, the allocation matrix with its comparison to Week 4, the open items, the audit (the instructor's
// dispositions stay folded until the student asks for them, after trying) and the generated model v0.4, the file the
// course-designated checker validated (week11-report.json).
import { ArrowRight } from 'lucide-react'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { Lecture, LessonSection } from '../content/lectures/types'
import { AEROLINK_W11_MODEL, AEROLINK_W11_MODEL_FILE, ALLOCATION_GRID, DISPOSABLE_FINDINGS, INTERFACE_ROWS, OPEN_ITEMS, W11_DISPOSITIONS, W4_ALLOCATION_DIFFS, physicalName } from '../content/lectures/week11/aerolinkCase'
import { Link } from '../lib/router'
import { CitationList } from '../lectures/Blocks'
import { LessonBlockView } from '../lectures/LessonReader'
import { lessonPath, viewerPath } from '../lectures/route'
import { SlideFace } from '../lectures/SlideFace'
import { EXAMPLE_PARTS } from './exampleParts'
import { WEEK11_PATHS } from './route'

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

function Interfaces() {
  return (
    <section id="ex-iftable" className="wk-section" aria-labelledby="ex-iftable-h" data-testid="example-iftable">
      <h2 id="ex-iftable-h" className="lf-h2">
        5. The interface table <span className="lf-chip">consult as needed</span>
      </h2>
      <p className="lf-prose lf-column">Every AeroLink interface as model v0.4 writes it, read from the generated model: its kind and construct, its two ends and every crossing with its direction. All values are FICTIONAL.</p>
      <Table testId="example-interface-table" label="AeroLink interfaces" caption="AeroLink interfaces in model v0.4: kind, construct, ends and crossings." head={['Interface', 'Kind and construct', 'Ends', 'Crossings']} rows={INTERFACE_ROWS.map((r) => [`${r.id} ${r.name}`, `${r.kind}: ${r.construct}`, r.ends, r.flows.join('; ') || 'none: an agreement'])} />
    </section>
  )
}

function Allocation() {
  return (
    <section id="ex-alloc" className="wk-section" aria-labelledby="ex-alloc-h" data-testid="example-alloc">
      <h2 id="ex-alloc-h" className="lf-h2">
        6. Logical elements allocated to physical elements
      </h2>
      <p className="lf-prose lf-column">Each logical element and the physical elements that perform its functions, read from the allocations in model v0.4, with the functions of the nested allocations.</p>
      <Table
        testId="example-alloc-table"
        label="AeroLink logical to physical allocation"
        caption="AeroLink logical elements and their physical homes, computed from model v0.4."
        head={['Logical element', 'Allocated to', 'Nested functions']}
        rows={ALLOCATION_GRID.rows.map((r) => [r.log, ALLOCATION_GRID.cols.filter((_, i) => r.cells[i]).map((p) => `${p} ${physicalName(p)}`).join(', '), AEROLINK_W11_MODEL.allocations.filter((a) => a.log === r.log).map((a) => `${a.phy}: ${a.fns.join(', ')}`).join('; ')])}
      />
      <p className="lf-prose lf-column" data-testid="example-w4-diff">
        Compared with the Week 4 allocation table: {W4_ALLOCATION_DIFFS.length ? W4_ALLOCATION_DIFFS.map((d) => `${d.log} ${d.name} is also listed for ${d.onlyW4.join(', ')} in Week 4, where none of its functions is performed`).join('; ') : 'no difference'}.
      </p>
    </section>
  )
}

function OpenItems() {
  return (
    <section id="ex-open" className="wk-section" aria-labelledby="ex-open-h" data-testid="example-open">
      <h2 id="ex-open-h" className="lf-h2">
        7. The open items earlier weeks deferred
      </h2>
      <p className="lf-prose lf-column">What Weeks 9 and 10 left for this week, and what model v0.4 does about each.</p>
      <Table testId="example-open-table" label="Open items" caption="Open items deferred to Week 11 and their status in model v0.4." head={['Item', 'Deferred in', 'Now', 'Status']} rows={OPEN_ITEMS.map((o) => [o.item, o.from, o.now, o.status])} />
    </section>
  )
}

function Audit() {
  return (
    <section id="ex-audit" className="wk-section" aria-labelledby="ex-audit-h" data-testid="example-audit">
      <h2 id="ex-audit-h" className="lf-h2">
        8. The audit
      </h2>
      <p className="lf-prose lf-column">The findings of AeroLink model v0.4 that need a disposition, as the lab tool computes them. Decide what you would do about each one, and write the reason you would defend, before you open the instructor’s dispositions.</p>
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
              <strong>{f.id}</strong>: {W11_DISPOSITIONS[f.id] ?? '(no disposition recorded)'}
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
        9. The generated model v0.4
      </h2>
      <p className="lf-prose lf-column">
        AeroLink model v0.4 as the Week 11 lab tool generates it from model v0.3 and the AeroLink Phase I package: the same generator your team uses. The file is kept as <code>sysml/{AEROLINK_W11_MODEL_FILE}</code> and the course-designated checker accepted it with no message. That shows the text parsed, every name resolved and no validation rule fired; it does not show that connected ports match, that every flow runs the right way, or that a satisfy claim is true.
      </p>
      <div className="wk-code" tabIndex={0} role="region" aria-label="AeroLink model v0.4, SysML v2 textual notation" data-testid="example-model-text">
        <pre>{AEROLINK_W11_MODEL.text}</pre>
      </div>
    </section>
  )
}

const EXTRA = [
  { id: 'iftable', title: '5. The interface table' },
  { id: 'alloc', title: '6. Logical elements allocated to physical elements' },
  { id: 'open', title: '7. The open items earlier weeks deferred' },
  { id: 'audit', title: '8. The audit' },
  { id: 'model', title: '9. The generated model v0.4' },
]

export default function Examples() {
  const lectures = { 1: getLecture(11, 1), 2: getLecture(11, 2) } as const
  return (
    <div className="wk-page" data-testid="week11-examples">
      <p className="lf-kicker">Week 11 · Worked examples</p>
      <h1 className="lf-h1">Worked examples: AeroLink’s physical architecture and interfaces</h1>
      <div className="lf-prose lf-column" style={{ marginTop: 10 }}>
        <p className="lf-lede">The instructor models AeroLink’s physical architecture and interfaces across both lectures. This page sets those worked examples out step by step, with their listings and tables, so that you can study them before your team models its own in the laboratory.</p>
      </div>
      <p className="wk-note is-caution lf-wide" role="note">
        <strong>FICTIONAL case.</strong> AeroLink Urban Mobility is fictional; every number and statement is a teaching value. Your model is always of your own enterprise, never AeroLink. The drawings are course illustrations, not SysML v2 graphical notation; the model is the text.
      </p>
      <nav aria-label="On this page" className="mt-4">
        <ol className="lf-list">
          {[...EXAMPLE_PARTS.map((p) => ({ id: p.id, title: p.title })), ...EXTRA].map((p) => (
            <li key={p.id}>
              <a href="#/week/11/examples" onClick={(e) => (e.preventDefault(), document.getElementById(`ex-${p.id}`)?.scrollIntoView({ block: 'start' }))}>
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

      <Interfaces />
      <Allocation />
      <OpenItems />
      <Audit />
      <ModelFile />

      <div className="lf-actions" style={{ marginTop: 34 }}>
        <Link to={WEEK11_PATHS.lab} className="lf-btn primary">
          Next: the laboratory <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={lessonPath(11)} className="lf-btn">
          Back to the lesson
        </Link>
      </div>
    </div>
  )
}
