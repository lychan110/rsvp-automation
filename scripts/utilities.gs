function getSheetValues(sheetName) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  return sheet.getDataRange().getValues();
}

function setSheetValue(sheetName, row, column, value) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  sheet.getRange(row, column).setValue(value);
}

function normalizeHeaders(headers) {
  return headers.map(function(header) {
    return header.toString().trim();
  });
}
