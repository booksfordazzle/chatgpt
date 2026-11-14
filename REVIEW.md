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
