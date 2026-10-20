// While a project exists, the pages that still read the Week 1 Team Record from the workbench artefacts (the lab page's
// readiness panel, the Week 2 tool's "use the Week 1 record saved in this browser", the Week 1 missions and checks)
// see the project's Week 1 record: this component writes the projection into `wb-artefacts['w1.team']` after every
// change. It is a derived, read-only copy for those readers until they read the project directly (P2); the project
// never reads it back. The record found there before the first mirror is kept once under LEGACY_BACKUP_KEY (never
// overwritten), so nothing a student had is lost; My Project offers it under Export and import.
import { useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { LEGACY_BACKUP_KEY } from '../project/adapters/legacy'
import { recordHasContent, toTeamRecord } from '../project/adapters/week1'
import { useProjectState } from '../project/store/ProjectProvider'
import { normalizeTeam, TEAM_KEY } from '../workbench/week1/team'

export function ProjectLegacyMirror() {
  const { doc } = useProjectState()
  useEffect(() => {
    if (!doc) return
    const art = loadJSON<Record<string, unknown>>('wb-artefacts', {})
    const projected = toTeamRecord(doc)
    const stored = art[TEAM_KEY]
    if (JSON.stringify(stored) === JSON.stringify(projected)) return
    const prev = normalizeTeam(stored)
    if (stored && recordHasContent(prev) && loadJSON<unknown>(LEGACY_BACKUP_KEY, null) === null) saveJSON(LEGACY_BACKUP_KEY, { savedAt: new Date().toISOString(), record: stored })
    saveJSON('wb-artefacts', { ...art, [TEAM_KEY]: projected })
  }, [doc])
  return null
}
