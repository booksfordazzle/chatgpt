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
  assert.deepEqual(sent.body, { email: 'Person@example.com', consent: true, token: env.WAITLIST_SHARED_SECRET, locale: 'en-US', source: 'primal-core-hero', policyVersion: '2026-11-15-sheets-v1', consentTextVersion: 'launch-updates-v1', utm: { utm_source: '', utm_medium: '', utm_campaign: 'launch', utm_term: '', utm_content: '' }, referrerOrigin: 'https://referrer.test', landingPath: '/en/', deviceType: 'unknown', device_type: '', os: '', browser: '', landing_page: '', referrer_full: '', screen_width: '', viewport: '' });
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
  for (const body of ['null', '[]', '{bad', 'x'.repeat(16385)]) assert.equal((await handler(event({}, { body }))).statusCode, 400);
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
  assert.equal(saved.utm.utm_source.length, 128); assert.equal(saved.utm.utm_content, '');
  assert.equal(saved.referrerOrigin, ''); assert.equal(saved.landingPath, '');
  assert.equal(saved.consent_text_version, undefined); assert.equal(saved.privacy_version, undefined);
});

test('safe storage diagnostics distinguish access, redirects, HTTP, invalid responses and timeout without leaking data', async () => {
  const scenarios = [
    ['google_login_required', async () => new Response('', { status: 302, headers: { location: 'https://accounts.google.com/signin?private=do-not-expose' } })],
    ['google_redirect_invalid', async () => new Response('', { status: 302 })],
    ['google_redirect_rejected', async () => new Response('', { status: 302, headers: { location: 'https://attacker.test/?secret=do-not-expose' } })],
    ['google_http_403', async () => new Response('do-not-expose', { status: 403 })],
    ['google_http_404', async () => new Response('do-not-expose', { status: 404 })],
    ['google_non_json_response', async () => new Response('<html>do-not-expose</html>')],
    ['receiver_not_confirmed', async () => new Response('{"ok":false,"detail":"do-not-expose"}')],
    ['google_timeout', async () => { throw new DOMException('do-not-expose', 'TimeoutError'); }],
    ['google_network_error', async () => { throw Error('do-not-expose'); }]
  ];
  for (const [diagnostic, fetchImpl] of scenarios) {
    const entries = [];
    const result = await createHandler({ env, fetchImpl, report: entry => entries.push(entry) })(event());
    assert.equal(result.statusCode, 502); assert.equal(JSON.parse(result.body).diagnostic, diagnostic);
    assert.equal(entries.length, 1); assert.equal(entries[0].code, diagnostic);
    const output = result.body + JSON.stringify(entries);
    for (const privateText of ['do-not-expose', 'person@example.com', env.WAITLIST_SHARED_SECRET]) assert.ok(!output.includes(privateText));
  }
});

test('Google HTML signatures produce bounded diagnostic codes, never page contents', async () => {
  const scenarios = [
    ['google_do_post_missing', '<html>Script function not found: <b>doPost</b></html>'],
    ['google_return_missing', '<html>The script completed but did not return anything.</html>'],
    ['google_authorization_required', '<html>Authorization is required to perform that action.</html>'],
    ['google_access_denied', '<html>You need permission</html>'],
    ['google_deployment_unavailable', '<html>Sorry, unable to open the file at this time.</html>'],
    ['google_traffic_blocked', '<html>Our systems have detected unusual traffic</html>'],
    ['google_script_error', '<html>ReferenceError: privateData is not defined</html>'],
    ['google_html_service_response', '<html><iframe id="userHtmlFrame"></iframe></html>'],
    ['google_non_json_response', '<html>Other page</html>']
  ];
  for (const [diagnostic, page] of scenarios) {
    const entries = [];
    const result = await createHandler({ env, fetchImpl: async () => new Response(page + '<p>private@example.com ' + env.WAITLIST_SHARED_SECRET + '</p>'), report: entry => entries.push(entry) })(event());
    assert.equal(result.statusCode, 502); assert.equal(JSON.parse(result.body).diagnostic, diagnostic);
    assert.deepEqual(Object.keys(JSON.parse(result.body)).sort(), ['diagnostic','error','ok']);
    const output = result.body + JSON.stringify(entries);
    assert.ok(!output.includes('private@example.com')); assert.ok(!output.includes(env.WAITLIST_SHARED_SECRET)); assert.ok(!output.includes('privateData'));
  }
});

test('coarse device class survives both JS and native form requests without persisting the user agent', async () => {
 let saved; const handler=createHandler({env,fetchImpl:async(_,options)=>{saved=JSON.parse(options.body);return confirmed();}});
 await handler(event({device_type:'mobile'})); assert.equal(saved.deviceType,'mobile');
 const request=event(); request.headers['user-agent']='Mozilla iPhone Mobile private-browser-details';
 await handler(request); assert.equal(saved.deviceType,'mobile'); assert.ok(!JSON.stringify(saved).includes('private-browser-details'));
 request.headers['user-agent']='Mozilla Windows NT desktop'; await handler(request); assert.equal(saved.deviceType,'desktop');
 await handler(event({device_type:'=unsafe'})); assert.equal(saved.deviceType,'unknown');
});

test('new technical attribution reaches the receiver with unchanged consent and source and empty missing strings', async () => {
 let saved;
 const handler = createHandler({ env, fetchImpl: async (_url, options) => { saved = JSON.parse(options.body); return confirmed(); } });
 await handler(event({ source: 'primal_core_footer', device_type: 'tablet', os: 'iOS', browser: 'Safari', screen_width: '1024', viewport: '1024x768', landing_page: '/?utm_source=instagram&utm_medium=bio', referrer_full: 'https://www.instagram.com/profile?link=bio' }));
 assert.equal(saved.source, 'primal_core_footer'); assert.equal(saved.device_type, 'tablet'); assert.equal(saved.os, 'iOS'); assert.equal(saved.browser, 'Safari'); assert.equal(saved.screen_width, '1024'); assert.equal(saved.viewport, '1024x768');
 assert.equal(saved.landing_page, '/?utm_source=instagram&utm_medium=bio'); assert.equal(saved.referrer_full, 'https://www.instagram.com/profile?link=bio');
 assert.equal(saved.consent, true); assert.equal(saved.policyVersion, '2026-11-15-sheets-v1'); assert.equal(saved.consentTextVersion, 'launch-updates-v1');
 assert.ok(Object.values(saved.utm).every(value => value === ''));
 assert.ok(!('ip_address' in saved)); assert.ok(!('userAgent' in saved));
 await handler(event({ os: '=FORMULA()', browser: 'unsafe', landing_page: '//attacker.test', referrer_full: 'javascript:alert(1)', screen_width: '-1' }));
 for (const field of ['os', 'browser', 'landing_page', 'referrer_full', 'screen_width']) assert.equal(saved[field], '');
});

test('Skin Profile marketing has its own explicit purpose/version and contains no quiz or research answers',async()=>{
 let sent;const handler=createHandler({env,fetchImpl:async(_url,options)=>{sent=JSON.parse(options.body);return confirmed();}});
 const r=await handler(event({source:'primal-core-skin-profile',profile:'C',answers:[1,2,3],spend:3}));
 assert.equal(r.statusCode,200);assert.equal(sent.source,'primal-core-skin-profile');assert.equal(sent.consentTextVersion,'skin-profile-education-launch-v1');assert.equal(sent.profile,undefined);assert.equal(sent.answers,undefined);assert.equal(sent.spend,undefined);
});
