# Lecture pipeline: authoring guide

Governing decision: DECISION_LOG A20 (professor-led, lecture-first course). Plan: `COURSE_PRODUCTION_PLAN.md`,
"Single-source pipeline".

One TypeScript object per 75-minute session is the single source for:

| Output | Where | Built by |
|---|---|---|
| Web slide viewer with faculty notes | `#/week/:n/lecture/:session[/:slide]` | `src/lectures/LectureViewer.tsx` |
| Print-friendly handout | `#/week/:n/lecture/:session/handout` | `src/lectures/Handout.tsx` |
| Single-column student reader | `#/week/:n/lesson[/:section]` | `src/lectures/LessonReader.tsx` |
| PowerPoint deck (notes as speaker notes) | `exports/lectures/weekNN-sessionS.pptx` (copy in `public/lectures/`) | `npm run lectures:pptx` |
| Faculty-notes document | `exports/lectures/weekNN-sessionS-notes.md` | `npm run lectures:pptx` |
| Student handout (figures embedded as PNGs) | `exports/lectures/weekNN-lesson.md` | `npm run lectures:pptx` |
| References and credits (closing slide, notes section, reader section) | generated from every citation | `src/content/lectures/references.ts` |

The current entry is a **fixture** (`src/content/lectures/fixture/demo.ts`, `fixture: true`): five slides that prove
the pipeline. Every view and export shows a "Fixture — not course content" banner. Replace it with the Week 1
lecture when that content arrives.

## 1. Files

```
src/content/lectures/
  types.ts        the content model (Lecture, Slide, Block, FacultyNotes, LessonBlock …)
  validate.ts     validateLecture / validateLectures (rules in §3)
  text.ts         inline markup, word counts, slide helpers (shared by web, tests and the export script)
  markdown.ts     faculty-notes Markdown (with the timing plan and references) and student-handout Markdown
  references.ts   the generated reference list (every citation, merged per register entry) and license credits
  index.ts        LECTURES registry, getLecture, lecturesOfWeek, weekLesson
  fixture/demo.ts the pipeline fixture
  weekNN/         (to come) session1.ts, session2.ts
src/components/figures/registry.ts   figure id → React SVG component
src/lectures/                        viewer, handout, reader, figure canvas, route parser, styles
scripts/build-lectures.mjs           the .pptx / Markdown exporter
e2e/lectures.spec.ts + playwright.lectures.config.ts
```

## 2. Content model

```ts
const lecture: Lecture = {
  week: 1, session: 1, title: '…', subtitle: '…',
  bufferMinutes: 6,              // planned slack; slides + buffer ≤ 75 (shown in the notes' timing plan)
  sections: [{ id: 'opening', title: 'Opening', slides: [ /* Slide */ ] }],
  studentLesson: [ /* LessonSection */ ],
}
```

**Slide**: `id`, `title`, optional `subtitle`, `purpose` (instructor-facing; never on the slide face), `minutes`,
`layout`, `body: Block[]`, optional `aside: Block[]` (right column), optional `figure: { id, caption, alt }`,
`sources: Citation[]`, `notes: FacultyNotes`.

**Layouts** and what each requires (the validator enforces it):

| Layout | Requires | Rendered as |
|---|---|---|
| `title` | no figure | title slide (accent bar, week/session kicker) |
| `bullets`, `summary` | a `bullets` block | one column |
| `two-column` | an `aside` | body left, aside right |
| `figure` | a figure | figure fills the content area; body (if any) below |
| `figure-bullets` | a figure and a `bullets` block | figure left (≈58 %), body right |
| `table` | a `table` block | native table (web and .pptx) |
| `definition` | a `definition` block | cited definition panel |
| `equation` | an `equation` block | equation panel with symbol list |
| `worked-example` | a `steps` block and `notes.workedSolution` | equation/steps; the full solution lives in the notes |
| `references` | nothing: no body, aside or figure; may take 0 minutes | the closing **References and credits** slide, generated from every citation the lecture uses (register entries, pages merged) and the license or use statement of each source (`references.ts`); one per lecture, last |

**Blocks** (`Block`):

- `bullets` — `items: (string | { text, sub: string[] })[]`: two levels at most.
- `definition` — `term`, `text`, `source: Citation` (the source's wording; mark paraphrase in the notes).
- `table` — `header: string[]`, `rows: string[][]` (every row as long as the header), optional `caption`. The first
  cell of a row is its row header.
- `equation` — `display` (Unicode text: `N = T ÷ b`), `speech` (spoken form, used as the screen-reader label and the
  .pptx alt text), optional `where: { symbol, meaning }[]`. No math library is used: course equations are short
  algebra, and KaTeX/MathJax would add a heavy dependency to an offline app and still not reach the .pptx.
- `callout` — `tone: 'note' | 'key' | 'caution'`, optional `title`, `text`.
- `steps` — `items: { label, text }[]` (numbered).

Inline markup in any text: `**bold**` and `*emphasis*`. Nothing else is interpreted.

**Faculty notes** (`FacultyNotes`): `teach: string[]` (what to say and do, in order), `why`, `figure` (how to walk
through the figure — required when the slide has one), `workedSolution` (required on worked-example slides),
`examples`, `misconceptions: { claim, correction }[]`, `transition` (into the next slide), `timing` (how the minutes
are spent). They appear in the viewer's Notes panel (marked **Instructor content**), in the handout when "Include
faculty notes" is ticked, as PowerPoint speaker notes, and in `weekNN-sessionS-notes.md`.

**Citations** reuse `Citation` from `src/content/readings.ts`: `{ reading: 'R38', pages: '1637' }`. The reading
must be in the verified register (`readings.generated.json`) and the pages inside its verified range. Slides show the
short form in the footer (`R38 p.1637`); the reader and exports show `formatCitation`. Web citations link to
`#/sources/:id/:pages`.

**Student lesson** (`LessonSection`: `id`, `title`, `blocks`, `sources`). Lesson blocks are any `Block` plus:

- `{ kind: 'para', text }` and `{ kind: 'heading', text }`;
- `{ kind: 'figure', slide: 'slide-id' }` — reuse a slide's figure, caption and alt (preferred: one caption, two
  outputs), or `{ kind: 'figure', figure: { id, caption, alt } }` for a reader-only figure;
- `{ kind: 'slide-ref', slide: 'slide-id', text? }` — a link to that slide in the viewer.

The reader joins the lessons of both sessions of a week, in session order, on one page.

## 3. Validator rules

`validateLecture(lecture)` returns `Issue[]` (`{ code, where, message }`); an empty array means valid.
`validateLectures(all)` adds cross-lecture checks. The unit tests (`src/content/lectures/lectures.test.ts`) require
every registered lecture to validate clean **and** prove each rule can fail on a mutated copy of the fixture.

| Code | Rule |
|---|---|
| `duplicate-id` | section, slide and lesson-section ids are unique within a lecture and across a week's sessions |
| `bad-id` | ids are lower-case letters, digits and hyphens |
| `unknown-figure` | every figure id (slides and lesson) is in `src/components/figures/registry.ts` |
| `figure-text-missing` | every figure has a caption and alt text |
| `unknown-citation` | every citation (slide sources, definition sources, lesson sources) is in the verified register |
| `citation-out-of-range` | cited pages lie inside the register's verified range (`citationInRange`) |
| `minutes-invalid` | each slide has positive minutes (a `references` slide may take 0); `bufferMinutes`, if set, is zero or more |
| `minutes-over` | the slides of one session plus `bufferMinutes` sum to at most 75 minutes |
| `notes-empty` | notes have at least one `teach` item, `why`, `transition` and `timing`; each misconception has both parts |
| `notes-figure-missing` | a slide with a figure explains it in `notes.figure` |
| `notes-solution-missing` | a worked-example slide has `notes.workedSolution` |
| `word-budget` | the slide body (body + aside: bullets, table cells, definitions, equations, callouts, steps; not the title, caption, footer or notes) has at most **60 words** — move detail to the notes or the lesson |
| `layout-mismatch` | the layout's required part is present (table above); a `references` slide carries no body, aside or figure |
| `empty-field` | titles, purposes, definition terms/texts, equation text, lesson paragraphs are not blank; sections are not empty |
| `bullet-depth` | bullets nest two levels at most |
| `table-shape` | every row has as many cells as the header |
| `unknown-slide-ref` / `slide-has-no-figure` | lesson slide references resolve, and a shared figure's slide has one |
| `duplicate-session` | one lecture per (week, session) |

`npm run lectures:pptx` runs the same validator and refuses to export when any issue is found.

## 4. Commands

| Command | What it does |
|---|---|
| `npx vitest run src/content/lectures src/lectures` | validator, Markdown and route tests |
| `npm run lectures:pptx` | validate, render figures, write the decks, notes and handouts (`--week N` for one week) |
| `npx playwright test -c playwright.lectures.config.ts` | viewer/reader e2e and axe (light and dark) on its own dev server (port 5198), stopped afterwards |
| `npm run build` | the app build; `public/lectures/*.pptx` is copied into `dist/lectures/` |

`lectures:pptx` starts its own Vite dev server **inside the script process** on port 5197 (never the 5173 dev server),
loads the lecture source through Vite's SSR loader (so the TypeScript source is read directly), opens
`#/figure/:id` for each figure in local Chrome at 1600×900 in the light theme, clips the screenshot to the drawing,
caches the PNG in `exports/lectures/.figure-cache/`, embeds it, and closes the browser and the server on every exit
path (success, failure, Ctrl-C). Run `npm run lectures:pptx` before `npm run build` so the download link has a file.

The .pptx master: 16:9 (13.33 × 7.5 in), accent bar and title rule, footer with the course name, week and session,
and the slide number; each slide carries its figure caption and a short sources line (`R11 p.552`) above the footer,
and the full entries are on the generated closing **References and credits** slide (two columns of references, then the
license credits SEBoK and the other sources require) and in the speaker notes; fixture decks carry a "FIXTURE" tag.
Two text columns on one slide share one type scale, so two tables side by side use one font size. The faculty-notes
Markdown opens with a timing plan (minutes, running clock, buffer) and ends with the references and credits; the
student handout embeds each figure as `.figure-cache/<id>.png` next to its caption and text alternative. Tables are native PowerPoint tables; figures are PNGs with the slide's alt text; equations use
Cambria Math with the spoken form as alt text; the faculty notes are the speaker notes (one paragraph per line,
headings bold). Text uses Calibri so the deck renders the same on any Office install.

## 5. Adding a lecture

1. Create `src/content/lectures/weekNN/sessionS.ts` exporting a `Lecture`.
2. Add it to `LECTURES` in `src/content/lectures/index.ts` (remove the fixture when Week 1 session 1 arrives).
3. `npx vitest run src/content/lectures` — fix every issue it reports.
4. `npm run lectures:pptx`, open the deck, read the notes Markdown.
5. Add the week's entry point if it is not Week 1: `<LectureEntry week={N} />` (`src/lectures/LectureEntry.tsx`);
   the classic week page shows it automatically for any week with a lecture.

## 6. Adding a figure

1. Draw it as a static React SVG component in `src/components/figures/` using the shared theme classes
   (`lf-svg` on the `<svg>`, `f-shape`, `f-label`, `f-arrow`, `Box`, `Markers` from `Frame.tsx`), with a `viewBox`,
   `role="img"` and `aria-label={alt}`. The classes give both themes for free and keep text contrast.
2. Register it in `src/components/figures/registry.ts`:
   `'my-figure': plain('Default title', MyFigure)` (or a custom `render` for extra props).
3. Check it at `#/figure/my-figure` (the PNG canvas) and on a slide.
4. Only static drawings belong in the registry: an interactive figure (own controls or state that changes what is
   drawn, e.g. `BoundaryLayers`) cannot become one PNG.

Every label in a figure must come from the lesson text or the instructor reference model; a figure adds no claim of
its own.

## 7. Limits (current)

- Week 1 adds pacing tests (`src/content/lectures/week01/timing.test.ts`): 68–70 minutes of content plus a 5–7 minute
  buffer per session, and spoken notes (teach, worked solution, figure walk) at most 130 words per minute per slide.
- Height of text in the .pptx is estimated (no text measurement in Node): very long bullets can overflow their box;
  the 60-word budget keeps this rare, and a column that would overflow is set in smaller type (down to 72 %).
- The faculty notes ship in the instructor build and in the current student edition (`build:student` removes only
  exam banks); gate them before any student release.
- Figures render in the light theme only for the .pptx.
