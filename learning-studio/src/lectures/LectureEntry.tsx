// "Lecture" entry point for a week (dashboard and classic week page): links to the slide viewer, the reader and the
// generated .pptx. Kept outside the Week 1 flow (src/flow/*), which it does not change.
import { lecturesOfWeek } from '../content/lectures'
import { lectureStem } from '../content/lectures/text'
import { deckShipped } from './decks'
import { Link } from '../lib/router'
import { lessonPath, pptxHref, viewerPath } from './route'

export function LectureEntry({ week }: { week: number }) {
  const lectures = lecturesOfWeek(week)
  if (lectures.length === 0) return null
  const fixture = lectures.some((l) => l.fixture)
  const btn = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900" data-testid={`lecture-entry-${week}`} aria-labelledby={`lecture-entry-h-${week}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 id={`lecture-entry-h-${week}`} className="font-semibold">
            Week {week} lecture
          </h2>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {fixture
              ? 'Pipeline demonstration (fixture, not course content): slides with faculty notes, the student lesson and the PowerPoint deck, all from one source.'
              : 'Slides with faculty notes, the long-form student lesson and the PowerPoint deck, all from one source.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {lectures.map((l) => (
            <Link key={l.session} to={viewerPath(week, l.session)} className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
              Lecture slides{lectures.length > 1 ? `, session ${l.session}` : ''}
            </Link>
          ))}
          <Link to={lessonPath(week)} className={btn}>
            Read the lesson
          </Link>
          {lectures.filter((l) => deckShipped(lectureStem(l))).map((l) => (
            <a key={l.session} href={pptxHref(lectureStem(l))} download className={btn}>
              Download .pptx{lectures.length > 1 ? ` (session ${l.session})` : ''}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
