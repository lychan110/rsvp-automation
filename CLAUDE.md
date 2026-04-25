# Invite Automation Suite — Claude Guide

Author: Lenya Chan
Updated: 2026-04-24

## Planning docs
- `docs/ROADMAP.md` — prioritized UX improvement roadmap with persona analysis
- `docs/PROGRESS.md` — per-version changelog of UX work completed
- `docs/TASKS.md` — current and backlog task list with implementation notes

## File versioning
Active production files: `index.html`, `inviteflow.html`, `contactscout.html`
Iterations use the pattern `{name}_v{N:02d}.html` (e.g. `inviteflow_v02.html`).
When a version is approved, promote it by replacing the production file.
Public-facing files carry author credit "by Lenya Chan" near their title.

## Architecture
Two self-contained vanilla JS HTML apps. No build step. No dependencies.

## contactscout.html (~30 KB)
- State object `S`: { officials[], newOfficials[], scanStatus{}, scanMeta{}, apiKey, unsaved }
- Key functions: render(), upd(), callClaude(), saveState(), loadState(), exportProfile(), importProfile()
- Persistence: localStorage key `contactscout_state`
- API key: sessionStorage key `cs_api_key`
- Export filenames: `contactscout-backup-YYYY-MM-DD.json`, `contactscout-invitees-YYYY-MM-DD.json`

## inviteflow.html (~75 KB)
- State object `S`: { event{}, invitees[], tab, tplMode, textSubject, textBody, htmlBody, sendLog[], schemas[], activeSchemaId, schemaNameDraft, googleClientId, sending, sendProgress{}, previewName, unsaved, log[] }
- `S.event` new fields: inviteeSheetUrl, masterSheetUrl, rsvpResponseUrl, formUrl, entryName, entryEmail
- `S.invitees[]` schema: { name, title, category, email, rsvpLink, inviteStatus, sentAt, rsvpStatus, rsvpDate, notes }
- Key functions: render(), buildEmail(), personalize(), saveState(), loadState(), clearSavedState()
- Google OAuth: getGoogleToken(scope) via GSI CDN — scopes: 'spreadsheets', 'gmail.send'
- Sheets: importFromSheet(), syncToMasterSheet(), syncRsvpResponses()
- Gmail: sendBulkEmails(filter), buildMimeRaw(), toBase64Url()
- RSVP links: buildRsvpLink(inv), generateAllRsvpLinks()
- Schema mgmt: saveSchema(), loadSchema(), deleteSchema(), exportSchema()
- Persistence: localStorage key `inviteflow_state` — includes googleClientId, tplMode, htmlBody, schemas
- Template tokens: {{FirstName}}, {{LastName}}, {{FullName}}, {{EventName}}, {{EventDate}}, {{Venue}}, {{RSVP_Link}}, {{FullTitle}}, {{OrgName}}, {{ContactName}}, {{ContactEmail}}, {{VIPStart}}, {{VIPEnd}}, {{Date_Sent}}
- Tabs (7): Setup, Invitees, Compose, Send, Tracker, Sync, Configs — Setup is tab 0 (v02+, was Events first in v01)
- Master sheet columns: FirstName, LastName, Title, Category, Email, RSVP_Link, InviteSent, InviteSentDate, RSVP_Status, RSVP_Date, Notes
- Secrets: googleClientId stored in localStorage only — never hardcode. Claude API key in contactscout uses sessionStorage.

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