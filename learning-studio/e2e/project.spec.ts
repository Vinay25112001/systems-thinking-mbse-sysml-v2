// My Project (DECISION_LOG A22, UPDATED_IMPLEMENTATION_ROADMAP.md P1): the directive §13 demo workflow end to end —
// (1) review the Week 1 lecture → (2) practise stakeholder analysis on AeroLink → (3) open My Project → (4) create the
// team's own enterprise → (5) save stakeholders and needs in the Week 1 lab tool → (6) view milestone progress →
// (7) export, then restore into a fresh profile (cleared storage) → (8) see the Week 8 mapping preview; plus overwrite
// protection, practice copy with confirmation, storage failure, the second-tab lock, keyboard use and axe on every new
// page (light and dark, 1440 and 400 px). Screenshots and the demo GIF go to screenshots/project-demo/.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

const SHOTS = 'screenshots/project-demo'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
let frame = 0
const shot = async (page: Page, name: string, fullPage = false) => {
  frame++
  await page.screenshot({ path: `${SHOTS}/${String(frame).padStart(2, '0')}-${name}.png`, fullPage })
}

function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`)
  })
  return errors
}
async function fresh(page: Page, path: string) {
  await page.goto('/#/')
  await page.evaluate(() => window.localStorage.clear())
  await page.goto(`/#${path}`)
}
async function createProject(page: Page, name = 'Harbor Shuttle Cooperative', team = '07', initials = 'JS') {
  await page.goto('/#/project')
  await expect(page.getByTestId('project-create')).toBeVisible()
  await page.getByTestId('create-team').fill(team)
  await page.getByTestId('create-initials').fill(initials)
  await page.getByTestId('create-name').fill(name)
  await page.getByTestId('create-empty').click()
  await expect(page.getByTestId('project-overview')).toBeVisible()
}
const tv = (page: Page) => page.getByTestId('view-team')

test('demo workflow: lecture → AeroLink practice → My Project → own enterprise → stakeholders and needs → milestones → export and restore → Week 8 preview', async ({ page, browser }) => {
  test.setTimeout(300_000)
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })

  // (1) review the Week 1 lecture, keyboard through the slides
  await fresh(page, '/week/1/lecture/1')
  const counter = page.getByTestId('slide-counter')
  await expect(counter).toHaveText(/^Slide 1 of \d+$/)
  await page.keyboard.press('ArrowRight')
  await expect(counter).toHaveText(/^Slide 2 of \d+$/)
  await expect(page.getByTestId('nav-my-project')).toBeVisible()
  await page.mouse.move(0, 0)
  await shot(page, 'lecture')

  // (2) practise stakeholder analysis on AeroLink: the practice is labeled as the instructor example
  await page.goto('/#/week/1/examples/practice')
  await expect(page.getByTestId('workbench')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByTestId('example-banner')).toContainText('Practice: AeroLink (instructor example, fictional)')
  const cand = page.getByTestId('stk-candidates')
  await expect(cand).toBeVisible()
  await cand.locator('select').first().selectOption('yes')
  await cand.locator('select').nth(1).selectOption('yes')
  await shot(page, 'aerolink-practice')
  await page.goto('/#/week/1/examples')
  const handoff = page.getByTestId('handoff-panel')
  await handoff.scrollIntoViewIfNeeded()
  await expect(handoff).toContainText('Now apply this engineering method to your own enterprise.')
  await expect(handoff).toContainText('at least 8 stakeholders')
  await handoff.screenshot({ path: `${SHOTS}/${String(++frame).padStart(2, '0')}-handoff-panel.png` })

  // (3) open My Project from the persistent nav link, with the keyboard
  await page.getByTestId('nav-my-project').first().focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('project-create')).toBeVisible()
  await expect(page.getByTestId('project-create')).toContainText('saved in this browser only')
  await shot(page, 'create-screen')

  // (4) create the team's own enterprise
  await page.getByTestId('create-team').fill('07')
  await page.getByTestId('create-initials').fill('JS')
  await page.getByTestId('create-name').fill('Harbor Shuttle Cooperative')
  await page.getByTestId('create-empty').click()
  await expect(page.getByTestId('enterprise-name')).toHaveText('Harbor Shuttle Cooperative')
  await expect(page.getByTestId('nav-my-project')).toContainText('Harbor Shuttle Cooperative')
  await expect(page.getByTestId('title-block')).not.toContainText('AeroLink')
  await shot(page, 'overview-new')

  // (5) save stakeholders and needs in the Week 1 lab tool (linked to the project)
  await page.getByTestId('open-lab-tool').click()
  await expect(page.getByTestId('workbench')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByTestId('team-project-banner')).toContainText('Linked to My Project')
  const t = tv(page)
  await t.getByLabel('Domain').fill('Coastal passenger transport')
  await t.getByLabel(/^Mission, MGO-001/).fill('Carry island residents and visitors to the mainland safely and on time every day of the year.')
  await t.getByRole('button', { name: 'Add a stakeholder' }).click()
  await t.getByLabel('Stakeholder', { exact: true }).first().fill('Island commuters')
  await t.getByLabel(/^Concern CON-001/).fill('Commuters miss work when the 7:10 crossing is cancelled in winter storms')
  await t.getByRole('button', { name: 'Add a stakeholder' }).click()
  await t.getByLabel('Stakeholder', { exact: true }).nth(1).fill('Harbor authority')
  await t.getByRole('button', { name: 'Add a need' }).click()
  await t.getByLabel('Short name').first().fill('Reliable winter crossing')
  await t.getByLabel(/^Source stakeholder/).first().fill('STK-001')
  await t.getByLabel(/^Answers concern/).first().fill('CON-001')
  await t.getByLabel(/^Goal it serves/).first().fill('MGO-001')
  await t.getByLabel(/^Need statement/).first().fill('The island commuters need the shuttle service to reach the mainland before 8:00 on winter workdays.')
  await expect(page.getByTestId('save-status').first()).toContainText(/Saved/, { timeout: 10_000 })
  await page.mouse.move(0, 0)
  await shot(page, 'lab-tool-linked')

  // (6) milestone progress, library, history
  await page.goto('/#/project')
  await expect(page.getByTestId('milestone-1')).toContainText('In progress')
  await expect(page.getByTestId('milestone-2')).toHaveAttribute('aria-label', /Upcoming/)
  await expect(page.getByTestId('card-STK')).toContainText('2')
  await shot(page, 'overview-progress', true)
  await page.getByTestId('milestone-1').click()
  await expect(page.getByTestId('milestone-1-detail')).toContainText('Expected artifacts')
  await shot(page, 'milestone-week1', true)
  await page.goto('/#/project/artifacts/STK')
  await expect(page.getByTestId('row-STK-001')).toContainText('Island commuters')
  await expect(page.getByTestId('row-STK-002')).toContainText('Harbor authority')
  await shot(page, 'library-stakeholders')
  await page.getByRole('link', { name: 'STK-001' }).click()
  await expect(page.getByTestId('artifact-page')).toContainText('NEED-001 derives from STK-001')
  await shot(page, 'artifact-stk-001')
  await page.goto('/#/project/history')
  await expect(page.getByTestId('change-row').first()).toContainText('JS (self-declared)')
  await shot(page, 'history')

  // (7) export the project, then restore it into a fresh profile (a new, empty browser context)
  await page.goto('/#/project/transfer')
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('export-project').click()])
  expect(dl.suggestedFilename()).toMatch(/^team-07-project-\d{4}-\d{2}-\d{2}\.json$/)
  const file = `${SHOTS}/demo-export.json`
  await dl.saveAs(file)
  const exported = JSON.parse(readFileSync(file, 'utf8'))
  expect(exported.format).toBe('sysml-studio-project')
  expect(exported.integrity.value).toMatch(/^[0-9a-f]{64}$/)
  await expect(page.getByTestId('export-msg').or(page.getByTestId('transfer-msg'))).toContainText('Exported')
  await shot(page, 'transfer')

  const ctx2 = await browser.newContext({ baseURL: 'http://127.0.0.1:5173', viewport: { width: 1440, height: 900 } })
  const p2 = await ctx2.newPage()
  const errors2 = trackErrors(p2)
  await p2.goto('/#/project')
  await expect(p2.getByTestId('project-create')).toBeVisible()
  await p2.getByTestId('create-import').setInputFiles(file)
  await expect(p2.getByTestId('create-import-report')).toContainText('Checksum verified')
  await shot(p2, 'restore-report')
  await p2.getByTestId('create-import-confirm').click()
  await expect(p2.getByTestId('enterprise-name')).toHaveText('Harbor Shuttle Cooperative')
  await p2.goto('/#/project/artifacts/NEED')
  await expect(p2.getByTestId('row-NEED-001')).toContainText('Reliable winter crossing')
  await p2.reload()
  await expect(p2.getByTestId('row-NEED-001')).toBeVisible()
  await expect(p2.getByTestId('readonly-banner')).toHaveCount(0)
  await shot(p2, 'restored-library')

  // (8) the Week 8 mapping preview of the same data
  await p2.goto('/#/project/model')
  await expect(p2.getByTestId('preview-STK-001')).toContainText('Island commuters')
  await expect(p2.getByTestId('preview-NEED-001')).toBeVisible()
  await expect(p2.getByTestId('generated-sysml')).toContainText("<'STK-001'>")
  await expect(p2.getByTestId('status-legend')).toContainText('Mapping proposed')
  await expect(p2.locator('[data-status="mapped"]')).toHaveCount(1) // the legend entry only: nothing is ever Mapped in the preview
  await p2.getByTestId('preview-STK-001').getByRole('button').click()
  await expect(p2.getByTestId('preview-detail')).toContainText('STK-001')
  await shot(p2, 'week8-preview', true)
  await ctx2.close()
  expect(errors.filter((e) => !/Download/.test(e))).toEqual([])
  expect(errors2).toEqual([])
})

test('overwrite protection: an import is planned first, Replace needs the typed title, a pre-import version restores the previous state', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#/')
  await createProject(page, 'Valley Clinic Network', '12', 'AB')
  // a teammate's (different) project file
  const other = { format: 'sysml-studio-project', schemaVersion: 1, exportedAt: '2026-10-19T12:00:00.000Z', exportedBy: 'CD', app: { name: 'sysml-learning-studio', version: '0.0.0', edition: 'student' }, scope: 'full', includesHistory: false, project: { uid: 'p-other', title: '', createdAt: '2026-10-19T12:00:00.000Z', updatedAt: '2026-10-19T12:00:00.000Z', createdWith: { app: 'sysml-learning-studio', version: '0.0.0' }, course: { teamLabel: '12' }, model: { purpose: '', options: { assessment: true, relationships: 'all' } } }, team: { label: '12', threePersonTeam: false, members: [], roles: {}, decisionRules: '', norms: '', prefixOwnership: {}, prefixesText: '' }, artifacts: [{ uid: 'e-other', id: 'ENT-001', type: 'ENT', title: 'Valley Clinic Network (teammate)', description: '', attributes: {}, status: 'active', provenance: { kind: 'own' }, validation: {}, review: { state: 'none' }, milestones: [1], aiAssisted: false, unresolvedRefs: [], formerIds: [], created: { at: '', by: 'CD', change: '' }, revised: { at: '', by: 'CD', change: '' }, revision: 2 }, { uid: 's-other', id: 'STK-001', type: 'STK', title: 'Rural patients', description: '', attributes: {}, status: 'active', provenance: { kind: 'own' }, validation: {}, review: { state: 'none' }, milestones: [1], aiAssisted: false, unresolvedRefs: [], formerIds: [], created: { at: '', by: 'CD', change: '' }, revised: { at: '', by: 'CD', change: '' }, revision: 1 }], relationships: [], milestones: [], modelElements: [], mappings: [], findings: [], issued: { STK: 1 }, changes: [] }
  await page.goto('/#/project/transfer')
  await page.getByTestId('import-file').setInputFiles({ name: 'teammate.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(other)) })
  await expect(page.getByTestId('import-flow')).toBeVisible()
  await expect(page.getByTestId('import-issues')).toContainText('no checksum')
  await expect(page.getByTestId('plan-ENT-001')).toContainText('Conflict')
  await expect(page.getByTestId('plan-STK-001')).toContainText('New')
  await expect(page.getByTestId('import-merge')).toBeDisabled() // a conflict needs a choice
  await shot(page, 'import-plan', true)
  await page.getByTestId('import-replace').click()
  await page.getByTestId('replace-title').fill('wrong title')
  await expect(page.getByTestId('replace-confirm')).toBeDisabled()
  await page.getByTestId('replace-title').fill('Valley Clinic Network')
  await page.getByTestId('replace-confirm').click()
  await expect(page.getByTestId('transfer-msg')).toContainText('pre-import version')
  await page.goto('/#/project')
  await expect(page.getByTestId('enterprise-name')).toHaveText('Valley Clinic Network (teammate)')
  await page.goto('/#/project/history')
  const pre = page.getByTestId('version-row').filter({ hasText: 'pre-import' }).first()
  await pre.getByRole('button', { name: /Restore as current/ }).click()
  await page.getByTestId('restore-rationale').fill('the replace was a mistake')
  await page.getByTestId('restore-confirm').click()
  await page.goto('/#/project')
  await expect(page.getByTestId('enterprise-name')).toHaveText('Valley Clinic Network')
})

test('the Week 1 lab tool import goes through the plan in project mode, and asks before replacing in legacy mode', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/1/lab/tool')
  await expect(page.getByTestId('workbench')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByTestId('team-legacy-banner')).toContainText('Not linked to a project')
  const t = tv(page)
  await t.getByLabel('Enterprise name').fill('Existing record')
  const v1 = { format: 'week1-model-inputs', version: 1, team: '07', enterprise: { name: 'From the file' }, stakeholders: [{ id: 'STK-001', name: 'Drivers' }], concerns: [], needs: [] }
  await t.locator('input[type="file"]').setInputFiles({ name: 'w1.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(v1)) })
  await expect(page.getByTestId('team-import-dialog')).toContainText('Replace the Team Record in this browser?')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(t.getByLabel('Enterprise name')).toHaveValue('Existing record')
  // project mode
  await createProject(page, 'Plan Test Enterprise')
  await page.goto('/#/week/1/lab/tool')
  await expect(page.getByTestId('team-project-banner')).toBeVisible({ timeout: 30_000 })
  await tv(page).locator('input[type="file"]').setInputFiles({ name: 'w1.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(v1)) })
  await expect(page.getByTestId('import-flow')).toBeVisible()
  await expect(page.getByTestId('plan-table')).toBeVisible()
  await page.getByTestId('import-cancel').click()
  await expect(page.getByTestId('team-import-msg')).toContainText('Not imported')
  await expect(tv(page).getByLabel('Enterprise name')).toHaveValue('Plan Test Enterprise')
})

test('copy from practice needs the confirmation; copies carry the practice badge and new IDs', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#/')
  await createProject(page, 'Copy Test Enterprise')
  await page.goto('/#/week/1/examples')
  const h = page.getByTestId('handoff-panel')
  await h.getByTestId('copy-from-practice').click()
  const d = page.getByTestId('copy-dialog')
  await expect(d).toContainText('They count only after you adapt them')
  await d.getByRole('checkbox').first().check()
  await d.getByTestId('copy-next').click()
  await expect(d.getByTestId('copy-list')).toContainText('Passengers')
  await shot(page, 'copy-confirm')
  await d.getByTestId('copy-confirm').click()
  await expect(page.getByTestId('copy-msg')).toContainText('STK-001')
  await page.goto('/#/project/artifacts/STK')
  await expect(page.getByTestId('row-STK-001')).toContainText('Copied from practice')
  await page.goto('/#/project/milestones/1')
  await expect(page.getByTestId('milestone-1-detail')).toContainText('0 of 8')
})

test('storage: the memory fallback shows its banner and export still works; a failing disk shows "Not saved"', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/?storage=memory#/project')
  await expect(page.getByTestId('memory-banner')).toContainText('This browser is not saving your project')
  await page.getByTestId('create-initials').fill('JS')
  await page.getByTestId('create-empty').click()
  await expect(page.getByTestId('project-overview')).toBeVisible()
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('memory-banner').getByRole('button', { name: /Export project/ }).click()])
  expect(dl.suggestedFilename()).toMatch(/project/)
  await page.goto('/?storage=fail#/project')
  await page.getByTestId('create-initials').fill('JS')
  await page.getByTestId('create-empty').click()
  await expect(page.getByTestId('save-error-banner')).toContainText('Not saved')
  await shot(page, 'not-saved')
})

test('a second tab opens the project read-only and can take over editing', async ({ page, context }) => {
  test.setTimeout(120_000)
  await page.goto('/#/')
  await createProject(page, 'Two Tabs Enterprise')
  const p2 = await context.newPage()
  await p2.goto('/#/project')
  await expect(p2.getByTestId('readonly-banner')).toContainText('open for editing in another tab')
  await p2.getByRole('button', { name: 'Take over editing' }).click()
  await expect(p2.getByTestId('readonly-banner')).toHaveCount(0)
  await page.bringToFront()
  await expect(page.getByTestId('readonly-banner')).toContainText('taken over')
})

test('keyboard: the My Project tabs and the create form work without a mouse', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#/project')
  await page.getByTestId('create-team').focus()
  await page.keyboard.type('05')
  await page.keyboard.press('Tab')
  await page.keyboard.type('KB')
  await page.keyboard.press('Tab')
  await page.keyboard.type('Keyboard Enterprise')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('enterprise-name')).toHaveText('Keyboard Enterprise')
  await page.getByTestId('project-tab-overview').focus()
  for (const tab of ['milestones', 'artifacts', 'history', 'transfer', 'model']) {
    await page.keyboard.press('Tab')
    await expect(page.getByTestId(`project-tab-${tab}`)).toBeFocused()
  }
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('project-model-preview')).toBeVisible()
})

for (const theme of ['light', 'dark'] as const) {
  for (const w of [1440, 400]) {
    test(`axe and layout: My Project pages at ${w} px — ${theme}`, async ({ page }) => {
      test.setTimeout(420_000)
      await page.setViewportSize({ width: w, height: 900 })
      await page.goto('/#/')
      await page.evaluate((t) => window.localStorage.setItem('sysml-studio:v1:theme', JSON.stringify(t)), theme)
      await page.goto('/#/project')
      await page.reload()
      expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(theme === 'dark')
      const axe = async (label: string) => {
        const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
        expect(r.violations.map((v) => `${label}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([])
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${label}: no horizontal scroll`).toBe(true)
      }
      await expect(page.getByTestId('project-create')).toBeVisible()
      await axe('create')
      await page.getByTestId('create-team').fill('07')
      await page.getByTestId('create-initials').fill('JS')
      await page.getByTestId('create-name').fill('Axe Test Enterprise')
      await page.getByTestId('create-empty').click()
      await expect(page.getByTestId('project-overview')).toBeVisible()
      await axe('overview')
      for (const [path, id] of [['/project/milestones', 'project-milestones'], ['/project/milestones/1', 'milestone-1-detail'], ['/project/milestones/9', 'milestone-9-detail'], ['/project/artifacts', 'project-library'], ['/project/artifacts/ENT', 'project-library'], ['/project/artifact/ENT-001', 'artifact-page'], ['/project/history', 'project-history'], ['/project/transfer', 'project-transfer'], ['/project/model', 'project-model-preview'], ['/week/1/examples', 'handoff-panel'], ['/week/1/lab', 'handoff-panel']] as const) {
        await page.goto(`/#${path}`)
        await expect(page.getByTestId(id)).toBeVisible()
        await axe(path)
        if (w === 1440 && path.startsWith('/project')) await page.screenshot({ path: `${SHOTS}/axe-${path.replace(/\//g, '_').slice(1)}-${w}-${theme}.png` })
      }
    })
  }
}
