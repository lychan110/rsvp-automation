# InviteFlow v4.1.0

> Event invitation management — no Google account required

InviteFlow is a **local-first** single-page application for managing VIP event invitations. All data lives in your browser (IndexedDB); email is sent via Resend. No backend server, no Google account needed.

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173/inviteflow.html` in your browser.

Add your Resend API key in `.env`:
```
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx
```

---

## How It Works

| Feature | Implementation |
|---------|----------------|
| Data storage | Dexie.js (IndexedDB) — all data stays in your browser |
| Data sync | CSV/JSON import/export via Sync tab |
| Email sending | Resend API — no Gmail account needed |
| RSVP tracking | Google Apps Script (optional) — writes responses to a Sheet |

---

## The Workflow

1. **Setup** — Create an event with name, date, venue, contact info
2. **Invitees** — Add guests manually or import from CSV/JSON
3. **Compose** — Write your invite using `{{FirstName}}`, `{{EventDate}}`, etc.
4. **Send** — Send test first, then bulk send to all guests
5. **Track** — Monitor RSVPs (if using Google Form for responses)

---

## Template Tokens

| Token | Replaces |
|-------|----------|
| `{{FirstName}}` | Guest's first name |
| `{{LastName}}` | Guest's last name |
| `{{FullName}}` | First + Last combined |
| `{{EventName}}` | Your event name |
| `{{EventDate}}` | Event date |
| `{{Venue}}` | Venue name |
| `{{RSVP_Link}}` | Pre-filled RSVP form link |
| `{{FullTitle}}` | Guest's title |
| `{{OrgName}}` | Organization name |
| `{{ContactName}}` | Your name |
| `{{ContactEmail}}` | Your email |
| `{{VIPStart}}` | VIP window start |
| `{{VIPEnd}}` | VIP window end |
| `{{Date_Sent}}` | Date invite was sent |

---

## Data Backup

All data is in your browser. To back up:
- Go to **Sync** tab → **Export** → Download CSV
- Or go to **Settings** → **Export all data** → Download JSON

To restore: **Sync** tab → **Import** → Upload your backup

---

## Tech Stack

- React 18 + TypeScript + Vite
- PrimeReact (DataTable)
- TipTap (rich text editor)
- Dexie.js (IndexedDB)
- Resend (email delivery)

---

## Project Structure

```
src/inviteflow/     # Main app
  api/              # Storage (Dexie), email (Resend)
  components/       # UI primitives
  pages/            # Route pages
  tabs/             # Tab components
  state/            # AppContext + reducer
gas/                 # Google Apps Script for RSVP (optional)
docs/               # Documentation
```