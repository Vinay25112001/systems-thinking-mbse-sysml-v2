import { test } from '@playwright/test'
test('capture causal loop diagram', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#/week/1/classic')
  const block = page.getByTestId('block-w1-feedback')
  await block.scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  await page.locator('header').first().evaluate((h) => ((h as HTMLElement).style.position = 'static'))
  await block.getByRole('group', { name: /Causal-loop diagram/ }).screenshot({ path: 'screenshots/12-causal-loops.png' })
})
