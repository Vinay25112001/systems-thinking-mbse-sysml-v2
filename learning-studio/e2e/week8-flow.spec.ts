// Week 8 on the lecture-first path (DECISION_LOG A21: the Week 1 architecture is the template): the dashboard shows
// Week 8 as available; the student's walk Week 8 → lecture slides (both sessions) → lesson → worked examples →
// laboratory → lab tool (import the Week 1 Team Record export, refuse a wrong file, add the Week 2 export, export the
// generated model and the mapping matrix) → assessment (quiz); the week navigation on every page; the archived earlier
// Week 8 page; axe in light and dark at 1440×900 and 400 px on every Week 8 page.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { WEEK8_QUIZ } from '../src/content/quizWeek8'
import { teamModelInputs } from '../src/workbench/week1/team'
import { TEAM_FIXTURE } from '../src/workbench/week1/teamFixture'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const PAGES = ['/week/8', '/week/8/lecture/1', '/week/8/lecture/2', '/week/8/lesson', '/week/8/examples', '/week/8/lab', '/week/8/lab/tool', '/week/8/lab/checker', '/week/8/assessment']
const WEEK1_JSON = JSON.stringify(teamModelInputs(TEAM_FIXTURE, '2026-10-19'))
/** A minimal Week 2 export (format week2-model-inputs, version 1) for the same fictional team. */
const WEEK2_JSON = JSON.stringify({
  format: 'week2-model-inputs',
  version: 1,
  team: '07',
  week1: { team: '07', enterprise: 'Riverside Food Bank Network', stakeholders: [{ id: 'STK-001', name: 'Families using partner pantries' }] },
  scenarios: [{ id: 'SCN-001', name: 'Weekly delivery round' }],
  capabilities: [{ id: 'CAP-001', name: 'Cold-chain delivery' }],
  requirements: [{ id: 'REQ-STK-001', name: 'Produce until closing' }, { id: 'REQ-SYS-001', name: 'Van temperature logging' }],
  moes: [{ id: 'MOE-001', name: 'Share of pantries stocked at closing' }],
  mops: [],
  uncertainties: [{ id: 'A-001', name: 'Donor volumes stay at 2026 levels' }],
  needsAdded: [],
})

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
const file = (name: string, text: string) => ({ name, mimeType: 'application/json', buffer: Buffer.from(text) })

test('dashboard: Week 8 is available, with its path card and an "Available" badge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/')
  const card = page.getByTestId('week8-path-card')
  await expect(card).toBeVisible()
  await expect(card).toContainText('Available')
  await card.getByRole('link', { name: 'Week page' }).click()
  await expect(page).toHaveURL(/#\/week\/8$/)
  await expect(page.getByTestId('week8-home')).toBeVisible()
})

test('the Week 8 walk: week page → slides → lesson → examples → lab → assessment, with the week navigation on every page', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/8')
  await expect(page.getByRole('heading', { level: 1, name: /Week 8 — Import Systems Thinking Artifacts \/ Stakeholders/ })).toBeVisible()
  const total = Number(await page.getByTestId('workload-total').textContent())
  expect(total).toBeLessThanOrEqual(8.0)
  await page.getByTestId('entry-lecture').getByRole('link', { name: 'Session 1 slides' }).click()
  await expect(page).toHaveURL(/#\/week\/8\/lecture\/1/)
  await expect(page.getByTestId('week-nav')).toBeVisible()
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/week\/8\/lecture\/1\/2$/)
  await page.goto('/#/week/8/lecture/2')
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.getByTestId('week-nav-lesson').click()
  await expect(page).toHaveURL(/#\/week\/8\/lesson/)
  await expect(page.getByTestId('lesson-reader')).toBeVisible()
  await page.getByTestId('week-nav-examples').click()
  await expect(page.getByTestId('week8-examples')).toBeVisible()
  await expect(page.getByTestId('example-matrix-table')).toContainText('STK')
  await expect(page.getByTestId('example-model-text')).toContainText("concern <'CON-017'>")
  await page.getByTestId('week-nav-lab').click()
  await expect(page.getByTestId('week8-lab')).toBeVisible()
  await page.getByTestId('week-nav-assessment').click()
  await expect(page.getByTestId('assessment-quiz')).toContainText(`${WEEK8_QUIZ.length} questions`)
  await expect(page.getByTestId(`quiz-${WEEK8_QUIZ[0].id}`)).toBeVisible()
  await page.getByTestId('week-nav-overview').click()
  await expect(page.getByTestId('week8-home')).toBeVisible()
  expect(errors).toEqual([])
})

test('lab tool: refuses a wrong file, imports the Week 1 export and a Week 2 export, previews and exports model v0.1 and the matrix', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/8/lab/tool')
  await expect(page.getByTestId('lab-tool-frame')).toBeVisible()
  // bad input is refused with a message and no preview
  await page.getByTestId('w8-import-week1').setInputFiles(file('notes.json', '{"format":"something-else"}'))
  await expect(page.getByTestId('w8-message')).toBeVisible()
  await expect(page.getByTestId('w8-preview')).toHaveCount(0)
  // good input is accepted
  await page.getByTestId('w8-import-week1').setInputFiles(file('team-07-week1-model-inputs.json', WEEK1_JSON))
  await expect(page.getByTestId('w8-summary')).toContainText('Riverside Food Bank Network')
  await expect(page.getByTestId('w8-preview')).toContainText("package 'Riverside Food Bank Network Model'")
  await expect(page.getByTestId('w8-mapping')).toContainText('STK')
  await page.getByTestId('w8-import-week2').setInputFiles(file('team-07-week2-model-inputs.json', WEEK2_JSON))
  await expect(page.getByTestId('w8-preview')).toContainText('REQ-STK-001')
  await page.getByTestId('w8-purpose').fill('Used by the team and its instructor to trace each delivery decision to the stakeholder concern it serves.')
  await expect(page.getByTestId('w8-preview')).toContainText('Used by the team and its instructor')
  const [sysml] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w8-export-sysml').click()])
  expect(sysml.suggestedFilename()).toMatch(/model-v01\.sysml$/)
  const body = (await (await sysml.createReadStream()).toArray()).join('')
  expect(body).toContain("concern <'CON-001'>")
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w8-export-md').click()])
  expect(md.suggestedFilename()).toMatch(/mapping-matrix\.md$/)
  expect(errors).toEqual([])
})

test('the checker install guide: linked from the week page and the lab, commands for each system, the course files to download, the recorded tool proof', async ({ page }) => {
  const errors = trackErrors(page)
  await fresh(page, '/week/8')
  await page.getByTestId('entry-checker').click()
  await expect(page.getByTestId('week8-checker')).toBeVisible()
  await expect(page.getByTestId('week-nav-lab')).toHaveAttribute('aria-current', 'page')
  for (const os of ['windows', 'macos', 'linux'] as const) {
    await page.getByTestId(`checker-os-${os}`).click()
    await expect(page.getByTestId(`checker-os-${os}`)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('checker-step-proof')).toContainText('check_sysml.py')
  }
  await page.getByTestId('checker-os-macos').click()
  await expect(page.getByTestId('checker-step-java')).toContainText('Contents/Home')
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('checker-download-check_sysml.py').click()])
  expect(dl.suggestedFilename()).toBe('check_sysml.py')
  await expect(page.getByTestId('checker-output')).toContainText("ERROR   9:12     mismatched input '-' expecting '>'")
  await page.getByTestId('checker-back-to-lab').click()
  await expect(page.getByTestId('week8-lab')).toBeVisible()
  await expect(page.getByTestId('open-checker-guide')).toBeVisible()
  expect(errors).toEqual([])
})

test('the earlier Week 8 page stays in the archive, and the old aliases redirect', async ({ page }) => {
  await fresh(page, '/archive/week/8')
  await page.waitForLoadState('networkidle')
  // the archive page is a lazy chunk: allow for a slow first load under parallel agents
  await expect(page.getByTestId('archive-banner')).toBeVisible({ timeout: 20_000 })
  await page.goto('/#/week/8/classic')
  await expect(page).toHaveURL(/#\/week\/8$/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: every Week 8 page at 1440×900 and 400 px — ${theme}`, async ({ page }) => {
    test.setTimeout(240_000)
    await page.emulateMedia({ colorScheme: theme })
    for (const [w, h] of [
      [1440, 900],
      [400, 860],
    ] as const) {
      await page.setViewportSize({ width: w, height: h })
      for (const p of PAGES) {
        await fresh(page, p)
        await page.waitForLoadState('networkidle')
        await expect(page.locator('main, [role="main"], #main').first()).toBeVisible()
        if (p === '/week/8/lab/tool') {
          await page.getByTestId('w8-import-week1').setInputFiles(file('team-07-week1-model-inputs.json', WEEK1_JSON))
          await expect(page.getByTestId('w8-preview')).toBeVisible()
        }
        const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
        expect(r.violations.map((v) => `${p} ${w}px ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([])
        if (w === 400 && !p.includes('/lecture/')) expect(await noHorizontalScroll(page), `${p} scrolls sideways at 400 px`).toBe(true)
      }
    }
  })
}
