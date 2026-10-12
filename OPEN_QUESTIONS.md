# Open Questions (decisions requiring approval)

> **Update 2026-10-09 (Phase 0b):** the academic decisions D0–D7 and D11 are **superseded** by `FACULTY_DECISION_REGISTER.md` (FD-01 to FD-27); D0, the 2:1 compression, is withdrawn (FD-25). This file now tracks only the **app-development** questions. **Update (development directive, 2026-10-09):** D10 (stack) decided by the user: React + TS + Vite + Tailwind + React Flow + Recharts + Vitest + Playwright. D12 (audience): app built for students with an instructor review mode. D8 (embedded AI): none in milestone 1. **D9 (local git) still unanswered.**

Each item states a recommendation. Nothing marked **[DECISION]** is applied until approved;
approvals are recorded in `DECISION_LOG.md`.

| ID | Question | Why it matters | Recommendation |
|---|---|---|---|
| **D0** | The master prompt proposes 7 weeks of Systems Thinking plus 7 weeks of MBSE (14 weeks). The official design is two 15-week, 3-credit courses. How should the studio relate to them? | Halves contact time; would silently replace official requirements | **Studio week = 2 official weeks.** Every official deliverable, lab, exam and weight is kept. The studio serves as a companion to the 15 + 15 courses (Mode A); a 14-week intensive (Mode B) needs academic approval |
| D1 | Which deliverable weights are authoritative: S01 v2.0 (sum 50 %) or S03 (sum 60 %, labelled 50 %)? | Grade calculations in the dashboard | S01 v2.0 (newer, sums correctly). Reuse S03 only for the *contents* of each deliverable |
| D2 | S03 cites CLO 1–8, but S01 has 5 outcomes. | Outcome tracking | Adopt the draft re-map in `CURRICULUM_RECONCILIATION.md` §6, or supply the original 8-CLO list |
| D3 | 16 labs (S04) vs 15 slots (S02). | Lab schedule | Merge Labs 13 + 14 into S02 Week 13, as S02's title already implies |
| D4 | In which weeks are MBSI Exams 1 and 2? | Schedule | Exam 1 after official Week 6; Exam 2 after Week 12 |
| D5 | The collection has no FAA, NASA, INCOSE or eVTOL sources. May I add publicly available ones (e.g. FAA AAM / powered-lift material, NASA SE Handbook, INCOSE GtWR summary), or should every Air Taxi number stay a labelled assumption? | Engineering realism vs "source-grounded" | Keep labelled assumptions for the Week 1 prototype. Separately, you choose which public sources to add; I won't download anything without approval |
| D6 | Which SysML v2 tool will students use (Pilot Implementation/Jupyter, SysIDE, SysON, commercial)? | The studio teaches a subset and must match what students will type in a real tool | Studio code follows the S06 grammar and S10 release 2026-08. Whatever tool is chosen should parse those examples |
| D7 | Compressed mode: peer-review every lab (S02 process) or milestone labs only? | Workload | Milestone labs only in Mode B; unchanged in Mode A |
| D8 | Embedded AI: the syllabi require AI (Copilot). Should the local app call any AI? | Master prompt §8 forbids paid services without permission. A local Ollama exists on this machine | **No embedded AI in the prototype.** Provide prompt scaffolds, an AI Usage Statement template and AI-output critique checklists. A local-only Ollama integration is optional later and only with approval |
| D9 | The project folder is not a git repository. May I `git init` locally (no remote, no push) for safe resumption? | Continuity and rollback | Yes: local-only repo, with `Shared Resource Folder/` and `_source_cache/` git-ignored |
| D10 | App stack | Build approach | Vite + React 18 + TypeScript (strict). Canonical Air Taxi model as typed JSON validated by a schema. Vitest + Testing Library for unit and interaction tests, axe-core for accessibility, Playwright **if** its browser can be installed locally (otherwise the existing Chrome via the Claude-in-Chrome extension). No backend; runs on `localhost` |
| D11 | Is "AeroLink Urban Mobility" fictional? | Real-company impersonation risk | Treat it as fictional and show a disclaimer in the app |
| D12 | Audience of the app: students, instructor, or both? | Determines whether an instructor/answer-key layer is needed | Both, with a reference model (instructor) separated from team work (student) |
