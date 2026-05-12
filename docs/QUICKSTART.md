# InviteFlow Quick Start

## What is InviteFlow?

InviteFlow sends personalized event invitations and tracks RSVPs. All data stays in your browser — no Google account needed.

---

## Setup

### 1. Get a Resend API Key

InviteFlow uses Resend to send emails.

1. Go to [resend.com](https://resend.com) — sign up (free, 3,000 emails/month)
2. API Keys → Create key
3. Copy the key

### 2. Configure the App

Create or edit `.env` in the project root:
```
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 3. Run the App

```bash
npm install
npm run dev
```

Open `http://localhost:5173/inviteflow.html` in your browser.

---

## The Workflow

### Step 1 — Create an Event

Go to **Setup** tab. Fill in:
- Event name, date, venue
- Organization name
- Contact name, contact email (this is the "from" address for invites)

Save. Your event is now stored in your browser.

### Step 2 — Add Guests

Go to **Invitees** tab.
- **Add manually** — click + to add each guest
- **Import** — go to **Sync** tab → Import CSV or JSON

CSV format:
```
FirstName,LastName,Title,Category,Email
John,Doe,Mayor,City,john@example.com
```

### Step 3 — Compose Your Invite

Go to **Compose** tab. Write your email. Use template tokens:

```
Dear {{FirstName}},

You're invited to {{EventName}} on {{EventDate}} at {{Venue}}.

RSVP here: {{RSVP_Link}}

Best,
{{ContactName}}
```

Preview with any guest to see how it looks.

### Step 4 — Send

Go to **Send** tab.

1. **Test first** — Enter your email, click "Send Test Email"
2. **Confirm** — Check your inbox, then check "Confirm test received"
3. **Send bulk** — Now the "Send Bulk" button is enabled

The app sends in batches to respect Resend's rate limits.

### Step 5 — Track (Optional)

If you use a Google Form for RSVPs:
1. Create a Google Form
2. Add the form URL to your event's `formUrl` in Setup
3. Set up the included Google Apps Script to write responses to a Sheet
4. View responses in the Tracker tab

---

## Data Management

### Exporting Data

- **Sync tab** → Export CSV for current event's guest list
- **Settings** → Export all data (JSON backup)

### Importing Data

- **Sync tab** → Import CSV or JSON
- Shows a preview of what will be added/updated

### Clearing Data

- **Settings** → Clear all data — removes everything from browser storage

---

## Tips

- **Start small** — test with 3–5 guests before your full list
- **Preview** — use the Compose tab's preview to check merged emails
- **Backup** — regularly export your data as JSON
- **No cloud** — everything lives in your browser. Clear browser cache = lose data. Export often!

---

## Troubleshooting

### "Resend API key not configured"
- Add `VITE_RESEND_API_KEY` to your `.env` file

### Emails not sending
- Check your Resend API key is correct
- Check your "from" email is verified in Resend (resend.com → Domains)

### Data gone after refresh?
- This is expected — data is local to this browser. Import your JSON backup to restore.