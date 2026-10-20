// Week 4 landing page (#/week/4): the week as a professor runs it, on the Week 1 template (src/week1/Home.tsx): title
// and subject, what the week is for, the entry cards in path order, the objectives, how the week runs, the readings, the
// deliverables with their due points and the workload. Text from src/content/week4Path.ts (single source).
import { ArrowRight, Download } from 'lucide-react'
import type { ReactNode } from 'react'
import { lecturesOfWeek } from '../content/lectures'
import { allSlides, lectureMinutes, lectureStem } from '../content/lectures/text'
import { formatCitation } from '../content/readings'
import { DELIVERABLES, ENTRY_TEXT, EXTENSION_READINGS, PROPOSED_OBJECTIVES, READINGS_NOTE, READING_RATE_PAGES_PER_HOUR, REQUIRED_PAGES, REQUIRED_READINGS, TIMELINE, W4, WEEK4_BUDGET_HOURS, WEEK4_LEDE, WEEK4_TOPICS, WEEK4_WHY, WORKLOAD_ROWS, WORKLOAD_SUMMARY, WORKLOAD_TOTAL } from '../content/week4Path'
import { bloomLabel } from '../flow/route'
import { Link } from '../lib/router'
import { handoutPath, lessonPath, pptxHref, viewerPath } from '../lectures/route'
import { WEEK4_PATHS } from './route'

function Entry({ no, title, meta, text, children, testId }: { no: number; title: string; meta: string; text: string; children: ReactNode; testId: string }) {
  return (
    <li>
      <article className="wk-entry" data-testid={testId} aria-labelledby={`${testId}-h`}>
        <div className="wk-entry-head">
          <span className="wk-entry-no" aria-hidden>
            {no}
          </span>
          <div>
            <h3 id={`${testId}-h`}>{title}</h3>
            <p className="wk-entry-meta">{meta}</p>
          </div>
        </div>
        <p>{text}</p>
        <div className="wk-entry-actions">{children}</div>
      </article>
    </li>
  )
}

export default function Home() {
  const lectures = lecturesOfWeek(4)
  const slides = lectures.reduce((a, l) => a + allSlides(l).length, 0)
  const lessonRow = WORKLOAD_ROWS.find((r) => r.id === 'lesson')!
  return (
    <div className="wk-page" data-testid="week4-home">
      <p className="lf-kicker">Week 4 · Overview</p>
      <h1 className="lf-h1">Week 4 — {W4.title}</h1>
      <p className="wk-subject" data-testid="week4-subject">
        Subject: {WEEK4_TOPICS.join('; ')}.
      </p>
      <div className="lf-prose lf-column" style={{ marginTop: 14 }}>
        <p className="lf-lede">{WEEK4_LEDE.text}</p>
        <p>{WEEK4_WHY.text}</p>
      </div>

      <section className="wk-section" aria-labelledby="w4-entries-h" data-testid="week4-entries">
        <h2 id="w4-entries-h" className="lf-h2">
          Work through the week in this order
        </h2>
        <ol className="wk-entries">
          <Entry no={1} testId="entry-lecture" title="Lecture slides" meta={`${lectures.length} sessions · ${slides} slides · ${[...new Set(lectures.map((l) => lectureMinutes(l)))].join(' or ')} min of content per 75-min session, lab launch included`} text={ENTRY_TEXT.lecture.text}>
            {lectures.map((l) => (
              <Link key={l.session} to={viewerPath(4, l.session)} className="lf-btn primary small">
                Session {l.session} slides
              </Link>
            ))}
            {lectures.map((l) => (
              <a key={`d${l.session}`} href={pptxHref(lectureStem(l))} download className="lf-btn small" aria-label={`Download the Session ${l.session} deck (.pptx)`}>
                <Download size={13} aria-hidden /> Session {l.session} .pptx
              </a>
            ))}
            {lectures.map((l) => (
              <Link key={`h${l.session}`} to={handoutPath(4, l.session)} className="lf-btn small">
                Session {l.session} handout
              </Link>
            ))}
          </Entry>
          <Entry no={2} testId="entry-lesson" title="Detailed lesson" meta={`Reader · ${lessonRow.hours.toFixed(1)} h`} text={ENTRY_TEXT.lesson.text}>
            <Link to={lessonPath(4)} className="lf-btn primary small">
              Read the lesson <ArrowRight size={14} aria-hidden />
            </Link>
          </Entry>
          <Entry no={3} testId="entry-examples" title="Worked examples" meta="The AeroLink case (FICTIONAL) · reference catalogue" text={ENTRY_TEXT.examples.text}>
            <Link to={WEEK4_PATHS.examples} className="lf-btn primary small">
              Open the worked examples <ArrowRight size={14} aria-hidden />
            </Link>
          </Entry>
          <Entry no={4} testId="entry-lab" title="Engineering laboratory" meta="Lab L4 · team · due before Week 5, Session 1" text={ENTRY_TEXT.lab.text}>
            <Link to={WEEK4_PATHS.lab} className="lf-btn primary small">
              Lab instructions <ArrowRight size={14} aria-hidden />
            </Link>
            <Link to={WEEK4_PATHS['lab-tool']} className="lf-btn small">
              Open the lab tool
            </Link>
          </Entry>
          <Entry no={5} testId="entry-assessment" title="Assessment and submission" meta="Quiz Q4 · individual, formative · Week 4 record readiness" text={ENTRY_TEXT.assessment.text}>
            <Link to={WEEK4_PATHS.assessment} className="lf-btn primary small">
              Go to the assessment <ArrowRight size={14} aria-hidden />
            </Link>
          </Entry>
        </ol>
      </section>

      <section className="wk-section" aria-labelledby="w4-obj-h" data-testid="week4-objectives">
        <h2 id="w4-obj-h" className="lf-h2">
          Learning objectives
        </h2>
        <p className="lf-muted text-[15px]">By the end of the week you will be able to:</p>
        <ul className="lf-plain">
          {W4.objectives.map((o) => (
            <li key={o.id} className="lf-objective">
              <span className="lf-chip accent">{bloomLabel(o.bloom)}</span>
              <span>
                {o.text} <span className="id">{o.id}</span>
              </span>
            </li>
          ))}
          {PROPOSED_OBJECTIVES.map((o) => (
            <li key={o.id} className="lf-objective">
              <span className="lf-chip">{o.bloom}</span>
              <span>
                {o.text} <span className="id">{o.id}, proposed, pending faculty approval</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="wk-section" aria-labelledby="w4-runs-h" data-testid="week4-timeline">
        <h2 id="w4-runs-h" className="lf-h2">
          How this week runs
        </h2>
        <ol className="wk-timeline">
          {TIMELINE.map((t) => (
            <li key={t.id} data-testid={`timeline-${t.id}`}>
              <p className="wk-tl-when">{t.when}</p>
              <p className="wk-tl-what">{t.what}</p>
              <p>{t.detail.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="lf-grid2" style={{ marginTop: 8 }}>
        <section className="wk-section" aria-labelledby="w4-read-h" data-testid="week4-readings">
          <h2 id="w4-read-h" className="lf-h2">
            Required readings
          </h2>
          <ul className="lf-list">
            {REQUIRED_READINGS.map((r, i) => (
              <li key={`${r.citation.reading}-${i}`}>
                <Link to={`/sources/${r.citation.reading}/${r.citation.pages ?? ''}`}>{formatCitation(r.citation)}</Link> <span className="lf-muted">· {r.pages} pp</span>
              </li>
            ))}
          </ul>
          <p className="lf-muted text-[14.5px]">
            {REQUIRED_PAGES} pages at about {READING_RATE_PAGES_PER_HOUR} pages an hour. {READINGS_NOTE.text}
          </p>
          <h3 className="lf-h3">Extension (optional; the basis of the graduate task)</h3>
          <ul className="lf-list">
            {EXTENSION_READINGS.map((c, i) => (
              <li key={`${c.reading}-${i}`}>
                <Link to={`/sources/${c.reading}/${c.pages ?? ''}`}>{formatCitation(c)}</Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="wk-section" aria-labelledby="w4-deliv-h" data-testid="week4-deliverables">
          <h2 id="w4-deliv-h" className="lf-h2">
            Deliverables and due points
          </h2>
          <div className="lf-card" style={{ padding: 0 }}>
            <table className="lf-table lf-cards">
              <caption className="sr-only">Week 4 deliverables: what, who, when and where</caption>
              <thead>
                <tr>
                  <th scope="col">Deliverable</th>
                  <th scope="col">Who</th>
                  <th scope="col">Due</th>
                  <th scope="col">Where</th>
                </tr>
              </thead>
              <tbody>
                {DELIVERABLES.map((d) => (
                  <tr key={d.id}>
                    <th scope="row" className="text-left font-semibold">
                      {d.what}
                    </th>
                    <td data-label="Who">{d.who}</td>
                    <td data-label="Due">{d.due}</td>
                    <td data-label="Where">{d.where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="wk-section" aria-labelledby="w4-work-h" data-testid="week4-workload">
        <h2 id="w4-work-h" className="lf-h2">
          Workload: {WORKLOAD_TOTAL.toFixed(1)} h per student ({WEEK4_BUDGET_HOURS.toFixed(1)} h budget)
        </h2>
        <div className="lf-card lf-wide" style={{ padding: 0 }}>
          <table className="lf-table" data-testid="workload-table">
            <caption className="sr-only">Week 4 workload per student, in hours, for a team of four</caption>
            <thead>
              <tr>
                <th scope="col">Activity</th>
                <th scope="col" className="wk-num">
                  Hours
                </th>
              </tr>
            </thead>
            <tbody>
              {WORKLOAD_ROWS.map((w) => (
                <tr key={w.id}>
                  <td>{w.activity}</td>
                  <td className="wk-num">{w.hours.toFixed(1)}</td>
                </tr>
              ))}
              <tr className="wk-total">
                <th scope="row" className="text-left">
                  Total
                </th>
                <td className="wk-num" data-testid="workload-total">
                  {WORKLOAD_TOTAL.toFixed(1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="lf-muted lf-wide mt-2 text-[14.5px]" data-testid="workload-summary">
          {WORKLOAD_SUMMARY.text}
        </p>
      </section>

      <div className="lf-actions" style={{ marginTop: 34 }}>
        <Link to={viewerPath(4, 1)} className="lf-btn primary">
          Start with the Session 1 slides <ArrowRight size={16} aria-hidden />
        </Link>
        <Link to="/week/3" className="lf-btn">
          Back to Week 3
        </Link>
      </div>
    </div>
  )
}
