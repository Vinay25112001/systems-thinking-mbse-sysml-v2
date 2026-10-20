// Week 3 on the lecture-first path (DECISION_LOG A21: the Week 1 architecture is the template): the dashboard shows
// Week 3 as available; the student's walk Week 3 → lecture slides (both sessions) → lesson → worked examples →
// laboratory → lab tool (refuse a bad file, import the Week 2 export, then a teammate's Week 3 export, then export the
// versioned record) → assessment (quiz); the week navigation on every page; the archived earlier Week 3 page; axe in
// light and dark at 1440×900 and 400 px on every Week 3 page.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { WEEK3_QUIZ } from '../src/content/quizWeek3'
import { modelInputs } from '../src/workbench/week3/record'
import { WEEK2_JSON, week3Fixture } from '../src/workbench/week3/fixture'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const PAGES = ['/week/3', '/week/3/lecture/1', '/week/3/lecture/2', '/week/3/lesson', '/week/3/examples', '/week/3/lab', '/week/3/lab/tool', '/week/3/assessment']

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

test('dashboard: Week 3 is available, with its path card and an "Available" badge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/')
  const card = page.getByTestId('week3-path-card')
  await expect(card).toBeVisible()
  await expect(card).toContainText('Available')
  await card.getByRole('link', { name: 'Week page' }).click()
  await expect(page).toHaveURL(/#\/week\/3$/)
  await expect(page.getByTestId('week3-home')).toBeVisible()
})

test('the Week 3 walk: week page → slides → lesson → examples → lab → assessment, with the week navigation on every page', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/3')
  await expect(page.getByRole('heading', { level: 1, name: /Week 3 — Technology Assessment/ })).toBeVisible()
  // week3Path imports the lecture registry, which Node cannot load outside Vite (import.meta.glob); the unit test checks the
  // value, so here only the shape and the 8.0 h budget are checked
  const total = Number(await page.getByTestId('workload-total').textContent())
  expect(total).toBeGreaterThan(6)
  expect(total).toBeLessThanOrEqual(8)
  await page.getByTestId('entry-lecture').getByRole('link', { name: 'Session 1 slides' }).click()
  await expect(page).toHaveURL(/#\/week\/3\/lecture\/1/)
  await expect(page.getByTestId('week-nav')).toBeVisible()
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/week\/3\/lecture\/1\/2$/)
  await page.goto('/#/week/3/lecture/2')
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.getByTestId('week-nav-lesson').click()
  await expect(page).toHaveURL(/#\/week\/3\/lesson/)
  await expect(page.getByTestId('lesson-reader')).toContainText('Why this week: making uncertainty explicit')
  await page.getByTestId('week-nav-examples').click()
  await expect(page.getByTestId('week3-examples')).toBeVisible()
  await expect(page.getByTestId('example-catalogue')).toContainText('R-010')
  await expect(page.getByTestId('catalogue-sensitivity')).toContainText('0.150')
  await expect(page.getByTestId('catalogue-sensitivity')).not.toContainText('0.478')
  await expect(page.getByTestId('catalogue-unknowns')).toContainText('re-dated')
  await expect(page.getByTestId('catalogue-requirements')).toContainText('REQ-STK-019')
  await page.getByTestId('week-nav-lab').click()
  await expect(page.getByTestId('week3-lab')).toBeVisible()
  await page.getByTestId('week-nav-assessment').click()
  await expect(page.getByTestId('assessment-quiz')).toContainText(`${WEEK3_QUIZ.length} questions`)
  await expect(page.getByTestId(`quiz-${WEEK3_QUIZ[0].id}`)).toBeVisible()
  await page.getByTestId('week-nav-overview').click()
  await expect(page.getByTestId('week3-home')).toBeVisible()
  expect(errors).toEqual([])
})

test('lab tool: rejects a non-Week-2 file, imports the Week 2 export and a teammate’s Week 3 export, and exports the versioned record', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/3/lab/tool')
  await expect(page.getByTestId('w3-tool')).toBeVisible()
  // bad input is refused with a message, and nothing is imported
  await page.getByTestId('w3-import-week2').setInputFiles(file('notes.json', '{"format":"week1-model-inputs","version":3}'))
  await expect(page.getByTestId('w3-message')).toBeVisible()
  await expect(page.getByTestId('w3-week2-summary')).toHaveCount(0)
  // good input is accepted
  await page.getByTestId('w3-import-week2').setInputFiles(file('team-07-week2-model-inputs.json', WEEK2_JSON))
  await expect(page.getByTestId('w3-week2-summary')).toBeVisible()
  // a teammate's complete Week 3 export
  await page.getByTestId('w3-import-week3').setInputFiles(file('team-07-week3-model-inputs.json', JSON.stringify(modelInputs(week3Fixture()))))
  await expect(page.getByTestId('w3-trade-results')).toBeVisible()
  await expect(page.getByTestId('w3-sensitivity')).toBeVisible()
  const [js] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w3-export-json').click()])
  expect(js.suggestedFilename()).toMatch(/week3-model-inputs\.json$/)
  const body = JSON.parse((await (await js.createReadStream()).toArray()).join(''))
  expect(body.format).toBe('week3-model-inputs')
  expect(body.version).toBe(1)
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w3-export-md').click()])
  expect(md.suggestedFilename()).toMatch(/week3-record\.md$/)
  expect(errors).toEqual([])
})

test('the earlier Week 3 page stays in the archive, and the old aliases redirect', async ({ page }) => {
  await fresh(page, '/archive/week/3')
  await expect(page.getByTestId('archive-banner')).toBeVisible()
  await page.goto('/#/week/3/classic')
  await expect(page).toHaveURL(/#\/week\/3$/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: every Week 3 page at 1440×900 and 400 px — ${theme}`, async ({ page }) => {
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
