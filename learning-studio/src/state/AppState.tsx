import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { usePersistentState } from '../lib/usePersistentState'
import {
  nextRelationshipId,
  SEED_STAKEHOLDERS,
  type Relationship,
  type Stakeholder,
} from '../model/airtaxi'

export type ThemePref = 'light' | 'dark' | 'system'
export type ReviewStatus = 'pending' | 'approved' | 'changes-requested'
export type ReviewRecord = { status: ReviewStatus; note: string; at: string }
export type QuizRecord = { selected: string; correct: boolean; attempts: number }
export type Position = { x: number; y: number }

export type MapState = {
  stakeholders: Stakeholder[]
  relationships: Relationship[]
  positions: Record<string, Position>
  issuedMax: number // highest STK number ever issued: IDs are never reused
}

const initialMap = (): MapState => ({
  stakeholders: SEED_STAKEHOLDERS.map((s) => ({ ...s })),
  relationships: [],
  positions: {},
  issuedMax: SEED_STAKEHOLDERS.length,
})

type AppState = {
  theme: ThemePref
  setTheme: (t: ThemePref) => void
  resolvedTheme: 'light' | 'dark'
  instructor: boolean
  setInstructor: (v: boolean) => void
  reviews: Record<string, ReviewRecord>
  setReview: (id: string, r: Omit<ReviewRecord, 'at'>) => void
  completed: Record<string, boolean>
  toggleCompleted: (id: string) => void
  quiz: Record<string, QuizRecord>
  answerQuiz: (qid: string, optionId: string, correct: boolean) => void
  resetQuiz: (ids: string[]) => void
  boundary: Record<string, string>
  setBoundary: (id: string, value: string) => void
  /** Replaces every boundary classification at once (workbench undo / redo). */
  replaceBoundary: (b: Record<string, string>) => void
  map: MapState
  addStakeholder: (s: Omit<Stakeholder, 'id'>, position?: Position) => string
  updateStakeholder: (id: string, patch: Partial<Stakeholder>) => void
  deleteStakeholder: (id: string) => void
  addRelationship: (r: Omit<Relationship, 'id'>) => string | null
  updateRelationship: (id: string, patch: Partial<Relationship>) => void
  deleteRelationship: (id: string) => void
  setPosition: (id: string, p: Position) => void
  loadMap: (m: Pick<MapState, 'stakeholders' | 'relationships'>) => void
  /** Restores stakeholders and relationships (workbench undo / redo); node positions and issued IDs are kept. */
  restoreMap: (m: Pick<MapState, 'stakeholders' | 'relationships'>) => void
  resetMap: () => void
}

const Ctx = createContext<AppState | null>(null)

function systemDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = usePersistentState<ThemePref>('theme', 'system')
  const [instructor, setInstructor] = usePersistentState<boolean>('instructor', false)
  const [reviews, setReviews] = usePersistentState<Record<string, ReviewRecord>>('reviews', {})
  const [completed, setCompleted] = usePersistentState<Record<string, boolean>>('completed', {})
  const [quiz, setQuiz] = usePersistentState<Record<string, QuizRecord>>('quiz', {})
  const [boundary, setBoundaryState] = usePersistentState<Record<string, string>>('boundary', {})
  const [map, setMap] = usePersistentState<MapState>('stakeholder-map', initialMap)

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemDark() ? 'dark' : 'light') : theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    document.documentElement.style.colorScheme = resolvedTheme
  }, [resolvedTheme])

  const setReview = useCallback(
    (id: string, r: Omit<ReviewRecord, 'at'>) => setReviews((prev) => ({ ...prev, [id]: { ...r, at: new Date().toISOString() } })),
    [setReviews],
  )
  const toggleCompleted = useCallback((id: string) => setCompleted((prev) => ({ ...prev, [id]: !prev[id] })), [setCompleted])
  const answerQuiz = useCallback(
    (qid: string, optionId: string, correct: boolean) =>
      setQuiz((prev) => ({ ...prev, [qid]: { selected: optionId, correct, attempts: (prev[qid]?.attempts ?? 0) + 1 } })),
    [setQuiz],
  )
  const resetQuiz = useCallback(
    (ids: string[]) =>
      setQuiz((prev) => {
        const next = { ...prev }
        ids.forEach((i) => delete next[i])
        return next
      }),
    [setQuiz],
  )
  const setBoundary = useCallback((id: string, value: string) => setBoundaryState((prev) => ({ ...prev, [id]: value })), [setBoundaryState])
  const replaceBoundary = useCallback((b: Record<string, string>) => setBoundaryState({ ...b }), [setBoundaryState])

  const addStakeholder = useCallback(
    (s: Omit<Stakeholder, 'id'>, position?: Position) => {
      // ID computed from the current state (not inside the updater) so the caller receives it synchronously
      const n = Math.max(map.issuedMax, ...map.stakeholders.map((x) => parseInt(x.id.slice(4), 10) || 0)) + 1
      const newId = `STK-${String(n).padStart(3, '0')}`
      setMap((m) => ({
        ...m,
        issuedMax: Math.max(m.issuedMax, n),
        stakeholders: [...m.stakeholders, { ...s, id: newId }],
        positions: position ? { ...m.positions, [newId]: position } : m.positions,
      }))
      return newId
    },
    [map, setMap],
  )
  const updateStakeholder = useCallback(
    (id: string, patch: Partial<Stakeholder>) =>
      setMap((m) => ({ ...m, stakeholders: m.stakeholders.map((s) => (s.id === id ? { ...s, ...patch, id: s.id } : s)) })),
    [setMap],
  )
  const deleteStakeholder = useCallback(
    (id: string) =>
      setMap((m) => {
        const positions = { ...m.positions }
        delete positions[id]
        return {
          ...m,
          positions,
          stakeholders: m.stakeholders.filter((s) => s.id !== id),
          // cascade: relationships to a deleted stakeholder are removed with it
          relationships: m.relationships.filter((r) => r.source !== id && r.target !== id),
        }
      }),
    [setMap],
  )
  const addRelationship = useCallback(
    (r: Omit<Relationship, 'id'>) => {
      if (r.source === r.target) return null
      if (map.relationships.some((x) => x.source === r.source && x.target === r.target && x.type === r.type)) return null
      const newId = nextRelationshipId(map.relationships)
      setMap((m) => ({ ...m, relationships: [...m.relationships, { ...r, id: newId }] }))
      return newId
    },
    [map, setMap],
  )
  const updateRelationship = useCallback(
    (id: string, patch: Partial<Relationship>) =>
      setMap((m) => ({ ...m, relationships: m.relationships.map((r) => (r.id === id ? { ...r, ...patch, id: r.id } : r)) })),
    [setMap],
  )
  const deleteRelationship = useCallback(
    (id: string) => setMap((m) => ({ ...m, relationships: m.relationships.filter((r) => r.id !== id) })),
    [setMap],
  )
  const setPosition = useCallback((id: string, p: Position) => setMap((m) => ({ ...m, positions: { ...m.positions, [id]: p } })), [setMap])
  const loadMap = useCallback(
    (next: Pick<MapState, 'stakeholders' | 'relationships'>) =>
      setMap((m) => ({
        stakeholders: next.stakeholders.map((s) => ({ ...s })),
        relationships: next.relationships.map((r) => ({ ...r })),
        positions: {},
        issuedMax: Math.max(m.issuedMax, ...next.stakeholders.map((s) => parseInt(s.id.slice(4), 10) || 0)),
      })),
    [setMap],
  )
  const restoreMap = useCallback(
    (next: Pick<MapState, 'stakeholders' | 'relationships'>) =>
      setMap((m) => ({ ...m, stakeholders: next.stakeholders.map((s) => ({ ...s })), relationships: next.relationships.map((r) => ({ ...r })) })),
    [setMap],
  )
  const resetMap = useCallback(() => setMap((m) => ({ ...initialMap(), issuedMax: Math.max(m.issuedMax, SEED_STAKEHOLDERS.length) })), [setMap])

  const value = useMemo<AppState>(
    () => ({
      theme, setTheme, resolvedTheme, instructor, setInstructor, reviews, setReview, completed, toggleCompleted,
      quiz, answerQuiz, resetQuiz, boundary, setBoundary, replaceBoundary, map, addStakeholder, updateStakeholder, deleteStakeholder,
      addRelationship, updateRelationship, deleteRelationship, setPosition, loadMap, restoreMap, resetMap,
    }),
    [theme, setTheme, resolvedTheme, instructor, setInstructor, reviews, setReview, completed, toggleCompleted, quiz, answerQuiz,
      resetQuiz, boundary, setBoundary, replaceBoundary, map, addStakeholder, updateStakeholder, deleteStakeholder, addRelationship,
      updateRelationship, deleteRelationship, setPosition, loadMap, restoreMap, resetMap],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside AppStateProvider')
  return v
}
