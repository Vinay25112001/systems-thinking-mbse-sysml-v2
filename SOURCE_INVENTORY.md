# Source Inventory

**Collection root:** `Shared Resource Folder\` (13 files, 3 folders), inventoried 2026-10-09.
**Rule:** a page counts as read only if its content was opened. Coverage figures come from the per-source
reader notes in `_source_cache/notes/*.md`. Each notes file has a page-range coverage ledger.
Seven high-impact reader claims were re-checked by hand against the source text and all were confirmed
(SOURCE_ANALYSIS §6).

Status key: **FULL** = text of every page read · **VISUAL** = page rendered and viewed as an image ·
**SKIM** = headings plus sampled text · **NOT** = not opened.

## 1. Files

| ID | File | Type | Pages | Size | SHA-256 (first 16) | Identity / version (as printed) | Authority for teaching |
|---|---|---|---|---|---|---|---|
| S01 | `Syllabus and Deliverables/DraftSyllabus_SystemsThinkingTechLiteracy.docx` | docx | n/a (≈13k chars) | 36 KB | `4994995e1be7af08` | "Foundations of Systems Thinking and Technology Literacy", Course Syllabus Draft v2.0; modified 2026-09-04, rev 74 | **Official** course requirement (draft) |
| S02 | `Syllabus and Deliverables/DraftSyallabus_Model-BasedSystemIntegration.docx` | docx | n/a (≈15k chars) | 35 KB | `c3facab23d543473` | "Model-Based Systems Integration with SysML v2", Draft v2.0; modified 2026-09-04, rev 17 | **Official** (draft) |
| S03 | `Syllabus and Deliverables/Syllabus Notes Phase 2 Air Taxi Deliverables.docx` | docx | n/a (≈7k chars) | 24 KB | `bb6c7a3be83b3f59` | "Air Taxi Enterprise Project Deliverables"; created/modified 2026-07-15, rev 1 | Official working note, **older than S01** (see reconciliation C1–C4) |
| S04 | `Syllabus and Deliverables/Weekly Lab Deliverables.docx` | docx | n/a (≈6.5k chars) | 26 KB | `a91ea1dde481a679` | "Weekly Lab Deliverables, MBSE with SysML v2 and AI, Air Taxi Enterprise Case Study"; 2026-07-17, rev 1 | Official working note, **older than S02** |
| S05 | `SysML/1-Kernel_Modeling_Language.pdf` | PDF | 458 | 1.8 MB | `e8b7f33d9dac1a3f` | OMG KerML **v1.1 Beta 2** (Release 2026-07), Aug 2026, "OMG Document Number: None" | Normative-track **beta** spec; Clause 7 informative, Clauses 8–10 normative |
| S06 | `SysML/2a-OMG_Systems_Modeling_Language.pdf` | PDF | 691 | 3.9 MB | `d73a916885f56430` | OMG SysML **v2.1 Beta 2** (Release 2026-07), Part 1 Language Specification, Aug 2026 | **Primary syntax authority** in the collection; beta, with inline open issues |
| S07 | `SysML/2b-SysML_v1_to_v2_Transformation.pdf` | PDF | 657 | 1.1 MB | `865cc248df339282` | SysML v2.1 Beta 2, Part 2: v1-to-v2 Transformation (Release 2026-07) | Beta, written for tool vendors |
| S08 | `SysML/3-Systems_Modeling_API_and_Services.pdf` | PDF | 107 | 0.8 MB | `56452f5d565adc74` | Systems Modeling API and Services **v1.1 Beta 2** (Release 2026-07) | Beta; Clauses 7–8 and Annex A normative |
| S09 | `SysML/Intro to the SysML v2 Language-Graphical Notation.pdf` | PDF (slides) | 123 | 2.1 MB | `2f3a3d30de93d2e8` | Tutorial deck © Sanford Friedenthal 2021-23, **CC BY 4.0**, dated 2023-03-07 (pre-beta era) | Informative; graphical notation partly **outdated** |
| S10 | `SysML/Intro to the SysML v2 Language-Textual Notation.pdf` | PDF (slides) | 185 | 24 MB | `21f1c28f62aeebc8` | Tutorial deck, Ed Seidewitz / Model Driven Solutions, **Release 2026-08** of the SysML v2 Pilot Implementation, **CC BY 4.0** | Informative; most current and most complete syntax walk-through |
| S11 | `Systems Engineering/Guide_to_the_Systems_Engineering_Body_of_Knowledge_v2.14.pdf` | PDF | 1,705 | 14.7 MB | `251668f0ed4eca5a` | SEBoK **v2.14**, released 18 May 2026 (BKCASE: INCOSE, IEEE SysCouncil, Stevens); body + Glossary (PDF 1421–1705) | Community body of knowledge; **CC BY-NC-SA 3.0**, third-party figures restricted |
| S12 | `Systems Engineering/Systems Engineering Guidebook.pdf` | PDF | 240 | 4.6 MB | `30b2ce87e2a2f46d` | OUSD(R&E) *Systems Engineering Guidebook*, Dec 2021 (cleared 2022, DOPSR 22-S-0595) | DoD informative guidance; public release |
| S13 | `Systems Engineering/se-guide-book-interactive.pdf` | PDF | 726 | 8.4 MB | `0a35de7393009b98` | *The MITRE Systems Engineering Guide*, © 2014 (content 2008–2013); approved for public release | Practitioner guidance; **dated** |

**Total:** 4 docx files plus 9 PDFs = **4,892 PDF pages**, ≈ 10.3 M extracted characters.

## 2. Coverage actually achieved

| ID | Pages | FULL | of which VISUAL | SKIM | NOT | Notes file |
|---|---|---|---|---|---|---|
| S01–S04 | 4 docs | **all text, tables and lists** (read by the lead author) | — (no images in any docx) | 0 | 0 | this file and `CURRICULUM_RECONCILIATION.md` |
| S05 KerML | 458 | 86 (front matter, Cl. 1–7, PDF 99–100, 103–104) | 0 | 36 | 336 (abstract syntax, semantics, library and interchange detail) | `notes/kerml.md` |
| S06 SysML pp.1–345 | 345 | 235 (front matter, Cl. 1–7 complete, textual grammar §8.2.2) | 16 | 110 (graphical grammar, abstract syntax) | 0 | `notes/sysml_spec_A.md` |
| S06 SysML pp.346–691 | 346 | 160 (requirements→metadata semantics, libraries: Risk, MOE/MOP, TradeStudies, Derivation, Quantities/ISQ/SI/Time; **Annex A in full**) | 6 | 186 (abstract syntax 8.3.17–27, semantics 8.4.1–16, Action/State libraries, geometry) | 0 | `notes/sysml_spec_B.md` |
| S07 v1→v2 | 657 | 40 (front matter, overview clauses PDF 31–59, plus PDF 608 viewed) | 1 | ≈130 (all overview tables plus ≈75 mapping snippets, spread across the mapping clauses) | ≈487: 75 headings-only (TOC PDF 11–30, OCL clauses PDF 60–114) plus **≈412 pages of OCL mapping-rule bodies never opened** (the reader's own ledger lists them as "skimmed"; reclassified here because they were not opened) | `notes/v1v2_and_api.md` Part A |
| S08 API | 107 | 107 | 0 (figures not rendered) | 0 | 0 | `notes/v1v2_and_api.md` Part B |
| S09 Graphical deck | 123 | 123 | **123** | 0 | 0 | `notes/intro_graphical.md` |
| S10 Textual deck | 185 | 185 | 40 (every diagram slide and every typo suspect) | 0 | 0 | `notes/intro_textual.md` |
| S11 SEBoK pp.1–450 | 450 | 286 | 11 | 138 | 26 (boards, sponsors, detailed contents) | `notes/sebok_A.md` |
| S11 SEBoK pp.451–723 | 273 | 273 | 16 | 0 | 0 | `notes/sebok_B.md` |
| S11 SEBoK pp.724–1042 | 319 | ≈158 | 0 | ≈108 | 53 (bibliography pages) | `notes/sebok_C.md` |
| S11 SEBoK pp.1043–1705 | 663 | 168 | 0 | 279 (incl. 72 targeted Glossary pages) | 216 (article-source lists, unused glossary/acronym pages) | `notes/sebok_D.md` |
| S12 DoD Guidebook | 240 | 240 | 24 | 0 | 0 | `notes/dod_se_guidebook.md` |
| S13 MITRE pp.1–363 | 363 | 250 | 0 | 110 | 2 (+1 blank) | `notes/mitre_A.md` |
| S13 MITRE pp.364–726 | 363 | 255 | 2 | 98 | 10 (index) | `notes/mitre_B.md` |
| **Total (PDF)** | **4,892** | **≈ 2,566 (≈ 52 %)** | **≈ 239** | **≈ 1,195 (≈ 24 %)** | **≈ 1,130 (≈ 23 %)** + 1 blank | |

What was read was chosen by relevance: every knowledge area that maps to a course topic was read in full.
Read-in-full coverage is complete for the two syllabi and labs, both SysML tutorial decks, the API spec,
the DoD guidebook, and the SysML spec's language-description clause (Cl. 7), grammar and Annex A.
The SEBoK processes part (Part 3c) was also read in full. Large unread or skimmed blocks are tool-builder
material (OCL mapping rules, abstract syntax, formal semantics), bibliographies, indexes, and DoD
acquisition/contracting chapters.

## 3. Extraction method and limitations

- **Text:** PyMuPDF 1.28.2 per-page `get_text()`, written to `_source_cache/<name>.txt` with `=== PAGE N ===` markers. PDF outlines were saved to `*.toc.json`. DOCX files were parsed directly from `word/document.xml`, including table cells and list paragraphs; none contain tracked changes, comments or images.
- **Rendering:** the Read tool's PDF renderer is unavailable on this machine (`pdftoppm` is not installed). Readers that needed visuals rendered pages with PyMuPDF instead. Readers for S08, S11 pp.724–1705 and S13 pp.1–363 viewed **no figures**, so the content of those figures is known only from captions and extracted labels.
- **Known lost content:**
  - S09 pages 10, 44, 87 and 114 are image-only, and code shown as screenshots on pp.43 and 112 is lost from the text layer. These pages were viewed visually.
  - The S11 Part 7 matrix is garbled in extraction.
  - The S13 p.319 requirements flowchart cannot be recovered from text.
  - The S11 additive value model survives only in a figure (p.469, viewed).
  - Formulas in S06 (quantities) were checked visually where they were cited.
- **Encryption:** S13 is AES-encrypted against editing, but text extraction is allowed.
- **Page numbering:** citations use **PDF page index**. Printed-page offsets per source are recorded in each notes file (e.g. S06 printed = PDF − 32; S12 printed = PDF − 8; S13 printed = PDF − 14). S11 is a compilation in which printed page numbers restart per volume, so SEBoK citations give the **PDF page plus the article title**.
- **Not in the collection** although the syllabi name them as potential readings: INCOSE SE Handbook and Guide to Writing Requirements, FAA Advanced Air Mobility material, NASA SE Handbook. Also absent: any eVTOL or vertiport technical data, and the OMG SysML **2.0** formal edition (only the 2.1 Beta 2 revision draft is present).

## 4. Licences relevant to reuse in the app

| Source | Licence as printed | Implication |
|---|---|---|
| S09, S10 | CC BY 4.0 | Examples **may be adapted** with attribution |
| S11 | CC BY-NC-SA 3.0 (Stevens content); third-party figures "used with permission" | Text may be quoted or adapted non-commercially with share-alike; **redraw, never copy** third-party figures |
| S05–S08 | OMG licence: informational use, "no modifications" (S05 p.5) | Cite and paraphrase; do not redistribute modified spec text |
| S12, S13 | US Government / MITRE public release | Quote with citation; adapt concepts |
| S01–S04 | Internal course documents | Local use only; not to be published (master prompt §8) |

The extracted text cache (`_source_cache/`) is a local working copy and must not be distributed or deployed.
