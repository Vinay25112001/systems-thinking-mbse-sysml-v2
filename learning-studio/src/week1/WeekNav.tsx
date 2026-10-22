// The Week 1 stage bar (spec §b.2, NAV-10/11): Overview → Learn → Guided Practice → My Project / Lab → Review & Submit.
// Each stage shows its state with an icon AND a word, never color alone. Learn's state is computed from the reading
// progress (every visible section marked read = done); the other stages say only what is known in this edition
// (current or not), until M5/M6 give them their own completion criteria. Also shown above the instructor's lecture viewer.
import { Check, CircleDot } from 'lucide-react'
import { Link } from '../lib/router'
import { allSections, visibleInEdition } from './learn/textbook'
import { loadProgress } from './learn/progress'
import { WEEK1_NAV } from './route'

export function learnState(): { read: number; total: number } {
  const p = loadProgress()
  const visible = allSections().filter((x) => visibleInEdition(x.section))
  return { read: visible.filter((x) => p.read[x.section.id]).length, total: visible.length }
}

export function WeekNav({ path }: { path: string }) {
  const p = path.split('#')[0].replace(/\/+$/, '')
  const learn = learnState()
  const chapter = p.match(/^\/week\/1\/learn\/ch(\d\d)/)
  return (
    <nav className="wk-stagebar" aria-label="Week 1 stages" data-testid="week-nav">
      <ol>
        {WEEK1_NAV.map((n, i) => {
          const cur = n.match(p)
          const done = n.id === 'learn' && learn.total > 0 && learn.read === learn.total
          const state = done ? 'Done' : cur ? 'Current' : n.id === 'learn' && learn.read > 0 ? 'In progress' : null
          const sub = n.id === 'learn' && chapter ? `Chapter ${parseInt(chapter[1], 10)} of 11` : n.id === 'learn' && learn.read > 0 ? `${learn.read} of ${learn.total} sections read` : n.sub
          return (
            <li key={n.id} className={`is-${n.identity}`}>
              <Link to={n.to} aria-current={cur ? 'step' : undefined} data-testid={`week-nav-${n.id}`} className={`wk-stage${done ? ' is-done' : ''}${cur ? ' is-current' : ''}`}>
                <span className="wk-stage-dot" aria-hidden>
                  {done ? <Check size={14} strokeWidth={3} /> : cur ? <CircleDot size={14} /> : i + 1}
                </span>
                <span className="wk-stage-text">
                  <span className="wk-stage-label">
                    <span className="wk-long">{n.label}</span>
                    <span className="wk-short">{n.short}</span>
                  </span>
                  <span className="wk-stage-sub">
                    {state && <strong>{state}</strong>}
                    {state && ' · '}
                    {sub}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
