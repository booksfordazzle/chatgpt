/** Deploy as you, access Anyone. The spreadsheet stays private; a server secret authenticates writes. */
function doPost(event) {
  var lock = LockService.getScriptLock();
  var locked = false;
  var baseHeaders = ['Email', 'Registered at (UTC)', 'Consent', 'Privacy version', 'Source'];
  var extraHeaders = ['Consent received at (UTC)', 'Consent text version', 'Locale', 'UTM source', 'UTM medium', 'UTM campaign', 'UTM term', 'UTM content', 'Referrer origin', 'Landing path', 'Welcome email status', 'Welcome email sent at (UTC)', 'Device type', 'device_type', 'os', 'browser', 'landing_page', 'referrer_full', 'screen_width'];
  function reply(ok) { return ContentService.createTextOutput(JSON.stringify({ ok: ok })).setMimeType(ContentService.MimeType.JSON); }
  function bounded(value, limit) { return typeof value === 'string' ? value.trim().replace(/[\x00-\x1f\x7f]/g, '').slice(0, limit) : ''; }
  function cell(value) { value = String(value); return /^[=+\-@]/.test(value) ? "'" + value : value; }
  try {
    if (!event || !event.postData || event.postData.contents.length > 16384) return reply(false);
    var input = JSON.parse(event.postData.contents);
    if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(false);
    var props = PropertiesService.getScriptProperties();
    var expected = props.getProperty('WAITLIST_SHARED_SECRET');
    if (!expected || input.token !== expected || input.consent !== true
      || input.policyVersion !== '2026-11-15-sheets-v1' || input.consentTextVersion !== 'launch-updates-v1') return reply(false);
    var email = typeof input.email === 'string' ? input.email.trim() : '';
    if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\r\n\x00]/.test(email)) return reply(false);
    var locale = input.locale === 'en-US' ? 'en-US' : 'el';
    var source = ['primal-core-waitlist','primal-core-hero','primal-core-footer','primal_core_hero','primal_core_footer'].indexOf(input.source) >= 0 ? input.source : 'primal-core-waitlist';
    var utm = input.utm && typeof input.utm === 'object' && !Array.isArray(input.utm) ? input.utm : {};
    lock.waitLock(10000); locked = true;
    var book = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
    var sheet = book.getSheetByName('Waitlist') || book.insertSheet('Waitlist');
    var headers;
    if (sheet.getLastRow() === 0) {
      headers = baseHeaders.concat(extraHeaders);
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    } else {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      // Upgrade the previous five-column layout additively. Unknown layouts fail safely.
      if (!baseHeaders.every(function(name, i) { return headers[i] === name; })) return reply(false);
      if (headers.some(function(name, i) { return !name || headers.indexOf(name) !== i; })) return reply(false);
      var missing = extraHeaders.filter(function(name) { return headers.indexOf(name) < 0; });
      if (missing.length) {
        sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
        headers = headers.concat(missing);
      }
    }
    var key = email.toLowerCase();
    var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues() : [];
    var existingIndex = rows.findIndex(function(row) { return String(row[0]).replace(/^'/, '').toLowerCase() === key; });
    var savedRowNumber = existingIndex >= 0 ? existingIndex + 2 : sheet.getLastRow() + 1;
    if (existingIndex < 0) {
      var now = new Date().toISOString();
      var values = {
        'Email': "'" + email, 'Registered at (UTC)': now, 'Consent': 'true',
        'Privacy version': '2026-11-15-sheets-v1', 'Source': source,
        'Consent received at (UTC)': now, 'Consent text version': 'launch-updates-v1', 'Locale': locale,
        'Referrer origin': bounded(input.referrerOrigin, 256), 'Landing path': bounded(input.landingPath, 256),
        'Welcome email status': 'disabled',
        'Device type': ['mobile', 'tablet', 'desktop'].indexOf(input.deviceType) >= 0 ? input.deviceType : 'unknown',
        'device_type': ['mobile', 'tablet', 'desktop'].indexOf(input.device_type) >= 0 ? input.device_type : '',
        'os': ['iOS','Android','Windows','macOS','Linux','Other'].indexOf(input.os) >= 0 ? input.os : '',
        'browser': ['Chrome','Safari','Firefox','Edge','Brave','Other'].indexOf(input.browser) >= 0 ? input.browser : '',
        'landing_page': bounded(input.landing_page, 2048), 'referrer_full': bounded(input.referrer_full, 2048),
        'screen_width': /^\d{1,5}$/.test(String(input.screen_width || '')) && Number(input.screen_width) > 0 && Number(input.screen_width) <= 20000 ? String(input.screen_width) : ''
      };
      ['source','medium','campaign','term','content'].forEach(function(name) { values['UTM ' + name] = bounded(utm['utm_' + name], 128); });
      var range = sheet.getRange(savedRowNumber, 1, 1, headers.length);
      range.setNumberFormat('@');
      range.setValues([headers.map(function(name) { return cell(values[name] || ''); })]);
    }
    SpreadsheetApp.flush();
    var savedEmail = sheet.getRange(savedRowNumber, 1, 1, 1).getDisplayValues()[0][0];
    if (String(savedEmail).replace(/^'/, '').toLowerCase() !== key) return reply(false);
    return reply(true);
  } catch (_) {
    // Never log personal data, the shared secret, or raw provider errors.
    return reply(false);
  } finally { if (locked) lock.releaseLock(); }
}

/** Run once from Extensions → Apps Script in the owner's existing spreadsheet. */
function setupWaitlist() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book || book.getId() !== '1ptOmDxONI9KD_rLRZp0xGsjJezsOyIP0H3gd5HgleRg') {
    throw new Error('Open Apps Script from the agreed PRIMAL CORE spreadsheet.');
  }
  var props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', book.getId());
  if (!props.getProperty('WAITLIST_SHARED_SECRET')) {
    props.setProperty('WAITLIST_SHARED_SECRET', Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, ''));
  }
  // Secret is visible only in this project's Script Properties. Never log it.
}

/** Stop the old optional welcome feature without deleting subscriber records/history. */
function disableWelcomeEmails() {
  PropertiesService.getScriptProperties().setProperty('WELCOME_EMAIL_ENABLED', 'false');
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'sendPendingWelcomeEmails') ScriptApp.deleteTrigger(trigger);
  });
}

/** Kept so an old scheduled trigger is harmless after this source is installed. */
function sendPendingWelcomeEmails() { return; }

/** Historical setup entry point now only disables welcome sending. */
function setupWelcomeEmails() { disableWelcomeEmails(); }
