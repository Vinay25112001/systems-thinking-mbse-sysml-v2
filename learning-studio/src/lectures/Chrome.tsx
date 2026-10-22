// Page chrome shared by the lecture viewer, the handout and the reader: a top bar with the way back, the page title,
// the theme control and page actions; and the notes panel (instructor content).
import type { ReactNode } from 'react'
import { MyProjectLink } from '../project/nav/MyProjectLink'
import type { Lecture, Slide } from '../content/lectures/types'
import { Link } from '../lib/router'
import { useApp, type ThemePref } from '../state/AppState'
import { Inline } from './Blocks'
import { WeekNav } from '../week1/WeekNav'
import { Week2Nav } from '../week2/WeekNav'
import { Week3Nav } from '../week3/WeekNav'
import { Week4Nav } from '../week4/WeekNav'
import { Week5Nav } from '../week5/WeekNav'
// --- week06 ---
import { Week6Nav } from '../week6/WeekNav'
// --- end week06 ---
// --- week07 ---
import { Week7Nav } from '../week7/WeekNav'
// --- end week07 ---
import { Week8Nav } from '../week8/WeekNav'
// --- week09 ---
import { Week9Nav } from '../week9/WeekNav'
// --- end week09 ---
// --- week10 ---
import { Week10Nav } from '../week10/WeekNav'
// --- end week10 ---
// --- week11 ---
import { Week11Nav } from '../week11/WeekNav'
// --- end week11 ---

export function ThemeSelect() {
  const { theme, setTheme } = useApp()
  return (
    <label className="lec-theme">
      <span>Theme</span>
      <select aria-label="Color theme" value={theme} onChange={(e) => setTheme(e.target.value as ThemePref)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  )
}

/** The week sub-navigation under the top bar, on weeks that have the lecture-first week page (Weeks 1 and 2). */
export function LectureWeekNav({ week, path }: { week: number; path: string }) {
  if (week === 1) return <WeekNav path={path} />
  if (week === 2) return <Week2Nav path={path} />
  if (week === 3) return <Week3Nav path={path} />
  if (week === 4) return <Week4Nav path={path} />
  if (week === 5) return <Week5Nav path={path} />
  if (week === 6) return <Week6Nav path={path} />
  if (week === 7) return <Week7Nav path={path} /> // week07
  if (week === 8) return <Week8Nav path={path} />
  if (week === 9) return <Week9Nav path={path} /> // week09
  if (week === 10) return <Week10Nav path={path} /> // week10
  if (week === 11) return <Week11Nav path={path} /> // week11
  return null
}

export function TopBar({ back, backLabel, kicker, title, children, nav }: { back: string; backLabel: string; kicker: string; title: string; children?: ReactNode; nav?: ReactNode }) {
  return (
    <>
    <header className="lec-topbar">
      <Link to={back} className="lec-back">
        ← {backLabel}
      </Link>
      <div className="lec-topbar-title">
        <p className="lec-topbar-kicker">{kicker}</p>
        <h1>{title}</h1>
      </div>
      <div className="lec-topbar-actions">
        {children}
        <MyProjectLink />
        <ThemeSelect />
      </div>
    </header>
    {nav}
    </>
  )
}

export function FixtureBanner({ lecture }: { lecture: Pick<Lecture, 'fixture'> }) {
  if (!lecture.fixture) return null
  return (
    <p className="lec-fixture-banner" role="note" data-testid="fixture-banner">
      <strong>Fixture — not course content.</strong> This demonstration lecture proves the slide, notes, reader and PowerPoint pipeline; the
      Week 1 lecture replaces it.
    </p>
  )
}

/** Faculty notes for one slide: a full instructor build, marked as instructor content. */
export function NotesPanel({ slide, index }: { slide: Slide; index: number }) {
  const n = slide.notes
  return (
    <aside className="lec-notes" aria-label="Faculty notes (instructor content)" data-testid="faculty-notes">
      <div className="lec-notes-head">
        <span className="lec-instructor-chip">Instructor content</span>
        <h2>
          Faculty notes · slide {index + 1}: {slide.title}
        </h2>
        <p className="lec-notes-meta">
          {slide.minutes} min · {slide.layout} · <strong>Purpose:</strong> {slide.purpose}
        </p>
      </div>
      <div className="lec-notes-grid">
        <section>
          <h3>Teach</h3>
          <ol>
            {n.teach.map((t, i) => (
              <li key={i}>
                <Inline text={t} />
              </li>
            ))}
          </ol>
          <h3>Why this slide</h3>
          <p>
            <Inline text={n.why} />
          </p>
          {n.figure && (
            <>
              <h3>Explaining the figure</h3>
              <p>
                <Inline text={n.figure} />
              </p>
            </>
          )}
          {n.workedSolution && n.workedSolution.length > 0 && (
            <>
              <h3>Worked solution</h3>
              <ol>
                {n.workedSolution.map((t, i) => (
                  <li key={i}>
                    <Inline text={t} />
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
        <section>
          {n.examples && n.examples.length > 0 && (
            <>
              <h3>Examples</h3>
              <ul>
                {n.examples.map((t, i) => (
                  <li key={i}>
                    <Inline text={t} />
                  </li>
                ))}
              </ul>
            </>
          )}
          {n.misconceptions && n.misconceptions.length > 0 && (
            <>
              <h3>Misconceptions</h3>
              <ul>
                {n.misconceptions.map((m, i) => (
                  <li key={i}>
                    <em>“{m.claim}”</em> — {m.correction}
                  </li>
                ))}
              </ul>
            </>
          )}
          <h3>Transition</h3>
          <p>
            <Inline text={n.transition} />
          </p>
          <h3>Timing</h3>
          <p>{n.timing}</p>
        </section>
      </div>
    </aside>
  )
}
