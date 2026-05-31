// InviteFlow v5.1.1 — RSVP ingest trigger
// Deploy: Extensions → Apps Script → add trigger: onFormSubmit (Form Submit)
// Set script property MASTER_SHEET_URL via Project Settings → Script Properties
//
// NOTE: The canonical version of this script is embedded in the InviteFlow app
// (Sync tab → "Copy GAS code" button). Always use the app version — this file
// is updated manually and may lag behind.

function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const sheetUrl = props.getProperty('MASTER_SHEET_URL');
  if (!sheetUrl) return;

  const ss = SpreadsheetApp.openByUrl(sheetUrl);
  const sheet = ss.getSheets()[0];
  const responses = e.response.getItemResponses();

  let email = '';
  let attending = '';
  for (const r of responses) {
    const title = r.getItem().getTitle().toLowerCase();
    if (title.includes('email')) email = r.getResponse().trim();
    if (title.includes('attend') || title.includes('rsvp')) attending = r.getResponse().trim();
  }
  if (!email) return;

  const data = sheet.getDataRange().getValues();
  const header = data[0].map(String);
  const emailCol = header.findIndex(h => h.toLowerCase() === 'email');
  const statusCol = header.findIndex(h => h.toLowerCase() === 'rsvp_status');
  const dateCol = header.findIndex(h => h.toLowerCase() === 'rsvp_date');
  if (emailCol < 0) return;

  const today = new Date().toISOString().slice(0, 10);
  const lower = attending.toLowerCase();
  const rsvpStatus = (lower.includes('no') || lower.includes('declin') || lower.includes('unable'))
    ? 'Declined' : 'Attending';

  for (let row = 1; row < data.length; row++) {
    if (String(data[row][emailCol]).toLowerCase() === email.toLowerCase()) {
      if (statusCol >= 0) sheet.getRange(row + 1, statusCol + 1).setValue(rsvpStatus);
      if (dateCol >= 0) sheet.getRange(row + 1, dateCol + 1).setValue(today);
      return;
    }
  }
}
