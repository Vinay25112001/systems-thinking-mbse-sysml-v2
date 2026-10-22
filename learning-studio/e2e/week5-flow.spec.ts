// Week 5 on the lecture-first path (DECISION_LOG A21: the Week 1 architecture is the template): the dashboard shows
// Week 5 as available; the student's walk Week 5 → lecture slides (both sessions) → lesson → worked examples →
// laboratory (gate-justification table) → lab tool (refuse a bad file, import the Week 4 export, then a teammate's Week 5
// export, then export the versioned record) → assessment (quiz, descriptor tables); the week navigation on every page;
// the archived earlier Week 5 page; axe in light and dark at 1440×900 and 400 px on every Week 5 page.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { WEEK5_QUIZ } from '../src/content/quizWeek5'
import { modelInputs } from '../src/workbench/week5/record'
import { WEEK4_JSON, week5Fixture } from '../src/workbench/week5/fixture'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const PAGES = ['/week/5', '/week/5/lecture/1', '/week/5/lecture/2', '/week/5/lesson', '/week/5/examples', '/week/5/lab', '/week/5/lab/tool', '/week/5/assessment']

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

test('dashboard: Week 5 is available, with its path card and an "Available" badge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/dashboard') // the dashboard moved to #/dashboard when the course homepage took #/ (Week 1 M4 part A)
  const card = page.getByTestId('week5-path-card')
  await expect(card).toBeVisible()
  await expect(card).toContainText('Available')
  await card.getByRole('link', { name: 'Week page' }).click()
  await expect(page).toHaveURL(/#\/week\/5$/)
  await expect(page.getByTestId('week5-home')).toBeVisible()
})

test('the Week 5 walk: week page → slides → lesson → examples → lab → assessment, with the week navigation on every page', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/5')
  await expect(page.getByRole('heading', { level: 1, name: /Week 5 — Components/ })).toBeVisible()
  const total = Number(await page.getByTestId('workload-total').textContent())
  expect(total).toBeGreaterThan(6)
  expect(total).toBeLessThanOrEqual(8)
  await page.getByTestId('entry-lecture').getByRole('link', { name: 'Session 1 slides' }).click()
  await expect(page).toHaveURL(/#\/week\/5\/lecture\/1/)
  await expect(page.getByTestId('week-nav')).toBeVisible()
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/week\/5\/lecture\/1\/2$/)
  await page.goto('/#/week/5/lecture/2')
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.getByTestId('week-nav-lesson').click()
  await expect(page).toHaveURL(/#\/week\/5\/lesson/)
  await expect(page.getByTestId('lesson-reader')).toContainText('Why this week: what passes between the parts')
  await page.getByTestId('week-nav-examples').click()
  await expect(page.getByTestId('week5-examples')).toBeVisible()
  await expect(page.getByTestId('catalogue-interfaces')).toContainText('IF-015')
  await expect(page.getByTestId('catalogue-n2')).toBeVisible()
  await page.getByTestId('try-paper-solution').locator('summary').click()
  await page.getByTestId('week-nav-lab').click()
  await expect(page.getByTestId('week5-lab')).toBeVisible()
  await expect(page.getByTestId('gate-table')).toBeVisible()
  await page.getByTestId('week-nav-assessment').click()
  await expect(page.getByTestId('assessment-quiz')).toContainText(`${WEEK5_QUIZ.length} questions`)
  await expect(page.getByTestId(`quiz-${WEEK5_QUIZ[0].id}`)).toBeVisible()
  await expect(page.getByTestId('exercise-levels')).toBeVisible()
  await expect(page.getByTestId('graduate-levels')).toBeVisible()
  await page.getByTestId('week-nav-overview').click()
  await expect(page.getByTestId('week5-home')).toBeVisible()
  expect(errors).toEqual([])
})

test('lab tool: rejects a non-Week-4 file, imports the Week 4 export and a teammate’s Week 5 export, and exports the versioned record', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/5/lab/tool')
  await expect(page.getByTestId('w5-tool')).toBeVisible()
  await page.getByTestId('w5-import-week4').setInputFiles(file('notes.json', '{"format":"week3-model-inputs","version":1}'))
  await expect(page.getByTestId('w5-message')).toBeVisible()
  await expect(page.getByTestId('w5-week4-summary')).toHaveCount(0)
  await page.getByTestId('w5-import-week4').setInputFiles(file('team-07-week4-model-inputs.json', WEEK4_JSON))
  await expect(page.getByTestId('w5-week4-summary')).toBeVisible()
  // the record now holds the Week 4 import, so the tool asks before a teammate's file replaces it (review n18)
  let asked = ''
  page.once('dialog', (d) => { asked = d.message(); void d.accept() })
  await page.getByTestId('w5-import-week5').setInputFiles(file('team-07-week5-model-inputs.json', JSON.stringify(modelInputs(week5Fixture()))))
  await expect(page.getByTestId('w5-state')).toHaveText(/^✓ ready/)
  expect(asked).toMatch(/Replace the Week 5 record/)
  await expect(page.getByTestId('w5-n2')).toBeVisible()
  const [js] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w5-export-json').click()])
  expect(js.suggestedFilename()).toMatch(/week5-model-inputs\.json$/)
  const body = JSON.parse((await (await js.createReadStream()).toArray()).join(''))
  expect(body.format).toBe('week5-model-inputs')
  expect(body.version).toBe(1)
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w5-export-md').click()])
  expect(md.suggestedFilename()).toMatch(/week5-record\.md$/)
  expect(errors).toEqual([])
})

test('the earlier Week 5 page stays in the archive, and the old aliases redirect', async ({ page }) => {
  await fresh(page, '/archive/week/5')
  await expect(page.getByTestId('archive-banner')).toBeVisible()
  await page.goto('/#/week/5/classic')
  await expect(page).toHaveURL(/#\/week\/5$/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: every Week 5 page at 1440×900 and 400 px — ${theme}`, async ({ page }) => {
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
