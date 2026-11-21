/** Deploy as you, access Anyone. The spreadsheet stays private; a server secret authenticates writes. */
function doPost(event) {
  var lock = LockService.getScriptLock();
  var locked = false;
  var baseHeaders = ['Email', 'Registered at (UTC)', 'Consent', 'Privacy version', 'Source'];
  var extraHeaders = ['Consent received at (UTC)', 'Consent text version', 'Locale', 'UTM source', 'UTM medium', 'UTM campaign', 'UTM term', 'UTM content', 'Referrer origin', 'Landing path', 'Welcome email status', 'Welcome email sent at (UTC)', 'Device type', 'device_type', 'os', 'browser', 'landing_page', 'referrer_full', 'screen_width', 'Skin profile marketing consent', 'Skin profile marketing consent at (UTC)', 'Skin profile marketing consent version'];
  function reply(ok, extra) { return ContentService.createTextOutput(JSON.stringify(Object.assign({ ok: ok }, extra || {}))).setMimeType(ContentService.MimeType.JSON); }
  function bounded(value, limit) { return typeof value === 'string' ? value.trim().replace(/[\x00-\x1f\x7f]/g, '').slice(0, limit) : ''; }
  function cell(value) { value = String(value); return /^[=+\-@]/.test(value) ? "'" + value : value; }
  try {
    if (!event || !event.postData || event.postData.contents.length > 16384) return reply(false);
    var input = JSON.parse(event.postData.contents);
    if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(false);
    var props = PropertiesService.getScriptProperties();
    var expected = props.getProperty('WAITLIST_SHARED_SECRET');
    if (!expected || input.token !== expected) return reply(false);
    if (input.action === 'skin-research-v2') {
      lock.waitLock(10000); locked = true;
      var result = saveSkinResearch(input);
      return reply(result.ok === true, result);
    }
    if (input.action === 'check-welcome-smtp' || input.action === 'check-welcome-immediate') return reply(true);
    if (input.action === 'complete-welcome-immediate') {
      lock.waitLock(10000); locked = true;
      return reply(completeWelcomeImmediate(input, props));
    }
    if (input.action === 'claim-welcome-smtp') {
      lock.waitLock(10000); locked = true;
      return reply(claimWelcomeSmtp(input, props));
    }
    var skinMarketing = input.source === 'primal-core-skin-profile';
    var requiredConsentVersion = skinMarketing ? 'skin-profile-education-launch-v1' : 'launch-updates-v1';
    if (input.consent !== true || input.policyVersion !== '2026-11-15-sheets-v1' || input.consentTextVersion !== requiredConsentVersion) return reply(false);
    var email = typeof input.email === 'string' ? input.email.trim() : '';
    if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\r\n\x00]/.test(email)) return reply(false);
    var locale = input.locale === 'en-US' ? 'en-US' : 'el';
    var source = ['primal-core-waitlist','primal-core-skin-profile','primal-core-hero','primal-core-footer','primal_core_hero','primal_core_footer'].indexOf(input.source) >= 0 ? input.source : 'primal-core-waitlist';
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
      // Accept the owner's reordered Waitlist; never reorder existing columns/data.
      if (headers[0] !== 'Email' || headers.indexOf('Registered at (UTC)') < 0) return reply(false);
      if (headers.some(function(name, i) { return name && headers.indexOf(name) !== i; })) return reply(false);
      headers.forEach(function(name, i) {
        if (name) return;
        var reserved = 'Legacy column ' + (i + 1);
        while (headers.indexOf(reserved) >= 0) reserved += '_';
        headers[i] = reserved;
        sheet.getRange(1, i + 1, 1, 1).setValues([[reserved]]);
      });
      var missing = baseHeaders.concat(extraHeaders).filter(function(name) { return headers.indexOf(name) < 0; });
      if (missing.length) {
        sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
        headers = headers.concat(missing);
      }
    }
    var welcomeEnabled = props.getProperty('WELCOME_EMAIL_ENABLED') === 'true' && props.getProperty('WELCOME_EMAIL_VERSION') === 'thank-you-v1';
    var immediateWelcome = welcomeEnabled && input.welcomeDelivery === 'immediate-v1' && props.getProperty('WELCOME_EMAIL_TRANSPORT') === 'papaki-smtp-v1';
    var key = email.toLowerCase();
    var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getDisplayValues() : [];
    var existingIndex = rows.findIndex(function(row) { return String(row[0]).replace(/^'/, '').toLowerCase() === key; });
    var savedRowNumber = existingIndex >= 0 ? existingIndex + 2 : sheet.getLastRow() + 1;
    if (existingIndex < 0) {
      var now = new Date().toISOString();
      var values = {
        'Email': "'" + email, 'Registered at (UTC)': now, 'Consent': 'true',
        'Privacy version': '2026-11-15-sheets-v1', 'Source': source,
        'Consent received at (UTC)': now, 'Consent text version': requiredConsentVersion, 'Locale': locale,
        'Referrer origin': bounded(input.referrerOrigin, 256), 'Landing path': bounded(input.landingPath, 256),
        'Welcome email status': welcomeEnabled ? (immediateWelcome ? 'pending-immediate-thanks-v1' : 'pending-thanks-v1') : 'disabled',
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
    if (skinMarketing) {
      // A separate purpose receipt preserves the original signup/consent and never
      // attaches a quiz profile, raw answers, research budget or interest score.
      var activeConsent = existingIndex < 0 || sheet.getRange(savedRowNumber, headers.indexOf('Consent') + 1, 1, 1).getDisplayValues()[0][0] === 'true';
      if (!activeConsent) return reply(false); // Do not silently reactivate a withdrawn address.
      var receipt = {'Skin profile marketing consent': 'true', 'Skin profile marketing consent at (UTC)': new Date().toISOString(), 'Skin profile marketing consent version': requiredConsentVersion};
      Object.keys(receipt).forEach(function(name) { sheet.getRange(savedRowNumber, headers.indexOf(name) + 1, 1, 1).setValues([[receipt[name]]]); });
    }
    SpreadsheetApp.flush();
    if (skinMarketing && sheet.getRange(savedRowNumber, headers.indexOf('Skin profile marketing consent version') + 1, 1, 1).getDisplayValues()[0][0] !== requiredConsentVersion) return reply(false);
    var savedEmail = sheet.getRange(savedRowNumber, 1, 1, 1).getDisplayValues()[0][0];
    if (String(savedEmail).replace(/^'/, '').toLowerCase() !== key) return reply(false);
    if (input.welcomeDelivery === 'immediate-v1') {
      if (existingIndex < 0 && immediateWelcome) return reply(true, {welcomeDelivery: 'immediate', welcomeJob: {rowNumber: savedRowNumber, email: email, locale: locale, registeredAt: now, deliveryMode: 'immediate'}});
      return reply(true, {welcomeDelivery: existingIndex >= 0 ? 'duplicate' : welcomeEnabled ? 'queued' : 'disabled'});
    }
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

/** Enable only the new thank-you flow; old records are never backfilled. */
function setupWelcomeEmails() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SPREADSHEET_ID') || !props.getProperty('WAITLIST_SHARED_SECRET')) {
    throw new Error('Run setupWaitlist first in the existing project.');
  }
  var check = checkWelcomeEmailConnection();
  if (!check.ok) throw new Error('SMTP readiness: HTTP ' + check.status + ' / ' + check.code);
  disableWelcomeEmails();
  ScriptApp.newTrigger('sendPendingWelcomeEmails').timeBased().everyMinutes(5).create();
  props.setProperty('WELCOME_EMAIL_VERSION', 'thank-you-v1');
  props.setProperty('WELCOME_EMAIL_TRANSPORT', 'papaki-smtp-v1');
  props.setProperty('WELCOME_EMAIL_ENABLED', 'true');
}

/** A bounded queue keeps provider delays/failures separate from registration. */
function sendPendingWelcomeEmails() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('WELCOME_EMAIL_ENABLED') !== 'true' || props.getProperty('WELCOME_EMAIL_VERSION') !== 'thank-you-v1' || props.getProperty('WELCOME_EMAIL_TRANSPORT') !== 'papaki-smtp-v1') return;
  for (var attempt = 0; attempt < 5; attempt++) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(1000)) return;
    var sheet, headers, rowNumber, email, locale, registeredAt, statusColumn, sentColumn;
    try {
      if (props.getProperty('WELCOME_EMAIL_ENABLED') !== 'true') return;
      sheet = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID')).getSheetByName('Waitlist');
      if (!sheet || sheet.getLastRow() < 2) return;
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      statusColumn = headers.indexOf('Welcome email status');
      sentColumn = headers.indexOf('Welcome email sent at (UTC)');
      var consentColumn = headers.indexOf('Consent'), localeColumn = headers.indexOf('Locale');
      if (headers[0] !== 'Email' || headers.indexOf('Registered at (UTC)') < 0 || statusColumn < 0 || sentColumn < 0 || consentColumn < 0 || localeColumn < 0) return;
      var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getDisplayValues();
      var index = rows.findIndex(function(row) { var pending = row[statusColumn] === 'pending-thanks-v1' || (row[statusColumn] === 'pending-immediate-thanks-v1' && Date.now() - Date.parse(row[headers.indexOf('Registered at (UTC)')]) > 60000); return pending && row[consentColumn] === 'true' && !row[sentColumn]; });
      if (index < 0) return;
      rowNumber = index + 2;
      email = String(rows[index][0]).replace(/^'/, '');
      locale = rows[index][localeColumn];
      registeredAt = rows[index][headers.indexOf('Registered at (UTC)')];
      if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\r\n\x00]/.test(email)) return;
      // Claim and flush before sending. Interrupted/ambiguous sends are not retried.
      sheet.getRange(rowNumber, statusColumn + 1, 1, 1).setValues([['sending-thanks-v1']]);
      SpreadsheetApp.flush();
    } finally { lock.releaseLock(); }
    var sent = false, retrySafe = false, sendStatus = 0, sendCode = 'request_failed';
    try {
      var response = UrlFetchApp.fetch('https://primalcore.gr/api/welcome-email', {
        method: 'post', contentType: 'application/json',
        headers: { Authorization: 'Bearer ' + props.getProperty('WAITLIST_SHARED_SECRET') },
        payload: JSON.stringify({rowNumber: rowNumber, email: email, locale: locale, registeredAt: registeredAt}),
        muteHttpExceptions: true, followRedirects: false
      });
      sendStatus = response.getResponseCode();
      var result = JSON.parse(response.getContentText());
      var safeCodes = ['auth_failed','smtp_host_missing','smtp_host_invalid','smtp_port_invalid','smtp_user_invalid','smtp_password_missing','receiver_not_configured','smtp_not_configured','job_not_available','claim_unavailable','smtp_send_unconfirmed'];
      sendCode = sendStatus === 200 && result.ok === true ? 'accepted' : safeCodes.indexOf(result.code) >= 0 ? result.code : 'unexpected_response';
      sent = response.getResponseCode() === 200 && result.ok === true;
      retrySafe = response.getResponseCode() === 503 && result.retrySafe === true;
    } catch (_) { /* Uncertain response: never resend automatically. */ }
    console.log('SMTP send: HTTP ' + sendStatus + ' / ' + sendCode);
    lock.waitLock(10000);
    try {
      sheet.getRange(rowNumber, statusColumn + 1, 1, 1).setValues([[sent ? 'sent-thanks-v1' : retrySafe ? 'pending-thanks-v1' : 'review-thanks-v1']]);
      if (sent) sheet.getRange(rowNumber, sentColumn + 1, 1, 1).setValues([[new Date().toISOString()]]);
      SpreadsheetApp.flush();
    } finally { lock.releaseLock(); }
    if (retrySafe) return;
  }
}

/** Called only by the secret-authenticated SMTP server, under doPost's lock. */
function claimWelcomeSmtp(input, props) {
  if (props.getProperty('WELCOME_EMAIL_ENABLED') !== 'true' || props.getProperty('WELCOME_EMAIL_TRANSPORT') !== 'papaki-smtp-v1') return false;
  if (!Number.isInteger(input.rowNumber) || input.rowNumber < 2) return false;
  var sheet = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID')).getSheetByName('Waitlist');
  if (!sheet || input.rowNumber > sheet.getLastRow()) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var statusColumn = headers.indexOf('Welcome email status'), sentColumn = headers.indexOf('Welcome email sent at (UTC)');
  var consentColumn = headers.indexOf('Consent'), localeColumn = headers.indexOf('Locale');
  if (headers[0] !== 'Email' || headers.indexOf('Registered at (UTC)') < 0 || statusColumn < 0 || sentColumn < 0 || consentColumn < 0 || localeColumn < 0) return false;
  var row = sheet.getRange(input.rowNumber, 1, 1, headers.length).getDisplayValues()[0];
  if (String(row[0]).replace(/^'/, '') !== input.email || row[headers.indexOf('Registered at (UTC)')] !== input.registeredAt || row[localeColumn] !== input.locale
    || row[consentColumn] !== 'true' || row[sentColumn] || row[statusColumn] !== (input.deliveryMode === 'immediate' ? 'pending-immediate-thanks-v1' : 'sending-thanks-v1')) return false;
  sheet.getRange(input.rowNumber, statusColumn + 1, 1, 1).setValues([['smtp-claimed-thanks-v1']]);
  SpreadsheetApp.flush();
  return true;
}

/** Safe diagnosis only: never sends mail, logs settings or changes the queue. */
function checkWelcomeEmailConnection() {
  var status = 0, result = {}, code = 'connection_failed';
  try {
    var secret = PropertiesService.getScriptProperties().getProperty('WAITLIST_SHARED_SECRET');
    var response = UrlFetchApp.fetch('https://primalcore.gr/api/welcome-email?receiver=1&immediate=1', {
      method: 'get', headers: { Authorization: 'Bearer ' + secret },
      muteHttpExceptions: true, followRedirects: false
    });
    status = response.getResponseCode();
    try { result = JSON.parse(response.getContentText()); } catch (_) {}
    var allowed = ['auth_failed','smtp_host_missing','smtp_host_invalid','smtp_port_invalid','smtp_user_invalid','smtp_password_missing','receiver_not_configured','smtp_not_configured','smtp_auth_failed','smtp_timeout','smtp_dns_failed','smtp_tls_failed','smtp_connection_failed','receiver_not_ready','receiver_version_outdated','receiver_check_failed'];
    code = status === 200 && result.ok === true ? 'ready' : allowed.indexOf(result.code) >= 0 ? result.code : 'unexpected_response';
  } catch (_) {}
  var check = {ok: code === 'ready', status: status, code: code};
  console.log('SMTP readiness: HTTP ' + check.status + ' / ' + check.code);
  return check;
}

/** Record an immediate attempt only; never reset an ambiguous claimed send. */
function completeWelcomeImmediate(input, props) {
  if (!Number.isInteger(input.rowNumber) || input.rowNumber < 2 || input.deliveryMode !== 'immediate') return false;
  var sheet = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID')).getSheetByName('Waitlist');
  if (!sheet || input.rowNumber > sheet.getLastRow()) return false;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var statusColumn = headers.indexOf('Welcome email status'), sentColumn = headers.indexOf('Welcome email sent at (UTC)');
  var localeColumn = headers.indexOf('Locale');
  if (headers[0] !== 'Email' || headers.indexOf('Registered at (UTC)') < 0 || statusColumn < 0 || sentColumn < 0 || localeColumn < 0) return false;
  var row = sheet.getRange(input.rowNumber, 1, 1, headers.length).getDisplayValues()[0];
  if (String(row[0]).replace(/^'/, '') !== input.email || row[headers.indexOf('Registered at (UTC)')] !== input.registeredAt || row[localeColumn] !== input.locale) return false;
  if (row[statusColumn] === 'sent-thanks-v1' && row[sentColumn]) return true;
  if (['pending-immediate-thanks-v1', 'smtp-claimed-thanks-v1'].indexOf(row[statusColumn]) < 0 || row[sentColumn]) return false;
  var accepted = input.deliveryResult === 'accepted' && row[statusColumn] === 'smtp-claimed-thanks-v1';
  var retrySafe = input.deliveryResult === 'retry-safe' && row[statusColumn] === 'pending-immediate-thanks-v1';
  sheet.getRange(input.rowNumber, statusColumn + 1, 1, 1).setValues([[accepted ? 'sent-thanks-v1' : retrySafe ? 'pending-thanks-v1' : 'review-thanks-v1']]);
  if (accepted) sheet.getRange(input.rowNumber, sentColumn + 1, 1, 1).setValues([[new Date().toISOString()]]);
  SpreadsheetApp.flush();
  return true;
}
