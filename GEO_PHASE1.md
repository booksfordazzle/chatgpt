# PRIMAL CORE — GEO phase 1

Only the technical first phase is implemented. Phase 2 requires explicit owner approval. No visible content, styles, layout, navigation controls or form behavior changes are included.

## Source changes

- `public/robots.txt`: explicit Allow rules for the eight requested AI crawlers, plus Claude-SearchBot and Claude-User. The previous generated robots file allowed all crawling and contained no private/admin disallow rules to migrate. Sitemap points to the XML document, not the bare domain. Future private-path rules must be repeated in specific crawler groups as appropriate; robots is not access control.
- `scripts/geo.mjs`: source-derived Markdown and structured-data generation, real canonical navigation, actual local product/logo images, localized homepage Product/FAQPage and global Organization/Brand/WebSite/WebPage entities. Existing JSON-LD is parsed and consolidated rather than appended as duplicate entities.
- `scripts/build.mjs`: integrates those generators, preserves robots source, and makes only the requested public philosophy/history/contact/privacy routes indexable in both languages. The build still preserves noindex on confirmation, provisional ingredient and other unapproved pages. Sitemap expands from 14 to 22 canonical URLs.
- `tests/geo.test.mjs`: isolated build tests for crawler groups, sitemap/indexability, valid and unique JSON-LD, real image/navigation paths, all seven FAQ answers in each language, complete bilingual content extraction, and preservation of page bodies.
- `GEO_PHASE1.md`: this delivery and validation record.

## Published outputs

- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/llms-full.txt`
- Enhanced JSON-LD inside the generated HTML head. Generated outputs live under `dist/` and are rebuilt from source on every deployment; no manual duplication of homepage copy is required.

`llms-full.txt` reproduces all five benefits, five ingredient descriptions and seven FAQ questions/answers from each current homepage. Source HTML remains unchanged. The concise English overview retains Greek heritage, the bilingual routes, the presented 50ml format and development/waitlist status.

## Corrections to placeholders and factual limits

- History is `/about` and `/en/about`; no nonexistent `/history` links were introduced.
- Logo and product image URLs point to actual image files rather than the homepage URL.
- The robots sitemap directive is `Sitemap: https://primalcore.gr/sitemap.xml`.
- Product offers are omitted: the visible FAQ explicitly says orders/payments/pre-orders are unavailable. No fabricated price, Offer availability, rating or review is emitted. Product schema without an offer/rating/review may not qualify for Google's product rich results; syntactically valid JSON is not a promise of eligibility.
- No hidden free-from claims were added, because the current visible site does not establish the requested absence of synthetic fragrances, parabens, seed oils or silicones. Such claims require owner verification and consistent public content before markup.
- Ingredient and benefit descriptions in the full file are the brand's published statements, not independent clinical validation. The concise profile and Product data preserve the existing development and suitability qualifications rather than declaring proven repair, antibacterial efficacy or universally non-comedogenic behavior.
- `llms.txt` is an emerging voluntary convention. Neither it, crawler permission nor structured data guarantees crawling, ranking, AI citations/recommendations, a favicon update or FAQ rich results.
- No Phase 2 quick-spec UI, comparison table, new glossary hub or visible copy rewrite was built.

## Validation

- 83 Node tests passed; production build succeeded with 22 sitemap entries.
- All 49 built HTML bodies have identical SHA-256 hashes before and after this change. CSS and frontend scripts were not edited.
- Generated JSON-LD is parsed on every page; managed entity IDs are unique within each graph. Homepage FAQ answers match visible content exactly and image files exist.
- All Markdown local navigation URLs resolve to built files, and both languages are covered.
- Read-only production verification is performed after deployment. No subscriber records, SMTP settings, secrets or email delivery behavior are changed.

After Phase 1, request owner approval before proposing or building Phase 2. The requested comparison language and final/free-from formulation claims need factual review before any public content expansion.
