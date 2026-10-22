// Week 9 on the lecture-first path (DECISION_LOG A21, A24: the current approved template): the dashboard shows Week 9 as
// available; the student's walk Week 9 → lecture slides (both sessions) → lesson → worked examples (the instructor's AI
// dispositions folded until asked for) → laboratory → lab tool (refuse a wrong file and an AeroLink-style file, import
// the team's Week 8 model and Week 1 and Week 2 exports, decide a requirement with short entries, export model v0.2 and
// the trace matrix) → assessment (quiz, exercise rubric with level descriptors); the checker link goes to the Week 8
// guide; the archived earlier Week 9 page; axe in light and dark at 1440×900 and 400 px on every Week 9 page.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { teamModelInputs } from '../src/workbench/week1/team'
import { TEAM_FIXTURE } from '../src/workbench/week1/teamFixture'
import { week2Fixture } from '../src/workbench/week2/fixture'
import { modelInputs } from '../src/workbench/week2/record'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const PAGES = ['/week/9', '/week/9/lecture/1', '/week/9/lecture/2', '/week/9/lesson', '/week/9/examples', '/week/9/lab', '/week/9/lab/tool', '/week/9/assessment']
const HERE = path.dirname(fileURLToPath(import.meta.url))
/** The fixture team's Week 8 model, as the Week 8 lab tool exported it (the checked course file). */
const WEEK8_SYSML = readFileSync(path.join(HERE, '..', 'sysml', 'lectures', 'week08', 'labtool_team07_model_v01.sysml'), 'utf8')
const AEROLINK_SYSML = readFileSync(path.join(HERE, '..', 'sysml', 'lectures', 'week08', 'aerolink_context_stakeholders_v01.sysml'), 'utf8')
const WEEK1_JSON = JSON.stringify(teamModelInputs(TEAM_FIXTURE, '2026-10-19'))
const WEEK2_JSON = JSON.stringify(modelInputs(week2Fixture()))

async function fresh(page: Page, p: string) {
  await page.goto('/#/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`/#${p}`)
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
const file = (name: string, text: string, mimeType = 'application/json') => ({ name, mimeType, buffer: Buffer.from(text) })
async function importAll(page: Page) {
  await page.getByTestId('w9-import-week8').setInputFiles(file('team-07-model-v01.sysml', WEEK8_SYSML, 'text/plain'))
  await expect(page.getByTestId('w9-message')).toContainText('team-07-model-v01.sysml')
  await page.getByTestId('w9-import-week1').setInputFiles(file('team-07-week1-model-inputs.json', WEEK1_JSON))
  await expect(page.getByTestId('w9-message')).toContainText('needs')
  await page.getByTestId('w9-import-week2').setInputFiles(file('team-07-week2-model-inputs.json', WEEK2_JSON))
  await expect(page.getByTestId('w9-preview')).toBeVisible()
}

test('dashboard: Week 9 is available, with its path card and an "Available" badge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/dashboard')
  const card = page.getByTestId('week9-path-card')
  await expect(card).toBeVisible()
  await expect(card).toContainText('Available')
  await card.getByRole('link', { name: 'Week page' }).click()
  await expect(page).toHaveURL(/#\/week\/9$/)
  await expect(page.getByTestId('week9-home')).toBeVisible()
})

test('the Week 9 walk: week page → slides → lesson → examples → lab → assessment, with the week navigation on every page', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/9')
  await expect(page.getByRole('heading', { level: 1, name: /Week 9 — Needs \/ Requirements/ })).toBeVisible()
  const total = Number(await page.getByTestId('workload-total').textContent())
  expect(total).toBeLessThanOrEqual(8.0)
  await expect(page.getByTestId('entry-checker')).toHaveAttribute('href', /week\/8\/lab\/checker/)
  await page.getByTestId('entry-lecture').getByRole('link', { name: 'Session 1 slides' }).click()
  await expect(page).toHaveURL(/#\/week\/9\/lecture\/1/)
  await expect(page.getByTestId('week-nav')).toBeVisible()
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/week\/9\/lecture\/1\/2$/)
  await page.goto('/#/week/9/lecture/2')
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.getByTestId('week-nav-lesson').click()
  await expect(page).toHaveURL(/#\/week\/9\/lesson/)
  await expect(page.getByTestId('lesson-reader')).toBeVisible()
  await page.getByTestId('week-nav-examples').click()
  await expect(page.getByTestId('week9-examples')).toBeVisible()
  await expect(page.getByTestId('example-matrix-table')).toContainText('NEED-004')
  await expect(page.getByTestId('example-model-text')).toContainText("requirement <'REQ-STK-021'>")
  const key = page.getByTestId('example-ai-key')
  await expect(key).not.toHaveAttribute('open', '')
  await key.locator('summary').click()
  await expect(key).toContainText('Finding 7')
  await page.getByTestId('week-nav-lab').click()
  await expect(page.getByTestId('week9-lab')).toBeVisible()
  await expect(page.getByTestId('lab-checker')).toContainText('team-07-model-v02.sysml')
  await page.getByTestId('week-nav-assessment').click()
  await expect(page.getByTestId('assessment-quiz')).toContainText('12 questions')
  await expect(page.getByTestId('exercise-rubric')).toContainText('4 Exemplary')
  await page.getByTestId('week-nav-overview').click()
  await expect(page.getByTestId('week9-home')).toBeVisible()
  expect(errors).toEqual([])
})

test('lab tool: refuses wrong files, imports the team’s three files, accepts short entries, exports model v0.2 and the trace matrix', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/9/lab/tool')
  await expect(page.getByTestId('lab-tool-frame')).toBeVisible()
  await page.getByTestId('w9-import-week8').setInputFiles(file('notes.json', '{"format":"something-else"}'))
  await expect(page.getByTestId('w9-message')).toContainText('JSON file')
  await page.getByTestId('w9-import-week8').setInputFiles(file('aerolink.sysml', AEROLINK_SYSML, 'text/plain'))
  await expect(page.getByTestId('w9-message')).toContainText('AeroLink')
  await expect(page.getByTestId('w9-preview')).toHaveCount(0)
  await importAll(page)
  await expect(page.getByTestId('w9-preview')).toContainText("requirement <'NEED-001'>")
  await page.getByTestId('w9-subject-REQ-SYS-004').selectOption('new')
  await page.getByTestId('w9-newname-REQ-SYS-004').fill('Reports')
  await page.getByTestId('w9-feature-REQ-SYS-004').fill('gaps')
  await page.getByTestId('w9-quantity-REQ-SYS-004').selectOption('count')
  await page.getByTestId('w9-op-REQ-SYS-004').selectOption('==')
  await page.getByTestId('w9-value-REQ-SYS-004').fill('0')
  await expect(page.getByTestId('w9-formal-REQ-SYS-004')).toContainText('reports.gaps == 0')
  const [sysml] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w9-export-sysml').click()])
  expect(sysml.suggestedFilename()).toBe('team-07-model-v02.sysml')
  const body = (await (await sysml.createReadStream()).toArray()).join('')
  expect(body).toContain("part def 'Reports'")
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w9-export-md').click()])
  expect(md.suggestedFilename()).toBe('team-07-trace-matrix.md')
  expect(errors).toEqual([])
})

test('the earlier Week 9 page stays in the archive, and the old aliases redirect (the checker alias to the Week 8 guide)', async ({ page }) => {
  await fresh(page, '/archive/week/9')
  await page.waitForLoadState('networkidle')
  await expect(page.getByTestId('archive-banner')).toBeVisible({ timeout: 20_000 })
  await page.goto('/#/week/9/classic')
  await expect(page).toHaveURL(/#\/week\/9$/)
  await page.goto('/#/week/9/lab/checker')
  await expect(page).toHaveURL(/#\/week\/8\/lab\/checker$/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: every Week 9 page at 1440×900 and 400 px — ${theme}`, async ({ page }) => {
    test.setTimeout(300_000)
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
        if (p === '/week/9/lab/tool') await importAll(page)
        const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
        expect(r.violations.map((v) => `${p} ${w}px ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([])
        if (w === 400 && !p.includes('/lecture/')) expect(await noHorizontalScroll(page), `${p} scrolls sideways at 400 px`).toBe(true)
      }
    }
  })
}
