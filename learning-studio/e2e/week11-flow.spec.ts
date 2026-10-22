// Week 11 on the lecture-first path (DECISION_LOG A21, A24: the current approved template): the dashboard shows Week 11
// as available; the student's walk Week 11 → lecture slides (both sessions) → lesson → worked examples (the instructor's
// dispositions folded until asked for) → laboratory → lab tool (refuse a wrong file and an AeroLink file, import the
// team's Week 10 model and Week 5 export, set a crossing with a short entry, export model v0.4 and the interface review)
// → assessment (quiz, exercise rubric with level descriptors); the checker link goes to the Week 8 guide; the archived
// earlier Week 11 page; axe in light and dark at 1440×900 and 400 px on every Week 11 page, the lab tool at its widest.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { week4Fixture } from '../src/workbench/week4/fixture'
import { modelInputs as week4Inputs } from '../src/workbench/week4/record'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const PAGES = ['/week/11', '/week/11/lecture/1', '/week/11/lecture/2', '/week/11/lesson', '/week/11/examples', '/week/11/lab', '/week/11/lab/tool', '/week/11/assessment']
const HERE = path.dirname(fileURLToPath(import.meta.url))
/** The fixture team's Week 10 model, as the Week 10 lab tool exported it (the checked course file). */
const WEEK10_SYSML = readFileSync(path.join(HERE, '..', 'sysml', 'lectures', 'week10', 'labtool_team07_model_v03.sysml'), 'utf8')
const AEROLINK_SYSML = readFileSync(path.join(HERE, '..', 'sysml', 'lectures', 'week10', 'aerolink_logical_behavior_v03.sysml'), 'utf8')
/** The fixture team's Week 5 export as the current tools produce it: its externals continue after the Week 1 externals
 *  of its model (the committed Week 5 fixture predates that fix; Week 11 review m6), so the import is clean. Written by
 *  scripts/build-week11-sysml.mjs; sysmlWeek11.test.ts checks it is current. */
const WEEK5_JSON = readFileSync(path.join(HERE, 'fixtures', 'week11-team07-week5-inputs.json'), 'utf8')
const WEEK4_JSON = JSON.stringify(week4Inputs(week4Fixture()))

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
  await page.getByTestId('w11-import-week10').setInputFiles(file('team-07-model-v03.sysml', WEEK10_SYSML, 'text/plain'))
  await expect(page.getByTestId('w11-message')).toContainText('team-07-model-v03.sysml')
  await page.getByTestId('w11-import-week5').setInputFiles(file('team-07-week5-model-inputs.json', WEEK5_JSON))
  await expect(page.getByTestId('w11-preview')).toBeVisible()
}
/** The lab tool at its widest: crossings set and extended, items added, satisfy claims and requirement allocations filled. */
async function fillTool(page: Page) {
  await page.getByTestId('w11-flow-confirm-IF-001').click()
  await page.getByTestId('w11-flow-add-IF-001').click()
  await page.getByTestId('w11-flow-item-IF-001-1').fill('A crossing with a deliberately long name to stress the layout')
  await page.getByTestId('w11-add-item-information').click()
  await page.getByTestId('w11-item-name-0').fill('Freezer failure warnings with a long descriptive name')
  await page.getByTestId('w11-add-claim').click()
  await page.getByTestId('w11-claim-req-0').selectOption('REQ-SYS-003')
  await page.getByTestId('w11-claim-by-0').selectOption('PHY-002')
  await page.getByTestId('w11-claim-value-0').fill("4 ['°C']")
  await page.getByTestId('w11-claim-basis-0').fill('Refrigeration unit data sheet with a long explanation of the test conditions')
  await page.getByTestId('w11-add-reqpart').click()
  await page.getByTestId('w11-reqpart-els-0').fill('PHY-002, PHY-005')
}

test('dashboard: Week 11 is available, with its path card and an "Available" badge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/dashboard')
  const card = page.getByTestId('week11-path-card')
  await expect(card).toBeVisible()
  await expect(card).toContainText('Available')
  await card.getByRole('link', { name: 'Week page' }).click()
  await expect(page).toHaveURL(/#\/week\/11$/)
  await expect(page.getByTestId('week11-home')).toBeVisible()
})

test('the Week 11 walk: week page → slides → lesson → examples → lab → assessment, with the week navigation on every page', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/11')
  await expect(page.getByRole('heading', { level: 1, name: /Week 11 — Physical \/ Interfaces/ })).toBeVisible()
  const total = Number(await page.getByTestId('workload-total').textContent())
  expect(total).toBeLessThanOrEqual(8.0)
  await expect(page.getByTestId('entry-checker')).toHaveAttribute('href', /week\/8\/lab\/checker/)
  await page.getByTestId('entry-lecture').getByRole('link', { name: 'Session 1 slides' }).click()
  await expect(page).toHaveURL(/#\/week\/11\/lecture\/1/)
  await expect(page.getByTestId('week-nav')).toBeVisible()
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/week\/11\/lecture\/1\/2$/)
  await page.goto('/#/week/11/lecture/2')
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.getByTestId('week-nav-lesson').click()
  await expect(page).toHaveURL(/#\/week\/11\/lesson/)
  await expect(page.getByTestId('lesson-reader')).toBeVisible()
  await page.getByTestId('week-nav-examples').click()
  await expect(page.getByTestId('week11-examples')).toBeVisible()
  await expect(page.getByTestId('example-interface-table')).toContainText('IF-005')
  await expect(page.getByTestId('example-alloc-table')).toContainText('LOG-001')
  await expect(page.getByTestId('example-open-table')).toContainText('REQ-SYS-013')
  await expect(page.getByTestId('example-model-text')).toContainText("part <'PHY-001'>")
  const key = page.getByTestId('example-key')
  await expect(key).not.toHaveAttribute('open', '')
  await key.locator('summary').click()
  await expect(key).toContainText('PHY-006')
  await page.getByTestId('week-nav-lab').click()
  await expect(page.getByTestId('week11-lab')).toBeVisible()
  await expect(page.getByTestId('lab-checker')).toContainText('model-v04.sysml')
  await page.getByTestId('week-nav-assessment').click()
  await expect(page.getByTestId('assessment-quiz')).toContainText('12 questions')
  await expect(page.getByTestId('exercise-rubric')).toContainText('4 Exemplary')
  await page.getByTestId('week-nav-overview').click()
  await expect(page.getByTestId('week11-home')).toBeVisible()
  expect(errors).toEqual([])
})

test('lab tool: refuses wrong files, imports the team’s two files, accepts a short crossing, exports model v0.4 and the interface review', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/11/lab/tool')
  await expect(page.getByTestId('lab-tool-frame')).toBeVisible()
  await page.getByTestId('w11-import-week10').setInputFiles(file('notes.json', '{"format":"something-else"}'))
  await expect(page.getByTestId('w11-message')).toContainText('JSON file')
  await page.getByTestId('w11-import-week10').setInputFiles(file('aerolink.sysml', AEROLINK_SYSML, 'text/plain'))
  await expect(page.getByTestId('w11-message')).toContainText('AeroLink')
  await page.getByTestId('w11-import-week5').setInputFiles(file('team-07-week4-model-inputs.json', WEEK4_JSON))
  await expect(page.getByTestId('w11-message')).toContainText('Week 4')
  await expect(page.getByTestId('w11-preview')).toHaveCount(0)
  await importAll(page)
  await expect(page.getByTestId('w11-preview')).toContainText("part <'PHY-001'>")
  await expect(page.locator('[data-finding="ext-collision"], [data-finding="end-collision"]')).toHaveCount(0)
  await page.getByTestId('w11-flow-confirm-IF-001').click()
  await page.getByTestId('w11-flow-item-IF-001-0').fill('INFO-001')
  await page.getByTestId('w11-flow-dir-IF-001-0').selectOption('BtoA')
  await expect(page.getByTestId('w11-preview')).toContainText('flow warehouseDockAndWorkshop.pantryOrders to schedulingAndReportingSoftware.pantryOrders;')
  const [sysml] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w11-export-sysml').click()])
  expect(sysml.suggestedFilename()).toBe('team-07-model-v04.sysml')
  const body = (await (await sysml.createReadStream()).toArray()).join('')
  expect(body).toContain("interface <'IF-001'>")
  expect(body).toContain('part physicalArchitecture {')
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w11-export-md').click()])
  expect(md.suggestedFilename()).toBe('team-07-interface-review.md')
  expect(errors).toEqual([])
})

test('the earlier Week 11 page stays in the archive, and the old aliases redirect (the checker alias to the Week 8 guide)', async ({ page }) => {
  await fresh(page, '/archive/week/11')
  await page.waitForLoadState('networkidle')
  await expect(page.getByTestId('archive-banner')).toBeVisible({ timeout: 20_000 })
  await page.goto('/#/week/11/classic')
  await expect(page).toHaveURL(/#\/week\/11$/)
  await page.goto('/#/week/11/practice')
  await expect(page).toHaveURL(/#\/week\/11\/lab$/)
  await page.goto('/#/week/11/lab/checker')
  await expect(page).toHaveURL(/#\/week\/8\/lab\/checker$/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: every Week 11 page at 1440×900 and 400 px — ${theme}`, async ({ page }) => {
    test.setTimeout(300_000)
    const errors = trackErrors(page)
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
        if (p === '/week/11/lab/tool') {
          await importAll(page)
          await fillTool(page)
          // the blank-row path that produced duplicate finding keys (review N2)
          await page.getByTestId('w11-flow-add-IF-001').click()
          await page.getByTestId('w11-flow-add-IF-001').click()
          await page.getByTestId('w11-add-reqpart').click()
        }
        const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
        expect(r.violations.map((v) => `${p} ${w}px ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([])
        if (w === 400 && !p.includes('/lecture/')) expect(await noHorizontalScroll(page), `${p} scrolls sideways at 400 px`).toBe(true)
      }
    }
    // console errors too (duplicate React keys among them; Week 10 C1, Week 11 review N2)
    expect(errors).toEqual([])
  })
}
