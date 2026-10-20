// Worked examples (#/week/5/examples): the AeroLink case from both Week 5 lectures, presented step by step on the Week 3
// template (src/week3/Examples.tsx, via src/week4/Examples.tsx). The worked-example slides are shown as the lecture
// presents them; the solutions, tables and figures come from the student lesson (src/content/lectures/week05/session1.ts,
// session2.ts) and the case module (aerolinkCase.ts), never retyped: every number below is computed there. The reference
// catalogue at the end is for consultation (it is not counted in the reading load). An optional paper exercise closes the
// page, its answer computed from the case and hidden until asked for.
import { ArrowRight } from 'lucide-react'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { Lecture, LessonSection } from '../content/lectures/types'
import {
  ADDED_IDS, CHANGE_REQUEST, COMPONENTS, COUNTS, COUPLING, DIAGONAL, EXISTING_INTERFACE_REQUIREMENTS, EXTERNAL_DISPOSITIONS, FINDINGS, GROUPINGS, ICWG, INTERFACES, INTERFACE_DECISION, INTERFACE_REQUIREMENTS, LATENCY_BUDGET, SHORT,
  W4_HANDOVERS, boundaryReasons, componentsOf, crossingFlows, directionOf, elementName, flowsOf, functionsAt, groupingCounts, iface, isExternal, isExternalInterface, n2Cell, ownerOf, requirementText, uncoveredPairs,
} from '../content/lectures/week05/aerolinkCase'
import { componentKindLabel, interfaceKindLabel } from '../content/lectures/week05/labBrief'
import { Link } from '../lib/router'
import { CitationList } from '../lectures/Blocks'
import { LessonBlockView } from '../lectures/LessonReader'
import { lessonPath, viewerPath } from '../lectures/route'
import { SlideFace } from '../lectures/SlideFace'
import { EXAMPLE_PARTS } from './exampleParts'
import { WEEK5_PATHS } from './route'

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

const list = (xs: readonly string[], none = '—') => (xs.length ? xs.join(', ') : none)
const label = (id: string) => `${id} ${elementName(id)}`
const pct = (x: number) => `${Math.round(x * 1000) / 10} %`

/** The interface N² of every element on the diagonal, as an accessible table: the row and column headers name the
 *  elements, each off-diagonal cell lists the interfaces joining its two elements (the chart is symmetric), and the last
 *  column is the degree. Computed from the definitions by n2Cell and COUNTS. */
function N2Table() {
  const deg = COUNTS.all.degrees
  return (
    <div className="lec-table-wrap" style={{ position: 'relative' }} tabIndex={0} role="region" aria-label="Table: the interface N² chart of AeroLink" data-testid="catalogue-n2">
      <table className="lec-table">
        <caption>
          The interface N² chart: {DIAGONAL.length} elements on the diagonal ({DIAGONAL.filter((d) => !isExternal(d)).length} physical, {DIAGONAL.filter(isExternal).length} external), {COUNTS.all.total} interfaces in {COUNTS.all.pairs} of the {COUNTS.all.possiblePairs} possible pairs. Each cell lists the interfaces joining its row and column elements; the chart is symmetric. Degree sum {COUNTS.all.degreeSum} = 2 × {COUNTS.all.total} interfaces.
        </caption>
        <thead>
          <tr>
            <th scope="col">Element</th>
            {DIAGONAL.map((d) => (
              <th key={d} scope="col">
                <abbr title={label(d)}>{SHORT[d] ?? d}</abbr>
              </th>
            ))}
            <th scope="col">Degree</th>
          </tr>
        </thead>
        <tbody>
          {DIAGONAL.map((a) => (
            <tr key={a}>
              <th scope="row">{label(a)}</th>
              {DIAGONAL.map((b) => (
                <td key={b} className={a === b ? 'font-semibold' : undefined}>
                  {a === b ? <><span aria-hidden>■</span><span className="sr-only">{a} itself</span></> : n2Cell(a, b).join(', ') || <><span aria-hidden>·</span><span className="sr-only">no interface</span></>}
                </td>
              ))}
              <td className="font-semibold">{deg[a]}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Degree sum</th>
            {DIAGONAL.map((d) => (
              <td key={d} />
            ))}
            <td className="font-semibold" data-testid="n2-degree-sum">
              {COUNTS.all.degreeSum}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function Catalogue() {
  const a = COUPLING.A
  const b = COUPLING.B
  return (
    <section id="ex-catalogue" className="wk-section" aria-labelledby="ex-catalogue-h" data-testid="example-catalogue">
      <h2 id="ex-catalogue-h" className="lf-h2">
        7. Reference catalogue <span className="lf-chip">consult as needed</span>
      </h2>
      <p className="lf-prose lf-column">
        The complete AeroLink Week 5 reference set, for consultation while your team writes its own record. It is not part of the reading load. Everything this week adds to the Week 4 data (the level-2 components, the attributes of every interface, {ADDED_IDS.join(' and ')}, the interface requirements, the latency budget, the change request and the aggregates) is <em>proposed</em>, an instructor addition awaiting faculty confirmation; all values are FICTIONAL.
      </p>
      <div className="wk-lesson">
        <Table
          testId="catalogue-elements"
          caption={`Level 1: the ${COUNTS.level1} Week 4 physical elements with their responsibility-card owner, the functions the Week 4 allocation places on each, and their level-2 components (${COUNTS.brokenDown.length} elements broken down).`}
          header={['Physical element', 'Owner', 'Allocated functions', 'Level-2 components']}
          rows={DIAGONAL.filter((d) => !isExternal(d)).map((p) => [label(p), ownerOf(p), list(functionsAt(p)), list(componentsOf(p).map((c) => c.id), 'not broken down')])}
        />
        <Table
          testId="catalogue-components"
          caption={`Level 2: the ${COUNTS.level2} components, each refining its parent’s allocation.`}
          header={['Component', 'Parent', 'Kind', 'Responsibility', 'Functions', 'Status']}
          rows={COMPONENTS.map((c) => [`${c.id} ${c.name}`, label(c.parent), componentKindLabel(c.kind), c.responsibility, list(c.functions), c.provenance])}
        />
        <Table
          testId="catalogue-interfaces"
          caption={`The interface definition table: ${COUNTS.all.total} interfaces (${COUNTS.all.physical} physical, ${COUNTS.all.information} information, ${COUNTS.all.organizational} organizational; ${COUNTS.all.external.length} external), every column for every interface. What crosses an information interface, and its direction, are computed from the Week 4 routes.`}
          header={['Interface', 'Kind', 'Ends', 'What crosses', 'Direction', 'Medium', 'Constraint', 'Requirements', 'Owner of each side', 'Verification', 'Standard', 'Trust boundary', 'Protection, or why none', 'Degraded mode', 'Risks']}
          rows={INTERFACES.map((x) => [
            `${x.id} ${x.name}`,
            `${interfaceKindLabel(x.kind)}${isExternalInterface(x) ? ', external' : ''}`,
            x.ends.map(label).join(' — '),
            x.kind === 'organizational' ? `agreement ${x.agreement ?? '—'}` : [...new Set(flowsOf(x).map((f) => (f.info ? `${f.info} ${f.item}` : f.item)))].join('; '),
            directionOf(x),
            x.medium,
            x.constraint,
            list(x.requirements),
            x.ends.map((e) => `${e}: ${ownerOf(e)}`).join('; '),
            x.verification.length ? x.verification.join(', ') : `planned: ${x.verificationPlan ?? 'none yet'}`,
            x.standard ?? '—',
            list(boundaryReasons(x), 'no'),
            x.protection.length ? x.protection.join('; ') : `none needed: ${x.noProtectionReason ?? '—'}`,
            x.degraded,
            list(x.risks),
          ])}
        />
        <N2Table />
        <Table
          testId="catalogue-crossing"
          caption={`Crossing-flow check: every Week 4 function information flow between two elements and the interface it now rides (${COUNTS.crossingCovered} of ${COUNTS.crossingFlows} covered).`}
          header={['Function', 'Flow', 'From → to', 'Item', 'Rides', 'Covered']}
          rows={crossingFlows().map((f) => [f.fn, f.item, `${f.from} → ${f.to}`, f.info ?? 'none', f.via.join(' then ') || 'none', f.covered ? 'yes' : 'NO'])}
        />
        <Table
          testId="catalogue-externals"
          caption="External elements with no interface, and the reason recorded for each."
          header={['External element', 'Reason']}
          rows={Object.entries(EXTERNAL_DISPOSITIONS).map(([id, why]) => [label(id), why])}
        />
        <Table
          testId="catalogue-decision"
          caption={`${INTERFACE_DECISION.id}: ${INTERFACE_DECISION.question} (${INTERFACE_DECISION.provenance})`}
          header={['Alternative', 'Chosen']}
          rows={INTERFACE_DECISION.alternatives.map((alt) => [alt, alt === INTERFACE_DECISION.chosen ? `yes: ${INTERFACE_DECISION.rationale} Would change if ${INTERFACE_DECISION.wouldChangeIf}.` : 'no'])}
        />
        <Table
          testId="catalogue-requirements"
          caption="Interface requirements written by the three steps (proposed): the boundary, the interaction, then the requirement."
          header={['Requirement', 'Interface', '1. Boundary', '2. Interaction', '3. Statement', 'Criterion', 'Method', 'Parents', 'Rationale']}
          rows={INTERFACE_REQUIREMENTS.map((q) => [`${q.id} ${q.name}`, `${q.interface} ${iface(q.interface).name}`, q.steps.boundary, q.steps.interaction, q.statement, q.criterion, q.method, list(q.parents), q.rationale])}
        />
        <Table
          testId="catalogue-existing-requirements"
          caption="Week 2 requirements that are already interface requirements, on the interfaces they govern."
          header={['Requirement', 'Statement', 'On interfaces']}
          rows={EXISTING_INTERFACE_REQUIREMENTS.map((id) => [id, requirementText(id), list(INTERFACES.filter((x) => x.requirements.includes(id)).map((x) => x.id))])}
        />
        <Table
          testId="catalogue-latency"
          caption={`Latency budget for ${LATENCY_BUDGET.requirement}: ${LATENCY_BUDGET.used} s of the ${LATENCY_BUDGET.limitS} s allocated, ${LATENCY_BUDGET.margin} s margin (proposed values). ${LATENCY_BUDGET.holdNote} ${LATENCY_BUDGET.linkLossNote}`}
          header={['Leg', 'Where', 'Seconds']}
          rows={[...LATENCY_BUDGET.legs.map((l) => [l.leg, l.where, String(l.seconds)]), ['Total allocated', '', String(LATENCY_BUDGET.used)], ['Margin', '', String(LATENCY_BUDGET.margin)]]}
        />
        <Table
          testId="catalogue-change"
          caption={`Change request ${CHANGE_REQUEST.id} on ${CHANGE_REQUEST.interface} (${CHANGE_REQUEST.provenance}).`}
          header={['Field', 'Value']}
          rows={[
            ['Change', `${CHANGE_REQUEST.change} (${CHANGE_REQUEST.why}).`],
            ['N² neighbors (interfaces sharing an end)', list(CHANGE_REQUEST.neighbours)],
            ['Reached by the change', CHANGE_REQUEST.reaches.map((r) => `${r.id}: ${r.why}`).join('; ')],
            ['Not reached', list(CHANGE_REQUEST.neighbours.filter((id) => !CHANGE_REQUEST.reaches.some((r) => r.id === id)))],
            ['Owners of the ends', list(CHANGE_REQUEST.owners)],
            ['Decider', CHANGE_REQUEST.decider],
            ['Decision', CHANGE_REQUEST.decision],
          ]}
        />
        <Table testId="catalogue-icwg" caption={`The interface control working group: the owners of the ${ICWG.interfaces.length} interfaces that cross organizational lines.`} header={['Member', 'Interfaces owned on one side']} rows={ICWG.members.map((m) => [m, list(ICWG.interfaces.filter((id) => iface(id).ends.some((e) => ownerOf(e) === m)))])} />
        <Table
          testId="catalogue-integration"
          caption="Integration aggregates: two groupings of the physical elements and the internal interfaces each leaves between aggregates (external interfaces are verified last, with the external parties)."
          header={['Grouping', 'Aggregates', 'Inside aggregates', 'Between aggregates', 'External']}
          rows={GROUPINGS.map((g) => {
            const c = groupingCounts(g)
            return [`${g.id} ${g.name}`, g.aggregates.map((x) => `{${x.join(', ')}}`).join(' '), String(c.inside), `${c.between.length}: ${list(c.between)}`, String(c.external)]
          })}
        />
        <Table
          testId="catalogue-coupling"
          caption="Coupling of the Week 4 decision with the course metric (instructor-defined): E flows, X crossing flows, κ = X / E, P element pairs joined, D_max the most partners of one element."
          header={['Allocation', 'E', 'X', 'κ', 'P', 'D_max (at)', 'Crossing pairs without an information interface']}
          rows={[
            ['A: the Week 4 allocation', String(a.E), String(a.X), pct(a.kappa), String(a.P), `${a.Dmax} (${list(a.atMax)})`, list(uncoveredPairs(a.pairs), 'none')],
            ['B: distributed dispatch (FN-002, FN-011 at the vertiports)', String(b.E), String(b.X), pct(b.kappa), String(b.P), `${b.Dmax} (${list(b.atMax)})`, list(uncoveredPairs(b.pairs), 'none')],
          ]}
        />
        <Table testId="catalogue-findings" caption="Findings of the audit, with their disposition and owner." header={['Finding', 'Where', 'What', 'Disposition', 'Owner']} rows={FINDINGS.map((f) => [f.id, f.where, f.finding, f.disposition, f.owner])} />
        <Table testId="catalogue-handovers" caption="Week 4’s hand-overs to Week 5, each with its disposition." header={['From', 'Item', 'Status', 'Disposition']} rows={W4_HANDOVERS.map((h) => [h.from, h.item, h.status, h.disposition])} />
      </div>
    </section>
  )
}

function TryItYourself() {
  const asked = ['PHY-004', 'PHY-005', 'PHY-008', 'EXT-004']
  const before = COUNTS.received
  const after = COUNTS.all
  const added = ADDED_IDS.map(iface)
  return (
    <section id="ex-try" className="wk-section" aria-labelledby="ex-try-h" data-testid="example-try">
      <h2 id="ex-try-h" className="lf-h2">
        8. Try it yourself <span className="lf-chip">optional, not counted</span>
      </h2>
      <div className="lf-card" data-testid="try-paper">
        <p className="m-0">
          Week 4 handed over {before.total} interfaces, with these degrees: {asked.map((id) => `${id} ${before.degrees[id]}`).join(', ')}; the degree sum was {before.degreeSum}. This week adds {added.map((x) => `${x.id} (${x.ends.join(' — ')})`).join(' and ')}. Without looking at the catalogue, work out the new degrees of {asked.join(', ')}, the new degree sum, and check the sum against the number of interfaces.
        </p>
        <details className="wk-reveal mt-3" data-testid="try-paper-solution">
          <summary>Show the solution</summary>
          <ol className="lec-steps mt-2">
            <li>
              <span className="lec-step-label">New degrees.</span> Each new interface adds 1 to the degree of each of its two ends: {asked.map((id) => `${id} ${before.degrees[id]} → ${after.degrees[id]}`).join('; ')}.
            </li>
            <li>
              <span className="lec-step-label">Degree sum.</span> {before.degreeSum} + 2 × {added.length} = {after.degreeSum}.
            </li>
            <li>
              <span className="lec-step-label">Check.</span> Every interface has two ends, so the sum is twice the interface count: 2 × {after.total} = {2 * after.total}
              {2 * after.total === after.degreeSum ? ', which matches.' : `, which does not match ${after.degreeSum}: recount.`} The hub is still {after.hub} {elementName(after.hub)} (degree {after.degrees[after.hub]}).
            </li>
          </ol>
        </details>
      </div>
    </section>
  )
}

export default function Examples() {
  const lectures = { 1: getLecture(5, 1), 2: getLecture(5, 2) } as const
  return (
    <div className="wk-page" data-testid="week5-examples">
      <p className="lf-kicker">Week 5 · Worked examples</p>
      <h1 className="lf-h1">Worked examples: the AeroLink case</h1>
      <div className="lf-prose lf-column" style={{ marginTop: 10 }}>
        <p className="lf-lede">The instructor works the Week 5 method once, end to end, on AeroLink across both lectures. This page sets those worked examples out step by step, with their tables and figures, so that you can study them before your team applies the same method to its own enterprise in the laboratory.</p>
      </div>
      <p className="wk-note is-caution lf-wide" role="note">
        <strong>FICTIONAL case.</strong> AeroLink Urban Mobility is fictional; every number and statement is a teaching value. Values marked proposed are instructor additions awaiting faculty confirmation. Your record is always about your own enterprise, never AeroLink.
      </p>
      <nav aria-label="On this page" className="mt-4">
        <ol className="lf-list">
          {[...EXAMPLE_PARTS.map((p) => ({ id: p.id, title: p.title })), { id: 'catalogue', title: '7. Reference catalogue' }, { id: 'try', title: '8. Try it yourself (optional)' }].map((p) => (
            <li key={p.id}>
              <a href="#/week/5/examples" onClick={(e) => (e.preventDefault(), document.getElementById(`ex-${p.id}`)?.scrollIntoView({ block: 'start' }))}>
                {p.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {(!lectures[1] || !lectures[2]) && <p role="alert">The Week 5 lectures are not available, so the worked examples cannot be shown.</p>}
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
        <Link to={WEEK5_PATHS.lab} className="lf-btn primary">
          Next: the laboratory <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={lessonPath(5)} className="lf-btn">
          Back to the lesson
        </Link>
      </div>
    </div>
  )
}
