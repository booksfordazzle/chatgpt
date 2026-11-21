import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSubmissionLimiter, rejectsBrowserOrigin } from '../netlify/functions/lib/request-guard.mjs';
import { createHandler } from '../netlify/functions/waitlist.mjs';

const env = { GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/test-deployment/exec', WAITLIST_SHARED_SECRET: 'server-test-secret' };
const event = (email = 'person@example.com', headers = {}) => ({ httpMethod: 'POST', headers: { host: 'primal.test', origin: 'https://primal.test', 'content-type': 'application/json', accept: 'application/json', ...headers }, body: JSON.stringify({ email, consent: true }) });

test('rate limits are case-insensitive, expire, and cannot be bypassed by changing email on the same verified IP', () => {
 let time = 1000;
 const limit = createSubmissionLimiter({ now: () => time, windowMs: 10000, emailLimit: 2, ipLimit: 3 });
 const headers = { 'x-vercel-forwarded-for': '192.0.2.1' };
 assert(limit('person@example.com', headers).allowed);
 assert(limit('PERSON@example.com', headers).allowed);
 assert.equal(limit('person@example.com', headers).allowed, false);
 assert(limit('other@example.com', headers).allowed);
 assert.equal(limit('third@example.com', headers).allowed, false);
 time += 10001;
 assert(limit('person@example.com', headers).allowed);
});

test('rate limiter has bounded memory and does not drop active guards on key churn', () => {
 const limit = createSubmissionLimiter({ capacity: 2, emailLimit: 1 });
 assert(limit('a@example.com').allowed); assert(limit('b@example.com').allowed);
 assert.equal(limit('c@example.com').allowed, false);
 assert.equal(limit('a@example.com').allowed, false);
});

test('cross-site fetch metadata and malformed origins cannot bypass origin checks', () => {
 for (const headers of [
  { 'sec-fetch-site': 'cross-site' },
  { origin: 'https://attacker.test', host: 'primal.test' },
  { origin: 'null', host: 'primal.test' },
  { origin: 'https://primal.test' },
  { origin: 'https://primal.test/attacker', host: 'primal.test' },
  { origin: 'https://user:password@primal.test', host: 'primal.test' }
 ]) assert(rejectsBrowserOrigin(headers));
 assert.equal(rejectsBrowserOrigin({ origin: 'https://primal.test', host: 'primal.test' }), false);
});

test('blocked waitlist attempts return a retry interval and never reach the receiver', async () => {
 let calls = 0;
 const handler = createHandler({ env, fetchImpl: async () => { calls++; return new Response('{"ok":true}'); } });
 for (let i = 0; i < 5; i++) assert.equal((await handler(event())).statusCode, 200);
 const result = await handler(event('PERSON@example.com'));
 assert.equal(result.statusCode, 429);
 assert.equal(JSON.parse(result.body).error, 'rate_limited');
 assert(Number(result.headers['Retry-After']) > 0); assert.equal(calls, 5);
 const crossSite = await handler(event('new@example.com', { 'sec-fetch-site': 'cross-site' }));
 assert.equal(crossSite.statusCode, 403); assert.equal(calls, 5);
});

test('hosting policies protect transport, frame embedding and script execution consistently', async () => {
 const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
 const headers = Object.fromEntries(vercel.headers[0].headers.map(({ key, value }) => [key, value]));
 const netlify = await readFile('netlify.toml', 'utf8');
 for (const name of ['Strict-Transport-Security', 'Cross-Origin-Opener-Policy', 'Cross-Origin-Resource-Policy', 'Content-Security-Policy']) {
  assert(headers[name]); assert(netlify.includes(`${name} = "${headers[name]}"`));
 }
 assert.match(headers['Content-Security-Policy'], /script-src 'self' https:\/\/www\.googletagmanager\.com;/);
 assert.match(headers['Content-Security-Policy'], /frame-ancestors 'none'/);
 assert.match(headers['Content-Security-Policy'], /upgrade-insecure-requests/);
 assert.doesNotMatch(headers['Content-Security-Policy'], /unsafe-inline|unsafe-eval/);
});

test('contact normal submission flow enables hosted CAPTCHA instead of the AJAX bypass', async () => {
 for (const file of ['public/contact.html', 'public/en/contact.html']) {
  const html = await readFile(file, 'utf8');
  assert.match(html, /<input\b(?=[^>]*name="_captcha")(?=[^>]*value="true")[^>]*>/);
  assert.match(html, /name="_honey"/);
  assert.doesNotMatch(html, /chatgpt-weld-mu-98\.vercel\.app/);
 }
 assert.doesNotMatch(await readFile('public/site.js', 'utf8'), /formsubmit.co\/ajax/);
});

test('oversized declared request bodies are rejected before parsing or invoking storage', async () => {
 const { createVercelHandler } = await import('../api/waitlist.js');
 let called = false;
 const handler = createVercelHandler(async () => { called = true; throw Error('must not reach receiver'); });
 const response = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(body) { this.body = body; } };
 const request = { headers: { 'content-length': '10000000' }, get body() { throw Error('must not read body'); } };
 await handler(request, response);
 assert.equal(response.statusCode, 413); assert.equal(called, false);
 assert.equal(response.headers['Cache-Control'], 'no-store');
 assert.deepEqual(JSON.parse(response.body), { ok: false, error: 'invalid_request' });
});
