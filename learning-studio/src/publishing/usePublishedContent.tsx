// React side of student consumption (client.ts): the scope state hook, the course-introduction hook used by the
// homepage, the preview contexts used by "Preview as student", and the polite "Updated content available" banner.
import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'
import { COURSE_SETTINGS } from '../content/courseSettings'
import { HOMEPAGE } from '../content/homepage'
import { applyPending, courseBodies, getContentState, OFF, startContentSync, subscribeContent } from './client'
import type { CourseIntroBody, CourseSettingsBody, Scope } from './types'
import './publishing.css'

/** True inside the instructor's "Preview as student" frame: no update banner, no edit links. */
export const PreviewMode = createContext(false)
/** The course introduction a preview renders (the draft overlay), or null outside a preview. */
export const CoursePreviewContext = createContext<{ intro: CourseIntroBody; settings: CourseSettingsBody } | null>(null)

export function useContentState(scope: Scope) {
  const get = () => getContentState(scope)
  return useSyncExternalStore(subscribeContent, get, get)
}

/** The homepage text and the department setting: preview → latest published → bundled code content. */
export function useCourseContent(): { intro: CourseIntroBody; settings: CourseSettingsBody } {
  const preview = useContext(CoursePreviewContext)
  const s = useContentState('course')
  useEffect(() => {
    if (!preview) startContentSync('course')
  }, [preview])
  if (preview) return preview
  const live = courseBodies(s.applied)
  return { intro: live.intro ?? HOMEPAGE, settings: live.settings ?? COURSE_SETTINGS }
}

/** "Updated content available": a polite live region (always present, so screen readers hear the change), filled when a
 *  newer publication of this scope exists. The text on screen changes only when the reader chooses "Show the update". */
export function ContentUpdateBanner({ scope }: { scope: Scope }) {
  const preview = useContext(PreviewMode)
  const s = useContentState(scope)
  useEffect(() => {
    if (!preview) startContentSync(scope)
  }, [scope, preview])
  if (OFF || preview) return null
  const n = s.pending?.changed ?? 0
  const what = scope === 'week1' ? `Week 1 was updated (${n} ${n === 1 ? 'section' : 'sections'}).` : 'The course introduction was updated.'
  return (
    <div className="pub-banner-slot" role="status" aria-live="polite" data-testid={`content-update-${scope}`}>
      {s.pending && (
        <p className="pub-banner">
          <strong>Updated content available.</strong> {what} Your notes, progress and project are not affected.{' '}
          <button type="button" className="pub-banner-btn" onClick={() => applyPending(scope)} data-testid={`content-update-apply-${scope}`}>
            Show the update
          </button>
        </p>
      )}
    </div>
  )
}
