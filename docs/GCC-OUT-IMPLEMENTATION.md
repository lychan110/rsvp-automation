# GCC-OUT Implementation Plan — Parallel Subagent Execution

## Overview

This plan orchestrates the GCC-OUT refactor using parallel subagent execution. Tasks are grouped into phases where dependencies allow parallelization.

**Key principle:** Phase 4 (Tasks 4, 5, 6) runs 3 subagents in parallel — each handling an independent feature branch.

---

## Phase Execution Map

```
Phase 1 (T1) → Phase 2 (T2) → Phase 3 (T3) → Phase 4 (T4+T5+T6 parallel) → Phase 5 (T7) → Phase 6 (T8)
     ↓              ↓             ↓              ↓                         ↓              ↓
   [T1]           [T2]          [T3]        [T4] [T5] [T6]                  [T7]          [T8]
                                                   ↘︎
                                             (all depend on T3)
```

---

## Phase 1: Foundation — Single Agent

**Run sequentially: Task 1 only**

### Task 1: Add Dexie.js Dependency
- **Execution:** Subagent (OpenCode)
- **Files:** `package.json`
- **Steps:**
  1. `npm install dexie`
  2. Commit: `chore: add dexie.js dependency`

---

## Phase 2: Schema Definition — Single Agent

### Task 2: Define Database Schema
- **Execution:** Subagent (OpenCode)
- **Files:** `src/inviteflow/db/index.ts`
- **Steps:**
  1. Create Dexie class with `events`, `invitees`, `syncLog` tables
  2. Define schema with proper indexes
  3. Export `db` instance
  4. Commit: `feat: add dexie database schema`

---

## Phase 3: Storage Layer — Single Agent

### Task 3: Create Storage Service Layer
- **Execution:** Subagent (OpenCode)
- **Files:** `src/inviteflow/api/storage.ts`
- **Steps:**
  1. Implement CRUD: `loadEvents`, `saveEvent`, `deleteEvent`, `loadInvitees`, `logSync`
  2. Run `npx tsc --noEmit` to verify types
  3. Commit: `feat: add storage service layer wrapping dexie`

---

## Phase 4: Parallel Feature Branches — 3 Subagents Simultaneous

**Launch 3 subagents at once. Each gets its own context and works independently.**

### Subagent A — Task 4: SendTab Pre-flight
- **Execution:** Subagent (Claude Code)
- **Files:** `src/inviteflow/tabs/SendTab.tsx`, `src/inviteflow/pages/SendPage.tsx`
- **Requirements:**
  - Test Email input (default: event contact or localStorage)
  - "Send Test Email" button → sends to test address using first invitee's data
  - "Confirm Test Received" checkbox
  - Disable "Send Bulk" until `testSent && testApproved`
  - Local state: `testSent: boolean`, `testApproved: boolean`
- **Commit:** `feat: add pre-flight test step to send tab`

### Subagent B — Task 5: Sync Tab UI
- **Execution:** Subagent (Claude Code)
- **Files:** `src/inviteflow/tabs/SyncTab.tsx`, `src/inviteflow/api/storage.ts` (extend)
- **Requirements:**
  - Import: CSV/JSON file input → parse → diff preview modal → write to Dexie → log
  - Export: "Download CSV" button → generates from invitees table → triggers download → log
  - History: List recent `syncLog` entries
- **Commit:** `feat: implement sync tab (import/export/log)`

### Subagent C — Task 6: Point App State to Dexie
- **Execution:** Subagent (Claude Code)
- **Files:** `src/inviteflow/pages/EventsPage.tsx`, `src/inviteflow/pages/InviteesPage.tsx`, `src/inviteflow/state/AppContext.tsx`
- **Requirements:**
  - Replace `drive.ts`/`sheets.ts` imports with `storage.ts`
  - Remove `hasOAuth` checks, `getToken()` calls
  - Update state: `loadEvents()`, `loadInvitees()`, remove OAuth state
- **Commit:** `refactor: connect app state to dexie storage`

---

## Phase 5: Settings Cleanup — Single Agent

### Task 7: Update Settings Page
- **Execution:** Subagent (OpenCode)
- **Files:** `src/inviteflow/pages/SettingsPage.tsx`
- **Steps:**
  1. Remove "GOOGLE OAUTH" section
  2. Remove "CLIENT ID" section
  3. Ensure "Export all data" / "Import backup" buttons are prominent
  4. Commit: `refactor: clean up settings page, remove oauth`

---

## Phase 6: Cleanup & Verify — Single Agent

### Task 8: Remove Dead Code & Verify Build
- **Execution:** Inline (manual verification)
- **Files:** Delete `auth.ts`, `drive.ts`, `sheets.ts`; verify `gmail.ts` has no OAuth
- **Steps:**
  1. `rm src/inviteflow/api/auth.ts src/inviteflow/api/drive.ts src/inviteflow/api/sheets.ts`
  2. Run `npm run build`
  3. Fix any import errors
  4. Commit: `chore: remove dead gcc oauth api files`

---

## Subagent Launch Commands

### Phase 1-3 (Sequential)

```bash
# Phase 1: Dexie dependency
/task subagent:opencode "Task 1: Install dexie.js dependency in package.json. Run npm install dexie, then commit with message 'chore: add dexie.js dependency'"

# Phase 2: Database schema
/task subagent:opencode "Task 2: Create src/inviteflow/db/index.ts with Dexie class. Define ConveneDB with tables: events (&id, name), invitees (&id, eventId, email, status), syncLog (++id, action, timestamp). Export db instance. Commit 'feat: add dexie database schema'"

# Phase 3: Storage service
/task subagent:opencode "Task 3: Create src/inviteflow/api/storage.ts wrapping Dexie. Implement: loadEvents, saveEvent, deleteEvent, loadInvitees, logSync. Run npx tsc --noEmit to verify. Commit 'feat: add storage service layer wrapping dexie'"
```

### Phase 4 (Parallel — Launch all 3 simultaneously)

```bash
/task subagent:claude-code "Task 4: Update SendTab with pre-flight test step. Add: (1) Test Email input defaulting to event contact or localStorage, (2) 'Send Test Email' button that sends to test address using first invitee's data, (3) 'Confirm Test Received' checkbox, (4) disable 'Send Bulk' until testSent && testApproved. Add local state testSent/testApproved. Use Convene design var(--accent) colors. Commit 'feat: add pre-flight test step to send tab'"

/task subagent:claude-code "Task 5: Create SyncTab UI. Implement: (1) Import: CSV/JSON file input, parse, show diff preview modal (X new, Y updated, Z deleted), write to Dexie, log to syncLog. (2) Export: 'Download CSV' button generates from invitees table, triggers download, logs. (3) History: list recent syncLog entries. Use existing Card/Button components. Commit 'feat: implement sync tab (import/export/log)'"

/task subagent:claude-code "Task 6: Point app state to Dexie storage. Update EventsPage, InviteesPage, AppContext: replace drive.ts/sheets.ts imports with storage.ts (loadEvents, saveEvent, loadInvitees, etc). Remove hasOAuth checks, getToken() calls. Remove setHasOAuth/setToken from state. Commit 'refactor: connect app state to dexie storage'"
```

### Phase 5-6 (Sequential)

```bash
# Phase 5
/task subagent:opencode "Task 7: Clean up SettingsPage. Remove 'GOOGLE OAUTH' and 'CLIENT ID' sections. Ensure 'Export all data' and 'Import backup' buttons are prominent (link to Sync Tab or replicate). Commit 'refactor: clean up settings page, remove oauth'"

# Phase 6
# Manual inline - run these commands directly:
rm src/inviteflow/api/auth.ts src/inviteflow/api/drive.ts src/inviteflow/api/sheets.ts
npm run build
# Fix any import errors, then commit
```

---

## Verification Checklist

After each phase, verify:

| Phase | Check |
|-------|-------|
| 1 | `package.json` contains `"dexie": "^x.x.x"` |
| 2 | `src/inviteflow/db/index.ts` exports `db` instance |
| 3 | `npx tsc --noEmit` passes |
| 4 | SendTab shows test email input + checkbox; bulk disabled until approved |
| 5 | SyncTab has import/export buttons; history displays |
| 6 | EventsPage/InviteesPage load from Dexie, no OAuth checks |
| 7 | Settings page has no OAuth sections |
| 8 | Build passes; no references to auth.ts, drive.ts, sheets.ts |

---

## Rollback Strategy

If any phase fails:
1. Revert the commit for that phase
2. Dependent phases will fail at build time (expected)
3. Re-run only the failed phase after fixing

---

## Total Subagent Count

- **Sequential phases:** 6 subagent launches (Tasks 1, 2, 3, 7 + manual Task 8)
- **Parallel phase:** 3 simultaneous subagents (Tasks 4, 5, 6)
- **Total:** 8 subagent invocations across 6 phases

---

*Ready to execute. Start with Phase 1?*