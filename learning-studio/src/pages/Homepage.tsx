// The course homepage (#/; spec §a, mockup docs/week1/spec/mockups/homepage.html), M4 part A: replaces the dashboard as
// the student landing (the dashboard stays at #/dashboard for instructor status). One centred reading column; the 14-week
// figure is the only full-width band. Blocks in spec order 1–10. Labels never break a word (the mockup's defect): week
// titles wrap only between words, cards wrap to fewer per row on narrow screens.
import { ArrowRight, BookOpen, FolderOpen } from 'lucide-react'
import { Fragment } from 'react'
import { WEEKS } from '../content/course'
import { institutionLine } from '../content/courseSettings'
// --- publishing --- (M3: the homepage text and department setting come from the latest publication when the course
// server is reachable; offline and in the static student build, from content/homepage.ts and courseSettings.ts)
import { ContentUpdateBanner, useCourseContent } from '../publishing/usePublishedContent'
import { EditContentLink } from '../authoring/EditLink'
import { COURSE_INTRO_ID } from '../publishing/types'
// --- end publishing ---
import { Link } from '../lib/router'
import { StudentChrome } from '../week1/chrome/StudentChrome'
import { loadProgress } from '../week1/learn/progress'
import { sectionById } from '../week1/learn/textbook'
import { studentCitation, sourcesHref } from '../week1/learn/studentText'

function Framing() {
  return <span className="hp-label">course framing</span>
}

export default function Homepage() {
  const { intro: H, settings } = useCourseContent() // publishing (M3)
  const last = loadProgress().last
  const lastSec = last ? sectionById(last) : undefined
  const notes = [
    { n: 1, text: studentCitation(H.what[1].quote!.cite), href: sourcesHref(H.what[1].quote!.cite) },
    { n: 2, text: `${studentCitation(H.what[2].cite!)} (paraphrased)`, href: sourcesHref(H.what[2].cite!) },
  ]
  const phase = (part: 'ST' | 'MBSE') => WEEKS.filter((w) => w.part === part)
  return (
    <StudentChrome current="home" title="Home" crumbs={[{ label: 'Home' }]}>
      <div className="hp" data-testid="homepage">
        <ContentUpdateBanner scope="course" /> {/* publishing (M3) */}
        <p className="hp-inst" data-testid="hp-institution">
          {institutionLine(settings) /* publishing (M3): published department setting */}
        </p>
        <EditContentLink itemId={COURSE_INTRO_ID} label="Edit the course introduction" /> {/* publishing (M3) */}
        <h1 className="hp-title">{H.title}</h1>
        <p className="hp-lede">{H.lede}</p>

        <section aria-labelledby="hp-what">
          <h2 id="hp-what">What the course teaches</h2>
          <p>
            {H.what[0].text} <Framing />
          </p>
          <p>{H.what[1].text}</p>
          <blockquote className="hp-quote">
            “{H.what[1].quote!.text}”
            <sup>
              <a href="#hp-note-1" onClick={(e) => (e.preventDefault(), document.getElementById('hp-note-1')?.scrollIntoView())} aria-label="Note 1">
                1
              </a>
            </sup>
          </blockquote>
          <p>
            {H.what[2].text}
            <sup>
              <a href="#hp-note-2" onClick={(e) => (e.preventDefault(), document.getElementById('hp-note-2')?.scrollIntoView())} aria-label="Note 2">
                2
              </a>
            </sup>
          </p>
        </section>

        <section aria-labelledby="hp-phases">
          <h2 id="hp-phases">Two phases, one enterprise</h2>
          <figure className="hp-weeks" data-testid="hp-weeks">
            {(['ST', 'MBSE'] as const).map((part) => (
              <div key={part} className="hp-phase">
                <p className="hp-phase-label">{part === 'ST' ? 'Phase I · Systems thinking · Weeks 1–7' : 'Phase II · MBSE with SysML v2 · Weeks 8–14'}</p>
                <ol className="hp-week-row">
                  {phase(part).map((w) => (
                    <li key={w.number} className={`hp-week${w.number === 1 ? ' is-current' : ''}${w.number === 7 || w.number === 14 ? ' is-output' : ''}`}>
                      <span className="hp-week-no">Week {w.number}</span>
                      <span className="hp-week-title">
                        {w.title.split(' / ').map((t, i) => (
                          <Fragment key={i}>
                            {i > 0 && <br />}
                            {t}
                          </Fragment>
                        ))}
                      </span>
                      {w.number === 1 && <span className="hp-week-tag">You start here</span>}
                      {w.number === 7 && <span className="hp-week-tag">Team output: engineering package</span>}
                      {w.number === 14 && <span className="hp-week-tag">Team output: SysML v2 model</span>}
                    </li>
                  ))}
                </ol>
                {part === 'ST' && <p className="hp-same">The same enterprise, the same IDs</p>}
              </div>
            ))}
            <figcaption>Figure 1. The 14 weeks in two phases. Week 7 and Week 14 are the two team outputs; Week 1 is highlighted.</figcaption>
            <details className="hp-textequiv">
              <summary>Show text description</summary>
              <ol>
                {WEEKS.map((w) => (
                  <li key={w.number}>
                    Week {w.number}: {w.title} ({w.part === 'ST' ? 'Phase I' : 'Phase II'})
                  </li>
                ))}
              </ol>
            </details>
          </figure>
          {H.phases.map((p, i) => (
            <p key={i}>
              {p.text} <Framing />
            </p>
          ))}
        </section>

        <section aria-labelledby="hp-aerolink">
          <h2 id="hp-aerolink">AeroLink, the instructor’s example</h2>
          <div className="hp-band is-example" data-testid="hp-aerolink">
            <BookOpen size={18} aria-hidden />
            <p>
              <strong>Instructor example · fictional.</strong> {H.aerolink.join(' ')}{' '}
              <Link to="/week/1/learn/ch01#ch01-03">Meet AeroLink in Learn, chapter 1</Link>
            </p>
          </div>
        </section>

        <section aria-labelledby="hp-enterprise">
          <h2 id="hp-enterprise">Your team’s own enterprise</h2>
          <div className="hp-band is-project">
            <FolderOpen size={18} aria-hidden />
            <p>
              <strong>Your enterprise.</strong> {H.enterprise.join(' ')}
            </p>
          </div>
        </section>

        <section aria-labelledby="hp-submit">
          <h2 id="hp-submit">What you submit</h2>
          <ul className="hp-list">
            {H.submit.map((s) => (
              <li key={s.what}>
                <strong>{s.what}</strong>: {s.detail}
              </li>
            ))}
          </ul>
          <p>{H.submitNote}</p>
        </section>

        <section aria-labelledby="hp-howto">
          <h2 id="hp-howto">How the site is organized</h2>
          <dl className="hp-stages">
            {H.stages.map((s) => (
              <div key={s.id} className={`is-${s.identity}`}>
                <dt>
                  <span className="hp-dot" aria-hidden /> {s.label}
                </dt>
                <dd>{s.line}</dd>
              </div>
            ))}
          </dl>
          <p className="hp-muted">{H.savedStatic}</p>
        </section>

        <section className="hp-start" aria-labelledby="hp-start">
          <div>
            <h2 id="hp-start">{lastSec ? 'Continue Week 1' : 'Week 1: Team formation, needs and stakeholders'}</h2>
            <p>{lastSec ? `You were reading ${lastSec.section.title}.` : 'Start with the Overview, then Learn chapter 1.'}</p>
          </div>
          <Link to={lastSec ? `/week/1/learn/${lastSec.chapter.id}#${lastSec.section.id}` : '/week/1'} className="hp-btn" data-testid="hp-start">
            {lastSec ? 'Continue Week 1: Learn' : H.start} <ArrowRight size={16} aria-hidden />
          </Link>
        </section>
        <p className="hp-secondary">
          <Link to="/roadmap">Course schedule</Link> · <Link to="/sources">Sources and readings</Link>
        </p>

        <ol className="hp-notes" aria-label="Notes">
          {notes.map((n) => (
            <li key={n.n} id={`hp-note-${n.n}`}>
              <Link to={n.href}>{n.text}</Link>
            </li>
          ))}
        </ol>
      </div>
    </StudentChrome>
  )
}
