// The Week 1 sub-navigation (Overview · Lecture · Lesson · Worked examples · Laboratory · Assessment), shown on every
// Week 1 page: the week pages (WeekShell), the slide viewer, the handout and the reader (lectures/Chrome.tsx).
import { Link } from '../lib/router'
import { WEEK1_NAV } from './route'

export function WeekNav({ path }: { path: string }) {
  const p = path.replace(/\/+$/, '')
  return (
    <nav className="wk-nav" aria-label="Week 1 sections" data-testid="week-nav">
      <ol>
        {WEEK1_NAV.map((n, i) => (
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
