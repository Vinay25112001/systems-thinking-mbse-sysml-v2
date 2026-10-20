// Worked examples (#/week/4/examples): the AeroLink case from both Week 4 lectures, presented step by step on the Week 3
// template (src/week3/Examples.tsx). The worked-example slides are shown as the lecture presents them; the solutions,
// tables and figures come from the student lesson (src/content/lectures/week04/session1.ts, session2.ts) and the case module
// (aerolinkCase.ts), never retyped: every number below is computed there. The reference catalogue at the end is for
// consultation (it is not counted in the reading load). An optional paper exercise closes the page.
import { ArrowRight } from 'lucide-react'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { Lecture, LessonSection } from '../content/lectures/types'
import {
  AGREEMENTS, CAPABILITY_DISPOSITIONS, CONCERN_COVERAGE, CONFIGURATION, EVALUATION, FINDINGS, FUNCTIONS, INFORMATION, LOGICAL, PHYSICAL, ROUTE_CHECK, VIEWPOINTS, flowCheck, fn, logical, physical,
} from '../content/lectures/week04/aerolinkCase'
import { criterionLabel, viewKindLabel } from '../content/lectures/week04/labBrief'
import { Link } from '../lib/router'
import { CitationList } from '../lectures/Blocks'
import { LessonBlockView } from '../lectures/LessonReader'
import { lessonPath, viewerPath } from '../lectures/route'
import { SlideFace } from '../lectures/SlideFace'
import { EXAMPLE_PARTS } from './exampleParts'
import { WEEK4_PATHS } from './route'

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
        6. Reference catalogue <span className="lf-chip">consult as needed</span>
      </h2>
      <p className="lf-prose lf-column">
        The complete AeroLink Week 4 reference set, for consultation while your team writes its own record. It is not part of the reading load. Rows marked <em>proposed</em> or <em>corrected</em> are instructor additions awaiting faculty confirmation; all values are FICTIONAL.
      </p>
      <div className="wk-lesson">
        <Table testId="catalogue-viewpoints" caption="Viewpoints: kind, purpose, concerns and conventions." header={['Viewpoint', 'Kind', 'Purpose', 'Concerns', 'Form']} rows={VIEWPOINTS.map((v) => [`${v.id} ${v.name}`, viewKindLabel(v.kind), v.purpose, v.concerns.join(', '), v.form])} />
        <Table testId="catalogue-concerns" caption="Concern × viewpoint coverage (every Week 1 concern)." header={['Concern', 'Answered by']} rows={CONCERN_COVERAGE.map((c) => [`${c.concern} ${c.name}`, c.viewpoints.join(', ') || 'none'])} />
        <Table testId="catalogue-functions" caption="Functions with inputs, outputs, traces and allocated requirements." header={['Function', 'Group', 'Inputs', 'Outputs', 'From', 'Requirements', 'Status']} rows={FUNCTIONS.map((f) => [`${f.id} ${f.name}`, f.group, f.inputs.map((x) => `${x.item} (${x.kind})`).join('; '), f.outputs.map((x) => `${x.item} (${x.kind})`).join('; '), [...f.capabilities, ...f.scenarios].join(', ') || f.planning || '', f.requirements.join(', ') || '—', f.provenance])} />
        <Table testId="catalogue-dispositions" caption="Capabilities with no function, and why." header={['Capability', 'Disposition']} rows={Object.entries(CAPABILITY_DISPOSITIONS)} />
        <Table testId="catalogue-allocation" caption="Allocation, function to logical to physical, with the criterion and the reason." header={['Function', 'Logical', 'Physical', 'Criterion', 'Reason', 'Human operation']} rows={FUNCTIONS.map((f) => [`${f.id} ${f.name}`, `${f.log} ${logical(f.log).name}`, `${f.phy} ${physical(f.phy).name}`, criterionLabel(f.criterion), f.why, f.human ?? '—'])} />
        <Table testId="catalogue-logical" caption="Logical elements and the physical elements each is allocated to." header={['Logical element', 'Allocated to', 'Performs']} rows={LOGICAL.map((l) => [`${l.id} ${l.name}`, l.phys.join(', '), FUNCTIONS.filter((f) => f.log === l.id).map((f) => f.id).join(', ')])} />
        <Table testId="catalogue-physical" caption={`Physical elements after the Week 3 decision (capacity ${CONFIGURATION.capacity} trips/day).`} header={['Physical element', 'Kind', 'Owner', 'Count', 'Status']} rows={PHYSICAL.map((p) => [`${p.id} ${p.name}`, p.kind, p.owner, p.count ?? '—', p.provenance])} />
        <Table testId="catalogue-agreements" caption="Organizational agreements of the enterprise view (they carry no data)." header={['Agreement', 'Between', 'Covers', 'Status']} rows={AGREEMENTS.map((a) => [`${a.id} ${a.name}`, a.between.join(' and '), a.covers, a.provenance])} />
        <Table testId="catalogue-information" caption="Information items: data and information, producer, consumer, decision, timeliness and sensitivity." header={['Item', 'Data → information', 'Producer → consumer', 'Decision', 'Timeliness', 'Sensitivity']} rows={INFORMATION.map((x) => [`${x.id} ${x.name}`, `${x.data} → ${x.information}`, `${x.producers.join(', ')} → ${x.consumers.join(', ')}`, `${x.decision} (${x.decisionRefs.join(', ')})`, x.timeliness, x.sensitivity])} />
        <Table testId="catalogue-flows" caption="Flow check: every function flow that crosses from one element to another, computed from the functions’ inputs and outputs, and the item that carries it." header={['Function', 'Flow', 'From → to', 'Item', 'Status']} rows={flowCheck().map((x) => [x.fn, x.item, `${x.from} → ${x.to}`, x.info ?? 'none', x.status === 'covered' ? 'carried, route covered' : x.status === 'no-route' ? 'carried, NO route: finding for Week 5' : 'NOT in the information view'])} />
        <Table testId="catalogue-routes" caption="Route check: every producer–consumer pair against the information interfaces." header={['Item', 'From → to', 'Interfaces', 'Covered']} rows={ROUTE_CHECK.map((r) => [r.info, `${r.from} → ${r.to}`, r.via.join(' then ') || 'none', r.covered ? 'yes' : 'NO: finding for Week 5'])} />
        <Table testId="catalogue-evaluation" caption="Evaluation against requirements, TPMs and risks." header={['Item', 'Allocated to', 'Evidence', 'Verdict']} rows={EVALUATION.map((r) => [`${r.id} ${r.item}`, r.allocated, r.evidence, r.verdict])} />
        <Table testId="catalogue-findings" caption="Findings while building the example: defects in the reference, and a gap in an item this week proposes." header={['Finding', 'Where', 'What', 'Proposed', 'Owner']} rows={FINDINGS.map((f) => [f.id, f.where, f.finding, f.proposed, f.owner])} />
      </div>
    </section>
  )
}

function TryItYourself() {
  const f = fn('FN-007')
  return (
    <section id="ex-try" className="wk-section" aria-labelledby="ex-try-h" data-testid="example-try">
      <h2 id="ex-try-h" className="lf-h2">
        7. Try it yourself <span className="lf-chip">optional, not counted</span>
      </h2>
      <div className="lf-card" data-testid="try-paper">
        <p className="m-0">
          Take <strong>{f.name}</strong> ({f.id}). Without looking at the catalogue, choose the logical element that performs it and the physical element it should be allocated to, name the criterion from SEBoK’s list and write the one-sentence reason. Then name one input and one output, each with its flow kind.
        </p>
        <details className="wk-reveal mt-3" data-testid="try-paper-solution">
          <summary>Show the solution</summary>
          <ol className="lec-steps mt-2">
            <li>
              <span className="lec-step-label">Allocation.</span> {f.log} {logical(f.log).name} → {f.phy} {physical(f.phy).name}; criterion: {criterionLabel(f.criterion).toLowerCase()}. {f.why}
            </li>
            <li>
              <span className="lec-step-label">Inputs and outputs.</span> In: {f.inputs.map((x) => `${x.item} (${x.kind})`).join('; ')}. Out: {f.outputs.map((x) => `${x.item} (${x.kind})`).join('; ')}.
            </li>
            <li>
              <span className="lec-step-label">Check.</span> {f.log} reaches {logical(f.log).phys.join(' and ')}, so the allocation is consistent; the requirement it carries is {f.requirements.join(', ')}.
            </li>
          </ol>
        </details>
      </div>
    </section>
  )
}

export default function Examples() {
  const lectures = { 1: getLecture(4, 1), 2: getLecture(4, 2) } as const
  return (
    <div className="wk-page" data-testid="week4-examples">
      <p className="lf-kicker">Week 4 · Worked examples</p>
      <h1 className="lf-h1">Worked examples: the AeroLink case</h1>
      <div className="lf-prose lf-column" style={{ marginTop: 10 }}>
        <p className="lf-lede">The instructor works the Week 4 method once, end to end, on AeroLink across both lectures. This page sets those worked examples out step by step, with their tables and figures, so that you can study them before your team applies the same method to its own enterprise in the laboratory.</p>
      </div>
      <p className="wk-note is-caution lf-wide" role="note">
        <strong>FICTIONAL case.</strong> AeroLink Urban Mobility is fictional; every number and statement is a teaching value. Values marked proposed or corrected are instructor additions awaiting faculty confirmation. Your record is always about your own enterprise, never AeroLink.
      </p>
      <nav aria-label="On this page" className="mt-4">
        <ol className="lf-list">
          {[...EXAMPLE_PARTS.map((p) => ({ id: p.id, title: p.title })), { id: 'catalogue', title: '6. Reference catalogue' }, { id: 'try', title: '7. Try it yourself (optional)' }].map((p) => (
            <li key={p.id}>
              <a href="#/week/4/examples" onClick={(e) => (e.preventDefault(), document.getElementById(`ex-${p.id}`)?.scrollIntoView({ block: 'start' }))}>
                {p.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {(!lectures[1] || !lectures[2]) && <p role="alert">The Week 4 lectures are not available, so the worked examples cannot be shown.</p>}
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
        <Link to={WEEK4_PATHS.lab} className="lf-btn primary">
          Next: the laboratory <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={lessonPath(4)} className="lf-btn">
          Back to the lesson
        </Link>
      </div>
    </div>
  )
}
