// Week 8 lectures on the lecture pipeline (DECISION_LOG A20, A21): the viewer for both sessions with notes on, the handout
// with notes, and the reader, scanned with axe in light and dark at 1440×900; the 400 px stacked fallback; the Week 8
// navigation on the viewer and reader; no console errors. Run by playwright.lectures.config.ts (its own server).
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
// The session modules are not imported: they read the reference baseline through Vite's import.meta.glob, which the
// Playwright loader does not provide. Slide counts are read from the viewer's own counter instead.

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
/** Total slides of the session open in the viewer, read from "Slide i of N". */
async function totalSlides(page: Page): Promise<number> {
  const t = (await page.getByTestId('slide-counter').textContent()) ?? ''
  return Number(t.match(/of (\d+)/)?.[1] ?? 0)
}
const LESSON_TITLES = ['Definition and usage', 'Stakeholders and concerns as language elements']
async function fresh(page: Page, path: string) {
  await page.goto('/#/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`/#${path}`)
}
const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)

test('Week 8 viewer: counter, week navigation, back to the Week 8 page; reader lists both sessions', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/8/lecture/1')
  await expect(page.getByTestId('slide-counter')).toHaveText(/^Slide 1 of 27$/, { timeout: 15_000 })
  await expect(page.getByTestId('week-nav')).toHaveAttribute('aria-label', 'Week 8 sections')
  await expect(page.getByRole('link', { name: '← Week 8' })).toBeVisible()
  await page.goto('/#/week/8/lecture/2')
  await expect(page.getByTestId('slide-counter')).toHaveText(/^Slide 1 of 21$/, { timeout: 15_000 })
  await page.goto('/#/week/8/lesson')
  await expect(page.getByTestId('lesson-reader')).toBeVisible()
  for (const t of LESSON_TITLES) await expect(page.getByTestId('lesson-reader')).toContainText(t)
  expect(errors).toEqual([])
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: Week 8 viewer (every slide, notes on), handout and reader — ${theme}`, async ({ page }) => {
    test.setTimeout(300_000)
    await page.setViewportSize({ width: 1440, height: 900 })
    const report: string[] = []
    const scan = async (label: string) => {
      await page.waitForTimeout(120)
      const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      for (const v of r.violations) report.push(`${label} [${v.impact}] ${v.id}: ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(' ')}`)
    }
    for (const session of [1, 2]) {
      await fresh(page, `/week/8/lecture/${session}`)
      await page.getByLabel('Color theme').selectOption(theme)
      await page.getByRole('button', { name: 'Notes', exact: true }).click()
      const n = await totalSlides(page)
      expect(n).toBeGreaterThan(15)
      for (let i = 0; i < n; i++) {
        await scan(`session ${session} slide ${i + 1}`)
        await page.keyboard.press('ArrowRight')
      }
    }
    await page.goto('/#/week/8/lecture/1/handout')
    await page.getByLabel('Include faculty notes (instructor)').check()
    await expect(page.getByTestId('lecture-handout').getByTestId('faculty-notes')).toHaveCount(27)
    await scan('handout')
    await page.goto('/#/week/8/lesson')
    await expect(page.getByTestId('lesson-reader')).toBeVisible()
    await scan('reader')
    console.log(`AXE week 8 lectures ${theme}:\n${report.join('\n') || 'no violations'}`)
    expect(report).toEqual([])
  })
}

test('Week 8 at 400 px: stacked viewer and reader with no horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 860 })
  await fresh(page, '/week/8/lecture/1/15')
  await expect(page.getByTestId('slide-counter')).toHaveText(/^Slide 15 of 27$/, { timeout: 15_000 })
  expect(await noHorizontalScroll(page)).toBe(true)
  await page.goto('/#/week/8/lecture/2/12')
  expect(await noHorizontalScroll(page)).toBe(true)
  await page.goto('/#/week/8/lesson')
  await expect(page.getByTestId('lesson-reader')).toBeVisible()
  expect(await noHorizontalScroll(page)).toBe(true)
})
