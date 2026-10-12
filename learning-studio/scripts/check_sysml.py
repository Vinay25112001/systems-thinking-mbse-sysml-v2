#!/usr/bin/env python3
"""Validate SysML v2 textual files with the OMG SysML v2 Pilot Implementation.

Every *.sysml file is parsed and validated (syntax, name resolution against the
standard library, and the pilot implementation's own validation rules) by the
reference implementation running in ONE local JVM. Nothing is sent anywhere.

Usage (from learning-studio/):
    python -I scripts/check_sysml.py                 # validate sysml/ (skips _selftest)
    python -I scripts/check_sysml.py path/a.sysml dir/
    python -I scripts/check_sysml.py --selftest      # prove the checker can fail
    npm run content:sysml

Exit codes: 0 all PASS; 1 at least one FAIL/ERROR (or self-test expectation
not met); 2 the reference tool is not installed; 3 the tool ran but did not
produce trustworthy results (library not loaded, missing results, crash).

Installation of the tool: see docs/SYSML_TOOLCHAIN.md, section
"Local reference validator". Python 3 standard library only.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

TOOL_NAME = "OMG SysML v2 Pilot Implementation (SysMLInteractive, Jupyter kernel jar)"
RELEASE = "2026-08"
KERNEL_VERSION = "0.62.0"

SCRIPTS_DIR = Path(__file__).resolve().parent
STUDIO_DIR = SCRIPTS_DIR.parent
PROJECT_DIR = STUDIO_DIR.parent
TOOLS_DIR = Path(os.environ.get("SYSML_TOOLS_DIR", PROJECT_DIR / "tools")).resolve()

JDK_DIR = TOOLS_DIR / "jdk-21"
PILOT_DIR = TOOLS_DIR / f"sysml-pilot-{RELEASE}"
KERNEL_DIR = PILOT_DIR / "kernel" / "sysml"
KERNEL_JAR = KERNEL_DIR / f"jupyter-sysml-kernel-{KERNEL_VERSION}-all.jar"
LIBRARY_DIR = KERNEL_DIR / "sysml.library"
LAUNCHER_SRC = SCRIPTS_DIR / "sysml-launcher" / "SysMLBatchCheck.java"
CLASSES_DIR = TOOLS_DIR / "sysml-launcher-classes"
WORK_DIR = TOOLS_DIR / "_work"

DEFAULT_TARGET = STUDIO_DIR / "sysml"
SELFTEST_DIR = DEFAULT_TARGET / "_selftest"
REPORT_PATH = DEFAULT_TARGET / "validation-report.json"
SELFTEST_REPORT_PATH = SELFTEST_DIR / "selftest-report.json"

DOCS_HINT = "learning-studio/docs/SYSML_TOOLCHAIN.md, section 'Local reference validator'"


def _exe(name: str) -> Path:
    return JDK_DIR / "bin" / (name + (".exe" if os.name == "nt" else ""))


def tool_missing() -> list[str]:
    missing = []
    for label, p in (
        ("portable JDK 21 (java)", _exe("java")),
        ("portable JDK 21 (javac)", _exe("javac")),
        (f"pilot kernel jar {KERNEL_VERSION}", KERNEL_JAR),
        ("SysML standard library", LIBRARY_DIR / "Kernel Libraries"),
        ("launcher source", LAUNCHER_SRC),
    ):
        if not p.exists():
            missing.append(f"  - {label}: expected at {p}")
    return missing


def fail_not_installed(missing: list[str]) -> "NoReturn":  # type: ignore[name-defined]
    print("SysML reference validator is NOT installed; no file was validated.", file=sys.stderr)
    print("\n".join(missing), file=sys.stderr)
    print(
        f"\nInstall it by following {DOCS_HINT}\n"
        f"(portable Temurin JDK 21 zip -> {JDK_DIR}; jupyter-sysml-kernel-{KERNEL_VERSION}.zip from\n"
        f" https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/releases/tag/{RELEASE}\n"
        f" extracted to {PILOT_DIR / 'kernel'}).",
        file=sys.stderr,
    )
    sys.exit(2)


def ensure_launcher_compiled() -> None:
    cls = CLASSES_DIR / "SysMLBatchCheck.class"
    if cls.exists() and cls.stat().st_mtime >= LAUNCHER_SRC.stat().st_mtime:
        return
    CLASSES_DIR.mkdir(parents=True, exist_ok=True)
    cmd = [str(_exe("javac")), "-encoding", "UTF-8", "-cp", str(KERNEL_JAR),
           "-d", str(CLASSES_DIR), str(LAUNCHER_SRC)]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print("Compiling the launcher failed:\n" + proc.stdout + proc.stderr, file=sys.stderr)
        sys.exit(3)


def collect(targets: list[Path], skip_selftest: bool) -> list[Path]:
    files: list[Path] = []
    for t in targets:
        t = t.resolve()
        if t.is_file():
            files.append(t)
        elif t.is_dir():
            for p in sorted(t.rglob("*.sysml")):
                if skip_selftest and SELFTEST_DIR.resolve() in p.resolve().parents and t != SELFTEST_DIR.resolve():
                    continue
                files.append(p.resolve())
        else:
            print(f"No such file or directory: {t}", file=sys.stderr)
            sys.exit(1)
    seen, out = set(), []
    for f in files:
        if f not in seen:
            seen.add(f)
            out.append(f)
    return out


def run_tool(files: list[Path], verbose: bool) -> tuple[dict, dict[str, dict]]:
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    # one list file per run, so concurrent runs (several authors) cannot read each other's file lists
    list_file = WORK_DIR / f"filelist-{os.getpid()}.txt"
    list_file.write_text("\n".join(str(f) for f in files) + "\n", encoding="utf-8")
    cp = os.pathsep.join([str(KERNEL_JAR), str(CLASSES_DIR)])
    cmd = [str(_exe("java")), "-Xss8m", "-cp", cp, "SysMLBatchCheck",
           str(LIBRARY_DIR).replace("\\", "/"), str(list_file)]
    try:
        # cwd is an ignored scratch dir under tools/ so the pilot never touches project files.
        proc = subprocess.run(cmd, cwd=WORK_DIR, capture_output=True, timeout=1800)
    except subprocess.TimeoutExpired:
        list_file.unlink(missing_ok=True)
        print("The SysML tool timed out after 30 minutes.", file=sys.stderr)
        sys.exit(3)
    list_file.unlink(missing_ok=True)
    out = proc.stdout.decode("utf-8", "replace")
    err = proc.stderr.decode("utf-8", "replace")
    if verbose:
        sys.stderr.write(out + err)
    lib: dict | None = None
    results: dict[str, dict] = {}
    done = False
    for line in out.splitlines():
        if line.startswith("@@LIBRARY "):
            lib = json.loads(line[len("@@LIBRARY "):])
        elif line.startswith("@@RESULT "):
            r = json.loads(line[len("@@RESULT "):])
            results[r["file"]] = r
        elif line.strip() == "@@DONE":
            done = True
    problems = []
    if proc.returncode != 0:
        problems.append(f"java exited with code {proc.returncode}")
    if not lib or not lib.get("resolvedProbe"):
        problems.append("standard library did not load (probe names did not resolve)")
    if not done:
        problems.append("tool did not report completion")
    missing = [str(f) for f in files if str(f) not in results]
    if missing:
        problems.append(f"{len(missing)} file(s) received no result")
    if problems:
        print("The SysML tool did not produce trustworthy results; NOTHING is reported as PASS.", file=sys.stderr)
        for p in problems:
            print("  - " + p, file=sys.stderr)
        tail = (out + err).strip().splitlines()[-25:]
        print("--- last tool output ---\n" + "\n".join(tail), file=sys.stderr)
        sys.exit(3)
    return lib, results  # type: ignore[return-value]


def rel(p: Path) -> str:
    try:
        return p.resolve().relative_to(STUDIO_DIR).as_posix()
    except ValueError:
        return p.resolve().as_posix()


def sha256(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def build_report(files: list[Path], lib: dict, results: dict[str, dict], expectations: dict | None) -> dict:
    entries = []
    for f in files:
        r = results[str(f)]
        diags = [
            {k: d.get(k) for k in ("severity", "line", "column", "code", "message")}
            for d in r.get("issues", [])
        ]
        if r.get("exception"):
            diags.append({"severity": "ERROR", "line": None, "column": None,
                          "code": "tool-exception", "message": r["exception"]})
        entry = {"file": rel(f), "sha256": sha256(f), "status": r["status"], "diagnostics": diags}
        if expectations is not None:
            entry["expected"] = expectations[str(f)]
        entries.append(entry)
    counts = {s: sum(1 for e in entries if e["status"] == s) for s in ("PASS", "FAIL", "ERROR")}
    return {
        "tool": {
            "name": TOOL_NAME,
            "release": RELEASE,
            "kernelVersion": KERNEL_VERSION,
            "kernelJar": KERNEL_JAR.name,
            "standardLibrary": "sysml.library bundled in jupyter-sysml-kernel-" + KERNEL_VERSION + ".zip",
        },
        "java": {"version": lib.get("javaVersion"), "vendor": lib.get("javaVendor")},
        "timestamp": _dt.datetime.now(_dt.timezone.utc).replace(microsecond=0).isoformat(),
        "checks": "parse + name resolution against the standard library + pilot implementation validation rules (errors fail; warnings reported)",
        "summary": {"files": len(entries), **counts},
        "files": entries,
    }


def print_results(report: dict) -> None:
    for e in report["files"]:
        label = e["status"]
        if "expected" in e:
            ok = e["status"] == e["expected"]
            label = f"{e['status']:<5} (expected {e['expected']}: {'OK' if ok else 'MISMATCH'})"
        print(f"{label:<5}  {e['file']}")
        for d in e["diagnostics"]:
            loc = f"{d['line']}:{d['column']}" if d["line"] is not None else "-"
            print(f"         {d['severity']:<7} {loc:<8} {d['message']}")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Validate SysML v2 files with the OMG pilot implementation.")
    ap.add_argument("paths", nargs="*", type=Path, help="files or directories (default: learning-studio/sysml/)")
    ap.add_argument("--selftest", action="store_true",
                    help="validate sysml/_selftest and assert valid_* PASS and invalid_* FAIL")
    ap.add_argument("--report", type=Path, default=None, help="override the JSON report path")
    ap.add_argument("--verbose", action="store_true", help="echo raw tool output to stderr")
    args = ap.parse_args(argv)

    missing = tool_missing()
    if missing:
        fail_not_installed(missing)

    expectations = None
    if args.selftest:
        files = collect([SELFTEST_DIR], skip_selftest=False)
        expectations = {}
        for f in files:
            if f.name.startswith("valid_"):
                expectations[str(f)] = "PASS"
            elif f.name.startswith("invalid_"):
                expectations[str(f)] = "FAIL"
            else:
                print(f"Self-test file must start with valid_ or invalid_: {f}", file=sys.stderr)
                return 1
        if not any(v == "PASS" for v in expectations.values()) or not any(v == "FAIL" for v in expectations.values()):
            print("Self-test needs at least one valid_* and one invalid_* file.", file=sys.stderr)
            return 1
        report_path = args.report or SELFTEST_REPORT_PATH
    else:
        files = collect(args.paths or [DEFAULT_TARGET], skip_selftest=True)
        # Teaching listings named invalid_*.sysml are deliberately broken: they are expected to FAIL.
        expectations = {str(f): ("FAIL" if f.name.startswith("invalid_") else "PASS") for f in files}
        # Only a full run (no paths) may write the canonical report the app reads; partial runs write beside it.
        report_path = args.report or (REPORT_PATH if not args.paths else DEFAULT_TARGET / "partial-report.json")

    if not files:
        print("No *.sysml files found; nothing validated.", file=sys.stderr)
        return 1

    ensure_launcher_compiled()
    lib, results = run_tool(files, args.verbose)
    report = build_report(files, lib, results, expectations)
    if args.selftest:
        report["selftest"] = {
            "passed": all(e["status"] == e["expected"] for e in report["files"]),
        }
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    print(f"{TOOL_NAME} release {RELEASE} (kernel {KERNEL_VERSION}), Java {lib.get('javaVersion')}, "
          f"library load {lib.get('loadSeconds')} s")
    print_results(report)
    s = report["summary"]
    print(f"\n{s['files']} file(s): {s['PASS']} PASS, {s['FAIL']} FAIL, {s['ERROR']} ERROR. Report: {rel(report_path)}")

    if args.selftest:
        ok = report["selftest"]["passed"]
        print("SELF-TEST " + ("PASSED: valid files pass and every invalid file fails." if ok
                              else "FAILED: at least one file did not meet its expected outcome."))
        return 0 if ok else 1
    unmet = [e["file"] for e in report["files"] if e["status"] != e["expected"]]
    for f in unmet:
        print(f"UNEXPECTED OUTCOME: {f}", file=sys.stderr)
    return 0 if not unmet else 1


if __name__ == "__main__":
    sys.exit(main())
