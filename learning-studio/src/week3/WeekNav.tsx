// The Week 3 sub-navigation (Overview · Lecture · Lesson · Worked examples · Laboratory · Assessment), shown on every
// Week 3 page: the week pages (WeekShell), the slide viewer, the handout and the reader (lectures/Chrome.tsx). Same
// markup and classes as the Week 1 navigation (src/week1/WeekNav.tsx, read-only template).
import { Link } from '../lib/router'
import { WEEK3_NAV } from './route'

export function Week3Nav({ path }: { path: string }) {
  const p = path.replace(/\/+$/, '')
  return (
    <nav className="wk-nav" aria-label="Week 3 sections" data-testid="week-nav">
      <ol>
        {WEEK3_NAV.map((n, i) => (
          <li key={n.id}>
            <Link to={n.to} aria-current={n.match(p) ? 'page' : undefined} data-testid={`week-nav-${n.id}`}>
              <span className="wk-nav-no" aria-hidden>
                {i + 1}
              </span>
              <span className="wk-long">{n.label}</span>
              <span className="wk-short">{n.short}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}
