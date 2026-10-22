# Week 7 pending register entries (staging file)

Status 2026-10-21: **staging only, not in the register.** The M4b agent owns `_source_cache/verification/readings.py` and
`readings.generated.json` while this was written, so no register entry was added and **no Week 7 slide, note, lesson or
lab text cites anything below**. Week 7 uses only already-registered sources (R06c, R13, R18, R36, R40, R43, R44, R45, R56,
R105). The integrator merges these after M4b lands, through the register pipeline only (append to `readings.py`, run
`python -I verification/verify_readings.py`, then `npm run content:readings`; update the count in `content.test.ts`). Never
hand-edit `readings.generated.json`.

Page numbers are PDF pages of the extracted text (`=== PAGE n ===` markers), the register's unit.

## P7-1 — DoD SE Guidebook, 3.3 System Functional Review (pp.73–74)

| Field | Value |
|---|---|
| Proposed ID | next free R number after M4b (suggested R110) |
| Source | S12, `_source_cache/Systems_Engineering_Guidebook.txt` |
| Pages | 73–74 (PDF) — printed pages 65–66 |
| Title (heading line) | `3.3 System Functional Review` (heading on p.73; p.73 opens with the end of the SRR section, so the verifier must find the title on p.73, not at its top) |
| Level | E (extension) |
| Would support | the outline's S1.11 second column (the SFR as a second professional analogy); not needed by the current slides, which use the SRR only |

Quoted passages (verbatim from the extracted text):

- p.73: “The SFR is held to evaluate whether the functional baseline satisfies the end-user requirements and capability
  needs and whether functional requirements and verification methods support achievement of performance requirements.
  At completion of the SFR, the functional baseline is normally taken under configuration control.”
- p.73: “Assess whether the functional baseline is technically achievable with regard to cost, schedule, and performance.”
- p.74: “The system-level SFR review should not begin until the criteria, identified by the Chief Engineer and documented
  in the SEP, are met and any prior technical reviews are complete and their action items closed.”

## P7-2 — extend R40 (3.2 System Requirements Review) from p.72 to p.73

| Field | Value |
|---|---|
| Change | R40 last page 72 → 73 |
| Source | S12, `_source_cache/Systems_Engineering_Guidebook.txt` |
| Pages | 73 (PDF) — printed page 65, “Outputs and Products” of the SRR section |
| Would support | the review's completion decision belonging to the chair (Session 1, roles slide; currently taught without citation as a course convention) |

Quoted passage (p.73): “The Technical Review Chair determines when the review is complete. Once the products have been
reviewed and approved in SRR, they provide a sound technical basis for proceeding with the system’s functional definition
and preliminary design.”

## Not proposed

- ISO/IEC/IEEE 24748-8 (technical reviews) and IEEE 15288.2 (technical reviews on defense programs) are cited by R06c p.386
  and R40 p.70 but are not held in `_source_cache/`; they cannot be registered.
- No held source covers briefing technique or argument structure beyond SEBoK R18 p.473, DoD R43 pp.109–110, MITRE R56
  p.387 and R105 p.531; the six-link argument skeleton stays a labeled course convention.
