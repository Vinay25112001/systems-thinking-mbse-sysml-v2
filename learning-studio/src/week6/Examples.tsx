// Worked examples (#/week/6/examples): the AeroLink roadmap from both Week 6 lectures, presented step by step on the Week 5
// template (src/week5/Examples.tsx). The worked-example slides are shown as the lecture presents them; the solutions,
// tables and figures come from the student lesson (src/content/lectures/week06/session1.ts, session2.ts) and the case
// module (aerolinkCase.ts), never retyped: every number below is computed there. The reference catalogue at the end is for
// consultation (it is not counted in the reading load). An optional paper exercise closes the page, its answer computed
// from the case and hidden until asked for.
import { ArrowRight } from 'lucide-react'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { Lecture, LessonSection } from '../content/lectures/types'
import { REQUIRED_CAPACITY, TRADE_RULES } from '../content/lectures/week03/aerolinkCase'
import {
  AEROLINK_HORIZONS, AROU_UPDATE, BASELINE, BASELINE_REVIEW, COUNTS, GAPS, HANDOVERS_TO_W6, IMPACT_CANDIDATE_IDS, IMPACT_JUDGED, YEAR2, YEAR2_TRANSITION, INCREMENTS, KNOWN_UNKNOWNS, TECH_PLAN, insertionReady,
} from '../content/lectures/week06/aerolinkCase'
import { approachLabel, horizonLabel, techStatusLabel } from '../content/lectures/week06/labBrief'
import { Link } from '../lib/router'
import { CitationList } from '../lectures/Blocks'
import { LessonBlockView } from '../lectures/LessonReader'
import { lessonPath, viewerPath } from '../lectures/route'
import { SlideFace } from '../lectures/SlideFace'
import { EXAMPLE_PARTS } from './exampleParts'
import { WEEK6_PATHS } from './route'

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
const yesNo = (x: { ok: boolean; why: string }) => `${x.ok ? 'yes' : 'no'}: ${x.why}`
const ordinal = (n: number) => ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][n - 1] ?? `number ${n}`
const horizonOf = (h: string) => (h === 'baseline' ? 'baseline (as is)' : horizonLabel(h))

function Catalogue() {
  const ready = TECH_PLAN.filter(insertionReady).map((t) => t.id)
  return (
    <section id="ex-catalogue" className="wk-section" aria-labelledby="ex-catalogue-h" data-testid="example-catalogue">
      <h2 id="ex-catalogue-h" className="lf-h2">
        6. Reference catalogue <span className="lf-chip">consult as needed</span>
      </h2>
      <p className="lf-prose lf-column">
        The complete AeroLink Week 6 reference set, for consultation while your team writes its own record. It is not part of the reading load. Increment 0, the baseline trajectory, holds the committed Week 3 decision; the horizons, Increments 1 to 3, the added technologies, unknowns and risks are <em>proposed</em>, instructor additions awaiting faculty confirmation; all values are FICTIONAL.
      </p>
      <div className="wk-lesson">
        <Table
          testId="catalogue-horizons"
          caption="The three planning horizons, each with its length and end state."
          header={['Horizon', 'Length', 'End state']}
          rows={AEROLINK_HORIZONS.map((h) => [h.label, h.length, h.endState])}
        />
        <Table
          testId="catalogue-gaps"
          caption={`Gaps and excesses against the baseline trajectory: ${COUNTS.gaps} gaps and ${COUNTS.excesses} excesses, each traced to the need, objective, capability or requirement behind it. Near-term capacity: ${YEAR2.capacity} − ${REQUIRED_CAPACITY} = ${COUNTS.capacityExcess} trips/day above the desired level (against the entry snapshot it would wrongly read as a gap of ${COUNTS.snapshotGap}).`}
          header={['Entry', 'Kind', 'Horizon', 'Capability', 'Desired', 'Baseline trajectory', 'Size', 'From']}
          rows={GAPS.map((g) => [g.id, g.kind, horizonLabel(g.horizon), g.capability, g.desired, g.baseline, g.size ?? '—', list(g.sources)])}
        />
        <Table
          testId="catalogue-technology"
          caption={`The technology plan: ${COUNTS.technologies} technologies, each read for maturity, insertability and operational timing; ready on all three: ${list(ready, 'none')}.`}
          header={['Technology', 'Status', 'TRL and basis', 'Insertion point', 'Maturity', 'Insertability', 'Timing', 'Risk or mitigation']}
          rows={TECH_PLAN.map((t) => [`${t.id} ${t.name}`, techStatusLabel(t.status), t.trl === null ? `none: ${t.basis}` : `TRL ${t.trl}: ${t.basis}`, t.insertion ?? `not inserted: ${t.notInserted ?? ''}`, yesNo(t.maturity), yesNo(t.insertability), yesNo(t.timing), t.risk])}
        />
        <Table
          testId="catalogue-increments"
          caption={`The ${COUNTS.increments} increments, the baseline included, with every field of the record.`}
          header={['Increment', 'Horizon', 'Content', 'Serves', 'Entry trigger', 'Depends on', 'Off-ramp', 'Approach', 'Transition', 'Security', 'Resilience', 'Risks', 'Inserts']}
          rows={INCREMENTS.map((x) => [`${x.id} ${x.name}`, horizonOf(x.horizon), x.content.join('; '), list(x.serves), x.trigger.join('; ') || '—', list(x.dependencies), x.offRamp || '—', x.approach ? approachLabel(x.approach) : '—', x.transition || '—', x.security, x.resilience, list(x.risks), list(x.inserts)])}
        />
        <Table
          testId="catalogue-unknowns"
          caption={`The ${COUNTS.unknowns} known unknowns, each with its owner and the increment it gates.`}
          header={['Unknown', 'Impact', 'Information needed', 'Mitigation', 'Owner', 'Gates']}
          rows={KNOWN_UNKNOWNS.map((u) => [`${u.id} ${u.name}${u.tbx ? ` (${u.tbx})` : ''}`, u.impact, u.need, u.mitigation, u.owner, u.gates])}
        />
        <Table
          testId="catalogue-arou"
          caption={`The AROU update: ${COUNTS.arou} new, changed or linked items, each tied to an increment; transition risks are marked.`}
          header={['Item', 'Kind', 'Statement', 'Category', 'Owner', 'Increment', 'Transition risk', 'Change']}
          rows={AROU_UPDATE.map((a) => [`${a.id} ${a.name}`, a.kind, a.text, a.category ?? '—', a.owner, a.increment, a.transition ? 'yes' : 'no', a.change])}
        />
        <Table
          testId="catalogue-impact"
          caption={`The impact of Increment 3: ${COUNTS.reached} of the ${COUNTS.candidates} candidates found by the links are reached; each candidate is judged with a reason.`}
          header={['Candidate', 'Reached', 'Why']}
          rows={IMPACT_CANDIDATE_IDS.map((id) => [id, IMPACT_JUDGED[id]?.reached ? 'reached' : 'not reached', IMPACT_JUDGED[id]?.why ?? ''])}
        />
        <Table testId="catalogue-handovers" caption={`What Weeks 2–5 handed to Week 6 (${COUNTS.handovers} items), each with its disposition.`} header={['From', 'Item', 'Status', 'Disposition']} rows={HANDOVERS_TO_W6.map((h) => [h.from, h.item, h.status, h.disposition])} />
        <Table
          testId="catalogue-review"
          caption={`The Phase I baseline review for Week 7: ${COUNTS.openItems} open items, each named and owned.`}
          header={['Week', 'Part', 'Status', 'Open items and owners']}
          rows={BASELINE_REVIEW.map((r) => [`Week ${r.week}`, r.part, r.status, r.items.map((x) => `${x.id}: ${x.text} (owner: ${x.owner})`).join('; ') || '—'])}
        />
      </div>
    </section>
  )
}

function TryItYourself() {
  const t = YEAR2_TRANSITION
  return (
    <section id="ex-try" className="wk-section" aria-labelledby="ex-try-h" data-testid="example-try">
      <h2 id="ex-try-h" className="lf-h2">
        7. Try it yourself <span className="lf-chip">optional, not counted</span>
      </h2>
      <div className="lf-card" data-testid="try-paper">
        <p className="m-0">
          At entry into service AeroLink flies {BASELINE.aircraft} aircraft on {BASELINE.turnaroundChargers} turnaround chargers. Each aircraft can fly {TRADE_RULES.tripsPerAircraft} trips a day and each charger supports {TRADE_RULES.chargesPerCharger} charges a day; capacity is the smaller of the two limits. The committed Year-2 step adds {YEAR2.addedAircraft} aircraft and raises the chargers to {YEAR2.turnaroundChargers}. Without looking at the lesson, work out the capacity if all the aircraft arrive before the hub is converted, the capacity if the hub is converted first, and which aircraft brings the network to the required {REQUIRED_CAPACITY} trips a day.
        </p>
        <details className="wk-reveal mt-3" data-testid="try-paper-solution">
          <summary>Show the solution</summary>
          <ol className="lec-steps mt-2">
            <li>
              <span className="lec-step-label">Aircraft first.</span> Fleet limit {YEAR2.aircraft} × {TRADE_RULES.tripsPerAircraft} = {YEAR2.fleetLimit}; charger limit {BASELINE.turnaroundChargers} × {TRADE_RULES.chargesPerCharger} = {t.chargerLimitBefore}. Capacity {t.aircraftFirst} trips a day, limited by the {t.aircraftFirstBinding}, short of {REQUIRED_CAPACITY}.
            </li>
            <li>
              <span className="lec-step-label">Hub first.</span> The charger limit rises to {t.chargerLimitAfter} while the fleet stays at {BASELINE.aircraft}: capacity stays {t.hubFirst}, limited by the fleet. Nothing is lost while the hub is converted.
            </li>
            <li>
              <span className="lec-step-label">Which aircraft.</span> Each added aircraft then adds {TRADE_RULES.tripsPerAircraft} trips: {REQUIRED_CAPACITY} ÷ {TRADE_RULES.tripsPerAircraft} rounded up is {t.needed}, so aircraft number {t.needed}, the {ordinal(t.addedForRequired)} of the {t.added} added, meets the requirement. The order is a computation, not a preference.
            </li>
          </ol>
        </details>
      </div>
    </section>
  )
}

export default function Examples() {
  const lectures = { 1: getLecture(6, 1), 2: getLecture(6, 2) } as const
  return (
    <div className="wk-page" data-testid="week6-examples">
      <p className="lf-kicker">Week 6 · Worked examples</p>
      <h1 className="lf-h1">Worked examples: the AeroLink roadmap</h1>
      <div className="lf-prose lf-column" style={{ marginTop: 10 }}>
        <p className="lf-lede">The instructor works the Week 6 method once, end to end, on AeroLink across both lectures. This page sets those worked examples out step by step, with their tables and figures, so that you can study them before your team applies the same method to its own enterprise in the laboratory.</p>
      </div>
      <p className="wk-note is-caution lf-wide" role="note">
        <strong>FICTIONAL case.</strong> AeroLink Urban Mobility is fictional; every number and statement is a teaching value. Values marked proposed are instructor additions awaiting faculty confirmation. Your record is always about your own enterprise, never AeroLink.
      </p>
      <nav aria-label="On this page" className="mt-4">
        <ol className="lf-list">
          {[...EXAMPLE_PARTS.map((p) => ({ id: p.id, title: p.title })), { id: 'catalogue', title: '6. Reference catalogue' }, { id: 'try', title: '7. Try it yourself (optional)' }].map((p) => (
            <li key={p.id}>
              <a href="#/week/6/examples" onClick={(e) => (e.preventDefault(), document.getElementById(`ex-${p.id}`)?.scrollIntoView({ block: 'start' }))}>
                {p.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {(!lectures[1] || !lectures[2]) && <p role="alert">The Week 6 lectures are not available, so the worked examples cannot be shown.</p>}
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
        <Link to={WEEK6_PATHS.lab} className="lf-btn primary">
          Next: the laboratory <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={lessonPath(6)} className="lf-btn">
          Back to the lesson
        </Link>
      </div>
    </div>
  )
}
