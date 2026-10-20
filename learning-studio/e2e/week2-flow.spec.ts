// Week 2 on the lecture-first path (DECISION_LOG A21: the Week 1 architecture is the template): the dashboard shows
// Week 2 as available; the student's walk Week 2 → lecture slides (both sessions) → lesson → worked examples →
// laboratory → lab tool (import the Week 1 export, then a teammate's Week 2 export, then export the versioned record) →
// assessment (quiz); the week navigation on every page; the archived earlier Week 2 page; axe in light and dark at
// 1440×900 and 400 px on every Week 2 page.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { WEEK2_QUIZ } from '../src/content/quizWeek2'
import { modelInputs } from '../src/workbench/week2/record'
import { WEEK1_JSON, week2Fixture } from '../src/workbench/week2/fixture'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const PAGES = ['/week/2', '/week/2/lecture/1', '/week/2/lecture/2', '/week/2/lesson', '/week/2/examples', '/week/2/lab', '/week/2/lab/tool', '/week/2/assessment']

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

test('dashboard: Week 2 is available, with its path card and an "Available" badge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/')
  const card = page.getByTestId('week2-path-card')
  await expect(card).toBeVisible()
  await expect(card).toContainText('Available')
  await card.getByRole('link', { name: 'Week page' }).click()
  await expect(page).toHaveURL(/#\/week\/2$/)
  await expect(page.getByTestId('week2-home')).toBeVisible()
})

test('the Week 2 walk: week page → slides → lesson → examples → lab → assessment, with the week navigation on every page', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/2')
  await expect(page.getByRole('heading', { level: 1, name: /Week 2 — ConOps \/ Requirements/ })).toBeVisible()
  await expect(page.getByTestId('workload-total')).toHaveText('8.0')
  await page.getByTestId('entry-lecture').getByRole('link', { name: 'Session 1 slides' }).click()
  await expect(page).toHaveURL(/#\/week\/2\/lecture\/1/)
  await expect(page.getByTestId('week-nav')).toBeVisible()
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/week\/2\/lecture\/1\/2$/)
  await page.goto('/#/week/2/lecture/2')
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.getByTestId('week-nav-lesson').click()
  await expect(page).toHaveURL(/#\/week\/2\/lesson/)
  await expect(page.getByRole('heading', { name: 'Why Week 2 starts with operations' })).toBeVisible()
  await page.getByTestId('week-nav-examples').click()
  await expect(page.getByTestId('week2-examples')).toBeVisible()
  await expect(page.getByTestId('example-catalogue')).toContainText('REQ-STK-011')
  await page.getByTestId('week-nav-lab').click()
  await expect(page.getByTestId('week2-lab')).toBeVisible()
  await expect(page.getByTestId('lab-procedure')).toContainText('Scenario clinic')
  await page.getByTestId('week-nav-assessment').click()
  await expect(page.getByTestId('assessment-quiz')).toContainText(`${WEEK2_QUIZ.length} questions`)
  await expect(page.getByTestId(`quiz-${WEEK2_QUIZ[0].id}`)).toBeVisible()
  await page.getByTestId('week-nav-overview').click()
  await expect(page.getByTestId('week2-home')).toBeVisible()
  expect(errors).toEqual([])
})

test('lab tool: imports the Week 1 export, rejects a non-Week-1 file, imports a teammate’s Week 2 export and exports the versioned record', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/2/lab/tool')
  await expect(page.getByTestId('w2-tool')).toBeVisible()
  // bad input is refused with a message
  await page.getByTestId('w2-import-week1').setInputFiles(file('notes.json', '{"format":"something-else"}'))
  await expect(page.getByTestId('w2-message')).toBeVisible()
  await expect(page.getByTestId('w2-week1-summary')).toHaveCount(0)
  // good input is accepted
  await page.getByTestId('w2-import-week1').setInputFiles(file('team-07-week1-model-inputs.json', WEEK1_JSON))
  await expect(page.getByTestId('w2-week1-summary')).toBeVisible()
  // a teammate's complete Week 2 export
  await page.getByTestId('w2-import-week2').setInputFiles(file('team-07-week2-model-inputs.json', JSON.stringify(modelInputs(week2Fixture()))))
  await expect(page.getByTestId('w2-part-requirements')).toBeVisible()
  const [js] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w2-export-json').click()])
  expect(js.suggestedFilename()).toMatch(/week2-model-inputs\.json$/)
  const body = JSON.parse((await (await js.createReadStream()).toArray()).join(''))
  expect(body.format).toBe('week2-model-inputs')
  expect(body.version).toBe(1)
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w2-export-md').click()])
  expect(md.suggestedFilename()).toMatch(/week2-record\.md$/)
  expect(errors).toEqual([])
})

test('the earlier Week 2 page stays in the archive, and the old aliases redirect', async ({ page }) => {
  await fresh(page, '/archive/week/2')
  await expect(page.getByTestId('archive-banner')).toBeVisible()
  await page.goto('/#/week/2/classic')
  await expect(page).toHaveURL(/#\/week\/2$/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: every Week 2 page at 1440×900 and 400 px — ${theme}`, async ({ page }) => {
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
