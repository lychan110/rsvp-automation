# Tasks — InviteFlow v3

> by Lenya Chan · last updated 2026-04-25

Status: `[ ]` todo · `[x]` done · `[-]` skipped

---

## Phase 0 — Planning

- [x] Write README.md (stack + structure)
- [x] Write ROADMAP.md (phased milestones + UX decisions)
- [x] Write TASKS.md (this file)
- [x] Write PROGRESS.md

---

## Phase 1 — Scaffold & Auth

### 1.1 package.json + Vite config
- [x] `package.json` with scripts: `dev`, `build`, `deploy`
- [x] Dependencies: `react`, `react-dom`, `primereact`, `primeicons`, `primeflex`, `@tiptap/react`, `@tiptap/starter-kit`, `gh-pages`
- [x] Dev dependencies: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`
- [x] `vite.config.ts`: base `'./'`, input `src/inviteflow/index.html`, outDir `dist`, filename `inviteflow`
- [x] `tsconfig.json`: strict mode, JSX react-jsx
- [x] `src/inviteflow/index.html`: minimal HTML shell that mounts `<div id="root">` + loads `main.tsx`

### 1.2 OAuth 2.0 PKCE (`src/inviteflow/api/auth.ts`)
- [x] `getToken(scope: string): Promise<string>` — returns cached token or triggers Google OAuth popup
- [x] Token cached in sessionStorage keyed by scope
- [x] Scopes: `spreadsheets`, `gmail.send`, `drive.appdata`
- [x] Uses `google.accounts.oauth2.initTokenClient` from GSI CDN (`accounts.google.com/gsi/client`)
- [x] `clearToken(scope)` clears sessionStorage entry
- [x] `src/inviteflow/index.html` must include `<script src="https://accounts.google.com/gsi/client" async defer>`

### 1.3 API stubs
- [x] `src/inviteflow/api/sheets.ts` — export `sheetsGet(token, spreadsheetId, range)` and `sheetsUpdate(token, spreadsheetId, range, values)`
- [x] `src/inviteflow/api/drive.ts` — export `listAppDataFiles(token)`, `getAppDataFile(token, fileId)`, `createAppDataFile(token, name, content)`, `updateAppDataFile(token, fileId, content)`, `deleteAppDataFile(token, fileId)`
- [x] `src/inviteflow/api/gmail.ts` — export `sendEmail(token, raw: string): Promise<void>` with exponential backoff (base 2s, max 64s, jitter ±20%)

### 1.4 Deploy script
- [x] In `package.json`: `"predeploy": "npm run build && node scripts/copy-static.js"`, `"deploy": "gh-pages -d dist"`
- [x] `scripts/copy-static.js` copies `index.html` and `contactscout.html` into `dist/`

---

## Phase 2 — State & Types

### 2.1 Types (`src/inviteflow/types.ts`)
```ts
interface AppEvent {
  id: string;           // Drive file ID
  name: string;
  date: string;         // YYYY-MM-DD
  venue: string;
  orgName: string;
  contactName: string;
  contactEmail: string;
  formUrl: string;      // Google Form base URL
  rsvpResponseUrl: string; // Sheets URL with RSVP responses
  masterSheetUrl: string;
  entryEmail: string;   // Form entry ID for email field
  imgEmblemUrl: string;
  vipStart: string;
  vipEnd: string;
  googleClientId: string;
}

interface Invitee {
  id: string;           // UUID
  firstName: string;
  lastName: string;
  title: string;
  category: string;
  email: string;
  rsvpLink: string;
  inviteStatus: 'pending' | 'sent' | 'failed';
  sentAt: string;       // ISO string or ''
  rsvpStatus: 'No Response' | 'Attending' | 'Declined';
  rsvpDate: string;
  notes: string;
}

interface SendLogEntry {
  id: string;
  email: string;
  name: string;
  status: 'sent' | 'failed';
  timestamp: string;
  error?: string;
}

interface AppState {
  activeEventId: string | null;
  events: AppEvent[];
  invitees: Invitee[];
  tab: TabId;
  textSubject: string;
  htmlBody: string;
  sendLog: SendLogEntry[];
  sending: boolean;
  sendProgress: { current: number; total: number };
  unsaved: boolean;
}

type TabId = 'events' | 'setup' | 'invitees' | 'compose' | 'send' | 'tracker' | 'sync';
```

### 2.2 Context + Reducer
- [x] `src/inviteflow/state/AppContext.tsx` — creates `AppContext`, exports `useAppState()` and `useAppDispatch()` hooks
- [x] `src/inviteflow/state/reducer.ts` — handles all action types
- [x] `src/inviteflow/state/actions.ts` — action type union
- [x] Actions: `SET_TAB`, `SET_EVENT`, `ADD_EVENT`, `DELETE_EVENT`, `UPDATE_EVENT`, `SET_INVITEES`, `ADD_INVITEE`, `UPDATE_INVITEE`, `SET_COMPOSE`, `START_SEND`, `SEND_PROGRESS`, `LOG_SEND`, `STOP_SEND`, `SET_UNSAVED`
- [x] `App.tsx` wraps everything in `<AppProvider>`, renders `<TabBar>` + active tab component

### 2.3 Persistence
- [x] `saveState(state: AppState): void` — writes to localStorage key `inviteflow_v3_state` (excludes sendLog for size)
- [x] `loadState(): Partial<AppState>` — reads from localStorage
- [x] Called in reducer after every state change via useEffect in AppContext

---

## Phase 3 — Events & Setup Tabs

### 3.1 Events Tab (`src/inviteflow/tabs/EventsTab.tsx`)
- [x] Lists all events from `state.events` (loaded from Drive appDataFolder on mount)
- [x] Each event card: name, date, venue; "Activate" button sets `activeEventId`; "Delete" with confirm
- [x] "New Event" button → creates blank `AppEvent`, saves to Drive, adds to state
- [x] On mount: `listAppDataFiles` → load each event config → dispatch `SET_EVENTS`
- [x] Active event has a highlighted border

### 3.2 Setup Tab (`src/inviteflow/tabs/SetupTab.tsx`)
- [x] Form fields bound to `state.events.find(e => e.id === state.activeEventId)`:
  - Event Name, Event Date (date input), Venue, Org Name, Contact Name, Contact Email
  - Google Form Base URL, RSVP Response Sheet URL, Master Sheet URL, Form Entry ID (email field)
  - VIP Start Time, VIP End Time
  - Emblem Image URL
- [x] Google Client ID field (saved to `AppEvent.googleClientId` + localStorage `gClientId`)
- [x] "Authorize Sheets" button → `getToken('spreadsheets')`
- [x] "Authorize Gmail" button → `getToken('gmail.send')`
- [x] "Authorize Drive" button → `getToken('drive.appdata')`
- [x] "Save" button → `updateAppDataFile` + dispatch `UPDATE_EVENT`

---

## Phase 4 — Invitees Tab

### 4.1 DataTable (`src/inviteflow/tabs/InviteesTab.tsx`)
- [x] `<DataTable>` from PrimeReact; `value={state.invitees}`; `virtualScroll`; `scrollHeight="flex"`
- [x] Columns: FirstName, LastName, Title, Category, Email, InviteStatus (dropdown cell editor), SentAt, RSVPStatus, RSVPDate, Notes (text cell editor)
- [x] `filterDisplay="row"` on Category and InviteStatus columns
- [x] `selectionMode="multiple"` with checkbox column
- [x] Toolbar above table: "Import from Sheets" button, "Import JSON" file input, "Add Manually" button, "Export CSV" button
- [x] Bulk action toolbar (shown when rows selected): "Send Selected", "Mark Invited", "Reset Status", "Delete Selected"

### 4.2 Import from Sheets
- [x] Input for Sheets URL → parse spreadsheetId from URL → `sheetsGet(token, id, 'Sheet1!A:K')`
- [x] Map columns by header row: FirstName, LastName, Title, Category, Email, RSVP_Link, InviteSent, InviteSentDate, RSVP_Status, RSVP_Date, Notes
- [x] Show preview count before confirming import
- [x] Merge by Email (existing rows updated, new rows appended)

### 4.3 Import JSON (ContactScout export)
- [x] Accept `.json` file; parse as `Array<{name, title, category, email, ...}>`
- [x] Map name → firstName/lastName (split on first space)
- [x] Merge by email

### 4.4 Add Manually
- [x] Dialog with fields: First Name, Last Name, Title, Category, Email
- [x] Generates UUID id; adds to state

---

## Phase 5 — Compose & Send Tabs

### 5.1 Compose Tab (`src/inviteflow/tabs/ComposeTab.tsx`)
- [x] Subject line `<input>` bound to `state.textSubject`
- [x] TipTap `<EditorContent>` initialized with `useEditor({ extensions: [StarterKit] })`
- [x] On editor `update`, sync HTML to `state.htmlBody` via `editor.getHTML()`
- [x] Token toolbar: one button per token → `editor.commands.insertContent('{{TokenName}}')`
- [x] Preview panel: renders `state.htmlBody` with first invitee's data substituted; uses `dangerouslySetInnerHTML` inside an iframe-equivalent sandboxed div
- [x] "Save Template" button → saves htmlBody + textSubject to Drive appDataFolder under event config

### 5.2 Send Tab (`src/inviteflow/tabs/SendTab.tsx`)
- [x] Filter dropdown: All / Unsent / Failed
- [x] "Send to filtered" button → calls `sendBulkEmails(filtered)`
- [x] Progress bar: `state.sendProgress.current / state.sendProgress.total`
- [x] Send log table: email, name, status (sent/failed), timestamp, error message
- [x] `sendBulkEmails(invitees)`:
  1. Get Gmail token
  2. For each invitee: build MIME raw, call `sendEmail(token, raw)`
  3. After each 80 sends, wait 60s (rate limiting)
  4. Dispatch `SEND_PROGRESS` and `LOG_SEND` per invitee
  5. On success: dispatch `UPDATE_INVITEE` with `inviteStatus: 'sent'`, `sentAt: now`
  6. On failure: dispatch `UPDATE_INVITEE` with `inviteStatus: 'failed'`, log error

### 5.3 MIME builder (`src/inviteflow/api/gmail.ts`)
- [x] `buildMimeRaw(from, to, subject, htmlBody): string`
  - Builds RFC 2822 MIME message with `Content-Type: text/html; charset=utf-8`
  - Returns base64url encoded string
- [x] `personalize(template: string, invitee: Invitee, event: AppEvent): string`
  - Replaces all `{{Token}}` placeholders with invitee/event data

---

## Phase 6 — Tracker & Sync Tabs

### 6.1 Tracker Tab (`src/inviteflow/tabs/TrackerTab.tsx`)
- [x] Summary cards: Total, Pending, Sent, RSVP Attending, RSVP Declined, No Response
- [x] Breakdown table by Category: columns = Invited / Attending / Declined / No Response / Total
- [x] All derived from `state.invitees` (no API call needed)

### 6.2 Sync Tab (`src/inviteflow/tabs/SyncTab.tsx`)
- [x] "Push to Master Sheet" button:
  - Gets Sheets token
  - Clears sheet (or appends) then batch-writes all invitees in master sheet column order
  - Shows row count written
- [x] "Pull RSVP Responses" button:
  - Reads RSVP Response Sheet URL
  - Matches by Email (primary key)
  - Updates `rsvpStatus` and `rsvpDate` in state
  - Shows N updated count
- [x] GAS instructions section: copy-paste `Code.gs` content; link to GAS deployment docs
- [x] Shows current `masterSheetUrl` and `rsvpResponseUrl` from event config (link to Setup if not set)

---

## Phase 7 — GAS Trigger

### 7.1 `gas/Code.gs`
- [x] `onFormSubmit(e)` function:
  - Reads `e.response.getItemResponses()` to extract email + attending response
  - Opens master sheet by URL (from script property `MASTER_SHEET_URL`)
  - Finds row where Email column matches
  - Writes RSVP_Status and RSVP_Date
- [x] Script property `MASTER_SHEET_URL` — set via Apps Script project settings
- [x] Comment block with setup instructions (how to add trigger, set property)

---

## Phase 8 — Deploy

### 8.1 Build + deploy
- [x] `scripts/copy-static.js`: copies `index.html`, `contactscout.html` to `dist/`
- [x] Verify `dist/inviteflow.html` exists after `npm run build`
- [x] `npm run deploy` publishes to `gh-pages` branch
- [x] Update `index.html` card: verify link is `inviteflow.html` (already correct in current file)
