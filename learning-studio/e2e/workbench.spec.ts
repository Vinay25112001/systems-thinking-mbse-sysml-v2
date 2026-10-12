// AeroLink Workbench (Week 1 prototype): missions, problems → selection, theme, keyboard, drawers, axe, screenshots.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const SHOTS = 'screenshots/workbench'
const VIEWS = [
  ['dynamics', 'Dynamics'],
  ['loops', 'Causal loops'],
  ['boundary', 'Boundary & context'],
  ['l1', 'L1 record'],
  ['principles', 'Principles'],
  ['stakeholders', 'Stakeholders'],
] as const

/** Week 1's workbench is the Practice stage of the book-style flow: seed the flow as read so Practice is unlocked. */
const READ_ALL = { checks: {}, read: { l1: true, l2: true, l3: true, l4: true, l5: true, l6: true, l7: true }, selfRating: {}, timePlan: {}, worked: {}, memo: {}, practiceStarted: true }
async function fresh(page: Page, path = '/week/1/practice') {
  await page.goto('/#/')
  await page.evaluate((flow) => {
    window.localStorage.clear()
    window.localStorage.setItem('sysml-studio:v1:w1-flow', JSON.stringify(flow))
  }, READ_ALL)
  await page.goto(`/#${path}`)
  await expect(page.getByTestId('workbench')).toBeVisible({ timeout: 30_000 }) // the shell is a lazy chunk
}

/** Theme and instructor mode live in the flow's top bar above the embedded workbench. */
async function setTheme(page: Page, theme: 'light' | 'dark' | 'system') {
  await page.getByLabel('Colour theme').selectOption(theme)
}

function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  return errors
}

test('Week 1 Practice opens the workbench with every region, and the classic page stays available', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Week 1 — Systems, systems thinking and the engineered enterprise')
  for (const name of ['Top bar', 'Workbench tools', 'Model browser', 'Centre view', 'Properties', 'Mission brief', 'Status bar'])
    await expect(page.getByLabel(name, { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0) // the classic sidebar is hidden
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.getByRole('link', { name: 'Classic page' }).click()
  await expect(page.getByTestId('lab-panel')).toBeVisible()
  expect(errors).toEqual([])
})

test('try-first mission: the prediction is locked before the run, then compared with it', async ({ page }) => {
  const errors = trackErrors(page)
  await fresh(page)
  const brief = page.getByTestId('mission-brief')
  await brief.getByLabel('Only up to a point — then extra aircraft stop helping').check()
  await brief.getByRole('button', { name: 'Record: Your prediction' }).click()
  await expect(page.getByTestId('step-predict')).toHaveAttribute('data-status', 'done')
  await expect(page.getByTestId('step-run')).toHaveAttribute('data-status', 'current')
  await page.getByTestId('dynamics-explorer').getByRole('button', { name: 'Fleet grows, charging does not' }).click()
  await expect(page.getByTestId('step-run')).toHaveAttribute('data-status', 'done')
  const compare = page.getByTestId('step-compare')
  await expect(compare).toContainText('You predicted: “Only up to a point')
  await expect(compare).toContainText('12 → 40 aircraft')
  await compare.getByLabel('Partly').check()
  await compare.getByRole('button', { name: /Record/ }).click()
  await expect(page.getByTestId('step-feedback')).toContainText('7,788')
  await expect(page.getByTestId('console')).toHaveCount(0) // console tab not open; the run is still logged
  await page.getByRole('tab', { name: /Console/ }).click()
  await expect(page.getByTestId('console')).toContainText('Dynamics run · Fleet grows, charging does not')
  expect(errors).toEqual([])
})

test('guided boundary mission: classify, check against the key, name the criterion', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await page.getByRole('button', { name: /^Mission 3: Guided: a boundary fit for the question/ }).click()
  await expect(page.getByTestId('view-boundary')).toBeVisible()
  await expect(page.getByTestId('step-check')).toHaveCount(0) // guided missions show only the steps reached so far
  const ex = page.getByTestId('boundary-exercise')
  const answers: [string, string][] = [
    ['AeroLink aircraft fleet', 'inside'], ['Vertiport chargers', 'inside'], ['Dispatch and scheduling (operations centre)', 'inside'],
    ['Passenger demand and rider word-of-mouth', 'inside'], ['Electric grid', 'environment'], ['Airspace managed by the air navigation service provider', 'environment'],
    ['Weather', 'environment'], ['Aircraft cabin interior colour scheme', 'irrelevant'], ['Aircraft manufacturer delivery lead time', 'irrelevant'],
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
  await expect(problems).toContainText('EXT-001 has no labelled exchange')
  await page.getByRole('button', { name: 'Clear selection' }).click()
  await page.getByRole('tab', { name: 'Dynamics' }).click()
  await problems.getByRole('button', { name: /Select EXT-001/ }).click()
  await expect(page.getByTestId('tree-EXT-001')).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('view-boundary')).toBeVisible() // the problem opened the element's view
  const props = page.getByTestId('properties')
  await props.getByLabel('Exchange with the SoI').fill('power')
  await expect(page.getByTestId('dock')).not.toContainText('EXT-001 has no labelled exchange')
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
  await expect(page.getByTestId('problems-table')).toContainText('EXT-001 has no labelled exchange') // its problem is back
  await page.getByRole('tab', { name: /Changes & impact/ }).click()
  await expect(page.getByTestId('changes-list')).toContainText('Redo of change 1')
  expect(errors).toEqual([])
})

test('the dynamics explorer keeps a committed archetype after a reload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  const dyn = page.getByTestId('dynamics-explorer')
  await dyn.getByRole('combobox').first().selectOption('Limits to Growth')
  await dyn.getByRole('button', { name: 'Reveal the instructor’s label' }).click()
  await expect(dyn.getByTestId('scenario-reveal')).toContainText('Your answer: Limits to Growth')
  await page.reload()
  await expect(page.getByTestId('dynamics-explorer').getByTestId('scenario-reveal')).toContainText('Your answer: Limits to Growth')
})

test('layout at 1440x900: dock folded, Properties folded while nothing is selected, causal-loop labels legible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  const dockH = await page.getByTestId('dock').evaluate((el) => el.getBoundingClientRect().height)
  expect(dockH).toBeLessThan(40)
  const propsH = await page.getByLabel('Properties', { exact: true }).first().evaluate((el) => el.getBoundingClientRect().height)
  expect(propsH).toBeLessThan(40)
  // the brief's current step fits without scrolling inside the brief
  const brief = page.getByTestId('mission-brief')
  const fits = await brief.evaluate((el) => {
    const scroller = el.parentElement!
    const step = el.querySelector('[data-status="current"]')!.getBoundingClientRect()
    return step.bottom <= scroller.getBoundingClientRect().bottom
  })
  expect(fits).toBe(true)
  await page.getByRole('tab', { name: 'Causal loops' }).click()
  const node = page.locator('.react-flow__node').first()
  await expect(node).toBeVisible()
  await page.waitForTimeout(400)
  const px = await node.evaluate((el) => {
    const font = parseFloat(getComputedStyle(el).fontSize)
    const vp = el.closest('.react-flow__viewport') as HTMLElement
    const scale = new DOMMatrixReadOnly(getComputedStyle(vp).transform).a
    return font * scale
  })
  expect(px).toBeGreaterThanOrEqual(11)
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

test('loop builder: a declared type that disagrees with the polarities is an error until fixed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await page.getByRole('tab', { name: 'Causal loops' }).click()
  await page.getByRole('button', { name: 'New loop' }).click()
  const b = page.getByTestId('loop-builder')
  await b.getByLabel('Variable 2', { exact: true }).selectOption({ label: 'Word-of-mouth adoption' })
  await b.getByLabel('Polarity of the link from variable 1 to variable 2').selectOption('+')
  await b.getByLabel('Polarity of the link from variable 2 to variable 1').selectOption('+')
  await b.getByLabel('Declared loop type').selectOption('Balancing')
  await b.getByLabel('Owner (initials)').fill('JS')
  await expect(page.getByTestId('problems-table')).toContainText('LOOP-001 is declared balancing, but its polarities make it reinforcing')
  await expect(page.getByTestId('status-bar')).toContainText('1 error')
  await b.getByLabel('Declared loop type').selectOption('Reinforcing')
  await expect(page.getByTestId('dock')).not.toContainText('declared balancing')
  await page.getByRole('button', { name: /^Mission 4:/ }).click()
  await expect(page.getByTestId('step-reinforcing')).toHaveCount(0) // step 1 (count B2) must be done first
  const count = page.getByTestId('step-count')
  await count.getByRole('textbox', { name: 'Negative links in B2' }).fill('3')
  await count.getByRole('button', { name: /Record/ }).click()
  await expect(page.getByTestId('step-reinforcing')).toHaveAttribute('data-status', 'done')
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
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('tree-boundary:b1')).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('properties')).toContainText('AeroLink aircraft fleet')
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toHaveCount(0)
  // Read more opens the reference drawer at the step's lesson block; Esc closes it
  // in the Week 1 flow the step first links to its Learn section; the drawer keeps the full reviewed text
  await expect(page.getByTestId('step-predict').getByTestId('step-lesson-link')).toHaveText(/Lesson: L4 Emergence and hierarchy/)
  await page.getByTestId('step-predict').getByRole('button', { name: 'Full text' }).click()
  const drawer = page.getByTestId('reference-drawer')
  await expect(drawer).toBeVisible()
  await expect(drawer.getByTestId('block-w1-intuition')).toBeInViewport()
  await page.keyboard.press('Escape')
  await expect(drawer).toHaveCount(0)
})

test('assessments panel: recall quiz, lab and assignment; instructor notes only in instructor mode', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page)
  await page.getByRole('button', { name: 'Assessments' }).click()
  const panel = page.getByTestId('assessments-panel')
  const q = panel.getByTestId('quiz-q1-3')
  await q.getByLabel(/A purposeful combination of interdependent resources/).check()
  await q.getByRole('button', { name: 'Check answer' }).click()
  await expect(q.getByRole('status')).toHaveText('Correct')
  await expect(panel.getByRole('tab', { name: 'Instructor notes' })).toHaveCount(0)
  await panel.getByRole('tab', { name: 'Lab L1' }).click()
  await expect(panel.getByTestId('lab-panel')).toContainText('L1 — Context and causal loops')
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
