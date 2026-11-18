# Google SEO maintenance audit — 18 November 2026

Reviewed the three supplied Google documents against source, built output, anonymous production responses and browser behavior.

References:
- [Maintaining your website’s SEO](https://developers.google.com/search/docs/fundamentals/get-started)
- [Search Console reports at a glance](https://support.google.com/webmasters/answer/9133276?hl=en)
- [Impressions, position and clicks](https://support.google.com/webmasters/answer/7042828?hl=en)

## Existing coverage
HTTPS, self-canonicals, reciprocal language alternatives where translations exist, crawlable HTML text/navigation, robots.txt, sitemap, favicon, descriptive metadata and source-derived structured data were already present. The reviewed sitemap contains 22 indexable canonical pages. Unknown routes return HTTP 404. HTTP, HTML suffix and directory-slash aliases redirect to canonical destinations. No reviewed page is orphaned in the internal-link audit.

The mobile simulated Lighthouse baseline on production scored SEO 100/100, performance 89, LCP 2.9 seconds and CLS 0. These are laboratory observations, not Search Console field Core Web Vitals or a ranking guarantee.

## Fixed
- Internal home/blog links now target canonical routes directly rather than passing through directory-slash redirects.
- Both generated 404 documents use root-relative resources and navigation, so an unknown nested URL retains its styles, scripts, images and usable home links.
- Added intrinsic dimensions to ten story images across the two languages.
- Added 66 real image entries to the 22-page XML sitemap; image files were checked on disk.
- Excluded operational `/api/` and `/.netlify/functions/` endpoints in every explicitly allowed crawler group. Public pages and rendering resources remain crawlable. Robots exclusions are not access control.
- Deferred the offscreen ingredients film until it approaches the viewport, retaining autoplay and manual pause/resume. The baseline eagerly downloaded about 2.45 MB of mobile ingredients video; browser checks now show no ingredients-video request before encounter.
- Added responsive high-priority hero poster preloads. Hero timing, typography and layout remain unchanged.

## Validation
87 automated tests pass, production build succeeds, and visible body text matches the baseline across all 49 HTML pages. Desktop Greek and mobile English browser checks verify deferred media loading, correct source selection, autoplay and pause/resume. No signup was submitted and no email was sent during these checks.

## Remaining account-level work
1. Vercel → project Settings → Domains → `www.primalcore.gr`: change the existing redirect to `primalcore.gr` from temporary 307 to permanent 308. The current redirect is handled by the domain configuration before project routes; repository changes cannot reliably override it.
2. In Search Console, submit/check `https://primalcore.gr/sitemap.xml`, inspect `/` and `/en`, and review Google-selected canonical and rendered HTML. After the updated deployment, request recrawling of important changed pages once.
3. Review Page indexing, Core Web Vitals, HTTPS, Manual actions and Security issues in the verified property. Private report data was not accessed in this audit; public technical checks cannot establish their current status.
4. Track clicks, impressions, CTR and average position in Performance over time. Search Console supplies these without adding an analytics tracker. Canonical aggregation, report filters and data delay affect comparisons; average position is not a fixed ranking for every visitor.

## Deliberate limits
The prelaunch Product description has no invented offers, price, reviews or ratings. It therefore does not meet Product rich-result requirements; adding fictional commercial data would be incorrect. FAQ markup does not guarantee a FAQ search display. The embedded films support product pages rather than dedicated watch pages: a video-indexing report may treat them accordingly. No unrequested watch pages, AMP, News, shopping feeds, tracking scripts or speculative AI files were added. Search inclusion, favicon refresh, ranking and AI citations remain search-engine decisions and cannot be guaranteed on a deadline.
