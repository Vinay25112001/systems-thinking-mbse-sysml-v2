// Shared renderers for lecture blocks, figures and citations: the slide face, the handout and the reader all draw a
// block through these, so a definition or a table looks the same in every web view.
import type { ReactNode } from 'react'
import { FIGURE_REGISTRY } from '../components/figures/registry'
import { formatCitation, type Citation } from '../content/readings'
import { shortCitation, sourcesPath } from './cite'
import { parseInline } from '../content/lectures/text'
import type { Block, Bullet, FigureRef } from '../content/lectures/types'
import { Link } from '../lib/router'

export function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((r, i) => (r.bold ? <strong key={i}>{r.text}</strong> : r.em ? <em key={i}>{r.text}</em> : <span key={i}>{r.text}</span>))}
    </>
  )
}

export function CitationLink({ c, short = false }: { c: Citation; short?: boolean }) {
  return (
    <Link to={sourcesPath(c)} className="lec-cite" title={formatCitation(c)}>
      {short ? shortCitation(c) : formatCitation(c)}
    </Link>
  )
}

export function CitationList({ cites, label = 'Sources' }: { cites: Citation[]; label?: string }) {
  if (cites.length === 0) return null
  return (
    <div className="lec-sources">
      <p className="lec-sources-label">{label}</p>
      <ul>
        {cites.map((c, i) => (
          <li key={i}>
            <CitationLink c={c} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function BulletList({ items }: { items: Bullet[] }) {
  return (
    <ul className="lec-bullets">
      {items.map((b, i) =>
        typeof b === 'string' ? (
          <li key={i}>
            <Inline text={b} />
          </li>
        ) : (
          <li key={i}>
            <Inline text={b.text} />
            <ul>
              {b.sub.map((s, j) => (
                <li key={j}>
                  <Inline text={s} />
                </li>
              ))}
            </ul>
          </li>
        ),
      )}
    </ul>
  )
}

const CALLOUT_LABEL = { note: 'Note', key: 'Key point', caution: 'Caution' } as const

export function BlockView({ block: b }: { block: Block }): ReactNode {
  switch (b.kind) {
    case 'bullets':
      return <BulletList items={b.items} />
    case 'definition':
      return (
        <div className="lec-definition">
          <p className="lec-def-term">{b.term}</p>
          <p className="lec-def-text">
            <Inline text={b.text} />
          </p>
          <p className="lec-def-source">
            <CitationLink c={b.source} />
          </p>
        </div>
      )
    case 'table':
      return (
        // a wide table scrolls inside its wrapper; the wrapper is a focusable region so keyboard users can scroll it
        <div className="lec-table-wrap" tabIndex={0} role="region" aria-label={b.caption ? `Table: ${b.caption}` : `Table: ${b.header.join(', ')}`}>
          <table className="lec-table">
            {b.caption && <caption>{b.caption}</caption>}
            <thead>
              <tr>
                {b.header.map((h, i) => (
                  <th key={i} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (j === 0 ? <th key={j} scope="row"><Inline text={c} /></th> : <td key={j}><Inline text={c} /></td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'equation':
      return (
        <div className="lec-equation">
          <p className="lec-eq-display" role="math" aria-label={b.speech}>
            {b.display}
          </p>
          {b.where && b.where.length > 0 && (
            <dl className="lec-eq-where">
              {b.where.map((w, i) => (
                <div key={i}>
                  <dt>{w.symbol}</dt>
                  <dd>{w.meaning}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )
    case 'callout':
      return (
        <div className={`lec-callout is-${b.tone}`}>
          <p className="lec-callout-title">{b.title ?? CALLOUT_LABEL[b.tone]}</p>
          <p>
            <Inline text={b.text} />
          </p>
        </div>
      )
    case 'steps':
      return (
        <ol className="lec-steps">
          {b.items.map((s, i) => (
            <li key={i}>
              <span className="lec-step-label">{s.label}</span> <Inline text={s.text} />
            </li>
          ))}
        </ol>
      )
  }
}

/** The figure drawing alone (no frame): what the slide, the reader and the PNG canvas place. */
export function FigureDrawing({ figure }: { figure: Pick<FigureRef, 'id' | 'alt'> }) {
  const entry = FIGURE_REGISTRY[figure.id]
  if (!entry) return <p className="lec-missing">Figure “{figure.id}” is not registered.</p>
  return <div className="lec-figure-art">{entry.render(figure.alt)}</div>
}

/** A captioned figure for the reader and handout. */
export function CaptionedFigure({ figure, number }: { figure: FigureRef; number?: string }) {
  return (
    <figure className="lec-figure" data-testid={`lecture-figure-${figure.id}`}>
      <FigureDrawing figure={figure} />
      <figcaption>
        {number && <span className="lec-fig-no">Figure {number}. </span>}
        {figure.caption}
      </figcaption>
    </figure>
  )
}
