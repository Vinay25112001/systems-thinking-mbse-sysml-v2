// Every My Project canvas screen and the Review & Submit page a student can reach (M6), rendered in a DOM with a complete
// fictional team project (the food bank fixture: no AeroLink record in it), plus the empty project, and the field
// guidance of every field as data (the panel shows one field at a time, on focus). Used by canvasSurfaces.test.tsx and by
// scripts/check-student-build.mjs (student mode, strict: no ceiling, every rule of learn/studentScan.ts, "goal"
// included). Not imported by the application.
import { renderInDom } from '../../lib/renderInDom'
import { TEAM_FIXTURE } from '../../workbench/week1/teamFixture'
import { FIELD_GUIDANCE, objectiveText } from '../../week1/guidance/fieldGuidance'
import { WeekShell } from '../../week1/WeekShell'
import ReviewSubmit from '../../week1/review/ReviewSubmit'
import { fromTeamRecord } from '../adapters/week1'
import { MemoryAdapter } from '../store/memory'
import { ProjectProvider } from '../store/ProjectProvider'
import { ProjectStore } from '../store/ProjectStore'
import { CANVAS_PARTS, Week1Canvas } from './Canvas'

export type Surface = { route: string; html: string }

async function storeWith(full: boolean): Promise<ProjectStore> {
  const s = new ProjectStore(new MemoryAdapter(), { startEmpty: true, autosaveMs: 0, locks: false, channel: false })
  await s.init()
  if (full) await s.create({ doc: fromTeamRecord(TEAM_FIXTURE, { initials: 'JS' }).doc })
  return s
}

export async function canvasSurfaces(): Promise<Surface[]> {
  const out: Surface[] = []
  const store = await storeWith(true)
  for (const p of CANVAS_PARTS) {
    const route = p.id === 'overview' ? '/week/1/project' : `/week/1/project/${p.id}`
    out.push({
      route,
      html: await renderInDom(
        <WeekShell path={route} title="My Project / Lab" compact>
          <ProjectProvider store={store}>
            <Week1Canvas part={p.id} />
          </ProjectProvider>
        </WeekShell>,
      ),
    })
  }
  const empty = await storeWith(false)
  out.push({
    route: '/week/1/project (no project yet)',
    html: await renderInDom(
      <WeekShell path="/week/1/project" title="My Project / Lab" compact>
        <ProjectProvider store={empty}>
          <Week1Canvas />
        </ProjectProvider>
      </WeekShell>,
    ),
  })
  out.push({
    route: '/week/1/review',
    html: await renderInDom(
      <WeekShell path="/week/1/review" title="Review & Submit">
        <ProjectProvider store={store}>
          <ReviewSubmit />
        </ProjectProvider>
      </WeekShell>,
    ),
  })
  const g = Object.values(FIELD_GUIDANCE)
    .map((x) => `<section><h3>${x.label}</h3><p>${x.definition.text}</p><p>${x.expected}</p><p>${x.aerolinkExample?.text ?? ''}</p><p>${x.format}</p><p>${x.objective}: ${objectiveText(x.objective)}</p>${x.laterUse.map((u) => `<p>Week ${u.week}: ${u.text}</p>`).join('')}<p>${x.rule}</p><p>${x.distinguishFrom ?? ''}</p></section>`)
    .join('')
  out.push({ route: 'my project: field guidance (every field)', html: g })
  store.dispose()
  empty.dispose()
  return out
}
