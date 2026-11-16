> Historical audit of the superseded static redesign. The latest owner instruction restores V.1 visually. See V1_RESTORATION.md for the currently shipped scope and verification. Prior claim/layout/Lighthouse assertions below do not describe the restored version.

# PRIMAL CORE — preview audit, 16 November 2026

Scope: https://chatgpt-weld-mu-98.vercel.app/ only. Intended production target: https://primalcore.gr. **Production deployment is not verified and is not claimed live.** Baseline `e768db9` / tag `V.1` remains untouched.

The four requested fix blocks were committed separately: A `3f7ca9f`, B `ab95cdf`, C `54ba6d1`, D `ad0e056`, and uploaded to `codex/bilingual-site`. Live verification required a further routing correction: the explicit `/` header rule is necessary on Vercel. Corrections and verification records follow the four blocks; no unrelated pages or backend work was started.

## 1. Files changed

- `AUDIT_REPORT.md`
- `DESIGN.md`
- `audit/backend-recommendation.md`
- `audit/browser-verification.log`
- `audit/claim-changes.md`
- `audit/claim-inventory.md`
- `audit/copy-inventory.tsv`
- `audit/host-inventory.json`
- `audit/ingredient-contradictions.md`
- `audit/lighthouse-mobile.report.html`
- `audit/lighthouse-mobile.report.json`
- `audit/live-browser-verification.log`
- `audit/live-verification.log`
- `audit/local-verification.log`
- `audit/node-tests.log`
- `audit/noindex-pages.json`
- `audit/pages-after.json`
- `audit/phase-0.md`
- `audit/preview-headers-before.txt`
- `audit/production-domain-after.txt`
- `audit/production-domain-before.txt`
- `audit/robots.txt.before`
- `audit/routes-before.json`
- `audit/sitemap.xml.before`
- `audit/stem-verification.md`
- `audit/verify-jsonld.mjs`
- `audit/verify-static.py`
- `public/404.html`
- `public/about.html`
- `public/assets/audit-home-wordmark.webp`
- `public/assets/audit-product-gallery-1-1.webp`
- `public/assets/audit-product-gallery-2-1.webp`
- `public/assets/audit-product-mobile-jar.webp`
- `public/assets/audit-product-mobile-lid.webp`
- `public/assets/audit-product-mobile-stack.webp`
- `public/blog/ancestral-ingredients.html`
- `public/blog/chios-mastic-skincare.html`
- `public/blog/hippocrates-tallow-mastic.html`
- `public/blog/index.html`
- `public/blog/tallow-safety.html`
- `public/blog/tallow-science.html`
- `public/blog/tallow-skincare.html`
- `public/blog/thirty-days.html`
- `public/blog/what-is-tallow.html`
- `public/bootstrap.js`
- `public/contact-sent.html`
- `public/contact.html`
- `public/en/404.html`
- `public/en/about.html`
- `public/en/blog/ancestral-ingredients.html`
- `public/en/blog/chios-mastic-skincare.html`
- `public/en/blog/hippocrates-tallow-mastic.html`
- `public/en/blog/index.html`
- `public/en/blog/tallow-safety.html`
- `public/en/blog/tallow-science.html`
- `public/en/blog/tallow-skincare.html`
- `public/en/blog/thirty-days.html`
- `public/en/blog/what-is-tallow.html`
- `public/en/contact-sent.html`
- `public/en/contact.html`
- `public/en/index.html`
- `public/en/philosophy.html`
- `public/en/privacy.html`
- `public/en/signup-unavailable.html`
- `public/en/thanks.html`
- `public/index.html`
- `public/philosophy.html`
- `public/privacy.html`
- `public/signup-unavailable.html`
- `public/site.js`
- `public/styles.css`
- `public/terms.html`
- `public/thanks.html`
- `scripts/build.mjs`
- `site.config.mjs`
- `tests/languages.test.mjs`
- `tests/preview-seo.test.mjs`
- `tests/security.test.mjs`
- `vercel.json`

All existing English pages received technical metadata/viewport/heading changes and explicit unsupported-claim removals only; no new English prose was authored. They remain noindexed drafts. The only new HTML page is the authorized unlinked Greek Terms draft. Original image/video assets, including `testimonial.mp4`, remain; the testimonial section was removed from the homepage.

## 2. Every changed claim: before and after

See the complete [before/after table with source file and line](audit/claim-changes.md). It records changes by block, including repeated metadata/alt occurrences, removed testimonial/discount, ingredient limitations and new safety/consent wording. Source line references are the input to the indicated block; existing HTML is mostly serialized on line 3.

[Phase 0](audit/phase-0.md) records the pre-change route/header/config inventory. [Claim inventory](audit/claim-inventory.md) contains 642 candidate benefit records; [full copy inventory](audit/copy-inventory.tsv) contains 2,196 copy/metadata records. Historical unsafe before-copy remains in these evidence files, not served product copy. [Ingredient contradictions](audit/ingredient-contradictions.md) identifies remaining unreviewed English fixed-count/percentage statements and distinguishes historical olive-oil references from the provisional jojoba formula.

## 3. Verification commands and results

- `npm test`: **48 passed, 0 failed**. [Node log](audit/node-tests.log).
- `npm run build`: passed; one sitemap URL, `https://primalcore.gr/`, with no invented lastmod.
- `PYTHONPATH=/workspace/work/audit-deps python audit/verify-static.py`: XML parsed with ElementTree (xmllint equivalent); 37 HTML pages have one H1, lang/title/description/canonical/zoomable viewport; all built internal anchor routes resolve; Terms has no incoming link. [Per-page metadata](audit/pages-after.json); [36 excluded pages](audit/noindex-pages.json).
- `node audit/verify-jsonld.mjs`: every JSON-LD block JSON.parse succeeds; one root graph with Organization (name/url/logo only) and WebSite. No Product, Offer, Review, rating or FAQPage markup.
- Required case-insensitive stem scan of all HTML/JS/JSON, including built output and Lighthouse artifacts: **four matches**, all the explicit negation “Δεν τεκμηριώνεται αντιοξειδωτική δράση…” (two source statements and their built copies). [Every match and context](audit/stem-verification.md). No positive forbidden claim remains in the scanned code/output.
- Playwright at 320/390/1440px: no overflow or JS error, no initial MP4/third-party request, no cookie; six FAQ H3s, one evidence box, native keyboard menu/FAQ. Both existing forms require unchecked consent, preserve hidden honeypots, retain Source/attribution, keep entered email after a mocked error and reach confirmation after a mocked success. [Browser log](audit/browser-verification.log). **No actual signup, Sheets write or email was sent.**
- Live preview browser: status 200, preview noindex header, correct H1/canonical, two forms, zero initial movies/errors/overflow. [Live browser log](audit/live-browser-verification.log). The browser used ignoreHTTPSErrors only for this environment's proxy certificate handling; site TLS configuration was not weakened.
- `curl -sIL` on `/`, `/index.html`, sitemap, robots, made-up route, `/contact`, `/en` and a read-only `/api/waitlist` HEAD: [complete actual headers](audit/live-verification.log). Root/sitemap/robots are 200 with preview noindex; invented route is real **404**. API HEAD is 405, as expected without submission.
- **Routing exception:** `/index.html` and `/index` actually return **308 → /**. Although vercel.json declares 301, Vercel's cleanUrls normalization runs first. The exact requested 301 is **not achieved**; it must not be reported as verified. No backend/middleware workaround was added under the backend-change restriction.
- Official Vercel schema accepted the config using jsonschema Draft7Validator. Both noindex rules (`/:path*` and explicit `/`) have the same host condition `.*\.vercel\.app`. Tests anchor-match both Vercel examples and reject `primalcore.gr`, `www.primalcore.gr`, and a lookalike. No unconditional noindex response rule exists. The 36 page-level draft noindex tags intentionally ship to production until those pages are reviewed.
- `robots.txt`: Allow `/`, target sitemap, no Disallow `/`. Live XML sitemap contains only the Greek root. Preview noindex is a response header, not a crawler block. Canonicals/social/JSON-LD deliberately target the **not-yet-verified production origin on a noindexed preview**. No preview host appears in built served HTML metadata. Navigation anchors remain relative; hreflang metadata uses absolute canonical target URLs.
- Lighthouse 13.6.0 mobile, **local built output**: Performance **94**, Accessibility **100**, Best Practices **100**, SEO **100**; CLS 0.0131, LCP 3.1s. [HTML report](audit/lighthouse-mobile.report.html), [JSON report](audit/lighthouse-mobile.report.json). Command: `CHROME_PATH=/workspace/work/browsers/chromium-1234/chrome-linux64/chrome npm_config_cache=/workspace/work/npm-cache npx --yes lighthouse http://127.0.0.1:8083/ --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo --output=json --output=html --output-path=audit/lighthouse-mobile`. Local host does not simulate deliberate preview noindex, Vercel compression or production network. Remaining CSS/JS delivery improvements are advisory; no score guarantee.
- `git diff --name-only e768db9 -- api netlify/functions google-apps-script`: empty. Existing consent/version/backend logic was not changed. The real backend is **Google Apps Script + Sheets**, not Supabase. [Double opt-in requirements](audit/backend-recommendation.md) are recommendations only. No GA4/Meta pixel is installed; no tracker or cookie banner was added. Existing session-only first-party attribution remains and still needs owner/legal review for URLs that may contain personal data.

## 4. Not verified / needs production deployment

`primalcore.gr` and `www.primalcore.gr` resolve to **195.110.124.140** in this environment. HTTPS apex returned **503**; this does not establish that the domain points to this Vercel project. [Actual response](audit/production-domain-after.txt). DNS ownership, Vercel dashboard domain state, www/preview redirects, real-domain TLS, real-domain noindex absence, indexing and Search Console cannot be certified from the preview. No DNS or domain setting was changed.

Email frequency, working outbound unsubscribe, double opt-in, lawful processing details, final formulation/INCI/percentages, product suitability/efficacy and sensory wording are not verified. The retained emotional subtitle is owner-requested, with an evidence TODO; it is not clinical substantiation. No testimonial source/permission was supplied. No live end-to-end signup/mail test was performed in this backend-read-only audit.

## 5. Owner TODOs

1. In Vercel Project → Settings → Domains, add `primalcore.gr`, follow **the exact DNS records shown by the dashboard**, verify ownership and certificate, attach the intended deployment, then set it as the primary domain. Do not replace DNS with guessed IPs. Configure `www.primalcore.gr` to redirect to the apex. After production is working, configure redirects for public Vercel aliases to the primary domain; coordinate that switch with ending this independently testable preview. Keep preview protection while it remains a preview. Resolve whether exact index 301 justifies a separately approved routing approach; current observed result is 308.
2. After deployment run the checks below: apex root must be 200, canonical must be `https://primalcore.gr/`, root and assets must have **no X-Robots-Tag noindex**, robots must Allow `/`, sitemap must contain only reviewed canonical 200 pages, unknown route must return real 404, HTTP/www aliases must redirect to HTTPS apex. Secondary unfinished pages should retain their page-level noindex.
3. Verify the domain property in Google Search Console using its supplied DNS TXT record, submit `https://primalcore.gr/sitemap.xml`, inspect the root URL, and request indexing only after production checks pass.
4. Supply lab-approved INCI/percentages/ingredient roles and planned 50 ml size confirmation. Reconcile English fixed-five/percentage copy before indexing English. Supply evidence for finish, absorption, scent and retained emotional sensory wording; approve safe final cosmetic claims.
5. Confirm official public contact, controller/company details, postal address, privacy/legal basis/retention and jurisdiction with legal counsel. Review the unlinked noindexed `terms` draft and privacy text before publishing legal promises.
6. Confirm launch-email frequency and implement/test unsubscribe before any mailing. Approve a separate backend scope for double opt-in if desired; use the exact requirements in backend-recommendation.md. No Supabase migration has occurred.
7. Supply testimonial source, authenticity, permission and claim evidence before any reintroduction. File remains in assets, section removed.

Post-deployment commands (run only after the target domain is attached):

```sh
curl -sIL https://primalcore.gr/
curl -sIL https://primalcore.gr/index.html
curl -sIL https://primalcore.gr/robots.txt
curl -sIL https://primalcore.gr/sitemap.xml
curl -sIL https://primalcore.gr/audit-not-a-real-page
curl -sIL https://primalcore.gr/assets/audit-product-gallery-1-1.webp
curl -sIL http://primalcore.gr/
curl -sIL https://www.primalcore.gr/
curl -s https://primalcore.gr/robots.txt
curl -s https://primalcore.gr/sitemap.xml
curl -s https://primalcore.gr/ | rg 'canonical|og:url|application/ld\+json'
```

Audit stops here. No pillar pages, additional articles, shop/product pages, English expansion or Merchant Center work was started.
