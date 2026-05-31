# InviteFlow Quick Start

## What is InviteFlow?

InviteFlow manages VIP event invitations end-to-end — from drafting personalized emails to tracking RSVPs. All data stays in your browser or Google account; nothing is stored on external servers.

---

## The Workflow

### Step 1 — Create an Event

Go to the **Setup** tab. Fill in:
- Event name, date, venue
- Organization name
- Contact name and email (this is the "from" address for invites)

Save. Your event is now stored in your browser.

Optionally, you can also set up:
- Google Sheet URL for your guest list
- Google Form URL for RSVP tracking
- Image URL for emblem

### Step 2 — Add Invitees

Go to the **Invitees** tab. Add guests by:
- **Manually** — click the + button and fill in guest details
- **Import CSV** — click "Import CSV/JSON" and select a CSV file with columns: FirstName, LastName, Email, Title, Category, Notes
- **Import JSON** — upload a JSON file with invitee records

CSV format example:
```
FirstName,LastName,Title,Category,Email
John,Doe,Mayor,City,john@example.com
Jane,Smith,Senator,State,jane@example.com
```

Email is required for every guest.

### Step 3 — Compose Your Invite

Go to the **Compose** tab. Write your email template using {{template tokens}}:

```
Dear {{FirstName}},

You're invited to {{EventName}} on {{EventDate}} at {{Venue}}.

We'd love to have you join us. RSVP here: {{RSVP_Link}}

Best,
{{ContactName}}
```

Use **Preview** to check how emails will look with merged data before sending.

### Step 4 — Send Invitations

Go to the **Send** tab.

1. **Review checks** — verify sender email, template, and all recipients have emails
2. **Send** — click the send button to send invitations in batches
3. **Track** — monitor progress and failures in the send log

InviteFlow sends in batches with automatic delays to respect rate limits.

### Step 5 — Track RSVPs (Optional)

If you connected a Google Form for RSVPs:
1. Go to the Tracker tab to view RSVP statistics
2. See responses by category
3. Export data from Settings for further analysis

---

## Template Tokens

Use these tokens in your email template. InviteFlow will replace them with each guest's data:

| Token | Replaces with |
|-------|---|
| `{{FirstName}}` | Guest first name |
| `{{LastName}}` | Guest last name |
| `{{FullName}}` | First + Last |
| `{{EventName}}` | Event name |
| `{{EventDate}}` | Event date |
| `{{Venue}}` | Venue |
| `{{RSVP_Link}}` | RSVP form link |
| `{{FullTitle}}` | Guest title |
| `{{OrgName}}` | Organization |
| `{{ContactName}}` | Your name |
| `{{ContactEmail}}` | Your email |
| `{{VIPStart}}` | VIP window start time |
| `{{VIPEnd}}` | VIP window end time |
| `{{Date_Sent}}` | Send date |

---

## Data Management

### Exporting Data

- **Invitees tab** → "Export CSV" to download current event's guest list
- **Settings** → "Export all data" for a complete JSON backup of all events and settings

### Importing Data

- **Invitees tab** → "Import CSV/JSON" to add guests from a file
- Shows a preview before importing — merges with existing guests (no deletion)

### Clearing Data

- **Settings** → "Clear all data" to remove everything from browser storage

---

## Discover Officials (Optional)

Use the Discover page to find and verify elected officials for your jurisdiction.

### Setup

1. **Get a SerpAPI key** — Sign up at https://serpapi.com/ (free tier: 100 searches/month)
2. **Get an AI provider API key** — from OpenAI, Anthropic, or any OpenAI-compatible provider.
3. **Configure in Discover**:
   - Go to Discover tab → click Settings
   - Enter your API key, endpoint (defaults to `https://api.openai.com/v1`), and SerpAPI key
   - Set your jurisdiction: State, Counties, Cities
   - Keys are stored in session only — never persisted

### Scanning

- Select a scan target (US Congress, State Legislators, City Council, etc.)
- Click "Start Scan"
- Review results and select officials to add to your invitees
- Added officials' contact info merges into your guest list

---

## Tips

- **Start small** — test with 3–5 guests before your full list
- **Preview before send** — use Compose → Preview to check merged emails
- **Backup often** — export your data as JSON regularly
- **No cloud storage** — everything lives in your browser. Clear your cache = lose data. Export often!
- **Batch sending** — InviteFlow respects rate limits by sending in batches with delays
- **Google Forms integration** — connect a Google Form to {{RSVP_Link}} and responses populate the Tracker automatically
- **Discover for officials** — real-time web search grounds results so you find current contact info

---

## Troubleshooting

### "Data gone after refresh?"
This is expected — data is local to your browser. Import your JSON backup to restore.

### "Template tokens not replacing?"
Verify token names are exact (case-sensitive): `{{FirstName}}` not `{{firstname}}`.

### "CSV import failed?"
- Ensure CSV has a header row
- Check that the email column exists
- Verify proper CSV formatting (commas, quotes)

### "Discover not working?"
- Configure your API endpoint and key in Discover → Settings (must be an OpenAI-compatible endpoint)
- Set your jurisdiction (State field required)
- Verify SerpAPI key is set for web search scans

### "Emails not sending?"
- Verify all required setup fields are filled (contact name, contact email)
- Check that you have a composed email template
- Ensure all guests have email addresses

---

**Note:** This guide reflects the current app state. For the latest features, check the in-app Help tab.
