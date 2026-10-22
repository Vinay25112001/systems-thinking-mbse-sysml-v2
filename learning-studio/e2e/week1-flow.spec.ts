// Week 1 on the five-stage student path (M4 part A, DECISION_LOG A23–A25; spec §a–§d): the course homepage, then the
// student's walk Homepage → Week 1 Overview → Learn (the textbook: chapters, section progress, a knowledge check) →
// Guided Practice (six AeroLink tasks, M5) → My Project / Lab (instructions, then the Team Record completed in the lab tool
// by importing a teammate's JSON export) → Review & Submit (quiz) → "ready" / "submitted for approval"; the redirects of
// every earlier route (self-study, the lecture-first pages); the stage bar on every Week 1 page; axe in light and dark at
// 1440×900 and 400 px on every page; and the screenshots in screenshots/week1-flow/.
// (Rewritten for M4 part A: the lecture-first week page, slide viewer, lesson and examples pages it walked are retired
// from the student path; the lecture viewer is instructor-only, see the gate test below.)
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { WEEK1_QUIZ } from '../src/content/quizWeek1'
import { teamModelInputs } from '../src/workbench/week1/team'
import { TEAM_FIXTURE } from '../src/workbench/week1/teamFixture'

const SHOTS = 'screenshots/week1-flow'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const STAGES = ['overview', 'learn', 'practice', 'project', 'review'] as const

async function fresh(page: Page, path: string) {
  await page.goto('/#/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`/#${path}`)
}

function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    // the course-server session probe (/api/…, the concurrent M2 auth work) fails when no course server runs; it is not
    // a Week 1 page error, so it is ignored here, and only here (as in week6-flow.spec.ts)
    if (m.type() === 'error' && !(m.text().startsWith('Failed to load resource') && m.location().url.includes('/api/'))) errors.push(`console: ${m.text()}`)
  })
  return errors
}

const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
const fixtureFile = (fixture = TEAM_FIXTURE) => ({ name: 'team-07-week1-model-inputs.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(teamModelInputs(fixture))) })
const hours = (s: string | null) => Number((s ?? '').replace(/\s*h$/, ''))

/** Imports a teammate's export into the Team enterprise view and exports both files (the lab's last step). */
async function completeRecordInLabTool(page: Page, fixture = TEAM_FIXTURE) {
  await expect(page.getByTestId('workbench')).toBeVisible({ timeout: 30_000 })
  const tv = page.getByTestId('view-team')
  await expect(tv).toBeVisible()
  await tv.locator('input[type="file"]').setInputFiles(fixtureFile(fixture))
  await expect(page.getByTestId('team-import-msg')).toContainText('Imported 8 stakeholders and 8 needs')
  for (const id of ['team-charter', 'team-proposal', 'team-context', 'team-register', 'team-needs', 'team-ai']) await expect(page.getByTestId(`${id}-check`)).toContainText('✓')
  const [md] = await Promise.all([page.waitForEvent('download'), tv.getByRole('button', { name: 'Export Team Record (.md)' }).click()])
  expect(md.suggestedFilename()).toBe('team-07-week1-record.md')
  const [js] = await Promise.all([page.waitForEvent('download'), tv.getByRole('button', { name: 'Export model inputs (.json)' }).click()])
  expect(js.suggestedFilename()).toBe('team-07-week1-model-inputs.json')
}

/** The stage bar: five stages in path order, exactly one current. */
async function expectStage(page: Page, current: (typeof STAGES)[number], label = current) {
  const nav = page.getByTestId('week-nav')
  await expect(nav, label).toBeVisible({ timeout: 30_000 })
  await expect(nav.getByRole('link')).toHaveCount(STAGES.length)
  await expect(nav.locator('[aria-current="step"]'), label).toHaveCount(1)
  await expect(page.getByTestId(`week-nav-${current}`), label).toHaveAttribute('aria-current', 'step')
}

test('course homepage at #/: the course, the 14 weeks with a text equivalent, AeroLink, and the one way into Week 1', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/')
  await expect(page.getByTestId('homepage')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'Systems Thinking and MBSE with SysML v2' })).toBeVisible()
  await expect(page.getByTestId('hp-weeks')).toBeVisible()
  await expect(page.getByTestId('hp-aerolink')).toContainText('AeroLink')
  await expect(page.getByTestId('homepage')).not.toContainText(/lecture-first|Lecture slides|\bR\d{2}[a-z]? p/)
  await page.screenshot({ path: `${SHOTS}/homepage-1440x900-light.png`, fullPage: true })
  // the earlier welcome page redirects here; the dashboard has its own route
  await page.goto('/#/welcome')
  await expect(page).toHaveURL(/#\/$/)
  await page.goto('/#/dashboard')
  await expect(page.getByTestId('start-here')).toBeVisible()
  await page.goto('/#/')
  await page.getByTestId('hp-start').click()
  await expect(page).toHaveURL(/#\/week\/1$/)
  await expect(page.getByTestId('week1-overview')).toBeVisible()
  expect(errors).toEqual([])
})

test('end to end: Overview → Learn → Guided Practice → My Project / Lab (record imported, exported) → Review & Submit (quiz) → ready', async ({ page }) => {
  test.setTimeout(240_000)
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/1')

  // ---- Overview: objectives, what the team creates, and the time table computed from the content
  await expect(page.getByTestId('week1-overview')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Week 1 · Team formation, needs and identifying stakeholders')
  await expectStage(page, 'overview')
  const rows = await page.getByTestId('ov-time').locator('table').first().locator('tbody tr:not(.ov-total) td').allTextContents()
  expect(rows.length).toBe(8) // every required activity (review M4A F2)
  const total = hours(await page.getByTestId('ov-time-total').textContent())
  expect(Math.abs(total - rows.reduce((a, r) => a + hours(r), 0))).toBeLessThanOrEqual(0.25) // the rows add up (rounding of 8 rows)
  await expect(page.getByTestId('ov-time-optional')).toContainText('optional, not counted in the total')
  await page.screenshot({ path: `${SHOTS}/overview-1440x900-light.png`, fullPage: true })

  // ---- Learn: chapter 1, mark a section read, the stage bar says so; a knowledge check that reveals nothing on a miss
  await page.getByTestId('ov-start').click()
  await expect(page).toHaveURL(/#\/week\/1\/learn\/ch01$/)
  await expect(page.getByTestId('learn-reader')).toBeVisible()
  await expectStage(page, 'learn')
  await page.getByTestId('mark-read-ch01-01').click()
  await expect(page.getByTestId('mark-read-ch01-01')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByTestId('week-nav-learn')).toContainText('Current')
  await page.getByTestId('learn-next').click()
  await expect(page).toHaveURL(/#\/week\/1\/learn\/ch02$/)
  await page.goto('/#/week/1/learn/ch06')
  const check = page.getByTestId('learn-check-c4')
  await check.locator('summary').click()
  const options = check.locator('label.w1l-option')
  for (let i = 0; i < (await options.count()); i++) {
    await options.nth(i).click()
    await check.getByRole('button', { name: 'Check my answer' }).click()
    if ((await check.getByRole('status').textContent())!.includes('Not quite')) {
      await expect(check.locator('.is-right')).toHaveCount(0)
      break
    }
  }
  await page.screenshot({ path: `${SHOTS}/learn-ch06-1440x900-light.png` })

  // ---- Guided Practice (M5): six AeroLink tasks, own practice store, feedback, reset that never touches the project
  await page.getByTestId('week-nav-practice').click()
  await expect(page.getByTestId('week-nav-learn')).toContainText(/In progress · 1 of \d+ sections read/)
  await expect(page.getByTestId('guided-practice')).toBeVisible({ timeout: 30_000 })
  await expectStage(page, 'practice')
  await expect(page.getByTestId('practice-banner')).toContainText('Fictional teaching case')
  await expect(page.getByRole('navigation', { name: 'Guided Practice tasks' }).getByRole('listitem')).toHaveCount(6)
  await page.getByTestId('task-gp-4').click()
  await expect(page).toHaveURL(/#\/week\/1\/practice\/gp-4$/)
  await page.waitForTimeout(400) // the hash route settles before the first edit
  for (const sel of await page.getByTestId('gp4-table').getByRole('combobox').all()) await sel.selectOption('supplies')
  await page.getByTestId('gp-check').click()
  await expect(page.getByTestId('fb-compared')).toContainText(/\d agree · \d differ/)
  await expect(page.getByTestId('fb-compared')).not.toContainText(/correct|wrong|score/i)
  await page.getByTestId('reset-task').click()
  await expect(page.getByTestId('gp-confirm')).toContainText('Your team project is not affected.')
  await page.getByTestId('gp-confirm-yes').click()
  await expect(page.getByTestId('practice-status-visible')).toContainText('GP-4 reset. Your project was not changed.')

  // ---- My Project / Lab: instructions, then the lab tool
  await page.getByTestId('week-nav-project').click()
  // m6: My Project / Lab is the canvas (no project in this browser yet); the Lab brief has its own page
  await expect(page.getByTestId('canvas-create')).toBeVisible()
  await expectStage(page, 'project')
  await page.goto('/#/week/1/project/instructions')
  await expect(page.getByTestId('week1-lab')).toBeVisible()
  await expect(page.getByTestId('lab-procedure')).toContainText('Integration review, export and upload')
  // sign-off M4: the in-class timing is the lecture's (22 min: charter 8, pitch 10 for up to five teams)
  await expect(page.getByTestId('lab-glance')).toContainText('Session 2, 22 min')
  await expect(page.getByTestId('lab-glance')).toContainText('charter (8 min')
  await expect(page.getByTestId('lab-glance')).toContainText('pitch (10 min, up to 5 teams)')
  await expect(page.getByTestId('week1-lab')).not.toContainText('28 min')
  await page.screenshot({ path: `${SHOTS}/project-lab-1440-full-light.png`, fullPage: true })
  await expect(page.getByTestId('open-lab-tool')).toHaveAttribute('href', '#/week/1/project')
  await page.goto('/#/week/1/project/tool') // the earlier lab tool: instructor edition only since M6
  await expect(page).toHaveURL(/#\/week\/1\/project\/tool$/)
  await expect(page.getByTestId('lab-tool-frame')).toBeVisible()
  // sign-off Mo3: the lab tool shows the Team Record's parts only: no AeroLink missions, no quiz mission, no mission numbers
  await expect(page.getByTestId('lab-tool-frame')).not.toContainText('Mission 5')
  await expect(page.getByTestId('practice-progress')).toContainText('Team Record steps complete')
  await expect(page.getByTestId('mission-list')).toHaveCount(0)
  await expect(page.getByTestId('workbench')).not.toContainText(/missions complete|Quiz\s*0\/2|Who is missing\?/)
  await completeRecordInLabTool(page)
  await expect(page.getByTestId('practice-progress')).toHaveText('7 of 7 Team Record steps complete')
  await expectStage(page, 'project', 'lab tool')
  await page.screenshot({ path: `${SHOTS}/lab-tool-team-record-1440x900-light.png` })

  // ---- Review & Submit (m6: the package review of the team project; this browser has none yet), the optional quiz
  await page.getByTestId('week-nav-review').click()
  await expect(page.getByTestId('review-no-project')).toBeVisible()
  await expectStage(page, 'review')
  await page.getByTestId('review-quiz').locator('summary').click()
  for (const q of WEEK1_QUIZ) {
    const item = page.getByTestId(`quiz-${q.id}`)
    await item.getByLabel(q.options.find((o) => o.correct)!.text, { exact: true }).check()
    await item.getByRole('button', { name: 'Check answer' }).click()
  }
  await expect(page.getByTestId('quiz-score')).toContainText(`Score: ${WEEK1_QUIZ.length} correct of ${WEEK1_QUIZ.length}`)
  // the record's readiness of the earlier lab tool is shown with the Lab brief (the package review needs a project)
  await page.goto('/#/week/1/project/instructions')
  const ready = page.getByTestId('record-readiness')
  await expect(ready).toHaveAttribute('data-state', 'ready')
  await expect(ready).toContainText('ready to submit: Riverside Food Bank Network')
  await page.goto('/#/week/1/review')
  await page.getByTestId('review-quiz').locator('summary').click()
  const status = page.getByTestId('objective-status')
  for (const o of ['B1.1', 'B1.2', 'B1.3', 'B1.4', 'B1.5']) await expect(status.locator('tr', { hasText: o })).toContainText('secure')
  await page.screenshot({ path: `${SHOTS}/review-ready-1440-full-light.png`, fullPage: true })
  expect(errors).toEqual([])
})

test('a complete record whose proposal awaits the instructor is "submitted for approval", never "ready"', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/1/project/tool')
  await completeRecordInLabTool(page, { ...TEAM_FIXTURE, proposal: { ...TEAM_FIXTURE.proposal, decision: 'pending', decidedOn: '' } })
  await page.goto('/#/week/1/project/instructions') // m6: the record readiness of the earlier lab tool stays with the Lab brief
  const st = page.getByTestId('record-readiness')
  await expect(st).toHaveAttribute('data-state', 'pending-approval')
  await expect(st).toContainText('Submitted for approval, not ready')
  await st.screenshot({ path: `${SHOTS}/review-submitted-for-approval.png` })
})

test('every earlier route redirects to its new stage, without a history entry', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 })
  await fresh(page, '/')
  const cases: [string, RegExp, string][] = [
    ['/week/1/overview', /#\/week\/1$/, 'week1-overview'],
    ['/week/1/classic', /#\/week\/1$/, 'week1-overview'],
    ['/week/1/lesson', /#\/week\/1\/learn$/, 'learn-reader'],
    ['/week/1/lesson/s1-lesson-boundary', /#\/week\/1\/learn\/ch04#ch04-01$/, 'learn-reader'],
    ['/week/1/learn/l3', /#\/week\/1\/learn\/ch04#ch04-01$/, 'learn-reader'],
    ['/week/1/examples', /#\/week\/1\/learn\/ch06#ch06-07$/, 'learn-reader'],
    ['/week/1/examples/practice', /#\/week\/1\/practice$/, 'guided-practice'],
    ['/week/1/lab', /#\/week\/1\/project$/, 'canvas-create'], // m6: the canvas (a fresh browser has no project yet)
    ['/week/1/lab/tool', /#\/week\/1\/project\/tool$/, 'lab-tool-frame'],
    ['/week/1/assessment', /#\/week\/1\/review$/, 'review-no-project'], // m6: Review & Submit of the team project
    ['/week/1/check', /#\/week\/1\/review$/, 'review-no-project'],
  ]
  for (const [from, to, id] of cases) {
    await page.goto(`/#${from}`)
    await expect(page, from).toHaveURL(to)
    await expect(page.getByTestId(id), from).toBeVisible({ timeout: 30_000 })
  }
  // the earlier module page stays available to the instructor, off the student path
  await page.goto('/#/archive/week/1')
  await expect(page.getByTestId('archive-banner')).toBeVisible()
})

test('the lecture viewer is instructor-only: with the instructor view off, a slide link lands on the Learn section', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/1/lecture/1')
  await expect(page).toHaveURL(/#\/week\/1\/learn/)
  await expect(page.getByTestId('learn-reader')).toBeVisible()
  // a slide without a figure in Learn lands on its lesson's section, not on the Learn root (review M4A F15)
  await page.goto('/#/week/1/lecture/1/5')
  await expect(page).toHaveURL(/#\/week\/1\/learn\/ch\d\d#ch\d\d-\d\d$/)
})

test('the stage bar is on every Week 1 page, with exactly one current stage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/')
  const pages: [string, (typeof STAGES)[number]][] = [
    ['/week/1', 'overview'],
    ['/week/1/learn', 'learn'],
    ['/week/1/learn/ch04', 'learn'],
    ['/week/1/learn/glossary', 'learn'],
    ['/week/1/practice', 'practice'],
    ['/week/1/project', 'project'],
    ['/week/1/project/tool', 'project'],
    ['/week/1/review', 'review'],
  ]
  for (const [path, current] of pages) {
    await page.goto(`/#${path}`)
    await expectStage(page, current, path)
  }
})

// ------------------------------------------------------------------------------------------- axe and responsive
const PAGES: [string, string, string][] = [
  ['overview', '/week/1', 'week1-overview'],
  ['learn-ch04', '/week/1/learn/ch04', 'learn-reader'],
  ['learn-glossary', '/week/1/learn/glossary', 'learn-reader'],
  ['project', '/week/1/project', 'canvas-create'], // m6: the canvas (no project yet in a fresh browser; the canvas itself is checked in e2e/project-canvas.e2e.ts)
  ['project-instructions', '/week/1/project/instructions', 'week1-lab'],
  ['review', '/week/1/review', 'review-no-project'],
  ['lab-tool', '/week/1/project/tool', 'workbench'],
  ['practice', '/week/1/practice', 'guided-practice'],
]

for (const theme of ['light', 'dark'] as const)
  for (const [w, h] of [
    [1440, 900],
    [400, 860],
  ] as const) {
    test(`axe and layout: every Week 1 page at ${w} px — ${theme}`, async ({ page }) => {
      test.setTimeout(300_000)
      await page.setViewportSize({ width: w, height: h })
      await page.emulateMedia({ colorScheme: theme })
      const report: string[] = []
      await fresh(page, '/week/1')
      for (const [label, path, id] of PAGES) {
        await page.goto(`/#${path}`)
        await expect(page.getByTestId(id)).toBeVisible({ timeout: 30_000 })
        await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)))
        await page.waitForTimeout(300)
        const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
        for (const v of r.violations) report.push(`${label} [${v.impact}] ${v.id}: ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(' ')}`)
        if (id !== 'workbench' || w > 400) expect(await noHorizontalScroll(page), `${label} at ${w} px, ${theme}`).toBe(true)
        if (theme === 'dark' || w === 400) await page.screenshot({ path: `${SHOTS}/${label}-${w}-${theme}.png`, fullPage: id !== 'workbench' })
      }
      console.log(`AXE week1 ${w} ${theme}:\n${report.join('\n') || 'no violations'}`)
      expect(report).toEqual([])
    })
  }

test('400 px: the stage bar fits, the procedure and the record parts become cards with nothing clipped', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 860 })
  await fresh(page, '/week/1/project/instructions')
  const nav = page.getByTestId('week-nav')
  const navBox = (await nav.boundingBox())!
  expect(navBox.width).toBeLessThanOrEqual(400)
  for (const id of STAGES) {
    const b = (await page.getByTestId(`week-nav-${id}`).boundingBox())!
    expect(b.x + b.width, id).toBeLessThanOrEqual(401)
  }
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="week1-lab"] table, [data-testid="week1-lab"] tbody td, [data-testid="week1-lab"] tbody th')]
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .map((el) => `${el.tagName}: ${(el.textContent ?? '').slice(0, 40)}`),
  )
  expect(clipped).toEqual([])
  expect(await page.getByTestId('lab-procedure').locator('thead').evaluate((el) => el.getBoundingClientRect().height)).toBeLessThanOrEqual(1)
  await page.screenshot({ path: `${SHOTS}/project-lab-400-full-light.png`, fullPage: true })
})
