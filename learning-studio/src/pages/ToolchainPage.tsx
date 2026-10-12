import { Badge, Card, PageHeader, ReviewControls } from '../components/ui'

// Toolchain facts checked on 2026-10-09 (see learning-studio/docs/SYSML_TOOLCHAIN.md for sources).
export function ToolchainPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="SysML v2: teaching editor vs conformant modelling tool"
        subtitle="This app never invents SysML syntax and never presents SysML text as correct unless a conformant tool has accepted it. This page states exactly what the app does and which external toolchain the course will use for real modelling."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">What this app is</h2>
            <Badge tone="violet">Teaching environment</Badge>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>Interactive lessons, diagram editors (e.g. the stakeholder ecosystem editor) and analysis tools for systems-engineering reasoning.</li>
            <li>Diagrams here are <strong>course teaching notations</strong>, not SysML v2 diagrams, and are not exchanged with SysML tools.</li>
            <li>Course identifiers (STK-, REQ-, PHY- …) are designed to become SysML short names later; a requirement’s short name is its requirement ID in SysML v2 (SysML spec, PDF p.165).</li>
            <li>Validation in the app checks course acceptance rules (counts, completeness, referential integrity), not SysML conformance.</li>
          </ul>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">What a conformant tool does</h2>
            <Badge tone="emerald">Standards-based modelling</Badge>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>Parses SysML v2 textual notation against the language grammar and reports syntax and semantic errors.</li>
            <li>Loads the standard model libraries (quantities and units, analysis, verification, risk metadata).</li>
            <li>Is the only arbiter used in grading for “the model is valid” (rubric RB-8 gate, practical exam).</li>
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold">Identified reference toolchain (pending faculty decision FD-08)</h2>
        <table className="mt-2 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500 dark:text-slate-400 dark:border-slate-800">
              <th className="py-1 pr-2">Candidate</th>
              <th className="py-1 pr-2">What it is</th>
              <th className="py-1">Role for the course</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 align-top dark:border-slate-800">
              <td className="py-1.5 pr-2 font-medium">SysML v2 Pilot Implementation (OMG Systems Modeling Community), release tag 2026-08</td>
              <td className="py-1.5 pr-2">Reference implementation published with the specification documents; Eclipse and Jupyter installers; textual notation with limited graphical visualisation; EPL licence.</td>
              <td className="py-1.5"><strong>Recommended reference parser.</strong> Its 2026-08 release ships the same KerML 1.1 / SysML 2.1 / API 1.1 Beta 2 documents held in the course collection, and the course textual-notation deck (S10) is written for this release.</td>
            </tr>
            <tr className="border-b border-slate-100 align-top dark:border-slate-800">
              <td className="py-1.5 pr-2 font-medium">Eclipse SysON</td>
              <td className="py-1.5 pr-2">Open-source, web-based SysML v2 editor (graphical, textual, form-based); EPL v2.</td>
              <td className="py-1.5">Candidate graphical environment; evaluate conformance against the pilot parser and accessibility before adoption.</td>
            </tr>
            <tr className="align-top">
              <td className="py-1.5 pr-2 font-medium">Syside / SysIDE (Sensmetry)</td>
              <td className="py-1.5 pr-2">SysML v2 textual editing and analysis for Visual Studio Code; community edition is open source.</td>
              <td className="py-1.5">Candidate student editor for textual modelling; evaluate against the pilot parser.</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          None of these tools has been installed or evaluated on this computer: installation requires approval (FD-08). Evaluation protocol: parse the course
          errata snippets and the instructor reference model, record the accepted grammar version, time 10 requirements and 1 scenario, run a screen-reader test,
          check licence and deployment.
        </p>
      </Card>

      <Card>
        <h2 className="font-semibold">Language version</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>OMG formally adopted SysML v2.0 (with KerML 1.0 and the Systems Modeling API 1.0) in 2025. The formal 2.0 documents are not in the course collection (FD-27).</li>
          <li>The collection contains the SysML 2.1 Beta 2 revision (Release 2026-07) and the pilot-implementation tutorial for release 2026-08. These are forward revisions of 2.0, not the formal standard, and their printed examples contain known errors.</li>
          <li>Course policy: teach the grammar accepted by the designated checker; cite the formal standard once obtained; never copy unvalidated examples.</li>
        </ul>
        <ReviewControls id="toolchain-statement" label="SysML toolchain statement" />
      </Card>
    </div>
  )
}
