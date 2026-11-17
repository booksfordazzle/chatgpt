import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { welcomeMessage } from '../server/welcome-email.mjs';
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
    UrlFetchApp: { fetch: (url, opts) => {
      assert.equal(url,opts.method==='get'?'https://primalcore.gr/api/welcome-email?receiver=1':'https://primalcore.gr/api/welcome-email');assert.equal(opts.headers.Authorization,'Bearer test-secret');assert.equal(locked,false);
      let code=200,result={ok:true};
      if(options.smtpUnavailable){code=503;result={ok:false,retrySafe:true};}
      else if(opts.method==='post'){
        const job=JSON.parse(opts.payload);
        const claim=context.doPost({postData:{contents:JSON.stringify({token:'test-secret',action:'claim-welcome-smtp',...job})}});
        assert.equal(claim.ok,true);
        if(options.mailFails){code=502;result={ok:false};}else messages.push(welcomeMessage(job.email,job.locale));
      }
      return {getResponseCode:()=>code,getContentText:()=>JSON.stringify(result)};
    } },
    ScriptApp: { getProjectTriggers: () => triggers, deleteTrigger: trigger => { triggers.splice(triggers.indexOf(trigger), 1); }, newTrigger: name => ({ timeBased() { return this; }, everyMinutes(minutes) { assert.equal(minutes, 5); return this; }, create() { triggers.push({ getHandlerFunction: () => name }); } }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) }
  };
  vm.createContext(context); vm.runInContext(source, context);
  return { submit: data => context.doPost({ postData: { contents: JSON.stringify({ token: 'test-secret', consent: true, policyVersion: '2026-11-15-sheets-v1', consentTextVersion: 'launch-updates-v1', email: 'person@example.com', ...data }) } }), rows, props, messages, triggers, setup: () => context.setupWaitlist(), setupMail: () => context.setupWelcomeEmails(), disableMail: () => context.disableWelcomeEmails(), sendMail: () => context.sendPendingWelcomeEmails(), state: () => ({ locked, flushed }) };
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
  assert.deepEqual(r.rows[1], old); assert.equal(r.rows[0].length, 24); assert.equal(r.rows[2].length, 24);
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


test('new signups remain saved and no welcome is queued or sent, even with the old enabled property', () => {
  const r = receiver([], { props: { WELCOME_EMAIL_ENABLED: 'true' } });
  assert.equal(r.submit({}).ok, true); assert.equal(r.rows[1][15], 'disabled');
  r.sendMail(); assert.equal(r.messages.length, 0);
  assert.equal(r.submit({}).ok, true); assert.equal(r.rows.length, 2);
});
test('disable helper removes only the welcome trigger and preserves records', () => {
  const r = receiver([], { props: { WELCOME_EMAIL_ENABLED: 'true' } }); r.submit({});
  const own = { getHandlerFunction: () => 'sendPendingWelcomeEmails' };
  const other = { getHandlerFunction: () => 'otherBusinessTask' };
  r.triggers.push(own, other); r.disableMail(); r.disableMail();
  assert.equal(r.props.WELCOME_EMAIL_ENABLED, 'false'); assert.deepEqual(r.triggers, [other]);
  assert.equal(r.rows.length, 2); assert.equal(r.props.WAITLIST_SHARED_SECRET, 'test-secret'); assert.equal(r.messages.length, 0);
});

test('device class appends safely to legacy sheets and rejects arbitrary device text', () => {
 const r = receiver([legacyHeaders, ["'old@example.com", 'old-date', 'true', 'old-policy', 'old-source']]);
 assert.equal(r.submit({deviceType:'mobile'}).ok,true);
 const column=r.rows[0].indexOf('Device type'); assert.equal(column,17); assert.equal(r.rows[2][column],'mobile');
 assert.equal(r.rows[1].length,5);
 assert.equal(r.submit({email:'second@example.com',deviceType:'=unsafe'}).ok,true); assert.equal(r.rows[3][column],'unknown');
});

test('six new columns append after existing columns and duplicates cannot overwrite existing attribution or consent', () => {
 const original = receiver(); original.submit({ email: 'old@example.com' });
 const oldHeaders = original.rows[0].slice(0, 18);
 const oldRow = original.rows[1].slice(0, 18);
 const r = receiver([oldHeaders, oldRow]);
 const data = { email: 'new@example.com', source: 'primal_core_hero', deviceType: 'tablet', device_type: 'tablet', os: 'iOS', browser: 'Safari', landing_page: '/?utm_source=instagram', referrer_full: 'https://www.instagram.com/profile?link=bio', screen_width: '1024', utm: { utm_source: 'instagram' } };
 assert.equal(r.submit(data).ok, true);
 assert.deepEqual(r.rows[0].slice(0,18), oldHeaders);
 assert.deepEqual(r.rows[0].slice(18), ['device_type','os','browser','landing_page','referrer_full','screen_width']);
 assert.deepEqual(r.rows[1], oldRow);
 assert.deepEqual(r.rows[2].slice(18), ['tablet','iOS','Safari','/?utm_source=instagram','https://www.instagram.com/profile?link=bio','1024']);
 assert.equal(r.rows[2][4], 'primal_core_hero');
 const before = [...r.rows[2]];
 assert.equal(r.submit({ ...data, email: 'NEW@example.com', os: 'Android', source: 'primal_core_footer' }).ok, true);
 assert.deepEqual(r.rows[2], before);
});

test('Vercel handler payload appends all new fields through the real Apps Script logic', async () => {
 const { createHandler } = await import('../netlify/functions/waitlist.mjs');
 const r = receiver();
 const handler = createHandler({ env: { GOOGLE_APPS_SCRIPT_URL:'https://script.google.com/macros/s/test/exec', WAITLIST_SHARED_SECRET:'test-secret' }, fetchImpl: async (_url, options) => new Response(JSON.stringify(r.submit(JSON.parse(options.body)))) });
 const payload = { email:'qa@example.com', consent:true, source:'primal-core-footer', lang:'en-US', utm_source:'instagram', utm_medium:'bio', utm_campaign:'launch_test', utm_content:'test-post', referrer_origin:'https://www.instagram.com', referrer_full:'https://www.instagram.com/profile?link=bio', landing_page:'/?utm_source=instagram&utm_medium=bio', landing_path:'/', device_type:'mobile', os:'iOS', browser:'Chrome', screen_width:'390', viewport:'390x844' };
 const result = await handler({ httpMethod:'POST', headers:{accept:'application/json','content-type':'application/json'}, body:JSON.stringify(payload) });
 assert.equal(result.statusCode,200);
 const row = Object.fromEntries(r.rows[0].map((key,i)=>[key,r.rows[1][i]]));
 assert.equal(row['UTM source'],'instagram'); assert.equal(row['UTM content'],'test-post'); assert.equal(row['device_type'],'mobile'); assert.equal(row.os,'iOS'); assert.equal(row.browser,'Chrome'); assert.equal(row.screen_width,'390');
 assert.equal(row['Consent'],'true'); assert.equal(row['Privacy version'],'2026-11-15-sheets-v1'); assert.equal(row['Consent text version'],'launch-updates-v1');
});


test('welcome setup is repeatable and queues only future confirmed signups, preserving old records', () => {
  const r = receiver(); r.submit({email:'old@example.com'}); const before=[...r.rows[1]];
  r.setupMail(); r.setupMail(); assert.equal(r.triggers.length,1);
  assert.equal(r.props.WAITLIST_SHARED_SECRET,'test-secret');
  r.submit({email:'new@example.com',locale:'el'}); r.sendMail(); r.sendMail();
  assert.deepEqual(r.rows[1],before); assert.equal(r.messages.length,1);
  assert.equal(r.messages[0].to,'new@example.com');
  assert(r.messages[0].text.startsWith('Καλώς ήρθες. Θα λάβεις μήνυμα όταν το PRIMAL CORE είναι έτοιμο προς διάθεση.'));
  assert.equal(r.messages[0].replyTo,'hello@primalcore.gr');assert.equal(r.messages[0].from.address,'hello@primalcore.gr');
  assert.equal(r.rows[2][15],'sent-thanks-v1'); assert(r.rows[2][16]);
  r.submit({email:'NEW@example.com'});r.sendMail();assert.equal(r.messages.length,1);
});
test('SMTP pre-send failures defer pending messages without losing signups and consent remains required', () => {
  const options={};const r=receiver([],options);r.setupMail();options.smtpUnavailable=true;assert.equal(r.submit({}).ok,true);
  assert.equal(r.submit({email:'no@example.com',consent:false}).ok,false);
  r.sendMail();assert.equal(r.messages.length,0);assert.equal(r.rows[1][15],'pending-thanks-v1');
  r.disableMail();r.sendMail();assert.equal(r.messages.length,0);
});
test('English welcome localizes the message and ambiguous failures never auto-resend', () => {
  const r=receiver();r.setupMail();r.submit({locale:'en-US'});r.sendMail();
  assert(r.messages[0].text.startsWith('Welcome.'));
  const failed=receiver([],{mailFails:true});failed.setupMail();assert.equal(failed.submit({}).ok,true);
  failed.sendMail();assert.equal(failed.rows[1][15],'review-thanks-v1');failed.sendMail();assert.equal(failed.messages.length,0);
});
test('historical pending and in-flight welcome statuses are never backfilled or resent',()=>{
 const r=receiver();r.setupMail();r.submit({email:'legacy@example.com'});r.rows[1][15]='pending';
 r.submit({email:'ambiguous@example.com'});r.rows[2][15]='sending-thanks-v1';r.sendMail();assert.equal(r.messages.length,0);
});

test('SMTP setup checks configuration and does not enable on failure',()=>{
 const r=receiver([],{smtpUnavailable:true});assert.throws(()=>r.setupMail(),/SMTP readiness/);assert.notEqual(r.props.WELCOME_EMAIL_ENABLED,'true');
});
test('SMTP claim requires matching saved consented row and can only succeed once',()=>{
 const r=receiver();r.setupMail();r.submit({});r.rows[1][15]='sending-thanks-v1';
 const job={action:'claim-welcome-smtp',rowNumber:2,email:'person@example.com',registeredAt:r.rows[1][1],locale:'el'};
 assert.equal(r.submit({...job,token:'wrong'}).ok,false);
 assert.equal(r.submit({...job,email:'other@example.com'}).ok,false);
 assert.equal(r.submit({...job,registeredAt:'forged'}).ok,false);
 r.rows[1][2]='false';assert.equal(r.submit(job).ok,false);r.rows[1][2]='true';
 assert.equal(r.submit(job).ok,true);assert.equal(r.submit(job).ok,false);assert.equal(r.rows[1][15],'smtp-claimed-thanks-v1');
});
test('old welcome settings cannot start SMTP until the new transport is enabled',()=>{
 const r=receiver([],{props:{WELCOME_EMAIL_ENABLED:'true',WELCOME_EMAIL_VERSION:'thank-you-v1'}});r.submit({});r.sendMail();assert.equal(r.messages.length,0);assert.equal(r.rows[1][15],'pending-thanks-v1');
});

test('authenticated receiver readiness is read-only and never queues or claims messages',()=>{
 const r=receiver();assert.equal(r.submit({action:'check-welcome-smtp',consent:false}).ok,true);assert.equal(r.rows.length,0);assert.equal(r.messages.length,0);
 assert.equal(r.submit({action:'check-welcome-smtp',token:'wrong'}).ok,false);
});
