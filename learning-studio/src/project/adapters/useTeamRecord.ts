// The Week 1 lab tool's single read/write path (roadmap §2.2). In project mode the record is projected from the project
// and every edit becomes canonical operations (IDs from the project counters); export stamps go to Milestone 1. Without
// a project (legacy mode) the tool keeps its old behaviour on the workbench artefact.
import { useCallback, useMemo } from 'react'
import { useWorkbench } from '../../workbench/context'
import { contentState, normalizeTeam, TEAM_KEY, teamArtefact, type TeamRecord } from '../../workbench/week1/team'
import { useProjectOptional } from '../store/ProjectProvider'
import { diffTeamRecord, EXPORT_FORMATS, toTeamRecord } from './week1'

export type TeamRecordMode = 'project' | 'legacy'
const STAMP_KEYS = ['exportedMdAt', 'exportedJsonAt'] as const

export function useTeamRecord(): readonly [TeamRecord, (patch: Partial<TeamRecord>) => void, TeamRecordMode] {
  const project = useProjectOptional()
  const wb = useWorkbench()
  const doc = project?.doc ?? null
  const store = project?.store ?? null
  const legacyRec = useMemo(() => teamArtefact(wb.state.artefacts), [wb.state.artefacts])
  const projected = useMemo(() => (doc ? toTeamRecord(doc) : null), [doc])
  const set = useCallback(
    (patch: Partial<TeamRecord>) => {
      const stampOnly = Object.keys(patch).length > 0 && Object.keys(patch).every((k) => (STAMP_KEYS as readonly string[]).includes(k) || k === 'updatedAt')
      if (!store) {
        // legacy mode: the record lives in the workbench artefacts (unchanged behaviour); exports do not touch updatedAt
        wb.setArtefact<TeamRecord>(TEAM_KEY, (prev) => ({ ...normalizeTeam(prev), ...patch, ...(stampOnly ? {} : { updatedAt: Date.now() }) }))
        return
      }
      if (stampOnly) {
        const rec = toTeamRecord(store.getState().doc!)
        const files = [patch.exportedMdAt ? { name: `team-${rec.team || 'NN'}-week1-record.md`, format: EXPORT_FORMATS.md, version: 1 } : null, patch.exportedJsonAt ? { name: `team-${rec.team || 'NN'}-week1-model-inputs.json`, format: EXPORT_FORMATS.json, version: 3 } : null].filter((x): x is NonNullable<typeof x> => !!x)
        if (files.length) void store.recordExport(1, files, contentState(rec))
        return
      }
      store.apply((latest, stamp) => diffTeamRecord(latest, normalizeTeam({ ...toTeamRecord(latest), ...patch }), stamp), { source: 'editor' })
    },
    [store, wb],
  )
  return [projected ?? legacyRec, set, doc ? 'project' : 'legacy'] as const
}
