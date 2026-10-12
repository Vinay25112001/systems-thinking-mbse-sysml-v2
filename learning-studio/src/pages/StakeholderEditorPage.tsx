import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react'
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position as HandlePosition,
  ReactFlow,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import {
  CATEGORY_LABEL,
  ENTERPRISE,
  INSTRUCTOR_EXAMPLE,
  RELATIONSHIP_LABEL,
  type RelationshipType,
  type Stakeholder,
  type StakeholderCategory,
} from '../model/airtaxi'
import { quadrant, validateStakeholderMap } from '../model/stakeholderValidation'
import { ownerProblem } from '../components/ProvenanceOwnerFields'
import { useApp, type Position } from '../state/AppState'
import { Badge, Button, Card, PageHeader, ProvenanceBadge, ReviewControls } from '../components/ui'

const CATEGORY_COLOR: Record<StakeholderCategory, string> = {
  customers: '#2f6fd6',
  regulators: '#be123c',
  investors: '#7c3aed',
  community: '#0f9d8a',
  infrastructure: '#d97706',
  safety: '#dc2626',
  workforce: '#0369a1',
  suppliers: '#4d7c0f',
}
const CATEGORIES = Object.keys(CATEGORY_LABEL) as StakeholderCategory[]
const REL_TYPES = Object.keys(RELATIONSHIP_LABEL) as RelationshipType[]

type StkNodeData = { stk?: Stakeholder; enterprise?: boolean; label: string }

function StakeholderNode({ data, selected }: NodeProps<Node<StkNodeData>>) {
  const color = data.enterprise ? '#0f172a' : CATEGORY_COLOR[data.stk!.category]
  return (
    <div
      className={`min-w-36 rounded-lg border-2 bg-white px-3 py-2 text-xs shadow-sm dark:bg-slate-900 ${selected ? 'ring-2 ring-brand-500' : ''}`}
      style={{ borderColor: color }}
    >
      <Handle type="target" position={HandlePosition.Top} />
      <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{data.enterprise ? ENTERPRISE.id : data.stk!.id}</div>
      <div className="font-semibold">{data.label}</div>
      {!data.enterprise && (
        <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
          {CATEGORY_LABEL[data.stk!.category]}
        </div>
      )}
      {data.enterprise && <div className="text-[10px] text-slate-500 dark:text-slate-400">System of interest (enterprise)</div>}
      <Handle type="source" position={HandlePosition.Bottom} />
    </div>
  )
}
const nodeTypes = { stakeholder: StakeholderNode }

function defaultPosition(index: number, total: number): Position {
  const angle = (2 * Math.PI * index) / Math.max(1, total)
  return { x: 420 + 340 * Math.cos(angle), y: 300 + 240 * Math.sin(angle) }
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function StakeholderEditorPage() {
  const app = useApp()
  const { map, instructor, resolvedTheme } = app
  const [tab, setTab] = useState<'network' | 'table' | 'grid' | 'checks'>('network')
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<StakeholderCategory>('customers')
  const [rel, setRel] = useState<{ source: string; target: string; type: RelationshipType; note: string }>({ source: '', target: '', type: 'coordinates-with', note: '' })

  const checks = useMemo(() => validateStakeholderMap(map.stakeholders, map.relationships), [map.stakeholders, map.relationships])
  const passed = checks.filter((c) => c.passed).length

  const buildNodes = useCallback((): Node<StkNodeData>[] => {
    const ent: Node<StkNodeData> = {
      id: ENTERPRISE.id,
      type: 'stakeholder',
      position: map.positions[ENTERPRISE.id] ?? { x: 420, y: 300 },
      data: { enterprise: true, label: ENTERPRISE.name },
      deletable: false,
    }
    return [
      ent,
      ...map.stakeholders.map((s, i) => ({
        id: s.id,
        type: 'stakeholder',
        position: map.positions[s.id] ?? defaultPosition(i, map.stakeholders.length),
        data: { stk: s, label: s.name },
      })),
    ]
  }, [map.positions, map.stakeholders])

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<StkNodeData>>(buildNodes())
  useEffect(() => {
    setNodes(buildNodes())
  }, [buildNodes, setNodes])

  const edges: Edge[] = map.relationships.map((r) => ({
    id: r.id,
    source: r.source,
    target: r.target,
    label: RELATIONSHIP_LABEL[r.type],
    selected: r.id === selectedEdge,
    style: { stroke: r.type === 'conflicts-with' ? '#be123c' : '#64748b', strokeDasharray: r.type === 'conflicts-with' ? '5 4' : undefined, strokeWidth: r.id === selectedEdge ? 3 : 1.5 },
    labelStyle: { fontSize: 10 },
    markerEnd: { type: MarkerType.ArrowClosed },
  }))

  const onConnect = useCallback(
    (c: Connection) => {
      if (!c.source || !c.target) return
      const id = app.addRelationship({ source: c.source, target: c.target, type: 'coordinates-with', note: '' })
      if (id) {
        setSelectedEdge(id)
        setSelected(null)
        setMessage(`Created ${id}. Choose its relationship type in the panel.`)
      } else setMessage('That relationship already exists or connects an element to itself.')
    },
    [app],
  )

  const addStakeholder = () => {
    const name = newName.trim()
    if (!name) {
      setMessage('Enter a stakeholder name first.')
      return
    }
    const id = app.addStakeholder(
      { name, category: newCategory, concern: '', interest: 3, influence: 3, rationale: '', provenance: 'student' },
      { x: 60 + Math.random() * 120, y: 40 + Math.random() * 80 },
    )
    setNewName('')
    setSelected(id)
    setSelectedEdge(null)
    setMessage(`Added ${id} (${name}). Complete its concern and rating rationale.`)
  }

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!Array.isArray(data.stakeholders) || !Array.isArray(data.relationships)) throw new Error('missing arrays')
      for (const s of data.stakeholders) {
        if (typeof s.id !== 'string' || !/^STK-\d{3}$/.test(s.id) || typeof s.name !== 'string' || !(s.category in CATEGORY_LABEL)) throw new Error(`invalid stakeholder ${JSON.stringify(s).slice(0, 60)}`)
      }
      for (const r of data.relationships) {
        if (typeof r.id !== 'string' || !(r.type in RELATIONSHIP_LABEL)) throw new Error(`invalid relationship ${JSON.stringify(r).slice(0, 60)}`)
      }
      app.loadMap({ stakeholders: data.stakeholders, relationships: data.relationships })
      setMessage(`Imported ${data.stakeholders.length} stakeholders and ${data.relationships.length} relationships.`)
    } catch (err) {
      setMessage(`Import rejected: ${(err as Error).message}`)
    }
  }

  const sel = map.stakeholders.find((s) => s.id === selected)
  const selRel = map.relationships.find((r) => r.id === selectedEdge)
  const nameOf = (id: string) => (id === ENTERPRISE.id ? ENTERPRISE.name : map.stakeholders.find((s) => s.id === id)?.name ?? id)
  const endpoints = [{ id: ENTERPRISE.id, name: ENTERPRISE.name }, ...map.stakeholders.map((s) => ({ id: s.id, name: `${s.id} ${s.name}` }))]
  const input = 'w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950'

  return (
    <div className="space-y-4">
      <PageHeader
        title="Stakeholder ecosystem editor"
        subtitle="Lab L2 / checkpoint CP1. Identify, characterise and relate AeroLink’s stakeholders. Stable IDs (STK-nnn) are never reused, so this map can be traced into the SysML model in Part II. This is a teaching editor, not a SysML tool."
      >
        <Badge tone={passed === checks.length ? 'emerald' : 'amber'}>
          Acceptance checks: {passed}/{checks.length}
        </Badge>
      </PageHeader>

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="block text-xs text-slate-500 dark:text-slate-400">New stakeholder name</span>
            <input className={input} value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStakeholder()} placeholder="e.g. Air navigation service provider" />
          </label>
          <label className="text-sm">
            <span className="block text-xs text-slate-500 dark:text-slate-400">Category</span>
            <select className={input} value={newCategory} onChange={(e) => setNewCategory(e.target.value as StakeholderCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={addStakeholder}>Add stakeholder</Button>
          <Button variant="secondary" onClick={() => download('aerolink-stakeholder-map.json', JSON.stringify({ format: 'sysml-studio/stakeholder-map@1', exported: new Date().toISOString(), stakeholders: map.stakeholders, relationships: map.relationships }, null, 2))}>
            Export JSON
          </Button>
          <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
            Import JSON
            <input type="file" accept="application/json,.json" className="sr-only" onChange={onImport} />
          </label>
          {!confirmReset ? (
            <Button variant="ghost" onClick={() => setConfirmReset(true)}>
              Reset to lab start
            </Button>
          ) : (
            <span className="flex items-center gap-2 text-sm">
              Discard your map?
              <Button
                variant="danger"
                onClick={() => {
                  app.resetMap()
                  setConfirmReset(false)
                  setSelected(null)
                  setSelectedEdge(null)
                  setMessage('Map reset to the six lab-sheet stakeholders. Previously issued IDs are not reused.')
                }}
              >
                Yes, reset
              </Button>
              <Button variant="secondary" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
            </span>
          )}
          {instructor && (
            <Button
              variant="secondary"
              onClick={() => {
                app.loadMap(INSTRUCTOR_EXAMPLE)
                setMessage('Loaded the instructor example (teaching content) for calibration.')
              }}
            >
              Load instructor example
            </Button>
          )}
        </div>
        {message && (
          <p role="status" className="mt-3 text-sm text-slate-700 dark:text-slate-300" data-testid="editor-message">
            {message}
          </p>
        )}
      </Card>

      <div role="tablist" aria-label="Editor views" className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800">
        {(
          [
            ['network', 'Network diagram'],
            ['table', 'Table (keyboard-accessible)'],
            ['grid', 'Influence–interest grid'],
            ['checks', `Acceptance checks (${passed}/${checks.length})`],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`rounded-t-md px-3 py-2 text-sm ${tab === k ? 'border border-b-0 border-slate-200 bg-white font-semibold dark:border-slate-800 dark:bg-slate-900' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'network' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="h-[600px] rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" data-testid="stakeholder-canvas">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onNodeDragStop={(_, n) => app.setPosition(n.id, n.position)}
              onConnect={onConnect}
              onNodeClick={(_, n) => {
                setSelected(n.id === ENTERPRISE.id ? null : n.id)
                setSelectedEdge(null)
              }}
              onEdgeClick={(_, e) => {
                setSelectedEdge(e.id)
                setSelected(null)
              }}
              onNodesDelete={(ns) => ns.forEach((n) => n.id !== ENTERPRISE.id && app.deleteStakeholder(n.id))}
              onEdgesDelete={(es) => es.forEach((e) => app.deleteRelationship(e.id))}
              fitView
              colorMode={resolvedTheme}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
          <aside className="space-y-3" aria-label="Selection details">
            <Card>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag from a node’s bottom handle to another node to create a relationship. Select a node or edge to edit it. Use the table view for keyboard-only editing.
              </p>
            </Card>
            {sel && (
              <Card>
                <StakeholderForm s={sel} onDelete={() => { app.deleteStakeholder(sel.id); setSelected(null); setMessage(`Deleted ${sel.id}; its relationships were removed with it. The ID will not be reused.`) }} />
              </Card>
            )}
            {selRel && (
              <Card>
                <h3 className="font-semibold">
                  {selRel.id}: {nameOf(selRel.source)} → {nameOf(selRel.target)}
                </h3>
                <label className="mt-2 block text-sm">
                  <span className="block text-xs text-slate-500 dark:text-slate-400">Relationship type</span>
                  <select className={input} value={selRel.type} onChange={(e) => app.updateRelationship(selRel.id, { type: e.target.value as RelationshipType })}>
                    {REL_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {RELATIONSHIP_LABEL[t]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-2 block text-sm">
                  <span className="block text-xs text-slate-500 dark:text-slate-400">Note</span>
                  <input className={input} value={selRel.note} onChange={(e) => app.updateRelationship(selRel.id, { note: e.target.value })} />
                </label>
                <div className="mt-3">
                  <Button variant="danger" onClick={() => { app.deleteRelationship(selRel.id); setSelectedEdge(null) }}>
                    Delete relationship
                  </Button>
                </div>
              </Card>
            )}
          </aside>
        </div>
      )}

      {tab === 'table' && (
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold">Stakeholders</h2>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-800">
                    <th className="py-1 pr-2">ID</th>
                    <th className="py-1 pr-2">Name</th>
                    <th className="py-1 pr-2">Category</th>
                    <th className="py-1 pr-2">Concern</th>
                    <th className="py-1 pr-2">Interest</th>
                    <th className="py-1 pr-2">Influence</th>
                    <th className="py-1 pr-2">Rating rationale</th>
                    <th className="py-1 pr-2">Source</th>
                    <th className="py-1" />
                  </tr>
                </thead>
                <tbody>
                  {map.stakeholders.map((s) => (
                    <tr key={s.id} className="border-b border-slate-100 align-top dark:border-slate-800">
                      <td className="py-1 pr-2 font-mono text-xs">{s.id}</td>
                      <td className="py-1 pr-2"><input aria-label={`Name of ${s.id}`} className={input} value={s.name} onChange={(e) => app.updateStakeholder(s.id, { name: e.target.value })} /></td>
                      <td className="py-1 pr-2">
                        <select aria-label={`Category of ${s.id}`} className={input} value={s.category} onChange={(e) => app.updateStakeholder(s.id, { category: e.target.value as StakeholderCategory })}>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                        </select>
                      </td>
                      <td className="py-1 pr-2"><input aria-label={`Concern of ${s.id}`} className={input} value={s.concern} onChange={(e) => app.updateStakeholder(s.id, { concern: e.target.value })} /></td>
                      <td className="py-1 pr-2"><input aria-label={`Interest of ${s.id}`} type="number" min={1} max={5} className={`${input} w-16`} value={s.interest} onChange={(e) => app.updateStakeholder(s.id, { interest: Number(e.target.value) })} /></td>
                      <td className="py-1 pr-2"><input aria-label={`Influence of ${s.id}`} type="number" min={1} max={5} className={`${input} w-16`} value={s.influence} onChange={(e) => app.updateStakeholder(s.id, { influence: Number(e.target.value) })} /></td>
                      <td className="py-1 pr-2"><input aria-label={`Rating rationale of ${s.id}`} className={input} value={s.rationale} onChange={(e) => app.updateStakeholder(s.id, { rationale: e.target.value })} /></td>
                      <td className="py-1 pr-2"><ProvenanceBadge value={s.provenance} /></td>
                      <td className="py-1"><Button variant="ghost" ariaLabel={`Delete ${s.id}`} onClick={() => app.deleteStakeholder(s.id)}>Delete</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold">Relationships</h2>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <label className="text-sm">
                <span className="block text-xs text-slate-500 dark:text-slate-400">From</span>
                <select aria-label="Relationship source" className={input} value={rel.source} onChange={(e) => setRel({ ...rel, source: e.target.value })}>
                  <option value="">Choose…</option>
                  {endpoints.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-xs text-slate-500 dark:text-slate-400">Relationship</span>
                <select aria-label="Relationship type" className={input} value={rel.type} onChange={(e) => setRel({ ...rel, type: e.target.value as RelationshipType })}>
                  {REL_TYPES.map((t) => <option key={t} value={t}>{RELATIONSHIP_LABEL[t]}</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-xs text-slate-500 dark:text-slate-400">To</span>
                <select aria-label="Relationship target" className={input} value={rel.target} onChange={(e) => setRel({ ...rel, target: e.target.value })}>
                  <option value="">Choose…</option>
                  {endpoints.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-xs text-slate-500 dark:text-slate-400">Note</span>
                <input aria-label="Relationship note" className={input} value={rel.note} onChange={(e) => setRel({ ...rel, note: e.target.value })} />
              </label>
              <Button
                onClick={() => {
                  if (!rel.source || !rel.target) return setMessage('Choose both ends of the relationship.')
                  const id = app.addRelationship(rel)
                  setMessage(id ? `Added ${id}.` : 'That relationship already exists or connects an element to itself.')
                  if (id) setRel({ source: '', target: '', type: 'coordinates-with', note: '' })
                }}
              >
                Add relationship
              </Button>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {map.relationships.length === 0 && <li className="text-slate-500 dark:text-slate-400">No relationships yet.</li>}
              {map.relationships.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs">{r.id}</span>
                  <span>
                    {nameOf(r.source)} <strong>{RELATIONSHIP_LABEL[r.type]}</strong> {nameOf(r.target)}
                    {r.note && <span className="text-slate-500 dark:text-slate-400"> — {r.note}</span>}
                  </span>
                  <Button variant="ghost" ariaLabel={`Delete ${r.id}`} onClick={() => app.deleteRelationship(r.id)}>Delete</Button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'grid' && (
        <Card>
          <h2 className="font-semibold">Influence–interest grid</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            A power–interest grid (commonly attributed to Mendelow) is an external convention: it is not in the course source collection and is used here as a
            prioritisation aid only. Ratings are your team’s judgements; justify each one in the rationale column.
          </p>
          <div className="mt-4 grid grid-cols-[auto,1fr] gap-2">
            <div className="flex items-center text-xs font-semibold [writing-mode:vertical-rl] rotate-180">Influence →</div>
            <div>
              <div className="grid grid-cols-2 gap-2">
                {(['Keep satisfied', 'Manage closely', 'Monitor', 'Keep informed'] as const).map((q) => (
                  <div key={q} className="min-h-32 rounded-lg border border-slate-200 p-2 dark:border-slate-800" data-testid={`quadrant-${q}`}>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{q}</p>
                    <ul className="mt-1 flex flex-wrap gap-1">
                      {map.stakeholders.filter((s) => quadrant(s) === q).map((s) => (
                        <li key={s.id} className="rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: CATEGORY_COLOR[s.category] }}>
                          {s.name} <span className="text-slate-500 dark:text-slate-400">({s.interest}/{s.influence})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-center text-xs font-semibold">Interest →</p>
            </div>
          </div>
        </Card>
      )}

      {tab === 'checks' && (
        <Card>
          <h2 className="font-semibold">Acceptance checks</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">From the Lab L2 / CP1 minimum scope. Passing every check is necessary for CP1 but not sufficient: the rubric (RB-1) also judges quality.</p>
          <ul className="mt-3 space-y-2" data-testid="checks-list">
            {checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-sm">
                <span aria-hidden="true" className={c.passed ? 'text-emerald-600' : 'text-rose-600'}>{c.passed ? '✓' : '✗'}</span>
                <span>
                  <span className="sr-only">{c.passed ? 'Passed: ' : 'Not yet passed: '}</span>
                  <strong>{c.label}</strong> — {c.detail} <span className="text-xs text-slate-500 dark:text-slate-400">({c.source})</span>
                </span>
              </li>
            ))}
          </ul>
          <ReviewControls id="stakeholder-checks" label="Stakeholder acceptance checks" />
        </Card>
      )}
    </div>
  )
}

function StakeholderForm({ s, onDelete }: { s: Stakeholder; onDelete: () => void }) {
  const app = useApp()
  const input = 'w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950'
  return (
    <div className="space-y-2 text-sm" data-testid="stakeholder-form">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{s.id}</h3>
        <ProvenanceBadge value={s.provenance} />
      </div>
      <label className="block">
        <span className="block text-xs text-slate-500 dark:text-slate-400">Name</span>
        <input className={input} value={s.name} onChange={(e) => app.updateStakeholder(s.id, { name: e.target.value })} />
      </label>
      {(s.provenance === 'student' || s.provenance === 'AI-suggested-reviewed') && (
        <div className="grid grid-cols-2 items-end gap-2">
          <label>
            <span className="block text-xs text-slate-500 dark:text-slate-400">Owner (initials)</span>
            <input className={input} value={s.owner ?? ''} aria-invalid={!!s.owner && !!ownerProblem(s.owner)} onChange={(e) => app.updateStakeholder(s.id, { owner: e.target.value })} placeholder="e.g. JS" />
          </label>
          <label className="flex items-center gap-2 pb-1">
            <input type="checkbox" checked={s.provenance === 'AI-suggested-reviewed'} onChange={(e) => app.updateStakeholder(s.id, { provenance: e.target.checked ? 'AI-suggested-reviewed' : 'student' })} />
            <span className="text-xs">AI-suggested, reviewed by the owner</span>
          </label>
          {s.owner && ownerProblem(s.owner) && <p role="alert" className="col-span-2 text-xs text-rose-700 dark:text-rose-300">{ownerProblem(s.owner)}</p>}
        </div>
      )}
      <label className="block">
        <span className="block text-xs text-slate-500 dark:text-slate-400">Category</span>
        <select className={input} value={s.category} onChange={(e) => app.updateStakeholder(s.id, { category: e.target.value as StakeholderCategory })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="block text-xs text-slate-500 dark:text-slate-400">Specific concern</span>
        <textarea className={input} rows={2} value={s.concern} onChange={(e) => app.updateStakeholder(s.id, { concern: e.target.value })} />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="block text-xs text-slate-500 dark:text-slate-400">Interest (1–5)</span>
          <input type="number" min={1} max={5} className={input} value={s.interest} onChange={(e) => app.updateStakeholder(s.id, { interest: Number(e.target.value) })} />
        </label>
        <label>
          <span className="block text-xs text-slate-500 dark:text-slate-400">Influence (1–5)</span>
          <input type="number" min={1} max={5} className={input} value={s.influence} onChange={(e) => app.updateStakeholder(s.id, { influence: Number(e.target.value) })} />
        </label>
      </div>
      <label className="block">
        <span className="block text-xs text-slate-500 dark:text-slate-400">Rating rationale</span>
        <textarea className={input} rows={2} value={s.rationale} onChange={(e) => app.updateStakeholder(s.id, { rationale: e.target.value })} />
      </label>
      <p className="text-xs text-slate-500 dark:text-slate-400">Quadrant: {quadrant(s)}</p>
      <Button variant="danger" onClick={onDelete}>Delete stakeholder</Button>
    </div>
  )
}
