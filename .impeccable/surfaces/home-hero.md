# Homepage hero

Latest owner revision: Greek and English homepages use silent, muted, inline autoplay with looping video in one normal-flow viewport. There is no sticky stage, scroll runway or scroll seeking. This supersedes historical homepage hero scroll instructions while preserving the rest of the V.1 site, existing headings, signup source attribution and confirmed-storage backend.

Use the newly supplied films: mobile 608×1080, 60fps, 10.033 seconds; desktop 1280×720, 24fps, 10 seconds. `hero-loop-mobile.mp4` and `hero-loop-desktop.mp4` preserve the video stream, remove audio and use faststart, with matching responsive posters. Select desktop at 761px and above and mobile below that breakpoint. Implementation is in the hero block of `public/site.js` and the scoped `public/hero-autoplay.css`.

Preserve the playback-time reveal: the title starts 1.25 seconds before the final 200-frame window, holds, fades out, then signup fades in. Timing uses the selected film's frame rate. Signup remains visible through subsequent loops and on focus so an active field and entered address are not lost. Apply the global 30% video dimming only after title reveal begins; retain consent backing and readable status text for bright frames. Per the latest owner instruction, headings have no drop shadow or localized blur/scrim on desktop or mobile.

Provide the 44px pause/play control. Manual pause reveals signup and remains respected when the scene reenters view or the document returns. Stop background playback offscreen and while the document is hidden. Reduced motion, no JavaScript, media errors and blocked autoplay retain a readable static poster with a usable form; prolonged loading/waiting also reveals the readable fallback after six seconds. Preserve entered form values through responsive source changes and playback loops.

Verification: 71 default tests passed. Browser checks covered Greek/English at 390px and 1440px, autoplay and looping, no seeking on scroll, reveal phases, email retention, resize, manual pause and a mocked successful submission, plus four fallback cases. These checks do not establish support in every Safari/browser version, real signup storage or live email delivery. Other site sections, ingredient/testimonial behavior and signup services remain outside this revision.


## Autoplay recovery and codec compatibility

A successful `playing` event restores playback-time fades after a blocked initial play or slow-load static fallback. An earlier rejected `play()` promise cannot freeze text when native autoplay is already playing. On recovery, preserve signup if it already appeared, contains focus or has a filled email; otherwise resume title/signup timing from current playback. The pause button ignores the scene's bubbling pointer/touch retry so one activation does not toggle twice.

Prefer the responsive MP4 when H.264 capability is reported. If MP4 is unsupported and VP9 is available, select the same-film `hero-loop-desktop.webm` or `hero-loop-mobile.webm`; an MP4 error may try the supported WebM alternate once. Both formats retain desktop 24fps/mobile 60fps timing and the existing posters. Exhausted/blocked playback retains the usable static fallback. No heading sizes, copy, forms or backend behavior change.


## Current browser evidence

All 83 unit tests passed. The hero harness supports `BROWSER_ENGINE` and `BROWSER_EXECUTABLE` as well as `BASE_URL` and `PLAYWRIGHT_MODULE`. Actual Linux browsers passed 11 cases each: Chrome 157.0.8103.78, Firefox 153.0, Opera 157.0.8103.39 and Brave 157.0.8103.79. Cases cover Greek/English at 390px and 1440px, native-autoplay/competing-rejection recovery, recovery with and without entered data, and failed-media, blocked-autoplay, reduced-motion and no-JavaScript fallbacks. Chrome also passed natural, unseeked fade-phase checks at 390px/1440px and recovery after a 7.2-second delayed load. Firefox needed execution outside the sandbox for graphics and then passed.

Sixteen decoded-image contact/history screenshots are recorded at `/tmp/primal-browser-review/{chrome,firefox,opera,brave}-{390,1440}-{contact,history}.png`. This evidence uses Linux browsers and mobile viewport emulation; it does not establish native Android/iOS behavior, every browser version, real signup storage or inbox delivery. Final visual review is tracked separately.
