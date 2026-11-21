/** Unified receiver: waitlist + quiz + research. Replace Code.gs with this entire file. */
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
    // Independent purpose-specific authentication before any waitlist dispatch.
    if (input.action === 'skin-quiz-v1' || input.action === 'skin-research-v2') {
      var quizSecret = props.getProperty('SKIN_PROFILE_RESEARCH_SECRET') || props.getProperty('WAITLIST_SHARED_SECRET');
      if (!quizSecret || input.token !== quizSecret) return reply(false);
      lock.waitLock(10000); locked = true;
      var quizResult = input.action === 'skin-quiz-v1' ? saveSkinQuiz(input) : saveSkinResearch(input);
      return reply(quizResult.ok === true, quizResult);
    }
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

/** Add alongside Code.gs in the existing receiver project. No waitlist changes. */
function saveSkinResearch(input) {
 var target = '1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA';
 var questions = [{"id":"problem","title":"Τι σε απασχολεί περισσότερο στην επιδερμίδα του προσώπου σου;","options":["Ξηρότητα και αφυδάτωση","Λεπτές γραμμές και ρυτίδες","Έλλειψη ελαστικότητας","Θαμπή και κουρασμένη όψη","Λιπαρότητα","Ευαισθησία και ερεθισμοί","Τίποτα ιδιαίτερο","Κάτι άλλο"]},{"id":"routine","title":"Τι χρησιμοποιείς σήμερα για την καθημερινή περιποίηση του προσώπου σου;","options":["Μια απλή ενυδατική κρέμα","Αντιγηραντική κρέμα","Έλαια ή φυσικά balms","Πολλαπλά προϊόντα περιποίησης","Προϊόντα μετά το ξύρισμα","Δεν χρησιμοποιώ τίποτα συστηματικά","Κάτι άλλο"]},{"id":"unmet","title":"Τι δεν σου αρέσει στα προϊόντα περιποίησης που έχεις χρησιμοποιήσει μέχρι σήμερα;","options":["Δεν βλέπω το αποτέλεσμα που περιμένω","Αφήνουν λιπαρή αίσθηση","Η ενυδάτωση δεν διαρκεί αρκετά","Έχουν έντονα αρώματα","Δεν γνωρίζω ή δεν καταλαβαίνω τα συστατικά","Είναι πολύ ακριβά","Η καθημερινή περιποίηση είναι περίπλοκη","Είμαι ικανοποιημένος από αυτά που χρησιμοποιώ","Κάτι άλλο"]},{"id":"concept","title":"Ποια είναι η πρώτη σου σκέψη για ένα balm προσώπου με βάση το επεξεργασμένο μοσχαρίσιο λίπος (beef tallow);","options":["Με ενδιαφέρει να το δοκιμάσω","Θέλω να μάθω περισσότερα για τα οφέλη του","Με προβληματίζει η μυρωδιά του","Με προβληματίζει η λιπαρότητά του","Με προβληματίζει η ασφάλεια ή η καταλληλότητά του","Δεν θα χρησιμοποιούσα συστατικό ζωικής προέλευσης","Δεν έχω σχηματίσει άποψη"]},{"id":"price","title":"Πόσα θα ήσουν διατεθειμένος να πληρώσεις για ένα balm καθημερινής περιποίησης προσώπου 50 ml, εφόσον καλύπτει τις ανάγκες σου;","options":["Κάτω από 20 €","15–19,99 €","20–24,99 €","25–29,99 €","30–39,99 €","40 € και άνω","Δεν θα αγόραζα τέτοιο προϊόν"]}];
 var fields = ['action','token','spreadsheetId','submissionId','consent'].concat(questions.map(function(q){return q.id;}));
 if(input.spreadsheetId!==target || input.consent!==true || typeof input.submissionId!=='string' || !/^[a-f0-9-]{36}$/i.test(input.submissionId) || Object.keys(input).some(function(k){return fields.indexOf(k)<0;}) || questions.some(function(q){return !Number.isInteger(input[q.id]) || input[q.id]<0 || input[q.id]>=q.options.length;}))return {ok:false};
 var book=SpreadsheetApp.openById(target);
 var sheet=book.getSheetByName('Skin Research') || book.insertSheet('Skin Research');
 var headers=['Submission ID','Submitted at (UTC)','Consent version'].concat(questions.map(function(q){return q.title;}));
 if(sheet.getLastRow()===0){sheet.appendRow(headers);sheet.setFrozenRows(1);}
 else {var actual=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];if(JSON.stringify(actual)!==JSON.stringify(headers))return {ok:false};}
 var existing=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,1).getDisplayValues():[];
 var index=existing.findIndex(function(row){return row[0]===input.submissionId;});
 var answers=questions.map(function(q){return q.options[input[q.id]];});
 var row=index<0?sheet.getLastRow()+1:index+2;
 if(index<0){var values=[input.submissionId,new Date().toISOString(),'skin-research-v2'].concat(answers);var range=sheet.getRange(row,1,1,values.length);range.setNumberFormat('@');range.setValues([values]);SpreadsheetApp.flush();}
 var saved=sheet.getRange(row,1,1,headers.length).getDisplayValues()[0];
 if(saved[0]!==input.submissionId || saved[2]!=='skin-research-v2' || JSON.stringify(saved.slice(3))!==JSON.stringify(answers))return {ok:false};
 return {ok:true,spreadsheetId:target,submissionId:input.submissionId};
}

/** Quiz-only tab; never writes into Skin Research. */
function skinQuizQuestions(){return [{"id":"q01","title":"Σε ποια ηλικία βρίσκεσαι;","options":["18–34","35–44","45–54","55–64","65+","Προτιμώ να μην απαντήσω"],"hint":"Για ενήλικες 18+. Η ηλικία δεν καθορίζει από μόνη της τη ρουτίνα σου."},{"id":"q02","title":"Μόλις έπλυνες το πρόσωπό σου.\nΤι αισθάνεσαι;","options":["Άνετο","Τραβάει","Τραβάει σε ορισμένα σημεία","Κάψιμο ή τσούξιμο","Δεν έχω προσέξει"],"hint":"","multiple":true,"exclusive":[0,4],"incompatible":[[1,2]],"maxChoices":2},{"id":"q03","title":"Πώς είναι το δέρμα σου μέσα στην ημέρα;","options":["Ξηρό ή τραχύ","Λιπαρό","Μικτό","Ισορροπημένο","Δεν είμαι σίγουρος/η"],"hint":""},{"id":"q04","title":"Αν μπορούσες να αλλάξεις ένα πράγμα στο δέρμα σου,\nποιο θα ήταν;","options":["Λιγότερη ξηρότητα","Λιγότερο εμφανείς λεπτές γραμμές και ρυτίδες","Απαλότητα και φυσική λάμψη","Λιγότερη δυσφορία από προϊόντα","Ισορροπία λιπαρότητας","Απλούστερη ρουτίνα"],"hint":""},{"id":"q05","title":"Πότε παρατηρείς τις λεπτές γραμμές στο πρόσωπό σου;","options":["Σπάνια","Κυρίως όταν η επιδερμίδα είναι ξηρή","Ορατές και σε χαλαρό πρόσωπο","Δεν με απασχολούν ιδιαίτερα"],"hint":""},{"id":"q06","title":"Πώς αντιδρά το δέρμα σου σε κάτι καινούργιο;","options":["Συνήθως καλά","Μερικές φορές ενόχληση","Συχνά κάψιμο ή ερεθισμός","Δεν δοκιμάζω συχνά"],"hint":""},{"id":"q07","title":"Με τι πλένεις το πρόσωπό σου;","options":["Νερό","Κοινό σαπούνι ή αφρόλουτρο","Καθαριστικό προσώπου","Συχνό scrub","Χωρίς σταθερή συνήθεια"],"hint":"","multiple":true,"exclusive":[4],"maxChoices":4},{"id":"q08","title":"Πόσο συχνά ενυδατώνεις το πρόσωπό σου;","options":["Καθημερινά","Μερικές φορές την εβδομάδα","Μόνο όταν νιώθω ξηρότητα","Σπάνια ή ποτέ"],"hint":""},{"id":"q09","title":"Πότε προστατεύεις το δέρμα σου από τον ήλιο;","options":["Καθημερινά","Όταν έχει έντονο ήλιο","Το καλοκαίρι","Σπάνια ή ποτέ"],"hint":""},{"id":"q10","title":"Η περιποίησή σου ανταποκρίνεται στις ανάγκες σου;","options":["Με καλύπτει","Δεν είμαι ικανοποιημένος/η","Χρησιμοποιώ περισσότερα προϊόντα από όσα θέλω","Δεν ξέρω από πού να ξεκινήσω"],"hint":""}];}
function skinQuizHeaders(){return ['Submission ID','Submitted at (UTC)','Consent version'].concat(skinQuizQuestions().map(function(q){return q.title;}),['Result']);}
function setupSkinQuiz(){var book=SpreadsheetApp.openById('1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA');var sheet=book.getSheetByName('Skin Quiz')||book.insertSheet('Skin Quiz');if(sheet.getLastRow()===0){sheet.appendRow(skinQuizHeaders());sheet.setFrozenRows(1);}}
function saveSkinQuiz(input){
 var target='1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA',qs=skinQuizQuestions();
 if(input.spreadsheetId!==target||input.consent!==true||typeof input.submissionId!=='string'||! /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(input.submissionId)||Object.keys(input).some(function(k){return ['action','token','spreadsheetId','submissionId','consent','answers'].indexOf(k)<0;})||!Array.isArray(input.answers)||input.answers.length!==qs.length)return {ok:false};
 var answers=input.answers;
 if(qs.some(function(q,i){var a=answers[i],v=Array.isArray(a)?a:[a];return (Array.isArray(a)&&!q.multiple)||!v.length||v.length>(q.maxChoices||1)||new Set(v).size!==v.length||v.some(function(n){return !Number.isInteger(n)||n<0||n>=q.options.length;})||(v.length>1&&(q.exclusive||[]).some(function(n){return v.indexOf(n)>=0;}))||(q.incompatible||[]).some(function(g){return g.filter(function(n){return v.indexOf(n)>=0;}).length>1;});}))return {ok:false};
 var primary=(Array.isArray(answers[1])?answers[1]:[answers[1]]).indexOf(3)>=0||answers[5]===2?'CALM':['RESTORE','ENDURE','RESTORE','CALM','BALANCE','ESSENTIAL'][answers[3]];
 var labels=qs.map(function(q,i){return (Array.isArray(answers[i])?answers[i]:[answers[i]]).map(function(n){return q.options[n];}).join(' | ');});
 var book=SpreadsheetApp.openById(target),sheet=book.getSheetByName('Skin Quiz')||book.insertSheet('Skin Quiz'),expected=skinQuizHeaders(),headers;
 if(sheet.getLastRow()===0){sheet.appendRow(expected);sheet.setFrozenRows(1);headers=expected.slice();}
 else {
  headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];
  if(headers.some(function(h,i){return h&&headers.indexOf(h)!==i;}))return {ok:false};
  if(qs.some(function(q){return headers.indexOf(q.title)<0;}))return {ok:false};
  var missing=expected.filter(function(h){return headers.indexOf(h)<0;});
  if(missing.length){sheet.getRange(1,headers.length+1,1,missing.length).setValues([missing]);headers=headers.concat(missing);}
 }
 var idColumn=headers.indexOf('Submission ID'),existing=sheet.getLastRow()>1?sheet.getRange(2,idColumn+1,sheet.getLastRow()-1,1).getDisplayValues():[],index=existing.findIndex(function(r){return r[0]===input.submissionId;}),row=index<0?sheet.getLastRow()+1:index+2;
 var valuesByHeader={'Submission ID':input.submissionId,'Consent version':'skin-quiz-v1','Result':primary};
 qs.forEach(function(q,i){valuesByHeader[q.title]=labels[i];});
 if(index<0){valuesByHeader['Submitted at (UTC)']=new Date().toISOString();var values=headers.map(function(h){return valuesByHeader[h]||'';});sheet.getRange(row,1,1,values.length).setNumberFormat('@');sheet.getRange(row,1,1,values.length).setValues([values]);SpreadsheetApp.flush();}
 var saved=sheet.getRange(row,1,1,headers.length).getDisplayValues()[0];
 if(Object.keys(valuesByHeader).some(function(h){return saved[headers.indexOf(h)]!==valuesByHeader[h];}))return {ok:false};
 return {ok:true,spreadsheetId:target,submissionId:input.submissionId,sheetName:'Skin Quiz'};
}


/** Existing values are preserved. No secrets are printed. */
function setupSkinResearch() {
 SpreadsheetApp.openById('1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA').getName();
 var props=PropertiesService.getScriptProperties();
 if(!props.getProperty('SKIN_PROFILE_RESEARCH_SECRET'))props.setProperty('SKIN_PROFILE_RESEARCH_SECRET',Utilities.getUuid()+Utilities.getUuid());
}
