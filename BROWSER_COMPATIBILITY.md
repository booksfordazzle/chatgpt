# Hero playback and shared background — 2026-11-17

## Fixed behavior

- Recover the title → signup fades when a blocked or slow autoplay later starts. A playing film no longer remains in the static-text fallback.
- Native autoplay can succeed while an older `play()` promise rejects. A healthy playing video must not be switched back to static text by that rejection.
- Preserve a focused or filled signup field during recovery, source changes and loops. Manual pause and reduced-motion/no-JavaScript poster behavior remain available.
- Prevent the play button's bubbling pointerdown from starting playback just before click toggles it off.
- Select MP4 when supported, or the matching silent VP9 WebM when needed; try WebM once if MP4 decoding fails. Opera's tested Linux package does not support the supplied MP4 codec. The WebM copies retain the supplied compositions, durations and frame rates: desktop 24fps/10s; mobile 60fps/10.034s. Original MP4 files are preserved.
- Link `site-background.css` on all 49 source HTML pages. It supplies stationary, broad neutral radial/linear black-to-dark-grey gradients, with readable neutral photographic chapter veils. Existing heading sizes, text, photographs, form contracts and email delivery are unchanged.

## Prior-release browser evidence

Actual browser binaries on Linux, tested at 390px and 1440px viewport widths in Greek and English:

| Browser | Version evidence | Hero source |
| --- | --- | --- |
| Google Chrome | 157.0.8103.78 | MP4 |
| Firefox | 153.0, Playwright browser build | MP4 |
| Opera | Package 140.0.6074.18, Chromium 157.0.8103.39 | VP9 WebM |
| Brave | Package 1.99.57, Chromium 157.0.8103.79 | MP4 |

Each passed 11 browser cases: four responsive bilingual playback/loop/pause/mocked-form cases, a native-autoplay/rejected-promise race, two recovery cases with and without entered email, and four failure/blocked/reduced-motion/no-JavaScript poster cases. Real registration requests were not sent.

Chrome additionally passed natural, unseeked fade-in → hold → fade-out → signup playback at both widths, plus recovery after a deliberately delayed 7.2-second first video load. All 83 Node tests and the production build passed.

Contact and history captures were inspected at both widths in all four browsers, with visible images decoded before capture. These are Linux browser and responsive-viewport checks, not native Android/iOS device tests or a guarantee for every browser version or user extension. Browser-level reduced-motion and autoplay preferences intentionally retain readable fallbacks.

## Repeatable browser harness

`tests/browser/hero-autoplay.cjs` accepts `BASE_URL`, `PLAYWRIGHT_MODULE`, `BROWSER_ENGINE` (`chromium` or `firefox`), `BROWSER_NAME`, and optional `BROWSER_EXECUTABLE`. Set `PLAYWRIGHT_BROWSERS_PATH` when the runtime stores browsers outside Playwright's default location. Firefox needed graphics execution outside this workspace's restrictive process sandbox; no website security settings were changed.

Production verification follows deployment and checks the new CSS, source declarations and natural Chrome playback without submitting a signup.


## Latest first-visit poster intro

For motion-enabled JavaScript visits, denied/slow autoplay or media failure now starts a bounded poster clock: approximately 4.2 seconds of title fade-in, hold, fade-out and signup fade-in without requiring media permission. Title and signup must not remain simultaneously visible over a paused video. Normal successful playback retains its video-driven timing. If media starts after the poster clock begins, continue the same intro without resetting it; protect focused, filled or already completed signup.

Synchronize direct title/signup opacity with the custom properties. Suspend poster animation frames offscreen and while the document is hidden; resume on visibility/pageshow. The first Play activation retries even if an old play promise is still pending. Reduced motion clears inline opacity and retains the static readable title and form; no JavaScript or fatal bootstrap failure also retains static readable content. Earlier descriptions of a permanently static blocked-autoplay fallback are superseded for motion-enabled JavaScript. The script cache version is `autoplay-hero-3`. Layout, typography, global background, copy and form/backend contracts are unchanged.


## First-visit verification scope

The owner's iPhone Google-app embedded-browser report is a different context from the earlier desktop Chrome checks. `tests/browser/hero-first-visit.cjs` passed four cases each in Chrome 157 and WebKit 26.5: cold denied-autoplay Greek/English phase checks on every animation frame with no title/signup overlap and normal warm reload, pending-play first-tap retry, and hidden-first-visit clock resumption. The existing hero suite passed all 11 Chrome cases; WebKit has passed seven of 11, with four fallback cases still running at this documentation checkpoint. All 83 unit tests passed. Fresh screenshots: `/tmp/hero-first-visit-review/{chromium,webkit}-{el,en}-{title,signup}.png`. Final visual review is tracked separately.

No actual iOS Google-app browser was available. WebKit evidence uses a 393×700 mobile viewport and controlled autoplay-policy fixtures, not a native iPhone or that embedded browser. The previous Opera/Brave/Firefox matrix belongs to the prior release and has not been rerun for this fix. Do not infer current cross-browser completion or live storage/email verification from those earlier results.
