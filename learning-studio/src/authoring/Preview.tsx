// H4 "Preview as student" (spec §h; design §6): the server's student assembly with the item's open draft as override
// (GET authoring/preview/:scope?item=…), rendered by the REAL student components — the Learn reader (student wording
// layer, footnotes from the register, gap-free numbering, no faculty boxes) or the homepage — inside a framed preview.
// Nothing here is a second renderer, so the preview equals what students will read once the draft is published.
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from '../lib/router'
import Homepage from '../pages/Homepage'
import { courseBodies, toLearnOverlay } from '../publishing/client'
import { CoursePreviewContext, PreviewMode } from '../publishing/usePublishedContent'
import { COURSE_INTRO_ID, COURSE_SETTINGS_ID, sectionIdOf, type StudentPayload } from '../publishing/types'
import LearnReader from '../week1/learn/LearnReader'
import { LearnPreviewContext } from '../week1/learn/usePublished'
import { sectionById } from '../week1/learn/textbook'
import { ApiFailure } from '../services/backend'
import * as A from './api'
import { authoringPath } from './EditLink'

export default function Preview({ id }: { id: string }) {
  const sid = sectionIdOf(id)
  const scope = sid ? 'week1' : 'course'
  const [p, setP] = useState<(StudentPayload & { preview: { seq: number } | null }) | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    A.preview(scope, id).then(setP, (e) => setErr(e instanceof ApiFailure ? e.error.message : 'The preview could not be built.'))
  }, [scope, id])
  const bar = (
    <div className="au-preview-bar" role="note" data-testid="preview-bar">
      <Link to={authoringPath(id)} className="au-btn small">
        <ArrowLeft size={14} aria-hidden /> Back to the editor
      </Link>
      <strong>{p?.preview ? `Preview of draft r${p.preview.seq} · not visible to students` : 'Preview of the published version (no open draft)'}</strong>
      <span className="au-small">Rendered with the student wording, footnotes and numbering rules.</span>
    </div>
  )
  if (err || !p)
    return (
      <div className="au-root">
        {bar}
        <p className="au-main">{err || 'Building the preview…'}</p>
      </div>
    )
  if (sid) {
    const hit = sectionById(sid)
    const overlay = toLearnOverlay(p)
    return (
      <div className="au-preview" data-testid="preview">
        {bar}
        <PreviewMode.Provider value>
          <LearnPreviewContext.Provider value={overlay}>
            <LearnReader chapter={hit?.chapter.id} section={sid} path={`/week/1/learn/${hit?.chapter.id ?? ''}`} />
          </LearnPreviewContext.Provider>
        </PreviewMode.Provider>
      </div>
    )
  }
  const live = courseBodies(p)
  if (!live.intro || !live.settings) return <p>The preview payload is incomplete ({COURSE_INTRO_ID}, {COURSE_SETTINGS_ID}).</p>
  return (
    <div className="au-preview" data-testid="preview">
      {bar}
      <PreviewMode.Provider value>
        <CoursePreviewContext.Provider value={{ intro: live.intro, settings: live.settings }}>
          <Homepage />
        </CoursePreviewContext.Provider>
      </PreviewMode.Provider>
    </div>
  )
}
