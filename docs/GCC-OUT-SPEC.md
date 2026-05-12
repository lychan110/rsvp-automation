# RSVP Automation — GCC-OUT Surgical Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Remove Google Cloud Console (GCC) OAuth dependencies, migrate to a local-first (Dexie) architecture, and enhance the email workflow to require pre-flight testing.

**Architecture:**
-   **Local-first:** Dexie.js (IndexedDB) for storing events and invitees.
-   **Manual Sync:** Two-way sync via CSV/JSON imports/exports with change tracking.
-   **Email Workflow:** "Test First, Approve Later" batch sending.
-   **Retained:** GAS (`gas/Code.gs`) pipeline for collecting responses.
-   **Email Delivery:** Uses existing `gmail.ts` with Gmail API key (non-OAuth). *Alternative: SMTP or transactional service (Resend/SendGrid) can replace if needed.*

**Data Migration:** Existing events/invitees from Google Sheets → export as CSV → import via Sync Tab (Task 5).

**Tech Stack:** React, TypeScript, Dexie.js, Convene Design Language.

---

## Execution Method Legend

-   **🅾️ OpenCode** — File-level changes, bounded features, refactors. **Default.**
-   **🄲 Claude Code** — Complex multi-file work, deep reasoning.
-   **🄸 Inline (manual)** — Surgical edits or verification.

---

## Phase 1: Foundation (Dexie.js Setup)

### Task 1: Add Dexie.js Dependency

**Execution:** 🅾️ OpenCode
**Depends on:** None (foundational)

**Objective:** Install Dexie.js to the project.

**Files:**
-   Modify: `package.json`

**Steps:**

1.  **Install Dependency**
    Run: `npm install dexie`
    Expected: `dexie` added to `dependencies`.

2.  **Commit**
    ```bash
    git add package.json package-lock.json
    git commit -m "chore: add dexie.js dependency"
    ```

### Task 2: Define Database Schema

**Execution:** 🅾️ OpenCode
**Depends on:** Task 1

**Objective:** Create the Dexie database layer with `events`, `invitees`, and `sync_log` tables.

**Files:**
-   Create: `src/inviteflow/db/index.ts`

**Steps:**

1.  **Write Schema Code**
    ```typescript
    // src/inviteflow/db/index.ts
    import Dexie from 'dexie';
    import type { AppEvent, Invitee } from '../types';

    export interface SyncLogEntry {
        id?: number;
        action: 'import' | 'export';
        source: string; // e.g., "CSV Upload", "Manual"
        timestamp: string;
        details?: string;
    }

    class ConveneDB extends Dexie {
        events: Dexie.Table<AppEvent, string>;
        invitees: Dexie.Table<Invitee, string>;
        syncLog: Dexie.Table<SyncLogEntry, number>;

        constructor() {
            super("ConveneDB");
            this.version(1).stores({
                events: '&id, name', // id is primary key
                invitees: '&id, eventId, email, status', // status = inviteStatus
                syncLog: '++id, action, timestamp' // auto-incrementing id
            });
            
            // Map class to table (optional but good for methods)
            // this.events.mapToClass(AppEvent); 
        }
    }

    export const db = new ConveneDB();
    ```

2.  **Commit**
    ```bash
    git add src/inviteflow/db/index.ts
    git commit -m "feat: add dexie database schema"
    ```

### Task 3: Create Storage Service Layer

**Execution:** 🅾️ OpenCode
**Depends on:** Task 2

**Objective:** Wrap Dexie calls in a service layer to easily replace `drive.ts` and `sheets.ts` calls.

**Files:**
-   Create: `src/inviteflow/api/storage.ts`
-   Modify: `src/inviteflow/state/AppContext.tsx` (Imports only)

**Steps:**

1.  **Implement CRUD Service**
    ```typescript
    // src/inviteflow/api/storage.ts
    import { db, SyncLogEntry } from '../db';
    import type { AppEvent, Invitee } from '../types';

    // EVENTS
    export const loadEvents = async (): Promise<AppEvent[]> => {
        return db.events.orderBy('date').reverse().toArray();
    };

    export const saveEvent = async (event: AppEvent): Promise<string> => {
        await db.events.put(event);
        return event.id;
    };

    export const deleteEvent = async (id: string): Promise<void> => {
        await db.events.delete(id);
        await db.invitees.where('eventId').equals(id).delete();
    };

    // INVITEES
    export const loadInvitees = async (eventId: string): Promise<Invitee[]> => {
        return db.invitees.where('eventId').equals(eventId).toArray();
    };
    
    // Note: Add specific update functions as needed based on AppContext usage

    // SYNC LOG
    export const logSync = async (entry: Omit<SyncLogEntry, 'id'>): Promise<void> => {
        await db.syncLog.add(entry);
    };
    ```

2.  **Verify TypeScript**
    Run: `npx tsc --noEmit`
    Expected: No errors.

3.  **Commit**
    ```bash
    git add src/inviteflow/api/storage.ts
    git commit -m "feat: add storage service layer wrapping dexie"
    ```

---

## Phase 2: Hero Feature (Test-First Batch Sending)

### Task 4: Update SendTab UI/Logic

**Execution:** 🄲 Claude Code
**Depends on:** Task 3 (storage layer), Task 2 (schema with types)

**Objective:** Implement the "Pre-flight" step and approval gate in `SendTab.tsx`.

**Files:**
-   Modify: `src/inviteflow/tabs/SendTab.tsx`
-   Modify: `src/inviteflow/pages/SendPage.tsx` (if necessary)

**Requirements:**
1.  **Test Recipient Config:** Add an input field for "Test Email Address" (default: use contact email from event setup, or `localStorage`).
2.  **Pre-flight Button:** Add a "Send Test Email" button that sends one email to the test address using the current template and the first invitee's data (or a mock test invitee).
3.  **Approval Gate:** Disable the main "Send Bulk" button until:
    -   The "Send Test Email" button has been clicked.
    -   A "Confirm Test Received" checkbox is checked.
4.  **State:** Add local state `testSent: boolean` and `testApproved: boolean`.

**Steps:**

1.  **Implement Logic**
    -   Locate `sendBulk()` function.
    -   Wrap the send logic with a condition that checks `testApproved`.
    -   Implement `sendTestEmail()`: calls `personalize` with the first invitee and sends via the email API.

2.  **Update UI**
    -   Add a section in the Pre-flight area for Test Email.
    -   Add the checkbox.
    -   Style changes must conform to "Convene" design language (`var(--accent)` colors, existing button styles).

3.  **Commit**
    ```bash
    git add src/inviteflow/tabs/SendTab.tsx
    git commit -m "feat: add pre-flight test step to send tab"
    ```

---

## Phase 3: Sync System (Manual CSV/JSON)

### Task 5: Implement Sync Tab UI

**Execution:** 🄲 Claude Code
**Depends on:** Task 3 (storage layer has import/export helpers)

**Objective:** Create a central "Sync" tab (or page) that handles import/export and displays history.

**Files:**
-   Create/Modify: `src/inviteflow/tabs/SyncTab.tsx`
-   Modify: `src/inviteflow/api/storage.ts` (Add import/export helpers)

**Logic:**
1.  **Import:**
    -   File input accepting `.csv` or `.json`.
    -   Parse CSV (use simple split logic or add a small library if not present, *prefer* native logic if CSV format is known from Sheets).
    -   **Diffing:** On import, show a modal preview: "20 New contacts, 5 Updated, 1 Deleted (or Missing)".
    -   **Apply:** Write to Dexie.
    -   **Log:** Add entry to `syncLog`.

2.  **Export:**
    -   Button: "Download Current List (CSV)".
    -   Trigger: Generates CSV from `invitees` table for active event and triggers download.
    -   **Log:** Add entry to `syncLog`.

3.  **History:**
    -   List `syncLog` entries (Recent actions).

**Steps:**

1.  **Implement Sync Logic**
    -   Add `exportInviteesToCSV` and `importInviteesFromData` functions to `storage.ts`.
    -   Ensure types match `AppEvent` and `Invitee`.

2.  **Build UI**
    -   Use existing `Card` and `Button` components.
    -   Implement File Reader API for uploads.
    -   Simple confirmation dialogs (no complex modal library needed if state management allows).

3.  **Commit**
    ```bash
    git add src/inviteflow/tabs/SyncTab.tsx src/inviteflow/api/storage.ts
    git commit -m "feat: implement sync tab (import/export/log)"
    ```

---

## Phase 4: Cleanup & Integration

### Task 6: Point App State to Dexie

**Execution:** 🄲 Claude Code
**Depends on:** Task 3 (storage service must exist)

**Objective:** Update `EventsPage`, `InviteesPage`, and `AppContext` to use `storage.ts` instead of `drive.ts` and `sheets.ts`.

**Specific State Changes:**
- `events` state → replace `loadFromDrive()` with `loadEvents()`
- `invitees` state → replace `loadFromSheets()` with `loadInvitees()`
- Remove `setHasOAuth`, `setToken` — these are no longer needed
- Add `setTestSent`, `setTestApproved` for Task 4's pre-flight state
- Replace all `drive.ts`/`sheets.ts` calls with `storage.ts` equivalents

**Files:**
-   Modify: `src/inviteflow/pages/EventsPage.tsx`
-   Modify: `src/inviteflow/pages/InviteesPage.tsx`
-   Modify: `src/inviteflow/state/AppContext.tsx` (If it stores events/invitees in memory)

**Steps:**

1.  **Replace Imports**
    -   Replace `import { listAppDataFiles, ... } from '../api/drive'` with `import { loadEvents, saveEvent, ... } from '../api/storage'`.

2.  **Update Logic**
    -   Remove `hasOAuth` checks.
    -   Remove `getToken()` calls.
    -   Directly call the new storage functions.

3.  **Commit**
    ```bash
    git add [modified files]
    git commit -m "refactor: connect app state to dexie storage"
    ```

### Task 7: Update Settings Page

**Execution:** 🅾️ OpenCode
**Depends on:** Task 6 (OAuth code removed from app)

**Objective:** Clean up Settings page to remove OAuth sections and keep local config.

**Files:**
-   Modify: `src/inviteflow/pages/SettingsPage.tsx`

**Steps:**

1.  **Remove Blocks**
    -   Delete "GOOGLE OAUTH" section.
    -   Delete "CLIENT ID" section.

2.  **Enhance Data Section**
    -   Ensure "Export all data" and "Import backup" buttons are prominent.
    -   These buttons should ideally link to the new Sync Tab functionality or replicate it.

3.  **Commit**
    ```bash
    git add src/inviteflow/pages/SettingsPage.tsx
    git commit -m "refactor: clean up settings page, remove oauth"
    ```

### Task 8: Remove Dead Code & Verify Build

**Execution:** 🄸 Inline
**Depends on:** Task 6 (app refactored to use storage.ts), Task 7 (OAuth sections removed from Settings)

**Objective:** Remove unused API files and ensure the project builds.

**Files:**
-   Delete: `src/inviteflow/api/auth.ts`
-   Delete: `src/inviteflow/api/drive.ts`
-   Delete: `src/inviteflow/api/sheets.ts`
-   Modify: `src/inviteflow/api/gmail.ts` (Rename to `email.ts` or keep as is, but ensure it has no OAuth logic).

**Steps:**

1.  **Cleanup**
    ```bash
    rm src/inviteflow/api/auth.ts
    rm src/inviteflow/api/drive.ts
    rm src/inviteflow/api/sheets.ts
    # Note: gmail.ts contains personalize/buildMimeRaw logic which is still needed. 
    # We will leave it for now, assuming SendTab imports from it correctly.
    # If SendTab was updated to use a generic send, update that.
    ```

2.  **Check Build**
    Run: `npm run build`
    Expected: Build succeeds. If there are import errors, fix them.

3.  **Commit**
    ```bash
    git add -A
    git commit -m "chore: remove dead gcc oauth api files"
    ```

---

## Final Review

The plan is complete and saved. Ready to execute using subagent-driven-development — I'll dispatch a fresh subagent per task with two-stage review (spec compliance then code quality). Shall I proceed?