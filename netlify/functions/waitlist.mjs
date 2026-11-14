const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export function createHandler({ env = process.env, fetchImpl = fetch } = {}) {
  return async function handler(event) {
    const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' };
    const json = /application\/json/i.test(event.headers?.accept || '');
    const reply = (statusCode, ok, error) => json || event.httpMethod !== 'POST'
      ? { statusCode, headers, body: JSON.stringify({ ok, ...(error ? { error } : {}) }) }
      : { statusCode: 303, headers: { ...headers, Location: ok ? '/thanks.html' : '/signup-unavailable.html' }, body: '' };
    if (event.httpMethod !== 'POST') return { ...reply(405, false, 'method_not_allowed'), headers: { ...headers, Allow: 'POST' } };
    const origin = event.headers?.origin;
    const host = event.headers?.host;
    if (origin && host) { try { if (new URL(origin).host !== host) return reply(403, false, 'origin_rejected'); } catch { return reply(403, false, 'origin_rejected'); } }
    if (event.isBase64Encoded || !event.body || Buffer.byteLength(event.body) > 4096) return reply(400, false, 'invalid_request');
    let data;
    try {
      const type = event.headers?.['content-type'] || '';
      if (type.includes('application/json')) data = JSON.parse(event.body);
      else if (type.includes('application/x-www-form-urlencoded')) data = Object.fromEntries(new URLSearchParams(event.body));
      else return reply(415, false, 'unsupported_content_type');
    } catch { return reply(400, false, 'invalid_request'); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400, false, 'invalid_request');
    // Silently discard the honeypot; never write bot submissions to Sheets.
    if (data.website) return reply(400, false, 'invalid_request');
    const email = typeof data.email === 'string' ? data.email.trim() : '';
    if (email.length > 254 || !EMAIL.test(email) || /[\r\n\x00]/.test(email)) return reply(400, false, 'invalid_email');
    if (data.consent !== true && data.consent !== 'true') return reply(400, false, 'consent_required');
    let endpoint;
    try { endpoint = new URL(env.GOOGLE_APPS_SCRIPT_URL); } catch { return reply(503, false, 'not_configured'); }
    if (endpoint.protocol !== 'https:' || endpoint.hostname !== 'script.google.com' || !/^\/macros\/s\/[^/]+\/exec$/.test(endpoint.pathname) || !env.WAITLIST_SHARED_SECRET) return reply(503, false, 'not_configured');
    try {
      const response = await fetchImpl(endpoint.href, {
        method: 'POST', redirect: 'follow', signal: AbortSignal.timeout(18000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true, token: env.WAITLIST_SHARED_SECRET, policyVersion: '2026-11-14', source: 'primal-core-waitlist' })
      });
      if (!response.ok) return reply(502, false, 'storage_unavailable');
      const result = await response.json();
      if (result.ok !== true) return reply(502, false, 'storage_unconfirmed');
      return reply(200, true);
    } catch { return reply(502, false, 'storage_unavailable'); }
  };
}
export const handler = createHandler();
