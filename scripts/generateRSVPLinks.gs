function generateRSVPLinks() {
  var formUrl = "YOUR_PREFILLED_FORM_URL";
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  var firstNameIndex = headers.indexOf("FirstName");
  var lastNameIndex = headers.indexOf("LastName");
  var emailIndex = headers.indexOf("Email");
  var rsvpLinkIndex = headers.indexOf("RSVP_Link");
  var inviteSentIndex = headers.indexOf("InviteSent");

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (inviteSentIndex >= 0 && row[inviteSentIndex] === true) {
      continue;
    }

    var fullName = row[firstNameIndex] + " " + row[lastNameIndex];
    var link = formUrl
      .replace("FIRSTNAME+LASTNAME", encodeURIComponent(fullName))
      .replace("EMAIL", encodeURIComponent(row[emailIndex]));

    if (rsvpLinkIndex >= 0) {
      sheet.getRange(i + 1, rsvpLinkIndex + 1).setValue(link);
    }
  }
}
