# Automate Invite Emails

A fully reusable, configuration-driven system for sending personalized event invitations and tracking RSVP responses using Google Sheets, Forms, and Apps Script.

**Works for any event, any invitee list, and any RSVP form—no code editing required.**

## Quick Start

1. **Copy the script** from `scripts/general_user_workflow.gs` into your Google Sheet (Extensions → Apps Script)
2. **Create a Config sheet** with your event details (form URL, email text, sheet names, column mappings)
3. **Click menu buttons** to generate links, send invites, and sync responses

See [docs/QUICKSTART.md](docs/QUICKSTART.md) for the complete step-by-step guide.

## What this repo contains

- `scripts/general_user_workflow.gs` — one-click workflow (copy into Apps Script)
- `docs/QUICKSTART.md` — step-by-step setup guide for any event
- `config/` — example configurations for different event types
- `src/automate_invite_emails/` — optional Python CLI for offline use
- `html/af_templates/` — email template examples

## How it works

### Google Sheets + Forms + Apps Script (one-click)

1. **Config sheet** — define your event settings, column names, form fields
2. **Generate RSVP Links** — creates unique prefilled form URLs for each invitee
3. **Send Invites** — emails all invitees with their personalized RSVP links
4. **Sync RSVPs** — reads form responses and updates your master sheet

Everything is driven from the Config sheet. No coding required.

### Optional: Streamlit GUI

```bash
uv run python -m streamlit run ui/app.py
```

### Optional: Python CLI (for preview/offline)

```bash
# Generate links locally
python main.py generate-links --config config/default.json --input data/sample_invitees.csv --output output.csv

# Preview an email
python main.py preview-email --input output.csv --template html/af_templates/template.html

# Sync responses from CSV export
python main.py sync-responses --master data/sample.csv --responses data/responses.csv --output data/updated.csv
```

## Key features

- ✅ **Fully configurable** — all settings in a Config sheet (no code editing)
- ✅ **Reusable for any event** — change templates, forms, columns as needed
- ✅ **No dependencies** — works directly in Google Sheets
- ✅ **Persists invite status** — prevents duplicate emails
- ✅ **Auto-syncs responses** — updates RSVP status and timestamp
- ✅ **Personalized links** — each invitee gets their own prefilled form URL

## Typical workflow

1. **Setup** (once): Copy script → Create Config sheet → Set event details
2. **Send**: Generate Links → Send Invites
3. **Monitor**: Sync RSVPs (run hourly or daily as responses come in)
4. **Track**: Watch RSVP_Status column in your master sheet

## Configuration

All configuration happens in a single `Config` sheet with key-value pairs:

| Setting | Example Value |
|---------|---------------|
| event_name | Asia Fest 2026 |
| form_prefill_url | https://docs.google.com/forms/d/e/.../viewform?... |
| email_subject | You're Invited! |
| email_intro | Hi {{FirstName}}, you're invited! |
| email_outro | We look forward to seeing you. |
| master_sheet_name | Master |
| responses_sheet_name | Form Responses 1 |
| column_first_name | FirstName |
| column_email | Email |
| column_rsvp_link | RSVP_Link |
| column_rsvp_status | RSVP_Status |
| response_email_field | Email |
| response_status_field | RSVP |
| response_timestamp_field | Timestamp |

See `config/example_configs.json` for example configurations for conferences, weddings, and corporate events.

## Examples

Check `config/example_configs.json` for sample configurations:
- **Conference** — tech conference with registration tracking
- **Wedding** — wedding invitation with plus-ones
- Or create your own for any event type

## Limitations

- Email content is plain text (no rich HTML formatting)
- Uses Gmail API via Apps Script (requires Google Account)
- Response sync must be run manually (not automatic)
- Limited to Google Sheets + Forms (by design for simplicity)

## License

MIT

## Contact

For questions or contributions, see the repository.
