# Quick Start Guide

## For Non-Technical Users

Follow this step-by-step to set up the workflow in Google Sheets. This workflow works for **any event, any template, and any form**.

### ✅ Step 1: Prepare Your Data

1. Create a Google Sheet with your invitee list
2. Add columns for invitee information (can be named anything—you'll map them in Config)
   - First name
   - Last name
   - Email address
   - Optional: mailing address, number of attendees

### ✅ Step 2: Create a Google Form

1. Create a Google Form with RSVP fields (exactly what you want people to submit)
   - Name
   - Email
   - RSVP status (e.g., Yes/No/Maybe)
   - Any other fields (dietary restrictions, comments, etc.)

2. **Important:** The form must auto-create a response sheet. After submission, responses will appear in a sheet (usually named `Form Responses 1`)

3. Get the **pre-filled link**:
   - Click **⋮** (three dots) → **Get pre-filled link**
   - Leave placeholders for Name and Email with values like `FIRSTNAME+LASTNAME` and `EMAIL`
   - Click Get link
   - Copy the **entire URL**

### ✅ Step 3: Set Up Apps Script

1. Open your invitee Google Sheet
2. Go to **Extensions → Apps Script**
3. Copy the entire code from [scripts/general_user_workflow.gs](../scripts/general_user_workflow.gs)
4. Paste it into the Apps Script editor
5. Click **Save** ✅

### ✅ Step 4: Create a Config Sheet

1. Go back to your Sheet
2. Click the **+** tab at the bottom to add a new sheet
3. Name it exactly `Config` (case-sensitive)
4. In the Config sheet, you'll create a mapping table with two columns:

| Column A (Setting)             | Column B (Value)                              |
|--------------------------------|----------------------------------------------|
| event_name                     | Your Event Name                              |
| form_prefill_url               | (paste your form prefill URL from Step 2)    |
| email_subject                  | You're Invited!                              |
| email_intro                    | Hi {{FirstName}}, you're invited!            |
| email_outro                    | We look forward to seeing you.               |
| master_sheet_name              | Master                                        |
| responses_sheet_name           | Form Responses 1                              |
| response_email_field           | Email                                        |
| response_status_field          | RSVP                                         |
| response_timestamp_field       | Timestamp                                    |
| column_first_name              | FirstName                                    |
| column_last_name               | LastName                                     |
| column_email                   | Email                                        |
| column_rsvp_link               | RSVP_Link                                    |
| column_invite_sent             | InviteSent                                   |
| column_rsvp_status             | RSVP_Status                                  |
| column_rsvp_timestamp          | RSVP_Timestamp                               |

**What each field means:**

- `event_name` — Your event name (used for the workflow menu)
- `form_prefill_url` — The pre-filled Google Form URL from Step 2
- `email_subject` — Subject line for the invitation email
- `email_intro` — Opening line of email (use `{{FirstName}}` for personalization)
- `email_outro` — Closing line of email
- `master_sheet_name` — Name of your invitee list sheet (must exist)
- `responses_sheet_name` — Name of the form response sheet (`Form Responses 1` by default)
- `response_email_field` — Exact column name in the form responses sheet where emails are stored
- `response_status_field` — Exact column name in the form responses for RSVP status
- `response_timestamp_field` — Exact column name in the form responses for submission time
- `column_*` — Exact column names in your master invitee sheet

**Important:** The `column_*` and `response_*` values must match the actual column names as they appear in your sheets.

### ✅ Step 5: Customize Column Names (if needed)

If your sheets use different column names than the defaults, update the `column_*` and `response_*` fields in Config:

Example: if your master sheet has `Guest Email` instead of `Email`:
- Set `column_email` to `Guest Email`

Example: if your form response sheet has `Attending` instead of `RSVP`:
- Set `response_status_field` to `Attending`

### ✅ Step 6: Refresh and Use

1. Go back to your Sheet
2. **Refresh the page** (Ctrl+R or Cmd+R)
3. You should now see a menu called **"Invite Workflow"**

### ✅ Step 7: One-Click Workflow

The menu has these options:

- **📋 Setup Guide** — Opens helpful reference
- **🔗 Generate RSVP Links** — Creates personalized RSVP URLs for each invitee
- **✉️ Send Invites** — Emails all invitees from Gmail (marks them as sent)
- **📥 Sync RSVPs** — Reads form responses and updates your master sheet

**Click each button when ready.**

---

## Using for Different Events

To use this system for a new event:

1. **Create a new Google Sheet** for the new event (with a new invitee list)
2. **Create a new Google Form** for RSVP (with your own fields and styling)
3. **Copy the Apps Script code** into the new Sheet
4. **Create a new Config sheet** and customize the mappings for the new event

Everything is configured through the Config sheet—no code changes needed.

---

## Examples

See `config/example_configs.json` for sample configurations for:
- Conference events
- Wedding invitations
- Corporate events
- Any other gathering

---

## Troubleshooting

If you encounter an error:
1. Check that the Config sheet exists and is named exactly `Config`
2. Check that sheet names in Config match your actual sheet names (case-sensitive)
3. Check that column names in Config exactly match the columns in your sheets
4. Check that the form prefill URL is complete and correct
5. Open the browser console (F12 → Console) to see detailed error messages

---

## Notes

- **InviteSent** marks which invites have been sent (prevents duplicates)
- **RSVP_Status** updates automatically when you run Sync RSVPs
- **RSVP_Timestamp** records when each person submitted the form
- Change **InviteSent** to FALSE if you need to resend invites
