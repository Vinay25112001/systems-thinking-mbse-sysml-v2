// The Week 1 workbench on the lecture-first path, embedded under the week navigation:
//   - the lab tool (#/week/1/lab/tool): the Team enterprise view and the Team Record's parts only (sign-off Mo3: no
//     AeroLink missions, no quiz mission, no mission numbers);
//   - the optional practice (#/week/1/examples/practice): the AeroLink missions 1–4, "try it yourself" (faculty-default
//     decision 3: optional, not counted in the workload).
// Neither is locked: no unanswered check stands between a student and the lab.
import { useMemo, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { Link, navigate } from '../lib/router'
import { ExampleBanner } from '../project/pages/ui'
import { EmbeddedWorkbench } from '../flow/Practice'
import type { PracticeLinks } from '../workbench/learnLink'
import { WEEK1_PATHS } from './route'
import { WeekShell } from './WeekShell'

const PRACTICE_MISSIONS = ['w1-m1-who', 'w1-m2-boundary', 'w1-m3-stakeholders', 'w1-m4-needs']
const LAB_MISSION = 'w1-m5-team'

/** Opens the workbench on the right view and mission the first time the page mounts (the workbench reads `wb-ui`). */
function preselect(kind: 'lab' | 'practice') {
  const ui = loadJSON<Record<number, { view?: string; mission?: string }>>('wb-ui', {})
  const mine = ui[1] ?? {}
  const next = kind === 'lab' ? { ...mine, view: 'team', mission: LAB_MISSION } : PRACTICE_MISSIONS.includes(mine.mission ?? '') ? mine : { ...mine, view: 'stakeholders', mission: PRACTICE_MISSIONS[0] }
  saveJSON('wb-ui', { ...ui, 1: next })
}

export default function Week1Workbench({ kind, path }: { kind: 'lab' | 'practice'; path: string }) {
  // runs once, before the workbench mounts and reads its UI state
  useState(() => preselect(kind))
  const links = useMemo<PracticeLinks>(
    () =>
      kind === 'lab'
        ? { onGuide: () => navigate(WEEK1_PATHS.lab), guideLabel: 'Lab instructions', checkHref: WEEK1_PATHS.assessment, checkLabel: 'Assessment and submission', completeText: 'All six parts are complete and the record is exported.', progressLabel: 'Team Record', missions: [LAB_MISSION], partsLabel: 'Team Record steps', partsNote: '(six parts and the export)' }
        : { onGuide: () => navigate(WEEK1_PATHS.examples), guideLabel: 'Back to the worked examples', checkHref: WEEK1_PATHS.lab, checkLabel: 'Laboratory', completeText: 'Every practice mission is complete. Now apply this engineering method to your own enterprise.', progressLabel: 'Optional practice', missions: PRACTICE_MISSIONS },
    [kind],
  )
  return (
    <WeekShell path={path} title={kind === 'lab' ? 'Lab tool: Team enterprise view' : 'Optional practice: AeroLink missions'} app>
      <div className="wk-tool-frame" data-testid={kind === 'lab' ? 'lab-tool-frame' : 'practice-frame'}>
        <p className="m-0 text-[15px] font-semibold">{kind === 'lab' ? 'Lab L1 tool: the Team enterprise view' : 'Try it yourself: the AeroLink missions (optional)'}</p>
        <span className="lf-muted">
          {kind === 'lab'
            ? 'Your team’s own Week 1 Team Record in seven steps, the six parts of the record and then the export: each part is checked as you type. Saved in this browser; export after every working session.'
            : 'Missions 1–4 rehearse the worked example on AeroLink. Optional and not counted in the week’s workload.'}
        </span>
      </div>
      {kind === 'practice' && <ExampleBanner action={<Link to="/project" className="pj-btn small">Apply it in My Project</Link>} />}
      <EmbeddedWorkbench links={links} />
    </WeekShell>
  )
}
