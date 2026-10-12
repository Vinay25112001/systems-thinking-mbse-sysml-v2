// Course map (rail): week switcher plus the course pages. Loaded on first open (it reads every week's status).
import { WEEKS } from '../../content/course'
import { hasWorkbench } from '../../content/missions'
import { Link } from '../../lib/router'
import { STATUS_LABEL, statusOfWeek } from '../../state/weekStatus'
import { Frame } from './Dialogs'

export default function CourseMapDialog({ open, onOpenChange, current }: { open: boolean; onOpenChange: (o: boolean) => void; current: number }) {
  return (
    <Frame open={open} onOpenChange={onOpenChange} title="Course map" testid="course-map">
      <nav aria-label="Course map" className="space-y-3 text-[13px]">
        <ul className="m-0 grid list-none gap-1 p-0">
          {WEEKS.map((w) => (
            <li key={w.number}>
              <Link to={`/week/${w.number}`} onClick={() => onOpenChange(false)} aria-current={w.number === current ? 'page' : undefined} className={`flex items-baseline gap-2 rounded px-2 py-1 ${w.number === current ? 'bg-wb-accent-soft text-wb-accent' : 'hover:bg-wb-sunk'}`}>
                <span className="wb-mono w-6 text-[11px] text-wb-muted">W{w.number}</span>
                <span className="min-w-0 flex-1">{w.title}</span>
                <span className="wb-chip">{hasWorkbench(w.number) ? 'workbench' : STATUS_LABEL[statusOfWeek(w.number)].toLowerCase()}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 border-t border-wb-line pt-3">
          <Link to="/" className="wb-link">Dashboard</Link>
          <Link to="/roadmap" className="wb-link">Course roadmap</Link>
          <Link to="/workspace/model" className="wb-link">AeroLink engineering model</Link>
          <Link to="/workspace/aerolink" className="wb-link">Case brief and data sheet</Link>
          <Link to="/progress" className="wb-link">My progress</Link>
          <Link to="/sources" className="wb-link">Verified sources</Link>
          <Link to="/instructor" className="wb-link">Instructor review</Link>
        </p>
      </nav>
    </Frame>
  )
}
