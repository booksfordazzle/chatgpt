/** Deploy as you, access Anyone. The spreadsheet stays private; a server secret authenticates writes. */
function doPost(event) {
  var lock = LockService.getScriptLock();
  var locked = false;
  var baseHeaders = ['Email', 'Registered at (UTC)', 'Consent', 'Privacy version', 'Source'];
  var extraHeaders = ['Consent received at (UTC)', 'Consent text version', 'Locale', 'UTM source', 'UTM medium', 'UTM campaign', 'UTM term', 'UTM content', 'Referrer origin', 'Landing path', 'Welcome email status', 'Welcome email sent at (UTC)'];
  function reply(ok) { return ContentService.createTextOutput(JSON.stringify({ ok: ok })).setMimeType(ContentService.MimeType.JSON); }
  function bounded(value, limit) { return typeof value === 'string' ? value.trim().replace(/[\x00-\x1f\x7f]/g, '').slice(0, limit) : ''; }
  function cell(value) { value = String(value); return /^[=+\-@]/.test(value) ? "'" + value : value; }
  try {
    if (!event || !event.postData || event.postData.contents.length > 4096) return reply(false);
    var input = JSON.parse(event.postData.contents);
    if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(false);
    var props = PropertiesService.getScriptProperties();
    var expected = props.getProperty('WAITLIST_SHARED_SECRET');
    if (!expected || input.token !== expected || input.consent !== true
      || input.policyVersion !== '2026-11-15-sheets-v1' || input.consentTextVersion !== 'launch-updates-v1') return reply(false);
    var email = typeof input.email === 'string' ? input.email.trim() : '';
    if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\r\n\x00]/.test(email)) return reply(false);
    var locale = input.locale === 'en-US' ? 'en-US' : 'el';
    var source = ['primal-core-waitlist','primal-core-hero','primal-core-footer'].indexOf(input.source) >= 0 ? input.source : 'primal-core-waitlist';
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
        'Welcome email status': props.getProperty('WELCOME_EMAIL_ENABLED') === 'true' ? 'pending' : 'not_enabled'
      };
      ['source','medium','campaign','term','content'].forEach(function(name) { values['UTM ' + name] = bounded(utm['utm_' + name], 128); });
      var range = sheet.getRange(savedRowNumber, 1, 1, headers.length);
      range.setNumberFormat('@');
      range.setValues([headers.map(function(name) { return cell(values[name] || ''); })]);
    }
    SpreadsheetApp.flush();
    var savedEmail = sheet.getRange(savedRowNumber, 1, 1, 1).getDisplayValues()[0][0];
    if (String(savedEmail).replace(/^'/, '').toLowerCase() !== key) return reply(false);
    // A repeat submission can queue its one welcome after email is enabled later.
    // Sent/sending/failed/suppressed entries are never automatically queued again.
    try {
      var welcomeColumn = headers.indexOf('Welcome email status') + 1;
      var welcomeStatus = sheet.getRange(savedRowNumber, welcomeColumn, 1, 1).getDisplayValues()[0][0];
      if (props.getProperty('WELCOME_EMAIL_ENABLED') === 'true' && (!welcomeStatus || welcomeStatus === 'not_enabled')) {
        sheet.getRange(savedRowNumber, welcomeColumn, 1, 1).setValues([['pending']]);
        SpreadsheetApp.flush();
      }
    } catch (_) { /* A welcome-queue failure must not invalidate the confirmed signup. */ }
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

/** Run once manually, approve Google's mail/trigger permissions, then deploy a new version. */
function setupWelcomeEmails() {
  setupWaitlist();
  MailApp.getRemainingDailyQuota(); // Authorize mail access without sending a message.
  var exists = ScriptApp.getProjectTriggers().some(function(trigger) {
    return trigger.getHandlerFunction() === 'sendPendingWelcomeEmails';
  });
  if (!exists) ScriptApp.newTrigger('sendPendingWelcomeEmails').timeBased().everyMinutes(5).create();
  PropertiesService.getScriptProperties().setProperty('WELCOME_EMAIL_ENABLED', 'true');
}

function welcomeMessage_(locale) {
  if (locale === 'en-US') return {
    subject: 'You are on the PRIMAL CORE waitlist',
    body: 'Thank you for joining the PRIMAL CORE launch updates list.\n\nYour registration has been saved. We will share news about our face balm and its availability when there are updates. The product is still under development; a launch date has not been announced.\n\nTo stop receiving updates, reply to this email and ask to be removed. If you did not sign up, please let us know by replying.\n\nPRIMAL CORE'
  };
  return {
    subject: 'Είσαι στη λίστα ενημέρωσης του PRIMAL CORE',
    body: 'Σε ευχαριστούμε για την εγγραφή σου στη λίστα ενημέρωσης του PRIMAL CORE.\n\nΗ εγγραφή σου έχει αποθηκευτεί. Θα μοιραστούμε νέα για το βάλσαμο προσώπου και τη διαθεσιμότητά του όταν υπάρχουν εξελίξεις. Το προϊόν βρίσκεται ακόμη υπό ανάπτυξη και δεν έχει ανακοινωθεί ημερομηνία κυκλοφορίας.\n\nΓια να σταματήσεις να λαμβάνεις ενημερώσεις, απάντησε σε αυτό το email ζητώντας τη διαγραφή σου. Αν δεν έκανες εσύ την εγγραφή, ενημέρωσέ μας με απάντηση.\n\nPRIMAL CORE'
  };
}

/** A time trigger sends at most 10 pending welcomes, without holding the signup lock over mail calls. */
function sendPendingWelcomeEmails() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('WELCOME_EMAIL_ENABLED') !== 'true') return;
  var book = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
  var sheet = book.getSheetByName('Waitlist');
  if (!sheet) return;
  for (var attempt = 0; attempt < 10 && MailApp.getRemainingDailyQuota() > 0; attempt++) {
    var lock = LockService.getScriptLock();
    var email = '', locale = 'el';
    try {
      if (!lock.tryLock(1000)) return;
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      var statusIndex = headers.indexOf('Welcome email status');
      var localeIndex = headers.indexOf('Locale');
      if (statusIndex < 0 || headers.indexOf('Welcome email sent at (UTC)') < 0 || sheet.getLastRow() < 2) return;
      var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getDisplayValues();
      var index = rows.findIndex(function(row) { return row[statusIndex] === 'pending'; });
      if (index < 0) return;
      email = String(rows[index][0]).replace(/^'/, '').trim();
      if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\r\n\x00]/.test(email)) {
        sheet.getRange(index + 2, statusIndex + 1, 1, 1).setValues([['failed']]);
        SpreadsheetApp.flush();
        continue;
      }
      locale = localeIndex >= 0 ? rows[index][localeIndex] : 'el';
      sheet.getRange(index + 2, statusIndex + 1, 1, 1).setValues([['sending']]);
      SpreadsheetApp.flush();
    } finally { if (lock.hasLock()) lock.releaseLock(); }

    var status = 'sent';
    try {
      var message = welcomeMessage_(locale);
      MailApp.sendEmail({ to: email, subject: message.subject, body: message.body, name: 'PRIMAL CORE' });
    } catch (_) { status = 'failed'; }
    // Re-find by email in case a sheet owner moved/deleted rows while mail was sent.
    var resultLock = LockService.getScriptLock();
    try {
      if (!resultLock.tryLock(1000)) return;
      var resultHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      var resultStatusIndex = resultHeaders.indexOf('Welcome email status');
      var sentIndex = resultHeaders.indexOf('Welcome email sent at (UTC)');
      if (resultStatusIndex < 0 || sentIndex < 0 || sheet.getLastRow() < 2) return;
      var currentRows = sheet.getRange(2, 1, sheet.getLastRow() - 1, resultHeaders.length).getDisplayValues();
      var currentIndex = currentRows.findIndex(function(row) { return String(row[0]).replace(/^'/, '').toLowerCase() === email.toLowerCase(); });
      if (currentIndex >= 0 && currentRows[currentIndex][resultStatusIndex] === 'sending') {
        sheet.getRange(currentIndex + 2, resultStatusIndex + 1, 1, 1).setValues([[status]]);
        if (status === 'sent') sheet.getRange(currentIndex + 2, sentIndex + 1, 1, 1).setValues([[new Date().toISOString()]]);
        SpreadsheetApp.flush();
      }
    } finally { if (resultLock.hasLock()) resultLock.releaseLock(); }
  }
}
