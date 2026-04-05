function getConfig_() {
  var configSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Config");
  if (!configSheet) {
    throw new Error("Missing 'Config' sheet. Please create a sheet named 'Config' with setup values.");
  }

  var data = configSheet.getDataRange().getValues();
  var config = {};

  for (var i = 1; i < data.length; i++) {
    var key = String(data[i][0]).trim();
    var value = String(data[i][1]).trim();
    if (key) {
      config[key] = value;
    }
  }

  var required = ["form_prefill_url", "master_sheet_name", "responses_sheet_name"];
  for (var j = 0; j < required.length; j++) {
    if (!config[required[j]]) {
      throw new Error("Missing config value: " + required[j]);
    }
  }

  return {
    eventName: config["event_name"] || "Event",
    eventDescription: config["event_description"] || "",
    emailSubject: config["email_subject"] || "You're Invited!",
    emailIntro: config["email_intro"] || "Hi {{FirstName}}, You're invited to our event!",
    emailOutro: config["email_outro"] || "We look forward to seeing you.",
    formPrefillUrl: config["form_prefill_url"],
    masterSheetName: config["master_sheet_name"],
    responsesSheetName: config["responses_sheet_name"],
    responseEmailField: config["response_email_field"] || "Email",
    responseStatusField: config["response_status_field"] || "RSVP",
    responseTimestampField: config["response_timestamp_field"] || "Timestamp",
    columns: {
      firstName: config["column_first_name"] || "FirstName",
      lastName: config["column_last_name"] || "LastName",
      email: config["column_email"] || "Email",
      mailingAddress: config["column_mailing_address"] || "Mailing Address",
      attendees: config["column_attendees"] || "Number of Attendees",
      rsvpLink: config["column_rsvp_link"] || "RSVP_Link",
      inviteSent: config["column_invite_sent"] || "InviteSent",
      rsvpStatus: config["column_rsvp_status"] || "RSVP_Status",
      rsvpTimestamp: config["column_rsvp_timestamp"] || "RSVP_Timestamp"
    }
  };
}

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("Invite Workflow")
      .addItem("📋 Setup Guide", "showSetupGuide")
      .addSeparator()
      .addItem("🔗 Generate RSVP Links", "generateRSVPLinks")
      .addItem("✉️ Send Invites", "sendInvites")
      .addItem("📥 Sync RSVPs", "syncRSVPs")
      .addToUi();
  } catch (e) {
    Logger.log("Error in onOpen: " + e);
  }
}

function showSetupGuide() {
  var ui = SpreadsheetApp.getUi();

  var template = HtmlService.createHtmlOutput(
    "<style>" +
    "body { font-family: Arial, sans-serif; margin: 16px; font-size: 13px; }" +
    "h2 { color: #1f73e8; margin-top: 16px; }" +
    "h3 { color: #333; margin-top: 12px; }" +
    "ul { line-height: 1.6; }" +
    "code { background: #f0f0f0; padding: 2px 4px; border-radius: 2px; font-family: monospace; }" +
    ".step { background: #f9f9f9; padding: 12px; margin: 8px 0; border-left: 3px solid #1f73e8; }" +
    ".ok { color: #0d652d; font-weight: bold; }" +
    "</style>" +
    "<h2>📋 Setup Guide</h2>" +
    "<p>Follow these steps to get started:</p>" +
    "<div class='step'>" +
    "<h3>Step 1: Create a Config Sheet</h3>" +
    "<ul>" +
    "<li>Create a new sheet named <code>Config</code></li>" +
    "<li>In column A, add these keys (one per row):</li>" +
    "<ul>" +
    "<li><code>form_prefill_url</code></li>" +
    "<li><code>master_sheet_name</code></li>" +
    "<li><code>responses_sheet_name</code></li>" +
    "<li><code>column_first_name</code> (default: FirstName)</li>" +
    "<li><code>column_last_name</code> (default: LastName)</li>" +
    "<li><code>column_email</code> (default: Email)</li>" +
    "<li><code>column_rsvp_link</code> (default: RSVP_Link)</li>" +
    "<li><code>column_invite_sent</code> (default: InviteSent)</li>" +
    "<li><code>column_rsvp_status</code> (default: RSVP_Status)</li>" +
    "<li><code>column_rsvp_timestamp</code> (default: RSVP_Timestamp)</li>" +
    "</ul>" +
    "</ul>" +
    "</div>" +
    "<div class='step'>" +
    "<h3>Step 2: Add Config Values</h3>" +
    "<ul>" +
    "<li>In column B, add the corresponding values for each key</li>" +
    "<li><strong>form_prefill_url:</strong> Get this from Google Forms (click ... → Get pre-filled link)</li>" +
    "<li><strong>master_sheet_name:</strong> Name of your invitee list sheet (e.g., \"Master\")</li>" +
    "<li><strong>responses_sheet_name:</strong> Name of the form responses sheet (e.g., \"Form Responses 1\")</li>" +
    "</ul>" +
    "</div>" +
    "<div class='step'>" +
    "<h3>Step 3: Use the Menu</h3>" +
    "<ul>" +
    "<li>Use <code>🔗 Generate RSVP Links</code> to create personalized RSVP URLs</li>" +
    "<li>Use <code>✉️ Send Invites</code> to send emails to all invitees</li>" +
    "<li>Use <code>📥 Sync RSVPs</code> to update response status as people submit forms</li>" +
    "</ul>" +
    "</div>" +
    "<div class='step'>" +
    "<h3 class='ok'>✅ You're ready!</h3>" +
    "<p>Once the Config sheet is set up, the workflow is one-click.</p>" +
    "</div>"
  );

  ui.showModelessDialog(template, "Setup Guide");
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
  SpreadsheetApp.getActiveSpreadsheet().toast(message, "Invite Workflow", 5);
}

function generateRSVPLinks() {
  try {
    var config = getConfig_();
    var sheet = getSheet_(config.masterSheetName);
    var headers = getHeaders_(sheet);
    var firstNameCol = getColumnIndex_(headers, config.columns.firstName) + 1;
    var lastNameCol = getColumnIndex_(headers, config.columns.lastName) + 1;
    var emailCol = getColumnIndex_(headers, config.columns.email) + 1;
    var rsvpLinkCol = getColumnIndex_(headers, config.columns.rsvpLink) + 1;

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
      var link = row[rsvpLinkCol - 1];

      if (!link || link.toString().trim() === "") {
        link = createUrl_(config.formPrefillUrl, firstName, lastName, email);
      }

      updatedLinks.push([link]);
    }

    sheet.getRange(2, rsvpLinkCol, updatedLinks.length, 1).setValues(updatedLinks);
    showToast_("✅ RSVP links generated for " + updatedLinks.length + " invitees.");
  } catch (e) {
    showToast_("❌ Error: " + e.message);
    Logger.log(e);
  }
}

function sendInvites() {
  try {
    var config = getConfig_();
    var sheet = getSheet_(config.masterSheetName);
    var headers = getHeaders_(sheet);
    var firstNameCol = getColumnIndex_(headers, config.columns.firstName) + 1;
    var lastNameCol = getColumnIndex_(headers, config.columns.lastName) + 1;
    var emailCol = getColumnIndex_(headers, config.columns.email) + 1;
    var mailingCol = getColumnIndex_(headers, config.columns.mailingAddress) + 1;
    var attendeesCol = getColumnIndex_(headers, config.columns.attendees) + 1;
    var rsvpLinkCol = getColumnIndex_(headers, config.columns.rsvpLink) + 1;
    var inviteSentCol = getColumnIndex_(headers, config.columns.inviteSent) + 1;

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
        rsvpLink = createUrl_(config.formPrefillUrl, firstName, lastName, email);
        sheet.getRange(i + 2, rsvpLinkCol).setValue(rsvpLink);
      }

      var subject = config.emailSubject;
      var intro = config.emailIntro.replace("{{FirstName}}", firstName);
      var body = intro + "\n\n" +
        "Please RSVP using your personalized link:\n" +
        rsvpLink + "\n\n";
      
      if (mailingAddress && mailingAddress.toString().trim() !== "") {
        body += "Mailing Address: " + mailingAddress + "\n";
      }
      if (attendees && attendees.toString().trim() !== "") {
        body += "Number of Attendees: " + attendees + "\n";
      }
      
      body += "\n" + config.emailOutro + "\n";

      GmailApp.sendEmail(email, subject, body);
      sentFlags.push([true]);
      sentCount += 1;
    }

    sheet.getRange(2, inviteSentCol, sentFlags.length, 1).setValues(sentFlags);
    showToast_("✅ Sent " + sentCount + " invites.");
  } catch (e) {
    showToast_("❌ Error: " + e.message);
    Logger.log(e);
  }
}

function syncRSVPs() {
  try {
    var config = getConfig_();
    var masterSheet = getSheet_(config.masterSheetName);
    var responseSheet = getSheet_(config.responsesSheetName);

    var masterHeaders = getHeaders_(masterSheet);
    var responseHeaders = getHeaders_(responseSheet);
    var emailCol = getColumnIndex_(masterHeaders, config.columns.email) + 1;
    var statusCol = getColumnIndex_(masterHeaders, config.columns.rsvpStatus) + 1;
    var timestampCol = getColumnIndex_(masterHeaders, config.columns.rsvpTimestamp) + 1;

    var responseEmailCol = responseHeaders.indexOf(config.responseEmailField) + 1;
    var responseStatusCol = responseHeaders.indexOf(config.responseStatusField) + 1;
    var responseTimestampCol = responseHeaders.indexOf(config.responseTimestampField) + 1;

    if (responseEmailCol === 0 || responseStatusCol === 0 || responseTimestampCol === 0) {
      throw new Error("Response sheet column mismatch. Expected: '" + config.responseEmailField + 
        "', '" + config.responseStatusField + "', '" + config.responseTimestampField + "'");
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
    showToast_("✅ Synced " + updatedCount + " RSVP responses.");
  } catch (e) {
    showToast_("❌ Error: " + e.message);
    Logger.log(e);
  }
}
