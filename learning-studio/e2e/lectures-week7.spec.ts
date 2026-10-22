// Week 7 lectures on the lecture pipeline (DECISION_LOG A20, A21; template e2e/lectures-week6.spec.ts): the viewer for both sessions with notes on, the handout
// with notes, and the reader, scanned with axe in light and dark at 1440×900; the 400 px stacked fallback; the Week 7
// navigation on the viewer and reader; no console errors. Run by playwright.lectures.config.ts (its own server).
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { WEEK7_SESSION1 } from '../src/content/lectures/week07/session1'
import { WEEK7_SESSION2 } from '../src/content/lectures/week07/session2'
import type { Lecture } from '../src/content/lectures/types'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const slidesOf = (l: Lecture) => l.sections.flatMap((s) => s.slides)
async function fresh(page: Page, path: string) {
  await page.goto('/#/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`/#${path}`)
}
const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)

test('Week 7 viewer: counter, week navigation, back to the Week 7 page; reader lists both sessions', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  // the course-server session probe (/api/..., the concurrent auth work) fails when no course server runs: not a lecture error
  page.on('console', (m) => m.type() === 'error' && !(m.text().startsWith('Failed to load resource') && m.location().url.includes('/api/')) && errors.push(m.text()))
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/7/lecture/1')
  await expect(page.getByTestId('slide-counter')).toHaveText(`Slide 1 of ${slidesOf(WEEK7_SESSION1).length}`)
  await expect(page.getByTestId('week-nav')).toHaveAttribute('aria-label', 'Week 7 sections')
  await expect(page.getByRole('link', { name: '← Week 7' })).toBeVisible()
  await page.goto('/#/week/7/lesson')
  await expect(page.getByTestId('lesson-reader')).toBeVisible()
  await expect(page.getByTestId('lesson-reader')).toContainText(WEEK7_SESSION2.studentLesson[0].title)
  expect(errors).toEqual([])
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: Week 7 viewer (every slide, notes on), handout and reader — ${theme}`, async ({ page }) => {
    test.setTimeout(300_000)
    await page.setViewportSize({ width: 1440, height: 900 })
    const report: string[] = []
    const scan = async (label: string) => {
      await page.waitForTimeout(120)
      const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      for (const v of r.violations) report.push(`${label} [${v.impact}] ${v.id}: ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(' ')}`)
    }
    for (const l of [WEEK7_SESSION1, WEEK7_SESSION2]) {
      await fresh(page, `/week/7/lecture/${l.session}`)
      await page.getByLabel('Color theme').selectOption(theme)
      await page.getByRole('button', { name: 'Notes' }).click()
      for (let i = 0; i < slidesOf(l).length; i++) {
        await scan(`session ${l.session} slide ${i + 1}`)
        await page.keyboard.press('ArrowRight')
      }
    }
    await page.goto('/#/week/7/lecture/2/handout')
    await page.getByLabel('Include faculty notes (instructor)').check()
    await expect(page.getByTestId('lecture-handout').getByTestId('faculty-notes')).toHaveCount(slidesOf(WEEK7_SESSION2).length)
    await scan('handout')
    await page.goto('/#/week/7/lesson')
    await expect(page.getByTestId('lesson-reader')).toBeVisible()
    await scan('reader')
    console.log(`AXE week 7 lectures ${theme}:\n${report.join('\n') || 'no violations'}`)
    expect(report).toEqual([])
  })
}

test('Week 7 at 400 px: stacked viewer and reader with no horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 860 })
  await fresh(page, '/week/7/lecture/1/12')
  await expect(page.getByTestId('slide-counter')).toHaveText(`Slide 12 of ${slidesOf(WEEK7_SESSION1).length}`)
  expect(await noHorizontalScroll(page)).toBe(true)
  await page.goto('/#/week/7/lesson')
  await expect(page.getByTestId('lesson-reader')).toBeVisible()
  expect(await noHorizontalScroll(page)).toBe(true)
})
