// Lecture pipeline (DECISION_LOG A20) on the real Week 1 lectures (the fixture is no longer registered): the web slide
// viewer (keyboard navigation, outline, counter, notes toggle, present mode, footer caption and citations), the handout,
// the single-column reader (TOC across both sessions, shared figure, citations to /sources/:id/:pages, slide links), the
// week navigation on the viewer and reader, the figure canvas used for the .pptx PNGs, the dashboard's Week 1 path card,
// axe in light and dark, and the 400 px stacked fallback. Screenshots go to screenshots/lectures/.
import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { WEEK01_SESSION1 } from '../src/content/lectures/week01/session1'
import { WEEK1_SESSION2 } from '../src/content/lectures/week01/session2'
import type { Lecture, LessonBlock } from '../src/content/lectures/types'

const SHOTS = 'screenshots/lectures'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const slidesOf = (l: Lecture) => l.sections.flatMap((s) => s.slides)
const SLIDES = slidesOf(WEEK01_SESSION1)
const N = SLIDES.length
const LESSON = [WEEK01_SESSION1, WEEK1_SESSION2].flatMap((l) => l.studentLesson.map((section) => ({ lecture: l, section })))

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

const counter = (page: Page) => page.getByTestId('slide-counter')
const face = (page: Page) => page.getByTestId('lecture-viewer').getByTestId('slide-face')
const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)

test('viewer: keyboard navigation, outline, counter, footer caption and citations, address bar, week navigation', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/1/lecture/1')
  await expect(page.getByTestId('fixture-banner')).toHaveCount(0)
  await expect(page.getByTestId('week-nav-lecture')).toHaveAttribute('aria-current', 'page')
  await expect(counter(page)).toHaveText(`Slide 1 of ${N}`)
  await expect(face(page)).toHaveAttribute('data-slide-id', SLIDES[0].id)

  await page.keyboard.press('ArrowRight')
  await expect(counter(page)).toHaveText(`Slide 2 of ${N}`)
  await expect(face(page)).toHaveAttribute('data-slide-id', SLIDES[1].id)
  await expect(page).toHaveURL(/#\/week\/1\/lecture\/1\/2$/)
  await page.keyboard.press('PageDown')
  await expect(counter(page)).toHaveText(`Slide 3 of ${N}`)
  await page.keyboard.press('End')
  await expect(counter(page)).toHaveText(`Slide ${N} of ${N}`)
  await page.keyboard.press('ArrowRight') // clamps at the last slide
  await expect(counter(page)).toHaveText(`Slide ${N} of ${N}`)
  await page.keyboard.press('ArrowLeft')
  await expect(counter(page)).toHaveText(`Slide ${N - 1} of ${N}`)
  await page.keyboard.press('Home')
  await expect(counter(page)).toHaveText(`Slide 1 of ${N}`)
  await expect(page.getByRole('button', { name: 'Previous slide' })).toBeDisabled()

  // outline: section titles and a slide button per slide
  const outline = page.getByRole('navigation', { name: 'Lecture outline' })
  for (const sec of WEEK01_SESSION1.sections) await expect(outline.getByText(sec.title, { exact: true })).toBeVisible()
  await expect(outline.getByRole('button')).toHaveCount(N)
  const figIdx = SLIDES.findIndex((s) => s.figure && s.sources.length)
  const fig = SLIDES[figIdx]
  await outline.getByRole('button').nth(figIdx).click()
  await expect(counter(page)).toHaveText(`Slide ${figIdx + 1} of ${N}`)
  await expect(outline.getByRole('button').nth(figIdx)).toHaveAttribute('aria-current', 'true')

  // footer: the figure caption and the sources line, linked to the sources route
  await expect(face(page).locator('.lec-foot-caption')).toContainText(fig.figure!.caption.slice(0, 60))
  await expect(face(page).getByRole('img').first()).toHaveAttribute('aria-label', fig.figure!.alt)
  const c = fig.sources[0]
  await expect(face(page).locator('.lec-foot-sources a').first()).toHaveAttribute('href', `#/sources/${c.reading}/${c.pages}`)
  await expect(face(page).locator('.lec-foot-bar')).toContainText(`${figIdx + 1} / ${N}`)
  await page.mouse.move(0, 0)
  await page.screenshot({ path: `${SHOTS}/viewer-figure-1440-light.png` })

  // a deep link to a slide opens on that slide; the Session 2 button opens the other deck
  await page.goto('/#/week/1/lecture/1/4')
  await expect(counter(page)).toHaveText(`Slide 4 of ${N}`)
  await page.screenshot({ path: `${SHOTS}/viewer-1440-light.png` })
  await page.getByRole('link', { name: 'Session 2 slides' }).click()
  await expect(counter(page)).toHaveText(`Slide 1 of ${slidesOf(WEEK1_SESSION2).length}`)
  expect(errors).toEqual([])
})

test('viewer: notes toggle shows the full faculty notes, marked as instructor content; present mode', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const S2 = slidesOf(WEEK1_SESSION2)
  const wi = S2.findIndex((s) => s.notes.workedSolution?.length)
  expect(wi).toBeGreaterThan(0)
  await fresh(page, `/week/1/lecture/2/${wi + 1}`)
  await expect(page.getByTestId('faculty-notes')).toHaveCount(0)
  const toggle = page.getByRole('button', { name: 'Notes' })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  const notes = page.getByTestId('faculty-notes')
  await expect(notes).toBeVisible()
  await expect(notes.getByText('Instructor content')).toBeVisible()
  const s = S2[wi]
  await expect(notes).toContainText(s.purpose)
  await expect(notes).toContainText(s.notes.workedSolution![0].replace(/\*/g, '').slice(0, 50))
  await expect(notes).toContainText(s.notes.timing)
  // the notes follow the slide
  await page.keyboard.press('ArrowLeft')
  await expect(notes).toContainText(S2[wi - 1].notes.timing)
  await page.screenshot({ path: `${SHOTS}/viewer-notes-1440-light.png`, fullPage: true })
  await toggle.click()
  await expect(page.getByTestId('faculty-notes')).toHaveCount(0)

  await page.getByRole('button', { name: 'Present' }).click()
  const present = page.getByTestId('present-mode')
  await expect(present).toBeVisible()
  await expect(present.getByTestId('slide-face')).toHaveAttribute('data-slide-id', S2[wi - 1].id)
  await page.keyboard.press('ArrowRight')
  await expect(present.getByTestId('slide-face')).toHaveAttribute('data-slide-id', S2[wi].id)
  await page.screenshot({ path: `${SHOTS}/present-1440.png` })
  await present.getByRole('button', { name: /Exit/ }).click()
  await expect(present).toHaveCount(0)
})

test('handout: every slide in order; faculty notes only when asked for', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await fresh(page, '/week/1/lecture/1/handout')
  const handout = page.getByTestId('lecture-handout')
  await expect(handout.getByTestId('slide-face')).toHaveCount(N)
  await expect(handout.getByTestId('faculty-notes')).toHaveCount(0)
  await page.getByLabel('Include faculty notes (instructor)').check()
  await expect(handout.getByTestId('faculty-notes')).toHaveCount(N)
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.lec-topbar')).toBeHidden()
  await page.emulateMedia({ media: 'screen' })
})

test('reader: both sessions in one TOC, shared figure and caption, citations to the sources route, slide links', async ({ page }) => {
  const errors = trackErrors(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/week/1/lesson')
  const reader = page.getByTestId('lesson-reader')
  await expect(page.getByTestId('week-nav-lesson')).toHaveAttribute('aria-current', 'page')
  const toc = page.getByRole('navigation', { name: 'Table of contents' })
  await expect(toc.getByRole('link')).toHaveCount(LESSON.length)
  for (const { section } of LESSON) await expect(reader.getByRole('heading', { level: 2, name: section.title, exact: true })).toBeVisible()

  // a figure shared with a slide carries the slide's caption and alt text
  const shared = LESSON.flatMap(({ lecture, section }) => section.blocks.filter((b): b is Extract<LessonBlock, { kind: 'figure'; slide: string }> => b.kind === 'figure' && 'slide' in b).map((b) => slidesOf(lecture).find((s) => s.id === b.slide)!))[0]
  const figure = reader.getByTestId(`lecture-figure-${shared.figure!.id}`).first()
  await expect(figure.locator('figcaption')).toContainText(shared.figure!.caption.slice(0, 60))
  await expect(figure.getByRole('img').first()).toHaveAttribute('aria-label', shared.figure!.alt)

  // TOC link deep-links to a section
  const third = LESSON[2].section
  await toc.getByRole('link', { name: third.title, exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`#/week/1/lesson/${third.id}$`))
  await expect(page.locator(`#lesson-${third.id}`)).toBeInViewport()

  // a slide link opens the viewer on that slide: every figure shared with a slide links to it (and any explicit
  // slide-ref block does too); the Week 1 lesson links through its shared figures
  const ref = LESSON.flatMap(({ lecture, section }) => section.blocks.filter((b): b is Extract<LessonBlock, { slide: string }> => (b.kind === 'slide-ref' || b.kind === 'figure') && 'slide' in b).map((b) => ({ lecture, b })))[0]
  expect(ref, 'the lesson links at least one slide').toBeTruthy()
  const idx = slidesOf(ref.lecture).findIndex((s) => s.id === ref.b.slide)
  await expect(reader.getByTestId('figure-slide-link').first()).toBeVisible()
  await reader.locator(`a[href="#/week/1/lecture/${ref.lecture.session}/${idx + 1}"]`).first().click()
  await expect(counter(page)).toHaveText(`Slide ${idx + 1} of ${slidesOf(ref.lecture).length}`)

  // a citation opens the existing sources route at the cited pages
  await page.goto('/#/week/1/lesson')
  const cite = LESSON.find((x) => x.section.sources.length)!.section.sources[0]
  const link = page.getByTestId('lesson-reader').locator(`a[href="#/sources/${cite.reading}/${cite.pages}"]`).first()
  await expect(link).toBeVisible()
  await link.click()
  await expect(page.getByText(new RegExp(`Read more: ${cite.reading}`))).toBeVisible()
  await page.goto('/#/week/1/lesson')
  await page.screenshot({ path: `${SHOTS}/reader-1440-light.png` })
  expect(errors).toEqual([])
})

test('figure canvas: one registered figure on a clean 1600×900 light canvas, even in dark preference', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 })
  await page.emulateMedia({ colorScheme: 'dark' })
  await fresh(page, '/figure/open-system')
  const canvas = page.getByTestId('figure-canvas')
  await expect(canvas).toHaveAttribute('data-ready', 'true')
  await expect(canvas.locator('svg')).toBeVisible()
  const bg = await canvas.evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(bg).toBe('rgb(255, 255, 255)')
  const fg = await canvas.evaluate((el) => getComputedStyle(el).getPropertyValue('--wb-fg').trim())
  expect(fg).toBe('#18202d')
  await page.goto('/#/figure/not-a-figure')
  await expect(page.getByTestId('figure-canvas')).toHaveAttribute('data-ready', 'false')
})

test('dashboard: the Week 1 path card links to the slides, the lesson and the .pptx', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await fresh(page, '/')
  const card = page.getByTestId('week1-path-card')
  await expect(card).toBeVisible()
  await expect(card.getByRole('link', { name: 'Download Session 1 .pptx' })).toHaveAttribute('href', './lectures/week01-session1.pptx')
  await expect(card.getByRole('link', { name: 'Download Session 2 .pptx' })).toHaveAttribute('href', './lectures/week01-session2.pptx')
  await card.getByRole('link', { name: 'Detailed lesson' }).click()
  await expect(page.getByTestId('lesson-reader')).toBeVisible()
  await page.goto('/#/')
  await page.getByTestId('week1-path-card').getByRole('link', { name: 'Lecture, Session 1' }).click()
  await expect(counter(page)).toHaveText(`Slide 1 of ${N}`)
})

for (const theme of ['light', 'dark'] as const) {
  test(`axe: viewer (every slide of both sessions, notes on), handout and reader — ${theme}`, async ({ page }) => {
    test.setTimeout(300_000)
    await page.setViewportSize({ width: 1440, height: 900 })
    const report: string[] = []
    const scan = async (label: string) => {
      await page.waitForTimeout(120)
      const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
      for (const v of r.violations) report.push(`${label} [${v.impact}] ${v.id}: ${v.nodes.length} node(s) — ${v.nodes[0]?.target.join(' ')}`)
    }
    for (const l of [WEEK01_SESSION1, WEEK1_SESSION2]) {
      const n = slidesOf(l).length
      await fresh(page, `/week/1/lecture/${l.session}`)
      await page.getByLabel('Color theme').selectOption(theme)
      await page.getByRole('button', { name: 'Notes' }).click()
      for (let i = 0; i < n; i++) {
        await scan(`session ${l.session} slide ${i + 1}`)
        await page.keyboard.press('ArrowRight')
      }
    }
    await page.screenshot({ path: `${SHOTS}/viewer-notes-1440-${theme}.png`, fullPage: true })
    await page.goto('/#/week/1/lecture/1/handout')
    await page.waitForLoadState('load')
    await page.getByLabel('Include faculty notes (instructor)').check()
    await expect(page.getByTestId('lecture-handout').getByTestId('faculty-notes')).toHaveCount(N)
    await scan('handout')
    await page.goto('/#/week/1/lesson')
    await page.waitForLoadState('load')
    await expect(page.getByTestId('lesson-reader')).toBeVisible()
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)))
    await scan('reader')
    await page.screenshot({ path: `${SHOTS}/reader-1440-${theme}.png` })
    console.log(`AXE lectures ${theme}:\n${report.join('\n') || 'no violations'}`)
    expect(report).toEqual([])
  })
}

test('400 px: the viewer falls back to a stacked slide + text and the reader fits, with no horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 860 })
  for (const theme of ['light', 'dark'] as const) {
    await fresh(page, '/week/1/lecture/1/3')
    await page.getByLabel('Color theme').selectOption(theme)
    await expect(counter(page)).toHaveText(`Slide 3 of ${N}`)
    const ratio = await face(page).evaluate((el) => el.getBoundingClientRect().height / el.getBoundingClientRect().width)
    expect(ratio, 'stacked, not squeezed into 16:9').toBeGreaterThan(9 / 16 + 0.1)
    expect(await noHorizontalScroll(page), `viewer ${theme}`).toBe(true)
    await page.screenshot({ path: `${SHOTS}/viewer-400-${theme}.png`, fullPage: true })
    await page.goto('/#/week/1/lesson')
    await expect(page.getByTestId('lesson-reader')).toBeVisible()
    expect(await noHorizontalScroll(page), `reader ${theme}`).toBe(true)
    await page.screenshot({ path: `${SHOTS}/reader-400-${theme}.png` })
  }
})
