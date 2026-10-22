// The Week 1 workbench on the lecture-first path, embedded under the week navigation:
//   - the lab tool (#/week/1/project/tool): the Team enterprise view and the Team Record's parts only (sign-off Mo3: no
//     AeroLink missions, no quiz mission, no mission numbers);
//   - (until M5) Guided Practice; since M5 Guided Practice is its own page (src/week1/practice/GuidedPractice.tsx) with its
//     own store, and the 'practice' kind here is no longer routed.
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
/** week1-m5 (audit M2): the lab tool is the team's own record: no AeroLink rehearsal views, tree groups or boundary-practice
 *  rule, and not labelled "Practice workbench". */
const LAB_ONLY = { views: ['team'], hideTreeGroups: ['g-aero-stk', 'g-aero-needs', 'g-boundary', 'g-ent', 'g-ext'], hideRules: ['w1-boundary-open', 'w1-ent-boundary', 'w1-ext-exchange'], brand: 'Week 1 lab tool · your team’s record' }

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
        ? { onGuide: () => navigate(WEEK1_PATHS.project), guideLabel: 'Lab instructions', checkHref: WEEK1_PATHS.review, checkLabel: 'Review & Submit', completeText: 'All six parts are complete and the record is exported.', progressLabel: 'Team Record', missions: [LAB_MISSION], partsLabel: 'Team Record steps', partsNote: '(six parts and the export)', ...LAB_ONLY }
        : { onGuide: () => navigate(WEEK1_PATHS.learn), guideLabel: 'Back to Learn', checkHref: WEEK1_PATHS.project, checkLabel: 'My Project / Lab', completeText: 'Every practice mission is complete. Now apply this engineering method to your own enterprise.', progressLabel: 'Optional practice', missions: PRACTICE_MISSIONS },
    [kind],
  )
  return (
    <WeekShell path={path} title={kind === 'lab' ? 'My Project / Lab: lab tool' : 'Guided Practice'} app>
      <div className="wk-tool-frame" data-testid={kind === 'lab' ? 'lab-tool-frame' : 'practice-frame'}>
        <p className="m-0 text-[15px] font-semibold">{kind === 'lab' ? 'Lab L1 tool: the Team enterprise view' : 'Guided Practice: the AeroLink missions'}</p>
        <span className="lf-muted">
          {kind === 'lab'
            ? 'Your team’s own Week 1 Team Record in seven steps, the six parts of the record and then the export: each part is checked as you type. Saved in this browser; export after every working session.'
            : 'Missions 1–4 rehearse each Learn method on AeroLink, the instructor’s fictional example. Practice is separate from your project and is not graded.'}
        </span>
      </div>
      {kind === 'practice' && <ExampleBanner action={<Link to="/project" className="pj-btn small">Apply it in My Project</Link>} />}
      <EmbeddedWorkbench links={links} />
    </WeekShell>
  )
}
