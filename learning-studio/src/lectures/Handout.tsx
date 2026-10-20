// Print-friendly handout (#/week/:n/lecture/:session/handout): every slide in order, one per printed page, with the
// faculty notes optionally included (off by default: the student handout carries no instructor content).
import { useEffect, useState } from 'react'
import { allSlides } from '../content/lectures/text'
import type { Lecture } from '../content/lectures/types'
import { FixtureBanner, LectureWeekNav, NotesPanel, TopBar } from './Chrome'
import { IS_STUDENT_EDITION } from '../lib/edition'
import { viewerPath } from './route'
import { SlideFace } from './SlideFace'

export default function Handout({ lecture }: { lecture: Lecture }) {
  const [withNotes, setWithNotes] = useState(false)
  const slides = allSlides(lecture)
  useEffect(() => {
    document.title = `Week ${lecture.week} lecture ${lecture.session} handout · SysML Learning Studio`
  }, [lecture])
  return (
    <div className="lec-root is-handout" data-testid="lecture-handout">
      <TopBar back={viewerPath(lecture.week, lecture.session)} backLabel="Back to the slides" kicker={`Week ${lecture.week} · Session ${lecture.session} · Handout`} title={lecture.title} nav={<LectureWeekNav week={lecture.week} path={viewerPath(lecture.week, lecture.session)} />}>
        {!IS_STUDENT_EDITION && (
          <label className="lec-check">
            <input type="checkbox" checked={withNotes} onChange={(e) => setWithNotes(e.target.checked)} />
            Include faculty notes (instructor)
          </label>
        )}
        <button type="button" className="lec-btn" onClick={() => window.print()}>
          Print
        </button>
      </TopBar>
      <FixtureBanner lecture={lecture} />
      <main className="lec-handout" id="main">
        {slides.map((s, i) => (
          <section key={s.id} className="lec-handout-page" aria-label={`Slide ${i + 1}`}>
            <div className="lec-stage is-static">
              <SlideFace lecture={lecture} slide={s} index={i} total={slides.length} />
            </div>
            {withNotes && !IS_STUDENT_EDITION && <NotesPanel slide={s} index={i} />}
          </section>
        ))}
      </main>
    </div>
  )
}
