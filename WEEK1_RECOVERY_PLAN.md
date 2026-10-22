# Week 1 Recovery Plan

**Purpose.** This plan explains how to get back to a known state at any point during the Week 1 reconstruction (A23). It
complements `WEEK1_IMPLEMENTATION_BASELINE.md`.

**Rule.** Every command below is non-destructive unless it is marked **DESTRUCTIVE**. A destructive command needs the faculty
owner's explicit approval before it runs.

## 1. Recovery points

| Point | What it is | Where |
|---|---|---|
| R0: committed baseline | HEAD before Week 1 work | tag `baseline/2026-10-21-pre-week1` (= `8b9637d`) |
| R1: full working tree as of 2026-10-21 13:02 | Baseline plus every interrupted-stream file (Week 6, Week 5 fixes, emptyAnswer, W9/W11/W12, screenshots, audit docs) | branch `wip/2026-10-19-interrupted-snapshot` (= `f1f6e0e`) |
| R1': same as R1, outside git | Patch and tarball | `C:\Users\w451vxs\Documents\Course_Work\SysML-backups\2026-10-21-pre-week1\` |
| R(n): each milestone | One tag per validated milestone commit | tags `week1/m0`, `week1/m1`, … (created at each milestone close) |
| Public snapshot | Last published state (`5960dd9` = local `8b9637d`) | `Course_Work/SysML-public` → GitHub |

## 2. Procedures

### 2.1 Inspect a recovery point (safe)
```
git log --oneline -1 baseline/2026-10-21-pre-week1
git diff --stat baseline/2026-10-21-pre-week1 wip/2026-10-19-interrupted-snapshot
git show wip/2026-10-19-interrupted-snapshot:learning-studio/src/workbench/emptyAnswer.ts
```

### 2.2 Restore a single file from R1 (safe for that file; it overwrites only the named path)
```
git restore --source=wip/2026-10-19-interrupted-snapshot -- <path>
```

### 2.3 Rebuild the full R1 working tree in a separate folder (safe; the main tree is untouched)
```
git worktree add ../SysML-r1 wip/2026-10-19-interrupted-snapshot
```

### 2.4 Rebuild R1 from the outside backup (if git itself is damaged)
1. Clone or copy the repo and check out `8b9637d`.
2. `git apply --binary tracked-changes.patch`
3. `tar -xf untracked-files.tar`

### 2.5 Return the main tree to R0 (**DESTRUCTIVE** for uncommitted work; needs approval)
Make sure the work is on a branch or in the backup first, then run `git switch master && git reset --hard baseline/2026-10-21-pre-week1`.
Untracked files survive unless `git clean` is run. **Never run `git clean` without approval.**

## 3. Student data (browser) recovery

| Situation | Recovery |
|---|---|
| A project is damaged by a new build | My Project → History → Restore an earlier version (snapshots are kept in IndexedDB). Or import the last exported project file (`sysml-studio-project` v1), which takes a pre-import snapshot automatically |
| A schema migration fails | Migrations must be forward-only, copy-on-write and keep the old document until the new one validates (rule for M2; see `PROJECT_DATA_SCHEMA.md`) |
| Browser data is cleared | Only exported files survive. The app must keep prompting for an export at each milestone until the server backend exists |
| Server backend (M2+) | Nightly and on-demand backup of the database file plus a JSON export per project. Restore is documented in `SECURITY_ARCHITECTURE.md` and `docs/architecture/BACKEND_OPTIONS_AND_RECOMMENDATION.md` |

## 4. Release safety

- The dev server and default build are the **instructor edition**. Only `npm run build:student` output may ever be shown to students.
- Before any student-facing release, run all of the following and record the results in `TEST_REPORT.md`:
  - `tsc -b`
  - `vitest run`
  - `npm run build:student`
  - the leak check
  - the e2e suite, on a clean tree, after `git stash`-free verification in a worktree
