// Week 10 on the lecture-first path (DECISION_LOG A21, A24: the current approved template): the dashboard shows Week 10
// as available; the student's walk Week 10 → lecture slides (both sessions) → lesson → worked examples (the instructor's
// dispositions folded until asked for) → laboratory → lab tool (refuse a wrong file and an AeroLink file, import the
// team's Week 9 model and Week 4 and Week 2 exports, map a scenario step with a short entry, export model v0.3 and the
// behavior review) → assessment (quiz, exercise rubric with level descriptors); the checker link goes to the Week 8
// guide; the archived earlier Week 10 page; axe in light and dark at 1440×900 and 400 px on every Week 10 page.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { week2Fixture } from '../src/workbench/week2/fixture'
import { modelInputs as week2Inputs } from '../src/workbench/week2/record'
import { week4Fixture } from '../src/workbench/week4/fixture'
import { modelInputs as week4Inputs } from '../src/workbench/week4/record'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const PAGES = ['/week/10', '/week/10/lecture/1', '/week/10/lecture/2', '/week/10/lesson', '/week/10/examples', '/week/10/lab', '/week/10/lab/tool', '/week/10/assessment']
const HERE = path.dirname(fileURLToPath(import.meta.url))
/** The fixture team's Week 9 model, as the Week 9 lab tool exported it (the checked course file). */
const WEEK9_SYSML = readFileSync(path.join(HERE, '..', 'sysml', 'lectures', 'week09', 'labtool_team07_model_v02.sysml'), 'utf8')
const AEROLINK_SYSML = readFileSync(path.join(HERE, '..', 'sysml', 'lectures', 'week09', 'aerolink_needs_requirements_v02.sysml'), 'utf8')
const WEEK4_JSON = JSON.stringify(week4Inputs(week4Fixture()))
const WEEK2_JSON = JSON.stringify(week2Inputs(week2Fixture()))

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
  await page.getByTestId('w10-import-week9').setInputFiles(file('team-07-model-v02.sysml', WEEK9_SYSML, 'text/plain'))
  await expect(page.getByTestId('w10-message')).toContainText('team-07-model-v02.sysml')
  await page.getByTestId('w10-import-week4').setInputFiles(file('team-07-week4-model-inputs.json', WEEK4_JSON))
  await expect(page.getByTestId('w10-message')).toContainText('team-07-week4-model-inputs.json')
  await page.getByTestId('w10-import-week2').setInputFiles(file('team-07-week2-model-inputs.json', WEEK2_JSON))
  await expect(page.getByTestId('w10-preview')).toBeVisible()
}
/** The lab tool at its widest: a mapped scenario (mapping table, item flows, cross-check) and a filled states editor. */
async function fillTool(page: Page) {
  await page.getByTestId('w10-scenario').selectOption('SCN-002')
  await page.getByTestId('w10-step-fn-1').selectOption('FN-005')
  await page.getByTestId('w10-step-fn-2').selectOption('FN-006')
  await page.getByTestId('w10-alt-at-A1').selectOption('before')
  await expect(page.getByTestId('w10-mapping')).toContainText('before step 3')
  await page.getByTestId('w10-sm-name').fill('Freezer states with a long name to stress the layout')
  for (let i = 0; i < 4; i++) await page.getByTestId('w10-add-state').click()
  for (const [i, n] of ['cold', 'alarmRaised', 'stockInBackup', 'quarantine'].entries()) await page.getByTestId(`w10-state-name-${i}`).fill(n)
  for (let i = 0; i < 3; i++) await page.getByTestId('w10-add-transition').click()
  for (let i = 0; i < 3; i++) await page.getByTestId(`w10-tr-trigger-${i}`).fill(`SignalNumber${i}WithALongName`)
}

test('dashboard: Week 10 is available, with its path card and an "Available" badge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/dashboard')
  const card = page.getByTestId('week10-path-card')
  await expect(card).toBeVisible()
  await expect(card).toContainText('Available')
  await card.getByRole('link', { name: 'Week page' }).click()
  await expect(page).toHaveURL(/#\/week\/10$/)
  await expect(page.getByTestId('week10-home')).toBeVisible()
})

test('the Week 10 walk: week page → slides → lesson → examples → lab → assessment, with the week navigation on every page', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/10')
  await expect(page.getByRole('heading', { level: 1, name: /Week 10 — Logical \/ Behavioral Modeling/ })).toBeVisible()
  const total = Number(await page.getByTestId('workload-total').textContent())
  expect(total).toBeLessThanOrEqual(8.0)
  await expect(page.getByTestId('entry-checker')).toHaveAttribute('href', /week\/8\/lab\/checker/)
  await page.getByTestId('entry-lecture').getByRole('link', { name: 'Session 1 slides' }).click()
  await expect(page).toHaveURL(/#\/week\/10\/lecture\/1/)
  await expect(page.getByTestId('week-nav')).toBeVisible()
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/week\/10\/lecture\/1\/2$/)
  await page.goto('/#/week/10/lecture/2')
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.getByTestId('week-nav-lesson').click()
  await expect(page).toHaveURL(/#\/week\/10\/lesson/)
  await expect(page.getByTestId('lesson-reader')).toBeVisible()
  await page.getByTestId('week-nav-examples').click()
  await expect(page.getByTestId('week10-examples')).toBeVisible()
  await expect(page.getByTestId('example-mapping-table')).toContainText('planFlight')
  await expect(page.getByTestId('example-alloc-table')).toContainText('REQ-SYS-005')
  await expect(page.getByTestId('example-transition-table')).toContainText('dispatchReadyToInFlight')
  await expect(page.getByTestId('example-model-text')).toContainText("use case <'SCN-002'>")
  const key = page.getByTestId('example-key')
  await expect(key).not.toHaveAttribute('open', '')
  await key.locator('summary').click()
  await expect(key).toContainText('REQ-SYS-013')
  await page.getByTestId('week-nav-lab').click()
  await expect(page.getByTestId('week10-lab')).toBeVisible()
  await expect(page.getByTestId('lab-checker')).toContainText('model-v03.sysml')
  await page.getByTestId('week-nav-assessment').click()
  await expect(page.getByTestId('assessment-quiz')).toContainText('12 questions')
  await expect(page.getByTestId('exercise-rubric')).toContainText('4 Exemplary')
  await page.getByTestId('week-nav-overview').click()
  await expect(page.getByTestId('week10-home')).toBeVisible()
  expect(errors).toEqual([])
})

test('lab tool: refuses wrong files, imports the team’s three files, accepts a short step name, exports model v0.3 and the behavior review', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/10/lab/tool')
  await expect(page.getByTestId('lab-tool-frame')).toBeVisible()
  await page.getByTestId('w10-import-week9').setInputFiles(file('notes.json', '{"format":"something-else"}'))
  await expect(page.getByTestId('w10-message')).toContainText('JSON file')
  await page.getByTestId('w10-import-week9').setInputFiles(file('aerolink.sysml', AEROLINK_SYSML, 'text/plain'))
  await expect(page.getByTestId('w10-message')).toContainText('AeroLink')
  await page.getByTestId('w10-import-week4').setInputFiles(file('team-07-week2-model-inputs.json', WEEK2_JSON))
  await expect(page.getByTestId('w10-message')).toContainText('Week 2')
  await expect(page.getByTestId('w10-preview')).toHaveCount(0)
  await importAll(page)
  await expect(page.getByTestId('w10-preview')).toContainText("action <'FN-001'>")
  await page.getByTestId('w10-scenario').selectOption('SCN-002')
  await page.getByTestId('w10-step-name-3').fill('go')
  await page.getByTestId('w10-step-fn-1').selectOption('FN-005')
  await expect(page.getByTestId('w10-preview')).toContainText("then action go")
  await expect(page.getByTestId('w10-mapping')).toContainText('FN-005')
  const [sysml] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w10-export-sysml').click()])
  expect(sysml.suggestedFilename()).toBe('team-07-model-v03.sysml')
  const body = (await (await sysml.createReadStream()).toArray()).join('')
  expect(body).toContain("use case <'SCN-002'>")
  expect(body).toContain(":> Logical::'FN-005'")
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w10-export-md').click()])
  expect(md.suggestedFilename()).toBe('team-07-behavior-review.md')
  expect(errors).toEqual([])
})

test('the earlier Week 10 page stays in the archive, and the old aliases redirect (the checker alias to the Week 8 guide)', async ({ page }) => {
  await fresh(page, '/archive/week/10')
  await page.waitForLoadState('networkidle')
  await expect(page.getByTestId('archive-banner')).toBeVisible({ timeout: 20_000 })
  await page.goto('/#/week/10/classic')
  await expect(page).toHaveURL(/#\/week\/10$/)
  await page.goto('/#/week/10/lab/checker')
  await expect(page).toHaveURL(/#\/week\/8\/lab\/checker$/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: every Week 10 page at 1440×900 and 400 px — ${theme}`, async ({ page }) => {
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
        if (p === '/week/10/lab/tool') {
          await importAll(page)
          await fillTool(page)
        }
        const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
        expect(r.violations.map((v) => `${p} ${w}px ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([])
        if (w === 400 && !p.includes('/lecture/')) expect(await noHorizontalScroll(page), `${p} scrolls sideways at 400 px`).toBe(true)
      }
    }
  })
}
