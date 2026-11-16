# Mobile scroll hero recovery — 16 November 2026

The production mobile hero had two reproducible failure paths:

- Blocking or failing `attribution.js` raised `PrimalAttribution is not defined` before hero initialization. Navigation, media and form behavior must not depend on this optional helper.
- Waiting for video metadata left both hero text and signup at opacity zero with an inert signup form. A stalled mobile download could therefore hide the entire signup chapter.

The helper now has an empty-string fallback. Normal attribution capture, consent and Source values remain unchanged. The hero reveal uses the supplied films' known timing until real metadata is available, then seeks on metadata/data/canplay readiness. The mobile decoder can be primed by the first real touch/pointer gesture, and pauses immediately afterwards for scroll-controlled playback. Page restoration resynchronizes the timeline. Video failure keeps the poster while the text/signup sequence remains usable. Reduced-motion and no-JavaScript fallbacks remain intact.

The V.1 CSS, layout, media files, font sizes, title/form alignment and existing fade timing are unchanged. Only homepage JS version strings changed to ensure browsers fetch the fix. Backend, DNS, form receivers and production indexing rules were not changed.

Verification:

- `npm test`: 51 passed; build and diff checks passed.
- Chromium/Android mobile profile: normal playback, blocked attribution, delayed network response, failed video and reduced-motion fallback passed. Actual decoded frames, scroll seeking and sequential title-in/title-out/signup-in were checked. The delayed-response case exercised first-touch recovery.
- WebKit/iPhone browser profile: normal playback, blocked attribution, unavailable metadata followed by metadata recovery, failed video and reduced-motion fallback passed. The metadata case uses a controlled duration getter because indefinitely holding a media response blocks the Linux WebKit test engine; real delayed HTTP recovery was verified in Chromium. This is browser emulation, not testing a physical iPhone.
- Desktop Greek and mobile English sequence checks passed.
- Form submissions in the browser regression are intercepted with a mocked failure. Consent/Source/UTM fallback and retained entered email are asserted; no real subscriber row or email is created.

Optional regression runner, using an existing Playwright installation (no project runtime dependency added):

```sh
npm run dev
# In another terminal, with Playwright and its browsers available:
PLAYWRIGHT_MODULE=/path/to/playwright node tests/browser/hero-mobile.cjs
```

`HERO_ENGINE=chromium` or `webkit` selects one engine; `HERO_TEST_URL` selects a different test origin. Default origin is local port 8080. The two supplied film durations were verified as 10 seconds desktop and 602/60 seconds mobile; metadata always takes precedence once available.
