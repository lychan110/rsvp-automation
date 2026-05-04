# InviteFlow v4.1.0

> Event invitation management for Google Workspace — by Lenya Chan

InviteFlow v4.1.0 is a **serverless**, single-page application for managing VIP event invitations. It runs entirely in the browser against Google APIs — no backend server, no database to maintain. Guest data lives in Google Sheets; event configs live in Google Drive's `appDataFolder`.

---

## Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Component model handles 200+ guest DataTable; Vite gives fast HMR; TS catches errors early |
| UI | PrimeReact | Production-grade DataTable with virtual scroll, filter, sort, export |
| Rich text | TipTap (starter kit only) | Headless, React-native, `{{placeholder}}` merging |
| Auth | OAuth 2.0 PKCE via Google Identity Services | Browser-only, no server-side secret |
| Persistence | Google Sheets | Primary key = Email; non-tech users already live here |
| Config storage | Google Drive `appDataFolder` | Per-event JSON configs, hidden from user's Drive UI |
| Email | Gmail API | 100 quota units/send; exponential backoff on 429 |
| RSVP ingest | Google Apps Script `onFormSubmit` | Lightweight trigger writes one row; no complex logic |
| Deployment | GitHub Pages | Static, no server |

### Stack decisions challenged

**Web Workers (template merge):** Omitted. Merging 200 templates takes <50 ms on the main thread — Web Workers add build complexity and message-passing overhead with zero user-visible benefit at this scale.

**GAS scope:** Limited to RSVP ingest only (one trigger function, one Sheets row write). All send/sync logic stays browser-side where it is debuggable and fast to iterate.

**TipTap extensions:** Starter kit only. No additional extensions unless a specific feature demands them — each extension adds ~30 KB and a maintenance surface.

**Gmail rate limiting:** Sends are capped at 80/min (conservative below the 100-unit/send × 15k-unit/min quota). Between batches the UI shows estimated time remaining.

---

## Current Features

- **Event management** — Create, update, and manage multiple events with custom details (name, date, venue, contact info).
- **Official discovery** — Integrated Discover page powered by LiteLLM + SerpAPI for finding elected officials (Congress, State, City) with web-grounded search results.
- **Contact import** — Import guest lists from Google Sheets or discover officials directly into your event.
- **Personalized emails** — Compose rich-text invitations using `{{template tokens}}` (FirstName, EventDate, Venue, etc.) with live preview.
- **Gmail integration** — Send personalized invites directly from your Gmail account with automatic batching and rate-limit handling.
- **RSVP tracking** — Connect Google Forms to track responses automatically; monitor attendance status in real-time.
- **Data export** — Export guest lists as JSON (InviteFlow format) or CSV; import backups to restore state.
- **Serverless architecture** — Runs entirely in the browser; no backend server or database required. All data lives in your Google account.

---

## Quick Start (local dev)

```bash
npm install
npm run dev        # Vite dev server → http://localhost:5173/inviteflow.html
```

## Deploy to GitHub Pages

```bash
npm run deploy     # vite build → copy static files → gh-pages publish
```

`index.html` is copied into `dist/` alongside the built `inviteflow.html` before publishing to the `gh-pages` branch.

---

## Project Structure

```
src/
  inviteflow/     # Main InviteFlow app (events, compose, send, tracker)
  scout/          # Official discovery engine (LiteLLM + SerpAPI)
gas/              # Google App Scripts
```

---

## Template Tokens

`{{FirstName}}` `{{LastName}}` `{{FullName}}` `{{EventName}}` `{{EventDate}}` `{{Venue}}` `{{RSVP_Link}}` `{{FullTitle}}` `{{OrgName}}` `{{ContactName}}` `{{ContactEmail}}` `{{VIPStart}}` `{{VIPEnd}}` `{{Date_Sent}}`

---

## Google Sheets Schema

Master sheet columns (in order):

| Column | Description |
|---|---|
| FirstName | Guest first name |
| LastName | Guest last name |
| Title | Official title |
| Category | e.g. Congress, State Senate, City Council |
| Email | Primary key |
| RSVP_Link | Pre-filled Google Form URL |
| InviteSent | TRUE / FALSE |
| InviteSentDate | ISO date string |
| RSVP_Status | Attending / Declined / No Response |
| RSVP_Date | ISO date string |
| Notes | Free text |

---

## OAuth Scopes

| Scope | Purpose |
|---|---|
| `https://www.googleapis.com/auth/spreadsheets` | Read/write guest Sheets |
| `https://www.googleapis.com/auth/gmail.send` | Send invite emails |
| `https://www.googleapis.com/auth/drive.appdata` | Store event configs |
