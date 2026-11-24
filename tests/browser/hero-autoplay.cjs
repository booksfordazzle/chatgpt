const assert = require('node:assert/strict');
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const engine = process.env.BROWSER_ENGINE || 'chromium';
const base = process.env.BASE_URL || 'http://localhost:8080';
const screenshots = process.env.HERO_SCREENSHOT_DIR;
const baseline = process.env.HERO_BASELINE_URL;
const sizes = [[360, 640], [390, 844], [430, 932], [768, 900], [1024, 768], [1440, 900], [1920, 1080]];
const waitlist = '.hero-signup';
const video = '.hero-video';

async function seedConsent(context) {
  await context.addInitScript(() => {
    localStorage.setItem('primal-analytics-consent-v1', JSON.stringify({
      version: 1, value: 'denied', at: Date.now()
    }));
  });
}

async function assertForeground(page, withinViewport = true) {
  const state = await page.locator('.hero-autoplay').evaluate((hero, withinViewport) => {
    const selectors = ['#hero-title', '#hero-waitlist-title',
      '#hero-email', '[type="submit"]', '.consent'];
    const visible = selectors.map(selector => {
      const node = hero.querySelector(selector);
      const box = node.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && (!withinViewport || (box.top >= 0 && box.bottom <= innerHeight))
        && box.left >= 0 && box.right <= innerWidth && !node.closest('[inert], [aria-hidden="true"]')
        && getComputedStyle(node).visibility === 'visible' && getComputedStyle(node).opacity === '1';
    });
    return { visible, overflow: document.documentElement.scrollWidth > innerWidth };
  }, withinViewport);
  assert.deepEqual(state.visible, [true, true, true, true, true]);
  assert.equal(state.overflow, false);
  await page.locator(waitlist + ' button').click({ trial: true, timeout: 2000 });
}

async function capture(page, url, path) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  if (await page.locator('#analytics-reject').isVisible()) await page.locator('#analytics-reject').click();
  await page.locator('.hero-poster').evaluate(image => image.decode());
  await page.waitForFunction(() => document.querySelector('.hero-video').currentTime > 0.2, null, { timeout: 10000 });
  await page.locator(video).evaluate(media => {
    media.pause();
    media.currentTime = 1;
    return new Promise(resolve => media.addEventListener('seeked', resolve, { once: true }));
  });
  await page.screenshot({ path, animations: 'disabled' });
}

async function run() {
  const browser = await playwright[engine].launch({
    executablePath: process.env.BROWSER_EXECUTABLE || undefined,
    ...(engine === 'chromium' ? { args: ['--no-sandbox'] } : {})
  });
  try {
    for (const [width, height] of sizes) {
      for (const route of ['/', '/en/']) {
        const context = await browser.newContext({ viewport: { width, height }, hasTouch: width <= 430 });
        await seedConsent(context);
        const page = await context.newPage();
        await page.goto(base + route, { waitUntil: 'domcontentloaded' });
        await assertForeground(page);
        const poster = page.locator('.hero-poster');
        await poster.evaluate(image => image.decode());
        const variant = width < 761 ? 'mobile' : 'desktop';
        assert.match(await poster.evaluate(image => image.currentSrc), new RegExp(variant));
        assert.match(await page.locator(video).getAttribute('src'), new RegExp(variant));
        if (screenshots && route === '/' && [390, 1440].includes(width)) {
          if (baseline) await capture(page, baseline + route, screenshots + '/before-' + variant + '.png');
          await capture(page, base + route, screenshots + '/after-' + variant + '.png');
        }
        await context.close();
        console.log('Foreground and poster', width, route);
      }
    }

    for (const [width, height] of [[360, 640], [390, 740], [1024, 768], [1440, 900]]) {
      const fresh = await browser.newContext({ viewport: { width, height } });
      const freshPage = await fresh.newPage();
      await freshPage.goto(base, { waitUntil: 'domcontentloaded' });
      assert(await freshPage.locator('#analytics-consent').isVisible());
      await freshPage.locator('#analytics-reject').click();
      await assertForeground(freshPage);
      await fresh.close();
    }

    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(() => {
      window.heroFrames = { samples: 0, hidden: 0 };
      function sample() {
        const title = document.querySelector('#hero-title');
        const form = document.querySelector('.hero-signup');
        if (title?.getBoundingClientRect().width && form) {
          window.heroFrames.samples++;
          if (getComputedStyle(title).opacity !== '1' || getComputedStyle(form).opacity !== '1' || form.inert) {
            window.heroFrames.hidden++;
          }
        }
        requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    const page = await context.newPage();
    let submitted;
    await page.route('**/api/waitlist', async route => {
      submitted = route.request().postDataJSON();
      await route.fulfill({ json: { ok: true, registration: 'new' } });
    });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    assert(await page.locator('#analytics-consent').isVisible());
    await page.evaluate(() => document.fonts.ready);
    const firstVisitTitle = await page.locator('#hero-title').boundingBox();
    const firstVisitSignup = await page.locator(waitlist).boundingBox();
    await page.locator('#analytics-reject').click();
    assert.equal(await page.evaluate(() => window.PrimalAnalytics.allowed()), false);
    const heroBox = await page.locator('.hero-autoplay').boundingBox();
    const titleBox = await page.locator('#hero-title').boundingBox();
    const signupBox = await page.locator(waitlist).boundingBox();
    const titleCenter = (titleBox.y + titleBox.height / 2 - heroBox.y) / heroBox.height;
    assert(titleCenter > .28 && titleCenter < .38, 'Headline should sit around one third of the way down the hero');
    assert(signupBox.y > heroBox.y + heroBox.height * .60, 'Signup should sit in the lower portion of the hero');
    assert.deepEqual(titleBox, firstVisitTitle);
    assert.deepEqual(signupBox, firstVisitSignup);

    await page.locator('.analytics-settings').click();
    assert(await page.locator('#analytics-consent').isVisible());
    assert.deepEqual(await page.locator('#hero-title').boundingBox(), titleBox);
    assert.deepEqual(await page.locator(waitlist).boundingBox(), signupBox);
    await page.locator('#analytics-reject').click();
    await assertForeground(page);
    await page.waitForFunction(() => document.querySelector('.hero-video').currentTime > 0.25);
    const originalGeometry = await page.locator('#hero-title').boundingBox();
    await page.waitForFunction(() => document.querySelector('.hero-video').currentTime > 9);
    await page.waitForFunction(() => document.querySelector('.hero-video').currentTime < 2);
    await assertForeground(page);
    assert.deepEqual(await page.locator('#hero-title').boundingBox(), originalGeometry);
    const frames = await page.evaluate(() => window.heroFrames);
    assert(frames.samples > 100);
    assert.equal(frames.hidden, 0);
    await page.locator('[data-hero-toggle]').click();
    assert(await page.locator(video).evaluate(media => media.paused));
    await page.locator('[data-hero-toggle]').click();
    await page.waitForFunction(() => !document.querySelector('.hero-video').paused);

    const form = page.locator(waitlist);
    const button = form.getByRole('button');
    const email = form.locator('[type="email"]');
    const consent = form.getByRole('checkbox');
    await email.fill('invalid-email');
    await button.click();
    assert(await email.evaluate(node => node.validity.typeMismatch));
    await email.fill('hero-test@example.com');
    await button.click();
    assert(await consent.evaluate(node => node.validity.valueMissing));
    assert.equal(submitted, undefined);
    await consent.check();
    await Promise.all([page.waitForURL('**/thanks.html'), button.click()]);
    assert.equal(submitted.email, 'hero-test@example.com');
    assert.equal(submitted.consent, true);
    assert.equal(submitted.source, 'primal-core-hero');
    await context.close();
    console.log('Natural video loop, pause/resume, analytics consent, validation and mocked waitlist success');

    for (const mode of ['slow', 'blocked', 'media-error', 'reduced-motion', 'no-js']) {
      const fallback = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference',
        javaScriptEnabled: mode !== 'no-js'
      });
      if (mode !== 'no-js') await seedConsent(fallback);
      const fallbackPage = await fallback.newPage();
      if (mode === 'blocked') await fallback.addInitScript(() => {
        const play = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () {
          return this.matches('.hero-video') ? Promise.reject(new DOMException('Blocked', 'NotAllowedError')) : play.call(this);
        };
      });
      if (mode === 'media-error') await fallback.route('**/assets/hero-loop-*.{mp4,webm}', route => route.abort());
      if (mode === 'slow') await fallback.route('**/assets/hero-loop-*.{mp4,webm}', async route => {
        await new Promise(resolve => setTimeout(resolve, 800));
        await route.continue();
      });
      await fallbackPage.goto(base, { waitUntil: 'domcontentloaded' });
      await assertForeground(fallbackPage, mode !== 'no-js');
      await fallbackPage.locator('.hero-poster').evaluate(image => image.decode());
      if (mode === 'slow') await fallbackPage.waitForFunction(() => document.querySelector('.hero-video').currentTime > .1);
      else if (mode === 'media-error') await fallbackPage.waitForFunction(() => Boolean(document.querySelector('.hero-video').error));
      if (mode !== 'slow') assert.equal(await fallbackPage.locator(video).evaluate(media => getComputedStyle(media).opacity), '0');
      await assertForeground(fallbackPage, mode !== 'no-js');
      await fallback.close();
      console.log('Poster and foreground', mode);
    }
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
