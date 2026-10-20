# Systems Thinking and MBSE with SysML v2

A 14-week graduate course (Wright State University) and its interactive learning studio. Each student team develops and
models its own instructor-approved enterprise; **AeroLink Urban Mobility**, a FICTIONAL urban air-taxi operator, is the
instructor's reference case, worked in every week before teams apply the method to their own enterprise. The schedule is
`COURSE_SCHEDULE.md` (faculty direction of 2026-10-18; DECISION_LOG A19).

- **Phase I — Systems Thinking (Weeks 1–7):** from team formation, stakeholders and needs to the team's
  **Systems Thinking Engineering Package**, presented in Week 7.
- **Phase II — MBSE with SysML v2 (Weeks 8–14):** the package imported and modeled week by week, ending in a coherent
  **SysML v2 enterprise model**, presented in Week 14.

## The learning studio

`learning-studio/` is a static React application. Each week runs Overview → Learn → Practice → Check & submit.
Practice happens in the AeroLink Workbench, a hands-on modelling workspace.

```bash
cd learning-studio
npm ci
npm run dev        # http://127.0.0.1:5173
npm test           # unit and content tests
npm run build      # static site in dist/
```

The hosted site is built and deployed by `.github/workflows/pages.yml` on every push to `main`.

## Status

This is a draft prepared for faculty review. Weeks are marked in the app as complete drafts (independently reviewed)
or in development. All AeroLink figures are fictional teaching values.

## Sources

Readings are cited by page from the sources listed in `SOURCE_INVENTORY.md`. The source documents themselves and their
extracted text are not part of this repository.
