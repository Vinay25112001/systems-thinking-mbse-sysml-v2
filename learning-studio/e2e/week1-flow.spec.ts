// Week 1 on the lecture-first path (DECISION_LOG A20, faculty direction 2026-10-19): the course welcome, then the
// student's walk Dashboard → Week 1 → lecture slides (keyboard) → detailed lesson → worked examples → laboratory (the Team
// Record completed by importing a teammate's JSON export) → assessment (quiz) → "ready" / "submitted for approval"; the
// redirects of the earlier self-study routes; the week navigation on every Week 1 page; axe in light and dark at
// 1440×900 and 400 px on every new page; and the screenshots in screenshots/week1-flow/.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { WEEK1_QUIZ } from '../src/content/quizWeek1'
import { teamModelInputs } from '../src/workbench/week1/team'
import { TEAM_FIXTURE } from '../src/workbench/week1/teamFixture'
import week01 from '../src/content/weeks/week01'
import { workloadTotal } from '../src/content/schema'

/** The stated Week 1 total, computed from the workload rows (sign-off M5: never a retyped number). */
const WEEK1_TOTAL = workloadTotal(week01.workload).toFixed(1)

const SHOTS = 'screenshots/week1-flow'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function fresh(page: Page, path: string) {
  await page.goto('/#/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`/#${path}`)
}

function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  return errors
}

const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
const fixtureFile = (fixture = TEAM_FIXTURE) => ({ name: 'team-07-week1-model-inputs.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(teamModelInputs(fixture))) })

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

test('course welcome: one column read top to bottom, "How to use this site" describes the lecture-first path, and the way into Week 1', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/')
  await page.getByTestId('start-here').getByRole('link', { name: 'Course welcome' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Systems Thinking and MBSE with SysML v2' })).toBeVisible()
  const heads = ['1. What this subject is', '2. Why engineers need it', '3. The AeroLink case', '4. The 14-week map', '5. How to use this site']
  for (const h of heads) await expect(page.getByRole('heading', { name: h })).toBeVisible()
  const boxes = await Promise.all(heads.map(async (h) => (await page.getByRole('heading', { name: h }).boundingBox())!))
  for (let i = 1; i < boxes.length; i++) {
    expect(boxes[i].y, heads[i]).toBeGreaterThan(boxes[i - 1].y)
    expect(Math.abs(boxes[i].x - boxes[0].x), heads[i]).toBeLessThan(2)
  }
  const howto = page.getByTestId('welcome-howto')
  await expect(howto).toContainText('lecture-first course')
  for (const s of ['1. Week overview', '2. Lecture slides', '3. Detailed lesson', '4. Worked examples', '5. Engineering laboratory', '6. Assessment and submission']) await expect(howto.getByRole('heading', { name: s })).toBeVisible()
  await expect(howto).not.toContainText(/stage bar|mark it read|When every section is read/)
  await expect(page.getByTestId('course-timeline').locator('[aria-current="step"]')).toContainText('W1')
  await page.screenshot({ path: `${SHOTS}/welcome-1440x900-light.png`, fullPage: true })
  await page.getByTestId('welcome-start').click()
  await expect(page.getByTestId('week1-home')).toBeVisible()
  expect(errors).toEqual([])
})

test('end to end: Dashboard → Week 1 → slides (keyboard) → lesson → worked examples → lab (record imported, exported) → assessment (quiz) → ready', async ({ page }) => {
  test.setTimeout(240_000)
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/')

  // ---- Dashboard: the path card describes the week; "Open Week 1" opens the week page
  await expect(page.getByTestId('week1-path-card')).toContainText('lecture-first week')
  await page.screenshot({ path: `${SHOTS}/dashboard-1440x900-light.png` })
  await page.getByRole('link', { name: 'Open Week 1' }).click()
  const home = page.getByTestId('week1-home')
  await expect(home).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Week 1 — Team Formation / Needs / Identifying Stakeholders')
  await expect(page.getByTestId('week-nav-overview')).toHaveAttribute('aria-current', 'page')
  await expect(page.getByTestId('workload-total')).toHaveText(WEEK1_TOTAL)
  await page.screenshot({ path: `${SHOTS}/week1-home-1440x900-light.png` })
  await page.screenshot({ path: `${SHOTS}/week1-home-1440-full-light.png`, fullPage: true })

  // ---- Lecture slides: keyboard through a few, the week navigation stays
  await page.getByTestId('entry-lecture').getByRole('link', { name: 'Session 1 slides' }).click()
  const counter = page.getByTestId('slide-counter')
  await expect(counter).toHaveText(/^Slide 1 of \d+$/)
  for (let i = 2; i <= 4; i++) {
    await page.keyboard.press('ArrowRight')
    await expect(counter).toHaveText(new RegExp(`^Slide ${i} of \\d+$`))
  }
  await page.keyboard.press('ArrowLeft')
  await expect(counter).toHaveText(/^Slide 3 of \d+$/)
  await expect(page.getByTestId('week-nav-lecture')).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('link', { name: /Week 1/ }).first()).toHaveAttribute('href', '#/week/1')
  await page.mouse.move(0, 0)
  await page.screenshot({ path: `${SHOTS}/lecture-slide3-1440x900-light.png` })

  // ---- Detailed lesson, with an optional self-check (never a gate)
  await page.getByTestId('week-nav-lesson').click()
  await expect(page.getByTestId('lesson-reader')).toBeVisible()
  await expect(page.getByTestId('week-nav-lesson')).toHaveAttribute('aria-current', 'page')
  await expect(page.getByTestId('selfcheck-s1-lesson-teams')).not.toHaveAttribute('open', '')
  await page.screenshot({ path: `${SHOTS}/lesson-1440x900-light.png` })
  await page.getByTestId('lesson-next').click()

  // ---- Worked examples: the slides, the step-by-step solution, the optional practice
  const ex = page.getByTestId('week1-examples')
  await expect(ex).toBeVisible()
  await expect(page.getByTestId('example-slide-s2-worked-steps').getByTestId('slide-face')).toBeVisible()
  await expect(page.getByTestId('example-lesson-s2-l-case-needs')).toContainText('NEED-010')
  await page.getByTestId('try-paper-solution').locator('summary').click()
  await expect(page.getByTestId('try-paper-solution')).toContainText('NEED-014')
  await expect(page.getByTestId('example-try')).toContainText('optional, not counted')
  await page.screenshot({ path: `${SHOTS}/examples-1440x900-light.png` })
  await page.screenshot({ path: `${SHOTS}/examples-1440-full-light.png`, fullPage: true })
  await ex.getByRole('link', { name: /Next: the laboratory/ }).click()

  // ---- Laboratory: instructions, then the lab tool (no lock: nothing was answered first)
  await expect(page.getByTestId('week1-lab')).toBeVisible()
  await expect(page.getByTestId('lab-procedure')).toContainText('Integration review, export and upload')
  await expect(page.getByTestId('record-rubric')).toContainText('RB-2.2')
  await expect(page.getByTestId('record-readiness')).toHaveAttribute('data-state', 'not-ready')
  // sign-off M4: the in-class timing is the lecture's (22 min: charter 8, pitch 10 for up to five teams)
  await expect(page.getByTestId('lab-glance')).toContainText('Session 2, 22 min')
  await expect(page.getByTestId('lab-glance')).toContainText('charter (8 min')
  await expect(page.getByTestId('lab-glance')).toContainText('pitch (10 min, up to 5 teams)')
  await expect(page.getByTestId('week1-lab')).not.toContainText('28 min')
  await page.screenshot({ path: `${SHOTS}/lab-1440x900-light.png` })
  await page.screenshot({ path: `${SHOTS}/lab-1440-full-light.png`, fullPage: true })
  await page.getByTestId('open-lab-tool').click()
  await expect(page.getByTestId('lab-tool-frame')).toBeVisible()
  // sign-off Mo3: the lab tool shows the Team Record's parts only: no AeroLink missions, no quiz mission, no mission numbers
  await expect(page.getByTestId('lab-tool-frame')).not.toContainText('Mission 5')
  await expect(page.getByTestId('practice-progress')).toContainText('Team Record steps complete')
  await expect(page.getByTestId('mission-list')).toHaveCount(0)
  await expect(page.getByTestId('workbench')).not.toContainText(/missions complete|Quiz\s*0\/2|Who is missing\?/)
  await completeRecordInLabTool(page)
  await expect(page.getByTestId('practice-progress')).toHaveText('7 of 7 Team Record steps complete')
  await expect(page.getByTestId('week-nav-lab')).toHaveAttribute('aria-current', 'page')
  await page.screenshot({ path: `${SHOTS}/lab-tool-team-record-1440x900-light.png` })

  // ---- Assessment: the quiz, then the record is ready
  await page.getByTestId('week-nav-assessment').click()
  await expect(page.getByTestId('week1-assessment')).toBeVisible()
  for (const q of WEEK1_QUIZ) {
    const item = page.getByTestId(`quiz-${q.id}`)
    await item.getByLabel(q.options.find((o) => o.correct)!.text, { exact: true }).check()
    await item.getByRole('button', { name: 'Check answer' }).click()
  }
  await expect(page.getByTestId('quiz-score')).toContainText(`Score: ${WEEK1_QUIZ.length} correct of ${WEEK1_QUIZ.length}`)
  const ready = page.getByTestId('record-readiness')
  await expect(ready).toHaveAttribute('data-state', 'ready')
  await expect(ready).toContainText('ready to submit: Riverside Food Bank Network')
  const status = page.getByTestId('objective-status')
  for (const o of ['B1.1', 'B1.2', 'B1.3', 'B1.4', 'B1.5']) await expect(status.locator('tr', { hasText: o })).toContainText('secure')
  await page.screenshot({ path: `${SHOTS}/assessment-ready-1440-full-light.png`, fullPage: true })
  expect(errors).toEqual([])
})

test('a complete record whose proposal awaits the instructor is "submitted for approval", never "ready"', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/1/lab/tool')
  await completeRecordInLabTool(page, { ...TEAM_FIXTURE, proposal: { ...TEAM_FIXTURE.proposal, decision: 'pending', decidedOn: '' } })
  await page.goto('/#/week/1/assessment')
  const st = page.getByTestId('record-readiness')
  await expect(st).toHaveAttribute('data-state', 'pending-approval')
  await expect(st).toContainText('Submitted for approval, not ready')
  await st.screenshot({ path: `${SHOTS}/assessment-submitted-for-approval.png` })
})

test('earlier self-study routes redirect to their new equivalents, without a history entry', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 })
  await fresh(page, '/')
  const cases: [string, RegExp, string][] = [
    ['/week/1/overview', /#\/week\/1$/, 'week1-home'],
    ['/week/1/classic', /#\/week\/1$/, 'week1-home'],
    ['/week/1/learn/l3', /#\/week\/1\/lesson\/s1-lesson-boundary$/, 'lesson-reader'],
    ['/week/1/learn/summary', /#\/week\/1\/lesson$/, 'lesson-reader'],
    ['/week/1/practice', /#\/week\/1\/lab$/, 'week1-lab'],
    ['/week/1/check', /#\/week\/1\/assessment$/, 'week1-assessment'],
  ]
  for (const [from, to, id] of cases) {
    await page.goto(`/#${from}`)
    await expect(page, from).toHaveURL(to)
    await expect(page.getByTestId(id), from).toBeVisible()
  }
  // the earlier module page stays available to the instructor, off the student path
  await page.goto('/#/archive/week/1')
  await expect(page.getByTestId('archive-banner')).toBeVisible()
})

test('the week navigation is on every Week 1 page, including the slide viewer, the handout, the reader and the lab tool', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/')
  const pages: [string, string][] = [
    ['/week/1', 'overview'],
    ['/week/1/lecture/2', 'lecture'],
    ['/week/1/lecture/1/handout', 'lecture'],
    ['/week/1/lesson', 'lesson'],
    ['/week/1/examples', 'examples'],
    ['/week/1/examples/practice', 'examples'],
    ['/week/1/lab', 'lab'],
    ['/week/1/lab/tool', 'lab'],
    ['/week/1/assessment', 'assessment'],
  ]
  for (const [path, current] of pages) {
    await page.goto(`/#${path}`)
    const nav = page.getByTestId('week-nav')
    await expect(nav, path).toBeVisible({ timeout: 30_000 })
    await expect(nav.getByRole('link')).toHaveCount(6)
    await expect(nav.locator('[aria-current="page"]'), path).toHaveCount(1)
    await expect(page.getByTestId(`week-nav-${current}`), path).toHaveAttribute('aria-current', 'page')
  }
  // the optional practice opens the AeroLink missions, the lab tool opens the team's own record
  await page.goto('/#/week/1/examples/practice')
  await expect(page.getByTestId('practice-frame')).toContainText('optional')
  await expect(page.getByTestId('workbench')).toBeVisible({ timeout: 30_000 })
  // the practice shows the four AeroLink missions only (Mo3: the Team Record and the quiz are not practice missions)
  await expect(page.getByTestId('mission-list').getByRole('listitem')).toHaveCount(4)
  await expect(page.getByTestId('practice-progress')).toContainText('of 4 missions complete')
})

// ------------------------------------------------------------------------------------------- axe and responsive
const NEW_PAGES: [string, string, string][] = [
  ['home', '/week/1', 'week1-home'],
  ['examples', '/week/1/examples', 'week1-examples'],
  ['lab', '/week/1/lab', 'week1-lab'],
  ['assessment', '/week/1/assessment', 'week1-assessment'],
  ['lab-tool', '/week/1/lab/tool', 'workbench'],
  ['practice', '/week/1/examples/practice', 'workbench'],
]

for (const theme of ['light', 'dark'] as const)
  for (const [w, h] of [
    [1440, 900],
    [400, 860],
  ] as const) {
    test(`axe and layout: every new Week 1 page at ${w} px — ${theme}`, async ({ page }) => {
      test.setTimeout(300_000)
      await page.setViewportSize({ width: w, height: h })
      const report: string[] = []
      await fresh(page, '/week/1')
      await page.getByLabel(/Colou?r theme/).first().selectOption(theme)
      for (const [label, path, id] of NEW_PAGES) {
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

test('400 px: the week navigation fits on two rows, the procedure and the record parts become cards with nothing clipped', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 860 })
  await fresh(page, '/week/1/lab')
  const nav = page.getByTestId('week-nav')
  const navBox = (await nav.boundingBox())!
  expect(navBox.width).toBeLessThanOrEqual(400)
  for (const id of ['overview', 'lecture', 'lesson', 'examples', 'lab', 'assessment']) {
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
  await page.screenshot({ path: `${SHOTS}/lab-400-full-light.png`, fullPage: true })
})
