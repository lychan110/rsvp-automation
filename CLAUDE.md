# Invite Automation Suite — Claude Guide

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
- Tabs (7): Events, Setup, Invitees, Compose, Send, Tracker, Sync
- Master sheet columns: FirstName, LastName, Title, Category, Email, RSVP_Link, InviteSent, InviteSentDate, RSVP_Status, RSVP_Date, Notes
- Secrets: googleClientId stored in localStorage only — never hardcode. Claude API key in contactscout uses sessionStorage.

## Conventions
- Single `<script>` block per file, state at top, render() called on every mutation
- saveState() called at end of render()
- No frameworks, no imports, no fetch except Claude API (contactscout) + Google APIs (inviteflow)
- Google APIs called with OAuth2 Bearer token from getGoogleToken() — never API keys in source