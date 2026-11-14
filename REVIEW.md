# Publishing review — PRIMAL CORE

## Assessment

The supplied design had a coherent cinematic identity and useful Greek educational content. Its implementation was an exported React artifact rather than a functioning launch site. The most serious issue was a form that displayed success without storing or transmitting the email. Long scroll-only films, invisible state-based pages, incomplete offer metadata and conflicting product claims also prevented a credible publication.

The revised site preserves the dark imagery and Greek voice while making the product, development status and primary action visible immediately. No website or Google deployment has been published from this workspace.

| Issue in the supplied export | Implemented fix |
| --- | --- |
| Fake signup with temporary in-memory records | Server-side Google Sheets receiver; success only after confirmed storage; retry/contact state on failure |
| No explicit consent checkbox | Required unchecked consent; timestamp and policy version saved by receiver |
| Six viewport opening and five viewport ingredient sequence | Shorter desktop film with skip/pause controls; mobile opt-in playback; ingredients always readable |
| About, privacy and articles hidden behind client-side state | Static URLs, browser history, native links, editable HTML and independent page metadata |
| Multiple h1 elements and tiny mobile navigation | One h1 per page; accessible mobile menu, keyboard focus, skip link, native FAQs |
| Guaranteed wrinkle/elasticity results and before/after image | Development goals, restrained ingredient roles, no before/after image |
| Existing claim of CPNP notification/testing completed | Removed pending verified product documentation |
| Some articles displayed future publication dates | Removed unverified publication dates; no invented publication history |
| Generic privacy text described nonexistent accounts, checkout and security practices | Waitlist-specific disclosure, Google storage, supplied business identity and contact address |
| Product/preorder structured data without a valid offer | Removed incomplete offer schema; no sales or preorders implied |
| 15.56 MB HTML with embedded media and runtime | Approximately 14 KB home HTML; separately cacheable WebP media and self-hosted fonts; roughly 5.6 MB total media including two films |
| Remote font dependency, embedding runtime, synthetic click interception | Self-hosted fonts, native controls, small standalone browser script |
| Missing publication configuration | Netlify function routing and security headers, domain-aware canonicals, sitemap, robots, social metadata and custom 404 |

The supplied address is shown as **MMTX E.E, Φιλικής Εταιρείας 12**. No missing city, postcode or country has been invented. Educational article substance is retained except the introductory article's unsupported dietary/health claims, which were replaced with cautious cosmetic information. An early note clarifies that the 30-day article is illustrative rather than a clinical study. Developmental packaging imagery is identified as such.

## Verification completed

- `npm run build`: passed; canonical origin `https://primalcore.gr`; 10 indexable sitemap URLs.
- `npm test`: **9 passed**, 0 failed/skipped. Six function tests cover confirmed storage, invalid inputs, missing configuration, endpoint/origin restrictions, upstream failures and native form redirects. Three Apps Script tests use a simulated Sheets API for consent, duplicates, auth and formula escaping. They do not prove live Google behavior.
- Chromium: 11 pages at **1440, 768, 390 and 320px**; no horizontal overflow, broken images or duplicate h1 elements.
- Keyboard/mobile menu, Escape, native FAQ disclosure and fragment navigation: passed.
- Unconfigured submission: honest retry/contact error, entered email retained, button available to retry.
- Mocked successful submission: success shown only after `{ok: true}`, input reset.
- JavaScript-disabled navigation and form failure redirect: passed.
- Reduced-motion setting: visible poster, no hero playback/download requested by the script.
- No browser JavaScript exceptions observed.
- Axe WCAG A/AA checks: 5 representative pages at desktop and mobile, **0 automated violations**. Automated checks are not a complete accessibility certification.
- Built-page local link/asset checks, heading count, canonical metadata and sitemap XML parsing: passed.
- Media decoding and optimized-film duration verified. Hero film reduced from about 6.0 MB to 2.9 MB, with audio removed.

## Remaining launch steps

1. Deploy `google-apps-script/Code.gs` from the supplied spreadsheet owner's account and configure the hosting URL/secret. Neither server-side value is present in this workspace. A live row write, duplicate check and permission test remain **unrun**.
2. Deploy the repository to Netlify (or adapt the receiver to another server-capable host), connect primalcore.gr and confirm HTTPS/DNS and deployed security headers.
3. Complete the business address and confirm the privacy notice against the real retention/deletion process and processor arrangements. Confirm `hello@primalcore.gr` is monitored.
4. Verify media rights, final packaging/ingredient consistency and any quantitative scientific statements in the educational articles. No claim is made that this work validates the finished cosmetic's safety, efficacy or regulatory status.

The implementation and deployment configuration are prepared. Full live launch readiness depends on the explicit items above; the site has not been published and live Google Sheets storage has not been claimed as working.

## Download preview correction

The first ZIP used origin-root asset paths, which failed when its HTML was opened directly from disk. All page links, images, posters, scripts, styles and font URLs now resolve relative to their files. A top-level `index.html` opens `public/index.html`, and the README explains extracting the entire folder before opening it. File previews explicitly state that signup cannot save emails until the server is published.

Validation: build passed; 11 automated tests passed including two new archive-preview regression checks; all 10 content pages rendered correctly at both the HTTP site root and a nested `/public/` location. Filesystem checks resolved all relative links/assets. Direct `file://` browser navigation is blocked by this cloud browser's administrator policy, so an actual desktop double-click could not be reproduced here.


## Owner-requested brand and copy update

Replaced the horn logo home link with the supplied PRIMAL CORE wordmark. Applied self-hosted Google Sans across the interface, including Greek, Latin, variable weights and italic text, using the official Google Fonts source and bundled SIL license. Replaced all three benefit descriptions and all five ingredient descriptions with the owner's supplied wording. These latest descriptions supersede the earlier restrained benefit copy in this review's original assessment; they are supplied claims, not independently verified results.

Kept the ingredient presentation as an optional, controlled video alongside always-visible descriptions, avoiding forced scrolling for reading. Build and all 11 tests passed; Chromium checks confirmed Google Sans normal/italic loading, new logo and copy, and no horizontal overflow at 1440, 390 and 320px.

## Centered hero and copy assessment

Centered the whole hero message and actions horizontally and vertically within the visible film area. Removed the pause-motion and skip-film controls. Desktop hero seeking remains driven by scrolling; mobile and reduced-motion settings use the static poster. Ingredient video playback controls are unchanged. The local development server now handles HTTP byte ranges, so media seeking also works during served previews.

Chromium verified centering at 1440, 768, 390 and 320px, absence of the removed controls, working desktop film seeking, reduced-motion fallback, no horizontal overflow and no script exceptions. Normal/suffix/invalid byte ranges were checked. The English marketing draft was evaluated and a Greek alternative saved in COPY-PROPOSAL.md for review, without replacing the existing hero wording.

## Editorial refinement and FAQ update

Integrated the approved Greek marketing direction below the hero. The hero retains its exact original sentence as naturally balanced two-line text, with no manual break and no supporting paragraph. Removed the blog subtitle and repeated read-article labels; article cards remain native links, with 16px image corners. Menu type increased from 14px to 16.1px (+15%). English ingredient labels moved into description parentheses, preserving every other word of the owner's supplied descriptions. Benefit titles now use sentence case at the same shared size. Removed the waitlist withdrawal helper text and initial local-preview banner; actual failed submissions still display an honest error. Added the four supplied product FAQ answers, replacing the generic usage entry.

Validation: build and all 11 automated tests passed. Browser checks at 1440, 1024, 768, 390 and 320px confirmed exactly two hero-title lines, no manual breaks, removed text, increased menu size, eight working FAQ disclosures, clickable rounded article thumbnails and no horizontal overflow or JavaScript exceptions. Ingredient description comparison confirmed the only text changes were the requested parenthetical English names.

## Full-width ingredient film and Chios mastic oil

Applied the requested fixed hero line break and removed both hero links. Updated section headings and the ancestral-ingredients article title to sentence case. Established a 16px image-radius token across the site, including the application photo. Fixed the header waitlist CTA's hover/focus/active colors so dark text remains readable on its light surface.

The ingredient film now spans the viewport; five ingredient columns sit below it on wide screens, with three, two or one column as space decreases. Replaced the former ingredient with Chios mastic oil in all live text, metadata, image descriptions and relevant handoff documents. Its description identifies it as an ingredient without borrowing the prior oil's efficacy claims. The owner explicitly chose to retain the existing videos temporarily and supply replacement media later; those videos and their posters still contain the old ingredient imagery and packaging. Their replacement remains an outstanding media task.

Validation: build and 11 automated tests passed. Browser checks at 1440, 1024, 768, 390 and 320px confirmed the precise hero break, no hero links, full-width ingredient video, responsive columns, dark CTA hover text, rounded images, updated titles and no overflow or JavaScript exceptions. All live HTML was searched to confirm no outdated ingredient text remains.

## Launch message and centered play button

Reduced hero shading from 58% to 48% opacity. Replaced the introduction with the owner's latest Greek copy and made its chemistry-degree headline the page's sole H1; the earlier hero question is now an H2. Centered “5 συστατικά μόνο. Τίποτε άλλο”, removed the ingredient-development note, and added the supplied early-bird 15% launch offer to the email section.

Added a centered, keyboard-accessible ingredient play button that hides during playback and returns on pause/end, with native controls retained for no-JavaScript use. A direct MP4 source ensures failed loads reject playback correctly and leave a retryable error state.

Validation: four viewport widths passed with no overflow or browser exceptions; mouse and keyboard playback, pause, media-load failure, and no-JavaScript controls passed. Build and automated tests passed.

The requested replacement product photograph is visible inline in chat but was not exposed as a downloadable file or workspace path. Its exact bytes could not be retrieved through the available tools. The existing product image remains pending delivery of the supplied photo as a file. It has not been replaced with a generated approximation.

## Introduction readability refinement

Split the introductory copy into shorter paragraphs, promoted the “30 ingredients” message into a clear scan anchor, highlighted the two named ingredients and three product roles, converted usage occasions to a semantic bullet list, and separated the three “Χωρίς…” statements. Kept the owner's substantive wording and the existing single H1. Adjusted reading size, line height, contrast hierarchy and grouping without introducing card containers.

Build and 11 tests passed. Chromium checks at 1440, 768, 390 and 320px confirmed the scan anchors, lists and no horizontal overflow or script exceptions. The supplied replacement photo is still inline-only: attachment discovery found only the original HTML export, so the product-image replacement remains unperformed pending a downloadable image file or ZIP.

## Product photograph replacement completed

Received `primal core-mastic.zip` and copied its supplied 2096×1184 JPEG byte-for-byte to `public/assets/product-mastic.jpg`. Replaced every use of the old photograph in the homepage, about page, blog card, ancestral-ingredients article and generated social metadata; removed the old image asset. Updated alt text and intrinsic dimensions. The homepage now preserves the photograph's complete aspect ratio with the established rounded corners.

This resolves the prior product-photo attachment blocker. Build and all 11 automated tests passed. Desktop/mobile browser checks verified the new image on all four affected surfaces, full-image homepage presentation, rounded corners, no obsolete photo references and no horizontal overflow. Previously deferred video/other packaging updates remain separate.

## Looping ingredients and newspaper-style introduction

Enabled native looping on the ingredient video while preserving explicit user-initiated playback, center play control and pause behavior. Centered the introduction's single H1 across the full section, with no manual break, and arranged its reading groups into two desktop columns that stack in document order on mobile. Applied the supplied Chios mastic description verbatim.

Removed the period from the availability heading. Moved the revised early-bird message directly above the email label/input and associated it with the input's accessible description. Added matching, transparent white SVG ingredient symbols (horns, resin drop, hexagon, oil drop and capsule) above the five names; decorative icons are hidden from assistive technology.

Validation: build and 11 tests passed. Five viewport widths verified the centered headline, desktop/mobile columns, icons, text, offer placement and absence of overflow or JavaScript exceptions. Browser playback crossed the video's endpoint and restarted without pausing, and manual pause restored the play button.

## Automatic ingredient film and expandable benefits

Replaced the benefit statements with the supplied revised headings/explanations using native details/summary disclosures, monochrome circular checks and plus/minus indicators. Replaced the mastic symbol with a transparent white faceted-resin shape matching the reference. Centered ingredient icons and text, removed their top rules, and increased the video-to-ingredients gap to 112px on desktop and 76px on mobile.

The ingredient film now uses muted autoplay, looping and inline playback, with a compact bottom-right pause/resume control. Playback is prepared near the viewport and retried on actual entry for browsers that suspend off-screen media. Manual pause persists across scroll-away/return; background tabs stop playback. Reduced-motion settings require explicit play. Native controls remain the no-JavaScript fallback. The email label is visually hidden while its accessible name is retained.

Validation: build and 11 automated tests passed. Four viewport widths verified disclosures, keyboard interaction, icon/description alignment, spacing, label handling, looping, pause/resume and no overflow or JavaScript exceptions. Additional fresh-page desktop/mobile checks confirmed playback started with `navigator.userActivation.hasBeenActive === false`, without any prior click. Reduced-motion manual playback and persistent manual pause also passed.
