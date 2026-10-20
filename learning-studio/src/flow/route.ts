// Week 1 flow routes (kept out of the lazy flow chunk so App can route without loading it).
export type FlowStage = 'overview' | 'learn' | 'practice' | 'check'

/** Parses a flow route; null when the path is not part of the Week 1 flow (e.g. /week/1/classic). */
export function flowRoute(path: string): { stage: FlowStage; section?: string } | null {
  const p = path.replace(/\/+$/, '')
  if (p === '/week/1' || p === '/week/1/overview') return { stage: 'overview' }
  const m = p.match(/^\/week\/1\/(learn|practice|check)(?:\/([a-z0-9-]+))?$/)
  if (!m) return null
  if (m[1] !== 'learn' && m[2]) return null
  return { stage: m[1] as FlowStage, section: m[2] }
}

export const STAGES: { id: FlowStage; label: string; short: string; sub: string }[] = [
  { id: 'overview', label: 'Overview', short: 'Overview', sub: 'Question and goals' },
  { id: 'learn', label: 'Learn', short: 'Learn', sub: 'Seven short sections' },
  { id: 'practice', label: 'Practice', short: 'Practice', sub: 'Workbench missions' },
  { id: 'check', label: 'Check & submit', short: 'Check', sub: 'Quiz, Team Record' },
]
export const stagePath = (s: FlowStage) => (s === 'overview' ? '/week/1' : `/week/1/${s}`)


/** American display of a Bloom label (the shared course type keeps the value 'Analyse'; faculty feedback item 8). */
export const bloomLabel = (b: string) => (b === 'Analyse' ? 'Analyze' : b)
