// Week 4 on the lecture-first path (DECISION_LOG A21: the Week 1 architecture is the template): the dashboard shows
// Week 4 as available; the student's walk Week 4 → lecture slides (both sessions) → lesson → worked examples →
// laboratory → lab tool (refuse a bad file, import the Week 3 export, then a teammate's Week 4 export, then export the
// versioned record) → assessment (quiz); the week navigation on every page; the archived earlier Week 4 page; axe in
// light and dark at 1440×900 and 400 px on every Week 4 page.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { WEEK4_QUIZ } from '../src/content/quizWeek4'
import { modelInputs } from '../src/workbench/week4/record'
import { WEEK3_JSON, week4Fixture } from '../src/workbench/week4/fixture'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const PAGES = ['/week/4', '/week/4/lecture/1', '/week/4/lecture/2', '/week/4/lesson', '/week/4/examples', '/week/4/lab', '/week/4/lab/tool', '/week/4/assessment']

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

test('dashboard: Week 4 is available, with its path card and an "Available" badge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/')
  const card = page.getByTestId('week4-path-card')
  await expect(card).toBeVisible()
  await expect(card).toContainText('Available')
  await card.getByRole('link', { name: 'Week page' }).click()
  await expect(page).toHaveURL(/#\/week\/4$/)
  await expect(page.getByTestId('week4-home')).toBeVisible()
})

test('the Week 4 walk: week page → slides → lesson → examples → lab → assessment, with the week navigation on every page', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/4')
  await expect(page.getByRole('heading', { level: 1, name: /Week 4 — Architecture/ })).toBeVisible()
  const total = Number(await page.getByTestId('workload-total').textContent())
  expect(total).toBeGreaterThan(6)
  expect(total).toBeLessThanOrEqual(8)
  await page.getByTestId('entry-lecture').getByRole('link', { name: 'Session 1 slides' }).click()
  await expect(page).toHaveURL(/#\/week\/4\/lecture\/1/)
  await expect(page.getByTestId('week-nav')).toBeVisible()
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/week\/4\/lecture\/1\/2$/)
  await page.goto('/#/week/4/lecture/2')
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.getByTestId('week-nav-lesson').click()
  await expect(page).toHaveURL(/#\/week\/4\/lesson/)
  await expect(page.getByTestId('lesson-reader')).toContainText('Why this week: the first how')
  await page.getByTestId('week-nav-examples').click()
  await expect(page.getByTestId('week4-examples')).toBeVisible()
  await expect(page.getByTestId('catalogue-routes')).toContainText('NO: finding for Week 5')
  await expect(page.getByTestId('catalogue-allocation')).toContainText('FN-017')
  await page.getByTestId('week-nav-lab').click()
  await expect(page.getByTestId('week4-lab')).toBeVisible()
  await page.getByTestId('week-nav-assessment').click()
  await expect(page.getByTestId('assessment-quiz')).toContainText(`${WEEK4_QUIZ.length} questions`)
  await expect(page.getByTestId(`quiz-${WEEK4_QUIZ[0].id}`)).toBeVisible()
  await page.getByTestId('week-nav-overview').click()
  await expect(page.getByTestId('week4-home')).toBeVisible()
  expect(errors).toEqual([])
})

test('lab tool: rejects a non-Week-3 file, imports the Week 3 export and a teammate’s Week 4 export, and exports the versioned record', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/4/lab/tool')
  await expect(page.getByTestId('w4-tool')).toBeVisible()
  await page.getByTestId('w4-import-week3').setInputFiles(file('notes.json', '{"format":"week2-model-inputs","version":2}'))
  await expect(page.getByTestId('w4-message')).toBeVisible()
  await expect(page.getByTestId('w4-week3-summary')).toHaveCount(0)
  await page.getByTestId('w4-import-week3').setInputFiles(file('team-07-week3-model-inputs.json', WEEK3_JSON))
  await expect(page.getByTestId('w4-week3-summary')).toBeVisible()
  await expect(page.getByTestId('w4-VP-005')).toBeVisible()
  await page.getByTestId('w4-import-week4').setInputFiles(file('team-07-week4-model-inputs.json', JSON.stringify(modelInputs(week4Fixture()))))
  await expect(page.getByTestId('w4-state')).toHaveText(/^✓ ready/)
  await expect(page.getByTestId('w4-allocation-table')).toBeVisible()
  const [js] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w4-export-json').click()])
  expect(js.suggestedFilename()).toMatch(/week4-model-inputs\.json$/)
  const body = JSON.parse((await (await js.createReadStream()).toArray()).join(''))
  expect(body.format).toBe('week4-model-inputs')
  expect(body.version).toBe(1)
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w4-export-md').click()])
  expect(md.suggestedFilename()).toMatch(/week4-record\.md$/)
  expect(errors).toEqual([])
})

test('the earlier Week 4 page stays in the archive, and the old aliases redirect', async ({ page }) => {
  await fresh(page, '/archive/week/4')
  await expect(page.getByTestId('archive-banner')).toBeVisible()
  await page.goto('/#/week/4/classic')
  await expect(page).toHaveURL(/#\/week\/4$/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: every Week 4 page at 1440×900 and 400 px — ${theme}`, async ({ page }) => {
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
        const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
        expect(r.violations.map((v) => `${p} ${w}px ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([])
        if (w === 400 && !p.includes('/lecture/')) expect(await noHorizontalScroll(page), `${p} scrolls sideways at 400 px`).toBe(true)
      }
    }
  })
}
