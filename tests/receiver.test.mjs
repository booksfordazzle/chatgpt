import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8');
const legacyHeaders = ['Email','Registered at (UTC)','Consent','Privacy version','Source'];
function receiver(initialRows = [], options = {}) {
  const rows = initialRows.map(row => [...row]); let locked = false, flushed = 0;
  const props = { WAITLIST_SHARED_SECRET: 'test-secret', SPREADSHEET_ID: 'test-sheet', ...(options.props || {}) };
  const messages = [], triggers = [];
  const sheet = {
    getLastRow: () => rows.length, getLastColumn: () => Math.max(0, ...rows.map(r => r.length)),
    appendRow: row => rows.push(Array.from(row)), setFrozenRows: () => {},
    getRange: (row, column, count, width = 1) => ({
      getDisplayValues: () => Array.from({ length: count }, (_, r) => Array.from({ length: width }, (_, c) => String(rows[row - 1 + r]?.[column - 1 + c] ?? '').replace(/^'/, ''))),
      setNumberFormat: () => {},
      setValues: values => { assert.equal(locked, true); if (options.dropSignupWrite && row > 1) return; if (options.queueWriteFails && row > 1 && column > 1) throw Error('queue write failed'); for (let r = 0; r < values.length; r++) { rows[row - 1 + r] ||= []; for (let c = 0; c < values[r].length; c++) rows[row - 1 + r][column - 1 + c] = values[r][c]; } }
    })
  };
  const context = {
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => props[key], setProperty: (key, value) => { props[key] = value; } }) },
    LockService: { getScriptLock: () => ({ waitLock: () => { locked = true; }, tryLock: () => { locked = true; return true; }, hasLock: () => locked, releaseLock: () => { locked = false; } }) },
    SpreadsheetApp: { openById: id => { assert.equal(id, props.SPREADSHEET_ID); return { getSheetByName: () => rows.length ? sheet : null, insertSheet: () => sheet }; }, getActiveSpreadsheet: () => ({ getId: () => '1ptOmDxONI9KD_rLRZp0xGsjJezsOyIP0H3gd5HgleRg' }), flush: () => { flushed++; } },
    Utilities: { getUuid: () => 'test-generated-uuid' },
    MailApp: { getRemainingDailyQuota: () => options.quota ?? 100, sendEmail: message => { assert.equal(locked, false); assert.ok(flushed > 0); if (options.mailFails) throw Error('private provider error'); messages.push(message); } },
    ScriptApp: { getProjectTriggers: () => triggers, newTrigger: name => ({ timeBased() { return this; }, everyMinutes(minutes) { assert.equal(minutes, 5); return this; }, create() { triggers.push({ getHandlerFunction: () => name }); } }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) }
  };
  vm.createContext(context); vm.runInContext(source, context);
  return { submit: data => context.doPost({ postData: { contents: JSON.stringify({ token: 'test-secret', consent: true, policyVersion: '2026-11-15-sheets-v1', consentTextVersion: 'launch-updates-v1', email: 'person@example.com', ...data }) } }), rows, props, messages, triggers, setup: () => context.setupWaitlist(), setupMail: () => context.setupWelcomeEmails(), sendMail: () => context.sendPendingWelcomeEmails(), state: () => ({ locked, flushed }) };
}
test('Sheets saves email, receipt/version/locale/source/attribution and case-insensitive duplicates do not overwrite', () => {
  const r = receiver(); assert.equal(r.submit({ locale: 'en-US', source: 'primal-core-hero', utm: { utm_campaign: 'launch' }, referrerOrigin: 'https://example.com', landingPath: '/en/' }).ok, true);
  assert.equal(r.rows.length, 2); assert.equal(r.rows[1][0], "'person@example.com"); assert.equal(r.rows[1][2], 'true');
  assert.equal(r.rows[1][3], '2026-11-15-sheets-v1'); assert.equal(r.rows[1][5], r.rows[1][1]);
  assert.equal(r.rows[1][6], 'launch-updates-v1'); assert.equal(r.rows[1][7], 'en-US'); assert.equal(r.rows[1][10], 'launch');
  const before = [...r.rows[1]]; assert.equal(r.submit({ email: 'PERSON@example.com', locale: 'el' }).ok, true); assert.equal(r.rows.length, 2); assert.deepEqual(r.rows[1], before);
  assert.equal(r.state().locked, false);
});
test('Sheets upgrades old five-column headers without overwriting existing rows or consent dates', () => {
  const old = ["'old@example.com", '2026-01-01T00:00:00Z', 'true', '2026-11-14', 'old-source'];
  const r = receiver([legacyHeaders, old]); assert.equal(r.submit({}).ok, true);
  assert.deepEqual(r.rows[1], old); assert.equal(r.rows[0].length, 17); assert.equal(r.rows[2].length, 17);
});
test('unknown sheet layouts fail safely without overwriting data', () => {
  const initial = [['Customer','Email'],['User','existing@example.com']]; const r = receiver(initial);
  assert.equal(r.submit({}).ok, false); assert.deepEqual(r.rows, initial); assert.equal(r.state().locked, false);
});
test('Sheets rejects invalid secret, consent, policy and email without writes', () => {
  const r = receiver(); for (const data of [{ token: 'wrong' }, { consent: false }, { policyVersion: 'old' }, { consentTextVersion: 'forged' }, { email: 'invalid' }]) assert.equal(r.submit(data).ok, false);
  assert.equal(r.rows.length, 0);
});
test('Sheets escapes formula-like emails and campaign values and bounds attribution', () => {
  const r = receiver(); assert.equal(r.submit({ email: '=formula@example.com', utm: { utm_source: '=IMPORTXML()', utm_campaign: 'x'.repeat(500) } }).ok, true);
  assert.equal(r.rows[1][0], "'=formula@example.com"); assert.equal(r.rows[1][8], "'=IMPORTXML()"); assert.equal(r.rows[1][10].length, 128);
});
test('bound-sheet setup preserves existing secret and can be repeated safely', () => {
  const r = receiver(); r.setup(); r.setup(); assert.equal(r.props.WAITLIST_SHARED_SECRET, 'test-secret'); assert.equal(r.props.SPREADSHEET_ID, '1ptOmDxONI9KD_rLRZp0xGsjJezsOyIP0H3gd5HgleRg');
});

test('Sheets does not claim success when a signup cannot be read back', () => {
  const r = receiver([], { dropSignupWrite: true });
  assert.equal(r.submit({}).ok, false); assert.equal(r.rows.length, 1); assert.equal(r.state().locked, false);
});

test('welcome setup is repeatable and sends no messages itself', () => {
  const r = receiver(); r.setupMail(); r.setupMail();
  assert.equal(r.triggers.length, 1); assert.equal(r.props.WELCOME_EMAIL_ENABLED, 'true'); assert.equal(r.messages.length, 0);
});
test('welcome worker sends Greek/US mail once, only after confirmed storage and without holding signup lock', () => {
  const r = receiver([], { props: { WELCOME_EMAIL_ENABLED: 'true' } });
  assert.equal(r.submit({}).ok, true); assert.equal(r.messages.length, 0); assert.equal(r.rows[1][15], 'pending');
  r.sendMail(); assert.equal(r.messages.length, 1); assert.match(r.messages[0].subject, /Είσαι στη λίστα/); assert.equal(r.rows[1][15], 'sent'); assert.ok(r.rows[1][16]);
  r.submit({}); r.sendMail(); assert.equal(r.messages.length, 1);
  r.submit({ email: 'english@example.com', locale: 'en-US' }); r.sendMail(); assert.equal(r.messages.length, 2); assert.equal(r.messages[1].subject, 'You are on the PRIMAL CORE waitlist');
});
test('mail failures or exhausted quota preserve saved signups and do not cause automatic retries', () => {
  const failed = receiver([], { props: { WELCOME_EMAIL_ENABLED: 'true' }, mailFails: true });
  assert.equal(failed.submit({}).ok, true); failed.sendMail(); assert.equal(failed.rows.length, 2); assert.equal(failed.rows[1][15], 'failed'); failed.submit({}); failed.sendMail(); assert.equal(failed.rows[1][15], 'failed');
  const quota = receiver([], { props: { WELCOME_EMAIL_ENABLED: 'true' }, quota: 0 }); quota.submit({}); quota.sendMail(); assert.equal(quota.rows[1][15], 'pending'); assert.equal(quota.messages.length, 0);
});
test('duplicate after later activation queues one welcome; suppressed status is preserved', () => {
  const r = receiver(); r.submit({}); assert.equal(r.rows[1][15], 'not_enabled');
  r.props.WELCOME_EMAIL_ENABLED = 'true'; r.submit({}); assert.equal(r.rows[1][15], 'pending');
  r.rows[1][15] = 'suppressed'; r.submit({}); r.sendMail(); assert.equal(r.rows[1][15], 'suppressed'); assert.equal(r.messages.length, 0);
});
test('a failed readback never queues or sends a welcome', () => {
  const r = receiver([], { props: { WELCOME_EMAIL_ENABLED: 'true' }, dropSignupWrite: true });
  assert.equal(r.submit({}).ok, false); r.sendMail(); assert.equal(r.messages.length, 0);
});

test('optional welcome enqueue failure cannot invalidate an already verified signup', () => {
  const old = ["'person@example.com", '2026-01-01T00:00:00Z', 'true', '2026-11-14', 'old-source'];
  const r = receiver([legacyHeaders, old], { props: { WELCOME_EMAIL_ENABLED: 'true' }, queueWriteFails: true });
  assert.equal(r.submit({}).ok, true); assert.deepEqual(r.rows[1], old); assert.equal(r.messages.length, 0);
});
