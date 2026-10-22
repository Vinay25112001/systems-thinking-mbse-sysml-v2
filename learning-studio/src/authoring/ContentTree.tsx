// H1 Content list (spec §h): the course introduction, the course settings and Week 1 Learn (chapters → sections), each
// with its state chips and last change; filters "Has draft" and "Ready to publish"; the code-authored parts (slides,
// faculty notes) shown greyed. Used full width on #/authoring and as the left column of the editor.
import { useState } from 'react'
import { Link } from '../lib/router'
import { CHAPTERS } from '../week1/learn/textbook'
import type { ItemSummary } from '../publishing/types'
import { authoringPath } from './EditLink'
import { StateChip } from './parts'

const when = (iso: string) => (iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '')

function Row({ i, current, compact }: { i: ItemSummary; current?: string; compact: boolean }) {
  return (
    <li className={`au-tree-row${i.id === current ? ' is-current' : ''}`} data-testid={`tree-${i.id}`}>
      <Link to={authoringPath(i.id)} aria-current={i.id === current ? 'page' : undefined} className="au-tree-link">
        <span className="au-tree-title">{i.title}</span>
        <span className="au-mono au-small au-muted">{i.id}</span>
      </Link>
      <span className="au-tree-chips">
        {i.archived ? <StateChip state="archived" /> : i.published && !i.draft && <StateChip state="published" seq={i.published.seq} />}
        {i.draft && <StateChip state={i.draft.state} seq={i.draft.seq} testid={`tree-draft-${i.id}`} />}
        {i.codeChanged && (
          <span className="au-chip is-warning" title="The TypeScript source changed after the store was seeded; the store is authoritative on the course server.">
            Code changed
          </span>
        )}
      </span>
      {!compact && i.draft && (
        <span className="au-small au-muted au-tree-meta">
          Draft by {i.draft.author}, {when(i.draft.updatedAt)}
        </span>
      )}
    </li>
  )
}

export function ContentTree({ items, current, compact = false }: { items: ItemSummary[]; current?: string; compact?: boolean }) {
  const [filter, setFilter] = useState<'all' | 'draft' | 'ready'>('all')
  const keep = (i: ItemSummary) => filter === 'all' || (filter === 'draft' ? !!i.draft : i.draft?.state === 'ready-for-review')
  const course = items.filter((i) => i.kind !== 'learn-section' && keep(i))
  const byChapter = CHAPTERS.map((ch) => ({ ch, rows: items.filter((i) => i.parentId === `w01.learn.${ch.id}` && keep(i)) })).filter((g) => g.rows.length)
  const drafts = items.filter((i) => i.draft).length
  return (
    <nav className="au-tree" aria-label="Content items" data-testid="content-tree">
      <div className="au-filters" role="group" aria-label="Filter">
        {(['all', 'draft', 'ready'] as const).map((f) => (
          <button key={f} type="button" className={`au-btn small${filter === f ? ' is-on' : ''}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'draft' ? `Has draft (${drafts})` : 'Ready to publish'}
          </button>
        ))}
      </div>
      {course.length > 0 && (
        <>
          <h2 className="au-tree-h">Course introduction</h2>
          <ul className="au-tree-list">
            {course.map((i) => (
              <Row key={i.id} i={i} current={current} compact={compact} />
            ))}
          </ul>
        </>
      )}
      <h2 className="au-tree-h">
        Week 1 Learn <span className="au-mono au-small au-muted">w01.learn</span>
      </h2>
      {byChapter.map(({ ch, rows }) => (
        <details key={ch.id} className="au-tree-ch" open={!compact || rows.some((r) => r.id === current) || filter !== 'all'}>
          <summary>
            Ch. {ch.no} {ch.title} <span className="au-mono au-small au-muted">w01.learn.{ch.id}</span>
          </summary>
          <ul className="au-tree-list">
            {rows.map((i) => (
              <Row key={i.id} i={i} current={current} compact={compact} />
            ))}
          </ul>
        </details>
      ))}
      {!byChapter.length && filter !== 'all' && <p className="au-small au-muted">No Learn section matches this filter.</p>}
      <p className="au-tree-code">
        <span>Slides, faculty notes, lab and assessments</span> <StateChip state="code" /> <span className="au-small au-muted">until after Dec 1 (A24)</span>
      </p>
    </nav>
  )
}
