# Systems Thinking and MBSE with SysML v2

A 14-week graduate course (Wright State University) and its interactive learning studio, built around one continuous
engineering case: **AeroLink Urban Mobility**, a FICTIONAL urban air-taxi operator.

- **Part I (Weeks 1–7):** systems thinking and systems engineering.
- **Part II (Weeks 8–14):** model-based systems engineering with SysML v2.

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
