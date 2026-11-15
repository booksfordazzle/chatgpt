import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createVercelHandler } from '../api/waitlist.js';
import { createHandler } from '../netlify/functions/waitlist.mjs';

function response() {
  return { statusCode: 200, headers: {}, body: '', setHeader(key, value) { this.headers[key] = value; }, end(body) { this.body = body; } };
}
const headers = { 'content-type': 'application/json', accept: 'application/json', host: 'primal.test', origin: 'https://primal.test' };
const env = { GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/test/exec', WAITLIST_SHARED_SECRET: 'test-only-secret' };
const app = () => createVercelHandler(createHandler({ env, fetchImpl: async () => new Response('{"ok":true}') }));

test('Vercel parsed JSON reaches the shared confirmed-storage handler', async () => {
  const res = response();
  await app()({ method: 'POST', headers, body: { email: 'person@example.com', consent: true } }, res);
  assert.equal(res.statusCode, 200); assert.deepEqual(JSON.parse(res.body), { ok: true }); assert.equal(res.headers['Cache-Control'], 'no-store');
});

test('Vercel parsed native US form preserves localised redirects', async () => {
  const res = response();
  await app()({ method: 'POST', headers: { ...headers, accept: 'text/html', 'content-type': 'application/x-www-form-urlencoded' }, body: { email: 'person@example.com', consent: 'true', lang: 'en-US' } }, res);
  assert.equal(res.statusCode, 303); assert.equal(res.headers.Location, '/en/thanks.html');
});

test('Vercel raw streams and buffers are supported without bypassing validation', async () => {
  const req = Readable.from(['{"email":"person@', 'example.com","consent":true}']); req.method = 'POST'; req.headers = headers;
  const res = response(); await app()(req, res); assert.equal(res.statusCode, 200);
  const invalid = response(); await app()({ method: 'POST', headers, body: Buffer.from('{"email":"invalid","consent":true}') }, invalid); assert.equal(invalid.statusCode, 400);
});

test('Vercel caps request bodies and rejects wrong origins and GET', async () => {
  let calls = 0;
  const adapter = createVercelHandler(async () => { calls++; return { statusCode: 200, body: '' }; });
  for (const req of [{ method: 'POST', headers, body: 'x'.repeat(4097) }, Object.assign(Readable.from(['x'.repeat(4097)]), { method: 'POST', headers })]) {
    const res = response(); await adapter(req, res); assert.equal(res.statusCode, 413);
  }
  assert.equal(calls, 0);
  const cross = response(); await app()({ method: 'POST', headers: { ...headers, origin: 'https://other.test' }, body: { email: 'person@example.com', consent: true } }, cross); assert.equal(cross.statusCode, 403);
  const get = response(); await app()({ method: 'GET', headers, body: '' }, get); assert.equal(get.statusCode, 405);
});

test('Vercel never claims success without configured storage and does not expose unexpected errors', async () => {
  const res = response(); await createVercelHandler(createHandler({ env: {} }))({ method: 'POST', headers, body: { email: 'person@example.com', consent: true } }, res); assert.equal(res.statusCode, 503);
  const failed = response(); await createVercelHandler(async () => { throw Error('private upstream detail'); })({ method: 'POST', headers, body: '' }, failed); assert.equal(failed.statusCode, 500); assert.ok(!failed.body.includes('private upstream'));
});
