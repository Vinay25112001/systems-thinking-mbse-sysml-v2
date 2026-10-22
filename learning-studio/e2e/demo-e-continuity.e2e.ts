// M7 acceptance demonstration E (directive §19, MBSE continuity) in a running app against the real course server
// (SLS_MODE=test, throwaway accounts, temporary data directory; playwright.server.config.ts). Separate browser contexts
// = separate sign-ins (student A and teammate B).
//   1. Open the Week 8 preview → 2. the same enterprise is found → 3. the Week 1 IDs are visible → 4. the mapping
//   opportunities are shown → 5. traceability is available → 6. no AeroLink records are mixed in. Then the Week 8 lab
//   tool reads the same server project (explicit source choice, project name, revision and time), the package per
//   Week 1 ID is saved in the project and survives a reload and a teammate's session, the skeleton matches a file
//   import of the same data, and a later rename in My Project is reported with the mapping kept.
// Named *.e2e.ts so the default Playwright config, which has no course server, never runs it. Screenshots go to the
// audit folder outside the repository (no tracked screenshot is written).
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Browser, type Page } from '@playwright/test'
import { STAKEHOLDERS } from '../src/content/lectures/week01/aerolinkCase'

type Account = { login: string; password: string; role: string }
const SHOTS = process.env.SLS_M7_SHOTS ?? 'C:/Users/w451vxs/Documents/Course_Work/SysML-audit-screenshots-2026-10-21/m7'
mkdirSync(SHOTS, { recursive: true })
const shot = (p: Page, name: string) => p.screenshot({ path: join(SHOTS, `${name}.png`), fullPage: false })
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']

function fixture(): Account[] {
  const out = execFileSync(process.execPath, ['server/run.mjs', 'test-fixture', '--json'], { env: { ...process.env, SLS_MODE: 'test', SLS_DATA_DIR: process.env.SLS_E2E_DIR, SLS_SCRYPT_N: String(2 ** 14) }, encoding: 'utf8' })
  return (JSON.parse(out.trim().split('\n').pop()!) as { accounts: Account[] }).accounts
}
async function signedIn(browser: Browser, a: Account): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true })
  const page = await ctx.newPage()
  page.on('dialog', (d) => void d.accept())
  await page.goto('/?poll=off#/signin')
  await expect(page.getByTestId('signin-form')).toBeVisible({ timeout: 60_000 })
  await page.getByTestId('signin-login').fill(a.login)
  await page.getByTestId('signin-password').fill(a.password)
  const reloaded = page.waitForEvent('load')
  await page.getByTestId('signin-submit').click()
  await reloaded
  await page.waitForURL(a.role === 'instructor' ? /#\/review$/ : /#\/project$/)
  await expect(page.getByTestId('account-indicator')).toBeVisible({ timeout: 60_000 })
  return page
}
const open = (p: Page, hash: string) => p.goto(`/?poll=off&nav=${Date.now()}#${hash}`)
async function put(p: Page, testId: string, value: string) {
  const f = p.getByTestId(testId)
  await f.fill(value)
  await f.press('Tab')
}
async function part(p: Page, id: string) {
  await p.getByTestId(`nav-${id}`).click()
  await expect(p.getByTestId(`part-${id}`)).toBeVisible()
}
async function saved(p: Page) {
  await expect(p.getByTestId('save-status').first()).toContainText('Saved', { timeout: 20_000 })
}
const ENTERPRISE = 'Harbour Bike Share Cooperative'
const aeroNames = STAKEHOLDERS.map((s) => s.name)

test('Demo E: Week 1 → Week 8 continuity on the course server', async ({ browser }) => {
  const [, studentA, studentB] = fixture()
  const a = await signedIn(browser, studentA)
  // the team's Week 1 work in My Project (on the course server)
  await open(a, '/week/1/project')
  await expect(a.getByTestId('canvas-create')).toBeVisible({ timeout: 60_000 })
  await a.getByTestId('create-name').fill(ENTERPRISE)
  await a.getByTestId('create-empty').click()
  await expect(a.getByTestId('week1-canvas')).toBeVisible({ timeout: 30_000 })
  await expect(a.getByTestId('canvas-banner')).toContainText('saved on the course server')
  await part(a, 'enterprise')
  await put(a, 'ent-mission', 'Give residents and visitors a quick, reliable bike for short trips in the harbour district.')
  await a.getByTestId('add-objective').click()
  await put(a, 'objective-MGO-002', 'Keep a bike available within a five-minute walk at peak hours')
  await part(a, 'stakeholders')
  for (const [k, [name, role, interest, why]] of [
    ['Commuters', 'user', '5', 'Their daily trips depend on it'],
    ['City streets office', 'authority', '4', 'Approves every station site'],
  ].entries()) {
    const id = `STK-00${k + 1}`
    await a.getByTestId('add-stakeholder').click()
    await put(a, `stk-${id}-name`, name)
    await a.getByTestId(`stk-${id}-role`).selectOption(role)
    await a.getByTestId(`stk-${id}-interest`).selectOption(interest)
    await put(a, `stk-${id}-interestReason`, why)
  }
  await part(a, 'concerns')
  await a.getByTestId('concern-holder').selectOption('STK-001')
  await a.getByTestId('add-concern').click()
  await put(a, 'con-CON-001-text', 'Commuters find no free bike at the ferry terminal between 7 and 9 a.m.')
  await part(a, 'needs')
  await a.getByTestId('add-need').click()
  await put(a, 'need-NEED-001-name', 'Bikes at the terminal at peak')
  await put(a, 'need-NEED-001-text', 'Commuters need the bike-share service to have a free bike at the ferry terminal during the morning peak.')
  await put(a, 'need-NEED-001-rationale', 'Without a bike at 8 a.m. commuters take the car instead.')
  await put(a, 'need-NEED-001-sources', 'STK-001')
  await put(a, 'need-NEED-001-concerns', 'CON-001')
  await a.getByTestId('need-NEED-001-goal').selectOption('MGO-002')
  await part(a, 'relationships')
  await a.getByTestId('new-rel-from').selectOption('STK-002')
  await a.getByTestId('new-rel-type').selectOption('regulates')
  await a.getByTestId('new-rel-to').selectOption('STK-001')
  await a.getByTestId('add-relationship').click()
  await saved(a)

  // E1. open the Week 8 preview
  await open(a, '/project/model')
  const preview = a.getByTestId('project-model-preview')
  await expect(preview).toBeVisible({ timeout: 60_000 })
  await expect(preview).toContainText('Week 8 preview: how your Week 1 records will be modelled')
  // E2. the same enterprise is found
  await expect(a.getByTestId('preview-enterprise')).toContainText(ENTERPRISE)
  // E3. the Week 1 IDs are visible
  for (const id of ['ENT-001', 'MGO-001', 'MGO-002', 'STK-001', 'STK-002', 'CON-001', 'NEED-001', 'REL-001']) await expect(a.getByTestId(`preview-${id}`)).toBeVisible()
  // E4. the mapping opportunities are shown (course working mapping, proposed, nothing claimed as Mapped yet)
  //     (a record that does not say enough to model shows Invalid or incomplete, with the reason)
  await expect(preview.locator('.pj-mrow [data-status="mapping-proposed"]').first()).toBeVisible()
  await expect(preview.locator('.pj-mrow [data-status="mapped"]')).toHaveCount(0)
  await expect(a.getByTestId('status-legend')).toContainText('Mapping proposed')
  await a.getByTestId('preview-STK-001').getByRole('button', { name: 'STK-001' }).click()
  await expect(a.getByTestId('preview-detail')).toContainText('in package Stakeholders (course mapping, Week 8)')
  await expect(preview).toContainText('Stakeholders')
  await expect(preview).not.toContainText('SysML v2 conformant')
  // E5. traceability is available: NEED-001 with its Week 1 relations and their labels
  await a.getByTestId('preview-NEED-001').getByRole('button', { name: 'NEED-001' }).click()
  const trace = a.getByTestId('preview-trace')
  await expect(trace).toContainText('STK-001 expresses NEED-001')
  await expect(trace).toContainText('CON-001 motivates NEED-001')
  await expect(trace).toContainText('NEED-001 supports MGO-002')
  await expect(trace).toContainText('concern motivates need')
  await shot(a, 'e01-week8-preview-trace-1440')
  // E6. no AeroLink records are mixed in
  const text = (await preview.textContent()) ?? ''
  expect(/aero\s*-?\s*link/i.test(text)).toBe(false)
  for (const n of aeroNames) expect(text).not.toContain(n)
  const axePreview = await new AxeBuilder({ page: a }).withTags(TAGS).include('[data-testid="project-model-preview"]').analyze()
  expect(axePreview.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id} ${v.nodes[0]?.target.join(' ')}`)).toEqual([])

  // the Week 8 lab tool reads the same server project, by the student's explicit choice
  await open(a, '/week/8/lab/tool')
  await expect(a.getByTestId('w8-tool')).toBeVisible({ timeout: 60_000 })
  await expect(a.getByTestId('w8-source-file')).toBeChecked()
  await a.getByTestId('w8-source-project').check()
  const info = a.getByTestId('w8-project-info')
  await expect(info).toContainText(`In use: My Project “${ENTERPRISE}”`)
  await expect(info).toContainText('saved on the course server')
  await expect(info).toContainText(/Read .*; the project was last saved/)
  const rev = Number(await a.getByTestId('w8-project-rev').textContent())
  expect(rev).toBeGreaterThan(0)
  await expect(a.getByTestId('w8-summary')).toContainText(ENTERPRISE)
  await expect(a.getByTestId('w8-preview')).toContainText(`package '${ENTERPRISE} Model'`)
  await expect(a.getByTestId('w8-preview')).toContainText("<'STK-001'>")
  // package per Week 1 ID: an empty answer is refused, a short reason accepted; then every other proposed mapping
  await a.getByTestId('w8-pkg-STK-002').selectOption('Context')
  await a.getByTestId('w8-reason-STK-002').fill('n/a')
  await a.getByTestId('w8-confirm-STK-002').click()
  await expect(a.getByTestId('w8-ids-msg')).toHaveAttribute('role', 'alert')
  await a.getByTestId('w8-reason-STK-002').fill('Regulator')
  await a.getByTestId('w8-confirm-STK-002').click()
  await expect(a.getByTestId('w8-id-STK-002')).toHaveAttribute('data-state', 'mapped')
  await expect(a.getByTestId('w8-status-STK-002')).toContainText('MAP-001')
  // success only once the course server confirmed the save
  await expect(a.getByTestId('w8-ids-msg')).toHaveAttribute('data-state', 'saved', { timeout: 20_000 })
  await expect(a.getByTestId('w8-ids-msg')).toContainText('✓ STK-002: package Context recorded in My Project. Saved on the course server.')
  await a.getByTestId('w8-confirm-all').click()
  await expect(a.getByTestId('w8-id-NEED-001')).toHaveAttribute('data-state', 'mapped')
  await expect(a.getByTestId('w8-save')).toHaveAttribute('data-kind', 'saved', { timeout: 20_000 })
  await expect(a.getByTestId('w8-save')).toContainText('Saved on the course server')
  await shot(a, 'e02-week8-tool-project-source-1440')
  const axeTool = await new AxeBuilder({ page: a }).withTags(TAGS).include('[data-testid="w8-tool"]').analyze()
  expect(axeTool.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id} ${v.nodes[0]?.target.join(' ')}`)).toEqual([])

  // reload: the source choice and the mappings persist (mappings from the server project, never renumbered)
  await a.reload()
  await expect(a.getByTestId('w8-ids')).toBeVisible({ timeout: 60_000 })
  await expect(a.getByTestId('w8-source-project')).toBeChecked()
  await expect(a.getByTestId('w8-id-STK-002')).toHaveAttribute('data-state', 'mapped')
  await expect(a.getByTestId('w8-pkg-STK-002')).toHaveValue('Context')
  await expect(a.getByTestId('w8-status-STK-002')).toContainText('MAP-001')

  // a teammate in a separate session reads the same project and sees the same mappings
  const b = await signedIn(browser, studentB)
  await open(b, '/week/8/lab/tool')
  await expect(b.getByTestId('w8-tool')).toBeVisible({ timeout: 60_000 })
  await b.getByTestId('w8-source-project').check()
  await expect(b.getByTestId('w8-project-info')).toContainText(ENTERPRISE)
  await expect(b.getByTestId('w8-id-STK-002')).toHaveAttribute('data-state', 'mapped', { timeout: 30_000 })
  await expect(b.getByTestId('w8-status-STK-002')).toContainText('MAP-001')

  // the Week 8 preview now shows the team's confirmed mappings as Mapped
  await open(a, '/project/model')
  //     (an item the course audit still finds incomplete keeps that status: a confirmation never hides a gap)
  await expect(a.getByTestId('preview-STK-001')).toBeVisible({ timeout: 60_000 })
  await expect.poll(() => preview.locator('.pj-mrow [data-status="mapped"]').count(), { timeout: 30_000 }).toBeGreaterThan(0)
  await expect(a.getByTestId('status-legend')).toContainText('Mapped')
  // STK-002 carries an audit gap: it stays Invalid or incomplete although the team confirmed it, and the detail shows
  // the team's own package next to the course target
  await expect(a.getByTestId('preview-STK-002').locator('[data-status]')).toHaveAttribute('data-status', 'invalid-or-incomplete')
  await a.getByTestId('preview-STK-002').getByRole('button', { name: 'STK-002' }).click()
  await expect(a.getByTestId('preview-team-package')).toContainText('Your team chose package Context instead: Regulator.')

  // a rename in My Project after the mappings: reported in Week 8, mapping kept, never dropped
  await open(a, '/week/1/project/stakeholders')
  await expect(a.getByTestId('part-stakeholders')).toBeVisible({ timeout: 60_000 })
  await put(a, 'stk-STK-002-name', 'City transport office')
  await saved(a)
  await open(a, '/week/8/lab/tool')
  await expect(a.getByTestId('w8-drift')).toBeVisible({ timeout: 60_000 })
  await expect(a.getByTestId('w8-drift-renamed')).toContainText('“City streets office” is now “City transport office”')
  await expect(a.getByTestId('w8-id-STK-002')).toHaveAttribute('data-state', 'renamed')
  await expect(a.getByTestId('w8-status-STK-002')).toContainText('MAP-001')
  await expect(a.getByTestId('w8-project-changed')).toContainText(`revision ${rev}`)
  await shot(a, 'e03-week8-tool-drift-1440')
  await a.getByTestId('w8-confirm-STK-002').click()
  await expect(a.getByTestId('w8-id-STK-002')).toHaveAttribute('data-state', 'mapped')
  await expect(a.getByTestId('w8-drift')).toHaveCount(0)
  await expect(a.getByTestId('w8-save')).toHaveAttribute('data-kind', 'saved', { timeout: 20_000 })
  await expect(a.getByTestId('w8-save')).toContainText('Saved on the course server')
  await a.getByTestId('w8-project-reread').click()
  await expect(a.getByTestId('w8-project-changed')).toHaveCount(0)
  await expect(a.getByTestId('w8-preview')).toContainText('City transport office')
})
