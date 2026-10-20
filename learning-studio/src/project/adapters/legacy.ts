// Legacy detection (architecture §7): the Week 1 Team Record the lab tool kept in this browser before projects existed
// (`wb-artefacts['w1.team']` under the app's localStorage prefix). Read only when the create screen or the import page
// offers it, never written. While a project exists, the app mirrors the project's Week 1 record into that key for the
// pages that still read it (src/state/ProjectLegacyMirror.tsx); the record found there before the first mirror is kept
// under LEGACY_BACKUP_KEY and offered here instead.
import { normalizeTeam, type TeamRecord } from '../../workbench/week1/team'
import { recordHasContent } from './week1'

const PREFIX = 'sysml-studio:v1:'
export const LEGACY_BACKUP_KEY = 'w1-team-before-project'

function read(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

/** The Week 1 record stored in this browser, if it holds anything (a name or any row). */
export function findLegacyTeamRecord(opts: { preferBackup?: boolean } = {}): { record: TeamRecord; from: 'backup' | 'workbench' } | null {
  const backup = read(LEGACY_BACKUP_KEY) as { record?: unknown } | undefined
  if (opts.preferBackup && backup?.record) {
    const r = normalizeTeam(backup.record)
    if (recordHasContent(r)) return { record: r, from: 'backup' }
  }
  const art = read('wb-artefacts') as Record<string, unknown> | undefined
  const r = normalizeTeam(art?.['w1.team'])
  if (recordHasContent(r)) return { record: r, from: 'workbench' }
  if (backup?.record) {
    const b = normalizeTeam(backup.record)
    if (recordHasContent(b)) return { record: b, from: 'backup' }
  }
  return null
}
