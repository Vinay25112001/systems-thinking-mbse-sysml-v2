// Course welcome: where this subject starts (WEEK1_LEARNING_DESIGN §3). Shown from the dashboard's "Start here" card
// and from Week 1's Overview; visiting it marks it seen for this viewer.
import { ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { PARTS } from '../content/course'
import { WEEK1_BLOCKS } from '../content/week1'
import { TIMELINE_FIGURE, WEEK_STAGES, WELCOME, WELCOME_LEDE } from '../content/learn/welcome'
import { CourseTimeline } from '../components/figures/EngineeringFigures'
import { FigureFrame } from '../components/figures/Frame'
import { Cite } from '../flow/Cite'
import { TopBar } from '../flow/Chrome'
import { WELCOME_KEY } from '../flow/storage'
import { saveJSON } from '../lib/storage'
import { Link } from '../lib/router'
import { DATA_SHEET } from '../model/airtaxi'
import { WEEKS } from '../content/course'

const SE_QUOTE = WEEK1_BLOCKS.find((b) => b.id === 'w1-se')!.quote!
const SHEET = DATA_SHEET.filter((d) => ['fleet', 'vertiports', 'chargersPerVertiport', 'seats', 'opHours'].includes(d.key))

const TIMELINE_SPEC = {
  ...TIMELINE_FIGURE,
  textEquivalent: WEEKS.map((w) => `Week ${w.number}: ${w.title}${w.due ? ` (${w.due.split(' ')[0]})` : ''}${/Exam/.test(w.assessment) ? ` (${w.assessment.split(' (')[0]})` : ''}`).join('; ') + '.',
}

export default function Welcome() {
  useEffect(() => {
    saveJSON(WELCOME_KEY, true)
    document.title = 'Course welcome · SysML Learning Studio'
  }, [])
  const block = (id: string) => WELCOME.find((b) => b.id === id)!
  const para = (p: (typeof WELCOME)[number]['paras'][number], i: number) => (
    <p key={i}>
      {p.text}
      {p.label && <span className="lf-framing">{p.label}</span>}
      {p.cite && (
        <>
          {' '}
          <Cite c={p.cite} />
        </>
      )}
    </p>
  )
  return (
    <div className="lf-root" data-testid="welcome">
      <a href="#lf-main" className="lf-skip">
        Skip to content
      </a>
      <TopBar title="Course welcome" />
      <main id="lf-main" tabIndex={-1} className="lf-main">
        <div className="lf-page">
          <p className="lf-kicker">Start here · Course welcome</p>
          <h1 className="lf-h1">Systems Thinking and MBSE with SysML v2</h1>
          <p className="lf-lede">{WELCOME_LEDE.text}</p>

          <div className="lf-grid2" style={{ alignItems: 'start' }}>
            <section aria-labelledby="w-what" className="lf-prose">
              <h2 id="w-what" className="lf-h2" style={{ marginTop: 8 }}>
                1. {block('what').title}
              </h2>
              {para(block('what').paras[0], 0)}
              {para(block('what').paras[1], 1)}
              <blockquote className="lf-quote">
                “{SE_QUOTE.text}” <Cite c={SE_QUOTE.cite} />
              </blockquote>
              {para(block('what').paras[2], 2)}
              <h3 className="lf-h3">{block('start').title}</h3>
              {block('start').paras.map(para)}
            </section>
            <div>
              <section aria-labelledby="w-why" className="lf-prose">
                <h2 id="w-why" className="lf-h2" style={{ marginTop: 8 }}>
                  2. {block('why').title}
                </h2>
                {block('why').paras.map(para)}
              </section>
              <section aria-labelledby="w-case" className="lf-prose">
                <h2 id="w-case" className="lf-h2">
                  3. {block('case').title}
                </h2>
                {block('case').paras.map(para)}
              </section>
              <div className="lf-card" aria-label="AeroLink Data Sheet extract (FICTIONAL)">
                <p className="lf-label">AeroLink Data Sheet · extract · FICTIONAL</p>
                <dl className="lf-terms" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                  {SHEET.map((d) => (
                    <div key={d.key} className="contents">
                      <dt style={{ fontWeight: 400 }}>{d.label}</dt>
                      <dd className="wb-mono" style={{ margin: 0 }}>
                        {d.value} {d.unit}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="m-0 mt-2 text-[14.5px]">
                  <Link to="/workspace/aerolink">Case brief and full Data Sheet</Link>
                </p>
              </div>
            </div>
          </div>

          <section aria-labelledby="w-map">
            <h2 id="w-map" className="lf-h2">
              4. {block('map').title}
            </h2>
            <div className="lf-prose">{block('map').paras.map(para)}</div>
            <FigureFrame spec={TIMELINE_SPEC} wide={false} full>
              <CourseTimeline current={1} />
            </FigureFrame>
            <p className="lf-muted text-[14px]">
              {PARTS.ST.summary} {PARTS.MBSE.summary}
            </p>
          </section>

          <section aria-labelledby="w-week">
            <h2 id="w-week" className="lf-h2">
              5. {block('week').title}
            </h2>
            <div className="lf-prose">{block('week').paras.map(para)}</div>
            <ol className="lf-strip">
              {WEEK_STAGES.map((s) => (
                <li key={s.id}>
                  <strong>{s.label}</strong>
                  {s.line}
                </li>
              ))}
            </ol>
          </section>

          <div className="lf-actions" style={{ marginTop: 34 }}>
            <Link to="/week/1" className="lf-btn primary" data-testid="welcome-start">
              Start Week 1 <ArrowRight size={16} aria-hidden />
            </Link>
            <Link to="/" className="lf-btn">
              Go to the dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
