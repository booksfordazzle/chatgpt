# Confirmation layout and public article discovery

- Start: origin/codex/bilingual-site at 3da8ea2 (v1.2 work retained).
- Desktop result-delivery area: compact title, form / existing tin photograph / research invitation grid; clear, wrapped partial-success status. Mobile remains stacked. No transport or recipient logic changed.
- All 16 previously noindexed bilingual blog article files now allow indexing and are included in the generated sitemap (38 total routes). No blog copy, claimed results or sources were rewritten. Indexing eligibility does not guarantee indexing or rankings. Ingredients, quiz, thank-you and error pages retain their existing indexing policy.
- Generated Organization nodes gain confirmed `legalName: MMTX E.E` and the existing brand Instagram/Facebook URLs as `sameAs`. No personal designer account was added.
- Bilingual pages with an `el` language alternative gain `x-default` pointing to that same canonical Greek URL, including reciprocal English pages.
- History/Philosophy retain their first H1; subsequent H1s become semantic H2 chapter titles. Selector branches preserve CSS specificity and original appearance; cache versions updated. Greek “μπώ” becomes “μπω”.

## Validation

135 unit tests and production build pass. Browser regressions cover optional waitlist consent, existing subscriber, successful signup and failed signup at 390px/1440px. Confirmation layout covers successful email with failed signup, disabled duplicate submission, loaded desktop photo and no horizontal overflow. Baseline/current geometry comparison on four bilingual History/Philosophy routes at both widths confirms identical font sizes, line heights, heading widths and heights. Screenshot review: /tmp/primal-confirmation-{390,1440}.png.

All browser API responses were fixtures: no real email or subscriber row was created. The screenshot's failed Early Access signup is a separate integration failure; source inspection found a valid request shape, but its live failure cause was not established or fixed here. SMTP, Apps Script endpoints, secrets and Sheets are unchanged.

## Deployment

Merge and production deployment required. Check published sitemap, article robots tags and canonical/hreflang metadata; request recrawl through Search Console after deployment. Actual Google indexing is outside deployment control. Verify desktop result-delivery layout and one controlled optional waitlist signup separately.
