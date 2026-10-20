// Web slide viewer (#/week/:n/lecture/:session[/:slide]): 16:9 stage, outline sidebar with section titles, keyboard
// navigation (←/→, PageUp/PageDown, Home/End), slide counter, faculty-notes toggle (instructor content), present mode
// (fullscreen) and links to the handout, the reader and the generated .pptx.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { allSlides, lectureMinutes, lectureStem } from '../content/lectures/text'
import type { Lecture } from '../content/lectures/types'
import { Link } from '../lib/router'
import { FixtureBanner, LectureWeekNav, NotesPanel, TopBar } from './Chrome'
import { backOf } from './route'
import { lecturesOfWeek } from '../content/lectures'
import { IS_STUDENT_EDITION } from '../lib/edition'
import { handoutPath, lessonPath, pptxHref, viewerPath } from './route'
import { SlideFace } from './SlideFace'

const isTyping = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))

export default function LectureViewer({ lecture, initialSlide }: { lecture: Lecture; initialSlide?: number }) {
  const slides = useMemo(() => allSlides(lecture), [lecture])
  const total = slides.length
  const clamp = useCallback((i: number) => Math.max(0, Math.min(total - 1, i)), [total])
  const [index, setIndex] = useState(() => clamp((initialSlide ?? 1) - 1))
  const [notes, setNotes] = useState(false)
  const [present, setPresent] = useState(false)
  const presentRef = useRef<HTMLDivElement>(null)

  // a link to another slide of this lecture (e.g. from the reader) arrives as a new initialSlide: adjust during render
  const [seenInitial, setSeenInitial] = useState(initialSlide)
  if (initialSlide !== seenInitial) {
    setSeenInitial(initialSlide)
    if (initialSlide) setIndex(clamp(initialSlide - 1))
  }

  // keep the address bar on the current slide without a history entry per slide
  useEffect(() => {
    try {
      window.history.replaceState(null, '', `#${viewerPath(lecture.week, lecture.session, index + 1)}`)
    } catch {
      /* sandboxed frames may refuse; the slide still changes */
    }
  }, [index, lecture.week, lecture.session])

  const slide = slides[index]
  useEffect(() => {
    document.title = `Week ${lecture.week} lecture ${lecture.session}, slide ${index + 1}: ${slide.title} · SysML Learning Studio`
  }, [lecture, index, slide.title])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return
      const go: Record<string, number | undefined> = { ArrowRight: index + 1, PageDown: index + 1, ArrowLeft: index - 1, PageUp: index - 1, Home: 0, End: total - 1 }
      const to = go[e.key]
      if (to !== undefined) {
        e.preventDefault()
        setIndex(clamp(to))
      } else if (e.key === 'Escape' && present && !document.fullscreenElement) setPresent(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, total, clamp, present])

  // present mode: try the Fullscreen API on the overlay; leaving fullscreen (Esc) leaves present mode
  useEffect(() => {
    if (!present) return
    const el = presentRef.current
    el?.focus()
    el?.requestFullscreen?.().catch(() => undefined)
    const onChange = () => {
      if (!document.fullscreenElement) setPresent(false)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => undefined)
    }
  }, [present])

  const stem = lectureStem(lecture)
  const otherSessions = lecturesOfWeek(lecture.week).filter((l) => l.session !== lecture.session)
  let n = 0
  return (
    <div className="lec-root" data-testid="lecture-viewer">
      <TopBar {...backOf(lecture.week)} kicker={`Week ${lecture.week} · Lecture, session ${lecture.session} · ${total} slides · ${lectureMinutes(lecture)} min`} title={lecture.title} nav={<LectureWeekNav week={lecture.week} path={viewerPath(lecture.week, lecture.session)} />}>
        {otherSessions.map((l) => (
          <Link key={l.session} to={viewerPath(l.week, l.session)} className="lec-btn">
            Session {l.session} slides
          </Link>
        ))}
        <Link to={lessonPath(lecture.week)} className="lec-btn">
          Read the lesson
        </Link>
        <Link to={handoutPath(lecture.week, lecture.session)} className="lec-btn">
          Handout
        </Link>
        <a href={pptxHref(stem)} download className="lec-btn">
          Download .pptx
        </a>
      </TopBar>
      <FixtureBanner lecture={lecture} />
      <div className="lec-viewer">
        <main className="lec-main" id="main">
          <div className="lec-controls" role="toolbar" aria-label="Slide controls">
            <button type="button" className="lec-btn" onClick={() => setIndex(clamp(index - 1))} disabled={index === 0} aria-label="Previous slide">
              ← Previous
            </button>
            <p className="lec-counter" data-testid="slide-counter" aria-live="polite">
              Slide {index + 1} of {total}
            </p>
            <button type="button" className="lec-btn" onClick={() => setIndex(clamp(index + 1))} disabled={index === total - 1} aria-label="Next slide">
              Next →
            </button>
            <span className="lec-controls-gap" />
            {!IS_STUDENT_EDITION && (
              <button type="button" className={`lec-btn${notes ? ' is-on' : ''}`} aria-pressed={notes} onClick={() => setNotes((v) => !v)}>
                Notes
              </button>
            )}
            <button type="button" className="lec-btn" onClick={() => setPresent(true)}>
              Present
            </button>
          </div>
          <div className="lec-stage">
            <SlideFace lecture={lecture} slide={slide} index={index} total={total} />
          </div>
          <p className="lec-hint">Keys: ← → to move, Home and End for the first and last slide.</p>
          {notes && !IS_STUDENT_EDITION && <NotesPanel slide={slide} index={index} />}
        </main>
        {/* after the slide in the DOM, so a narrow screen shows the slide first and the list after (sign-off m3);
            on a wide screen the grid places it in the left column */}
        <nav className="lec-outline" aria-label="Lecture outline">
          {lecture.sections.map((sec) => (
            <div key={sec.id} className="lec-outline-sec">
              <p className="lec-outline-title">{sec.title}</p>
              <ol>
                {sec.slides.map((s) => {
                  const i = n++
                  return (
                    <li key={s.id}>
                      <button type="button" onClick={() => setIndex(i)} aria-current={i === index ? 'true' : undefined} className={i === index ? 'is-on' : ''}>
                        <span className="lec-outline-no">{i + 1}</span>
                        <span>{s.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </nav>
      </div>
      {present && (
        <div className="lec-present" ref={presentRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`Presenting ${lecture.title}`} data-testid="present-mode">
          <div className="lec-present-stage">
            <SlideFace lecture={lecture} slide={slide} index={index} total={total} />
          </div>
          <button type="button" className="lec-present-exit" onClick={() => setPresent(false)}>
            Exit (Esc)
          </button>
        </div>
      )}
    </div>
  )
}
