# Invite Automation Suite — Claude Guide

Author: Lenya Chan
Updated: 2026-04-27

## Planning docs
- `docs/ROADMAP.md` — prioritized UX improvement roadmap with persona analysis
- `docs/PROGRESS.md` — per-version changelog of UX work completed
- `docs/TASKS.md` — current and backlog task list with implementation notes

## File versioning
Active production files: `index.html`, `inviteflow.html`, `contactscout.html`
Iterations use the pattern `{name}_v{N:02d}.html` (e.g. `inviteflow_v02.html`).
When a version is approved, promote it by replacing the production file.
Public-facing files carry author credit "by Lenya Chan" near their title.

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
Two self-contained vanilla JS HTML apps. No build step. No dependencies.

---

## contactscout.html (~30 KB)
- State object `S`: { contacts[], newContacts[], scanStatus{}, scanMeta{}, apiKey, unsaved }
- Key functions: render(), upd(), callClaude(), saveState(), loadState(), exportProfile(), importProfile()
- Persistence: localStorage key `contactscout_state`
- API key: sessionStorage key `cs_api_key`
- Export filenames: `contactscout-backup-YYYY-MM-DD.json`, `contactscout-invitees-YYYY-MM-DD.json`

---

## inviteflow.html (~75 KB)
- State object `S`: { event{}, invitees[], tab, tplMode, textSubject, textBody, htmlBody, sendLog[], schemas[], activeSchemaId, schemaNameDraft, googleClientId, sending, sendProgress{}, previewName, unsaved, log[] }
- `S.event` fields: name, date, venue, orgName, contactName, contactEmail, contactTitle, vipStart, vipEnd, formUrl, entryName, entryEmail, inviteeSheetUrl, masterSheetUrl, rsvpResponseUrl, replyTo, senderName, images
- `S.invitees[]` schema: { name, title, category, email, rsvpLink, inviteStatus, sentAt, rsvpStatus, rsvpDate, notes }
- Key functions: render(), buildEmail(), personalize(), saveState(), loadState(), clearSavedState()
- Google OAuth: getGoogleToken(scope) via GSI CDN — scopes: 'spreadsheets', 'gmail.send'
- Sheets: importFromSheet(), syncToMasterSheet(), syncRsvpResponses()
- Gmail: sendBulkEmails(filter), buildMimeRaw(), toBase64Url()
- RSVP links: buildRsvpLink(inv), generateAllRsvpLinks()
- Schema mgmt: saveSchema(), loadSchema(), deleteSchema(), exportSchema()
- Persistence: localStorage key `inviteflow_state` — includes googleClientId, tplMode, htmlBody, schemas
- Template tokens: {{FirstName}}, {{LastName}}, {{FullName}}, {{EventName}}, {{EventDate}}, {{Venue}}, {{RSVP_Link}}, {{FullTitle}}, {{OrgName}}, {{ContactName}}, {{ContactEmail}}, {{ContactTitle}}, {{VIPStart}}, {{VIPEnd}}, {{Date_Sent}}
- Tabs (5): Settings, Contacts, Email, Send, Track
  - Settings (tab 0): event details, email config, Google OAuth, Sheets URLs, RSVP form prefill, images, saved configs, data management
  - Contacts (tab 1): import from Sheet/ContactScout/CSV, manual add, status table
  - Email (tab 2): HTML/plain-text template editor, live preview
  - Send (tab 3): bulk send via Gmail, progress, manual fallback
  - Track (tab 4): RSVP stats, bar chart, sync RSVP responses, sync to master sheet
- Master sheet columns: FirstName, LastName, Title, Category, Email, RSVP_Link, InviteSent, InviteSentDate, RSVP_Status, RSVP_Date, Notes
- Secrets: googleClientId stored in localStorage only — never hardcode. Claude API key in contactscout uses sessionStorage.

---

## Conventions
- Single `<script>` block per file, state at top, render() called on every mutation
- saveState() called at end of render()
- No frameworks, no imports, no fetch except Claude API (contactscout) + Google APIs (inviteflow)
- Google APIs called with OAuth2 Bearer token from getGoogleToken() — never API keys in source

## UX conventions
- First-run experience: inviteflow shows a 3-step welcome card (setupComplete() hides it) — keep it updated if new required steps are added
- Google OAuth section in renderSetup() has two states: 5-step guide (no clientId) and compact confirmed state (clientId set)
- Empty states must include actionable buttons; passive "nothing here" messages are not acceptable
- All tab index references must be updated together: TABS array, render() switch, any onclick="S.tab=N", render checks like `if (S.tab===N)`
- ContactScout: needsCustomization() detects [YOUR STATE] placeholders — keep it in sync if placeholder patterns change
- Dates: YYYY-MM-DD in all docs and filenames
