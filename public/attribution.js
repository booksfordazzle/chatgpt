'use strict';
// Session-scoped, first-party attribution. No cookies, localStorage or visitor ID.
globalThis.PrimalAttribution = (() => {
  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const storageKey = 'primal-core-attribution-v1';
  const clean = (value, limit) => typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f]/g, '').slice(0, limit) : '';
  function isIPad(navigator, width) {
    return /iPad/i.test(navigator.userAgent || '') || (/Macintosh/i.test(navigator.userAgent || '') && navigator.maxTouchPoints > 1 && width <= 1366);
  }
  function device(navigator, width) {
    const ua = navigator.userAgent || '';
    if (isIPad(navigator, width) || /Tablet|Kindle|Silk|PlayBook/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return 'tablet';
    if (/iPhone|iPod|Mobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }
  function os(navigator, width) {
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua) || isIPad(navigator, width)) return 'iOS';
    if (/Android/i.test(ua)) return 'Android';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Macintosh|Mac OS X/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Other';
  }
  function browser(navigator, brave = false) {
    const ua = navigator.userAgent || '';
    if (/Edg(?:e|A|iOS)?\//i.test(ua)) return 'Edge';
    if (/Firefox\/|FxiOS\//i.test(ua)) return 'Firefox';
    if (brave) return 'Brave';
    if (/OPR\/|OPiOS\/|Opera|SamsungBrowser\//i.test(ua)) return 'Other';
    if (/Chrome\/|CriOS\/|Chromium\//i.test(ua)) return 'Chrome';
    if (/Safari\//i.test(ua)) return 'Safari';
    return 'Other';
  }
  function create({ location, document, navigator, window, storage }) {
    let stored = {};
    try {
      const raw = storage?.getItem(storageKey);
      if (raw && raw.length <= 12000) stored = JSON.parse(raw);
      if (!stored || typeof stored !== 'object' || Array.isArray(stored)) stored = {};
    } catch { stored = {}; }
    const query = new URLSearchParams(location.search || '');
    const attribution = {};
    for (const key of campaignKeys) {
      const current = clean(query.get(key), 128).trim();
      attribution[key] = current || clean(stored[key], 128);
    }
    attribution.landing_page = clean(stored.landing_page, 2048) || clean((location.pathname || '/') + (location.search || ''), 2048);
    // Retain the session entry referrer rather than replacing it with our own pages.
    attribution.referrer_full = typeof stored.referrer_full === 'string'
      ? clean(stored.referrer_full, 2048) : clean(document.referrer || '', 2048);
    let brave = false;
    function snapshot() {
      const width = Number.isFinite(window.innerWidth) && window.innerWidth > 0 ? Math.round(window.innerWidth) : '';
      const height = Number.isFinite(window.innerHeight) && window.innerHeight > 0 ? Math.round(window.innerHeight) : '';
      let referrerOrigin = '';
      try { const url = new URL(attribution.referrer_full); if (/^https?:$/.test(url.protocol)) referrerOrigin = url.origin; } catch {}
      const fields = { ...attribution, referrer_origin: referrerOrigin,
        landing_path: attribution.landing_page.split(/[?#]/)[0],
        device_type: device(navigator, width), os: os(navigator, width), browser: browser(navigator, brave),
        screen_width: String(width), viewport: width && height ? `${width}x${height}` : '' };
      try { storage?.setItem(storageKey, JSON.stringify(fields)); } catch {}
      return fields;
    }
    const ready = Promise.resolve().then(async () => {
      try { brave = Boolean(await navigator.brave?.isBrave?.()); } catch {}
      return snapshot();
    });
    snapshot(); // Persist even when this page has no signup form.
    return { snapshot, ready };
  }
  return { create, device, os, browser, campaignKeys, storageKey };
})();
