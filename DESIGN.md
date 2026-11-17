> Latest owner instruction — homepage hero autoplay: use the newly supplied responsive silent films in one normal-flow viewport, with muted inline looping playback. Remove sticky staging, the scroll runway and scroll seeking from the homepage hero. Preserve the playback-time title → signup fade sequence, with the title beginning 1.25 seconds before the final 200-frame window; keep signup visible through subsequent loops and field focus. Provide a 44px manual pause control, preserve user pause, stop playback offscreen/when hidden, and retain readable poster/form fallbacks for reduced motion, no JavaScript, media failure and blocked autoplay. Dim the video by 30% only once the title starts, with local heading/consent backing for bright frames. This instruction supersedes every historical sticky/scroll-driven homepage hero reference below; the rest of the V.1 site remains preserved. See [.impeccable/surfaces/home-hero.md](.impeccable/surfaces/home-hero.md).

> Latest owner instruction: restore the visual design and behavior from tag V.1. Preserve the scroll-driven hero, sequential centered title/signup reveals, original sections, media, carousel, typography and spacing. SEO, crawlability and security improvements must be technical and visually neutral; the previous static audit-home redesign is superseded.

Mobile email inputs must remain at least 16px to prevent browser focus zoom from cropping the adjacent signup button. Preserve user pinch zoom.

# PRIMAL CORE interface

Preserve the supplied dark, cinematic Greek identity: near-black surfaces, ivory typography, product and ingredient photography, restrained moss/olive tones. The home surface helps visitors understand the product's development status and request launch updates. Articles support reading.

Use self-hosted Google Sans with Greek and Latin subsets, 17px body text, spacious sections, and a clear type hierarchy. Use the supplied PRIMAL CORE wordmark as the home link. Benefit and ingredient descriptions follow the owner’s supplied Greek copy. Retain the product-development status.

Navigation is native links to static URLs. FAQs use native details/summary. The waitlist requests one email with unchecked explicit consent. Only a confirmed Google Sheets receiver response may produce success. Keep errors actionable and keep entered data on failure. Avoid perpetual JavaScript animation loops. The hero uses the original ia.mp4 on desktop and the supplied vertical-hero-60fps.mp4 on mobile, both with scroll seeking inside a sticky stage like Philosophy. No-JavaScript and reduced-motion visitors see a responsive static poster. The ingredient film uses the supplied mobile-ingredients video in portrait on mobile and the existing landscape film on desktop. It independently uses muted autoplay/loop with a bottom-right pause/resume control preserving manual pause. Native ingredient controls remain available without JavaScript. Per the latest owner request, ingredient playback also starts automatically for reduced-motion visitors, with the manual pause control always available. The scroll hero and decorative photo motion still respect reduced motion.

Tokens and responsive rules are in public/styles.css. Publishing headers are in netlify.toml.

The shared menu contains “Φιλοσοφία”, “Ιστορία”, “Blog” and “Επικοινωνία”, linking to `/philosophy.html`, `/about.html`, `/blog/index.html` and `/contact.html`. The about page uses “Ιστορία” in its title. The footer contact link also opens `/contact.html`. FAQ remains on the homepage and is omitted from the shared menu. The header uses its collapsible menu at widths of 1100px and below so the expanded link set fits. Route-specific cinematic composition and motion belong in [the philosophy surface brief](.impeccable/surfaces/philosophy.md), rather than becoming defaults for other pages.

The Ιστορία route (`/about.html`) follows the Philosophy page’s cinematic hierarchy through five scroll-driven visual chapters, each with a nonduplicated H1 sentence and a respective image: initial indifference/changes, search, tallow discovery, research/PRIMAL CORE’s origin, and the final principle with a waitlist action. Preserve its existing copy and development disclosure. Keep reading space black and aligned with the wordmark, supplied photography on the right, and generous shared spacing; only the final principles are centered. Keep `history.css` and `history.js` route-specific. Native bottom chapter anchors track the active chapter on scroll; subtle photo movement uses passive scroll events and scheduled animation frames, with static, fully readable reduced-motion and no-JavaScript views. Further route rules live in [the history surface brief](.impeccable/surfaces/history.md).

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

Both signup forms use an inset pill layout: dark rounded email input and a separate light pill CTA inside a rounded dark outer frame. Keep it inline on mobile where readable, stacking below 360px. The signup CTA is “Θέλω να μπώ!” in Greek and “Let me in!” in English, without an arrow. This label does not implement a queue or guarantee rank. US English pages use en-US and the flag switch opens the matching route without JavaScript. Keep explicit unchecked consent and honest pending/error/success states.

The flag control is bare emoji-style flag artwork with no button frame, background or US/GR letters. Use the self-contained vector flags in public/assets/flags so the flag remains graphical on systems that render Unicode flags as country letters. Keep its 44px interactive target and accessible language-switch label.

## Confirmation flow

After confirmed Google Sheets storage, both signup forms navigate to thanks.html (or en/thanks.html), including the native/no-JavaScript path. Greek heading: “Μπήκες.” Greek message: “Θα λάβεις μήνυμα όταν το PRIMAL CORE είναι έτοιμο προς διάθεση”. Use the shared dark typography/spacing and an understated return-home link. No confirmation email, Brevo signup, email address in URLs, or redirect on failed storage. Old Google welcome triggers must be disabled in the owner’s account separately.

The flag artwork is 20% smaller (32 × 27.2px) inside the unchanged 44px interactive target. Store only a coarse device class (mobile includes tablets, desktop, or unknown for missing context) with each new signup; never store raw browser User-Agent. Existing duplicate signups retain their original receipt and device value.

## Latest media update

The benefits photo is replaced by the supplied testimonial.mp4, using an extracted thumbnail and a centered play button. It starts only on deliberate activation and plays with audio/native controls; no autoplay or looping for the testimonial. The ingredient film stays audio-free and retries muted inline autoplay on readiness, visibility and natural touch gestures, without a press-play status prompt; preserve manual pause. Browser/system autoplay restrictions may still prevent playback. Mobile ingredient headline is 15% larger. The hero black overlay alpha is reduced by 10% relatively, from .48 to .432.

## Latest navigation and story copy

At compact navigation widths (1100px and below), keep the flag visible to the left of Menu even when the dropdown is closed. The dropdown is right-aligned to the shared page gutter and only as wide as its links, rather than full viewport width. Desktop keeps the language flag after Contact. The story page uses the owner’s latest first-person narrative verbatim, split between the existing origin and development chapters, ending with “Να γνωρίζεις τι βάζεις στο δέρμα σου. Και γιατί.” Preserve paragraph breaks, beef tallow emphasis, existing imagery, chapter navigation and product-development disclosure. The English page carries a complete translation.

## Current scroll-story and navigation revision

Menu is spelled “Menu” in both languages. The single flag is back inside the narrow right-aligned dropdown, after Contact, rather than next to the closed menu. Both homepage signup actions say “Θέλω να μπώ!” in Greek and “Let me in!” in English. Mobile ingredient heading is positioned 400 CSS pixels above the film midpoint, clamped to a safe 64px center from the frame top when the portrait frame is too short; do not clip the heading outside the video.

Use the Philosophy complexity scene as the shared sticky-frame motion model. Origin and manifesto now use scroll-scenes.css/js for tailored image reveals and a restrained reading movement. Keep the existing bottle choreography intact, the authored manifesto line breaks and paragraph pause, and the full ancient-care copy. The story uses five separate H1 sentences and five respective images. A thought appears either in the heading or the body, without repetition; concluding headlines can follow their setup. Chapter navigation has five native anchors. Text starts visible; no-JavaScript and reduced-motion views remain static in normal reading order. On screens where content exceeds the visible frame, use normal scrolling so no text or CTA is trapped. Scroll/resize schedule work only on events, not perpetual animation loops.

## Latest product, hero and story refinements

The homepage full-bleed product shot is the unchanged owner-supplied product-jar-closeup.jpg (2448×1024), extracted from the latest ZIP. Preserve its full-bleed square corners, responsive cover treatment and existing caption. The homepage hero title scale is 50% larger than before across desktop and mobile: clamp(48px, 6.3vw, 96px), and clamp(24px, 6.75vw, 51px) on mobile. Retain the headline wording and scroll video. Remove only the PRIMAL CORE footer-name home link, across both languages and all pages; keep the header logo and footer navigation/privacy links.

The five story sections combine the former personal opening/changes, search, tallow discovery, year of exploration/product origin, and final product principle. The last three are conclusion compositions with body before H1. Do not repeat the heading thought as another body paragraph. The tallow closing heading is “Η απλότητά του μου κέρδισε την περιέργεια.” Preserve the remaining narrative, development note and launch CTA.

## Latest homepage and footer copy

Homepage hero: “Το πρόσωπό σου,<br>πιο απαλό από ποτέ”, mirrored as “Your face,<br>softer than ever” in English. Preserve the explicit two-line break and current type scale. All footers show only the copyright text without the under-development suffix. The product-development disclosure remains in the relevant content. Mobile footer links stay together on one row, with compact readable labels (Απόρρητο / Privacy), no wrapping, and 44px-high link targets.

Latest sizing adjustment: increase the current hero title font by a further 10% on both languages: clamp(52.8px, 6.93vw, 105.6px), mobile clamp(26.4px, 7.425vw, 56.1px). Move the mobile ingredient title down exactly 150px from its previous clamped position: calc(max(64px, calc(50% - 400px)) + 150px). Desktop ingredient title remains centered.

All shared footers include the credit “Website by Ermitikos” linking directly to https://www.instagram.com/ermitikos, beside the copyright on wide screens and wrapping as one unit on narrow screens. Preserve the five-link mobile navigation row.

Current consent label, both homepage forms: “Συμφωνώ να λαμβάνω ενημερώσεις και έχω διαβάσει την πολιτική απορρήτου.” English: “I agree to receive updates and have read the privacy policy.” Keep the policy link and required, initially unchecked checkbox.

## Product slideshow and CTA punctuation

Greek CTAs now say “Θέλω να μπώ” without an exclamation mark; English stays “Let me in!”. The full-bleed product area is a three-photo slideshow: existing product-jar-closeup.jpg plus the two JPEGs extracted unchanged from the latest supplied ZIPs. No third new ZIP was attached. Preserve the existing caption and square-corner frame. Crossfade every six seconds only while visible, with explicit pause/play, previous/next, keyboard and horizontal swipe controls. Pause on hover/focus/document hiding and preserve user pause. Reduced motion starts manually (explicit play may opt in); no-JavaScript displays every photo in order. Keep full compositions of the wide new photographs on mobile rather than cropping away the jars.

## Current product carousel frame

The homepage carousel contains two photographs: the supplied closed-jar closeup and the diagonal five-jar composition. Use a shared 1920:819 photo frame at every width, with images filling the frame and controls overlaid inside its bottom-right corner. Do not reserve a black strip below the photographs. Preserve the caption gap and existing slideshow behavior. Without JavaScript, show both photos at their natural aspect ratios.

## Contact form

Greek and English contact pages now use required name, email and message fields, with horizontal labels on desktop and stacked labels on smaller screens. Preserve the existing dark identity, business sidebar and FAQ. Native POST to FormSubmit forwards to ermitikos@gmail.com after recipient activation; keep provider spam verification, privacy disclosure and truthful provider-owned results. See CONTACT_SETUP.md.

## Carousel photo bounds and inline contact feedback

Source dimensions: closed jar 1920×819, five jars 2352×1008 with baked black bands above row 128 and below row 879. The shared visible frame is 2352:752. Centered cover removes the bands without editing the supplied images; the closed-jar photograph crops vertically to the same stable frame. Apply the same treatment to the no-JavaScript sequence. Controls stay over the photo.

Contact uses FormSubmit AJAX with inline localized pending, submitted and error states. Keep entered text on errors, reject activation responses as success, prevent duplicate pending submissions and offer the real Gmail address on failure. Disable provider CAPTCHA to remove the extra step; retain the provider honeypot. Activation by the recipient remains a one-time service prerequisite, never a task for visitors. Do not claim inbox delivery from API acceptance.

## Mobile product carousel photography

At widths up to 760px, use the three unchanged 1122×1402 portrait PNGs from the owner ZIP in this order: dramatic-light single jar, floating five-jar stack, bull-horn lid. Preserve each full composition in a matching 1122:1402 frame with overlaid controls and a three-photo counter. Wider screens retain the existing two landscape photos and bar-free framing. On breakpoint changes, reset to the first photo of the appropriate set while preserving user pause. No-JavaScript shows only the relevant photo set in sequence.

## Hero video brightness

The owner requests the scrollable homepage hero video fully visible, without a dark overlay. The shared hero-shade background is none on desktop and mobile, in both languages. Preserve the video, sticky scroll seeking, headline and signup controls.

The homepage hero headline uses black (#000) in both Greek and English, on desktop and mobile, per the owner request.

## Current hero contrast

The latest owner request supersedes the unshaded video and black headline: use a white (#fff) hero headline and a 30% black overlay (70% video visibility) on desktop and mobile in both languages. Preserve scroll seeking and signup behavior.

## Current signup consent copy

Below each homepage email field, keep only “Συμφωνώ να λαμβάνω ενημερώσεις.” / “I agree to receive updates.” beside the required, initially unchecked checkbox. Remove the policy-reading sentence from this label; the privacy page remains available through the footer.

## Hero bull emblem

Place the owner-supplied transparent bull-trans.png above the hero headline in both languages on desktop and mobile. Preserve the source bytes and transparency. A clipped presentation wrapper removes the PNG’s transparent padding, keeping the visible bull centered at 84–120px wide with 20–24px of space before the headline. The decorative mark has an empty alt; preserve the hero video, copy and signup form.

Latest hero emblem positioning: move the bull mark 32px upward visually on desktop and mobile, keeping the headline and email form in their existing positions.

Latest owner adjustment doubles the hero emblem upward offset from 32px to 64px on desktop and mobile. Headline and form positions remain unchanged.

On mobile viewports at most 650px tall, cap the upward offset at 48px so the bull stays clear of the fixed header.

Latest owner hero adjustment: visually lower the headline and the whole signup form (including consent and status) by 100px, preserving the bull position and the existing space between headline and email field. Applies to both languages and viewport sizes.

Latest repeated owner adjustment adds another 100px to the headline and signup offset, now 200px total. Keep the bull position unchanged.

Allow vertical scrolling inside the hero content when the lowered signup exceeds the visible frame, so its controls and feedback remain reachable on short screens.

## Current hero layout restoration

Remove the bull emblem from the homepage hero in both languages. Restore the headline and signup form to their original centered positions, with no 100px/200px relative offsets or inner scrolling. Preserve the white headline, 30% dark overlay, original headline-to-form spacing, visible email field and required consent checkbox. This supersedes previous bull and lowered-content positioning instructions.

Latest owner hero adjustment: move only the headline 50px upward, in both languages and viewport sizes; keep the email form in its restored position.

Latest hero positioning: raise the headline another 50px (100px total above the restored position) and lower the complete email signup form by 90px. Applies to both languages and desktop/mobile. Keep the consent with its form.

## Current hero positioning and signup shine

Raise the headline another 50px (150px total) and lower the signup another 90px (180px total). At heights at most 800px retain the prior -100px/+90px offsets to keep headline and consent visible. Both signup CTA pills glow softly with a 3.5-second highlight circulating only around their perimeter. Keep the text stationary, focus outline visible, shine noninteractive and reduced-motion rendering static. Apply to Greek and English.

## Latest hero glow and spacing

Replace the circulating perimeter shine with a soft blurred glow moving horizontally behind each signup button. Keep button text stationary and honor reduced motion. Raise the headline another 50px and lower the email form another 50px: main offsets -200px/+230px, shorter-view offsets -150px/+140px, subject to visibility safeguards.

Visibility safeguards cap headline offsets at -180px on desktop up to 950px tall, -120px up to 800px tall, and -85px on mobile up to 650px tall, preventing overlap with the fixed header.

## Stable hero during mobile scrolling

Capture hero viewport height and height-based spacing categories on entry; retain them when coarse-pointer browser chrome changes only viewport height. Refresh on width/orientation changes and desktop window resizing. Keep the headline at the same screen Y throughout the sticky scene; allow normal scene exit, static reduced-motion and no-JavaScript fallbacks.

## Timed centered hero reveal

Supersede previous manual headline/form offsets. Center the headline precisely in the sticky film frame and place the email form below. Start with text/form hidden and no dark overlay. Begin a smooth 0.75-second fade at duration minus 200 actual video frames (desktop ia.mp4: 24fps, mobile: 60fps). As they appear, increase the black overlay to 30%, leaving video 70% visible. Reverse on scroll back. Hide unrevealed form from interaction. Reduced motion, no JavaScript and video errors show static readable text and a usable form. Preserve stable viewport geometry during mobile toolbar changes.

## Latest contact copy and golden signup action

Contact introduction now reads “Δεν θα σε σπαμάρουμε ποτέ.” / “We’ll never spam you.” Remove the inline FormSubmit/Gmail privacy paragraph below the form; retain the full privacy policy and footer link. Signup CTA buttons use a gold face with dark text and the existing soft moving glow in gold, with a static reduced-motion fallback.

## Current hero two-stage sequence

During the final 200 source video frames, fade in the headline at the absolute frame center, hold, then fade it out. After it disappears, fade in a centered group containing “Μπες στην λίστα αναμονής” / “Join the waitlist” and the complete signup form. Each chapter is independently centered. Timing within that window: headline in 0–18%, hold to 40%, out 40–55%, signup in 62–82%, hold to end. Video starts without shading; fade to 30% black with the first headline, retaining that shade through the signup chapter. Reverse naturally on scrolling back. Keep hidden form inert; static/reduced-motion/error views show both chapters in readable order.

## Contact portrait and FAQ overlay

Replace the contact H1 closing “Γράψε μας.” with “Είμαστε εδώ για να σε ακούσουμε.” and English “We’re here to listen.” Remove the business-name/address block and the sentence explaining use of the email to reply. Display the unchanged owner-supplied 1408×1760 contact-product.jpg vertically beside the form (below it on mobile). Superimpose the existing FAQ heading, description and link in its dark upper negative space, without covering the jar. Preserve native FAQ links and working bilingual contact submission.

## Earlier headline and white signup CTA

Start the first hero headline fade 1.25 video seconds earlier while retaining its fade duration and the existing fade-out/signup timing; the extra time becomes a longer readable hold. Keep the video unshaded initially and dim it with the headline. Both Greek signup CTAs now say “Βάλε με”; the English equivalent remains “Let me in!”. Use white CTA faces and a soft moving white glow, replacing gold.

## Rounded contact controls

Contact name/email fields and send buttons use pill corners; the message area uses 16px corners. Give the send button the same soft moving white glow as signup CTAs, with static reduced-motion styling and paused animation during submission. Preserve labels and submission behavior in both languages.

## Aligned hero chapter headings

Align the first hero headline’s vertical center with the vertical center of “Μπες στην λίστα αναμονής” / “Join the waitlist”, retaining the centered signup group. Measure the signup heading offset and refresh after fonts, resizing and form-size changes. Preserve the existing fade sequence.

## Icon-only compact menu

Replace the visible Menu word on every Greek and English header with a three-line hamburger SVG. Keep a 44×44px target, localized accessible name, aria-expanded state and existing dropdown/keyboard behavior. Desktop expanded navigation remains intact.

## Confirmation video and mobile zoom

Confirmation CTA becomes “Δες το βίντεο!” / “Watch the video!”, with pill corners. Open the owner-supplied portrait waitlist-confirmation.mp4 in a native modal on explicit activation, with native playback controls, accessible close button, Escape/backdrop closing and playback paused/reset on close. Keep a direct MP4 link fallback without JavaScript or dialog support. Do not preload video before opening. Per explicit owner request, disallow pinch zoom using viewport maximum-scale/user-scalable settings and root pan-only touch-action; browser accessibility overrides may still permit zoom.

Latest compact menu preference: remove the outer border/background, use a 32px three-line SVG inside a 48px touch target, and retain the keyboard focus outline and accessible menu label.

Latest confirmation video replacement: use the unchanged owner-supplied download (47).mp4 as waitlist-confirmation-v2.mp4 and remove the previous video asset. Keep the bilingual watch buttons, popup and direct-link fallback. The new asset URL prevents the previous cached film from being reused.

## Security revision of contact submission

Restore real FormSubmit CAPTCHA through native POST; AJAX previously bypassed it. After provider acceptance return to a localized contact-sent page. Preserve the contact layout and form fields. Waitlist requests are throttled server-side with localized retry feedback. This supersedes prior CAPTCHA-disabled inline contact submission decisions.

## V.1 desktop heading size

At desktop widths above 1100px, “Μπες στην λίστα αναμονής” / “Join the waitlist” uses the same font-size clamp as the main hero headline: clamp(52.8px,6.93vw,105.6px). Preserve mobile/tablet sizes, existing centered alignment, fade sequence and signup controls. This snapshot is named V.1.

Desktop hero signup heading (above 1100px): keep “Μπες στην λίστα αναμονής” on one centered line at the V.1 font size. The heading may extend beyond the 640px email form; mobile remains unchanged.

## Current homepage video order

The manual two-video player starts with the industry film, then switches to the testimonial and wraps back to industry. Apply this order in both languages and at every viewport, including the native no-JavaScript fallback. Preserve deliberate play with sound, controls hidden during playback and mobile centering on Next.

## Benefits before video carousel

Place the complete benefits heading and accordion above the manual Industry/testimonial video carousel in both languages and at every viewport. Preserve the player’s previous desktop width, centered below the benefits, and full available width on mobile. Keep the shared heading-to-film spacing and native accordion behavior.

Latest benefits/media revision: retain the three existing benefits and append the owner’s gentle-care and dryness-protection benefits, localized in English. All benefit icons use the plain ✓ glyph. Place the unchanged full-width photo carousel immediately after the Industry/testimonial player and before the five-ingredients heading and film, in both languages and at all widths.

Latest vitamin E copy: Η βιταμίνη Ε (Tocopherol) είναι γνωστή για τις αντιοξειδωτικές της ιδιότητες. Συμβάλλει στην προστασία της επιδερμίδας από τις ελεύθερες ρίζες, βοηθώντας στη διατήρηση της υγιούς και περιποιημένης όψης της. Use the corresponding English translation in the ingredient slider; this supersedes its earlier premature-aging/barrier/moisture claims.

Latest benefit copy supersedes gentle skin care: “Πλούσια θρεπτική φροντίδα” — “Ένας πλούσιος συνδυασμός από beef tallow, μελισσοκέρι, μαστίχα Χίου και έλαιο jojoba που θρέφει την επιδερμίδα, αφήνοντάς την απαλή, ελαστική και με φυσική λάμψη.” Keep the plain ✓ and localized English equivalent.

Latest benefit ordering: “Πλούσια θρεπτική φροντίδα” / “Rich nourishing care” is second; preserve the relative order of the other four benefits.

Latest description for the second benefit, “Πλούσια θρεπτική φροντίδα”: Ένας πλούσιος συνδυασμός φυσικής προέλευσης συστατικών, με λιπαρά οξέα και φυσικούς κηρώδεις εστέρες, που χαρίζει στην επιδερμίδα αίσθηση θρέψης, αφήνοντάς την απαλή και με φυσική λάμψη. Use the corresponding English translation; this supersedes the earlier ingredient-list wording.


## Latest homepage reading section and carousel order

Place the new `.skin-care-story` reading section immediately after the manual Industry/testimonial player in both languages. Greek H2: “Λιγότερη ξηρότητα. Πιο λεία όψη.” English H2: “Less dryness. A smoother appearance.” Preserve the two owner-requested Greek paragraphs and their English translation as implemented in `public/index.html` and `public/en/index.html`, with their paragraph break.

This is an extension of the existing dark palette and Google Sans H2 hierarchy. Use two equal desktop columns with an 80px gap, reducing to 48px at tablet widths. At 760px and below, stack the heading above the copy using the existing `--heading-content-gap`. Body text is 18px, 17px on mobile, with 1.8 line-height; retain the 24px paragraph gap and existing section gutters/spacing.

Move the unchanged full-width product photo carousel after the ingredients content and immediately before FAQ/signup. The current sequence is benefits → Industry/testimonial player → new reading section → ingredients heading/film and slider → product photo carousel → FAQ/signup. This supersedes only the earlier instruction placing the photo carousel directly after the player. Preserve carousel imagery, controls, caption, motion/fallback behavior and signup handling; shared design tokens remain unchanged.

Verification for this extension: all 78 tests and the build passed. Geometry checks and Greek/English screenshots at 390px and 1440px are recorded in `/tmp/skin-care-review/{390,1440}-{el,en}.png`; final visual review is tracked separately.

Latest owner revision replaces both skin-care reading paragraphs with direct second-person copy and names PRIMAL CORE in the second paragraph. Preserve the exact current Greek wording in public/index.html, corresponding English translation, heading, paragraph break and placement.
