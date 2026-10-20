// AeroLink Workbench, Week 1 (rebuilt 2026-10-18: stakeholders, boundary, needs, the team's own record): missions,
// problems → selection, theme, keyboard, drawers, axe, screenshots. Screenshots go to screenshots/week1-workbench/, so the
// earlier files in screenshots/workbench/ (shared with another stream) are not touched.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { PREDICTION_OPTIONS } from '../src/content/missions/week01'
import { CANDIDATES } from '../src/workbench/week1/stakeholders'

const SHOTS = 'screenshots/week1-workbench'
const VIEWS = [
  ['stakeholders', 'Stakeholders'],
  ['boundary', 'Boundary & context'],
  ['needs', 'Needs'],
  ['team', 'Team enterprise'],
] as const

/** Week 1's workbench is embedded in the lecture-first week pages (2026-10-19): the optional AeroLink practice on the
 *  worked-examples page (missions 1–4 first) and the lab tool. Nothing has to be read or answered first. */
async function fresh(page: Page, path = '/week/1/examples/practice') {
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
  await expect(page.getByTestId('week-nav-examples')).toHaveAttribute('aria-current', 'page')
  await expect(page.getByTestId('practice-locked')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('try-first mission: the prediction is locked before the sort, then compared with it, with nothing given away early', async ({ page }) => {
  const errors = trackErrors(page)
  await fresh(page)
  const brief = page.getByTestId('mission-brief')
  await brief.getByLabel(PREDICTION_OPTIONS[0].text).check()
  await brief.getByRole('button', { name: 'Record: Your prediction' }).click()
  await expect(page.getByTestId('step-predict')).toHaveAttribute('data-status', 'done')
  await expect(page.getByTestId('step-identify')).toHaveAttribute('data-status', 'current')
  const view = page.getByTestId('view-stakeholders')
  // the key is not shown before the student checks with every candidate marked
  await expect(page.getByTestId('stk-identify').getByRole('button', { name: 'Check', exact: true })).toBeDisabled()
  for (const c of CANDIDATES) await view.getByLabel(`Is ${c.name} a stakeholder?`).selectOption(c.name === 'Weather' ? 'yes' : c.stakeholder ? 'yes' : 'no')
  await expect(view).not.toContainText('a natural system in the context')
  await page.getByTestId('stk-identify').getByRole('button', { name: 'Check', exact: true }).click()
  await expect(page.getByTestId('stk-identify-score')).toHaveText(`${CANDIDATES.length - 1} of ${CANDIDATES.length} agree with the key`)
  await expect(view).toContainText('a natural system in the context')
  // rebuild review F14: the step is not done while a difference from the key is unread
  await expect(page.getByTestId('step-identify')).not.toHaveAttribute('data-status', 'done')
  await expect(page.getByTestId('stk-identify-open')).toContainText('1 to read')
  await view.getByLabel('I have read why').check()
  await expect(page.getByTestId('step-identify')).toHaveAttribute('data-status', 'done')
  const compare = page.getByTestId('step-compare')
  await expect(compare).not.toContainText('primary source')
  await compare.getByLabel('Partly').check()
  await compare.getByRole('button', { name: /Record/ }).click()
  await expect(page.getByTestId('step-feedback')).toContainText('primary source of needs')
  expect(errors).toEqual([])
})

test('guided boundary mission: classify, check against the key, name the criterion', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await page.getByRole('button', { name: /^Mission 2: Guided: an AeroLink boundary fit for its question/ }).click()
  await expect(page.getByTestId('view-boundary')).toBeVisible()
  await expect(page.getByTestId('step-check')).toHaveCount(0) // guided missions show only the steps reached so far
  const ex = page.getByTestId('boundary-exercise')
  const answers: [string, string][] = [
    ['AeroLink aircraft fleet', 'inside'], ['Vertiport chargers', 'inside'], ['Dispatch and scheduling (operations center)', 'inside'],
    ['Passenger demand and rider word-of-mouth', 'inside'], ['Electric grid', 'environment'], ['Airspace managed by the air navigation service provider', 'environment'],
    ['Weather', 'environment'], ['Aircraft cabin interior color scheme', 'irrelevant'], ['Aircraft manufacturer delivery lead time', 'irrelevant'],
  ]
  for (const [name, v] of answers) await ex.getByLabel(`Classify ${name}`).selectOption(v)
  await expect(page.getByTestId('step-classify')).toHaveAttribute('data-status', 'done')
  await expect(page.getByTestId('step-check')).toHaveAttribute('data-status', 'current')
  await ex.getByRole('button', { name: 'Check classification' }).click()
  await expect(page.getByTestId('step-check')).toHaveAttribute('data-status', 'done')
  await expect(page.getByTestId('step-check')).toContainText('8 of 9 match the instructor key')
  const crit = page.getByTestId('step-criterion')
  await crit.getByLabel('Control: AeroLink controls passenger demand').check()
  await crit.getByRole('button', { name: /Record/ }).click()
  await expect(crit).toHaveAttribute('data-status', 'current')
  await expect(page.getByTestId('step-feedback')).toContainText('Not quite')
  await crit.getByLabel('Model boundary: demand is endogenous to the feedback under study').check()
  await crit.getByRole('button', { name: /Record again/ }).click()
  await expect(crit).toHaveAttribute('data-status', 'done')
  await expect(page.getByRole('status').filter({ hasText: 'Mission complete' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/mission-boundary-complete-1440x900-light.png` })
  expect(errors).toEqual([])
})

test('problems: a rule violation is listed, clicking it selects the element, fixing it records the impact', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await page.getByRole('tab', { name: 'Boundary & context' }).click()
  const ext = page.getByTestId('ext-form')
  await ext.getByLabel('External system or actor').fill('Electric utility')
  await ext.getByLabel('Owner (initials)').fill('JS')
  await ext.getByRole('button', { name: /Add external system/ }).click()
  const problems = page.getByTestId('problems-table')
  await expect(problems).toContainText('EXT-001 has no labeled exchange')
  await page.getByRole('button', { name: 'Clear selection' }).click()
  await page.getByRole('tab', { name: 'Needs' }).click()
  await problems.getByRole('button', { name: /Select EXT-001/ }).click()
  await expect(page.getByTestId('tree-EXT-001')).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('view-boundary')).toBeVisible() // the problem opened the element's view
  const props = page.getByTestId('properties')
  await props.getByLabel('Exchange with the SoI').fill('power')
  await expect(page.getByTestId('dock')).not.toContainText('EXT-001 has no labeled exchange')
  await page.getByRole('tab', { name: /Changes & impact/ }).click()
  await expect(page.getByTestId('changes-list')).toContainText('cleared')
  await expect(page.getByTestId('changes-list')).toContainText('EXT elements: 0 → 1')
  await expect(page.getByTestId('status-bar')).toContainText('0 errors · 0 warnings')
  await page.screenshot({ path: `${SHOTS}/problems-and-impact-1440x900-light.png` })
  expect(errors).toEqual([])
})

test('undo / redo: Ctrl+Z reverts a model edit, Ctrl+Shift+Z restores it, and both appear in Changes & impact', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await page.getByRole('tab', { name: 'Boundary & context' }).click()
  const ext = page.getByTestId('ext-form')
  await ext.getByLabel('External system or actor').fill('Electric utility')
  await ext.getByLabel('Owner (initials)').fill('JS')
  await ext.getByRole('button', { name: /Add external system/ }).click()
  await expect(page.getByTestId('tree-EXT-001')).toBeVisible()
  await page.locator('body').click({ position: { x: 700, y: 120 } })
  await page.keyboard.press('Control+z')
  await expect(page.getByTestId('tree-EXT-001')).toHaveCount(0)
  await page.getByRole('tab', { name: /Changes & impact/ }).click()
  await expect(page.getByTestId('changes-list')).toContainText('Undo of change 1')
  await expect(page.getByTestId('redo')).toBeEnabled()
  await page.screenshot({ path: `${SHOTS}/undo-1440x900-light.png` })
  await page.keyboard.press('Control+Shift+z')
  await expect(page.getByTestId('tree-EXT-001')).toBeVisible()
  await expect(page.getByTestId('problems-table')).toContainText('EXT-001 has no labeled exchange') // its problem is back
  await page.getByRole('tab', { name: /Changes & impact/ }).click()
  await expect(page.getByTestId('changes-list')).toContainText('Redo of change 1')
  expect(errors).toEqual([])
})

test('team enterprise: an AeroLink proposal is an error in Problems until the team proposes its own enterprise', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await page.getByRole('tab', { name: 'Team enterprise' }).click()
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
  // the brief's current step can be acted on without scrolling inside the brief: its task, its "You enter" / "Done when"
  // statements and its action button are in view (revised 2026-10-18: the step statements and the labeled mission list
  // added to the brief move the hint and reference buttons below the fold at this size)
  const brief = page.getByTestId('mission-brief')
  const fits = await brief.evaluate((el) => {
    const bottom = el.parentElement!.getBoundingClientRect().bottom
    const step = el.querySelector('[data-status="current"]')!
    const parts = [step.querySelector('[data-testid="step-brief"]'), step.querySelector('button.wb-btn.primary')]
    return parts.every((x) => !!x && x.getBoundingClientRect().bottom <= bottom)
  })
  expect(fits).toBe(true)
  // a new problem opens the dock
  await page.getByRole('tab', { name: 'Boundary & context' }).click()
  const ext = page.getByTestId('ext-form')
  await ext.getByLabel('External system or actor').fill('Electric utility')
  await ext.getByLabel('Owner (initials)').fill('JS')
  await ext.getByRole('button', { name: /Add external system/ }).click()
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

test('needs writer (rebuild review F01): structure and trace are gated, subjective points are warnings, the six checks are confirmed by the student', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await page.getByRole('tab', { name: 'Needs' }).click()
  const w = page.getByTestId('needs-write')
  await w.getByLabel('Short name').fill('Fire warning')
  await w.getByLabel('Need statement').fill('The vertiport shall warn responders of a battery fire.')
  await w.getByLabel('Rationale (why they need it)').fill('responders must reach a fire quickly and safely')
  const crit = page.getByTestId('needs-criteria')
  // A21: rejected for its real defects, a requirement (“shall”) with no registered stakeholder in need
  await expect(crit).toContainText('marks a requirement')
  await expect(crit).toContainText('No stakeholder from your register is named')
  await expect(crit).toContainText('Choose at least one stakeholder')
  await expect(w.getByRole('button', { name: 'Record need' })).toBeDisabled()
  // a vague need passes the structure but is warned about, and cannot be recorded without a justification
  await w.getByLabel('Comes from (stakeholder)').selectOption('STK-006')
  // A21: the outcome form is a valid need: accepted with a note recommending "The [stakeholders] need the [system] to …"
  await w.getByLabel('Need statement').fill('Emergency responders need early warning of a battery fire at a vertiport, at any hour of operation.')
  await expect(crit).toContainText('Accepted: it names the stakeholder and the outcome')
  await expect(crit).not.toContainText('Fix')
  await expect(crit).not.toContainText('Warning')
  await w.getByLabel('Need statement').fill('Emergency responders need the air-taxi service to give good service when possible.')
  await expect(crit).toContainText('Vague')
  await expect(crit).not.toContainText('Fix')
  await w.getByLabel('Need statement').fill('Emergency responders need the air-taxi service to give them early warning of a battery fire at a vertiport, at any hour of operation.')
  await expect(crit).not.toContainText('Fix')
  await expect(crit).not.toContainText('Warning')
  await expect(w.getByRole('button', { name: 'Record need' })).toBeDisabled()
  const boxes = page.getByTestId('needs-selfcheck').getByRole('checkbox')
  for (let i = 0; i < 6; i++) await boxes.nth(i).check()
  await w.getByRole('button', { name: 'Record need' }).click()
  await expect(page.getByTestId('needs-recorded')).toContainText('STK-006')
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
  await tree.getByRole('treeitem').first().focus()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('tree-team:proposal')).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('properties')).toContainText('Team Record, part 2 Enterprise proposal')
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toHaveCount(0)
  // Read more opens the reference drawer at the step's lesson block; Esc closes it
  // on the lecture-first path the step first links to the lesson section that teaches it; the drawer keeps the full reviewed text
  await expect(page.getByTestId('step-predict').getByTestId('step-lesson-link')).toHaveText(/Lesson: Identifying stakeholders/)
  await expect(page.getByTestId('step-predict').getByTestId('step-lesson-link')).toHaveAttribute('href', '#/week/1/lesson/s1-lesson-stakeholders')
  await page.getByTestId('step-predict').getByRole('button', { name: 'Full text' }).click()
  const drawer = page.getByTestId('reference-drawer')
  await expect(drawer).toBeVisible()
  await expect(drawer.getByTestId('block-w1-stakeholders')).toBeInViewport()
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
  await page.getByLabel('Instructor mode').check()
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
  test(`axe: /week/1/practice workbench has no serious or critical violations — ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await fresh(page)
    await setTheme(page, theme)
    const report: string[] = []
    const scan = async (label: string) => {
      await page.waitForTimeout(250)
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
      for (const v of r.violations) report.push(`${label} [${v.impact}] ${v.id}: ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(' ')}`)
    }
    for (const [, title] of VIEWS) {
      await page.getByRole('tab', { name: title }).click()
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
        await page.getByRole('tab', { name: title }).click()
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
