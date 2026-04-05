# Automated RSVP Workflow with Google Tools

Yu-Chin Chan (<lychan115@gmail.com>)

You can build a fully automated Google‑based workflow where:
- Each invitee receives a personalized email body (no attachments).
- The email contains a unique RSVP link that pre‑fills their name/email.
- All responses flow into a single Google Sheet that becomes your live tracker.
- Everything runs from Google Sheets + Google Docs + Google Forms + Apps Script, all free.
- The structure below gives you a clean, maintainable system your whole org can collaborate on.

## 🌿 Core architecture

You’ll use four coordinated pieces:
- Google Sheet — master list of invitees + status
- Google Form — RSVP form with prefilled parameters
- Google Apps Script — generates personalized email bodies and sends them
- Gmail — delivers the invitations
- The Sheet becomes your single source of truth: invite sent, RSVP status, timestamp, notes.

### 📄 Step 1: Build your Google Sheet (the database)

Create columns:

```
FirstName
LastName
Email
Mailing Address
Number of Attendees
RSVP_Link
InviteSent (TRUE/FALSE)
RSVP_Status (Yes/No/Maybe)
RSVP_Timestamp
```

Keep this Sheet in a shared Drive so your org can collaborate.


### 📝 Step 2: Create your Google Form (the RSVP collector)

Add fields:

```
Name (Short answer)
Email (Short answer)
Number of Attendees (Short answer or Dropdown)
Mailing Address (Paragraph, optional)
RSVP (Multiple choice: Yes / No / Maybe)
Any other fields you want (dietary restrictions, etc.)
```

Generate a prefilled link
1. Open the Form → three dots → Get pre-filled link.
2. Enter placeholder text (e.g., “FIRSTNAME LASTNAME” and “EMAIL”).
3. Click Get link.

You’ll get a URL like: `https://docs.google.com/forms/d/e/.../viewform?usp=pp_url&entry.12345=FIRSTNAME+LASTNAME&entry.67890=EMAIL`


Copy this. You’ll use Apps Script to replace the placeholders with real names.

### ✉️ Step 3: Write your email template (in the Sheet or a Doc)

Use placeholders like:

```
Hi {{FirstName}},

You’re invited to our event!
Please RSVP using your personalized link:
{{RSVP_Link}}

We look forward to seeing you.
```

You can store this in a Google Doc or directly in Apps Script.

### ⚙️ Step 4: Add Apps Script to automate everything

**For most users, use the config-driven approach:**

1. Open your Sheet → Extensions → Apps Script
2. Copy the contents of `scripts/general_user_workflow.gs`
3. Click Save
4. Refresh your Sheet
5. Create a new sheet called `Config`
6. In the Config sheet, add your settings (see `config/sample_config_sheet.json` for a template)
7. Use the `Invite Workflow` menu to generate links, send invites, and sync responses

That's it. No code editing needed. The `general_user_workflow.gs` script reads all configuration from the Config sheet.

### 📥 Step 5: Automatically track RSVPs

Once your Google Form is attached to a response sheet named `Form Responses 1`, use the `VIP Invite -> Sync RSVPs` menu item.

That function will:
- read the form response rows
- match responses by `Email`
- update `RSVP_Status`
- update `RSVP_Timestamp`

This keeps your master invite sheet current without running Python locally.

Your Google Form already writes responses to a Sheet.

To sync them back to your master invite list:
1. Open the Form’s response Sheet.
2. Use VLOOKUP or a small Apps Script to match by email and update:
```
RSVP_Status
RSVP_Timestamp
```

Example script:
```js
function syncRSVPs() {
  const master = SpreadsheetApp.getActive().getSheetByName("Master");
  const rsvps = SpreadsheetApp.getActive().getSheetByName("Form Responses 1");
  const masterData = master.getDataRange().getValues();
  const rsvpData = rsvps.getDataRange().getValues();

  let emailToRSVP = {};
  for (let i = 1; i < rsvpData.length; i++) {
    emailToRSVP[rsvpData[i][1]] = {
      status: rsvpData[i][4],
      timestamp: rsvpData[i][0]
    };
  }

  for (let i = 1; i < masterData.length; i++) {
    let email = masterData[i][2];
    if (emailToRSVP[email]) {
      master.getRange(i + 1, 8).setValue(emailToRSVP[email].status);
      master.getRange(i + 1, 9).setValue(emailToRSVP[email].timestamp);
    }
  }
}
```

Run this manually or set it to run every 15 minutes.

This setup ensures you can track the number of attendees along with mailing addresses and comments efficiently.