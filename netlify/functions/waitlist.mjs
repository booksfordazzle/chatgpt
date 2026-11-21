import { createSubmissionLimiter, rejectsBrowserOrigin } from './lib/request-guard.mjs';
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const SOURCES = new Set(['primal-core-waitlist', 'primal-core-skin-profile', 'primal-core-hero', 'primal-core-footer', 'primal_core_hero', 'primal_core_footer']);
const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const clean = (value, limit) => typeof value === 'string'
  ? value.trim().replace(/[\x00-\x1f\x7f]/g, '').slice(0, limit) : null;


// Recognise only fixed Google error-page signatures. Never return excerpts/titles.
function nonJsonDiagnostic(body) {
  const text = body.replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|quot|#39|amp);/g, ' ').replace(/\s+/g, ' ');
  if (/script function not found\s*:?\s*doPost/i.test(text)) return 'google_do_post_missing';
  if (/script completed but did not return|did not return anything/i.test(text)) return 'google_return_missing';
  if (/authorization is required|authorization required|hasn.t verified this app|access blocked.*app/i.test(text)) return 'google_authorization_required';
  if (/you need permission|request access|access denied/i.test(text)) return 'google_access_denied';
  if (/unable to open the file|file you have requested does not exist|deployment not found/i.test(text)) return 'google_deployment_unavailable';
  if (/our systems have detected unusual traffic|too many requests/i.test(text)) return 'google_traffic_blocked';
  if (/(?:ReferenceError|TypeError|SyntaxError|Exception)\s*:/i.test(text)) return 'google_script_error';
  if (/userHtmlFrame|google\.script\.run/i.test(body)) return 'google_html_service_response';
  return 'google_non_json_response';
}

export function createHandler({ env = process.env, fetchImpl = fetch, onRegistered, report = entry => console.warn('[waitlist]', JSON.stringify(entry)) } = {}) {
  const limitSubmission = createSubmissionLimiter();
  return async function handler(event) {
    const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' };
    const json = /application\/json/i.test(event.headers?.accept || '');
    let languagePrefix = '';
    const reply = (statusCode, ok, error, diagnostic, extra = {}) => json || event.httpMethod !== 'POST'
      ? { statusCode, headers, body: JSON.stringify({ ok, ...(error ? { error } : {}), ...(diagnostic ? { diagnostic } : {}), ...extra }) }
      : { statusCode: 303, headers: { ...headers, Location: languagePrefix + (ok ? '/thanks.html' : '/signup-unavailable.html') }, body: '' };
    if (event.httpMethod !== 'POST') return { ...reply(405, false, 'method_not_allowed'), headers: { ...headers, Allow: 'POST' } };
    if (rejectsBrowserOrigin(event.headers)) return reply(403, false, 'origin_rejected');
    if (event.isBase64Encoded || typeof event.body !== 'string' || !event.body || Buffer.byteLength(event.body) > 16384) return reply(400, false, 'invalid_request');
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

    const limit = limitSubmission(email, event.headers);
    if (!limit.allowed) {
      const result = reply(429, false, 'rate_limited');
      result.headers['Retry-After'] = String(limit.retryAfter);
      return result;
    }

    const utm = {};
    for (const name of CAMPAIGN_KEYS) { utm[name] = clean(data[name], 128) || ''; }
    let referrerOrigin = '';
    try { const url = new URL(data.referrer_origin); if (url.protocol === 'https:' || url.protocol === 'http:') referrerOrigin = url.origin.slice(0, 256); } catch {}
    const landing = clean(data.landing_path, 256);
    // Only the pathname is retained, never potentially identifying queries/fragments.
    const landingPath = landing?.startsWith('/') && !landing.startsWith('//') ? landing.split(/[?#]/)[0] : '';
    // Preserve legacy device reporting; never persist the raw User-Agent.
    const agent = event.headers?.['user-agent'] || '';
    const deviceType = ['mobile', 'tablet', 'desktop'].includes(data.device_type) ? data.device_type
      : agent ? (/Android|iPhone|iPad|iPod|Mobile/i.test(agent) ? 'mobile' : 'desktop') : 'unknown';
    const enumValue = (value, values) => values.includes(value) ? value : '';
    const device_type = enumValue(data.device_type, ['mobile', 'tablet', 'desktop']);
    const os = enumValue(data.os, ['iOS', 'Android', 'Windows', 'macOS', 'Linux', 'Other']);
    const browser = enumValue(data.browser, ['Chrome', 'Safari', 'Firefox', 'Edge', 'Brave', 'Other']);
    const landingPage = clean(data.landing_page, 2048) || '';
    const landing_page = landingPage.startsWith('/') && !landingPage.startsWith('//') ? landingPage : '';
    let referrer_full = '';
    try { const url = new URL(data.referrer_full); if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password) referrer_full = url.href.slice(0, 2048); } catch {}
    const width = String(data.screen_width ?? '');
    const screen_width = /^\d{1,5}$/.test(width) && Number(width) > 0 && Number(width) <= 20000 ? width : '';
    const viewport = typeof data.viewport === 'string' && /^\d{1,5}x\d{1,5}$/.test(data.viewport) ? data.viewport : '';
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
        body: JSON.stringify({ email, consent: true, token: secret, locale, source, ...(onRegistered ? { welcomeDelivery: 'immediate-v1' } : {}),
          policyVersion: '2026-11-15-sheets-v1', consentTextVersion: source === 'primal-core-skin-profile' ? 'skin-profile-education-launch-v1' : 'launch-updates-v1',
          utm, referrerOrigin, landingPath, deviceType, device_type, os, browser, landing_page, referrer_full, screen_width, viewport })
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
      const responseBody = await response.text();
      let result;
      try { result = JSON.parse(responseBody); }
      catch { return storageFailure(nonJsonDiagnostic(responseBody)); }
      if (!result || result.ok !== true) return storageFailure('receiver_not_confirmed', 'storage_unconfirmed');
      if (onRegistered && result.welcomeJob) {
        const job = result.welcomeJob;
        if (Number.isSafeInteger(job.rowNumber) && job.rowNumber >= 2 && job.email === email && job.locale === locale && job.deliveryMode === 'immediate' && typeof job.registeredAt === 'string' && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(job.registeredAt)) {
          try { onRegistered({rowNumber:job.rowNumber,email,locale,registeredAt:job.registeredAt,deliveryMode:'immediate'}); }
          catch { try { report({code:'welcome_schedule_failed'}); } catch {} }
        } else { try { report({code:'welcome_job_invalid'}); } catch {} }
      }
      return reply(200, true, undefined, undefined, result.welcomeDelivery ? {registration:result.welcomeDelivery==='duplicate'?'existing':['immediate','queued','disabled'].includes(result.welcomeDelivery)?'new':'confirmed'} : {});
    } catch (error) {
      return storageFailure(error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 'google_timeout' : 'google_network_error');
    }
  };
}
export const handler = createHandler();
