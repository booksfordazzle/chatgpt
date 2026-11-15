import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../netlify/functions/waitlist.mjs';
const env = { GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/test-deployment/exec', WAITLIST_SHARED_SECRET: 'test-server-only-secret' };
const event = (data = {}, extra = {}) => ({ httpMethod: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json', host: 'primal.test', origin: 'https://primal.test' }, body: JSON.stringify({ email: 'person@example.com', consent: true, ...data }), ...extra });
const confirmed = async () => new Response('{"ok":true}');

test('Sheets receiver gets consent and bounded attribution; only confirmed storage succeeds', async () => {
  let sent;
  const handler = createHandler({ env, fetchImpl: async (url, options) => {
    sent = { url, ...options, body: JSON.parse(options.body) }; return confirmed();
  } });
  const result = await handler(event({ email: ' Person@example.com ', lang: 'en-US', source: 'primal-core-hero', utm_campaign: 'launch', referrer_origin: 'https://referrer.test/path?email=private', landing_path: '/en/?email=private' }));
  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body), { ok: true });
  assert.equal(sent.url, env.GOOGLE_APPS_SCRIPT_URL); assert.equal(sent.redirect, 'manual');
  assert.deepEqual(sent.body, { email: 'Person@example.com', consent: true, token: env.WAITLIST_SHARED_SECRET, locale: 'en-US', source: 'primal-core-hero', policyVersion: '2026-11-15-sheets-v1', consentTextVersion: 'launch-updates-v1', utm: { utm_campaign: 'launch' }, referrerOrigin: 'https://referrer.test', landingPath: '/en/' });
  assert.ok(!result.body.includes(env.WAITLIST_SHARED_SECRET));
});

test('follows only Google ContentService redirect with a credential-free GET', async () => {
  const calls = []; const handler = createHandler({ env, fetchImpl: async (url, options) => {
    calls.push({ url, ...options });
    return calls.length === 1 ? new Response('', { status: 302, headers: { location: 'https://script.googleusercontent.com/macros/echo?user_content_key=test-only' } }) : confirmed();
  } });
  assert.equal((await handler(event())).statusCode, 200); assert.equal(calls.length, 2);
  assert.equal(calls[1].method, 'GET'); assert.equal(calls[1].body, undefined); assert.equal(calls[1].headers, undefined); assert.equal(calls[1].redirect, 'error');
  let attempts = 0;
  const blocked = createHandler({ env, fetchImpl: async () => { attempts++; return new Response('', { status: 302, headers: { location: 'https://attacker.test/macros/echo' } }); } });
  assert.equal((await blocked(event())).statusCode, 502); assert.equal(attempts, 1);
});

test('invalid requests never reach storage', async () => {
  let calls = 0;
  const handler = createHandler({ env, fetchImpl: async () => { calls++; throw Error(); } });
  for (const data of [{ email: 'invalid' }, { email: 'a\nb@example.com' }, { consent: false }, { website: 'bot.example' }, { email: 'x'.repeat(255) + '@e.com' }]) assert.equal((await handler(event(data))).statusCode, 400);
  for (const body of ['null', '[]', '{bad', 'x'.repeat(4097)]) assert.equal((await handler(event({}, { body }))).statusCode, 400);
  assert.equal((await handler(event({}, { isBase64Encoded: true }))).statusCode, 400);
  assert.equal((await handler(event({}, { headers: { 'content-type': 'text/plain', accept: 'application/json' } }))).statusCode, 415);
  assert.equal(calls, 0);
});

test('unconfigured form fails honestly, including obsolete Supabase-only settings', async () => {
  for (const config of [{}, { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SECRET_KEY: 'obsolete-test-only' }]) {
    const result = await createHandler({ env: config })(event());
    assert.equal(result.statusCode, 503); assert.equal(JSON.parse(result.body).ok, false);
  }
});

test('rejects arbitrary endpoints, URL credentials/paths and cross-origin requests', async () => {
  for (const url of ['https://attacker.test', 'https://script.google.com.attacker.test/macros/s/test/exec', 'http://script.google.com/macros/s/test/exec', 'https://user:password@script.google.com/macros/s/test/exec', 'https://script.google.com/macros/s/test/dev', 'https://script.google.com/macros/s/test/exec?x=1', 'https://script.google.com:444/macros/s/test/exec']) {
    const result = await createHandler({ env: { ...env, GOOGLE_APPS_SCRIPT_URL: url } })(event()); assert.equal(result.statusCode, 503);
  }
  const handler = createHandler({ env, fetchImpl: confirmed });
  assert.equal((await handler(event({}, { headers: { ...event().headers, origin: 'https://other.test' } }))).statusCode, 403);
});

test('storage errors never expose SQL/credentials or claim success', async () => {
  for (const fetchImpl of [async () => new Response('{"ok":false}'), async () => new Response('{"code":"23505","details":"private@example.com"}', { status: 400 }), async () => new Response('<html>login</html>'), async () => new Response('null'), async () => new Response('[]'), async () => { throw Error('timeout'); }]) {
    const result = await createHandler({ env, fetchImpl })(event());
    assert.equal(result.statusCode, 502); assert.equal(JSON.parse(result.body).ok, false);
    assert.ok(!result.body.includes('private@example.com')); assert.ok(!result.body.includes('23505'));
  }
});

test('native browser submissions preserve Greek and US English redirects', async () => {
  for (const lang of ['el', 'en', 'en-US']) {
    const native = event({}, { headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'text/html' }, body: `email=person%40example.com&consent=true&lang=${lang}&source=primal-core-footer` });
    const prefix = lang === 'el' ? '' : '/en';
    const success = await createHandler({ env, fetchImpl: confirmed })(native);
    assert.equal(success.statusCode, 303); assert.equal(success.headers.Location, `${prefix}/thanks.html`);
    const failure = await createHandler({ env: {} })(native);
    assert.equal(failure.headers.Location, `${prefix}/signup-unavailable.html`);
  }
  assert.equal((await createHandler({ env })(event({}, { httpMethod: 'GET' }))).statusCode, 405);
});

test('untrusted metadata is bounded and cannot select locale, source or arbitrary URLs', async () => {
  let saved;
  const handler = createHandler({ env, fetchImpl: async (_url, options) => { saved = JSON.parse(options.body); return confirmed(); } });
  await handler(event({ lang: 'attacker', source: 'attacker', utm_source: 'x'.repeat(500), utm_content: { secret: 'no' }, referrer_origin: 'javascript:alert(1)', landing_path: '//attacker.test', consent_text_version: 'forged', privacy_version: 'forged' }));
  assert.equal(saved.locale, 'el'); assert.equal(saved.source, 'primal-core-waitlist');
  assert.equal(saved.utm.utm_source.length, 128); assert.equal(saved.utm.utm_content, undefined);
  assert.equal(saved.referrerOrigin, null); assert.equal(saved.landingPath, null);
  assert.equal(saved.consent_text_version, undefined); assert.equal(saved.privacy_version, undefined);
});
