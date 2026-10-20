import { test } from '@playwright/test'
// The causal-loop diagram is no longer part of Week 1 (rebuilt 2026-10-18; WEEK1_LEARNING_DESIGN §10). The capture is
// kept, skipped, for when the diagram returns in a later week.
test.skip('capture causal loop diagram', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#/archive/week/1')
  const block = page.getByTestId('block-w1-feedback')
  await block.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await page.locator('header').first().evaluate((h) => ((h as HTMLElement).style.position = 'static'))
  await block.getByRole('group', { name: /Causal-loop diagram/ }).screenshot({ path: 'screenshots/12-causal-loops.png' })
})
