// Single-column student reader (#/week/:n/lesson[/:section]): full-width page, readable measure, a table of contents,
// figures with captions (the same components and captions as the slides) and citations linked to /sources/:id/:pages.
import { useEffect } from 'react'
import { weekLesson } from '../content/lectures'
import { allSlides } from '../content/lectures/text'
import type { FigureRef, Lecture, LessonBlock } from '../content/lectures/types'
import { Link } from '../lib/router'
import { BlockView, CaptionedFigure, CitationList, Inline } from './Blocks'
import { FixtureBanner, LectureWeekNav, TopBar } from './Chrome'
import { learnSection } from '../content/learn/week01'
import { SectionCheckView } from '../flow/Learn'
import { FlowProvider } from '../flow/state'
import { LEARN_TO_LESSON } from '../week1/route'
import { backOf, lessonPath, viewerPath } from './route'

export function LessonBlockView({ block: b, lecture, figNo }: { block: LessonBlock; lecture: Lecture; figNo?: string }) {
  if (b.kind === 'para')
    return (
      <p>
        <Inline text={b.text} />
      </p>
    )
  if (b.kind === 'heading') return <h3>{b.text}</h3>
  if (b.kind === 'slide-ref') {
    const slides = allSlides(lecture)
    const i = slides.findIndex((s) => s.id === b.slide)
    return (
      <p className="lec-slide-ref">
        <Link to={viewerPath(lecture.week, lecture.session, i + 1)}>
          {b.text ?? 'See the slide'}: session {lecture.session}, slide {i + 1}, “{slides[i]?.title}”
        </Link>
      </p>
    )
  }
  if (b.kind === 'figure') {
    if (!('slide' in b)) return <CaptionedFigure figure={b.figure} number={figNo} />
    // a figure shared with a slide links back to that slide in the viewer (sign-off review M5: the lesson's slide links)
    const slides = allSlides(lecture)
    const i = slides.findIndex((s) => s.id === b.slide)
    const f: FigureRef | undefined = slides[i]?.figure
    if (!f) return null
    return (
      <>
        <CaptionedFigure figure={f} number={figNo} />
        <p className="lec-slide-ref" data-testid="figure-slide-link">
          <Link to={viewerPath(lecture.week, lecture.session, i + 1)}>
            On the slide: session {lecture.session}, slide {i + 1}, “{slides[i].title}”
          </Link>
        </p>
      </>
    )
  }
  return <BlockView block={b} />
}

/** Week 1: the earlier Learn-section checks, kept as optional "check your understanding" self-tests at the end of the
 *  lesson section that teaches the same idea (week1/route.ts LEARN_TO_LESSON). Ungraded and never a gate. */
const SELF_CHECK_OF: Record<string, string> = Object.fromEntries(Object.entries(LEARN_TO_LESSON).map(([learn, lesson]) => [lesson, learn]))
function SelfCheck({ lessonSection }: { lessonSection: string }) {
  const s = learnSection(SELF_CHECK_OF[lessonSection] ?? '')
  if (!s) return null
  return (
    <details className="wk-selfcheck" data-testid={`selfcheck-${lessonSection}`}>
      <summary>Check your understanding (optional, ungraded)</summary>
      <SectionCheckView s={s} />
    </details>
  )
}

export default function LessonReader({ week, section }: { week: number; section?: string }) {
  const parts = weekLesson(week)
  useEffect(() => {
    document.title = `Week ${week} lesson · SysML Learning Studio`
  }, [week])
  useEffect(() => {
    if (!section) return
    // after App's own route effect (which scrolls to the top on every path change; parent effects run after ours)
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(`lesson-${section}`)
      el?.scrollIntoView?.({ block: 'start' })
      el?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(raf)
  }, [section])

  if (parts.length === 0)
    return (
      <div className="lec-root">
        <TopBar {...backOf(week)} kicker={`Week ${week}`} title="No lesson yet" nav={<LectureWeekNav week={week} path={lessonPath(week)} />} />
        <main className="lec-reader" id="main">
          <p>Week {week} has no lecture source yet.</p>
        </main>
      </div>
    )

  // figure numbers computed up front (pure render): Figure <week>.<n> in reading order
  const figNos = new Map<string, string>()
  parts.forEach(({ section: s }) => s.blocks.forEach((b, i) => b.kind === 'figure' && figNos.set(`${s.id}:${i}`, `${week}.${figNos.size + 1}`)))
  const first = parts[0].lecture
  const page = (
    <div className="lec-root" data-testid="lesson-reader">
      <TopBar {...backOf(week)} kicker={`Week ${week} · Detailed lesson`} title={first.fixture ? `${first.title} (lesson)` : `Week ${week} lesson`} nav={<LectureWeekNav week={week} path={lessonPath(week)} />}>
        <Link to={viewerPath(week, first.session)} className="lec-btn">
          Open the slides
        </Link>
      </TopBar>
      <FixtureBanner lecture={first} />
      <div className="lec-reader-wrap">
        <nav className="lec-toc" aria-label="Table of contents">
          <p className="lec-toc-title">Contents</p>
          <ol>
            {parts.map(({ section: s }) => (
              <li key={s.id}>
                <Link to={lessonPath(week, s.id)} aria-current={s.id === section ? 'location' : undefined}>
                  {s.title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <main className="lec-reader" id="main">
          {parts.map(({ lecture, section: s }) => (
            <section key={s.id} id={`lesson-${s.id}`} tabIndex={-1} className="lec-lesson-sec" aria-labelledby={`lesson-h-${s.id}`}>
              <h2 id={`lesson-h-${s.id}`}>{s.title}</h2>
              {s.blocks.map((b, i) => (
                <LessonBlockView key={i} block={b} lecture={lecture} figNo={figNos.get(`${s.id}:${i}`)} />
              ))}
              <CitationList cites={s.sources} />
              {week === 1 && <SelfCheck lessonSection={s.id} />}
            </section>
          ))}
          {week === 1 && (
            <p className="lec-slide-ref" style={{ marginTop: 32 }}>
              <Link to="/week/1/examples" className="lec-btn" data-testid="lesson-next">
                Next: the worked examples →
              </Link>
            </p>
          )}
        </main>
      </div>
    </div>
  )
  return week === 1 ? <FlowProvider>{page}</FlowProvider> : page
}
