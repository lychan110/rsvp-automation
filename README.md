# InviteFlow Suite
**Lenya Chan** · v02

Two standalone browser apps for researching event contacts and sending personalized invitations. No installation, no build step, no server — open either file directly in a browser.

| App | File | Purpose |
|-----|------|---------|
| **ContactScout** | `contactscout.html` | Research, verify, and discover contacts using the Claude API + live web search. Export a verified contact list. |
| **InviteFlow** | `inviteflow.html` | Compose and send personalized invite emails via Gmail. Track RSVP status. |

---

## Workflow

```
ContactScout → Export JSON → InviteFlow → Gmail → Track RSVPs
```

1. **ContactScout**: Scan for contacts by category using the Claude API + web search. Verify existing contacts are still active. Export as JSON.
2. **InviteFlow**: Import the JSON from ContactScout (or a CSV). Configure your event details, compose your email, and send via Gmail. Track RSVP responses.

---

## ContactScout

**Open `contactscout.html` in a browser.**

### Setup
- Click **⚙ Key** in the top-right to enter your Anthropic API key. It is stored only in your browser session (`sessionStorage`) and never sent anywhere except the Anthropic API.
- The app starts with an empty contact list. Use the **Discover New** tab to scan for contacts, or add manually.

### Customizing for your use case
Edit the `SCAN_TARGETS`, `SCAN_PROMPTS`, and `CATS` arrays near the top of the `<script>` block to describe your contact groups and search queries:

```js
const SCAN_TARGETS = [
  {id:'group-a', label:'Group A — Category 1', desc:'Describe the contacts here'},
  // ...
];

const SCAN_PROMPTS = {
  'group-a': 'Search for all current contacts in [GROUP] for [YOUR ORG] as of 2025...',
  // ...
};

const CATS = ['All', 'Category A', 'Category B', ...];
```

### Export
- **↓ CSV** — spreadsheet-friendly export of all contacts
- **Export → InviteFlow** — exports `contactscout-invitees-YYYY-MM-DD.json` for import into InviteFlow

---

## InviteFlow

**Open `inviteflow.html` in a browser.**

### Tabs (5)

| Tab | What it does |
|-----|-------------|
| **⚙ Settings** | Configure event details, email settings, Google OAuth, Google Sheets URLs, RSVP form prefill, images, and saved configs. |
| **👥 Contacts** | Import from Google Sheets, ContactScout JSON, or CSV. Add manually. View send/RSVP status. |
| **✉ Email** | Edit the HTML or plain-text email template. Live preview per invitee. |
| **▶ Send** | Send via Gmail API (bulk or one-by-one). Progress tracking. Manual Gmail fallback. |
| **📊 Track** | RSVP stats, response breakdown chart, sync from Google Form response sheet, sync to master sheet. |

### Importing contacts
- **From ContactScout**: Contacts tab → "From ContactScout" → select the `.json` file
- **From CSV**: Contacts tab → "↑ CSV" — auto-maps common field names (`email`, `name`, `title`, `category`)
- **From Google Sheets**: Contacts tab → "From Sheet" (requires Google OAuth)

### Email template tokens

| Token | Source |
|-------|--------|
| `{{FirstName}}`, `{{LastName}}` | Invitee name |
| `{{RSVP_Link}}` | Auto-generated prefilled form URL (or Settings → RSVP Link) |
| `{{EventName}}`, `{{FullTitle}}` | Settings → Event fields |
| `{{EventDate}}`, `{{Venue}}` | Settings → Event fields |
| `{{VIPStart}}`, `{{VIPEnd}}` | Settings → Guest program time window |
| `{{OrgName}}`, `{{ContactName}}` | Settings → Org / contact fields |
| `{{ContactEmail}}`, `{{ContactTitle}}` | Settings → Contact fields |
| `{{Date_Sent}}` | Auto-generated (today's date) |

### Profile save/load
- **↓ Profile** (header) — saves full event config + invitee list as `inviteflow-YYYY-MM-DD.json`
- **↑ Load** (header) — restores a previously exported profile
- **Saved Configs** (Settings tab) — save/load named event configuration presets (without invitee data)

---

## Google Integration (optional)

Required for Gmail send and Google Sheets sync.

### Setup
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application type)
3. Add your deployment URL (e.g. `https://your-username.github.io`) and `http://localhost` as authorized JavaScript origins
4. Enable the **Gmail API** and **Google Sheets API** in the project
5. Paste the Client ID in InviteFlow → Settings → Google Integration

### What it enables
- **Import from Sheet**: pull invitees from a Google Sheets spreadsheet
- **Sync to Master Sheet**: write all invite/RSVP status back to a tracking sheet
- **Sync RSVP Responses**: read a Google Form response sheet and match by email
- **Send via Gmail**: send personalized emails through your Gmail account

---

## Deployment

Both apps are static HTML files. Serve them from any static host.

**GitHub Pages** (recommended):
1. Repo Settings → Pages → Source: branch `master`, folder `/ (root)`
2. Save — the site goes live in ~1 minute

**Live URLs** (once Pages is enabled):
- `https://YOUR-USERNAME.github.io/REPO-NAME/`
- `https://YOUR-USERNAME.github.io/REPO-NAME/contactscout.html`
- `https://YOUR-USERNAME.github.io/REPO-NAME/inviteflow.html`

> **CORS note**: The Claude API requires the header `anthropic-dangerous-direct-browser-access: true` for direct browser calls. This is already set in `contactscout.html`. Some corporate proxies may block this.

---

## Design

- **Theme**: Light, warm neutral palette (Fraunces display font + Outfit body font)
- **Layout**: Mobile-first adaptive — works on 375px phones, scales to desktop
- **Mobile**: Bottom navigation bar; scrollable content; no horizontal scroll
- **Desktop**: Top tab bar; fixed-height panel layout with log sidebar
- **No frameworks, no build step** — vanilla HTML/CSS/JS, single `<script>` block per file
