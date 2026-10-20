// My Project routes (roadmap §2.2), matched in App.tsx before the week routes and rendered lazily in their own shell.
//   #/project                    Overview (or the create screen when no project exists)
//   #/project/milestones[/:week] Milestones; Week 1 in full, Weeks 2–14 as upcoming with their expected artifacts
//   #/project/artifacts[/:type]  Artifact library (P1: ENT, MGO, PRT, EXT, STK, CON, NEED, and relationships REL/LNK)
//   #/project/artifact/:id       Artifact page (by course ID)
//   #/project/history            Change log and versions
//   #/project/transfer           Export, import, project switcher
//   #/project/model              Week 8 preview (read-only in P1)
export type ProjectPage = 'overview' | 'milestones' | 'artifacts' | 'artifact' | 'history' | 'transfer' | 'model'
export type ProjectRoute = { page: ProjectPage; param?: string }

export function projectRoute(path: string): ProjectRoute | null {
  const p = path.replace(/\/+$/, '')
  if (p === '/project') return { page: 'overview' }
  const m = /^\/project\/(milestones|artifacts|artifact|history|transfer|model)(?:\/([^/]+))?$/.exec(p)
  if (!m) return null
  const page = m[1] as ProjectPage
  if (page === 'artifact' && !m[2]) return { page: 'artifacts' }
  if ((page === 'history' || page === 'transfer' || page === 'model') && m[2]) return null
  return { page, ...(m[2] ? { param: decodeURIComponent(m[2]) } : {}) }
}

export const PROJECT_TABS: { page: ProjectPage; label: string; to: string }[] = [
  { page: 'overview', label: 'Overview', to: '/project' },
  { page: 'milestones', label: 'Milestones', to: '/project/milestones' },
  { page: 'artifacts', label: 'Artifacts', to: '/project/artifacts' },
  { page: 'history', label: 'History', to: '/project/history' },
  { page: 'transfer', label: 'Export and import', to: '/project/transfer' },
  { page: 'model', label: 'Week 8 preview', to: '/project/model' },
]
