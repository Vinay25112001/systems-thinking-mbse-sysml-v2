// Worked examples (#/week/3/examples): the AeroLink case from both Week 3 lectures, presented step by step on the Week 2
// template (src/week2/Examples.tsx). The worked-example slides are shown as the lecture presents them; the solutions,
// tables and figures come from the student lesson (src/content/lectures/week03/session1.ts, session2.ts) and the case
// module (aerolinkCase.ts), never retyped: every number below is computed there. The reference catalogue at the end is
// for consultation (it is not counted in the reading load). An optional paper exercise closes the page.
import { ArrowRight } from 'lucide-react'
import { getLecture } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { Lecture, LessonSection } from '../content/lectures/types'
import {
  ALL_ASSUMPTIONS, ALTERNATIVES, CRITERIA, DECISION, EVENT_CAP, FEASIBLE, ISSUES, MINMAX_DEMO, OPPORTUNITIES, RISKS, SCORES, SCREENS, SENSITIVITY, TECHNOLOGIES, TOTALS, TPMS, UNKNOWNS, VALUES,
  W2_DISPOSITIONS, W3_REQUIREMENTS, WEIGHTS, alternative, capacityOfAlt, marginOf, passesScreens, plannedProfile, rankedRisks, referenceMarginOf, riskLevel, riskStatement, wceOf,
} from '../content/lectures/week03/aerolinkCase'
import { handlingLabel } from '../content/lectures/week03/labBrief'
import { Link } from '../lib/router'
import { CitationList } from '../lectures/Blocks'
import { LessonBlockView } from '../lectures/LessonReader'
import { lessonPath, viewerPath } from '../lectures/route'
import { SlideFace } from '../lectures/SlideFace'
import { EXAMPLE_PARTS } from './exampleParts'
import { WEEK3_PATHS } from './route'

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

const f1 = (x: number) => x.toFixed(1)
const f3 = (x: number) => x.toFixed(3)
const name = (id: string) => alternative(id).name

function Catalogue() {
  return (
    <section id="ex-catalogue" className="wk-section" aria-labelledby="ex-catalogue-h" data-testid="example-catalogue">
      <h2 id="ex-catalogue-h" className="lf-h2">
        6. Reference catalogue <span className="lf-chip">consult as needed</span>
      </h2>
      <p className="lf-prose lf-column">
        The complete AeroLink Week 3 reference set, for consultation while your team writes its own record. It is not part of the reading load. Rows marked <em>proposed</em> are instructor additions (the security and resilience risks, the contingencies, the issue, the screens) awaiting faculty confirmation; all values are FICTIONAL.
      </p>
      <div className="wk-lesson">
        <Table testId="catalogue-readiness" caption="Technology readiness assessment: level, basis, criticality and what the number does not tell." header={['Technology', 'TRL', 'Basis', 'Critical?', 'Maturity risk', 'What the TRL hides', 'Status']} rows={TECHNOLOGIES.map((t) => [`${t.id} ${t.name}`, String(t.trl), `${t.basis.ref}: ${t.basis.text}`, `${t.critical ? 'yes' : 'no'}: ${t.criticalWhy}`, t.maturityRisk ?? '—', t.trlLimit, t.provenance])} />
        <Table testId="catalogue-risks" caption="Risk register, ranked by cell level, then consequence, then likelihood." header={['Risk', 'Statement', 'Category', 'L × C', 'Level', 'Handling', 'Owner', 'Trigger', 'Affects', 'Status']} rows={rankedRisks().map((r) => [`${r.id} ${r.name}`, riskStatement(r), r.category, `${r.likelihood} × ${r.consequence}`, riskLevel(r), `${handlingLabel(r.handling)}: ${r.treatment}`, r.owner, r.trigger, r.affects.join(', '), r.provenance])} />
        <Table testId="catalogue-security" caption="Security and resilience reading of the register." header={['Risk', 'Assets at stake', 'Resilience objectives', 'Note']} rows={RISKS.filter((r) => r.security || r.resilience).map((r) => [`${r.id} ${r.name}`, r.security?.assets.join('; ') ?? '—', r.resilience?.objectives.join(', ') ?? '—', [r.security?.note, r.resilience?.note].filter(Boolean).join(' ')])} />
        <Table testId="catalogue-arou" caption="Assumptions and opportunities." header={['Entry', 'Kind', 'What it says', 'Owner']} rows={[...ALL_ASSUMPTIONS.map((a) => [`${a.id} ${a.name}`, 'assumption', '—', a.owner]), ...OPPORTUNITIES.map((o) => [`${o.id} ${o.name}`, 'opportunity', o.text, o.owner])]} />
        <Table testId="catalogue-unknowns" caption="Unknowns (the Week 2 TBDs and TBRs) with their Week 3 disposition: four were due at this trade and none closed, so each is re-dated with a reason." header={['Unknown', 'Week 2 close-by', 'Week 3 status', 'Now closes by', 'Why', 'Owner']} rows={UNKNOWNS.map((u) => { const d = W2_DISPOSITIONS[u.id]; return [`${u.id} ${u.name} (${u.tbx})`, u.closeBy, d.status, d.closeBy, d.disposition, u.owner] })} />
        <Table testId="catalogue-requirements" caption="Requirements written this week: the Week 2 audit gap closed with two requirements, one obligation each." header={['Requirement', 'Statement', 'Method and criterion', 'Parents', 'Rationale']} rows={W3_REQUIREMENTS.map((q) => [`${q.id} ${q.name}`, q.statement, `${q.method}: ${q.criterion}`, q.parents.join(', '), q.rationale])} />
        <Table testId="catalogue-issues" caption="Issue log (kept apart from the register: probability one)." header={['Issue', 'What has happened', 'Owner', 'Action']} rows={ISSUES.map((i) => [`${i.id} ${i.name}`, i.text, i.owner, i.action])} />
        <Table testId="catalogue-tpms" caption="Technical performance measures: margin against the worst case, and the reference margin (zero contingency)." header={['TPM', 'Measures', 'Threshold', 'Objective', 'CBE', 'Contingency', 'WCE', 'Margin', 'Reference margin', 'Why this contingency']} rows={TPMS.map((t) => [`${t.id} ${t.name} (${t.unit})`, `${t.measures} (from ${t.derivesFrom})`, String(t.threshold), String(t.objective), String(t.cbe), f1(t.contingency), String(wceOf(t)), f1(marginOf(t)), f1(referenceMarginOf(t)), t.contingencyWhy])} />
        <Table testId="catalogue-profiles" caption="Planned profiles: planned estimate and contingency, worst case and margin at each review (month in brackets)." header={['TPM', ...plannedProfile(TPMS[0]).map((p) => `${p.label} (month ${p.month})`)]} rows={TPMS.map((t) => [`${t.id} ${t.name}`, ...plannedProfile(t).map((p) => `${p.cbe} with contingency ${f1(p.contingency)}: WCE ${f1(p.wce)}, margin ${f1(p.margin)}`)])} />
        <Table testId="catalogue-eventcap" caption="The event-cap correction downstream of the corrected noise need." header={['Element', 'Week 3 decision']} rows={Object.entries(EVENT_CAP).map(([id, text]) => [id, text])} />
        <Table testId="catalogue-screens" caption="Must-meet screens, applied before any weight: the capacity requirement, the walk-away points and two security screens." header={['Screen', 'Test', ...ALTERNATIVES.map((a) => a.id)]} rows={SCREENS.map((s) => [`${s.id} ${s.name}`, s.test, ...ALTERNATIVES.map((a) => `${s.results[a.id].pass ? 'pass' : 'fail'}: ${s.results[a.id].note}`)])} />
        <Table testId="catalogue-trade" caption="Trade study: scores (values in brackets) and totals; weights from swing points. Only alternatives that pass every screen are ranked." header={['Alternative', 'Capacity (trips/day)', ...CRITERIA.map((c, i) => `${c.name} (weight ${WEIGHTS[i].toFixed(2)})`), 'Total']} rows={ALTERNATIVES.map((a) => [`${a.id} ${a.name}`, String(capacityOfAlt(a)), ...CRITERIA.map((_, i) => `${f1(SCORES[a.id][i])} (${f3(VALUES[a.id][i])})`), passesScreens(a.id) ? f3(TOTALS[a.id]) : 'screened out'])} />
        <Table testId="catalogue-sensitivity" caption="One-at-a-time weight sensitivity among the alternatives that pass every screen: where the top rank changes." header={['Criterion', 'Base weight', 'Raised to', 'Lowered to']} rows={SENSITIVITY.map((s) => [s.criterion, s.base.toFixed(2), s.up ? `${f3(s.up.w)}: ${name(s.up.to)} ranks first` : 'no change', s.down ? `${f3(s.down.w)}: ${name(s.down.to)} ranks first` : 'no change'])} />
        <Table testId="catalogue-minmax" caption={`The normalization trap: totals with min–max scaling over the feasible alternatives, and without ${MINMAX_DEMO.removed}; fixed anchors for comparison.`} header={['Alternative', 'All feasible', `Without ${MINMAX_DEMO.removed}`, 'Fixed anchors']} rows={FEASIBLE.map((id) => [`${id} ${name(id)}`, f3(MINMAX_DEMO.all[id]), id in MINMAX_DEMO.without ? f3(MINMAX_DEMO.without[id]) : 'removed', f3(TOTALS[id])])} />
        <Table testId="catalogue-decision" caption="Decision record." header={['Part', 'Content']} rows={[['Decision', DECISION.decision], ['Recommendation', `${name(DECISION.recommended)}. ${DECISION.why}`], ['Conditions', DECISION.conditions.join('; ')], ['Residual risk', DECISION.residualRisk.join('; ')], ['Would change if', DECISION.wouldChangeIf.join('; ')]]} />
      </div>
    </section>
  )
}

function TryItYourself() {
  const a = 'ALT-005'
  const cost = SENSITIVITY.find((x) => x.criterion === 'CRIT-002')!.down
  return (
    <section id="ex-try" className="wk-section" aria-labelledby="ex-try-h" data-testid="example-try">
      <h2 id="ex-try-h" className="lf-h2">
        7. Try it yourself <span className="lf-chip">optional, not counted</span>
      </h2>
      <div className="lf-card" data-testid="try-paper">
        <p className="m-0">
          Compute the total value of <strong>{name(a)}</strong> by hand from its scores ({CRITERIA.map((c, i) => `${c.name.toLowerCase()} ${f1(SCORES[a][i])} ${c.unit}`).join('; ')}), the walk-away and stretch points and the weights on the criteria slide. Then say which reversal point in the sensitivity table matters most for the board.
        </p>
        <details className="wk-reveal mt-3" data-testid="try-paper-solution">
          <summary>Show the solution</summary>
          <ol className="lec-steps mt-2">
            {CRITERIA.map((c, i) => (
              <li key={c.id}>
                <span className="lec-step-label">{c.name}.</span> value ({f1(SCORES[a][i])} − {c.walkAway}) ÷ ({c.stretch} − {c.walkAway}) = {f3(VALUES[a][i])} (clamped to 0–1); weighted {WEIGHTS[i].toFixed(2)} × {f3(VALUES[a][i])} = {f3(WEIGHTS[i] * VALUES[a][i])}
              </li>
            ))}
            <li>
              <span className="lec-step-label">Total.</span> {f3(TOTALS[a])}, second to the balanced alternative’s {f3(TOTALS[DECISION.recommended])}. The capital weight’s reversal point matters most{cost && cost.to === a ? ` (below ${f3(cost.w)} this alternative ranks first)` : ''}: capital is the judgment the board is most likely to revisit.
            </li>
          </ol>
        </details>
      </div>
    </section>
  )
}

export default function Examples() {
  const lectures = { 1: getLecture(3, 1), 2: getLecture(3, 2) } as const
  return (
    <div className="wk-page" data-testid="week3-examples">
      <p className="lf-kicker">Week 3 · Worked examples</p>
      <h1 className="lf-h1">Worked examples: the AeroLink case</h1>
      <div className="lf-prose lf-column" style={{ marginTop: 10 }}>
        <p className="lf-lede">The instructor works the Week 3 method once, end to end, on AeroLink across both lectures. This page sets those worked examples out step by step, with their tables and figures, so that you can study them before your team applies the same method to its own enterprise in the laboratory.</p>
      </div>
      <p className="wk-note is-caution lf-wide" role="note">
        <strong>FICTIONAL case.</strong> AeroLink Urban Mobility is fictional; every number and statement is a teaching value. Values marked proposed are instructor additions awaiting faculty confirmation. Your record is always about your own enterprise, never AeroLink.
      </p>
      <nav aria-label="On this page" className="mt-4">
        <ol className="lf-list">
          {[...EXAMPLE_PARTS.map((p) => ({ id: p.id, title: p.title })), { id: 'catalogue', title: '6. Reference catalogue' }, { id: 'try', title: '7. Try it yourself (optional)' }].map((p) => (
            <li key={p.id}>
              <a href="#/week/3/examples" onClick={(e) => (e.preventDefault(), document.getElementById(`ex-${p.id}`)?.scrollIntoView({ block: 'start' }))}>
                {p.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {(!lectures[1] || !lectures[2]) && <p role="alert">The Week 3 lectures are not available, so the worked examples cannot be shown.</p>}
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
        <Link to={WEEK3_PATHS.lab} className="lf-btn primary">
          Next: the laboratory <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to={lessonPath(3)} className="lf-btn">
          Back to the lesson
        </Link>
      </div>
    </div>
  )
}
