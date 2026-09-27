/**
 * LeadBox → Google Sheets receiver.
 *
 * A Google Apps Script web app that appends LeadBox form submissions to a
 * Google Sheet, and optionally emails the site owner when a new lead comes
 * in. This is meant to be pasted into the Apps Script editor of a Google
 * Sheet — see docs/google-sheets.md for the full step-by-step setup guide.
 *
 * No external dependencies, no billing account required, and it runs
 * entirely on Google's free tier for typical small-business lead volume.
 */

// ---- Configuration -------------------------------------------------------

/** Name of the sheet (tab) leads are appended to. Created automatically if missing. */
var SHEET_NAME = 'Leads';

/**
 * Set to an email address to get notified for every new lead, or leave as
 * an empty string to disable notification emails.
 */
var NOTIFY_EMAIL = '';

/** Subject line used for notification emails. */
var NOTIFY_SUBJECT = 'New website lead';

/**
 * Column order written to the sheet. Anything in the incoming payload that
 * isn't listed here is ignored; anything listed here that's missing from
 * the payload is written as an empty cell. Keep this in sync with the
 * `fields` you configure on the LeadBox widget itself.
 */
var COLUMNS = [
  'submittedAt',
  'name',
  'phone',
  'email',
  'service',
  'message',
  'preferredContact',
  'pageUrl',
  'referrer',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
];

// ---- Web app entry point -------------------------------------------------

/**
 * Handles POST requests from the LeadBox widget. Supports both
 * `application/json` and `application/x-www-form-urlencoded` bodies
 * (LeadBox's two supported encodings).
 * @param {GoogleAppsScript.Events.DoPost} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  try {
    var payload = parseRequestBody(e);
    appendLeadRow(payload);
    if (NOTIFY_EMAIL) {
      sendNotificationEmail(payload);
    }
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/**
 * A simple GET handler so visiting the deployed URL in a browser confirms
 * the script is live, instead of showing a confusing error.
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet() {
  return jsonResponse({ ok: true, message: 'LeadBox receiver is running. POST leads here.' });
}

// ---- Helpers --------------------------------------------------------------

/**
 * @param {GoogleAppsScript.Events.DoPost} e
 * @returns {Object<string, string>}
 */
function parseRequestBody(e) {
  var contentType = (e.postData && e.postData.type) || '';
  var raw = (e.postData && e.postData.contents) || '';

  if (contentType.indexOf('application/json') !== -1) {
    return JSON.parse(raw);
  }

  // application/x-www-form-urlencoded — Apps Script also exposes this as
  // e.parameter, which is usually the simpler path.
  if (e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  var params = {};
  raw.split('&').forEach(function (pair) {
    if (!pair) return;
    var parts = pair.split('=');
    var key = decodeURIComponent(parts[0] || '');
    var value = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
    if (key) params[key] = value;
  });
  return params;
}

/**
 * @param {Object<string, string>} payload
 */
function appendLeadRow(payload) {
  var sheet = getOrCreateSheet();
  var row = COLUMNS.map(function (column) {
    return payload[column] !== undefined ? payload[column] : '';
  });
  sheet.appendRow(row);
}

/**
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * @param {Object<string, string>} payload
 */
function sendNotificationEmail(payload) {
  var lines = COLUMNS.filter(function (column) {
    return payload[column];
  }).map(function (column) {
    return column + ': ' + payload[column];
  });
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: NOTIFY_SUBJECT,
    body: lines.join('\n'),
  });
}

/**
 * @param {Object} obj
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
