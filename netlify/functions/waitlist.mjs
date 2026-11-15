const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const SOURCES = new Set(['primal-core-waitlist', 'primal-core-hero', 'primal-core-footer']);
const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const clean = (value, limit) => typeof value === 'string'
  ? value.trim().replace(/[\x00-\x1f\x7f]/g, '').slice(0, limit) : null;

export function createHandler({ env = process.env, fetchImpl = fetch, report = entry => console.warn('[waitlist]', JSON.stringify(entry)) } = {}) {
  return async function handler(event) {
    const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' };
    const json = /application\/json/i.test(event.headers?.accept || '');
    let languagePrefix = '';
    const reply = (statusCode, ok, error, diagnostic) => json || event.httpMethod !== 'POST'
      ? { statusCode, headers, body: JSON.stringify({ ok, ...(error ? { error } : {}), ...(diagnostic ? { diagnostic } : {}) }) }
      : { statusCode: 303, headers: { ...headers, Location: languagePrefix + (ok ? '/thanks.html' : '/signup-unavailable.html') }, body: '' };
    if (event.httpMethod !== 'POST') return { ...reply(405, false, 'method_not_allowed'), headers: { ...headers, Allow: 'POST' } };
    const origin = event.headers?.origin;
    const host = event.headers?.host;
    if (origin && host) { try { if (new URL(origin).host !== host) return reply(403, false, 'origin_rejected'); } catch { return reply(403, false, 'origin_rejected'); } }
    if (event.isBase64Encoded || typeof event.body !== 'string' || !event.body || Buffer.byteLength(event.body) > 4096) return reply(400, false, 'invalid_request');
    let data;
    try {
      const type = event.headers?.['content-type'] || '';
      if (type.includes('application/json')) data = JSON.parse(event.body);
      else if (type.includes('application/x-www-form-urlencoded')) data = Object.fromEntries(new URLSearchParams(event.body));
      else return reply(415, false, 'unsupported_content_type');
    } catch { return reply(400, false, 'invalid_request'); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400, false, 'invalid_request');
    const locale = data.lang === 'en' || data.lang === 'en-US' ? 'en-US' : 'el';
    languagePrefix = locale === 'en-US' ? '/en' : '';
    if (data.website) return reply(400, false, 'invalid_request');
    const email = typeof data.email === 'string' ? data.email.trim() : '';
    if (email.length > 254 || !EMAIL.test(email) || /[\r\n\x00]/.test(email)) return reply(400, false, 'invalid_email');
    if (data.consent !== true && data.consent !== 'true') return reply(400, false, 'consent_required');

    let endpoint;
    const secret = env.WAITLIST_SHARED_SECRET;
    try {
      endpoint = new URL(env.GOOGLE_APPS_SCRIPT_URL);
      if (endpoint.protocol !== 'https:' || endpoint.hostname !== 'script.google.com'
        || endpoint.port || endpoint.username || endpoint.password || endpoint.search || endpoint.hash
        || !/^\/macros\/s\/[^/]+\/exec$/.test(endpoint.pathname) || !secret) throw Error();
    } catch { return reply(503, false, 'not_configured'); }

    const utm = {};
    for (const name of CAMPAIGN_KEYS) { const value = clean(data[name], 128); if (value) utm[name] = value; }
    let referrerOrigin = null;
    try { const url = new URL(data.referrer_origin); if (url.protocol === 'https:' || url.protocol === 'http:') referrerOrigin = url.origin.slice(0, 256); } catch {}
    const landing = clean(data.landing_path, 256);
    // Only the pathname is retained, never potentially identifying queries/fragments.
    const landingPath = landing?.startsWith('/') && !landing.startsWith('//') ? landing.split(/[?#]/)[0] : null;
    const source = SOURCES.has(data.source) ? data.source : 'primal-core-waitlist';
    const storageFailure = (diagnostic, error = 'storage_unavailable', upstreamStatus) => {
      // Only fixed reason codes and HTTP status numbers are emitted. Never log URLs,
      // response bodies, exception messages, emails or the shared secret.
      try { report({ code: diagnostic, ...(upstreamStatus ? { upstreamStatus } : {}) }); } catch {}
      return reply(502, false, error, diagnostic);
    };
    try {
      const signal = AbortSignal.timeout(18000);
      let response = await fetchImpl(endpoint.href, {
        method: 'POST', redirect: 'manual', signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true, token: secret, locale, source,
          policyVersion: '2026-11-15-sheets-v1', consentTextVersion: 'launch-updates-v1',
          utm, referrerOrigin, landingPath })
      });
      // Apps Script ContentService serves its JSON through this Google-only redirect.
      // Never forward the POST body/shared secret to the redirect destination.
      if (response.status === 302 || response.status === 303) {
        let target;
        try { target = new URL(response.headers.get('location')); }
        catch { return storageFailure('google_redirect_invalid'); }
        if (target.hostname === 'accounts.google.com') return storageFailure('google_login_required');
        if (target.protocol !== 'https:' || target.hostname !== 'script.googleusercontent.com'
          || target.port || target.username || target.password || target.pathname !== '/macros/echo') return storageFailure('google_redirect_rejected');
        response = await fetchImpl(target.href, { method: 'GET', redirect: 'error', signal });
      }
      if (!response.ok) return storageFailure(`google_http_${response.status}`, 'storage_unavailable', response.status);
      let result;
      try { result = await response.json(); }
      catch { return storageFailure('google_non_json_response'); }
      if (!result || result.ok !== true) return storageFailure('receiver_not_confirmed', 'storage_unconfirmed');
      return reply(200, true);
    } catch (error) {
      return storageFailure(error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 'google_timeout' : 'google_network_error');
    }
  };
}
export const handler = createHandler();
