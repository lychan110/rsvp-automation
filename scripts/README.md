# Scripts Directory

This folder contains native Google Apps Script code for a one-click RSVP workflow inside Google Sheets.

## Recommended: general_user_workflow.gs

Use this script for a fully configuration-driven, no-code setup:

1. Open your Google Sheet
2. Go to Extensions → Apps Script
3. Copy the contents of `general_user_workflow.gs` (this is the main script)
4. Also copy `utilities.gs` if needed (optional helper functions)
5. Save the script and refresh the Sheet
6. Create a new sheet named `Config`
7. In the Config sheet:
   - Column A: setting names (e.g., `form_prefill_url`, `master_sheet_name`)
   - Column B: values (e.g., your actual form URL, sheet names)
8. Use the `Invite Workflow` menu from the Sheet

Sample config values are in `config/sample_config_sheet.json`.

## Legacy files

- `vip_workflow.gs` — earlier version with hardcoded config
- `generateRSVPLinks.gs` — standalone utility for link generation
- `sendInvites.gs` — standalone utility for sending emails
- `utilities.gs` — shared utility functions

Use `general_user_workflow.gs` for new setups.

