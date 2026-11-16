# V.1 visual restoration — 16 November 2026

Latest owner direction supersedes the static audit redesign: restore V.1 appearance and keep technical crawlability, security and SEO improvements only.

## Restored

- Homepage body is byte-for-byte identical to tag `V.1` (`e768db9`): scroll-controlled film, sequential title/signup reveals, original sections/copy, gallery, testimonials, forms and CTAs.
- Shared CSS matches V.1 except `touch-action:auto` for accessible zoom and 16px mobile email inputs to prevent focus zoom from cropping the signup button. Typography, colors, spacing, sizing and responsive composition are unchanged.
- Existing secondary-page bodies are restored from V.1. Contact hidden `_next` inputs are generated from the current origin rather than containing a hardcoded preview host. The Greek custom 404 and the previously requested unlinked/noindexed Terms draft remain.
- Existing hero, ingredient, carousel and confirmation-video code and assets are retained. Only the audit-specific static-poster helper was removed from shared JS. No video replacement or new layout was introduced.

## Technical changes retained

- One intended origin (`https://primalcore.gr`) generates clean canonicals, social URLs/images, absolute hreflang metadata, Organization/WebSite JSON-LD, sitemap and robots.
- Search-friendly metadata is in the head; visible V.1 headings/copy/layout are unchanged. Homepage text and navigation are server-rendered HTML, not dependent on video transcription or JavaScript to exist.
- Valid root-only sitemap; robots permits crawling. Unreviewed secondary drafts remain page-level noindexed and excluded from sitemap.
- Preview-only noindex response headers cover both `/` and other paths and cannot match primalcore.gr. The preview can be crawled to read noindex; it is intentionally excluded from search indexing. Production is not claimed live.
- Clean URLs, relative navigation rebasing, actual Greek 404 response and removal of hardcoded preview contact redirects remain. Vercel currently returns 308 for /index.html before its configured 301 rule; no exact 301 claim is made.
- Existing CSP (no unsafe-inline/eval), HTTPS/HSTS, frame denial, MIME protection, referrer/permissions/cross-origin policies remain. Existing server validation, honeypots, origin checks, request-size limits and throttling remain. Backend, Google Sheets fields, attribution and consent/version logic were not modified.
- Early external bootstrap avoids a menu layout flash without weakening CSP; media-matched poster preloads retain the same imagery. Zoom restrictions remain removed.

## Verification

- `npm test`: 48 passed, 0 failed, including security/abuse cases, source V.1 body/CSS parity, clean navigation, noindex host isolation and generated metadata.
- `npm run build`: passed. XML sitemap parsed with ElementTree; exactly https://primalcore.gr/.
- 37 generated HTML documents: title/description, canonical and zoomable viewport checked; 36 secondary drafts noindexed; all internal anchor destinations resolve; no preview host in served HTML.
- `node audit/verify-jsonld.mjs`: all structured JSON parses; Organization/WebSite only.
- Browser tests at 1440x900, 390x844 and 320x568: original fade sequence restored; hero title and signup heading share the V.1 Y position; forms fit the viewport; no horizontal overflow/JS errors. Both forms require unchecked consent and pass mocked success/error flows; errors retain entered email. Reduced-motion fallback remains usable. No actual signup/email/Sheets write was performed.
- Desktop/mobile screenshots inspected. Previous audit Lighthouse numbers describe the superseded static design and are **not scores for this restored version**.

Production-domain setup, Search Console, final INCI/claim substantiation, official contact/legal review, double opt-in and functional unsubscribe remain separate owner/backend prerequisites, as previously documented. This restoration does not certify product claims, legal compliance, or immunity to all attacks. No DNS, production-domain setting, backend or live subscriber record was changed.
