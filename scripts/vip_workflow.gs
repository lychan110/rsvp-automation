var CONFIG = {
  masterSheetName: "Master",
  responsesSheetName: "Form Responses 1",
  formPrefillUrl: "https://docs.google.com/forms/d/e/1FAIpQLSduqfkdAeGzhJHwCdI2ARfDWiXqzyvTVh6BiqW2CXqu2BXuuQ/viewform?usp=pp_url&entry.1346187975=FIRSTNAME+LASTNAME&entry.1234567890=EMAIL",
  columns: {
    firstName: "FirstName",
    lastName: "LastName",
    email: "Email",
    mailingAddress: "Mailing Address",
    attendees: "Number of Attendees",
    rsvpLink: "RSVP_Link",
    inviteSent: "InviteSent",
    rsvpStatus: "RSVP_Status",
    rsvpTimestamp: "RSVP_Timestamp"
  }
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("VIP Invite")
    .addItem("Generate RSVP Links", "generateRSVPLinks")
    .addItem("Send Invites", "sendInvites")
    .addItem("Sync RSVPs", "syncRSVPs")
    .addToUi();
}

function getSheet_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) {
    throw new Error("Sheet not found: " + name);
  }
  return sheet;
}

function getHeaders_(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function (value) {
    return value.toString().trim();
  });
}

function getColumnIndex_(headers, name) {
  var index = headers.indexOf(name);
  if (index === -1) {
    throw new Error("Missing required column: " + name);
  }
  return index;
}

function createUrl_(baseUrl, firstName, lastName, email) {
  var fullName = [firstName, lastName].filter(function (part) {
    return part && part.toString().trim() !== "";
  }).join(" ");

  return baseUrl
    .replace(/FIRSTNAME\+LASTNAME/g, encodeURIComponent(fullName))
    .replace(/EMAIL/g, encodeURIComponent(email || ""));
}

function showToast_(message) {
  SpreadsheetApp.getActiveSpreadsheet().toast(message, "VIP Invite", 5);
}

function generateRSVPLinks() {
  var sheet = getSheet_(CONFIG.masterSheetName);
  var headers = getHeaders_(sheet);
  var firstNameCol = getColumnIndex_(headers, CONFIG.columns.firstName) + 1;
  var lastNameCol = getColumnIndex_(headers, CONFIG.columns.lastName) + 1;
  var emailCol = getColumnIndex_(headers, CONFIG.columns.email) + 1;
  var rsvpLinkCol = getColumnIndex_(headers, CONFIG.columns.rsvpLink) + 1;
  var inviteSentCol = getColumnIndex_(headers, CONFIG.columns.inviteSent) + 1;

  var rowCount = sheet.getLastRow() - 1;
  if (rowCount < 1) {
    showToast_("No invitees found.");
    return;
  }

  var values = sheet.getRange(2, 1, rowCount, sheet.getLastColumn()).getValues();
  var updatedLinks = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var firstName = row[firstNameCol - 1];
    var lastName = row[lastNameCol - 1];
    var email = row[emailCol - 1];
    var inviteSent = String(row[inviteSentCol - 1]).toLowerCase() === "true";
    var link = row[rsvpLinkCol - 1];

    if (!link || link.toString().trim() === "") {
      link = createUrl_(CONFIG.formPrefillUrl, firstName, lastName, email);
    }

    updatedLinks.push([link]);
  }

  sheet.getRange(2, rsvpLinkCol, updatedLinks.length, 1).setValues(updatedLinks);
  showToast_("RSVP links generated for " + updatedLinks.length + " invitees.");
}

function sendInvites() {
  var sheet = getSheet_(CONFIG.masterSheetName);
  var headers = getHeaders_(sheet);
  var firstNameCol = getColumnIndex_(headers, CONFIG.columns.firstName) + 1;
  var lastNameCol = getColumnIndex_(headers, CONFIG.columns.lastName) + 1;
  var emailCol = getColumnIndex_(headers, CONFIG.columns.email) + 1;
  var mailingCol = getColumnIndex_(headers, CONFIG.columns.mailingAddress) + 1;
  var attendeesCol = getColumnIndex_(headers, CONFIG.columns.attendees) + 1;
  var rsvpLinkCol = getColumnIndex_(headers, CONFIG.columns.rsvpLink) + 1;
  var inviteSentCol = getColumnIndex_(headers, CONFIG.columns.inviteSent) + 1;

  var rowCount = sheet.getLastRow() - 1;
  if (rowCount < 1) {
    showToast_("No invitees found.");
    return;
  }

  var values = sheet.getRange(2, 1, rowCount, sheet.getLastColumn()).getValues();
  var sentFlags = [];
  var sentCount = 0;

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var firstName = row[firstNameCol - 1];
    var lastName = row[lastNameCol - 1];
    var email = row[emailCol - 1];
    var mailingAddress = row[mailingCol - 1] || "(not provided)";
    var attendees = row[attendeesCol - 1] || "1";
    var rsvpLink = row[rsvpLinkCol - 1];
    var inviteSent = String(row[inviteSentCol - 1]).toLowerCase() === "true";

    if (inviteSent || !email) {
      sentFlags.push([inviteSent ? true : ""]);
      continue;
    }

    if (!rsvpLink || rsvpLink.toString().trim() === "") {
      rsvpLink = createUrl_(CONFIG.formPrefillUrl, firstName, lastName, email);
      sheet.getRange(i + 2, rsvpLinkCol).setValue(rsvpLink);
    }

    var subject = "You're Invited to Asia Fest 2026!";
    var body = "Hi " + firstName + ",\n\n" +
      "You’re invited to our event!\n\n" +
      "Please RSVP using your personalized link:\n" +
      rsvpLink + "\n\n" +
      "Mailing Address: " + mailingAddress + "\n" +
      "Number of Attendees: " + attendees + "\n\n" +
      "We look forward to seeing you.\n";

    GmailApp.sendEmail(email, subject, body);
    sentFlags.push([true]);
    sentCount += 1;
  }

  sheet.getRange(2, inviteSentCol, sentFlags.length, 1).setValues(sentFlags);
  showToast_("Sent " + sentCount + " invites.");
}

function syncRSVPs() {
  var masterSheet = getSheet_(CONFIG.masterSheetName);
  var responseSheet = getSheet_(CONFIG.responsesSheetName);

  var masterHeaders = getHeaders_(masterSheet);
  var responseHeaders = getHeaders_(responseSheet);
  var emailCol = getColumnIndex_(masterHeaders, CONFIG.columns.email) + 1;
  var statusCol = getColumnIndex_(masterHeaders, CONFIG.columns.rsvpStatus) + 1;
  var timestampCol = getColumnIndex_(masterHeaders, CONFIG.columns.rsvpTimestamp) + 1;

  var responseEmailCol = getColumnIndex_(responseHeaders, "Email") + 1;
  var responseStatusCol = responseHeaders.indexOf("RSVP") + 1;
  var responseTimestampCol = responseHeaders.indexOf("Timestamp") + 1;

  if (responseStatusCol === 0 || responseTimestampCol === 0) {
    throw new Error("Response sheet must include 'RSVP' and 'Timestamp' columns.");
  }

  var masterData = masterSheet.getRange(2, 1, masterSheet.getLastRow() - 1, masterSheet.getLastColumn()).getValues();
  var responseData = responseSheet.getRange(2, 1, responseSheet.getLastRow() - 1, responseSheet.getLastColumn()).getValues();

  var responseMap = {};
  for (var i = 0; i < responseData.length; i++) {
    var row = responseData[i];
    var email = String(row[responseEmailCol - 1]).trim().toLowerCase();
    if (!email) {
      continue;
    }
    responseMap[email] = {
      status: row[responseStatusCol - 1],
      timestamp: row[responseTimestampCol - 1]
    };
  }

  var updatedStatus = [];
  var updatedTimestamp = [];
  var updatedCount = 0;

  for (var j = 0; j < masterData.length; j++) {
    var row = masterData[j];
    var email = String(row[emailCol - 1]).trim().toLowerCase();
    if (email && responseMap[email]) {
      updatedStatus.push([responseMap[email].status]);
      updatedTimestamp.push([responseMap[email].timestamp]);
      updatedCount += 1;
    } else {
      updatedStatus.push([row[statusCol - 1]]);
      updatedTimestamp.push([row[timestampCol - 1]]);
    }
  }

  masterSheet.getRange(2, statusCol, updatedStatus.length, 1).setValues(updatedStatus);
  masterSheet.getRange(2, timestampCol, updatedTimestamp.length, 1).setValues(updatedTimestamp);
  showToast_("Synced " + updatedCount + " RSVP responses.");
}
