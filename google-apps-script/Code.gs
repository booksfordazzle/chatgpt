/** Deploy as a web app: Execute as you; access Anyone. Keep this source and Script Properties private. */
function doPost(event) {
  var lock = LockService.getScriptLock();
  var locked = false;
  function reply(ok) { return ContentService.createTextOutput(JSON.stringify({ ok: ok })).setMimeType(ContentService.MimeType.JSON); }
  try {
    if (!event || !event.postData || event.postData.contents.length > 4096) return reply(false);
    var input = JSON.parse(event.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var expected = props.getProperty('WAITLIST_SHARED_SECRET');
    if (!expected || input.token !== expected || input.consent !== true || input.policyVersion !== '2026-11-14') return reply(false);
    var email = typeof input.email === 'string' ? input.email.trim() : '';
    if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\r\n\x00]/.test(email)) return reply(false);
    lock.waitLock(10000); locked = true;
    var book = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
    var sheet = book.getSheetByName('Waitlist') || book.insertSheet('Waitlist');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Email', 'Registered at (UTC)', 'Consent', 'Privacy version', 'Source']);
      sheet.setFrozenRows(1);
    }
    // Text values prevent spreadsheet formula injection. Deduplicate under the same lock.
    var key = email.toLowerCase();
    var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues() : [];
    var exists = rows.some(function(row) { return row[0].toLowerCase() === key; });
    if (!exists) {
      var rowNumber = sheet.getLastRow() + 1;
      var range = sheet.getRange(rowNumber, 1, 1, 5);
      range.setNumberFormat('@');
      range.setValues([["'" + email, new Date().toISOString(), 'true', '2026-11-14', 'primal-core-waitlist']]);
      SpreadsheetApp.flush();
    }
    return reply(true);
  } catch (_) {
    // Never log the email address or shared secret.
    return reply(false);
  } finally { if (locked) lock.releaseLock(); }
}
