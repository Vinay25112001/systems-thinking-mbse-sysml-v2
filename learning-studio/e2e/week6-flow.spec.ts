// Week 6 on the lecture-first path (DECISION_LOG A21, A24: the current lecture template): the dashboard shows Week 6 as
// available; the student's walk Week 6 → lecture slides (both sessions) → lesson → worked examples → laboratory
// (gate-justification table and the empty-answer rule) → lab tool (refuse a bad file, import the Week 5 export, then a
// teammate's Week 6 export after the confirmation, then export the versioned record) → assessment (quiz, descriptor
// tables); the week navigation on every page; the archived earlier Week 6 page; axe in light and dark at 1440×900 and
// 400 px on every Week 6 page. Template: e2e/week5-flow.spec.ts.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { WEEK6_QUIZ } from '../src/content/quizWeek6'
import { modelInputs } from '../src/workbench/week6/record'
import { WEEK5_JSON, week6Fixture } from '../src/workbench/week6/fixture'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const PAGES = ['/week/6', '/week/6/lecture/1', '/week/6/lecture/2', '/week/6/lesson', '/week/6/examples', '/week/6/lab', '/week/6/lab/tool', '/week/6/assessment']

async function fresh(page: Page, path: string) {
  await page.goto('/#/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`/#${path}`)
}
function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    // the course-server session probe (/api/..., the concurrent auth work) fails when no course server runs; it is not a
    // Week 6 page error, so it is ignored here, and only here
    if (m.type() === 'error' && !(m.text().startsWith('Failed to load resource') && m.location().url.includes('/api/'))) errors.push(`console: ${m.text()}`)
  })
  return errors
}
const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
const file = (name: string, text: string) => ({ name, mimeType: 'application/json', buffer: Buffer.from(text) })

test('dashboard: Week 6 is available, with its path card and an "Available" badge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  // the dashboard moved to #/dashboard when the course homepage took #/ (Week 1 M4 part A, spec §a)
  await fresh(page, '/dashboard')
  const card = page.getByTestId('week6-path-card')
  // the dashboard is a lazy chunk: a cold dev server can need longer than the default 5 s on the first visit (as app.spec m1)
  await expect(card).toBeVisible({ timeout: 30_000 })
  await expect(card).toContainText('Available')
  await card.getByRole('link', { name: 'Week page' }).click()
  await expect(page).toHaveURL(/#\/week\/6$/)
  await expect(page.getByTestId('week6-home')).toBeVisible()
})

test('the Week 6 walk: week page → slides → lesson → examples → lab → assessment, with the week navigation on every page', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/6')
  await expect(page.getByRole('heading', { level: 1, name: /Week 6 — Evolution Roadmap/ })).toBeVisible()
  const total = Number(await page.getByTestId('workload-total').textContent())
  expect(total).toBeGreaterThan(6)
  expect(total).toBeLessThanOrEqual(8)
  await page.getByTestId('entry-lecture').getByRole('link', { name: 'Session 1 slides' }).click()
  await expect(page).toHaveURL(/#\/week\/6\/lecture\/1/)
  await expect(page.getByTestId('week-nav')).toBeVisible()
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/week\/6\/lecture\/1\/2$/)
  await page.goto('/#/week/6/lecture/2')
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.getByTestId('week-nav-lesson').click()
  await expect(page).toHaveURL(/#\/week\/6\/lesson/)
  await expect(page.getByTestId('lesson-reader')).toContainText('Why this week: from what is to what comes next')
  await page.getByTestId('week-nav-examples').click()
  await expect(page.getByTestId('week6-examples')).toBeVisible()
  await expect(page.getByTestId('catalogue-increments')).toContainText('INC-003')
  await expect(page.getByTestId('catalogue-impact')).toBeVisible()
  await page.getByTestId('try-paper-solution').locator('summary').click()
  await page.getByTestId('week-nav-lab').click()
  await expect(page.getByTestId('week6-lab')).toBeVisible()
  await expect(page.getByTestId('gate-table')).toBeVisible()
  await expect(page.getByTestId('gate-table')).toContainText('Session 1, slide')
  await expect(page.getByTestId('lab-empty-answer-rule')).toContainText('n/a')
  await page.getByTestId('week-nav-assessment').click()
  await expect(page.getByTestId('assessment-quiz')).toContainText(`${WEEK6_QUIZ.length} questions`)
  await expect(page.getByTestId(`quiz-${WEEK6_QUIZ[0].id}`)).toBeVisible()
  await expect(page.getByTestId('exercise-levels')).toBeVisible()
  await expect(page.getByTestId('graduate-levels')).toBeVisible()
  await page.getByTestId('week-nav-overview').click()
  await expect(page.getByTestId('week6-home')).toBeVisible()
  expect(errors).toEqual([])
})

test('lab tool: rejects a non-Week-5 file, imports the Week 5 export and a teammate’s Week 6 export, and exports the versioned record', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/6/lab/tool')
  await expect(page.getByTestId('w6-tool')).toBeVisible()
  await page.getByTestId('w6-import-week5').setInputFiles(file('notes.json', '{"format":"week4-model-inputs","version":1}'))
  await expect(page.getByTestId('w6-message')).toBeVisible()
  await expect(page.getByTestId('w6-week5-summary')).toHaveCount(0)
  await page.getByTestId('w6-import-week5').setInputFiles(file('team-07-week5-model-inputs.json', WEEK5_JSON))
  await expect(page.getByTestId('w6-week5-summary')).toBeVisible()
  // the record now holds the Week 5 import, so the tool asks before a teammate's file replaces it (A22)
  let asked = ''
  page.once('dialog', (d) => { asked = d.message(); void d.accept() })
  await page.getByTestId('w6-import-week6').setInputFiles(file('team-07-week6-model-inputs.json', JSON.stringify(modelInputs(week6Fixture()))))
  await expect(page.getByTestId('w6-state')).toHaveText(/^✓ ready/)
  expect(asked).toMatch(/Replace the Week 6 record/)
  await expect(page.getByTestId('w6-roadmap')).toBeVisible()
  const [js] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w6-export-json').click()])
  expect(js.suggestedFilename()).toMatch(/week6-model-inputs\.json$/)
  const body = JSON.parse((await (await js.createReadStream()).toArray()).join(''))
  expect(body.format).toBe('week6-model-inputs')
  expect(body.version).toBe(1)
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w6-export-md').click()])
  expect(md.suggestedFilename()).toMatch(/week6-record\.md$/)
  expect(errors).toEqual([])
})

test('the earlier Week 6 page stays in the archive, and the old aliases redirect', async ({ page }) => {
  await fresh(page, '/archive/week/6')
  await expect(page.getByTestId('archive-banner')).toBeVisible()
  await page.goto('/#/week/6/classic')
  await expect(page).toHaveURL(/#\/week\/6$/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: every Week 6 page at 1440×900 and 400 px — ${theme}`, async ({ page }) => {
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
