// Course welcome and the book-style Week 1 flow: stage gating, a section check, Practice unlock, the shared prediction,
// axe on every stage (light and dark), and the screenshots in screenshots/week1-flow/.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { LEARN_SECTIONS } from '../src/content/learn/week01'

const SHOTS = 'screenshots/week1-flow'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function fresh(page: Page, path: string, seed?: Record<string, unknown>) {
  await page.goto('/#/')
  await page.evaluate((flow) => {
    window.localStorage.clear()
    if (flow) window.localStorage.setItem('sysml-studio:v1:w1-flow', JSON.stringify(flow))
  }, seed ?? null)
  await page.goto(`/#${path}`)
}

const ALL_READ = { checks: {}, read: Object.fromEntries(LEARN_SECTIONS.map((s) => [s.id, true])), selfRating: {}, timePlan: {}, worked: {}, memo: {} }

function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  return errors
}

const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)

async function answerCorrectly(page: Page, id: string) {
  const s = LEARN_SECTIONS.find((x) => x.id === id)!
  const check = page.getByTestId(`check-${s.check.id}`)
  await check.getByLabel(s.check.options.find((o) => o.correct)!.text, { exact: true }).check()
  await check.getByRole('button', { name: 'Check my answer' }).click()
  await expect(check.getByRole('status')).toHaveText('Correct.')
}

test('course welcome: the five blocks, the 14-week map, and the way into Week 1', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/')
  await page.getByTestId('start-here').getByRole('link', { name: 'Course welcome' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Systems Thinking and MBSE with SysML v2' })).toBeVisible()
  for (const h of ['1. What this subject is', '2. Why engineers need it', '3. The AeroLink case', '4. The 14-week map', '5. How a week works']) await expect(page.getByRole('heading', { name: h })).toBeVisible()
  await expect(page.getByTestId('welcome')).toContainText('R28 · SEBoK')
  await expect(page.getByTestId('course-timeline').locator('[aria-current="step"]')).toContainText('W1')
  await expect(page.getByTestId('course-timeline')).toContainText('CP5')
  await page.screenshot({ path: `${SHOTS}/welcome-1440x900-light.png`, fullPage: true })
  await page.getByTestId('welcome-start').click()
  await expect(page.getByTestId('week-flow')).toHaveAttribute('data-stage', 'overview')
  expect(errors).toEqual([])
})

test('Week 1 flow: prediction, a check gates "read", Practice unlocks only when Learn is complete, and the prediction is already in mission 1', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/1')
  await expect(page.getByRole('heading', { level: 1, name: /^Week 1 — Systems, systems thinking/ })).toBeVisible()
  // Overview: record the prediction (locked)
  const pred = page.getByTestId('opener-prediction')
  await pred.getByLabel('Only up to a point — then extra aircraft stop helping').check()
  await pred.getByRole('button', { name: 'Record my prediction' }).click()
  await expect(pred.getByRole('status')).toContainText('Recorded and locked')
  await expect(pred.getByLabel('Yes — every aircraft added keeps cutting the wait')).toBeDisabled()

  // Practice is locked before Learn
  await page.getByTestId('stage-practice').click()
  await expect(page.getByTestId('practice-locked')).toBeVisible()
  await expect(page.getByTestId('workbench')).toHaveCount(0)

  // L1: the section cannot be marked read until its check is answered
  await page.getByRole('link', { name: /Continue with L1/ }).click()
  await expect(page.getByTestId('section-l1')).toBeVisible()
  await expect(page.getByTestId('mark-read')).toBeDisabled()
  // a wrong answer gives feedback and can be retried
  // a wrong answer shows only its own feedback (the key stays hidden) and can be retried once (review W1F-F13)
  const c1 = page.getByTestId('check-c1')
  const c1Spec = LEARN_SECTIONS[0].check
  const wrong = c1Spec.options.find((o) => !o.correct)!
  await c1.getByLabel(wrong.text, { exact: true }).check()
  await c1.getByRole('button', { name: 'Check my answer' }).click()
  await expect(c1.getByRole('status')).toContainText('Not quite')
  await expect(c1).toContainText(wrong.feedback)
  await expect(c1).not.toContainText(c1Spec.options.find((o) => o.correct)!.feedback)
  await c1.getByRole('button', { name: 'Try again' }).click()
  await answerCorrectly(page, 'l1')
  await expect(page.getByTestId('mark-read')).toBeEnabled()
  await page.getByTestId('mark-read').click()
  await expect(page.getByTestId('section-l2')).toBeVisible()
  await expect(page.getByTestId('learn-progress')).toHaveText('1 of 7 sections read')

  // L2–L7
  for (const s of LEARN_SECTIONS.slice(1)) {
    await expect(page.getByTestId(`section-${s.id}`)).toBeVisible()
    await answerCorrectly(page, s.id)
    await page.getByTestId('mark-read').click()
  }
  await expect(page.getByTestId('section-summary')).toBeVisible()
  await expect(page.getByTestId('learn-progress')).toHaveText('7 of 7 sections read')
  await expect(page.getByTestId('stage-learn')).toHaveClass(/is-done/)

  // Practice: the plan, then the workbench; the opener's prediction already completes mission 1, step 1
  await page.getByRole('link', { name: /Next: Practice/ }).click()
  await expect(page.getByTestId('practice-plan')).toBeVisible()
  await page.getByTestId('open-workbench').click()
  await expect(page.getByTestId('workbench')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByTestId('step-predict')).toHaveAttribute('data-status', 'done')
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('sysml-studio:v1:mission-progress') ?? '{}')['w1-m1-try']?.answers?.prediction?.value)
  expect(stored).toBe('partly')
  expect(await noHorizontalScroll(page)).toBe(true)

  // progress persists per viewer
  await page.reload()
  await expect(page.getByTestId('workbench')).toBeVisible({ timeout: 30_000 })
  await page.getByTestId('stage-learn').click()
  await expect(page.getByTestId('learn-progress')).toHaveText('7 of 7 sections read')
  expect(errors).toEqual([])
})

test('instructor mode bypasses the Practice lock; L6 worked input and C6 feedback use the model numbers', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/1/learn/l6')
  // the crossover is not drawn until the student has answered the faded step (review W1F-F03)
  await expect(page.getByTestId('figure-capacity-crossover')).toBeVisible()
  await expect(page.getByTestId('crossover-marker')).toHaveCount(0)
  await expect(page.getByTestId('figure-capacity-crossover')).not.toContainText('14.4')
  await expect(page.getByTestId('served-series')).toHaveCount(1)
  const step = page.getByLabel(/Your turn: set the two capacities equal/)
  await step.fill('14.4')
  await page.getByRole('button', { name: 'Check', exact: true }).click()
  await expect(page.getByTestId('section-l6').getByRole('status').first()).toHaveText('Correct.')
  await expect(page.getByTestId('crossover-marker')).toHaveCount(1)
  await expect(page.getByTestId('figure-capacity-crossover')).toContainText('crossover 14.4 aircraft')
  await answerCorrectly(page, 'l6')
  await expect(page.getByTestId('check-c6')).toContainText('12 × 48 × 30 = 17,280 trips per month')
  await page.getByTestId('stage-practice').click()
  await expect(page.getByTestId('practice-locked')).toBeVisible()
  await page.getByLabel('Instructor mode').check()
  await expect(page.getByTestId('practice-plan')).toBeVisible()
  // "Read more" opens the exact pages in the verified register
  await page.goto('/#/week/1/learn/l6')
  await page.getByTestId('read-more-l6').getByRole('link').first().click()
  await expect(page.getByTestId('read-more-target')).toContainText('R05')
  await expect(page.getByTestId('read-more-target')).toContainText('p.283–284')
})

test('Check & submit: objective status, quiz Q1, L1 record and memo template, bridge to Week 2', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/1/check')
  await expect(page.getByRole('heading', { level: 1, name: 'Check your understanding and submit' })).toBeVisible()
  const q = page.getByTestId('quiz-q1-3')
  await q.getByLabel(/A purposeful combination of interdependent resources/).check()
  await q.getByRole('button', { name: 'Check answer' }).click()
  await expect(q.getByRole('status')).toHaveText('Correct')
  await expect(page.getByTestId('objective-status')).toContainText('1/6 correct (1 answered)')
  await expect(page.getByLabel(/1\. Question and system of interest/)).toBeVisible()
  await expect(page.getByTestId('bridge')).toContainText('Who controls your leverage point?')
})

// ------------------------------------------------------------------------------------------- axe, every stage, both themes
const STAGES: [string, string, Record<string, unknown> | undefined][] = [
  ['welcome', '/welcome', undefined],
  ['overview', '/week/1', undefined],
  ...LEARN_SECTIONS.map((s) => [s.id, `/week/1/learn/${s.id}`, undefined] as [string, string, undefined]),
  ['summary', '/week/1/learn/summary', undefined],
  ['practice-locked', '/week/1/practice', undefined],
  ['practice-plan', '/week/1/practice', ALL_READ],
  ['practice-workbench', '/week/1/practice', { ...ALL_READ, practiceStarted: true }],
  ['check', '/week/1/check', undefined],
]

for (const theme of ['light', 'dark'] as const) {
  test(`axe: course welcome and every Week 1 stage — ${theme}`, async ({ page }) => {
    test.setTimeout(300_000)
    await page.setViewportSize({ width: 1440, height: 900 })
    const report: string[] = []
    for (const [label, path, seed] of STAGES) {
      await fresh(page, path, seed)
      await page.getByLabel('Colour theme').first().selectOption(theme)
      if (label === 'practice-workbench') await expect(page.getByTestId('workbench')).toBeVisible({ timeout: 30_000 })
      // open every text equivalent and "go deeper" so their contents are scanned too
      await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)))
      await page.waitForTimeout(300)
      const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      for (const v of r.violations) report.push(`${label} [${v.impact}] ${v.id}: ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(' ')}`)
    }
    console.log(`AXE week1-flow ${theme}:\n${report.join('\n') || 'no violations'}`)
    expect(report.filter((l) => /\[(serious|critical)\]/.test(l))).toEqual([])
    expect(report).toEqual([])
  })
}

// ------------------------------------------------------------------------------------------- responsive and screenshots
test('400 px: welcome and L1 fit without horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 860 })
  for (const theme of ['light', 'dark'] as const) {
    await fresh(page, '/welcome')
    await page.getByLabel('Colour theme').selectOption(theme)
    expect(await noHorizontalScroll(page), `welcome ${theme}`).toBe(true)
    await page.screenshot({ path: `${SHOTS}/welcome-400-${theme}.png`, fullPage: true })
    await page.goto('/#/week/1/learn/l1')
    await expect(page.getByTestId('section-l1')).toBeVisible()
    expect(await noHorizontalScroll(page), `l1 ${theme}`).toBe(true)
    await page.screenshot({ path: `${SHOTS}/l1-400-${theme}.png`, fullPage: true })
  }
  // the other stages also fit
  for (const path of ['/week/1', '/week/1/learn/l6', '/week/1/learn/summary', '/week/1/check']) {
    await page.goto(`/#${path}`)
    await page.waitForTimeout(300)
    expect(await noHorizontalScroll(page), path).toBe(true)
  }
})

test('screenshots 1440x900: welcome, opener, every section, summary, practice, check (light; welcome and L1 also dark)', async ({ page }) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  const shoot = async (name: string, path: string, seed?: Record<string, unknown>, theme: 'light' | 'dark' = 'light') => {
    await fresh(page, path, seed)
    await page.getByLabel('Colour theme').first().selectOption(theme)
    if (name.startsWith('practice-workbench')) await expect(page.getByTestId('workbench')).toBeVisible({ timeout: 30_000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${SHOTS}/${name}.png` })
  }
  await shoot('welcome-1440x900-light-viewport', '/welcome')
  await shoot('welcome-1440x900-dark', '/welcome', undefined, 'dark')
  await shoot('overview-1440x900-light', '/week/1')
  for (const s of LEARN_SECTIONS) await shoot(`${s.id}-1440x900-light`, `/week/1/learn/${s.id}`)
  await shoot('l1-1440x900-dark', '/week/1/learn/l1', undefined, 'dark')
  await shoot('summary-1440x900-light', '/week/1/learn/summary', ALL_READ)
  await shoot('practice-locked-1440x900-light', '/week/1/practice')
  await shoot('practice-plan-1440x900-light', '/week/1/practice', ALL_READ)
  await shoot('practice-workbench-1440x900-light', '/week/1/practice', { ...ALL_READ, practiceStarted: true })
  await shoot('check-1440x900-light', '/week/1/check')
  // full-page views of the reading stages and every figure on its own
  for (const s of LEARN_SECTIONS) {
    await fresh(page, `/week/1/learn/${s.id}`)
    await page.waitForTimeout(400)
    const figs = page.locator('figure')
    for (let i = 0; i < (await figs.count()); i++) await figs.nth(i).screenshot({ path: `${SHOTS}/figure-${s.id}-${i + 1}.png` })
  }
  // L6 after the faded step is answered (crossover revealed), and the opener figure
  await fresh(page, '/week/1/learn/l6', { checks: {}, read: {}, selfRating: {}, timePlan: {}, worked: { l6: '14.4' }, memo: {} })
  await page.waitForTimeout(300)
  await page.getByTestId('figure-capacity-crossover').screenshot({ path: `${SHOTS}/figure-l6-1-revealed.png` })
  await fresh(page, '/week/1')
  await page.getByTestId('figure-jam').screenshot({ path: `${SHOTS}/figure-overview-jam.png` })
})
