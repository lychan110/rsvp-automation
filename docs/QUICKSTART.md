# InviteFlow Quick Start Guide

## What is InviteFlow?

InviteFlow manages VIP event invitations end-to-end — from drafting personalized emails to tracking RSVPs. All data lives in your Google account (Sheets + Drive); nothing is stored on external servers.

---

## The 3-Step Workflow

### Step 1 — Create
Set up your event details (name, date, venue, org, contact info) and connect a Google Sheet that will hold your guest list. InviteFlow stores the config in your Google Drive.

### Step 2 — Compose
Write your invite email using `{{template tokens}}` — like `{{FirstName}}`, `{{EventDate}}`, or `{{Venue}}` — and InviteFlow will merge each guest's data before sending. No coding required.

### Step 3 — Send
InviteFlow sends personalized emails directly from your Gmail account, one batch at a time to stay within Google's rate limits. Track opens, RSVPs, and responses from the Tracker tab.

---

## Before You Start

### 1. Get a Google Client ID
InviteFlow uses Google OAuth to access your Gmail, Sheets, and Drive. You'll need a Client ID from the Google Cloud Console:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
4. Application type: **Web application**
5. Add an **Authorized JavaScript origin**: `http://localhost:5173` (for local dev)
6. Add an **Authorized redirect URI**: `http://localhost:5173` and your GitHub Pages URL
7. Copy the **Client ID** — it looks like: `123456789-abc.apps.googleusercontent.com`

### 2. Enter Your Client ID in InviteFlow
Go to **Settings → Client ID** and paste your Client ID, then save.

### 3. Authorize Google Services
In **Settings → Google OAuth**, click **Authorize** for each scope:
- **Gmail · Send** — required to send invite emails
- **Google Sheets** — required to read/write your guest list
- **Google Drive AppData** — required to save event configurations

### 4. Set Up Your Guest Sheet
Create a Google Sheet with these columns (in order):

`FirstName` · `LastName` · `Title` · `Category` · `Email` · `RSVP_Link` · `InviteSent` · `InviteSentDate` · `RSVP_Status` · `RSVP_Date` · `Notes`

> **Tip:** `Email` is the primary key — every guest needs a unique email address.

---

## Template Tokens Reference

| Token | What it replaces |
|---|---|
| `{{FirstName}}` | Guest's first name |
| `{{LastName}}` | Guest's last name |
| `{{FullName}}` | First + Last combined |
| `{{EventName}}` | Your event name |
| `{{EventDate}}` | Event date |
| `{{Venue}}` | Venue name |
| `{{RSVP_Link}}` | Pre-filled RSVP form link |
| `{{FullTitle}}` | Guest's title |
| `{{OrgName}}` | Organization name |
| `{{ContactName}}` | Your name (the contact) |
| `{{ContactEmail}}` | Your email |
| `{{VIPStart}}` | VIP window start |
| `{{VIPEnd}}` | VIP window end |
| `{{Date_Sent}}` | Date the invite was sent |

---

## Tips

- **Start small** — test with 3–5 guests before sending to your full list.
- **Preview before send** — use the Compose tab's preview to check merged emails.
- **Rate limiting** — InviteFlow sends in batches with a short delay between each to avoid hitting Gmail's quota limits.
- **RSVP tracking** — connect a Google Form to your RSVP_Link column and RSVPs will appear in the Tracker tab automatically.
- **Backup** — use Settings → Export all data to download a JSON backup of all your events and settings.
