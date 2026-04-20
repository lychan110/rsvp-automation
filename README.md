# Invite Automation Suite

Two standalone browser apps for researching event contacts and sending personalized invitations.

| App | File | Purpose |
|-----|------|---------|
| **ContactScout** | `contactscout.html` | Research, verify, and scan elected officials (or any contacts). Export a verified list. |
| **InviteFlow** | `inviteflow.html` | Compose and send personalized invite emails via Gmail. Track RSVP status. |

No installation, no build step. Open either file directly in a browser.

---

## Workflow

```
ContactScout → Export → InviteFlow → Gmail → Track RSVPs
```

1. **ContactScout**: Scan your jurisdiction for elected officials using the Claude API + web search. Verify existing contacts are still in office. Export as JSON.
2. **InviteFlow**: Import the JSON from ContactScout (or a CSV). Configure your event (name, date, venue, RSVP link). Preview and send personalized emails via Gmail one by one or in bulk.

---

## ContactScout

**Open `contactscout.html` in a browser.**

### Setup
- Click **⚙ Key** in the top-right to enter your Anthropic API key. It is stored in `sessionStorage` only (cleared when you close the tab).
- The app starts with an empty contacts list. Use the **＋ Scan for New** tab to discover officials, or add manually.

### Customizing for your jurisdiction
Edit the `SCAN_TARGETS` and `SCAN_PROMPTS` arrays at the top of the `<script>` block:

```js
const SCAN_TARGETS = [
  {id:"us-congress", label:"US Congress — all seats", desc:"All current US reps + senators for your state"},
  // Add or replace entries for your state/city
];

const SCAN_PROMPTS = {
  "us-congress": "Search for every current [YOUR STATE] US Congress member...",
  // Update prompts with your state/city name
};
```

### Export
- **↓ CSV** — spreadsheet-friendly export of all contacts
- **⬡ Export → InviteFlow** — exports `contactscout-invitees-YYYY-MM-DD.json` for import into InviteFlow

---

## InviteFlow

**Open `inviteflow.html` in a browser.**

### Tabs

| Tab | What it does |
|-----|-------------|
| **✉ Invite** | Preview emails per invitee. Send via Gmail (opens compose window). Track sent/skipped status. |
| **👥 Invitees** | Import from ContactScout JSON or CSV. Add manually. Export CSV. |
| **⚙ Settings** | Configure event name, date, venue, RSVP link, contact info, org name, and images. |

### Importing contacts
- **From ContactScout**: Invitees tab → "Import from ContactScout" → select the `.json` file
- **From CSV**: Invitees tab → "Import CSV" — auto-maps common field names (`email`, `office email`, `direct email`, `name`, `title`, `category`)

### Email template placeholders

The email template uses `{{Placeholder}}` tokens replaced at send time:

| Token | Source |
|-------|--------|
| `{{FirstName}}`, `{{LastName}}` | Invitee name |
| `{{RSVP_Link}}` | Settings → RSVP Link |
| `{{EventName}}`, `{{FullTitle}}` | Settings → Event fields |
| `{{EventDate}}`, `{{Venue}}` | Settings → Event fields |
| `{{VIPStart}}`, `{{VIPEnd}}` | Settings → VIP time window |
| `{{OrgName}}`, `{{ContactName}}` | Settings → Org / contact fields |
| `{{ContactEmail}}`, `{{ContactTitle}}` | Settings → Contact fields |
| `{{Date_Sent}}` | Auto-generated (today's date) |

### Profile save/load
- **Export Profile** (Settings tab) — saves full event config + invitee list as a `.json` file
- **Import Profile** (Settings tab) — restores a previously exported profile

---

## Google Apps Script (optional)

`scripts/general_user_workflow.gs` provides a Google Sheets integration for tracking invite status and syncing RSVP responses from a Google Form:

- Adds an "Invite Workflow" menu to your Google Sheet
- **Generate RSVP Links** — creates unique prefilled form URLs per invitee
- **Send Invites** — logs send status back to the sheet
- **Sync RSVPs** — merges form responses into the master invitee sheet

See `docs/GOOGLE_SHEETS_SETUP.md` for setup instructions.

---

## Sample data

- `data/sample_invitees.csv` — example invitee list for testing InviteFlow import
- `data/form_responses.csv` — example Google Form export for testing response sync

---

## Deployment

Both apps are static HTML files. To host publicly:

1. Enable **GitHub Pages** on the `main` branch (root `/`)
2. Add an `index.html` landing page linking to both apps
3. Access via `https://your-username.github.io/repo-name/contactscout.html`

> **CORS note**: The Claude API requires the header `anthropic-dangerous-direct-browser-access: true` for direct browser calls. This is already set in `contactscout.html`. Some browsers or corporate proxies may block this.
