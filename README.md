# InviteFlow v4.1.0

> Event invitation management — no Google account required

InviteFlow is a **local-first** single-page application for managing VIP event invitations. All data lives in your browser (IndexedDB); email is sent via Resend. No backend server, no Google account needed.

---

## API Keys Setup

InviteFlow requires one **required** API key and supports two **optional** keys for enhanced features.

### Required

**Resend** — Sends invitation emails

1. Go to [resend.com](https://resend.com) — sign up (free, 3,000 emails/month)
2. API Keys → Create key
3. Copy the key

Add to `.env`:
```
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Optional

**LiteLLM** — AI-powered official discovery (Discover page)

1. Run a LiteLLM proxy locally or use a hosted endpoint
2. Get your API key from the provider (Anthropic, OpenAI, etc.)

Add to `.env`:
```
VITE_LITELLM_API_KEY=sk-xxxxxxxxxxxxx
VITE_LITELLM_ENDPOINT=http://127.0.0.1:4000/v1
```

**SerpAPI** — Web search for official discovery

1. Go to [serpapi.com](https://serpapi.com) — sign up
2. Copy your API key

Add to `.env`:
```
VITE_SERPAPI_KEY=xxxxxxxxxxxxxxxxxxxx
```

---

## How It Works

| Feature | Implementation |
|---------|----------------|
| Data storage | Dexie.js (IndexedDB) — all data stays in your browser |
| Data sync | CSV/JSON import/export via Sync tab |
| Email sending | Resend API — no Gmail account needed |
| Official discovery | LiteLLM + SerpAPI (optional) |
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