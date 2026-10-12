# SysML v2 toolchain identification (Priority 4 of the development directive)

**Checked:** 2026-10-09, by web search and the official release page. Nothing has been installed or evaluated locally (FD-08 approval pending).

## Findings

| Item | Finding | Source |
|---|---|---|
| Formal standard | OMG formally adopted SysML v2.0 (with KerML 1.0 and the Systems Modeling API & Services 1.0) in 2025; Part 1 (Language) published September 2025. | Web search results citing omg.org/spec/SYSML and the SysML v2 Release repository (see links below). Not in the course source collection (FD-27). |
| Reference implementation | **SysML v2 Pilot Implementation**, distributed by the OMG Systems Modeling Community through the `Systems-Modeling/SysML-v2-Release` repository: Eclipse and Jupyter installers; textual notation with limited graphical visualisation. | github.com/Systems-Modeling/SysML-v2-Release |
| Latest release (at check) | Tag **2026-08**: pilot implementation with KerML 1.1, SysML 2.1 and Systems Modeling API 1.1 **Beta 2** documents, standard library models (textual and XMI) and notation BNF. Language and API implementations now distributed under the **Eclipse Public License**. | github.com/Systems-Modeling/SysML-v2-Release/releases (release dates as displayed were not reliably extracted; the tag is cited instead) |
| Alignment with the collection | The collection’s S05/S06/S07/S08 are exactly these 1.1/2.1/1.1 Beta 2 documents, and the course textual-notation deck (S10) states “Release: 2026-08”. | SOURCE_INVENTORY.md; S10 slide 1 |
| Other open tools | **Eclipse SysON** (web-based graphical/textual/form editors, EPL v2); **Syside / SysIDE** (Sensmetry; VS Code textual editor; community edition open source). | doc.mbse-syson.org; github.com/eclipse-syson/syson; github.com/sensmetry/sysml-2ls |

## Recommendation (for FD-08)

1. Adopt the **Pilot Implementation release 2026-08** as the course’s **reference parser** (“course-designated checker”): it is the implementation the specification team publishes alongside the documents the course uses.
2. Evaluate one student-facing editor (SysON or Syside) against that parser before choosing it.
3. Run the FD-08 evaluation protocol (parse the errata snippets and the reference model; record grammar version; time 10 requirements and 1 scenario; screen-reader test; licence/deployment check).
4. Obtain the formal SysML 2.0 documents for citation (FD-27); teach the grammar the designated checker accepts.

## Boundary between this app and the toolchain

The learning studio is a **teaching environment**: its diagrams (stakeholder ecosystem, causal loops) are course notations, not SysML v2
diagrams; its validation checks course acceptance rules. Model validity in grading is decided only by the designated checker.

## Links

- https://github.com/Systems-Modeling/SysML-v2-Release
- https://github.com/Systems-Modeling/SysML-v2-Release/releases
- https://www.omg.org/spec/SYSML
- https://www.omg.org/sysml/
- https://doc.mbse-syson.org/syson/v2026.3.0/user-manual/updates.html
- https://github.com/eclipse-syson/syson
- https://github.com/sensmetry/sysml-2ls/blob/main/README.md

## Local reference validator (installed 2026-10-09)

As of 2026-10-09 the reference parser **is** installed locally. This updates the "Nothing has been installed" note at the top of this file. The FD-08 evaluation protocol itself has not been run. The checker is headless and offline: course `.sysml` files are parsed and validated on this machine only and are never uploaded.

### What is installed where

All binaries live under the git-ignored `tools/` directory at the project root, about 464 MB in total. Exact URLs and SHA-256 values are in `tools/sysml-pilot-2026-08/PROVENANCE.txt`.

| Item | Version | Location |
|---|---|---|
| Eclipse Temurin JDK (portable zip: no installer, no PATH change) | 21.0.12.1+1-LTS | `tools/jdk-21/` (329 MB) |
| SysML v2 Pilot Implementation, Jupyter kernel fat jar | release **2026-08**, kernel 0.62.0 | `tools/sysml-pilot-2026-08/kernel/sysml/jupyter-sysml-kernel-0.62.0-all.jar` |
| Standard library bundled in the same release zip (KerML libraries 1.1.0-dev.20260801, SysML libraries 2.1.0-dev.20260801) | 2026-08 | `tools/sysml-pilot-2026-08/kernel/sysml/sysml.library/` |
| Batch launcher (source, committed) | n/a | `learning-studio/scripts/sysml-launcher/SysMLBatchCheck.java` |
| Batch launcher (compiled, ignored) | n/a | `tools/sysml-launcher-classes/`, recompiled automatically when it is missing or older than the source |
| Checker (committed, Python 3 standard library only) | n/a | `learning-studio/scripts/check_sysml.py` |
| JVM working directory (scratch) | n/a | `tools/_work/` |

How it works: `check_sysml.py` starts **one** JVM. The launcher creates `org.omg.sysml.interactive.SysMLInteractive`, the class the Jupyter kernel uses, and loads the standard library once (about 9 s). It confirms the library loaded by resolving `ISQBase::MassValue` and `ScalarValues::Real`. For each file it then parses the text and runs the pilot's Xtext validator (`CheckMode.ALL`).

Each file is validated **in isolation**. Its resource is detached afterwards and never indexed, so one file cannot satisfy another file's references. This was verified: a file that references a package defined in a different file fails.

Any issue with severity ERROR fails the file. Warnings are reported but do not fail it. The Jupyter/conda installer is not used.

### (Re)install commands

Run from the project root in Git Bash. No admin rights are needed.

```bash
mkdir -p tools && cd tools
# 1. JDK 21 (Temurin portable zip). Expected SHA-256: f9d6e191ab098c0d416e7d588a24420a8621cd2f4720dab2459b8b7b2d2d8b4e
curl -fL -o jdk.zip "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jdk_x64_windows_hotspot_21.0.12.1_1.zip"
sha256sum jdk.zip
python -I -c "import zipfile;zipfile.ZipFile('jdk.zip').extractall('_jdkx')" && mv "_jdkx/jdk-21.0.12.1+1" jdk-21 && rmdir _jdkx && rm jdk.zip
./jdk-21/bin/java -version
# 2. SysML v2 Pilot Implementation 2026-08 kernel and standard library. Expected SHA-256: 5a015ed3f2b3d2dae14e9c3fb9602d9e1fef5f9ce33cf396c422329405cc3cb2
mkdir -p sysml-pilot-2026-08 && cd sysml-pilot-2026-08
curl -fL -o k.zip "https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/releases/download/2026-08/jupyter-sysml-kernel-0.62.0.zip"
sha256sum k.zip
python -I -c "import zipfile;zipfile.ZipFile('k.zip').extractall('kernel')" && rm k.zip
```

The launcher compiles automatically on the first run. If a component is missing, the checker lists it, points to this section and exits with code 2. It never reports PASS without running the real tool.

### Validate

Run from `learning-studio/`:

```bash
npm run content:sysml                                    # all *.sysml under sysml/ (skips sysml/_selftest/)
python -I scripts/check_sysml.py path/to/file.sysml dir/ # specific files or directories
npm run content:sysml -- --selftest                      # prove the checker can fail
```

Each file gets a PASS or FAIL line followed by its diagnostics (`severity line:column message`). The JSON report is written to `sysml/validation-report.json`. With `--selftest` it goes to `sysml/_selftest/selftest-report.json` instead.

The report contains:

- `tool`: name, release, kernelVersion, kernelJar, standardLibrary
- `java`: version, vendor
- `timestamp` (UTC) and `checks`
- `summary`: files, PASS, FAIL, ERROR
- `files[]`: `{file, sha256, status, diagnostics[{severity, line, column, code, message}]}`. Self-test entries also carry `expected`.

Exit codes:

| Code | Meaning |
|---|---|
| 0 | Every file passed. |
| 1 | At least one FAIL or ERROR, a self-test mismatch, or no files found. |
| 2 | The tool is not installed. |
| 3 | The tool ran but its results cannot be trusted: the library did not load, a result is missing, it crashed or it timed out. |

### Self-test results observed (2026-10-09)

The syntax in `sysml/_selftest/valid_minimal.sysml` comes from the Release 2026-08 training examples `32. Requirements/Requirement Definitions.sysml`, `Requirement Usages.sysml` and `Requirement Satisfaction.sysml`. The unmodified `Requirement Definitions.sysml` was also validated as a positive control and PASSED.

```
FAIL  (expected FAIL: OK)  sysml/_selftest/invalid_syntax.sysml
         ERROR   4:20     no viable alternative at input '}'
         ERROR   4:34     no viable alternative at input 'Real'
         ERROR   5:2      no viable alternative at input '}'
         ERROR   6:24     no viable alternative at input '='
         ERROR   6:27     mismatched input '<EOF>' expecting '}'
FAIL  (expected FAIL: OK)  sysml/_selftest/invalid_undefined_type.sysml
         ERROR   7:16     Couldn't resolve reference to Type 'Quadcopter'.
         ERROR   7:2      An occurrence, item or part must be typed by occurrence definitions.
FAIL  (expected FAIL: OK)  sysml/_selftest/invalid_wrong_keyword.sysml
         ERROR   3:8      no viable alternative at input 'Drone'
PASS  (expected PASS: OK)  sysml/_selftest/valid_minimal.sysml

4 file(s): 1 PASS, 3 FAIL, 0 ERROR. Report: sysml/_selftest/selftest-report.json
SELF-TEST PASSED: valid files pass and every invalid file fails.
```

Single-change mutations of `valid_minimal.sysml` were also run in a scratch directory:

| Change | Result |
|---|---|
| Misspelled satisfy target | FAIL: "Couldn't resolve reference to Feature" and "Must reference a requirement" |
| Attribute typed by a part def | FAIL: "An attribute must be typed by attribute definitions" |
| Unit typo `2[kgg]` | FAIL: "Couldn't resolve reference to Element 'kgg'" |
| Both the `ISQ` and `SI` imports removed | FAIL: `MassValue`, `SpeedValue` and `kg` are unresolved |
| Only `private import ISQ::*` removed | PASS. This is correct, because the library's `SI` package does `public import ISQ::*`. |

### Limitations

- The checker covers parsing, name resolution against the 2026-08 standard library, and the pilot implementation's built-in validation rules (typing constraints, the required kind of a referenced element, conformance warnings). It does **not** check whether the engineering content is meaningful or correct. It does not evaluate constraints or requirement satisfaction numerically and does not judge modelling quality.
- Warnings, such as "Bound features should have conforming types", do not fail a file. Read them anyway.
- Each file must be self-contained, with its own `import`s. Multi-file models that reference each other are not supported by this checker yet.
- A file that is empty or contains only comments parses and therefore PASSES.
- The tool implements the pilot of the 2.1 / 1.1 **Beta 2** documents, not the formal SysML 2.0 specification. The grammar it accepts may differ in detail from SysML 2.0 (FD-27).
- Loading the library costs about 9 s per run, however many files are checked. Each file then takes a fraction of a second.
- Course content is processed locally only. No network access is needed at validation time.
