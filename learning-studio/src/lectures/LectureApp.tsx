// Lazy entry point for every lecture route (see route.ts). Owns the full viewport, like the Week 1 flow.
import { getLecture } from '../content/lectures'
import { Link } from '../lib/router'
import FigureCanvas from './FigureCanvas'
import Handout from './Handout'
import LectureViewer from './LectureViewer'
import LessonReader from './LessonReader'
import type { LectureRoute } from './route'
import './lectures.css'

export default function LectureApp({ route }: { route: LectureRoute }) {
  if (route.kind === 'figure') return <FigureCanvas id={route.id} />
  if (route.kind === 'lesson') return <LessonReader week={route.week} section={route.section} />
  const lecture = getLecture(route.week, route.session)
  if (!lecture)
    return (
      <main className="lec-root lec-reader" id="main">
        <h1>No lecture here</h1>
        <p>
          Week {route.week} has no session {route.session} lecture yet. <Link to="/">Return to the dashboard</Link>.
        </p>
      </main>
    )
  if (route.kind === 'handout') return <Handout lecture={lecture} />
  return <LectureViewer key={`${lecture.week}-${lecture.session}`} lecture={lecture} initialSlide={route.slide} />
}
