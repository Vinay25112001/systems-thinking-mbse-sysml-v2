# Decision Log

Format: ID · date · decision · decided by · rationale. Only approved decisions appear in "Decided".
Pending **academic** decisions are listed in `FACULTY_DECISION_REGISTER.md` (FD-01 to FD-27). Pending **app** decisions are listed in `OPEN_QUESTIONS.md` (D8–D10, D12).

## Decided

| ID | Date | Decision | By | Rationale |
|---|---|---|---|---|
| A1 | 2026-10-09 | Follow the master prompt's checkpoint order: source audit and curriculum proposal first; no app code before approval | User (master prompt §7) | Stated requirement |
| A2 | 2026-10-09 | Everything stays local: no deployment, no publishing of source material, no paid services | User (master prompt §8) | Stated requirement |
| A3 | 2026-10-09 | **FD-01 decided: ONE integrated 14-week course (Pathway B structure)**, now at **graduate level** (this also settles FD-03, the population) | User (development directive) | User confirmed the project scope |
| A4 | 2026-10-09 | The provisional 14-week outline (Pathway B syllabus §7) is **approved for building the application skeleton only**. Detailed instructional content, grading and technical accuracy remain subject to faculty review | User (development directive) | Development runs in parallel with the academic review gates |
| A5 | 2026-10-09 | Start the local web app in `learning-studio/`: React + TypeScript + Vite + Tailwind + React Flow + Recharts + localStorage + Vitest + Playwright. First milestone: dashboard, Week 1, stakeholder mapping, then stop for user review | User (development directive) | Stated |
| A6 | 2026-10-09 | **Deadline directive:** submission 2026-12-01 with milestones Oct 13 / Oct 23 / Nov 7 / Nov 17 / Nov 25 / Nov 30; the earlier approval gates (A1, A5 "stop for review") are replaced by milestone delivery; reversible local development is authorised without per-step approval | User (deadline directive) | Stated |
| A7 | 2026-10-09 | Course structure: **Weeks 1–7 Systems Thinking, Weeks 8–14 MBSE with SysML v2** (directive §3). Implemented by moving Week 8 (architecture viewpoints, decomposition, interfaces, information) into Part II as its opening week; no week's topics, readings or checkpoints moved | Author, implementing the directive (flagged to the user) | Minimal change that satisfies the stated split and keeps the approved outline |
| A8 | 2026-10-09 | Reference SysML tool: OMG SysML v2 Pilot Implementation release 2026-08 (kernel 0.62.0) installed locally (portable Java 21, no admin) as the course-designated checker for the app and course materials; settles the app side of FD-08 | User directive §4 ("use a validated external/reference SysML tool if practical") | Installed and self-tested; see learning-studio/docs/SYSML_TOOLCHAIN.md |
| A9 | 2026-10-11 | **Tool-first redesign of all 14 weeks ("AeroLink Workbench")**: one professional engineering workspace (model browser, diagram / SysML v2 text / trace-matrix views, properties, problems panel, mission brief dock, status bar) and one shared live model; every week rebuilt as missions (try first → worked → guided → own → recall; program reviews in Weeks 4, 7, 10, 13). Validated content is kept; long prose moves to a Reference drawer. App stays static/offline. Week 1 prototype for review by about 2026-10-18 | User (D1, approved proposal https://claude.ai/artifact/PJwErUZRMf9gwfBJEBGF3m; scope + hosting answered 2026-10-11) | The app read as raw document text; research in `_source_cache/research/interactive_platform_research.md` |
| A10 | 2026-10-11 | **Parametric Analysis panel**: students run the eVTOL Sizer's own engine (pinned to ONE commit for the term, imported read-only, no change to the sizer) inside the workbench; results write TPM estimates and VER-003 evidence with provenance; a shared JSON exchange contract (`aerolink-sizing@1`). MBSE Studio ⇄ sizer is an optional **instructor demo** only (its two adapter defects need the MBSE owner's authorisation); MBSE Studio is not a student tool this term | User (D2, D3) | `_source_cache/research/tool_integration_feasibility.md`: MBSE Studio alpha, never installed, SysML 1.7 |
| A11 | 2026-10-11 | Reserve convention for sizing: size with the sizer's 20-minute reserve rule, then **check** AeroLink's 20 % landing-energy reserve (REQ-SYS-003 / TPM-003) on the result; REQ-SYS-003 unchanged | User (D3) | Keeps the reviewed requirement set; the difference is itself a teaching point |
| A12 | 2026-10-11 | Sizer outputs are labelled **"analysis-computed (teaching)"** and shown beside the instructor's FICTIONAL baseline; never presented as real aircraft data | User (D4) | AeroLink values are fictional |
| A13 | 2026-10-11 | Optional real-tool lab: students MAY install Docker to run Eclipse SysON locally (Weeks 9–10, optional, not graded on the tool); the workbench remains the required environment | User (D5) | SysON needs Docker + PostgreSQL; not embeddable offline |
| A14 | 2026-10-11 | Accepted as recommended (D6): register S10 sl.59–64 as a Week 11 extension; register S06 (R84) p.173–176 as a Week 12 reading; MITRE p.286 shown in class as a V&V-reversal exercise only, never cited or assigned; WORKLOAD_ANALYSIS options B+C+E adopted; RB-8.5 (behaviour) at CP4 is formative feedback only and is graded at CP5 (author's interpretation of "everything is good" — confirm the CP4 points renormalisation with faculty) | User (D6, "everything is good") | Register additions go through `_source_cache/verification/readings.py`, never hand-edited |

## Working conventions adopted by the author (reversible, not academic decisions)

| ID | Date | Convention | Rationale |
|---|---|---|---|
| W1 | 2026-10-09 | Citations use the PDF page index (SEBoK: PDF page plus article title) | Printed page numbers restart inside the SEBoK compilation |
| W2 | 2026-10-09 | Source text extracted to `_source_cache/` (local, never distributed) | Enables page-level citation and re-verification |
| W3 | 2026-10-09 | Pages count as read only if opened. Unopened "skimmed" pages are reclassified as not read (S07) | Master prompt §1 honesty requirement |
| W4 | 2026-10-09 | SysML v2 is cited as the "2.1 Beta 2 (Release 2026-07)" text, never as the final standard | That is what the collection contains |

| W6 | 2026-10-09 | Local git repository initialised (no remote, never pushed); D9 settled under A6 | Safety net for parallel workstreams |
| W7 | 2026-10-11 | Weekly graduate tasks are required notebook entries that are always read (RB-16 note); every workspace recorder records an owner and a provenance tag incl. AI-suggested-reviewed (shared `ProvenanceOwnerFields`) | Independent reviews of Weeks 2–4 found graduate tasks that might never be read under RB-16 sampling, and recorders that could not apply the AI tag RB-12.3 requires. Flagged for faculty confirmation (RB-16 workload) |
| W8 | 2026-10-11 | Course-wide AeroLink convention (FICTIONAL): the 25 min hub turnaround = 5 min pad work (rotor stop, safety check, connection) + 20 min charging, boarding overlapping the charge; two pads per turnaround charger, so each charger is busy 20 min per turnaround and serves 48 charges per 16 h day (revised 2026-10-11 to match the Week 4 derivation). Recorded as a reference assumption | The Week 3 review exposed two readings across weeks (20 vs 25 min occupancy); this one keeps the reviewed Week 1 dynamics model and the Week 7 trade study valid, and Week 3 shows 25 min as a sensitivity case |
| W9 | 2026-10-11 | NEED-011 (disruption notice) stays in the reference without a child requirement: it is the reference's one deliberate childless need, found in Week 3 through SCN-005 and used in Week 5 as the trace-audit teaching case. The 20-requirement reference set is unchanged | Adding a REQ-STK and a satisfier would change the requirement counts that Weeks 4–5 teach; the gap is more valuable as an audit finding. Revisit if faculty want a complete reference |
| W5 | 2026-10-09 | Web check (toolchain identification): OMG formally adopted SysML v2.0 in 2025 (Part 1 published Sept 2025); the SysML v2 Pilot Implementation release tag 2026-08 ships the same 1.1/2.1/1.1 Beta 2 documents held in the collection | Recorded in learning-studio/docs/SYSML_TOOLCHAIN.md; informs FD-08 and FD-27; not yet installed |

## Consequences of A3 to resolve in the curriculum documents (open)
- Pathway B was written for upper-division undergraduates with a graduate *extension* track. At graduate level the X readings and extension tasks should become core or expected (re-review needed; FD-19 is now moot in its original form).
- The user's earlier brief said "seven-week ST + seven-week MBSE". The approved outline was Weeks 1–8 ST/SE + Weeks 9–14 MBSE. **Resolved by A7** (1–7 / 8–14). The curriculum documents still label Week 8 as Part I; they are superseded on this point by A7 and the app content, and will be regenerated in the M6 export.
- Pathway A documents stay on file as reference; they are not the build target.

## Pending

- Academic: FD-01 to FD-27 (`FACULTY_DECISION_REGISTER.md`). Phase-0 D0–D7 and D11 are superseded by FD-01, FD-04 to FD-07, FD-10, FD-08, FD-12 and FD-21.
- App: D8, D9, D10, D12 (`OPEN_QUESTIONS.md`).

## Record

| ID | Date | Event |
|---|---|---|
| R1 | 2026-10-09 | Phase-0 2:1 compression proposal **withdrawn** after the academic review (FD-25; `CURRICULUM_COMPARISON.md` §1) |
| R2 | 2026-10-09 | External review round 1: 3 critical, 9 major and 22 minor findings, dispositioned in `ACADEMIC_QUALITY_REVIEW.md` |
