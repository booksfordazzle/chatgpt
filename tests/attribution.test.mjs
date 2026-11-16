import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const context = vm.createContext({ URL, URLSearchParams, Promise });
vm.runInContext(readFileSync(new URL('../public/attribution.js', import.meta.url), 'utf8'), context);
const api = context.PrimalAttribution;
const memoryStorage = () => { const data = new Map(); return { getItem: key => data.get(key) || null, setItem: (key, value) => data.set(key, value), data }; };
const create = (storage, path = '/', search = '', referrer = '', navigator = { userAgent: 'Windows Chrome/120.0 Safari/537.36' }) => api.create({ storage, location: { pathname: path, search }, document: { referrer }, navigator, window: { innerWidth: 390, innerHeight: 844 } });

test('UTMs and the full entry URLs survive navigation without being emptied or replaced by internal referrers', async () => {
 const storage = memoryStorage();
 const entry = create(storage, '/', '?utm_source=instagram&utm_medium=bio&utm_campaign=launch_test&utm_content=test-post', 'https://www.instagram.com/profile?link=bio');
 await entry.ready;
 const formPage = create(storage, '/en/', '', 'https://primal.test/');
 const payload = await formPage.ready;
 assert.equal(payload.utm_source, 'instagram'); assert.equal(payload.utm_medium, 'bio'); assert.equal(payload.utm_campaign, 'launch_test'); assert.equal(payload.utm_content, 'test-post');
 assert.equal(payload.utm_term, ''); assert.equal(payload.referrer_full, 'https://www.instagram.com/profile?link=bio');
 assert.equal(payload.referrer_origin, 'https://www.instagram.com');
 assert.equal(payload.landing_page, '/?utm_source=instagram&utm_medium=bio&utm_campaign=launch_test&utm_content=test-post');
 assert.equal(payload.landing_path, '/');
 assert.equal(create(storage, '/contact.html', '?utm_source=').snapshot().utm_source, 'instagram');
 assert.equal(create(storage, '/contact.html', '?utm_source=threads').snapshot().utm_source, 'threads');
 assert.equal(create(memoryStorage()).snapshot().utm_source, '');
 for (const value of Object.values(payload)) assert.equal(typeof value, 'string');
 const saved = [...storage.data.values()].join('');
 assert.doesNotMatch(saved, /visitor_id|session_id|fingerprint|ip_address|email|consent/i);
});

test('blocked, corrupt or unavailable sessionStorage never prevents submission', async () => {
 const blocked = { getItem() { throw Error(); }, setItem() { throw Error(); } };
 const first = create(blocked, '/', '?utm_source=facebook'); await first.ready;
 assert.equal(first.snapshot().utm_source, 'facebook');
 const corrupt = { getItem: () => '[1,2]', setItem() {} };
 assert.equal(create(corrupt).snapshot().utm_source, '');
 assert.equal(create(undefined).snapshot().utm_campaign, '');
});

test('device/OS/browser categories distinguish tablets, iOS Chrome, Safari, Firefox, Edge and Brave', async () => {
 const cases = [
  ['Mozilla iPhone CPU iPhone OS 17_0 like Mac OS X AppleWebKit CriOS/120.0 Mobile Safari/604.1', 'mobile', 'iOS', 'Chrome'],
  ['Mozilla iPhone CPU iPhone OS 17_0 AppleWebKit Version/17 Mobile Safari/604.1', 'mobile', 'iOS', 'Safari'],
  ['Mozilla iPad CPU OS 17_0 AppleWebKit Mobile Safari/604.1', 'tablet', 'iOS', 'Safari'],
  ['Mozilla Android 14 Tablet Chrome/120.0 Safari/537.36', 'tablet', 'Android', 'Chrome'],
  ['Mozilla Android 14 Mobile Chrome/120.0 Safari/537.36', 'mobile', 'Android', 'Chrome'],
  ['Mozilla Windows NT 10.0 Chrome/120 Safari/537.36 Edg/120.0', 'desktop', 'Windows', 'Edge'],
  ['Mozilla iPhone FxiOS/120.0 Mobile Safari/604.1', 'mobile', 'iOS', 'Firefox'],
  ['Mozilla Macintosh Mac OS X Version/17 Safari/605.1', 'desktop', 'macOS', 'Safari'],
  ['Mozilla Linux Firefox/120.0', 'desktop', 'Linux', 'Firefox']
 ];
 for (const [userAgent, device, os, browser] of cases) {
  const navigator = { userAgent };
  assert.equal(api.device(navigator, 390), device); assert.equal(api.os(navigator, 390), os); assert.equal(api.browser(navigator), browser);
 }
 const ipad = { userAgent: 'Mozilla Macintosh Mac OS X Version/17 Safari/605.1', maxTouchPoints: 5 };
 assert.equal(api.device(ipad, 1024), 'tablet'); assert.equal(api.os(ipad, 1024), 'iOS');
 const brave = create(memoryStorage(), '/', '', '', { userAgent: 'Mozilla Windows Chrome/120 Safari/537.36', brave: { isBrave: async () => true } });
 assert.equal((await brave.ready).browser, 'Brave');
});

test('viewport reflects the current screen and only requested fields are retained', async () => {
 const window = { innerWidth: 1440, innerHeight: 900 };
 const capture = api.create({ storage: memoryStorage(), location: { pathname: '/', search: '' }, document: { referrer: '' }, navigator: { userAgent: 'test' }, window });
 await capture.ready; assert.equal(capture.snapshot().viewport, '1440x900');
 window.innerWidth = 1024; window.innerHeight = 768;
 const payload = capture.snapshot(); assert.equal(payload.screen_width, '1024'); assert.equal(payload.viewport, '1024x768');
 assert.equal(payload.referrer_full, ''); assert.equal(payload.os, 'Other'); assert.equal(payload.browser, 'Other');
});
