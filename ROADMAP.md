# Roadmap — InviteFlow v3

> by Lenya Chan · last updated 2026-04-25

Phases are ordered by dependency. Each phase produces a committable, runnable increment.

---

## Phase 0 — Planning complete ✅
- Stack critique (4 SDE angles) → decisions recorded in README.md
- UX critique (4 personas) → decisions recorded below
- Implementation tasks written in TASKS.md

**UX persona decisions:**

| Persona | Decision |
|---|---|
| Non-tech Sheets user | Sheets URL import is the primary entry point; column mapping shown with sample preview |
| Time-pressured coordinator | Tracker tab is default landing; "Send to all unsent" is a single prominent button |
| Power user Lenya | Multi-event via Drive appDataFolder; full JSON export/import for backup |
| Mobile user | Desktop-first (bulk invite management is a desktop task); Tracker tab is mobile-usable |

---

## Phase 1 — Scaffold & Auth

- `package.json` with Vite + React 18 + TypeScript + PrimeReact + TipTap
- `vite.config.ts`: `base: './'`, multiple inputs, output `dist/inviteflow.html`
- `src/inviteflow/` directory structure
- OAuth 2.0 PKCE implemented in `api/auth.ts`; token cached in sessionStorage
- Google Sheets, Drive, Gmail API clients stubbed with real auth wiring
- Dev server: `npm run dev` → `http://localhost:5173/inviteflow.html`
- Deploy script: `npm run deploy` → gh-pages

**Exit criteria:** OAuth flow completes, token returned; Sheets API returns sheet metadata for a test URL.

---

## Phase 2 — State & Types

- `types.ts`: `AppEvent`, `Invitee`, `AppState`, `SendLogEntry`, `EventConfig`
- `AppContext.tsx` + `reducer.ts` + `actions.ts`
- localStorage persistence (`inviteflow_v3_state`) for event config + invitees
- sessionStorage for OAuth token (cleared on tab close)

**Exit criteria:** State round-trips through localStorage; reducer handles all action types without TypeScript errors.

---

## Phase 3 — Events & Setup Tabs

- **Events tab:** list events from Drive appDataFolder; switch active event; create new; delete
- **Setup tab:** event config form (name, date, venue, org, contact, form URL, RSVP URL, VIP start/end); OAuth Client ID input; scope consent buttons

**Exit criteria:** Create event → appears in list → switch → Setup form loads correct data.

---

## Phase 4 — Invitees Tab

- PrimeReact DataTable: 200+ rows, virtual scroll, column filter, multi-sort
- Columns: name, title, category, email, inviteStatus, sentAt, rsvpStatus, rsvpDate, notes
- Inline edit: `inviteStatus`, `notes`
- Multi-select + bulk action toolbar: send selected, mark as invited, reset status
- Import from Sheets URL (Sheets API read); import from ContactScout JSON
- Add invitee manually (dialog form)
- Export to CSV

**Exit criteria:** 200 rows render without jank; filter by status works; import from a real Sheets URL populates the table.

---

## Phase 5 — Compose & Send Tabs

- **Compose tab:** TipTap editor (starter kit); subject line input; token insert toolbar; live HTML preview (personalized with first invitee as sample)
- **Send tab:** filter dropdown (all / unsent / failed); "Send to filtered" button; progress bar showing N of M; per-row sent/failed indicators in a log table; exponential backoff on 429 (base 2s, max 64s, jitter ±20%)

**Exit criteria:** Send 5 emails to a test list; log shows correct status; retry on simulated 429 succeeds.

---

## Phase 6 — Tracker & Sync Tabs

- **Tracker tab:** summary cards (total, invited, sent, RSVP attending, RSVP declined, no response); breakdown by category
- **Sync tab:** push invitee list to master Sheets URL (batch update); pull RSVP responses from Sheets (reads RSVP_Status, RSVP_Date columns); GAS trigger setup instructions + copy-paste `Code.gs`

**Exit criteria:** Tracker cards show correct counts after a send; sync push writes correct data to Sheets.

---

## Phase 7 — Polish & Deploy

- Responsive layout check (no horizontal scroll on 375px width)
- ARIA labels on DataTable columns, buttons, dialogs
- Error boundaries on each tab
- Loading spinners / skeleton states for async operations
- `npm run deploy` publishes `dist/` to `gh-pages` branch with `index.html` + `contactscout.html` copied in
- Update `index.html` card link: `inviteflow.html` (already correct)

**Exit criteria:** App deploys to GitHub Pages; no console errors; Lighthouse accessibility score ≥ 80.
