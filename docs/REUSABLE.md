# Reusable Configuration Guide

The system is **completely generic** and works for any event. All configuration happens in a single `Config` sheet—no code changes needed.

## How reusability works

### Same Apps Script, different events

The `general_user_workflow.gs` script reads all event-specific data from the Config sheet. This means:

- **One script** for all events
- **One copy per Google Sheet** (one sheet per event)
- **Different Config sheets** for each event

### Reusing the system

To run the workflow for a new event:

1. Create a **new Google Sheet** for the new event
2. Go to Extensions → Apps Script
3. Copy `scripts/general_user_workflow.gs` (same code)
4. Go back and create a `Config` sheet with the new event's settings
5. Done. The new Config sheet drives the new event's workflow.

## Column and field customization

The Config sheet lets you map **any column names** to the system:

### Master sheet columns (your invitee list)

You can name these columns anything:

```
Config sheet:
column_first_name     → Fred
column_last_name      → Flintstone
column_email          → Contact Email
column_rsvp_link      → Personalized URL
column_invite_sent    → Email Delivered
column_rsvp_status    → Attendance
column_rsvp_timestamp → Responded On
```

Your actual invitee sheet columns:
```
Fred | Flintstone | Contact Email | Personalized URL | Email Delivered | Attendance | Responded On
```

### Form response sheet columns (your Google Form responses)

Similarly, the form response columns can have any names:

```
Config sheet:
response_email_field       → Email Address
response_status_field      → Will You Attend?
response_timestamp_field   → Submission Time
```

Your actual form response sheet:
```
Email Address | Will You Attend? | Submission Time
```

The Config sheet maps these arbitrary names to the internal logic.

---

## Example: Conference Event

**Master sheet columns:**
```
FirstName | LastName | Email | Company | Title | Ticket Type | RSVP Link | Sent | Status | Timestamp
```

**Config:**
```
column_first_name         → FirstName
column_last_name          → LastName
column_email              → Email
column_rsvp_link          → RSVP Link
column_invite_sent        → Sent
column_rsvp_status        → Status
column_rsvp_timestamp     → Timestamp

response_email_field      → Email
response_status_field     → Attendance (Yes/No/Maybe)
response_timestamp_field  → Timestamp
```

---

## Example: Wedding Event

**Master sheet columns:**
```
Guest First | Guest Last | Email | Plus Ones | RSVP Link | Sent | RSVP | Response Date
```

**Config:**
```
column_first_name         → Guest First
column_last_name          → Guest Last
column_email              → Email
column_attendees          → Plus Ones
column_rsvp_link          → RSVP Link
column_invite_sent        → Sent
column_rsvp_status        → RSVP
column_rsvp_timestamp     → Response Date

response_email_field      → Email
response_status_field     → Coming? (Yes/No/Maybe)
response_timestamp_field  → Submitted
```

---

## Example: Corporate Holiday Party

**Master sheet columns:**
```
Staff Name | Work Email | Department | Guests | Link | Sent? | Coming? | Responded
```

**Config:**
```
column_first_name         → Staff Name
column_email              → Work Email
column_attendees          → Guests
column_rsvp_link          → Link
column_invite_sent        → Sent?
column_rsvp_status        → Coming?
column_rsvp_timestamp     → Responded

response_email_field      → Email
response_status_field     → RSVP
response_timestamp_field  → Timestamp
```

---

## Why this is reusable

1. **No code changes** — configuration lives in sheets, not scripts
2. **Dynamic column mapping** — works with any column names
3. **Any email text** — configure subject, intro, outro per event
4. **Any form structure** — map to whatever fields your form uses
5. **Any invitee fields** — no required columns beyond email

---

## Template reusability (bonus)

While the current system uses plain-text emails, you could extend it to use HTML templates by:

1. Storing template paths in the Config sheet
2. Reading from `html/af_templates/` or any folder
3. Rendering with Jinja2 or similar

This would let you have different email aesthetics per event while keeping the same code.

---

## Going beyond: Multi-event management

To manage multiple events in one workbook:

1. Create separate sheets for each event (Master_Event1, Master_Event2, etc.)
2. Create separate response sheets (Form Responses 1, Form Responses 2, etc.)
3. Create separate Config sheets (Config_Event1, Config_Event2, etc.)
4. Create a switch script that lets you pick which event to work with

This is advanced, but the foundation is already there for any team that wants it.
