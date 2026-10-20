// Artifact library (roadmap §2.2): per type, a table of ID, title, the course checks (passing / failing with the first
// failing gate), review flag, provenance badge and last revision (self-declared initials, date). P1 types: the Week 1
// artifacts plus relationships (REL stakeholder relationships, LNK traces). Content is edited in the Week 1 lab tool.
import { useMemo, useState } from 'react'
import { Link } from '../../lib/router'
import { week1Validation } from '../adapters/week1Status'
import { displayTitle } from '../model/create'
import { numOf } from '../model/ids'
import { ARTIFACT_INFO, sentence, WEEK1_TYPES } from '../model/vocabulary'
import { isArtifactType, type Artifact, type ProjectDoc, type Provenance, type Relationship } from '../model/types'
import { useProjectState } from '../store/ProjectProvider'
import { Chip, EmptyState, fmtDate } from './ui'

const LAB_PART: Record<string, string> = { ENT: 'Part 2', MGO: 'Part 2', PRT: 'Part 2', EXT: 'Part 3', STK: 'Part 4', CON: 'Part 4', NEED: 'Part 5', REL: 'Part 4' }
export function ProvenanceBadge({ p }: { p: Provenance }) {
  if (p.kind === 'copied-from-practice') return <Chip tone="example" title={`Copied from AeroLink ${p.copiedFrom.id}`}>{p.adapted ? 'Adapted from practice' : 'Copied from practice'}</Chip>
  if (p.kind === 'imported') return <Chip tone="neutral" title={`${p.from.format} ${p.from.version}${p.from.file ? `, ${p.from.file}` : ''}`}>Imported</Chip>
  return <Chip tone="project">Own</Chip>
}
export function ReviewBadge({ a }: { a: Pick<Artifact, 'review'> }) {
  if (a.review.state === 'needs-review') return <Chip tone="warn">Needs review</Chip>
  if (a.review.state === 'reviewed') return <Chip tone="neutral">Reviewed</Chip>
  return <span className="pj-caption">—</span>
}

function TypeCards({ doc }: { doc: ProjectDoc }) {
  const rels = Object.values(doc.relationships).filter((r) => r.status !== 'retired')
  return (
    <div className="pj-grid cards">
      {WEEK1_TYPES.map((t) => {
        const n = Object.values(doc.artifacts).filter((a) => a.type === t && a.status === 'active').length
        return (
          <Link key={t} to={`/project/artifacts/${t}`} className="pj-card pj-acard" data-testid={`lib-type-${t}`}>
            <span className="pj-caption">Week 1 · {t}</span>
            <span className="pj-h3" style={{ margin: 0 }}>{ARTIFACT_INFO[t].plural}</span>
            <span className="pj-count">{n}</span>
          </Link>
        )
      })}
      <Link to="/project/artifacts/REL" className="pj-card pj-acard" data-testid="lib-type-REL">
        <span className="pj-caption">Week 1 · REL</span>
        <span className="pj-h3" style={{ margin: 0 }}>Stakeholder relationships</span>
        <span className="pj-count">{rels.filter((r) => r.category === 'stakeholder').length}</span>
      </Link>
      <Link to="/project/artifacts/LNK" className="pj-card pj-acard" data-testid="lib-type-LNK">
        <span className="pj-caption">All weeks · LNK</span>
        <span className="pj-h3" style={{ margin: 0 }}>Traceability relationships</span>
        <span className="pj-count">{rels.filter((r) => r.category !== 'stakeholder').length}</span>
      </Link>
      {(['capabilities', 'ConOps and scenarios', 'requirements', 'technology assessments', 'AROU and risk registers', 'trade studies', 'architecture elements', 'information flows', 'components', 'interfaces', 'roadmaps', 'model elements', 'verification plans', 'analysis results'] as const).map((g) => (
        <div key={g} className="pj-card pj-acard future">
          <span className="pj-caption">Upcoming</span>
          <span className="pj-h3" style={{ margin: 0, textTransform: 'capitalize' }}>{g}</span>
          <span className="pj-caption">Added as the week that teaches it joins My Project.</span>
        </div>
      ))}
    </div>
  )
}

function RelTable({ doc, stakeholder, showRetired }: { doc: ProjectDoc; stakeholder: boolean; showRetired: boolean }) {
  const id = (u: string) => doc.artifacts[u]?.id ?? ''
  const list = Object.values(doc.relationships)
    .filter((r) => (stakeholder ? r.category === 'stakeholder' : r.category !== 'stakeholder') && (showRetired || r.status !== 'retired'))
    .sort((a, b) => numOf(a.id) - numOf(b.id))
  const v = week1Validation(doc)
  if (!list.length) return <EmptyState title="No relationships yet" action={<Link to="/week/1/lab/tool" className="pj-btn primary">Open the Week 1 lab tool</Link>}>{stakeholder ? 'Record at least three relationships between stakeholders, at least one a conflict, in Part 4 of the Week 1 lab tool.' : 'Trace relationships are created as you fill in a need’s sources, concerns and goal (Week 1 lab tool, Part 5).'}</EmptyState>
  const label = (r: Relationship) => (stakeholder ? `${String(r.attributes?.fromText ?? id(r.from)) || '?'} ${r.type || '(type not chosen)'} ${String(r.attributes?.toText ?? id(r.to)) || '?'}` : sentence(id(r.from), r.type, id(r.to)))
  return (
    <div className="pj-table-wrap pj-card" style={{ padding: 0 }}>
      <table className="pj-table" data-testid="rel-table">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Relationship</th>
            <th scope="col">Status</th>
            <th scope="col" className="pj-hide-sm">{stakeholder ? 'Note' : 'Category'}</th>
            <th scope="col" className="pj-hide-sm">Checks</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.uid}>
              <td className="pj-id">{r.id}</td>
              <td>{label(r)}</td>
              <td>{r.draft ? <Chip tone="draft">Draft</Chip> : r.status === 'suspect' ? <Chip tone="warn">Suspect</Chip> : r.status === 'retired' ? <Chip tone="neutral">Retired</Chip> : <Chip tone="ok">Active</Chip>}</td>
              <td className="pj-hide-sm pj-small">{stakeholder ? r.note : r.category}</td>
              <td className="pj-hide-sm pj-small">{v.get(r.uid) ? (v.get(r.uid)!.state === 'passing' ? 'passing' : v.get(r.uid)!.gates[0]?.message) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Library({ type }: { type?: string }) {
  const doc = useProjectState().doc!
  const [q, setQ] = useState('')
  const [showRetired, setShowRetired] = useState(false)
  const v = useMemo(() => week1Validation(doc), [doc])
  const isRel = type === 'REL' || type === 'LNK'
  const t = type && isArtifactType(type) ? type : null
  const title = isRel ? (type === 'REL' ? 'Stakeholder relationships' : 'Traceability relationships') : t ? ARTIFACT_INFO[t].plural : 'Artifact library'
  const list = t
    ? Object.values(doc.artifacts)
        .filter((a) => a.type === t && (showRetired || a.status === 'active'))
        .filter((a) => !q.trim() || `${a.id} ${a.title} ${a.description}`.toLowerCase().includes(q.trim().toLowerCase()))
        .sort((a, b) => numOf(a.id) - numOf(b.id))
    : []
  return (
    <div className="pj-stack" data-testid="project-library">
      <div>
        <nav className="pj-caption" aria-label="Library">
          <Link to="/project/artifacts">Artifact library</Link>
          {(t || isRel) && <> / {title}</>}
        </nav>
        <h1 className="pj-h1">{title}</h1>
        <p className="pj-lede">{t || isRel ? `Edited in the Week 1 lab tool${LAB_PART[type!] ? `, ${LAB_PART[type!]}` : ''}, so there is one editor and one set of checks. Open an item for its relationships and history.` : 'Everything your team produces, by type, with its ID, its checks, review flags and where it came from.'}</p>
      </div>
      {!t && !isRel && <TypeCards doc={doc} />}
      {(t || isRel) && (
        <div className="pj-row">
          {t && (
            <label className="pj-field" style={{ minWidth: 240 }}>
              <span className="sr-only">Search {title}</span>
              <input className="pj-input" placeholder={`Search ${title.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          )}
          <label className="pj-small pj-row" style={{ gap: 6 }}>
            <input type="checkbox" checked={showRetired} onChange={(e) => setShowRetired(e.target.checked)} /> Show retired
          </label>
          <Link to="/week/1/lab/tool" className="pj-btn">
            Edit in the Week 1 lab tool
          </Link>
        </div>
      )}
      {isRel && <RelTable doc={doc} stakeholder={type === 'REL'} showRetired={showRetired} />}
      {t && !list.length && (
        <EmptyState title={`No ${ARTIFACT_INFO[t].plural.toLowerCase()} yet`} action={<Link to="/week/1/lab/tool" className="pj-btn primary">Open the Week 1 lab tool</Link>}>
          {t === 'STK' ? 'Your register starts empty. Sweep the life cycle for users, customers, operators, regulators, affected parties and suppliers; at least 8 stakeholders in 3 role groups (Week 1 lab tool, Part 4).' : t === 'NEED' ? 'Write each need in the taught form, traced to its stakeholders, concern and the mission or a goal (Week 1 lab tool, Part 5).' : `Created in the Week 1 lab tool${LAB_PART[t] ? `, ${LAB_PART[t]}` : ''}.`}
        </EmptyState>
      )}
      {t && list.length > 0 && (
        <div className="pj-table-wrap pj-card" style={{ padding: 0 }}>
          <table className="pj-table" data-testid="artifact-table">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Title or statement</th>
                <th scope="col">Checks</th>
                <th scope="col">Review</th>
                <th scope="col" className="pj-hide-sm">Provenance</th>
                <th scope="col" className="pj-hide-sm">Last revised</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => {
                const val = v.get(a.uid)
                const failing = val?.gates.find((g) => !g.ok)
                return (
                  <tr key={a.uid} data-testid={`row-${a.id}`}>
                    <td className="pj-id">
                      <Link to={`/project/artifact/${a.id}`}>{a.id}</Link>
                      {a.status === 'retired' && <span className="pj-caption"> (retired)</span>}
                    </td>
                    <td>{displayTitle(a)}</td>
                    <td className="pj-small">{a.status === 'retired' ? '—' : val ? val.state === 'passing' ? <Chip tone="ok">Passing</Chip> : <span><Chip tone="draft">Failing</Chip> <span className="pj-caption">{failing?.message.slice(0, 120)}</span></span> : <Chip tone="neutral">Unchecked</Chip>}</td>
                    <td><ReviewBadge a={a} /></td>
                    <td className="pj-hide-sm"><ProvenanceBadge p={a.provenance} /></td>
                    <td className="pj-hide-sm pj-small">{a.revised.by || 'not recorded'} · {fmtDate(a.revised.at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
