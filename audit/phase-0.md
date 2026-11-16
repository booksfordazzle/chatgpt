# Phase 0 — read-only inventory

Preview only: https://chatgpt-weld-mu-98.vercel.app/index.html. Target primalcore.gr is not confirmed live.

DNS A for apex and www: 195.110.124.140; HTTPS target returned 503 here; no evidence ties that host to this Vercel project.

The preview returned no X-Robots-Tag before fixes. Its sitemap listed 28 pages, including unfinished Greek/English pages. Canonical/social target was already primalcore.gr but generation lacked a reliable noindex check.

| Route | Nav/footer (including language switches) | HTTP chain | Type | Assessment |
|---|---|---|---|---|
| / | False | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /404.html | True | HTTP/2 200   | text/html; charset=utf-8 | custom 404 template; direct document returned 200 |
| /about.html | True | HTTP/2 200   | text/html; charset=utf-8 | thin/unfinished |
| /blog/ancestral-ingredients.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /blog/chios-mastic-skincare.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /blog/hippocrates-tallow-mastic.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /blog/index.html | True | HTTP/2 200   | text/html; charset=utf-8 | thin/unfinished |
| /blog/tallow-safety.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /blog/tallow-science.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /blog/tallow-skincare.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /blog/thirty-days.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /blog/what-is-tallow.html | True | HTTP/2 200   | text/html; charset=utf-8 | thin/unfinished |
| /contact-sent.html | True | HTTP/2 200   | text/html; charset=utf-8 | utility/thin |
| /contact.html | True | HTTP/2 200   | text/html; charset=utf-8 | utility/thin |
| /en/404.html | True | HTTP/2 200   | text/html; charset=utf-8 | custom 404 template; direct document returned 200 |
| /en/about.html | True | HTTP/2 200   | text/html; charset=utf-8 | thin/unfinished |
| /en/blog/ancestral-ingredients.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /en/blog/chios-mastic-skincare.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /en/blog/hippocrates-tallow-mastic.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /en/blog/index.html | True | HTTP/2 200   | text/html; charset=utf-8 | thin/unfinished |
| /en/blog/tallow-safety.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /en/blog/tallow-science.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /en/blog/tallow-skincare.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /en/blog/thirty-days.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /en/blog/what-is-tallow.html | True | HTTP/2 200   | text/html; charset=utf-8 | thin/unfinished |
| /en/contact-sent.html | True | HTTP/2 200   | text/html; charset=utf-8 | utility/thin |
| /en/contact.html | True | HTTP/2 200   | text/html; charset=utf-8 | utility/thin |
| /en/index.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /en/philosophy.html | True | HTTP/2 200   | text/html; charset=utf-8 | thin/unfinished |
| /en/privacy.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /en/signup-unavailable.html | True | HTTP/2 200   | text/html; charset=utf-8 | utility/thin |
| /en/thanks.html | True | HTTP/2 200   | text/html; charset=utf-8 | utility/thin |
| /index.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /philosophy.html | True | HTTP/2 200   | text/html; charset=utf-8 | thin/unfinished |
| /privacy.html | True | HTTP/2 200   | text/html; charset=utf-8 | substantive existing copy; claims/SEO unfinished |
| /signup-unavailable.html | True | HTTP/2 200   | text/html; charset=utf-8 | utility/thin |
| /thanks.html | True | HTTP/2 200   | text/html; charset=utf-8 | utility/thin |

642 candidate claim records; all 2,196 copy/metadata records retained in the inventories. These are public source content, not subscriber data. Before headers, robots, sitemap and origin-hit evidence are saved alongside this file.

Vercel reference checked: https://vercel.com/docs/project-configuration/vercel-json (headers `has` supports type `host`; redirects support statusCode 301). Schema: https://openapi.vercel.sh/vercel.json.
