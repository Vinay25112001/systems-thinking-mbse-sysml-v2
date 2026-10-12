// The student's AeroLink engineering workspace: one persisted model shared by every week's tools.
// Stakeholders are owned by the stakeholder editor (AppState map) and appear here as STK elements, so each element
// has a single source. IDs are never reused: the highest number ever issued per prefix is remembered.
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { usePersistentState } from '../lib/usePersistentState'
import { LINK_RULES, kindOfId, nextId, validateModel, type Element, type EngineeringModel, type Link, type LinkType } from '../model/engineering'
import { referenceUpTo } from '../model/reference'
import { INSTRUCTOR_EXAMPLE } from '../model/airtaxi'
import { useApp } from './AppState'

type Stored = { elements: Element[]; links: Link[]; issued: Record<string, number> }
const EMPTY: Stored = { elements: [], links: [], issued: {} }

export type NewElement = Omit<Element, 'id' | 'status'> & { reqLevel?: 'STK' | 'SYS' }

/** One atomic change: new elements (each with a local `key`) and links whose ends are existing IDs or those keys. */
export type Batch = {
  elements?: (NewElement & { key: string })[]
  links?: { source: string; type: LinkType; target: string; rationale?: string }[]
}

type Workspace = {
  model: EngineeringModel
  /** Create several elements and links in one update; returns the IDs issued for each key, or the first error (nothing is applied). */
  apply: (b: Batch) => { ids: Record<string, string>; linkIds: string[]; error?: string }
  addElement: (e: NewElement) => string
  updateElement: (id: string, patch: Partial<Omit<Element, 'id' | 'kind'>>) => void
  retireElement: (id: string, reason: string) => void
  addLink: (source: string, type: LinkType, target: string, rationale?: string) => { id?: string; error?: string }
  removeLink: (id: string) => void
  loadReference: (upToWeek: number) => void
  replaceAll: (m: EngineeringModel) => void
  reset: () => void
}

const Ctx = createContext<Workspace | null>(null)

const numberOf = (id: string) => parseInt(id.slice(id.lastIndexOf('-') + 1), 10) || 0
const prefixOf = (id: string) => id.slice(0, id.lastIndexOf('-'))
const bump = (issued: Record<string, number>, id: string) => ({ ...issued, [prefixOf(id)]: Math.max(issued[prefixOf(id)] ?? 0, numberOf(id)) })

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { map, loadMap } = useApp()
  const [ws, setWs] = usePersistentState<Stored>('workspace-model', EMPTY)

  const stakeholders = useMemo<Element[]>(
    () =>
      map.stakeholders.map((s) => ({
        id: s.id,
        kind: 'STK',
        name: s.name,
        text: s.concern,
        attributes: { category: s.category, interest: s.interest, influence: s.influence },
        provenance: s.provenance === 'official-S04' ? 'official-S04' : s.provenance === 'student' ? 'team-derived' : s.provenance === 'AI-suggested-reviewed' ? 'AI-suggested-reviewed' : 'instructor-reference',
        owner: s.owner,
        status: 'active',
      })),
    [map.stakeholders],
  )
  const model = useMemo<EngineeringModel>(() => ({ elements: [...stakeholders, ...ws.elements], links: ws.links }), [stakeholders, ws])

  const addElement = useCallback(
    ({ reqLevel, ...e }: NewElement) => {
      if (e.kind === 'STK') throw new Error('Stakeholders are created in the stakeholder editor')
      const id = nextId(e.kind, model, ws.issued, reqLevel)
      setWs((s) => ({ ...s, elements: [...s.elements, { ...e, id, status: 'active' }], issued: bump(s.issued, id) }))
      return id
    },
    [model, ws.issued, setWs],
  )

  const updateElement = useCallback(
    (id: string, patch: Partial<Omit<Element, 'id' | 'kind'>>) => setWs((s) => ({ ...s, elements: s.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
    [setWs],
  )
  const retireElement = useCallback(
    (id: string, reason: string) => setWs((s) => ({ ...s, elements: s.elements.map((e) => (e.id === id ? { ...e, status: 'retired', retiredReason: reason } : e)) })),
    [setWs],
  )

  const addLink = useCallback(
    (source: string, type: LinkType, target: string, rationale?: string) => {
      const sk = model.elements.find((e) => e.id === source)?.kind ?? kindOfId(source)
      const tk = model.elements.find((e) => e.id === target)?.kind ?? kindOfId(target)
      const rule = LINK_RULES[type]
      if (!sk || !tk || !model.elements.some((e) => e.id === source) || !model.elements.some((e) => e.id === target)) return { error: 'Both ends must be existing elements' }
      if (!rule.from.includes(sk) || !rule.to.includes(tk)) return { error: `${sk} ${rule.reads} ${tk} is not an allowed relationship` }
      if (model.links.some((l) => l.source === source && l.type === type && l.target === target)) return { error: 'That link already exists' }
      const id = `LNK-${String((ws.issued.LNK ?? 0) + 1).padStart(3, '0')}`
      setWs((s) => ({ ...s, links: [...s.links, { id, source, type, target, rationale }], issued: { ...s.issued, LNK: (s.issued.LNK ?? 0) + 1 } }))
      return { id }
    },
    [model, ws.issued, setWs],
  )
  const apply = useCallback(
    (b: Batch) => {
      const ids: Record<string, string> = {}
      const issued = { ...ws.issued }
      const newEls: Element[] = []
      for (const { key, reqLevel, ...e } of b.elements ?? []) {
        if (e.kind === 'STK') return { ids: {}, linkIds: [], error: 'Stakeholders are created in the stakeholder editor' }
        const id = nextId(e.kind, { elements: [...model.elements, ...newEls], links: [] }, issued, reqLevel)
        Object.assign(issued, bump(issued, id))
        ids[key] = id
        newEls.push({ ...e, id, status: 'active' })
      }
      const all = [...model.elements, ...newEls]
      const resolve = (x: string) => ids[x] ?? x
      const newLinks: Link[] = []
      let lnk = issued.LNK ?? 0
      for (const l of b.links ?? []) {
        const source = resolve(l.source)
        const target = resolve(l.target)
        const sk = all.find((e) => e.id === source)?.kind
        const tk = all.find((e) => e.id === target)?.kind
        const rule = LINK_RULES[l.type]
        if (!sk || !tk) return { ids: {}, linkIds: [], error: `Link ${l.source} → ${l.target}: both ends must exist` }
        if (!rule.from.includes(sk) || !rule.to.includes(tk)) return { ids: {}, linkIds: [], error: `${sk} ${rule.reads} ${tk} is not an allowed relationship` }
        if ([...model.links, ...newLinks].some((x) => x.source === source && x.type === l.type && x.target === target)) continue
        lnk += 1
        newLinks.push({ id: `LNK-${String(lnk).padStart(3, '0')}`, source, type: l.type, target, rationale: l.rationale })
      }
      issued.LNK = lnk
      setWs((s) => ({ elements: [...s.elements, ...newEls], links: [...s.links, ...newLinks], issued: { ...s.issued, ...issued } }))
      return { ids, linkIds: newLinks.map((l) => l.id) }
    },
    [model, ws.issued, setWs],
  )
  const removeLink = useCallback((id: string) => setWs((s) => ({ ...s, links: s.links.filter((l) => l.id !== id) })), [setWs])

  const replaceAll = useCallback(
    (m: EngineeringModel) => {
      const elements = m.elements.filter((e) => e.kind !== 'STK')
      const issued = elements.reduce<Record<string, number>>((acc, e) => bump(acc, e.id), { LNK: m.links.reduce((a, l) => Math.max(a, numberOf(l.id)), 0) })
      setWs((s) => {
        const merged = { ...issued }
        for (const [k, v] of Object.entries(s.issued)) merged[k] = Math.max(merged[k] ?? 0, v)
        return { elements, links: m.links, issued: merged }
      })
    },
    [setWs],
  )
  // The reference's stakeholders live in the stakeholder editor, so loading the reference also loads the
  // instructor stakeholder example there (otherwise CON/NEED links would dangle).
  const loadReference = useCallback(
    (w: number) => {
      if (w >= 2) loadMap({ stakeholders: INSTRUCTOR_EXAMPLE.stakeholders, relationships: INSTRUCTOR_EXAMPLE.relationships })
      replaceAll(referenceUpTo(w))
    },
    [replaceAll, loadMap],
  )
  const reset = useCallback(() => setWs((s) => ({ ...EMPTY, issued: s.issued })), [setWs])

  const value = useMemo(
    () => ({ model, apply, addElement, updateElement, retireElement, addLink, removeLink, loadReference, replaceAll, reset }),
    [model, apply, addElement, updateElement, retireElement, addLink, removeLink, loadReference, replaceAll, reset],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useWorkspace(): Workspace {
  const v = useContext(Ctx)
  if (!v) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return v
}

export function useModelIssues() {
  const { model } = useWorkspace()
  return useMemo(() => validateModel(model), [model])
}
