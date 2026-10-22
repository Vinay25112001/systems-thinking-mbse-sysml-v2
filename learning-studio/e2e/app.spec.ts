import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import week01 from '../src/content/weeks/week01'
import { workloadTotal } from '../src/content/schema'

/** The stated Week 1 total, computed from the workload rows (sign-off M5: never a retyped number). */
const WEEK1_TOTAL = workloadTotal(week01.workload)

const SHOTS = 'screenshots'

async function fresh(page: Page, path = '/') {
  await page.goto('/#/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`/#${path}`)
}

function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    // the course-server session probe (/api/...) fails when no course server runs (offline mode, M2): the browser logs
    // the failed resource; that is expected and not an application error
    if (m.type() === 'error' && !(m.text().startsWith('Failed to load resource') && m.location().url.includes('/api/'))) errors.push(`console: ${m.text()}`)
  })
  return errors
}

test('dashboard loads with honest status and navigates to Week 1', async ({ page }) => {
  const errors = trackErrors(page)
  // the dashboard moved to #/dashboard when the course homepage took #/ (Week 1 M4 part A, spec §a)
  await fresh(page, '/dashboard')
  // the first test of the run may meet a cold dev server (module graph not yet transformed): a longer first wait (m1)
  await expect(page.getByRole('heading', { name: 'Systems Thinking and MBSE with SysML v2' })).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('Prototype status — read before you start')).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/01-dashboard-light.png`, fullPage: true })
  await expect(page.getByTestId('start-here')).toBeVisible()
  await page.getByRole('link', { name: 'Open Week 1' }).click()
  // Week 1 opens on its Overview (M4 part A); the earlier module page is an instructor archive
  await expect(page.getByRole('heading', { level: 1, name: /^Week 1 · Team formation, needs and identifying stakeholders$/ })).toBeVisible()
  await expect(page.getByTestId('week1-overview')).toBeVisible()
  expect(errors).toEqual([])
})

test('Week 1 module page (instructor archive): complete a section, answer a question, use the stakeholder exercise', async ({ page }) => {
  const errors = trackErrors(page)
  await fresh(page, '/archive/week/1')
  await page.getByRole('button', { name: /Mark complete: Intuition/ }).click()
  await expect(page.getByRole('button', { name: /Mark not complete: Intuition/ })).toBeVisible()

  const q = page.getByTestId('quiz-w1q-3')
  await q.getByLabel(/The system whose life cycle is under consideration/).check()
  await q.getByRole('button', { name: 'Check answer' }).click()
  await expect(q.getByRole('status')).toHaveText('Correct')
  await expect(page.getByTestId('quiz-score')).toContainText('Score: 1 correct of 10')

  // the classic page carries the rebuilt Week 1 activities: the AeroLink stakeholder exercise and the need check
  const stk = page.getByTestId('stk-identify')
  await stk.scrollIntoViewIfNeeded()
  await expect(stk.getByRole('button', { name: 'Check', exact: true })).toBeDisabled()
  await stk.getByLabel('Is Weather a stakeholder?').selectOption('no')
  await expect(page.getByTestId('needs-write')).toBeVisible()
  await expect(page.getByTestId('lab-panel')).not.toContainText(/dynamics explorer|causal loop|leverage/i)
  await page.screenshot({ path: `${SHOTS}/02-week1-lesson.png`, fullPage: true })

  // progress persists across reload
  await page.reload()
  await expect(page.getByRole('button', { name: /Mark not complete: Intuition/ })).toBeVisible()
  await expect(page.getByTestId('stk-identify').getByLabel('Is Weather a stakeholder?')).toHaveValue('no')
  expect(errors).toEqual([])
})

test('stakeholder editor: add, relate, validate, persist', async ({ page }) => {
  const errors = trackErrors(page)
  await fresh(page, '/workspace/stakeholders')
  await expect(page.getByTestId('stakeholder-canvas').locator('.react-flow__node')).toHaveCount(7) // 6 lab-sheet stakeholders + enterprise
  await page.getByPlaceholder('e.g. Air navigation service provider').fill('Electric utility')
  await page.getByLabel('Category').first().selectOption('infrastructure')
  await page.getByRole('button', { name: 'Add stakeholder' }).click()
  await expect(page.getByTestId('editor-message')).toContainText('Added STK-007 (Electric utility)')
  await expect(page.getByTestId('stakeholder-canvas').locator('.react-flow__node')).toHaveCount(8)
  const form = page.getByTestId('stakeholder-form')
  await form.getByLabel('Owner (initials)').fill('J')
  await expect(form.getByRole('alert')).toContainText('initials')
  await form.getByLabel('Owner (initials)').fill('JS')
  await expect(form.getByRole('alert')).toHaveCount(0)
  await form.getByLabel('AI-suggested, reviewed by the owner').check()
  await expect(form).toContainText('AI-suggested, reviewed')
  await page.screenshot({ path: `${SHOTS}/04-stakeholder-network.png`, fullPage: true })

  await page.getByRole('tab', { name: 'Table (keyboard-accessible)' }).click()
  await page.getByLabel('Relationship source').selectOption('STK-004')
  await page.getByLabel('Relationship type').selectOption('conflicts-with')
  await page.getByLabel('Relationship target').selectOption('STK-005')
  await page.getByLabel('Relationship note').fill('Noise vs throughput')
  await page.getByRole('button', { name: 'Add relationship' }).click()
  await expect(page.getByRole('listitem').filter({ hasText: 'REL-001' })).toContainText('has conflicting concerns with')
  await page.getByLabel('Concern of STK-007').fill('Peak-load management at vertiport chargers')
  await page.screenshot({ path: `${SHOTS}/05-stakeholder-table.png`, fullPage: true })

  await page.getByRole('tab', { name: /Acceptance checks/ }).click()
  const conflictCheck = page.getByTestId('checks-list').locator('li', { hasText: 'At least one conflict' })
  await expect(conflictCheck).toContainText('1 conflict relationship')
  await page.screenshot({ path: `${SHOTS}/06-stakeholder-checks.png`, fullPage: true })

  await page.reload()
  await page.getByRole('tab', { name: 'Table (keyboard-accessible)' }).click()
  await expect(page.getByLabel('Concern of STK-007')).toHaveValue('Peak-load management at vertiport chargers')

  await page.getByRole('tab', { name: 'Influence–interest grid' }).click()
  await expect(page.getByTestId('quadrant-Manage closely')).toContainText('Passengers')
  expect(errors).toEqual([])
})

test('theme toggle switches dark mode and persists', async ({ page }) => {
  await fresh(page, '/archive/week/1')
  await page.getByLabel(/Colou?r theme/).selectOption('dark')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.screenshot({ path: `${SHOTS}/07-week1-dark.png`, fullPage: false })
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByLabel(/Colou?r theme/).selectOption('light')
  await expect(page.locator('html')).not.toHaveClass(/dark/)
})

test('instructor review mode: inline controls and review log', async ({ page }) => {
  await fresh(page, '/archive/week/1')
  await expect(page.getByTestId('review-w1-intuition')).toHaveCount(0)
  await page.getByLabel('Instructor review mode').check()
  await expect(page.getByTestId('review-w1-intuition')).toBeVisible()
  await page.getByLabel('Review status for Intuition: the people who never ride can still stop the service').selectOption('approved')
  await page.goto('/#/instructor')
  await expect(page.getByTestId('count-approved')).toHaveText('1')
  await page.screenshot({ path: `${SHOTS}/08-instructor-review.png`, fullPage: true })
  await page.goto('/#/workspace/stakeholders')
  await page.getByRole('button', { name: 'Load instructor example' }).click()
  await page.getByRole('tab', { name: /Acceptance checks/ }).click()
  await expect(page.getByRole('tab', { name: /Acceptance checks \(8\/8\)/ })).toBeVisible()
})

test('Week 1 module: lab, assignment with rubric, workload; instructor notes and done-checks in instructor mode', async ({ page }) => {
  const errors = trackErrors(page)
  await fresh(page, '/archive/week/1')
  await expect(page.getByTestId('lab-panel')).toContainText('L1 — Team charter, enterprise proposal, stakeholder register and initial needs')
  const asg = page.getByTestId('assignment-panel')
  await asg.getByText('RB-1 Stakeholder analysis and system context').click()
  await expect(asg.getByRole('cell', { name: /Boundary and context \(20\)/ })).toBeVisible()
  // lecture-first path (2026-10-19): the honest per-student total, inside the 8 h estimate; the optional practice is not counted
  await expect(page.getByText(`Total ≈ ${WEEK1_TOTAL} h this week`, { exact: false })).toBeVisible()
  await expect(page.getByTestId('instructor-notes')).toHaveCount(0)
  await page.getByLabel('Instructor review mode').check()
  const notes = page.getByTestId('instructor-notes')
  await expect(notes).toContainText('Session 1 — concept studio')
  await expect(page.getByTestId('dod-checks')).toContainText('Itemised workload equals the syllabus estimate')
  await notes.screenshot({ path: `${SHOTS}/12-week1-instructor-notes.png` })
  expect(errors).toEqual([])
})

test('AeroLink model workspace: reference view, load reference, add a link, persist', async ({ page }) => {
  const errors = trackErrors(page)
  await fresh(page, '/workspace/model')
  await expect(page.getByRole('heading', { level: 1, name: 'AeroLink engineering model' })).toBeVisible()
  await page.getByRole('button', { name: 'Show the instructor reference model' }).click()
  await expect(page.getByTestId('model-issues')).toContainText('0 errors')
  await page.getByRole('button', { name: 'Show my team model' }).click()
  await page.getByRole('button', { name: /Load reference up to week 14/ }).click()
  await page.getByRole('button', { name: 'Replace' }).click()
  await expect(page.getByTestId('model-message')).toContainText('Loaded the instructor reference')
  await expect(page.getByTestId('model-issues')).toContainText('0 errors')
  await page.getByLabel('Link source ID').fill('STK-001')
  await page.getByLabel('Link type').selectOption('verifies')
  await page.getByLabel('Link target ID').fill('ENT-001')
  await page.getByRole('button', { name: 'Add link' }).click()
  await expect(page.getByTestId('model-message')).toContainText('not an allowed relationship')
  await page.reload()
  await expect(page.getByTestId('model-issues')).toContainText('0 errors')
  await page.screenshot({ path: `${SHOTS}/13-model-workspace.png`, fullPage: false })
  expect(errors).toEqual([])
})

test('every week, the roadmap and the reference pages render without errors', async ({ page }) => {
  const errors = trackErrors(page)
  await fresh(page, '/roadmap')
  await expect(page.getByRole('heading', { name: 'Course roadmap — 14 weeks' })).toBeVisible()
  await page.screenshot({ path: `${SHOTS}/09-roadmap.png`, fullPage: true })
  for (let n = 1; n <= 14; n++) {
    await page.goto(`/#/week/${n}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(new RegExp(`^Week ${n}[: ]`))
    // Week 1 opens on its Overview (M4 part A, 2026-10-21): objectives, what the team creates, and the computed time table
    // (the stage bar leads to Learn, Guided Practice, My Project / Lab and Review & Submit)
    if (n === 1) {
      await expect(page.getByTestId('week1-overview')).toBeVisible()
      await expect(page.getByTestId('ov-time')).toBeVisible()
      await expect(page.getByTestId('week-nav')).toBeVisible()
      continue
    }
    // Week 2 opens on its lecture-first week page on the same template (2026-10-19); its earlier page is archived
    if (n === 2) {
      await expect(page.getByTestId('week2-home')).toBeVisible()
      await expect(page.getByTestId('week2-workload')).toBeVisible()
      continue
    }
    // Week 3 opens on its lecture-first week page on the same template (2026-10-19); its earlier page is archived
    if (n === 3) {
      await expect(page.getByTestId('week3-home')).toBeVisible()
      await expect(page.getByTestId('week3-workload')).toBeVisible()
      continue
    }
    // Week 4 opens on its lecture-first week page on the same template (2026-10-19); its earlier page is archived
    if (n === 4) {
      await expect(page.getByTestId('week4-home')).toBeVisible()
      await expect(page.getByTestId('week4-workload')).toBeVisible()
      continue
    }
    // Week 5 opens on its lecture-first week page on the same template (2026-10-19); its earlier page is archived
    if (n === 5) {
      await expect(page.getByTestId('week5-home')).toBeVisible()
      await expect(page.getByTestId('week5-workload')).toBeVisible()
      continue
    }
    // Week 6 opens on its lecture-first week page on the same template (A21, A24); its earlier page is archived
    if (n === 6) {
      await expect(page.getByTestId('week6-home')).toBeVisible()
      await expect(page.getByTestId('week6-workload')).toBeVisible()
      continue
    }
    // Week 7 opens on its lecture-first week page on the same template (A21 decision 7, A24); its earlier page is archived
    if (n === 7) {
      await expect(page.getByTestId('week7-home')).toBeVisible()
      await expect(page.getByTestId('week7-workload')).toBeVisible()
      continue
    }
    // Week 9 opens on its lecture-first week page on the same template (A21, A24); its earlier page is archived
    if (n === 9) {
      await expect(page.getByTestId('week9-home')).toBeVisible()
      await expect(page.getByTestId('week9-workload')).toBeVisible()
      continue
    }
    // Week 11 opens on its lecture-first week page on the same template (A21, A24); its earlier page is archived
    if (n === 11) {
      await expect(page.getByTestId('week11-home')).toBeVisible()
      await expect(page.getByTestId('week11-workload')).toBeVisible()
      continue
    }
    // Week 10 opens on its lecture-first week page on the same template (A21, A24); its earlier page is archived
    if (n === 10) {
      await expect(page.getByTestId('week10-home')).toBeVisible()
      await expect(page.getByTestId('week10-workload')).toBeVisible()
      continue
    }
    // Week 8 opens on its lecture-first week page on the same template; its earlier page is archived
    if (n === 8) {
      await expect(page.getByTestId('week8-home')).toBeVisible()
      await expect(page.getByTestId('week8-workload')).toBeVisible()
      continue
    }
    // a converted week opens in the workbench (Week 1: the book-style flow); its classic page keeps the lab, assignment and workload panels
    if ((await page.getByTestId('workbench').count()) || (await page.getByTestId('week-flow').count())) {
      if (!(await page.getByTestId('week-flow').count())) await expect(page.getByTestId('mission-brief')).toBeVisible()
      await page.goto(`/#/week/${n}/classic`)
      await expect(page.getByRole('heading', { level: 1 })).toContainText(new RegExp(`^Week ${n}[: ]`))
    }
    // an authored week shows its lab, assignment and workload; a week being rebuilt (A19 schedule) says so and links its draft material
    const authored = await page.getByTestId('lab-panel').count()
    if (authored) {
      await expect(page.getByTestId('assignment-panel')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Estimated student workload' })).toBeVisible()
    } else {
      await expect(page.getByTestId('rebuild-notice')).toContainText('being rebuilt from the Week 1 template')
      await expect(page.getByTestId('draft-links').getByRole('link').first()).toBeVisible()
    }
  }
  // the earlier reviewed draft material stays reachable, under a labeled archive route, never under a current week title
  await page.goto('/#/archive/week/5')
  await page.getByTestId('draft-links').getByRole('link', { name: /^Old Week 8:/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Earlier draft, old Week 8: Architecture viewpoints, decomposition, interfaces and information')
  await expect(page.getByTestId('draft-banner')).toContainText('not a current week')
  await expect(page.getByTestId('lab-panel')).toBeVisible()
  await page.goto('/#/draft/14')
  await expect(page.getByTestId('draft-banner')).toBeVisible()
  // rebuild review F07: the old Week 1 archive page shows neither the old B1.x objectives nor the explorer-and-memo task
  await page.goto('/#/draft/1')
  await expect(page.getByTestId('rebuilt-in-place')).toContainText('rebuilt in place as the current Week 1')
  await expect(page.locator('main')).not.toContainText(/dynamics explorer|memo|B1\.1/)
  for (const [path, heading] of [
    ['/workspace/aerolink', 'Air Taxi Enterprise workspace'],
    ['/sources', 'Verified sources'],
    ['/sysml', 'SysML v2: teaching editor vs conformant modelling tool'],
    ['/progress', 'My progress'],
  ] as const) {
    await page.goto(`/#${path}`)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
  }
  await page.goto('/#/sysml')
  await page.screenshot({ path: `${SHOTS}/10-sysml-toolchain.png`, fullPage: true })
  await page.goto('/#/workspace/aerolink')
  await page.screenshot({ path: `${SHOTS}/11-case-study.png`, fullPage: true })
  expect(errors).toEqual([])
})

const A11Y_PAGES = ['/', '/welcome', '/roadmap', ...Array.from({ length: 14 }, (_, i) => `/week/${i + 1}`), '/archive/week/1', '/draft/8', '/draft/14', '/workspace/stakeholders', '/workspace/model', '/workspace/aerolink', '/progress', '/sources', '/instructor', '/sysml']
for (const theme of ['light', 'dark'] as const) {
  test(`accessibility (axe, WCAG 2 A/AA) — ${theme} theme`, async ({ page }) => {
    test.setTimeout(240_000) // 24 pages × an axe pass each; the default 60 s is too tight on a loaded machine
    await fresh(page)
    await page.getByLabel(/Colou?r theme/).selectOption(theme)
    const report: string[] = []
    for (const path of A11Y_PAGES) {
      await page.goto(`/#${path}`)
      await page.waitForTimeout(300)
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      for (const v of results.violations) report.push(`${path} [${v.impact}] ${v.id}: ${v.nodes.length} node(s)`)
    }
    test.info().annotations.push({ type: 'axe', description: report.join('\n') || 'no violations' })
    console.log(`AXE ${theme}:\n${report.join('\n') || 'no violations'}`)
    expect(report).toEqual([])
  })
}
