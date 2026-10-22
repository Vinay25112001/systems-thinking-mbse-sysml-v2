// Lazy entry point for the Week 1 student pages (M4 part A, spec §b.2): Overview, Learn (the textbook), Guided Practice,
// My Project / Lab and Review & Submit, all in the one student chrome. Guided Practice is the M5 page (own practice
// store, tasks GP-1…GP-6). M6: My Project / Lab is the Week 1 canvas (src/project/canvas), the Lab L1 instructions have
// their own page, the earlier lab tool stays in the instructor edition only, and Review & Submit is the package review
// with the submission snapshot and faculty feedback (src/week1/review).
import { useEffect } from 'react'
import { IS_STUDENT_EDITION } from '../lib/edition'
import { Week1Canvas } from '../project/canvas/Canvas'
import ReviewSubmit from './review/ReviewSubmit'
import '../lectures/lectures.css'
import Lab from './Lab'
import LearnReader, { LearnFromSlide } from './learn/LearnReader'
import Overview from './Overview'
import type { Week1Route } from './route'
import GuidedPractice from './practice/GuidedPractice'
import Week1Workbench from './Workbench'
import { WeekShell } from './WeekShell'

type Page = Exclude<Week1Route, { redirect: string }>

export default function Week1App({ route, path }: { route: Page; path: string }) {
  const page = route.page
  useEffect(() => {
    if (page !== 'learn') window.scrollTo?.(0, 0)
  }, [page])
  if (page === 'learn-from-slide') return <LearnFromSlide session={route.session ?? 1} slide={route.slide} />
  if (page === 'learn') return <LearnReader chapter={route.chapter} section={route.section} path={path} />
  if (page === 'project-tool' && IS_STUDENT_EDITION) return <ToCanvas /> // m6: the canvas replaces the lab tool for students
  if (page === 'project-tool') return <Week1Workbench key="lab" kind="lab" path={path} />
  if (page === 'practice') return <GuidedPractice task={route.task} path={path} />
  if (page === 'overview')
    return (
      <WeekShell path={path} title="Overview" crumbs={[{ label: 'Course', to: '/' }, { label: 'Week 1' }]}>
        <Overview />
      </WeekShell>
    )
  if (page === 'project')
    return (
      <WeekShell path={path} title="My Project / Lab" compact>
        <Week1Canvas part={route.part} />
      </WeekShell>
    )
  if (page === 'project-instructions')
    return (
      <WeekShell path={path} title="Lab instructions" crumbs={[{ label: 'Week 1', to: '/week/1' }, { label: 'My Project / Lab', to: '/week/1/project' }, { label: 'Lab instructions' }]}>
        <Lab />
      </WeekShell>
    )
  return (
    <WeekShell path={path} title="Review & Submit">
      <ReviewSubmit />
    </WeekShell>
  )
}

function ToCanvas() {
  useEffect(() => {
    window.location.replace('#/week/1/project')
  }, [])
  return null
}
