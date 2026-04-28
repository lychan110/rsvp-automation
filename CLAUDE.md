# Invite Automation Suite — Claude Guide

Author: Lenya Chan
Updated: 2026-04-28

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

**InviteFlow** (vanilla JS, ~75 KB)
- Production file: `inviteflow.html`
- Iterations use the pattern `inviteflow_v{N:02d}.html` (e.g. `inviteflow_v02.html`)

**ContactScout** (React + Vite, `src/contact-scout/`)
- Built with `npm run build` → deployed to `src/contact-scout/`
- Source: `src/contact-scout/src/`, config: `src/contact-scout/vite.config.ts`
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
2. **Ship to production file, not just a version file** — a fix that lives only in `_v02.html`
   isn't shipped. Promote to the production file when approved.
3. **Always check the full tab sequence** — a change in tab 0 can break layout in tab 4.
   After any UI edit, walk through all five tabs before committing.
4. **Reference `docs/TASKS.md`** before starting new UI work — if the task is already listed,
   follow its implementation notes. If it's new, add it before you start.

### UX principles

| Principle | What it means in practice |
|-----------|---------------------------|
| Empty states are never passive | Every empty list or panel includes an action button or clear next-step guidance |
| Feedback is always inline | Status messages, errors, and confirmations appear in the page — never `alert()` |
| Destructive actions require confirmation | Delete, clear, and revoke operations show an inline prompt before executing |
| Labels describe outcomes | Use "Send Invitations" not "Run Loop"; "Import Contacts" not "Load Array" |
| Progress is always visible | Bulk operations show a progress bar or item-by-item counter, never a spinner alone |
| First-run is guided | The 3-step welcome card must stay current; add a step if a new required setup action is introduced |

### Responsive layout guidelines

Both apps are desktop-first but must not break below 900 px width.

- Use `max-width` + `width: 100%` for all containers instead of fixed `px` widths.
- Tables in the Contacts and Track tabs must become horizontally scrollable (`overflow-x: auto`
  on a wrapper div) at narrow viewports — do not let them overflow the page.
- The Send tab progress area must stack vertically on narrow screens (column flex, not row).
- Test at 1440 px (desktop) and 900 px (narrow laptop) before committing any layout change.

### Dark theme consistency

Both apps use a dark GitHub-style palette. Before introducing a new color:
1. Search the file for the closest existing color value.
2. Reuse it. Add a new color only if no existing value fits semantically.
3. New interactive elements (buttons, inputs, toggles) must have `:hover` and `:focus` states
   that are visibly distinct from their default state.

---

## Architecture

Two self-contained apps with different technology stacks:

### InviteFlow — Vanilla JS, no build step
Single-file vanilla JS app. State lives in a top-level `S` object. Every user action calls `render()` which regenerates the DOM. No dependencies, no imports.

### ContactScout — React + Vite, compiled
React app using Vite as the build tool. State managed in the top-level `App` component. Built with `npm run build` and deployed to `src/contact-scout/`.

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
3. In the app, click **⚙ Key** in the header and paste the key.
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
- City Council ×3

**UI/UX conventions for ContactScout**
- Incremental changes — one interaction at a time
- Feedback-first — every action produces immediate visible feedback (spinners, status messages, button state changes)
- Mobile-aware — components must not break below 1024 px; use percentage widths and `max-width` rather than fixed px
- Dark theme consistent — reference existing color variables before introducing new ones

---

## InviteFlow (Vanilla JS)

---

**inviteflow.html (~75 KB)**

Single vanilla JS file. No build step, no dependencies.

**State object `S`**
```
{
  event: { name, date, venue, orgName, contactName, contactEmail, contactTitle,
           vipStart, vipEnd, formUrl, entryName, entryEmail, inviteeSheetUrl,
           masterSheetUrl, rsvpResponseUrl, replyTo, senderName, images },
  invitees: [{ firstName, lastName, title, category, email, rsvpLink, inviteStatus,
               sentAt, rsvpStatus, rsvpDate, notes }, ...],
  tab, tplMode, textSubject, textBody, htmlBody, sendLog[], schemas[],
  activeSchemaId, schemaNameDraft, googleClientId, sending, sendProgress{},
  previewName, unsaved, log[]
}
```

**Key functions**
- `render()` — regenerate DOM on every state change
- `buildEmail()`, `personalize()` — template composition
- `saveState()`, `loadState()`, `clearSavedState()` — persistence
- `getGoogleToken(scope)` — OAuth2 via GSI CDN, scopes: 'spreadsheets', 'gmail.send'
- `importFromSheet()`, `syncToMasterSheet()`, `syncRsvpResponses()` — Google Sheets integration
- `sendBulkEmails(filter)`, `buildMimeRaw()`, `toBase64Url()` — Gmail integration
- `buildRsvpLink(inv)`, `generateAllRsvpLinks()` — RSVP link generation
- `saveSchema()`, `loadSchema()`, `deleteSchema()`, `exportSchema()` — email template persistence

**Persistence**
- `localStorage` key `inviteflow_state` — stores googleClientId, tplMode, htmlBody, schemas

**Template tokens**
`{{FirstName}}`, `{{LastName}}`, `{{FullName}}`, `{{EventName}}`, `{{EventDate}}`, `{{Venue}}`, `{{RSVP_Link}}`, `{{FullTitle}}`, `{{OrgName}}`, `{{ContactName}}`, `{{ContactEmail}}`, `{{ContactTitle}}`, `{{VIPStart}}`, `{{VIPEnd}}`, `{{Date_Sent}}`

**Tabs (5)**
- Settings (tab 0): event details, email config, Google OAuth, Sheets URLs, RSVP form prefill, images, saved configs, data management
- Contacts (tab 1): import from Sheet/ContactScout/CSV, manual add, status table
- Email (tab 2): HTML/plain-text template editor, live preview
- Send (tab 3): bulk send via Gmail, progress, manual fallback
- Track (tab 4): RSVP stats, bar chart, sync RSVP responses, sync to master sheet

**Master sheet columns**
FirstName, LastName, Title, Category, Email, RSVP_Link, InviteSent, InviteSentDate, RSVP_Status, RSVP_Date, Notes

**Secrets**
- googleClientId stored in localStorage only — never hardcode
- ContactScout's Claude API key uses sessionStorage (not shared with InviteFlow)

---

## Cross-app conventions

**Code style**
- InviteFlow: Single `<script>` block, state at top, `render()` called on every mutation. `saveState()` called at end of `render()`.
- ContactScout: React component lifecycle. State changes trigger re-renders automatically.
- No fetch except: Claude API (ContactScout) + Google APIs (InviteFlow)
- Google APIs called with OAuth2 Bearer token from `getGoogleToken()` — never API keys in source

**UX conventions**
- Empty states must include actionable buttons; passive "nothing here" messages are not acceptable
- All tab index references must be updated together: TABS array, render() switch, any onclick="S.tab=N", render checks like `if (S.tab===N)` (InviteFlow)
- First-run experience: InviteFlow shows a 3-step welcome card (`setupComplete()` hides it) — keep it updated if new required steps are added
- Google OAuth section in `renderSetup()` has two states: 5-step guide (no clientId) and compact confirmed state (clientId set) (InviteFlow)
- ContactScout: `needsCustomization()` detects `[YOUR STATE]` placeholders — keep it in sync if placeholder patterns change
- Dates: YYYY-MM-DD in all docs and filenames

**Deployment**
- InviteFlow: Edit `inviteflow.html` directly (or iterate as `inviteflow_vNN.html` then promote)
- ContactScout: Edit source in `src/contact-scout/src/`, run `npm run build`, commit built files to `src/contact-scout/`
- Public-facing files carry author credit "by Lenya Chan" near their title
