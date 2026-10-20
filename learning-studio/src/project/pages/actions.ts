// Export actions shared by the overview, the transfer page and the header. Every export for submission is recorded on
// Milestone 1 (SubmissionExport) with a `milestone` snapshot (roadmap §2.2).
import { downloadText } from '../../workbench/download'
import { contentState, teamMarkdown, teamModelInputs } from '../../workbench/week1/team'
import { EXPORT_FORMATS, toTeamRecord } from '../adapters/week1'
import type { ProjectStore } from '../store/ProjectStore'
import { exportFileName, exportProjectText, PROJECT_FORMAT, reportFileName, sha256Hex } from '../transfer/exportProject'
import { projectReport } from '../transfer/report'

export async function exportProject(store: ProjectStore): Promise<string> {
  await store.flush()
  const st = store.getState()
  if (!st.doc) return 'No project is open.'
  const text = await exportProjectText(st.doc, { exportedBy: st.editor, changes: st.changes })
  const name = exportFileName(st.doc)
  if (!downloadText(name, text, 'application/json')) return 'The browser blocked the download.'
  const rec = toTeamRecord(st.doc, { excludeUnadapted: true })
  await store.recordExport(1, [{ name, format: PROJECT_FORMAT, version: 1, sha256: (await sha256Hex(text)) ?? undefined }], contentState(rec))
  return `Exported ${name}. Keep it: it is the copy of your project that survives clearing this browser.`
}
export async function exportReport(store: ProjectStore): Promise<string> {
  await store.flush()
  const st = store.getState()
  if (!st.doc) return 'No project is open.'
  const name = reportFileName(st.doc)
  if (!downloadText(name, projectReport(st.doc, st.changes), 'text/markdown')) return 'The browser blocked the download.'
  await store.recordExport(1, [{ name, format: 'project-report-md', version: 1 }], contentState(toTeamRecord(st.doc, { excludeUnadapted: true })))
  return `Exported ${name}.`
}
/** The Week 1 files in their unchanged formats (Markdown record, week1-model-inputs v3), for the LMS and the Week 8
 *  file path. AeroLink practice copies not yet adapted are left out of the submission files. */
export async function exportWeek1Files(store: ProjectStore): Promise<string> {
  await store.flush()
  const st = store.getState()
  if (!st.doc) return 'No project is open.'
  const rec = toTeamRecord(st.doc, { excludeUnadapted: true })
  const slug = (rec.team.trim() || 'NN').replace(/[^A-Za-z0-9-]+/g, '-')
  const md = `team-${slug}-week1-record.md`
  const js = `team-${slug}-week1-model-inputs.json`
  const ok = downloadText(md, teamMarkdown(rec), 'text/markdown') && downloadText(js, JSON.stringify(teamModelInputs(rec), null, 2), 'application/json')
  if (!ok) return 'The browser blocked the download.'
  await store.recordExport(1, [{ name: md, format: EXPORT_FORMATS.md, version: 1 }, { name: js, format: EXPORT_FORMATS.json, version: 3 }], contentState(rec))
  return `Exported ${md} and ${js}. Upload both to the Week 1 Team Record assignment on the LMS.`
}
