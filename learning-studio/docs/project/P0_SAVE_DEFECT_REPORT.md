# P0 save defect: My Project read-only after a reload

Date: 2026-10-21. Scope: directive `docs/directives/2026-10-21_MASTER_IMPLEMENTATION_DIRECTIVE_WEEK1.md` §15, audit finding F1 (`docs/audits/current-state-2026-10-21/UI_UX_SCREEN_AUDIT.md`). Status: fixed in the working tree, not committed.

## 1. Reproduction (real browsers)

Script: a standalone Playwright script (kept outside the repo, in a scratch folder) using `learning-studio/node_modules/playwright` 1.64.0, headless, `channel: 'chrome'` and `channel: 'msedge'`. Each run used a fresh persistent context in a temporary folder.

Steps: create a project at `#/project`, open `#/week/1/lab/tool`, add a stakeholder and type a name, reload 5 times, then:

- check the read-only state 1 s and 4 s after each load, and query `navigator.locks.query()`;
- edit, reload, and check persistence;
- open a genuine second tab, try an edit there, take over, then reload;
- close the writing tab and check that the first tab can edit again.

"Dev" means the Vite dev server at :5173, where React StrictMode is active. "Prod" means a `vite build` served by `vite preview --port 4174` (that server was stopped afterwards).

### Before the fix

| Scenario | Chrome dev | Edge dev | Chrome prod | Edge prod |
|---|---|---|---|---|
| Read-only 4 s after a single-tab reload | **5/5** | **5/5** | 0/5 | 0/5 |
| Edit after reload persisted | **no**: the field reverted, the edit was silently dropped, and the banner still said "Saved" | **no** | yes | yes |
| Genuine second tab is read-only | yes | yes | yes | yes |
| "Take over editing" on the lab page | **absent** | **absent** | **absent** | **absent** |
| Refused edit in a read-only tab is visible | **no** (input enabled, value reverts, no message) | **no** | **no** | **no** |

Instrumentation: after every dev reload, `navigator.locks.query()` showed exactly one held lock, `sysml-studio-project:<uid>`, and no pending requests. Its `clientId` was new on every reload, so the previous page had released its lock. The holder was a second store in the reloaded page itself.

### After the fix

| Scenario | Chrome dev | Edge dev | Chrome prod | Edge prod |
|---|---|---|---|---|
| Read-only 1 s / 4 s after a single-tab reload | 0/5 / 0/5 | 0/5 / 0/5 | 0/5 / 0/5 | 0/5 / 0/5 |
| Save status right after an edit, then 1.5 s later | Unsaved changes, then Saved hh:mm | same | same | same |
| Edit after reload persisted | yes | yes | yes | yes |
| Genuine second tab is read-only | yes | yes | yes | yes |
| Refused edit in the read-only tab | visible ("Your last edit was not saved…") and the value is not applied | same | same | same |
| "Take over editing" on the lab page: the second tab becomes the writer, the first turns read-only ("taken over") | yes | yes | yes | yes |
| The second tab reloads after taking over and stays the writer (the first tab is still open) | yes | yes | yes | yes |
| The writing tab closes, the first tab is shown again, becomes the writer, and its edit persists across a reload | yes | yes | yes | yes |
| Page errors | none | none | none | none |

## 2. Root cause

**Primary cause (the 5/5 symptom): an orphan store held the writer lock for the life of the page.**

`src/project/store/ProjectProvider.tsx`, effect at lines 42–55 of the committed version (HEAD `8b9637d`):

```ts
const run = async () => {
  made = choice instanceof ProjectStore ? choice : await choice()   // line 46: async (IndexedDB open)
  await made.init()
  if (alive) setStore(made)
}
void run()
return () => { alive = false; if (made && ...) made.dispose() }      // line 53: `made` is still null here
```

1. In development, React StrictMode runs the effect twice: mount, cleanup, mount.
2. The cleanup runs before `await choice()` resolves, so `made` is `null` and the first store is never disposed.
3. The first store still runs `init()` → `open()` → `lock()` and gets the Web Lock.
4. Its lock callback returns a promise that resolves only through `releaseLock`, which nothing calls, so the lock is held until the page unloads.
5. The store actually used (the second one) asks with `ifAvailable`. `ProjectStore.ts:107-126` (HEAD) retries 4 × 250 ms and then sets `readOnly` permanently, with "open for editing in another tab".

The same leak is possible outside StrictMode: any unmount during start-up, or HMR.

Contributing defects in the store (HEAD `ProjectStore.ts`):

- `lock()` (lines 107–126) gives up after about 1 s and never asks again. A tab that is read-only stays read-only even after the writer closes.
- `dispose()` (lines 380–385) released only a lock that was already granted. A request granted after `dispose()` was held for ever, because the callback did not check `disposed`.
- `apply()` (line 186) refused edits correctly when read-only, but `useTeamRecord.ts:34` discarded the `ApplyOutcome`. With controlled inputs, the typed text simply reverted, with no message.
- Lab banner (`TeamProject.tsx:73`): it had a read-only note but no way out. "Take over editing" existed only in `ProjectApp.tsx:43-53`.
- `SaveState` had no "unsaved changes" or "conflict" state. After an edit, the banner kept showing the previous "Saved hh:mm" until the debounced write started, and a write conflict was reported as a generic error.

Production builds do not run effects twice, so the single-tab reload passed there (0/5 before the fix). The missing takeover on the lab page and the silent refusal reproduced in every configuration.

Note: the e2e check `project.spec.ts:159` (`readonly-banner` count 0 right after a reload) passed for the wrong reason. It ran before the 1 s give-up had expired.

## 3. Fix

The fix is in `src/project/**` only.

**`src/project/store/ProjectProvider.tsx`**
- A store whose effect was already cleaned up is disposed as soon as it exists, both after creation and after `init()`. It never takes the lock.
- Lock lifecycle wiring:
  - `pagehide` → flush, then `releaseEditLock()`;
  - `pageshow` (persisted, back/forward cache) → `resumeEditLock()`;
  - `focus` and `visibilitychange` → visible → `retryEditLock()`.

**`src/project/store/ProjectStore.ts`**
- `lock(uid, mode)` has three modes:
  - `wait` (load, switch, create): the request waits in the browser queue with an `AbortSignal`, with no fixed retry count. A reloaded page gets the lock as soon as the previous page lets go. If the lock is still held after `lockGraceMs` (2 s), another tab is the writer: the request is withdrawn and the state becomes `other-tab`. A read-only tab must not sit in the queue, otherwise a reload of the writing tab would hand editing to it; a unit test covers this.
  - `try` (`ifAvailable`): used when a read-only tab is shown again. It takes the lock only if it is free (the writer closed) and never steals.
  - `steal`: "Take over editing".
- Every request carries a generation number. A superseded or disposed request releases a late grant at once. `dropLock()` aborts pending requests, and `dispose()` uses it.
- New state `lock: 'off' | 'acquiring' | 'held' | 'other-tab' | 'taken-over' | 'released'`. Edits are refused until the lock is `held`. The read-only banner is hidden during the short `acquiring` wait (`showReadOnly()`).
- On a grant after being read-only, the store reloads the stored project before editing. Another tab may have written.
- `refused: { at, reason }` is set whenever `apply()` refuses an edit (read-only or integrity rule). `reportRefused()` lets callers report other refusals; `dismissRefused()` clears it.
- `SaveState.kind` now includes:
  - `pending` ("Unsaved changes"), set on every applied edit;
  - `saving`;
  - `saved`, set only after `adapter.saveProject` resolved, which for IndexedDB means `tx.oncomplete`, and only if no newer edit arrived during the write (otherwise `pending`);
  - `error` ("Not saved…");
  - `conflict` ("Conflict requires review"), for a rev-check failure.
- `takeOver()` first keeps any unwritten local edits as a `pre-restore` version in History ("Unsaved edits from this tab, kept before taking over editing"). It then reloads and steals.

**UI**
- `src/project/pages/EditAccess.tsx` (new) holds the read-only / conflict banner (`data-testid="readonly-banner"`, button "Take over editing") and the refused-edit alert (`data-testid="edit-refused"`). It is used by the My Project shell (`ProjectApp.tsx`) and by the Week 1 lab banner (`adapters/TeamProject.tsx`).
- `src/project/pages/ui.tsx`: `SaveStatus` shows Unsaved changes, Saving…, Saved hh:mm, Not saved, or Conflict requires review.
- `src/project/adapters/useTeamRecord.ts`: a refused export stamp is reported. Refused edits are recorded by the store and shown by `EditAccess`.

Inputs in the lab tool stay enabled, because `workbench/week1/TeamView.tsx` is outside this change's scope. Edits made there are refused with a visible message instead, which the directive allows ("inputs disabled or edits refused with a visible message").

## 4. Tests

New file `src/project/store/lock.test.tsx`, 15 tests. It uses a fake Web Locks manager with one view per page or tab (queue, `ifAvailable`, `steal`, `signal`, and close-page). It also uses fake-indexeddb and @testing-library/react.

- A reload gets the lock when the previous page lets go, without showing read-only.
- A tab is not left read-only for good: a lock freed after the grace period is taken when the tab is shown again, and a read-only tab is not queued.
- Reloading the writing tab keeps it the writer, and a read-only second tab does not take over.
- A store disposed during start-up (the StrictMode double effect) never takes the lock.
- A store disposed after taking the lock releases it at once.
- A store disposed while its request is waiting never holds the lock when it is granted later.
- Repeated lock requests in one store (create, switch) leave one holder and nothing pending.
- A genuine second tab:
  - is read-only with a reason;
  - refuses edits visibly;
  - can take over, after which the other tab turns read-only;
  - after the writer closes, the first tab is shown again, becomes the writer and has the other tab's content.
- Edits made before the lock is granted are refused with a message.
- Page hide releases the lock, and the back/forward cache restore asks for it again.
- On a conflict, unsaved edits are kept as a version before taking over.
- Save status:
  - pending → saving (while the transaction is blocked) → pending (an edit arrived during the write) → saved;
  - a failing write reports `error`;
  - IndexedDB "Saved" is read back by a new connection.
- `ProjectProvider` under `<StrictMode>`: exactly one lock is held, the page is editable after the grace period, and the lock is released on unmount.

Mutation checks were run, each against a temporary edit that was then restored:

| Mutation | Result |
|---|---|
| Old provider effect | the StrictMode test fails with `expected 'other-tab' to be 'held'` (the exact dev symptom) |
| `wait` replaced by `ifAvailable` | 3 tests fail |
| All stale-grant guards removed | the disposed-while-waiting test fails |
| Read-only tab kept queued | the queue test fails |
| "Saved" set without the dirty check | the save-status test fails |

Runs on 2026-10-21:

| Check | Result |
|---|---|
| `npx tsc -b` | clean |
| `npx vitest run src/project` | 6 files, 58 tests passed |
| `npx vitest run src/flow/spelling.test.ts src/workbench/week1` | 3 files, 104 passed |
| `npx vitest run src/week1/week1.test.tsx src/workbench/shell.test.tsx src/flow/flow.test.tsx` | 3 files, 26 passed |
| `npx oxlint src/project` | no new warnings (the remaining warnings are pre-existing) |

The repository e2e suites were not run, because they rewrite tracked screenshots. The e2e test "a second tab opens the project read-only and can take over editing" should still hold: same test ids, same reason texts ("open for editing in another tab", "taken over"). The banner can now take up to 2 s to appear, which is within Playwright's 5 s default.

## 5. Residual risks

- **Grace period.** If a previous page takes longer than 2 s to release its lock (a very slow unload), the reloaded tab shows read-only until it is focused or shown again, or the student presses "Take over editing". It no longer stays stuck.
- **Edits during the start-up wait.** Edits in the first moments after load (`acquiring`, usually a few milliseconds) are refused with a message, not queued.
- **Lab inputs stay enabled while read-only.** Disabling them needs a change in `workbench/week1/TeamView.tsx`, for example a `<fieldset disabled>` driven by `useProjectState().readOnly`. That is left to a follow-up.
- **Single browser only.** The tab lock covers one browser profile. The planned server backend (accounts, membership permissions) must replace it with server-side version checks: optimistic concurrency on `rev`, with the "Conflict requires review" state driven by the server's response. `SaveState` already has a `conflict` kind for that.
- **Coverage.** Persistence across authenticated sessions, export and import, history, and recovery after an interrupted save (§15 bullets) were not part of this defect's scope and are not covered by the new tests beyond the save-status checks.
