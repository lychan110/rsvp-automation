# Google Sheets API Setup Guide

This guide walks through setting up Google Sheets API integration with the Event Invitation Manager.

FIXME: Google Cloud Console is a paid service! We can't afford that.

## What You'll Need

- A Google account with access to Google Cloud Console
- The invitees Google Sheet (you already have: `1NT-RjVTkA4Tnoy-pNDgwo6N5Br6eZ8FRbWhxRsZtHko`)
- The form responses Google Sheet (auto-created by Google Forms)

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click into the project dropdown at the top
3. Click **"New Project"** 
4. Enter a name like "Event Invitations"
5. Click **Create**
6. Wait for the project to be created

### 2. Enable Google Sheets API

1. In the Google Cloud Console, search for "Google Sheets API"
2. Click on **Google Sheets API**
3. Click the **Enable** button
4. You may see a prompt - if so, click "Enable" again

### 3. Create Service Account

1. In the Google Cloud Console, go to **APIs & Services → Credentials**
2. Click **+ Create Credentials**
3. Select **Service Account**
4. Fill in:
   - Service account name: `event-invitations`
   - Service account ID: (auto-filled)
   - Description: "For reading/writing invitee and RSVP data"
5. Click **Create and Continue**
6. Skip the optional steps, click **Done**

### 4. Generate Private Key

1. On the Service Accounts page, click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key → Create new key**
4. Select **JSON**
5. Click **Create**

A JSON file will download automatically. **Keep this file safe!**

### 5. Configure Service Account in App

1. In the app, go to the **Setup** tab
2. Scroll to **🔗 Google Sheets Integration**
3. Click **"Upload Service Account JSON"**
4. Select the JSON file you just downloaded
5. If successful, you'll see "✓ Google Sheets API authenticated"

### 6. Share Your Google Sheets with Service Account

You need to give the service account permission to access your sheets:

1. Open the JSON file you downloaded in a text editor
2. Find the `"client_email"` field - it looks like: `service-account-name@project-id.iam.gserviceaccount.com`
3. Copy that email address
4. Open your **Invitees Google Sheet**
5. Click **Share** (top right)
6. Paste the email address
7. Give it **Editor** permission
8. Do the same for your **Form Responses Sheet**

### 7. Link Your Sheets in the App

1. In the app Setup tab, under "Link Your Sheets"
2. Paste your **Invitees Sheet URL** 
   - Should look like: `https://docs.google.com/spreadsheets/d/1NT-RjVTkA4Tnoy-pNDgwo6N5Br6eZ8FRbWhxRsZtHko/edit`
3. Paste your **Form Responses Sheet URL**
   - (Same format, different sheet ID)
4. If both are valid, you'll see "✓ Both sheets linked"

### 8. Test the Connection

1. Go to the **Sync Responses** tab
2. Click **🔄 Fetch Latest Data**
3. If successful, you'll see the number of invitees and responses fetched

## Troubleshooting

### "Authentication Failed" Error

- Check that the JSON file contains `client_email`
- Make sure the service account email has **Editor** access to both sheets
- Try re-uploading the JSON file

### "Could not fetch invitees" Error

- Check the worksheet name in your invitees sheet
- The default is looking for "Sheet1" - if your sheet is named differently, go back to Setup and adjust (`sheet_name` parameter)
- Make sure service account has access to the sheet

### "Could not fetch responses" Error

- Google Forms automatically creates a sheet called "Form Responses"
- If your form responses sheet has a different name, you may need to adjust the code
- Make sure service account can access this sheet

## Security Notes

⚠️ **Keep your credentials.json file private!**

- Do NOT commit it to version control
- Do NOT share the service account email publicly
- The credentials are stored in the project root (add to `.gitignore` if using Git)

## What Data is Being Synced?

- **Invitees Sheet**: Name, email, and other attendee info
- **Form Responses**: RSVP status, attendance, dietary restrictions, etc.
- The app matches responses to invitees by email and updates status

## Worksheet Names

If your sheets use different worksheet names, you can modify the code in `ui/app.py`:

**Line ~724 (Invitees fetch):**
```python
st.session_state.cached_invitees = gs_manager.fetch_invitees(
    st.session_state.gs_invitees_sheet_id,
    sheet_name="Sheet1"  # ← Change this if needed
)
```

**Line ~731 (Responses fetch):**
```python
st.session_state.cached_responses = gs_manager.fetch_rsvp_responses(
    st.session_state.gs_responses_sheet_id,
    sheet_name="Form Responses"  # ← Change this if needed
)
```

## Next Steps

1. ✅ Set up Google Sheets API
2. ✅ Share sheets with service account
3. ✅ Test data fetch in Sync Responses tab
4. Start using the app to generate invites and track RSVPs!
