# Invite Automation Suite — Claude Guide

Author: Lenya Chan
Updated: 2026-04-28

## Approach
- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- No sycophantic openers or closing fluff.
- No emojis or em-dashes.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

## Code Exploration Policy
Always use jCodemunch-MCP tools -- never fall back to Read, Grep, Glob, or Bash for code exploration.
- Before reading a file: use get_file_outline or get_file_content
- Before searching: use search_symbols or search_text
- Before exploring structure: use get_file_tree or get_repo_outline
- Call resolve_repo with the current directory first; if not indexed, call index_folder.

## Overview

The suite consists of two complementary tools:
- **InviteFlow** — manage invites, compose templates, send emails, track RSVPs
- **ContactScout** — discover and verify elected officials, export contact lists for InviteFlow

Both run entirely in the browser. InviteFlow uses Gmail + Google Sheets; ContactScout uses Claude API with web search.

## Planning docs
- `docs/ROADMAP.md` — prioritized UX improvement roadmap with persona analysis
- `docs/PROGRESS.md` — per-version changelog of UX work completed
- `docs/TASKS.md` — current and backlog task list with implementation notes

## File structure

**InviteFlow** (React + Vite, v3.1)
- Source: `src/inviteflow/` (React + TypeScript + Tailwind v4 + PrimeReact)
- Built from root: `npm run build` → `dist/src/inviteflow/`
- Entry: `src/inviteflow/index.html`, mounts `src/inviteflow/main.tsx`
- Design system: `src/inviteflow/styles/if.css` (`.if-*` classes)

**ContactScout** (React + Vite, standalone)
- Source: `src/contact-scout/src/`
- Built with `cd src/contact-scout && npm run build` → `src/contact-scout/dist/`
- Production file: `src/contact-scout/index.html`

**Main entry point** (`index.html`)
- Lists both apps with cards
- Password-locked access to ContactScout (code: `scout2025`)

---

## UI/UX Development Approach

The suite is used during high-stakes event cycles — mistakes are costly and time is short.
Every UI/UX change must be **purposeful, minimal, and immediately testable**.

### Agile iteration rules

1. **One interaction per change** — fix the confirmation flow, or the empty state, or the
   button label, but not all three at once. Small diffs are easier to review and easier to
   roll back.
2. **Always check the full tab sequence** — a change in one tab can break layout in another.
   After any UI edit, walk through all tabs before committing.
3. **Reference `docs/TASKS.md`** before starting new UI work — if the task is already listed,
   follow its implementation notes. If it's new, add it before you start.

### UX principles

| Principle | What it means in practice |
|-----------|---------------------------|
| Empty states are never passive | Every empty list or panel includes an action button or clear next-step guidance |
| Feedback is always inline | Status messages, errors, and confirmations appear in the page — never `alert()` |
| Destructive actions require confirmation | Delete, clear, and revoke operations show an inline prompt before executing |
| Labels describe outcomes | Use "Send Invitations" not "Run Loop"; "Import Contacts" not "Load Array" |
| Progress is always visible | Bulk operations show a progress bar or item-by-item counter, never a spinner alone |

### Responsive layout guidelines

Both apps are desktop-first but must not break below 900 px width.

- Use `max-width` + `width: 100%` for all containers instead of fixed `px` widths.
- Tables in the Invitees and Tracker tabs must become horizontally scrollable (`overflow-x: auto`
  on a wrapper div) at narrow viewports — do not let them overflow the page.
- Test at 1440 px (desktop) and 900 px (narrow laptop) before committing any layout change.

### Dark theme consistency

Both apps are dark-only (no light mode toggle). Before introducing a new color:
1. Check `src/inviteflow/theme.css` for the closest existing CSS custom property.
2. Reuse it. Add a new value only if no existing property fits semantically.
3. New interactive elements (buttons, inputs, toggles) must have `:hover` and `:focus` states
   that are visibly distinct from their default state.

---

## Architecture

Two self-contained apps, both React + Vite:

### InviteFlow — React + Vite (root package)
React + TypeScript app. State managed via `useReducer` + React Context (`AppProvider`). Built with the root Vite config; Tailwind v4 handles layout utilities, `.if-*` classes handle design tokens, PrimeReact provides the DataTable.

### ContactScout — React + Vite (separate package)
React app in `src/contact-scout/`. Own `package.json`, own Vite config. State managed in the top-level `App` component. Built with `npm run build` inside `src/contact-scout/`.

---

## InviteFlow (React + Vite, v3.1)

**Setup**
```bash
npm install          # root — installs all InviteFlow deps
npm run dev          # http://localhost:5173
npm run build        # dist/ → deployed from dist/src/inviteflow/
```

**Source layout**
```
src/inviteflow/
  main.tsx            — mounts <App />, imports theme.css + if.css
  App.tsx             — shell: header nav (7 tabs), mobile drawer, <AppProvider>
  theme.css           — CSS custom properties (dark palette tokens)
  types.ts            — AppEvent, Invitee, SendLogEntry, AppState, TabId
  styles/
    if.css            — .if-* design system (see below)
  state/
    AppContext.tsx     — AppProvider, useAppState, useAppDispatch; localStorage key: inviteflow_v3_state
    reducer.ts        — reducer(), INITIAL_STATE; default dark (localStorage !== 'light')
    actions.ts        — Action union type
  api/
    auth.ts           — getToken(scope) — OAuth2 via GSI CDN
    gmail.ts          — buildMimeRaw(), personalize(), sendEmail()
    sheets.ts         — sheetsGet(), sheetsUpdate(), sheetsClear(), extractSheetId()
    drive.ts          — Drive API helpers
  tabs/
    EventsTab.tsx     — create/select/delete events
    SetupTab.tsx      — event details, email config, OAuth, Sheets URLs, RSVP form prefill
    InviteesTab.tsx   — PrimeReact DataTable; import/export; bulk actions; manual add
    ComposeTab.tsx    — TipTap rich-text editor; token insert; live preview
    SendTab.tsx       — bulk send; filter (all/pending/failed); progress bar; send log
    TrackerTab.tsx    — stat cards; breakdown by category table
    SyncTab.tsx       — push to master sheet; pull RSVP responses; GAS ingest trigger code
  index.html
```

**Tabs (7)**
| Tab | Id | Purpose |
|-----|----|---------|
| Events   | `events`   | Create and switch between named events |
| Setup    | `setup`    | Event details, OAuth client ID, Sheets URLs |
| Invitees | `invitees` | Import/export/manage the invitee list |
| Compose  | `compose`  | Edit email subject + HTML body; preview |
| Send     | `send`     | Bulk send via Gmail; progress bar; send log |
| Tracker  | `tracker`  | RSVP stats; category breakdown |
| Sync     | `sync`     | Push to master sheet; pull RSVP; GAS code |

**State (AppState)**
```ts
{
  activeEventId: string | null,
  events: AppEvent[],
  invitees: Invitee[],
  tab: TabId,
  textSubject: string,
  htmlBody: string,
  sendLog: SendLogEntry[],
  sending: boolean,
  sendProgress: { current: number, total: number },
  unsaved: boolean,
  darkMode: boolean,
}
```

**AppEvent fields**
`id, name, date, venue, orgName, contactName, contactEmail, formUrl, rsvpResponseUrl, masterSheetUrl, entryEmail, imgEmblemUrl, vipStart, vipEnd, googleClientId`

**Invitee fields**
`id, firstName, lastName, title, category, email, rsvpLink, inviteStatus ('pending'|'sent'|'failed'), sentAt, rsvpStatus ('No Response'|'Attending'|'Declined'), rsvpDate, notes`

**Persistence**
- `localStorage` key `inviteflow_v3_state` — persists everything except `sendLog`, `sending`, `sendProgress`, `darkMode`
- `localStorage` key `inviteflow_theme` — `'light'` to opt out of dark; any other value (or absent) = dark

**Template tokens**
`{{FirstName}}`, `{{LastName}}`, `{{FullName}}`, `{{FullTitle}}`, `{{EventName}}`, `{{EventDate}}`, `{{Venue}}`, `{{OrgName}}`, `{{ContactName}}`, `{{ContactEmail}}`, `{{VIPStart}}`, `{{VIPEnd}}`, `{{RSVP_Link}}`, `{{Date_Sent}}`

**Master sheet columns**
`FirstName, LastName, Title, Category, Email, RSVP_Link, InviteSent, InviteSentDate, RSVP_Status, RSVP_Date, Notes`

**Secrets**
- `googleClientId` stored per event in localStorage only — never hardcode
- ContactScout's Claude API key uses sessionStorage (not shared with InviteFlow)

---

## InviteFlow design system (`.if-*` classes)

All design tokens come from CSS custom properties in `theme.css`. The `.if-*` classes in `src/inviteflow/styles/if.css` consume them exclusively. Tailwind is used only for layout utilities (flex, grid, padding, overflow, etc.).

**Class reference**

| Class | Purpose |
|-------|---------|
| `.if-btn` | Base button — transparent bg, `var(--border)` border, monospace 10px |
| `.if-btn.pri` | Primary — `var(--accent)` fill |
| `.if-btn.grn` | Confirm/send — `var(--success-bg)` fill, `var(--success)` text |
| `.if-btn.del` | Destructive — `var(--danger-dark)` border, `var(--danger)` text |
| `.if-btn.ghost` | Outline blue — `var(--blue)` border + text |
| `.if-btn.sm` | Compact (24px height, 9px font) |
| `.if-btn.lg` | Large (40px height, 11px font) |
| `.if-card` | Surface card — `var(--bg-surface)`, 1px border, 8px radius, 16px padding |
| `.if-section-label` | ALL-CAPS section heading — 10px monospace, wide tracking, muted |
| `.if-page-title` | Tab title — 13px bold monospace |
| `.if-input` | Text input — `var(--bg-surface)` bg, `#30363d` border, focus turns blue |
| `.if-label` | Field label above an input — 10px monospace, uppercase, muted |
| `.if-pill` | Filter pill — transparent until `.active` (accent color + tint bg) |
| `.if-stat` | Stat card — surface bg, 3px left accent border |
| `.if-stat-label` | Label inside stat card — 9px uppercase muted |
| `.if-stat-value` | Number inside stat card — 24px bold |
| `.if-code` | Code/pre block — `var(--bg-subtle)` bg, 10px monospace, scrollable |
| `.if-empty` | Empty state message — centered, 48px vertical padding, muted |
| `.if-status` | Inline status text; add `.ok` (green) or `.err` (red) or `.info` (blue) |
| `.if-nav-tab` | Header nav button — uppercase 10px, `.active` gets accent fill |
| `.if-bulk-bar` | Bulk action toolbar — surface bg, wrapping flex row |
| `.if-tag` | Inline status badge — border matches current color |

Mobile breakpoint (`max-width: 767px`): `.if-btn` scales to `min-height: 44px`, `.if-btn.sm` to 36px, `.if-nav-tab` to 44px.

---

## ContactScout (React + Vite)

**Setup**
```bash
cd src/contact-scout
npm install
npm run dev      # http://localhost:5174
npm run build    # dist/ → deployed to src/contact-scout/
```

**Architecture**
```
src/contact-scout/
  src/
    main.tsx         — mounts <App />, applies global styles
    App.tsx          — full ContactScout logic (password gate + inner panel)
    types.ts         — CSOfficial, CSScanMeta, Invitee types
  index.html
  vite.config.ts
  package.json
```

**Customization before first use**
The scan prompts in `src/App.tsx` (`SCAN_PROMPTS`) contain placeholder text: `[YOUR STATE]`, `[YOUR COUNTIES]`, `[CITY 1]`, `[CITY 2]`, `[CITY 3]`. Replace these with the actual state, counties, and cities before scanning. `needsCustomization()` detects these placeholders and shows a banner in the Scan tab.

**State & persistence**
- `localStorage` key: `contactscout_state` — stores `{ officials, newOfficials, scanStatus, scanMeta }`
- `sessionStorage` key: `cs_api_key` — stores Claude API key for this session
- `sessionStorage` key: `cs_unlocked` — set to `'1'` after password gate is passed

**Claude API setup**
ContactScout calls the Anthropic API directly from the browser.
1. Go to https://console.anthropic.com/ → API Keys → Create Key.
2. Copy the key (starts with `sk-ant-`).
3. In the app, click **Key** in the header and paste the key.
4. The key is stored in `sessionStorage` only — never persisted to `localStorage`.
5. Required header: `anthropic-dangerous-direct-browser-access: true`.
6. Model: `claude-sonnet-4-20250514` with the `web_search_20250305` tool.

**Export formats**
- **InviteFlow JSON** (`export_invitees`): `{ exportedAt, source, count, invitees[] }` in InviteFlow's schema for direct import
  - Officials with `status === 'left_office'` are excluded
  - Only officials with non-empty email are included
  - `notes` = `"district · county"` where available
  - `inviteStatus` defaults to `"pending"`
- **Backup** (`export_backup`): Full state `{ officials[], newOfficials[], scanStatus, scanMeta }` for restore
- **CSV** (`export_csv`): All fields as spreadsheet

**Scan targets**
Each calls Claude with a web-search-enabled prompt:
- US Congress (all seats for your state)
- State Executive Branch
- State Senate (all seats)
- State House (tracked counties)
- City Council x3

**UI/UX conventions for ContactScout**
- Incremental changes — one interaction at a time
- Feedback-first — every action produces immediate visible feedback (spinners, status messages, button state changes)
- Mobile-aware — components must not break below 1024 px; use percentage widths and `max-width` rather than fixed px
- Dark theme consistent — reference existing color variables before introducing new ones

---

## Cross-app conventions

**Code style**
- InviteFlow: React + TypeScript. State in `AppContext` via `useReducer`. Dispatch actions; never mutate state directly.
- ContactScout: React component lifecycle. State changes trigger re-renders automatically.
- No fetch except: Claude API (ContactScout) + Google APIs (InviteFlow)
- Google APIs called with OAuth2 Bearer token from `getToken(scope)` — never API keys in source

**UX conventions**
- Empty states must include actionable buttons; passive "nothing here" messages are not acceptable
- All tab additions require updating: the `TABS` array in `App.tsx`, the `TabId` union in `types.ts`, the switch in `TabContent`, and adding a new tab file
- ContactScout: `needsCustomization()` detects `[YOUR STATE]` placeholders — keep it in sync if placeholder patterns change
- Dates: YYYY-MM-DD in all docs and filenames

**Deployment**
- InviteFlow: Edit source in `src/inviteflow/`, run `npm run build` from root, commit `dist/`
- ContactScout: Edit source in `src/contact-scout/src/`, run `npm run build` inside that directory, commit built files to `src/contact-scout/`
- Public-facing files carry author credit "by Lenya Chan" near their title
