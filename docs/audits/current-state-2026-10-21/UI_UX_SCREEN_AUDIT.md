# UI/UX screen audit, 2026-10-21

Read-only audit of the dev server at `http://127.0.0.1:5173/`, which serves the **working tree** including uncommitted partials (Week 6 lecture/lab untracked; Week 5, W9, W11 and W12 edits). Each finding gives the screen (route and screenshot), the concrete issue, the impact on students and a possible solution. No design changes are made here.

**Method.** Standalone Playwright 1.64 scripts in the session scratchpad. Chromium headless shell build 1234 was used because the build matched to 1.64 is not installed and installs were out of scope. Every run used fresh browser contexts, so the user's browser profile was not touched. The scripts captured 1440×900 and 390×844 (DPR 2) and ran `@axe-core/playwright` 4.13 (WCAG 2.0/2.1 A and AA tags). Keyboard Tab sequences were recorded on 5 screens. Test projects were created only inside those contexts.

**Screenshots: 72 PNGs** in `C:\Users\w451vxs\Documents\Course_Work\SysML-audit-screenshots-2026-10-21\` (`SS\` below). The prefix `d` means desktop and `m` means mobile.

## 0. Screen inventory and shells

| Shell (chrome) | Code | Routes | Example |
|---|---|---|---|
| A. Classic sidebar shell (header with "Instructor review mode" and Theme, plus a left nav) | `App.tsx` (`App()` render tail, NAV list) | `/`, `/roadmap`, `/week/6`, `/week/7`, `/week/9`–`/week/14`, `/workspace/*`, `/sysml`, `/progress`, `/sources`, `/instructor`, 404 | `SS\d01-dashboard.png`, `SS\d23-week10-not-built.png` |
| B. Flow top bar plus week sub-nav ("Instructor mode", Theme, My Project) | `flow/Chrome.tsx:31-56`, `week1/WeekShell.tsx` | `/welcome`, `/week/{1,2,3,4,5,8}` and their subpages, `/project/**` | `SS\d04-week1-overview.png`, `SS\d30-project-overview.png` |
| C. Lecture top bar (back link, actions, My Project, Theme; **no instructor toggle**) | `lectures/Chrome.tsx:40-62` | `/week/N/lecture/S[/n]`, `/week/N/lesson`, handout | `SS\d06-week1-lecture-s1-slide5.png` |
| D. Workbench shell (toolbar "Practice workbench", rail, three panes, dock, status bar) embedded under B | `workbench/WorkbenchShell.tsx` | `/week/1/examples/practice`, `/week/1/lab/tool` | `SS\d10-week1-practice-canvas.png`, `SS\d17-week1-lab-tool-linked.png` |
| E. Project scope (`pj-*` tokens, own breadcrumb and tabs) under B | `project/pages/ProjectApp.tsx:88-138`, `project/pages/project.css` | `/project/**` | `SS\d33-project-artifacts.png` |

## 1. Findings, ordered by student impact

### F1. A single-tab reload can leave My Project read-only with no way out on the lab page (verify in a real browser)
- **Screen:** `#/week/1/lab/tool` after a page reload; `SS\d62-project-readonly-after-reload.png`, `SS\d56-lab-tool-dark.png`.
- **Issue:** In the audit browser, five successive reloads of one tab each ended with "Read-only in this tab: This project is open for editing in another tab". The state was still read-only 5 s after load, and no other tab was open. The Web Lock retry gives up after 4 × 250 ms and never tries again (`project/store/ProjectStore.ts:114-120`). The lab-tool banner shows the message but offers no "Take over editing"; that button exists only in the My Project shell (`ProjectApp.tsx:43-53`). The form fields stay enabled, and edits are silently dropped because `useTeamRecord` discards the refused `ApplyOutcome` (`project/adapters/useTeamRecord.ts:171`).
- **Student impact:** A student presses F5, types into the Team Record, and nothing appears or saves. This is a high risk of confusion or perceived data loss.
- **Caveat:** The run used the build-1234 headless shell. Reproduce in Chrome or Edge before acting.
- **Possible solution:** Keep retrying the lock, or acquire it with a wait instead of `ifAvailable`. Show "Take over editing" in the lab banner. Disable inputs or surface the refusal when the store is read-only.

### F2. The lab tool is labelled "Practice workbench" and mixes AeroLink rehearsal with the team's own record
- **Screen:** `#/week/1/lab/tool`; `SS\d17-week1-lab-tool-linked.png`, `SS\d18-week1-lab-tool-after-edit.png`.
- **Issue:** The toolbar brand reads "Practice workbench" on the graded lab tool. The model browser lists "Team Record (your enterprise)" next to "AeroLink stakeholders (rehearsal)", "AeroLink needs (rehearsal)" and "Boundary candidates (rehearsal)". The status bar says "Saved in this browser", while the banner says "Saved 09:59 AM" to My Project: two save indicators with two meanings.
- **Student impact:** This blurs the practice/project separation the course depends on. Students may not know which surface is graded or where their work is stored.
- **Possible solution:** Use a distinct brand and colour for project mode, hide or collapse the AeroLink groups when the Team view is open, and drive the workbench status bar from the project save state when linked.

### F3. Four different chromes, with inconsistent controls and names
- **Screens:** `SS\d01-dashboard.png` (shell A), `SS\d04-week1-overview.png` (B), `SS\d06-week1-lecture-s1-slide5.png` (C), `SS\d10-week1-practice-canvas.png` (D), `SS\d30-project-overview.png` (E).
- **Issue:** Shell A has a full left nav and "Instructor review mode". Shell B has no course nav (only a brand link to the dashboard) and says "Instructor mode". Shell C has no instructor toggle at all. Shell D stacks a second toolbar and a status bar. The brand changes between "Systems Thinking & MBSE with SysML v2 / Learning Studio · local prototype" and "SysML Learning Studio". Weeks 6, 7 and 9–14 drop the student back into shell A (`SS\d24-week6-working-tree.png`), so the layout changes mid-course.
- **Student impact:** Students have no stable way to jump to another week from a week page or lecture. They meet a different header on every page type, which raises the cost of orientation.
- **Possible solution:** Use one top bar component with a course/week switcher across all shells, one name for the instructor toggle, and one brand string.

### F4. Course status is contradictory across pages
- **Screens:** `SS\d01-dashboard.png`, `SS\d24-week6-working-tree.png`.
- **Issue:** The dashboard Phase I list marks Week 1 "In development" but Weeks 2–6 "Available (pending review)". Week 6 opens a classic page badged "Provisional: being rebuilt". The status box says "1 of 14 weeks have a live module and 0 meet every definition-of-done check", while the cards above it present 6 weeks as available. "Course progress: Authored content (0/37 activities) 0%" sits next to "Week 1 progress 0%".
- **Student impact:** Students cannot tell which weeks are real. Faculty-review language ("pending faculty review", "definition-of-done") is visible to students.
- **Possible solution:** Use one status source per week (`content/course.ts` `status`) for every badge, and move authoring status behind instructor mode or out of the student edition.

### F5. Week 1 work reaches the Week 8 preview but not the Week 8 lab tool
- **Screens:** `SS\d39-project-week8-preview.png` and `SS\d41-week8-lab-tool-with-project.png` (same browser, same project).
- **Issue:** My Project's "Week 8 preview" shows the student's STK-001 and generated SysML. The Week 8 lab tool then says "Readiness: not ready — Import your team's Week 1 model-inputs file" and offers only three file pickers (`workbench/week8/Week8LabTool.tsx:42-70`). The preview kicker says "MBSE Studio preview", but nothing connects to MBSE Studio (`project/pages/ModelPreview.tsx:24`).
- **Student impact:** Students must round-trip through a download and upload to continue work the app already holds, and may conclude their project "did not carry over".
- **Possible solution:** Add a "Use My Project" source in the Week 8 tool (`project/adapters/week8.ts:16` `sourceFromProject` exists). Rename the kicker or explain what "MBSE Studio" means.

### F6. Placeholder guidance looks like entered data on the project overview
- **Screen:** `#/project`; `SS\d30-project-overview.png`, `SS\d16-project-overview-new.png`.
- **Issue:** Empty fields render instructional sentences in the same weight and colour as values, for example "Mission (MGO-001): one sentence, a purpose rather than a product…", "Problem statement: One sentence: the problem or opportunity…" and "Domain: For example health care, logistics…". "Team 99 · 1 member" counts the creator even though roles show "Not assigned".
- **Student impact:** A quick glance suggests these parts are filled in, so progress can be misread.
- **Possible solution:** Give empty states a distinct style (muted italic, "Not written yet" chip) consistent with the "Not started" chips already used in the library cards.

### F7. Progress and approval are self-reported, with no faculty/student separation
- **Screens:** `SS\d30-project-overview.png` ("Proposal (as recorded by the team): not recorded"); the lab tool Part 2 "Instructor's decision" select (`workbench/week1/TeamView.tsx:347-355`); `SS\d51-dashboard-instructor-mode.png`, `SS\d58-project-instructor-mode.png`.
- **Issue:** The student records the instructor's approval themselves. Instructor mode is a checkbox any student can tick. It reveals faculty notes in the slide viewer (`SS\d50-lecture-instructor-mode.png`) but changes nothing in My Project. The student edition removes some instructor UI at build time (`lib/edition.ts`), but the dev build shows the toggle on every page.
- **Student impact:** There is no authoritative approval and no review feedback channel. In the dev build, faculty notes are one click away.
- **Possible solution:** For the course deadline, ship only the student edition to students. Longer term, give the instructor an import-and-review view of exported project files.

### F8. Mobile: chrome takes most of the first screen, and the project tabs are cut off
- **Screens:** `SS\m09-week1-lab-tool.png`, `SS\m08-week1-practice-canvas.png`, `SS\m14-project-overview.png`, `SS\m05-week1-lecture-slide5.png`.
- **Issue:** At 390 px the top bar wraps to three rows, the week nav to two rows, and the workbench toolbar plus progress strip add about 300 px more. On the lab tool, roughly 60% of the first viewport is chrome before any form field. The workbench status bar (monospace, three lines) is fixed at the bottom. Project tabs scroll horizontally with no affordance: "Expo…" is clipped (`project.css:85`). In the lecture viewer, the 25-item slide list follows the slide, which is fine, but Previous/Next/Notes/Present wrap onto two lines. No horizontal page scroll was found on any route (scrollWidth equals viewport width on all 17 mobile captures).
- **Student impact:** The lab tool is hard to use on a phone, and some project sections are hard to discover.
- **Possible solution:** Collapse the top-bar settings into a menu on narrow screens, hide the workbench status bar on mobile, and add an overflow indicator or a select for the project tabs.

### F9. Very long single pages
- **Screens:** `SS\d08-week1-lesson.png` (71,286 px tall at 1440; 99,162 px on mobile, `SS\m06-week1-lesson.png`), `SS\d09-week1-examples.png` (20,501 px), `SS\d27-instructor-review.png` (28,060 px).
- **Issue:** The Week 1 lesson is one continuous reader of about 13,500 words. Section links exist via `/week/1/lesson/:section` (`lectures/route.ts`), but the page reads as one scroll.
- **Student impact:** Students lose their place, and the "1.5 h" reading is hard to split across sessions.
- **Possible solution:** Add a sticky in-page table of contents with a reading-position indicator, and remember the last section per viewer, as the workbench already remembers `wb-ui`.

### F10. Typography: monospace used for prose metadata
- **Screens:** `SS\d04-week1-overview.png` (card subtitles such as "2 sessions · 48 slides · 69 or 70 min…" and the deliverables table header), `SS\d17-week1-lab-tool-linked.png` (breadcrumb, progress text, model browser, status bar), the `SS\d30-project-overview.png` top-bar title.
- **Issue:** The monospace face is applied to sentence-length metadata and table cells, not only to IDs and code.
- **Student impact:** Reading speed drops, and the screens look denser than their content.
- **Possible solution:** Reserve monospace for IDs (STK-001), SysML text and keyboard hints.

### F11. Keyboard: the order is logical but the lab tool has a long Tab path
- **Data:** Recorded sequences (scratchpad `audit-results.json`):
  - Dashboard: brand → instructor toggle → theme → 14 nav links … (Tab 1–18).
  - Week 1 overview: brand → My Project → instructor → theme → 6 week tabs → content.
  - Lab tool: 10 chrome stops, then "Skip to the center view" (11), Run checks, Export, Shortcuts, Lab instructions, Assessment, then 6 rail buttons. Tab 22 still had not reached a form field.
  - My Project create: fields in visual order, then the file input.
  - Every focused element had a visible outline, and no zero-size focus targets were found.
- **Issue:** The page-level skip link ("Skip to content", `ProjectApp.tsx:99`, `App.tsx` skip link) did not appear first after a click-to-reset start, so it needs a manual screen-reader check. On the lab tool, the workbench skip link comes after the whole top chrome.
- **Student impact:** Keyboard users need more than 20 Tabs to start the lab.
- **Possible solution:** Put the workbench skip link first in the document, or make the page-level skip link target the center view on lab routes.

### F12. Automated accessibility checks are clean, but that is not full conformance
- **Data:** axe found **0 violations** on 25 screen states:
  - Light: dashboard, welcome, Week 1 overview, lecture viewer, lesson, examples, practice canvas, lab tool, assessment, project create, Week 8 lab tool, Week 10, project overview, artifacts, history, transfer and model.
  - Dark: project overview, Week 1 overview, lecture, lab tool, project model and dashboard (`SS\d52`–`d59`, after a correct reload; dark is applied via `html.dark`).
- **Issue:** axe covers only a part of WCAG. The practice canvas and lab tool contain dense 11–12 px text (`text-[11px]`/`text-[12px]` in `workbench/week1/TeamView.tsx`) and grey-on-grey panes. These need a manual contrast and zoom (200%/400% reflow) check.
- **Console:** `#/instructor` logs 13 React "two children with the same key" errors (instructor page only).
- **Possible solution:** Run a manual zoom and screen-reader pass on the lab tool, and fix the duplicate keys in `pages/InstructorReview.tsx`.

### F13. Practice onboarding is clear; the hand-off to the project is easy to miss
- **Screens:** `SS\d10-week1-practice-canvas.png`, `SS\d09-week1-examples.png`, `SS\d11-week1-lab.png`.
- **Issue:** A good point first: the practice banner ("Practice: AeroLink (instructor example, fictional). Practice work stays here and is never written into your project.") and "Apply it in My Project" are explicit. However, the Handoff panel (`project/practice/Handoff.tsx`) appears only on Week 1 Examples and Lab, with its content defined only for week 1 (`project/practice/handoffs.ts:262`). On Weeks 2–5 and 8, students have no equivalent.
- **Student impact:** Students who start at Week 2 never see My Project explained.
- **Possible solution:** Extend `HANDOFFS` per week, or show a generic "your project for this week" card on every week overview.

### F14. Project discoverability is good
- **Screens:** every B/C/E page and the classic sidebar (`SS\d04`, `SS\d06`, `SS\d01`).
- **Notes:** The indigo "My Project · <enterprise>" pill is persistent (`project/nav/MyProjectLink.tsx`). The empty state explains local-only storage and export (`SS\d14-project-empty-create.png`). Storage-failure banners are explicit (`SS\d61-project-storage-fail-after-create.png`).
- **Minor issues:** The failure banner shows a doubled period ("The browser refused to save.."), and Export appears three times on the same screen (header, banner, and the save-status error button).
- **Possible solution:** Fix the punctuation, and keep one primary Export in error states.

### F15. Weeks that are not built yet show outline pages in another layout
- **Screens:** `SS\d23-week10-not-built.png`, `SS\d22-week9-mbse-classic.png`, `SS\m13-week10-not-built.png`, `SS\d57-week10-dark.png`.
- **Issue:** These pages are honest ("Provisional: being rebuilt"), but they use shell A with the long sidebar. Reading references are 11 px grey text. "Earlier reviewed draft material" links to archived old-outline weeks, which expose faculty-facing history to students.
- **Student impact:** Students may follow archive links into superseded content.
- **Possible solution:** Badge archive links as "for reference, superseded", or hide them in the student edition.

### F16. Smaller items
- **Lecture viewer** (`SS\d06`, `SS\d07-week1-lecture-present-mode.png`): readable; keyboard hints shown; Present mode uses Fullscreen with an "Exit (Esc)" control. In the 1440×900 viewport the slide fits, but at 1709 px page height the slide list makes the page scroll. Notes in instructor mode render below the slide (`SS\d50`). No issues beyond F3.
- **404** (`SS\d29-not-found.png`): a plain page in shell A; fine.
- **Loading** states are skeletons (`App.tsx` `PageSkeleton`/`WorkbenchSkeleton`), and My Project shows "Opening your project…" (`ProjectApp.tsx:142-148`). Good.
- **Feedback:** My Project artifact pages state "A pass says the course checks pass, not that the engineering is right" (`SS\d35-project-artifact-stk001.png`). This is clear and consistent with the Week 8 checker disclaimer.

## 2. Screenshot index

- **Desktop 1440, light:** d01–d29 (course and week screens), d07 present mode, d14–d18 (create and link), d30–d41 (project pages, Week 2/8 tools with a project), d60–d61 (`?storage=memory` / `?storage=fail`), d62 (read-only after reload).
- **Instructor and dark (retaken with reloads):** d50, d51, d58, d52–d57, d59. The first capture of these did not reload after the setting changed, so the retaken files replaced it.
- **Mobile 390:** m01–m17.
