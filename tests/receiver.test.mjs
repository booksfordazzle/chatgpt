import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8');
const legacyHeaders = ['Email','Registered at (UTC)','Consent','Privacy version','Source'];
function receiver(initialRows = []) {
  const rows = initialRows.map(row => [...row]); let locked = false, flushed = 0;
  const props = { WAITLIST_SHARED_SECRET: 'test-secret', SPREADSHEET_ID: 'test-sheet' };
  const sheet = {
    getLastRow: () => rows.length, getLastColumn: () => Math.max(0, ...rows.map(r => r.length)),
    appendRow: row => rows.push(Array.from(row)), setFrozenRows: () => {},
    getRange: (row, column, count, width = 1) => ({
      getDisplayValues: () => Array.from({ length: count }, (_, r) => Array.from({ length: width }, (_, c) => String(rows[row - 1 + r]?.[column - 1 + c] ?? '').replace(/^'/, ''))),
      setNumberFormat: () => {},
      setValues: values => { assert.equal(locked, true); for (let r = 0; r < values.length; r++) { rows[row - 1 + r] ||= []; for (let c = 0; c < values[r].length; c++) rows[row - 1 + r][column - 1 + c] = values[r][c]; } }
    })
  };
  const context = {
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => props[key], setProperty: (key, value) => { props[key] = value; } }) },
    LockService: { getScriptLock: () => ({ waitLock: () => { locked = true; }, releaseLock: () => { locked = false; } }) },
    SpreadsheetApp: { openById: id => { assert.equal(id, props.SPREADSHEET_ID); return { getSheetByName: () => rows.length ? sheet : null, insertSheet: () => sheet }; }, getActiveSpreadsheet: () => ({ getId: () => '1ptOmDxONI9KD_rLRZp0xGsjJezsOyIP0H3gd5HgleRg' }), flush: () => { flushed++; } },
    Utilities: { getUuid: () => 'test-generated-uuid' },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) }
  };
  vm.createContext(context); vm.runInContext(source, context);
  return { submit: data => context.doPost({ postData: { contents: JSON.stringify({ token: 'test-secret', consent: true, policyVersion: '2026-11-15-sheets-v1', consentTextVersion: 'launch-updates-v1', email: 'person@example.com', ...data }) } }), rows, props, setup: () => context.setupWaitlist(), state: () => ({ locked, flushed }) };
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
  assert.deepEqual(r.rows[1], old); assert.equal(r.rows[0].length, 15); assert.equal(r.rows[2].length, 15);
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
