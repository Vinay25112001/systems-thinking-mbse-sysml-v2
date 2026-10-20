// One slide on the 16:9 stage, in the same master as the generated .pptx: title bar, content by layout, and a footer
// with the figure caption, the sources line, the course name, the week and the slide number. Sizes are in container
// query units (cqw), so the slide scales with its stage; under 640 px the stage falls back to a stacked card.
import type { Lecture, Slide } from '../content/lectures/types'
import { BlockView, CitationLink, FigureDrawing } from './Blocks'
import { ReferencesFace } from './ReferencesFace'

export const COURSE_NAME = 'Systems Thinking and MBSE with SysML v2'

export function SlideFace({ lecture, slide, index, total }: { lecture: Lecture; slide: Slide; index: number; total: number }) {
  const s = slide
  const isTitle = s.layout === 'title'
  const split = s.layout === 'figure-bullets' || s.layout === 'two-column' || (!!s.aside?.length && s.layout !== 'figure')
  return (
    <article className={`lec-slide is-${s.layout}`} aria-roledescription="slide" aria-label={`Slide ${index + 1} of ${total}: ${s.title}`} data-testid="slide-face" data-slide-id={s.id}>
      {lecture.fixture && <p className="lec-slide-fixture">Fixture — not course content</p>}
      {isTitle ? (
        <div className="lec-title-body">
          <p className="lec-kicker">
            Week {lecture.week} · Session {lecture.session}
          </p>
          <h2 className="lec-title-main">{s.title}</h2>
          {s.subtitle && <p className="lec-title-sub">{s.subtitle}</p>}
          <div className="lec-title-blocks">
            {s.body.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <header className="lec-slide-head">
            <h2>{s.title}</h2>
            {s.subtitle && <p>{s.subtitle}</p>}
          </header>
          {s.layout === 'references' ? (
            <div className="lec-slide-body">
              <ReferencesFace lecture={lecture} />
            </div>
          ) : (
          <div className={`lec-slide-body${split ? ' is-split' : ''}${s.figure && !split ? ' has-figure' : ''}`}>
            {s.figure && (
              <div className="lec-slide-fig">
                <FigureDrawing figure={s.figure} />
              </div>
            )}
            {(s.body.length > 0 || !s.figure) && (
              <div className="lec-slide-col">
                {s.body.map((b, i) => (
                  <BlockView key={i} block={b} />
                ))}
              </div>
            )}
            {s.aside && s.aside.length > 0 && (
              <div className="lec-slide-col is-aside">
                {s.aside.map((b, i) => (
                  <BlockView key={i} block={b} />
                ))}
              </div>
            )}
          </div>
          )}
        </>
      )}
      <footer className="lec-slide-foot">
        {s.figure && (
          <p className="lec-foot-caption">
            <span className="lec-foot-label">Figure.</span> {s.figure.caption}
          </p>
        )}
        {s.sources.length > 0 && (
          <p className="lec-foot-sources">
            <span className="lec-foot-label">Sources:</span>{' '}
            {s.sources.map((c, i) => (
              <span key={i}>
                {i > 0 && '; '}
                <CitationLink c={c} short />
              </span>
            ))}
          </p>
        )}
        <div className="lec-foot-bar">
          <span>{COURSE_NAME}</span>
          <span>
            Week {lecture.week} · Session {lecture.session}
          </span>
          <span className="lec-foot-no">
            {index + 1} / {total}
          </span>
        </div>
      </footer>
    </article>
  )
}
