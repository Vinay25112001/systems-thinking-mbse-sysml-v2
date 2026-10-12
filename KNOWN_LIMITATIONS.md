# Known Limitations

## Source audit
1. **Partial reading of very large documents.** About 52 % of the 4,892 PDF pages were read in full, about 24 % skimmed and about 23 % not opened (`SOURCE_INVENTORY.md` §2). The unread material is mainly OCL mapping rules (S07), formal abstract syntax and semantics (S05, S06), bibliographies, indexes and DoD acquisition chapters. Every topic-relevant knowledge area was read in full.
2. **Parallel readers.** 13 sub-agent readers produced the page-level notes. Seven key claims were re-checked by hand against the source text and all were confirmed, but not every citation in the notes has been independently re-checked. Each citation is re-verified when it is used in a lesson.
3. **Figures.** No system PDF renderer (pdftoppm) is installed. Pages were rendered with PyMuPDF where readers needed visuals (≈ 239 pages). The S08, S11 pp.724–1705 and S13 pp.1–363 readers saw **no figures**.
4. **The sources are beta, partly dated, and contain errors** (`SOURCE_ANALYSIS.md` §1, §5).
5. **No Air Taxi technical sources** exist in the collection, so all Air Taxi numbers are teaching assumptions (D5).

## Learning Studio prototype (milestone 1, 2026-10-09; see TEST_REPORT.md)
- Only Week 1 has a full interactive lesson; Weeks 2–14 show the approved outline (objectives, verified readings, labs) and are labelled "Outline only".
- Lesson content, quiz items and the instructor key are **pending faculty review**; the in-app review log is stored only in the browser.
- The AeroLink dynamics model is an instructor-authored teaching model with FICTIONAL parameters; its archetype behaviours are test-verified, its realism is not.
- The stakeholder editor and causal-loop diagram are course teaching notations, **not SysML v2 diagrams**. No SysML parsing is performed (FD-08).
- The causal-loop diagram uses default node handles, so some links between nodes in the same row bow around (readable; not publication quality).
- The production bundle is about 934 kB (no code-splitting yet); 3 lint warnings remain (dev hot-reload only).
- Tested in Google Chrome only; axe checks found 0 WCAG 2 A/AA violations but automated checks do not prove full accessibility.
- Progress and maps live in localStorage: per browser, per machine, no accounts, no sync.

## Planned app (original notes)
6. The SysML v2 workspace will check a **teaching subset** of the textual notation. It is not a conformant SysML v2 parser or tool and must say so on screen.
7. AI features are scaffolds and checklists, not live AI (pending D8).
8. Browser automation testing depends on whether Playwright browsers can be installed on this managed laptop. If not, the installed Chrome via the extension is used, and the limitation is recorded in `TEST_REPORT.md`.
