// InviteFlow v3 — RSVP Ingest Trigger
//
// Setup:
//   1. Open your Google Form → Extensions → Apps Script
//   2. Paste this entire file into Code.gs
//   3. Project Settings → Script Properties → Add property:
//        MASTER_SHEET_URL = <your master sheet URL>
//   4. Triggers → Add trigger: onFormSubmit, Event source: From form, Event type: On form submit
//
// What it does: when a guest submits the RSVP form, this writes their
// RSVP status and date into the master Sheets row matched by Email.

function onFormSubmit(e) {
  var props = PropertiesService.getScriptProperties();
  var sheetUrl = props.getProperty('MASTER_SHEET_URL');
  if (!sheetUrl) {
    Logger.log('MASTER_SHEET_URL not set in script properties.');
    return;
  }

  var responses = e.response.getItemResponses();
  var email = '';
  var attending = '';

  for (var i = 0; i < responses.length; i++) {
    var item = responses[i];
    var title = item.getItem().getTitle().toLowerCase();
    var answer = item.getResponse();
    if (typeof answer === 'string') {
      if (title.indexOf('email') >= 0) email = answer.trim();
      if (title.indexOf('attend') >= 0 || title.indexOf('rsvp') >= 0) attending = answer.trim();
    }
  }

  if (!email) {
    Logger.log('No email field found in form response.');
    return;
  }

  var ss = SpreadsheetApp.openByUrl(sheetUrl);
  var sheet = ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  var header = data[0];

  var emailCol = -1, statusCol = -1, dateCol = -1;
  for (var c = 0; c < header.length; c++) {
    var h = String(header[c]).toLowerCase();
    if (h === 'email') emailCol = c;
    if (h === 'rsvp_status') statusCol = c;
    if (h === 'rsvp_date') dateCol = c;
  }

  if (emailCol < 0) {
    Logger.log('Email column not found in master sheet.');
    return;
  }

  var today = new Date().toISOString().slice(0, 10);
  var rsvpStatus = 'Attending';
  var lower = attending.toLowerCase();
  if (lower.indexOf('no') >= 0 || lower.indexOf('declin') >= 0 || lower.indexOf('unable') >= 0) {
    rsvpStatus = 'Declined';
  }

  for (var row = 1; row < data.length; row++) {
    if (String(data[row][emailCol]).toLowerCase() === email.toLowerCase()) {
      if (statusCol >= 0) sheet.getRange(row + 1, statusCol + 1).setValue(rsvpStatus);
      if (dateCol >= 0) sheet.getRange(row + 1, dateCol + 1).setValue(today);
      Logger.log('Updated RSVP for ' + email + ': ' + rsvpStatus);
      return;
    }
  }

  Logger.log('Email not found in master sheet: ' + email);
}
