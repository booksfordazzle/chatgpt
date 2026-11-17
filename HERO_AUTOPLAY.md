# Homepage hero autoplay

The latest owner revision replaces the homepage scroll-controlled hero with one normal-flow viewport of responsive muted, inline looping video. Desktop uses `public/assets/hero-loop-desktop.mp4` (1280×720, 24fps, 10 seconds); mobile uses `public/assets/hero-loop-mobile.mp4` (608×1080, 60fps, 10.033 seconds), with matching posters. Both exports retain the supplied video stream, remove audio and use faststart.

`public/site.js` drives playback-time title/signup fades and responsive source selection; `public/hero-autoplay.css` scopes layout, pause control and bright-frame readability. Signup stays visible after its first reveal and on field focus. Manual pause is preserved; offscreen/hidden playback stops. Reduced motion and no JavaScript retain static poster/form fallbacks; motion-enabled JavaScript uses the bounded poster intro for blocked playback, errors and long waits. Existing signup attribution and backend are unchanged. See [.impeccable/surfaces/home-hero.md](.impeccable/surfaces/home-hero.md) for the saved behavior.

The existing `tests/browser/hero-mobile.cjs` entry delegates to `tests/browser/hero-autoplay.cjs`. The browser harness uses `BASE_URL` (default `http://localhost:8080`) and accepts `PLAYWRIGHT_MODULE`. The 71 default tests and browser checks passed: Greek/English at 390px/1440px, autoplay/looping, no scroll seeking, reveal phases, email retention, resize, pause, mocked submission and four fallback cases. This is browser evidence, not a guarantee for every browser version or verification of live storage/inbox delivery.

Latest owner revision: hero headings have no drop shadow or localized blur backing at either breakpoint. Global video dimming and consent/status backing remain. The first Industry video uses frame 596, two frames before the first black frame (598 of 600) as poster; the Industry → testimonial order remains unchanged.


## Autoplay recovery and codec compatibility

A successful `playing` event restores playback-time fades after a blocked initial play or slow-load static fallback. An earlier rejected `play()` promise cannot freeze text when native autoplay is already playing. On recovery, preserve signup if it already appeared, contains focus or has a filled email; otherwise resume title/signup timing from current playback. The pause button ignores the scene's bubbling pointer/touch retry so one activation does not toggle twice.

Prefer the responsive MP4 when H.264 capability is reported. If MP4 is unsupported and VP9 is available, select the same-film `hero-loop-desktop.webm` or `hero-loop-mobile.webm`; an MP4 error may try the supported WebM alternate once. Both formats retain desktop 24fps/mobile 60fps timing and the existing posters. Exhausted/blocked playback uses the bounded poster intro for motion-enabled JavaScript, preserving the usable form. No heading sizes, copy, forms or backend behavior change.


## Current browser evidence

All 83 unit tests passed. The hero harness supports `BROWSER_ENGINE` and `BROWSER_EXECUTABLE` as well as `BASE_URL` and `PLAYWRIGHT_MODULE`. Actual Linux browsers passed 11 cases each: Chrome 157.0.8103.78, Firefox 153.0, Opera 157.0.8103.39 and Brave 157.0.8103.79. Cases cover Greek/English at 390px and 1440px, native-autoplay/competing-rejection recovery, recovery with and without entered data, and failed-media, blocked-autoplay, reduced-motion and no-JavaScript fallbacks. Chrome also passed natural, unseeked fade-phase checks at 390px/1440px and recovery after a 7.2-second delayed load. Firefox needed execution outside the sandbox for graphics and then passed.

Sixteen decoded-image contact/history screenshots are recorded at `/tmp/primal-browser-review/{chrome,firefox,opera,brave}-{390,1440}-{contact,history}.png`. This evidence uses Linux browsers and mobile viewport emulation; it does not establish native Android/iOS behavior, every browser version, real signup storage or inbox delivery. Final visual review is tracked separately.


## Latest first-visit poster intro

For motion-enabled JavaScript visits, denied/slow autoplay or media failure now starts a bounded poster clock: approximately 4.2 seconds of title fade-in, hold, fade-out and signup fade-in without requiring media permission. Title and signup must not remain simultaneously visible over a paused video. Normal successful playback retains its video-driven timing. If media starts after the poster clock begins, continue the same intro without resetting it; protect focused, filled or already completed signup.

Synchronize direct title/signup opacity with the custom properties. Suspend poster animation frames offscreen and while the document is hidden; resume on visibility/pageshow. The first Play activation retries even if an old play promise is still pending. Reduced motion clears inline opacity and retains the static readable title and form; no JavaScript or fatal bootstrap failure also retains static readable content. Earlier descriptions of a permanently static blocked-autoplay fallback are superseded for motion-enabled JavaScript. The script cache version is `autoplay-hero-3`. Layout, typography, global background, copy and form/backend contracts are unchanged.


## First-visit verification scope

The owner's iPhone Google-app embedded-browser report is a different context from the earlier desktop Chrome checks. `tests/browser/hero-first-visit.cjs` passed four cases each in Chrome 157 and WebKit 26.5: cold denied-autoplay Greek/English phase checks on every animation frame with no title/signup overlap and normal warm reload, pending-play first-tap retry, and hidden-first-visit clock resumption. The existing hero suite passed all 11 cases each in Chrome and WebKit, including all four fallback cases. All 83 unit tests passed. Fresh screenshots: `/tmp/hero-first-visit-review/{chromium,webkit}-{el,en}-{title,signup}.png`. Focused visual review disposition: Ship. All four first-visit WebKit cases also passed against production on code commit 39afab5, without submitting any signup.

No actual iOS Google-app browser was available. WebKit evidence uses a 393×700 mobile viewport and controlled autoplay-policy fixtures, not a native iPhone or that embedded browser. The previous Opera/Brave/Firefox matrix belongs to the prior release and has not been rerun for this fix. Do not infer current cross-browser completion or live storage/email verification from those earlier results.
