// Week 7 on the lecture-first path (DECISION_LOG A21 decision 7, A24: the current lecture template): the dashboard shows
// Week 7 as available; the student's walk Week 7 → lecture slides (both sessions) → lesson → worked examples → laboratory
// (gate-justification table, the empty-answer rule, the review instructions) → package tool (refuse a wrong file, load the
// six weekly exports, then a teammate's package after the confirmation, then export the versioned package) → assessment
// (the rubric, the RID form, no quiz); the week navigation on every page; the archived earlier Week 7 page; axe in light
// and dark at 1440×900 and 400 px on every Week 7 page. Template: e2e/week6-flow.spec.ts.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { packageJson } from '../src/workbench/week7/record'
import { SOURCE_JSONS, week7Fixture } from '../src/workbench/week7/fixture'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const PAGES = ['/week/7', '/week/7/lecture/1', '/week/7/lecture/2', '/week/7/lesson', '/week/7/examples', '/week/7/lab', '/week/7/lab/tool', '/week/7/assessment']

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
    // Week 7 page error, so it is ignored here, and only here
    if (m.type() === 'error' && !(m.text().startsWith('Failed to load resource') && m.location().url.includes('/api/'))) errors.push(`console: ${m.text()}`)
  })
  return errors
}
const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
const file = (name: string, text: string) => ({ name, mimeType: 'application/json', buffer: Buffer.from(text) })

test('dashboard: Week 7 is available, with its path card and an "Available" badge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/dashboard')
  const card = page.getByTestId('week7-path-card')
  // the dashboard is a lazy chunk: a cold dev server can need longer than the default 5 s on the first visit
  await expect(card).toBeVisible({ timeout: 30_000 })
  await expect(card).toContainText('Available')
  await card.getByRole('link', { name: 'Week page' }).click()
  await expect(page).toHaveURL(/#\/week\/7$/)
  await expect(page.getByTestId('week7-home')).toBeVisible()
})

test('the Week 7 walk: week page → slides → lesson → examples → lab → assessment, with the week navigation on every page', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/7')
  await expect(page.getByRole('heading', { level: 1, name: /Week 7 — Final Presentation/ })).toBeVisible()
  const total = Number(await page.getByTestId('workload-total').textContent())
  expect(total).toBeGreaterThan(6)
  expect(total).toBeLessThanOrEqual(8)
  await page.getByTestId('entry-lecture').getByRole('link', { name: 'Session 1 slides' }).click()
  await expect(page).toHaveURL(/#\/week\/7\/lecture\/1/)
  await expect(page.getByTestId('week-nav')).toBeVisible()
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#\/week\/7\/lecture\/1\/2$/)
  await page.goto('/#/week/7/lecture/2')
  await expect(page.getByTestId('slide-face')).toBeVisible()
  await page.getByTestId('week-nav-lesson').click()
  await expect(page).toHaveURL(/#\/week\/7\/lesson/)
  await expect(page.getByTestId('lesson-reader')).toContainText('Why this week: from six records to one baseline')
  await page.getByTestId('week-nav-examples').click()
  await expect(page.getByTestId('week7-examples')).toBeVisible()
  await expect(page.getByTestId('catalogue-findings')).toContainText('F-01')
  await expect(page.getByTestId('catalogue-rids')).toContainText('RID-001')
  await page.getByTestId('try-paper-solution').locator('summary').click()
  await page.getByTestId('week-nav-lab').click()
  await expect(page.getByTestId('week7-lab')).toBeVisible()
  await expect(page.getByTestId('gate-table')).toContainText('Session 1, slide')
  await expect(page.getByTestId('lab-empty-answer-rule')).toContainText('n/a')
  await expect(page.getByTestId('lab-review-instructions')).toBeVisible()
  await page.getByTestId('week-nav-assessment').click()
  await expect(page.getByTestId('assessment-no-quiz')).toContainText('No readiness quiz')
  await expect(page.getByTestId('rubric-team')).toBeVisible()
  await expect(page.getByTestId('rubric-individual')).toBeVisible()
  const [rid] = await Promise.all([page.waitForEvent('download'), page.getByTestId('rid-form-download').click()])
  expect(rid.suggestedFilename()).toBe('week7-rid-form.md')
  await page.getByTestId('week-nav-overview').click()
  await expect(page.getByTestId('week7-home')).toBeVisible()
  expect(errors).toEqual([])
})

test('package tool: refuses a wrong file, loads the six exports and a teammate’s package, and exports the versioned package', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/7/lab/tool')
  await expect(page.getByTestId('w7-tool')).toBeVisible()
  await page.getByTestId('w7-import').setInputFiles(file('notes.json', '{"format":"week7-package","version":1}'))
  await expect(page.getByTestId('w7-message')).toBeVisible()
  await page.getByTestId('w7-import').setInputFiles(([1, 2, 3, 4, 5, 6] as const).map((w) => file(`team-07-week${w}-model-inputs.json`, SOURCE_JSONS[w])))
  for (const w of [1, 2, 3, 4, 5, 6]) await expect(page.getByTestId(`w7-source-${w}`)).toBeVisible()
  await expect(page.getByTestId('w7-coverage')).toBeVisible()
  await expect(page.getByTestId('w7-state')).toHaveText(/^○ not ready/)
  // the package now holds the six exports, so the tool asks before a teammate's file replaces it (A22)
  let asked = ''
  page.once('dialog', (d) => { asked = d.message(); void d.accept() })
  await page.getByTestId('w7-import-package').setInputFiles(file('team-07-week7-package.json', JSON.stringify(packageJson(week7Fixture()))))
  await expect(page.getByTestId('w7-state')).toHaveText(/^✓ review closed/)
  expect(asked).toMatch(/Replace the Week 7 package/)
  const [js] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w7-export-json').click()])
  expect(js.suggestedFilename()).toMatch(/week7-package\.json$/)
  const body = JSON.parse((await (await js.createReadStream()).toArray()).join(''))
  expect(body.format).toBe('week7-package')
  expect(body.version).toBe(1)
  expect(Object.keys(body.sources).length).toBe(6)
  const [md] = await Promise.all([page.waitForEvent('download'), page.getByTestId('w7-export-md').click()])
  expect(md.suggestedFilename()).toMatch(/week7-package\.md$/)
  expect(errors).toEqual([])
})

test('the earlier Week 7 page stays in the archive, and the old aliases redirect', async ({ page }) => {
  await fresh(page, '/archive/week/7')
  await expect(page.getByTestId('archive-banner')).toBeVisible()
  await page.goto('/#/week/7/classic')
  await expect(page).toHaveURL(/#\/week\/7$/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: every Week 7 page at 1440×900 and 400 px — ${theme}`, async ({ page }) => {
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
