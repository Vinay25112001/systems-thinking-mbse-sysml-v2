// IF-6 Stakeholder ecosystem map (spec §d.9, LRN-21 MUST; M4 part B). Teaching purpose: relationships and conflict are
// part of the register, and a flat list hides them. A node-link map of the fifteen AeroLink stakeholders grouped by
// course role group; chips filter the relationships by the seven course-convention types; the one conflict (REL-002) is
// highlighted by default; selecting a stakeholder lists its concerns and relationships in words.
// Rules (§d.9): keyboard only (arrow keys move between nodes, Enter or Space selects; native checkboxes and a select do
// the rest), state announced in a polite live region, text equivalent one click away and printed instead of the
// drawing, no scoring; filter changes are instant (a 150 ms fade only without reduced motion, figures.css).
// Data: aerolinkCase.ts only (STAKEHOLDERS, CONCERNS, RELATIONSHIPS, ROLE_GROUP_LABEL); nothing is retyped.
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { CONCERNS, RELATIONSHIPS, RELATIONSHIP_VERB, ROLE_GROUP_LABEL, ROLE_GROUP_SHORT, STAKEHOLDERS, type CaseRelationship, type RelationshipType, type RoleGroup } from '../../content/lectures/week01/aerolinkCase'
import { REL_TYPES } from '../../content/lectures/week01/labBrief'
import { ExpandButton, FigureDialog, ReadableArt, useDialog, wrap } from './ifigShared'
import './figures.css'

/** Column layout: role groups placed so that most relationships run between neighboring columns. */
const COLUMNS: { x: number; groups: RoleGroup[] }[] = [
  { x: 100, groups: ['user', 'maintainer'] },
  { x: 350, groups: ['authority', 'public', 'customer'] },
  { x: 600, groups: ['supplier'] },
]
/** Order inside a group where it shortens the drawn links (the utility and the responders beside the vertiport operators). */
const ORDER = ['STK-010', 'STK-005', 'STK-006', 'STK-011', 'STK-012']
const NODE_W = 180
const NODE_H = 64
const VIEW_W = 760
/** Arrows point in the direction of influence (review M4b F5): from A to B for these types… */
const DIRECTED: RelationshipType[] = ['regulates', 'funds', 'supplies']
/** …and from B to A for "A is affected by B" (B influences A); the other types are mutual and carry no arrowhead. */
const REVERSED: RelationshipType[] = ['affected-by']
const CONFLICT_TYPE: RelationshipType = 'conflicts-with'

type Placed = { id: string; name: string; group: RoleGroup; x: number; y: number; col: number }
type Header = { label: string; x: number; y: number }

function layout(): { nodes: Placed[]; headers: Header[]; height: number } {
  const nodes: Placed[] = []
  const headers: Header[] = []
  let height = 0
  COLUMNS.forEach((c, col) => {
    let y = 14
    for (const g of c.groups) {
      headers.push({ label: ROLE_GROUP_SHORT[g], x: c.x - NODE_W / 2, y: y + 15 })
      y += 26
      const members = STAKEHOLDERS.filter((s) => s.roleGroup === g).sort((a, b) => (ORDER.indexOf(a.id) + 1 || 99) - (ORDER.indexOf(b.id) + 1 || 99))
      for (const s of members) {
        nodes.push({ id: s.id, name: s.name, group: g, x: c.x, y: y + NODE_H / 2, col })
        y += NODE_H + 10
      }
      y += 8
    }
    height = Math.max(height, y)
  })
  return { nodes, headers, height: height + 6 }
}
const LAYOUT = layout()
/** Reading order of the nodes for the arrow keys: column by column, top to bottom. */
export const NODE_ORDER = LAYOUT.nodes.map((n) => n.id)

const nameOf = (id: string) => STAKEHOLDERS.find((s) => s.id === id)!.name
export const relWords = (r: CaseRelationship) => `${r.id}: ${nameOf(r.source)} — ${RELATIONSHIP_VERB[r.type]} — ${nameOf(r.target)} (${r.note.charAt(0).toLowerCase()}${r.note.slice(1)})`
export const relationshipsOf = (id: string) => RELATIONSHIPS.filter((r) => r.source === id || r.target === id)
export const unrelated = () => STAKEHOLDERS.filter((s) => relationshipsOf(s.id).length === 0)

export function statusText(shown: RelationshipType[], selected: string | null): string {
  const vis = RELATIONSHIPS.filter((r) => shown.includes(r.type))
  const conflict = vis.filter((r) => r.type === CONFLICT_TYPE).map((r) => r.id)
  let s = `Showing ${vis.length} of ${RELATIONSHIPS.length} relationships.${conflict.length ? ` Conflict highlighted: ${conflict.join(', ')}.` : ''}`
  if (selected) {
    const st = STAKEHOLDERS.find((x) => x.id === selected)!
    const rels = relationshipsOf(selected).filter((r) => shown.includes(r.type))
    s += ` Selected ${st.id} ${st.name}: ${st.concerns.length} ${st.concerns.length === 1 ? 'concern' : 'concerns'}, ${rels.length} ${rels.length === 1 ? 'relationship' : 'relationships'} shown.`
  }
  return s
}

function edgeGeometry(r: CaseRelationship) {
  const a = LAYOUT.nodes.find((n) => n.id === r.source)!
  const b = LAYOUT.nodes.find((n) => n.id === r.target)!
  if (a.col === b.col) {
    // same column: an arc beside the column (right of the last column, left of the others)
    const side = a.col === COLUMNS.length - 1 ? 1 : -1
    const sx = a.x + (side * NODE_W) / 2
    const tx = b.x + (side * NODE_W) / 2
    const bulge = side * 44
    return { d: `M${sx},${a.y} C${sx + bulge},${a.y} ${tx + bulge},${b.y} ${tx + side * 6},${b.y}`, bx: sx + side * 33, by: (a.y + b.y) / 2 }
  }
  const dir = b.col > a.col ? 1 : -1
  const x1 = a.x + (dir * NODE_W) / 2
  const x2 = b.x - (dir * NODE_W) / 2 - dir * 6
  const mid = (x1 + x2) / 2
  return { d: `M${x1},${a.y} C${mid},${a.y} ${mid},${b.y} ${x2},${b.y}`, bx: mid, by: (a.y + b.y) / 2 }
}

function Drawing({ shown, selected, focus, onFocus, onSelect, big = false }: { shown: RelationshipType[]; selected: string | null; focus: string; onFocus: (id: string) => void; onSelect: (id: string) => void; big?: boolean }) {
  const refs = useRef<Record<string, SVGGElement | null>>({})
  const marker = `w1l-eco-arrow${big ? '-b' : ''}`
  const linked = new Set(selected ? relationshipsOf(selected).filter((r) => shown.includes(r.type)).flatMap((r) => [r.source, r.target]) : [])
  const move = (e: KeyboardEvent, id: string) => {
    const i = NODE_ORDER.indexOf(id)
    const to = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? NODE_ORDER.length - 1 : null
    if (to !== null) {
      e.preventDefault()
      const next = NODE_ORDER[(to + NODE_ORDER.length) % NODE_ORDER.length]
      onFocus(next)
      refs.current[next]?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(id)
    }
  }
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${LAYOUT.height}`} className={`w1l-ifig-svg w1l-eco-svg${big ? ' is-big' : ''}`} role="group" aria-label={`Stakeholder ecosystem map: ${STAKEHOLDERS.length} stakeholders in ${Object.keys(ROLE_GROUP_LABEL).length} role groups. ${statusText(shown, selected)}`}>
      <defs>
        <marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="w1l-eco-head" />
        </marker>
      </defs>
      {LAYOUT.headers.map((h) => (
        <text key={h.label} x={h.x} y={h.y} className="w1l-eco-group">
          {h.label}
        </text>
      ))}
      {RELATIONSHIPS.filter((r) => shown.includes(r.type)).map((r) => {
        const g = edgeGeometry(r)
        const cls = `${r.type === CONFLICT_TYPE ? ' is-conflict' : ''}${selected && (r.source === selected || r.target === selected) ? ' is-linked' : ''}`
        return (
          <path key={r.id} d={g.d} className={`w1l-eco-edge${cls}`} markerEnd={DIRECTED.includes(r.type) ? `url(#${marker})` : undefined} markerStart={REVERSED.includes(r.type) ? `url(#${marker})` : undefined} data-rel={r.id}>
            <title>{relWords(r)}</title>
          </path>
        )
      })}
      {LAYOUT.nodes.map((n) => {
        const lines = wrap(n.name, 19).slice(0, 2)
        const sel = n.id === selected
        return (
          <g
            key={n.id}
            ref={(el) => {
              refs.current[n.id] = el
            }}
            className={`w1l-eco-node${sel ? ' is-selected' : ''}${!sel && linked.has(n.id) ? ' is-linked' : ''}`}
            role="button"
            tabIndex={n.id === focus ? 0 : -1}
            aria-pressed={sel}
            aria-label={`${n.id} ${n.name}, ${ROLE_GROUP_LABEL[n.group]}. ${relationshipsOf(n.id).length} relationships recorded.`}
            onClick={() => (onFocus(n.id), onSelect(n.id))}
            onKeyDown={(e) => move(e, n.id)}
            data-node={n.id}
          >
            <rect x={n.x - NODE_W / 2} y={n.y - NODE_H / 2} width={NODE_W} height={NODE_H} rx="8" />
            <text x={n.x - NODE_W / 2 + 10} y={n.y - NODE_H / 2 + 19} className="w1l-eco-id">
              {n.id}
            </text>
            {lines.map((l, i) => (
              <text key={i} x={n.x - NODE_W / 2 + 10} y={n.y - NODE_H / 2 + 39 + i * 18}>
                {l}
              </text>
            ))}
          </g>
        )
      })}
      {RELATIONSHIPS.filter((r) => shown.includes(r.type)).map((r) => {
        const g = edgeGeometry(r)
        const cls = `${r.type === CONFLICT_TYPE ? ' is-conflict' : ''}${selected && (r.source === selected || r.target === selected) ? ' is-linked' : ''}`
        return (
          <g key={r.id} className={`w1l-eco-badge${cls}`} aria-hidden>
            <circle cx={g.bx} cy={g.by} r="13" />
            <text x={g.bx} y={g.by + 5} textAnchor="middle">
              {Number(r.id.slice(4))}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Detail({ selected, shown }: { selected: string | null; shown: RelationshipType[] }) {
  if (!selected)
    return (
      <div className="w1l-ifig-detail" data-testid="if6-detail">
        <p>Select a stakeholder (click it, or move with the arrow keys and press Enter) to list its concerns and relationships.</p>
      </div>
    )
  const s = STAKEHOLDERS.find((x) => x.id === selected)!
  const rels = relationshipsOf(selected)
  const hidden = rels.filter((r) => !shown.includes(r.type)).length
  return (
    <div className="w1l-ifig-detail" data-testid="if6-detail">
      <p>
        <strong>
          {s.id} {s.name}
        </strong>{' '}
        · {ROLE_GROUP_LABEL[s.roleGroup]}
      </p>
      <h4>Concerns</h4>
      <ul>
        {s.concerns.map((c) => (
          <li key={c}>
            {c} {CONCERNS.find((x) => x.id === c)!.name}
          </li>
        ))}
      </ul>
      <h4>Relationships</h4>
      {rels.length === 0 ? (
        <p>None recorded. A register records the relationships that matter; ask whether one is missing for this stakeholder.</p>
      ) : (
        <ul>
          {rels
            .filter((r) => shown.includes(r.type))
            .map((r) => (
              <li key={r.id}>{relWords(r)}</li>
            ))}
          {hidden > 0 && <li>{hidden} more hidden by the type filter.</li>}
        </ul>
      )}
    </div>
  )
}

export function TextEquivalent() {
  return (
    <>
      <table className="w1l-table">
        <caption>AeroLink stakeholder relationships, read as “A type B” (relationship types are a course convention; fictional teaching case)</caption>
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">A</th>
            <th scope="col">Type</th>
            <th scope="col">B</th>
            <th scope="col">Note</th>
          </tr>
        </thead>
        <tbody>
          {RELATIONSHIPS.map((r) => (
            <tr key={r.id}>
              <th scope="row">{r.id}</th>
              <td>
                {r.source} {nameOf(r.source)}
              </td>
              <td>{RELATIONSHIP_VERB[r.type]}</td>
              <td>
                {r.target} {nameOf(r.target)}
              </td>
              <td>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Stakeholders with no recorded relationship: {unrelated().map((s) => `${s.id} ${s.name}`).join(', ')}.
      </p>
    </>
  )
}

export default function StakeholderMap({ number }: { number: string }) {
  const [shown, setShown] = useState<RelationshipType[]>([...REL_TYPES])
  const [selected, setSelected] = useState<string | null>(null)
  const [focus, setFocus] = useState<string>(NODE_ORDER[0])
  const id = useId()
  const d = useDialog()
  const toggle = (t: RelationshipType) => setShown((s) => (s.includes(t) ? s.filter((x) => x !== t) : REL_TYPES.filter((x) => x === t || s.includes(x))))
  const select = (sid: string) => setSelected((cur) => (cur === sid ? null : sid))
  const visible = RELATIONSHIPS.filter((r) => shown.includes(r.type))
  return (
    <figure className="w1l-figure w1l-ifig" data-testid="if6-ecosystem-map" aria-labelledby={`${id}-cap`}>
      <div className="w1l-ifig-panel">
        <fieldset className="w1l-chips">
          <legend>Show relationships of type</legend>
          {REL_TYPES.map((t) => (
            <label key={t} className={`w1l-chip-toggle${shown.includes(t) ? ' is-on' : ''}${t === CONFLICT_TYPE ? ' is-conflict' : ''}`}>
              <input type="checkbox" checked={shown.includes(t)} onChange={() => toggle(t)} />
              <span>{RELATIONSHIP_VERB[t]}</span>
            </label>
          ))}
        </fieldset>
        <ReadableArt>
          <Drawing shown={shown} selected={selected} focus={focus} onFocus={setFocus} onSelect={select} />
        </ReadableArt>
        <p className="w1l-ifig-legend" data-testid="if6-legend">Arrows point in the direction of influence; a line without an arrowhead is mutual. The orange dashed line is the recorded conflict.</p>
        <div className="w1l-ifig-row">
          <label htmlFor={`${id}-sel`}>Stakeholder:</label>
          <select id={`${id}-sel`} value={selected ?? ''} onChange={(e) => setSelected(e.target.value || null)} data-testid="if6-select">
            <option value="">None selected</option>
            {STAKEHOLDERS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} {s.name}
              </option>
            ))}
          </select>
        </div>
        <p className="w1l-ifig-status" role="status" aria-live="polite" data-testid="if6-status">
          {statusText(shown, selected)}
        </p>
        <Detail selected={selected} shown={shown} />
        <div className="w1l-ifig-detail" data-testid="if6-list">
          <h4>Relationships shown (the number on each link)</h4>
          {visible.length === 0 ? (
            <p>No type is selected.</p>
          ) : (
            <ol>
              {visible.map((r) => (
                <li key={r.id} value={Number(r.id.slice(4))}>
                  {relWords(r)}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
      <figcaption id={`${id}-cap`}>
        <span className="w1l-fig-no">Figure {number}</span> Stakeholder ecosystem map: the fifteen AeroLink stakeholders by role group and their recorded relationships; the conflict is highlighted. Interactive; relationship types are a course convention; AeroLink is a fictional teaching case.
      </figcaption>
      <ExpandButton d={d} testId="if6-expand" label={`figure ${number}`} />
      <details className="w1l-textequiv" data-testid="if6-text-equivalent">
        <summary>Show text description</summary>
        <TextEquivalent />
      </details>
      <div className="w1l-print-only">
        <TextEquivalent />
      </div>
      <FigureDialog d={d} title={`Figure ${number}. Stakeholder ecosystem map`}>
        <ReadableArt big>
          <Drawing shown={shown} selected={selected} focus={focus} onFocus={setFocus} onSelect={select} big />
        </ReadableArt>
        <p className="w1l-ifig-status">{statusText(shown, selected)}</p>
      </FigureDialog>
    </figure>
  )
}
