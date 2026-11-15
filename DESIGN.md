# PRIMAL CORE interface

Preserve the supplied dark, cinematic Greek identity: near-black surfaces, ivory typography, product and ingredient photography, restrained moss/olive tones. The home surface helps visitors understand the product's development status and request launch updates. Articles support reading.

Use self-hosted Google Sans with Greek and Latin subsets, 17px body text, spacious sections, and a clear type hierarchy. Use the supplied PRIMAL CORE wordmark as the home link. Benefit and ingredient descriptions follow the owner’s supplied Greek copy. Retain the product-development status.

Navigation is native links to static URLs. FAQs use native details/summary. The waitlist requests one email with unchecked explicit consent. Only a confirmed Google Sheets receiver response may produce success. Keep errors actionable and keep entered data on failure. Avoid perpetual JavaScript animation loops. The hero uses the original ia.mp4 on desktop and the supplied vertical-hero-60fps.mp4 on mobile, both with scroll seeking inside a sticky stage like Philosophy. No-JavaScript and reduced-motion visitors see a responsive static poster. The ingredient film uses the supplied mobile-ingredients video in portrait on mobile and the existing landscape film on desktop. It independently uses muted autoplay/loop with a bottom-right pause/resume control preserving manual pause. Native ingredient controls remain available without JavaScript. Per the latest owner request, ingredient playback also starts automatically for reduced-motion visitors, with the manual pause control always available. The scroll hero and decorative photo motion still respect reduced motion.

Tokens and responsive rules are in public/styles.css. Publishing headers are in netlify.toml.

The shared menu contains “Φιλοσοφία”, “Ιστορία”, “Blog” and “Επικοινωνία”, linking to `/philosophy.html`, `/about.html`, `/blog/index.html` and `/contact.html`. The about page uses “Ιστορία” in its title. The footer contact link also opens `/contact.html`. FAQ remains on the homepage and is omitted from the shared menu. The header uses its collapsible menu at widths of 1100px and below so the expanded link set fits. Route-specific cinematic composition and motion belong in [the philosophy surface brief](.impeccable/surfaces/philosophy.md), rather than becoming defaults for other pages.

The Ιστορία route (`/about.html`) follows the Philosophy page’s cinematic hierarchy through seven scroll-driven visual chapters, each with an H1 sentence and a respective existing image: initial indifference, first changes, search, tallow, personal research, PRIMAL CORE’s origin, and the final principle with a waitlist action. Preserve its existing copy and development disclosure. Keep reading space black and aligned with the wordmark, supplied photography on the right, and generous shared spacing; only the final principles are centered. Keep `history.css` and `history.js` route-specific. Native bottom chapter anchors track the active chapter on scroll; subtle photo movement uses passive scroll events and scheduled animation frames, with static, fully readable reduced-motion and no-JavaScript views. Further route rules live in [the history surface brief](.impeccable/surfaces/history.md).

## Layout

Use the shared `--page-gutter`: `max(40px, calc((100vw - 1520px)/2))` on desktop, 28px at 1100px and below, and 20px at 760px and below. Content wrappers and prose align their left edge with the wordmark; prose retains its 740px maximum reading width. Intentionally centered compositions stay centered. Contact-specific layout belongs in [the contact surface brief](.impeccable/surfaces/contact.md).

## Saved owner spacing preference

Leave generous, visible space between a section heading and the list or content below it. Do not let the benefits heading touch the accordion's first rule. Use `--heading-content-gap` (56px desktop, 40px mobile), `--image-caption-gap` (24px desktop, 20px mobile), and `--heading-film-gap` (72px desktop, 48px mobile). Apply the same generous grouping principle to future surfaces; dense control labels may remain compact. Keep benefits top-aligned so opening answers never recenters its heading. The full-width product photograph is an explicit exception to the rounded-image rule: it is edge-to-edge with no container inset or corners, approximately 2.40:1 on desktop, 2:1 on tablet and 4:3 on mobile. Use centered cover cropping while preserving the source image and grading; keep its caption on the normal content grid with the saved caption gap.

Benefit accordions retain native details/summary behavior and use a chevron that rotates 180 degrees when open.

## Ingredient slider

Use the five headings and paragraphs supplied in Ingredients slider.md verbatim. Present one ingredient at a time with its icon, previous/next buttons and a 1 / 5 counter; support arrow keys, Home/End and touch swiping. Do not auto-advance reading slides. Reserve the maximum slide height so later sections do not jump, and show all five texts if JavaScript is unavailable.

## Background

Use subtle, broad asymmetric neutral gradients from near-black to charcoal/medium gray behind the content. Preserve readable ivory text and the cinematic imagery.

## Homepage sequence

Owner-specified order: scroll hero with its own consented email signup → benefits → autoplay ingredient film with centered two-line heading → manual slider → full-width product photograph with caption → FAQ and waitlist availability form side by side immediately before the footer; stack them in that order on mobile.

Both hero and bottom signup forms submit independently through the same confirmed-storage handler; each owns unique field IDs, validation and status messages.

The shared menu contains no waitlist button. Both email fields show “Το email σου” as their placeholder.

The benefits photograph and full-width product photograph use subtle clipped parallax (up to 18px desktop/8px mobile, 6% overscan). Text, accordion headings and captions remain stationary. Reduced-motion and no-JavaScript visitors see static photographs. Scroll frames are scheduled only on events while images are near the viewport. The bottom signup no longer includes the mailto question link.

Each of these two photographs also receives a one-time 2.5% zoom over 1.8 seconds when at least 15% enters view. It composes with parallax without moving the frame, text or caption, and is disabled for reduced motion.

## Bilingual navigation and latest owner refinements

Preserve complete Greek and English static pages, including articles, with the single flag language switch (🇺🇸 opens US English; 🇬🇷 returns to Greek) placed immediately after Contact on desktop, and inside the right-aligned compact dropdown on mobile and tablet. Greek remains the primary language; switches open the matching page without requiring JavaScript. Shared signup fields and buttons have rounded corners at every breakpoint. The philosophy now has three scenes: origin, complexity and manifesto; the return-marble scene and its text were removed at the owner's request. The manifesto heading is “Η αφαίρεση είναι εξέλιξη.” Preserve the owner's explicit three-line opening and blank paragraph pause before its final sentence. The Chios mastic article and its listing use the supplied golden resin photograph. The two featured article previews omit their introductory descriptions; their article content remains intact.

## Latest signup reference

Both signup forms use an inset pill layout: dark rounded email input and a separate light pill CTA inside a rounded dark outer frame. Keep it inline on mobile where readable, stacking below 360px. The signup CTA is “Let me in!” in both languages, without an arrow. This label does not implement a queue or guarantee rank. US English pages use en-US and the flag switch opens the matching route without JavaScript. Keep explicit unchecked consent and honest pending/error/success states.

The flag control is bare emoji-style flag artwork with no button frame, background or US/GR letters. Use the self-contained vector flags in public/assets/flags so the flag remains graphical on systems that render Unicode flags as country letters. Keep its 44px interactive target and accessible language-switch label.

## Confirmation flow

After confirmed Google Sheets storage, both signup forms navigate to thanks.html (or en/thanks.html), including the native/no-JavaScript path. Greek heading: “Μπήκες.” Greek message: “Θα λάβεις μήνυμα όταν το PRIMAL CORE είναι έτοιμο προς διάθεση”. Use the shared dark typography/spacing and an understated return-home link. No confirmation email, Brevo signup, email address in URLs, or redirect on failed storage. Old Google welcome triggers must be disabled in the owner’s account separately.

The flag artwork is 20% smaller (32 × 27.2px) inside the unchanged 44px interactive target. Store only a coarse device class (mobile includes tablets, desktop, or unknown for missing context) with each new signup; never store raw browser User-Agent. Existing duplicate signups retain their original receipt and device value.

## Latest media update

The benefits photo is replaced by the supplied testimonial.mp4, using an extracted thumbnail and a centered play button. It starts only on deliberate activation and plays with audio/native controls; no autoplay or looping for the testimonial. The ingredient film stays audio-free and retries muted inline autoplay on readiness, visibility and natural touch gestures, without a press-play status prompt; preserve manual pause. Browser/system autoplay restrictions may still prevent playback. Mobile ingredient headline is 15% larger. The hero black overlay alpha is reduced by 10% relatively, from .48 to .432.

## Latest navigation and story copy

At compact navigation widths (1100px and below), keep the flag visible to the left of Menu even when the dropdown is closed. The dropdown is right-aligned to the shared page gutter and only as wide as its links, rather than full viewport width. Desktop keeps the language flag after Contact. The story page uses the owner’s latest first-person narrative verbatim, split between the existing origin and development chapters, ending with “Να γνωρίζεις τι βάζεις στο δέρμα σου. Και γιατί.” Preserve paragraph breaks, beef tallow emphasis, existing imagery, chapter navigation and product-development disclosure. The English page carries a complete translation.

## Current scroll-story and navigation revision

Menu is spelled “Menu” in both languages. The single flag is back inside the narrow right-aligned dropdown, after Contact, rather than next to the closed menu. Both homepage signup actions say “Let me in!”. Mobile ingredient heading is positioned 400 CSS pixels above the film midpoint, clamped to a safe 64px center from the frame top when the portrait frame is too short; do not clip the heading outside the video.

Use the Philosophy complexity scene as the shared sticky-frame motion model. Origin and manifesto now use scroll-scenes.css/js for tailored image reveals and a restrained reading movement. Keep the existing bottle choreography intact, the authored manifesto line breaks and paragraph pause, and the full ancient-care copy. The story uses seven separate H1 sentences, seven existing images and all supplied first-person paragraphs. Chapter navigation has seven native anchors. Text starts visible; no-JavaScript and reduced-motion views remain static in normal reading order. On screens where content exceeds the visible frame, use normal scrolling so no text or CTA is trapped. Scroll/resize schedule work only on events, not perpetual animation loops.
