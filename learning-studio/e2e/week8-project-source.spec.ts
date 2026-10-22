// M7, offline edition (default config, port 5176, no course server): the Week 8 lab tool reads the team's My Project
// from this browser's store (IndexedDB) by the student's explicit choice, shows which project and revision is in use,
// saves the package per Week 1 ID in the project so it survives a reload, and passes axe in light and dark at 1440 and
// 400 px with the project source in use (the server edition of the same flow is Demo E, e2e/demo-e-continuity.e2e.ts).
// Writes no screenshot.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
async function put(p: Page, testId: string, value: string) {
  const f = p.getByTestId(testId)
  await f.fill(value)
  await f.press('Tab')
}
async function setUp(page: Page) {
  await page.goto('/#/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto('/#/project')
  await expect(page.getByTestId('project-create')).toBeVisible()
  await page.getByTestId('create-team').fill('07')
  await page.getByTestId('create-initials').fill('JS')
  await page.getByTestId('create-name').fill('Island Ferry Cooperative')
  await page.getByTestId('create-empty').click()
  await expect(page.getByTestId('project-overview')).toBeVisible()
  await page.goto('/#/week/1/project/stakeholders')
  await expect(page.getByTestId('part-stakeholders')).toBeVisible()
  await page.getByTestId('add-stakeholder').click()
  await put(page, 'stk-STK-001-name', 'Island commuters')
  await page.getByTestId('stk-STK-001-role').selectOption('user')
  await expect(page.getByTestId('save-status').first()).toContainText('Saved', { timeout: 20_000 })
}

test('the Week 8 lab tool reads My Project from this browser and keeps the package per ID across a reload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await setUp(page)
  await page.goto('/#/week/8/lab/tool')
  await expect(page.getByTestId('w8-tool')).toBeVisible()
  await expect(page.getByTestId('w8-source-file')).toBeChecked()
  await page.getByTestId('w8-source-project').check()
  await expect(page.getByTestId('w8-project-info')).toContainText('In use: My Project “Island Ferry Cooperative”')
  await expect(page.getByTestId('w8-project-info')).toContainText('saved in this browser')
  await expect(page.getByTestId('w8-preview')).toContainText("<'STK-001'>")
  await page.getByTestId('w8-confirm-STK-001').click()
  await expect(page.getByTestId('w8-id-STK-001')).toHaveAttribute('data-state', 'mapped')
  await expect(page.getByTestId('w8-save')).toHaveAttribute('data-kind', 'saved', { timeout: 20_000 })
  await expect(page.getByTestId('w8-save')).toContainText('Saved in this browser')
  await page.reload()
  await expect(page.getByTestId('w8-ids')).toBeVisible()
  await expect(page.getByTestId('w8-source-project')).toBeChecked()
  await expect(page.getByTestId('w8-id-STK-001')).toHaveAttribute('data-state', 'mapped')
  await expect(page.getByTestId('w8-status-STK-001')).toContainText('MAP-001')
  // the file stays the fallback, and switching back clears what came from the project
  await page.getByTestId('w8-source-file').check()
  await expect(page.getByTestId('w8-import-week1')).toBeVisible()
  await expect(page.getByTestId('w8-preview')).toHaveCount(0)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: the Week 8 lab tool with My Project as the source at 1440 and 400 px — ${theme}`, async ({ page }) => {
    test.setTimeout(180_000)
    await page.emulateMedia({ colorScheme: theme })
    await page.setViewportSize({ width: 1440, height: 900 })
    await setUp(page)
    await page.goto('/#/week/8/lab/tool')
    await page.getByTestId('w8-source-project').check()
    await page.getByTestId('w8-confirm-STK-001').click()
    await expect(page.getByTestId('w8-id-STK-001')).toHaveAttribute('data-state', 'mapped')
    for (const [w, h] of [
      [1440, 900],
      [400, 860],
    ] as const) {
      await page.setViewportSize({ width: w, height: h })
      await expect(page.getByTestId('w8-project-info')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(theme === 'dark')
      const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      expect(r.violations.map((v) => `${w}px ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([])
      if (w === 400) expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'scrolls sideways at 400 px').toBe(true)
    }
  })
}
