function sendInvites() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var firstNameIndex = headers.indexOf("FirstName");
  var lastNameIndex = headers.indexOf("LastName");
  var emailIndex = headers.indexOf("Email");
  var mailingIndex = headers.indexOf("Mailing Address");
  var attendeesIndex = headers.indexOf("Number of Attendees");
  var rsvpLinkIndex = headers.indexOf("RSVP_Link");
  var inviteSentIndex = headers.indexOf("InviteSent");

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (inviteSentIndex >= 0 && row[inviteSentIndex] === true) {
      continue;
    }

    var first = row[firstNameIndex];
    var last = row[lastNameIndex];
    var email = row[emailIndex];
    var mailingAddress = row[mailingIndex] || "(not provided)";
    var numberOfAttendees = row[attendeesIndex] || "1";
    var rsvpLink = row[rsvpLinkIndex] || "";

    var subject = "You're Invited to Asia Fest 2026!";
    var message = "Hi " + first + ",\n\n" +
      "You’re invited to our event!\n\n" +
      "Please RSVP using your personalized link:\n\n" +
      rsvpLink + "\n\n" +
      "Mailing Address: " + mailingAddress + "\n" +
      "Number of Attendees: " + numberOfAttendees + "\n\n" +
      "We look forward to seeing you.\n";

    GmailApp.sendEmail(email, subject, message);

    if (inviteSentIndex >= 0) {
      sheet.getRange(i + 1, inviteSentIndex + 1).setValue(true);
    }
  }
}
