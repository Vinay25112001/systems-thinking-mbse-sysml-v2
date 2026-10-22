// The Week 1 workbench (rebuilt 2026-10-18): problems → selection, impact, undo/redo, the team enterprise check, theme,
// keyboard, drawers, axe, screenshots. Screenshots go to screenshots/week1-workbench/, so the earlier files in
// screenshots/workbench/ (shared with another stream) are not touched.
//
// Since Week 1 M5 (2026-10-21) the AeroLink practice missions 1–4 are no longer in the workbench: Guided Practice is its
// own page and store (src/week1/practice/, covered by week1-flow.spec.ts and project.spec.ts), and /week/1/practice no
// longer mounts the workbench. The only route that still mounts the Week 1 workbench is the lab tool
// (#/week/1/project/tool, the Team enterprise view; instructor edition only since M6, the student edition redirects to the
// canvas). These tests therefore run on the lab tool. Retired with the practice workbench (their views are not routed):
// the try-first stakeholder mission, the guided boundary mission and the AeroLink needs writer; the logic behind them keeps
// its unit tests (src/workbench/**).
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const SHOTS = 'screenshots/week1-workbench'
/** The lab tool shows the Team enterprise view only (src/week1/Workbench.tsx LAB_ONLY). */
const VIEWS = [['team', 'Team enterprise']] as const

/** The Week 1 lab tool embeds the workbench under the week navigation. Nothing has to be read or answered first. */
async function fresh(page: Page, path = '/week/1/project/tool') {
  await page.goto('/#/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`/#${path}`)
  await expect(page.getByTestId('workbench')).toBeVisible({ timeout: 30_000 }) // the shell is a lazy chunk
}

/** Theme and instructor mode live in the flow's top bar above the embedded workbench. */
async function setTheme(page: Page, theme: 'light' | 'dark' | 'system') {
  await page.getByLabel(/Colou?r theme/).selectOption(theme)
}

function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  return errors
}

test('the Week 1 workbench opens under the week navigation with every region, and no lock', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Week 1 — Team Formation / Needs / Identifying Stakeholders')
  for (const name of ['Top bar', 'Workbench tools', 'Model browser', 'Center view', 'Properties', 'Mission brief', 'Status bar'])
    await expect(page.getByLabel(name, { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0) // the classic sidebar is hidden
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  // the lab tool belongs to the My Project / Lab stage of the five-stage Week 1 navigation (M4 part A, M6)
  await expect(page.getByTestId('lab-tool-frame')).toBeVisible()
  await expect(page.getByTestId('week-nav-project')).toHaveAttribute('aria-current', 'step')
  await expect(page.getByTestId('practice-locked')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('problems: a rule violation is listed, clicking it selects the element, fixing it records the impact', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  const p = page.getByTestId('team-proposal')
  await p.getByLabel('Enterprise name').fill('AeroLink vertiport network')
  const problems = page.getByTestId('problems-table')
  await expect(problems).toContainText('The enterprise proposal names AeroLink')
  // select another element first, so the problem's selection is observable
  await page.getByTestId('tree-team:charter').click()
  await expect(page.getByTestId('tree-team:charter')).toHaveAttribute('aria-selected', 'true')
  await problems.getByRole('button', { name: /Select team:proposal/ }).click()
  await expect(page.getByTestId('tree-team:proposal')).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('properties')).toContainText('Team Record, part 2 Enterprise proposal')
  await p.getByLabel('Enterprise name').fill('Riverside Food Bank Network')
  await expect(page.getByTestId('dock')).not.toContainText('The enterprise proposal names AeroLink')
  await page.getByRole('tab', { name: /Changes & impact/ }).click()
  await expect(page.getByTestId('changes-list')).toContainText('cleared')
  await expect(page.getByTestId('changes-list')).toContainText('The enterprise proposal names AeroLink')
  await expect(page.getByTestId('status-bar')).toContainText('0 errors · 0 warnings')
  await page.screenshot({ path: `${SHOTS}/problems-and-impact-1440x900-light.png` })
  expect(errors).toEqual([])
})

test('undo / redo: Ctrl+Z reverts a model edit, Ctrl+Shift+Z restores it, and both appear in Changes & impact', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  const name = page.getByTestId('team-proposal').getByLabel('Enterprise name')
  await name.fill('AeroLink vertiport network')
  await expect(page.getByTestId('problems-table')).toContainText('The enterprise proposal names AeroLink')
  await name.fill('Riverside Food Bank Network')
  await expect(page.getByTestId('dock')).not.toContainText('names AeroLink')
  await page.locator('body').click({ position: { x: 700, y: 120 } })
  await page.keyboard.press('Control+z')
  await expect(name).toHaveValue('AeroLink vertiport network')
  await expect(page.getByTestId('problems-table')).toContainText('The enterprise proposal names AeroLink') // its problem is back
  await page.getByRole('tab', { name: /Changes & impact/ }).click()
  await expect(page.getByTestId('changes-list')).toContainText(/Undo of change \d+/)
  await expect(page.getByTestId('redo')).toBeEnabled()
  await page.screenshot({ path: `${SHOTS}/undo-1440x900-light.png` })
  await page.locator('body').click({ position: { x: 700, y: 120 } })
  await page.keyboard.press('Control+Shift+z')
  await expect(name).toHaveValue('Riverside Food Bank Network')
  await expect(page.getByTestId('status-bar')).toContainText('0 errors · 0 warnings') // the problem is cleared again
  await page.getByRole('tab', { name: /Changes & impact/ }).click()
  await expect(page.getByTestId('changes-list')).toContainText(/Redo of change \d+/)
  expect(errors).toEqual([])
})

test('team enterprise: an AeroLink proposal is an error in Problems until the team proposes its own enterprise', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await expect(page.getByRole('tab', { name: /Team enterprise/ })).toHaveAttribute('aria-selected', 'true') // the lab tool's only view
  const p = page.getByTestId('team-proposal')
  await p.getByLabel('Enterprise name').fill('AeroLink vertiport network')
  await expect(page.getByTestId('problems-table')).toContainText('The enterprise proposal names AeroLink')
  await expect(page.getByTestId('team-proposal-check')).toContainText('AeroLink is the instructor’s worked example')
  await p.getByLabel('Enterprise name').fill('Riverside Food Bank Network')
  await expect(page.getByTestId('dock')).not.toContainText('names AeroLink')
  await page.screenshot({ path: `${SHOTS}/team-proposal-1440x900-light.png` })
  expect(errors).toEqual([])
})

test('layout at 1440x900: dock folded, Properties folded while nothing is selected, the current step fits', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  const dockH = await page.getByTestId('dock').evaluate((el) => el.getBoundingClientRect().height)
  expect(dockH).toBeLessThan(40)
  const propsH = await page.getByLabel('Properties', { exact: true }).first().evaluate((el) => el.getBoundingClientRect().height)
  expect(propsH).toBeLessThan(40)
  // the brief's current step can be acted on without scrolling inside the brief: its task and its "You enter" / "Done
  // when" statements are in view, and so is its action button where the step has one (the lab tool's Team Record steps
  // are filled in the centre view, so they carry no button in the brief)
  const brief = page.getByTestId('mission-brief')
  const fits = await brief.evaluate((el) => {
    const bottom = el.parentElement!.getBoundingClientRect().bottom
    const step = el.querySelector('[data-status="current"]')
    if (!step) return 'no current step'
    const stepBrief = step.querySelector('[data-testid="step-brief"]')
    const button = step.querySelector('button.wb-btn.primary')
    if (!stepBrief) return 'no step brief'
    return stepBrief.getBoundingClientRect().bottom <= bottom && (!button || button.getBoundingClientRect().bottom <= bottom)
  })
  expect(fits).toBe(true)
  // a new problem opens the dock
  await page.getByTestId('team-proposal').getByLabel('Enterprise name').fill('AeroLink vertiport network')
  await expect.poll(() => page.getByTestId('dock').evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(120)
})

test('medium width: the model browser opens as an overlay drawer, the centre keeps its width', async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 820 })
  await fresh(page)
  const centre = () => page.getByTestId('centre').evaluate((el) => el.getBoundingClientRect().width)
  const before = await centre()
  await page.getByRole('button', { name: 'Show model browser' }).click()
  const drawer = page.getByTestId('browser-drawer')
  await expect(drawer).toBeVisible()
  expect(await centre()).toBe(before)
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOTS}/medium-1180x820-drawer-light.png` })
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
})

test('keyboard: F6 cycles regions, the tree navigates with arrows, ? and Esc open and close dialogs', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await page.locator('body').click({ position: { x: 700, y: 400 } })
  const seen: string[] = []
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('F6')
    seen.push(await page.evaluate(() => (document.activeElement?.closest('[data-wb-region]') as HTMLElement | null)?.dataset.wbRegion ?? ''))
  }
  expect(new Set(seen)).toEqual(new Set(['topbar', 'rail', 'browser', 'view', 'properties', 'brief', 'dock', 'status']))
  const tree = page.getByRole('tree', { name: 'Model browser' })
  // the lab tool's tree opens with the Team Record group; from part 1 (the charter) the arrow moves to part 2
  await tree.getByTestId('tree-team:charter').focus()
  await page.keyboard.press('ArrowDown')
  await expect(tree.getByTestId('tree-team:proposal')).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('tree-team:proposal')).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('properties')).toContainText('Team Record, part 2 Enterprise proposal')
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toHaveCount(0)
  // Read more opens the reference drawer at the step's lesson block; Esc closes it
  // on the lecture-first path the step first links to the lesson section that teaches it (the earlier lesson URL, which
  // redirects to its Learn section); the drawer keeps the full reviewed text. The lab tool opens on step 1, the charter.
  await expect(page.getByTestId('step-charter').getByTestId('step-lesson-link')).toHaveText(/Lesson: Forming your team/)
  await expect(page.getByTestId('step-charter').getByTestId('step-lesson-link')).toHaveAttribute('href', '#/week/1/lesson/s1-lesson-teams')
  await page.getByTestId('step-charter').getByRole('button', { name: 'Full text' }).click()
  const drawer = page.getByTestId('reference-drawer')
  await expect(drawer).toBeVisible()
  await expect(drawer.getByTestId('block-w1-team')).toBeInViewport()
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
})

test('assessments panel: recall quiz, lab and assignment; instructor notes only in instructor mode', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await page.getByRole('button', { name: 'Assessments' }).click()
  const panel = page.getByTestId('assessments-panel')
  const q = panel.getByTestId('quiz-w1q-3')
  await q.getByLabel(/The system whose life cycle is under consideration/).check()
  await q.getByRole('button', { name: 'Check answer' }).click()
  await expect(q.getByRole('status')).toHaveText('Correct')
  await expect(panel.getByRole('tab', { name: 'Instructor notes' })).toHaveCount(0)
  await panel.getByRole('tab', { name: 'Lab L1' }).click()
  await expect(panel.getByTestId('lab-panel')).toContainText('L1 — Team charter, enterprise proposal, stakeholder register and initial needs')
  await page.screenshot({ path: `${SHOTS}/assessments-1440x900-light.png` })
  await page.keyboard.press('Escape')
  // the Week 1 chrome's interim instructor switch (StudentChrome; no switch in the student edition)
  await page.getByTestId('instructor-switch').locator('input').check()
  await page.getByRole('button', { name: 'Assessments' }).click()
  await page.getByTestId('assessments-panel').getByRole('tab', { name: 'Instructor notes' }).click()
  await expect(page.getByTestId('instructor-notes')).toContainText('Session 1 — concept studio')
})

test('theme toggle switches the workbench to its dark tokens and persists', async ({ page }) => {
  await fresh(page)
  const bg = () => page.getByTestId('workbench').evaluate((el) => getComputedStyle(el).backgroundColor)
  await setTheme(page, 'light')
  const light = await bg()
  await setTheme(page, 'dark')
  await expect(page.locator('html')).toHaveClass(/dark/)
  expect(await bg()).not.toBe(light)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await setTheme(page, 'light')
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: /week/1/project/tool workbench has no serious or critical violations — ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await fresh(page)
    await setTheme(page, theme)
    const report: string[] = []
    const scan = async (label: string) => {
      await page.waitForTimeout(250)
      // a drawer fades in: scan once its opening animation has finished, not a half-transparent frame
      await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'), undefined, { timeout: 10_000 })
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      for (const v of r.violations) report.push(`${label} [${v.impact}] ${v.id}: ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(' ')}`)
    }
    for (const [, title] of VIEWS) {
      await page.getByRole('tab', { name: new RegExp(title) }).click()
      await scan(title)
    }
    await page.getByRole('button', { name: 'Reference (lesson)' }).click()
    await scan('reference drawer')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Assessments' }).click()
    await scan('assessments')
    console.log(`AXE workbench ${theme}:\n${report.join('\n') || 'no violations'}`)
    expect(report.filter((l) => /\[(serious|critical)\]/.test(l))).toEqual([])
    expect(report).toEqual([])
  })
}

for (const [w, h] of [[1440, 900], [1024, 768]] as const) {
  for (const theme of ['light', 'dark'] as const) {
    test(`screenshots ${w}x${h} ${theme}: one per centre view`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h })
      await fresh(page)
      await setTheme(page, theme)
      for (const [id, title] of VIEWS) {
        await page.getByRole('tab', { name: new RegExp(title) }).click()
        await expect(page.getByTestId(`view-${id}`)).toBeVisible()
        await page.waitForTimeout(350)
        await page.screenshot({ path: `${SHOTS}/${id}-${w}x${h}-${theme}.png` })
      }
      if (w === 1440) {
        await page.getByRole('button', { name: 'Reference (lesson)' }).click()
        await page.waitForTimeout(300)
        await page.screenshot({ path: `${SHOTS}/reference-drawer-${w}x${h}-${theme}.png` })
      }
    })
  }
}

test('narrow viewport: one region at a time with a panel switcher and no horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1000 })
  await fresh(page)
  const sw = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(sw).toBeLessThanOrEqual(820)
  await page.getByRole('tab', { name: 'Mission' }).click()
  await expect(page.getByTestId('mission-brief')).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/narrow-820-mission-light.png` })
})
