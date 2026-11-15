import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../netlify/functions/waitlist.mjs';
const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_test_only' };
const event = (data = {}, extra = {}) => ({ httpMethod: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json', host: 'primal.test', origin: 'https://primal.test' }, body: JSON.stringify({ email: 'person@example.com', consent: true, ...data }), ...extra });
const confirmed = async () => new Response('{"ok":true}');

test('Supabase RPC gets consent and bounded attribution; only confirmed commit succeeds', async () => {
  let sent;
  const handler = createHandler({ env, fetchImpl: async (url, options) => {
    sent = { url, ...options, body: JSON.parse(options.body) }; return confirmed();
  } });
  const result = await handler(event({ email: ' Person@example.com ', lang: 'en-US', source: 'primal-core-hero', utm_campaign: 'launch', referrer_origin: 'https://referrer.test/path?email=private', landing_path: '/en/?email=private' }));
  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body), { ok: true });
  assert.equal(sent.url, 'https://example.supabase.co/rest/v1/rpc/capture_waitlist');
  assert.equal(sent.redirect, 'error');
  assert.equal(sent.headers.apikey, env.SUPABASE_SECRET_KEY);
  assert.equal(sent.headers.Authorization, undefined);
  assert.deepEqual(sent.body, { p_email: 'Person@example.com', p_consent: true, p_locale: 'en-US', p_source: 'primal-core-hero', p_utm: { utm_campaign: 'launch' }, p_referrer_origin: 'https://referrer.test', p_landing_path: '/en/' });
  assert.ok(!result.body.includes(env.SUPABASE_SECRET_KEY));
});

test('legacy service-role JWT is supported only on the server', async () => {
  const legacy = { SUPABASE_URL: env.SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: 'test.jwt.signature' };
  let headers;
  await createHandler({ env: legacy, fetchImpl: async (_url, options) => { headers = options.headers; return confirmed(); } })(event());
  assert.equal(headers.apikey, legacy.SUPABASE_SERVICE_ROLE_KEY);
  assert.equal(headers.Authorization, `Bearer ${legacy.SUPABASE_SERVICE_ROLE_KEY}`);
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

test('unconfigured form fails honestly, including legacy Google-only settings', async () => {
  for (const config of [{}, { GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/example/exec', WAITLIST_SHARED_SECRET: 'legacy-test-only' }]) {
    const result = await createHandler({ env: config })(event());
    assert.equal(result.statusCode, 503); assert.equal(JSON.parse(result.body).ok, false);
  }
});

test('rejects arbitrary endpoints, URL credentials/paths and cross-origin requests', async () => {
  for (const url of ['https://attacker.test', 'https://example.supabase.co.attacker.test', 'http://example.supabase.co', 'https://user:password@example.supabase.co', 'https://example.supabase.co/wrong', 'https://example.supabase.co?x=1', 'https://example.supabase.co:444']) {
    const result = await createHandler({ env: { ...env, SUPABASE_URL: url } })(event()); assert.equal(result.statusCode, 503);
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
  assert.equal(saved.p_locale, 'el'); assert.equal(saved.p_source, 'primal-core-waitlist');
  assert.equal(saved.p_utm.utm_source.length, 128); assert.equal(saved.p_utm.utm_content, undefined);
  assert.equal(saved.p_referrer_origin, null); assert.equal(saved.p_landing_path, null);
  assert.equal(saved.consent_text_version, undefined); assert.equal(saved.privacy_version, undefined);
});
