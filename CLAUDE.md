# Invite Automation Suite — Claude Guide

## Architecture
Two self-contained vanilla JS HTML apps. No build step. No dependencies.

## contactscout.html (~30 KB)
- State object `S`: { officials[], newOfficials[], scanStatus{}, scanMeta{}, apiKey, unsaved }
- Key functions: render(), upd(), callClaude(), saveState(), loadState(), exportProfile(), importProfile()
- Persistence: localStorage key `contactscout_state`
- API key: sessionStorage key `cs_api_key`
- Export filenames: `contactscout-backup-YYYY-MM-DD.json`, `contactscout-invitees-YYYY-MM-DD.json`

## inviteflow.html (~45 KB)
- State object `S`: { event{}, invitees[], tab }
- Key functions: render(), buildEmail(), saveState(), loadState(), clearSavedState()
- Persistence: localStorage key `inviteflow_state`
- Template tokens: {{FirstName}}, {{LastName}}, {{EventName}}, {{EventDate}}, {{Venue}}, {{RSVP_Link}}, {{FullTitle}}, {{OrgName}}, {{ContactName}}, {{ContactEmail}}, {{VIPStart}}, {{VIPEnd}}
- Tabs: invite, invitees, settings

## Conventions
- Single `<script>` block per file, state at top, render() called on every mutation
- saveState() called at end of render()
- No frameworks, no imports, no fetch except Claude API (contactscout only)