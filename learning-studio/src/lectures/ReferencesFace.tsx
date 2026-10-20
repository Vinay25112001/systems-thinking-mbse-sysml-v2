// The closing "References and credits" slide face: GENERATED from every citation the lecture uses
// (src/content/lectures/references.ts), so it always matches the slides, notes and lesson. The .pptx draws the same
// list (scripts/build-lectures.mjs).
import { lecturesOfWeek } from '../content/lectures'
import { formatReference, lectureCredits, lectureReferences } from '../content/lectures/references'
import type { Lecture } from '../content/lectures/types'
import { Link } from '../lib/router'
import { sourcesPath } from './cite'

export function ReferencesFace({ lecture }: { lecture: Lecture }) {
  // one page range per reading across the week's decks (sign-off m6)
  const refs = lectureReferences([lecture], lecturesOfWeek(lecture.week))
  const credits = lectureCredits([lecture])
  return (
    <div className="lec-refs" data-testid="references-face">
      <ol className="lec-refs-list">
        {refs.map((e) => (
          <li key={e.reading.id}>
            <Link to={sourcesPath({ reading: e.reading.id, pages: e.pages.split(',')[0].trim() })} className="lec-cite">
              {formatReference(e)}
            </Link>
          </li>
        ))}
      </ol>
      <div className="lec-refs-credits">
        <p className="lec-refs-label">Credits and licenses</p>
        <ul>
          {credits.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
